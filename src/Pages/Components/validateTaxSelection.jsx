// utils/validateTaxSelection.js
import Swal from "sweetalert2";
export const validateTaxSelection = ({
  line,
  index,
  lines,
  selectedTax,
  selectedOlineTax,
  warehouseData,
  oTaxExtLines,
}) => {
  const stateIsWareHouse = warehouseData.filter(
    (whc) => whc.WHSCode === line.WHSCode
  );
  const State = oTaxExtLines;
  const currentItemTaxCategory = line.GstTaxCtg;
  const currentItemExcisable = line.Excisable;
  const selectedTaxRate = selectedTax.Rate;
  const exciseCategories = lines.map((l) => l.Excisable).filter(Boolean);
  exciseCategories[index] = currentItemExcisable;
  const uniqueExcise = [...new Set(exciseCategories)];
  if (!uniqueExcise.includes("Y") && !uniqueExcise.includes("N")) {
    Swal.fire({
        title: "warning!",
      text: `You cannot mix GST-relevant and Excise-relevant items in the same transaction. Please ensure all items in the document follow the same tax regime`,
      icon: "warning",
        stopKeydownPropagation: true,
    });
    return false;
  }
  //#endregion
  //#region  4 Validation 5: Mixed GST Categories
  if (
    stateIsWareHouse[0]?.State === State[0]?.StateS && // Intra-state
    stateIsWareHouse[0]?.UnionT === "Y" // Warehouse is Union Territory
  )
    if (line.PostTax === "Y") {
      const hasUTGST =
        selectedOlineTax.some((t) => t.TaxAmtKey?.includes("UGST_TaxAmt")) &&
        selectedOlineTax.some((t) => t.TaxAmtKey?.includes("CGST_TaxAmt"));
      if (!hasUTGST) {
        Swal.fire({
          title: "warning!",
          text: `You must select a CGST+UTGST tax code in line ${
            index + 1
          } for intrastate Union Territory business.`,
          icon: "warning",
          confirmButtonText: "OK",
            stopKeydownPropagation: true,
        });
        return false;
      }
    }
  //#region  Validation 1: Intrastate
  if (
    stateIsWareHouse[0]?.State === State[0]?.StateS && // Intra-state
    stateIsWareHouse[0]?.UnionT === "N"
  ) {
    // const isCGSTSGST =
    //   selectedTax.TaxCode?.includes("CGST") &&
    //   selectedTax.TaxCode?.includes("SGST");

    if (line.PostTax === "Y") {
      const isCGSTSGST =
        selectedOlineTax.some((t) => t.TaxAmtKey?.includes("CGST_TaxAmt")) &&
        selectedOlineTax.some((t) => t.TaxAmtKey?.includes("SGST_TaxAmt"));
      if (!isCGSTSGST) {
        Swal.fire({
           title: "warning!",
          text: `You must select a CGST+SGST tax code in line ${
            index + 1
          } for intrastate business`,
          icon: "warning",
            stopKeydownPropagation: true,
        });
        return false;
      }
    }
  }
  //#endregion
  //#region  Validation 2: Interstate
  if (stateIsWareHouse[0]?.State !== State[0]?.StateS) {
    const isIGST = selectedOlineTax.some((t) =>
      t.TaxAmtKey?.includes("IGST_TaxAmt")
    );
    if (line.PostTax === "Y") {
      if (!isIGST) {
        Swal.fire({
             title: "warning!",
          text: `You must select an IGST tax code in line ${
            index + 1
          } for interstate business`,
          icon: "warning",
            stopKeydownPropagation: true,
        });
        return false;
      }
    }
  }
  //#endregion

  //#region  Validation 5: Nil Rated
  if (currentItemTaxCategory === "N" && selectedTaxRate > 0) {
    Swal.fire({
         title: "warning!",
      text: `You must select tax code with zero rate in line ${index + 1}`,
      icon: "warning",
        stopKeydownPropagation: true,
    });
    return false;
  }
  //#endregion

  //#region  Validation 6: Exempt
  if (currentItemTaxCategory === "E" && selectedTaxRate > 0) {
    Swal.fire({
         title: "warning!",
      text: `You must select tax code with zero rate in line ${index + 1}`,
      icon: "warning",
        stopKeydownPropagation: true,
    });
    return false;
  }
  //#endregion

  //#region  Validation 7: Mixed GST Categories
  const taxCategories = lines.map((l) => l.GstTaxCtg).filter(Boolean);
  taxCategories[index] = currentItemTaxCategory;
  const uniqueTaxCategories = [...new Set(taxCategories)];
  if (uniqueTaxCategories.includes("E") && uniqueTaxCategories.length > 1) {
    const baseCategory = currentItemTaxCategory;
    // Step 5: Find all differing indices (1-based line numbers)
    const conflictDetails = taxCategories
      .map((cat, idx) => {
        if (cat !== baseCategory) {
          return `Line ${idx + 1} (${cat})`;
        }
        return null;
      })
      .filter(Boolean);

    Swal.fire({
         title: "warning!",
      text: `You cannot select items with different tax categories in one document  Conflict at line(s): ${conflictDetails.join(
        ", "
      )}`,
      icon: "warning",
        stopKeydownPropagation: true,
    });
    return false;
  }
  //#endregion

  return true; // All validations passed
};
