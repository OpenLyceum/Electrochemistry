/**
 * ElectrochemicalCell.ts
 *
 * A galvanic cell of two half-cells, shared by the Galvanic Cell and Nernst screens. The left and
 * right beakers are fixed places on screen; which one is the anode follows from the sign of the
 * cell potential, so the cell works whichever way round the student builds it.
 *
 * The voltmeter's black lead is on the left electrode and its red lead on the right, so it reads
 * E_right − E_left: positive when the right electrode is the cathode. Without the salt bridge the
 * circuit is open and it reads zero.
 *
 * When the circuit is closed through the light bulb, current flows and the cell runs down:
 *
 *   I = |E| / (R + R_MT / [Ox]_cathode)
 *
 * R is the bulb, wires and solutions; R_MT / [Ox] is the resistance of bringing ions to the cathode,
 * so the current dies away as the cathode's ion is used up. Each substep moves charge I·dt: the
 * cathode's ion is reduced (its metal plates out) and the anode's metal dissolves into ions.
 * Substeps are limited so that neither ion amount changes by more than a few percent, which keeps
 * concentrations positive without a stiff solver, and so that a metal anode dissolves no more
 * metal than it has: the substep that uses it up ends exactly at zero mass.
 */

import { BooleanProperty, DerivedProperty, NumberProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import {
  CIRCUIT_RESISTANCE,
  CONCENTRATION_FLOOR,
  CURRENT_THRESHOLD,
  ELECTRODE_MASS,
  FARADAY,
  HALF_CELL_VOLUME,
  MASS_TRANSPORT_RESISTANCE,
  MAX_FRACTION_PER_SUBSTEP,
  MAX_SUBSTEPS,
  STANDARD_TEMPERATURE,
} from "../../ElectrochemistryConstants.js";
import { HALF_CELLS, type HalfCell, isGasElectrode } from "./HalfCells.js";
import { electrodePotential } from "./Nernst.js";

export type Side = "left" | "right";

export type ElectrochemicalCellOptions = {
  leftHalfCell?: HalfCell;
  rightHalfCell?: HalfCell;
  /** Concentration of both ions when the cell is (re)built (M). */
  initialConcentration?: number;
};

/** One beaker: its half-cell, ion concentration and electrode mass. */
export class HalfCellState {
  public readonly halfCellProperty: Property<HalfCell>;
  public readonly concentrationProperty: NumberProperty;
  /** Electrode mass (g); stays at ELECTRODE_MASS for the platinum hydrogen electrode. */
  public readonly massProperty: NumberProperty;
  private initialConcentration: number;

  public constructor(halfCell: HalfCell, initialConcentration: number) {
    this.initialConcentration = initialConcentration;
    this.halfCellProperty = new Property(halfCell);
    this.concentrationProperty = new NumberProperty(initialConcentration, { units: "mol/L" });
    this.massProperty = new NumberProperty(ELECTRODE_MASS, { units: "g" });
  }

  /** Ion amount in the beaker (mol). */
  public get moles(): number {
    return this.concentrationProperty.value * HALF_CELL_VOLUME;
  }

  /** Concentration a fresh beaker starts with; Reset All returns to it too. */
  public setInitialConcentration(concentration: number): void {
    this.initialConcentration = concentration;
  }

  /** Fresh solution and electrode, keeping the half-cell. */
  public refresh(): void {
    this.concentrationProperty.value = this.initialConcentration;
    this.massProperty.value = ELECTRODE_MASS;
  }

  /** Changes the ion amount by `deltaMoles` and the electrode mass by the metal it came from or went to. */
  public react(deltaIonMoles: number, deltaMetalMoles: number): void {
    const halfCell = this.halfCellProperty.value;
    this.concentrationProperty.value = Math.max(CONCENTRATION_FLOOR, (this.moles + deltaIonMoles) / HALF_CELL_VOLUME);
    if (halfCell.metalMolarMass !== null) {
      this.massProperty.value = Math.max(0, this.massProperty.value + deltaMetalMoles * halfCell.metalMolarMass);
    }
  }

  public reset(): void {
    this.halfCellProperty.reset();
    this.refresh();
  }
}

export class ElectrochemicalCell {
  public readonly left: HalfCellState;
  public readonly right: HalfCellState;
  public readonly temperatureProperty = new NumberProperty(STANDARD_TEMPERATURE, { units: "K" });
  public readonly saltBridgeProperty = new BooleanProperty(true);
  /** The light bulb is connected, so current can flow. */
  public readonly circuitClosedProperty = new BooleanProperty(false);

  /** Current (A); positive when electrons flow through the wire from left to right (left is the anode). */
  public readonly currentProperty = new NumberProperty(0, { units: "A" });

  /** Charge passed since the cell was built (C). */
  public readonly chargeProperty = new NumberProperty(0, { units: "C" });

  /** Simulated time the circuit has been closed (s). */
  public readonly elapsedTimeProperty = new NumberProperty(0, { units: "s" });

  /** E_right − E_left from the Nernst equation (V), whether or not the salt bridge is in. */
  public readonly potentialProperty: TReadOnlyProperty<number>;

  /** What the voltmeter shows: the potential, or 0 with the salt bridge out. */
  public readonly voltmeterReadingProperty: TReadOnlyProperty<number>;

  /** Which electrode is the anode, or null when the potential is zero. */
  public readonly anodeSideProperty: TReadOnlyProperty<Side | null>;

  /** An anode made of metal has dissolved away completely. */
  public readonly anodeGoneProperty: TReadOnlyProperty<boolean>;

  public constructor(options?: ElectrochemicalCellOptions) {
    const initialConcentration = options?.initialConcentration ?? 1;
    this.left = new HalfCellState(options?.leftHalfCell ?? HALF_CELLS.zn, initialConcentration);
    this.right = new HalfCellState(options?.rightHalfCell ?? HALF_CELLS.cu, initialConcentration);

    this.potentialProperty = new DerivedProperty(
      [
        this.left.halfCellProperty,
        this.left.concentrationProperty,
        this.right.halfCellProperty,
        this.right.concentrationProperty,
        this.temperatureProperty,
      ],
      (leftHalfCell, leftConcentration, rightHalfCell, rightConcentration, temperature) =>
        electrodePotential(rightHalfCell, rightConcentration, temperature) -
        electrodePotential(leftHalfCell, leftConcentration, temperature),
    );
    this.voltmeterReadingProperty = new DerivedProperty(
      [this.potentialProperty, this.saltBridgeProperty],
      (potential, saltBridge) => (saltBridge ? potential : 0),
    );
    this.anodeSideProperty = new DerivedProperty([this.potentialProperty], (potential) =>
      Math.abs(potential) < 1e-12 ? null : potential > 0 ? "left" : "right",
    );
    this.anodeGoneProperty = new DerivedProperty(
      [this.anodeSideProperty, this.left.massProperty, this.right.massProperty],
      (anodeSide, leftMass, rightMass) => {
        if (anodeSide === null) {
          return false;
        }
        const anode = anodeSide === "left" ? this.left : this.right;
        return !isGasElectrode(anode.halfCellProperty.value) && (anodeSide === "left" ? leftMass : rightMass) <= 0;
      },
    );

    // A new half-cell gets fresh solution and a fresh electrode; the run starts over.
    const rebuild = (state: HalfCellState) => () => {
      state.refresh();
      this.restartRun();
    };
    this.left.halfCellProperty.lazyLink(rebuild(this.left));
    this.right.halfCellProperty.lazyLink(rebuild(this.right));
    this.saltBridgeProperty.lazyLink(() => this.updateCurrent());
    this.circuitClosedProperty.lazyLink(() => this.updateCurrent());
  }

  public stateOf(side: Side): HalfCellState {
    return side === "left" ? this.left : this.right;
  }

  /** Whether current can flow at all: bulb connected, salt bridge in, and an anode left to dissolve. */
  public get canConduct(): boolean {
    return this.circuitClosedProperty.value && this.saltBridgeProperty.value && !this.anodeGoneProperty.value;
  }

  /** Fresh solutions and electrodes in both beakers; the run's time and charge start over. */
  public rebuild(): void {
    this.left.refresh();
    this.right.refresh();
    this.restartRun();
  }

  /** Keeps the solutions and electrodes as they are but starts the run's time and charge over. */
  public restartRun(): void {
    this.chargeProperty.reset();
    this.elapsedTimeProperty.reset();
    this.updateCurrent();
  }

  /** Current (A, signed as currentProperty) for the present state, without advancing time. */
  public computeCurrent(): number {
    if (!this.canConduct) {
      return 0;
    }
    const potential = this.potentialProperty.value;
    const cathode = potential > 0 ? this.right : this.left;
    const resistance =
      CIRCUIT_RESISTANCE +
      MASS_TRANSPORT_RESISTANCE / Math.max(cathode.concentrationProperty.value, CONCENTRATION_FLOOR);
    return potential / resistance;
  }

  private updateCurrent(): void {
    this.currentProperty.value = this.computeCurrent();
  }

  /**
   * Advances the cell by `dt` simulated seconds. Does nothing (and shows no current) unless the
   * circuit is complete.
   */
  public step(dt: number): void {
    if (!this.canConduct) {
      this.currentProperty.value = 0;
      return;
    }
    let remaining = dt;
    for (let i = 0; i < MAX_SUBSTEPS && remaining > 0; i++) {
      const current = this.computeCurrent();
      if (Math.abs(current) < CURRENT_THRESHOLD || this.anodeGoneProperty.value) {
        // Dead or at equilibrium: the rest of the time passes with no current.
        this.elapsedTimeProperty.value += remaining;
        remaining = 0;
        break;
      }
      const anode = current > 0 ? this.left : this.right;
      const cathode = current > 0 ? this.right : this.left;
      const anodeHalf = anode.halfCellProperty.value;
      const cathodeHalf = cathode.halfCellProperty.value;

      // Rates (mol/s) at which the anode's ion forms and the cathode's ion is used up.
      const electronRate = Math.abs(current) / FARADAY;
      const anodeIonRate = (electronRate * anodeHalf.ionCoefficient) / anodeHalf.electrons;
      const cathodeIonRate = (electronRate * cathodeHalf.ionCoefficient) / cathodeHalf.electrons;
      // Time until a metal anode is used up (the platinum hydrogen electrode never is).
      const timeToDissolve =
        anodeHalf.metalMolarMass === null
          ? Number.POSITIVE_INFINITY
          : anode.massProperty.value / anodeHalf.metalMolarMass / (electronRate / anodeHalf.electrons);
      const h = Math.min(
        remaining,
        (MAX_FRACTION_PER_SUBSTEP * cathode.moles) / cathodeIonRate,
        (MAX_FRACTION_PER_SUBSTEP * Math.max(anode.moles, 1e-6)) / anodeIonRate,
        timeToDissolve,
      );

      const electrons = electronRate * h;
      anode.react(anodeIonRate * h, -electrons / anodeHalf.electrons);
      if (h === timeToDissolve) {
        // Land on zero exactly; rounding could otherwise leave a sliver that never counts as gone.
        anode.massProperty.value = 0;
      }
      cathode.react(-cathodeIonRate * h, electrons / cathodeHalf.electrons);
      this.chargeProperty.value += electrons * FARADAY;
      this.elapsedTimeProperty.value += h;
      remaining -= h;
    }
    // Any time left after MAX_SUBSTEPS is dropped rather than integrated coarsely.
    this.updateCurrent();
  }

  public reset(): void {
    this.left.reset();
    this.right.reset();
    this.temperatureProperty.reset();
    this.saltBridgeProperty.reset();
    this.circuitClosedProperty.reset();
    this.restartRun();
  }
}
