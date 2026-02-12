import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import apiClient from "../services/apiClient";

const ITEM_LIMIT = 20;
const SERVICE_LIMIT = 20;

export function useItemServiceList(typeItem = {},type,openmodel,serviceopen) {


  /* ================= ABORT CONTROLLERS ================= */
  const itemAbortRef = useRef(null);
  const serviceAbortRef = useRef(null);

  /* ================= ITEMS ================= */
  const [itemList, setItemList] = useState([]);
  const [itemRowCount, setItemRowCount] = useState(0);
  const [itemPage, setItemPage] = useState(0);
  const [itemSearch, setItemSearch] = useState("");
  const [itemLoading, setItemLoading] = useState(false);
  const [itemCache, setItemCache] = useState({});

  const fetchItems = useCallback(
    async (page, search) => {
      const cacheKey = `${search}_${page}`;

      if (itemCache[cacheKey]) {
        setItemList(itemCache[cacheKey]);
        return;
      }

      // 🔥 Abort previous request
      if (itemAbortRef.current) {
        itemAbortRef.current.abort();
      }

      const controller = new AbortController();
      itemAbortRef.current = controller;

      setItemLoading(true);
         const params = {
        ...typeItem,
        Status: 1,
        Page: page,
        Limit: ITEM_LIMIT,
      };

      if (search && search.trim()) {
        params.SearchText = search.trim();
      }
      try {
        const { data } = await apiClient.get("/ItemsV2", {
          params,
          signal: controller.signal,
        });

        if (!data.success) {
          Swal.fire("Error!", data.message, "warning");
          return;
        }
        const items = data.values || [];
        setItemCache((prev) => ({ ...prev, [cacheKey]: items }));
        setItemList(items);

        const estimated =
          page === 0
            ? ITEM_LIMIT + 1
            : page * ITEM_LIMIT + items.length + 1;
         
        setItemRowCount(estimated);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          Swal.fire("Error!", err.message, "error");
        }
      } finally {
        setItemLoading(false);
      }
    },
    [itemCache]
  );

  /* ================= SERVICES ================= */
  const [serviceList, setServiceList] = useState([]);
  const [serviceRowCount, setServiceRowCount] = useState(0);
  const [servicePage, setServicePage] = useState(0);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceCache, setServiceCache] = useState({});

  const fetchServices = useCallback(
    async (page, search) => {
      const cacheKey = `${search}_${page}`;

      if (serviceCache[cacheKey]) {
        setServiceList(serviceCache[cacheKey]);
        return;
      }

      // 🔥 Abort previous request
      if (serviceAbortRef.current) {
        serviceAbortRef.current.abort();
      }

      const controller = new AbortController();
      serviceAbortRef.current = controller;

      setServiceLoading(true);
      try {
        const response = search
          ? await apiClient.get(
              `/SACSetup/search/${search}/1/${page}/${SERVICE_LIMIT}`,
              { signal: controller.signal }
            )
          : await apiClient.get(
              `/SACSetup/pages/1/${page}/${SERVICE_LIMIT}`,
              { signal: controller.signal }
            );

        if (!response.data.success) {
          Swal.fire("Error!", response.data.message, "warning");
          return;
        }

        const services = response.data.values || [];
        setServiceCache((prev) => ({ ...prev, [cacheKey]: services }));
        setServiceList(services);

        const estimated =
          page === 0
            ? SERVICE_LIMIT + 1
            : page * SERVICE_LIMIT + services.length + 1;

        setServiceRowCount(estimated);
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          Swal.fire("Error!", error.message, "error");
        }
      } finally {
        setServiceLoading(false);
      }
    },
    [serviceCache]
  );


  useEffect(() => {
    if (type=== "I" && openmodel) {
      fetchItems(itemPage, itemSearch);
    }
    if (type === "S" && serviceopen) {
      fetchServices(servicePage, serviceSearch);
    }
  }, [
    openmodel,
    serviceopen,
    type,
    itemPage,
    itemSearch,
    servicePage,
    serviceSearch,
    fetchItems,
    fetchServices,
  ]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      itemAbortRef.current?.abort();
      serviceAbortRef.current?.abort();
    };
  }, []);

  /* ================= BUTTON CLICKS ================= */
  const openItems = () => {
    itemAbortRef.current?.abort(); 
    setItemCache({});
    setItemPage(0);
    setItemSearch("");
  };

  const openServices = () => {
    serviceAbortRef.current?.abort(); // 🔥 stop in-flight call
    setServiceCache({});
    setServicePage(0);
    setServiceSearch("");
  };

  /* ================= HANDLERS ================= */
  const onItemPageChange = ({ page }) => {
    if (type === "I") setItemPage(page);
  };

  const onServicePageChange = ({ page }) => {
    if (type === "S") setServicePage(page);
  };

  const onItemSearch = (value) => {
    if (type !== "I") return;
    itemAbortRef.current?.abort();
    setItemCache({});
    setItemSearch(value);
    setItemPage(0);
  };

  const onServiceSearch = (value) => {
    if (type !== "S") return;
    serviceAbortRef.current?.abort();
    setServiceCache({});
    setServiceSearch(value);
    setServicePage(0);
  };

  return {

 itemPage,
 itemSearch,
  itemList,
  itemRowCount,
  itemLoading,
  
  onItemSearch,
  onItemPageChange,
  openItems,

    // Services
    serviceSearch,
    servicePage,
    serviceList,
    serviceRowCount,
    serviceLoading,
    onServiceSearch,
    onServicePageChange,
    openServices,
  };
}
