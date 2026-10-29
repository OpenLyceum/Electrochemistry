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

ElectrochemistryNamespace.register("ElectrochemistryConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  FARADAY,
  GAS_CONSTANT,
  STANDARD_TEMPERATURE,
});
