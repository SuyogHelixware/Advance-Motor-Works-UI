// import { useEffect, useMemo } from "react";
// import { useWatch } from "react-hook-form";
// import { ValueFormatter } from "./ValueFormatter";

// // Utility: value formatter
// const safeValue = (v) => (isNaN(v) ? 0 : parseFloat(v));
// const fmt = (v, decimals = 3) => ValueFormatter(v, decimals);

// export function useCurrencyRateEffect({
//   control,
//   allFormData,
//   companyData,
//   curSource,
//   SysRate,
//   taxCalculation,
//   reset,
//   setValue,
//   setRollBackoExpLines,
// }) {
//   const currency = useWatch({ control, name: "Currency" });
//   const DocRate = useWatch({ control, name: "DocRate" });

//   const isSysCurrency = useMemo(
//     () => currency === companyData.SysCurrncy,
//     [currency, companyData.SysCurrncy]
//   );
//   useEffect(() => {
//     if (!DocRate || DocRate <= 0) return;
//     if (!allFormData) return;

//     const updatedData = { ...allFormData };
//     updatedData.SysRate = isSysCurrency ? DocRate : SysRate;

//     // ==============================
//     // Helper: Line Recalculation
//     // ==============================
//     const recalcLine = (line, isExpense = false) => {
//       let TotalFrgn = 0,
//         LineTotal = 0,
//         TotalSumSy = 0;

//       const Price = line.Price * (line.Quantity ?? 1);

//       switch (curSource) {
//         case "L":
//           TotalFrgn = 0;
//           LineTotal = Price;
//           TotalSumSy = LineTotal / SysRate;
//           break;

//         case "S":
//           TotalSumSy = Price / SysRate;
//           LineTotal = TotalSumSy * DocRate;
//           TotalFrgn = TotalSumSy;
//           break;

//         case "C":
//           if (currency === companyData.MainCurncy) {
//             TotalFrgn = 0;
//             LineTotal = line.LineTotal;
//             TotalSumSy = line.LineTotal / SysRate;
//           } else {
//             const totalValue =
//               currency === line.Currency ? Price * DocRate : Price * SysRate;
//             LineTotal = totalValue;
//             TotalFrgn =
//               currency === line.Currency ? Price : LineTotal / DocRate;
//             TotalSumSy = isSysCurrency
//               ? LineTotal / DocRate
//               : LineTotal / SysRate;
//           }
//           break;

//         default:
//           return line;
//       }

//       // Tax and gross calculations for expense lines only
//       if (isExpense) {
//         const taxResult = taxCalculation(
//           LineTotal,
//           (updatedData.AssblValue = LineTotal),
//           line.DocTotal,
//           (updatedData.PriceBefDi = LineTotal),
//           (updatedData.Quantity = 1),
//           line.TaxCode
//         );

//         const { oTaxLines, VatSum, VatSumSy, VatSumFrgn } = taxResult;
//         const addVat = (v, t) => fmt(safeValue(v) + safeValue(t));

//         return {
//           ...line,
//           LineTotal: fmt(LineTotal),
//           TotalSumSy: fmt(TotalSumSy),
//           TotalFrgn: fmt(TotalFrgn),
//           oTaxLines,
//           VatSum: fmt(VatSum),
//           VatSumSy: fmt(VatSumSy),
//           VatSumFrgn: fmt(VatSumFrgn),
//           GrsAmount: addVat(VatSum, LineTotal),
//           GrsSC: addVat(VatSumSy, TotalSumSy),
//           GrsFC: addVat(VatSumFrgn, TotalFrgn),
//         };
//       }

//       // Normal line recalculation
//       return {
//         ...line,
//         LineTotal: fmt(LineTotal),
//         TotalSumSy: fmt(TotalSumSy),
//         TotalFrgn: fmt(TotalFrgn),
//       };
//     };

//     // ==============================
//     // Recalculate oLines & oExpLines
//     // ==============================
//     if (Array.isArray(allFormData.oLines)) {
//       updatedData.oLines = allFormData.oLines.map((line) =>
//         recalcLine(line, false)
//       );
//     }

//     if (Array.isArray(allFormData.oExpLines)) {
//       updatedData.oExpLines = allFormData.oExpLines.map((line) =>
//         recalcLine(line, true)
//       );
//     }

//     // ==============================
//     // Totals Calculation
//     // ==============================
//     const totals = updatedData.oExpLines?.reduce(
//       (acc, line) => ({
//         TotalExpns: acc.TotalExpns + safeValue(line.LineTotal),
//         totalExpFC: acc.totalExpFC + safeValue(line.TotalFrgn),
//         totalExpSC: acc.totalExpSC + safeValue(line.TotalSumSy),
//         taxOnExp: acc.taxOnExp + safeValue(line.VatSum),
//         taxOnExpFc: acc.taxOnExpFc + safeValue(line.VatSumFrgn),
//         taxOnExpSc: acc.taxOnExpSc + safeValue(line.VatSumSy),
//       }),
//       {
//         TotalExpns: 0,
//         totalExpFC: 0,
//         totalExpSC: 0,
//         taxOnExp: 0,
//         taxOnExpFc: 0,
//         taxOnExpSc: 0,
//       }
//     );

//     // ==============================
//     // Apply changes to form
//     // ==============================
//     reset(updatedData);
//     setRollBackoExpLines(updatedData.oExpLines ?? []);

//     setValue("TotalExpns", fmt(totals.TotalExpns));
//     setValue("TotalExpFC", fmt(totals.totalExpFC));
//     setValue("TotalExpSC", fmt(totals.totalExpSC));
//     setValue("TaxOnExp", fmt(totals.taxOnExp));
//     setValue("TaxOnExpFc", fmt(totals.taxOnExpFc));
//     setValue("TaxOnExpSc", fmt(totals.taxOnExpSc));
//   }, [
//     DocRate,
//     currency,
//     SysRate,
//     curSource,
//     allFormData,
//     companyData,
//     taxCalculation,
//     reset,
//     setValue,
//     setRollBackoExpLines,
//     isSysCurrency,
//   ]);
// }
