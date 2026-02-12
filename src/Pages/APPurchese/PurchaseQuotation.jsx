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
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "antd";
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
import { fetchExchangeRateStore } from "../../slices/exchangeRateSlice";
import { dataGridSx } from "../../Styles/dataGridStyles";
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
import PrintMenu from "../Components/PrintMenu";
import SearchInputField from "../Components/SearchInputField";
import SearchModel, { CopyFromSearchModel, SearchBPModel } from "../Components/SearchModel";
import { getStatus } from "../Components/status";
import TableGridFrieght from "../Components/TableGridFrieght";
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

const FrightSeletColumns = [
  {
    id: 1,
    field: "ExpnsName",
    headerName: "Expns Name",
    width: 150,
    editable: false,
  },
];

const CopyFromCol = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "BaseDocNum", headerName: "Base Document", width: 150 },
  { field: "ItemCode", headerName: "Item No.", width: 150 },
  { field: "ItemName", headerName: "Item Description", width: 120 },
  {
    field: "Quantity",
    headerName: "Req qty",
    width: 90,
    editable: false, // Make it editable
  },

  {
    field: "PriceBefDi",
    headerName: "UNIT PRICE",
    sortable: false,
    width: 130,
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
    field: "Price",
    headerName: "PRICE AFTER DISCOUNT",
    sortable: false,
    width: 130,
    editable: false,
  },

  {
    field: "LineTotal",
    headerName: "Total",
    sortable: false,
    width: 130,
    editable: false, // Make it non-editable since it's calculated
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

  // {
  //   field: "G/LAccount",
  //   headerName: "G/L Account",
  //   width: 90,
  //   editable: false,
  //   renderCell: (params) => (
  //     <InputTextField
  //       name="QTY"
  //       value={params.value}
  //       onChange={(e) => handleChange(e, params.row)}
  //     />
  //   ),
  // },

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
  // {
  //   field: "QTY",
  //   headerName: "QUANTITY",
  //   width: 120,
  //   editable: true,
  // },
  {
    field: "Rate",
    headerName: "Rate",
    width: 120,
  },
];
const initialState = {
  exchaneRateOpen: false,
  SystemRateOpen: false,
  exchaneRateLineCpyform: false,
  DocRateOpen: false,
  TaxFrieghtOpen: false,
  modal3: false,
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

function PurchaseQuotation() {
  const theme = useTheme();
  const { user, companyData, warehouseData } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const perms = usePermissions(132);
  const [tabvalue, settabvalue] = useState(0);
  let [ok, setok] = useState("OK");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [PaymentTermData, setPaymentTermData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [frieghtopen, setFrieghtopen] = useState(false);
  const [salesemp, setSalesEmp] = useState([]);
  const [openFreight, setopenFreight] = useState(false);
  const [openPayTo, setOpenPayTo] = useState(false);
  let [openCompany, setopenComay] = useState(false);
  const [apiloading, setapiloading] = useState(false);
  const DialogOpenCompany = () => setopenComay(true);
  const [clearCache, setClearCache] = useState(false);

  const DialogOpenPayto = () => {
    setOpenPayTo(true);
  };
  const dispatchRedux = useDispatch();
  const { data } = useSelector((state) => state.exchange);
  const navigate = useNavigate();
  const [AllDataCopyRateLine, setAllDataCopyRateLine] = useState([]);
  const DialogCloseCompany = () => setopenComay(false);
  const [CopyformData, setAllDAtaCopyform] = useState([]);
  const DialogClosePayto = () => setOpenPayTo(false);
  const [ShippingTypeData, setShippingType] = useState([]);
  const [BusinessPartnerData, setBusinessPartnerData] = useState([]);
  const [UomCodeList, SetUomCode] = useState([]);
  const [taxcode, setTaxCode] = useState([]);
  const [FrieghtTax, setTaxFrieght] = useState([]);
  const [oldOpenData, setSelectData] = useState(null);
  const [frieghtdata, setFrieght] = useState([]);
  const [currencydata, setCurrencydata] = useState([]);
  const [type, setType] = useState("I");
  const [open, setOpen] = useState(false);
  const [serviceopen, setServiceOpen] = useState(false);
  const timeoutRef = useRef(null);
  const [PrintData, setPrintData] = useState([]);
  // ===========================Data Grid Pagination And Searching============================
  const LIMIT = 20;

  // ===========================End Grid Pagination And Searching============================
  // ===================Tax Data Grid Sate=================================================
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
  //=====================================Copy From List State====================================================================
  const [openDialog, setOpenDialog] = useState(false); // Control modal visibility
  const [getListPOData, setGetListPOData] = useState([]);
  const [hasMorePOList, setHasMorePOList] = useState(true);
  const [getListPageCopyFrom, setGetListPageCopyFrom] = useState(0);
  const [getListqueryCopyFrom, setGetLIstQueryCopyFrom] = useState("");
  const [getListSearchingCopyFrom, setGetListSearchingCopyFrom] =
    useState(false);
  //=========================================Copy From State End================================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);
  // =======================================================================================================================
  const [openUomCode, setUomcodeOpen] = useState(false);
  const [selectedRowsPurchase, setSelectedRowsPurchase] = useState([]);
  const [copyFromModelPurchase, setCopyFromModelPurchase] = useState([]);
  const [openPurchase, setOpenPurchase] = useState(false);
  const [OlinesData, setOlines] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [DocEntry, setDocEntry] = useState("");
  const [oExpLineData, setoExpLines] = useState([]);
  const [RollBackoExpLines, setRollBackoExpLines] = useState([]);
  //! ==============CANCEL LIST===============
  const [cancelledListData, setCancelledListData] = useState([]);
  const [cancelListPage, setCancelListPage] = useState(0);
  const [cancelListSearching, setCancelListSearching] = useState(false);
  const [cancelledListquery, setCancelledListQuery] = useState("");
  const [hasMoreCancelled, setHasMoreCancelled] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [DocumentupdateRate, setDocumentUpdateRate] = useState(0);
  const [SystemupdateRate, setSystemUpdateRate] = useState(0);
  const apiRef = useGridApiRef();
  const [isLoading, setIsLoading] = useState(true);

  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const Openmenu = Boolean(anchorEl);
  const handleClickCancelClosed = (event) => {
    setAnchorEl(event.currentTarget);
  };
  let handleCloseCancelClosed = () => {
    setAnchorEl(null);
  };
  let status = getStatus("1");

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const initialFormData = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    Status: status,
    SAPDocNum: "",
    SAPDocEntry: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD"),
    DocDueDate: dayjs(undefined).format("YYYY-MM-DD"),
    TaxDate: dayjs(undefined).format("YYYY-MM-DD "),
    ReqDate: "",
    CancelDate: "",
    PaidToDate: "0",
    DocType: "I",
    CANCELED: "",
    Series: "",
    Address: "",
    CardCode: "",
    CardName: "",
    DocTotalSy: "",
    ListNum: "",
    DiscSumFC: "",
    DiscSumSy: "",
    SysRate: "",
    TotalExpns: "0.000",
    TaxOnExpFc: "0.000",
    TotalBefDisc: "0.000",
    TotalBefDiscSy: "0.000",
    TotalBefDiscFrgn: "0.000",
    DiscountAmt: "0.000",
    DocNum: "",
    AttcEntry: "0",
    Currency: "",
    DocRate: "1",
    VatSum: "",
    VatSumSy: "",
    GrsAmount: "",
    RoundDif: "0.000",
    DocCur: "",
    DocTotal: "",
    CntctCode: "",
    PayToCode: "",
    ShipToCode: "",
    NumAtCard: "",
    WHSCode: "",
    SlpCode: "0",
    SlpName: "",
    Comments: "",
    Discount: ValueFormatter(""),
    ShipMode: "",
    PORevise: "",
    SAPSync: "",
    DfltAddress: "",
    CurSource: "",
    Address2: "",
    TrnspCode: "",
    GroupNum: "",
    JrnlMemo: "",
    CdcOffset: "",
    PayDuMonth: "N",
    ExtraDays: "",
    ExtraMonth: "0",
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
        ObjectType: "540000006",
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
    setError,
    formState: {}, // ✅ Correctly using `isDirty`
  } = useForm({
    defaultValues: initialFormData,
  });

  const currentData = getValues();
  const allFormData = getValues();
  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };
  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };
  const RoundDif = watch("RoundDif");
  const discPercent = watch("Discount");
  const curSource = watch("CurSource");
  const DocRate = watch("DocRate");
  const currency = watch("Currency");
  const docDate = getValues("DocDate");
  const GroupNum = watch("GroupNum");
  const SysRate = watch("SysRate");

  useEffect(() => {
    dispatchRedux(fetchExchangeRateStore(docDate))
      .unwrap()
      .then((data) => {
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
        setValue("SysRate", sysRate);
        const DateWiseSysRate = SystemupdateRate || sysRate; // FIX

        if (DateWiseSysRate <= 0) {
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
        let headerRate = DocumentupdateRate;
        if (!hasDocNum) {
          const headerRateObj = values.find((x) => x.Currency === headerCurr);
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
            item.Currency === mainCurr ? 1 : parseFloat(updatedRate?.Rate || 0);

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
              ValueFormatter((parseFloat(vat) || 0) + (parseFloat(total) || 0));
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
  console.log("Redux Data Store exchange", data);
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
  }, [companyData]);

  useEffect(() => {
    companyAddresss();
  }, []);

  let handleAddress = (value) => {
    let selectedAddress =
      (BusinessPartnerData?.oLines || []).find(
        (item) => item.LineNum === value,
      ) || {};
    let DfltAddress = [
      selectedAddress.BlockB,
      selectedAddress.Address2,
      selectedAddress.City,
      selectedAddress.State,
      selectedAddress.Zipcode,
      selectedAddress.Country,
    ].filter(v => v?.trim()).join(", ");
      // .filter(Boolean)
      // .join(", ");
    setValue("DfltAddress", DfltAddress || "");
    setValue("BlockB", selectedAddress.BlockB);
    setValue("StreetB", selectedAddress.Address2);
    setValue("City", selectedAddress.City);
    setValue("State", selectedAddress.State);
    setValue("Country", selectedAddress.Country);
    setValue("Zipcode", selectedAddress.Zipcode);
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
      data.ZipCodeB,
      data.CountryB,
    ].filter(v => v?.trim()).join(", ");
      // .filter(Boolean) // Remove empty fields
      // .join(", ");
    setValue("DfltAddress", DfltAddress || "");
    setValue("BlockB", data.BlockB);
    setValue("StreetB", data.StreetB);
    setValue("CityB", data.CityB);
    setValue("StateB", data.StateB);
    setValue("CountryB", data.CountryB);
    setValue("ZipCodeB", data.ZipCodeB);

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
      data.BlockB,
      data.StreetB,
      data.CityB,
      data.StateB,
      data.ZipCodeB,
      data.CountryB,
    ].filter(v => v?.trim()).join(", ");
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
  // let Address= selectedAddress.Address || ""

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  const { DocSeries } = useDocumentSeries(
    "540000006",
    docDate,
    setValue,
    clearCache,
    SaveUpdateName,
  );

  const ClearForm = () => {
    reset(initialFormData);
    setSaveUpdateName("SAVE");
    setType("I");
    setDocEntry("");
    setCopyFromModelPurchase([]);
    reset();
    setBusinessPartnerData([]);
    setOlines([]);
    setoExpLines([]);
    setGetListPOData([]);
    setCheckedItems("");
    clearFiles();
    setDocumentUpdateRate(0);
    setSystemUpdateRate(0);
    setSelectedRows([]);
    setSelectData([]);
    setok("");
    companyAddresss();
    setRollBackoExpLines([]);
    setGetListPageCopyFrom([]);
    setHasMorePOList(true);
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
  };

  //#region  Open Tab
  // order List For OPEN Tab
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/PurchaseQuotation/Search/${searchTerm}/1/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(
          `/PurchaseQuotation/Pages/1/${pageNum}/20`,
        );
      }
      if (response.data.success === true) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
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
    setOpenListQuery(""); // Clear searFullAddressch input
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
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/PurchaseQuotation/Search/${searchTerm}/0/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(
          `/PurchaseQuotation/Pages/0/${pageNum}/20`,
        );
      }
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

  //! =================CANCEL LIST================================
  const fetchCancelledListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/PurchaseQuotation/Search/${searchTerm}/3/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(
          `/PurchaseQuotation/Pages/3/${pageNum}/20`,
        );
      }
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

  let Quantity = allFormData.oLines.reduce((sum, current) => {
    const Quantity = parseFloat(current?.Quantity) || 0; // Handle NaN, null, undefined
    return sum + Quantity;
  }, 0);
  let OpenQuantity = allFormData.oLines.reduce((sum, current) => {
    const OpenQuantity = parseFloat(current?.OpenQuantity) || 0; // Handle NaN, null, undefined
    return sum + OpenQuantity;
  }, 0);

  //#region  SEarching List Vendor
  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/BPV2/V2/ByCardType/Search/${searchTerm}/v/1/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(
          `/BPV2/V2/ByCardType/Pages/v/1/${pageNum}/20`,
        );
      }

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
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
        if(searchmodelOpen===true){
    fetchGetListData(0); 
     }
  }, [searchmodelOpen]);

  const onSelectBusinessPartner = async (DocEntry) => {
    const { data: dataBP } = await apiClient.get(`/BPV2/V2/${DocEntry}`);
    const { values } = dataBP;
    setBusinessPartnerData(values);
    SearchModelClose();
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
    ].filter(v => v?.trim()).join(", ");
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
    setValue("CardCode", values.CardCode);
    setValue("CardName", values.CardName);
    setValue("CntctCode", values.CntctPrsn || "");
    setValue("PayToCode", values?.DfltBilled || "");
    setValue("ShipToCode", values?.DfltShiped || "");
    setValue("TrnspCode", values.ShipType || "");
    setValue("NumAtCard", values?.NumAtCard || "");
    setValue("CurSource", "C");
    setValue(
      "Currency",
      values.Currency === "AC" ? companyData.MainCurncy : values.Currency,
    );

    setValue("GroupNum", values.GroupNum);
    const PaymentValuesSet = PaymentTermData.filter(
      (payment) => payment.DocEntry === values.GroupNum,
    );
    console.log(PaymentValuesSet);
    setValue("PayDuMonth", PaymentValuesSet[0]?.PayDuMonth ?? "N");
    setValue("ExtraMonth", PaymentValuesSet[0]?.ExtraMonth ?? 0);
    setValue("ExtraDays", PaymentValuesSet[0]?.ExtraDays ?? 0);
    setValue("TolDays", PaymentValuesSet[0]?.TolDays ?? 0);
    setValue("ListNum", PaymentValuesSet[0]?.ListNum ?? "0");
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
    fetchCopyFromData(0, "", type);
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
    const sysRate = sysCurr === mainCurr ? 1 : Number(sysRateObj?.Rate || 0);
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
    headerRate = headerCurr === mainCurr ? 1 : Number(headerRateObj?.Rate || 0);
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
  //#endregion Searching Vendor List

  const fetchCopyFromData = async (pageNum = 0, searchTerm = "", DocType) => {
    let baseType = watch("baseType") || "1470000113";
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/PurchaseQuotation/CopyFrom/Search/${searchTerm}/${type}/${baseType}/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(
          `/PurchaseQuotation/CopyFrom/${type}/${baseType}/${pageNum}/20`,
        );
      }
      if (response.data.success === true) {
        const newData = response.data.values;
        setHasMorePOList(newData.length === 20);
        setGetListPOData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else if (response.data.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
      fetchCopyFromData(0, resp, type);
    }, 600);
  };

  const handleGetListClearCopyFrom = () => {
    setGetLIstQueryCopyFrom("");
    setGetListSearchingCopyFrom(true);
    setGetListPageCopyFrom(0);
    setGetListPOData([]);
    fetchCopyFromData(0, "", type);
  };

  // const fetchMoreGetListPO = () => {
  //   fetchCopyFromData(getListPage + 1, getListSearching ? getListquery : "");
  //   setGetListPage((prev) => prev + 1);
  // };

  const fetchMoreGetListCopyFrom = () => {
    fetchCopyFromData(
      getListPageCopyFrom + 1,
      getListSearchingCopyFrom ? getListqueryCopyFrom : "",
      type,
    );
    setGetListPageCopyFrom((prev) => prev + 1);
  };

  // ------------------------------------------------------------------------------------------------------------------------
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
    Excisable,
  ) => {
    const currentRowIndex = getValues("selectedRowIndex");
    const currentLines = getValues("oLines");
    const currentLine = currentLines[currentRowIndex];
    setok("UPDATE");

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
            LocationName,
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
    ].filter(v => v?.trim()).join(", ");

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

  // useEffect(() => {
  //   fetchItems({ page: taxCurrentPage, search: taxSearchText });
  // }, [taxCurrentPage, taxSearchText]);

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
      setoTaxLineCategory(Lines.oTaxLines);
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
      updatedData.InvQty = ValueFormatter(
        updatedData.NumPerMsr * updatedData.Quantity,
        6,
      );
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
  // ============================================

  const handleFright = () => {
    setFrieghtopen(true);
    // freightdata()
  };

  // ------------------------------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------------------------------
  const handleDeleteRow = (id) => {
    const updatedLines = getValues("oLines").filter((_, index) => index !== id);
    setok("UPDATE");
    const updatedData = {
      ...getValues(),
      oLines: updatedLines,
    };
    // Reset the form with the updated data
    reset(updatedData);

    calculateDiscountAmt(parseFloat(getValues("Discount")) || 0);
  };

  const handleClose = () => {
    setServiceOpen(false);
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

  const setbusinessPartner = async (CardCode, LineNum) => {
    try {
      const res = await apiClient.get(`/BPV2/V2/ByCardCode/${CardCode}`);
      const response = res.data;
      if (response.success === true) {
        setBusinessPartnerData(response.values);
        setValue("CntctCode", LineNum || "");
      } else if (response.success === false) {
        setBusinessPartnerData([]);
        // Swal.fire({
        //   title: "Error!",
        //   text: response.message,
        //   icon: "warning",
        //   confirmButtonText: "Ok",
        // });
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

  useEffect(() => {
    taxCodedata();
    TaxCodeFrieght();
    PaymentTermApi();
    freightdata();
    CurrencyData();
    salesEmpdata();
    ShippingType();
  }, []);

  const getPaymentValue = async (e) => {
    console.log(e.target.value);
    const paymenttermvalue = e.target.value;
    const PaymentValuesSet = PaymentTermData.filter(
      (payment) => payment.DocEntry === paymenttermvalue,
    );
    setValue("PayDuMonth", PaymentValuesSet[0]?.PayDuMonth ?? "N");
    setValue("ExtraMonth", PaymentValuesSet[0]?.ExtraMonth ?? 0);
    setValue("ExtraDays", PaymentValuesSet[0]?.ExtraDays ?? 0);
    setValue("TolDays", PaymentValuesSet[0]?.TolDays ?? 0);
    setValue("BslineDate", PaymentValuesSet[0]?.BslineDate ?? 0);
    setValue("ListNum", PaymentValuesSet[0]?.ListNum ?? "0");
    if (type === "I") {
      const listNum = PaymentValuesSet[0]?.ListNum ?? "0";
      const itemCodes = oLines.map((item) => item.ItemCode);
      let priceData = {};
      try {
        // Call API once with all item codes
        const response = await apiClient.post(
          "/ItemsV2/GetPriceListByItemCode",
          {
            ItemCodes: itemCodes,
            PriceList: [listNum],
          },
        );

        if (response.data.success === true) {
          priceData = response.data.values || {};
          console.log("=====prices", priceData);
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
          item.Discount.rate,
        );
        if (curSource === "C") {
          if (isMainCurrency) {
            LineTotal = priceLineRatio * (parseFloat(newPrice) || 0);
            TotalSumSy = LineTotal / SysRate;
            TotalFrgn = 0;
          } else {
            TotalFrgn = priceLineRatio * (parseFloat(newPrice) || 0);
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
          PriceBefDi: ValueFormatter(newPrice),
          LineTotal: ValueFormatter(LineTotal),
          TotalSumSy: ValueFormatter(TotalSumSy),
          TotalFrgn: ValueFormatter(TotalFrgn),
          Currency: currency,
          Rate: rate,
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
      calculateDiscountAmt(discPercent);
    }
  };

  const calculateDueDateSimplified = useCallback(() => {
    const selected = getValues("PayDuMonth" || "N");
    const month = getValues("ExtraMonth") || "0";
    const days = getValues("ExtraDays") || "0";
    const TolDays = getValues("TolDays") || "0";
    const BslineDate = getValues("BslineDate");
    let DocDate; // Declare DocDate once
    if (BslineDate === "P") {
      DocDate = getValues("DocDate"); // Assign, don't return
    } else if (BslineDate === "T") {
      DocDate = getValues("TaxDate"); // Assign, don't return
    } else if (BslineDate === "S") {
      DocDate = dayjs().format("YYYY-MM-DD"); // Assign current system date
    }
    const TotalDays = days - TolDays;
    if (!DocDate) {
      console.log("DocDate is missing");
      setValue("DueDate", "");
      return;
    }
    // Convert DocDate to dayjs object safely
    let docDayjs;
    try {
      docDayjs = dayjs(DocDate);
      if (!docDayjs.isValid()) {
        console.log("Invalid DocDate:", DocDate);
        setValue("DueDate", "");
        return;
      }
    } catch (error) {
      console.log("Error parsing DocDate:", error);
      setValue("DueDate", "");
      return;
    }

    let Due;
    switch (selected) {
      case "E": // End of Month
        // Start with end of document date's month
        let baseDate = docDayjs.endOf("month");
        // Add months if specified
        if (month > 0) {
          baseDate = baseDate.add(month, "month").endOf("month");
        }
        if (TotalDays > 30) {
          const daysInFixedMonth = 30; // Your defined average month length
          const monthsFromTotalDays = Math.floor(TotalDays / daysInFixedMonth);
          Due = baseDate.add(TotalDays, "day").add(monthsFromTotalDays, "days");
        } else {
          Due = baseDate.add(TotalDays, "day");
        }
        // Add total days (days - tolerance)
        break;
      case "H": // Half Month Logic
        // Check if document date is <= 15th or > 15th
        const docDay = docDayjs.date();
        let halfBaseDate;

        if (docDay <= 15) {
          // If doc date is 1-15, anchor to 15th of same month
          halfBaseDate = docDayjs.date(15);
        } else {
          // If doc date is 16-end, anchor to end of same month
          halfBaseDate = docDayjs.endOf("month");
        }

        // Add months if specified
        if (month > 0) {
          if (docDay <= 15) {
            // Maintain 15th anchor after adding months
            halfBaseDate = halfBaseDate.add(month, "month").date(15);
          } else {
            // Maintain end of month anchor after adding months
            halfBaseDate = halfBaseDate.add(month, "month").endOf("month");
          }
        }

        // Add total days
        Due = halfBaseDate.add(TotalDays, "day");
        break;

      case "Y": // Month Start Logic
        // Go to first day of next month
        let monthStartBase = docDayjs.add(1, "month").startOf("month");

        // Add additional months if specified
        if (month > 0) {
          monthStartBase = monthStartBase.add(month, "month");
        }

        // Add total days
        Due = monthStartBase.add(TotalDays, "day");
        break;

      case "N": // Empty/Simple Logic
        // Simple addition of months and days to document date
        Due = docDayjs.add(month, "month").add(TotalDays, "day");
        break;

      default:
        // For other cases, simple addition
        Due = docDayjs.add(month, "month").add(TotalDays, "day");
    }

    if (Due && Due.isValid()) {
      console.log("Payment Term:", selected);
      console.log("Due date:", Due.format("YYYY-MM-DD"));
      const PaymentTermDocDate = Due.format("YYYY-MM-DD");
      console.log("Calculation details:", {
        docDate: docDayjs.format("YYYY-MM-DD"),
        months: month,
        days: days,
        tolDays: TolDays,
        totalDays: TotalDays,
      });
      setValue("DocDueDate", PaymentTermDocDate);
    } else {
      console.log("Invalid date calculated");
      setValue("DocDueDate", "");
    }
  }, []);
  // Optimized version with proper dependencies
  const taxOptions = useMemo(
    () => [
      { value: "", label: "No Tax Selected" },
      ...(FrieghtTax || []).map((t) => ({
        value: t.DocEntry,
        label: t.TaxCode,
      })),
    ],
    [FrieghtTax],
  );
  // const FrieghtCol = [
  //   {
  //     field: "DocEntry",
  //     headerName: "FREIGHT",
  //     width: 120,
  //     renderCell: (params) => {
  //       const freight = frieghtdata.find((f) => f.DocEntry === params.value);
  //       return freight?.ExpnsName || params.value;
  //     },
  //   },

  //   {
  //     field:
  //       curSource === "L"
  //         ? "LineTotal"
  //         : curSource === "S"
  //           ? "TotalSumSy"
  //           : currency === companyData.MainCurncy
  //             ? "LineTotal"
  //             : "TotalFrgn",
  //     headerName:
  //       curSource === "L"
  //         ? "TOTAL (LC)"
  //         : curSource === "S"
  //           ? "TOTAL (SC)"
  //           : currency === companyData.MainCurncy
  //             ? "TOTAL (LC)"
  //             : `TOTAL (${currency})`,
  //     width: 200,
  //     editable: true,
  //     headerAlign: "center",
  //     align: "center",
  //     type: "number",
  //     valueFormatter: (value, row) =>
  //       `${row.Currency} ${Number(value).toFixed(2)}`,
  //   },

  //   {
  //     field: "TaxCode",
  //     headerName: "TAX CODE",
  //     width: 200,
  //     editable: true,
  //     headerAlign: "center",
  //     align: "center",
  //     type: "singleSelect",
  //     valueOptions: taxOptions,
  //     preProcessEditCellProps: (params) => {
  //       return { ...params.props };
  //     },
  //   },
  //   {
  //     field:
  //       curSource === "L"
  //         ? "VatSum"
  //         : curSource === "S"
  //           ? "VatSumSy"
  //           : currency === companyData.MainCurncy
  //             ? "VatSum"
  //             : "VatSumFrgn",
  //     headerName: "TOTAL TAX",
  //     width: 160,
  //   },
  //   {
  //     field:
  //       curSource === "L"
  //         ? "GrsAmount"
  //         : curSource === "S"
  //           ? "GrsSC"
  //           : currency === companyData.MainCurncy
  //             ? "GrsAmount"
  //             : "GrsFC",
  //     headerName: "GROSS AMT",
  //     width: 180,
  //   },
  //   {
  //     field: "ACTION",
  //     headerName: "ACTION",
  //     width: 100,
  //     renderCell: (params) => (
  //       <IconButton
  //         color="error"
  //         onClick={() => handleDeleteFrieght(params.row.id)}
  //       >
  //         <DeleteIcon />
  //       </IconButton>
  //     ),
  //   },
  // ];
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
  //     sortable: false,
  //   },

  //   {
  //     field: "PQTReqDate",
  //     headerName: "Required Date",
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputDatePickerFields
  //         name="PQTReqDate"
  //         value={params.value ? dayjs(params.value) : null}
  //         onChange={(date) =>
  //           handleChange(
  //             {
  //               target: {
  //                 name: "PQTReqDate",
  //                 value: dayjs(date),
  //               },
  //             },
  //             params.row
  //           )
  //         }
  //       />
  //     ),
  //   },

  //   {
  //     field: "PQTReqQty",
  //     headerName: "REQUIRED QTY",
  //     width: 140,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="PQTReqQty"
  //         type="number"
  //         disabled={params.row.Status === "0"}
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //       />
  //     ),
  //   },
  //   {
  //     field: "shipDate",
  //     headerName: "Delivery Date",
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputDatePickerFields
  //         name="shipDate"
  //         value={params.value ? dayjs(params.value) : null}
  //         onChange={(date) =>
  //           handleChange(
  //             {
  //               target: {
  //                 name: "shipDate",
  //                 value: dayjs(date),
  //               },
  //             },
  //             params.row
  //           )
  //         }
  //       />
  //     ),
  //   },
  //   {
  //     field: "Quantity",
  //     headerName: "Delivery Qty.",
  //     width: 140,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="Quantity"
  //         type="number"
  //         value={oLines[params.row.id]?.Quantity ?? ""}
  //         onChange={(e) => handleChange(e, params.row)}
  //         disabled={
  //           params.row.Status === "0" ||
  //           params.row.Quantity !== params.row.OpenQuantity
  //         }
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
  //         value={oLines[params.row.id]?.PriceBefDi ?? ""}
  //         onChange={(e) => handleChange(e, params.row)}
  //         disabled={
  //           params.row.Status === "0" ||
  //           params.row.Quantity !== params.row.OpenQuantity
  //         }
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

  //   // {
  //   //   field:
  //   //     curSource === "L"
  //   //       ? companyData.MainCurncy
  //   //       : curSource === "S"
  //   //       ? companyData.SysCurrncy
  //   //       : // getValues("Currency") === companyData.MainCurncy
  //   //         // ?
  //   //         "Currency",
  //   //   // : currency,
  //   //   headerName: "CURRENCY",
  //   //   width: 100,
  //   //   type: "number",
  //   //   sortable: false,
  //   //   align: "center", // centers cell text
  //   //   headerAlign: "center",
  //   //   renderCell: (params) => (
  //   //     <>
  //   //       {curSource === "L"
  //   //         ? companyData.MainCurncy
  //   //         : curSource === "S"
  //   //         ? companyData.SysCurrncy
  //   //         : params.row.Currency}{" "}
  //   //       {""}
  //   //       {/* fallback */}
  //   //     </>
  //   //   ),
  //   // },

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
  //         disabled={
  //           params.row.Status === "0" ||
  //           params.row.Quantity !== params.row.OpenQuantity
  //         }
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
  //               value={params.row.VatGroup || ""}
  //               disabled={params.row.Status === "0"}
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
  //                       disabled={
  //                         params.row.Status === "0" ||
  //                         params.row.Quantity !== params.row.OpenQuantity
  //                       }
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
  //           // disabled={params.row.Status === "0"}
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
  //                       disabled={
  //                         params.row.Status === "0" ||
  //                         params.row.Quantity !== params.row.OpenQuantity
  //                       }
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
  //         params.row.Status === "0" ||
  //         params.row.UomEntry2 === "-1" ||
  //         params.row.Quantity !== params.row.OpenQuantity;
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
  //     field: "FreeTxt",
  //     headerName: "Remark",
  //     width: 140,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="FreeTxt"
  //         value={params.value}
  //         onChange={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0"}
  //       />
  //     ),
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
  // const Services = [
  //   {
  //     id: 1,
  //     field: "id",
  //     headerName: "LINE NO",
  //     width: 50,
  //     renderCell: (params) => <Typography>{params.id + 1}</Typography>,
  //   },
  //   { field: "ServCode", headerName: "SERVICE CODE", width: 100 },
  //   {
  //     field: "ItemName",
  //     headerName: "SERVICE NAME",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="ItemName"
  //         value={params.value}
  //         onChange={(e) => handleChange(e, params.row)}
  //       />
  //     ),
  //   },
  //   {
  //     field: "PQTReqDate",
  //     headerName: "Required Date",
  //     width: 170,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputDatePickerFields
  //         name="PQTReqDate"
  //         value={params.value ? dayjs(params.value) : null}
  //         onChange={(date) =>
  //           handleChange(
  //             {
  //               target: {
  //                 name: "PQTReqDate",
  //                 value: dayjs(date),
  //               },
  //             },
  //             params.row
  //           )
  //         }
  //       />
  //     ),
  //   },
  //   {
  //     field: "shipDate",
  //     headerName: "QUOTED DATE",
  //     width: 170,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputDatePickerFields
  //         name="shipDate"
  //         value={params.value ? dayjs(params.value) : null}
  //         onChange={(date) =>
  //           handleChange(
  //             {
  //               target: {
  //                 name: "shipDate",
  //                 value: dayjs(date),
  //               },
  //             },
  //             params.row
  //           )
  //         }
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
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="AssblValue"
  //         type="number"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
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
  //               value={params.row.VatGroup || ""}
  //               disabled={params.row.Status === "0"}
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
  //           // disabled={params.row.Status === "0"}
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
  //   // {
  //   //   field: "VatSum",
  //   //   headerName: "VatSum",
  //   //   width: 110,
  //   //   sortable: false,
  //   //   editable: false,
  //   //   renderCell: (params) => (
  //   //     <InputTextField
  //   //       name="TotalExpns"
  //   //       value={params.value}
  //   //       onChange={(e) => handleChange(e, params.row)} // This will handle the change and update the line data
  //   //     />
  //   //   ),
  //   // },
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
  //         value={params.value}
  //         onChange={(e) => handleChange(e, params.row)}
  //       />
  //     ),
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
  //   { field: "BaseDocNum", headerName: "Base Document", width: 120 },

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
      headerAlign: "center",
      align: "center",
    },

    {
      field: "PQTReqDate",
      headerName: "Required Date",
      width: 150,
      editable: true,
      headerAlign: "center",
      align: "center",
      // type: "Date", // Optional, but doesn't create the picker
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
      field: "PQTReqQty",
      headerName: "REQUIRED QTY",
      width: 140,
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "shipDate",
      headerName: "Delivery Date",
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
      field: "Quantity",
      headerName: "Delivery Qty.",
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
        let disabled =
          params.row.Status === "0" ||
          params.row.Quantity !== params.row.OpenQuantity;
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
                if (disabled) return;

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

    { field: "LocationName", headerName: "Location", width: 150 },
    {
      field: "UomCode",
      headerName: "UOM Code",
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      minWidth: 150, // 👈 minimum width
      flex: 1, // 👈 auto expand when space available
      maxWidth: 200, // 👈 optional cap

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
            {/* ---- UOM Text ---- */}
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

            {/* ---- Icon ---- */}
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
    { field: "BaseDocNum", headerName: "Base Document", width: 150 },

    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,

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
    {
      field: "PQTReqDate",
      headerName: "Required Date",
      width: 150,
      editable: true,
      // type: "Date", // Optional, but doesn't create the picker
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
              : `TOTAL (${getValues("Currency")})`,
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
  // field:
  // curSource === "L"
  //   ? "LineTotal"
  //   : curSource === "S"
  //   ? "TotalSumSy"
  //   : getValues("Currency") === companyData.MainCurncy
  //   ? "LineTotal"
  //   : "TotalFrgn"

  const columns = useMemo(
    () => (type === "S" ? Services : Items),
    [curSource, currency, type],
  );

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

  // Determine which columns to display based on reqType
  // const selectedColumns = type === "S" ? Items : Services;
  const SelectFreight = () => {
    setopenFreight(true);
  };

  const closeFreightModel = () => {
    setopenFreight(false);
  };

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

  let handleChangeDatereq = (ReqDate) => {
    const PQTReqDate = watch("ReqDate");
    if (getValues("oLines").length > 0) {
      if (PQTReqDate) {
        Swal.fire({
          // title: "Select Item",
          text: "Do you want to update the existing table rows with the new required date?",
          icon: "warning",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        }).then((msg) => {
          if (msg.isConfirmed) {
            const updatedLines = getValues("oLines").map((data) => ({
              ...data,
              PQTReqDate: PQTReqDate,
            }));

            reset({
              ...getValues(),
              oLines: updatedLines,
            });
          }
        });
      }
    }
  };
  console.log("fsdf", getValues("oLines"));
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
        let newQuantity =
          line.BaseType > 1 ? originalQuantity / oInvNumPerMsr : line.Quantity;
        const newLineTotal = newQuantity * line.Price;
        let oTaxLine = line.oTaxLines;
        let VatPrcnt = line.VatPrcnt;
        let VatSum = line.VatSum;
        if (line.BaseType > 1) {
          const taxLines = taxCalculation(
            newLineTotal,
            line.AssblValue,
            getValues("DocTotal"),
            line.PriceBefDi,
            line.Quantity,
            line.TaxCode,
          );
          oTaxLine = taxLines.oTaxLines;
          VatPrcnt = taxLines.VatPrcnt;
          VatSum = ValueFormatter(
            taxLines.oTaxLines.reduce((sum, curr) => sum + curr.TaxSum, 0),
          );
        }
        return {
          ...line,
          UomEntry: UomEntry,
          UomCode: UomCode,
          unitMsr2: UomName,
          NumPerMsr: oInvNumPerMsr,
          InvQty: InvQty,
          OpenInvQty: InvQty,
          Quantity: newQuantity,
          OpenQuantity: originalRow?.OpenQuantity ?? newQuantity,
          // PriceBefDi: newPriceBefDi.toFixed(3),
          // Price: Price.toFixed(3),
          LineTotal: newLineTotal.toFixed(3),
          // Discount: "",
          oTaxLines: oTaxLine,
          VatPrcnt: VatPrcnt,
          VatSum: VatSum,
          // PriceAfVAT: priceWithVAT,
        };
      }
      return line;
    });

    // Reset form with updated lines
    reset({
      ...allFormData,
      oLines: updatedLines,
      // AssblValue: getValues("AssblValue"),
      // NumAtCard: getValues("NumAtCard"),
      // Comments: getValues("Comments"),
      // DiscountAmt: getValues("DiscountAmt"),
    });
    console.log("upmcode inv", updatedLines);
    calculateDiscountAmt(discPercent);

    setUomcodeOpen(false);
  };

  const handleCellClick = async (ids) => {
    const selectedIDs = new Set(ids); // ALL currently selected DocEntry IDs (across pages)
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
          PQTReqQty: 1,
          OpenQuantity: 1,
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
          PQTReqDate: watch("ReqDate"),
          UOMFactor: ValueFormatter(data.UOMFactor, 6),
          GstTaxCtg: data.GstTaxCtg,
          NumPerMsr: ValueFormatter(
            data.PUOMFactor > 0 ? data.UOMFactor / data.PUOMFactor : "1.000000",
            6,
          ),
          InvQty: ValueFormatter(
            data.PUOMFactor > 0 ? data.UOMFactor / data.PUOMFactor : "1.000000",
            6,
          ),
          OpenInvQty: ValueFormatter(
            data.PUOMFactor > 0 ? data.UOMFactor / data.PUOMFactor : "1.00000",
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

  const findRate = (data, curr) => {
    return parseFloat(data.find((ex) => ex.Currency === curr)?.Rate) || 0;
  };

  // 2️⃣ Validate Rate & Show Modal
  const validateRate = (rate, modalName, docEntry = "", message) => {
    if (rate <= 0) {
      if (docEntry) setValue("DocEntryCur", docEntry);
      dispatch({ type: "OPEN", modal: modalName });

      Swal.fire({
        title: "Rate Not Found",
        text: `No ${message} exchange rate available for the selected currency/date.`,
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  };
  // 3️⃣ Check Line-wise Zero Rate for oLines
  const checkLineZeroRate = (data) => {
    const currencySet = new Set(oLines.map((x) => x.Currency));
    const recordRateWise = data
      .filter((ex) => currencySet.has(ex.Currency))
      .map((ex) => ({
        RateDate: docDate,
        Currency: ex.Currency,
        DocEntry: ex.DocEntry,
        Rate: ex.Rate ?? "0",
      }));
    const hasZeroRate = recordRateWise.some((x) => String(x.Rate) === "0");
    if (hasZeroRate) {
      dispatch({ type: "OPEN", modal: "exchaneRateLineCpyform" });
      setAllDataCopyRateLine(recordRateWise);
      Swal.fire({
        title: "Rate Not Found",
        text: "No rate available for some line-level currency.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  };

  const onSubmitLineCurrency = (data) => {
    // If lines already exist → open purchase modal
    if (OlinesData.length > 0) {
      handleOpenPurchase();
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
        : Number(SysRateObj?.Rate) || 0;

    // ===============================
    // 🔹 DOCUMENT CURRENCY RATE
    // ===============================
    const DocRateObj = data.find((ex) => ex.Currency === currency);

    const DocRate =
      currency === companyData.MainCurncy ? 1 : Number(DocRateObj?.Rate) || 0;

    // ===============================
    // 🔹 UPDATE EACH LINE RATE
    // ===============================
    const UpdatedLines = (allFormData.oLines || []).map((item) => ({
      ...item,
      Rate: findRate(data, item.Currency),
    }));

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

  const onSubmit = async () => {
    try {
      const currentData = getValues();
      const updatedLines = [
        ...(currentData.oLines || []),
        ...(selectedRows || []),
      ];
      if (type === "S") {
        setValue("oLines", updatedLines);
        handleClose();
        return;
      }
      if (selectedRows.length === 0) {
        Swal.fire({
          title: "ITEM",
          text: `Please Select Items.`,
          icon: "warning",
          confirmButtonText: "Ok",
        });
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
      const UpdatedLines = updatedLines.map((item) => {
        let LineTotal = item.LineTotal || 0;
        let TotalSumSy = item.TotalSumSy || 0;
        let TotalFrgn = item.TotalFrgn || 0;
        let Price = type === "S" ? item.Price : item.Price * item.Quantity;
        switch (curSource) {
          case "L":
            LineTotal = Price * DocRateLine;
            TotalFrgn = LineTotal / DocRate;
            TotalSumSy = LineTotal / SysRate;
            break;
          case "S":
            LineTotal = Price * DocRateLine;
            TotalSumSy = ValueFormatter(LineTotal / SysRate, 3);
            TotalFrgn = LineTotal / DocRate;
            break;
          case "C":
            if (currency === companyData.MainCurncy) {
              LineTotal = Price * DocRateLine;
              TotalFrgn = LineTotal / DocRate;
              TotalSumSy = LineTotal / SysRate;
            } else {
              if (type === "S") {
                TotalFrgn =
                  currency === item.Currency
                    ? ValueFormatter(Price)
                    : ValueFormatter(item.LineTotal / DocRate);
                LineTotal = ValueFormatter(TotalFrgn * DocRate);
                TotalSumSy = ValueFormatter(LineTotal / SysRate);
              } else {
                const latestDocRate = getValues("DocRate");
                LineTotal = ValueFormatter(Price * DocRateLine);
                TotalFrgn =
                  currency === item.Currency
                    ? ValueFormatter(Price)
                    : ValueFormatter(LineTotal / latestDocRate);
                TotalSumSy =
                  currency === companyData.SysCurrncy
                    ? ValueFormatter(LineTotal / latestDocRate)
                    : ValueFormatter(LineTotal / SysRate);
              }
            }
            break;
          default:
        }
        return {
          ...item,
          LineTotal,
          TotalSumSy,
          TotalFrgn,
          Rate: DocRateLine,
        };
      });
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
        ].filter(v => v?.trim()).join(", ");
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
      const discountValue = parseFloat(currentData.Discount) || 0;
      if (Array.isArray(UpdatedLines) && UpdatedLines.length > 0) {
        calculateDiscountAmt(discountValue);
      }

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
        LineTotal: data.Price || 0,
        Quantity: "1",
        AssblValue: 0,
        Currency: currency,
        PQTReqDate: dayjs(undefined).format("YYYY-MM-DD "),
        shipDate: dayjs(undefined).format("YYYY-MM-DD "),
        Status: "1",
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

  // const SysRate = useSysRateCurrency(docDate);

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
  const handleDocRateChange = (e) => {
    let NewRate = parseFloat(e.target.value) || 1;
    if (NewRate < 0) NewRate = 0;
    setValue("DocRate", NewRate);
  };

  const handleFrightClose = () => {
    setFrieghtopen(false);
    setValue("oExpLines", RollBackoExpLines);
  };
  const handleDeleteFrieght = (id) => {
    const updatedRows = currentData.oExpLines.filter(
      (_, index) => index !== id,
    );
    setok("UPDATE");
    const updatedData = {
      ...currentData,
      oExpLines: updatedRows,
    };
    reset(updatedData);
  };

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
    setValue("DiscountAmt", DiscountAmt.toFixed(3)); // Format DiscountAmt to 2 decimal places
    const totalBefDiscSy = parseFloat(getValues("TotalBefDiscSy")) || 0;
    const DiscSumSy = (totalBefDiscSy * discount) / 100;
    setValue("DiscSumSy", DiscSumSy.toFixed(3)); // Format DiscountAmt to 2 decimal places
    const DocTotalFC = parseFloat(getValues("DocTotalFC")) || 0;
    const DiscSumFC = (DocTotalFC * discount) / 100;
    setValue("DiscSumFC", DiscSumFC.toFixed(3)); // Format DiscountAmt to 2 decimal places
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
          INMPrice: INMPrice || 0,
        });
      });
      setValue("DiscountAmt", dissum.toFixed(3));
      setValue("DiscSumSy", SumSy.toFixed(3));
      setValue("DiscSumFC", SumFC.toFixed(3));
      setValue("oLines", updatedOLines);
    }
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

    // Start edit mode if editable
    // const nextCellParams = api.getCellParams(nextId, nextField);
    // if (nextCellParams.isEditable) {
    //   setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    // }
  };
  // const handleCellKeyDown = (params, event) => {
  //   const api = apiRef.current;
  //   if (!api) return;

  //   const visibleColumns = api.getVisibleColumns();
  //   const rowIds = api.getSortedRowIds();

  //   const colIndex = visibleColumns.findIndex((c) => c.field === params.field);
  //   const rowIndex = rowIds.indexOf(params.id);

  //   let nextRow = rowIndex;
  //   let nextCol = colIndex;

  //   const NAV_KEYS = [
  //     "Tab",
  //     "Enter",
  //     "ArrowRight",
  //     "ArrowLeft",
  //     "ArrowDown",
  //     "ArrowUp",
  //   ];

  //   if (!NAV_KEYS.includes(event.key)) return;

  //   event.preventDefault();

  //   // ✅ ONLY stop if cell is actually in edit mode
  //   if (api.getCellMode(params.id, params.field) === "edit") {
  //     api.stopCellEditMode({
  //       id: params.id,
  //       field: params.field,
  //     });
  //   }

  //   // ---------- TAB ----------
  //   if (event.key === "Tab") {
  //     if (event.shiftKey) {
  //       nextCol--;
  //       if (nextCol < 0) {
  //         nextCol = visibleColumns.length - 1;
  //         nextRow--;
  //       }
  //     } else {
  //       nextCol++;
  //       if (nextCol >= visibleColumns.length) {
  //         nextCol = 0;
  //         nextRow++;
  //       }
  //     }
  //   }

  //   // ---------- ENTER ----------
  //   if (event.key === "Enter") {
  //     nextRow++;
  //   }

  //   // ---------- ARROWS ----------
  //   if (event.key === "ArrowRight") nextCol++;
  //   if (event.key === "ArrowLeft") nextCol--;
  //   if (event.key === "ArrowDown") nextRow++;
  //   if (event.key === "ArrowUp") nextRow--;

  //   // ---------- BOUNDS ----------
  //   if (
  //     nextRow < 0 ||
  //     nextRow >= rowIds.length ||
  //     nextCol < 0 ||
  //     nextCol >= visibleColumns.length
  //   ) {
  //     return;
  //   }

  //   const nextId = rowIds[nextRow];
  //   const nextField = visibleColumns[nextCol].field;

  //   const cellParams = api.getCellParams(nextId, nextField);
  //   if (!cellParams.isEditable) return;

  //   api.setCellFocus(nextId, nextField);

  //   // 🔥 SAP FEEL: start edit AFTER focus settles
  //   setTimeout(() => {
  //     api.startCellEditMode({
  //       id: nextId,
  //       field: nextField,
  //     });
  //   });
  // };

  const processRowUpdate = (newRow, oldRow) => {
    const updatedData = { ...oldRow, ...newRow };

    if (newRow.PQTReqDate !== undefined) {
      if (newRow.PQTReqDate && !dayjs(newRow.PQTReqDate).isValid()) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Date",
          text: "Please enter a valid required date.",
          confirmButtonText: "OK",
        });
        updatedData.PQTReqDate = oldRow.PQTReqDate;
      } else {
        updatedData.PQTReqDate = newRow.PQTReqDate;
      }
    }
    if (newRow.shipDate !== undefined) {
      if (newRow.shipDate && !dayjs(newRow.shipDate).isValid()) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Date",
          text: "Please enter a valid delivery date.",
          confirmButtonText: "OK",
        });
        updatedData.shipDate = oldRow.shipDate;
      } else {
        updatedData.shipDate = newRow.shipDate;

        // Validate that delivery date is after required date
        if (
          updatedData.PQTReqDate &&
          updatedData.shipDate &&
          dayjs(updatedData.shipDate).isBefore(dayjs(updatedData.PQTReqDate))
        ) {
          Swal.fire({
            icon: "warning",
            title: "Date Mismatch",
            text: "Delivery date should be on or after the required date.",
            confirmButtonText: "OK",
          });
          updatedData.shipDate = oldRow.shipDate;
        }
      }
    }
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
      // updatedData.Currency = currency;
      // updatedData.Rate = companyData.MainCurncy === currency ? 1 : DocRate;
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
      // Clean up the flag
      delete updatedData._priceEdited;
    }

    if (newRow.Discount !== undefined) {
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
            : CalcLines.LineTotal * updatedData.Rate;

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

    reset({ ...allFormData, oLines: updatedLines });
    calculateDiscountAmt(discPercent);

    return updatedData;
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
  //         name === "PQTReqQty" &&
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
  //         updatedData.Quantity = value;
  //         updatedData.InvQty = ValueFormatter(value * updatedData.NumPerMsr, 6);
  //       }
  //     }
  //     if (name === "PriceBefDi") {
  //       updatedData.PriceBefDi = Math.min(Math.max(value, 0));
  //       if (curSource === "L") {
  //         updatedData.Currency = companyData.MainCurncy;
  //         updatedData.Rate = "1";
  //       } else if (curSource === "S") {
  //         updatedData.Currency = companyData.SysCurrncy;
  //         updatedData.Rate = SysRate;
  //       } else {
  //         updatedData.Currency = currency;
  //         const Rate = companyData.MainCurncy === currency ? "1" : DocRate;
  //         updatedData.Rate = Rate;
  //       }
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
  //   calculateDiscountAmt(discPercent);
  // };

  //! Header Level CalCaculation
  const oLines = getValues("oLines") || []; // Ensure it's an array
  const { TotalBefDisc, totalBefDiscSy, totalBefDiscFrgn, TotalVatSumSy } =
    useMemo(() => {
      let TotalBefDisc = 0;
      let totalBefDiscSy = 0;
      let totalBefDiscFrgn = 0;
      let TotalVatSumSy = 0;
      oLines.forEach((line) => {
        TotalBefDisc += parseFloat(line?.LineTotal) || 0;
        totalBefDiscSy += parseFloat(line?.TotalSumSy) || 0;
        totalBefDiscFrgn += parseFloat(line?.TotalFrgn) || 0;
        TotalVatSumSy += parseFloat(line?.VatSumSy) || 0;
      });
      return { TotalBefDisc, totalBefDiscSy, totalBefDiscFrgn, TotalVatSumSy };
    }, [oLines]);

  console.log("", allFormData.oLines);
  useEffect(() => {
    setValue("TotalBefDisc", ValueFormatter(TotalBefDisc));
    setValue("TotalBefDiscSy", ValueFormatter(totalBefDiscSy));
    setValue("TotalBefDiscFrgn", ValueFormatter(totalBefDiscFrgn));
    const Discount = getValues("Discount");
    calculateDiscountAmt(Discount);
  }, [
    calculateDiscountAmt,
    TotalBefDisc,
    totalBefDiscSy,
    totalBefDiscFrgn,
    GroupNum,
    setValue,
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
    TotalBefDisc -
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
    totalBefDiscSy -
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
    totalBefDiscFrgn -
    DiscSumFC +
    TotalExpFC +
    VatSumFC +
    parseFloat(RoundDif || 0);

  setValue("DocTotalFC", ValueFormatter(DocTotalFC));
  // ===========Header Calculation===========
  const handleCloseMenu = () => {
    setOpenDialog(false); // Close modal
  };
  const handleMenuItemClick = (item) => {
    handleCloseMenu(); // Close dropdown
    setOpenDialog(true); // Open modal
  };
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close modal
  };

  //#region Copy From GET Api
  const handleSubmitForm = async (data) => {
    const isValid = ValidationSubmitForm(data, type, warehouseData, getValues);
    console.log(isValid);
    if (!isValid) return;
    if (getValues("DocTotal") <= 0) {
      Swal.fire({
        text: "Total document value must be zero or greater.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
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
      // CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
      // ModifiedDate:dayjs(undefined).format("YYYY-MM-DD "),
      ModifiedBy: user.UserName,
      Status:
        data.Status === "Open"
          ? "1"
          : data.Status === "Closed"
            ? "0"
            : data.Status === "Cancelled"
              ? "3"
              : "",
      CardCode: data.CardCode,
      CardName: data.CardName,
      NumAtCard: data.NumAtCard || "",
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      DocDueDate: dayjs(data.DocDueDate).format("YYYY-MM-DD "),
      DocCur: data.Currency || "0",
      DocRate: String(data.DocRate || "0"),
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
      ReqDate: dayjs(data.ReqDate).format("YYYY-MM-DD"),
      PaidToDate: data.PaidToDate || "0",
      CurSource:
        getValues("Currency") === companyData.MainCurncy ? "L" : data.CurSource,
      SysRate: String(data.SysRate || "1"),
      DocType: type,
      Address2: String(data.CompnyAddr || ""),
      PayToCode: String(data.PayToCode || ""),
      ShipToCode: String(data.ShipToCode),
      TrnspCode: data.TrnspCode || "0",
      AttcEntry: attachmentDocEntry,
      TotalBefDisc: data.TotalBefDisc || "0",
      Discount: String(data.Discount || "0"),
      DiscountAmt: String(data.DiscountAmt || "0"),
      RoundDif: data.RoundDif || "0",
      VatSum: String(data.VatSum || "0"),
      TotalExpns: data.TotalExpns || "0",
      CntctCode: String(data.CntctCode || "0"),
      SlpCode: String(data.SlpCode || "1"),
      TaxOnExp: String(data.TaxOnExp || "0"),
      Comments: data.Comments || "",
      DocTotalSy: data.DocTotalSy || "0",
      Series: String(data.Series || "0"),
      DocTotal: data.DocTotal,
      DocTotalFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.DocTotalFC,
      TotalBefDiscSy: data.TotalBefDiscSy || "0",
      TotalBefDiscFrgn:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.TotalBefDiscFrgn,
      DpmVat: data.DpmVat || "0",
      PaidFC: data.PaidFC || "0",
      Serial: data.Serial || "0",
      Address: data.DfltAddress || "0",
      DpmAppl: data.DpmAppl || "0",
      PaidDpm: data.PaidDpm || "0",
      PaidSum: data.PaidSum || "0",
      TransId: data.TransId || "0",
      CANCELED: data.CANCELED || "",
      PORevise: data.PORevise || "0",
      VatPaid: data.VatPaid || "0",
      BankCode: data.BankCode || "0",
      BaseDisc: data.BaseDisc || "0",
      BnkCntry: data.BnkCntry || "0",
      DpmDrawn: data.DpmDrawn || "n",
      DpmPrcnt: data.DpmPrcnt || "0",
      DpmVatFc: data.DpmVatFc || "0",
      DpmVatSc: data.DpmVatSc || "0",
      FolioNum: data.FolioNum || "0",
      GroupNum: data.GroupNum || "0",
      JrnlMemo: data.JrnlMemo || "0",
      PayDuMonth: data.PayDuMonth || "0",
      ExtraMonth: data.ExtraMonth || "0",
      ExtraDays: data.ExtraDays || "0",
      CancelDate: data.CancelDate,
      CdcOffset: data.CdcOffset,
      PaidDpmF: data.PaidDpmF || "0",
      PaidDpmS: data.PaidDpmS || "0",
      VatSumFC: data.VatSumFC || "0",
      VatSumSy: data.VatSumSy || "0",
      BnkBranch: data.BnkBranch || "0",
      DiscSumFC: data.DiscSumFC || "0",
      DiscSumSy: data.DiscSumSy || "0",
      DpmAmntFC: data.DpmAmntFC || "0",
      DpmAmntSC: data.DpmAmntSC || "0",
      DpmApplFc: data.DpmApplFc || "0",
      DpmApplSc: data.DpmApplSc || "0",
      DpmAppVat: data.DpmAppVat || "0",
      DpmStatus: data.DpmStatus || "Y",
      FolioPref: data.FolioPref || "ER01",
      PaidSumFc: data.PaidSumFc || "0",
      PaidSumSc: data.PaidSumSc || "0",
      TaxOnExAp: data.TaxOnExAp || "0",
      ToBinCode: data.ToBinCode || "0",
      VatPaidFC: data.VatPaidFC || "0",
      BaseDiscFc: data.BaseDiscFc || "0",
      BaseDiscPr: data.BaseDiscPr || "0",
      BaseDiscSc: data.BaseDiscSc || "0",
      BnkAccount: data.BnkAccount || "0",
      CheckDigit: data.CheckDigit || "A",
      FC: data.FC || "0",
      DpmAppVatF: data.DpmAppVatF || "0",
      DpmAppVatS: data.DpmAppVatS || "0",
      GrosProfFC: data.GrosProfFC || "0",
      GrosProfit: data.GrosProfit || "0",
      ReceiptNum: data.ReceiptNum || "0",
      RoundDifFC: data.RoundDifFC || "0",
      RoundDifSy: data.RoundDifSy || "0",
      TaxOnExpFc:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : String(data.TaxOnExpFc || "0"),
      TaxOnExApF: data.TaxOnExApF || "0",
      TaxOnExApS: data.TaxOnExApS || "0",
      TaxOnExpSc: data.TaxOnExpSc || "0",
      TotalExpFC: data.TotalExpFC || "0",
      TotalExpSC: data.TotalExpSC || "0",
      VatPaidSys: data.VatPaidSys || "0",
      DocNum: data.DocNum || "0",
      ShipMode: data.ShipMode || "0",
      SAPDocNum: data.SAPDocNum || "0",
      Sy: data.Sy || "1",
      SAPDocEntry: data.SAPDocEntry || "0",
      WeightUnit: data.WeightUnit || "02",
      OnlineQuo: data.OnlineQuo || "N",
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oLines: data.oLines.map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(item.CreatedDate).format("YYYY-MM-DD"),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs(item.ModifiedDate).format("YYYY-MM-DD"),
        PQTReqDate: dayjs(item.PQTReqDate).isValid()
          ? dayjs(item.PQTReqDate).format("YYYY-MM-DD")
          : "",
        shipDate: dayjs(item.shipDate).isValid()
          ? dayjs(item.shipDate).format("YYYY-MM-DD")
          : "",
        LastGRNDt: dayjs(item.LastGRNDt).format("YYYY-MM-DD "),
        Status:
          String(item.Status) === "1" ||
          String(item.Status) === "0" ||
          String(item.Status) === "3"
            ? String(item.Status)
            : "",
        FreeTxt: item.FreeTxt || "",
        ItemCode: item.ItemCode || "", //type==="I" ? "": item.ServCode,
        ItemName: item.ItemName || "",
        ServCode: item.ServCode || "0",
        ChapterID: String(item.ChapterID || "0"),
        Quantity: String(item.Quantity || 1),
        PQTReqQty: String(item.PQTReqQty || 1),
        Price: String(item.Price || "0"),
        PriceBefDi: String(item.PriceBefDi || "0"),
        INMPrice: String(item.INMPrice || "0"),
        PriceAfVAT: String(item.PriceAfVAT || "0"),
        VatSum: String(
          isNaN(parseFloat(item.VatSum)) ? 0 : parseFloat(item.VatSum),
        ),
        VatSumSy: String(item.VatSumSy || ""),
        Rate: String(item.Rate || "0"),
        VatSumFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.VatSumFrgn || ""),
        Discount: String(item.Discount || "0"),
        AssblValue: String(item.AssblValue || "0"),
        OpenQuantity: String(item.OpenQuantity || "0"),
        OnHand: item.OnHand || "0",
        IsCommited: item.IsCommited || "0",
        OnOrder: item.OnOrder || "0",
        WHSCode: item.WHSCode || "0",
        AcctCode: item.AcctCode || "0",
        ExpnsCode: item.ExpnsCode || "0",
        ExpnsName: item.ExpnsName || "",
        TotalExpns: item.TotalExpns || "0",
        TaxCode: String(item.TaxCode || "0"),
        VatGroup: String(item.VatGroup || ""),
        PostTax: String(item.PostTax || "N"),
        Excisable: String(item.Excisable || "N"),
        VatPrcnt: String(item.VatPrcnt || "0"),
        LineTotal: String(item.LineTotal || ""),
        TotalSumSy: String(item.TotalSumSy || ""),
        TotalFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.TotalFrgn),
        ItmTaxType: String(item.ItmTaxType || "N"),
        Dscription: String(item.Dscription || "0"),
        UomCode: item.UomCode || "0",
        UomCode2: item.UomCode2 || "0",
        UomEntry: item.UomEntry || "0",
        unitMsr: item.unitMsr || "0",
        unitMsr2: item.unitMsr2 || "0",
        UomEntry2: item.UomEntry2 || "0",
        NumPerMsr: String(item.NumPerMsr || "0"),
        UOMFactor: item.UOMFactor || "0",
        InvQty:
          item.UomCode === "Manual"
            ? String(item.Quantity || 1)
            : String(item.InvQty || "0"),
        OpenInvQty:
          item.UomCode === "Manual"
            ? String(item.Quantity || 1)
            : String(item.OpenInvQty || "0"),
        LocCode: item.LocCode || "",
        BaseType: item.BaseType || "-1",
        BaseEntry: item.BaseEntry || "-1",
        BaseLine: item.BaseLine || "-1",
        BaseDocNum: item.BaseDocNum || "0",
        LineNum: item.LineNum || "0",
        SlpCode: item.SlpCode || "1",
        Currency: item.Currency || "0",
        ShipToCode: item.ShipToCode || "",
        AttcEntry: attachmentDocEntry,
        GTotal: "0",
        Address: "0",
        BinCode: "0",
        LineVat: "0",
        OcrCode: "0",
        OpenSum: "0",
        TaxType: "0" || "",
        CodeBars: "0" || "",
        GTotalFC: "0" || "",
        GTotalSC: "0" || "",
        LineVatS: "0" || "",
        StockSum: "0" || "",
        TrnsCode: "0" || "",
        VatAppld: "0" || "",
        DedVatSum: "0" || "",
        LineVatlF: "0" || "",
        OpenSumFC: "0" || "",
        SerialNum: "0" || "",
        StckAppFc: "0" || "",
        StckAppSc: "0" || "",
        TaxAmount: "0" || "",
        VendorNum: "0" || "",
        DedVatSumF: "0" || "",
        DedVatSumS: "0" || "",
        InvntSttus: "0" || "",
        OpenSumSys: "0" || "",
        StckSumApp: "0" || "",
        StockSumFc: "0" || "",
        StockSumSc: "0" || "",
        VatAppldFC: "0" || "",
        VatAppldSC: "0" || "",
        FreightCode: "0" || "",
        FreightAmount: "0" || "",
        OpenQty: "0" || "",
        LastPurPr: "0" || "",
        DeliveredQty: "0" || "",
        oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
          UserId: user.UserId,
          CreatedBy: user.UserName,
          TaxRate: String(taxItem.TaxRate),
          TaxSum: String(taxItem.TaxSum),
          StcCode: taxItem.StcCode,
          BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
          RelateType: "1",
          RelateEntry: taxItem.RelateEntry,
          GroupNum: taxItem.GroupNum || "1",
          ExpnsCode: taxItem.ExpnsCode || "",
          StaCode: taxItem.StaCode || "",
          staType: taxItem.staType || "1",
          TaxAcct: taxItem.TaxAcct || "",
          TaxSumFrgn:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : taxItem.TaxSumFrgn || "0",
          TaxSumSys: String(taxItem.TaxSumSys || "0"),
          BaseSumFrg:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : taxItem.BaseSumFrg || "0",
          BaseSumSys: taxItem.BaseSumSys || "0",
          VatApplied: taxItem.VatApplied || "0",
          VatAppldFC: taxItem.VatAppldFC || "0",
          VatAppldSC: taxItem.VatAppldSC || "0",
          LineSeq: taxItem.LineSeq || "1",
          DeferrAcct: taxItem.DeferrAcct || "",
          BaseType: taxItem.BaseType || "1",
          BaseAbs: taxItem.BaseAbs || "1",
          BaseSeq: taxItem.BaseSeq || "1",
          DeductTax: taxItem.DeductTax || "0",
          DdctTaxFrg: taxItem.DdctTaxFrg || "0",
          DdctTaxSys: taxItem.DdctTaxSys || "0",
        })),
      })),

      oExpLines: (data.oExpLines || []).map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        Status: "1",
        ExpnsCode: item.DocEntry,
        DocEntry: item.DocEntry,
        ModifiedBy: user.UserName,
        LineTotal: String(item.LineTotal),
        TaxCode: String(item.TaxCode || "0"),
        VatSum: String(item.VatSum),
        GrsAmount: String(item.GrsAmount),
        ExpnsName: String(item.ExpnsCode || "0"),
        RevAcct: item.RevAcct,
        GrsFC:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : item.GrsFC || "0",
        GrsSC: item.GrsSC || "0",
        PaidFC: item.PaidFC || "0",
        LineVat: item.LineVat || "0",
        LineVatS: item.LineVatS || "0",
        VatPrcnt: item.VatPrcnt || "0",
        VatSumSy: item.VatSumSy || "0",
        DedVatSum: item.DedVatSum || "0",
        TotalFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.TotalFrgn || "0"),
        DedVatSumF: item.DedVatSumF || "0",
        DedVatSumS: item.DedVatSumS || "0",
        PaidToDate: item.PaidToDate || "0",
        PaidSys: item.PaidSys || "0",
        LineVatF: item.LineVatF || "0",
        TotalSumSy: String(item.TotalSumSy || "0"),
        VatAppldFC: item.VatAppldFC || "0",
        VatAppldSC: item.VatAppldSC || "0",
        VatApplied: item.VatApplied || "0",
        VatSumFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : item.VatSumFrgn || "0",
        VatGroup: item.VatGroup || "0",
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
          BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
          RelateType: "2",
          RelateEntry: taxItem.RelateEntry,
          GroupNum: taxItem.GroupNum || "1",
          ExpnsCode: taxItem.ExpnsCode || "1001",
          StaCode: taxItem.StaCode || "STA001",
          staType: taxItem.staType || "1",
          TaxAcct: taxItem.TaxAcct || "001002",
          TaxSumFrgn:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : taxItem.TaxSumFrgn || "0",
          TaxSumSys: taxItem.TaxSumSys || "0",
          BaseSumFrg:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : taxItem.BaseSumFrg || "0",
          BaseSumSys: taxItem.BaseSumSys || "0",
          VatApplied: taxItem.VatApplied || "0",
          VatAppldFC: taxItem.VatAppldFC || "0",
          VatAppldSC: taxItem.VatAppldSC || "0",
          PaidSys: taxItem.PaidSys || "0",
          LineVatF: taxItem.LineVatF || "0",
          LineSeq: taxItem.LineSeq || "1",
          DeferrAcct: taxItem.DeferrAcct || "0",
          BaseType: taxItem.BaseType || "0",
          BaseAbs: taxItem.BaseAbs || "0",
          BaseSeq: taxItem.BaseSeq || "0",
          DeductTax: taxItem.DeductTax || "0",
          DdctTaxFrg: taxItem.DdctTaxFrg || "0",
          DdctTaxSys: taxItem.DdctTaxSys || "0",
        })),
      })), // Assuming this is an array
      oPaymentLines: [],
      oDPLines: [],
      oTaxExtLines: (data.oTaxExtLines || []).map((oTaxExtLines) => ({
        ...oTaxExtLines,
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
      })),
    };
    console.log("=============", obj);
     setapiloading(true);
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/PurchaseQuotation`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearForm();
            setOpenListData([]);
            fetchOpenListData(0);
            handleGetListClear();
            handleGetListClearCopyFrom();
            setClearCache(true);
            Swal.fire({
              title: "Success!",
              text: "Purchase Quotation saved Successfully",
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
        });;
    } else {
      Swal.fire({
        text: `Do You Want Update "${obj.CardCode}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          if (attachmentDocEntry > "0") {
            apiClient.put(`/Attachment/${attachmentDocEntry}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
          apiClient
            .put(`/PurchaseQuotation/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                setOpenListData([]);
                setOpenListPage(0);
                fetchOpenListData(0);
                handleGetListClear();
                handleGetListClearCopyFrom();
                Swal.fire({
                  title: "Success!",
                  text: " Purchase Quotation Updated",
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
            })
             .finally(() => {
          setapiloading(false);
        });;
        } else {
          Swal.fire({
            text: " PO Not Updated",
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
          .put(`/PurchaseQuotation/Cancel/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              ClearForm();
              // setOpenListData([]);
              fetchOpenListData(0);
              fetchCancelledListData(0);
              fetchClosedListData(0);
              Swal.fire({
                text: "Purchase Quotation Cancel",
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
          text: "Purchase Quotation Not Cancelled",
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
          .put(`/PurchaseQuotation/Close/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              setOpenListData([]);
              fetchOpenListData(0);
              setClosedListData([]);
              fetchOpenListData(0);
              fetchClosedListData(0);
              ClearForm();
              Swal.fire({
                text: "Purchase Quotation Close",
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
          text: "Purchase Quotation Not Close",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const { isDirty } = useFormState({ control });
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

  const fetchAndSetData = (DocEntry) => {
    setapiloading(true);

    apiClient
      .get(`/PurchaseQuotation/${DocEntry}`)
      .then((response) => {
        if (!response.data || !response.data.values) {
          console.error("API Response missing `values` key:", response.data);
          return;
        }
        const item = response.data.values;
        setSystemUpdateRate(item.SysRate);
        setDocumentUpdateRate(item.DocRate);
        // setbusinessPartner(item.CardCode, item.CntctCode);
        reset({
          ...item,
          DocEntry: item.DocEntry,
          CompnyAddr: item.Address2 || "",
          ShipToCode: item.ShipToCode,
          PayToCode: item.PayToCode || "",
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
          ReqDate: dayjs(item.ReqDate).format("YYYY-MM-DD"),
          Status: getStatus(item.Status),
          totalbef: item.TotalBefDisc || 0,
          TaxOnExp: item.TaxOnExp,
          TotalExpns: item.TotalExpns || 0,
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
          oLines: (item.oLines || []).map((element) => {
            const match = warehouseData.find(
              (loc) => loc.Location === element.LocCode,
            );
            return {
              ...element,
              UserId: user.UserId,
              BaseType: element.BaseType || "-1",
              BaseEntry: element.BaseEntry || "-1",
              BaseLine: element.BaseLine || "-1",
              DocEntry: element.DocEntry || "",
              Status: element.Status || "",
              ItemCode: element.ItemCode || "",
              ServCode: element.ServCode,
              ChapterID: element.ChapterID || 0,
              PQTReqDate: element.PQTReqDate,
              shipDate: element.shipDate,
              PQTReqQty: element.PQTReqQty || "",
              ItemName: element.ItemName || "",
              Quantity: element.Quantity || 0,
              Price: element.Price || 0,
              WHSCode: element.WHSCode || "",
              UomCode: element.Uomcode || "",
              UomEntry: element.UomEntry || "",
              UomEntry2: element.UomEntry2 || "",
              UgpEntry: element.UgpEntry || "",
              PriceBefDi: element.PriceBefDi || 0,
              AssblValue: element.AssblValue || 0,
              LocationName: match?.LocationName || "", // <- Get from matched object safely
              LocCode: match?.Location || "",
              Discount: element.Discount || 0,
              TaxCode: element.TaxCode || "",
              PostTax: String(element.PostTax || "0"),
              Excisable: String(element.Excisable || "0"),
              VatGroup: element.vatGroup || "",
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
              BaseDocNum: element.BaseDocNum,
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
        // setValue("DocDate",item.DocDate)
        setRollBackoExpLines(item.oExpLines);
        const PaymentValuesSet = PaymentTermData.filter(
          (payment) => payment.DocEntry === item.GroupNum,
        );
        setValue("ListNum", PaymentValuesSet[0]?.ListNum ?? "0");
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
        setValue("DocType", item.DocType);
        if (item.AttcEntry > 0) {
          setFilesFromApi(item.AttcEntry);
        }

        setType(item.DocType);
        setSelectData(DocEntry);
        setDocEntry(DocEntry);
      })
      .catch((error) => {
        console.error("Error fetching or processing data:", error);
      })
      .finally(() => {
        setapiloading(false);
        toggleSidebar();
      });
  };

  //#endregionPost APi
  //! Copy Form Logic
  const onClickCopyFrom = useCallback((e, item, index, DocNum) => {
    const checked = e.target.checked;
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = {
        ...prevCheckedItems,
        [DocNum]: checked, // Update specific checkbox state
      };
      return newCheckedItems;
    });
    if (checked) {
      setoExpLines((prev) => {
        const newOlines = [...prev, ...item.oExpLines];
        const uniqueOlines = Array.from(
          new Map(newOlines.map((obj) => [JSON.stringify(obj), obj])).values(),
        );
        return uniqueOlines;
      });
      setAllDAtaCopyform(item);
      setOlines((prevOlines) => {
        const newOlines = [
          ...prevOlines,
          ...item.oLines.map((obj) => ({
            ...obj,
            HerDiscount: item.Discount,
            BaseDocNum: item.DocNum,
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
    }
  }, []);

  function filterRatesByCurrency(data, docDate, currencyList) {
    const records = data[docDate] || [];
    const uniqueHeaderCurrency = getUniqueCount(OlinesData, "HerCurrency");

    if (uniqueHeaderCurrency === 1) {
      setValue("Currency", CopyformData?.DocCur ?? "");
      const DocRateHeader =
        records.find((curRate) => curRate.Currency === CopyformData?.DocCur)
          ?.Rate ?? 0;
      const DocRateheader =
        CopyformData.DocCur === companyData.MainCurncy ? "1" : DocRateHeader;
      setValue("DocRate", DocRateheader);
      if (DocRateheader === 0) {
        dispatch({ type: "OPEN", modal: "DocRateOpen" });
      }
    } else {
      setValue("Currency", companyData.MainCurncy ?? "");
      setValue("DocRate", "1");
    }
    const currencySet = new Set(currencyList.map((x) => x.Currency));
    const recordRateWise = records.filter((item) =>
      currencySet.has(item.Currency),
    );
    const updatedCurrencyRate = currencyList.map((item) => {
      const match = recordRateWise.find(
        (loc) => loc.Currency === item.Currency,
      );
      return {
        ...item,
        Rate:
          item.Currency === companyData.MainCurncy ? "1" : (match?.Rate ?? 0),
      };
    });
    return updatedCurrencyRate;
  }

  const handleOpenPurchase = () => {
    // reset("oLines")
    setSelectedRowsPurchase([]);
    setValue("oExpLines", []);
    setValue("oLines", []);
    setOpenPurchase(true);
    const uniqueBaseNums = [
      ...new Set(OlinesData.map((item) => item.BaseDocNum)),
    ].length;

    const result = filterRatesByCurrency(
      data,
      dayjs(docDate).format("YYYY-MM-DD"),
      OlinesData,
    );

    if (result.some((x) => x.Rate === 0)) {
      const zeroRateCurrencies = result
        .filter((x) => x.Rate === 0)
        .map((x) => x.Currency)
        .join(", ");
      Swal.fire({
        icon: "warning",
        title: "Invalid Currency Rate",
        text: `Rate is 0 for  ${zeroRateCurrencies} currency on ${dayjs(
          docDate,
        ).format("DD-MM-YYYY")}`,
      });
      navigate("/dashboard/Finance/ExchangeRatesAndIndexes", { replace: true });
    }
    console.log("final Result Data Is comming Rate Wise", result);
    let updatedOLines = [];
    result.forEach((item) => {
      if (uniqueBaseNums > 1) {
        let herDisamt = 1 - item.HerDiscount / 100;
        let linedisamt = 1 - item.Discount / 100;
        let finalDisamt = 100 - herDisamt * linedisamt * 100;
        let PriceAfVAT =
          item.PriceBefDi - (item.PriceBefDi * finalDisamt) / 100;
        let LineTotal = PriceAfVAT * item.Quantity * item.Rate;
        // let LineTotal = CalCulation(PriceAfVAT, item.Quantity);
        updatedOLines.push({
          ...item,
          Discount: finalDisamt.toFixed(2),
          Price: PriceAfVAT.toFixed(3),
          LineTotal: ValueFormatter(LineTotal),
          TotalFrgn: ValueFormatter(LineTotal / item.Rate),
          TotalSumSy: ValueFormatter(LineTotal / SysRate),
        });
        setCopyFromModelPurchase(updatedOLines);
      } else {
        const latestDocRate = getValues("DocRate");
        const SingleData = result.map((item) => {
          const LineTotal = item.Price * item.Quantity * item.Rate;
          return {
            ...item,
            LineTotal: ValueFormatter(LineTotal),
            TotalFrgn: ValueFormatter(LineTotal / latestDocRate),
            TotalSumSy: ValueFormatter(LineTotal / SysRate),
          };
        });
        setCopyFromModelPurchase(SingleData);
      }
    });
  };

  const handleClosePurchase = useCallback((e) => {
    setOpenPurchase(false);
    setCopyFromModelPurchase([]);
  }, []);

  const onSubmitCopyFrom = (data) => {
    const DocumentBaseCopyForm = [
      ...new Set((selectedRowsPurchase || []).map((item) => item.ItemCode)),
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
        oTaxLines: headerDisc.oTaxLines,
        // oTaxLine: (item.oTaxLines || []).map((x) => ({ ...x })),
      };
    });
    if (CopyformData.DocType === "S") {
      const updatedSelectedRows = (selectedRowsPurchase || []).map((row) => ({
        ...row,
        Status: "1",
        oTaxLines: (row.oTaxLines || []).map((item) => ({
          ...item,
        })),
      }));
      const updatedData = {
        ...allFormData,
        oLines: [...allFormData.oLines, ...updatedSelectedRows],
        oExpLines: [...allFormData.oExpLines, ...updatedOExpLineData],
      };
      setRollBackoExpLines(updatedData.oExpLines);

      reset(updatedData);
      const uniqueBaseNums = [
        ...new Set(OlinesData.map((item) => item.BaseDocNum)),
      ].length;
      if (uniqueBaseNums === 1) {
        setValue("ReqDate", CopyformData.ReqDate);
        setValue("Comments", CopyformData.Comments);
        setValue("Currency", CopyformData?.DocCur ?? "");
      }
      setValue("DocType", CopyformData.DocType);
      setType(CopyformData.DocType);
    } else {
      const OLinaSDataCopyForm = (selectedRowsPurchase || []).map((item) => {
        const match = warehouseData.find(
          (loc) => loc.Location === item.LocCode,
        );
        return {
          ...item,
          LineNum: item.LineNum,
          BaseLine: item.BaseLine,
          BaseEntry: item.BaseEntry,
          Rate: "1",
          BaseType: item.BaseType,
          BaseDocNum: item.BaseDocNum,
          BaseDocDueDate: item.BaseDocDueDate,
          ItemCode: item.ItemCode,
          ItemName: item.ItemName,
          ChapterID: item.ChapterID,
          PQTReqQty: item.Quantity,
          PQTReqDate: item.PQTReqDate,
          Excisable: item.Excisable,
          PostTax: item.PostTax,
          TaxCode: "",
          TaxType: item.TaxType,
          TaxStatus: item.TaxStatus,
          AssblValue: item.AssblValue,
          ServCode: item.ServCode,
          Currency: item.Currency,
          VatGroup: "",
          VatSum: "",
          WHSCode: item.WHSCode,
          UomCode: item.UomCode,
          OpenQuantity: item.OpenQuantity,
          OnHand: item.OnHand,
          IsCommited: item.IsCommited,
          UomEntry2: item.UomEntry2,
          UomCode2: item.UomCode2,
          UnitMsr2: item.UnitMsr2,
          OnOrder: item.OnOrder,
          unitMsr: item.unitMsr,
          PriceBefDi: item.PriceBefDi,
          Discount: item.Discount,
          LineTotal: item.LineTotal,
          Status: "1",
          LocationName: match?.LocationName || "", // <- Get from matched object safely
          LocCode: match?.Location || "",
          // oTaxLine: (item.oTaxLines || []).map((item) => ({
          //   ...item,
          // })),
        };
      });
      const updatedData = {
        ...allFormData,
        oLines: [...allFormData.oLines, ...OLinaSDataCopyForm],
        oExpLines: [...allFormData.oExpLines, ...updatedOExpLineData],
      };
      reset(updatedData);
      setRollBackoExpLines(updatedData.oExpLines);
      const uniqueBaseNums = [
        ...new Set(OlinesData.map((item) => item.BaseDocNum)),
      ].length;
      if (uniqueBaseNums === 1) {
        setValue("ReqDate", CopyformData.ReqDate);
        setValue("Comments", CopyformData.Comments);
        setValue("DocType", CopyformData.DocType);
        setRollBackoExpLines(updatedData.oExpLines);
        setType(CopyformData.DocType);
      }
    }
    calculateExpenseTotals(RollBackoExpLines, setValue);
    handleCloseDialog();
    setOlines([]);
    setCheckedItems({});
    handleClosePurchase();
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
            LineTotal = Price * line.Rate;
            TotalFrgn = LineTotal / DocRate;
            TotalSumSy = LineTotal / SysRate;
            break;
          case "S":
            LineTotal = Price * line.Rate;
            TotalSumSy = ValueFormatter(LineTotal / SysRate, 3);
            TotalFrgn = LineTotal / DocRate;
            break;
          case "C":
            if (currency === companyData.MainCurncy) {
              LineTotal = Price * line.Rate;
              TotalFrgn = LineTotal / DocRate;
              TotalSumSy = LineTotal / SysRate;
            } else {
              if (type === "S") {
                TotalFrgn =
                  currency === line.Currency
                    ? ValueFormatter(Price)
                    : ValueFormatter(line.LineTotal / DocRate);
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
            break;
          default:
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

          // oTaxLines: oTaxLines,
          // VatSum: VatSum,
          // VatSumSy: VatSumSy,
          // VatSumFrgn: VatSumFrgn,
          // Price: newPrice
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
    curSource,
  ]);
  useEffect(() => {
    if (DocRate) {
      CalculateRate(DocRate);
    }
  }, [DocRate, SysRate, CalculateRate]);
  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/540000006`,
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
          Purchases Quotation List
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
      {/* {apiloading && <Loader open={apiloading} />} */}
      <DynamicLoader open={apiloading} />

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
                  );
                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
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
              // searchResult={closedListquery}
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
      {/* =============Line Rate Get Time================== */}

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
              lg: "20%",
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
                  apiRef={apiRef}
                  rows={frieghtdata}
                  columns={FrightSeletColumns}
                  getRowId={(row) => row.DocEntry}
                  checkboxSelection
                  onRowSelectionModelChange={handleFrightCellClick}
                  onCellKeyDown={handleCellKeyDown}
                  columnHeaderHeight={35}
                  rowHeight={40}
                  pageSizeOptions={[10]}
                  sx={{
                    height: "50vh",
                    backgroundColor:
                      theme.palette.mode === "light" ? "#fff" : "#373842",
                    "& .MuiDataGrid-cell:focus": {
                      outline: "2px solid",
                      outlineColor: theme.palette.primary.main,
                      outlineOffset: "-2px",
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
        // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
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
      {/*===============Modal/Dialog===============*/}
      <CopyFromSearchModel
        open={openDialog}
        onClose={handleCloseDialog}
        onCancel={handleCloseDialog}
        onChange={(e) => handleGetListSearchCopyFrom(e.target.value)}
        value={getListqueryCopyFrom}
        onClickClear={handleGetListClearCopyFrom}
        // title={selectedItem}
        Input={
          <>
            <Typography variant="subtitle1" fontWeight="bold">
              Copy From Document
            </Typography>
            <Grid item xs={12} sm={12} md={6} lg={6} textAlign={"center"}>
              <Controller
                name="baseType"
                control={control}
                defaultValue={"1470000113"}
                render={({ field, fieldState: { error } }) => (
                  <InputSelectTextField
                    label="Select Document"
                    data={[{ key: "1470000113", value: "Purchase Request" }]}
                    {...field}
                    error={!!error} // Pass error state to the FormComponent if needed
                    helperText={error ? error.message : null} // Show the validation message
                    onChange={(e) => {
                      field.onChange(e); // Update form state with React Hook Form
                      fetchCopyFromData(0, "", type);
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
            {/* {watch("baseType") === undefined ? (
  <Typography sx={{ textAlign: "center", mt: 2 }} color="error">
    Please select a Base Type
  </Typography>
) :( */}
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
                <Typography textAlign="center">No More Records</Typography>
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
                  onClick={(e) => onClickCopyFrom(e, item, i, item.DocNum)}
                />
              ))}
            </InfiniteScroll>

            {/* )} */}
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
                    ...item, // Spread existing item properties
                    id: index + 1, // If `id` exists, use it; otherwise, use the index
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
                  // onRowSelectionModelChange={(selectedIDs) => handleCellClickPurchaseSelected(selectedIDs)}
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

      {/* ================================= */}

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
              display: {}, // Show only on smaller screens
              position: "absolute",
              right: "50px",
              // color: "black",
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
              Purchase Quotation
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
                            // ClearForm();
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
                                // key={index}
                                key={item.DocEntry}
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
                          type="text"
                          {...field}
                          readOnly={true}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="NumAtCard"
                      // rules={{
                      //   required: "This field is required",
                      //   pattern: {
                      //     value: /^[A-Za-z0-9]{1,100}$/, // This regex
                      //     message: "Field must only contain 10 digits",
                      //   },
                      // }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Vendor REF.NO."
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          // onChange={(e) => {
                          //   field.onChange(e);
                          // }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
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
                          disabled={
                            allFormData.Status === "Closed" ||
                            allFormData.Status === "Cancelled"
                          }
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setValue(
                              "DocDate",
                              dayjs(date).format("YYYY-MM-DD"),
                              { shouldDirty: true },
                            );
                            setValue("DocDueDate", date, { shouldDirty: true });
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
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="VALID UNTIL"
                          name={field.name}
                          // value={dueDate}
                          value={field.value ? dayjs(field.value) : undefined}
                          minDate={getValues("DocDate")}
                          onChange={(date) => setValue("DocDueDate", date)}
                          disabled={
                            !getValues("DocDate") ||
                            allFormData.Status === "Closed" ||
                            allFormData.Status === "Cancelled"
                          } // Disable due date picker until start date is selected
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
                          // disabled={
                          //   allFormData.Status === "Closed" ||
                          //   allFormData.Status === "Cancelled"
                          // }
                          onChange={(newValue) => {
                            setValue("TaxDate", newValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ReqDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="REQUIRED DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => {
                            setValue("ReqDate", newValue);
                            setValue("CancelDate", "");
                            handleChangeDatereq(newValue);
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
                                type="number"
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
                        currentData.CardCode === "" ||
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
                          data={[
                            { key: "I", value: "ITEM" },
                            { key: "S", value: "SERVICE" },
                          ]}
                          value={type}
                          onChange={(e) => {
                            // Update the field value
                            field.onChange(e);
                            // Set the 'type' state
                            fetchCopyFromData(0, "", e.target.value);
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
                          readOnly={true}
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
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
                    <Box
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Button
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        // onClick={handleClick}
                        onClick={() => handleMenuItemClick()}
                        disabled={
                          allFormData.CardCode === "" ||
                          allFormData.Status === "Closed" ||
                          allFormData.Status === "Cancelled"
                        }
                      >
                        COPY FROM
                      </Button>
                    </Box>
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
                    <Button
                      variant="contained"
                      color="info"
                      onClick={handleClickOpen}
                      disabled={
                        type === "" ||
                        currentData.CardCode === "" ||
                        allFormData.Status === "Closed" ||
                        allFormData.Status === "Cancelled"
                      }
                    >
                      {type === "I" ? "Search Item" : "Search Service"}

                      {/* Search Item */}
                    </Button>
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
                            onChange={handleChangeWithConfirm}
                          />
                        );
                      }}
                    />
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
                          sx={{
                            overflow: "auto",
                            width: "100%",
                            height: "100%",
                            minHeight: "300px",
                            maxHeight: "500px",
                            mt: "5px",
                          }}
                        >
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DataGrid
                              key={type}
                              apiRef={apiRef}
                              className="datagrid-style"
                              rows={getValues("oLines").map((data, index) => ({
                                ...data,
                                id: index,
                              }))}
                              getRowId={(row) => row.id}
                              columns={columns}
                              experimentalFeatures={{ newEditingApi: true }}
                              columnHeaderHeight={35}
                              rowHeight={40}
                              onCellKeyDown={handleCellKeyDown}
                              processRowUpdate={processRowUpdate}
                              onProcessRowUpdateError={(err) =>
                                console.error(err)
                              }
                              isRowSelectable={(params) =>
                                params.row.Status !== "0"
                              }
                              getRowClassName={(params) =>
                                params.row.Status === "0"
                                  ? "disabled-row"
                                  : "" || params.row.Status === "3"
                                    ? "disabled-row"
                                    : ""
                              } // ✅ Add class for styling
                              isCellEditable={(params) => {
                                if (params.field === "taxCategory")
                                  return false;
                                if (
                                  params.row.Status === "0" ||
                                  params.row.Status === "3"
                                )
                                  return false;
                                return true;
                              }}
                              // sx={{
                              //   "& .MuiDataGrid-columnHeaders": {
                              //     backgroundColor: (theme) =>
                              //       theme.palette.custome?.datagridcolor ||
                              //       theme.palette.grey[100],
                              //   },
                              //   "& .MuiDataGrid-row:hover": {
                              //     boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                              //   },

                              //   "& .MuiCheckbox-root.Mui-checked": {
                              //     color: "#1976d2",
                              //   },
                              // }}
                              sx={gridSx}
                            />
                          </LocalizationProvider>
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
                                  {...field}
                                  error={!!error}
                                  readOnly={true}
                                                                   onKeyDown={(e) => {
                                  
        if (e.key === "Enter") {    
          e.preventDefault();  
          DialogOpenCompany();
        }
      }}
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
                                  data={ShippingTypeData.map((item) => ({
                                    key: item.DocEntry,
                                    value: item.TrnspName,
                                  }))}
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
                                                                     onKeyDown={(e) => {
                                  
        if (e.key === "Enter") {
          e.preventDefault();  
          DialogOpenPayto();
        }
      }}
                                  {...field}
                                  error={!!error}
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
                          <Grid
                            item
                            lg={4}
                            md={6}
                            xs={12}
                            textAlign={"center"}
                            width={220}
                          >
                            <Controller
                              name="OnlineQuo"
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
                                      variant="overline"
                                      noWrap={true}
                                      sx={{
                                        fontFamily: "'Open Sans', sans-serif", // Apply font family here
                                      }}
                                    >
                                      OnLine Qautation(RFQ)
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
                            name="CancelDate"
                            control={control}
                            rules={{ required: "Date is Required" }}
                            render={({ field, fieldState: { error } }) => (
                              <SelectedDatePickerField
                                label="CANCELLATION DATE"
                                name={field.name}
                                // value={dueDate}
                                value={
                                  field.value ? dayjs(field.value) : undefined
                                }
                                minDate={getValues("ReqDate")}
                                onChange={(date) => {
                                  const postingDate = getValues("ReqDate");
                                  if (
                                    date &&
                                    postingDate &&
                                    dayjs(date).isBefore(
                                      dayjs(postingDate),
                                      "day",
                                    )
                                  ) {
                                    // Don't set the value if it's before posting date
                                    setError("CancelDate", {
                                      type: "manual",
                                      message:
                                        "Due date must be later than or equal to ReqDate date",
                                    });
                                    return;
                                  }
                                  // Clear any existing errors
                                  clearErrors("CancelDate");
                                  setValue("CancelDate", date);
                                }}
                                disabled={
                                  !watch("ReqDate") ||
                                  allFormData.Status === "Closed" ||
                                  allFormData.Status === "Cancelled"
                                } // Disable due date picker until start date is selected
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
                                disabled={
                                  allFormData.Status === "Closed" ||
                                  allFormData.Status === "Cancelled"
                                }
                                data={[
                                  { key: "E", value: "MONTH END" },
                                  { key: "H", value: "MONTH HALF" },
                                  { key: "Y", value: "MONTH START" },
                                  { key: "N", value: "-" },
                                ].map((item) => ({
                                  key: item.key,
                                  value: item.value,
                                }))}
                                onChange={(e) => {
                                  field.onChange(e); // Update the form field value
                                  calculateDueDateSimplified(); // Call your custom handler
                                }}
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
                                helperText={error?.message}
                                onChange={(e) => {
                                  field.onChange(e); // Update the form field value
                                  calculateDueDateSimplified(); // Call your custom handler
                                }}
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
                                helperText={error?.message}
                                onChange={(e) => {
                                  field.onChange(e); // Update the form field value
                                  calculateDueDateSimplified(); // Call your custom handler
                                }}
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
                    <Grid
                      item
                      md={4}
                      sm={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="SlpCode"
                        control={control}
                        defaultValue={0}
                        rules={{ required: "Buyer Field is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="BUYER"
                            data={[
                              {
                                key: 0,
                                value: "NO Emp",
                              },
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
                            ? ValueFormatter(TotalBefDisc)
                            : curSource === "S"
                              ? ValueFormatter(totalBefDiscSy)
                              : getValues("Currency") === companyData.MainCurncy
                                ? ValueFormatter(TotalBefDisc)
                                : ValueFormatter(totalBefDiscFrgn)
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
                                ? Quantity !== OpenQuantity
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
                                ? Quantity !== OpenQuantity
                                : ""
                            }
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            // onBlur={(e) => {
                            //   field.onBlur(e); // Call the original field onBlur first
                            //   handleDiscountAmtChange(e); // Then call your custom handler
                            // }}
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
                    {/* <Grid
                      item
                      xs={12}
                      md={4}
                      sm={6}
                      lg={3}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Comments"
                        // rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="REMARKS"
                            type="text"
                            rows={2}
                            multiline
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid> */}
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
                  disabled={
                    (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                    (SaveUpdateName !== "SAVE" && !perms.IsEdit) ||
                    allFormData.Status === "Closed" ||
                    allFormData.Status === "Cancelled"
                  }
                  color="success"
                  sx={{ color: "white" }}
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
export default React.memo(PurchaseQuotation);
