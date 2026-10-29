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
          lineWidth: 6,
        },
      ),
    ],
  });
}

export function createGalvanicCellIcon(): ScreenIcon {
  const wire = { stroke: ElectrochemistryColors.wireColorProperty, lineWidth: 7 };
  return iconFrom(
    new Node({
      children: [
        background(),
        beaker(40, 180, 180, 160, ElectrochemistryColors.waterColorProperty),
        beaker(328, 180, 180, 160, ElectrochemistryColors.copperTintColorProperty),
        new Path(new Shape().moveTo(170, 300).lineTo(170, 150).lineTo(378, 150).lineTo(378, 300), {
          stroke: ElectrochemistryColors.saltBridgeColorProperty,
          lineWidth: 26,
        }),
        new Rectangle(85, 110, 30, 210, { fill: ElectrochemistryColors.zincColorProperty }),
        new Rectangle(433, 110, 30, 210, { fill: ElectrochemistryColors.copperColorProperty }),
        new Path(new Shape().moveTo(100, 110).lineTo(100, 60).lineTo(448, 60).lineTo(448, 110), wire),
        new Circle(56, { fill: ElectrochemistryColors.bulbOnColorProperty, opacity: 0.5, x: 274, y: 42 }),
        new Circle(30, { fill: ElectrochemistryColors.bulbOnColorProperty, x: 274, y: 42 }),
        ...[150, 210, 330, 390].map(
          (x) => new Circle(9, { fill: ElectrochemistryColors.electronColorProperty, x, y: 60 }),
        ),
      ],
    }),
  );
}

export function createNernstIcon(): ScreenIcon {
  const left = 70;
  const right = 500;
  const top = 40;
  const bottom = 330;
  const zeroY = 250;
  return iconFrom(
    new Node({
      children: [
        background(),
        new Rectangle(left, top, right - left, bottom - top, {
          fill: ElectrochemistryColors.chartBackgroundColorProperty,
          stroke: ElectrochemistryColors.chartAxisColorProperty,
          lineWidth: 4,
        }),
        new Line(left, zeroY, right, zeroY, {
          stroke: ElectrochemistryColors.zeroLineColorProperty,
          lineWidth: 4,
          lineDash: [14, 10],
        }),
        new Line(left, 80, right, 300, { stroke: ElectrochemistryColors.nernstLineColorProperty, lineWidth: 12 }),
        new Circle(16, { stroke: ElectrochemistryColors.standardPointColorProperty, lineWidth: 6, x: 230, y: 162 }),
        new Path(Shape.regularPolygon(4, 20), {
          fill: ElectrochemistryColors.equilibriumPointColorProperty,
          x: 403,
          y: zeroY,
        }),
        new Circle(20, { fill: ElectrochemistryColors.currentPointColorProperty, x: 150, y: 121 }),
      ],
    }),
  );
}

export function createElectrolysisIcon(): ScreenIcon {
  const tube = (x: number, gasHeight: number) =>
    new Node({
      children: [
        new Rectangle(x - 26, 140, 52, 190, 26, 26, { fill: ElectrochemistryColors.waterColorProperty }),
        new Rectangle(x - 24, 142, 48, gasHeight, 22, 22, { fill: ElectrochemistryColors.bubbleColorProperty }),
        new Rectangle(x - 26, 140, 52, 190, 26, 26, {
          stroke: ElectrochemistryColors.glassColorProperty,
          lineWidth: 5,
        }),
      ],
    });
  return iconFrom(
    new Node({
      children: [
        background(),
        beaker(80, 200, 388, 150, ElectrochemistryColors.waterColorProperty),
        tube(184, 120),
        tube(364, 60),
        new Rectangle(184 - 12, 300, 24, 26, { fill: ElectrochemistryColors.platinumColorProperty }),
        new Rectangle(364 - 12, 300, 24, 26, { fill: ElectrochemistryColors.platinumColorProperty }),
        new Path(new Shape().moveTo(234, 70).lineTo(130, 70).lineTo(130, 340).lineTo(184, 340), {
          stroke: ElectrochemistryColors.wireColorProperty,
          lineWidth: 7,
        }),
        new Path(new Shape().moveTo(314, 70).lineTo(418, 70).lineTo(418, 340).lineTo(364, 340), {
          stroke: ElectrochemistryColors.wireColorProperty,
          lineWidth: 7,
        }),
        new Rectangle(214, 20, 120, 90, 12, 12, { fill: ElectrochemistryColors.meterBodyColorProperty }),
        new Rectangle(230, 34, 88, 36, 6, 6, { fill: ElectrochemistryColors.meterScreenColorProperty }),
        new Circle(10, { fill: ElectrochemistryColors.blackLeadColorProperty, x: 240, y: 90 }),
        new Circle(10, { fill: ElectrochemistryColors.redLeadColorProperty, x: 308, y: 90 }),
      ],
    }),
  );
}
