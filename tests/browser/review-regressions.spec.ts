import { expect, type Page, test } from "@playwright/test";
import type { Node, RichText, Text } from "scenerystack/scenery";
import type { ScreenView } from "scenerystack/sim";
import type { ElectrolysisModel } from "../../src/electrolysis/model/ElectrolysisModel.js";
import type { NernstModel } from "../../src/nernst/model/NernstModel.js";

type SimulationWindow<Model> = {
  reviewResponses?: string[];
  phet: { joist: { sim: { selectedScreenProperty: { value: { model: Model; view: ScreenView } } } } };
};

async function ready(page: Page, screen: number, locale = "en") {
  await page.goto(`/?screens=${screen}&ea&locale=${locale}`);
  await page.locator("h1").first().waitFor();
}

function strings(page: Page) {
  return page.evaluate(() => {
    const texts: string[] = [];
    const visit = (node: Node): void => {
      if (node.constructor.name === "Text" || node.constructor.name === "RichText") {
        texts.push((node as Text | RichText).string);
      }
      for (const child of node.children) {
        visit(child);
      }
    };
    visit((window as unknown as SimulationWindow<NernstModel>).phet.joist.sim.selectedScreenProperty.value.view);
    return texts;
  });
}

test("paused native concentration and temperature edits refresh current without advancing the run", async ({
  page,
}) => {
  await ready(page, 2);
  await page.getByRole("button", { name: "Pause", exact: true }).press("Enter");
  await page.getByRole("checkbox", { name: "Connect light bulb", exact: true }).press("Space");
  await page.getByRole("slider").nth(1).focus();
  await page.keyboard.press("Home");
  const snapshot = () =>
    page.evaluate(() => {
      const model = (window as unknown as SimulationWindow<NernstModel>).phet.joist.sim.selectedScreenProperty.value
        .model;
      return {
        current: model.cell.currentProperty.value,
        charge: model.cell.chargeProperty.value,
        time: model.cell.elapsedTimeProperty.value,
        playing: model.timer.isPlayingProperty.value,
      };
    });
  const cold = await snapshot();
  expect(cold).toMatchObject({ charge: 0, time: 0, playing: false });
  expect(cold.current).toBeCloseTo(0.0004924444281002284, 12);
  await page.getByRole("slider").nth(2).focus();
  await page.keyboard.press("End");
  const hot = await snapshot();
  const expectedPotential = 1.1037 + ((8.314462618 * 373.15) / (2 * 96485.33212)) * Math.log(1e-4);
  expect(hot.current).toBeCloseTo(expectedPotential / 2001, 12);
  expect(hot).toMatchObject({ charge: 0, time: 0, playing: false });
});

for (const { side, index, values, labels, key } of [
  { side: "right", index: 1, values: [1e-8, 1e-9], labels: ["1.0 × 10⁻⁸ M", "1.0 × 10⁻⁹ M"], key: "ArrowRight" },
  { side: "left", index: 0, values: [5, 6], labels: ["5.00 M", "6.00 M"], key: "ArrowLeft" },
] as const) {
  test(`${side} concentration readout and accessible value follow the beaker outside the slider range`, async ({
    page,
  }) => {
    await ready(page, 2);
    await page.evaluate(() => {
      (
        window as unknown as SimulationWindow<NernstModel>
      ).phet.joist.sim.selectedScreenProperty.value.model.timer.isPlayingProperty.value = false;
    });
    const slider = page.getByRole("slider").nth(index);
    await slider.focus();
    for (const [i, concentration] of values.entries()) {
      await page.evaluate(
        ({ which, value }) => {
          const model = (window as unknown as SimulationWindow<NernstModel>).phet.joist.sim.selectedScreenProperty.value
            .model;
          model.cell[which].concentrationProperty.value = value;
        },
        { which: side, value: concentration },
      );
      expect(await strings(page)).toContain(labels[i]);
      await expect.poll(async () => (await slider.getAttribute("aria-valuetext"))?.trim()).toBe(labels[i]);
    }
    // An arrow key steps from the beaker's true concentration (about a tenth of a decade), not
    // from the pinned thumb, so the value stays off the track and the readout stays in sync.
    await page.keyboard.press(key);
    const edited = await page.evaluate((which) => {
      const model = (window as unknown as SimulationWindow<NernstModel>).phet.joist.sim.selectedScreenProperty.value
        .model;
      return { concentration: model.cell[which].concentrationProperty.value, charge: model.cell.chargeProperty.value };
    }, side);
    const last = values[values.length - 1] as number;
    const ratio = edited.concentration / last;
    expect(side === "left" ? 1 / ratio : ratio).toBeCloseTo(10 ** 0.1, 1);
    expect(edited.charge).toBe(0);
    await expect
      .poll(async () => (await slider.getAttribute("aria-valuetext"))?.trim())
      .toBe(side === "left" ? "4.75 M" : "1.3 × 10⁻⁹ M");
  });
}

for (const locale of ["en", "fr", "es"]) {
  test(`hydrogen concentration reaction matches its two-electron Q and Gibbs energy in ${locale}`, async ({ page }) => {
    await ready(page, 2, locale);
    const potential = await page.evaluate(async (modulePath) => {
      const { HALF_CELLS } = (await import(modulePath)) as typeof import("../../src/common/model/HalfCells.js");
      const model = (window as unknown as SimulationWindow<NernstModel>).phet.joist.sim.selectedScreenProperty.value
        .model;
      model.timer.isPlayingProperty.value = false;
      model.cell.left.halfCellProperty.value = HALF_CELLS.h2;
      model.cell.right.halfCellProperty.value = HALF_CELLS.h2;
      model.cell.left.concentrationProperty.value = 0.01;
      model.cell.right.concentrationProperty.value = 1;
      return model.cell.potentialProperty.value;
    }, "/src/common/model/HalfCells.ts");
    const lines = await strings(page);
    const reaction = lines.find((line) => line.includes("→") && line.includes("H<sup>+</sup>(aq,"))!;
    expect(reaction.match(/2H<sup>\+<\/sup>/g)).toHaveLength(2);
    expect(lines.some((line) => line.startsWith("n = 2"))).toBe(true);
    const quotient = lines.find((line) => line.startsWith("Q = [H"))!;
    expect(quotient.match(/<sup>2<\/sup>/g)).toHaveLength(2);
    expect(lines.some((line) => line.startsWith("ΔG") && line.includes("−22.8"))).toBe(true);
    expect(potential).toBeCloseTo(0.118318699371443, 12);
  });
}

for (const { id, message } of [
  { id: "water", message: "A gas tube is full. The run has stopped." },
  { id: "copperPlating", message: "The anode has dissolved. The run has stopped." },
] as const) {
  test(`native power toggle after ${id} finishes announces the completion reason`, async ({ page }) => {
    await ready(page, 3);
    await page.evaluate(
      async ({ systemId, modulePath }) => {
        const { ELECTROLYSIS_SYSTEMS } = (await import(
          modulePath
        )) as typeof import("../../src/common/model/ElectrolysisSystems.js");
        const target = window as unknown as SimulationWindow<ElectrolysisModel>;
        const screen = target.phet.joist.sim.selectedScreenProperty.value;
        const model = screen.model;
        model.timer.isPlayingProperty.value = false;
        model.systemProperty.value = ELECTROLYSIS_SYSTEMS[systemId];
        model.powerOnProperty.value = true;
        model.advance(500000);
        if (!model.finishedProperty.value) {
          throw new Error("Run did not finish");
        }
        target.reviewResponses = [];
        const original = screen.view.addAccessibleResponse.bind(screen.view);
        screen.view.addAccessibleResponse = (...args) => {
          target.reviewResponses!.push(String(args[0]));
          return original(...args);
        };
      },
      { systemId: id, modulePath: "/src/common/model/ElectrolysisSystems.ts" },
    );
    const power = page.getByRole("checkbox", { name: "Power on", exact: true });
    await power.press("Space");
    await power.press("Space");
    expect(
      await page.evaluate(() => (window as unknown as SimulationWindow<ElectrolysisModel>).reviewResponses),
    ).toEqual(["Power off.", message]);
  });
}
