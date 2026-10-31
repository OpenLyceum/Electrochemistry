# Electrochemistry functional review — 2026-10-31

**Resolution:** all four findings below have been fixed and covered by regression tests.
The findings preserve the original reproduction evidence and locations; final validation is
recorded at the end of this report.

Reviewed `main` at `f9fb56d908b244e4d348270551657060edd03f3a` after
`git pull --ff-only` reported **Already up to date**. The initial working tree was clean.
Runtime: Node v26.13.0 in WSL Ubuntu-24.04 (Ubuntu 26.04.1), satisfying Node >=26.

Scope: all three screens, half-cell potentials and reaction bookkeeping, Nernst conditions
and readouts, current and time controls, electrolysis integration, product readouts and
completion feedback. Applied Baton's `scenerystack-code-review` skill and functional-review
reference. This is a targeted functional review, not a full release sign-off.

## Findings

### 1. [P2] Recompute current after paused concentration or temperature edits

Location: `src/common/model/ElectrochemicalCell.ts`, constructor listeners and
`updateCurrent`; `src/nernst/view/NernstScreenView.ts`, circuit readout.

`currentProperty` is manually updated when the circuit/bridge changes, a run restarts, or
`cell.step` finishes. It does not observe concentration or temperature. In the Nernst screen,
those controls immediately update E and the chart, but the current stays at its previous
value while the clock is paused. The displayed measurements no longer describe the same cell.

Browser reproduction using the actual keyboard slider:

1. Pause the default Zn/Cu cell and connect the light bulb at 1 M on each side.
2. Focus the right concentration slider and press Home, setting [Cu2+] to 10^-4 M.
3. The potential updates to **0.985381 V**, but the Circuit panel still reads
   **“Current: 0.920 A.”** `currentProperty` remains **0.91975 A**.
4. Evaluating the model's own `computeCurrent` for those same conditions gives
   **0.000492444 A**. Pressing actual Step Forward refreshes the current, confirming that
   the missing update is tied to advancing time.

Temperature edits take the same unobserved path. Derive current from all its physical
dependencies, or explicitly refresh it after edits, without advancing charge/time. Regressions
should edit both conditions while paused and verify both magnitude and direction.

### 2. [P2] Display the true concentration when the running cell leaves the slider range

Location: `src/nernst/model/NernstModel.ts:48–51` and
`src/nernst/view/NernstScreenView.ts:161–164`.

The log slider Property is intentionally clamped to 10^-4…2 M while the reaction model may
leave that range. The number readout formats the clamped slider value rather than the real
concentration. Once the cathode depletes, the number stops changing even though Q, E and the
chemistry continue using the true value. Clamping the thumb is reasonable; presenting that
bound as the actual concentration is misleading.

Browser/model reproduction: rebuild the default Zn/Cu cell, close the circuit, and advance
100 normal browser-sized frames of 1/60 real seconds at its default Fast speed (60,000
simulated seconds). The state is:

- [Zn2+] = **1.999987433 M**.
- [Cu2+] = **1.256694936 × 10^-5 M**.
- The right control still displays **1.0 × 10^-4 M**.
- The equation correctly shows **Q = 1.59 × 10^5**, inconsistent with the approximately
  2 × 10^4 that the displayed concentrations imply.

Keep the thumb bounded while exposing the true concentration in its numeric and accessible
readouts. Test both depletion below the minimum and accumulation above the maximum, including
subsequent keyboard/arrow edits.

### 3. [P2] Keep the hydrogen concentration-cell reaction consistent with n, Q and ΔG

Location: `src/nernst/view/NernstScreenView.ts:244–248` and
`src/i18n/strings_{en,fr,es}.json`, `nernst.concentrationCellReactionPattern`.

For identical half-cells the view replaces the balanced reaction with a single-ion transfer
template. That drops the hydrogen half-cell's ion coefficient of 2, while the calculations
retain two electrons and squared hydrogen concentrations. The quantities are therefore not
for the reaction “as written,” as the screen explicitly claims.

Browser reproduction: choose hydrogen electrodes on both sides, [H+]left = 0.010 M and
[H+]right = 1.00 M at 25 °C. The displayed lines are:

```text
As written: H+(aq, right) → H+(aq, left)
n = 2 electrons
Q = [H+]left² / [H+]right² = 1.00 × 10^-4
E = 0.118319 V
ΔG = −22.8 kJ/mol
```

For the one-proton transfer actually written, Q is 0.010, n is 1 and ΔG is about
−11.4 kJ per mole of that reaction. The model's E is correct; the reaction normalization
is inconsistent. Either show the transfer with coefficient 2 (matching the existing n/Q/ΔG),
or normalize the equation and all its thermodynamic quantities together. Cover hydrogen as
well as metal concentration cells in a display-level regression.

### 4. [P2] Announce the completion reason when power is toggled after a finished run

Location: `src/electrolysis/view/ElectrolysisScreenView.ts:405–415`.

The power-on announcement assumes every zero current means the supply voltage is below the
minimum. It does not check `finishedProperty`. After a gas tube fills or a metal anode dissolves,
turning power off and on announces an incorrect reason and suggests raising the voltage will
help. The visual status already knows the correct completion reason.

Browser reproduction using the actual power checkbox:

1. Select water electrolysis, 3.00 V, power on, and advance until the hydrogen tube reaches
   its 50.0 mL limit. The run is finished and current is zero; E_min is still 1.229 V.
2. Toggle the actual Power on checkbox off and back on with Space.
3. The handler sends **“Power on, but the voltage is below the minimum: no current.”**
   to `addAccessibleResponse`, even though 3.00 V > 1.229 V.

The probe captured the response from that real checkbox callback; it was not a manual
screen-reader test. Announce tube-full/anode-dissolved before falling back to the below-minimum
case, and cover both completion types.

## Existing proposed work inspected during review

The pull discovered remote branch `origin/cursor/fix-readout-bugs-6ad9`, whose head is
`53f2e1a90cfb4aca38fd25a0c451bf401a5b0ec6` (“keep concentration, mass, and gas readouts in
step with the cell”). Its diff proposes changes relevant to findings 2 and 4, among other
changes. Those proposals were **not on the reviewed main revision**. The fixes adapt the
relevant numeric-readout and completion-message changes, extend concentration accessibility,
and address findings 1 and 3 separately. The branch was not merged; unrelated proposed changes
were not included.

## Initial review validation and evidence

- `npm run lint`: passed, 73 files checked, no lint findings.
- `npm run check`: passed app, scripts and test type checks.
- `npm test`: **54 passed** across 7 files, including 14 memory-leak checks.
- `npm run build`: passed production and PWA build.
- Fleet compliance and template drift checks for `Electrochemistry`: both passed, including
  the compliance script's remote repository security-setting probes.
- `FUZZ_PORT=5221 npm run test:fuzz:quick`: **2 passed**, pointer and keyboard, 10 seconds each.
- Chromium `?ea` probes launched all three screens without page errors. Inspected screenshots
  of each English screen and the hydrogen concentration-cell equations; captured focused
  screenshots of stale current and the depleted concentration display.
- Actual paused Step Forward advanced the Galvanic Cell by **10 simulated seconds**, Nernst
  by **600 seconds**, and Electrolysis by **1 second**, with charge increasing and playback
  remaining paused in all three cases. View stepping does not double-integrate the models.
- Exercised all nine half-cell choices on both cell screens in English, French and Spanish.
- Exercised all four electrolysis systems through completion in all three locales: each
  reached its charge limit and stopped with zero current; Reset All also succeeded.
- The stale-current reproduction used an actual focused concentration slider and Home;
  the completion announcement used actual checkbox Space presses.

## Fixes and final validation

1. Replaced the manually refreshed current with a read-only derived Property observing the
   potential, concentrations, circuit, salt bridge and anode availability. Unit regressions
   verify concentration/temperature edits, reversed polarity, dissolved anodes, open circuits
   and reset without advancing charge/time. The native paused-slider browser regression checks
   the analytical current at 10^-4 M and after a temperature edit.
2. Kept the slider track bounded while deriving its numeric and accessible concentration text
   from the actual beaker Property. Browser regressions exercise successive values below and
   above the slider range and subsequent native keyboard edits back onto the editable scale.
3. Preserved the hydrogen ion coefficient in the localized concentration-cell reaction.
   Browser regressions in English, French and Spanish verify 2H⁺ on both sides, n = 2, squared
   concentrations in Q, E = 0.118319 V and ΔG = −22.8 kJ/mol.
4. Checked electrolysis completion before selecting a power-on response. Native checkbox
   regressions verify both a full water gas tube and a dissolved copper anode announce their
   completion reason after power is toggled off and on.

Final checks:

- `npm run lint`: passed, 74 files checked.
- `npm run check`: passed app, scripts and test type checks.
- `npm test`: **57 passed** across 7 files, including 14 memory-leak checks.
- `npm run build`: passed production and PWA build.
- `FUZZ_PORT=5220 npx playwright test tests/browser`: **8 passed** with assertions enabled.
- `FUZZ_PORT=5221 npm run test:fuzz:quick`: **2 passed**, pointer and keyboard smoke checks.
- Fleet compliance and template drift checks: passed.

Built output was compiled rather than separately browser-tested. Short fuzz is smoke evidence.
Manual assistive-technology sign-off, heap snapshots, educator sign-off and a full
release/performance audit were outside this scope.
