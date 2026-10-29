/**
 * ElectrochemistryPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in electrochemistryQueryParameters.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import ElectrochemistryNamespace from "../ElectrochemistryNamespace.js";
import electrochemistryQueryParameters from "./electrochemistryQueryParameters.js";

export class ElectrochemistryPreferencesModel {
  /** Also draw the conventional current (opposite to the electrons); initial value from the `conventionalCurrent` query parameter. */
  public readonly conventionalCurrentProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.conventionalCurrentProperty = new BooleanProperty(
      electrochemistryQueryParameters.conventionalCurrent,
      tandem ? { tandem: tandem.createTandem("conventionalCurrentProperty") } : undefined,
    );
  }

  public reset(): void {
    this.conventionalCurrentProperty.reset();
  }
}

ElectrochemistryNamespace.register("ElectrochemistryPreferencesModel", ElectrochemistryPreferencesModel);
