import { ValueFormatter } from "./ValueFormatter";

// utils/recalculateLines.js
export function recalculateLines({
  oLines,
  DocRateLine,
  SysRate = 1,
  setValue,
}) {
  if (!Array.isArray(oLines) || !oLines.length) return;
  const updatedLines = (oLines || []).map((item) => {
    const qty = parseFloat(item.Quantity) || 0;
    const price = parseFloat(item.PriceBefDi) || 0;
    const rate = parseFloat(DocRateLine) || 1;
    const lineTotal = qty * price * rate;
    const totalSumSy = ValueFormatter(lineTotal / SysRate);
    return {
      ...item,
      LineTotal: lineTotal,
      TotalSumSy: totalSumSy,
      StockPrice: item.PriceBefDi,
      Rate: rate,
      StockSum: lineTotal,
      StockSumSc: totalSumSy,
    };
  });

  setValue("oLines", updatedLines);
  return updatedLines;
}
