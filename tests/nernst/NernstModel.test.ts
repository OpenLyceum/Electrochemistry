/**
 * NernstModel.test.ts
 *
 * The Swap and Concentration Cell buttons: what each beaker holds afterwards.
 */

import { describe, expect, it } from "vitest";
import { HALF_CELLS } from "../../src/common/model/HalfCells.js";
import { ELECTRODE_MASS } from "../../src/ElectrochemistryConstants.js";
import { NernstModel } from "../../src/nernst/model/NernstModel.js";

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
});
