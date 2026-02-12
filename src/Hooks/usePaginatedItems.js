import { useCallback, useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiClient from "../services/apiClient";
export default function usePaginatedItems(baseUrl, parameter) {
  const [itemList, setItemList] = useState([]);
  const [itemCache, setItemCache] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;
      // Return from Cache
      if (itemCache[cacheKey]) {
        setItemList(itemCache[cacheKey]);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await apiClient.get(`/${baseUrl}`, {
          params: {
            Status: 1,
            SearchText: search,
            Page: page,
            Limit: 20,
            [parameter.key]: parameter.value
          },
        });
        if (data.success) {
          const items = data.values || [];
          setItemCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));
          setItemList(items);
          const estimatedRowCount =
            page === 0 ? 20 + 1 : page * 20 + items.length + 1;
          setRowCount(estimatedRowCount);
        } else {
          Swal.fire("Error!", data.message, "warning");
        }
      } catch (err) {
        Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [itemCache]
  );

  // ---- Fetch when page / search changes ----
  useEffect(() => {
    fetchItems(currentPage, searchText);
  }, [currentPage, searchText, fetchItems]);

  // ---- Pagination ----
  const handlePaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage]
  );

  // ---- Search Handler ----
  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setCurrentPage(0); // reset page
    setItemCache({}); // clear cache
  }, []);

  return {
    itemList,
    isLoading,
    rowCount,
    currentPage,
    searchText,
    handlePaginationModelChange,
    handleSearchChange,
  };
}
