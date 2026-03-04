import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import HomeIcon from "@mui/icons-material/Home";

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CardComponent from "../Components/CardComponent";

import SearchInputField from "../Components/SearchInputField";

import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import DataGridModal from "../Components/DataGridModal";
import {
  InputDatePickerField,
  InputSelectTextField,
  InputTextField,
  InputTextSearchButtonTable,
} from "../Components/formComponents";
import SearchModel from "../Components/SearchModel";
import { TimeDelay } from "../Components/TimeDelay";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import SaveIcon from "@mui/icons-material/Save";
import { useGridApiRef } from "@mui/x-data-grid";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { TwoFormatter } from "../Components/ValueFormatter";
import { Loader } from "../Components/Loader";
export default function InventoryRevaluation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabvalue, settabvalue] = useState(0);

  //Search Item Modal States
  const [open, setOpen] = useState(false);
  const [itemList, setItemList] = useState([]);
  const LIMIT = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [itemCache, setItemCache] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
  // const [selectedRows, setSelectedRows] = useState([]);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [selectedData, setSelectedData] = useState([]);
  let [ok, setok] = useState("OK");

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [clearCache, setClearCache] = useState(false);

  //  ===================================WareHouse State===================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);

  //===================================Row level G/L increase Acct STate======================================
  const [getListqueryAccount, setgetListqueryAccount] = useState("");
  const [getListSearchingAccount, setgetListSearchingAccount] = useState(false);
  const [getListDataAccount, setgetListDataAccount] = useState([]);
  const [getListPageAccount, setgetListPageAccount] = useState(0);
  const [hasMoreGetListAccount, sethasMoreGetListAccount] = useState(true);
  const [searchmodelOpenAccount, setsearchmodelOpenAccount] = useState(false);

  //===================================Row level G/L decrease Acct STate======================================
  const [searchmodelOpenDecAccount, setsearchmodelOpenDecAccount] =
    useState(false);
  const [getListDataDecAccount, setgetListDataDecAccount] = useState([]);
  const [getListPageDecAccount, setgetListPageDecAccount] = useState(0);
  const [hasMoreGetListDecAccount, sethasMoreGetListDecAccount] =
    useState(true);
  const [getListqueryDecAccount, setgetListqueryDecAccount] = useState("");
  const [getListSearchingDecAccount, setgetListSearchingDecAccount] =
    useState(false);
  const [GLAcctDeterminationData, setGLAcctDeterminationData] = useState([]);

  const [selectedRowMap, setSelectedRowMap] = useState({});
  const apiRef = useGridApiRef();
  const fifoApiRef = useGridApiRef();

  const fifoCacheRef = useRef(new Map());
  const [fifoRows, setFifoRows] = useState([]);
  const [activeRowKey, setActiveRowKey] = useState(null);
  const fifoLayersMap = useRef(new Map());
  const updateFifoRow = useCallback(
    (id, field, value) => {
      const currentKey = activeRowKey; // Use the active row key
      if (!currentKey) return;

      const layers = fifoLayersMap.current.get(currentKey) || [];
      const index = layers.findIndex((r) => r.id === id);
      if (index === -1) return;

      const updatedLayer = { ...layers[index], [field]: value };
      const updatedLayers = [...layers];
      updatedLayers[index] = updatedLayer;

      fifoLayersMap.current.set(currentKey, updatedLayers);
      setFifoRows(updatedLayers); // Update the displayed rows
    },
    [activeRowKey],
  );
  const FIFOPriceChangeColumns = [
    { field: "INMBaseRef", headerName: "DOC NO.", width: 100 },
    {
      field: "INMDocDate",
      headerName: "ENTRY DATE",
      width: 100,
      editable: true, // Assuming you want this editable
    },
    {
      field: "RActPrice",
      headerName: "CURRENT COST",
      sortable: false,
      width: 120,
    },
    {
      field: "Price",
      headerName: "NEW PRICE",
      width: 130,
      editable: true,
      type: "number",
    },
    {
      field: "INMOpenQty",
      headerName: "OPEN QTY",
      sortable: false,
      width: 120,
    },
  ];

  const FIFODebCredColumn = [
    { field: "INMBaseRef", headerName: "DOC NO.", width: 100 },
    {
      field: "INMDocDate",
      headerName: "ENTRY DATE",
      width: 100,
      editable: true, // Assuming you want this editable
    },
    {
      field: "Quantity",
      headerName: "QUANTITY",
      width: 130,
      editable: true,
      type: "number",
    },
    {
      field: "LineTotal",
      headerName: "DEBIT / CREDIT",
      width: 150,
      editable: true,
      type: "number", // Assuming it's a number; adjust if text
    },
    {
      field: "INMOpenQty",
      headerName: "OPEN QTY",
      sortable: false,
      width: 120,
    },
  ];

  const loadFifoForRow = useCallback(
    async (row) => {
      // 🔹 Guard: invalid row or not FIFO
      if (!row || row.EvalSystem !== "FIFO") {
        setFifoRows([]);
        setActiveRowKey(null);
        return;
      }

      const rowKey = `${row.ItemCode}_${row.WHSCode}`;
      setActiveRowKey(rowKey);

      // 🔹 UPDATE mode → only use existing data
      if (SaveUpdateName === "UPDATE") {
        setFifoRows(fifoLayersMap.current.get(rowKey) || []);
        return;
      }

      // 🔹 User-edited FIFO data has priority
      if (fifoLayersMap.current.has(rowKey)) {
        setFifoRows(fifoLayersMap.current.get(rowKey));
        return;
      }

      // 🔹 Cached API data
      if (fifoCacheRef.current.has(rowKey)) {
        const cached = fifoCacheRef.current.get(rowKey);
        fifoLayersMap.current.set(rowKey, cached);
        setFifoRows(cached);
        return;
      }

      // 🔹 API call (SAVE mode only)
      try {
        setIsLoading(true);

        const res = await apiClient.get(
          "/InventoryRevaluation/InvFIFOStockIn",
          {
            params: {
              Status: 1,
              ItemCode: row.ItemCode,
              WHSCode: row.WHSCode,
            },
          },
        );

        if (!res.data?.success) {
          Swal.fire({
            icon: "warning",
            title: "Warning",
            text: res.data?.message || "No FIFO data found.",
          });
          setFifoRows([]);
          return;
        }

        const records = (res.data.values || []).map((item) => ({
          ...item,
          id: item.LayerID, // stable key
          INMOpenQty: item.OpenQty,
          RActPrice: item.CalcPrice,
          IVLTransSe: item.TransSe,
        }));

        fifoCacheRef.current.set(rowKey, records);
        fifoLayersMap.current.set(rowKey, records);
        setFifoRows(records);
      } catch (error) {
        console.error("❌ FIFO fetch failed:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch FIFO layers.",
        });
      } finally {
        setIsLoading(false); // ✅ always stop loader
      }
    },
    [SaveUpdateName],
  );
  // Add SaveUpdateName as dependency
  const handleRowClick = useCallback(
    (params) => {
      loadFifoForRow(params.row);
    },
    [loadFifoForRow],
  );
  const handleCellKeyDown = (params, event) => {
    const api = apiRef.current;
    if (!api) return;
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);

    //   const rowIndex = getValues("oLines").findIndex(
    //   (r) => r.id === params.id
    // )
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;

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

    if (api.getCellMode(params.id, params.field) === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
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
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // ✅ Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);

    // // Start edit mode if editable
    // const nextCellParams = api.getCellParams(nextId, nextField);
    // if (nextCellParams.isEditable) {
    //   setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    // }
  };
  const processRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...oldRow, ...newRow };

    // Disable editing for FIFO or UPDATE
    if (updatedRow.EvalSystem === "FIFO" || SaveUpdateName === "UPDATE") {
      return oldRow;
    }

    updatedRow.Price = Math.max(Number(updatedRow.Price || 0), 0);

    const updatedLines = getValues("oLines").map((line, i) =>
      i === oldRow.id ? updatedRow : line,
    );

    reset({
      ...getValues(),
      oLines: updatedLines,
    });

    return updatedRow;
  };
  const processFifoRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...oldRow, ...newRow };

    // Update fifoRows state
    setFifoRows((prev) =>
      prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
    );

    // Update the global map if activeRowKey exists
    if (activeRowKey) {
      const updatedLayers = fifoRows.map((r) =>
        r.id === updatedRow.id ? updatedRow : r,
      );
      fifoLayersMap.current.set(activeRowKey, updatedLayers);
    }

    return updatedRow;
  };

  const handleFifoCellKeyDown = (params, event) => {
    const api = fifoApiRef.current;
    if (!api) return;
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;

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

    if (api.getCellMode(params.id, params.field) === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
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
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);

    // Start edit mode if editable
    const nextCellParams = api.getCellParams(nextId, nextField);
    if (nextCellParams.isEditable) {
      setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    }
  };
  // const fetchgetListDataAccount = async (pageNum, searchTerm = "") => {
  //   try {
  //     // const url = searchTerm
  //     //   ? `/ChartOfAccounts/Search/${searchTerm}/1/${pageNum}/20`
  //     //   : `/ChartOfAccounts/Pages/1/${pageNum}/20`;
  //     // const response = await apiClient.get(url);
  //     let response = await apiClient.get(
  //       `ChartOfAccounts?Status=1&Page=${pageNum}&Limit=20&SearchText=${searchTerm}&LocManTran=N&Postable=Y`
  //     );
  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       if (newData.length > 0) {
  //         setValue("AcctCode", newData[0]?.AcctCode || "");
  //       }
  //       sethasMoreGetListAccount(newData.length === 20);
  //       setgetListDataAccount((prev) =>
  //         pageNum === 0 ? newData : [...prev, ...newData]
  //       );
  //       setgetListPageAccount(pageNum);
  //     }
  //   } catch (error) {
  //     // Cancel Token
  //     console.log(error);
  //   }
  // };
  const timeoutRef = useRef(null);
  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const perms = usePermissions(92);
  const { user } = useAuth();

  const initial = {
    DocNum: "",
    Series: "",
    JrnlMemo: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD "),
    TaxDate: dayjs(undefined).format("YYYY-MM-DD "),
    RevalType: "P",
    oLines: [],
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };

  //=======================================UseForm====================================================
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    clearErrors,
  } = useForm({
    defaultValues: initial,
  });
  const revalType = watch("RevalType");
  const ClearForm = () => {
    reset({
      ...initial,
      oLines: [], // <-- THIS FIXES EVERYTHING
    });
    setSelectedRowMap({});
    setFifoRows([]);
    fifoLayersMap.current.clear();

    // setSelectedRows([]);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    setItemCache({});

    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
  };

  const { isDirty } = useFormState({ control });

  //====================================Open List Data==========================================
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
  // Clear search
  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear search input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };
  // Infinite scroll fetch more data
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };
  const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true); // 🔄 start loader

      const params = {
        Status: 1,
        Page: pageNum,
        Limit: 20,
        ...(searchTerm?.trim() && { SearchText: searchTerm.trim() }),
      };

      const response = await apiClient.get("/InventoryRevaluation", { params });

      if (response.data?.success) {
        const newData = response.data.values || [];

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: response.data?.message || "No records found.",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching Inventory Revaluation:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Inventory Revaluation data.",
      });
    } finally {
      setIsLoading(false); // ✅ always stop loader
    }
  };

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  // ===============API for Setting specific Cards data====================================
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      // await setbusinessPartner(CardCode, CntctCode);
      if (isDirty || "UPDATE" === ok) {
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
          setSelectedData(DocEntry);
          setInventoryRevaluationDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setInventoryRevaluationDataList(DocEntry);
        setSaveUpdateName("UPDATE");
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
  const setInventoryRevaluationDataList = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/InventoryRevaluation?DocEntry=${DocEntry}`,
      );
      const data = response.data.values;

      if (data && data.oLines) {
        const newFifoMap = new Map();

        const formattedLines = data.oLines.map((line) => {
          const fifoKey = `${line.ItemCode}_${line.WHSCode}`;

          // ✅ Store FIFO layers back into map (only for FIFO items)
          if (line.EvalSystem === "F" && line.oFIFOLayersLines?.length) {
            newFifoMap.set(fifoKey, line.oFIFOLayersLines);
          }

          return {
            ...line,
            id: line.LineNum,
            EvalSystem:
              line.EvalSystem === "A"
                ? "Moving Average"
                : line.EvalSystem === "S"
                  ? "Standard"
                  : line.EvalSystem === "F"
                    ? "FIFO"
                    : "",
          };
        });

        // 🔥 IMPORTANT: Update the global FIFO map
        fifoLayersMap.current = newFifoMap;

        // 🆕 NEW: Define updatedData here (before using it)
        const updatedData = { ...data, oLines: formattedLines };

        // 🆕 NEW: Automatically set activeRowKey and fifoRows for the FIRST FIFO item
        let firstFifoKey = null;
        for (const line of formattedLines) {
          if (line.EvalSystem === "FIFO") {
            firstFifoKey = `${line.ItemCode}_${line.WHSCode}`;
            break; // Stop at the first FIFO item
          }
        }

        if (firstFifoKey) {
          setActiveRowKey(firstFifoKey);
          const layers = fifoLayersMap.current.get(firstFifoKey) || [];
          const rowsWithId = layers.map((row, index) => ({
            ...row,
            id: `${firstFifoKey}_${row.LineNum}_${index}`,
          }));
          setFifoRows(rowsWithId);
        } else {
          // No FIFO items: Reset to empty
          setActiveRowKey(null);
          setFifoRows([]);
        }

        toggleDrawer();
        reset(updatedData); // Now updatedData is defined
        setSaveUpdateName("UPDATE");
        setSelectedData(DocEntry);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: error || "An error occurred while fetching the data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };
  //========================================Document Series API===========================
  const { DocSeries } = useDocumentSeries(
    "162",
    getValues("DocDate"),
    setValue,
    clearCache,
    SaveUpdateName,
  );

  useEffect(() => {
    fetchgetListDataAccount(0);
    fetchgetListDataDecAccount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //======================================= Search Item Modal=====================================
  const modelColumns = [
    // {
    //   id: 1,
    //   field: "id",
    //   headerName: "Sr/No",
    //   width: 60,
    //   editable: true,
    // },
    {
      id: 1,
      field: "ItemCode",
      headerName: "Item Code",
      width: 150,
      editable: true,
    },
    {
      id: 2,
      field: "ItemName",
      headerName: "Item Description",
      width: 150,
      editable: true,
    },
    // {
    //   field: "QTY",
    //   headerName: "QUANTITY",
    //   width: 120,
    //   editable: true,
    // },
    // {
    //   field: "Price",
    //   headerName: "Price",
    //   width: 120,
    //   editable: true,
    // },
    {
      field: "DefaultWhs",
      headerName: "WHSCODE",
      width: 120,
      editable: true,
    },
    {
      field: "OnHand",
      headerName: "IN STOCK",
      width: 100,
      sortable: false,
    },
    {
      field: "IsCommited",
      headerName: "RESERVE",
      width: 100,
      sortable: false,
    },
    {
      field: "OnOrder",
      headerName: "ORDERED",
      width: 100,
      sortable: false,
    },
  ];
  const selectedRows = useMemo(
    () => Object.values(selectedRowMap),
    [selectedRowMap],
  );
  const handleCellClick = (newSelection) => {
    setSelectedRowMap((prev) => {
      const updated = { ...prev };

      // Add newly selected rows from current page
      newSelection.forEach((id) => {
        const row = itemList.find((item) => item.DocEntry === id);
        if (row) {
          updated[id] = row;
        }
      });

      // Remove unselected rows from THIS PAGE only
      itemList.forEach((item) => {
        if (!newSelection.includes(item.DocEntry)) {
          delete updated[item.DocEntry];
        }
      });

      return updated;
    });
  };
  const getDefaultGLAccounts = () => {
    if (!GLAcctDeterminationData?.length) return null;

    // assuming only one active determination
    const active = GLAcctDeterminationData.find((x) => x.Status === "1");

    if (!active) return null;

    return {
      inc: active.IncresGlAc || "",
      dec: active.DecresGlAc || "",
    };
  };

  const onSubmit = () => {
    if (!selectedRows.length) {
      Swal.fire(
        "No items selected!",
        "Please select at least one item.",
        "warning",
      );
      return;
    }

    const existingLines = getValues("oLines") || [];
    const glDefaults = getDefaultGLAccounts(); // ✅ always fresh

    const newItems = selectedRows.filter(
      (item) => !existingLines.some((line) => line.ItemCode === item.ItemCode),
    );

    const formattedItems = newItems.map((item) => {
      let RIncmAcct = glDefaults?.inc || "";
      let RDcrmAcct = glDefaults?.dec || "";
      let RActPrice = "";

      // 🔹 Warehouse-based override
      if (item.oInvntLines?.length > 0) {
        const defaultWhsLine = item.oInvntLines.find(
          (line) => line.WHSCode === item.DefaultWhs,
        );

        if (defaultWhsLine) {
          if (defaultWhsLine.IncresGlAc && defaultWhsLine.IncresGlAc !== "0") {
            RIncmAcct = defaultWhsLine.IncresGlAc;
          }

          if (defaultWhsLine.DecresGlAc && defaultWhsLine.DecresGlAc !== "0") {
            RDcrmAcct = defaultWhsLine.DecresGlAc;
          }

          if (defaultWhsLine.AvgPrice && defaultWhsLine.AvgPrice !== "0") {
            RActPrice = defaultWhsLine.AvgPrice;
          }
        }
      }

      return {
        id: item.DocEntry,
        ItemCode: item.ItemCode,
        Dscription: item.ItemName,
        WHSCode: item.DefaultWhs,
        GLMethod: item.GLMethod,
        RActPrice,
        UnitMsr: item.UOMCode,
        ROnHand: getOnHandByWhs(item, item.DefaultWhs),
        RIncmAcct,
        RDcrmAcct,
        EvalSystem:
          item.EvalSystem === "A"
            ? "Moving Average"
            : item.EvalSystem === "S"
              ? "Standard"
              : item.EvalSystem === "F"
                ? "FIFO"
                : "",
        PROJECT: "",
        expanded: false,
      };
    });

    setValue("oLines", [...existingLines, ...formattedItems]);
    closeModel();
  };

  const handleClickOpen = () => {
    fetchItems(0, "");
    setOpen(true);
  };
  const closeModel = () => {
    setOpen(false);
  };

  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;
      // Use cache if exists
      if (itemCache[cacheKey]) {
        setItemList(itemCache[cacheKey]);
        return;
      }
      try {
        setIsLoading(true);

        const { data } = await apiClient.get(`/ItemsV2`, {
          params: {
            InventoryItem: "Y",
            Status: 1,
            SearchText: search,
            Page: page,
            Limit: LIMIT,
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
            page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;
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
    [itemCache],
  );
  useEffect(() => {
    fetchItems(currentPage, searchText);
  }, [currentPage, searchText, fetchItems]);
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

  //=======================================GL Increase Acct Modal=======================================
  const OpenDailogIncAcct = () => setsearchmodelOpenAccount(true);
  const SearchModelCloseAccount = () => setsearchmodelOpenAccount(false);

  const handleGetListClearAccount = () => {
    setgetListqueryAccount("");
    setgetListSearchingAccount(false);
    setgetListPageAccount(0);
    setgetListDataAccount([]);
    fetchgetListDataAccount(0);
  };
  const handleGetListSearch2 = (res) => {
    setgetListqueryAccount(res);
    setgetListSearchingAccount(true);
    setgetListPageAccount(0);
    setgetListDataAccount([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataAccount(0, res);
    }, TimeDelay);
  };
  const fetchMoregetListDataAccount = () => {
    fetchgetListDataAccount(
      getListPageAccount + 1,
      getListSearchingAccount ? getListqueryAccount : "",
    );
  };
  const fetchgetListDataAccount = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true); // 🔄 start loader

      // Build query parameters dynamically
      const query = new URLSearchParams({
        Status: 1,
        Page: pageNum,
        Limit: 20,
        LocManTran: "N",
        Postable: "Y",
      });

      if (searchTerm?.trim()) {
        query.append("SearchText", searchTerm.trim());
      }

      const url = `/ChartOfAccounts?${query.toString()}`;
      const response = await apiClient.get(url);

      if (response.data?.success) {
        const newData = response.data.values || [];

        // Optional: auto-set AcctCode
        if (newData.length > 0) {
          setValue("AcctCode", newData[0]?.AcctCode || "");
        }

        sethasMoreGetListAccount(newData.length === 20);
        setgetListDataAccount((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageAccount(pageNum);
      } else {
        // 🔴 API responded but success = false
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: response.data?.message || "Failed to fetch account list.",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching ChartOfAccounts:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching accounts.",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const GLAcctData = async () => {
    try {
      setIsLoading(true); // 🔄 start loader

      const res = await apiClient.get("/GLAccDetermination/All");

      if (res.data?.success) {
        const data = res.data.values || [];
        setGLAcctDeterminationData(data);
      } else {
        // 🔴 API responded but success = false
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text:
            res.data?.message ||
            "Failed to fetch GL Account Determination data.",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching GL Account Determination:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching GL Account Determination.",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const handleSelectIncreaseAccount = (selectedAccount) => {
    const rowIndex = getValues("selectedRowIndex");
    const oLines = [...getValues("oLines")];
    const selectedCode = selectedAccount.AcctCode;

    // Check if the same account is already set as Decrease Account
    if (oLines[rowIndex]?.RDcrmAcct === selectedCode) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Selection",
        text: "G/L Decrease Acct and G/L Increase Acct cannot be the same.",
      });
      return;
    }

    oLines[rowIndex].RIncmAcct = selectedCode;
    setValue("oLines", oLines);
    setsearchmodelOpenAccount(false);
  };
  //=====================================GL Decrease Acct Modal========================================
  const OpenDailogIncDecAccount = () => setsearchmodelOpenDecAccount(true);
  const SearchModelCloseDecAccount = () => setsearchmodelOpenDecAccount(false);

  const handleGetListClearDecAccount = () => {
    setgetListqueryDecAccount("");
    setgetListSearchingDecAccount(false);
    setgetListPageDecAccount(0);
    setgetListDataDecAccount([]);
    fetchgetListDataDecAccount(0);
  };
  const handleGetListSearchDecAccount = (res) => {
    setgetListqueryDecAccount(res);
    setgetListSearchingDecAccount(true);
    setgetListPageDecAccount(0);
    setgetListDataDecAccount([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataDecAccount(0, res);
    }, TimeDelay);
  };
  const fetchMoregetListDataDecAccount = () => {
    fetchgetListDataDecAccount(
      getListPageDecAccount + 1,
      getListSearchingDecAccount ? getListqueryDecAccount : "",
    );
  };
  const fetchgetListDataDecAccount = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true); // 🔄 start loader

      // Build query parameters dynamically
      const query = new URLSearchParams({
        Status: 1,
        Page: pageNum,
        Limit: 20,
        LocManTran: "N",
        Postable: "Y",
      });

      if (searchTerm?.trim()) {
        query.append("SearchText", searchTerm.trim());
      }

      const url = `/ChartOfAccounts?${query.toString()}`;
      const response = await apiClient.get(url);

      if (response.data?.success) {
        const newData = response.data.values || [];

        if (newData.length > 0) {
          setValue("AcctCode", newData[0]?.AcctCode || "");
        }

        sethasMoreGetListDecAccount(newData.length === 20);
        setgetListDataDecAccount((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageDecAccount(pageNum);
      } else {
        // 🔴 API responded but success = false
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text:
            response.data?.message || "Failed to fetch Decrease Account list.",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching Decrease Accounts:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching Decrease Accounts.",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const handleSelectDecreaseAccount = (selectedAccount) => {
    const rowIndex = getValues("selectedRowIndex");
    const oLines = [...getValues("oLines")];
    const selectedCode = selectedAccount.AcctCode;

    // Check if the same account is already set as Increase Account
    if (oLines[rowIndex]?.RIncmAcct === selectedCode) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Selection",
        text: "G/L Decrease Acct and G/L Increase Acct cannot be the same.",
      });
      return;
    }

    oLines[rowIndex].RDcrmAcct = selectedCode;
    setValue("oLines", oLines);
    setsearchmodelOpenDecAccount(false);
  };

  //================================Main Datagrid===========================================
  const handleDeleteRow = (index) => {
    const oLines = [...getValues("oLines")]; // clone current list (important for immutability)
    oLines.splice(index, 1); // remove the row by index
    setValue("oLines", oLines); // update the form state
  };
  // const PriceChangecolumns = [
  //   { field: "ItemCode", headerName: "ITEM NO", width: 150 },
  //   {
  //     field: "Dscription",
  //     headerName: "ITEM DESC",
  //     width: 200,
  //     editable: true,
  //   },
  //   {
  //     field: "WHSCode",
  //     headerName: "WhsCode",
  //     width: 200,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => {
  //       const index = params.row.id; // important: matches oLines[index]
  //       return (
  //         <Controller
  //           name={`oLines.${index}.WHSCode`} // ✅ correct path
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               {...field}
  //               value={field.value || ""}
  //               error={!!error}
  //               helperText={error?.message}
  //               disabled
  //               InputProps={{
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         setValue("selectedRowIndex", index);
  //                         setWhscOpen(true);
  //                       }}
  //                       size="small"
  //                       color="primary"
  //                       disabled={SaveUpdateName === "UPDATE"}
  //                       style={{
  //                         backgroundColor:
  //                           SaveUpdateName === "UPDATE" ? "#BDBDBD" : "green",
  //                         borderRadius: "10%",
  //                         color: "white",
  //                         padding: 2,
  //                       }}
  //                     >
  //                       <ViewListIcon />
  //                     </IconButton>
  //                   </InputAdornment>
  //                 ),
  //               }}
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },
  //   {
  //     field: "RActPrice",
  //     headerName: "CURRENT COST",
  //     sortable: false,
  //     editable: false,
  //     width: 150,
  //   },
  //   {
  //     field: "Price",
  //     headerName: "NEW COST",
  //     sortable: false,
  //     width: 150,
  //     renderCell: (params) => {
  //       const index = params.row.id;
  //       const isFIFO = params.row.EvalSystem === "FIFO";
  //       return (
  //         <Controller
  //           name={`oLines.${index}.Price`}
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextField
  //               {...field}
  //               type="number"
  //               inputProps={{ maxLength: 19 }}
  //               value={field.value || ""}
  //               disabled={isFIFO || SaveUpdateName === "UPDATE"}
  //               onChange={(e) => field.onChange(e.target.value)}
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },
  //   // {
  //   //   field: "UnitMsr",
  //   //   headerName: "UoM CODE",
  //   //   width: 150,
  //   //   editable: true,
  //   // },
  //   {
  //     field: "ROnHand",
  //     headerName: "IN STOCK",
  //     width: 150,
  //     editable: false,
  //   },
  //   {
  //     field: "RIncmAcct",
  //     headerName: "G/L INCREASE ACCT",
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name="RIncmAcct"
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextSearchButtonTable
  //               disabled={SaveUpdateName === "UPDATE"}
  //               onClick={() => {
  //                 setValue("selectedRowIndex", params.row.id);
  //                 OpenDailogIncAcct();
  //               }}
  //               {...field}
  //               value={params.row.RIncmAcct} // Set default if empty
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },

  //   {
  //     field: "RDcrmAcct",
  //     headerName: "G/L DECREASE ACCT",
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name="RDcrmAcct"
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextSearchButtonTable
  //               disabled={SaveUpdateName === "UPDATE"}
  //               onClick={() => {
  //                 setValue("selectedRowIndex", params.row.id);
  //                 OpenDailogIncDecAccount();
  //               }}
  //               {...field}
  //               value={params.row.RDcrmAcct} // Set default if empty
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },
  //   {
  //     field: "EvalSystem",
  //     headerName: "VALUATION METHOD",
  //     sortable: false,
  //     width: 150,
  //   },
  //   {
  //     field: "actions",
  //     headerName: "ACTION",
  //     width: 120,
  //     sortable: false,
  //     align: "center",
  //     headerAlign: "center",
  //     renderCell: (params) => {
  //       const index = params.row.id;
  //       return (
  //         <IconButton
  //           color="error"
  //           onClick={() => handleDeleteRow(index)}
  //           size="small"
  //         >
  //           <DeleteIcon />
  //         </IconButton>
  //       );
  //     },
  //   },
  // ];
  const PriceChangecolumns = [
    { field: "ItemCode", headerName: "ITEM NO", width: 150 },

    {
      field: "Dscription",
      headerName: "ITEM DESC",
      width: 200,
      editable: true,
    },

    // ---------------- WHS CODE ----------------
    {
      field: "WHSCode",
      headerName: "WhsCode",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const disabled = SaveUpdateName === "UPDATE";

        return (
          <Grid container alignItems="center" justifyContent="center" gap={0.5}>
            <Grid item xs>
              <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                {params.row.WHSCode || ""}
              </Typography>
            </Grid>

            <Grid item>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  setWhscOpen(true);
                }}
                sx={{
                  backgroundColor: disabled ? "#BDBDBD" : "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    // ---------------- CURRENT COST ----------------
    {
      field: "RActPrice",
      headerName: "CURRENT COST",
      width: 150,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    // ---------------- NEW COST (editable) ----------------
    {
      field: "Price",
      headerName: "NEW COST",
      width: 150,
      type: "number",
      editable: true,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    // ---------------- IN STOCK ----------------
    {
      field: "ROnHand",
      headerName: "IN STOCK",
      width: 150,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    // ---------------- G/L INCREASE ACCT ----------------
    {
      field: "RIncmAcct",
      headerName: "G/L INCREASE ACCT",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const disabled = SaveUpdateName === "UPDATE";

        return (
          <Grid container alignItems="center" justifyContent="center" gap={0.5}>
            <Grid item xs>
              <Typography noWrap sx={{ fontSize: 13 }}>
                {params.row.RIncmAcct || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  OpenDailogIncAcct();
                }}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    // ---------------- G/L DECREASE ACCT ----------------
    {
      field: "RDcrmAcct",
      headerName: "G/L DECREASE ACCT",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const disabled = SaveUpdateName === "UPDATE";

        return (
          <Grid container alignItems="center" justifyContent="center" gap={0.5}>
            <Grid item xs>
              <Typography noWrap sx={{ fontSize: 13 }}>
                {params.row.RDcrmAcct || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  OpenDailogIncDecAccount();
                }}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    // ---------------- VALUATION METHOD ----------------
    {
      field: "EvalSystem",
      headerName: "VALUATION METHOD",
      width: 150,
      editable: false,
    },

    // ---------------- ACTION ----------------
    {
      field: "actions",
      headerName: "ACTION",
      width: 120,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          color="error"
          size="small"
          onClick={() => handleDeleteRow(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const DebCredcolumns = [
    { field: "ItemCode", headerName: "ITEM NO", width: 150 },

    {
      field: "Dscription",
      headerName: "ITEM DESC",
      width: 200,
      editable: true,
    },

    // ---------------- WHS CODE ----------------
    {
      field: "WHSCode",
      headerName: "WhsCode",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const disabled = SaveUpdateName === "UPDATE";

        return (
          <Grid container alignItems="center" justifyContent="center" gap={0.5}>
            <Grid item xs>
              <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                {params.row.WHSCode || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  setWhscOpen(true);
                }}
                sx={{
                  backgroundColor: disabled ? "#BDBDBD" : "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    // ---------------- QUANTITY ----------------
    {
      field: "Quantity",
      headerName: "QUANTITY",
      width: 150,
      type: "number",
      editable: true,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    // ---------------- DEBIT / CREDIT ----------------
    {
      field: "RToStock",
      headerName: "DEBIT / CREDIT",
      width: 150,
      type: "number",
      editable: true,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    // ---------------- IN STOCK ----------------
    {
      field: "ROnHand",
      headerName: "IN STOCK",
      width: 150,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    // ---------------- UOM ----------------
    {
      field: "UnitMsr",
      headerName: "UoM CODE",
      width: 150,
      editable: false,
    },

    // ---------------- G/L INCREASE ACCT ----------------
    {
      field: "RIncmAcct",
      headerName: "G/L INCREASE ACCT",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const disabled = SaveUpdateName === "UPDATE";

        return (
          <Grid container alignItems="center" gap={0.5}>
            <Grid item xs>
              <Typography noWrap sx={{ fontSize: 13 }}>
                {params.row.RIncmAcct || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  OpenDailogIncAcct();
                }}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    // ---------------- G/L DECREASE ACCT ----------------
    {
      field: "RDcrmAcct",
      headerName: "G/L DECREASE ACCT",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const disabled = SaveUpdateName === "UPDATE";

        return (
          <Grid container alignItems="center" gap={0.5}>
            <Grid item xs>
              <Typography noWrap sx={{ fontSize: 13 }}>
                {params.row.RDcrmAcct || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  OpenDailogIncDecAccount();
                }}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    // ---------------- VALUATION METHOD ----------------
    {
      field: "EvalSystem",
      headerName: "VALUATION METHOD",
      width: 150,
      editable: false,
    },

    // ---------------- ISSUED LAYER (checkbox) ----------------
    {
      field: "IssuedLayer",
      headerName: "ISSUED LAYER",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const disabled =
          params.row.EvalSystem === "FIFO" || SaveUpdateName === "UPDATE";

        return (
          <Checkbox
            checked={!!params.row.IssuedLayer}
            disabled={disabled}
            onChange={(e) => {
              const updatedRow = {
                ...params.row,
                IssuedLayer: e.target.checked,
              };

              const updatedLines = getValues("oLines").map((line, i) =>
                i === params.row.id ? updatedRow : line,
              );

              reset({
                ...getValues(),
                oLines: updatedLines,
              });
            }}
          />
        );
      },
    },

    // ---------------- ACTION ----------------
    {
      field: "actions",
      headerName: "ACTION",
      width: 120,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          color="error"
          size="small"
          onClick={() => handleDeleteRow(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const oLines = watch("oLines") || []; // 👈 reactively watch rows

  useEffect(() => {
    // When revaluation type changes, reset rows immediately
    if (SaveUpdateName === "SAVE") {
      if (revalType) {
        setValue("oLines", []); // clear the existing rows
        // setSelectedRows([]);
        setFifoRows([]);
        fifoLayersMap.current.clear();
        setSelectedRowMap({});
        setItemCache({});
        // ClearForm();
      }
    }
  }, [revalType, setValue]); // include setValue in dependency

  // ======================WHSCode Logic=============================
  const fetchWhscGetListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/WarehouseV2/search/${searchTerm}/1/${pageNum}`,
        );
      } else {
        response = await apiClient.get(`/WarehouseV2/pages/1/${pageNum}`);
      }

      if (response.data.success) {
        const newData = response.data.values;
        setWhsHasMoreGetList(newData.length === 20);
        setWhscGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else if (response.data.success === false) {
        Swal.fire({
          text: response.data.message,

          icon: "question",
          confirmButtonText: "YES",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.fire({
        text: error,
        icon: "question",
        confirmButtonText: "YES",
        showConfirmButton: true,
      });
    }
  };
  const handleWhscGetListSearch = (res) => {
    setWhsGetListQuery(res);
    setWhsGetListSearching(true);
    setWhsGetListPage(0);
    setWhscGetListData([]);
    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchWhscGetListData(0, res);
    }, 600);
  };
  const handleWhscGetListClear = () => {
    setWhsGetListQuery("");
    setWhsGetListSearching(true);
    setWhsGetListPage(0); // Reset page to 0
    setWhscGetListData([]); // Clear current data
    fetchWhscGetListData(0); // Fetch first page without search
  };
  const fetchWhscMoreGetListData = () => {
    fetchWhscGetListData(
      WhsgetListPage + 1,
      WhsgetListSearching ? WhsrgetListquery : "",
    );
    setWhsGetListPage((prev) => prev + 1);
  };
  const getOnHandByWhs = (item, whsCode) => {
    if (!item || !item.oInvntLines) return 0;
    const matchedLine = item.oInvntLines.find(
      (line) => line.WHSCode === whsCode,
    );
    return matchedLine ? Number(matchedLine.OnHand) : 0;
  };
  const handleWhsSelect = (selectedWhs) => {
    const rowIndex = getValues("selectedRowIndex");
    const oLines = [...getValues("oLines")];
    const currentRow = oLines[rowIndex];

    // Find the original item (from selectedRows)
    const currentItem = selectedRows.find(
      (item) => item.ItemCode === currentRow.ItemCode,
    );

    // Update WHSCode
    oLines[rowIndex].WHSCode = selectedWhs.WHSCode;

    // Update ROnHand
    const matchedLine = currentItem?.oInvntLines?.find(
      (line) => line.WHSCode === selectedWhs.WHSCode,
    );
    oLines[rowIndex].ROnHand = matchedLine ? Number(matchedLine.OnHand) : 0;
    oLines[rowIndex].RActPrice = matchedLine ? Number(matchedLine.AvgPrice) : 0;

    // 🔹 If GLMethod = "W", update Increase/Decrease accounts per warehouse
    if (currentRow.GLMethod === "W" && matchedLine) {
      oLines[rowIndex].RIncmAcct = matchedLine.IncresGlAc || "";
      oLines[rowIndex].RDcrmAcct = matchedLine.DecresGlAc || "";
    }

    // 🔹 If GLMethod = "C", keep header-level accounts as is (no change)
    // Do nothing — the default from header already set in onSubmit

    setValue("oLines", oLines);
    loadFifoForRow(currentRow);

    setWhscOpen(false);
  };
  useEffect(() => {
    fetchWhscGetListData(0); // Load first page on mount
    GLAcctData();
  }, []);
  useEffect(() => {
    console.log("Main DataGrid (oLines):", oLines);

    oLines.forEach((line) => {
      if (line.EvalSystem === "FIFO") {
        const fifoKey = `${line.ItemCode}_${line.WHSCode}`;
        const fifoLayers = fifoLayersMap.current.get(fifoKey) || [];
        console.log(`FIFO Rows for ${fifoKey}:`, fifoLayers);
      }
    });
  }, [oLines, fifoLayersMap]);
  //================================POST and PUT========================================
  const handleSubmitForm = async (data) => {
    if (Array.isArray(data.oLines) && data.oLines.length > 0) {
      for (let i = 0; i < data.oLines.length; i++) {
        const line = data.oLines[i];
        const missingFields = [];

        const isFIFO = line.EvalSystem === "FIFO" || line.EvalSystem === "F";

        // =========================
        // PRICE CHANGE (P)
        // =========================
        if (revalType === "P") {
          if (!line.RIncmAcct) missingFields.push("G/L Increase Acct");
          if (!line.RDcrmAcct) missingFields.push("G/L Decrease Acct");
          if (!line.EvalSystem) missingFields.push("Valuation Method");

          // 🔥 New Cost required ONLY when NOT FIFO
          if (!isFIFO && (!line.Price || Number(line.Price) <= 0)) {
            missingFields.push("New Cost");
          }
        }

        // =========================
        // MANUAL REVALUATION (M)
        // =========================
        else if (revalType === "M") {
          if (!line.RIncmAcct) missingFields.push("G/L Increase Acct");
          if (!line.RDcrmAcct) missingFields.push("G/L Decrease Acct");
          if (!line.EvalSystem) missingFields.push("Valuation Method");

          // 🔥 Quantity & Debit/Credit ONLY when NOT FIFO
          if (!isFIFO) {
            if (!line.Quantity || Number(line.Quantity) <= 0)
              missingFields.push("Quantity");

            if (!line.RToStock || Number(line.RToStock) <= 0)
              missingFields.push("Debit/Credit");
          }
        }

        // =========================
        // ERROR POPUP
        // =========================
        if (missingFields.length > 0) {
          Swal.fire({
            title: "Validation Error!",
            text: `Line ${
              i + 1
            }: Please fill the following required field(s): ${missingFields.join(
              ", ",
            )}`,
            icon: "warning",
            confirmButtonText: "Ok",
          });
          return; // ⛔ stop submission
        }
      }
    } else {
      Swal.fire({
        title: "No Lines Found!",
        text: "Please add at least one line before saving.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    const obj = {
      DocEntry: data.DocEntry || 0,
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: "1",
      // data.Status === "Open"
      //   ? 1
      //   : data.Status === "Closed"
      //   ? 0
      //   : data.Status === "Cancelled"
      //   ? 3
      //   : 0,
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      DocNum: data.DocNum || "",
      Comments: data.Comments || "",
      JrnlMemo: data.JrnlMemo || "",
      TransId: data.TransId || 0,
      RevalType: data.RevalType || "",
      Series: data.Series || 0,
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
      StationID: data.StationID || 0,
      RIncmAcct: data.RIncmAcct || "",
      RExpnAcct: data.RExpnAcct || "",
      ObjType: "162", // your object type for inventory revaluation
      SeqCode: data.SeqCode || 0,
      Serial: data.Serial || 0,
      SeriesStr: data.SeriesStr || "",
      SubStr: data.SubStr || "",
      InflaReval: data.InflaReval || "",
      CardCode: data.CardCode || "",
      CardName: data.CardName || "",
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      // Lines
      oLines: (data.oLines || []).map((line, i) => {
        const isFIFO = line.EvalSystem === "FIFO" || line.EvalSystem === "F";
        const fifoKey = `${line.ItemCode}_${line.WHSCode}`;
        let fifoLayers = isFIFO ? fifoLayersMap.current.get(fifoKey) || [] : [];

        // 🔥 Filter FIFO layers based on revalType
        if (revalType === "P") {
          fifoLayers = fifoLayers.filter((layer) => Number(layer.Price) > 0);
        } else if (revalType === "M") {
          fifoLayers = fifoLayers.filter(
            (layer) =>
              Number(layer.Quantity) > 0 && Number(layer.LineTotal) > 0,
          );
        }

        const lineRToStock =
          revalType === "P"
            ? (Number(line.RActPrice || 0) - Number(line.Price || 0)) *
              Number(line.ROnHand || 0)
            : Number(line.RToStock || 0);
        return {
          LineNum: line.LineNum || "0",
          DocEntry: data.DocEntry || 0,
          UserId: user.UserId,
          CreatedBy: user.UserName,
          CreatedDate: dayjs().format("YYYY-MM-DD"),
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          Status: "1",
          // String(line.Status) === "1" ||
          // String(line.Status) === "0" ||
          // String(line.Status) === "3"
          //   ? Number(line.Status)
          //   : 0,
          ItemCode: line.ItemCode || "",
          Dscription: line.Dscription || "",
          Quantity: Number(line.Quantity) || 0,
          Price: Number(line.Price) || 0,
          LineTotal: Number(line.RToStock) || 0,
          WHSCode: line.WHSCode || "",
          RIncmAcct: line.RIncmAcct || "",
          RDcrmAcct: line.RDcrmAcct || "",
          RToStock: lineRToStock,
          RActPrice: Number(line.RActPrice) || 0,
          ROnHand: Number(line.ROnHand) || 0,
          ObjType: "162",
          EvalSystem:
            line.EvalSystem === "Moving Average"
              ? "A"
              : line.EvalSystem === "Standard"
                ? "S"
                : line.EvalSystem === "FIFO"
                  ? "F"
                  : "",
          UnitMsr: line.UnitMsr || "",
          oFIFOLayersLines: fifoLayers.map((layer) => {
            let fifoRToStock = 0;
            let fifoPrice = Number(layer.Price || 0);

            // =============================
            // 🔥 FIFO CALCULATIONS
            // =============================

            // 1️⃣ Price Change (P)
            if (revalType === "P") {
              fifoRToStock =
                (Number(layer.RActPrice || 0) - Number(layer.Price || 0)) *
                Number(line.ROnHand || 0); // 👈 parent item ROnHand
            } else {
              fifoRToStock = Number(layer.LineTotal || 0);
            }

            // 2️⃣ Manual Reval (M)
            if (revalType === "M") {
              fifoPrice =
                Number(layer.INMOpenQty || 0) > 0
                  ? (Number(layer.OpenValue || 0) +
                      Number(layer.LineTotal || 0)) /
                    Number(layer.INMOpenQty)
                  : 0;
            } else {
              fifoPrice = Number(layer.Price || 0);
            }

            return {
              LineNum: layer.LineNum || 0,
              DocEntry: data.DocEntry || 0,
              UserId: user.UserId,
              CreatedBy: user.UserName,
              CreatedDate: dayjs().format("YYYY-MM-DD"),
              ModifiedBy: user.UserName,
              ModifiedDate: dayjs().format("YYYY-MM-DD"),
              Status: 1,
              BaseLine: layer.BaseLine || 0,
              Quantity: Number(layer.Quantity) || 0, // User-edited for Debit/Credit
              Price: fifoPrice,
              LineTotal: Number(layer.LineTotal) || 0, // User-edited for Debit/Credit
              RToStock: fifoRToStock,
              RActPrice: Number(layer.RActPrice) || 0,
              INMTransNm: layer.INMTransNm || 0,
              INMInst: layer.INMInst || 0,
              INMTransTy: layer.INMTransTy || 0,
              INMCreatBy: layer.INMCreatBy || 0,
              INMBaseRef: layer.INMBaseRef || "",
              INMDocDate: layer.INMDocDate || dayjs().format("YYYY-MM-DD"),
              INMOpenQty: Number(layer.INMOpenQty) || 0,
              ObjType: "162",
              IVLTransSe: layer.IVLTransSe || 0,
              INMLineNum: layer.INMLineNum || 0,
              INMSubLine: layer.INMSubLine || 0,
            };
          }),
          oSNBLinesCollection: [], // Assuming no changes needed here
        };
      }),
    };

    console.log("=====", obj);
    try {
      setIsLoading(true); // 🔄 START LOADER

      // =========================
      // SAVE
      // =========================
      if (SaveUpdateName === "SAVE") {
        const res = await apiClient.post(`/InventoryRevaluation`, obj);

        if (!res.data?.success) {
          Swal.fire({
            icon: "warning",
            title: "Error",
            text: res.data?.message || "Save failed",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Inventory Revaluation saved successfully",
          timer: 1000,
          showConfirmButton: false,
        });
      }

      // =========================
      // UPDATE
      // =========================
      else {
        const confirm = await Swal.fire({
          text: "Do You Want to Update?",
          icon: "question",
          // showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: "YES",
          denyButtonText: "No",
        });

        if (!confirm.isConfirmed) {
          Swal.fire({
            text: "Inventory Revaluation Not Updated",
            icon: "info",
            toast: true,
            timer: 1500,
            showConfirmButton: false,
          });
          return;
        }

        const res = await apiClient.put(
          `/InventoryRevaluation/${data.DocEntry}`,
          obj,
        );

        if (!res.data?.success) {
          Swal.fire({
            icon: "warning",
            title: "Error",
            text: res.data?.message || "Update failed",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Inventory Revaluation updated",
          timer: 1000,
          showConfirmButton: false,
        });
      }

      // =========================
      // COMMON SUCCESS ACTIONS
      // =========================
      ClearForm();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);
      setClearCache(true);
    } catch (error) {
      console.error("❌ Inventory Revaluation Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      });
    } finally {
      setIsLoading(false); // ✅ STOP LOADER ALWAYS
    }
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
          Inventory Revaluation List
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
                {openListData.map((item, i) => (
                  <CardComponent
                    key={i}
                    title={item.DocNum}
                    subtitle={
                      item.RevalType === "P"
                        ? "Price Change"
                        : item.RevalType === "M"
                          ? "Inventory Debit/Credit"
                          : ""
                    }
                    isSelected={selectedData === item.DocEntry}
                    searchResult={openListquery}
                    onClick={() => setOldOpenData(item.DocEntry)}
                  />
                ))}
              </InfiniteScroll>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  return (
    <>
      {isLoading && <Loader open={isLoading} />}

      <SearchModel
        open={searchmodelOpenDecAccount}
        onClose={SearchModelCloseDecAccount}
        onCancel={SearchModelCloseDecAccount}
        title="ACCOUNT CODE"
        onChange={(e) => handleGetListSearchDecAccount(e.target.value)}
        value={getListqueryDecAccount}
        onClickClear={handleGetListClearDecAccount}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataDecAccount.length}
              next={fetchMoregetListDataDecAccount}
              hasMore={hasMoreGetListDecAccount}
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
              {getListDataDecAccount.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.AcctCode}
                  subtitle={item.AcctName}
                  searchResult={getListqueryDecAccount}
                  onClick={() => handleSelectDecreaseAccount(item)}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <SearchModel
        open={searchmodelOpenAccount}
        onClose={SearchModelCloseAccount}
        onCancel={SearchModelCloseAccount}
        title="ACCOUNT CODE"
        onChange={(e) => handleGetListSearch2(e.target.value)}
        value={getListqueryAccount}
        onClickClear={handleGetListClearAccount}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataAccount.length}
              next={fetchMoregetListDataAccount}
              hasMore={hasMoreGetListAccount}
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
              {getListDataAccount.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.AcctCode}
                  subtitle={item.AcctName}
                  // description={item.AcctName}
                  searchResult={getListqueryAccount}
                  onClick={() => handleSelectIncreaseAccount(item)}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <SearchModel
        open={openWhsc}
        onClose={() => setWhscOpen(false)}
        onCancel={() => setWhscOpen(false)}
        title="WareHouse"
        onChange={(e) => handleWhscGetListSearch(e.target.value)}
        value={WhsrgetListquery}
        onClickClear={handleWhscGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={WhscgetListData.length}
            next={fetchWhscMoreGetListData}
            hasMore={WhshasMoreGetList}
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
            {WhscgetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.WHSName}
                searchResult={WhsrgetListquery}
                isSelected={
                  getValues(
                    `oLines.${getValues("selectedRowIndex")}.WHSCode`,
                  ) === item.WHSCode
                }
                onClick={() => handleWhsSelect(item)}
                // onClick={() => {
                //   selectWhSCode(
                //     item.WHSCode,
                //     // item.Location,
                //     // item.LocationName,
                //     // item.GSTRegnNo,
                //     // item.GSTType,
                //     // item.BalInvntAc
                //   );
                //   //  CloseVendorModel(); // Close after selection if needed
                // }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <DataGridModal
        open={open}
        closeModel={closeModel}
        onSubmit={onSubmit}
        // isLoading={itemList.length === 0 ? true : isLoading}
        title="Item List"
        getRowId={(row) => row.DocEntry}
        columns={modelColumns}
        rows={itemList}
        currentPage={currentPage}
        paginationMode="server"
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onRowSelectionModelChange={handleCellClick}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
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
              }, // Show only on smaller screens
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
              display: {}, // Show only on smaller screens
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
              Inventory Revaluation
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
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                {" "}
                <Paper
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                    borderRadius: "12px",
                  }}
                >
                  <Grid container>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Series"
                        // rules={{ required: "please select Series" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="SERIES"
                            data={[
                              ...(DocSeries || []).map((item) => ({
                                key: item.SeriesId,
                                value: item.SeriesName,
                              })),
                            ]}
                            disabled={SaveUpdateName === "UPDATE"}
                            {...field}
                            onChange={(e) => {
                              const selectedSeries = e.target.value;
                              field.onChange(selectedSeries);
                              setValue("Series", selectedSeries);
                              setValue("DocNum", DocSeries[0]?.DocNum || "");

                              if (selectedSeries !== "0") {
                                const seriesData = DocSeries.find(
                                  (item) => item.SeriesId === selectedSeries,
                                );
                                setValue("DocNum", seriesData?.DocNum || "");
                                setValue(
                                  "SeriesName",
                                  seriesData?.SeriesName || "",
                                );
                                setValue(
                                  "FinncPriod",
                                  seriesData?.FinncPriod ?? "",
                                );
                                setValue(
                                  "PIndicator",
                                  seriesData?.Indicator ?? "",
                                );
                                clearErrors("DocNum");
                              } else {
                                setValue("DocNum", "");
                                setValue("SeriesName", ""); // Clear SeriesName immediately
                                clearErrors("DocNum");
                                setValue("FinncPriod", "0");
                                setValue("PIndicator", "0");
                              }
                            }}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
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
                            disabled={SaveUpdateName === "UPDATE"}
                            // readOnly={
                            //   !allFormData.DocEntry === false ||
                            //   watch("Series") !== "0"
                            // }
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="RevalType"
                        control={control}
                        defaultValue=""
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            readOnly={SaveUpdateName === "UPDATE"}
                            label="REVALUATION TYPE"
                            data={[
                              { key: "M", value: "Inventory Debit/Credit" },
                              { key: "P", value: "Price Change" },
                            ]}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="DocDate"
                        control={control}
                        // rules={{ required: "Date is Required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputDatePickerField
                            label="POSTING DATE"
                            name={field.name}
                            value={field.value ? dayjs(field.value) : undefined}
                            onChange={(date) =>
                              field.onChange(
                                date ? date.toISOString : undefined,
                              )
                            }
                            disabled={SaveUpdateName === "UPDATE"}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="TaxDate"
                        control={control}
                        rules={{ required: "Date is Required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputDatePickerField
                            label="DOCUMENT DATE"
                            name={field.name}
                            value={field.value ? dayjs(field.value) : undefined}
                            onChange={(newValue) => {
                              setValue("TaxDate", newValue);
                            }}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />{" "}
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                      mt={1}
                    >
                      <Button
                        variant="contained"
                        color="info"
                        onClick={handleClickOpen}
                        disabled={SaveUpdateName === "UPDATE"}
                      >
                        Search Item
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
                <Paper
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                    borderRadius: "12px",
                  }}
                >
                  <Grid container width={"100%"}>
                    <Grid
                      container
                      item
                      width="100%"
                      m={1}
                      // border="1px solid grey"
                    >
                      <Tabs
                        sx={{ width: "100%" }}
                        value={tabvalue}
                        onChange={handleTabChange}
                        aria-label="tabs example"
                      >
                        <Tab
                          value={0}
                          icon={<HomeIcon fontSize="small" />}
                          iconPosition="start"
                          label="General"
                        />
                        {/* <Tab value={1} label="Logistics" /> */}
                        {/* <Tab value={2} label="Attachments" /> */}
                      </Tabs>
                      <Divider />

                      {tabvalue === 0 && (
                        <>
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
                              key={oLines.length}
                              onRowClick={handleRowClick}
                              getRowId={(row) =>
                                `${row.ItemCode}_${row.WHSCode}` || row.lineNum
                              }
                              sx={gridSx}
                              apiRef={apiRef}
                              editMode="cell"
                              experimentalFeatures={{ newEditingApi: true }}
                              processRowUpdate={processRowUpdate}
                              onCellKeyDown={handleCellKeyDown}
                              onProcessRowUpdateError={(err) =>
                                console.error(err)
                              }
                              rows={oLines.map((data, index) => ({
                                ...data,
                                id: index,
                              }))}
                              columns={
                                revalType === "P"
                                  ? PriceChangecolumns
                                  : DebCredcolumns
                              }

                              // getRowClassName={(params) =>
                              //   SaveUpdateName === "UPDATE"
                              //     ? "disabled-row"
                              //     : ""
                              // }
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    // justifyContent: "space-around",
                    mt: 2,
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "gray",
                      textTransform: "uppercase",
                    }}
                  >
                    FIFO Layers
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                    borderRadius: "12px",
                  }}
                >
                  <Grid
                    container
                    item
                    sx={{
                      width: "100%",
                      mt: 2,
                      // Remove minHeight and maxHeight to prevent expansion
                      // minHeight: "300px",
                      // maxHeight: "500px",
                    }}
                  >
                    <DataGrid
                      className="datagrid-style"
                      key={activeRowKey}
                      rows={fifoRows}
                      getRowId={(row) => row.id || row.LineNum}
                      sx={{
                        ...gridSx,
                        height: "300px", // Fixed height to prevent continuous increase
                      }}
                      apiRef={fifoApiRef}
                      editMode="cell"
                      experimentalFeatures={{ newEditingApi: true }}
                      processRowUpdate={processFifoRowUpdate}
                      onCellKeyDown={handleFifoCellKeyDown}
                      onProcessRowUpdateError={(err) => console.error(err)}
                      getRowClassName={(params) =>
                        SaveUpdateName === "UPDATE" ? "disabled-row" : ""
                      }
                      columns={
                        revalType === "P"
                          ? FIFOPriceChangeColumns
                          : FIFODebCredColumn
                      }
                    />
                  </Grid>
                </Paper>
                <Grid item lg={6} md={12} sm={12} xs={12}>
                  <Controller
                    name="JrnlMemo"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        label="REMARKS"
                        type="text"
                        rows={2}
                        multiline
                        {...field}
                        inputProps={{ maxLength: 254 }}
                        error={!!error}
                        helperText={error ? error.message : null}
                        sx={{ width: 400 }} // 👈 fixed smaller width
                      />
                    )}
                  />
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
                  type="submit"
                  sx={{ color: "white" }}
                  disabled={!perms.IsAdd || !perms.IsEdit}
                >
                  {SaveUpdateName}
                </Button>
              </Grid>
              {/* <Grid item>
                <Button
                  variant="contained"
                  color="error"
                  disabled={!perms.IsDelete}
                >
                  CANCEL
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
