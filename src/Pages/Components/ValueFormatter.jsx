// export function ValueFormatter(number) {
//     const rounded = Math.round(Number(number) * Math.pow(10,3)) 
//     / Math.pow(10,3);
//     return rounded.toFixed(3);
// }

import { InputTextField } from "./formComponents";

/**
 * Formats numbers to a fixed number of decimals safely.
 *
 * @param {number|string} value - Input number
 * @param {number} decimals - Number of decimal places (default: 3)
 * @param {boolean} asString - Whether to return string (default: true)
 * @returns {string|number}
 */
export function ValueFormatter(value, decimals = 2, asString = true) {
  // Convert to number safely
  const num = Number(value);

  // Return 0 if invalid
  if (isNaN(num)) return asString ? "0.000" : 0;

  // Round to given decimals
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(num * factor) / factor;

  return asString ? rounded.toFixed(decimals) : rounded;
}

export const formatForUI = (value, uiDecimals = 2) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  return isNaN(num) ? "" : num.toFixed(uiDecimals);
};




export function TwoFormatter(
  value,
  decimals = 2,
  locale = "en-IN",
  asString = true
) {
  const num = Number(value);
  if (isNaN(num)) {
    return asString ? (0).toFixed(decimals) : 0;
  }

  const factor = Math.pow(10, decimals);
  const rounded = Math.round(num * factor) / factor;

  if (!asString) return rounded;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded);
}
