/**
 * formatValues.ts
 *
 * Number formats, names and chemical notation shared by the screens. Formulas and reactions are
 * RichText markup (<sup>, <sub>); readouts that also feed screen-reader descriptions are plain
 * text with Unicode superscripts.
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElectrolysisSystemId } from "../model/ElectrolysisSystems.js";
import type { HalfCell, HalfCellId } from "../model/HalfCells.js";
import { electronsTransferred } from "../model/Nernst.js";

const MINUS = "−";
const SUPERSCRIPTS: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

/** Typed lookup in a getNestedStringProperties group (keys are suffixed "StringProperty"). */
function lookup<K extends string>(group: object, key: K): ReadOnlyProperty<string> {
  return (group as Record<string, ReadOnlyProperty<string>>)[`${key}StringProperty`] as ReadOnlyProperty<string>;
}

// ── Numbers ───────────────────────────────────────────────────────────────────

/** Fixed decimals with a true minus sign. */
export function fixed(value: number, decimals: number): string {
  const text = toFixed(value, decimals);
  // Avoid "−0.000" for tiny negatives.
  return Number(text) === 0 ? text.replace("-", "") : text.replace("-", MINUS);
}

/** Fixed decimals with an explicit sign: "+0.34", "−0.76". */
export function signed(value: number, decimals: number): string {
  const text = fixed(value, decimals);
  return value > 0 && Number(toFixed(value, decimals)) !== 0 ? `+${text}` : text;
}

function superscript(exponent: number): string {
  return String(exponent)
    .split("")
    .map((c) => SUPERSCRIPTS[c] ?? c)
    .join("");
}

/**
 * A positive number given by its base-10 log, so values like K = 10¹⁰⁷ never overflow. Plain
 * decimals between 0.01 and 1000; otherwise "2.0 × 10³⁷".
 */
export function fromLog(log10: number, significant = 3): string {
  if (log10 >= -2 && log10 < 3) {
    const value = 10 ** log10;
    const decimals = Math.max(0, significant - 1 - Math.floor(log10));
    return fixed(value, decimals);
  }
  let exponent = Math.floor(log10);
  let mantissa = 10 ** (log10 - exponent);
  if (Number(toFixed(mantissa, significant - 1)) >= 10) {
    mantissa /= 10;
    exponent += 1;
  }
  return `${fixed(mantissa, significant - 1)} × 10${superscript(exponent)}`;
}

/** A concentration in M with three significant figures (scientific below 0.001 M). */
export function formatConcentration(concentration: number): string {
  return concentration >= 0.001 ? fromLog(Math.log10(concentration), 3) : fromLog(Math.log10(concentration), 2);
}

export function formatPotential(potential: number): string {
  return fixed(potential, 3);
}

export function formatCurrent(current: number): string {
  return fixed(Math.abs(current), 3);
}

export function formatMass(mass: number): string {
  return fixed(mass, 3);
}

/** Simulated time in hours, e.g. "2.45 h". */
export function formatHours(seconds: number): string {
  return StringUtils.fillIn(StringManager.getInstance().getCommonStrings().hoursPatternStringProperty.value, {
    value: fixed(seconds / 3600, 2),
  });
}

/** Simulated time as minutes and seconds, e.g. "12 min 30 s". */
export function formatMinutes(seconds: number): string {
  const whole = Math.floor(seconds);
  return StringUtils.fillIn(StringManager.getInstance().getCommonStrings().minutesPatternStringProperty.value, {
    minutes: Math.floor(whole / 60),
    seconds: whole % 60,
  });
}

// ── Names ─────────────────────────────────────────────────────────────────────

export function halfCellNameProperty(id: HalfCellId): ReadOnlyProperty<string> {
  return lookup(StringManager.getInstance().getHalfCellNames(), id);
}

export function systemNameProperty(id: ElectrolysisSystemId): ReadOnlyProperty<string> {
  return lookup(StringManager.getInstance().getSystemNames(), id);
}

// ── Chemical notation (RichText) ──────────────────────────────────────────────

const ELECTRON = "e<sup>−</sup>";

function coefficient(value: number): string {
  return value === 1 ? "" : String(value);
}

function electrons(n: number): string {
  return `${coefficient(n)}${ELECTRON}`;
}

/** The redox couple for menus: "Zn<sup>2+</sup>/Zn". */
export function couple(halfCell: HalfCell): string {
  return `${halfCell.ion}/${halfCell.reduced}`;
}

function ionTerm(halfCell: HalfCell, multiplier = 1): string {
  return `${coefficient(halfCell.ionCoefficient * multiplier)}${halfCell.ion}(aq)`;
}

function reducedTerm(halfCell: HalfCell, multiplier = 1): string {
  return `${coefficient(multiplier)}${halfCell.reduced}(${halfCell.reducedState})`;
}

/** Reduction half-reaction: "Cu<sup>2+</sup>(aq) + 2e<sup>−</sup> → Cu(s)". */
export function reductionReaction(halfCell: HalfCell): string {
  return `${ionTerm(halfCell)} + ${electrons(halfCell.electrons)} → ${reducedTerm(halfCell)}`;
}

/** Oxidation half-reaction: "Zn(s) → Zn<sup>2+</sup>(aq) + 2e<sup>−</sup>". */
export function oxidationReaction(halfCell: HalfCell): string {
  return `${reducedTerm(halfCell)} → ${ionTerm(halfCell)} + ${electrons(halfCell.electrons)}`;
}

/** Balanced overall reaction, anode's reactant first: "Zn(s) + Cu<sup>2+</sup>(aq) → Zn<sup>2+</sup>(aq) + Cu(s)". */
export function overallReaction(cathode: HalfCell, anode: HalfCell): string {
  const n = electronsTransferred(cathode, anode);
  const cathodeMultiplier = n / cathode.electrons;
  const anodeMultiplier = n / anode.electrons;
  return (
    `${reducedTerm(anode, anodeMultiplier)} + ${ionTerm(cathode, cathodeMultiplier)} → ` +
    `${ionTerm(anode, anodeMultiplier)} + ${reducedTerm(cathode, cathodeMultiplier)}`
  );
}

/** Shorthand cell notation, anode on the left: "Zn(s) | Zn<sup>2+</sup>(aq, 1.00 M) || …". */
export function cellNotation(
  anode: HalfCell,
  anodeConcentration: number,
  cathode: HalfCell,
  cathodeConcentration: number,
): string {
  const ion = (halfCell: HalfCell, concentration: number) =>
    `${halfCell.ion}(aq, ${formatConcentration(concentration)} M)`;
  const anodeSide =
    anode.metalMolarMass === null
      ? `Pt(s) | ${anode.reduced}(g, 1 atm) | ${ion(anode, anodeConcentration)}`
      : `${anode.reduced}(s) | ${ion(anode, anodeConcentration)}`;
  const cathodeSide =
    cathode.metalMolarMass === null
      ? `${ion(cathode, cathodeConcentration)} | ${cathode.reduced}(g, 1 atm) | Pt(s)`
      : `${ion(cathode, cathodeConcentration)} | ${cathode.reduced}(s)`;
  return `${anodeSide} || ${cathodeSide}`;
}

function bracket(halfCell: HalfCell, power: number, subscript = ""): string {
  const sub = subscript ? `<sub>${subscript}</sub>` : "";
  return `[${halfCell.ion}]${sub}${power === 1 ? "" : `<sup>${power}</sup>`}`;
}

/**
 * The reaction-quotient expression with the anode's ion over the cathode's:
 * "[Zn<sup>2+</sup>] / [Cu<sup>2+</sup>]". For a concentration cell the two brackets are told apart
 * by subscripts.
 */
export function quotientExpression(
  cathode: HalfCell,
  anode: HalfCell,
  anodeSubscript: string,
  cathodeSubscript: string,
): string {
  const n = electronsTransferred(cathode, anode);
  const same = cathode.id === anode.id;
  return (
    `${bracket(anode, (anode.ionCoefficient * n) / anode.electrons, same ? anodeSubscript : "")} / ` +
    `${bracket(cathode, (cathode.ionCoefficient * n) / cathode.electrons, same ? cathodeSubscript : "")}`
  );
}
