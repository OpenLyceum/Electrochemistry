/**
 * ElectrochemicalCell.test.ts
 *
 * Running a cell down: conservation of electrons, the anode/cathode choice, and the end states.
 */

import { describe, expect, it } from "vitest";
import { ElectrochemicalCell } from "../../src/common/model/ElectrochemicalCell.js";
import { HALF_CELLS } from "../../src/common/model/HalfCells.js";
import { ELECTRODE_MASS, FARADAY, HALF_CELL_VOLUME } from "../../src/ElectrochemistryConstants.js";

describe("ElectrochemicalCell", () => {
  it("reads E_right − E_left, and zero with the salt bridge out", () => {
    const cell = new ElectrochemicalCell({ leftHalfCell: HALF_CELLS.cu, rightHalfCell: HALF_CELLS.zn });
    expect(cell.voltmeterReadingProperty.value).toBeCloseTo(-1.104, 3);
    expect(cell.anodeSideProperty.value).toBe("right");
    cell.saltBridgeProperty.value = false;
    expect(cell.voltmeterReadingProperty.value).toBe(0);
  });

  it("passes no current until the bulb is connected", () => {
    const cell = new ElectrochemicalCell();
    cell.step(3600);
    expect(cell.chargeProperty.value).toBe(0);
    cell.circuitClosedProperty.value = true;
    expect(cell.currentProperty.value).toBeGreaterThan(0.5);
  });

  it("conserves electrons: Zn lost, Cu gained and ion amounts all match the charge", () => {
    const cell = new ElectrochemicalCell();
    cell.circuitClosedProperty.value = true;
    for (let i = 0; i < 100; i++) {
      cell.step(60);
    }
    const electrons = cell.chargeProperty.value / FARADAY;
    expect(electrons).toBeGreaterThan(0.01);
    expect(ELECTRODE_MASS - cell.left.massProperty.value).toBeCloseTo((electrons / 2) * 65.38, 6);
    expect(cell.right.massProperty.value - ELECTRODE_MASS).toBeCloseTo((electrons / 2) * 63.546, 6);
    expect((cell.left.concentrationProperty.value - 1) * HALF_CELL_VOLUME).toBeCloseTo(electrons / 2, 9);
    expect((1 - cell.right.concentrationProperty.value) * HALF_CELL_VOLUME).toBeCloseTo(electrons / 2, 9);
  });

  it("runs a Daniell cell down until the current dies with Cu²⁺ used up", () => {
    const cell = new ElectrochemicalCell();
    cell.circuitClosedProperty.value = true;
    for (let i = 0; i < 2000; i++) {
      cell.step(600);
    }
    expect(cell.right.concentrationProperty.value).toBeLessThan(1e-4);
    expect(cell.currentProperty.value).toBeLessThan(0.01);
    // E is still far from zero: K ≈ 10³⁷ is out of reach.
    expect(cell.potentialProperty.value).toBeGreaterThan(0.85);
  });

  it("runs a concentration cell to equal concentrations and E = 0", () => {
    const cell = new ElectrochemicalCell({ leftHalfCell: HALF_CELLS.cu, rightHalfCell: HALF_CELLS.cu });
    cell.left.concentrationProperty.value = 0.01;
    cell.circuitClosedProperty.value = true;
    for (let i = 0; i < 4000; i++) {
      cell.step(3600);
    }
    expect(cell.left.concentrationProperty.value).toBeCloseTo(0.505, 2);
    expect(cell.right.concentrationProperty.value).toBeCloseTo(0.505, 2);
    expect(Math.abs(cell.potentialProperty.value)).toBeLessThan(1e-4);
  });

  it("dissolves no more metal than a Pb anode holds, then stops", () => {
    const cell = new ElectrochemicalCell({ leftHalfCell: HALF_CELLS.pb, rightHalfCell: HALF_CELLS.cu });
    cell.circuitClosedProperty.value = true;
    for (let i = 0; i < 2000; i++) {
      cell.step(600);
    }
    const leadMoles = ELECTRODE_MASS / (HALF_CELLS.pb.metalMolarMass as number);
    expect(cell.anodeGoneProperty.value).toBe(true);
    expect(cell.left.massProperty.value).toBe(0);
    expect(cell.left.moles - HALF_CELL_VOLUME).toBeCloseTo(leadMoles, 12);
    expect(cell.chargeProperty.value / (2 * FARADAY)).toBeCloseTo(leadMoles, 12);
    expect(cell.currentProperty.value).toBe(0);
  });

  it("refreshes a beaker when its half-cell changes", () => {
    const cell = new ElectrochemicalCell();
    cell.circuitClosedProperty.value = true;
    cell.step(3600);
    cell.right.halfCellProperty.value = HALF_CELLS.ag;
    expect(cell.right.concentrationProperty.value).toBe(1);
    expect(cell.right.massProperty.value).toBe(ELECTRODE_MASS);
    expect(cell.chargeProperty.value).toBe(0);
  });

  it("updates current after a concentration edit without passing time or charge", () => {
    const cell = new ElectrochemicalCell();
    cell.circuitClosedProperty.value = true;
    cell.right.concentrationProperty.value = 1e-4;
    // E = 1.1037 + RT/(2F) ln(10^-4); R_total = 1 + 0.2/(10^-4) ohms.
    expect(cell.currentProperty.value).toBeCloseTo(0.0004924444281002284, 12);
    expect(cell.chargeProperty.value).toBe(0);
    expect(cell.elapsedTimeProperty.value).toBe(0);
    expect(cell.left.massProperty.value).toBe(ELECTRODE_MASS);
    expect(cell.right.massProperty.value).toBe(ELECTRODE_MASS);
  });

  it("updates current direction and temperature dependence without a simulation step", () => {
    const cell = new ElectrochemicalCell({ leftHalfCell: HALF_CELLS.cu, rightHalfCell: HALF_CELLS.cu });
    cell.left.concentrationProperty.value = 0.01;
    cell.circuitClosedProperty.value = true;
    expect(cell.currentProperty.value).toBeGreaterThan(0);
    cell.right.concentrationProperty.value = 0.001;
    const roomTemperature = cell.currentProperty.value;
    expect(roomTemperature).toBeLessThan(0);
    cell.temperatureProperty.value = 373.15;
    // E and therefore I scale with absolute temperature for a concentration cell.
    expect(cell.currentProperty.value).toBeCloseTo((roomTemperature * 373.15) / 298.15, 12);
    expect(cell.elapsedTimeProperty.value).toBe(0);
    expect(cell.chargeProperty.value).toBe(0);
    cell.right.massProperty.value = 0;
    expect(cell.currentProperty.value).toBe(0);
  });

  it("keeps edited open circuits at zero current and resets all current dependencies", () => {
    const cell = new ElectrochemicalCell();
    cell.right.concentrationProperty.value = 0.01;
    cell.temperatureProperty.value = 350;
    expect(cell.currentProperty.value).toBe(0);
    cell.circuitClosedProperty.value = true;
    expect(cell.currentProperty.value).toBeGreaterThan(0);
    cell.saltBridgeProperty.value = false;
    cell.left.concentrationProperty.value = 0.1;
    expect(cell.currentProperty.value).toBe(0);
    cell.reset();
    expect(cell.currentProperty.value).toBe(0);
    cell.circuitClosedProperty.value = true;
    expect(cell.currentProperty.value).toBeCloseTo(0.91975, 10);
  });
});
