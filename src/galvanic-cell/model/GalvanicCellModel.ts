/**
 * GalvanicCellModel.ts
 *
 * The Galvanic Cell screen: two half-cells at 1 M joined by a salt bridge, with a voltmeter
 * across them and a light bulb that can be switched into the circuit. With the bulb in, the clock
 * runs the cell down: the anode dissolves, the cathode plates, and the ions' concentrations drift
 * until the cathode's ion is used up.
 */

import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { ElectrochemicalCell } from "../../common/model/ElectrochemicalCell.js";
import { timeScaleFor } from "../../common/model/timeScale.js";
import { TimeModel } from "../../common/TimeModel.js";
import { CELL_TIME_SCALE, STANDARD_CONCENTRATION } from "../../ElectrochemistryConstants.js";

export class GalvanicCellModel implements TModel {
  public readonly cell = new ElectrochemicalCell({ initialConcentration: STANDARD_CONCENTRATION });
  public readonly timer = new TimeModel(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.SLOW);

  /** Show the half-reactions, overall reaction and cell notation. */
  public readonly showReactionsProperty = new BooleanProperty(true);

  /** Show ions in the beakers and salt bridge. */
  public readonly showIonsProperty = new BooleanProperty(true);

  public reset(): void {
    this.cell.reset();
    this.timer.reset();
    this.timeSpeedProperty.reset();
    this.showReactionsProperty.reset();
    this.showIonsProperty.reset();
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
