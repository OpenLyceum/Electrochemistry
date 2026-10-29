/**
 * ElectrolysisScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createElectrolysisIcon() in src/common/ElectrochemistryScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createElectrolysisIcon } from "../common/ElectrochemistryScreenIcons.js";
import ElectrochemistryColors from "../ElectrochemistryColors.js";
import { ElectrolysisModel } from "./model/ElectrolysisModel.js";
import { ElectrolysisKeyboardHelpContent } from "./view/ElectrolysisKeyboardHelpContent.js";
import { ElectrolysisScreenView } from "./view/ElectrolysisScreenView.js";

type SelfOptions = {
  /** Draw conventional current as well as electrons (Preferences). */
  conventionalCurrentProperty: TReadOnlyProperty<boolean>;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ElectrolysisScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class ElectrolysisScreen extends Screen<ElectrolysisModel, ElectrolysisScreenView> {
  public constructor(options: ElectrolysisScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ElectrolysisModel(),
      // View factory — receives the model instance
      (model) =>
        new ElectrolysisScreenView(model, {
          conventionalCurrentProperty: options.conventionalCurrentProperty,
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ElectrolysisScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ElectrochemistryColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ElectrolysisKeyboardHelpContent(),
          homeScreenIcon: createElectrolysisIcon(),
          navigationBarIcon: createElectrolysisIcon(),
        },
        options,
      ),
    );
  }
}
