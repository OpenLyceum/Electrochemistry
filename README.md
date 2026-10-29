# Electrochemistry

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Electrochemistry for introductory (General) chemistry. Build a galvanic cell from two half-cells
and watch it run down; see how the Nernst equation moves the cell potential with concentration and
temperature, all the way to equilibrium; and drive electrolysis with a power supply to test
Faraday's law. Built with [SceneryStack](https://scenerystack.org/); runs offline as a Progressive
Web App.

## Features

- **Galvanic Cell.** Pick any two of nine half-cells (Mg, Al, Zn, Fe, Ni, Pb, the standard
  hydrogen electrode, Cu, Ag) at 1 M. The voltmeter (black lead left, red lead right) reads the
  cell potential, negative if the leads are reversed, and zero once the salt bridge is pulled
  out. The anode and cathode are labelled with the cell notation, the half-reactions, the balanced
  overall reaction and E°cell = E°cathode − E°anode. Close the switch to light the bulb.
  Electrons flow through the wire, K⁺ and NO₃⁻ drift through the salt bridge, the anode thins,
  the cathode thickens, ions appear and disappear in the beakers, and the current dies away as the
  cathode's ion is used up.
- **Nernst.** The same cell, written with the left electrode as the anode. Set each ion's
  concentration from 10⁻⁴ to 2 M on a log slider and the temperature from 0 to 100 °C. The cell's
  state moves along the Nernst line on a chart of E against log Q, which shows the standard point
  (Q = 1) and equilibrium (Q = K). The equation is worked out with the numbers: Q, n, E°, E, ΔG
  and K, and whether the reaction is spontaneous as written. Swap the half-cells, build a copper
  concentration cell, or connect the bulb and let the cell run down to E = 0.
- **Electrolysis.** Copper plating, silver plating a spoon, copper(II) chloride, or water. Set the
  power-supply voltage: no current flows below the decomposition voltage. The ammeter, clock and
  charge readout run, metal plates the cathode (or the anode dissolves), and gases collect in
  graduated tubes, H₂ and O₂ in a 2 : 1 ratio. A Faraday's-law panel, hidden at first so
  students can predict, works through Q = It, n(e⁻) = Q/F and the mass or volume of each product.
- Standard reduction potentials from the CRC Handbook's electrochemical series (the values in
  OpenStax *Chemistry 2e*, Appendix L).
- **Accessible:** every control is keyboard-operable; connecting the bulb, removing the salt
  bridge, the current dying, a tube filling and the cell reaching equilibrium are announced;
  live screen summaries; keyboard-help dialogs.
- English, French and Spanish; default and projector colour profiles; installable PWA. A
  preference (or `?conventionalCurrent=true`) also draws the conventional current I.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

New sims start at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). Keep `name` in kebab-case; it is separate from the SceneryStack sim identifier in `src/init.ts`, which reads its `version` from `package.json`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
