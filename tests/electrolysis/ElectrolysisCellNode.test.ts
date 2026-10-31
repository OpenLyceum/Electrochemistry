/**
 * ElectrolysisCellNode.test.ts
 *
 * Rebuilding the apparatus when the cell changes. The gas column and bubbles are kept across
 * rebuilds, so a rebuild must not dispose them. Assertions are switched on here so that
 * SceneryStack's affirm() reports a second dispose, as it does in the sim with ?ea.
 */

import { BooleanProperty } from "scenerystack/axon";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ELECTROLYSIS_SYSTEMS, type ElectrolysisSystemId } from "../../src/common/model/ElectrolysisSystems.js";
import { ElectrolysisModel } from "../../src/electrolysis/model/ElectrolysisModel.js";
import { ElectrolysisCellNode } from "../../src/electrolysis/view/ElectrolysisCellNode.js";

const scope = globalThis as { assert?: unknown };

describe("ElectrolysisCellNode", () => {
  let savedAssert: unknown;
  beforeEach(() => {
    savedAssert = scope.assert;
    scope.assert = (predicate: boolean, message?: string) => {
      if (!predicate) {
        throw new Error(message);
      }
    };
  });
  afterEach(() => {
    scope.assert = savedAssert;
  });

  it("switches between gas and metal cells without disposing what it keeps", () => {
    const model = new ElectrolysisModel();
    const node = new ElectrolysisCellNode(model, new BooleanProperty(false));
    model.powerOnProperty.value = true;
    const order: ElectrolysisSystemId[] = [
      "water",
      "copperChloride",
      "water",
      "copperPlating",
      "water",
      "silverPlating",
      "copperChloride",
      "copperPlating",
    ];
    for (const id of order) {
      expect(() => {
        model.systemProperty.value = ELECTROLYSIS_SYSTEMS[id];
        model.advance(120);
        node.step(1 / 60);
      }).not.toThrow();
    }
  });
});
