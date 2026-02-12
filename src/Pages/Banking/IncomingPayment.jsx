import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Select,
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
import Modal from "@mui/material/Modal";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CardComponent from "../Components/CardComponent";

import SearchInputField from "../Components/SearchInputField";

import CloseIcon from "@mui/icons-material/Close";
// import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { TabContext, TabPanel } from "@mui/lab";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { DatePicker } from "antd";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import {
  InputSelectFields,
  InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import PrintMenu from "../Components/PrintMenu";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { TwoFormatter } from "../Components/ValueFormatter";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
// import TextField from '@mui/material/TextField';

const Acclist = [
  {
    id: 1,
    field: "AcctCode",
    headerName: "Account Number",
    width: 150,
    editable: true,
  },
  {
    id: 1,
    field: "AcctName",
    headerName: "Account Name",
    width: 400,
    editable: true,
  },
  {
    id: 1,
    field: "ActCurr",
    headerName: "Account Currency",
    width: 150,
    editable: true,
  },
];

export default function IncomingPayment() {
  const theme = useTheme();
  const perms = usePermissions(76);
  const [tab, settab] = useState("0");
  const [tabvalue, settabvalue] = useState(0);
  const [modalTabvalue, setmodalTabvalue] = useState("0");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [seriesdata, setSeriesdata] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [bankData, setBankData] = useState([]);
  const [DocEntry, setDocEntry] = useState("");

  const [bpdata, setbpdata] = useState([]);

  const [isOIBGLAccountDialogOpen, setIsOIBGLAccountDialogOpen] =
    useState(false);
  const [currencydata, setCurrencydata] = useState([]);
  const [businessCodeData, setBusinessCodeData] = useState([]);
  const [BaseDocData, setBaseDocData] = useState([]);

  const [creditCarddata, setCreditCarddata] = useState([]);

  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [countries, setCountries] = useState([]);
  const { user, companyData } = useAuth();
  const [localPaginationCache, setLocalPaginationCache] = useState([]);

  const [checkTabRows, setcheckTabRows] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [BusinessPartnerData, setBusinessPartnerData] = useState([]);

  const [CreditCardRows, setCreditCardRows] = useState([]);
  // const [accRows, setAccRows] = useState([]);
  //=====================================get List State====================================================================
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const timeoutRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false); // true for update, false for save
  const oibEditingRowRef = useRef(null);
  const accEditingRowRef = useRef(null);
  const [hasMoreGetListBP, setHasMoreGetListBP] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [rowWiseBranchOptions, setRowWiseBranchOptions] = useState({});
  const [selectedBankName, setSelectedBankName] = useState(null);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //! ==============CANCEL LIST===============
  const [cancelledListData, setCancelledListData] = useState([]);
  const [cancelListPage, setCancelListPage] = useState(0);
  const [cancelListSearching, setCancelListSearching] = useState(false);
  const [cancelledListquery, setCancelledListQuery] = useState("");
  const [hasMoreCancelled, setHasMoreCancelled] = useState(true);
  const [SystemRate, setSystemRate] = useState(null);
  const [clearCache, setClearCache] = useState(false);

  const LIMIT = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dataCache, setDataCache] = useState({});
  const [exchangeRateModalOpen, setExchangeRateModalOpen] = useState(false);
  const [exchangeRateModalData, setExchangeRateModalData] = useState({
    RateDate: null,
    Currency: "",
    DocEntry: "",
  });
  const [manualRate, setManualRate] = useState("");
  const [isSavingManualRate, setIsSavingManualRate] = useState(false);

  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [initialDiffCurr, setInitialDiffCurr] = useState("");
  const [GLAcctDeterminationData, setGLAcctDeterminationData] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const bpCurrencyRef = useRef("");
  const isInitialSystemRate = useRef(false);
  const apiRef = useGridApiRef();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const editedFieldRef = React.useRef(null);
  const modalApiRef = useGridApiRef();
  const modalEditedFieldRef = React.useRef(null);
  const modalProcessRowUpdate = (newRow, oldRow) => {
    const docRate = parseFloat(watchDocRate) || 0;
    const field = modalEditedFieldRef.current;

    let updatedRow = { ...oldRow, ...newRow };

    // 🔁 AMOUNT LOGIC (replaces onBlur)
    if (field === "CheckSum" || field === "CheckSumFC") {
      if (isPMLocalCurrency) {
        const localValue = parseFloat(newRow.CheckSum) || 0;
        updatedRow.CheckSum = localValue;
        updatedRow.CheckSumFC = docRate
          ? +(localValue / docRate).toFixed(6)
          : 0;
      } else {
        const fcValue = parseFloat(newRow.CheckSumFC) || 0;
        updatedRow.CheckSumFC = fcValue;
        updatedRow.CheckSum = +(fcValue * docRate).toFixed(6);
      }
    }

    // ✅ Update row state
    setcheckTabRows((prev) => {
      const updatedRows = prev.map((r) =>
        r.id === updatedRow.id ? updatedRow : r,
      );

      // 🔢 TOTALS (same as before)
      const totalLocal = updatedRows.reduce(
        (sum, row) => sum + (parseFloat(row.CheckSum) || 0),
        0,
      );
      const totalFC = updatedRows.reduce(
        (sum, row) => sum + (parseFloat(row.CheckSumFC) || 0),
        0,
      );

      setValue("CheckSum", totalLocal.toFixed(6));
      setValue("CheckSumFC", totalFC.toFixed(6));

      return updatedRows;
    });

    return updatedRow; // ✅ REQUIRED
  };

  // Add this handler for modal
  const modalHandleCellEditStart = (params) => {
    modalEditedFieldRef.current = params.field;
  };
  const handleCellEditStart = (params) => {
    editedFieldRef.current = params.field;
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
  const modalhandleCellKeyDown = (params, event) => {
    const api = modalApiRef.current;
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
  const [PrintData, setPrintData] = useState([]);
  const [type, setType] = useState("I");

  const [loading, setLoading] = useState(false);
  const GLAcctData = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/GLAccDetermination/All`);
      const response = res.data;

      if (response.success) {
        setGLAcctDeterminationData(response.values || []);
      } else {
        // If success === false, show the message from API
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text:
            response.message || "Failed to fetch GL Acct Determination data.",
          confirmButtonColor: "#3085d6",
        });
        setGLAcctDeterminationData([]); // optional: clear previous data
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while fetching GL Acct Determination data.",
        confirmButtonColor: "#3085d6",
      });
      setGLAcctDeterminationData([]); // optional: clear previous data
    } finally {
      setLoading(false);
    }
  };

  //=========================================================================
  const [anchorEl, setAnchorEl] = React.useState(null);
  const Openmenu = Boolean(anchorEl);

  const handleClickCancelClosed = (event) => {
    setAnchorEl(event.currentTarget);
  };
  let handleCloseCancelClosed = () => {
    setAnchorEl(null);
  };
  const handleOnCancelDocument = async () => {
    const confirmation = await Swal.fire({
      text: `Do You Want to Cancel "${currentData.CardCode}"?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!confirmation.isConfirmed) {
      Swal.fire({
        text: "Incoming Payments Not Cancelled",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      setLoading(true);
      const resp = await apiClient.put(
        `/IncomingPayments/Cancel/${currentData.DocEntry}`,
      );

      if (resp.data.success) {
        clearFormData();
        fetchOpenListData(0);
        fetchCancelledListData(0);

        Swal.fire({
          text: "Incoming Payments Cancelled",
          icon: "success",
          toast: true,
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Info",
          text: resp.data.message || "Failed to cancel the payment.",
          icon: "info",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while cancelling the payment.",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  //============================================================
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const initialFormData = {
    DocType: "CUSTOMER",
    CardCode: "",
    // CCTotal:"",
    CardName: "",
    Address: "",
    CntctCode: "",
    CFWName: "",
    DocNum: "",
    PMDocCurr: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD"),
    DocDueDate: dayjs(undefined).format("YYYY-MM-DD"),
    TaxDate: dayjs(undefined).format("YYYY-MM-DD"),
    CounterRef: "",
    TransId: "",
    DocTotalSy: "",
    DocTotal: "",
    CashSumFC: "",
    AttcEntry: "0",
    NoDocSum: "",
    Comments: "",
    JrnlMemo: "",
    DiffCurr: "N",
    DocCurr: "",

    CheckAcct: "",
    TrsfrAcct: "",
    TrsfrDate: dayjs(undefined).format("YYYY-MM-DD"),
    TrsfrRef: "",
    CashAcct: "",
    CashSum: "",
    PayToCode: "",
    InstId: "",
    CredSumFC: "",
    CheckSum: "",
    CheckSumFC: "",
    TrsfrSum: "",
    TrsfrSumFC: "",
    PayNoDoc: "",
    NoDocSumFC: "",
    DocRate: "",
    SysRate: "",
    DocTotalFC: "",
    Ref1: "",
    DocTime: "",
    SpiltTrans: "",
    CreateTran: "",
    CashSumSy: "",
    CredSumSy: "",
    CheckSumSy: "",
    TrsfrSumSy: "",
    NoDocSumSy: "",
    ObjType: "24",
    StornoRate: "",
    ApplyVAT: "",
    Series: "",
    confirmed: "",
    ShowJDT: "",
    BankCode: "",
    BankAcct: "",
    DataSource: "",
    UserSign: "",
    VatSum: "",
    VatSumFC: "",
    VatSumSy: "",
    FinncPriod: "",
    VatPrcnt: "",
    Dcount: "",
    DcntSum: "",
    DcntSumFC: "",
    DcntSumSy: "",
    SpltCredLn: "",
    PaymentRef: "",
    Submitted: "",
    PayMth: "",
    BankCountr: "",
    FreightSum: "",
    FreigtFC: "",
    FreigtSC: "",
    Proforma: "",
    BpAct: "",
    BcgSum: "",
    BcgSumFC: "",
    BcgSumSy: "",
    PIndicator: "",
    PaPriority: "",
    IsPaytoBnk: "",
    PBnkCnt: "",
    PBnkCode: "",
    PBnkAccnt: "",
    PBnkBranch: "",
    UndOvDiff: "",
    UndOvDiffS: "",
    BankActKey: "",
    TransCode: "",
    PaymType: "",
    TfrRealAmt: "",
    CancelDate: dayjs(undefined).format("YYYY-MM-DD "),
    OpenBal: "",
    OpenBalFc: "",
    OpenBalSc: "",
    BcgTaxSum: "",
    BcgTaxSumF: "",
    BcgTaxSumS: "",
    ChallanNo: "",
    ChallanBak: "",
    ChallanDat: "",
    BcgVatPcnt: "",
    UserSign2: "",
    ResidenNum: "",
    UndOvDiffF: "",
    FreeText1: "",
    ShowDocNo: "",
    TDSInterst: "",
    TDSCharges: "",
    BPLId: "",
    BPLName: "",
    VATRegNum: "",
    BPLCentPmt: "",
    DraftKey: "",
    TDSFee: "",
    MinHeadCL: "",
    OwnerCode: "",
    AgrNo: "",
    CreateTS: "",
    UpdateTS: "",
    TDSType: "",
    AccRows: [],
  };

  const [glDialogState, setGLDialogState] = useState({
    open: false,
    field: "",
    rows: [], // Current page's rows (from cache)
    pages: {}, // Cache: { 0: [rows], 1: [rows], ... }
    currentPage: 0,
    pageSize: 20,
    totalRows: 0, // Actual/inferred total
    effectiveRowCount: 0, // Inflated for UI pagination
    hasMore: true, // Based on last fetch
    maxFetchedPage: -1, // Track highest fetched page for inflation
    searchText: "",
  });

  const [startDate, setStartDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
  );
  const [dueDate, setDueDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
  );
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  const handleCheckboxChange = (row, isChecked) => {
    setSelectedRows((prev) => {
      if (isChecked) {
        const exists = prev.find((r) => r.InvoiceId === row.InvoiceId);

        const updatedRow = {
          ...row,
          SumApplied: row.SumApplied,
          AppliedFC: row.AppliedFC,
        };

        return exists
          ? prev.map((r) => (r.InvoiceId === row.InvoiceId ? updatedRow : r))
          : [...prev, updatedRow];
      }

      // remove
      return prev.filter((r) => r.InvoiceId !== row.InvoiceId);
    });

    // update UI checkboxes
    setBusinessCodeData((prev) =>
      prev.map((r) =>
        r.InvoiceId === row.InvoiceId ? { ...r, IsSelected: isChecked } : r,
      ),
    );
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const handleModalTabChange = (event, newValue) => {
    setmodalTabvalue(newValue);
  };
  const handleInputChange = () => {
    setIsDialogOpen(true); // Open the dialog when input changes
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  //========================UseForms=======================================
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    clearErrors,
  } = useForm({
    defaultValues: initialFormData,
    checkTabRows: [],
  });
  const allFormData = getValues();

  const currentData = getValues();
  const selectedCurrency = watch("DocCurr");
  const isBPAC = bpCurrencyRef.current === "AC";
  const selectedPMCurrency = watch("PMDocCurr");

  const watchDocRate = watch("DocRate");
  const localCurrency = companyData?.MainCurncy;

  const isPMLocalCurrency = selectedPMCurrency === localCurrency;
  const current = watch("accRows") || [];
  const accRows = watch("accRows") || [];

  const watchDocDate = watch("DocDate");
  const cardCodeValue = watch("CardCode");
  const systemCurrency = companyData?.SysCurrncy;
  // const selectedDocCurr = watch("DocCurr");

  // ---------------- CUSTOM PMDocCurr OPTIONS ----------------
  const getPMDocCurrOptions = () => {
    if (selectedCode !== "ACCOUNT") return currencyOptions;

    // Only ACCOUNT logic below
    if (!selectedCurrency) return currencyOptions;

    // If selected DocCurr is same as local currency → only local currency
    if (selectedCurrency === localCurrency) {
      return [
        {
          key: localCurrency,
          value: localCurrency,
        },
      ];
    }

    // If selected DocCurr is different → show selected currency + local currency
    return [
      {
        key: selectedCurrency,
        value: selectedCurrency,
      },
      {
        key: localCurrency,
        value: localCurrency,
      },
    ];
  };

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        setLoading(true); // show loading state
        const { data } = await apiClient.get(`/ReportLayout/GetByTransId/24`);

        if (data.success) {
          const OlinesDataPrint = data.values?.oLines || [];
          setPrintData(OlinesDataPrint);
        } else {
          Swal.fire({
            icon: "info",
            title: "Notice",
            text: data.message || "No data found for printing.",
            confirmButtonText: "Ok",
          });
        }
      } catch (error) {
        console.error("Error fetching print data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            "Failed to fetch print data. Please try again.",
          confirmButtonText: "Ok",
        });
      } finally {
        setLoading(false); // hide loading state
      }
    };

    fetchPrintData(); // runs once
  }, []);
  useEffect(() => {
    const getRate = async () => {
      if (!watchDocDate || !systemCurrency) return;
      isInitialSystemRate.current = true;

      const rate = await fetchExchangeRate(watchDocDate, systemCurrency);

      // If rate is undefined, null, 0, or "0", set 1
      const finalRate =
        rate === undefined || rate === null || rate === 0 || rate === "0"
          ? 1
          : Number(rate);

      setSystemRate(finalRate);

      console.log("system rate", finalRate);
    };

    getRate();
  }, [watchDocDate, systemCurrency]);

  const {
    control: ccControl,
    getValues: getCCValues,
    reset: resetCCForm,
    setValue: setCCValue,
    watch: watchCC,
    handleSubmit: handleCCSubmit,
  } = useForm({
    defaultValues: {
      CreditCard: "",
      originalCreditCard: "",
      CreditAcct: "",
      CrCardNum: "",
      CardValid: "",
      OwnerIdNum: "",
      OwnerPhone: "",
      CrTypeCode: "",
      CreditSum: "",
      NumOfPmnts: "1",
      FirstSum: "",
      AddPmntSum: "",
      VoucherNum: "",
      CreditType: "1",
      ConfNum: "",
    },
  });
  const clearCCForm = () => {
    resetCCForm({
      CreditCard: "",
      CreditAcct: "",
      CrCardNum: "",
      CardValid: "",
      OwnerIdNum: "",
      OwnerPhone: "",
      CrTypeCode: "",
      CreditSum: "",
      NumOfPmnts: "1",
      FirstSum: "",
      AddPmntSum: "",
      VoucherNum: "",
      CreditType: "",
      ConfNum: "",
    });
  };
  const clearFormData = async () => {
    // Make async to await defaults
    reset(initialFormData);
    clearCCForm();
    setDocEntry("");
    setSaveUpdateName("SAVE"); // Set to SAVE first
    setBusinessCodeData([]);
    setSelectedData([]);
    setValue("accRows", []);
    setcheckTabRows([]);
    setCreditCardRows([]);
    clearFiles();
    setSelectedRows([]);
    setBusinessPartnerData([]);
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");

    // ✅ Re-set defaults only in SAVE mode (after clear)
    if (SaveUpdateName === "SAVE" && GLAcctDeterminationData.length > 0) {
      await setGLDefaults("SAVE"); // Re-fetch and set CheckAcct, TrsfrAcct, CashAcct + names
    }

    setInitialDiffCurr(""); // Reset currency tracking
  };

  // ✅ determine if the selected currency is local
  const isLocalCurrency = selectedCurrency === localCurrency;
  const processRowUpdate = (newRow, oldRow) => {
    const field = editedFieldRef.current;
    let updatedRow = { ...oldRow, ...newRow };

    // 🔹 SILENT CLAMP (NO ERRORS)
    const rawValue = newRow[field];
    const safeValue = clampToMax(field, rawValue, oldRow);

    updatedRow[field] = safeValue;

    // 🔹 ACCOUNT logic
    if (selectedCode === "ACCOUNT") {
      setValue(
        "accRows",
        accRows.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
        { shouldDirty: true },
      );
      return updatedRow;
    }

    // 🔹 BUSINESS CODE LOGIC
    if (field === "BfDcntSum") {
      updatedRow = calculateDiscountRow("BfDcntSum", safeValue, updatedRow);
    }

    if (field === "BfDcntSumF") {
      updatedRow = calculateDiscountRow("BfDcntSumF", safeValue, updatedRow);
    }

    if (field === "Dcount") {
      updatedRow = calculateDiscountRow("Dcount", safeValue, updatedRow);
    }

    if (field === "SumApplied") {
      const discount = updatedRow.Dcount || 0;

      // Attempt reverse calculation
      const calculatedBf =
        discount !== 100 ? safeValue / (1 - discount / 100) : 0;

      // 🔴 Reverse calc exceeds document total → rollback payment
      if (discount > 0 && calculatedBf > oldRow.DocTotal) {
        const correctPayment = oldRow.BfDcntSum * (1 - discount / 100);

        updatedRow.SumApplied = correctPayment;
        updatedRow.AppliedFC = correctPayment / (watchDocRate || 1);

        return updatedRow;
      }

      // ✅ Safe → allow reverse calculation
      updatedRow = calculateDiscountRow("BfDcntSum", calculatedBf, updatedRow);
      setBusinessCodeData((prev) =>
        prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
      );

      setSelectedRows((prev) =>
        prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
      );

      return updatedRow;
    }

    if (field === "AppliedFC") {
      const discount = updatedRow.Dcount || 0;

      const calculatedBf =
        discount !== 100 ? safeValue / (1 - discount / 100) : 0;

      if (discount > 0 && calculatedBf > oldRow.DocTotalFC) {
        const correctPayment = oldRow.BfDcntSumF * (1 - discount / 100);

        updatedRow.AppliedFC = correctPayment;
        updatedRow.SumApplied = correctPayment * (watchDocRate || 1);

        return updatedRow;
      }

      updatedRow = calculateDiscountRow("BfDcntSumF", calculatedBf, updatedRow);
      setBusinessCodeData((prev) =>
        prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
      );

      setSelectedRows((prev) =>
        prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
      );

      return updatedRow;
    }

    setBusinessCodeData((prev) =>
      prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
    );

    setSelectedRows((prev) =>
      prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
    );

    return updatedRow;
  };

  const clampToMax = (field, value, row) => {
    if (field === "BfDcntSum") {
      return Math.min(value, row.DocTotal);
    }

    if (field === "SumApplied") {
      return Math.min(value, row.DueAmnt);
    }

    if (field === "BfDcntSumF") {
      return Math.min(value, row.DocTotalFC);
    }

    if (field === "AppliedFC") {
      return Math.min(value, row.DueAmntFC);
    }

    return value;
  };

  const calculateDiscountRow = (field, value, row) => {
    const rate = parseFloat(watchDocRate) || 1;
    const newRow = { ...row };

    if (field === "BfDcntSum") {
      newRow.BfDcntSum = value;
      newRow.BfDcntSumF = value / rate;
    }

    if (field === "BfDcntSumF") {
      newRow.BfDcntSumF = value;
      newRow.BfDcntSum = value * rate;
    }

    if (field === "Dcount") {
      newRow.Dcount = Math.min(Math.max(value, 0), 100);
    }

    const discount = newRow.Dcount || 0;

    newRow.DcntSum = (discount / 100) * newRow.BfDcntSum;
    newRow.DcntSumFC = (discount / 100) * newRow.BfDcntSumF;

    newRow.SumApplied = newRow.BfDcntSum - newRow.DcntSum;
    newRow.AppliedFC = newRow.BfDcntSumF - newRow.DcntSumFC;

    newRow.BfNetDcnt = newRow.SumApplied;
    newRow.BfNetDcntF = newRow.BfDcntSumF - newRow.DcntSumFC;

    return newRow;
  };

  const columns = [
    // ---------------- CHECKBOX ----------------
    {
      field: "IsSelected",
      headerName: "",
      width: 70,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderHeader: (params) => {
        const currentRows =
          selectedCode === "ACCOUNT" ? accRows : businessCodeData;

        const allSelected =
          currentRows.length > 0 &&
          currentRows.every((r) =>
            selectedRows.some((s) => s.InvoiceId === r.InvoiceId),
          );

        const indeterminate =
          !allSelected &&
          currentRows.some((r) =>
            selectedRows.some((s) => s.InvoiceId === r.InvoiceId),
          );

        return (
          <Checkbox
            checked={allSelected}
            indeterminate={indeterminate}
            disabled={SaveUpdateName === "UPDATE"}
            onChange={(e) => {
              const checked = e.target.checked;
              currentRows.forEach((row) => handleCheckboxChange(row, checked));
            }}
          />
        );
      },
      renderCell: (params) => (
        <Checkbox
          checked={selectedRows.some(
            (r) => r.InvoiceId === params.row.InvoiceId,
          )}
          onChange={(e) => handleCheckboxChange(params.row, e.target.checked)}
        />
      ),
    },

    // ---------------- BASIC INFO ----------------
    {
      field: "InvoiceId",
      headerName: "DOCUMENT NO",
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "InstId",
      headerName: "INSTALLMENT",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "InvType",
      headerName: "DOCUMENT TYPE",
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "DocDate",
      headerName: "DATE",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "OverDueDays",
      headerName: "OVERDUE DAYS",
      width: 130,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "Currency",
      headerName: "CURRENCY",
      width: 130,
      align: "center",
      headerAlign: "center",
    },
    // ---------------- CONDITIONAL AMOUNTS ----------------
    ...(isLocalCurrency || isBPAC
      ? [
          // -------- LC Columns --------
          {
            field: "DocTotal",
            headerName: `TOTAL (${localCurrency})`,
            width: 150,
            align: "center",
            headerAlign: "center",
          },
          {
            field: "DueAmnt",
            headerName: `BALANCE DUE (${localCurrency})`,
            width: 160,
            align: "center",
            headerAlign: "center",
          },
          {
            field: "BfDcntSum",
            headerName: `TOTAL BEFORE DISCOUNT (${localCurrency})`,
            width: 190,
            align: "center",
            headerAlign: "center",
            type: "number", // Enables built-in number input during editing
            editable: true, // DataGrid handles editing
            renderCell: ({ value }) =>
              value == null ? "" : TwoFormatter(value, 2), // Display only
          },
          {
            field: "BfNetDcnt",
            headerName: `NET TOTAL BEFORE DISCOUNT (${localCurrency})`,
            width: 220,
            align: "center",
            headerAlign: "center",
          },
          {
            field: "Dcount",
            headerName: "CASH DISCOUNT (%)",
            width: 150,
            align: "center",
            headerAlign: "center",
            type: "number", // Built-in number input
            editable: true,
            renderCell: ({ value }) =>
              value == null ? "" : TwoFormatter(value, 2), // Display only
          },
          {
            field: "DcntSum",
            headerName: `TOTAL DISCOUNT (${localCurrency})`,
            width: 160,
            align: "center",
            headerAlign: "center",
          },
          {
            field: "SumApplied",
            headerName: `TOTAL PAYMENT (${localCurrency})`,
            width: 160,
            align: "center",
            headerAlign: "center",
            type: "number", // Built-in number input
            editable: true,
            renderCell: ({ value }) =>
              value == null ? "" : TwoFormatter(value, 2), // Display only
          },
        ]
      : !isBPAC
        ? [
            // -------- FC Columns --------
            {
              field: "DocTotalFC",
              headerName: `TOTAL `,
              width: 150,
              align: "center",
              headerAlign: "center",
            },
            {
              field: "DueAmntFC",
              headerName: `BALANCE DUE`,
              width: 160,
              align: "center",
              headerAlign: "center",
            },
            {
              field: "BfDcntSumF",
              headerName: `TOTAL BEFORE DISCOUNT `,
              width: 190,
              align: "center",
              headerAlign: "center",
              type: "number", // Built-in number input
              editable: true,
              renderCell: ({ value }) =>
                value == null ? "" : TwoFormatter(value, 2), // Display only
            },
            {
              field: "BfNetDcntF",
              headerName: `NET TOTAL BEFORE DISCOUNT`,
              width: 220,
              align: "center",
              headerAlign: "center",
            },
            {
              field: "Dcount",
              headerName: "CASH DISCOUNT (%)",
              width: 150,
              align: "center",
              headerAlign: "center",
              type: "number", // Built-in number input
              editable: true,
              renderCell: ({ value }) =>
                value == null ? "" : TwoFormatter(value, 2), // Display only
            },
            {
              field: "DcntSumFC",
              headerName: `TOTAL DISCOUNT `,
              width: 160,
              align: "center",
              headerAlign: "center",
            },
            {
              field: "AppliedFC",
              headerName: `TOTAL PAYMENT `,
              width: 160,
              align: "center",
              headerAlign: "center",
              type: "number", // Built-in number input
              editable: true,
              renderCell: ({ value }) =>
                value == null ? "" : TwoFormatter(value, 2), // Display only
            },
          ]
        : []), // if isBPAC true but isPMLocalCurrency false → no columns
  ];
  // ✅ dynamically build the columns
  // const columns = [
  //   // ---------------- CHECKBOX ----------------
  //   {
  //     field: "IsSelected",
  //     headerName: "",
  //     width: 70,
  //     sortable: false,
  //     align: "center",
  //     headerAlign: "center",
  //     renderHeader: (params) => {
  //       const currentRows =
  //         selectedCode === "ACCOUNT" ? accRows : businessCodeData;

  //       const allSelected =
  //         currentRows.length > 0 &&
  //         currentRows.every((r) =>
  //           selectedRows.some((s) => s.InvoiceId === r.InvoiceId),
  //         );

  //       const indeterminate =
  //         !allSelected &&
  //         currentRows.some((r) =>
  //           selectedRows.some((s) => s.InvoiceId === r.InvoiceId),
  //         );

  //       return (
  //         <Checkbox
  //           checked={allSelected}
  //           indeterminate={indeterminate}
  //           disabled={SaveUpdateName === "UPDATE"}
  //           onChange={(e) => {
  //             const checked = e.target.checked;
  //             currentRows.forEach((row) => handleCheckboxChange(row, checked));
  //           }}
  //         />
  //       );
  //     },
  //     renderCell: (params) => (
  //       <Checkbox
  //         checked={selectedRows.some(
  //           (r) => r.InvoiceId === params.row.InvoiceId,
  //         )}
  //         onChange={(e) => handleCheckboxChange(params.row, e.target.checked)}
  //       />
  //     ),
  //   },

  //   // ---------------- BASIC INFO ----------------
  //   {
  //     field: "InvoiceId",
  //     headerName: "DOCUMENT NO",
  //     width: 150,
  //     align: "center",
  //     headerAlign: "center",
  //   },
  //   {
  //     field: "InstId",
  //     headerName: "INSTALLMENT",
  //     width: 120,
  //     align: "center",
  //     headerAlign: "center",
  //   },
  //   {
  //     field: "InvType",
  //     headerName: "DOCUMENT TYPE",
  //     width: 150,
  //     align: "center",
  //     headerAlign: "center",
  //   },
  //   {
  //     field: "DocDate",
  //     headerName: "DATE",
  //     width: 120,
  //     align: "center",
  //     headerAlign: "center",
  //   },
  //   {
  //     field: "OverDueDays",
  //     headerName: "OVERDUE DAYS",
  //     width: 130,
  //     align: "center",
  //     headerAlign: "center",
  //   },
  //   {
  //     field: "Currency",
  //     headerName: "CURRENCY",
  //     width: 130,
  //     align: "center",
  //     headerAlign: "center",
  //   },
  //   // ---------------- CONDITIONAL AMOUNTS ----------------
  //   ...(isLocalCurrency || isBPAC
  //     ? [
  //         // -------- LC Columns --------
  //         {
  //           field: "DocTotal",
  //           headerName: `TOTAL (${localCurrency})`,
  //           width: 150,
  //           align: "center",
  //           headerAlign: "center",
  //         },
  //         {
  //           field: "DueAmnt",
  //           headerName: `BALANCE DUE (${localCurrency})`,
  //           width: 160,
  //           align: "center",
  //           headerAlign: "center",
  //         },
  //         {
  //           field: "BfDcntSum",
  //           headerName: `TOTAL BEFORE DISCOUNT (${localCurrency})`,
  //           width: 190,
  //           align: "center",
  //           headerAlign: "center",
  //           renderCell: (params) => (
  //             <InputTextField
  //               name="BfDcntSum"
  //               type="number"
  //               value={params.value}
  //               onChange={(e) => {
  //                 const newValue = parseFloat(e.target.value);
  //                 const dueAmount = params.row.DueAmnt;
  //                 const finalValue =
  //                   newValue > dueAmount ? dueAmount : newValue;

  //                 handleDiscountChange(
  //                   "BfDcntSum",
  //                   finalValue,
  //                   params.row,
  //                   setBusinessCodeData,
  //                   businessCodeData,
  //                 );
  //               }}
  //             />
  //           ),
  //         },
  //         {
  //           field: "BfNetDcnt",
  //           headerName: `NET TOTAL BEFORE DISCOUNT (${localCurrency})`,
  //           width: 220,
  //           align: "center",
  //           headerAlign: "center",
  //         },
  //         {
  //           field: "Dcount",
  //           headerName: "CASH DISCOUNT (%)",
  //           width: 150,
  //           align: "center",
  //           headerAlign: "center",
  //           renderCell: (params) => (
  //             <Controller
  //               name={`Dcount_${params.id}`}
  //               control={control}
  //               defaultValue={params.value || ""}
  //               render={({ field }) => (
  //                 <InputTextField
  //                   {...field}
  //                   type="number"
  //                   value={field.value}
  //                   onChange={(e) => {
  //                     field.onChange(e);
  //                     handleDiscountChange(
  //                       "Dcount",
  //                       e.target.value,
  //                       params.row,
  //                       setBusinessCodeData,
  //                       businessCodeData,
  //                     );
  //                   }}
  //                 />
  //               )}
  //             />
  //           ),
  //         },
  //         {
  //           field: "DcntSum",
  //           headerName: `TOTAL DISCOUNT (${localCurrency})`,
  //           width: 160,
  //           align: "center",
  //           headerAlign: "center",
  //         },
  //         {
  //           field: "SumApplied",
  //           headerName: `TOTAL PAYMENT (${localCurrency})`,
  //           width: 160,
  //           align: "center",
  //           headerAlign: "center",
  //           renderCell: (params) => (
  //             <InputTextField
  //               name="SumApplied"
  //               type="number"
  //               value={params.value}
  //               onChange={(e) =>
  //                 handleSumAppliedChange(
  //                   e,
  //                   params,
  //                   setBusinessCodeData,
  //                   businessCodeData,
  //                 )
  //               }
  //             />
  //           ),
  //         },
  //       ]
  //     : !isBPAC
  //       ? [
  //           // -------- FC Columns --------
  //           {
  //             field: "DocTotalFC",
  //             headerName: `TOTAL `,
  //             width: 150,
  //             align: "center",
  //             headerAlign: "center",
  //           },
  //           {
  //             field: "DueAmntFC",
  //             headerName: `BALANCE DUE`,
  //             width: 160,
  //             align: "center",
  //             headerAlign: "center",
  //           },
  //           {
  //             field: "BfDcntSumF",
  //             headerName: `TOTAL BEFORE DISCOUNT `,
  //             width: 190,
  //             align: "center",
  //             headerAlign: "center",
  //             renderCell: (params) => (
  //               <InputTextField
  //                 name="BfDcntSumF"
  //                 type="number"
  //                 value={params.value}
  //                 onChange={(e) => {
  //                   const newValue = parseFloat(e.target.value);
  //                   const dueAmount = params.row.DueAmntFC;
  //                   const finalValue =
  //                     newValue > dueAmount ? dueAmount : newValue;

  //                   handleDiscountChange(
  //                     "BfDcntSumF",
  //                     finalValue,
  //                     params.row,
  //                     setBusinessCodeData,
  //                     businessCodeData,
  //                   );
  //                 }}
  //               />
  //             ),
  //           },
  //           {
  //             field: "BfNetDcntF",
  //             headerName: `NET TOTAL BEFORE DISCOUNT`,
  //             width: 220,
  //             align: "center",
  //             headerAlign: "center",
  //           },
  //           {
  //             field: "Dcount",
  //             headerName: "CASH DISCOUNT (%)",
  //             width: 150,
  //             align: "center",
  //             headerAlign: "center",
  //             renderCell: (params) => (
  //               <Controller
  //                 name={`Dcount_${params.id}`}
  //                 control={control}
  //                 defaultValue={params.value || ""}
  //                 render={({ field }) => (
  //                   <InputTextField
  //                     {...field}
  //                     type="number"
  //                     value={field.value}
  //                     onChange={(e) => {
  //                       field.onChange(e);
  //                       handleDiscountChange(
  //                         "Dcount",
  //                         e.target.value,
  //                         params.row,
  //                         setBusinessCodeData,
  //                         businessCodeData,
  //                       );
  //                     }}
  //                   />
  //                 )}
  //               />
  //             ),
  //           },
  //           {
  //             field: "DcntSumFC",
  //             headerName: `TOTAL DISCOUNT `,
  //             width: 160,
  //             align: "center",
  //             headerAlign: "center",
  //           },
  //           {
  //             field: "AppliedFC",
  //             headerName: `TOTAL PAYMENT `,
  //             width: 160,
  //             align: "center",
  //             headerAlign: "center",
  //             renderCell: (params) => (
  //               <InputTextField
  //                 name="AppliedFC"
  //                 type="number"
  //                 value={params.value}
  //                 onChange={(e) =>
  //                   handleSumAppliedChange(
  //                     e,
  //                     params,
  //                     setBusinessCodeData,
  //                     businessCodeData,
  //                   )
  //                 }
  //               />
  //             ),
  //           },
  //         ]
  //       : []), // if isBPAC true but isPMLocalCurrency false → no columns
  // ];
  const isLocal = selectedCurrency === localCurrency;
  const SumAppliedColumn = {
    field: "SumApplied",
    headerName: "AMOUNT",
    width: 200,
    type: "number",
    editable: true,
    renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
  };

  const AppliedFCColumn = {
    field: "AppliedFC",
    headerName: "AMOUNT (FC)",
    width: 200,
    type: "number",
    editable: true,
    renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
  };

  const AccCol = [
    {
      field: "AcctCode",
      headerName: "GL ACCOUNT",
      width: 200,
      editable: true,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span>{params.value}</span>

          <ViewListIcon
            sx={{
              cursor: "pointer",
              backgroundColor: "green",
              borderRadius: "10%",
              color: "white",
              p: 0.5,
            }}
            onClick={(e) => {
              e.stopPropagation(); // 🔴 IMPORTANT
              accEditingRowRef.current = params.row.id;
              openGLDialog("AccCol");
            }}
          />
        </Box>
      ),
    },

    {
      field: "AcctName",
      headerName: "ACCOUNT NAME",
      width: 350,
    },

    {
      field: "Descrip",
      headerName: "Document Remark",
      width: 200,
      editable: true,
    },

    isLocal ? SumAppliedColumn : AppliedFCColumn,

    {
      field: "LocCode",
      headerName: "LOCATION",
      width: 200,
      editable: true,
      type: "singleSelect",

      valueOptions:
        locationData?.map((item) => ({
          value: item.DocEntry, // ✅ stored value
          label: item.Location, // ✅ displayed text
        })) ?? [],

      // Optional: show label even if value is DocEntry
      valueFormatter: (params) => {
        const loc = locationData?.find((l) => l.DocEntry === params.value);
        return loc?.Location || "";
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
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
    // Discounts
  ];
  const handleCurrencyChange = async (currency, date) => {
    if (SaveUpdateName !== "SAVE") return;
    if (!currency || !date) {
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
          setValue("DocRate", rate); // set new rate

          // ✅ Reset all sums for new currency
          // setcheckTabRows((prevRows) =>
          //   prevRows.map((row) => ({
          //     ...row,
          //     CheckSum: 0,
          //     CheckSumFC: 0,
          //     TrsfrSum: 0,
          //     TrsfrSumFC: 0,
          //     CashSum: 0,
          //     CashSumFC: 0,
          //     CreditSum: 0,
          //     CredSumFC: 0,
          //     TOTAL: 0,
          //   }))
          // );
          setcheckTabRows([]);
          // setCreditCardRows((prevRows) =>
          //   prevRows.map((row) => ({
          //     ...row,
          //     CreditSum: 0,
          //     CredSumFC: 0,
          //     TOTAL: 0,
          //   }))
          // );
          setCreditCardRows([]);
          // Also reset global totals
          setValue("CheckSum", "0.000000");
          setValue("CheckSumFC", "0.000000");
          setValue("TrsfrSum", "0.000000");
          setValue("TrsfrSumFC", "0.000000");
          setValue("CashSum", "0.000000");
          setValue("CashSumFC", "0.000000");
          // setValue("TotalAmountDue", "0.000000");
          // setValue("TotalAmountDueFC", "0.000000");
        } else {
          // Open modal for manual rate
          setExchangeRateModalData({
            RateDate: date,
            Currency: currency,
            DocEntry: ERDocEntry,
          });
          setManualRate("");
          setExchangeRateModalOpen(true);
        }
      } else {
        // No rate found
        setExchangeRateModalData({ RateDate: date, Currency: currency });
        setManualRate("");
        setExchangeRateModalOpen(true);
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.message || "Failed to fetch exchange rate!",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchExchangeRate = async (date, currency) => {
    if (SaveUpdateName !== "SAVE") return;

    if (!date || !currency) {
      Swal.fire({
        icon: "warning",
        title: "Missing Data",
        text: "Date or Currency is missing to get Exchange Rate!",
        confirmButtonText: "OK",
      });
      return null;
    }
    if (currency === localCurrency) return;

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
          return rate; // ✅ valid rate found
        } else {
          // Rate = 0 or invalid
          setExchangeRateModalData({
            RateDate: date,
            Currency: currency,
            DocEntry: ERDocEntry,
          });
          setManualRate(""); // clear manual rate input
          setExchangeRateModalOpen(true);
          return null;
        }
      } else {
        // No rate found in response
        setExchangeRateModalData({ RateDate: date, Currency: currency });
        setManualRate("");
        setExchangeRateModalOpen(true);
        return null;
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.message || "Failed to fetch exchange rate!",
        "error",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };
  const handlePaymentMeansSave = () => {
    const trsfrSum = getValues("TrsfrSum");
    const trsfrAcct = getValues("TrsfrAcct");
    const cashSum = getValues("CashSum");
    const cashAcct = getValues("CashAcct");
    const checkAcct = watch("CheckAcct");

    // Validate Transfer
    if (trsfrSum && !trsfrAcct) {
      Swal.fire({
        icon: "warning",
        text: "G/L ACCOUNT is required in Bank Transfer",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Validate Cash
    if (cashSum && !cashAcct) {
      Swal.fire({
        icon: "warning",
        text: "G/L ACCOUNT is required in Cash Tab",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (checkTabRows.length > 0 && (!checkAcct || checkAcct.trim() === "")) {
      Swal.fire({
        icon: "warning",
        text: "G/L ACCOUNT is required in Check Tab",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    const totalDue = getValues("TotalAmountDue") || 0;
    const paid = getValues("DocTotal") || 0;
    if (totalDue !== paid) {
      Swal.fire({
        icon: "warning",
        text: "Total payment amount does not match the sum of applied amounts.",
      });
      return; // Stop form submission
    }

    setOpen(false);
  };

  //=================watch fields============================================
  const selectedCode = useWatch({ control, name: "DocType" });
  const dynamicColumns = selectedCode === "ACCOUNT" ? AccCol : columns;
  const rows = selectedCode === "ACCOUNT" ? accRows : businessCodeData;
  const isAnyRowSelected = useMemo(() => {
    return rows.some((row) => row.IsSelected);
  }, [rows]);
  const selectedCard = useWatch({
    control: ccControl,
    name: "CreditCard",
  });
  const isDisabled = !selectedCard;

  const watchSeries = watch("Series");
  const SelectedAcctName = watch("SelectedAcctName");
  const SelectedCashAcctName = watch("SelectedCashAcctName");
  const SelectedBankAcctName = watch("SelectedBankAcctName");
  const watchCheck = watch("CheckSum") || 0;
  const watchBank = watch("TrsfrSum") || 0;
  const watchBankFC = watch("TrsfrSumFC") || 0;
  const watchCash = watch("CashSum") || 0;
  const watchCashFC = watch("CashSumFC") || 0;
  const watchCheckFC = watch("CheckSumFC") || 0;
  const watchBCharge = watch("BkChgAmt") || 0;
  const OAmount = watch("OverallAmount") || 0;
  const OAmountFC = watch("OverallAmountFC") || 0;
  const watchPaid = watch("DocTotal") || 0;
  const watchPaidFC = watch("DocTotalFC") || 0;

  const docTotalValue = parseFloat(watch("DocTotal")) || 0;

  //===============================calculation========================

  const handleAmountBlur = (value, rowId, isPMLocalCurrency) => {
    const docRate = parseFloat(watchDocRate) || 0;

    const updatedRows = checkTabRows.map((row) => {
      if (row.id === rowId) {
        let updatedRow = { ...row };

        if (isPMLocalCurrency) {
          const localValue = parseFloat(value) || 0;
          updatedRow.CheckSum = localValue;
          updatedRow.CheckSumFC = +(localValue / docRate).toFixed(6);
        } else {
          const fcValue = parseFloat(value) || 0;
          updatedRow.CheckSumFC = fcValue;
          updatedRow.CheckSum = +(fcValue * docRate).toFixed(6);
        }

        return updatedRow;
      }
      return row;
    });

    setcheckTabRows(updatedRows);

    // Update totals
    const totalLocal = updatedRows.reduce(
      (sum, row) => sum + (parseFloat(row.CheckSum) || 0),
      0,
    );
    const totalFC = updatedRows.reduce(
      (sum, row) => sum + (parseFloat(row.CheckSumFC) || 0),
      0,
    );

    setValue("CheckSum", totalLocal.toFixed(6));
    setValue("CheckSumFC", totalFC.toFixed(6));
  };

  const handleSumAppliedChange = (e, params, setRows, rows) => {
    let newPaymentValue = parseFloat(e.target.value) || 0;
    const dueLC = parseFloat(params.row.DueAmnt) || 0;
    const dueFC = parseFloat(params.row.DueAmntFC) || 0;
    const cashDiscount = parseFloat(params.row.Dcount) || 0;

    // Prevent exceeding due amounts
    if (
      newPaymentValue > (selectedCurrency === localCurrency ? dueLC : dueFC)
    ) {
      newPaymentValue = selectedCurrency === localCurrency ? dueLC : dueFC;
    }

    // Total before discount
    const totalBeforeDiscountLC =
      cashDiscount !== 100 ? newPaymentValue / (1 - cashDiscount / 100) : 0;
    const totalBeforeDiscountFC =
      cashDiscount !== 100 ? totalBeforeDiscountLC / (watchDocRate || 1) : 0;

    handleDiscountChange(
      "SumApplied",
      newPaymentValue,
      params.row,
      setRows,
      rows,
    );
    handleDiscountChange(
      "BfDcntSum",
      totalBeforeDiscountLC,
      params.row,
      setRows,
      rows,
    );
    handleDiscountChange(
      "BfDcntSumF",
      totalBeforeDiscountFC,
      params.row,
      setRows,
      rows,
    );
  };
  const handleDiscountChange = (field, value, row, setRows, rows) => {
    console.log(
      `handleDiscountChange called for field: ${field}, value: ${value}, row.id: ${row.id}`,
    );
    const rate = parseFloat(watchDocRate) || 1;
    const updatedRows = rows.map((r) => {
      if (r.id !== row.id) return r;

      const newRow = { ...r };
      // --- Update Total Before Discount (LC) ---
      if (field === "BfDcntSum") {
        newRow.BfDcntSum = parseFloat(value) || 0;
        newRow.BfDcntSumF = newRow.BfDcntSum / rate;
        newRow.BfNetDcnt = newRow.BfDcntSum;
        newRow.BfNetDcntF = newRow.BfDcntSumF;
      }

      // --- Update Total Before Discount (FC) ---
      if (field === "BfDcntSumF") {
        newRow.BfDcntSumF = parseFloat(value) || 0;
        newRow.BfDcntSum = newRow.BfDcntSumF * rate;

        console.log("BfDcntSumF:", newRow.BfDcntSumF);
        console.log("BfDcntSum:", newRow.BfDcntSum);

        newRow.BfNetDcnt = newRow.BfDcntSum;
        newRow.BfNetDcntF = newRow.BfDcntSumF;
      }

      // --- Discount Percent ---
      if (field === "Dcount") {
        let discountPercent = parseFloat(value);
        if (
          isNaN(discountPercent) ||
          discountPercent < 0 ||
          discountPercent > 100
        )
          discountPercent = 0;

        newRow.Dcount = discountPercent;
        console.log("Discount Percent Set:", newRow.Dcount);
      }

      // --- COMMON CALCULATIONS ---
      const discountPercent = parseFloat(newRow.Dcount || 0);
      console.log("Final Discount %:", discountPercent);

      newRow.DcntSum = parseFloat(
        ((discountPercent / 100) * newRow.BfDcntSum).toFixed(6),
      );
      newRow.DcntSumFC = parseFloat(
        ((discountPercent / 100) * newRow.BfDcntSumF).toFixed(6),
      );

      console.log("DcntSum (LC):", newRow.DcntSum);
      console.log("DcntSumFC:", newRow.DcntSumFC);

      newRow.SumApplied = parseFloat(
        (newRow.BfDcntSum - newRow.DcntSum).toFixed(6),
      );
      newRow.AppliedFC = parseFloat(
        (newRow.BfDcntSumF - newRow.DcntSumFC).toFixed(6),
      );

      console.log("SumApplied (LC):", newRow.SumApplied);
      console.log("AppliedFC:", newRow.AppliedFC);

      return newRow;
    });

    // --- Update selected rows ---
    setSelectedRows((prev) => {
      const newSel = prev.map((r) => {
        const updated = updatedRows.find((x) => x.id === r.id);
        return updated ? { ...r, ...updated } : r;
      });
      return newSel;
    });
    // --- Update main rows ---
    setRows(updatedRows);
  };

  //====================================Effects==================================
  const checkRefs = useRef({});
  const bankRef = useRef(null);
  const cashRef = useRef(null);
  const creditRef = useRef(null);

  const getFreshBalanceDue = () => {
    // adjust field names below if yours differ
    const check = parseFloat(getValues("CheckSum")) || 0;
    const bank = parseFloat(getValues("TrsfrSum")) || 0;
    const cash = parseFloat(getValues("CashSum")) || 0;
    const credit = parseFloat(getValues("CreditSum")) || 0; // credit card total stored field
    const bCharge = parseFloat(getValues("BankCharge")) || 0; // bank charge field
    const overall = parseFloat(getValues("OverallAmount")) || 0;

    const bal = overall - (check + bank + cash + credit + bCharge);
    return +bal.toFixed(6);
  };

  const getFreshBalanceDueFC = () => {
    // FC field names — change if your field names differ (e.g., CredSumFC vs CredSumFC)
    const checkFC = parseFloat(getValues("CheckSumFC")) || 0;
    const bankFC = parseFloat(getValues("TrsfrSumFC")) || 0;
    const cashFC = parseFloat(getValues("CashSumFC")) || 0;
    const creditFC = parseFloat(getValues("CredSumFC")) || 0; // credit cards in FC
    const bChargeFC = parseFloat(getValues("BankChargeFC")) || 0;
    const overallFC = parseFloat(getValues("OverallAmountFC")) || 0;

    const balFC =
      overallFC - (checkFC + bankFC + cashFC + creditFC + bChargeFC);
    return +balFC.toFixed(6);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();

        const rate = parseFloat(getValues("DocRate")) || 1;

        // Fresh Balance (LC/FC)
        const val = isPMLocalCurrency
          ? getFreshBalanceDue()
          : getFreshBalanceDueFC();

        // =============== CHECK ROWS HANDLING =====================
        const api = modalApiRef.current;
        const focusedCell = api?.state?.focus?.cell;

        if (focusedCell) {
          const { id: rowId, field } = focusedCell;

          if (field === "CheckSum" || field === "CheckSumFC") {
            const row = checkTabRows.find((r) => r.id === rowId);

            if (row) {
              const current =
                parseFloat(isPMLocalCurrency ? row.CheckSum : row.CheckSumFC) ||
                0;

              const updated = current + val;

              const updatedRows = checkTabRows.map((r) =>
                r.id === rowId
                  ? {
                      ...r,
                      CheckSum: isPMLocalCurrency
                        ? updated
                        : +(updated * rate).toFixed(6),
                      CheckSumFC: isPMLocalCurrency
                        ? +(updated / rate).toFixed(6)
                        : updated,
                    }
                  : r,
              );

              setcheckTabRows(updatedRows);

              // Recalculate totals
              const totalLC = updatedRows.reduce(
                (sum, r) => sum + (parseFloat(r.CheckSum) || 0),
                0,
              );
              const totalFC = updatedRows.reduce(
                (sum, r) => sum + (parseFloat(r.CheckSumFC) || 0),
                0,
              );

              setValue("CheckSum", totalLC.toFixed(6));
              setValue("CheckSumFC", totalFC.toFixed(6));

              // keep edit mode
              setTimeout(() => {
                api.startCellEditMode({ id: rowId, field });
              });
            }

            return; // ⛔ stop here for check rows
          }
        }

        // =============== BANK FIELD =====================
        if (document.activeElement === bankRef.current) {
          if (isPMLocalCurrency) {
            const lc = parseFloat(getValues("TrsfrSum")) || 0;
            const newLC = lc + val;

            setValue("TrsfrSum", newLC);
            setValue("TrsfrSumFC", +(newLC / rate).toFixed(6));
          } else {
            const fc = parseFloat(getValues("TrsfrSumFC")) || 0;
            const newFC = fc + val;

            setValue("TrsfrSumFC", newFC);
            setValue("TrsfrSum", +(newFC * rate).toFixed(6));
          }
          return;
        }

        // =============== CASH FIELD =====================
        if (document.activeElement === cashRef.current) {
          if (isPMLocalCurrency) {
            const lc = parseFloat(getValues("CashSum")) || 0;
            const newLC = lc + val;

            setValue("CashSum", newLC);
            setValue("CashSumFC", +(newLC / rate).toFixed(6));
          } else {
            const fc = parseFloat(getValues("CashSumFC")) || 0;
            const newFC = fc + val;

            setValue("CashSumFC", newFC);
            setValue("CashSum", +(newFC * rate).toFixed(6));
          }
          return;
        }

        // =============== CREDIT CARD FIELD =====================
        if (document.activeElement === creditRef.current) {
          if (isPMLocalCurrency) {
            const lc = parseFloat(getCCValues("CreditSum")) || 0;
            const newLC = lc + val;

            setCCValue("CreditSum", newLC);
            setCCValue("CredSumFC", +(newLC / rate).toFixed(6));
          } else {
            const fc = parseFloat(getCCValues("CredSumFC")) || 0;
            const newFC = fc + val;

            setCCValue("CredSumFC", newFC);
            setCCValue("CreditSum", +(newFC * rate).toFixed(6));
          }
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    setValue,
    setCCValue,
    getValues,
    getCCValues,
    checkTabRows,
    isPMLocalCurrency,
  ]);

  useEffect(() => {
    if (SaveUpdateName !== "SAVE") return;
    setValue("CashSum", "");
    setValue("CashSumFC", "");
    setValue("TrsfrSum", "");
    setValue("TrsfrSumFC", "");
    setcheckTabRows([]);
    setCreditCardRows([]);
  }, [isPMLocalCurrency]);
  const handleTrsfrSumChange = (value) => {
    const val = parseFloat(value) || 0;

    if (isPMLocalCurrency) {
      setValue("TrsfrSum", val); // LC
      setValue("TrsfrSumFC", +(val / watchDocRate).toFixed(6)); // calculate FC
    } else {
      setValue("TrsfrSumFC", val); // FC
      setValue("TrsfrSum", +(val * watchDocRate).toFixed(6)); // calculate LC
    }
  };
  // useEffect(() => {
  //   if (SaveUpdateName !== "SAVE") return;

  //   const lcValue = parseFloat(getValues("CashSum")) || 0; // Use getValues() to get the current stored value
  //   const fcValue = parseFloat(getValues("CashSumFC")) || 0;

  //   if (isPMLocalCurrency) {
  //     // Show LC in input; recalc LC from stored FC if LC is empty
  //     const newLC = lcValue || +(fcValue * watchDocRate).toFixed(6);
  //     setValue("CashSum", newLC);
  //   } else {
  //     // Show FC in input; recalc FC from stored LC if FC is empty
  //     const newFC = fcValue || +(lcValue / watchDocRate).toFixed(6);
  //     setValue("CashSumFC", newFC);
  //   }
  // }, [isPMLocalCurrency, selectedCurrency, watchDocRate]);
  const handleCashSumChange = (value) => {
    const val = parseFloat(value) || 0;

    if (isPMLocalCurrency) {
      setValue("CashSum", val); // LC
      setValue("CashSumFC", +(val / watchDocRate).toFixed(6)); // calculate FC
    } else {
      setValue("CashSumFC", val); // FC
      setValue("CashSum", +(val * watchDocRate).toFixed(6)); // calculate LC
    }
  };
  useEffect(() => {
    if (SaveUpdateName !== "SAVE") return;
    const total = CreditCardRows.reduce(
      (sum, row) => sum + (parseFloat(row.CreditSum) || 0),
      0,
    );
    const totalFC = CreditCardRows.reduce(
      (sum, row) => sum + (parseFloat(row.CredSumFC) || 0),
      0,
    );
    if (isPMLocalCurrency) {
      setValue("CreditSum", total);
    } else {
      setValue("CredSumFC", totalFC);
    }

    const parsedCheck = parseFloat(watchCheck) || 0;
    const parsedBank = parseFloat(watchBank) || 0;
    const parsedCash = parseFloat(watchCash) || 0;
    const parsedBCharge = parseFloat(watchBCharge) || 0;
    const parsedOther = total;

    const overallAmount = parseFloat(OAmount) || 0;

    const totalPaid =
      parsedCheck + parsedBank + parsedCash + parsedBCharge + parsedOther;

    // setValue("DocTotal", Math.ceil(totalPaid));
    setValue("DocTotal", totalPaid.toFixed(6));

    const BalDue = overallAmount - (parseFloat(watchPaid) || 0);
    setValue("BalanceDue", BalDue.toFixed(6));

    const parsedCheckFC = parseFloat(watchCheckFC) || 0;
    const parsedBankFC = parseFloat(watchBankFC) || 0;
    const parsedCashFC = parseFloat(watchCashFC) || 0;
    const parsedBChargeFC = parseFloat(watchBCharge) || 0;
    const parsedOtherFC = totalFC;
    const overallAmountFC = parseFloat(OAmountFC) || 0;

    const totalPaidFC =
      parsedCheckFC +
      parsedBankFC +
      parsedCashFC +
      parsedBChargeFC +
      parsedOtherFC;
    setValue("DocTotalFC", totalPaidFC.toFixed(6));

    const BalDueFC = overallAmountFC - (parseFloat(watchPaidFC) || 0);
    setValue("BalanceDueFC", BalDueFC.toFixed(6));
  }, [
    CreditCardRows,
    watchCheck,
    watchBank,
    watchCash,
    watchCheckFC,
    watchBankFC,
    watchCashFC,
    watchBCharge,
    OAmount,
    OAmountFC,
    watchPaid,
    isPMLocalCurrency,
    setValue,
    watchDocRate,
    selectedCurrency,
  ]);

  useEffect(() => {
    if (
      glDialogState.open &&
      glDialogState.field &&
      glDialogState.currentPage === 0 &&
      glDialogState.rows.length === 0 &&
      !glDialogState.pages[0]
    ) {
      fetchPaginatedGLAccounts(
        glDialogState.field,
        0,
        glDialogState.searchText,
      );
    }
  }, [
    glDialogState.open,
    glDialogState.field,
    glDialogState.currentPage,
    glDialogState.pages,
    glDialogState.rows,
    glDialogState.searchText,
  ]);

  //=====================================All other API=========================================
  const CurrencyData = async () => {
    try {
      setLoading(true); // Start loading

      // Fetch currency data
      const currencyRes = await apiClient.get(`/Currency/all`);
      const currencyList = currencyRes.data?.values || [];

      if (!currencyList.length) {
        Swal.fire({
          icon: "warning",
          title: "No Currency Data Found",
          text: "Please add currency data first!",
          confirmButtonColor: "#3085d6",
        });
      }

      setCurrencydata(currencyList);
    } catch (error) {
      console.error("Error fetching currency data:", error); // Debug log
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Currency Data!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    const selectedCurrency = watch("DocCurr");
    const docRate = parseFloat(watch("DocRate")) || 1;
    const localCurrency = companyData?.MainCurncy;

    if (!selectedCurrency || !companyData) return;

    const isLocal = selectedCurrency === localCurrency;
    const isBPAC = bpCurrencyRef.current === "AC";

    const rate = docRate;
    const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    /* ---------------------------------------------------------
     🔹 CASE 1 — ACCOUNT MODE (use accRows.Amount)
  ----------------------------------------------------------*/
    if (selectedCode === "ACCOUNT") {
      const isLocal = watch("DocCurr") === companyData?.MainCurncy;
      const docRate = parseFloat(watch("DocRate")) || 1;

      let totalFC = 0;
      let totalLC = 0;

      accRows.forEach((row) => {
        const sumApplied = parseFloat(row.SumApplied) || 0;
        const appliedFC = parseFloat(row.AppliedFC) || 0;

        if (isLocal) {
          // --------------------------------------------
          // CASE 1: LOCAL CURRENCY
          // --------------------------------------------
          totalLC += sumApplied;
          totalFC += 0; // FC is always 0
        } else {
          // --------------------------------------------
          // CASE 2: FOREIGN CURRENCY
          // --------------------------------------------
          totalFC += appliedFC; // user inputs this
          totalLC += appliedFC * docRate; // convert to LC
        }
      });

      // Set totals
      if (isLocal) {
        setValue("tempTotalLC", totalLC.toFixed(6));
        setValue("tempTotalFC", "0.00");
      } else {
        setValue("tempTotalFC", totalFC.toFixed(6));
        setValue("tempTotalLC", totalLC.toFixed(6));
      }

      return; // ACCOUNT stops further logic
    }

    /* ---------------------------------------------------------
 🔹 CASE 2 — ORIGINAL BUSINESS CODE LOGIC (selectedRows)
----------------------------------------------------------*/
    if (selectedCode !== "ACCOUNT") {
      // ⭐ FIX: Reset totals when no row is selected
      if (!selectedRows || selectedRows.length === 0) {
        setValue("tempTotalLC", 0);
        setValue("tempTotalFC", 0);
        setcheckTabRows([]);
        setCreditCardRows([]);
        // Also reset global totals
        setValue("CheckSum", "");
        setValue("CheckSumFC", "");
        setValue("TrsfrSum", "");
        setValue("TrsfrSumFC", "");
        setValue("CashSum", "");
        setValue("CashSumFC", "");
        return;
      }

      let totalLC = 0;
      let totalFC = 0;

      selectedRows.forEach((row) => {
        const sumAppliedLC = parseFloat(row.SumApplied || 0);
        const appliedFC = parseFloat(row.AppliedFC || 0);

        const rowLC =
          sumAppliedLC !== 0
            ? sumAppliedLC
            : appliedFC !== 0
              ? appliedFC * rate
              : 0;

        if (isLocal || isBPAC) {
          totalLC = round(totalLC + rowLC);
          totalFC = round(totalFC + rowLC / rate);
        } else {
          if (appliedFC !== 0) {
            totalFC = round(totalFC + appliedFC);
            totalLC = round(totalLC + appliedFC * rate);
          } else {
            totalLC = round(totalLC + rowLC);
            totalFC = round(totalFC + rowLC / rate);
          }
        }
      });

      setValue("tempTotalLC", totalLC);
      setValue("tempTotalFC", totalFC);
    }
  }, [
    accRows,
    selectedRows,
    selectedCode,
    businessCodeData,
    companyData,
    watch("DocCurr"),
    watch("DocRate"),
  ]);

  // 2️⃣ Calculate overall totals and derived amounts when totals or rates change
  useEffect(() => {
    if (SaveUpdateName !== "SAVE") return;
    const totalLC = parseFloat(watch("tempTotalLC") || 0);
    const totalFC = parseFloat(watch("tempTotalFC") || 0);
    const docRate = parseFloat(watch("DocRate")) || 1;
    const amountDue = docTotalValue > 0 ? docTotalValue : totalLC;

    const totalAmountDue = docRate > 0 ? totalFC * docRate : totalLC;

    setValue("TotalAmountDue", totalLC.toFixed(6));
    setValue("TotalAmountDueFC", totalFC.toFixed(6));
    setValue("OverallAmount", totalLC.toFixed(6));
    setValue("OverallAmountFC", totalFC.toFixed(6));
    setValue("AmountDue", totalLC.toFixed(6));
    setValue("AmountDueFC", totalFC.toFixed(6));
  }, [
    watch("tempTotalLC"),
    watch("tempTotalFC"),
    docTotalValue,
    watch("DocRate"),
    SaveUpdateName,
  ]);

  useEffect(() => {
    setValue("DocRate", watchDocRate);
  }, [watchDocRate]);

  useEffect(() => {
    if (SaveUpdateName !== "SAVE") return;
    if (!selectedCurrency || !BaseDocData) return;
    const isLocal = selectedCurrency === localCurrency;

    const updateGridValues = async () => {
      let rate = 1;
      if (!isLocal) {
        const fetchedRate = await fetchExchangeRate(
          watchDocDate,
          selectedCurrency,
        );
        if (fetchedRate) rate = fetchedRate;
        setValue("DocRate", rate);
      } else {
        setValue("DocRate", "");
      }

      const updatedRows = businessCodeData.map((row) => {
        const baseRow = BaseDocData.find((b) => b.DocEntry === row.DocEntry);
        if (!baseRow) return row;

        // Always keep LC values from baseRow
        const docTotalLC = parseFloat(baseRow.DocTotal || 0);
        const dueLC = parseFloat(baseRow.DueAmnt || 0);

        // FC values stay untouched
        const docTotalFC = parseFloat(baseRow.DocTotalFC || 0);
        const dueFC = parseFloat(baseRow.DueAmntFC || 0);

        // Applied / vat calculation (LC-based)
        const appliedSys = parseFloat(
          ((row.SumApplied || dueLC) / baseRow.SysRate).toFixed(6),
        );
        const vatApplied = parseFloat(
          (
            ((baseRow.VatSum || 0) / docTotalLC) *
            (row.SumApplied || dueLC)
          ).toFixed(6),
        );
        const vatAppldSy = parseFloat(
          (vatApplied / baseRow.SysRate).toFixed(6),
        );

        return {
          ...row,
          DocTotal: docTotalLC,
          DueAmnt: dueLC,
          BfDcntSum: dueLC,
          BfNetDcnt: dueLC,
          SumApplied: row.SumApplied || dueLC,

          DocTotalFC: docTotalFC,
          DueAmntFC: dueFC,
          BfDcntSumF: dueFC,
          BfNetDcntF: dueFC,
          AppliedFC: row.AppliedFC || dueFC,

          BfDcntSumS: parseFloat((dueLC / baseRow.SysRate).toFixed(6)),
          BfNetDcntS: parseFloat((dueLC / baseRow.SysRate).toFixed(6)),
          DcntSumSy: parseFloat(row.DcntSum / baseRow.SysRate || 0),
          AppliedSys: appliedSys,
          vatApplied,
          vatAppldSy,
        };
      });

      setBusinessCodeData(updatedRows);
    };

    updateGridValues();
  }, [selectedCurrency, BaseDocData, watchDocDate, SaveUpdateName, setValue]);
  // Fetch base documents and map initial LC/FC values
  const fetchBusinessCodeData = useCallback(
    async (cardCode, selectedCurrency, page = 0, limit = LIMIT) => {
      if (!cardCode) return;

      const cacheKey = `${cardCode}_${selectedCurrency}_${page}`;
      if (dataCache[cacheKey]) {
        setBusinessCodeData(dataCache[cacheKey]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await apiClient.get(
          `/IncomingPayments/BaseDocuments/${cardCode}/${page}/${limit}`,
        );
        const rawData = response.data.values || [];
        setBaseDocData(rawData);

        const mappedData = rawData.map((item, index) => {
          const docTotalLC = parseFloat(item.DocTotal || 0);
          const dueLC = parseFloat(item.DueAmnt || 0);
          let docTotalFC = parseFloat(item.DocTotalFC || 0);
          let dueFC = parseFloat(item.DueAmntFC || 0);

          const AppliedSys = parseFloat((dueLC / item.SysRate || 0).toFixed(6));
          const vatApplied = parseFloat(
            (((item.VatSum || 0) / docTotalLC) * dueLC).toFixed(6),
          );
          const vatAppldFC = parseFloat((vatApplied / item.DocRate).toFixed(6));
          const vatAppldSy = parseFloat((vatApplied / item.SysRate).toFixed(6));

          return {
            id: index + 1 + page * limit,
            DocEntry: item.DocEntry,
            InvoiceId: item.DocNum,
            InstId: item.InstId || "1",
            InvType: item.SourceType,
            DocDate: dayjs(item.DocDate).format("YYYY-MM-DD"),
            OverDueDays: item.OverDueDays,
            DocTotal: docTotalLC,
            DocTotalFC: docTotalFC,
            DueAmnt: dueLC,
            DueAmntFC: dueFC,
            BfDcntSum: dueLC,
            BfDcntSumF: dueFC,
            BfNetDcnt: dueLC,
            BfNetDcntF: dueFC,
            SumApplied: dueLC,
            AppliedFC: dueFC,
            AppliedSys: AppliedSys,
            Currency: item.DocCur,
            DocRate: item.DocRate,
            SysRate: item.SysRate,
            VatSum: item.VatSum,
            vatApplied,
            vatAppldFC,
            vatAppldSy,
            IsSelected: false,
          };
        });

        setBusinessCodeData(mappedData);
        setDataCache((prev) => ({ ...prev, [cacheKey]: mappedData }));
        setRowCount(
          mappedData.length < limit
            ? page * limit + mappedData.length
            : (page + 1) * limit + 1,
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Failed to fetch Base Documents Data!",
          text: error.response?.data?.message || "Something went wrong.",
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dataCache, localCurrency, watchDocRate],
  );
  useEffect(() => {
    setBusinessCodeData((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        IsSelected: selectedRows.some((r) => r.InvoiceId === row.InvoiceId),
      })),
    );
  }, [selectedRows, selectedCode]);
  const handlePaginationModelChange = useCallback(
    (model) => {
      const { page, pageSize } = model;

      // -----------------------------
      // UPDATE MODE → Local pagination
      // -----------------------------
      if (SaveUpdateName === "UPDATE") {
        setCurrentPage(page);

        // This will have your sliced data like: [page0, page1]
        const pageData = localPaginationCache[page] || [];
        setBusinessCodeData(pageData);
        return;
      }

      // -----------------------------
      // SAVE MODE → API pagination
      // -----------------------------
      const cardCode = getValues("CardCode");
      const docCurr = watch("DocCurr");
      const cacheKey = `${cardCode}_${docCurr}_${page}`;

      if (dataCache[cacheKey]) {
        setBusinessCodeData(dataCache[cacheKey]);
        setCurrentPage(page);
        return;
      }

      setCurrentPage(page);
      fetchBusinessCodeData(cardCode, docCurr, page, pageSize);
    },
    [
      SaveUpdateName,
      localPaginationCache,
      dataCache,
      getValues,
      watch,
      fetchBusinessCodeData,
    ],
  );

  const getCreditCardData = async () => {
    try {
      setLoading(true); // Start loading

      // Fetch credit card data
      const creditCardRes = await apiClient.get(`/CreditCardSetup/All`);
      const creditCardList = creditCardRes.data?.values || [];

      if (!creditCardList.length) {
        Swal.fire({
          icon: "warning",
          title: "No Credit Card Data Found",
          text: "Please add credit card setup first!",
          confirmButtonColor: "#3085d6",
        });
      }

      setCreditCarddata(creditCardList);
    } catch (error) {
      console.error("Error fetching credit card data:", error); // Debug log
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Credit Card Data!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const docDate = getValues("DocDate");

  const { DocSeries } = useDocumentSeries(
    "24",
    docDate,
    setValue,
    clearCache,
    SaveUpdateName,
  );
  // const SeriesData = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await apiClient.get(`${BASE_URL}/DocSeries/ByTransId/24`);
  //     const response = res.data.values;
  //     setSeriesdata(response);
  //     setValue("Series", response[0].DocEntry);
  //     setValue("DocNum", response[0].DocNum);
  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Failed to fetch Document Series !",
  //       text: error.response?.data?.message || "Something went wrong. ",
  //       confirmButtonColor: "#3085d6",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const LocationData = async () => {
    try {
      setLoading(true); // Start loading

      // Fetch location data
      const res = await apiClient.get(`/WHSLocation/All`);
      const locationList = res.data?.values || [];

      if (!locationList.length) {
        Swal.fire({
          icon: "warning",
          title: "No Location Data Found",
          text: "Please add warehouse locations first!",
          confirmButtonColor: "#3085d6",
        });
      }

      setLocationData(locationList);
    } catch (error) {
      console.error("Error fetching location data:", error); // Debug log
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Location Data!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const BankData = async () => {
    try {
      setLoading(true); // Start loading

      // Fetch bank data
      const res = await apiClient.get(`/BankSetup/All`);
      const bankList = res.data?.values || [];

      if (!bankList.length) {
        Swal.fire({
          icon: "warning",
          title: "No Bank Data Found",
          text: "Please add bank setup first!",
          confirmButtonColor: "#3085d6",
        });
      }

      setBankData(bankList);
    } catch (error) {
      console.error("Error fetching bank data:", error); // Debug log
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Bank Data!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const BPData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true); // Optional: show loader if needed

      const url = searchTerm
        ? `/BPV2/V2/Search/${searchTerm}/1/${pageNum}/20`
        : `/BPV2/V2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      const newData = response.data?.values || [];

      if (response.data?.success) {
        setHasMoreGetListBP(newData.length === 20);
        setbpdata((prev) => (pageNum === 0 ? newData : [...prev, ...newData]));

        if (!newData.length) {
          Swal.fire({
            icon: "warning",
            title: "No Business Partners Found",
            text: searchTerm
              ? `No results found for "${searchTerm}".`
              : "No Business Partners available.",
            confirmButtonColor: "#3085d6",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching Business Partners data:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Business Partners Data!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Optional: hide loader
    }
  };

  const defaultAcctCodes = {
    CheckAcct: "LinkAct_2",
    TrsfrAcct: "LinkAct_2",
    CreditAcct: "", // no default
    CashAcct: "LinkAct_3", // no default
  };

  const fetchPaginatedGLAccounts = async (
    fieldName,
    page = 0,
    searchText = "",
    isReplace = true,
  ) => {
    // Check cache first
    let shouldReturn = false;

    setGLDialogState((prev) => {
      if (prev.pages[page]) {
        shouldReturn = true;
        return {
          ...prev,
          rows: prev.pages[page],
          currentPage: page,
          searchText: searchText || prev.searchText,
        };
      }
      return prev;
    });
    if (shouldReturn) return;

    try {
      setLoading(true);
      const configMap = {
        CheckAcct: { locManTran: "N", postable: "Y" },
        TrsfrAcct: { locManTran: "N", postable: "Y" },
        CreditAcct: { locManTran: "N", postable: "Y" },
        CashAcct: { locManTran: "N", postable: "Y" },
        AccCol: { locManTran: "N", postable: "Y" }, // ⬅⬅ NEW ENTRY
      };

      if (!configMap[fieldName]) {
        return;
      }

      const cfg = configMap[fieldName];
      const params = new URLSearchParams();
      params.append("Page", page.toString()); // 0-based; adjust if 1-based
      params.append("Limit", glDialogState.pageSize.toString());
      params.append("Status", "1");
      if (searchText) params.append("Search", searchText); // Adjust param if needed
      params.append("LocManTran", cfg.locManTran);
      params.append("Postable", cfg.postable);

      const res = await apiClient.get(`/ChartOfAccounts?${params.toString()}`);

      const newRows = res.data.values || [];

      // Enrich rows – Use item.AcctName directly (no map needed)
      const enrichedRows = newRows.map((item, index) => ({
        id: page * glDialogState.pageSize + index + 1, // Unique ID
        AcctCode: item.AcctCode,
        AcctName: item.AcctName || "", // ✅ Directly from API response
        ActCurr: item.ActCurr === "AC" ? "All Currency" : item.ActCurr,
        // Add other fields
      }));

      // Infer hasMore and totals (unchanged)
      const hasMoreData = newRows.length === glDialogState.pageSize;
      let actualTotal =
        res.data.totalCount || (page + 1) * glDialogState.pageSize; // If API has totalCount; else approximate
      if (!hasMoreData)
        actualTotal = page * glDialogState.pageSize + newRows.length; // Exact on last page

      // Calculate effectiveRowCount (inflate if hasMore) (unchanged)
      let effectiveTotal = hasMoreData
        ? (Math.max(page, glDialogState.maxFetchedPage) + 1) *
            glDialogState.pageSize +
          glDialogState.pageSize // Inflate for next
        : actualTotal;

      // Update state: Cache the page, update rows, track max page (unchanged)
      setGLDialogState((prev) => {
        const updatedPages = { ...prev.pages, [page]: enrichedRows };
        const updatedMaxPage = Math.max(prev.maxFetchedPage, page);
        return {
          ...prev,
          pages: updatedPages,
          rows: enrichedRows, // Set current rows
          currentPage: page,
          totalRows: actualTotal,
          effectiveRowCount: effectiveTotal,
          hasMore: hasMoreData,
          maxFetchedPage: updatedMaxPage,
          searchText: searchText || prev.searchText,
        };
      });

      // Set defaults for page 0 (as before) – But now this is redundant; remove if not needed
      if (page === 0 && !searchText) {
        Object.entries(defaultAcctCodes).forEach(([field, linkKey]) => {
          if (field !== fieldName || !linkKey) return;
          const acctCodeFromDetermination =
            GLAcctDeterminationData[0]?.[linkKey];
          if (!acctCodeFromDetermination) return;
          const row = enrichedRows.find(
            (r) => r.AcctCode === acctCodeFromDetermination,
          );
          if (!row) return;
          // Set form values (unchanged, but now redundant)
          switch (field) {
            case "CheckAcct":
              setValue("CheckAcct", row.AcctCode);
              setValue("SelectedBankAcctName", row.AcctName);
              break;
            case "TrsfrAcct":
              setValue("TrsfrAcct", row.AcctCode);
              setValue("SelectedAcctName", row.AcctName);
              break;

            case "CashAcct":
              setValue("CashAcct", row.AcctCode);
              setValue("SelectedCashAcctName", row.AcctName);
              break;
            default:
              break;
          }
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch GL accounts.",
      });
    } finally {
      setLoading(false);
    }
  };
  // Add after defaultAcctCodes definition
  const fetchDefaultAccountByCode = async (acctCode, field, mode = "SAVE") => {
    if (!acctCode || field === "CreditAcct") return; // Skip empty or no-default fields

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("SearchText", acctCode);
      params.append("Status", "1"); // Match dialog's active status
      // Optional: Add field-specific filters if needed (e.g., for CheckAcct)
      const configMap = {
        CheckAcct: { locManTran: "N", postable: "Y" },
        TrsfrAcct: { locManTran: "N", postable: "Y" },
        CashAcct: { locManTran: "N", postable: "Y" },
      };
      const cfg = configMap[field];
      if (cfg) {
        params.append("LocManTran", cfg.locManTran);
        params.append("Postable", cfg.postable);
      }

      const res = await apiClient.get(`/ChartOfAccounts?${params.toString()}`);
      const account = res.data.values?.[0]; // Assume first match (as in sample)

      if (account) {
        switch (field) {
          case "CheckAcct":
            // In SAVE: Set code; in UPDATE: Code already set, just name
            if (mode === "SAVE" || !getValues("CheckAcct")) {
              // Optional: Only set code if empty (for UPDATE safety)
              setValue("CheckAcct", account.AcctCode);
            }
            setValue("SelectedBankAcctName", account.AcctName);
            break;
          case "TrsfrAcct":
            if (mode === "SAVE" || !getValues("TrsfrAcct")) {
              setValue("TrsfrAcct", account.AcctCode);
            }
            setValue("SelectedAcctName", account.AcctName);
            break;
          case "CashAcct":
            if (mode === "SAVE" || !getValues("CashAcct")) {
              setValue("CashAcct", account.AcctCode);
            }
            setValue("SelectedCashAcctName", account.AcctName);
            break;
          default:
            break;
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Chart of Accounts Data!",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };
  // Add after fetchDefaultAccountByCode definition
  // Updated setGLDefaults function (add/replace after fetchDefaultAccountByCode)
  const setGLDefaults = async (mode) => {
    // Unify: Always array of field names (strings)
    const fieldsToProcess =
      mode === "SAVE"
        ? Object.keys(defaultAcctCodes).filter((key) => defaultAcctCodes[key]) // e.g., ["CheckAcct", "TrsfrAcct", "CashAcct"] (skip empty linkKeys like CreditAcct)
        : ["CheckAcct", "TrsfrAcct", "CashAcct"]; // Hardcoded GL fields for UPDATE

    for (const field of fieldsToProcess) {
      // ✅ Simple iteration over strings (no destructuring)
      let acctCode;

      if (mode === "SAVE") {
        // From GLDetermination (use linkKey to get acctCode)
        const linkKey = defaultAcctCodes[field];
        acctCode = GLAcctDeterminationData[0]?.[linkKey];
      } else {
        // From loaded form values (UPDATE mode)
        acctCode = getValues(field); // e.g., getValues("CheckAcct")
      }

      if (acctCode) {
        // Skip if empty
        await fetchDefaultAccountByCode(acctCode, field, mode); // Fetch name (and code if SAVE)
      }
    }
  };

  useEffect(() => {
    if (GLAcctDeterminationData.length > 0 && SaveUpdateName === "SAVE") {
      setGLDefaults("SAVE"); // Handles initial defaults on load (and after Add clear)
    }
  }, [GLAcctDeterminationData, SaveUpdateName]); // Add SaveUpdateName to deps

  const openGLDialog = (fieldName) => {
    setGLDialogState((prev) => ({
      ...prev,
      open: true,
      field: fieldName,
      rows: [],
      pages: {}, // Empty cache
      currentPage: 0,
      maxFetchedPage: -1,
      hasMore: true,
      effectiveRowCount: 0,
      searchText: "",
    }));
  };

  const handlePaginationChange = (newPaginationModel) => {
    const newPage = newPaginationModel.page; // e.g., 1 for next, 0 for prev
    const pageSize = newPaginationModel.pageSize || glDialogState.pageSize;

    // If page in cache, use it (no API for prev/next within cached range)
    if (glDialogState.pages[newPage]) {
      setGLDialogState((prev) => ({
        ...prev,
        rows: prev.pages[newPage],
        currentPage: newPage,
      }));
      return; // No fetch needed
    }

    // Otherwise, fetch (typically for "next" to new page)
    if (newPage !== glDialogState.currentPage) {
      fetchPaginatedGLAccounts(
        glDialogState.field,
        newPage,
        glDialogState.searchText,
        true,
      );
    }

    // Update current page
    setGLDialogState((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleSearchChange = (searchText) => {
    const trimmed = searchText.trim();

    // If empty search → reset paging & refetch WITHOUT recursion
    if (!trimmed) {
      setGLDialogState((prev) => ({
        ...prev,
        searchText: "",
        currentPage: 0,
        rows: [],
        pages: {},
        maxFetchedPage: -1,
        hasMore: true,
        effectiveRowCount: 0,
      }));

      fetchPaginatedGLAccounts(glDialogState.field, 0, "", true);
      return;
    }

    // Normal search
    setGLDialogState((prev) => ({
      ...prev,
      searchText: trimmed,
      currentPage: 0,
      rows: [],
      pages: {},
      maxFetchedPage: -1,
      hasMore: true,
      effectiveRowCount: 0,
    }));

    fetchPaginatedGLAccounts(glDialogState.field, 0, trimmed, true);
  };

  const fetchGetListData = async (pageNum, searchTerm = "", selectedVal) => {
    // Determine type code based on selected value
    const typeCode =
      selectedVal === "CUSTOMER" ? "C" : selectedVal === "VENDOR" ? "V" : "";

    if (!typeCode) {
      return; // Exit if invalid selection
    }

    try {
      setLoading(true); // Show loader

      const url = searchTerm
        ? `/BPV2/V2/ByCardType/Search/${searchTerm}/${typeCode}/1/${pageNum}/20`
        : `/BPV2/V2/ByCardType/Pages/${typeCode}/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      const newData = response.data?.values || [];

      if (response.data?.success) {
        setHasMoreGetList(newData.length === 20);
        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        // Optional warning if no data found
        if (!newData.length) {
          Swal.fire({
            icon: "warning",
            title: "No Business Partners Found",
            text: searchTerm
              ? `No results found for "${searchTerm}".`
              : "No Business Partners available.",
            confirmButtonColor: "#3085d6",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching Business Partners data:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Business Partners Data!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const fetchCountries = async () => {
    try {
      setLoading(true); // Start loader

      const res = await apiClient.get(`/Country/all`);
      const countryList = res.data?.values || [];

      if (res.data?.success) {
        setCountries(countryList);

        if (!countryList.length) {
          Swal.fire({
            icon: "warning",
            title: "No Countries Found",
            text: "Please add country data first!",
            confirmButtonColor: "#3085d6",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching country data:", err); // Debug log
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Country Data!",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const setbusinessPartner = async (CardCode, LineNum) => {
    try {
      setLoading(true); // Start loader

      const res = await apiClient.get(`/BPV2/V2/ByCardCode/${CardCode}`);
      const response = res.data;

      if (response?.success) {
        setBusinessPartnerData(response.values || []);
        setValue("CntctCode", LineNum || "");
      } else {
        setBusinessPartnerData([]);
        if (response?.message) {
          Swal.fire({
            title: "Warning!",
            text: response.message,
            icon: "warning",
            confirmButtonColor: "#3085d6",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching Business Partner data:", error); // Debug log
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while fetching Business Partner data.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const onSelectBusinessPartner = async (DocEntry) => {
    setValue("CashSum", "");
    setValue("TrsfrSum", "");
    setDataCache({});
    setcheckTabRows([]);
    setCreditCardRows([]);
    const { data } = await apiClient.get(`/BPV2/V2/${DocEntry}`);
    const { values } = data;

    // like "USD"
    // setValue("DocCurr", values.Currency)

    setValue("DocCurr", values.Currency);
    bpCurrencyRef.current = values.Currency;
    setValue(
      "DocCurr",
      values.Currency === "AC" ? companyData.MainCurncy : values.Currency,
    );
    let selectedAddress =
      (values?.oLines || []).find(
        (item) => item.LineNum === values.DfltShiped,
      ) || {};
    let DfltAddress = [
      // selectedAddress.Address,
      selectedAddress.Address1,
      selectedAddress.Address2,
      selectedAddress.City,
      selectedAddress.State,
      selectedAddress.Zipcode,
      selectedAddress.Country,
    ]
      .filter(Boolean)
      .join(", ");
    setValue("DfltAddress", DfltAddress || "");
    setValue("BlockS", selectedAddress.Address1);
    setValue("StreetS", selectedAddress.Address2);
    setValue("CityS", selectedAddress.City);
    setValue("StateS", selectedAddress.State);
    setValue("CountryS", selectedAddress.Country);
    setValue("ZipcodeS", selectedAddress.Zipcode);

    let selectedBillToAddress =
      (values?.oLines || []).find(
        (item) => item.LineNum === values.DfltBilled,
      ) || {};

    let DfltBillToAddress = [
      selectedBillToAddress.Address1,
      selectedBillToAddress.Address2,
      selectedBillToAddress.City,
      selectedBillToAddress.State,
      selectedBillToAddress.Zipcode,
      selectedBillToAddress.Country,
    ]
      .filter(Boolean)
      .join(", ");

    setValue("Address", DfltBillToAddress || "");

    setBusinessPartnerData(values);
    handleCloseDialog();
    setValue("CardCode", values.CardCode);
    // fetchBusinessCodeData(values.CardCode);
    setValue("CardName", values.CardName);
    // setValue("PayToCode", values.DfltBilled ? String(values.DfltBilled) : "");
    // setValue("CntctCode", values.CntctPrsn ? String(values.CntctPrsn) : "");
    setValue("ShipToCode", values.DfltShiped || "");
    // setValue("PayToCode", values.DfltBilled || "");
    setValue("TrnspCode", values.ShipType || "");
    setValue("NumAtCard", values?.NumAtCard || "");
    setValue("Currency", values.Currency);

    setSelectedRows([]); // Clear old selections
    setValue("OpenBal", "0"); // Reset open balance
    setValue("AmountDue", "0"); // Reset amount due
    setValue("TotalAmountDue", "0"); // Reset total amount due
    setValue("OverallAmount", "0"); // Reset overall amount
    setValue("DocTotal", "0"); // Reset paid total to trigger recalculation
    const localCurrency = companyData?.MainCurncy;
    const bpCurrency = values.Currency; // from selected business partner

    if (bpCurrency === "AC") {
      // Case 3: All Currencies
      setCurrencyOptions(
        currencydata.map((item) => ({
          key: item.CurrCode,
          value: item.CurrName,
        })),
      );
    } else if (bpCurrency === localCurrency) {
      // Case 1: Same as Local Currency
      setCurrencyOptions([
        {
          key: bpCurrency,
          value:
            currencydata.find((item) => item.CurrCode === bpCurrency)
              ?.CurrName || bpCurrency,
        },
      ]);
    } else {
      // Case 2: Different from Local Currency
      const options = [];

      const localCurr = currencydata.find(
        (item) => item.CurrCode === localCurrency,
      );
      const bpCurr = currencydata.find((item) => item.CurrCode === bpCurrency);

      if (localCurr)
        options.push({ key: localCurr.CurrCode, value: localCurr.CurrName });
      if (bpCurr)
        options.push({ key: bpCurr.CurrCode, value: bpCurr.CurrName });

      setCurrencyOptions(options);
    }
    // Set default currency value in form
    // Set document currency
    const selectedDocCurr = bpCurrency === "AC" ? localCurrency : bpCurrency;
    setValue("DocCurr", selectedDocCurr);
    setValue("PMDocCurr", selectedDocCurr);

    // ✅ Fetch and set exchange rate only if different from local currency
    if (selectedDocCurr && selectedDocCurr !== localCurrency) {
      const rate = await fetchExchangeRate(watchDocDate, selectedDocCurr);

      if (rate !== null && rate !== undefined) {
        setValue("DocRate", rate);
        setValue("DocRate", rate);
      }
    } else {
      // Local currency → clear the rate field
      setValue("DocRate", "");
    }
    fetchBusinessCodeData(values.CardCode, selectedDocCurr);
  };
  let handleAddressBILLTO = (value) => {
    let selectedAddress =
      (BusinessPartnerData?.oLines || []).find(
        (item) => item.LineNum === value,
      ) || {};

    let Address = [
      //  selectedAddress.Address,
      selectedAddress.Address1,
      selectedAddress.Address2,
      selectedAddress.City,
      selectedAddress.State,
      selectedAddress.Zipcode,
      selectedAddress.Country,
    ]
      .filter(Boolean)
      .join(", ");

    setValue("Address", Address || "");
  };
  const selectBPforOIB = async (DocEntry) => {
    try {
      setLoading(true); // Optional loader

      const { data } = await apiClient.get(`/BPV2/V2/${DocEntry}`);
      const values = data?.values;

      if (!values) {
        Swal.fire({
          icon: "warning",
          title: "No Business Partner Found",
          text: "The selected business partner does not exist.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Update only the matching row
      const updatedRows = checkTabRows.map((row) =>
        row.id === oibEditingRowRef.current
          ? { ...row, OrigIssdBy: values.CardCode }
          : row,
      );

      setcheckTabRows(updatedRows);
      setIsOIBGLAccountDialogOpen(false);
      oibEditingRowRef.current = null; // Clear ref
    } catch (error) {
      console.error("Error selecting BP for OIB:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to select Business Partner!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Optional loader
    }
  };

  // useEffect(() => {
  //   // if (SaveUpdateName !== "SAVE") return;
  //   setCreditCardRows((prev) =>
  //     prev.map((row) => ({
  //       ...row,
  //       TOTAL: isPMLocalCurrency
  //         ? parseFloat(row.CreditSum)
  //         : parseFloat(row.CredSumFC),
  //     }))
  //   );
  // }, [isPMLocalCurrency, watchDocRate]);

  const onSave = async () => {
    const formData = getCCValues();

    // ✅ Handle card expiry validation
    if (formData.CardValid) {
      const [mm, yy] = formData.CardValid.split("-");
      const expMonth = parseInt(mm, 10);
      const expYear = 2000 + parseInt(yy, 10);

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      const isExpired =
        expYear < currentYear ||
        (expYear === currentYear && expMonth < currentMonth);

      if (isExpired) {
        const result = await Swal.fire({
          text: "This card is expired, but payments can still be processed. Continue?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Continue",
          cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;
      }
    }

    // ✅ Determine correct field to read based on currency
    const fieldName = isPMLocalCurrency ? "CreditSum" : "CredSumFC";
    const enteredValue = parseFloat(formData[fieldName]) || 0;

    // ✅ Compute LC and FC values correctly
    const lcValue = isPMLocalCurrency
      ? enteredValue
      : +(enteredValue * watchDocRate).toFixed(6);

    const fcValue = isPMLocalCurrency
      ? +(enteredValue / watchDocRate).toFixed(6)
      : enteredValue;

    // ✅ Prepare row data
    const updatedData = {
      id: selectedRowId ?? CreditCardRows.length + 1,
      CreditCard: formData.CreditCard,
      TOTAL: isPMLocalCurrency ? lcValue : fcValue, // For DataGrid display
      CreditSum: lcValue, // Always LC
      CredSumFC: fcValue, // Always FC
      NumOfPmnts: formData.NumOfPmnts,
      FirstSum: formData.FirstSum,
      AddPmntSum: formData.AddPmntSum,
      CreditAcct: formData.CreditAcct,
      CrCardNum: formData.CrCardNum,
      CardValid: formData.CardValid,
      OwnerIdNum: formData.OwnerIdNum,
      OwnerPhone: formData.OwnerPhone,
      CrTypeCode: formData.CrTypeCode,
      VoucherNum: formData.VoucherNum,
      CreditType: formData.CreditType,
      ConfNum: formData.ConfNum,
    };

    // ✅ Update or add new row
    if (isEditMode && selectedRowId !== null) {
      setCreditCardRows((prev) =>
        prev.map((row) => (row.id === selectedRowId ? updatedData : row)),
      );

      Swal.fire({
        text: "Credit Card Details Updated Successfully",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    } else {
      const newId = CreditCardRows.length + 1;
      setCreditCardRows((prev) => [...prev, { ...updatedData, id: newId }]);

      Swal.fire({
        text: "Credit Card Details Added Successfully",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    }

    // ✅ Reset form & state
    resetCCForm();
    clearCCForm();
    setIsEditMode(false);
    setSelectedRowId(null);
  };

  const onRowClick = (params) => {
    const selected = CreditCardRows.find((row) => row.id === params.id);
    if (selected) {
      const displayValue = isPMLocalCurrency
        ? selected.CreditSum
        : selected.CredSumFC;
      resetCCForm({
        CreditCard: selected.CreditCard || "",
        originalCreditCard: selected.CreditCard || "",
        CreditSum: displayValue,
        CreditSumLC: selected.CreditSum,
        CredSumFC: selected.CredSumFC,
        NumOfPmnts: selected.NumOfPmnts || "1",
        FirstSum: selected.FirstSum || "",
        AddPmntSum: selected.AddPmntSum || "",
        CreditAcct: selected.CreditAcct || "",
        CrCardNum: selected.CrCardNum || "",
        CardValid: selected.CardValid || "",
        OwnerIdNum: selected.OwnerIdNum || "",
        OwnerPhone: selected.OwnerPhone || "",
        CrTypeCode: selected.CrTypeCode || "",
        VoucherNum: selected.VoucherNum || "",
        CreditType: selected.CreditType || "",
        ConfNum: selected.ConfNum || "",
      });

      setSelectedRowId(params.id);
      setIsEditMode(true);
    }
  };

  const handleCreditCardChange = (e, field) => {
    const selectedValue = e.target.value;
    field.onChange(selectedValue);

    if (selectedRowId !== null) {
      const currentFormData = getCCValues();
      setCreditCardRows((prev) =>
        prev.map((row) =>
          row.id === selectedRowId ? { ...row, ...currentFormData } : row,
        ),
      );
    }
    // Find selected credit card from list
    const selectedCard = creditCarddata.find(
      (card) => card.CardName === selectedValue,
    );

    const acctCode = selectedCard?.AcctCode || "";
    if (isEditMode) {
      const selectedRow = CreditCardRows.find(
        (row) => row.id === selectedRowId,
      );

      // If credit card name changed during edit
      if (selectedRow && selectedRow.CreditCard !== selectedValue) {
        resetCCForm((prev) => ({
          ...prev,
          CreditCard: selectedValue,
          CreditAcct: acctCode,
          CardValid: "",
          OwnerIdNum: "",
          OwnerPhone: "",
          NumOfPmnts: "1",
          VoucherNum: "",
          ConfNum: "",
        }));
      }
    } else {
      resetCCForm((prev) => ({
        ...prev,
        CreditCard: selectedValue,
        CreditAcct: acctCode,
      }));
    }
  };

  const handleDeleteRow = (id) => {
    const updatedRows = checkTabRows.filter((row) => row.id !== id);
    setcheckTabRows(updatedRows);

    // Recalculate total after deletion
    const total = updatedRows.reduce((sum, row) => {
      const amt = parseFloat(row.CheckSum);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);

    setValue("CheckSum", total.toFixed(6));
  };
  const handleAccDeleteRow = (id) => {
    const updated = current.filter((row) => row.id !== id);

    setValue("accRows", updated);
  };

  const handleDeleteCCRow = (idToDelete) => {
    const updatedRows = CreditCardRows.filter((row) => row.id !== idToDelete);
    const reindexedRows = updatedRows.map((row, index) => ({
      ...row,
      id: index + 1,
    }));

    setCreditCardRows(reindexedRows);

    if (idToDelete === selectedRowId) {
      clearCCForm();
    }
  };

  const handleCellChange = (e, id, field) => {
    const value = e.target.value;
    setcheckTabRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleBankChange = (selectedDocEntry, rowId) => {
    if (!selectedDocEntry) {
      // Clear all if no bank
      setcheckTabRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? {
                ...row,
                BankDocEntry: "",
                BankName: "",
                Branch: "",
                AcctNum: "",
                GLAccount: "",
                BranchList: [],
              }
            : row,
        ),
      );
      setValue(`Branch_${rowId}`, "");
      return;
    }

    const selectedBank = bankData.find((b) => b.DocEntry === selectedDocEntry);
    const selectedBankName = selectedBank?.BankName || "";

    // Get branches for that bank
    const matchedLines =
      BusinessPartnerData?.oBPBankAccLines?.filter(
        (line) => line.BankName === selectedBankName,
      ) || [];

    const branches = matchedLines.map((line) => line.Branch);
    const defaultBranch = branches[0] || "";
    const defaultLine = matchedLines.find(
      (line) => line.Branch === defaultBranch,
    );

    setValue(`Branch_${rowId}`, defaultBranch);

    setcheckTabRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              BankDocEntry: selectedDocEntry,
              BankName: selectedBankName,
              Branch: defaultBranch,
              AcctNum: defaultLine?.Account || "",
              GLAccount: defaultLine?.GLAccount || "",
              BranchList: branches,
            }
          : row,
      ),
    );
  };
  const onSelectBranch = (selectedBranchValue, rowId) => {
    if (selectedBankName && selectedBranchValue) {
      const matchedBankAccount = BusinessPartnerData.oBPBankAccLines.find(
        (account) =>
          account.BankName === selectedBankName &&
          account.Branch === selectedBranchValue,
      );

      if (matchedBankAccount) {
        setcheckTabRows((prev) =>
          prev.map((row) =>
            row.id === rowId
              ? { ...row, AcctNum: matchedBankAccount.Account }
              : row,
          ),
        );
      } else {
        setcheckTabRows((prev) =>
          prev.map((row) => (row.id === rowId ? { ...row, AcctNum: "" } : row)),
        );
      }
    }
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(
      getListPage + 1,
      getListSearching ? getListquery : "",
      selectedCode,
    );
    setGetListPage((prev) => prev + 1);
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0); // Reset page to 0
    setGetListData([]); // Clear current data
    fetchGetListData(0, "", selectedCode); // optional: reset to default
  };
  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchGetListData(0, res, selectedCode); // ✅ Fix here
    }, 600);
  };
  //  const modalcolumnsTab0 = [
  //     {
  //       field: "DueDate",
  //       headerName: "DUE DATE",
  //       width: 150,
  //       editable: true,
  //       renderCell: (params) => {
  //         const { row, id, api } = params;
  //         const currentValue = row.DueDate ? dayjs(row.DueDate) : null;

  //         return (
  //           <InputDatePickerFields
  //             name={`DueDate-${id}`}
  //             value={currentValue}
  //             onChange={(newValue) => {
  //               const updatedDate = newValue ? newValue.toISOString() : null;

  //               // Update DataGrid's internal state
  //               api.updateRows([{ ...row, DueDate: updatedDate }]);

  //               // Also update your external state
  //               setcheckTabRows((prev) =>
  //                 prev.map((r) =>
  //                   r.id === id ? { ...r, DueDate: updatedDate } : r,
  //                 ),
  //               );
  //             }}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       field: isPMLocalCurrency ? "CheckSum" : "CheckSumFC",
  //       headerName: "AMOUNT",
  //       width: 120,
  //       renderCell: (params) => (
  //         <ModelInputTextField
  //           name={isPMLocalCurrency ? "CheckSum" : "CheckSumFC"}
  //           value={
  //             isPMLocalCurrency
  //               ? params.row.CheckSum
  //               : params.row.CheckSumFC || ""
  //           }
  //           inputRef={(el) => {
  //             if (el) {
  //               checkRefs.current[params.row.id] = el; // store ref
  //             } else {
  //               delete checkRefs.current[params.row.id]; // cleanup on unmount
  //             }
  //           }}
  //           onChange={(e) => {
  //             const updatedRows = checkTabRows.map((row) =>
  //               row.id === params.row.id
  //                 ? isPMLocalCurrency
  //                   ? { ...row, CheckSum: e.target.value }
  //                   : { ...row, CheckSumFC: e.target.value }
  //                 : row,
  //             );
  //             setcheckTabRows(updatedRows);
  //           }}
  //           onBlur={(e) =>
  //             handleAmountBlur(e.target.value, params.row.id, isPMLocalCurrency)
  //           }
  //         />
  //       ),
  //     },
  //     {
  //       field: "CountryCod",
  //       headerName: "COUNTRY/REGION",
  //       width: 170,
  //       renderCell: (params) => (
  //         <Controller
  //           name={`CountryCod_${params.row.id}`}
  //           control={control}
  //           defaultValue={params.row.CountryCod || ""}
  //           render={({ field }) => {
  //             const countryDropdownData = countries.length
  //               ? countries.map((c) => ({
  //                   key: c.DocEntry,
  //                   value: c.CountryName.trim(),
  //                 }))
  //               : [{ key: "", value: "No Options" }];

  //             return (
  //               <ModelInputSelectTextField
  //                 {...field}
  //                 data={countryDropdownData}
  //                 onChange={(event) => {
  //                   const selectedDocEntry = event.target.value;
  //                   if (!selectedDocEntry) return;

  //                   field.onChange(selectedDocEntry);

  //                   // Update Country in state
  //                   setcheckTabRows((prev) =>
  //                     prev.map((row) =>
  //                       row.id === params.row.id
  //                         ? { ...row, CountryCod: selectedDocEntry }
  //                         : row,
  //                     ),
  //                   );

  //                   // Find selected country code
  //                   const selectedCountry = countries.find(
  //                     (c) => c.DocEntry === selectedDocEntry,
  //                   );
  //                   const selectedCountryCode =
  //                     selectedCountry?.CountryCode || "";

  //                   // Filter banks for that country
  //                   const banksForCountry = bankData.filter(
  //                     (bank) => bank.CountryCode === selectedCountryCode,
  //                   );

  //                   if (banksForCountry.length === 0) {
  //                     setcheckTabRows((prev) =>
  //                       prev.map((row) =>
  //                         row.id === params.row.id
  //                           ? {
  //                               ...row,
  //                               BankDocEntry: "",
  //                               BankName: "",
  //                               Branch: "",
  //                               AcctNum: "",
  //                               GLAccount: "",
  //                               BranchList: [],
  //                             }
  //                           : row,
  //                       ),
  //                     );
  //                     setValue(`BankDocEntry_${params.row.id}`, "");
  //                     setValue(`Branch_${params.row.id}`, "");
  //                     setRowWiseBranchOptions((prev) => ({
  //                       ...prev,
  //                       [params.row.id]: [],
  //                     }));
  //                     return; // stop here if no banks
  //                   }

  //                   // Find BP default bank if available
  //                   const defaultCompanyBank =
  //                     BusinessPartnerData?.oBPBankAccLines?.find((line) =>
  //                       banksForCountry.some(
  //                         (bank) => bank.BankName === line.BankName,
  //                       ),
  //                     );

  //                   // Determine default bank DocEntry
  //                   const defaultBankDocEntry =
  //                     banksForCountry.find(
  //                       (bank) => bank.BankName === defaultCompanyBank?.BankName,
  //                     )?.DocEntry || banksForCountry[0].DocEntry;

  //                   // Set default bank
  //                   setValue(
  //                     `BankDocEntry_${params.row.id}`,
  //                     defaultBankDocEntry,
  //                   );

  //                   // Also update in DataGrid row state so it displays immediately
  //                   setcheckTabRows((prev) =>
  //                     prev.map((row) =>
  //                       row.id === params.row.id
  //                         ? { ...row, BankDocEntry: defaultBankDocEntry }
  //                         : row,
  //                     ),
  //                   );

  //                   // Trigger branch/account update
  //                   handleBankChange(defaultBankDocEntry, params.row.id);
  //                 }}
  //               />
  //             );
  //           }}
  //         />
  //       ),
  //     },
  //     {
  //       field: "BankName",
  //       headerName: "BANK NAME",
  //       sortable: false,
  //       width: 170,
  //       renderCell: (params) => {
  //         const selectedCountry = countries.find(
  //           (c) => c.DocEntry === params.row.CountryCod,
  //         );
  //         const selectedCountryCode = selectedCountry?.CountryCode || "";

  //         const filteredBanks = bankData.filter(
  //           (bank) => bank.CountryCode === selectedCountryCode,
  //         );

  //         const dropdownData = filteredBanks.length
  //           ? filteredBanks.map((bank) => ({
  //               key: bank.DocEntry,
  //               value: bank.BankName,
  //             }))
  //           : [{ key: "", value: "No Options" }];

  //         return (
  //           <Controller
  //             name={`BankDocEntry_${params.row.id}`}
  //             control={control}
  //             defaultValue={params.row.BankDocEntry || ""}
  //             render={({ field }) => (
  //               <ModelInputSelectTextField
  //                 {...field}
  //                 data={dropdownData}
  //                 onChange={(event) => {
  //                   const selectedDocEntry = event.target.value;
  //                   field.onChange(selectedDocEntry);
  //                   handleBankChange(selectedDocEntry, params.row.id);
  //                 }}
  //               />
  //             )}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       field: "Branch",
  //       headerName: "BRANCH",
  //       width: 170,
  //       renderCell: (params) => {
  //         const branchOptions = params.row.BranchList || [];
  //         const dropdownData = branchOptions.length
  //           ? branchOptions.map((branch) => ({
  //               key: branch,
  //               value: branch,
  //             }))
  //           : [{ key: "", value: "No Options" }];

  //         return (
  //           <Controller
  //             name={`Branch_${params.row.id}`}
  //             control={control}
  //             defaultValue={params.row.Branch || ""}
  //             render={({ field }) => (
  //               <ModelInputSelectTextField
  //                 {...field}
  //                 data={dropdownData}
  //                 onChange={(event) => {
  //                   const selectedBranch = event.target.value;
  //                   field.onChange(selectedBranch);

  //                   if (!selectedBranch) {
  //                     // Clear account if branch empty
  //                     setcheckTabRows((prev) =>
  //                       prev.map((row) =>
  //                         row.id === params.row.id
  //                           ? { ...row, AcctNum: "" }
  //                           : row,
  //                       ),
  //                     );
  //                     return;
  //                   }

  //                   const matchedLine =
  //                     BusinessPartnerData?.oBPBankAccLines?.find(
  //                       (line) =>
  //                         line.BankName === params.row.BankName &&
  //                         line.Branch === selectedBranch,
  //                     );

  //                   setcheckTabRows((prev) =>
  //                     prev.map((row) =>
  //                       row.id === params.row.id
  //                         ? {
  //                             ...row,
  //                             Branch: selectedBranch,
  //                             AcctNum: matchedLine?.Account || "",
  //                           }
  //                         : row,
  //                     ),
  //                   );
  //                   onSelectBranch?.(selectedBranch, params.row.id);
  //                 }}
  //               />
  //             )}
  //           />
  //         );
  //       },
  //     },

  //     {
  //       field: "AcctNum",
  //       headerName: "ACCOUNT",
  //       width: 170,
  //       renderCell: (params) => (
  //         <ModelInputTextField
  //           name="AcctNum"
  //           value={params.row.AcctNum || ""} // data={[
  //           //   { key: "1", value: "1" },
  //           //   { key: "2", value: "2" },
  //           // ]}
  //           // value={params.value || "text"}
  //         />
  //       ),
  //     },
  //     {
  //       field: "CheckNo",
  //       headerName: "CHECK NO",
  //       type: "number",
  //       width: 100,
  //       renderCell: (params) => (
  //         <ModelInputTextField
  //           name="CheckNo"
  //           value={params.row.CheckNo || ""} // ensure it defaults to empty string if it's undefined
  //           onChange={(e) => handleCellChange(e, params.row.id, "CheckNo")}
  //         />
  //       ),
  //     },
  //     {
  //       field: "Trnsfrable",
  //       headerName: "ENDORSE",
  //       width: 150,
  //       renderCell: (params) => (
  //         <Controller
  //           name={`Trnsfrable_${params.row.id}`}
  //           control={control}
  //           defaultValue={params.row.Trnsfrable || ""}
  //           render={({ field }) => (
  //             <ModelInputSelectTextField
  //               {...field}
  //               data={[
  //                 { key: "Y", value: "YES" },
  //                 { key: "N", value: "NO" },
  //               ]}
  //               onChange={(event) => {
  //                 const selectedEndorse = event.target.value;
  //                 field.onChange(selectedEndorse);
  //                 // 🛠️ update your row state
  //                 setcheckTabRows((prev) =>
  //                   prev.map((row) =>
  //                     row.id === params.row.id
  //                       ? { ...row, Trnsfrable: selectedEndorse }
  //                       : row,
  //                   ),
  //                 );
  //               }}
  //               fullWidth
  //             />
  //           )}
  //         />
  //       ),
  //     },
  //     // {
  //     //   field: "TOTAL PAYMENT",
  //     //   headerName: "PRIMARY FORM ITEM",
  //     //   type: "number",
  //     //   width: 120,
  //     // },
  //     {
  //       field: "OrigIssdBy",
  //       headerName: "ORIGINALLY ISSUED BY",
  //       width: 180,
  //       renderCell: (params) => (
  //         <ModelInputTextField
  //           value={params.value || ""}
  //           InputProps={{
  //             endAdornment: (
  //               <InputAdornment position="end">
  //                 <ViewListIcon
  //                   style={{
  //                     cursor: "pointer",
  //                     backgroundColor: "green",
  //                     borderRadius: "10%",
  //                     color: "white",
  //                     padding: 2,
  //                   }}
  //                   onClick={() => {
  //                     oibEditingRowRef.current = params.id; // 👈 Save row id
  //                     setIsOIBGLAccountDialogOpen(true);
  //                     BPData(0);
  //                   }}
  //                 />
  //               </InputAdornment>
  //             ),
  //           }}
  //         />
  //       ),
  //     },
  //     {
  //       field: "FiscalID",
  //       headerName: "FISCAL ID",
  //       width: 150,
  //       renderCell: (params) => {
  //         return (
  //           <ModelInputTextField
  //             name="FiscalID"
  //             value={params.row.FiscalID}
  //             onChange={(e) => handleCellChange(e, params.row.id, "FiscalID")}

  //             // onBlur={(e) => handleAmountBlur(e.target.value, params.row.id)}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       field: "actions",
  //       headerName: "Actions",
  //       width: 80,
  //       sortable: false,
  //       filterable: false,
  //       renderCell: (params) => (
  //         <IconButton
  //           size="small"
  //           onClick={() => handleDeleteRow(params.row.id)}
  //           color="error"
  //         >
  //           <DeleteIcon />
  //         </IconButton>
  //       ),
  //     },
  //   ];

  const modalcolumnsTab0 = [
    {
      field: "DueDate",
      headerName: "DUE DATE",
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
    {
      field: isPMLocalCurrency ? "CheckSum" : "CheckSumFC",
      headerName: "AMOUNT",
      width: 120,
      type: "number",
      editable: true,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "CountryCod",
      headerName: "COUNTRY/REGION",
      width: 170,
      // editable: true,
      renderCell: (params) => (
        <Select
          disabled={SaveUpdateName === "UPDATE"}
          value={params.value || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            modalApiRef.current.updateRows([
              { id: params.id, CountryCod: newValue },
            ]);
            // Trigger bank update
            const selectedCountry = countries.find(
              (c) => c.DocEntry === newValue,
            );
            const selectedCountryCode = selectedCountry?.CountryCode || "";
            const filteredBanks = bankData.filter(
              (bank) => bank.CountryCode === selectedCountryCode,
            );
            const defaultBank = filteredBanks[0];
            if (defaultBank) {
              modalApiRef.current.updateRows([
                {
                  id: params.id,
                  BankDocEntry: defaultBank.DocEntry,
                  BankName: defaultBank.BankName,
                },
              ]);
              // Update branches
              const matchedLines =
                BusinessPartnerData?.oBPBankAccLines?.filter(
                  (line) => line.BankName === defaultBank.BankName,
                ) || [];
              const branches = matchedLines.map((line) => line.Branch);
              modalApiRef.current.updateRows([
                {
                  id: params.id,
                  BranchList: branches,
                  Branch: branches[0] || "",
                  AcctNum:
                    matchedLines.find((l) => l.Branch === branches[0])
                      ?.Account || "",
                },
              ]);
            }
          }}
          fullWidth
          size="small"
        >
          {countries?.map((c) => (
            <MenuItem key={c.DocEntry} value={c.DocEntry}>
              {c.CountryName.trim()}
            </MenuItem>
          ))}
        </Select>
      ),
      valueFormatter: (params) => {
        const country = countries?.find((c) => c.DocEntry === params.value);
        return country?.CountryName || "";
      },
    },
    {
      field: "BankName",
      headerName: "BANK NAME",
      sortable: false,
      width: 170,
      // editable: true,
      renderCell: (params) => {
        const selectedCountry = countries.find(
          (c) => c.DocEntry === params.row.CountryCod,
        );
        const selectedCountryCode = selectedCountry?.CountryCode || "";
        const filteredBanks = bankData.filter(
          (bank) => bank.CountryCode === selectedCountryCode,
        );
        return (
          <Select
            disabled={SaveUpdateName === "UPDATE"}
            value={params.row.BankDocEntry || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              const selectedBank = bankData.find(
                (b) => b.DocEntry === newValue,
              );
              modalApiRef.current.updateRows([
                {
                  id: params.id,
                  BankDocEntry: newValue,
                  BankName: selectedBank?.BankName || "",
                },
              ]);
              // Update branches
              const matchedLines =
                BusinessPartnerData?.oBPBankAccLines?.filter(
                  (line) => line.BankName === selectedBank?.BankName,
                ) || [];
              const branches = matchedLines.map((line) => line.Branch);
              modalApiRef.current.updateRows([
                {
                  id: params.id,
                  BranchList: branches,
                  Branch: branches[0] || "",
                  AcctNum:
                    matchedLines.find((l) => l.Branch === branches[0])
                      ?.Account || "",
                },
              ]);
            }}
            fullWidth
            size="small"
          >
            {filteredBanks.map((bank) => (
              <MenuItem key={bank.DocEntry} value={bank.DocEntry}>
                {bank.BankName}
              </MenuItem>
            ))}
          </Select>
        );
      },
      // Remove valueFormatter since it's not needed with renderCell
    },
    {
      field: "Branch",
      headerName: "BRANCH",
      width: 170,
      // editable: true,
      renderCell: (params) => {
        const branches = params.row.BranchList || [];
        return (
          <Select
            disabled={SaveUpdateName === "UPDATE"}
            value={params.value || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              modalApiRef.current.updateRows([
                { id: params.id, Branch: newValue },
              ]);
              // Update AcctNum
              const matchedLine = BusinessPartnerData?.oBPBankAccLines?.find(
                (line) =>
                  line.BankName === params.row.BankName &&
                  line.Branch === newValue,
              );
              modalApiRef.current.updateRows([
                { id: params.id, AcctNum: matchedLine?.Account || "" },
              ]);
            }}
            fullWidth
            size="small"
          >
            {branches.map((branch) => (
              <MenuItem key={branch} value={branch}>
                {branch}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "AcctNum",
      headerName: "ACCOUNT",
      width: 170,
      // editable: true,
      renderCell: (params) => params.value || "",
    },
    {
      field: "CheckNo",
      headerName: "CHECK NO",
      type: "number",
      width: 100,
      editable: true,
      renderCell: (params) => params.value || "",
    },
    {
      field: "Trnsfrable",
      headerName: "ENDORSE",
      width: 150,
      editable: false,
      renderCell: (params) => (
        <Select
          disabled={SaveUpdateName === "UPDATE"}
          value={params.value || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            modalApiRef.current.updateRows([
              { id: params.id, Trnsfrable: newValue },
            ]);
          }}
          fullWidth
          size="small"
        >
          <MenuItem value="Y">YES</MenuItem>
          <MenuItem value="N">NO</MenuItem>
        </Select>
      ),
    },
    {
      field: "OrigIssdBy",
      headerName: "ORIGINALLY ISSUED BY",
      width: 180,
      // editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowIndex = params.row.id;

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            tabIndex={0}
            onKeyDown={(e) => {
              // Open modal only if value is empty
              if (
                !params.value &&
                ["Enter", "F2", " ", "Tab"].includes(e.key)
              ) {
                e.preventDefault();
                oibEditingRowRef.current = rowIndex;
                setIsOIBGLAccountDialogOpen(true);
                BPData(0);
              }
            }}
            sx={{ width: "100%", height: "100%", outline: "none" }}
          >
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap title={params.value || ""}>
                {params.value || ""}
              </Typography>
            </Grid>

            <Grid item sx={{ width: 28, textAlign: "center" }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  oibEditingRowRef.current = rowIndex;
                  setIsOIBGLAccountDialogOpen(true);
                  BPData(0);
                }}
                sx={{
                  cursor: "pointer",
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
      field: "FiscalID",
      headerName: "FISCAL ID",
      width: 150,
      editable: true,
      renderCell: (params) => params.value || "",
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
          onClick={() => handleDeleteRow(params.row.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const round2 = (n) => Math.round(n * 100) / 100;
  const toNumber = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  useEffect(() => {
    if (SaveUpdateName !== "SAVE") return;

    const docRate = parseFloat(watchDocRate);

    setcheckTabRows((prevRows) => {
      const updatedRows = prevRows.map((row) => {
        const lc = toNumber(row.CheckSum);
        const fc = toNumber(row.CheckSumFC);

        return isPMLocalCurrency
          ? { ...row, CheckSum: round2(fc * docRate) } // FC → LC
          : { ...row, CheckSumFC: round2(lc / docRate) }; // LC → FC
      });

      // Update totals after recalculation
      const totalLocal = updatedRows.reduce(
        (sum, row) => sum + toNumber(row.CheckSum),
        0,
      );
      const totalFC = updatedRows.reduce(
        (sum, row) => sum + toNumber(row.CheckSumFC),
        0,
      );

      setValue("CheckSum", round2(totalLocal).toFixed(6));
      setValue("CheckSumFC", round2(totalFC).toFixed(6));

      return updatedRows;
    });
  }, [isPMLocalCurrency, watchDocRate]);
  const addAccRow = () => {
    const newRow = {
      id: current.length + 1,
      AcctCode: "",
      AcctName: "",
      Descrip: "",
      SumApplied: 0,
      AppliedFC: "",
      LocCode: "",
    };

    setValue("accRows", [...current, newRow]);
  };

  const addRow = () => {
    const defaultCountry = countries.find((c) => c.CountryCode === "IND");
    const defaultDocEntry = defaultCountry?.DocEntry ?? "";
    const defaultCountryCode = defaultCountry?.CountryCode || "";

    // Banks for that country only
    const banksForCountry = bankData.filter(
      (bank) => bank.CountryCode === defaultCountryCode,
    );

    // BP’s default bank name
    const defaultBankName = BusinessPartnerData?.BankCode?.trim() || "";

    // Find bank docEntry for BP's default bank name in that country
    const matchedBank = banksForCountry.find(
      (b) => b.BankName?.trim() === defaultBankName,
    );

    const defaultBankDocEntry =
      matchedBank?.DocEntry ||
      (banksForCountry.length > 0 ? banksForCountry[0].DocEntry : "");

    // Get branch list for BP’s default bank
    const matchedBranches =
      BusinessPartnerData?.oBPBankAccLines
        ?.filter((line) => line.BankName === defaultBankName)
        ?.map((line) => line.Branch) || [];

    const defaultBranch = matchedBranches.includes(
      BusinessPartnerData?.DfltBranch,
    )
      ? BusinessPartnerData?.DfltBranch
      : matchedBranches[0] || "";

    const matchedLine = BusinessPartnerData?.oBPBankAccLines?.find(
      (line) =>
        line.BankName === defaultBankName && line.Branch === defaultBranch,
    );
    const defaultAcctNum = matchedLine?.Account || "";

    const newRow = {
      id: Date.now(),
      DueDate: dayjs().format("YYYY-MM-DD"),
      CheckSum: "",
      CountryCod: defaultDocEntry,
      BankDocEntry: defaultBankDocEntry,
      BankName: matchedBank?.BankName || defaultBankName,
      Branch: defaultBranch,
      AcctNum: defaultAcctNum,
      CheckNo: checkTabRows.length + 1,
      Trnsfrable: "",
      OrigIssdBy: "",
      FiscalID: "",
      BranchList: matchedBranches,
    };

    setcheckTabRows((prev) => [...prev, newRow]);

    setRowWiseBranchOptions((prev) => ({
      ...prev,
      [newRow.id]: matchedBranches,
    }));
  };

  useEffect(() => {
    fetchCancelledListData(0); // Load first page on mount
    fetchMoreOpenListData();
    fetchCountries();
    fetchOpenListData(0);
    LocationData();
    BPData(0);
    BankData();
    CurrencyData();
    getCreditCardData();
    fetchGetListData(0, "", selectedCode);
    GLAcctData();
    // getListForCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //===========================Left Side List Pagination and Search===========================================
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
      setLoading(true); // Optional: show loader

      const url = searchTerm
        ? `/IncomingPayments/Search/${searchTerm}/1/${pageNum}/20`
        : `/IncomingPayments/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);
      const newData = response.data?.values || [];

      if (response.data?.success) {
        setHasMoreOpen(newData.length === 20);

        if (!newData.length) {
          Swal.fire({
            text: "Record Not Found",
            icon: "warning",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
        }

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching Incoming Payments list:", error); // Debug log
      Swal.fire({
        icon: "error",
        title: "Failed to fetch Incoming Payments List!",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false); // Optional: hide loader
    }
  };

  //! =================CANCEL LIST================================

  const fetchCancelledListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true); // Optional loader

      const url = searchTerm
        ? `/IncomingPayments/Search/${searchTerm}/3/${pageNum}/20`
        : `/IncomingPayments/Pages/3/${pageNum}/20`;

      const response = await apiClient.get(url);
      const newData = response.data?.values || [];

      if (response.data?.success) {
        setHasMoreCancelled(newData.length === 20);
        setCancelledListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        if (!newData.length) {
          Swal.fire({
            text: "No cancelled records found.",
            icon: "warning",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } else if (response.data?.success === false) {
        Swal.fire({
          text: response.data.message || "Something went wrong.",
          icon: "question",
          confirmButtonText: "OK",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error fetching cancelled payments:", error);
      Swal.fire({
        text: error.response?.data?.message || "Something went wrong.",
        icon: "error",
        confirmButtonText: "OK",
        showConfirmButton: true,
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  // Handle search input
  const handleCancelListSearch = (res) => {
    setCancelledListQuery(res);
    setCancelListSearching(true);
    setCancelListPage(0);
    setCancelledListData([]); // Clear current data
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchCancelledListData(0, res);
    }, 600);
  };

  // Clear search
  const handleCancelListClear = () => {
    setCancelledListQuery(""); // Clear search input
    setCancelListSearching(false); // Reset search state
    setCancelListPage(0); // Reset page count
    setCancelledListData([]); // Clear data
    fetchCancelledListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreCancelListData = () => {
    fetchCancelledListData(
      cancelListPage + 1,
      cancelListSearching ? cancelledListquery : "",
    );
    setCancelListPage((prev) => prev + 1);
  };

  const tabData = [
    {
      value: "0",
      label: "Close",
      data: openListData,
      query: openListquery,
      hasMore: hasMoreOpen,
      fetchMore: fetchMoreOpenListData,
      handleSearch: handleOpenListSearch,
      handleClear: handleOpenListClear,
    },
    {
      value: "1",
      label: "Cancel",
      data: cancelledListData,
      query: cancelledListquery,
      hasMore: hasMoreCancelled,
      fetchMore: fetchMoreCancelListData,
      handleSearch: handleCancelListSearch,
      handleClear: handleCancelListClear,
    },
  ];
  //=================================set Data to Fields=============================
  const { isDirty } = useFormState({ control });
  const { isDirty: isCCDirty } = useFormState({ control: ccControl });
  const setIncPaymentData = async (DocEntry, CardCode, CntctCode, DocType) => {
    // setok("");
    try {
      if (DocType !== "ACCOUNT" && DocType !== "A") {
        await setbusinessPartner(CardCode, CntctCode);
      }
      if (
        (isDirty || isCCDirty) &&
        (getValues("CardCode") || "UPDATE" === ok)
      ) {
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
          setOldOpenData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setOldOpenData(DocEntry);
        setSaveUpdateName("UPDATE");
        setSelectedData(DocEntry);
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
  const setOldOpenData = async (DocEntry) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/IncomingPayments/${DocEntry}`);
      const data = response.data.values;
      setFilesFromApi(data.AttcEntry);
      await CurrencyData();

      setCurrencyOptions(
        currencydata.map((item) => ({
          key: item.CurrCode,
          value: item.CurrName,
        })),
      );
      let mappedDocType = "";
      if (data.DocType === "C") {
        mappedDocType = "CUSTOMER";
      } else if (data.DocType === "V") {
        mappedDocType = "VENDOR";
      } else if (data.DocType === "A") {
        mappedDocType = "ACCOUNT";
      }
      // CurrencyData();
      const updatedData = {
        ...data,
        // DocCurr:
        //   data.DiffCurr === "Y" ? companyData.MainCurncy : data.DiffCurr,
        DocType: mappedDocType,
      };
      updatedData.CntctCode =
        updatedData.CntctCode === "0" ? "" : updatedData.CntctCode;
      updatedData.PayToCode =
        updatedData.PayToCode === "0" ? "" : updatedData.PayToCode;
      reset(updatedData);
      setValue("PMDocCurr", data.DocCurr);
      setValue("DocRate", data.DocRate);
      setValue("DocCurr", data.DocCurr);

      setcheckTabRows(data?.oPaybyChecksLines || []);
      const branchOptions = {};
      const updatedCheckRows = (data?.oPaybyChecksLines || []).map(
        (row, index) => {
          const branchList = row.Branch ? [row.Branch] : [];
          const defaultBranch = branchList[0] || "";

          const rowId = row.LineNum || index + 1;
          branchOptions[rowId] = branchList;
          const checksumLC = parseFloat(row.CheckSum) || 0;
          const checkSumFC = parseFloat(row.CheckSum / data.DocRate).toFixed(6);
          return {
            ...row,
            id: rowId, // make sure each row has a unique id for DataGrid
            Branch: defaultBranch,
            BankDocEntry: row.BankCode,
            CheckSum: checksumLC,
            CheckSumFC: checkSumFC,
          };
        },
      );

      setRowWiseBranchOptions(branchOptions);
      setcheckTabRows(updatedCheckRows);
      const CheckSumSum = updatedCheckRows.reduce((sum, line) => {
        return sum + (parseFloat(line.CheckSum) || 0);
      }, 0);

      setValue("CheckSum", CheckSumSum.toFixed(6));

      const mappedCreditCardRows = (data?.oPaybyCardsLines || []).map(
        (item, index) => {
          // Determine which value to display
          const creditSumLC = parseFloat(item.CreditSum) || 0;
          const creditSumFC = parseFloat(item.CreditSum / data.DocRate).toFixed(
            3,
          );

          const displayTotal = isPMLocalCurrency ? creditSumLC : creditSumFC;

          return {
            id: item.id || index + 1,
            IsSelected: true,
            CreditCard:
              creditCarddata.find((card) => card.DocEntry === item.CreditCard)
                ?.CardName || "",
            TOTAL: displayTotal,
            CreditSum: creditSumLC,
            CredSumFC: creditSumFC,
            NumOfPmnts: item.NumOfPmnts,
            FirstSum: item.FirstSum,
            AddPmntSum: item.AddPmntSum,
            CreditAcct: item.CreditAcct,
            CrCardNum: item.CrCardNum,
            CardValid: item.CardValid,
            OwnerIdNum: item.OwnerIdNum,
            OwnerPhone: item.OwnerPhone,
            CrTypeCode: item.CrTypeCode,
            VoucherNum: item.VoucherNum,
            CreditType: item.CreditType,
            ConfNum: item.ConfNum,
          };
        },
      );

      setCreditCardRows(mappedCreditCardRows);
      if (mappedCreditCardRows.length > 0) {
        setCCValue("CreditCard", mappedCreditCardRows[0].CreditCard);
      }

      const updatedInvLines = (data?.oPaybyInvLines || []).map(
        (line, index) => {
          let updatedInvType = line.InvType;
          if (updatedInvType === "203") {
            updatedInvType = "DP";
          } else if (updatedInvType === "13") {
            updatedInvType = "In";
          } else if (updatedInvType === "19") {
            updatedInvType = "APCN";
          } else if (updatedInvType === "14") {
            updatedInvType = "ARCN";
          }

          return {
            ...line,
            id: `${
              line.DocEntry || line.InvoiceDocNum
            }-${updatedInvType}-${index}`,
            InvType: updatedInvType,
            IsSelected: line.IsSelected === "Y" ? true : false,
            InvoiceId: line.InvoiceDocNum,
            DocTotal: line.DocTotal,
            DocTotalFC: line.DocTotalFC,
            DueAmnt: line.BfNetDcnt,
            DueAmntFC: line.BfNetDcntF,
          };
        },
      );
      if (data.DocType === "C" || data.DocType === "V") {
        // ... existing code ...
      } else if (data.DocType === "A") {
        console.log(
          "Processing ACCOUNT data, oInAccntPayLines:",
          data?.oInAccntPayLines,
        ); // Add this line

        const mappedAccRows = (data?.oInAccntPayLines || []).map((row, i) => {
          console.log(`Mapping row ${i}:`, row); // Add this line to inspect each row

          return {
            ...row,
            id: row.LineNum || i + 1,
            LocCode: row.LocCode === "0" ? "" : row.LocCode,
          };
        });

        console.log("Mapped accRows:", mappedAccRows); // Add this line to inspect the final array

        setValue("accRows", mappedAccRows); // Existing line
        console.log("setValue('accRows') completed"); // Add this line
      }
      setSelectedRows(updatedInvLines);
      // ---------- PAGINATION FOR UPDATE MODE ----------
      const pageSize = LIMIT; // 20
      const totalPages = Math.ceil(updatedInvLines.length / pageSize);

      // Create sliced pages
      const paginated = [];
      for (let i = 0; i < totalPages; i++) {
        paginated.push(updatedInvLines.slice(i * pageSize, (i + 1) * pageSize));
      }

      setLocalPaginationCache(paginated); // NEW STATE
      setRowCount(updatedInvLines.length); // total rows for DataGrid
      setCurrentPage(0); // start page 0
      setBusinessCodeData(paginated[0]); // show first 20
      setValue("AmountDue", data.DocTotal);
      setValue("AmountDueFC", data.DocTotalFC); // Add FC variant
      setValue("TotalAmountDue", data.DocTotal);
      setValue("TotalAmountDueFC", data.DocTotalFC); // New field
      setValue("OverallAmount", data.DocTotal); // System only
      setValue("OverallAmountFC", data.DocTotalFC);

      await setGLDefaults("UPDATE");
      setSelectedData(DocEntry);
      setDocEntry(DocEntry);
    } catch (error) {
      Swal.fire({
        title: error,
        text:
          error.response?.data?.message ||
          "An error occurred while setting Data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  //==================================POST API========================================
  const handleSubmitForm = async (data) => {
    try {
      const rowsToSend = selectedCode === "ACCOUNT" ? accRows : selectedRows;
      const totalDue = parseFloat(data.TotalAmountDue || 0);
      const paid = parseFloat(data.DocTotal || 0);

      // 🔹 Validation 1: Negative Amount
      if (paid < 0) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Amount",
          text: "Payment total (DocTotal) cannot be negative.",
        });
        return;
      }

      // 🔹 Validation 2: Mismatch of amounts
      if (totalDue !== paid) {
        Swal.fire({
          icon: "warning",
          text: "Total payment amount does not match the sum of applied amounts.",
        });
        return;
      }
      // 🔹 VALIDATION 3: ACC ROWS CURRENCY CHECK
      if (selectedCode === "ACCOUNT" && accRows.length > 0) {
        const docCurr = data.DocCurr;
        const missingAcctCodeRows = accRows.filter(
          (row) => !row.AcctCode || row.AcctCode.trim() === "",
        );

        if (missingAcctCodeRows.length > 0) {
          Swal.fire({
            icon: "warning",
            title: "Missing GL Account",
            text: "Each account line must have a GL Account (AcctCode).",
          });
          return; // stop submission
        }

        const invalidAccRows = accRows.filter((row) => {
          debugger;
          const rowCurr = row.Currency?.trim();

          // MUST match DocCurr OR AC
          const isValid =
            rowCurr === docCurr ||
            rowCurr === "AC" ||
            rowCurr === "All Currency";

          return !isValid;
        });

        if (invalidAccRows.length > 0) {
          Swal.fire({
            icon: "warning",
            title: "Currency Mismatch",
            text: "Each Account Line currency must match Document Currency or be 'All Currency'.",
          });
          return;
        }
      }

      // 🔹 Build FormData for attachment
      const formData = new FormData();
      formData.append("DocEntry", getValues().AttcEntry || "");
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
        }
      });

      let attachmentDocEntry = data.AttcEntry || null;

      // 🔹 Upload attachment only when needed
      if (fileData?.length > 0 && SaveUpdateName === "SAVE") {
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
        DocEntry: String(data.DocEntry || ""),
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        Status: "1",
        CardCode: String(data.CardCode || ""),
        CardName: String(data.CardName || ""),
        DocType:
          data.DocType === "CUSTOMER"
            ? "C"
            : data.DocType === "VENDOR"
              ? "V"
              : data.DocType === "ACCOUNT"
                ? "A"
                : "",
        Address: String(data.Address || ""),
        CntctCode: String(data.CntctCode || "0"),
        CFWName: String(data.CFWName || "2"),
        DocNum: String(data.DocNum || ""),
        DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
        DocDueDate: dayjs(data.DocDueDate).format("YYYY-MM-DD"),
        TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
        CounterRef: String(data.CounterRef || ""),
        TransId: String(data.TransId || "24"),
        CreditSum: String(data.CreditSum || "0"),
        DocTotalSy: String((data.DocTotal / SystemRate).toFixed(6) || "0"),
        DocTotal: String(data.DocTotal || "0"),
        CashSumFC: Number.isFinite(Number(data?.CashSumFC))
          ? String(Number(data.CashSumFC) || 0)
          : "0",
        AttcEntry: attachmentDocEntry || data.AttcEntry || "0",
        NoDocSum: String(data.NoDocSum || "0"),
        Comments: String(data.Comments || ""),
        JrnlMemo: String(data.JrnlMemo || ""),
        DiffCurr: data.DiffCurr,
        CheckAcct: String(data.CheckAcct || "0"),
        TrsfrAcct: String(data.TrsfrAcct || "0"),
        TrsfrDate: dayjs(data.TrsfrDate).format("YYYY-MM-DD"),
        TrsfrRef: String(data.TrsfrRef || ""),
        CashAcct: String(data.CashAcct || "0"),
        CashSum: String(data.CashSum || "0"),
        PayToCode: String(data.PayToCode || "0"),
        InstId: String(data.InstId || "0"),
        CredSumFC: Number.isFinite(Number(data?.CredSumFC))
          ? String(Number(data.CredSumFC) || 0)
          : "0",
        CheckSum: String(data.CheckSum || "0"),
        CheckSumFC: Number.isFinite(Number(data?.CheckSumFC))
          ? String(Number(data.CheckSumFC) || 0)
          : "0",
        TrsfrSum: String(data.TrsfrSum || "0"),
        TrsfrSumFC: Number.isFinite(Number(data?.TrsfrSumFC))
          ? String(Number(data.TrsfrSumFC) || 0)
          : "0",
        PayNoDoc: String(data.PayNoDoc || "0"),
        NoDocSumFC: String(data.NoDocSumFC || "0"),
        DocCurr: String(
          selectedCode === "ACCOUNT" ? data.DocCurr : data.PMDocCurr || "",
        ),
        DocRate: String(data.DocRate || "0"),
        SysRate: String(SystemRate || "0"),
        DocTotalFC: Number.isFinite(Number(data.DocTotalFC))
          ? String(data.DocTotalFC)
          : "0",
        Ref1: String(data.Ref1 || "0"),
        DocTime: String(data.DocTime || "0"),
        SpiltTrans: String(data.SpiltTrans || "0"),
        CreateTran: String(data.CreateTran || "0"),
        CashSumSy: String(
          !isNaN(data.CashSum) && !isNaN(SystemRate) && SystemRate !== 0
            ? (data.CashSum / SystemRate).toFixed(6)
            : "0",
        ),
        CredSumSy: String(
          !isNaN(data.CreditSum) && !isNaN(SystemRate) && SystemRate !== 0
            ? (data.CreditSum / SystemRate).toFixed(6)
            : "0",
        ),
        CheckSumSy: String(
          !isNaN(data.CheckSum) && !isNaN(SystemRate) && SystemRate !== 0
            ? (data.CheckSum / SystemRate).toFixed(6)
            : "0",
        ),
        TrsfrSumSy: String(
          !isNaN(data.TrsfrSum) && !isNaN(SystemRate) && SystemRate !== 0
            ? (data.TrsfrSum / SystemRate).toFixed(6)
            : "0",
        ),
        NoDocSumSy: String(data.NoDocSumSy || "0"),
        ObjType: "24",
        StornoRate: String(data.StornoRate || "0"),
        ApplyVAT: String(data.ApplyVAT || "0"),
        Series: String(data.Series || ""),
        confirmed: String(data.confirmed || "0"),
        ShowJDT: String(data.ShowJDT || "0"),
        BankCode: String(data.BankCode || "0"),
        BankAcct: String(data.BankAcct || "0"),
        DataSource: String(data.DataSource || "0"),
        UserSign: String(data.UserSign || "0"),
        VatSum: String(data.VatSum || "0"),
        VatSumFC: String(data.VatSumFC || "0"),
        VatSumSy: String(data.VatSumSy || "0"),
        FinncPriod: String(data.FinncPriod || DocSeries[0]?.FinncPriod || "0"),
        VatPrcnt: String(data.VatPrcnt || "0"),
        Dcount: String(data.Dcount || "0"),
        DcntSum: String(data.DcntSum || "0"),
        DcntSumFC: String(data.DcntSumFC || "0"),
        DcntSumSy: String(data.DcntSumSy || "0"),
        SpltCredLn: String(data.SpltCredLn || "0"),
        PaymentRef: String(data.PaymentRef || "0"),
        Submitted: String(data.Submitted || "0"),
        PayMth: String(data.PayMth || "0"),
        BankCountr: String(data.BankCountr || "0"),
        FreightSum: String(data.FreightSum || "0"),
        FreigtFC: String(data.FreigtFC || "0"),
        FreigtSC: String(data.FreigtSC || "0"),
        Proforma: String(data.Proforma || "0"),
        BpAct: String(data.BpAct || "0"),
        BcgSum: String(data.BcgSum || "0"),
        BcgSumFC: String(data.BcgSumFC || "0"),
        BcgSumSy: String(data.BcgSumSy || "0"),
        PIndicator: String(data.PIndicator || DocSeries[0]?.Indicator || "0"),
        PaPriority: String(data.PaPriority || "0"),
        IsPaytoBnk: String(data.IsPaytoBnk || "0"),
        PBnkCnt: String(data.PBnkCnt || "0"),
        PBnkCode: String(data.PBnkCode || "0"),
        PBnkAccnt: String(data.PBnkAccnt || "0"),
        PBnkBranch: String(data.PBnkBranch || "0"),
        UndOvDiff: String(data.UndOvDiff || "0"),
        UndOvDiffS: String(data.UndOvDiffS || "0"),
        BankActKey: String(data.BankActKey || "0"),
        TransCode: String(data.TransCode || "0"),
        PaymType: String(data.PaymType || "0"),
        TfrRealAmt: String(data.TfrRealAmt || "0"),
        CancelDate: dayjs(undefined).format("YYYY-MM-DD"),
        OpenBal: String(data.OpenBal || "0"),
        OpenBalFc: String(data.OpenBalFc || "0"),
        OpenBalSc: String(data.OpenBalSc || "0"),
        BcgTaxSum: String(data.BcgTaxSum || "0"),
        BcgTaxSumF: String(data.BcgTaxSumF || "0"),
        BcgTaxSumS: String(data.BcgTaxSumS || "0"),
        ChallanNo: String(data.ChallanNo || "0"),
        ChallanBak: String(data.ChallanBak || "0"),
        ChallanDat: dayjs(undefined).format("YYYY-MM-DD"),
        BcgVatPcnt: String(data.BcgVatPcnt || "0"),
        UserSign2: String(data.UserSign2 || "0"),
        ResidenNum: String(data.ResidenNum || "0"),
        UndOvDiffF: String(data.UndOvDiffF || "0"),
        FreeText1: String(data.FreeText1 || "0"),
        ShowDocNo: String(data.ShowDocNo || "0"),
        TDSInterst: String(data.TDSInterst || "0"),
        TDSCharges: String(data.TDSCharges || "0"),
        BPLId: String(data.BPLId || "0"),
        BPLName: String(data.BPLName || "0"),
        VATRegNum: String(data.VATRegNum || "0"),
        BPLCentPmt: String(data.BPLCentPmt || "0"),
        DraftKey: String(data.DraftKey || "0"),
        TDSFee: String(data.TDSFee || "0"),
        MinHeadCL: String(data.MinHeadCL || "0"),
        OwnerCode: String(data.OwnerCode || "0"),
        AgrNo: String(data.AgrNo || "0"),
        CreateTS: String(data.CreateTS || "0"),
        UpdateTS: String(data.UpdateTS || "0"),
        TDSType: String(data.TDSType || "0"),
        // oPaybyChecksLines: [],
        oPaybyInvLines: rowsToSend
          .filter((line) =>
            selectedRows.some((r) => r.InvoiceId === line.InvoiceId),
          )
          .map((line) => {
            const matchingRecord = BaseDocData.find(
              (record) => record.DocNum === line.InvoiceId,
            );
            const docEntry = matchingRecord ? matchingRecord.DocEntry : "0";

            return {
              LineNum: String(line.LineNum || ""),
              DocEntry: String(line.DocEntry || ""),
              InvoiceId: String(docEntry),
              UserId: user.UserId,
              CreatedBy: user.UserName,
              ModifiedBy: user.UserName,
              ModifiedDate: dayjs().format("YYYY-MM-DD"),
              CreatedDate: dayjs().format("YYYY-MM-DD"),
              Status: String(line.Status || "1"),
              IsSelected: line.IsSelected ? "Y" : "N",
              InstId: String(line.InstId || "0"),
              InvoiceDocNum: String(line.InvoiceId),
              InvType: getInvTypeCode(line.InvType, data.DocType),
              DocDate:
                dayjs(data.DocDate).format("YYYY-MM-DD") ||
                dayjs().format("YYYY-MM-DD"),
              DocTotal: String(Math.abs(line.DocTotal || 0)),
              SumApplied: String(Math.abs(line.SumApplied || 0)),
              BfDcntSum: String(Math.abs(line.BfDcntSum || 0)),
              BfNetDcnt: String(Math.abs(line.BfNetDcnt || 0)),
              Dcount: String(Math.abs(line.Dcount || 0)),
              DcntSum: String(Math.abs(line.DcntSum || 0)),

              Rounddiff: String(line.Rounddiff || "0"),
              Comments: String(line.Comments || "0"),
              AppliedFC: String(Math.abs(line.AppliedFC || 0)),
              AppliedSys: String(Math.abs(line.AppliedSys || 0)),

              DocRate: String(line.DocRate || "0"),
              DocLine: String(line.DocLine || "0"),
              vatApplied: String(line.vatApplied || "0"),
              vatAppldFC: String(line.vatAppldFC || "0"),
              vatAppldSy: String(line.vatAppldSy || "0"),
              selfInv: String(line.selfInv || "0"),
              ObjType: "24",
              DcntSumFC: String(Math.abs(line.DcntSumFC || 0)),
              DcntSumSy: String(Math.abs(line.DcntSumSy || 0)),
              BfDcntSumF: String(Math.abs(line.BfDcntSumF || 0)),
              BfDcntSumS: String(Math.abs(line.BfDcntSumS || 0)),
              BfNetDcntF: String(Math.abs(line.BfNetDcntF || 0)),
              BfNetDcntS: String(Math.abs(line.BfNetDcntS || 0)),
              PaidSum: String(Math.abs(line.PaidSum || 0)),

              ExpAppld: String(line.ExpAppld || "0"),
              ExpAppldFC: String(line.ExpAppldFC || "0"),
              ExpAppldSC: String(line.ExpAppldSC || "0"),
              RounddifFc: String(line.RounddifFc || "0"),
              RounddifSc: String(line.RounddifSc || "0"),
              LinkDate: dayjs().format("YYYY-MM-DD"),
              AmtDifPst: dayjs().format("YYYY-MM-DD"),
              PaidDpm: String(line.PaidDpm || "0"),
              DpmPosted: String(line.DpmPosted || "0"),
              ExpVatSum: String(line.ExpVatSum || "0"),
              ExpVatSumF: String(line.ExpVatSumF || "0"),
              ExpVatSumS: String(line.ExpVatSumS || "0"),
              IsRateDiff: String(line.IsRateDiff || "0"),
              DocTransId: String(line.DocTransId || "0"),
              baseAbs: String(line.baseAbs || "0"),
              OverDueDays: String(line.OverDueDays || "0"),
              Currency: String(line.Currency || ""),
              DocTotalFC: String(Math.abs(line.DocTotalFC || 0)),
              DocTotalSY: String(Math.abs(line.DocTotalSY || 0)),
            };
          }),

        oPaybyChecksLines: checkTabRows
          .filter((line) => Number(line.CheckSum) > 0)
          .map((line) => ({
            LineNum: String(line.LineNum || ""),
            DocEntry: String(line.DocEntry || ""),
            UserId: user.UserId,
            CreatedBy: user.UserName,
            ModifiedBy: user.UserName,
            CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
            ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
            Status: String(line.Status || "1"),
            DueDate: dayjs(line.DueDate).format("YYYY-MM-DD"),
            CheckSum: String(line.CheckSum || "0"),
            CountryCod: String(line.CountryCod || "0"),
            BankName: String(line.BankName || "0"),
            Branch: String(line.Branch || "0"),
            AcctNum: String(line.AcctNum || "0"),
            CheckNo: String(line.CheckNo || "0"),
            Trnsfrable: String(line.Trnsfrable || "0"),
            OrigIssdBy: String(line.OrigIssdBy || "0"),
            FiscalID: String(line.FiscalID || "0"),
            DocNum: String(line.DocNum || "0"),
            LineID: String(line.LineID || "0"),
            CheckNum: String(line.CheckNum || "0"),
            BankCode: String(line.BankDocEntry || "0"),
            Details: String(line.Details || "0"),
            Currency: String(data.DocCurr),
            ObjType: "24",
            CheckAct: String(line.CheckAct || "0"),
            CheckAbs: String(line.CheckAbs || "0"),
            BnkActKey: String(line.BnkActKey || "0"),
            ManualChk: String(line.ManualChk || "0"),
            Endorse: String(line.Endorse || "0"),
            EndorsChNo: String(line.EndorsChNo || "0"),
            CFWName: String(line.CFWName || "0"),
          })),

        oPaybyCardsLines: CreditCardRows.map((line) => ({
          LineNum: String(line.LineNum || ""),
          DocEntry: String(line.DocEntry || ""),
          UserId: user.UserId,
          CreatedBy: user.UserName,
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
          CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
          Status: String(line.Status || "1"),
          CreditCard: String(
            creditCarddata.find((card) => card.CardName === line.CreditCard)
              ?.DocEntry || "0",
          ),
          CreditAcct: String(line.CreditAcct || "0"),
          CrCardNum: String(line.CrCardNum || "0"),
          OwnerIdNum: String(line.OwnerIdNum || "0"),
          OwnerPhone: String(line.OwnerPhone || "0"),
          CrTypeCode: String(line.CrTypeCode || "0"),
          NumOfPmnts: String(line.NumOfPmnts || "0"),
          VoucherNum: String(line.VoucherNum || "0"),
          CreditType: String(line.CreditType || "0"),
          FirstSum: String(line.FirstSum || "0"),
          AddPmntSum: String(line.AddPmntSum || "0"),
          Phone: String(line.Phone || "0"),
          CompanyId: String(line.CompanyId || "0"),
          CardName: String(line.CardName || "0"),
          CFWName: String(line.CFWName || "0"),
          ConfNum: String(line.ConfNum || "0"),
          LineID: String(line.LineID || "0"),
          CardValid: dayjs(undefined).format("YYYY-MM-DD"),
          FirstDue: dayjs(undefined).format("YYYY-MM-DD"),
          CreditSum: String(line.CreditSum || "0"),
          CreditCur: String(data.DocCurr || "0"),
          CreditRate: String(line.CreditRate || "0"),
          CredPmnts: String(line.CredPmnts || "0"),
          PlCrdStat: String(line.PlCrdStat || "0"),
          SpiltCred: String(line.SpiltCred || "0"),
          ConsolNum: String(line.ConsolNum || "0"),
          ObjType: "24",
        })),
        oInAccntPayLines: accRows.map((line) => ({
          LineNum: String(line.LineNum || ""),
          DocEntry: String(line.DocEntry || ""),
          UserId: user.UserId,
          CreatedBy: user.UserName,
          ModifiedBy: user.UserName,
          CreatedDate: dayjs().format("YYYY-MM-DD"),
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          Status: String(line.Status || "1"),
          DocNum: String(data.DocNum || "0"),
          AcctCode: String(line.AcctCode || "0"),
          SumApplied: String(line.SumApplied || "0"),
          AppliedFC: String(line.AppliedFC || "0"),
          AppliedSys: String(line.SumApplied / SystemRate || "0"),
          Descrip: String(line.Descrip || ""),
          VatGroup: String(line.VatGroup || "0"),
          VatPrcnt: String(line.VatPrcnt || "0"),
          AcctName: String(line.AcctName || "0"),
          ObjType: "24",
          Project: String(line.Project || "0"),
          GrossAmnt: String(line.SumApplied || "0"),
          GrssAmntFC: String(line.AppliedFC || "0"),
          GrssAmntSC: String(line.SumApplied / SystemRate || "0"),
          AmntBase: String(line.AmntBase || "0"),
          VatAmnt: String(line.VatAmnt || "0"),
          VatAmntFC: String(line.VatAmntFC || "0"),
          VatAmntSC: String(line.VatAmntSC || "0"),
          UserChaVat: String(line.UserChaVat || "0"),
          TaxTypeID: String(line.TaxTypeID || "0"),
          LocCode: String(line.LocCode || "0"),
        })),
      };
      setLoading(true);
      const bpCurrency = bpCurrencyRef.current || ""; // e.g., "USD" or "AC"
      if (bpCurrency !== "AC" && bpCurrency !== "All Currency") {
        const invalidCurrencyRows = obj.oPaybyInvLines.filter((line) => {
          // const matchingRecord = BaseDocData.find(
          //   (record) => record.DocEntry === Number(line.InvoiceId)
          // );
          const rowCurr = line.Currency?.trim();

          const isValid = rowCurr === watch("DocCurr");

          return !isValid;
        });

        if (invalidCurrencyRows.length > 0) {
          Swal.fire({
            icon: "warning",
            title: "Currency Mismatch",
            text: "Base Document Currency and Business Partner Currency must be the same, or should be All Currency.",
          });
          setLoading(false);
          return;
        }
      }
      // 🔹 SAVE or UPDATE
      if (SaveUpdateName === "SAVE") {
        const res = await apiClient.post(`/IncomingPayments`, obj);

        if (res.data.success) {
          clearFormData();
          fetchOpenListData(0);
          setClearCache(true);

          Swal.fire({
            title: "Success!",
            text: "Incoming Payment Saved Successfully.",
            icon: "success",
            confirmButtonText: "Ok",
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
      } else {
        // 🔹 Update case confirmation
        const result = await Swal.fire({
          text: `Do you want to update "${obj.CardCode}"?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        });

        if (result.isConfirmed) {
          if (data.AttcEntry > "0") {
            await apiClient.put(`/Attachment/${data.AttcEntry}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }

          const response = await apiClient.put(
            `/IncomingPayments/${data.DocEntry}`,
            obj,
          );

          if (response.data.success) {
            clearFormData();
            fetchOpenListData(0);
            setClearCache(true);
            Swal.fire({
              title: "Success!",
              text: "Incoming Payment Updated Successfully.",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.data.message,
              icon: "warning",
            });
          }
        } else {
          Swal.fire({
            text: "Incoming Payment Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong: " + (error.message || error),
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  const getInvTypeCode = (invType, docType) => {
    // Determine entity type from DocType
    const entityType =
      docType === "CUSTOMER"
        ? "C"
        : docType === "VENDOR"
          ? "V"
          : docType === "ACCOUNT"
            ? "A"
            : "";
    // Define mapping for different entity types
    const mappings = {
      C: {
        // CUSTOMER mappings
        In: "13",
        ARCN: "14",
        DP: "203",
      },
      V: {
        // VENDOR mappings
        AP: "18",
        APCN: "19",
        DP: "204",
      },
      A: {
        // ACCOUNT mappings (if needed)
        AP: "18",
        CN: "14",
        DP: "204",
      },
    };

    return mappings[entityType]?.[invType] || "0";
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
          Incoming Payment Documents
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
        // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
                {tabData.map(({ value, label }) => (
                  <Tab key={value} value={value} label={label} />
                ))}
              </Tabs>

              {tabData.map(
                ({
                  value,
                  data,
                  query,
                  hasMore,
                  fetchMore,
                  handleSearch,
                  handleClear,
                }) => (
                  <TabPanel
                    key={value}
                    value={value}
                    style={{
                      overflow: "auto",
                      maxHeight: `calc(100% - 15px)`,
                      paddingLeft: 5,
                      paddingRight: 5,
                    }}
                    id={`ListScroll${value}`}
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
                        onChange={(e) => handleSearch(e.target.value)}
                        value={query}
                        onClickClear={handleClear}
                      />
                    </Grid>
                    <InfiniteScroll
                      style={{ textAlign: "center", justifyContent: "center" }}
                      dataLength={data.length}
                      hasMore={hasMore}
                      next={fetchMore}
                      loader={
                        <BeatLoader
                          color={
                            theme.palette.mode === "light" ? "black" : "white"
                          }
                        />
                      }
                      scrollableTarget={`ListScroll${value}`}
                      endMessage={<Typography>No More Records</Typography>}
                    >
                      {data.map((item, i) => (
                        <CardComponent
                          key={i}
                          title={item.DocNum}
                          subtitle={item.CardName}
                          description={dayjs(item.TaxDate).format("DD/MM/YYYY")}
                          searchResult={query}
                          isSelected={selectedData === item.DocEntry}
                          onClick={() =>
                            setIncPaymentData(
                              item.DocEntry,
                              item.CardCode,
                              item.CntctCode,
                              item.DocType,
                            )
                          }
                        />
                      ))}
                    </InfiniteScroll>
                  </TabPanel>
                ),
              )}
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const HandlePrint = () => {
    window.print();
  };
  const handleSaveManualRate = async () => {
    // Validate manual rate
    if (!manualRate || isNaN(Number(manualRate))) {
      Swal.fire(
        "Validation Error",
        "Please enter a valid number for the rate.",
        "warning",
      );
      return;
    }

    setIsSavingManualRate(true);
    setLoading(true);

    try {
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

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Exchange rate saved successfully!",
          timer: 1000,
          showConfirmButton: false,
        });

        setExchangeRateModalOpen(false);

        // Determine currency to fetch updated rate
        const currencyToUse = isInitialSystemRate.current
          ? systemCurrency
          : selectedPMCurrency;

        const fetchedRate = await fetchExchangeRate(
          watchDocDate,
          currencyToUse,
        );
        if (!isInitialSystemRate.current) {
          setValue("DocRate", fetchedRate ?? "");
        }
      } else {
        Swal.fire(
          "Error",
          res.data?.message || "Failed to save exchange rate!",
          "error",
        );
      }
    } catch (error) {
      console.error("Error saving manual rate:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to save exchange rate!",
        "error",
      );
    } finally {
      setIsSavingManualRate(false);
      setLoading(false);
    }
  };

  return (
    <>
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
      <DataGridCellClickModel
        open={glDialogState.open}
        closeModel={() => {
          // Optional: Clear cache on close to free memory
          setGLDialogState((prev) => ({
            ...prev,
            pages: {},
            rows: [],
            open: false,
          }));
        }}
        rows={glDialogState.rows} // Now only current page's rows
        columns={Acclist}
        getRowId={(row) => row.id}
        title="Select GL Account"
        onCellClick={(params) => {
          const row = params.row;
          if (!row) return;
          const acctCurr = row.ActCurr;

          const isValidCurrency =
            acctCurr === "All Currency" ||
            acctCurr === "AC" ||
            acctCurr === selectedCurrency;

          if (!isValidCurrency) {
            Swal.fire({
              icon: "warning",
              title: "Invalid Account Currency",
              text: `Selected account currency (${acctCurr}) must be either All Currency (AC) or match Document Currency (${selectedCurrency}).`,
            });
            return;
          }
          switch (glDialogState.field) {
            case "CheckAcct":
              setValue("CheckAcct", row.AcctCode);
              setValue("SelectedBankAcctName", row.AcctName);
              break;
            case "TrsfrAcct":
              setValue("TrsfrAcct", row.AcctCode);
              setValue("SelectedAcctName", row.AcctName);
              break;
            case "CreditAcct":
              setValue("CreditAcct", row.AcctCode);
              // setValue("SelectedAcctName", row.AcctName);
              break;
            case "CashAcct":
              setValue("CashAcct", row.AcctCode);
              setValue("SelectedCashAcctName", row.AcctName);
              break;
            case "AccCol": {
              const updated = current.map((r) =>
                r.id === accEditingRowRef.current
                  ? {
                      ...r,
                      AcctCode: row.AcctCode,
                      AcctName: row.AcctName,
                      Currency: row.ActCurr,
                    }
                  : r,
              );

              setValue("accRows", updated, { shouldDirty: true });
              break;
            }

            default:
              console.warn(`Unhandled GL dialog field: ${glDialogState.field}`);
          }
          setGLDialogState((prev) => ({ ...prev, open: false }));
        }}
        limit={20}
        taxCurrentPage={glDialogState.currentPage}
        rowCount={glDialogState.effectiveRowCount} // Handles enabling/disabling
        onPaginationModelChange={handlePaginationChange} // Uses cache for prev
        onSearchChange={handleSearchChange} // Clears cache on search
        oLines={[]}
      />

      <SearchModel
        open={isOIBGLAccountDialogOpen}
        onClose={() => setIsOIBGLAccountDialogOpen(false)}
        onCancel={() => setIsOIBGLAccountDialogOpen(false)}
        title="SELECT CUSTOMER/SUPPLIER"
        onChange={(e) => handleGetListSearch(e.target.value)}
        value={getListquery}
        // readOnly={true}
        // disabled={!!DocEntry}
        onClickClear={handleGetListClear}
        cardData={
          <>
            <InfiniteScroll
              style={{
                textAlign: "center",
                justifyContent: "center",
              }}
              dataLength={bpdata.length}
              next={fetchMoreGetListData}
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
              {bpdata.map((item, index) => (
                <CardComponent
                  // key={index}
                  key={item.DocEntry}
                  title={item.CardCode}
                  subtitle={item.CardName}
                  description={item.Cellular}
                  searchResult={getListquery}
                  onClick={() => {
                    selectBPforOIB(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      {loading && <Loader open={loading} />}

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
            aria-expanded={open ? "true" : undefined}
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
              disabled={SaveUpdateName === "SAVE" || tab === "1"}
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
                disabled={SaveUpdateName === "SAVE"}
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
              Incoming Payments
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
              textTransform={"uppercase"}
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
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DocType"
                      control={control}
                      defaultValue="CUSTOMER"
                      render={({ field }) => (
                        <InputSelectFields
                          {...field}
                          id="DocType"
                          label="TYPE"
                          name="DocType"
                          disabled={SaveUpdateName === "UPDATE"}
                          // value=""
                          onChange={(e) => {
                            const newValue = e.target.value;
                            field.onChange(e);
                            fetchGetListData(0, "", newValue);
                            setGetListPage(0);
                            setValue("CardCode", "");
                            setValue("CardName", "");
                            setValue("CntctCode", "");
                            setValue("PayToCode", "");
                            setValue("Address", "");
                            clearCCForm();
                            setDocEntry("");
                            setBusinessCodeData([]);
                            setSelectedData([]);
                            setValue("AccRows", []);
                            setcheckTabRows([]);
                            setCreditCardRows([]);
                            setSelectedRows([]);
                            setBusinessPartnerData([]);
                          }}
                          data={[
                            { key: "C", value: "CUSTOMER" },
                            { key: "V", value: "VENDOR" },
                            { key: "A", value: "ACCOUNT" },
                          ]}
                        />
                      )}
                    />
                  </Grid>
                  {(selectedCode === "CUSTOMER" ||
                    selectedCode === "VENDOR") && (
                    <>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="CardCode"
                          rules={{ required: "Customer Code is required" }}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextSearchButton
                              label="BUSINESS CODE"
                              readOnly={true}
                              disabled={!!DocEntry}
                              onClick={(e) => {
                                handleInputChange();
                              }}
                              type="text"
                              {...field}
                              error={!!error} // Pass error state to the FormComponent if needed
                              helperText={error ? error.message : null} // Show the validation message
                            />
                          )}
                        />
                        <SearchModel
                          open={isDialogOpen}
                          onClose={handleCloseDialog}
                          onCancel={handleCloseDialog}
                          title="SELECT CUSTOMER/SUPPLIER"
                          onChange={(e) => handleGetListSearch(e.target.value)}
                          value={getListquery}
                          // readOnly={true}
                          // disabled={!!DocEntry}
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
                                    title={item.CardCode}
                                    subtitle={item.CardName}
                                    description={item.Cellular}
                                    searchResult={getListquery}
                                    onClick={() => {
                                      onSelectBusinessPartner(item.DocEntry);
                                    }}
                                  />
                                ))}
                              </InfiniteScroll>
                            </>
                          }
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
                          name="CardName"
                          rules={{ required: "Customer Name Is Required" }}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              label="NAME"
                              type="text"
                              {...field}
                              readOnly={true}
                              error={!!error} // Pass error state to the FormComponent if needed
                              helperText={error ? error.message : null} // Show the validation message
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
                        justifyContent={"center"}
                      >
                        <Controller
                          name="PayToCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSelectTextField
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              label="BILL TO CODE"
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                field.onChange(selectedValue); // Update form state
                                handleAddressBILLTO(selectedValue); // Handle additional logic
                              }}
                              data={
                                BusinessPartnerData?.oLines
                                  ? BusinessPartnerData.oLines
                                      .filter(
                                        (payto) => payto.AddressType === "P",
                                      )
                                      .map((item) => ({
                                        key: item.LineNum || "",
                                        value: item.Address || "",
                                      }))
                                  : []
                              }
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
                        {" "}
                        <Controller
                          name="Address"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              label="BILL TO ADDRESS"
                              type="text"
                              {...field}
                              onChange={(e) => {
                                const cleanedValue = removeEmojis(
                                  e.target.value,
                                );
                                field.onChange(cleanedValue);
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
                          name="CntctCode"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSelectTextField
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              label="CONTACT PERSON"
                              data={(BusinessPartnerData.oCPLines || []).map(
                                (item) => ({
                                  key: item.LineNum,
                                  value: item.CntctCode,
                                }),
                              )}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
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
                          disabled={SaveUpdateName === "UPDATE"}
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
                          readOnly={watchSeries !== "0"}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  {/* {selectedCode === "ACCOUNT" && (
                    <Grid
                      item
                      sm={6}
                      xs={12}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="DocCurrency"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <InputSelectFields
                            name="DocCurrency"
                            label="DOC CURRENCY"
                            // value=""
                            disabled={SaveUpdateName === "UPDATE"}
                            data={currencydata.map((item) => ({
                              key: item.CurrCode,
                              value: item.CurrName,
                            }))}
                          />
                        )}
                      />
                    </Grid>
                  )} */}
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DocDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="POSTING DATE"
                          disabled={SaveUpdateName === "UPDATE"}
                          name={field.name}
                          //  disabled={
                          //    allFormData.Status === "Closed" ||
                          //    allFormData.Status === "Cancelled"
                          //  }
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setValue("DocDate", date, { shouldDirty: true });
                            setValue("DocDueDate", "", { shouldDirty: true });
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DocDueDate"
                      control={control}
                      rules={{ required: "Due Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="DUE DATE"
                          name={field.name}
                          value={dueDate}
                          minDate={getValues("DocDate")}
                          onChange={(date) => {
                            setDueDate(date);
                            setValue("DocDueDate", date);
                          }}
                          disabled={!startDate || SaveUpdateName === "UPDATE"}
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
                          label="DOCUMENT DATE"
                          name={field.name}
                          disabled={SaveUpdateName === "UPDATE"}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValue("TaxDate", newValue, {
                              shouldDirty: true,
                            });
                          }}
                          // disabled={
                          //   allFormData.Status === "Closed" ||
                          //   allFormData.Status === "Cancelled"
                          // }
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CounterRef"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <InputTextField
                          label="REFERENCE"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 8 }}
                          name="CounterRef"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="TransId"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <InputTextField
                          label="TRANSACTION NO"
                          {...field}
                          name="TransId"
                          readOnly
                        />
                      )}
                    />
                  </Grid>
                  {/* {companyData.MainCurncy !== getValues("DocCurr") &&
                  getValues("DocCurr") !== "AC" ? ( */}
                  <Grid
                    item
                    sm={6}
                    xs={12}
                    md={4}
                    lg={4}
                    textAlign="center"
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
                      sx={{ width: 230 }}
                    >
                      <Controller
                        name="DocCurr"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="CURRENCY"
                            onChange={(e) => {
                              const selected = e.target.value;

                              // Update DocCurr normally
                              field.onChange(selected);

                              // Reset amounts for all accRows
                              const updatedRows = current.map((row) => ({
                                ...row,
                                SumApplied: 0,
                                AppliedFC: 0,
                              }));

                              setValue("accRows", updatedRows, {
                                shouldDirty: true,
                              });

                              // Auto-set PMDocCurr when ACCOUNT tab selected
                              if (selectedCode === "ACCOUNT") {
                                setValue("PMDocCurr", selected, {
                                  shouldValidate: true,
                                });
                              }
                            }}
                            data={
                              selectedCode === "ACCOUNT"
                                ? currencydata?.map((item) => ({
                                    key: item.CurrCode,
                                    value: item.CurrName,
                                  }))
                                : currencyOptions
                            }
                            disabled={
                              selectedCode !== "ACCOUNT" ||
                              SaveUpdateName === "UPDATE"
                            }
                          />
                        )}
                      />

                      {/* ✅ Show DocRate only if selected currency ≠ local currency */}
                      {watch("DocCurr") !== companyData?.MainCurncy && (
                        <Controller
                          name="DocRate"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              {...field}
                              error={!!error}
                              disabled={
                                !cardCodeValue || SaveUpdateName === "UPDATE"
                              } // Disable if no CardCode or in update mode
                              helperText={error ? error.message : null}
                              label="RATE"
                            />
                          )}
                        />
                      )}
                    </Grid>
                  </Grid>
                  {/* ) : null} */}

                  <Grid
                    item
                    sm={6}
                    xs={12}
                    md={4}
                    lg={4}
                    mt={1}
                    textAlign="center"
                  >
                    <Button
                      onClick={handleOpen}
                      variant="contained"
                      color="primary"
                      disabled={
                        !isAnyRowSelected &&
                        (selectedCode !== "ACCOUNT" || accRows.length < 1)
                      }
                    >
                      PAYMENT MEANS
                    </Button>
                  </Grid>
                  {/* modal+_+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                  <Box mt={8}>
                    <Modal
                      open={open}
                      onClose={handleClose}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Paper
                        elevation={3} // Optional: customize elevation
                        sx={{
                          width: {
                            xs: "100%",
                            sm: "95%",
                            md: "85%",
                            lg: "75%",
                          },
                          maxHeight: "90vh",
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          padding: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            overflowY: "auto",
                            flexGrow: 1,
                          }}
                        >
                          <TabContext value={modalTabvalue}>
                            {selectedCode === "CUSTOMER" && (
                              <Grid container mt={2} display={"flex"}>
                                {/* <Grid
                                  item
                                  md={6}
                                  lg={3}
                                  sm={6}
                                  xs={12}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="DocCurr"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                      <ModelInputSelectTextField
                                        {...field}
                                        label="Currency"
                                        name="DocCurr"
                                        readOnly={
                                          getValues("DocCurr") ===
                                          companyData.MainCurncy
                                        }
                                        disabled={SaveUpdateName === "UPDATE"}
                                        data={
                                          getValues("DocCurr") === "AC"
                                            ? currencydata.map((item) => ({
                                                key: item.CurrCode,
                                                value: item.CurrName,
                                              }))
                                            : currencydata
                                                .filter((cur) =>
                                                  [
                                                    getValues("DocCurr"),
                                                    companyData.MainCurncy,
                                                  ].includes(cur.CurrCode)
                                                )
                                                .map((item) => ({
                                                  key: item.CurrCode,
                                                  value: item.CurrName,
                                                }))
                                        }
                                        onChange={(e) => {
                                          field.onChange(e); // update DocCurr in form state
                                          if (e.target.value === "AC") {
                                            setValue("DiffCurr", "N"); // same currency
                                          } else {
                                            setValue("DiffCurr", "Y"); // different currency
                                          }
                                          //  handleDiffCurrChange(e.target.value); // Track change to DiffCurr
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                                {diffCurr === "N" &&
                                companyData.MainCurncy !== selectedDocCurr ? (
                                  <Grid
                                    item
                                    md={6}
                                    lg={3}
                                    sm={6}
                                    xs={12}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="DocRate"
                                      control={control}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          error={!!error}
                                          disabled={
                                            currentData.CardCode === "" ||
                                            SaveUpdateName === "UPDATE"
                                          }
                                          readOnly
                                          helperText={
                                            error ? error.message : null
                                          }
                                          label="RATE"
                                        />
                                      )}
                                    />
                                  </Grid>
                                ) : null} */}
                                <Grid
                                  display="flex"
                                  flexDirection="row"
                                  alignItems="center"
                                  justifyContent="center"
                                  width="100%"
                                  ml={-1}
                                  sx={{ width: 230 }}
                                >
                                  <Controller
                                    name="PMDocCurr"
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputSelectTextField
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        onChange={async (e) => {
                                          field.onChange(e); // update RHF state
                                          const newCurrency = e.target.value;
                                          if (
                                            newCurrency !==
                                            companyData?.MainCurncy
                                          ) {
                                            await handleCurrencyChange(
                                              newCurrency,
                                              watch("DocDate"),
                                            );
                                          }
                                        }}
                                        label="CURRENCY"
                                        data={currencyOptions}
                                        disabled={
                                          !cardCodeValue ||
                                          SaveUpdateName === "UPDATE"
                                        } // Disable if CardCode is empty
                                      />
                                    )}
                                  />

                                  {/* ✅ Show DocRate only if selected currency ≠ local currency */}
                                  {watch("PMDocCurr") !==
                                    companyData?.MainCurncy && (
                                    <Controller
                                      name="DocRate"
                                      control={control}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          error={!!error}
                                          disabled={
                                            !cardCodeValue ||
                                            SaveUpdateName === "UPDATE"
                                          } // Disable if no CardCode or in update mode
                                          helperText={
                                            error ? error.message : null
                                          }
                                          label="RATE"
                                        />
                                      )}
                                    />
                                  )}
                                </Grid>
                              </Grid>
                            )}

                            {(selectedCode === "VENDOR" ||
                              selectedCode === "ACCOUNT") && (
                              <Grid container mt={2} display={"flex"}>
                                <Grid
                                  display="flex"
                                  flexDirection="row"
                                  alignItems="center"
                                  justifyContent="center"
                                  width="100%"
                                  ml={-1}
                                  sx={{ width: 230 }}
                                >
                                  <Controller
                                    name="PMDocCurr"
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputSelectTextField
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        label="CURRENCY"
                                        onChange={async (e) => {
                                          field.onChange(e); // update RHF state
                                          const newCurrency = e.target.value;
                                          if (
                                            newCurrency !==
                                            companyData?.MainCurncy
                                          ) {
                                            await handleCurrencyChange(
                                              newCurrency,
                                              watch("DocDate"),
                                            );
                                          }
                                        }}
                                        data={getPMDocCurrOptions()}
                                        disabled={
                                          (!cardCodeValue &&
                                            selectedCode !== "ACCOUNT") ||
                                          SaveUpdateName === "UPDATE"
                                        } // Disable if CardCode is empty
                                      />
                                    )}
                                  />

                                  {/* ✅ Show DocRate only if selected currency ≠ local currency */}
                                  {watch("PMDocCurr") !==
                                    companyData?.MainCurncy && (
                                    <Controller
                                      name="DocRate"
                                      control={control}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          error={!!error}
                                          disabled={
                                            !cardCodeValue ||
                                            SaveUpdateName === "UPDATE"
                                          } // Disable if no CardCode or in update mode
                                          helperText={
                                            error ? error.message : null
                                          }
                                          label="RATE"
                                        />
                                      )}
                                    />
                                  )}
                                </Grid>
                              </Grid>
                            )}

                            <Tabs
                              value={modalTabvalue}
                              onChange={handleModalTabChange}
                              indicatorColor="primary"
                              textColor="inherit"
                              variant="scrollable"
                              scrollButtons="auto"
                            >
                              <Tab value="0" label="check " />
                              <Tab value="1" label="BANK TRANSFER " />
                              <Tab value="2" label="CREDIT CARD " />
                              <Tab value="3" label="CASH " />
                            </Tabs>

                            {/* Tab Panels 0 */}
                            <TabPanel value="0" sx={{ mt: 0, p: 0 }}>
                              <Grid
                                item
                                md={6}
                                sm={12}
                                xs={12}
                                mt={2}
                                textAlign={"center"}
                                display={"flex"}
                                sx={{ mb: 2 }}
                              >
                                <Controller
                                  name="CheckAcct"
                                  control={control}
                                  render={({ field }) => (
                                    <InputTextField
                                      {...field}
                                      label="G/L ACCOUNT"
                                      disabled
                                      InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <ViewListIcon
                                              onClick={() =>
                                                openGLDialog("CheckAcct")
                                              }
                                              style={{
                                                cursor: "pointer",
                                                backgroundColor: "green",
                                                color: "#fff",
                                                borderRadius: "10%",
                                                padding: 2,
                                              }}
                                            />
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  )}
                                />

                                <Typography
                                  variant="body1"
                                  mt={1}
                                  sx={{ alignItems: "center" }}
                                >
                                  {SelectedBankAcctName || ""}
                                </Typography>
                              </Grid>

                              <Box
                                sx={{
                                  border: "1px solid silver",
                                  p: 1,
                                  width: "100%",
                                  marginTop: 2,
                                  maxWidth: "100%",
                                  boxSizing: "border-box",
                                  overflow: "hidden", // Ensures internal components don't overflow
                                }}
                              >
                                {/* Add Icon */}
                                <Box sx={{ pb: 1 }}>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      backgroundColor: "green",
                                      borderRadius: "20%",
                                      color: "white",
                                    }}
                                    disabled={SaveUpdateName === "UPDATE"}
                                    onClick={addRow}
                                  >
                                    <AddOutlinedIcon />
                                  </IconButton>
                                </Box>

                                {/* Wrapper for Grid and Total */}
                                <Grid
                                  container
                                  item
                                  sx={{
                                    overflow: "auto",
                                    width: "100%",
                                    height: 350,
                                    mt: "5px",
                                  }}
                                >
                                  <DataGrid
                                    className="datagrid-style"
                                    hideFooter
                                    rowHeight={50}
                                    columns={modalcolumnsTab0}
                                    rows={checkTabRows}
                                    getRowId={(row) => row.id || row.LineNum}
                                    autoHeight={false}
                                    apiRef={modalApiRef} // Add this
                                    editMode="cell"
                                    experimentalFeatures={{
                                      newEditingApi: true,
                                    }}
                                    isCellEditable={(params) => {
                                      if (SaveUpdateName === "UPDATE")
                                        return false;

                                      return true;
                                    }}
                                    onCellEditStart={modalHandleCellEditStart}
                                    processRowUpdate={modalProcessRowUpdate}
                                    onCellKeyDown={modalhandleCellKeyDown} // Reuse the main one or create a modal-specific if needed
                                    onProcessRowUpdateError={(err) =>
                                      console.error(err)
                                    }
                                    initialState={{
                                      pagination: {
                                        paginationModel: { pageSize: 100 },
                                      },
                                    }}
                                    getRowClassName={(params) =>
                                      SaveUpdateName === "UPDATE"
                                        ? "disabled-row"
                                        : ""
                                    }
                                    pageSizeOptions={[10]}
                                    sx={gridSx}
                                  />
                                </Grid>

                                {/* Total Field */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    mt: 1,
                                    width: "100%",
                                  }}
                                >
                                  {isPMLocalCurrency ? (
                                    <Grid item xs={12} sm={6} md={4} lg={3}>
                                      <Controller
                                        name="CheckSum"
                                        control={control}
                                        render={({ field }) => (
                                          <InputTextField
                                            {...field}
                                            // inputRef={checkRefs}
                                            label="TOTAL"
                                            readOnly
                                          />
                                        )}
                                      />
                                    </Grid>
                                  ) : (
                                    <Grid item xs={12} sm={6} md={4} lg={3}>
                                      <Controller
                                        name="CheckSumFC"
                                        control={control}
                                        render={({ field }) => (
                                          <InputTextField
                                            {...field}
                                            // inputRef={checkRefsFC}
                                            label="TOTAL (FC)"
                                            readOnly
                                          />
                                        )}
                                      />
                                    </Grid>
                                  )}
                                </Box>
                              </Box>
                            </TabPanel>
                            {/* Tab Panels 1 */}
                            <TabPanel value="1">
                              <Grid
                                container
                                border="1px solid silver"
                                p={2}
                                align="center"
                              >
                                <Grid
                                  container
                                  item
                                  textTransform="uppercase"
                                  spacing={2}
                                >
                                  {/* G/L Account with Dialog */}
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={4}
                                    textAlign="center"
                                    display="flex"
                                    alignItems="center"
                                  >
                                    <Controller
                                      name="TrsfrAcct"
                                      control={control}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="G/L ACCOUNT"
                                          value={field.value}
                                          error={!!error}
                                          inputProps={{ maxLength: 15 }}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          disabled
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
                                                  onClick={() =>
                                                    openGLDialog("TrsfrAcct")
                                                  }
                                                />
                                              </InputAdornment>
                                            ),
                                          }}
                                        />
                                      )}
                                    />
                                    <Typography variant="body1" mt={2}>
                                      {SelectedAcctName || ""}
                                    </Typography>
                                  </Grid>

                                  {/* Transfer Date */}
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={4}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="TrsfrDate"
                                      control={control}
                                      rules={{ required: "Date is Required" }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <SelectedDatePickerField
                                          label="TRANSFER DATE"
                                          name={field.name}
                                          value={
                                            field.value
                                              ? dayjs(field.value)
                                              : undefined
                                          }
                                          onChange={(newValue) => {
                                            setValue("TrsfrDate", newValue, {
                                              shouldDirty: true,
                                            });
                                          }}
                                          disabled={SaveUpdateName === "UPDATE"}
                                          // disabled={
                                          //   allFormData.Status === "Closed" ||
                                          //   allFormData.Status === "Cancelled"
                                          // }
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                        />
                                      )}
                                    />
                                  </Grid>

                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={4}
                                    textAlign="center"
                                    // display="flex"
                                    // alignItems="center"
                                  >
                                    <Controller
                                      name="TrsfrRef"
                                      control={control}
                                      render={({ field }) => (
                                        <InputTextField
                                          {...field}
                                          onChange={(e) => {
                                            const cleanedValue = removeEmojis(
                                              e.target.value,
                                            );
                                            field.onChange(cleanedValue);
                                          }}
                                          inputProps={{ maxLength: 27 }}
                                          label="Reference"
                                          name="TrsfrRef"
                                        />
                                      )}
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    sm={12}
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    textAlign="center"
                                  ></Grid>
                                  <Grid
                                    item
                                    sm={12}
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    textAlign="center"
                                  ></Grid>
                                  <Grid
                                    item
                                    sm={12}
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    textAlign="center"
                                  ></Grid>
                                  <Grid
                                    item
                                    sm={12}
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    textAlign="center"
                                  ></Grid>
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  />

                                  {/* Total at bottom right */}
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="right"
                                    display="flex"
                                    justifyContent="flex-end"
                                  >
                                    <Controller
                                      name={
                                        isPMLocalCurrency
                                          ? "TrsfrSum"
                                          : "TrsfrSumFC"
                                      } // show only one
                                      control={control}
                                      render={({ field }) => (
                                        <InputTextField
                                          {...field}
                                          label="Total"
                                          type="number"
                                          disabled={SaveUpdateName === "UPDATE"}
                                          inputRef={bankRef}
                                          onBlur={(e) =>
                                            handleTrsfrSumChange(e.target.value)
                                          } // ✅ call here
                                        />
                                      )}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                            </TabPanel>

                            {/* Tab Panels 2*/}
                            <TabPanel value="2">
                              <Grid
                                container
                                border="1px solid silver"
                                p={2}
                                align={"center"}
                              >
                                <Grid
                                  container
                                  item
                                  lg={6}
                                  textTransform={"uppercase"}
                                  spacing={2}
                                >
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign={"center"}
                                  >
                                    <Controller
                                      name="CreditCard"
                                      control={ccControl}
                                      rules={{
                                        required: "This field is required",
                                      }}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputSelectFields
                                          {...field}
                                          id="CreditCard"
                                          label="CREDIT CARD"
                                          data={creditCarddata.map((item) => ({
                                            key: item.DocEntry,
                                            value: item.CardName,
                                          }))}
                                          onChange={(e) =>
                                            handleCreditCardChange(e, field)
                                          }
                                          error={!!error}
                                          helperText={error?.message}
                                        />
                                      )}
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign={"center"}
                                  >
                                    <Controller
                                      name="CreditAcct"
                                      control={ccControl}
                                      rules={{
                                        required: "This field is required",
                                      }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="G/L ACCOUNT"
                                          value={field.value}
                                          error={!!error}
                                          inputProps={{ maxLength: 15 }}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          disabled
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
                                                  onClick={() =>
                                                    openGLDialog("CreditAcct")
                                                  }
                                                />
                                              </InputAdornment>
                                            ),
                                          }}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value);
                                            // setGLAccountValue(value);
                                          }}
                                          date
                                          form
                                          data
                                        />
                                      )}
                                    />
                                  </Grid>

                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="CrCardNum"
                                      control={ccControl}
                                      defaultValue=""
                                      rules={{
                                        required: "This field is required",
                                      }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          type="number"
                                          inputProps={{
                                            maxLength: 4, // Note: this will be ignored for number input
                                            onInput: (e) => {
                                              // Restrict input to 6 digits
                                              if (e.target.value.length > 4) {
                                                e.target.value =
                                                  e.target.value.slice(0, 4);
                                              }
                                            },
                                          }}
                                          disabled={isDisabled}
                                          {...field}
                                          label="credit card no."
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>

                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="CardValid"
                                      control={ccControl}
                                      defaultValue=""
                                      rules={{
                                        pattern: {
                                          value: /^(0[1-9]|1[0-2])-(\d{2})$/,
                                          message: "Format must be MM-YY",
                                        },
                                        required: "Valid Until is required",
                                      }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          name="CardValid"
                                          label="Valid Until (MM-YY)"
                                          inputProps={{ maxLength: 5 }}
                                          value={field.value}
                                          disabled={isDisabled}
                                          onChange={(e) => {
                                            let val = e.target.value.replace(
                                              /\D/g,
                                              "",
                                            ); // Remove non-digits
                                            if (val.length >= 3) {
                                              val = `${val.slice(
                                                0,
                                                2,
                                              )}-${val.slice(2, 4)}`;
                                            }
                                            field.onChange(val);
                                          }}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="OwnerIdNum"
                                      control={ccControl}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="Id No."
                                          onChange={(e) => {
                                            const cleanedValue = removeEmojis(
                                              e.target.value,
                                            );
                                            field.onChange(cleanedValue);
                                          }}
                                          name="OwnerIdNum"
                                          disabled={isDisabled}
                                          inputProps={{ maxLength: 15 }}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="OwnerPhone"
                                      control={ccControl}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          type="number"
                                          inputProps={{
                                            maxLength: 20,
                                            onInput: (e) => {
                                              if (e.target.value.length > 20) {
                                                e.target.value =
                                                  e.target.value.slice(0, 20);
                                              }
                                            },
                                          }}
                                          label="TELEPHONE NO."
                                          disabled={isDisabled}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>

                                  {/* <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="CrTypeCode"
                                      control={ccControl}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputSelectTextField
                                          {...field}
                                          name="CrTypeCode"
                                          label="payment method"
                                          data={[{ key: "1", value: "visa" }]}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid> */}

                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name={
                                        isPMLocalCurrency
                                          ? "CreditSum"
                                          : "CredSumFC"
                                      }
                                      control={ccControl}
                                      rules={{
                                        validate: (value) =>
                                          parseFloat(value) > 0 ||
                                          "Amount must be greater than 0",
                                      }}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="amount due"
                                          type="number"
                                          inputRef={creditRef}
                                          disabled={isDisabled}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>

                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="NumOfPmnts"
                                      control={ccControl}
                                      defaultValue="1"
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="no.of payments"
                                          disabled={isDisabled}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>

                                  {/* <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="FirstSum"
                                      control={ccControl}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="first partial payment"
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>

                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="AddPmntSum"
                                      control={ccControl}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="Each Add. Payment"
                                          error={!!error}
                                          readOnly
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid> */}
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="VoucherNum"
                                      control={ccControl}
                                      rules={{
                                        required: "Voucher No is required",
                                      }}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="voucher no."
                                          disabled={isDisabled}
                                          onChange={(e) => {
                                            const cleanedValue = removeEmojis(
                                              e.target.value,
                                            );
                                            field.onChange(cleanedValue);
                                          }}
                                          inputProps={{ maxLength: 20 }}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>

                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="CreditType"
                                      control={ccControl}
                                      defaultValue="1"
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputSelectTextField
                                          {...field}
                                          name="CreditType"
                                          label="transation type"
                                          data={[
                                            { key: "1", value: "REGULAR" },
                                            { key: "2", value: "INTERNET" },
                                            { key: "3", value: "VISA" },
                                          ]}
                                          error={!!error}
                                          disabled={isDisabled}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>

                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={4}
                                    lg={6}
                                    textAlign="center"
                                  >
                                    <Controller
                                      name="ConfNum"
                                      control={ccControl}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="Approval No"
                                          disabled={isDisabled}
                                          onChange={(e) => {
                                            const cleanedValue = removeEmojis(
                                              e.target.value,
                                            );
                                            field.onChange(cleanedValue);
                                          }}
                                          inputProps={{ maxLength: 20 }}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>
                                  <Grid item xs={6} textAlign="center">
                                    <Button
                                      variant="contained"
                                      color="success"
                                      disabled={SaveUpdateName === "UPDATE"}
                                      onClick={handleCCSubmit(onSave)}
                                    >
                                      {isEditMode ? "Update" : "Save"}
                                    </Button>
                                  </Grid>
                                </Grid>
                                <Grid
                                  container
                                  item
                                  xs={12}
                                  md={6}
                                  p={2}
                                  direction="column"
                                >
                                  {/* DataGrid Box */}
                                  <Box
                                    sx={{
                                      // position: "sticky",
                                      top: 0,
                                      zIndex: 1,
                                      pb: 1,
                                      display: "flex", // 👈 Add flex display
                                      justifyContent: "flex-start", // 👈 Align to left
                                      alignItems: "center", // 👈 (Optional) Vertically center the button
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        resetCCForm();
                                        clearCCForm();
                                        setSelectedRowId(null);
                                        setIsEditMode(false);
                                      }}
                                      style={{
                                        backgroundColor: "green",
                                        borderRadius: "20%",
                                        color: "white",
                                      }}
                                    >
                                      <AddOutlinedIcon />
                                    </IconButton>
                                  </Box>

                                  <Box
                                    sx={{
                                      height: 425,
                                      width: "100%",
                                      overflow: "auto",
                                      // border: "1px solid gray",
                                      p: 1,
                                    }}
                                  >
                                    <DataGrid
                                      rows={CreditCardRows}
                                      getRowClassName={(params) =>
                                        params.id === selectedRowId
                                          ? "Mui-selected"
                                          : ""
                                      }
                                      getRowId={(row) => row.id || row.LineNum}
                                      onRowClick={(params) => {
                                        // Toggle selection
                                        if (selectedRowId === params.id) {
                                          setSelectedRowId(null);
                                          clearCCForm();
                                          setIsEditMode(false);
                                        } else {
                                          setSelectedRowId(params.id);
                                          onRowClick({ id: params.id });
                                        }
                                      }}
                                      columns={[
                                        {
                                          field: "select",
                                          headerName: "",
                                          width: 30,
                                          sortable: false,
                                          filterable: false,
                                          disableColumnMenu: true,
                                          renderCell: (params) => (
                                            <Checkbox
                                              checked={
                                                params.id === selectedRowId
                                              }
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                if (
                                                  params.id === selectedRowId
                                                ) {
                                                  setSelectedRowId(null);
                                                  clearCCForm();
                                                  setIsEditMode(false);
                                                } else {
                                                  setSelectedRowId(params.id);
                                                  onRowClick({ id: params.id });
                                                }
                                              }}
                                            />
                                          ),
                                        },
                                        {
                                          field: "id",
                                          headerName: "ID",
                                          width: 30,
                                        },
                                        {
                                          field: "CreditCard",
                                          headerName: "CREDIT CARD NAME",
                                          width: 200,
                                        },
                                        {
                                          field: "TOTAL",
                                          headerName: "TOTAL",
                                          width: 100,
                                        },
                                        {
                                          field: "actions",
                                          headerName: "ACTION",
                                          width: 100,
                                          sortable: false,
                                          filterable: false,
                                          disableColumnMenu: true,
                                          renderCell: (params) => (
                                            <IconButton
                                              onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering row selection
                                                handleDeleteCCRow(params.id);
                                              }}
                                              color="error"
                                            >
                                              <DeleteIcon />
                                            </IconButton>
                                          ),
                                        },
                                      ]}
                                      initialState={{
                                        pagination: {
                                          paginationModel: { pageSize: 100 },
                                        },
                                      }}
                                      pageSizeOptions={[100]}
                                      className="datagrid-style"
                                      sx={gridSx}
                                    />
                                  </Box>

                                  {/* Total Field below and right-aligned */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between", // Tel. on left, Total on right
                                      alignItems: "center",
                                      mt: 2,
                                    }}
                                  >
                                    {/* Tel. for approval on left */}
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontWeight: "bold",
                                        color: "gray",
                                      }}
                                    >
                                      Tel. for approval:&nbsp;
                                      {creditCarddata.find(
                                        (item) =>
                                          item.CardName ===
                                          watchCC("CreditCard"),
                                      )?.Phone || "-"}
                                    </Typography>

                                    {/* Total Field on right */}
                                    <Controller
                                      name={
                                        isPMLocalCurrency
                                          ? "CreditSum"
                                          : "CredSumFC"
                                      }
                                      control={control}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          {...field}
                                          label="Total"
                                          type="number"
                                          disabled={isDisabled}
                                          // value={total.toFixed(6)}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Box>
                                </Grid>
                              </Grid>
                            </TabPanel>
                            {/* Tab Panels 3 */}
                            <TabPanel value="3">
                              <Box
                                sx={{
                                  height: 200,
                                  overflow: "auto",
                                  p: 1,
                                  border: "1px solid silver",
                                  position: "relative", // enables absolute positioning for the TOTAL field
                                }}
                              >
                                <Grid
                                  container
                                  textTransform="uppercase"
                                  p={1}
                                  spacing={1}
                                >
                                  {/* G/L ACCOUNT with dialog */}
                                  <Grid
                                    item
                                    sm={6}
                                    xs={12}
                                    md={6}
                                    lg={6}
                                    display={"flex"}
                                    alignItems={"center"}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        width: "100%",
                                      }}
                                    >
                                      <Controller
                                        name="CashAcct"
                                        control={control}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputTextField
                                            {...field}
                                            label="G/L ACCOUNT"
                                            value={field.value}
                                            error={!!error}
                                            inputProps={{ maxLength: 15 }}
                                            helperText={
                                              error ? error.message : null
                                            }
                                            disabled
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
                                                    onClick={() =>
                                                      openGLDialog("CashAcct")
                                                    }
                                                  />
                                                </InputAdornment>
                                              ),
                                            }}
                                            onChange={(e) =>
                                              field.onChange(e.target.value)
                                            }
                                            sx={{ flexGrow: 1, mr: 1 }} // Allow text field to grow and add margin right
                                          />
                                        )}
                                      />
                                      <Typography
                                        variant="body1"
                                        sx={{ whiteSpace: "nowrap" }} // Prevent wrapping if needed
                                      >
                                        {SelectedCashAcctName || ""}
                                      </Typography>
                                    </Box>
                                  </Grid>

                                  {/* PRIMARY FORM ITEM */}
                                  <Grid item sm={6} xs={12} md={6} lg={6}>
                                    <Controller
                                      name="CFWName "
                                      control={control}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputSelectTextField
                                          {...field}
                                          id="CFWName "
                                          label="PRIMARY FORM ITEM"
                                          data={[
                                            {
                                              key: "2",
                                              value:
                                                "Payment for invoice from Customer",
                                            },
                                          ]}
                                          error={!!error}
                                          helperText={error?.message || ""}
                                        />
                                      )}
                                    />
                                  </Grid>
                                </Grid>

                                {/* TOTAL FIELD AT RIGHT BOTTOM */}
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    right: 8,
                                    width: {
                                      xs: "100%",
                                      sm: "50%",
                                      md: "30%",
                                      lg: "25%",
                                    },
                                  }}
                                >
                                  <Controller
                                    name={
                                      isPMLocalCurrency
                                        ? "CashSum"
                                        : "CashSumFC"
                                    } // show only one
                                    control={control}
                                    render={({ field }) => (
                                      <InputTextField
                                        {...field}
                                        label="Total"
                                        type="number"
                                        inputRef={cashRef}
                                        disabled={SaveUpdateName === "UPDATE"}
                                        onBlur={(e) =>
                                          handleCashSumChange(e.target.value)
                                        } // ✅ call here
                                      />
                                    )}
                                  />
                                </Box>
                              </Box>
                            </TabPanel>
                          </TabContext>

                          <Grid container p={1} marginTop={2}>
                            <Grid
                              container
                              item
                              textTransform="uppercase"
                              spacing={2}
                            >
                              {/* Overall Amount - Disabled */}
                              <Grid
                                item
                                sm={6}
                                xs={12}
                                md={4}
                                lg={3}
                                textAlign="center"
                              >
                                <Controller
                                  name="OverallAmount"
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <InputTextField
                                      {...field}
                                      label="OVERALL AMOUNT"
                                      readOnly
                                      InputProps={{ readOnly: true }}
                                    />
                                  )}
                                />
                              </Grid>
                              {!isPMLocalCurrency && (
                                <Grid
                                  item
                                  sm={6}
                                  xs={12}
                                  md={4}
                                  lg={3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="OverallAmountFC"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                      <InputTextField
                                        {...field}
                                        label="OVERALL AMOUNT (FC)"
                                        readOnly
                                        InputProps={{ readOnly: true }}
                                      />
                                    )}
                                  />
                                </Grid>
                              )}
                              {/* Balance Due */}
                              <Grid
                                item
                                sm={6}
                                xs={12}
                                md={4}
                                lg={3}
                                textAlign="center"
                              >
                                <Controller
                                  name="BalanceDue"
                                  control={control}
                                  defaultValue=""
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      {...field}
                                      label="BALANCE DUE"
                                      readOnly
                                      error={!!error}
                                      disabled={SaveUpdateName === "UPDATE"}
                                      helperText={error ? error.message : ""}
                                    />
                                  )}
                                />
                              </Grid>
                              {!isPMLocalCurrency && (
                                <Grid
                                  item
                                  sm={6}
                                  xs={12}
                                  md={4}
                                  lg={3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="BalanceDueFC"
                                    control={control}
                                    defaultValue=""
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        {...field}
                                        label="BALANCE DUE (FC)"
                                        readOnly
                                        error={!!error}
                                        helperText={error ? error.message : ""}
                                      />
                                    )}
                                  />
                                </Grid>
                              )}
                              {/* Bank Charge */}
                              {/* {(selectedCode === "CUSTOMER" ||
                                selectedCode === "VENDOR") && (
                                <Grid
                                  item
                                  sm={6}
                                  xs={12}
                                  md={4}
                                  lg={3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="BkChgAmt"
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        {...field}
                                        label="BANK CHARGE"
                                        type="number"
                                        disabled={SaveUpdateName === "UPDATE"}
                                        error={!!error}
                                        helperText={error ? error.message : ""}
                                      />
                                    )}
                                  />
                                </Grid>
                              )} */}
                              {/* Paid */}
                              <Grid
                                item
                                sm={6}
                                xs={12}
                                md={4}
                                lg={3}
                                textAlign="center"
                              >
                                <Controller
                                  name="DocTotal"
                                  control={control}
                                  defaultValue=""
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      {...field}
                                      label="PAID"
                                      readOnly
                                      error={!!error}
                                      helperText={error ? error.message : ""}
                                    />
                                  )}
                                />
                              </Grid>
                              {!isPMLocalCurrency && (
                                <Grid
                                  item
                                  sm={6}
                                  xs={12}
                                  md={4}
                                  lg={3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="DocTotalFC"
                                    control={control}
                                    defaultValue=""
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        {...field}
                                        label="PAID (FC)"
                                        readOnly
                                        error={!!error}
                                        helperText={error ? error.message : ""}
                                      />
                                    )}
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </Grid>

                          {/* Buttons */}
                          <Grid
                            item
                            px={1}
                            xs={12}
                            mt={2}
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
                                onClick={handlePaymentMeansSave}
                                disabled={SaveUpdateName === "UPDATE"}
                              >
                                SAVE
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                onClick={handleClose}
                                variant="contained"
                                color="error"
                              >
                                CLOSE
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    </Modal>
                  </Box>
                </Grid>

                <Grid container width={"100%"}>
                  <Grid
                    container
                    item
                    width="100%"
                    m={1}
                    border="1px solid silver"
                    spacing={2}
                  >
                    <Tabs
                      sx={{ width: "100%" }}
                      value={tabvalue}
                      onChange={handleTabChange}
                      aria-label="tab options"
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
                      />{" "}
                      <Tab
                        value={2}
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

                    {/* Tab 1 - Contents */}
                    {tabvalue === 0 && (
                      <Grid
                        container
                        item
                        style={{ width: "100%", overflow: "hidden" }}
                        direction="column"
                      >
                        {selectedCode === "ACCOUNT" && (
                          <Box
                            sx={{
                              position: "sticky",
                              top: 0,
                              zIndex: 1,
                              pb: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              style={{
                                backgroundColor: "green",
                                borderRadius: "20%",
                                color: "white",
                              }}
                              onClick={addAccRow} // this will add a row to the rows state
                            >
                              <AddOutlinedIcon />
                            </IconButton>
                          </Box>
                        )}
                        <Box
                          sx={{
                            height: "50vh",
                            width: "100%",
                            overflowY: "auto",
                            overflow: "auto",
                          }}
                        >
                          <DataGrid
                            key={currentPage} // Add this key to force re-mount on page change, preventing duplication issues
                            className="datagrid-style"
                            sx={gridSx}
                            apiRef={apiRef}
                            editMode="cell"
                            experimentalFeatures={{ newEditingApi: true }}
                            columnHeaderHeight={35}
                            rowHeight={40}
                            onCellEditStart={handleCellEditStart}
                            processRowUpdate={processRowUpdate}
                            onCellKeyDown={handleCellKeyDown}
                            onProcessRowUpdateError={(err) =>
                              console.error(err)
                            }
                            rows={
                              selectedCode === "ACCOUNT"
                                ? accRows
                                : businessCodeData
                            }
                            columns={dynamicColumns}
                            getRowClassName={(params) =>
                              SaveUpdateName === "UPDATE" ? "disabled-row" : ""
                            }
                            pagination
                            paginationMode="server"
                            rowCount={rowCount}
                            pageSizeOptions={[LIMIT]}
                            paginationModel={{
                              page: currentPage,
                              pageSize: LIMIT,
                            }}
                            onPaginationModelChange={
                              handlePaginationModelChange
                            }
                            loading={isLoading}
                            disableRowSelectionOnClick
                            disableColumnSelector
                            disableDensitySelector
                            getRowId={(row) => row.id}
                            initialState={{
                              pagination: {
                                paginationModel: { pageSize: LIMIT },
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    )}

                    {/* Tab 2 - Logistics */}
                    {tabvalue === 1 && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <InputTextField label="SHIP TO" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <InputTextField label="BILL TO" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <InputSelectFields
                            label="SHIPPING TYPE"
                            value=""
                            data={[
                              { key: "1", value: "BY ROAD" },
                              { key: "2", value: "BY SHIP" },
                              { key: "3", value: "BY AIR" },
                              { key: "4", value: "DEFINE NEW" },
                            ]}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {/* Tab 3 - Attachments */}
                    {tabvalue === 2 && (
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
                    )}
                  </Grid>

                  <Grid container spacing={2}>
                    {/* {(selectedCode === "CUSTOMER" ||
                      selectedCode === "VENDOR") && (
                      <Grid
                        item
                        md={6}
                        lg={4}
                        sm={6}
                        xs={12}
                        textAlign="center"
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Controller
                            name="Status"
                            control={control}
                            defaultValue="0"
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
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
                                // label="PAYMENT ON ACCOUNT"
                                sx={{ color: "black" }}
                              />
                            )}
                          />

                          <Controller
                            name="NoDocSum"
                            control={control}
                            defaultValue=""
                            render={({ field }) => {
                              const isChecked = watch("Status") === "1";

                              return (
                                <InputTextField
                                  name="NoDocSum"
                                  label="PAYMENT ON ACCOUNT"
                                  disabled={!isChecked}
                                  {...field}
                                  inputProps={{
                                    style: { textAlign: "center" },
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value); // update NoDocSum
                                    setValue("OpenBal", value); // sync OpenBal
                                  }}
                                />
                              );
                            }}
                          />
                        </Stack>
                      </Grid>
                    )} */}
                    {selectedCode === "VENDOR" && (
                      <Grid
                        item
                        md={6}
                        lg={4}
                        sm={6}
                        xs={12}
                        textAlign="center"
                      >
                        <Controller
                          name="TotalAmountDue"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Tooltip title="TOTAL AMOUNT DUE" arrow>
                              <InputTextField
                                label="TOTAL AMOUNT DUE"
                                id="TotalAmountDue"
                                {...field}
                              />
                            </Tooltip>
                          )}
                        />
                      </Grid>
                    )}

                    {selectedCode === "CUSTOMER" && (
                      <>
                        <Grid
                          item
                          md={6}
                          lg={4}
                          sm={6}
                          xs={12}
                          textAlign="center"
                        >
                          <Controller
                            name="TotalAmountDue"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              // <Tooltip title="AMOUNT DUE" arrow>
                              <InputTextField
                                label="TOTAL"
                                id="TotalAmountDue"
                                readOnly
                                {...field}
                              />
                              // </Tooltip>
                            )}
                          />
                        </Grid>
                        {!isPMLocalCurrency && (
                          <Grid
                            item
                            md={6}
                            lg={4}
                            sm={6}
                            xs={12}
                            textAlign="center"
                          >
                            <Controller
                              name="TotalAmountDueFC"
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                // <Tooltip title="AMOUNT DUE" arrow>
                                <InputTextField
                                  label="TOTAL (FC)"
                                  id="TotalAmountDueFC"
                                  readOnly
                                  {...field}
                                />
                                // </Tooltip>
                              )}
                            />
                          </Grid>
                        )}
                        <Grid
                          item
                          md={6}
                          lg={4}
                          sm={6}
                          xs={12}
                          textAlign="center"
                        >
                          <Controller
                            name="AmountDue"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <Tooltip title="AMOUNT DUE" arrow>
                                <InputTextField
                                  label="AMOUNT DUE"
                                  id="AmountDue"
                                  readOnly
                                  {...field}
                                />
                              </Tooltip>
                            )}
                          />
                        </Grid>
                        {!isPMLocalCurrency && (
                          <Grid
                            item
                            md={6}
                            lg={4}
                            sm={6}
                            xs={12}
                            textAlign="center"
                          >
                            <Controller
                              name="AmountDueFC"
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <Tooltip title="AMOUNT DUE" arrow>
                                  <InputTextField
                                    label="AMOUNT DUE (FC)"
                                    id="AmountDueFC"
                                    readOnly
                                    {...field}
                                  />
                                </Tooltip>
                              )}
                            />
                          </Grid>
                        )}
                      </>
                    )}
                    {/* {(selectedCode === "CUSTOMER" ||
                      selectedCode === "VENDOR") && (
                      <Grid
                        item
                        md={6}
                        lg={4}
                        sm={6}
                        xs={12}
                        textAlign="center"
                      >
                        <Controller
                          name="OpenBal"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Tooltip title="OPEN BALANCE" arrow>
                              <InputTextField
                                name="OpenBal"
                                label="OPEN BALANCE"
                                readOnly
                                id="OpenBalance"
                                {...field}
                              />
                            </Tooltip>
                          )}
                        />
                      </Grid>
                    )} */}
                    {selectedCode === "ACCOUNT" && (
                      <>
                        <Grid
                          item
                          md={6}
                          lg={4}
                          sm={6}
                          xs={12}
                          textAlign="center"
                        >
                          <Controller
                            name="TotalAmountDue"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              // <Tooltip title="AMOUNT DUE" arrow>
                              <InputTextField
                                label="AMOUNT"
                                id="TotalAmountDue"
                                readOnly
                                {...field}
                              />
                              // </Tooltip>
                            )}
                          />
                        </Grid>
                        {selectedCurrency !== localCurrency && (
                          <Grid
                            item
                            md={6}
                            lg={4}
                            sm={6}
                            xs={12}
                            textAlign="center"
                          >
                            <Controller
                              name="TotalAmountDueFC"
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                // <Tooltip title="AMOUNT DUE" arrow>
                                <InputTextField
                                  label="AMOUNT (FC)"
                                  id="TotalAmountDueFC"
                                  readOnly
                                  {...field}
                                />
                                // </Tooltip>
                              )}
                            />
                          </Grid>
                        )}
                        <Grid
                          item
                          md={6}
                          lg={4}
                          sm={6}
                          xs={12}
                          textAlign="center"
                        >
                          <Controller
                            name="AmountDue"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <Tooltip title="TOTAL AMOUNT DUE" arrow>
                                <InputTextField
                                  label="TOTAL AMOUNT DUE"
                                  id="AmountDue"
                                  readOnly
                                  {...field}
                                />
                              </Tooltip>
                            )}
                          />
                        </Grid>
                        {selectedCurrency !== localCurrency && (
                          <Grid
                            item
                            md={6}
                            lg={4}
                            sm={6}
                            xs={12}
                            textAlign="center"
                          >
                            <Controller
                              name="AmountDueFC"
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <Tooltip title="TOTAL AMOUNT DUE (FC)" arrow>
                                  <InputTextField
                                    label="TOTAL AMOUNT DUE (FC)"
                                    id="AmountDueFC"
                                    readOnly
                                    {...field}
                                  />
                                </Tooltip>
                              )}
                            />
                          </Grid>
                        )}
                      </>
                    )}
                    <Grid item md={6} lg={4} sm={6} xs={12} textAlign="center">
                      <Controller
                        name="JrnlMemo"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <InputTextField
                            {...field}
                            size="small"
                            name="JrnlMemo"
                            label="JOURNAL REMARK"
                            placeholder="JOURNAL REMARK"
                            inputProps={{ maxLength: 50 }}
                            rows={2}
                            multiline
                            fullWidth
                          />
                        )}
                      />
                    </Grid>

                    <Grid item md={6} lg={4} sm={6} xs={12} textAlign="center">
                      <Controller
                        name="Comments"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <InputTextField
                            {...field}
                            size="small"
                            label="REMARK"
                            inputProps={{ maxLength: 254 }}
                            placeholder="REMARK"
                            rows={2}
                            multiline
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    {/* {watch("Status") === "1" &&
                      (selectedCode === "CUSTOMER" ||
                        selectedCode === "VENDOR") && (
                        <Grid
                          item
                          md={6}
                          lg={4}
                          sm={6}
                          xs={12}
                          textAlign="center"
                        >
                          <Controller
                            name="BpAct"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <Tooltip title="CONTROL ACCOUNT" arrow>
                                <InputTextField
                                  label="CONTROL ACCOUNT"
                                  name="BpAct"
                                  value={field.value}
                                  error={!!error}
                                  inputProps={{ maxLength: 15 }}
                                  helperText={error ? error.message : null}
                                  disabled
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
                                            setIsCAccGLAccountDialogOpen(true);
                                            fetchInitialGLAccounts();
                                          }}
                                        />
                                      </InputAdornment>
                                    ),
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value);
                                    // setGLAccountValue(value);
                                  }}
                                />
                              </Tooltip>
                            )}
                          />
                        </Grid>
                      )} */}
                    {/* <GLAccountDialog
                      open={isCAccGLAccountDialogOpen}
                      onClose={() => setIsCAccGLAccountDialogOpen(false)}
                      rows={GLAccountRows}
                      columns={CAccGLAcclist}
                      onRowSelection={handleCAccRowSelection}
                    /> */}
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
                  type="submit"
                  name={SaveUpdateName}
                  color="success"
                  sx={{ color: "white" }}
                  disabled={
                    (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                    (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                  }
                >
                  {SaveUpdateName}
                </Button>
              </Grid>

              {/* <Grid item>
                <Button
                  variant="contained"
                  disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                  color="info"
                  // onClick={ClearForm}
                  onClick={HandlePrint}
                >
                  PRINT
                </Button>
              </Grid> */}
              <Grid item>
                <PrintMenu
                  disabled={SaveUpdateName === "SAVE"}
                  type={type}
                  DocEntry={allFormData.DocEntry}
                  PrintData={PrintData}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
