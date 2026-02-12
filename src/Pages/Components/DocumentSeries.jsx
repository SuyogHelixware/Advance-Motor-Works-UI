// useDocumentSeries.js
import { useEffect, useState, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";

export const useDocumentSeries = (transId) => {
  const [seriesData, setSeriesData] = useState([]);
  const [series, setSeries] = useState("");
  const [docNum, setDocNum] = useState("");
  const lastIdRef = useRef(null);

  const fetchSeries = useCallback(async () => {
    try {
      const res = await apiClient.get(`/DocSeries/ByTransId/${transId}`);
      const response = res.data;

      if (response.success) {
        setSeriesData(response.values);
        setSeries(response.values[0]?.DocEntry || "");
        setDocNum(response.values[0]?.DocNum || "");
      } else {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error?.message || String(error),
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  }, [transId]);

  useEffect(() => {
    if (!transId || lastIdRef.current === transId) return;
    lastIdRef.current = transId;
    fetchSeries();
  }, [transId, fetchSeries]);

  return { seriesData, series, docNum };
};
