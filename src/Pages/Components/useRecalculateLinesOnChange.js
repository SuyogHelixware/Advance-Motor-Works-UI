// hooks/useRecalculateLinesOnChange.js
import { useEffect } from "react";
import { recalculateLines } from "./recalculateLines";


export const useRecalculateLinesOnChange = ({
  getValues,
  setValue,
  dependencies = [],
}) => {
  useEffect(() => {
    const update = async () => {
      const oLines = getValues("oLines") || [];
      const DocRateLine = getValues("DocRateLine") || 1;
      const SysRate = getValues("SysRate") || 1;
       if (Array.isArray(oLines) && oLines.length > 0) {
        recalculateLines({ oLines, DocRateLine, SysRate, setValue });
      }
    };
    update();
  }, dependencies); // e.g. [getValues("DocDate"), getValues("DocRateLine")]
};
