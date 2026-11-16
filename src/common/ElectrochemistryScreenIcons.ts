import { ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS } from "../ElectrochemistryConstants.js";
/**
 * ElectrochemistryScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen, drawn on the standard
 * 548 × 373 canvas with ElectrochemistryColors:
 *   Galvanic Cell – two beakers joined by a salt bridge, with a lit bulb on the wire
 *   Nernst        – the falling Nernst line with the standard and present points
 *   Electrolysis  – a power supply over a beaker with gas collecting in two tubes, 2 : 1
 */

import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import ElectrochemistryColors from "../ElectrochemistryColors.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: ElectrochemistryColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: ElectrochemistryColors.backgroundColorProperty,
  });
}

function beaker(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: typeof ElectrochemistryColors.waterColorProperty,
): Node {
  return new Node({
    children: [
      new Rectangle(x + 3, y + height * 0.2, width - 6, height * 0.8 - 3, { fill }),
      new Path(
        new Shape()
          .moveTo(x, y)
          .lineTo(x, y + height)
          .lineTo(x + width, y + height)
          .lineTo(x + width, y),
        {
          stroke: ElectrochemistryColors.glassColorProperty,
          lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.BEAKER_LINE_WIDTH,
        },
      ),
    ],
  });
}

export function createGalvanicCellIcon(): ScreenIcon {
  const wire = {
    stroke: ElectrochemistryColors.wireColorProperty,
    lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.WIRE_LINE_WIDTH,
  };
  return iconFrom(
    new Node({
      children: [
        background(),
        beaker(
          40,
          180,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_WIDTH_SEGMENT_2,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_HEIGHT_SEGMENT_2,
          ElectrochemistryColors.waterColorProperty,
        ),
        beaker(
          328,
          180,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_WIDTH_SEGMENT_2,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_HEIGHT_SEGMENT_2,
          ElectrochemistryColors.copperTintColorProperty,
        ),
        new Path(
          new Shape()
            .moveTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_LINE_TO_Y,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_SEGMENT_2,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_2,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_SEGMENT_2,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y,
            ),
          {
            stroke: ElectrochemistryColors.saltBridgeColorProperty,
            lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_LINE_WIDTH,
          },
        ),
        new Rectangle(
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_SEGMENT_3,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_3,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_WIDTH,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_HEIGHT,
          { fill: ElectrochemistryColors.zincColorProperty },
        ),
        new Rectangle(
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_SEGMENT_4,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_3,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_WIDTH,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_HEIGHT,
          { fill: ElectrochemistryColors.copperColorProperty },
        ),
        new Path(
          new Shape()
            .moveTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_SEGMENT_5,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_3,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_SEGMENT_5,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_4,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_SEGMENT_6,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_4,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_X_SEGMENT_6,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_5,
            ),
          wire,
        ),
        new Circle(ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_RADIUS, {
          fill: ElectrochemistryColors.bulbOnColorProperty,
          opacity: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_OPACITY,
          x: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_ITEM_8_X,
          y: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_ITEM_8_Y,
        }),
        new Circle(ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_RADIUS_SEGMENT_2, {
          fill: ElectrochemistryColors.bulbOnColorProperty,
          x: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_ITEM_9_X,
          y: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_ITEM_9_Y,
        }),
        ...[150, 210, 330, 390].map(
          (x) =>
            new Circle(ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_RADIUS_SEGMENT_3, {
              fill: ElectrochemistryColors.electronColorProperty,
              x,
              y: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_GALVANIC_CELL_ICON_ITEM_10_Y,
            }),
        ),
      ],
    }),
  );
}

export function createNernstIcon(): ScreenIcon {
  const left: number = ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.LEFT;
  const right: number = ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.RIGHT;
  const top: number = ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TOP;
  const bottom: number = ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.BOTTOM;
  const zeroY = 250;
  return iconFrom(
    new Node({
      children: [
        background(),
        new Rectangle(left, top, right - left, bottom - top, {
          fill: ElectrochemistryColors.chartBackgroundColorProperty,
          stroke: ElectrochemistryColors.chartAxisColorProperty,
          lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_LINE_WIDTH,
        }),
        new Line(left, zeroY, right, zeroY, {
          stroke: ElectrochemistryColors.zeroLineColorProperty,
          lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_LINE_WIDTH,
          lineDash: [ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_LINE_DASH_DASH, 10],
        }),
        new Line(
          left,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_START_Y,
          right,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_END_Y,
          {
            stroke: ElectrochemistryColors.nernstLineColorProperty,
            lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_ITEM_4_LINE_WIDTH,
          },
        ),
        new Circle(ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_RADIUS, {
          stroke: ElectrochemistryColors.standardPointColorProperty,
          lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_ITEM_5_LINE_WIDTH,
          x: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_X,
          y: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_Y,
        }),
        new Path(Shape.regularPolygon(4, 20), {
          fill: ElectrochemistryColors.equilibriumPointColorProperty,
          x: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_ITEM_6_X,
          y: zeroY,
        }),
        new Circle(ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_RADIUS_SEGMENT_2, {
          fill: ElectrochemistryColors.currentPointColorProperty,
          x: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_ITEM_7_X,
          y: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_NERNST_ICON_ITEM_7_Y,
        }),
      ],
    }),
  );
}

export function createElectrolysisIcon(): ScreenIcon {
  const tube = (x: number, gasHeight: number) =>
    new Node({
      children: [
        new Rectangle(
          x - 26,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_Y,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_WIDTH,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_HEIGHT,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_CORNER_X,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_CORNER_Y,
          { fill: ElectrochemistryColors.waterColorProperty },
        ),
        new Rectangle(
          x - 24,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_Y_SEGMENT_2,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_WIDTH_SEGMENT_2,
          gasHeight,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_CORNER_X_SEGMENT_2,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_CORNER_Y_SEGMENT_2,
          { fill: ElectrochemistryColors.bubbleColorProperty },
        ),
        new Rectangle(
          x - 26,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_Y,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_WIDTH,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_HEIGHT,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_CORNER_X,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_CORNER_Y,
          {
            stroke: ElectrochemistryColors.glassColorProperty,
            lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.TUBE_LINE_WIDTH,
          },
        ),
      ],
    });
  return iconFrom(
    new Node({
      children: [
        background(),
        beaker(
          80,
          200,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_WIDTH_SEGMENT_2,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_HEIGHT_SEGMENT_2,
          ElectrochemistryColors.waterColorProperty,
        ),
        tube(184, ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_GAS_HEIGHT),
        tube(364, ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_GAS_HEIGHT_SEGMENT_2),
        new Rectangle(
          184 - 12,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_WIDTH,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_HEIGHT,
          { fill: ElectrochemistryColors.platinumColorProperty },
        ),
        new Rectangle(
          364 - 12,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_WIDTH,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_HEIGHT,
          { fill: ElectrochemistryColors.platinumColorProperty },
        ),
        new Path(
          new Shape()
            .moveTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_MOVE_TO_Y,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_2,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_2,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_2,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_3,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_3,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_3,
            ),
          {
            stroke: ElectrochemistryColors.wireColorProperty,
            lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_LINE_WIDTH,
          },
        ),
        new Path(
          new Shape()
            .moveTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_4,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_4,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_5,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_4,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_5,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_5,
            )
            .lineTo(
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_6,
              ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_5,
            ),
          {
            stroke: ElectrochemistryColors.wireColorProperty,
            lineWidth: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_LINE_WIDTH,
          },
        ),
        new Rectangle(
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_7,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_6,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_WIDTH_SEGMENT_3,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_HEIGHT_SEGMENT_3,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_CORNER_X,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_CORNER_Y,
          { fill: ElectrochemistryColors.meterBodyColorProperty },
        ),
        new Rectangle(
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_X_SEGMENT_8,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_7,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_WIDTH_SEGMENT_4,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_HEIGHT_SEGMENT_4,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_CORNER_X_SEGMENT_2,
          ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_CORNER_Y_SEGMENT_2,
          { fill: ElectrochemistryColors.meterScreenColorProperty },
        ),
        new Circle(ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_RADIUS, {
          fill: ElectrochemistryColors.blackLeadColorProperty,
          x: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_ITEM_11_X,
          y: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_ITEM_11_Y,
        }),
        new Circle(ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_RADIUS, {
          fill: ElectrochemistryColors.redLeadColorProperty,
          x: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_ITEM_12_X,
          y: ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS.CREATE_ELECTROLYSIS_ICON_ITEM_12_Y,
        }),
      ],
    }),
  );
}
