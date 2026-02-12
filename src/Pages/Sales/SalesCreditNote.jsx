import AccountBalanceIcon from "@mui/icons-material/AccountBalance"; // For Accounting
import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
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
  useTheme,
} from "@mui/material";
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
import { dataGridSx } from "../../Styles/dataGridStyles";
import apiClient from "../../services/apiClient";
import { fetchExchangeRateStore } from "../../slices/exchangeRateSlice";
import BatchIntake from "../Components/Batch";
import BatchOutCopyform from "../Components/BatchOutCopyform";
import BinLocation from "../Components/BinLocation";
import CalCulation, { toMinOne } from "../Components/CalCulation";
import CardComponent from "../Components/CardComponent";
import CardCopyFrom from "../Components/CardCopyFrom";
import DataGriCellModelClick from "../Components/DataGridCellModelClick";
import DataGridModal from "../Components/DataGridModal";
import ExchangeLineRateCopyform from "../Components/ExchangeLineRateCopyform";
import LogisticAddress from "../Components/LogisticAddress";
import PrintMenu from "../Components/PrintMenu";
import SearchInputField from "../Components/SearchInputField";
import SearchModel, { CopyFromSearchModel, SearchBPModel } from "../Components/SearchModel";
import SerialIntake from "../Components/SerialIntake";
import SerialOutCopyForm from "../Components/SerialOutCopyForm";
import TableGridFrieght from "../Components/TableGridFrieght";
import TaxCategoryModel from "../Components/TaxCategoryModel";
import TaxDatagridCellModel from "../Components/TaxDatagridCellModel";
import { ValidationSubmitForm } from "../Components/ValidationSubmitForm";
import { TwoFormatter, ValueFormatter } from "../Components/ValueFormatter";
import {
  calculateExpenseTotals,
  getUniqueCount,
} from "../Components/calculateExpenseTotals";
import {
  InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
  SelectedDatePickerField,
  SmallInputSelectTextField,
  SmallInputTextField,
} from "../Components/formComponents";
import { getStatus } from "../Components/status";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { validateTaxSelection } from "../Components/validateTaxSelection";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { useCopyFromList } from "../../Hooks/useCopyFromList";
const TaxColumn = [
  {
    id: 1,
    field: "TaxCode",
    headerName: "TaxCode",
    width: 200,
    //  pinned: 'right',
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
    width: 200,
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

const ServiceCol = [
  {
    id: 1,
    field: "ServCode",
    headerName: "SAC Code",
    width: 150,
    editable: true,
  },
  {
    id: 2,
    field: "ServName",
    headerName: "SAC Name",
    width: 150,
    editable: true,
  },
];

const FrightSeletColumns = [
  // {
  //   id: 2,
  //   field: "RevAcct",
  //   headerName: "Expns Code",
  //   width: 150,
  //   editable: true,
  // },

  {
    id: 1,
    field: "ExpnsName",
    headerName: "Expns Name",
    width: 150,
    editable: true,
  },
];

const ChartAccountCol = [
  {
    id: 1,
    field: "AcctCode",
    headerName: "Account Code",
    width: 200,
  },
  {
    id: 2,
    field: "AcctName",
    headerName: "Account Name",
    width: 200,
  },
  {
    id: 3,
    field: "ActCurr",
    headerName: "Account Currency",
    width: 200,
  },
  {
    id: 3,
    field: "CurrTotal",
    headerName: "Currency Total",
    width: 200,
  },
];
const CopyFromItemCol = [
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
    field: "DiscPrcnt",
    headerName: "DISC(%)",
    width: 100,
    sortable: false,
    editable: false,
    // renderCell: (params) => (
    //   <InputTextField
    //     name="DiscPrcnt"
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
  { id: 1, field: "ServCode", headerName: "SERVICE CODE", width: 100 },

  {
    id: 2,
    field: "ItemName",
    headerName: "SERVICE NAME",
    width: 150,
    sortable: false,
    editable: false,
    // renderCell: (params) => (
    //   <InputTextField
    //     name="ItemName"
    //     value={params.value}
    //     onChange={(e) => handleChange(e, params.row)}
    //   />
    // ),
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
    field: "Price",
    headerName: "UNIT PRICE",
    sortable: false,
    width: 130,
    editable: false,
    // renderCell: (params) => (
    //   <InputTextField
    //     name="Price"
    //     type="number"
    //     value={params.value}
    //     onChange={(e) => handleChange(e, params.row)}
    //   />
    // ),
  },

  {
    field: "AssblValue",
    headerName: "AssblValue",
    sortable: false,
    width: 130,
    editable: false,
    // renderCell: (params) => (
    //   <InputTextField
    //     name="AssblValue"
    //     type="number"
    //     value={params.value}
    //     onChange={(e) => handleChange(e, params.row)}
    //   />
    // ),
  },

  // {
  //   field: "TaxCode",
  //   headerName: "TAX CODE",
  //   width: 110,
  //   sortable: false,
  //   editable: false,
  //   // renderCell: (params) => (
  //   //   <InputSelectTextField
  //   //     name="TaxCode"
  //   //     value={params.value}
  //   //     onChange={(e) => handleChange(e, params.row)}
  //   //     data={taxcode.map((item) => ({
  //   //       key: item.DocEntry,
  //   //       value: item.TaxCode,
  //   //     }))}
  //   //   />
  //   // ),
  // },
  {
    field: "DiscPrcnt",
    headerName: "DISC(%)",
    width: 100,
    sortable: false,
    editable: false,
    // renderCell: (params) => (
    //   <InputTextField
    //     name="Discount"
    //     type="number"
    //     value={params.value}
    //     onChange={(e) => handleChange(e, params.row)}
    //   />
    // ),
  },
  // {
  //   field: "LineTotal",
  //   headerName: "TOTAL(LC)",
  //   type: "number",
  //   width: 100,
  //   sortable: false,
  //   editable: false,
  //   renderCell: (params) => (
  //     <InputTextField
  //       name="LineTotal"
  //       value={params.value}
  //       onChange={(e) => handleChange(e, params.row)}
  //     />
  //   ),
  // },

  {
    field: "LineTotal",
    headerName: "TOTAL",
    type: "number",
    width: 100,
    sortable: false,
  },
];
const initialState = {
  exchaneRateOpen: false,
  DocRateOpen: false,
  BinLocationOpen: false,
  CharOfAccOpen: false,
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
export default function SalesCreditNote() {
  const theme = useTheme();
  const { user, warehouseData, companyData } = useAuth();
  const [apiloading, setapiloading] = useState(false);

  const perms = usePermissions(122);
  const [state, dispatch] = useReducer(reducer, initialState);
  const timeoutRef = useRef(null);
  const [tabvalue, settabvalue] = useState(0);
  const [PaymentTermData, setPaymentTermData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  let [ok, setok] = useState("OK");
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [DocEntry, setDocEntry] = useState("");
  const [type, setType] = useState("I");
  const [openDialog, setOpenDialog] = useState(false); // Control modal visibility
  const [currencydata, setCurrencydata] = useState([]);
  const [taxcode, setTaxCode] = useState([]);
  const [frieghtdata, setFrieght] = useState([]);
  const [salesemp, setSalesEmp] = useState([]);
  const [open, setOpen] = useState(false);
  const [serviceopen, setServiceOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [FrieghtTax, setTaxFrieght] = useState([]);
  const [openFreight, setopenFreight] = useState(false);
  const [frieghtopen, setFrieghtopen] = useState(false);
  const [shippingType, setShippingType] = useState([]);
  const [UomCodeList, SetUomCode] = useState([]);
  const [openUomCode, setUomcodeOpen] = useState(false);
  const [oldOpenData, setSelectData] = useState(null);
  const [openPayTo, setOpenPayTo] = useState(false);
  const [openShipTo, setOpenShipTo] = useState(false);
  const [RollBackoExpLines, setRollBackoExpLines] = useState([]);
  const dispatchRedux = useDispatch();
  const { data, loading } = useSelector((state) => state.exchange);
  const navigate = useNavigate();
  const [AllDataCopyRateLine, setAllDataCopyRateLine] = useState([]);

  //* ====================================open Tab State=====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //==========================================================================================================================
  //=====================================cancel List State====================================================================
  const [cancelledListData, setCancelledListData] = useState([]);
  const [cancelledListquery, setCancelledListQuery] = useState("");
  const [hasMoreCancelled, setHasMoreCancelled] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const Openmenu = Boolean(anchorEl);
  const [cancelListPage, setCancelListPage] = useState(0);
  const [cancelListSearching, setCancelListSearching] = useState(false);
  //! ==============CANCEL LIST===============
  const [BinlocListData, setBinLocData] = useState([]);
  //==========================================================================================================================
  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  //==========================================================================================================================
  //* ====================================Search Model State=====================================================================
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  //==========================================================================================================================
  //* ====================================Copy From State=====================================================================
  const [selectedRowsSales, setselectedRowsSales] = useState([]);
  const [OlinesData, setOlines] = useState([]);
  const [openSales, setOpenSales] = useState(false);
  const [copyFromModelSales, setCopyFromModelSales] = useState([]);
  // const [allData, setallData] = useState([]);
  const [, setallData] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [oExpLineData, setoExpLines] = useState([]);
  //==========================================================================================================================

  //=========================================get List From Search State End================================================================
  //  ===================================WareHouse State===================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);
  // =======================Ware House End=======================================
  const [CopyformData, setAllDAtaCopyform] = useState([]);
  const [BusinessPartnerData, setBusinessPartnerData] = useState([]);
  // ===========================Data Grid Pagination And Searching============================

  const LIMIT = 20;
  const [isLoading, setIsLoading] = useState(false);
  // ==================TAX===================================
  // =======================Chart Of Account======================================
  const [AccountCache, setAccountCache] = useState({});
  const [ChartOfAccountList, setChartOfAccountList] = useState([]);
  const [ChartAcccurrentPage, setAccCurrentPage] = useState(0);
  const [searchTextChartAcc, setChartOfAccSearchText] = useState("");
  const [ChartAccrowCount, setRowChartAccCount] = useState(0);

  // ==========================chart of Account end ================================
  const [openTax, setTaxOpen] = useState(false);
  const [TaxgetListData, setTaxGetListData] = useState([]);
  const [taxCurrentPage, setTaxCurrentPage] = useState(0);
  const [taxSearchText, setTaxSearchText] = useState("");
  const [taxRowCount, setTaxRowCount] = useState(0);
  const [taxcategoryopen, setTaxCategoryOpen] = useState(false);
  const [oTaxLineCategory, setoTaxLineCategory] = useState([]);
  // ====================================================================

  //=======================Serial and Batch====================================
  let [openserial, setopenserial] = useState(false);
  let [openBatch, setopenBatch] = useState(false);
  let [openserialOutCopy, setopenserialOutCopy] = useState(false);
  const handleCloseSerial = () => setopenserial(false);
  const handleCloseBatch = () => setopenBatch(false);
  const handleCloseSerialCopyform = () => setopenserialOutCopy(false);
  let [openBatchCopyform, setopenBatchCopyform] = useState(false);
  const handleCloseBatchCopyform = () => setopenBatchCopyform(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [errorLineIds, setErrorLineIds] = useState([]);
  const apiRef = useGridApiRef();
  const [clearCache, setClearCache] = useState(false);
  const [PrintData, setPrintData] = useState([]);

  // ===============================Serial and Batch End===========================

  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  let status = getStatus("1");
  const initialFormData = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    Status: status,
    CardCode: "",
    NumAtCard: "",
    CardName: "",
    CntctCode: "",
    CountryCode: "",
    SAPDocNum: "",
    SAPDocEntry: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD "),
    DocDueDate: dayjs(undefined).format("YYYY-MM-DD "),
    TaxDate: dayjs(undefined).format("YYYY-MM-DD "),
    DocNum: "",
    SlpCode: "0",
    Currency: "",
    DfltShiped: "",
    DfltBilled: "",
    DocType: "",
    DiscPrcnt: "0.000",
    PaidToDate: "0.000",
    DocRate: "1",
    Series: "",
    DocCur: "",
    DocTotal: "",
    DocTotalSy: "",
    DfltAddress: "",
    CompnyAddr: "",
    TotalBefDisc: "",
    TotalExpns: "0.000",
    RoundDif: "0.000",
    PayToCode: "",
    Address2: "",
    Address: "",
    ShipToCode: "",
    TrnspCode: "",
    Comments: "",
    CurSource: "",
    GrsAmount: "",
    AttcEntry: "0",
    ShipType: "",
    DiscSum: "0.000",

    ListNum: "",
    VatSum: "",
    ShipMode: "",
    PORevise: "",
    SAPSync: "",
    DpmAmnt: "",
    PaidAmnt: "",
    GroupNum: "",
    JrnlMemo: "",
    CdcOffset: "",
    CancelDate: "",
    PayDuMonth: "",
    ExtraDays: "",
    ExtraMonth: "",
    CtlAccount: "",
    DueAmnt: "",
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
        ObjectType: "14",
        StreetS: " ",
        BlockS: " ",
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
    setValue,
    watch,
    getValues,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: initialFormData,
  });
  const currentData = getValues();
  const allFormData = getValues();
  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/14`,
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

  const RoundDif = watch("RoundDif");
  const discPercent = watch("DiscPrcnt");
  const curSource = watch("CurSource");
  const DocRate = watch("DocRate");
  const currency = watch("Currency");
  // const docDate = watch("DocDate");
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
  let handleAddress = (value) => {
    let selectedAddress =
      (BusinessPartnerData?.oLines || []).find(
        (item) => item.LineNum === value,
      ) || {};
    let DfltAddress = [
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
    setValue("BlockS", selectedAddress.Address1);
    setValue("StreetS", selectedAddress.Address2);
    setValue("CityS", selectedAddress.City);
    setValue("StateS", selectedAddress.State);
    setValue("Country", selectedAddress.Country);
    setValue("ZipcodeS", selectedAddress.Zipcode);

    let updatedData = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockS: selectedAddress.Address1,
      StreetS: selectedAddress.Address2,
      CityS: selectedAddress.City,
      StateS: selectedAddress.State,
      Country: selectedAddress.Country,
      ZipcodeS: selectedAddress.Zipcode,
    }));
    setValue("oTaxExtLines", updatedData);
  };

  let handleAddressBILLTO = (value) => {
    let selectedAddress =
      (BusinessPartnerData?.oLines || []).find(
        (item) => item.LineNum === value,
      ) || {};

    console.log(selectedAddress);
    let Address = [
      selectedAddress.Address1,
      selectedAddress.Address2,
      selectedAddress.City,
      selectedAddress.State,
      selectedAddress.Zipcode,
      selectedAddress.Country,
    ]
      .filter((v) => v?.trim())
      .join(", ");

    setValue("Address", Address || "");
    setValue("BlockB", selectedAddress.Address1 || "");
    setValue("StreetB", selectedAddress.Address2 || "");
    setValue("CityB", selectedAddress.City || "");
    setValue("StateB", selectedAddress.State || "");
    setValue("CountryB", selectedAddress.Country || "");
    setValue("ZipcodeB", selectedAddress.Zipcode || "");
    let updatedData = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockB: selectedAddress.Address1,
      StreetB: selectedAddress.Address2,
      CityB: selectedAddress.City,
      StateB: selectedAddress.State,
      CountryB: selectedAddress.Country,
      ZipcodeB: selectedAddress.Zipcode,
    }));
    setValue("oTaxExtLines", updatedData);
  };
  const handleSubmitAddress = (data) => {
    console.log("Submitted Address:", data);
    let Address = [
      data.BlockB, // Use correct field names
      data.StreetB, // Use correct field names
      data.CityB,
      data.StateB,
      data.ZipCodeB,
      data.CountryB,
    ]
      .filter((v) => v?.trim())
      .join(", ");
    setValue("Address", Address || "");
    setValue("BlockB", data.BlockB);
    setValue("StreetB", data.StreetB);
    setValue("CityB", data.CityB);
    setValue("StateB", data.StateB);
    setValue("CountryB", data.CountryB);
    setValue("ZipcodeB", data.ZipCodeB);

    let updatedData = allFormData.oTaxExtLines.map((add) => ({
      ...add,
      BlockB: data.BlockB, // ✅ Correct syntax
      StreetB: data.StreetB,
      CityB: data.CityB,
      StateB: data.StateB,
      CountryB: data.CountryB,
      ZipCodeB: data.ZipCodeB,
    }));
    console.log("adddresss", updatedData);
    setValue("oTaxExtLines", updatedData);
  };

  const handlesubmitAddressShipTo = async (data) => {
    const result = await Swal.fire({
      text: "Changing to interstate warehouse will clear tax codes. Are you sure?",
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      showCancelButton: true,
      showConfirmButton: true,
    });

    if (result.isConfirmed === true) {
      console.log("Submittd Address Pay To:", data);
      let ShipToAddress = [
        data.BlockB, // Use correct field names
        data.StreetB, // Use correct field names
        data.CityB,
        data.StateB,
        data.ZipCodeB,
        data.CountryB,
      ]
        .filter((v) => v?.trim())
        .join(", ");
      setValue("DfltAddress", ShipToAddress || ""); // Set formatted address only
      setValue("BlockS", data.BlockB);
      setValue("StreetS", data.StreetB);
      setValue("CityS", data.CityB);
      setValue("StateS", data.StateB);
      setValue("CountryS", data.CountryB);
      setValue("ZipcodeS", data.ZipCodeB);
      let updatedData = allFormData.oTaxExtLines.map((add) => ({
        ...add,
        BlockS: data.BlockB, // ✅ Correct syntax
        StreetS: data.StreetB,
        CityS: data.CityB,
        StateS: data.StateB,
        CountryS: data.CountryB,
        ZipCodeS: data.ZipCodeB,
      }));
      let oLines = allFormData.oLines.map((add) => ({
        ...add,
        TaxCode: "",
        VatGroup: "",
        VatPrcnt: "",
      }));
      setValue("oLines", oLines);
      setValue("oTaxExtLines", updatedData);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };

  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };

  const handleFright = () => {
    setFrieghtopen(true);
  };

  const closeModel = () => {
    setOpen(false);
    setSelectedRows([]);
  };

  const handleClose = () => {
    setServiceOpen(false);
    setAnchorEl(null);
  };

  const SelectFreight = () => {
    setopenFreight(true);
  };

  const closeFreightModel = () => {
    setopenFreight(false);
  };

  const DialogOpenPayto = () => {
    setOpenPayTo(true);
  };

  const DialogClosePayto = () => {
    setOpenPayTo(false);
  };

  const DialogOpenShipto = () => {
    setOpenShipTo(true);
  };

  const DialogCloseShipto = () => {
    setOpenShipTo(false);
  };

  //-----------------------------Action Button RowLevel-----------------------------
  const handleDeleteRow = (id) => {
    const updatedRows = allFormData.oLines.filter((_, index) => index !== id);

    const updatedData = {
      ...allFormData,
      oLines: updatedRows,
    };
    setok("UPDATE");

    // Reset the form with the updated data
    reset(updatedData);
    calculateDiscountAmt(parseFloat(allFormData.DiscPrcnt)); // Apply discount to line-level items
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

  // -------------------------------------------------------------------------------

  // Function to close the dialog
  const selectWhSCode = async (
    WHSCode,
    Location,
    LocationName,
    GSTRegnNo,
    GSTType,
    BinCode,
    DftBinAbs,
    BinActivat,
    SaleCostAc,
    SalesTax,
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
            LocCode: LocationName,
            LocationDoC: Location,
            AcctCode: line.GLMethod === "W" ? SaleCostAc : line?.SaleCostAc,
            TaxAcct: line.GLMethod === "W" ? SalesTax : line?.SalesTax,
            CogsAcct: line.GLMethod === "W" ? SaleCostAc : line?.SaleCostAc,
            BinCode,
            DftBinAbs,
            BinActivat,
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
            LocCode: LocationName,
            LocationDoC: Location,
            BinCode,
            DftBinAbs,
            BinActivat,
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
      setWhscOpen(false);
      return;
    }

    // Default case - just update warehouse without tax clearing
    const updatedLines = currentLines.map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          WHSCode,
          LocCode: LocationName,
          LocationDoC: Location,
          BinCode,
          DftBinAbs,
          BinActivat,
        };
      }
      return line;
    });
    reset({
      ...allFormData,
      oLines: updatedLines,
    });
    // Update company address if header line is changed
    setWhscOpen(false);
  };

  const selectUomCode = async (UomCode, UomEntry, UomName, AltQty, BaseQty) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    setok("UPDATE");
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        const originalRow = selectedRowsSales[index] || [];
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

  // ========================================End=================================
  const handleClickOpen = () => {
    if (type === "I") {
      setOpen(true);
      openItems();
    } else if (type === "S") {
      setServiceOpen(true);
      openServices();
    }
  };

  const ClearForm = () => {
    reset(initialFormData);
    setType("I");
    setDocEntry("");
    setSaveUpdateName("SAVE");
    setCopyFromModelSales([]);
    setAllDAtaCopyform([]);
    setOlines([]);
    setoExpLines([]);
    clearFiles();
    setRollBackoExpLines([]);
    setallData([]);
    setBusinessPartnerData([]);
    setSelectData([]);
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
    setCheckedItems({});
 
  };

  //* =============================CAlCulation Logic=============================
  const handleCellClick = (id) => {
    const selectedIDs = new Set(id); // All selected DocEntry values across all pages

    setSelectedRows((prev) => {
      // 1. Preserve existing values for rows still selected
      const stillSelected = prev.filter((row) => selectedIDs.has(row.DocEntry));
      const newSelections = itemList
        .filter((row) => selectedIDs.has(row.DocEntry))
        .filter(
          (row) => !stillSelected.some((r) => r.DocEntry === row.DocEntry),
        )
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
            QtyVar: data.QtyVar || "",
            ChapterID: data.ChapterID,
            Price: PriceBefDi,
            Quantity: 1,
            Bin: 1,
            OpenQuantity: 1,
            AssblValue: data.AssblValue,
            DiscPrcnt: 0,
            LineTotal: PriceBefDi,
            TotalSumSy: sysRate > 0 ? PriceBefDi / sysRate : 0,
            TotalFrgn: DocRate > 0 ? PriceBefDi / DocRate : 0,

            Currency: Currency,
            oLines: data.oLines,
            PriceBefDi: PriceBefDi,
            OnHand: data.OnHand,
            IsCommited: data.IsCommited,
            AcctCode: data.SaleCostAc,
            CogsAcct: data.SaleCostAc,
            TaxAcct: data.SalesTax,
            OnOrder: data.OnOrder,
            WHSCode: data.DefaultWhs || "",
            UomEntry2: data.UgpEntry || "",
            UomEntry: data.SUoMEntry,
            Excisable: data.Excisable,
            PostTax: data.GSTRelevnt,
            NumInSale: data.NumInSale,
            UomCode:
              data.UgpEntry === "-1"
                ? "Manual"
                : data.SUOMCode === "0"
                  ? ""
                  : data.SUOMCode,

            PUoMEntry: data.SUoMEntry || "",
            UOMFactor: ValueFormatter(data.UOMFactor || "0", 6),
            GstTaxCtg: data.GstTaxCtg,

            ManBtchNum: data.ManBtchNum,
            ManSerNum: data.ManSerNum,
            NumPerMsr: ValueFormatter(
              data.SUOMFactor > 0
                ? data.UOMFactor / data.SUOMFactor
                : "1.000000",
              6,
            ),
            InvQty: ValueFormatter(
              data.SUOMFactor > 0
                ? data.UOMFactor / data.SUOMFactor
                : "1.000000",
              6,
            ),
            OpenInvQty: ValueFormatter(
              data.SUOMFactor > 0
                ? data.UOMFactor / data.SUOMFactor
                : "1.000000",
              6,
            ),
          };
        });

      // 3. Combine and return the updated selection list
      const combined = [...stillSelected, ...newSelections];
      return combined;
    });
  };

  // 1️⃣ Find Rate by Currency
  const findRate = (data, curr) => {
    return parseFloat(data.find((ex) => ex.Currency === curr)?.Rate) || 0;
  };
  const onSubmitLineCurrency = (data) => {
    // If lines already exist → open purchase modal
    if (OlinesData.length > 0) {
      handleOpenSales("NEW", data);
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
    const selectedRow = BinlocListData;

    const updatedOLines = (oLines || []).map((row, index) =>
      index === selectedRow.id
        ? {
            ...row,
            oDocBinLocationLines: rowsFromModal.map((binitem) => ({
              UserId: user.UserId,
              CreatedBy: user.UserName,
              ModifiedBy: user.UserName,
              Status: 1,
              MessageID: 0,
              BinAbs: Number(binitem.DocEntry),
              SnBMDAbs: 0,
              Quantity: binitem.Quantity,
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
    const currentData = getValues();
    try {
      const updatedSelectedRows = selectedRows.map((row) => {
        const matchedWarehouse = warehouseData.find(
          (wh) => wh.WHSCode === row.WHSCode,
        );
        return {
          ...row,
          LocCode: matchedWarehouse?.LocationName || "",
          BinCode: matchedWarehouse?.BinCode ?? "",
          DftBinAbs: matchedWarehouse?.DftBinAbs,
          BinActivat: matchedWarehouse?.BinActivat,
          // LocationDoC: matchedWarehouse?.LocationDoC ||"",
        };
      });
      const updatedLines = [
        ...(currentData.oLines || []),
        ...(updatedSelectedRows || []),
      ];
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
      const discountValue = parseFloat(currentData.DiscPrcnt) || 0;
      if (Array.isArray(UpdatedLines) && UpdatedLines.length > 0) {
        calculateDiscountAmt(discountValue);
      }

      closeModel();
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
        Currency: currency,
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
          DocEntry: data.DocEntry,
          Currency: activeCurrency, // Add DocEntry for reference
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
  //     field: "Quantity",
  //     headerName: "QTY",
  //     width: 120,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="Quantity"
  //         type="number"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0" || params.row.Status === "3"} // ✅ Disable input for Status 0 & 3
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
  //         readOnly={
  //           params.row.BaseType === "13" || params.row.BaseType === "16"
  //         }
  //         value={params.value}
  //         onChange={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0" || params.row.Status === "3"}
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
  //       />
  //     ),
  //   },

  //   {
  //     field: "DiscPrcnt",
  //     headerName: "DISC(%)",
  //     width: 120,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="DiscPrcnt"
  //         type="number"
  //         readOnly={
  //           params.row.BaseType === "13" || params.row.BaseType === "16"
  //         }
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
  //               readOnly={
  //                 params.row.BaseType === "13" ||
  //                 params.row.BaseType === "16" ||
  //                 allFormData.DocEntry
  //               }
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
  //           disabled={params.row.Status === "0"}
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
  //     headerName: "WHSCode",
  //     sortable: false,
  //     width: 150,
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
  //                         setBinLocData(params.row);
  //                         dispatch({ type: "OPEN", modal: "BinLocationOpen" });
  //                       }}
  //                       disabled={
  //                         SaveUpdateName === "UPDATE"
  //                           ? (params.row.oDocBinLocationLines || []).length ===
  //                             0
  //                           : params.row.Status === "0" ||
  //                             Number(params.row.DftBinAbs) <= 0 ||
  //                             params.row.BinActivat !== "Y" ||
  //                             params.row.BaseType === "16"
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
  //     headerName: "Location Name",
  //     width: 120,
  //     sortable: false,
  //   },

  //   {
  //     field: "UomCode",
  //     headerName: "UoM CODE",
  //     width: 130,
  //     sortable: false,
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
  //               // disabled={params.row.Status === "0"}
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
  //                       size="small"
  //                       color="primary"
  //                       disabled={isDisabled}
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

  //   // {
  //   //   field: "WHSCode",
  //   //   headerName: "WHSCode",
  //   //   width: 100,
  //   //   sortable: false,
  //   // },

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
  //       if (BaseType === "16") {
  //         disabled = true;
  //       }

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
      field: "DiscPrcnt",
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
                if (params.row.BaseType === "13") return;

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
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();
                if (
                  params.row.Status === "0" ||
                  params.row.Quantity !== params.row.OpenQuantity ||
                  params.row.BaseType === "13" ||
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
                  params.row.Quantity !== params.row.OpenQuantity ||
                  params.row.BaseType === "13"
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
              : `TOTAL (${watch("Currency")})`,
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
                  setBinLocData(params.row);
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
                  setBinLocData(params.row);
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
            sx={{ width: "100%", height: "100%" }}
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

        if (BaseType === "16") {
          disabled = true;
        }

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

        /* ---------- Display text ---------- */
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
      field: "DiscPrcnt",
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
  const handleOnSerial = (rowData) => {
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
      Direction: rowData.Direction,
      TtlQuantity: rowData.TtlQuantity,
      BsDocType: rowData.BsDocType,
      BsDocEntry: rowData.BsDocEntry,
      BsDocLine: rowData.BsDocLine,
      BinCode: rowData.BinCode,
      id: rowData.id,
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
      BinCode: rowData.BinCode,
      id: rowData.id,
    });
    if (rowData.BaseType > 0) {
      setopenBatchCopyform(true);
    } else {
      setopenBatch(true);
    }
  };

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
              if (params.row.BaseType === "13") return;
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
                disabled={params.row.BaseType === "13"}
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
  const handleFrightClose = () => {
    setFrieghtopen(false);
    setValue("oExpLines", RollBackoExpLines);
  };
  const handleDocRateChange = (e) => {
    let NewRate = parseFloat(e.target.value) || 0;
    if (NewRate < 0) NewRate = 1;
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
          // TotalFrgn = line.TotalFrgn;
          // LineTotal = line.LineTotal;
          // TotalSumSy = line.TotalSumSy;
        }
        //  const taxFright = taxCalculation(
        //   LineTotal,
        //   (updatedData.AssblValue = LineTotal),
        //   line.DocTotal,
        //   (updatedData.PriceBefDi = LineTotal),
        //   (updatedData.Quantity = 1),
        //   line.TaxCode
        // );
        // const oTaxLines = taxFright.oTaxLines;
        // const VatSum = ValueFormatter(taxFright.VatSum);
        // const VatSumSy = ValueFormatter(taxFright.VatSumSy);
        // const VatSumFrgn = ValueFormatter(taxFright.VatSumFrgn);
        // calculateDiscountAmt(discPercent)
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
      setValue("DiscPrcnt", percent.toFixed(3));
      calculateDiscountAmt(percent);
    };
    if (curSource === "C") {
      if (currency === companyData.MainCurncy) {
        applyDiscount(
          "DiscSum",
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
      applyDiscount("DiscSum", parseFloat(getValues("TotalBefDisc")) || 0);
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
    if (discount > 100) discount = 100;
    setValue("DiscPrcnt", discount.toFixed(3));
    const TotalBefDisc = parseFloat(getValues("TotalBefDisc")) || 0;
    const DiscountAmt = (TotalBefDisc * discount) / 100;
    setValue("DiscSum", DiscountAmt.toFixed(2));
    const totalBefDiscSy = parseFloat(getValues("TotalBefDiscSy")) || 0;
    const DiscSumSy = (totalBefDiscSy * discount) / 100;
    setValue("DiscSumSy", DiscSumSy.toFixed(2));
    const DocTotalFC = parseFloat(getValues("TotalBefDiscFrgn")) || 0;
    const DiscSumFC = (DocTotalFC * discount) / 100;
    setValue("DiscSumFC", DiscSumFC.toFixed(2));
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
      setValue("DiscSum", format(dissum));
      setValue("DiscSumSy", format(SumSy));
      setValue("DiscSumFC", format(SumFC));
      setValue("oLines", updatedOLines);
    }
  };

  const handleChange = (e, row) => {
    const { name, value } = e.target;
    setok("UPDATE");
    const quantity = selectedRowsSales.map((item) => item.Quantity);
    const updatedLines = getValues("oLines").map((data, index) => {
      if (row.id !== index) return data;
      const updatedData = { ...data, [name]: value };
      const originalQuantity = quantity[index];
      if (parseFloat(updatedData.BaseType) >= 1) {
        if (
          name === "Quantity" &&
          parseFloat(value) > parseFloat(originalQuantity)
        ) {
          return data;
        }
      }
      if (allFormData.DocEntry) {
        if (name === "Quantity") {
          updatedData.OpenQuantity =
            parseFloat(updatedData.Quantity) -
            parseFloat(data.Quantity) +
            parseFloat(data.OpenQuantity);
        }
      } else {
        if (name === "Quantity") {
          updatedData.OpenQuantity = value;
          updatedData.Quantity = Math.min(Math.max(value, 0));
          updatedData.InvQty = value * updatedData.NumPerMsr;
        }
      }
      if (name === "PriceBefDi") {
        updatedData.PriceBefDi = Math.min(Math.max(value, 0));
        updatedData.Currency = currency;
        const Rate = companyData.MainCurncy === currency ? "1" : DocRate;
        updatedData.Rate = Rate;
      }
      if (name === "DiscPrcnt") {
        updatedData.DiscPrcnt = Math.min(Math.max(value, 0), 100);
      }

      if (updatedData.PostTax === "Y") {
        if (name === "AssblValue") {
          updatedData.AssblValue = Math.min(Math.max(value, 0));
        }
      } else {
        updatedData.AssblValue = data.AssblValue;
      }
      const CalcLines = CalCulation(
        updatedData.Quantity,
        updatedData.PriceBefDi,
        updatedData.DiscPrcnt,
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
            if (type === "S") {
              updatedData.TotalFrgn = ValueFormatter(0);
              updatedData.LineTotal = CalcLines.LineTotal;
              updatedData.TotalSumSy = ValueFormatter(
                updatedData.LineTotal / SysRate,
              );
            } else {
              updatedData.TotalFrgn = ValueFormatter(0);
              updatedData.LineTotal =
                currency === updatedData.Currency
                  ? CalcLines.LineTotal
                  : CalcLines.LineTotal * updatedData.Rate;
              updatedData.TotalSumSy = ValueFormatter(
                updatedData.LineTotal / SysRate,
              );
            }
          } else {
            const TotalFrgn =
              currency === data.Currency
                ? (updatedData.Price * updatedData.Rate) / DocRate
                : (updatedData.Price *
                    updatedData.Quantity *
                    updatedData.Rate) /
                  DocRate;
            updatedData.TotalFrgn =
              currency === data.Currency
                ? ValueFormatter(CalcLines.TotalFrgn)
                : TotalFrgn;
            updatedData.LineTotal = ValueFormatter(
              updatedData.TotalFrgn * DocRate,
            );
            updatedData.TotalSumSy = ValueFormatter(
              updatedData.LineTotal / SysRate,
            );
          }
          break;
        default:
          console.log("ff");
      }

      if (name === "TaxCode") {
        updatedData.TaxCode = "";
        updatedData.VatGroup = "";
      }
      const taxLines = taxCalculation(
        updatedData.LineTotal,
        updatedData.AssblValue,
        row.DocTotal,
        updatedData.PriceBefDi,
        updatedData.Quantity,
        updatedData.TaxCode,
      );
      updatedData.oTaxLines = taxLines.oTaxLines;
      updatedData.VatPrcnt = taxLines.VatPrcnt;
      updatedData.InvQty = updatedData.NumPerMsr * updatedData.Quantity;
      updatedData.OpenInvQty = updatedData.InvQty;
      updatedData.VatSum = taxLines.VatSum;
      updatedData.VatSumSy = taxLines.VatSumSy;
      updatedData.VatSumFrgn = taxLines.VatSumFrgn;
      let PriceAfVAT =
        updatedData.Price + updatedData.Price * (updatedData.VatPrcnt / 100);
      updatedData.PriceAfVAT = ValueFormatter(PriceAfVAT);
      return updatedData;
    });

    reset({
      ...allFormData,
      oLines: updatedLines,
      AssblValue: getValues("AssblValue"),
      NumAtCard: getValues("NumAtCard"),
      Comments: getValues("Comments"),
      DiscSum: getValues("DiscSum"),
      DiscPrcnt: getValues("DiscPrcnt"),
    });
    // recalculateHeaderDiscount();
    calculateDiscountAmt(discPercent);
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
  const processRowUpdate = (newRow, oldRow) => {
    const updatedData = { ...oldRow, ...newRow };
    const originalQuantity = selectedRowsSales[oldRow.id]?.InvQty || 0;

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
      if (totalBatchQty !== updatedData.InvQty) {
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
      if (updatedData.oSerialLines.length !== updatedData.InvQty) {
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

    if (newRow.DiscPrcnt !== undefined) {
      updatedData.DiscPrcnt = Math.min(Math.max(newRow.DiscPrcnt, 0), 100);
    }

    if (updatedData.GSTRelevnt === "Y" && newRow.AssblValue !== undefined) {
      updatedData.AssblValue = Math.min(Math.max(newRow.AssblValue, 0));
    }

    const CalcLines = CalCulation(
      updatedData.Quantity,
      updatedData.PriceBefDi,
      updatedData.DiscPrcnt,
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

  useEffect(() => {
    setValue("TotalBefDisc", ValueFormatter(TotalBefDisc));
    setValue("TotalBefDiscSy", ValueFormatter(totalBefDiscSy));
    setValue("TotalBefDiscFrgn", ValueFormatter(totalBefDiscFrgn));
    console.log("dfdsf", TotalVatSumSy);
    const DiscPrcnt = getValues("DiscPrcnt");
    calculateDiscountAmt(DiscPrcnt);
  }, [
    calculateDiscountAmt,
    TotalBefDisc,
    totalBefDiscSy,
    GroupNum,
    totalBefDiscFrgn,
    setValue,
  ]);

  //! Local Currency Calculation
  const LineVatSum = oLines.reduce((sum, current) => {
    const vat = parseFloat(current?.VatSum) || 0; // Handle NaN, null, undefined
    return sum + vat;
  }, 0);

  let TaxOnExp = parseFloat(getValues("TaxOnExp") || 0);
  const Vat = parseFloat(getValues("DpmVat") || 0);
  const VatSum = LineVatSum + TaxOnExp - Vat;
  setValue("VatSum", ValueFormatter(VatSum));
  let TotalExpns = parseFloat(getValues("TotalExpns") || "0.000");
  const DiscSum = parseFloat(getValues("DiscSum")) || 0;
  const DpmAmnt = parseFloat(getValues("DpmAmnt") || 0);
  const DocTotal =
    TotalBefDisc -
    DpmAmnt -
    DiscSum +
    TotalExpns +
    VatSum +
    parseFloat(RoundDif || 0);
  setValue("DocTotal", ValueFormatter(DocTotal));
  const PaidToDate = parseFloat(getValues("PaidToDate")) || 0;
  const DueAmnt = DocTotal - PaidToDate;
  setValue("DueAmnt", ValueFormatter(DueAmnt));
  //! System Currency Calculation
  const LineVatSumSys = oLines.reduce((sum, current) => {
    const vat = parseFloat(current?.VatSumSy) || 0; // Handle NaN, null, undefined
    return sum + vat;
  }, 0);
  let TaxOnExpSc = parseFloat(getValues("TaxOnExpSc") || 0.0);
  const VatSc = parseFloat(getValues("DpmVatSc") || 0);
  const VatSumSy = LineVatSumSys + TaxOnExpSc - VatSc;
  setValue("VatSumSy", ValueFormatter(VatSumSy));
  let TotalExpSC = parseFloat(getValues("TotalExpSC") || "0.000");
  const DiscSumSy = parseFloat(getValues("DiscSumSy")) || 0;
  const DpmAmntSC = parseFloat(getValues("DpmAmntSC") || 0);
  const DocTotalSy =
    totalBefDiscSy -
    DpmAmntSC -
    DiscSumSy +
    TotalExpSC +
    VatSumSy +
    parseFloat(RoundDif || 0);
  setValue("DocTotalSy", ValueFormatter(DocTotalSy));
  const PaidSys = parseFloat(getValues("PaidSys")) || 0;
  const DueAmntSc = DocTotalSy - PaidSys;
  setValue("DueAmntSc", ValueFormatter(DueAmntSc));
  //! Friegn Currency Calculation
  const LineVatSumFc = oLines.reduce((sum, current) => {
    const vat = parseFloat(current?.VatSumFrgn) || 0; // Handle NaN, null, undefined
    return sum + vat;
  }, 0);
  let TaxOnExpFc = parseFloat(getValues("TaxOnExpFc") || 0.0);
  const VatFc = parseFloat(getValues("DpmVatFc") || 0);
  const VatSumFC = LineVatSumFc + TaxOnExpFc - VatFc;
  setValue("VatSumFC", ValueFormatter(VatSumFC));
  const DiscSumFC = parseFloat(getValues("DiscSumFC")) || 0;
  let TotalExpFC = parseFloat(getValues("TotalExpFC")) || 0;
  const DpmAmntFC = parseFloat(getValues("DpmAmntFC") || 0);
  const DocTotalFC =
    totalBefDiscFrgn -
    DpmAmntFC -
    DiscSumFC +
    TotalExpFC +
    VatSumFC +
    parseFloat(RoundDif || 0);
  setValue("DocTotalFC", ValueFormatter(DocTotalFC));
  const PaidFC = parseFloat(getValues("PaidFC")) || 0;
  const DueAmntFC = DocTotalFC - PaidFC;
  setValue("DueAmntFC", ValueFormatter(DueAmntFC));

  // ===========Header Calculation=============
  //* =============Open Tab List Api Binding=============
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/ARCreditmemoV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/ARCreditmemoV2/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);
      if (response.data.success) {
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
    fetchCancelledListData(0);
  }, []);
  const { isDirty } = useFormState({ control });

  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    setapiloading(true);
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
        setSelectData(DocEntry);
        setSaveUpdateName("UPDATE");
      }
    } catch (error) {
      console.error("Error in setOldOpenData:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while setting business partner data.",
        icon: "error",
        confirmButtonText: "OK",
      }).finally(() => {
        setapiloading(false);
        console.log("false");
      });
    }
  };

  const fetchAndSetData = (DocEntry) => {
    apiClient
      .get(`/ARCreditmemoV2/${DocEntry}`)
      .then((response) => {
        if (!response.data || !response.data.values) {
          console.error("API Response missing `values` key:", response.data);
          return;
        }
        const item = response.data.values;
        const getLocationName = (locCode) => {
          const location = warehouseData.find((w) => w.Location === locCode);
          return location ? location.LocationName : locCode;
        };
        setType(item.DocType);

        reset({
          ...item,
          ModifiedBy: item.UserName,
          CardCode: item.CardCode,
          CardName: item.CardName,
          CntctCode: item.CntctCode,
          ShipToCode: item.ShipToCode,
          PayToCode: item.PayToCode,
          Address: item.Address,
          DfltAddress: item.Address2,
          NumAtCard: item.NumAtCard,
          DocNum: item.DocNum,
          CurSource: item.CurSource,
          DocDate: dayjs(item.DocDate).format("YYYY-MM-DD"),
          DocDueDate: dayjs(item.DocDueDate).format("YYYY-MM-DD"),
          TaxDate: dayjs(item.TaxDate).format("YYYY-MM-DD"),
          Status: getStatus(item.Status),
          totalbef: item.TotalBefDisc,
          TotalExpns: item.TotalExpns,
          Series: item.Series,
          VatSum: item.VatSum,
          DiscPrcnt: item.DiscPrcnt,
          DiscSum: item.DiscSum,
          RoundDif: item.RoundDif,
          SlpCode: item.SlpCode,
          TrnspCode: item.TrnspCode,
          Currency: item.DocCur,
          Notify: item.Notify,
          DocType: item.DocType,
          Comments: item.Comments,
          DocEntry: item.DocEntry,
          DocTotal: item.DocTotal,
          TaxOnExp: item.TaxOnExp,
          oLines: item.oLines.map((element, index) => ({
            ...element,
            UserId: user.UserId,
            BaseType: element.BaseType || "-1",
            BaseEntry: element.BaseEntry || "-1",
            BaseLine: element.BaseLine || "-1",
            DocEntry: element.DocEntry,
            Status: element.Status,
            ItemCode: element.ItemCode,
            ServCode: element.ServCode,
            ChapterID: element.ChapterID,
            ItemName: element.ItemName,
            Quantity: element.Quantity,
            Price: element.Price,
            UomEntry2: element.UomEntry2 || "",
            PriceBefDi: element.PriceBefDi,
            WHSCode: element.WHSCode,
            UomCode: element.UomCode,
            AssblValue: String(element.AssblValue),
            DiscPrcnt: element.DiscPrcnt,
            TaxCode: element.TaxCode,
            OnHand: element.OnHand,
            OpenQuantity: element.OpenQuantity,
            VatSum: element.VatSum,
            IsCommited: element.IsCommited,
            // OnOrder: element.OnOrder,
            LineNum: element.LineNum || "-1",
            LineTotal: element.LineTotal,
            OnOrder: element.OnOrder || 0,
            AcctCode: String(element.AcctCode || 0),
            ExpnsName: element.ExpnsName,
            TotalExpns: element.TotalExpns,
            LocCode: getLocationName(element.LocCode),
            PostTax: String(element.PostTax),
            VatGroup: element.VatGroup || "",
            oTaxLines: element.oTaxLines.map((taxItem) => ({
              ...taxItem,
              UserId: user.UserId,
              CreatedBy: user.UserName,
              TaxRate: String(taxItem.TaxRate),
              TaxSum: String(taxItem.TaxSum),
              StcCode: String(taxItem.StcCode),
              BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
              RelateType: "1",
              RelateEntry: taxItem.RelateEntry,
              GroupNum: taxItem.GroupNum || "1",
              ExpnsCode: taxItem.ExpnsCode || " ",
              StaCode: taxItem.StaCode || "",
              staType: taxItem.staType || "1",
              TaxAcct: taxItem.TaxAcct || " ",
              TaxSumFrgn: taxItem.TaxSumFrgn || " ",
              TaxSumSys: taxItem.TaxSumSys || " ",
              BaseSumFrg: taxItem.BaseSumFrg || " ",
              BaseSumSys: taxItem.BaseSumSys || "0",
              VatApplied: taxItem.VatApplied || "0",
              VatAppldFC: taxItem.VatAppldFC || "0",
              VatAppldSC: taxItem.VatAppldSC || "0",
              LineSeq: taxItem.LineSeq || "1",
              DeferrAcct: taxItem.DeferrAcct || " ",
              BaseType: taxItem.BaseType || "1",
              BaseAbs: taxItem.BaseAbs || "1",
              BaseSeq: taxItem.BaseSeq || "1",
              DeductTax: taxItem.DeductTax || "0",
              DdctTaxFrg: taxItem.DdctTaxFrg || "0",
              DdctTaxSys: taxItem.DdctTaxSys || "0",
            })),
          })),
          oExpLines: item.oExpLines.map((element, index) => ({
            ...element,

            Status: element.Status,
            DocEntry: element.ExpnsCode,
            ExpnsName: String(element.ExpnsCode || ""),
            ModifiedBy: element.UserName,
            LineTotal: element.LineTotal,
            GrsAmount: element.GrsAmount,
            TaxCode: String(element.TaxCode || "0"),
            VatSum: element.VatSum,
            oTaxLines: element.oTaxLines.map((taxItem) => ({
              ...taxItem,
              UserId: user.UserId,
              CreatedBy: user.UserName,
              TaxRate: String(taxItem.TaxRate),
              TaxSum: String(taxItem.TaxSum),
              StcCode: String(taxItem.StcCode),
              BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
              RelateType: "2",
              RelateEntry: taxItem.RelateEntry,
              GroupNum: taxItem.GroupNum || "1",
              ExpnsCode: taxItem.ExpnsCode || " ",
              StaCode: taxItem.StaCode || " ",
              staType: taxItem.staType || "1",
              TaxAcct: taxItem.TaxAcct || " ",
              TaxSumFrgn: taxItem.TaxSumFrgn || " ",
              TaxSumSys: taxItem.TaxSumSys || " ",
              BaseSumFrg: taxItem.BaseSumFrg || " ",
              BaseSumSys: taxItem.BaseSumSys || "0",
              VatApplied: taxItem.VatApplied || "0",
              VatAppldFC: taxItem.VatAppldFC || "0",
              VatAppldSC: taxItem.VatAppldSC || "0",
              PaidSys: taxItem.PaidSys || "0",
              LineVatF: taxItem.LineVatF || "0",
              LineSeq: taxItem.LineSeq || "1",
              DeferrAcct: taxItem.DeferrAcct || " ",
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
        setRollBackoExpLines(item.oExpLines);
        setValue("BlockB", item.oTaxExtLines[0].BlockB);
        setValue("StreetB", item.oTaxExtLines[0].StreetB);
        setValue("CityB", item.oTaxExtLines[0].CityB);
        setValue("StateB", item.oTaxExtLines[0].StateB);
        setValue("CountryB", item.oTaxExtLines[0].CountryB);
        setValue("ZipcodeB", item.oTaxExtLines[0].ZipCodeB);
        setValue("BlockS", item.oTaxExtLines[0].BlockS);
        setValue("StreetS", item.oTaxExtLines[0].StreetS);
        setValue("CityS", item.oTaxExtLines[0].CityS);
        setValue("StateS", item.oTaxExtLines[0].StateS);
        setValue("CountryS", item.oTaxExtLines[0].CountryS);
        setValue("ZipcodeS", item.oTaxExtLines[0].ZipCodeS);
        setSelectData(DocEntry);
        setDocEntry(DocEntry);
        if (item.AttcEntry > 0) {
          setFilesFromApi(item.AttcEntry);
        }
      })
      .catch((error) => {
        console.error("Error fetching or processing data:", error);
      })
      .finally(() => {
        setapiloading(false);
        console.log("false");
      });
  };

  const isFieldDisabled =
    allFormData.DocEntry ||
    allFormData.Status === "Closed" ||
    allFormData.Status === "Cancelled";
  //* ============================================Closed List Start ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/ARCreditmemoV2/Search/${searchTerm}/0/${pageNum}/20`
        : `/ARCreditmemoV2/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreClosed(newData.length === 20);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          title: "Info",
          text: response.data.message,
          icon: "info",
          toast: true,
          confirmButtonText: "Ok",
          // timer:1500,
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
    }, 600); // Fetch with search query
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
  const handleClickCancel = (event) => {
    setAnchorEl(event.currentTarget);
  };
  // ============================================Get List ==================================================================
  const fetchGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BPV2/V2/ByCardType/Search/${searchTerm}/C/1/${pageNum}/20`
        : `/BPV2/V2/ByCardType/Pages/C/1/${pageNum}/20`;

      const response = await apiClient.get(url);
      console.log("BPV2", response);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          title: "Info",
          text: response.data.message,
          icon: "info",
          toast: true,
          confirmButtonText: "Ok",
          // timer:1500,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle search input
  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]); // Clear current data

    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchGetListData(0, res);
    }, 600); // Fetch with search query
  };

  // Clear search
  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0); // Reset page to 0
    setGetListData([]); // Clear current data
    fetchGetListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };

  // Initial fetch
  useEffect(() => {
       if(searchmodelOpen===true){
    fetchGetListData(0); 
     }
  }, [searchmodelOpen]);

  //! =================CANCEL LIST================================

  const fetchCancelledListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/ARCreditmemoV2/Search/${searchTerm}/3/${pageNum}/20`
        : `/ARCreditmemoV2/Pages/3/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreCancelled(newData.length === 20);
        setCancelledListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          title: "Info",
          text: response.data.message,
          icon: "info",
          toast: true,
          confirmButtonText: "Ok",
          // timer:1500,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle search input
  const handleCancelledListSearch = (query) => {
    setCancelledListQuery(query);
    setCancelListSearching(true);
    setCancelListPage(0);
    setCancelledListData([]); // Clear current data
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchCancelledListData(0, query);
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
  // ========DOC CANCEL LOGIC ON QTY=========================
  let Quantity = allFormData.oLines.reduce((sum, current) => {
    const Quantity = parseFloat(current?.Quantity) || 0; // Handle NaN, null, undefined
    return sum + Quantity;
  }, 0);
  let OpenQuantity = allFormData.oLines.reduce((sum, current) => {
    const OpenQuantity = parseFloat(current?.OpenQuantity) || 0; // Handle NaN, null, undefined
    return sum + OpenQuantity;
  }, 0);

  // let BaseType = allFormData.oLines.some((base) => base.BaseType === "14");

  // ===============================

  const onSelectBusinessPartner = async (DocEntry) => {
    const { data: dataBP } = await apiClient.get(`/BPV2/V2/${DocEntry}`);
    const { values } = dataBP;

    setBusinessPartnerData(values);
    SearchModelClose();

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
      .filter((v) => v?.trim())
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
      .filter((v) => v?.trim())
      .join(", ");

    setValue("Address", DfltBillToAddress || "");
    setValue("BlockB", selectedBillToAddress.Address1);
    setValue("StreetB", selectedBillToAddress.Address2);
    setValue("CityB", selectedBillToAddress.City);
    setValue("StateB", selectedBillToAddress.State);
    setValue("CountryB", selectedBillToAddress.Country);
    setValue("ZipcodeB", selectedBillToAddress.Zipcode);
    setValue("CtlAccount", values?.DebPayAcct ?? "");
    setValue("CardCode", values.CardCode);
    setValue("CardName", values.CardName);
    setValue("CntctCode", values.CntctPrsn || "");
    setValue("ShipToCode", values.DfltShiped || "");
    setValue("PayToCode", values.DfltBilled || "");
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
    setValue("PayDuMonth", PaymentValuesSet[0]?.PayDuMonth ?? "N");
    setValue("ListNum", PaymentValuesSet[0]?.ListNum ?? "0");
    setValue("ExtraMonth", PaymentValuesSet[0]?.ExtraMonth ?? 0);
    setValue("ExtraDays", PaymentValuesSet[0]?.ExtraDays ?? 0);
    setValue("TolDays", PaymentValuesSet[0]?.TolDays ?? 0);
    setValue(
      "BslineDate",
      PaymentValuesSet[0]?.BslineDate ?? dayjs(undefined).format("YYYY-MM-DD"),
    );
    const newData = allFormData.oTaxExtLines.map((item) => ({
      ...item,
      BlockB: selectedBillToAddress.Address1 ?? "",
      StreetB: selectedBillToAddress.Address2 ?? "",
      CityB: selectedBillToAddress.City ?? "",
      StateB: selectedBillToAddress.State ?? "",
      CountryB: selectedBillToAddress.Country ?? "",
      ZipCodeB: selectedBillToAddress.Zipcode ?? "",

      BlockS: selectedAddress.Address1 ?? "",
      StreetS: selectedAddress.Address2 ?? "",
      CityS: selectedAddress.City ?? "",
      StateS: selectedAddress.State ?? "",
      CountryS: selectedAddress.Country ?? "",
      ZipCodeS: selectedAddress.Zipcode ?? "",
    }));
    setValue("oTaxExtLines", newData);

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

  //#region Get Api for Copy From Button
  // const fetchPOData = async (pageNum = 0, searchTerm = "", DocType) => {
  //   const CardCode = getValues("CardCode");
  //   const baseType = watch("baseType") || "16";

  //   if (!DocType || !baseType) return;

  //   try {
  //     const url = searchTerm
  //       ? `/ARCreditmemoV2/CopyFrom/Search/${searchTerm}/${CardCode}/${type}/${baseType}/${pageNum}/20`
  //       : `/ARCreditmemoV2/CopyFrom/${CardCode}/${type}/${baseType}/${pageNum}/20`;
  //     const response = await apiClient.get(url);
  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       setHasMorePOList(newData.length === 20);
  //       setGetListPOData((prev) =>
  //         pageNum === 0 ? newData : [...prev, ...newData],
  //       );
  //     } else {
  //       Swal.fire({
  //         title: "Info",
  //         text: response.data.message,
  //         icon: "info",
  //         toast: true,
  //         // confirmButtonText: "Ok",
  //         timer: 1500,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // const handleGetListSearchCopyFrom = (resp) => {
  //   setGetLIstQueryCopyFrom(resp);
  //   setGetListSearchingCopyFrom(true);
  //   setGetListPageCopyFrom(0);
  //   setGetListPOData([]);

  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }

  //   timeoutRef.current = setTimeout(() => {
  //     fetchPOData(0, resp, type);
  //   }, 600);
  // };

  // const handleGetListClearCopyFrom = () => {
  //   setGetLIstQueryCopyFrom("");
  //   setGetListSearchingCopyFrom(true);
  //   setGetListPageCopyFrom(0);
  //   setGetListPOData([]);
  //   fetchPOData(0, "", type);
  // };

  // const fetchMoreGetListCopyFrom = () => {
  //   fetchPOData(
  //     getListPageCopyFrom + 1,
  //     getListSearchingCopyFrom ? getListqueryCopyFrom : "",
  //     type,
  //   );
  //   setGetListPageCopyFrom((prev) => prev + 1);
  // };

  // ------------Get API RowLevel And Drop Down Fields------------------------------
 
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
    BasePoint:"/ARCreditmemoV2",
    open: openDialog,
    CardCode,
    baseType,
    type,
  });

 
  const { DocSeries } = useDocumentSeries(
    "14",
    docDate,
    setValue,
    clearCache,
    SaveUpdateName,
  );

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
  } = useItemServiceList({ SellItem: "Y" }, type, open, serviceopen);

  const fetchChartAccount = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;
      // Use cache if exists
      if (AccountCache[cacheKey]) {
        setChartOfAccountList(AccountCache[cacheKey]);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await apiClient.get(`/ChartOfAccounts`, {
          params: {
            Status: 1,
            LocManTran: "Y",
            GroupMask: "1,2",
            SearchText: search,
            Page: page,
            Limit: LIMIT,
            Postable: "Y",
          },
        });

        if (data.success) {
          const items = data.values || [];
          setAccountCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));
          setChartOfAccountList(items);
          const estimatedRowCount =
            page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;
          setRowChartAccCount(estimatedRowCount);
        } else {
          Swal.fire("Error!", data.message, "warning");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [AccountCache],
  );
  useEffect(() => {
    fetchChartAccount(ChartAcccurrentPage, searchTextChartAcc);
  }, [ChartAcccurrentPage, searchTextChartAcc, fetchChartAccount]);

  const handleAccountPagi = useCallback(
    ({ page }) => {
      if (page !== ChartAcccurrentPage) {
        setAccCurrentPage(page);
      }
    },
    [ChartAcccurrentPage],
  );

  const handleSearchAccount = useCallback((search) => {
    setChartOfAccSearchText(search);
    setAccCurrentPage(0); // Reset to page 0 on search
    setAccountCache({}); // Clear cache on new search
  }, []);

  const handleClickAccount = (id) => {
    setValue("CtlAccount", id.row.AcctCode);
    dispatch({ type: "CLOSE", modal: "CharOfAccOpen" });
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

  const ShippingTypeData = async () => {
    try {
      const res = await apiClient.get(`/ShippingType/Pages/1`);
      const response = res.data;

      if (response.success === true) {
        setShippingType(response.values);

        setValue("TrnspCode", response.ShipType || "");
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

  const handleSelectTax = (id) => {
    console.log("TaxCode:", id.row.TaxCode);
    console.log("DocEntry:", id.row.DocEntry);
    setok("UPDATE");

    const currentRowIndex = getValues("selectedRowIndex");
    const lines = getValues("oLines");
    const updatedLines = lines.map((line, index) => {
      if (index !== currentRowIndex) return line;
      // Create a new updated object with selected TaxCode
      if (type === "I") {
        const valid = validateTaxSelection({
          line,
          index,
          lines,
          selectedTax: id.row,
          selectedOlineTax: id.row.oLines,
          warehouseData,
          oTaxExtLines: getValues("oTaxExtLines"),
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

    // TaxCloseModel(false);
  };

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

  const OumCodeListData = async (DocEntry) => {
    try {
      const res = await apiClient.get(`/UGP/${DocEntry}`);
      console.log(res);
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
      } else {
        Swal.fire({
          title: "Info",
          text: response.data.message,
          icon: "info",
          toast: true,
          // confirmButtonText: "Ok",
          timer: 1500,
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
        setPaymentTermData([]);
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
    TaxCodeFrieght();
    taxCodedata();
    PaymentTermApi();
    CurrencyData();
    salesEmpdata();
    freightdata();
    ShippingTypeData();
  }, []);

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
    setValue("TolDays", PaymentValuesSet[0].TolDays);
    setValue("BslineDate", PaymentValuesSet[0].BslineDate);
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
          item.Discount,
          rate,
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
      calculateDiscountAmt(discPercent);
    }
  };
  const calculateDueDateSimplified = useCallback(() => {
    const selected = getValues("PayDuMonth");
    const month = getValues("ExtraMonth") || 0;
    const days = getValues("ExtraDays") || 0;
    const TolDays = getValues("TolDays") || 0;
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

        Due = baseDate.add(TotalDays, "day");
        // Add total days (days - tolerance)
        break;
      case "H": // Half Month Logic
        const docDay = docDayjs.date();
        let halfBaseDate;

        if (docDay <= 15) {
          halfBaseDate = docDayjs.date(15);
        } else {
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
        let monthStartBase = docDayjs.add(1, "month").startOf("month");

        if (month > 0) {
          monthStartBase = monthStartBase.add(month, "month");
        }
        Due = monthStartBase.add(TotalDays, "day");
        break;

      case "N": // Empty/Simple Logic
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
  // ------------------------------------------------------------------------------------------------------------------------
  const onClickCopyFrom = useCallback((e, item, index, DocNum) => {
    // console.log("onClickCopyFrom Item Data", item);
    var checked = e.target.checked;
    // console.log("1111", checked);

    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [DocNum]: checked, // Use index to track individual checkbox states
    }));

    if (checked) {
      setoExpLines((prev) => {
        const newOlines = [...prev, ...item.oExpLines];

        // Removing duplicates based on a unique property (e.g., id)
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
            BaseDocNum: item.DocNum,
            HerDiscount: item.DiscPrcnt,
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

  const checkCopyLineZeroRate = (records, docDate, currencyList) => {
    const sysCurr = companyData.SysCurrncy;
    const mainCurr = companyData.MainCurncy;
    const headerCurr = CopyformData?.DocCur;
    let missingRates = [];
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
  const handleOpenSales = (newrecod, newDataRate) => {
    setOpenSales(true);
    setValue("oExpLines", []);
    setValue("oLines", []);
    setValue("Discount", "");
    setValue("DiscountAmt", "");
    const formattedDate = dayjs(docDate).format("YYYY-MM-DD");
    const records = "NEW" === newrecod ? newDataRate : data[docDate] || [];
    const result = checkCopyLineZeroRate(records, formattedDate, OlinesData);
    if (!result) return;
    const uniqueBaseNums = new Set(OlinesData.map((i) => i.BaseDocNum)).size;
    const latestDocRate = parseFloat(getValues("DocRate"));
    const sysRate = parseFloat(getValues("SysRate"));
    const updatedData = result.map((item) => {
      const LineTotal = item.Price * item.Quantity * item.Rate;
      const TotalFrgn = LineTotal / latestDocRate;

      if (uniqueBaseNums > 1) {
        const headerDisc = 1 - item.HerDiscount / 100;
        const lineDisc = 1 - item.DiscPrcnt / 100;
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
    setCopyFromModelSales(updatedData);
    setOpenSales(true);
  };

  const handleCloseSales = useCallback((e) => {
    setOpenSales(false);
    setCopyFromModelSales([]);
  }, []);

  const onSubmitCopyFromModal = (data) => {
    const DocumentBaseCopyForm = [
      ...new Set(selectedRowsSales.map((item) => item.ItemCode)),
    ].length;
    if (DocumentBaseCopyForm === 0) {
      Swal.fire({
        text: "No document selected.",
        icon: "warning",
        confirmButtonText: "OK",
        toast: false,
        willOpen: () => {
          document.querySelector(".swal2-container").style.zIndex = "9999";
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("Continuing without selection...");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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
      };
    });
    let dissum = parseFloat();
    setRollBackoExpLines(updatedOExpLineData);
    setValue("DiscSum", dissum.toFixed(3));
    let UpdatedOlines = [];
    const uniqueBaseNums = [
      ...new Set(OlinesData.map((item) => item.BaseDocNum)),
    ].length;
    selectedRowsSales.forEach((item) => {
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
          VatSum: ValueFormatter(headerDisc.VatSum),
          VatSumSy: headerDisc.VatSumSy,
          VatSumFrgn: headerDisc.VatSumFrgn,
          LocCode: match?.LocationName || "",
          BinCode: match?.BinCode ?? "",
          DftBinAbs: match?.DftBinAbs,
          BinActivat: match?.BinActivat,
          Bin: item.Quantity,
          OpenQuantity: item.Quantity,
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
          oTaxLines: headerDisc.oTaxLines,
          VatSum: ValueFormatter(headerDisc.VatSum),
          VatSumSy: headerDisc.VatSumSy,
          VatSumFrgn: headerDisc.VatSumFrgn,
          LocationName: match?.LocationName || "", // <- Get from matched object safely
          LocCode: match?.LocationName || "",
          BinCode: match?.BinCode ?? "",
          DftBinAbs: match?.DftBinAbs,
          BinActivat: match?.BinActivat,
          Bin: item.Quantity,
          OpenQuantity: item.Quantity,
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
        setValue("DiscPrcnt", LineDiscount);
        calculateDiscountAmt(LineDiscount);
        setValue("DocType", CopyformData?.DocType ?? "");
        setValue("PayToCode", CopyformData?.PayToCode ?? "");
        setValue("TrnspCode", CopyformData?.TrnspCode ?? "");
        setValue("ShipToCode", CopyformData?.ShipToCode ?? "");
        setValue("Comments", CopyformData?.Comments ?? "");
        setValue("RoundDif", CopyformData?.RoundDif ?? "");
        setValue("DfltAddress", CopyformData?.Address2 ?? "");
        setValue("Address", CopyformData?.Address ?? "");
        setValue("Currency", CopyformData?.DocCur ?? "");
        setValue("SlpCode", CopyformData?.SlpCode ?? "");

        setValue("BlockB", CopyformData.oTaxExtLines[0]?.BlockB ?? "");
        setValue("StreetB", CopyformData.oTaxExtLines[0]?.StreetB ?? "");
        setValue("CityB", CopyformData.oTaxExtLines[0]?.CityB ?? "");
        setValue("StateB", CopyformData.oTaxExtLines[0]?.StateB ?? "");
        setValue("CountryB", CopyformData.oTaxExtLines[0]?.CountryB ?? "");
        setValue("ZipcodeB", CopyformData.oTaxExtLines[0]?.ZipCodeB ?? "");
        setValue("BlockS", CopyformData.oTaxExtLines[0]?.BlockS ?? "");
        setValue("StreetS", CopyformData.oTaxExtLines[0]?.StreetS ?? "");
        setValue("CityS", CopyformData.oTaxExtLines[0]?.CityS ?? "");
        setValue("StateS", CopyformData.oTaxExtLines[0]?.StateS ?? "");
        setValue("CountryS", CopyformData.oTaxExtLines[0]?.CountryS ?? "");
        setValue("ZipcodeS", CopyformData.oTaxExtLines[0]?.ZipCodeS ?? "");
      }
      setValue("DocType", CopyformData.DocType);
      setType(CopyformData.DocType);
      calculateExpenseTotals(updatedOExpLineData, setValue);
      handleCloseDialog();
      handleCloseSales();
      setOlines([]);
      setCheckedItems({});
    });
  };

  const handleCellClickSalesSelected = (id) => {
    // Ensure `id.value` is a boolean value
    const checked = id.value;
    console.log(checked);

    if (checked === false) {
      let selectrows = id.row;

      console.log("hello", selectrows);

      // Ensure selectrows is an array. If it's not, wrap it in an array
      if (!Array.isArray(selectrows)) {
        selectrows = [selectrows]; // Wrap it in an array if it's not already
      }

      setallData((prevOlines) => {
        // Create a new array to avoid mutation
        const newOlines = [...prevOlines, ...selectrows];

        // Remove duplicates using Set
        const uniqueOlines = Array.from(new Set(newOlines));

        console.log("Updated Olines:", uniqueOlines);
        setselectedRowsSales(uniqueOlines);
        // Return the new state with unique items
        return uniqueOlines;
      });
    }
    // setselectedRowsSales(allData);
    else if (checked === true) {
      setselectedRowsSales([]);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // setCheckedItems({});
    // setGetListPOData([]); // Clear previous data
    // // setSelectedSeries();
    // setCopyFromModelSales([]);
    // setOlines([]);
  };

  const handleMenuItemClick = (item) => {
    // handleCloseMenu(); // Close dropdown
    setOpenDialog(true); // Open modal
  };

  const isRowSelectable = (params) => {
    const olines = getValues("oLines");
    return !olines.some((obj) => obj.LineNum === params.row.LineNum);
  };

  const handleSelectionChange = (selectedIDs) => {
    // console.log("Selected IDs:", selectedIDs);
    const selectedRows = copyFromModelSales.filter((row) =>
      selectedIDs.includes(row.LineNum),
    );

    // console.log("Selected Rows:", selectedRows);
    setselectedRowsSales(selectedRows);
    setallData(selectedRows);
  };
  // ------------------------------------------------------------------------------------------------------------------------
  // ===================PUsh Serial &  Batch start=====================
  const onsubmitSeriel = (data) => {
    const UpdatedoSerialLines = oLines.map((item, index) => {
      if (data.Ids === index) {
        return {
          ...item,
          oSerialLines: data?.serials ?? [],
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
    setValue("oLines", UpdatedoBatchLines);
  };
  // ===================PUsh Serial &  Batch end=====================
  // -------------------------------------------------------------------------------------------------------
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
  //#region Post Api
  const handleSubmitForm = async (data) => {
    const isValid = ValidationSubmitForm(data, type, warehouseData, getValues);
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
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      DocDueDate: dayjs(data.DocDueDate).format("YYYY-MM-DD"),
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
      Status: data.Status ? "1" : "0",
      CardCode: data.CardCode,
      CardName: data.CardName,
      CntctCode: data.CntctCode || "0",
      NumAtCard: data.NumAtCard || "",
      CurSource: data.CurSource,
      DocCur: data.Currency,
      Currency: data.Currency,
      DocRate: String(data.DocRate || "1"),
      DocType: type,
      Address: String(data.Address || "0"),
      Address2: String(data.DfltAddress || ""),
      PayToCode: String(data.PayToCode || ""),
      ShipToCode: String(data.ShipToCode || ""),
      PaidToDate: String(data.PaidToDate || "0"),
      TrnspCode: data.TrnspCode || "0",
      AttcEntry: attachmentDocEntry,
      TotalBefDiscSy: data.TotalBefDiscSy || "0",
      TotalBefDiscFrgn:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.TotalBefDiscFrgn,
      DocTotalFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.DocTotalFC,
      TaxOnExp: String(data.TaxOnExp || "0"),
      VatSumFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.VatSumFC || "0",
      DiscSumFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.DiscSumFC || "0",

      TaxOnExpFc:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : String(data.TaxOnExpFc || "0"),

      TotalBefDisc: data.TotalBefDisc || "0",
      Discount: String(data.Discount || "0"),
      DiscountAmt: String(data.DiscountAmt || "0"),
      DiscSum: String(data.DiscSum || "0"),
      RoundDif: data.RoundDif || "0",
      VatSum: String(data.VatSum || "0"),
      SlpCode: String(data.SlpCode || "0"),
      Comments: data.Comments || "",
      TotalExpns: data.TotalExpns || "0",
      DocTotal: data.DocTotal || "0",
      Series: String(data.Series || "0"),
      DpmVat: data.DpmVat || "0",
      PaidFC: data.PaidFC || "0",
      Serial: data.Serial || "0",
      DpmAppl: data.DpmAppl || "0",
      PaidDpm: data.PaidDpm || "0",
      PaidSum: data.PaidSum || "0",
      SysRate: String(data.SysRate || "1"),
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
      PaidDpmF: data.PaidDpmF || "0",
      PaidDpmS: data.PaidDpmS || "0",
      VatSumSy: data.VatSumSy || "0",
      BnkBranch: data.BnkBranch || "0",
      DiscSumSy: data.DiscSumSy || "0",
      DpmAmntFC: data.DpmAmntFC || "0",
      DpmAmntSC: data.DpmAmntSC || "0",
      DpmApplFc: data.DpmApplFc || "0",
      DpmApplSc: data.DpmApplSc || "0",
      DpmAppVat: data.DpmAppVat || "0",
      DpmStatus: data.DpmStatus || "0",
      ExtraDays: data.ExtraDays || "0",
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
      ExtraMonth: data.ExtraMonth || "0",
      GrosProfFC: data.GrosProfFC || "0",
      GrosProfit: data.GrosProfit || "0",
      PayDuMonth: "0" || "",
      ReceiptNum: data.ReceiptNum || "0",
      RoundDifFC: data.RoundDifFC || "0",
      RoundDifSy: data.RoundDifSy || "0",
      TaxOnExApF: data.TaxOnExApF || "0",
      TaxOnExApS: data.TaxOnExApS || "0",
      TaxOnExpSc: data.TaxOnExpSc || "0",
      TotalExpFC: data.TotalExpFC || "0",
      TotalExpSC: data.TotalExpSC || "0",
      VatPaidSys: data.VatPaidSys || "0",
      DocNum: String(data.DocNum),
      DpmAmnt: data.DpmAmnt || "0",
      DueAmnt: data.DueAmnt || "0",
      PaidSys: data.PaidSys || "0",
      DocTotalSy: data.DocTotalSy || "0",
      GSTTranTyp: data.GSTTranTyp || "0",
      ExpAppl: data.ExpAppl || "0",
      PaidAmnt: data.PaidAmnt || "0",
      DiscPrcnt: data.DiscPrcnt || "0",
      ExpApplFC: data.ExpApplFC || "0",
      ExpApplSC: data.ExpApplSC || "0",
      GrosProfSy: data.GrosProfSy || "0",
      VatPercent: data.VatPercent || "0",
      Volume: data.Volume || "0",
      Weight: data.Weight || "0",
      VolUnit: data.VolUnit || "0",
      Rounding: data.Rounding || "0",
      DunnLevel: data.DunnLevel || "0",
      CtlAccount: data.CtlAccount || "0",
      WeightUnit: data.WeightUnit || "0",
      CdcOffset: data.CdcOffset,
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oLines: data.oLines.map((item) => {
        const matchwhsLoc = warehouseData.find(
          (LC) => LC.LocationName === item.LocCode,
        );

        return {
          UserId: user.UserId,
          CreatedBy: user.UserName,
          Status: item.Status || "1",
          ItemCode: String(item.ItemCode || "0"), //type==="I" ? "": item.ServCode,
          ItemName: item.ItemName,
          Quantity: String(item.Quantity || 1),
          Price: String(item.Price),
          PriceBefDi: String(item.PriceBefDi || "0"),
          Discount: String(item.Discount || "0"),
          OpenQuantity: String(item.OpenQuantity || "1"),
          OnHand: item.OnHand || "0",
          IsCommited: item.IsCommited || "0",
          TotalFrgn:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : String(item.TotalFrgn || ""),
          VatSumFrgn:
            getValues("Currency") === companyData.MainCurncy
              ? "0"
              : String(item.VatSumFrgn || ""),
          OnOrder: item.OnOrder || "0",
          WHSCode: item.WHSCode || "",
          AcctCode: item.AcctCode || "0",
          ExpnsCode: item.ExpnsCode || "0",
          ExpnsName: item.ExpnsName || "0",
          TotalExpns: item.TotalExpns || "0",
          TaxCode: String(item.TaxCode || "0"),
          LineTotal: String(item.LineTotal || ""),
          VatPrcnt: String(item.VatPrcnt || "0"),
          Rate: String(item.Rate || "1"),
          PayToCode: data.PayToCode || "0",
          UomCode: item.UomCode || "0",
          UomEntry: item.UomEntry || "0",
          BaseType: item.BaseType || "-1",
          BaseEntry: item.BaseEntry || "-1",
          BaseLine: item.BaseLine || "-1",
          LineNum: item.LineNum || "0",
          SlpCode: String(item.SlpCode || "0"),
          VatSum: String(item.VatSum || "0"),
          QtyVar: String(item.QtyVar || "0"),
          ServCode: item.ServCode || "",
          // ChapterID: item.ChapterID || "0",
          ChapterID: String(item.ChapterID || "0"),
          ETA: item.ETA || "0",
          GTotal: item.GTotal || "0",
          Address: item.Address || "0",
          BinCode: "0",
          LineVat: item.LineVat || "0",
          OcrCode: item.OcrCode || "0",
          OpenSum: item.OpenSum || "0",
          Project: item.Project || "0",
          TaxType: item.TaxType || "0",
          UnitMsr: item.UnitMsr || "0",
          CodeBars: item.CodeBars || "0",
          Currency: item.Currency || "0",
          CntctCode: item.CntctCode || "0",
          GTotalFC: item.GTotalFC || "0",
          GTotalSC: item.GTotalSC || "0",
          INMPrice: String(item.INMPrice || "0"),
          LineVatS: item.LineVatS || "0",
          StockSum: item.StockSum || "0",
          TrnsCode: item.TrnsCode || "0",
          VatAppld: item.VatAppld || "0",
          VatGroup: item.VatGroup || "0",
          VatSumSy: item.VatSumSy || "0",
          AttcEntry: item.AttcEntry || "0",
          DedVatSum: item.DedVatSum || "0",
          LineVatlF: item.LineVatlF || "0",
          NumPerMsr: String(item.NumPerMsr || "0"),
          OpenSumFC: item.OpenSumFC || "0",
          SerialNum: item.SerialNum || "0",
          StckAppFc: item.StckAppFc || "0",
          StckAppSc: item.StckAppSc || "0",
          TaxAmount: item.TaxAmount || "0",
          // TaxStatus: item.TaxStatus || "0",
          VendorNum: item.VendorNum || "0",
          AssblValue: String(item.AssblValue || "0"),
          DedVatSumF: item.DedVatSumF || "0",
          DedVatSumS: item.DedVatSumS || "0",
          InvntSttus: item.InvntSttus || "0",
          OpenSumSys: item.OpenSumSys || "0",
          PriceAfVAT: String(item.PriceAfVAT || "0"),
          ShipToCode: item.ShipToCode || "0",
          StckSumApp: item.StckSumApp || "0",
          StockSumFc: item.StockSumFc || "0",
          StockSumSc: item.StockSumSc || "0",
          TotalSumSy: String(item.TotalSumSy || "0"),
          VatAppldFC: item.VatAppldFC || "0",
          VatAppldSC: item.VatAppldSC || "0",
          FreightCode: item.FreightCode || "0",
          FreightAmount: item.FreightAmount || "0",
          UOMFactor: item.UOMFactor || "0",
          unitMsr2: item.unitMsr2 || "0",
          UomCode2: item.UomCode2 || "0",
          UomEntry2: item.UomEntry2 || "0",

          BaseQty: item.BaseQty || "0",
          ObjType: "14",
          PostTax: String(item.PostTax || "N"),
          TranType: item.TranType || "0",
          BasePrice: item.BasePrice || "0",
          DiscPrcnt: String(item.DiscPrcnt || "0"),
          BaseDocNum: item.BaseDocNum || "0",
          BaseOpnQty: item.BaseOpnQty || "0",
          GPTtlBasPr: item.GPTtlBasPr || "0",
          GrssProfFC: item.GrssProfFC || "0",
          GrssProfit: item.GrssProfit || "0",
          GrssProfSC: item.GrssProfSC || "0",
          OpenCreQty: item.OpenCreQty || "0",
          ShipToDesc: item.ShipToDesc || "0",
          StockPrice: item.StockPrice || "0",
          StockValue: item.StockValue || "0",
          VatDscntPr: item.VatDscntPr || "0",
          InvQty:
            item.UomCode === "Manual"
              ? String(item.Quantity || 1)
              : String(item.InvQty || "0"),
          OpenInvQty:
            item.UomCode === "Manual"
              ? String(item.Quantity || 1)
              : String(item.OpenInvQty || "0"),
          Volume: item.Volume || "0",
          Width1: item.Width1 || "0",
          Height1: item.Height1 || "0",
          Length1: item.Length1 || "0",
          VolUnit: item.VolUnit || "0",
          Weight1: item.Weight1 || "0",
          Len1Unit: item.Len1Unit || "0",
          Excisable: item.Excisable || "N",
          Hght1Unit: item.Hght1Unit || "0",
          Wdth1Unit: item.Wdth1Unit || "0",
          Wght1Unit: item.Wght1Unit || "0",
          GrossBuyPr: item.GrossBuyPr || "0",
          LocCode: matchwhsLoc?.Location || "",

          oSerialLines: (item.oSerialLines || []).map((serialItem) => ({
            DocEntry: serialItem.DocEntry || "",
            UserId: user.UserId,
            CreatedBy: user.UserName,
            CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
            ModifiedBy: "",
            ModifiedDate: "",
            Status: "1",
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
            BaseType: "14",
            BaseEntry: data.BaseEntry || "-1",
            BaseNum: data.DocNum || "-1",
            BaseLinNum: serialItem.BaseLinNum || "-1",
            CreateDate: dayjs(undefined).format("YYYY-MM-DD"),
            Direction: "1",
            TtlQuantity: String(item.InvQty || 1),
            BsDocType: serialItem.BsDocType || "",
            BsDocEntry: serialItem.BsDocEntry || "",
            BsDocLine: serialItem.BsDocLine || "",
          })),
          // =============================================================
          oBatchLines: (item.oBatchLines || []).map((BatchItem) => ({
            DocEntry: BatchItem.DocEntry || "",
            UserId: user.UserId,
            CreatedBy: user.UserName,
            CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
            ModifiedBy: "",
            ModifiedDate: new Date().toISOString(),
            Status: "1",
            BaseNum: data.DocNum || "-1",
            ItemCode: String(item.ItemCode || ""),
            CardCode: data.CardCode || "1",
            CardName: data.CardName || "1",
            ItemName: item.ItemName || "1",
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
            WhsCode: item.WHSCode || "",
            Notes: BatchItem.Notes || "",
            Quantity: String(BatchItem.BatchQty || "1"),
            BaseType: "14",
            BaseEntry: data.BaseEntry || "-1",
            BaseLinNum: BatchItem.BaseLinNum || "-1",
            CreateDate: dayjs(undefined).format("YYYY-MM-DD"),
            Direction: "1",
            TtlQuantity:
              item.UomCode === "Manual"
                ? String(item.Quantity || 1)
                : String(item.InvQty || "0"),
            BsDocType: BatchItem.BsDocType || "1",
            BsDocEntry: BatchItem.BsDocEntry || "1",
            BsDocLine: BatchItem.BsDocLine || "1",
          })),

          // ===========================================================

          oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
            UserId: user.UserId,
            CreatedBy: user.UserName,
            TaxRate: String(taxItem.TaxRate),
            TaxSum: String(taxItem.TaxSum),
            StcCode: taxItem.StcCode,
            BaseSum: String(taxItem.BaseSum),
            RelateType: "1",
            RelateEntry: taxItem.RelateEntry,
            GroupNum: taxItem.GroupNum || "1",
            ExpnsCode: taxItem.ExpnsCode || "0",
            StaCode: taxItem.StaCode || "0",
            staType: taxItem.staType || "1",
            TaxAcct: taxItem.TaxAcct || "0",
            TaxSumSys: taxItem.TaxSumSys || "0",
            TaxSumFrgn:
              getValues("Currency") === companyData.MainCurncy
                ? "0"
                : taxItem.TaxSumFrgn || "0",
            BaseSumFrg:
              getValues("Currency") === companyData.MainCurncy
                ? "0"
                : taxItem.BaseSumFrg || "0",
            BaseSumSys: taxItem.BaseSumSys || "0",
            VatApplied: taxItem.VatApplied || "0",
            VatAppldFC: taxItem.VatAppldFC || "0",
            VatAppldSC: taxItem.VatAppldSC || "0",
            LineSeq: taxItem.LineSeq || "1",
            DeferrAcct: taxItem.DeferrAcct || "0",
            BaseType: taxItem.BaseType || "-1",
            BaseAbs: taxItem.BaseAbs || "1",
            BaseSeq: taxItem.BaseSeq || "1",
            DeductTax: taxItem.DeductTax || "0",
            DdctTaxFrg: taxItem.DdctTaxFrg || "0",
            DdctTaxSys: taxItem.DdctTaxSys || "0",
            TaxStatus: taxItem.TaxStatus || "0",
            ObjectType: "14",
          })),
          oDocBinLocationLines: item.oDocBinLocationLines || [],
        };
      }),
      oExpLines: (data.oExpLines || []).map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        // CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
        // ModifiedDate:dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
        Status: "1",
        ExpnsCode: item.DocEntry,
        ModifiedBy: user.UserName,
        LineTotal: String(item.LineTotal),
        TaxCode: String(item.TaxCode || "0"),
        VatSum: String(item.VatSum),
        GrsAmount: String(item.GrsAmount),
        ExpnsName: String(item.ExpnsCode),
        BaseType: data.BaseType || "0",
        BaseAbsEnt: item.BaseAbsEnt || "-1",
        BaseLnNum: item.BaseLnNum || "-1",
        GrsFC:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : item.GrsFC || "0",
        TotalFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.TotalFrgn || "0"),
        VatSumFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : item.VatSumFrgn || "0",
        BaseRef: item.BaseRef || "0",
        RevAcct: item.RevAcct,
        GrsSC: item.GrsSC || "0",
        PaidFC: item.PaidFC || "0",
        LineVat: item.LineVat || "0",
        LineVatS: item.LineVatS || "0",
        VatPrcnt: item.VatPrcnt || "0",
        VatSumSy: item.VatSumSy || "0",
        DedVatSum: item.DedVatSum || "0",
        DedVatSumF: item.DedVatSumF || "0",
        DedVatSumS: item.DedVatSumS || "0",
        PaidToDate: String(item.PaidToDate || "0"),
        PaidSys: item.PaidSys || "0",
        LineVatF: item.LineVatF || "0",
        TotalSumSy: String(item.TotalSumSy || "0"),
        VatAppldFC: item.VatAppldFC || "0",
        VatAppldSC: item.VatAppldSC || "0",
        VatApplied: item.VatApplied || "0",
        TaxType: item.TaxType || "0",
        Comments: item.Comments || "0",
        VatGroup: item.VatGroup || "0",
        TaxStatus: item.TaxStatus || "0",
        BaseEntry: item.BaseEntry || "-1",
        BaseLine: item.BaseLine || "-1",
        BaseLineNum: item.BaseLineNum || "-1",
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
          ExpnsCode: taxItem.ExpnsCode || "0",
          StaCode: taxItem.StaCode || "0",
          staType: taxItem.staType || "1",
          TaxAcct: taxItem.TaxAcct || "0",
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
          BaseType: taxItem.BaseType || "-1",
          BaseAbs: taxItem.BaseAbs || "1",
          BaseSeq: taxItem.BaseSeq || "1",
          DeductTax: taxItem.DeductTax || "0",
          DdctTaxFrg: taxItem.DdctTaxFrg || "0",
          DdctTaxSys: taxItem.DdctTaxSys || "0",
          TaxStatus: taxItem.TaxStatus || "0",
          ObjectType: "14",
        })),
      })),
      oDPLines: [],
      oPaymentLines: [],
      oTaxExtLines: (data.oTaxExtLines || []).map((oTaxExtLines) => ({
        ...oTaxExtLines,
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
      })),
    };
    console.log("+++++++++++", obj);
    // return;
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/ARCreditmemoV2`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearForm();
            setOpenListData([]);
            fetchOpenListData(0);
            handleGetListClear();
            // handleGetListClearCopyFrom();
            setClearCache(true);
            Swal.fire({
              title: "Success!",
              text: "Sale Credit Note saved Successfully",
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
                  text: "Attachment Sales Credit Note Updated",
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
            text: "Attachment Sale Credit Note Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

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
      handleSearch: handleCancelledListSearch,
      handleClear: handleCancelListClear,
    },
  ];

  // ------------------------------------------------------------------------------------------------------------------------

  const handleOnCancel = () => {
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
          .put(`/ARCreditmemoV2/Cancel/${currentData.DocEntry}`)

          .then((resp) => {
            if (resp.data.success) {
              ClearForm();
              setOpenListData([]);
              fetchOpenListData(0);
              fetchCancelledListData(0);
              fetchClosedListData(0);
              Swal.fire({
                text: "Sales Credit Note Cancel",
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
          text: "Sales Credit Note Not Canceled",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  // const handleOnDocClose = () => {
  //   Swal.fire({
  //     text: `Do You Want Close "${currentData.CardCode}"`,
  //     icon: "question",
  //     confirmButtonText: "YES",
  //     cancelButtonText: "No",
  //     showConfirmButton: true,
  //     showDenyButton: true,
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       apiClient
  //         .put(`/ARCreditmemoV2/Close/${currentData.DocEntry}`)
  //         .then((resp) => {
  //           if (resp.data.success) {
  //             ClearForm();
  //             setOpenListData([]);
  //             fetchOpenListData(0);
  //             fetchCancelledListData(0);
  //             fetchClosedListData(0);
  //             Swal.fire({
  //               text: "Sales Return Close",
  //               icon: "success",
  //               toast: true,
  //               showConfirmButton: false,
  //               timer: 1000,
  //             });
  //           } else {
  //             Swal.fire({
  //               title: resp.data.success,
  //               text: resp.data.message,
  //               icon: "info",
  //               toast: true,
  //               // showConfirmButton: false,
  //               confirmButtonText: "Ok",
  //               timer: 1500,
  //             });
  //           }
  //         });
  //     } else {
  //       Swal.fire({
  //         text: "Sales Return Not Close",
  //         icon: "info",
  //         toast: true,
  //         showConfirmButton: false,
  //         timer: 1500,
  //       });
  //     }
  //   });
  // };

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
          Sales Credit Note List
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

  return (
    <>
      {/* ------------Items Column(Search Item)------------ */}
      {/* {apiloading && <Loader open={apiloading} />} */}
      <DynamicLoader open={apiloading} />

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
      {/* ---------------------TAX LIST MODAL------------------------------ */}
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
        // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
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

      {/* ============Freight Modal/Dialog============ */}
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
      <BinLocation
        open={state.BinLocationOpen}
        closeModel={() => dispatch({ type: "CLOSE", modal: "BinLocationOpen" })}
        onSubmit={handleBinlocationSubmit}
        isLoading={isLoading}
        title="Bin Location"
        data={BinlocListData}
        DocNum={getValues("DocNum")}
        getRowId={(row) => row.id}
        DisbledUpdate={SaveUpdateName}
      />
      <DataGriCellModelClick
        open={state.CharOfAccOpen}
        closeModel={() => dispatch({ type: "CLOSE", modal: "CharOfAccOpen" })}
        onSubmit={onSubmit}
        isLoading={isLoading}
        title="Chart Of Account"
        limit={LIMIT}
        currentPage={ChartAcccurrentPage}
        rowCount={ChartAccrowCount}
        getRowId={(row) => row.DocEntry}
        columns={ChartAccountCol}
        rows={ChartOfAccountList}
        onPaginationModelChange={handleAccountPagi}
        onCellClick={handleClickAccount}
        searchText={searchTextChartAcc}
        onSearchChange={handleSearchAccount}
        oLines={getValues("oLines")}
      />
      {/* ============Freight Modal inside Select Freight Model============ */}
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

      {/* ============CopyFrom Modal/Dialog============ */}
      <CopyFromSearchModel
        open={openDialog}
        onClose={handleCloseDialog}
        onCancel={handleCloseDialog}
        onChange={(e) => handleGetListSearchCopyFrom(e.target.value)}
        value={getListqueryCopyFrom}
        onClickClear={handleGetListClearCopyFrom}
        // title={selectedItem}
        // onSelectChange={() => fetchPOData()}
        Input={
          <>
            <Typography variant="subtitle1" fontWeight="bold">
              Copy From Document
            </Typography>
            <Grid item xs={12} sm={12} md={6} lg={6} textAlign={"center"}>
              <Controller
                name="baseType"
                control={control}
                defaultValue={"16"}
                render={({ field, fieldState: { error } }) => (
                  <InputSelectTextField
                    {...field}
                    error={!!error}
                    helperText={error ? error.message : null}
                    label="Select Document"
                    data={[
                      { key: "16", value: "SALES RETURN" },
                      { key: "13", value: "SALES INVOICE" },
                    ]}
                    onChange={(e) => {
                      field.onChange(e); // Update form state with React Hook Form
                      setCheckedItems({});
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
                  <strong>Customer Code:</strong> {allFormData.CardCode || "--"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={4} textAlign="center">
                <Typography variant="body2">
                  <strong>Customer Name:</strong>{" "}
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
        onSave={handleOpenSales}
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
              {getListPOData.map((item, i) => (
                <CardCopyFrom
                  key={i}
                  id={i}
                  title={item.DocNum}
                  subtitle={`${dayjs(item.DocDate).format(
                    "DD/MM/YYYY",
                  )} || ${dayjs(item.DocDueDate).format("DD/MM/YYYY")}`}
                  // description={dayjs(item.DocDueDate).format("DD/MM/YYYY")}
                  description={item.CardCode}
                  isSelected={oLines.some(
                    (selectBase) => selectBase.BaseDocNum === item.DocNum,
                  )}
                  searchResult={getListqueryCopyFrom}
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

      <SerialIntake
        Title="SERIAL NUMBER"
        openserialmodal={openserial}
        DialogClosePayto={handleCloseSerial}
        onSubmit={(serialData) => onsubmitSeriel(serialData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={selectedItem?.Quantity}
        WhsCode={selectedItem?.WhsCode}
        BaseType={selectedItem?.BaseType}
        BaseEntry={selectedItem?.BaseEntry}
        BaseNum={selectedItem?.BaseNum}
        BaseLinNum={selectedItem?.BaseLinNum}
        CardCode={selectedItem?.CardCode}
        CardName={selectedItem?.CardName}
        Direction={selectedItem?.Direction}
        TtlQuantity={selectedItem?.TtlQuantity}
        BsDocType={selectedItem?.BsDocType}
        BsDocEntry={selectedItem?.BsDocEntry}
        BsDocLine={selectedItem?.BsDocLine}
        BinCode={selectedItem?.BinCode}
        Ids={selectedItem?.id}
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
        Status={"0"}
        Ids={selectedItem?.id}
      />
      <BatchIntake
        Title="BATCH NUMBER"
        openBatchmodal={openBatch}
        DialogClosePayto={handleCloseBatch}
        onSubmit={(BatchData) => onsubmitBatch(BatchData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={selectedItem?.Quantity}
        WHSCode={selectedItem?.WhsCode}
        BinCode={selectedItem?.BinCode}
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
        Status={"0"}
        BaseEntry={selectedItem?.BaseEntry}
        BaseType={selectedItem?.BaseType}
        Ids={selectedItem?.id}
      />
      {/* Sales Save Button Modal */}
      <Modal
        open={openSales}
        onClose={(e) => handleCloseSales(e)}
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
          <Box component="form" onSubmit={handleSubmit(onSubmitCopyFromModal)}>
            <Grid
              container
              mt={2}
              sx={{ px: 2, overflow: "auto", width: "100%" }}
            >
              <Paper sx={{ width: "100%" }}>
                <DataGrid
                  className="datagrid-style"
                  columnHeaderHeight={35}
                  rowHeight={45}
                  rows={copyFromModelSales}
                  columns={type === "I" ? CopyFromItemCol : CopyFromServices}
                  getRowId={(row) => row.LineNum}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 8,
                      },
                    },
                  }}
                  isRowSelectable={isRowSelectable}
                  onRowSelectionModelChange={(selectedIDs) =>
                    handleSelectionChange(selectedIDs)
                  }
                  checkboxSelection
                  // onRowSelectionModelChange={(selectedIDs) => handleCellClickSalesSelected(selectedIDs)}
                  onCellClick={(id) => handleCellClickSalesSelected(id)}
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
                onClick={onSubmitCopyFromModal}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseSales}
              >
                Back
              </Button>
            </Grid>
          </Box>
        </Box>
      </Modal>

      {/* RowLevel WHSCode Model */}
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
                onClick={() =>
                  selectWhSCode(
                    item.WHSCode,
                    item.Location,
                    item.LocationName,
                    item.GSTRegnNo,
                    item.GSTType,
                    item.BinCode,
                    item.DftBinAbs,
                    item.BinActivat,
                    item.SaleCostAc,
                    item.SalesTax,
                  )
                }
              />
            ))}
          </InfiniteScroll>
        }
      />

      {/* RowLevel UomCode Model */}
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
          <Grid
            container
            value={"1"}
            style={{
              overflow: "auto",
              maxHeight: `calc(100% - ${15}px)`,
              paddingLeft: 5,
              paddingRight: 5,
            }}
            id="ListScrollClosed"
          >
            <InfiniteScroll
              style={{ textAlign: "center", justifyContent: "center" }}
              dataLength={UomCodeList.length}
              // hasMore={hasMoreClosed}
              // next={fetchMoreClosedListData}
              loader={<BeatLoader />}
              scrollableTarget="ListScrollClosed"
              endMessage={<Typography>No More Records</Typography>}
            >
              {UomCodeList.map((item, i) => (
                <CardComponent
                  key={i}
                  title={item.UomCode}
                  subtitle={item.UomName}
                  // searchResult={closedListquery}
                  isSelected={
                    getValues(
                      `oLines.${getValues("selectedRowIndex")}.UomCode`,
                    ) === item.UomCode
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
            </InfiniteScroll>
          </Grid>
        </DialogContent>
      </Dialog>

      {/*===============PAY TO Modal/Dialog===============*/}
      <LogisticAddress
        Title="BILL TO DETAILS"
        openPayTo={openPayTo}
        DialogClosePayto={DialogClosePayto}
        onSubmit={handleSubmitAddress}
        BlockB={getValues("BlockB") || ""}
        StreetB={getValues("StreetB") || ""}
        CityB={getValues("CityB") || ""}
        StateB={getValues("StateB") || ""}
        ZipCodeB={getValues("ZipcodeB") || ""}
        CountryB={getValues("CountryB") || ""}
      />

      {/*===============SHIP TO Modal/Dialog===============*/}
      <LogisticAddress
        Title="SHIP TO DETAILS"
        openPayTo={openShipTo}
        DialogClosePayto={DialogCloseShipto}
        onSubmit={handlesubmitAddressShipTo}
        BlockB={getValues("BlockS") || ""}
        StreetB={getValues("StreetS") || ""}
        CityB={getValues("CityS") || ""}
        StateB={getValues("StateS") || ""}
        ZipCodeB={getValues("ZipcodeS") || ""}
        CountryB={getValues("CountryS") || ""}
      />
      {/* ---------------------------------------------------------------------------------- */}

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
            onClick={handleClickCancel}
            sx={{
              display: {}, // Show only on smaller screens
              position: "absolute",
              right: "40px",
            }}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            id="menu"
            anchorEl={anchorEl}
            open={Openmenu}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              disabled={
                //  !(OpenQuantity === Quantity) ||
                SaveUpdateName === "SAVE" || tab === "2"
              }
              onClick={() => {
                handleOnCancel();
                handleClose();
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
                disabled={
                  !(OpenQuantity === Quantity) || SaveUpdateName === "SAVE"
                }
                fontWeight="bold"
              >
                CANCEL
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
              Sales Credit Note
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
                      control={control}
                      rules={{ required: "Card Code is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="CUSTOMER CODE"
                          type="text"
                          readOnly={true}
                          disabled={!!DocEntry}
                          onClick={() => {
                            OpenDailog();
                          }}
                          onChange={OpenDailog}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                    <SearchBPModel
                      open={searchmodelOpen}
                      onClose={SearchModelClose}
                      onCancel={SearchModelClose}
                          title="Select CUSTOMER/Supplier"
                      onChange={(e) => handleGetListSearch(e.target.value)}
                      value={getListquery}
                      onClickClear={handleGetListClear}
                      cardData={
                        <>
                          <InfiniteScroll
                            style={{ textAlign: "center" }}
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
                      rules={{ required: "Card Name is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CUSTOMER NAME"
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
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CUSTOMER REF.NO."
                          type="number"
                          {...field}
                          error={!!error}
                          disabled={isFieldDisabled}
                          helperText={error ? error.message : null}
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
                          disabled={isFieldDisabled}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setValue(
                              "DocDate",
                              dayjs(date).format("YYYY-MM-DD"),
                              { shouldDirty: true },
                            );
                            setValue("DocDueDate", date);
                            setValue("TaxDate", date);
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
                          label="DUE DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          minDate={getValues("DocDate")}
                          onChange={(date) => {
                            const postingDate = getValues("DocDate");
                            if (
                              date &&
                              postingDate &&
                              dayjs(date).isBefore(dayjs(postingDate), "day")
                            ) {
                              setError("DocDueDate", {
                                type: "manual",
                                message:
                                  "Due date must be later than or equal to posting date",
                              });
                              return;
                            }
                            clearErrors("DocDueDate");
                            setValue("DocDueDate", date, {
                              shouldValidate: true,
                            });
                          }}
                          disabled={!getValues("DocDate") || isFieldDisabled}
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
                            setValue("TaxDate", newValue, {
                              shouldDirty: true,
                            });
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
                  {curSource !== "L" && curSource !== "S" ? (
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
                        currentData.CardCode === "" ||
                        SaveUpdateName === "UPDATE" ||
                        !!DocEntry
                      }
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="ITEM/SERVICE TYPE"
                          data={[
                            { key: "I", value: "ITEM" },
                            { key: "S", value: "SERVICE" },
                          ]}
                          value={type}
                          disabled={isFieldDisabled}
                          onChange={(e) => {
                            // Update the field value
                            field.onChange(e);
                            // Set the 'type' state
                            setType(e.target.value);

                            // Prepare updated data and reset form
                            const updatedData = {
                              ...currentData,
                              oLines: [], // Reset the oLines
                              Currency: control._formValues.Currency,
                            };
                            // // Reset the form with the updated data after value change
                            reset({
                              ...updatedData,
                            });
                            setCheckedItems({});
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
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="info"
                        sx={{ textTransform: "none" }}
                        // onClick={handleClick}
                        onClick={() => handleMenuItemClick("Copy From")}
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
                        allFormData.CardCode === "" ||
                        type === "" ||
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
                            apiRef={apiRef}
                            editMode="cell"
                            processRowUpdate={processRowUpdate}
                            onCellKeyDown={handleCellKeyDown}
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
                              if (params.field === "taxCategory") return false;
                              if (
                                params.row.Status === "0" ||
                                params.row.Status === "3"
                              )
                                return false;
                              return true;
                            }}
                            sx={gridSx}
                          />
                        </Grid>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      {tabvalue === 1 && (
                        <Grid container spacing={1}>
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
                              name="ShipToCode"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  label="SHIP TO CODE"
                                  readOnly={true}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    field.onChange(selectedValue);
                                    handleAddress(selectedValue);
                                  }}
                                  data={
                                    BusinessPartnerData?.oLines
                                      ? BusinessPartnerData.oLines
                                          .filter(
                                            (shipto) =>
                                              shipto.AddressType === "S",
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

                          <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Controller
                              name="DfltAddress"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="SHIP TO"
                                  type="text"
                                  rows={2}
                                  multiline
                                  {...field}
                                  error={!!error}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      DialogOpenShipto();
                                    }
                                  }}
                                  helperText={error ? error.message : null}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="top">
                                        <IconButton
                                          onClick={DialogOpenShipto}
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
                            {/* <InputFields label="SHIP TO" /> */}
                          </Grid>

                          <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Controller
                              name="TrnspCode"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputSelectTextField
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="SHIPPING TYPE"
                                  disabled={isFieldDisabled}
                                  data={shippingType.map((item) => ({
                                    key: item.DocEntry,
                                    value: item.TrnspName,
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

                          <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Controller
                              name="Address"
                              control={control}
                              render={({ field, fieldState: { error } }) => (
                                <InputTextField
                                  label="BILL TO"
                                  rows={2}
                                  multiline
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
                                {...field}
                                disabled={isFieldDisabled}
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
                            name="CtlAccount"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="CONTROL ACCOUNT"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                disabled={
                                  !allFormData.CardCode ||
                                  allFormData.Status === "Closed" ||
                                  allFormData.Status === "Cancelled"
                                }
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() =>
                                          dispatch({
                                            type: "OPEN",
                                            modal: "CharOfAccOpen",
                                          })
                                        }
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
                                disabled={isFieldDisabled}
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
                                disabled={isFieldDisabled}
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
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      textAlign={"center"}
                    >
                      <Controller
                        name="SlpCode"
                        rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="SALES EMP"
                            disabled={isFieldDisabled}
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
                        name="DiscPrcnt"
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
                            ? "DiscSum"
                            : curSource === "S"
                              ? "DiscSumSy"
                              : getValues("Currency") === companyData.MainCurncy
                                ? "DiscSum"
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
                            onBlur={(e) => {
                              handleDiscountAmtChange(e);
                              // recalculateHeaderDiscount();
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item lg={3} md={4} sm={6} xs={6} textAlign={"center"}>
                      <SmallInputTextField
                        label="TOTAL DP"
                        type="number"
                        readOnly={true}
                        value={
                          curSource === "L"
                            ? DpmAmnt
                            : curSource === "S"
                              ? DpmAmntSC
                              : getValues("Currency") === companyData.MainCurncy
                                ? DpmAmnt
                                : DpmAmntFC
                        }
                        disabled={
                          !allFormData.CardCode ||
                          allFormData.Status === "Closed" ||
                          allFormData.Status === "Cancelled"
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                // onClick={handleDownPay}
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
                    </Grid>
                    <Grid item md={4} sm={6} lg={3} xs={12} textAlign="center">
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
                        readOnly={true}
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
                    <Grid item lg={3} md={4} sm={6} xs={6} textAlign={"center"}>
                      <Controller
                        name="RoundDif"
                        // rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="Rounding Diff. Amount"
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
                    <Grid item lg={3} md={4} sm={6} xs={6} textAlign={"center"}>
                      <Controller
                        name="PaidToDate"
                        // rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="APPLIED AMOUNT"
                            type="number"
                            value={
                              curSource === "L"
                                ? ValueFormatter(PaidToDate)
                                : curSource === "S"
                                  ? ValueFormatter(PaidSys)
                                  : getValues("Currency") ===
                                      companyData.MainCurncy
                                    ? ValueFormatter(PaidToDate)
                                    : ValueFormatter(PaidFC)
                            }
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item lg={3} md={4} sm={6} xs={6} textAlign={"center"}>
                      {/* <Controller
                                       name="DueAmnt"
                                       // rules={{ required: "This field is required" }}
                                       control={control}
                                       render={({ field, fieldState: { error } }) => ( */}
                      <SmallInputTextField
                        label="BALANCE DUE"
                        type="number"
                        value={
                          curSource === "L"
                            ? ValueFormatter(DueAmnt)
                            : curSource === "S"
                              ? ValueFormatter(DueAmntSc)
                              : getValues("Currency") === companyData.MainCurncy
                                ? ValueFormatter(DueAmnt)
                                : ValueFormatter(DueAmntFC)
                        }
                        readOnly={true}
                        // {...field}
                        // error={!!error}
                        // helperText={error ? error.message : null}
                      />
                      {/* )}
                                     /> */}
                    </Grid>

                    <Grid
                      item
                      lg={3}
                      md={4}
                      sm={6}
                      xs={12}
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
                            disabled={isFieldDisabled}
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
                    SaveUpdateName === "UPDATE"
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
