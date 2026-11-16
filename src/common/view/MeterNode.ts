import { METER_NODE_SETTINGS } from "../../ElectrochemistryConstants.js";
/**
 * MeterNode.ts
 *
 * A digital meter: dark case, LCD display, and two terminals (black on the left, red on the
 * right). Used for the voltmeter and the power supply's displays.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Circle, Node, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";

export type MeterNodeOptions = {
  width?: number;
  /** Readouts shown one above the other on the display. */
  lines: readonly TReadOnlyProperty<string>[];
  /** Caption under the display (RichText), e.g. "V". */
  caption?: TReadOnlyProperty<string> | string;
  /** Terminal labels. */
  blackLabel?: string;
  redLabel?: string;
};

export class MeterNode extends Node {
  /** Terminal centres in this node's coordinates. */
  public readonly blackTerminal: Vector2;
  public readonly redTerminal: Vector2;

  public constructor(options: MeterNodeOptions) {
    super();
    const width = options.width ?? 116;
    const readouts = new VBox({
      align: "right",
      spacing: 1,
      children: options.lines.map(
        (line) =>
          new Text(line, {
            font: new PhetFont({ size: METER_NODE_SETTINGS.READOUTS_FONT_SIZE, family: "monospace", weight: "bold" }),
            fill: ElectrochemistryColors.meterTextColorProperty,
            maxWidth: width - METER_NODE_SETTINGS.READOUTS_MAX_WIDTH_OFFSET,
          }),
      ),
    });
    const screenHeight = readouts.height + 8;
    const screen = new Rectangle(
      0,
      0,
      width - 16,
      screenHeight,
      METER_NODE_SETTINGS.SCREEN_CORNER_X,
      METER_NODE_SETTINGS.SCREEN_CORNER_Y,
      {
        fill: ElectrochemistryColors.meterScreenColorProperty,
        x: METER_NODE_SETTINGS.SCREEN_X,
        y: METER_NODE_SETTINGS.SCREEN_Y,
      },
    );
    // Readouts change width as their text changes; keep them right-aligned on the display.
    readouts.boundsProperty.link(() => {
      readouts.right = screen.right - METER_NODE_SETTINGS.CONSTRUCTOR_RIGHT_OFFSET;
      readouts.centerY = screen.centerY;
    });
    const caption = options.caption
      ? new RichText(options.caption, {
          font: new PhetFont(METER_NODE_SETTINGS.CAPTION_FONT_SIZE),
          fill: ElectrochemistryColors.controlSurfaceColorProperty,
          maxWidth: width * METER_NODE_SETTINGS.CAPTION_MAX_WIDTH_FACTOR - METER_NODE_SETTINGS.CAPTION_MAX_WIDTH_OFFSET,
        })
      : null;
    const bodyHeight = screen.bottom + 30;
    const body = new Rectangle(
      0,
      0,
      width,
      bodyHeight,
      METER_NODE_SETTINGS.BODY_CORNER_X,
      METER_NODE_SETTINGS.BODY_CORNER_Y,
      {
        fill: ElectrochemistryColors.meterBodyColorProperty,
        stroke: ElectrochemistryColors.panelBorderColorProperty,
      },
    );
    this.blackTerminal = new Vector2(width * 0.22, bodyHeight - 9);
    this.redTerminal = new Vector2(width * 0.78, bodyHeight - 9);
    const terminal = (
      center: Vector2,
      fill: TReadOnlyProperty<never> | typeof ElectrochemistryColors.redLeadColorProperty,
    ) =>
      new Circle(METER_NODE_SETTINGS.TERMINAL_RADIUS, {
        fill,
        stroke: ElectrochemistryColors.panelBorderColorProperty,
        center,
      });
    const terminalLabel = (text: string | undefined, center: Vector2) =>
      new Text(text ?? "", {
        font: new PhetFont(METER_NODE_SETTINGS.TERMINAL_LABEL_FONT_SIZE),
        fill: ElectrochemistryColors.controlSurfaceColorProperty,
        centerX: center.x,
        bottom: center.y - METER_NODE_SETTINGS.TERMINAL_LABEL_BOTTOM_OFFSET,
      });
    const children: Node[] = [
      body,
      screen,
      readouts,
      terminal(this.blackTerminal, ElectrochemistryColors.blackLeadColorProperty),
      terminal(this.redTerminal, ElectrochemistryColors.redLeadColorProperty),
      terminalLabel(options.blackLabel, this.blackTerminal),
      terminalLabel(options.redLabel, this.redTerminal),
    ];
    if (caption) {
      // Between the terminals, level with them.
      caption.centerX = width / 2;
      caption.centerY = this.blackTerminal.y - 2;
      children.push(caption);
    }
    this.children = children;
  }
}
