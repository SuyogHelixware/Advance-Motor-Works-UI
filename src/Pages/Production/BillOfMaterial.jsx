import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ListAltIcon from "@mui/icons-material/ListAlt"; // For Con
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { config } from "../../config/environment";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient"; // Add this import
import CardComponent from "../Components/CardComponent";
import DataGriCellModelClick from "../Components/DataGridCellModelClick";
import {
  InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { useSearchInfiniteScroll } from "../Components/useSearchInfiniteScroll";
import { TwoFormatter, ValueFormatter } from "../Components/ValueFormatter";
import DynamicLoader from "../../Loaders/DynamicLoader";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import ProductionDataGrid from "../Components/ProductionDataGrid";
import { dataGridSx } from "../../Styles/dataGridStyles";
const modelColumns = [
  {
    field: "ItemCode",
    headerName: "Item Code",
    width: 150,
    editable: false,
  },
  {
    field: "ItemName",
    headerName: "Item Description",
    width: 150,
    editable: false,
  },
  {
    field: "Price",
    headerName: "Price",
    width: 120,
    editable: false,
  },
  {
    field: "DefaultWhs",
    headerName: "WHSCODE",
    width: 120,
    editable: false,
  },
  {
    field: "OnHand",
    headerName: "IN STOCK",
    width: 100,
    sortable: false,
    renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
  },
  {
    field: "IsCommited",
    headerName: "RESERVE",
    width: 100,
    sortable: false,
    renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
  },
  {
    field: "OnOrder",
    headerName: "ORDERED",
    width: 100,
    sortable: false,
    renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
  },
];
const RoutestageColumn = [
  {
    id: 1,
    field: "Code",
    headerName: "Route Stage Code",
    width: 200,
    editable: false,
  },
  {
    id: 2,
    field: "Description",
    headerName: "Route Stage Description",
    width: 200,
    editable: false,
  },
];
export default function BillOfMaterial() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiloading, setapiloading] = useState(false);

  const [tabvalue, settabvalue] = useState(0);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const theme = useTheme();
  const timeoutRef = useRef(null);
  const { user } = useAuth();
  const perms = usePermissions(101);
  const apiRef = useGridApiRef();
  const [DocSeries, setDocumentSeries] = useState([]);
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [oldOpenData, setSelectData] = useState(null);
  let [ok, setok] = useState("OK");
  // ===================Search Model Production State===========
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  //=========================================Copy From State End================================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [openwhscoLines, setwhscOpenoLines] = useState(false);
  const [chartAccountOpen, setChartAccountOpen] = useState(false);
  const LIMIT = 20;
  const [openItem, setOpenItem] = useState(false);
  const [itemCache, setItemCache] = useState({}); // { [pageNumber]: items[] }
  const [itemList, setItemList] = useState([]); // Current page's items
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [openPriceOnoLines, setOpenPriceoLines] = useState(false);
  const controllerRef = useRef(null); // store active controller
  const [openRouteStage, setOpenRouteStage] = useState(false);
  const [routeStageCache, setrouteStageCache] = useState({}); // { [pageNumber]: items[] }
  const [routeStageList, setrouteStageList] = useState([]); // Current page's items
  const [routeStagecurrentPage, setrouteStageCurrentPage] = useState(0);
  const [routeStagesearchText, setrouteStageSearchText] = useState("");
  const [routeStagerowCount, setrouteStageRowCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);

  const initialFormData = {
    DocEntry: "",
    Code: "",
    Name: "",
    Qauntity: "1",
    TreeType: "",
    PrdStdCst: "",
    PlAvgSize: "1",
    ProductPrice: "",
    ToWHSCode: "",
    Series: "",
    DocNum: "",
    price_List: "",
    price_List_DocEntry: "",
    oLines: [],
  };
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: {}, // ✅ Correctly using `isDirty`
  } = useForm({
    defaultValues: initialFormData,
  });
  const currentData = getValues();
  const treeType = watch("TreeType");
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };

  const getItemFlagsForTreeType = (treeType) => {
    switch (treeType) {
      case "P":
        return { InventoryItem: "Y" };
      case "S":
        return { InventoryItem: "N", PrchseItem: "N", SellItem: "Y" };
      case "A":
        return { InventoryItem: "N", PrchseItem: "N", SellItem: "Y" };
      case "T":
        return { InventoryItem: "Y", PrchseItem: "Y", SellItem: "Y" };
      default:
        return { InventoryItem: "N", PrchseItem: "N", SellItem: "N" };
    }
  };
  //#region  SEarching List Vendor
  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      //  if (controllerRef.current) {
      //   controllerRef.current.abort();
      // }

      // const controller = new AbortController();
      // controllerRef.current = controller;
      const { InventoryItem, PrchseItem, SellItem } =
        getItemFlagsForTreeType(treeType);
      const response = await apiClient.get(`/ItemsV2`, {
        params: {
          InventoryItem: InventoryItem,
          PrchseItem: PrchseItem,
          SellItem: SellItem,
          Status: 1,
          SearchText: searchTerm,
          Page: pageNum,
          Limit: LIMIT,
        },
        // signal:controller.signal
      });

      if (response.data.success === true) {
        const newData = response.data.values || [];
        setHasMoreGetList(newData.length === LIMIT); // Better than hardcoded 20
        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Previous request canceled.");
      } else if (err.name === "CanceledError") {
        console.log("Request aborted.");
      } else {
        console.error("Fetch error:", err);
        Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
      }
    }
  };

  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      fetchGetListData(0, res);
    }, 600);
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);
    fetchGetListData(0);
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };

  useEffect(() => {
    setGetListPage(0);
    setGetListData([]);
    fetchGetListData(0);
    return () => {
      // Cleanup on unmount or dependency change
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [treeType]);

  const onSelectProduction = async (
    DocEntry,
    ItemCode,
    ItemName,
    PrdStdCst,
    DefaultWhs,
  ) => {
    const childItemCode = (currentData.oLines || []).some(
      (item) => item.Code === ItemCode,
    );
    if (childItemCode) {
      Swal.fire({
        text: "header item and line item cannot be the same.",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }
    setValue("Code", ItemCode);
    setValue("Name", ItemName);
    setValue("PrdStdCst", PrdStdCst);
    setValue("price_List", priceListData[0]?.ListName ?? "");
    setValue("price_List_DocEntry", priceListData[0]?.DocEntry ?? "");
    if (treeType === "P") {
      setValue("ToWHSCode", DefaultWhs);
    }
    setSearchmodelOpen(false);
  };

  const getItemFlagsForTreeTypeChild = (treeType) => {
    switch (treeType) {
      case "P":
        return { InventoryItem: "Y", PrchseItem: "", SellItem: "" };
      case "S":
        return { InventoryItem: "", PrchseItem: "", SellItem: "Y" };
      case "A":
        return { InventoryItem: "", PrchseItem: "", SellItem: "Y" };
      case "T":
        return { InventoryItem: "", PrchseItem: "", SellItem: "" };
      default:
        return { InventoryItem: "N", PrchseItem: "N", SellItem: "N" };
    }
  };
  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      // Cancel previous request if still running
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      const cacheKey = `${treeType}_${search}_${page}`;
      if (itemCache[cacheKey]) {
        setItemList(itemCache[cacheKey]);
        return;
      }

      try {
        setIsLoading(true);

        const { InventoryItem, PrchseItem, SellItem } =
          getItemFlagsForTreeTypeChild(treeType);

        const response = await apiClient.get(`/ItemsV2`, {
          params: {
            InventoryItem,
            PrchseItem,
            SellItem,
            Status: 1,
            SearchText: search,
            Page: page,
            Limit: LIMIT,
          },
          signal: controller.signal, // ✅ attach cancel signal
        });

        if (response.data.success) {
          const items = response.data.values || [];

          setItemCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));
          setItemList(items);

          const estimatedRowCount =
            page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;
          setRowCount(estimatedRowCount);
        } else {
          Swal.fire("Error!", response.data.message, "warning");
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Previous request canceled.");
        } else if (err.name === "CanceledError") {
          console.log("Request aborted.");
        } else {
          console.error("Fetch error:", err);
          Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [itemCache, treeType],
  );

  useEffect(() => {
    fetchItems(currentPage, searchText);
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [currentPage, searchText, treeType, fetchItems]);
  const handlePaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage],
  );
  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setCurrentPage(0); // Reset to page 0 on search
    setItemCache({}); // Clear cache on new search
  }, []);

  const closeModel = () => {
    setOpenItem(false);
    setSearchText("");
    setCurrentPage(0);
  };

  //#region  Route Stage Api Calling Searching And Pagination
  const RounteStageFunc = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;

      // Serve from cache
      if (routeStageCache[cacheKey]) {
        setrouteStageList(routeStageCache[cacheKey]);
        return;
      }

      setIsLoading(true);
      try {
        const url = search
          ? `/RouteStage/search/${search}/1/${page}/20`
          : `/RouteStage/pages/1/${page}/20`;

        const response = await apiClient.get(url);

        if (response.data.success) {
          const services = response.data?.values || [];
          // Save to cache
          setrouteStageCache((prev) => ({
            ...prev,
            [cacheKey]: services,
          }));

          setrouteStageList(services);

          const estimatedCount =
            page === 0 ? 21 : page * 20 + services.length + 1;
          setrouteStageRowCount(estimatedCount);
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Something went wrong",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.message || "An error occurred",
          icon: "error",
          confirmButtonText: "Ok",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [routeStageCache],
  );

  const handleRounteStagePaginationModelChange = useCallback(
    (model) => {
      if (model.page !== routeStagecurrentPage) {
        setrouteStageCurrentPage(model.page);
      }
    },
    [routeStagecurrentPage],
  );

  const handleRounteStageSearchChange = useCallback((searchText) => {
    setrouteStageSearchText(searchText);
    setrouteStageCurrentPage(0);
    setrouteStageCache({}); // Clear cache on new search
  }, []);

  useEffect(() => {
    RounteStageFunc(routeStagecurrentPage, routeStagesearchText);
  }, [routeStagecurrentPage, routeStagesearchText, RounteStageFunc]);

  //#endregion Route Stage=========

  const closeModelRoute = () => {
    setOpenRouteStage(false);
  };
  const ClearForm = () => {
    reset({
      ...initialFormData,
      oLines: [],
    });
    if (openListquery?.trim()) {
      handleOpenListClear();
    }
    clearFiles();
    setValue("TreeType", "P");
    setSaveUpdateName("SAVE");
  };

  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();

  // -------------------------------------------------------------------\
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/BillOfMaterial/Search/${searchTerm}/1/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(`/BillOfMaterial/Pages/1/${pageNum}/20`);
      }
      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (config.isDevelopment) {
    console.log("Component rendered with config:", config);
  }
  // Infinite scroll fetch more data
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };
  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear searFullAddressch input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };
  const handleOpenListSearch = (res) => {
    setOpenListQuery(res);
    setOpenListSearching(true);
    setOpenListPage(0);
    setOpenListData([]); // Clear current data

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res);
    }, 600);
    // Fetch with search query
  };

  // const DocumentSeries = async () => {
  //   try {
  //     const res = await apiClient.get(`/DocSeries/ByTransId/540000006`);
  //     const response = res.data;
  //     if (response.success === true) {
  //       setValue("Series", response.values[0].DocEntry);
  //       setValue("DocNum", response.values[0].DocNum);
  //       setDocumentSeries(response.values);
  //     } else if (response.success === false) {
  //       Swal.fire({
  //         title: "Error!",
  //         text: response.message,
  //         icon: "warning",
  //         confirmButtonText: "Ok",
  //       });
  //     }
  //   } catch (error) {
  //     Swal.fire({
  //       title: "Error!",
  //       text: error,
  //       icon: "error",
  //       confirmButtonText: "Ok",
  //     });
  //   }
  // };
  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
    // DocumentSeries();
  }, []);

  const { isDirty } = useFormState({ control });
  const setOldOpenData = async (DocEntry) => {
    setok("");
    setDrawerOpen(false);
    setapiloading(true);

    try {
      if ((isDirty && getValues("CardCode")) || "UPDATE" === ok) {
        Swal.fire({
          text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        }).then((Data) => {
          if (!Data.isConfirmed) {
            return;
          }
          setSelectData(DocEntry);
          fetchAndSetData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        fetchAndSetData(DocEntry);
        setSaveUpdateName("UPDATE");
        setSelectData(DocEntry);
      }
    } catch (error) {
      console.error("Error in setOldOpenData:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while setting business partner data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const fetchAndSetData = async (DocEntry) => {
    try {
      const response = await apiClient.get(`/BillOfMaterial/${DocEntry}`);
      if (!response.data || !response.data.values) {
        console.error("API Response missing `values` key:", response.data);
        return;
      }
      const item = response.data.values;
      console.log(item);
      setFilesFromApi(item.AtcEntry);
      // Step 1: Filter lines with matching StageId
      // const filteredLines = [];
      // for (const stage of item.oPTStagesLines || []) {
      //   filteredLines.push(stage); // Push stage first
      //   for (const line of item.oPTLines || []) {
      //     if (line.StageId === stage.SeqNum) {
      //       const Total = line.Quantity * line.Price;
      //       filteredLines.push({ ...line, Total });
      //     }
      //   }
      // }
      // console.log("Filtered and sorted lines:", filteredLines);
      const filteredLines = [];

      const stages =
        item.oPTStagesLines && item.oPTStagesLines.length
          ? item.oPTStagesLines
          : [null]; // fallback stage

      for (const stage of stages) {
        if (stage) filteredLines.push(stage); // push stage only if it exists
        for (const line of item.oPTLines || []) {
          if (!stage || line.StageId === stage.SeqNum) {
            // if no stage, include all lines
            const Total = line.Quantity * line.Price;
            const TtlPrdStdCst = line.TotalPrdStdCst;
            filteredLines.push({ ...line, Total, TtlPrdStdCst });
          }
        }
      }

      console.log("Filtered and sorted lines:", filteredLines);

      // Step 2: Reset form with values
      reset({
        ...item,
        Type: item.Type ?? "296",
        DocEntry: item.DocEntry,
        DocNum: item.DocNum || "0",
        Code: item.Code,
        Qauntity: item.Qauntity,
        Name: item.Name,
        TreeType: item.TreeType,
        Object: "66",
        PlAvgSize: item.PlAvgSize,
        ToWHSCode: item.ToWH,
        PriceList: item.price_List_DocEntry,
        ProductPrice: item.ProductPrice,
        oLines: filteredLines.map((item) => ({
          ...item,
          rote: item.SeqNum ?? item.StageId,
          Qauntity: item.Quantity,
          Type: Number(item.Type ?? "296"),
          Uom: item.Uom === "0" ? "" : item.Uom,
          price_List_DocEntry: item.PriceList,
          ItemName: item.Name === "0" ? "" : (item?.Name ?? item.ItemName),
          WipActCode: item.WipActCode,
        })),
      });
    } catch (error) {
      console.error("❌ Error fetching or processing data:", error);
    } finally {
      // Optional: do cleanup or stop loaders
      setapiloading(false);
    }
  };

  console.log("currentData", currentData);
  const handleDelete = () => {
    Swal.fire({
      text: `Do You Want Deleted" ${currentData.Code}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/BillOfMaterial/${currentData.DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              setOpenListData([]);
              fetchOpenListData(0);
              ClearForm();
              Swal.fire({
                title: "Success!",
                text: "BillOfMaterial Deleted",
                icon: "success",
                confirmButtonText: "Ok",
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: "Error!",
                text: response.data.message,
                icon: "warning",
                confirmButtonText: "Ok",
              });
            }
          })
          .catch(() => {
            Swal.fire({
              title: "Error!",
              text: "something went wrong",
              icon: "warning",
              confirmButtonText: "Ok",
            });
          });
      } else {
        Swal.fire({
          text: "BillOfMaterial Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };
  const handleDeleteRow = (id) => {
    const updatedRows = currentData.oLines.filter(
      (_, index) => index + 1 !== id,
    );
    // const last296Row = [...updatedRows]
    //   .reverse()
    //   .find((row) => row?.Type === 296);
    // const updatedDataRote = updatedRows.map((rotedata) => ({
    //   ...rotedata,
    //   rote: last296Row?.rote ?? "0",
    // }));
    // setValue("oLines",updatedRows)
    const updatedData = {
      ...currentData,
      oLines: updatedRows,
    };
    reset(updatedData);
  };

  const handleChangeType = (e, row) => {
    const { name, value } = e.target;

    const updatedLines = getValues("oLines").map((data, index) => {
      if (row.id !== index + 1) return data;
      const shouldClearFields = [4, -18, 296].includes(value);
      console.log(shouldClearFields);
      const updatedData = {
        ...data,
        [name]: value,
        type: value,
        rote: data.rote,
        ...(shouldClearFields && {
          Code: "",
          ItemName: "",
          Quantity: "",
          AddQuantit: "",
          Uom: "",
          Warehouse: "",
          PriceList: "",
          // rote:data.rote,
          LineTotal: "",
          Total: "",
          PrdStdCst: "",
          TtlPrdStdCst: "",
          FittingCharge: "",
          LineFittingCharge: "",
        }),
      };

      return updatedData;
    });

    reset({
      ...getValues(),
      oLines: updatedLines,
    });
  };

  // const handleRoteChange = (e, currentRouteRow) => {
  //   const newRote = Number(e.target.value);
  //   const oLines = getValues("oLines");

  //   // Attach index for reference
  //   const rows = oLines.map((row, idx) => ({ ...row, _idx: idx }));

  //   const blocks = [];
  //   let currentBlock = [];
  //   rows.forEach((row) => {
  //     if (row.Type === 296) {
  //       if (currentBlock.length) blocks.push(currentBlock);
  //       currentBlock = [row];
  //     } else if (currentBlock.length) {
  //       currentBlock.push(row);
  //     }
  //   });
  //   if (currentBlock.length) blocks.push(currentBlock);

  //   // Find current block
  //   const currentBlockIndex = blocks.findIndex(
  //     (block) => block[0]._idx === currentRouteRow.id - 1
  //   );
  //   if (currentBlockIndex === -1) return;

  //   const movingBlock = blocks.splice(currentBlockIndex, 1)[0];

  //   // Auto-create empty blocks if newRote > current blocks
  //   const missingBlocks = newRote - 1 - blocks.length;
  //   for (let i = 0; i < missingBlocks; i++) {
  //     blocks.push([]); // empty block
  //   }

  //   // Insert at new position
  //   const insertAt = Math.max(0, Math.min(newRote - 1, blocks.length));
  //   blocks.splice(insertAt, 0, movingBlock);

  //   // Flatten blocks and renumber rote
  //   const finalLines = [];
  //   blocks.forEach((block, idx) => {
  //     block.forEach((row) => {
  //       finalLines.push({ ...row, rote: idx + 1 });
  //     });
  //   });

  //   // Reset form
  //   reset({
  //     ...getValues(),
  //     oLines: finalLines,
  //   });
  // };

  const handleRoteChange = (e, currentRouteRow) => {
    const newRote = Number(e.target.value);
    if (!newRote) return;

    const oLines = getValues("oLines");

    // Attach index for reference
    const rows = oLines.map((row, idx) => ({ ...row, _idx: idx }));

    // 1️⃣ Split into route blocks (296 + children)
    const blocks = [];
    let currentBlock = [];

    rows.forEach((row) => {
      if (Number(row.Type) === 296) {
        if (currentBlock.length) blocks.push(currentBlock);
        currentBlock = [row];
      } else if (currentBlock.length) {
        currentBlock.push(row);
      }
    });

    if (currentBlock.length) blocks.push(currentBlock);

    // 2️⃣ Find block index of clicked route
    const currentBlockIndex = blocks.findIndex(
      (block) => block[0]._idx === currentRouteRow.id - 1,
    );
    if (currentBlockIndex === -1) return;

    // 3️⃣ Remove moving block
    const movingBlock = blocks.splice(currentBlockIndex, 1)[0];

    // 4️⃣ Ensure enough blocks exist
    const targetIndex = newRote - 1;
    while (blocks.length < targetIndex) {
      blocks.push([]);
    }

    // 5️⃣ Insert block at new route position
    blocks.splice(targetIndex, 0, movingBlock);

    // 6️⃣ Flatten blocks & reassign rote + StageId
    const finalLines = [];
    blocks.forEach((block, idx) => {
      const stageId = idx + 1;
      block.forEach((row) => {
        finalLines.push({
          ...row,
          rote: stageId,
          StageId: stageId,
        });
      });
    });

    reset({
      ...getValues(),
      oLines: finalLines,
    });
  };

  const handleRouteClick = (ids) => {
    const gridRowIndex = getValues("selectedRowIndex");
    const startIndex = gridRowIndex - 1;

    const lines = getValues("oLines");

    const usedRoutes = lines
      .filter((row) => row?.Type === 296 && row?.rote)
      .map((row) => Number(row.rote));

    const nextRote = usedRoutes.length ? Math.max(...usedRoutes) + 1 : 1;

    const updatedLines = [...lines];

    // 1️⃣ update selected parent row
    updatedLines[startIndex] = {
      ...updatedLines[startIndex],
      DocEntry: ids.row.DocEntry,
      Code: ids.row.Code,
      ItemName: ids.row.Description,
      Qauntity: "",
      AddQuantit: "",
      Uom: ids.row.InvntoryUOM,
      Warehouse: ids.row.DefaultWhs,
      StageId: nextRote,
      rote: nextRote,
      Price: "",
      PriceList: "",
      Total: "",
      PrdStdCst: "",
      TtlPrdStdCst: "",
      IssueMthd: "",
      WipActCode: "",
    };

    // // 2️⃣ assign SAME route to children UNTIL next Type 296
    // for (let i = startIndex + 1; i < updatedLines.length; i++) {
    //   // 🚫 stop when next 296 found
    //   if (Number(updatedLines[i].Type) === 296) {
    //     break;
    //   }

    //   // ✅ assign to child rows
    //   updatedLines[i] = {
    //     ...updatedLines[i],
    //     StageId: nextRote,
    //     rote: nextRote,
    //   };
    // }

    reset({
      ...getValues(),
      oLines: normalizeRoutes(updatedLines),
    });

    closeModelRoute();
  };

  const handleCellClick = (id) => {
    const selectedIDs = new Set(id);

    setSelectedRows((prev) => {
      const stillSelected = prev.filter((row) => selectedIDs.has(row.DocEntry));
      const newSelections = itemList
        .filter((row) => selectedIDs.has(row.DocEntry))
        .filter(
          (row) => !stillSelected.some((r) => r.DocEntry === row.DocEntry),
        )
        .map((data) => {
          const PriceTerm = data.oLines.find(
            (itempprice) =>
              itempprice.PriceList === currentData.price_List_DocEntry,
          );

          const PriceBefDi = PriceTerm?.Price ?? "0";
          const TtlPrdStdCst =
            data.PrdStdCst *
            (1 / currentData.Qauntity + 0 / currentData.PlAvgSize);
          return {
            DocEntry: data.DocEntry,
            Code: data.ItemCode,
            ItemName: data.ItemName,
            Price: PriceBefDi,
            BasePrice: PriceBefDi || 0,
            Total: PriceBefDi?.Price ?? 0 * 1,
            AddQuantit: "",
            Qauntity: 1,
            Uom: data.UgpEntry === "-1" ? "Manual" : data.UOMCode,
            PriceList: currentData.price_List,
            price_List_DocEntry: currentData.price_List_DocEntry,
            Warehouse: data.DefaultWhs,

            WipActCode: "",
            PrdStdCst: data.PrdStdCst,
            TtlPrdStdCst: TtlPrdStdCst,
            IssueMthd: data.IssueMthd,
          };
        });

      const combined = [...stillSelected, ...newSelections];
      return combined;
    });
  };
  // const onSubmit = () => {
  //   const startIndex = Number(getValues("selectedRowIndex"));
  //   if (isNaN(startIndex) || startIndex < 1) {
  //     console.warn("Invalid selectedRowIndex");
  //     return;
  //   }
  //   const updated = [...getValues("oLines")];
  //   const last296Row = [...updated].reverse().find((row) => row?.Type === 296);
  //   selectedRows.forEach((row, i) => {
  //     const idx = startIndex - 1 + i;
  //     if (idx < updated.length) {
  //       updated[idx] = {
  //         ...updated[idx],
  //         ...row,
  //         Type: 4,
  //         StageId: last296Row?.rote ?? "0",
  //         rote: last296Row?.rote ?? "0",
  //       };
  //     } else {
  //       updated.push({
  //         ...row,
  //         Type: 4, // fallback if needed
  //         StageId: last296Row?.rote ?? "0",
  //         rote: last296Row?.rote ?? "0",
  //       });
  //     }
  //   });

  //   setValue("oLines", updated);
  //   closeModel();
  // };

  const normalizeRoutes = (lines) => {
    const result = [];
    let currentStage = 0;

    lines.forEach((row) => {
      if (Number(row.Type) === 296) {
        currentStage += 1;
        result.push({
          ...row,
          StageId: currentStage,
          rote: currentStage,
        });
      } else {
        result.push({
          ...row,
          StageId: currentStage,
          rote: currentStage,
        });
      }
    });

    return result;
  };

  const onSubmit = () => {
    const startIndex = Number(getValues("selectedRowIndex"));
    if (isNaN(startIndex) || startIndex < 1) return;

    let lines = [...getValues("oLines")];

    selectedRows.forEach((row, i) => {
      const idx = startIndex - 1 + i;

      const newRow = {
        ...lines[idx], // keep existing row if present
        ...row,
        Type: 4, // child
      };

      if (idx < lines.length) {
        // ✅ UPDATE existing row (NO new line)
        lines[idx] = newRow;
      } else {
        // ✅ ADD only if index exceeds length
        lines.push(newRow);
      }
    });

    // 🔥 Normalize once
    lines = normalizeRoutes(lines);

    setValue("oLines", lines);
    closeModel();
  };

  // const handleCellClick = async (ids) => {
  //   const currentRowIndex = getValues("selectedRowIndex");
  //   const currentData = getValues();
  //   const lines = currentData.oLines;
  //   const selectedRow = ids.row;
  //   const headerCode = getValues("Code"); // your header-level code
  //   const childItemCode = selectedRow.ItemCode; // code from selected DataGrid row

  //   if (headerCode === childItemCode) {
  //     Swal.fire({
  //       text: "header item and line item cannot be the same.",
  //       icon: "warning",
  //       showConfirmButton: true,
  //       confirmButtonText: "OK",
  //     });
  //     return;
  //   }
  //   const last296Row = [...lines].reverse().find((row) => row?.Type === 296);
  //   const TtlPrdStdCst =
  //     selectedRow.PrdStdCst *
  //     (1 / currentData.Qauntity + 0 / currentData.PlAvgSize);
  //   const updatedLine = {
  //     ...lines[currentRowIndex],
  //     DocEntry: selectedRow.DocEntry,
  //     Code: selectedRow.ItemCode,
  //     ItemName: selectedRow.ItemName,
  //     Qauntity: 1,
  //     AddQuantit: "",
  //     Uom: selectedRow.UgpEntry === "-1" ? "Manual" : selectedRow.UOMCode,
  //     Warehouse: selectedRow.DefaultWhs,
  //     rote: last296Row?.rote ?? "0",
  //     WipActCode: "",
  //     Total: 0,
  //     PrdStdCst: selectedRow.PrdStdCst,
  //     TtlPrdStdCst: TtlPrdStdCst,
  //     IssueMthd: selectedRow.IssueMthd,
  //   };

  //   let updatedLines = [...lines];
  //   updatedLines[currentRowIndex] = updatedLine;
  //   const pricedLine = await getListPriceData(
  //     selectedRow.ItemCode,
  //     lines[currentRowIndex].price_List_DocEntry,
  //     updatedLine,
  //     currentRowIndex
  //   );
  //   updatedLines[currentRowIndex] = pricedLine;
  //   reset({
  //     ...currentData,
  //     oLines: updatedLines,
  //   });
  //   setapiloading(false);
  //   closeModel();
  // };

  //   const onSubmit = () => {
  //   const startIndex = Number(getValues("selectedRowIndex"));
  //   if (isNaN(startIndex) || startIndex < 1) {
  //     console.warn("Invalid selectedRowIndex");
  //     return;
  //   }

  //   const updated = [...getValues("oLines")];

  //   selectedRows.forEach((row, i) => {
  //     const idx = startIndex - 1 + i;

  //     let parent296 = null;
  //     for (let j = idx - 1; j >= 0; j--) {
  //       if (Number(updated[j].Type) === 296) {
  //         parent296 = updated[j];
  //         break;
  //       }
  //     }
  //     const stageId = parent296?.StageId ?? "0";
  //     const rote = parent296?.rote ?? "0";
  //     const newRow = {
  //       ...updated[idx],
  //       ...row,
  //       Type: 4,
  //       StageId: stageId,
  //       rote: rote,
  //     };
  //     if (idx < updated.length) {
  //       updated[idx] = newRow;
  //     } else {
  //       updated.push(newRow);
  //     }

  //     //  for (let k = idx + 1; k < updated.length; k++) {
  //     //   if (Number(updated[k].Type) === 296) break; // stop at next parent
  //     //   updated[k] = {
  //     //     ...updated[k],
  //     //     StageId: stageId,
  //     //     rote: rote,
  //     //   };
  //     // }
  //   });

  //   setValue("oLines", updated);
  //   closeModel();
  // };

  const handleChange = (e, row) => {
    const { name, value } = e.target;

    const updatedLines = currentData.oLines.map((data, index) => {
      if (row.id !== index + 1) return data;

      const updatedData = { ...data, [name]: value };
      if (name === "rote") {
        updatedData.rote = value;
      }
      if (name === "ItemName") {
        updatedData.ItemName = value;
      }

      updatedData.Total = ValueFormatter(
        parseFloat(updatedData.Qauntity || 0) *
          parseFloat(updatedData.Price || 0),
      );
      updatedData.TtlPrdStdCst = ValueFormatter(
        updatedData.PrdStdCst *
          (updatedData.Qauntity / currentData.Qauntity +
            updatedData.AddQuantit / currentData.PlAvgSize),
      );

      return updatedData;
    });

    reset({
      ...currentData,
      oLines: updatedLines,
    });
  };

  const handleCellKeyDown = (params, event) => {
    const api = apiRef.current;
    if (!api) return;
    const cellMode = api.getCellMode(params.id, params.field);
    const columnType = api.getColumn(params.field)?.type;
    const isSingleSelect = columnType === "singleSelect";
    if (isSingleSelect && cellMode === "edit") {
      return;
    }
    const NAV_KEYS = [
      "Tab",
      "Enter",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
    ];
    if (!NAV_KEYS.includes(event.key)) return;
    event.preventDefault();
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();
    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;
    if (cellMode === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }
    switch (event.key) {
      case "Tab":
        nextCol += event.shiftKey ? -1 : 1;
        break;
      case "Enter":
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      default:
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    ) {
      return;
    }

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });
    api.setCellFocus(nextId, nextField);

    const nextCellParams = api.getCellParams(nextId, nextField);
    if (nextCellParams.isEditable) {
      setTimeout(() => {
        api.startCellEditMode({ id: nextId, field: nextField });

        if (api.getColumn(nextField)?.type === "singleSelect") {
          const cell = api.getCellElement(nextId, nextField);
          cell?.querySelector("button")?.click();
        }
      }, 30);
    }
  };

  const processRowUpdate = (newRow, oldRow) => {
    const allLines = [...getValues("oLines")];
    let updatedRow = { ...oldRow, ...newRow };

    if (updatedRow.Quantity > oldRow.CpyIssueQty) {
      Swal.fire({
        icon: "warning",
        title: "Quantity Exceeded",
        text: `Allowed quantity: ${oldRow.CpyIssueQty}`,
      });
      updatedRow.Quantity = oldRow.CpyIssueQty;
    }

    updatedRow.Total = ValueFormatter(
      parseFloat(updatedRow.Qauntity || 0) * parseFloat(updatedRow.Price || 0),
    );
    updatedRow.TtlPrdStdCst = ValueFormatter(
      updatedRow.PrdStdCst *
        (updatedRow.Qauntity / currentData.Qauntity +
          updatedRow.AddQuantit / currentData.PlAvgSize),
    );
    /* ----------------------------------
       FINAL STATE UPDATE
    -----------------------------------*/
    const updatedLines = allLines.map((row, index) =>
      index + 1 === oldRow.id ? updatedRow : row,
    );

    reset({ ...getValues(), oLines: updatedLines });

    return updatedRow;
  };
  // const oLines = useWatch({ name: "oLines", control });

  const CalcProdPrice = () => {
    const currentData = getValues();
    const Total = currentData.oLines.reduce((acc, cur) => {
      return cur.Type === 4 ? acc + parseFloat(cur.Total || 0) : acc;
    }, 0);
    const ProductPrice = ValueFormatter(Total / currentData.Qauntity);

    setValue("ProductPrice", ProductPrice);
  };
  // const oLines = getValues();

  const Total = (currentData.oLines || []).reduce((acc, cur) => {
    return cur.Type === 4 ? acc + parseFloat(cur.Total || 0) : acc;
  }, 0);
  setValue("Total", ValueFormatter(Total));
  const TtlPrdStdCst = (currentData.oLines || []).reduce((acc, cur) => {
    return cur.Type === 4 ? acc + parseFloat(cur.TtlPrdStdCst || 0) : acc;
  }, 0);
  setValue("TtlPrdStdCst", ValueFormatter(TtlPrdStdCst));

  const HeaderCal = (qty, PlAvgSize) => {
    let updatedOLines = [];
    const allFormData = getValues();
    allFormData.oLines.forEach((i) => {
      if (i.Type === 4) {
        const Quantity =
          parseFloat(qty) === 0 ? 0 : (i.Qauntity || 0) / parseFloat(qty);
        const AddQty =
          parseFloat(PlAvgSize) === 0
            ? 0
            : (i.AddQuantit || 0) / parseFloat(PlAvgSize);
        const PrdStdCst = parseFloat(i.PrdStdCst) || 0;
        const TtlPrdStdCst = PrdStdCst * Quantity + AddQty * PrdStdCst;
        console.log("TtlPrdStdCst", TtlPrdStdCst);
        updatedOLines.push({
          ...i,
          TtlPrdStdCst: ValueFormatter(TtlPrdStdCst),
        });
      } else {
        updatedOLines.push(i);
      }
    });
    reset({
      ...allFormData,
      oLines: updatedOLines,
    });
  };

  // const handleChange = () => {};
  const addRow = () => {
    const currentData = getValues();
    const existingLines = currentData.oLines || []; // 👈 Use watched version here
    const newLine = {
      Code: "",
      ItemName: "",
      Qauntity: "",
      AddQuantit: "",
      Uom: "",
      Type: 4,
      StageId: 0,
      Price: "",
      LineTotal: "",
      rote: 0,
      // Type: existingLines.length === 0 ? 296 : "",
    };

    reset({
      ...currentData,
      oLines: [...existingLines, newLine],
    });
  };

  const onOpenPriceModel = () => {
    setOpenPriceoLines(true);
  };

  const selectPriceList = async (ListName, DocEntry) => {
    const oLines = currentData.oLines;
    if (oLines.length > 0 && ListName) {
      const { isConfirmed } = await Swal.fire({
        title: "Apply Price List",
        text: "Do you want to apply this Price List to all item lines?",
        icon: "warning",
        confirmButtonText: "YES",
        cancelButtonText: "NO",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (isConfirmed) {
        const updatedLines = await Promise.all(
          oLines.map(async (line) => {
            // Skip non-item rows
            if (line.Type !== 4 || !line.Code) return line;
            try {
              const response = await apiClient.get(
                `/PriceList/ItemsPrices/Search/${DocEntry}/${line.Code}/1`,
              );
              const matchedPrice = response?.data?.values?.[0];
              return {
                ...line,
                PriceList: ListName,
                Price: matchedPrice?.Price || 0,
                BasePrice: matchedPrice?.Price || 0,
                Total: (matchedPrice?.Price || 0) * (line.Qauntity || 1),
                price_List_DocEntry: DocEntry,
              };
            } catch (err) {
              console.error(`Failed for item ${line.Code}:`, err);
              return {
                ...line,
                PriceList: ListName,
                price_List_DocEntry: DocEntry,
              };
            }
          }),
        );

        reset({
          ...currentData,
          oLines: updatedLines,
        });
      }
    }
    setValue("price_List", ListName);
    setValue("price_List_DocEntry", DocEntry);
    setOpenPriceModal(false);
  };

  const getListPriceData = async (itemCode, docEntry, line, index) => {
    try {
      const response = await axios.get(
        `/PriceList/ItemsPrices/Search/${docEntry}/${itemCode}/1`,
      );
      if (response.data.success) {
        const matchedPrice = response.data.values?.[0];

        return {
          ...line,

          Price: matchedPrice?.Price || 0,
          BasePrice: matchedPrice?.Price || 0,
          Total: (matchedPrice?.Price || 0) * (line.Qauntity || 1),
        };
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    }

    // Fallback if API fails
    return line;
  };

  const onselectOlinePriceList = async (ListName, DocEntry) => {
    const currentData = getValues();
    const currentRowIndex = currentData.selectedRowIndex;
    const updatedLines = await Promise.all(
      currentData.oLines.map(async (line, index) => {
        if (index + 1 === currentRowIndex) {
          const pricedLine = await getListPriceData(
            line.Code,
            DocEntry,
            line,
            index,
          );
          return {
            ...pricedLine,
            PriceList: ListName,
            price_List_DocEntry: DocEntry, // Save DocEntry if needed
          };
        }
        return line;
      }),
    );
    reset({
      ...currentData,
      oLines: updatedLines,
    });

    setOpenPriceoLines(false);
  };

  const selectWhSCode = async (WHSCode) => {
    setValue("ToWHSCode", WHSCode);
    const oLines = getValues("oLines");
    if (oLines.length > 0 && WHSCode) {
      Swal.fire({
        title: "Apply Warehouse",
        text: "Do you want to apply this Warehouse to all lines?",
        icon: "warning",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((msg) => {
        if (msg.isConfirmed) {
          const updatedLines = oLines.map(
            (line) =>
              line.Type === 4
                ? { ...line, Warehouse: WHSCode } // ✅ only update 'Item' type
                : line, // ❌ keep other types untouched
          );

          reset({
            ...getValues(),
            oLines: updatedLines,
          });
        }
      });
    }

    setWhscOpen(false);
  };

  const selectChartOfAccount = (AcctCode) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index + 1 === currentRowIndex) {
        return {
          ...line,
          WipActCode: AcctCode,
        };
      }
      return line;
    });
    reset({
      ...currentData,
      oLines: updatedLines,
    });
    setChartAccountOpen(false);
  };

  const selectedoLinessetWhsc = async (WHSCode) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index + 1 === currentRowIndex) {
        return {
          ...line,
          Warehouse: WHSCode,
        };
      }
      return line;
    });
    reset({
      ...currentData,
      oLines: updatedLines,
    });
    setwhscOpenoLines(false);
  };
  const {
    data: whsData,
    hasMore: whsHasMore,
    query: whsQuery,
    onSearch: onWhsSearch,
    onClear: onWhsClear,
    fetchMore: fetchMoreWhs,
  } = useSearchInfiniteScroll(`WarehouseV2`);

  const {
    data: ChartAccountData,
    hasMore: ChartAccountHasMore,
    query: ChartAccountQuery,
    onSearch: ChartAccountSearch,
    onClear: ChartAccountClear,
    fetchMore: fetchMoreChartAccount,
  } = useSearchInfiniteScroll(`ChartOfAccounts`);

  const {
    data: priceListData,
    hasMore: priceListHasMore,
    query: priceListQuery,
    onSearch: onPriceSearch,
    onClear: onPriceClear,
    fetchMore: fetchMorePriceList,
  } = useSearchInfiniteScroll(`PriceList`);

  const {
    data: priceListLineData,
    hasMore: priceListLineHasMore,
    query: priceListLineQuery,
    onSearch: onPriceLineSearch,
    onClear: onPriceLineClear,
    fetchMore: fetchMoreLinePriceList,
  } = useSearchInfiniteScroll(`PriceList`);

  const handleSubmitForm = async (data) => {
    console.log(data.oLines);
    for (const line of data.oLines) {
      if (line.Type !== 4) continue;

      if (!Number(line.Qauntity) || Number(line.Qauntity) <= 0) {
        Swal.fire({
          text: "Item quantity should be greater than zero!",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return false;
      }

      // if (!Number(line.Price) || Number(line.Price) <= 0) {
      //   Swal.fire({
      //     text: "Price cannot be zero or empty!",
      //     icon: "warning",
      //     toast: true,
      //     showConfirmButton: false,
      //     timer: 1500,
      //   });
      //   return false;
      // }
    }
    const missingWhs = data.oLines.some((line) => !line.Code);
    if (missingWhs) {
      Swal.fire({
        title: `Missing Required Fields`,
        text: `Please select the ItemCode for all lines.`,
        icon: "warning",
        confirmButtonText: "Ok",
      });

      return false;
    }
    const Total = data.oLines.reduce((acc, cur) => {
      return cur.Type === 4 ? acc + parseFloat(cur.Total || 0) : acc;
    }, 0);
    const ProductPrice = ValueFormatter(Total / currentData.Qauntity);
    const formData = new FormData();
    formData.append("DocEntry", data.AtcEntry);
    formData.append("UserId", user.UserId);
    formData.append("CreatedBy", user.UserName);
    formData.append("ModifiedBy", user.UserName);
    formData.append("CreatedDate", dayjs().format("YYYY-MM-DD"));
    formData.append("ModifiedDate", dayjs().format("YYYY-MM-DD"));
    formData.append("Status", "1");
    fileData.forEach((fileRow, index) => {
      formData.append(
        `AttachmentLines[${index}].LineNum`,
        fileRow.LineNum === "0" ? "" : fileRow.LineNum,
      );
      formData.append(
        `AttachmentLines[${index}].DocEntry`,
        fileRow.DocEntry || "",
      );
      formData.append(`AttachmentLines[${index}].UserId`, user.UserId);
      formData.append(`AttachmentLines[${index}].CreatedBy`, user.UserName);
      formData.append(`AttachmentLines[${index}].ModifiedBy`, user.UserName);
      formData.append(
        `AttachmentLines[${index}].CreatedDate`,
        dayjs().format("YYYY-MM-DD"),
      );
      formData.append(
        `AttachmentLines[${index}].ModifiedDate`,
        dayjs().format("YYYY-MM-DD"),
      );
      formData.append(`AttachmentLines[${index}].Status`, "1");
      formData.append(
        `AttachmentLines[${index}].FileName`,
        fileRow.FileName.substring(0, fileRow.FileName.lastIndexOf(".")) ||
          fileRow.FileName,
      );
      formData.append(`AttachmentLines[${index}].FileExt`, fileRow.FileExt);
      formData.append(
        `AttachmentLines[${index}].Description`,
        fileRow.FileName,
      );
      formData.append(`AttachmentLines[${index}].SrcPath`, "");
      if (fileRow.File) {
        formData.append(`AttachmentLines[${index}].File`, fileRow.File);
      } else {
        console.warn(`No file found for row ${index}`);
      }
    });
    let attachmentDocEntry = fileData?.length === 0 ? "0" : data.AtcEntry;
    if (fileData?.length > 0 && data.AttcEntry === "0") {
      const attachmentRes = await apiClient.post("/Attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!attachmentRes.data.success) {
        return Swal.fire({
          title: "Error!",
          text: attachmentRes.data.message,
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
      attachmentDocEntry = attachmentRes.data.ID;
    }
    const obj = {
      DocEntry: "",
      UserId: user.UserId,
      Status: "1",
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      DocDate: dayjs(undefined).format("YYYY-MM-DD"),
      DocNum: data.Code || "0",
      Code: data.Code,
      Qauntity: String(data.Qauntity),
      Name: data.Name,
      TreeType: data.TreeType,
      ProductPrice: ProductPrice,
      Object: "66",
      PlAvgSize: String(data.PlAvgSize),
      ToWH: data.ToWHSCode || "0",
      PriceList: data.price_List_DocEntry || "0",
      PrdStdCst: data.PrdStdCst || "0",
      DispCurr: "0",
      AtcEntry: attachmentDocEntry,
      Series: "0",
      TransId: "0",
      oPTLines: (data.oLines || [])
        .filter((stage) => stage.Type !== 296)
        .map((oPTLines) => ({
          LineNum: oPTLines.LineNum || "0",
          DocEntry: "",
          UserId: user.UserId,
          Status: "1",
          CreatedBy: user.UserName,
          CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
          Father: data.Code,
          Code: oPTLines.Code,
          ItemName: oPTLines.ItemName,
          Quantity: String(oPTLines.Qauntity) || "0",
          PrdStdCst: String(oPTLines.PrdStdCst) || "0",
          TotalPrdStdCst: String(oPTLines.TtlPrdStdCst) || "0",
          Warehouse: oPTLines.Warehouse || "0",
          Price: oPTLines.Price || "0",
          Currency: "INR",
          PriceList: oPTLines.price_List_DocEntry || "0",
          OrigPrice: "0",
          OrigCurr: "0",
          IssueMthd: oPTLines.IssueMthd || "0",
          Uom: oPTLines.Uom || "0",
          Comment: oPTLines.Comment || "",
          Type: String(oPTLines.Type) || "0",
          WipActCode: oPTLines.WipActCode || "0",
          AddQuantit: String(oPTLines.AddQuantit) || "0",
          StageId: String(oPTLines.rote) || "0",
          ChildNum: String(oPTLines.rote) || "0",
          VisOrder: "0",
          Object: "66",
          LineText: oPTLines.Type === -18 ? oPTLines.ItemName : "0",
        })),
      oPTStagesLines: (data.oLines || [])
        .filter((stage) => stage.Type === 296)
        .map((stageitem) => ({
          LineNum: stageitem.LineNum || "0",
          DocEntry: "",
          UserId: user.UserId,
          Status: "1",
          CreatedBy: user.UserName,
          CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
          Father: data.Code,
          StageId: String(stageitem.StageId),
          Code: stageitem.Code,
          Name: stageitem.ItemName,
          SeqNum: String(stageitem.rote),
          StgEntry: String(stageitem.StageId || "0"),
          Type: stageitem.Type,
        })),
    };
    if (obj.oPTStagesLines?.length > 0) {
      const firstLine = data.oLines[0];

      if (firstLine?.Type !== 296) {
        Swal.fire({
          title: "Route",
          text: "Route stage must be the first line",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }
    }

    console.log("object bom", obj);

    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/BillOfMaterial`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearForm();
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "BillOfMaterial saved Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            if (attachmentDocEntry > 0) {
              apiClient.delete(`/Attachment/${attachmentDocEntry}`);
            }
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "error",
              confirmButtonText: "Ok",
              // timer: 1000,
            });
          }
        })
        .catch((error) => {
          if (attachmentDocEntry > 0) {
            apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          }
          console.error("Error Post time", error);
          Swal.fire({
            title: "Error!",
            text: "something went wrong" + error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else {
      Swal.fire({
        text: `Do You Want Update "${obj.Code}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          if (attachmentDocEntry > "0") {
            apiClient.put(`/Attachment/${attachmentDocEntry}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
          apiClient
            .put(`/BillOfMaterial/Update/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                setOpenListData([]);
                setOpenListPage(0);
                fetchOpenListData(0);
                ClearForm();
                Swal.fire({
                  title: "Success!",
                  text: "BillOfMaterial Updated",
                  icon: "success",
                  confirmButtonText: "Ok",
                  timer: 1000,
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: response.data.message,
                  icon: "warning",
                  confirmButtonText: "Ok",
                });
              }
            })
            .catch(() => {
              Swal.fire({
                title: "Error!",
                text: "something went wrong",
                icon: "warning",
                confirmButtonText: "Ok",
              });
            });
        } else {
          Swal.fire({
            text: "BillOfMaterial Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const TreeTypeLine = [
    { value: 4, label: "Item" },
    { value: 296, label: "Route Stage" },
    { value: -18, label: "Text" },
    { value: 290, label: "Resource" },
  ];
  const filteredTreeTypeLine =
    treeType === "P"
      ? TreeTypeLine
      : TreeTypeLine.filter((item) => item.value !== 296);

  const ItemColumn = [
    {
      id: 1,
      field: "id",
      headerName: "Line Number",
      sortable: false,
      editable: false,
      width: 50,
      renderCell: (params) => <Typography>{params?.id}</Typography>,
    },
    {
      field: "Type",
      headerName: "Type",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      editable: true,
      type: "singleSelect",
      valueOptions: filteredTreeTypeLine,
      // renderCell: (params) => (
      //   <InputSelectTextField
      //     name="Type"
      //     value={params.value}
      //     onChange={(e) => handleChangeType(e, params.row)}
      //     data={filteredTreeTypeLine}
      //   />
      // ),
    },
    {
      field: "Code",
      headerName: "Item Code",
      sortable: false,
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowType = params.row.Type || "";
        let openItemCode = !!params.row.Code;
        const handleIconClick = () => {
          setValue("selectedRowIndex", params.row.id);
          switch (rowType) {
            case 4:
              setOpenItem(true);
              break;
            case 296:
              setOpenRouteStage(true);
              break;
            case -18:
              break;
            case 290:
              break;
            default:
              break;
          }
        };
        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            gap={0.5}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (!openItemCode) {
                  handleIconClick();
                }
              }
            }}
            sx={{ width: "100%", height: "100%" }}
          >
            {/* ---- UOM Text ---- */}
            <Grid item xs zeroMinWidth>
              <Tooltip title={params.row.Code || ""}>
                <Typography
                  noWrap
                  textAlign="center"
                  sx={{ fontSize: 13, cursor: "default" }}
                >
                  {params.row.Code || ""}
                </Typography>
              </Tooltip>
            </Grid>

            <Grid item>
              <IconButton
                size="small"
                onClick={() => {
                  handleIconClick();
                }}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                  "&:hover": { backgroundColor: "darkgreen" },
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    {
      field: "ItemName",
      headerName: "Item Name",
      width: 150,
      editable: false,
    },

    {
      field: "Qauntity",
      headerName: "Quantity",
      width: 120,
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "AddQuantit",
      headerName: "Additional Quantity",
      width: 150,
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "Uom",
      headerName: "UoM Code",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "Warehouse",
      headerName: "Warehouse",
      sortable: false,
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openWHSCode = !!params.row.Warehouse;
        let disabled = params.row.Type === 296;
        return (
          <Grid
            container // ✅ important
            alignItems="center" // vertical center
            justifyContent="center" // horizontal center
            gap={0.5}
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (disabled) return;
                if (!openWHSCode) {
                  setValue("selectedRowIndex", params.row.id);
                  setwhscOpenoLines(true);
                }
              }
            }}
            sx={{
              width: "100%",
              height: "100%",
              outline: "none",
            }}
          >
            <Grid item xs>
              <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                {params.row.Warehouse || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  setwhscOpenoLines(true);
                }}
                disabled={disabled}
                size="small"
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                  "&:hover": { backgroundColor: "darkgreen" },
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    {
      field: "PrdStdCst",
      headerName: "Production Std Cost",
      description: "Production Standard Cost",
      sortable: false,
      width: 170,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "TtlPrdStdCst",
      headerName: "Total Production Std Cost",
      description: "Total Production Standard Cost",
      sortable: false,
      width: 170,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "PriceList",
      headerName: "Price List",
      sortable: false,
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openPriceList = !!params.row.PriceList;
        let disabled = params.row.Type === 296;
        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            gap={0.5}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (!openPriceList || disabled) {
                  setValue("selectedRowIndex", params.row.id);
                  onOpenPriceModel();
                }
              }
            }}
            sx={{ width: "100%", height: "100%" }}
          >
            {/* ---- UOM Text ---- */}
            <Grid item xs zeroMinWidth>
              <Tooltip title={params.row.PriceList || ""}>
                <Typography
                  noWrap
                  textAlign="center"
                  sx={{ fontSize: 13, cursor: "default" }}
                >
                  {params.row.PriceList || ""}
                </Typography>
              </Tooltip>
            </Grid>

            <Grid item>
              <IconButton
                size="small"
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  onOpenPriceModel();
                }}
                disabled={disabled}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                  "&:hover": { backgroundColor: "darkgreen" },
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    {
      field: "Price",
      headerName: "Unit Price",
      sortable: false,
      width: 130,
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "Total",
      headerName: "Total",
      // type: "number",
      width: 120,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    {
      field: "IssueMthd",
      headerName: "Issue Method",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: "1", label: "Backflush" },
        { value: "2", label: "Manual" },
      ],
    },

    {
      field: "rote",
      headerName: "Route Sequence",
      width: 100,
      editable: false,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isRouteRow = params.row?.Type === 296;
        const lines = getValues("oLines");
        const usedRoutes = lines.filter((row) => row?.Type === 296);

        return (
          <InputSelectTextField
            name="rote"
            value={params.value || ""}
            onChange={(e) => handleRoteChange(e, params.row)}
            disabled={!isRouteRow} // 🔒 children disabled
            data={usedRoutes.map((item) => ({
              key: item.rote,
              value: item.rote,
            }))}
          />
        );
      },
    },
    {
      field: "WipActCode",
      headerName: "WIP ACCOUNT",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openAcctCode = !!params.row.WipActCode;
        const isRouteRow = params.row?.Type === 296;
        return (
          <Grid
            container // ✅ important
            alignItems="center" // vertical center
            justifyContent="center" // horizontal center
            gap={0.5}
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (isRouteRow) return;
                if (!openAcctCode) {
                  setValue("selectedRowIndex", params.row.id);
                  setChartAccountOpen(true);
                }
              }
            }}
            sx={{
              width: "100%",
              height: "100%",
              outline: "none",
            }}
          >
            <Grid item xs>
              <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                {params.row.WipActCode || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  setChartAccountOpen(true);
                }}
                size="small"
                disabled={params.row?.Type === 296}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                  "&:hover": { backgroundColor: "darkgreen" },
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    {
      field: "ACTION",
      headerName: "Action",
      width: 50,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={() => handleDeleteRow(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const isCellEditableFn = (params) => {
    const { field, row } = params;

    // --- Type field ---
    if (field === "Type") {
      // Optional: allow editing Type for all rows
      return true;
    }

    // --- ROUTE STAGE editable fields (Type=296) ---
    const routeFields = ["rote", "Status"];
    if (Number(row.Type) === 296 && routeFields.includes(field)) return true;

    // --- ITEM editable fields (Type=4) ---
    const itemFields = [
      "Qauntity",
      "AddQuantit",
      "Warehouse",
      "PriceList",
      "PrdStdCst",
      "Price",
      "IssueMthd",
      "Uom",
      "WipActCode",
    ];
    if (Number(row.Type) === 4 && itemFields.includes(field)) return true;

    // --- ISSUE TYPE editable for both items and route stages (optional) ---
    // if (field === "IssueType" && (row.Type === 4 || row.Type === 296)) return true;

    return false; // all other fields are read-only
  };
  const sidebarContent = (
    <>
      <Grid
        item
        width={"100%"}
        py={0.5}
        alignItems={"center"}
        border={"1px solid silver"}
        borderBottom={"none"}
        position={"relative"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Typography
          textAlign={"center"}
          alignContent={"center"}
          height={"100%"}
        >
          Bill Of Material List
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setDrawerOpen(false)}
          sx={{
            position: "absolute",
            right: "10px",
            top: "0px",
            display: { lg: "none", xs: "block" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid
        container
        item
        width={"100%"}
        height={"100%"}
        border={"1px silver solid"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              px: 1,
              overflow: "scroll",
              overflowX: "hidden",
              typography: "body1",
            }}
            id="ListScroll"
          >
            <Grid
              item
              padding={1}
              md={12}
              sm={12}
              width={"100%"}
              sx={{
                position: "sticky",
                top: "0",
                backgroundColor:
                  theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
              }}
            >
              <SearchInputField
                onChange={(e) => handleOpenListSearch(e.target.value)}
                value={openListquery}
                onClickClear={handleOpenListClear}
              />
            </Grid>
            <InfiniteScroll
              style={{ textAlign: "center", justifyContent: "center" }}
              dataLength={openListData.length}
              hasMore={hasMoreOpen}
              next={fetchMoreOpenListData}
              loader={
                <BeatLoader
                  color={theme.palette.mode === "light" ? "black" : "white"}
                />
              }
              scrollableTarget="ListScroll"
              endMessage={<Typography>No More Records</Typography>}
            >
              {openListData.map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.Code}
                  subtitle={item.Name}
                  description={item.DocNum}
                  isSelected={oldOpenData === item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => setOldOpenData(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <>
      <DynamicLoader open={apiloading} />

      <SearchModel
        open={openWhsc}
        onClose={() => setWhscOpen(false)}
        onCancel={() => setWhscOpen(false)}
        title="WareHouse"
        onChange={(e) => onWhsSearch(e.target.value)}
        value={whsQuery}
        onClickClear={onWhsClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={whsData?.length ?? ""}
            next={fetchMoreWhs}
            hasMore={whsHasMore}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            scrollableTarget="getListForCreateScroll"
            endMessage={
              <Typography textAlign={"center"}>No More Records</Typography>
            }
          >
            {whsData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.WHSName}
                searchResult={whsQuery}
                isSelected={getValues("ToWHSCode") === item.WHSCode}
                onClick={() => {
                  selectWhSCode(item.WHSCode);
                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openwhscoLines}
        onClose={() => setwhscOpenoLines(false)}
        onCancel={() => setwhscOpenoLines(false)}
        title="WareHouse"
        onChange={(e) => onWhsSearch(e.target.value)}
        value={whsQuery}
        onClickClear={onWhsClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={whsData.length}
            next={fetchMoreWhs}
            hasMore={whsHasMore}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            scrollableTarget="getListForCreateScroll"
            endMessage={
              <Typography textAlign={"center"}>No More Records</Typography>
            }
          >
            {whsData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.WHSName}
                searchResult={whsQuery}
                isSelected={
                  getValues(
                    `oLines.${getValues("selectedRowIndex")}.Warehouse`,
                  ) === item.WHSCode
                }
                onClick={() => {
                  selectedoLinessetWhsc(item.WHSCode);
                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <SearchModel
        open={chartAccountOpen}
        onClose={() => setChartAccountOpen(false)}
        onCancel={() => setChartAccountOpen(false)}
        title="Chart Of Account"
        onChange={(e) => ChartAccountSearch(e.target.value)}
        value={ChartAccountQuery}
        onClickClear={ChartAccountClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={ChartAccountData.length}
            next={fetchMoreChartAccount}
            hasMore={ChartAccountHasMore}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            scrollableTarget="getListForCreateScroll"
            endMessage={
              <Typography textAlign={"center"}>No More Records</Typography>
            }
          >
            {ChartAccountData.filter(
              (Postable) => Postable.Postable === "Y",
            ).map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.AcctCode}
                subtitle={item.AcctName}
                searchResult={ChartAccountQuery}
                isSelected={
                  getValues(
                    `oLines.${getValues("selectedRowIndex")}.WipActCode`,
                  ) === item.AcctCode
                }
                onClick={() => {
                  selectChartOfAccount(item.AcctCode);
                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openPriceModal}
        onClose={() => setOpenPriceModal(false)}
        onCancel={() => setOpenPriceModal(false)}
        title="Price List"
        onChange={(e) => onPriceSearch(e.target.value)}
        value={priceListQuery}
        onClickClear={onPriceClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={priceListData.length}
            next={fetchMorePriceList}
            hasMore={priceListHasMore}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            scrollableTarget="getListForCreateScroll"
            endMessage={
              <Typography textAlign={"center"}>No More Records</Typography>
            }
          >
            {priceListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.ListName}
                subtitle={item.BaseNum}
                description={item.PrimCurr}
                searchResult={priceListQuery}
                isSelected={getValues("price_List") === item.ListName}
                onClick={() => {
                  selectPriceList(item.ListName, item.DocEntry);
                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openPriceOnoLines}
        onClose={() => setOpenPriceoLines(false)}
        onCancel={() => setOpenPriceoLines(false)}
        title="Price List"
        onChange={(e) => onPriceLineSearch(e.target.value)}
        value={priceListLineQuery}
        onClickClear={onPriceLineClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={priceListLineData.length}
            next={fetchMoreLinePriceList}
            hasMore={priceListLineHasMore}
            loader={
              <BeatLoader
                color={theme.palette.mode === "light" ? "black" : "white"}
              />
            }
            scrollableTarget="getListForCreateScroll"
            endMessage={
              <Typography textAlign={"center"}>No More Records</Typography>
            }
          >
            {priceListLineData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.ListName}
                subtitle={item.BaseNum}
                description={item.PrimCurr}
                searchResult={priceListQuery}
                isSelected={
                  getValues(
                    `oLines.${getValues("selectedRowIndex")}.PriceList`,
                  ) === item.ListName
                }
                onClick={() => {
                  onselectOlinePriceList(item.ListName, item.DocEntry);
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <ProductionDataGrid
        open={openItem}
        closeModel={closeModel}
        onSubmit={onSubmit}
        isLoading={itemList.length === 0 ? true : isLoading}
        title="Item List"
        getRowId={(row) => row.DocEntry}
        columns={modelColumns}
        rows={itemList}
        currentPage={currentPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onRowSelectionModelChange={handleCellClick}
        onSearchChange={handleSearchChange}
        selectedRowIndex={getValues("selectedRowIndex")}
        rowCount={rowCount}
        oLines={getValues("oLines")}
        ItemCodeH={currentData.Code}
      />

      <DataGriCellModelClick
        open={openRouteStage}
        closeModel={closeModelRoute}
        // onSubmit={onSubmit}
        isLoading={isLoading}
        title="Route Stage"
        getRowId={(row) => row.DocEntry}
        columns={RoutestageColumn}
        rows={routeStageList}
        currentPage={routeStagecurrentPage}
        limit={LIMIT}
        onPaginationModelChange={handleRounteStagePaginationModelChange}
        onCellClick={handleRouteClick}
        onSearchChange={handleRounteStageSearchChange}
        selectedRowIndex={getValues("selectedRowIndex")}
        rowCount={routeStagerowCount}
        oLines={getValues("oLines")}
      />

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Grid
          container
          item
          height="100%"
          sm={12}
          md={6}
          lg={3}
          className="sidebar"
          sx={{
            position: { lg: "relative", xs: "absolute" },
            top: 0,
            left: 0,
            transition: "left 0.3s ease",
            zIndex: 1000,
            display: { lg: "block", xs: `${drawerOpen ? "block" : "none"}` },
          }}
        >
          {sidebarContent}
        </Grid>

        {/* User Creation Form Grid */}
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={9}
          position="relative"
        >
          {/* Hamburger Menu for smaller screens */}

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{
              display: {
                lg: "none",
              },
              position: "absolute",
              // top: "10px",
              left: "10px",
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={ClearForm}
            sx={{
              display: {},
              position: "absolute",
              // top: "10px",
              right: "10px",
            }}
          >
            <AddIcon />
          </IconButton>

          <Grid
            item
            width={"100%"}
            py={0.5}
            alignItems={"center"}
            border={"1px solid silver"}
            borderBottom={"none"}
          >
            <Typography
              textAlign={"center"}
              alignContent={"center"}
              height={"100%"}
            >
              Bill Of Material
            </Typography>
          </Grid>

          <Grid
            container
            item
            width={"100%"}
            height={"100%"}
            border={"1px silver solid"}
          >
            <Grid
              container
              item
              padding={1}
              md={12}
              sm={12}
              height="calc(100% - 40px)"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
              position={"relative"}
              width={"100%"}
            >
              <Box
                // component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="TreeType"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="BOM TYPE"
                          data={[
                            { key: "A", value: "ASSEMBLY " },
                            { key: "S", value: "SALES" },
                            { key: "P", value: "PRODUCTION" },
                            { key: "T", value: "TEMPLATE" },
                          ]}
                          onChange={(e) => {
                            setValue("Code", "");
                            setValue("TreeType", e.target.value);
                            setValue("Name", "");
                            setHasMoreGetList(true);
                            setValue("oLines", []);
                            setItemCache({});
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Code"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="PRODUCT NO"
                          readOnly={true}
                          disabled={treeType === ""}
                          onClick={() => setSearchmodelOpen(true)}
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                    <SearchModel
                      open={searchmodelOpen}
                      onClose={() => setSearchmodelOpen(false)}
                      onCancel={() => setSearchmodelOpen(false)}
                      title="Select Items"
                      onChange={(e) => handleGetListSearch(e.target.value)}
                      value={getListquery}
                      onClickClear={handleGetListClear}
                      cardData={
                        <>
                          <InfiniteScroll
                            style={{
                              textAlign: "center",
                              justifyContent: "center",
                            }}
                            dataLength={getListData.length}
                            next={fetchMoreGetListData}
                            hasMore={hasMoreGetList}
                            loader={
                              <BeatLoader
                                color={
                                  theme.palette.mode === "light"
                                    ? "black"
                                    : "white"
                                }
                              />
                            }
                            scrollableTarget="getListForCreateScroll"
                            endMessage={
                              <Typography textAlign={"center"}>
                                No More Records
                              </Typography>
                            }
                          >
                            {getListData.map((item, index) => (
                              <CardComponent
                                // key={index}
                                key={item.DocEntry}
                                title={item.ItemCode}
                                subtitle={item.ItemName}
                                description={item.Cellular}
                                searchResult={getListquery}
                                // isSelected={
                                //   allFormData.CardCode === item.CardCode
                                // }
                                onClick={() => {
                                  onSelectProduction(
                                    item.DocEntry,
                                    item.ItemCode,
                                    item.ItemName,
                                    item.PrdStdCst,
                                    item.DefaultWhs,
                                  );
                                }}
                              />
                            ))}
                          </InfiniteScroll>
                        </>
                      }
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Series"
                      // rules={{ required: "please select Series" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="SERIES"
                          data={[
                            ...(DocSeries || []).map((item) => ({
                              key: item.DocEntry,
                              value: item.SeriesName,
                            })),
                            { key: "0", value: "MANUAL" },
                          ]}
                          disabled={!currentData.DocEntry === false}
                          {...field}
                          onChange={(e) => {
                            const selectedSeries = e.target.value;
                            field.onChange(selectedSeries);
                            setValue("Series", selectedSeries);

                            if (selectedSeries !== "0") {
                              const seriesData = DocSeries.find(
                                (item) => item.DocEntry === selectedSeries
                              );
                              setValue("DocNum", DocSeries[0]?.DocNum || "");

                              setValue(
                                "SeriesName",
                                seriesData?.SeriesName || ""
                              );
                              clearErrors("DocNum");
                            } else {
                              setValue("DocNum", "");
                              setValue("SeriesName", ""); // Clear SeriesName immediately
                              clearErrors("DocNum");
                            }
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DocNum"
                      control={control}
                      rules={{
                        validate: (value) => {
                          if (watch("Series") === "0" && !value) {
                            return " Please Enter DocNum";
                          }
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="DOC NO"
                          type="text"
                          {...field}
                          // disabled={allFormData.DocEntry!==allFormData.DocEntry}
                          readOnly={
                            !currentData.DocEntry === false ||
                            watch("Series") !== "0"
                          }
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Name"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="PRODUCT DESCRIPTION"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Qauntity"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="QUANTITY"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                          type="number"
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            const value = parseFloat(rawValue);
                            // Always update form state
                            field.onChange(rawValue);
                            // Only call HeaderCal if > 0
                            if (!isNaN(value) && value > 0) {
                              HeaderCal(value, currentData.PlAvgSize || 0);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            // Force validation error if invalid
                            if (isNaN(value) || value <= 0) {
                              field.onChange(""); // reset to empty (so error shows)
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="PrdStdCst"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="PRODUCTION STD COST"
                          type="text"
                          readOnly
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign="center">
                    <Controller
                      name="PlAvgSize"
                      control={control}
                      rules={{
                        required: "This field is required",
                        validate: (value) =>
                          parseFloat(value) > 0 ||
                          "Value must be greater than 0",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="PLANNED AVG PRODUCTION SIZE"
                          {...field}
                          error={!!error}
                          title="PLANNED AVG PRODUCTION SIZE"
                          helperText={error ? error.message : ""}
                          type="number"
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            const value = parseFloat(rawValue);
                            field.onChange(rawValue);
                            if (!isNaN(value) && value > 0) {
                              HeaderCal(currentData.Qauntity || 0, value);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            // Force validation error if invalid
                            if (isNaN(value) || value <= 0) {
                              field.onChange(""); // reset to empty (so error shows)
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ToWHSCode" // Unique name per row
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                          disabled={currentData.TreeType === "P" ? false : true}
                          label="WAREHOUSE"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => {
                                    setWhscOpen(true);
                                  }}
                                  size="small"
                                  color="primary"
                                  disabled={
                                    currentData.TreeType === "P" ? false : true
                                  }
                                  sx={{
                                    backgroundColor: "green",
                                    borderRadius: "10%",
                                    color: "white",
                                  }}
                                >
                                  <ViewListIcon
                                    disabled={
                                      currentData.TreeType === "P"
                                        ? false
                                        : true
                                    }
                                  />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="price_List"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                          label="PRICE LIST"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setOpenPriceModal(true)}
                                  size="small"
                                  color="primary"
                                  sx={{
                                    backgroundColor: "green",
                                    borderRadius: "10%",
                                    color: "white",
                                  }}
                                >
                                  <ViewListIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container width={"100%"}>
                  <Grid
                    container
                    item
                    xs={12}
                    width="100%"
                    m={1}
                    border="1px solid grey"
                  >
                    <Tabs
                      sx={{ width: "100%" }}
                      value={tabvalue}
                      onChange={handleTabChange}
                      aria-label="scrollable tabs example"
                      variant="scrollable"
                      scrollButtons="auto"
                      allowScrollButtonsMobile
                    >
                      <Tab
                        value={0}
                        label={
                          <Grid
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <ListAltIcon sx={{ mr: 0.5 }} />{" "}
                            {/* Icon for Contents */}
                            Contents
                          </Grid>
                        }
                      />

                      <Tab
                        value={1}
                        label={
                          <Grid
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <AttachFileIcon sx={{ mr: 0.5 }} />{" "}
                            {/* Icon for Attachments */}
                            Attachments
                          </Grid>
                        }
                      />
                    </Tabs>
                    <Divider />
                    <Grid item xs={12}>
                      {tabvalue === 0 && (
                        <>
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: "green",
                              borderRadius: "20%",
                              color: "white",
                              m: 1,
                            }}
                            disabled={currentData.Code === ""}
                            onClick={addRow}
                          >
                            <AddOutlinedIcon />
                          </IconButton>
                          <Grid
                            container
                            item
                            sx={{
                              overflow: "auto",
                              width: "100%",
                              height: "100%",
                              minHeight: "300px",
                              maxHeight: "500px",
                              mt: "5px",
                            }}
                          >
                            <DataGrid
                              className="datagrid-style"
                              columnHeaderHeight={35}
                              rowHeight={45}
                              apiRef={apiRef}
                              columns={ItemColumn}
                              sx={gridSx}
                              rows={(currentData.oLines || []).map(
                                (data, index) => ({
                                  ...data,
                                  id: index + 1,
                                }),
                              )}
                              getRowId={(row) => row?.id ?? -1}
                              editMode="cell"
                              isCellEditable={isCellEditableFn}
                              getCellClassName={(params) => {
                                const editableFields = [
                                  "rote",
                                  "StartDate",
                                  "EndDate",
                                  "Status",
                                  "BaseQty",
                                  "AdditQty",
                                  "PlannedQty",
                                  "IssuedQty",
                                  "OpenQuantity",
                                  "WHSCode",
                                  "Price",
                                  "UomCode",
                                  "IssueMthd",
                                  "WipActCode",
                                ];
                                if (
                                  !isCellEditableFn(params) &&
                                  editableFields.includes(params.field)
                                ) {
                                  return "disabled-cell";
                                }
                                return "";
                              }}
                              processRowUpdate={processRowUpdate}
                              onProcessRowUpdateError={(err) =>
                                console.error(err)
                              }
                              onCellKeyDown={handleCellKeyDown}
                              disableColumnFilter
                              disableColumnSelector
                              disableDensitySelector
                              slotProps={{
                                toolbar: {
                                  showQuickFilter: true,
                                  quickFilterProps: { debounceMs: 500 },
                                },
                              }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>

                    {tabvalue === 1 && (
                      <Grid container mt={1}>
                        <Grid item xs={12}>
                          <input
                            type="file"
                            id="file-upload"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                            multiple
                            accept="
                    .pdf,.xls,.xlsx,.csv,.doc,.docx,.txt,
                    .tiff,.tif,.jpg,.jpeg,.png,
                    .zip,.rar,
                    .json,.xml,
                    .dwg,.dxf,
                    .heic,.webp,.bmp,.gif,.svg
                  "
                          />
                          <label
                            htmlFor="file-upload"
                            style={{
                              marginLeft: 5,
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "5px 10px",
                              backgroundColor: "#2E7D32",
                              color: "#fff",
                              borderRadius: "5px",
                              cursor: "pointer",
                              transition: "background-color 0.3s",
                            }}
                          >
                            <CloudUploadIcon
                              sx={{ fontSize: 20, marginRight: "5px" }}
                            />
                            Upload File
                          </label>

                          <TableContainer
                            sx={{ margin: "7px", maxHeight: 200, width: "80%" }}
                          >
                            {fileData.length > 0 && (
                              <Table sx={{ minWidth: 500 }} stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Selected File Name</TableCell>
                                    <TableCell>Action</TableCell>
                                  </TableRow>
                                </TableHead>
                                <Divider />
                                <TableBody>
                                  {fileData.map((data, index) => (
                                    <TableRow
                                      key={index}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <TableCell
                                        onClick={
                                          () =>
                                            data.LineNum === "0"
                                              ? openFileinNewTab(data) // API case
                                              : Base64FileinNewTab(
                                                  data.DocEntry,
                                                  data.LineNum,
                                                  data.FileExt,
                                                  data.Description,
                                                ) // Base64 case
                                        }
                                      >
                                        {data.FileName}
                                      </TableCell>
                                      <TableCell>
                                        <RemoveCircleOutlineIcon
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(
                                              index,
                                              data.LineNum,
                                              SaveUpdateName,
                                            );
                                          }}
                                          style={{ cursor: "pointer" }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TableContainer>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={4} textAlign={"center"}>
                    <Controller
                      name="TtlPrdStdCst"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        // <Tooltip title="TOTAL PRODUCTION STANDARD COST" arrow >

                        <InputTextField
                          label="TOTAL PRODUCTION STANDARD COST"
                          title="TOTAL PRODUCTION STANDARD COST"
                          {...field}
                          readOnly
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                        // </Tooltip>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={4} textAlign={"center"}>
                    <Controller
                      name="Total"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TOTAL"
                          {...field}
                          readOnly
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={4} textAlign={"center"}>
                    <Controller
                      name="ProductPrice"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="PRODUCT PRICE"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                    <Button
                      sx={{ mt: 1.3 }}
                      variant="outlined"
                      onClick={() => CalcProdPrice()}
                    >
                      <Tooltip title="Set Product Price To Sum of Component Prices">
                        Calc
                      </Tooltip>
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid
              item
              px={1}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
                bottom: "0px",
              }}
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ color: "white" }}
                  name={SaveUpdateName}
                  type="submit"
                  disabled={!perms.IsAdd || !perms.IsEdit}
                >
                  {SaveUpdateName}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={!perms.IsDelete || !currentData.DocEntry}
                >
                  DELETE
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
