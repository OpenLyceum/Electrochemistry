/**
 * HalfCells.ts
 *
 * The half-cells a student can build a galvanic cell from. Each is one reduction half-reaction
 *
 *   ν Ox(aq) + n e⁻ → Red
 *
 * with its standard reduction potential at 25 °C. Metal half-cells are a strip of the metal in a
 * solution of its ion (ν = 1). The standard hydrogen electrode is a platinum electrode with H₂ at
 * 1 atm bubbling over it in an H⁺ solution (2 H⁺ + 2 e⁻ → H₂, ν = 2).
 *
 * Potentials: CRC Handbook of Chemistry and Physics, "Electrochemical Series" (the values
 * OpenStax Chemistry 2e reproduces in Appendix L). Molar masses: IUPAC 2021 standard atomic
 * weights.
 *
 * Formulas use RichText markup (<sup>, <sub>); `plain` forms use Unicode super/subscripts so they
 * can be spoken and shown in plain Text.
 */

export const HALF_CELL_IDS = ["mg", "al", "zn", "fe", "ni", "pb", "h2", "cu", "ag"] as const;
export type HalfCellId = (typeof HALF_CELL_IDS)[number];

export type HalfCell = {
  readonly id: HalfCellId;
  /** Oxidized species, e.g. "Cu<sup>2+</sup>". */
  readonly ion: string;
  readonly ionPlain: string;
  /** Reduced species, e.g. "Cu" or "H<sub>2</sub>". */
  readonly reduced: string;
  readonly reducedPlain: string;
  /** State of the reduced species: "s" for a metal, "g" for hydrogen. */
  readonly reducedState: "s" | "g";
  /** Electrons in the half-reaction as written, n. */
  readonly electrons: number;
  /** Moles of ion per n electrons, ν (1 for metals, 2 for H⁺). */
  readonly ionCoefficient: number;
  /** Standard reduction potential at 25 °C (V). */
  readonly standardPotential: number;
  /** Molar mass of the metal electrode (g/mol), or null for the inert platinum electrode. */
  readonly metalMolarMass: number | null;
};

const metal = (
  id: HalfCellId,
  symbol: string,
  charge: number,
  standardPotential: number,
  metalMolarMass: number,
): HalfCell => ({
  id,
  ion: `${symbol}<sup>${charge === 1 ? "" : charge}+</sup>`,
  ionPlain: `${symbol}${["", "⁺", "²⁺", "³⁺"][charge]}`,
  reduced: symbol,
  reducedPlain: symbol,
  reducedState: "s",
  electrons: charge,
  ionCoefficient: 1,
  standardPotential,
  metalMolarMass,
});

export const HALF_CELLS: Record<HalfCellId, HalfCell> = {
  mg: metal("mg", "Mg", 2, -2.372, 24.305),
  al: metal("al", "Al", 3, -1.662, 26.982),
  zn: metal("zn", "Zn", 2, -0.7618, 65.38),
  fe: metal("fe", "Fe", 2, -0.447, 55.845),
  ni: metal("ni", "Ni", 2, -0.257, 58.693),
  pb: metal("pb", "Pb", 2, -0.1262, 207.2),
  h2: {
    id: "h2",
    ion: "H<sup>+</sup>",
    ionPlain: "H⁺",
    reduced: "H<sub>2</sub>",
    reducedPlain: "H₂",
    reducedState: "g",
    electrons: 2,
    ionCoefficient: 2,
    standardPotential: 0,
    metalMolarMass: null,
  },
  cu: metal("cu", "Cu", 2, 0.3419, 63.546),
  ag: metal("ag", "Ag", 1, 0.7996, 107.868),
};

/** Half-cells in the order of the menus: most negative potential first. */
export const HALF_CELL_LIST: readonly HalfCell[] = HALF_CELL_IDS.map((id) => HALF_CELLS[id]);

/** True for the hydrogen electrode, whose electrode is inert platinum. */
export function isGasElectrode(halfCell: HalfCell): boolean {
  return halfCell.metalMolarMass === null;
}
