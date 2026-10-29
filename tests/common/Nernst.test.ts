/**
 * Nernst.test.ts
 *
 * Cell potentials, reaction quotients, ΔG and K against textbook worked values.
 */

import { describe, expect, it } from "vitest";
import { HALF_CELLS } from "../../src/common/model/HalfCells.js";
import {
  cellPotential,
  electronsTransferred,
  gibbsEnergy,
  logEquilibriumConstant,
  logReactionQuotient,
  nernstSlope,
  standardCellPotential,
} from "../../src/common/model/Nernst.js";
import { STANDARD_TEMPERATURE } from "../../src/ElectrochemistryConstants.js";

const { zn, cu, ag, al, h2 } = HALF_CELLS;
const T = STANDARD_TEMPERATURE;

describe("standard potentials", () => {
  it("gives the Daniell cell 1.10 V", () => {
    expect(standardCellPotential(cu, zn)).toBeCloseTo(1.104, 3);
  });

  it("gives Cu–Ag 0.46 V with two electrons", () => {
    expect(standardCellPotential(ag, cu)).toBeCloseTo(0.458, 3);
    expect(electronsTransferred(ag, cu)).toBe(2);
  });

  it("balances Al–Cu with six electrons", () => {
    expect(electronsTransferred(cu, al)).toBe(6);
  });
});

describe("Nernst equation", () => {
  it("has the 0.0592/n V slope at 25 °C", () => {
    expect(nernstSlope(1, T)).toBeCloseTo(0.05916, 5);
    expect(nernstSlope(2, T)).toBeCloseTo(0.02958, 5);
  });

  it("equals E° at standard concentrations", () => {
    expect(cellPotential(cu, 1, zn, 1, T)).toBeCloseTo(1.1037, 4);
  });

  it("lowers a Daniell cell with dilute Cu²⁺: E = 1.104 − 0.0296 log(1/0.01)", () => {
    expect(logReactionQuotient(cu, 0.01, zn, 1)).toBeCloseTo(2, 10);
    expect(cellPotential(cu, 0.01, zn, 1, T)).toBeCloseTo(standardCellPotential(cu, zn) - 2 * nernstSlope(2, T), 10);
  });

  it("matches E = E° − (0.0592/n) log Q for a mixed-n cell", () => {
    // 2Ag⁺ + Cu → 2Ag + Cu²⁺, Q = [Cu²⁺]/[Ag⁺]²
    const logQ = logReactionQuotient(ag, 0.05, cu, 0.2);
    expect(logQ).toBeCloseTo(Math.log10(0.2 / 0.05 ** 2), 10);
    expect(cellPotential(ag, 0.05, cu, 0.2, T)).toBeCloseTo(
      standardCellPotential(ag, cu) - nernstSlope(2, T) * logQ,
      10,
    );
  });

  it("treats the hydrogen electrode with ν = 2", () => {
    // 2H⁺ + Zn → H₂ + Zn²⁺ at pH 1: Q = 1/(0.1)², E = 0.7618 − 0.0296·2
    expect(cellPotential(h2, 0.1, zn, 1, T)).toBeCloseTo(0.7618 - 2 * nernstSlope(2, T), 6);
  });

  it("gives a concentration cell 0.0592 V per decade over n", () => {
    expect(cellPotential(cu, 1, cu, 0.01, T)).toBeCloseTo(0.05916, 4);
  });

  it("follows the temperature in the slope", () => {
    expect(nernstSlope(2, 373.15) / nernstSlope(2, 298.15)).toBeCloseTo(373.15 / 298.15, 10);
  });
});

describe("ΔG and K", () => {
  it("gives ΔG° = −213 kJ for the Daniell cell", () => {
    expect(gibbsEnergy(2, 1.104)).toBeCloseTo(-213.0, 0);
  });

  it("gives log K ≈ 37.3 for the Daniell cell", () => {
    expect(logEquilibriumConstant(2, standardCellPotential(cu, zn), T)).toBeCloseTo(37.3, 1);
  });
});

describe("notation", () => {
  it("writes a 1+ ion without the 1", () => {
    expect(HALF_CELLS.ag.ion).toBe("Ag<sup>+</sup>");
    expect(HALF_CELLS.ag.ionPlain).toBe("Ag⁺");
    expect(HALF_CELLS.al.ion).toBe("Al<sup>3+</sup>");
  });
});
