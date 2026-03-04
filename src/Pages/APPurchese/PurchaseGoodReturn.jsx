import AccountBalanceIcon from "@mui/icons-material/AccountBalance"; // For Accounting
import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DoNotDisturbAltSharpIcon from "@mui/icons-material/DoNotDisturbAltSharp";
import AssessmentIcon from "@mui/icons-material/Gavel";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ListAltIcon from "@mui/icons-material/ListAlt"; // For Contents
import LocalShippingIcon from "@mui/icons-material/LocalShipping"; // For Logistics
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";
import { TabContext, TabPanel } from "@mui/lab";
import TableGridFrieght from "../Components/TableGridFrieght";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useItemServiceList } from "../../Hooks/useItemServiceList";
import DynamicLoader from "../../Loaders/DynamicLoader";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import {
  clearAllCache,
  fetchExchangeRateStore,
} from "../../slices/exchangeRateSlice";
import { dataGridSx } from "../../Styles/dataGridStyles";
import AllBinLocationShow from "../Components/AllBinLocationShow";
import BatchOutCopyform from "../Components/BatchOutCopyform";
import BatchOuttake from "../Components/BatchOuttake";
import {
  calculateExpenseTotals,
  getUniqueCount,
} from "../Components/calculateExpenseTotals";
import CalCulation, { toMinOne } from "../Components/CalCulation";
import CardComponent from "../Components/CardComponent";
import CardCopyFrom from "../Components/CardCopyFrom";
import DataGridModal from "../Components/DataGridModal";
import ExchangeLineRateCopyform from "../Components/ExchangeLineRateCopyform";
import {
  InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
  SelectedDatePickerField,
  SmallInputSelectTextField,
  SmallInputTextField,
} from "../Components/formComponents";
import LogisticAddress from "../Components/LogisticAddress";
import SerialOuttake from "../Components/OpenSerialGetCase";
import PrintMenu from "../Components/PrintMenu";
import SearchInputField from "../Components/SearchInputField";
import SearchModel, {
  CopyFromSearchModel,
  SearchBPModel,
} from "../Components/SearchModel";
import SerialOutCopyForm from "../Components/SerialOutCopyForm";
import { getStatus } from "../Components/status";
import TaxCategoryModel from "../Components/TaxCategoryModel";
import TaxDatagridCellModel from "../Components/TaxDatagridCellModel";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { validateTaxSelection } from "../Components/validateTaxSelection";
import { ValidationSubmitForm } from "../Components/ValidationSubmitForm";
import { TwoFormatter, ValueFormatter } from "../Components/ValueFormatter";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { useCopyFromList } from "../../Hooks/useCopyFromList";
const ServiceCol = [
  {
    id: 1,
    field: "ServCode",
    headerName: "SAC Code",
    width: 150,
  },
  {
    id: 2,
    field: "ServName",
    headerName: "SAC Name",
    width: 150,
  },
];
const modelColumns = [
  {
    id: 1,
    field: "ItemCode",
    headerName: "Item Code",
    width: 150,
  },
  {
    id: 2,
    field: "ItemName",
    headerName: "Item Description",
    width: 150,
  },
  {
    field: "DefaultWhs",
    headerName: "WHSCODE",
    width: 120,
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
const CopyFromCol = [
  // { field: "id", headerName: "ID", width: 90 },
  { field: "BaseDocNum", headerName: "Base Document", width: 150 },
  { field: "ItemCode", headerName: "Item No.", width: 150 },
  { field: "ItemName", headerName: "Item Description", width: 120 },
  {
    field: "Quantity",
    headerName: "QTY",
    width: 90,
    editable: false, // Make it editable
    // renderCell: (params) => (
    //   <InputTextField
    //     name="Quantity"
    //     value={params.value}
    //     // onChange={(e) => handleCopyChange(e, params.row)}
    //   />
    // ),
  },

  {
    field: "PriceBefDi",
    headerName: "UNIT PRICE",
    sortable: false,
    width: 130,
    editable: false,
    // renderCell: (params) => (
    //   <InputTextField
    //     name="PriceBefDi"
    //     value={params.value}
    //     // onChange={(e) => handleCopyChange(e, params.row)}
    //   />
    // ),
  },

  {
    field: "Discount",
    headerName: "DISC(%)",
    width: 100,
    sortable: false,
    editable: false,
    // renderCell: (params) => (
    //   <InputTextField
    //     name="Discount"
    //     type="number"
    //     value={params.value}
    //     // onChange={(e) => handleChange(e, params.row)}
    //   />
    // ),
  },

  {
    field: "Price",
    headerName: "PRICE AFTER DISCOUNT",
    sortable: false,
    width: 130,
    editable: false,
    // renderCell: (params) => (
    //   <InputTextField
    //     name="Price"
    //     type="number"
    //     value={params.value}
    //     // onChange={(e) => handleChange(e, params.row)}
    //   />
    // ),
  },

  {
    field: "LineTotal",
    headerName: "Total",
    sortable: false,
    width: 130,
    editable: false, // Make it non-editable since it's calculated
    // renderCell: (params) => (
    //   <InputTextField
    //     name="LineTotal"
    //     type="number"
    //     value={params.value}
    //     readOnly // Make it read-only
    //   />
    // ),
  },

  // { field: "AccountCode", headerName: "Account Number", width: 180 },

  { field: "UomCode", headerName: "UoM Code", width: 180 },
];

const CopyFromServices = [
  { field: "BaseDocNum", headerName: "Base Document", width: 150 },

  { id: 1, field: "ServCode", headerName: "SERVICE CODE", width: 100 },
  {
    id: 2,
    field: "ItemName",
    headerName: "SERVICE NAME",
    width: 150,
    sortable: false,
    editable: false,
  },

  {
    field: "PriceBefDi",
    headerName: "UNIT PRICE",
    sortable: false,
    width: 130,
    editable: false,
  },
  {
    field: "AssblValue",
    headerName: "AssblValue",
    sortable: false,
    width: 130,
    editable: false,
  },

  {
    field: "TaxCode",
    headerName: "TAX CODE",
    width: 110,
    sortable: false,
    editable: false,
  },
  {
    field: "Discount",
    headerName: "DISC(%)",
    width: 100,
    sortable: false,
    editable: false,
  },

  {
    field: "LineTotal",
    headerName: "TOTAL(LC)",
    type: "number",
    width: 100,
    sortable: false,
  },
];
const FrightSeletColumns = [
  {
    id: 1,
    field: "ExpnsName",
    headerName: "Expns Name",
    width: 150,
  },
];
const TaxColumn = [
  {
    id: 1,
    field: "TaxCode",
    headerName: "TaxCode",
    width: 200,
  },
  {
    id: 2,
    field: "Description",
    headerName: "Tax Description",
    width: 200,
  },

  {
    field: "Rate",
    headerName: "Rate",
    width: 120,
  },
];

const initialState = {
  exchaneRateOpen: false,
  DocRateOpen: false,
  BinLocationOpen: false,
  exchaneRateLineCpyform: false,
  TaxFrieghtOpen: false,
};
function reducer(state, action) {
  switch (action.type) {
    case "OPEN":
      return { ...state, [action.modal]: true };
    case "CLOSE":
      return { ...state, [action.modal]: false };
    case "TOGGLE":
      return { ...state, [action.modal]: !state[action.modal] };
    case "CLOSE_ALL":
      return Object.keys(state).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {},
      );
    default:
      return state;
  }
}
function PurchaseGoodReturn() {
  const theme = useTheme();
  const { user, companyData, warehouseData } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const perms = usePermissions(135);
  const [tabvalue, settabvalue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");

  const dispatchRedux = useDispatch();
  const { data, loading } = useSelector((state) => state.exchange);
  const navigate = useNavigate();
  let [ok, setok] = useState("OK");
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [frieghtopen, setFrieghtopen] = useState(false);
  const [apiloading, setapiloading] = useState(false);
  const [salesemp, setSalesEmp] = useState([]);
  const [taxcode, setTaxCode] = useState([]);
  const [frieghtdata, setFrieght] = useState([]);
  const [BusinessPartnerData, setBusinessPartnerData] = useState([]);
  const [openPayTo, setOpenPayTo] = useState(false);
  const DialogOpenPayto = () => setOpenPayTo(true);
  const DialogClosePayto = () => setOpenPayTo(false);
  let [openCompany, setopenComay] = useState(false);
  const DialogOpenCompany = () => setopenComay(true);
  const DialogCloseCompany = () => setopenComay(false);
  const [PaymentTermData, setPaymentTermData] = useState([]);
  const [RollBackoExpLines, setRollBackoExpLines] = useState([]);
  const [currencydata, setCurrencydata] = useState([]);
  const [type, setType] = useState("I");
  const [open, setOpen] = useState(false);
  const [serviceopen, setServiceOpen] = useState(false);
  const timeoutRef = useRef(null);
  const [DocEntry, setDocEntry] = useState("");
  const [shippingType, setShippingType] = useState([]);
  const [openFreight, setopenFreight] = useState(false);
  const [FrieghtTax, setTaxFrieght] = useState([]);
  const [openUomCode, setUomcodeOpen] = useState(false);
  const [UomCodeList, SetUomCode] = useState([]);
  const [selectedRowsPurchase, setSelectedRowsPurchase] = useState([]);
  const [OlinesData, setOlines] = useState([]);
  const [openPurchase, setOpenPurchase] = useState(false);
  const [copyFromModelPurchase, setCopyFromModelPurchase] = useState([]);
  const [oldOpenData, setSelectData] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedCount, setSelectedCount] = useState(0);
  const [CopyformData, setAllDAtaCopyform] = useState([]);
  const [oExpLineData, setoExpLines] = useState([]);
  const [clearCache, setClearCache] = useState(false);
  const [AllDataCopyRateLine, setAllDataCopyRateLine] = useState([]);

  // ===========================Data Grid Pagination And Searching============================
  const LIMIT = 20;
  const [isLoading, setIsLoading] = useState(false);
  const [openTax, setTaxOpen] = useState(false);
  const [TaxgetListData, setTaxGetListData] = useState([]);
  const [taxCurrentPage, setTaxCurrentPage] = useState(0);
  const [taxSearchText, setTaxSearchText] = useState("");
  const [taxRowCount, setTaxRowCount] = useState(0);
  const [taxcategoryopen, setTaxCategoryOpen] = useState(false);
  const [oTaxLineCategory, setoTaxLineCategory] = useState([]);
  //=====================================get List State====================================================================
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  //=========================================get List State End================================================================
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //=========================================open List State End================================================================
  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  //=========================================closed List State End================================================================
  // =========================COPY FROM==========================================================================================
  const [openDialog, setOpenDialog] = useState(false); // Control modal visibility
  // const [getListPOData, setGetListPOData] = useState([]);
  // const [hasMorePOList, setHasMorePOList] = useState(true);
  // const [getListPageCopyFrom, setGetListPageCopyFrom] = useState(0);
  // const [getListqueryCopyFrom, setGetLIstQueryCopyFrom] = useState("");
  // const [getListSearchingCopyFrom, setGetListSearchingCopyFrom] =
  //   useState(false);
  // ============================================================================================================================
  //! ==============CANCEL LIST===============
  const [cancelledListData, setCancelledListData] = useState([]);
  const [cancelListPage, setCancelListPage] = useState(0);
  const [cancelListSearching, setCancelListSearching] = useState(false);
  const [cancelledListquery, setCancelledListQuery] = useState("");
  const [hasMoreCancelled, setHasMoreCancelled] = useState(true);
  // ============================================================================================================================

  //=======================Serial and Batch====================================
  let [openserial, setopenserial] = useState(false);
  let [openserialOutCopy, setopenserialOutCopy] = useState(false);

  let [openBatch, setopenBatch] = useState(false);
  let [openBatchCopyform, setopenBatchCopyform] = useState(false);

  const [PrintData, setPrintData] = useState([]);
  const handleCloseSerial = () => setopenserial(false);
  const handleCloseSerialCopyform = () => setopenserialOutCopy(false);
  const handleCloseBatch = () => setopenBatch(false);
  const handleCloseBatchCopyform = () => setopenBatchCopyform(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [errorLineIds, setErrorLineIds] = useState([]);

  // ===================================================================

  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const Openmenu = Boolean(anchorEl);
  const handleClickCancelClosed = (event) => {
    setAnchorEl(event.currentTarget);
  };
  let handleCloseCancelClosed = () => {
    setAnchorEl(null);
  };

  // =====================Ware House========================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);
  const apiRef = useGridApiRef();

  let status = getStatus("1");
  const initialFormData = {
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    Status: status,
    SAPDocNum: "",
    SAPDocEntry: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    DocDueDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    PaidToDate: "0",
    TaxDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    Series: "",
    Currency: "",
    DocType: type,
    DocRate: "",
    CANCELED: "",
    Address: "",
    CompnyAddr: "",
    PayToCode: "",
    ShipToCode: "",
    CardCode: "",
    CardName: "",
    DocCur: "",
    DocTotalSy: "",
    DfltAddress: "",
    DocTotal: "",
    CntctCode: "",
    NumAtCard: "",
    SlpCode: "0",
    Comments: "",
    Discount: "0.000",
    ShipMode: "",
    PORevise: "",
    SAPSync: "",
    CurSource: "",
    Address2: "",
    TrnspCode: "",
    ShipType: "",
    TotalBefDisc: "",
    DiscountAmt: "0.00",
    DiscSumSy: "0.000",
    DiscSumFC: "0.000",
    TotalExpns: "0.000",
    CurrencyLine: "",
    ListNum: "",
    VatSum: "",
    DocNum: "",
    AttcEntry: "0",
    RoundDif: "0.000",
    GrsAmount: "",
    CancelDate: "",
    PayDuMonth: "",
    ExtraDays: "",
    ExtraMonth: "",
    GroupNum: "",
    JrnlMemo: "",
    CdcOffset: "",
    oLines: [],
    oTaxLines: [],
    oExpLines: [],
    oTaxExtLines: [
      {
        LineNum: "",
        DocEntry: "",
        UserId: user.UserId,
        CreatedBy: user.UserName,
        ModifiedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
        Status: "1",
        TaxId0: "",
        TaxId1: "",
        State: "",
        NfRef: "",
        ObjectType: "",
        StreetS: "",
        BlockS: "",
        BuildingS: "",
        CityS: "",
        ZipCodeS: "",
        StateS: "",
        CountryS: "",
        AddrTypeS: "",
        StreetNoS: "",
        StreetB: "",
        BlockB: "",
        BuildingB: "",
        CityB: "",
        ZipCodeB: "",
        StateB: "",
        CountryB: "",
        AddrTypeB: "",
        StreetNoB: "",
        Vat: "",
        AltCrdNamB: "",
        Address2S: "",
        Address3S: "",
        Address2B: "",
        Address3B: "",
        GlbLocNumS: "",
        GlbLocNumB: "",
        BpGSTType: "",
        BpGSTN: "",
        BpStateCod: "",
        BPStatGSTN: "",
        LocGSTType: "",
        LocGSTN: "",
        LocStatCod: "",
        LocStaGSTN: "",
        BpCountry: "",
      },
    ],
  };
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
  });

  const currentData = getValues();
  const allFormData = getValues();
  const RoundDif = watch("RoundDif");
  const discPercent = watch("Discount");
  const curSource = watch("CurSource");
  const DocRate = watch("DocRate");
  const currency = watch("Currency");
  // const docDate = getValues("DocDate");
  const SysRate = watch("SysRate");
  const GroupNum = watch("GroupNum");
  const rawDate = watch("DocDate");
  const docDate = rawDate ? dayjs(rawDate).format("YYYY-MM-DD") : null;
  useEffect(() => {
    dispatchRedux(fetchExchangeRateStore(docDate))
      .unwrap()
      .then((data) => {
        if (SaveUpdateName !== "UPDATE") {
          const values = data.values || [];
          const sysCurr = companyData.SysCurrncy;
          const mainCurr = companyData.MainCurncy;
          const headerCurr = currency;
          let missingRates = [];

          if (!values.length) {
            Swal.fire({
              title: "Exchange Rates Missing",
              text: "Please define exchange rates before continuing.",
              icon: "warning",
            }).then(() => {
              navigate("/dashboard/Finance/ExchangeRatesAndIndexes", {
                replace: true,
              });
            });
            return;
          }
          // ============================
          // SYSTEM RATE CHECK
          // ============================
          const sysRateObj = values.find((x) => x.Currency === sysCurr);
          const sysRate =
            sysCurr === mainCurr ? 1 : parseFloat(sysRateObj?.Rate || 0);
          const DateWiseSysRate = sysRate; // FIX
          setValue("SysRate", sysRate);
          if (sysRate <= 0) {
            missingRates.push({
              Type: "SystemRate",
              Currency: sysCurr,
              Rate: sysRate,
              DocEntry: sysRateObj?.DocEntry ?? "0",
              RateDate: docDate,
            });
          }
          const hasDocNum = !!!getValues("CardCode");
          // ============================
          // HEADER CURRENCY RATE CHECK
          // ============================

          let headerRate = 0;
          if (!hasDocNum) {
            const headerRateObj = values.find((x) => x.Currency === headerCurr);
            headerRate =
              headerCurr === mainCurr
                ? 1
                : parseFloat(headerRateObj?.Rate || 0);
            setValue("DocRate", headerRate);
            if (headerRate <= 0) {
              missingRates.push({
                Type: "DocumentRate",
                Currency: headerCurr,
                Rate: headerRate,
                DocEntry: headerRateObj?.DocEntry ?? "0",
                RateDate: docDate,
              });
            }
          }

          // ============================
          // LINE CURRENCY RATE CHECK
          // ============================
          const lineCurrencies = new Set(
            allFormData.oLines.map((x) => x.Currency),
          );

          lineCurrencies.forEach((cur) => {
            const rec = values.find((v) => v.Currency === cur);
            const r = cur === mainCurr ? 1 : parseFloat(rec?.Rate || 0);
            if (r <= 0) {
              missingRates.push({
                Type: "LineRate",
                Currency: cur,
                Rate: r,
                DocEntry: rec?.DocEntry ?? "0",
                RateDate: docDate,
              });
            }
          });

          // ============================
          // SHOW SINGLE MODAL IF ANY MISSING
          // ============================
          if (missingRates.length > 0) {
            const uniqueCurrencies = [
              ...new Map(
                missingRates.map((item) => [item.Currency, item]),
              ).values(),
            ];

            setAllDataCopyRateLine(uniqueCurrencies);
            dispatch({ type: "OPEN", modal: "exchaneRateLineCpyform" });
            Swal.fire({
              title: "Missing Rates",
              text: "Some currency exchange rates are missing.",
              icon: "warning",
            });

            return; // Stop further calculations
          } else {
            dispatch({ type: "CLOSE", modal: "exchaneRateLineCpyform" });
          }
          const UpdateDateRate = allFormData.oLines.map((item) => {
            const updatedRate = values.find(
              (ex) => ex.Currency === item.Currency,
            );
            const latestDocRate =
              item.Currency === mainCurr
                ? 1
                : parseFloat(updatedRate?.Rate || 0);

            const isSameCurrency = item.Currency === headerCurr;

            const LineTotal =
              item.Currency === mainCurr
                ? item.LineTotal
                : ValueFormatter(item.Quantity * item.Price * latestDocRate);

            const TotalFrgn = isSameCurrency
              ? item.TotalFrgn
              : LineTotal / headerRate;

            const TotalSumSy = ValueFormatter(LineTotal / DateWiseSysRate);

            // TAX CALC
            let headerDisc = {
              VatSum: 0,
              VatSumSy: 0,
              VatSumFrgn: 0,
              oTaxLines: [],
            };

            if (Number(item.TaxCode) > 0) {
              headerDisc = taxCalculation(
                LineTotal,
                item.AssblValue,
                item.DocTotal,
                item.PriceBefDi,
                item.Quantity,
                item.TaxCode,
              );
            }

            return {
              ...item,
              Rate: latestDocRate,
              LineTotal,
              TotalFrgn,
              TotalSumSy,
              VatSum: ValueFormatter(headerDisc.VatSum),
              VatSumSy: ValueFormatter(headerDisc.VatSumSy),
              VatSumFrgn: ValueFormatter(headerDisc.VatSumFrgn),
              oTaxLines: headerDisc.oTaxLines,
            };
          });

          setValue("oLines", UpdateDateRate);

          // ---------------------------
          // UPDATE EXPENSE LINES (oExpLines)
          // ---------------------------
          const UpdateoExpLinesDateRate = (allFormData.oExpLines || []).map(
            (item) => {
              const isSysCurrency = currency === companyData.SysCurrncy;
              let TotalFrgn,
                LineTotal,
                TotalSumSy = 0;
              switch (curSource) {
                case "L":
                  LineTotal = ValueFormatter(item.TotalSumSy * DateWiseSysRate);
                  TotalFrgn = LineTotal / headerRate;
                  TotalSumSy = ValueFormatter(LineTotal / DateWiseSysRate);
                  break;
                case "S":
                  TotalSumSy = ValueFormatter(item.LineTotal / SysRate, 3);
                  LineTotal = TotalSumSy * DateWiseSysRate;
                  TotalFrgn = LineTotal / headerRate;
                  break;
                case "C":
                  if (currency === companyData.MainCurncy) {
                    LineTotal = ValueFormatter(item.LineTotal);
                    TotalFrgn = LineTotal / headerRate;
                    TotalSumSy = ValueFormatter(LineTotal / DateWiseSysRate);
                  } else {
                    LineTotal =
                      currency === companyData.MainCurncy
                        ? item.LineTotal
                        : ValueFormatter(item.TotalFrgn * headerRate);
                    TotalFrgn = LineTotal / headerRate;
                    TotalSumSy = isSysCurrency
                      ? ValueFormatter(LineTotal / headerRate)
                      : ValueFormatter(LineTotal / DateWiseSysRate);
                  }
                  break;
                default:
                  TotalFrgn = item.TotalFrgn;
                  LineTotal = item.LineTotal;
                  TotalSumSy = item.TotalSumSy;
              }
              let headerDisc = {
                VatSum: 0,
                VatSumSy: 0,
                VatSumFrgn: 0,
                oTaxLines: [],
              };

              if (Number(item.TaxCode) > 0) {
                headerDisc = taxCalculation(
                  LineTotal,
                  item.AssblValue,
                  item.DocTotal,
                  item.PriceBefDi,
                  item.Quantity,
                  item.TaxCode,
                );
              }
              const calcGross = (vat, total) =>
                ValueFormatter(
                  (parseFloat(vat) || 0) + (parseFloat(total) || 0),
                );
              const Currenyc =
                curSource === "L"
                  ? mainCurr
                  : curSource === "S"
                    ? sysCurr
                    : mainCurr === headerCurr
                      ? mainCurr
                      : headerCurr;
              return {
                ...item,
                LineTotal,
                TotalFrgn,
                TotalSumSy,
                Currenyc,
                GrsAmount: calcGross(headerDisc.VatSum, LineTotal),
                GrsSC: calcGross(headerDisc.VatSumSy, TotalSumSy),
                GrsFC: calcGross(headerDisc.VatSumFrgn, TotalFrgn),
                VatSum: ValueFormatter(headerDisc.VatSum),
                VatSumSy: ValueFormatter(headerDisc.VatSumSy),
                VatSumFrgn: ValueFormatter(headerDisc.VatSumFrgn),
                oTaxLines: headerDisc.oTaxLines,
              };
            },
          );

          setRollBackoExpLines(UpdateoExpLinesDateRate);
          setValue("oExpLines", UpdateoExpLinesDateRate);

          // ---------------------------
          // TOTAL EXPENSES SUMMARY
          // ---------------------------
          const totals = UpdateoExpLinesDateRate.reduce(
            (acc, line) => {
              acc.TotalExpns += parseFloat(line.LineTotal) || 0;
              acc.totalExpFC += parseFloat(line.TotalFrgn) || 0;
              acc.totalExpSC += parseFloat(line.TotalSumSy) || 0;

              acc.taxOnExp += parseFloat(line.VatSum) || 0;
              acc.taxOnExpFc += parseFloat(line.VatSumFrgn) || 0;
              acc.taxOnExpSc += parseFloat(line.VatSumSy) || 0;

              return acc;
            },
            {
              TotalExpns: 0,
              totalExpFC: 0,
              totalExpSC: 0,
              taxOnExp: 0,
              taxOnExpFc: 0,
              taxOnExpSc: 0,
            },
          );

          setValue("TotalExpns", ValueFormatter(totals.TotalExpns));
          setValue("TotalExpFC", ValueFormatter(totals.totalExpFC));
          setValue("TotalExpSC", ValueFormatter(totals.totalExpSC));
          setValue("TaxOnExp", ValueFormatter(totals.taxOnExp));
          setValue("TaxOnExpFc", ValueFormatter(totals.taxOnExpFc));
          setValue("TaxOnExpSc", ValueFormatter(totals.taxOnExpSc));

          if (!values.length) {
            navigate("/dashboard/Finance/ExchangeRatesAndIndexes", {
              replace: true,
            });
          }
        }
      })
      .catch(() => {
        Swal.fire({
          title: "Error",
          text: "Please define the exchange rates.",
          icon: "error",
        }).then(() => {
          navigate("/dashboard/Finance/ExchangeRatesAndIndexes", {
            replace: true,
          });
        });
      });
  }, [docDate]);

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/21`,
        );
        if (dataPrint.success) {
          const OlinesDataPrint = dataPrint.values.oLines;
          setPrintData(OlinesDataPrint);
        } else {
          Swal.fire({
            text: dataPrint.message,
            icon: "question",
            confirmButtonText: "YES",
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchPrintData(); // runs once
  }, []);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };
  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  const SelectFreight = () => {
    setopenFreight(true);
  };
  const closeFreightModel = () => {
    setopenFreight(false);
  };
  const ClearForm = () => {
    reset(initialFormData);
    setSaveUpdateName("SAVE");
    setType("I");
    setDocEntry("");
    setCheckedItems("");
    setOlines([]);
    setoExpLines([]);
    handleGetListClear();
    setBusinessPartnerData([]);
    setSelectData([]);
    setAllDAtaCopyform([]);
    setok("");
    clearFiles();
    companyAddresss();
    setRollBackoExpLines([]);
    setSelectedRows([]);
    if (openListquery?.trim()) {
      handleOpenListClear();
    } else if (closedListquery?.trim()) {
      handleClosedListClear();
    } else if (cancelledListquery?.trim()) {
      handleCancelListClear();
    }
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
    // setoLines([]);
    // handleClick();
  };

  //#region  SEarching List Vendor
  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BPV2/V2/ByCardType/Search/${searchTerm}/v/1/${pageNum}/20`
        : `/BPV2/V2/ByCardType/Pages/v/1/${pageNum}/20`;

      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);

    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchGetListData(0, res);
    }, 600);
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0); // Reset page to 0
    setGetListData([]); // Clear current data
    fetchGetListData(0); // Fetch first page without search
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (searchmodelOpen === true) {
      fetchGetListData(0);
      setGetListQuery("");
    }
  }, [searchmodelOpen]);

  const companyAddresss = useCallback(() => {
    setValue("CompnyAddr", companyData.CompnyAddr || "");
    setValue("BlockS", companyData.Block);
    setValue("StreetS", companyData.Street);
    setValue("CityS", companyData.City);
    setValue("ZipCodeS", companyData.ZipCode);
    setValue("StateS", companyData.State);
    setValue("CountryS", companyData.Country);

    let updatedData = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockS: companyData.Block ?? "",
      StreetS: companyData?.Street ?? "",
      CityS: companyData?.City ?? "",
      StateS: companyData?.State ?? "",
      CountryS: companyData?.Country ?? "",
      ZipCodeS: companyData?.ZipCode ?? "",
    }));

    setValue("oTaxExtLines", updatedData);
  }, [companyData, setValue]); // Add proper dependencies

  // Then call it when the component mounts
  useEffect(() => {
    companyAddresss();
  }, []);

  const onSelectBusinessPartner = async (DocEntry) => {
    const { data: dataBP } = await apiClient.get(`/BPV2/V2/${DocEntry}`);
    const { values } = dataBP;
    setBusinessPartnerData(values);
    dispatchRedux(clearAllCache());

    dispatchRedux(fetchExchangeRateStore(docDate));
    let selectedAddress =
      (values?.oLines || []).find(
        (item) => item.LineNum === values.DfltBilled,
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
      .filter((v) => v?.trim())
      .join(", ");
    setValue("PayToCode", values.DfltBilled || "");
    setValue("ShipToCode", values?.DfltShiped || "");
    setValue("DfltAddress", DfltAddress || "");
    setValue("BlockB", selectedAddress.Address1);
    setValue("StreetB", selectedAddress.Address2);
    setValue("CityB", selectedAddress.City);
    setValue("StateB", selectedAddress.State);
    setValue("CountryB", selectedAddress.Country);
    setValue("ZipCodeB", selectedAddress.Zipcode);
    setValue("CompnyAddr", companyData.CompnyAddr || "");
    setValue("BlockS", companyData.Block);
    setValue("StreetS", companyData.Street);
    setValue("CityS", companyData.City);
    setValue("ZipCodeS", companyData.ZipCode);
    setValue("StateS", companyData.State);
    setValue("CountryS", companyData.Country);

    SearchModelClose();
    setValue("CardCode", values.CardCode);
    setValue("CardName", values.CardName);
    setValue("CntctCode", values.CntctPrsn || "");
    setValue("NumAtCard", values?.NumAtCard || "");
    setValue("CurSource", "C");
    setValue(
      "Currency",
      values.Currency === "AC" ? companyData.MainCurncy : values.Currency,
    );
    setValue("TrnspCode", values.ShipType || "");
    setValue("GroupNum", values.GroupNum);
    const PaymentValuesSet = PaymentTermData.filter(
      (payment) => payment.DocEntry === values.GroupNum,
    );
    setValue("PayDuMonth", PaymentValuesSet[0]?.PayDuMonth ?? "N");
    setValue("ExtraMonth", PaymentValuesSet[0]?.ExtraMonth ?? 0);
    setValue("ExtraDays", PaymentValuesSet[0]?.ExtraDays ?? 0);
    setValue("ListNum", PaymentValuesSet[0]?.ListNum ?? "0");
    setValue("TolDays", PaymentValuesSet[0]?.TolDays ?? 0);
    setValue(
      "BslineDate",
      PaymentValuesSet[0]?.BslineDate ?? dayjs(undefined).format("YYYY-MM-DD"),
    );
    let updatedData = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockB: selectedAddress?.Address1 ?? "", // ✅ Correct syntax
      StreetB: selectedAddress?.Address2 ?? "",
      CityB: selectedAddress?.City ?? "",
      StateB: selectedAddress?.State ?? "",
      CountryB: selectedAddress?.Country ?? "",
      ZipCodeB: selectedAddress?.Zipcode ?? "",
      BlockS: companyData.Block ?? "",
      StreetS: companyData?.Street ?? "",
      CityS: companyData?.City ?? "",
      StateS: companyData?.State ?? "",
      CountryS: companyData?.Country ?? "",
      ZipCodeS: companyData?.ZipCode ?? "",
    }));
    setValue("oTaxExtLines", updatedData);
    // fetchCopyFromData(0, "", type);

    const records = data[docDate] || [];
    const sysCurr = companyData.SysCurrncy;
    const mainCurr = companyData.MainCurncy;
    const headerCurr =
      values.Currency === "AC" ? companyData.MainCurncy : values.Currency;
    let missingRates = [];
    // ============================
    // SYSTEM RATE CHECK
    // ============================
    const sysRateObj = records.find((x) => x.Currency === sysCurr);
    const sysRate =
      sysCurr === mainCurr ? 1 : parseFloat(sysRateObj?.Rate || 0);
    setValue("SysRate", sysRate);
    if (sysRate <= 0) {
      missingRates.push({
        Type: "SystemRate",
        Currency: sysCurr,
        Rate: sysRate,
        DocEntry: sysRateObj?.DocEntry ?? "0",
        RateDate: docDate,
      });
    }
    // ============================
    // HEADER CURRENCY RATE CHECK
    // ============================
    let headerRate = 0;
    const headerRateObj = records.find((x) => x.Currency === headerCurr);
    headerRate =
      headerCurr === mainCurr ? 1 : parseFloat(headerRateObj?.Rate || 0);
    setValue("DocRate", headerRate);
    if (headerRate <= 0) {
      missingRates.push({
        Type: "DocumentRate",
        Currency: headerCurr,
        Rate: headerRate,
        DocEntry: headerRateObj?.DocEntry ?? "0",
        RateDate: docDate,
      });
    }
    if (missingRates.length > 0) {
      setAllDataCopyRateLine(missingRates);
      dispatch({ type: "OPEN", modal: "exchaneRateLineCpyform" });
      Swal.fire({
        title: "Missing Rates",
        text: "Some currency exchange rates are missing.",
        icon: "warning",
      });
      return; // Stop further calculations
    } else {
      dispatch({ type: "CLOSE", modal: "exchaneRateLineCpyform" });
    }
  };

  //#endregion Vendor List

  //#region  Open Tab
  // order List For OPEN Tab
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/GoodsReturn/Search/${searchTerm}/1/${pageNum}/20`
        : `/GoodsReturn/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);
      if (response.data.success === true) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else if (response.data.success === false) {
        Swal.fire({
          // title: "Doctotal Not Negative",
          text: `${response.data.message}`,
          icon: "warning",
          confirmButtonText: "Ok",
          // timer: 3000,
        });
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle search input
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

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  //#endregion End Open  Tab

  //#region  Close Tab Purchase Order
  // Close Tab Api Binding
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/GoodsReturn/Search/${searchTerm}/0/${pageNum}/20`
        : `/GoodsReturn/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreClosed(newData.length === 20);

        setClosedListData((prev) =>
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
      console.error("Error fetching data:", error);
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
      closedListSearching ? closedListquery : "",
    );
    setClosedListPage((prev) => prev + 1);
  };

  // Initial fetch
  useEffect(() => {
    fetchClosedListData(0); // Load first page on mount
  }, []);
  //#endregion Close Tab

  //#region Cancel
  //! =================CANCEL LIST================================
  const fetchCancelledListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/GoodsReturn/Search/${searchTerm}/3/${pageNum}/20`
        : `/GoodsReturn/Pages/3/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreCancelled(newData.length === 20);
        setCancelledListData((prev) =>
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
      console.error("Error fetching data:", error);
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

  // Initial fetch
  useEffect(() => {
    fetchCancelledListData(0); // Load first page on mount
  }, []);
  //#endregion Cancel

  //#region Existing Record Show
  let { isDirty } = useFormState({ control });
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      await setbusinessPartner(CardCode, CntctCode);

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
  let Quantity = getValues("oLines").reduce((sum, current) => {
    const Quantity = parseFloat(current?.Quantity) || 0; // Handle NaN, null, undefined
    return sum + Quantity;
  }, 0);

  let OpenQuantity = getValues("oLines").reduce((sum, current) => {
    const OpenQuantity = parseFloat(current?.OpenQuantity) || 0; // Handle NaN, null, undefined
    return sum + OpenQuantity;
  }, 0);
  let BaseType = getValues("oLines").some((base) => base.BaseType === "20");
  console.log(BaseType);
  const fetchAndSetData = (DocEntry) => {
    setapiloading(true);

    apiClient
      .get(`/GoodsReturn/${DocEntry}`)
      .then((response) => {
        if (!response.data || !response.data.values) {
          console.error("API Response missing `values` key:", response.data);
          return;
        }
        const item = response.data.values;

        // setbusinessPartner(item.CardCode, item.CntctCode);
        reset({
          ...item,
          CompnyAddr: item.Address2 || "",
          PayToCode: item.PayToCode || "",
          ShipToCode: item.ShipToCode,
          DfltAddress: item.Address || "",
          CardCode: item.CardCode || "",
          CardName: item.CardName || "",
          CntctCode: item.CntctCode || "",
          NumAtCard: item.NumAtCard || "",
          DocNum: item.DocNum || "",
          CurSource: item.CurSource || "",
          DocDate: dayjs(item.DocDate).format("YYYY-MM-DD"),
          DocDueDate: dayjs(item.DocDueDate).format("YYYY-MM-DD"),
          TaxDate: dayjs(item.TaxDate).format("YYYY-MM-DD"),
          Status: getStatus(item.Status),
          totalbef: item.TotalBefDisc || 0,
          TaxOnExp: item.TaxOnExp,
          TotalExpns: item.TotalExpns,
          Series: item.Series,
          VatSum: item.VatSum || 0,
          Discount: item.Discount || 0,
          DiscountAmt: item.DiscountAmt || 0,
          RoundDif: item.RoundDif || 0,
          SlpCode: item.SlpCode || "",
          TrnspCode: item.TrnspCode || "",
          Currency: item.DocCur || "",
          Notify: item.Notify || "",
          DocType: item.DocType || "",
          Comments: item.Comments || "",
          DocEntry: item.DocEntry || "",
          oLines: (item.oLines || []).map((element) => {
            const match = warehouseData.find(
              (loc) => loc.Location === element.LocCode,
            );
            return {
              ...element,
              UserId: user.UserId,
              BaseType: element.BaseType || "-1",
              BaseEntry: element.BaseEntry || "-1",
              readonlyRow: "readonlyRow",
              BaseLine: element.BaseLine || "-1",
              DocEntry: element.DocEntry || "",
              Status: element.Status || "",
              ItemCode: element.ItemCode || "",
              ServCode: element.ServCode || "",
              ChapterID: element.ChapterID || 0,
              ItemName: element.ItemName || "",
              Quantity: element.Quantity || 0,
              Price: element.Price || 0,
              LocationName: match?.LocationName || "", // <- Get from matched object safely
              LocCode: match?.Location || "",
              WHSCode: element.WHSCode || "",
              UomCode: element.UomCode || "",
              UomEntry: element.UomEntry || "",
              UomEntry2: element.UomEntry2 || "",
              UgpEntry: element.UgpEntry || "",
              PriceBefDi: element.PriceBefDi || 0,
              AssblValue: element.AssblValue || 0,
              Discount: element.Discount || 0,
              TaxCode: element.TaxCode || "",
              PostTax: String(element.PostTax || "0"),
              Excisable: String(element.Excisable || "0"),
              VatGroup: element.VatGroup || "",
              OnHand: element.OnHand || 0,
              OpenQuantity: element.OpenQuantity || 0,
              VatSum: element.VatSum || 0,
              IsCommited: element.IsCommited || 0,
              LineNum: element.LineNum || 0,
              LineTotal: element.LineTotal || 0,
              OnOrder: element.OnOrder || 0,
              AcctCode: element.AcctCode || "",
              ExpnsName: element.ExpnsName || "",
              TotalExpns: element.TotalExpns || 0,
              // Bin: "1",
              oTaxLines: (element.oTaxLines || []).map((taxItem) => ({
                ...taxItem,
                UserId: user.UserId,
                CreatedBy: user.UserName,
                TaxRate: String(taxItem.TaxRate || ""),
                TaxSum: String(taxItem.TaxSum || ""),
                StcCode: taxItem.StcCode || "",
                BaseSum: String(taxItem.BaseSum || ""),
                RelateType: "1",
                RelateEntry: taxItem.RelateEntry || "",
                GroupNum: taxItem.GroupNum || "1",
                ExpnsCode: taxItem.ExpnsCode || "1001",
                StaCode: taxItem.StaCode || "STA001",
                staType: taxItem.staType || "1",
                TaxAcct: taxItem.TaxAcct || "001002",
                TaxSumFrgn: taxItem.TaxSumFrgn || "20",
                TaxSumSys: taxItem.TaxSumSys || "20",
                BaseSumFrg: taxItem.BaseSumFrg || "100",
                BaseSumSys: taxItem.BaseSumSys || "0",
                VatApplied: taxItem.VatApplied || "0",
                VatAppldFC: taxItem.VatAppldFC || "0",
                VatAppldSC: taxItem.VatAppldSC || "0",
                LineSeq: taxItem.LineSeq || "1",
                DeferrAcct: taxItem.DeferrAcct || "001001",
                BaseType: taxItem.BaseType || "1",
                BaseAbs: taxItem.BaseAbs || "1",
                BaseSeq: taxItem.BaseSeq || "1",
                DeductTax: taxItem.DeductTax || "0",
                DdctTaxFrg: taxItem.DdctTaxFrg || "0",
                DdctTaxSys: taxItem.DdctTaxSys || "0",
              })),
            };
          }),
          oExpLines: (item.oExpLines || []).map((element) => ({
            ...element,
            Status: element.Status,
            DocEntry: element.ExpnsCode || "",
            ExpnsName: String(element.ExpnsCode || ""),
            ModifiedBy: element.UserName || "",
            LineTotal: element.LineTotal || 0,
            GrsAmount: element.GrsAmount || 0,
            TaxCode: String(element.TaxCode || "0"),
            VatSum: element.VatSum || 0,
            oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
              ...taxItem,
              UserId: user.UserId,
              CreatedBy: user.UserName,
              TaxRate: String(taxItem.TaxRate),
              TaxSum: String(taxItem.TaxSum),
              StcCode: taxItem.StcCode,
              BaseSum: String(taxItem.BaseSum),
              // Use eval carefully, consider security implications
              RelateType: "2",
              RelateEntry: taxItem.RelateEntry,
              GroupNum: taxItem.GroupNum || "1",
              ExpnsCode: taxItem.ExpnsCode || "1001",
              StaCode: taxItem.StaCode || "STA001",
              staType: taxItem.staType || "1",
              TaxAcct: taxItem.TaxAcct || "001002",
              TaxSumFrgn: taxItem.TaxSumFrgn || "20",
              TaxSumSys: taxItem.TaxSumSys || "20",
              BaseSumFrg: taxItem.BaseSumFrg || "100",
              BaseSumSys: taxItem.BaseSumSys || "0",
              VatApplied: taxItem.VatApplied || "0",
              VatAppldFC: taxItem.VatAppldFC || "0",
              VatAppldSC: taxItem.VatAppldSC || "0",
              PaidSys: taxItem.PaidSys || "0",
              LineVatF: taxItem.LineVatF || "0",
              LineSeq: taxItem.LineSeq || "1",
              DeferrAcct: taxItem.DeferrAcct || "001001",
              BaseType: taxItem.BaseType || "1",
              BaseAbs: taxItem.BaseAbs || "1",
              BaseSeq: taxItem.BaseSeq || "1",
              DeductTax: taxItem.DeductTax || "0",
              DdctTaxFrg: taxItem.DdctTaxFrg || "0",
              DdctTaxSys: taxItem.DdctTaxSys || "0",
            })),
          })),
          oTaxExtLines: item.oTaxExtLines, // Assuming this is an array
        });
        calculateDiscountAmt(item.Discount);
        setRollBackoExpLines(item.oExpLines);
        setValue("BlockB", item.oTaxExtLines[0].BlockB);
        setValue("StreetB", item.oTaxExtLines[0].StreetB);
        setValue("CityB", item.oTaxExtLines[0].CityB);
        setValue("StateB", item.oTaxExtLines[0].StateB);
        setValue("CountryB", item.oTaxExtLines[0].CountryB);
        setValue("ZipCodeB", item.oTaxExtLines[0].ZipCodeB);
        setValue("BlockS", item.oTaxExtLines[0].BlockS);
        setValue("StreetS", item.oTaxExtLines[0].StreetS);
        setValue("CityS", item.oTaxExtLines[0].CityS);
        setValue("StateS", item.oTaxExtLines[0].StateS);
        setValue("CountryS", item.oTaxExtLines[0].CountryS);
        setValue("ZipCodeS", item.oTaxExtLines[0].ZipCodeS);
        setValue("CurrencyLine", item.oLines[0].Currency);
        setValue("DocRateLine", item.oLines[0].Rate);
        setValue("DocType", item.DocType);

        setType(item.DocType);
        setSelectData(DocEntry);
        if (item.AttcEntry > 0) {
          setFilesFromApi(item.AttcEntry);
        }
        setDocEntry(DocEntry);
      })
      .catch((error) => {
        console.error("Error fetching or processing data:", error);
      })
      .finally(() => {
        toggleSidebar();
        setapiloading(false); // Stop loading
      });
  };

  //#endregion Existing Record

  //#region  Copy Form Record List

  // const fetchCopyFromData = async (pageNum = 0, searchTerm = "", DocType) => {
  //   const CardCode = getValues("CardCode");
  //   const baseType = watch("baseType") || "20";
  //   try {
  //     const url = searchTerm
  //       ? `/GoodsReturn/CopyFrom/Search/${searchTerm}/${CardCode}/${type}/${baseType}/${pageNum}/20`
  //       : `/GoodsReturn/CopyFrom/${CardCode}/${type}/${baseType}/${pageNum}/20`;
  //     const response = await apiClient.get(url);
  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       setHasMorePOList(newData.length === 20);
  //       setGetListPOData((prev) =>
  //         pageNum === 0 ? newData : [...prev, ...newData],
  //       );
  //     } else if (response.data.success === false) {
  //       Swal.fire({
  //         text: response.data.message,
  //         icon: "question",
  //         confirmButtonText: "YES",
  //         showConfirmButton: true,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  const isFieldDisabled =
    allFormData.DocEntry ||
    allFormData.Status === "Closed" ||
    allFormData.Status === "Cancelled";

  // const handleGetListSearchCopyFrom = (resp) => {
  //   setGetLIstQueryCopyFrom(resp);
  //   setGetListSearchingCopyFrom(true);
  //   setGetListPageCopyFrom(0);
  //   setGetListPOData([]);

  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }

  //   timeoutRef.current = setTimeout(() => {
  //     fetchCopyFromData(0, resp, type);
  //   }, 600);
  // };

  // const handleGetListClearCopyFrom = () => {
  //   setGetLIstQueryCopyFrom("");
  //   setGetListSearchingCopyFrom(true);
  //   setGetListPageCopyFrom(0);
  //   setGetListPOData([]);
  //   fetchCopyFromData(0, "", type);
  // };

  // const fetchMoreGetListPO = () => {
  //   fetchCopyFromData(getListPage + 1, getListSearching ? getListquery : "");
  //   setGetListPage((prev) => prev + 1);
  // };

  // const fetchMoreGetListCopyFrom = () => {
  //   fetchCopyFromData(
  //     getListPageCopyFrom + 1,
  //     getListSearchingCopyFrom ? getListqueryCopyFrom : "",
  //     type,
  //   );
  //   setGetListPageCopyFrom((prev) => prev + 1);
  // };
  //#endregion Copy Form List

  const CardCode = getValues("CardCode");
  const baseType = watch("baseType");
  const {
    data: getListPOData,
    hasMore: hasMorePOList,
    query: getListqueryCopyFrom,
    onSearch: handleGetListSearchCopyFrom,
    onClear: handleGetListClearCopyFrom,
    fetchMore: fetchMoreGetListCopyFrom,
  } = useCopyFromList({
    BasePoint: "/GoodsReturn",
    open: openDialog,
    CardCode,
    baseType,
    type,
  });

  // ======================WHSCode Logic=============================
  const fetchWhscGetListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/WarehouseV2/search/${searchTerm}/1/${pageNum}`
        : `/WarehouseV2/pages/1/${pageNum}`;

      const response = await apiClient.get(url);

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
      WhsgetListSearching ? WhsrgetListquery : "",
    );
    setWhsGetListPage((prev) => prev + 1);
  };
  useEffect(() => {
    fetchWhscGetListData(0); // Load first page on mount
  }, []);
  const selectWhSCode = async (
    WHSCode,
    Location,
    LocationName,
    GSTRegnNo,
    GSTType,
    BalInvntAc,
    BinCode,
    DftBinAbs,
    BinActivat,
  ) => {
    const currentRowIndex = getValues("selectedRowIndex");
    setok("UPDATE");

    const currentLines = getValues("oLines");
    const currentLine = currentLines[currentRowIndex];
    // Check for GST-relevant warehouse if PostTax is enabled
    if (currentLines[0].PostTax === "Y") {
      const isNonGstWarehouse =
        [null, undefined, ""].includes(GSTRegnNo) &&
        [null, undefined, ""].includes(GSTType);

      if (isNonGstWarehouse) {
        await Swal.fire({
          title: "Error!",
          text: `You must select a warehouse with GST-relevant location for GST-relevant items [Line: ${
            currentRowIndex + 1
          } - WHSCode: ${WHSCode}]`,
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return true;
      }
    }
    // Handle PostTax scenarios
    if (currentLine.PostTax === "Y") {
      const newWarehouseState = warehouseData.find(
        (whc) => whc.WHSCode === WHSCode,
      );
      const currentWarehouseState = warehouseData.find(
        (whc) => whc.WHSCode === currentLine.WHSCode,
      );
      const ShipToCode = getValues("ShipToCode");
      const shipForm = BusinessPartnerData.oLines.find(
        (ship) => ship.LineNum === ShipToCode,
      );
      const newWhState = newWarehouseState?.State;
      const prevWhState = currentWarehouseState?.State;
      const shipToState = shipForm?.State;
      const prevWasSameAsShipTo = prevWhState === shipToState;
      const newIsSameAsShipTo = newWhState === shipToState;
      const isStateChanged = prevWhState !== newWhState;
      const intrastateToInterstate = prevWasSameAsShipTo && !newIsSameAsShipTo;
      const interstateToIntrastate = !prevWasSameAsShipTo && newIsSameAsShipTo;
      const isShipStateChanging =
        intrastateToInterstate || interstateToIntrastate;
      const shouldClearTax =
        isStateChanged && isShipStateChanging && !!currentLine.TaxCode;
      // Show confirmation dialog when tax SHOULD be cleared
      if (shouldClearTax) {
        const result = await Swal.fire({
          text: "Changing warehouse state (inter/intrastate) will clear tax codes. Are you sure?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "NO",
          showCancelButton: true,
          showConfirmButton: true,
        });
        if (!result.isConfirmed) {
          setWhscOpen(false);
          return;
        }
      }
      const updatedLines = currentLines.map((line, index) => {
        if (index === currentRowIndex) {
          return {
            ...line,
            WHSCode,
            LocCode: Location,
            AcctCode: line.GLMethod === "W" ? BalInvntAc : line.AcctCode,
            LocationName,
            BinActivat,
            BinLocation: BinCode,
            DftBinAbs: DftBinAbs,
            Bin: 0,
            oDocBinLocationLines: [],
            // Clear tax codes when shouldClearTax is true
            ...(shouldClearTax && {
              TaxCode: "",
              VatGroup: "",
              VatPrcnt: "",
            }),
          };
        }
        return line;
      });

      reset({
        ...allFormData,
        oLines: updatedLines,
      });

      // Update company address and exit
      if (currentRowIndex === 0) {
        updateCompanyAddress(WHSCode);
      }
      setWhscOpen(false);
      return;
    }

    // Handle Excisable scenarios
    if (currentLine.Excisable === "Y") {
      const newWarehouseState = warehouseData.find(
        (whc) => whc.WHSCode === WHSCode,
      );
      const currentWarehouseState = warehouseData.find(
        (whc) => whc.WHSCode === currentLine.WHSCode,
      );

      const newExcisable = newWarehouseState?.Excisable === "Y";
      const oldExcisable = currentWarehouseState?.Excisable === "Y";
      const excisableChanged = newExcisable !== oldExcisable;
      const hasTax = !!currentLine.TaxCode;

      // Show confirmation only if excisable changed and tax is present
      if (excisableChanged && hasTax) {
        const result = await Swal.fire({
          text: "Changing warehouse excisable flag will clear tax codes. Proceed?",
          icon: "warning",
          confirmButtonText: "YES",
          cancelButtonText: "NO",
          showCancelButton: true,
        });

        if (!result.isConfirmed) {
          setWhscOpen(false);
          return;
        }
      }

      const updatedLines = currentLines.map((line, index) => {
        if (index === currentRowIndex) {
          return {
            ...line,
            WHSCode,
            LocCode: Location,
            BinLocation: BinCode,
            DftBinAbs: DftBinAbs,
            Bin: 0,
            oDocBinLocationLines: [],
            BinActivat,
            AcctCode: line.GLMethod === "W" ? BalInvntAc : line.AcctCode,
            LocationName,
            // Clear tax codes when excisable changed and has tax
            ...(excisableChanged &&
              hasTax && {
                TaxCode: "",
                VatGroup: "",
                VatPrcnt: "",
              }),
          };
        }
        return line;
      });

      reset({
        ...allFormData,
        oLines: updatedLines,
      });

      // Update company address and exit
      if (currentRowIndex === 0) {
        updateCompanyAddress(WHSCode);
      }
      setWhscOpen(false);
      return;
    }

    // Default case - just update warehouse without tax clearing
    const updatedLines = currentLines.map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          WHSCode,
          LocCode: Location,
          BinLocation: BinCode,
          BinActivat,
          DftBinAbs: DftBinAbs,
          Bin: 0,
          oDocBinLocationLines: [],
          AcctCode: line.GLMethod === "W" ? BalInvntAc : line.AcctCode,
          LocationName,
        };
      }
      return line;
    });

    reset({
      ...allFormData,
      oLines: updatedLines,
    });
    // Update company address if header line is changed
    if (currentRowIndex === 0) {
      updateCompanyAddress(WHSCode);
    }

    setWhscOpen(false);
  };
  // Helper function to update company address
  const updateCompanyAddress = (WHSCode) => {
    const newWareAddress = WhscgetListData.find(
      (whscode) => whscode.WHSCode === WHSCode,
    );
    const CompnyAddr = [
      newWareAddress.Street ?? "",
      newWareAddress.Block ?? "",
      newWareAddress.City ?? "",
      newWareAddress.State ?? "",
      newWareAddress.ZipCode ?? "",
      newWareAddress.Country ?? "",
    ]
      .filter((v) => v?.trim())
      .join(", ");

    const newCompanAddress = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockS: newWareAddress.Block ?? "",
      StreetS: newWareAddress.Street ?? "",
      CityS: newWareAddress.City ?? "",
      StateS: newWareAddress.State ?? "",
      CountryS: newWareAddress.Country ?? "",
      ZipCodeS: newWareAddress.ZipCode ?? "",
    }));

    setValue("CompnyAddr", CompnyAddr);
    setValue("BlockS", newWareAddress.Block ?? "");
    setValue("StreetS", newWareAddress.Street ?? "");
    setValue("CityS", newWareAddress.City ?? "");
    setValue("ZipCodeS", newWareAddress.ZipCode ?? "");
    setValue("StateS", newWareAddress.State ?? "");
    setValue("CountryS", newWareAddress.Country ?? "");
    setValue("oTaxExtLines", newCompanAddress);
  };

  // =========================Ware House End===========================

  let handleAddress = (value) => {
    let selectedAddress =
      (BusinessPartnerData?.oLines || []).find(
        (item) => item.LineNum === value,
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
      .filter((v) => v?.trim())
      .join(", ");
    setValue("DfltAddress", DfltAddress || "");
    setValue("BlockB", selectedAddress.Address1);
    setValue("StreetB", selectedAddress.Address2);
    setValue("CityB", selectedAddress.City);
    setValue("StateB", selectedAddress.State);
    setValue("CountryB", selectedAddress.Country);
    setValue("ZipcodeB", selectedAddress.Zipcode);
    let updatedData = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockB: selectedAddress?.Address1 ?? "", // ✅ Correct syntax
      StreetB: selectedAddress?.Address2 ?? "",
      CityB: selectedAddress?.City ?? "",
      StateB: selectedAddress?.State ?? "",
      CountryB: selectedAddress?.Country ?? "",
      ZipCodeB: selectedAddress?.Zipcode ?? "",
    }));
    setValue("oTaxExtLines", updatedData);
  };
  const handleSubmitAddress = (data) => {
    let DfltAddress = [
      data.BlockB, // Use correct field names
      data.StreetB, // Use correct field names
      data.CityB,
      data.StateB,
      data.ZipcodeB,
      data.CountryB,
    ]
      .filter((v) => v?.trim())
      .join(", ");
    setValue("DfltAddress", DfltAddress || "");
    setValue("BlockB", data.BlockB);
    setValue("StreetB", data.StreetB);
    setValue("CityB", data.CityB);
    setValue("StateB", data.StateB);
    setValue("CountryB", data.CountryB);
    setValue("ZipcodeB", data.ZipcodeB); // Set formatted address only
    let updatedData = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockB: data?.BlockB ?? "", // ✅ Correct syntax
      StreetB: data?.StreetB ?? "",
      CityB: data?.CityB ?? "",
      StateB: data?.StateB ?? "",
      CountryB: data?.CountryB ?? "",
      ZipCodeB: data?.ZipCodeB ?? "",
    }));
    setValue("oTaxExtLines", updatedData);
  };

  const handleConmpanyAddress = (data) => {
    let CompnyAddr = [
      data.BlockB, // Use correct field names
      data.StreetB, // Use correct field names
      data.CityB,
      data.StateB,
      data.ZipCodeB,
      data.CountryB,
    ]
      .filter((v) => v?.trim())
      .join(", ");
    let updatedData = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockS: data?.BlockB ?? "", // ✅ Correct syntax
      StreetS: data?.StreetB ?? "",
      CityS: data?.CityB ?? "",
      StateS: data?.StateB ?? "",
      CountryS: data?.CountryB ?? "",
      ZipCodeS: data?.ZipCodeB ?? "",
    }));
    setValue("CompnyAddr", CompnyAddr || "");
    setValue("oTaxExtLines", updatedData);
  };
  const handleFright = () => {
    setFrieghtopen(true);
    // freightdata()
  };

  const handleClose = () => {
    setServiceOpen(false);
  };
  // ------------------------------------------------------------------------------------------------------------------------

  const fetchTaxGetListData = async (
    gst,
    excise,
    WHSCode,
    pageNum = 0,
    searchTerm = "",
  ) => {
    setIsLoading(true);
    try {
      const res =
        type === "I"
          ? await apiClient.get(
              `/TaxCode?GST=${gst}&Excise=${excise}&WHSCode=${WHSCode}&Status=1&SearchText=${searchTerm}&Page=${pageNum}&Limit=20`,
            )
          : await apiClient.get(
              `/TaxCode?SearchText=${searchTerm}&Page=${pageNum}&Limit=20&GetAll=true`,
            );
      const data = res.data;
      if (data.success === true) {
        const taxList = data?.values || [];
        setTaxGetListData(taxList);
        if (pageNum !== 0 && taxList.length < 21) {
          setTaxRowCount(pageNum * 20 + taxList.length + 1);
        } else if (pageNum === 0) {
          setTaxRowCount(20); // Estimate to show pagination
        }
      } else if (data.success === false) {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      Swal.fire({
        title: "Error!",
        text: err,
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaxPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== taxCurrentPage) {
        setTaxCurrentPage(model.page);
      }
    },
    [taxCurrentPage],
  );
  const handleTaxSearchChange = useCallback((searchText) => {
    setTaxSearchText(searchText);
    setTaxCurrentPage(0); // Reset to first page when searching
  }, []);

  const TaxCloseModel = () => {
    setTaxOpen(false);
  };
  const taxCategoruFunc = () => {
    const rowindex = getValues("selectedRowIndex");
    console.log("rowIndex", rowindex);
    const Olines = getValues("oLines");
    const Lines = Olines[rowindex];
    console.log("Olor", Lines);
    const PresentTax = !Lines.TaxCode || Lines.TaxCode === "";

    if (PresentTax) {
      // TaxCode NOT present
      setoTaxLineCategory(Lines);
    } else {
      // TaxCode IS present

      const updatedData = (Lines.oTaxLines || []).map((tax) => ({
        ...tax,
        VatGroup: Lines?.VatGroup ?? "",
        TaxRateHeader: Lines?.VatPrcnt ?? "",
      }));
      console.log("dfdsfsfsdf", updatedData);
      setoTaxLineCategory(updatedData);
    }
    setTaxCategoryOpen(true);
  };
  const TaxCatClose = () => {
    setTaxCategoryOpen(false);
  };
  const handleSelectTax = (id) => {
    console.log("TaxCode:", id.row.TaxCode);
    console.log("DocEntry:", id.row.DocEntry);
    setok("UPDATE");

    const currentRowIndex = getValues("selectedRowIndex");
    // setselectRowTax(currentRowIndex)
    const lines = getValues("oLines");
    const updatedLines = lines.map((line, index) => {
      if (index !== currentRowIndex) return line;
      // Create a new updated object with selected TaxCode

      if (type === "I") {
        let ShipToCode = getValues("ShipToCode");
        const ShiPForm = BusinessPartnerData.oLines
          .filter((Ship) => Ship.LineNum === ShipToCode)
          .map((ship) => ({
            ...ship,
            StateS: ship.State,
          }));
        const valid = validateTaxSelection({
          line,
          index,
          lines,
          selectedTax: id.row,
          selectedOlineTax: id.row.oLines,
          warehouseData,
          oTaxExtLines: ShiPForm,
        });
        if (!valid) return line;
      }

      TaxCloseModel();
      const updatedData = {
        ...line,
        TaxCode: id.row.DocEntry,
        VatGroup: id.row.TaxCode,
        VatPrcnt: id.row.Rate,
      };
      // Call your taxCalculation logic (assuming it returns necessary tax values)
      const taxLines = taxCalculation(
        updatedData.LineTotal,
        updatedData.AssblValue,
        getValues("DocTotal"),
        updatedData.PriceBefDi,
        updatedData.Quantity,
        updatedData.TaxCode,
      );
      updatedData.oTaxLines = taxLines.oTaxLines;
      updatedData.VatPrcnt = taxLines.VatPrcnt;
      updatedData.InvQty = updatedData.NumPerMsr * updatedData.Quantity;
      updatedData.OpenInvQty = updatedData.InvQty;
      updatedData.VatSum = ValueFormatter(
        taxLines.oTaxLines.reduce((sum, curr) => sum + curr.TaxSum, 0),
      );
      const priceWithVAT =
        parseFloat(updatedData.Price) +
        parseFloat(updatedData.Price) * (updatedData.VatPrcnt / 100);
      updatedData.PriceAfVAT = ValueFormatter(priceWithVAT);
      return updatedData;
    });

    reset({
      ...getValues(),
      oLines: updatedLines,
    });
    calculateDiscountAmt(discPercent);
  };

  // ------------------------------------------------------------------------------------------------------------------------

  const handleDeleteRow = (id) => {
    const updatedLines = getValues("oLines").filter((_, index) => index !== id);
    setok("UPDATE");
    setValue("oLines", updatedLines, {
      shouldDirty: true,
      shouldValidate: false,
    });

    if (discPercent > 0) {
      calculateDiscountAmt(discPercent);
    }
  };

  const handleDeleteFrieght = (id) => {
    const updatedRows = currentData.oExpLines.filter(
      (_, index) => index !== id,
    );
    // console.log("Updated Rows Removes",updatedRows);
    setok("UPDATE");

    const updatedData = {
      ...currentData,
      oExpLines: updatedRows,
    };

    // Reset the form with the updated data
    reset(updatedData);
  };

  //#region Small Api Calling
  const taxCodedata = async () => {
    try {
      const res = await apiClient.get(`/TaxCode/Pages/1`);
      const response = res.data;
      if (response.success === true) {
        setTaxCode(response.values);
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

  const freightdata = async () => {
    try {
      const res = await apiClient.get(`/Freight/Pages/1`);
      const response = res.data;
      if (response.success === true) {
        setFrieght(response.values);
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

  const TaxCodeFrieght = async () => {
    try {
      const res = await apiClient.get(`/TaxCode/ByFreight/Pages/1/1`);
      const response = res.data;
      if (response.success === true) {
        setTaxFrieght(response.values);
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

  const {
    //! Items
    itemSearch,
    itemPage,
    itemList,
    itemRowCount,
    itemLoading,
    onItemSearch,
    onItemPageChange,
    openItems,
    //! Services
    serviceSearch,
    servicePage,
    serviceList,
    serviceRowCount,
    serviceLoading,
    onServiceSearch,
    onServicePageChange,
    openServices,
  } = useItemServiceList({ PrchseItem: "Y" }, type, open, serviceopen);

  const CurrencyData = async () => {
    try {
      const res = await apiClient.get(`/Currency/all`);
      const response = res.data;

      if (response.success === true) {
        setCurrencydata(response.values);
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

  const salesEmpdata = async () => {
    try {
      const res = await apiClient.get(`/SalesEmp/all`);
      const response = res.data;

      if (response.success === true) {
        setSalesEmp(response.values);
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

  const ShippingType = async () => {
    try {
      const res = await apiClient.get(`/ShippingType/Pages/1/`);
      const response = res.data;

      if (response.success === true) {
        setShippingType(response.values);

        // setValue("TrnspCode", response.ShipType || "");
      } else if (response.success === false) {
        setShippingType([]);

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

  const setbusinessPartner = async (CardCode, LineNum) => {
    // console.log(allFormData.CntctCode);
    try {
      const res = await apiClient.get(`/BPV2/V2/ByCardCode/${CardCode}`);
      const response = res.data;
      if (response.success === true) {
        setBusinessPartnerData(response.values);
        setValue("CntctCode", LineNum || "");
      } else if (response.success === false) {
        setBusinessPartnerData([]);
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

  const OumCodeListData = async (DocEntry) => {
    try {
      const res = await apiClient.get(`/UGP/${DocEntry}`);
      const resonse = res.data.values;
      const updatedLines = getValues("oLines").map((item) => {
        return {
          ...item,
          unitMsr: resonse.UgpCode,
          UomCode2: resonse.UgpName, // Assign a valid value here
        };
      });
      setValue("oLines", updatedLines);
      if (res.data.success) {
        SetUomCode(res.data.values.oLines);
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data.message || "Something went wrong",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Network error",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const { DocSeries } = useDocumentSeries(
    "21",
    docDate,
    setValue,
    clearCache,
    SaveUpdateName,
  );
  const PaymentTermApi = async () => {
    try {
      const res = await apiClient.get(`/PaymentTerms/Pages/1`);
      const response = res.data;
      if (response.success === true) {
        setPaymentTermData(response.values);
      } else if (response.success === false) {
        setBusinessPartnerData([]);
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
  const getPaymentValue = async (e) => {
    console.log(e.target.value);
    const paymenttermvalue = e.target.value;
    const PaymentValuesSet = PaymentTermData.filter(
      (payment) => payment.DocEntry === paymenttermvalue,
    );
    console.log(PaymentValuesSet);
    setValue("PayDuMonth", PaymentValuesSet[0].PayDuMonth || "0");
    setValue("ExtraMonth", PaymentValuesSet[0].ExtraMonth);
    setValue("ExtraDays", PaymentValuesSet[0].ExtraDays);
    setValue("ListNum", PaymentValuesSet[0]?.ListNum ?? "0");
    if (type === "I") {
      const listNum = PaymentValuesSet[0]?.ListNum ?? "0";
      const itemCodes = oLines.map((item) => item.ItemCode);
      let priceData = {};
      try {
        const response = await apiClient.post(
          "/ItemsV2/GetPriceListByItemCode",
          {
            ItemCodes: itemCodes,
            PriceList: [listNum],
          },
        );

        if (response.data.success === true) {
          priceData = response.data.values || {};
        } else {
          Swal.fire({
            text: response.data.message,
            icon: "question",
            confirmButtonText: "YES",
            showConfirmButton: true,
          });
        }
      } catch (err) {
        console.error("Price API failed", err);
      }
      const updatedLines = oLines.map((item) => {
        const apiPrice = priceData.find(
          (itemcode) => itemcode.ItemCode === item.ItemCode,
        );
        const newPrice = apiPrice?.Price ?? item.PriceBefDi;
        const currency = apiPrice?.Currency ?? item.Currency;
        const records = data[docDate] || [];
        const rec = records.find((item) => item.Currency === currency);
        const rate = parseFloat(rec?.Rate || 0);

        if (rate === 0) {
          const missingRates = [
            {
              Type: "LineRate",
              Currency: currency,
              Rate: rate,
              DocEntry: rec?.DocEntry ?? "0",
              RateDate: docDate,
            },
          ];

          setAllDataCopyRateLine(missingRates);
          dispatch({ type: "OPEN", modal: "exchaneRateLineCpyform" });
          Swal.fire({
            title: "Missing Rates",
            text: "Some currency exchange rates are missing.",
            icon: "warning",
          });

          return; // ⛔ stop further execution
        }
        const priceLineRatio = rate / DocRate;
        const isMainCurrency = currency === companyData.MainCurncy;
        let LineTotal, TotalSumSy, TotalFrgn;
        const CalcLines = CalCulation(
          item.Quantity,
          newPrice,
          item.Discount,
          rate,
        );
        if (curSource === "C") {
          if (isMainCurrency) {
            LineTotal = priceLineRatio * CalcLines.LineTotal;
            TotalSumSy = LineTotal / SysRate;
            TotalFrgn = 0;
          } else {
            TotalFrgn = priceLineRatio * CalcLines.TotalFrgn;
            TotalSumSy = TotalFrgn / SysRate;
            LineTotal = TotalFrgn * DocRate;
          }
        } else {
          LineTotal = item.LineTotal || 0;
          TotalSumSy = item.TotalSumSy || 0;
          TotalFrgn = item.TotalFrgn || 0;
        }
        return {
          ...item,
          PriceBefDi: newPrice,
          LineTotal: ValueFormatter(LineTotal),
          TotalSumSy: ValueFormatter(TotalSumSy),
          TotalFrgn: ValueFormatter(TotalFrgn),
          Rate: rate,
          Currency: currency,
          Price: CalcLines.discountedPrice,
          INMPrice: CalcLines.discountedPrice,
          ...taxCalculation(
            LineTotal,
            item.AssblValue,
            item.DocTotal,
            newPrice,
            item.Quantity,
            item.TaxCode,
          ),
        };
      });
      setValue("oLines", updatedLines);
      setValue(
        "CurrencyLine",
        updatedLines[0]?.Currency ?? companyData.MainCurncy,
      );
      calculateDiscountAmt(discPercent);
    }
  };
  useEffect(() => {
    taxCodedata();
    TaxCodeFrieght();
    PaymentTermApi();
    freightdata();
    CurrencyData();
    salesEmpdata();
    ShippingType();
  }, []);

  //#endregion Api Calling
  const FrieghtCol = [
    {
      field: "DocEntry",
      headerName: "FREIGHT",
      width: 120,
      renderCell: (params) => {
        const freight = frieghtdata.find((f) => f.DocEntry === params.value);
        return freight?.ExpnsName || params.value;
      },
    },

    {
      field:
        curSource === "L"
          ? "LineTotal"
          : curSource === "S"
            ? "TotalSumSy"
            : currency === companyData.MainCurncy
              ? "LineTotal"
              : "TotalFrgn",
      headerName:
        curSource === "L"
          ? "TOTAL (LC)"
          : curSource === "S"
            ? "TOTAL (SC)"
            : currency === companyData.MainCurncy
              ? "TOTAL (LC)"
              : `TOTAL (${currency})`,
      width: 200,
      editable: true,
      headerAlign: "center",
      align: "center",
      type: "number",
      valueFormatter: (value, row) =>
        `${row.Currency} ${Number(value).toFixed(2)}`,
    },

    {
      field: "TaxCode",
      headerName: "TAX",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowIndex = params.row.id;
        let hasTaxcode = !!params.row.TaxCode;
        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                const lines = [...getValues("oExpLines")];
                lines[rowIndex] = {
                  ...lines[rowIndex],
                  TaxCode: "",
                  VatGroup: "",
                  VatPrcnt: 0,
                  VatSum: 0,
                  VatSumSy: 0,
                  VatSumFrgn: 0,
                  oTaxLines: [],
                  PriceAfVAT: lines[rowIndex].Price,
                };
                reset({ ...allFormData, oExpLines: lines });
              }
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (hasTaxcode) return;
                setValue("selectedRowIndex", rowIndex);
                dispatch({ type: "OPEN", modal: "TaxFrieghtOpen" });
              }
            }}
            sx={{
              width: "100%",
              height: "100%",
              outline: "none",
            }}
          >
            {/* TEXT AREA (fixed behavior) */}
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                noWrap
                textAlign="center"
                sx={{ fontSize: 13 }}
                title={params.row.VatGroup || ""}
              >
                {params.row.VatGroup || ""}
              </Typography>
            </Grid>

            {/* ICON AREA (fixed width like UOM) */}
            <Grid item sx={{ width: 28, textAlign: "center" }}>
              <IconButton
                size="small"
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  dispatch({ type: "OPEN", modal: "TaxFrieghtOpen" });
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
    // {
    //   field: "TaxCode",
    //   headerName: "TAX CODE",
    //   width: 200,
    //   editable: true,
    //   headerAlign: "center",
    //   align: "center",
    //   type: "singleSelect",
    //   valueOptions: taxOptions,
    //   preProcessEditCellProps: (params) => {
    //     return { ...params.props };
    //   },
    // },

    {
      field:
        curSource === "L"
          ? "VatSum"
          : curSource === "S"
            ? "VatSumSy"
            : currency === companyData.MainCurncy
              ? "VatSum"
              : "VatSumFrgn",
      headerName: "TOTAL TAX",
      width: 160,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field:
        curSource === "L"
          ? "GrsAmount"
          : curSource === "S"
            ? "GrsSC"
            : currency === companyData.MainCurncy
              ? "GrsAmount"
              : "GrsFC",
      headerName: "GROSS AMT",
      width: 180,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      renderCell: (params) => (
        <IconButton
          color="error"
          onClick={() => handleDeleteFrieght(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];
  //#region  CAlCulation Api Column Services And Item
  // const Items = [
  //   {
  //     id: 1,
  //     field: "id",
  //     headerName: "LINE NO",
  //     width: 50,
  //     renderCell: (params) => <span>{params.id + 1}</span>,
  //   },
  //   { field: "ItemCode", headerName: "ITEM NO", width: 100 },
  //   {
  //     field: "ItemName",
  //     headerName: "ITEM DESC",
  //     width: 150,
  //     sortable: false,
  //   },

  //   {
  //     field: "ChapterID",
  //     headerName: "HSN CODE",
  //     width: 100,
  //     // type: "text",
  //     sortable: false,
  //   },

  //   {
  //     field: "Quantity",
  //     headerName: "QTY",
  //     width: 140,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="Quantity"
  //         type="number"
  //         disabled={params.row.Status === "0"}
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //       />
  //     ),
  //   },

  //   {
  //     field: "PriceBefDi",
  //     headerName: "PRICE",
  //     sortable: false,
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="PriceBefDi"
  //         type="number"
  //         value={params.value}
  //         onChange={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0"}
  //         InputProps={{
  //           startAdornment: (
  //             <InputAdornment position="start">
  //               {params.row.Currency}
  //             </InputAdornment>
  //           ),
  //         }}
  //       />
  //     ),
  //   },

  //   {
  //     field: "AssblValue",
  //     headerName: "AssblValue",
  //     sortable: false,
  //     width: 130,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="AssblValue"
  //         type="number"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0"}
  //       />
  //     ),
  //   },

  //   {
  //     field: "Discount",
  //     headerName: "DISC(%)",
  //     width: 130,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="Discount"
  //         type="number"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0"}
  //       />
  //     ),
  //   },
  //   {
  //     field: "TaxCode",
  //     headerName: "TaxCode",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     headerAlign: "center",
  //     align: "center",
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name="TaxCode" // Unique name per row
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               // {...field}
  //               name="TaxCode"
  //               readOnly={allFormData.DocEntry}
  //               value={params.row.VatGroup || ""}
  //               onChange={(e) => {
  //                 field.onChange(e); // Update form state
  //                 handleChange(e, params.row);
  //               }}
  //               error={!!error}
  //               helperText={error?.message}
  //               onClick={() => {
  //                 fetchTaxGetListData(
  //                   params.row.PostTax,
  //                   params.row.Excisable,
  //                   params.row.WHSCode
  //                 );
  //               }}
  //               InputProps={{
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         setValue("selectedRowIndex", params.row.id);
  //                         setTaxOpen(true);
  //                       }}
  //                       disabled={params.row.Status === "0"}
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
  //     field: "taxCategory",
  //     headerName: "Tax",
  //     width: 50,
  //     sortable: false,
  //     renderCell: (params) => {
  //       return (
  //         <IconButton
  //           onClick={() => {
  //             setValue("selectedRowIndex", params.row.id);
  //             taxCategoruFunc();
  //             // setTaxCategoryOpen(true);
  //           }}
  //           size="small"
  //           sx={{
  //             backgroundColor: "green",
  //             color: "white",
  //             "&:hover": {
  //               backgroundColor: "darkgreen",
  //             },
  //           }}
  //         >
  //           <AssessmentIcon fontSize="small" />
  //         </IconButton>
  //       );
  //     },
  //   },
  //   {
  //     field:
  //       curSource === "L"
  //         ? "LineTotal"
  //         : curSource === "S"
  //         ? "TotalSumSy"
  //         : getValues("Currency") === companyData.MainCurncy
  //         ? "LineTotal"
  //         : "TotalFrgn",
  //     headerName:
  //       curSource === "L"
  //         ? "TOTAL(LC)"
  //         : curSource === "S"
  //         ? "TOTAL(SC)"
  //         : getValues("Currency") === companyData.MainCurncy
  //         ? "TOTAL(LC)"
  //         : `TOTAL (${watch("Currency")})`,
  //     type: "number",
  //     width: 100,
  //     sortable: false,
  //     headerAlign: "center",
  //     align: "center",
  //   },

  //   {
  //     field: "WHSCode",
  //     headerName: "WhsCode",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name={`WHSCode_${params.row.id}`} // Unique name per row
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               {...field}
  //               name={`WHSCode_${params.row.id}`}
  //               value={field.value || params.value || ""}
  //               onChange={(e) => {
  //                 field.onChange(e); // Update form state
  //                 handleChange(e, params.row);
  //               }}
  //               error={!!error}
  //               helperText={error?.message}
  //               InputProps={{
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         setValue("selectedRowIndex", params.row.id);
  //                         setWhscOpen(true);
  //                       }}
  //                       disabled={params.row.Status === "0"}
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
  //     field: "Bin",
  //     headerName: "BIN LOCATION",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     headerAlign: "center",
  //     align: "center",
  //     renderCell: (params) => {
  //       const BinQty = (params.row.oDocBinLocationLines || []).reduce(
  //         (cur, val) => cur + parseFloat(val.Quantity || 0),
  //         0
  //       );
  //       return (
  //         <Controller
  //           name="Bin" // Unique name per row
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               // {...field}
  //               name="Bin"
  //               readOnly={allFormData.DocEntry}
  //               value={BinQty}
  //               title={params.row.Bin}
  //               error={!!error}
  //               helperText={error?.message}
  //               InputProps={{
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         setValue("selectedRowIndex", params.row.id);
  //                         setValue("BinLocation", params.row);
  //                         dispatch({ type: "OPEN", modal: "BinLocationOpen" });
  //                       }}
  //                       disabled={
  //                         SaveUpdateName === "UPDATE"
  //                           ? (params.row.oDocBinLocationLines || []).length ===
  //                             0
  //                           : params.row.Status === "0" ||
  //                             parseFloat(params.row.DftBinAbs) <= 0 ||
  //                             params.row.BinActivat !== "Y"
  //                       }
  //                       size="small"
  //                       color="primary"
  //                       sx={{
  //                         backgroundColor: "green",
  //                         borderRadius: "10%",
  //                         color: "white",
  //                         padding: "2px",
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
  //     field: "LocCode",
  //     headerName: "Location",
  //     width: 150,
  //     // type: "text",
  //     sortable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="LocCode"
  //         value={params.row.LocationName}
  //         onChange={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0"}
  //       />
  //     ),
  //   },
  //   {
  //     field: "UomCode",
  //     headerName: "UOM Code",
  //     sortable: false,
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => {
  //       const isDisabled =
  //         params.row.Status === "0" || params.row.UomEntry2 === "-1";
  //       return (
  //         <Controller
  //           name={`UomCode_${params.row.id}`}
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               {...field}
  //               name={`UomCode_${params.row.id}`}
  //               value={params.value}
  //               onChange={(e) => {
  //                 field.onChange(e);
  //                 handleChange(e, params.row);
  //               }}
  //               disabled={isDisabled}
  //               error={!!error}
  //               helperText={error?.message}
  //               onClick={() => {
  //                 if (!isDisabled) OumCodeListData(params.row.UomEntry2);
  //               }}
  //               InputProps={{
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         setValue("selectedRowIndex", params.row.id);
  //                         setUomcodeOpen(true);
  //                       }}
  //                       disabled={isDisabled}
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
  //     field: "OpenQuantity",
  //     headerName: "OPEN QTY",
  //     width: 100,
  //     sortable: false,
  //   },
  //   // {
  //   //   field: "QtyVar",
  //   //   headerName: "Bin Location Allocation",
  //   //   width: 100,
  //   //   sortable: false,
  //   // },
  //   {
  //     field: "OnHand",
  //     headerName: "IN STOCK",
  //     width: 100,
  //     sortable: false,
  //   },
  //   {
  //     field: "IsCommited",
  //     headerName: "RESERVE",
  //     width: 100,
  //     sortable: false,
  //   },
  //   {
  //     field: "OnOrder",
  //     headerName: "ORDERED",
  //     width: 100,
  //     sortable: false,
  //   },
  //   { field: "BaseDocNum", headerName: "Base Document", width: 120 },

  //   {
  //     field: "Sr.batch",
  //     headerName: "Sr & Batch",
  //     width: 100,
  //     sortable: false,
  //     renderCell: (params) => {
  //       const { ManBtchNum, ManSerNum, BaseType, UomCode, WHSCode } =
  //         params.row;

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
  //       // if (BaseType === 21) {
  //       //   disabled = true;
  //       // }

  //       const handleClick = () => {
  //         if (!UomCode || !WHSCode) {
  //           Swal.fire({
  //             toast: true,
  //             icon: "warning",
  //             title:
  //               "Please select UoM and Warehouse Code before Creating Serial and Batch.",
  //             position: "center",
  //             showConfirmButton: false,
  //             timer: 3000,
  //             timerProgressBar: true,
  //           });

  //           return;
  //         }

  //         if (ManBtchNum === "Y" && ManSerNum === "N") {
  //           handleOnBatch(params.row);
  //         } else if (ManBtchNum === "N" && ManSerNum === "Y") {
  //           handleOnSerial(params.row);
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
  //     field: "ACTION",
  //     headerName: "ACTION",
  //     width: 100,
  //     sortable: false,
  //     renderCell: (params) => {
  //       return (
  //         <IconButton
  //           color="error"
  //           onClick={() => handleDeleteRow(params.row.id)}
  //         >
  //           <DeleteIcon />
  //         </IconButton>
  //       );
  //     },
  //   },
  // ];

  const Items = [
    {
      id: 1,
      field: "id",
      headerName: "LINE NO",
      width: 50,
      renderCell: (params) => <span>{params.id + 1}</span>,
    },
    { field: "ItemCode", headerName: "ITEM NO", width: 120 },
    { field: "ItemName", headerName: "ITEM DESC", width: 120, sortable: false },
    {
      field: "ChapterID",
      headerName: "HSN CODE",
      width: 120,
      type: "text",
      sortable: false,
    },
    {
      field: "Quantity",
      headerName: "QTY",
      width: 120,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    {
      field: "PriceBefDi",
      headerName: "PRICE",
      width: 170,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",
      preProcessEditCellProps: (params) => {
        params.row._priceEdited = true;
        return { ...params.props };
      },
      valueFormatter: (value, row) =>
        `${row.Currency} ${Number(value ?? row.PriceBefDi ?? 0).toFixed(2)}`,
    },
    {
      field: "AssblValue",
      headerName: "AssblValue",
      width: 120,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "Discount",
      headerName: "DISC(%)",
      width: 120,
      type: "number",
      headerAlign: "center",
      align: "center",
      editable: true,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "TaxCode",
      headerName: "TAX",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowIndex = params.row.id;
        let hasTaxcode = !!params.row.TaxCode;
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
                lines[rowIndex] = {
                  ...lines[rowIndex],
                  TaxCode: "",
                  VatGroup: "",
                  VatPrcnt: 0,
                  VatSum: 0,
                  VatSumSy: 0,
                  VatSumFrgn: 0,
                  oTaxLines: [],
                  PriceAfVAT: lines[rowIndex].Price,
                };

                reset({ ...allFormData, oLines: lines });
              }

              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey) // 🔥 TAB opens modal
              ) {
                e.preventDefault(); // ⛔ stop grid navigation

                if (
                  params.row.Status === "0" ||
                  params.row.Quantity !== params.row.OpenQuantity ||
                  hasTaxcode
                )
                  return;
                setValue("selectedRowIndex", rowIndex);
                fetchTaxGetListData(
                  params.row.PostTax,
                  params.row.Excisable,
                  params.row.WHSCode,
                );
                setTaxOpen(true);
              }
            }}
            sx={{
              width: "100%",
              height: "100%",
              outline: "none",
            }}
          >
            {/* TEXT AREA (fixed behavior) */}
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                noWrap
                textAlign="center"
                sx={{ fontSize: 13 }}
                title={params.row.VatGroup || ""}
              >
                {params.row.VatGroup || ""}
              </Typography>
            </Grid>

            {/* ICON AREA (fixed width like UOM) */}
            <Grid item sx={{ width: 28, textAlign: "center" }}>
              <IconButton
                size="small"
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  fetchTaxGetListData(
                    params.row.PostTax,
                    params.row.Excisable,
                    params.row.WHSCode,
                  );
                  setTaxOpen(true);
                }}
                disabled={
                  params.row.Status === "0" ||
                  params.row.Quantity !== params.row.OpenQuantity
                }
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
      field: "taxCategory",
      headerName: "Tax",
      width: 50,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <IconButton
            onClick={() => {
              setValue("selectedRowIndex", params.row.id);
              taxCategoruFunc();
              // setTaxCategoryOpen(true);
            }}
            size="small"
            sx={{
              backgroundColor: "green",
              color: "white",
              "&:hover": {
                backgroundColor: "darkgreen",
              },
            }}
          >
            <AssessmentIcon fontSize="small" />
          </IconButton>
        );
      },
    },
    {
      field:
        curSource === "L"
          ? "LineTotal"
          : curSource === "S"
            ? "TotalSumSy"
            : getValues("Currency") === companyData.MainCurncy
              ? "LineTotal"
              : "TotalFrgn",
      headerName:
        curSource === "L"
          ? "TOTAL(LC)"
          : curSource === "S"
            ? "TOTAL(SC)"
            : getValues("Currency") === companyData.MainCurncy
              ? "TOTAL(LC)"
              : `TOTAL (${getValues("Currency")})`,
      type: "number",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "WHSCode",
      headerName: "WhsCode",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openWHSCode = !!params.row.WHSCode;
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
                if (!openWHSCode) {
                  setValue("selectedRowIndex", params.row.id);
                  setWhscOpen(true);
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
                {params.row.WHSCode || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  setWhscOpen(true);
                }}
                disabled={
                  params.row.Status === "0" ||
                  params.row.Quantity !== params.row.OpenQuantity
                }
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
      field: "Bin",
      headerName: "BIN LOCATION",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const BinQty = (params.row.oDocBinLocationLines || []).reduce(
          (cur, val) => cur + parseFloat(val.Quantity || 0),
          0,
        );
        let disabled =
          SaveUpdateName === "UPDATE"
            ? (params.row.oDocBinLocationLines || []).length === 0
            : params.row.Status === "0" ||
              parseFloat(params.row.DftBinAbs) <= 0 ||
              params.row.BinActivat !== "Y" ||
              params.row.BaseType === "21";
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
                e.key === "" ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (disabled) return;
                if (BinQty !== params.row.Quantity) {
                  setValue("selectedRowIndex", params.row.id);
                  setValue("BinLocation", params.row);
                  dispatch({ type: "OPEN", modal: "BinLocationOpen" });
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
                {TwoFormatter(BinQty)}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  setValue("BinLocation", params.row);
                  dispatch({ type: "OPEN", modal: "BinLocationOpen" });
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
      field: "LocationName",
      headerName: "Location",
      headerAlign: "center",
      align: "center",
      width: 150,
    },
    {
      field: "UomCode",
      headerName: "UOM Code",
      sortable: false,
      editable: false,
      minWidth: 150, // 👈 minimum width
      flex: 1, // 👈 auto expand when space available
      maxWidth: 200, // 👈 optional cap
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isDisabled =
          params.row.Status === "0" || params.row.UomEntry2 === "-1";
        let openUomCode = !!params.row.UomCode;
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
                if (isDisabled) return;
                if (!openUomCode) {
                  setValue("selectedRowIndex", params.row.id);
                  setUomcodeOpen(true);
                  if (!isDisabled) OumCodeListData(params.row.UomEntry2);
                }
              }
            }}
            sx={{ width: "100%", height: "100%" }}
          >
            <Grid item xs zeroMinWidth>
              <Tooltip title={params.row.UomCode || ""}>
                <Typography
                  noWrap
                  textAlign="center"
                  sx={{ fontSize: 13, cursor: "default" }}
                >
                  {params.row.UomCode || ""}
                </Typography>
              </Tooltip>
            </Grid>

            <Grid item>
              <IconButton
                size="small"
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  setUomcodeOpen(true);
                  if (!isDisabled) OumCodeListData(params.row.UomEntry2);
                }}
                disabled={isDisabled}
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
      field: "OpenQuantity",
      headerName: "OPEN QTY",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OnHand",
      headerName: "IN STOCK",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IsCommited",
      headerName: "RESERVE",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OnOrder",
      headerName: "ORDERED",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "BaseDocNum",
      headerName: "Base Document",
      headerAlign: "center",
      align: "center",
      width: 150,
    },
    {
      field: "Sr.batch",
      headerName: "Sr & Batch",
      width: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const {
          ManBtchNum,
          ManSerNum,
          BaseType,
          UomCode,
          WHSCode,
          InvQty,
          oBatchLines = [],
          oSerialLines = [],
        } = params.row;

        let label = "";
        let color = "default";
        let disabled = false;
        let savedQty = 0;

        if (ManBtchNum === "Y" && ManSerNum === "N") {
          label = "Batch";
          color = "primary";
          savedQty = oBatchLines.reduce(
            (sum, b) => sum + Number(b.BatchQty || 0),
            0,
          );
        } else if (ManBtchNum === "N" && ManSerNum === "Y") {
          label = "Serial";
          color = "success";
          savedQty = oSerialLines.length;
        } else {
          disabled = true;
        }

        if (BaseType === 21) {
          disabled = true;
        }

        /* ---------- Click handler ---------- */
        const handleClick = () => {
          if (!UomCode || !WHSCode) {
            Swal.fire({
              toast: true,
              icon: "warning",
              title:
                "Please select UoM and Warehouse Code before Creating Batch / Serial.",
              position: "center",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
            return;
          }

          if (label === "Batch") {
            handleOnBatch(params.row);
          } else if (label === "Serial") {
            handleOnSerial(params.row);
          }
        };

        const displayLabel =
          InvQty > 0
            ? `${label} (${TwoFormatter(savedQty)}/${TwoFormatter(InvQty)})`
            : label;
        return (
          <Tooltip title={`${displayLabel}`} arrow>
            <Chip
              label={displayLabel}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === "F2" ||
                  e.key === "" ||
                  (e.key === "Tab" && !e.shiftKey)
                ) {
                  e.preventDefault();
                  if (disabled) return;
                  if (InvQty !== savedQty) {
                    setValue("selectedRowIndex", params.row.id);
                    handleClick();
                  }
                }
              }}
              color={color}
              size="small"
              clickable={!disabled}
              onClick={handleClick}
              disabled={disabled}
              sx={{
                minWidth: 90,
                fontWeight: 600,
                borderRadius: "6px",
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
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

  const Services = [
    {
      id: 1,
      field: "id",
      headerName: "LINE NO",
      width: 50,
      renderCell: (params) => <Typography>{params.id + 1}</Typography>,
    },
    { field: "ServCode", headerName: "SERVICE CODE", width: 100 },
    {
      field: "ItemName",
      headerName: "SERVICE NAME",
      width: 200,
      sortable: false,
      editable: true,
    },
    {
      field: "PriceBefDi",
      headerName: "PRICE",
      width: 170,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",
      valueFormatter: (value, row) =>
        `${row.Currency} ${Number(value ?? row.PriceBefDi ?? 0).toFixed(2)}`,
    },

    {
      field: "AssblValue",
      headerName: "AssblValue",
      width: 120,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "Discount",
      headerName: "DISC(%)",
      width: 120,
      type: "number",
      headerAlign: "center",
      align: "center",
      editable: true,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "TaxCode",
      headerName: "Tax",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowIndex = params.row.id;
        let hasTaxcode = !!params.row.TaxCode;

        return (
          <Grid
            container // ✅ important
            alignItems="center" // vertical center
            justifyContent="center" // horizontal center
            gap={0.5}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                const lines = [...getValues("oLines")];
                lines[rowIndex] = {
                  ...lines[rowIndex],
                  TaxCode: "",
                  VatGroup: "",
                  VatPrcnt: 0,
                  VatSum: 0,
                  VatSumSy: 0,
                  VatSumFrgn: 0,
                  oTaxLines: [],
                  PriceAfVAT: lines[rowIndex].Price,
                };

                reset({ ...allFormData, oLines: lines });
              }

              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey) // 🔥 TAB opens modal
              ) {
                e.preventDefault(); // ⛔ stop grid navigation

                if (
                  params.row.Status === "0" ||
                  params.row.Quantity !== params.row.OpenQuantity ||
                  hasTaxcode
                )
                  return;
                setValue("selectedRowIndex", rowIndex);
                fetchTaxGetListData(
                  params.row.PostTax,
                  params.row.Excisable,
                  params.row.WHSCode,
                );
                setTaxOpen(true);
              }
            }}
            sx={{
              width: "100%",
              height: "100%",
              outline: "none",
            }}
          >
            {/* Tax Group text */}
            <Grid item xs>
              <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                {params.row.VatGroup || ""}
              </Typography>
            </Grid>

            {/* Icon */}
            <Grid item>
              <IconButton
                onClick={() => {
                  setValue("selectedRowIndex", rowIndex);
                  fetchTaxGetListData(
                    params.row.PostTax,
                    params.row.Excisable,
                    params.row.WHSCode,
                  );
                  setTaxOpen(true);
                }}
                disabled={params.row.Status === "0"}
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
      field: "taxCategory",
      headerName: "Tax",
      width: 50,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            onClick={() => {
              setValue("selectedRowIndex", params.row.id);
              taxCategoruFunc();
              // setTaxCategoryOpen(true);
            }}
            size="small"
            sx={{
              backgroundColor: "green",
              color: "white",
              "&:hover": {
                backgroundColor: "darkgreen",
              },
            }}
          >
            <AssessmentIcon fontSize="small" />
          </IconButton>
        );
      },
    },
    {
      field:
        curSource === "L"
          ? "LineTotal"
          : curSource === "S"
            ? "TotalSumSy"
            : getValues("Currency") === companyData.MainCurncy
              ? "LineTotal"
              : "TotalFrgn",
      headerName:
        curSource === "L"
          ? "TOTAL(LC)"
          : curSource === "S"
            ? "TOTAL(SC)"
            : getValues("Currency") === companyData.MainCurncy
              ? "TOTAL(LC)"
              : `TOTAL (${watch("Currency")})`,
      type: "number",
      width: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    { field: "BaseDocNum", headerName: "Base Document", width: 150 },

    {
      field: "Action",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <IconButton
          onClick={() => handleDeleteRow(params.row.id)}
          size="small"
          sx={{
            color: "error.main",
            backgroundColor: "error.light",
            "&:hover": {
              backgroundColor: "error.main",
              color: "#fff",
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];
  const columns = React.useMemo(
    () => (type === "I" ? Items : Services),
    [curSource, currency, type],
  );
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const TaxCotegoryColumn = [
    {
      id: 1,
      field: "StaCode",
      headerName: "TaxType",
      width: 120,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "TaxRate",
      headerName: "Rate",
      width: 120,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field:
        curSource === "L"
          ? "BaseSum"
          : curSource === "S"
            ? "BaseSumSys"
            : getValues("Currency") === companyData.MainCurncy
              ? "BaseSum"
              : "BaseSumFrg",
      headerName: "Base Amount",
      width: 120,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field:
        curSource === "L"
          ? "TaxSum"
          : curSource === "S"
            ? "TaxSumSys"
            : getValues("Currency") === companyData.MainCurncy
              ? "TaxSum"
              : "TaxSumFrgn",
      headerName: "Tax Amount",
      width: 120,
      editable: false,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "TaxAcct",
      headerName: "Purchases Account",
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
  ];

  //Model And Dialog open the Form Desing Logic
  const handleClickOpen = () => {
    if (type === "I") {
      setOpen(true);
      openItems();
    } else if (type === "S") {
      setServiceOpen(true);
      openServices();
    }
  };

  const closeModel = () => {
    setOpen(false);
    setSelectedRows([]);
  };

  // let {itemList}=useItem()
  const handleCellClick = async (ids) => {
    const selectedIDs = new Set(ids);

    const selectedRows = itemList
      .filter((row) => selectedIDs.has(row.DocEntry))
      .map((data) => {
        const PriceTerm = data.oLines.find(
          (itempprice) => itempprice.PriceList === allFormData.ListNum,
        );
        const Currency = PriceTerm?.Currency ?? "0";
        const PriceBefDi = PriceTerm?.Price ?? "0";
        const sysRate = parseFloat(SysRate);
        return {
          DocEntry: data.DocEntry,
          ItemCode: data.ItemCode,
          ItemName: data.ItemName,
          ChapterID: data.ChapterID,
          Price: PriceBefDi,
          Quantity: 1,
          OpenQuantity: 1,
          Bin: 1,
          AssblValue: data.AssblValue,
          Discount: 0,
          LineTotal: PriceBefDi,
          TotalSumSy: sysRate > 0 ? PriceBefDi / sysRate : 0,
          TotalFrgn: DocRate > 0 ? PriceBefDi / DocRate : 0,
          Currency: Currency,

          PriceBefDi: PriceBefDi,
          OnHand: data.OnHand,
          IsCommited: data.IsCommited,
          OnOrder: data.OnOrder,
          WHSCode: data.DefaultWhs || "",
          GLMethod: data.GLMethod,
          AcctCode: data.BalInvntAc,
          UomEntry2: data.UgpEntry || "",
          UomEntry: data.PUoMEntry,
          UomCode:
            data.UgpEntry === "-1"
              ? "Manual"
              : data.PUOMCode === "0"
                ? ""
                : data.PUOMCode,
          PUoMEntry: data.PUoMEntry || "",
          Status: "1",
          Excisable: data.Excisable,
          PostTax: data.GSTRelevnt,
          NumInBuy: data.NumInBuy,
          UOMFactor: ValueFormatter(data.UOMFactor, 6),
          GstTaxCtg: data.GstTaxCtg,
          ManBtchNum: data.ManBtchNum,
          ManSerNum: data.ManSerNum,
          NumPerMsr: ValueFormatter(
            data.PUOMFactor > 0 ? data.UOMFactor / data.PUOMFactor : "1.000000",
            6,
          ),
          InvQty: ValueFormatter(
            data.PUOMFactor > 0 ? data.UOMFactor / data.PUOMFactor : "1.000000",
            6,
          ),
          OpenInvQty: ValueFormatter(
            data.PUOMFactor > 0 ? data.UOMFactor / data.PUOMFactor : "1.000000",
            6,
          ),
        };
      });

    // 2. Enrich with LocationWise data
    const locationWise = selectedRows.map((item) => {
      const matchingLoc = warehouseData.find(
        (row) => row.WHSCode === item.WHSCode,
      );
      return {
        ...item,
        LocCode: matchingLoc?.Location ?? "",
        LocationName: matchingLoc?.LocationName ?? "",
        DftBinAbs: matchingLoc?.DftBinAbs,
        BinActivat: matchingLoc?.BinActivat,
      };
    });

    // 3. Update selected rows state based on total selection (selectedIDs)
    setSelectedRows((prev) => {
      // Filter only rows whose DocEntry is still selected
      const retainedRows = prev.filter((row) => selectedIDs.has(row.DocEntry));

      // Merge new rows (from this page), avoiding duplicates
      locationWise.forEach((row) => {
        if (!retainedRows.some((r) => r.DocEntry === row.DocEntry)) {
          retainedRows.push(row);
        }
      });

      return retainedRows;
    });
  };

  // 1️⃣ Find Rate by Currency
  const findRate = (data, curr) =>
    companyData?.MainCurncy === curr
      ? 1
      : parseFloat(data?.find((ex) => ex.Currency === curr)?.Rate) || 0;
  const onSubmitLineCurrency = (data) => {
    // If lines already exist → open purchase modal
    if (OlinesData.length > 0) {
      handleOpenPurchase("NEW", data);

      return;
    }

    // READ complete current form (header + lines)
    const allFormData = getValues();

    // ===============================
    // 🔹 SYSTEM RATE
    // ===============================
    const SysRateObj = data.find(
      (ex) => ex.Currency === companyData.SysCurrncy,
    );

    const SystemRate =
      companyData.SysCurrncy === companyData.MainCurncy
        ? 1
        : parseFloat(SysRateObj?.Rate) || 0;

    // ===============================
    // 🔹 DOCUMENT CURRENCY RATE
    // ===============================
    const DocRateObj = data.find((ex) => ex.Currency === currency);

    const DocRate =
      currency === companyData.MainCurncy
        ? 1
        : parseFloat(DocRateObj?.Rate) || 0;

    // ===============================
    // 🔹 UPDATE EACH LINE RATE
    // ===============================
    const UpdatedLines = (allFormData.oLines || []).map((item) => ({
      ...item,
      Rate: findRate(data, item.Currency),
    }));
    // ---------------------------
    // UPDATE EXPENSE LINES (oExpLines)
    // ---------------------------

    // ===============================
    // 🔹 OVERRIDE ONLY REQUIRED FIELDS
    // ===============================
    const mergedData = {
      ...allFormData, // keep everything
      SysRate: SystemRate,
      DocRate: DocRate,
      oLines: UpdatedLines,
    };

    // Apply updated form in one go
    reset(mergedData);

    // ===============================
    // 🔹 Recalculate totals
    // ===============================
    CalculateRate();
  };

  const handleBinlocationSubmit = (rowsFromModal) => {
    const selectedRow = getValues("BinLocation");
    const updatedOLines = (oLines || []).map((row, index) =>
      index === selectedRow.id
        ? {
            ...row,
            oDocBinLocationLines: (rowsFromModal || []).map((binitem) => ({
              UserId: user.UserId,
              CreatedBy: user.UserName,
              ModifiedBy: user.UserName,
              Status: 1,
              MessageID: 0,
              BinAbs: parseFloat(binitem.DocEntry),
              SnBMDAbs: 0,
              Quantity: binitem.allocated,
              ITLEntry: 0,
              BinCode: binitem.BinCode,
            })),
          }
        : row,
    );

    setValue("oLines", updatedOLines);

    dispatch({ type: "CLOSE", modal: "BinLocationOpen" });
  };
  const onSubmit = async () => {
    try {
      const currentData = getValues();
      const updatedLines = [
        ...(currentData.oLines || []),
        ...(selectedRows || []),
      ];
      if (selectedRows.length === 0) {
        Swal.fire({
          title: "ITEM",
          text: `Please Select Items.`,
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      if (type === "S") {
        setValue("oLines", updatedLines);
        handleClose();
        return;
      }
      const Currency = updatedLines?.[0]?.Currency;
      if (!Currency || Currency === "0") {
        console.warn("No Currency found in line items.");
        Swal.fire({
          title: "Currency Not Found",
          text: `No Currency ${Currency}  found in line items.`,
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }
      const records = data[docDate] || [];
      let recordRateWise = records.find((item) => item.Currency === Currency);
      let DocRateLine =
        companyData.MainCurncy === Currency
          ? "1"
          : (recordRateWise?.Rate ?? "0");
      const DataLineCurrency = [
        {
          Type: "LineRate",
          DocEntry: recordRateWise?.DocEntry ?? "0",
          RateDate: docDate,
          Currency: Currency,
          Rate: DocRateLine,
        },
      ];

      console.log("DataLineCurrency", DataLineCurrency);
      if (DocRateLine <= 0) {
        setAllDataCopyRateLine(DataLineCurrency);
        // Open modal AFTER React has updated state
        setTimeout(() => {
          dispatch({ type: "OPEN", modal: "exchaneRateLineCpyform" });
        }, 0);
        Swal.fire({
          title: "Rate Not Found",
          text: "No exchange rate available for the selected currency/date.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
      // if (DocRateLine > 0) {
      const UpdatedLines = updatedLines.map((item) => ({
        ...item,
        Rate: findRate(records, item.Currency),
      }));
      setValue("oLines", UpdatedLines);
      console.log("oLines", UpdatedLines);
      const WHSCode = UpdatedLines?.[0]?.WHSCode ?? "";
      const warehouse = warehouseData.find((w) => w.WHSCode === WHSCode);
      if (warehouse) {
        const CompnyAddr = [
          warehouse.Street,
          warehouse.Block,
          warehouse.City,
          warehouse.State,
          warehouse.ZipCode,
          warehouse.Country,
        ]
          .filter((v) => v?.trim())
          .join(", ");
        setValue("CompnyAddr", CompnyAddr);
        setValue("BlockS", warehouse.Block ?? "");
        setValue("StreetS", warehouse.Street ?? "");
        setValue("CityS", warehouse.City ?? "");
        setValue("ZipCodeS", warehouse.ZipCode ?? "");
        setValue("StateS", warehouse.State ?? "");
        setValue("CountryS", warehouse.Country ?? "");
        const updatedTaxLines = (currentData.oTaxExtLines || []).map((add) => ({
          ...add,
          BlockS: warehouse.Block ?? "",
          StreetS: warehouse.Street ?? "",
          CityS: warehouse.City ?? "",
          StateS: warehouse.State ?? "",
          CountryS: warehouse.Country ?? "",
          ZipCodeS: warehouse.ZipCode ?? "",
        }));
        setValue("oTaxExtLines", updatedTaxLines);
      }

      // ✅ Discount recalculation
      const discountValue = parseFloat(currentData.Discount) || 0;
      if (
        Array.isArray(UpdatedLines) &&
        UpdatedLines.length > 0 &&
        Number(discountValue) > 0
      ) {
        calculateDiscountAmt(discountValue);
      }
      CalculateRate();
      closeModel();
      // }
    } catch (error) {
      console.error("Error in onSubmit:", error);
    }
  };

  const handleServiceRowClick = (id) => {
    const selectedIDs = new Set(id);
    setValue("CurrencyLine", currency);
    const selectedRow = serviceList
      .filter((row) => selectedIDs.has(row.DocEntry))
      .map((data) => ({
        ServCode: data.ServCode,
        ItemName: data.ServName,
        Currency: currency,
        LineTotal: data.Price || 0,
        Quantity: "1",
        AssblValue: 0,
      }));
    setSelectedRows(selectedRow);
  };
  const handleFrightCellClick = (id) => {
    const selectedIDs = new Set(id);
    const selectedRow = frieghtdata
      .filter((row) => selectedIDs.has(row.DocEntry))
      .map((data) => {
        const LineTotal = parseFloat(data.LineTotal) || 0;
        const sysRate = parseFloat(SysRate);
        const activeCurrency =
          curSource === "L"
            ? companyData.MainCurncy
            : curSource === "S"
              ? companyData.SysCurrncy
              : currency;
        return {
          RevAcct: data.RevAcct,
          LineTotal: LineTotal || 0,
          TotalSumSy: sysRate > 0 ? LineTotal / sysRate : 0,
          TotalFrgn: sysRate > 0 ? LineTotal / sysRate : 0,
          VatSum: ValueFormatter(data.VatSum),
          VatSumSy: ValueFormatter(data.VatSum),
          VatSumFrgn: ValueFormatter(data.VatSum),
          TaxCode: data.TaxCode || 0,
          GrsAmount: ValueFormatter(data.GrsAmount || 0),
          Status: "1",
          DocEntry: data.DocEntry, // Add DocEntry for reference
          Currency: activeCurrency,
        };
      });
    setSelectedRows(selectedRow);
  };

  const handleSave = () => {
    const updatedData = {
      ...allFormData,
      oExpLines: [...allFormData.oExpLines, ...selectedRows],
    };
    reset(updatedData);
    closeFreightModel();
  };

  function taxCalculation(
    LineTotal,
    AssblValue,
    DocTotal,
    UnitPrice,
    Quantity,
    TaxCode,
  ) {
    const updatedData = {
      VatSum: 0,
      VatSumSy: 0,
      VatSumFrgn: 0,
      oTaxLines: [],
      TaxCode: TaxCode || "",
      VatPrcnt: 0,
    };
    const taxcodeObj = taxcode.find((item) => item.DocEntry === TaxCode);
    if (!taxcodeObj) return updatedData;
    const effectiveQuantity = AssblValue <= 0 ? 1 : Quantity;
    const variables = {
      LineTotal,
      Quantity: effectiveQuantity,
      AssblValue: AssblValue > 0 ? AssblValue : LineTotal,
      DocTotal,
      UnitPrice,
      RelaTeType: 1,
    };
    let finalTotal = 0;
    const oTaxLines = [];
    taxcodeObj.oLines.forEach((tax) => {
      let {
        BaseAmtFormuale: formula,
        TaxAmtKey,
        TaxType,
        LineNum,
        PurchTax,
        Rate,
      } = tax;
      Rate = parseFloat(Rate);
      for (const key in variables) {
        formula = formula.replace(new RegExp(key, "g"), variables[key]);
      }
      const baseAmount = parseFloat(eval(formula));
      const taxAmount = baseAmount * (Rate / 100);
      finalTotal += taxAmount;
      variables[TaxAmtKey] = ValueFormatter(taxAmount);
      variables.TotalTax = (variables.TotalTax || 0) + taxAmount;
      updatedData.VatPrcnt += Rate;
      const taxObj = {
        TaxRate: Rate,
        TaxSum: taxAmount.toFixed(3),
        TaxSumSys: SysRate > 0 ? ValueFormatter(taxAmount / SysRate) : 0,
        TaxSumFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? ValueFormatter(taxAmount)
            : DocRate > 0
              ? ValueFormatter(taxAmount / DocRate)
              : 0,
        StcCode: taxcodeObj.DocEntry,
        staType: TaxType,
        StaCode: TaxAmtKey.replace(/_?TaxAmt$/, ""),
        BaseSum: ValueFormatter(baseAmount),
        BaseSumSys: SysRate > 0 ? ValueFormatter(baseAmount / SysRate) : 0,
        BaseSumFrg:
          getValues("Currency") === companyData.MainCurncy
            ? ValueFormatter(baseAmount)
            : DocRate > 0
              ? ValueFormatter(baseAmount / DocRate)
              : 0,
        TaxAcct: PurchTax,
        RelateType: 1,
        RelateEntry: LineNum,
      };
      oTaxLines.push(taxObj);
    });
    updatedData.VatSum = finalTotal;
    updatedData.VatSumSy = SysRate > 0 ? finalTotal / SysRate : 0;
    updatedData.VatSumFrgn = DocRate > 0 ? finalTotal / DocRate : 0;
    updatedData.oTaxLines = oTaxLines;

    return updatedData;
  }

  // ------------------------------------------------------------------------------
  const selectUomCode = async (UomCode, UomEntry, UomName, AltQty, BaseQty) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    setok("UPDATE");
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        const originalRow = selectedRowsPurchase[index] || [];
        const originalQuantity = originalRow?.InvQty ?? 0;
        const newnum = AltQty / BaseQty;
        const oBaseNum = line.UOMFactor;
        const oInvNumPerMsr = ValueFormatter(oBaseNum / newnum, 6);
        const InvQty = ValueFormatter(oInvNumPerMsr * line.Quantity, 6);
        if (line.BaseType > 1) {
          let newQuantity = originalQuantity / oInvNumPerMsr;
          const isMainCurrency = currency === companyData.MainCurncy;
          const CalcLines = CalCulation(
            newQuantity,
            line.Price,
            line.Discount,
            line.Rate,
          );
          if (curSource === "C") {
            if (isMainCurrency) {
              line.LineTotal = line.Rate * CalcLines.LineTotal;
              line.TotalSumSy = line.LineTotal / SysRate;
              line.TotalFrgn = 0;
            } else {
              line.TotalFrgn = line.Rate * CalcLines.TotalFrgn;
              line.TotalSumSy = line.TotalFrgn / SysRate;
              line.LineTotal = line.TotalFrgn * DocRate;
            }
          } else {
            line.LineTotal = line.LineTotal || 0;
            line.TotalSumSy = line.TotalSumSy || 0;
            line.TotalFrgn = line.TotalFrgn || 0;
          }
          if (line.TaxCode > 0) {
            const taxLines = taxCalculation(
              line.LineTotal,
              line.AssblValue,
              getValues("DocTotal"),
              line.PriceBefDi,
              line.Quantity,
              line.TaxCode,
            );
            line.Quantity = newQuantity;
            line.OpenQuantity = newQuantity;
            line.oTaxLines = taxLines.oTaxLines;
            line.VatPrcnt = taxLines.VatPrcnt;
            line.VatSum = taxLines.VatSum;
            line.VatSumSy = taxLines.VatSumSy;
            line.VatSumFrgn = taxLines.VatSumFrgn;
            line.PriceAfVAT = ValueFormatter(
              line.Price + line.Price * (line.VatPrcnt / 100),
            );
          }
        }
        return {
          ...line,
          UomEntry: UomEntry,
          UomCode: UomCode,
          unitMsr2: UomName,
          NumPerMsr: oInvNumPerMsr,
          InvQty: InvQty,
          OpenInvQty: InvQty,
          // PriceBefDi: newPriceBefDi.toFixed(3),
          // Price: Price.toFixed(3),
          // Discount: "",
          VatSum: VatSum,
          // PriceAfVAT: priceWithVAT,
        };
      }
      return line;
    });

    // Reset form with updated lines
    setValue("oLines", updatedLines, {
      shouldDirty: true,
      shouldValidate: false,
    });

    if (discPercent > 0) {
      calculateDiscountAmt(discPercent);
    }

    setUomcodeOpen(false);
  };
  // ------------------------------------------------------------------------------
  const handleSelectFrieghtTax = (id) => {
    setok("UPDATE");
    const currentRowIndex = getValues("selectedRowIndex");
    const lines = getValues("oExpLines");
    const updatedLines = lines.map((line, index) => {
      if (index !== currentRowIndex) return line;
      const updatedData = {
        ...line,
        TaxCode: id.row.DocEntry,
        VatGroup: id.row.TaxCode,
        VatPrcnt: id.row.Rate,
      };
      const tax = taxCalculation(
        updatedData.LineTotal,
        updatedData.LineTotal,
        updatedData.DocTotal,
        updatedData.LineTotal,
        1,
        updatedData.TaxCode,
      );
      updatedData.oTaxLines = tax.oTaxLines;
      updatedData.VatSum = ValueFormatter(tax.VatSum);
      updatedData.VatSumSy = ValueFormatter(tax.VatSumSy);
      updatedData.VatSumFrgn = ValueFormatter(tax.VatSumFrgn);
      updatedData.GrsAmount = ValueFormatter(
        +updatedData.LineTotal + +updatedData.VatSum,
      );
      updatedData.GrsSC = ValueFormatter(
        +updatedData.TotalSumSy + +updatedData.VatSumSy,
      );
      updatedData.GrsFC = ValueFormatter(
        +updatedData.TotalFrgn + +updatedData.VatSumFrgn,
      );
      return updatedData;
    });

    reset({
      ...getValues(),
      oExpLines: updatedLines,
    });
    dispatch({ type: "CLOSE", modal: "TaxFrieghtOpen" });
  };
  const processFreightRowUpdate = (newRow, oldRow) => {
    const updatedData = { ...oldRow, ...newRow };
    const activeCurrency =
      curSource === "L"
        ? companyData.MainCurncy
        : curSource === "S"
          ? companyData.SysCurrncy
          : currency;
    switch (curSource) {
      case "L":
        updatedData.TotalFrgn = 0;
        updatedData.TotalSumSy = ValueFormatter(
          updatedData.LineTotal / SysRate,
        );
        break;
      case "S":
        updatedData.LineTotal = ValueFormatter(
          updatedData.TotalSumSy * SysRate,
        );
        updatedData.TotalFrgn = ValueFormatter(updatedData.LineTotal / DocRate);
        break;
      case "C":
        if (currency === companyData.MainCurncy) {
          updatedData.TotalFrgn = 0;
          updatedData.TotalSumSy = ValueFormatter(
            updatedData.LineTotal / SysRate,
          );
        } else {
          updatedData.LineTotal = ValueFormatter(
            updatedData.TotalFrgn * DocRate,
          );
          updatedData.TotalSumSy = ValueFormatter(
            updatedData.LineTotal / SysRate,
          );
        }
        break;
      default:
        break;
    }
    // ---------------- TAX calculation ----------------
    const tax = taxCalculation(
      updatedData.LineTotal,
      updatedData.LineTotal,
      updatedData.DocTotal,
      updatedData.LineTotal,
      1,
      updatedData.TaxCode,
    );

    updatedData.oTaxLines = tax.oTaxLines;
    updatedData.VatSum = ValueFormatter(tax.VatSum);
    updatedData.VatSumSy = ValueFormatter(tax.VatSumSy);
    updatedData.VatSumFrgn = ValueFormatter(tax.VatSumFrgn);

    // ---------------- Gross ----------------
    updatedData.GrsAmount = ValueFormatter(
      +updatedData.LineTotal + +updatedData.VatSum,
    );
    updatedData.GrsSC = ValueFormatter(
      +updatedData.TotalSumSy + +updatedData.VatSumSy,
    );
    updatedData.GrsFC = ValueFormatter(
      +updatedData.TotalFrgn + +updatedData.VatSumFrgn,
    );
    updatedData.Currency = activeCurrency;
    const updatedLines = getValues("oExpLines").map((d, i) =>
      i === oldRow.id ? updatedData : d,
    );
    reset({ ...allFormData, oExpLines: updatedLines });
    return updatedData;
  };
  const handleFreightKeyDown = (params, event) => {
    const api = apiRef.current;
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

    // ✅ Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);
  };

  let handleFrightSubmit = (data) => {
    let totals = {
      TotalExpSC: 0,
      TotalExpns: 0,
      TaxOnExp: 0,
      TaxOnExpSc: 0,
      TaxOnExpFc: 0,
      TotalExpFC: 0,
    };
    const updated = data.oExpLines.map((line) => {
      totals.TotalExpSC += parseFloat(line.TotalSumSy) || 0;
      totals.TotalExpns += parseFloat(line.LineTotal) || 0;
      totals.TaxOnExp += parseFloat(line.VatSum) || 0;
      totals.TaxOnExpSc += parseFloat(line.VatSumSy) || 0;
      totals.TaxOnExpFc += parseFloat(line.VatSumFrgn) || 0;
      totals.TotalExpFC += parseFloat(line.TotalFrgn) || 0;
      return line;
    });
    reset({ ...allFormData, oExpLines: updated });
    Object.entries(totals).forEach(([key, val]) =>
      setValue(key, ValueFormatter(val)),
    );

    setRollBackoExpLines(updated);
    setFrieghtopen(false);
  };
  const handleFrightClose = () => {
    setFrieghtopen(false);
    setValue("oExpLines", RollBackoExpLines);
  };

  const handleDocRateChange = (e) => {
    let NewRate = parseFloat(e.target.value) || 0;
    if (NewRate < 0) NewRate = 0;
    setValue("DocRate", NewRate);
    // CalculateRate(NewRate);
  };

  const CalculateRate = useCallback(() => {
    if (!DocRate || DocRate <= 0) return;
    const isSysCurrency = currency === companyData.SysCurrncy;
    const allFormData = getValues();
    let updatedData = { ...allFormData };
    if (isSysCurrency) {
      updatedData.SysRate = DocRate;
    }
    if (
      (allFormData?.oLines?.length > 0 && curSource === "C") ||
      curSource === "S"
    ) {
      updatedData.oLines = allFormData.oLines.map((line) => {
        let TotalFrgn,
          LineTotal,
          TotalSumSy = 0;
        let Price = type === "S" ? line.Price : line.Price * line.Quantity;
        switch (curSource) {
          case "L":
            TotalFrgn = line.TotalFrgn;
            LineTotal = line.LineTotal;
            TotalSumSy = line.TotalSumSy;
            break;
          case "S":
            LineTotal = line.LineTotal;
            TotalSumSy = ValueFormatter(LineTotal / SysRate, 6);
            TotalFrgn = line.TotalFrgn;
            break;
          case "C":
            if (currency === companyData.MainCurncy) {
              TotalFrgn = ValueFormatter(0);
              LineTotal = ValueFormatter(line.LineTotal);
              TotalSumSy = ValueFormatter(line.LineTotal / SysRate);
            } else {
              if (type === "S") {
                TotalFrgn =
                  currency === line.Currency
                    ? ValueFormatter(Price)
                    : line.LineTotal / DocRate;
                LineTotal = ValueFormatter(TotalFrgn * DocRate);
                TotalSumSy = ValueFormatter(LineTotal / SysRate);
              } else {
                if (type === "S") {
                  TotalFrgn =
                    currency === line.Currency
                      ? ValueFormatter(Price)
                      : line.LineTotal / DocRate;
                  LineTotal = ValueFormatter(TotalFrgn * DocRate);
                  TotalSumSy = ValueFormatter(LineTotal / SysRate);
                } else {
                  if (type === "S") {
                    TotalFrgn =
                      currency === line.Currency
                        ? ValueFormatter(Price)
                        : line.LineTotal / DocRate;
                    LineTotal = ValueFormatter(TotalFrgn * DocRate);
                    TotalSumSy = ValueFormatter(LineTotal / SysRate);
                  } else {
                    const latestDocRate = getValues("DocRate");
                    LineTotal = ValueFormatter(Price * line.Rate);
                    TotalFrgn =
                      currency === line.Currency
                        ? ValueFormatter(Price)
                        : ValueFormatter(LineTotal / latestDocRate);
                    TotalSumSy = isSysCurrency
                      ? ValueFormatter(LineTotal / latestDocRate)
                      : ValueFormatter(LineTotal / SysRate);
                  }
                }
              }
            }
            break;
          default:
          // TotalFrgn = line.TotalFrgn;
          // LineTotal = line.LineTotal;
          // TotalSumSy = line.TotalSumSy;
        }
        return {
          ...line,
          LineTotal: LineTotal,
          TotalSumSy: TotalSumSy,
          TotalFrgn: TotalFrgn,
          Rate:
            line.Currency === companyData.SysCurrncy
              ? updatedData.SysRate
              : line.Currency === currency
                ? updatedData.DocRate
                : line.Rate,
        };
      });
    }

    if (
      (allFormData?.oExpLines?.length > 0 && curSource === "C") ||
      curSource === "S" ||
      curSource === "L"
    ) {
      updatedData.oExpLines = allFormData.oExpLines.map((line) => {
        let TotalFrgn,
          LineTotal,
          TotalSumSy = 0;
        let Currency = "INR";
        switch (curSource) {
          case "L":
            LineTotal = line.LineTotal;
            TotalFrgn = "0";
            TotalSumSy = line.TotalSumSy;
            Currency = companyData.MainCurncy;
            break;
          case "S":
            LineTotal = line.LineTotal;
            TotalSumSy = ValueFormatter(LineTotal / SysRate, 3);
            TotalFrgn = line.TotalFrgn;
            Currency = companyData.SysCurrncy;
            break;
          case "C":
            if (currency === companyData.MainCurncy) {
              LineTotal = ValueFormatter(line.LineTotal);
              TotalFrgn = 0;
              TotalSumSy = ValueFormatter(LineTotal / SysRate);
              Currency = companyData.MainCurncy;
            } else {
              Currency = currency;
              TotalFrgn =
                currency === line.Currency
                  ? line.TotalFrgn
                  : line.LineTotal / DocRate;
              LineTotal = TotalFrgn * DocRate;
              TotalSumSy = ValueFormatter(LineTotal / SysRate);
            }
            break;
          default:
            TotalFrgn = line.TotalFrgn;
            LineTotal = line.LineTotal;
            TotalSumSy = line.TotalSumSy;
            Currency = line.Currency;
        }
        const taxFright = taxCalculation(
          LineTotal,
          (updatedData.AssblValue = LineTotal),
          line.DocTotal,
          (updatedData.PriceBefDi = LineTotal),
          (updatedData.Quantity = 1),
          line.TaxCode,
        );
        const oTaxLinesF = taxFright.oTaxLines;
        const VatSum = ValueFormatter(taxFright.VatSum);
        const VatSumSy = ValueFormatter(taxFright.VatSumSy);
        const VatSumFrgn = ValueFormatter(taxFright.VatSumFrgn);
        const fields = [
          { key: "GrsAmount", vat: VatSum, total: LineTotal },
          { key: "GrsSC", vat: VatSumSy, total: TotalSumSy },
          { key: "GrsFC", vat: VatSumFrgn, total: TotalFrgn },
        ];
        fields.forEach(({ key, vat, total }) => {
          const vatValue = parseFloat(vat) || 0;
          const totalValue = parseFloat(total) || 0;
          line[key] = ValueFormatter(vatValue + totalValue);
        });
        return {
          ...line,
          LineTotal: ValueFormatter(LineTotal),
          TotalSumSy: ValueFormatter(TotalSumSy),
          TotalFrgn: ValueFormatter(TotalFrgn),
          Currency: Currency,
          oTaxLines: oTaxLinesF,
          VatSum: VatSum,
          VatSumSy: VatSumSy,
          VatSumFrgn: VatSumFrgn,
        };
      });
    }
    setRollBackoExpLines(updatedData.oExpLines);
    reset(updatedData);
    const totals = updatedData.oExpLines.reduce(
      (acc, current) => ({
        TotalExpns: acc.TotalExpns + (parseFloat(current.LineTotal) || 0),
        totalExpFC: acc.totalExpFC + (parseFloat(current.TotalFrgn) || 0),
        totalExpSC: acc.totalExpSC + (parseFloat(current.TotalSumSy) || 0),
        taxOnExp: acc.taxOnExp + (parseFloat(current.VatSum) || 0),
        taxOnExpFc: acc.taxOnExpFc + (parseFloat(current.VatSumFrgn) || 0),
        taxOnExpSc: acc.taxOnExpSc + (parseFloat(current.VatSumSy) || 0),
      }),
      {
        TotalExpns: 0,
        totalExpFC: 0,
        totalExpSC: 0,
        taxOnExp: 0,
        taxOnExpFc: 0,
        taxOnExpSc: 0,
      },
    );
    setValue("TotalExpns", ValueFormatter(totals.TotalExpns));
    setValue("TotalExpFC", ValueFormatter(totals.totalExpFC));
    setValue("TotalExpSC", ValueFormatter(totals.totalExpSC));
    setValue("TaxOnExp", ValueFormatter(totals.taxOnExp));
    setValue("TaxOnExpFc", ValueFormatter(totals.taxOnExpFc));
    setValue("TaxOnExpSc", ValueFormatter(totals.taxOnExpSc)); // Fixed: was setting TaxOnExpFc twice
  }, [
    getValues("VatSumFC"),
    getValues("VatSumSy"),
    SysRate,
    DocRate,
    discPercent,
    docDate,
  ]);
  useEffect(() => {
    if (DocRate) {
      CalculateRate(DocRate);
    }
  }, [DocRate, SysRate]);
  const handleDiscountAmtChange = (event) => {
    let rawValue = event?.target?.value ?? "";
    const numeric = parseFloat(String(rawValue).replace(/[^0-9.-]/g, ""));
    let newValue = isNaN(numeric) ? 0 : numeric;
    const applyDiscount = (field, total, useFormatter = false) => {
      if (newValue < 0) newValue = 0;
      if (newValue > total) newValue = total;
      setValue(field, newValue.toFixed(3));
      const ratio = total > 0 ? newValue / total : 0;
      const percent = useFormatter
        ? ValueFormatter(ratio) * 100
        : ValueFormatter(ratio);
      setValue("Discount", percent);
      calculateDiscountAmt(percent);
    };
    if (curSource === "C") {
      if (currency === companyData.MainCurncy) {
        applyDiscount(
          "DiscountAmt",
          parseFloat(getValues("TotalBefDisc")) || 0,
          true,
        );
      } else {
        applyDiscount(
          "DiscSumFC",
          parseFloat(allFormData.TotalBefDiscFrgn) || 0,
          true,
        );
      }
    } else if (curSource === "L") {
      applyDiscount("DiscountAmt", parseFloat(getValues("TotalBefDisc")) || 0);
    } else if (curSource === "S") {
      applyDiscount(
        "DiscSumSy",
        parseFloat(allFormData.TotalBefDiscSy) || 0,
        true,
      );
    }
  };
  const handleDiscountChange = (e) => {
    let discount = parseFloat(e.target.value) || 0;
    if (discount < 0) discount = 0;
    if (discount > 100) discount = 100; // Limit discount to 100%
    setValue("Discount", discount.toFixed(3));
    const TotalBefDisc = parseFloat(getValues("TotalBefDisc")) || 0;
    const DiscountAmt = (TotalBefDisc * discount) / 100;
    setValue("DiscountAmt", DiscountAmt.toFixed(2)); // Format DiscountAmt to 2 decimal places
    const totalBefDiscSy = parseFloat(getValues("TotalBefDiscSy")) || 0;
    const DiscSumSy = (totalBefDiscSy * discount) / 100;
    setValue("DiscSumSy", DiscSumSy.toFixed(2)); // Format DiscountAmt to 2 decimal places
    const DocTotalFC = parseFloat(getValues("TotalBefDiscFrgn")) || 0;
    const DiscSumFC = (DocTotalFC * discount) / 100;
    setValue("DiscSumFC", DiscSumFC.toFixed(2)); // Format DiscountAmt to 2 decimal places
    calculateDiscountAmt(discount);
  };

  const calculateDiscountAmt = (discPercent) => {
    if (parseFloat(discPercent) >= 0) {
      const allFormData = getValues();
      let updatedOLines = [];
      let dissum = 0; // Sum of all line-level discount amounts
      let SumSy = 0;
      let SumFC = 0; // Foreign Currency
      const format = ValueFormatter;
      allFormData.oLines.forEach((i) => {
        let LineTotal = i.LineTotal - (i.LineTotal * (discPercent || 0)) / 100;
        let INMPrice = i.Price - (i.Price * (discPercent || 0)) / 100;
        let StockSum = INMPrice * i.Quantity;
        let StockSumSc = StockSum / SysRate;
        let StockSumFc = StockSum / DocRate;
        let TotalSumSy =
          i.TotalSumSy - (i.TotalSumSy * (discPercent || 0)) / 100;
        let DisAmt = i.LineTotal - LineTotal;
        let SumSyAmt = i.TotalSumSy - TotalSumSy;

        let DisFCAmt = i.TotalFrgn
          ? i.TotalFrgn - (i.TotalFrgn * (discPercent || 0)) / 100
          : 0;
        let SumFcAmt = i.TotalFrgn - DisFCAmt;
        dissum += DisAmt;
        SumSy += SumSyAmt;
        SumFC += SumFcAmt;
        const headerDisc = taxCalculation(
          LineTotal,
          i.AssblValue,
          i.DocTotal,
          i.PriceBefDi,
          i.Quantity,
          i.TaxCode,
        );
        const Vatsum = format(headerDisc.VatSum);
        const VatSumSy = format(headerDisc.VatSumSy);
        const VatSumFrgn = format(headerDisc.VatSumFrgn);
        updatedOLines.push({
          ...i,
          oTaxLines: headerDisc.oTaxLines,
          VatSum: format(Vatsum),
          VatSumSy: format(VatSumSy),
          VatSumFrgn: format(VatSumFrgn),
          INMPrice: format(INMPrice || 0),
          StockSum: format(StockSum),
          StockSumSc: format(StockSumSc),
          StockSumFc: format(StockSumFc),
        });
      });
      setValue("DiscountAmt", dissum.toFixed(3));
      setValue("DiscSumSy", SumSy.toFixed(3));
      setValue("DiscSumFC", SumFC.toFixed(3));
      setValue("oLines", updatedOLines);
    }
  };
  // const handleChange = (e, row) => {
  //   const { name, value } = e.target;
  //   setok("UPDATE");
  //   const quantity = selectedRowsPurchase.map((item) => item.Quantity);
  //   const updatedLines = getValues("oLines").map((data, index) => {
  //     if (row.id !== index) return data;
  //     const updatedData = { ...data, [name]: value };
  //     const originalQuantity = quantity[index];
  //     if (parseFloat(updatedData.BaseType) >= 1) {
  //       if (
  //         name === "Quantity" &&
  //         parseFloat(value) > parseFloat(originalQuantity)
  //       ) {
  //         return data;
  //       }
  //     }
  //     if (allFormData.DocEntry) {
  //       if (name === "Quantity") {
  //         updatedData.OpenQuantity =
  //           parseFloat(updatedData.Quantity) -
  //           parseFloat(data.Quantity) +
  //           parseFloat(data.OpenQuantity);
  //       }
  //     } else {
  //       if (name === "Quantity") {
  //         updatedData.OpenQuantity = value;
  //         updatedData.Quantity = Math.min(Math.max(value, 0));
  //         updatedData.InvQty = ValueFormatter(value * updatedData.NumPerMsr, 6);
  //       }
  //     }
  //     if (name === "PriceBefDi") {
  //       updatedData.PriceBefDi = Math.min(Math.max(value, 0));
  //       updatedData.Currency = currency;
  //       updatedData.Currency = currency;
  //       const Rate = companyData.MainCurncy === currency ? "1" : DocRate;
  //       setValue("DocRateLine", Rate);
  //     }
  //     if (name === "Discount") {
  //       updatedData.Discount = Math.min(Math.max(value, 0), 100);
  //     }

  //     if (updatedData.PostTax === "Y") {
  //       if (name === "AssblValue") {
  //         updatedData.AssblValue = Math.min(Math.max(value, 0));
  //       }
  //     } else {
  //       updatedData.AssblValue = data.AssblValue;
  //     }
  //     const CalcLines = CalCulation(
  //       updatedData.Quantity,
  //       updatedData.PriceBefDi,
  //       updatedData.Discount
  //     );
  //     updatedData.Price = CalcLines.discountedPrice;
  //     updatedData.INMPrice = CalcLines.discountedPrice;
  //     switch (curSource) {
  //       case "L":
  //         updatedData.LineTotal =
  //           companyData.MainCurncy === updatedData.Currency
  //             ? CalcLines.LineTotal
  //             : CalcLines.LineTotal * updatedData.Rate;
  //         updatedData.TotalFrgn =
  //           currency === updatedData.Currency
  //             ? CalcLines.TotalFrgn
  //             : ValueFormatter(updatedData.LineTotal / DocRate);
  //         updatedData.TotalSumSy = ValueFormatter(
  //           updatedData.LineTotal / SysRate
  //         );
  //         break;
  //       case "S":
  //         if (companyData.SysCurrncy === updatedData.Currency) {
  //           updatedData.TotalSumSy = CalcLines.TotalSumSy;
  //           updatedData.LineTotal = ValueFormatter(
  //             updatedData.TotalSumSy * updatedData.Rate
  //           );
  //           updatedData.TotalFrgn = ValueFormatter(
  //             updatedData.LineTotal / DocRate
  //           );
  //         } else {
  //           updatedData.LineTotal =
  //             updatedData.Price * updatedData.Quantity * updatedData.Rate;
  //           updatedData.TotalSumSy = updatedData.LineTotal / SysRate;
  //           updatedData.TotalFrgn = ValueFormatter(
  //             updatedData.LineTotal / DocRate
  //           );
  //         }
  //         break;
  //       case "C":
  //         if (currency === companyData.MainCurncy) {
  //           if (type === "S") {
  //             updatedData.TotalFrgn = ValueFormatter(0);
  //             updatedData.LineTotal = CalcLines.LineTotal;
  //             updatedData.TotalSumSy = ValueFormatter(
  //               updatedData.LineTotal / SysRate
  //             );
  //           } else {
  //             updatedData.TotalFrgn = ValueFormatter(0);
  //             updatedData.LineTotal =
  //               currency === updatedData.Currency
  //                 ? CalcLines.LineTotal
  //                 : CalcLines.LineTotal * updatedData.Rate;
  //             updatedData.TotalSumSy = ValueFormatter(
  //               updatedData.LineTotal / SysRate
  //             );
  //           }
  //         } else {
  //           const TotalFrgn =
  //             currency === data.Currency
  //               ? (updatedData.Price * updatedData.Rate) / DocRate
  //               : (updatedData.Price *
  //                   updatedData.Quantity *
  //                   updatedData.Rate) /
  //                 DocRate;
  //           updatedData.TotalFrgn =
  //             currency === data.Currency
  //               ? ValueFormatter(CalcLines.TotalFrgn)
  //               : TotalFrgn;
  //           updatedData.LineTotal = ValueFormatter(
  //             updatedData.TotalFrgn * DocRate
  //           );
  //           updatedData.TotalSumSy = ValueFormatter(
  //             updatedData.LineTotal / SysRate
  //           );
  //         }
  //         break;
  //       default:
  //         console.log("ff");
  //     }

  //     updatedData.StockSum = ValueFormatter(
  //       updatedData.INMPrice * updatedData.Quantity
  //     );
  //     updatedData.StockSumSc = ValueFormatter(updatedData.StockSum / SysRate);
  //     updatedData.StockSumFc = ValueFormatter(updatedData.StockSum / DocRate);

  //     if (name === "TaxCode") {
  //       updatedData.TaxCode = "";
  //       updatedData.VatGroup = "";
  //     }
  //     const taxLines = taxCalculation(
  //       updatedData.LineTotal,
  //       updatedData.AssblValue,
  //       row.DocTotal,
  //       updatedData.PriceBefDi,
  //       updatedData.Quantity,
  //       updatedData.TaxCode
  //     );

  //     updatedData.oTaxLines = taxLines.oTaxLines;
  //     updatedData.VatPrcnt = taxLines.VatPrcnt;
  //     updatedData.VatSum = taxLines.VatSum;
  //     updatedData.VatSumSy = taxLines.VatSumSy;
  //     updatedData.VatSumFrgn = taxLines.VatSumFrgn;
  //     let PriceAfVAT =
  //       updatedData.Price + updatedData.Price * (updatedData.VatPrcnt / 100);
  //     updatedData.PriceAfVAT = ValueFormatter(PriceAfVAT);
  //     return updatedData;
  //   });

  //   reset({
  //     ...allFormData,
  //     oLines: updatedLines,
  //     AssblValue: getValues("AssblValue"),
  //     NumAtCard: getValues("NumAtCard"),
  //     Comments: getValues("Comments"),
  //     DiscountAmt: getValues("DiscountAmt"),
  //     Discount: getValues("Discount"),
  //   });
  //   // recalculateHeaderDiscount();
  //   calculateDiscountAmt(discPercent);
  // };

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

    // Start edit mode if editable
    // const nextCellParams = api.getCellParams(nextId, nextField);
    // if (nextCellParams.isEditable) {
    //   setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    // }
  };
  const processRowUpdate = (newRow, oldRow) => {
    const updatedData = { ...oldRow, ...newRow };
    const originalQuantity = selectedRowsPurchase[oldRow.id]?.InvQty || 0;
    const newQty = updatedData.Quantity * updatedData.NumPerMsr;
    if (
      updatedData.BaseType >= 1 &&
      Number(newQty) > Number(originalQuantity)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Entered quantity cannot exceed base document quantity.",
        confirmButtonText: "OK",
      });
      updatedData.Quantity = ValueFormatter(
        originalQuantity / updatedData.NumPerMsr,
        6,
      );
      updatedData.LineTotal = updatedData.Quantity * updatedData.Price;
      updatedData.OpenQuantity = originalQuantity / updatedData.NumPerMsr;
      updatedData.InvQty = originalQuantity / updatedData.NumPerMsr;
      updatedData.OpenInvQty = originalQuantity / updatedData.NumPerMsr;
      if (updatedData.TaxCode > 0) {
        const taxLines = taxCalculation(
          updatedData.LineTotal,
          updatedData.AssblValue,
          allFormData.DocTotal,
          updatedData.PriceBefDi,
          updatedData.Quantity,
          updatedData.TaxCode,
        );
        updatedData.oTaxLines = taxLines.oTaxLines;
        updatedData.VatPrcnt = taxLines.VatPrcnt;
        updatedData.VatSum = taxLines.VatSum;
        updatedData.VatSumSy = taxLines.VatSumSy;
        updatedData.VatSumFrgn = taxLines.VatSumFrgn;
        let PriceAfVAT =
          updatedData.Price + updatedData.Price * (updatedData.VatPrcnt / 100);
        updatedData.PriceAfVAT = ValueFormatter(PriceAfVAT);
      }
    }

    if (allFormData.DocEntry) {
      updatedData.OpenQuantity =
        updatedData.Quantity - oldRow.Quantity + oldRow.OpenQuantity;
    } else {
      updatedData.Quantity = toMinOne(updatedData.Quantity);
      updatedData.OpenQuantity = updatedData.Quantity;
      updatedData.InvQty = ValueFormatter(
        updatedData.Quantity * updatedData.NumPerMsr,
        6,
      );
    }
    if (updatedData.ManBtchNum === "Y" && updatedData.oBatchLines?.length > 0) {
      const totalBatchQty = updatedData.oBatchLines.reduce(
        (sum, b) => sum + Number(b.BatchQty || 0),
        0,
      );
      if (parseFloat(totalBatchQty) !== parseFloat(updatedData.InvQty)) {
        Swal.fire({
          icon: "warning",
          title: "Batch quantity mismatch",
          text: `Batch total (${totalBatchQty}) must match Quantity (${TwoFormatter(
            updatedData.InvQty,
          )})`,
          confirmButtonText: "OK",
        });
      }
    }
    if (updatedData.ManSerNum === "Y" && updatedData.oSerialLines?.length > 0) {
      if (
        parseFloat(updatedData.oSerialLines.length) !==
        parseFloat(updatedData.InvQty)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Serial quantity mismatch",
          text: `Serial count (${
            updatedData.oSerialLines.length
          }) must match Quantity (${TwoFormatter(updatedData.InvQty)})`,
          confirmButtonText: "OK",
        });
      }
    }
    // if (newRow.PriceBefDi !== undefined) {
    //   updatedData.PriceBefDi = Math.min(
    //     Math.max(newRow.PriceBefDi, 0)
    //   );
    //   updatedData.Currency = currency;
    //   updatedData.Rate =
    //     companyData.MainCurncy === currency ? 1 : DocRate;
    // }
    if (newRow.PriceBefDi !== undefined && newRow._priceEdited) {
      updatedData.PriceBefDi = Math.max(newRow.PriceBefDi, 0);
      if (curSource === "L") {
        updatedData.Currency = companyData.MainCurncy;
        updatedData.Rate = "1";
      } else if (curSource === "S") {
        updatedData.Currency = companyData.SysCurrncy;
        updatedData.Rate = SysRate;
      } else {
        updatedData.Currency = currency;
        const Rate = companyData.MainCurncy === currency ? "1" : DocRate;
        updatedData.Rate = Rate;
      }

      delete updatedData._priceEdited;
    }

    if (newRow.Discount !== undefined && BaseType) {
      updatedData.Discount = Math.min(Math.max(newRow.Discount, 0), 100);
    }

    if (updatedData.GSTRelevnt === "Y" && newRow.AssblValue !== undefined) {
      updatedData.AssblValue = Math.min(Math.max(newRow.AssblValue, 0));
    }

    const CalcLines = CalCulation(
      updatedData.Quantity,
      updatedData.PriceBefDi,
      updatedData.Discount,
      updatedData.Rate,
    );

    updatedData.Price = CalcLines.discountedPrice;
    updatedData.INMPrice = CalcLines.discountedPrice;

    switch (curSource) {
      case "L":
        updatedData.LineTotal =
          companyData.MainCurncy === updatedData.Currency
            ? CalcLines.LineTotal
            : CalcLines.TotalFrgn * updatedData.Rate;

        updatedData.TotalFrgn =
          currency === updatedData.Currency
            ? CalcLines.TotalFrgn
            : ValueFormatter(updatedData.LineTotal / DocRate);

        updatedData.TotalSumSy = ValueFormatter(
          updatedData.LineTotal / SysRate,
        );
        break;

      case "S":
        if (companyData.SysCurrncy === updatedData.Currency) {
          updatedData.TotalSumSy = CalcLines.TotalSumSy;
          updatedData.LineTotal = ValueFormatter(
            updatedData.TotalSumSy * updatedData.Rate,
          );
          updatedData.TotalFrgn = ValueFormatter(
            updatedData.LineTotal / DocRate,
          );
        } else {
          updatedData.LineTotal =
            updatedData.Price * updatedData.Quantity * updatedData.Rate;

          updatedData.TotalSumSy = updatedData.LineTotal / SysRate;

          updatedData.TotalFrgn = ValueFormatter(
            updatedData.LineTotal / DocRate,
          );
        }
        break;

      case "C":
        if (currency === companyData.MainCurncy) {
          updatedData.TotalFrgn = ValueFormatter(0);
          updatedData.LineTotal = CalcLines.LineTotal;
          updatedData.TotalSumSy = ValueFormatter(
            updatedData.LineTotal / SysRate,
          );
        } else {
          const TotalFrgn =
            (updatedData.Price * updatedData.Quantity * updatedData.Rate) /
            DocRate;

          updatedData.TotalFrgn = ValueFormatter(TotalFrgn);
          updatedData.LineTotal = ValueFormatter(
            updatedData.TotalFrgn * DocRate,
          );
          updatedData.TotalSumSy = ValueFormatter(
            updatedData.LineTotal / SysRate,
          );
        }
        break;

      default:
        break;
    }

    updatedData.StockSum = ValueFormatter(
      updatedData.INMPrice * updatedData.Quantity,
    );
    updatedData.StockSumSc = ValueFormatter(updatedData.StockSum / SysRate);
    updatedData.StockSumFc = ValueFormatter(updatedData.StockSum / DocRate);

    if (updatedData.TaxCode > 0) {
      const taxLines = taxCalculation(
        updatedData.LineTotal,
        updatedData.AssblValue,
        updatedData.DocTotal,
        updatedData.PriceBefDi,
        updatedData.Quantity,
        updatedData.TaxCode,
      );

      updatedData.oTaxLines = taxLines.oTaxLines;
      updatedData.VatPrcnt = taxLines.VatPrcnt;
      updatedData.VatSum = taxLines.VatSum;
      updatedData.VatSumSy = taxLines.VatSumSy;
      updatedData.VatSumFrgn = taxLines.VatSumFrgn;
    }

    updatedData.PriceAfVAT = ValueFormatter(
      updatedData.Price + updatedData.Price * (updatedData.VatPrcnt / 100),
    );

    const updatedLines = getValues("oLines").map((d, i) =>
      i === oldRow.id ? updatedData : d,
    );

    setValue("oLines", updatedLines, {
      shouldDirty: true,
      shouldValidate: false,
    });
    // reset({ ...allFormData, oLines: updatedLines });
    if (discPercent > 0) {
      calculateDiscountAmt(discPercent);
    }

    return updatedData;
  };
  //! Header Level CalCaculation
  const oLines = watch("oLines") || []; // Ensure it's an array
  const totals = useMemo(() => {
    return oLines.reduce(
      (acc, line) => {
        acc.TotalBefDisc += Number(line?.LineTotal) || 0;
        acc.totalBefDiscSy += Number(line?.TotalSumSy) || 0;
        acc.totalBefDiscFrgn += Number(line?.TotalFrgn) || 0;
        return acc;
      },
      {
        TotalBefDisc: 0,
        totalBefDiscSy: 0,
        totalBefDiscFrgn: 0,
      },
    );
  }, [oLines]);

  useEffect(() => {
    setValue("TotalBefDisc", ValueFormatter(totals.TotalBefDisc));
    setValue("TotalBefDiscSy", ValueFormatter(totals.totalBefDiscSy));
    setValue("TotalBefDiscFrgn", ValueFormatter(totals.totalBefDiscFrgn));
    if (discPercent > 0) {
      calculateDiscountAmt(discPercent);
    }
  }, [
    totals.TotalBefDisc,
    totals.totalBefDiscSy,
    totals.totalBefDiscFrgn,
    currency,
    docDate,
  ]);

  //! Local Currency Calculation
  const LineVatSum = oLines.reduce((sum, current) => {
    const vat = parseFloat(current?.VatSum) || 0; // Handle NaN, null, undefined
    return sum + vat;
  }, 0);

  let TaxOnExp = parseFloat(getValues("TaxOnExp") || 0);
  const VatSum = LineVatSum + TaxOnExp;
  setValue("VatSum", ValueFormatter(VatSum));
  let TotalExpns = parseFloat(getValues("TotalExpns") || "0.000");
  const DiscountAmt = parseFloat(getValues("DiscountAmt")) || 0;
  const DocTotal =
    totals.TotalBefDisc -
    DiscountAmt +
    TotalExpns +
    VatSum +
    parseFloat(RoundDif || 0);
  setValue("DocTotal", ValueFormatter(DocTotal));
  // end
  //! System Currency Calculation
  const LineVatSumSys = oLines.reduce((sum, current) => {
    const vat = parseFloat(current?.VatSumSy) || 0; // Handle NaN, null, undefined
    return sum + vat;
  }, 0);
  console.log("system vat sum", LineVatSumSys);
  let TaxOnExpSc = parseFloat(getValues("TaxOnExpSc") || 0.0);
  const VatSumSy = LineVatSumSys + TaxOnExpSc;
  setValue("VatSumSy", ValueFormatter(VatSumSy));

  let TotalExpSC = parseFloat(getValues("TotalExpSC") || "0.000");

  const DiscSumSy = parseFloat(getValues("DiscSumSy")) || 0;
  const DocTotalSy =
    totals.totalBefDiscSy -
    DiscSumSy +
    TotalExpSC +
    VatSumSy +
    parseFloat(RoundDif || 0);

  setValue("DocTotalSy", ValueFormatter(DocTotalSy));

  //! Friegn Currency Calculation
  const LineVatSumFc = oLines.reduce((sum, current) => {
    const vat = parseFloat(current?.VatSumFrgn) || 0; // Handle NaN, null, undefined
    return sum + vat;
  }, 0);
  let TaxOnExpFc = parseFloat(getValues("TaxOnExpFc") || 0.0);
  const VatSumFC = LineVatSumFc + TaxOnExpFc;
  setValue("VatSumFC", ValueFormatter(VatSumFC));
  const DiscSumFC = parseFloat(getValues("DiscSumFC")) || 0;
  let TotalExpFC = parseFloat(getValues("TotalExpFC")) || 0;
  const DocTotalFC =
    totals.totalBefDiscFrgn -
    DiscSumFC +
    TotalExpFC +
    VatSumFC +
    parseFloat(RoundDif || 0);

  setValue("DocTotalFC", ValueFormatter(DocTotalFC));

  const docNumRef = useRef();

  const validateAllLines = (lines) => {
    const errors = [];
    const errorIds = [];

    lines.forEach((line, index) => {
      const lineNo = index + 1;
      const rowId = line.id ?? index;

      // 🔴 BIN VALIDATION
      if (line.BinActivat === "Y") {
        const binLines = line.oDocBinLocationLines || [];
        const totalBinQty = binLines.reduce(
          (sum, b) => sum + Number(b.Quantity || 0),
          0,
        );

        if (binLines.length === 0 || totalBinQty !== Number(line.Quantity)) {
          errors.push(
            `Line ${lineNo}: ${line.ItemCode} - ${line.ItemName} (Bin Qty mismatch)`,
          );
          errorIds.push(rowId);
        }
      }

      // 🔴 BATCH VALIDATION
      if (line.ManBtchNum === "Y" && line.ManSerNum === "N") {
        const batchLines = line.oBatchLines || [];
        const totalBatchQty = batchLines.reduce(
          (sum, b) => sum + Number(b.BatchQty || 0),
          0,
        );

        if (totalBatchQty !== Number(line.InvQty || 0)) {
          errors.push(
            `Line ${lineNo}: ${line.ItemCode} - ${
              line.ItemName
            } (Batch Qty ${TwoFormatter(totalBatchQty)} ≠ Qty ${TwoFormatter(
              line.InvQty,
            )})`,
          );
          errorIds.push(rowId);
        }
      }

      // 🔴 SERIAL VALIDATION
      if (line.ManBtchNum === "N" && line.ManSerNum === "Y") {
        const serialLines = line.oSerialLines || [];

        if (serialLines.length !== Number(line.InvQty || 0)) {
          errors.push(
            `Line ${lineNo}: ${line.ItemCode} - ${
              line.ItemName
            } (Serial Count ${serialLines.length} ≠ Qty ${TwoFormatter(
              line.InvQty,
            )})`,
          );
          errorIds.push(rowId);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      errorIds: [...new Set(errorIds)], // remove duplicates
    };
  };

  const handleSubmitForm = async (data) => {
    if (watch("Series") === "0" && !data.DocNum) {
      docNumRef.current?.focus();
      return;
    }
    const isValid = ValidationSubmitForm(data, type, warehouseData, getValues);
    // if (SaveUpdateName === "SAVE") {
    //   if (getValues("DocTotal") <= 0) {
    //     Swal.fire({
    //       text: "Total document value must be zero or greater.",
    //       icon: "warning",
    //       confirmButtonText: "Ok",
    //     });
    //     return false;
    //   }
    //   const BinIssues = data.oLines.filter((line) => {
    //     const binLines = line.oDocBinLocationLines || [];
    //     if (line.BinActivat === "Y" && binLines.length === 0) return true;
    //     const totalBinQty = binLines.reduce(
    //       (sum, b) => sum + parseFloat(b.Quantity || 0),
    //       0
    //     );
    //     return (
    //       line.BinActivat === "Y" && totalBinQty !== parseFloat(line.Quantity)
    //     );
    //   });

    //   if (BinIssues.length > 0) {
    //     const issueList = BinIssues.map(
    //       (line, index) => `Item ${line.ItemCode || "-"}`
    //     ).join(", ");

    //     Swal.fire({
    //       title: "Bin Allocation Error!",
    //       text: `Cannot save — Quantity and Bin Location Quantity do not match for ${issueList}`,
    //       icon: "warning",
    //       confirmButtonText: "Ok",
    //     });

    //     return false;
    //   }
    // }
    console.log(isValid);
    if (SaveUpdateName === "SAVE") {
      const { isValid, errors, errorIds } = validateAllLines(data.oLines);

      if (!isValid) {
        setErrorLineIds(errorIds);

        // 🔥 Focus first error line
        setTimeout(() => {
          apiRef.current?.scrollToIndexes({
            rowIndex: errorIds[0],
          });
          apiRef.current?.setCellFocus(errorIds[0], "ItemCode");
        }, 100);

        Swal.fire({
          icon: "warning",
          title: "Document Validation Error",
          html: errors.join("<br/>"),
          confirmButtonText: "OK",
        });

        return false; // ⛔ STOP SAVE
      }
    }
    if (!isValid) return;
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
    let attachmentDocEntry = fileData?.length === 0 ? "0" : data.AttcEntry;
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
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DDTHH:mm:ss"),
      DocDueDate: dayjs(data.DocDueDate).format("YYYY-MM-DDTHH:mm:ss"),
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DDTHH:mm:ss"),
      Status: data.Status ? "1" : "0",
      CardCode: data.CardCode,
      CardName: data.CardName,
      CntctCode: data.CntctCode || "0",
      NumAtCard: data.NumAtCard || "",
      CurSource:
        getValues("Currency") === companyData.MainCurncy ? "L" : data.CurSource,
      SysRate: String(data.SysRate || "1"),
      DocCur: data.Currency,
      Currency: data.Currency,
      DocRate: String(data.DocRate || "1"),
      DocType: type,
      Address2: String(data.CompnyAddr || ""),
      PayToCode: String(data.PayToCode || ""),
      ShipToCode: data.ShipToCode,
      Address: data.DfltAddress || "0",
      TrnspCode: data.TrnspCode || "0",
      AttcEntry: attachmentDocEntry,
      TotalBefDisc: data.TotalBefDisc || "0",
      TotalBefDiscSy: data.TotalBefDiscSy || "0",
      TotalBefDiscFrgn:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.TotalBefDiscFrgn,
      Discount: String(data.Discount || "0"),
      DiscSum: String(data.DiscSum || "0"),
      RoundDif: data.RoundDif || "0",
      VatSum: String(data.VatSum || "0"),
      SlpCode: String(data.SlpCode || "0"),
      Comments: data.Comments || "",
      TotalExpns: data.TotalExpns || "0",
      TaxOnExp: String(data.TaxOnExp || "0"),
      DocTotal: data.DocTotal || "0",
      DocTotalFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.DocTotalFC,
      Series: String(data.Series || "0"),
      DpmVat: data.DpmVat || "0",
      PaidFC: data.PaidFC || "0",
      Serial: data.Serial || "0",
      DpmAppl: data.DpmAppl || "0",
      PaidDpm: data.PaidDpm || "0",
      PaidSum: data.PaidSum || "0",
      TaxOnExApF: data.TaxOnExApF || "0",
      TaxOnExApS: data.TaxOnExApS || "0",
      TaxOnExpFc:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : String(data.TaxOnExpFc || "0"),
      VatSumFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.VatSumFC || "0",

      TransId: data.TransId || "0",
      VatPaid: data.VatPaid || "0",
      BankCode: data.BankCode || "0",
      BaseDisc: data.BaseDisc || "0",
      BnkCntry: data.BnkCntry || "0",
      DpmDrawn: data.DpmDrawn || "0",
      DpmPrcnt: data.DpmPrcnt || "0",
      DpmVatFc: data.DpmVatFc || "0",
      DpmVatSc: data.DpmVatSc || "0",
      FolioNum: data.FolioNum || "0",
      GroupNum: data.GroupNum || "0",
      JrnlMemo: data.JrnlMemo || "0",
      PayDuMonth: data.PayDuMonth || "0",
      ExtraMonth: data.ExtraMonth || "0",
      ExtraDays: data.ExtraDays || "0",
      CdcOffset: data.CdcOffset,
      PaidDpmF: data.PaidDpmF || "0",
      PaidDpmS: data.PaidDpmS || "0",
      VatSumSy: data.VatSumSy || "0",
      BnkBranch: data.BnkBranch || "0",
      DiscSumFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : String(data.DiscSumFC || "0"),
      DiscSumSy: data.DiscSumSy || "0",
      DpmAmntFC: data.DpmAmntFC || "0",
      DpmAmntSC: data.DpmAmntSC || "0",
      DpmApplFc: data.DpmApplFc || "0",
      DpmApplSc: data.DpmApplSc || "0",
      DpmAppVat: data.DpmAppVat || "0",
      DpmStatus: data.DpmStatus || "0",
      FolioPref: data.FolioPref || "0",
      PaidSumFc: data.PaidSumFc || "0",
      PaidSumSc: data.PaidSumSc || "0",
      TaxOnExAp: data.TaxOnExAp || "0",
      ToBinCode: data.ToBinCode || "0",
      VatPaidFC: data.VatPaidFC || "0",
      BaseDiscFc: data.BaseDisc || "0",
      BaseDiscPr: data.BaseDiscPr || "0",
      BaseDiscSc: data.BaseDiscSc || "0",
      BnkAccount: data.BnkAccount || "0",
      CheckDigit: data.CheckDigit || "0",
      DpmAppVatF: data.DpmAppVatF || "0",
      DpmAppVatS: data.DpmAppVatS || "0",
      GrosProfFC: data.GrosProfFC || "0",
      GrosProfit: data.GrosProfit || "0",
      InvQty: String(data.InvQty || "0"),
      PaidToDate: data.PaidToDate || "0",
      ReceiptNum: data.ReceiptNum || "0",
      RoundDifFC: data.RoundDifFC || "0",
      RoundDifSy: data.RoundDifSy || "0",
      TaxOnExpSc: data.TaxOnExpSc || "0",
      TotalExpFC: data.TotalExpFC || "0",
      TotalExpSC: data.TotalExpSC || "0",
      VatPaidSys: data.VatPaidSys || "0",
      PaidSys: data.PaidSys || "0",
      DocTotalSy: data.DocTotalSy || "0",
      DiscountAmt: String(data.DiscountAmt || "0"),
      DocNum: data.DocNum || "0",
      DueAmnt: data.DueAmnt || "0",
      WeightUnit: "0",
      ExpApplSC: data.ExpApplSC || "0",
      ExpApplFC: data.ExpApplFC || "0",
      ExpAppl: data.ExpAppl || "0",
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oExpLines: (data.oExpLines || []).map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        // ModifiedDate:dayjs(undefined).format("YYYY-MM-DD"),
        Status: "1",
        ExpnsCode: item.DocEntry,
        DocEntry: item.DocEntry,
        ModifiedBy: user.UserName,
        LineTotal: String(item.LineTotal),
        TaxCode: String(item.TaxCode || "0"),
        VatGroup: String(item.VatGroup || "0"),
        PostTax: String(item.PostTax || "N"),
        Excisable: String(item.Excisable || "N"),
        VatSum: String(item.VatSum),
        TotalFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.TotalFrgn || "0"),
        VatSumFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : item.VatSumFrgn || "0",
        GrsAmount: String(item.GrsAmount || "0"),
        ExpnsName: String(item.ExpnsCode) || "0",
        Rate: String(DocRate || "0"),
        RevAcct: item.RevAcct,
        GrsFC: item.GrsFC || "0",
        GrsSC: item.GrsSC || "0",
        PaidFC: item.PaidFC || "0",
        LineVat: item.LineVat || "0",
        LineVatS: item.LineVatS || "0",
        VatPrcnt: item.VatPrcnt || "0",
        VatSumSy: item.VatSumSy || "0",
        DedVatSum: item.DedVatSum || "0",
        DedVatSumF: item.DedVatSumF || "0",
        DedVatSumS: item.DedVatSumS || "0",
        PaidToDate: item.PaidToDate || "0",
        PaidSys: item.PaidSys || "0",
        LineVatF: item.LineVatF || "0",
        TotalSumSy: String(item.TotalSumSy || "0"),
        VatAppldFC: item.VatAppldFC || "0",
        VatAppldSC: item.VatAppldSC || "0",
        VatApplied: item.VatApplied || "0",
        BaseType: item.BaseType || "-1",
        BaseAbsEnt: item.BaseAbsEnt || "-1",
        BaseLnNum: item.BaseLnNum || "-1",
        BaseRef: item.BaseRef || "0",
        oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
          UserId: user.UserId,
          CreatedBy: user.UserName,
          TaxRate: String(taxItem.TaxRate),
          TaxSum: String(taxItem.TaxSum),
          StcCode: taxItem.StcCode,
          BaseSum: String(taxItem.BaseSum),
          TaxSumFrgn:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : taxItem.TaxSumFrgn || "0",
          TaxSumSys: taxItem.TaxSumSys || "0",
          BaseSumFrg:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : taxItem.BaseSumFrg || "0",
          RelateType: "2",
          RelateEntry: taxItem.RelateEntry,
          GroupNum: taxItem.GroupNum || "1",
          ExpnsCode: taxItem.ExpnsCode || "0",
          StaCode: taxItem.StaCode || "0",
          staType: taxItem.staType || "1",
          TaxAcct: taxItem.TaxAcct || "0",
          BaseSumSys: taxItem.BaseSumSys || "0",
          VatApplied: taxItem.VatApplied || "0",
          VatAppldFC: taxItem.VatAppldFC || "0",
          VatAppldSC: taxItem.VatAppldSC || "0",
          PaidSys: taxItem.PaidSys || "0",
          LineVatF: taxItem.LineVatF || "0",
          LineSeq: taxItem.LineSeq || "1",
          DeferrAcct: taxItem.DeferrAcct || "0",
          BaseType: taxItem.BaseType || "1",
          BaseAbs: taxItem.BaseAbs || "1",
          BaseSeq: taxItem.BaseSeq || "1",
          DeductTax: taxItem.DeductTax || "0",
          DdctTaxFrg: taxItem.DdctTaxFrg || "0",
          DdctTaxSys: taxItem.DdctTaxSys || "0",
        })),
      })),
      oLines: data.oLines.map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        Status: "1",
        ItemCode: item.ItemCode || "",
        ServCode: item.ServCode || "",
        ItemName: item.ItemName,
        Quantity: String(item.Quantity || 1),
        PriceBefDi: String(item.PriceBefDi || "0"),
        INMPrice: String(
          isNaN(parseFloat(item.INMPrice)) ? 0 : parseFloat(item.INMPrice),
        ),
        Price: String(item.Price || "0"),
        Discount: String(item.Discount || "0"),
        OpenQuantity: String(item.OpenQuantity || ""),
        OpenQty: item.OpenQty || "0",
        OnHand: item.OnHand || "0",
        IsCommited: item.IsCommited || "0",
        OnOrder: item.OnOrder || "0",
        WHSCode: item.WHSCode || "",
        AcctCode: item.AcctCode || "0",
        ExpnsCode: item.ExpnsCode || "0",
        ExpnsName: item.ExpnsName || "0",
        TotalExpns: item.TotalExpns || "0",
        TaxCode: String(item.TaxCode || "0"),
        VatGroup: String(item.VatGroup || "0"),
        PostTax: String(item.PostTax || "0"),
        Excisable: String(item.Excisable || "0"),
        LineTotal: String(item.LineTotal || "0"),
        TotalFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.TotalFrgn || "0"),
        VatSumSy: String(item.VatSumSy || "0"),
        VatSumFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.VatSumFrgn || "0"),
        InvQty:
          item.UomCode === "Manual"
            ? String(item.Quantity || 1)
            : String(item.InvQty || "0"),
        OpenInvQty:
          item.UomCode === "Manual"
            ? String(item.Quantity || 1)
            : String(item.OpenInvQty || "0"),
        StockSum: String(item.StockSum || "0"),
        StockSumSc: String(item.StockSumSc || "0"),
        StockSumFc:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.StockSumFc || "0"),
        Rate: String(item.Rate || "1"),
        UomCode: item.UomCode || "0",
        UomCode2: item.UomCode2 || "0",
        UomEntry: item.UomEntry || "0",
        unitMsr: item.unitMsr,
        unitMsr2: item.unitMsr2 || "0",
        UomEntry2: item.UomEntry2 || "0",
        BaseType: item.BaseType || "-1",
        BaseEntry: item.BaseEntry || "-1",
        BaseDocNum: item.BaseDocNum || "0",
        BaseLine: item.BaseLine || "-1",
        LineNum: item.LineNum || "0",
        SlpCode: String(item.SlpCode || "0"),
        VatSum: String(
          isNaN(parseFloat(item.VatSum)) ? 0 : parseFloat(item.VatSum),
        ),
        QtyVar: String(item.QtyVar || "0"),
        ChapterID: String(item.ChapterID || "0"),
        UOMFactor: item.UOMFactor || "0",
        ETA: item.ETA || "0",
        GTotal: item.GTotal || "0",
        Address: item.Address || "0",
        BinCode: item.BinCode || "0",
        LineVat: item.LineVat || "0",
        LocCode: item.LocCode || "0",
        OcrCode: item.OcrCode || "0",
        OpenSum: item.OpenSum || "0",
        Project: item.Project || "0",
        TaxType: item.TaxType || "0",
        UnitMsr: item.UnitMsr || "0",
        CodeBars: item.CodeBars || "0",
        Currency: item.Currency || "0",
        GTotalFC: item.GTotalFC || "0",
        GTotalSC: item.GTotalSC || "0",
        LineVatS: item.LineVatS || "0",
        TrnsCode: item.TrnsCode || "0",
        VatAppld: item.VatAppld || "0",
        VatPrcnt: String(item.VatPrcnt || "0"),
        AttcEntry: item.AttcEntry || "0",
        DedVatSum: item.DedVatSum || "0",
        LineVatlF: item.LineVatlF || "0",
        NumPerMsr: String(item.NumPerMsr || "0"),
        OpenSumFC: item.OpenSumFC || "0",
        SerialNum: item.SerialNum || "0",
        StckAppFc: item.StckAppFc || "0",
        StckAppSc: item.StckAppSc || "0",
        TaxAmount: item.TaxAmount || "0",
        VendorNum: item.VendorNum || "0",
        AssblValue: String(item.AssblValue || "0"),
        DedVatSumF: item.DedVatSumF || "0",
        DedVatSumS: item.DedVatSumS || "0",
        InvntSttus: item.InvntSttus || "0",
        OpenSumSys: item.OpenSumSys || "0",
        PriceAfVAT: String(item.PriceAfVAT || "0"),
        ShipToCode: item.ShipToCode || "0",
        StckSumApp: item.StckSumApp || "0",
        TotalSumSy: String(item.TotalSumSy || "0"),
        VatAppldFC: item.VatAppldFC || "0",
        VatAppldSC: item.VatAppldSC || "0",
        FreightCode: item.FreightCode || "0",
        FreightAmount: item.FreightAmount || "0",
        oSerialLines: (item.oSerialLines || []).map((serialItem) => ({
          DocEntry: serialItem.DocEntry || "",
          UserId: user.UserId,
          CreatedBy: user.UserName,
          CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
          ModifiedBy: "",
          ModifiedDate: "",
          Status: "0",
          ItemCode: item.ItemCode,
          CardCode: data.CardCode || "",
          CardName: data.CardName || "",
          ItemName: item.ItemName,
          WhsCode: item.WHSCode || "",
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
          BaseType: "21",
          BaseNum: data.DocNum || "-1",
          BaseEntry: serialItem.BaseEntry || "-1",
          BaseLinNum: serialItem.BaseLinNum || "-1",
          CreateDate: dayjs(undefined).format("YYYY-MM-DD"),
          Direction: "0",
          TtlQuantity: String(item.InvQty || 1),
          BsDocType: serialItem.BsDocType || "",
          BsDocEntry: serialItem.BsDocEntry || "",
          BsDocLine: serialItem.BsDocLine || "",
        })),
        // =======================================================
        oBatchLines: (item.oBatchLines || []).map((BatchItem) => ({
          DocEntry: BatchItem.DocEntry || "",
          UserId: user.UserId,
          CreatedBy: user.UserName,
          CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
          ModifiedBy: "",
          ModifiedDate: new Date().toISOString(),
          Status: "0",
          BaseNum: data.DocNum || "-1",
          ItemCode: String(item.ItemCode || ""),
          CardCode: data.CardCode || "1",
          CardName: data.CardName || "1",
          ItemName: item.ItemName || "1",
          WhsCode: item.WHSCode || "",
          BatchNum: BatchItem.BatchNum || "",
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
          Notes: BatchItem.Notes || "",
          Quantity: String(BatchItem.BatchQty || "1"),
          BaseType: "21",
          BaseEntry: BatchItem.BaseEntry || "-1",
          BaseLinNum: BatchItem.BaseLinNum || "-1",
          CreateDate: dayjs(undefined).format("YYYY-MM-DD"),
          Direction: "0",
          TtlQuantity:
            item.UomCode === "Manual"
              ? String(item.Quantity || 1)
              : String(item.InvQty || "0"),
          BsDocType: BatchItem.BsDocType || "1",
          BsDocEntry: BatchItem.BsDocEntry || "1",
          BsDocLine: BatchItem.BsDocLine || "1",
        })),

        oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
          UserId: user.UserId,
          CreatedBy: user.UserName,
          TaxRate: String(taxItem.TaxRate),
          TaxSum: String(taxItem.TaxSum),
          StcCode: taxItem.StcCode,
          BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
          TaxSumFrgn:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : taxItem.TaxSumFrgn || "0",
          BaseSumFrg:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : taxItem.BaseSumFrg || "0",
          RelateType: "1",
          RelateEntry: taxItem.RelateEntry,
          GroupNum: taxItem.GroupNum || "1",
          ExpnsCode: taxItem.ExpnsCode || "0",
          StaCode: taxItem.StaCode || "0",
          staType: taxItem.staType || "1",
          TaxAcct: taxItem.TaxAcct || "0",
          TaxSumSys: taxItem.TaxSumSys || "0",
          BaseSumSys: taxItem.BaseSumSys || "0",
          VatApplied: taxItem.VatApplied || "0",
          VatAppldFC: taxItem.VatAppldFC || "0",
          VatAppldSC: taxItem.VatAppldSC || "0",
          LineSeq: taxItem.LineSeq || "1",
          DeferrAcct: taxItem.DeferrAcct || "0",
          BaseType: taxItem.BaseType || "1",
          BaseAbs: taxItem.BaseAbs || "1",
          BaseSeq: taxItem.BaseSeq || "1",
          DeductTax: taxItem.DeductTax || "0",
          DdctTaxFrg: taxItem.DdctTaxFrg || "0",
          DdctTaxSys: taxItem.DdctTaxSys || "0",
        })),
        oDocBinLocationLines: item.oDocBinLocationLines || [],
      })),
      oPaymentLines: [],
      oDPLines: [],
      oTaxExtLines: (data.oTaxExtLines || []).map((oTaxExtLines) => ({
        ...oTaxExtLines,
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
      })),
    };
    console.log("submit", obj);
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/GoodsReturn`, obj)
        .then((res) => {
          if (res.data.success) {
            // ClearFormData();
            ClearForm();
            setOpenListData([]);
            fetchOpenListData(0);
            handleGetListClear();
            setClearCache(true);

            //  handleGetListClearCopyFrom()
            Swal.fire({
              title: "Success!",
              text: "Good Return saved Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            if (attachmentDocEntry > "0") {
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
          if (attachmentDocEntry > "0") {
            apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          }
          console.error("Error Post time", error);
          Swal.fire({
            title: "Error!",
            text: "something went wrong" + error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        })
        .finally(() => {
          setapiloading(false);
        });
    } else if (attachmentDocEntry > "0") {
      Swal.fire({
        text: `Do You Want Update "${obj.CardCode}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(`/Attachment/${attachmentDocEntry}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
              if (response.data.success) {
                // setOpenListData([]);
                // fetchOpenListData(0);
                // setOpenListData([]);
                // setOpenListPage(0)
                // fetchOpenListData(0);
                // ClearFormData();
                Swal.fire({
                  title: "Success!",
                  text: "Attachment Purchase Good Return Updated",
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
            text: "Attachment Purchase Good Return Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const handleOnCancelDocument = () => {
    Swal.fire({
      text: `Do You Want Cancel "${currentData.CardCode}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .put(`/GoodsReturn/Cancel/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              ClearForm();
              setOpenListData([]);
              fetchOpenListData(0);
              fetchCancelledListData(0);
              fetchClosedListData(0);
              Swal.fire({
                text: "Good Return Cancel",
                icon: "success",
                toast: true,
                showConfirmButton: false,
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: "warning!",
                text: resp.data.message,
                icon: "warning",
                confirmButtonText: "Ok",
                // timer: 1000,
              });
            }
          });
      } else {
        Swal.fire({
          text: "Goods Receipt PO Not Cancelled",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const handleOnCloseDocument = () => {
    Swal.fire({
      text: `Do You Want Close "${currentData.CardCode}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .put(`/GoodsReturn/Close/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              setOpenListData([]);
              fetchOpenListData(0);
              setClosedListData([]);
              fetchClosedListData(0);
              ClearForm();
              Swal.fire({
                text: "Good Return Close",
                icon: "success",
                toast: true,
                showConfirmButton: false,
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: "warning!",
                text: resp.data.message,
                icon: "warning",
                confirmButtonText: "Ok",
                // timer: 1000,
              });
            }
          });
      } else {
        Swal.fire({
          text: "Goods Receipt PO Not Close",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  //#endregionPost APi

  //#region Copy form Logic
  // =============COPY FROM START===============
  const handleCloseMenu = () => {
    setOpenDialog(false); // Close modal
  };

  const handleMenuItemClick = (item) => {
    // console.log("===",checkedItems)
    handleCloseMenu(); // Close dropdown
    setOpenDialog(true); // Open modal
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close modal
  };

  const onClickCopyFrom = useCallback((e, item, index, DocNum) => {
    const checked = e.target.checked;
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = {
        ...prevCheckedItems,
        [DocNum]: checked, // Update specific checkbox state
      };
      const count = Object.values(newCheckedItems).filter(Boolean).length;
      setSelectedCount(count);

      return newCheckedItems;
    });

    // Use `checked` directly instead of checking state immediately
    if (checked) {
      setoExpLines((prev) => {
        const newOlines = [...prev, ...item.oExpLines];
        const uniqueOlines = Array.from(
          new Map(newOlines.map((obj) => [JSON.stringify(obj), obj])).values(),
        );
        return uniqueOlines;
      });

      setAllDAtaCopyform(item);

      // setValue("Discount", item.Discount);
      setOlines((prevOlines) => {
        const newOlines = [
          ...prevOlines,
          ...item.oLines.map((obj) => ({
            ...obj,
            HerDiscount: item.Discount,
            HerCurrency: item.DocCur,
          })),
        ];
        return Array.from(
          new Map(newOlines.map((obj) => [JSON.stringify(obj), obj])).values(),
        );
      });
    } else {
      setoExpLines((prev) =>
        prev.filter(
          (line) =>
            !item.oExpLines.some((expLine) => expLine.LineNum === line.LineNum),
        ),
      );

      setOlines((prevOlines) =>
        prevOlines.filter(
          (line) => !item.oLines.some((ol) => ol.LineNum === line.LineNum),
        ),
      );
      // Remove only the items that came from this checkbox
      // setOlines((prevOlines) =>
      //   prevOlines.filter((line) => !item.oLines.includes(line))
      // );
    }
  }, []);

  const checkCopyLineZeroRate = (records, docDate, currencyList) => {
    const sysCurr = companyData.SysCurrncy;
    const mainCurr = companyData.MainCurncy;
    const headerCurr = CopyformData?.DocCur;

    let missingRates = [];

    // ============================
    // SYSTEM RATE CHECK
    // ============================
    const sysRateObj = records.find((r) => r.Currency === sysCurr);
    const sysRate =
      sysCurr === mainCurr ? 1 : parseFloat(sysRateObj?.Rate || 0);

    if (sysRate <= 0) {
      missingRates.push({
        Type: "SystemRate",
        Currency: sysCurr,
        Rate: sysRate,
        DocEntry: sysRateObj?.DocEntry ?? "0",
        RateDate: docDate,
      });
    }

    // ============================
    // HEADER CURRENCY RATE CHECK
    // ============================
    const hasSingleHeader = getUniqueCount(OlinesData, "HerCurrency") === 1;

    if (hasSingleHeader) {
      const headerRateObj = records.find((r) => r.Currency === headerCurr);
      const headerRate =
        headerCurr === mainCurr ? 1 : parseFloat(headerRateObj?.Rate || 0);
      setValue("DocRate", headerRate);
      setValue("Currency", headerCurr);

      if (headerRate <= 0) {
        missingRates.push({
          Type: "DocumentRate",
          Currency: headerCurr,
          Rate: headerRate,
          DocEntry: headerRateObj?.DocEntry ?? "0",
          RateDate: docDate,
        });
      }
    } else {
      setValue("Currency", mainCurr);
      setValue("DocRate", "1");
    }

    // ============================
    // LINE LEVEL CURRENCY CHECK
    // ============================
    const lineCurrencies = [...new Set(currencyList.map((x) => x.Currency))];

    lineCurrencies.forEach((cur) => {
      const rec = records.find((r) => r.Currency === cur);
      const rate = cur === mainCurr ? 1 : parseFloat(rec?.Rate || 0);

      if (rate <= 0) {
        missingRates.push({
          Type: "LineRate",
          Currency: cur,
          Rate: rate,
          DocEntry: rec?.DocEntry ?? "0",
          RateDate: docDate,
        });
      }
    });

    // ============================
    // UNIQUE CURRENCY ONLY
    // ============================
    if (missingRates.length > 0) {
      const uniqueCurrencies = [];
      const seen = new Set();

      missingRates.forEach((item) => {
        const key = item.Currency; // Only one per currency
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCurrencies.push(item);
        }
      });

      setAllDataCopyRateLine(uniqueCurrencies);
      dispatch({ type: "OPEN", modal: "exchaneRateLineCpyform" });

      Swal.fire({
        title: "Missing Rates",
        text: "Some currency exchange rates are missing.",
        icon: "warning",
      });

      return null;
    }

    // ============================
    // ALL RATES ARE VALID → RETURN UPDATED
    // ============================
    return currencyList.map((item) => {
      const rec = records.find((r) => r.Currency === item.Currency);
      const rate = item.Currency === mainCurr ? 1 : parseFloat(rec?.Rate || 0);

      return {
        ...item,
        Rate: rate,
        DocEntry: rec?.DocEntry ?? item.DocEntry,
      };
    });
  };

  const handleOpenPurchase = (newrecod, newDataRate) => {
    setSelectedRowsPurchase([]);
    setValue("oExpLines", []);
    setValue("oLines", []);
    setValue("Discount", "");
    setValue("DiscountAmt", "");

    const formattedDate = dayjs(docDate).format("YYYY-MM-DD");
    const records = "NEW" === newrecod ? newDataRate : data[docDate] || [];
    const result = checkCopyLineZeroRate(records, formattedDate, OlinesData);

    if (!result) return; // missing rates → modal already opened

    const uniqueBaseNums = new Set(OlinesData.map((i) => i.BaseDocNum)).size;
    const latestDocRate = parseFloat(getValues("DocRate"));
    const sysRate = parseFloat(getValues("SysRate"));

    const updatedData = result.map((item) => {
      const LineTotal = item.Price * item.Quantity * item.Rate;
      const TotalFrgn = LineTotal / latestDocRate;

      if (uniqueBaseNums > 1) {
        const headerDisc = 1 - item.HerDiscount / 100;
        const lineDisc = 1 - item.Discount / 100;
        const finalDisc = 100 - headerDisc * lineDisc * 100;

        const PriceAfVAT =
          item.PriceBefDi - (item.PriceBefDi * finalDisc) / 100;
        const LineTotal2 = PriceAfVAT * item.Quantity * item.Rate;

        return {
          ...item,
          Discount: finalDisc.toFixed(3),
          Price: PriceAfVAT.toFixed(3),
          LineTotal: ValueFormatter(LineTotal2),
          TotalFrgn: ValueFormatter(LineTotal2 / latestDocRate),
          TotalSumSy: ValueFormatter(LineTotal2 / sysRate),
        };
      }

      return {
        ...item,
        LineTotal: ValueFormatter(LineTotal),
        TotalFrgn: ValueFormatter(TotalFrgn),
        TotalSumSy: ValueFormatter(LineTotal / sysRate),
      };
    });

    setCopyFromModelPurchase(updatedData);
    setOpenPurchase(true);
  };
  // Improved close handler
  const handleClosePurchase = useCallback((e) => {
    setOpenPurchase(false);
    setCopyFromModelPurchase([]);

    // setOlines([]);
    // setCheckedItems(checkedItems);
  }, []);

  const onSubmitCopyFrom = (data) => {
    const DocumentBaseCopyForm = [
      ...new Set(selectedRowsPurchase.map((item) => item.ItemCode)),
    ].length;
    if (DocumentBaseCopyForm === 0) {
      Swal.fire({
        text: "No document selected.",
        icon: "warning",
        // showCancelButton: true,
        confirmButtonText: "OK",
        // cancelButtonText: "No",
        // reverseButtons: true,
        toast: false,
        willOpen: () => {
          document.querySelector(".swal2-container").style.zIndex = "9999";
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // ✅ User clicked "Yes"
          console.log("Continuing without selection...");
          // 👉 Call your function here
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // ❌ User clicked "No"
          console.log("Action cancelled");
          return;
        }
      });
      return;
    }
    setCheckedItems(checkedItems);
    const updatedOExpLineData = oExpLineData.map((item) => {
      const latestDocRate = getValues("DocRate");
      const TotalFrgn =
        currency === companyData.MainCurncy
          ? item.LineTotal / latestDocRate
          : item.TotalFrgn;
      const LineTotal =
        currency === companyData.MainCurncy
          ? item.LineTotal
          : ValueFormatter(TotalFrgn * latestDocRate);
      const TotalSumSy = ValueFormatter(LineTotal / SysRate);
      const headerDisc = taxCalculation(
        LineTotal,
        item.AssblValue,
        item.DocTotal,
        item.PriceBefDi,
        item.Quantity,
        item.TaxCode,
      );
      return {
        ...item,
        DocEntry: item.ExpnsCode,
        Status: "1",
        LineTotal: LineTotal,
        TotalFrgn: TotalFrgn,
        TotalSumSy: TotalSumSy,
        VatSum: ValueFormatter(headerDisc.VatSum),
        VatSumSy: ValueFormatter(headerDisc.VatSumSy),
        VatSumFrgn: ValueFormatter(headerDisc.VatSumFrgn),
        OpenQuantity: item.Quantity,
        oTaxLines: headerDisc.oTaxLines,
      };
    });
    let dissum = parseFloat();
    setValue("DiscountAmt", dissum.toFixed(3));
    let UpdatedOlines = [];
    const uniqueBaseNums = [
      ...new Set(OlinesData.map((item) => item.BaseDocNum)),
    ].length;

    selectedRowsPurchase.forEach((item) => {
      let LineDiscount = item.HerDiscount;
      if (uniqueBaseNums > 1) {
        const headerDisc = taxCalculation(
          item.LineTotal,
          item.AssblValue,
          item.DocTotal,
          item.PriceBefDi,
          item.Quantity,
          item.TaxCode,
        );
        const match = warehouseData.find(
          (loc) =>
            loc.Location === item.LocCode && loc.WHSCode === item.WHSCode,
        );

        UpdatedOlines.push({
          ...item,
          oTaxLines: headerDisc.oTaxLines,
          // Vatsum: ValueFormatter(headerDisc.VatSum),
          VatSum: ValueFormatter(headerDisc.VatSum),
          VatSumSy: headerDisc.VatSumSy,
          VatSumFrgn: headerDisc.VatSumFrgn,
          LocationName: match?.LocationName || "", // <- Get from matched object safely
          LocCode: match?.Location || "",
          BinCode: match?.BinCode ?? "",
          DftBinAbs: match?.DftBinAbs,
          OpenQuantity: item.Quantity,
          BinActivat: match?.BinActivat,
          Bin: item.Quantity,
        });
        const updatedData = {
          ...allFormData,
          oLines: [...allFormData.oLines, ...UpdatedOlines],
          oExpLines: [...allFormData.oExpLines, ...updatedOExpLineData],
        };

        setAllDAtaCopyform([]);
        reset(updatedData);
      } else {
        let HerLineTotal =
          item.LineTotal - (item.LineTotal * (item.HerDiscount || 0)) / 100;
        let DisAmt = item.LineTotal - HerLineTotal;
        dissum += DisAmt;
        const headerDisc = taxCalculation(
          HerLineTotal,
          item.AssblValue,
          item.DocTotal,
          item.PriceBefDi,
          item.Quantity,
          item.TaxCode,
        );
        const match = warehouseData.find(
          (loc) =>
            loc.Location === item.LocCode && loc.WHSCode === item.WHSCode,
        );
        UpdatedOlines.push({
          ...item,
          // LineTotal:LineTotal,
          oTaxLines: headerDisc.oTaxLines,
          // Vatsum: ValueFormatter(headerDisc.VatSum),
          VatSum: ValueFormatter(headerDisc.VatSum),
          VatSumSy: headerDisc.VatSumSy,
          VatSumFrgn: headerDisc.VatSumFrgn,
          LocationName: match?.LocationName || "", // <- Get from matched object safely
          LocCode: match?.Location || "",
          BinCode: match?.BinCode ?? "",
          DftBinAbs: match?.DftBinAbs,
          OpenQuantity: item.Quantity,
          BinActivat: match?.BinActivat,
          Bin: item.Quantity,
        });
        let newData = allFormData.oTaxExtLines.map((add) => ({
          ...add,
          BlockB: CopyformData.oTaxExtLines[0]?.BlockB ?? "",
          StreetB: CopyformData.oTaxExtLines[0]?.StreetB ?? "",
          CityB: CopyformData.oTaxExtLines[0]?.CityB ?? "",
          StateB: CopyformData.oTaxExtLines[0]?.StateB ?? "",
          CountryB: CopyformData.oTaxExtLines[0]?.CountryB ?? "",
          ZipCodeB: CopyformData.oTaxExtLines[0]?.ZipCodeB ?? "",
          BlockS: CopyformData.oTaxExtLines[0]?.BlockS ?? "",
          StreetS: CopyformData.oTaxExtLines[0]?.StreetS ?? "",
          CityS: CopyformData.oTaxExtLines[0]?.CityS ?? "",
          StateS: CopyformData.oTaxExtLines[0]?.StateS ?? "",
          CountryS: CopyformData.oTaxExtLines[0]?.CountryS ?? "",
          ZipCodeS: CopyformData.oTaxExtLines[0]?.ZipCodeS ?? "",
        }));

        const updatedData = {
          ...allFormData,
          oLines: [...allFormData.oLines, ...UpdatedOlines],
          oExpLines: [...allFormData.oExpLines, ...updatedOExpLineData],
          oTaxExtLines: newData,
        };
        reset(updatedData);
        setRollBackoExpLines(updatedOExpLineData);
        setValue("Discount", LineDiscount);
        calculateDiscountAmt(LineDiscount);
        setValue("CompnyAddr", CopyformData.Address2);
        setValue("Comments", CopyformData.Comments);
        setValue("DfltAddress", CopyformData.Address);
        setValue("SlpCode", CopyformData.SlpCode);
        setValue("PayToCode", CopyformData.PayToCode);
        setValue("TrnspCode", CopyformData.TrnspCode);

        setValue("TotalExpFC", CopyformData?.TotalExpFC ?? "");
        setValue("TaxOnExpFc", CopyformData?.TaxOnExpFc ?? "");
        setValue("TaxOnExpSc", CopyformData?.TaxOnExpSc ?? "");
        setValue("TotalExpSC", CopyformData?.TotalExpSC ?? "");
        setValue("Currency", CopyformData?.DocCur ?? "");
        setValue("BlockB", CopyformData.oTaxExtLines[0]?.BlockB ?? "");
        setValue("StreetB", CopyformData.oTaxExtLines[0]?.StreetB ?? "");
        setValue("CityB", CopyformData.oTaxExtLines[0]?.CityB ?? "");
        setValue("StateB", CopyformData.oTaxExtLines[0]?.StateB ?? "");
        setValue("CountryB", CopyformData.oTaxExtLines[0]?.CountryB ?? "");
        setValue("ZipCodeB", CopyformData.oTaxExtLines[0]?.ZipCodeB ?? "");
        setValue("BlockS", CopyformData.oTaxExtLines[0]?.BlockS ?? "");
        setValue("StreetS", CopyformData.oTaxExtLines[0]?.StreetS ?? "");
        setValue("CityS", CopyformData.oTaxExtLines[0]?.CityS ?? "");
        setValue("StateS", CopyformData.oTaxExtLines[0]?.StateS ?? "");
        setValue("CountryS", CopyformData.oTaxExtLines[0]?.CountryS ?? "");
        setValue("ZipCodeS", CopyformData.oTaxExtLines[0]?.ZipCodeS ?? "");
      }
      setValue("DocType", CopyformData.DocType);
      setType(CopyformData.DocType);
      setRollBackoExpLines(updatedOExpLineData);
      calculateExpenseTotals(updatedOExpLineData, setValue);
      setOlines([]);
      setCheckedItems({});
      handleCloseDialog();
      handleClosePurchase();
    });

    // setTimeout(() => {
    //   setFrieghtopen(true);
    // }, 800);
  };

  const isRowSelectable = (params) => {
    const olines = getValues("oLines");
    return !olines.some((obj) => obj.LineNum === params.row.LineNum);
  };

  const handleSelectionChange = (selectedIDs) => {
    const selectedRows = copyFromModelPurchase.filter((row) =>
      selectedIDs.includes(row.LineNum),
    );
    setSelectedRowsPurchase(selectedRows);
  };
  //#endregion Copy Form
  // ------------------------------------------------------------------------------------------------------------------------

  const tabData = [
    {
      value: "0",
      label: "Open",
      data: openListData,
      query: openListquery,
      hasMore: hasMoreOpen,
      fetchMore: fetchMoreOpenListData,
      handleSearch: handleOpenListSearch,
      handleClear: handleOpenListClear,
    },
    {
      value: "1",
      label: "Closed",
      data: closedListData,
      query: closedListquery,
      hasMore: hasMoreClosed,
      fetchMore: fetchMoreClosedListData,
      handleSearch: handleClosedListSearch,
      handleClear: handleClosedListClear,
    },
    {
      value: "2",
      label: "Cancel",
      data: cancelledListData,
      query: cancelledListquery,
      hasMore: hasMoreCancelled,
      fetchMore: fetchMoreCancelListData,
      handleSearch: handleCancelListSearch,
      handleClear: handleCancelListClear,
    },
  ];

  const onsubmitSeriel = (data) => {
    const UpdatedoSerialLines = oLines.map((item, index) => {
      if (data.Ids === index) {
        return {
          ...item,
          oSerialLines: data?.oSerialLines ?? [],
        };
      }
      return item;
    });
    setValue("oLines", UpdatedoSerialLines);
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
    console.log("UpdatedoBatchLines", UpdatedoBatchLines);
    setValue("oLines", UpdatedoBatchLines);
  };
  // ------------------------------------------------------------------------------------------------------------------------
  const handleOnSerial = (rowData) => {
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      InvQty: rowData.InvQty,
      WHSCode: rowData.WHSCode,
      OpenQuantity: rowData.OpenQuantity,
      BaseEntry: rowData.BaseEntry,
      BaseType: rowData.BaseType,
      id: rowData.id,
      oSerialLines: rowData?.oSerialLines ?? [],
    });
    if (rowData.BaseType > 0) {
      setopenserialOutCopy(true);
    } else {
      setopenserial(true);
    }
  };

  const handleOnBatch = (rowData) => {
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      InvQty: rowData.InvQty,
      WhsCode: rowData.WHSCode,
      BaseType: rowData.BaseType,
      BaseEntry: rowData.BaseEntry,
      BaseNum: rowData.BaseNum,
      BaseLinNum: rowData.BaseLinNum,
      CardCode: rowData.CardCode,
      CardName: rowData.CardName,
      id: rowData.id,
    });
    if (rowData.BaseType > 0) {
      setopenBatchCopyform(true);
    } else {
      setopenBatch(true);
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
        // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } ,}}
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
          Goods Return List
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
            {/* <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={handleTabChangeRight}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="0" label="Open" />
                <Tab value="1" label="Closed" />
              </Tabs>

              <TabPanel
                value={"0"}
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
                      title={item.CardName}
                      subtitle={item.DocNum}
                      description={dayjs(item.TaxDate).format("DD/MM/YYYY")}
                      searchResult={openListquery}
                      isSelected={oldOpenData === item.DocEntry}
                      onClick={() =>
                        setOldOpenData(
                          item.DocEntry,
                          item.CardCode,
                          item.CntctCode
                        )
                      }
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              <TabPanel
                value={"1"}
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
                      title={item.CardName}
                      subtitle={item.DocNum}
                      description={dayjs(item.TaxDate).format("DD/MM/YYYY")}
                      searchResult={closedListquery}
                      isSelected={oldOpenData === item.DocEntry}
                      onClick={() =>
                        setOldOpenData(
                          item.DocEntry,
                          item.CardCode,
                          item.CntctCode
                        )
                      }
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
            </TabContext> */}
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
                          title={item.CardName}
                          subtitle={item.DocNum}
                          description={dayjs(item.TaxDate).format("DD/MM/YYYY")}
                          searchResult={query}
                          isSelected={oldOpenData === item.DocEntry}
                          onClick={() =>
                            setOldOpenData(
                              item.DocEntry,
                              item.CardCode,
                              item.CntctCode,
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

  // ------------------------------------------------------------------------------------------------------------------------

  return (
    <>
      {/* =========== ITEM MODEL ============= */}
      {/* {apiloading && <Loader open={apiloading} />} */}
      <DynamicLoader open={apiloading} />

      <SerialOuttake
        Title="SERIAL NUMBER"
        openserialmodal={openserial}
        DialogClosePayto={handleCloseSerial}
        onSubmit={(serialData) => onsubmitSeriel(serialData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={selectedItem?.InvQty}
        WHSCode={selectedItem?.WHSCode}
        OpenQuantity={selectedItem?.OpenQuantity}
        BaseEntry={selectedItem?.BaseEntry}
        BaseType={selectedItem?.BaseType}
        Ids={selectedItem?.id}
        oSerialLines={selectedItem?.oSerialLines}
      />

      <SerialOutCopyForm
        Title="SERIAL NUMBER"
        openserialmodal={openserialOutCopy}
        DialogClosePayto={handleCloseSerialCopyform}
        onSubmit={(serialData) => onsubmitSeriel(serialData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={selectedItem?.InvQty}
        WHSCode={selectedItem?.WHSCode}
        OpenQuantity={selectedItem?.OpenQuantity}
        BaseEntry={selectedItem?.BaseEntry}
        BaseType={selectedItem?.BaseType}
        Status={"1"}
        Ids={selectedItem?.id}
      />
      <BatchOuttake
        Title="BATCH NUMBER"
        openBatchmodal={openBatch}
        DialogClosePayto={handleCloseBatch}
        onSubmit={(BatchData) => onsubmitBatch(BatchData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={selectedItem?.InvQty}
        WHSCode={selectedItem?.WhsCode}
        Ids={selectedItem?.id}
      />
      <BatchOutCopyform
        Title="BATCH NUMBER"
        openBatchmodal={openBatchCopyform}
        DialogClosePayto={handleCloseBatchCopyform}
        onSubmit={(BatchData) => onsubmitBatch(BatchData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={selectedItem?.InvQty}
        WHSCode={selectedItem?.WhsCode}
        Status={"1"}
        BaseEntry={selectedItem?.BaseEntry}
        BaseType={selectedItem?.BaseType}
        Ids={selectedItem?.id}
      />
      <DataGridModal
        open={open}
        closeModel={closeModel}
        onSubmit={onSubmit}
        isLoading={itemLoading && itemList.length === 0}
        title="Item List"
        getRowId={(row) => row.DocEntry}
        columns={modelColumns}
        rows={itemList}
        paginationMode="server"
        currentPage={itemPage}
        limit={20}
        rowCount={itemRowCount}
        onPaginationModelChange={onItemPageChange}
        onRowSelectionModelChange={handleCellClick}
        searchText={itemSearch}
        onSearchChange={onItemSearch}
        oLines={getValues("oLines")}
      />
      <DataGridModal
        open={serviceopen}
        closeModel={handleClose}
        onSubmit={onSubmit}
        isLoading={serviceLoading && itemList.length === 0}
        title="SERVICES"
        limit={LIMIT}
        currentPage={servicePage}
        rowCount={serviceRowCount}
        getRowId={(row) => row.DocEntry}
        columns={ServiceCol}
        rows={serviceList}
        onPaginationModelChange={onServicePageChange}
        onRowSelectionModelChange={handleServiceRowClick}
        searchText={serviceSearch}
        onSearchChange={onServiceSearch}
        oLines={getValues("oLines")}
      />
      {/* =========== ITEM MODEL ============= */}

      <TaxDatagridCellModel
        open={openTax}
        apiRef={apiRef}
        closeModel={TaxCloseModel}
        isLoading={isLoading}
        title="Tax List"
        getRowId={(row) => row.DocEntry}
        columns={TaxColumn}
        rows={TaxgetListData}
        taxCurrentPage={taxCurrentPage}
        limit={LIMIT}
        onPaginationModelChange={handleTaxPaginationModelChange}
        onCellClick={handleSelectTax}
        searchText={taxSearchText}
        onSearchChange={handleTaxSearchChange}
        rowCount={taxRowCount}
        selectedRowIndex={getValues("selectedRowIndex")}
        oLines={getValues("oLines")}
      />
      <TaxCategoryModel
        open={taxcategoryopen}
        closeModel={TaxCatClose}
        isLoading={isLoading}
        title="Tax Amount Distribution"
        getRowId={(row) => row.staType}
        columns={TaxCotegoryColumn}
        rows={oTaxLineCategory}
        rowCount={taxRowCount}
        selectedRowIndex={getValues("selectedRowIndex")}
        oLines={getValues("oLines")}
        // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
      />
      <Modal
        open={openFreight}
        onClose={closeFreightModel}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: {
              xs: "87%",
              sm: "68%",
              md: "55%",
              lg: "37%",
            },
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Grid
            container
            component={"form"}
            onSubmit={handleSubmit(handleSave)}
          >
            <Grid
              container
              item
              mt={2}
              sx={{
                px: 2,
                overflow: "auto",
                width: "100%",
              }}
            >
              <Paper sx={{ width: "100%" }}>
                <DataGrid
                  columnHeaderHeight={35}
                  rowHeight={45}
                  className="datagrid-style"
                  // isRowSelectable={(params) => {
                  //   console.log(LineData.some((obj) => obj.DocEntry === params.row.DocEntry));
                  //   return !LineData.some((obj) => obj.DocEntry === params.row.DocEntry);
                  // }}
                  rows={frieghtdata}
                  columns={FrightSeletColumns}
                  getRowId={(row) => row.DocEntry}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 8,
                      },
                    },
                  }}
                  // hideFooter
                  checkboxSelection
                  // onCellClick={handleCellClick}
                  onRowSelectionModelChange={(id) => handleFrightCellClick(id)}
                  pageSizeOptions={[3]}
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "light" ? "#fff" : "#373842",
                    "& .MuiDataGrid-cell": {
                      border: "none",
                    },
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                />
              </Paper>
            </Grid>

            <Grid
              item
              mt={1}
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
                color="success"
                // type="submit"
                onClick={handleSave}
              >
                Save
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={closeFreightModel}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <TaxDatagridCellModel
        open={state.TaxFrieghtOpen}
        apiRef={apiRef}
        closeModel={() => dispatch({ type: "CLOSE", modal: "TaxFrieghtOpen" })}
        title="Tax List"
        getRowId={(row) => row.DocEntry}
        columns={TaxColumn}
        rows={FrieghtTax}
        taxCurrentPage={taxCurrentPage}
        limit={LIMIT}
        onPaginationModelChange={handleTaxPaginationModelChange}
        onCellClick={handleSelectFrieghtTax}
        searchText={taxSearchText}
        onSearchChange={handleTaxSearchChange}
        rowCount={taxRowCount}
        selectedRowIndex={getValues("selectedRowIndex")}
        oLines={getValues("oExpLines")}
      />
      <TableGridFrieght
        open={frieghtopen}
        apiRef={apiRef}
        closeModel={handleFrightClose}
        onSubmit={handleFrightSubmit}
        isLoading={isLoading}
        title="FREIGHT"
        columns={FrieghtCol}
        processRowUpdate={processFreightRowUpdate}
        onCellKeyDown={handleFreightKeyDown}
        SelectFreight={SelectFreight}
        rows={getValues("oExpLines").map((data, index) => ({
          ...data,
          id: index,
        }))}
        getRowId={(row) => row.id}
        curSource={curSource}
        Currency={getValues("Currency")}
      />

      <ExchangeLineRateCopyform
        open={state.exchaneRateLineCpyform}
        closeModel={() =>
          dispatch({ type: "CLOSE", modal: "exchaneRateLineCpyform" })
        }
        onSubmit={onSubmitLineCurrency}
        data={AllDataCopyRateLine}
        isLoading={isLoading}
        title="Exchange Rate"
      />

      <AllBinLocationShow
        open={state.BinLocationOpen}
        closeModel={() => dispatch({ type: "CLOSE", modal: "BinLocationOpen" })}
        onSubmit={handleBinlocationSubmit}
        isLoading={isLoading}
        title="Bin Location"
        data={getValues("BinLocation")}
        DocNum={getValues("DocNum")}
        getRowId={(row) => row.id}
        SaveUpdateName={SaveUpdateName}
      />
      {/* Uom Code Modal */}
      <Dialog
        open={openUomCode}
        onClose={() => setUomcodeOpen(false)}
        scroll="paper"
        maxWidth="md"
      >
        <DialogTitle>
          <Grid container alignItems="center" justifyContent="space-between">
            <Typography
              variant="h6"
              component="div"
              textAlign={"center"}
              alignItems={"center"}
            >
              &nbsp; &nbsp; &nbsp; UOM LIST
            </Typography>
            <IconButton
              onClick={() => setUomcodeOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {UomCodeList.map((item, i) => (
            <CardComponent
              key={i}
              title={item.UomCode}
              subtitle={item.UomName}
              searchResult={closedListquery}
              isSelected={
                getValues(`oLines.${getValues("selectedRowIndex")}.UomCode`) ===
                item.UomCode
              }
              onClick={() =>
                selectUomCode(
                  item.UomCode,
                  item.UomEntry,
                  item.UomName,
                  item.AltQty,
                  item.BaseQty,
                )
              }
            />
          ))}
        </DialogContent>
      </Dialog>

      {/* WHSCode Code Modal */}
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
                onClick={() => {
                  selectWhSCode(
                    item.WHSCode,
                    item.Location,
                    item.LocationName,
                    item.GSTRegnNo,
                    item.GSTType,
                    item.BalInvntAc,
                    item.BinCode,
                    item.DftBinAbs,
                    item.BinActivat,
                  );
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      {/* ============Modal/Dialog============ */}
      <CopyFromSearchModel
        open={openDialog}
        onClose={handleCloseDialog}
        onCancel={handleCloseDialog}
        onChange={(e) => handleGetListSearchCopyFrom(e.target.value)}
        value={getListqueryCopyFrom}
        onClickClear={handleGetListClearCopyFrom}
        // title={selectedItem}
        // onSelectChange={() => fetchCopyFromData()}
        Input={
          <>
            <Typography variant="subtitle1" fontWeight="bold">
              Copy From Document
            </Typography>

            <Grid item xs={12} sm={12} md={6} lg={6} textAlign={"center"}>
              <Controller
                name="baseType"
                control={control}
                defaultValue={"20"}
                render={({ field, fieldState: { error } }) => (
                  <InputSelectTextField
                    label="Select Document"
                    data={[
                      { key: "20", value: "Goods Receipt PO" },
                      // { key: "2", value: "UP" },
                    ]}
                    {...field}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                    onChange={(e) => {
                      field.onChange(e); // Update form state with React Hook Form
                      setCheckedItems({});
                      // fetchCopyFromData(0, "", type);
                      // Trigger your custom function
                      setOlines([]);
                      setoExpLines([]);
                    }}
                  />
                )}
              />
            </Grid>
            <Grid
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
                  <strong>Vendor Code:</strong> {allFormData.CardCode || "--"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={4} textAlign="center">
                <Typography variant="body2">
                  <strong>Vendor Name:</strong>{" "}
                  <Tooltip title={allFormData.CardName || "--"}>
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
            </Grid>
          </>
        }
        onSave={handleOpenPurchase}
        cardData={
          <>
            <InfiniteScroll
              style={{
                textAlign: "center",
                justifyContent: "center",
              }}
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
              {getListPOData.map((item, i) => (
                <CardCopyFrom
                  key={i}
                  id={i}
                  title={item.DocNum}
                  subtitle={dayjs(item.DocDate).format("DD/MM/YYYY")}
                  description={dayjs(item.DocDueDate).format("DD/MM/YYYY")}
                  searchResult={getListqueryCopyFrom}
                  isSelected={oLines.some(
                    (selectBase) => selectBase.BaseDocNum === item.DocNum,
                  )}
                  checked={checkedItems[item.DocNum] || false}
                  value={checkedItems}
                  onClick={(e) => {
                    onClickCopyFrom(e, item, i, item.DocNum);
                    // handleCellClickPurchaseModel(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />

      {/* Purchase Save Button Modal */}
      <Modal
        open={openPurchase}
        onClose={(e) => handleClosePurchase(e)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: "95%",
              md: "85%",
              lg: "85%",
            },
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Box component="form" onSubmit={handleSubmit(onSubmitCopyFrom)}>
            <Grid
              container
              mt={2}
              sx={{ px: 2, overflow: "auto", width: "100%" }}
            >
              <Paper sx={{ width: "100%" }}>
                <DataGrid
                  columnHeaderHeight={35}
                  rowHeight={45}
                  rows={copyFromModelPurchase.map((item, index) => ({
                    ...item,
                    id: index + 1,
                  }))}
                  columns={type === "I" ? CopyFromCol : CopyFromServices}
                  getRowId={(row) => row.LineNum}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 8,
                      },
                    },
                  }}
                  checkboxSelection
                  disableRowSelectionOnClick
                  isRowSelectable={isRowSelectable}
                  onRowSelectionModelChange={(selectedIDs) =>
                    handleSelectionChange(selectedIDs)
                  }
                  pageSizeOptions={[3]}
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "light" ? "#fff" : "#373842",
                    "& .MuiDataGrid-cell": {
                      border: "none",
                    },
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                />
              </Paper>
            </Grid>

            <Grid
              container
              item
              mt={1}
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
                color="success"
                type="submit"
                onClick={onSubmitCopyFrom}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClosePurchase}
              >
                Back
              </Button>
            </Grid>
          </Box>
        </Box>
      </Modal>
      <LogisticAddress
        Title="PAY TO DETAILS"
        openPayTo={openPayTo}
        DialogClosePayto={DialogClosePayto}
        onSubmit={handleSubmitAddress}
        BlockB={getValues("BlockB") || ""}
        StreetB={getValues("StreetB") || ""}
        CityB={getValues("CityB") || ""}
        StateB={getValues("StateB") || ""}
        ZipCodeB={getValues("ZipCodeB") || ""}
        CountryB={getValues("CountryB") || ""}
      />

      <LogisticAddress
        Title="COMPANY DETAILS"
        openPayTo={openCompany}
        DialogClosePayto={DialogCloseCompany}
        onSubmit={handleConmpanyAddress}
        BlockB={getValues("BlockS") || ""}
        StreetB={getValues("StreetS") || ""}
        CityB={getValues("CityS") || ""}
        StateB={getValues("StateS") || ""}
        ZipCodeB={getValues("ZipCodeS") || ""}
        CountryB={getValues("CountryS") || ""}
      />

      {/* =================================================================================== */}

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        component={"form"}
        position={"relative"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={6}
          lg={3}
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
              left: "10px",
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
              position: "absolute",
              right: "50px",
              // color: "black",
              // mt: -1,
            }}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={Openmenu}
            onClose={handleCloseCancelClosed}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              // disabled={
              //   BaseType
              //     ? OpenQuantity === Quantity ||
              //       SaveUpdateName === "SAVE" ||
              //       tab === "2"
              //     : !(OpenQuantity === Quantity) ||
              //       SaveUpdateName === "SAVE" ||
              //       tab === "2"
              // }
              disabled={
                !(OpenQuantity === Quantity) ||
                SaveUpdateName === "SAVE" ||
                tab === "2"
              }
              onClick={() => {
                handleOnCancelDocument();
                handleCloseCancelClosed();
              }}
            >
              <ListItemIcon>
                <HighlightOffIcon
                  fontSize="small"
                  sx={{ fontWeight: "bold" }}
                />
              </ListItemIcon>
              <Typography
                disabled={
                  !(OpenQuantity === Quantity) || SaveUpdateName === "SAVE"
                }
                fontWeight="bold"
              >
                CANCEL
              </Typography>
            </MenuItem>
            <MenuItem
              disabled={SaveUpdateName === "SAVE" || tab === "1" || tab === "2"}
              onClick={() => {
                handleOnCloseDocument();
                handleCloseCancelClosed();
              }}
            >
              <ListItemIcon>
                <DoNotDisturbAltSharpIcon
                  fontSize="small"
                  sx={{ fontWeight: "bold" }}
                />
              </ListItemIcon>
              <Typography
                disabled={SaveUpdateName === "SAVE"}
                fontWeight="bold"
              >
                CLOSE
              </Typography>
            </MenuItem>
          </Menu>
          {/* </div> */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={ClearForm}
            sx={{
              display: {}, // Show only on smaller screens
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
              Good Return
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
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CardCode"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="VENDOR CODE"
                          readOnly={true}
                          disabled={!!DocEntry}
                          onClick={() => {
                            OpenDailog();
                          }}
                          onChange={OpenDailog}
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                    <SearchBPModel
                      open={searchmodelOpen}
                      onClose={SearchModelClose}
                      onCancel={SearchModelClose}
                      title="Select Vendor/Supplier"
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
                                key={index}
                                title={item.CardCode}
                                subtitle={item.CardName}
                                description={item.Cellular}
                                searchResult={getListquery}
                                isSelected={
                                  allFormData.CardCode === item.CardCode
                                }
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
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CardName"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="VENDOR NAME"
                          readOnly={true}
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
                      name="NumAtCard"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="VENDOR REF.NO."
                          type="text"
                          disabled={isFieldDisabled}
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
                    rowSpacingspacing={1}
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
                          disabled={isFieldDisabled}
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
                      name="DocDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="POSTING DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setValue(
                              "DocDate",
                              dayjs(date).format("YYYY-MM-DD"),
                              { shouldDirty: true },
                            );
                            setValue("DocDueDate", date, { shouldDirty: true });
                          }}
                          disabled={isFieldDisabled}
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
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="DUE DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          minDate={getValues("DocDate")}
                          onChange={(date) => setValue("DocDueDate", date)}
                          disabled={!getValues("DocDate") || isFieldDisabled} // Disable due date picker until start date is selected
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
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValue("TaxDate", newValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                          disabled={isFieldDisabled}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CurSource"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="CURRENCY SOURCE"
                          disabled={currentData.CardCode === ""}
                          data={[
                            { key: "L", value: "LOCAL CURRENCY" },
                            { key: "S", value: "SYSTEM CURRENCY" },
                            { key: "C", value: "BP CURRENCY" },
                          ]}
                        />
                      )}
                    />
                  </Grid>
                  {curSource !== "L" && curSource !== "S" && type !== "S" ? (
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={6}
                      xs={12}
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
                        sx={{ width: 230 }}
                      >
                        <Controller
                          name="Currency"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSelectTextField
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              label="CURRENCY"
                              readOnly={BusinessPartnerData.Currency !== "AC"}
                              disabled={currentData.CardCode === ""}
                              data={currencydata.map((item) => ({
                                key: item.CurrCode,
                                value: item.CurrCode,
                              }))}
                              // title={`${field.value}`}
                              onChange={(e) => {
                                onchange?.field?.(e);
                                const currecnycur = e.target.value;
                                const RecordRate = data[docDate] || [];
                                const recordRateWise = RecordRate.find(
                                  (item) =>
                                    item.Currency === String(currecnycur),
                                );
                                const DocRateH =
                                  currecnycur === companyData.MainCurncy
                                    ? "1"
                                    : String(recordRateWise?.Rate ?? "0");
                                setValue("DocRate", DocRateH);
                                setValue("Currency", currecnycur);
                                if (DocRateH === "0") {
                                  setValue(
                                    "DocEntryCur",
                                    recordRateWise?.DocEntry ?? "",
                                  );
                                  const missingRates = [
                                    {
                                      Type: "DocumentRate",
                                      Currency: currecnycur,
                                      Rate: DocRateH,
                                      DocEntry: recordRateWise?.DocEntry ?? "0",
                                      RateDate: docDate,
                                    },
                                  ];
                                  setAllDataCopyRateLine(missingRates);
                                  dispatch({
                                    type: "OPEN",
                                    modal: "exchaneRateLineCpyform",
                                  });
                                  Swal.fire({
                                    title: "Missing Rates",
                                    text: "Some currency exchange rates are missing.",
                                    icon: "warning",
                                  });

                                  return;
                                }
                              }}
                            />
                          )}
                        />

                        {companyData.MainCurncy !== watch("Currency") &&
                        curSource !== "L" &&
                        curSource !== "S" ? (
                          <Controller
                            name="DocRate"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                {...field}
                                error={!!error}
                                disabled={currentData.CardCode === ""}
                                helperText={error ? error.message : null}
                                label="RATE"
                                onBlur={(e) => {
                                  field.onBlur(e); // Call the original field onBlur first
                                  handleDocRateChange(e); // Then call your custom handler
                                }}
                              />
                            )}
                          />
                        ) : (
                          ""
                        )}
                      </Grid>
                    </Grid>
                  ) : (
                    ""
                  )}
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DocType"
                      control={control}
                      disabled={
                        allFormData.CardCode === "" ||
                        SaveUpdateName === "UPDATE"
                      }
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="ITEM/SERVICE TYPE"
                          // data={OpenList.map((item) => ({
                          //   key: item.index,
                          //   value: item.ReqType,
                          // }))}
                          disabled={isFieldDisabled}
                          data={[
                            { key: "I", value: "ITEM" },
                            { key: "S", value: "SERVICE" },
                          ]}
                          value={type}
                          onChange={(e) => {
                            // Update the field value
                            field.onChange(e);
                            // Set the 'type' state
                            // fetchCopyFromData(0, "", e.target.value);
                            setCheckedItems({});
                            setOlines([]);
                            setoExpLines([]);
                            setType(e.target.value);

                            // Prepare updated data and reset form
                            const updatedData = {
                              ...currentData,
                              oLines: [], // Reset the oLines
                            };
                            // Reset the form with the updated data after value change
                            reset(updatedData);

                            // Manually set the select field value if needed
                            field.onChange({
                              target: { value: e.target.value },
                            });
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Status"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="STATUS"
                          type="text"
                          readOnly={true}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ShipToCode"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const handleChangeWithConfirm = async (e) => {
                          const allFormData = getValues();
                          const newShipToCode = e.target.value;

                          // Get new ShipTo state's value
                          const newShipTo = BusinessPartnerData?.oLines?.find(
                            (addr) =>
                              addr.Address === newShipToCode &&
                              addr.AddressType === "S",
                          );
                          const newShipToState = newShipTo?.State;

                          if (allFormData.oLines?.length > 0) {
                            const result = await Swal.fire({
                              text: "Changing to ShipCode will clear tax codes. Are you sure?",
                              icon: "question",
                              confirmButtonText: "YES",
                              cancelButtonText: "NO",
                              showCancelButton: true,
                              showConfirmButton: true,
                            });

                            if (result.isConfirmed) {
                              field.onChange(e); // update ShipToCode field

                              const updatedLines = allFormData.oLines.map(
                                (line) => {
                                  // Get warehouse state for the line's WHSCode
                                  const warehouse = warehouseData.find(
                                    (whc) => whc.WHSCode === line.WHSCode,
                                  );
                                  const warehouseState = warehouse?.State;
                                  // Compare with new ShipToCode's state
                                  const taxIsValid =
                                    warehouseState === newShipToState;
                                  if (!taxIsValid) {
                                    return {
                                      ...line,
                                      TaxCode: "",
                                      VatGroup: "",
                                      VatPrcnt: "",
                                    };
                                  }

                                  return line; // keep tax if warehouse state matches new ShipTo state
                                },
                              );
                              setValue("oLines", updatedLines);
                            }
                          } else {
                            field.onChange(e); // No lines, just change the ShipToCode
                          }
                        };

                        return (
                          <InputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="SHIP FROM"
                            data={
                              BusinessPartnerData?.oLines
                                ? BusinessPartnerData.oLines
                                    .filter(
                                      (payto) => payto.AddressType === "S",
                                    )
                                    .map((item) => ({
                                      key: item.LineNum || "",
                                      value: item.Address || "",
                                    }))
                                : []
                            }
                            disabled={isFieldDisabled}
                            onChange={handleChangeWithConfirm}
                          />
                        );
                      }}
                    />
                  </Grid>

                  {/* ===================================== */}

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
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Button
                        variant="contained"
                        color="info"
                        sx={{ textTransform: "none" }}
                        // onClick={handleClick}
                        onClick={() => handleMenuItemClick("Copy From")}
                        disabled={
                          allFormData.CardCode === "" ||
                          allFormData.DocEntry ||
                          allFormData.Status === "Closed" ||
                          allFormData.Status === "Cancelled"
                        }
                      >
                        COPY FROM
                      </Button>
                    </Box>
                  </Grid>

                  {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
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
                      disabled={
                        type === "" ||
                        currentData.CardCode === "" ||
                        allFormData.DocEntry ||
                        allFormData.Status === "Closed" ||
                        allFormData.Status === "Cancelled"
                      }
                    >
                      {type === "I" ? "Search Item" : "Search Service"}

                      {/* Search Item */}
                    </Button>
                  </Grid>
                  {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}

                  {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    mt={1}
                  >
                    {/* <Button
                      variant="contained"
                      color="info"
                      onClick={handleClickOpen}
                      disabled={!currentData.DocType}
                    >
                      PAYMENT MEANS
                    </Button> */}
                  </Grid>
                  {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
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
                            <LocalShippingIcon sx={{ mr: 0.5 }} />{" "}
                            {/* Icon for Logistics */}
                            Logistics
                          </Grid>
                        }
                      />
                      <Tab
                        value={2}
                        label={
                          <Grid
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <AccountBalanceIcon sx={{ mr: 0.5 }} />{" "}
                            {/* Icon for Accounting */}
                            Accounting
                          </Grid>
                        }
                      />
                      <Tab
                        value={3}
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
                            key={type}
                            apiRef={apiRef}
                            className="datagrid-style"
                            rows={getValues("oLines").map((data, index) => ({
                              ...data,
                              id: index,
                            }))}
                            columnHeaderHeight={35}
                            rowHeight={40}
                            getRowId={(row) => row.id}
                            columns={columns}
                            editMode="cell"
                            experimentalFeatures={{ newEditingApi: true }}
                            isRowSelectable={(params) =>
                              params.row.Status !== "0"
                            }
                            getRowClassName={(params) => {
                              if (
                                params.row.Status === "0" ||
                                params.row.Status === "3"
                              ) {
                                return "disabled-row";
                              }
                              if (params.row.readonlyRow === "readonlyRow") {
                                return "readOnly-row";
                              }
                              return "";
                            }}
                            isCellEditable={(params) =>
                              !(
                                params.field === "Discount" &&
                                params.row.BaseType === "20"
                              )
                            }
                            getCellClassName={(params) =>
                              params.field === "Discount" &&
                              params.row.BaseType === "20"
                                ? "disabled-cell"
                                : ""
                            }
                            processRowUpdate={processRowUpdate}
                            onCellKeyDown={handleCellKeyDown}
                            onProcessRowUpdateError={(err) =>
                              console.error(err)
                            }
                            sx={gridSx}
                          />
                        </Grid>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      {tabvalue === 1 && (
                        <Grid container>
                          <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                            <Controller
                              name="CompnyAddr"
                              control={control}
                              rules={{ required: "this field is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  rows={3}
                                  multiline
                                  label="SHIP TO"
                                  type="text"
                                  readOnly={true}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      DialogOpenCompany();
                                    }
                                  }}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="top">
                                        <IconButton
                                          onClick={DialogOpenCompany}
                                          size="small"
                                          style={{
                                            backgroundColor: "green",
                                            borderRadius: "10%",
                                            color: "white",
                                            padding: 1,
                                            marginRight: -2,
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

                          <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                            <Controller
                              name="TrnspCode"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="SHIPPING TYPE"
                                  data={shippingType.map((item) => ({
                                    key: item.DocEntry,
                                    value: item.TrnspName,
                                  }))}
                                  disabled={isFieldDisabled}
                                />
                              )}
                            />
                            <Controller
                              name="PayToCode"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="PAYTO CODE"
                                  onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    field.onChange(selectedValue); // Update form state
                                    handleAddress(selectedValue); // Handle additional logic
                                  }}
                                  disabled={isFieldDisabled}
                                  data={
                                    BusinessPartnerData?.oLines
                                      ? BusinessPartnerData.oLines
                                          .filter(
                                            (payto) =>
                                              payto.AddressType === "P",
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

                          <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                            <Controller
                              name="DfltAddress"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="PAY TO"
                                  rows={3}
                                  multiline
                                  type="text"
                                  readOnly={true}
                                  {...field}
                                  error={!!error}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      DialogOpenPayto();
                                    }
                                  }}
                                  helperText={error ? error.message : null}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="top">
                                        <IconButton
                                          onClick={DialogOpenPayto}
                                          size="small"
                                          style={{
                                            backgroundColor: "green",
                                            borderRadius: "10%",
                                            color: "white",
                                            padding: 1,
                                            marginRight: -2,
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
                      )}
                    </Grid>
                    {tabvalue === 2 && (
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
                            name="JrnlMemo"
                            // rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="JOURNAL REMARK"
                                disabled={isFieldDisabled}
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
                            name="GroupNum"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputSelectTextField
                                {...field}
                                label="PAYMENT TERMS"
                                data={PaymentTermData.map((item) => ({
                                  key: item.DocEntry,
                                  value: item.PymntGroup,
                                }))}
                                disabled={isFieldDisabled}
                                onChange={(e) => {
                                  field.onChange(e); // Update the form field value
                                  getPaymentValue(e); // Call your custom handler
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
                            name="PayDuMonth"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputSelectTextField
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                label="PAYMENT DUE DATE"
                                disabled={isFieldDisabled}
                                data={[
                                  { key: "E", value: "MONTH END" },
                                  { key: "H", value: "MONTH HALF" },
                                  { key: "Y", value: "MONTH START" },
                                  { key: "N", value: "-" },
                                ].map((item) => ({
                                  key: item.key,
                                  value: item.value,
                                }))}
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
                          textAlign="center"
                        >
                          <Controller
                            name="ExtraMonth"
                            control={control}
                            // rules={{ required: "MONTHS" }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                label="MONTHS"
                                sx={{ width: 150 }}
                                size="small"
                                error={!!error}
                                disabled={isFieldDisabled}
                                helperText={error?.message}
                              />
                            )}
                          />
                          <Controller
                            name="ExtraDays"
                            control={control}
                            // rules={{ required: "MONTHS" }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                label="DAYS"
                                sx={{ width: 70 }}
                                size="small"
                                error={!!error}
                                disabled={isFieldDisabled}
                                helperText={error?.message}
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
                            name="CdcOffset"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="CASH DISCOUNT DATE OFFSET"
                                name={field.name}
                                disabled={isFieldDisabled}
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    )}
                    {tabvalue === 3 && (
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
                  {/* ------------------------------------------------------------------------------------------------------- */}
                  <Grid container>
                    <Grid item lg={3} md={4} sm={6} xs={6} textAlign={"center"}>
                      <Controller
                        name="SlpCode"
                        rules={{ required: "this field is required" }}
                        defaultValue={0} // Set default value to 0
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="BUYER"
                            disabled={isFieldDisabled}
                            data={[
                              // Add default option as first item
                              {
                                key: 0,
                                value: "NO Emp",
                              },
                              // Spread existing sales employee options
                              ...salesemp.map((item) => ({
                                key: item.SlpCode,
                                value: item.SlpName,
                              })),
                            ]}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={4}
                      sm={6}
                      lg={3}
                      textAlign={"center"}
                    >
                      <SmallInputTextField
                        label="TOTAL BEF DISC"
                        value={
                          curSource === "L"
                            ? ValueFormatter(totals.TotalBefDisc)
                            : curSource === "S"
                              ? ValueFormatter(totals.totalBefDiscSy)
                              : getValues("Currency") === companyData.MainCurncy
                                ? ValueFormatter(totals.TotalBefDisc)
                                : ValueFormatter(totals.totalBefDiscFrgn)
                        }
                        readOnly={true}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={4}
                      sm={6}
                      lg={3}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Discount"
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (value > 100) {
                              return "Discount cannot be greater than 100";
                            }
                            return true;
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="DISC(%)"
                            disabled={
                              allFormData.Status === "Closed" ||
                              allFormData.Status === "Cancelled" ||
                              type === "I"
                                ? BaseType
                                : ""
                            }
                            type="number"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            onBlur={handleDiscountChange} // Trigger discount calculation on blur
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={4}
                      sm={6}
                      lg={3}
                      textAlign={"center"}
                    >
                      <Controller
                        name={
                          curSource === "L"
                            ? "DiscountAmt"
                            : curSource === "S"
                              ? "DiscSumSy"
                              : getValues("Currency") === companyData.MainCurncy
                                ? "DiscountAmt"
                                : "DiscSumFC"
                        }
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (value < 0) {
                              return "Discount amount cannot be negative";
                            }
                            return true;
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="DISC AMOUNT"
                            type="number"
                            disabled={
                              allFormData.Status === "Closed" ||
                              allFormData.Status === "Cancelled" ||
                              type === "I"
                                ? BaseType
                                : ""
                            }
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            onBlur={(e) => {
                              handleDiscountAmtChange(e);
                              // recalculateHeaderDiscount();
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item md={4} sm={6} lg={3} xs={12} textAlign="center">
                      {/* <Controller
                                // name="TotalExpns"
                                name={
                                  curSource === "LC"
                                    ? "TotalExpns"
                                    : curSource === "SC"
                                    ? "TotalExpSC"
                                    : getValues("Currency") === companyData.MainCurncy
                                    ? "TotalExpns"
                                    : "TotalExpFC"
                                }
                                control={control}
                                render={({ field, fieldState: { error } }) => ( */}
                      <SmallInputTextField
                        label="TOTAL FREIGHT"
                        value={
                          curSource === "L"
                            ? TotalExpns
                            : curSource === "S"
                              ? TotalExpSC
                              : getValues("Currency") === companyData.MainCurncy
                                ? TotalExpns
                                : TotalExpFC
                        }
                        disabled={
                          !allFormData.CardCode ||
                          allFormData.Status === "Closed" ||
                          allFormData.Status === "Cancelled"
                        }
                        // error={!!error}
                        // helperText={error ? error.message : null}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                // onClick={handleFright}
                                onClick={
                                  allFormData.CardCode
                                    ? handleFright
                                    : undefined
                                }
                                disabled={
                                  !allFormData.CardCode ||
                                  allFormData.Status === "Closed" ||
                                  allFormData.Status === "Cancelled"
                                }
                                size="small"
                                style={{
                                  backgroundColor: "green",
                                  borderRadius: "10%",
                                  color: "white",

                                  padding: 2,
                                }}
                              >
                                <ViewListIcon
                                  disabled={allFormData.CardCode === ""}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {/* )}
                              /> */}
                    </Grid>

                    <Grid
                      item
                      md={4}
                      sm={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                    >
                      <SmallInputTextField
                        label="TAX"
                        disabled={
                          allFormData.Status === "Closed" ||
                          allFormData.Status === "Cancelled"
                        }
                        value={
                          curSource === "L"
                            ? ValueFormatter(VatSum)
                            : curSource === "S"
                              ? ValueFormatter(VatSumSy)
                              : getValues("Currency") === companyData.MainCurncy
                                ? ValueFormatter(VatSum)
                                : ValueFormatter(VatSumFC)
                        }
                        readOnly={true}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={4}
                      sm={6}
                      lg={3}
                      textAlign={"center"}
                    >
                      <Controller
                        name="RoundDif"
                        // rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="ROUNDING DIFF AMT"
                            disabled={
                              allFormData.Status === "Closed" ||
                              allFormData.Status === "Cancelled"
                            }
                            type="number"
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
                      md={4}
                      sm={6}
                      lg={3}
                      textAlign={"center"}
                    >
                      <Controller
                        name="DocTotal"
                        // rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="TOTAL PAY DUE"
                            type="number"
                            value={
                              curSource === "L"
                                ? ValueFormatter(DocTotal)
                                : curSource === "S"
                                  ? ValueFormatter(DocTotalSy)
                                  : getValues("Currency") ===
                                      companyData.MainCurncy
                                    ? ValueFormatter(DocTotal)
                                    : ValueFormatter(DocTotalFC)
                            }
                            readOnly={true} // Set readOnly as boolean
                            // {...field}
                            // error={!!error}
                            // helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={12}
                      sm={12}
                      lg={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Comments"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            label="REMARKS"
                            type="text"
                            rows={1}
                            sx={{ width: 440 }}
                            // fullWidth
                            multiline
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  {/* ------------------------------------------------------------------------------------------------------- */}
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
                    (SaveUpdateName !== "SAVE" && !perms.IsEdit) ||
                    allFormData.Status === "Closed" ||
                    allFormData.Status === "Cancelled"
                  }
                >
                  {SaveUpdateName}
                </Button>
              </Grid>
              <Grid item>
                <PrintMenu
                  disabled={SaveUpdateName === "SAVE"}
                  type={type}
                  DocEntry={DocEntry}
                  PrintData={PrintData}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
export default React.memo(PurchaseGoodReturn);
