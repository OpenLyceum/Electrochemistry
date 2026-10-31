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

/** Which concentration slider, if either, a pointer is currently dragging. */
export type ConcentrationSliderHeld = { left: boolean; right: boolean };

/**
 * A log₁₀ concentration Property kept in step with a half-cell's concentration, both ways.
 * Outside the slider's range the Property pins at the end (so the thumb stays on the track)
 * while the beaker keeps the true concentration. A key or arrow step then moves that true
 * value. A pointer drag sets whatever concentration the track is pointing at.
 */
function logConcentrationProperty(
  state: HalfCellState,
  side: keyof ConcentrationSliderHeld,
  held: ConcentrationSliderHeld,
): NumberProperty {
  const property = new NumberProperty(Math.log10(state.concentrationProperty.value), {
    range: LOG_CONCENTRATION_RANGE,
  });
  // Property notifications are queued, so a guard flag cleared at the end of a listener does not
  // cover the write-back. Count the notifications this function itself causes and skip them.
  let ignoredPropertyChanges = 0;
  const pinLog = (log: number) => {
    const pinned = LOG_CONCENTRATION_RANGE.constrainValue(log);
    if (!property.areValuesEqual(property.value, pinned)) {
      ignoredPropertyChanges++;
      property.value = pinned;
    }
  };
  property.lazyLink((log, previous) => {
    if (ignoredPropertyChanges > 0) {
      ignoredPropertyChanges--;
      return;
    }
    const trueLog = Math.log10(state.concentrationProperty.value);
    const onTrack = trueLog >= LOG_CONCENTRATION_RANGE.min && trueLog <= LOG_CONCENTRATION_RANGE.max;
    if (onTrack || held[side]) {
      state.concentrationProperty.value = 10 ** log;
    } else {
      const stepped = 10 ** (trueLog + (log - previous));
      state.concentrationProperty.value = stepped;
      pinLog(Math.log10(stepped));
    }
  });
  // When the cell runs, a concentration can leave the slider's range; the thumb then pins at its end.
  state.concentrationProperty.lazyLink((concentration) => {
    pinLog(Math.log10(concentration));
  });
  return property;
}

export class NernstModel implements TModel {
  public readonly cell = new ElectrochemicalCell({
    leftHalfCell: HALF_CELLS.zn,
    rightHalfCell: HALF_CELLS.cu,
    initialConcentration: 1,
  });
  /**
   * True while a pointer is dragging that side's thumb or track. The view sets these.
   * Arrow keys and the +/- buttons leave them false, so those steps follow the true
   * concentration once the cell has run past the track.
   */
  public readonly concentrationSliderHeld: ConcentrationSliderHeld = { left: false, right: false };
  public readonly leftLogConcentrationProperty = logConcentrationProperty(
    this.cell.left,
    "left",
    this.concentrationSliderHeld,
  );
  public readonly rightLogConcentrationProperty = logConcentrationProperty(
    this.cell.right,
    "right",
    this.concentrationSliderHeld,
  );
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

  /** Copper concentration cell, freshly built: 0.010 M on the anode side, 1.0 M on the cathode side. */
  public concentrationCell(): void {
    this.cell.left.halfCellProperty.value = HALF_CELLS.cu;
    this.cell.right.halfCellProperty.value = HALF_CELLS.cu;
    // A beaker that was already copper keeps its half-cell, so refresh its electrode here too.
    this.cell.left.refresh();
    this.cell.right.refresh();
    this.cell.left.concentrationProperty.value = 0.01;
    this.cell.right.concentrationProperty.value = 1;
    this.cell.restartRun();
  }

  /**
   * Swaps the two beakers, each with its solution and electrode, reversing the reaction as
   * written.
   */
  public swap(): void {
    const left = this.cell.left;
    const right = this.cell.right;
    const leftHalfCell = left.halfCellProperty.value;
    const leftConcentration = left.concentrationProperty.value;
    const rightConcentration = right.concentrationProperty.value;
    const leftMass = left.massProperty.value;
    const rightMass = right.massProperty.value;
    // Changing a half-cell refreshes its beaker, so the state is restored after both are set.
    left.halfCellProperty.value = right.halfCellProperty.value;
    right.halfCellProperty.value = leftHalfCell;
    left.concentrationProperty.value = rightConcentration;
    right.concentrationProperty.value = leftConcentration;
    left.massProperty.value = rightMass;
    right.massProperty.value = leftMass;
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
