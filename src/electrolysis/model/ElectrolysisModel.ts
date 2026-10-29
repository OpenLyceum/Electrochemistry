/**
 * ElectrolysisModel.ts
 *
 * An electrolytic cell driven by a variable DC power supply. Current flows only above the
 * decomposition voltage:
 *
 *   I = (V − E_min) / (R + R_MT / [Cu²⁺])   for V > E_min, else 0
 *
 * where the mass-transport term applies only when the cathode's cation is used up (CuCl₂), and
 * E_min shifts with its concentration by the Nernst equation. Charge accumulates as ∫I dt, and
 * every product follows Faraday's law, n = Q / (zF). Gases are collected over each electrode at
 * 25 °C and 1 atm until a tube is full; the run then stops.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import {
  ELECTROLYSIS_SYSTEMS,
  type ElectrodeProduct,
  type ElectrolysisSystem,
  productMoles,
} from "../../common/model/ElectrolysisSystems.js";
import { thermalVoltage } from "../../common/model/Nernst.js";
import { timeScaleFor } from "../../common/model/timeScale.js";
import { TimeModel } from "../../common/TimeModel.js";
import {
  CONCENTRATION_FLOOR,
  DEFAULT_SUPPLY_VOLTAGE,
  ELECTRODE_MASS,
  ELECTROLYSIS_TIME_SCALE,
  ELECTROLYSIS_VOLUME,
  FARADAY,
  GAS_CONSTANT,
  GAS_TUBE_CAPACITY,
  MASS_TRANSPORT_RESISTANCE,
  MAX_FRACTION_PER_SUBSTEP,
  MAX_SUBSTEPS,
  STANDARD_PRESSURE,
  STANDARD_TEMPERATURE,
  SUPPLY_VOLTAGE_RANGE,
} from "../../ElectrochemistryConstants.js";

/** Molar volume of an ideal gas at 25 °C and 1 atm (mL/mol): 24 465 mL. */
export const MOLAR_GAS_VOLUME = ((GAS_CONSTANT * STANDARD_TEMPERATURE) / STANDARD_PRESSURE) * 1e6;

/** Gas volume (mL) of a gaseous product after `charge` C; 0 for a metal. */
export function gasVolume(product: ElectrodeProduct, charge: number): number {
  return product.kind === "gas" ? productMoles(product, charge) * MOLAR_GAS_VOLUME : 0;
}

/** Signed mass change (g) of an electrode whose product is a metal after `charge` C; 0 for a gas. */
export function metalMassChange(product: ElectrodeProduct, charge: number): number {
  if (product.kind !== "metal") {
    return 0;
  }
  const mass = productMoles(product, charge) * product.molarMass;
  return product.dissolves ? -mass : mass;
}

export class ElectrolysisModel implements TModel {
  public readonly systemProperty = new Property<ElectrolysisSystem>(ELECTROLYSIS_SYSTEMS.copperPlating);
  public readonly voltageProperty = new NumberProperty(DEFAULT_SUPPLY_VOLTAGE, {
    range: SUPPLY_VOLTAGE_RANGE,
    units: "V",
  });
  /** The supply is switched on. */
  public readonly powerOnProperty = new BooleanProperty(false);
  public readonly timer = new TimeModel(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  /** Show the Faraday's-law calculation (hidden by default so students can predict first). */
  public readonly showCalculationProperty = new BooleanProperty(false);

  /** Concentration of the salt's cation (M); falls only when the system consumes it. */
  public readonly cationConcentrationProperty = new NumberProperty(ELECTROLYSIS_SYSTEMS.copperPlating.concentration);

  /** Charge passed since the run started (C). */
  public readonly chargeProperty = new NumberProperty(0, { units: "C" });
  /** Simulated run time (s). */
  public readonly elapsedTimeProperty = new NumberProperty(0, { units: "s" });
  public readonly currentProperty: TReadOnlyProperty<number>;
  /** Decomposition voltage at the present concentration (V). */
  public readonly minimumVoltageProperty: TReadOnlyProperty<number>;

  public readonly cathodeMassProperty: TReadOnlyProperty<number>;
  public readonly anodeMassProperty: TReadOnlyProperty<number>;
  public readonly cathodeGasVolumeProperty: TReadOnlyProperty<number>;
  public readonly anodeGasVolumeProperty: TReadOnlyProperty<number>;
  /** A gas tube is full, or a dissolving anode is gone: the run has stopped. */
  public readonly finishedProperty: TReadOnlyProperty<boolean>;

  public constructor() {
    this.minimumVoltageProperty = new DerivedProperty(
      [this.systemProperty, this.cationConcentrationProperty],
      (system, concentration) => minimumVoltage(system, concentration),
    );
    const electrodeMass = (which: "cathode" | "anode") =>
      new DerivedProperty([this.systemProperty, this.chargeProperty], (system, charge) =>
        Math.max(
          0,
          ELECTRODE_MASS + metalMassChange(which === "cathode" ? system.cathodeProduct : system.anodeProduct, charge),
        ),
      );
    this.cathodeMassProperty = electrodeMass("cathode");
    this.anodeMassProperty = electrodeMass("anode");
    this.cathodeGasVolumeProperty = new DerivedProperty([this.systemProperty, this.chargeProperty], (system, charge) =>
      gasVolume(system.cathodeProduct, charge),
    );
    this.anodeGasVolumeProperty = new DerivedProperty([this.systemProperty, this.chargeProperty], (system, charge) =>
      gasVolume(system.anodeProduct, charge),
    );
    this.finishedProperty = new DerivedProperty(
      [this.cathodeGasVolumeProperty, this.anodeGasVolumeProperty, this.anodeMassProperty],
      (cathodeGas, anodeGas, anodeMass) =>
        cathodeGas >= GAS_TUBE_CAPACITY || anodeGas >= GAS_TUBE_CAPACITY || anodeMass <= 0,
    );
    this.currentProperty = new DerivedProperty(
      [
        this.systemProperty,
        this.voltageProperty,
        this.powerOnProperty,
        this.cationConcentrationProperty,
        this.finishedProperty,
      ],
      (system, voltage, on, concentration, finished) => (on && !finished ? current(system, voltage, concentration) : 0),
    );

    this.systemProperty.lazyLink(() => this.restartRun());
  }

  /** Fresh electrolyte, electrodes and empty gas tubes; the supply setting is kept. */
  public restartRun(): void {
    this.cationConcentrationProperty.value = this.systemProperty.value.concentration;
    this.chargeProperty.reset();
    this.elapsedTimeProperty.reset();
  }

  public reset(): void {
    this.systemProperty.reset();
    this.voltageProperty.reset();
    this.powerOnProperty.reset();
    this.timer.reset();
    this.timeSpeedProperty.reset();
    this.showCalculationProperty.reset();
    this.restartRun();
  }

  /** Advances by one frame of `dt` real seconds when playing. */
  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      this.advance(dt * timeScaleFor(this.timeSpeedProperty.value, ELECTROLYSIS_TIME_SCALE));
    }
  }

  /** Advances by `dt` simulated seconds whether or not the clock is playing (step button, tests). */
  public advance(dt: number): void {
    if (!this.powerOnProperty.value || this.finishedProperty.value) {
      return;
    }
    const system = this.systemProperty.value;
    let remaining = dt;
    for (let i = 0; i < MAX_SUBSTEPS && remaining > 0 && !this.finishedProperty.value; i++) {
      const i0 = this.currentProperty.value;
      if (i0 <= 0) {
        this.elapsedTimeProperty.value += remaining;
        return;
      }
      let h = remaining;
      if (system.consumesCation) {
        const moles = this.cationConcentrationProperty.value * ELECTROLYSIS_VOLUME;
        const rate = i0 / (system.cathodeProduct.electrons * FARADAY);
        h = Math.min(h, (MAX_FRACTION_PER_SUBSTEP * moles) / rate);
      }
      // Stop exactly when a gas tube fills, so the readings end on the tube's capacity.
      h = Math.min(h, this.timeToFill(system, i0));
      const charge = i0 * h;
      if (system.consumesCation) {
        const used = charge / (system.cathodeProduct.electrons * FARADAY);
        this.cationConcentrationProperty.value = Math.max(
          CONCENTRATION_FLOOR,
          this.cationConcentrationProperty.value - used / ELECTROLYSIS_VOLUME,
        );
      }
      this.chargeProperty.value += charge;
      this.elapsedTimeProperty.value += h;
      remaining -= h;
    }
  }

  /** Time (s) at current `i0` until a gas tube is full or a dissolving anode is used up. */
  private timeToFill(system: ElectrolysisSystem, i0: number): number {
    let limit = Number.POSITIVE_INFINITY;
    for (const product of [system.cathodeProduct, system.anodeProduct]) {
      if (product.kind === "gas") {
        const chargeToFill = (GAS_TUBE_CAPACITY / MOLAR_GAS_VOLUME) * product.electrons * FARADAY;
        limit = Math.min(limit, (chargeToFill - this.chargeProperty.value) / i0);
      } else if (product.dissolves) {
        const chargeToDissolve = (ELECTRODE_MASS / product.molarMass) * product.electrons * FARADAY;
        limit = Math.min(limit, (chargeToDissolve - this.chargeProperty.value) / i0);
      }
    }
    return Math.max(limit, 0);
  }
}

/**
 * Decomposition voltage (V): the standard value, raised by the Nernst equation as the reduced
 * cation is used up (CuCl₂: Cu²⁺ + 2Cl⁻ → Cu + Cl₂, with [Cl⁻] = 2[Cu²⁺]).
 */
export function minimumVoltage(system: ElectrolysisSystem, concentration: number): number {
  if (!system.consumesCation) {
    return system.minimumVoltage;
  }
  const chloride = 2 * concentration;
  return (
    system.minimumVoltage - (thermalVoltage(STANDARD_TEMPERATURE) / 2) * Math.log(concentration * chloride * chloride)
  );
}

/** Current (A) at supply voltage `voltage`. */
export function current(system: ElectrolysisSystem, voltage: number, concentration: number): number {
  const drive = voltage - minimumVoltage(system, concentration);
  if (drive <= 0) {
    return 0;
  }
  const resistance =
    system.resistance +
    (system.consumesCation ? MASS_TRANSPORT_RESISTANCE / Math.max(concentration, CONCENTRATION_FLOOR) : 0);
  return drive / resistance;
}
