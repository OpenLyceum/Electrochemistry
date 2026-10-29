/**
 * halfCellChoices.ts
 *
 * Menu items for choosing a half-cell: the name for screen readers, "Zinc: Zn²⁺/Zn" on screen.
 */

import { PatternStringProperty } from "scenerystack/axon";
import { StringManager } from "../../i18n/StringManager.js";
import { HALF_CELL_LIST, type HalfCell } from "../model/HalfCells.js";
import type { ComboChoice } from "./ControlFactory.js";
import { couple, halfCellNameProperty } from "./formatValues.js";

let choices: ComboChoice<HalfCell>[] | null = null;

/** Shared by every menu; the label Properties live as long as the sim. */
export function halfCellChoices(): readonly ComboChoice<HalfCell>[] {
  if (choices === null) {
    const pattern = StringManager.getInstance().getCommonStrings().halfCellMenuPatternStringProperty;
    choices = HALF_CELL_LIST.map((halfCell) => ({
      value: halfCell,
      label: halfCellNameProperty(halfCell.id),
      display: new PatternStringProperty(pattern, {
        name: halfCellNameProperty(halfCell.id),
        couple: couple(halfCell),
      }),
    }));
  }
  return choices;
}
