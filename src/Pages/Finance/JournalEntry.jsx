import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ViewListIcon from "@mui/icons-material/ViewList";

import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import DataGridCellClickModel from "../Components/DataGridCellClickModel"; // Assuming this component exists
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputSelectTextField1,
  InputTextField,
  InputTextFieldLarge,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";

// Custom hook for reusable modal list logic
const useModalList = (apiEndpoint, initialPageSize = 20, status = "0") => {
  const [listData, setListData] = useState([]);
  const [listPage, setListPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [listQuery, setListQuery] = useState("");
  const [listSearching, setListSearching] = useState(false);
  const timeoutRef = useRef(null);

  const fetchData = useCallback(
    async (pageNum, searchTerm = "") => {
      try {
        const url = searchTerm
          ? `${apiEndpoint}/Search/${searchTerm}/${status}/${pageNum}/20`
          : `${apiEndpoint}/Pages/${status}/${pageNum}/20`;

        const response = await apiClient.get(url);

        if (response.data.success) {
          const newData = response.data.values;
          setHasMore(newData.length === initialPageSize);
          setListData((prev) =>
            pageNum === 0 ? newData : [...prev, ...newData]
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
    },
    [apiEndpoint, initialPageSize, status]
  );

  const handleSearch = useCallback(
    (term) => {
      setListQuery(term);
      setListSearching(true);
      setListPage(0);
      setListData([]);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        fetchData(0, term);
      }, 600);
    },
    [fetchData]
  );

  const handleClear = useCallback(() => {
    setListQuery("");
    setListSearching(false);
    setListPage(0);
    setListData([]);
    fetchData(0);
  }, [fetchData]);

  const fetchMore = useCallback(() => {
    fetchData(listPage + 1, listSearching ? listQuery : "");
    setListPage((prev) => prev + 1);
  }, [fetchData, listPage, listSearching, listQuery]);

  useEffect(() => {
    fetchData(0); // Initial fetch
  }, [fetchData]);

  return {
    listData,
    listPage,
    hasMore,
    listQuery,
    listSearching,
    handleSearch,
    handleClear,
    fetchMore,
    fetchData, // Expose fetchData for initial load in useEffect
  };
};

export default function JournalEntry() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [JERows, setJERows] = useState([]);
  const [location, setLocationData] = useState([]);
  const [OrignCurrData, setOrignCurrData] = useState([]);
  const [TaxTypeData, setTaxTypeData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tab, setTab] = useState("0");
  const [selectedRow, setSelectedRow] = useState(null);

  const { user, companyData } = useAuth();
  const localCurrency = companyData?.MainCurncy;
  const systemCurrency = companyData?.SysCurrncy;
  // Separate state and functions for ChartOfAccounts
  const [AccountgetListData, setAccountgetListData] = useState([]);
  const [AccounthasMoreGetList, setAccounthasMoreGetList] = useState(true);
  const [AccountgetListquery, setAccountgetListquery] = useState("");
  const [AccountgetListSearching, setAccountgetListSearching] = useState(false);
  const AccountListtimeoutRef = useRef(null);
  const [AccountlistPage, setAccountListPage] = useState(0);
  const [clearCache, setClearCache] = useState(false);

  // Separate state and functions for Control Accounts
  const [controlAcctRows, setControlAcctRows] = useState([]);
  const [controlAcctLoading, setControlAcctLoading] = useState(false);
  const [controlAcctRowCount, setControlAcctRowCount] = useState(0);
  const [controlAcctCurrentPage, setControlAcctCurrentPage] = useState(0);
  const [controlAcctSearchText, setControlAcctSearchText] = useState("");
  const [isControlAcctDialogOpen, setIsControlAcctDialogOpen] = useState(false);
  const controlAcctTimeoutRef = useRef(null);
  const [ObjType, setObjType] = useState([]);

  const [exchangeRateModalOpen, setExchangeRateModalOpen] = useState(false);
  const [exchangeRateModalData, setExchangeRateModalData] = useState({
    RateDate: null,
    Currency: "",
    DocEntry: "",
  });
  const [manualRate, setManualRate] = useState("");
  const [isSavingManualRate, setIsSavingManualRate] = useState(false);

  const initialFormValues = {
    Series: "",
    DocNum: "",
    RefDate: dayjs(undefined).format("YYYY-MM-DD"),
    DueDate: dayjs(undefined).format("YYYY-MM-DD"),
    TaxDate: dayjs(undefined).format("YYYY-MM-DD "),
    Origin: "",
    FinncPriod: "",
    PIndicator: "",
    BaseRef: "",
    TransId: "",
    Location: "",
    FixExchRate: "N",
    AutoStorno: "N",
    AdjTran: "N",
    AutoVAT: "N",
    GenRegNo: "N",
    DisplayFC: "N",
    DisplaySC: "N",
    StornoDate: "",
    ExciseNumberField: "",
    TransType: "",
    OrignCurr: "",
  };
  // Constants for pagination
  const CONTROL_ACCT_LIMIT = 20;
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
  } = useForm({
    defaultValues: initialFormValues,
  });
  const ObjectTypeList = async () => {
    const res = await apiClient.get(`/TransactionMaster/all`);
    const response = res.data.values;
    setObjType(response);
    if (response.success) {
    }
  };
  const fetchAccountGetListData = useCallback(
    async (pageNum, searchTerm = "") => {
      try {
        // Build query parameters dynamically
        const params = {
          Status: 1,
          Page: pageNum,
          Limit: 20, // assuming 20 per page
          LocManTran: "N",
          Postable: "Y",
        };

        if (searchTerm.trim() !== "") {
          params.SearchText = searchTerm.trim();
        }

        const response = await apiClient.get("/ChartOfAccounts", { params });

        if (response.data.success) {
          const newData = response.data.values || [];
          setAccounthasMoreGetList(newData.length === 20); // 20 = page size
          setAccountgetListData((prev) =>
            pageNum === 0 ? newData : [...prev, ...newData]
          );
        } else {
          Swal.fire({
            text: response.data.message,
            icon: "question",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        Swal.fire({
          text: error?.message || "Something went wrong",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    },
    []
  );

  const handleAccountGetListSearch = useCallback(
    (term) => {
      setAccountgetListquery(term);
      setAccountgetListSearching(true);
      setAccountListPage(0);
      setAccountgetListData([]);
      if (AccountListtimeoutRef.current)
        clearTimeout(AccountListtimeoutRef.current);
      AccountListtimeoutRef.current = setTimeout(
        () => fetchAccountGetListData(0, term),
        600
      );
    },
    [fetchAccountGetListData]
  );

  const handleAccountGetListClear = useCallback(() => {
    setAccountgetListquery("");
    setAccountgetListSearching(false);
    setAccountListPage(0);
    setAccountgetListData([]);
    fetchAccountGetListData(0);
  }, [fetchAccountGetListData]);

  const fetchAccountMoreGetListData = useCallback(() => {
    fetchAccountGetListData(
      AccountlistPage + 1,
      AccountgetListSearching ? AccountgetListquery : ""
    );
    setAccountListPage((prev) => prev + 1);
  }, [
    fetchAccountGetListData,
    AccountlistPage,
    AccountgetListSearching,
    AccountgetListquery,
  ]);

  // Updated fetchControlAccountData: Now returns the fetched rows (or null on error)
  const fetchControlAccountData = useCallback(
    async (page, searchTerm = "", isBPData = false, AccountSource = "") => {
      setControlAcctLoading(true);
      try {
        const params = new URLSearchParams({
          Status: 1,
          Page: page,
          Limit: CONTROL_ACCT_LIMIT,
        });

        // Conditional logic for LocManTran and GroupMask (unchanged)
        if (isBPData) {
          params.append("LocManTran", "Y");
          params.append("GroupMask", "1,2");
          params.append("Postable", "Y");
        } else if (AccountSource === "AccountModal") {
          params.append("LocManTran", "N");
          params.append("Postable", "Y");
        } else {
          params.append("LocManTran", "N");
        }

        if (searchTerm) {
          params.append("Search", searchTerm);
        }

        const url = `/ChartOfAccounts?${params.toString()}`;
        const response = await apiClient.get(url);

        if (response.data.success) {
          const fetchedRows = response.data.values || []; // NEW: Capture fresh data
          setControlAcctRows(fetchedRows); // Keep state update for modal/pagination
          setControlAcctRowCount(response.data.totalCount || 0);
          return fetchedRows; // NEW: Return fresh data for immediate use
        } else {
          Swal.fire({
            text: response.data.message,
            icon: "question",
            confirmButtonText: "OK",
          });
          return null; // NEW: Return null on failure
        }
      } catch (error) {
        Swal.fire({
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
        });
        return null; // NEW: Return null on error
      } finally {
        setControlAcctLoading(false);
      }
    },
    []
  );
  const handleControlAcctPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== controlAcctCurrentPage) {
        setControlAcctCurrentPage(model.page);
        const selectedRowId = getValues("selectedRowIndex");
        const row = JERows.find((r) => r.id === selectedRowId);
        const isBPData = row?.AccountSource === "BPData";
        fetchControlAccountData(model.page, controlAcctSearchText, isBPData);
      }
    },
    [
      controlAcctCurrentPage,
      controlAcctSearchText,
      fetchControlAccountData,
      getValues,
      JERows,
    ]
  );

  const handleControlAcctSearchChange = useCallback(
    (e) => {
      const searchTerm = e.target.value;
      setControlAcctSearchText(searchTerm);
      setControlAcctCurrentPage(0); // Reset to first page on new search
      if (controlAcctTimeoutRef.current) {
        clearTimeout(controlAcctTimeoutRef.current);
      }
      controlAcctTimeoutRef.current = setTimeout(() => {
        const selectedRowId = getValues("selectedRowIndex");
        const row = JERows.find((r) => r.id === selectedRowId);
        const isBPData = row?.AccountSource === "BPData";
        fetchControlAccountData(0, searchTerm, isBPData);
      }, 600);
    },
    [fetchControlAccountData, getValues, JERows]
  );

  const syncAndUpdateTaxLines = useCallback(
    (parentRowId, field = null, value = null) => {
      setJERows((prevRows) => {
        const parentRow = prevRows.find((row) => row.id === parentRowId);
        if (!parentRow) return prevRows;

        const parentDebit = parseFloat(parentRow.Debit) || 0;
        const parentCredit = parseFloat(parentRow.Credit) || 0;
        const parentFCDebit = parseFloat(parentRow.FCDebit) || 0;
        const parentFCCredit = parseFloat(parentRow.FCCredit) || 0;
        const parentSYSDeb = parseFloat(parentRow.SYSDeb) || 0;
        const parentSYSCred = parseFloat(parentRow.SYSCred) || 0;
        const parentTaxCode = parentRow.TaxCode || "";

        const parentLineTotal =
          parentDebit !== 0
            ? parentDebit
            : parentCredit !== 0
            ? parentCredit
            : 0;
        const parentFCLineTotal =
          parentFCDebit !== 0
            ? parentFCDebit
            : parentFCCredit !== 0
            ? parentFCCredit
            : 0;
        const parentSYSLineTotal =
          parentSYSDeb !== 0
            ? parentSYSDeb
            : parentSYSCred !== 0
            ? parentSYSCred
            : 0;

        return prevRows.map((row) => {
          if (row.ParentRowId === parentRowId) {
            let updatedRow = { ...row };

            // Sync shared field
            if (field !== null && value !== null) {
              updatedRow[field] = value;
              setValue(`${field}_${row.id}`, value);
            }

            if (
              parentTaxCode &&
              (parentLineTotal > 0 ||
                parentFCLineTotal > 0 ||
                parentSYSLineTotal > 0)
            ) {
              const rate =
                parseFloat(row.Rate) || parseFloat(parentRow.TaxRate) || 0;

              const baseTaxAmount = (rate / 100) * parentLineTotal;
              const fcTaxAmount = (rate / 100) * parentFCLineTotal;
              const sysTaxAmount = (rate / 100) * parentSYSLineTotal;

              updatedRow.Debit =
                parentDebit > 0 ? baseTaxAmount.toFixed(2) : "";
              updatedRow.Credit =
                parentCredit > 0 ? baseTaxAmount.toFixed(2) : "";
              updatedRow.FCDebit =
                parentFCDebit > 0 ? fcTaxAmount.toFixed(2) : "";
              updatedRow.FCCredit =
                parentFCCredit > 0 ? fcTaxAmount.toFixed(2) : "";
              updatedRow.SYSDeb =
                parentSYSDeb > 0 ? sysTaxAmount.toFixed(2) : "";
              updatedRow.SYSCred =
                parentSYSCred > 0 ? sysTaxAmount.toFixed(2) : "";

              setValue(`Debit_${row.id}`, updatedRow.Debit);
              setValue(`Credit_${row.id}`, updatedRow.Credit);
              setValue(`FCDebit_${row.id}`, updatedRow.FCDebit);
              setValue(`FCCredit_${row.id}`, updatedRow.FCCredit);
              setValue(`SYSDeb_${row.id}`, updatedRow.SYSDeb);
              setValue(`SYSCred_${row.id}`, updatedRow.SYSCred);
            }

            return updatedRow;
          }
          return row;
        });
      });
    },
    [setValue]
  );

  const handleCellChange = useCallback(
    (rowId, field, value, source = null) => {
      setJERows((prev) => {
        let newRows = prev.map((row) => {
          if (row.id === rowId) {
            const updatedRow = {
              ...row,
              [field]: value,

              // ✅ FORCE FCCurrency INTO ROW STATE
              ...(field === "FCCurrency" ? { FCCurrency: value } : {}),
            };

            // -----------------------------
            // VAT + Gross calculation
            // -----------------------------
            const credit = parseFloat(updatedRow.Credit) || 0;
            const debit = parseFloat(updatedRow.Debit) || 0;
            const fcCredit = parseFloat(updatedRow.FCCredit) || 0;
            const fcDebit = parseFloat(updatedRow.FCDebit) || 0;
            const sysCredit = parseFloat(updatedRow.SYSCred) || 0;
            const sysDebit = parseFloat(updatedRow.SYSDeb) || 0;
            const baseAmount = credit || debit;
            const fcAmount = fcCredit || fcDebit;
            const sysAmount = sysCredit || sysDebit;
            const taxRate = parseFloat(updatedRow.TaxRate) || 0;

            if (
              taxRate > 0 &&
              (baseAmount > 0 || fcAmount > 0 || sysAmount > 0)
            ) {
              const calcAmount = baseAmount || fcAmount || sysAmount;
              const VatAmount = (calcAmount * taxRate) / 100;
              const grossValue = calcAmount + VatAmount;
              updatedRow.VatAmount = VatAmount.toFixed(2);
              updatedRow.GrossValue = grossValue.toFixed(2);
            } else {
              updatedRow.VatAmount = "";
              updatedRow.GrossValue = "";
            }

            setValue(`${field}_${rowId}`, value); // Update RHF value

            if (field === "AccountSource" && source) {
              updatedRow.AccountSource = source;
            }

            return updatedRow;
          }
          return row;
        });

        // -----------------------------
        // Clear children and reset fields if ShortName changed
        // -----------------------------
        if (field === "ShortName") {
          newRows = newRows.filter((r) => r.ParentRowId !== rowId); // Remove tax lines
          newRows = newRows.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  TaxCode: "",
                  VatAmount: "",
                  SYSVatSum: "",
                  GrossValue: "",
                  GrossValFC: "",
                  Debit: "", // Clear LC Debit
                  Credit: "", // Clear LC Credit
                  FCDebit: "", // Clear FC Debit
                  FCCredit: "", // Clear FC Credit
                  SYSDeb: "", // Clear SC Debit
                  SYSCred: "", // Clear SC Credit

                  // Add any other amount-related fields if needed (e.g., BalanceDueLC, etc.)
                }
              : r
          );
          // Update React Hook Form values
          setValue(`TaxCode_${rowId}`, "");
          setValue(`VatAmount_${rowId}`, "");
          setValue(`SYSVatSum_${rowId}`, "");
          setValue(`GrossValue_${rowId}`, "");
          setValue(`GrossValFC_${rowId}`, "");
          setValue(`Debit_${rowId}`, "");
          setValue(`Credit_${rowId}`, "");
          setValue(`FCDebit_${rowId}`, "");
          setValue(`FCCredit_${rowId}`, "");
          setValue(`SYSDeb_${rowId}`, "");
          setValue(`SYSCred_${rowId}`, "");
          // Add setValue for any other amount-related fields if needed
        }

        return newRows;
      });

      // -----------------------------
      // Sync shared fields to tax lines
      // -----------------------------
      if (["MatType", "Location", "CenVatCom"].includes(field)) {
        syncAndUpdateTaxLines(rowId, field, value);
      }

      // -----------------------------
      // Trigger tax sync for amount changes
      // -----------------------------
      if (
        [
          "Debit",
          "Credit",
          "FCDebit",
          "FCCredit",
          "SYSDeb",
          "SYSCred",
        ].includes(field)
      ) {
        syncAndUpdateTaxLines(rowId);
      }
    },
    [setValue, syncAndUpdateTaxLines]
  );

  const handleControlAcctRowSelection = useCallback(
    (params) => {
      const selectedId = getValues("selectedRowIndex");
      if (!selectedId) return;

      const shortNameCurrency = getValues(`BPGLCurrency_${selectedId}`);
      const controlAcctCurrency = params.row.ActCurr || ""; // Use ActCurr from ChartOfAccounts response

      // --------------------------
      // Currency Validation
      // --------------------------
      if (
        shortNameCurrency &&
        controlAcctCurrency &&
        shortNameCurrency.trim().toUpperCase() !== "AC" && // Bypass if ShortName currency is "AC"
        shortNameCurrency.trim().toUpperCase() !==
          controlAcctCurrency.trim().toUpperCase()
      ) {
        Swal.fire({
          title: "Currency Mismatch",
          text: `Selected Control Account (${controlAcctCurrency}) currency does not match with Short Name (${shortNameCurrency}) currency.`,
          icon: "warning",
          confirmButtonText: "OK",
        });
        return; // Stop execution
      }

      // --------------------------
      // If valid currency — update
      // --------------------------
      handleCellChange(selectedId, "Account", params.row.AcctCode);
      handleCellChange(selectedId, "Name", params.row.AcctName);
      // handleCellChange(selectedId, "AccountSource", "AccountModal");
      handleCellChange(selectedId, "BPGLCurrency", controlAcctCurrency); // Update BPGLCurrency with the control account's currency

      setIsControlAcctDialogOpen(false);
    },
    [getValues, handleCellChange]
  );

  // Reusable modal list hooks for others
  const {
    listData: BPDatagetListData,
    hasMore: BPDatahasMoreGetList,
    listQuery: BPDatagetListquery,
    handleSearch: handleBPDataGetListSearch,
    handleClear: handleBPDataGetListClear,
    fetchMore: fetchBPDataMoreGetListData,
    fetchData: fetchBPDataGetListData,
  } = useModalList("/BPV2/V2", 20, "1");

  const {
    listData: TaxCodegetListData,
    hasMore: TaxCodehasMoreGetList,
    listQuery: TaxCodegetListquery,
    handleSearch: handleTaxCodeGetListSearch,
    handleClear: handleTaxCodeGetListClear,
    fetchMore: fetchTaxCodeMoreGetListData,
    fetchData: fetchTaxCodeGetListData,
  } = useModalList("/TaxCode", 20, "1");

  const {
    listData: closeListData,
    hasMore: hasMoreClose,
    listQuery: CloseListquery,
    handleSearch: handleCloseListSearch,
    handleClear: handleCloseListClear,
    fetchMore: fetchMorecloseListData,
    fetchData: fetchcloseListData,
  } = useModalList("/JournalEntry", 20, "0"); // Status '1' for open

  const {
    listData: CancelListData,
    hasMore: hasMoreCancel,
    listQuery: CancelListquery,
    handleSearch: handleCancelListSearch,
    handleClear: handleCancelListClear,
    fetchMore: fetchMoreCancelListData,
    fetchData: fetchCancelListData,
  } = useModalList("/JournalEntry", 20, "3"); // Status '3' for cancelled

  const [openAccountList, setAccountOpen] = useState(false);
  const OpenAccountModel = () => setAccountOpen(true);
  const CloseAccountModel = () => setAccountOpen(false);

  const [openBPDataList, setBPDataOpen] = useState(false);
  const OpenBPDataModel = () => setBPDataOpen(true);
  const CloseBPDataModel = () => setBPDataOpen(false);

  const [openTaxCodeList, setTaxCodeOpen] = useState(false);
  const OpenTaxCodeModel = () => setTaxCodeOpen(true);
  const CloseTaxCodeModel = () => setTaxCodeOpen(false);

  const allFormData = getValues();
  const FixExchRate = watch("FixExchRate");
  const WatchReverse = watch("AutoStorno");
  const watchAutoTax = watch("AutoVAT");
  const GenerateExciseNo = watch("GenRegNo");
  const { isDirty } = useFormState({ control });
  const displayInFc = watch("DisplayFC");
  const displayInSc = watch("DisplaySC");
const transType = watch("TransType");
const baseRef = watch("BaseRef");
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  //=========================================================================
  const Openmenu = Boolean(anchorEl);

  const handleClickCancelClosed = (event) => {
    setAnchorEl(event.currentTarget);
  };
  let handleCloseCancelClosed = () => {
    setAnchorEl(null);
  };
  const currentData = getValues();

  const handleOnCancelDocument = () => {
    Swal.fire({
      text: `Do You Want to Cancel "${currentData.DocNum}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .put(`/JournalEntry/Cancel/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              clearFormData();
              // setcloseListData([]);
              fetchcloseListData(0);
              fetchCancelListData(0);
              Swal.fire({
                text: "Journal Entry Cancelled",
                icon: "success",
                toast: true,
                showConfirmButton: false,
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: resp.data.success,
                text: resp.data.message,
                icon: "info",
                toast: true,
                // showConfirmButton: false,
                confirmButtonText: "Ok",
                // timer: 1500,
              });
            }
          });
      } else {
        Swal.fire({
          text: "Journal Entry Not Cancelled",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      ""
    );

  const clearFormData = () => {
    reset(initialFormValues);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    setJERows([]);
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
  };

  const handleMainLocationChange = useCallback(
    (newLocation) => {
      setJERows((prevRows) =>
        prevRows.map((row) => {
          setValue(`Location_${row.id}`, newLocation); // Update RHF value
          return { ...row, Location: newLocation }; // Update local state
        })
      );
    },
    [setValue]
  );

  const onSelectAccount = useCallback(
    (AcctCode, AcctName, Currency) => {
      const selectedId = getValues("selectedRowIndex");
      if (selectedId) {
        handleCellChange(selectedId, "ShortName", AcctCode, "AccountModal");
        handleCellChange(selectedId, "Name", AcctName);
        handleCellChange(selectedId, "Account", AcctCode);
        handleCellChange(selectedId, "AccountSource", "AccountModal");
        handleCellChange(selectedId, "BPGLCurrency", Currency);
      }
    },
    [getValues, handleCellChange]
  );

  const onSelectBPData = useCallback(
    async (CardCode, CardName, BPControlAcct, Currency) => {
      const selectedId = getValues("selectedRowIndex");
      if (selectedId) {
        handleCellChange(selectedId, "ShortName", CardCode, "BPData");
        handleCellChange(selectedId, "Name", CardName);
        handleCellChange(selectedId, "AccountSource", "BPData");
        handleCellChange(selectedId, "BPGLCurrency", Currency);

        // Fetch control accounts for BP
        const isBPData = true;
        const fetchedControlAccts = await fetchControlAccountData(
          0,
          "",
          isBPData
        ); // NEW: Await and capture returned data

        if (fetchedControlAccts && fetchedControlAccts.length > 0) {
          // Check if BPControlAcct matches AcctCode in fresh data
          const controlAcctExists = fetchedControlAccts.some(
            (account) => account.AcctCode === BPControlAcct // Trim if needed: .trim() === BPControlAcct.trim()
          );

          console.log("Fetched Control Accounts:", fetchedControlAccts); // DEBUG: Log for verification
          console.log(
            "BPControlAcct:",
            BPControlAcct,
            "Exists?",
            controlAcctExists
          ); // DEBUG

          if (controlAcctExists) {
            handleCellChange(selectedId, "Account", BPControlAcct);
          } else {
            handleCellChange(selectedId, "Account", "");
            // Swal.fire({
            //   text: `Control Account "${BPControlAcct}" for selected Business Partner not found in Chart of Accounts.`,
            //   icon: "warning",
            //   confirmButtonText: "OK",
            // });
          }
        } else {
          // Fallback if no data fetched
          // handleCellChange(selectedId, "Account", "");
          // Swal.fire({
          //   text: `No control accounts found for Business Partner. Please check Chart of Accounts setup.`,
          //   icon: "warning",
          //   confirmButtonText: "OK",
          // });
          // console.error("No control accounts fetched"); // DEBUG
        }
      }
      CloseBPDataModel();
    },
    [getValues, handleCellChange, fetchControlAccountData] // UPDATED: Removed controlAcctRows from deps (no longer needed)
  );

  const handleIconClick = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleSelectGL = () => {
    setValue("selectedRowIndex", selectedRow);
    OpenAccountModel();
    handleMenuClose();
  };

  const handleSelectBP = () => {
    setValue("selectedRowIndex", selectedRow);
    OpenBPDataModel();
    handleMenuClose();
  };

  const handleSelectControlAccount = useCallback(
    (rowId) => {
      setValue("selectedRowIndex", rowId);
      const row = JERows.find((r) => r.id === rowId);
      const accountSource = row?.AccountSource || ""; // BPData or AccountModal

      const isBPData = accountSource === "BPData";
      fetchControlAccountData(0, "", isBPData, accountSource);

      setIsControlAcctDialogOpen(true);
    },
    [fetchControlAccountData, JERows, setValue]
  );

  const getParentLineTotal = useCallback(
    (parentRowId) => {
      const row = JERows.find((r) => r.id === parentRowId);
      if (!row) return 0;
      const credit = parseFloat(row.Credit) || 0;
      const debit = parseFloat(row.Debit) || 0;
      return credit !== 0 ? credit : debit;
    },
    [JERows]
  );

  const reindexRows = useCallback(
    (rows) =>
      rows.map((row, index) => ({
        ...row,
        SrNo: index + 1,
      })),
    []
  );

  const addTaxLines = useCallback(
    (
      parentRowId,
      taxOLines,
      parentLineTotal,
      parentTaxCode,
      parentVatRate,
      systemRate,
      shortNameCurr,
      rateLCtoFC
    ) => {
      setJERows((prevRows) => {
        const rowIndex = prevRows.findIndex((row) => row.id === parentRowId);
        if (rowIndex === -1 || !taxOLines.length) return prevRows;

        const parentRow = prevRows[rowIndex];
        const parentDebit = parseFloat(parentRow.Debit) || 0;
        const parentCredit = parseFloat(parentRow.Credit) || 0;

        const parentLocation = parentRow.Location || "";
        const parentMatType = parentRow.MatType || "";
        const parentGstCennvat = parentRow.CenVatCom || "";

        const filteredRows = prevRows.filter(
          (row) => row.ParentRowId !== parentRowId
        );
        const parentFCCurrency =
          parentRow.BPGLCurrency === "AC"
            ? parentRow.FCCurrency || "0"
            : parentRow.BPGLCurrency &&
              parentRow.BPGLCurrency !== companyData?.MainCurncy &&
              parentRow.BPGLCurrency !== companyData?.SysCurrncy
            ? parentRow.BPGLCurrency
            : "0";

        const parentLC = parentDebit !== 0 ? parentDebit : parentCredit;

        const parentFC =
          parseFloat(parentRow.FCDebit) || parseFloat(parentRow.FCCredit) || 0;

        // ✅ FC ratio (MOST IMPORTANT LINE)
        const fcRatio = parentLC > 0 && parentFC > 0 ? parentFC / parentLC : 0;

        const newTaxRows = taxOLines.map((taxLine, index) => {
          const taxAmount =
            (parseFloat(taxLine.Rate) / 100) * parseFloat(parentLineTotal || 0);

          const isDebit = parentDebit > 0;
          const lcValue = taxAmount;

          // 🔹 SYSTEM CURRENCY
          const sysValue =
            systemRate && systemRate !== 0 ? lcValue / systemRate : lcValue;

          // 🔹 FC LOGIC
          const isFC =
            parentFCCurrency &&
            parentFCCurrency !== "0" &&
            parentFCCurrency !== companyData?.MainCurncy &&
            parentFCCurrency !== companyData?.SysCurrncy;

          const fcValue = isFC && fcRatio > 0 ? lcValue * fcRatio : 0;

          const Account = isDebit ? taxLine.PurchTax : taxLine.SalesTax;

          const newTaxRow = {
            id: `${parentRowId}-T${index + 1}`,
            ParentRowId: parentRowId,

            Debit: isDebit ? lcValue.toFixed(2) : "",
            Credit: !isDebit ? lcValue.toFixed(2) : "",

            SYSDeb: isDebit ? sysValue.toFixed(2) : "",
            SYSCred: !isDebit ? sysValue.toFixed(2) : "",

            FCDebit: isDebit && isFC ? fcValue.toFixed(2) : "",
            FCCredit: !isDebit && isFC ? fcValue.toFixed(2) : "",
            TaxCode: taxLine.TaxAmtKey,
            ShortName: Account,
            FCCurrency: isFC ? parentFCCurrency : "0",

            isTaxLine: true,
            Rate: taxLine.Rate,
            VatRate: parentVatRate,

            MatType: parentMatType,
            Location: parentLocation,
            CenVatCom: parentGstCennvat,
          };

          // 🔹 Sync RHF
          Object.keys(newTaxRow).forEach((key) => {
            setValue(`${key}_${newTaxRow.id}`, newTaxRow[key]);
          });

          return newTaxRow;
        });

        const updatedRows = [
          ...filteredRows.slice(0, rowIndex + 1),
          ...newTaxRows,
          ...filteredRows.slice(rowIndex + 1),
        ];

        return reindexRows(updatedRows);
      });
    },
    [reindexRows, setValue, companyData]
  );

  const getSystemRate = () => {
    if (companyData?.MainCurncy === companyData?.SysCurrncy) {
      return 1;
    }
    return exchangeRateCache.current.systemRate || 0;
  };

  const onSelectTaxCode = useCallback(
    (TaxCode, Rate, oLines = []) => {
      const selectedId = getValues("selectedRowIndex");
      if (selectedId) {
        const systemRate = getSystemRate();

        setJERows((prev) =>
          prev.map((row) => {
            if (row.id === selectedId) {
              const updatedRow = {
                ...row,
                TaxCode,
                TaxRate: Rate,
                VatRate: Rate,
              };

              const credit = parseFloat(updatedRow.Credit) || 0;
              const debit = parseFloat(updatedRow.Debit) || 0;
              const baseAmount = credit !== 0 ? credit : debit;

              if (baseAmount > 0) {
                const VatAmount = (baseAmount * Rate) / 100;
                const SYSVatSum =
                  systemRate && systemRate !== 0
                    ? VatAmount / systemRate
                    : VatAmount;

                const grossValue = baseAmount + VatAmount;

                updatedRow.VatAmount = VatAmount.toFixed(2);
                updatedRow.SYSVatSum = SYSVatSum.toFixed(2);
                updatedRow.GrossValue = grossValue.toFixed(2);
              }
              //****************for FC Gross value */
              const fcDebit = parseFloat(updatedRow.FCDebit) || 0;
              const fcCredit = parseFloat(updatedRow.FCCredit) || 0;
              const baseFC = fcCredit !== 0 ? fcCredit : fcDebit;

              if (baseFC > 0) {
                updatedRow.GrossValFC = (
                  baseFC +
                  (baseFC * Rate) / 100
                ).toFixed(2);
              } else {
                updatedRow.GrossValFC = "";
              }

              setValue(`GrossValFC_${selectedId}`, updatedRow.GrossValFC);
              setValue(`TaxCode_${selectedId}`, TaxCode);
              setValue(`TaxRate_${selectedId}`, Rate);
              setValue(`VatRate_${selectedId}`, Rate);
              setValue(`VatAmount_${selectedId}`, updatedRow.VatAmount);
              setValue(`SYSVatSum_${selectedId}`, updatedRow.SYSVatSum);
              setValue(`GrossValue_${selectedId}`, updatedRow.GrossValue);

              return updatedRow;
            }
            return row;
          })
        );

        // 🔥 FIXED CALL
        addTaxLines(
          selectedId,
          oLines,
          getParentLineTotal(selectedId),
          TaxCode,
          Rate,
          systemRate,
          getValues(`ShortNameCurr_${selectedId}`), // currency
          getValues(`RateLCtoFC_${selectedId}`) // LC → FC rate
        );
      }

      CloseTaxCodeModel();
    },
    [getValues, addTaxLines, getParentLineTotal, setValue]
  );

  const handleAccDeleteRow = useCallback(
    (id) => {
      setJERows((prev) =>
        reindexRows(
          prev.filter((row) => row.id !== id && row.ParentRowId !== id)
        )
      );
    },
    [reindexRows]
  );

  const addRow = useCallback(() => {
    setJERows((prev) => {
      const currentLocation = getValues("Location");
      const newRow = {
        id: Date.now(),
        ShortName: "",
        Name: "",
        Account: "",
        Debit: "",
        Credit: "",
        TaxCode: "",
        VatAmount: "",
        SYSVatSum: "",
        GrossValue: "",
        ContraAct: "",
        BalanceDueLC: "",
        BalanceDueFC: "",
        MatType: "",
        Location: currentLocation || "",
        CenVatCom: "",
      };
      // Set RHF values for new row
      Object.keys(newRow).forEach((key) => {
        setValue(`${key}_${newRow.id}`, newRow[key]);
      });
      return reindexRows([...prev, newRow]);
    });
  }, [getValues, reindexRows, setValue]);

  const { DocSeries } = useDocumentSeries(
    "30",
    getValues("RefDate"),
    setValue,
    clearCache,
    SaveUpdateName
  );
  const CurrencyData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/CurrenciesV2/all`);
      setOrignCurrData(res.data.values);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch OrignCurr data.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const LocationData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/WHSLocation/all`);
      setLocationData(res.data.values);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch Location data.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const FetchTaxType = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/TaxType/All`);
      const filteredResponse = response.data.values.filter(
        (item) => item.Status === "1"
      );
      setTaxTypeData(filteredResponse);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Failed to fetch Tax Types!",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const setJournalEntryDataList = useCallback(
    async (docEntry) => {
      if (!docEntry) {
        return;
      }
      try {
        setLoading(true);
        const response = await apiClient.get(`/JournalEntry/${docEntry}`);
        const data = response.data.values;

        toggleDrawer();
        reset(data);

        setValue("TransId", data.DocNum);
        setValue("DocNum", data.DocNum);
        const enrichedRows = data.oLines.map((row, index) => ({
          ...row,
          id: `${row.DocEntry}-${row.LineNum}`,
          SrNo: index + 1,
        }));
        if (data.TransType) {
          const matchedObjType = ObjType.find(
            (menu) => menu.TransId === data.TransType
          );

          if (matchedObjType) {
            setValue("TransType", matchedObjType.TranName);
          } else {
            // fallback if not matched
            setValue("TransType", data.TransType);
          }
        }
        setJERows(enrichedRows);
        setSaveUpdateName("UPDATE");
        setSelectedData(docEntry);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "An error occurred while fetching the data.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      } finally {
        setLoading(false);
      }
    },
    [reset, setValue, ObjType]
  );

  const setOldOpenData = useCallback(
    async (docEntry) => {
      if (isDirty) {
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
          setJournalEntryDataList(docEntry);
        });
      } else {
        setJournalEntryDataList(docEntry);
      }
    },
    [isDirty, setJournalEntryDataList]
  );

  // Effects
  useEffect(() => {
    if (watchAutoTax === "N") {
      setJERows((prevRows) => {
        let clearedParentIds = new Set();
        const updatedRows = prevRows
          .map((row) => {
            if (!row.ParentRowId) {
              if (row.TaxCode) {
                clearedParentIds.add(row.id);
                setValue(`TaxCode_${row.id}`, "");
                setValue(`TaxRate_${row.id}`, "");
                setValue(`VatAmount_${row.id}`, "");
                setValue(`GrossValue_${row.id}`, "");
                return {
                  ...row,
                  TaxCode: "",
                  TaxRate: "",
                  VatAmount: "",
                  GrossValue: "",
                };
              }
            }
            return row;
          })
          .filter((row) => {
            if (row.ParentRowId && clearedParentIds.has(row.ParentRowId)) {
              return false;
            }
            return true;
          });
        return reindexRows(updatedRows);
      });
    }
  }, [watchAutoTax, reindexRows, setValue]);

  useEffect(() => {
    LocationData();
    fetchAccountGetListData(0); // Initial fetch for ChartOfAccounts
    CurrencyData();
    FetchTaxType();
    ObjectTypeList();
  }, []);

  // useEffect(() => {
  //   if (FixExchRate === "Y") {
  //     const currentOrignCurr = getValues("OrignCurr");
  //     const currentTransRate = getValues("TransRate");

  //     if (currentOrignCurr || currentTransRate) {
  //       setValue("OrignCurr", "");
  //       setValue("TransRate", "", { shouldDirty: true });
  //     }
  //   }
  // }, [FixExchRate, getValues, setValue]);

  // DataGrid Columns
  const Acclist = [
    { field: "AcctCode", headerName: "Account Code", width: 150 },
    { field: "AcctName", headerName: "Account Name", width: 300 },
    { field: "ActCurr", headerName: "Currency", width: 120 },
  ];

  const handleSaveManualRate = async () => {
    if (!manualRate || isNaN(Number(manualRate))) {
      Swal.fire("Validation Error", "Please enter a valid rate.", "warning");
      return;
    }

    setIsSavingManualRate(true);

    try {
      setLoading(true);

      const payload = [
        {
          DocEntry: String(exchangeRateModalData.DocEntry || ""),
          UserId: user.UserId,
          CreatedBy: user.UserName || "",
          CreatedDate: dayjs().format("YYYY/MM/DD"),
          ModifiedBy: user.UserName || "",
          ModifiedDate: dayjs().format("YYYY/MM/DD"),
          Status: "1",
          RateDate: dayjs(exchangeRateModalData.RateDate).format("YYYY/MM/DD"),
          Currency: exchangeRateModalData.Currency,
          Rate: String(manualRate),
        },
      ];

      const res = await apiClient.post(
        `/ExchangeRatesandIndexes/Bulk`,
        payload
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Save failed");
      }

      // ✅ SUCCESS
      Swal.fire({
        icon: "success",
        title: "Exchange rate saved",
        timer: 1000,
        showConfirmButton: false,
      });

      // ---------------------------------
      // 🔁 IMPORTANT PART
      // ---------------------------------

      const currency = exchangeRateModalData.Currency;

      // 1️⃣ Clear cache for this currency
      if (currency === companyData?.SysCurrncy) {
        exchangeRateCache.current.systemRate = null;
      } else {
        delete exchangeRateCache.current.fcRates[currency];
      }

      setExchangeRateModalOpen(false);

      // 2️⃣ Re-trigger calculation automatically
      const pending = pendingRecalcRef.current;

      if (pending?.rowId && pending?.field) {
        // small delay so modal fully closes
        setTimeout(() => {
          handleDebitCreditBlur(pending.rowId, pending.field);
          pendingRecalcRef.current = null;
        }, 0);
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to save rate", "error");
    } finally {
      setIsSavingManualRate(false);
      setLoading(false);
    }
  };

  const exchangeRateCache = useRef({
    systemRate: null, // LC → SC rate
    fcRates: {}, // { "USD": 83.42, "EUR": 90.12 }
  });

  // const calculateACRowFCBalanceFromOtherRows = (currentRowId, isDebit) => {
  //   let totalDebit = 0;
  //   let totalCredit = 0;
  //   let fcCurrency = null;

  //   JERows.forEach((row) => {
  //     if (row.id === currentRowId) return;

  //     totalDebit += Number(row.FCDebit) || 0;
  //     totalCredit += Number(row.FCCredit) || 0;

  //     if (
  //       !fcCurrency &&
  //       row.BPGLCurrency &&
  //       row.BPGLCurrency !== "AC" &&
  //       row.BPGLCurrency !== companyData.MainCurncy &&
  //       row.BPGLCurrency !== companyData.SysCurrncy
  //     ) {
  //       fcCurrency = row.BPGLCurrency;
  //     }
  //   });

  //   // 🔴 CRITICAL SAP RULE
  //   const isFCBalanced = round2(totalDebit) === round2(totalCredit);

  //   // ✅ If FC is already balanced → DO NOTHING
  //   if (isFCBalanced) {
  //     return { currency: null, value: 0 };
  //   }

  //   const diff = totalDebit - totalCredit;

  //   return {
  //     currency: fcCurrency,
  //     value: isDebit
  //       ? Math.abs(Math.min(diff, 0)) // need Debit
  //       : Math.abs(Math.max(diff, 0)), // need Credit
  //   };
  // };
  const calculateACRowFCBalanceFromOtherRows = (
    currentRowId,
    isDebit,
    includeCurrentRow = false
  ) => {
    let totalDebit = 0;
    let totalCredit = 0;
    let fcCurrency = null;

    JERows.forEach((row) => {
      if (!includeCurrentRow && row.id === currentRowId) return;

      totalDebit += Number(row.FCDebit) || 0;
      totalCredit += Number(row.FCCredit) || 0;

      // ===============================
      // 1️⃣ PRIORITY: AC row with FC value
      // ===============================
      const hasFCValue =
        (Number(row.FCDebit) || 0) !== 0 || (Number(row.FCCredit) || 0) !== 0;

      if (
        !fcCurrency &&
        row.BPGLCurrency === "AC" &&
        hasFCValue &&
        row.FCCurrency
      ) {
        fcCurrency = row.FCCurrency;
        return;
      }

      // ===============================
      // 2️⃣ Non-AC foreign currency row
      // ===============================
      if (
        !fcCurrency &&
        row.BPGLCurrency &&
        row.BPGLCurrency !== "AC" &&
        row.BPGLCurrency !== companyData.MainCurncy &&
        row.BPGLCurrency !== companyData.SysCurrncy
      ) {
        fcCurrency = row.BPGLCurrency;
      }
    });

    const diff = round2(totalDebit - totalCredit);
    const isFCBalanced = diff === 0;

    return {
      currency: fcCurrency,
      value: isFCBalanced
        ? 0
        : isDebit
        ? Math.abs(Math.min(diff, 0))
        : Math.abs(Math.max(diff, 0)),
      isFCBalanced,
    };
  };

  const pendingRecalcRef = useRef(null);
  // { rowId, field }
  const currentRowIdRef = useRef(null);
  const currentFieldRef = useRef(null);

  const fetchExchangeRate = useCallback(
    async (date, currency) => {
      if (!date || !currency) {
        Swal.fire({
          icon: "warning",
          title: "Missing Data",
          text: "Date or Currency is missing to get Exchange Rate!",
          confirmButtonText: "OK",
        });
        return null;
      }

      // ------------------------------------------
      // 🟢 1. CHECK SYSTEM CURRENCY CACHE
      // ------------------------------------------
      if (currency === companyData?.SysCurrncy) {
        if (exchangeRateCache.current.systemRate) {
          return exchangeRateCache.current.systemRate; // return cached system rate
        }
      }

      // ------------------------------------------
      // 🟢 2. CHECK FC CACHE
      // ------------------------------------------
      if (
        currency !== companyData?.MainCurncy &&
        currency !== companyData?.SysCurrncy &&
        exchangeRateCache.current.fcRates[currency]
      ) {
        return exchangeRateCache.current.fcRates[currency]; // return cached FC rate
      }

      try {
        setLoading(true);

        const APIdate = dayjs(date).format("MM/DD/YYYY");

        const res = await apiClient.get(
          `/ExchangeRatesandIndexes/GetCurrOnDate?RateDate=${APIdate}&Currency=${currency}`
        );

        if (!res.data.success || !res.data.values?.length) {
          setExchangeRateModalData({ RateDate: date, Currency: currency });
          setManualRate("");
          setExchangeRateModalOpen(true);
          return null;
        }

        const rate = res.data.values[0].Rate;

        if (
          !res.data.success ||
          !res.data.values?.length ||
          !rate ||
          rate === 0
        ) {
          setExchangeRateModalData({ RateDate: date, Currency: currency });

          // 🔴 store pending calculation context
          pendingRecalcRef.current = {
            rowId: currentRowIdRef.current,
            field: currentFieldRef.current,
          };

          setManualRate("");
          setExchangeRateModalOpen(true);
          return null;
        }

        // ------------------------------------------
        // 🟢 SAVE INTO CACHE BEFORE RETURNING
        // ------------------------------------------
        if (currency === companyData?.SysCurrncy) {
          exchangeRateCache.current.systemRate = rate;
        } else {
          exchangeRateCache.current.fcRates[currency] = rate;
        }

        return rate;
      } catch (err) {
        Swal.fire(
          "Error",
          err.message || "Failed to fetch exchange rate!",
          "error"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, companyData]
  );
  const updateBalanceDue = (
    row,
    shortNameCurr,
    localCurrency,
    systemCurrency
  ) => {
    const debit = Number(row.Debit) || 0;
    const credit = Number(row.Credit) || 0;
    const fcDebit = Number(row.FCDebit) || 0;
    const fcCredit = Number(row.FCCredit) || 0;
    const sysDebit = Number(row.SYSDeb) || 0;
    const sysCredit = Number(row.SYSCred) || 0;

    let BalDueDeb = "";
    let BalDueCred = "";
    let BalFcDeb = "";
    let BalFcCred = "";

    // ---------- LC Balance ----------
    if (debit > 0) BalDueDeb = debit.toFixed(2);
    if (credit > 0) BalDueCred = credit.toFixed(2);

    // ---------- FC / SC Balance ----------
    const isFC =
      shortNameCurr !== localCurrency &&
      shortNameCurr !== systemCurrency &&
      shortNameCurr !== "AC";

    if (isFC) {
      if (fcDebit > 0) BalFcDeb = fcDebit.toFixed(2);
      if (fcCredit > 0) BalFcCred = fcCredit.toFixed(2);
    } else {
      if (sysDebit > 0) BalFcDeb = sysDebit.toFixed(2);
      if (sysCredit > 0) BalFcCred = sysCredit.toFixed(2);
    }

    return {
      ...row,
      BalDueDeb,
      BalDueCred,
      BalFcDeb,
      BalFcCred,
    };
  };
  // const focusValueRef = useRef({
  //   rowId: null,
  //   field: null,
  //   value: null,
  // });
  // const getFieldValue = (rowId, field) => {
  //   return Number(getValues(`${field}_${rowId}`)) || 0;
  // };

  // Add this helper function near the top, after other helpers
  const isEmpty = (val) => val === "" || val === null || val === undefined;
const sapCaseRef = useRef(null);

  // Add this function after the helpers
  const fillEmptyFields = (rowId) => {
    // LC
    console.log("test");
    const totalsLC = getJETotals(rowId);
    const diffLC = totalsLC.lcDebit - totalsLC.lcCredit;
    if (diffLC > 0 && isEmpty(getValues(`Credit_${rowId}`))) {
      const val = diffLC.toFixed(2);
      setValue(`Credit_${rowId}`, val);
      handleCellChange(rowId, "Credit", val);
    } else if (diffLC < 0 && isEmpty(getValues(`Debit_${rowId}`))) {
      const val = Math.abs(diffLC).toFixed(2);
      setValue(`Debit_${rowId}`, val);
      handleCellChange(rowId, "Debit", val);
    }

    // FC
    const {
      currency: fcCurrency,
      value: fcValueDebit,
      isFCBalanced,
    } = calculateACRowFCBalanceFromOtherRows(rowId, true); // for debit
    const { value: fcValueCredit } = calculateACRowFCBalanceFromOtherRows(
      rowId,
      false
    ); // for credit
    if (!isFCBalanced && fcCurrency) {
      if (isEmpty(getValues(`FCDebit_${rowId}`)) && fcValueDebit > 0) {
        setValue(`FCDebit_${rowId}`, fcValueDebit.toFixed(2));
        handleCellChange(rowId, "FCDebit", fcValueDebit.toFixed(2));
        if (isEmpty(getValues(`FCCurrency_${rowId}`))) {
          setValue(`FCCurrency_${rowId}`, fcCurrency);
          handleCellChange(rowId, "FCCurrency", fcCurrency);
        }
      }
      if (isEmpty(getValues(`FCCredit_${rowId}`)) && fcValueCredit > 0) {
        setValue(`FCCredit_${rowId}`, fcValueCredit.toFixed(2));
        handleCellChange(rowId, "FCCredit", fcValueCredit.toFixed(2));
        if (isEmpty(getValues(`FCCurrency_${rowId}`))) {
          setValue(`FCCurrency_${rowId}`, fcCurrency);
          handleCellChange(rowId, "FCCurrency", fcCurrency);
        }
      }
    }

    // SC
    const diffSC = totalsLC.scDebit - totalsLC.scCredit;
    if (diffSC > 0 && isEmpty(getValues(`SYSCred_${rowId}`))) {
      const val = diffSC.toFixed(2);
      setValue(`SYSCred_${rowId}`, val);
      handleCellChange(rowId, "SYSCred", val);
    } else if (diffSC < 0 && isEmpty(getValues(`SYSDeb_${rowId}`))) {
      const val = Math.abs(diffSC).toFixed(2);
      setValue(`SYSDeb_${rowId}`, val);
      handleCellChange(rowId, "SYSDeb", val);
    }
  };
  // -------------------------
  // Helper to check empty
  // -------------------------
  const isEmptyAmount = (val) =>
    val === "" || val === null || val === undefined;
  const round2 = (n) => Math.round(n * 100) / 100;
  const isEmptyOrZero = (val) =>
    val === "" || val === null || val === undefined || round2(val) === 0;
  const isBalanced = (debit, credit) => {
    if (isEmptyOrZero(debit) || isEmptyOrZero(credit)) return true; // 0 or empty → imbalanced
    return round2(debit) === round2(credit);
  };

  const isImbalanced = (debit, credit) => round2(debit) !== round2(credit);

  // -------------------------
  // Get JE totals, optionally excluding a row
  // -------------------------
  const getJETotalsExcludingRow = (excludeRowId) => {
    return getJETotals(excludeRowId);
  };
  const getJETotalsIncludingRow = () => {
    return getJETotals(null); // null = include all rows
  };

  const getJETotals = (excludeRowId = null) => {
    let lcDebit = null,
      lcCredit = null,
      fcDebit = null,
      fcCredit = null,
      scDebit = null,
      scCredit = null;
    // debugger;
    JERows.forEach((row) => {
      // ✅ HARD exclusion (string-safe)
      if (excludeRowId != null && String(row.id) === String(excludeRowId)) {
        return;
      }

      // ✅ ALWAYS read live form values
      lcDebit += Number(getValues(`Debit_${row.id}`)) ;
      lcCredit += Number(getValues(`Credit_${row.id}`)) ;
      fcDebit += Number(getValues(`FCDebit_${row.id}`)) ;
      fcCredit += Number(getValues(`FCCredit_${row.id}`)) ;
      scDebit += Number(getValues(`SYSDeb_${row.id}`)) ;
      scCredit += Number(getValues(`SYSCred_${row.id}`)) ;
    });

    return {
      lcDebit,
      lcCredit,
      fcDebit,
      fcCredit,
      scDebit,
      scCredit,
    };
  };

  // -------------------------
  const detectSAPCaseFromJE = (rowId, includeCurrentRow = false) => {
              debugger; 
   
    const totals = includeCurrentRow
      ? getJETotalsIncludingRow()
      : getJETotalsExcludingRow(rowId);

    const lcImbalanced = !isBalanced(totals.lcDebit, totals.lcCredit);
    const fcImbalanced = !isBalanced(totals.fcDebit, totals.fcCredit);
    const scImbalanced = !isBalanced(totals.scDebit, totals.scCredit);

    if (lcImbalanced && fcImbalanced && scImbalanced) return 1;
    if (lcImbalanced && !fcImbalanced && !scImbalanced) return 2;
    if (!lcImbalanced && fcImbalanced && !scImbalanced) return 3;
    if (!lcImbalanced && fcImbalanced && scImbalanced) return 4;
    if (lcImbalanced && !fcImbalanced && scImbalanced) return 5;

    return null;
  };

  const handleDebitCreditBlur = useCallback(
    async (rowId, field) => {
      currentRowIdRef.current = rowId;
      currentFieldRef.current = field;

      try {
        const refDate = getValues("RefDate");
        const shortNameCurr = getValues(`BPGLCurrency_${rowId}`);

        // ✅ READ SELECTED FC CURRENCY FOR AC ROW
        const selectedFCCurrency =
          shortNameCurr === "AC" ? getValues(`FCCurrency_${rowId}`) : null;

        let debit = Number(getValues(`Debit_${rowId}`)) || 0;
        let credit = Number(getValues(`Credit_${rowId}`)) || 0;
        let fcDebit = Number(getValues(`FCDebit_${rowId}`)) || 0;
        let fcCredit = Number(getValues(`FCCredit_${rowId}`)) || 0;
        let sysDebit = Number(getValues(`SYSDeb_${rowId}`)) || 0;
        let sysCredit = Number(getValues(`SYSCred_${rowId}`)) || 0;

        const localCurrency = companyData?.MainCurncy;
        const systemCurrency = companyData?.SysCurrncy;
        if (!shortNameCurr || !localCurrency || !systemCurrency) {
          console.warn("Missing currency data for row:", rowId);
          return;
        }

        const round = (num) => Math.round(num * 100) / 100;

        // Fetch exchange rates
        // --- SYSTEM CURRENCY RATE ---
        let rateLCtoSC = 1;

        if (systemCurrency !== localCurrency) {
          // Check cache first
          rateLCtoSC = exchangeRateCache.current.systemRate;

          // If not in cache -> fetch
          if (!rateLCtoSC) {
            rateLCtoSC = await fetchExchangeRate(refDate, systemCurrency);

            // Save into cache
            exchangeRateCache.current.systemRate = rateLCtoSC;
          }
        }

        // --- FOREIGN CURRENCY RATE ---
        let rateLCtoFC = 1;
        let rateFCtoLC = 1;

        const effectiveFCCurrency =
          shortNameCurr === "AC" ? selectedFCCurrency : shortNameCurr;

        const isFCEqualLC =
          shortNameCurr === "AC" && effectiveFCCurrency === localCurrency;

        const isFC =
          effectiveFCCurrency &&
          effectiveFCCurrency !== localCurrency &&
          effectiveFCCurrency !== systemCurrency;

        // 🟢 CASE 1: AC + FC currency = Local Currency → rate = 1
        if (isFCEqualLC) {
          rateLCtoFC = 1;
          rateFCtoLC = 1;
        }

        // 🟢 CASE 2: Real FC (USD, EUR, etc.)
        else if (isFC) {
          rateLCtoFC = exchangeRateCache.current.fcRates[effectiveFCCurrency];

          if (!rateLCtoFC) {
            rateLCtoFC = await fetchExchangeRate(refDate, effectiveFCCurrency);
            if (rateLCtoFC === null) return;

            exchangeRateCache.current.fcRates[effectiveFCCurrency] = rateLCtoFC;
          }

          // ✅ FIXED: FC-to-LC rate is the inverse of LC-to-FC rate
          rateFCtoLC = 1 / rateLCtoFC;
        }

        const updateAndSync = (id, fld, val) => {
          const currentVal = Number(getValues(`${fld}_${id}`)) || 0;
          if (round(currentVal) !== round(val)) {
            setValue(`${fld}_${id}`, val.toFixed(2));
            handleCellChange(id, fld, val.toFixed(2));
          }
        };

        // -------------------------
        // LC Account logic (ShortName Currency = LC or "AC")
        // -------------------------
        if (shortNameCurr === localCurrency) {
          if (field === "Debit" || field === "Credit") {
            const isDebit = field === "Debit";
            const value = isDebit ? debit : credit; // LC value

            // Calculate SC from LC
            const newSC = value / rateLCtoSC;
            updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
            // FC not applicable for LC accounts
            updateAndSync(rowId, isDebit ? "FCDebit" : "FCCredit", 0);
          }
        } 
        else if (shortNameCurr === "AC") {

          let fcCurr = getValues(`FCCurrency_${rowId}`);
          if (!fcCurr) {
            fcCurr =
              exchangeRateCache.current.lastUsedFCCurrency ||
              // companyData.DefaultFCCurrency ||
              null;
            if (fcCurr) {
              setValue(`FCCurrency_${rowId}`, fcCurr);
              handleCellChange(rowId, "FCCurrency", fcCurr);
            }
          }

          const isLCInput = field === "Debit" || field === "Credit";
          const isFCInput = field === "FCDebit" || field === "FCCredit";
          const isDebit = field === "Debit" || field === "FCDebit";

          // const lcVal = isLCInput ? debit : credit;
          const lcVal =
            field === "Debit" ? debit : field === "Credit" ? credit : 0;
          const fcVal =
            field === "FCDebit" ? fcDebit : field === "FCCredit" ? fcCredit : 0;

          const effectiveRateLCtoFC = fcCurr === localCurrency ? 1 : rateLCtoFC;
          const effectiveRateFCtoLC = effectiveRateLCtoFC; // ✅ SAME RATE
          const effectiveRateLCtoSC = rateLCtoSC;

const sapCase =
  sapCaseRef.current ?? detectSAPCaseFromJE(rowId, false);
const allBalanced = sapCase === null;

          // --- Detect SAP case ---
          const currentVal =
            field === "FCDebit"
              ? Number(getValues(`FCDebit_${rowId}`)) || 0
              : field === "FCCredit"
              ? Number(getValues(`FCCredit_${rowId}`)) || 0
              : field === "Debit"
              ? Number(getValues(`Debit_${rowId}`)) || 0
              : Number(getValues(`Credit_${rowId}`)) || 0;

          const hasFCCurrency = !!fcCurr;

          // -----------------------
          // LC INPUT → drives FC & SC (only if target empty)
          // -----------------------
          if (allBalanced) {
            const fcDebitVal = getValues(`FCDebit_${rowId}`);
            const fcCreditVal = getValues(`FCCredit_${rowId}`);
            const scDebitVal = getValues(`SYSDeb_${rowId}`);
            const scCreditVal = getValues(`SYSCred_${rowId}`);

            const isFCDebitEmpty = isEmptyAmount(fcDebitVal);
            const isFCCreditEmpty = isEmptyAmount(fcCreditVal);
            const isSCDebitEmpty = isEmptyAmount(scDebitVal);
            const isSCCreditEmpty = isEmptyAmount(scCreditVal);

            // ===============================
            //  LC INPUT (Debit / Credit)
            // LC → SC ONLY
            // ===============================
            if (isLCInput && !isEmptyAmount(lcVal)) {
              const newSC = lcVal / effectiveRateLCtoSC;

              if (isDebit) {
                // ✅ Debit case
                const shouldUpdateSC =
                  isFCDebitEmpty && (isSCDebitEmpty || !isSCDebitEmpty);

                if (shouldUpdateSC) {
                  updateAndSync(rowId, "SYSDeb", newSC);
                }
              } else {
                // ✅ Credit case
                const shouldUpdateSC =
                  isFCCreditEmpty && (isSCCreditEmpty || !isSCCreditEmpty);

                if (shouldUpdateSC) {
                  updateAndSync(rowId, "SYSCred", newSC);
                }
              }
              return;
            }

            // ===============================
            // FC INPUT (Debit(FC) / Credit(FC))
            // FC → LC + SC (ALWAYS)
            // ===============================
            if (isFCInput && !isEmptyAmount(fcVal)) {
              console.log("onchange");

              const newLC = fcVal * effectiveRateFCtoLC;
              const newSC = newLC / effectiveRateLCtoSC;

              if (isDebit) {
                // ✅ Debit (FC) change → update LC + SC
                updateAndSync(rowId, "Debit", newLC);
                updateAndSync(rowId, "SYSDeb", newSC);
              } else {
                // ✅ Credit (FC) change → update LC + SC
                updateAndSync(rowId, "Credit", newLC);
                updateAndSync(rowId, "SYSCred", newSC);
              }

              return;
            }
          } else {
            // console.log("")
            console.log("sapCase", sapCase);
            if (isLCInput && !isEmptyAmount(lcVal)) {
              const newFC = hasFCCurrency ? lcVal / effectiveRateLCtoFC : null;
              const newLC = currentVal * effectiveRateFCtoLC;

              const newSC = lcVal / effectiveRateLCtoSC;
              const isFCEmpty =
                getValues(`FCDebit_${rowId}`) === "" &&
                getValues(`FCCredit_${rowId}`) === "";
              const isSCEmpty =
                getValues(`SYSDeb_${rowId}`) === "" &&
                getValues(`SYSCred_${rowId}`) === "";

              switch (sapCase) {
                case 1: // all empty → calculate all
                  if (hasFCCurrency && isFCEmpty && isSCEmpty)
                    updateAndSync(
                      rowId,
                      isDebit ? "FCDebit" : "FCCredit",
                      newFC
                    );
                  if (isSCEmpty)
                    updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  if (isFCEmpty && !isSCEmpty && isFCEmpty)
                    updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  break;

                case 2: // LC imbalanced, FC & SC equal → calculate FC only
                  if (hasFCCurrency && isFCEmpty && isSCEmpty)
                    updateAndSync(
                      rowId,
                      isDebit ? "FCDebit" : "FCCredit",
                      newFC
                    );
                  // if (isSCEmpty)
                  //   updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  // if (isFCEmpty && !isSCEmpty && isFCEmpty)
                  //   updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);

                  break;

                case 3: // LC balanced, FC imbalanced, SC balanced → calculate FC only
                  if (hasFCCurrency && isFCEmpty && isSCEmpty)
                    updateAndSync(
                      rowId,
                      isDebit ? "FCDebit" : "FCCredit",
                      newFC
                    );
                  break;

                case 4: // LC balanced, FC imbalanced, SC imbalanced → calculate FC & SC
                  if (hasFCCurrency && isFCEmpty && isSCEmpty)
                    updateAndSync(
                      rowId,
                      isDebit ? "FCDebit" : "FCCredit",
                      newFC
                    );
                  if (isSCEmpty)
                    updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  if (isFCEmpty && !isSCEmpty && isFCEmpty)
                    updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  break;
                case 5:
                  updateAndSync(rowId, isDebit ? "Debit" : "Credit", newLC);
                  updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  break;
                default:
                  break;
              }

              return;
            }
            // -----------------------
            // FC INPUT → drives LC & SC (always, no empty check)
            // -----------------------
            if (isFCInput && !isEmptyAmount(fcVal)) {
              console.log("sapCase", sapCase);
              const newLC = currentVal * effectiveRateFCtoLC;
              const newSC = newLC / effectiveRateLCtoSC;

              switch (sapCase) {
                case 1: // all empty → calculate LC & SC
                  updateAndSync(rowId, isDebit ? "Debit" : "Credit", newLC);
                  updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  break;
                case 2: // all empty → calculate LC & SC
                  updateAndSync(rowId, isDebit ? "Debit" : "Credit", newLC);
                  // updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  break;
                case 3: // LC balanced, FC imbalanced, SC balanced → calculate LC & SC
                  // updateAndSync(rowId, isDebit ? "Debit" : "Credit", newLC);
                  // updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  break;

                case 4: // LC balanced, FC imbalanced, SC imbalanced → calculate SC only
                  updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  break;
                case 5:
                  updateAndSync(rowId, isDebit ? "Debit" : "Credit", newLC);
                  updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                  break;
                default:
                  break;
              }

              return;
            }
          }
        }

        // -------------------------
        // SC Account logic (ShortName Currency = SC)
        // -------------------------
      else if (shortNameCurr === systemCurrency) {
              debugger; 

  // ---------- LC CHANGE ----------
  if (field === "Debit" || field === "Credit") {
    const isDebit = field === "Debit";
    const value = isDebit ? debit : credit;

    const fcField = isDebit ? "FCDebit" : "FCCredit";
    const scField = isDebit ? "SYSDeb" : "SYSCred";

    const fcVal = isDebit ? fcDebit : fcCredit;
    const scVal = isDebit ? sysDebit : sysCredit;

    // 1️⃣ FC empty & SC empty → populate BOTH
    if (isEmptyOrZero(fcVal) && isEmptyOrZero(scVal)) {
      const newSC = value / rateLCtoSC;

      updateAndSync(rowId, scField, newSC);
      updateAndSync(rowId, fcField, newSC);
    }
    // 2️⃣ FC empty & SC exists → populate FC only
    else if (isEmptyOrZero(fcVal) && !isEmptyOrZero(scVal)) {
      updateAndSync(rowId, fcField, scVal);
    }
    // 3️⃣ FC exists → do nothing (SAP rule)
  }

  // ---------- FC CHANGE ----------
  else if (field === "FCDebit" || field === "FCCredit") {
    const isDebit = field === "FCDebit";
    const value = isDebit ? fcDebit : fcCredit;

    const lcField = isDebit ? "Debit" : "Credit";
    const scField = isDebit ? "SYSDeb" : "SYSCred";

    // 4️⃣ FC → SC (same numeric value)
    updateAndSync(rowId, scField, value);

    // 5️⃣ FC → LC (convert from SC)
    const newLC = value * rateLCtoSC;
    updateAndSync(rowId, lcField, newLC);
  }
}

        // -------------------------
        // FC Account logic (ShortName Currency = FC, not LC/SC/AC)
        // -------------------------
        else {
          const isLCInput = field === "Debit" || field === "Credit";
          const isFCInput = field === "FCDebit" || field === "FCCredit";
          const isDebit = field === "Debit" || field === "FCDebit";

          const currentVal = Number(getValues(`${field}_${rowId}`)) || 0;

          // const lcVal = Number(getValues(`Debit_${rowId}`)) || 0;
          // const fcVal = Number(getValues(`FCDebit_${rowId}`)) || 0;
          // const scVal = Number(getValues(`SYSDeb_${rowId}`)) || 0;

const sapCase =
  sapCaseRef.current ?? detectSAPCaseFromJE(rowId, false);
          console.log("sapCase", sapCase);

          // ================================
          // 🟢 FC INPUT → drives LC / SC
          // ================================
          if (isFCInput && !isEmptyAmount(currentVal)) {
            const newLC = currentVal * rateFCtoLC;
            const newSC = newLC / rateLCtoSC;
            console.log("sacase", sapCase);
            switch (sapCase) {
              case 1: // all not equal
                updateAndSync(rowId, isDebit ? "Debit" : "Credit", newLC);
                updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                break;

              case 3: // LC equal, FC pending, SC equal
                // ❗ ONLY FC pending → do NOT touch LC or SC
                break;

              case 4: // LC equal, FC pending, SC pending
                updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                break;
              case 5:
                // ✅ LC imbalanced, FC & SC already balanced → DO NOTHING
                break;

              default:
                break;
            }
            return;
          }

          // ================================
          // 🟡 LC INPUT → drives FC / SC
          // ================================
          if (isLCInput && !isEmptyAmount(currentVal)) {
            const newFC = currentVal / rateLCtoFC;
            const newSC = currentVal / rateLCtoSC;
            const isFCEmpty =
              getValues(`FCDebit_${rowId}`) === "" &&
              getValues(`FCCredit_${rowId}`) === "";

            const isSCEmpty =
              getValues(`SYSDeb_${rowId}`) === "" &&
              getValues(`SYSCred_${rowId}`) === "";

            switch (sapCase) {
              case 1: // all not equal
                if (isFCEmpty)
                  updateAndSync(rowId, isDebit ? "FCDebit" : "FCCredit", newFC);
                if (isSCEmpty)
                  updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                break;

              case 2: // LC not equal, FC & SC equal
                updateAndSync(rowId, isDebit ? "FCDebit" : "FCCredit", newFC);
                break;

              case 3: // LC equal, FC pending, SC equal
                updateAndSync(rowId, isDebit ? "FCDebit" : "FCCredit", newFC);
                break;

              case 4: // LC equal, FC pending, SC pending
                updateAndSync(rowId, isDebit ? "FCDebit" : "FCCredit", newFC);
                updateAndSync(rowId, isDebit ? "SYSDeb" : "SYSCred", newSC);
                break;
              default:
                break;
            }
            return;
          }
        }

        // 🔁 Recalculate TAX when Debit/Credit changes
        if (field === "Debit" || field === "Credit") {
          setJERows((prevRows) =>
            prevRows.map((row) => {
              if (row.id !== rowId || row.isTaxLine) return row;

              if (!row.TaxCode || !row.TaxRate) return row;

              const updatedRow = recalcParentTax(row, rateLCtoSC);

              // Sync RHF values
              setValue(`VatAmount_${rowId}`, updatedRow.VatAmount);
              setValue(`SYSVatSum_${rowId}`, updatedRow.SYSVatSum);
              setValue(`GrossValue_${rowId}`, updatedRow.GrossValue);

              return updatedRow;
            })
          );
        }
        setJERows((prevRows) =>
          prevRows.map((row) => {
            if (row.id !== rowId) return row;

            return updateBalanceDue(
              row,
              shortNameCurr,
              localCurrency,
              systemCurrency
            );
          })
        );
      } catch (error) {
        console.error("💥 Debit/Credit blur calc error:", error);
        Swal.fire(
          "Error",
          error.message || "Failed to calculate currency values!",
          "error"
        );
      }

      console.log(`--- handleDebitCreditBlur finished for row ${rowId} ---`);
    },
    [getValues, handleCellChange, companyData, fetchExchangeRate, setValue]
  );

  const recalcParentTax = useCallback((row, systemRate) => {
    if (!row.TaxCode || !row.TaxRate) return row;

    const debit = parseFloat(row.Debit) || 0;
    const credit = parseFloat(row.Credit) || 0;
    const baseAmount = credit !== 0 ? credit : debit;

    if (baseAmount <= 0) return row;

    const vatAmount = (baseAmount * row.TaxRate) / 100;
    const sysVatSum = vatAmount / systemRate;
    const grossValue = baseAmount + vatAmount;

    return {
      ...row,
      VatAmount: vatAmount.toFixed(2),
      SYSVatSum: sysVatSum.toFixed(2),
      GrossValue: grossValue.toFixed(2),
    };
  }, []);
  // ✅ NEW – currency dropdown options from CurrenciesV2
  const currencyOptions = OrignCurrData.map((item) => ({
    key: item.CurrCode,
    value: item.CurrCode,
  }));

  const lcCurrency = companyData.MainCurncy;

  const modalcolumnsTab0 = [
    {
      field: "SrNo",
      headerName: "Sr No.",
      width: 100,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "ShortName",
      headerName: "GL Acct/ BP Code",
      width: 200,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isTaxLine = params.row.isTaxLine;
        return (
          <Controller
            name={`ShortName_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <InputTextField
                  {...field}
                  sx={{ width: 170 }}
                  value={field.value || params.value || ""}
                  readOnly
                  disabled={isTaxLine || SaveUpdateName === "UPDATE"}
                  onChange={(e) => field.onChange(e)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      setValue("selectedRowIndex", params.row.id);
                      if (e.shiftKey) {
                        OpenBPDataModel();
                      } else {
                        OpenAccountModel();
                      }
                    }
                  }}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={(e) => handleIconClick(e, params.row.id)}
                          disabled={isTaxLine || SaveUpdateName === "UPDATE"}
                          size="small"
                          color="primary"
                          style={{
                            backgroundColor:
                              isTaxLine || SaveUpdateName === "UPDATE"
                                ? "gray"
                                : "green",
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
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedRow === params.row.id}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleSelectGL}>GL Accounts</MenuItem>
                  <MenuItem onClick={handleSelectBP}>
                    Business Partners
                  </MenuItem>
                </Menu>
              </>
            )}
          />
        );
      },
    },
    {
      field: "Name",
      headerName: "GL Acct/ BP Name",
      width: 200,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Controller
          name={`Name_${params.row.id}`}
          control={control}
          render={({ field }) => (
            <InputTextField
              {...field}
              value={field.value || params.value || ""}
              readOnly
              sx={{ width: 170 }}
            />
          )}
        />
      ),
    },
    {
      field: "Account",
      headerName: "Control Acct",
      width: 200,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isShortNameSelected =
          params.row.ShortName && params.row.ShortName.trim() !== "";
        // Disable if ShortName is from AccountModal (GL Account)
        const isDisabled =
          !isShortNameSelected ||
          params.row.isTaxLine ||
          params.row.AccountSource === "AccountModal" ||
          SaveUpdateName === "UPDATE";

        return (
          <Controller
            name={`Account_${params.row.id}`}
            control={control}
            render={({ field }) => (
              <InputTextField
                {...field}
                value={field.value || params.value || ""}
                readOnly
                sx={{ width: 170 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          handleSelectControlAccount(params.row.id)
                        }
                        size="small"
                        color="primary"
                        style={{
                          backgroundColor: isDisabled ? "gray" : "green",
                          borderRadius: "10%",
                          color: "white",
                          padding: 2,
                        }}
                        disabled={isDisabled} // Disable based on ShortName selection and AccountSource
                      >
                        <ViewListIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        );
      },
    },

    ...(displayInFc === "Y"
      ? [
          {
            field: "FCDebit",
            headerName: "Debit (FC)",
            width: 250,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
              // ===============================
              // 1️⃣ CURRENCY FLAGS
              // ===============================
              const isACCurrency = params.row.BPGLCurrency === "AC";
              const isLCCurrency =
                params.row.BPGLCurrency === companyData.MainCurncy;

              // ===============================
              // 3️⃣ 🔴 PUT THIS EXACTLY HERE
              // ===============================
              const isFCCurrencyDisabled =
                !isACCurrency || // only enabled for AC
                params.row.isTaxLine ||
                SaveUpdateName === "UPDATE";

              // ===============================
              // 4️⃣ FC VALUE DISABLE BASE
              // ===============================
              const creditHasValue =
                params.row.FCCredit && params.row.FCCredit !== "";

              const isFCValueBaseDisabled =
                isLCCurrency ||
                // isSCCurrency ||
                !params.row.ShortName ||
                params.row.isTaxLine ||
                SaveUpdateName === "UPDATE";
              // (isACCurrency && !isFCCurrencySelected);
              const isDebitDisabled =
                isFCValueBaseDisabled || (!isACCurrency && creditHasValue);
              const defaultFCCurrency =
                !isACCurrency && !isLCCurrency ? params.row.BPGLCurrency : "";

              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {/* FC Currency */}
                  <Controller
                    name={`FCCurrency_${params.row.id}`}
                    control={control}
                    render={({ field }) => (
                      <InputSearchSelectTextField
                        {...field}
                        size="small"
                        sx={{ width: 100 }}
                        data={currencyOptions}
                        value={
                          field.value ||
                          params.row.FCCurrency ||
                          defaultFCCurrency ||
                          ""
                        }
                        disabled={isFCCurrencyDisabled}
                        onChange={(e) => {
                          const val = e.target.value;

                          field.onChange(val);
                          handleCellChange(params.row.id, "FCCurrency", val);

                          // ✅ Recalculate exchange rate ONLY if FC amount already entered
                          const hasFCDebit = getValues(
                            `FCDebit_${params.row.id}`
                          );
                          const hasFCCredit = getValues(
                            `FCCredit_${params.row.id}`
                          );

                          if (hasFCDebit) {
                            handleDebitCreditBlur(params.row.id, "FCDebit");
                          }

                          if (hasFCCredit) {
                            handleDebitCreditBlur(params.row.id, "FCCredit");
                          }
                        }}
                      />
                    )}
                  />

                  {/* FC Debit */}
                  <Controller
                    name={`FCDebit_${params.row.id}`}
                    control={control}
                    render={({ field }) => (
                      <InputTextField
                        {...field}
                        sx={{ width: 150 }}
                        type="number"
                        value={field.value || params.row.FCDebit || ""}
                        disabled={isDebitDisabled && creditHasValue}
                        onChange={(e) => {
                          if (!isDebitDisabled) {
                            field.onChange(e.target.value);
                            handleCellChange(
                              params.row.id,
                              "FCDebit",
                              e.target.value
                            );
                          }
                        }}
                        onFocus={() => {
                          // 1️⃣ Store value BEFORE autofill
                          // focusValueRef.current = {
                          //   rowId: params.row.id,
                          //   field: "FCDebit",
                          //   value: getFieldValue(params.row.id, "FCDebit"),
                          // };
  sapCaseRef.current = detectSAPCaseFromJE(params.row.id, false);

                          // 2️⃣ Autofill missing fields
                          fillEmptyFields(params.row.id);
                        }}
                        onBlur={() => {
                          // const { rowId, field, value } = focusValueRef.current;

                          // // Safety check
                          // if (rowId !== params.row.id || field !== "FCDebit")
                          //   return;

                          // const currentValue = getFieldValue(
                          //   params.row.id,
                          //   "FCDebit"
                          // );

                          // 🔴 If value NOT changed → do NOTHING
                          // if (round2(currentValue) === round2(value)) {
                          //   return;
                          // }

                          // 🟢 Value changed by user → run calculations
                          handleDebitCreditBlur(params.row.id, "FCDebit");
                        }}
                      />
                    )}
                  />
                </Box>
              );
            },
          },

          {
            field: "FCCredit",
            headerName: "Credit (FC)",
            width: 250,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
              // ===============================
              // 1️⃣ CURRENCY FLAGS
              // ===============================
              const isACCurrency = params.row.BPGLCurrency === "AC";
              const isLCCurrency =
                params.row.BPGLCurrency === companyData.MainCurncy;

              // ===============================
              // 3️⃣ FC CURRENCY DISABLE (⭐ EXACT PLACE)
              // ===============================
              const isFCCurrencyDisabled =
                !isACCurrency || // only AC can select currency
                params.row.isTaxLine ||
                SaveUpdateName === "UPDATE";

              // ===============================
              // 4️⃣ FC VALUE DISABLE BASE
              // ===============================
              const debitHasValue =
                params.row.FCDebit && params.row.FCDebit !== "";

              const isFCValueBaseDisabled =
                isLCCurrency || // LC → value enabled, currency disabled
                // isSCCurrency || // SC → value enabled, currency disabled
                !params.row.ShortName ||
                params.row.isTaxLine ||
                SaveUpdateName === "UPDATE";
              // (isACCurrency && !isFCCurrencySelected); // AC needs currency first
              const isCreditDisabled =
                isFCValueBaseDisabled ||
                (!isACCurrency && debitHasValue) ||
                debitHasValue;

              const defaultFCCurrency =
                !isACCurrency && !isLCCurrency ? params.row.BPGLCurrency : "";

              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Controller
                    name={`FCCurrency_${params.row.id}`}
                    control={control}
                    render={({ field }) => (
                      <InputSearchSelectTextField
                        {...field}
                        size="small"
                        sx={{ width: 100 }}
                        data={currencyOptions}
                        value={
                          field.value ||
                          params.row.FCCurrency ||
                          defaultFCCurrency ||
                          ""
                        }
                        disabled={isFCCurrencyDisabled}
                        onChange={(e) => {
                          const val = e.target.value;

                          field.onChange(val);
                          handleCellChange(params.row.id, "FCCurrency", val);

                          // ✅ Recalculate exchange rate ONLY if FC amount already entered
                          const hasFCDebit = getValues(
                            `FCDebit_${params.row.id}`
                          );
                          const hasFCCredit = getValues(
                            `FCCredit_${params.row.id}`
                          );

                          if (hasFCDebit) {
                            handleDebitCreditBlur(params.row.id, "FCDebit");
                          }

                          if (hasFCCredit) {
                            handleDebitCreditBlur(params.row.id, "FCCredit");
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name={`FCCredit_${params.row.id}`}
                    control={control}
                    render={({ field }) => (
                      <InputTextField
                        {...field}
                        sx={{ width: 150 }}
                        type="number"
                        value={field.value || params.row.FCCredit || ""}
                        disabled={isCreditDisabled && debitHasValue}
                        onChange={(e) => {
                          if (!isCreditDisabled) {
                            field.onChange(e.target.value);
                            handleCellChange(
                              params.row.id,
                              "FCCredit",
                              e.target.value
                            );
                          }
                        }}
                        // Inside the FC Credit Controller's render, in the InputTextField's onFocus
                        // Inside the FC Credit Controller's render, in the InputTextField's onFocus
                        onFocus={() => {
                          // focusValueRef.current = {
                          //   rowId: params.row.id,
                          //   field: "FCCredit",
                          //   value: getFieldValue(params.row.id, "FCCredit"),
                          // };
                            sapCaseRef.current = detectSAPCaseFromJE(params.row.id, false);

                          fillEmptyFields(params.row.id);
                        }}
                        onBlur={() => {
                          // const { rowId, field, value } = focusValueRef.current;
                          // if (rowId !== params.row.id || field !== "FCCredit")
                          //   return;

                          // const currentValue = getFieldValue(
                          //   params.row.id,
                          //   "FCCredit"
                          // );
                          // if (round2(currentValue) === round2(value)) return;

                          handleDebitCreditBlur(params.row.id, "FCCredit");
                        }}
                      />
                    )}
                  />
                </Box>
              );
            },
          },
        ]
      : []),
    {
      field: "Debit",
      headerName: "Debit",
      width: 260,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const creditHasValue = params.row.Credit && params.row.Credit !== "";
        const isDisabled =
          creditHasValue ||
          !params.row.ShortName ||
          params.row.isTaxLine ||
          SaveUpdateName === "UPDATE";

        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {/* LC Currency (Always Disabled) */}
            <InputSearchSelectTextField
              size="small"
              sx={{ width: 90 }}
              data={currencyOptions}
              value={lcCurrency}
              disabled
            />

            {/* LC Debit */}
            <Controller
              name={`Debit_${params.row.id}`}
              control={control}
              render={({ field }) => (
                <InputTextField
                  {...field}
                  sx={{ width: 120 }}
                  type="number"
                  value={field.value || params.row.Debit || ""}
                  disabled={isDisabled}
                  onChange={(e) => {
                    if (!isDisabled) {
                      field.onChange(e.target.value);
                      handleCellChange(params.row.id, "Debit", e.target.value);
                    }
                  }}
                  onBlur={() => {
                    handleDebitCreditBlur(params.row.id, "Debit");

                    // Auto-set FC currency if AC row and FC currency is empty
                    const isACCurrency = params.row.BPGLCurrency === "AC";
                    const fcCurrencyValue = getValues(
                      `FCCurrency_${params.row.id}`
                    );
                    const lcDebit = getValues(`Debit_${params.row.id}`);
                    const lcCredit = getValues(`Credit_${params.row.id}`);

                    const hasLCValue =
                      (lcDebit !== "" &&
                        lcDebit !== null &&
                        lcDebit !== undefined &&
                        !isNaN(lcDebit) &&
                        Number(lcDebit) !== 0) ||
                      (lcCredit !== "" &&
                        lcCredit !== null &&
                        lcCredit !== undefined &&
                        !isNaN(lcCredit) &&
                        Number(lcCredit) !== 0);

                    if (isACCurrency && !fcCurrencyValue && hasLCValue) {
                      const { currency } = calculateACRowFCBalanceFromOtherRows(
                        params.row.id,
                        true
                      ); // true for debit

                      if (currency) {
                        setValue(`FCCurrency_${params.row.id}`, currency);
                        handleCellChange(params.row.id, "FCCurrency", currency);
                      }
                    }
                  }}
                  onFocus={() => {
                    fillEmptyFields(params.row.id);
                  }}
                />
              )}
            />
          </Box>
        );
      },
    },
    {
      field: "Credit",
      headerName: "Credit",
      width: 260,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const debitHasValue = params.row.Debit && params.row.Debit !== "";
        const isDisabled =
          debitHasValue ||
          !params.row.ShortName ||
          params.row.isTaxLine ||
          SaveUpdateName === "UPDATE";

        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {/* LC Currency */}
            <InputSearchSelectTextField
              size="small"
              sx={{ width: 90 }}
              data={currencyOptions}
              value={lcCurrency}
              disabled
            />

            {/* LC Credit */}
            <Controller
              name={`Credit_${params.row.id}`}
              control={control}
              render={({ field }) => (
                <InputTextField
                  {...field}
                  sx={{ width: 120 }}
                  type="number"
                  value={field.value || params.row.Credit || ""}
                  disabled={isDisabled}
                  onChange={(e) => {
                    if (!isDisabled) {
                      field.onChange(e.target.value);
                      handleCellChange(params.row.id, "Credit", e.target.value);
                    }
                  }}
                  onBlur={() => {
                    handleDebitCreditBlur(params.row.id, "Credit");

                    // Auto-set FC currency if AC row and FC currency is empty
                    const isACCurrency = params.row.BPGLCurrency === "AC";
                    const fcCurrencyValue = getValues(
                      `FCCurrency_${params.row.id}`
                    );
                    const lcDebit = getValues(`Debit_${params.row.id}`);
                    const lcCredit = getValues(`Credit_${params.row.id}`);

                    const hasLCValue =
                      (lcDebit !== "" &&
                        lcDebit !== null &&
                        lcDebit !== undefined &&
                        !isNaN(lcDebit) &&
                        Number(lcDebit) !== 0) ||
                      (lcCredit !== "" &&
                        lcCredit !== null &&
                        lcCredit !== undefined &&
                        !isNaN(lcCredit) &&
                        Number(lcCredit) !== 0);

                    if (isACCurrency && !fcCurrencyValue && hasLCValue) {
                      const { currency } = calculateACRowFCBalanceFromOtherRows(
                        params.row.id,
                        true
                      ); // false for credit
                      if (currency) {
                        setValue(`FCCurrency_${params.row.id}`, currency);
                        handleCellChange(params.row.id, "FCCurrency", currency);
                      }
                    }
                  }}
                  onFocus={() => {

                    fillEmptyFields(params.row.id);
                    if (!isDisabled && (!field.value || field.value === "")) {
                      const index = JERows.findIndex(
                        (row) => row.id === params.row.id
                      );
                      const prevRows = JERows.slice(0, index);

                      let totalDebit = 0;
                      let totalCredit = 0;

                      prevRows.forEach((row) => {
                        totalDebit += parseFloat(row.Debit) || 0;
                        totalCredit += parseFloat(row.Credit) || 0;
                      });

                      const remaining = totalDebit - totalCredit;

                      if (remaining > 0) {
                        field.onChange(remaining);
                        handleCellChange(params.row.id, "Credit", remaining);
                      }
                    }
                  }}
                />
              )}
            />
          </Box>
        );
      },
    },

    ...(displayInSc === "Y"
      ? [
          {
            field: "SYSDeb",
            headerName: "Debit (SC)",
            width: 250,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {/* SC Currency */}
                <Controller
                  name={`SCCurrency_${params.row.id}`}
                  control={control}
                  render={({ field }) => (
                    <InputSearchSelectTextField
                      {...field}
                      size="small"
                      sx={{ width: 100 }}
                      data={currencyOptions}
                      value={companyData.SysCurrncy}
                      disabled
                    />
                  )}
                />

                {/* SC Debit */}
                <Controller
                  name={`SYSDeb_${params.row.id}`}
                  control={control}
                  render={({ field }) => (
                    <InputTextField
                      {...field}
                      sx={{ width: 150 }}
                      type="number"
                      value={field.value || params.row.SYSDeb || ""}
                      disabled
                    />
                  )}
                />
              </Box>
            ),
          },

          {
            field: "SYSCred",
            headerName: "Credit (SC)",
            width: 250,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {/* SC Currency */}
                <Controller
                  name={`SCCurrency_${params.row.id}`}
                  control={control}
                  render={({ field }) => (
                    <InputSearchSelectTextField
                      {...field}
                      size="small"
                      sx={{ width: 100 }}
                      data={currencyOptions}
                      value={companyData.SysCurrncy}
                      disabled
                    />
                  )}
                />

                {/* SC Credit */}
                <Controller
                  name={`SYSCred_${params.row.id}`}
                  control={control}
                  render={({ field }) => (
                    <InputTextField
                      {...field}
                      sx={{ width: 150 }}
                      type="number"
                      value={field.value || params.row.SYSCred || ""}
                      disabled
                    />
                  )}
                />
              </Box>
            ),
          },
        ]
      : []),

    {
      field: "TaxCode",
      headerName: "TaxCode",
      width: 200,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const AccountEmpty =
          !params.row.ShortName || params.row.ShortName.trim() === "";
        const debitEmpty =
          !params.row.Debit || parseFloat(params.row.Debit) === 0;
        const creditEmpty =
          !params.row.Credit || parseFloat(params.row.Credit) === 0;
        const BPSelected = params.row.AccountSource === "BPData";
        const isTaxLine = params.row.isTaxLine;
        const isDisabled =
          watchAutoTax !== "Y" ||
          AccountEmpty ||
          (debitEmpty && creditEmpty) ||
          BPSelected ||
          isTaxLine ||
          SaveUpdateName === "UPDATE";
        return (
          <Controller
            name={`TaxCode_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputTextField
                {...field}
                sx={{ width: 170 }}
                value={field.value || params.value || ""}
                disabled={isDisabled}
                onKeyDown={(e) => {
                  if (e.key === "Tab" && !isDisabled) {
                    e.preventDefault();
                    setValue("selectedRowIndex", params.row.id);
                    OpenTaxCodeModel();
                  }
                }}
                error={!!error}
                helperText={error?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          if (!isDisabled) {
                            setValue("selectedRowIndex", params.row.id);
                            OpenTaxCodeModel();
                          }
                        }}
                        disabled={isDisabled}
                        size="small"
                        color="primary"
                        style={{
                          backgroundColor: isDisabled ? "gray" : "green",
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
        );
      },
    },
    {
      field: "VatAmount",
      headerName: "Tax Amt",
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Controller
          name={`VatAmount_${params.row.id}`}
          control={control}
          render={({ field }) => (
            <InputTextField
              {...field}
              value={field.value || params.value || ""}
              readOnly
              sx={{ width: 120 }}
            />
          )}
        />
      ),
    },
    {
      field: "SYSVatSum",
      headerName: "Tax Amt (SC)",
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Controller
          name={`SYSVatSum_${params.row.id}`}
          control={control}
          render={({ field }) => (
            <InputTextField
              {...field}
              value={field.value || params.value || ""}
              readOnly
              sx={{ width: 120 }}
            />
          )}
        />
      ),
    },
    {
      field: "GrossValue",
      headerName: "Gross Value",
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Controller
          name={`GrossValue_${params.row.id}`}
          control={control}
          render={({ field }) => (
            <InputTextField
              {...field}
              value={field.value || params.value || ""}
              readOnly
              sx={{ width: 120 }}
            />
          )}
        />
      ),
    },
    {
      field: "ContraAct",
      headerName: "Offset Account",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const AccountEmpty =
          !params.row.ShortName || params.row.ShortName.trim() === "";
        const accountOptions = Array.from(
          new Map(
            JERows.filter((row) => row.Account).map((row) => [
              row.Account,
              { key: row.ShortName, value: row.ShortName },
            ])
          ).values()
        );

        return (
          <Controller
            name={`ContraAct_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputSelectTextField
                {...field}
                error={!!error}
                helperText={error ? error.message : null}
                data={accountOptions}
                sx={{ width: 180 }}
                disabled={AccountEmpty || SaveUpdateName === "UPDATE"}
                value={field.value || params.value || ""}
                onChange={(e) => {
                  field.onChange(e);
                  handleCellChange(params.row.id, "ContraAct", e.target.value);
                }}
                fullWidth
              />
            )}
          />
        );
      },
    },
    {
      field: "BalanceDueLC",
      headerName: "Balance Due (LC)",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const { FCDebit, FCCredit } = params.row;
        const isValid = (val) =>
          val !== null &&
          val !== undefined &&
          val !== "" &&
          val !== "0.000" &&
          val !== 0;
        const balanceValue = isValid(FCDebit)
          ? `(${FCDebit})`
          : isValid(FCCredit)
          ? FCCredit
          : "";
        return <span>{balanceValue}</span>;
      },
    },
    {
      field: "BalanceDueSC",
      headerName: "Balance Due(SC)",
      width: 200,
      editable: false,
      renderCell: (params) => {
        const { BalFcDeb, BalFcCred } = params.row;
        const isValid = (val) =>
          val !== null &&
          val !== undefined &&
          val !== "" &&
          val !== "0.000" &&
          val !== 0;
        const balanceValue = isValid(BalFcDeb)
          ? BalFcDeb
          : isValid(BalFcCred)
          ? BalFcCred
          : "";
        return <span>{balanceValue}</span>;
      },
    },
    {
      field: "MatType",
      headerName: "Material Type",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isAutoTaxCheck = watchAutoTax === "Y";
        const AccountEmpty =
          !params.row.ShortName || params.row.ShortName.trim() === "";
        const BPSelected = params.row.AccountSource === "BPData";
        const isTaxLine = params.row.isTaxLine;
        const isDisabled =
          AccountEmpty ||
          (BPSelected && isAutoTaxCheck) ||
          isTaxLine ||
          SaveUpdateName === "UPDATE";
        return (
          <Controller
            name={`MatType_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputSelectTextField
                {...field}
                error={!!error}
                helperText={error ? error.message : null}
                data={[
                  { key: "1", value: "Raw Material" },
                  { key: "2", value: "Capital Goods" },
                  { key: "3", value: "Finished Goods" },
                ]}
                sx={{ width: 180 }}
                disabled={isDisabled}
                value={field.value || params.value || ""}
                onChange={(e) => {
                  field.onChange(e);
                  handleCellChange(params.row.id, "MatType", e.target.value);
                }}
                fullWidth
              />
            )}
          />
        );
      },
    },
    {
      field: "CenVatCom",
      headerName: "GST/CENVAT Component",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isAutoTaxCheck = watchAutoTax === "Y";
        const AccountEmpty =
          !params.row.ShortName || params.row.ShortName.trim() === "";
        const BPSelected = params.row.AccountSource === "BPData";
        const isTaxLine = params.row.isTaxLine;
        const isDisabled =
          AccountEmpty ||
          (BPSelected && isAutoTaxCheck) ||
          isTaxLine ||
          SaveUpdateName === "UPDATE";
        return (
          <Controller
            name={`CenVatCom_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputSelectTextField
                {...field}
                error={!!error}
                helperText={error ? error.message : null}
                sx={{ width: 180 }}
                data={[
                  { key: "", value: "Select and Option" },
                  ...TaxTypeData.map((item) => ({
                    key: item.DocEntry,
                    value: item.Name,
                  })),
                ]}
                disabled={isDisabled}
                value={field.value || params.value || ""}
                onChange={(e) => {
                  field.onChange(e);
                  handleCellChange(params.row.id, "CenVatCom", e.target.value);
                }}
                fullWidth
              />
            )}
          />
        );
      },
    },
    {
      field: "Location",
      headerName: "Location",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isAutoTaxCheck = watchAutoTax === "Y";
        const AccountEmpty =
          !params.row.ShortName || params.row.ShortName.trim() === "";
        const BPSelected = params.row.AccountSource === "BPData";
        const isTaxLine = params.row.isTaxLine;
        const isDisabled =
          AccountEmpty ||
          (BPSelected && isAutoTaxCheck) ||
          isTaxLine ||
          SaveUpdateName === "UPDATE";
        return (
          <Controller
            name={`Location_${params.row.id}`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputSelectTextField
                {...field}
                error={!!error}
                helperText={error ? error.message : null}
                data={[
                  { key: "", value: "Select an option" },
                  ...location.map((item) => ({
                    key: item.DocEntry,
                    value: item.Location,
                  })),
                ]}
                disabled={isDisabled}
                sx={{ width: 180 }}
                value={field.value || params.value || ""}
                onChange={(e) => {
                  field.onChange(e);
                  handleCellChange(params.row.id, "Location", e.target.value);
                }}
                fullWidth
              />
            )}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleAccDeleteRow(params.row.id)}
          color="error"
          disabled={SaveUpdateName === "UPDATE" || params.row.isTaxLine}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  // Form Submission
  const handleSubmitForm = async (data) => {
    console.log("obj", data);
    const allCurrencies = JERows.map((row) =>
      getValues(`BPGLCurrency_${row.id}`)
    ).filter(Boolean);

    const effectiveCurrencies = JERows.map((row) => {
      const bpglCurr = getValues(`BPGLCurrency_${row.id}`);

      // If AC → take selected FC currency
      if (bpglCurr === "AC") {
        return getValues(`FCCurrency_${row.id}`) || null;
      }

      // Otherwise BPGL currency itself
      return bpglCurr || null;
    }).filter(Boolean);
    const uniqueEffectiveCurrencies = [...new Set(effectiveCurrencies)];

    if (SaveUpdateName === "SAVE" && uniqueEffectiveCurrencies.length > 1) {
      await Swal.fire({
        icon: "warning",
        title: "Currency Mismatch",
        text:
          "All rows must have the same currency. " +
          "AC(All Currency) rows are allowed, but their selected FC currency must match other rows.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Filter out "AC" currencies
    const nonACCurrencies = allCurrencies.filter((c) => c !== "AC");
    const uniqueNonAC = [...new Set(nonACCurrencies)];
    if (uniqueNonAC.length > 1) {
      await Swal.fire({
        icon: "warning",
        title: "Currency Mismatch",
        text: "All rows must have the same currency (except AC) before submitting the journal entry!",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check that each row has Account (Control Account) filled
    // Check Control Account only for NORMAL rows (exclude tax lines)
    const rowsMissingAccount = JERows.filter(
      (row) =>
        !row.isTaxLine && // 👈 skip tax lines
        (!row.Account || row.Account.trim() === "")
    );
    if (SaveUpdateName === "SAVE") {
      if (rowsMissingAccount.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: "Missing Control Account",
          text: `Each normal row must have a Control Account. ${rowsMissingAccount.length} row(s) are missing it.`,
          confirmButtonText: "OK",
        });
        return;
      }
    }
    const totalDebit = JERows.reduce(
      (sum, row) => sum + (parseFloat(row.Debit) || 0),
      0
    );
    const totalCredit = JERows.reduce(
      (sum, row) => sum + (parseFloat(row.Credit) || 0),
      0
    );
    const totalFCDebit = JERows.reduce(
      (sum, row) => sum + (parseFloat(row.FCDebit) || 0),
      0
    );
    const totalFCCredit = JERows.reduce(
      (sum, row) => sum + (parseFloat(row.FCCredit) || 0),
      0
    );
    const totalSYSDebit = JERows.reduce(
      (sum, row) => sum + (parseFloat(row.SYSDeb) || 0),
      0
    );
    const totalSYSCredit = JERows.reduce(
      (sum, row) => sum + (parseFloat(row.SYSCred) || 0),
      0
    );

    const diffLC = Math.abs(totalDebit - totalCredit);
    const diffFC = Math.abs(totalFCDebit - totalFCCredit);
    const diffSC = Math.abs(totalSYSDebit - totalSYSCredit);

    if (diffLC !== 0) {
      const label =
        totalDebit > totalCredit
          ? "Difference (Debit)"
          : totalCredit > totalDebit
          ? "Difference (Credit)"
          : "Difference";

      Swal.fire({
        text: `${label}: ${diffLC.toFixed(2)}. Please balance the entry.`,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (diffFC !== 0) {
      const label =
        totalFCDebit > totalFCCredit
          ? "Difference (FC Debit)"
          : totalFCCredit > totalFCDebit
          ? "Difference (FC Credit)"
          : "Difference (FC)";

      Swal.fire({
        text: `${label}: ${diffFC.toFixed(2)}. Please balance the entry.`,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (diffSC !== 0) {
      const label =
        totalSYSDebit > totalSYSCredit
          ? "Difference (SC Debit)"
          : totalSYSCredit > totalSYSDebit
          ? "Difference (SC Credit)"
          : "Difference (SC)";

      Swal.fire({
        text: `${label}: ${diffSC.toFixed(2)}. Please balance the entry.`,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const invalidRows = JERows.filter(
      (row) =>
        (!row.Debit || parseFloat(row.Debit) === 0) &&
        (!row.Credit || parseFloat(row.Credit) === 0)
    );

    let filteredRows = JERows;

    if (invalidRows.length > 0) {
      const result = await Swal.fire({
        text: `${invalidRows.length} row(s) have both Debit and Credit empty. Do you want to skip and continue?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Skip",
        cancelButtonText: "No, Cancel",
      });

      if (!result.isConfirmed) {
        return;
      }

      filteredRows = JERows.filter(
        (row) =>
          !(
            (!row.Debit || parseFloat(row.Debit) === 0) &&
            (!row.Credit || parseFloat(row.Credit) === 0)
          )
      );
    }
    if (filteredRows.length === 0) {
      await Swal.fire({
        text: "You must enter at least one line with a Debit or Credit amount to proceed with the journal entry",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const obj = {
      DocEntry: data.DocEntry || "0",
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("MM/DD/YYYY HH:mm:ss"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("MM/DD/YYYY HH:mm:ss"),
      Status: "0",
      BatchNum: data.BatchNum || "0",
      TransId: data.TransId || "",
      BtfStatus: data.BtfStatus || "0",
      TransType: data.TransType || "30",
      BaseRef: data.BaseRef || "",
      RefDate: data.RefDate || "0",
      Memo: data.Memo || "",
      LocTotal: data.LocTotal || "0",
      FcTotal: data.FcTotal || "0",
      SysTotal: data.SysTotal || "0",
      OrignCurr: data.OrignCurr || "0",
      FixExchRate: data.FixExchRate || "0",
      TransRate: data.TransRate || "0",
      DueDate: data.DueDate || "0",
      TaxDate: data.TaxDate || "0",
      FinncPriod:
        String(data.FinncPriod) || String(DocSeries[0]?.FinncPriod || "0"),
      PIndicator:
        String(data.PIndicator) || String(DocSeries[0]?.Indicator || "0"),
      Indicator: String(data.Indicator || "0"),
      ObjType: data.ObjType || "0",
      StornoDate: data.StornoDate
        ? dayjs(data.StornoDate).format("MM/DD/YYYY HH:mm:ss")
        : "",
      StornoToTr: data.StornoToTr || "0",
      AutoStorno: data.AutoStorno || "0",
      Number: data.Number || "0",
      Ref1: data.Ref1 || "0",
      TransCurr: data.TransCurr || "0",
      AdjTran: data.AdjTran || "0",
      RevSource: data.RevSource || "0",
      VatDate: dayjs().format("MM/DD/YYYY HH:mm:ss"),
      StampTax: data.StampTax || "0",
      AutoVAT: data.AutoVAT || "0",
      DocSeries: data.DocSeries || "0",
      GenRegNo: data.GenRegNo || "0",
      RG23APart2:
        data.MatType === "1" || data.MatType === "3"
          ? data.ExciseNumberField ?? "0"
          : "0",
      RG23CPart2: data.MatType === "2" ? data.ExciseNumberField : "0",
      Location: data.Location || "0",
      AutoWT: data.AutoWT || "0",
      WTSum: data.WTSum || "0",
      WTSumSC: data.WTSumSC || "0",
      WTSumFC: data.WTSumFC || "0",
      WTApplied: data.WTApplied || "0",
      WTAppliedS: data.WTAppliedS || "0",
      WTAppliedF: data.WTAppliedF || "0",
      BaseAmnt: data.BaseAmnt || "0",
      BaseAmntSC: data.BaseAmntSC || "0",
      BaseAmntFC: data.BaseAmntFC || "0",
      BaseVtAt: data.BaseVtAt || "0",
      BaseVtAtSC: data.BaseVtAtSC || "0",
      BaseVtAtFC: data.BaseVtAtFC || "0",
      SSIExmpt: data.SSIExmpt || "0",
      AgrNo: data.AgrNo || "0",
      ECDPosTyp: data.ECDPosTyp || "0",
      PTICode: data.PTICode || "0",
      ExclTaxRep: data.ExclTaxRep || "0",
      IsCoEntry: data.IsCoEntry || "0",
      AtcEntry: data.AtcEntry || "0",
      Attachment: data.Attachment || "0",
      Series: String(data.Series || "0"),
      DocNum: data.DocNum || "0",
      MatType: data.MatType || "0",
      DocDate: dayjs().format("MM/DD/YYYY HH:mm:ss"),
      oLines: filteredRows.map((line) => {
        const rowId = line.id;

        // 🔹 FC values from RHF
        const fcDebit = Number(getValues(`FCDebit_${rowId}`)) || 0;
        const fcCredit = Number(getValues(`FCCredit_${rowId}`)) || 0;

        // 🔹 Selected FC currency
        const selectedFCCurrency = getValues(`FCCurrency_${rowId}`);

        // 🔹 BP/GL currency
        const bpglCurrency = getValues(`BPGLCurrency_${rowId}`);

        // 🔹 FINAL FC currency to POST
        const finalFCCurrency =
          bpglCurrency === "AC" && (fcDebit > 0 || fcCredit > 0)
            ? selectedFCCurrency || "0"
            : bpglCurrency &&
              bpglCurrency !== localCurrency &&
              bpglCurrency !== systemCurrency
            ? bpglCurrency
            : "0";

        const debitVal = Number(line.Debit || 0);
        const creditVal = Number(line.Credit || 0);
        return {
          LineNum: line.LineNum || "",
          DocEntry: data.DocEntry || "0",
          UserId: user.UserId,
          CreatedBy: user.UserName || "",
          CreatedDate: dayjs().format("MM/DD/YYYY HH:mm:ss"),
          ModifiedBy: user.UserName || "",
          ModifiedDate: dayjs().format("MM/DD/YYYY HH:mm:ss"),
          Status: "0",
          ShortName: line.ShortName || "",
          MatType: line.MatType || "", // Ensure MatType is passed from line
          Account: line.Account || "",
          Debit: String(line.Debit || "0"),
          Credit: String(line.Credit || "0"),
          SYSCred: String(line.SYSCred || "0"),
          SYSDeb: String(line.SYSDeb || "0"),
          FCDebit: String(line.FCDebit || "0"),
          FCCredit: String(line.FCCredit || "0"),
          // FCCurrency: isFCCurrency ? lineBPGLCurrency : "0", // Pass BPGLCurrency if it's an FC
          FCCurrency: finalFCCurrency,
          ContraAct: line.ContraAct || "0",
          LineMemo: line.LineMemo || "0",
          Ref3Line: line.Ref3Line || "0",
          TransType: line.TransType || "0",
          BaseRef: line.BaseRef || "0",
          Project: line.Project || "0",
          TaxDate: data.TaxDate || "0",
          SystemRate: line.SystemRate || "0",
          MthDate: dayjs().format("MM/DD/YYYY HH:mm:ss"),
          ToMthSum: line.ToMthSum || "0",
          BatchNum: line.BatchNum || "0",
          FinncPriod:
            String(data.FinncPriod) || String(DocSeries[0]?.FinncPriod || "0"),
          PIndicator:
            String(data.Indicator) || String(DocSeries[0]?.Indicator || "0"),
          Indicator: String(data.Indicator || "0"),
          VatGroup: line.VatGroup || "0",
          BaseSum: line.BaseSum || "0",
          VatRate: String(line.VatRate || "0"),
          AdjTran: line.AdjTran || "0",
          RevSource: line.RevSource || "0",
          ObjType: line.ObjType || "0",
          VatDate: dayjs().format("MM/DD/YYYY HH:mm:ss"),
          SYSBaseSum: line.SYSBaseSum || "0",
          VatLine: line.VatLine || "0",
          VatAmount: line.VatAmount || "0",
          SYSVatSum: line.SYSVatSum || "0",
          GrossValue: line.GrossValue || "0",
          DebCred: creditVal > 0 ? "C" : debitVal > 0 ? "D" : "0",
          StornoAcc: line.StornoAcc || "0",
          BalDueDeb: String(line.Debit || "0"),
          BalDueCred: String(line.Credit || "0"),
          BalFcDeb: String(line.SYSDeb || "0"),
          BalFcCred: String(line.SYSCred || "0"),
          BalScDeb: String(line.BalScDeb || "0"),
          BalScCred: String(line.BalScCred || "0"),
          IsNet: line.IsNet || "0",
          TaxType: line.TaxType || "0",
          TaxPostAcc: line.TaxPostAcc || "0",
          StaCode: line.StaCode || "0",
          StaType: line.StaType || "0",
          TaxCode: line.TaxCode || "0",
          GrossValFc: line.GrossValFc || "0",
          OcrCode2: line.OcrCode2 || "0",
          OcrCode3: line.OcrCode3 || "0",
          OcrCode4: line.OcrCode4 || "0",
          OcrCode5: line.OcrCode5 || "0",
          CenVatCom: line.CenVatCom || "0",
          Location: line.Location || "0",
          WTaxCode: line.WTaxCode || "0",
          TotalVat: line.VatAmount || "0",
          SYSTVat: line.SYSVatSum || "0",
          WTLiable: line.WTLiable || "0",
          WTLine: line.WTLine || "0",
          WTApplied: line.WTApplied || "0",
          WTAppliedS: line.WTAppliedS || "0",
          WTAppliedF: line.WTAppliedF || "0",
          WTSum: line.WTSum || "0",
          WTSumFC: line.WTSumFC || "0",
          WTSumSC: line.WTSumSC || "0",
          PayBlock: line.PayBlock || "0",
          PayBlckRef: line.PayBlckRef || "0",
          LicTradNum: line.LicTradNum || "0",
          InterimTyp: line.InterimTyp || "0",
          DprId: line.DprId || "0",
          MatchRef: line.MatchRef || "0",
          VatRegNum: line.VatRegNum || "0",
          SLEDGERF: line.SLEDGERF || "0",
          DocNum: line.DocNum || "0",
          DueDate: data.DueDate || "0",
          ActType:
            SaveUpdateName === "SAVE"
              ? line.AccountSource === "BPData"
                ? "B" // CHANGED: Now "B" for BPData rows (as per your requirement)
                : "A" // CHANGED: "A" for GL/AccountModal rows
              : "",
        };
      }),
    };

    try {
      setLoading(true);
      let response;
      if (SaveUpdateName === "SAVE") {
        response = await apiClient.post(`/JournalEntry`, obj);
        setClearCache(true);
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.DocNum}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (!result.isConfirmed) {
          setLoading(false);
          Swal.fire({
            text: "Record is not Updated!",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }
        response = await apiClient.put(`/JournalEntry/${data.DocEntry}`, obj);
        setClearCache(true);
      }

      const { success, message } = response.data;
      setLoading(false);
      if (success) {
        clearFormData();
        fetchcloseListData(0); // Refresh open list
        Swal.fire({
          title: "Success!",
          text: `Journal Entry ${
            SaveUpdateName === "SAVE" ? "Added" : "Updated"
          }`,
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
    } catch (error) {
      setLoading(false);
      let errorMessage = "Something went wrong. Please try again later.";
      if (error?.response?.data) {
        const apiError = error.response.data;
        if (apiError.errors) {
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
        confirmButtonText: "Ok",
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
          Journal Entry List
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
                  <Tab value="0" label="Close" />
                  <Tab value="1" label="Cancelled" />
                </Tabs>

                {/* Open Tab */}
                <TabPanel
                  value="0"
                  style={{
                    overflow: "auto",
                    maxHeight: `calc(100% - ${15}px)`,
                    paddingLeft: 5,
                    paddingRight: 5,
                  }}
                  id="OpenListScroll"
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
                    dataLength={closeListData.length}
                    hasMore={hasMoreClose}
                    next={fetchMorecloseListData}
                    loader={
                      <BeatLoader
                        color={
                          theme.palette.mode === "light" ? "black" : "white"
                        }
                      />
                    }
                    scrollableTarget="OpenListScroll"
                    endMessage={<Typography>No More Records</Typography>}
                  >
                    {closeListData.map((item, i) => (
                      <CardComponent
                        key={i}
                        title={`Journal Entry - ${item.DocNum}`}
                        subtitle={new Intl.DateTimeFormat("en-GB").format(
                          new Date(item.RefDate)
                        )}
                        description={item.oLines
                          .reduce(
                            (sum, row) => sum + (parseFloat(row.Debit) || 0),
                            0
                          )
                          .toFixed(2)}
                        isSelected={selectedData === item.DocEntry}
                        searchResult={CloseListquery}
                        onClick={() => setOldOpenData(item.DocEntry)}
                      />
                    ))}
                  </InfiniteScroll>
                </TabPanel>

                {/* Cancelled Tab */}
                <TabPanel
                  value="1"
                  style={{
                    overflow: "auto",
                    maxHeight: `calc(100% - ${15}px)`,
                    paddingLeft: 5,
                    paddingRight: 5,
                  }}
                  id="CancelledListScroll"
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
                      onChange={(e) => handleCancelListSearch(e.target.value)}
                      value={CancelListquery}
                      onClickClear={handleCancelListClear}
                    />
                  </Grid>
                  <InfiniteScroll
                    style={{ textAlign: "center", justifyContent: "center" }}
                    dataLength={CancelListData.length}
                    hasMore={hasMoreCancel}
                    next={fetchMoreCancelListData}
                    loader={
                      <BeatLoader
                        color={
                          theme.palette.mode === "light" ? "black" : "white"
                        }
                      />
                    }
                    scrollableTarget="CancelledListScroll"
                    endMessage={<Typography>No More Records</Typography>}
                  >
                    {CancelListData.map((item, i) => (
                      <CardComponent
                        key={i}
                        title={`Journal Entry - ${item.DocNum}`}
                        subtitle={new Intl.DateTimeFormat("en-GB").format(
                          new Date(item.RefDate)
                        )}
                        description={item.oLines
                          .reduce(
                            (sum, row) => sum + (parseFloat(row.Debit) || 0),
                            0
                          )
                          .toFixed(2)}
                        isSelected={selectedData === item.DocEntry}
                        searchResult={CancelListquery}
                        onClick={() => setOldOpenData(item.DocEntry)}
                      />
                    ))}
                  </InfiniteScroll>
                </TabPanel>
              </TabContext>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  return (
    <>
      <Dialog
        open={exchangeRateModalOpen}
        onClose={() => setExchangeRateModalOpen(false)}
        maxWidth="sm" // smaller width
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          Add Exchange Rate
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} justifyContent="center">
            {/* Rate Date */}
            <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Rate Date</div>
              <div>
                {exchangeRateModalData.RateDate
                  ? dayjs(exchangeRateModalData.RateDate).format("DD-MM-YYYY")
                  : "—"}
              </div>
            </Grid>

            {/* Currency */}
            <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Currency</div>
              <div>{exchangeRateModalData.Currency || "—"}</div>
            </Grid>

            {/* Rate */}
            <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Rate</div>
              <InputTextField
                type="number"
                value={manualRate}
                onChange={(e) => setManualRate(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 3,
            py: 2,
          }}
        >
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveManualRate}
            disabled={isSavingManualRate}
          >
            {isSavingManualRate ? "Saving..." : "Save Rate"}
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => setExchangeRateModalOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <SearchModel
        open={openTaxCodeList}
        onClose={CloseTaxCodeModel}
        onCancel={CloseTaxCodeModel}
        title="Select TaxCode"
        onChange={(e) => handleTaxCodeGetListSearch(e.target.value)}
        value={TaxCodegetListquery}
        onClickClear={handleTaxCodeGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={TaxCodegetListData.length}
            next={fetchTaxCodeMoreGetListData}
            hasMore={TaxCodehasMoreGetList}
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
            {TaxCodegetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.TaxCode}
                subtitle={item.Description}
                width="350px"
                searchResult={TaxCodegetListquery}
                onClick={() => {
                  onSelectTaxCode(
                    item.TaxCode,
                    parseFloat(item.Rate),
                    item.oLines
                  );
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openBPDataList}
        onClose={CloseBPDataModel}
        onCancel={CloseBPDataModel}
        title="List of Business Partners"
        onChange={(e) => handleBPDataGetListSearch(e.target.value)}
        value={BPDatagetListquery}
        onClickClear={handleBPDataGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={BPDatagetListData.length}
            next={fetchBPDataMoreGetListData}
            hasMore={BPDatahasMoreGetList}
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
            {BPDatagetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.CardName}
                subtitle={
                  item.CardType === "C"
                    ? "Customer"
                    : item.CardType === "V"
                    ? "Vendor"
                    : item.CardType === "L"
                    ? "Lead"
                    : ""
                }
                description={
                  item.Currency === "AC" ? "All Currencies" : item.Currency
                }
                width="350px"
                searchResult={BPDatagetListquery}
                onClick={() => {
                  onSelectBPData(
                    item.CardCode,
                    item.CardName,
                    item.DebPayAcct,
                    item.Currency
                  );
                  CloseBPDataModel();
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openAccountList}
        onClose={CloseAccountModel}
        onCancel={CloseAccountModel}
        title="List Of Account"
        onChange={(e) => handleAccountGetListSearch(e.target.value)}
        value={AccountgetListquery}
        onClickClear={handleAccountGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={AccountgetListData.length}
            next={fetchAccountMoreGetListData}
            hasMore={AccounthasMoreGetList}
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
            {AccountgetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.AcctCode}
                subtitle={item.AcctName}
                description={
                  item.ActCurr === "AC" ? "All Currencies" : item.ActCurr
                }
                width="350px"
                searchResult={AccountgetListquery}
                onClick={() => {
                  onSelectAccount(item.AcctCode, item.AcctName, item.ActCurr);
                  CloseAccountModel();
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      {/* Control Account DataGridCellClickModel */}
      <DataGridCellClickModel
        open={isControlAcctDialogOpen}
        closeModel={() => setIsControlAcctDialogOpen(false)}
        isLoading={controlAcctLoading}
        title="Control Account List"
        getRowId={(row) => row.DocEntry}
        columns={Acclist}
        rows={controlAcctRows}
        taxCurrentPage={controlAcctCurrentPage}
        limit={CONTROL_ACCT_LIMIT}
        onPaginationModelChange={handleControlAcctPaginationModelChange}
        onCellClick={handleControlAcctRowSelection}
        searchText={controlAcctSearchText}
        onSearchChange={handleControlAcctSearchChange}
        rowCount={controlAcctRowCount}
        oLines={getValues("oLines") || []}
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
              left: "10px",
            }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            // aria-expanded={open ? "true" : undefined}
            onClick={handleClickCancelClosed}
            sx={{
              display: {}, // Show only on smaller screens
              position: "absolute",
              right: "50px",
              // color: "black",
              // mt: -1,
            }}
          >
            {/* <div> */}
            {/* <Button
                        // aria-expanded={open ? "true" : undefined}
                        //  disabled={SaveUpdateName ==== "SAVE"}
          
                        color="inherit"
                        sx={{
                          display: {}, // Show only on smaller screens
                          //  position: "absolute",
                        }}
                      > */}
            <MoreVertIcon />
            {/* </Button> */}
          </IconButton>
          <Menu
            id="menu"
            anchorEl={anchorEl}
            open={Openmenu}
            onClose={handleCloseCancelClosed}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              disabled={SaveUpdateName === "SAVE" || tab === "1" || (!!transType && !!baseRef)}
              onClick={() => {
                handleOnCancelDocument();
                handleCloseCancelClosed();
              }}
            >
              <ListItemIcon>
                <HighlightOffIcon
                  fontSize="small"
                  color="inherit"
                  sx={{ fontWeight: "bold", strokeWidth: 2 }}
                />
              </ListItemIcon>
              <Typography
                disabled={SaveUpdateName === "SAVE" }
                fontWeight="bold"
              >
                CANCEL
              </Typography>
            </MenuItem>
          </Menu>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            // onClick={toggleDrawer}
            onClick={clearFormData}
            sx={{
              display: {},
              position: "absolute",
              right: "10px",
            }}
          >
            <AddIcon />
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
              Journal Entry
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
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Series"
                      rules={{ required: "please select Series" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="SERIES"
                          data={[
                            ...(DocSeries || []).map((item) => ({
                              key: item.SeriesId,
                              value: item.SeriesName,
                            })),
                            { key: "0", value: "MANUAL" },
                          ]}
                          disabled={!allFormData.DocEntry === false}
                          {...field}
                          onChange={(e) => {
                            const selectedSeries = e.target.value;
                            field.onChange(selectedSeries);
                            setValue("Series", selectedSeries);
                            if (selectedSeries !== "0") {
                              const seriesData = DocSeries.find(
                                (item) => item.SeriesId === selectedSeries
                              );
                              setValue("DocNum", seriesData?.DocNum || "");
                              clearErrors("DocNum");
                            } else {
                              setValue("DocNum", "");
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
                            !allFormData.DocEntry === false ||
                            watch("Series") !== "0"
                          }
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="RefDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="POSTING DATE"
                          name={field.name}
                          disabled={SaveUpdateName === "UPDATE"}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setValue("RefDate", date, { shouldDirty: true });
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DueDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="DUE DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) =>
                            setValue("DueDate", date, { shouldDirty: true })
                          }
                          disabled={
                            !getValues("RefDate") ||
                            allFormData.Status === "Closed" ||
                            allFormData.Status === "Cancelled" ||
                            SaveUpdateName === "UPDATE"
                          }
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="TaxDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="DOC. DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValue("TaxDate", newValue, {
                              shouldDirty: true,
                            });
                          }}
                          disabled={SaveUpdateName === "UPDATE"}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="TransType"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ORIGIN JE"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          readOnly
                          inputProps={{ maxLength: 15 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                          rows={1}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="BaseRef"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ORIGIN NO."
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          readOnly
                          inputProps={{ maxLength: 15 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                          rows={1}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="TransId"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TRANS. NO."
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          readOnly
                          inputProps={{ maxLength: 15 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                          rows={1}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Location"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="LOCATION"
                          data={location.map((item) => ({
                            key: item.DocEntry,
                            value: item.Location,
                          }))}
                          onChange={(e) => {
                            const selectedLocation = e.target.value;
                            field.onChange(selectedLocation);
                            handleMainLocationChange(selectedLocation);
                          }}
                          disabled={SaveUpdateName === "UPDATE"}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid
                    item
                    sm={6}
                    xs={12}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="FixExchRate"
                      control={control}
                      defaultValue={"N"}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                textAlign: "center",
                                width: 20,
                                mr: 1,
                              }}
                              checked={field.value === "Y"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "Y" : "N")
                              }
                              disabled={SaveUpdateName === "UPDATE"}
                            />
                          }
                          label={
                            <Tooltip title="FIXED EXCHANGE RATE">
                              <Typography noWrap={true}>
                                FIXED EXCHANGE RATE
                              </Typography>
                            </Tooltip>
                          }
                          sx={{
                            textAlign: "center",
                            width: 200,
                          }}
                        />
                      )}
                    />
                  </Grid> */}
                  {FixExchRate === "Y" && (
                    <Grid
                      item
                      sm={6}
                      xs={12}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                      justifyContent="center"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Grid
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                        ml={-1}
                        sx={{ width: 250 }}
                      >
                        <Controller
                          name="OrignCurr"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSelectTextField1
                              label="CURRENCY"
                              {...field}
                              data={OrignCurrData.map((unit) => ({
                                key: unit.CurrCode,
                                value: unit.CurrName,
                              }))}
                              error={!!error}
                              helperText={error ? error.message : null}
                              sx={{ width: "70%" }}
                              disabled={SaveUpdateName === "UPDATE"}
                            />
                          )}
                        />
                        <Controller
                          name="TransRate"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextFieldLarge
                              label=""
                              type="number"
                              {...field}
                              inputProps={{
                                maxLength: 15,
                                min: 0,
                                onInput: (e) => {
                                  if (e.target.value.length > 15) {
                                    e.target.value = e.target.value.slice(
                                      0,
                                      15
                                    );
                                  }
                                },
                              }}
                              sx={{ width: "35%" }}
                              error={!!error}
                              helperText={error ? error.message : null}
                              disabled={SaveUpdateName === "UPDATE"}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {/* <Grid
                    item
                    sm={6}
                    xs={12}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="AdjTran"
                      control={control}
                      defaultValue={"N"}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                textAlign: "center",
                                width: 20,
                                mr: 1,
                              }}
                              checked={field.value === "Y"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "Y" : "N")
                              }
                              disabled={SaveUpdateName === "UPDATE"}
                            />
                          }
                          label={
                            <Tooltip title="ADJ. TRANS.">
                              <Typography noWrap={true}>ADJ. TRANS.</Typography>
                            </Tooltip>
                          }
                          sx={{
                            textAlign: "center",
                            width: 200,
                          }}
                        />
                      )}
                    />
                  </Grid> */}
                  {/* <Grid
                    item
                    sm={6}
                    xs={12}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="AutoStorno"
                      control={control}
                      defaultValue={"N"}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                textAlign: "center",
                                width: 20,
                                mr: 1,
                              }}
                              checked={field.value === "Y"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "Y" : "N")
                              }
                              disabled={SaveUpdateName === "UPDATE"}
                            />
                          }
                          label={
                            <Tooltip title="REVERSE">
                              <Typography noWrap={true}>REVERSE</Typography>
                            </Tooltip>
                          }
                          sx={{
                            textAlign: "center",
                            width: 200,
                          }}
                        />
                      )}
                    />
                  </Grid> */}
                  {WatchReverse === "Y" && (
                    <Grid
                      item
                      sm={6}
                      xs={12}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="StornoDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SelectedDatePickerField
                            label="DATE"
                            name={field.name}
                            value={
                              field.value
                                ? dayjs(field.value)
                                : dayjs().add(1, "month").startOf("month")
                            }
                            minDate={getValues("RefDate")}
                            onChange={(date) =>
                              setValue("StornoDate", date, {
                                shouldDirty: true,
                              })
                            }
                            disabled={
                              !getValues("RefDate") ||
                              allFormData.Status === "Closed" ||
                              allFormData.Status === "Cancelled" ||
                              SaveUpdateName === "UPDATE"
                            }
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                  )}

                  <Grid
                    item
                    sm={6}
                    xs={12}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="AutoVAT"
                      control={control}
                      defaultValue={"N"}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                textAlign: "center",
                                width: 20,
                                mr: 1,
                              }}
                              checked={field.value === "Y"}
                              disabled={SaveUpdateName === "UPDATE"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "Y" : "N")
                              }
                            />
                          }
                          label={
                            <Tooltip title="AUTOMATIC TAX">
                              <Typography noWrap={true}>
                                AUTOMATIC TAX
                              </Typography>
                            </Tooltip>
                          }
                          sx={{
                            textAlign: "center",
                            width: 200,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  {/*    <Grid
                    item
                    sm={6}
                    xs={12}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="GenRegNo"
                      control={control}
                      defaultValue={"N"}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                textAlign: "center",
                                width: 20,
                                mr: 1,
                              }}
                              checked={field.value === "Y"}
                              disabled={SaveUpdateName === "UPDATE"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "Y" : "N")
                              }
                            />
                          }
                          label={
                            <Tooltip title=" GENERATE EXCISE REG. NO.">
                              <Typography noWrap>
                                GENERATE EXCISE REG. NO.
                              </Typography>
                            </Tooltip>
                          }
                          sx={{
                            textAlign: "center",
                            width: 200,
                          }}
                        />
                      )}
                    />
                  </Grid> */}
                  {GenerateExciseNo === "Y" && (
                    <Grid
                      item
                      sm={6}
                      xs={12}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                      justifyContent="center"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Grid
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                        ml={-1}
                        sx={{ width: 250 }}
                      >
                        <Controller
                          name="MatType"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSelectTextField1
                              label=""
                              data={[
                                { key: "1", value: "Raw Material" },
                                { key: "2", value: "Capital Goods" },
                                { key: "3", value: "Finished Gooods" },
                              ]}
                              {...field}
                              sx={{ width: "75%" }}
                              error={!!error}
                              helperText={error ? error.message : null}
                              disabled={SaveUpdateName === "UPDATE"}
                            />
                          )}
                        />

                        <Controller
                          name="ExciseNumberField"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextFieldLarge
                              label=""
                              type="text"
                              {...field}
                              readOnly
                              inputProps={{
                                maxLength: 15,
                                onInput: (e) => {
                                  if (e.target.value.length > 15) {
                                    e.target.value = e.target.value.slice(
                                      0,
                                      15
                                    );
                                  }
                                },
                              }}
                              sx={{ width: "35%" }}
                              error={!!error}
                              helperText={error ? error.message : null}
                              disabled={SaveUpdateName === "UPDATE"}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Grid>
                <Box
                  sx={{
                    border: "1px solid gray",
                    p: 1,
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ pb: 1 }}>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: "green",
                        borderRadius: "20%",
                        color: "white",
                      }}
                      onClick={addRow}
                      disabled={SaveUpdateName === "UPDATE"}
                    >
                      <AddOutlinedIcon />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      height: "60vh",
                    }}
                  >
                    <Box
                      sx={{
                        flexGrow: 1,
                        overflowX: "auto",
                        overflowY: "auto",
                        width: "100%",
                        height: "100%",
                        minHeight: "300px",
                        maxHeight: "500px",
                      }}
                    >
                      <DataGrid
                        className="datagrid-style"
                        columns={modalcolumnsTab0}
                        rows={JERows}
                        getRowClassName={(params) =>
                          params.row.isTaxLine ? "taxline-row" : ""
                        }
                        getRowId={(row) => row.id || row.LineNum}
                        autoHeight={false}
                        // initialState={{
                        //   pagination: {
                        //     paginationModel: { pageSize: 100 },
                        //   },
                        // }}
                        // pageSizeOptions={[10]}
                        sx={{
                          minHeight: 300,
                          "& .MuiDataGrid-cell": {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                          },
                          "& .taxline-row": {
                            backgroundColor: "#E7E7E7",
                            color: "#003366",
                            fontStyle: "italic",
                            fontWeight: "600",
                            borderLeft: "4px solid #0077cc",
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: "lightgray",
                        p: 2,
                        fontWeight: "bold",
                      }}
                    >
                      <Grid container spacing={2}>
                        {/* === First Row: Debit & Credit === */}
                        <Grid
                          item
                          xs={4}
                          textAlign="center"
                          sx={{ color: "black" }}
                        >
                          Debit:{" "}
                          {JERows.reduce(
                            (sum, r) => sum + (parseFloat(r.Debit) || 0),
                            0
                          ).toFixed(2)}
                          &nbsp;&nbsp;&nbsp; Credit:{" "}
                          {JERows.reduce(
                            (sum, r) => sum + (parseFloat(r.Credit) || 0),
                            0
                          ).toFixed(2)}
                        </Grid>

                        <Grid
                          item
                          xs={4}
                          textAlign="center"
                          sx={{ color: "black" }}
                        >
                          {displayInFc === "Y" && (
                            <>
                              Debit (FC):{" "}
                              {JERows.reduce(
                                (sum, r) => sum + (parseFloat(r.FCDebit) || 0),
                                0
                              ).toFixed(2)}
                              &nbsp;&nbsp;&nbsp; Credit (FC):{" "}
                              {JERows.reduce(
                                (sum, r) => sum + (parseFloat(r.FCCredit) || 0),
                                0
                              ).toFixed(2)}
                            </>
                          )}
                        </Grid>

                        <Grid
                          item
                          xs={4}
                          textAlign="center"
                          sx={{ color: "black" }}
                        >
                          {displayInSc === "Y" && (
                            <>
                              Debit (SC):{" "}
                              {JERows.reduce(
                                (sum, r) => sum + (parseFloat(r.SYSDeb) || 0),
                                0
                              ).toFixed(2)}
                              &nbsp;&nbsp;&nbsp; Credit (SC):{" "}
                              {JERows.reduce(
                                (sum, r) => sum + (parseFloat(r.SYSCred) || 0),
                                0
                              ).toFixed(2)}
                            </>
                          )}
                        </Grid>

                        {/* === Second Row: Differences / Balanced === */}
                        <Grid
                          item
                          xs={4}
                          textAlign="center"
                          sx={{ color: "black" }}
                        >
                          {(() => {
                            const debit = JERows.reduce(
                              (s, r) => s + (parseFloat(r.Debit) || 0),
                              0
                            );
                            const credit = JERows.reduce(
                              (s, r) => s + (parseFloat(r.Credit) || 0),
                              0
                            );
                            const diff = Math.abs(debit - credit).toFixed(2);
                            return debit === credit
                              ? "Balanced"
                              : debit > credit
                              ? `Diff (LC Debit): ${diff}`
                              : `Diff (LC Credit): ${diff}`;
                          })()}
                        </Grid>

                        <Grid
                          item
                          xs={4}
                          textAlign="center"
                          sx={{ color: "black" }}
                        >
                          {displayInFc === "Y" &&
                            (() => {
                              const debit = JERows.reduce(
                                (s, r) => s + (parseFloat(r.FCDebit) || 0),
                                0
                              );
                              const credit = JERows.reduce(
                                (s, r) => s + (parseFloat(r.FCCredit) || 0),
                                0
                              );
                              const diff = Math.abs(debit - credit).toFixed(2);
                              return debit === credit
                                ? "Balanced"
                                : debit > credit
                                ? `Diff (FC Debit): ${diff}`
                                : `Diff (FC Credit): ${diff}`;
                            })()}
                        </Grid>

                        <Grid
                          item
                          xs={4}
                          textAlign="center"
                          sx={{ color: "black" }}
                        >
                          {displayInSc === "Y" &&
                            (() => {
                              const debit = JERows.reduce(
                                (s, r) => s + (parseFloat(r.SYSDeb) || 0),
                                0
                              );
                              const credit = JERows.reduce(
                                (s, r) => s + (parseFloat(r.SYSCred) || 0),
                                0
                              );
                              const diff = Math.abs(debit - credit).toFixed(2);
                              return debit === credit
                                ? "Balanced"
                                : debit > credit
                                ? `Diff (SC Debit): ${diff}`
                                : `Diff (SC Credit): ${diff}`;
                            })()}
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Box>
                <Grid container>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Memo"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <InputTextFieldLarge
                          {...field}
                          size="small"
                          label="REMARK"
                          sx={{ width: 300 }}
                          inputProps={{ maxLength: 254 }}
                          rows={3}
                          multiline
                          fullWidth
                          disabled={SaveUpdateName === "UPDATE"}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DisplayFC"
                      control={control}
                      defaultValue={"N"} // Changed to N as per initialFormValues
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value === "Y"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "Y" : "N")
                              }
                              // disabled={SaveUpdateName === "UPDATE"}
                            />
                          }
                          label="DISPLAY IN FC"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DisplaySC"
                      control={control}
                      defaultValue={"N"} // Changed to N as per initialFormValues
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value === "Y"}
                              onChange={(e) =>
                                field.onChange(e.target.checked ? "Y" : "N")
                              }
                              // disabled={SaveUpdateName === "UPDATE"}
                            />
                          }
                          label="DISPLAY IN SC"
                        />
                      )}
                    />
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
              <Button
                variant="contained"
                type="submit"
                name={SaveUpdateName}
                color="success"
                sx={{ color: "white" }}
              >
                {SaveUpdateName}
              </Button>
              {/* <Button
                variant="contained"
                disabled={SaveUpdateName === "SAVE"} // Disable delete if in SAVE mode
                color="error"
                onClick={handleOnDelete}
              >
                DELETE
              </Button> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
