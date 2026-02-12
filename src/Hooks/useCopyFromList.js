import { useState, useRef, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import apiClient from "../services/apiClient";

export const useCopyFromList = ({
  BasePoint,
  open,
  CardCode,
  baseType,
  type,
}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const abortRef = useRef(null);
  const timeoutRef = useRef(null);

  // 🔒 guards
  const isResettingRef = useRef(false);
  const isLoadingRef = useRef(false);

  /* ================= FETCH ================= */
  const fetchData = useCallback(
    async (pageNum = 0, searchTerm = "") => {
      if (!open || !CardCode || !baseType) return;
      if (isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const response = searchTerm
          ? await apiClient.get(
              `${BasePoint}/CopyFrom/Search/${searchTerm}/${CardCode}/${type}/${baseType}/${pageNum}/20`,
              { signal: abortRef.current.signal }
            )
          : await apiClient.get(
              `${BasePoint}/CopyFrom/${CardCode}/${type}/${baseType}/${pageNum}/20`,
              { signal: abortRef.current.signal }
            );

        if (response.data.success) {
          const newData = response.data.values || [];

          setHasMore(newData.length === 20);
          setData((prev) =>
            pageNum === 0 ? newData : [...prev, ...newData]
          );
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message,
            icon: "error",
          });
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("CopyFrom fetch error:", err);
        }
      } finally {
        isLoadingRef.current = false;
        isResettingRef.current = false; // 🔓 unlock pagination
      }
    },
    [open, CardCode, baseType, type]
  );

  /* ================= OPEN MODAL ================= */
  useEffect(() => {
    if (!open) return;

    isResettingRef.current = true;
    setPage(0);
    setHasMore(true);
    setQuery("");
    setSearching(false);
    setData([]);
    fetchData(0);

    return () => abortRef.current?.abort();
  }, [open, fetchData]);

  /* ================= BASETYPE / CARDCODE CHANGE ================= */
  useEffect(() => {
    if (!open) return;

    isResettingRef.current = true;
    setPage(0);
    setHasMore(true);
    setData([]);
    fetchData(0);
  }, [open, CardCode, baseType, fetchData]);

  /* ================= SEARCH ================= */
  const onSearch = (term) => {
    if (!open) return;

    isResettingRef.current = true;
    setQuery(term);
    setSearching(true);
    setPage(0);
    setHasMore(true);
    setData([]);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchData(0, term);
    }, 600);
  };

  /* ================= CLEAR ================= */
  const onClear = () => {
    if (!open) return;

    isResettingRef.current = true;
    setQuery("");
    setSearching(false);
    setPage(0);
    setHasMore(true);
    setData([]);
    fetchData(0);
  };

  /* ================= PAGINATION ================= */
  const fetchMore = () => {
    if (
      !open ||
      !hasMore ||
      isResettingRef.current ||
      isLoadingRef.current
    ) {
      return;
    }

    setPage((prev) => {
      const nextPage = prev + 1;
      fetchData(nextPage, searching ? query : "");
      return nextPage;
    });
  };

  return {
    data,
    hasMore,
    query,
    onSearch,
    onClear,
    fetchMore,
  };
};
