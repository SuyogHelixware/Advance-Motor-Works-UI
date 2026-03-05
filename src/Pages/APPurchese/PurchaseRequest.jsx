import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DoNotDisturbAltSharpIcon from "@mui/icons-material/DoNotDisturbAltSharp";
import AssessmentIcon from "@mui/icons-material/Gavel";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ListAltIcon from "@mui/icons-material/ListAlt"; // For Contents
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
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useItemServiceList } from "../../Hooks/useItemServiceList";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CalCulation, { toMinOne } from "../Components/CalCulation";
import CardComponent from "../Components/CardComponent";
import DataGridModal from "../Components/DataGridModal";
import {
  InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
  SelectedDatePickerField,
  SmallInputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import PrintMenu from "../Components/PrintMenu";
import SearchInputField from "../Components/SearchInputField";
import SearchModel, { SearchBPModel } from "../Components/SearchModel";
import { getStatus } from "../Components/status";
import TableGridFrieght from "../Components/TableGridFrieght";
import TaxCategoryModel from "../Components/TaxCategoryModel";
import TaxDatagridCellModel from "../Components/TaxDatagridCellModel";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
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
    field: "BaseSum",
    headerName: "Base Amount",
    width: 120,
    editable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "TaxSum",
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
const initialState = {
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
function PurchaseRequest() {
  const theme = useTheme();
  const timeoutRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, warehouseData, companyData } = useAuth();
  const perms = usePermissions(131);
  const [tabvalue, settabvalue] = useState(0);
  let [ok, setok] = useState("OK");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clearCache, setClearCache] = useState(false);

  const [tab, settab] = useState("0");
  const [DepartMent, setDepartMent] = useState([]);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [frieghtopen, setFrieghtopen] = useState(false);
  const [openFreight, setopenFreight] = useState(false);
  const [loading, setLoading] = useState(false);
  const [UomCodeList, SetUomCode] = useState([]);
  const [RollBackoExpLines, setRollBackoExpLines] = useState([]);
  const [taxcode, setTaxCode] = useState([]);
  const [FrieghtTax, setTaxFrieght] = useState([]);
  const [oldOpenData, setSelectData] = useState(null);
  const [frieghtdata, setFrieght] = useState([]);
  const [type, setType] = useState("I");
  const [open, setOpen] = useState(false);
  const [serviceopen, setServiceOpen] = useState(false);
  const LIMIT = 20;
  const [isLoading, setIsLoading] = useState(true);
  // =============================Tax Componenet State=====================================
  const [openTax, setTaxOpen] = useState(false);
  const [TaxgetListData, setTaxGetListData] = useState([]);
  const [taxCurrentPage, setTaxCurrentPage] = useState(0);
  const [taxSearchText, setTaxSearchText] = useState("");
  const [taxRowCount, setTaxRowCount] = useState(0);
  const [taxcategoryopen, setTaxCategoryOpen] = useState(false);
  const [oTaxLineCategory, setoTaxLineCategory] = useState([]);
  // ==================================End Tax Componenet===============================================
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
  //=========================================Vendor State================================================================
  const [VendorgetListData, setVendorGetListData] = useState([]);
  const [VendorgetListPage, setVendorGetListPage] = useState(0);
  const [VendorhasMoreGetList, setVendorHasMoreGetList] = useState(true);
  const [VendorgetListquery, setVendorGetListQuery] = useState("");
  const [VendorgetListSearching, setVendorGetListSearching] = useState(false);
  const [openVendorList, setVendorOpen] = useState(false);
  const apiRef = useGridApiRef();

  const OpenVendorModel = () => {
    setVendorOpen(true);
  };
  const CloseVendorModel = () => setVendorOpen(false);
  //=========================================WhscCode List================================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);

  // =======================================================================
  const [openUomCode, setUomcodeOpen] = useState(false);
  // const [UomCodegetListData, setUomCodeGetListData] = useState([]);
  // const [UomCodegetListPage, setUomCodeGetListPage] = useState(0);
  // const [UomCodehasMoreGetList, setUomCodeHasMoreGetList] = useState(true);
  // const [UomCodergetListquery, setUomCodeGetListQuery] = useState("");
  // const [UomCodegetListSearching, setUomCodeGetListSearching] = useState(false);
  //! ==============CANCEL LIST===============
  const [cancelledListData, setCancelledListData] = useState([]);
  const [cancelListPage, setCancelListPage] = useState(0);
  const [cancelListSearching, setCancelListSearching] = useState(false);
  const [cancelledListquery, setCancelledListQuery] = useState("");
  const [hasMoreCancelled, setHasMoreCancelled] = useState(true);
  const [PrintData, setPrintData] = useState([]);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const Openmenu = Boolean(anchorEl);

  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const handleClickCancelClosed = (event) => {
    setAnchorEl(event.currentTarget);
  };
  let handleCloseCancelClosed = () => {
    setAnchorEl(null);
  };
  let status = getStatus("1");
  const initialFormData = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    Status: status,
    DocDate: dayjs(undefined).format("YYYY-MM-DD"),
    DocDueDate: dayjs(undefined).format("YYYY-MM-DD"),
    TaxDate: dayjs(undefined).format("YYYY-MM-DD "),
    ReqDate: "",
    ReqType: "12",
    Requester: user.UserId,
    ReqName: user.UserName,
    Department: "",
    Notify: "Y",
    DocNum: "",
    Email: "alice@gmail.com",
    Branch: "1",
    Volume: "0",
    Series: "",
    Weight: "0",
    TotalExpns: ValueFormatter("0"),
    VatSum: "0",
    DocTotal: "0",
    Comments: "",
    AttcEntry: "0",
    DocType: "I",
    InvntSttus: "1",
    DocCur: "KWD",
    DocRate: "1",
    DocTotalSy: "0",
    DocTotalFC: "0",
    PaidToDate: "0",
    PaidFC: "0",
    GrosProfit: "0",
    GrosProfFC: "0",
    PartSupply: "Y",
    ShowSCN: "Y",
    CurSource: "Y",
    SysRate: "1",
    VatSumSy: "0",
    DiscSumSy: "0",
    PaidSys: "0",
    GrosProfSy: "0",
    VolUnit: "0",
    WeightUnit: "0",
    VatPaid: "0",
    VatPaidFC: "0",
    VatPaidSys: "0",
    TotalExpFC: "0",
    TotalExpSC: "0",
    TaxOnExp: "0",
    TaxOnExpFc: "0",
    TaxOnExpSc: "0",
    TaxOnExAp: "0",
    TotalBefDisc: "0",
    oLines: [],
    oExpLines: [],
    oPaymentLines: [],
    oTaxExtLines: [
      {
        LineNum: "",
        DocEntry: "",
        UserId: "",
        CreatedBy: "",
        CreatedDate: "",
        ModifiedBy: "",
        ModifiedDate: "",
        Status: "",
        TaxId0: "",
        TaxId1: "",
        State: "",
        NfRef: "",
        ObjectType: "1470000113",
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
    formState,
  } = useForm({
    defaultValues: initialFormData,
  });
  const { dirtyFields } = formState;

  const currentData = getValues();
  const allFormData = getValues();

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/1470000113`,
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
  // const FrieghtCol = [
  //   {
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
  //     field: "LineTotal",
  //     headerName: "FREIGHT NET AMT",
  //     width: 120,
  //     sortable: false,
  //     editable: false, // Set to true to allow editing
  //     renderCell: (params) => (
  //       <ModelInputText
  //         name="LineTotal"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleFreight(e, params.row)}
  //       />
  //     ),
  //   },
  //   {
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
  //     field: "VatSum",
  //     headerName: "TOTAL TAX AMT",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <ModelInputText
  //         name="VatSum"
  //         readOnly={true}
  //         type="number"
  //         value={params.value}
  //         onChange={(e) => handleFreight(e, params.row)}
  //       />
  //     ),
  //   },
  //   {
  //     field: "GrsAmount",
  //     headerName: "GROSS AMT",
  //     width: 150,
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
  //     width: 100,
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
  // const Items = [
  //   {
  //     id: 1,
  //     field: "id",
  //     headerName: "LINE NO",
  //     width: 50,
  //     renderCell: (params) => <Typography>{params.id + 1}</Typography>,
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
  //     field: "LineVendor",
  //     headerName: "Vendor",
  //     width: 180,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name="LineVendor"
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               {...field}
  //               value={params.value}
  //               onChange={(e) => {
  //                 field.onChange(e);
  //                 handleChange(e, params.row);
  //               }}
  //               error={!!error}
  //               helperText={error?.message}
  //               InputProps={{
  //                 readOnly: true,
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         setValue("selectedRowIndex", params.row.id);
  //                         OpenVendorModel();
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
  //     field: "PQTReqdate",
  //     headerName: "Required Date",
  //     width: 170,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputDatePickerFields
  //         name="PQTReqdate"
  //         value={params.value ? dayjs(params.value) : undefined}
  //         onChange={(date) =>
  //           handleChange(
  //             {
  //               target: {
  //                 name: "PQTReqdate",
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
  //     headerName: "Required QTY.",
  //     width: 140,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="Quantity"
  //         type="number"
  //         disabled={
  //           params.row.Status === "0" ||
  //           params.row.Quantity !== params.row.OpenQuantity
  //         }
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //       />
  //     ),
  //   },

  //   {
  //     field: "PriceBefDi",
  //     headerName: "Info Price",
  //     sortable: false,
  //     width: 130,
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
  //     field: "LineTotal",
  //     headerName: "TOTAL(LC)",
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
  //     //  type: "text",
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
  //     renderCell: (params) => <span>{params.id + 1}</span>,
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
  //     field: "PQTReqdate",
  //     headerName: "Required Date",
  //     width: 170,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputDatePickerFields
  //         name="PQTReqdate"
  //         value={params.value ? dayjs(params.value) : undefined}
  //         onChange={(date) =>
  //           handleChange(
  //             {
  //               target: {
  //                 name: "PQTReqdate",
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
  //     field: "LineVendor",
  //     headerName: "Vendor",
  //     width: 170,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name={`LineVendor_${params.row.id}`} // Unique name per row
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               {...field}
  //               name={`LineVendor_${params.row.id}`}
  //               value={field.value || params.value || ""}
  //               onChange={(e) => {
  //                 field.onChange(e); // Update form state
  //                 handleChange(e, params.row);
  //                 setVendorOpen(true);
  //               }}
  //               error={!!error}
  //               helperText={error?.message}
  //               InputProps={{
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         setValue("selectedRowIndex", params.row.id);
  //                         OpenVendorModel();
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
  //     field: "PriceBefDi",
  //     headerName: "Info Price",
  //     sortable: false,
  //     width: 130,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="PriceBefDi"
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
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
  //     width: 140,
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
  //     field: "LineTotal",
  //     headerName: "TOTAL(LC)",
  //     type: "number",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="LineTotal"
  //         value={params.value}
  //         onChange={(e) => handleChange(e, params.row)}
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
      field: "LineTotal",
      headerName: "FREIGHT NET AMT",
      width: 200,
      editable: true,
      headerAlign: "center",
      align: "center",
      type: "number",
      valueFormatter: (value, row) =>
        `${companyData.MainCurncy} ${Number(value).toFixed(2)}`,
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
      field: "VatSum",
      headerName: "TOTAL TAX",
      width: 160,
    },
    {
      field: "GrsAmount",

      headerName: "GROSS AMT",
      width: 180,
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
    },
    {
      field: "LineVendor",
      headerName: "Vendor",
      width: 150,
      sortable: false,
      editable: false,
      renderCell: (params) => {
        const rowIndex = params.row.id;
        let hasLineVendor = !!params.row.LineVendor;
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
                  LineVendor: "",
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

                if (params.row.Status === "0" || hasLineVendor) return;
                setValue("selectedRowIndex", rowIndex);
                OpenVendorModel();
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
                {params.row.LineVendor || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  OpenVendorModel();
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
      field: "Quantity",
      headerName: "REQUIRED QTY",
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
      valueFormatter: (value, row) =>
        `${row.Currency || companyData.MainCurncy} ${Number(
          value ?? row.PriceBefDi ?? 0,
        ).toFixed(2)}`,
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
      field: "LineTotal",
      headerName: "TOTAL(LC)",
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
      field: "LineVendor",
      headerName: "Vendor",
      width: 150,
      sortable: false,
      editable: false,
      renderCell: (params) => {
        const rowIndex = params.row.id;
        let hasLineVendor = !!params.row.LineVendor;
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
                  LineVendor: "",
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
                  hasLineVendor
                )
                  return;
                setValue("selectedRowIndex", rowIndex);
                OpenVendorModel();
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
                {params.row.LineVendor || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  OpenVendorModel();
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
            container
            alignItems="center"
            justifyContent="center"
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
      field: "LineTotal",
      headerName: "TOTAL(LC)",
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
    [type],
  );
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const OpenDailog = () => {
    setSearchmodelOpen(true);
    handleGetListClear();
  };
  const SearchModelClose = () => {
    setSearchmodelOpen(false);
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

  //#region  Open Tab
  // order List For OPEN Tab
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/PurchaseRequest/Search/${searchTerm}/1/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(
          `/PurchaseRequest/Pages/1/${pageNum}/20`,
        );
      }
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
      Swal.fire({
        toast: true,
        icon: "error",
        title: error,
        position: "top-end",
        // showConfirmButton: false,
        // timer: 3000,
        timerProgressBar: true,
      });
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
          `/PurchaseRequest/Search/${searchTerm}/0/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(
          `/PurchaseRequest/Pages/0/${pageNum}/20`,
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
      Swal.fire({
        toast: true,
        icon: "error",
        title: error,
        position: "top-end",
        // showConfirmButton: false,
        // timer: 3000,
        timerProgressBar: true,
      });
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
          `/PurchaseRequest/Search/${searchTerm}/3/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(
          `/PurchaseRequest/Pages/3/${pageNum}/20`,
        );
      }
      if (response.data.success === true) {
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
      Swal.fire({
        toast: true,
        icon: "error",
        title: error,
        position: "top-end",
        // showConfirmButton: false,
        // timer: 3000,
        timerProgressBar: true,
      });
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
  // =========================

  //#region  SEarching List Vendor
  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/Users/search/${searchTerm}/1/${pageNum}/20`,
        );
      } else {
        response = await apiClient.get(`/Users/pages/1/${pageNum}`);
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
      Swal.fire({
        toast: true,
        icon: "error",
        title: error,
        position: "top-end",
        // showConfirmButton: false,
        // timer: 3000,
        timerProgressBar: true,
      });
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
  const fetchVendorGetListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/BPV2/V2/ByCardType/Pages/v/${searchTerm}/1/${pageNum}`,
        );
      } else {
        response = await apiClient.get(
          `/BPV2/V2/ByCardType/Pages/v/1/${pageNum}`,
        );
      }
      if (response.data.success) {
        const newData = response.data.values;
        setVendorHasMoreGetList(newData.length === 20);
        setVendorGetListData((prev) =>
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
  const handleVendorGetListSearch = (res) => {
    setVendorGetListQuery(res);
    setVendorGetListSearching(true);
    setVendorGetListPage(0);
    setVendorGetListData([]);
    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchVendorGetListData(0, res);
    }, 600);
  };
  const handleVendorGetListClear = () => {
    setVendorGetListQuery("");
    setVendorGetListSearching(true);
    setVendorGetListPage(0); // Reset page to 0
    setVendorGetListData([]); // Clear current data
    fetchVendorGetListData(0); // Fetch first page without search
  };
  const fetchVendorMoreGetListData = () => {
    fetchVendorGetListData(
      VendorgetListPage + 1,
      VendorgetListSearching ? VendorgetListquery : "",
    );
    setVendorGetListPage((prev) => prev + 1);
  };
  useEffect(() => {
    fetchVendorGetListData(0); // Load first page on mount
  }, []);

  const onSelectVendor = async (LineVendor) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    const olines = getValues("oLines");
    const lines = olines[currentRowIndex];
    setValue("Lines", lines);
    console.log("select vendor", lines.LineVendor);
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          LineVendor,
        };
      }
      return line;
    });
    reset({
      ...getValues(),
      oLines: updatedLines,
    });
    setWhscOpen(false);
  };

  const fetchWhscGetListData = async (pageNum, searchTerm = "") => {
    try {
      let response;
      if (searchTerm) {
        response = await apiClient.get(
          `/WarehouseV2/search/${searchTerm}/1/${pageNum}`,
        );
      } else {
        response = await apiClient.get(`/WarehouseV2/pages/1/${pageNum}/20`);
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
      Swal.fire({
        toast: true,
        icon: "error",
        title: error,
        position: "top-end",
        // showConfirmButton: false,
        // timer: 3000,
        timerProgressBar: true,
      });
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

  const onSelectUser = async (DocEntry, UserName, Department) => {
    // const { data } = await apiClient.get(`/Users/${DocEntry}`);
    try {
      setValue("Requester", DocEntry);
      setValue("ReqName", UserName);
      setValue("Department", Department);
      SearchModelClose();
    } catch (error) {
      // Swal.fire("Error!", data.message, "warning");
    }
  };

  // ------------------------------------------------------------------------------------------------------------------------

  const handleFright = () => {
    setFrieghtopen(true);
    // freightdata()
  };

  // ------------------------------------------------------------------------------------------------------------------------
  const handleDeleteRow = (id) => {
    const updatedLines = getValues("oLines").filter((_, index) => index !== id);
    setok("UPDATE");
    setValue("oLines", updatedLines, {
      shouldDirty: true,
      shouldValidate: false,
    });

    //  if (discPercent > 0) {
    //     calculateDiscountAmt(discPercent);
    //   }
  };
  const handleClose = () => {
    setServiceOpen(false);
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
  //Department Drop Down Select Field Logic
  const FetchDepartment = async () => {
    try {
      const res = await apiClient.get(`/Department/Pages/1`);
      const response = res.data;
      if (response.success === true) {
        setDepartMent(response.values);
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
    "1470000113",
    getValues("DocDate"),
    setValue,
    clearCache,
    SaveUpdateName,
  );

  useEffect(() => {
    taxCodedata();
    TaxCodeFrieght();
    freightdata();
    FetchDepartment();
  }, []);

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
  const selectWhSCode = async (WHSCode, Location, LocationName) => {
    // Get the currently selected row's index
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          WHSCode: WHSCode,
          LocCode: Location, // Add LocCode from matching row, default to empty if not found
          LocationName: LocationName,
        };
      }
      return line;
    });
    reset({
      ...allFormData,
      oLines: updatedLines,
    });
    setWhscOpen(false);
  };

  const selectUomCode = async (UomCode, UomEntry, UomName, AltQty, BaseQty) => {
    setok("UPDATE");
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
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
        const NumPerMsr = initnum / newnum;
        const oInvNumPerMsr = ValueFormatter(oBaseNum / newnum, 6);
        const InvQty = ValueFormatter(oInvNumPerMsr * line.Quantity, 6);
        const newPriceBefDi = ValueFormatter(NumPerMsr * line.PriceBefDi, 6);
        const NewLineTotal = ValueFormatter(newPriceBefDi * line.Quantity);
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
          parseFloat(Price) + parseFloat(Price) * (VatPrcnt / 100);
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
          // Discount: "",
          // oTaxLine: oTaxLine,
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
    // calculateDiscountAmt(discPercent);

    setUomcodeOpen(false);
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
    const currentRowIndex = getValues("selectedRowIndex");
    setok("UPDATE");
    // setselectRowTax(currentRowIndex)
    const lines = getValues("oLines");
    const updatedLines = lines.map((line, index) => {
      if (index !== currentRowIndex) return line;
      // Create a new updated object with selected TaxCode
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
        taxLines.oTaxLines.reduce(
          (sum, curr) => sum + parseFloat(curr.TaxSum),
          0,
        ),
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
    TaxCloseModel(false);
  };

  const onSubmit = (data) => {
    const updatedData = {
      ...allFormData,
      oLines: [...allFormData.oLines, ...selectedRows],
    };
    reset(updatedData);
    closeModel();
    handleClose();
  };

  const handleCellClick = async (ids) => {
    const selectedIDs = new Set(ids);
    // ALL currently selected DocEntry IDs (across pages)
    // 1. Filter only selected rows from current page
    const selectedRows = itemList
      .filter((row) => selectedIDs.has(row.DocEntry))
      .map((data) => ({
        DocEntry: data.DocEntry,
        ItemCode: data.ItemCode,
        ItemName: data.ItemName,
        ChapterID: data.ChapterID,
        Price: data.Price,
        Quantity: 1,
        OpenQuantity: 1,
        AssblValue: data.AssblValue,
        Discount: 0,
        LineTotal: data.Price,
        PriceBefDi: data.Price,
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
        PQTReqdate: watch("ReqDate"),
        Status: "1",
        Excisable: data.Excisable,
        PostTax: data.GSTRelevnt,
        NumInBuy: data.NumInBuy,
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
          data.PUOMFactor > 0 ? data.UOMFactor / data.PUOMFactor : "1.000000",
          6,
        ),
      }));

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
  const handleServiceRowClick = (id) => {
    const selectedIDs = new Set(id);
    const selectedRow = serviceList
      .filter((row) => selectedIDs.has(row.DocEntry))
      .map((data) => ({
        ServCode: data.ServCode,
        ItemName: data.ServName,
        LineTotal: data.Price || 0,
        Quantity: "1",
        AssblValue: 0,
        PQTReqdate: dayjs(undefined).format("YYYY-MM-DD ") || undefined,
        Status: "1",
      }));
    setSelectedRows(selectedRow);
  };

  const handleFrightCellClick = (id) => {
    const selectedIDs = new Set(id);
    const selectedRow = frieghtdata
      .filter((row) => selectedIDs.has(row.DocEntry))
      .map((data) => ({
        RevAcct: data.RevAcct,
        // ExpnsName: data.DocEntry,
        LineTotal: data.LineTotal || 0,
        VatSum: ValueFormatter(data.VatSum),
        TaxCode: data.TaxCode || 0,
        GrsAmount: ValueFormatter(data.GrsAmount || 0),
        DocEntry: data.DocEntry, // Add DocEntry for reference
        Status: "1",
        // Currency: companyData.MainCurncy,
      }));
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
      oTaxLines: [],
      TaxCode: TaxCode || "",
      VatPrcnt: 0,
    };
    if (TaxCode) {
      updatedData.TaxCode = TaxCode;
    }
    const taxcodeObj = taxcode.find((item) => item.DocEntry === TaxCode);
    if (taxcodeObj) {
      let oTaxLines = [];

      if (AssblValue <= 0) {
        Quantity = 1;
      }
      let variables = {
        LineTotal: LineTotal,
        Quantity: Quantity,
        AssblValue: AssblValue > 0 ? AssblValue : LineTotal,
        DocTotal: DocTotal,
        UnitPrice: UnitPrice,
        RelaTeType: 1,
      };
      let finalTotal = 0;
      taxcodeObj.oLines.forEach((tax) => {
        let TaxFormula = tax.BaseAmtFormuale;
        let TaxAmtKey = tax.TaxAmtKey;
        let staCode = tax.TaxType;
        let LineNum = tax.LineNum;
        let TaxAcct = tax.PurchTax;
        let Rate = Number.parseFloat(tax.Rate);
        // Replace variables in TaxFormula with the corresponding values
        for (const key in variables) {
          TaxFormula = TaxFormula.replace(key, variables[key]);
        }
        // Evaluate TaxFormula and calculate the TaxAmt
        const TaxAmt = eval(TaxFormula) * (Rate / 100);
        variables = { ...variables, [TaxAmtKey]: ValueFormatter(TaxAmt) };
        // Accumulate the TotalTax
        variables.TotalTax = (variables.TotalTax || 0) + TaxAmt;
        // Create tax object for the oTaxLine
        updatedData.VatPrcnt += Rate;
        const taxObj = {
          TaxRate: Rate,
          TaxSum: TaxAmt.toFixed(3),
          StcCode: taxcodeObj.DocEntry,
          staType: staCode,
          StaCode: TaxAmtKey.replace(/_?TaxAmt$/, ""),
          BaseSum: parseFloat(eval(TaxFormula)).toFixed(3),
          TaxAcct: TaxAcct,
          RelateType: 1,
          RelateEntry: LineNum,
        };
        oTaxLines.push(taxObj);
      });

      // Update final total VAT sum
      finalTotal += variables.TotalTax || 0;
      updatedData.VatSum = finalTotal;
      updatedData.oTaxLines = oTaxLines;
    }

    return updatedData;
  }

  // const handleFreight = (e, row) => {
  //   const { name, value } = e.target;
  //   // Update the specific field in oLines
  //   const updatedLines = getValues("oExpLines").map((data, index) => {
  //     if (row.id !== index) return data;
  //     const updatedData = { ...data, [name]: value };
  //     if (name === "LineTotal") {
  //       updatedData.LineTotal = Math.min(Math.max(value, 0));
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
  //     const VatSumF = taxFright.oTaxLines.reduce(
  //       (sum, curr) => sum + parseFloat(curr.TaxSum),
  //       0
  //     );
  //     updatedData.oTaxLines = oTaxLinesF;
  //     updatedData.VatSum = ValueFormatter(VatSumF);
  //     updatedData.GrsAmount = ValueFormatter(
  //       parseFloat(updatedData.VatSum) + parseFloat(updatedData.LineTotal)
  //     );
  //     return updatedData;
  //   });

  //   // setValue("oExpLines",updatedLines)
  //   reset({ ...allFormData, oExpLines: updatedLines });
  // };
  console.log("allform dfds", allFormData.oExpLines);
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
  };

  let handleFrightSubmit = (data) => {
    const TotalExpns = data.oExpLines.reduce((sum, current) => {
      return sum + parseFloat(current.LineTotal);
    }, 0);
    const TaxOnExp = data.oExpLines.reduce((sum, current) => {
      const vat = parseFloat(current?.VatSum) || 0; // Handle NaN, null, undefined
      return sum + vat;
    }, 0);
    reset({ ...allFormData, oExpLines: data.oExpLines });
    setValue("TaxOnExp", TaxOnExp);
    setValue("TotalExpns", ValueFormatter(TotalExpns));
    setRollBackoExpLines(data.oExpLines);
    // handleFrightClose();
    setFrieghtopen(false);
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

  const handleChangeDatereq = (ReqDate) => {
    if (!ReqDate) return;

    const lines = getValues("oLines");

    if (lines.length === 0) return;

    Swal.fire({
      text: "Do you want to update the existing table rows with the new required date?",
      icon: "warning",
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        const formattedDate = dayjs(ReqDate).format("YYYY-MM-DD");

        const updatedLines = lines.map((row) => ({
          ...row,
          PQTReqDate: formattedDate, // ✅ CORRECT FIELD
        }));

        reset({
          ...getValues(),
          ReqDate: formattedDate, // keep header in sync
          oLines: updatedLines,
        });
      }
    });
  };

  const handleChange = (e, row) => {
    const { name, value } = e.target;
    setok("UPDATE");
    const updatedLines = getValues("oLines").map((data, index) => {
      if (row.id !== index) return data;
      const updatedData = { ...data, [name]: value };
      if (allFormData.DocEntry) {
        if (name === "Quantity") {
          updatedData.OpenQuantity =
            Number(updatedData.Quantity) -
            Number(data.Quantity) +
            Number(data.OpenQuantity);
        }
      } else {
        if (name === "Quantity") {
          updatedData.OpenQuantity = value;
          updatedData.Quantity = value;
          updatedData.InvQty = ValueFormatter(value * updatedData.NumPerMsr, 6);
        }
      }
      if (name === "PriceBefDi") {
        updatedData.PriceBefDi = Math.min(Math.max(value, 0));
      }

      if (name === "Discount") {
        updatedData.Discount = Math.min(Math.max(value, 0), 100);
      }

      if (name === "LineVendor") {
        updatedData.LineVendor = "";
      }

      if (updatedData.GSTRelevnt === "Y") {
        if (name === "AssblValue") {
          updatedData.AssblValue = Math.min(Math.max(value, 0));
        }
      } else {
        updatedData.AssblValue = data.AssblValue;
      }
      const CalcLines = CalCulation(
        updatedData.Quantity,
        updatedData.PriceBefDi,
        updatedData.Discount,
      );
      updatedData.LineTotal = ValueFormatter(CalcLines.LineTotal);
      updatedData.Price = CalcLines.discountedPrice;

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

      updatedData.InvQty = ValueFormatter(
        updatedData.NumPerMsr * updatedData.Quantity,
        6,
      );
      updatedData.OpenInvQty = updatedData.InvQty;
      updatedData.oTaxLines = taxLines.oTaxLines;
      updatedData.VatPrcnt = taxLines.VatPrcnt;
      updatedData.VatSum = taxLines.oTaxLines.reduce(
        (sum, curr) => sum + parseFloat(curr.TaxSum),
        0,
      );

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
      DiscountAmt: getValues("DiscountAmt"),
      Discount: getValues("Discount"),
    });
    // recalculateHeaderDiscount();
    // calculateDiscountAmt(discPercent);
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
    if (
      parseFloat(updatedData.PriceBefDi ?? 0) !==
      parseFloat(oldRow.PriceBefDi ?? 0)
    ) {
      updatedData.PriceBefDi = Math.max(updatedData.PriceBefDi, 0);
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
    );
    updatedData.LineTotal = ValueFormatter(CalcLines.LineTotal);
    updatedData.Price = CalcLines.discountedPrice;
    updatedData.INMPrice = CalcLines.discountedPrice;
    updatedData.StockSum = ValueFormatter(
      updatedData.INMPrice * updatedData.Quantity,
    );
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
    return updatedData;
  };
  //! Header Level CalCaculation
  const oLines = watch("oLines") || []; // Ensure it's an array
  // const oExpLines = getValues("oExpLines") || []; // Ensure it's an array

  const totals = useMemo(() => {
    return oLines.reduce(
      (acc, line) => {
        acc.TotalBefDisc += Number(line?.LineTotal) || 0;
        return acc;
      },
      {
        TotalBefDisc: 0,
      },
    );
  }, [oLines]);

  useEffect(() => {
    setValue("TotalBefDisc", ValueFormatter(totals.TotalBefDisc));
  }, [totals.TotalBefDisc]);
  // const TotalBefDisc = oLines.reduce((sum, current) => {
  //   const TotalBefDisc = parseFloat(current?.LineTotal) || 0; // Handle NaN, null, undefined
  //   return sum + TotalBefDisc;
  // }, 0);

  // setValue("TotalBefDisc", ValueFormatter(TotalBefDisc));
  const LineVatSum = oLines.reduce((sum, current) => {
    const vat = parseFloat(current?.VatSum) || 0; // Handle NaN, null, undefined
    return sum + vat;
  }, 0);
  let TaxOnExp = parseFloat(getValues("TaxOnExp") || 0);
  const VatSum = LineVatSum + TaxOnExp;
  setValue("VatSum", VatSum.toFixed(3));
  let TotalExpns = parseFloat(getValues("TotalExpns")) || 0;
  const DocTotal = totals.TotalBefDisc + TotalExpns + VatSum;
  setValue("DocTotal", ValueFormatter(DocTotal));

  // ===========Header Calculation===========

  const ClearForm = () => {
    reset(initialFormData);
    setSaveUpdateName("SAVE");
    setType("I");
    reset();
    clearFiles();
    setSelectData([]);
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
    setRollBackoExpLines([]);
    // DocumentSeries()
    setok("");
  };
  //#region Copy From GET Api
  const handleSubmitForm = async (data) => {
    if (type === "I") {
      // Check if all lines have both WHSCode and UomCode
      const missingWhs = data.oLines.some((line) => !line.WHSCode);
      const missingUom = data.oLines.some((line) => !line.UomCode);

      if (missingWhs || missingUom) {
        // Determine which fields are missing for the error message
        let errorFields = "";
        if (missingWhs && missingUom) {
          errorFields = "WHSCode and UomCode";
        } else if (missingWhs) {
          errorFields = "WHSCode";
        } else {
          errorFields = "UomCode";
        }

        Swal.fire({
          title: `Missing Required Fields ${errorFields}`,
          text: `Please select the ${errorFields} for  lines.`,
          icon: "warning",
          confirmButtonText: "Ok",
          // timer: 3000,
        });
        return;
      }
    }

    if (getValues("oLines").length === 0) {
      Swal.fire({
        title: "Select Item",
        text: "Please Select The Item  ",
        icon: "warning",
        confirmButtonText: "Ok",
        timer: 3000,
      });
      return;
    }

    if (getValues("DocTotal") <= 0) {
      Swal.fire({
        // title: "Doctotal Not Negative",
        text: " The total document value must be zero or greater.",
        icon: "warning",
        confirmButtonText: "Ok",
        // timer: 3000,
      });
      return;
    }
    const hasInvalidQuantity = data.oLines.some((line) => {
      const quantity = Number(line.Quantity);
      return isNaN(quantity) || quantity <= 0; // Check for valid number and > 0
    });
    const hasInvalidPrice = data.oLines.some((line) => {
      const price = Number(line.PriceBefDi);
      return isNaN(price) || price <= 0; // Check for valid number and > 0
    });
    if (hasInvalidQuantity) {
      Swal.fire({
        text: "Item Quantity should be greater than zero!",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }
    if (hasInvalidPrice) {
      Swal.fire({
        text: "Price cannot be zero or empty",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
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
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
      ModifiedBy: user.UserName,
      Status:
        data.Status === "Open"
          ? "1"
          : data.Status === "Closed"
            ? "0"
            : data.Status === "Cancelled"
              ? "3"
              : "",
      ReqType: data.ReqType || "",
      Requester: data.Requester,
      ReqName: data.ReqName || "",
      Department: data.Department || "",
      Notify: data.Notify || "",
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      DocDueDate: dayjs(data.DocDueDate).format("YYYY-MM-DD "),
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
      ReqDate: dayjs(data.ReqDate).format("YYYY-MM-DD"),
      DocNum: data.DocNum || "",
      Email: data.Email || "",
      Branch: data.Branch || "",
      Volume: data.Volume || "0",
      Weight: data.Weight || "0",
      PaidSys: data.PaidSys || "0",
      ShowSCN: data.ShowSCN || "",
      VolUnit: data.VolUnit || "0",
      GrosProfSy: data.GrosProfSy || "0",
      InvntSttus: data.InvntSttus || "",
      PartSupply: data.PartSupply || "",
      VatPaid: data.VatPaid || "0",
      VatSumSy: data.VatSumSy || "0",
      DiscSumSy: data.DiscSumSy || "0",
      TaxOnExAp: data.TaxOnExAp || "0",
      VatPaidFC: data.VatPaidFC || "0",
      GrosProfFC: data.GrosProfFC || "0",
      GrosProfit: data.GrosProfit || "0",
      TaxOnExpFc: data.TaxOnExpFc || "0",
      TaxOnExpSc: data.TaxOnExpSc || "0",
      TotalExpSC: data.TotalExpSC || "0",
      VatPaidSys: data.VatPaidSys || "0",
      TotalExpFC: data.TotalExpFC || "0",
      SysRate: data.SysRate || "1",
      CurSource: "S",
      DocCur: companyData.MainCurncy,
      DocRate: "1",
      PaidToDate: data.PaidToDate || "0",
      DocType: type,
      AttcEntry: attachmentDocEntry,
      TotalBefDisc: data.TotalBefDisc || "0",
      VatSum: String(data.VatSum || "0"),
      TotalExpns: data.TotalExpns || "0",
      SlpCode: String(data.SlpCode || "0"),
      TaxOnExp: String(data.TaxOnExp || "0"),
      Comments: data.Comments || "",
      DocTotalSy: data.DocTotalSy || "0",
      Series: String(data.Series || "0"),
      DocTotal: data.DocTotal,
      DocTotalFC: data.DocTotalFC || "0",
      PaidFC: data.PaidFC || "0",
      Serial: data.Serial || "0",
      WeightUnit: data.WeightUnit || "0",
      PaidSum: data.PaidSum || "0",
      PaidSumFc: data.PaidSumFc || "0",
      PaidSumSc: data.PaidSumSc || "0",
      TotalBefDiscSy: data.TotalBefDiscSy || "0",
      TotalBefDiscFrgn: "0",
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      // oExpLines: data.
      oLines: data.oLines.map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        ModifiedBy: user.UserName,
        // CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
        PQTReqDate: dayjs(item.PQTReqDate).isValid()
          ? dayjs(item.PQTReqDate).format("YYYY-MM-DD")
          : "",
        Status:
          String(item.Status) === "1" ||
          String(item.Status) === "0" ||
          String(item.Status) === "3"
            ? String(item.Status)
            : "",
        ItemCode: item.ItemCode || "",
        ItemName: item.ItemName || "",
        ServCode: item.ServCode || "0",
        ChapterID: String(item.ChapterID || "0"),
        Quantity: String(item.Quantity || 1),
        Price: String(item.Price || "0"),
        PriceBefDi: String(item.PriceBefDi || "0"),
        INMPrice: String(item.INMPrice || "0"),
        PriceAfVAT: String(item.PriceAfVAT || "0"),
        VatSum: String(isNaN(Number(item.VatSum)) ? 0 : Number(item.VatSum)),
        Discount: String(item.Discount || "0"),
        AssblValue: String(item.AssblValue || "0"),
        OpenQuantity: String(item.OpenQuantity || "0"),
        TotalSumSy: String(item.TotalSumSy || "0"),
        TotalFrgn: "0",
        LocCode: item.LocCode || "",
        Volume: item.Volume || "0",
        Width1: item.Width1 || "0",
        Height1: item.Height1 || "0",
        Length1: item.Length1 || "0",
        VolUnit: item.VolUnit || "0",
        Weight1: item.Weight1 || "0",
        Len1Unit: item.Len1Unit || "0",
        Hght1Unit: item.Hght1Unit || "0",
        StckDstFc: item.StckDstFc || "0",
        StckDstSc: item.StckDstSc || "0",
        UseBaseUn: item.UseBaseUn || "",
        Wdth1Unit: item.Wdth1Unit || "0",
        Wght1Unit: item.Wght1Unit || "0",
        LineVendor: item.LineVendor || "",
        OpenCreQty: item.OpenCreQty || "0",
        StckDstSum: item.StckDstSum || "0",
        TaxDistSFC: item.TaxDistSFC || "0",
        TaxDistSSC: item.TaxDistSSC || "0",
        TaxDistSum: item.TaxDistSum || "0",
        OnHand: item.OnHand || "0",
        IsCommited: item.IsCommited || "0",
        OnOrder: item.OnOrder || "0",
        WHSCode: item.WHSCode || "0",
        AcctCode: item.AcctCode || "0",
        ExpnsName: item.ExpnsName || "0",
        TotalExpns: item.TotalExpns || "0",
        TaxCode: String(item.TaxCode || ""),
        VatGroup: String(item.VatGroup || "-"),
        // ItmTaxType: String(item.ItmTaxType || "0"),
        PostTax: item.PostTax ?? "N",
        Excisable: item.Excisable ?? "N",
        VatPrcnt: String(item.VatPrcnt || "0"),
        LineTotal: String(item.LineTotal || "0"),
        NumPerMsr: String(item.NumPerMsr || "0"),
        InvQty:
          item.UomCode === "Manual"
            ? String(item.Quantity || 1)
            : String(item.InvQty || "0"),
        OpenInvQty:
          item.UomCode === "Manual"
            ? String(item.Quantity || 1)
            : String(item.OpenInvQty || "0"),
        UOMFactor: item.UOMFactor || "0",
        UomCode: item.UomCode || "",
        UomCode2: item.UomCode2 || "",
        UomEntry: item.UomEntry || "0",
        unitMsr: item.unitMsr || "",
        UnitMsr2: item.UnitMsr2 || "0",
        UomEntry2: item.UomEntry2 || "0",
        BaseType: item.BaseType || "-1",
        BaseEntry: item.BaseEntry || "-1",
        BaseLine: item.BaseLine || "-1",
        LineNum: item.LineNum || "0",
        Currency: companyData.MainCurncy,
        Rate: "1",
        GTotal: item.GTotal || "0",
        LineVat: item.LineVat || "0",
        OpenSum: item.OpenSum || "0",
        Project: item.Project || "0",
        TaxType: item.TaxType || "0",
        CodeBars: item.Currency || "",
        GTotalFC: item.GTotalFC || "0",
        GTotalSC: item.GTotalSC || "0",
        LineVatS: item.LineVatS || "0",
        VatAppld: item.VatAppld || "0",
        VatSumSy: item.VatSumSy || "0",
        LineVatlF: item.LineVatlF || "0",
        OpenSumFC: item.OpenSumFC || "0",
        SerialNum: item.SerialNum || "0",
        OpenSumSys: item.OpenSumSys || "0",

        VatAppldFC: item.VatAppldFC || "0",
        VatAppldSC: item.VatAppldSC || "0",
        VatSumFrgn: item.VatSumFrgn || "0",
        oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
          UserId: user.UserId,
          CreatedBy: user.UserName,
          TaxRate: String(taxItem.TaxRate),
          ExpnsCode: taxItem.ExpnsCode || "0",
          TaxStatus: taxItem.TaxStatus || "Y",
          ModifiedBy: user.UserName,
          // CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
          ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
          TaxSum: String(taxItem.TaxSum),
          StcCode: taxItem.StcCode,
          BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
          RelateType: "1",
          RelateEntry: taxItem.RelateEntry,
          GroupNum: taxItem.GroupNum || "1",
          StaCode: taxItem.StaCode || "0",
          staType: taxItem.staType || "1",
          TaxAcct: taxItem.TaxAcct || "0",
          TaxSumFrgn: taxItem.TaxSumFrgn || "0",
          TaxSumSys: taxItem.TaxSumSys || "0",
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

      oExpLines: (data.oExpLines || []).map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        // CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
        // ModifiedDate:dayjs(undefined).format("YYYY-MM-DD "),
        Status:
          String(item.Status) === "1" ||
          String(item.Status) === "0" ||
          String(item.Status) === "3"
            ? String(item.Status)
            : "",
        ExpnsCode: item.DocEntry,
        VatGroup: item.VatGroup || "0",
        DocEntry: item.DocEntry,
        ModifiedBy: user.UserName,
        LineTotal: String(item.LineTotal),
        TaxCode: String(item.TaxCode || "0"),
        VatSum: String(item.VatSum),
        GrsAmount: String(item.GrsAmount),
        ExpnsName: String(item.ExpnsCode || "0"),
        FixCurr: item.FixCurr || "",
        TaxType: item.TaxType || "0",
        TaxStatus: item.TaxStatus || "0",
        DistrbMthd: item.DistrbMthd || "0",
        TotalSumSy: String(item.TotalSumSy || "0"),
        TotalFrgn: "0",
        RevAcct: item.RevAcct || "0",
        GrsFC: item.GrsFC || "0",
        GrsSC: item.GrsSC || "0",
        PaidFC: item.PaidFC || "0",
        LineVat: item.LineVat || "0",
        LineVatS: item.LineVatS || "0",
        VatPrcnt: item.VatPrcnt || "0",
        VatSumSy: item.VatSumSy || "0",
        DedVatSumF: item.DedVatSumF || "0",
        DedVatSumS: item.DedVatSumS || "0",
        PaidToDate: item.PaidToDate || "0",
        PaidSys: item.PaidSys || "0",
        LineVatF: item.LineVatF || "0",
        VatAppldFC: item.VatAppldFC || "0",
        VatAppldSC: item.VatAppldSC || "0",
        VatApplied: item.VatApplied || "0",
        VatSumFrgn: item.VatSumFrgn || "0",
        oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
          UserId: user.UserId,
          CreatedBy: user.UserName,
          ModifiedBy: user.UserName,
          TaxRate: String(taxItem.TaxRate),
          TaxSum: String(taxItem.TaxSum),
          StcCode: taxItem.StcCode,
          BaseSum: String(taxItem.BaseSum), // Use eval carefully, consider security implications
          RelateType: "2",
          RelateEntry: taxItem.RelateEntry,
          GroupNum: taxItem.GroupNum || "1",
          TaxStatus: taxItem.TaxStatus || "0",
          ExpnsCode: taxItem.ExpnsCode || "0",
          StaCode: taxItem.StaCode || "0",
          staType: taxItem.staType || "1",
          TaxAcct: taxItem.TaxAcct || "0",
          TaxSumFrgn: taxItem.TaxSumFrgn || "0",
          TaxSumSys: taxItem.TaxSumSys || "0",
          BaseSumFrg: taxItem.BaseSumFrg || "0",
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
      })), // Assuming this is an array
      oPaymentLines: [],
      oDPLines: [],
      oTaxExtLines: (data.oTaxExtLines || []).map((oTaxExtLines) => ({
        ...oTaxExtLines,
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
      })),
    };
    console.log(obj);
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/PurchaseRequest`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearForm();
            setOpenListData([]);
            fetchOpenListData(0);
            handleGetListClear();
            setClearCache(true);

            Swal.fire({
              title: "Success!",
              text: "Purchase Request saved Successfully",
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
    } else {
      Swal.fire({
        text: `Do You Want Update "${obj.DocNum}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (attachmentDocEntry > "0") {
          apiClient.put(`/Attachment/${attachmentDocEntry}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        if (result.isConfirmed) {
          apiClient
            .put(`/PurchaseRequest/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                setOpenListData([]);
                setOpenListPage(0);
                fetchOpenListData(0);
                handleGetListClear();

                ClearForm();
                Swal.fire({
                  title: "Success!",
                  text: "Purchase Request Updated",
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
      text: `Do You Want Cancel "${currentData.Requester}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .put(`/PurchaseRequest/Cancel/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              ClearForm();
              setOpenListData([]);
              fetchOpenListData(0);
              fetchCancelledListData(0);
              fetchClosedListData(0);
              Swal.fire({
                text: "Purchase Request Cancel",
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
          text: "Purchase Request Not Cancelled",
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
      text: `Do You Want Close "${currentData.Requester}" `,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .put(`/PurchaseRequest/Close/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              setOpenListData([]);
              fetchOpenListData(0);
              setClosedListData([]);
              fetchOpenListData(0);
              fetchClosedListData(0);
              ClearForm();
              Swal.fire({
                text: "Purchase Request Close",
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
          text: "Purchase Request Not Close",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };
  const setOldOpenData = async (DocEntry) => {
    setok("");
    try {
      const values = getValues();
      const hasManualChanges =
        Object.keys(dirtyFields).length > 0 && !!values.Requester;
      if (hasManualChanges || ok === "UPDATE") {
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
    setLoading(true);
    apiClient
      .get(`/PurchaseRequest/${DocEntry}`)
      .then((response) => {
        if (response.data.success === true) {
          const item = response.data.values;
          reset({
            DocEntry: item.DocEntry,
            ReqType: item.ReqType,
            Requester: item.Requester,
            ReqName: item.ReqName,
            Department: item.Department,
            DocNum: item.DocNum || "0",
            CurSource: item.CurSource || "0",
            DocDate: dayjs(item.DocDate).format("YYYY-MM-DD HH:mm:ss"),
            DocDueDate: dayjs(item.DocDueDate).format("YYYY-MM-DD HH:mm:ss"),
            TaxDate: dayjs(item.TaxDate).format("YYYY-MM-DD HH:mm:ss"),
            ReqDate: dayjs(item.ReqDate).format("YYYY-MM-DD HH:mm:ss"),
            Status: getStatus(item.Status),
            totalbef: item.TotalBefDisc || 0,
            TaxOnExp: item.TaxOnExp,
            TotalExpns: item.TotalExpns || 0,
            Series: item.Series,
            VatSum: item.VatSum || 0,
            Discount: item.Discount || 0,
            DiscountAmt: item.DiscountAmt || 0,
            RoundDif: item.RoundDif || 0,
            SlpCode: item.SlpCode || "0",
            TrnspCode: item.TrnspCode || "0",
            Currency: item.DocCur || "",
            Notify: item.Notify || "0",
            DocType: item.DocType || "0",
            Comments: item.Comments || "0",
            oLines: (item.oLines || []).map((element) => {
              const match = warehouseData.find(
                (loc) => loc.Location === element.LocCode,
              );
              return {
                ...element,
                UserId: user.UserId,
                BaseType: element.BaseType || "-1",
                BaseEntry: element.BaseEntry || "-1",
                PQTReqDate: element.PQTReqdate,
                LineVendor: element?.LineVendor ?? "",
                BaseLine: element.BaseLine || "-1",
                DocEntry: element.DocEntry || "0",
                Status: element.Status || "0",
                ItemCode: element.ItemCode || "0",
                ServCode: element.ServCode || "0",
                ChapterID: element.ChapterID,
                VatGroup: element.VatGroup || "",
                ItemName: element.ItemName || "0",
                Quantity: element.Quantity || 0,
                // ✅ These were correctly restored
                LocationName: match?.LocationName || "",
                LocCode: match?.Location || "",
                Price: element.Price,
                WHSCode: element.WHSCode,
                UomCode: element.UOMCode,
                UomEntry: element.UomEntry,
                UomEntry2: element.UomEntry2,
                UgpEntry: element.UgpEntry,
                PriceBefDi: element.PriceBefDi,
                AssblValue: element.AssblValue,
                Discount: element.Discount,
                TaxCode: element.TaxCode,
                PostTax: String(element.PostTax),
                Excisable: String(element.Excisable || "N"),
                OnHand: element.OnHand,
                OpenQuantity: element.OpenQuantity,
                VatSum: element.VatSum,
                IsCommited: element.IsCommited,
                LineNum: element.LineNum,
                LineTotal: element.LineTotal,
                OnOrder: element.OnOrder,
                AcctCode: element.AcctCode,
                ExpnsName: element.ExpnsName,
                TotalExpns: element.TotalExpns,
                oTaxLines: (element.oTaxLines || []).map((taxItem) => ({
                  UserId: user.UserId,
                  CreatedBy: user.UserName,
                  TaxRate: String(taxItem.TaxRate),
                  TaxSum: String(taxItem.TaxSum),
                  StcCode: taxItem.StcCode,
                  BaseSum: String(taxItem.BaseSum),
                  RelateType: "1",
                  RelateEntry: taxItem.RelateEntry,
                  GroupNum: taxItem.GroupNum,
                  ExpnsCode: taxItem.ExpnsCode,
                  StaCode: taxItem.StaCode,
                  staType: taxItem.staType,
                  TaxAcct: taxItem.TaxAcct,
                  TaxSumFrgn: taxItem.TaxSumFrgn,
                  TaxSumSys: taxItem.TaxSumSys,
                  BaseSumFrg: taxItem.BaseSumFrg,
                  BaseSumSys: taxItem.BaseSumSys,
                  VatApplied: taxItem.VatApplied,
                  VatAppldFC: taxItem.VatAppldFC,
                  VatAppldSC: taxItem.VatAppldSC,
                  LineSeq: taxItem.LineSeq,
                  DeferrAcct: taxItem.DeferrAcct,
                  BaseType: taxItem.BaseType,
                  BaseAbs: taxItem.BaseAbs,
                  BaseSeq: taxItem.BaseSeq,
                  DeductTax: taxItem.DeductTax,
                  DdctTaxFrg: taxItem.DdctTaxFrg,
                  DdctTaxSys: taxItem.DdctTaxSys,
                })),
              };
            }),

            oExpLines: (item.oExpLines || []).map((element) => ({
              Status: element.Status,
              DocEntry: element.ExpnsCode || "",
              ExpnsName: String(element.ExpnsCode || ""),
              ModifiedBy: element.UserName || "",
              LineTotal: element.LineTotal || 0,
              GrsAmount: element.GrsAmount || 0,
              TaxCode: String(element.TaxCode || "0"),
              VatSum: element.VatSum || 0,
              oTaxLines: (item.oTaxLines || []).map((taxItem) => ({
                UserId: user.UserId,
                CreatedBy: user.UserName,
                TaxRate: String(taxItem.TaxRate),
                TaxSum: String(taxItem.TaxSum),
                StcCode: taxItem.StcCode,
                BaseSum: String(taxItem.BaseSum),
                // Use eval carefully, consider security implications
                RelateType: "2",
                RelateEntry: taxItem.RelateEntry,
                GroupNum: taxItem.GroupNum,
                ExpnsCode: taxItem.ExpnsCode,
                StaCode: taxItem.StaCode,
                staType: taxItem.staType,
                TaxAcct: taxItem.TaxAcct,
                TaxSumFrgn: taxItem.TaxSumFrgn,
                TaxSumSys: taxItem.TaxSumSys,
                BaseSumFrg: taxItem.BaseSumFrg,
                BaseSumSys: taxItem.BaseSumSys,
                VatApplied: taxItem.VatApplied,
                VatAppldFC: taxItem.VatAppldFC,
                VatAppldSC: taxItem.VatAppldSC,
                PaidSys: taxItem.PaidSys,
                LineVatF: taxItem.LineVatF,
                LineSeq: taxItem.LineSeq,
                DeferrAcct: taxItem.DeferrAcct,
                BaseType: taxItem.BaseType,
                BaseAbs: taxItem.BaseAbs,
                BaseSeq: taxItem.BaseSeq,
                DeductTax: taxItem.DeductTax,
                DdctTaxFrg: taxItem.DdctTaxFrg,
                DdctTaxSys: taxItem.DdctTaxSys,
              })),
            })),
            oTaxExtLines: item.oTaxExtLines, // Assuming this is an array
          });
          setRollBackoExpLines(item.oExpLines);
          setValue("BlockB", item.oTaxExtLines[0]?.BlockB ?? "");
          setValue("StreetB", item.oTaxExtLines[0]?.StreetB ?? "");
          setValue("CityB", item.oTaxExtLines[0]?.CityB ?? "");
          setValue("StateB", item.oTaxExtLines[0]?.StateB ?? "");
          setValue("CountryB", item.oTaxExtLines[0]?.CountryB ?? "");
          setValue("ZipCodeB", item.oTaxExtLines[0]?.ZipCodeB ?? "");
          setValue("BlockS", item.oTaxExtLines[0]?.BlockS ?? "");
          setValue("StreetS", item.oTaxExtLines[0]?.StreetS ?? "");
          setValue("CityS", item.oTaxExtLines[0]?.CityS ?? "");
          setValue("StateS", item.oTaxExtLines[0]?.StateS ?? "");
          setValue("CountryS", item.oTaxExtLines[0]?.CountryS ?? "");
          setValue("ZipCodeS", item.oTaxExtLines[0]?.ZipCodeS ?? "");
          setValue("DocType", item.DocType);
          if (item.AttcEntry > 0) {
            setFilesFromApi(item.AttcEntry);
          }
          setType(item.DocType);
          setSelectData(DocEntry);
        } else if (response.data.success === true) {
          Swal.fire({
            title: "Error!",
            text: response.data.message,
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching or processing data:", error);
      })
      .finally(() => {
        setLoading(false);
        toggleSidebar();
      });
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
          Purchases Request List
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
                          title={item.ReqName}
                          subtitle={item.DocNum}
                          description={dayjs(item.TaxDate).format("DD/MM/YYYY")}
                          searchResult={query}
                          isSelected={oldOpenData === item.DocEntry}
                          onClick={() => setOldOpenData(item.DocEntry)}
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
      {/* Vendor List Show  */}
      <SearchBPModel
        open={openVendorList}
        onClose={CloseVendorModel}
        onCancel={CloseVendorModel}
        title="Select Vendor/Supplier"
        onChange={(e) => handleVendorGetListSearch(e.target.value)}
        value={VendorgetListquery}
        onClickClear={handleVendorGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={VendorgetListData.length}
            next={fetchVendorMoreGetListData}
            hasMore={VendorhasMoreGetList}
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
            {VendorgetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.CardCode}
                subtitle={item.CardName}
                description={item.Cellular}
                searchResult={VendorgetListquery}
                onClick={() => {
                  onSelectVendor(item.CardCode);
                  CloseVendorModel(); // Close after selection if needed
                  setok("UPDATE");
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      {/* ======================== */}

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
                  selectWhSCode(item.WHSCode, item.Location, item.LocationName);
                  CloseVendorModel(); // Close after selection if needed
                  setok("UPDATE");
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
      {/*  SERVICE MODEL  */}

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
        curSource={"L"}
        Currency={getValues("Currency")}
      />

      {/*===============Modal/Dialog===============*/}
      {loading && <Loader open={loading} />}

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
              Purchase Request
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
                      name="Requester"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="REQUESTER "
                          readOnly={true}
                          disabled={!!allFormData.DocEntry}
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
                    <SearchModel
                      open={searchmodelOpen}
                      onClose={SearchModelClose}
                      onCancel={SearchModelClose}
                      title="Select User "
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
                                key={item.DocEntry}
                                title={item.UserName}
                                subtitle={item.LastName} // UserCode
                                description={item.Department}
                                searchResult={getListquery}
                                isSelected={
                                  allFormData.ReqName === item.UserName
                                }
                                onClick={() => {
                                  onSelectUser(
                                    item.DocEntry,
                                    item.UserName,
                                    item.Department,
                                  );
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
                      name="ReqName"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="REQUESTER NAME"
                          type="text"
                          {...field}
                          readOnly={true}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  {/* <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
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
                            })
                          )}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Department"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          type="text"
                          {...field}
                          error={!!error}
                          disabled={
                            allFormData.Status === "Closed" ||
                            allFormData.Status === "Cancelled"
                          }
                          helperText={error ? error.message : null}
                          label="DEPARTMENT  "
                          data={DepartMent.map((item) => ({
                            key: item.DocEntry,
                            value: item.Name,
                          }))}
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
                              setValue("DocNum", seriesData?.DocNum ?? "");
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
                          disabled={
                            allFormData.Status === "Closed" ||
                            allFormData.Status === "Cancelled"
                          }
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
                          onChange={(newValue) =>
                            setValue("TaxDate", newValue, { shouldDirty: true })
                          }
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
                      rules={{ required: "Req Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="REQUIRED DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : null}
                          // disabled={
                          //   allFormData.Status === "Closed" ||
                          //   allFormData.Status === "Cancelled"
                          // }
                          onChange={(newValue) => {
                            setValue("ReqDate", newValue, {
                              shouldDirty: true,
                            });

                            handleChangeDatereq(newValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Currency"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="CURRENCY"
                          data={currencydata.map((item) => ({
                            key: item.CurrCode,
                            value: item.CurrName,
                          }))}
                        />
                      )}
                    />
                  </Grid> */}
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
                        currentData.Requester === "" ||
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
                      {/* <Tab
        value={1}
        label={
          <Grid style={{ display: 'flex', alignItems: 'center' }}>
            <LocalShippingIcon sx={{ mr: 0.5 }} />
            Logistics
          </Grid>
        }
      /> */}
                      {/* <Tab
        value={2}
        label={
          <Grid style={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceIcon sx={{ mr: 0.5 }} /> 
            Accounting
          </Grid>
        }
      /> */}
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

                    <Grid item xs={12}>
                      {tabvalue === 0 && (
                        <Grid
                          container
                          item
                          sx={{
                            overflow: "auto",
                            width: "100%",
                            height: "100%",
                            //  height: "30vh",    // half screen height
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
                              processRowUpdate={processRowUpdate}
                              onProcessRowUpdateError={(err) =>
                                console.error(err)
                              }
                              onCellKeyDown={handleCellKeyDown}
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
                    {/* <Grid
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
                            label="Buyer"
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
                    </Grid> */}
                    <Grid
                      item
                      xs={12}
                      md={4}
                      sm={6}
                      lg={3}
                      textAlign={"center"}
                    >
                      <Controller
                        name="TotalBefDisc"
                        // rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="TOTAL BEF DISC"
                            type="number"
                            readOnly={true}
                            disabled={
                              allFormData.Status === "Closed" ||
                              allFormData.Status === "Cancelled"
                            }
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item md={4} sm={6} lg={3} xs={12} textAlign="center">
                      <Controller
                        name="TotalExpns"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="TotalFreight"
                            type="number"
                            {...field}
                            // value={totalGrossAmount}
                            // disabled={allFormData.CardCode === ""}
                            readOnly={true}
                            disabled={
                              !allFormData.Requester ||
                              allFormData.Status === "Closed" ||
                              allFormData.Status === "Cancelled"
                            }
                            error={!!error}
                            helperText={error ? error.message : null}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    // onClick={handleFright}
                                    onClick={
                                      allFormData.Requester
                                        ? handleFright
                                        : undefined
                                    }
                                    // disabled={
                                    //   !allFormData.Requester ||
                                    //   allFormData.Status === "Closed" ||
                                    //   allFormData.Status === "Cancelled"
                                    // }
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
                        )}
                      />
                    </Grid>

                    {/* <Grid item md={6} lg={3} xs={6} textAlign={"center"}>
                      <Controller
                        name="TaxAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="Total Tax"
                            type="number"
                            {...field}
                            // value={watch("VatSum")} // Use `watch` to reflect changes dynamically
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid> */}
                    <Grid
                      item
                      md={4}
                      sm={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="VatSum"
                        // rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="TAX"
                            type="number"
                            {...field}
                            readOnly={true}
                            disabled={
                              allFormData.Status === "Closed" ||
                              allFormData.Status === "Cancelled"
                            }
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
                            readOnly={true} // Set readOnly as boolean
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
                  DocEntry={allFormData.DocEntry}
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
export default React.memo(PurchaseRequest);
