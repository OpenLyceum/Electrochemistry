/**
 * Electrolysis.test.ts
 *
 * Faraday's-law amounts and the decomposition voltage.
 */

import { describe, expect, it } from "vitest";
import { ELECTROLYSIS_SYSTEMS } from "../../src/common/model/ElectrolysisSystems.js";
import { ELECTRODE_MASS } from "../../src/ElectrochemistryConstants.js";
import {
  current,
  ElectrolysisModel,
  gasVolume,
  metalMassChange,
} from "../../src/electrolysis/model/ElectrolysisModel.js";

describe("Faraday's law", () => {
  it("plates 1.19 g Cu with 2.00 A for 30.0 min", () => {
    expect(metalMassChange(ELECTROLYSIS_SYSTEMS.copperPlating.cathodeProduct, 2 * 1800)).toBeCloseTo(1.1855, 3);
    expect(metalMassChange(ELECTROLYSIS_SYSTEMS.copperPlating.anodeProduct, 2 * 1800)).toBeCloseTo(-1.1855, 3);
  });

  it("collects H₂ and O₂ in a 2 : 1 ratio", () => {
    const water = ELECTROLYSIS_SYSTEMS.water;
    const h2 = gasVolume(water.cathodeProduct, 500);
    const o2 = gasVolume(water.anodeProduct, 500);
    expect(h2 / o2).toBeCloseTo(2, 10);
    // 500 C → 0.005182 mol e⁻ → 0.002591 mol H₂ → 63.4 mL at 25 °C, 1 atm
    expect(h2).toBeCloseTo(63.39, 1);
  });
});

describe("ElectrolysisModel", () => {
  it("passes no current below the decomposition voltage", () => {
    const water = ELECTROLYSIS_SYSTEMS.water;
    expect(current(water, 1.2, 0.5)).toBe(0);
    expect(current(water, 2.229, 0.5)).toBeCloseTo(0.1, 10);
  });

  it("accumulates charge I·t while powered", () => {
    const model = new ElectrolysisModel();
    model.voltageProperty.value = 4;
    model.powerOnProperty.value = true;
    model.advance(600);
    expect(model.chargeProperty.value).toBeCloseTo(2 * 600, 6);
    expect(model.cathodeMassProperty.value - ELECTRODE_MASS).toBeCloseTo((1200 / 96485.33212 / 2) * 63.546, 9);
  });

  it("stops when a gas tube is full", () => {
    const model = new ElectrolysisModel();
    model.systemProperty.value = ELECTROLYSIS_SYSTEMS.water;
    model.voltageProperty.value = 6;
    model.powerOnProperty.value = true;
    model.advance(100000);
    expect(model.finishedProperty.value).toBe(true);
    expect(model.cathodeGasVolumeProperty.value).toBeCloseTo(50, 6);
    expect(model.anodeGasVolumeProperty.value).toBeCloseTo(25, 6);
    expect(model.currentProperty.value).toBe(0);
  });

  it("uses up Cu²⁺ in CuCl₂ and raises the decomposition voltage", () => {
    const model = new ElectrolysisModel();
    model.systemProperty.value = ELECTROLYSIS_SYSTEMS.copperChloride;
    const start = model.minimumVoltageProperty.value;
    model.voltageProperty.value = 6;
    model.powerOnProperty.value = true;
    for (let i = 0; i < 50; i++) {
      model.advance(600);
    }
    expect(model.cationConcentrationProperty.value).toBeLessThan(0.5);
    expect(model.minimumVoltageProperty.value).toBeGreaterThan(start);
  });
});
