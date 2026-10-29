/**
 * halfCellColors.ts
 *
 * Colours of each half-cell's electrode, ions and solution, and of electrolysis electrodes.
 */

import type { ProfileColorProperty } from "scenerystack/scenery";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";
import type { ElectrodeMaterial } from "../model/ElectrolysisSystems.js";
import type { HalfCell, HalfCellId } from "../model/HalfCells.js";

const METAL_COLORS: Record<HalfCellId, ProfileColorProperty> = {
  mg: ElectrochemistryColors.magnesiumColorProperty,
  al: ElectrochemistryColors.aluminumColorProperty,
  zn: ElectrochemistryColors.zincColorProperty,
  fe: ElectrochemistryColors.ironColorProperty,
  ni: ElectrochemistryColors.nickelColorProperty,
  pb: ElectrochemistryColors.leadColorProperty,
  h2: ElectrochemistryColors.platinumColorProperty,
  cu: ElectrochemistryColors.copperColorProperty,
  ag: ElectrochemistryColors.silverColorProperty,
};

/** Electrode colour (platinum for the hydrogen electrode). */
export function electrodeColor(halfCell: HalfCell): ProfileColorProperty {
  return METAL_COLORS[halfCell.id];
}

/** Colour of the half-cell's ions in the particle view. */
export function ionColor(halfCell: HalfCell): ProfileColorProperty {
  return halfCell.id === "h2" ? ElectrochemistryColors.bubbleColorProperty : METAL_COLORS[halfCell.id];
}

/** Tint of a 1 M solution of the ion, or null for a colourless ion. */
export function solutionTint(halfCell: HalfCell): ProfileColorProperty | null {
  return halfCell.id === "cu"
    ? ElectrochemistryColors.copperTintColorProperty
    : halfCell.id === "ni"
      ? ElectrochemistryColors.nickelTintColorProperty
      : halfCell.id === "fe"
        ? ElectrochemistryColors.ironTintColorProperty
        : null;
}

const MATERIAL_COLORS: Record<ElectrodeMaterial, ProfileColorProperty> = {
  copper: ElectrochemistryColors.copperColorProperty,
  silver: ElectrochemistryColors.silverColorProperty,
  steel: ElectrochemistryColors.steelColorProperty,
  graphite: ElectrochemistryColors.graphiteColorProperty,
  platinum: ElectrochemistryColors.platinumColorProperty,
};

export function materialColor(material: ElectrodeMaterial): ProfileColorProperty {
  return MATERIAL_COLORS[material];
}
