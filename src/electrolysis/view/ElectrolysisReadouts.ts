/**
 * ElectrolysisReadouts.ts
 *
 * Shared electrode product readout formatting (screen view + summary).
 */

import { StringUtils } from "scenerystack/phetcommon";
import type { ElectrodeMaterial, ElectrodeProduct } from "../../common/model/ElectrolysisSystems.js";
import { fixed, formatMass, signed } from "../../common/view/formatValues.js";
import { StringManager } from "../../i18n/StringManager.js";
import { reportedElectrodeMass } from "../model/ElectrolysisModel.js";

/** Plain-text measurement of one electrode's product, for readouts and descriptions. */
export function productReadout(
  product: ElectrodeProduct,
  isCathode: boolean,
  mass: number,
  gasVolume: number,
  plain: boolean,
  material: ElectrodeMaterial,
): string {
  const strings = StringManager.getInstance().getElectrolysisStrings();
  if (product.kind === "gas") {
    return StringUtils.fillIn(strings.gasVolumePatternStringProperty.value, {
      gas: plain ? product.formulaPlain : product.formula,
      value: fixed(gasVolume, 1),
    });
  }
  const reported = reportedElectrodeMass(product, material, mass);
  return StringUtils.fillIn(
    (isCathode ? strings.cathodeMassPatternStringProperty : strings.anodeMassPatternStringProperty).value,
    { value: formatMass(reported.value), change: signed(reported.change, 3) },
  );
}
