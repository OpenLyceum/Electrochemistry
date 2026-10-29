/**
 * GalvanicCellScreenSummaryContent.ts
 *
 * Screen summary for the Galvanic Cell screen. The current-details paragraph is live: both
 * half-cells with their concentrations, the voltmeter reading, which electrode is the anode, and
 * the current.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import type { HalfCellState } from "../../common/model/ElectrochemicalCell.js";
import {
  formatConcentration,
  formatCurrent,
  formatPotential,
  halfCellNameProperty,
} from "../../common/view/formatValues.js";
import { CURRENT_THRESHOLD } from "../../ElectrochemistryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { GalvanicCellModel } from "../model/GalvanicCellModel.js";

export class GalvanicCellScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: GalvanicCellModel) {
    const a11y = StringManager.getInstance().getGalvanicCellA11yStrings();
    const cell = model.cell;
    const halfCellDescription = (state: HalfCellState) =>
      StringUtils.fillIn(a11y.halfCellPatternStringProperty.value, {
        name: halfCellNameProperty(state.halfCellProperty.value.id).value,
        concentration: formatConcentration(state.concentrationProperty.value),
      });

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [
        cell.left.halfCellProperty,
        cell.right.halfCellProperty,
        cell.left.concentrationProperty,
        cell.right.concentrationProperty,
        cell.voltmeterReadingProperty,
        cell.anodeSideProperty,
        cell.currentProperty,
        localeProperty,
      ],
      (_left, _right, _cl, _cr, reading, anodeSide, current) => {
        let state = a11y.noReactionStringProperty.value;
        if (anodeSide !== null) {
          const anode = cell.stateOf(anodeSide);
          const cathode = cell.stateOf(anodeSide === "left" ? "right" : "left");
          state = StringUtils.fillIn(a11y.anodeIsPatternStringProperty.value, {
            anode: halfCellNameProperty(anode.halfCellProperty.value.id).value,
            cathode: halfCellNameProperty(cathode.halfCellProperty.value.id).value,
          });
        }
        if (Math.abs(current) > CURRENT_THRESHOLD) {
          state += ` ${StringUtils.fillIn(a11y.currentPatternStringProperty.value, { value: formatCurrent(current) })}`;
        }
        return StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          left: halfCellDescription(cell.left),
          right: halfCellDescription(cell.right),
          voltage: formatPotential(reading),
          state,
        });
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
