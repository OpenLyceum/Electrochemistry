# AGENTS.md — Electrochemistry

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Electrochemistry for **introductory (General) chemistry**, the electrochemistry chapter of Gen
Chem 2 (OpenStax *Chemistry 2e*, chapter 17). It follows TitrationLab in the Gen Chem sequence
and fills a gap: PhET has no electrochemistry simulation. Three screens:

| Screen | Folder | Content |
|---|---|---|
| Galvanic Cell | `src/galvanic-cell/` | Two half-cells at 1 M, salt bridge, voltmeter, bulb and switch; electrons, bridge ions and beaker ions animated; cell notation, half-reactions, overall reaction, E°cell; the cell runs down with the bulb in |
| Nernst | `src/nernst/` | The same cell with log-scale concentration sliders and temperature; E against log Q with standard and equilibrium points; Nernst equation, ΔG and K worked out; swap, concentration cell, run to equilibrium |
| Electrolysis | `src/electrolysis/` | Copper plating, silver plating, CuCl₂, water; variable DC supply with a decomposition threshold; plating, dissolving anode, gas tubes (2 : 1 for water); Faraday's-law calculation |

Chemistry, data sources and assumptions: [`doc/model.md`](doc/model.md). Architecture and design
decisions: [`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **One cell model for two screens.** `common/model/ElectrochemicalCell.ts` is the galvanic cell
  on both the Galvanic Cell and Nernst screens. Left and right are fixed places; the anode is
  whichever electrode has the lower Nernst potential (`anodeSideProperty`), so the cell works
  either way round.
- **The voltmeter reads E_right − E_left** (black lead left, red right): negative when the
  student builds the cell "backwards", zero with the salt bridge out. The Nernst screen writes
  the reaction with left = anode and right = cathode, so its E is the same number.
- **The cell runs down with a mass-transport limit.** I = |E| / (R + R_MT / [Ox]cathode). Without
  the R_MT term a Daniell cell would keep 0.9 A flowing with no Cu²⁺ left. With it, the current
  dies away and E stays high (K ≈ 10³⁷ is out of reach), which is the correct open-circuit
  behaviour. A concentration cell runs all the way to E = 0.
- **Current follows conditions immediately.** `currentProperty` is read-only and derived from
  the potential, concentrations, circuit, salt bridge and anode availability. Paused edits
  change current without passing charge or advancing the clock.
- **Potentials are CRC values** (the ones OpenStax reproduces): Cu²⁺/Cu is +0.3419 V, so the
  Daniell cell is 1.104 V. Changing a value means changing a test.
- **Ideal behaviour.** Activities equal molarities; E° does not depend on temperature;
  electrolysis ignores overpotential (water needs 1.229 V here, nearer 1.8 V in practice); Mg's
  reaction with water and Al's oxide layer are ignored.
- **Time is scaled.** The galvanic clock runs at 10 min, 1 h or 10 h of cell time per second;
  electrolysis at 10 s, 1 min or 10 min per second. Readouts show cell time, not wall time.

## Key files

| File | Purpose |
|---|---|
| `src/ElectrochemistryConstants.ts` | F, R, T, volumes, electrode mass, resistances, time scales, ranges, layout |
| `src/ElectrochemistryColors.ts` | All `ProfileColorProperty` instances: chrome, chart, apparatus, metals |
| `src/common/model/HalfCells.ts` | Half-cell data: ion, n, ν, E°, molar mass |
| `src/common/model/Nernst.ts` | Electrode and cell potentials, n = lcm, Q, slope, ΔG, log K |
| `src/common/model/ElectrochemicalCell.ts` | Two `HalfCellState`s, voltmeter reading, anode side, current, running down |
| `src/common/model/ElectrolysisSystems.ts` | Electrolysis data (electrodes, half-reactions, products, E_min, R); `productMoles` |
| `src/electrolysis/model/ElectrolysisModel.ts` | Supply, current above E_min, charge, masses, gas volumes, tube full |
| `src/common/view/GalvanicCellNode.ts` | Whole galvanic cell drawing (shared; scaled on the Nernst screen) |
| `src/common/view/HalfCellBeakerNode.ts` | Beaker, tinted solution, electrode by mass, hydrogen electrode, ion particles |
| `src/common/view/ElectronFlowNode.ts` | Electrons moving along a wire polyline |
| `src/common/view/MeterNode.ts` | Digital meter (voltmeter, power supply) with black/red terminals |
| `src/common/view/formatValues.ts` | Numbers (`fromLog` for K), half-reactions, overall reaction, cell notation, Q expression |
| `src/common/view/ControlFactory.ts` | Themed control builders (copied from TitrationLab) |
| `src/nernst/view/NernstChartNode.ts` | E against log Q with self-fitting axes |
| `src/electrolysis/view/ElectrolysisCellNode.ts` | Supply, beaker, plating, gas tubes, bubbles, electrons |

## Accessibility

- Galvanic Cell: the switch and salt bridge are pointer shortcuts in the drawing; the same
  actions are checkboxes in the Circuit panel. Connecting the bulb (with the direction of electron
  flow), the salt bridge, the current dying and a dissolved anode are announced. The live summary
  gives both half-cells, the voltmeter reading, the anode and cathode, and the current.
- Nernst: concentrations and temperature are sliders whose value text is the concentration in M.
  Concentration thumbs stay within 10⁻⁴…2 M, but numeric and accessible readouts show the true
  beaker concentration even outside that range. A deliberate slider edit selects an in-range value.
  Swapping, the concentration cell and reaching equilibrium are announced. The live summary
  gives Q, log Q, E°, E and the verdict.
- Electrolysis: the power checkbox announces the current (or that the voltage is below the
  minimum); after completion it announces the full tube or dissolved anode instead. The live summary gives the supply,
  current, charge, time and the products.

## Compliance carve-outs

None: every colour is in `ElectrochemistryColors.ts`. Solution tints are mixed from profile
colours at runtime (`Color.interpolateRGBA`) in `HalfCellBeakerNode` and `ElectrolysisCellNode`.

### Template-owned files (drift-checked)

Infrastructure files are owned by this template and must stay byte-identical in every sim
(after substituting the sim's own name). `Baton/scripts/check-template-drift.sh <Sim>` compares a
sim against this repo using `Baton/config/template-manifest.json`, which lists the exact files,
the required `package.json` scripts, and the few keys a sim may extend (extra `biome.json`
ignores, extra tsconfig `types`, CSP/Permissions additions).

To diverge on purpose, add a bullet to the sim's own `## Compliance carve-outs` section naming
the file in backticks and the reason, e.g. ``- `tests/setup.ts`: adds a WebGPU mock``. The drift
checker treats a file named there as approved. Fix template-owned files **here first**, then
propagate — never hand-edit one in a single sim.

### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. |
| `brace-expansion` | `~5.0.12` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895; ≥5.0.12 for the CPU-DoS advisory). |

## Testing

| Path | Purpose |
|---|---|
| `tests/common/Nernst.test.ts` | Daniell 1.104 V, n = lcm, 0.0592/n slope, mixed-n and hydrogen-electrode Q, concentration cell, ΔG° = −213 kJ, log K = 37.3 |
| `tests/common/ElectrochemicalCell.test.ts` | Voltmeter sign and salt bridge, no current until the bulb is in, electron bookkeeping, Daniell run-down, concentration cell to E = 0, a Pb anode dissolves exactly its own metal, half-cell change refreshes, live current after paused condition/polarity edits and reset |
| `tests/common/Electrolysis.test.ts` | 2.00 A × 30 min → 1.19 g Cu, H₂ : O₂ = 2 : 1 and 63.4 mL per 500 C, E_min threshold, tube full stops the run, every system runs to its end and stops, one step = one frame, CuCl₂ depletion |
| `tests/nernst/NernstModel.test.ts` | Swap moves whole beakers (solution and electrode); the concentration cell starts with fresh electrodes |
| `tests/electrolysis/ElectrolysisCellNode.test.ts` | Switching systems back and forth disposes nothing twice (assertions on) |
| `tests/TimeModel.test.ts` | Template `TimeModel` |
| `tests/browser/review-regressions.spec.ts` | Native paused edits, true out-of-range concentration readouts and subsequent keyboard edits, hydrogen reaction/n/Q/ΔG consistency in all locales, power-toggle completion announcements |
| `tests/memory-leak.test.ts`, `tests/helpers/`, `tests/fuzz/` | Template-owned harness; the leak suite covers `ElectronFlowNode`, wires and ion particles |

- Unit tests live only under root `tests/`, mirroring `src/`.
- Optional: `npm run test:fuzz` / `test:fuzz:quick` / `test:fuzz:long` (not part of default CI).

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run build:single` | Single-file build mode |
| `npm run check` | TypeScript (`tsc --noEmit` on app, scripts, and tests) |
| `npm run lint` / `npm run fix` | Biome check / auto-fix |
| `npm test` | Vitest unit tests |
| `npm run test:fuzz` | Playwright fuzz smoke (pointer + keyboard, `?ea`, 30s each; `npm run test:fuzz -- 90` to change) |
| `npm run test:fuzz:quick` | 10s fuzz |
| `npm run test:fuzz:long` | 300s fuzz |
| `npm run icons` | Regenerate PWA icons; seed missing screenshots, preserve existing ones |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |

`src/init.ts` reads `version` from `package.json`, so the patch bump shows up in the About dialog
without a second edit.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
