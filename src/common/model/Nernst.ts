/**
 * Nernst.ts
 *
 * The thermodynamics of a galvanic cell, as pure functions. A cell is written with one half-cell
 * as the cathode (reduction) and the other as the anode (oxidation); every function takes them in
 * that order. Solids have activity 1, H₂ is at 1 atm, and ions are ideal (activity = molarity).
 *
 * For a half-reaction ν Ox + n e⁻ → Red, the electrode potential is
 *
 *   E = E° − (RT / nF) ln(1 / [Ox]^ν) = E° + (ν RT / nF) ln[Ox]
 *
 * and the cell potential E_cell = E_cathode − E_anode is the same as the textbook form
 * E = E° − (RT / nF) ln Q for the overall reaction with n = lcm(n_cathode, n_anode) electrons.
 * Standard potentials are taken as independent of temperature.
 */

import { FARADAY, GAS_CONSTANT } from "../../ElectrochemistryConstants.js";
import type { HalfCell } from "./HalfCells.js";

/** RT/F (V) at temperature T (K): 0.025693 V at 25 °C. */
export function thermalVoltage(temperature: number): number {
  return (GAS_CONSTANT * temperature) / FARADAY;
}

/** Potential (V) of one electrode with its ion at `concentration` (M). */
export function electrodePotential(halfCell: HalfCell, concentration: number, temperature: number): number {
  return (
    halfCell.standardPotential +
    ((halfCell.ionCoefficient * thermalVoltage(temperature)) / halfCell.electrons) * Math.log(concentration)
  );
}

/** Standard cell potential E°cell = E°cathode − E°anode (V). */
export function standardCellPotential(cathode: HalfCell, anode: HalfCell): number {
  return cathode.standardPotential - anode.standardPotential;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Electrons transferred in the balanced overall reaction: lcm of the two half-reactions' n. */
export function electronsTransferred(cathode: HalfCell, anode: HalfCell): number {
  return (cathode.electrons * anode.electrons) / gcd(cathode.electrons, anode.electrons);
}

/**
 * Natural log of the reaction quotient Q of the overall reaction
 *
 *   (n/n_c) ν_c Ox_c + (n/n_a) Red_a → (n/n_c) Red_c + (n/n_a) ν_a Ox_a
 *
 * so Q = [Ox_a]^(ν_a n/n_a) / [Ox_c]^(ν_c n/n_c). Logarithms keep it finite for any inputs.
 */
export function lnReactionQuotient(
  cathode: HalfCell,
  cathodeConcentration: number,
  anode: HalfCell,
  anodeConcentration: number,
): number {
  const n = electronsTransferred(cathode, anode);
  return (
    ((anode.ionCoefficient * n) / anode.electrons) * Math.log(anodeConcentration) -
    ((cathode.ionCoefficient * n) / cathode.electrons) * Math.log(cathodeConcentration)
  );
}

/** Base-10 log of Q. */
export function logReactionQuotient(
  cathode: HalfCell,
  cathodeConcentration: number,
  anode: HalfCell,
  anodeConcentration: number,
): number {
  return lnReactionQuotient(cathode, cathodeConcentration, anode, anodeConcentration) / Math.LN10;
}

/** Cell potential E = E_cathode − E_anode (V); negative when the reaction as written is not spontaneous. */
export function cellPotential(
  cathode: HalfCell,
  cathodeConcentration: number,
  anode: HalfCell,
  anodeConcentration: number,
  temperature: number,
): number {
  return (
    electrodePotential(cathode, cathodeConcentration, temperature) -
    electrodePotential(anode, anodeConcentration, temperature)
  );
}

/** Nernst slope 2.303 RT / nF (V per decade of Q). */
export function nernstSlope(n: number, temperature: number): number {
  return (Math.LN10 * thermalVoltage(temperature)) / n;
}

/** Gibbs energy change ΔG = −nFE (kJ/mol of reaction as written). */
export function gibbsEnergy(n: number, potential: number): number {
  return (-n * FARADAY * potential) / 1000;
}

/** Base-10 log of the equilibrium constant: log K = nFE° / (2.303 RT). */
export function logEquilibriumConstant(n: number, standardPotential: number, temperature: number): number {
  return standardPotential / nernstSlope(n, temperature);
}
