/**
 * ElectrolysisScreenView.ts
 *
 * Electrolysis screen layout: the apparatus on the left with the reactions under it, the
 * measurements and the Faraday's-law calculation in the middle with the time controls, and the
 * cell and power-supply controls on the right.
 *
 * The calculation starts hidden, so students can predict the amount of product from I and t
 * before they check it.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { Node, RichText, VBox } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/ElectrochemistryButtonOptions.js";
import { ElectrochemistryPanel } from "../../common/ElectrochemistryPanel.js";
import {
  ELECTROLYSIS_SYSTEM_LIST,
  type ElectrodeProduct,
  type ElectrolysisSystem,
  productMoles,
} from "../../common/model/ElectrolysisSystems.js";
import {
  type ComboChoice,
  checkbox,
  comboBox,
  heading,
  numberControl,
  pushButton,
} from "../../common/view/ControlFactory.js";
import { createTimeControl } from "../../common/view/createTimeControl.js";
import {
  fixed,
  formatConcentration,
  formatCurrent,
  formatMass,
  formatMinutes,
  fromLog,
  signed,
  systemNameProperty,
} from "../../common/view/formatValues.js";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";
import {
  ELECTRODE_MASS,
  FARADAY,
  FONT_SIZE,
  PANEL_SPACING,
  SCREEN_VIEW_MARGIN,
  SIDE_COLUMN_WIDTH,
} from "../../ElectrochemistryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type ElectrolysisModel, MOLAR_GAS_VOLUME } from "../model/ElectrolysisModel.js";
import { ElectrolysisCellNode } from "./ElectrolysisCellNode.js";
import { ElectrolysisScreenSummaryContent } from "./ElectrolysisScreenSummaryContent.js";

type SelfOptions = {
  /** Draw conventional current as well as electrons (Preferences). */
  conventionalCurrentProperty: TReadOnlyProperty<boolean>;
};

export type ElectrolysisScreenViewOptions = SelfOptions & ScreenViewOptions;

const APPARATUS_SCALE = 0.86;
const APPARATUS_CENTER_X = 255;
const APPARATUS_TOP = 16;
const REACTIONS_WIDTH = 464;
const MIDDLE_LEFT = 496;
const MIDDLE_WIDTH = 256;
const MIDDLE_CONTENT_WIDTH = MIDDLE_WIDTH - 24;
const SIDE_CONTENT_WIDTH = SIDE_COLUMN_WIDTH - 24;

/** Plain-text measurement of one electrode's product, for readouts and descriptions. */
export function productReadout(
  product: ElectrodeProduct,
  isCathode: boolean,
  mass: number,
  gasVolume: number,
  plain: boolean,
): string {
  const strings = StringManager.getInstance().getElectrolysisStrings();
  if (product.kind === "gas") {
    return StringUtils.fillIn(strings.gasVolumePatternStringProperty.value, {
      gas: plain ? product.formulaPlain : product.formula,
      value: fixed(gasVolume, 1),
    });
  }
  return StringUtils.fillIn(
    (isCathode ? strings.cathodeMassPatternStringProperty : strings.anodeMassPatternStringProperty).value,
    { value: formatMass(mass), change: signed(mass - ELECTRODE_MASS, 3) },
  );
}

export class ElectrolysisScreenView extends ScreenView {
  private readonly apparatus: ElectrolysisCellNode;

  public constructor(model: ElectrolysisModel, providedOptions: ElectrolysisScreenViewOptions) {
    const options = optionize<ElectrolysisScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new ElectrolysisScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getElectrolysisStrings();
    const a11y = StringManager.getInstance().getElectrolysisA11yStrings();
    const listParent = new Node();

    // ── Apparatus ───────────────────────────────────────────────────────────────
    this.apparatus = new ElectrolysisCellNode(model, options.conventionalCurrentProperty);
    this.apparatus.setScaleMagnitude(APPARATUS_SCALE);
    this.apparatus.centerX = APPARATUS_CENTER_X;
    this.apparatus.top = APPARATUS_TOP;

    // ── Reactions ───────────────────────────────────────────────────────────────
    const line = (fill = ElectrochemistryColors.textColorProperty) =>
      new RichText("", { font: new PhetFont(FONT_SIZE.control), fill, maxWidth: REACTIONS_WIDTH - 24 });
    const electrolyteLine = line();
    const cathodeLine = line();
    const anodeLine = line();
    const overallLine = line();
    const minimumLine = line();
    Multilink.multilinkAny(
      [
        model.systemProperty,
        model.minimumVoltageProperty,
        model.cationConcentrationProperty,
        strings.electrolytePatternStringProperty,
        common.cathodeReactionPatternStringProperty,
        common.anodeReactionPatternStringProperty,
        common.overallReactionPatternStringProperty,
        strings.minimumVoltagePatternStringProperty,
      ],
      () => {
        const system = model.systemProperty.value;
        electrolyteLine.string = StringUtils.fillIn(strings.electrolytePatternStringProperty.value, {
          formula: system.electrolyte,
          value: formatConcentration(model.cationConcentrationProperty.value),
        });
        cathodeLine.string = StringUtils.fillIn(common.cathodeReactionPatternStringProperty.value, {
          reaction: system.cathodeReaction,
        });
        anodeLine.string = StringUtils.fillIn(common.anodeReactionPatternStringProperty.value, {
          reaction: system.anodeReaction,
        });
        overallLine.string = StringUtils.fillIn(common.overallReactionPatternStringProperty.value, {
          reaction: system.overallReaction,
        });
        minimumLine.string = StringUtils.fillIn(strings.minimumVoltagePatternStringProperty.value, {
          value: fixed(model.minimumVoltageProperty.value, 2),
        });
      },
    );
    const reactionsPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 4,
        children: [electrolyteLine, cathodeLine, anodeLine, overallLine, minimumLine],
      }),
      { minWidth: REACTIONS_WIDTH, maxWidth: REACTIONS_WIDTH },
    );
    reactionsPanel.left = SCREEN_VIEW_MARGIN;
    reactionsPanel.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;

    // ── Measurements ────────────────────────────────────────────────────────────
    const readout = (fill = ElectrochemistryColors.textColorProperty) =>
      new RichText("", { font: new PhetFont(FONT_SIZE.small), fill, maxWidth: MIDDLE_CONTENT_WIDTH });
    const timeText = readout();
    const currentText = readout();
    const chargeText = readout();
    const cathodeText = readout();
    const anodeText = readout();
    const cationText = readout();
    const statusText = readout(ElectrochemistryColors.poorColorProperty);
    // A system with a dissolving anode collects no gas, so that is what finished its run.
    const statusProperty = new DerivedProperty(
      [
        model.finishedProperty,
        model.systemProperty,
        model.powerOnProperty,
        model.voltageProperty,
        model.minimumVoltageProperty,
      ],
      (finished, system, on, voltage, minimum) =>
        finished
          ? system.anodeProduct.kind === "metal" && system.anodeProduct.dissolves
            ? "anodeDissolved"
            : "tubeFull"
          : on && voltage <= minimum
            ? "belowMinimum"
            : "none",
    );
    Multilink.multilinkAny(
      [
        model.systemProperty,
        model.elapsedTimeProperty,
        model.currentProperty,
        model.chargeProperty,
        model.cationConcentrationProperty,
        statusProperty,
        common.timeStringProperty,
        common.currentStringProperty,
        common.chargeStringProperty,
        common.ampsPatternStringProperty,
        common.coulombsPatternStringProperty,
        common.minutesPatternStringProperty,
        strings.cathodeMassPatternStringProperty,
        strings.anodeMassPatternStringProperty,
        strings.gasVolumePatternStringProperty,
        strings.cationPatternStringProperty,
        strings.tubeFullStringProperty,
        strings.anodeDissolvedStringProperty,
        strings.belowMinimumStringProperty,
      ],
      () => {
        const system = model.systemProperty.value;
        timeText.string = `${common.timeStringProperty.value}: ${formatMinutes(model.elapsedTimeProperty.value)}`;
        currentText.string = `${common.currentStringProperty.value}: ${StringUtils.fillIn(
          common.ampsPatternStringProperty.value,
          { value: formatCurrent(model.currentProperty.value) },
        )}`;
        chargeText.string = `${common.chargeStringProperty.value}: ${StringUtils.fillIn(
          common.coulombsPatternStringProperty.value,
          { value: fixed(model.chargeProperty.value, 0) },
        )}`;
        cathodeText.string = productReadout(
          system.cathodeProduct,
          true,
          model.cathodeMassProperty.value,
          model.cathodeGasVolumeProperty.value,
          false,
        );
        anodeText.string = productReadout(
          system.anodeProduct,
          false,
          model.anodeMassProperty.value,
          model.anodeGasVolumeProperty.value,
          false,
        );
        cationText.visible = system.consumesCation;
        cationText.string = StringUtils.fillIn(strings.cationPatternStringProperty.value, {
          value: formatConcentration(model.cationConcentrationProperty.value),
        });
        const status = statusProperty.value;
        statusText.string =
          status === "tubeFull"
            ? strings.tubeFullStringProperty.value
            : status === "anodeDissolved"
              ? strings.anodeDissolvedStringProperty.value
              : status === "belowMinimum"
                ? strings.belowMinimumStringProperty.value
                : "";
      },
    );
    statusProperty.lazyLink((status) => {
      if (status === "tubeFull") {
        this.addAccessibleResponse(a11y.responses.tubeFullStringProperty.value);
      } else if (status === "anodeDissolved") {
        this.addAccessibleResponse(a11y.responses.anodeDissolvedStringProperty.value);
      }
    });
    const measurementsPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 4,
        children: [
          heading(strings.measurementsHeadingStringProperty, MIDDLE_CONTENT_WIDTH),
          timeText,
          currentText,
          chargeText,
          cathodeText,
          anodeText,
          cationText,
          statusText,
        ],
      }),
      { minWidth: MIDDLE_WIDTH, maxWidth: MIDDLE_WIDTH },
    );

    // ── Faraday's law ───────────────────────────────────────────────────────────
    const chargeLine = readout();
    const electronLine = readout();
    const productLines = [readout(), readout(), readout(), readout(), readout(), readout()];
    Multilink.multilinkAny(
      [
        model.systemProperty,
        model.chargeProperty,
        strings.chargePatternStringProperty,
        strings.electronMolesPatternStringProperty,
        strings.productMolesPatternStringProperty,
        strings.productMassPatternStringProperty,
        strings.productVolumePatternStringProperty,
        strings.productHeadingPatternStringProperty,
        strings.platedStringProperty,
        strings.dissolvedStringProperty,
        strings.collectedStringProperty,
        common.cathodeStringProperty,
        common.anodeStringProperty,
      ],
      () => {
        const system = model.systemProperty.value;
        const charge = model.chargeProperty.value;
        chargeLine.string = StringUtils.fillIn(strings.chargePatternStringProperty.value, { value: fixed(charge, 0) });
        electronLine.string = StringUtils.fillIn(strings.electronMolesPatternStringProperty.value, {
          value: moles(charge / FARADAY),
        });
        const lines = [
          ...calculationLines(system.cathodeProduct, common.cathodeStringProperty.value, charge),
          ...calculationLines(system.anodeProduct, common.anodeStringProperty.value, charge),
        ];
        productLines.forEach((text, i) => {
          text.string = lines[i] ?? "";
          text.visible = i < lines.length;
        });
      },
    );
    const faradayPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 4,
        children: [
          heading(strings.faradayHeadingStringProperty, MIDDLE_CONTENT_WIDTH),
          chargeLine,
          electronLine,
          ...productLines,
        ],
      }),
      { minWidth: MIDDLE_WIDTH, maxWidth: MIDDLE_WIDTH, visibleProperty: model.showCalculationProperty },
    );

    const timeControl = createTimeControl(model.timer.isPlayingProperty, model.timeSpeedProperty, () =>
      model.stepFrame(1 / 60),
    );
    const middleColumn = new VBox({
      align: "center",
      spacing: PANEL_SPACING,
      children: [measurementsPanel, faradayPanel],
      left: MIDDLE_LEFT,
      top: SCREEN_VIEW_MARGIN,
    });
    timeControl.centerX = MIDDLE_LEFT + MIDDLE_WIDTH / 2;
    timeControl.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;

    // ── Controls ────────────────────────────────────────────────────────────────
    const choices: ComboChoice<ElectrolysisSystem>[] = ELECTROLYSIS_SYSTEM_LIST.map((system) => ({
      value: system,
      label: systemNameProperty(system.id),
    }));
    const systemMenu = comboBox(
      model.systemProperty,
      choices,
      listParent,
      strings.electrolyteHeadingStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const newRunButton = pushButton(strings.newRunStringProperty, () => {
      model.restartRun();
      this.addAccessibleResponse(a11y.responses.newRunStringProperty.value);
    });
    const systemPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 8,
        children: [heading(strings.electrolyteHeadingStringProperty, SIDE_CONTENT_WIDTH), systemMenu, newRunButton],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );

    const powerCheckbox = checkbox(model.powerOnProperty, strings.powerOnStringProperty, SIDE_CONTENT_WIDTH);
    const voltageControl = numberControl(
      strings.voltageStringProperty,
      model.voltageProperty,
      model.voltageProperty.range,
      { delta: 0.05, decimalPlaces: 2, valuePattern: common.voltsPatternStringProperty },
      SIDE_CONTENT_WIDTH,
    );
    const calculationCheckbox = checkbox(
      model.showCalculationProperty,
      strings.showCalculationStringProperty,
      SIDE_CONTENT_WIDTH,
    );
    const supplyPanel = new ElectrochemistryPanel(
      new VBox({
        align: "left",
        spacing: 10,
        children: [
          heading(strings.supplyHeadingStringProperty, SIDE_CONTENT_WIDTH),
          powerCheckbox,
          voltageControl,
          calculationCheckbox,
        ],
      }),
      { minWidth: SIDE_COLUMN_WIDTH, maxWidth: SIDE_COLUMN_WIDTH },
    );
    const sideColumn = new VBox({
      align: "left",
      spacing: PANEL_SPACING,
      children: [systemPanel, supplyPanel],
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      top: SCREEN_VIEW_MARGIN,
    });

    model.powerOnProperty.lazyLink((on) => {
      const current = model.currentProperty.value;
      const system = model.systemProperty.value;
      this.addAccessibleResponse(
        !on
          ? a11y.responses.powerOffStringProperty.value
          : model.finishedProperty.value
            ? system.anodeProduct.kind === "metal" && system.anodeProduct.dissolves
              ? a11y.responses.anodeDissolvedStringProperty.value
              : a11y.responses.tubeFullStringProperty.value
            : current > 0
              ? StringUtils.fillIn(a11y.responses.powerOnPatternStringProperty.value, { value: formatCurrent(current) })
              : a11y.responses.powerOnBelowMinimumStringProperty.value,
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

    this.children = [this.apparatus, reactionsPanel, middleColumn, timeControl, sideColumn, resetAllButton, listParent];
    this.addChild(
      new Node({
        pdomOrder: [
          systemMenu,
          newRunButton,
          powerCheckbox,
          voltageControl,
          calculationCheckbox,
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
    this.apparatus.step(dt);
  }
}

function moles(value: number): string {
  return value === 0 ? "0" : fromLog(Math.log10(value), 3);
}

/** Heading, moles and mass or volume of one electrode's product after `charge` C. */
function calculationLines(product: ElectrodeProduct, electrode: string, charge: number): string[] {
  const strings = StringManager.getInstance().getElectrolysisStrings();
  const amount = productMoles(product, charge);
  const action =
    product.kind === "gas"
      ? strings.collectedStringProperty.value
      : product.dissolves
        ? strings.dissolvedStringProperty.value
        : strings.platedStringProperty.value;
  const formula = product.formula;
  const lines = [
    StringUtils.fillIn(strings.productHeadingPatternStringProperty.value, { electrode, formula, action }),
    StringUtils.fillIn(strings.productMolesPatternStringProperty.value, {
      formula,
      electrons: product.electrons,
      value: moles(amount),
    }),
  ];
  if (product.kind === "metal") {
    lines.push(
      StringUtils.fillIn(strings.productMassPatternStringProperty.value, {
        formula,
        moles: moles(amount),
        molarMass: fixed(product.molarMass, 2),
        value: formatMass(amount * product.molarMass),
      }),
    );
  } else {
    lines.push(
      StringUtils.fillIn(strings.productVolumePatternStringProperty.value, {
        formula,
        moles: moles(amount),
        molarVolume: fixed(MOLAR_GAS_VOLUME / 1000, 2),
        value: fixed(amount * MOLAR_GAS_VOLUME, 1),
      }),
    );
  }
  return lines;
}
