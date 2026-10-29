/**
 * GalvanicCellKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Galvanic Cell screen: the half-cell menus and time controls on the
 * left; buttons and checkboxes (salt bridge, light bulb, display options) on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class GalvanicCellKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new ComboBoxKeyboardHelpSection(), new TimeControlsKeyboardHelpSection()],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
