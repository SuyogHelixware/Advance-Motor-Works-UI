import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import apiClient from "../services/apiClient";

const PAGE_SIZE = 20;

export const usePaginatedSearchList = ({
  baseUrl,
  status,
  autoLoad = false, // 🔥 lazy by default
}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loaded, setLoaded] = useState(false); // 🔥 key for lazy load

  const timeoutRef = useRef(null);

  const fetchData = async (pageNum, searchTerm = "") => {
    try {
      let response;

      if (searchTerm) {
        response = await apiClient.get(
          `${baseUrl}/Search/${searchTerm}/${status}/${pageNum}/${PAGE_SIZE}`,
        );
      } else {
        response = await apiClient.get(
          `${baseUrl}/Pages/${status}/${pageNum}/${PAGE_SIZE}`,
        );
      }

      if (response.data.success) {
        const newData = response.data.values || [];
        setHasMore(newData.length === PAGE_SIZE);
        setData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setLoaded(true);
      } else {
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      Swal.fire({
        text: error?.message || "Something went wrong",
        icon: "question",
        confirmButtonText: "YES",
      });
    }
  };

  // 🔍 Search
  const handleSearch = (value) => {
    setQuery(value);
    setSearching(true);
    setPage(0);
    setData([]);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      fetchData(0, value);
    }, 600);
  };

  // ❌ Clear search
  const handleClear = () => {
    setQuery("");
    setSearching(false);
    setPage(0);
    setData([]);
    fetchData(0);
  };

  // ⬇️ Infinite scroll
  const fetchMore = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    fetchData(nextPage, searching ? query : "");
    setPage(nextPage);
  };

  // 🔁 Manual refresh (ONLY on button click)
  const refresh = () => {
    setPage(0);
    fetchData(0, searching ? query : "");
  };

  // 🟢 Lazy load trigger
  const loadIfNeeded = () => {
    if (!loaded) fetchData(0);
  };

  // ⚡ Optimistic helpers
  const prependItem = (item) => {
    setData((prev) => [item, ...prev]);
  };

  const updateItem = (id, updatedRow) => {
    setData((prev) =>
      prev.map((row) => (row.id === id ? updatedRow : row)),
    );
  };

  const removeItem = (id) => {
    setData((prev) => prev.filter((row) => row.id !== id));
  };

  useEffect(() => {
    if (autoLoad) fetchData(0);
  }, [status]);

  return {
    data,
    query,
    hasMore,
    fetchMore,
    handleSearch,
    handleClear,
    refresh,
    loadIfNeeded, // 🔥 for tabs
    prependItem,
    updateItem,
    removeItem,
  };
};
