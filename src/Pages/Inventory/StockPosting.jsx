import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import CardComponent from "../Components/CardComponent";

import SearchInputField from "../Components/SearchInputField";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HomeIcon from "@mui/icons-material/Home";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import BatchIntake from "../Components/Batch";
import CardCopyFrom from "../Components/CardCopyFrom";
import DataGridModal from "../Components/DataGridModal";
import {
  InputDatePickerField,
  InputFields,
  InputSearchSelectTextField,
  InputSelectFields,
  InputSelectTextField,
  InputTextField,
  InputTextSearchButtonTable,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchModel, { CopyFromSearchModel } from "../Components/SearchModel";
import SerialIntake from "../Components/SerialIntake";
import StockPostingBatchOut from "../Components/StockPostingBatchOut";
import StockPostingSerialOut from "../Components/StockPostingSerialOut";
import { TimeDelay } from "../Components/TimeDelay";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { ValueFormatter } from "../Components/ValueFormatter";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { useGridApiRef } from "@mui/x-data-grid";

// const initialState = {
//   copyFormOpen: false,
// };
// function reducer(state, action) {
//   switch (action.type) {
//     case "OPEN":
//       return { ...state, [action.modal]: true };

//     case "CLOSE":
//       return { ...state, [action.modal]: false };
//     case "TOGGLE":
//       return { ...state, [action.modal]: !state[action.modal] };
//     case "CLOSE_ALL":
//       return Object.keys(state).reduce(
//         (acc, key) => ({ ...acc, [key]: false }),
//         {}
//       );
//     default:
//       return state;
//   }
// }
export default function StockPosting() {
  const [openCopyForm, setOpenCopyForm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabvalue, settabvalue] = useState(0);
  const perms = usePermissions(91);
  const timeoutRef = useRef(null);
  const theme = useTheme();
  const [selectedData, setSelectedData] = useState([]);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [priceList, setPriceList] = useState([]);
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();

  //Search Item Modal States
  const [clearCache, setClearCache] = useState(false);
  const [open, setOpen] = useState(false);
  const [itemList, setItemList] = useState([]);
  const LIMIT = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [itemCache, setItemCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);

  //===================================Row level bin Acct STate======================================
  const [getListqueryAccount, setgetListqueryAccount] = useState("");
  const [getListSearchingAccount, setgetListSearchingAccount] = useState(false);
  const [getListDataAccount, setgetListDataAccount] = useState([]);
  const [getListPageAccount, setgetListPageAccount] = useState(0);
  const [hasMoreGetListAccount, sethasMoreGetListAccount] = useState(true);
  const [searchmodelOpenAccount, setsearchmodelOpenAccount] = useState(false);
  //  ===================================WareHouse State===================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);

  //===================================Row level G/L Increase Acct State======================================
  const [searchmodelOpenIncAccount, setsearchmodelOpenIncAccount] =
    useState(false);
  const [getListDataIncAccount, setgetListDataIncAccount] = useState([]);
  const [getListPageIncAccount, setgetListPageIncAccount] = useState(0);
  const [hasMoreGetListIncAccount, sethasMoreGetListIncAccount] =
    useState(true);
  const [getListqueryIncAccount, setgetListqueryIncAccount] = useState("");
  const [getListSearchingIncAccount, setgetListSearchingIncAccount] =
    useState(false);

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

  //=======================================Exchange rate modal state============================
  const [exchangeRateModalOpen, setExchangeRateModalOpen] = useState(false);
  const [exchangeRateModalData, setExchangeRateModalData] = useState({
    RateDate: null,
    Currency: "",
    DocEntry: "",
  });
  const [manualRate, setManualRate] = useState("");
  const [isSavingManualRate, setIsSavingManualRate] = useState(false);
  //======================================uom counted qty modal states==============================
  const [uomModalOpen, setUomModalOpen] = useState(false);
  const [uomRows, setUomRows] = useState([]);
  const [selectedUomIndex, setSelectedUomIndex] = useState(null);
  const { user, companyData, warehouseData } = useAuth();
  let [ok, setok] = useState("OK");

  const [olinePage, setOlinePage] = useState(0);
  const [olineRows, setOlineRows] = useState([]);

  const [getListPOData, setGetListPOData] = useState([]);
  const [hasMorePOList, setHasMorePOList] = useState(true);
  const [getListPageCopyFrom, setGetListPageCopyFrom] = useState(0);
  const [getListqueryCopyFrom, setGetLIstQueryCopyFrom] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [openCopyCheck, setopenCopyCheck] = useState(false);
  const [selectedValue, setSelectedValue] = useState("1");
  const [selectedObjects, setSelectedObjects] = useState([]);

  const [MultipleCount, setMultipleCount] = useState([]);
  const [getListSearchingCopyFrom, setGetListSearchingCopyFrom] =
    useState(false);
  // const [AllCopyformData, setAllDAtaCopyform] = useState([]);
  let [openserial, setopenserial] = useState(false);
  let [openserialOut, setopenserialOut] = useState(false);
  let [openBatchOut, setopenBatchOut] = useState(false);
  let [openBatch, setopenBatch] = useState(false);

  const handleCloseSerial = () => setopenserial(false);
  const handleCloseBatch = () => setopenBatch(false);
  const handleCloseSerialOut = () => setopenserialOut(false);
  const handleCloseBatchOut = () => setopenBatchOut(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [GLAcctDeterminationData, setGLAcctDeterminationData] = useState([]);
  const [SystemRate, setSystemRate] = useState(null);
  const apiRef = useGridApiRef();

  const PAGE_LIMIT = 100;
  const initial = {
    DocNum: "",
    Series: "",
    JrnlMemo: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD "),
    CountDate: dayjs(undefined).format("YYYY-MM-DD "),
    PriceSrc: "1",
    PriceList: priceList.length > 0 ? priceList[0].DocEntry : "",
    Comments: "",
    FinncPriod: "",
    PIndicator: "",
    oLines: [],
  };

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
  const { isDirty } = useFormState({ control });
  const watchPostingDate = watch("DocDate");
  const allFormData = getValues();
  const isInitialSystemRate = useRef(false);

  const watchPriceSrc = watch("PriceSrc");
  const oLines = watch("oLines") || [];
  useEffect(() => {
    console.log("⚡ oLines changed", oLines);
  }, [oLines]);
  const systemCurrency = companyData?.SysCurrncy;

  useEffect(() => {
    const getRate = async () => {
      if (!watchPostingDate || !systemCurrency) return;
      isInitialSystemRate.current = true;

      const rate = await fetchExchangeRate(watchPostingDate, systemCurrency);

      // If rate is undefined, null, 0, or "0", set 1
      const finalRate =
        rate === undefined || rate === null || rate === 0 || rate === "0"
          ? 1
          : Number(rate);

      setSystemRate(finalRate);

      console.log("system rate", finalRate);
    };

    getRate();
  }, [watchPostingDate, systemCurrency]);
  const fetchOlinePage = useCallback(
    async (pageNum) => {
      try {
        setIsLoading(true);
        const allOlines = getValues("oLines") || [];
        const start = pageNum * PAGE_LIMIT;
        const end = start + PAGE_LIMIT;

        const slicedRows = allOlines.slice(start, end);
        setOlineRows(slicedRows);
      } catch (err) {
        console.error("❌ Fetch oLines failed:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [getValues],
  );

  // 🔁 Fetch whenever pagination changes
  useEffect(() => {
    fetchOlinePage(olinePage);
  }, [olinePage, fetchOlinePage]);
  const handleChangeCopyform = (event) => {
    setSelectedValue(event.target.value); // ✅ use value, which will be the key
    console.log("Selected Key:", event.target.value);
  };
  const GLAcctData = async () => {
    try {
      setIsLoading(true); // 🔄 start loader (if available)

      const res = await apiClient.get("/GLAccDetermination/All");

      if (res?.data?.success) {
        const data = res.data.values ?? [];
        setGLAcctDeterminationData(data);
      } else {
        Swal.fire({
          icon: "info",
          text:
            res?.data?.message ||
            "Unable to load GL Account Determination data.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching GL Account Determination:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Chart of Accounts. Please try again later.",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
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

  const ClearForm = () => {
    setTimeout(() => {
      setValue("oLines", []);
    }, 0);
    reset({
      ...initial,
      oLines: [], // this already clears the lines
    });
    clearFiles();
    setSelectedRows([]);
    setOlineRows([]);
    setValue("oLines", []);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    setItemCache({});
    setSelectedObjects([]);
    setCheckedItems({});
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
  };

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
      setIsLoading(true);
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
      setIsLoading(false);
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
      setIsLoading(true);
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

        const refreshedRate = await fetchExchangeRate(
          exchangeRateModalData.RateDate,
          exchangeRateModalData.Currency,
        );

        // 🧩 2️⃣ If rate fetched successfully, trigger price recalculation
        if (refreshedRate && typeof updatePrices === "function") {
          await updatePrices({ mode: "all" });
        } else {
          console.warn("⚠️ Rate not found or updatePrices not available");
        }
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
      setIsLoading(false);
    }
  };
  //=====================================GL Increase Acct Modal========================================
  const OpenDailogIncAccount = () => setsearchmodelOpenIncAccount(true);
  const SearchModelCloseIncAccount = () => setsearchmodelOpenIncAccount(false);

  const handleGetListClearIncAccount = () => {
    setgetListqueryIncAccount("");
    setgetListSearchingIncAccount(false);
    setgetListPageIncAccount(0);
    setgetListDataIncAccount([]);
    fetchgetListDataIncAccount(0);
  };

  const handleGetListSearchIncAccount = (res) => {
    setgetListqueryIncAccount(res);
    setgetListSearchingIncAccount(true);
    setgetListPageIncAccount(0);
    setgetListDataIncAccount([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataIncAccount(0, res);
    }, TimeDelay);
  };

  const fetchMoregetListDataIncAccount = () => {
    fetchgetListDataIncAccount(
      getListPageIncAccount + 1,
      getListSearchingIncAccount ? getListqueryIncAccount : "",
    );
  };

  const fetchgetListDataIncAccount = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true); // 🔄 start loader (if available)

      // Build query parameters
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

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        // Set default account only on first page load
        if (pageNum === 0 && newData.length > 0) {
          setValue("AcctCode", newData[0]?.AcctCode ?? "");
        }

        sethasMoreGetListIncAccount(newData.length === 20);

        setgetListDataIncAccount((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        setgetListPageIncAccount(pageNum);
      } else {
        Swal.fire({
          icon: "info",
          text:
            response?.data?.message || "Failed to load income account list.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching income accounts:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch income account data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const handleSelectIncreaseAccount = (selectedAccount) => {
    const rowIndex = getValues("selectedRowIndex");
    const oLines = getValues("oLines");
    const selectedCode = selectedAccount.AcctCode;

    // 🛑 Safety checks
    if (rowIndex == null || rowIndex < 0 || !oLines[rowIndex]) return;

    // 🚫 Prevent same account for both Increase & Decrease
    if (oLines[rowIndex]?.DOffDecAcc === selectedCode) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Selection",
        text: "G/L Increase Acct and G/L Decrease Acct cannot be the same.",
      });
      return;
    }

    // ✅ Update only that one field in form
    setValue(`oLines.${rowIndex}.IOffIncAcc`, selectedCode, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // ✅ Refresh current visible page (so grid updates immediately)
    setTimeout(() => {
      fetchOlinePage(olinePage);
    }, 50);

    // ✅ Close modal
    setsearchmodelOpenIncAccount(false);
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
      setIsLoading(true); // 🔄 start loader (if available)

      // Build query parameters
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

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        // Set default account only on first page
        if (pageNum === 0 && newData.length > 0) {
          setValue("AcctCode", newData[0]?.AcctCode ?? "");
        }

        sethasMoreGetListDecAccount(newData.length === 20);

        setgetListDataDecAccount((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        setgetListPageDecAccount(pageNum);
      } else {
        Swal.fire({
          icon: "info",
          text:
            response?.data?.message || "Failed to load deduction account list.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching deduction accounts:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch deduction account data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const handleSelectDecreaseAccount = (selectedAccount) => {
    const rowIndex = getValues("selectedRowIndex");
    const oLines = getValues("oLines");
    const selectedCode = selectedAccount.AcctCode;

    // 🛑 Safety check
    if (rowIndex == null || rowIndex < 0 || !oLines[rowIndex]) return;

    // 🚫 Prevent same account for both Decrease & Increase
    if (oLines[rowIndex]?.IOffIncAcc === selectedCode) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Selection",
        text: "G/L Decrease Acct and G/L Increase Acct cannot be the same.",
      });
      return;
    }

    // ✅ Update specific field without recreating array
    setValue(`oLines.${rowIndex}.DOffDecAcc`, selectedCode, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // ✅ Refresh current visible page (so DataGrid reflects change immediately)
    setTimeout(() => {
      fetchOlinePage(olinePage);
    }, 50);

    // ✅ Close modal
    setsearchmodelOpenDecAccount(false);
  };

  const fetchUomByGroup = async (ugpEntry) => {
    try {
      setIsLoading(true); // 🔄 start loader (if available)

      if (!ugpEntry && ugpEntry !== 0) {
        setUomRows([]);
        return;
      }

      const res = await apiClient.get(`/UGP/${ugpEntry}`);
      const response = res?.data;

      if (response?.success && Array.isArray(response?.values?.oLines)) {
        const formatted = response.values.oLines.map((item, idx) => {
          const baseQty = Number(item?.BaseQty) || 0;
          const altQty = Number(item?.AltQty) || 1; // prevent divide-by-zero

          return {
            id: idx + 1,
            UomCode: item?.UomCode ?? "",
            ItmsPerUnt: altQty ? baseQty / altQty : 0,
            UomQty: 0,
            CountQty: 0,
            checked: false,
          };
        });

        setUomRows(formatted);
      } else {
        setUomRows([]);

        Swal.fire({
          icon: "info",
          text: response?.message || "No UOMs found for the selected group.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching UOMs:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch UOMs.",
        icon: "error",
        confirmButtonText: "Ok",
      });

      setUomRows([]);
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  // 🔹 Open Modal from parent DataGrid row
  const openUomModal = async (rowIndex, ugpEntry, oInvPostUomsLines) => {
    setSelectedUomIndex(rowIndex);
    // const oLines = getValues("oLines");
    // const selectedRow = oLines[rowIndex];
    if (oInvPostUomsLines && oInvPostUomsLines.length > 0) {
      const formatted = (oInvPostUomsLines || []).map((item, idx) => ({
        id: idx + 1,
        UomCode: item.UomCode,
        ItmsPerUnt: item.ItmsPerUnt,
        UomQty: item.UomQty,
        CountQty: item.CountQty,
        checked: item.checked,
      }));
      setUomRows(formatted);
    } else if (
      SaveUpdateName === "UPDATE" &&
      (!oInvPostUomsLines || oInvPostUomsLines || [].length === 0)
    ) {
      setUomRows([]);
    } else {
      await fetchUomByGroup(ugpEntry);
    }

    setUomModalOpen(true);
  };

  const handleSaveUomModal = async () => {
    if (selectedUomIndex == null) return;

    const selected = uomRows.filter((r) => r.checked);
    console.log("=====", uomRows);
    console.log("===selected==", selected);
    const row = getValues(`oLines.${selectedUomIndex}`);

    const invalid = selected.find(
      (r) =>
        !r.UomQty ||
        isNaN(r.UomQty) ||
        parseFloat(r.UomQty) <= 0 ||
        !r.CountQty ||
        isNaN(r.CountQty) ||
        parseFloat(r.CountQty) <= 0,
    );

    if (invalid) {
      Swal.fire({
        icon: "warning",
        title: "Invalid UOM Entry",
        text: "Each selected UOM must have valid UOM Counted Qty and Counted Qty values.",
      });
      return;
    }

    // ✅ Calculate totals
    const totalCounted = selected.reduce(
      (sum, r) =>
        sum + parseFloat(r.ItmsPerUnt || 0) * parseFloat(r.UomQty || 0),
      0,
    );

    const OnHandBef = parseFloat(row.OnHandBef || 0);
    const Quantity = totalCounted - OnHandBef;

    // Helper to parse price safely
    const parsePrice = (priceRaw) => {
      if (!priceRaw) return 0;
      const match = priceRaw.toString().match(/[\d.,]+/);
      return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
    };

    const numericPrice = parsePrice(row.Price);

    const updatedRow = {
      ...row,
      // oInvPostUomsLines: uomRows,
      oInvPostUomsLines: selected,
      CountQty: totalCounted.toFixed(6),
      Quantity: Quantity.toFixed(6),
      DiffPercnt: OnHandBef ? ((Quantity / OnHandBef) * 100).toFixed(6) : "",
    };

    if (selected.length === 1) {
      const selectedUom = selected[0];
      updatedRow.UomCode = selectedUom.UomCode;
      updatedRow.UomQty = selectedUom.UomQty;
      updatedRow.ItmsPerUnt = selectedUom.ItmsPerUnt;
      updatedRow.DocTotal = (
        parseFloat(updatedRow.CountQty || 0) * numericPrice
      ).toFixed(2);
    } else {
      updatedRow.UomCode = "Multiple UOMs";
      updatedRow.UomQty = "";
      updatedRow.ItmsPerUnt = "";
      updatedRow.DocTotal = (
        parseFloat(updatedRow.CountQty || 0) * numericPrice
      ).toFixed(2);
    }

    // ✅ Update only this row in RHF
    setValue(`oLines.${selectedUomIndex}`, updatedRow, { shouldDirty: true });

    try {
      await updatePrices({ mode: "row", targetRowIndex: selectedUomIndex });
    } catch (error) {
      console.error("❌ Error running updatePrices:", error);
    }

    // ✅ Refresh paginated grid so UI updates immediately
    setTimeout(() => {
      fetchOlinePage(olinePage);
    }, 50);

    // ✅ Close modal
    setUomModalOpen(false);
  };

  //=====================================================================
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
  const fetchgetListDataAccount = async (
    ItemCode,
    WHSCode,
    pageNum = 0,
    searchTerm = "",
  ) => {
    try {
      setIsLoading(true); // 🔄 start loader (if available)

      if (!ItemCode || !WHSCode) {
        setgetListDataAccount([]);
        sethasMoreGetListAccount(false);
        return;
      }

      const query = new URLSearchParams({
        Status: 1,
        Page: pageNum,
        Limit: 20,
        ItemCode,
        WHSCode,
      });

      if (searchTerm?.trim()) {
        query.append("SearchText", searchTerm.trim());
      }

      const url = `/BinLocationV2/GetByWHSCode?${query.toString()}`;
      const response = await apiClient.get(url);

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        sethasMoreGetListAccount(newData.length === 20);

        setgetListDataAccount((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        setgetListPageAccount(pageNum);
      } else {
        Swal.fire({
          icon: "info",
          text:
            response?.data?.message ||
            "No bin locations found for the selected item and warehouse.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching Bin Location:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch bin location data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const handleSelectBinLocation = (item) => {
    const index = getValues("selectedRowIndex");

    // Pre-calculate values
    const OnHandBef = parseFloat(item.OnHand);
    const CountQty = OnHandBef; // since you assign both the same
    const isValid = !isNaN(CountQty) && !isNaN(OnHandBef) && OnHandBef !== 0;

    const Quantity = isValid ? CountQty - OnHandBef : "";
    const variancePer = isValid
      ? ((Quantity / OnHandBef) * 100).toFixed(2)
      : "";

    // ✅ Update only changed fields (minimal re-render)
    setValue(`oLines.${index}.BinDocEntry`, item.DocEntry); // for API payload
    setValue(`oLines.${index}.BinEntry`, item.BinCode);
    setValue(`oLines.${index}.OnHandBef`, item.OnHand);
    setValue(`oLines.${index}.CountQty`, item.OnHand);
    setValue(`oLines.${index}.Quantity`, Quantity);
    setValue(`oLines.${index}.DiffPercnt`, variancePer);

    setsearchmodelOpenAccount(false);
  };

  const handleQtyChange = async (index, value) => {
    const CountQtyRaw = value;
    const OnHandBefRaw = getValues(`oLines.${index}.OnHandBef`);
    const PriceRaw = getValues(`oLines.${index}.Price`);

    // Helper to safely parse numeric values (removes INR, commas, etc.)
    const parseNumber = (raw) => {
      if (raw === "" || raw === null || raw === undefined) return null;
      const cleaned = raw.toString().replace(/[^\d.-]/g, "");
      return cleaned === "" ? null : parseFloat(cleaned);
    };

    const CountQty = parseNumber(CountQtyRaw);
    const OnHandBef = parseNumber(OnHandBefRaw);
    const numericPrice = parseNumber(PriceRaw);

    // ⚠️ If CountQty or Price missing → clear totals
    if (
      CountQty === null ||
      numericPrice === null ||
      isNaN(CountQty) ||
      isNaN(numericPrice)
    ) {
      setValue(`oLines.${index}.DocTotal`, "");
    } else {
      const DocTotal = (CountQty * numericPrice).toFixed(2);
      setValue(`oLines.${index}.DocTotal`, DocTotal);
    }

    // 🧩 Handle variance & percentage only if OnHandBef is valid
    if (OnHandBef !== null && !isNaN(OnHandBef)) {
      const Quantity = CountQty - OnHandBef;
      const variancePer =
        OnHandBef !== 0 ? ((Quantity / OnHandBef) * 100).toFixed(2) : "";

      setValue(`oLines.${index}.Quantity`, Quantity.toFixed(2));
      setValue(`oLines.${index}.DiffPercnt`, variancePer);
    } else {
      // If no OnHandBef → clear only variance fields
      setValue(`oLines.${index}.Quantity`, "");
      setValue(`oLines.${index}.DiffPercnt`, "");
    }

    // 🔁 Recalculate price after quantity change
    try {
      await updatePrices({ mode: "row", targetRowIndex: index });
    } catch (error) {
      console.error("❌ Error running updatePrices:", error);
    }
  };
  const processRowUpdate = async (newRow, oldRow) => {
    const index = newRow.id;

    const parseNumber = (raw) => {
      if (raw === "" || raw === null || raw === undefined) return null;
      const cleaned = raw.toString().replace(/[^\d.-]/g, "");
      return cleaned === "" ? null : parseFloat(cleaned);
    };

    const CountQty = parseNumber(newRow.CountQty);
    const OnHandBef = parseNumber(newRow.OnHandBef);
    const Price = parseNumber(newRow.Price);

    let updatedRow = { ...newRow };

    // 🔹 DOC TOTAL
    if (CountQty != null && Price != null) {
      updatedRow.DocTotal = (CountQty * Price).toFixed(2);
    } else {
      updatedRow.DocTotal = "";
    }

    // 🔹 VARIANCE + %
    if (OnHandBef != null && CountQty != null) {
      const variance = CountQty - OnHandBef;
      updatedRow.Quantity = variance.toFixed(2);
      updatedRow.DiffPercnt =
        OnHandBef !== 0 ? ((variance / OnHandBef) * 100).toFixed(2) : "";
    } else {
      updatedRow.Quantity = "";
      updatedRow.DiffPercnt = "";
    }

    // 🔹 Update RHF form array ONCE
    const lines = [...getValues("oLines")];
    lines[index] = updatedRow;
    setValue("oLines", lines, { shouldDirty: true });

    // 🔹 Optional async recalculation
    try {
      await updatePrices({ mode: "row", targetRowIndex: index });
    } catch (err) {
      console.error("updatePrices failed", err);
    }

    return updatedRow;
  };

  const handleDeleteRow = (index) => {
    const currentLines = getValues("oLines") || [];

    // identify deleted row (optional)
    const deletedRow = currentLines[index];

    // remove by index
    const updatedLines = currentLines.filter((_, i) => i !== index);

    // reassign IDs globally (important for continuous numbering)
    updatedLines.forEach((line, i) => (line.id = i));

    // update form
    setValue("oLines", updatedLines, { shouldDirty: true });

    // ✅ remove deleted row from selectedRows (so it doesn't come back)
    setSelectedRows((prev) =>
      prev.filter((r) => r.ItemCode !== deletedRow?.ItemCode),
    );

    // ✅ refresh the visible page (so DataGrid updates immediately)
    setTimeout(() => {
      fetchOlinePage(olinePage);
    }, 50);
  };
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
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

  const columns = [
    {
      field: "id",
      headerName: "LINE NO",
      width: 100,
      renderCell: (params) => <span>{params.id + 1}</span>,
    },

    { field: "ItemCode", headerName: "ITEM NO", width: 150 },

    {
      field: "ItemName",
      headerName: "ITEM DESC",
      width: 200,
      editable: true,
    },

    // ================= WHS CODE =================
    {
      field: "WHSCode",
      headerName: "WhsCode",
      width: 200,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowIndex = params.row.id;
        const hasValue = !!params.row.WHSCode;

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                const lines = [...getValues("oLines")];
                lines[rowIndex] = { ...lines[rowIndex], WHSCode: "" };
                reset({ ...allFormData, oLines: lines });
              }

              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (hasValue) return;

                setValue("selectedRowIndex", rowIndex);
                setWhscOpen(true);
              }
            }}
            sx={{ width: "100%", height: "100%", outline: "none" }}
          >
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap textAlign="center">
                {params.row.WHSCode || ""}
              </Typography>
            </Grid>

            <Grid item sx={{ width: 28 }}>
              <IconButton
                size="small"
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  setWhscOpen(true);
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

    // ================= BIN LOCATION =================
    {
      field: "BinEntry",
      headerName: "Bin Location",
      width: 250,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowIndex = params.row.id;
        const row = params.row;
        const hasValue = !!row.BinEntry;

        const disabled =
          SaveUpdateName === "UPDATE"
            ? (row.oDocBinLocationLines || []).length === 0
            : row.Status === "0" ||
              Number(row.DftBinAbs) < 0 ||
              row.BinActivat !== "Y";

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (disabled || hasValue) return;

                setValue("selectedRowIndex", rowIndex);
                fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
                setsearchmodelOpenAccount(true);
              }
            }}
            sx={{ width: "100%", height: "100%", outline: "none" }}
          >
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap textAlign="center">
                {row.BinEntry || ""}
              </Typography>
            </Grid>

            <Grid item sx={{ width: 28 }}>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
                  setsearchmodelOpenAccount(true);
                }}
                sx={{
                  backgroundColor: disabled ? "gray" : "green",
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

    // ================= ON HAND BEFORE =================
    {
      field: "OnHandBef",
      headerName: "IN WHSE QTY on COUNT DATE",
      width: 250,
      type: "number",
      renderCell: ({ value }) =>
        value == null ? "" : Number(value).toFixed(2),
    },

    // ================= UOM QTY =================
    {
      field: "UomQty",
      headerName: "UOM COUNTED QTY",
      width: 200,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowIndex = params.row.id;
        const hasValue = !!params.row.UomQty;

        const disabled =
          params.row.UgpEntry === "-1" || params.row.UgpEntry === -1;

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (disabled || hasValue) return;

                openUomModal(
                  rowIndex,
                  params.row.UgpEntry,
                  params.row.oInvPostUomsLines || [],
                );
              }
            }}
            sx={{ width: "100%", height: "100%", outline: "none" }}
          >
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap textAlign="center">
                {params.row.UomQty || ""}
              </Typography>
            </Grid>

            <Grid item sx={{ width: 28 }}>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={() =>
                  openUomModal(
                    rowIndex,
                    params.row.UgpEntry,
                    params.row.oInvPostUomsLines || [],
                  )
                }
                sx={{
                  backgroundColor: disabled ? "gray" : "green",
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

    {
      field: "UomCode",
      headerName: "UoM CODE",
      width: 150,
      editable: true,
    },

    // ================= COUNT QTY =================
    {
      field: "CountQty",
      headerName: "COUNTED QTY",
      width: 150,
      type: "number",
      editable: true,
      renderCell: ({ value }) =>
        value == null ? "" : Number(value).toFixed(2),
    },

    // ================= VARIANCE =================
    {
      field: "Quantity",
      headerName: "VARIANCE",
      width: 150,
      renderCell: ({ value }) =>
        value == null ? "" : Number(value).toFixed(2),
    },

    // ================= VARIANCE % =================
    {
      field: "DiffPercnt",
      headerName: "VARIANCE(%)",
      width: 150,
      renderCell: ({ value }) =>
        value == null ? "" : `${Number(value).toFixed(2)} %`,
    },

    {
      field: "Price",
      headerName: "Price",
      width: 150,
      renderCell: ({ value }) => (value == null ? "" : value),
    },

    {
      field: "DocTotal",
      headerName: "TOTAL",
      width: 150,
      renderCell: ({ value }) =>
        value == null ? "" : Number(value).toFixed(2),
    },

    {
      field: "ItmsPerUnt",
      headerName: "Items Per Unit",
      width: 150,
      editable: true,
    },

    // ================= SR / BATCH =================
    {
      field: "SrBatch",
      headerName: "Sr & Batch",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const { ManBtchNum, ManSerNum, BaseType, CountQty, WHSCode } =
          params.row;

        let disabled =
          BaseType === "16" ||
          (!ManBtchNum && !ManSerNum) ||
          !CountQty ||
          !WHSCode;

        let color =
          ManBtchNum === "Y"
            ? "primary"
            : ManSerNum === "Y"
              ? "success"
              : "default";

        return (
          <IconButton
            color={color}
            disabled={disabled}
            onClick={() => {
              if (ManBtchNum === "Y") {
                Number(params.row.Quantity) < 0
                  ? handleOnBatchOut(params.row)
                  : handleOnBatch(params.row);
              }
              if (ManSerNum === "Y") {
                Number(params.row.Quantity) < 0
                  ? handleOnSerialOut(params.row)
                  : handleOnSerial(params.row);
              }
            }}
          >
            <ViewListIcon />
          </IconButton>
        );
      },
    },

    // ================= OFFSET ACCOUNTS =================
    {
      field: "IOffIncAcc",
      headerName: "INCREASE ACCOUNT",
      width: 200,
      sortable: false,
      editable: false,
      renderCell: (params) => {
        const rowIndex = params.row.id;
        const hasValue = !!params.row.IOffIncAcc;

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (hasValue) return;

                setValue("selectedRowIndex", rowIndex);
                OpenDailogIncAccount();
              }
            }}
          >
            <Typography noWrap>{params.row.IOffIncAcc || ""}</Typography>

            <IconButton
              size="small"
              onClick={() => {
                setValue("selectedRowIndex", rowIndex);
                OpenDailogIncAccount();
              }}
              sx={{
                backgroundColor: "green",
                color: "white",
                borderRadius: "6px",
                ml: 1,
              }}
            >
              <ViewListIcon fontSize="small" />
            </IconButton>
          </Grid>
        );
      },
    },

    // ============================================================
    // 🔽 DECREASE ACCOUNT (TEXT + VIEWLIST ICON)
    // ============================================================
    {
      field: "DOffDecAcc",
      headerName: "DECREASE ACCOUNT",
      width: 200,
      sortable: false,
      editable: false,
      renderCell: (params) => {
        const rowIndex = params.row.id;
        const hasValue = !!params.row.DOffDecAcc;

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (hasValue) return;

                setValue("selectedRowIndex", rowIndex);
                OpenDailogIncDecAccount();
              }
            }}
          >
            <Typography noWrap>{params.row.DOffDecAcc || ""}</Typography>

            <IconButton
              size="small"
              onClick={() => {
                setValue("selectedRowIndex", rowIndex);
                OpenDailogIncDecAccount();
              }}
              sx={{
                backgroundColor: "green",
                color: "white",
                borderRadius: "6px",
                ml: 1,
              }}
            >
              <ViewListIcon fontSize="small" />
            </IconButton>
          </Grid>
        );
      },
    },

    // ================= ACTION =================
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

  // const columns = [
  //   {
  //     id: 1,
  //     field: "id",
  //     headerName: "LINE NO",
  //     width: 100,
  //     renderCell: (params) => <span>{params.id + 1}</span>,
  //   },
  //   { field: "ItemCode", headerName: "ITEM NO", width: 150 },
  //   {
  //     field: "ItemName",
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
  //           name={`oLines.${index}.WHSCode`}
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               {...field}
  //               value={field.value || params.value}
  //               error={!!error}
  //               disabled
  //               helperText={error?.message}
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
  //                       style={{
  //                         backgroundColor: "green",
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
  //     field: "BinEntry",
  //     headerName: "Bin Location",
  //     width: 250,
  //     editable: false,
  //     renderCell: (params) => {
  //       const row = params.row;
  //       return (
  //         <Controller
  //           name={`oLines.${params.row.id}.BinEntry`}
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextSearchButtonTable
  //               readOnly
  //               disabled={
  //                 SaveUpdateName === "UPDATE"
  //                   ? (params.row.oDocBinLocationLines || []).length === 0
  //                   : params.row.Status === "0" ||
  //                     Number(params.row.DftBinAbs) < 0 ||
  //                     params.row.BinActivat !== "Y"
  //               }
  //               onClick={() => {
  //                 setValue("selectedRowIndex", params.row.id);
  //                 // ✅ Fetch Bin Locations for that row before opening modal
  //                 fetchgetListDataAccount(row.ItemCode, row.WHSCode, 0);
  //                 setsearchmodelOpenAccount(true);
  //               }}
  //               {...field}
  //               value={row.BinEntry || ""}
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },

  //   {
  //     field: "OnHandBef",
  //     headerName: "IN WHSE QTY on COUNT DATE",
  //     width: 250,
  //     renderCell: (params) => {
  //       const index = params.row.id;
  //       return (
  //         <Controller
  //           name={`oLines.${index}.OnHandBef`}
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextField
  //               {...field}
  //               type="number"
  //               inputProps={{ maxLength: 19 }}
  //               value={field.value || ""}
  //               disabled
  //               onChange={(e) => {
  //                 field.onChange(e.target.value);
  //                 handleQtyChange(index); // 👈 recalc if OnHandBef changes
  //               }}
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },

  //   {
  //     field: "UomQty",
  //     headerName: "UOM COUNTED QTY",
  //     width: 200,
  //     renderCell: (params) => {
  //       const index = params.row.id;
  //       const row = params.row;
  //       const Disabled =
  //         params.row.UgpEntry === "-1" || params.row.UgpEntry === -1;
  //       return (
  //         <div className="keep-enabled">
  //           <Controller
  //             name={`oLines.${index}.UomQty`}
  //             control={control}
  //             render={({ field }) => (
  //               <InputTextField
  //                 {...field}
  //                 value={field.value || params.value}
  //                 disabled
  //                 InputProps={{
  //                   endAdornment: (
  //                     <InputAdornment position="end">
  //                       <IconButton
  //                         onClick={() =>
  //                           openUomModal(
  //                             index,
  //                             params.row.UgpEntry, // ✅ from full row
  //                             params.row.oInvPostUomsLines || [] // ✅ safe access from row
  //                           )
  //                         }
  //                         size="small"
  //                         color="primary"
  //                         disabled={Disabled}
  //                         style={{
  //                           backgroundColor: Disabled ? "gray" : "green",
  //                           borderRadius: "10%",
  //                           color: "white",
  //                           padding: 2,
  //                         }}
  //                       >
  //                         <ViewListIcon />
  //                       </IconButton>
  //                     </InputAdornment>
  //                   ),
  //                 }}
  //               />
  //             )}
  //           />
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     field: "UomCode",
  //     headerName: "UoM CODE",
  //     width: 150,
  //     editable: true,
  //   },
  //   {
  //     field: "CountQty",
  //     headerName: "COUNTED QTY",
  //     width: 150,
  //     renderCell: (params) => {
  //       const index = params.row.id;
  //       return (
  //         <Controller
  //           name={`oLines.${index}.CountQty`}
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextField
  //               {...field}
  //               type="number"
  //               inputProps={{ maxLength: 19 }}
  //               value={field.value || params.value}
  //               onChange={(e) => {
  //                 field.onChange(e.target.value); // ✅ update form value normally
  //                 handleQtyChange(index, e.target.value); // ✅ trigger calculation
  //               }}
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },
  //   {
  //     field: "Quantity",
  //     headerName: "VARIANCE",
  //     width: 150,
  //     renderCell: (params) => {
  //       const index = params.row.id;
  //       return (
  //         <Controller
  //           name={`oLines.${index}.Quantity`}
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextField {...field} value={field.value || ""} readOnly />
  //           )}
  //         />
  //       );
  //     },
  //   },
  //   {
  //     field: "DiffPercnt",
  //     headerName: "VARIANCE(%)",
  //     width: 150,
  //     renderCell: (params) => {
  //       const index = params.row.id;
  //       return (
  //         <Controller
  //           name={`oLines.${index}.DiffPercnt`}
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextField {...field} value={field.value || ""} readOnly />
  //           )}
  //         />
  //       );
  //     },
  //   },

  //   {
  //     field: "Price",
  //     headerName: "Price",
  //     sortable: false,
  //     width: 150,
  //   },
  //   {
  //     field: "DocTotal",
  //     headerName: "TOTAL",
  //     sortable: false,
  //     width: 150,
  //   },

  //   {
  //     field: "ItmsPerUnt",
  //     headerName: "Items Per Unit",
  //     width: 150,
  //     editable: true,
  //   },
  //   {
  //     field: "Sr.batch",
  //     headerName: "Sr & Batch",
  //     width: 100,
  //     sortable: false,
  //     renderCell: (params) => {
  //       const { ManBtchNum, ManSerNum, BaseType, CountQty, WHSCode } =
  //         params.row;
  //       console.log("sf54d", params.row);
  //       let iconColor = "default";
  //       let disabled = false;

  //       if (ManBtchNum === "Y" && ManSerNum === "N") {
  //         iconColor = "primary";
  //       } else if (ManBtchNum === "N" && ManSerNum === "Y") {
  //         iconColor = "success";
  //       } else if (ManBtchNum === "N" && ManSerNum === "N") {
  //         iconColor = "default";
  //         disabled = true;
  //       }
  //       if (BaseType === "16") {
  //         disabled = true;
  //       }

  //       const handleClick = () => {
  //         if (!CountQty || !WHSCode) {
  //           Swal.fire({
  //             toast: true,
  //             icon: "warning",
  //             title:
  //               "Please Enter Counted Qty and select Warehouse Code before Creating Serial and Batch.",
  //             position: "center",
  //             showConfirmButton: false,
  //             timer: 3000,
  //             timerProgressBar: true,
  //           });

  //           return;
  //         }

  //         if (ManBtchNum === "Y" && ManSerNum === "N") {
  //           if (Number(params.row.Quantity) < 0) {
  //             handleOnBatchOut(params.row); // negative quantity
  //           } else {
  //             handleOnBatch(params.row); // positive quantity
  //           }
  //         } else if (ManBtchNum === "N" && ManSerNum === "Y") {
  //           if (params.row.Quantity < 0) {
  //             handleOnSerialOut(params.row); // negative quantity
  //           } else {
  //             handleOnSerial(params.row); // positive quantity
  //           }
  //         }
  //       };

  //       return (
  //         <IconButton
  //           color={iconColor}
  //           onClick={handleClick}
  //           disabled={disabled}
  //         >
  //           <ViewListIcon />
  //         </IconButton>
  //       );
  //     },
  //   },
  //   {
  //     field: "IOffIncAcc",
  //     headerName: "Inventory Offset - Increase Account",
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name="IOffIncAcc"
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextSearchButtonTable
  //               readOnly
  //               onClick={() => {
  //                 setValue("selectedRowIndex", params.row.id);
  //                 OpenDailogIncAccount();
  //               }}
  //               {...field}
  //               value={params.row.IOffIncAcc} // Set default if empty
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },

  //   {
  //     field: "DOffDecAcc",
  //     headerName: "Inventory Offset - Decrease Account",
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name="DOffDecAcc"
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextSearchButtonTable
  //               readOnly
  //               onClick={() => {
  //                 setValue("selectedRowIndex", params.row.id);
  //                 OpenDailogIncDecAccount();
  //               }}
  //               {...field}
  //               value={params.row.DOffDecAcc} // Set default if empty
  //             />
  //           )}
  //         />
  //       );
  //     },
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
  const handleOnSerialOut = (rowData) => {
    const item = {
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      InvQty: Math.abs(rowData.Quantity),
      WHSCode: rowData.WHSCode,
      OpenQuantity: rowData.OpenQuantity,
      id: rowData.id,
    };
    setopenserialOut(true);

    setSelectedItem(item);
  };
  const handleOnSerial = (rowData) => {
    console.log(rowData);
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      InvQty: rowData.Quantity,
      WhsCode: rowData.WHSCode,
      // BaseType: rowData.BaseType,
      // BaseEntry: rowData.BaseEntry,
      // BaseNum: rowData.BaseNum,
      // BaseLinNum: rowData.BaseLinNum,
      // CardCode: rowData.CardCode,
      // CardName: rowData.CardName,
      // Direction: rowData.Direction,
      // TtlQuantity: rowData.TtlQuantity,
      // BsDocType: rowData.BsDocType,
      // BsDocEntry: rowData.BsDocEntry,
      // BsDocLine: rowData.BsDocLine,
      BinCode: rowData.BinCode,
      id: rowData.id,
    });
    setopenserial(true);
  };
  const handleOnBatchOut = (rowData) => {
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      InvQty: Math.abs(rowData.Quantity),
      WhsCode: rowData.WHSCode,
      BaseType: rowData.BaseType,
      BaseEntry: rowData.BaseEntry,
      BaseNum: rowData.BaseNum,
      BaseLinNum: rowData.BaseLinNum,
      CardCode: rowData.CardCode,
      CardName: rowData.CardName,
      id: rowData.id,
    });
    setopenBatchOut(true);
    console.log("batch out open", openBatchOut);
  };

  const handleOnBatch = (rowData) => {
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      InvQty: rowData.Quantity,
      WhsCode: rowData.WHSCode,
      // BaseType: rowData.BaseType,
      // BaseEntry: rowData.BaseEntry,
      // BaseNum: rowData.BaseNum,
      // BaseLinNum: rowData.BaseLinNum,
      // CardCode: rowData.CardCode,
      // CardName: rowData.CardName,
      BinCode: rowData.BinCode,
      id: rowData.id,
    });
    setopenBatch(true);
    console.log("selected item", selectedItem);
  };

  const onsubmitBatch = (data) => {
    const UpdatedoBatchLines = oLines.map((item, index) => {
      if (data.Ids === index) {
        return {
          ...item,
          oBatchLines: data.oBatchLines,
        };
      }
      return item;
    });
    setValue("oLines", UpdatedoBatchLines);
  };
  const onsubmitSeriel = (data) => {
    const UpdatedoSerialLines = oLines.map((item, index) => {
      if (data.Ids === index) {
        // ✅ Now data.Ids should match the index
        return {
          ...item,
          oSerialLines: data?.oSerialLines || data?.serials,
        };
      }
      return item;
    });
    setValue("oLines", UpdatedoSerialLines);

    // ✅ Refresh the paginated rows so DataGrid updates immediately
    setTimeout(() => {
      fetchOlinePage(olinePage);
    }, 50);
  };
  // ======================WHSCode Logic=============================
  const fetchWhscGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true); // 🔄 start loader (if you have one)

      let response;

      if (searchTerm?.trim()) {
        response = await apiClient.get(
          `/WarehouseV2/search/${searchTerm.trim()}/1/${pageNum}`,
        );
      } else {
        response = await apiClient.get(`/WarehouseV2/pages/1/${pageNum}`);
      }

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        setWhsHasMoreGetList(newData.length === 20);

        setWhscGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          icon: "info",
          text: response?.data?.message || "Failed to load warehouse list.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching warehouse list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch warehouse data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
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
  const handleWhsSelect = (selectedWhs) => {
    const rowIndex = getValues("selectedRowIndex");
    const oLines = getValues("oLines") || [];
    const selectedRow = oLines[rowIndex];
    if (!selectedRow) return;
    setValue(`oLines.${rowIndex}.WHSCode`, selectedWhs.WHSCode);
    setValue(`oLines.${rowIndex}.BinEntry`, "");
    setValue(`oLines.${rowIndex}.OnHandBef`, "");
    // ✅ Automatically recalc price based on WHS and PriceSrc
    updatePrices({ mode: "row", targetRowIndex: rowIndex });

    setWhscOpen(false);
  };

  //========================================Document Series API===========================
  const { DocSeries } = useDocumentSeries(
    "10000071",
    getValues("DocDate"),
    setValue,
    clearCache,
    SaveUpdateName,
  );

  const FetchPriceList = async () => {
    try {
      setIsLoading(true); // 🔄 start loader

      const res = await apiClient.get(`/PriceList/All`);

      if (res?.data?.success) {
        const filteredResponse = (res.data.values || []).filter(
          (item) => item.Status === "1",
        );

        setPriceList(filteredResponse);

        if (filteredResponse.length > 0) {
          const defaultDocEntry = filteredResponse[0]?.DocEntry ?? "";

          setValue("PriceList", defaultDocEntry);

          // Optional: trigger dependent logic
          // handlePriceListChange(defaultDocEntry);
        }
      } else {
        Swal.fire({
          icon: "info",
          text: res?.data?.message || "No active PriceList found.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching PriceList:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch PriceList data.",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  useEffect(() => {
    FetchPriceList();
    GLAcctData();
    fetchWhscGetListData(0); // Load first page on mount
    fetchOpenListData(0);
    fetchgetListDataDecAccount(0);
    fetchgetListDataIncAccount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const handleCellClick = (newSelection) => {
    setSelectedRows((prevSelected) => {
      // items selected on current page
      const newlySelected = itemList
        .filter((item) => newSelection.includes(item.DocEntry))
        .map((item) => {
          const loc = warehouseData.find(
            (row) => row.WHSCode === (item.DefaultWhs || item.WHSCode),
          );

          return {
            ...item,
            BinCode: loc?.BinCode ?? "",
            DftBinAbs: loc?.DftBinAbs ?? "",
            BinActivat: loc?.BinActivat ?? "",
          };
        });

      // keep previous selections that are NOT on this page
      const preserved = prevSelected.filter(
        (item) => !itemList.some((row) => row.DocEntry === item.DocEntry),
      );

      // merge safely (no duplicates)
      const merged = [...preserved, ...newlySelected];

      return merged;
    });
  };

  const updatePrices = async ({
    mode = "all", // "all" | "new" | "row"
    targetRowIndex = null,
  }) => {
    const PriceSrc = getValues("PriceSrc");
    const selectedPriceList = getValues("PriceList");
    const oLines = getValues("oLines") || [];
    const postingDate = watchPostingDate;
    const localCurrency = companyData?.MainCurncy;

    if (oLines.length === 0 || selectedRows.length === 0) return;

    // 🔹 Lookup maps
    const priceListMap = new Map();
    const invntMap = new Map();
    const lstEvalMap = new Map();

    selectedRows.forEach((item) => {
      if (item.oLines?.length) {
        const plMap = new Map(item.oLines.map((pl) => [pl.PriceList, pl]));
        priceListMap.set(item.ItemCode, plMap);
      }
      if (item.oInvntLines?.length) {
        const whsMap = new Map(
          item.oInvntLines.map((inv) => [inv.WHSCode, inv]),
        );
        invntMap.set(item.ItemCode, whsMap);
      }
      if (item.LstEvlPric) {
        lstEvalMap.set(item.ItemCode, item.LstEvlPric);
      }
    });

    let rate = 1;
    let selectedCurrency = localCurrency;

    if (PriceSrc === "1" && selectedPriceList) {
      const selectedListObj = priceList.find(
        (p) => String(p.DocEntry) === String(selectedPriceList),
      );

      if (
        selectedListObj?.PrimCurr &&
        selectedListObj.PrimCurr !== localCurrency
      ) {
        selectedCurrency = selectedListObj.PrimCurr;
        rate = await fetchExchangeRate(postingDate, selectedCurrency);
      }
    }

    // 🧩 Compute Price
    const computePrice = (line) => {
      const updated = { ...line };
      let numericPrice = 0;
      let currency = localCurrency;

      // 🔸 Price Source 1 → Price List
      if (PriceSrc === "1" && selectedPriceList) {
        const matched = priceListMap.get(line.ItemCode)?.get(selectedPriceList);
        if (matched) {
          numericPrice = parseFloat(matched.Price) || 0;
          currency = matched.Currency || selectedCurrency;
          updated.Price = `${currency} ${numericPrice.toFixed(3)}`;
          updated.RawPrice = numericPrice.toFixed(3);
          updated.Currency = currency;
        } else {
          updated.Price = "";
          updated.RawPrice = "";
          updated.Currency = "";
        }
      }

      // 🔸 Price Source 2 → Last Evaluated Price
      else if (PriceSrc === "2") {
        numericPrice = parseFloat(lstEvalMap.get(line.ItemCode)) || 0;
        currency = localCurrency;
        updated.Price = numericPrice.toFixed(3);
        updated.RawPrice = numericPrice.toFixed(3);
        updated.Currency = currency;
      }

      // 🔸 Price Source 3 → Warehouse Avg. Price
      else if (PriceSrc === "3") {
        const whsData = invntMap.get(line.ItemCode)?.get(line.WHSCode);
        if (whsData) {
          numericPrice = parseFloat(whsData.AvgPrice) || 0;
          currency = localCurrency;
          updated.Price = numericPrice.toFixed(3);
          updated.RawPrice = numericPrice.toFixed(3);
          updated.Currency = currency;
        } else {
          updated.Price = "";
          updated.RawPrice = "";
          updated.Currency = "";
        }
      }

      // 🧾 Compute DocTotal once
      const CountQty = parseFloat(line.CountQty || 0);
      const OnHandBef = parseFloat(line.OnHandBef || 0);
      const calculateDocTotal = (countQty, onHandBef, price, rate) => {
        if (
          countQty === null ||
          onHandBef === null ||
          price === null ||
          rate === null ||
          isNaN(countQty) ||
          isNaN(onHandBef) ||
          isNaN(price) ||
          isNaN(rate)
        )
          return "";
        return ((countQty - onHandBef) * price * rate).toFixed(2);
      };
      updated.DocTotal = calculateDocTotal(
        CountQty,
        OnHandBef,
        numericPrice,
        rate,
      );

      return updated;
    };

    // 🔹 Apply mode
    if (mode === "row" && targetRowIndex !== null) {
      const line = oLines[targetRowIndex];
      const updated = computePrice(line);
      setValue(`oLines.${targetRowIndex}`, updated);
    } else {
      const updatedLines = oLines.map((line) => computePrice(line));
      setValue("oLines", updatedLines, {
        shouldValidate: false,
        shouldDirty: true,
      });

      // ✅ NEW: Refresh the paginated DataGrid rows after bulk update
      setTimeout(() => {
        fetchOlinePage(olinePage);
      }, 50);
    }
  };
  const onSubmit = () => {
    const existingLines = getValues("oLines") || [];
    const glDefaults = getDefaultGLAccounts();
    // 1️⃣ Filter only new items
    const newItems = selectedRows.filter(
      (item) => !existingLines.some((line) => line.ItemCode === item.ItemCode),
    );

    if (newItems.length === 0) {
      closeModel();
      return;
    }

    // 2️⃣ Map new items into oLines structure
    const newFormatted = newItems.map((item) => {
      const matchedInvLine = item.oInvntLines?.find(
        (inv) => inv.WHSCode === item.DefaultWhs,
      );
      const onHandFromInvnt = matchedInvLine?.OnHand ?? 0;

      return {
        ...item,
        id: item.DocEntry,
        ItemCode: item.ItemCode,
        ItemName: item.ItemName,
        WHSCode: item.DefaultWhs || "",
        Price: "",
        RawPrice: "",
        Currency: "",
        BinEntry: "",
        OnHandBef: onHandFromInvnt,
        UgpEntry: item.UgpEntry,
        DocTotal: "",
        BinDocEntry: "",
        UomCode: item.UOMCode || "",
        CountQty: "",
        BinActivat: item.BinActivat,
        IOffIncAcc: glDefaults?.inc || "",
        DOffDecAcc: glDefaults?.dec || "",
      };
    });

    // 3️⃣ Merge new + old safely
    const mergedLines = [...existingLines, ...newFormatted];
    setOlineRows(mergedLines);

    // 4️⃣ Update form value
    setValue("oLines", mergedLines, {
      shouldValidate: false,
      shouldDirty: true,
    });

    // 5️⃣ Close modal
    closeModel();

    // 6️⃣ Recalculate prices
    setTimeout(() => {
      updatePrices({ mode: "all" });
    }, 0);

    // 7️⃣ 🆕 Refresh paginated rows view
    // setTimeout(() => {
    //   fetchOlinePage(olinePage); // ✅ show updated data on grid
    // }, 50);
  };

  const handleClickOpen = () => {
    setOpen(true);
    fetchItems(0, "");
  };
  const closeModel = () => {
    setOpen(false);
  };
  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;

      // ✅ Use cache if available (skip loader & API)
      if (itemCache[cacheKey]) {
        setItemList(itemCache[cacheKey]);
        return;
      }

      try {
        setIsLoading(true);

        const { data } = await apiClient.get("/ItemsV2", {
          params: {
            InventoryItem: "Y",
            Status: 1,
            SearchText: search?.trim() || undefined, // avoid empty string
            Page: page,
            Limit: LIMIT,
          },
        });

        if (data?.success) {
          const items = data?.values || [];

          // ✅ Cache result
          setItemCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));

          setItemList(items);

          // ✅ Safer estimated row count (for infinite scroll / DataGrid)
          setRowCount(
            page === 0 ? items.length + 1 : page * LIMIT + items.length + 1,
          );
        } else {
          Swal.fire({
            icon: "warning",
            title: "Warning",
            text: data?.message || "No items found.",
          });
        }
      } catch (err) {
        console.error("❌ Error fetching items:", err);

        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch items.",
        });
      } finally {
        setIsLoading(false); // ✅ always stop loader
      }
    },
    [itemCache],
  );

  useEffect(() => {
    fetchItems(currentPage, searchText);
  }, [currentPage, searchText]);
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

      const response = await apiClient.get("/InventoryPosting", { params });

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
      console.error("❌ Error fetching InventoryPosting:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Inventory Posting data.",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader (always)
    }
  };

  const handleSubmitForm = async (data) => {
    try {
      //======================== Validate oLines ========================
      if (!data.oLines || data.oLines.length === 0) {
        Swal.fire({
          title: "No Line Items",
          text: "Please add at least one line item before saving.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }
      const requiredFields = [
        "ItemCode",
        "ItemName",
        "WHSCode",
        "OnHandBef",
        "UomCode",
        "CountQty",
        "Price",
        "IOffIncAcc",
        "DOffDecAcc",
      ];

      // Loop through all oLines to check missing values
      for (let i = 0; i < data.oLines.length; i++) {
        const line = data.oLines[i];

        for (const field of requiredFields) {
          if (
            line[field] === "" ||
            line[field] === null ||
            line[field] === undefined
          ) {
            Swal.fire({
              title: "Missing Line Item Data",
              text: `Line ${i + 1}: ${field} is required.`,
              icon: "warning",
              confirmButtonText: "Ok",
            });
            return;
          }
        }
      }
      //======================== Prepare Attachment FormData ========================
      const formData = new FormData();
      formData.append("DocEntry", allFormData.AttcEntry || "");
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

      //======================== Upload Attachment if Exists ========================
      let attachmentDocEntry = null;
      if (fileData?.length > 0 && SaveUpdateName === "SAVE") {
        try {
          setIsLoading(true);
          const attachmentRes = await apiClient.post("/Attachment", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (!attachmentRes.data.success) {
            Swal.fire({
              title: "Error!",
              text: attachmentRes.data.message,
              icon: "error",
              confirmButtonText: "Ok",
            });
            return;
          }

          attachmentDocEntry = attachmentRes.data.ID;
        } catch (err) {
          console.error("Attachment upload failed:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to upload attachments.",
            icon: "error",
            confirmButtonText: "Ok",
          });
          return;
        } finally {
          setIsLoading(false);
        }
      }

      //======================== Build Main Payload ========================
      const obj = {
        DocEntry: data.DocEntry || 0,
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs().format("YYYY-MM-DD"),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs().format("YYYY-MM-DD"),
        Status: 1,
        AttcEntry: attachmentDocEntry || data.AttcEntry || "0",
        IOffIncAcc: data.IOffIncAcc || "",
        DOffDecAcc: data.DOffDecAcc || "",
        DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
        Comments: data.Comments || "",
        DocDueDate: dayjs(data.DocDueDate).format("YYYY-MM-DD"),
        JdtNum: data.JdtNum || 0,
        ObjType: "10000071",
        Series: data.Series || 0,
        PriceSrc: data.PriceSrc || 0,
        PriceList: data.PriceList || 0,
        JrnlMemo: data.JrnlMemo || "",
        CountDate: dayjs(data.CountDate || new Date()).format("YYYY-MM-DD"),
        CountTime: data.CountTime || 0,
        WddStatus: data.WddStatus || "",
        DocTotal: Number(data.DocTotal) || 0,
        BaseEntry: data.BaseEntry || 0,
        DocNum: data.DocNum || "",
        FinncPriod: String(data.FinncPriod || "0"),
        PIndicator: data.PIndicator || "0",
        oLines: (data.oLines || []).map((line, index) => {
          const rate = Number(SystemRate);
          const lineDocTotal = Number(line.DocTotal) || 0;

          const docTotalSy =
            rate > 0 && Number.isFinite(rate)
              ? (lineDocTotal / rate).toFixed(6)
              : "0.000000";

          return {
            LineNum: line.LineNum || 0,
            DocEntry: data.DocEntry || 0,
            UserId: user.UserId,
            CreatedBy: user.UserName,
            CreatedDate: dayjs().format("YYYY-MM-DD"),
            ModifiedBy: user.UserName,
            ModifiedDate: dayjs().format("YYYY-MM-DD"),
            Status: 1,
            ItemCode: line.ItemCode || "",
            ItemName: line.ItemName || "",
            InvntryUom: line.InvntryUom || "",
            OnHandBef: Number(line.OnHandBef) || 0,
            Price: Number(String(line.Price).replace(/[^\d.-]/g, "")) || 0,
            Quantity: String(line.Quantity) || 0,
            Currency: line.Currency || "",
            Rate: Number(line.Rate) || 0,
            IOffIncAcc: line.IOffIncAcc || "",
            DOffDecAcc: line.DOffDecAcc || "",
            OcrCode: line.OcrCode || "",
            WHSCode: line.WHSCode || "",
            DocTotal: Number(line.DocTotal) || 0,
            DocTotalFC: Number(line.DocTotalFC) || 0,
            DocTotalSy: docTotalSy,
            ObjType: "10000071",
            BarCode: line.BarCode || "",
            InvUoM: line.InvUoM || "",
            BinEntry: line.BinDocEntry || line.BinEntry || 0,
            FirmCode: 0,
            SuppCatNum: line.SuppCatNum || "",
            CountDate: dayjs(line.CountDate || new Date()).format("YYYY-MM-DD"),
            CountTime: line.CountTime || 0,
            DiffPercnt: Number(line.DiffPercnt) || 0,
            BaseRef: line.BaseRef || "",
            BaseType: line.BaseType || 0,
            BaseEntry: line.BaseEntry || 0,
            BaseLine: line.BaseLine || 0,
            CountQty: Number(line.CountQty) || 0,
            Remark: line.Remark || "",
            CpyCount: line.CpyCount || 0,
            BinNegQty: line.BinNegQty || "",
            VisOrder: index + 1,
            UgpEntry: line.UgpEntry || 0,
            IUomEntry: line.IUomEntry || "",
            UomCode: line.UomCode || "",
            ItmsPerUnt: Number(line.ItmsPerUnt) || 0,
            UomQty: Number(line.UomQty) || 0,
            ActPrice: Number(line.ActPrice) || 0,
            PostValueL: Number(line.PostValueL) || 0,
            PostValueS: Number(line.PostValueS) || 0,
            oSerialLines: (line.oSerialLines || []).map((serialItem) => ({
              DocEntry: serialItem.DocEntry || "",
              UserId: user.UserId,
              CreatedBy: user.UserName,
              CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
              ModifiedBy: "",
              ModifiedDate: "",
              Status: serialItem.Status,
              ItemCode: line.ItemCode,
              CardCode: data.CardCode || "",
              CardName: data.CardName || "",
              ItemName: line.ItemName,
              WhsCode: line.WHSCode || "",
              SysSerial: String(serialItem.SysSerial || ""),
              SuppSerial: serialItem.SuppSerial || "",
              IntrSerial: String(serialItem.IntrSerial || ""),
              BatchId: serialItem.BatchId || "",
              GrntStart: serialItem.GrntStart,
              GrntExp: serialItem.GrntExp,
              ExpDate: serialItem.ExpDate,
              PrdDate: serialItem.PrdDate,
              InDate: dayjs(serialItem.InDate).format("YYYY-MM-DD"),
              Notes: serialItem.Notes || "",
              Quantity: "1",
              BaseType: "15",
              BaseNum: data.DocNum || "-1",
              BaseEntry: serialItem.BaseEntry || "-1",
              BaseLinNum: serialItem.BaseLinNum || "-1",
              CreateDate: dayjs(undefined).format("YYYY-MM-DD"),
              Direction: serialItem.Direction,
              TtlQuantity: String(line.Quantity || 0),
              BsDocType: serialItem.BsDocType || "",
              BsDocEntry: serialItem.BsDocEntry || "",
              BsDocLine: serialItem.BsDocLine || "",
            })),
            oBatchLines: (line.oBatchLines || []).map((BatchItem) => ({
              DocEntry: BatchItem.DocEntry || "",
              UserId: user.UserId,
              CreatedBy: user.UserName,
              CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
              ModifiedBy: "",
              ModifiedDate: new Date().toISOString(),
              Status: BatchItem.Status,
              BaseNum: data.DocNum || "-1",
              ItemCode: String(line.ItemCode || ""),
              CardCode: data.CardCode || "1",
              CardName: data.CardName || "1",
              ItemName: line.ItemName || "1",
              BatchNum: BatchItem.BatchName || "",
              SysNumber: BatchItem.SysNumber || "1",
              SysSerial: String(BatchItem.SysSerial || "1"),
              SuppSerial: BatchItem.SuppSerial || "1",
              IntrSerial: String(BatchItem.IntrSerial || "1"),
              BatchId: BatchItem.BatchId || "1",
              ExpDate: BatchItem.ExpDate
                ? dayjs(BatchItem.ExpDate).format("YYYY-MM-DD")
                : null,
              PrdDate: BatchItem.PrdDate
                ? dayjs(BatchItem.PrdDate).format("YYYY-MM-DD")
                : null,
              InDate:
                dayjs(BatchItem.InDate).format("YYYY-MM-DD") ||
                dayjs(undefined).format("YYYY-MM-DD"),
              WhsCode: BatchItem.WHSCode || "",
              Notes: BatchItem.Notes || "",
              Quantity: String(BatchItem.BatchQty || "1"),
              BaseType: "15",
              BaseEntry: data.BaseEntry || "-1",
              BaseLinNum: BatchItem.BaseLinNum || "-1",
              CreateDate: dayjs(undefined).format("YYYY-MM-DD"),
              Direction: BatchItem.Direction,
              TtlQuantity: String(line.Quantity || 0),

              BsDocType: BatchItem.BsDocType || "1",
              BsDocEntry: BatchItem.BsDocEntry || "1",
              BsDocLine: BatchItem.BsDocLine || "1",
            })),
            oInvPostUomsLines: (line.oInvPostUomsLines || []).map((uom) => ({
              LineNum: uom.LineNum || 0,
              DocEntry: data.DocEntry || 0,
              UserId: user.UserId,
              CreatedBy: user.UserName,
              CreatedDate: dayjs().format("YYYY-MM-DD"),
              ModifiedBy: user.UserName,
              ModifiedDate: dayjs().format("YYYY-MM-DD"),
              Status: 1,
              ChildNum: uom.ChildNum || 0,
              BarCode: uom.BarCode || "",
              UomCode: uom.UomCode || "",
              UomQty: Number(uom.UomQty) || 0,
              CountQty: Number(uom.CountQty) || 0,
              Tk1UomQty: Number(uom.Tk1UomQty) || 0,
              Tk2UomQty: Number(uom.Tk2UomQty) || 0,
              Tk1CntQty: Number(uom.Tk1CntQty) || 0,
              Tk2CntQty: Number(uom.Tk2CntQty) || 0,
              ItmsPerUnt: Number(uom.ItmsPerUnt) || 0,
              UgpEntry: line.UgpEntry || 0,
              TeamUomQty: Number(uom.TeamUomQty) || 0,
              TeamCntQty: Number(uom.TeamCntQty) || 0,
              IUomEntry: uom.IUomEntry || "",
              ItmNum: String(index + 1),
            })),
          };
        }),
      };
      console.log("oLines", oLines);
      //======================== SAVE ========================
      if (SaveUpdateName === "SAVE") {
        try {
          setIsLoading(true);
          const res = await apiClient.post(`/InventoryPosting`, obj);
          if (res.data.success) {
            ClearForm();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            setClearCache(true);
            Swal.fire({
              title: "Success!",
              text: "Inventory Posting saved Successfully",
              icon: "success",
              timer: 1000,
            });
          } else {
            if (attachmentDocEntry)
              await apiClient.delete(`/Attachment/${attachmentDocEntry}`);
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "error",
            });
          }
        } catch (err) {
          if (attachmentDocEntry)
            await apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          console.error("InventoryPosting Save Error:", err);
          Swal.fire({
            title: "Error!",
            text: "Something went wrong during save.",
            icon: "error",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        //======================== UPDATE ========================
        const confirm = await Swal.fire({
          text: `Do you want to update ?`,
          icon: "question",
          showDenyButton: true,
          confirmButtonText: "YES",
          denyButtonText: "No",
        });

        if (confirm.isConfirmed) {
          try {
            setIsLoading(true);
            if (data.AttcEntry > "0") {
              await apiClient.put(`/Attachment/${data.AttcEntry}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            }

            const response = await apiClient.put(
              `/InventoryPosting/${data.DocEntry}`,
              obj,
            );

            if (response.data.success) {
              ClearForm();
              setOpenListPage(0);
              setOpenListData([]);
              fetchOpenListData(0);
              setClearCache(true);
              Swal.fire({
                title: "Success!",
                text: "Inventory Posting Updated",
                icon: "success",
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: "Error!",
                text: response.data.message,
                icon: "error",
              });
            }
          } catch (err) {
            console.error("Update Error:", err);
            Swal.fire({
              title: "Error!",
              text: "Something went wrong during update.",
              icon: "error",
            });
          } finally {
            setIsLoading(false);
          }
        } else {
          Swal.fire({
            text: "Inventory Posting Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      Swal.fire({
        title: "Error!",
        text: error || "Unexpected error occurred during form submission.",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          setStockPostingData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setStockPostingData(DocEntry);
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
  const setStockPostingData = async (DocEntry) => {
    if (!DocEntry) return;

    // 🔹 Reset local/UI states first
    setSelectedRows([]);
    setSelectedData([]);
    setItemCache({});
    setValue("oLines", []);

    try {
      setIsLoading(true); // 🔄 start loader

      const response = await apiClient.get("/InventoryPosting", {
        params: { DocEntry },
      });

      if (!response.data?.success) {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: response.data?.message || "Record not found.",
        });
        return;
      }

      const data = response.data.values;

      if (!data?.oLines?.length) {
        Swal.fire({
          icon: "info",
          title: "Info",
          text: "No line items found for this document.",
        });
        return;
      }

      // 🔹 Format lines safely
      const formattedLines = data.oLines.map((line) => ({
        ...line,
        id: line.LineNum, // stable unique key
      }));

      const updatedData = { ...data, oLines: formattedLines };

      // ✅ Update UI + form states
      toggleDrawer();
      reset(updatedData);
      setOlineRows(formattedLines);
      setFilesFromApi(data.AttcEntry || null);
      setSaveUpdateName("UPDATE");
      setSelectedData(DocEntry);
    } catch (error) {
      console.error("❌ Error fetching Inventory Posting:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Inventory Posting data.",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };

  const fetchCopyFromData = async (pageNum = 0, searchTerm = "") => {
    try {
      setIsLoading(true); // 🔄 start loader

      const response = await apiClient.get("/InventoryPosting/CopyFrom", {
        params: {
          Status: 1,
          Page: pageNum,
          Limit: 20,
          ...(searchTerm?.trim() && { SearchText: searchTerm.trim() }),
        },
      });

      if (response.data?.success) {
        const newData = response.data.values || [];

        setHasMorePOList(newData.length === 20);
        setGetListPOData((prev) =>
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
      console.error("❌ Error fetching Copy From data:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Copy From data.",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
    }
  };

  const handleGetListSearchCopyFrom = (resp) => {
    setGetLIstQueryCopyFrom(resp);
    setGetListSearchingCopyFrom(true);
    setGetListPageCopyFrom(0);
    setGetListPOData([]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCopyFromData(0, resp, "I");
    }, 600);
  };

  const handleGetListClearCopyFrom = () => {
    setGetLIstQueryCopyFrom("");
    setGetListSearchingCopyFrom(true);
    setGetListPageCopyFrom(0);
    setGetListPOData([]);
    fetchCopyFromData(0, "", "I");
  };

  const fetchMoreGetListCopyFrom = () => {
    fetchCopyFromData(
      getListPageCopyFrom + 1,
      getListSearchingCopyFrom ? getListqueryCopyFrom : "",
    );
    setGetListPageCopyFrom((prev) => prev + 1);
  };

  useEffect(() => {
    fetchCopyFromData(0);
  }, []);

  const onClickCopyFrom = useCallback((e, item, DocEntry, CountType) => {
    const checked = e.target.checked;
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = {
        ...prevCheckedItems,
        [DocEntry]: checked,
      };
      return newCheckedItems;
    });
    setSelectedObjects((prev) => {
      if (checked) {
        // Add item only if not already present
        const alreadyExists = prev.some((obj) => obj.DocEntry === DocEntry);
        if (!alreadyExists) {
          return [...prev, { ...item }];
        }
        return prev;
      } else {
        // Remove item if unchecked
        return prev.filter((obj) => obj.DocEntry !== DocEntry);
      }
    });
  }, []);
  const handleOpenPurchase = () => {
    console.log("Copy Form Collect", selectedObjects);
    if (selectedObjects && selectedObjects.length > 0) {
      const uniqueTypes = [
        ...new Set(selectedObjects.map((obj) => obj.CountType)),
      ];
      setOlineRows([]);
      setValue("oLines", []);
      if (uniqueTypes.length > 1) {
        Swal.fire({
          title: "Warning!",
          text: "Inventory counting types are different; reselect an inventory counting type",
          icon: "warning",
          confirmButtonText: "Ok",
          // background: theme.palette.mode === "light" ? "#F5F6FA" :"#080D2B",
          // color: theme.palette.mode === "light" ? "#000" : "#fff",
          // confirmButtonColor: theme.palette.mode === "light" ? "#1976d2" : "#90caf9", // MUI blue
        });

        return; // stop further execution
      }
    }
    const UpdatedCopyData = selectedObjects
      .flatMap((item, index) => item.oLines)
      .map((oLines, index) => ({
        ...oLines,
        id: index,
        ItemName: oLines.ItemDesc,
        OnHandBef: oLines.InWhsQty,
        Quantity: oLines.Difference,
        DiffPercnt: oLines.DiffPercnt,
        ItmsPerUnt:
          oLines.oUomLines.length === 1 ? oLines.oUomLines[0].ItmsPerUnt : "",
        DOffDecAcc: oLines.IncreasAc,
        IOffIncAcc: oLines.DecreasAc,
        checked: true,
        oInvPostUomsLines: oLines.oUomLines,
      }));
    console.log("UpdatedCopyData", UpdatedCopyData);

    let CountType = selectedObjects.some(
      (CountType) => CountType.CountType === "2",
    );
    if (CountType) {
      setopenCopyCheck(CountType);
      const allUomsLines = selectedObjects.flatMap(
        (item) => item.oIndCountersLines || [],
      );
      console.log("oTeamCounterLines", allUomsLines);
      setMultipleCount(allUomsLines);
      setOpenCopyForm(true);
    } else {
      setOpenCopyForm(false);
      setOlineRows((prev) => {
        const updated = [...prev, ...UpdatedCopyData];
        setValue("oLines", updated);
        return updated;
      });
    }
  };

  console.log("fdfdsfsdfdsf", olineRows);

  const handleSubmitMultiple = async () => {
    try {
      setIsLoading(true); // 🔄 start loader

      // 🔹 Build params safely
      const params = {};

      if (selectedValue === "TMC") {
        params.TeamCounted = "TMC";
      } else if (!isNaN(selectedValue) && Number(selectedValue) >= 1) {
        params.CounterID = Number(selectedValue);
      } else if (selectedValue === "-1") {
        params.ItmWithDiffQty = "-1";
      }

      console.log("📌 CopyFrom params:", params);

      const response = await apiClient.get("/InventoryPosting/CopyFrom", {
        params,
      });

      if (response.data?.success) {
        const newData = response.data.values || [];

        if (!newData.length || !newData[0]?.oLines?.length) {
          Swal.fire({
            icon: "info",
            title: "Info",
            text: "No data available to copy.",
          });
          return;
        }

        const UpdatedCopyData = newData[0].oLines.map((item, index) => ({
          ...item,
          id: `${Date.now()}_${index}`, // ✅ stable unique id
          ItemName: item.ItemDesc,
          OnHandBef: item.InWhsQty,
          Quantity: item.Difference,
          DiffPercnt: item.DiffPercent,
          ItmsPerUnt:
            item.oUomLines?.length === 1 ? item.oUomLines[0]?.ItmsPerUnt : "",
          DOffDecAcc: item.IncreasAc,
          IOffIncAcc: item.DecreasAc,
          oInvPostUomsLines: item.oUomLines || [],
        }));

        setOlineRows((prev) => {
          const updated = [...prev, ...UpdatedCopyData];
          setValue("oLines", updated);
          return updated;
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: response.data?.message || "Failed to copy data.",
        });
      }
    } catch (error) {
      console.error("❌ Error in handleSubmitMultiple:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while copying data.",
      });
    } finally {
      setIsLoading(false); // ✅ stop loader always
      setOpenCopyForm(false);
      setopenCopyCheck(false);
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
          Inventory Posting List
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
                    subtitle={dayjs(item.DocDate).format("DD-MM-YYYY")}
                    description={dayjs(item.CountDate).format("DD-MM-YYYY")}
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
      {selectedItem && (
        <StockPostingSerialOut
          Title="SERIAL NUMBER"
          openserialmodal={openserialOut}
          DialogClosePayto={handleCloseSerialOut}
          onSubmit={(serialData) => onsubmitSeriel(serialData)}
          ItemCode={selectedItem.ItemCode}
          ItemName={selectedItem.ItemName}
          Quantity={selectedItem.InvQty}
          WHSCode={selectedItem.WHSCode}
          OpenQuantity={selectedItem.OpenQuantity}
          Ids={selectedItem?.id}
        />
      )}
      {selectedItem && (
        <SerialIntake
          Title="SERIAL NUMBER"
          openserialmodal={openserial}
          DialogClosePayto={handleCloseSerial}
          onSubmit={(serialData) => onsubmitSeriel(serialData)}
          ItemCode={selectedItem?.ItemCode}
          ItemName={selectedItem?.ItemName}
          Quantity={ValueFormatter(selectedItem?.InvQty, 0)}
          WhsCode={selectedItem?.WhsCode}
          // BaseType={selectedItem?.BaseType}
          // BaseEntry={selectedItem?.BaseEntry}
          // BaseNum={selectedItem?.BaseNum}
          // BaseLinNum={selectedItem?.BaseLinNum}
          // CardCode={selectedItem?.CardCode}
          // CardName={selectedItem?.CardName}
          // Direction={selectedItem?.Direction}
          // TtlQuantity={selectedItem?.TtlQuantity}
          // BsDocType={selectedItem?.BsDocType}
          // BsDocEntry={selectedItem?.BsDocEntry}
          // BsDocLine={selectedItem?.BsDocLine}
          BinCode={selectedItem?.BinCode}
          Ids={selectedItem?.id}
        />
      )}
      {selectedItem && (
        <StockPostingBatchOut
          Title="BATCH NUMBER"
          openBatchmodal={openBatchOut}
          DialogClosePayto={handleCloseBatchOut}
          onSubmit={(BatchData) => onsubmitBatch(BatchData)}
          ItemCode={selectedItem?.ItemCode}
          ItemName={selectedItem?.ItemName}
          Quantity={selectedItem?.InvQty}
          WHSCode={selectedItem?.WhsCode}
          Ids={selectedItem?.id}
        />
      )}
      {selectedItem && (
        <BatchIntake
          Title="BATCH NUMBER"
          openBatchmodal={openBatch}
          DialogClosePayto={handleCloseBatch}
          onSubmit={(BatchData) => onsubmitBatch(BatchData)}
          ItemCode={selectedItem?.ItemCode}
          ItemName={selectedItem?.ItemName}
          Quantity={selectedItem?.InvQty}
          WHSCode={selectedItem?.WhsCode}
          BinCode={selectedItem?.BinCode}
          Ids={selectedItem?.id}
        />
      )}
      <Dialog
        open={exchangeRateModalOpen}
        // onClose={() => setExchangeRateModalOpen(false)}
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

          {/* <Button
            variant="outlined"
            color="error"
            onClick={() => setExchangeRateModalOpen(false)}
          >
            Cancel
          </Button> */}
        </DialogActions>
      </Dialog>
      <Dialog open={uomModalOpen} maxWidth="md" fullWidth>
        <DialogTitle textAlign={"center"}>Inventory Posting By UOM</DialogTitle>
        <DialogContent>
          {selectedUomIndex !== null && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                mt: 2,
                fontSize: "14px",
              }}
            >
              <Grid container spacing={2}>
                {/* 🟩 Row 1 */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Item Name:</strong>{" "}
                    {getValues(`oLines.${selectedUomIndex}.ItemCode`) || "--"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Item Description:</strong>{" "}
                    {getValues(`oLines.${selectedUomIndex}.ItemName`) || "--"}
                  </Typography>
                </Grid>

                {/* 🟩 Row 2 */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Warehouse Code:</strong>{" "}
                    {getValues(`oLines.${selectedUomIndex}.WHSCode`) || "--"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>In WHS Qty:</strong>{" "}
                    {getValues(`oLines.${selectedUomIndex}.OnHandBef`) || "--"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          <Divider sx={{ mb: 2, borderColor: "#bbb" }} />

          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              className="datagrid-style"
              rows={uomRows || []}
              getRowClassName={(params) =>
                SaveUpdateName === "UPDATE" ? "disabled-row" : ""
              }
              // isRowSelectable={(params) => params.row.BaseType >= 1}
              sx={{
                backgroundColor:
                  theme.palette.mode === "light" ? "#fff" : "#373842",
              }}
              hideFooter
              columns={[
                {
                  field: "checked",
                  headerName: "",
                  width: 50,
                  renderCell: (params) => (
                    <Checkbox
                      checked={params.row.checked || false}
                      disabled={params.row.BaseType >= 1}
                      onChange={(e) => {
                        const updated = [...uomRows];
                        updated[params.row.id - 1].checked = e.target.checked;
                        setUomRows(updated);
                      }}
                    />
                  ),
                },
                { field: "UomCode", headerName: "UOM CODE", width: 150 },
                {
                  field: "ItmsPerUnt",
                  headerName: "Items Per Unit",
                  width: 150,
                  valueFormatter: (p) => p.value?.toFixed(3),
                },
                {
                  field: "UomQty",
                  headerName: "UOM Counted Qty",
                  width: 180,
                  renderCell: (params) => (
                    <TextField
                      type="number"
                      size="small"
                      value={params.row.UomQty || ""}
                      disabled={!params.row.checked}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || 0);
                        const updated = [...uomRows];
                        const target = updated[params.row.id - 1];
                        target.UomQty = val;
                        target.CountQty = val * target.ItmsPerUnt;
                        setUomRows(updated);
                      }}
                    />
                  ),
                },
                {
                  field: "CountQty",
                  headerName: "Counted Qty",
                  width: 150,
                  valueFormatter: (p) => p.value?.toFixed(3),
                },
              ]}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Grid
            container
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
                onClick={handleSaveUomModal}
                disabled={SaveUpdateName === "UPDATE"}
              >
                SAVE
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                onClick={() => setUomModalOpen(false)}
              >
                CANCEL
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
      <SearchModel
        open={searchmodelOpenIncAccount}
        onClose={SearchModelCloseIncAccount}
        onCancel={SearchModelCloseIncAccount}
        title="ACCOUNT CODE"
        onChange={(e) => handleGetListSearchIncAccount(e.target.value)}
        value={getListqueryIncAccount}
        onClickClear={handleGetListClearIncAccount}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataIncAccount.length}
              next={fetchMoregetListDataIncAccount}
              hasMore={hasMoreGetListIncAccount}
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
              {getListDataIncAccount.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.AcctCode}
                  subtitle={item.AcctName}
                  searchResult={getListqueryIncAccount}
                  onClick={() => handleSelectIncreaseAccount(item)}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />

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
        title="BIN LOCATION"
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
                  title={item.BinCode}
                  // subtitle={item.AcctName}
                  // description={item.AcctName}
                  searchResult={getListqueryAccount}
                  onClick={() => handleSelectBinLocation(item)}
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
        title="WAREHOUSE"
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

      <CopyFromSearchModel
        open={openCopyForm}
        onClose={() => setOpenCopyForm(false)}
        onCancel={() => setOpenCopyForm(false)}
        ButtonCopyForm={"NEXT"}
        onChange={(e) => handleGetListSearchCopyFrom(e.target.value)}
        value={getListqueryCopyFrom}
        onClickClear={handleGetListClearCopyFrom}
        title={"COPY FROM"}
        Input={
          <>
            <Typography variant="subtitle1" fontWeight="bold">
              Copy From Inventory Counting
            </Typography>
            <Dialog
              open={openCopyCheck}
              onClose={() => setopenCopyCheck(false)}
              scroll="paper"
            >
              <DialogTitle>
                <Grid item display="flex" justifyContent="center">
                  <Typography textAlign="center" fontWeight="bold">
                    Copy to Inventory Posting
                  </Typography>
                </Grid>
              </DialogTitle>

              <Divider />

              <DialogContent sx={{ textAlign: "center", py: 2 }}>
                <FormControl component="fieldset">
                  <RadioGroup
                    name="copyOption"
                    value={selectedValue}
                    onChange={handleChangeCopyform}
                  >
                    {[
                      {
                        CounterId: "-1",
                        CounteName: "Items with No Counter Diff.",
                      },
                      { CounterId: "TMC", CounteName: "Team Counted Qty" },
                      // { CounterId: "INC", CounteName: "Individual Counted Qty" },
                      ...MultipleCount,
                    ].map((item) => (
                      <FormControlLabel
                        key={item.CounterId}
                        value={item.CounterId}
                        control={<Radio />}
                        label={item.CounteName}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </DialogContent>

              <DialogActions>
                <Grid
                  item
                  px={2}
                  xs={12}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleSubmitMultiple}
                    size="small"
                    color="success"
                    type="submit"
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => setopenCopyCheck(false)}
                  >
                    Close
                  </Button>
                </Grid>
              </DialogActions>
            </Dialog>

            {/* <Grid
              container
              px={1}
              xs={12}
              bgcolor={
                (theme) =>
                  theme.palette.mode === "light"
                    ? "#f0f7ff" // Light: soft informative blue
                    : "#1e293b" // Dark: deep informative background
              }
              // borderTop="1px solid #ccc"
              borderRadius={1}
              position="sticky"
              bottom={0}
              style={{
                display: "flex",
                justifyContent: "space-between",
                //  alignItems: "end",

                // position: "sticky",
                // bottom: "0px",
              }}
            >
              <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                <Typography variant="body2">
                  <strong>DocNum:</strong> {allFormData.DocNum || "--"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={4} textAlign="center">
                <Typography variant="body2">
                  <strong>Count Date:</strong>{" "}
                  <Tooltip title={allFormData.CountDate || "--"}>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-block",
                        maxWidth: "120px", // control width for ellipsis
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        verticalAlign: "bottom",
                      }}
                    >
                      {allFormData.CardName || "--"}
                    </Box>
                  </Tooltip>
                </Typography>
              </Grid>
            </Grid> */}
          </>
        }
        onSave={handleOpenPurchase}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListPOData.length}
              next={fetchMoreGetListCopyFrom}
              hasMore={hasMorePOList}
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
              {getListPOData.map((item) => (
                <CardCopyFrom
                  key={item.DocEntry}
                  id={item.DocEntry}
                  title={item.DocNum}
                  subtitle={item.CountType === "1" ? "Single" : "Multiple"}
                  description={dayjs(item.CountDate).format("DD/MM/YYYY")}
                  searchResult={getListqueryCopyFrom}
                  checked={checkedItems[item.DocEntry] || false}
                  onClick={(e) => {
                    onClickCopyFrom(e, item, item.DocEntry);
                    // handleCellClickPurchaseModel(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
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
              Inventory Posting
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
                                  (item) => item.SeriesId === selectedSeries,
                                );
                                setValue("DocNum", seriesData?.DocNum || "");
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
                                setValue("FinncPriod", "0");
                                setValue("PIndicator", "0");
                                clearErrors("DocNum");
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
                        name="CountDate"
                        control={control}
                        rules={{ required: "Date is Required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputDatePickerField
                            label="COUNT DATE"
                            name={field.name}
                            value={field.value ? dayjs(field.value) : undefined}
                            onChange={(newValue) => {
                              setValue("CountDate", newValue);
                            }}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />{" "}
                    </Grid>
                    {/* <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
                    <InputFields label="TIME" name="" id="" />
                  </Grid> */}
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="PriceSrc"
                        control={control}
                        defaultValue=""
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            readOnly={SaveUpdateName === "UPDATE"}
                            label="PRICE SOURCE"
                            data={[
                              { key: "1", value: "By Price List" },
                              { key: "2", value: "Last Evaluated Price" },
                              { key: "3", value: "Item Cost" },
                            ]}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              updatePrices({ mode: "all" }); // ✅ same function reused
                            }}
                          />
                        )}
                      />
                    </Grid>
                    {(watchPriceSrc === "1" || watchPriceSrc === 1) && (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={4}
                        textAlign="center"
                      >
                        <Controller
                          name="PriceList"
                          control={control}
                          rules={{ required: "Price List is required" }}
                          defaultValue=""
                          render={({ field, fieldState: { error } }) => (
                            <InputSearchSelectTextField
                              label="PRICE LIST"
                              {...field}
                              error={!!error}
                              inputProps={{ maxLength: 50 }}
                              disabled={SaveUpdateName === "UPDATE"}
                              helperText={error ? error.message : null}
                              data={priceList.map((item) => ({
                                key: item.DocEntry,
                                value: item.ListName,
                              }))}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                updatePrices({ mode: "all" }); // ✅ same function reused
                              }}
                            />
                          )}
                        />
                      </Grid>
                    )}

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

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                      mt={1}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="contained"
                          sx={{ textTransform: "none" }}
                          // onClick={handleClick}
                          disabled={SaveUpdateName === "UPDATE"}
                          onClick={() => setOpenCopyForm(true)}
                        >
                          COPY FROM
                        </Button>
                      </Box>
                    </Grid>
                    {/* <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
                    <InputFields label="REF NO." name="" id="" />
                  </Grid>

                  <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
                    <InputFields label="END OF FISCAL YEAR " name="" id="" />
                  </Grid> */}
                  </Grid>
                </Paper>
                <Grid container width={"100%"}>
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
                      onChange={handleTabChange}
                      aria-label="tabs example"
                    >
                      <Tab
                        value={0}
                        icon={<HomeIcon fontSize="small" />}
                        iconPosition="start"
                        label="General"
                      />{" "}
                      {/* <Tab value={1} label="Logistics" /> */}
                      <Tab
                        value={1}
                        icon={<AttachFileIcon fontSize="small" />}
                        iconPosition="start"
                        label="Attachments"
                      />
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
                            height: "50vh",
                            // minHeight: "300px",
                            // maxHeight: "500px",
                            mt: "5px",
                          }}
                        >
                          <DataGrid
                            className="datagrid-style"
                            columns={columns}
                            rows={olineRows.map((data, index) => ({
                              ...data,
                              id: index,
                            }))}
                            getRowClassName={() =>
                              SaveUpdateName === "UPDATE" ? "disabled-row" : ""
                            }
                            getRowId={(row) => row.id}
                            disableRowSelectionOnClick
                            columnHeaderHeight={35}
                            apiRef={apiRef}
                            editMode="cell"
                            experimentalFeatures={{ newEditingApi: true }}
                            processRowUpdate={processRowUpdate}
                            onCellKeyDown={handleCellKeyDown}
                            onProcessRowUpdateError={(err) =>
                              console.error(err)
                            }
                            sx={gridSx}
                          />
                        </Grid>
                      </>
                    )}

                    {tabvalue === 2 && (
                      <>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <InputFields label="SHIP TO" />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <InputFields label="PAY TO" />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <InputSelectFields
                              label="SHIPPING TYPE"
                              value=""
                              data={[
                                { key: "1", value: "BY AIR" },
                                { key: "2", value: "BY SHIP" },
                                { key: "3", value: "BY ROAD" },
                                { key: "4", value: "DEFINE NEW" },
                              ]}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}

                    {tabvalue === 1 && (
                      <>
                        <Grid
                          container
                          mt={1}
                          sx={{
                            height: "60vh",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Grid item xs={12}>
                            <input
                              type="file"
                              id="file-upload"
                              style={{ display: "none" }}
                              onChange={handleFileChange}
                              multiple
                              accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.txt,
      .tiff,.tif,.jpg,.jpeg,.png,
      .zip,.rar,
      .json,.xml,
      .dwg,.dxf,
      .heic,.webp,.bmp,.gif,.svg"
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
                              }}
                            >
                              <CloudUploadIcon
                                sx={{ fontSize: 20, marginRight: "5px" }}
                              />
                              Upload File
                            </label>

                            <TableContainer
                              sx={{
                                margin: "7px",
                                height: "100%",
                                overflowY: "auto",
                                width: "80%",
                              }}
                            >
                              {fileData.length > 0 && (
                                <Table sx={{ minWidth: 500 }} stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Selected File Name</TableCell>
                                      <TableCell>Action</TableCell>
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {fileData.map((data, index) => (
                                      <TableRow key={index}>
                                        <TableCell
                                          onClick={() =>
                                            data.LineNum === "0"
                                              ? openFileinNewTab(data)
                                              : Base64FileinNewTab(
                                                  data.DocEntry,
                                                  data.LineNum,
                                                  data.FileExt,
                                                  data.Description,
                                                )
                                          }
                                        >
                                          {data.FileName}
                                        </TableCell>
                                        <TableCell>
                                          <RemoveCircleOutlineIcon
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemove(index);
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
                      </>
                    )}
                  </Paper>

                  <Grid container spacing={2}>
                    <Grid
                      item
                      md={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                    ></Grid>{" "}
                    <Grid
                      item
                      md={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                    ></Grid>
                    <Grid item md={6} lg={3} xs={12} textAlign={"center"}>
                      <Controller
                        name="Comments" // ✅ field name for REMARKS
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="REMARKS"
                            placeholder="REMARK"
                            rows={2}
                            multiline
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item md={6} lg={3} xs={12} textAlign={"center"}>
                      <Controller
                        name="JrnlMemo" // ✅ field name for JOURNAL REMARK (matches your handleSubmitForm)
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="JOURNAL REMARK"
                            placeholder="JOURNAL REMARK"
                            rows={2}
                            multiline
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>
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
