/**
 * HalfCellBeakerNode.ts
 *
 * One half-cell: a beaker of ion solution (tinted by concentration for coloured ions), the
 * electrode standing in it, and, optionally, the ions as particles. Local coordinates put the
 * beaker's top-left corner at the origin; the electrode rises above it to ELECTRODE_TOP.
 *
 * The electrode's width follows its mass, so a dissolving anode thins and a cathode thickens. The
 * number of ion particles follows the concentration: new ions appear at a dissolving electrode, and
 * ions are taken out next to a plating one. The hydrogen electrode is a platinum plate under a
 * glass hood with H₂ bubbling out of it.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { dotRandom, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Color, Line, Node, Path, Rectangle } from "scenerystack/scenery";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";
import { ELECTRODE_MASS } from "../../ElectrochemistryConstants.js";
import type { HalfCellState } from "../model/ElectrochemicalCell.js";
import { isGasElectrode } from "../model/HalfCells.js";
import { disposeChildren } from "./disposeChildren.js";
import { electrodeColor, ionColor, solutionTint } from "./halfCellColors.js";

export const BEAKER_WIDTH = 170;
export const BEAKER_HEIGHT = 160;
/** Liquid surface, below the beaker's rim. */
export const LIQUID_TOP = 30;
/** Top of the electrode (where wires attach), above the rim. */
export const ELECTRODE_TOP = -40;
const ELECTRODE_BOTTOM = 140;
const ELECTRODE_WIDTH = 24;
const IONS_PER_MOLAR = 10;
const MAX_IONS = 30;
const ION_RADIUS = 6;
const ION_SPEED = 22;
const BUBBLE_SPEED = 40;

type Particle = { node: Circle; position: Vector2; velocity: Vector2 };

export class HalfCellBeakerNode extends Node {
  private readonly state: HalfCellState;
  private readonly electrodeX: number;
  private readonly bridgeX: number;
  private readonly electrodeLayer = new Node();
  private readonly ionLayer = new Node();
  private readonly bubbleLayer = new Node();
  private readonly particles: Particle[] = [];
  private electrodeHalfWidth = ELECTRODE_WIDTH / 2;

  /**
   * @param state - the half-cell drawn
   * @param electrodeX - x of the electrode's centre (local)
   * @param bridgeX - x of the salt bridge's leg, kept clear of ions (local)
   * @param showIonsProperty - whether ion particles are drawn
   */
  public constructor(
    state: HalfCellState,
    electrodeX: number,
    bridgeX: number,
    showIonsProperty: TReadOnlyProperty<boolean>,
  ) {
    super();
    this.state = state;
    this.electrodeX = electrodeX;
    this.bridgeX = bridgeX;

    const solution = new Rectangle(2, LIQUID_TOP, BEAKER_WIDTH - 4, BEAKER_HEIGHT - LIQUID_TOP - 2);
    Multilink.multilinkAny(
      [
        state.concentrationProperty,
        state.halfCellProperty,
        ElectrochemistryColors.waterColorProperty,
        ElectrochemistryColors.copperTintColorProperty,
        ElectrochemistryColors.nickelTintColorProperty,
        ElectrochemistryColors.ironTintColorProperty,
      ],
      () => {
        const tint = solutionTint(state.halfCellProperty.value);
        const water = ElectrochemistryColors.waterColorProperty.value;
        const strength = Math.min(1, state.concentrationProperty.value) ** 0.6;
        solution.fill = tint ? Color.interpolateRGBA(water, tint.value, strength) : water;
      },
    );

    // An open-topped beaker.
    const beaker = new Path(
      new Shape().moveTo(0, 0).lineTo(0, BEAKER_HEIGHT).lineTo(BEAKER_WIDTH, BEAKER_HEIGHT).lineTo(BEAKER_WIDTH, 0),
      { stroke: ElectrochemistryColors.glassColorProperty, lineWidth: 2.5 },
    );

    this.ionLayer.visibleProperty = showIonsProperty;
    this.children = [solution, this.bubbleLayer, this.ionLayer, this.electrodeLayer, beaker];

    state.halfCellProperty.link(() => {
      this.rebuildElectrode();
      this.clearIons();
    });
    state.massProperty.link(() => this.rebuildElectrode());
    this.syncIonCount();
  }

  /** Where wires attach, in local coordinates. */
  public get electrodeTop(): Vector2 {
    return new Vector2(this.electrodeX, ELECTRODE_TOP);
  }

  private rebuildElectrode(): void {
    disposeChildren(this.electrodeLayer);
    disposeChildren(this.bubbleLayer);
    const halfCell = this.state.halfCellProperty.value;
    const x = this.electrodeX;
    if (isGasElectrode(halfCell)) {
      this.electrodeHalfWidth = 20;
      const hood = new Path(
        new Shape()
          .moveTo(x - 18, ELECTRODE_BOTTOM - 4)
          .lineTo(x - 18, ELECTRODE_TOP + 40)
          .arc(x, ELECTRODE_TOP + 40, 18, Math.PI, 0)
          .lineTo(x + 18, ELECTRODE_BOTTOM - 4),
        { stroke: ElectrochemistryColors.glassColorProperty, lineWidth: 2 },
      );
      const gas = new Rectangle(x - 17, ELECTRODE_TOP + 40, 34, LIQUID_TOP - ELECTRODE_TOP - 34, {
        fill: ElectrochemistryColors.bubbleColorProperty,
        opacity: 0.25,
      });
      const inlet = new Line(x + 18, ELECTRODE_TOP + 48, x + 40, ELECTRODE_TOP + 48, {
        stroke: ElectrochemistryColors.glassColorProperty,
        lineWidth: 3,
      });
      this.electrodeLayer.children = [
        gas,
        new Line(x, ELECTRODE_TOP, x, ELECTRODE_BOTTOM - 40, {
          stroke: ElectrochemistryColors.wireColorProperty,
          lineWidth: 2,
        }),
        new Rectangle(x - 7, ELECTRODE_BOTTOM - 40, 14, 34, {
          fill: electrodeColor(halfCell),
          stroke: ElectrochemistryColors.panelBorderColorProperty,
        }),
        hood,
        inlet,
      ];
      for (let i = 0; i < 6; i++) {
        this.bubbleLayer.addChild(
          new Circle(2.5 + (i % 3), {
            stroke: ElectrochemistryColors.bubbleColorProperty,
            x: x + (i % 2 === 0 ? -24 : 24),
            y: ELECTRODE_BOTTOM - (i * (ELECTRODE_BOTTOM - LIQUID_TOP)) / 6,
          }),
        );
      }
    } else {
      const width = ELECTRODE_WIDTH * Math.sqrt(Math.max(0, this.state.massProperty.value) / ELECTRODE_MASS);
      this.electrodeHalfWidth = width / 2;
      if (width > 0.5) {
        this.electrodeLayer.addChild(
          new Rectangle(x - width / 2, ELECTRODE_TOP, width, ELECTRODE_BOTTOM - ELECTRODE_TOP, 2, 2, {
            fill: electrodeColor(halfCell),
            stroke: ElectrochemistryColors.panelBorderColorProperty,
          }),
        );
      } else {
        // Dissolved: the clip and wire end are left hanging.
        this.electrodeLayer.addChild(
          new Line(x, ELECTRODE_TOP, x, ELECTRODE_TOP + 20, {
            stroke: ElectrochemistryColors.wireColorProperty,
            lineWidth: 2,
          }),
        );
      }
    }
  }

  private clearIons(): void {
    for (const particle of this.particles) {
      particle.node.dispose();
    }
    this.particles.length = 0;
    this.ionLayer.removeAllChildren();
  }

  private allowed(position: Vector2): boolean {
    const clearOfElectrode = Math.abs(position.x - this.electrodeX) > this.electrodeHalfWidth + ION_RADIUS + 2;
    const clearOfBridge = Math.abs(position.x - this.bridgeX) > 14 + ION_RADIUS || position.y > 118;
    return clearOfElectrode && clearOfBridge;
  }

  private randomPosition(): Vector2 {
    for (let attempt = 0; attempt < 40; attempt++) {
      const position = new Vector2(
        dotRandom.nextDoubleBetween(ION_RADIUS + 4, BEAKER_WIDTH - ION_RADIUS - 4),
        dotRandom.nextDoubleBetween(LIQUID_TOP + ION_RADIUS + 6, BEAKER_HEIGHT - ION_RADIUS - 4),
      );
      if (this.allowed(position)) {
        return position;
      }
    }
    return new Vector2(BEAKER_WIDTH / 2, BEAKER_HEIGHT - 20);
  }

  /** A position just beside the electrode, on the side facing the middle of the beaker. */
  private besideElectrode(): Vector2 {
    const towardMiddle = this.electrodeX < BEAKER_WIDTH / 2 ? 1 : -1;
    return new Vector2(
      this.electrodeX + towardMiddle * (this.electrodeHalfWidth + ION_RADIUS + 3),
      dotRandom.nextDoubleBetween(LIQUID_TOP + 20, BEAKER_HEIGHT - 20),
    );
  }

  private addParticle(position: Vector2): void {
    const node = new Circle(ION_RADIUS, {
      fill: ionColor(this.state.halfCellProperty.value),
      stroke: ElectrochemistryColors.panelBorderColorProperty,
      translation: position,
    });
    const angle = dotRandom.nextDoubleBetween(0, 2 * Math.PI);
    this.particles.push({ node, position, velocity: Vector2.createPolar(ION_SPEED, angle) });
    this.ionLayer.addChild(node);
  }

  /** Adds or removes ions so their number follows the concentration. */
  private syncIonCount(): void {
    const target = Math.min(MAX_IONS, Math.round(this.state.concentrationProperty.value * IONS_PER_MOLAR));
    const growing = this.particles.length > 0;
    while (this.particles.length < target) {
      this.addParticle(growing ? this.besideElectrode() : this.randomPosition());
    }
    while (this.particles.length > target) {
      // The ion nearest the electrode is the one reduced onto it.
      let nearest = 0;
      this.particles.forEach((particle, i) => {
        const best = this.particles[nearest] as Particle;
        if (Math.abs(particle.position.x - this.electrodeX) < Math.abs(best.position.x - this.electrodeX)) {
          nearest = i;
        }
      });
      const [removed] = this.particles.splice(nearest, 1);
      if (removed) {
        this.ionLayer.removeChild(removed.node);
        removed.node.dispose();
      }
    }
  }

  /** Animates the ions and the hydrogen electrode's bubbles (H₂ is fed in continuously). */
  public step(dt: number): void {
    this.syncIonCount();
    if (this.ionLayer.visible) {
      for (const particle of this.particles) {
        if (dotRandom.nextDouble() < dt * 1.5) {
          particle.velocity = Vector2.createPolar(ION_SPEED, dotRandom.nextDoubleBetween(0, 2 * Math.PI));
        }
        const next = particle.position.plus(particle.velocity.timesScalar(dt));
        const inside =
          next.x > ION_RADIUS + 3 &&
          next.x < BEAKER_WIDTH - ION_RADIUS - 3 &&
          next.y > LIQUID_TOP + ION_RADIUS + 4 &&
          next.y < BEAKER_HEIGHT - ION_RADIUS - 3;
        if (inside && this.allowed(next)) {
          particle.position = next;
          particle.node.translation = next;
        } else {
          particle.velocity = particle.velocity.negated();
        }
      }
    }
    for (const bubble of this.bubbleLayer.children) {
      bubble.y -= BUBBLE_SPEED * dt;
      if (bubble.y < LIQUID_TOP + 4) {
        bubble.y = ELECTRODE_BOTTOM;
      }
    }
  }
}
