/**
 * ElectronFlowNode.ts
 *
 * Electrons drawn as dots moving along a wire (a polyline). The view sets a speed in px/s;
 * positive moves from the first point towards the last.
 */

import type { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path } from "scenerystack/scenery";
import ElectrochemistryColors from "../../ElectrochemistryColors.js";

const SPACING = 26;
const RADIUS = 3.5;

export class ElectronFlowNode extends Node {
  private readonly points: readonly Vector2[];
  private readonly lengths: number[];
  private readonly totalLength: number;
  private readonly dots: Circle[] = [];
  private offset = 0;

  public constructor(points: readonly Vector2[]) {
    super({ pickable: false });
    this.points = points;
    this.lengths = [];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const length = (points[i] as Vector2).distance(points[i - 1] as Vector2);
      this.lengths.push(length);
      total += length;
    }
    this.totalLength = total;
    const count = Math.floor(total / SPACING);
    for (let i = 0; i < count; i++) {
      const dot = new Circle(RADIUS, { fill: ElectrochemistryColors.electronColorProperty });
      this.dots.push(dot);
      this.addChild(dot);
    }
    this.layoutDots();
  }

  /** The wire as a Shape, for drawing it under the electrons. */
  public static wireShape(points: readonly Vector2[]): Shape {
    const shape = new Shape();
    points.forEach((point, i) => {
      if (i === 0) {
        shape.moveToPoint(point);
      } else {
        shape.lineToPoint(point);
      }
    });
    return shape;
  }

  /** Moves the electrons by `speed` px/s for `dt` s. */
  public step(dt: number, speed: number): void {
    if (speed === 0) {
      return;
    }
    this.offset = (((this.offset + speed * dt) % SPACING) + SPACING) % SPACING;
    this.layoutDots();
  }

  private layoutDots(): void {
    this.dots.forEach((dot, i) => {
      dot.translation = this.pointAt(this.offset + i * SPACING);
    });
  }

  private pointAt(distance: number): Vector2 {
    let remaining = Math.min(Math.max(distance, 0), this.totalLength);
    for (let i = 0; i < this.lengths.length; i++) {
      const length = this.lengths[i] as number;
      if (remaining <= length) {
        return (this.points[i] as Vector2).blend(this.points[i + 1] as Vector2, length === 0 ? 0 : remaining / length);
      }
      remaining -= length;
    }
    return this.points[this.points.length - 1] as Vector2;
  }
}

/** A wire drawn along the same polyline. */
export function wirePath(points: readonly Vector2[], lineWidth = 3): Path {
  return new Path(ElectronFlowNode.wireShape(points), {
    stroke: ElectrochemistryColors.wireColorProperty,
    lineWidth,
    lineJoin: "round",
  });
}
