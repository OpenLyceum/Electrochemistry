/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 *
 * Models, screen views and their panels live for the whole sim. What is created and thrown away
 * at runtime is drawing content: the electrolysis apparatus rebuilds its wires and electron flows
 * when the cell changes, and ions come and go in the beakers. Each links to profile colours.
 */

import { Vector2 } from "scenerystack/dot";
import { Circle } from "scenerystack/scenery";
import { TimeModel } from "../src/common/TimeModel.js";
import { ElectronFlowNode, wirePath } from "../src/common/view/ElectronFlowNode.js";
import ElectrochemistryColors from "../src/ElectrochemistryColors.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

const WIRE = [new Vector2(0, 0), new Vector2(0, 100), new Vector2(200, 100)];

describeDisposalLeaks([
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
  { name: "ElectronFlowNode", create: () => new ElectronFlowNode(WIRE), idempotentDispose: true },
  { name: "wirePath", create: () => wirePath(WIRE), idempotentDispose: true },
  {
    name: "ion particle",
    create: () => new Circle(6, { fill: ElectrochemistryColors.copperColorProperty }),
    idempotentDispose: true,
  },
]);
