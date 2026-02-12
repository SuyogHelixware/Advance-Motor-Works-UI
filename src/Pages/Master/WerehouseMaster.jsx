import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import { TabContext, TabPanel } from "@mui/lab";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";

import {
  Box,
  Button,
  Checkbox,
  debounce,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  AutomCompleteField,
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";

import dayjs from "dayjs";
import { useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";

import CardComponent from "../Components/CardComponent";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { DataGrid } from "@mui/x-data-grid";
import { Loader } from "../Components/Loader";

export default function WerehouseMaster() {
  const timeoutRef = useRef(null);
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [tabvalue, settabvalue] = useState(0);
  // const [WhscgetListData, setWhscGetListData] = useState([]);
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);
  const [location, setLocation] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [Locationpage, setLocationPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [listofstate, setListofState] = useState([]);
  const [listofcountry, setListofCountry] = useState([]);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [oldOpenData, setSelectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [DocEntry, setDocEntry] = useState("");
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);

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

  //=========================================Accounting Tab========================================================
  const getChartOfAccounts = async () => {
    try {
      const res = await apiClient.get(`/ChartOfAccounts/All`);
      const data = res.data.values || [];
      setChartOfAccounts(data);
    } catch (error) {
      console.error("Error fetching ChartOfAccounts:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch ChartOfAccounts. Please try again later.",
      });
    }
  };
  const GLAcctData = async () => {
    try {
      const res = await apiClient.get(`/GLAccDetermination/All`);
      const data = res.data.values || [];
      setGLAcctDeterminationData(data);
    } catch (error) {
      console.error("Error fetching ChartOfAccounts:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch ChartOfAccounts. Please try again later.",
      });
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
          : row
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
    [currentPage]
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
    // {
    //   field: "CurrTotal",
    //   headerName: "Balance",
    //   width: 250,
    //   editable: true,
    // },
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
  const fetchAndSetDefaults = async () => {
    if (!GLAcctDeterminationData.length || !chartOfAccounts.length) return;

    setLoading(true);
    try {
      const results = {};

      // 1️⃣ Fetch ChartOfAccounts for each key
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
              : params.groupMask
          );
        }
        try {
          const res = await apiClient.get(
            `/ChartOfAccounts?${query.toString()}`
          );
          results[key] = res.data.values || [];
        } catch (innerErr) {
          results[key] = [];
        }
      }

      setAccountLists(results); // used in modals

      // 2️⃣ Build lookup map from global ChartOfAccounts
      const chartOfAcctMap = chartOfAccounts.reduce((acc, item) => {
        acc[item.AcctCode?.toString()] = item.AcctName || "";
        return acc;
      }, {});

      // 3️⃣ Update Accounting grid with default values
      setAllGridsData((prev) => {
        const updated = prev.Accounting.map((row) => {
          const linkKey = row.keyName;
          const defaultFieldName = defaultAcctCodes[linkKey];
          if (!defaultFieldName) return row;

          const acctCodeFromGL = GLAcctDeterminationData[0]?.[defaultFieldName];
          if (!acctCodeFromGL) return row;

          const existsInField = results[linkKey]?.some(
            (r) => r.AcctCode?.toString() === acctCodeFromGL?.toString()
          );
          if (!existsInField) return row;

          const acctName = chartOfAcctMap[acctCodeFromGL?.toString()] || "";

          return {
            ...row,
            AcctCode: acctCodeFromGL,
            AcctName: acctName,
          };
        });

        return { ...prev, Accounting: updated };
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong while fetching accounts.",
      });
    } finally {
      setLoading(false);
    }
  };
  const defaultsFetched = useRef(false);

  // ✅ Controlled effect – runs exactly once when both datasets are ready
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

  //==========================================================================================================
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const { user, fetchWarehouse } = useAuth();
  const perms = usePermissions(65);
  const initial = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName,
    CountryCode: "",
    Status: "1",
    WHSCode: "",
    WHSName: "",
    BinActivat: "",
    ZipCode: "",
    City: "",
    Country: "",
    State: "",
    FedTaxID: "",
    Address: "",
    DftBinAbs: "",
    BinLocation: "",
    Excisable: "",
    Location: "",
    BinSeptor: "-",
    NoOfDftBinAbs: "",
    BinCode: "",
    DftBinEnfd: "",
    RecvUpTo: "",
    RecvMaxWT: "",
    RecBinEnab: "",
    RecvEmpBin: "",
    GlblLocNum: "",
    AutoIssMtd: "",
    AutoRecvMd: "",
    RecItemsBy: "",
    Street: "",
    Block: "",
  };
  const { control, handleSubmit, getValues, reset, watch, setValue } = useForm({
    defaultValues: initial,
  });
  const AllData = getValues();
  console.log(AllData.DocEntry === "");
  const BinActivat = watch("BinActivat");
  const [openbin, setOpenBin] = useState(false);
  const handleClickOpen = () => setOpenBin(true);
  const handleClose = () => setOpenBin(false);

  //=========================Accounting Tab============================================
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
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    // setLoading(true);
    try {
      const url = searchTerm
        ? `/WarehouseV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/WarehouseV2/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);
      if (response.data.success === true) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCell = (DftBinAbs, BinCode) => {
    setValue("DftBinAbs", DftBinAbs);
    setValue("BinCode", BinCode);

    console.log("BinCode", BinCode);

    handleClose();
  };

  console.log("gevbincode", getValues("BinCode"));

  // Handle search input
  const handleOpenListSearch = (res) => {
    setOpenListQuery(res);
    setOpenListSearching(true);
    setOpenListPage(0);
    // setHasMoreOpen(true);
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

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
    getChartOfAccounts();
    GLAcctData();
  }, []);

  // ============================================Closed List Start ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    setLoading(true);
    try {
      const url = searchTerm
        ? `/WarehouseV2/Search/${searchTerm}/0/${pageNum}/20`
        : `/WarehouseV2/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreClosed(false);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleClosedListSearch = (res) => {
    setClosedListQuery(res);
    setClosedListSearching(true);
    setClosedListPage(0);
    setClosedListData([]); // Clear current data
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchClosedListData(0, res);
    }, 600);
  };

  // Clear search
  const handleClosedListClear = () => {
    setClosedListQuery(""); // Clear search input
    setClosedListSearching(false); // Reset search state
    setClosedListPage(0); // Reset page count
    setClosedListData([]); // Clear data
    fetchClosedListData(0); // Fetch first page without search
  };
  // Infinite scroll fetch more data
  const fetchMoreClosedListData = () => {
    fetchClosedListData(
      closedListPage + 1,
      closedListSearching ? closedListquery : ""
    );
    setClosedListPage((prev) => prev + 1);
  };
  // Initial fetchClearFormData
  useEffect(() => {
    fetchClosedListData(0); // Load first page on mount
  }, []);
  const ListofCountry = async () => {
    try {
      const res = await apiClient.get(`/Country/all`);
      const response = res.data;
      if (response.success === true) {
        setListofCountry(response.values);
      } else if (response.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const ListofState = async (CountryCode) => {
    try {
      const res = await apiClient.get(
        `/ListofStates/GetByCountryCode/${CountryCode}`
      );
      const response = res.data;
      if (response.success === true) {
        setListofState(response.values);
      } else if (response.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const fetchLocations = async (page, searchQuery) => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/WHSLocation/Search/${searchQuery}/1/${page}/20`
        : `/WHSLocation/Pages/1/${page}/20`;
      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values || [];
        if (page === 0) {
          setLocation(newData); // Replace when starting
        } else {
          setLocation((prev) => [...prev, ...newData]); // Append when scrolling
        }
        setHasMore(newData.length === 20); // If less than 20, no more pages
      } else {
        Swal.fire("Error!", response.data.message, "warning");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error!", error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLocations(Locationpage, searchQuery);
  }, [Locationpage, searchQuery]);

  const debouncedFetch = useCallback(
    debounce((input) => {
      setSearchQuery(input);
      setLocationPage(0);
    }, 600),
    []
  );

  // const LocationList = async () => {
  //   try {
  //     const res = await apiClient.get(`/WHSLocation/Pages/1`);
  //     const response = res.data;
  //     if (response.success === true) {
  //       setLocation(response.values);
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

  let state = watch("State");
  console.log("state", state);

  const fetchWhscGetListData = async (pageNum, searchTerm = "", WHSCode) => {
    try {
      // const url = searchTerm
      //   ? `/WarehouseV2/search/${searchTerm}/1/${pageNum}`
      //   : `/WarehouseV2/pages/1/${pageNum}`;

      // const response = await apiClient.get(url);
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
        setWhsHasMoreGetList(newData.length === 20);

        setWhscGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
        // setValue("BinCode",newData[0]?.BinCode ?? "")
        // setValue("DftBinAbs",newData[0]?.DocEntry ?? "")
        return newData.length;
      } else if (data.success === false) {
        Swal.fire({
          text: data.message,
          icon: "question",
          confirmButtonText: "YES",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
      WhsgetListSearching ? WhsrgetListquery : ""
    );
    setWhsGetListPage((prev) => prev + 1);
  };
  // useEffect(() => {
  //   fetchWhscGetListData(0); // Load first page on mount
  // }, []);

  // const binlocation = async (WHSCode) => {
  //   const { data } = await apiClient.get(
  //     `/BinLocationV2/GetByWHSCode/`,{
  //        params:{
  //        WHSCode:WHSCode,
  //        Status:1,
  //       }
  //     }

  //   );
  //   var { values } = data;
  //   setWhscGetListData(values);
  //   return values.length;
  // };

  const Country = watch("Country");
  // const WHSCode=watch("WHSCode")
  useEffect(() => {
    ListofState(Country || "IND");
    ListofCountry();
    // LocationList();
    // binlocation(WHSCode || "0");
  }, [Country]);

  // const handleLocation = (DocEntry) => {
  //   console.log(DocEntry);
  //   const newadd = location.filter((item) => item.DocEntry === DocEntry);
  //   setValue("Street", newadd[0]?.Street ?? "");
  //   setValue("Block", newadd[0]?.Block ?? "");
  //   setValue("Address", `${newadd[0].Block} ${newadd[0].Street} `);
  //   setValue("City", newadd[0]?.City ?? "");
  //   setValue("ZipCode", newadd[0]?.ZipCode ?? "");
  //   setValue("State", newadd[0]?.State ?? "");
  //   setValue("Country", newadd[0]?.Country ?? "");
  //   console.log("====", newadd);
  // };
  const { isDirty } = useFormState({ control });
  const setOldOpenData = async (DocEntry, BinCode, DftBinAbs) => {
    try {
      if (isDirty && getValues("WHSCode")) {
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
          setWhscGetListData([]);
          setSaveUpdateName("UPDATE");
        });
      } else {
        fetchAndSetData(DocEntry, BinCode, DftBinAbs);
        setSaveUpdateName("UPDATE");
        setWhscGetListData([]);

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
  const hydrateGridsFromApi = (apiValues, allGridsData, chartOfAccounts) => {
    const updated = {};
    for (const [gridKey, rows] of Object.entries(allGridsData)) {
      updated[gridKey] = rows.map((row) => {
        const acctCode = apiValues[row.keyName] || ""; // <-- use apiValues
        const account = chartOfAccounts.find(
          (acct) => acct.AcctCode === acctCode
        );

        console.log(
          `Hydrating Row: ${row.keyName} AcctCode from API: ${acctCode}`,
          `AcctName found: ${account?.AcctName}`
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

  const fetchAndSetData = async (DocEntry, BinCode, DftBinAbs) => {
    toggleSidebar();
    setSaveUpdateName("UPDATE");
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/WarehouseV2/${DocEntry}`);
      let { values } = data;

      // make sure chartOfAccounts is loaded before hydrating
      if (chartOfAccounts.length === 0) await getChartOfAccounts();

      const len = await fetchWhscGetListData(0, "", values.WHSCode);
      setDocEntry(DocEntry);
      reset({
        ...values,
        NoOfDftBinAbs: len === 0 ? "No Bin" : len,
        Status: values.Status === "1",
        NoAutoAllc: values.NoAutoAllc === "Y",
        ReceiveBin: values.ReceiveBin === "Y",
        BinActivat: values.BinActivat === "Y",
        DftBinEnfd: values.DftBinEnfd === "Y",
        RecBinEnab: values.RecBinEnab === "Y",
        Excisable: values.Excisable === "Y",
        BinCode: BinCode,
        DftBinAbs: DftBinAbs,
      });
      // Hydrate DataGrid with new objects (force new references)
      // setValue("BinCode",WhscgetListData[0]?.BinCode ?? "")
      // setValue("DftBinAbs",WhscgetListData[0]?.DocEntry ?? "")
      setAllGridsData((prev) => ({
        Accounting: hydrateGridsFromApi(data.values, prev, chartOfAccounts)
          .Accounting,
      }));
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  // if(SaveUpdateName==="UPDATE"){
  //     setValue("BinCode",WhscgetListData[0]?.BinCode ?? "")
  //     setValue("DftBinAbs",WhscgetListData[0]?.DocEntry ?? "")
  // }
  const ClearFormData = () => {
    // ("SAVE")
    // SaveUpdateName("SAVE")
    setSelectData([]);
    setSaveUpdateName("SAVE");
    reset(initial);
    setWhscGetListData([]);
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
    setDocEntry("");
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
          (r) => r.AcctCode === acctCodeFromGL
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
  const handleSumbit = async (data) => {
    console.log("Data is Saved", data);
    const rowMap = getRowMap(allGridsData);

    if (!data.Location) {
      Swal.fire({
        text: "Location is mandatory",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return false;
    }
    const obj = {
      ...data,
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      ModifiedBy: user.UserName,
      GlblLocNum: data?.GlblLocNum ?? "",
      Status: data.Status ? "1" : "0",
      BinActivat: data.BinActivat ? "Y" : "N",
      DftBinEnfd: data.DftBinEnfd ? "Y" : "N",
      RecBinEnab: data.RecBinEnab ? "Y" : "N",
      DftBinAbs: String(data.DftBinAbs),
      Excisable: data.Excisable ? "Y" : "N",
    };
    Accounting.forEach(({ keyName }) => {
      obj[keyName] = rowMap[keyName]?.AcctCode || "";
    });
    console.log("ALL Obj Data", obj);
    if (SaveUpdateName === "SAVE") {
      try {
        setLoading(true);

        const res = await apiClient.post(`/WarehouseV2`, obj);

        if (res.data.success) {
          ClearFormData();
          setOpenListData([]);
          fetchOpenListData(0);
          fetchClosedListData(0);
          setOpenListPage(0);

          Swal.fire({
            title: "Success!",
            text: "WareHouse saved Successfully",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res.data.message,
            icon: "error",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        }
      } catch (error) {
        console.error("Error while saving Warehouse:", error);
        Swal.fire({
          title: "Error!",
          text: "Something went wrong: " + error.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        text: `Do You Want Update "${obj.WHSCode}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setLoading(true);

            const response = await apiClient.put(
              `/WarehouseV2/${data.DocEntry}`,
              obj
            );

            if (response.data.success) {
              fetchOpenListData(0);
              setOpenListPage(0);
              setOpenListData([]);

              fetchClosedListData(0);
              setClosedListPage(0);
              setClosedListData([]);

              ClearFormData();

              Swal.fire({
                title: "Success!",
                text: "WareHouse Updated",
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
          } catch (error) {
            console.error("Error while updating Warehouse:", error);
            Swal.fire({
              title: "Error!",
              text: "Something went wrong: " + error.message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          } finally {
            setLoading(false);
          }
        } else {
          Swal.fire({
            text: "WareHouse Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const handleDelete = () => {
    Swal.fire({
      text: `Do You Want Deleted "${AllData.WHSCode}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        apiClient
          .delete(`/WarehouseV2/${AllData.DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              setOpenListData([]);
              fetchOpenListData(0);
              fetchClosedListData(0);
              ClearFormData();
              setLoading(false);

              Swal.fire({
                title: "Success!",
                text: "Warehouse Deleted",
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
              setLoading(false);
            }
          })
          .catch(() => {
            Swal.fire({
              title: "Error!",
              text: "something went wrong",
              icon: "warning",
              confirmButtonText: "Ok",
            });
            setLoading(false);
          });
      } else {
        Swal.fire({
          text: "WareHouse Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        setLoading(false);
      }
    });
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
          Warehouse Master List
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
                onChange={handleTabChangeRight}
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
                    backgroundColor: "#F5F6FA",
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
                      title={item.WHSCode}
                      subtitle={item.BinCode === "0" ? "-" : item.BinCode}
                      description={item.WHSName}
                      searchResult={openListquery}
                      isSelected={oldOpenData === item.DocEntry}
                      onClick={() =>
                        setOldOpenData(
                          item.DocEntry,
                          item.BinCode,
                          item.DftBinAbs
                        )
                      }
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
                    backgroundColor: "#F5F6FA",
                  }}
                >
                  <SearchInputField
                    onChange={(e) => handleClosedListSearch(e.target.value)}
                    value={closedListquery}
                    onClickClear={handleClosedListClear}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  dataLength={closedListData.length}
                  hasMore={hasMoreClosed}
                  next={fetchMoreClosedListData}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScrollClosed"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {closedListData.map((item, i) => (
                    <CardComponent
                      key={i}
                      title={item.WHSCode}
                      subtitle={
                        item.BinCode === "0" ? "No Bin Location" : item.BinCode
                      }
                      searchResult={closedListquery}
                      isSelected={oldOpenData === item.DocEntry}
                      onClick={() =>
                        setOldOpenData(
                          item.DocEntry,
                          item.BinCode,
                          item.DftBinAbs
                        )
                      }
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
  const acctFieldParams = {
    ExpensesAc: { locManTran: "N", postable: "Y" }, // Expense Account
    RevenuesAc: {
      locManTran: "N",
      groupMask: [4],
      postable: "Y",
      finanse: "N",
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
    ARCMAct: { locManTran: "N", groupMask: [4], postable: "Y", finanse: "N" }, // Sales Credit Account
    APCMAct: { locManTran: "N", postable: "Y" },
    WhICenAct: { locManTran: "N", postable: "Y" },
    WhOCenAct: { locManTran: "N", postable: "Y" },
  };
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

  return (
    <>
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
      {/* {loading && <Loader open={loading} />} */}

      {/* ================== */}

      <SearchModel
        open={openbin}
        onClose={() => setOpenBin(false)}
        onCancel={() => setOpenBin(false)}
        title="BinLocation"
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
                subtitle={item.BinCode}
                searchResult={WhsrgetListquery}
                onClick={() => {
                  handleCell(item.DocEntry, item.BinCode);
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      {/* ========================= */}
      {loading && <Loader open={loading} />}

      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(handleSumbit)}
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

        {/* User Creation Form Grid */}

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={9}
          // component="form"
          position="relative"
        >
          {/* Hamburger Menu for smaller screens */}

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
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
            onClick={ClearFormData}
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
              Warehouse Master
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
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="WHSCode"
                      control={control}
                      rules={{
                        required: "WHSCode is required",
                        maxLength: {
                          value: 8,
                          message: "WHSCode max 8 characters",
                        },
                        minLength: {
                          value: 1,
                          message: "WHSCode min 1 character",
                        },
                        validate: (value) => {
                          if (value.trim() === "")
                            return "WHSCode cannot be empty or whitespace";
                          // Use a simpler emoji regex that is widely supported:
                          const emojiRegex =
                            /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])/;
                          if (emojiRegex.test(value))
                            return "Emojis are not allowed";
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="WAREHOUSE CODE"
                          type="text"
                          {...field}
                          disabled={!!DocEntry}
                          inputProps={{ maxLength: 8 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="WHSName"
                      control={control}
                      rules={{
                        required: "WHSName is required",
                        maxLength: {
                          value: 100,
                          message: "WHSName 50 characters allowed",
                        },
                        minLength: {
                          value: 1,
                          message: "WHSName 1 character required",
                        },
                        validate: (value) => {
                          if (value.trim() === "")
                            return "WHSName cannot be empty or whitespace";
                          // Use a simpler emoji regex that is widely supported:
                          const emojiRegex =
                            /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])/;
                          if (emojiRegex.test(value))
                            return "Emojis are not allowed";
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="WAREHOUSE NAME"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    container
                    item
                    width="100%"
                    m={1}
                    border="1px solid grey"
                    spacing={2}
                  >
                    <Tabs
                      sx={{ width: "100%" }}
                      value={tabvalue}
                      onChange={handleTabChange}
                      aria-label="tab options"
                    >
                      <Tab value={0} label="GENERAL" />
                      <Tab
                        value={1}
                        label="BIN LOCATION"
                        disabled={!BinActivat}
                      />
                      <Tab value={2} label="ACCOUNTING" />
                    </Tabs>

                    <Divider />
                    {tabvalue === 0 && (
                      <>
                        <Grid container mt={1}>
                          <Grid item lg={4} md={6} xs={12} textAlign="center">
                            <Controller
                              name="Location"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <AutomCompleteField
                                  {...field}
                                  label="Location"
                                  error={!!error}
                                  value={field.value} // Use field.value instead of location state
                                  helperText={error?.message ?? null}
                                  options={location} // This should be your location array
                                  // loading={loading}
                                  onChange={(selectedOption, reason) => {
                                    if (selectedOption) {
                                      field.onChange(selectedOption.DocEntry); // Store DocEntry in form
                                      setValue(
                                        "Street",
                                        selectedOption.Street || ""
                                      );
                                      setValue(
                                        "Block",
                                        selectedOption.Block || ""
                                      );
                                      setValue(
                                        "Address",
                                        `${selectedOption.Block || ""} ${
                                          selectedOption.Street || ""
                                        } `.trim()
                                      );
                                      setValue(
                                        "City",
                                        selectedOption.City || ""
                                      );
                                      setValue(
                                        "ZipCode",
                                        selectedOption.ZipCode || ""
                                      );
                                      setValue(
                                        "State",
                                        selectedOption.State || ""
                                      );
                                      setValue(
                                        "Country",
                                        selectedOption.Country || ""
                                      );
                                    } else {
                                      field.onChange(""); // Clear form field
                                      // Clear all related fields
                                      setValue("Street", "");
                                      setValue("Block", "");
                                      setValue("City", "");
                                      setValue("ZipCode", "");
                                      setValue("State", "");
                                      setValue("Country", "");
                                      setValue("Address", "");
                                    }
                                  }}
                                  onInputChange={(event, value, reason) => {
                                    console.log("Input Change:", value, reason);
                                    if (reason === "input") {
                                      debouncedFetch(value); // 🔥 Use typed input
                                    } else if (reason === "clear") {
                                      debouncedFetch("");
                                    }
                                  }}
                                  onScrollBottom={() => {
                                    if (!loading && hasMore) {
                                      setLocationPage((prev) => prev + 1);
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="Street"
                              control={control}
                              // rules={{ required: "Address is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="STREET"
                                  type="text"
                                  inputProps={{ maxLength: 100 }}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="Block"
                              control={control}
                              // rules={{ required: "Address is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="BLOCK"
                                  type="text"
                                  inputProps={{ maxLength: 100 }}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="Address"
                              control={control}
                              // rules={{ required: "Address is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="ADDRESS"
                                  type="text"
                                  inputProps={{ maxLength: 100 }}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="ZipCode"
                              control={control}
                                rules={{
                    // required: "Post Code is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Enter a valid 6-digit ZIP Code",
                    },
                  }}
                              // rules={{ required: "ZipCode is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="ZIPCODE"
                                  type="text"
                                  // inputProps={{ maxLength: 20 }}
                                  {...field}
                                  error={!!error}
                                   inputProps={{
                        maxLength: 6,
                        onInput: (e) => {
                          if (e.target.value.length > 6) {
                            e.target.value = e.target.value.slice(0, 6);
                          }
                        },
                      }}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="City"
                              control={control}
                              // rules={{ required: "City Name is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="CITY"
                                  type="text"
                                  inputProps={{ maxLength: 100 }}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="Country"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="COUNTRY"
                                  readOnly={AllData.Location}
                                  data={listofcountry.map((item) => ({
                                    key: item.CountryCode,
                                    value: item.CountryName,
                                  }))}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="State"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="STATE"
                                  readOnly={AllData.Location}
                                  data={listofstate.map((item) => ({
                                    key: item.Code,
                                    value: item.Name,
                                  }))}
                                />
                              )}
                            />
                          </Grid>

                          <Grid
                            item
                            lg={4}
                            md={6}
                            xs={12}
                            textAlign={"center"}
                            width={220}
                          >
                            <Controller
                              name="BinActivat"
                              control={control}
                              defaultValue={false}
                              // rules={{
                              //   required: "Please select Vehicle Type",
                              // }}
                              render={({ field, fieldState: { error } }) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      sx={{
                                        textAlign: "center",
                                        width: 20,
                                        mr: 1,
                                      }}
                                      {...field}
                                      checked={field.value}
                                    />
                                  }
                                  label={
                                    <Typography
                                      variant="body2"
                                      noWrap={true}
                                      sx={{
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family here
                                      }}
                                    >
                                      Enable to Bin Location
                                    </Typography>
                                  }
                                  sx={{
                                    textAlign: "center",
                                    width: 200,
                                    whiteSpace: "normal", // Allow the label to wrap
                                    fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid
                            item
                            lg={4}
                            md={6}
                            xs={12}
                            textAlign={"center"}
                            width={220}
                          >
                            <Controller
                              name="Excisable"
                              control={control}
                              defaultValue={false}
                              // rules={{
                              //   required: "Please select Vehicle Type",
                              // }}
                              render={({ field, fieldState: { error } }) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      sx={{
                                        textAlign: "center",
                                        width: 20,
                                        mr: 1,
                                      }}
                                      {...field}
                                      checked={field.value}
                                    />
                                  }
                                  label={
                                    <Typography
                                      variant="body2"
                                      noWrap={true}
                                      sx={{
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family here
                                      }}
                                    >
                                      Excisable
                                    </Typography>
                                  }
                                  sx={{
                                    textAlign: "center",
                                    width: 200,
                                    whiteSpace: "normal", // Allow the label to wrap
                                    fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid
                            item
                            lg={4}
                            md={6}
                            xs={12}
                            textAlign={"center"}
                            width={220}
                          >
                            <Controller
                              name="Status"
                              control={control}
                              defaultValue={false}
                              // rules={{
                              //   required: "Please select Vehicle Type",
                              // }}
                              render={({ field, fieldState: { error } }) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      sx={{
                                        textAlign: "center",
                                        width: 20,
                                        mr: 1,
                                      }}
                                      {...field}
                                      checked={field.value}
                                    />
                                  }
                                  label={
                                    <Typography
                                      variant="body2"
                                      noWrap={true}
                                      sx={{
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family here
                                      }}
                                    >
                                      Active
                                    </Typography>
                                  }
                                  sx={{
                                    textAlign: "center",
                                    width: 200,
                                    whiteSpace: "normal", // Allow the label to wrap
                                    fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                  }}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}

                    {tabvalue === 1 && (
                      <>
                        <Grid container>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="BinSeptor"
                              control={control}
                              // rules={{ required: "BinSeptor Name is Required" }}

                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="BIN LOC. CODE SEPARATOR"
                                  data={[
                                    {
                                      key: "-",
                                      value: "-",
                                    },
                                    {
                                      key: "_",
                                      value: "_",
                                    },
                                    {
                                      key: ".",
                                      value: ".",
                                    },
                                    {
                                      key: "#",
                                      value: "#",
                                    },
                                  ]}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="NoOfDftBinAbs"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="NO. OF BIN LOCATION"
                                  // Change disabled to readOnly in InputProps
                                  {...field}
                                  error={!!error}
                                  readOnly={true}
                                  helperText={error ? error.message : null}
                                  inputProps={{
                                    maxLength: 11,
                                    onInput: (e) => {
                                      if (e.target.value.length > 11) {
                                        e.target.value = e.target.value.slice(
                                          0,
                                          11
                                        );
                                      }
                                    },
                                  }}
                                  InputProps={{
                                    readOnly: true, // This makes the field read-only instead of disabled
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton color="primary">
                                          {/* <SearchIcon /> */}
                                        </IconButton>
                                        <IconButton
                                          disabled={AllData.DocEntry === ""}
                                          onClick={handleClickOpen}
                                          size="small"
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
                              )}
                            />
                          </Grid>
                          <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                            <Controller
                              name="BinCode"
                              control={control}
                              rules={
                                SaveUpdateName === "UPDATE" &&
                                getValues("NoOfDftBinAbs") !== "No Bin"
                                  ? {
                                      required: "BinSeparator Name is Required",
                                    } // ✅ validate in UPDATE mode unless 'No Bin'
                                  : {} // ❌ skip validation otherwise
                              }
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="DEFAULT BIN LOCATIONS"
                                  {...field}
                                  title={field.value}
                                  error={!!error}
                                  onChange={(e) => {
                                    setValue("BinCode", "");
                                    setValue("DftBinAbs", "");
                                    field.onChange(e); // ✅ ensures react-hook-form state updates correctly
                                  }}
                                  helperText={error ? error.message : null}
                                />
                              )}
                            />
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            md={6}
                            lg={4}
                            sm={6}
                            textAlign={"center"}
                            width={220}
                          >
                            <Controller
                              name="DftBinEnfd"
                              control={control}
                              defaultValue={false}
                              // rules={{
                              //   required: "Please select Vehicle Type",
                              // }}
                              render={({ field, fieldState: { error } }) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      sx={{
                                        textAlign: "center",
                                        width: 20,
                                        mr: 1,
                                      }}
                                      {...field}
                                      checked={field.value}
                                    />
                                  }
                                  label={
                                    <Typography
                                      variant="body2"
                                      noWrap={true}
                                      sx={{
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family here
                                      }}
                                    >
                                      Enforce Default Bin Loc.
                                    </Typography>
                                  }
                                  sx={{
                                    textAlign: "center",
                                    width: 200,
                                    whiteSpace: "normal", // Allow the label to wrap
                                    fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          {/* <Grid
                            item
                            xs={12}
                            md={6}
                            lg={4}
                            sm={6}
                            textAlign="center"
                            width={220}
                          >
                            <Controller
                              name="RecBinEnab"
                              control={control}
                              defaultValue={false}
                              render={({ field }) => (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      sx={{
                                        textAlign: "center",
                                        width: 20,
                                        mr: 1,
                                      }}
                                      {...field}
                                      checked={field.value}
                                    />
                                  }
                                  label={
                                    <Typography
                                      variant="body2"
                                      noWrap={true}
                                      sx={{
                                        fontFamily: "'Open Sans', sans-serif",
                                      }}
                                    >
                                      Enable Receiving Bin Locations
                                    </Typography>
                                  }
                                  sx={{
                                    textAlign: "center",
                                    width: 200,
                                    whiteSpace: "normal",
                                    fontFamily: "'Open Sans', sans-serif",
                                  }}
                                />
                              )}
                            />
                          </Grid> */}

                          {/* {RecBinEnab && (
                            <>
                              <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="RecItemsBy"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      label="Receive Items By"
                                      data={[
                                        {
                                          key: "1",
                                          value: "Rushi",
                                        },
                                      ]}
                                      // data={currencydata.map((item) => ({
                                      //   key: item.CurrCode,
                                      //   value: item.CurrName,
                                      // }))}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                                width={220}
                              >
                                <Controller
                                  name="BinActivat"
                                  control={control}
                                  defaultValue={false}
                                  // rules={{
                                  //   required: "Please select Vehicle Type",
                                  // }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap={true}
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif", // Apply font family here
                                          }}
                                        >
                                          Enable to Bin Location
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal", // Allow the label to wrap
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="RecvUpTo"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      label="Receive up to"
                                      data={[
                                        {
                                          key: "st",
                                          value: "delhi",
                                        },
                                      ]}
                                      // data={currencydata.map((item) => ({
                                      //   key: item.CurrCode,
                                      //   value: item.CurrName,
                                      // }))}
                                    />
                                  )}
                                />
                              </Grid>
                            </>
                          )} */}
                        </Grid>
                      </>
                    )}
                    {tabvalue === 2 && (
                      <>
                        {tabvalue === 2 && (
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
                                            Accounting: prev.Accounting.map(
                                              (r) =>
                                                r.id === params.row.id
                                                  ? {
                                                      ...r,
                                                      AcctCode: "",
                                                      AcctName: "",
                                                    }
                                                  : r
                                            ),
                                          }));
                                        }
                                      }}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <IconButton
                                              onClick={() => {
                                                const fieldKey =
                                                  params.row.keyName;

                                                // Fetch accounts for the modal

                                                // Open modal
                                                OpenDatagridAcctCodeModal(
                                                  "Accounting",
                                                  params.row.id
                                                );
                                              }}
                                              disabled={
                                                params.row.Status === "0"
                                              }
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
                              pagination: {
                                paginationModel: { pageSize: 100 },
                              },
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
                      </>
                    )}
                  </Grid>
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
                sx={{ color: "white" }}
                color="success"
                type="submit"
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                disabled={AllData.DocEntry === "" || !perms.IsDelete}
                color="error"
                onClick={handleDelete}
              >
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
