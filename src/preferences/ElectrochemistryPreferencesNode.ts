/**
 * ElectrochemistryPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to ElectrochemistryPreferencesModel Properties (whose initial values come from
 * electrochemistryQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import ElectrochemistryColors from "../ElectrochemistryColors.js";
import ElectrochemistryNamespace from "../ElectrochemistryNamespace.js";
import { StringManager } from "../i18n/StringManager.js";
import type { ElectrochemistryPreferencesModel } from "./ElectrochemistryPreferencesModel.js";

export class ElectrochemistryPreferencesNode extends VBox {
  public constructor(preferencesModel: ElectrochemistryPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: ElectrochemistryColors.controlSurfaceTextColorProperty,
    });

    const conventionalCurrentCheckbox = new Checkbox(
      preferencesModel.conventionalCurrentProperty,
      new Text(prefStrings.conventionalCurrentStringProperty, {
        font: new PhetFont(14),
        fill: ElectrochemistryColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: ElectrochemistryColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: ElectrochemistryColors.controlSurfaceColorProperty,
        spacing: 8,
        ...(tandem && { tandem: tandem.createTandem("conventionalCurrentCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, conventionalCurrentCheckbox],
    });
  }
}

ElectrochemistryNamespace.register("ElectrochemistryPreferencesNode", ElectrochemistryPreferencesNode);
