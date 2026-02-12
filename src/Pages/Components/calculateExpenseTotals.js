import { ValueFormatter } from "./ValueFormatter";
export function calculateExpenseTotals(oExpLines,setValue) {
  const fieldMap = [
    ["TotalExpSC", "TotalSumSy"],
    ["TotalExpns", "LineTotal"],
    ["TaxOnExp", "VatSum"],
    ["TaxOnExpSc", "VatSumSy"],
    ["TaxOnExpFc", "VatSumFrgn"],
    ["TotalExpFC", "TotalFrgn"],
  ];

  const totals = fieldMap.reduce((acc, [totalKey]) => {
    acc[totalKey] = 0;
    return acc;
  }, {});

  oExpLines.forEach((line) => {
    fieldMap.forEach(([totalKey, fieldName]) => {
      totals[totalKey] += parseFloat(line[fieldName]) || 0;
    });
  });
  console.log("total Value", totals)
  Object.entries(totals).forEach(([key, value]) => {
  setValue(key, ValueFormatter(value));
});
}


export function getUniqueCount(data, field) {
  const set = new Set();
  for (const item of data) {
    set.add(item[field]);
  }
  return set.size;
}
