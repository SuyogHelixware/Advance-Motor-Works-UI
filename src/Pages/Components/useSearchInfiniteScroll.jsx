// hooks/useSearchInfiniteScroll.js
import { useState, useRef, useCallback, useEffect } from "react";
import apiClient from "../../services/apiClient";
import Swal from "sweetalert2";
export const useSearchInfiniteScroll = (baseUrl) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
    const [Datacache, setDataCache] = useState({});
  const timeoutRef = useRef(null);
  const fetchData = useCallback(async (pageNum, searchTerm = "") => {
    try {
      //  const cacheKey = `${searchTerm}_${pageNum}`;
      // if (Datacache[cacheKey]) {
      //   setData(setDataCache[cacheKey]);
      //   return;
      // }
    let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/${baseUrl}/Search/${searchTerm}/1/${pageNum}/20`
        );
      } else {
        response = await apiClient.get(
          `/${baseUrl}/Pages/1/${pageNum}/20`
        );
      }
      if (response.data.success) {
        const newData = response.data.values || [];
        setHasMore(newData.length === 20);
          //    setDataCache((prev) => ({
          //   ...prev,
          //   [cacheKey]: newData,
          // }));
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
    setDataCache({})

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchData(0, term);
    }, 1000);
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


// export const useDocumentSeries = (objType,docDate, setValue,submitSeries) => {
//   const [DocSeries, setDocSeries] = useState([]);
//   useEffect(() => {
//     const fetchSeries = async () => {

//       try {
//         const res = await apiClient.get(`/DocSeriesV2/ForTrans?ObjType=${objType}&DocDate=${docDate}`);
//         const response = res.data;
//         if (response.success) {
//           setDocSeries(response.values);
//           setValue("Series", response.values[0].SeriesId);
//           setValue("DocNum", response.values[0].DocNum);
//         } else {
//           Swal.fire({
//             title: "Error!",
//             text: response.message,
//             icon: "warning",
//             confirmButtonText: "Ok",
//           });
//         }
//       } catch (error) {
//         Swal.fire({
//           title: "Error!",
//           text: error.message,
//           icon: "error",
//           confirmButtonText: "Ok",
//         });
//       }
//     };

//     fetchSeries();
//   }, [objType,docDate, setValue,submitSeries]);

//   return { DocSeries };
// };


export const useDocumentSeries = (objType, docDate, setValue, ClearCache,SaveUpdateName) => {

  
  const [DocSeries, setDocSeries] = useState([]);
  const cacheRef = useRef({});
  useEffect(() => {
    // ✔ If ClearCache = true → wipe cache
    if (ClearCache) {
      cacheRef.current = {};     
    }
  }, [ClearCache]);

  useEffect(() => {
    const fetchSeries = async () => {
      if (!objType || !docDate) return;

      const cacheKey = `${objType}-${docDate}`;

      if (!ClearCache && cacheRef.current[cacheKey]) {
        const cached = cacheRef.current[cacheKey];
        setDocSeries(cached);
        setValue("Series", cached[0]?.SeriesId || "");
        setValue("DocNum", cached[0]?.DocNum || "");
        setValue("FinncPriod",cached[0]?.FinncPriod ?? "")
        setValue("PIndicator",cached[0]?.Indicator ?? "")
        return;
      }
      try {
        const res = await apiClient.get(
          `/DocSeriesV2/ForTrans?ObjType=${objType}&DocDate=${docDate}`
        );

        const response = res.data;

        if (response.success) {
          const values = response.values;
          if (!ClearCache) {
            cacheRef.current[cacheKey] = values;
          }
          setDocSeries(values);
          setValue("Series", values[0]?.SeriesId || "");
          setValue("DocNum", values[0]?.DocNum || "");
          setValue("FinncPriod",values[0]?.FinncPriod ?? "")
          setValue("PIndicator",values[0]?.Indicator ?? "")
        } else {
          Swal.fire({
            title: "Error!",
            text: response.message,
            icon: "warning",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.message,
          icon: "error",
        });
      }
    };

  if(SaveUpdateName==="SAVE"){
    fetchSeries();
  }   
  }, [objType, docDate, ClearCache]);

  return { DocSeries };
};
