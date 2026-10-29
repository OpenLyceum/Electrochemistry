/**
 * GalvanicCellScreenView.ts
 *
 * Galvanic Cell screen layout: the cell drawing on the left with the reactions under it, the
 * measurements in the middle with the time controls, and the half-cell, circuit and display
 * controls in the right column.
 *
 * The reactions follow the actual anode and cathode (from the sign of the cell potential), so
 * whichever way round the student builds the cell, the equations describe what happens.
 * Connecting the bulb, moving the salt bridge, the current dying away and a dissolved anode are
 * announced for screen readers.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, RichText, VBox } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/ElectrochemistryButtonOptions.js";
import { ElectrochemistryPanel } from "../../common/ElectrochemistryPanel.js";
import type { Side } from "../../common/model/ElectrochemicalCell.js";
import { isGasElectrode } from "../../common/model/HalfCells.js";
import { standardCellPotential } from "../../common/model/Nernst.js";
import { checkbox, comboBox, heading, labeled, pushButton } from "../../common/view/ControlFactory.js";
import { createTimeControl } from "../../common/view/createTimeControl.js";
import {
  cellNotation,
  fixed,
  formatConcentration,
  formatCurrent,
  formatHours,
  formatMass,
  formatPotential,
  halfCellNameProperty,
  overallReaction,
  oxidationReaction,
  reductionReaction,
  signed,
} from "../../common/view/formatValues.js";
import { GalvanicCellNode } from "../../common/view/GalvanicCellNode.js";
import { halfCellChoices } from "../../common/view/halfCellChoices.js";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";
import {
  CURRENT_THRESHOLD,
  ELECTRODE_MASS,
  FONT_SIZE,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
  SIDE_COLUMN_WIDTH,
} from "../../ElectrochemistryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { GalvanicCellModel } from "../model/GalvanicCellModel.js";
import { GalvanicCellScreenSummaryContent } from "./GalvanicCellScreenSummaryContent.js";

type SelfOptions = {
  /** Draw conventional current as well as electrons (Preferences). */
  conventionalCurrentProperty: TReadOnlyProperty<boolean>;
};

export type GalvanicCellScreenViewOptions = SelfOptions & ScreenViewOptions;

const CELL_SCALE = 0.92;
const CELL_LEFT = 50;
const CELL_TOP = 28;
const REACTIONS_WIDTH = 530;
const MIDDLE_LEFT = 562;
const MIDDLE_WIDTH = 190;
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;
const MIDDLE_CONTENT_WIDTH = MIDDLE_WIDTH - 24;

export class GalvanicCellScreenView extends ScreenView {
  private readonly cellNode: GalvanicCellNode;

  public constructor(model: GalvanicCellModel, providedOptions: GalvanicCellScreenViewOptions) {
    const options = optionize<GalvanicCellScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new GalvanicCellScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const cell = model.cell;
    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getGalvanicCellStrings();
    const a11y = StringManager.getInstance().getGalvanicCellA11yStrings();
    const listParent = new Node();

    // ── Cell ────────────────────────────────────────────────────────────────────
    this.cellNode = new GalvanicCellNode(cell, {
      showIonsProperty: model.showIonsProperty,
      conventionalCurrentProperty: options.conventionalCurrentProperty,
      showLabels: true,
    });
    this.cellNode.setScaleMagnitude(CELL_SCALE);
    this.cellNode.left = CELL_LEFT;
    this.cellNode.top = CELL_TOP;

    // ── Reactions ───────────────────────────────────────────────────────────────
    const line = () =>
      new RichText("", {
        font: new PhetFont(FONT_SIZE.control),
        fill: ElectrochemistryColors.textColorProperty,
        maxWidth: REACTIONS_WIDTH - 24,
      });
    const notationLine = line();
    const anodeLine = line();
    const cathodeLine = line();
    const overallLine = line();
    const standardLine = line();
    Multilink.multilinkAny(
      [
        cell.left.halfCellProperty,
        cell.right.halfCellProperty,
        cell.left.concentrationProperty,
        cell.right.concentrationProperty,
        cell.anodeSideProperty,
        common.cellNotationPatternStringProperty,
        common.anodeReactionPatternStringProperty,
        common.cathodeReactionPatternStringProperty,
        common.overallReactionPatternStringProperty,
        common.standardPotentialPatternStringProperty,
        common.sameHalfCellsStringProperty,
      ],
      () => {
        const anodeSide = cell.anodeSideProperty.value;
        const sameHalfCell = cell.left.halfCellProperty.value === cell.right.halfCellProperty.value;
        // With no potential difference, write it as built: left anode, right cathode.
        const anode = cell.stateOf(anodeSide ?? "left");
        const cathode = cell.stateOf(anodeSide === "right" ? "left" : "right");
        const anodeHalf = anode.halfCellProperty.value;
        const cathodeHalf = cathode.halfCellProperty.value;
        notationLine.string = StringUtils.fillIn(common.cellNotationPatternStringProperty.value, {
          notation: cellNotation(
            anodeHalf,
            anode.concentrationProperty.value,
            cathodeHalf,
            cathode.concentrationProperty.value,
          ),
        });
        anodeLine.string = StringUtils.fillIn(common.anodeReactionPatternStringProperty.value, {
          reaction: oxidationReaction(anodeHalf),
        });
        cathodeLine.string = StringUtils.fillIn(common.cathodeReactionPatternStringProperty.value, {
          reaction: reductionReaction(cathodeHalf),
        });
        overallLine.string = sameHalfCell
          ? common.sameHalfCellsStringProperty.value
          : StringUtils.fillIn(common.overallReactionPatternStringProperty.value, {
              reaction: overallReaction(cathodeHalf, anodeHalf),
            });
        standardLine.string = StringUtils.fillIn(common.standardPotentialPatternStringProperty.value, {
          cathode: signed(cathodeHalf.standardPotential, 3),
          anode: signed(anodeHalf.standardPotential, 3),
          value: formatPotential(standardCellPotential(cathodeHalf, anodeHalf)),
        });
      },
    );
    const reactionsPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 5,
        children: [notationLine, anodeLine, cathodeLine, overallLine, standardLine],
      }),
      { minWidth: REACTIONS_WIDTH, maxWidth: REACTIONS_WIDTH, visibleProperty: model.showReactionsProperty },
    );
    reactionsPanel.left = SCREEN_VIEW_MARGIN;
    reactionsPanel.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;

    // ── Measurements ────────────────────────────────────────────────────────────
    const readout = (fill = ElectrochemistryColors.textColorProperty) =>
      new RichText("", { font: new PhetFont(FONT_SIZE.small), fill, maxWidth: MIDDLE_CONTENT_WIDTH });
    const currentText = readout();
    const timeText = readout();
    const chargeText = readout();
    const sideTexts = (side: Side) => ({ side, concentration: readout(), mass: readout() });
    const sides = [sideTexts("left"), sideTexts("right")];
    const statusText = readout(ElectrochemistryColors.poorColorProperty);
    statusText.maxWidth = MIDDLE_CONTENT_WIDTH;
    const statusProperty = new DerivedProperty(
      [
        cell.saltBridgeProperty,
        cell.anodeGoneProperty,
        cell.circuitClosedProperty,
        cell.currentProperty,
        cell.elapsedTimeProperty,
        cell.potentialProperty,
      ],
      (saltBridge, anodeGone, closed, current, elapsed, potential) =>
        !saltBridge
          ? "openCircuit"
          : anodeGone
            ? "anodeGone"
            : closed && elapsed > 0 && Math.abs(current) < CURRENT_THRESHOLD
              ? Math.abs(potential) < 1e-3
                ? "equilibrium"
                : "currentDied"
              : "none",
    );
    Multilink.multilinkAny(
      [
        statusProperty,
        common.openCircuitStringProperty,
        common.anodeGoneStringProperty,
        common.currentDiedStringProperty,
        common.equilibriumStringProperty,
      ],
      () => {
        const status = statusProperty.value;
        statusText.string =
          status === "openCircuit"
            ? common.openCircuitStringProperty.value
            : status === "anodeGone"
              ? common.anodeGoneStringProperty.value
              : status === "currentDied"
                ? common.currentDiedStringProperty.value
                : status === "equilibrium"
                  ? common.equilibriumStringProperty.value
                  : "";
      },
    );
    statusProperty.lazyLink((status) => {
      if (status === "anodeGone") {
        this.addAccessibleResponse(a11y.responses.anodeGoneStringProperty.value);
      } else if (status === "currentDied") {
        this.addAccessibleResponse(a11y.responses.currentDiedStringProperty.value);
      }
    });

    const updateMeasurements = (): void => {
      currentText.string = `${common.currentStringProperty.value}: ${StringUtils.fillIn(
        common.ampsPatternStringProperty.value,
        { value: formatCurrent(cell.currentProperty.value) },
      )}`;
      timeText.string = `${common.timeStringProperty.value}: ${formatHours(cell.elapsedTimeProperty.value)}`;
      chargeText.string = `${common.chargeStringProperty.value}: ${StringUtils.fillIn(
        common.coulombsPatternStringProperty.value,
        { value: fixed(cell.chargeProperty.value, 0) },
      )}`;
      for (const texts of sides) {
        const state = cell.stateOf(texts.side);
        const halfCell = state.halfCellProperty.value;
        texts.concentration.string = StringUtils.fillIn(common.concentrationRowPatternStringProperty.value, {
          ion: halfCell.ion,
          value: formatConcentration(state.concentrationProperty.value),
        });
        texts.mass.string = isGasElectrode(halfCell)
          ? common.platinumElectrodeStringProperty.value
          : StringUtils.fillIn(common.electrodeMassPatternStringProperty.value, {
              metal: halfCell.reduced,
              value: formatMass(state.massProperty.value),
              change: signed(state.massProperty.value - ELECTRODE_MASS, 3),
            });
      }
    };
    Multilink.multilinkAny(
      [
        cell.currentProperty,
        cell.elapsedTimeProperty,
        cell.chargeProperty,
        cell.left.halfCellProperty,
        cell.right.halfCellProperty,
        cell.left.concentrationProperty,
        cell.right.concentrationProperty,
        cell.left.massProperty,
        cell.right.massProperty,
        common.currentStringProperty,
        common.timeStringProperty,
        common.chargeStringProperty,
        common.ampsPatternStringProperty,
        common.hoursPatternStringProperty,
        common.coulombsPatternStringProperty,
        common.concentrationRowPatternStringProperty,
        common.electrodeMassPatternStringProperty,
        common.platinumElectrodeStringProperty,
      ],
      updateMeasurements,
    );
    const measurementsPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 4,
        children: [
          heading(strings.measurementsHeadingStringProperty, MIDDLE_CONTENT_WIDTH),
          currentText,
          timeText,
          chargeText,
          ...sides.flatMap((texts) => [texts.concentration, texts.mass]),
          statusText,
        ],
      }),
      { minWidth: MIDDLE_WIDTH, maxWidth: MIDDLE_WIDTH },
    );
    measurementsPanel.left = MIDDLE_LEFT;
    measurementsPanel.top = SCREEN_VIEW_MARGIN;

    const timeControl = createTimeControl(model.timer.isPlayingProperty, model.timeSpeedProperty, () =>
      model.advance(1 / 60),
    );
    timeControl.centerX = MIDDLE_LEFT + MIDDLE_WIDTH / 2;
    timeControl.top = measurementsPanel.bottom + 16;

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
    const halfCellsPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(strings.halfCellsHeadingStringProperty, SIDE_CONTENT_WIDTH),
          labeled(common.leftHalfCellStringProperty, leftMenu, SIDE_CONTENT_WIDTH),
          labeled(common.rightHalfCellStringProperty, rightMenu, SIDE_CONTENT_WIDTH),
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );

    const saltBridgeCheckbox = checkbox(cell.saltBridgeProperty, common.saltBridgeStringProperty, SIDE_CONTENT_WIDTH);
    const bulbCheckbox = checkbox(cell.circuitClosedProperty, common.connectBulbStringProperty, SIDE_CONTENT_WIDTH);
    const newCellButton = pushButton(strings.newCellStringProperty, () => {
      cell.rebuild();
      this.addAccessibleResponse(a11y.responses.newCellStringProperty.value);
    });
    const circuitPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          heading(strings.circuitHeadingStringProperty, SIDE_CONTENT_WIDTH),
          saltBridgeCheckbox,
          bulbCheckbox,
          newCellButton,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );

    const reactionsCheckbox = checkbox(model.showReactionsProperty, common.reactionsStringProperty, SIDE_CONTENT_WIDTH);
    const ionsCheckbox = checkbox(model.showIonsProperty, common.ionsStringProperty, SIDE_CONTENT_WIDTH);
    const showPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [heading(strings.showHeadingStringProperty, SIDE_CONTENT_WIDTH), reactionsCheckbox, ionsCheckbox],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    const sideColumn = new VBox({
      align: "left",
      spacing: PANEL_SPACING,
      children: [halfCellsPanel, circuitPanel, showPanel],
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      top: SCREEN_VIEW_MARGIN,
    });

    // ── Responses ───────────────────────────────────────────────────────────────
    cell.circuitClosedProperty.lazyLink((closed) => {
      if (!closed) {
        this.addAccessibleResponse(a11y.responses.bulbDisconnectedStringProperty.value);
        return;
      }
      const anodeSide = cell.anodeSideProperty.value;
      if (anodeSide === null || Math.abs(cell.currentProperty.value) < CURRENT_THRESHOLD) {
        this.addAccessibleResponse(a11y.responses.bulbConnectedNoCurrentStringProperty.value);
        return;
      }
      const cathodeSide = anodeSide === "left" ? "right" : "left";
      this.addAccessibleResponse(
        StringUtils.fillIn(a11y.responses.bulbConnectedPatternStringProperty.value, {
          anode: halfCellNameProperty(cell.stateOf(anodeSide).halfCellProperty.value.id).value,
          cathode: halfCellNameProperty(cell.stateOf(cathodeSide).halfCellProperty.value.id).value,
        }),
      );
    });
    cell.saltBridgeProperty.lazyLink((inPlace) => {
      this.addAccessibleResponse(
        inPlace
          ? StringUtils.fillIn(a11y.responses.saltBridgeInsertedPatternStringProperty.value, {
              value: formatPotential(cell.voltmeterReadingProperty.value),
            })
          : a11y.responses.saltBridgeRemovedStringProperty.value,
      );
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

    this.children = [
      this.cellNode,
      reactionsPanel,
      measurementsPanel,
      timeControl,
      sideColumn,
      resetAllButton,
      listParent,
    ];
    this.addChild(
      new Node({
        pdomOrder: [
          leftMenu,
          rightMenu,
          saltBridgeCheckbox,
          bulbCheckbox,
          newCellButton,
          reactionsCheckbox,
          ionsCheckbox,
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
