/**
 * NernstModel.ts
 *
 * The Nernst screen: the same cell as the Galvanic Cell screen, written with the left electrode
 * as the anode and the right as the cathode whatever the potentials, so E can come out negative
 * ("not spontaneous as written"). Each concentration is set on a log scale, the temperature in
 * degrees Celsius. With the bulb connected the cell runs until E = 0 (Q = K), or until the
 * cathode's ion is practically gone.
 */

import { BooleanProperty, EnumerationProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { ElectrochemicalCell, type HalfCellState } from "../../common/model/ElectrochemicalCell.js";
import { HALF_CELLS } from "../../common/model/HalfCells.js";
import { timeScaleFor } from "../../common/model/timeScale.js";
import { TimeModel } from "../../common/TimeModel.js";
import {
  CELL_TIME_SCALE,
  CELSIUS_OFFSET,
  CONCENTRATION_RANGE,
  STANDARD_TEMPERATURE,
  TEMPERATURE_RANGE,
} from "../../ElectrochemistryConstants.js";

/** Slider range of log₁₀[ion]. */
export const LOG_CONCENTRATION_RANGE = new Range(
  Math.log10(CONCENTRATION_RANGE.min),
  Math.log10(CONCENTRATION_RANGE.max),
);

/** A log₁₀ concentration Property kept in step with a half-cell's concentration, both ways. */
function logConcentrationProperty(state: HalfCellState): NumberProperty {
  const property = new NumberProperty(Math.log10(state.concentrationProperty.value), {
    range: LOG_CONCENTRATION_RANGE,
  });
  let updating = false;
  property.lazyLink((log) => {
    if (!updating) {
      updating = true;
      state.concentrationProperty.value = 10 ** log;
      updating = false;
    }
  });
  // When the cell runs, a concentration can leave the slider's range; the slider then pins at its end.
  state.concentrationProperty.lazyLink((concentration) => {
    if (!updating) {
      updating = true;
      property.value = LOG_CONCENTRATION_RANGE.constrainValue(Math.log10(concentration));
      updating = false;
    }
  });
  return property;
}

export class NernstModel implements TModel {
  public readonly cell = new ElectrochemicalCell({
    leftHalfCell: HALF_CELLS.zn,
    rightHalfCell: HALF_CELLS.cu,
    initialConcentration: 1,
  });
  public readonly leftLogConcentrationProperty = logConcentrationProperty(this.cell.left);
  public readonly rightLogConcentrationProperty = logConcentrationProperty(this.cell.right);
  public readonly temperatureCelsiusProperty = new NumberProperty(STANDARD_TEMPERATURE - CELSIUS_OFFSET, {
    range: new Range(TEMPERATURE_RANGE.min - CELSIUS_OFFSET, TEMPERATURE_RANGE.max - CELSIUS_OFFSET),
    units: "°C",
  });
  public readonly timer = new TimeModel(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.FAST);

  /** Show the Nernst equation with the numbers substituted. */
  public readonly showEquationProperty = new BooleanProperty(true);

  public constructor() {
    this.temperatureCelsiusProperty.link((celsius) => {
      this.cell.temperatureProperty.value = celsius + CELSIUS_OFFSET;
    });
  }

  /** Copper concentration cell: 0.010 M on the anode side, 1.0 M on the cathode side. */
  public concentrationCell(): void {
    this.cell.left.halfCellProperty.value = HALF_CELLS.cu;
    this.cell.right.halfCellProperty.value = HALF_CELLS.cu;
    this.cell.left.concentrationProperty.value = 0.01;
    this.cell.right.concentrationProperty.value = 1;
    this.cell.restartRun();
  }

  /** Swaps the two half-cells (and their concentrations), reversing the reaction as written. */
  public swap(): void {
    const left = this.cell.left;
    const right = this.cell.right;
    const leftHalfCell = left.halfCellProperty.value;
    const leftConcentration = left.concentrationProperty.value;
    const rightConcentration = right.concentrationProperty.value;
    left.halfCellProperty.value = right.halfCellProperty.value;
    right.halfCellProperty.value = leftHalfCell;
    left.concentrationProperty.value = rightConcentration;
    right.concentrationProperty.value = leftConcentration;
    this.cell.restartRun();
  }

  public reset(): void {
    this.cell.reset();
    this.temperatureCelsiusProperty.reset();
    this.timer.reset();
    this.timeSpeedProperty.reset();
    this.showEquationProperty.reset();
  }

  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      this.advance(dt);
    }
  }

  /** Advances by `dt` real seconds at the chosen speed, playing or not (step button). */
  public advance(dt: number): void {
    this.cell.step(dt * timeScaleFor(this.timeSpeedProperty.value, CELL_TIME_SCALE));
  }
}
