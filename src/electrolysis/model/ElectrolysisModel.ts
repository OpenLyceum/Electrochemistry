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
 * 25 °C and 1 atm until a tube is full; the run then stops. A dissolving anode stops the run the
 * same way when it is used up. Both limits are a charge, so the run ends exactly on it.
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
  type ElectrodeMaterial,
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

/**
 * Amounts for the Faraday gas-volume line. Litres are the millilitre reading divided by 1000,
 * so "0.0634 L = 63.4 mL" multiplies out, and litres per mole stays the textbook 24.47.
 */
export function gasEquationAmounts(molesAmount: number): {
  molarVolumeLiters: number;
  liters: number;
  milliliters: number;
} {
  const milliliters = Number((molesAmount * MOLAR_GAS_VOLUME).toFixed(1));
  return {
    molarVolumeLiters: MOLAR_GAS_VOLUME / 1000,
    liters: milliliters / 1000,
    milliliters,
  };
}

/**
 * Mass a measurement should quote. A metal electrode reports its own mass. Metal plated onto
 * a different electrode (silver on the steel spoon, copper on graphite) reports only the
 * plated grams: those electrodes do not start as 10 g of the product.
 */
export function reportedElectrodeMass(
  product: ElectrodeProduct,
  material: ElectrodeMaterial,
  mass: number,
): { value: number; change: number } {
  const platedOnSomethingElse =
    product.kind === "metal" &&
    !product.dissolves &&
    !((product.formula === "Cu" && material === "copper") || (product.formula === "Ag" && material === "silver"));
  if (platedOnSomethingElse) {
    const plated = Math.max(0, mass - ELECTRODE_MASS);
    return { value: plated, change: plated };
  }
  return { value: mass, change: mass - ELECTRODE_MASS };
}

/** Why the supply is or isn't passing current, for the power-switch announcement. */
export type SupplyAnnouncement = "off" | "current" | "belowMinimum" | "tubeFull" | "anodeDissolved";

export function supplyAnnouncement(state: {
  on: boolean;
  current: number;
  finished: boolean;
  anodeDissolves: boolean;
}): SupplyAnnouncement {
  if (!state.on) {
    return "off";
  }
  if (state.finished) {
    return state.anodeDissolves ? "anodeDissolved" : "tubeFull";
  }
  return state.current > 0 ? "current" : "belowMinimum";
}

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

/** Charge (C) at which the run stops: a gas tube is full or a dissolving anode is used up. */
export function chargeToFinish(system: ElectrolysisSystem): number {
  let limit = Number.POSITIVE_INFINITY;
  for (const product of [system.cathodeProduct, system.anodeProduct]) {
    if (product.kind === "gas") {
      limit = Math.min(limit, (GAS_TUBE_CAPACITY / MOLAR_GAS_VOLUME) * product.electrons * FARADAY);
    } else if (product.dissolves) {
      limit = Math.min(limit, (ELECTRODE_MASS / product.molarMass) * product.electrons * FARADAY);
    }
  }
  return limit;
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
    // Compared as charge, not as mass or volume: advance() lands exactly on this charge, whereas
    // 10 g − Q·M/(nF) can round to 1.8 × 10⁻¹⁵ g and never reach zero.
    this.finishedProperty = new DerivedProperty(
      [this.systemProperty, this.chargeProperty],
      (system, charge) => charge >= chargeToFinish(system),
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
      this.stepFrame(dt);
    }
  }

  /** Advances by `dt` real seconds at the chosen speed, playing or not (step button). */
  public stepFrame(dt: number): void {
    this.advance(dt * timeScaleFor(this.timeSpeedProperty.value, ELECTROLYSIS_TIME_SCALE));
  }

  /** Advances by `dt` simulated seconds whether or not the clock is playing (step button, tests). */
  public advance(dt: number): void {
    if (!this.powerOnProperty.value || this.finishedProperty.value) {
      return;
    }
    const system = this.systemProperty.value;
    const finalCharge = chargeToFinish(system);
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
      // Stop exactly when a gas tube fills or the anode is gone, so the readings end on the limit.
      const timeToFinish = (finalCharge - this.chargeProperty.value) / i0;
      const finishing = timeToFinish <= h;
      h = Math.min(h, timeToFinish);
      const charge = finishing ? finalCharge - this.chargeProperty.value : i0 * h;
      if (system.consumesCation) {
        const used = charge / (system.cathodeProduct.electrons * FARADAY);
        this.cationConcentrationProperty.value = Math.max(
          CONCENTRATION_FLOOR,
          this.cationConcentrationProperty.value - used / ELECTROLYSIS_VOLUME,
        );
      }
      this.chargeProperty.value = finishing ? finalCharge : this.chargeProperty.value + charge;
      this.elapsedTimeProperty.value += h;
      remaining -= h;
    }
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
