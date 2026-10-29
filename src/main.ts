/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import ElectrochemistryColors from "./ElectrochemistryColors.js";
import { ElectrolysisScreen } from "./electrolysis/ElectrolysisScreen.js";
import { GalvanicCellScreen } from "./galvanic-cell/GalvanicCellScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import { NernstScreen } from "./nernst/NernstScreen.js";
import { ElectrochemistryPreferencesModel } from "./preferences/ElectrochemistryPreferencesModel.js";
import { ElectrochemistryPreferencesNode } from "./preferences/ElectrochemistryPreferencesNode.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from electrochemistryQueryParameters.
  const simPreferences = new ElectrochemistryPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new GalvanicCellScreen({
      name: stringManager.getScreenNames().galvanicCellStringProperty,
      tandem: Tandem.ROOT.createTandem("galvanicCellScreen"),
      conventionalCurrentProperty: simPreferences.conventionalCurrentProperty,
      backgroundColorProperty: ElectrochemistryColors.backgroundColorProperty,
    }),
    new NernstScreen({
      name: stringManager.getScreenNames().nernstStringProperty,
      tandem: Tandem.ROOT.createTandem("nernstScreen"),
      conventionalCurrentProperty: simPreferences.conventionalCurrentProperty,
      backgroundColorProperty: ElectrochemistryColors.backgroundColorProperty,
    }),
    new ElectrolysisScreen({
      name: stringManager.getScreenNames().electrolysisStringProperty,
      tandem: Tandem.ROOT.createTandem("electrolysisScreen"),
      conventionalCurrentProperty: simPreferences.conventionalCurrentProperty,
      backgroundColorProperty: ElectrochemistryColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new ElectrochemistryPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    credits: {
      leadDesign: "Martin Veillette",
      softwareDevelopment: "Martin Veillette",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
