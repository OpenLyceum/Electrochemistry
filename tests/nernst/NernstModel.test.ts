/**
 * NernstModel.test.ts
 *
 * The Swap and Concentration Cell buttons: what each beaker holds afterwards.
 */

import { describe, expect, it } from "vitest";
import { HALF_CELLS } from "../../src/common/model/HalfCells.js";
import { ELECTRODE_MASS } from "../../src/ElectrochemistryConstants.js";
import { LOG_CONCENTRATION_RANGE, NernstModel } from "../../src/nernst/model/NernstModel.js";

/** A copper concentration cell that has run for 100 h of cell time, so its electrodes differ. */
function runConcentrationCell(): NernstModel {
  const model = new NernstModel();
  model.concentrationCell();
  model.cell.circuitClosedProperty.value = true;
  for (let i = 0; i < 600; i++) {
    model.advance(1 / 60);
  }
  return model;
}

describe("NernstModel", () => {
  it("swaps whole beakers, electrodes and all", () => {
    const model = runConcentrationCell();
    const { left, right } = model.cell;
    const before = [
      left.concentrationProperty.value,
      left.massProperty.value,
      right.concentrationProperty.value,
      right.massProperty.value,
    ];
    expect(before[1]).not.toBeCloseTo(before[3] as number, 3);
    model.swap();
    expect([left.concentrationProperty.value, left.massProperty.value]).toEqual([before[2], before[3]]);
    expect([right.concentrationProperty.value, right.massProperty.value]).toEqual([before[0], before[1]]);
  });

  it("swaps different half-cells with their electrodes", () => {
    const model = new NernstModel();
    model.cell.circuitClosedProperty.value = true;
    model.advance(1);
    const { left, right } = model.cell;
    const zincMass = left.massProperty.value;
    const copperMass = right.massProperty.value;
    model.swap();
    expect(left.halfCellProperty.value).toBe(HALF_CELLS.cu);
    expect(left.massProperty.value).toBe(copperMass);
    expect(right.halfCellProperty.value).toBe(HALF_CELLS.zn);
    expect(right.massProperty.value).toBe(zincMass);
  });

  it("builds the concentration cell with fresh electrodes", () => {
    const model = runConcentrationCell();
    model.concentrationCell();
    const { left, right } = model.cell;
    expect(left.massProperty.value).toBe(ELECTRODE_MASS);
    expect(right.massProperty.value).toBe(ELECTRODE_MASS);
    expect(left.concentrationProperty.value).toBe(0.01);
    expect(right.concentrationProperty.value).toBe(1);
    expect(model.cell.elapsedTimeProperty.value).toBe(0);
  });

  it("sets an in-range concentration from the log slider", () => {
    const model = new NernstModel();
    model.leftLogConcentrationProperty.value = -1;
    expect(model.cell.left.concentrationProperty.value).toBeCloseTo(0.1, 10);
    expect(model.leftLogConcentrationProperty.value).toBeCloseTo(-1, 10);
  });

  it("keeps a concentration the cell has driven off the track", () => {
    const model = new NernstModel();
    model.cell.right.concentrationProperty.value = 1e-8;
    expect(model.cell.right.concentrationProperty.value).toBe(1e-8);
    expect(model.rightLogConcentrationProperty.value).toBeCloseTo(LOG_CONCENTRATION_RANGE.min, 10);
  });

  it("steps an off-track concentration by the slider's delta", () => {
    const model = new NernstModel();
    model.cell.right.concentrationProperty.value = 1e-8;
    const pin = model.rightLogConcentrationProperty.value;
    model.rightLogConcentrationProperty.value = pin + 0.05;
    expect(model.cell.right.concentrationProperty.value).toBeCloseTo(1e-8 * 10 ** 0.05, 12);
    expect(model.rightLogConcentrationProperty.value).toBeCloseTo(LOG_CONCENTRATION_RANGE.min, 10);
    model.rightLogConcentrationProperty.value = LOG_CONCENTRATION_RANGE.min + 0.05;
    expect(model.cell.right.concentrationProperty.value).toBeCloseTo(1e-8 * 10 ** 0.1, 12);
  });

  it("steps down from a concentration above the track", () => {
    const model = new NernstModel();
    model.cell.left.concentrationProperty.value = 5;
    const pin = model.leftLogConcentrationProperty.value;
    expect(pin).toBeCloseTo(LOG_CONCENTRATION_RANGE.max, 10);
    model.leftLogConcentrationProperty.value = pin - 0.05;
    expect(model.cell.left.concentrationProperty.value).toBeCloseTo(5 * 10 ** -0.05, 10);
    expect(model.leftLogConcentrationProperty.value).toBeCloseTo(LOG_CONCENTRATION_RANGE.max, 10);
  });

  it("writes the track value while a pointer is dragging the slider", () => {
    const model = new NernstModel();
    model.cell.right.concentrationProperty.value = 1e-8;
    model.concentrationSliderHeld.right = true;
    model.rightLogConcentrationProperty.value = -2;
    expect(model.cell.right.concentrationProperty.value).toBeCloseTo(0.01, 10);
    expect(model.rightLogConcentrationProperty.value).toBeCloseTo(-2, 10);
  });
});
