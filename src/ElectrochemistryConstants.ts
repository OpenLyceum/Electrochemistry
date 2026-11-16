/**
 * ElectrochemistryConstants.ts
 *
 * Every named numeric constant of the sim. Chemistry quantities use the units a student reads in
 * the lab rather than strict SI: concentrations in mol/L (M), masses in g, gas volumes in mL,
 * potentials in V, currents in A, charge in C and time in s. Layout and chrome values are in
 * screen pixels. Colours live in ElectrochemistryColors.ts.
 */

import { Range } from "scenerystack/dot";
import ElectrochemistryNamespace from "./ElectrochemistryNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Vertical gap between stacked panels. */
export const PANEL_SPACING = 10;

/** Width of the right-hand control column on every screen. */
export const SIDE_COLUMN_WIDTH = 236;

/** Font sizes (px). */
export const FONT_SIZE = {
  tiny: 11,
  small: 12,
  control: 13,
  label: 14,
  readout: 16,
} as const;

// ── Physical constants ────────────────────────────────────────────────────────

/** Faraday constant (C/mol), CODATA 2018 exact value. */
export const FARADAY = 96485.33212;

/** Molar gas constant (J/(mol·K)), CODATA 2018 exact value. */
export const GAS_CONSTANT = 8.314462618;

/** Standard temperature for tabulated potentials (K). */
export const STANDARD_TEMPERATURE = 298.15;

/** Standard pressure for collected gases (Pa). */
export const STANDARD_PRESSURE = 101325;

/** Offset between kelvin and degrees Celsius. */
export const CELSIUS_OFFSET = 273.15;

// ── Galvanic cells ────────────────────────────────────────────────────────────

/** Volume of solution in each half-cell beaker (L). */
export const HALF_CELL_VOLUME = 0.1;

/** Mass of a fresh metal electrode (g). */
export const ELECTRODE_MASS = 10;

/** Initial concentration of each half-cell's ion on the Galvanic Cell screen (M). */
export const STANDARD_CONCENTRATION = 1;

/** Concentration range of the Nernst screen controls (M), spanned on a log scale. */
export const CONCENTRATION_RANGE = new Range(1e-4, 2);

/** Concentrations never fall below this (M), so logarithms stay finite. */
export const CONCENTRATION_FLOOR = 1e-15;

/** Temperature range of the Nernst screen (K): 0 °C to 100 °C. */
export const TEMPERATURE_RANGE = new Range(273.15, 373.15);

/**
 * Ohmic resistance of the external circuit (light bulb and wires) plus the solutions and salt
 * bridge (Ω). With 1 M solutions a Daniell cell drives about 0.9 A through it.
 */
export const CIRCUIT_RESISTANCE = 1;

/**
 * Mass-transport resistance coefficient (Ω·M): the reducing ion must reach the cathode, so an
 * extra R_MT / [ion] is in series. It makes the current fall to zero as the cathode's ion is used
 * up, instead of continuing at E / R with nothing left to reduce.
 */
export const MASS_TRANSPORT_RESISTANCE = 0.2;

/** Integration: at most this fraction of either ion's amount changes in one substep. */
export const MAX_FRACTION_PER_SUBSTEP = 0.02;

/** Integration: substeps per frame before the remaining time is dropped. */
export const MAX_SUBSTEPS = 400;

/** A current below this (A) counts as no current: the cell is dead or at equilibrium. */
export const CURRENT_THRESHOLD = 1e-6;

/** Simulated seconds per real second for the slow, normal and fast speeds (galvanic cells). */
export const CELL_TIME_SCALE = { slow: 600, normal: 3600, fast: 36000 } as const;

/** Current (A) at which the light bulb is fully bright and electrons move at full speed. */
export const FULL_BRIGHTNESS_CURRENT = 1;

// ── Electrolysis ──────────────────────────────────────────────────────────────

/** Power-supply voltage range (V). */
export const SUPPLY_VOLTAGE_RANGE = new Range(0, 6);

/** Default power-supply voltage (V). */
export const DEFAULT_SUPPLY_VOLTAGE = 3;

/** Volume of electrolyte in the electrolysis beaker (L). */
export const ELECTROLYSIS_VOLUME = 0.1;

/** Capacity of each gas-collection tube (mL). */
export const GAS_TUBE_CAPACITY = 50;

/** Simulated seconds per real second for the slow, normal and fast speeds (electrolysis). */
export const ELECTROLYSIS_TIME_SCALE = { slow: 10, normal: 60, fast: 600 } as const;

/** Settings for common/ElectrochemistryControlOptions.ts. */
export const ELECTROCHEMISTRY_CONTROL_OPTIONS_SETTINGS = {
  /** Slider thumb size width (px). */
  SLIDER_THUMB_SIZE_WIDTH: 12,
  /** Slider thumb size height (px). */
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  /** Standalone slider track size width (px). */
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  /** Standalone slider track size height (px). */
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Number control slider track size width (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  /** Number control slider track size height (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Checkbox box width (px). */
  CHECKBOX_BOX_WIDTH: 16,
  /** Electrochemistry number control options scale (dimensionless). */
  ELECTROCHEMISTRY_NUMBER_CONTROL_OPTIONS_SCALE: 0.75,
  /** Electrochemistry number control options slider padding (px). */
  ELECTROCHEMISTRY_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING: 4,
  /** Electrochemistry number control options arrow button spacing (px). */
  ELECTROCHEMISTRY_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING: 3,
  /** Electrochemistry number control options vertical spacing (px). */
  ELECTROCHEMISTRY_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING: 4,
  /** Electrochemistry checkbox options spacing (px). */
  ELECTROCHEMISTRY_CHECKBOX_OPTIONS_SPACING: 4,
} as const;

/** Settings for common/ElectrochemistryPanel.ts. */
export const ELECTROCHEMISTRY_PANEL_SETTINGS = {
  /** Options x margin (px). */
  OPTIONS_X_MARGIN: 12,
  /** Options y margin (px). */
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/ElectrochemistryScreenIcons.ts. */
export const ELECTROCHEMISTRY_SCREEN_ICONS_SETTINGS = {
  CREATE_NERNST_ICON_LINE_DASH_DASH: 14, // px

  CREATE_GALVANIC_CELL_ICON_WIDTH_SEGMENT_2: 180, // px
  CREATE_GALVANIC_CELL_ICON_HEIGHT_SEGMENT_2: 160, // px
  CREATE_GALVANIC_CELL_ICON_X_LINE_TO_Y: 150, // px
  CREATE_GALVANIC_CELL_ICON_X_SEGMENT_2: 378, // px
  CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_2: 150, // px
  CREATE_GALVANIC_CELL_ICON_X_SEGMENT_3: 85, // px
  CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_3: 110, // px
  CREATE_GALVANIC_CELL_ICON_X_SEGMENT_4: 433, // px
  CREATE_GALVANIC_CELL_ICON_X_SEGMENT_5: 100, // px
  CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_4: 60, // px
  CREATE_GALVANIC_CELL_ICON_X_SEGMENT_6: 448, // px
  CREATE_GALVANIC_CELL_ICON_Y_SEGMENT_5: 110, // px
  CREATE_GALVANIC_CELL_ICON_ITEM_8_X: 274, // px
  CREATE_GALVANIC_CELL_ICON_ITEM_8_Y: 42, // px
  CREATE_GALVANIC_CELL_ICON_RADIUS_SEGMENT_2: 30, // px
  CREATE_GALVANIC_CELL_ICON_ITEM_9_X: 274, // px
  CREATE_GALVANIC_CELL_ICON_ITEM_9_Y: 42, // px
  CREATE_GALVANIC_CELL_ICON_RADIUS_SEGMENT_3: 9, // px
  CREATE_GALVANIC_CELL_ICON_ITEM_10_Y: 60, // px
  CREATE_NERNST_ICON_ITEM_4_LINE_WIDTH: 12, // px
  CREATE_NERNST_ICON_ITEM_5_LINE_WIDTH: 6, // px
  CREATE_NERNST_ICON_ITEM_6_X: 403, // px
  CREATE_NERNST_ICON_RADIUS_SEGMENT_2: 20, // px
  CREATE_NERNST_ICON_ITEM_7_X: 150, // px
  CREATE_NERNST_ICON_ITEM_7_Y: 121, // px
  TUBE_Y_SEGMENT_2: 142, // px
  TUBE_WIDTH_SEGMENT_2: 48, // px
  TUBE_CORNER_X_SEGMENT_2: 22, // px
  TUBE_CORNER_Y_SEGMENT_2: 22, // px
  CREATE_ELECTROLYSIS_ICON_WIDTH_SEGMENT_2: 388, // px
  CREATE_ELECTROLYSIS_ICON_HEIGHT_SEGMENT_2: 150, // px
  CREATE_ELECTROLYSIS_ICON_GAS_HEIGHT: 120, // px
  CREATE_ELECTROLYSIS_ICON_GAS_HEIGHT_SEGMENT_2: 60, // px
  CREATE_ELECTROLYSIS_ICON_X_MOVE_TO_Y: 70, // px
  CREATE_ELECTROLYSIS_ICON_X_SEGMENT_2: 130, // px
  CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_2: 70, // px
  CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_3: 340, // px
  CREATE_ELECTROLYSIS_ICON_X_SEGMENT_3: 184, // px
  CREATE_ELECTROLYSIS_ICON_X_SEGMENT_4: 314, // px
  CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_4: 70, // px
  CREATE_ELECTROLYSIS_ICON_X_SEGMENT_5: 418, // px
  CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_5: 340, // px
  CREATE_ELECTROLYSIS_ICON_X_SEGMENT_6: 364, // px
  CREATE_ELECTROLYSIS_ICON_X_SEGMENT_7: 214, // px
  CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_6: 20, // px
  CREATE_ELECTROLYSIS_ICON_WIDTH_SEGMENT_3: 120, // px
  CREATE_ELECTROLYSIS_ICON_HEIGHT_SEGMENT_3: 90, // px
  CREATE_ELECTROLYSIS_ICON_X_SEGMENT_8: 230, // px
  CREATE_ELECTROLYSIS_ICON_Y_SEGMENT_7: 34, // px
  CREATE_ELECTROLYSIS_ICON_WIDTH_SEGMENT_4: 88, // px
  CREATE_ELECTROLYSIS_ICON_HEIGHT_SEGMENT_4: 36, // px
  CREATE_ELECTROLYSIS_ICON_CORNER_X_SEGMENT_2: 6, // px
  CREATE_ELECTROLYSIS_ICON_CORNER_Y_SEGMENT_2: 6, // px
  CREATE_ELECTROLYSIS_ICON_ITEM_11_X: 240, // px
  CREATE_ELECTROLYSIS_ICON_ITEM_11_Y: 90, // px
  CREATE_ELECTROLYSIS_ICON_ITEM_12_X: 308, // px
  CREATE_ELECTROLYSIS_ICON_ITEM_12_Y: 90, // px

  /** Beaker line width (px). */
  BEAKER_LINE_WIDTH: 6,
  /** Wire line width (px). */
  WIRE_LINE_WIDTH: 7,
  /** Create galvanic cell icon x (px). */
  CREATE_GALVANIC_CELL_ICON_X: 170,
  /** Create galvanic cell icon y (px). */
  CREATE_GALVANIC_CELL_ICON_Y: 300,
  /** Create galvanic cell icon line width (px). */
  CREATE_GALVANIC_CELL_ICON_LINE_WIDTH: 26,
  /** Create galvanic cell icon width (px). */
  CREATE_GALVANIC_CELL_ICON_WIDTH: 30,
  /** Create galvanic cell icon height (px). */
  CREATE_GALVANIC_CELL_ICON_HEIGHT: 210,
  /** Create galvanic cell icon radius (px). */
  CREATE_GALVANIC_CELL_ICON_RADIUS: 56,
  /** Create galvanic cell icon opacity (dimensionless). */
  CREATE_GALVANIC_CELL_ICON_OPACITY: 0.5,
  /** Left (px). */
  LEFT: 70,
  /** Right (px). */
  RIGHT: 500,
  /** Top (px). */
  TOP: 40,
  /** Bottom (px). */
  BOTTOM: 330,
  /** Create nernst icon line width (px). */
  CREATE_NERNST_ICON_LINE_WIDTH: 4,
  /** Create nernst icon start y (px). */
  CREATE_NERNST_ICON_START_Y: 80,
  /** Create nernst icon end y (px). */
  CREATE_NERNST_ICON_END_Y: 300,
  /** Create nernst icon radius (px). */
  CREATE_NERNST_ICON_RADIUS: 16,
  /** Create nernst icon x (px). */
  CREATE_NERNST_ICON_X: 230,
  /** Create nernst icon y (px). */
  CREATE_NERNST_ICON_Y: 162,
  /** Tube y (px). */
  TUBE_Y: 140,
  /** Tube width (px). */
  TUBE_WIDTH: 52,
  /** Tube height (px). */
  TUBE_HEIGHT: 190,
  /** Tube corner x (px). */
  TUBE_CORNER_X: 26,
  /** Tube corner y (px). */
  TUBE_CORNER_Y: 26,
  /** Tube line width (px). */
  TUBE_LINE_WIDTH: 5,
  /** Create electrolysis icon y (px). */
  CREATE_ELECTROLYSIS_ICON_Y: 300,
  /** Create electrolysis icon width (px). */
  CREATE_ELECTROLYSIS_ICON_WIDTH: 24,
  /** Create electrolysis icon height (px). */
  CREATE_ELECTROLYSIS_ICON_HEIGHT: 26,
  /** Create electrolysis icon x (px). */
  CREATE_ELECTROLYSIS_ICON_X: 234,
  /** Create electrolysis icon line width (px). */
  CREATE_ELECTROLYSIS_ICON_LINE_WIDTH: 7,
  /** Create electrolysis icon corner x (px). */
  CREATE_ELECTROLYSIS_ICON_CORNER_X: 12,
  /** Create electrolysis icon corner y (px). */
  CREATE_ELECTROLYSIS_ICON_CORNER_Y: 12,
  /** Create electrolysis icon radius (px). */
  CREATE_ELECTROLYSIS_ICON_RADIUS: 10,
} as const;

/** Settings for common/view/ControlFactory.ts. */
export const CONTROL_FACTORY_SETTINGS = {
  ITEMS_MAX_WIDTH_OFFSET: 40, // px
  NUMBER_CONTROL_MAX_WIDTH_OFFSET: 70, // px

  /** Control font size (px). */
  CONTROL_FONT_SIZE: 13,
  /** Heading font size (px). */
  HEADING_FONT_SIZE: 14,
  /** Combo box x margin (px). */
  COMBO_BOX_X_MARGIN: 8,
  /** Combo box y margin (px). */
  COMBO_BOX_Y_MARGIN: 3,
  /** Combo box corner radius (px). */
  COMBO_BOX_CORNER_RADIUS: 4,
  /** Labeled spacing (px). */
  LABELED_SPACING: 3,
  /** Push button x margin (px). */
  PUSH_BUTTON_X_MARGIN: 8,
  /** Push button y margin (px). */
  PUSH_BUTTON_Y_MARGIN: 4,
} as const;

/** Settings for common/view/ElectronFlowNode.ts. */
export const ELECTRON_FLOW_NODE_SETTINGS = {
  /** Spacing (px). */
  SPACING: 26,
  /** Radius (px). */
  RADIUS: 3.5,
  /** Default line width (px). */
  DEFAULT_LINE_WIDTH: 3,
} as const;

/** Settings for common/view/GalvanicCellNode.ts. */
export const GALVANIC_CELL_NODE_SETTINGS = {
  BRIDGE_GHOST_LINE_DASH_DASH: 5, // px
  CONSTRUCTOR_BRIDGE_GHOST_LINE_DASH_DASH: 4, // px
  GLOW_Y_OFFSET: 18, // px
  BULB_Y_OFFSET: 18, // px
  CONSTRUCTOR_RADIUS_OFFSET: 13, // px
  CONSTRUCTOR_RADIUS_FACTOR: 24, // dimensionless
  CONSTRUCTOR_Y_OFFSET: 12, // px
  CONSTRUCTOR_TOP_OFFSET: 30, // px
  LEADS_Y_OFFSET: 6, // px
  CREATE_LABEL_TOP_OFFSET: 8, // px

  BRIDGE_ITEM_2_LINE_WIDTH: 17, // px

  /** Right beaker x (px). */
  RIGHT_BEAKER_X: 330,
  /** Beaker y (px). */
  BEAKER_Y: 210,
  /** Left electrode x (px). */
  LEFT_ELECTRODE_X: 55,
  /** Right electrode x (px). */
  RIGHT_ELECTRODE_X: 445,
  /** Left bridge x (px). */
  LEFT_BRIDGE_X: 135,
  /** Right bridge x (px). */
  RIGHT_BRIDGE_X: 365,
  /** Bridge top (px). */
  BRIDGE_TOP: 180,
  /** Bridge bottom (px). */
  BRIDGE_BOTTOM: 322,
  /** Wire y (px). */
  WIRE_Y: 40,
  /** Lead y (px). */
  LEAD_Y: 154,
  /** Bulb x (px). */
  BULB_X: 250,
  /** Switch left (px). */
  SWITCH_LEFT: 338,
  /** Switch length (px). */
  SWITCH_LENGTH: 38,
  /** Switch open angle (px). */
  SWITCH_OPEN_ANGLE: -0.6,
  /** Electron speed (px). */
  ELECTRON_SPEED: 90,
  /** Bridge ion speed (px). */
  BRIDGE_ION_SPEED: 26,
  /** Bridge ions (px). */
  BRIDGE_IONS: 7,
  /** Node radius (px). */
  NODE_RADIUS: 3.5,
  /** Bridge line width (px). */
  BRIDGE_LINE_WIDTH: 22,
  /** Bridge ghost line width (px). */
  BRIDGE_GHOST_LINE_WIDTH: 1.5,
  /** Touch area line width (px). */
  TOUCH_AREA_LINE_WIDTH: 22,
  /** Blade line width (px). */
  BLADE_LINE_WIDTH: 4,
  /** Switch node radius (px). */
  SWITCH_NODE_RADIUS: 4,
  /** Touch area height (px). */
  TOUCH_AREA_HEIGHT: 40,
  /** Bulb radius (px). */
  BULB_RADIUS: 13,
  /** Bulb line width (px). */
  BULB_LINE_WIDTH: 1.2,
  /** Bulb width (px). */
  BULB_WIDTH: 14,
  /** Bulb height (px). */
  BULB_HEIGHT: 7,
  /** Conventional arrow end x (px). */
  CONVENTIONAL_ARROW_END_X: 50,
  /** Conventional arrow head height (px). */
  CONVENTIONAL_ARROW_HEAD_HEIGHT: 10,
  /** Conventional arrow head width (px). */
  CONVENTIONAL_ARROW_HEAD_WIDTH: 12,
  /** Conventional arrow tail width (px). */
  CONVENTIONAL_ARROW_TAIL_WIDTH: 3,
  /** Conventional-current arrow x (px). */
  CONVENTIONAL_ARROW_X: 120,
  /** Lead line width (px). */
  LEAD_LINE_WIDTH: 2,
  /** Leads radius (px). */
  LEADS_RADIUS: 3,
  /** Box spacing (px). */
  BOX_SPACING: 2,
} as const;

/** Settings for common/view/HalfCellBeakerNode.ts. */
export const HALF_CELL_BEAKER_NODE_SETTINGS = {
  REBUILD_ELECTRODE_X: 24, // px
  REBUILD_ELECTRODE_Y_FACTOR: 6, // dimensionless

  /** Beaker width (px). */
  BEAKER_WIDTH: 170,
  /** Beaker height (px). */
  BEAKER_HEIGHT: 160,
  /** Liquid surface, below the beaker's rim. */
  LIQUID_TOP: 30,
  /** Top of the electrode (where wires attach), above the rim. */
  ELECTRODE_TOP: -40,
  /** Electrode bottom (px). */
  ELECTRODE_BOTTOM: 140,
  /** Electrode width (px). */
  ELECTRODE_WIDTH: 24,
  /** Ions per molar (px). */
  IONS_PER_MOLAR: 10,
  /** Max ions (px). */
  MAX_IONS: 30,
  /** Ion radius (px). */
  ION_RADIUS: 6,
  /** Ion speed (px). */
  ION_SPEED: 22,
  /** Bubble speed (px). */
  BUBBLE_SPEED: 40,
  /** Solution x (px). */
  SOLUTION_X: 2,
  /** Beaker line width (px). */
  BEAKER_LINE_WIDTH: 2.5,
  /** Hood radius (px). */
  HOOD_RADIUS: 18,
  /** Hood line width (px). */
  HOOD_LINE_WIDTH: 2,
  /** Gas width (px). */
  GAS_WIDTH: 34,
  /** Gas opacity (dimensionless). */
  GAS_OPACITY: 0.25,
  /** Inlet line width (px). */
  INLET_LINE_WIDTH: 3,
  /** Children line width (px). */
  CHILDREN_LINE_WIDTH: 2,
  /** Children width (px). */
  CHILDREN_WIDTH: 14,
  /** Children height (px). */
  CHILDREN_HEIGHT: 34,
  /** Plate corner x (px). */
  PLATE_CORNER_X: 2,
  /** Plate corner y (px). */
  PLATE_CORNER_Y: 2,
  /** Stub line width (px). */
  STUB_LINE_WIDTH: 2,
} as const;

/** Settings for common/view/MeterNode.ts. */
export const METER_NODE_SETTINGS = {
  READOUTS_MAX_WIDTH_OFFSET: 28, // px
  CONSTRUCTOR_RIGHT_OFFSET: 6, // px
  CAPTION_MAX_WIDTH_FACTOR: 0.56, // dimensionless
  CAPTION_MAX_WIDTH_OFFSET: 16, // px
  TERMINAL_LABEL_BOTTOM_OFFSET: 6, // px

  /** Readouts font size (px). */
  READOUTS_FONT_SIZE: 17,
  /** Screen corner x (px). */
  SCREEN_CORNER_X: 3,
  /** Screen corner y (px). */
  SCREEN_CORNER_Y: 3,
  /** Screen x (px). */
  SCREEN_X: 8,
  /** Screen y (px). */
  SCREEN_Y: 8,
  /** Caption font size (px). */
  CAPTION_FONT_SIZE: 11,
  /** Body corner x (px). */
  BODY_CORNER_X: 8,
  /** Body corner y (px). */
  BODY_CORNER_Y: 8,
  /** Terminal radius (px). */
  TERMINAL_RADIUS: 5,
  /** Terminal label font size (px). */
  TERMINAL_LABEL_FONT_SIZE: 9,
} as const;

/** Settings for electrolysis/view/ElectrolysisCellNode.ts. */
export const ELECTROLYSIS_CELL_NODE_SETTINGS = {
  ROLE_LABEL_TOP_OFFSET: 8, // px
  CONVENTIONAL_LEFT_OFFSET: 4, // px
  BUILD_ELECTRODE_RIGHT_OFFSET: 3, // px
  FORMULA_BOTTOM_OFFSET: 4, // px
  BUILD_ELECTRODE_X_FACTOR: 4, // dimensionless
  BUILD_ELECTRODE_X_OFFSET: 1.5, // px
  STEP_Y_OFFSET: 0.4, // px

  VOLTAGE_TEXT_DECIMALS: 2, // digits
  WIRE_PATH_LINE_WIDTH: 2.5, // px
  RECTANGLE_WIDTH: 8, // px
  VIEW_WIDTH: 10, // px

  /** Beaker left (px). */
  BEAKER_LEFT: 60,
  /** Beaker right (px). */
  BEAKER_RIGHT: 460,
  /** Beaker top (px). */
  BEAKER_TOP: 250,
  /** Beaker bottom (px). */
  BEAKER_BOTTOM: 450,
  /** Liquid top (px). */
  LIQUID_TOP: 280,
  /** Cathode x (px). */
  CATHODE_X: 170,
  /** Anode x (px). */
  ANODE_X: 350,
  /** Bus y (px). */
  BUS_Y: 150,
  /** Electrode top (px). */
  ELECTRODE_TOP: 200,
  /** Electrode bottom (px). */
  ELECTRODE_BOTTOM: 420,
  /** Plate width (px). */
  PLATE_WIDTH: 26,
  /** Tube top (px). */
  TUBE_TOP: 200,
  /** Tube bottom (px). */
  TUBE_BOTTOM: 438,
  /** Tube half width (px). */
  TUBE_HALF_WIDTH: 18,
  /** Tube scale length (dimensionless). */
  TUBE_SCALE_LENGTH: 200,
  /** Gas plate top (px). */
  GAS_PLATE_TOP: 392,
  /** Gas plate bottom (px). */
  GAS_PLATE_BOTTOM: 432,
  /** Gas wire offset (px). */
  GAS_WIRE_OFFSET: 34,
  /** Under tube y (px). */
  UNDER_TUBE_Y: 443,
  /** Electron speed (px). */
  ELECTRON_SPEED: 90,
  /** Bubble speed (px). */
  BUBBLE_SPEED: 70,
  /** Bubbles per tube (px). */
  BUBBLES_PER_TUBE: 8,
  /** Supply width (px). */
  SUPPLY_WIDTH: 170,
  /** Beaker line width (px). */
  BEAKER_LINE_WIDTH: 2.5,
  /** Electrode view opacity (dimensionless). */
  ELECTRODE_VIEW_OPACITY: 0.55,
  /** Label max width (px). */
  LABEL_MAX_WIDTH: 170,
  /** Conventional arrow head height (px). */
  CONVENTIONAL_ARROW_HEAD_HEIGHT: 10,
  /** Conventional arrow head width (px). */
  CONVENTIONAL_ARROW_HEAD_WIDTH: 12,
  /** Conventional arrow tail width (px). */
  CONVENTIONAL_ARROW_TAIL_WIDTH: 3,
  /** Build electrode font size (px). */
  BUILD_ELECTRODE_FONT_SIZE: 9,
  /** Children width (px). */
  CHILDREN_WIDTH: 18,
  /** Children line width (px). */
  CHILDREN_LINE_WIDTH: 2,
  /** Coat width (px). */
  COAT_WIDTH: 8,
  /** Coat radius x (px). */
  COAT_RADIUS_X: 17,
  /** Coat radius y (px). */
  COAT_RADIUS_Y: 30,
  /** Children height (px). */
  CHILDREN_HEIGHT: 170,
  /** Children corner x (px). */
  CHILDREN_CORNER_X: 3,
  /** Children corner y (px). */
  CHILDREN_CORNER_Y: 3,
  /** Children radius x (px). */
  CHILDREN_RADIUS_X: 17,
  /** Children radius y (px). */
  CHILDREN_RADIUS_Y: 30,
  /** Plate corner x (px). */
  PLATE_CORNER_X: 2,
  /** Plate corner y (px). */
  PLATE_CORNER_Y: 2,
  /** Coat height (px). */
  COAT_HEIGHT: 10,
  /** Coat corner x (px). */
  COAT_CORNER_X: 2,
  /** Coat corner y (px). */
  COAT_CORNER_Y: 2,
  /** Coat opacity (dimensionless). */
  COAT_OPACITY: 0.95,
} as const;

/** Settings for electrolysis/view/ElectrolysisScreenView.ts. */
export const ELECTROLYSIS_SCREEN_VIEW_SETTINGS = {
  LINE_MAX_WIDTH_OFFSET: 24, // px

  MINIMUM_LINE_DECIMALS: 2, // digits
  CALCULATION_LINES_DECIMALS: 2, // digits
  LITERS_FIXED_DECIMALS: 4, // digits

  /** Apparatus scale (dimensionless). */
  APPARATUS_SCALE: 0.86,
  /** Apparatus center x (px). */
  APPARATUS_CENTER_X: 255,
  /** Apparatus top (px). */
  APPARATUS_TOP: 16,
  /** Reactions width (px). */
  REACTIONS_WIDTH: 464,
  /** Middle left (px). */
  MIDDLE_LEFT: 496,
  /** Middle width (px). */
  MIDDLE_WIDTH: 256,
  /** Reactions panel spacing (px). */
  REACTIONS_PANEL_SPACING: 4,
  /** Measurements panel spacing (px). */
  MEASUREMENTS_PANEL_SPACING: 4,
  /** Faraday panel spacing (px). */
  FARADAY_PANEL_SPACING: 4,
  /** System panel spacing (px). */
  SYSTEM_PANEL_SPACING: 8,
  /** Voltage control delta (control/model units). */
  VOLTAGE_CONTROL_DELTA: 0.05,
  /** Voltage control decimal places (digits). */
  VOLTAGE_CONTROL_DECIMAL_PLACES: 2,
  /** Supply panel spacing (px). */
  SUPPLY_PANEL_SPACING: 10,
} as const;

/** Settings for galvanic-cell/view/GalvanicCellScreenView.ts. */
export const GALVANIC_CELL_SCREEN_VIEW_SETTINGS = {
  LINE_MAX_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_TOP_OFFSET: 16, // px

  STANDARD_POTENTIAL_SIGNED_DECIMALS: 3, // digits
  UPDATE_MEASUREMENTS_DECIMALS: 3, // digits

  /** Cell scale (dimensionless). */
  CELL_SCALE: 0.92,
  /** Cell left (px). */
  CELL_LEFT: 50,
  /** Cell top (px). */
  CELL_TOP: 28,
  /** Reactions width (px). */
  REACTIONS_WIDTH: 530,
  /** Middle left (px). */
  MIDDLE_LEFT: 562,
  /** Middle width (px). */
  MIDDLE_WIDTH: 190,
  /** Reactions panel spacing (px). */
  REACTIONS_PANEL_SPACING: 5,
  /** Measurements panel spacing (px). */
  MEASUREMENTS_PANEL_SPACING: 4,
  /** Half cells panel spacing (px). */
  HALF_CELLS_PANEL_SPACING: 8,
  /** Circuit panel spacing (px). */
  CIRCUIT_PANEL_SPACING: 8,
  /** Show panel spacing (px). */
  SHOW_PANEL_SPACING: 8,
} as const;

/** Settings for nernst/view/NernstChartNode.ts. */
export const NERNST_CHART_NODE_SETTINGS = {
  ZERO_LINE_LINE_DASH_DASH: 5, // px
  CONSTRUCTOR_ZERO_LINE_LINE_DASH_DASH: 4, // px
  OFF_CHART_TEXT_MAX_WIDTH_OFFSET: 10, // px
  CONSTRUCTOR_TOP_OFFSET: 18, // px
  CONSTRUCTOR_RIGHT_OFFSET: 6, // px
  CONSTRUCTOR_LEFT_OFFSET: 4, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 3, // px

  /** Largest |log K| shown on the chart (log units). */
  MAX_LOG_K_SHOWN: 60,
  /** Minimum half-span of the log Q axis (log units). */
  MIN_LOG_Q_SPAN: 6,
  /** Nernst line line width (px). */
  NERNST_LINE_LINE_WIDTH: 2.5,
  /** Standard point radius (px). */
  STANDARD_POINT_RADIUS: 5,
  /** Standard point line width (px). */
  STANDARD_POINT_LINE_WIDTH: 2,
  /** Equilibrium point radius (px). */
  EQUILIBRIUM_POINT_RADIUS: 7,
  /** Current point radius (px). */
  CURRENT_POINT_RADIUS: 6,
  /** Y-axis title right inset (px). */
  Y_TITLE_RIGHT: -32,
  /** Chart title bottom inset (px). */
  TITLE_BOTTOM: -8,
  /** Off-chart message top inset (px). */
  OFF_CHART_TOP: 4,
} as const;

/** Settings for nernst/view/NernstScreenView.ts. */
export const NERNST_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_LEFT_OFFSET: 10, // px
  CONCENTRATION_CONTROL_MAX_WIDTH_OFFSET: 110, // px
  CONSTRUCTOR_TOP_OFFSET: 12, // px
  LINE_MAX_WIDTH_OFFSET: 24, // px
  SIDE_COLUMN_SPACING_OFFSET: 4, // px

  STANDARD_POTENTIAL_SIGNED_DECIMALS: 3, // digits
  SLOPE_FIXED_DECIMALS: 4, // digits
  NERNST_LINE_DECIMALS: 2, // digits

  /** Cell scale (dimensionless). */
  CELL_SCALE: 0.6,
  /** Left column width (px). */
  LEFT_COLUMN_WIDTH: 318,
  /** Chart left (px). */
  CHART_LEFT: 398,
  /** Chart top (px). */
  CHART_TOP: 44,
  /** Chart width (px). */
  CHART_WIDTH: 344,
  /** Chart height (px). */
  CHART_HEIGHT: 196,
  /** Equation left (px). */
  EQUATION_LEFT: 350,
  /** Equation width (px). */
  EQUATION_WIDTH: 404,
  /** Concentration control delta (control/model units). */
  CONCENTRATION_CONTROL_DELTA: 0.05,
  /** Concentration control width (px). */
  CONCENTRATION_CONTROL_WIDTH: 180,
  /** Concentration control height (px). */
  CONCENTRATION_CONTROL_HEIGHT: 3,
  /** Concentration control keyboard step (control/model units). */
  CONCENTRATION_CONTROL_KEYBOARD_STEP: 0.1,
  /** Concentration control shift keyboard step (control/model units). */
  CONCENTRATION_CONTROL_SHIFT_KEYBOARD_STEP: 0.01,
  /** Conditions panel spacing (px). */
  CONDITIONS_PANEL_SPACING: 10,
  /** Equation panel spacing (px). */
  EQUATION_PANEL_SPACING: 4,
  /** Half cells panel spacing (px). */
  HALF_CELLS_PANEL_SPACING: 8,
  /** Circuit panel spacing (px). */
  CIRCUIT_PANEL_SPACING: 8,
} as const;

/** Settings for preferences/ElectrochemistryPreferencesNode.ts. */
export const ELECTROCHEMISTRY_PREFERENCES_NODE_SETTINGS = {
  /** Header font size (px). */
  HEADER_FONT_SIZE: 18,
  /** Conventional current checkbox font size (px). */
  CONVENTIONAL_CURRENT_CHECKBOX_FONT_SIZE: 14,
  /** Conventional current checkbox spacing (px). */
  CONVENTIONAL_CURRENT_CHECKBOX_SPACING: 8,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const NERNST_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  CURRENT_DETAILS_PROPERTY_DECIMALS: 2, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ELECTROLYSIS_SCREEN_SUMMARY_CONTENT_SETTINGS = {
  CURRENT_DETAILS_PROPERTY_DECIMALS: 2, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ELECTROLYSIS_READOUTS_SETTINGS = {
  CHANGE_SIGNED_DECIMALS: 3, // digits
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const FORMAT_VALUES_SETTINGS = {
  FORMAT_POTENTIAL_DECIMALS: 3, // digits
  FORMAT_CURRENT_DECIMALS: 3, // digits
  FORMAT_MASS_DECIMALS: 3, // digits
  FORMAT_HOURS_DECIMALS: 2, // digits
} as const;

/** Settings for common/model/ElectrochemicalCell.ts; units are documented per value. */
export const ELECTROCHEMICAL_CELL_NUMERICS = {
  /** Potential difference treated as zero when choosing anode (V). */
  ZERO_POTENTIAL_TOLERANCE: 1e-12,
  /** Amount floor used to bound a depletion substep (mol). */
  MIN_SUBSTEP_AMOUNT: 1e-6,
} as const;

/** Settings for nernst/model/NernstModel.ts; units are documented per value. */
export const NERNST_MODEL_SETTINGS = {
  /** Initial anode concentration in the concentration-cell preset (mol/L). */
  CONCENTRATION_CELL_ANODE_CONCENTRATION: 0.01,
} as const;

ElectrochemistryNamespace.register("ElectrochemistryConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  FARADAY,
  GAS_CONSTANT,
  STANDARD_TEMPERATURE,
});
