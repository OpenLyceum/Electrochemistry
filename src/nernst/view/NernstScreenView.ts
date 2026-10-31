/**
 * NernstScreenView.ts
 *
 * Nernst screen layout: a small cell with its concentration and temperature controls on the left,
 * the E-against-log Q chart with the Nernst equation worked out under it in the middle, and the
 * half-cell and circuit controls on the right.
 *
 * The reaction is always written with the left electrode as the anode and the right as the
 * cathode, so the student sees E turn negative (and Q pass K) when the concentrations make the
 * reverse reaction spontaneous.
 */

import { BooleanProperty, DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2 } from "scenerystack/dot";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, RichText, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/ElectrochemistryButtonOptions.js";
import { ELECTROCHEMISTRY_NUMBER_CONTROL_OPTIONS } from "../../common/ElectrochemistryControlOptions.js";
import { ElectrochemistryPanel } from "../../common/ElectrochemistryPanel.js";
import type { HalfCellState } from "../../common/model/ElectrochemicalCell.js";
import {
  electronsTransferred,
  gibbsEnergy,
  logEquilibriumConstant,
  logReactionQuotient,
  nernstSlope,
  standardCellPotential,
} from "../../common/model/Nernst.js";
import {
  CONTROL_FONT,
  checkbox,
  comboBox,
  heading,
  labeled,
  numberControl,
  pushButton,
} from "../../common/view/ControlFactory.js";
import { createTimeControl } from "../../common/view/createTimeControl.js";
import {
  fixed,
  formatConcentration,
  formatCurrent,
  formatHours,
  formatPotential,
  fromLog,
  overallReaction,
  quotientExpression,
  signed,
} from "../../common/view/formatValues.js";
import { GalvanicCellNode } from "../../common/view/GalvanicCellNode.js";
import { halfCellChoices } from "../../common/view/halfCellChoices.js";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";
import {
  CURRENT_THRESHOLD,
  FONT_SIZE,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
  SIDE_COLUMN_WIDTH,
} from "../../ElectrochemistryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { LOG_CONCENTRATION_RANGE, type NernstModel } from "../model/NernstModel.js";
import { type NernstChartData, NernstChartNode } from "./NernstChartNode.js";
import { NernstScreenSummaryContent } from "./NernstScreenSummaryContent.js";

type SelfOptions = {
  /** Draw conventional current as well as electrons (Preferences). */
  conventionalCurrentProperty: TReadOnlyProperty<boolean>;
};

export type NernstScreenViewOptions = SelfOptions & ScreenViewOptions;

const CELL_SCALE = 0.6;
const LEFT_COLUMN_WIDTH = 318;
const LEFT_CONTENT_WIDTH = LEFT_COLUMN_WIDTH - 24;
const CHART_LEFT = 398;
const CHART_TOP = 44;
const CHART_WIDTH = 344;
const CHART_HEIGHT = 196;
const EQUATION_LEFT = 350;
const EQUATION_WIDTH = 404;
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;

/** Everything the chart, equation and description show, for the reaction as written. */
export type NernstState = NernstChartData & {
  readonly electrons: number;
};

export function nernstStateProperty(model: NernstModel): TReadOnlyProperty<NernstState> {
  const cell = model.cell;
  return new DerivedProperty(
    [
      cell.left.halfCellProperty,
      cell.right.halfCellProperty,
      cell.left.concentrationProperty,
      cell.right.concentrationProperty,
      cell.temperatureProperty,
      cell.potentialProperty,
    ],
    (anode, cathode, anodeConcentration, cathodeConcentration, temperature, potential) => {
      const n = electronsTransferred(cathode, anode);
      const standardPotential = standardCellPotential(cathode, anode);
      return {
        electrons: n,
        standardPotential,
        slope: nernstSlope(n, temperature),
        logQ: logReactionQuotient(cathode, cathodeConcentration, anode, anodeConcentration),
        potential,
        logK: logEquilibriumConstant(n, standardPotential, temperature),
      };
    },
  );
}

export class NernstScreenView extends ScreenView {
  private readonly cellNode: GalvanicCellNode;

  public constructor(model: NernstModel, providedOptions: NernstScreenViewOptions) {
    const stateProperty = nernstStateProperty(model);
    const options = optionize<NernstScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new NernstScreenSummaryContent(model, stateProperty) },
      providedOptions,
    );
    super(options);

    const cell = model.cell;
    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getNernstStrings();
    const a11y = StringManager.getInstance().getNernstA11yStrings();
    const listParent = new Node();

    // ── Cell and conditions ─────────────────────────────────────────────────────
    this.cellNode = new GalvanicCellNode(cell, {
      showIonsProperty: new BooleanProperty(true),
      conventionalCurrentProperty: options.conventionalCurrentProperty,
      showLabels: false,
      interactiveSaltBridge: false,
    });
    this.cellNode.setScaleMagnitude(CELL_SCALE);
    this.cellNode.left = SCREEN_VIEW_MARGIN + 10;
    this.cellNode.top = SCREEN_VIEW_MARGIN;

    const concentrationControl = (
      state: HalfCellState,
      logProperty: typeof model.leftLogConcentrationProperty,
      side: TReadOnlyProperty<string>,
    ) => {
      const titleProperty = new DerivedProperty(
        [state.halfCellProperty, side, strings.concentrationPatternStringProperty],
        (halfCell, sideName, pattern) => StringUtils.fillIn(pattern, { side: sideName, ion: halfCell.ionPlain }),
      );
      return new NumberControl(titleProperty, logProperty, LOG_CONCENTRATION_RANGE, {
        ...ELECTROCHEMISTRY_NUMBER_CONTROL_OPTIONS,
        delta: 0.05,
        titleNodeOptions: {
          font: CONTROL_FONT,
          fill: ElectrochemistryColors.textColorProperty,
          maxWidth: LEFT_CONTENT_WIDTH - 110,
        },
        numberDisplayOptions: {
          // The log Property pins at the end of the track; the readout keeps the beaker's concentration.
          numberFormatter: () =>
            StringUtils.fillIn(common.molarPatternStringProperty.value, {
              value: formatConcentration(state.concentrationProperty.value),
            }),
          numberFormatterDependencies: [common.molarPatternStringProperty, state.concentrationProperty],
        },
        sliderOptions: {
          ...ELECTROCHEMISTRY_NUMBER_CONTROL_OPTIONS.sliderOptions,
          trackSize: new Dimension2(180, 3),
          keyboardStep: 0.1,
          shiftKeyboardStep: 0.01,
          pageKeyboardStep: 1,
          constrainValue: (value: number) => Math.round(value / 0.01) * 0.01,
        },
        accessibleName: titleProperty,
      });
    };
    const leftControl = concentrationControl(cell.left, model.leftLogConcentrationProperty, strings.leftStringProperty);
    const rightControl = concentrationControl(
      cell.right,
      model.rightLogConcentrationProperty,
      strings.rightStringProperty,
    );
    const watchSlider = (control: NumberControl, side: "left" | "right") => {
      const sync = () => {
        model.concentrationSliderHeld[side] =
          control.slider.thumbDragListener.isUserControlledProperty.value ||
          control.slider.trackDragListener.isUserControlledProperty.value;
      };
      control.slider.thumbDragListener.isUserControlledProperty.link(sync);
      control.slider.trackDragListener.isUserControlledProperty.link(sync);
    };
    watchSlider(leftControl, "left");
    watchSlider(rightControl, "right");
    const temperatureControl = numberControl(
      strings.temperatureStringProperty,
      model.temperatureCelsiusProperty,
      model.temperatureCelsiusProperty.range,
      { delta: 1, decimalPlaces: 0, valuePattern: strings.celsiusPatternStringProperty },
      LEFT_CONTENT_WIDTH,
    );
    const conditionsPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 10,
        children: [
          heading(strings.concentrationsHeadingStringProperty, LEFT_CONTENT_WIDTH),
          leftControl,
          rightControl,
          temperatureControl,
        ],
      }),
      { minWidth: LEFT_COLUMN_WIDTH, maxWidth: LEFT_COLUMN_WIDTH },
    );
    conditionsPanel.left = SCREEN_VIEW_MARGIN;
    conditionsPanel.top = this.cellNode.bottom + 12;

    // ── Chart ───────────────────────────────────────────────────────────────────
    const chart = new NernstChartNode(stateProperty, CHART_WIDTH, CHART_HEIGHT);
    chart.x = CHART_LEFT;
    chart.y = CHART_TOP;

    // ── Equation ────────────────────────────────────────────────────────────────
    const line = (fill = ElectrochemistryColors.textColorProperty) =>
      new RichText("", { font: new PhetFont(FONT_SIZE.control), fill, maxWidth: EQUATION_WIDTH - 24 });
    const reactionLine = line();
    const electronsLine = line();
    const standardLine = line();
    const quotientLine = line();
    const generalLine = line(ElectrochemistryColors.mutedTextColorProperty);
    const nernstLine = line();
    const gibbsLine = line();
    const constantLine = line();
    const verdictLine = line();
    Multilink.multilinkAny(
      [
        stateProperty,
        strings.asWrittenPatternStringProperty,
        strings.concentrationCellReactionPatternStringProperty,
        strings.electronsPatternStringProperty,
        strings.quotientPatternStringProperty,
        strings.nernstGeneralStringProperty,
        strings.nernstPatternStringProperty,
        strings.gibbsPatternStringProperty,
        strings.equilibriumConstantPatternStringProperty,
        strings.spontaneousStringProperty,
        strings.nonSpontaneousStringProperty,
        strings.atEquilibriumStringProperty,
        strings.leftStringProperty,
        strings.rightStringProperty,
        common.standardPotentialPatternStringProperty,
      ],
      () => {
        const state = stateProperty.value;
        const anode = cell.left.halfCellProperty.value;
        const cathode = cell.right.halfCellProperty.value;
        const reaction =
          anode === cathode
            ? StringUtils.fillIn(strings.concentrationCellReactionPatternStringProperty.value, { ion: cathode.ion })
            : overallReaction(cathode, anode);
        reactionLine.string = StringUtils.fillIn(strings.asWrittenPatternStringProperty.value, { reaction });
        electronsLine.string = StringUtils.fillIn(strings.electronsPatternStringProperty.value, {
          value: state.electrons,
        });
        standardLine.string = StringUtils.fillIn(common.standardPotentialPatternStringProperty.value, {
          cathode: signed(cathode.standardPotential, 3),
          anode: signed(anode.standardPotential, 3),
          value: formatPotential(state.standardPotential),
        });
        quotientLine.string = StringUtils.fillIn(strings.quotientPatternStringProperty.value, {
          expression: quotientExpression(
            cathode,
            anode,
            strings.leftStringProperty.value.toLowerCase(),
            strings.rightStringProperty.value.toLowerCase(),
          ),
          value: fromLog(state.logQ, 3),
        });
        generalLine.string = strings.nernstGeneralStringProperty.value;
        nernstLine.string = StringUtils.fillIn(strings.nernstPatternStringProperty.value, {
          standard: formatPotential(state.standardPotential),
          slope: fixed(state.slope, 4),
          logQ: fixed(state.logQ, 2),
          value: formatPotential(state.potential),
        });
        gibbsLine.string = StringUtils.fillIn(strings.gibbsPatternStringProperty.value, {
          value: fixed(gibbsEnergy(state.electrons, state.potential), 1),
        });
        constantLine.string = StringUtils.fillIn(strings.equilibriumConstantPatternStringProperty.value, {
          value: fromLog(state.logK, 2),
          log: fixed(state.logK, 1),
        });
        const verdict = verdictOf(state.potential);
        verdictLine.string =
          verdict === "spontaneous"
            ? strings.spontaneousStringProperty.value
            : verdict === "nonSpontaneous"
              ? strings.nonSpontaneousStringProperty.value
              : strings.atEquilibriumStringProperty.value;
        verdictLine.fill =
          verdict === "nonSpontaneous"
            ? ElectrochemistryColors.poorColorProperty
            : ElectrochemistryColors.goodColorProperty;
      },
    );
    const equationPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 4,
        children: [
          reactionLine,
          electronsLine,
          standardLine,
          quotientLine,
          generalLine,
          nernstLine,
          gibbsLine,
          constantLine,
          verdictLine,
        ],
      }),
      { minWidth: EQUATION_WIDTH, maxWidth: EQUATION_WIDTH, visibleProperty: model.showEquationProperty },
    );
    equationPanel.left = EQUATION_LEFT;
    equationPanel.top = CHART_TOP + CHART_HEIGHT + 56;

    // ── Controls ────────────────────────────────────────────────────────────────
    const leftMenu = comboBox(
      cell.left.halfCellProperty,
      halfCellChoices(),
      listParent,
      common.leftHalfCellStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const rightMenu = comboBox(
      cell.right.halfCellProperty,
      halfCellChoices(),
      listParent,
      common.rightHalfCellStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const swapButton = pushButton(strings.swapStringProperty, () => {
      model.swap();
      this.addAccessibleResponse(a11y.responses.swappedStringProperty.value);
    });
    const concentrationCellButton = pushButton(strings.concentrationCellStringProperty, () => {
      model.concentrationCell();
      this.addAccessibleResponse(a11y.responses.concentrationCellStringProperty.value);
    });
    const halfCellsPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          labeled(common.leftHalfCellStringProperty, leftMenu, SIDE_CONTENT_WIDTH),
          labeled(common.rightHalfCellStringProperty, rightMenu, SIDE_CONTENT_WIDTH),
          swapButton,
          concentrationCellButton,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );

    const bulbCheckbox = checkbox(cell.circuitClosedProperty, common.connectBulbStringProperty, SIDE_CONTENT_WIDTH);
    const equationCheckbox = checkbox(
      model.showEquationProperty,
      strings.showEquationStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const readout = new RichText("", {
      font: new PhetFont(FONT_SIZE.small),
      fill: ElectrochemistryColors.textColorProperty,
      maxWidth: SIDE_CONTENT_WIDTH,
    });
    Multilink.multilinkAny(
      [
        cell.currentProperty,
        cell.elapsedTimeProperty,
        common.currentStringProperty,
        common.timeStringProperty,
        common.ampsPatternStringProperty,
      ],
      () => {
        readout.string = `${common.currentStringProperty.value}: ${StringUtils.fillIn(
          common.ampsPatternStringProperty.value,
          { value: formatCurrent(cell.currentProperty.value) },
        )}<br>${common.timeStringProperty.value}: ${formatHours(cell.elapsedTimeProperty.value)}`;
      },
    );
    const circuitPanel = new ElectrochemistryPanel(
      new VBox({ align: "left", spacing: 8, children: [bulbCheckbox, readout, equationCheckbox] }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    const timeControl = createTimeControl(model.timer.isPlayingProperty, model.timeSpeedProperty, () =>
      model.advance(1 / 60),
    );
    const sideColumn = new VBox({
      align: "center",
      spacing: PANEL_SPACING + 4,
      children: [halfCellsPanel, circuitPanel, timeControl],
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      top: SCREEN_VIEW_MARGIN,
    });

    // Announce reaching equilibrium while the cell runs.
    const atEquilibriumProperty = new DerivedProperty(
      [cell.circuitClosedProperty, cell.currentProperty, cell.potentialProperty, cell.elapsedTimeProperty],
      (closed, current, potential, elapsed) =>
        closed && elapsed > 0 && Math.abs(current) < CURRENT_THRESHOLD && Math.abs(potential) < 1e-3,
    );
    atEquilibriumProperty.lazyLink((atEquilibrium) => {
      if (atEquilibrium) {
        this.addAccessibleResponse(a11y.responses.equilibriumStringProperty.value);
      }
    });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [this.cellNode, conditionsPanel, chart, equationPanel, sideColumn, resetAllButton, listParent];
    this.addChild(
      new Node({
        pdomOrder: [
          leftMenu,
          rightMenu,
          swapButton,
          concentrationCellButton,
          leftControl,
          rightControl,
          temperatureControl,
          bulbCheckbox,
          equationCheckbox,
          timeControl,
          resetAllButton,
        ],
      }),
    );
  }

  public reset(): void {
    // No view-only state beyond what the model resets.
  }

  public override step(dt: number): void {
    this.cellNode.step(dt);
  }
}

/** Direction of the reaction as written; |E| below 0.1 mV counts as equilibrium. */
export function verdictOf(potential: number): "spontaneous" | "nonSpontaneous" | "equilibrium" {
  return potential > 1e-4 ? "spontaneous" : potential < -1e-4 ? "nonSpontaneous" : "equilibrium";
}
