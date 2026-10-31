/**
 * ElectrolysisScreenSummaryContent.ts
 *
 * Screen summary for the Electrolysis screen. The current-details paragraph is live: the cell, the
 * supply setting, the current, the charge passed and what has formed at each electrode.
 */

import { DerivedProperty } from "scenerystack/axon";
import { localeProperty } from "scenerystack/joist";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { fixed, formatCurrent, formatMinutes, systemNameProperty } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElectrolysisModel } from "../model/ElectrolysisModel.js";
import { productReadout } from "./ElectrolysisScreenView.js";

export class ElectrolysisScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ElectrolysisModel) {
    const a11y = StringManager.getInstance().getElectrolysisA11yStrings();

    // Lives as long as the screen, which is never disposed.
    const currentDetailsProperty = new DerivedProperty(
      [
        model.systemProperty,
        model.voltageProperty,
        model.powerOnProperty,
        model.currentProperty,
        model.chargeProperty,
        model.elapsedTimeProperty,
        localeProperty,
      ],
      (system, voltage, on, current, charge, elapsed) => {
        const products = [
          productReadout(
            system.cathodeProduct,
            true,
            model.cathodeMassProperty.value,
            model.cathodeGasVolumeProperty.value,
            true,
            system.cathodeMaterial,
          ),
          productReadout(
            system.anodeProduct,
            false,
            model.anodeMassProperty.value,
            model.anodeGasVolumeProperty.value,
            true,
            system.anodeMaterial,
          ),
        ].join(". ");
        return StringUtils.fillIn(a11y.currentDetailsPatternStringProperty.value, {
          system: systemNameProperty(system.id).value,
          voltage: fixed(voltage, 2),
          power: on ? a11y.powerOnStateStringProperty.value : a11y.powerOffStateStringProperty.value,
          current: formatCurrent(current),
          charge: fixed(charge, 0),
          time: formatMinutes(elapsed),
          products: `${products}.`,
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
