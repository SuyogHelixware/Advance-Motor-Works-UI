// hooks/useSearchInfiniteScroll.js
import { useState, useRef, useCallback, useEffect } from "react";
import apiClient from "../../services/apiClient";
export const BusinessPartnerScroll = (baseUrl,CardType) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef(null);
  const fetchData = useCallback(async (pageNum, searchTerm = "") => {
    try {
    let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/${baseUrl}/Search/${searchTerm}/${CardType}/1/${pageNum}/20`
        );
      } else {
        response = await apiClient.get(
          `/${baseUrl}/Pages/${CardType}/1/${pageNum}/20`
        );
      }
      if (response.data.success) {
        const newData = response.data.values || [];
        setHasMore(newData.length === 20);
        setData((prev) => (pageNum === 0 ? newData : [...prev, ...newData]));
      } else {
        console.warn(response.data.message);
      }
    } catch (err) {
      console.error("Infinite scroll fetch error:", err);
    }
  }, [baseUrl]);

  const onSearch = (term) => {
    setQuery(term);
    setSearching(true);
    setPage(0);
    setData([]);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchData(0, term);
    }, 600);
  };

  const onClear = () => {
    setQuery("");
    setSearching(false);
    setPage(0);
    setData([]);
    fetchData(0);
  };

  const fetchMore = () => {
    fetchData(page + 1, searching ? query : "");
    setPage((prev) => prev + 1);
  };
 useEffect(() => {
      fetchData(0); // Load first page on mount
    }, []);
  return {
    data,
    hasMore,
    query,
    onSearch,
    onClear,
    fetchMore,
    setPage,
    setData,
  };
};
