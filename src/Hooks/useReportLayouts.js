import { useCallback, useEffect, useState } from "react";
import apiClient from "../services/apiClient";

export default function useReportLayouts(TypeCode) {
  const [apiRowsReport, setApiRowsReport] = useState({});
  const [Reportloading, setReportLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const fetchReportLayouts = useCallback(async () => {
    if (!TypeCode) return;
    try {
      setReportLoading(true);
      const response = await apiClient.get(`/ReportLeyoutV2/LayoutDetails`, {
        params: {
          TypeCode,
          Status: 1,
          Page: page,
          Limit: limit,
          ...(searchText?.trim() && { SearchText: searchText.trim() }),
        },
      });
      const data = response?.data?.values?.[0] || {};
      setApiRowsReport(data);
    } catch (err) {
      console.error("Report Layout API Error:", err);
    } finally {
      setReportLoading(false);
    }
  }, [TypeCode, page, limit, searchText]);

  useEffect(() => {
    fetchReportLayouts();
  }, [TypeCode]);
  return {
    apiRowsReport,
    Reportloading,
    fetchReportLayouts,
    page,
    setPage,
    limit,
    setLimit,
    searchText,
    setSearchText,
  };
}
