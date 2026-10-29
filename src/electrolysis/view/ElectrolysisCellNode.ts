/**
 * ElectrolysisCellNode.ts
 *
 * The electrolysis apparatus: a DC power supply wired to two electrodes in a beaker of
 * electrolyte. The cathode (wired to the − terminal) is on the left, the anode (+) on the right.
 *
 * What each electrode looks like depends on its product:
 *   - a plated metal grows a coat of that metal (the spoon turns silver);
 *   - a dissolving anode thins;
 *   - a gas bubbles up into an inverted, graduated collection tube (0–50 mL) over the electrode,
 *     whose wire comes in under the tube's mouth.
 * Copper(II) solutions are tinted by their concentration. Electrons move along both wires while
 * current flows: from the − terminal to the cathode, and from the anode to the + terminal.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Color, Line, Node, Path, Rectangle, RichText, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import type { ElectrodeProduct, ElectrolysisSystem } from "../../common/model/ElectrolysisSystems.js";
import { disposeChildren } from "../../common/view/disposeChildren.js";
import { ElectronFlowNode, wirePath } from "../../common/view/ElectronFlowNode.js";
import { fixed, formatCurrent } from "../../common/view/formatValues.js";
import { materialColor } from "../../common/view/halfCellColors.js";
import { MeterNode } from "../../common/view/MeterNode.js";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";
import {
  ELECTRODE_MASS,
  FONT_SIZE,
  FULL_BRIGHTNESS_CURRENT,
  GAS_TUBE_CAPACITY,
} from "../../ElectrochemistryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElectrolysisModel } from "../model/ElectrolysisModel.js";

const BEAKER_LEFT = 60;
const BEAKER_RIGHT = 460;
const BEAKER_TOP = 250;
const BEAKER_BOTTOM = 450;
const LIQUID_TOP = 280;
const CATHODE_X = 170;
const ANODE_X = 350;
const BUS_Y = 150;
const ELECTRODE_TOP = 200;
const ELECTRODE_BOTTOM = 420;
const PLATE_WIDTH = 26;
const TUBE_TOP = 200;
const TUBE_BOTTOM = 438;
const TUBE_HALF_WIDTH = 18;
const TUBE_SCALE_LENGTH = 200;
const GAS_PLATE_TOP = 392;
const GAS_PLATE_BOTTOM = 432;
const GAS_WIRE_OFFSET = 34;
const UNDER_TUBE_Y = 443;
const ELECTRON_SPEED = 90;
const BUBBLE_SPEED = 70;
const BUBBLES_PER_TUBE = 8;

type ElectrodeView = {
  readonly x: number;
  readonly layer: Node;
  readonly bubbles: Node;
  readonly gas: Rectangle;
};

export class ElectrolysisCellNode extends Node {
  private readonly model: ElectrolysisModel;
  private readonly cathodeView: ElectrodeView;
  private readonly anodeView: ElectrodeView;
  private readonly wireLayer = new Node();
  private cathodeElectrons: ElectronFlowNode | null = null;
  private anodeElectrons: ElectronFlowNode | null = null;
  private readonly supply: MeterNode;
  private readonly solutionFill: TReadOnlyProperty<Color>;

  public constructor(model: ElectrolysisModel, conventionalCurrentProperty: TReadOnlyProperty<boolean>) {
    super();
    this.model = model;
    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getElectrolysisStrings();

    // ── Power supply ────────────────────────────────────────────────────────────
    const voltageText = new DerivedProperty(
      [model.voltageProperty, model.powerOnProperty, common.voltsPatternStringProperty],
      (voltage, on, pattern) => (on ? StringUtils.fillIn(pattern, { value: fixed(voltage, 2) }) : "– – –"),
    );
    const currentText = new DerivedProperty(
      [model.currentProperty, model.powerOnProperty, common.ampsPatternStringProperty],
      (current, on, pattern) => (on ? StringUtils.fillIn(pattern, { value: formatCurrent(current) }) : ""),
    );
    this.supply = new MeterNode({
      width: 170,
      lines: [voltageText, currentText],
      caption: strings.supplyCaptionStringProperty,
      blackLabel: "−",
      redLabel: "+",
    });
    this.supply.centerX = (CATHODE_X + ANODE_X) / 2;
    this.supply.top = 0;

    // ── Beaker and solution ─────────────────────────────────────────────────────
    const solution = new Rectangle(
      BEAKER_LEFT + 2,
      LIQUID_TOP,
      BEAKER_RIGHT - BEAKER_LEFT - 4,
      BEAKER_BOTTOM - LIQUID_TOP - 2,
    );
    const solutionFill = new DerivedProperty(
      [
        model.systemProperty,
        model.cationConcentrationProperty,
        ElectrochemistryColors.waterColorProperty,
        ElectrochemistryColors.copperTintColorProperty,
      ],
      (system, concentration, water, copper) =>
        system.tint === "copper" ? Color.interpolateRGBA(water, copper, Math.min(1, concentration) ** 0.6) : water,
    );
    solution.fill = solutionFill;
    this.solutionFill = solutionFill;
    const beaker = new Path(
      new Shape()
        .moveTo(BEAKER_LEFT, BEAKER_TOP)
        .lineTo(BEAKER_LEFT, BEAKER_BOTTOM)
        .lineTo(BEAKER_RIGHT, BEAKER_BOTTOM)
        .lineTo(BEAKER_RIGHT, BEAKER_TOP),
      { stroke: ElectrochemistryColors.glassColorProperty, lineWidth: 2.5 },
    );

    const electrodeView = (x: number): ElectrodeView => ({
      x,
      layer: new Node(),
      bubbles: new Node({ pickable: false }),
      gas: new Rectangle(0, 0, 1, 1, { fill: ElectrochemistryColors.bubbleColorProperty, opacity: 0.55 }),
    });
    this.cathodeView = electrodeView(CATHODE_X);
    this.anodeView = electrodeView(ANODE_X);

    // ── Electrode labels ────────────────────────────────────────────────────────
    const roleLabel = (
      text: TReadOnlyProperty<string>,
      color: typeof ElectrochemistryColors.anodeColorProperty,
      x: number,
    ) => {
      const label = new Text(text, {
        font: new PhetFont({ size: FONT_SIZE.small, weight: "bold" }),
        fill: color,
        maxWidth: 170,
      });
      label.boundsProperty.link(() => {
        label.centerX = x;
        label.top = BEAKER_BOTTOM + 8;
      });
      return label;
    };
    const cathodeRole = new DerivedProperty(
      [common.cathodeStringProperty, common.reductionStringProperty],
      (cathode, reduction) => `${cathode} (−) · ${reduction}`,
    );
    const anodeRole = new DerivedProperty(
      [common.anodeStringProperty, common.oxidationStringProperty],
      (anode, oxidation) => `${anode} (+) · ${oxidation}`,
    );

    // Conventional current leaves the + terminal for the anode: down the lead from the terminal.
    const red = this.supply.localToParentPoint(this.supply.redTerminal);
    const conventionalArrow = new ArrowNode(red.x + 14, red.y + 14, red.x + 14, BUS_Y - 8, {
      fill: ElectrochemistryColors.redLeadColorProperty,
      stroke: null,
      headHeight: 10,
      headWidth: 12,
      tailWidth: 3,
    });
    const conventional = new Node({
      children: [
        conventionalArrow,
        new RichText(common.conventionalCurrentStringProperty, {
          font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
          fill: ElectrochemistryColors.redLeadColorProperty,
          left: conventionalArrow.right + 4,
          centerY: conventionalArrow.centerY,
        }),
      ],
    });
    Multilink.multilink([conventionalCurrentProperty, model.currentProperty], (show, current) => {
      conventional.visible = show && current > 0;
    });

    this.children = [
      solution,
      this.cathodeView.bubbles,
      this.anodeView.bubbles,
      this.cathodeView.layer,
      this.anodeView.layer,
      beaker,
      this.wireLayer,
      this.supply,
      conventional,
      roleLabel(cathodeRole, ElectrochemistryColors.cathodeColorProperty, CATHODE_X),
      roleLabel(anodeRole, ElectrochemistryColors.anodeColorProperty, ANODE_X),
    ];

    model.systemProperty.link((system) => this.rebuild(system));
    Multilink.multilink(
      [
        model.cathodeMassProperty,
        model.anodeMassProperty,
        model.cathodeGasVolumeProperty,
        model.anodeGasVolumeProperty,
      ],
      () => this.updateProducts(),
    );
  }

  /** Redraws electrodes, tubes and wires for a new system. */
  private rebuild(system: ElectrolysisSystem): void {
    for (const view of [this.cathodeView, this.anodeView]) {
      disposeChildren(view.layer);
      disposeChildren(view.bubbles);
    }
    disposeChildren(this.wireLayer);

    const black = this.supply.localToParentPoint(this.supply.blackTerminal);
    const red = this.supply.localToParentPoint(this.supply.redTerminal);
    const cathodeWire = this.wirePoints(black, CATHODE_X, system.cathodeProduct);
    const anodeWire = this.wirePoints(red, ANODE_X, system.anodeProduct).reverse();
    this.wireLayer.addChild(wirePath(cathodeWire, 2.5));
    this.wireLayer.addChild(wirePath(anodeWire, 2.5));
    this.cathodeElectrons = new ElectronFlowNode(cathodeWire);
    this.anodeElectrons = new ElectronFlowNode(anodeWire);
    this.wireLayer.addChild(this.cathodeElectrons);
    this.wireLayer.addChild(this.anodeElectrons);

    this.buildElectrode(this.cathodeView, system.cathodeProduct, system.cathodeMaterial === "steel", system);
    this.buildElectrode(this.anodeView, system.anodeProduct, false, system);
    this.updateProducts();
  }

  /** Wire from a terminal to an electrode; for a gas electrode it goes in under the tube. */
  private wirePoints(terminal: Vector2, x: number, product: ElectrodeProduct): Vector2[] {
    const side = x < (CATHODE_X + ANODE_X) / 2 ? -1 : 1;
    if (product.kind === "gas") {
      const outside = x + side * GAS_WIRE_OFFSET;
      return [
        terminal,
        new Vector2(terminal.x, BUS_Y),
        new Vector2(outside, BUS_Y),
        new Vector2(outside, UNDER_TUBE_Y),
        new Vector2(x, UNDER_TUBE_Y),
        new Vector2(x, GAS_PLATE_BOTTOM),
      ];
    }
    return [terminal, new Vector2(terminal.x, BUS_Y), new Vector2(x, BUS_Y), new Vector2(x, ELECTRODE_TOP)];
  }

  private buildElectrode(
    view: ElectrodeView,
    product: ElectrodeProduct,
    spoon: boolean,
    system: ElectrolysisSystem,
  ): void {
    const isCathode = view === this.cathodeView;
    const material = isCathode ? system.cathodeMaterial : system.anodeMaterial;
    const x = view.x;
    if (product.kind === "gas") {
      const tubeShape = new Shape()
        .moveTo(x - TUBE_HALF_WIDTH, TUBE_BOTTOM)
        .lineTo(x - TUBE_HALF_WIDTH, TUBE_TOP + TUBE_HALF_WIDTH)
        .arc(x, TUBE_TOP + TUBE_HALF_WIDTH, TUBE_HALF_WIDTH, Math.PI, 0)
        .lineTo(x + TUBE_HALF_WIDTH, TUBE_BOTTOM);
      // The tube starts full of solution; gas collects from the top down.
      const filled = new Path(tubeShape, { fill: this.solutionFill });
      view.gas.fill = product.formula.startsWith("Cl")
        ? ElectrochemistryColors.chlorineColorProperty
        : ElectrochemistryColors.bubbleColorProperty;
      const ticks = new Node();
      for (let volume = 0; volume <= GAS_TUBE_CAPACITY; volume += 5) {
        const y = TUBE_TOP + (volume / GAS_TUBE_CAPACITY) * TUBE_SCALE_LENGTH;
        const major = volume % 10 === 0;
        ticks.addChild(
          new Line(x - TUBE_HALF_WIDTH, y, x - TUBE_HALF_WIDTH + (major ? 9 : 5), y, {
            stroke: ElectrochemistryColors.glassColorProperty,
            lineWidth: 1,
          }),
        );
        if (major) {
          ticks.addChild(
            new Text(String(volume), {
              font: new PhetFont(9),
              fill: ElectrochemistryColors.textColorProperty,
              right: x - TUBE_HALF_WIDTH - 3,
              centerY: y,
            }),
          );
        }
      }
      const formula = new RichText(`${product.formula} (mL)`, {
        font: new PhetFont(FONT_SIZE.tiny),
        fill: ElectrochemistryColors.textColorProperty,
        centerX: x,
        bottom: TUBE_TOP - 4,
      });
      view.layer.children = [
        filled,
        view.gas,
        new Rectangle(x - 9, GAS_PLATE_TOP, 18, GAS_PLATE_BOTTOM - GAS_PLATE_TOP, {
          fill: materialColor(material),
          stroke: ElectrochemistryColors.panelBorderColorProperty,
        }),
        new Path(tubeShape, { stroke: ElectrochemistryColors.glassColorProperty, lineWidth: 2 }),
        ticks,
        formula,
      ];
      for (let i = 0; i < BUBBLES_PER_TUBE; i++) {
        view.bubbles.addChild(
          new Circle(1.5 + (i % 3), {
            stroke: ElectrochemistryColors.bubbleColorProperty,
            x: x + ((i % 4) - 1.5) * 6,
            y: GAS_PLATE_TOP - (i * (GAS_PLATE_TOP - TUBE_TOP)) / BUBBLES_PER_TUBE,
            visible: false,
          }),
        );
      }
      // Bubbles live in the tube, above the electrolyte layer.
      view.layer.addChild(view.bubbles);
    } else if (spoon) {
      view.layer.children = [
        new Rectangle(x - 4, ELECTRODE_TOP, 8, 170, 3, 3, { fill: materialColor(material) }),
        new Path(Shape.ellipse(x, ELECTRODE_TOP + 196, 17, 30, 0), { fill: materialColor(material) }),
        new Node(),
      ];
    } else {
      view.layer.children = [new Node(), new Node()];
    }
  }

  /** Electrode thickness, plating and gas levels for the charge passed so far. */
  private updateProducts(): void {
    const system = this.model.systemProperty.value;
    for (const [view, product, material, mass, gasVolume] of [
      [
        this.cathodeView,
        system.cathodeProduct,
        system.cathodeMaterial,
        this.model.cathodeMassProperty.value,
        this.model.cathodeGasVolumeProperty.value,
      ],
      [
        this.anodeView,
        system.anodeProduct,
        system.anodeMaterial,
        this.model.anodeMassProperty.value,
        this.model.anodeGasVolumeProperty.value,
      ],
    ] as const) {
      const x = view.x;
      if (product.kind === "gas") {
        const height = (Math.min(gasVolume, GAS_TUBE_CAPACITY) / GAS_TUBE_CAPACITY) * TUBE_SCALE_LENGTH;
        view.gas.setRect(x - TUBE_HALF_WIDTH + 1, TUBE_TOP + 1, 2 * TUBE_HALF_WIDTH - 2, Math.max(0, height));
        view.gas.visible = height > 0.5;
        continue;
      }
      const isSpoon = material === "steel";
      const coat = view.layer.children[view.layer.children.length - 1] as Node;
      const gained = Math.max(0, mass - ELECTRODE_MASS);
      if (isSpoon) {
        // Silver coats the spoon below the liquid line; its opacity follows the silver deposited.
        disposeChildren(coat);
        coat.addChild(
          new Path(
            new Shape()
              .rect(x - 4, LIQUID_TOP, 8, ELECTRODE_TOP + 170 - LIQUID_TOP)
              .ellipse(x, ELECTRODE_TOP + 196, 17, 30, 0),
            { fill: ElectrochemistryColors.silverColorProperty, opacity: Math.min(1, gained / 0.3) },
          ),
        );
        continue;
      }
      const base = view.layer.children[0] as Node;
      disposeChildren(base);
      disposeChildren(coat);
      const width = product.dissolves ? PLATE_WIDTH * Math.sqrt(Math.max(0, mass) / ELECTRODE_MASS) : PLATE_WIDTH;
      if (width > 0.5) {
        base.addChild(
          new Rectangle(x - width / 2, ELECTRODE_TOP, width, ELECTRODE_BOTTOM - ELECTRODE_TOP, 2, 2, {
            fill: materialColor(material),
            stroke: ElectrochemistryColors.panelBorderColorProperty,
          }),
        );
      }
      if (!product.dissolves && gained > 0) {
        // Plated metal: a coat on the immersed part, thicker as more is deposited.
        const thickness = Math.min(8, 1 + 5 * Math.sqrt(gained));
        coat.addChild(
          new Rectangle(
            x - PLATE_WIDTH / 2 - thickness,
            LIQUID_TOP,
            PLATE_WIDTH + 2 * thickness,
            ELECTRODE_BOTTOM - LIQUID_TOP + thickness,
            2,
            2,
            {
              fill:
                product.formula === "Ag"
                  ? ElectrochemistryColors.silverColorProperty
                  : ElectrochemistryColors.copperColorProperty,
              opacity: 0.95,
            },
          ),
        );
      }
    }
  }

  public step(dt: number): void {
    const current = this.model.currentProperty.value;
    const strength = current > 0 ? 0.15 + 0.85 * Math.min(1, current / FULL_BRIGHTNESS_CURRENT) : 0;
    this.cathodeElectrons?.step(dt, ELECTRON_SPEED * strength);
    this.anodeElectrons?.step(dt, ELECTRON_SPEED * strength);
    if (this.cathodeElectrons && this.anodeElectrons) {
      this.cathodeElectrons.visible = current > 0;
      this.anodeElectrons.visible = current > 0;
    }
    for (const [view, volume] of [
      [this.cathodeView, this.model.cathodeGasVolumeProperty.value],
      [this.anodeView, this.model.anodeGasVolumeProperty.value],
    ] as const) {
      const gasLevel = TUBE_TOP + (Math.min(volume, GAS_TUBE_CAPACITY) / GAS_TUBE_CAPACITY) * TUBE_SCALE_LENGTH;
      for (const bubble of view.bubbles.children) {
        bubble.visible = current > 0 && bubble.y > gasLevel;
        if (current > 0) {
          bubble.y -= BUBBLE_SPEED * (0.4 + strength) * dt;
          if (bubble.y < gasLevel) {
            bubble.y = GAS_PLATE_TOP;
          }
        }
      }
    }
  }
}
