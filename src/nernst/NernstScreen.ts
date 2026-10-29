/**
 * NernstScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createNernstIcon() in src/common/ElectrochemistryScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createNernstIcon } from "../common/ElectrochemistryScreenIcons.js";
import ElectrochemistryColors from "../ElectrochemistryColors.js";
import { NernstModel } from "./model/NernstModel.js";
import { NernstKeyboardHelpContent } from "./view/NernstKeyboardHelpContent.js";
import { NernstScreenView } from "./view/NernstScreenView.js";

type SelfOptions = {
  /** Draw conventional current as well as electrons (Preferences). */
  conventionalCurrentProperty: TReadOnlyProperty<boolean>;
};

// Require tandem to be explicit — accidental omission would break PhET-iO.
type NernstScreenOptions = SelfOptions & ScreenOptions & { tandem: Tandem };

export class NernstScreen extends Screen<NernstModel, NernstScreenView> {
  public constructor(options: NernstScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new NernstModel(),
      // View factory — receives the model instance
      (model) =>
        new NernstScreenView(model, {
          conventionalCurrentProperty: options.conventionalCurrentProperty,
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<NernstScreenOptions, SelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ElectrochemistryColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new NernstKeyboardHelpContent(),
          homeScreenIcon: createNernstIcon(),
          navigationBarIcon: createNernstIcon(),
        },
        options,
      ),
    );
  }
}
