import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete"; // Import DeleteIcon
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ViewListIcon from "@mui/icons-material/ViewList";

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import {
  DataGrid,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import {
  InputTextField,
  MultiSelectTextField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { GridEditInputCell } from "@mui/x-data-grid";
import { DatePicker } from "antd";
export default function BPOpeningBalance() {
  const theme = useTheme();
  const perms = usePermissions(166);
  const { user, companyData } = useAuth();

  // ===================================== Component States =====================================
  // const [seriesdata, setSeriesdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [periodInfo, setPeriodInfo] = useState(null);

  const [GLDeterminationList, setGLDeterminationList] = useState([]);
  const [opBalAcctCurrency, setOpBalAcctCurrency] = useState(null); // store ActCurr

  const [CustomerGroupList, setCustomerGroupList] = useState([]);
  const [VendorGroupList, setVendorGroupList] = useState([]);

  const [bpobLinesState, setBpobLinesState] = useState([]); // state for BPOB grid

  // ===================================== Opening Balance Account Modal States (Original LC Account) =====================================
  const [isLCAcctDialogOpen, setIsLCAcctDialogOpen] = useState(false);
  const [lcAcctSearchText, setLcAcctSearchText] = useState("");
  const [lcAcctCurrentPage, setLcAcctCurrentPage] = useState(0);
  const [lcAcctRowCount, setLcAcctRowCount] = useState(0);
  const [lcAcctLoading, setLcAcctLoading] = useState(false);
  const [lcAcctRows, setLcAcctRows] = useState([]); // These are for the main OPBalAcct field
  const LC_ACCT_LIMIT = 20;

  // ===================================== Control Account Modal States (NEW) =====================================
  const [isControlAcctDialogOpen, setIsControlAcctDialogOpen] = useState(false);
  const [controlAcctSearchText, setControlAcctSearchText] = useState("");
  const [controlAcctCurrentPage, setControlAcctCurrentPage] = useState(0);
  const [controlAcctRowCount, setControlAcctRowCount] = useState(0);
  const [controlAcctLoading, setControlAcctLoading] = useState(false);
  const [controlAcctRows, setControlAcctRows] = useState([]); // These are for the DataGrid ControlAcct column
  const CONTROL_ACCT_LIMIT = 20;
  const [clearCache, setClearCache] = useState(false);

  // State to track which DataGrid row's Control Acct is being edited
  const [editingControlAcctRowId, setEditingControlAcctRowId] = useState(null);

  // NEW STATE FOR MODAL SELECTION
  const [modalSelectedRowIds, setModalSelectedRowIds] = useState([]);
  const lcAcctPageCache = useRef({}); // Cache for LC Account modal pages
  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  const [exchangeRateModalOpen, setExchangeRateModalOpen] = useState(false);
  const [exchangeRateModalData, setExchangeRateModalData] = useState({
    RateDate: null,
    Currency: "",
    DocEntry: "",
  });
  const [manualRate, setManualRate] = useState("");
  const [isSavingManualRate, setIsSavingManualRate] = useState(false);
  const [systemCurrencyRate, setSystemCurrencyRate] = useState(null);
  const [foreignCurrencyRates, setForeignCurrencyRates] = useState({});
  const alertRef = useRef(null);

  // Add a state to track if the component is mounted or active
  const [isComponentActive, setIsComponentActive] = useState(true);
  const apiRef = useGridApiRef();
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
  // ===================================== React Hook Form Setup =====================================
  const { control, handleSubmit, reset, setValue, watch, getValues } = useForm({
    defaultValues: {
      OPBalAcct: "",
      Date: periodInfo?.F_RefDate,
      Remarks: "",
      Customer: 1,
      VENDOR: 1,
      CustomerGroup: [],
      VendorGroup: [],
      BPOBLines: [],
      BPOBModalLines: [],
      BPOBModalRowCount: 0,
      BPOBModalCurrentPage: 0,
      BPOBModalSearchText: "",
    },
  });

  const BPOBModalLines = watch("BPOBModalLines");
  const BPOBModalRowCount = watch("BPOBModalRowCount");
  const BPOBModalSearchText = watch("BPOBModalSearchText");
  const formDate = watch("Date");

  const selectedRowIdsRef = useRef([]);
  const BPOBPageCache = useRef({});
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  // ===================================== API Calls =====================================
  // const SeriesData = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await apiClient.get(`/DocSeries/ByTransId/30`);
  //     if (res.data.success) {
  //       setSeriesdata(res.data.values);
  //     } else {
  //       Swal.fire(
  //         "Error",
  //         res.data.message || "Failed to fetch Series!",
  //         "warning"
  //       );
  //     }
  //   } catch (error) {
  //     Swal.fire("Error", error.message || "Failed to fetch Series!", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const rawDate = watch("Date");

  const formattedDate = rawDate ? dayjs(rawDate).format("YYYY-MM-DD") : null;

  const { DocSeries } = useDocumentSeries(
    "30",
    formattedDate,
    setValue,
    clearCache,
    "SAVE",
  );

  const fetchExchangeRate = useCallback(async (date, currency) => {
    if (!date || !currency) {
      Swal.fire({
        icon: "warning",
        title: "Missing Data",
        text: "Date or Currency is missing to get Exchange Rate!",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setLoading(true);
      const formattedDate = dayjs(date).format("MM/DD/YYYY");

      const res = await apiClient.get(
        `/ExchangeRatesandIndexes/GetCurrOnDate?RateDate=${formattedDate}&Currency=${currency}`,
      );

      if (res.data.success && res.data.values?.length > 0) {
        const rate = res.data.values[0].Rate;
        const ERDocEntry = res.data.values[0].DocEntry;
        if (rate && rate !== 0) {
          return rate;
        } else {
          setExchangeRateModalData({
            RateDate: date,
            Currency: currency,
            DocEntry: ERDocEntry,
          });
          setManualRate(""); // Clear previous manual rate
          setExchangeRateModalOpen(true);
          return null; // Indicate invalid rate
        }
      } else {
        setExchangeRateModalData({ RateDate: date, Currency: currency });
        setManualRate(""); // Clear previous manual rate
        setExchangeRateModalOpen(true);
        return null; // Indicate that rate was not found
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.message || "Failed to fetch exchange rate!",
        "error",
      );
      return null; // Indicate error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveManualRate = async () => {
    if (!manualRate || isNaN(Number(manualRate))) {
      Swal.fire(
        "Validation Error",
        "Please enter a valid number for the rate.",
        "warning",
      );
      return;
    }

    setIsSavingManualRate(true);
    try {
      setLoading(true);
      const payload = [
        {
          DocEntry: String(exchangeRateModalData.DocEntry),
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
        payload,
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Exchange rate saved successfully!",
          timer: 1000, // time in milliseconds
          showConfirmButton: false,
        });
        setExchangeRateModalOpen(false);
        // After saving, re-attempt to fetch the rate to update the grid calculations
        // This will trigger handleBPOBFieldBlur again for the affected row
        // You might need to re-trigger the blur event for the field that initiated this.
        // For simplicity, we can just close the modal and let the user re-trigger if needed,
        // or you can store the row/field context and re-call handleBPOBFieldBlur.
        // For now, let's just close the modal.
      } else {
        Swal.fire(
          "Error",
          res.data.message || "Failed to save exchange rate!",
          "error",
        );
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.message || "Failed to save exchange rate!",
        "error",
      );
    } finally {
      setIsSavingManualRate(false);
      setLoading(false);
    }
  };

  const fetchBPOBeningBalance = useCallback(
    async ({ page = 0, search = "", forceRefresh = false } = {}) => {
      const currentCustomerGroups = getValues("CustomerGroup") || [];
      const currentVendorGroups = getValues("VendorGroup") || [];
      const currentIsCustomerChecked = getValues("Customer") === 1;
      const currentIsVendorChecked = getValues("VENDOR") === 1;

      const cacheKey = `${page}_${search}_${currentIsCustomerChecked}_${currentIsVendorChecked}_${currentCustomerGroups.join(
        ",",
      )}_${currentVendorGroups.join(",")}`;

      if (!forceRefresh && BPOBPageCache.current[cacheKey]) {
        setValue("BPOBModalLines", BPOBPageCache.current[cacheKey]);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (currentIsCustomerChecked && !currentIsVendorChecked)
          params.append("CardType", "C");
        else if (!currentIsCustomerChecked && currentIsVendorChecked)
          params.append("CardType", "V");

        params.append("Status", 1);
        [...currentCustomerGroups, ...currentVendorGroups].forEach((gc) =>
          params.append("GroupCode", gc),
        );
        params.append("Page", page);
        params.append("Limit", LC_ACCT_LIMIT);
        if (search) params.append("SearchText", search);

        const url = `/BPV2?${params.toString()}`;
        const res = await apiClient.get(url);
        const data = res.data;

        if (data.success) {
          if (!data.values || data.values.length === 0) {
            Swal.fire({
              title: "No Record Found",
              text: "No business partner records found.",
              icon: "info",
              confirmButtonText: "OK",
            });
            setValue("BPOBModalLines", []);
            setValue("BPOBModalRowCount", 0);
            return;
          }

          const records = data.values.map((item, index) => ({
            id: item.DocEntry || `temp-${index + 1 + page * LC_ACCT_LIMIT}`, // Ensure unique IDs
            DocEntry: item.DocEntry,
            DueDate: formDate ? dayjs(formDate).format("DD/MM/YYYY") : "",
            Code: item.CardCode || "",
            Name: item.CardName || "",
            ControlAcct: item.DebPayAcct || "",
            Balance: item.Balance || 0,
            BalanceFC: item.BalanceFC || 0,
            BalanceSC: item.BalanceSys || 0,
            Currency: item.Currency,
            OB: 0,
            OBFC: 0,
            OBSC: 0,
          }));

          BPOBPageCache.current = {
            ...BPOBPageCache.current,
            [cacheKey]: records,
          };

          setValue("BPOBModalLines", records);
          setValue(
            "BPOBModalRowCount",
            records.length < LC_ACCT_LIMIT
              ? page * LC_ACCT_LIMIT + records.length
              : 1000,
          );
        } else {
          Swal.fire(
            "Error",
            data.message || "Failed to fetch Business Partners!",
            "warning",
          );
        }
      } catch (err) {
        Swal.fire(
          "Error",
          err.message ||
            "Something went wrong while fetching Business Partners.",
          "error",
        );
      } finally {
        setLoading(false);
      }
    },
    [getValues, setValue, formDate],
  );

  const findAccount = async (acctCode) => {
    for (let page = 0; ; page++) {
      const params = new URLSearchParams({
        Status: 1,
        Page: page,
        Limit: LC_ACCT_LIMIT,
        LocManTran: "N",
      });

      const res = await apiClient.get(`/ChartOfAccounts?${params.toString()}`);
      const data = res.data;

      if (!data.success) return null;

      const accounts = data.values || [];
      const match = accounts.find((acc) => acc.AcctCode === String(acctCode));
      if (match) return match; // ✅ return full account object

      if (accounts.length < LC_ACCT_LIMIT) return null; // no more pages
    }
  };
  useEffect(() => {
    if (!GLDeterminationList || GLDeterminationList.length === 0) return;

    const initOPBalAcct = async () => {
      const acctCode = GLDeterminationList?.[0]?.["LinkAct_18"];
      if (!acctCode) {
        Swal.fire({
          icon: "warning",
          title: "Missing Configuration",
          text: "Opening Balance Account (LinkAct_18) is not configured in GL Determination.",
        });
        return;
      }

      const account = await findAccount(acctCode);
      if (account) {
        setValue("OPBalAcct", account.AcctCode, { shouldValidate: true });

        setOpBalAcctCurrency(account.ActCurr);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Account Not Found",
          text: `Account ${acctCode} not found in Chart of Accounts.`,
        });
      }
    };

    initOPBalAcct();
  }, [GLDeterminationList, setValue]);
  // Inside BPOpeningBalance component
  // MODIFIED: This function now only fetches for the main Opening Balance Account field
  const fetchInitialLCAccts = useCallback(async ({ page = 0, search = "" }) => {
    setLcAcctLoading(true);
    try {
      setLoading(true);

      const cacheKey = `${page}_${search}`; // Create a unique key for the cache

      // Check if data for this page and search is already in cache
      if (lcAcctPageCache.current[cacheKey]) {
        setLcAcctRows(lcAcctPageCache.current[cacheKey].rows);
        setLcAcctRowCount(lcAcctPageCache.current[cacheKey].rowCount);
        return; // Exit if data is cached
      }

      const params = new URLSearchParams();
      params.append("Status", 1);
      params.append("Page", page);
      params.append("Limit", LC_ACCT_LIMIT);
      params.append("LocManTran", "N");

      if (search) params.append("SearchText", search);

      const url = `/ChartOfAccounts?${params.toString()}`;
      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success === true) {
        const accounts = data?.values || [];
        const newRowCount =
          accounts.length < LC_ACCT_LIMIT
            ? page * LC_ACCT_LIMIT + accounts.length
            : 1000;

        // Store in cache
        lcAcctPageCache.current[cacheKey] = {
          rows: accounts,
          rowCount: newRowCount,
        };

        setLcAcctRows(accounts);
        setLcAcctRowCount(newRowCount);
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLcAcctLoading(false);
      setLoading(false);
    }
  }, []); // Add lcAcctPageCache to dependencies if it's not a ref, but it is, so no need.

  // NEW: Function to fetch accounts specifically for the DataGrid Control Account column
  const fetchControlAccts = useCallback(async ({ page = 0, search = "" }) => {
    setControlAcctLoading(true);
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("Status", 1);
      params.append("Page", page);
      params.append("Limit", CONTROL_ACCT_LIMIT);
      params.append("LocManTran", "Y"); // Manual accounts for Control Acct
      params.append("GroupMask", "1,2"); // Specific group mask for Control Acct

      if (search) params.append("SearchText", search);

      const url = `/ChartOfAccounts?${params.toString()}`;
      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success === true) {
        const accounts = data?.values || [];
        setControlAcctRows(accounts);
        setControlAcctRowCount(
          accounts.length < CONTROL_ACCT_LIMIT
            ? page * CONTROL_ACCT_LIMIT + accounts.length
            : 1000,
        );
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Error while fetching Control accounts:",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setControlAcctLoading(false);
      setLoading(false);
    }
  }, []);

  const getCustomerGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/BusinessPartnerGroup/ByGroupType/C`);
      if (res.data.success) {
        setCustomerGroupList(
          res.data.values?.filter((dept) => dept.Status === "1") || [],
        );
      } else {
        Swal.fire({
          icon: "warning",
          title: "Error",
          text: res.data.message || "Failed to fetch Customer Groups.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch Customer Groups.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getVendorGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/BusinessPartnerGroup/ByGroupType/V`);
      if (res.data.success) {
        setVendorGroupList(
          res.data.values?.filter((dept) => dept.Status === "1") || [],
        );
      } else {
        Swal.fire({
          icon: "warning",
          title: "Error",
          text: res.data.message || "Failed to fetch Vendor Groups.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch Vendor Groups.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsComponentActive(true);
    return () => {
      setIsComponentActive(false);
      if (alertRef.current) {
        alertRef.current.close();
      }
    };
  }, []);
  const getPeriodAndGlInfo = useCallback(async () => {
    setLoading(true);
    try {
      setLoading(true);
      const glRes = await apiClient.get(`/GLAccDetermination/All`);
      if (!glRes.data.success) {
        alertRef.current = Swal.fire({
          icon: "warning",
          title: "Error",
          text:
            glRes.data.message ||
            "Failed to fetch GL Account Determination data.",
          showConfirmButton: false,
          showCancelButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            if (!isComponentActive) {
              alertRef.current.close();
            }
          },
        });
        return;
      }

      const list =
        glRes.data.values?.filter((dept) => dept.Status === "1") || [];
      setGLDeterminationList(list);

      const firstRecord = list[0];
      if (firstRecord) {
        const { F_RefDate, PeriodName, PeriodCat } = firstRecord;

        const ppRes = await apiClient.get(`/PostingPeriod/All`);
        if (ppRes.data.success) {
          const matchedPeriod = ppRes.data.values?.find(
            (p) => p.Name === PeriodName && p.Category === PeriodCat,
          );
          if (matchedPeriod) {
            setPeriodInfo({ F_RefDate, DocEntry: matchedPeriod.DocEntry });
            setValue("Date", new Date(F_RefDate).toISOString());
          }
        }

        // Check if default opening balance account is set
        const acctCode = firstRecord["LinkAct_18"];
        const PeriodCategory = firstRecord["PeriodName"];
        if (acctCode) {
          const account = await findAccount(acctCode);
          if (account) {
            setValue("OPBalAcct", account.AcctCode, { shouldValidate: true });
            setOpBalAcctCurrency(account.ActCurr);
          }
        } else {
          alertRef.current = Swal.fire({
            icon: "warning",
            title: "Missing Configuration",
            text: `Default Opening Balance Account is not configured for Period Category ${PeriodCategory} in GL Account Determination `,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
              if (!isComponentActive) {
                alertRef.current.close();
              }
            },
          });
        }
      }
    } catch (error) {
      alertRef.current = Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch GL/Period Info.",
        showConfirmButton: false,
        showCancelButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          if (!isComponentActive) {
            alertRef.current.close();
          }
        },
      });
    } finally {
      setLoading(false);
    }
  }, [isComponentActive]);

  // ===================================== Handlers =====================================

  const handleClickOpen = () => {
    const currentBpobLineIds = bpobLinesState.map((row) => row.id);
    setModalSelectedRowIds(currentBpobLineIds); // Pre-select rows already in the main grid
    setIsModalOpen(true);
  };
  const closeModel = async () => {
    if (modalSelectedRowIds.length > 0) {
      const result = await Swal.fire({
        title: "Unsaved Selections",
        text: "You have selected rows that have not been saved. Do you want to discard them?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, discard",
        cancelButtonText: "No, keep open",
      });
      if (result.isConfirmed) {
        setModalSelectedRowIds([]); // Clear selections on discard
        setIsModalOpen(false);
      }
      // If not confirmed, do nothing (modal stays open)
    } else {
      setIsModalOpen(false);
    }
  };

  // MODIFIED: This handler now only for the main Opening Balance Account field
  const handleOpeningBalAcctSelection = useCallback(
    (params) => {
      const selectedAccount = params.row;
      if (selectedAccount) {
        setValue("OPBalAcct", selectedAccount.AcctCode);
        setOpBalAcctCurrency(selectedAccount.ActCurr);
        setIsLCAcctDialogOpen(false);
      }
    },
    [setValue],
  );

  // NEW: Handler for selecting a Control Account from its dedicated modal
  const handleControlAcctRowSelection = useCallback(
    (params) => {
      const selectedAccount = params.row;
      if (selectedAccount && editingControlAcctRowId) {
        setBpobLinesState((prev) =>
          prev.map((row) =>
            row.id === editingControlAcctRowId
              ? { ...row, ControlAcct: selectedAccount.AcctCode }
              : row,
          ),
        );
        setEditingControlAcctRowId(null); // Reset editing state
        setIsControlAcctDialogOpen(false);
      }
    },
    [editingControlAcctRowId],
  );

  const handleLCAcctPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== lcAcctCurrentPage) {
        setLcAcctCurrentPage(model.page);
      }
    },
    [lcAcctCurrentPage],
  );

  const handleLCAcctSearchChange = useCallback((search) => {
    setLcAcctSearchText(search);
    setLcAcctCurrentPage(0);
    lcAcctPageCache.current = {};
  }, []);

  // NEW: Handlers for Control Account modal pagination and search
  const handleControlAcctPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== controlAcctCurrentPage) {
        setControlAcctCurrentPage(model.page);
      }
    },
    [controlAcctCurrentPage],
  );

  const handleControlAcctSearchChange = useCallback((search) => {
    setControlAcctSearchText(search);
    setControlAcctCurrentPage(0);
  }, []);

  const handleBPOBPageChange = useCallback(
    (model) => {
      const newPage = model.page;
      setValue("BPOBModalCurrentPage", newPage);
      fetchBPOBeningBalance({ page: newPage, search: BPOBModalSearchText });
    },
    [fetchBPOBeningBalance, BPOBModalSearchText, setValue],
  );

  const handleBPOBSearchChange = useCallback(
    (search) => {
      setValue("BPOBModalSearchText", search);
      setValue("BPOBModalCurrentPage", 0);
      // Trigger a fetch with the new search text
      fetchBPOBeningBalance({ page: 0, search: search, forceRefresh: true });
    },
    [setValue, fetchBPOBeningBalance],
  );

  const clearFormData = useCallback(() => {
    const currentOPBalAcct = getValues("OPBalAcct");

    reset({
      OPBalAcct: currentOPBalAcct,
      Date: periodInfo?.F_RefDate,
      Remarks: "",
      Customer: 1,
      VENDOR: 1,
      // CustomerGroup: [],
      // VendorGroup: [],
      BPOBLines: [],
      BPOBModalLines: [],
      BPOBModalRowCount: 0,
      BPOBModalCurrentPage: 0,
      BPOBModalSearchText: "",
    });
    selectedRowIdsRef.current = [];
    BPOBPageCache.current = {};
    setBpobLinesState([]); // Clear BPOB lines on form clear
    setModalSelectedRowIds([]); // Clear modal selection on form clear
  }, [periodInfo, reset, getValues]);

  const handleSubmitForm = async (data) => {
    if (!bpobLinesState || bpobLinesState.length === 0) {
      Swal.fire({
        title: "Validation Error!",
        text: "At least one Business Partner Opening Balance line is required before submitting.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return; // Stop form submission
    }

    const cardCodes = bpobLinesState.map((line) => line.Code); // assuming "Code" = CardCode
    const duplicates = cardCodes.filter(
      (code, index) => cardCodes.indexOf(code) !== index,
    );

    if (duplicates.length > 0) {
      Swal.fire({
        title: "Validation Error!",
        text: `Duplicate Business Partner(s) found with CardCode: ${[
          ...new Set(duplicates),
        ].join(", ")}.`,
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return; // Stop form submission
    }
    for (const line of bpobLinesState) {
      if (!line.DueDate) {
        Swal.fire({
          title: "Validation Error!",
          text: `Due Date is required for Business Partner: ${line.Name} (${line.Code}).`,
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }
      if (!line.ControlAcct) {
        Swal.fire({
          title: "Validation Error!",
          text: `Control Account is required for Business Partner: ${line.Name} (${line.Code}).`,
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      // --- New Account Currency Validation ---
      const localCurrency = companyData?.MainCurncy;
      const systemCurrency = companyData?.SysCurrncy;
      const bpCurrency = line.Currency;

      // // Use lcAcctRows for main OPBalAcct and controlAcctRows for DataGrid ControlAcct
      const controlAcctDetails = controlAcctRows.find(
        (row) => String(row.AcctCode) === String(line.ControlAcct),
      );

      let validationFailed = false;
      let validationMessage = "";

      if (bpCurrency !== localCurrency && bpCurrency !== "AC") {
        // ✅ Corrected condition
        // Validate Control Account (if needed, uncomment and adjust)
        if (
          controlAcctDetails &&
          controlAcctDetails.ActCurr !== "AC" &&
          controlAcctDetails.ActCurr !== bpCurrency
        ) {
          validationFailed = true;
          validationMessage = `For Business Partner "${line.Name}" (${line.Code}) with currency "${bpCurrency}", the Control Account "${line.ControlAcct}" must have an Account Currency equal to "${bpCurrency}" or "AC".`;
        }
        debugger;
        // Validate Opening Balance Account
        if (
          !validationFailed &&
          opBalAcctCurrency &&
          opBalAcctCurrency !== "AC" &&
          opBalAcctCurrency !== bpCurrency
        ) {
          validationFailed = true;
          validationMessage = `For Business Partner "${line.Name}" (${line.Code}) with currency "${bpCurrency}", the Opening Balance Account "${data.OPBalAcct}" must have an Account Currency equal to "${bpCurrency}" or "All Currencies".`;
        }
      }

      if (validationFailed) {
        Swal.fire({
          title: "Validation Error!",
          text: validationMessage,
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return; // Stop form submission
      }
      // --- End New Account Currency Validation ---
    }

    const formattedDate = data.Date
      ? dayjs(data.Date).format("DD/MM/YYYY")
      : null;
    const journalEntriesToPost = [];
    console.log("bpoblinesstate", bpobLinesState);
    for (const line of bpobLinesState) {
      const obLC = Number(line.OB);
      const obFC = Number(line.OBFC);
      const obSC = Number(line.OBSC);
      const isNegativeBalance = obLC < 0 || obFC < 0 || obSC < 0;

      const controlAccountLine = {
        LineNum: "0",
        DocEntry: "0", // Will be set by backend on creation
        UserId: user.UserId,
        CreatedBy: user.UserName || "",
        CreatedDate: dayjs().format("YYYY/MM/DD"),
        ModifiedBy: user.UserName || "",
        ModifiedDate: dayjs().format("YYYY/MM/DD"),
        Status: "0",
        Account: line.ControlAcct,
        Debit: isNegativeBalance ? "0" : String(obLC),
        Credit: isNegativeBalance ? String(Math.abs(obLC)) : "0",
        SYSCred: isNegativeBalance ? String(Math.abs(obSC)) : "0",
        SYSDeb: isNegativeBalance ? "0" : String(obSC),
        FCDebit: isNegativeBalance ? "0" : String(obFC),
        FCCredit: isNegativeBalance ? String(Math.abs(obFC)) : "0",
        FCCurrency: line.Currency,
        ContraAct: data.OPBalAcct,
        LineMemo: `BP Opening Balance`, // More specific memo
        Ref3Line: "0", // Placeholder
        TransType: "-2",
        BaseRef: "0", // Placeholder
        Project: "0", // Placeholder
        TaxDate: formattedDate,
        SystemRate: "0",
        MthDate: dayjs().format("YYYY/MM/DD"), // Placeholder
        ToMthSum: "0", // Placeholder
        BatchNum: "0", // Placeholder
        FinncPriod: String(DocSeries?.[0]?.FinncPriod ?? "0"),
        PIndicator: String(DocSeries?.[0]?.PIndicator ?? "0"),
        VatGroup: "0", // Placeholder
        BaseSum: "0", // Placeholder
        VatRate: "0", // Placeholder
        Indicator: "0", // Placeholder
        AdjTran: "0", // Placeholder
        RevSource: "0", // Placeholder
        ObjType: "30", // Journal Entry Line
        VatDate: formattedDate,
        SYSBaseSum: "0", // Placeholder
        VatLine: "0", // Placeholder
        VatAmount: "0", // Placeholder
        SYSVatSum: "0", // Placeholder
        GrossValue: "0", // Placeholder
        DebCred: isNegativeBalance ? "C" : "D",
        StornoAcc: "0", // Placeholder
        BalDueDeb: isNegativeBalance ? "0" : String(obLC),
        BalDueCred: isNegativeBalance ? String(Math.abs(obLC)) : "0",
        BalFcDeb: isNegativeBalance ? "0" : String(obFC),
        BalFcCred: isNegativeBalance ? String(Math.abs(obFC)) : "0",
        BalScDeb: isNegativeBalance ? "0" : String(obSC),
        BalScCred: isNegativeBalance ? String(Math.abs(obSC)) : "0",
        IsNet: "N", // Placeholder
        TaxType: "0", // Placeholder
        TaxPostAcc: "0", // Placeholder
        StaCode: "0", // Placeholder
        StaType: "0", // Placeholder
        TaxCode: "0", // Placeholder
        GrossValFc: "0", // Placeholder
        OcrCode2: "0", // Placeholder
        OcrCode3: "0", // Placeholder
        OcrCode4: "0", // Placeholder
        OcrCode5: "0", // Placeholder
        CenVatCom: "0", // Placeholder
        MatType: "0", // Placeholder
        Location: "0", // Placeholder
        WTaxCode: "0", // Placeholder
        TotalVat: "0", // Placeholder
        SYSTVat: "0", // Placeholder
        WTLiable: "N", // Placeholder
        WTLine: "N", // Placeholder
        WTApplied: "0", // Placeholder
        WTAppliedS: "0", // Placeholder
        WTAppliedF: "0", // Placeholder
        WTSum: "0", // Placeholder
        WTSumFC: "0", // Placeholder
        WTSumSC: "0", // Placeholder
        PayBlock: "N", // Placeholder
        PayBlckRef: "0", // Placeholder
        LicTradNum: "0", // Placeholder
        InterimTyp: "0", // Placeholder
        DprId: "0", // Placeholder
        MatchRef: "0", // Placeholder
        VatRegNum: "0", // Placeholder
        SLEDGERF: "0", // Placeholder
        DocNum: String(DocSeries?.[0]?.DocNum ?? "0"),
        ShortName: line.Code,
        DueDate: line.DueDate ? dayjs(line.DueDate).format("YYYY/MM/DD") : null,
        ActType: "B",
      };

      // --- Line 2: Opening Balance Account ---
      const openingBalanceAccountLine = {
        LineNum: "0",
        DocEntry: "0",
        UserId: user.UserId,
        CreatedBy: user.UserName || "",
        CreatedDate: dayjs().format("YYYY/MM/DD"),
        ModifiedBy: user.UserName || "",
        ModifiedDate: dayjs().format("YYYY/MM/DD"),
        Status: "0",
        Account: data.OPBalAcct,
        Debit: isNegativeBalance ? String(Math.abs(obLC)) : "0",
        Credit: isNegativeBalance ? "0" : String(obLC),
        SYSCred: isNegativeBalance ? "0" : String(obSC),
        SYSDeb: isNegativeBalance ? String(Math.abs(obSC)) : "0",
        FCDebit: isNegativeBalance ? String(Math.abs(obFC)) : "0",
        FCCredit: isNegativeBalance ? "0" : String(obFC),
        FCCurrency: line.Currency, // Use BP's currency for consistency, or local currency if OB account is always LC
        ContraAct: line.Code,
        LineMemo: `BP Opening Balance`, // More specific memo
        Ref3Line: "0", // Placeholder
        TransType: "-2",
        BaseRef: "0", // Placeholder
        Project: "0", // Placeholder
        TaxDate: formattedDate,
        SystemRate: "0",
        MthDate: dayjs().format("YYYY/MM/DD"), // Placeholder
        ToMthSum: "0", // Placeholder
        BatchNum: "0", // Placeholder
        FinncPriod: String(DocSeries?.[0]?.FinncPriod ?? "0"),
        PIndicator: String(DocSeries?.[0]?.PIndicator ?? "0"),
        VatGroup: "0", // Placeholder
        BaseSum: "0", // Placeholder
        VatRate: "0", // Placeholder
        Indicator: "0", // Placeholder
        AdjTran: "0", // Placeholder
        RevSource: "0", // Placeholder
        ObjType: "30", // Journal Entry Line
        VatDate: formattedDate,
        SYSBaseSum: "0", // Placeholder
        VatLine: "0", // Placeholder
        VatAmount: "0", // Placeholder
        SYSVatSum: "0", // Placeholder
        GrossValue: "0", // Placeholder
        DebCred: isNegativeBalance ? "D" : "C",
        StornoAcc: "0", // Placeholder
        BalDueDeb: isNegativeBalance ? String(Math.abs(obLC)) : "0",
        BalDueCred: isNegativeBalance ? "0" : String(obLC),
        BalFcDeb: isNegativeBalance ? String(Math.abs(obFC)) : "0",
        BalFcCred: isNegativeBalance ? "0" : String(obFC),
        BalScDeb: isNegativeBalance ? String(Math.abs(obSC)) : "0",
        BalScCred: isNegativeBalance ? "0" : String(obSC),
        IsNet: "N", // Placeholder
        TaxType: "0", // Placeholder
        TaxPostAcc: "0", // Placeholder
        StaCode: "0", // Placeholder
        StaType: "0", // Placeholder
        TaxCode: "0", // Placeholder
        GrossValFc: "0", // Placeholder
        OcrCode2: "0", // Placeholder
        OcrCode3: "0", // Placeholder
        OcrCode4: "0", // Placeholder
        OcrCode5: "0", // Placeholder
        CenVatCom: "0", // Placeholder
        MatType: "0", // Placeholder
        Location: "0", // Placeholder
        WTaxCode: "0", // Placeholder
        TotalVat: "0", // Placeholder
        SYSTVat: "0", // Placeholder
        WTLiable: "N", // Placeholder
        WTLine: "N", // Placeholder
        WTApplied: "0", // Placeholder
        WTAppliedS: "0", // Placeholder
        WTAppliedF: "0", // Placeholder
        WTSum: "0", // Placeholder
        WTSumFC: "0", // Placeholder
        WTSumSC: "0", // Placeholder
        PayBlock: "N", // Placeholder
        PayBlckRef: "0", // Placeholder
        LicTradNum: "0", // Placeholder
        InterimTyp: "0", // Placeholder
        DprId: "0", // Placeholder
        MatchRef: "0", // Placeholder
        VatRegNum: "0", // Placeholder
        SLEDGERF: "0", // Placeholder
        DocNum: String(DocSeries?.[0]?.DocNum ?? "0"),
        ShortName: data.OPBalAcct,
        DueDate: line.DueDate ? dayjs(line.DueDate).format("YYYY/MM/DD") : null,
        ActType: "A",
      };
      const jeObjectLines = [controlAccountLine, openingBalanceAccountLine];
      console.log("je object lines", jeObjectLines);
      for (const l of jeObjectLines) {
        const debit = parseFloat(l.Debit) || 0;
        const credit = parseFloat(l.Credit) || 0;
        if (debit === 0 && credit === 0) {
          await Swal.fire({
            title: "Validation Error!",
            text: `Each row must have at least a Debit or Credit value greater than 0.`,
            icon: "warning",
            confirmButtonText: "Ok",
          });
          return; // Stop form submission
        }
      }
      const jeObject = {
        DocEntry: "0",
        UserId: user.UserId,
        CreatedBy: user.UserName || "",
        CreatedDate: dayjs().format("YYYY/MM/DD"),
        ModifiedBy: user.UserName || "",
        ModifiedDate: dayjs().format("YYYY/MM/DD"),
        Status: "0",
        BatchNum: "0",
        TransId: "0",
        BtfStatus: "0",
        TransType: "-2",
        BaseRef: "0",
        RefDate: formattedDate || dayjs(undefined).format("YYYY-MM-DD"),
        Memo: String(data.Remarks),
        LocTotal: String(obLC),
        FcTotal: String(obFC),
        SysTotal: String(obSC),
        OrignCurr: "0",
        TransRate: "0",
        DueDate: formattedDate,
        TaxDate: formattedDate,
        FinncPriod: String(DocSeries?.[0]?.FinncPriod ?? "0"),
        PIndicator: String(DocSeries?.[0]?.PIndicator ?? "0"),
        ObjType: "0", // Journal Entry Header
        Indicator: "0", // Placeholder

        StornoDate: dayjs().format("YYYY/MM/DD"), // Placeholder
        StornoToTr: "0", // Placeholder
        AutoStorno: "N", // Placeholder
        Number: "0", // Placeholder, usually generated by SAP
        Ref1: "0", // Placeholder
        TransCurr: line.Currency || "", // Transaction currency is local currency
        AdjTran: "N", // Placeholder
        RevSource: "", // Placeholder
        VatDate: dayjs().format("YYYY/MM/DD"),
        StampTax: "0", // Placeholder
        AutoVAT: "N", // Placeholder
        DocSeries: String(DocSeries?.[0]?.DocEntry ?? "0"),
        GenRegNo: "0", // Placeholder
        RG23APart2: "0", // Placeholder
        RG23CPart2: "0", // Placeholder
        Location: "0", // Placeholder
        AutoWT: "N", // Placeholder
        WTSum: "0", // Placeholder
        WTSumSC: "0", // Placeholder
        WTSumFC: "0", // Placeholder
        WTApplied: "0", // Placeholder
        WTAppliedS: "0", // Placeholder
        WTAppliedF: "0", // Placeholder
        BaseAmnt: "0", // Placeholder
        BaseAmntSC: "0", // Placeholder
        BaseAmntFC: "0", // Placeholder
        BaseVtAt: "0", // Placeholder
        BaseVtAtSC: "0", // Placeholder
        BaseVtAtFC: "0", // Placeholder
        SSIExmpt: "N", // Placeholder
        AgrNo: "0", // Placeholder
        ECDPosTyp: "0", // Placeholder
        PTICode: "0", // Placeholder
        ExclTaxRep: "N", // Placeholder
        IsCoEntry: "N", // Placeholder
        AtcEntry: "0", // Placeholder
        Attachment: "0", // Placeholder
        Series: String(DocSeries?.[0]?.SeriesId ?? "0"),
        DocNum: String(DocSeries?.[0]?.DocNum ?? "0"),
        DocDate: dayjs().format("YYYY/MM/DD"),
        MatType: "0", // Placeholder
        FixExchRate: "N", // Placeholder
        oLines: [controlAccountLine, openingBalanceAccountLine],
      };
      journalEntriesToPost.push(jeObject);
    }

    const BULK_API_LIMIT = 50;
    try {
      setLoading(true);
      const allResults = [];
      const totalRecords = journalEntriesToPost.length;

      // Chunk the journalEntriesToPost array
      for (let i = 0; i < totalRecords; i += BULK_API_LIMIT) {
        const chunk = journalEntriesToPost.slice(i, i + BULK_API_LIMIT);

        try {
          // Make a bulk API call for the current chunk
          const resp = await apiClient.post(`/JournalEntry/Bulk`, chunk);
          const apiSuccess =
            resp.data.success === true &&
            Array.isArray(resp.data.values) &&
            resp.data.values.every((v) => v.success === true);

          allResults.push({
            success: apiSuccess,
            message: apiSuccess
              ? resp.data.message
              : resp.data.values?.find((v) => v.success === false)?.message ||
                "Unknown error",
            chunk: chunk,
          });
          setClearCache(true);
        } catch (error) {
          allResults.push({
            success: false,
            message: error.message || "API error for chunk",
            chunk: chunk,
          });
        }
      }

      // Check overall success
      const allChunksSuccessful = allResults.every((r) => r.success);

      if (allChunksSuccessful) {
        Swal.fire({
          title: "Success!",
          text: "All BP Opening Balances saved successfully across all batches.",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 2000,
        });
        clearFormData();
      } else {
        const failedChunks = allResults.filter((r) => !r.success);
        Swal.fire({
          title: "Partial Success / Error!",
          text: `${failedChunks.length} out of ${allResults.length} batches of Business Partner Opening Balances failed to post. Check console for details.`,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Something went wrong during API calls.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===================================== Excel Import Logic =====================================

  const handleImportClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  const handleFileChange = async (event) => {
    if (!formDate) {
      Swal.fire({
        icon: "warning",
        title: "Date is Missing",
        // text: errorMessage,
        confirmButtonText: "OK",
      });
      return;
    }
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    setLoading(true);
    try {
      const text = await file.text(); // ✅ read as plain text
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length < 2) {
        Swal.fire("Error", "File is empty or missing data.", "error");
        return;
      }

      // First line = header row
      const headers = lines[0].split(",").map((h) => h.trim()); // assuming CSV

      const requiredFields = [
        "DueDate",
        "Code",
        "Name",
        "ControlAcct",
        "Currency",
      ];
      for (const field of requiredFields) {
        if (!headers.includes(field)) {
          throw new Error(`Missing required column "${field}" in header.`);
        }
      }
      const importedBpobLines = [];
      const localCurrency = companyData?.MainCurncy;
      const systemCurrency = companyData?.SysCurrncy;
      const currentOPBalAcct = getValues("OPBalAcct");

      if (!currentOPBalAcct) {
        Swal.fire(
          "Validation Error",
          "Please select an Opening Balance Account before importing.",
          "warning",
        );
        return;
      }

      for (let i = 1; i < lines.length; i++) {
        const rowIndex = i + 1; // Excel-style numbering
        const values = lines[i].split(",").map((v) => v.trim());

        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });

        // Validate required fields
        for (const field of requiredFields) {
          if (!row[field]) {
            throw new Error(
              `Row ${rowIndex}: Missing required field "${field}".`,
            );
          }
        }
        const ob = row.OB !== undefined && row.OB !== "" ? Number(row.OB) : 0;
        const obfc =
          row.OBFC !== undefined && row.OBFC !== "" ? Number(row.OBFC) : 0;
        const obsc =
          row.OBSC !== undefined && row.OBSC !== "" ? Number(row.OBSC) : 0;

        if (isNaN(ob) || isNaN(obfc) || isNaN(obsc)) {
          throw new Error(
            `Row ${rowIndex}: OB, OBFC, or OBSC must be valid numbers if provided.`,
          );
        }

        let bpDetails = {
          Balance: 0,
          BalanceFC: 0,
          BalanceSC: 0,
          Currency: row.Currency,
        };

        // Account Currency Validation (same as in handleSubmitForm)
        // Use controlAcctRows for DataGrid ControlAcct and lcAcctRows for main OPBalAcct
        // const controlAcctDetails = controlAcctRows.find(
        //   (acct) => String(acct.AcctCode) === String(row.ControlAcct)
        // );

        let validationFailed = false;
        let validationMessage = "";

        if (
          bpDetails.Currency !== localCurrency &&
          bpDetails.Currency !== "AC"
        ) {
          // Validate Control Account
          // if (controlAcctDetails && controlAcctDetails.ActCurr !== "AC" && controlAcctDetails.ActCurr !== bpDetails.Currency) {
          //   validationFailed = true;
          //   validationMessage = `Row ${rowIndex}: For Business Partner "${bpDetails.Name || row.Name}" (${bpDetails.Code || row.Code}) with currency "${bpDetails.Currency}", the Control Account "${row.ControlAcct}" must have an Account Currency equal to "${bpDetails.Currency}" or "AC".`;
          // }
          // Validate Opening Balance Account
          if (
            !validationFailed &&
            opBalAcctCurrency &&
            opBalAcctCurrency !== "AC" &&
            opBalAcctCurrency !== bpDetails.Currency
          ) {
            validationFailed = true;
            validationMessage = `Row ${rowIndex}: For Business Partner "${
              bpDetails.Name || row.Name
            }" (${bpDetails.Code || row.Code}) with currency "${
              bpDetails.Currency
            }", must have Currency equal to  Opening Balance Account currency  "${opBalAcctCurrency}" or "AC".`;
          }
        }

        if (validationFailed) {
          throw new Error(validationMessage);
        }

        let dueDate = null;
        if (row.DueDate) {
          const possibleFormats = [
            "YYYY-MM-DD",
            "MM/DD/YYYY",
            "DD-MM-YYYY",
            "DD/MM/YYYY",
          ];
          dueDate = dayjs(row.DueDate, possibleFormats, true);
          if (!dueDate.isValid()) {
            dueDate = dayjs(row.DueDate);
          }
        }
        // Construct the new BPOB line
        const newBpobLine = {
          id: `excel-${Date.now()}-${i}`, // Unique ID for the DataGrid
          DocEntry: null, // Not applicable for new imports
          DueDate:
            dueDate && dueDate.isValid() ? dueDate.format("YYYY/MM/DD") : null,
          Code: String(row.Code),
          Name: String(row.Name),
          ControlAcct: String(row.ControlAcct),
          Balance: bpDetails.Balance, // From fetched BP details or default
          BalanceFC: bpDetails.BalanceFC, // From fetched BP details or default
          BalanceSC: bpDetails.BalanceSC, // From fetched BP details or default
          Currency: bpDetails.Currency, // From Excel or fetched BP details
          OB: ob,
          OBFC: obfc,
          OBSC: obsc,
        };

        const round = (num) => Math.round(num * 100) / 100;
        const isEmpty = (value) =>
          value === 0 || value === null || value === undefined;

        let rateLCtoSC = 0;

        let rateLCtoBPCurrency = 0;

        if (formDate) {
          try {
            if (systemCurrency && systemCurrency !== localCurrency) {
              rateLCtoSC = await fetchExchangeRate(formDate, systemCurrency);
            }
            if (
              newBpobLine.Currency &&
              newBpobLine.Currency !== localCurrency &&
              newBpobLine.Currency !== "AC"
            ) {
              rateLCtoBPCurrency = await fetchExchangeRate(
                formDate,
                newBpobLine.Currency,
              );
            }
          } catch (err) {
            console.error("Error fetching exchange rates during import:", err);
            // Swal.fire is already handled in fetchExchangeRate
          }
        }

        let currentOB = newBpobLine.OB;
        let currentOBFC = newBpobLine.OBFC;
        let currentOBSC = newBpobLine.OBSC;

        const bpCurrency = newBpobLine.Currency;

        if (bpCurrency === localCurrency) {
          // BP = LC
          currentOBSC = round(currentOB / rateLCtoSC);
          currentOBFC = 0; // Not applicable
        } else if (bpCurrency === "AC") {
          // BP = All Currencies
          currentOBSC = round(currentOB / rateLCtoSC);
          currentOBFC = 0; // FC not applicable for AC
        } else if (bpCurrency === systemCurrency) {
          // BP = SC
          if (isEmpty(currentOBFC)) {
            currentOBFC = round(currentOB / rateLCtoBPCurrency);
          }
          if (isEmpty(currentOBSC)) {
            currentOBSC = round(currentOB / rateLCtoSC);
          }
        } else {
          // BP = FC
          if (isEmpty(currentOBFC)) {
            currentOBFC = round(currentOB / rateLCtoBPCurrency);
          }
          if (isEmpty(currentOBSC)) {
            currentOBSC = round(currentOB / rateLCtoSC);
          }
        }

        newBpobLine.OB = currentOB;
        newBpobLine.OBFC = currentOBFC;
        newBpobLine.OBSC = currentOBSC;
        newBpobLine.ExchangeRateLCtoSC = rateLCtoSC;
        newBpobLine.ExchangeRateLCtoBPCurrency = rateLCtoBPCurrency;

        importedBpobLines.push(newBpobLine);
      }

      // If all rows are valid, update the state
      setBpobLinesState((prev) => [...prev, ...importedBpobLines]);
      Swal.fire({
        title: "Success",
        text: `${importedBpobLines.length} rows imported successfully!`,
        icon: "success",
        timer: 1000, // closes automatically after 1 second
        showConfirmButton: true, // optional, hides "Ok" button
      });
    } catch (error) {
      Swal.fire("Import Error", error.message, "error");
      setBpobLinesState([]); // Discard all imported rows if any error occurs
    } finally {
      setLoading(false);
      // Clear the file input value to allow re-importing the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ===================================== Effects =====================================

  useEffect(() => {
    getCustomerGroups();
    getVendorGroups();
    getPeriodAndGlInfo();
    // SeriesData();
  }, []);

  // Effect for main Opening Balance Account modal
  useEffect(() => {
    if (isLCAcctDialogOpen) {
      fetchInitialLCAccts({
        page: lcAcctCurrentPage,
        search: lcAcctSearchText,
      });
    }
  }, [lcAcctCurrentPage, lcAcctSearchText]);

  // NEW: Effect for Control Account modal
  useEffect(() => {
    if (isControlAcctDialogOpen) {
      fetchControlAccts({
        page: controlAcctCurrentPage,
        search: controlAcctSearchText,
      });
    }
  }, [controlAcctCurrentPage, controlAcctSearchText]);

  // ===================================== DataGrid Columns =====================================

  const Acclist = useMemo(
    () => [
      {
        field: "AcctCode",
        headerName: "Account Number",
        width: 150,
        editable: true,
      },
      {
        field: "AcctName",
        headerName: "Account Name",
        width: 150,
        editable: true,
      },
      {
        field: "CurrTotal",
        headerName: "Account Balance",
        width: 150,
        editable: true,
      },
      {
        field: "ActCurr",
        headerName: "Account Currency ",
        width: 150,
        editable: true,
      },
    ],
    [],
  );

  const BPOBModalColumns = useMemo(
    () => [
      { field: "Code", headerName: "Code", width: 120, editable: true },
      { field: "Name", headerName: "Name", width: 120, editable: true },
      { field: "Balance", headerName: "Balance", width: 120, editable: true },
      { field: "Currency", headerName: "Currency", width: 120, editable: true },
    ],
    [],
  );

  // const handleBPOBFieldChange = useCallback((id, field, value) => {
  //   setBpobLinesState((prev) =>
  //     prev.map((row) => {
  //       if (row.id === id) {
  //         let updatedValue = value;

  //         // Convert only numeric fields
  //         if (
  //           [
  //             "OB",
  //             "OBFC",
  //             "OBSC",
  //             "Balance",
  //             "BalanceFC",
  //             "BalanceSC",
  //           ].includes(field)
  //         ) {
  //           updatedValue = Number(value) || 0;
  //         }

  //         return { ...row, [field]: updatedValue };
  //       }
  //       return row;
  //     }),
  //   );
  // }, []);

  // const handleBPOBFieldBlur = useCallback(
  //   async (id, field) => {
  //     const prevState = [...bpobLinesState];
  //     const rowIndex = prevState.findIndex((r) => r.id === id);
  //     if (rowIndex === -1) return;

  //     const updatedRow = { ...prevState[rowIndex] };
  //     const localCurrency = companyData?.MainCurncy;
  //     const systemCurrency = companyData?.SysCurrncy;
  //     const bpCurrency = updatedRow.Currency;

  //     const round = (num) => Math.round(num * 100) / 100;

  //     if (!formDate) {
  //       Swal.fire({
  //         title: "Validation Error!",
  //         text: "Date is missing, cannot fetch exchange rate.",
  //         icon: "warning",
  //         confirmButtonText: "Ok",
  //       });
  //       return;
  //     }

  //     // --- Account Currency Validation ---
  //     let validationFailed = false;
  //     let validationMessage = "";

  //     if (bpCurrency !== localCurrency && bpCurrency !== "AC") {
  //       if (
  //         !validationFailed &&
  //         opBalAcctCurrency &&
  //         opBalAcctCurrency !== "AC" &&
  //         opBalAcctCurrency !== bpCurrency
  //       ) {
  //         validationFailed = true;
  //         validationMessage = `For Business Partner "${updatedRow.Name}" with currency "${bpCurrency}", must have Currency equal to  Opening Balance Account currency "${opBalAcctCurrency}" or "AC".`;
  //       }
  //     }

  //     if (validationFailed) {
  //       Swal.fire({
  //         title: "Validation Error!",
  //         text: validationMessage,
  //         icon: "warning",
  //         confirmButtonText: "Ok",
  //       });

  //       // Reset OB values in state
  //       const newState = [...prevState];
  //       newState[rowIndex] = {
  //         ...updatedRow,
  //         OB: 0,
  //         OBSC: 0,
  //         OBFC: 0,
  //       };
  //       setBpobLinesState(newState);
  //       return; // Stop further execution
  //     }
  //     // --- End Account Currency Validation ---

  //     let rateLCtoSC = 0;
  //     if (systemCurrency === localCurrency) {
  //       rateLCtoSC = 1;
  //     }
  //     let rateLCtoBPCurrency = 0;

  //     try {
  //       // FETCH SYSTEM CURRENCY ONLY ONCE
  //       if (systemCurrency && systemCurrency !== localCurrency) {
  //         if (!systemCurrencyRate) {
  //           const rate = await fetchExchangeRate(formDate, systemCurrency);
  //           if (rate === null) return;
  //           setSystemCurrencyRate(rate);
  //           rateLCtoSC = rate;
  //         } else {
  //           rateLCtoSC = systemCurrencyRate;
  //         }
  //       }

  //       // FETCH FOREIGN CURRENCY ONLY IF NEEDED (AND ONLY ONCE)
  //       if (bpCurrency && bpCurrency !== localCurrency && bpCurrency !== "AC") {
  //         if (!foreignCurrencyRates[bpCurrency]) {
  //           const rate = await fetchExchangeRate(formDate, bpCurrency);
  //           if (rate === null) return;

  //           setForeignCurrencyRates((prev) => ({
  //             ...prev,
  //             [bpCurrency]: rate,
  //           }));

  //           rateLCtoBPCurrency = rate;
  //         } else {
  //           rateLCtoBPCurrency = foreignCurrencyRates[bpCurrency];
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error fetching exchange rates:", err);
  //       return;
  //     }

  //     // Store the original values before potential modifications for conditional checks
  //     const originalOB = updatedRow.OB;
  //     const originalOBFC = updatedRow.OBFC;

  //     // ===================================== NEW LOGIC BASED ON CONDITIONS =====================================

  //     if (bpCurrency === localCurrency || bpCurrency === "AC") {
  //       // When BP has Local Currency (LC) or All Currencies (AC)
  //       if (field === "OB") {
  //         // On changing the Opening Balance in Local Currency (OB LC)
  //         // SC value will change, LC value remains unchanged (it's the input). FC is not applicable.
  //         updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
  //         updatedRow.OBFC = 0; // Not applicable
  //       } else if (field === "OBSC") {
  //         // On changing the Opening Balance in System Currency (OB SC)
  //         // No change in Local Currency (LC). SC and FC fields are not applicable for modification.
  //         // This means OB (LC) should not be derived from OBSC, and OBFC should remain 0.
  //         // The OBSC value itself is the input, so it's "modified".
  //         updatedRow.OB = originalOB; // LC remains unchanged
  //         updatedRow.OBFC = 0; // FC remains not applicable
  //       } else if (field === "OBFC") {
  //         // OBFC is not applicable for LC/AC accounts, so it should remain 0.
  //         updatedRow.OBFC = 0;
  //       }
  //     } else {
  //       // When BP has either Foreign Currency (FC) or System Currency (SC)
  //       // This covers bpCurrency === systemCurrency and other FCs
  //       if (field === "OB") {
  //         // On changing the Opening Balance in Local Currency (OB LC)
  //         // SC value will change, FC value will also change.
  //         // LC is not applicable unless both SC and FC are empty.
  //         // The condition "LC is not applicable unless both SC and FC are empty" implies that if OB (LC) is changed,
  //         // and SC/FC are NOT empty, then OB (LC) should revert or not be allowed to be changed.
  //         // However, the prompt states "On changing the Opening Balance in Local Currency (OB LC)",
  //         // implying OB (LC) is the primary input.
  //         // The most logical interpretation is that if OB (LC) is changed, SC and FC are derived.
  //         // The "LC is not applicable unless both SC and FC are empty" might be a constraint on *how* LC can be set,
  //         // but if the user directly inputs into OB (LC), we should calculate.
  //         // For now, we'll proceed with calculation as the primary action.
  //         updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
  //         updatedRow.OBFC = round(updatedRow.OB / rateLCtoBPCurrency);
  //       } else if (field === "OBSC") {
  //         // On changing the Opening Balance in System Currency (OB SC)
  //         // LC remains unchanged, and no changes are applicable for SC and FC.
  //         // This means OB (LC) should not be derived from OBSC, and OBFC should not be derived.
  //         // The OBSC value itself is the input, so it's "modified".
  //         updatedRow.OB = originalOB; // LC remains unchanged
  //         updatedRow.OBFC = originalOBFC; // FC remains unchanged
  //       } else if (field === "OBFC") {
  //         // On changing the Opening Balance in Foreign Currency (OB FC)
  //         // LC and SC values will change, while FC remains unaffected (it's the input).
  //         // "This applies only if both LC and SC are empty, or both already have values."
  //         updatedRow.OB = round(updatedRow.OBFC * rateLCtoBPCurrency);
  //         updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
  //       }
  //     }

  //     // Ensure that if OBFC is disabled, it remains 0 (redundant check, but good for safety)
  //     if (bpCurrency === localCurrency || bpCurrency === "AC") {
  //       updatedRow.OBFC = 0;
  //     }

  //     const newState = [...prevState];
  //     newState[rowIndex] = updatedRow;
  //     setBpobLinesState(newState);

  //     console.table({
  //       OB: updatedRow.OB,
  //       OBSC: updatedRow.OBSC,
  //       OBFC: updatedRow.OBFC,
  //       BP_Currency: bpCurrency,
  //       LC: localCurrency,
  //       SC: systemCurrency,
  //       Rate_LCtoSC: rateLCtoSC,
  //       Rate_LCtoBP: rateLCtoBPCurrency,
  //     });
  //   },
  //   [
  //     bpobLinesState,
  //     companyData,
  //     fetchExchangeRate,
  //     formDate,
  //     opBalAcctCurrency, // Added opBalAcctCurrency to dependencies
  //   ],
  // );

  const handleDeleteRow = useCallback((id) => {
    setBpobLinesState((prev) => prev.filter((row) => row.id !== id));
    setModalSelectedRowIds((prev) => prev.filter((rowId) => rowId !== id)); // Uncheck in modal
  }, []);
  const processBPOBRowUpdate = async (newRow, oldRow) => {
    // debugger;
    const updatedRow = { ...newRow };

    const localCurrency = companyData?.MainCurncy;
    const systemCurrency = companyData?.SysCurrncy;
    const bpCurrency = updatedRow.Currency;

    const round = (n) => Math.round((Number(n) || 0) * 100) / 100;

    if (!formDate) {
      Swal.fire({
        title: "Validation Error!",
        text: "Date is missing, cannot fetch exchange rate.",
        icon: "warning",
      });
      return oldRow;
    }

    if (
      bpCurrency !== localCurrency &&
      bpCurrency !== "AC" &&
      opBalAcctCurrency &&
      opBalAcctCurrency !== "AC" &&
      opBalAcctCurrency !== bpCurrency
    ) {
      Swal.fire({
        title: "Validation Error!",
        text: `For Business Partner "${updatedRow.Name}" currency must match Opening Balance Account currency.`,
        icon: "warning",
      });

      return {
        ...oldRow,
        OB: 0,
        OBFC: 0,
        OBSC: 0,
      };
    }

    // ---- Fetch Rates ----
    let rateLCtoSC = 1;
    let rateLCtoBP = 1;

    if (systemCurrency !== localCurrency) {
      rateLCtoSC =
        systemCurrencyRate ||
        (await fetchExchangeRate(formDate, systemCurrency));
    }

    if (bpCurrency !== localCurrency && bpCurrency !== "AC") {
      rateLCtoBP =
        foreignCurrencyRates[bpCurrency] ||
        (await fetchExchangeRate(formDate, bpCurrency));
    }

    // ---- Detect changed field ----
    const changedField = Object.keys(newRow).find(
      (k) => newRow[k] !== oldRow[k],
    );

    // ---- Value state helpers (table conditions) ----
    const lcEmpty = !oldRow.OB;
    const scEmpty = !oldRow.OBSC;
    const fcEmpty = !oldRow.OBFC;

    // ================== BUSINESS RULES ==================

    /* ==================================================
     BP LC Currency OR BP All Currency
     ================================================== */
    if (bpCurrency === localCurrency || bpCurrency === "AC") {
      // OB (LC) → SC Change
      if (changedField === "OB") {
        updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
        updatedRow.OBFC = 0;
      }

      // OB (SC) → No LC / FC change
      if (changedField === "OBSC") {
        updatedRow.OBFC = 0;
      }

      // FC always not applicable
      updatedRow.OBFC = 0;
    } else {
      /* ==================================================
     BP FC or SC Currency
     ================================================== */
      // OB (LC) → SC & FC change
      // ONLY if both SC & FC are empty
      if (changedField === "OB" && scEmpty && fcEmpty) {
        updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
        updatedRow.OBFC = round(updatedRow.OB / rateLCtoBP);
      }

      // OB (SC) → No change (explicitly do nothing)

      // OB (FC) → LC & SC change
      // If LC & SC are empty OR already have values
      if (changedField === "OBFC" && (!lcEmpty || !scEmpty)) {
        updatedRow.OB = round(updatedRow.OBFC * rateLCtoBP);
        updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
      }
    }
    setBpobLinesState((prev) =>
      prev.map((row) => (row.id === updatedRow.id ? updatedRow : row)),
    );
    return updatedRow; // ✅ DataGrid commits this row
  };

  const BPOBColumns = useMemo(() => {
    const localCurrency = companyData?.MainCurncy;
    const systemCurrency = companyData?.SysCurrncy;

    return [
      // Inside BPOBColumns, update the DueDate field:
      // {
      //   field: "DueDate",
      //   headerName: "Due Date",
      //   width: 180,
      //   editable: true,
      //   type: "date",
      //   valueGetter: (params) => {
      //     // Safely handle null params or null value
      //     if (!params || params.value == null) return null;
      //     return dayjs(params.value).toDate();
      //   },
      //   valueFormatter: (params) => {
      //     // Safely handle null params or null value
      //     if (!params || params.value == null) return "";
      //     return dayjs(params.value).format("DD-MM-YYYY");
      //   },
      // },
      {
        field: "DueDate",
        headerName: "Due Date",
        width: 150,
        editable: true,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <span>
            {params.value ? dayjs(params.value).format("DD-MM-YYYY") : ""}
          </span>
        ),
        renderEditCell: (
          params, // ✅ REQUIRED for date picker
        ) => (
          <DatePicker
            value={params.value ? dayjs(params.value) : null}
            onChange={(newValue) => {
              params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: newValue ? newValue.format("YYYY-MM-DD") : null,
              });
            }}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                variant: "standard",
                InputProps: { disableUnderline: true },
              },
            }}
            format="DD-MM-YYYY"
          />
        ),
      },
      { field: "Code", headerName: "Code", width: 150 },
      { field: "Name", headerName: "Name", width: 250 },
      { field: "Currency", headerName: "CURRENCY", width: 150 },
      {
        field: "ControlAcct",
        headerName: "Control Acct",
        width: 220,
        editable: false,
        sortable: false,
        headerAlign: "center",
        align: "center",

        renderCell: (params) => {
          const rowId = params.row.id;
          const hasValue = !!params.row.ControlAcct;

          const openModal = () => {
            setEditingControlAcctRowId(rowId);
            setIsControlAcctDialogOpen(true);
            fetchControlAccts({
              page: 0,
              search: controlAcctSearchText,
            });
          };

          return (
            <Grid
              container
              alignItems="center"
              justifyContent="center"
              gap={0.5}
              tabIndex={0}
              onKeyDown={(e) => {
                // ⛔ keyboard opens modal ONLY if empty
                if (hasValue) return;

                if (
                  e.key === "Enter" ||
                  e.key === "F2" ||
                  e.key === " " ||
                  (e.key === "Tab" && !e.shiftKey)
                ) {
                  e.preventDefault();
                  openModal();
                }
              }}
              sx={{
                width: "100%",
                height: "100%",
                outline: "none",
              }}
            >
              {/* ---- TEXT ---- */}
              <Grid item xs zeroMinWidth>
                <Typography
                  noWrap
                  textAlign="center"
                  sx={{ fontSize: 13 }}
                  title={params.row.ControlAcct || ""}
                >
                  {params.row.ControlAcct || ""}
                </Typography>
              </Grid>

              {/* ---- ICON (always clickable) ---- */}
              <Grid item>
                <IconButton
                  size="small"
                  onClick={openModal} // ✅ always open
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
        field: "Balance",
        headerName: "Balance",
        width: 140,
        type: "number",
        editable: false,
      },

      {
        field: "OB",
        headerName: `OB(LC) - ${localCurrency}`,
        width: 140,
        type: "number",
        editable: true,
        renderCell: ({ value }) => (value == null ? "" : value.toFixed(2)),
      },

      {
        field: "BalanceFC",
        headerName: "Balance(FC)",
        width: 140,
        type: "number",
        editable: false,
      },

      {
        field: "OBFC",
        headerName: "OB(FC)",
        width: 140,
        type: "number",
        editable: true,

        renderEditCell: (params) => {
          const localCurrency = companyData?.MainCurncy;
          const rowCurrency = params.row.Currency;

          const isDisabled =
            rowCurrency === localCurrency ||
            rowCurrency === "AC" ||
            rowCurrency === "All Currency";

          if (isDisabled) {
            // ⛔ prevent editing
            return (
              <Typography sx={{ opacity: 0.5 }}>
                {params.value == null ? "" : params.value.toFixed(2)}
              </Typography>
            );
          }

          // ✅ fallback to default editor
          return <GridEditInputCell {...params} />;
        },

        renderCell: ({ value }) => (value == null ? "" : value.toFixed(2)),
      },
      {
        field: "BalanceSC",
        headerName: "Balance(SC)",
        width: 140,
        type: "number",
        editable: false,
      },

      {
        field: "OBSC",
        headerName: `OB(SC) - ${systemCurrency}`,
        width: 140,
        type: "number",
        editable: true,
        renderCell: ({ value }) => (value == null ? "" : value.toFixed(2)),
      },

      {
        field: "actions",
        headerName: "Action",
        width: 90,
        renderCell: (params) => (
          <IconButton
            color="error"
            onClick={() => handleDeleteRow(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        ),
      },
    ];
  }, [companyData, handleDeleteRow]);

  const handleApplyFilters = useCallback(() => {
    const currentCustomerGroups = getValues("CustomerGroup") || [];
    const currentVendorGroups = getValues("VendorGroup") || [];

    // ✅ Validation check
    if (
      currentCustomerGroups.length === 0 &&
      currentVendorGroups.length === 0
    ) {
      setValue("BPOBModalLines", []);
      Swal.fire(
        "Validation Error",
        "Please select at least one Customer Group or one Vendor Group",
        "warning",
      );
      return;
    }

    // Clear the cache for BPOBModalLines to ensure a fresh fetch with new filters
    BPOBPageCache.current = {};
    setValue("BPOBModalCurrentPage", 0); // Reset to first page

    // Clear main datagrid rows and modal selections if filters change
    setBpobLinesState([]);
    setModalSelectedRowIds([]); // Clear modal selection as new filters mean new potential BPs

    fetchBPOBeningBalance({
      page: 0,
      search: BPOBModalSearchText,
      forceRefresh: true, // Explicitly force refresh
    });
  }, [fetchBPOBeningBalance, BPOBModalSearchText, setValue, getValues]);

  const customerChecked = watch("Customer"); // will be 1 or 0
  const vendorChecked = watch("VENDOR");
  useEffect(() => {
    if (customerChecked !== 1) {
      setValue("CustomerGroup", []); // clear selection
    }
  }, [customerChecked, setValue]);

  useEffect(() => {
    if (vendorChecked !== 1) {
      setValue("VendorGroup", []); // clear selection
    }
  }, [vendorChecked, setValue]);
  return (
    <>
      {/* New Modal for Manual Exchange Rate Entry */}
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

      <Modal
        open={isModalOpen}
        onClose={closeModel}
        aria-labelledby="bp-selection-modal-title"
        aria-describedby="bp-selection-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%", // Increased width for better layout
            maxWidth: 1200, // Max width for large screens
            maxHeight: "90vh",
            bgcolor: theme.palette.background.paper, // Use theme background
            borderRadius: 2,
            boxShadow: theme.shadows[24],
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Typography
            id="bp-selection-modal-title"
            variant="h6"
            component="h2"
            sx={{
              p: 2,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            BUSINESS PARTNERS LIST
          </Typography>

          <Box sx={{ p: 3, overflowY: "auto", flexGrow: 1 }}>
            <Grid container spacing={3} alignItems="center">
              {/* Customer/Vendor Checkboxes */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Partner Type:
                </Typography>
                <Box display="flex" gap={2}>
                  <Controller
                    name="Customer"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value === 1}
                            onChange={(e) =>
                              field.onChange(e.target.checked ? 1 : 0)
                            }
                          />
                        }
                        label="CUSTOMER"
                      />
                    )}
                  />
                  <Controller
                    name="VENDOR"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value === 1}
                            onChange={(e) =>
                              field.onChange(e.target.checked ? 1 : 0)
                            }
                          />
                        }
                        label="VENDOR"
                      />
                    )}
                  />
                </Box>
              </Grid>

              {/* Customer Group MultiSelect */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="CustomerGroup"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <MultiSelectTextField
                      {...field}
                      label="CUSTOMER GROUP"
                      data={CustomerGroupList.map((item) => ({
                        key: item.DocEntry,
                        value: item.GroupName,
                      }))}
                      error={!!error}
                      helperText={error ? error.message : null}
                      fullWidth
                      disabled={customerChecked !== 1} // ✅ Disable if checkbox not checked
                    />
                  )}
                />
              </Grid>

              {/* Vendor Group MultiSelect */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="VendorGroup"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <MultiSelectTextField
                      {...field}
                      label="VENDOR GROUP"
                      data={VendorGroupList.map((item) => ({
                        key: item.DocEntry,
                        value: item.GroupName,
                      }))}
                      error={!!error}
                      helperText={error ? error.message : null}
                      fullWidth
                      disabled={vendorChecked !== 1} // ✅ Disable if checkbox not checked
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 3,
                mb: 2,
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyFilters} // Call the new handler
                disabled={loading}
                startIcon={<ViewListIcon />}
              >
                {loading ? "Fetching..." : "Fetch Business Partners"}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Paper sx={{ width: "100%", height: "50vh", overflow: "hidden" }}>
              <DataGrid
                className="datagrid-style"
                rows={BPOBModalLines}
                columns={BPOBModalColumns}
                getRowId={(row) => row.id || row.DocEntry} // Ensure stable IDs
                pagination
                paginationMode="server"
                rowCount={BPOBModalRowCount} // This should be the total count of filterable items
                pageSizeOptions={[LC_ACCT_LIMIT]} // Ensure 20 is an option
                // Explicitly set the current pagination model
                paginationModel={{
                  page: watch("BPOBModalCurrentPage"), // Current page from form state
                  pageSize: LC_ACCT_LIMIT, // Fixed page size to 20
                }}
                onPaginationModelChange={handleBPOBPageChange}
                loading={loading}
                slots={{ toolbar: GridToolbarQuickFilter }}
                slotProps={{
                  toolbar: { quickFilterProps: { debounceMs: 500 } },
                }}
                onFilterModelChange={(model) => {
                  const search = model.quickFilterValues?.[0] || "";
                  handleBPOBSearchChange(search);
                }}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={modalSelectedRowIds.filter((id) =>
                  BPOBModalLines.some((row) => row.id === id),
                )} // Only pass IDs from current page for proper rendering
                onRowSelectionModelChange={(newSelection) => {
                  const currentPageRowIds = BPOBModalLines.map((row) => row.id);

                  const currentSelectedIdsSet = new Set(modalSelectedRowIds);

                  currentPageRowIds.forEach((id) => {
                    if (!newSelection.includes(id)) {
                      currentSelectedIdsSet.delete(id);
                    }
                  });

                  newSelection.forEach((id) => {
                    currentSelectedIdsSet.add(id);
                  });

                  const updatedModalSelectedIds = Array.from(
                    currentSelectedIdsSet,
                  );
                  setModalSelectedRowIds(updatedModalSelectedIds);

                  // REMOVED: No immediate update to bpobLinesState here
                  // Selections now only update modalSelectedRowIds; addition happens only on SAVE
                }}
                sx={gridSx}
              />
            </Paper>
          </Box>

          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between", // Align buttons to the right
              gap: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.default, // Use theme background
            }}
          >
            <Button
              variant="contained"
              color="success"
              // MODIFIED: Logic to merge selected rows with existing bpobLinesState
              // Inside the onClick for the SAVE button in the Modal
              onClick={() => {
                const allSelectedIds = modalSelectedRowIds; // These are the IDs of all selected rows across all pages

                // 1. Gather all unique rows from the cache that correspond to the selected IDs
                const selectedRowsFromCache = [];
                const processedIds = new Set(); // To avoid adding the same row multiple times

                // Iterate through all cached pages
                for (const cacheKey in BPOBPageCache.current) {
                  const cachedPageRows = BPOBPageCache.current[cacheKey];
                  cachedPageRows.forEach((row) => {
                    if (
                      allSelectedIds.includes(row.id) &&
                      !processedIds.has(row.id)
                    ) {
                      selectedRowsFromCache.push(row);
                      processedIds.add(row.id);
                    }
                  });
                }

                // 2. Combine current main grid rows with the fully selected rows from the modal
                const currentMainGridRows = bpobLinesState;
                const combinedRows = [...currentMainGridRows];
                const existingRowIds = new Set(
                  currentMainGridRows.map((row) => row.id),
                );

                selectedRowsFromCache.forEach((newRow) => {
                  if (!existingRowIds.has(newRow.id)) {
                    combinedRows.push(newRow);
                  }
                });

                setBpobLinesState(combinedRows);
                setIsModalOpen(false);
              }}
              disabled={modalSelectedRowIds.length === 0}
            >
              SAVE
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* DataGridCellClickModel for Main Opening Balance Account */}
      <DataGridCellClickModel
        open={isLCAcctDialogOpen}
        closeModel={() => setIsLCAcctDialogOpen(false)}
        isLoading={lcAcctLoading}
        title="Opening Balance Account List"
        getRowId={(row) => row.DocEntry}
        columns={Acclist}
        rows={lcAcctRows}
        taxCurrentPage={lcAcctCurrentPage}
        limit={LC_ACCT_LIMIT}
        onPaginationModelChange={handleLCAcctPaginationModelChange}
        onCellClick={handleOpeningBalAcctSelection} // Use the specific handler
        searchText={lcAcctSearchText}
        onSearchChange={handleLCAcctSearchChange}
        rowCount={lcAcctRowCount}
        oLines={getValues("oLines") || []}
      />

      {/* NEW: DataGridCellClickModel for Control Account in DataGrid */}
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
        onCellClick={handleControlAcctRowSelection} // Use the specific handler
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
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          position="relative"
        >
          {/* <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ display: { lg: "none" }, position: "absolute", left: "10px" }}
          >
            <MenuIcon />
          </IconButton> */}

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={clearFormData}
            sx={{ display: {}, position: "absolute", right: "10px" }}
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
              BP Opening Balance
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
                sx={{ "& .MuiTextField-root": { m: 1 } }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="OPBalAcct"
                      control={control}
                      rules={{
                        required: "Opening Balance Account is Required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <Tooltip title="Opening Balance Account">
                          <InputTextField
                            {...field}
                            label="OPENING BALANCE ACCOUNT"
                            value={field.value}
                            error={!!error}
                            helperText={error ? error.message : null}
                            disabled
                            InputLabelProps={{
                              shrink: true,
                              sx: {
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%", // keeps label within input
                              },
                            }}
                            InputProps={{
                              readOnly: true,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <ViewListIcon
                                    style={{
                                      cursor: "pointer",
                                      backgroundColor: "green",
                                      borderRadius: "10%",
                                      color: "white",
                                      padding: 2,
                                    }}
                                    onClick={() => {
                                      setEditingControlAcctRowId(null); // Ensure this is null for main field
                                      setIsLCAcctDialogOpen(true); // Open the main OPBalAcct modal
                                      lcAcctPageCache.current = {};
                                      fetchInitialLCAccts({
                                        page: 0,
                                        search: lcAcctSearchText,
                                      });
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ maxWidth: 280, width: "100%" }}
                          />
                        </Tooltip>
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Date"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="DATE"
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setValue(
                              "Date",
                              date ? dayjs(date).format("YYYY-MM-DD") : null,
                              { shouldDirty: true },
                            );
                          }}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Remarks"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <InputTextField
                          {...field}
                          size="small"
                          label="REMARK"
                          inputProps={{ maxLength: 254 }}
                          rows={2}
                          multiline
                          fullWidth
                        />
                      )}
                    />
                  </Grid>

                  <Box
                    sx={{
                      height: "70vh",
                      // overflow: "auto",
                      mt: 2,
                      width: "100%",
                    }}
                  >
                    <DataGrid
                      className="datagrid-style"
                      apiRef={apiRef}
                      onCellKeyDown={handleCellKeyDown}
                      editMode="cell"
                      processRowUpdate={processBPOBRowUpdate}
                      onProcessRowUpdateError={(err) => console.error(err)}
                      experimentalFeatures={{ newEditingApi: true }}
                      rows={bpobLinesState}
                      columns={BPOBColumns}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      disableSelectionOnClick
                      // hideFooter
                      autoHeight={false}
                      getRowId={(row) => row.id || row.DocEntry}
                      sx={gridSx}
                    />
                  </Box>
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
                alignItems: "center",
                position: "sticky",
                bottom: 0,
                mb: 2,
              }}
            >
              {/* Left Side */}
              <Button
                variant="contained"
                color="info"
                onClick={handleImportClick}
                startIcon={<UploadFileIcon />}
                sx={{ color: "white" }}
              >
                Import from Excel
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                style={{ display: "none" }}
              />

              {/* Right Side */}
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClickOpen}
                  sx={{ mr: 1 }}
                >
                  BACK
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  color="success"
                  sx={{ color: "white" }}
                  disabled={!perms.IsAdd}
                >
                  SAVE
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
