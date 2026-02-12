import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import CardComponent from "../Components/CardComponent";
import SearchInputField from "../Components/SearchInputField";
// import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { TabContext, TabPanel } from "@mui/lab";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import { TimeDelay } from "../Components/TimeDelay";

import dayjs from "dayjs";
import useAuth from "../../Routing/AuthContext";
import {
  InputFields,
  InputSelectTextField,
  InputTextField,
  InputTextSearchButtonTable,
} from "../Components/formComponents";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { DataGrid } from "@mui/x-data-grid";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import { Loader } from "../Components/Loader";

export default function ItemGroup() {
  const theme = useTheme();
  const perms = usePermissions(34);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [tabvalue, settabvalue] = useState(0);

  // const [searchTextOpen, setSearchTextOpen] = useState("");
  // const [openPosts, setOpenPosts] = useState([]);
  // const [openSearchPosts, setOpenSearchPosts] = useState([]);
  // const [Rvalue, setRValue] = React.useState("female");
  const [selectedUgpDocEntry, setSelectedUgpDocEntry] = useState(null);
  let [ok, setok] = useState("OK");
  const { user } = useAuth();

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //=====================================Close List State====================================================================
  const [CloseListData, setCloseListData] = useState([]);
  const [CloseListPage, setCloseListPage] = useState(0);
  const [hasMoreClose, setHasMoreClose] = useState(true);
  const [CloseListquery, setCloseListQuery] = useState("");
  const [CloseListSearching, setCloseListSearching] = useState(false);

  const [uomGroups, setUomGroups] = useState([]); // Holds UOM group data

  //=====================================get List State====================================================================
  const [DocEntry, setDocEntry] = useState("");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");

  //=====================================Redio button====================================================================
  const [showFields, setShowFields] = useState(true);
  const timeoutRef = useRef(null);

  //====================================WAREHOUSE MODAL============================================

  const [getListqueryWarehouse, setGetListQueryWarehouse] = useState("");
  const [getListSearchingWarehouse, setGetListSearching] = useState(false);
  const [getListDataWarehouse, setgetListDataWarehouse] = useState([]);
  const [getListPageWarehouse, setgetListPageWarehouse] = useState(0);
  const [hasMoreGetListWarehouse, sethasMoreGetListWarehouse] = useState(true);
  const [searchmodelOpenWarehouse, setsearchmodelOpenWarehouse] =
    useState(false);

  //====================================UOM MODAL============================================

  const [getListqueryUOM, setGetListQueryUOM] = useState("");
  const [getListSearchingUOM, setGetListSearchingUOM] = useState(false);
  const [getListDataUOM, setgetListDataUOM] = useState([]);
  const [getListPageUOM, setgetListPageUOM] = useState(0);
  const [hasMoreGetListUOM, sethasMoreGetListUOM] = useState(true);
  const [searchmodelOpenUOM, setsearchmodelOpenUOM] = useState(false);

  const [getListqueryBin, setGetListQueryWarehouse1] = useState("");
  const [getListSearchingWarehouse1, setGetListSearching1] = useState(false);
  const [getListDataBin, setgetListDataWarehouse1] = useState([]);
  const [getListPageWarehouse1, setgetListPageWarehouse1] = useState(0);
  const [HasMoreGetListBin, sethasMoreGetListWarehouse1] = useState(true);
  const [SearchModalOpenBin, SearchModelOpenBinlocation] = useState(false);
  const [httpRequestToken, setCancelToken] = useState();
  const [selectedData, setSelectedData] = useState([]);

  //Accounting Tab
  const [openDatagridAcctCode, setDatagridAcctCodeOpen] = useState(false);
  const [DatagridAcctCodeRows, setDatagridAcctCodeRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingGridKey, setEditingGridKey] = useState("");
  const [chartOfAccounts, setChartOfAccounts] = useState([]);

  const [GLAcctDeterminationData, setGLAcctDeterminationData] = useState([]);
  const [accountLists, setAccountLists] = useState({});
  const LIMIT = 20;
  const [loading, setLoading] = useState(false);

  const initialFormData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: "",
    ModifiedBy: "",
    ModifiedDate: "",
    Status: "1",
    ItmsGrpNam: "",
    MinOrdrQty: "",
    LeadTime: "",
    ToleranDay: "",
    PlaningSys: "N",
    PrcrmntMtd: "B",
    WHSCode: "",
    WhsName: "",
    BinCode: "",
    UgpCode: "",
    InvntSys: "F",
    Alert: "",
    ItemClass: "",
  };

  const { control, handleSubmit, reset, setValue, getValues, watch } = useForm({
    defaultValues: initialFormData,
    shouldUnregister: false,
  });
  const { isDirty } = useFormState({ control });

  const handleTabChange = (event, newValue) => settab(newValue);
  const handleMainTab = (event, newValue) => settabvalue(newValue);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDrawer = () => setSidebarOpen(!sidebarOpen);
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );

  //=========================================Accounting Tab========================================================
  const getChartOfAccounts = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/ChartOfAccounts/All`);
      const { success, values, message } = res.data;

      if (success) {
        setChartOfAccounts(values || []);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Error",
          text: message || "Failed to fetch Chart of Accounts.",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching ChartOfAccounts:", error);

      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An unexpected error occurred while fetching Chart of Accounts.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
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
      width: 180,
      renderCell: (params) => (
        <InputTextField
          value={params.row.AcctCode || ""}
          readOnly
          sx={{ width: 160 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    OpenDatagridAcctCodeModal("Accounting", params.row.id)
                  }
                  disabled={params.row.Status === "0"}
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
      ),
    },
    {
      field: "AcctName",
      headerName: "Account Name",
      width: 200,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <Tooltip title={params.row.AcctName || ""} arrow>
          <span>{params.row.AcctName || ""}</span>
        </Tooltip>
      ),
    },
    // {
    //   field: "CurrTotal",
    //   headerName: "Balance",
    //   width: 300,
    //   headerAlign: "left",
    //   align: "left",
    //   renderCell: (params) => <span>{params.row.CurrTotal || ""}</span>,
    // },
  ];
  const GLAcctData = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/GLAccDetermination/All`);
      const { success, values, message } = res.data;

      if (success) {
        setGLAcctDeterminationData(values || []);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Error",
          text: message || "Failed to fetch GL Account Determination.",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching GL Account Determination:", error);

      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An unexpected error occurred while fetching GL Account Determination.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const setDatagridAcctCode = (account) => {
    setAllGridsData((prev) => ({
      ...prev,
      [editingGridKey]: prev[editingGridKey].map((row) =>
        row.id === editingRowId
          ? {
              ...row,
              AcctCode: account.AcctCode,
              AcctName: account.AcctName,
              CurrTotal: account.CurrTotal,
            }
          : row,
      ),
    }));
    setDatagridAcctCodeOpen(false);
  };
  const handleSearchChange = useCallback((searchText) => {
    setSearchText(searchText);
    setCurrentPage(0); // Reset to first page when searching
  }, []);
  const handlePaginationModelChange = useCallback(
    (model) => {
      if (model.page !== currentPage) {
        setCurrentPage(model.page);
      }
    },
    [currentPage],
  );
  const DatagridAcctCodeList = [
    // {
    //   field: "select",
    //   headerName: "",
    //   width: 50,
    //   sortable: false,
    //   renderCell: (params) => (
    //     <Checkbox
    //       checked={selectedAcctRowId === params.row.DocEntry} // only one row selected
    //       onChange={(e) => handleCheckboxToggle(params.row, e.target.checked)}
    //     />
    //   ),
    // },
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
      width: 250,
      editable: true,
    },
    {
      field: "CurrTotal",
      headerName: "Balance",
      width: 250,
      editable: true,
    },
  ];
  const Accounting = [
    {
      id: 1,
      SrNo: 1,
      keyName: "ExpensesAc",
      TypeOfAcct: "Expense Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 2,
      SrNo: 2,
      keyName: "RevenuesAc",
      TypeOfAcct: "Revenue Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 3,
      SrNo: 3,
      keyName: "BalInvntAc",
      TypeOfAcct: "Inventory Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 4,
      SrNo: 4,
      keyName: "SaleCostAc",
      TypeOfAcct: "Cost of Goods Sold Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 5,
      SrNo: 5,
      keyName: "TransferAc",
      TypeOfAcct: "Allocation Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 6,
      SrNo: 6,
      keyName: "VarianceAc",
      TypeOfAcct: "Variance Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 7,
      SrNo: 7,
      keyName: "NegStckAct",
      TypeOfAcct: "Negative Inventory Adjustment Acct",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 8,
      SrNo: 8,
      keyName: "DecreasAc",
      TypeOfAcct: "Inventory Offset - Decrease Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 9,
      SrNo: 9,
      keyName: "IncreasAc",
      TypeOfAcct: "Inventory Offset - Increase Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 10,
      SrNo: 10,
      keyName: "ReturnAc",
      TypeOfAcct: "Sales Returns Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 11,
      SrNo: 11,
      keyName: "ExchangeAc",
      TypeOfAcct: "Exchange Rate Differences Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 12,
      SrNo: 12,
      keyName: "BalanceAcc",
      TypeOfAcct: "Goods Clearing Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 13,
      SrNo: 13,
      keyName: "DecresGlAc",
      TypeOfAcct: "G/L Decrease Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 14,
      SrNo: 14,
      keyName: "IncresGlAc",
      TypeOfAcct: "G/L Increase Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 15,
      SrNo: 15,
      keyName: "WipAcct",
      TypeOfAcct: "WIP Inventory Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 16,
      SrNo: 16,
      keyName: "WipVarAcct",
      TypeOfAcct: "WIP Inventory Variance Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 17,
      SrNo: 17,
      keyName: "WipOffset",
      TypeOfAcct: "WIP Offset P&L Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 18,
      SrNo: 18,
      keyName: "ExpClrAct",
      TypeOfAcct: "Expense Clearing Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 19,
      SrNo: 19,
      keyName: "ShpdGdsAct",
      TypeOfAcct: "Shipped Goods Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 20,
      SrNo: 20,
      keyName: "ARCMAct",
      TypeOfAcct: "Sales Credit Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 21,
      SrNo: 21,
      keyName: "APCMAct",
      TypeOfAcct: "Purchase Credit Account",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 22,
      SrNo: 22,
      keyName: "WhICenAct",
      TypeOfAcct: "Incoming CENVAT Account (WH)",
      AcctCode: "",
      AcctName: "",
    },
    {
      id: 23,
      SrNo: 23,
      keyName: "WhOCenAct",
      TypeOfAcct: "Outgoing CENVAT Account (WH)",
      AcctCode: "",
      AcctName: "",
    },
  ];
  const OpenDatagridAcctCodeModal = (gridKey, rowId) => {
    setEditingRowId(rowId);
    setEditingGridKey(gridKey);

    // Get all accounts for this row's keyName
    const row = allGridsData[gridKey].find((r) => r.id === rowId);
    const keyName = row?.keyName;
    setDatagridAcctCodeRows(accountLists[keyName] || []);

    setDatagridAcctCodeOpen(true);
  };

  const [allGridsData, setAllGridsData] = useState({
    Accounting: Accounting,
  });
  const defaultAcctCodes = {
    ExpensesAc: "DfltExpn",
    RevenuesAc: "DfltIncom",
    BalInvntAc: "StockAct",
    SaleCostAc: "COGM_Act",
    TransferAc: "AlocCstAct",
    VarianceAc: "VariancAct",
    NegStckAct: "NegStckAct",
    DecreasAc: "DfltLoss",
    IncreasAc: "DfltProfit",
    ReturnAc: "RturnngAct",
    ExchangeAc: "ExDiffAct",
    BalanceAcc: "BalanceAct",
    DecresGlAc: "DecresGlAc",
    IncresGlAc: "IncresGlAc",
    WipAcct: "WipAcct",
    WipVarAcct: "WipVarAcct",
    WipOffset: "WipOffset",
    ExpClrAct: "ExpClrAct",
    ShpdGdsAct: "ShpdGdsAct",
    ARCMAct: "ARCMAct",
    APCMAct: "APCMAct",
    WhICenAct: "WhICenAct",
    WhOCenAct: "WhOCenAct",
  };
  const defaultsFetched = useRef(false);

  const fetchAndSetDefaults = async () => {
    if (!GLAcctDeterminationData.length || !chartOfAccounts.length) return;

    try {
      setLoading(true);
      const results = {};

      // 1️⃣ Fetch ChartOfAccounts for all fieldKeys
      for (const key of Object.keys(acctFieldParams)) {
        const params = acctFieldParams[key];

        const query = new URLSearchParams({
          Page: 0,
          Limit: 1000,
          Status: 1,
          LocManTran: params.locManTran,
          Postable: params.postable,
        });

        if ("Finanse" in params) {
          query.append("Finanse", String(params.Finanse));
        }

        if (params.groupMask) {
          query.append(
            "GroupMask",
            Array.isArray(params.groupMask)
              ? params.groupMask.join(",")
              : params.groupMask,
          );
        }

        try {
          const res = await apiClient.get(
            `/ChartOfAccounts?${query.toString()}`,
          );

          if (res.data?.success) {
            results[key] = res.data.values || [];
          } else {
            results[key] = [];
            console.warn(`No data for ${key}:`, res.data?.message);
          }
        } catch (innerErr) {
          console.error(`Error fetching ChartOfAccounts for ${key}:`, innerErr);
          results[key] = [];
        }
      }

      setAccountLists(results); // store for modal

      // 2️⃣ Build lookup map from global ChartOfAccounts
      const chartOfAcctMap = chartOfAccounts.reduce((acc, item) => {
        acc[item.AcctCode] = item.AcctName;
        return acc;
      }, {});

      // 3️⃣ Update Accounting grid with default values
      setAllGridsData((prev) => ({
        ...prev,
        Accounting: prev.Accounting.map((row) => {
          const linkKey = row.keyName;
          const defaultFieldName = defaultAcctCodes[linkKey];
          if (!defaultFieldName) return row;

          const acctCodeFromGL =
            GLAcctDeterminationData?.[0]?.[defaultFieldName];
          if (!acctCodeFromGL) return row;

          const existsInField = results[linkKey]?.some(
            (r) => r.AcctCode === acctCodeFromGL,
          );
          if (!existsInField) return row;

          return {
            ...row,
            AcctCode: acctCodeFromGL,
            AcctName: chartOfAcctMap[acctCodeFromGL] || "",
          };
        }),
      }));
    } catch (error) {
      console.error("Error in fetchAndSetDefaults:", error);

      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong while fetching account defaults.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Only runs once when both datasets are ready
  useEffect(() => {
    if (
      !defaultsFetched.current &&
      GLAcctDeterminationData.length &&
      chartOfAccounts.length
    ) {
      defaultsFetched.current = true;
      fetchAndSetDefaults();
    }
  }, [GLAcctDeterminationData, chartOfAccounts]);

  //=================================================clear form data=======================================
  const clearFormData = async () => {
    reset(initialFormData);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
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

    applyDefaultAccounts();
  };
  const applyDefaultAccounts = () => {
    if (!GLAcctDeterminationData.length || !chartOfAccounts.length) return;

    const chartOfAcctMap = chartOfAccounts.reduce((acc, item) => {
      acc[item.AcctCode] = item.AcctName;
      return acc;
    }, {});

    setAllGridsData((prev) => ({
      ...prev,
      Accounting: prev.Accounting.map((row) => {
        const linkKey = row.keyName;
        const defaultFieldName = defaultAcctCodes[linkKey];
        if (!defaultFieldName) return row;

        const acctCodeFromGL = GLAcctDeterminationData[0]?.[defaultFieldName];
        if (!acctCodeFromGL) return row;

        const existsInField = accountLists[linkKey]?.some(
          (r) => r.AcctCode === acctCodeFromGL,
        );
        if (!existsInField) return row;

        const acctName = chartOfAcctMap[acctCodeFromGL] || "";

        return {
          ...row,
          AcctCode: acctCodeFromGL,
          AcctName: acctName,
        };
      }),
    }));
  };

  //==================================================useeffect===============================
  useEffect(() => {
    fetchgetListDataWarehouse(0);
    fetchgetListDataUOM(0);
    // fetchgetListDataWarehouse1(0);
    // getUOMGroupOpenList();
    fetchOpenListData(0);
    fetchCloseListData(0);
    getChartOfAccounts();
    GLAcctData();
  }, []);

  // ==================================================Active List Data====================================

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
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true);

      const url = searchTerm
        ? `/ItemGroupV2/search/${searchTerm}/1/${pageNum}/20`
        : `/ItemGroupV2/pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

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
          text: response.data?.message || "Failed to fetch Item Groups.",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching Item Group data:", error);

      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong while fetching Item Groups.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================================================InActive List Data====================================

  const handleCloseListSearch = (res) => {
    setCloseListQuery(res);
    setCloseListSearching(true);
    setCloseListPage(0);
    setCloseListData([]); // Clear current data

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCloseListData(0, res);
    }, 600);
    // Fetch with search query
  };
  // Clear search
  const handleCloseListClear = () => {
    setCloseListQuery(""); // Clear search input
    setCloseListSearching(false); // Reset search state
    setCloseListPage(0); // Reset page count
    setCloseListData([]); // Clear data
    fetchCloseListData(0); // Fetch first page without search
  };
  // Infinite scroll fetch more data
  const fetchMoreCloseListData = () => {
    fetchCloseListData(
      CloseListPage + 1,
      CloseListSearching ? CloseListquery : "",
    );
    setCloseListPage((prev) => prev + 1);
  };
  const fetchCloseListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/ItemGroupV2/search/${searchTerm}/0/${pageNum}/20`
        : `/ItemGroupV2/pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        // if (newData.length === 0) {
        //   Swal.fire({
        //     text: "Record Not Found",
        //     icon: "warning",
        //     toast: true,
        //     showConfirmButton: false,
        //     timer: 2000,
        //     timerProgressBar: true,
        //   });
        // }
        setHasMoreClose(newData.length === 20);

        setCloseListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // =======================================set data to field======================================
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
          setItemGroupsData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setItemGroupsData(DocEntry);
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
  const hydrateGridsFromApi = (apiValues, allGridsData, chartOfAccounts) => {
    const updated = {};
    for (const [gridKey, rows] of Object.entries(allGridsData)) {
      updated[gridKey] = rows.map((row) => {
        const acctCode = apiValues[row.keyName] || ""; // <-- use apiValues
        const account = chartOfAccounts.find(
          (acct) => acct.AcctCode === acctCode,
        );

        console.log(
          `Hydrating Row: ${row.keyName} AcctCode from API: ${acctCode}`,
          `AcctName found: ${account?.AcctName}`,
        );

        return {
          ...row,
          AcctCode: acctCode,
          AcctName: account?.AcctName || "",
        };
      });
    }
    return updated;
  };
  const setItemGroupsData = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/ItemGroupV2/${DocEntry}`);

      toggleDrawer();
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);

      const data = response.data.values;

      reset({
        ...data,
      });

      setAllGridsData((prev) => ({
        Accounting: hydrateGridsFromApi(data, prev, chartOfAccounts).Accounting,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while fetching Item Group data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatusValue = watch("Status");
  //=====================================================post and put api============================
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
  const handleSubmitForm = async (data) => {
    console.log(data);
    const rowMap = getRowMap(allGridsData);

    const obj = {
      DocEntry: data.DocEntry || "",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Status: StatusValue === "1" ? "1" : "0",
      ItmsGrpNam: data.ItmsGrpNam,
      MinOrdrQty: data.MinOrdrQty || "0",
      LeadTime: data.LeadTime || "0",
      ToleranDay: data.ToleranDay || "0",
      PlaningSys: data.PlaningSys,
      PrcrmntMtd: data.PrcrmntMtd,
      WHSCode: data.WHSCode,
      WhsName: data.WhsName,
      BinCode: data.BinCode || "No Bin",
      UgpCode: data.UgpCode || "",
      InvntSys: data.InvntSys || "",
      Alert: data.Alert || "",
      ItemClass: data.ItemClass || "",
    };
    Accounting.forEach(({ keyName }) => {
      obj[keyName] = rowMap[keyName]?.AcctCode || "";
    });

    try {
      setLoading(true);
      const normalizeString = (str) => {
        return str.replace(/\s+/g, "").toLowerCase();
      };
      if (SaveUpdateName === "SAVE") {
        if (Array.isArray(openListData)) {
          const isExistingSAC = openListData.some(
            (item) =>
              normalizeString(item.ItmsGrpNam) ===
              normalizeString(data.ItmsGrpNam),
          );

          if (isExistingSAC) {
            Swal.fire({
              text: "Item Group Name Already Exist !",
              icon: "info",
              showConfirmButton: true,
            });
            return;
          }
        } else {
          return;
        }
        const response = await apiClient.post(`/ItemGroupV2`, obj);

        // console.log("API response:", response.data); // Check the API response

        if (response.data.success) {
          await clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Item Group Added",
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
      } else {
        const confirmation = await Swal.fire({
          text: `Do You Want Update "${obj.ItmsGrpNam}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (confirmation.isConfirmed) {
          const response = await apiClient.put(
            `/ItemGroupV2/${obj.DocEntry}`,
            obj,
          );

          console.log("API response:", response.data);

          if (response.data.success) {
            await clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            setCloseListPage(0);
            setCloseListData([]);
            fetchCloseListData(0);
            Swal.fire({
              title: "Success!",
              text: "Item Group Updated",
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
        } else {
          Swal.fire({
            text: "ItemGroup Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error); // Log the error
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  //==============================================delete api===================================
  const handleOnDelete = async () => {
    const confirmation = await Swal.fire({
      text: `Do You Want Delete ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (confirmation.isConfirmed) {
      try {
        setLoading(true);
        const response = await apiClient.delete(`/ItemGroupV2/${DocEntry}`);

        if (response.data.success === true) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Item Group Deleted",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: response.data.success,
            text: response.data.message,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        Swal.fire({
          text: "Something went wrong",
          icon: "error",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        text: "Item Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
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
        // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
          Item Group List
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setSidebarOpen(false)}
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
        //sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Grid
          item
          md={12}
          sm={12}
          width={"100%"}
          height={`calc(100% - ${50}px)`}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              typography: "body1",
              "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
                padding: 0,
              },

              "& .MuiTabs-flexContainer ": {
                justifyContent: "space-around",
              },
            }}
          >
            <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="1" label="Active" />
                <Tab value="0" label="Inactive" />
              </Tabs>

              <TabPanel
                value={"1"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
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
                      key={item.DocEntry}
                      title={item.ItmsGrpNam}
                      // subtitle={item.ItmsGrpNam}
                      description={
                        uomGroups.find(
                          (group) => group.DocEntry === item.UgpCode,
                        )?.UgpCode || ""
                      }
                      isSelected={selectedData === item.DocEntry}
                      searchResult={openListquery}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              <TabPanel
                value={"0"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScrollClosed"
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
                    onChange={(e) => handleCloseListSearch(e.target.value)}
                    value={CloseListquery}
                    onClickClear={handleCloseListClear}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  dataLength={CloseListData.length}
                  hasMore={hasMoreClose}
                  next={fetchMoreCloseListData}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {CloseListData.map((item, i) => (
                    <CardComponent
                      key={item.DocEntry}
                      title={item.ItmsGrpNam}
                      // subtitle={item.ItmsGrpNam}
                      description={
                        uomGroups.find(
                          (group) => group.DocEntry === item.UgpCode,
                        )?.UgpCode || ""
                      }
                      isSelected={selectedData === item.DocEntry}
                      searchResult={CloseListquery}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );
  // =================================================uom modal data===========================
  const OpenDailogUOM = () => setsearchmodelOpenUOM(true);
  const SearchModelCloseUOM = () => setsearchmodelOpenUOM(false);

  const onUOMSelectRequest = async (UgpCode) => {
    // var selectedObj = getListDataUOM.find((item) => item.DocEntry === DocEntry);
    // var allFormData = getValues();
    // // allFormData.WHSCode = selectedObj.WHSCode;
    // // allFormData.BinCode = selectedObj.BinCode;
    // allFormData.UgpCode = selectedObj.UgpName;

    // reset({ ...allFormData });
    setValue("UgpCode", UgpCode);
    SearchModelCloseUOM();
  };
  const handleGetListClearUOM = () => {
    setGetListQueryUOM("");
    setGetListSearching1(false);
    setgetListPageUOM(0);
    setgetListDataUOM([]);
    fetchgetListDataUOM(0);
  };
  const handleGetListSearchUOM = (res) => {
    setGetListQueryUOM(res);
    setGetListSearchingUOM(true);
    setgetListPageUOM(0);
    setgetListDataUOM([]);
    // fetchgetListDataUOM(0, res);
    // Cancel Token
    if (typeof httpRequestToken != typeof undefined) {
      console.log("REQUEST CANCELLED", httpRequestToken);
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataUOM(0, res, httpRequestToken);
    }, TimeDelay);
  };
  const fetchMoregetListDataUOM = () => {
    fetchgetListDataUOM(
      getListPageUOM + 1,
      getListSearchingUOM ? getListqueryUOM : "",
    );
  };
  const fetchgetListDataUOM = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/UGP/Search/${searchTerm}/1/${pageNum}/20`
        : `/UGP/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        sethasMoreGetListUOM(newData.length === 20);

        setgetListDataUOM((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageUOM(pageNum);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //========================================Warehouse modal data=================================
  const OpenDailog = () => setsearchmodelOpenWarehouse(true);
  const SearchModelCloseWarehouse = () => setsearchmodelOpenWarehouse(false);

  const onSelectRequest = async (DocEntry) => {
    // var selectObj = getListDataWarehouse.find(
    //   (item) => item.DocEntry === DocEntry
    // );
    // reset( getValues() );

    var selectedObj = getListDataWarehouse.find(
      (item) => item.DocEntry === DocEntry,
    );
    var allFormData = getValues();
    allFormData.WHSCode = selectedObj.WHSCode;
    // allFormData.BinCode = selectedObj.BinCode;

    reset({ ...allFormData });
    setValue("BinCode", "");
    SearchModelCloseWarehouse();
  };
  const handleGetListClearWarehouse = () => {
    setGetListQueryWarehouse("");
    setGetListSearching1(false);
    setgetListPageWarehouse(0);
    setgetListDataWarehouse([]);
    fetchgetListDataWarehouse(0);
  };
  const handleGetListSearchWHS = (res) => {
    setGetListQueryWarehouse(res);
    setGetListSearching(true);
    setgetListPageWarehouse(0);
    setgetListDataWarehouse([]);
    // fetchgetListDataWarehouse(0, res);
    // Cancel Token

    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataWarehouse(0, res);
    }, TimeDelay);
  };
  const fetchMoregetListDataWarehouse = () => {
    fetchgetListDataWarehouse(
      getListPageWarehouse + 1,
      getListSearchingWarehouse ? getListqueryWarehouse : "",
    );
  };
  const fetchgetListDataWarehouse = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/WarehouseV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/WarehouseV2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        sethasMoreGetListWarehouse(newData.length === 20);

        setgetListDataWarehouse((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageWarehouse(pageNum);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //======================================================Bin location modal data===========================

  const OpenDailog1 = () => SearchModelOpenBinlocation(true);
  const SearchModelCloseBinlocation = () => SearchModelOpenBinlocation(false);

  const OnSelectRequestBin = async (DocEntry) => {
    var selectedObj = getListDataBin.find((item) => item.DocEntry === DocEntry);
    var allFormData = getValues();
    allFormData.BinCode = selectedObj.BinCode;

    reset({ ...allFormData });

    SearchModelCloseBinlocation();
  };
  const HandleGetListClearBin = () => {
    setGetListQueryWarehouse1("");
    setGetListSearching1(false);
    setgetListPageWarehouse1(0);
    setgetListDataWarehouse1([]);
    fetchgetListDataWarehouse1(0);
  };
  const HandleGetListBin = (res) => {
    setGetListQueryWarehouse1(res);
    setGetListSearching1(true);
    setgetListPageWarehouse1(0);
    setgetListDataWarehouse1([]);
    // fetchgetListDataWarehouse(0, res);
    // Cancel Token

    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataWarehouse1(0, res);
    }, TimeDelay);
  };

  const FetchMoreGetListDataBin = () => {
    fetchgetListDataWarehouse1(
      getListPageWarehouse1 + 1,
      getListSearchingWarehouse1 ? getListqueryBin : "",
    );
  };
  const fetchgetListDataWarehouse1 = async (
    pageNum,
    searchTerm = "",
    WHSCode = "", // ✅ accept WHSCode here
  ) => {
    try {
      const { data } = await apiClient.get(`/BinLocationV2/GetByWHSCode/`, {
        params: {
          WHSCode: WHSCode,
          Status: 1,
          Page: pageNum,
          SearchText: searchTerm,
        },
      });
      if (data.success) {
        const newData = data.values;

        sethasMoreGetListWarehouse1(newData.length === 20);
        setgetListDataWarehouse1((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageWarehouse1(pageNum);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const acctFieldParams = {
    ExpensesAc: { locManTran: "N", postable: "Y" }, // Expense Account
    RevenuesAc: {
      locManTran: "N",
      Finanse: "N",
      groupMask: [4],
      postable: "Y",
    }, // Revenue Account
    BalInvntAc: { locManTran: "N", postable: "Y" }, // Inventory Account
    SaleCostAc: { locManTran: "N", postable: "Y" }, // COGS
    TransferAc: { locManTran: "N", postable: "Y" }, // Allocation Account
    VarianceAc: { locManTran: "N", postable: "Y" },
    NegStckAct: { locManTran: "N", postable: "Y" },
    DecreasAc: { locManTran: "N", postable: "Y" },
    IncreasAc: { locManTran: "N", postable: "Y" },
    ReturnAc: { locManTran: "N", postable: "Y" },
    ExchangeAc: { locManTran: "N", postable: "Y" },
    BalanceAcc: { locManTran: "N", postable: "Y" },
    DecresGlAc: { locManTran: "N", postable: "Y" },
    IncresGlAc: { locManTran: "N", postable: "Y" },
    WipAcct: { locManTran: "N", postable: "Y" },
    WipVarAcct: { locManTran: "N", postable: "Y" },
    WipOffset: { locManTran: "N", postable: "Y" },
    ExpClrAct: { locManTran: "N", postable: "Y" },
    ShpdGdsAct: { locManTran: "N", postable: "Y" },
    ARCMAct: { locManTran: "N", Finanse: "N", groupMask: [4], postable: "Y" }, // Sales Credit Account
    APCMAct: { locManTran: "N", postable: "Y" },
    WhICenAct: { locManTran: "N", postable: "Y" },
    WhOCenAct: { locManTran: "N", postable: "Y" },
  };
  return (
    <>
      {/* WAREHOUSE */}
      <DataGridCellClickModel
        open={openDatagridAcctCode}
        closeModel={() => setDatagridAcctCodeOpen(false)}
        isLoading={isLoading}
        title="Account List"
        getRowId={(row) => row.DocEntry}
        columns={DatagridAcctCodeList}
        rows={DatagridAcctCodeRows}
        taxCurrentPage={currentPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onCellClick={(params) => setDatagridAcctCode(params.row)}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        selectedRowIndex={getValues("selectedRowIndex")}
        oLines={getValues("oLines") || []}
        // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
      />
      <SearchModel
        open={searchmodelOpenWarehouse}
        onClose={SearchModelCloseWarehouse}
        onCancel={SearchModelCloseWarehouse}
        title="WHS CODE"
        onChange={(e) => handleGetListSearchWHS(e.target.value)}
        value={getListqueryWarehouse}
        onClickClear={handleGetListClearWarehouse}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataWarehouse.length}
              next={fetchMoregetListDataWarehouse}
              hasMore={hasMoreGetListWarehouse}
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
              {getListDataWarehouse.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.ListName}
                  subtitle={item.WHSCode}
                  description={item.WHSName}
                  searchResult={getListqueryWarehouse}
                  onClick={() => onSelectRequest(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <SearchModel
        open={searchmodelOpenUOM}
        onClose={SearchModelCloseUOM}
        onCancel={SearchModelCloseUOM}
        title="UOM Groups"
        onChange={(e) => handleGetListSearchUOM(e.target.value)}
        value={getListqueryUOM}
        onClickClear={handleGetListClearUOM}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataUOM.length}
              next={fetchMoregetListDataUOM}
              hasMore={hasMoreGetListUOM}
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
              {getListDataUOM.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.UgpCode}
                  subtitle={item.UgpName}
                  // description={item.WHSName}
                  searchResult={getListqueryUOM}
                  onClick={() => onUOMSelectRequest(item.UgpCode)}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />

      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      <SearchModel
        open={SearchModalOpenBin}
        onClose={SearchModelCloseBinlocation}
        onCancel={SearchModelCloseBinlocation}
        title="BIN LOCATION"
        onChange={(e) => HandleGetListBin(e.target.value)}
        value={getListqueryBin}
        onClickClear={HandleGetListClearBin}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataBin.length}
              next={FetchMoreGetListDataBin}
              hasMore={HasMoreGetListBin}
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
              {getListDataBin.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.BinCode}
                  // subtitle={item.BinCode}
                  description={item.WHSCode}
                  searchResult={getListqueryBin}
                  onClick={() => OnSelectRequestBin(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
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
            display: { lg: "block", xs: `${sidebarOpen ? "block" : "none"}` },
          }}
        >
          {sidebarContent}
        </Grid>

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
            onClick={toggleSidebar}
            sx={{
              position: "absolute",
              left: "10px",
              display: { lg: "none", xs: "block" },
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
              display: {},

              position: "absolute",

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
              Item Group
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
              textTransform={"uppercase"}
            >
              <Box
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                {showFields && (
                  <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ItmsGrpNam"
                      control={control}
                      rules={{
                        required: "Item group name is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Item Group Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="item Group name"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 20 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                )}
                <Grid
                  container
                  item
                  width="100%"
                  m={1}
                  // border="1px solid grey"
                  spacing={2}
                >
                  <Paper
                    sx={{
                      width: "100%",
                      mb: 2,
                      p: 2,
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                      borderRadius: "12px",
                    }}
                  >
                    <Tabs
                      sx={{ width: "100%" }}
                      value={tabvalue}
                      onChange={handleMainTab}
                      aria-label="tab options"
                    >
                      <Tab value={0} label="GENERAL" />

                      <Tab value={1} label="ACCOUNTING" />
                    </Tabs>
                    <Divider sx={{ mb: 2 }} />

                    {tabvalue === 0 && (
                      <>
                        <Grid container textTransform={"uppercase"}>
                          <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                            <Controller
                              name="UgpCode"
                              control={control}
                              // rules={{
                              //   required: "UOM Group is required",
                              // }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  // disabled={SaveUpdateName === "UPDATE"}
                                  {...field}
                                  readOnly
                                  label="UOM Group"
                                  onKeyDown={(e) => {
                                    if (e.key === "Backspace") {
                                      e.preventDefault();
                                      setValue("UgpCode", "", {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    } else {
                                      e.preventDefault();
                                    }
                                  }}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          edge="end"
                                          size="small"
                                          style={{
                                            cursor: "pointer",
                                            backgroundColor: "green",
                                            borderRadius: "10%",
                                            color: "white",
                                            padding: 2,
                                          }}
                                          onClick={() => {
                                            OpenDailogUOM();
                                            // ClearFormData();
                                          }}
                                        >
                                          <ViewListIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                  data={getListDataUOM}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />

                            {/* <SearchModel
                      open={openUOMGroup}
                      onClose={handleCloseUOMGroup}
                      onCancel={handleCloseUOMGroup}
                      onChange={(event) => handleGetListSearch(event)} // Pass the event object
                      onClickClear={handleGetListClear}
                      title="Default UoM Group"
                      value={searchUomText}
                      cardData={
                        <InfiniteScroll
                          style={{ textAlign: "center" }}
                          dataLength={
                            searchUomText === ""
                              ? uomGroups.length
                              : filteredUomGroups.length
                          }
                          next={fetchMoreUOMGroupData}
                          hasMore={hasMoreUom}
                          loader={<BeatLoader />}
                          scrollableTarget="UOMScroll"
                          endMessage={<Typography>No More Records</Typography>}
                        >
                          {(filteredUomGroups.length === 0
                            ? uomGroups
                            : filteredUomGroups
                          ).map((item) => (
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              textAlign={"center"}
                              style={{ width: "20vw" }}
                            >
                              <CardComponent
                                key={item.DocEntry}
                                title={item.UgpCode}
                                subtitle={item.UgpName}
                                searchResult={searchUomText}
                                onClick={() => handleCardClick(item)} // Use the handleCardClick function here
                              />
                            </Grid>
                          ))}
                        </InfiniteScroll>
                      }
                    /> */}
                          </Grid>
                          {showFields && (
                            <Grid
                              item
                              xs={12}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PlaningSys"
                                rules={{
                                  required: "This field is required", // Field is required
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="Planning Method"
                                    data={[
                                      { key: "N", value: "NONE" },
                                      { key: "M", value: "MRP" },
                                    ]}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                          )}
                          {showFields && (
                            <Grid
                              item
                              xs={12}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PrcrmntMtd"
                                rules={{
                                  required: "", // Field is required
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="Procurement method"
                                    data={[
                                      { key: "B", value: "BUY" },
                                      { key: "M", value: "MAKE" },
                                    ]}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                          )}
                          {showFields && (
                            <Grid
                              item
                              xs={12}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="MinOrdrQty"
                                control={control}
                                rules={{
                                  validate: (value) => {
                                    if (Number(value) < 0) {
                                      return "Minimum order qty must be greater than 0";
                                    }
                                  },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputFields
                                    label="minimum order qty"
                                    type="text"
                                    {...field}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                          )}
                          {showFields && (
                            <Grid
                              item
                              xs={12}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="LeadTime"
                                control={control}
                                rules={{
                                  validate: (value) => {
                                    if (Number(value) < 0) {
                                      return "Lead Time must be greater than 0";
                                    }
                                  },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputFields
                                    label="lead time / days"
                                    type="text"
                                    {...field}
                                    inputProps={{ maxLength: 10 }}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                          )}
                          {showFields && (
                            <Grid
                              item
                              xs={12}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="ToleranDay"
                                control={control}
                                rules={{
                                  validate: (value) => {
                                    if (Number(value) < 0) {
                                      return "Tolerance Day must be greater than 0";
                                    }
                                  },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputFields
                                    label="tolerance days"
                                    type="text"
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 10 }}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                          )}
                          {showFields && (
                            <Grid
                              item
                              xs={12}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="InvntSys"
                                rules={{ required: "" }}
                                // defaultValue={{ key: "F", value: "FIFO" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="default valuation method"
                                    data={[
                                      { key: "F", value: "FIFO" },
                                      { key: "A", value: "MOVING AVRAGE" },
                                      { key: "S", value: "Standard" },
                                    ]}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                          )}
                          <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                            <Controller
                              name="WHSCode"
                              control={control}
                              // rules={{ required: "WHS Code is required" }}
                              defaultValue=""
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  // disabled={SaveUpdateName === "UPDATE"}
                                  readOnly
                                  {...field}
                                  label="WHS CODE"
                                  onKeyDown={(e) => {
                                    if (e.key === "Backspace") {
                                      e.preventDefault();
                                      setValue("WHSCode", "", {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    } else {
                                      e.preventDefault();
                                    }
                                  }}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          edge="end"
                                          size="small"
                                          style={{
                                            cursor: "pointer",
                                            backgroundColor: "green",
                                            borderRadius: "10%",
                                            color: "white",
                                            padding: 2,
                                          }}
                                          onClick={() => {
                                            OpenDailog();
                                            // ClearFormData();
                                          }}
                                        >
                                          <ViewListIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                  data={getListDataWarehouse}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                          {/* <Grid item xs={12} md={4} lg={4} textAlign={"center"}>
                          <Controller
                            name="BinCode"
                            control={control}
                            // rules={{
                            //   validate: (value) => {
                            //     const whsCode = getValues("WHSCode");
                            //     if (whsCode && !value) {
                            //       return "Bin Location is required"; // show error only if WHSCode has a value
                            //     }
                            //     return true;
                            //   },
                            // }}
                            defaultValue=""
                            render={({ field, fieldState: { error } }) => (
                              <InputTextSearchButtonTable
                                readOnly
                                label="BIN LOCATION"
                                onClick={async () => {
                                  const selectedWHSCode = getValues("WHSCode");
                                  if (!selectedWHSCode) {
                                    console.warn("WHS Code not selected");
                                    return;
                                  }
                                  await fetchgetListDataWarehouse1(
                                    0,
                                    "",
                                    selectedWHSCode
                                  );
                                  OpenDailog1();
                                }}
                                {...field}
                                data={getListDataBin}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid> */}
                          {/* <Dialog
                    style={{ margin: "auto" }}
                    open={openbin}
                    onClose={handleCloseBinLocation}
                    scroll="paper"
                    component={"form"}
                            //       <ViewLi
                    // onSubmit={handleSubmit(onSubmit)}
                  > */}
                          {/* <DialogTitle>
                      <Grid item display={"flex"} justifyContent={"center"}>
                        {/* <PersonAddAlt1OutlinedIcon /> */}
                          {/* <Typography textAlign={"center"} fontWeight={"bold"}>
                          &nbsp; &nbsp;BIN LOCATION
                        </Typography> */}

                          {/* <IconButton
                          edge="start"
                          color="inherit"
                          aria-label="menu"
                          onClick={handleCloseBinLocation}
                          sx={{
                            display: {}, // Show only on smaller screens

                            position: "absolute",

                            right: "10px",
                            marginBottom: "50px", */}

                          {/* <CloseIcon /> */}
                          {/* </IconButton> */}
                          {/* </Grid> */}
                          {/* </DialogTitle> */}
                          {/* <Divider /> */}
                          {/* <DialogContent> */}
                          {/* <SearchInputField /> */}
                          {/* <Grid */}
                          {/* container
                        item
                        mt={2}
                        sx={{
                          px: 2,
                          overflow: "auto",
                          width: "100%", */}

                          {/* <Paper sx={{ width: "100%" }}>
                          <DataGrid
                            columnHeaderHeight={35}
                            rowHeight={45}
                            className="datagrid-style"
                            sx={{
                              backgroundColor:
                                theme.palette.mode === "light"
                                  ? "#F5F6FA"
                                  : "#080D2B",
                              "& .MuiDataGrid-cell": {
                                border: "none",
                              },
                              "& .MuiDataGrid-cell:focus": {
                                outline: "none",
                              },
                            }}
                            rows={allbinlocation.map((data, index) => ({
                              ...data,
                              id: index,
                            }))}
                            columns={BinLoc}
                            getRowId={(row) => row.DocEntry}
                            initialState={{
                              pagination: {
                                paginationModel: {
                                  pageSize: 8,
                                },
                              },
                            }}
                            // hideFooter
                            // checkboxSelection
                            // onRowSelectionModelChange={(id) => handleServiceRowClick(id)}
                            // onCellClick={(row)=>handleCell(row.row)}
                            pageSizeOptions={[3]}
                          />
                        </Paper> */}
                          {/* </Grid> */}
                          {/* </DialogContent> */}
                          {/* </Dialog> */}
                          <Grid
                            item
                            md={4}
                            xs={12}
                            container
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Controller
                              name="Status"
                              control={control}
                              defaultValue="1"
                              render={({ field }) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      textAlign={"center"}
                                      {...field}
                                      checked={field.value === "1"}
                                      onChange={(e) => {
                                        const newValueStatus = e.target.checked
                                          ? "1"
                                          : "0";
                                        field.onChange(newValueStatus);
                                        setValue("Active", newValueStatus);
                                      }}
                                    />
                                  }
                                  label="Active"
                                />
                              )}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            md={4}
                            lg={4}
                            justifyItems={"center"}
                          >
                            {/* <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      // value={Rvalue}
                      onChange={handleRadioChange}
                      textTransform={"uppercase"}
                    >
                      <FormControlLabel
                        value="show"
                        control={<Radio />}
                        label="Material"
                        name="showHide"
                        checked={radioValue === "show"}
                        onChange={handleRadioChange}
                      />
                      <FormControlLabel
                        value="hide"
                        control={<Radio />}
                        label="Service"
                        name="showHide"
                        checked={radioValue === "hide"}
                        onChange={handleRadioChange}
                      />
                    </RadioGroup> */}
                          </Grid>
                        </Grid>
                      </>
                    )}
                    {tabvalue === 1 && (
                      <DataGrid
                        className="datagrid-style"
                        hideFooter
                        columns={ColumnFields("Accounting").map((col) => {
                          if (col.field === "AcctCode") {
                            return {
                              ...col,
                              renderCell: (params) => (
                                <InputTextField
                                  value={params.row.AcctCode || ""}
                                  sx={{ width: 160 }}
                                  readOnly
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Backspace" ||
                                      e.key === "Delete"
                                    ) {
                                      e.preventDefault();
                                      setAllGridsData((prev) => ({
                                        ...prev,
                                        Accounting: prev.Accounting.map((r) =>
                                          r.id === params.row.id
                                            ? {
                                                ...r,
                                                AcctCode: "",
                                                AcctName: "",
                                              }
                                            : r,
                                        ),
                                      }));
                                    }
                                  }}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          onClick={() => {
                                            const fieldKey = params.row.keyName;

                                            // Fetch accounts for the modal

                                            // Open modal
                                            OpenDatagridAcctCodeModal(
                                              "Accounting",
                                              params.row.id,
                                            );
                                          }}
                                          disabled={params.row.Status === "0"}
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
                              ),
                            };
                          }
                          return col;
                        })}
                        rows={allGridsData.Accounting}
                        getRowId={(row) => row.id || row.LineNum}
                        autoHeight={false}
                        initialState={{
                          pagination: { paginationModel: { pageSize: 100 } },
                        }}
                        pageSizeOptions={[10]}
                        sx={{
                          minWidth: 600,
                          height: "70vh",
                          "& .MuiDataGrid-cell": { border: "none" },
                          "& .MuiDataGrid-cell:focus": { outline: "none" },
                          "& .MuiDataGrid-columnHeaders": {
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            backgroundColor: "red",
                            fontWeight: "bold",
                          },
                        }}
                      />
                    )}
                  </Paper>
                </Grid>
                {/* <Box
                  sx={{ height: 300, width: "100%", mt: 10, border: 1, p: 2 }}
                >
                  <DataGrid
                    // rows={rows}
                    // columns={column}
                    pageSize={5}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 5,
                        },
                      },
                    }}
                    hideFooter={tabl}
                    pageSizeOptions={[3]}
                    disableRowSelectionOnClick
                  />
                </Box> */}
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
                  name={SaveUpdateName}
                  sx={{ color: "white " }}
                  disabled={
                    (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                    (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                  }
                >
                  {SaveUpdateName}
                </Button>
              </Grid>

              <Grid item>
                <Button
                  disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                  onClick={handleOnDelete}
                  variant="contained"
                  color="error"
                >
                  DELETE
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
