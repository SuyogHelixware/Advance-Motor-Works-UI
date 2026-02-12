// export function recalcHeaderTotals(oLines, setValue) {
//   const total = oLines.reduce((sum, item) => sum + (item.LineTotal || 0), 0);
//   const TotolSumSy=oLines.reduce((sum, item) => sum + (item.LineTotal || 0), 0);
//   setValue("DocTotal", total.toFixed(3));
//   setValue("DocTotalSy", TotolSumSy.toFixed(3));
// }

export function recalcHeaderTotals(oLines = [], setValue) {
  if (!Array.isArray(oLines) || oLines.length === 0) return;

  const { DocTotal, DocTotalSy } = oLines.reduce(
    (acc, item) => {
      const lineTotal = parseFloat(item.LineTotal) || 0;
      const totalSumSy = parseFloat(item.TotalSumSy) || lineTotal;

      acc.DocTotal += lineTotal;
      acc.DocTotalSy += totalSumSy;
      return acc;
    },
    { DocTotal: 0, DocTotalSy: 0 }
  );


  setValue("DocTotal", DocTotal.toFixed(3));
  setValue("DocTotalSy", DocTotalSy.toFixed(3));
}
