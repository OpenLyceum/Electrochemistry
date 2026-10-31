# Electrochemistry: implementation notes

Architecture and design decisions. The chemistry is in [`model.md`](model.md).

## Layout of the code

```
src/
  common/model/      HalfCells, Nernst (pure functions), ElectrochemicalCell, ElectrolysisSystems, timeScale
  common/view/       GalvanicCellNode, HalfCellBeakerNode, ElectronFlowNode, MeterNode,
                     formatValues, ControlFactory, halfCellColors, halfCellChoices, createTimeControl
  galvanic-cell/     GalvanicCellModel (cell + clock + display options) and its view
  nernst/            NernstModel (cell + log-concentration sliders + °C) and its view, NernstChartNode
  electrolysis/      ElectrolysisModel and its view, ElectrolysisCellNode
```

## Decisions

**One cell model, two screens.** `ElectrochemicalCell` holds two `HalfCellState`s (half-cell,
concentration, electrode mass) and derives the potential, the voltmeter reading and the anode
side. The Galvanic Cell and Nernst screens each own an instance, so they don't share state.
Choosing a new half-cell gives that beaker fresh solution and a fresh electrode and restarts the
run's clock and charge.
Current is derived from the present potential, concentrations, circuit, salt bridge and anode
availability, so condition edits refresh it even while paused without advancing charge or time.

**Pure thermodynamics.** `Nernst.ts` takes half-cells and concentrations and returns numbers. The
electrode-by-electrode form (E = E° + (νRT/nF) ln[Ox]) is what the cell uses; the textbook
overall form (n = lcm, Q) is what the Nernst screen displays. A test checks they agree.

**Integration.** The run-down is a stiff-ish problem near depletion (current ∝ [Ox] at the end).
Rather than a fancy solver, `ElectrochemicalCell.step` takes substeps that change neither ion
amount by more than 2 %, up to 400 per frame; any time left over is dropped rather than integrated
coarsely. Concentrations never go below 10⁻¹⁵ M, so logarithms stay finite. Once the current is
below 1 µA, the rest of the frame's time passes with no current. A substep also ends when a metal
anode is used up, and its mass is then set to exactly 0, so the cell never dissolves metal it does
not have. Electrolysis uses the same substep limit for CuCl₂. Its run ends at a charge (a full gas
tube or a dissolved anode, `chargeToFinish`): the last substep lands exactly on that charge, and
`finishedProperty` compares charges, because 10 g − Q·M/(nF) can round to 10⁻¹⁵ g instead of 0.

**Drawing electrodes.** Electrode masses change every substep, so the beakers and the electrolysis
apparatus resize their electrode and plating nodes (`setRect`, opacity) rather than rebuilding
them; nodes are only rebuilt when the half-cell or electrolysis system changes. The electrolysis
gas columns and bubble groups live for the whole sim and are taken out of their layer before a
rebuild disposes the rest.

**Log-scale sliders.** `NernstModel` keeps a log₁₀ concentration Property per side, synced both
ways with the cell's concentration. When the running cell pushes a concentration outside
10⁻⁴…2 M, the thumb pins at the end of the track while the number readout and the slider's
screen-reader value keep the true concentration. Arrow and keyboard steps then move that true value. Dragging the thumb or
clicking the track sets a concentration on the scale.

**Self-fitting chart.** `NernstChartNode` refits its axes only when the content leaves the range
or fills less than a third of it, so the axes hold still while a slider moves. log K is put on
the chart when |log K| ≤ 60; otherwise an "off the chart" note gives its value. Tick labels are
rebuilt with `setCreateLabel`, which also clears bamboo's label cache, whenever the step changes.

**Numbers that overflow.** K for Mg | Ag is about 10¹⁰⁷. `fromLog` formats a value from its base-10
logarithm, so nothing is ever exponentiated past double range.

**Drawing.** `GalvanicCellNode` is drawn once in local coordinates (500 × 400) and scaled (0.92 on
the Galvanic Cell screen, 0.6 on Nernst). Electrode width ∝ √(mass) makes the change visible
without hiding a thin anode too early. Ion particles follow the concentration: 10 per mole per
litre, at most 30. A dissolving electrode adds them beside itself, and a plating one removes the
nearest. Electron speed and bridge-ion drift scale with the current, up to 1 A.

**Disposal.** Models, screen views and panels live for the whole sim. What is created and
disposed at runtime is drawing content: ion particles, the hydrogen electrode's parts,
electrolysis electrodes, wires and electron flows (`disposeChildren`). The leak suite covers
those node types.

**Strings.** Chemical formulas and reactions are RichText markup built in code
(`formatValues.ts`, `ElectrolysisSystems.ts`); only the words around them are localized.
Screen-reader text uses the plain forms (`ionPlain`, `formulaPlain`).
Concentration-cell reaction text preserves the half-cell's ion coefficient, including 2H⁺ for
hydrogen, so the equation matches the electron count, Q and ΔG. Electrolysis power-on feedback
checks completion before the voltage threshold and announces the existing tube-full or
anode-dissolved response when a finished run cannot restart.

## Possible extensions

- An overpotential option for electrolysis (water at ~1.8 V, brine giving Cl₂ rather than O₂).
- More half-cells (Sn, Cd, Au, Cl₂/Cl⁻ on graphite, Fe³⁺/Fe²⁺ on platinum).
- A terminal voltage under load (E − I·r) on the voltmeter.
- A batteries screen (lead–acid, alkaline, lithium-ion).
