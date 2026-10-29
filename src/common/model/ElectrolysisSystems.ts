/**
 * ElectrolysisSystems.ts
 *
 * The electrolytic cells of the Electrolysis screen. Each pairs an electrolyte with electrodes and
 * says what forms at each electrode and how many electrons that takes:
 *
 *   copperPlating  CuSO₄(aq), copper electrodes: Cu plates the cathode, the anode dissolves; 0 V
 *   silverPlating  AgNO₃(aq), silver anode, steel spoon cathode: Ag plates the spoon; 0 V
 *   copperChloride CuCl₂(aq), graphite electrodes: Cu at the cathode, Cl₂ at the anode
 *   water          Na₂SO₄(aq), platinum electrodes: H₂ at the cathode, O₂ at the anode, 2 : 1
 *
 * The minimum (decomposition) voltage is the standard potential of the reverse galvanic cell,
 * from the same CRC table as HalfCells.ts (Cl₂/Cl⁻ 1.358 V, O₂/H₂O 1.229 V). Overpotentials are
 * ignored: real water electrolysis needs nearer 1.8 V than 1.23 V.
 */

import { FARADAY } from "../../ElectrochemistryConstants.js";

export const ELECTROLYSIS_SYSTEM_IDS = ["copperPlating", "silverPlating", "copperChloride", "water"] as const;
export type ElectrolysisSystemId = (typeof ELECTROLYSIS_SYSTEM_IDS)[number];

export type ElectrodeMaterial = "copper" | "silver" | "steel" | "graphite" | "platinum";

/** A product of one electrode: a metal (plated or dissolved) or a gas. */
export type ElectrodeProduct =
  | {
      readonly kind: "metal";
      readonly formula: string;
      /** Electrons per atom. */
      readonly electrons: number;
      readonly molarMass: number;
      /** The anode metal dissolves (mass lost) instead of plating (mass gained). */
      readonly dissolves: boolean;
    }
  | {
      readonly kind: "gas";
      /** RichText formula, e.g. "H<sub>2</sub>". */
      readonly formula: string;
      readonly formulaPlain: string;
      /** Electrons per molecule. */
      readonly electrons: number;
    };

export type ElectrolysisSystem = {
  readonly id: ElectrolysisSystemId;
  /** RichText formula of the dissolved salt. */
  readonly electrolyte: string;
  readonly electrolytePlain: string;
  readonly anodeMaterial: ElectrodeMaterial;
  readonly cathodeMaterial: ElectrodeMaterial;
  /** Half-reactions and overall reaction (RichText). */
  readonly cathodeReaction: string;
  readonly anodeReaction: string;
  readonly overallReaction: string;
  readonly cathodeProduct: ElectrodeProduct;
  readonly anodeProduct: ElectrodeProduct;
  /** Standard decomposition voltage (V). */
  readonly minimumVoltage: number;
  /** Resistance of the electrolyte between the electrodes (Ω). */
  readonly resistance: number;
  /** Initial concentration of the salt (M). */
  readonly concentration: number;
  /**
   * The cation reduced at the cathode is used up (CuCl₂) rather than replaced by the anode
   * (plating) or not involved at all (water).
   */
  readonly consumesCation: boolean;
  /** Colour of the solution: copper(II) solutions are blue. */
  readonly tint: "copper" | "none";
};

const E = "e<sup>−</sup>";

export const ELECTROLYSIS_SYSTEMS: Record<ElectrolysisSystemId, ElectrolysisSystem> = {
  copperPlating: {
    id: "copperPlating",
    electrolyte: "CuSO<sub>4</sub>",
    electrolytePlain: "CuSO₄",
    anodeMaterial: "copper",
    cathodeMaterial: "copper",
    cathodeReaction: `Cu<sup>2+</sup>(aq) + 2${E} → Cu(s)`,
    anodeReaction: `Cu(s) → Cu<sup>2+</sup>(aq) + 2${E}`,
    overallReaction: "Cu(s, anode) → Cu(s, cathode)",
    cathodeProduct: { kind: "metal", formula: "Cu", electrons: 2, molarMass: 63.546, dissolves: false },
    anodeProduct: { kind: "metal", formula: "Cu", electrons: 2, molarMass: 63.546, dissolves: true },
    minimumVoltage: 0,
    resistance: 2,
    concentration: 0.5,
    consumesCation: false,
    tint: "copper",
  },
  silverPlating: {
    id: "silverPlating",
    electrolyte: "AgNO<sub>3</sub>",
    electrolytePlain: "AgNO₃",
    anodeMaterial: "silver",
    cathodeMaterial: "steel",
    cathodeReaction: `Ag<sup>+</sup>(aq) + ${E} → Ag(s)`,
    anodeReaction: `Ag(s) → Ag<sup>+</sup>(aq) + ${E}`,
    overallReaction: "Ag(s, anode) → Ag(s, spoon)",
    cathodeProduct: { kind: "metal", formula: "Ag", electrons: 1, molarMass: 107.868, dissolves: false },
    anodeProduct: { kind: "metal", formula: "Ag", electrons: 1, molarMass: 107.868, dissolves: true },
    minimumVoltage: 0,
    resistance: 2,
    concentration: 0.1,
    consumesCation: false,
    tint: "none",
  },
  copperChloride: {
    id: "copperChloride",
    electrolyte: "CuCl<sub>2</sub>",
    electrolytePlain: "CuCl₂",
    anodeMaterial: "graphite",
    cathodeMaterial: "graphite",
    cathodeReaction: `Cu<sup>2+</sup>(aq) + 2${E} → Cu(s)`,
    anodeReaction: `2Cl<sup>−</sup>(aq) → Cl<sub>2</sub>(g) + 2${E}`,
    overallReaction: "Cu<sup>2+</sup>(aq) + 2Cl<sup>−</sup>(aq) → Cu(s) + Cl<sub>2</sub>(g)",
    cathodeProduct: { kind: "metal", formula: "Cu", electrons: 2, molarMass: 63.546, dissolves: false },
    anodeProduct: { kind: "gas", formula: "Cl<sub>2</sub>", formulaPlain: "Cl₂", electrons: 2 },
    minimumVoltage: 1.358 - 0.3419,
    resistance: 2,
    concentration: 0.5,
    consumesCation: true,
    tint: "copper",
  },
  water: {
    id: "water",
    electrolyte: "Na<sub>2</sub>SO<sub>4</sub>",
    electrolytePlain: "Na₂SO₄",
    anodeMaterial: "platinum",
    cathodeMaterial: "platinum",
    cathodeReaction: `4H<sub>2</sub>O(l) + 4${E} → 2H<sub>2</sub>(g) + 4OH<sup>−</sup>(aq)`,
    anodeReaction: `2H<sub>2</sub>O(l) → O<sub>2</sub>(g) + 4H<sup>+</sup>(aq) + 4${E}`,
    overallReaction: "2H<sub>2</sub>O(l) → 2H<sub>2</sub>(g) + O<sub>2</sub>(g)",
    cathodeProduct: { kind: "gas", formula: "H<sub>2</sub>", formulaPlain: "H₂", electrons: 2 },
    anodeProduct: { kind: "gas", formula: "O<sub>2</sub>", formulaPlain: "O₂", electrons: 4 },
    minimumVoltage: 1.229,
    resistance: 10,
    concentration: 0.5,
    consumesCation: false,
    tint: "none",
  },
};

export const ELECTROLYSIS_SYSTEM_LIST: readonly ElectrolysisSystem[] = ELECTROLYSIS_SYSTEM_IDS.map(
  (id) => ELECTROLYSIS_SYSTEMS[id],
);

/** Moles of a product formed (or metal dissolved) when `charge` coulombs pass: Q / (nF). */
export function productMoles(product: ElectrodeProduct, charge: number): number {
  return charge / (product.electrons * FARADAY);
}
