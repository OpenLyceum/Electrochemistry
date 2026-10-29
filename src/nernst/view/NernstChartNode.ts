/**
 * NernstChartNode.ts
 *
 * Cell potential E against log₁₀ Q for the reaction as written: the straight Nernst line
 * E = E° − (2.303RT/nF) log Q, the E = 0 axis, the standard point (Q = 1, E = E°), equilibrium
 * (Q = K, E = 0) and the cell's present state.
 *
 * The axes fit the content: they always span log Q from −6 to 6, and widen to take in the present
 * point and, when it is within 60 decades, log K. A range is kept until the content leaves it or
 * fills less than a third of it, so the axes don't twitch while a slider moves.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { ChartRectangle, ChartTransform, GridLineSet, LinePlot, TickLabelSet, TickMarkSet } from "scenerystack/bamboo";
import { Range, toFixed, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Orientation } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Node, Path, RichText, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { fixed } from "../../common/view/formatValues.js";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";
import { FONT_SIZE } from "../../ElectrochemistryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";

/** A "nice" tick spacing (1, 2, 2.5 or 5 × 10ⁿ) giving about `count` intervals over `span`. */
export function niceStep(span: number, count: number): number {
  const raw = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const nice = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= raw) ?? 10;
  return nice * magnitude;
}

/** Tick label with just enough decimals for the tick spacing. */
function tickText(value: number, step: number): string {
  const decimals = [0, 1, 2, 3].find((d) => Math.abs(Number(toFixed(step, d)) - step) < 1e-9) ?? 3;
  return fixed(value, decimals);
}

function tickLabel(value: number, step: number): Text {
  return new Text(tickText(value, step), {
    font: new PhetFont(FONT_SIZE.tiny),
    fill: ElectrochemistryColors.textColorProperty,
  });
}

/** Smallest range of multiples of a nice step that covers [min, max]. */
function niceRange(min: number, max: number, count: number): { range: Range; step: number } {
  const step = niceStep(Math.max(max - min, 1e-6), count);
  return { range: new Range(Math.floor(min / step) * step, Math.ceil(max / step) * step), step };
}

const MAX_LOG_K_SHOWN = 60;
const MIN_LOG_Q_SPAN = 6;

export type NernstChartData = {
  readonly standardPotential: number;
  /** Nernst slope (V per decade). */
  readonly slope: number;
  readonly logQ: number;
  readonly potential: number;
  readonly logK: number;
};

export class NernstChartNode extends Node {
  private readonly chartTransform: ChartTransform;
  private readonly gridX: GridLineSet;
  private readonly gridY: GridLineSet;
  private readonly ticksX: TickMarkSet;
  private readonly ticksY: TickMarkSet;
  private readonly labelsX: TickLabelSet;
  private readonly labelsY: TickLabelSet;
  private xStep = 2;
  private yStep = 0.2;

  public constructor(dataProperty: TReadOnlyProperty<NernstChartData>, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getNernstStrings();
    const labelFont = new PhetFont(FONT_SIZE.tiny);

    this.chartTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: new Range(-MIN_LOG_Q_SPAN, MIN_LOG_Q_SPAN),
      modelYRange: new Range(0, 1),
    });
    const transform = this.chartTransform;
    const grid = { stroke: ElectrochemistryColors.chartGridColorProperty };
    const ticks = { edge: "min" as const, stroke: ElectrochemistryColors.chartAxisColorProperty };
    this.gridX = new GridLineSet(transform, Orientation.HORIZONTAL, this.xStep, grid);
    this.gridY = new GridLineSet(transform, Orientation.VERTICAL, this.yStep, grid);
    this.ticksX = new TickMarkSet(transform, Orientation.HORIZONTAL, this.xStep, ticks);
    this.ticksY = new TickMarkSet(transform, Orientation.VERTICAL, this.yStep, ticks);
    this.labelsX = new TickLabelSet(transform, Orientation.HORIZONTAL, this.xStep, {
      edge: "min",
      createLabel: (value) => tickLabel(value, this.xStep),
    });
    this.labelsY = new TickLabelSet(transform, Orientation.VERTICAL, this.yStep, {
      edge: "min",
      createLabel: (value) => tickLabel(value, this.yStep),
    });

    const zeroLine = new LinePlot(transform, [], {
      stroke: ElectrochemistryColors.zeroLineColorProperty,
      lineDash: [5, 4],
    });
    const nernstLine = new LinePlot(transform, [], {
      stroke: ElectrochemistryColors.nernstLineColorProperty,
      lineWidth: 2.5,
    });
    const standardPoint = new Circle(5, { stroke: ElectrochemistryColors.standardPointColorProperty, lineWidth: 2 });
    const equilibriumPoint = new Path(Shape.regularPolygon(4, 7), {
      fill: ElectrochemistryColors.equilibriumPointColorProperty,
    });
    const currentPoint = new Circle(6, {
      fill: ElectrochemistryColors.currentPointColorProperty,
      stroke: ElectrochemistryColors.chartBackgroundColorProperty,
    });
    const standardLabel = new RichText(strings.standardLabelStringProperty, {
      font: labelFont,
      fill: ElectrochemistryColors.standardPointColorProperty,
      maxWidth: width / 2,
    });
    const equilibriumLabel = new RichText(strings.equilibriumLabelStringProperty, {
      font: labelFont,
      fill: ElectrochemistryColors.equilibriumPointColorProperty,
      maxWidth: width / 2,
    });
    const offChartText = new RichText("", {
      font: labelFont,
      fill: ElectrochemistryColors.equilibriumPointColorProperty,
      maxWidth: width - 10,
    });
    const plot = new Node({
      children: [zeroLine, nernstLine, standardPoint, equilibriumPoint, currentPoint, standardLabel, equilibriumLabel],
      clipArea: Shape.rect(0, 0, width, height),
    });

    const titleFont = new PhetFont(FONT_SIZE.small);
    const xTitle = new RichText(strings.xAxisStringProperty, {
      font: titleFont,
      fill: ElectrochemistryColors.mutedTextColorProperty,
      maxWidth: width,
    });
    xTitle.boundsProperty.link(() => {
      xTitle.centerX = width / 2;
      xTitle.top = height + 18;
    });
    const yTitle = new RichText(strings.yAxisStringProperty, {
      font: titleFont,
      fill: ElectrochemistryColors.mutedTextColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: height,
    });
    yTitle.boundsProperty.link(() => {
      yTitle.right = -32;
      yTitle.centerY = height / 2;
    });
    const title = new RichText(strings.chartTitleStringProperty, {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: ElectrochemistryColors.textColorProperty,
      maxWidth: width,
    });
    title.boundsProperty.link(() => {
      title.left = 0;
      title.bottom = -8;
    });
    offChartText.boundsProperty.link(() => {
      offChartText.right = width - 6;
      offChartText.top = 4;
    });

    this.children = [
      new ChartRectangle(transform, {
        fill: ElectrochemistryColors.chartBackgroundColorProperty,
        stroke: ElectrochemistryColors.chartAxisColorProperty,
      }),
      this.gridX,
      this.gridY,
      plot,
      offChartText,
      this.ticksX,
      this.ticksY,
      this.labelsX,
      this.labelsY,
      xTitle,
      yTitle,
      title,
    ];

    Multilink.multilink([dataProperty, strings.offChartPatternStringProperty], (data, offChartPattern) => {
      this.fitRanges(data);
      const xRange = transform.modelXRange;
      const lineAt = (x: number) => data.standardPotential - data.slope * x;
      zeroLine.setDataSet([new Vector2(xRange.min, 0), new Vector2(xRange.max, 0)]);
      nernstLine.setDataSet([new Vector2(xRange.min, lineAt(xRange.min)), new Vector2(xRange.max, lineAt(xRange.max))]);

      standardPoint.translation = transform.modelToViewXY(0, data.standardPotential);
      standardLabel.left = standardPoint.right + 4;
      standardLabel.bottom = standardPoint.top;

      const kInRange = xRange.contains(data.logK);
      equilibriumPoint.visible = kInRange;
      equilibriumLabel.visible = kInRange;
      equilibriumPoint.translation = transform.modelToViewXY(data.logK, 0);
      // Keep the label inside the plot, on whichever side has room.
      equilibriumLabel.centerX = Math.min(
        Math.max(equilibriumPoint.x, equilibriumLabel.width / 2 + 2),
        width - equilibriumLabel.width / 2 - 2,
      );
      equilibriumLabel.top = equilibriumPoint.bottom + 3;
      if (equilibriumLabel.bottom > height) {
        equilibriumLabel.bottom = equilibriumPoint.top - 3;
      }
      offChartText.string = kInRange ? "" : StringUtils.fillIn(offChartPattern, { value: fixed(data.logK, 1) });

      currentPoint.translation = transform.modelToViewXY(data.logQ, data.potential);
    });
  }

  /** Widens or narrows the axes to fit the line, the present point and (if near) equilibrium. */
  private fitRanges(data: NernstChartData): void {
    let xMin = Math.min(-MIN_LOG_Q_SPAN, data.logQ - 1);
    let xMax = Math.max(MIN_LOG_Q_SPAN, data.logQ + 1);
    if (Math.abs(data.logK) <= MAX_LOG_K_SHOWN) {
      xMin = Math.min(xMin, data.logK - 1);
      xMax = Math.max(xMax, data.logK + 1);
    }
    const x = this.chartTransform.modelXRange;
    if (!(x.min <= xMin && x.max >= xMax && x.getLength() <= 3 * (xMax - xMin))) {
      const fit = niceRange(xMin, xMax, 6);
      this.xStep = fit.step;
      this.chartTransform.setModelXRange(fit.range);
    }
    const xRange = this.chartTransform.modelXRange;
    const lineAt = (value: number) => data.standardPotential - data.slope * value;
    const values = [lineAt(xRange.min), lineAt(xRange.max), data.potential, 0];
    const span = Math.max(...values) - Math.min(...values);
    const yMin = Math.min(...values) - 0.08 * span;
    const yMax = Math.max(...values) + 0.08 * span;
    const y = this.chartTransform.modelYRange;
    if (!(y.min <= yMin && y.max >= yMax && y.getLength() <= 3 * (yMax - yMin))) {
      const fit = niceRange(yMin, yMax, 5);
      this.yStep = fit.step;
      this.chartTransform.setModelYRange(fit.range);
    }
    for (const set of [this.gridX, this.ticksX, this.labelsX]) {
      set.setSpacing(this.xStep);
    }
    for (const set of [this.gridY, this.ticksY, this.labelsY]) {
      set.setSpacing(this.yStep);
    }
    // Labels depend on the step's decimals; a new createLabel also clears the label cache.
    const xStep = this.xStep;
    const yStep = this.yStep;
    this.labelsX.setCreateLabel((value) => tickLabel(value, xStep));
    this.labelsY.setCreateLabel((value) => tickLabel(value, yStep));
  }
}
