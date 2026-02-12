import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile"; // Import UploadFileIcon
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
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { DatePicker } from "antd";

export default function BPOpeningBalance() {
  const theme = useTheme();
  const perms = usePermissions(165);
  const { user, companyData } = useAuth();

  // ===================================== Component States =====================================
  // const [seriesdata, setSeriesdata] = useState([]);
  const [clearCache, setClearCache] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [periodInfo, setPeriodInfo] = useState(null);

  const [GLDeterminationList, setGLDeterminationList] = useState([]);
  const [opBalAcctCurrency, setOpBalAcctCurrency] = useState(""); // store ActCurr

  const [GLOBLinesState, setGLOBLinesState] = useState([]); // state for GLOB grid

  // ===================================== Opening Balance Account Modal States (Original LC Account) =====================================
  const [isLCAcctDialogOpen, setIsLCAcctDialogOpen] = useState(false);
  const [lcAcctSearchText, setLcAcctSearchText] = useState("");
  const [lcAcctCurrentPage, setLcAcctCurrentPage] = useState(0);
  const [lcAcctRowCount, setLcAcctRowCount] = useState(0);
  const [lcAcctLoading, setLcAcctLoading] = useState(false);
  const [lcAcctRows, setLcAcctRows] = useState([]); // These are for the main OPBalAcct field
  const LC_ACCT_LIMIT = 20;

  // NEW STATE FOR MODAL SELECTION
  const [modalSelectedRowIds, setModalSelectedRowIds] = useState([]);

  // Ref for the hidden file input
  const fileInputRef = useRef(null);
  const lcAcctPageCache = useRef({});

  const [exchangeRateModalOpen, setExchangeRateModalOpen] = useState(false);
  const [exchangeRateModalData, setExchangeRateModalData] = useState({
    RateDate: null,
    Currency: "",
    DocEntry: "",
  });
  const [manualRate, setManualRate] = useState("");
  const [isSavingManualRate, setIsSavingManualRate] = useState(false);
  // const [isDefaultSet, setIsDefaultSet] = useState(false);
  // Add a ref to store the alert instance
  const alertRef = useRef(null);

  // Add a state to track if the component is mounted or active
  const [isComponentActive, setIsComponentActive] = useState(true);
  // ===================================== React Hook Form Setup =====================================
  const { control, handleSubmit, reset, setValue, watch, getValues } = useForm({
    defaultValues: {
      OPBalAcct: "",
      Date: periodInfo?.F_RefDate,
      Remarks: "",
      Asset: 1,
      Liability: 1,
      Equity: 1,
      Revenue: 1,
      Expenditure: 1,
      CustomerGroup: [],
      VendorGroup: [],
      GLOBLines: [],
      GLOBModalLines: [],
      GLOBModalRowCount: 0,
      GLOBModalCurrentPage: 0,
      GLOBModalSearchText: "",
    },
  });

  const GLOBModalLines = watch("GLOBModalLines");
  const GLOBModalRowCount = watch("GLOBModalRowCount");
  const GLOBModalSearchText = watch("GLOBModalSearchText");
  const formDate = watch("Date");

  const selectedRowIdsRef = useRef([]);
  const GLOBPageCache = useRef({});
  const rateCacheRef = useRef({});
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
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
  //         res.data.message || "Failed to fetch DocSeries!",
  //         "warning"
  //       );
  //     }
  //   } catch (error) {
  //     Swal.fire(
  //       "Error",
  //       error.message || "Failed to fetch DocSeries!",
  //       "error"
  //     );
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
        // This will trigger handleGLOBFieldBlur again for the affected row
        // You might need to re-trigger the blur event for the field that initiated this.
        // For simplicity, we can just close the modal and let the user re-trigger if needed,
        // or you can store the row/field context and re-call handleGLOBFieldBlur.
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

  const fetchGLOBeningBalance = useCallback(
    async ({ page = 0, search = "", forceRefresh = false } = {}) => {
      const currentIsAssetChecked = getValues("Asset") === 1;
      const currentIsLiabilityChecked = getValues("Liability") === 1;
      const currentIsEquityChecked = getValues("Equity") === 1;
      const currentIsRevenueChecked = getValues("Revenue") === 1;
      const currentIsExpenditureChecked = getValues("Expenditure") === 1;

      if (
        !currentIsAssetChecked &&
        !currentIsLiabilityChecked &&
        !currentIsEquityChecked &&
        !currentIsRevenueChecked &&
        !currentIsExpenditureChecked
      ) {
        setValue("GLOBModalLines", []);
        Swal.fire({
          title: "Validation Error!",
          text: "Select Account Type",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return; // Stop execution if none checked
      }

      const cacheKey = `${page}_${search}_${currentIsAssetChecked}_${currentIsLiabilityChecked}_${currentIsEquityChecked}_${currentIsRevenueChecked}_${currentIsExpenditureChecked}`;

      if (!forceRefresh && GLOBPageCache.current[cacheKey]) {
        setValue("GLOBModalLines", GLOBPageCache.current[cacheKey]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("Status", 1);
        params.append("Page", page);
        params.append("locManTran", "N");
        params.append("Postable", "Y");
        params.append("Limit", LC_ACCT_LIMIT);
        if (search) params.append("SearchText", search);

        // Determine GroupMask
        const groupMasks = [];
        if (currentIsAssetChecked) groupMasks.push(1);
        if (currentIsLiabilityChecked) groupMasks.push(2);
        if (currentIsEquityChecked) groupMasks.push(3);
        if (currentIsRevenueChecked) groupMasks.push(4);
        if (currentIsExpenditureChecked) groupMasks.push(5);

        if (groupMasks.length > 0 && groupMasks.length < 5) {
          params.append("GroupMask", groupMasks.join(","));
        }

        const url = `/ChartOfAccounts?${params.toString()}`;
        const res = await apiClient.get(url);
        const data = res.data;

        if (data.success) {
          if (!data.values || data.values.length === 0) {
            Swal.fire({
              title: "No Record Found",
              text: "No Chart of accounts found ",
              icon: "info",
              confirmButtonText: "OK",
            });
            setValue("GLOBModalLines", []);
            setValue("GLOBModalRowCount", 0);
            return;
          }

          const records = data.values.map((item, index) => ({
            id: item.DocEntry || `temp-${index + 1 + page * LC_ACCT_LIMIT}`,
            DocEntry: item.DocEntry,
            DueDate: formDate ? dayjs(formDate).format("DD/MM/YYYY") : "",
            Code: item.AcctCode || "",
            Name: item.AcctName || "",
            Balance: item.CurrTotal || 0,
            BalanceFC: item.FCTotal || 0,
            BalanceSC: item.SysTotal || 0,
            Currency: item.ActCurr,
            OB: 0,
            OBFC: 0,
            OBSC: 0,
          }));

          GLOBPageCache.current = {
            ...GLOBPageCache.current,
            [cacheKey]: records,
          };

          setValue("GLOBModalLines", records);
          setValue(
            "GLOBModalRowCount",
            records.length < LC_ACCT_LIMIT
              ? page * LC_ACCT_LIMIT + records.length
              : 1000,
          );
        } else {
          Swal.fire(
            "Error",
            data.message || "Failed to fetch Chart of Accounts!",
            "warning",
          );
        }
      } catch (err) {
        Swal.fire(
          "Error",
          err.message ||
            "Something went wrong while fetching Chart of Accounts.",
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
      const match = accounts.find((acc) => acc.AcctCode === acctCode);

      if (match) return match; // ✅ return full account object

      if (accounts.length < LC_ACCT_LIMIT) return null; // no more pages
    }
  };
  // useEffect(() => {
  //   if (!GLDeterminationList || GLDeterminationList.length === 0) return;
  //   const initOPBalAcct = async () => {
  //     const acctCode = GLDeterminationList?.[0]?.["LinkAct_18"];
  //     if (!acctCode) {
  //       Swal.fire({
  //         icon: "warning",
  //         title: "Missing Configuration",
  //         text: "Default Opening Balance Account (LinkAct_18) is not configured in GL Determination.",
  //       });
  //       return;
  //     }

  //     const account = await findAccount(acctCode);
  //     if (account) {
  //       setValue("OPBalAcct", account.AcctCode, { shouldValidate: true });
  //       setOpBalAcctCurrency(account.ActCurr); // ✅ store currency
  //     } else {
  //       Swal.fire({
  //         icon: "warning",
  //         title: "Account Not Found",
  //         text: `Account ${acctCode} not found in Chart of Accounts.`,
  //       });
  //     }
  //   };

  //   initOPBalAcct();
  // }, [GLDeterminationList, setValue]);
  // MODIFIED: This function now only fetches for the main Opening Balance Account field
  const fetchInitialLCAccts = useCallback(async ({ page = 0, search = "" }) => {
    setLcAcctLoading(true);
    try {
      setLoading(true);
      const cacheKey = `${page}_${search}`;

      if (lcAcctPageCache.current[cacheKey]) {
        setLcAcctRows(lcAcctPageCache.current[cacheKey].rows);
        setLcAcctRowCount(lcAcctPageCache.current[cacheKey].rowCount);
        return;
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
        const rowCount =
          accounts.length < LC_ACCT_LIMIT
            ? page * LC_ACCT_LIMIT + accounts.length
            : 1000;

        // Store in cache
        lcAcctPageCache.current[cacheKey] = {
          rows: accounts,
          rowCount: rowCount,
        };

        setLcAcctRows(accounts);
        setLcAcctRowCount(rowCount);
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
        text: err.message || "Error while fetching ChartOfAaccounts:",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLcAcctLoading(false);
      setLoading(false);
    }
  }, []);

  // Modify the Swal.fire calls in getPeriodAndGlInfo to not close on OK
  // Use useEffect to set active on mount and inactive on unmount, and close alert on unmount
  useEffect(() => {
    setIsComponentActive(true);
    return () => {
      setIsComponentActive(false);
      if (alertRef.current) {
        alertRef.current.close();
      }
    };
  }, []);
  // Modify the Swal.fire calls to store the instance and close if not active
  const getPeriodAndGlInfo = useCallback(async () => {
    setLoading(true);
    try {
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
  // The rest remains the same, with isDefaultSet blocking the form

  // ===================================== Handlers =====================================

  const handleClickOpen = () => {
    const currentGLOBLineIds = GLOBLinesState.map((row) => row.id);
    setModalSelectedRowIds(currentGLOBLineIds); // Pre-select rows already in the main grid
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
    lcAcctPageCache.current = {}; // Clear cache on search change
  }, []);

  const handleGLOBPageChange = useCallback(
    (model) => {
      const newPage = model.page;
      setValue("GLOBModalCurrentPage", newPage);
      fetchGLOBeningBalance({ page: newPage, search: GLOBModalSearchText });
    },
    [fetchGLOBeningBalance, GLOBModalSearchText, setValue],
  );

  const handleGLOBSearchChange = useCallback(
    (search) => {
      setValue("GLOBModalSearchText", search);
      setValue("GLOBModalCurrentPage", 0);
      // Trigger a fetch with the new search text
      fetchGLOBeningBalance({ page: 0, search: search, forceRefresh: true });
    },
    [setValue, fetchGLOBeningBalance],
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
      GLOBLines: [],
      GLOBModalLines: [],
      GLOBModalRowCount: 0,
      GLOBModalCurrentPage: 0,
      GLOBModalSearchText: "",
    });
    selectedRowIdsRef.current = [];
    GLOBPageCache.current = {};
    setGLOBLinesState([]); // Clear GLOB lines on form clear
    setModalSelectedRowIds([]); // Clear modal selection on form clear
  }, [periodInfo, reset, getValues]);

  const handleSubmitForm = async (data) => {
    if (!GLOBLinesState || GLOBLinesState.length === 0) {
      Swal.fire({
        title: "Validation Error!",
        text: "At least one Chart of Account Opening Balance line is required before submitting.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return; // Stop form submission
    }

    const cardCodes = GLOBLinesState.map((line) => line.Code); // assuming "Code" = CardCode
    const duplicates = cardCodes.filter(
      (code, index) => cardCodes.indexOf(code) !== index,
    );

    if (duplicates.length > 0) {
      Swal.fire({
        title: "Validation Error!",
        text: `Duplicate Chart of Account(s) found with CardCode: ${[
          ...new Set(duplicates),
        ].join(", ")}.`,
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return; // Stop form submission
    }
    for (const line of GLOBLinesState) {
      if (!line.DueDate) {
        Swal.fire({
          title: "Validation Error!",
          text: `Due Date is required for Chart of Account: ${line.Name} (${line.Code}).`,
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      // --- New Account Currency Validation ---
      const localCurrency = companyData?.MainCurncy;
      const COACurrency = line.Currency;

      let validationFailed = false;
      let validationMessage = "";

      // Skip this validation if COA Currency is the same as Local Currency
      if (COACurrency === localCurrency) {
        // No validation needed for currency matching if COA currency is local currency
        // Proceed to the next line or submission
      } else {
        // If COA Currency is not local currency, then apply the existing logic
        // If either COA Currency or Opening Balance Account Currency is "AC",
        // then it's considered valid for currency matching purposes.
        const isCOACurrencyAC = COACurrency === "AC";
        const isOpBalAcctCurrencyAC = opBalAcctCurrency === "AC";

        if (!isCOACurrencyAC && !isOpBalAcctCurrencyAC) {
          // Only apply strict validation if neither is "AC"
          const isOpBalAcctValid =
            opBalAcctCurrency === COACurrency ||
            opBalAcctCurrency === localCurrency;
          if (!isOpBalAcctValid) {
            validationFailed = true;
            validationMessage = `For Chart of Account "${line.Name}" (${line.Code}) with currency "${COACurrency}", Opening Balance Account must have an Account Currency equal to "${COACurrency}" or "All Currencies".`;
          }
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

    for (const line of GLOBLinesState) {
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
        Account: line.Code,
        Debit: isNegativeBalance ? "0" : String(obLC),
        Credit: isNegativeBalance ? String(Math.abs(obLC)) : "0",
        SYSCred: isNegativeBalance ? String(Math.abs(obSC)) : "0",
        SYSDeb: isNegativeBalance ? "0" : String(obSC),
        FCDebit: isNegativeBalance ? "0" : String(obFC),
        FCCredit: isNegativeBalance ? String(Math.abs(obFC)) : "0",
        FCCurrency: line.Currency,
        ContraAct: data.OPBalAcct,
        LineMemo: `GL Opening Balance`, // More specific memo
        Ref3Line: "0",
        TransType: "-2",
        BaseRef: "0",
        Project: "0",
        TaxDate: formattedDate,
        SystemRate: "0",
        MthDate: dayjs().format("YYYY/MM/DD"),
        ToMthSum: "0",
        BatchNum: "0",
        FinncPriod: String(DocSeries?.[0]?.FinncPriod ?? "0"),
        PIndicator: String(DocSeries?.[0]?.PIndicator ?? "0"),
        VatGroup: "0",
        BaseSum: "0",
        VatRate: "0",
        Indicator: "0",
        AdjTran: "0",
        RevSource: "0",
        ObjType: "30", // Journal Entry Line
        VatDate: formattedDate,
        SYSBaseSum: "0",
        VatLine: "0",
        VatAmount: "0",
        SYSVatSum: "0",
        GrossValue: "0",
        DebCred: isNegativeBalance ? "C" : "D",
        StornoAcc: "0",
        BalDueDeb: isNegativeBalance ? "0" : String(obLC),
        BalDueCred: isNegativeBalance ? String(Math.abs(obLC)) : "0",
        BalFcDeb: isNegativeBalance ? "0" : String(obFC),
        BalFcCred: isNegativeBalance ? String(Math.abs(obFC)) : "0",
        BalScDeb: isNegativeBalance ? "0" : String(obSC),
        BalScCred: isNegativeBalance ? String(Math.abs(obSC)) : "0",
        IsNet: "N",
        TaxType: "0",
        TaxPostAcc: "0",
        StaCode: "0",
        StaType: "0",
        TaxCode: "0",
        GrossValFc: "0",
        OcrCode2: "0",
        OcrCode3: "0",
        OcrCode4: "0",
        OcrCode5: "0",
        CenVatCom: "0",
        MatType: "0",
        Location: "0",
        WTaxCode: "0",
        TotalVat: "0",
        SYSTVat: "0",
        WTLiable: "N",
        WTLine: "N",
        WTApplied: "0",
        WTAppliedS: "0",
        WTAppliedF: "0",
        WTSum: "0",
        WTSumFC: "0",
        WTSumSC: "0",
        PayBlock: "N",
        PayBlckRef: "0",
        LicTradNum: "0",
        InterimTyp: "0",
        DprId: "0",
        MatchRef: "0",
        VatRegNum: "0",
        SLEDGERF: "0",
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
        LineMemo: `GL Opening Balance`, // More specific memo
        Ref3Line: "0",
        TransType: "-2",
        BaseRef: "0",
        Project: "0",
        TaxDate: formattedDate,
        SystemRate: "0",
        MthDate: dayjs().format("YYYY/MM/DD"),
        ToMthSum: "0",
        BatchNum: "0",
        FinncPriod: String(DocSeries?.[0]?.FinncPriod ?? "0"),
        PIndicator: String(DocSeries?.[0]?.PIndicator ?? "0"),
        VatGroup: "0",
        BaseSum: "0",
        VatRate: "0",
        Indicator: "0",
        AdjTran: "0",
        RevSource: "0",
        ObjType: "30", // Journal Entry Line
        VatDate: formattedDate,
        SYSBaseSum: "0",
        VatLine: "0",
        VatAmount: "0",
        SYSVatSum: "0",
        GrossValue: "0",
        DebCred: isNegativeBalance ? "D" : "C",
        StornoAcc: "0",
        BalDueDeb: isNegativeBalance ? String(Math.abs(obLC)) : "0",
        BalDueCred: isNegativeBalance ? "0" : String(obLC),
        BalFcDeb: isNegativeBalance ? String(Math.abs(obFC)) : "0",
        BalFcCred: isNegativeBalance ? "0" : String(obFC),
        BalScDeb: isNegativeBalance ? String(Math.abs(obSC)) : "0",
        BalScCred: isNegativeBalance ? "0" : String(obSC),
        IsNet: "N",
        TaxType: "0",
        TaxPostAcc: "0",
        StaCode: "0",
        StaType: "0",
        TaxCode: "0",
        GrossValFc: "0",
        OcrCode2: "0",
        OcrCode3: "0",
        OcrCode4: "0",
        OcrCode5: "0",
        CenVatCom: "0",
        MatType: "0",
        Location: "0",
        WTaxCode: "0",
        TotalVat: "0",
        SYSTVat: "0",
        WTLiable: "N",
        WTLine: "N",
        WTApplied: "0",
        WTAppliedS: "0",
        WTAppliedF: "0",
        WTSum: "0",
        WTSumFC: "0",
        WTSumSC: "0",
        PayBlock: "N",
        PayBlckRef: "0",
        LicTradNum: "0",
        InterimTyp: "0",
        DprId: "0",
        MatchRef: "0",
        VatRegNum: "0",
        SLEDGERF: "0",
        DocNum: String(DocSeries?.[0]?.DocNum ?? "0"),
        ShortName: data.OPBalAcct,
        DueDate: line.DueDate ? dayjs(line.DueDate).format("YYYY/MM/DD") : null,
        ActType: "A",
      };
      const jeObjectLines = [controlAccountLine, openingBalanceAccountLine];
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
        Indicator: "0",
        StornoDate: dayjs().format("YYYY/MM/DD"),
        StornoToTr: "0",
        AutoStorno: "N",
        Number: "0",
        Ref1: "0",
        TransCurr: line.Currency || "", // Transaction currency is local currency
        AdjTran: "N",
        RevSource: "",
        VatDate: dayjs().format("YYYY/MM/DD"),
        StampTax: "0",
        AutoVAT: "N",
        DocSeries: String(DocSeries?.[0]?.DocEntry ?? "0"),
        GenRegNo: "0",
        RG23APart2: "0",
        RG23CPart2: "0",
        Location: "0",
        AutoWT: "N",
        WTSum: "0",
        WTSumSC: "0",
        WTSumFC: "0",
        WTApplied: "0",
        WTAppliedS: "0",
        WTAppliedF: "0",
        BaseAmnt: "0",
        BaseAmntSC: "0",
        BaseAmntFC: "0",
        BaseVtAt: "0",
        BaseVtAtSC: "0",
        BaseVtAtFC: "0",
        SSIExmpt: "N",
        AgrNo: "0",
        ECDPosTyp: "0",
        PTICode: "0",
        ExclTaxRep: "N",
        IsCoEntry: "N",
        AtcEntry: "0",
        Attachment: "0",
        Series: String(DocSeries?.[0]?.SeriesId ?? "0"),
        DocNum: String(DocSeries?.[0]?.DocNum ?? "0"),
        DocDate: dayjs().format("YYYY/MM/DD"),
        MatType: "0",
        FixExchRate: "N",
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
          text: "All GL Opening Balances saved successfully across all batches.",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 2000,
        });
        clearFormData();
      } else {
        const failedChunks = allResults.filter((r) => !r.success);
        Swal.fire({
          title: "Partial Success / Error!",
          text: `${failedChunks.length} out of ${allResults.length} batches of Chart of Account Opening Balances failed to post.`,
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

      const requiredFields = ["DueDate", "Code", "Name", "Currency"];
      for (const field of requiredFields) {
        if (!headers.includes(field)) {
          throw new Error(`Missing required column "${field}" in header.`);
        }
      }
      const importedGLOBLines = [];
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

        // Validate required fields from the file
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

        // COADetails from file row
        const COACurrency = row.Currency; // This is the COA currency from the file

        // --- Currency Validation (similar to handleGLOBFieldBlur) ---
        let validationFailed = false;
        let validationMessage = "";

        const isCOACurrencyAC = COACurrency === "AC";
        const isOpBalAcctCurrencyAC = opBalAcctCurrency === "AC";

        // Skip this validation if COA Currency is the same as Local Currency
        if (COACurrency === localCurrency) {
          // No validation needed for currency matching if COA currency is local currency
          // Proceed with exchange rate fetching and calculations
        } else {
          // If COA Currency is not local currency, then apply the existing logic
          if (!isCOACurrencyAC && !isOpBalAcctCurrencyAC) {
            const isOpBalAcctValid =
              opBalAcctCurrency === COACurrency ||
              opBalAcctCurrency === localCurrency;

            if (!isOpBalAcctValid) {
              validationFailed = true;
              validationMessage = `Row ${rowIndex}: For Chart of Account "${row.Name}" (${row.Code}) with currency "${COACurrency}", Opening Balance Account must have an Account Currency equal to "${COACurrency}" or "${localCurrency}".`;
            }
          }
        }

        if (validationFailed) {
          throw new Error(validationMessage); // Throw error to stop import for this file
        }
        // --- End Currency Validation ---

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
            dueDate = dayjs(row.DueDate); // Fallback to generic parsing if specific formats fail
            if (!dueDate.isValid()) {
              throw new Error(
                `Row ${rowIndex}: Invalid DueDate format "${row.DueDate}". Expected formats like YYYY-MM-DD or MM/DD/YYYY.`,
              );
            }
          }
        }

        // Construct the new GLOB line
        const newGLOBLine = {
          id: `excel-${Date.now()}-${i}`, // Unique ID for the DataGrid
          DocEntry: null, // Not applicable for new imports
          DueDate:
            dueDate && dueDate.isValid() ? dueDate.format("YYYY/MM/DD") : null,
          Code: String(row.Code),
          Name: String(row.Name),
          Balance: 0, // Balance from COA is not in the file, default to 0 or fetch if needed
          BalanceFC: 0,
          BalanceSC: 0,
          Currency: COACurrency, // Use COACurrency from the file
          OB: ob,
          OBFC: obfc,
          OBSC: obsc,
        };

        const round = (num) => Math.round(num * 100) / 100;
        const isEmpty = (value) =>
          value === 0 || value === null || value === undefined;

        let rateLCtoSC = 0;
        let rateLCtoCOACurrency = 0; // Renamed for clarity

        if (formDate) {
          try {
            if (systemCurrency && systemCurrency !== localCurrency) {
              rateLCtoSC = await fetchExchangeRate(formDate, systemCurrency);
              if (rateLCtoSC === null) {
                throw new Error(
                  `Row ${rowIndex}: Failed to fetch exchange rate for System Currency (${systemCurrency}).`,
                );
              }
            }
            if (
              newGLOBLine.Currency &&
              newGLOBLine.Currency !== localCurrency &&
              newGLOBLine.Currency !== "AC"
            ) {
              rateLCtoCOACurrency = await fetchExchangeRate(
                formDate,
                newGLOBLine.Currency,
              );
              if (rateLCtoCOACurrency === null) {
                throw new Error(
                  `Row ${rowIndex}: Failed to fetch exchange rate for COA Currency (${newGLOBLine.Currency}).`,
                );
              }
            }
          } catch (err) {
            console.error("Error fetching exchange rates during import:", err);
            throw err; // Re-throw to be caught by the outer catch block
          }
        }

        let currentOB = newGLOBLine.OB;
        let currentOBFC = newGLOBLine.OBFC;
        let currentOBSC = newGLOBLine.OBSC;

        // --- Calculation logic based on COA Currency ---
        if (COACurrency === localCurrency) {
          // COA = LC
          if (!isEmpty(newGLOBLine.OB)) {
            currentOBSC = round(newGLOBLine.OB / rateLCtoSC);
            currentOBFC = 0; // Not applicable for LC COA
          } else if (!isEmpty(newGLOBLine.OBSC)) {
            currentOB = round(newGLOBLine.OBSC * rateLCtoSC);
            currentOBFC = 0; // Not applicable for LC COA
          } else {
            currentOB = 0;
            currentOBSC = 0;
            currentOBFC = 0;
          }
        } else if (COACurrency === "AC") {
          // COA = All Currencies (AC)
          // In this case, FC cannot be determined from the COA itself.
          // We can only calculate OB (LC) and OBSC (SC).
          if (!isEmpty(newGLOBLine.OB)) {
            currentOBSC = round(newGLOBLine.OB / rateLCtoSC);
            currentOBFC = 0; // FC is not applicable/determinable for AC COA
          } else if (!isEmpty(newGLOBLine.OBSC)) {
            currentOB = round(newGLOBLine.OBSC * rateLCtoSC);
            currentOBFC = 0; // FC is not applicable/determinable for AC COA
          } else {
            currentOB = 0;
            currentOBSC = 0;
            currentOBFC = 0;
          }
        } else {
          // COA is a specific Foreign Currency (FC)
          if (!isEmpty(newGLOBLine.OB)) {
            currentOBSC = round(newGLOBLine.OB / rateLCtoSC);
            currentOBFC = round(newGLOBLine.OB / rateLCtoCOACurrency);
          } else if (!isEmpty(newGLOBLine.OBFC)) {
            currentOB = round(newGLOBLine.OBFC * rateLCtoCOACurrency);
            currentOBSC = round(currentOB / rateLCtoSC);
          } else if (!isEmpty(newGLOBLine.OBSC)) {
            currentOB = round(newGLOBLine.OBSC * rateLCtoSC);
            currentOBFC = round(currentOB / rateLCtoCOACurrency);
          } else {
            currentOB = 0;
            currentOBFC = 0;
            currentOBSC = 0;
          }
        }

        newGLOBLine.OB = currentOB;
        newGLOBLine.OBFC = currentOBFC;
        newGLOBLine.OBSC = currentOBSC;
        newGLOBLine.ExchangeRateLCtoSC = rateLCtoSC;
        newGLOBLine.ExchangeRateLCtoBPCurrency = rateLCtoCOACurrency; // Store as BPCurrency for consistency

        importedGLOBLines.push(newGLOBLine);
      }

      // If all rows are valid, update the state
      setGLOBLinesState((prev) => [...prev, ...importedGLOBLines]);
      Swal.fire({
        title: "Success",
        text: `${importedGLOBLines.length} rows imported successfully!`,
        icon: "success",
        timer: 1000, // closes automatically after 1 second
        showConfirmButton: true, // optional, hides "Ok" button
      });
    } catch (error) {
      Swal.fire("Import Error", error.message, "error");
      setGLOBLinesState([]); // Discard all imported rows if any error occurs
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

  const GLOBModalColumns = useMemo(
    () => [
      { field: "Code", headerName: "Code", width: 150 },
      { field: "Name", headerName: "Name", width: 300 },
      { field: "Balance", headerName: "Balance", width: 150 },
      { field: "Currency", headerName: "Currency", width: 150 },
    ],
    [],
  );

  // const handleGLOBFieldChange = useCallback((id, field, value) => {
  //   setGLOBLinesState((prev) =>
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

  // const handleGLOBFieldBlur = useCallback(
  //   async (id, field) => {
  //     const prevState = [...GLOBLinesState];
  //     const rowIndex = prevState.findIndex((r) => r.id === id);
  //     if (rowIndex === -1) return;

  //     const updatedRow = { ...prevState[rowIndex] };
  //     const localCurrency = companyData?.MainCurncy;
  //     const systemCurrency = companyData?.SysCurrncy;
  //     const COACurrency = updatedRow.Currency;

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

  //     // --- Currency Validation for handleGLOBFieldBlur ---
  //     const isCOACurrencyAC = COACurrency === "AC";
  //     const isOpBalAcctCurrencyAC = opBalAcctCurrency === "AC";

  //     if (COACurrency !== localCurrency) {
  //       if (!isCOACurrencyAC && !isOpBalAcctCurrencyAC) {
  //         const isOpBalAcctValid =
  //           opBalAcctCurrency === COACurrency ||
  //           opBalAcctCurrency === localCurrency;

  //         if (!isOpBalAcctValid) {
  //           const validationMessage = `Chart of Account "${updatedRow.Name}" with currency "${COACurrency}" must have currency equal to an Opening Balance Account currency "${opBalAcctCurrency}" or "AC".`;

  //           Swal.fire({
  //             icon: "warning",
  //             title: "Validation Error",
  //             text: validationMessage,
  //             confirmButtonText: "Ok",
  //           });

  //           // Reset OB values in state
  //           const newState = [...prevState];
  //           newState[rowIndex] = {
  //             ...updatedRow,
  //             OB: 0,
  //             OBSC: 0,
  //             OBFC: 0,
  //           };
  //           setGLOBLinesState(newState);
  //           return; // stop further execution
  //         }
  //       }
  //     }
  //     // --- End Currency Validation for handleGLOBFieldBlur ---

  //     let rateLCtoSC = 1; // Local → System Currency
  //     if (systemCurrency === localCurrency) {
  //       rateLCtoSC = 1;
  //     }
  //     let rateLCtoCOACurrency = 1; // Local → BP Currency (here, COA Currency)

  //     // --- Optimized Exchange Rate Fetching ---
  //     // DO NOT call API repeatedly. Use cache.

  //     try {
  //       // System Currency Rate -----
  //       if (systemCurrency && systemCurrency !== localCurrency) {
  //         if (!rateCacheRef.current[systemCurrency]) {
  //           const rate = await fetchExchangeRate(formDate, systemCurrency);
  //           if (rate === null) return;

  //           rateCacheRef.current[systemCurrency] = rate; // store
  //         }
  //         rateLCtoSC = rateCacheRef.current[systemCurrency];
  //       }

  //       // COA Currency Rate -----
  //       const needsForeignRate =
  //         COACurrency && COACurrency !== localCurrency && COACurrency !== "AC";

  //       if (needsForeignRate) {
  //         if (!rateCacheRef.current[COACurrency]) {
  //           const rate = await fetchExchangeRate(formDate, COACurrency);
  //           if (rate === null) return;

  //           rateCacheRef.current[COACurrency] = rate; // store
  //         }

  //         rateLCtoCOACurrency = rateCacheRef.current[COACurrency];
  //       }
  //     } catch (err) {
  //       console.error("Error fetching exchange rates:", err);
  //       return;
  //     }

  //     // Helper to check if a value is effectively empty (0 or null/undefined)
  //     const isEmpty = (value) =>
  //       value === 0 || value === null || value === undefined || value === "";

  //     // Store the original values before potential modification
  //     const originalOB = updatedRow.OB;
  //     const originalOBSC = updatedRow.OBSC;
  //     const originalOBFC = updatedRow.OBFC;

  //     // --- Calculation logic based on COA Currency and OB Account Currency ---
  //     if (COACurrency === localCurrency) {
  //       // COA = LC
  //       if (field === "OB") {
  //         // On changing OB LC, SC value will change, LC remains unchanged. FC not applicable.
  //         updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
  //         updatedRow.OBFC = 0; // Not applicable
  //       } else if (field === "OBSC") {
  //         // On changing OB SC, LC remains unchanged, SC and FC not applicable for modification.
  //         // This means only OBSC itself is updated, and OB/OBFC are not derived from it.
  //         // The value is already updated by handleGLOBFieldChange, so no further action here.
  //         updatedRow.OB = originalOB; // Revert LC if it was changed by previous logic
  //         updatedRow.OBFC = 0; // Not applicable
  //       } else if (field === "OBFC") {
  //         // Ignore OBFC edits for LC COA
  //         updatedRow.OBFC = 0;
  //       }
  //     } else if (COACurrency === "AC") {
  //       // COA = All Currencies (AC)
  //       if (field === "OB") {
  //         // On changing OB LC, SC value will change, LC remains unchanged. FC not applicable.
  //         updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
  //         updatedRow.OBFC = 0; // FC is not applicable/determinable for AC COA
  //       } else if (field === "OBSC") {
  //         // On changing OB SC, LC remains unchanged, SC and FC not applicable for modification.
  //         // The value is already updated by handleGLOBFieldChange, so no further action here.
  //         updatedRow.OB = originalOB; // Revert LC if it was changed by previous logic
  //         updatedRow.OBFC = 0; // FC is not applicable/determinable for AC COA
  //       } else if (field === "OBFC") {
  //         // Ignore OBFC edits for AC COA
  //         updatedRow.OBFC = 0;
  //       }
  //     } else {
  //       // COA is a specific Foreign Currency (FC) or System Currency (SC)
  //       if (field === "OB") {
  //         // On changing OB LC, SC value will change, FC value will also change,
  //         // but LC is not applicable unless both SC and FC are empty.
  //         if (isEmpty(originalOBSC) && isEmpty(originalOBFC)) {
  //           updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
  //           updatedRow.OBFC = round(updatedRow.OB / rateLCtoCOACurrency);
  //         } else {
  //           // If SC or FC are not empty, LC is not applicable for changing them.
  //           // So, if OB is changed, and SC/FC already have values, OB should not affect them.
  //           // We only update OB itself (which is already done by handleGLOBFieldChange).
  //           updatedRow.OB = originalOB; // Revert OB if it was changed by previous logic
  //         }
  //       } else if (field === "OBSC") {
  //         // On changing OB SC, LC remains unchanged, and no changes are applicable for SC and FC.
  //         // This means only OBSC itself is updated.
  //         updatedRow.OB = originalOB; // Revert LC if it was changed by previous logic
  //         updatedRow.OBFC = originalOBFC; // Revert FC if it was changed by previous logic
  //       } else if (field === "OBFC") {
  //         // On changing OB FC, LC and SC values will change, while FC remains unaffected.
  //         // This applies only if both LC and SC are empty, or both already have values.
  //         const lcAndScAreEmpty = isEmpty(originalOB) && isEmpty(originalOBSC);
  //         const lcAndScHaveValues =
  //           !isEmpty(originalOB) && !isEmpty(originalOBSC);

  //         if (lcAndScAreEmpty || lcAndScHaveValues) {
  //           updatedRow.OB = round(updatedRow.OBFC * rateLCtoCOACurrency);
  //           updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
  //         } else {
  //           // If the condition (both empty or both have values) is not met,
  //           // then changing OBFC should not affect LC and SC.
  //           updatedRow.OB = originalOB;
  //           updatedRow.OBSC = originalOBSC;
  //         }
  //       }
  //     }

  //     updatedRow.ExchangeRateLCtoSC = rateLCtoSC;
  //     updatedRow.ExchangeRateLCtoBPCurrency = rateLCtoCOACurrency;

  //     // Update state
  //     const newState = [...prevState];
  //     newState[rowIndex] = updatedRow;
  //     setGLOBLinesState(newState);

  //     // console.table({
  //     //   OB: updatedRow.OB,
  //     //   OBSC: updatedRow.OBSC,
  //     //   OBFC: updatedRow.OBFC,
  //     //   BP_Currency: COACurrency,
  //     //   LC: localCurrency,
  //     //   SC: systemCurrency,
  //     //   Rate_LCtoSC: rateLCtoSC,
  //     //   Rate_LCtoBP: rateLCtoCOACurrency,
  //     // });
  //   },
  //   [
  //     GLOBLinesState,
  //     companyData,
  //     fetchExchangeRate,
  //     formDate,
  //     opBalAcctCurrency,
  //   ],
  // );

  const handleDeleteRow = useCallback((id) => {
    setGLOBLinesState((prev) => prev.filter((row) => row.id !== id));
    setModalSelectedRowIds((prev) => prev.filter((rowId) => rowId !== id)); // Uncheck in modal
  }, []);
  const processGLOBRowUpdate = async (newRow, oldRow) => {
    const updatedRow = { ...newRow };
    const field = Object.keys(newRow).find((k) => newRow[k] !== oldRow[k]);

    const localCurrency = companyData.MainCurncy;
    const systemCurrency = companyData.SysCurrncy;
    const COACurrency = newRow.Currency;

    const round = (v) => Math.round((Number(v) || 0) * 100) / 100;

    if (!formDate) {
      Swal.fire("Validation Error", "Date is missing", "warning");
      return oldRow;
    }

    /* ================= VALIDATION ================= */
    if (
      COACurrency !== localCurrency &&
      COACurrency !== "AC" &&
      opBalAcctCurrency !== "AC" &&
      opBalAcctCurrency !== COACurrency
    ) {
      Swal.fire(
        "Validation Error",
        `COA "${newRow.Name}" currency mismatch`,
        "warning",
      );

      const resetRow = { ...oldRow, OB: 0, OBFC: 0, OBSC: 0 };

      setGLOBLinesState((prev) =>
        prev.map((r) => (r.id === resetRow.id ? resetRow : r)),
      );

      return resetRow;
    }

    /* ================= RATES ================= */
    let rateLCtoSC = 1;
    let rateLCtoCOA = 1;

    if (systemCurrency !== localCurrency) {
      rateLCtoSC =
        rateCacheRef.current[systemCurrency] ??
        (rateCacheRef.current[systemCurrency] = await fetchExchangeRate(
          formDate,
          systemCurrency,
        ));
    }

    if (COACurrency !== localCurrency && COACurrency !== "AC") {
      rateLCtoCOA =
        rateCacheRef.current[COACurrency] ??
        (rateCacheRef.current[COACurrency] = await fetchExchangeRate(
          formDate,
          COACurrency,
        ));
    }

    /* ================= VALUE STATE ================= */
    const lcEmpty = !oldRow.OB;
    const scEmpty = !oldRow.OBSC;
    const fcEmpty = !oldRow.OBFC;

    /* ================= CALCULATIONS ================= */

    if (COACurrency === localCurrency || COACurrency === "AC") {
      if (field === "OB") {
        updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
        updatedRow.OBFC = 0;
      }

      if (field === "OBSC") {
        updatedRow.OBFC = 0;
      }

      updatedRow.OBFC = 0;
    } else {
      if (field === "OB" && scEmpty && fcEmpty) {
        updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
        updatedRow.OBFC = round(updatedRow.OB / rateLCtoCOA);
      }

      if (field === "OBFC") {
        updatedRow.OB = round(updatedRow.OBFC * rateLCtoCOA);
        updatedRow.OBSC = round(updatedRow.OB / rateLCtoSC);
      }
    }

    /* ================= SET STATE BEFORE RETURN ================= */
    setGLOBLinesState((prev) =>
      prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
    );

    return updatedRow; // DataGrid commits this row
  };

  const GLOBColumns = useMemo(() => {
    const localCurrency = companyData?.MainCurncy;
    const systemCurrency = companyData?.SysCurrncy;

    return [
      /* ================= Due Date ================= */
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
      { field: "Name", headerName: "Name", width: 300 },
      { field: "Currency", headerName: "CURRENCY", width: 150 },

      /* ================= Balance LC ================= */
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

      /* ================= Actions ================= */
      {
        field: "actions",
        headerName: "Action",
        width: 90,
        sortable: false,
        filterable: false,
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
    GLOBPageCache.current = {};
    setValue("GLOBModalCurrentPage", 0); // Reset to first page

    // Clear main datagrid rows and modal selections if filters change
    setGLOBLinesState([]);
    setModalSelectedRowIds([]); // Clear modal selection as new filters mean new potential BPs
    fetchGLOBeningBalance({
      page: 0,
      search: GLOBModalSearchText,
      forceRefresh: true, // Explicitly force refresh
    });
  }, [fetchGLOBeningBalance, GLOBModalSearchText, setValue, getValues]);

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
        aria-labelledby="COA-selection-modal-title"
        aria-describedby="COA-selection-modal-description"
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
            id="COA-selection-modal-title"
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
            CHART OF ACCOUNTS LIST
          </Typography>

          <Box sx={{ p: 3, overflowY: "auto", flexGrow: 1 }}>
            <Grid container spacing={3} alignItems="center">
              {/* Customer/Vendor Checkboxes */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Account Type:
                </Typography>
                <Box display="flex" gap={2}>
                  <Controller
                    name="Asset"
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
                        label="ASSET"
                      />
                    )}
                  />
                  <Controller
                    name="Liability"
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
                        label="LIABILITY"
                      />
                    )}
                  />
                  <Controller
                    name="Equity"
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
                        label="EQUITY"
                      />
                    )}
                  />
                  <Controller
                    name="Revenue"
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
                        label="REVENUE"
                      />
                    )}
                  />
                  <Controller
                    name="Expenditure"
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
                        label="EXPENDITURE"
                      />
                    )}
                  />
                </Box>
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
                {loading ? "Fetching..." : "Fetch Chart Of Accounts"}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Paper sx={{ width: "100%", height: "50vh", overflow: "hidden" }}>
              <DataGrid
                className="datagrid-style"
                rows={GLOBModalLines}
                columns={GLOBModalColumns}
                getRowId={(row) => row.id || row.DocEntry} // Ensure stable IDs
                pagination
                paginationMode="server"
                rowCount={GLOBModalRowCount} // This should be the total count of filterable items
                pageSizeOptions={[LC_ACCT_LIMIT]} // Ensure 20 is an option
                // Explicitly set the current pagination model
                paginationModel={{
                  page: watch("GLOBModalCurrentPage"), // Current page from form state
                  pageSize: LC_ACCT_LIMIT, // Fixed page size to 20
                }}
                onPaginationModelChange={handleGLOBPageChange}
                loading={loading}
                slots={{ toolbar: GridToolbarQuickFilter }}
                slotProps={{
                  toolbar: { quickFilterProps: { debounceMs: 500 } },
                }}
                onFilterModelChange={(model) => {
                  const search = model.quickFilterValues?.[0] || "";
                  handleGLOBSearchChange(search);
                }}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={modalSelectedRowIds}
                onRowSelectionModelChange={(newSelection) => {
                  const currentPageRowIds = GLOBModalLines.map((row) => row.id);

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

                  // REMOVED: No immediate update to GLOBLinesState here.
                  // Selections are only merged on SAVE button click.
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
              // MODIFIED: Logic to merge selected rows with existing GLOBLinesState
              // Inside the onClick for the SAVE button in the Modal
              onClick={() => {
                const allSelectedIds = modalSelectedRowIds; // These are the IDs of all selected rows across all pages

                // 1. Gather all unique rows from the cache that correspond to the selected IDs
                const selectedRowsFromCache = [];
                const processedIds = new Set(); // To avoid adding the same row multiple times

                // Iterate through all cached pages
                for (const cacheKey in GLOBPageCache.current) {
                  const cachedPageRows = GLOBPageCache.current[cacheKey];
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
                const currentMainGridRows = GLOBLinesState;
                const combinedRows = [...currentMainGridRows];
                const existingRowIds = new Set(
                  currentMainGridRows.map((row) => row.id),
                );

                selectedRowsFromCache.forEach((newRow) => {
                  if (!existingRowIds.has(newRow.id)) {
                    combinedRows.push(newRow);
                  }
                });

                setGLOBLinesState(combinedRows);
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
              GL Opening Balance
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
                          name={field.name}
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
                      // minHeight: "300px",
                      // maxHeight: "500px",
                      // overflow: "auto",
                      mt: 2,
                      width: "100%",
                    }}
                  >
                    <DataGrid
                      apiRef={apiRef}
                      className="datagrid-style"
                      onCellKeyDown={handleCellKeyDown}
                      editMode="cell"
                      onProcessRowUpdateError={(err) => console.error(err)}
                      experimentalFeatures={{ newEditingApi: true }}
                      processRowUpdate={processGLOBRowUpdate}
                      rows={GLOBLinesState}
                      columns={GLOBColumns}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      disableSelectionOnClick
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
