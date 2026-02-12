import { useState, useRef, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import apiClient from "../services/apiClient";

export const useParameterApiCalling = ({
  url,
  defaultParams = {},
  limit = 20,
  debounce = 600,
  autoFetch = true,
}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef(null);
  const fetchData = useCallback(
    async (pageNum = 0, searchText = "") => {
      try {
        const { data: res } = await apiClient.get(url, {
          params: {
            ...defaultParams,
            Page: pageNum,
            Limit: limit,
            SearchText: searchText,
          },
        });
        if (res.success) {
          const newData = res.values || [];
          setHasMore(newData.length === limit);
          setData((prev) =>
            pageNum === 0 ? newData : [...prev, ...newData]
          );
        } else {
          Swal.fire({
            text: res.message,
            icon: "question",
            confirmButtonText: "YES",
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    },
    [url, defaultParams, limit]
  );
  const onSearch = (text) => {
    setQuery(text);
    setSearching(true);
    setPage(0);
    setData([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchData(0, text);
    }, debounce);
  };
  const onClear = () => {
    setQuery("");
    setSearching(false);
    setPage(0);
    setData([]);
    fetchData(0);
  };
  const fetchMore = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    fetchData(nextPage, searching ? query : "");
    setPage(nextPage);
  };

  useEffect(() => {
    if (autoFetch) fetchData(0);
  }, []);

  return {
    data,
    hasMore,
    query,
    onSearch,
    onClear,
    fetchMore,
    setData,
    setPage,
  };
};
