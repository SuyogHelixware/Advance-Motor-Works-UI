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
import { DataGrid, GridToolbar, useGridApiRef } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, Rate } from "antd";
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
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { fetchExchangeRateStore } from "../../slices/exchangeRateSlice";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CalCulation, { toMinOne } from "../Components/CalCulation";
import CardComponent from "../Components/CardComponent";
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
import { Loader } from "../Components/Loader";
import LogisticAddress from "../Components/LogisticAddress";
import PrintMenu from "../Components/PrintMenu";
import SearchInputField from "../Components/SearchInputField";
import SearchModel, { SearchBPModel } from "../Components/SearchModel";
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
    width: 100,
    editable: false,
  },
];
const initialState = {
  exchaneRateOpen: false,
  DocRateOpen: false,
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
export default function SalesQuotation() {
  const theme = useTheme();
  const { user, warehouseData, companyData } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const perms = usePermissions(116);
  const [tabvalue, settabvalue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  let [ok, setok] = useState("OK");
  const [clearCache, setClearCache] = useState(false);
  const [apiloading, setapiloading] = useState(false);
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [frieghtopen, setFrieghtopen] = useState(false);
  const [salesemp, setSalesEmp] = useState([]);
  const [openFreight, setopenFreight] = useState(false);
  const [BusinessPartnerData, setBusinessPartnerData] = useState([]);
  const [PaymentTermData, setPaymentTermData] = useState([]);
  const [UomCodeList, SetUomCode] = useState([]);
  const [RollBackoExpLines, setRollBackoExpLines] = useState([]);
  const dispatchRedux = useDispatch();
  const { data, loading } = useSelector((state) => state.exchange);

  const navigate = useNavigate();
  const [AllDataCopyRateLine, setAllDataCopyRateLine] = useState([]);

  //Calculation of the State's
  const [taxcode, setTaxCode] = useState([]);
  const [FrieghtTax, setTaxFrieght] = useState([]);
  const [frieghtdata, setFrieght] = useState([]);
  const [currencydata, setCurrencydata] = useState([]);
  const [type, setType] = useState("I");
  const [open, setOpen] = useState(false);
  const [serviceopen, setServiceOpen] = useState(false);
  const timeoutRef = useRef(null);
  const [openPayTo, setOpenPayTo] = useState(false);
  const [openShipTo, setOpenShipTo] = useState(false);
  //=====================================get List State======================================================================
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  //=========================================get List State End=============================================================
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //=========================================open List State End============================================================
  //=====================================closed List State==================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  //=========================================closed List State End==========================================================
  //=====================================Cancel List State=================================================================
  const [cancelledListData, setCancelledListData] = useState([]);
  const [cancelledListquery, setCancelledListQuery] = useState("");
  const [hasMoreCancelled, setHasMoreCancelled] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [cancelListPage, setCancelListPage] = useState(0);
  const [cancelListSearching, setCancelListSearching] = useState(false);
  const Openmenu = Boolean(anchorEl);
  //=========================================cancel List State End=========================================================
  //  ===================================WareHouse State===================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);
  // =======================Ware House End=======================================
  // ===========================Data Grid Pagination And Searching============================

  const LIMIT = 20;
  const [isLoading, setIsLoading] = useState(false);
  // =========================================================================================
  const [openUomCode, setUomcodeOpen] = useState(false);

  const [DocEntry, setDocEntry] = useState("");
  const [shippingType, setShippingType] = useState([]);
  const [oldOpenData, setSelectData] = useState(null);
  var status = getStatus("1"); // This will return "Open"
  // ==================TAX===================================
  const [openTax, setTaxOpen] = useState(false);
  const [TaxgetListData, setTaxGetListData] = useState([]);
  const [taxCurrentPage, setTaxCurrentPage] = useState(0);
  const [taxSearchText, setTaxSearchText] = useState("");
  const [taxRowCount, setTaxRowCount] = useState(0);
  // ====================================================================
  // ====================Tax Category==================================
  const [taxcategoryopen, setTaxCategoryOpen] = useState(false);
  const [oTaxLineCategory, setoTaxLineCategory] = useState([]);
  const [DocumentupdateRate, setDocumentUpdateRate] = useState(0);
  const [SystemupdateRate, setSystemUpdateRate] = useState(0);
  const [PrintData, setPrintData] = useState([]);
  const apiRef = useGridApiRef();

  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const initialFormData = {
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    Status: status,
    SAPDocNum: "",
    SAPDocEntry: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD "),
    DocDueDate: dayjs(undefined).format("YYYY-MM-DD "),
    PaidToDate: "0",
    DocType: "I",
    CANCELED: "",
    Address: "",
    CardCode: "",
    CardName: "",
    // ChapterId:"",
    DocRate: "1",
    ChapterID: "",
    DocCur: "",
    DocTotalSy: "",
    Series: "",
    DocTotal: "",
    CntctCode: "",
    NumAtCard: "",
    WHSCode: "",
    DefaultWhs: "",
    SlpCode: "0",
    SlpName: "",
    Comments: "",
    DiscPrcnt: "0.000",
    ShipMode: "",
    PORevise: "",
    SAPSync: "",
    CompnyAddr: "",
    DfltAddress: "",
    TaxDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    CurSource: "",
    Address2: "",
    TrnspCode: "",
    ShipToCode: "",
    PayToCode: "",
    TotalBefDisc: "",
    DiscSum: "0.000",
    DocNum: "",
    AttcEntry: "0",
    // DocTotalSy: "",
    TotalBefDiscSy: "0.000",
    TotalBefDiscFrgn: "0.000",
    Currency: "",
    TotalExpns: "0.000",
    TaxOnExpFc: "0.000",

    ListNum: "",
    VatSum: "",
    GrsAmount: "",
    RoundDif: "0.000",
    // DiscPrcnt: "",
    // DiscSum: "",
    GroupNum: "",
    JrnlMemo: "",
    CdcOffset: "",
    CancelDate: "",
    PayDuMonth: "",
    ExtraDays: "",
    ExtraMonth: "",
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
        ObjectType: "23",
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
    // formState: { errors },
  } = useForm({
    defaultValues: initialFormData,

    // mode: "onChange",
  });
  const currentData = getValues();
  const allFormData = getValues();

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/23`,
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
  const curSource = watch("CurSource");
  const DocRate = watch("DocRate");
  const currency = watch("Currency");
  // const docDate = getValues("DocDate");
  const SysRate = watch("SysRate");
  const rawDate = watch("DocDate");
  const docDate = rawDate ? dayjs(rawDate).format("YYYY-MM-DD") : null;
  const GroupNum = watch("GroupNum");
  useEffect(() => {
    dispatchRedux(fetchExchangeRateStore(docDate))
      .unwrap()
      .then((data) => {
        const values = data.values || [];
        const sysCurr = companyData.SysCurrncy;
        const mainCurr = companyData.MainCurncy;
        const headerCurr = currency;
        let missingRates = [];
        // ============================
        // SYSTEM RATE CHECK
        // ============================
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
        const sysRateObj = values.find((x) => x.Currency === sysCurr);
        const sysRate =
          sysCurr === mainCurr ? 1 : parseFloat(sysRateObj?.Rate || 0);
        const DateWiseSysRate = parseFloat(SystemupdateRate) || sysRate; //
        setValue("SysRate", DateWiseSysRate);
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
    ].filter(v => v?.trim()).join(", ");
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

    let Address = [
      //  selectedAddress.Address,
      selectedAddress.Address1,
      selectedAddress.Address2,
      selectedAddress.City,
      selectedAddress.State,
      selectedAddress.Zipcode,
      selectedAddress.Country,
    ].filter(v => v?.trim()).join(", ");

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
    console.log("fdsdasdasd", data);
    let Address = [
      data.BlockB, // Use correct field names
      data.StreetB, // Use correct field names
      data.CityB,
      data.StateB,
      data.ZipCodeB,
      data.CountryB,
    ].filter(v => v?.trim()).join(", ");
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
      ].filter(v => v?.trim()).join(", ");
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

  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };

  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };

  const RoundDif = watch("RoundDif");
  const discPercent = watch("DiscPrcnt");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
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

  const HandlePrint = () => {
    window.print();
  };

  const { DocSeries } = useDocumentSeries(
    "23",
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
    reset();
    setBusinessPartnerData([]);
    setRollBackoExpLines([]);
    setSelectData([]);
    setSystemUpdateRate(0);
    setDocumentUpdateRate(0);
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
    clearFiles();
  };

  //#region  Open Tab
  // Quotation List For OPEN Tab
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/SalesQuotation/Search/${searchTerm}/1/${pageNum}/20`
        : `/SalesQuotation/Pages/1/${pageNum}/20`;

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
    setOpenListData([]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res);
    }, 600);
    // Fetch with search query
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
  // let BaseType = allFormData.oLines.some((base) => base.BaseType === "23");

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

  //#endregion End Open  Tab

  //#region  Close Tab  SalesQuotation
  // Close Tab Api Binding
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/SalesQuotation/Search/${searchTerm}/0/${pageNum}/20`
        : `/SalesQuotation/Pages/0/${pageNum}/20`;

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

  const fetchCancelledListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/SalesQuotation/Search/${searchTerm}/3/${pageNum}/20`
        : `/SalesQuotation/Pages/3/${pageNum}/20`;

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
  const handleClosedListSearch = (res) => {
    setClosedListQuery(res);
    setClosedListSearching(true);
    setClosedListPage(0);
    setClosedListData([]);

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

  //#region  SEarching List CUSTOMER
  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BPV2/V2/ByCardType/Search/${searchTerm}/C/1/${pageNum}/20`
        : `/BPV2/V2/ByCardType/Pages/C/1/${pageNum}/20`;

      const response = await apiClient.get(url);

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
    ].filter(v => v?.trim()).join(", ");
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
    ].filter(v => v?.trim()).join(", ");
    setValue("Address", DfltBillToAddress || "");
    setValue("BlockB", selectedBillToAddress.Address1);
    setValue("StreetB", selectedBillToAddress.Address2);
    setValue("CityB", selectedBillToAddress.City);
    setValue("StateB", selectedBillToAddress.State);
    setValue("CountryB", selectedBillToAddress.Country);
    setValue("ZipcodeB", selectedBillToAddress.Zipcode);
    setBusinessPartnerData(values);
    SearchModelClose();
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
    setValue("ExtraMonth", PaymentValuesSet[0]?.ExtraMonth ?? 0);
    setValue("ListNum", PaymentValuesSet[0]?.ListNum ?? "0");
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
  // setValue("CompnyAddr", CompanyDetail?.[0]?.CompnyAddr || "");

  // ------------------------------------------------------------------------------------------------------------------------

  const handleFright = () => {
    setFrieghtopen(true);
    // freightdata()
  };

  // ------------------------------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------------------------------

  const handleDeleteRow = (id) => {
    const updatedRows = getValues("oLines").filter((_, index) => index !== id);

    const updatedData = {
      ...getValues(),
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
    setok("UPDATE");

    const updatedData = {
      ...currentData,
      oExpLines: updatedRows,
    };
    // Reset the form with the updated data
    reset(updatedData);
  };

  const handleClose = () => {
    setServiceOpen(false);
    setAnchorEl(null);
  };

  //#region  Small Api Binding
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
    const currentRowIndex = getValues("selectedRowIndex");
    // setselectRowTax(currentRowIndex)
    setok("UPDATE");

    const lines = getValues("oLines");
    const updatedLines = lines.map((line, index) => {
      if (index !== currentRowIndex) return line;
      // Create a new updated object with selected TaxCode\\

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

    // TaxCloseModel(false);
  };

  // --------------------------------------------------------------------------
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

  console.log("purchases dsdfds", SysRate);
  const setbusinessPartner = async (CardCode, LineNum) => {
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
  const getPaymentValue = async (e) => {
    console.log(e.target.value);
    const paymenttermvalue = e.target.value;
    const PaymentValuesSet = PaymentTermData.filter(
      (payment) => payment.DocEntry === paymenttermvalue,
    );
    console.log(PaymentValuesSet);
    setValue("PayDuMonth", PaymentValuesSet[0].PayDuMonth);
    setValue("ExtraMonth", PaymentValuesSet[0].ExtraMonth);
    setValue("ExtraDays", PaymentValuesSet[0].ExtraDays);
    setValue("ExtraDays", PaymentValuesSet[0].ExtraDays);
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
        const recordRateWise =
          records.find((item) => item.Currency === currency)?.Rate ?? 0;
        if (recordRateWise === 0) {
          dispatch({ type: "OPEN", modal: "DocRateOpen" });
        }
        const priceLineRatio = recordRateWise / DocRate;
        const isMainCurrency = currency === companyData.MainCurncy;
        let LineTotal, TotalSumSy, TotalFrgn;
        const CalcLines = CalCulation(
          item.Quantity,
          newPrice,
          item.Discount,
          Rate,
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
          Rate: recordRateWise,
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
    freightdata();

    PaymentTermApi();
    CurrencyData();
    salesEmpdata();
    ShippingType();
    // LogisticPaytoBP();
  }, []);

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
  // const FrieghtCol = [
  //   {
  //     id: 0,
  //     field: "DocEntry",
  //     headerName: "FREIGHT",
  //     width: 150,
  //     renderCell: (params) => {
  //       // Find the corresponding ExpnsName based on DocEntry
  //       const freightItem = frieghtdata.find(
  //         (item) => item.DocEntry === params.value
  //       );
  //       return freightItem ? freightItem.ExpnsName : params.value;
  //     },
  //   },

  //   {
  //     id: 1,
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
  //     width: 200,
  //     sortable: false,
  //     editable: false, // Set to true to allow editing
  //     renderCell: (params) => (
  //       <ModelInputText
  //         name="LineTotal"
  //         type="number"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleFreight(e, params.row)}
  //         InputProps={{
  //           startAdornment: (
  //             <InputAdornment position="start">
  //               {params.row.Currency}
  //             </InputAdornment>
  //           ),
  //         }}
  //         // onBlur={(e) => handleFreight(e, params.row)}
  //       />
  //     ),
  //   },

  //   {
  //     id: 2,
  //     field: "TaxCode",
  //     headerName: "TAX CODE",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params, id) => (
  //       <ModelInputSelectTextField
  //         name="TaxCode"
  //         value={params.value}
  //         onChange={(e) => handleFreight(e, params.row)}
  //         data={[
  //           {
  //             key: 0,
  //             value: "No Tax Selected",
  //           },

  //           ...(FrieghtTax || []).map((item) => ({
  //             key: item.DocEntry,
  //             value: item.TaxCode,
  //           })),
  //         ]}
  //       />
  //     ),
  //   },
  //   {
  //     // field: "VatSum",
  //     id: 3,
  //     field:
  //       curSource === "L"
  //         ? "VatSum"
  //         : curSource === "S"
  //         ? "VatSumSy"
  //         : getValues("Currency") === companyData.MainCurncy
  //         ? "VatSum"
  //         : "VatSumFrgn",
  //     headerName: "TOTAL TAX AMT",
  //     width: 200,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <ModelInputText
  //         name="VatSum"
  //         readOnly={true}
  //         type="number"
  //         value={params.value}
  //       />
  //     ),
  //   },
  //   {
  //     // field: "GrsAmount",
  //     id: 4,
  //     field:
  //       curSource === "L"
  //         ? "GrsAmount"
  //         : curSource === "S"
  //         ? "GrsSC"
  //         : getValues("Currency") === companyData.MainCurncy
  //         ? "GrsAmount"
  //         : "GrsFC",
  //     headerName: "GROSS AMT",
  //     width: 250,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <ModelInputText
  //         name="GrsAmount"
  //         value={params.value}
  //         readOnly={true}
  //         onChange={(e) => handleFreight(e, params.row)}
  //       />
  //     ),
  //   },
  //   {
  //     field: "ACTION",
  //     headerName: "ACTION",
  //     width: 150,
  //     sortable: false,
  //     renderCell: (params) => {
  //       return (
  //         <IconButton
  //           color="error"
  //           onClick={() => handleDeleteFrieght(params.row.id)}
  //         >
  //           <DeleteIcon />
  //         </IconButton>
  //       );
  //     },
  //   },
  // ];

  // const ItemColumn = [
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
  //     field: "ShipDate",
  //     headerName: "Delivery DATE",
  //     width: 170,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputDatePickerFields
  //         name="ShipDate"
  //         value={params.value ? dayjs(params.value) : null}
  //         onChange={(date) =>
  //           handleChange(
  //             {
  //               target: {
  //                 name: "ShipDate",
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
  //     headerName: "QTY",
  //     width: 120,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="Quantity"
  //         type="number"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //         disabled={
  //           params.row.Status === "0" ||
  //           params.row.Status === "3" ||
  //           params.row.Quantity !== params.row.OpenQuantity
  //         } // ✅ Disable input for Status 0 & 3
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
  //     field: "DiscPrcnt",
  //     headerName: "DISC(%)",
  //     width: 120,
  //     sortable: false,
  //     editable: false,
  //     headerAlign: "center",
  //     align: "center",
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="DiscPrcnt"
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
  //     headerName: "Loc.Name",
  //     width: 100,
  //     sortable: false,
  //   },
  //   {
  //     field: "UomCode",
  //     headerName: "UoM CODE",
  //     width: 130,
  //     sortable: false,
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
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="OpenQuantity"
  //         value={params.value}
  //         InputProps={{ readOnly: true }}
  //       />
  //     ),
  //   },

  //   {
  //     field: "OnHand",
  //     headerName: "IN STOCK",
  //     width: 100,
  //     sortable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="OnHand"
  //         value={params.value}
  //         InputProps={{ readOnly: true }}
  //       />
  //     ),
  //   },

  //   {
  //     field: "IsCommited",
  //     headerName: "RESERVE",
  //     width: 100,
  //     sortable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="IsCommited"
  //         value={params.value}
  //         InputProps={{ readOnly: true }}
  //       />
  //     ),
  //   },

  //   {
  //     field: "OnOrder",
  //     headerName: "ORDERED",
  //     width: 100,
  //     sortable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="OnOrder"
  //         value={params.value}
  //         InputProps={{ readOnly: true }}
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
  // const Services = [
  //   {
  //     id: 1,
  //     field: "id",
  //     headerName: "LINE NO",
  //     width: 50,
  //     renderCell: (params) => <Typography>{params.id + 1}</Typography>,
  //   },
  //   { field: "ServCode", headerName: "SAC CODE", width: 100 },
  //   {
  //     field: "ItemName",
  //     headerName: "SAC DESCRIPTION",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="ItemName"
  //         value={params.value}
  //         onChange={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0"}
  //       />
  //     ),
  //   },
  //   {
  //     field: "PriceBefDi",
  //     headerName: "UNIT PRICE",
  //     sortable: false,
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="PriceBefDi"
  //         type="number"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0" || params.row.Status === "3"}
  //         InputProps={{
  //           startAdornment: (
  //             <InputAdornment position="start">
  //               {params.row.Currency}
  //             </InputAdornment>
  //           ),
  //         }} // ✅ Disable input for Status 0 & 3
  //       />
  //     ),
  //   },
  //   {
  //     field:
  //       // curSource === "L"
  //       //   ? companyData.MainCurncy
  //       //   : curSource === "S"
  //       //   ? companyData.SysCurrncy
  //       //   : // getValues("Currency") === companyData.MainCurncy
  //       // ?
  //       "Currency",
  //     // : currency,
  //     headerName: "CURRENCY",
  //     width: 100,
  //     type: "number",
  //     sortable: false,
  //     align: "center", // centers cell text
  //     headerAlign: "center",
  //     renderCell: (params) => (
  //       <>
  //         {
  //           // curSource === "L"
  //           //   ? companyData.MainCurncy
  //           //   : curSource === "S"
  //           //   ? companyData.SysCurrncy
  //           //   :
  //           params.row.Currency
  //         }{" "}
  //         {""}
  //         {/* fallback */}
  //       </>
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
  //   {
  //     field: "DiscPrcnt",
  //     headerName: "DISC(%)",
  //     width: 120,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="DiscPrcnt"
  //         value={params.value}
  //         disabled={params.row.Status === "0"}
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
      field: "ShipDate",
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
        // Mark that user is actually editing this field
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
      width: 150, // 🔥 same as UOM Code
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
                e.preventDefault();
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
      field: "LocCode",
      headerName: "Loc.Name",
      width: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
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
  const handleCellClick = (id) => {
    const selectedIDs = new Set(id); // All selected DocEntry values across all pages

    setSelectedRows((prev) => {
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
            ChapterID: data.ChapterID,
            Price: PriceBefDi,
            Quantity: 1,
            OpenQuantity: 1,
            Status: "1",
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
            OnOrder: data.OnOrder,
            WHSCode: data.DefaultWhs || "",
            UomEntry2: data.UgpEntry || "",
            UomEntry: data.SUoMEntry,
            UomCode:
              data.UgpEntry === "-1"
                ? "Manual"
                : data.SUOMCode === "0"
                  ? ""
                  : data.SUOMCode,

            PUoMEntry: data.SUoMEntry || "",
            Excisable: String(data.Excisable),
            NumInSale: data.NumInSale,
            PostTax: data.GSTRelevnt,
            UOMFactor: ValueFormatter(data.UOMFactor || "0", 6),
            GstTaxCtg: data.GstTaxCtg,
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
    // handleFrightClose();
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

  // const handleFreight = (e, row) => {
  //   const { name, value } = e.target;
  //   // Update the specific field in oLines
  //   let activeCurrency =
  //     curSource === "L"
  //       ? companyData.MainCurncy
  //       : curSource === "S"
  //       ? companyData.SysCurrncy
  //       : currency;
  //   const updatedLines = getValues("oExpLines").map((data, index) => {
  //     if (row.id !== index) return data;
  //     const updatedData = { ...data, [name]: value };
  //     if (
  //       name === "LineTotal" ||
  //       name === "TotalSumSy" ||
  //       name === "TotalFrgn"
  //     ) {
  //       switch (curSource) {
  //         case "L":
  //           updatedData.LineTotal = Math.min(Math.max(value, 0));
  //           updatedData.TotalFrgn = ValueFormatter(
  //             updatedData.LineTotal / DocRate
  //           );
  //           updatedData.TotalSumSy = ValueFormatter(
  //             updatedData.LineTotal / SysRate
  //           );
  //           break;
  //         case "S":
  //           updatedData.TotalSumSy = Math.min(Math.max(value, 0));
  //           updatedData.LineTotal = ValueFormatter(
  //             updatedData.TotalSumSy * SysRate
  //           );
  //           updatedData.TotalFrgn = ValueFormatter(
  //             updatedData.LineTotal / DocRate
  //           );
  //           break;
  //         case "C":
  //           if (currency === companyData.MainCurncy) {
  //             updatedData.LineTotal = Math.min(Math.max(value, 0));
  //             updatedData.TotalFrgn = ValueFormatter(
  //               updatedData.LineTotal / DocRate
  //             );
  //             updatedData.TotalSumSy = ValueFormatter(
  //               updatedData.LineTotal / SysRate
  //             );
  //           } else {
  //             updatedData.TotalFrgn = Math.min(Math.max(value, 0));
  //             updatedData.LineTotal = ValueFormatter(value * DocRate);
  //             updatedData.TotalSumSy = ValueFormatter(
  //               updatedData.LineTotal / SysRate
  //             );
  //           }
  //           break;
  //         default:
  //       }
  //     }
  //     if (name === "TaxCode") {
  //       updatedData.TaxCode = value;
  //     }
  //     const taxFright = taxCalculation(
  //       updatedData.LineTotal,
  //       (updatedData.AssblValue = updatedData.LineTotal),
  //       row.DocTotal,
  //       (updatedData.PriceBefDi = updatedData.LineTotal),
  //       (updatedData.Quantity = 1),
  //       updatedData.TaxCode
  //     );
  //     const oTaxLinesF = taxFright.oTaxLines;
  //     updatedData.oTaxLines = oTaxLinesF;
  //     updatedData.VatSum = ValueFormatter(taxFright.VatSum);
  //     updatedData.VatSumSy = ValueFormatter(taxFright.VatSumSy);
  //     updatedData.VatSumFrgn = ValueFormatter(taxFright.VatSumFrgn);
  //     const fields = [
  //       { key: "GrsAmount", vat: "VatSum", total: "LineTotal" },
  //       { key: "GrsSC", vat: "VatSumSy", total: "TotalSumSy" },
  //       { key: "GrsFC", vat: "VatSumFrgn", total: "TotalFrgn" },
  //     ];
  //     fields.forEach(({ key, vat, total }) => {
  //       const vatValue = parseFloat(updatedData[vat]) || 0;
  //       const totalValue = parseFloat(updatedData[total]) || 0;
  //       updatedData[key] = ValueFormatter(vatValue + totalValue);
  //     });
  //     updatedData.Currency = activeCurrency;
  //     return updatedData;
  //   });

  //   reset({ ...allFormData, oExpLines: updatedLines });
  // };
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
  const selectWhSCode = async (
    WHSCode,
    Location,
    LocationName,
    GSTRegnNo,
    GSTType,
    BalInvntAc,
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
        const altbasqty = UomCodeList.find(
          (aty) => aty.UomCode === line.UomCode,
        );
        const intcasenum =
          altbasqty === undefined
            ? 1 / 1
            : altbasqty.AltQty / altbasqty.BaseQty;
        const initnum = intcasenum;
        const newnum = AltQty / BaseQty;
        const oBaseNum = line.UOMFactor;
        const NumPerMsr = ValueFormatter(initnum / newnum, 6);
        const oInvNumPerMsr = ValueFormatter(oBaseNum / newnum, 6);
        const InvQty = ValueFormatter(oInvNumPerMsr * line.Quantity, 6);
        const newPriceBefDi = NumPerMsr * line.PriceBefDi;
        const NewLineTotal = newPriceBefDi * line.Quantity;
        const Price = newPriceBefDi;
        const taxLines = taxCalculation(
          NewLineTotal,
          line.AssblValue,
          getValues("DocTotal"),
          newPriceBefDi,
          line.Quantity,
          line.TaxCode,
        );
        const oTaxLine = taxLines.oTaxLines;
        const VatPrcnt = taxLines.VatPrcnt;
        const VatSum = ValueFormatter(
          taxLines.oTaxLines.reduce((sum, curr) => sum + curr.TaxSum, 0),
        );
        const priceWithVAT =
          parseFloat(Price) + parseFloat(Price) * (line.VatPrcnt / 100);
        line.PriceAfVAT = ValueFormatter(priceWithVAT);
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
          // LineTotal: NewLineTotal.toFixed(3),
          // DiscPrcnt: "",
          // oTaxLines: oTaxLine,
          // VatPrcnt: VatPrcnt,
          // VatSum: VatSum,
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

  const handleDocRateChange = (e) => {
    let NewRate = parseFloat(e.target.value) || 0;
    if (NewRate < 0) NewRate = 0;
    setValue("DocRate", NewRate);
    // CalculateRate(NewRate);
  };

  const CalculateRate = useCallback(() => {
    // const currentDocRate = newDocRate;
    if (!DocRate || DocRate <= 0) return;
    // const currency = getValues("Currency");
    // const isMainCurrency = currency === companyData.MainCurncy;
    const isSysCurrency = currency === companyData.SysCurrncy;
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
        return {
          ...line,
          LineTotal: LineTotal,
          TotalSumSy: TotalSumSy,
          TotalFrgn: TotalFrgn,
          Rate:
            companyData.SysCurrncy === line.Currency
              ? updatedData.SysRate
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
    currency,
    docDate,

    // DocRate, SysRate, curSource, allFormData, getValues, reset, setValue
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
  // const handleChange = (e, row) => {
  //   const { name, value } = e.target;
  //   setok("UPDATE");
  //   const quantity = selectedRowsSales.map((item) => item.Quantity);
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
  //         updatedData.Quantity = value;
  //         updatedData.InvQty = ValueFormatter(value * updatedData.NumPerMsr, 6);
  //       }
  //     }
  //     if (name === "PriceBefDi") {
  //       updatedData.PriceBefDi = Math.min(Math.max(value, 0));
  //       updatedData.Currency = currency;
  //       const Rate = companyData.MainCurncy === currency ? "1" : DocRate;
  //       updatedData.Rate = Rate;
  //     }
  //     if (name === "DiscPrcnt") {
  //       updatedData.DiscPrcnt = Math.min(Math.max(value, 0), 100);
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
  //       updatedData.DiscPrcnt
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
  //     updatedData.VatPrcnt = taxLines.VatPrcnt;
  //     updatedData.InvQty = ValueFormatter(
  //       updatedData.NumPerMsr * updatedData.Quantity,
  //       6
  //     );
  //     updatedData.OpenInvQty = updatedData.InvQty;
  //     updatedData.oTaxLines = taxLines.oTaxLines;
  //     updatedData.VatPrcnt = taxLines.VatPrcnt;
  //     updatedData.InvQty = updatedData.NumPerMsr * updatedData.Quantity;
  //     updatedData.OpenInvQty = updatedData.InvQty;
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
  //     DiscSum: getValues("DiscSum"),
  //     DiscPrcnt: getValues("DiscPrcnt"),
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

    // // Start edit mode if editable
    // const nextCellParams = api.getCellParams(nextId, nextField);
    // if (nextCellParams.isEditable) {
    //   setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    // }
  };
  const processRowUpdate = (newRow, oldRow) => {
    const updatedData = { ...oldRow, ...newRow };
    if (newRow.ShipDate !== undefined) {
      if (newRow.ShipDate && !dayjs(newRow.ShipDate).isValid()) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Date",
          text: "Please enter a valid delivery date.",
          confirmButtonText: "OK",
        });
        updatedData.ShipDate = oldRow.ShipDate;
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
      updatedData.Currency = currency;
      updatedData.Rate = companyData.MainCurncy === currency ? 1 : DocRate;

      // Clean up the flag
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
  //! Header Level CalCaculation
  const oLines = getValues("oLines") || []; // Ensure it's an array
  const { TotalBefDisc, totalBefDiscSy, totalBefDiscFrgn } = useMemo(() => {
    let TotalBefDisc = 0;
    let totalBefDiscSy = 0;
    let totalBefDiscFrgn = 0;
    oLines.forEach((line) => {
      TotalBefDisc += parseFloat(line?.LineTotal) || 0;
      totalBefDiscSy += parseFloat(line?.TotalSumSy) || 0;
      totalBefDiscFrgn += parseFloat(line?.TotalFrgn) || 0;
    });
    return { TotalBefDisc, totalBefDiscSy, totalBefDiscFrgn };
  }, [oLines]);
  useEffect(() => {
    setValue("TotalBefDisc", ValueFormatter(TotalBefDisc));
    setValue("TotalBefDiscSy", ValueFormatter(totalBefDiscSy));
    setValue("TotalBefDiscFrgn", ValueFormatter(totalBefDiscFrgn));
    const Discount = getValues("DiscPrcnt");
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
  const DiscSum = parseFloat(getValues("DiscSum")) || 0;
  const DocTotal =
    TotalBefDisc - DiscSum + TotalExpns + VatSum + parseFloat(RoundDif || 0);
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

  // 1️⃣ Find Rate by Currency
  const findRate = (data, curr) => {
    return parseFloat(data.find((ex) => ex.Currency === curr)?.Rate) || 0;
  };

  const onSubmitLineCurrency = (data) => {
    // If lines already exist → open purchase modal
    // if (OlinesData.length > 0) {
    //   handleOpenSales();
    //   return;
    // }

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
      const discountValue = parseFloat(currentData.DiscPrcnt) || 0;
      if (Array.isArray(UpdatedLines) && UpdatedLines.length > 0) {
        calculateDiscountAmt(discountValue);
      }

      closeModel();
      // }
    } catch (error) {
      console.error("Error in onSubmit:", error);
    }
  };

  //#region Copy From GET Api
  const handleSubmitForm = async (data) => {
    const isValid = ValidationSubmitForm(data, type, warehouseData, getValues);
    if (getValues("DocTotal") <= 0) {
      Swal.fire({
        text: "Total document value must be zero or greater.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return false;
    }
    console.log(isValid);
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
    console.log("fileObj", formData);
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
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      DocDueDate: dayjs(data.DocDueDate).format("YYYY-MM-DD"),
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
      // Status:
      //   data.Status === "Open" ? "1" : data.Status === "Cancelled" ? "3" : "0",
      Status: data.Status ? "1" : "0",
      CardCode: data.CardCode,
      CardName: data.CardName,
      CntctCode: data.CntctCode || "0",
      DocNum: String(data.DocNum || "0"),
      NumAtCard: data.NumAtCard || "",
      CurSource:
        getValues("Currency") === companyData.MainCurncy ? "L" : data.CurSource,
      SysRate: String(data.SysRate || "1"),
      DocCur: data.Currency,
      DocRate: String(data.DocRate || "1"),
      DocType: type,
      Address2: String(data.DfltAddress || ""),
      PayToCode: String(data.PayToCode || ""),
      Address: String(data.Address || ""),
      TrnspCode: data.TrnspCode || "0",
      AttcEntry: attachmentDocEntry,
      TotalBefDisc: data.TotalBefDisc || "0",
      TotalBefDiscSy: data.TotalBefDiscSy || "0",
      TotalBefDiscFrgn:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.TotalBefDiscFrgn,
      DiscPrcnt: String(data.DiscPrcnt || "0"),
      DiscSum: String(data.DiscSum || "0"),
      RoundDif: data.RoundDif || "0",
      VatSum: String(data.VatSum || "0"),
      SlpCode: String(data.SlpCode || "0"),
      Comments: String(data.Comments || ""),
      TotalExpns: data.TotalExpns || "0",
      DocTotalFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.DocTotalFC,
      DocTotal: data.DocTotal || "0",
      Series: String(data.Series || "0"),
      DpmVat: data.DpmVat || "0",
      PaidFC: data.PaidFC || "0",
      VatSumFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.VatSumFC || "0",
      Serial: data.Serial || "0",
      DiscSumFC:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : data.DiscSumFC || "0",
      TaxOnExpFc:
        getValues("Currency") === companyData.MainCurncy
          ? "0"
          : String(data.TaxOnExpFc || "0"),
      DpmAppl: data.DpmAppl || "0",
      PaidDpm: data.PaidDpm || "0",
      PaidSum: data.PaidSum || "0",
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
      UpdInvnt: String(data.UpdInvnt || "0"),
      CreateTran: String(data.CreateTran || "0"),
      TaxOnExp: String(data.TaxOnExp || "0"), //Vishay this Key about navchar
      VatSumSy: data.VatSumSy || "0",
      BnkBranch: data.BnkBranch || "0",
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
      PaidToDate: "0" || "",
      ReceiptNum: data.ReceiptNum || "0",
      RoundDifFC: data.RoundDifFC || "0",
      RoundDifSy: data.RoundDifSy || "0",
      ShipToCode: data.ShipToCode || "0",
      TaxOnExApF: data.TaxOnExApF || "0",
      TaxOnExApS: data.TaxOnExApS || "0",
      TaxOnExpSc: data.TaxOnExpSc || "0",
      TotalExpFC: data.TotalExpFC || "0",
      TotalExpSC: data.TotalExpSC || "0",
      VatPaidSys: data.VatPaidSys || "0",
      Volume: data.Volume || "0",
      Weight: data.Weight || "0",
      DpmAmnt: data.DpmAmnt || "0",
      ExpAppl: data.ExpAppl || "0",
      PaidSys: data.PaidSys || "0",
      ReqDate:
        dayjs(data.ReqDate).format("YYYY-MM-DD") ||
        dayjs(undefined).format("YYYY-MM-DD"),
      VolUnit: data.VolUnit || "0",
      Rounding: data.Rounding || "0",
      CdcOffSet: data.CdcOffSet || "0",
      DunnLevel: data.DunnLevel || "0",
      ExpApplFC: data.ExpApplFC || "0",
      ExpApplSC: data.ExpApplSC || "0",
      CancelDate:
        dayjs(undefined).format("YYYY-MM-DD") ||
        dayjs(undefined).format("YYYY-MM-DD"),
      CtlAccount: data.CtlAccount || "",
      DoctotalSy: data.DoctotalSy || "0",
      GrosProfSy: data.GrosProfSy || "0",
      Installmnt: data.Installmnt || "0",
      InvntSttus: data.InvntSttus || "0",
      WeightUnit: data.WeightUnit || "0",
      GrossProfit: data.GrossProfit || "0",
      VatPercent: data.VatPercent || "0",
      UseShpdGd: data.UseShpdGd || "0",
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oLines: data.oLines.map((item) => {
        const matchwhsLoc = warehouseData.find(
          (LC) => LC.LocationName === item.LocCode,
        );

        return {
          Volume: data.Volume || "0",
          Weight: data.Weight || "0",
          UserId: user.UserId,
          CreatedBy: user.UserName,
          ModifiedBy: user.UserName,
          Status:
            String(item.Status) === "1" ||
            String(item.Status) === "3" ||
            String(item.Status) === "0"
              ? String(item.Status)
              : "1",
          ItemCode: String(item.ItemCode || "0"),
          ItemName: item.ItemName,
          Quantity: String(item.Quantity || 1),
          PriceBefDi: String(item.PriceBefDi || "0"),
          INMPrice: String(item.INMPrice || "0"),
          Price: String(item.Price || "0"),
          DiscPrcnt: String(item.DiscPrcnt || "0"),
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
          Rate: String(item.Rate || "1"),
          OnOrder: item.OnOrder || "0",
          WHSCode: item.WHSCode || "",
          AcctCode: item.AcctCode || "0",
          ExpnsCode: item.ExpnsCode || "0",
          ExpnsName: item.ExpnsName || "0",
          TotalExpns: item.TotalExpns || "0",
          TaxCode: String(item.TaxCode || "0"),
          LineTotal: String(item.LineTotal || ""),
          UomCode: item.UomCode || "",
          BaseType: item.BaseType || "-1",
          BaseEntry: item.BaseEntry || "-1",
          BaseLine: item.BaseLine || "-1",
          LineNum: item.LineNum || "0",
          SlpCode: String(item.SlpCode || "0"),
          VatSum: String(item.VatSum || "0"),
          QtyVar: String(item.QtyVar || "0"),
          ServCode: String(item.ServCode || "0"),
          ChapterID: String(item.ChapterID || "0"),
          PriceAfVAT: (parseFloat(item?.PriceAfVAT) || 0).toFixed(2),
          DocEntry: String(item.DocEntry),
          ETA: item.ETA || "0",
          GTotal: item.GTotal || "0",
          Address: item.Address || "0",
          BinCode: item.BinCode || "0",
          LineVat: item.LineVat || "0",
          OcrCode: item.OcrCode || "0",
          OpenSum: item.OpenSum || "0",
          Project: item.Project || "0",
          TaxType: item.TaxType || "S",
          UnitMsr: item.UnitMsr || "",
          CodeBars: item.CodeBars || "0",
          Currency: item.Currency || "0",
          GTotalFC: item.GTotalFC || "0",
          GTotalSC: item.GTotalSC || "0",
          LineVatS: item.LineVatS || "0",
          StockSum: item.StockSum || "0",
          TrnsCode: item.TrnsCode || "0",
          UomEntry: item.UomEntry || "0",
          VatAppld: item.VatAppld || "0",
          VatGroup: item.VatGroup || "0",
          VatPrcnt: String(item.VatPrcnt || "0"),
          VatSumSy: item.VatSumSy || "0",
          AttcEntry: attachmentDocEntry || data.AttcEntry || "0",
          DedVatSum: item.DedVatSum || "0",
          LineVatlF: item.LineVatlF || "0",
          NumPerMsr: String(item.NumPerMsr || "0"),
          OpenSumFC: item.OpenSumFC || "0",
          SerialNum: item.SerialNum || "0",
          StckAppFc: item.StckAppFc || "0",
          StckAppSc: item.StckAppSc || "0",
          TaxAmount: item.TaxAmount || "0",
          CUSTOMERNum: item.CUSTOMERNum || "0",
          AssblValue: String(item.AssblValue || "0"),
          DedVatSumF: item.DedVatSumF || "0",
          DedVatSumS: item.DedVatSumS || "0",
          InvntSttus: item.InvntSttus || "Y",
          OpenSumSys: item.OpenSumSys || "0",
          ShipToCode: item.ShipToCode || "0",
          StckSumApp: item.StckSumApp || "0",
          StockSumFc: item.StockSumFc || "0",
          StockSumSc: item.StockSumSc || "0",
          TotalSumSy: String(item.TotalSumSy || "0"),
          VatAppldFC: item.VatAppldFC || "0",
          VatAppldSC: item.VatAppldSC || "0",
          FreightCode: item.FreightCode || "0",
          FreightAmount: item.FreightAmount || "0",

          InvQty:
            item.UomCode === "Manual"
              ? String(item.Quantity || 1)
              : String(item.InvQty || "0"),
          OpenInvQty:
            item.UomCode === "Manual"
              ? String(item.Quantity || 1)
              : String(item.OpenInvQty || "0"),
          UOMFactor: item.UOMFactor || "0",
          Width1: item.Width1 || "1",
          BaseQty: item.BaseQty || "10",
          Height1: item.Height1 || "1",
          Length1: item.Length1 || "1",
          VolUnit: item.VolUnit || "0",
          Weight1: item.Weight1 || "1",
          PostTax: String(item.PostTax || "N"),
          Len1Unit: item.Len1Unit || "0",
          Excisable: item.Excisable || "N",
          Hght1Unit: item.Hght1Unit || "1",
          Wdth1Unit: item.Wdth1Unit || "1",
          Wght1Unit: item.Wght1Unit || "1",
          BaseDocNum: item.BaseDocNum || "0",
          BaseOpnQty: item.BaseOpnQty || "10",
          CogsOcrCod: item.CogsOcrCod || "0",
          GPTtlBasPr: item.GPTtlBasPr || "0",
          GrossBuyPr: item.GrossBuyPr || "0",
          LineStatus: item.LineStatus || "0",
          OpenCreQty: item.OpenCreQty || "0",
          OrderedQty: item.OrderedQty || "0",
          ShipToDesc: item.ShipToDesc || "0",
          StockPrice: item.StockPrice || "0",
          StockValue: item.StockValue || "0",
          TaxDistSFC: item.TaxDistSFC || "0",
          TaxDistSSC: item.TaxDistSSC || "0",
          TaxDistSum: item.TaxDistSum || "0",
          CogsAcct: String(item.CogsAcct || "0"),
          ItemType: item.ItemType || "0",
          unitMsr2: String(item.unitMsr2 || "0"),
          UomCode2: String(item.UomCode2 || "0"),
          UomEntry2: item.UomEntry2 || "0",
          DistribSum: item.DistribSum || "0",
          DstrbSumFC: item.DstrbSumFC || "0",
          DstrbSumSC: item.DstrbSumSC || "0",
          GrssProfit: item.GrssProfit || "0",
          ItmTaxType: String(item.ItmTaxType || "0"),
          GrssProfSC: item.GrssProfSC || "0",
          NumPerMsr2: item.NumPerMsr2 || "0",
          PcQuantity: item.PcQuantity || "0",
          ExpApplFC: data.ExpApplFC || "0",
          ExpApplSC: data.ExpApplSC || "0",
          CtlAccount: data.CtlAccount || "0",
          GrssProfFC: data.GrssProfFC || "0",
          TaxOnExApF: data.TaxOnExApF || "0",
          VatDscntPr: data.VatDscntPr || "0",
          DpmAmnt: data.DpmAmnt || "0",
          Rounding: data.Rounding || "0",
          DunnLevel: data.DunnLevel || "0",
          ShipDate: dayjs(item.ShipDate).isValid()
            ? dayjs(item.ShipDate).format("YYYY-MM-DD")
            : "",
          ObjType: data.ObjType || "23",
          TranType: data.TranType || "0",
          BasePrice: data.BasePrice || "0",
          LocCode: matchwhsLoc?.Location || " ",
          oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
            UserId: user.UserId,
            CreatedBy: user.UserName,
            TaxRate: String(taxItem.TaxRate),
            TaxSum: String(taxItem.TaxSum),
            StcCode: String(taxItem.StcCode || "0"),
            BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
            RelateType: "1",
            RelateEntry: taxItem.RelateEntry,
            GroupNum: taxItem.GroupNum || "1",
            ExpnsCode: taxItem.ExpnsCode || "0",
            StaCode: String(taxItem.StaCode || "0"),
            TaxSumFrgn:
              getValues("Currency") === companyData.MainCurncy
                ? "0"
                : taxItem.TaxSumFrgn || "0",
            staType: taxItem.staType || "1",
            TaxAcct: String(taxItem.TaxAcct || "0"),
            TaxSumSys: taxItem.TaxSumSys || "20",
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
            BaseType: taxItem.BaseType || "1",
            BaseAbs: taxItem.BaseAbs || "1",
            BaseSeq: taxItem.BaseSeq || "1",
            DeductTax: taxItem.DeductTax || "0",
            DdctTaxFrg: taxItem.DdctTaxFrg || "0",
            DdctTaxSys: taxItem.DdctTaxSys || "0",
            TaxStatus: String(taxItem.TaxStatus || "0"),
            BaseSumFrgn: taxItem.BaseSumFrgn || "0",
            DeductTaxSys: taxItem.DeductTaxSys || "0",
            BaseApldFC: taxItem.BaseApldFC || "0",
            BaseApldSC: taxItem.BaseApldSC || "0",
            DeductTaxFrg: taxItem.DeductTaxFrg || "0",
            ObjectType: taxItem.ObjectType || "23",
          })),
        };
      }),
      oExpLines: (data.oExpLines || []).map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
        Status:
          String(item.Status) === "1" ||
          String(item.Status) === "0" ||
          String(item.Status) === "3"
            ? String(item.Status)
            : "1",
        ExpnsCode: item.DocEntry,
        DocEntry: item.DocEntry,
        ModifiedBy: user.UserName,
        LineTotal: String(item.LineTotal),
        TaxCode: String(item.TaxCode || "0"),
        VatSum: String(item.VatSum),
        GrsAmount: String(item.GrsAmount),
        ExpnsName: String(item.ExpnsCode || "0"),
        GrsFC:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : item.GrsFC || "0",
        RevAcct: item.RevAcct || "0",
        TotalFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : String(item.TotalFrgn || "0"),
        VatSumFrgn:
          getValues("Currency") === companyData.MainCurncy
            ? "0"
            : item.VatSumFrgn || "0",
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
        Comments: String(item.Comments || "0"),
        DistrbMthd: String(item.DistrbMthd || "0"),
        TaxDistMtd: String(item.TaxDistMtd || "0"),
        TaxStatus: item.TaxStatus || "0",
        BaseApldFC: item.BaseApldFC || "0",
        BaseApldSC: item.BaseApldSC || "0",
        BaseSumFrgn: item.BaseSumFrgn || "0",
        DeductTaxFrg: item.DeductTaxFrg || "0",
        DeductTaxSys: item.DeductTaxSys || "0",
        VatGroup: data.VatGroup || "0",
        TaxType: data.TaxType || "0",
        oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
          UserId: user.UserId,
          CreatedBy: user.UserName,
          TaxRate: String(taxItem.TaxRate),
          TaxSum: String(taxItem.TaxSum),
          StcCode: String(taxItem.StcCode),
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
          BaseType: taxItem.BaseType || "1",
          BaseAbs: taxItem.BaseAbs || "1",
          BaseSeq: taxItem.BaseSeq || "1",
          DeductTax: taxItem.DeductTax || "0",
          DdctTaxFrg: taxItem.DdctTaxFrg || "0",
          DdctTaxSys: taxItem.DdctTaxSys || "0",
          TaxStatus: String(item.TaxStatus || "0"),
          BaseApldFC: item.BaseApldFC || "0",
          BaseApldSC: item.BaseApldSC || "0",
          BaseSumFrgn: item.BaseSumFrgn || "0",
          DeductTaxFrg: item.DeductTaxFrg || "0",
          DeductTaxSys: item.DeductTaxSys || "0",
          ObjectType: item.ObjectType || "23",
        })),
      })), // Assuming this is an array
      oPaymentLines: [],
      oDPLines: [], // Assuming this is an array
      oTaxExtLines: (data.oTaxExtLines || []).map((oTaxExtLines) => ({
        ...oTaxExtLines,
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
      })),
    };

    console.log("+++++++", obj);
    // alert("")
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/SalesQuotation`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearForm();
            setOpenListData([]);
            fetchOpenListData(0);
            handleGetListClear();
            setClearCache(true);
            Swal.fire({
              title: "Success!",
              text: " Sales Quotation saved Successfully",
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
            });
          }
        })
        .catch((error) => {
          console.error("Error Post time", error);
          if (attachmentDocEntry > "0") {
            apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          }
          Swal.fire({
            title: "Error!",
            text: "something went wrong" + error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
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
            .put(`/SalesQuotation/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                setOpenListData([]);
                setOpenListPage(0);
                fetchOpenListData(0);
                handleGetListClear();
                ClearForm();
                setClearCache(true);
                Swal.fire({
                  title: "Success!",
                  text: "Attachment Sales Quotation Updated",
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
            text: "Attachment Sales Quotation Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
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
    try {
      setapiloading(true);
      apiClient
        .get(`/SalesQuotation/${DocEntry}`)
        .then((response) => {
          if (!response.data || !response.data.values) {
            return;
          }
          const item = response.data.values;
          setSystemUpdateRate(item.SysRate);
          setDocumentUpdateRate(item.DocRate);
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
            NumAtCard: item.NumAtCard,
            DfltAddress: item.Address2,
            Address: item.Address,
            PayToCode: item.PayToCode,
            ShipToCode: item.ShipToCode,
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
              PriceBefDi: element.PriceBefDi,
              WHSCode: element.WHSCode,
              UomCode: element.UomCode,
              AssblValue: String(element.AssblValue),
              DiscPrcnt: element.DiscPrcnt,
              TaxCode: element.TaxCode,
              PostTax: String(element.PostTax || "0"),
              Excisable: String(element.Excisable || "0"),
              VatGroup: element.VatGroup || "",
              OnHand: element.OnHand,
              OpenQuantity: element.OpenQuantity,
              VatSum: element.VatSum,
              IsCommited: element.IsCommited,
              LineNum: element.LineNum || "",
              LineTotal: element.LineTotal,
              UomEntry2: element.UomEntry2 || "",
              LocCode: getLocationName(element.LocCode),
              OnOrder: element.OnOrder || 0,
              AcctCode: String(element.AcctCode || 0),
              ExpnsName: element.ExpnsName,
              TotalExpns: element.TotalExpns,
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
                ExpnsCode: taxItem.ExpnsCode || "1001",
                StaCode: taxItem.StaCode || "",
                staType: taxItem.staType || "1",
                TaxAcct: taxItem.TaxAcct || "",
                TaxSumFrgn: taxItem.TaxSumFrgn || "",
                TaxSumSys: taxItem.TaxSumSys || "",
                BaseSumFrg: taxItem.BaseSumFrg || "0",
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
          setValue("ZipcodeB", item.oTaxExtLines[0].ZipCodeB);
          setValue("BlockS", item.oTaxExtLines[0].BlockS);
          setValue("StreetS", item.oTaxExtLines[0].StreetS);
          setValue("CityS", item.oTaxExtLines[0].CityS);
          setValue("StateS", item.oTaxExtLines[0].StateS);
          setValue("CountryS", item.oTaxExtLines[0].CountryS);
          setValue("ZipcodeS", item.oTaxExtLines[0].ZipCodeS);
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
          setapiloading(false);
        });
    } finally {
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCancelledListSearch = (query) => {
    setCancelledListQuery(query);
    setCancelListPage(0);
    setCancelListSearching(true);
    setCancelledListData([]);
    timeoutRef.current = setTimeout(() => {
      fetchCancelledListData(0, query);
    }, 400);
  };

  const handleCancelledListClear = () => {
    setCancelledListQuery("");
    setCancelListPage(0);
    setCancelListSearching(false);

    setCancelledListData([]); // Clear data
    fetchCancelledListData(0);
  };

  const fetchMoreCancelledListData = () => {
    fetchCancelledListData(
      cancelListPage + 1,
      cancelListSearching ? cancelledListquery : "",
    );
    setCancelListPage((prev) => prev + 1);
  };

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
      label: "Close",
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
      fetchMore: fetchMoreCancelledListData,
      handleSearch: handleCancelledListSearch,
      handleClear: handleCancelledListClear,
    },
  ];

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
          .put(`/SalesQuotation/Cancel/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              ClearForm();
              setOpenListData([]);
              fetchOpenListData(0);
              fetchCancelledListData(0);
              fetchClosedListData(0);
              Swal.fire({
                text: "Sales Quotation Cancel",
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
          text: "Sales Quotation Not Canceled",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const handleOnDocClose = () => {
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
          .put(`/SalesQuotation/Close/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              ClearForm();
              setOpenListData([]);
              fetchOpenListData(0);
              fetchCancelledListData(0);
              fetchClosedListData(0);
              Swal.fire({
                text: "Sales Quotation Close",
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
          text: "Sales Quotation Not Close",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
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
          Sales Quotation List
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
      {apiloading && <Loader open={apiloading} />}

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
                    item.BalInvntAc,
                  )
                }
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
      {/* ------------Items Column(Search Item)------------ */}

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

      {/* ------------Service Column(Search Service)------------ */}
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
                  rowHeight={35}
                  className="datagrid-style"
                  // isRowSelectable={(params) => {
                  //   return !allFormData.oExpLines.some(
                  //     (selected) => selected.DocEntry === params.row.DocEntry
                  //   );
                  // }}
                  rows={frieghtdata}
                  columns={FrightSeletColumns}
                  getRowId={(row) => row.DocEntry}
                  // hideFooter
                  initialState={{
                    pagination: { paginationModel: { pageSize: 8 } },
                    filter: {
                      filterModel: {
                        items: [],
                        quickFilterValues: [], // Default empty
                      },
                    },
                  }}
                  disableColumnFilter
                  disableColumnSelector
                  disableDensitySelector
                  slots={{ toolbar: GridToolbar }} // Enables search & export
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
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

      {/* ============Freight Modal/Dialog============ */}
      {/* <FrieghtModel
        open={frieghtopen}
        closeModel={handleFrightClose}
        onSubmit={handleFrightSubmit}
        isLoading={isLoading}
        title="FREIGHT"
        columns={FrieghtCol}
        SelectFreight={SelectFreight}
        rows={getValues("oExpLines").map((data, index) => ({
          ...data,
          id: index,
        }))}
        getRowId={(row) => row.id}
        curSource={curSource}
        Currency={getValues("Currency")}
      /> */}

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

      {/* =============================================================== */}

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
            onClick={handleClick}
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
            <MenuItem
              disabled={SaveUpdateName === "SAVE" || tab === "1" || tab === "2"}
              onClick={() => {
                handleOnDocClose();
                handleClose();
              }}
            >
              <ListItemIcon>
                <DoNotDisturbAltSharpIcon
                  fontSize="small"
                  color="inherit"
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
              Sales Quotation
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
                      rules={{ required: "Please Select Code" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="CUSTOMER CODE"
                          readOnly={true}
                          disabled={!!DocEntry}
                          onChange={OpenDailog}
                          onClick={() => {
                            OpenDailog();
                          }}
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
                      title="Select CUSTOMER/Supplier"
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
                      rules={{ required: "Customer Name Is Required" }}
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
                          label="CUSTOMER REF.NO."
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
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="VALID UNTIL"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          minDate={getValues("DocDate")}
                          onChange={(date) =>
                            setValue("DocDueDate", date, { shouldDirty: true })
                          }
                          disabled={
                            !getValues("DocDate") ||
                            allFormData.Status === "Closed" ||
                            allFormData.Status === "Cancelled"
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
                          label="DOCUMENT DATE"
                          name={field.name}
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
                            setType(e.target.value);

                            // Prepare updated data and reset form
                            const updatedData = {
                              ...currentData,
                              oLines: [], // Reset the oLines
                              Currency: control._formValues.Currency,
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
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DataGrid
                              key={type}
                              className="datagrid-style"
                              apiRef={apiRef}
                              rows={getValues("oLines").map((data, index) => ({
                                ...data,
                                id: index,
                              }))}
                              getRowId={(row) => row.id}
                              columns={columns}
                              editMode="cell"
                              experimentalFeatures={{ newEditingApi: true }}
                              columnHeaderHeight={35}
                              rowHeight={40}
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
                                if (params.field === "taxCategory")
                                  return false;
                                if (
                                  params.row.Status === "0" ||
                                  params.row.Status === "3"
                                )
                                  return false;
                                return true;
                              }}
                              sx={gridSx}
                            />
                          </LocalizationProvider>
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
                                    field.onChange(selectedValue); // Update form state
                                    handleAddress(selectedValue); // Handle additional logic
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
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      DialogOpenShipto();
                                    }
                                  }}
                                  error={!!error}
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
                                  type="text"
                                  rows={2}
                                  multiline
                                  {...field}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      DialogOpenPayto();
                                    }
                                  }}
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
                        rules={{ required: "This Field Require" }}
                        defaultValue={0} // Set default value to 0
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="SALES EMP"
                            data={[
                              {
                                key: 0,
                                value: "NO Emp",
                              },
                              ...salesemp.map((item) => {
                                return {
                                  key: item.SlpCode,
                                  value: item.SlpName,
                                };
                              }),
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
                            type="number"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            disabled={
                              allFormData.Status === "Closed" ||
                              allFormData.Status === "Cancelled" ||
                              type === "I"
                                ? Quantity !== OpenQuantity
                                : ""
                            }
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
                              field.onBlur(e); // Call the original field onBlur first
                              handleDiscountAmtChange(e); // Then call your custom handler
                            }}
                          />
                        )}
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
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
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
                            label="ROUNDING DIFF. AMOUNT"
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
                      md={4}
                      sm={6}
                      lg={3}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Comments"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="REMARKS"
                            type="text"
                            rows={2}
                            multiline
                            {...field}
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
