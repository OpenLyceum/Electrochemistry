/**
 * NernstVerdict.ts
 *
 * Shared Nernst chart/description state and spontaneity verdict.
 */

import type { NernstChartData } from "./NernstChartNode.js";

/** Everything the chart, equation and description show, for the reaction as written. */
export type NernstState = NernstChartData & {
  readonly electrons: number;
};

/** Direction of the reaction as written; |E| below 0.1 mV counts as equilibrium. */
export function verdictOf(potential: number): "spontaneous" | "nonSpontaneous" | "equilibrium" {
  return potential > 1e-4 ? "spontaneous" : potential < -1e-4 ? "nonSpontaneous" : "equilibrium";
}
