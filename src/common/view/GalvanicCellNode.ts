import { GALVANIC_CELL_NODE_SETTINGS } from "../../ElectrochemistryConstants.js";
/**
 * GalvanicCellNode.ts
 *
 * The whole galvanic cell, shared by the Galvanic Cell screen (full size, with labels) and the
 * Nernst screen (scaled down, without): two half-cell beakers, the salt bridge, the external wire
 * with a light bulb and a knife switch, and a voltmeter across the electrodes (black lead left,
 * red lead right).
 *
 * With current flowing, electrons move through the wire from anode to cathode at a speed that
 * follows the current, K⁺ in the salt bridge drifts towards the cathode and NO₃⁻ towards the
 * anode, and the bulb glows. Clicking the switch toggles it, and clicking the salt bridge
 * toggles it when `interactiveSaltBridge` is set (the Galvanic Cell panel's checkboxes do the
 * same from the keyboard).
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { LineStyles, Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Line, Node, Path, PressListener, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";
import { CURRENT_THRESHOLD, FONT_SIZE, FULL_BRIGHTNESS_CURRENT } from "../../ElectrochemistryConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElectrochemicalCell, Side } from "../model/ElectrochemicalCell.js";
import { ElectronFlowNode, wirePath } from "./ElectronFlowNode.js";
import { couple, formatConcentration, formatPotential, halfCellNameProperty } from "./formatValues.js";
import { BEAKER_HEIGHT, BEAKER_WIDTH, HalfCellBeakerNode } from "./HalfCellBeakerNode.js";
import { MeterNode } from "./MeterNode.js";

const LEFT_BEAKER_X = 0;
const RIGHT_BEAKER_X: number = GALVANIC_CELL_NODE_SETTINGS.RIGHT_BEAKER_X;
const BEAKER_Y: number = GALVANIC_CELL_NODE_SETTINGS.BEAKER_Y;
const LEFT_ELECTRODE_X: number = GALVANIC_CELL_NODE_SETTINGS.LEFT_ELECTRODE_X;
const RIGHT_ELECTRODE_X: number = GALVANIC_CELL_NODE_SETTINGS.RIGHT_ELECTRODE_X;
const LEFT_BRIDGE_X: number = GALVANIC_CELL_NODE_SETTINGS.LEFT_BRIDGE_X;
const RIGHT_BRIDGE_X: number = GALVANIC_CELL_NODE_SETTINGS.RIGHT_BRIDGE_X;
const BRIDGE_TOP: number = GALVANIC_CELL_NODE_SETTINGS.BRIDGE_TOP;
const BRIDGE_BOTTOM: number = GALVANIC_CELL_NODE_SETTINGS.BRIDGE_BOTTOM;
const WIRE_Y: number = GALVANIC_CELL_NODE_SETTINGS.WIRE_Y;
const LEAD_Y: number = GALVANIC_CELL_NODE_SETTINGS.LEAD_Y;
const BULB_X: number = GALVANIC_CELL_NODE_SETTINGS.BULB_X;
const SWITCH_LEFT: number = GALVANIC_CELL_NODE_SETTINGS.SWITCH_LEFT;
const SWITCH_LENGTH: number = GALVANIC_CELL_NODE_SETTINGS.SWITCH_LENGTH;
const SWITCH_OPEN_ANGLE: number = GALVANIC_CELL_NODE_SETTINGS.SWITCH_OPEN_ANGLE;
const ELECTRON_SPEED: number = GALVANIC_CELL_NODE_SETTINGS.ELECTRON_SPEED;
const BRIDGE_ION_SPEED: number = GALVANIC_CELL_NODE_SETTINGS.BRIDGE_ION_SPEED;
const BRIDGE_IONS: number = GALVANIC_CELL_NODE_SETTINGS.BRIDGE_IONS;

export type GalvanicCellNodeOptions = {
  showIonsProperty: TReadOnlyProperty<boolean>;
  conventionalCurrentProperty: TReadOnlyProperty<boolean>;
  /** Name, role and concentration under each beaker. */
  showLabels: boolean;
  /**
   * Pointer toggle for the salt bridge. The Galvanic Cell screen pairs this with a checkbox.
   * The Nernst screen turns it off: the bridge stays in, and its equation uses the cell
   * potential rather than the open-circuit voltmeter reading.
   */
  interactiveSaltBridge?: boolean;
};

type BridgeIon = { node: Circle; distance: number; offset: number; cation: boolean };

export class GalvanicCellNode extends Node {
  private readonly cell: ElectrochemicalCell;
  private readonly leftBeaker: HalfCellBeakerNode;
  private readonly rightBeaker: HalfCellBeakerNode;
  private readonly electrons: ElectronFlowNode;
  private readonly bridgeIons: BridgeIon[] = [];
  private readonly bridgePoints = [
    new Vector2(LEFT_BRIDGE_X, BRIDGE_BOTTOM),
    new Vector2(LEFT_BRIDGE_X, BRIDGE_TOP),
    new Vector2(RIGHT_BRIDGE_X, BRIDGE_TOP),
    new Vector2(RIGHT_BRIDGE_X, BRIDGE_BOTTOM),
  ];
  private readonly bridgeLength: number;

  public constructor(cell: ElectrochemicalCell, options: GalvanicCellNodeOptions) {
    super();
    this.cell = cell;
    const interactiveSaltBridge = options.interactiveSaltBridge ?? true;
    const common = StringManager.getInstance().getCommonStrings();

    this.leftBeaker = new HalfCellBeakerNode(cell.left, LEFT_ELECTRODE_X, LEFT_BRIDGE_X, options.showIonsProperty);
    this.leftBeaker.translation = new Vector2(LEFT_BEAKER_X, BEAKER_Y);
    this.rightBeaker = new HalfCellBeakerNode(
      cell.right,
      RIGHT_ELECTRODE_X - RIGHT_BEAKER_X,
      RIGHT_BRIDGE_X - RIGHT_BEAKER_X,
      options.showIonsProperty,
    );
    this.rightBeaker.translation = new Vector2(RIGHT_BEAKER_X, BEAKER_Y);
    const leftTop = this.leftBeaker.localToParentPoint(this.leftBeaker.electrodeTop);
    const rightTop = this.rightBeaker.localToParentPoint(this.rightBeaker.electrodeTop);

    // ── Salt bridge ─────────────────────────────────────────────────────────────
    const bridgeShape = ElectronFlowNode.wireShape(this.bridgePoints);
    this.bridgeLength = 2 * (BRIDGE_BOTTOM - BRIDGE_TOP) + (RIGHT_BRIDGE_X - LEFT_BRIDGE_X);
    const bridgeIonLayer = new Node({ pickable: false });
    for (let i = 0; i < 2 * BRIDGE_IONS; i++) {
      const cation = i % 2 === 0;
      const node = new Circle(GALVANIC_CELL_NODE_SETTINGS.NODE_RADIUS, {
        fill: cation
          ? ElectrochemistryColors.bridgeCationColorProperty
          : ElectrochemistryColors.bridgeAnionColorProperty,
      });
      bridgeIonLayer.addChild(node);
      this.bridgeIons.push({
        node,
        cation,
        distance: (i * this.bridgeLength) / (2 * BRIDGE_IONS),
        offset: cation ? -3.5 : 3.5,
      });
    }
    const bridge = new Node({
      cursor: interactiveSaltBridge ? "pointer" : null,
      children: [
        new Path(bridgeShape, {
          stroke: ElectrochemistryColors.glassColorProperty,
          lineWidth: GALVANIC_CELL_NODE_SETTINGS.BRIDGE_LINE_WIDTH,
          lineJoin: "round",
        }),
        new Path(bridgeShape, {
          stroke: ElectrochemistryColors.saltBridgeColorProperty,
          lineWidth: GALVANIC_CELL_NODE_SETTINGS.BRIDGE_ITEM_2_LINE_WIDTH,
          lineJoin: "round",
        }),
        bridgeIonLayer,
        new Text("KNO₃", {
          font: new PhetFont(FONT_SIZE.tiny),
          fill: ElectrochemistryColors.controlSurfaceTextColorProperty,
          centerX: BULB_X,
          centerY: BRIDGE_TOP,
        }),
      ],
      visibleProperty: cell.saltBridgeProperty,
    });
    const bridgeGhost = new Path(bridgeShape, {
      stroke: ElectrochemistryColors.glassColorProperty,
      lineWidth: GALVANIC_CELL_NODE_SETTINGS.BRIDGE_GHOST_LINE_WIDTH,
      lineDash: [
        GALVANIC_CELL_NODE_SETTINGS.BRIDGE_GHOST_LINE_DASH_DASH,
        GALVANIC_CELL_NODE_SETTINGS.CONSTRUCTOR_BRIDGE_GHOST_LINE_DASH_DASH,
      ],
      cursor: interactiveSaltBridge ? "pointer" : null,
      visibleProperty: DerivedProperty.not(cell.saltBridgeProperty),
    });
    if (interactiveSaltBridge) {
      // The ghost is thin; give it the full bridge as its touch area.
      bridgeGhost.touchArea = bridgeShape.getStrokedShape(
        new LineStyles({ lineWidth: GALVANIC_CELL_NODE_SETTINGS.TOUCH_AREA_LINE_WIDTH }),
      );
      bridgeGhost.mouseArea = bridgeGhost.touchArea;
      for (const node of [bridge, bridgeGhost]) {
        node.addInputListener(new PressListener({ press: () => cell.saltBridgeProperty.toggle() }));
      }
    }

    // ── External circuit: wire, bulb and switch ─────────────────────────────────
    const switchRight = SWITCH_LEFT + SWITCH_LENGTH;
    const wirePoints = [leftTop, new Vector2(leftTop.x, WIRE_Y), new Vector2(rightTop.x, WIRE_Y), rightTop];
    const leftWire = wirePath([leftTop, new Vector2(leftTop.x, WIRE_Y), new Vector2(SWITCH_LEFT, WIRE_Y)]);
    const rightWire = wirePath([new Vector2(switchRight, WIRE_Y), new Vector2(rightTop.x, WIRE_Y), rightTop]);
    const blade = new Line(0, 0, SWITCH_LENGTH, 0, {
      stroke: ElectrochemistryColors.wireColorProperty,
      lineWidth: GALVANIC_CELL_NODE_SETTINGS.BLADE_LINE_WIDTH,
      lineCap: "round",
      x: SWITCH_LEFT,
      y: WIRE_Y,
    });
    const switchNode = new Node({
      cursor: "pointer",
      children: [
        blade,
        new Circle(GALVANIC_CELL_NODE_SETTINGS.SWITCH_NODE_RADIUS, {
          fill: ElectrochemistryColors.wireColorProperty,
          x: SWITCH_LEFT,
          y: WIRE_Y,
        }),
        new Circle(GALVANIC_CELL_NODE_SETTINGS.SWITCH_NODE_RADIUS, {
          fill: ElectrochemistryColors.wireColorProperty,
          x: switchRight,
          y: WIRE_Y,
        }),
      ],
    });
    switchNode.touchArea = Shape.rect(
      SWITCH_LEFT - 8,
      WIRE_Y - 30,
      SWITCH_LENGTH + 16,
      GALVANIC_CELL_NODE_SETTINGS.TOUCH_AREA_HEIGHT,
    );
    switchNode.mouseArea = switchNode.touchArea;
    switchNode.addInputListener(new PressListener({ press: () => cell.circuitClosedProperty.toggle() }));
    cell.circuitClosedProperty.link((closed) => {
      blade.rotation = closed ? 0 : SWITCH_OPEN_ANGLE;
    });

    const glow = new Circle(1, {
      fill: ElectrochemistryColors.bulbOnColorProperty,
      x: BULB_X,
      y: WIRE_Y - GALVANIC_CELL_NODE_SETTINGS.GLOW_Y_OFFSET,
    });
    const bulb = new Node({
      children: [
        glow,
        new Circle(GALVANIC_CELL_NODE_SETTINGS.BULB_RADIUS, {
          fill: ElectrochemistryColors.bulbOffColorProperty,
          stroke: ElectrochemistryColors.glassColorProperty,
          x: BULB_X,
          y: WIRE_Y - GALVANIC_CELL_NODE_SETTINGS.BULB_Y_OFFSET,
        }),
        new Path(
          new Shape()
            .moveTo(BULB_X - 5, WIRE_Y - 8)
            .lineTo(BULB_X - 4, WIRE_Y - 20)
            .lineTo(BULB_X + 4, WIRE_Y - 20)
            .lineTo(BULB_X + 5, WIRE_Y - 8),
          {
            stroke: ElectrochemistryColors.panelBorderColorProperty,
            lineWidth: GALVANIC_CELL_NODE_SETTINGS.BULB_LINE_WIDTH,
          },
        ),
        new Rectangle(
          BULB_X - 7,
          WIRE_Y - 7,
          GALVANIC_CELL_NODE_SETTINGS.BULB_WIDTH,
          GALVANIC_CELL_NODE_SETTINGS.BULB_HEIGHT,
          { fill: ElectrochemistryColors.blackLeadColorProperty },
        ),
      ],
    });
    cell.currentProperty.link((current) => {
      const brightness = Math.min(1, Math.abs(current) / FULL_BRIGHTNESS_CURRENT);
      glow.radius =
        GALVANIC_CELL_NODE_SETTINGS.CONSTRUCTOR_RADIUS_OFFSET +
        GALVANIC_CELL_NODE_SETTINGS.CONSTRUCTOR_RADIUS_FACTOR * brightness;
      glow.opacity = Math.abs(current) > CURRENT_THRESHOLD ? 0.2 + 0.7 * brightness : 0;
    });

    this.electrons = new ElectronFlowNode(wirePoints);
    const flowing = new DerivedProperty(
      [cell.currentProperty, cell.circuitClosedProperty],
      (current, closed) => closed && Math.abs(current) > CURRENT_THRESHOLD,
    );
    this.electrons.visibleProperty = flowing;

    // Conventional current runs opposite to the electrons in the external wire.
    const conventionalArrow = new ArrowNode(0, 0, GALVANIC_CELL_NODE_SETTINGS.CONVENTIONAL_ARROW_END_X, 0, {
      fill: ElectrochemistryColors.redLeadColorProperty,
      stroke: null,
      headHeight: GALVANIC_CELL_NODE_SETTINGS.CONVENTIONAL_ARROW_HEAD_HEIGHT,
      headWidth: GALVANIC_CELL_NODE_SETTINGS.CONVENTIONAL_ARROW_HEAD_WIDTH,
      tailWidth: GALVANIC_CELL_NODE_SETTINGS.CONVENTIONAL_ARROW_TAIL_WIDTH,
    });
    const conventionalLabel = new RichText(common.conventionalCurrentStringProperty, {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: ElectrochemistryColors.redLeadColorProperty,
    });
    const conventional = new Node({ children: [conventionalArrow, conventionalLabel] });
    Multilink.multilink(
      [flowing, options.conventionalCurrentProperty, cell.currentProperty],
      (isFlowing, show, current) => {
        conventional.visible = isFlowing && show;
        // Electrons left → right (current > 0) means conventional current right → left.
        conventionalArrow.setTailAndTip(current > 0 ? 60 : 0, 0, current > 0 ? 0 : 60, 0);
        conventionalArrow.x = GALVANIC_CELL_NODE_SETTINGS.CONVENTIONAL_ARROW_X;
        conventionalArrow.y = WIRE_Y - GALVANIC_CELL_NODE_SETTINGS.CONSTRUCTOR_Y_OFFSET;
        conventionalLabel.centerX = conventionalArrow.centerX;
        conventionalLabel.bottom = conventionalArrow.top - 2;
      },
    );

    // ── Voltmeter ───────────────────────────────────────────────────────────────
    const readingProperty = new DerivedProperty(
      [cell.voltmeterReadingProperty, common.voltsPatternStringProperty],
      (reading, pattern) => StringUtils.fillIn(pattern, { value: formatPotential(reading) }),
    );
    const voltmeter = new MeterNode({
      lines: [readingProperty],
      caption: common.voltmeterStringProperty,
      redLabel: "+",
      blackLabel: "COM",
    });
    voltmeter.centerX = BULB_X;
    voltmeter.top = WIRE_Y + GALVANIC_CELL_NODE_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
    const black = voltmeter.localToParentPoint(voltmeter.blackTerminal);
    const red = voltmeter.localToParentPoint(voltmeter.redTerminal);
    const lead = (from: Vector2, toX: number, color: typeof ElectrochemistryColors.redLeadColorProperty) =>
      new Path(
        new Shape()
          .moveToPoint(from)
          .lineTo(from.x, LEAD_Y)
          .lineTo(toX, LEAD_Y)
          .lineTo(toX, LEAD_Y - 6),
        {
          stroke: color,
          lineWidth: GALVANIC_CELL_NODE_SETTINGS.LEAD_LINE_WIDTH,
        },
      );
    const leads = new Node({
      children: [
        lead(black, leftTop.x, ElectrochemistryColors.blackLeadColorProperty),
        lead(red, rightTop.x, ElectrochemistryColors.redLeadColorProperty),
        new Circle(GALVANIC_CELL_NODE_SETTINGS.LEADS_RADIUS, {
          fill: ElectrochemistryColors.blackLeadColorProperty,
          x: leftTop.x,
          y: LEAD_Y - GALVANIC_CELL_NODE_SETTINGS.LEADS_Y_OFFSET,
        }),
        new Circle(GALVANIC_CELL_NODE_SETTINGS.LEADS_RADIUS, {
          fill: ElectrochemistryColors.redLeadColorProperty,
          x: rightTop.x,
          y: LEAD_Y - GALVANIC_CELL_NODE_SETTINGS.LEADS_Y_OFFSET,
        }),
      ],
    });

    const children: Node[] = [
      this.leftBeaker,
      this.rightBeaker,
      bridgeGhost,
      bridge,
      leftWire,
      rightWire,
      switchNode,
      bulb,
      leads,
      voltmeter,
      this.electrons,
      conventional,
    ];
    if (options.showLabels) {
      children.push(this.createLabel("left", LEFT_BEAKER_X), this.createLabel("right", RIGHT_BEAKER_X));
    }
    this.children = children;
  }

  /** Role (anode/cathode), half-cell and concentration under one beaker. */
  private createLabel(side: Side, beakerX: number): Node {
    const common = StringManager.getInstance().getCommonStrings();
    const state = this.cell.stateOf(side);
    const width = BEAKER_WIDTH + 70;
    const role = new RichText("", { font: new PhetFont({ size: FONT_SIZE.small, weight: "bold" }), maxWidth: width });
    const name = new RichText("", {
      font: new PhetFont(FONT_SIZE.small),
      fill: ElectrochemistryColors.textColorProperty,
      maxWidth: width,
    });
    const concentration = new RichText("", {
      font: new PhetFont(FONT_SIZE.small),
      fill: ElectrochemistryColors.textColorProperty,
      maxWidth: width,
    });
    Multilink.multilinkAny(
      [
        this.cell.anodeSideProperty,
        this.cell.saltBridgeProperty,
        common.anodeSignStringProperty,
        common.cathodeSignStringProperty,
        common.oxidationStringProperty,
        common.reductionStringProperty,
      ],
      () => {
        const anodeSide = this.cell.anodeSideProperty.value;
        if (anodeSide === null) {
          role.string = "";
          return;
        }
        const isAnode = anodeSide === side;
        role.string = `${isAnode ? common.anodeSignStringProperty.value : common.cathodeSignStringProperty.value} · ${
          isAnode ? common.oxidationStringProperty.value : common.reductionStringProperty.value
        }`;
        role.fill = isAnode ? ElectrochemistryColors.anodeColorProperty : ElectrochemistryColors.cathodeColorProperty;
      },
    );
    Multilink.multilinkAny([state.halfCellProperty, common.halfCellMenuPatternStringProperty], () => {
      const halfCell = state.halfCellProperty.value;
      name.string = StringUtils.fillIn(common.halfCellMenuPatternStringProperty.value, {
        name: halfCellNameProperty(halfCell.id).value,
        couple: couple(halfCell),
      });
    });
    Multilink.multilinkAny(
      [state.halfCellProperty, state.concentrationProperty, common.concentrationRowPatternStringProperty],
      () => {
        concentration.string = StringUtils.fillIn(common.concentrationRowPatternStringProperty.value, {
          ion: state.halfCellProperty.value.ion,
          value: formatConcentration(state.concentrationProperty.value),
        });
      },
    );
    const box = new VBox({ spacing: GALVANIC_CELL_NODE_SETTINGS.BOX_SPACING, children: [role, name, concentration] });
    box.localBoundsProperty.link(() => {
      box.centerX = beakerX + BEAKER_WIDTH / 2;
      box.top = BEAKER_Y + BEAKER_HEIGHT + GALVANIC_CELL_NODE_SETTINGS.CREATE_LABEL_TOP_OFFSET;
    });
    return box;
  }

  public step(dt: number): void {
    this.leftBeaker.step(dt);
    this.rightBeaker.step(dt);
    const current = this.cell.currentProperty.value;
    const flowing = Math.abs(current) > CURRENT_THRESHOLD;
    const strength = flowing ? 0.15 + 0.85 * Math.min(1, Math.abs(current) / FULL_BRIGHTNESS_CURRENT) : 0;
    this.electrons.step(dt, Math.sign(current) * ELECTRON_SPEED * strength);

    // Bridge distance runs from the left beaker to the right. Cations move towards the cathode:
    // rightwards when the left electrode is the anode (current > 0).
    const drift = Math.sign(current) * BRIDGE_ION_SPEED * strength;
    for (const ion of this.bridgeIons) {
      if (drift !== 0) {
        ion.distance =
          (((ion.distance + (ion.cation ? drift : -drift) * dt) % this.bridgeLength) + this.bridgeLength) %
          this.bridgeLength;
      }
      ion.node.translation = this.bridgePoint(ion.distance, ion.offset);
    }
  }

  /** A point `distance` along the salt bridge, offset sideways by `offset`. */
  private bridgePoint(distance: number, offset: number): Vector2 {
    const leg = BRIDGE_BOTTOM - BRIDGE_TOP;
    const span = RIGHT_BRIDGE_X - LEFT_BRIDGE_X;
    if (distance < leg) {
      return new Vector2(LEFT_BRIDGE_X + offset, BRIDGE_BOTTOM - distance);
    }
    if (distance < leg + span) {
      return new Vector2(LEFT_BRIDGE_X + distance - leg, BRIDGE_TOP + offset);
    }
    return new Vector2(RIGHT_BRIDGE_X - offset, BRIDGE_TOP + distance - leg - span);
  }
}
