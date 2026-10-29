/**
 * ElectrochemistryColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import ElectrochemistryColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import ElectrochemistryColors from "../../ElectrochemistryColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: ElectrochemistryColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the ElectrochemistryColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import ElectrochemistryNamespace from "./ElectrochemistryNamespace.js";

const ElectrochemistryColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  // ── Text, charts ──────────────────────────────────────────────────────────────

  /** Secondary text: units, captions, hints. */
  mutedTextColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "mutedText", {
    default: "#9aa4b8",
    projector: "#555555",
  }),

  /** Chart plotting area. */
  chartBackgroundColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "chartBackground", {
    default: "#10182e",
    projector: "#ffffff",
  }),

  /** Chart frame and tick marks. */
  chartAxisColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "chartAxis", {
    default: "#8a96b0",
    projector: "#333333",
  }),

  /** Chart grid lines. */
  chartGridColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "chartGrid", {
    default: "#26324f",
    projector: "#dddddd",
  }),

  /** The Nernst line E against log Q. */
  nernstLineColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "nernstLine", {
    default: "#4fc3f7",
    projector: "#0b5fa5",
  }),

  /** The cell's present state on the Nernst chart. */
  currentPointColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "currentPoint", {
    default: "#ffd54f",
    projector: "#d35400",
  }),

  /** The standard state (Q = 1) on the Nernst chart. */
  standardPointColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "standardPoint", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /** Equilibrium (Q = K, E = 0) on the Nernst chart. */
  equilibriumPointColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "equilibriumPoint", {
    default: "#81c784",
    projector: "#1b7d32",
  }),

  /** E = 0 line. */
  zeroLineColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "zeroLine", {
    default: "#8a96b0",
    projector: "#777777",
  }),

  /** Spontaneous / OK messages. */
  goodColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "good", {
    default: "#81c784",
    projector: "#1b7d32",
  }),

  /** Warnings: open circuit, dissolved anode, full tube. */
  poorColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "poor", {
    default: "#ff8a80",
    projector: "#c62828",
  }),

  /** Anode labels and oxidation. */
  anodeColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "anode", {
    default: "#ff8a65",
    projector: "#c0392b",
  }),

  /** Cathode labels and reduction. */
  cathodeColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "cathode", {
    default: "#64b5f6",
    projector: "#1f5fa8",
  }),

  // ── Apparatus ─────────────────────────────────────────────────────────────────

  /** Beaker and tube outlines. */
  glassColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "glass", {
    default: "#b8c7dc",
    projector: "#5a6a80",
  }),

  /** Colourless solution. */
  waterColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "water", {
    default: "#2a4a6e",
    projector: "#d6ecfa",
  }),

  /** Copper(II) solution at 1 M (blue). */
  copperTintColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "copperTint", {
    default: "#2f7fd8",
    projector: "#3d8fe0",
  }),

  /** Nickel(II) solution at 1 M (green). */
  nickelTintColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "nickelTint", {
    default: "#3fae5e",
    projector: "#48b868",
  }),

  /** Iron(II) solution at 1 M (pale green). */
  ironTintColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "ironTint", {
    default: "#8fbf7a",
    projector: "#a6cf92",
  }),

  /** Salt-bridge gel. */
  saltBridgeColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "saltBridge", {
    default: "#d7d3c4",
    projector: "#e9e4d2",
  }),

  /** Wires and leads. */
  wireColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "wire", {
    default: "#c9a227",
    projector: "#8a6d12",
  }),

  /** Electrons in the wire. */
  electronColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "electron", {
    default: "#ffee58",
    projector: "#1565c0",
  }),

  /** K⁺ ions in the salt bridge. */
  bridgeCationColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "bridgeCation", {
    default: "#ba68c8",
    projector: "#7b1fa2",
  }),

  /** NO₃⁻ ions in the salt bridge. */
  bridgeAnionColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "bridgeAnion", {
    default: "#4db6ac",
    projector: "#00796b",
  }),

  /** Voltmeter and power-supply cases. */
  meterBodyColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "meterBody", {
    default: "#37474f",
    projector: "#455a64",
  }),

  /** Meter displays (the same LCD green in both profiles). */
  meterScreenColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "meterScreen", {
    default: "#c5e1a5",
    projector: "#c5e1a5",
  }),

  /** Digits on the meter displays. */
  meterTextColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "meterText", {
    default: "#1b2a10",
    projector: "#1b2a10",
  }),

  /** Positive terminal and red lead. */
  redLeadColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "redLead", {
    default: "#e53935",
    projector: "#c62828",
  }),

  /** Negative (COM) terminal and black lead. */
  blackLeadColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "blackLead", {
    default: "#90a4ae",
    projector: "#212121",
  }),

  /** An unlit light bulb. */
  bulbOffColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "bulbOff", {
    default: "#5c6680",
    projector: "#cfd8dc",
  }),

  /** A lit light bulb's glow. */
  bulbOnColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "bulbOn", {
    default: "#fff59d",
    projector: "#ffeb3b",
  }),

  /** Gas bubbles and collected gas. */
  bubbleColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "bubble", {
    default: "#e3f2fd",
    projector: "#90a4ae",
  }),

  /** Chlorine gas. */
  chlorineColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "chlorine", {
    default: "#c6e86b",
    projector: "#9ccc3c",
  }),

  /** Magnesium electrode and ions. */
  magnesiumColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "magnesium", {
    default: "#c9ccd1",
    projector: "#9ea3aa",
  }),

  /** Aluminum electrode and ions. */
  aluminumColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "aluminum", {
    default: "#d5d9de",
    projector: "#a7adb5",
  }),

  /** Zinc electrode and ions. */
  zincColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "zinc", {
    default: "#9fa8b3",
    projector: "#7c8691",
  }),

  /** Iron electrode and ions. */
  ironColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "iron", {
    default: "#7d7f84",
    projector: "#5e6066",
  }),

  /** Nickel electrode and ions. */
  nickelColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "nickel", {
    default: "#b4ad9a",
    projector: "#8e8673",
  }),

  /** Lead electrode and ions. */
  leadColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "lead", {
    default: "#6f7585",
    projector: "#545a6a",
  }),

  /** Copper electrode, ions and deposit. */
  copperColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "copper", {
    default: "#d77d4a",
    projector: "#b35a26",
  }),

  /** Silver electrode, ions and deposit. */
  silverColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "silver", {
    default: "#e4e6ea",
    projector: "#9aa0a8",
  }),

  /** Platinum electrode. */
  platinumColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "platinum", {
    default: "#bfc4cc",
    projector: "#8d939c",
  }),

  /** Graphite electrode. */
  graphiteColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "graphite", {
    default: "#3a3d44",
    projector: "#3a3d44",
  }),

  /** Steel spoon (silver-plating cathode). */
  steelColorProperty: new ProfileColorProperty(ElectrochemistryNamespace, "steel", {
    default: "#8d98a6",
    projector: "#6b7684",
  }),
};

export default ElectrochemistryColors;
