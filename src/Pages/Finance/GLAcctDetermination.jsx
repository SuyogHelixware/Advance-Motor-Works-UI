import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  ShoppingCart,
  ShoppingBag,
  Settings,
  Inventory,
  People,
  Build,
} from "@mui/icons-material";

import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import Swal from "sweetalert2";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField,
  InputTextFieldLarge,
  SelectedDatePickerField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import InfiniteScroll from "react-infinite-scroll-component";
import CardComponent from "../Components/CardComponent";
import { BeatLoader } from "react-spinners";
import useAuth from "../../Routing/AuthContext";
import dayjs from "dayjs";
import { Loader } from "../Components/Loader";
import { TabContext, TabPanel } from "@mui/lab";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import SearchModel from "../Components/SearchModel";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import { TimeDelay } from "../Components/TimeDelay";
import apiClient from "../../services/apiClient";
import axios from "axios";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { useGridApiRef } from "@mui/x-data-grid";
import generateCalendar from "antd/es/calendar/generateCalendar";

export default function GLAcctDetermination() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [SaveUpdateName, setSaveUpdateName] = useState("UPDATE");
  const [DocEntry, setDocEntry] = useState("");
  const [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [httpRequestToken, setCancelToken] = useState();
  const timeoutRef = useRef(null);
  const theme = useTheme();
  const { user } = useAuth();
  const { companyData } = useAuth(); // get company details from context
  const companyCurrency = companyData?.SysCurrncy;
  const [dataCache, setDataCache] = useState({}); // Stores fetched data for different modal states
  //=====================================Tabs State====================================================================
  const [value, setval] = React.useState("0");
  const [SalesValue, setSalesValue] = useState("0");
  const [PurchaseValue, setPurchaseValue] = useState("0");

  //=====================================open List State===============================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //==============================================All Datagrids AcctCode field States========================================
  const [openDatagridAcctCode, setDatagridAcctCodeOpen] = useState(false);
  const [DatagridAcctCodeRows, setDatagridAcctCodeRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [modalCurrentPage, setModalCurrentPage] = useState(0); // Specific for modal pagination
  const [modalSearchText, setModalSearchText] = useState(""); // Specific for modal search
  const [isLoading, setIsLoading] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingGridKey, setEditingGridKey] = useState(""); // e.g., "PurchaseGeneral"
  const LIMIT = 20; // Define your limit here
  const [selectedAcctApiParams, setSelectedAcctApiParams] = useState(null); // Stores API params for the currently open account selection modal

  //==============================================AcctPayAcctCode modal========================================
  const [openAcctPayAcctCode, setAcctPayAcctCodeOpen] = useState(false);
  const [acctPayModalRows, setAcctPayModalRows] = useState([]); // Separate rows for this modal
  const [acctPayModalRowCount, setAcctPayModalRowCount] = useState(0);
  const [acctPayModalCurrentPage, setAcctPayModalCurrentPage] = useState(0);
  const [acctPayModalSearchText, setAcctPayModalSearchText] = useState("");
  const [acctPayModalIsLoading, setAcctPayModalIsLoading] = useState(false);
  const [editingAcctPayAcctCodeRowId, setEditingAcctPayAcctCodeRowId] =
    useState(null);
  const [selectedAcctPayApiParams, setSelectedAcctPayApiParams] =
    useState(null);

  //==============================================AcctRecAcctCode modal========================================
  const [openAcctRecAcctCode, setAcctRecAcctCodeOpen] = useState(false);
  const [acctRecModalRows, setAcctRecModalRows] = useState([]); // Separate rows for this modal
  const [acctRecModalRowCount, setAcctRecModalRowCount] = useState(0);
  const [acctRecModalCurrentPage, setAcctRecModalCurrentPage] = useState(0);
  const [acctRecModalSearchText, setAcctRecModalSearchText] = useState("");
  const [acctRecModalIsLoading, setAcctRecModalIsLoading] = useState(false);
  const [editingAcctRecAcctCodeRowId, setEditingAcctRecAcctCodeRowId] =
    useState(null);
  const [selectedAcctRecApiParams, setSelectedAcctRecApiParams] =
    useState(null);

  //============================================Acct Receivable modal=====================================
  const [isAcctRecDialogOpen, setIsAcctRecDialogOpen] = useState(false);

  //=========================================Acct Payable Modal===========================================
  const [isAcctPayDialogOpen, setIsAcctPayDialogOpen] = useState(false);

  //================================Default customer for A/R Invoice and Payment=================================
  const [getListPageBP, setGetListPageBP] = useState(0);
  const [hasMoreGetListBP, setHasMoreGetListBP] = useState(true);
  const [searchmodelOpenBP, setSearchmodelOpenBP] = useState(false);
  const [getListqueryBP, setGetListQueryBP] = useState("");
  const [getListSearchingBP, setGetListSearchingBP] = useState(false);
  const [getListDataBP, setGetListDataBP] = useState([]);

  //================================Posting Period==================================================
  const [postingPeriodData, setpostingPeriodData] = useState([]);
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const apiRef = useGridApiRef();
  const SalesTaxApiRef = useGridApiRef();
  const PurchaseGeneralApiRef = useGridApiRef();
  const PurchaseTaxApiRef = useGridApiRef();
  const GeneralApiRef = useGridApiRef();
  const InventoryApiRef = useGridApiRef();
  const ResourcesApiRef = useGridApiRef();
  const DatagridApiRef = useGridApiRef();
  const datagridContainerRef = useRef(null);

  const initial = {
    PeriodName: "",
    AcctReceivable: "",
    PCCtrlAcct: "N",
    DfltCard: "",
    ExpirationDate: "",
    Description: "",
    WithHoldingTax: "N",
    NINumber: "",
    PWithHoldingTax: "N",
    DfltWHTaxCode: "",
    CertificateNo: "",
    AcctPayable: "",
    CapitalGoodsPr: "",
    CapitalGoodsAmt: "",
  };
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleChange = (event, newValue) => setval(newValue);
  const handleSalesChange = (event, newValue) => setSalesValue(newValue);
  const handlePurchaseChange = (event, newValue) => setPurchaseValue(newValue);

  const [chartOfAccounts, setChartOfAccounts] = useState([]);

  const getChartOfAccounts = async () => {
    try {
      const res = await apiClient.get(`/ChartOfAccounts/All`);
      const data = res.data.values || [];
      setChartOfAccounts(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch ChartOfAccounts. Please try again later.",
      });
    }
  };
  const getAcctName = (acctCode) => {
    if (!acctCode) return "";
    const acct = chartOfAccounts.find((c) => c.AcctCode === acctCode);
    return acct ? acct.AcctName : "";
  };

  // ===============Main list handle search====================================

  const clearFormData = () => {
    reset(initial);

    // clear allGridData acctcode + acctname
    setAllGridsData((prev) => {
      const updated = {};
      for (const key in prev) {
        updated[key] = prev[key].map((row) => ({
          ...row,
          AcctCode: "",
          AcctName: "",
        }));
      }
      return updated;
    });

    // clear acctRecRows
    setAcctRecRows((prev) =>
      prev.map((row) => ({
        ...row,
        AcctCode: "",
        AcctName: "",
      })),
    );

    // clear acctPayRows
    setAcctPayRows((prev) =>
      prev.map((row) => ({
        ...row,
        AcctCode: "",
        AcctName: "",
      })),
    );

    setSelectedData([]);
    setSaveUpdateName("SAVE");
  };

  useEffect(
    () => {
      getChartOfAccounts();
      postingPeriodGetData();
      fetchOpenListData(0);
      fetchGetListDataBP(0);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => {
    if (!selectedData || chartOfAccounts.length === 0) return;

    setGLAccDaterminationData(selectedData);
  }, [chartOfAccounts]);

  //=====================================Account REceivable (and other account selection modals)=====================================
  const fetchInitialAcctRecs = async ({
    page = 0,
    limit = LIMIT,
    search = "",
    locManTran,
    finanse,
    groupMask,
    ...rest
  }) => {
    setIsLoading(true);

    // Create a unique cache key based on all relevant parameters
    const cacheKey = JSON.stringify({
      page,
      limit,
      search,
      locManTran,
      finanse,
      groupMask,
      ...rest,
    });

    // Check if data is already in cache
    if (dataCache[cacheKey]) {
      setDatagridAcctCodeRows(dataCache[cacheKey].Accounts);
      setRowCount(dataCache[cacheKey].rowCount);
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("Page", page);
      params.append("Limit", limit);
      params.append("Postable", "Y");
      if (search) params.append("SearchText", search);
      if (locManTran !== undefined) params.append("LocManTran", locManTran);
      if (finanse !== undefined) params.append("Finanse", finanse);
      if (groupMask)
        params.append(
          "GroupMask",
          Array.isArray(groupMask) ? groupMask.join(",") : groupMask,
        );

      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const url = `/ChartOfAccounts?${params.toString()}`;
      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success) {
        const Accounts = data?.values || [];
        setDatagridAcctCodeRows(Accounts);

        let newRowCount;
        if (Accounts.length === limit) {
          newRowCount = (page + 1) * limit + 1;
        } else {
          newRowCount = page * limit + Accounts.length;
        }
        setRowCount(newRowCount);

        // Store fetched data and rowCount in cache
        setDataCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: { Accounts, rowCount: newRowCount },
        }));
      } else {
        Swal.fire({ title: "Error!", text: data.message, icon: "warning" });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong",
        icon: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New fetch function for AcctRecAcctCode modal
  const fetchAcctRecAccounts = async ({
    page = 0,
    limit = LIMIT,
    search = "",
    locManTran,
    finanse,
    groupMask,
    ...rest
  }) => {
    setAcctRecModalIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("Page", page);
      params.append("Limit", limit);
      params.append("Postable", "Y");
      if (search) params.append("SearchText", search);
      if (locManTran !== undefined) params.append("LocManTran", locManTran);
      if (finanse !== undefined) params.append("Finanse", finanse);
      if (groupMask)
        params.append(
          "GroupMask",
          Array.isArray(groupMask) ? groupMask.join(",") : groupMask,
        );

      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const url = `/ChartOfAccounts?${params.toString()}`;
      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success) {
        const Accounts = data?.values || [];
        setAcctRecModalRows(Accounts);

        let newRowCount;
        if (Accounts.length === limit) {
          newRowCount = (page + 1) * limit + 1;
        } else {
          newRowCount = page * limit + Accounts.length;
        }
        setAcctRecModalRowCount(newRowCount);
      } else {
        Swal.fire({ title: "Error!", text: data.message, icon: "warning" });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong",
        icon: "warning",
      });
    } finally {
      setAcctRecModalIsLoading(false);
    }
  };

  // New fetch function for AcctPayAcctCode modal
  const fetchAcctPayAccounts = async ({
    page = 0,
    limit = LIMIT,
    search = "",
    locManTran,
    finanse,
    groupMask,
    ...rest
  }) => {
    setAcctPayModalIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("Page", page);
      params.append("Limit", limit);
      params.append("Postable", "Y");
      if (search) params.append("SearchText", search);
      if (locManTran !== undefined) params.append("LocManTran", locManTran);
      if (finanse !== undefined) params.append("Finanse", finanse);
      if (groupMask)
        params.append(
          "GroupMask",
          Array.isArray(groupMask) ? groupMask.join(",") : groupMask,
        );

      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const url = `/ChartOfAccounts?${params.toString()}`;
      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success) {
        const Accounts = data?.values || [];
        setAcctPayModalRows(Accounts);

        let newRowCount;
        if (Accounts.length === limit) {
          newRowCount = (page + 1) * limit + 1;
        } else {
          newRowCount = page * limit + Accounts.length;
        }
        setAcctPayModalRowCount(newRowCount);
      } else {
        Swal.fire({ title: "Error!", text: data.message, icon: "warning" });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong",
        icon: "warning",
      });
    } finally {
      setAcctPayModalIsLoading(false);
    }
  };

  const closeModel = () => {
    setDatagridAcctCodeOpen(false);
    setDataCache({});
    // Optionally clear cache related to this modal when it's fully closed
    // setDataCache({}); // This would clear all cached data for this modal type
    // Or clear specific entries if you have a more granular caching strategy
  };
  // useEffect(() => {
  //   if (openDatagridAcctCode && DatagridApiRef.current) {
  //     setTimeout(() => {
  //       DatagridApiRef.current.setCellFocus(0, 'AcctCode');
  //       setCurrentRowId(0);
  //       setCurrentField('AcctCode');
  //       // NEW: Ensure the DataGrid container is focused
  //       if (datagridContainerRef.current) {
  //         datagridContainerRef.current.focus();
  //       }
  //     }, 200);  // Slightly longer delay for rendering
  //   }
  // }, [openDatagridAcctCode]);
  // Effect to trigger data fetch for the main account selection modal
  useEffect(() => {
    if (openDatagridAcctCode && selectedAcctApiParams) {
      fetchInitialAcctRecs({
        page: modalCurrentPage,
        search: modalSearchText,
        ...selectedAcctApiParams,
      });
    }
  }, [
    openDatagridAcctCode,
    modalCurrentPage,
    modalSearchText,
    selectedAcctApiParams,
  ]);

  // Effect to trigger data fetch for AcctRecAcctCode modal
  useEffect(() => {
    if (openAcctRecAcctCode && selectedAcctRecApiParams) {
      fetchAcctRecAccounts({
        page: acctRecModalCurrentPage,
        search: acctRecModalSearchText,
        ...selectedAcctRecApiParams,
      });
    }
  }, [
    openAcctRecAcctCode,
    acctRecModalCurrentPage,
    acctRecModalSearchText,
    selectedAcctRecApiParams,
  ]);

  // Effect to trigger data fetch for AcctPayAcctCode modal
  useEffect(() => {
    if (openAcctPayAcctCode && selectedAcctPayApiParams) {
      fetchAcctPayAccounts({
        page: acctPayModalCurrentPage,
        search: acctPayModalSearchText,
        ...selectedAcctPayApiParams,
      });
    }
  }, [
    openAcctPayAcctCode,
    acctPayModalCurrentPage,
    acctPayModalSearchText,
    selectedAcctPayApiParams,
  ]);

  // Handlers for the main account selection modal's pagination and search
  const handleModalPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== modalCurrentPage) {
        setModalCurrentPage(model.page);
      }
    },
    [modalCurrentPage],
  );

  const handleModalSearchChange = useCallback((searchText) => {
    setModalSearchText(searchText);
    setModalCurrentPage(0); // Reset to first page when searching
  }, []);

  // Handlers for AcctRecAcctCode modal's pagination and search
  const handleAcctRecModalPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== acctRecModalCurrentPage) {
        setAcctRecModalCurrentPage(model.page);
      }
    },
    [acctRecModalCurrentPage],
  );

  const handleAcctRecModalSearchChange = useCallback((searchText) => {
    setAcctRecModalSearchText(searchText);
    setAcctRecModalCurrentPage(0); // Reset to first page when searching
  }, []);

  // Handlers for AcctPayAcctCode modal's pagination and search
  const handleAcctPayModalPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== acctPayModalCurrentPage) {
        setAcctPayModalCurrentPage(model.page);
      }
    },
    [acctPayModalCurrentPage],
  );

  const handleAcctPayModalSearchChange = useCallback((searchText) => {
    setAcctPayModalSearchText(searchText);
    setAcctPayModalCurrentPage(0); // Reset to first page when searching
  }, []);

  const [acctRecRows, setAcctRecRows] = useState([
    {
      id: 1,
      AcctTypeName: "Down Payment Receivables",
      AcctCode: "",
      AcctName: "",
    },
    { id: 2, AcctTypeName: "Open Debts", AcctCode: "", AcctName: "" },
  ]);
  const [acctPayRows, setAcctPayRows] = useState([
    {
      id: 1,
      AcctTypeName: "Down Payment Payables",
      AcctCode: "",
      AcctName: "",
    },
    { id: 2, AcctTypeName: "Open Debts", AcctCode: "", AcctName: "" },
  ]);
  const DatagridAcctCodeList = [
    {
      field: "AcctCode",
      headerName: "Account Code",
      width: 180,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "AcctName",
      headerName: "Account Name",
      width: 450,
      editable: true,
    },
  ];

  const AccPayAcctCodelist = [
    {
      field: "AcctCode",
      headerName: "Account Code",
      width: 180,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "AcctName",
      headerName: "Account Name",
      width: 450,
      editable: true,
    },
  ];

  const AccRecAcctCodelist = [
    {
      field: "AcctCode",
      headerName: "Account Code",
      width: 180,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "AcctName",
      headerName: "Account Name",
      width: 450,
      editable: true,
    },
  ];

  const handleAcctPayAcctCodeSelection = (selectedRow) => {
    setAcctPayRows((prevRows) =>
      prevRows.map((row) =>
        row.id === editingAcctPayAcctCodeRowId
          ? {
              ...row,
              AcctCode: selectedRow.AcctCode,
              AcctName: selectedRow.AcctName,
            }
          : row,
      ),
    );
    setAcctPayAcctCodeOpen(false);
  };

  const handleAcctRecAcctCodeSelection = (selectedRow) => {
    setAcctRecRows((prevRows) =>
      prevRows.map((row) =>
        row.id === editingAcctRecAcctCodeRowId
          ? {
              ...row,
              AcctCode: selectedRow.AcctCode,
              AcctName: selectedRow.AcctName,
            }
          : row,
      ),
    );
    setAcctRecAcctCodeOpen(false);
  };

  const AcctPayColumns = [
    {
      field: "AcctTypeName",
      headerName: "Account Type Name",
      width: 300,
      editable: false, // Changed to false as per typical display
    },
    {
      field: "AcctCode",
      headerName: "Account Code",
      width: 250,
      renderCell: (params) => {
        const handleBackspace = (e) => {
          if (e.key === "Backspace") {
            e.preventDefault(); // stop default behavior

            // clear AcctCode & AcctName
            setAcctPayRows((prevRows) =>
              prevRows.map((row) =>
                row.id === params.row.id
                  ? { ...row, AcctCode: "", AcctName: "" }
                  : row,
              ),
            );
          } else {
            e.preventDefault(); // block typing of all keys
          }
        };

        const handleOpenAcctPayModal = () => {
          setEditingAcctPayAcctCodeRowId(params.row.id);

          let apiParams = {};
          if (params.row.AcctTypeName === "Down Payment Payables") {
            apiParams = { locManTran: "Y", groupMask: "1,2" };
          } else if (params.row.AcctTypeName === "Open Debts") {
            apiParams = { locManTran: "Y", groupMask: "1" };
          }

          setSelectedAcctPayApiParams(apiParams);
          setAcctPayModalCurrentPage(0);
          setAcctPayModalSearchText("");
          setAcctPayAcctCodeOpen(true);
        };

        return (
          <InputTextField
            value={params.row.AcctCode || ""}
            onKeyDown={handleBackspace} // 🔥 KEY FIX
            sx={{ width: 160 }}
            readOnly // typing disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleOpenAcctPayModal}
                    size="small"
                    color="primary"
                    style={{
                      backgroundColor: "green",
                      borderRadius: "10%",
                      color: "white",
                      padding: 2,
                    }}
                  >
                    <ViewListIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        );
      },
    },

    {
      field: "AcctName",
      headerName: "Account Name",
      width: 450,
      editable: false, // Changed to false as per typical display
      renderCell: (params) => <span>{getAcctName(params.row.AcctCode)}</span>,
    },
  ];
  const AcctRecColumns = [
    {
      field: "AcctTypeName",
      headerName: "Account Type Name",
      width: 300,
      editable: false, // Changed to false as per typical display
    },
    {
      field: "AcctCode",
      headerName: "Account Code",
      width: 250,
      renderCell: (params) => {
        const handleBackspace = (e) => {
          // Allow only Backspace to clear fields
          if (e.key === "Backspace") {
            e.preventDefault();

            // Clear AcctCode + AcctName
            setAcctRecRows((prevRows) =>
              prevRows.map((row) =>
                row.id === params.row.id
                  ? { ...row, AcctCode: "", AcctName: "" }
                  : row,
              ),
            );
          } else {
            // Block all typing
            e.preventDefault();
          }
        };

        const handleOpenAcctRecModal = () => {
          setEditingAcctRecAcctCodeRowId(params.row.id);

          let apiParams = {};
          if (params.row.AcctTypeName === "Down Payment Receivables") {
            apiParams = { locManTran: "Y", groupMask: "1,2" };
          } else if (params.row.AcctTypeName === "Open Debts") {
            apiParams = { locManTran: "Y", groupMask: "1" };
          }

          setSelectedAcctRecApiParams(apiParams);
          setAcctRecModalCurrentPage(0);
          setAcctRecModalSearchText("");
          setAcctRecAcctCodeOpen(true);
        };

        return (
          <InputTextField
            value={params.row.AcctCode || ""}
            onKeyDown={handleBackspace} // 🔥 IMPORTANT
            sx={{ width: 160 }}
            readOnly
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleOpenAcctRecModal}
                    size="small"
                    color="primary"
                    style={{
                      backgroundColor: "green",
                      borderRadius: "10%",
                      color: "white",
                      padding: 2,
                    }}
                  >
                    <ViewListIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        );
      },
    },

    {
      field: "AcctName",
      headerName: "Account Name",
      width: 450,
      editable: false, // Changed to false as per typical display
      renderCell: (params) => <span>{getAcctName(params.row.AcctCode)}</span>,
    },
  ];
  const handleRowSelection = (params) => {
    // This function is currently empty, but could be used if a row in the main AcctRec/AcctPay dialog itself needs to be selected.
    // The actual account selection happens in handleAcctRecAcctCodeSelection/handleAcctPayAcctCodeSelection
  };

  //=======================================Default customer for A/R invoice modal===================
  const OpenDailog1 = () => {
    setSearchmodelOpenBP(true);
  };
  const SearchModelClose1 = () => {
    handleGetListClearBP();
    setSearchmodelOpenBP(false);
  };
const onSelectRequestBP = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setIsLoading(true);

    const res = await apiClient.get(`/BPV2/V2/${DocEntry}`);

    if (res?.data?.success) {
      const values = res.data.values || {};

      setValue("DfltCard", values.CardCode || "", {
        shouldDirty: true,
      });

      SearchModelClose1();
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: res?.data?.message || "Failed to fetch Business Partner data.",
      });
    }
  } catch (error) {
    console.error("BP fetch error:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        "Something went wrong while fetching Business Partner data.",
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleGetListClearBP = () => {
    setGetListQueryBP("");
    setGetListSearchingBP(true);
    setGetListPageBP(0);
    setGetListDataBP([]); // Clear current data
    fetchGetListDataBP(0); // Fetch first page without search
  };
  const handleGetListSearchBP = (res) => {
    setGetListQueryBP(res);
    setGetListSearchingBP(true);
    setGetListPageBP(0);
    setGetListDataBP([]); // Clear current data
    // fetchGetListDataBP(0, res); // Fetch with search query
    // Cancel Token
    if (typeof httpRequestToken != typeof undefined) {
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchGetListDataBP(0, res, httpRequestToken);
    }, TimeDelay);
    // fetchOpenListData(0,res,httpRequestToken);
  };
  const fetchMoreGetListDataBP = () => {
    fetchGetListDataBP(
      getListPageBP + 1,
      getListSearchingBP ? getListqueryBP : "",
    );
    setGetListPageBP((prev) => prev + 1);
  };
  const fetchGetListDataBP = async (
    pageNum,
    searchTerm = "",
    cancelToken = undefined,
  ) => {
    // Cancel Token
    cancelToken = axios.CancelToken.source();
    setCancelToken(cancelToken);

    try {
      let url = "";

      if (searchTerm) {
        // 🔍 Search API
        url = `/BPV2/V2/ByCardType/Search/${searchTerm}/C/1/${pageNum}/20`;
      } else {
        // 📄 Paging API
        url = `/BPV2/V2/ByCardType/Pages/C/1/${pageNum}/20`;
      }

      const response = await apiClient.get(url, {
        cancelToken: cancelToken.token,
      });

      if (response.data.success) {
        const newData = response.data.values || [];

        setHasMoreGetListBP(newData.length === 20);
        setCancelToken(undefined);

        setGetListDataBP((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message);
      } else {
        console.log("Request ERROR", error.message);
      }
      setCancelToken(undefined);
    }
  };

  //==========================================Common Datagrid, Columns and Rows======================================
  const SalesGeneralRows = [
    {
      id: 1,
      SrNo: 1,
      keyName: "LinkAct_1",
      TypeOfAcct: "Domestic Accounts Receivable",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 2,
      SrNo: 2,
      keyName: "LinkAct_9",
      TypeOfAcct: "Foreign Accounts Receivable",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 3,
      SrNo: 3,
      keyName: "LinkAct_2",
      TypeOfAcct: "Checks Received",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 4,
      SrNo: 4,
      keyName: "LinkAct_3",
      TypeOfAcct: "Cash on Hand",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 5,
      SrNo: 5,
      keyName: "OverpayAR",
      TypeOfAcct: "Overpayment A/R Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 6,
      SrNo: 6,
      keyName: "UndrpayAR",
      TypeOfAcct: "Underpayment A/R Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 7,
      SrNo: 7,
      keyName: "DpmSalAct",
      TypeOfAcct: "Down Payment Clearing Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 8,
      SrNo: 8,
      keyName: "GLGainXdif",
      TypeOfAcct: "Realized Exchange Diff. Gain",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 9,
      SrNo: 9,
      keyName: "LinkAct_21",
      TypeOfAcct: "Realized Exchange Diff. Loss",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 10,
      SrNo: 10,
      keyName: "ARConDiffG",
      TypeOfAcct: "Realized Conversion Diff. Gain",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 11,
      SrNo: 11,
      keyName: "ARConDiffL",
      TypeOfAcct: "Realized Conversion Diff. Loss",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 12,
      SrNo: 12,
      keyName: "LinkAct_19",
      TypeOfAcct: "Cash Discount",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 13,
      SrNo: 13,
      keyName: "DfltIncom",
      TypeOfAcct: "Revenue Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 14,
      SrNo: 14,
      keyName: "ARCMAct",
      TypeOfAcct: "Sales Credit Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 15,
      SrNo: 15,
      keyName: "SalDpmInt",
      TypeOfAcct: "Down Payment Interim Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 16,
      SrNo: 16,
      keyName: "DunIntrst",
      TypeOfAcct: "Dunning Interest",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 17,
      SrNo: 17,
      keyName: "DunFee",
      TypeOfAcct: "Dunning Fee",
      AcctCode: "",
      AcctName: "",
    },
  ];
  const SalesTaxRows = [
    {
      id: 1,
      SrNo: 1,
      keyName: "SaleVatOff",
      TypeOfAcct: "Down Payment Tax Offset Acct ",
      AcctCode: "",
      AcctName: "",
    },
  ];
  const PurchaseGeneralRows = [
    {
      id: 1,
      SrNo: 1,
      keyName: "LinkAct_10",
      TypeOfAcct: "Domestic Accounts Payable",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 2,
      SrNo: 2,
      keyName: "LinkAct_11",
      TypeOfAcct: "Foreign Accounts Payable",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 3,
      SrNo: 3,
      keyName: "LinkAct_25",
      TypeOfAcct: "Realized Exchange Diff. Gain",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 4,
      SrNo: 4,
      keyName: "LinkAct_23",
      TypeOfAcct: "Realized Exchange Diff. Loss",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 5,
      SrNo: 5,
      keyName: "APConDiffG",
      TypeOfAcct: "Realized Conversion Diff. Gain",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 6,
      SrNo: 6,
      keyName: "APConDiffL",
      TypeOfAcct: "Realized Conversion Diff. Loss",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 7,
      SrNo: 7,
      keyName: "LinkAct_12",
      TypeOfAcct: "Bank Transfer",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 8,
      SrNo: 8,
      keyName: "LinkAct_22",
      TypeOfAcct: "Cash Discount",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 9,
      SrNo: 9,
      keyName: "LinkAct_20",
      TypeOfAcct: "Cash Discount Clearing",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 10,
      SrNo: 10,
      keyName: "DfltExpn",
      TypeOfAcct: "Expense Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 11,
      SrNo: 11,
      keyName: "APCMAct",
      TypeOfAcct: "Purchase Credit Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 12,
      SrNo: 12,
      keyName: "OverpayAP",
      TypeOfAcct: "Overpayment A/P Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 13,
      SrNo: 13,
      keyName: "UndrpayAP",
      TypeOfAcct: "Underpayment A/P Account",
      AcctCode: "",
      AcctName: "",
    },
  ];
  const PurchaseTaxRows = [
    {
      id: 1,
      SrNo: 1,
      keyName: "PurcVatOff",
      TypeOfAcct: "Down Payment Tax Offset Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 2,
      SrNo: 2,
      keyName: "OnHoldAct",
      TypeOfAcct: "Capital Goods On Hold Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 3,
      SrNo: 3,
      keyName: "GSTInAct",
      TypeOfAcct: "GST Input Interim Account",
      AcctCode: "",
      AcctName: "",
    },
  ];
  const GeneralRows = [
    {
      id: 1,
      SrNo: 1,
      keyName: "ComissAct",
      TypeOfAcct: "Credit Card Deposit Fee",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 2,
      SrNo: 2,
      keyName: "LinkAct_24",
      TypeOfAcct: "Rounding Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 3,
      SrNo: 3,
      keyName: "LinkAct_27",
      TypeOfAcct: "Automatic Reconciliation Diff.",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 4,
      SrNo: 4,
      keyName: "LinkAct_28",
      TypeOfAcct: "Period-End Closing Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 5,
      SrNo: 5,
      keyName: "LinkAct_26",
      TypeOfAcct: "Realized Exchange Diff. Gain",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 6,
      SrNo: 6,
      keyName: "GLLossXdif",
      TypeOfAcct: "Realized Exchange Diff. Loss",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 7,
      SrNo: 7,
      keyName: "GLConDiffG",
      TypeOfAcct: "Realized Conversion Diff. Gain",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 8,
      SrNo: 8,
      keyName: "GLConDiffL",
      TypeOfAcct: "Realized Conversion Diff. Loss",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 9,
      SrNo: 9,
      keyName: "LinkAct_18",
      TypeOfAcct: "Opening Balance Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 10,
      SrNo: 10,
      keyName: "BnkChgAct",
      TypeOfAcct: "Bank Charges Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 11,
      SrNo: 11,
      keyName: "ICClrAct",
      TypeOfAcct: "Incoming CENVAT Clearing Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 12,
      SrNo: 12,
      keyName: "OCClrAct",
      TypeOfAcct: "Outgoing CENVAT Clearing Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 13,
      SrNo: 13,
      keyName: "PlaAct",
      TypeOfAcct: "PLA",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 14,
      SrNo: 14,
      keyName: "TDSInterst",
      TypeOfAcct: "TDS Interest Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 15,
      SrNo: 15,
      keyName: "TDSCharges",
      TypeOfAcct: "TDS Other Charges Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 16,
      SrNo: 16,
      keyName: "TDSFee",
      TypeOfAcct: "TDS Fee Acct",
      AcctCode: "",
      AcctName: "",
    },
  ];
  const InventoryRows = [
    {
      id: 1,
      SrNo: 1,
      keyName: "StockAct",
      TypeOfAcct: "Inventory Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 2,
      SrNo: 2,
      keyName: "COGM_Act",
      TypeOfAcct: "Cost of Goods Sold Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 3,
      SrNo: 3,
      keyName: "AlocCstAct",
      TypeOfAcct: "Allocation Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 4,
      SrNo: 4,
      keyName: "VariancAct",
      TypeOfAcct: "VAriance Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 5,
      SrNo: 5,
      keyName: "PricDifAct",
      TypeOfAcct: "Price Difference Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 6,
      SrNo: 6,
      keyName: "NegStckAct",
      TypeOfAcct: "Negative Inventory Adj. Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 7,
      SrNo: 7,
      keyName: "DfltLoss",
      TypeOfAcct: "Inventory Offset - Decr. Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 8,
      SrNo: 8,
      keyName: "DfltProfit",
      TypeOfAcct: "Inventory Offset - Incr. Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 9,
      SrNo: 9,
      keyName: "RturnngAct",
      TypeOfAcct: "Sales Returns Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 10,
      SrNo: 10,
      keyName: "ExDiffAct",
      TypeOfAcct: "Exchange Rate Differences Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 11,
      SrNo: 11,
      keyName: "BalanceAct",
      TypeOfAcct: "Goods Clearing Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 12,
      SrNo: 12,
      keyName: "DecresGlAc",
      TypeOfAcct: "G/L Decrease Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 13,
      SrNo: 13,
      keyName: "IncresGlAc",
      TypeOfAcct: "G/L Increase Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 14,
      SrNo: 14,
      keyName: "WipAcct",
      TypeOfAcct: "WIP Inventory Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 15,
      SrNo: 15,
      keyName: "WipVarAcct",
      TypeOfAcct: "WIP Inventory Variance Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 16,
      SrNo: 16,
      keyName: "",
      TypeOfAcct: "WIP Offset P&L Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 17,
      SrNo: 17,
      keyName: "StockOffst",
      TypeOfAcct: "Inventory Offset P&L Account",
      AcctCode: "",
      AcctName: "",
    },
  ];
  const ResourcesRows = [
    {
      id: 1,
      SrNo: 1,
      keyName: "ResStdExp1",
      TypeOfAcct: "Std Cost Expense 1",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 2,
      SrNo: 2,
      keyName: "ResStdExp2",
      TypeOfAcct: "Std Cost Expense 2",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 3,
      SrNo: 3,
      keyName: "ResStdExp3",
      TypeOfAcct: "Std Cose Expense 3",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 4,
      SrNo: 4,
      keyName: "ResStdExp4",
      TypeOfAcct: "Std Cose Expense 4",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 5,
      SrNo: 5,
      keyName: "ResStdExp5",
      TypeOfAcct: "Std Cose Expense 5",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 6,
      SrNo: 6,
      keyName: "ResStdExp6",
      TypeOfAcct: "Std Cose Expense 6",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 7,
      SrNo: 7,
      keyName: "ResStdExp7",
      TypeOfAcct: "Std Cose Expense 7",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 8,
      SrNo: 8,
      keyName: "ResStdExp8",
      TypeOfAcct: "Std Cose Expense 8",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 9,
      SrNo: 9,
      keyName: "ResStdExp9",
      TypeOfAcct: "Std Cose Expense 9",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 10,
      SrNo: 10,
      keyName: "ResStdEx10",
      TypeOfAcct: "Std Cose Expense 10",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 11,
      SrNo: 11,
      keyName: "ResWipAct",
      TypeOfAcct: "Resource WIP Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 12,
      SrNo: 12,
      keyName: "",
      TypeOfAcct: "WIP Offset P&L Account",
      AcctCode: "",
      AcctName: "",
    },
    // {
    //   id: 13,
    //   SrNo: 13,
    //   TypeOfAcct: "Resource WIP Account",
    //   AcctCode: "",
    //   AcctName: "",
    // },
    {
      id: 15,
      SrNo: 15,
      keyName: "ResOffPlAc",
      TypeOfAcct: "Resource Offset P&L Account",
      AcctCode: "",
      AcctName: "",
    },
  ];
  const [allGridsData, setAllGridsData] = useState({
    SalesGeneral: SalesGeneralRows,
    SalesTax: SalesTaxRows,
    PurchaseGeneral: PurchaseGeneralRows,
    PurchaseTax: PurchaseTaxRows,
    General: GeneralRows,
    Inventory: InventoryRows,
    Resources: ResourcesRows,
  });
  const handleClearAcct = (gridKey, rowId) => {
    setAllGridsData((prev) => ({
      ...prev,
      [gridKey]: prev[gridKey].map((row) =>
        (row.id || row.LineNum) === rowId
          ? {
              ...row,
              AcctCode: "",
              AcctName: "",
            }
          : row,
      ),
    }));
  };
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
  const SalesTaxhandleCellKeyDown = (params, event) => {
    const api = SalesTaxApiRef.current;
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
  const PurchaseGeneralhandleCellKeyDown = (params, event) => {
    const api = PurchaseGeneralApiRef.current;
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
  const PurchaseTaxhandleCellKeyDown = (params, event) => {
    const api = PurchaseTaxApiRef.current;
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
  const GeneralhandleCellKeyDown = (params, event) => {
    const api = GeneralApiRef.current;
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
  const InventoryhandleCellKeyDown = (params, event) => {
    const api = InventoryApiRef.current;
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
  const ResourceshandleCellKeyDown = (params, event) => {
    const api = ResourcesApiRef.current;
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
  const DatagridhandleCellKeyDown = (params, event) => {
    const api = DatagridApiRef.current;
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

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        break;

      case "ArrowRight":
        nextCol++;
        break;

      case "ArrowLeft":
        nextCol--;
        break;

      case "ArrowDown":
        nextRow++;
        break;

      case "ArrowUp":
        nextRow--;
        break;

      case "Enter":
        // ✅ SELECT + CLOSE
        setDatagridAcctCode(params.row);
        closeModel();
        return;
      default:
        return;
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

    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });
    api.setCellFocus(nextId, nextField);
  };

  const ColumnFields = (gridKey) => [
    {
      field: "SrNo",
      headerName: "Sr No.",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "TypeOfAcct",
      headerName: "Type of Account",
      width: 300,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "AcctCode",
      headerName: "Account Code",
      width: 250,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",

      renderCell: (params) => {
        const rowId = params.row.id || params.row.LineNum;
        const hasAcctCode = !!params.row.AcctCode;
        const disabled = params.row.Status === "0";

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            gap={0.5}
            tabIndex={0} // 🔥 makes cell keyboard-focusable
            onKeyDown={(e) => {
              // ⛔ stop grid navigation
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (disabled) return;

                // 👉 open modal ONLY when empty
                if (!hasAcctCode) {
                  OpenDatagridAcctCodeModal(gridKey, rowId);
                }
              }

              // ⌫ clear on backspace
              if (e.key === "Backspace") {
                e.preventDefault();
                if (hasAcctCode) {
                  handleClearAcct(gridKey, rowId);
                }
              }
            }}
            sx={{
              width: "100%",
              height: "100%",
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            {/* ---- TEXT ---- */}
            <Grid item xs zeroMinWidth>
              <Typography
                noWrap
                textAlign="center"
                sx={{ fontSize: 13 }}
                title={params.row.AcctCode || ""}
              >
                {params.row.AcctCode || ""}
              </Typography>
            </Grid>

            {/* ---- ICON ---- */}
            <Grid item>
              <IconButton
                size="small"
                onClick={() => OpenDatagridAcctCodeModal(gridKey, rowId)}
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
      field: "AcctName",
      headerName: "Account Name",
      width: 500,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => <span>{params.row.AcctName || ""}</span>,
    },
  ];
  // const TabDataGrid = ({ rows, columns, gridKey }) => {
  //   return (
  //     <Box
  //       sx={{
  //         height: "50vh",
  //         overflowX: "auto",
  //         overflowY: "auto",
  //         width: "100%",
  //         mt: 2,
  //       }}
  //     >
  //       <DataGrid
  //         className="datagrid-style"
  //         hideFooter
  //         columns={columns.map((col) => {
  //           if (col.field === "AcctCode") {
  //             return {
  //               ...col,
  //               renderCell: (params) => (
  //                 <Controller
  //                   name={`AcctCode_${params.row.id}`}
  //                   control={control}
  //                   render={({ field, fieldState: { error } }) => (
  //                     <InputTextField
  //                       {...field}
  //                       name={`AcctCode_${params.row.id}`}
  //                       value={field.value || params.value || ""}
  //                       sx={{ width: 160 }}
  //                       error={!!error}
  //                       helperText={error?.message}
  //                       // 👇 handle Backspace/Delete here
  //                       onKeyDown={(e) => {
  //                         if (e.key === "Backspace" || e.key === "Delete") {
  //                           e.preventDefault();

  //                           // clear RHF field
  //                           field.onChange("");

  //                           // clear from DataGrid state (AcctCode + AcctName)
  //                           setAllGridsData((prev) => ({
  //                             ...prev,
  //                             [gridKey]: prev[gridKey].map((r) =>
  //                               r.id === params.row.id
  //                                 ? { ...r, AcctCode: "", AcctName: "" }
  //                                 : r
  //                             ),
  //                           }));

  //                           // also clear checkbox selection
  //                           // setSelectedAcctRowId(null);
  //                         } else {
  //                           // block all other typing
  //                           e.preventDefault();
  //                         }
  //                       }}
  //                       InputProps={{
  //                         readOnly: false, // 🔑 keep editable so keyDown works
  //                         endAdornment: (
  //                           <InputAdornment position="end">
  //                             <IconButton
  //                               onClick={() =>
  //                                 OpenDatagridAcctCodeModal(
  //                                   gridKey,
  //                                   params.row.id
  //                                 )
  //                               }
  //                               disabled={params.row.Status === "0"}
  //                               size="small"
  //                               color="primary"
  //                               style={{
  //                                 backgroundColor: "green",
  //                                 borderRadius: "10%",
  //                                 color: "white",
  //                                 padding: 2,
  //                               }}
  //                             >
  //                               <ViewListIcon />
  //                             </IconButton>
  //                           </InputAdornment>
  //                         ),
  //                       }}
  //                     />
  //                   )}
  //                 />
  //               ),
  //             };
  //           }

  //           return col;
  //         })}
  //         rows={rows}
  //         getRowId={(row) => row.id || row.LineNum}
  //         autoHeight={false}
  //         initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
  //         pageSizeOptions={[10]}
  //         sx={{
  //           minWidth: 600,
  //           backgroundColor:
  //             theme.palette.mode === "light" ? "#fff" : "#373842",
  //           "& .MuiDataGrid-cell": { border: "none" },
  //           "& .MuiDataGrid-cell:focus": { outline: "none" },
  //           "& .MuiDataGrid-columnHeaders": {
  //             position: "sticky",
  //             top: 0,
  //             zIndex: 1,
  //             backgroundColor: "red",
  //             fontWeight: "bold",
  //           },
  //         }}
  //       />
  //     </Box>
  //   );
  // };
  const keyParams = (companyCurrency) => ({
    // Previous Sales & Purchase accounts ...
    LinkAct_1: { locManTran: "Y", groupMask: "1" },
    LinkAct_9: { locManTran: "Y", groupMask: "1" },
    LinkAct_2: { locManTran: "N", finanse: "N" },
    LinkAct_3: { locManTran: "N", finanse: "Y", groupMask: "1,2" },
    OverpayAR: { locManTran: "N" },
    UndrpayAR: { locManTran: "N" },
    DpmSalAct: { locManTran: "N" },
    GLGainXdif: { locManTran: "N" },
    LinkAct_21: { locManTran: "N" },
    ARConDiffG: { locManTran: "N" },
    ARConDiffL: { locManTran: "N" },
    LinkAct_19: { locManTran: "N" },
    DfltIncom: { locManTran: "N", finanse: "N", groupMask: "4" },
    ARCMAct: { locManTran: "N", finanse: "N", groupMask: "4" },
    SalDpmInt: { locManTran: "N" },
    DunIntrst: { locManTran: "N" },
    DunFee: { locManTran: "N" },
    SaleVatOff: { locManTran: "N" },
    LinkAct_10: { locManTran: "Y", finanse: "N", groupMask: "2" },
    LinkAct_11: { locManTran: "Y", finanse: "N", groupMask: "2" },
    LinkAct_25: { locManTran: "N" },
    LinkAct_23: { locManTran: "N" },
    APConDiffG: { locManTran: "N" },
    APConDiffL: { locManTran: "N" },
    LinkAct_12: { locManTran: "N", finanse: "Y", groupMask: "1,2" },
    LinkAct_22: { locManTran: "N" },
    LinkAct_20: { locManTran: "N" },
    DfltExpn: { locManTran: "N" },
    APCMAct: { locManTran: "N" },
    OverpayAP: { locManTran: "N" },
    UndrpayAP: { locManTran: "N" },
    PurcVatOff: { locManTran: "N" },
    OnHoldAct: { locManTran: "N" },
    GSTInAct: { locManTran: "N" },

    // General Accounts
    ComissAct: { locManTran: "N", ActCurr: `${companyCurrency},AC` },
    LinkAct_24: { locManTran: "N", ActCurr: "AC" },
    LinkAct_27: { locManTran: "N" },
    LinkAct_28: { locManTran: "N" },
    LinkAct_26: { locManTran: "N" },
    GLLossXdif: { locManTran: "N" },
    GLConDiffG: { locManTran: "N" },
    GLConDiffL: { locManTran: "N" },
    LinkAct_18: { locManTran: "N" },
    BnkChgAct: { locManTran: "N" },
    ICClrAct: { locManTran: "N" },
    OCClrAct: { locManTran: "N" },
    PlaAct: { locManTran: "N" },
    TDSInterst: { locManTran: "N" },
    TDSCharges: { locManTran: "N" },
    TDSFee: { locManTran: "N" },

    // Inventory Accounts
    StockAct: { locManTran: "N" },
    COGM_Act: { locManTran: "N" },
    AlocCstAct: { locManTran: "N" },
    VariancAct: { locManTran: "N" },
    PricDifAct: { locManTran: "N" },
    NegStckAct: { locManTran: "N" },
    DfltLoss: { locManTran: "N" },
    DfltProfit: { locManTran: "N" },
    RturnngAct: { locManTran: "N" },
    ExDiffAct: { locManTran: "N" },
    BalanceAct: { locManTran: "N" },
    DecresGlAc: { locManTran: "N" },
    IncresGlAc: { locManTran: "N" },
    WipAcct: { locManTran: "N" },
    WipVarAcct: { locManTran: "N" },
    StockOffst: { locManTran: "N" },

    // Resources / Std Cost Expense Accounts
    ResStdExp1: { locManTran: "N" },
    ResStdExp2: { locManTran: "N" },
    ResStdExp3: { locManTran: "N" },
    ResStdExp4: { locManTran: "N" },
    ResStdExp5: { locManTran: "N" },
    ResStdExp6: { locManTran: "N" },
    ResStdExp7: { locManTran: "N" },
    ResStdExp8: { locManTran: "N" },
    ResStdExp9: { locManTran: "N" },
    ResStdEx10: { locManTran: "N" },
    ResWipAct: { locManTran: "N" },
    ResOffPlAc: { locManTran: "N" },
  });

  const OpenDatagridAcctCodeModal = (gridKey, rowId) => {
    const row = allGridsData[gridKey].find((r) => r.id === rowId);
    if (!row) return;

    const params = keyParams(companyCurrency)[row.keyName] || {};

    setSelectedAcctApiParams(params);
    setEditingRowId(rowId);
    setEditingGridKey(gridKey);
    setDatagridAcctCodeOpen(true);

    setModalCurrentPage(0);
    setModalSearchText("");

    // 🔥 focus FIRST CELL after modal opens
    setTimeout(() => {
      const api = DatagridApiRef.current;
      if (!api) return;

      const rows = api.getSortedRowIds();
      const cols = api.getVisibleColumns();

      if (rows.length && cols.length) {
        api.setCellFocus(rows[0], cols[0].field);
      }
    }, 0);
  };

  const setDatagridAcctCode = (selectedRow) => {
    setAllGridsData((prev) => ({
      ...prev,
      [editingGridKey]: prev[editingGridKey].map((row) =>
        row.id === editingRowId
          ? {
              ...row,
              AcctCode: selectedRow.AcctCode,
              AcctName: selectedRow.AcctName,
              keyName: row.keyName,
            }
          : row,
      ),
    }));
    setDatagridAcctCodeOpen(false);
  };
  const ColumnWIPMapping = [
    {
      field: "ConsolidateFromAcct",
      headerName: "Consolidate from Account",
      width: 300,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "ConsolidateToAcct",
      headerName: "Consolidate to Account",
      width: 300,
      headerAlign: "center",
      align: "center",
    },
  ];
  // =============================================Posting Period API================================================
const postingPeriodGetData = async () => {
  try {
    setIsLoading(true);

    const res = await apiClient.get(`/PostingPeriod/All`);

    if (res?.data?.success) {
      const response = res.data.values || [];
      setpostingPeriodData(response);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text:
          res?.data?.message ||
          "Failed to fetch Posting Period data.",
      });
    }
  } catch (error) {
    console.error("Posting Period fetch error:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        "Something went wrong while fetching Posting Period data.",
    });
  } finally {
    setIsLoading(false);
  }
};

  // =======================================API for Setting specific Cards data====================================
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
          setGLAccDaterminationData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setGLAccDaterminationData(DocEntry);
        setSaveUpdateName("UPDATE");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while setting business partner data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const hydrateGridsFromApi = (apiData, allGridsData, chartOfAccounts) => {
    const updated = {};

    for (const [gridKey, rows] of Object.entries(allGridsData)) {
      updated[gridKey] = rows.map((row) => {
        const acctCode = apiData[row.keyName] || "";
        const account = chartOfAccounts.find(
          (acct) => acct.AcctCode === acctCode,
        );

        return {
          ...row,
          AcctCode: acctCode,
          AcctName: account ? account.AcctName : "",
        };
      });
    }

    return updated;
  };

const setGLAccDaterminationData = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true);

    const response = await apiClient.get(`/GLAccDetermination/${DocEntry}`);

    // Handle API success false
    if (!response?.data?.success) {
      Swal.fire({
        title: "Warning",
        text: response?.data?.message || "Failed to fetch GL Account Determination data.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return; // Exit early if API returns success = false
    }

    const data = response.data.values || {};

    toggleDrawer();
    reset(data);
    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);

    // Hydrate grids
    setAllGridsData((prev) => hydrateGridsFromApi(data, prev, chartOfAccounts));

    // Receivables rows
    setAcctRecRows([
      {
        id: 1,
        AcctTypeName: "Down Payment Receivables",
        AcctCode: data.CDownPymnt || "",
        AcctName: getAcctName(data.CDownPymnt),
      },
      {
        id: 2,
        AcctTypeName: "Open Debts",
        AcctCode: data.COpenDebts || "",
        AcctName: getAcctName(data.COpenDebts),
      },
    ]);

    // Payables rows
    setAcctPayRows([
      {
        id: 1,
        AcctTypeName: "Down Payment Payables",
        AcctCode: data.VDownPymnt || "",
        AcctName: getAcctName(data.VDownPymnt),
      },
      {
        id: 2,
        AcctTypeName: "Open Debts",
        AcctCode: data.VOpenDebts || "",
        AcctName: getAcctName(data.VOpenDebts),
      },
    ]);
  } catch (error) {
    console.error("Error fetching GL Account Determination:", error);

    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || "An error occurred while fetching the data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

  // ======================================API for Initial Data List and Pagination ==================================
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
  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear search input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };
const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
  try {
    setLoading(true); // ✅ start loader

    const url = searchTerm
      ? `/GLAccDetermination/Search/${searchTerm}/1/${pageNum}/20`
      : `/GLAccDetermination/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);

    if (response.data.success) {
      const newData = response.data.values || [];

      if (newData.length === 0 && searchTerm) {
        Swal.fire({
          text: "No records found for your search",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );

      if (pageNum === 0 && !searchTerm && newData.length > 0) {
        setOldOpenData(newData[0].DocEntry);
      }
    } else {
      // API returned success = false
      Swal.fire({
        title: "Warning",
        text: response.data.message || "Failed to fetch Open List data.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || error.message || "Failed to fetch Open List data!",
      icon: "error",
      confirmButtonText: "OK",
    });
  } finally {
    setLoading(false); // ✅ stop loader
  }
};

  // =================================================useForm========================================================
  const { control, handleSubmit, reset, setValue, getValues, watch } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });
  // const allFormData = getValues();
  const WithHoldingTax = watch("WithHoldingTax");
  const PWithHoldingTax = watch("PWithHoldingTax");
  // =========================================PUT and POST API =======================================================
  const getRowMap = (allGridsData) => {
    const map = {};
    Object.values(allGridsData).forEach((rows) => {
      rows.forEach((row) => {
        if (row.keyName) {
          map[row.keyName] = row;
        }
      });
    });
    return map;
  };
  const mergeExtraRows = (rowMap, acctRecRows, acctPayRows) => {
    const extraMap = {};

    // Receivables → CDownPymnt
    const downPayRecv = acctRecRows.find(
      (r) => r.AcctTypeName === "Down Payment Receivables",
    );
    if (downPayRecv) {
      extraMap.CDownPymnt = downPayRecv;
    }

    // Payables → VDownPymnt
    const downPayPay = acctPayRows.find(
      (r) => r.AcctTypeName === "Down Payment Payables",
    );
    if (downPayPay) {
      extraMap.VDownPymnt = downPayPay;
    }

    // Open Debts (if you want both receivables and payables)
    const openDebtRecv = acctRecRows.find(
      (r) => r.AcctTypeName === "Open Debts",
    );
    if (openDebtRecv) {
      extraMap.COpenDebts = openDebtRecv;
    }
    const openDebtPay = acctPayRows.find(
      (r) => r.AcctTypeName === "Open Debts",
    );
    if (openDebtPay) {
      extraMap.VOpenDebts = openDebtPay;
    }

    return { ...rowMap, ...extraMap };
  };

  const buildApiPayload = (
    data,
    user,
    allGridsData,
    acctRecRows,
    acctPayRows,
  ) => {
    let rowMap = getRowMap(allGridsData);

    // 🔗 Merge extra rows into rowMap
    rowMap = mergeExtraRows(rowMap, acctRecRows, acctPayRows);
    return {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId || "",
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Status: "1",

      // Example of normal fields
      PeriodCat: "",
      Year: "",
      PeriodName: data.PeriodName,
      SubType: data.SubType || "",
      PeriodNum: "",
      F_RefDate: data.F_RefDate || "",
      T_RefDate: data.T_RefDate || "",
      F_DueDate: data.F_DueDate || "",
      T_DueDate: data.T_DueDate || "",
      F_TaxDate: data.F_TaxDate || "",
      T_TaxDate: data.T_TaxDate || "",

      // ✅ all account mapping (either from rowMap or empty string)
      LinkAct_1: rowMap.LinkAct_1?.AcctCode || "",
      LinkAct_2: rowMap.LinkAct_2?.AcctCode || "",
      LinkAct_3: rowMap.LinkAct_3?.AcctCode || "",
      LinkAct_4: rowMap.LinkAct_4?.AcctCode || "",
      LinkAct_5: rowMap.LinkAct_5?.AcctCode || "",
      LinkAct_6: rowMap.LinkAct_6?.AcctCode || "",
      ComissAct: rowMap.ComissAct?.AcctCode || "",
      LinkAct_8: rowMap.LinkAct_8?.AcctCode || "",
      LinkAct_9: rowMap.LinkAct_9?.AcctCode || "",
      LinkAct_10: rowMap.LinkAct_10?.AcctCode || "",
      LinkAct_11: rowMap.LinkAct_11?.AcctCode || "",
      LinkAct_12: rowMap.LinkAct_12?.AcctCode || "",
      LinkAct_13: rowMap.LinkAct_13?.AcctCode || "",
      LinkAct_14: rowMap.LinkAct_14?.AcctCode || "",
      LinkAct_15: rowMap.LinkAct_15?.AcctCode || "",
      LinkAct_16: rowMap.LinkAct_16?.AcctCode || "",
      LinkAct_17: rowMap.LinkAct_17?.AcctCode || "",
      LinkAct_18: rowMap.LinkAct_18?.AcctCode || "",
      DfltIncom: rowMap.DfltIncom?.AcctCode || "",
      ExmptIncom: rowMap.ExmptIncom?.AcctCode || "",
      DfltExpn: rowMap.DfltExpn?.AcctCode || "",
      ForgnIncm: rowMap.ForgnIncm?.AcctCode || "",
      ECIncome: rowMap.ECIncome?.AcctCode || "",
      ForgnExpn: rowMap.ForgnExpn?.AcctCode || "",
      DfltRateDi: rowMap.DfltRateDi?.AcctCode || "",
      DecresGlAc: rowMap.DecresGlAc?.AcctCode || "",
      LinkAct_27: rowMap.LinkAct_27?.AcctCode || "",
      DftStockOB: rowMap.DftStockOB?.AcctCode || "",
      LinkAct_19: rowMap.LinkAct_19?.AcctCode || "",
      LinkAct_20: rowMap.LinkAct_20?.AcctCode || "",
      LinkAct_21: rowMap.LinkAct_21?.AcctCode || "",
      LinkAct_22: rowMap.LinkAct_22?.AcctCode || "",
      LinkAct_23: rowMap.LinkAct_23?.AcctCode || "",
      LinkAct_24: rowMap.LinkAct_24?.AcctCode || "",
      LinkAct_25: rowMap.LinkAct_25?.AcctCode || "",
      LinkAct_26: rowMap.LinkAct_26?.AcctCode || "",
      IncresGlAc: rowMap.IncresGlAc?.AcctCode || "",
      RturnngAct: rowMap.RturnngAct?.AcctCode || "",
      COGM_Act: rowMap.COGM_Act?.AcctCode || "",
      AlocCstAct: rowMap.AlocCstAct?.AcctCode || "",
      VariancAct: rowMap.VariancAct?.AcctCode || "",
      PricDifAct: rowMap.PricDifAct?.AcctCode || "",
      CDownPymnt: rowMap.CDownPymnt?.AcctCode || "",
      VDownPymnt: rowMap.VDownPymnt?.AcctCode || "",
      CBoERcvble: rowMap.CBoERcvble?.AcctCode || "",
      CBoEOnClct: rowMap.CBoEOnClct?.AcctCode || "",
      CBoEPresnt: rowMap.CBoEPresnt?.AcctCode || "",
      CBoEDiscnt: rowMap.CBoEDiscnt?.AcctCode || "",
      CUnpaidBoE: rowMap.CUnpaidBoE?.AcctCode || "",
      VBoEPayble: rowMap.VBoEPayble?.AcctCode || "",
      VAsstBoEPy: rowMap.VAsstBoEPy?.AcctCode || "",
      COpenDebts: rowMap.COpenDebts?.AcctCode || "",
      VOpenDebts: rowMap.VOpenDebts?.AcctCode || "",
      PurchseAct: rowMap.PurchseAct?.AcctCode || "",
      PaReturnAc: rowMap.PaReturnAc?.AcctCode || "",
      PaOffsetAc: rowMap.PaOffsetAc?.AcctCode || "",
      LinkAct_28: rowMap.LinkAct_28?.AcctCode || "",
      ExDiffAct: rowMap.ExDiffAct?.AcctCode || "",
      BalanceAct: rowMap.BalanceAct?.AcctCode || "",
      BnkChgAct: rowMap.BnkChgAct?.AcctCode || "",
      LinkAct_29: rowMap.LinkAct_29?.AcctCode || "",
      LinkAct_30: rowMap.LinkAct_30?.AcctCode || "",
      IncmAcct: rowMap.IncmAcct?.AcctCode || "",
      ExpnAcct: rowMap.ExpnAcct?.AcctCode || "",
      VatRevAct: rowMap.VatRevAct?.AcctCode || "",
      ExpClrAct: rowMap.ExpClrAct?.AcctCode || "",
      ExpOfstAct: rowMap.ExpOfstAct?.AcctCode || "",
      CostRevAct: rowMap.CostRevAct?.AcctCode || "",
      RepomoAct: rowMap.RepomoAct?.AcctCode || "",
      WipVarAcct: rowMap.WipVarAcct?.AcctCode || "",
      SaleVatOff: rowMap.SaleVatOff?.AcctCode || "",
      PurcVatOff: rowMap.PurcVatOff?.AcctCode || "",
      DpmSalAct: rowMap.DpmSalAct?.AcctCode || "",
      DpmPurAct: rowMap.DpmPurAct?.AcctCode || "",
      ExpVarAct: rowMap.ExpVarAct?.AcctCode || "",
      CostOffAct: rowMap.CostOffAct?.AcctCode || "",
      ECExepnses: rowMap.ECExepnses?.AcctCode || "",
      StockAct: rowMap.StockAct?.AcctCode || "",
      DflInPrcss: rowMap.DflInPrcss?.AcctCode || "",
      DfltInCstm: rowMap.DfltInCstm?.AcctCode || "",
      DfltProfit: rowMap.DfltProfit?.AcctCode || "",
      DfltLoss: rowMap.DfltLoss?.AcctCode || "",
      VAssets: rowMap.VAssets?.AcctCode || "",
      StockRvAct: rowMap.StockRvAct?.AcctCode || "",
      StkRvOfAct: rowMap.StkRvOfAct?.AcctCode || "",
      WipAcct: rowMap.WipAcct?.AcctCode || "",
      DfltCard: data.DfltCard || "",
      ShpdGdsAct: rowMap.ShpdGdsAct?.AcctCode || "",
      GlRvOffAct: rowMap.GlRvOffAct?.AcctCode || "",
      OverpayAP: rowMap.OverpayAP?.AcctCode || "",
      UndrpayAP: rowMap.UndrpayAP?.AcctCode || "",
      OverpayAR: rowMap.OverpayAR?.AcctCode || "",
      UndrpayAR: rowMap.UndrpayAR?.AcctCode || "",
      ARCMAct: rowMap.ARCMAct?.AcctCode || "",
      ARCMExpAct: rowMap.ARCMExpAct?.AcctCode || "",
      ARCMFrnAct: rowMap.ARCMFrnAct?.AcctCode || "",
      ARCMEUAct: rowMap.ARCMEUAct?.AcctCode || "",
      APCMAct: rowMap.APCMAct?.AcctCode || "",
      APCMFrnAct: rowMap.APCMFrnAct?.AcctCode || "",
      APCMEUAct: rowMap.APCMEUAct?.AcctCode || "",
      NegStckAct: rowMap.NegStckAct?.AcctCode || "",
      StkInTnAct: rowMap.StkInTnAct?.AcctCode || "",
      GLGainXdif: rowMap.GLGainXdif?.AcctCode || "",
      GLLossXdif: rowMap.GLLossXdif?.AcctCode || "",
      AmountDiff: rowMap.AmountDiff?.AcctCode || "",
      SlfInvIncm: rowMap.SlfInvIncm?.AcctCode || "",
      SlfInvExpn: rowMap.SlfInvExpn?.AcctCode || "",
      OnHoldAct: rowMap.OnHoldAct?.AcctCode || "",
      PlaAct: rowMap.PlaAct?.AcctCode || "",
      ICClrAct: rowMap.ICClrAct?.AcctCode || "",
      OCClrAct: rowMap.OCClrAct?.AcctCode || "",
      PurBalAct: rowMap.PurBalAct?.AcctCode || "",
      WhICenAct: rowMap.WhICenAct?.AcctCode || "",
      WhOCenAct: rowMap.WhOCenAct?.AcctCode || "",
      SalDpmInt: rowMap.SalDpmInt?.AcctCode || "",
      PurDpmInt: rowMap.PurDpmInt?.AcctCode || "",
      ExrateOnDt: rowMap.ExrateOnDt?.AcctCode || "",
      UserSign2: rowMap.UserSign2?.AcctCode || "",
      EURecvAct: rowMap.EURecvAct?.AcctCode || "",
      EUPayAct: rowMap.EUPayAct?.AcctCode || "",
      WipOffset: rowMap.WipOffset?.AcctCode || "",
      StockOffst: rowMap.StockOffst?.AcctCode || "",
      DunIntrst: rowMap.DunIntrst?.AcctCode || "",
      DunFee: rowMap.DunFee?.AcctCode || "",
      SnapShotId: rowMap.SnapShotId?.AcctCode || "",
      TDSInterst: rowMap.TDSInterst?.AcctCode || "",
      TDSCharges: rowMap.TDSCharges?.AcctCode || "",
      SrvTaxClr: rowMap.SrvTaxClr?.AcctCode || "",
      ARConDiffG: rowMap.ARConDiffG?.AcctCode || "",
      ARConDiffL: rowMap.ARConDiffL?.AcctCode || "",
      APConDiffG: rowMap.APConDiffG?.AcctCode || "",
      APConDiffL: rowMap.APConDiffL?.AcctCode || "",
      GLConDiffG: rowMap.GLConDiffG?.AcctCode || "",
      GLConDiffL: rowMap.GLConDiffL?.AcctCode || "",
      FreeChrgSA: rowMap.FreeChrgSA?.AcctCode || "",
      FreeChrgPU: rowMap.FreeChrgPU?.AcctCode || "",
      TDSFee: rowMap.TDSFee?.AcctCode || "",
      ResRevenue: rowMap.ResRevenue?.AcctCode || "",
      ResExpense: rowMap.ResExpense?.AcctCode || "",
      ResSalesCr: rowMap.ResSalesCr?.AcctCode || "",
      ResPurchCr: rowMap.ResPurchCr?.AcctCode || "",
      ResNotInv: rowMap.ResNotInv?.AcctCode || "",
      ResStdExp1: rowMap.ResStdExp1?.AcctCode || "",
      ResStdExp2: rowMap.ResStdExp2?.AcctCode || "",
      ResStdExp3: rowMap.ResStdExp3?.AcctCode || "",
      ResStdExp4: rowMap.ResStdExp4?.AcctCode || "",
      ResStdExp5: rowMap.ResStdExp5?.AcctCode || "",
      ResStdExp6: rowMap.ResStdExp6?.AcctCode || "",
      ResStdExp7: rowMap.ResStdExp7?.AcctCode || "",
      ResStdExp8: rowMap.ResStdExp8?.AcctCode || "",
      ResStdExp9: rowMap.ResStdExp9?.AcctCode || "",
      ResStdEx10: rowMap.ResStdEx10?.AcctCode || "",
      ResWipAct: rowMap.ResWipAct?.AcctCode || "",
      ResScrapAc: rowMap.ResScrapAc?.AcctCode || "",
      WipOffPlAc: rowMap.WipOffPlAc?.AcctCode || "",
      ResOffPlAc: rowMap.ResOffPlAc?.AcctCode || "",
      ERDInARAct: rowMap.ERDInARAct?.AcctCode || "",
      ERDInAPAct: rowMap.ERDInAPAct?.AcctCode || "",
      CSDInARAct: rowMap.CSDInARAct?.AcctCode || "",
      CSDInAPAct: rowMap.CSDInAPAct?.AcctCode || "",
      GSTInAct: rowMap.GSTInAct?.AcctCode || "",
    };
  };
  const handleSubmitForm = async (data) => {
    //  const rowMap = getRowMap(allGridsData);
    const obj = buildApiPayload(
      data,
      user,
      allGridsData,
      acctRecRows,
      acctPayRows,
    );

    try {
      setLoading(true);
      if (SaveUpdateName === "SAVE") {
        const response = await apiClient.post(`/GLAccDetermination`, obj);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "G/L Account Determination Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update ?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/GLAccDetermination/${data.DocEntry}`,
            obj,
          );
          const { success, message } = response.data;
          if (success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "G/L Account Determination Updated",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        } else {
          Swal.fire({
            text: "G/L Account Determination not Updated!",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again later.";

      if (error?.response?.data) {
        const apiError = error.response.data;

        if (apiError.errors) {
          // Extract all error messages and join them
          const validationMessages = Object.values(apiError.errors)
            .flat()
            .join("\n");
          errorMessage = validationMessages;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        // icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  // =============================================Delete API =========================================================
  const handleOnDelete = async (data) => {
    try {
      setLoading(true);

      const result = await Swal.fire({
        text: "Do You Want to Delete?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        const response = await apiClient.delete(
          `/GLAccDetermination/${DocEntry}`,
        );
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: "G/L Account Determination Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error",
            text: message,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          text: "G/L Account Determination is Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while deleting the G/L Account Determination.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
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
          G/L Account Determination List
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
                    title={item.PeriodName}
                    subtitle={item.Description}
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
      <SearchModel
        open={searchmodelOpenBP}
        onClose={SearchModelClose1}
        onCancel={SearchModelClose1}
        title="BP List"
        onChange={(e) => handleGetListSearchBP(e.target.value)}
        value={getListqueryBP}
        onClickClear={handleGetListClearBP}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataBP.length}
              next={fetchMoreGetListDataBP}
              hasMore={hasMoreGetListBP}
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
              {getListDataBP.map((item, index) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.CardCode}
                  subtitle={item.CardName}
                  description={getListqueryBP}
                  onClick={() => {
                    onSelectRequestBP(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <Modal
        open={openDatagridAcctCode}
        onClose={closeModel}
        disableAutoFocus // Keep: Prevents modal from auto-focusing elsewhere
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "75%", sm: "75%", md: "75%", lg: "70%" },
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography
            textAlign="center"
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Account List
          </Typography>
          <Divider />
          <IconButton
            edge="end"
            color="inherit"
            aria-label="close"
            onClick={closeModel}
            sx={{
              position: "absolute",
              right: "12px",
              top: "0px",
            }}
          >
            <CloseIcon />
          </IconButton>
          <Grid
            container
            mt={2}
            sx={{ ml: 2, overflow: "auto", width: "100%", height: "50vh" }}
          >
            <Paper sx={{ width: "100%", height: "100%" }}>
              <DataGrid
                ref={datagridContainerRef} // NEW: Attach ref to make it focusable
                tabIndex={0} // NEW: Makes the DataGrid keyboard-focusable
                className="datagrid-style"
                apiRef={DatagridApiRef}
                onCellKeyDown={(params, event) =>
                  DatagridhandleCellKeyDown(params, event)
                }
                sx={{
                  height: "100%",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: (theme) =>
                      theme.palette.custome?.datagridcolor ||
                      theme.palette.grey[100],
                  },
                  "& .MuiDataGrid-row:hover": {
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                  },
                }}
                rows={DatagridAcctCodeRows}
                columns={DatagridAcctCodeList}
                pagination
                paginationMode="server"
                getRowId={(row) => row.DocEntry}
                rowCount={rowCount}
                paginationModel={{ page: modalCurrentPage, pageSize: LIMIT }}
                onPaginationModelChange={handleModalPaginationModelChange}
                onCellClick={(params) => setDatagridAcctCode(params.row)}
                loading={isLoading}
                initialState={{
                  pagination: { paginationModel: { pageSize: 8 } },
                  filter: {
                    filterModel: {
                      items: [],
                      quickFilterValues: [],
                    },
                  },
                }}
                disableColumnFilter
                disableColumnSelector
                disableDensitySelector
                slots={{ toolbar: GridToolbarQuickFilter }}
                slotProps={{
                  toolbar: {
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                onFilterModelChange={(model) => {
                  const quickFilterValue =
                    (model.quickFilterValues || []).join(" ") || "";
                  handleModalSearchChange(quickFilterValue);
                }}
              />
            </Paper>
          </Grid>
        </Box>
      </Modal>
      <DataGridCellClickModel
        open={isAcctRecDialogOpen}
        closeModel={() => setIsAcctRecDialogOpen(false)}
        isLoading={false} // This modal itself doesn't fetch data, its sub-modal does
        title="Accounts Receivables"
        getRowId={(row) => row.id}
        columns={AcctRecColumns}
        rows={acctRecRows}
        onCellClick={handleRowSelection}
        oLines={getValues("oLines") || []}
        limit={20}
        rowCount={acctRecRows?.length || 0}
      />
      <DataGridCellClickModel
        open={openAcctRecAcctCode}
        closeModel={() => setAcctRecAcctCodeOpen(false)}
        isLoading={acctRecModalIsLoading}
        title="Account List"
        getRowId={(row) => row.DocEntry}
        columns={AccRecAcctCodelist}
        rows={acctRecModalRows} // Use separate rows for this modal
        taxCurrentPage={acctRecModalCurrentPage}
        limit={LIMIT}
        onPaginationModelChange={handleAcctRecModalPaginationModelChange}
        onCellClick={(params) => handleAcctRecAcctCodeSelection(params.row)}
        searchText={acctRecModalSearchText}
        onSearchChange={handleAcctRecModalSearchChange}
        rowCount={acctRecModalRowCount}
        selectedRowIndex={getValues("selectedRowIndex")}
        oLines={getValues("oLines") || []}
        // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
      />

      <DataGridCellClickModel
        open={isAcctPayDialogOpen}
        closeModel={() => setIsAcctPayDialogOpen(false)}
        isLoading={false} // This modal itself doesn't fetch data, its sub-modal does
        title="Accounts Payable"
        getRowId={(row) => row.id}
        columns={AcctPayColumns}
        rows={acctPayRows}
        onCellClick={handleRowSelection}
        oLines={getValues("oLines") || []}
        limit={20}
        rowCount={acctPayRows?.length || 0}
      />
      <DataGridCellClickModel
        open={openAcctPayAcctCode}
        closeModel={() => setAcctPayAcctCodeOpen(false)}
        isLoading={acctPayModalIsLoading}
        title="Account List"
        getRowId={(row) => row.DocEntry}
        columns={AccPayAcctCodelist}
        rows={acctPayModalRows} // Use separate rows for this modal
        taxCurrentPage={acctPayModalCurrentPage}
        limit={LIMIT}
        onPaginationModelChange={handleAcctPayModalPaginationModelChange}
        onCellClick={(params) => handleAcctPayAcctCodeSelection(params.row)}
        searchText={acctPayModalSearchText}
        onSearchChange={handleAcctPayModalSearchChange}
        rowCount={acctPayModalRowCount}
        selectedRowIndex={getValues("selectedRowIndex")}
        oLines={getValues("oLines") || []}
        // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
      />

      {loading && <Loader open={loading} />}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
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
            onClick={clearFormData}
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
              G/L Account Determination
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
            >
              <Box
                width={"100%"}
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Box
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "light" ? "#fafafa" : "#080D2B",
                      width: "100%",
                      p: 1,
                      mb: 1,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4} lg={4} textAlign="left">
                        <Controller
                          name="PeriodName"
                          rules={{ required: "This field is required" }}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSearchSelectTextField
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              label="POSTING PERIOD"
                              data={postingPeriodData.map((unit) => ({
                                key: unit.Name,
                                value: unit.Name,
                              }))}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid container width={"100%"}>
                  <Box
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "light" ? "#fafafa" : "#080D2B",
                      width: "100%",
                      p: 1,
                    }}
                  >
                    <AppBar
                      position="static"
                      sx={{ backgroundColor: "transparent", boxShadow: "none" }}
                    >
                      <TabContext value={value}>
                        <Tabs
                          value={value}
                          onChange={handleChange}
                          sx={{
                            "& .MuiTab-root": {
                              textTransform: "none",
                              minWidth: 120,
                              margin: "0 5px",
                              borderRadius: "8px",
                              backgroundColor: "#fff",
                              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                              fontWeight: "bold",
                              color: "#555",
                              display: "flex",
                              flexDirection: "row", // icon + label inline
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              minHeight: "46px",
                            },
                            "& .MuiTab-root svg": {
                              fontSize: "20px",
                              color: "#555", // default icon color
                            },
                            "& .MuiTab-root.Mui-selected": {
                              backgroundColor: "#1976d2",
                              color: "white",
                              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                            },
                            "& .MuiTabs-indicator": {
                              display: "none",
                            },
                            "& .MuiTab-root.Mui-selected svg": {
                              color: "white", // ✅ icon white when selected
                            },
                          }}
                        >
                          <Tab
                            value="0"
                            icon={<ShoppingCart />}
                            label="Sales"
                          />
                          <Tab
                            value="1"
                            icon={<ShoppingBag />}
                            label="Purchasing"
                          />
                          <Tab value="2" icon={<Settings />} label="General" />
                          <Tab
                            value="3"
                            icon={<Inventory />}
                            label="Inventory"
                          />
                          <Tab value="4" icon={<People />} label="Resources" />
                          <Tab value="5" icon={<Build />} label="WIP Mapping" />
                        </Tabs>

                        {value === "0" && (
                          <TabContext value={SalesValue}>
                            <Box sx={{ mt: 1 }}>
                              <Tabs
                                value={SalesValue}
                                onChange={handleSalesChange}
                                sx={{
                                  minHeight: 32,
                                  borderBottom: "1px solid #e0e0e0",
                                  "& .MuiTab-root": {
                                    textTransform: "none",
                                    minHeight: 32,
                                    fontSize: "0.85rem",
                                    padding: "4px 10px",
                                    color: "#666",
                                  },
                                  "& .Mui-selected": {
                                    color: "#1976d2",
                                    fontWeight: 600,
                                  },
                                  "& .MuiTabs-indicator": {
                                    backgroundColor: "#1976d2",
                                    height: "2px",
                                  },
                                }}
                              >
                                <Tab label="GENERAL" value="0" />
                                <Tab label="TAX" value="1" />
                              </Tabs>

                              <TabPanel value="0">
                                <Box
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === "light"
                                        ? "#fafafa"
                                        : "#2a2a2a",
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                                    marginLeft: -2,
                                    marginRight: -3,
                                  }}
                                >
                                  <Grid
                                    container
                                    spacing={3}
                                    alignItems="center"
                                  >
                                    {/* Accounts Receivable */}
                                    <Grid item xs={12} md={4}>
                                      <Button
                                        variant="contained"
                                        startIcon={<ViewListIcon />}
                                        onClick={() =>
                                          setIsAcctRecDialogOpen(true)
                                        }
                                        sx={{ backgroundColor: "#1976d2" }}
                                      >
                                        Accounts Receivable
                                      </Button>
                                    </Grid>

                                    {/* Checkbox in the Middle */}
                                    <Grid item xs={12} md={4}>
                                      <Controller
                                        name="PCCtrlAcct"
                                        control={control}
                                        defaultValue={"Y"}
                                        render={({ field }) => (
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                {...field}
                                                checked={field.value === "Y"}
                                                onChange={(e) =>
                                                  field.onChange(
                                                    e.target.checked
                                                      ? "Y"
                                                      : "N",
                                                  )
                                                }
                                              />
                                            }
                                            label="Permit change of Control Accounts"
                                            sx={{ color: "#818589", m: 0 }}
                                          />
                                        )}
                                      />
                                    </Grid>

                                    {/* Default Customer */}
                                    <Grid item xs={12} md={4}>
                                      <Controller
                                        name="DfltCard"
                                        control={control}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <Tooltip
                                            title="Default customer for A/R Invoice and Payment"
                                            placement="top"
                                            arrow
                                          >
                                            <InputTextField
                                              fullWidth
                                              label="Default customer for A/R Invoice and Payment"
                                              {...field}
                                              readOnly
                                              InputLabelProps={{
                                                sx: { pr: 3 },
                                              }}
                                              InputProps={{
                                                endAdornment: (
                                                  <InputAdornment position="end">
                                                    <IconButton
                                                      onClick={OpenDailog1}
                                                      size="small"
                                                      color="primary"
                                                      sx={{
                                                        backgroundColor:
                                                          "green",
                                                        borderRadius: "10%",
                                                        color: "white",
                                                        p: "2px",
                                                      }}
                                                    >
                                                      <ViewListIcon />
                                                    </IconButton>
                                                  </InputAdornment>
                                                ),
                                              }}
                                              error={!!error}
                                              helperText={
                                                error ? error.message : null
                                              }
                                            />
                                          </Tooltip>
                                        )}
                                      />
                                    </Grid>
                                    <Box
                                      sx={{
                                        height: "50vh",
                                        overflowX: "auto",
                                        overflowY: "auto",
                                        width: "100%",
                                        mt: 2,
                                        p: 2,
                                      }}
                                    >
                                      <DataGrid
                                        className="datagrid-style"
                                        hideFooter
                                        apiRef={apiRef}
                                        onCellKeyDown={handleCellKeyDown}
                                        columns={ColumnFields("SalesGeneral")}
                                        rows={allGridsData.SalesGeneral}
                                        getRowId={(row) =>
                                          row.id || row.LineNum
                                        }
                                        autoHeight={false}
                                        initialState={{
                                          pagination: {
                                            paginationModel: { pageSize: 100 },
                                          },
                                        }}
                                        pageSizeOptions={[10]}
                                        sx={gridSx}
                                      />
                                    </Box>
                                  </Grid>
                                </Box>
                              </TabPanel>
                              <TabPanel value="1">
                                <Box
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === "light"
                                        ? "#fafafa"
                                        : "#2a2a2a",
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                                    marginLeft: -2,
                                    marginRight: -3,
                                  }}
                                >
                                  {/* Form Fields */}
                                  <Grid
                                    container
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    {/* Withholding Tax Checkbox */}
                                    <Grid item xs={12} md={4}>
                                      <Controller
                                        name="WithHoldingTax"
                                        control={control}
                                        defaultValue={"N"}
                                        render={({ field }) => (
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                {...field}
                                                checked={field.value === "Y"}
                                                disabled
                                                onChange={(e) =>
                                                  field.onChange(
                                                    e.target.checked
                                                      ? "Y"
                                                      : "N",
                                                  )
                                                }
                                              />
                                            }
                                            label="Withholding Tax"
                                            sx={{ color: "#818589", m: 0 }}
                                          />
                                        )}
                                      />
                                    </Grid>

                                    {WithHoldingTax === "Y" && (
                                      <>
                                        {/* NI Number */}
                                        <Grid item xs={12} md={4}>
                                          <Controller
                                            name="NINumber"
                                            control={control}
                                            render={({
                                              field,
                                              fieldState: { error },
                                            }) => (
                                              <InputTextField
                                                fullWidth
                                                label="NI Number"
                                                {...field}
                                                error={!!error}
                                                helperText={
                                                  error ? error.message : null
                                                }
                                              />
                                            )}
                                          />
                                        </Grid>

                                        {/* Expiration Date */}
                                        <Grid item xs={12} md={4}>
                                          <Controller
                                            name="ExpirationDate"
                                            control={control}
                                            render={({
                                              field,
                                              fieldState: { error },
                                            }) => (
                                              <SelectedDatePickerField
                                                fullWidth
                                                label="Expiration Date"
                                                name={field.name}
                                                value={
                                                  field.value
                                                    ? dayjs(field.value)
                                                    : undefined
                                                }
                                                onChange={(date) => {
                                                  field.onChange(
                                                    date
                                                      ? date.toISOString()
                                                      : undefined,
                                                  );
                                                  setValue(
                                                    "ExpirationDate",
                                                    date,
                                                  );
                                                }}
                                                error={!!error}
                                                helperText={
                                                  error ? error.message : null
                                                }
                                              />
                                            )}
                                          />
                                        </Grid>

                                        {/* Default Withholding Tax Code */}
                                        <Grid item xs={12} md={4}>
                                          <Controller
                                            name="DfltWHTaxCode"
                                            control={control}
                                            render={({
                                              field,
                                              fieldState: { error },
                                            }) => (
                                              <Tooltip
                                                title="Default Withholding Tax Code"
                                                placement="top"
                                                arrow
                                              >
                                                <InputTextFieldLarge
                                                  fullWidth
                                                  readOnly
                                                  label="Default Withholding Tax Code"
                                                  {...field}
                                                  InputProps={{
                                                    endAdornment: (
                                                      <InputAdornment position="end">
                                                        <IconButton
                                                          size="small"
                                                          color="primary"
                                                          sx={{
                                                            backgroundColor:
                                                              "green",
                                                            borderRadius: "10%",
                                                            color: "white",
                                                            p: "2px",
                                                          }}
                                                        >
                                                          <ViewListIcon />
                                                        </IconButton>
                                                      </InputAdornment>
                                                    ),
                                                  }}
                                                  error={!!error}
                                                  helperText={
                                                    error ? error.message : null
                                                  }
                                                />
                                              </Tooltip>
                                            )}
                                          />
                                        </Grid>

                                        {/* Certificate No */}
                                        <Grid item xs={12} md={4}>
                                          <Controller
                                            name="CertificateNo"
                                            control={control}
                                            render={({
                                              field,
                                              fieldState: { error },
                                            }) => (
                                              <InputTextField
                                                fullWidth
                                                label="Certificate No"
                                                {...field}
                                                error={!!error}
                                                helperText={
                                                  error ? error.message : null
                                                }
                                              />
                                            )}
                                          />
                                        </Grid>
                                      </>
                                    )}
                                  </Grid>

                                  {/* DataGrid Section */}
                                  <Box
                                    sx={{
                                      height: "50vh",
                                      overflowX: "auto",
                                      overflowY: "auto",
                                      width: "100%",
                                      mt: 2,
                                    }}
                                  >
                                    <DataGrid
                                      className="datagrid-style"
                                      hideFooter
                                      columns={ColumnFields("SalesTax")}
                                      apiRef={SalesTaxApiRef}
                                      onCellKeyDown={SalesTaxhandleCellKeyDown}
                                      rows={allGridsData.SalesTax}
                                      getRowId={(row) => row.id || row.LineNum}
                                      autoHeight={false}
                                      initialState={{
                                        pagination: {
                                          paginationModel: { pageSize: 100 },
                                        },
                                      }}
                                      pageSizeOptions={[10]}
                                      sx={gridSx}
                                    />
                                  </Box>
                                </Box>
                              </TabPanel>
                            </Box>
                          </TabContext>
                        )}
                        {value === "1" && (
                          <TabContext value={PurchaseValue}>
                            <Box sx={{ mt: 1 }}>
                              <Tabs
                                value={PurchaseValue}
                                onChange={handlePurchaseChange}
                              >
                                <Tab label="General" value="0" />
                                <Tab label="Tax" value="1" />
                              </Tabs>
                              <TabPanel value="0">
                                <Box
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === "light"
                                        ? "#fafafa"
                                        : "#2a2a2a",
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                                    marginLeft: -2,
                                    marginRight: -3,
                                  }}
                                >
                                  {/* Top Fields */}
                                  <Grid
                                    container
                                    spacing={3}
                                    alignItems="center"
                                  >
                                    {/* Accounts Payable */}
                                    <Grid item xs={12} md={4}>
                                      <Button
                                        variant="contained"
                                        startIcon={<ViewListIcon />}
                                        onClick={() =>
                                          setIsAcctPayDialogOpen(true)
                                        }
                                        sx={{ backgroundColor: "#1976d2" }}
                                      >
                                        Accounts Payable
                                      </Button>
                                    </Grid>

                                    {/* Checkbox */}
                                    <Grid item xs={12} md={4}>
                                      <Controller
                                        name="PCCtrlAcct"
                                        control={control}
                                        defaultValue={"Y"}
                                        render={({ field }) => (
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                {...field}
                                                checked={field.value === "Y"}
                                                onChange={(e) =>
                                                  field.onChange(
                                                    e.target.checked
                                                      ? "Y"
                                                      : "N",
                                                  )
                                                }
                                              />
                                            }
                                            label="Permit change of Control Accounts"
                                            sx={{ color: "#818589", m: 0 }}
                                          />
                                        )}
                                      />
                                    </Grid>
                                  </Grid>

                                  {/* DataGrid - neatly aligned, no margin left */}
                                  <Box
                                    sx={{
                                      height: "50vh",
                                      overflowX: "auto",
                                      overflowY: "auto",
                                      width: "100%",
                                      mt: 2,
                                    }}
                                  >
                                    <DataGrid
                                      className="datagrid-style"
                                      hideFooter
                                      apiRef={PurchaseGeneralApiRef}
                                      onCellKeyDown={
                                        PurchaseGeneralhandleCellKeyDown
                                      }
                                      columns={ColumnFields("PurchaseGeneral")}
                                      rows={allGridsData.PurchaseGeneral}
                                      getRowId={(row) => row.id || row.LineNum}
                                      autoHeight={false}
                                      initialState={{
                                        pagination: {
                                          paginationModel: { pageSize: 100 },
                                        },
                                      }}
                                      pageSizeOptions={[10]}
                                      sx={gridSx}
                                    />
                                  </Box>
                                </Box>
                              </TabPanel>
                              <TabPanel value="1">
                                <Box
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === "light"
                                        ? "#fafafa"
                                        : "#2a2a2a",
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                                    marginLeft: -2,
                                    marginRight: -3,
                                  }}
                                >
                                  {/* Top Fields */}
                                  <Grid
                                    container
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    {/* Withholding Tax Checkbox */}
                                    <Grid item xs={12} md={4}>
                                      <Controller
                                        name="PWithHoldingTax"
                                        control={control}
                                        defaultValue={"N"}
                                        render={({ field }) => (
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                {...field}
                                                checked={field.value === "Y"}
                                                disabled
                                                onChange={(e) =>
                                                  field.onChange(
                                                    e.target.checked
                                                      ? "Y"
                                                      : "N",
                                                  )
                                                }
                                              />
                                            }
                                            label="Withholding Tax"
                                            sx={{ color: "#818589", m: 0 }}
                                          />
                                        )}
                                      />
                                    </Grid>

                                    {/* Default Withholding Tax Code */}
                                    {PWithHoldingTax === "Y" && (
                                      <Grid item xs={12} md={4}>
                                        <Controller
                                          name="DfltWHTaxCode"
                                          control={control}
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <Tooltip
                                              title="Default Withholding Tax Code"
                                              placement="top"
                                              arrow
                                            >
                                              <InputTextField
                                                fullWidth
                                                readOnly
                                                label="Default Withholding Tax Code"
                                                {...field}
                                                InputProps={{
                                                  endAdornment: (
                                                    <InputAdornment position="end">
                                                      <IconButton
                                                        // onClick={() => setTaxCodeOpen(true)}
                                                        size="small"
                                                        color="primary"
                                                        sx={{
                                                          backgroundColor:
                                                            "green",
                                                          borderRadius: "10%",
                                                          color: "white",
                                                          p: "2px",
                                                        }}
                                                      >
                                                        <ViewListIcon />
                                                      </IconButton>
                                                    </InputAdornment>
                                                  ),
                                                }}
                                                error={!!error}
                                                helperText={
                                                  error ? error.message : null
                                                }
                                              />
                                            </Tooltip>
                                          )}
                                        />
                                      </Grid>
                                    )}

                                    {/* Capital Goods Percent */}
                                    <Grid item xs={12} md={4}>
                                      <Controller
                                        name="CapitalGoodsPr"
                                        control={control}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <Tooltip
                                            title="Capital Goods on Hold Percent (0-100)"
                                            placement="top"
                                            arrow
                                          >
                                            <InputTextField
                                              fullWidth
                                              label="Capital Goods on Hold Percent"
                                              {...field}
                                              error={!!error}
                                              helperText={
                                                error ? error.message : null
                                              }
                                              inputProps={{
                                                inputMode: "decimal",
                                                pattern: "^[0-9]*[.,]?[0-9]*$",
                                                maxLength: 6,
                                                onKeyDown: (e) => {
                                                  if (
                                                    e.key === "-" ||
                                                    e.key === "e"
                                                  )
                                                    e.preventDefault();
                                                },
                                              }}
                                              onChange={(e) => {
                                                let val = e.target.value;
                                                if (val === "") {
                                                  field.onChange("");
                                                  return;
                                                }
                                                let num = parseFloat(val);
                                                if (isNaN(num)) {
                                                  field.onChange("");
                                                  return;
                                                }
                                                if (num < 0) num = 0;
                                                if (num > 100) num = 100;
                                                field.onChange(num.toString());
                                              }}
                                              onBlur={() => {
                                                let num = parseFloat(
                                                  field.value,
                                                );
                                                if (isNaN(num)) {
                                                  field.onChange("");
                                                  return;
                                                }
                                                if (num < 0) num = 0;
                                                if (num > 100) num = 100;
                                                field.onChange(num.toString());
                                              }}
                                            />
                                          </Tooltip>
                                        )}
                                      />
                                    </Grid>

                                    {/* Capital Goods Amount */}
                                    <Grid item xs={12} md={4}>
                                      <Controller
                                        name="CapitalGoodsAmt"
                                        control={control}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <Tooltip
                                            title="Capital Goods on Hold Amount List"
                                            placement="top"
                                            arrow
                                          >
                                            <InputTextField
                                              fullWidth
                                              label="Capital Goods on Hold Amount List"
                                              {...field}
                                              error={!!error}
                                              helperText={
                                                error ? error.message : null
                                              }
                                            />
                                          </Tooltip>
                                        )}
                                      />
                                    </Grid>
                                  </Grid>

                                  {/* DataGrid neatly aligned */}

                                  <Box
                                    sx={{
                                      height: "50vh",
                                      overflowX: "auto",
                                      overflowY: "auto",
                                      width: "100%",
                                      mt: 2,
                                    }}
                                  >
                                    <DataGrid
                                      className="datagrid-style"
                                      hideFooter
                                      apiRef={PurchaseTaxApiRef}
                                      onCellKeyDown={
                                        PurchaseTaxhandleCellKeyDown
                                      }
                                      columns={ColumnFields("PurchaseTax")}
                                      rows={allGridsData.PurchaseTax}
                                      getRowId={(row) => row.id || row.LineNum}
                                      autoHeight={false}
                                      initialState={{
                                        pagination: {
                                          paginationModel: { pageSize: 100 },
                                        },
                                      }}
                                      pageSizeOptions={[10]}
                                      sx={gridSx}
                                    />
                                  </Box>
                                </Box>
                              </TabPanel>
                            </Box>
                          </TabContext>
                        )}
                        {value === "2" && (
                          <Box
                            sx={{
                              backgroundColor:
                                theme.palette.mode === "light"
                                  ? "#fafafa"
                                  : "#2a2a2a",
                              p: 3,
                              borderRadius: 3,
                              boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                              mt: 2,
                            }}
                          >
                            <Box
                              sx={{
                                height: "50vh",
                                overflowX: "auto",
                                overflowY: "auto",
                                width: "100%",
                                mt: 2,
                              }}
                            >
                              <DataGrid
                                className="datagrid-style"
                                hideFooter
                                apiRef={GeneralApiRef}
                                onCellKeyDown={GeneralhandleCellKeyDown}
                                columns={ColumnFields("General")}
                                rows={allGridsData.General}
                                getRowId={(row) => row.id || row.LineNum}
                                autoHeight={false}
                                initialState={{
                                  pagination: {
                                    paginationModel: { pageSize: 100 },
                                  },
                                }}
                                pageSizeOptions={[10]}
                                sx={gridSx}
                              />
                            </Box>
                          </Box>
                        )}

                        {value === "3" && (
                          <Box
                            sx={{
                              backgroundColor:
                                theme.palette.mode === "light"
                                  ? "#fafafa"
                                  : "#2a2a2a",
                              p: 3,
                              borderRadius: 3,
                              boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                              mt: 2,
                            }}
                          >
                            <Box
                              sx={{
                                height: "50vh",
                                overflowX: "auto",
                                overflowY: "auto",
                                width: "100%",
                                mt: 2,
                              }}
                            >
                              <DataGrid
                                className="datagrid-style"
                                hideFooter
                                apiRef={InventoryApiRef}
                                onCellKeyDown={InventoryhandleCellKeyDown}
                                columns={ColumnFields("Inventory")}
                                rows={allGridsData.Inventory}
                                getRowId={(row) => row.id || row.LineNum}
                                autoHeight={false}
                                initialState={{
                                  pagination: {
                                    paginationModel: { pageSize: 100 },
                                  },
                                }}
                                pageSizeOptions={[10]}
                                sx={gridSx}
                              />
                            </Box>
                          </Box>
                        )}

                        {value === "4" && (
                          <Box
                            sx={{
                              backgroundColor:
                                theme.palette.mode === "light"
                                  ? "#fafafa"
                                  : "#2a2a2a",
                              p: 3,
                              borderRadius: 3,
                              boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                              mt: 2,
                            }}
                          >
                            <Box
                              sx={{
                                height: "50vh",
                                overflowX: "auto",
                                overflowY: "auto",
                                width: "100%",
                                mt: 2,
                              }}
                            >
                              <DataGrid
                                className="datagrid-style"
                                hideFooter
                                apiRef={ResourcesApiRef}
                                onCellKeyDown={ResourceshandleCellKeyDown}
                                columns={ColumnFields("Resources")}
                                rows={allGridsData.Resources}
                                getRowId={(row) => row.id || row.LineNum}
                                autoHeight={false}
                                initialState={{
                                  pagination: {
                                    paginationModel: { pageSize: 100 },
                                  },
                                }}
                                pageSizeOptions={[10]}
                                sx={gridSx}
                              />
                            </Box>
                          </Box>
                        )}

                        {value === "5" && (
                          <Box
                            sx={{
                              backgroundColor:
                                theme.palette.mode === "light"
                                  ? "#fafafa"
                                  : "#2a2a2a",
                              p: 3,
                              borderRadius: 3,
                              boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                              mt: 2,
                              width: "100%",
                              height: "50vh",
                              // minHeight: "300px",
                              // maxHeight: "500px",
                            }}
                          >
                            <DataGrid
                              className="datagrid-style"
                              hideFooter
                              columns={ColumnWIPMapping}
                              // rows={checkTabRows}
                              getRowId={(row) => row.id || row.LineNum}
                              autoHeight={false}
                              // initialState={{
                              //   pagination: {
                              //     paginationModel: { pageSize: 100 },
                              //   },
                              // }}
                              // pageSizeOptions={[10]}
                              sx={gridSx}
                            />
                          </Box>
                        )}
                      </TabContext>
                    </AppBar>

                    {/* <Divider /> */}
                  </Box>
                </Grid>
              </Box>
            </Grid>

            <Grid
              item
              px={1}
              // md={12}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
                bottom: "0px",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                name={SaveUpdateName}
                color="success"
                sx={{ color: "white" }}
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                disabled={SaveUpdateName === "SAVE"}
                color="error"
                onClick={handleOnDelete}
              >
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
