// validations/invoiceValidation.js
import Swal from "sweetalert2";
// export const ValidationSubmitForm = (data, type, warehouseData, getValues) => {
//   if (type === "I") {
//     const missingWhs = data.oLines.some((line) => !line.WHSCode);
//     const missingUom = data.oLines.some((line) => !line.UomCode);
//     // const currentItemExcisable = data.oLines.every(
//     //   (line) => line.Excisable === "Y"
//     // );
//     const lines = data.oLines;
//     const allPostTaxY = lines.every((line) => line.PostTax === "Y");
//     const allPostTaxN = lines.every((line) => line.PostTax !== "Y");
//     const mixedPostTax = !allPostTaxY && !allPostTaxN;
//     const allExciseY = lines.every((line) => line.Excisable === "Y");
//     const allExciseN = lines.every((line) => line.Excisable !== "Y");
//     const mixedExcise = !allExciseY && !allExciseN;
//     const invalid =
//       mixedPostTax || // ❌ Mixed PostTax
//       (allPostTaxY && mixedExcise); // ❌ All PostTax Y but mixed Excisable
//     if (lines.length > 1 && invalid) {
//       Swal.fire({
//         title: "Warning!",
//         text: `You cannot select items with different tax categories (GST/EXCISE) in a single document.`,
//         icon: "warning",
//         confirmButtonText: "Ok",
//       });

//       return false;
//     }
//     const hasWarehouseValidationError = data.oLines.some((item, index) => {
//       const warehouse = warehouseData.find((wh) => wh.WHSCode === item.WHSCode);
//       const currentItemTaxCategory = item.GstTaxCtg;
//       const taxCategories = data.oLines.map((l) => l.GstTaxCtg).filter(Boolean);
//       taxCategories[index] = currentItemTaxCategory;
//       const uniqueTaxCategories = [...new Set(taxCategories)];
//       // Conflict between GST and Excise tax categories
//       if (uniqueTaxCategories.includes("E") && uniqueTaxCategories.length > 1) {
//         const baseCategory = currentItemTaxCategory;
//         const conflictDetails = taxCategories
//           .map((cat, idx) => {
//             if (cat !== baseCategory) {
//               return `Line ${idx + 1} (${cat})`;
//             }
//             return null;
//           })
//           .filter(Boolean);
//         Swal.fire({
//           title: "Error!",
//           text: `You cannot select items with different tax categories in one document. Conflict at line(s): ${conflictDetails.join(
//             ", "
//           )}`,
//           icon: "warning",
//         });
//         return true;
//       }
//       // 🚫 Case 1: Non-excisable item in excisable warehouse
//       if (item.Excisable === "Y" || item.Excisable === "N") {
//         // Error conditions:
//         // 1. Non-excisable item (N) in excisable warehouse (Y)
//         // 2. Excisable item (Y) in non-excisable warehouse (N)
//         if (item.Excisable === "N" && warehouse?.Excisable === "Y") {
//           Swal.fire({
//             title: "Error!",
//             text: `Non-excisable items cannot be stored in an excisable warehouse [Warehouse Code-${
//               warehouse?.WHSCode
//             }][Line: ${index + 1}]`,
//             icon: "warning",
//             confirmButtonText: "Ok",
//           });
//           return true;
//         }

//       }

//       // 🚫 Case 2: GST-relevant item in non-GST warehouse
//       if (item.PostTax === "Y") {
//         const isNonGstWarehouse =
//           [null, undefined, ""].includes(warehouse?.GSTRegnNo) &&
//           [null, undefined, ""].includes(warehouse?.GSTType);
//         if (isNonGstWarehouse) {
//           Swal.fire({
//             title: "Error!",
//             text: `You must select a warehouse with GST-relevant location for GST-relevant items [Line:- ${
//               index + 1
//             } - WHSCode:-${warehouse?.WHSCode}]`,
//             icon: "warning",
//             confirmButtonText: "Ok",
//           });
//           return true;
//         }
//       }
//       return false;
//     });
//     if (hasWarehouseValidationError) return false;
//     // 🚫 Unique Location Validation
//     const uniqueLocCodes = [
//       ...new Set(data.oLines.map((line) => line.LocCode).filter(Boolean)),
//     ];
//     if (uniqueLocCodes.length > 1) {
//       Swal.fire({
//         title: "Error!",
//         text: "All selected warehouses must belong to the same location. Please revise your selection.",
//         icon: "warning",
//         confirmButtonText: "OK",
//       });
//       return false;
//     }
//     //Missing WareHouse And Massing UomCode
//     if (missingWhs || missingUom) {
//       const errorFields =
//         missingWhs && missingUom
//           ? "WHSCode and UomCode"
//           : missingWhs
//           ? "WHSCode"
//           : "UomCode";

//       Swal.fire({
//         title: `Missing Required Fields`,
//         text: `Please select the ${errorFields} for all lines.`,
//         icon: "warning",
//         confirmButtonText: "Ok",
//       });

//       return false;
//     }
//   }
//   // ✅ General Validations
//   if (getValues("oLines")?.length === 0) {
//     Swal.fire({
//       title: "Select Item",
//       text: "Please select at least one item.",
//       icon: "warning",
//       confirmButtonText: "Ok",
//       timer: 3000,
//     });
//     return false;
//   }
//   // if (getValues("DocTotal") <= 0) {
//   //   Swal.fire({
//   //     text: "Total document value must be zero or greater.",
//   //     icon: "warning",
//   //     confirmButtonText: "Ok",
//   //   });
//   //   return false;
//   // }
//   const hasInvalidQuantity = data.oLines.some((line) => {
//     const quantity = Number(line.Quantity);
//     return isNaN(quantity) || quantity <= 0;
//   });
//   const hasInvalidPrice = data.oLines.some((line) => {
//     const price = Number(line.PriceBefDi);
//     return isNaN(price) || price <= 0;
//   });

//   if (hasInvalidQuantity) {
//     Swal.fire({
//       text: "Item quantity should be greater than zero!",
//       icon: "warning",
//       toast: true,
//       showConfirmButton: false,
//       timer: 1500,
//     });
//     return false;
//   }

//   if (hasInvalidPrice) {
//     Swal.fire({
//       text: "Price cannot be zero or empty",
//       icon: "warning",
//       toast: true,
//       showConfirmButton: false,
//       timer: 1500,
//     });
//     return false;
//   }

//   return true;
// };



const showLineError = (index, line, message) => {
  Swal.fire({
    icon: "warning",
    title: "Validation Error",
    text: `Line ${index + 1}: ${line.ItemCode || "-"} - ${
      line.ItemName || ""
    } (${message})`,
    confirmButtonText: "Ok",
  });
};

export const ValidationSubmitForm = (
  data,
  type,
  warehouseData,
  getValues
) => {
  const lines = data.oLines || [];

  // 🔴 No items
  if (lines.length === 0) {
    Swal.fire({
      title: "Select Item",
      text: "Please select at least one item.",
      icon: "warning",
      confirmButtonText: "Ok",
      timer: 3000,
    });
    return false;
  }


  if (type === "I") {
    /* ----------------------------
       GST / EXCISE MIX VALIDATION
       ---------------------------- */
    const allPostTaxY = lines.every((l) => l.PostTax === "Y");
    const allPostTaxN = lines.every((l) => l.PostTax !== "Y");
    const mixedPostTax = !allPostTaxY && !allPostTaxN;

    const allExciseY = lines.every((l) => l.Excisable === "Y");
    const allExciseN = lines.every((l) => l.Excisable !== "Y");
    const mixedExcise = !allExciseY && !allExciseN;

    if (lines.length > 1 && (mixedPostTax || (allPostTaxY && mixedExcise))) {
      Swal.fire({
        title: "Warning!",
        text:
          "You cannot select items with different tax categories (GST / EXCISE) in a single document.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }

    /* ----------------------------
       LINE LEVEL VALIDATIONS
       ---------------------------- */
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];

      /* 🔴 Missing Warehouse */
      if (!line.WHSCode) {
        showLineError(index, line, "Warehouse not selected");
        return false;
      }

      /* 🔴 Missing UOM */
      if (!line.UomCode) {
        showLineError(index, line, "UOM not selected");
        return false;
      }

      const warehouse = warehouseData.find(
        (wh) => wh.WHSCode === line.WHSCode
      );

      /* 🔴 GST / EXCISE CATEGORY CONFLICT */
      const taxCategories = lines
        .map((l) => l.GstTaxCtg)
        .filter(Boolean);
      const uniqueTaxCategories = [...new Set(taxCategories)];

      if (uniqueTaxCategories.includes("E") && uniqueTaxCategories.length > 1) {
        Swal.fire({
          title: "Tax Category Conflict",
          text:
            "You cannot mix GST and EXCISE items in the same document.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return false;
      }

      /* 🔴 Excisable item vs warehouse */
      if (
        line.Excisable === "N" &&
        warehouse?.Excisable === "Y"
      ) {
        showLineError(
          index,
          line,
          `Non-excisable item cannot be stored in excisable warehouse (${warehouse.WHSCode})`
        );
        return false;
      }

      
      if (
        line.Excisable === "Y" &&
        warehouse?.Excisable === "N"
      ) {
        showLineError(
          index,
          line,
          `Excisable item cannot be stored in non-excisable warehouse (${warehouse.WHSCode})`
        );
        return false;
      }

      /* 🔴 GST item in non-GST warehouse */
      if (line.PostTax === "Y") {
        const isNonGstWarehouse =
          !warehouse?.GSTRegnNo && !warehouse?.GSTType;

        if (isNonGstWarehouse) {
          showLineError(
            index,
            line,
            `GST item requires GST-registered warehouse (${warehouse?.WHSCode})`
          );
          return false;
        }
      }
    }

    /* ----------------------------
       UNIQUE LOCATION CHECK
       ---------------------------- */
    const uniqueLocCodes = [
      ...new Set(lines.map((l) => l.LocCode).filter(Boolean)),
    ];

    if (uniqueLocCodes.length > 1) {
      Swal.fire({
        title: "Location Mismatch",
        text:
          "All selected warehouses must belong to the same location.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return false;
    }
  }

  /* ============================
     🔹 GENERAL VALIDATIONS
     ============================ */

  /* 🔴 Quantity */
  const invalidQtyIndex = lines.findIndex((l) => {
    const qty = Number(l.Quantity);
    return isNaN(qty) || qty <= 0;
  });

  if (invalidQtyIndex !== -1) {
    showLineError(
      invalidQtyIndex,
      lines[invalidQtyIndex],
      "Quantity must be greater than zero"
    );
    return false;
  }

  /* 🔴 Price */
  const invalidPriceIndex = lines.findIndex((l) => {
    const price = Number(l.PriceBefDi);
    return isNaN(price) || price <= 0;
  });

  if (invalidPriceIndex !== -1) {
    showLineError(
      invalidPriceIndex,
      lines[invalidPriceIndex],
      "Price must be greater than zero"
    );
    return false;
  }

  /* ============================
     ✅ ALL VALID
     ============================ */
  return true;
};
