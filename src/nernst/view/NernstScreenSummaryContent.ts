/**
 * NernstScreenSummaryContent.ts
 *
 * Screen summary for the Nernst screen. The current-details paragraph is live: Q and log Q, E°
 * and E, and which way the reaction as written goes.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { fixed, formatPotential, fromLog } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { NernstModel } from "../model/NernstModel.js";
import { type NernstState, verdictOf } from "./NernstScreenView.js";

export class NernstScreenSummaryContent extends ScreenSummaryContent {
  public constructor(_model: NernstModel, stateProperty: TReadOnlyProperty<NernstState>) {
    const a11y = StringManager.getInstance().getNernstA11yStrings();
    const strings = StringManager.getInstance().getNernstStrings();

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty([stateProperty, localeProperty], (state) => {
      const verdict = verdictOf(state.potential);
      return StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
        q: fromLog(state.logQ, 3),
        logQ: fixed(state.logQ, 2),
        standard: formatPotential(state.standardPotential),
        value: formatPotential(state.potential),
        verdict:
          verdict === "spontaneous"
            ? strings.spontaneousStringProperty.value
            : verdict === "nonSpontaneous"
              ? strings.nonSpontaneousStringProperty.value
              : strings.atEquilibriumStringProperty.value,
      });
    });

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
