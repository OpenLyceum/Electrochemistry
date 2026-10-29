/**
 * ElectrochemistryPanel.ts
 *
 * A pre-themed Panel that automatically uses ElectrochemistryColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { ElectrochemistryPanel } from "../../common/ElectrochemistryPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new ElectrochemistryPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new ElectrochemistryPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new ElectrochemistryPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import ElectrochemistryColors from "../ElectrochemistryColors.js";
import { PANEL_CORNER_RADIUS } from "../ElectrochemistryConstants.js";

export type ElectrochemistryPanelOptions = PanelOptions;

export class ElectrochemistryPanel extends Panel {
  public constructor(content: Node, providedOptions?: ElectrochemistryPanelOptions) {
    const options = optionize<ElectrochemistryPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: ElectrochemistryColors.panelBackgroundColorProperty,
        stroke: ElectrochemistryColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
