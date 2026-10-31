/**
 * Electrolysis.test.ts
 *
 * Faraday's-law amounts and the decomposition voltage.
 */

import { TimeSpeed } from "scenerystack/scenery-phet";
import { describe, expect, it } from "vitest";
import { ELECTROLYSIS_SYSTEM_LIST, ELECTROLYSIS_SYSTEMS } from "../../src/common/model/ElectrolysisSystems.js";
import { ELECTRODE_MASS, GAS_TUBE_CAPACITY } from "../../src/ElectrochemistryConstants.js";
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

  it.each(ELECTROLYSIS_SYSTEM_LIST.map((system) => [system.id, system] as const))(
    "runs %s to the end and stops there",
    (_id, system) => {
      const model = new ElectrolysisModel();
      model.systemProperty.value = system;
      model.voltageProperty.value = 3;
      model.powerOnProperty.value = true;
      model.timeSpeedProperty.value = TimeSpeed.FAST;
      for (let frame = 0; frame < 10000 && !model.finishedProperty.value; frame++) {
        model.stepFrame(1 / 60);
      }
      expect(model.finishedProperty.value).toBe(true);
      expect(model.currentProperty.value).toBe(0);
      const dissolves = system.anodeProduct.kind === "metal" && system.anodeProduct.dissolves;
      if (dissolves) {
        expect(model.anodeMassProperty.value).toBeCloseTo(0, 9);
      } else {
        const fullest = Math.max(model.cathodeGasVolumeProperty.value, model.anodeGasVolumeProperty.value);
        expect(fullest).toBeCloseTo(GAS_TUBE_CAPACITY, 9);
      }
      // Finished means no more time passes.
      const elapsed = model.elapsedTimeProperty.value;
      model.stepFrame(1 / 60);
      expect(model.elapsedTimeProperty.value).toBe(elapsed);
    },
  );

  it("steps one frame at the chosen speed", () => {
    const model = new ElectrolysisModel();
    model.powerOnProperty.value = true;
    model.stepFrame(1 / 60);
    expect(model.elapsedTimeProperty.value).toBeCloseTo(1, 9);
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
