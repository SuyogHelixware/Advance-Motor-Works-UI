import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SummarizeIcon from "@mui/icons-material/Summarize";
import ViewListIcon from "@mui/icons-material/ViewList";
import { TabContext, TabPanel } from "@mui/lab";
import DoNotDisturbAltSharpIcon from "@mui/icons-material/DoNotDisturbAltSharp";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  Box,
  Button,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import axios from "axios";
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
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import DynamicLoader from "../../Loaders/DynamicLoader";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { BusinessPartnerScroll } from "../Components/BusinessPartnerScroll";
import CardComponent from "../Components/CardComponent";
import DataGriCellModelClick from "../Components/DataGridCellModelClick";
import {
  InputLargeTextField,
  InputSelectTextField,
  InputTextField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import ProductionDataGrid from "../Components/ProductionDataGrid";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { useSearchInfiniteScroll } from "../Components/useSearchInfiniteScroll";
import { TwoFormatter } from "../Components/ValueFormatter";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { DatePicker } from "antd";
import { isCellEditable } from "material-react-table";
import { usePaginatedSearchList } from "../../Hooks/usePaginatedSearchList";
import BinLocation from "../Components/BinLocation";
import AllBinLocationShow from "../Components/AllBinLocationShow";

const BomColumns = [
  {
    field: "Code",
    headerName: "Item Code",
    width: 150,
    editable: false,
  },
  {
    field: "Name",
    headerName: "Item Description",
    width: 150,
    editable: false,
  },
];
const RoutestageColumn = [
  {
    id: 1,
    field: "Code",
    headerName: "Route Stage Code",
    width: 200,
    editable: false,
  },
  {
    id: 2,
    field: "Description",
    headerName: "Route Stage Description",
    width: 200,
    editable: false,
  },
];
const headerColumns = [
  {
    field: "ItemCode",
    headerName: "Item Code",
    width: 150,
    editable: false,
  },
  {
    field: "ItemName",
    headerName: "Item Description",
    width: 150,
    editable: false,
  },

  {
    field: "DefaultWhs",
    headerName: "WHSCODE",
    width: 120,
    editable: false,
  },
];
const modelColumns = [
  {
    field: "ItemCode",
    headerName: "Item Code",
    width: 150,
    editable: false,
  },
  {
    field: "ItemName",
    headerName: "Item Description",
    width: 150,
    editable: false,
  },

  {
    field: "DefaultWhs",
    headerName: "WHSCODE",
    width: 120,
    editable: false,
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
const initialState = {
  BinLocationOpenReciept: false,
  BinLocationOpenIssue: false,
  modal2: false,
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
function ProductionOrder() {
  const theme = useTheme();
  const apiRef = useGridApiRef();
  const issueGridApiRef = useGridApiRef();
  const RecieptGridApiRef = useGridApiRef();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, warehouseData } = useAuth();
  const perms = usePermissions(102);
  const [tabvalue, settabvalue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tab, settab] = useState("4");
  const timeoutRef = useRef(null);
  const [DocSeries, setDocumentSeries] = useState([]);
  const [DocseriesIssue, setDocumentSeriesIssue] = useState([]);
  const [DocseriesReciept, setDocumentSeriesReciept] = useState([]);
  const [openWhsc, setWhscOpen] = useState(false);
  const [openCustomer, setCustomerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [chartAccountOpen, setChartAccountOpen] = useState(false);
  const [IssueAccountOpen, setIssueChartOpen] = useState(false);
  const [RecieptAccount, setRecieptChartOpen] = useState(false);
  const [openLinked, setOpenLinked] = useState(false);
  const [openwhscoLines, setwhscOpenoLines] = useState(false);
  const [openIssueComp, setopenIssueComp] = useState(false);
  const [whscopenIssue, setwhscOpenIssue] = useState(false);
  const [whscOpenReciept, setwhscOpenReciept] = useState(false);
  const [openReciept, setReciept] = useState(false);

  // //=====================================open List State====================================================================
  // const [PlannedListData, setPlannedListData] = useState([]);
  // const [PlannedListPage, setPlannedListPage] = useState(0);
  // const [hasMorePlanned, setHasMorePlanned] = useState(true);
  // const [PlannedListquery, setPlannedListQuery] = useState("");
  // const [PlannedListSearching, setPlannedListSearching] = useState(false);
  const [apiloading, setapiloading] = useState(false);
  // //=========================================open List State End===========
  // const [ReleasedListData, setReleasedListData] = useState([]);
  // const [ReleasedListPage, setReleasedListPage] = useState(0);
  // const [ReleasedListSearching, setReleasedListSearching] = useState(false);
  // const [ReleasedListquery, setReleasedListQuery] = useState("");
  // const [hasMoreReleased, setHasMoreReleased] = useState(true);
  // //=====================================closed List State====================================================================
  // const [closedListData, setClosedListData] = useState([]);
  // const [closedListPage, setClosedListPage] = useState(0);
  // const [hasMoreClosed, setHasMoreClosed] = useState(true);
  // const [closedListquery, setClosedListQuery] = useState("");
  // const [closedListSearching, setClosedListSearching] = useState(false);
  // ========================end=====================================
  //! ==============CANCEL LIST===============
  const [cancelledListData, setCancelledListData] = useState([]);
  const [cancelListPage, setCancelListPage] = useState(0);
  const [cancelListSearching, setCancelListSearching] = useState(false);
  const [cancelledListquery, setCancelledListQuery] = useState("");
  const [hasMoreCancelled, setHasMoreCancelled] = useState(true);
  const controllerRef = useRef(null); // store active controller

  const LIMIT = 20;
  const [openItem, setOpenItem] = useState(false);
  const [itemCache, setItemCache] = useState({});
  const [itemList, setItemList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [openRouteStage, setOpenRouteStage] = useState(false);
  const [routeStageCache, setrouteStageCache] = useState({});
  const [routeStageList, setrouteStageList] = useState([]);
  const [routeStagecurrentPage, setrouteStageCurrentPage] = useState(0);
  const [routeStagesearchText, setrouteStageSearchText] = useState("");
  const [routeStagerowCount, setrouteStageRowCount] = useState(0);
  const [openBom, setOpenBom] = useState(false);
  const [BomCache, setBomCache] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [BinlocListData, setBinLocData] = useState([]);

  const [BomList, setBomList] = useState([]);
  const [BomcurrentPage, setBomCurrentPage] = useState(0);
  const [BomsearchText, setBomSearchText] = useState("");
  const [BomrowCount, setBomRowCount] = useState(0);
  const [oldOpenData, setSelectData] = useState(null);
  let [ok, setok] = useState("OK");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const rightClick = Boolean(anchorEl);
  // const handleCloseCancel=()=>{
  //   setrightClick(true)
  // }

  const [isFullScreenReciept, setIsFullScreenReciept] = useState(false);
  const toggleModalSizeReciept = () => {
    setIsFullScreenReciept((prev) => !prev);
  };
  const initialFormData = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    DocDate: dayjs(undefined).format("YYYY-MM-DD"),
    DueDate: dayjs(undefined).format("YYYY-MM-DD"),
    StartDate: dayjs(undefined).format("YYYY-MM-DD"),
    Status: "4",
    UomCode: "",
    DocNum: "",
    Series: "",
    ItemCode: "",
    Type: "S",
    PlannedQty: "1",
    CmpltQty: "",
    RjctQty: "",
    PostDate: dayjs(undefined).format("YYYY-MM-DD"),
    WHSCode: "",
    OriginAbs: "",
    OriginNum: "",
    Comments: "",
    CloseDate: "",
    RlsDate: "",
    CardCode: "",
    JrnlMemo: "",
    LocCode: "",
    TransId: "",
    PIndicator: "",
    SysCloseDt: "",
    SysCloseTm: "",
    ObjType: "",
    ProdName: "",
    RouDatCalc: "",
    UpdAlloc: "",
    AtcEntry: "",
    Attachment: "",
    LinkToObj: "",
    oLines: [],
  };

  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    clearErrors,
    setValue,
    getValues,
  } = useForm({
    defaultValues: initialFormData,
  });

  const Type = watch("Type");
  const status = watch("Status");
  const InitialFormIssue = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    Status: "1",
    DocNum: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD"),
    GroupNum: "0",
    TaxDate: dayjs(undefined).format("YYYY-MM-DD"),
    Ref2: "",
    Comments: "",
    JrnlMemo: "ISSUE FOR PRODUCTION",
    AtcEntry: "0",
    InvntSttus: "0",
    DocCur: "0",
    DocRate: "0",
    DocTotal: "0",
    DocTotalFC: "0",
    SysRate: "0",
    CurSource: "0",
    DocTotalSy: "0",
    Volume: "0",
    VolUnit: "0",
    Weight: "0",
    Series: "",
    oLines: [],
  };
  const {
    control: controlIssue,
    handleSubmit: handleSubmitIssue,
    reset: resetIssue,
    watch: watchIssue,
    clearErrors: clearErrorsIssue,
    setValue: setValueIssue,
    getValues: getValuesIssue,
  } = useForm({
    defaultValues: InitialFormIssue,
  });

  const InitialFormReciept = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    Status: "1",
    DocNum: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD"),
    GroupNum: "0",
    TaxDate: dayjs(undefined).format("YYYY-MM-DD"),
    Ref2: "",
    Comments: "",
    JrnlMemo: "RECIEPT FOR PRODUCTION",
    AtcEntry: "0",
    WeightUnit: "0",
    InvntSttus: "0",
    DocCur: "0",
    DocRate: "0",
    DocTotal: "0",
    DocTotalFC: "0",
    SysRate: "0",
    CurSource: "0",
    DocTotalSy: "0",
    Volume: "0",
    VolUnit: "0",
    Weight: "0",
    Series: "",
    oLines: [],
  };
  const {
    control: controlReciept,
    handleSubmit: handleSubmitReciept,
    reset: resetReciept,
    watch: watchReciept,
    clearErrors: clearErrorsReciept,
    setValue: setValueReciept,
    getValues: getValuesReciept,
  } = useForm({
    defaultValues: InitialFormReciept,
  });
  const currentData = getValues();
  const allFormData = getValues();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
    const activeTab = tabData.find((t) => t.value === newvalue1);
    activeTab?.loadIfNeeded();
    // setValue("Status", "4");
  };
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  //#region  Open Tab
  // // order List For OPEN Tab
  // const fetchPlannedListData = async (pageNum, searchTerm = "") => {
  //   try {
  //     let response;
  //     if (searchTerm) {
  //       response = await apiClient.get(
  //         `/ProductionOrder/Search/${searchTerm}/4/${pageNum}/20`,
  //       );
  //     } else {
  //       response = await apiClient.get(
  //         `/ProductionOrder/Pages/4/${pageNum}/20`,
  //       );
  //     }
  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       setHasMorePlanned(newData.length === 20);
  //       setPlannedListData((prev) =>
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
  //     Swal.fire({
  //       text: error,
  //       icon: "question",
  //       confirmButtonText: "YES",
  //       showConfirmButton: true,
  //     });
  //   }
  // };

  // // Handle search input
  // const handlePlannedListSearch = (res) => {
  //   setPlannedListQuery(res);
  //   setPlannedListSearching(true);
  //   setPlannedListPage(0);
  //   setPlannedListData([]); // Clear current data
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }
  //   timeoutRef.current = setTimeout(() => {
  //     fetchPlannedListData(0, res);
  //   }, 600);
  //   // Fetch with search query
  // };
  // // Clear search
  // const handlePlannedListClear = () => {
  //   setPlannedListQuery(""); // Clear searFullAddressch input
  //   setPlannedListSearching(false); // Reset search state
  //   setPlannedListPage(0); // Reset page count
  //   setPlannedListData([]); // Clear data
  //   fetchPlannedListData(0); // Fetch first page without search
  // };
  // // Infinite scroll fetch more data
  // const fetchMorePlannedListData = () => {
  //   fetchPlannedListData(
  //     PlannedListPage + 1,
  //     PlannedListSearching ? PlannedListquery : "",
  //   );
  //   setPlannedListPage((prev) => prev + 1);
  // };
  // // Initial fetch
  // useEffect(() => {
  //   fetchPlannedListData(0); // Load first page on mount
  // }, []);

  //#endregion End Open  Tab

  // // Close Tab Api Binding
  // const fetchClosedListData = async (pageNum, searchTerm = "") => {
  //   try {
  //     let response;
  //     if (searchTerm) {
  //       response = await apiClient.get(
  //         `/ProductionOrder/Search/${searchTerm}/0/${pageNum}/20`,
  //       );
  //     } else {
  //       response = await apiClient.get(
  //         `/ProductionOrder/Pages/0/${pageNum}/20`,
  //       );
  //     }

  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       setHasMoreClosed(newData.length === 20);
  //       setClosedListData((prev) =>
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
  //     Swal.fire({
  //       text: error,
  //       icon: "question",
  //       confirmButtonText: "YES",
  //       showConfirmButton: true,
  //     });
  //   }
  // };

  // // Handle search input
  // const handleClosedListSearch = (res) => {
  //   setClosedListQuery(res);
  //   setClosedListSearching(true);
  //   setClosedListPage(0);
  //   setClosedListData([]); // Clear current data
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }

  //   timeoutRef.current = setTimeout(() => {
  //     fetchClosedListData(0, res);
  //   }, 600);
  // };

  // // Clear search
  // const handleClosedListClear = () => {
  //   setClosedListQuery(""); // Clear search input
  //   setClosedListSearching(false); // Reset search state
  //   setClosedListPage(0); // Reset page count
  //   setClosedListData([]); // Clear data
  //   fetchClosedListData(0); // Fetch first page without search
  // };

  // // Infinite scroll fetch more data
  // const fetchMoreClosedListData = () => {
  //   fetchClosedListData(
  //     closedListPage + 1,
  //     closedListSearching ? closedListquery : "",
  //   );
  //   setClosedListPage((prev) => prev + 1);
  // };

  // // Initial fetch
  // useEffect(() => {
  //   fetchClosedListData(0); // Load first page on mount
  // }, []);
  // //! =================CANCEL LIST================================
  // const fetchCancelledListData = async (pageNum, searchTerm = "") => {
  //   try {
  //     let response;
  //     if (searchTerm) {
  //       response = await apiClient.get(
  //         `/POV2/Search/${searchTerm}/3/${pageNum}/20`,
  //       );
  //     } else {
  //       response = await apiClient.get(`/POV2/Pages/3/${pageNum}/20`);
  //     }
  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       setHasMoreCancelled(newData.length === 20);
  //       setCancelledListData((prev) =>
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
  //     Swal.fire({
  //       text: error,
  //       icon: "question",
  //       confirmButtonText: "YES",
  //       showConfirmButton: true,
  //     });
  //   }
  // };

  // // Handle search input
  // const handleCancelListSearch = (res) => {
  //   setCancelledListQuery(res);
  //   setCancelListSearching(true);
  //   setCancelListPage(0);
  //   setCancelledListData([]); // Clear current data
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }
  //   timeoutRef.current = setTimeout(() => {
  //     fetchCancelledListData(0, res);
  //   }, 600);
  // };

  // // Clear search
  // const handleCancelListClear = () => {
  //   setCancelledListQuery(""); // Clear search input
  //   setCancelListSearching(false); // Reset search state
  //   setCancelListPage(0); // Reset page count
  //   setCancelledListData([]); // Clear data
  //   fetchCancelledListData(0); // Fetch first page without search
  // };

  // // Infinite scroll fetch more data
  // const fetchMoreCancelListData = () => {
  //   fetchCancelledListData(
  //     cancelListPage + 1,
  //     cancelListSearching ? cancelledListquery : "",
  //   );
  //   setCancelListPage((prev) => prev + 1);
  // };

  // // Initial fetch
  // useEffect(() => {
  //   fetchCancelledListData(0); // Load first page on mount
  // }, []);
  // //! =================Released LIST================================
  // const fetchReleasedListData = async (pageNum, searchTerm = "") => {
  //   try {
  //     let response;
  //     if (searchTerm) {
  //       response = await apiClient.get(
  //         `/ProductionOrder/Search/${searchTerm}/5/${pageNum}/20`,
  //       );
  //     } else {
  //       response = await apiClient.get(
  //         `/ProductionOrder/Pages/5/${pageNum}/20`,
  //       );
  //     }
  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       setHasMoreReleased(newData.length === 20);
  //       setReleasedListData((prev) =>
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
  //     Swal.fire({
  //       text: error,
  //       icon: "question",
  //       confirmButtonText: "YES",
  //       showConfirmButton: true,
  //     });
  //   }
  // };

  // // Handle search input
  // const handleReleasedSearch = (res) => {
  //   setReleasedListQuery(res);
  //   setReleasedListSearching(true);
  //   setReleasedListPage(0);
  //   setReleasedListData([]); // Clear current data
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }
  //   timeoutRef.current = setTimeout(() => {
  //     fetchReleasedListData(0, res);
  //   }, 600);
  // };

  // // Clear search
  // const handleReleasedClear = () => {
  //   setReleasedListQuery(""); // Clear search input
  //   setReleasedListSearching(false); // Reset search state
  //   setReleasedListPage(0); // Reset page count
  //   setReleasedListData([]); // Clear data
  //   fetchReleasedListData(0); // Fetch first page without search
  // };

  // // Infinite scroll fetch more data
  // const fetchMoreReleasedData = () => {
  //   fetchReleasedListData(
  //     ReleasedListPage + 1,
  //     ReleasedListSearching ? ReleasedListquery : "",
  //   );
  //   setReleasedListPage((prev) => prev + 1);
  // };

  // // Initial fetch
  // useEffect(() => {
  //   fetchReleasedListData(0); // Load first page on mount
  // }, []);

  const docDate = getValues("DocDate");
  const DocumentSeries = async () => {
    try {
      const res = await apiClient.get(
        `/DocSeriesV2/ForTrans?ObjType=202&DocDate=${docDate}`,
      );
      const response = res.data;
      if (response.success === true) {
        setDocumentSeries(response.values);
        setValue("Series", response.values[0].SeriesId);
        setValue("DocNum", response.values[0].DocNum);
        setValue("FinncPriod", response.values[0]?.FinncPriod ?? "");
        setValue("PIndicator", response.values[0]?.Indicator ?? "");
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

  const DocumentSeriesIssue = async () => {
    const DocDateIssue = getValuesIssue("DocDate");
    try {
      const res = await apiClient.get(
        `/DocSeriesV2/ForTrans?ObjType=60&DocDate=${DocDateIssue}`,
      );
      const response = res.data;
      if (response.success === true) {
        setDocumentSeriesIssue(response.values);
        setValueIssue("Series", response.values[0].SeriesId);
        setValueIssue("DocNum", response.values[0].DocNum);
        setValueIssue("FinncPriod", response.values[0]?.FinncPriod ?? "");
        setValueIssue("PIndicator", response.values[0]?.Indicator ?? "");
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

  const DocumentSeriesReciept = async () => {
    const DocDateReciept = getValuesReciept("DocDate");
    try {
      const res = await apiClient.get(
        `/DocSeriesV2/ForTrans?ObjType=59&DocDate=${DocDateReciept}`,
      );
      const response = res.data;
      if (response.success === true) {
        setDocumentSeriesReciept(response.values);
        setValueReciept("Series", response.values[0].SeriesId);
        setValueReciept("DocNum", response.values[0].DocNum);
        setValueReciept("FinncPriod", response.values[0]?.FinncPriod ?? "");
        setValueReciept("PIndicator", response.values[0]?.Indicator ?? "");
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

  useEffect(() => {
    if (SaveUpdateName === "SAVE") {
      DocumentSeries(docDate);
      DocumentSeriesIssue();
      DocumentSeriesReciept();
    }
  }, [
    SaveUpdateName,
    docDate,
    getValuesIssue("DocDate"),
    getValuesReciept("DocDate"),
  ]);
  const { isDirty } = useFormState({ control });

  const setOldOpenData = async (DocEntry) => {
    setok("");
    // setDrawerOpen(false)
    setapiloading(true);
    try {
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
          setSidebarOpen(false);
        });
      } else {
        fetchAndSetData(DocEntry);
        setSaveUpdateName("UPDATE");
        setSelectData(DocEntry);
        setSidebarOpen(false);
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

  const fetchAndSetData = async (DocEntry) => {
    try {
      const response = await apiClient.get(`/ProductionOrder/${DocEntry}`);
      if (!response.data || !response.data.values) {
        console.error("API Response missing `values` key:", response.data);
        return;
      }
      const item = response.data.values;
      if (item.AtcEntry > 0) {
        setFilesFromApi(item.AtcEntry);
      }
      if (item.Type === "D") {
        const remainingQty = item.PlannedQty - item.CmpltQty;
        const price = 150;
        const WhcLocationName = warehouseData.find(
          (LocCode) => LocCode.WHSCode === item.WHSCode,
        );
        if (remainingQty > 0) {
          const DISASSEMBLY = [
            {
              BaseRef: item.DocNum,
              ItemCode: item.ItemCode,
              ItemName: item.ProdName,
              Quantity: String(remainingQty),
              CpyIssueQty: String(remainingQty),
              Price: String(price),
              LineTotal: String(remainingQty * price),
              WHSCode: item.WHSCode,
              LocCode: WhcLocationName?.Location || "0",
              LocationName: WhcLocationName?.LocationName || "0",
              BinCode: WhcLocationName?.BinCode ?? "",
              DftBinAbs: WhcLocationName?.DftBinAbs,
              BinActivat: WhcLocationName?.BinActivat,
              OnHand: item.OnHand || "0",
              OnOrder: item.OnOrder || "0",
              IsCommited: item.IsCommited || "0",
              AcctCode: item.WipActCode,
              PlannedQty: item.PlannedQty,
              IssuedQty: item.CmpltQty,
              Type: item.Type,
              UomCode: item.UomCode,
              UomEntry: item.UomEntry,
              NumPerMsr: item.NumPerMsr || "1",
              Status: item.Status,
              BaseEntry: item.DocEntry,
              BaseLine: item?.LineNum ?? "0",
            },
          ];
          setValueIssue("oLines", DISASSEMBLY);
        }
      } else {
        const IssueCom = (item.oPOLines || []).reduce((acc, issue) => {
          const remainingQty =
            Number(issue.PlannedQty || 0) - Number(issue.IssuedQty || 0);
          if (remainingQty > 0 && issue.IssueType === "2") {
            // const remainingQty = issue.PlannedQty - issue.IssuedQty;
            const price = 150;
            const WhcLocationName = warehouseData.find(
              (LocCode) => LocCode.WHSCode === issue.WHSCode,
            );
            acc.push({
              BaseRef: item.DocNum,
              BaseEntry: issue.DocEntry,
              BaseLine: issue.LineNum,
              ItemCode: issue.ItemCode,
              ItemName: issue.ItemName,
              Quantity: remainingQty,
              CpyIssueQty: remainingQty,
              Price: String(price),
              LineTotal: String(remainingQty * price),
              WHSCode: issue.WHSCode,
              LocCode: WhcLocationName?.Location || "0",
              LocationName: WhcLocationName?.LocationName || "0",
              BinCode: WhcLocationName?.BinCode ?? "",
              DftBinAbs: WhcLocationName?.DftBinAbs,
              BinActivat: WhcLocationName?.BinActivat,
              OnHand: issue.OnHand || "0",
              OnOrder: issue.OnOrder || "0",
              IsCommited: issue.IsCommited || "0",
              AcctCode: issue.WipActCode,
              PlannedQty: issue.PlannedQty,
              IssuedQty: issue.IssuedQty,
              Type: item.Type,
              UomCode: issue.UomCode,
              UomEntry: issue.UomEntry,
              NumPerMsr: issue.NumPerMsr || "1",
              Status: item.Status,
            });
          }
          return acc;
        }, []);

        console.log("IssueCom", IssueCom);
        setValueIssue("oLines", IssueCom);
      }
      if (item.Type === "D") {
        const RecieptCom = (item.oPOLines || []).reduce((acc, issue) => {
          const remainingQty =
            Number(issue.PlannedQty || 0) - Number(issue.IssuedQty || 0);

          if (remainingQty > 0 && issue.IssueType === "2") {
            const price = 150;

            const WhcLocationName = warehouseData.find(
              (LocCode) => LocCode.WHSCode === issue.WHSCode,
            );

            acc.push({
              BaseRef: item.DocNum,
              ItemCode: issue.ItemCode,
              ItemName: issue.ItemName,
              Quantity: remainingQty,
              CpyIssueQty: remainingQty,
              Price: String(price),
              LineTotal: String(remainingQty * price),
              WHSCode: issue.WHSCode,

              LocCode: WhcLocationName?.Location || "0",
              LocationName: WhcLocationName?.LocationName || "0",
              BinCode: WhcLocationName?.BinCode ?? "",
              DftBinAbs: WhcLocationName?.DftBinAbs,
              BinActivat: WhcLocationName?.BinActivat,

              OnHand: issue.OnHand || "0",
              OnOrder: issue.OnOrder || "0",
              IsCommited: issue.IsCommited || "0",

              AcctCode: issue.WipActCode,
              PlannedQty: issue.PlannedQty,
              IssuedQty: issue.IssuedQty,
              Type: item.Type,

              UomCode: issue.UomCode || "0",
              UomEntry: issue.UomEntry || "0",
              NumPerMsr: issue.NumPerMsr || "1",

              TranType: "",
              CmpltQty: item.CmpltQty || "0",
              RjctQty: item.RjctQty || "0",
              Status: item.Status,
            });
          }

          return acc;
        }, []);

        setValueReciept("oLines", RecieptCom);
      } else {
        const planned = Number(item.PlannedQty) || 0;
        const complete = Number(item.CmpltQty) || 0;
        const reject = Number(item.RjctQty) || 0;
        const remainingQty = Number((planned - (complete + reject)).toFixed(2));
        const price = 150;

        if (remainingQty > 0) {
          const WhcLocationName = warehouseData.find(
            (LocCode) => LocCode.WHSCode === item.WHSCode,
          );

          const DISASSEMBLY = [
            {
              BaseRef: item.DocNum,
              ItemCode: item.ItemCode,
              ItemName: item.ProdName,
              Quantity: remainingQty,
              CpyIssueQty: remainingQty,
              Price: String(price),
              LineTotal: String(remainingQty * price),
              WHSCode: item.WHSCode,
              LocCode: WhcLocationName?.Location || "0",
              LocationName: WhcLocationName?.LocationName || "0",
              BinCode: WhcLocationName?.BinCode ?? "",
              DftBinAbs: WhcLocationName?.DftBinAbs,
              BinActivat: WhcLocationName?.BinActivat,
              OnHand: item.OnHand || "0",
              OnOrder: item.OnOrder || "0",
              IsCommited: item.IsCommited || "0",
              AcctCode: item.WipActCode || "1234567542",
              PlannedQty: item.PlannedQty,
              IssuedQty:
                parseFloat(item.CmpltQty ?? 0) + parseFloat(item.RjctQty ?? 0),
              Type: item.Type,
              UomCode: item.UomCode || "0",
              UomEntry: item.UomEntry || "0",
              NumPerMsr: item.NumPerMsr || "1",
              TranType: "C",
              CmpltQty: item.CmpltQty || "0",
              RjctQty: item.RjctQty || "0",
              Status: item.Status,
              BaseEntry: item.DocEntry,
              BaseLine: item.LineNum,
            },
          ];
          // resetReciept({
          //   ...getValuesReciept(),
          //   oLines:DISASSEMBLY
          // })
          setValueReciept("oLines", DISASSEMBLY);
        }
      }

      // const filteredLines = [];
      // for (const stage of item.oPOStagesLines || []) {
      //   filteredLines.push(stage); // Push stage first
      //   for (const line of item.oPOLines || []) {
      //     if (line.StageId === stage.SeqNum) {
      //       filteredLines.push(line); // Then push its related lines
      //     }
      //   }
      // }

      const filteredLines = [];

      const stages =
        item.oPOStagesLines && item.oPOStagesLines.length
          ? item.oPOStagesLines
          : [null]; // fallback stage

      for (const stage of stages) {
        if (stage) filteredLines.push(stage); // push stage only if it exists
        for (const line of item.oPOLines || []) {
          if (!stage || line.StageId === stage.SeqNum) {
            filteredLines.push(line);
          }
        }
      }
      reset({
        ...item,
        Type: item.Type ?? "296",
        DocEntry: item.DocEntry,
        DocNum: item.DocNum || "0",
        Name: item.Name,
        TreeType: item.TreeType,
        Object: "66",
        LocCode: item.LocCode || "0",
        PlAvgSize: item.PlAvgSize,
        oLines: filteredLines.map((item) => {
          const match = warehouseData.find(
            (loc) => loc.Location === item.LocCode,
          );
          return {
            ...item,
            rote: item.SeqNum ?? item.StageId,
            Qauntity: item.Quantity,
            Type: Number(item.ItemType ?? "296"),
            LocationName: match?.LocationName || "", // <- Get from matched object safely
            LocCode: match?.Location || "",
            ItemName: item?.Name ?? item?.ItemName ?? item.LineText,
            OpenQuantity:
              parseFloat(item.PlannedQty) - parseFloat(item.IssuedQty),
            Status: item.Status,
            WipActCode: item.WipActCode,
            // InventoryItem:"N"
          };
        }),
      });
    } catch (error) {
      console.error("❌ Error fetching or processing data:", error);
    } finally {
      // Optional: do cleanup or stop loaders
      setapiloading(false);
    }
  };

  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;
      // Use cache if exists
      if (itemCache[cacheKey]) {
        setItemList(itemCache[cacheKey]);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await apiClient.get(`/ItemsV2`, {
          params: {
            // PrchseItem: "Y",
            Status: 1,
            SearchText: search,
            Page: page,
            Limit: LIMIT,
          },
        });
        if (data.success) {
          const items = data.values || [];
          setItemCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));
          setItemList(items);
          const estimatedRowCount =
            page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;
          setRowCount(estimatedRowCount);
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
    [itemCache],
  );
  useEffect(() => {
    fetchItems(currentPage, searchText);
  }, [currentPage, searchText, openItem, fetchItems]);
  const handlePaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage],
  );
  const handleSearchChange = useCallback(
    (search) => {
      setSearchText(search);
      setCurrentPage(0); // Reset to page 0 on search
      setItemCache({}); // Clear cache on new search
    },
    [searchText],
  );

  const closeModel = () => {
    setOpenItem(false);
    setSearchText("");
    setCurrentPage(0);
    setSelectedRows([]);
    // setItemCache({}); // Clear cache on new search
  };

  //#region  Route Stage Api Calling Searching And Pagination
  const RounteStageFunc = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;

      // Serve from cache
      if (routeStageCache[cacheKey]) {
        setrouteStageList(routeStageCache[cacheKey]);
        return;
      }
      setIsLoading(true);
      try {
        let response;
        if (search) {
          response = await apiClient.get(
            `/RouteStage/Search/${search}/1/${page}/20`,
          );
        } else {
          response = await apiClient.get(`/RouteStage/Pages/1/${page}/20`);
        }
        if (response.data.success) {
          const services = response.data?.values || [];
          // Save to cache
          setrouteStageCache((prev) => ({
            ...prev,
            [cacheKey]: services,
          }));

          setrouteStageList(services);

          const estimatedCount =
            page === 0 ? 21 : page * 20 + services.length + 1;
          setrouteStageRowCount(estimatedCount);
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Something went wrong",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.message || "An error occurred",
          icon: "error",
          confirmButtonText: "Ok",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [routeStageCache],
  );

  const handleRounteStagePaginationModelChange = useCallback(
    (model) => {
      if (model.page !== routeStagecurrentPage) {
        setrouteStageCurrentPage(model.page);
      }
    },
    [routeStagecurrentPage],
  );

  const handleRounteStageSearchChange = useCallback((searchText) => {
    setrouteStageSearchText(searchText);
    setrouteStageCurrentPage(0);
    setrouteStageCache({}); // Clear cache on new search
  }, []);
  useEffect(() => {
    RounteStageFunc(routeStagecurrentPage, routeStagesearchText);
  }, [routeStagecurrentPage, routeStagesearchText, RounteStageFunc]);

  // --- Fetch BOMs (Memoized) ---
  const fetchBoms = useCallback(
    async (page = 0, search = "") => {
      setIsLoading(true);

      try {
        // Abort previous request
        if (controllerRef.current) {
          controllerRef.current.abort();
        }

        const controller = new AbortController();
        controllerRef.current = controller;

        const response = await apiClient.get(`/BillOfMaterial`, {
          params: {
            Status: "1",
            page,
            search,
            TreeType: Type === "P" ? "P" : "",
          },
          signal: controller.signal,
        });

        if (response.data.success === true) {
          const items = response.data.values || [];
          setBomList(items);

          const estimatedRowCount =
            page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;

          setBomRowCount(estimatedRowCount);
        } else {
          Swal.fire("Error!", response.message, "warning");
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Previous request canceled.");
        } else if (err.name === "CanceledError") {
          console.log("Request aborted.");
        } else {
          console.error("Fetch error:", err);
          Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [Type, LIMIT], // stable dependencies
  );

  console.log("BomList", BomList);

  useEffect(() => {
    fetchBoms(BomcurrentPage, BomsearchText);

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [BomcurrentPage, BomsearchText, Type, fetchBoms]);

  // --- Pagination Change (Memoized) ---
  const handleBomPaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== BomcurrentPage) {
        setBomCurrentPage(page);
      }
    },
    [BomcurrentPage],
  );

  // --- Search Change (Memoized) ---
  const handleBomSearchChange = useCallback((search) => {
    setBomSearchText(search);
    setBomCurrentPage(0); // Reset to start
    setBomCache({}); // Clear cache
  }, []);
  console.log("item dfdsfds", BomList);
  const closeBom = () => {
    setOpenBom(false);
    setBomSearchText("");
    setBomCurrentPage(0);
  };
  //#endregion Route Stage=========

  const closeModelRoute = () => {
    setOpenRouteStage(false);
  };

  const handleBomClick = async (ids) => {
    const selectedRow = ids.row;
    const ItemCode = selectedRow.Code || selectedRow.ItemCode;
    const ProdName = selectedRow.Name || selectedRow.ItemName;
    const WHSCode = selectedRow.ToWH || selectedRow.DefaultWhs;
    const UomCode = selectedRow.Uom || selectedRow.InvntoryUOM;

    const matchingLoc = warehouseData.find((row) => row.WHSCode === WHSCode);
    const filteredLines = [];
    const childItemCode = currentData.oLines.some(
      (item) => item.Code === ItemCode,
    );
    if (childItemCode) {
      Swal.fire({
        text: "header item and line item cannot be the same.",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }
    if (selectedRow.oPTStagesLines?.length > 0) {
      // Case 1: Stages exist
      for (const stage of selectedRow.oPTStagesLines) {
        filteredLines.push(stage); // Push stage first

        for (const line of selectedRow.oPTLines || []) {
          if (line.StageId === stage.SeqNum) {
            const PlannedQty = QuantityPlanned(
              line.BaseQty || 0,
              line.AddQuantit || 0,
            );

            filteredLines.push({
              ...line,
              PlannedQty,
              LocCode: matchingLoc?.Location ?? "",
              LocationName: matchingLoc?.LocationName ?? "",
            });
          }
        }
      }
    } else {
      // Case 2: No stages exist
      for (const line of selectedRow.oPTLines || []) {
        const PlannedQty = QuantityPlanned(
          line.BaseQty || 0,
          line.AddQuantit || 0,
        );

        filteredLines.push({
          ...line,
          PlannedQty,
          LocCode: matchingLoc?.Location ?? "",
          LocationName: matchingLoc?.LocationName ?? "",
        });
      }
    }

    console.log("Filtered and sorted lines:", filteredLines);
    const StartDate = getValues("StartDate");
    const EndDate = getValues("DueDate");

    const oLines = filteredLines.map((item) => ({
      ...item,
      rote: item.SeqNum ?? item.StageId,
      AdditQty: item?.AddQuantit ?? 0,
      WHSCode: item.Warehouse,
      IssueType: item.IssueMthd,

      UomCode: item.Uom,
      Type: Number(item.Type ?? "296"),
      price_List_DocEntry: item.PriceList,
      ItemCode: item.Code,
      ItemName: item?.Name ?? item?.ItemName ?? item.LineText,
      PlannedQty: item.PlannedQty,
      WipActCode: item.WipActCode,
      StartDate: StartDate,
      EndDate: EndDate,
    }));

    setValue("oLines", oLines);
    setValue("ItemCode", ItemCode);
    setValue("ProdName", ProdName);
    setValue("WHSCode", WHSCode);
    setValue("LocCode", matchingLoc?.Location ?? "");
    setValue("UomCode", UomCode);
    closeBom();
  };
  const handleRouteClick = (ids) => {
    const gridRowIndex = getValues("selectedRowIndex");
    const startIndex = gridRowIndex - 1;

    const lines = watch("oLines");
    const usedRoutes = lines
      .filter((row) => row?.Type === 296 && row?.rote)
      .map((row) => Number(row.rote));

    const nextRote = usedRoutes.length ? Math.max(...usedRoutes) + 1 : 1;
    const updatedLines = [...lines];
    updatedLines[startIndex] = {
      ...updatedLines[startIndex],
      DocEntry: ids.row.DocEntry,
      Type: 296,
      ItemCode: ids.row.Code,
      ItemName: ids.row.Description,
      Qauntity: "",
      AddQuantit: "",
      Uom: ids.row.InvntoryUOM,
      Warehouse: ids.row.DefaultWhs,
      StageId: nextRote,
      rote: nextRote,
      StartDate: dayjs(currentData.StartDate).format("YYYY-MM-DD"),
      EndDate: dayjs(currentData.DueDate).format("YYYY-MM-DD"),
      Price: "",
      PriceList: "",
      Total: "",
      PrdStdCst: "",
      TtlPrdStdCst: "",
      IssueMthd: "",
      WipActCode: "",
    };

    // for (let i = startIndex + 1; i < updatedLines.length; i++) {
    //   if (Number(updatedLines[i].Type) === 296) {
    //     break;
    //   }
    //   updatedLines[i] = {
    //     ...updatedLines[i],
    //     StageId: nextRote,
    //     rote: nextRote,
    //   };
    // }
    // lines = normalizeRoutes(updatedLines)
    reset({
      ...getValues(),
      oLines: normalizeRoutes(updatedLines),
    });

    closeModelRoute();
  };

  const handleCellClick = (id) => {
    const selectedIDs = new Set(id);
    setSelectedRows((prev) => {
      const stillSelected = prev.filter((row) => selectedIDs.has(row.DocEntry));
      const newSelections = itemList
        .filter((row) => selectedIDs.has(row.DocEntry))
        .filter(
          (row) => !stillSelected.some((r) => r.DocEntry === row.DocEntry),
        )
        .map((data) => {
          const PriceTerm = data.oLines.find(
            (itempprice) =>
              itempprice.PriceList === currentData.price_List_DocEntry,
          );
          const PriceBefDi = PriceTerm?.Price ?? "0";
          const TtlPrdStdCst =
            data.PrdStdCst *
            (1 / currentData.Qauntity + 0 / currentData.PlAvgSize);
          const matchingWarehouse = warehouseData.find(
            (w) => w.WHSCode === data.DefaultWhs,
          );
          return {
            DocEntry: data.DocEntry,
            ItemCode: data.ItemCode,
            ItemName: data.ItemName,
            UomCode: data.InvntoryUOM,
            WHSCode: data.DefaultWhs,
            Price: PriceBefDi,
            BasePrice: PriceBefDi || 0,
            Total: PriceBefDi?.Price ?? 0 * 1,
            AddQuantit: "0",
            Qauntity: 1,
            AdditQty: "0",
            BaseQty: "1",
            PlannedQty: getValues("PlannedQty"),
            Uom: data.UgpEntry === "-1" ? "Manual" : data.UOMCode,
            PriceList: currentData.price_List,
            price_List_DocEntry: currentData.price_List_DocEntry,
            Warehouse: data.DefaultWhs,
            WipActCode: "",
            PrdStdCst: data.PrdStdCst,
            TtlPrdStdCst: TtlPrdStdCst,
            IssueMthd: data.IssueMthd,
            IssueType: data.IssueMthd,
            UomEntry: data.IUoMEntry,
            LocCode: matchingWarehouse?.Location ?? "",
            LocationName: matchingWarehouse?.LocationName ?? "",
            InventoryItem: data.InventoryItem,
            EvalSystem: data.EvalSystem,
            OnOrder: data.OnOrder,
            IsCommited: data.IsCommited,
            OnHand: data.OnHand,
            StartDate: dayjs(currentData.StartDate).format("YYYY-MM-DD"),
            EndDate: dayjs(currentData.DueDate).format("YYYY-MM-DD"),
          };
        });

      const combined = [...stillSelected, ...newSelections];
      return combined;
    });
  };
  const normalizeRoutes = (lines) => {
    const result = [];
    let currentStage = 0;

    lines.forEach((row) => {
      if (Number(row.Type) === 296) {
        currentStage += 1;
        result.push({
          ...row,
          StageId: currentStage,
          rote: currentStage,
        });
      } else {
        result.push({
          ...row,
          StageId: currentStage,
          rote: currentStage,
        });
      }
    });

    return result;
  };

  const onSubmit = () => {
    const startIndex = Number(getValues("selectedRowIndex"));
    if (isNaN(startIndex) || startIndex < 1) return;

    let lines = [...getValues("oLines")];

    selectedRows.forEach((row, i) => {
      const idx = startIndex - 1 + i;

      const newRow = {
        ...lines[idx],
        ...row,
        Type: 4, // child
      };

      if (idx < lines.length) {
        lines[idx] = newRow;
      } else {
        lines.push(newRow);
      }
    });

    // 🔥 Normalize once
    lines = normalizeRoutes(lines);

    setValue("oLines", lines);

    closeModel();
  };
  let handleChangeStartDate = (ReqDate) => {
    const StartDate = watch("StartDate");
    if (getValues("oLines").length > 0) {
      if (StartDate) {
        Swal.fire({
          text: "Do you want to update the existing table rows with the new Start date?",
          icon: "warning",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        }).then((msg) => {
          if (msg.isConfirmed) {
            const updatedLines = getValues("oLines").map((data) => ({
              ...data,
              StartDate,
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

  let handleChangeDueDate = (ReqDate) => {
    const DueDate = watch("DueDate");
    if (getValues("oLines").length > 0) {
      if (DueDate) {
        Swal.fire({
          text: "Do you want to update the existing table rows with the new Start date?",
          icon: "warning",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        }).then((msg) => {
          if (msg.isConfirmed) {
            const updatedLines = getValues("oLines").map((data) => ({
              ...data,
              EndDate: DueDate,
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

  //    const validateAllLines = (lines) => {
  //   const errors = [];
  //   const errorIds = [];
  //   lines.forEach((line, index) => {
  //     const lineNo = index + 1;
  //     const rowId = line.id ?? index;
  //     debugger
  //     if (!line.WHSCode && line.Type === 4 ) {
  //       errors.push(
  //         `Line ${lineNo}: ${line.ItemCode} (Warehouse not selected)`,
  //       );
  //       errorIds.push(rowId);
  //     }

  //     // 🔴 Quantity
  //     if (Number(line.Quantity) <= 0 && line.Type === 4) {
  //       errors.push(
  //         `Line ${lineNo}: ${line.ItemCode} (Quantity must be greater than zero)`,
  //       );
  //       errorIds.push(rowId);
  //     }

  //     // 🔴 Price
  //     if (Number(line.Price) <= 0 && line.Type === 4) {
  //       errors.push(
  //         `Line ${lineNo}: ${line.ItemCode} (Price must be greater than zero)`,
  //       );
  //       errorIds.push(rowId);
  //     }

  //     //Account code
  //     if (!line.WipActCode && line.Type === 4) {
  //       errors.push(`Line ${lineNo}: ${line.ItemCode} (AcctCode not selected)`);
  //       errorIds.push(rowId);
  //     }

  //   });

  //   return {
  //     isValid: errors.length === 0,
  //     errors,
  //     errorIds: [...new Set(errorIds)],
  //   };
  // };

  const handleSubmitForm = async (data) => {
    // if (data.ItemCode ) {
    //   Swal.fire({
    //     text: "ItemCode.",
    //     icon: "warning",
    //     confirmButtonText: "Ok",
    //   });
    //   return false;
    // }
    // const invalidLines = data.oLines.filter(
    //   (line) => line.LocCode && line.LocCode !== data.LocCode
    // );
    // if (SaveUpdateName === "SAVE") {
    //   const { isValid, errors, errorIds } = validateAllLines(data.oLines);

    //   if (!isValid) {
    //     Swal.fire({
    //       icon: "warning",
    //       title: "Document Validation Error",
    //       html: errors.join("<br/>"),
    //       confirmButtonText: "OK",
    //     });
    //     return false;
    //   }
    // }
    if (data.oLines.length === 0) {
      Swal.fire({
        title: "Select Item",
        text: "Please select at least one item.",
        icon: "warning",
        confirmButtonText: "Ok",
        timer: 3000,
      });
      return false;
    }
    const invalidLines = data.oLines.filter(
      (line) =>
        line.Type === 4 && // ✅ check only ItemType 4
        line.LocCode &&
        line.LocCode !== data.LocCode,
    );

    if (invalidLines.length > 0) {
      Swal.fire({
        title: "Error!",
        text: "Header Location Code and all line Location Codes must be the same.",
        icon: "warning",
        confirmButtonText: "OK",
        width: 320, // small popup
      });
      return false;
    }
    const formData = new FormData();
    formData.append("DocEntry", allFormData.AtcEntry || "");
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
    let attachmentDocEntry = fileData?.length === 0 ? "0" : data.AtcEntry;
    if (fileData?.length > 0 && data.AtcEntry === "0") {
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
      DocEntry: "",
      Status: data.Status,
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      DocNum: data.DocNum,
      Series: String(data.Series),
      ItemCode: data.ItemCode,
      Type: data.Type,
      LocCode: data.LocCode,
      PlannedQty: data.PlannedQty || "0",
      CmpltQty: data.CmpltQty || "0",
      RjctQty: data.RjctQty || "0",
      PostDate: dayjs(data.PostDate).format("YYYY-MM-DD"),
      DueDate: dayjs(data.DueDate).format("YYYY-MM-DD"),
      OriginAbs: data.OriginAbs,
      OriginNum: data.OriginNum,
      Comments: data.Comments,
      CloseDate: dayjs(undefined).format("YYYY-MM-DD"),
      RlsDate: dayjs(undefined).format("YYYY-MM-DD"),
      CardCode: data.CardCode,
      WHSCode: data.WHSCode,
      JrnlMemo: data.JrnlMemo,
      TransId: data.TransId || "0",
      SysCloseDt: data.SysCloseDt,
      SysCloseTm: data.SysCloseTm,
      StartDate: data.StartDate,
      ObjType: "202",
      ProdName: data.ProdName,
      RouDatCalc: data.RouDatCalc,
      UpdAlloc: data.UpdAlloc,
      AtcEntry: attachmentDocEntry,
      Attachment: data.Attachment,
      Uom: data.Uom || "0",
      LinkToObj: data.LinkToObj,
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oPOLines: data.oLines
        .filter((stage) => stage.Type !== 296)
        .map((oPTLines) => ({
          LineNum: oPTLines.LineNum || "0",
          DocEntry: "",
          UserId: user.UserId,
          Status: data.Status,
          CreatedBy: user.UserName,
          CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
          Father: data.ItemCode,
          ItemCode: oPTLines.ItemCode,
          ItemName: oPTLines.ItemName,
          BaseQty: String(oPTLines.BaseQty),
          PlannedQty: String(oPTLines.PlannedQty),
          IssuedQty: oPTLines.IssuedQty || "0",
          IssueType: oPTLines.IssueType,
          WHSCode: oPTLines.WHSCode || "0",
          LocCode: oPTLines.LocCode || "",
          UomCode: oPTLines.UomCode || "0",
          UomEntry: oPTLines.UomEntry || "0",
          Comment: oPTLines.Comment || "",
          Type: String(oPTLines.Type) || "0",
          ItemType: String(oPTLines.Type) || "0",
          WipActCode: oPTLines.WipActCode || "0",
          AdditQty: String(oPTLines.AdditQty) || "0",
          StageId: String(oPTLines.rote) || "0",
          ChildNum: String(oPTLines.rote) || "0",
          VisOrder: oPTLines.VisOrder || "0",
          Object: "202",
          CompTotal: "0",
          ReleaseQty: oPTLines.ReleaseQty || "0",
          ResAlloc: oPTLines.ResAlloc || "0",
          StartDate: dayjs(oPTLines.StartDate).format("YYYY-MM-DD"),
          EndDate: dayjs(oPTLines.EndDate).format("YYYY-MM-DD"),
          BaseQtyNum: oPTLines.BaseQtyNum || "0",
          BaseQtyDen: oPTLines.BaseQtyDen || "0",
          LineText: oPTLines.Type === -18 ? oPTLines.ItemName : "0",
          EvalSystem: oPTLines.EvalSystem || "0",
          InventoryItem: oPTLines.InventoryItem || "0",
        })),
      oPO2Lines: [],
      oPOStagesLines: data.oLines
        .filter((stage) => stage.Type === 296)
        .map((stageitem) => ({
          LineNum: stageitem.LineNum || "0",
          DocEntry: "",
          UserId: user.UserId,
          Status: data.Status,
          CreatedBy: user.UserName,
          CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
          CompTotal: data.CompTotal || "0",
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
          StartDate: dayjs(stageitem.StartDate).format("YYYY-MM-DD"),
          EndDate: dayjs(stageitem.EndDate).format("YYYY-MM-DD"),
          Father: data.Code,
          StageId: String(stageitem.StageId),
          ReqDays: "0",
          WaitDays: "0",
          RtCalcProp: "0",
          ItemCode: stageitem.ItemCode,
          Name: stageitem.ItemName,
          SeqNum: String(stageitem.rote),
          StgEntry: String(stageitem.StageId || "0"),
          Type: stageitem.Type,
        })),
    };

    console.log("sfddsf", obj);
    const hasInvalidLine = (obj.oPOLines || []).some(
      (line) =>
        line.InventoryItem === "N" &&
        (line.EvalSystem === "1" || line.EvalSystem === "3"),
    );
    if (hasInvalidLine) {
      Swal.fire({
        // title: "Production Data",
        text: "The valuation method for a non-inventory item must be standard.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    const missingWhs = (obj.oPOLines || []).some((line) => !line.ItemCode);
    if (missingWhs) {
      Swal.fire({
        title: `Missing Required Fields`,
        text: `Please select the ItemCode for all lines.`,
        icon: "warning",
        confirmButtonText: "Ok",
      });

      return false;
    }
    if (obj.oPOStagesLines?.length > 0) {
      const firstLine = data.oLines[0];
      if (firstLine?.Type !== 296) {
        Swal.fire({
          title: "Route",
          text: "Route stage must be the first line",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }
    }

    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/ProductionOrder`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearForm();

            planned.refresh();
            settab(allFormData.Status);
            DocumentSeries();
            Swal.fire({
              title: "Success!",
              text: "Production Order saved Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            if (attachmentDocEntry > 0) {
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
          if (attachmentDocEntry > 0) {
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
        text: `Do You Want Update "${obj.ItemCode}"`,
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
            .put(`/ProductionOrder/Update/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                ClearForm();
                // setPlannedListData([]);
                // fetchPlannedListData(0);
                // fetchReleasedListData(0);

                released.refresh();
                closed.refresh();
                planned.refresh();
                settab(allFormData.Status);

                // setReleasedListData([]);
                // fetchClosedListData(0);
                // setClosedListData([]);
                Swal.fire({
                  title: "Success!",
                  text: "Production Order Updated",
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
            text: "Production Order  Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const validateAllLinesIssue = (lines) => {
    const errors = [];
    const errorIds = [];
    lines.forEach((line, index) => {
      const lineNo = index + 1;
      const rowId = line.id ?? index;
      if (!line.WHSCode) {
        errors.push(
          `Line ${lineNo}: ${line.ItemCode} (Warehouse not selected)`,
        );
        errorIds.push(rowId);
      }

      // // 🔴 UOM
      // if (!line.UoMCode) {
      //   errors.push(`Line ${lineNo}: ${line.ItemCode} (UOM not selected)`);
      //   errorIds.push(rowId);
      // }

      // 🔴 Quantity
      if (Number(line.Quantity) <= 0) {
        errors.push(
          `Line ${lineNo}: ${line.ItemCode} (Quantity must be greater than zero)`,
        );
        errorIds.push(rowId);
      }

      // 🔴 Price
      if (Number(line.Price) <= 0) {
        errors.push(
          `Line ${lineNo}: ${line.ItemCode} (Price must be greater than zero)`,
        );
        errorIds.push(rowId);
      }
      // 🔴 BIN
      if (line.BinActivat === "Y") {
        const binLines = line.oDocBinLocationLines || [];
        const totalBinQty = binLines.reduce(
          (sum, b) => sum + Number(b.Quantity || 0),
          0,
        );

        if (binLines.length === 0 || totalBinQty !== Number(line.Quantity)) {
          errors.push(`Line ${lineNo}: ${line.ItemCode} (Bin Qty mismatch)`);
          errorIds.push(rowId);
        }
      }

      //Account code
      if (!line.AcctCode) {
        errors.push(`Line ${lineNo}: ${line.ItemCode} (AcctCode not selected)`);
        errorIds.push(rowId);
      }
      // // 🔴 BATCH
      // if (line.ManBtchNum === "Y" && line.ManSerNum === "N") {
      //   const batchLines = line.oBatchLines || [];
      //   const totalBatchQty = batchLines.reduce(
      //     (sum, b) => sum + Number(b.BatchQty || 0),
      //     0,
      //   );

      //   if (totalBatchQty !== Number(line.InvQty || 0)) {
      //     errors.push(`Line ${lineNo}: ${line.ItemCode} (Batch Qty mismatch)`);
      //     errorIds.push(rowId);
      //   }
      // }

      // // 🔴 SERIAL
      // if (line.ManBtchNum === "N" && line.ManSerNum === "Y") {
      //   const serialLines = line.oSerialLines || [];
      //   if (serialLines.length !== Number(line.InvQty || 0)) {
      //     errors.push(`Line ${lineNo}: ${line.ItemCode} (Serial Qty mismatch)`);
      //     errorIds.push(rowId);
      //   }
      // }
    });

    return {
      isValid: errors.length === 0,
      errors,
      errorIds: [...new Set(errorIds)],
    };
  };
  const handleSubmitISsue = (data) => {
    const { isValid, errors, errorIds } = validateAllLinesIssue(data.oLines);

    if (!isValid) {
      Swal.fire({
        icon: "warning",
        title: "Document Validation Error",
        html: errors.join("<br/>"),
        confirmButtonText: "OK",
      });
      return false;
    }
    const obj = {
      ...data,
      Series: String(data.Series),
      DocTotal: String(data.DocTotal),
      BaseRef: "0",
      LocCode: "0",
      FinncPriod: String(data.FinncPriod || "0"),
      ObjType: "60",
      BaseType: "202",
      PIndicator: data.PIndicator || "0",
      oLines: (data.oLines || []).map((item) => ({
        ...item,
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedBy: user.UserName,
        Status: item.Status || "4",
        InvQty: String(item.Quantity),
        Quantity: String(item.Quantity),
        LineTotal: String(item.LineTotal),
        OpenQuantity: String(item.Quantity),
        BaseEntry: item.BaseEntry || "0",
        BaseLine: item.BaseLine || "0",
        UomCode: item.UomCode || "0",
        UomEntry: item.UomEntry || "0",
        BaseType: "202",
        UgpCode: "0",
        unitMsr: "0",
        CodeBars: "0",
        MinLevel: "0",
        Rate: "0",
        Currency: "0",
        StockSum: "0",
        TotalSum: "0",
        StockSumFc: "0",
        StockSumSc: "0",
        TotalSumSy: "0",
        oDocBinLocationLines: [],
        unitMsr2: "0",
        UomCode2: "0",
        DiscPrcnt: "0",
        UomEntry2: "0",
        PriceBefDi: item.Price,
        StockPrice: "0",
        WeightUnit: "0",
      })),
    };
    console.log(obj);
    apiClient
      .post(`/GoodsIssue`, obj)
      .then((res) => {
        if (res.data.success) {
          setopenIssueComp(false);
          DocumentSeriesIssue();
          ClearForm();
          Swal.fire({
            title: "Success!",
            text: "Saved Successfully",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
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
        Swal.fire({
          title: "Error!",
          text: "something went wrong" + error,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      });
  };

  const handleBinlocationSubmit = (rowsFromModal) => {
    const selectedRow = BinlocListData;
    const updatedOLines = (getValuesReciept("oLines") || []).map(
      (row, index) =>
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
    setValueReciept("oLines", updatedOLines);
    dispatch({ type: "CLOSE", modal: "BinLocationOpenReciept" });
  };

  const handleBinlocationSubmitIssue = (rowsFromModal) => {
    const selectedRow = getValues("BinLocation");
    const updatedOLines = (getValuesIssue("oLines") || []).map((row, index) =>
      index === selectedRow.id
        ? {
            ...row,
            oDocBinLocationLines: (rowsFromModal || []).map((binitem) => ({
              UserId: user.UserId,
              CreatedBy: user.UserName,
              ModifiedBy: user.UserName,
              Status: 1,
              MessageID: 0,
              BinAbs: Number(binitem.DocEntry),
              SnBMDAbs: 0,
              Quantity: binitem.allocated,
              ITLEntry: 0,
              BinCode: binitem.BinCode,
            })),
          }
        : row,
    );

    setValueIssue("oLines", updatedOLines);

    dispatch({ type: "CLOSE", modal: "BinLocationOpenIssue" });
  };
  const validateAllLinesReciept = (lines) => {
    const errors = [];
    const errorIds = [];
    lines.forEach((line, index) => {
      const lineNo = index + 1;
      const rowId = line.id ?? index;
      if (!line.WHSCode) {
        errors.push(
          `Line ${lineNo}: ${line.ItemCode} (Warehouse not selected)`,
        );
        errorIds.push(rowId);
      }

      // // 🔴 UOM
      // if (!line.UoMCode) {
      //   errors.push(`Line ${lineNo}: ${line.ItemCode} (UOM not selected)`);
      //   errorIds.push(rowId);
      // }

      // 🔴 Quantity
      if (Number(line.Quantity) <= 0) {
        errors.push(
          `Line ${lineNo}: ${line.ItemCode} (Quantity must be greater than zero)`,
        );
        errorIds.push(rowId);
      }

      // 🔴 Price
      if (Number(line.Price) <= 0) {
        errors.push(
          `Line ${lineNo}: ${line.ItemCode} (Price must be greater than zero)`,
        );
        errorIds.push(rowId);
      }

      // // 🔴 BIN
      // if (line.BinActivat === "Y") {
      //   const binLines = line.oDocBinLocationLines || [];
      //   const totalBinQty = binLines.reduce(
      //     (sum, b) => sum + Number(b.Quantity || 0),
      //     0,
      //   );

      //   if (binLines.length === 0 || totalBinQty !== Number(line.Quantity)) {
      //     errors.push(`Line ${lineNo}: ${line.ItemCode} (Bin Qty mismatch)`);
      //     errorIds.push(rowId);
      //   }
      // }

      //Account code
      if (!line.AcctCode) {
        errors.push(`Line ${lineNo}: ${line.ItemCode} (AcctCode not selected)`);
        errorIds.push(rowId);
      }

      if (line.BinActivat === "Y") {
        const binLines = line.oDocBinLocationLines || [];
        const totalBinQty = binLines.reduce(
          (sum, b) => sum + Number(b.Quantity || 0),
          0,
        );

        if (binLines.length === 0 || totalBinQty !== Number(line.Quantity)) {
          errors.push(`Line ${lineNo}: ${line.ItemCode} (Bin Qty mismatch)`);
          errorIds.push(rowId);
        }
      }
      // // 🔴 BATCH
      // if (line.ManBtchNum === "Y" && line.ManSerNum === "N") {
      //   const batchLines = line.oBatchLines || [];
      //   const totalBatchQty = batchLines.reduce(
      //     (sum, b) => sum + Number(b.BatchQty || 0),
      //     0,
      //   );

      //   if (totalBatchQty !== Number(line.InvQty || 0)) {
      //     errors.push(`Line ${lineNo}: ${line.ItemCode} (Batch Qty mismatch)`);
      //     errorIds.push(rowId);
      //   }
      // }

      // // 🔴 SERIAL
      // if (line.ManBtchNum === "N" && line.ManSerNum === "Y") {
      //   const serialLines = line.oSerialLines || [];
      //   if (serialLines.length !== Number(line.InvQty || 0)) {
      //     errors.push(`Line ${lineNo}: ${line.ItemCode} (Serial Qty mismatch)`);
      //     errorIds.push(rowId);
      //   }
      // }
    });

    return {
      isValid: errors.length === 0,
      errors,
      errorIds: [...new Set(errorIds)],
    };
  };
  const SubmitReciept = (data) => {
    const { isValid, errors, errorIds } = validateAllLinesReciept(data.oLines);

    if (!isValid) {
      Swal.fire({
        icon: "warning",
        title: "Document Validation Error",
        html: errors.join("<br/>"),
        confirmButtonText: "OK",
      });
      return false;
    }
    const obj = {
      ...data,
      Series: String(data.Series),
      DocTotal: String(data.DocTotal),
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      BaseRef: "0",
      ObjType: "59",
      BaseType: "202",
      LocCode: "0",
      Ref2: "",
      DocCur: "INR",
      Volume: "0",
      Weight: "0",
      DocRate: "0",
      SysRate: "0",
      TaxDate: dayjs(undefined).format("YYYY-MM-DD"),
      VolUnit: "0",
      GroupNum: "0",
      CurSource: "L",
      DocTotalFC: "0",
      DocTotalSy: "0",
      InvntSttus: "0",
      WeightUnit: "0",
      oLines: (data.oLines || []).map((item) => ({
        ...item,
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedBy: user.UserName,
        Status: data.Status,
        Quantity: String(item.Quantity),
        InvQty: String(item.Quantity),
        LineTotal: String(item.LineTotal),
        UomCode: item.UomCode || "0",
        IssuedQty: String(
          parseFloat(item.IssuedQty) + parseFloat(item.Quantity),
        ),
        UomEntry: item.UomEntry || "0",
        TranType: item.TranType || "C",
        CodeBars: "0",
        BaseEntry: item.BaseEntry || "0",
        BaseLine: item.BaseLine || "0",
        BaseType: "202",
        unitMsr: "0",
        Rate: "0",
        Currency: "0",
        StockSum: "0",
        TotalSum: "0",
        StockSumFc: "0",
        StockSumSc: "0",
        TotalSumSy: "0",
        oDocBinLocationLines: item.oDocBinLocationLines || [],
        UgpCode: "0",
        MinLevel: "0",
        unitMsr2: "1",
        UomCode2: "0",
        DiscPrcnt: "0",
        UomEntry2: "0",
        PriceBefDi: item.Price,
        StockPrice: "0",
        WeightUnit: "0",
        OpenQuantity: String(item.Quantity),
      })),
    };
    console.log("receipt", obj);
    apiClient
      .post(`/GoodsReceipt`, obj)
      .then((res) => {
        if (res.data.success) {
          setReciept(false);
          DocumentSeriesReciept();
          ClearForm();

          Swal.fire({
            title: "Success!",
            text: "Saved Successfully",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
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
        Swal.fire({
          title: "Error!",
          text: "something went wrong" + error,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      });
  };

  const isCellEditableFn = (params) => {
    const { field, row } = params;

    // --- Type column always editable ---
    if (field === "Type") return true;

    // --- ROUTE STAGE (Type = 296) ---
    const routeFields = ["rote", "StartDate", "EndDate", "Status"];
    if (Number(row.Type) === 296 && routeFields.includes(field)) {
      return true;
    }

    // --- ITEM (Type = 4) ---
    const itemFields = [
      "BaseQty",
      "AdditQty",
      "PlannedQty",
      "IssuedQty",
      "OpenQuantity",
      "WHSCode",
      "UomCode",
      "WipActCode",
      "IssueType",
    ];

    if (Number(row.Type) === 4 && itemFields.includes(field)) {
      if (field === "IssueType" && row.InventoryItem === "N") {
        return false; // disabled
      }

      return true;
    }

    return false;
  };

  const prevValueRef = React.useRef({});
  const oLines = getValues("oLines"); // get latest form rows

  const roteOptions = useMemo(
    () =>
      oLines
        .filter((row) => Number(row.Type) === 296 && row.rote != null)
        .map((t) => ({ value: Number(t.rote), label: t.rote })),
    [oLines],
  );

  const ItemColumn = [
    {
      id: 1,
      field: "id",
      headerName: "LINE NO",
      width: 50,
      renderCell: (params) => <span>{params.id}</span>,
    },
    {
      field: "Type",
      headerName: "Type",
      width: 130,
      headerAlign: "center",
      align: "center",
      sortable: false,
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: 4, label: "Item" },
        { value: 296, label: "Route Stage" },
        { value: -18, label: "Text" },
        { value: 290, label: "Resource" },
      ],
    },
    {
      field: "ItemCode",
      headerName: "Item Code",
      sortable: false,
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const rowType = params.row.Type || "";
        let openItemCode = !!params.row.ItemCode;
        const handleIconClick = () => {
          setValue("selectedRowIndex", params.row.id);
          switch (rowType) {
            case 4:
              setOpenItem(true);
              break;
            case 296:
              setOpenRouteStage(true);
              break;
            case -18:
              // setOpenTextModal(true);
              break;
            case 290:
              // setOpenResource(true);
              break;
            default:
              break;
          }
        };
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
                if (!openItemCode) {
                  handleIconClick();
                }
              }
            }}
            sx={{ width: "100%", height: "100%" }}
          >
            {/* ---- UOM Text ---- */}
            <Grid item xs zeroMinWidth>
              <Tooltip title={params.row.ItemCode || ""}>
                <Typography
                  noWrap
                  textAlign="center"
                  sx={{ fontSize: 13, cursor: "default" }}
                >
                  {params.row.ItemCode || ""}
                </Typography>
              </Tooltip>
            </Grid>

            <Grid item>
              <IconButton
                size="small"
                onClick={() => {
                  handleIconClick();
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
      field: "ItemName",
      headerName: "Item Name",
      width: 200,
      editable: false,
      headerAlign: "center",
      align: "center",
      // renderCell: (params) => {
      //   const index = params.row.id;
      //   if (params?.row?.Type === -18) {
      //     // return (
      //     //   <Controller
      //     //     name={`oLines.${index}.ItemName`}
      //     //     control={control}
      //     //     defaultValue={params.row.ItemName || ""}
      //     //     render={({ field }) => (
      //     //       <TextField
      //     //         {...field}
      //     //         size="small"
      //     //         placeholder="Enter text"
      //     //         onKeyDown={(e) => e.stopPropagation()}
      //     //       />
      //     //     )}
      //     //   />
      //     // );
      //   }
      //   return (
      //     // <Controller
      //     //   name={`oLines.${index}.ItemName`}
      //     //   control={control}
      //     //   defaultValue={params.row.ItemName || ""}
      //     //   render={({ field }) => (
      //     //     <InputTextField
      //     //       {...field}
      //     //       disabled={params?.row?.Type === 4 || params?.row?.Type === 296}
      //     //     />
      //     //   )}
      //     // />
      //     <Typography variant="p" textAlign={"center"}>
      //       {params.value}
      //     </Typography>
      //   );
      // },
    },

    {
      field: "BaseQty",
      headerName: "Base QTY",
      width: 120,
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "AdditQty",
      headerName: "Additional quantity",
      width: 120,
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "PlannedQty",
      headerName: "PLANNED QTY",
      width: 120,
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IssuedQty",
      headerName: "ISSUED QTY",
      width: 120,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OpenQuantity",
      headerName: "OPEN QTY",
      width: 120,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IssueType",
      headerName: "Issue method",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: "1", label: "Backflush" },
        { value: "2", label: "Manual" },
      ],
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
        let disabled = params.row.Type === 296;
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
                  setwhscOpenoLines(true);
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
                  setwhscOpenoLines(true);
                }}
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
      width: 120,
      editable: false,
    },
    {
      field: "UomCode",
      headerName: "UoM CODE",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "StartDate",
      headerName: "START DATE",
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
      field: "EndDate",
      headerName: "End DATE",
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
      field: "OnHand",
      headerName: "IN STOCK",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OnOrder",
      headerName: "ORDERED",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IsCommited",
      headerName: "RESERVE",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "Status",
      headerName: "Status",
      width: 140,
      type: "singleSelect",
      editable: true,
      valueOptions:
        [
          { value: 4, label: "PLANNED" },
          { value: 6, label: "IN PROGRESS" },
          { value: 5, label: "COMPLETE" },
        ] || [],
    },
    {
      field: "rote",
      headerName: "Route Sequence",
      width: 100,
      editable: false,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isRouteRow = params.row?.Type === 296;
        const lines = getValues("oLines");
        const usedRoutes = lines.filter((row) => row?.Type === 296);
        return (
          <InputSelectTextField
            name="rote"
            value={params.value || ""}
            onChange={(e) => handleRoteChange(e, params.row)}
            disabled={!isRouteRow} // 🔒 children disabled
            data={usedRoutes.map((item) => ({
              key: item.rote,
              value: item.rote,
            }))}
          />
        );
      },
    },
    {
      field: "WipActCode",
      headerName: "WIP ACCOUNT",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openAcctCode = !!params.row.WipActCode;
        const isRouteRow = params.row?.Type !== 296;
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
                if (isRouteRow) return;
                if (!openAcctCode && params.row.readonlyRow !== "readonlyRow") {
                  setValue("selectedRowIndex", params.row.id);
                  setChartAccountOpen(true);
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
                {params.row.WipActCode || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValue("selectedRowIndex", params.row.id);
                  setChartAccountOpen(true);
                }}
                size="small"
                disabled={params.row?.Type !== 296}
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

  const ISsueColumn = [
    {
      id: 1,
      field: "id",
      headerName: "LINE NO",
      width: 30,
      renderCell: (params) => <span>{params.id + 1}</span>,
    },
    {
      field: "Type",
      headerName: "ORDER TYPE",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span>
          {params.row.Type === "S"
            ? "STANDARD"
            : params.row.Type === "P"
              ? "SPECIAL"
              : "DISASSEMBLY"}
        </span>
      ),
    },
    {
      field: "BaseRef",
      headerName: "ORDER NO",
      width: 100,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "ItemName",
      headerName: "ITEM NAME",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
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
      field: "Price",
      headerName: "INFO PRICE",
      width: 130,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "LineTotal",
      headerName: "TOTAL",
      width: 130,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "WHSCode",
      headerName: "WHS CODE",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openWHSCode = !!params.row.WHSCode;
        let disabled = params.row.Status === "0";
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
                  setValueIssue("selectedRowIndex", params.row.id);
                  setwhscOpenIssue(true);
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
                  setValueIssue("selectedRowIndex", params.row.id);
                  setwhscOpenIssue(true);
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
                if (
                  BinQty !== params.row.Quantity &&
                  params.row.readonlyRow !== "readonlyRow"
                ) {
                  setValue("selectedRowIndex", params.row.id);
                  setValue("BinLocation", params.row);
                  dispatch({ type: "OPEN", modal: "BinLocationOpenIssue" });
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
                  dispatch({ type: "OPEN", modal: "BinLocationOpenIssue" });
                }}
                disabled={
                  params.row.Status === "0" ||
                  parseFloat(params.row.DftBinAbs) <= 0 ||
                  params.row.BinActivat !== "Y"
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
      field: "LocCode",
      headerName: "LOCATION",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "OnHand",
      headerName: "IN STOCK",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OnOrder",
      headerName: "ORDERED",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IsCommited",
      headerName: "RESERVE",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "AcctCode",
      headerName: "ACCOUNT CODE",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openAcctCode = !!params.row.AcctCode;
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
                if (!openAcctCode && params.row.readonlyRow !== "readonlyRow") {
                  setValueIssue("selectedRowIndex", params.row.id);
                  setIssueChartOpen(true);
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
                {params.row.AcctCode || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValueIssue("selectedRowIndex", params.row.id);
                  setIssueChartOpen(true);
                }}
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
      field: "PlannedQty",
      headerName: "PLANNED",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IssuedQty",
      headerName: "ISSUED",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    // {
    //   field: "Type",
    //   headerName: "ORDER TYPE",
    //   width: 130,
    //   sortable: false,
    //   headerAlign: "center",
    //   align: "center",
    //   renderCell: (params) => (
    //     <span>
    //       {params.row.Type === "S"
    //         ? "STANDARD"
    //         : params.row.Type === "P"
    //         ? "SPECIAL"
    //         : "DISASSEMBLY"}
    //     </span>
    //   ),
    // },
    {
      field: "UomCode",
      headerName: "UOM CODE",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    // {
    //   field: "unitMsr",
    //   headerName: "UOM NAME",
    //   width: 130,
    //   sortable: false,
    //   headerAlign: "center",
    //   align: "center",
    // },

    {
      field: "NumPerMsr",
      headerName: "ITEMS PER UNIT",
      sortable: false,
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    //  {
    //   field: "Quantity",
    //   headerName: "QTY (invertory uom)",
    //   width: 120,
    //   editable: false,
    //   headerAlign: "center",
    //   align: "center",
    //   renderCell: (params) => (
    //     <InputTextField
    //       name="BaseQty"
    //       type="number"
    //       value={params.value}
    //       disabled={params.row.Type === 296 || params.row.Type === -18}
    //       onChange={(e) => handleChange(e, params.row)}
    //     />
    //   ),
    // },

    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={() => handleDeleteRowIssue(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const RecieptColumn = [
    {
      id: 1,
      field: "id",
      headerName: "LINE NO",
      width: 30,
      renderCell: (params) => <span>{params.id + 1}</span>,
    },
    {
      field: "Type",
      headerName: "ORDER TYPE",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span>
          {params.row.Type === "S"
            ? "STANDARD"
            : params.row.Type === "P"
              ? "SPECIAL"
              : "DISASSEMBLY"}
        </span>
      ),
    },
    {
      field: "BaseRef",
      headerName: "ORDER NO",
      width: 100,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "ItemName",
      headerName: "ITEM NAME",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "TranType",
      headerName: "Transaction Type",
      width: 130,
      sortable: false,
      editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: "C", label: "COMPLETE" },
        { value: "R", label: "REJECT" },
      ],
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
      field: "Price",
      headerName: "UNIT PRICE",
      width: 130,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "LineTotal",
      headerName: "TOTAL",
      width: 130,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "WHSCode",
      headerName: "WHS CODE",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openWHSCode = !!params.row.WHSCode;
        let disabled = params.row.Status === "0";
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
                  setValueReciept("selectedRowIndex", params.row.id);
                  setwhscOpenReciept(true);
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
                  setValueReciept("selectedRowIndex", params.row.id);
                  setwhscOpenReciept(true);
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
                if (
                  BinQty !== params.row.Quantity &&
                  params.row.readonlyRow !== "readonlyRow"
                ) {
                  setValue("selectedRowIndex", params.row.id);
                  setBinLocData(params.row);
                  dispatch({ type: "OPEN", modal: "BinLocationOpenReciept" });
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
                  dispatch({ type: "OPEN", modal: "BinLocationOpenReciept" });
                }}
                disabled={
                  params.row.Status === "0" ||
                  parseFloat(params.row.DftBinAbs) <= 0 ||
                  params.row.BinActivat !== "Y"
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
      field: "LocationName",
      headerName: "LOCATION",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "CmpltQty",
      headerName: "COMPLETE",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "RjctQty",
      headerName: "REJECT",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OnHand",
      headerName: "IN STOCK",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OnOrder",
      headerName: "ORDERED",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IsCommited",
      headerName: "RESERVE",
      width: 120,
      editable: false,
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "AcctCode",
      headerName: "ACCOUNT CODE",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openAcctCode = !!params.row.AcctCode;
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
                if (!openAcctCode && params.row.readonlyRow !== "readonlyRow") {
                  setValueReciept("selectedRowIndex", params.row.id);
                  setRecieptChartOpen(true);
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
                {params.row.AcctCode || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setValueReciept("selectedRowIndex", params.row.id);
                  setRecieptChartOpen(true);
                }}
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
      field: "PlannedQty",
      headerName: "PLANNED",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IssuedQty",
      headerName: "ISSUED",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    {
      field: "UomCode",
      headerName: "UOM CODE",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    // {
    //   field: "unitMsr",
    //   headerName: "UOM NAME",
    //   width: 130,
    //   sortable: false,
    //   headerAlign: "center",
    //   align: "center",
    // },

    {
      field: "NumPerMsr",
      headerName: "ITEMS PER UNIT",
      sortable: false,
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    //  {
    //   field: "Quantity",
    //   headerName: "QTY (invertory uom)",
    //   width: 120,
    //   editable: false,
    //   headerAlign: "center",
    //   align: "center",
    //   renderCell: (params) => (
    //     <InputTextField
    //       name="BaseQty"
    //       type="number"
    //       value={params.value}
    //       disabled={params.row.Type === 296 || params.row.Type === -18}
    //       onChange={(e) => handleChange(e, params.row)}
    //     />
    //   ),
    // },

    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={() => handleDeleteRowReciept(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  const handleDeleteRowIssue = (id) => {
    const updatedRows = getValuesIssue("oLines").filter(
      (_, index) => index !== id,
    );
    const updatedData = {
      ...getValuesIssue(),
      oLines: updatedRows,
    };
    resetIssue(updatedData);
  };
  const handleDeleteRowReciept = (id) => {
    const updatedRows = getValuesReciept("oLines").filter(
      (_, index) => index !== id,
    );
    const updatedData = {
      ...getValuesReciept(),
      oLines: updatedRows,
    };
    resetReciept(updatedData);
  };
  const addRow = () => {
    const currentData = getValues();
    const existingLines = currentData.oLines || [];
    const newLine = {
      ItemCode: "",
      ItemName: "",
      Type: 4,
      StageId: 0,
      Price: "",
      LineTotal: "",
      rote: 0,
    };
    reset({
      ...currentData,
      oLines: [...existingLines, newLine],
    });
  };

  function QuantityPlanned(BaseQty, AdditQty) {
    const plnQty = getValues("PlannedQty") || 0;
    const planned =
      parseFloat(plnQty) * parseFloat(BaseQty) + parseFloat(AdditQty);
    return planned;
  }

  const HeaderCal = (qty) => {
    let updatedOLines = [];
    const allFormData = getValues();
    allFormData.oLines.forEach((i) => {
      if (i.Type === 4) {
        const baseQty = parseFloat(i.BaseQty) || 0;
        const additQty = parseFloat(i.AdditQty) || 0;
        const plannedQtyNum = parseFloat(qty) || 0;
        const planQty = plannedQtyNum * baseQty + additQty;
        updatedOLines.push({
          ...i,
          PlannedQty: planQty,
        });
      } else {
        updatedOLines.push(i);
      }
    });
    console.log("updatedOLines", updatedOLines);
    reset({
      ...allFormData,
      oLines: updatedOLines,
    });
  };

  const handleCellKeyDown = (params, event) => {
    const api = apiRef.current;
    if (!api) return;

    const cellMode = api.getCellMode(params.id, params.field);
    const columnType = api.getColumn(params.field)?.type;

    const isSingleSelect = columnType === "singleSelect";

    // ✅ 1. Let MUI fully handle singleSelect navigation
    if (isSingleSelect && cellMode === "edit") {
      return;
    }

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

    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);
    const rowIndex = rowIds.indexOf(params.id);

    let nextRow = rowIndex;
    let nextCol = colIndex;

    if (cellMode === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol += event.shiftKey ? -1 : 1;
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
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    ) {
      return;
    }

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });
    api.setCellFocus(nextId, nextField);

    const nextCellParams = api.getCellParams(nextId, nextField);
    if (nextCellParams.isEditable) {
      setTimeout(() => {
        api.startCellEditMode({ id: nextId, field: nextField });

        if (api.getColumn(nextField)?.type === "singleSelect") {
          const cell = api.getCellElement(nextId, nextField);
          cell?.querySelector("button")?.click();
        }
      }, 30);
    }
  };
  const applyQtyCalculation = (row) => {
    const baseQty = Number(row.BaseQty || 0);
    const additQty = Number(row.AdditQty || 0);
    const plannedQty = QuantityPlanned(baseQty, additQty);

    return {
      ...row,
      PlannedQty: plannedQty,
      OpenQuantity: plannedQty - Number(row.IssuedQty || 0),
    };
  };
  const processRowUpdate = (newRow, oldRow) => {
    const allLines = [...getValues("oLines")];
    let updatedRow = { ...oldRow, ...newRow };

    const changedField = Object.keys(newRow).find(
      (key) => newRow[key] !== oldRow[key],
    );

    /* ----------------------------------
     ROUTE STAGE SYNC (Type = 296)
  -----------------------------------*/
    if (Number(oldRow.Type) === 296) {
      const isDateChanged =
        oldRow.StartDate !== newRow.StartDate ||
        oldRow.EndDate !== newRow.EndDate;

      const isStatusChanged = oldRow.Status !== newRow.Status;

      if (isDateChanged || isStatusChanged) {
        const updatedLines = allLines.map((row) =>
          row.StageId === oldRow.StageId
            ? {
                ...row,
                StartDate: newRow.StartDate,
                EndDate: newRow.EndDate,
                Status: newRow.Status,
              }
            : row,
        );

        reset({ ...allFormData, oLines: updatedLines });
        return updatedRow;
      }
    }

    /* ----------------------------------
     🔢 QUANTITY CALCULATIONS
  -----------------------------------*/
    if (changedField === "BaseQty" || changedField === "AdditQty") {
      updatedRow = applyQtyCalculation(updatedRow);
    }

    if (changedField === "PlannedQty") {
      const additQty = Number(oldRow.AdditQty || 0);

      if (Number(updatedRow.PlannedQty) <= additQty) {
        Swal.fire({
          text: "Planned Quantity must be greater than Additional Quantity!",
          icon: "warning",
          confirmButtonText: "OK",
          width: 300,
          padding: "1rem",
        });

        return oldRow;
      }

      updatedRow.BaseQty =
        (Number(updatedRow.PlannedQty) - additQty) /
        Number(getValues("PlannedQty") || 1);

      updatedRow = applyQtyCalculation(updatedRow);
    }

    /* ----------------------------------
     NORMAL ITEM VALIDATION
  -----------------------------------*/
    if (updatedRow.Quantity > oldRow.CpyIssueQty) {
      Swal.fire({
        icon: "warning",
        title: "Quantity Exceeded",
        text: `Allowed quantity: ${oldRow.CpyIssueQty}`,
      });

      updatedRow.Quantity = oldRow.CpyIssueQty;
    }

    updatedRow.LineTotal = (updatedRow.Quantity || 0) * 150;

    /* ----------------------------------
     FINAL STATE UPDATE
  -----------------------------------*/
    const updatedLines = allLines.map((row, index) =>
      index + 1 === oldRow.id ? updatedRow : row,
    );

    reset({ ...allFormData, oLines: updatedLines });

    return updatedRow;
  };

  const handleCellKeyDownIssue = (params, event) => {
    Swal.close();
    const api = issueGridApiRef.current;
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

  const processRowUpdateIssue = (newRow, oldRow) => {
    const allowedQty = oldRow.CpyIssueQty;
    const updatedData = { ...oldRow, ...newRow };

    if (updatedData.Quantity > allowedQty) {
      Swal.fire({
        icon: "warning",
        title: "Quantity Exceeded",
        text: `Entered quantity exceeds allowed issue quantity (${allowedQty.toFixed(2)})`,
        showConfirmButton: true,
      });
      updatedData.Quantity = allowedQty;
    }
    updatedData.LineTotal = updatedData.Quantity * 150;
    const updatedLines = getValuesIssue("oLines").map((d, i) =>
      i === oldRow.id ? updatedData : d,
    );
    resetIssue({ ...getValuesIssue(), oLines: updatedLines });

    return updatedData;
  };
  const DocTotalIssue = getValuesIssue("oLines").reduce(
    (acc, cur) => acc + parseFloat(cur.LineTotal),
    0,
  );
  setValueIssue("DocTotal", DocTotalIssue);

  const handleCellKeyDownReciept = (params, event) => {
    Swal.close();

    const api = RecieptGridApiRef.current;
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

    // ✅ Prevent arrow key navigation inside singleSelect in edit mode
    const cellMode = api.getCellMode(params.id, params.field);
    const columnType = api.getColumn(params.field).type;
    const isSingleSelect = columnType === "singleSelect";

    if (isSingleSelect && cellMode === "edit") {
      if (["ArrowUp", "ArrowDown"].includes(event.key)) {
        return; // let MUI singleSelect handle the arrow keys
      }
    }

    event.preventDefault();

    // Stop editing current cell before moving
    if (cellMode === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    // Determine next cell
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
        break;
    }

    // Exit if next cell is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // Scroll next cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    // Focus next cell
    api.setCellFocus(nextId, nextField);

    // Start edit mode if editable
    const nextCellParams = api.getCellParams(nextId, nextField);
    if (nextCellParams.isEditable) {
      setTimeout(() => {
        api.startCellEditMode({ id: nextId, field: nextField });

        const nextColumnType = api.getColumn(nextField).type;
        if (nextColumnType === "singleSelect") {
          const cell = api.getCellElement(nextId, nextField);
          const selectButton = cell?.querySelector("button"); // MUI singleSelect button
          if (selectButton) selectButton.click();
        }
      }, 50);
    }
  };

  const processRowUpdateReciept = (newRow, oldRow) => {
    const allowedQty = oldRow.CpyIssueQty;
    const updatedData = { ...oldRow, ...newRow };

    if (updatedData.Quantity > allowedQty) {
      Swal.fire({
        icon: "warning",
        title: "Quantity Exceeded",
        text: `Entered quantity exceeds allowed issue quantity (${allowedQty.toFixed(2)})`,
        showConfirmButton: true,
      });
      updatedData.Quantity = allowedQty;
    }
    updatedData.LineTotal = updatedData.Quantity * 150;
    const updatedLines = getValuesReciept("oLines").map((d, i) =>
      i === oldRow.id ? updatedData : d,
    );
    resetReciept({ ...getValuesReciept(), oLines: updatedLines });
    return updatedData;
  };
  // const handleChangeReciept = (e, row) => {
  //   const { name, value } = e.target;
  //   const updatedLines = getValuesReciept("oLines").map((data, index) => {
  //     if (row.id !== index) return data;
  //     const updatedData = {
  //       ...data,
  //       [name]: value,
  //       LineTotal: String(
  //         (name === "Quantity" ? Number(value) : Number(data.Quantity)) * 150,
  //       ),
  //     };
  //     return updatedData;
  //   });
  //   // setValueIssue("oLines",updatedLines)

  //   resetReciept({
  //     ...getValuesReciept(),
  //     oLines: updatedLines,
  //   });
  // };

  const DocTotal = getValuesReciept("oLines").reduce(
    (acc, cur) => acc + parseFloat(cur.LineTotal),
    0,
  );
  setValueReciept("DocTotal", DocTotal);

  const handleRoteChange = (e, currentRouteRow) => {
    const newRote = Number(e.target.value);
    if (!newRote) return;

    const oLines = getValues("oLines");

    // Attach index for reference
    const rows = oLines.map((row, idx) => ({ ...row, _idx: idx }));

    // 1️⃣ Split into route blocks (296 + children)
    const blocks = [];
    let currentBlock = [];

    rows.forEach((row) => {
      if (Number(row.Type) === 296) {
        if (currentBlock.length) blocks.push(currentBlock);
        currentBlock = [row];
      } else if (currentBlock.length) {
        currentBlock.push(row);
      }
    });

    if (currentBlock.length) blocks.push(currentBlock);

    // 2️⃣ Find block index of clicked route
    const currentBlockIndex = blocks.findIndex(
      (block) => block[0]._idx === currentRouteRow.id - 1,
    );
    if (currentBlockIndex === -1) return;

    // 3️⃣ Remove moving block
    const movingBlock = blocks.splice(currentBlockIndex, 1)[0];

    // 4️⃣ Ensure enough blocks exist
    const targetIndex = newRote - 1;
    while (blocks.length < targetIndex) {
      blocks.push([]);
    }

    // 5️⃣ Insert block at new route position
    blocks.splice(targetIndex, 0, movingBlock);

    // 6️⃣ Flatten blocks & reassign rote + StageId
    const finalLines = [];
    blocks.forEach((block, idx) => {
      const stageId = idx + 1;
      block.forEach((row) => {
        finalLines.push({
          ...row,
          rote: stageId,
          StageId: stageId,
        });
      });
    });

    reset({
      ...getValues(),
      oLines: finalLines,
    });
  };

  const selectChartOfAccount = (AcctCode) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index + 1 === currentRowIndex) {
        return {
          ...line,
          WipActCode: AcctCode,
        };
      }
      return line;
    });
    reset({
      ...currentData,
      oLines: updatedLines,
    });
    setChartAccountOpen(false);
  };

  const selectIssueOfAccount = (AcctCode) => {
    const currentRowIndex = getValuesIssue("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValuesIssue("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          AcctCode: AcctCode,
        };
      }
      return line;
    });
    resetIssue({
      ...getValuesIssue(),
      oLines: updatedLines,
    });
    setIssueChartOpen(false);
  };
  const selectRecieptOfAccount = (AcctCode) => {
    const currentRowIndex = getValuesReciept("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValuesReciept("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          AcctCode: AcctCode,
        };
      }
      return line;
    });

    resetReciept({
      ...getValuesReciept(),
      oLines: updatedLines,
    });
    setRecieptChartOpen(false);
  };
  const selectWhSCode = async (WHSCode, LocationName, LocCode) => {
    setValue("WHSCode", WHSCode);
    setValue("LocCode", LocCode);
    const oLines = getValues("oLines");
    if (oLines.length > 0 && WHSCode) {
      Swal.fire({
        title: "Apply WHSCode",
        text: "Do you want to apply this WHSCode to all lines?",
        icon: "warning",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((msg) => {
        if (msg.isConfirmed) {
          const updatedLines = oLines.map(
            (line) =>
              line.Type === 4
                ? {
                    ...line,
                    WHSCode: WHSCode,
                    LocationName: LocationName,
                    LocCode: LocCode,
                  } // ✅ only update 'Item' type
                : line, // ❌ keep other types untouched
          );
          reset({
            ...getValues(),
            oLines: updatedLines,
          });
        }
      });
    }
    setWhscOpen(false);
  };

  const selectedoLinessetWhsc = async (WHSCode, LocationName, LocCode) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index + 1 === currentRowIndex) {
        return {
          ...line,
          WHSCode: WHSCode,
          LocationName: LocationName,
          LocCode: LocCode,
        };
      }
      return line;
    });
    reset({
      ...currentData,
      oLines: updatedLines,
    });
    setwhscOpenoLines(false);
  };
  const selectedIssueWhsc = async (
    WHSCode,
    LocationName,
    LocCode,
    BinCode,
    DftBinAbs,
    BinActivat,
  ) => {
    const currentRowIndex = getValuesIssue("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValuesIssue("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          WHSCode: WHSCode,
          LocationName: LocationName,
          LocCode: LocCode,
          BinCode: BinCode,
          DftBinAbs: DftBinAbs,
          BinActivat,
          Bin: 0,
          oDocBinLocationLines: [],
        };
      }
      return line;
    });
    resetIssue({
      ...getValuesIssue(),
      oLines: updatedLines,
    });
    setwhscOpenIssue(false);
  };

  const selectedRecieptWhsc = async (
    WHSCode,
    LocationName,
    LocCode,
    BinCode,
    DftBinAbs,
    BinActivat,
  ) => {
    const currentRowIndex = getValuesReciept("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValuesReciept("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          WHSCode: WHSCode,
          LocationName: LocationName,
          LocCode: LocCode,
          BinCode: BinCode,
          DftBinAbs: DftBinAbs,
          BinActivat,
          Bin: 0,
          oDocBinLocationLines: [],
        };
      }
      return line;
    });
    resetReciept({
      ...getValuesReciept(),
      oLines: updatedLines,
    });
    setwhscOpenReciept(false);
  };

  const selectCustomer = async (CardCode) => {
    setValue("CardCode", CardCode);
    setCustomerOpen(false);
  };
  const selectLinkedTo = async (DocNum) => {
    setValue("OriginNum", DocNum);
    setOpenLinked(false);
  };
  const handleDeleteRow = (id) => {
    const updatedRows = currentData.oLines.filter(
      (_, index) => index + 1 !== id,
    );
    // const last296Row = [...updatedRows]
    //   .reverse()
    //   .find((row) => row?.Type === 296);
    // const updatedDataRote = updatedRows.map((rotedata) => ({
    //   ...rotedata,
    //   rote: last296Row?.rote ?? "0",
    // }));
    const updatedData = {
      ...currentData,
      oLines: updatedRows,
    };
    reset(updatedData);
  };

  const ClearForm = () => {
    reset({
      ...initialFormData,
      // Status: ,
      oLines: [],
    });
    setValue("Type", "S");

    setValue("oLines", []);
    clearFiles();
    setSelectData(null);
    resetIssue(InitialFormIssue);
    resetReciept(InitialFormReciept);
    setSaveUpdateName("SAVE");
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
    setValueIssue("Series", DocseriesIssue[0]?.SeriesId ?? "");
    setValueIssue("DocNum", DocseriesIssue[0]?.DocNum ?? "");
    setValueIssue("FinncPriod", DocseriesIssue[0]?.FinncPriod ?? "");
    setValueIssue("PIndicator", DocseriesIssue[0]?.Indicator ?? "");
    setValueReciept("Series", DocseriesReciept[0]?.SeriesId ?? "");
    setValueReciept("DocNum", DocseriesReciept[0]?.DocNum ?? "");
    setValueReciept("FinncPriod", DocseriesReciept[0]?.FinncPriod ?? "");
    setValueReciept("PIndicator", DocseriesReciept[0]?.Indicator ?? "");
    if (planned.query?.trim()) {
      planned.handleClear();
    } else if (released.query?.trim()) {
      released.handleClear();
    } else if (closed.query?.trim()) {
      closed.handleClear();
    } else if (cancelled.query?.trim()) {
      cancelled.handleClear();
    }
  };

  const handleOnCancelDocument = () => {
    Swal.fire({
      text: `Do You Want Cancel "${currentData.DocNum}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .put(`/ProductionOrder/Cancel/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              ClearForm();
              planned.refresh();
              closed.refresh();
              cancelled.refresh();
              // setOpenListData([]);
              // setPlannedListData(0);
              // fetchMoreCancelListData(0);
              // fetchClosedListData(0);
              Swal.fire({
                text: "Purchase Order Cancel",
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
          text: "Purchase Order Not Cancelled",
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
      text: `Do You Want Close "${currentData.DocNum}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .put(`/ProductionOrder/Close/${currentData.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              released.refresh();
              closed.refresh();
              // cancelled.refresh();
              ClearForm();
              Swal.fire({
                text: "Purchase Order Close",
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
          text: "Purchase Order Not Close",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const LineLevelIssueQty = (getValues("oLines") || []).reduce(
    (sum, row) => (row.Type === "4" ? sum + (Number(row.IssuedQty) || 0) : sum),
    0,
  );

  console.log("fdsfsd", LineLevelIssueQty);

  const {
    data: whsData,
    hasMore: whsHasMore,
    query: whsQuery,
    onSearch: onWhsSearch,
    onClear: onWhsClear,
    fetchMore: fetchMoreWhs,
  } = useSearchInfiniteScroll(`WarehouseV2`);
  const {
    data: whsLineData,
    hasMore: whsLineHasMore,
    query: whsLineQuery,
    onSearch: onWhsLineSearch,
    onClear: onWhsLineClear,
    fetchMore: fetchLineMoreWhs,
  } = useSearchInfiniteScroll(`WarehouseV2`);

  const {
    data: whsIssueData,
    hasMore: whsIssueHasMore,
    query: whsIssueeQuery,
    onSearch: onWhsIssueSearch,
    onClear: onWhsIssueClear,
    fetchMore: fetchIssueMoreWhs,
  } = useSearchInfiniteScroll(`WarehouseV2`);

  const {
    data: whsRecieptData,
    hasMore: whsRecieptHasMore,
    query: whsRecieptQuery,
    onSearch: onWhsRecieptSearch,
    onClear: onWhsRecieptClear,
    fetchMore: fetchRecieptMoreWhs,
  } = useSearchInfiniteScroll(`WarehouseV2`);

  const {
    data: ChartAccountData,
    hasMore: ChartAccountHasMore,
    query: ChartAccountQuery,
    onSearch: ChartAccountSearch,
    onClear: ChartAccountClear,
    fetchMore: fetchMoreChartAccount,
  } = useSearchInfiniteScroll(`ChartOfAccounts`);

  const {
    data: IssueAccountData,
    hasMore: IssueAccountHasMore,
    query: IssueAccountQuery,
    onSearch: IssueAccountSearch,
    onClear: IssueAccountClear,
    fetchMore: fetchMoreIssueAccount,
  } = useSearchInfiniteScroll(`ChartOfAccounts`);

  const {
    data: RecieptAccountData,
    hasMore: RecieptAccountHasMore,
    query: RecieptAccountQuery,
    onSearch: RecieptAccountSearch,
    onClear: RecieptAccountClear,
    fetchMore: fetchMoreRecieptAccount,
  } = useSearchInfiniteScroll(`ChartOfAccounts`);

  const {
    data: SalesOrderData,
    hasMore: SalesOrderHasMore,
    query: SalesOrderQuery,
    onSearch: SalesOrderSearch,
    onClear: SalesOrderClear,
    fetchMore: fetchMoreSalesOrder,
  } = useSearchInfiniteScroll(`SalesOrder`);
  const {
    data: CustomerData,
    hasMore: customerHasMore,
    query: customerQuery,
    onSearch: onCustomerSearch,
    onClear: onCustomerClear,
    fetchMore: fetchMoreCustomer,
  } = BusinessPartnerScroll(`BPV2/V2/ByCardType`, "C");

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      planned.refresh();
      isFirstLoad.current = false;
    }
  }, []);
  const planned = usePaginatedSearchList({
    baseUrl: "/ProductionOrder",
    status: 4,
    autoLoad: false,
  });

  const released = usePaginatedSearchList({
    baseUrl: "/ProductionOrder",
    status: 5,
  });

  const closed = usePaginatedSearchList({
    baseUrl: "/ProductionOrder",
    status: 0,
  });

  const cancelled = usePaginatedSearchList({
    baseUrl: "/ProductionOrder",
    status: 3,
  });
  const tabData = [
    {
      value: "4",
      label: "Planned",
      // data: PlannedListData,
      // query: PlannedListquery,
      // hasMore: hasMorePlanned,
      // fetchMore: fetchMorePlannedListData,
      // handleSearch: handlePlannedListSearch,
      // handleClear: handlePlannedListClear,
      ...planned,
    },
    {
      value: "5",
      label: "RELEASED",
      // data: ReleasedListData,
      // query: ReleasedListquery,
      // hasMore: hasMoreReleased,
      // fetchMore: fetchMoreReleasedData,
      // handleSearch: handleReleasedSearch,
      // handleClear: handleReleasedClear,
      ...released,
    },
    {
      value: "0",
      label: "CLOSED",
      // data: closedListData,
      // query: closedListquery,
      // hasMore: hasMoreClosed,
      // fetchMore: fetchMoreClosedListData,
      // handleSearch: handleClosedListSearch,
      // handleClear: handleClosedListClear,
      ...closed,
    },
    {
      value: "3",
      label: "CANCELLED",
      // data: cancelledListData,
      // query:  cancelledListquery,
      // hasMore: hasMoreCancelled,
      // fetchMore: fetchMoreCancelListData,
      // handleSearch: handleCancelListSearch,
      // handleClear: handleCancelListClear,
      ...cancelled,
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
          Production Order List
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
                          title={item.ItemCode}
                          subtitle={item.ProdName}
                          description={item.DocNum}
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

  return (
    <>
      <DynamicLoader open={apiloading} />

      <ProductionDataGrid
        open={openItem}
        closeModel={closeModel}
        onSubmit={onSubmit}
        isLoading={itemList.length === 0 ? true : isLoading}
        title="Item List"
        getRowId={(row) => row.DocEntry}
        columns={modelColumns}
        rows={itemList}
        currentPage={currentPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onRowSelectionModelChange={handleCellClick}
        onSearchChange={handleSearchChange}
        selectedRowIndex={getValues("selectedRowIndex")}
        rowCount={rowCount}
        //  isRowSelectable={(params) => ItemCodeH !== params.row.ItemCode}
        oLines={getValues("oLines")}
        ItemCodeH={getValues("ItemCode")}
      />
      <BinLocation
        open={state.BinLocationOpenReciept}
        closeModel={() =>
          dispatch({ type: "CLOSE", modal: "BinLocationOpenReciept" })
        }
        onSubmit={handleBinlocationSubmit}
        isLoading={isLoading}
        title="Bin Location"
        data={BinlocListData}
        DocNum={getValues("DocNum")}
        getRowId={(row) => row.id}
        // DisbledUpdate={SaveUpdateName}
      />

      <AllBinLocationShow
        open={state.BinLocationOpenIssue}
        closeModel={() =>
          dispatch({ type: "CLOSE", modal: "BinLocationOpenIssue" })
        }
        onSubmit={handleBinlocationSubmitIssue}
        isLoading={isLoading}
        title="Bin Location"
        data={getValues("BinLocation")}
        DocNum={getValues("DocNum")}
        getRowId={(row) => row.id}
        // SaveUpdateName={SaveUpdateName}
      />
      <DataGriCellModelClick
        open={openBom}
        closeModel={closeBom}
        // onSubmit={onSubmit}
        isLoading={isLoading}
        title="Item List"
        getRowId={(row) => row.DocEntry || "0"}
        columns={Type === "P" ? headerColumns : BomColumns}
        rows={BomList}
        currentPage={BomcurrentPage}
        limit={LIMIT}
        onPaginationModelChange={handleBomPaginationModelChange}
        onCellClick={handleBomClick}
        onSearchChange={handleBomSearchChange}
        selectedRowIndex={getValues("selectedRowIndex")}
        rowCount={BomrowCount}
        oLines={getValues("oLines")}
      />
      <DataGriCellModelClick
        open={openRouteStage}
        closeModel={closeModelRoute}
        // onSubmit={onSubmit}
        isLoading={isLoading}
        title="Route Stage"
        getRowId={(row) => row.DocEntry}
        columns={RoutestageColumn}
        rows={routeStageList}
        currentPage={routeStagecurrentPage}
        limit={LIMIT}
        onPaginationModelChange={handleRounteStagePaginationModelChange}
        onCellClick={handleRouteClick}
        onSearchChange={handleRounteStageSearchChange}
        selectedRowIndex={getValues("selectedRowIndex")}
        rowCount={routeStagerowCount}
        oLines={getValues("oLines")}
      />
      <SearchModel
        open={openWhsc}
        onClose={() => setWhscOpen(false)}
        onCancel={() => setWhscOpen(false)}
        title="WHSCode"
        onChange={(e) => onWhsSearch(e.target.value)}
        value={whsQuery}
        onClickClear={onWhsClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={whsData?.length ?? "0"}
            next={fetchMoreWhs}
            hasMore={whsHasMore}
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
            {(whsData || []).map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.WHSName}
                searchResult={whsQuery}
                onClick={() => {
                  selectWhSCode(item.WHSCode, item.LocationName, item.Location);
                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <SearchModel
        open={openwhscoLines}
        onClose={() => setwhscOpenoLines(false)}
        onCancel={() => setwhscOpenoLines(false)}
        title="WHSCode"
        onChange={(e) => onWhsLineSearch(e.target.value)}
        value={whsLineQuery}
        onClickClear={onWhsLineClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={whsLineData?.length ?? "0"}
            next={fetchLineMoreWhs}
            hasMore={whsLineHasMore}
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
            {(whsLineData || []).map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.WHSName}
                searchResult={whsLineQuery}
                onClick={() => {
                  selectedoLinessetWhsc(
                    item.WHSCode,
                    item.LocationName,
                    item.Location,
                  );

                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <SearchModel
        open={whscopenIssue}
        onClose={() => setwhscOpenIssue(false)}
        onCancel={() => setwhscOpenIssue(false)}
        title="WHSCode"
        onChange={(e) => onWhsIssueSearch(e.target.value)}
        value={whsIssueeQuery}
        onClickClear={onWhsIssueClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={whsIssueData?.length ?? 0}
            next={fetchIssueMoreWhs}
            hasMore={whsIssueHasMore}
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
            {(whsIssueData || []).map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.WHSName}
                searchResult={whsIssueeQuery}
                onClick={() => {
                  selectedIssueWhsc(
                    item.WHSCode,
                    item.LocationName,
                    item.Location,
                    item.BinCode,
                    item.DftBinAbs,
                    item.BinActivat,
                  );

                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <SearchModel
        open={whscOpenReciept}
        onClose={() => setwhscOpenReciept(false)}
        onCancel={() => setwhscOpenReciept(false)}
        title="WHSCode"
        onChange={(e) => onWhsRecieptSearch(e.target.value)}
        value={whsRecieptQuery}
        onClickClear={onWhsRecieptClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={whsRecieptData?.length ?? 0}
            next={fetchRecieptMoreWhs}
            hasMore={whsRecieptHasMore}
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
            {(whsRecieptData || []).map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.WHSCode}
                subtitle={item.WHSName}
                searchResult={whsRecieptQuery}
                onClick={() => {
                  selectedRecieptWhsc(
                    item.WHSCode,
                    item.LocationName,
                    item.Location,
                    item.BinCode,
                    item.DftBinAbs,
                    item.BinActivat,
                  );

                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={chartAccountOpen}
        onClose={() => setChartAccountOpen(false)}
        onCancel={() => setChartAccountOpen(false)}
        title="Chart Of Account"
        onChange={(e) => ChartAccountSearch(e.target.value)}
        value={ChartAccountQuery}
        onClickClear={ChartAccountClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={ChartAccountData?.length ?? 0}
            next={fetchMoreChartAccount}
            hasMore={ChartAccountHasMore}
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
            {(ChartAccountData || [])
              .filter((Postable) => Postable.Postable === "Y")
              .map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.AcctCode}
                  subtitle={item.AcctName}
                  searchResult={ChartAccountQuery}
                  onClick={() => {
                    selectChartOfAccount(item.AcctCode);
                    //  CloseVendorModel(); // Close after selection if needed
                  }}
                />
              ))}
          </InfiniteScroll>
        }
      />

      <SearchModel
        open={IssueAccountOpen}
        onClose={() => setIssueChartOpen(false)}
        onCancel={() => setIssueChartOpen(false)}
        title="Chart Of Account"
        onChange={(e) => IssueAccountSearch(e.target.value)}
        value={IssueAccountQuery}
        onClickClear={IssueAccountClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={IssueAccountData?.length ?? 0}
            next={fetchMoreIssueAccount}
            hasMore={IssueAccountHasMore}
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
            {(IssueAccountData || [])
              .filter((Postable) => Postable.Postable === "Y")
              .map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.AcctCode}
                  subtitle={item.AcctName}
                  searchResult={IssueAccountQuery}
                  onClick={() => {
                    selectIssueOfAccount(item.AcctCode);
                    //  CloseVendorModel(); // Close after selection if needed
                  }}
                />
              ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={RecieptAccount}
        onClose={() => setRecieptChartOpen(false)}
        onCancel={() => setRecieptChartOpen(false)}
        title="Chart Of Account"
        onChange={(e) => RecieptAccountSearch(e.target.value)}
        value={RecieptAccountQuery}
        onClickClear={RecieptAccountClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={RecieptAccountData?.length ?? 0}
            next={fetchMoreRecieptAccount}
            hasMore={RecieptAccountHasMore}
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
            {(RecieptAccountData || [])
              .filter((Postable) => Postable.Postable === "Y")
              .map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.AcctCode}
                  subtitle={item.AcctName}
                  searchResult={RecieptAccountQuery}
                  onClick={() => {
                    selectRecieptOfAccount(item.AcctCode);
                    //  CloseVendorModel(); // Close after selection if needed
                  }}
                />
              ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openCustomer}
        onClose={() => setCustomerOpen(false)}
        onCancel={() => setCustomerOpen(false)}
        title="Select Customer"
        onChange={(e) => onCustomerSearch(e.target.value)}
        value={customerQuery}
        onClickClear={onCustomerClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={CustomerData?.length ?? 0}
            next={fetchMoreCustomer}
            hasMore={customerHasMore}
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
            {(CustomerData || []).map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.CardCode}
                subtitle={item.CardName}
                searchResult={customerQuery}
                onClick={() => {
                  selectCustomer(item.CardCode);
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openLinked}
        onClose={() => setOpenLinked(false)}
        onCancel={() => setOpenLinked(false)}
        title="Sales Order"
        onChange={(e) => SalesOrderSearch(e.target.value)}
        value={SalesOrderQuery}
        onClickClear={SalesOrderClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={SalesOrderData?.length ?? 0}
            next={fetchMoreSalesOrder}
            hasMore={SalesOrderHasMore}
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
            {(SalesOrderData || []).map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.DocNum}
                subtitle={item.CardName}
                description={item.CardCode}
                searchResult={customerQuery}
                onClick={() => {
                  selectLinkedTo(item.DocNum);
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />

      <Modal
        open={openIssueComp}
        onClose={() => setopenIssueComp(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: isFullScreen
              ? "95%"
              : { xs: "75%", sm: "75%", md: "75%", lg: "70%" },
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
          component={"form"}
          onSubmit={handleSubmitIssue(handleSubmitISsue)}
        >
          <IconButton
            onClick={toggleModalSize}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              // "&:hover": {
              //   bgcolor: "darkred",
              // },
            }}
          >
            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          <Typography
            textAlign="center"
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            ISSUE FOR PRODUCTION
          </Typography>
          <Divider />

          <Grid container>
            <Grid
              container
              item
              mt={2}
              sx={{
                overflow: "auto",
                width: "100%",
              }}
            >
              <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
                <Controller
                  name="Series"
                  rules={{ required: "please select Series" }}
                  control={controlIssue}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      label="SERIES"
                      data={[
                        ...(DocseriesIssue || []).map((item) => ({
                          key: item.SeriesId,
                          value: item.SeriesName,
                        })),
                      ]}
                      readOnly={true}
                      {...field}
                      // onChange={(e) => {
                      //   const selectedSeries = e.target.value;
                      //   field.onChange(selectedSeries);
                      //   setValueIssue("Series", selectedSeries);
                      //   if (selectedSeries !== "0") {
                      //     const seriesData = DocSeries.find(
                      //       (item) => item.SeriesId === selectedSeries,
                      //     );
                      //     setValueIssue("DocNum", seriesData?.DocNum || "");
                      //     setValueIssue(
                      //       "FinncPriod",
                      //       seriesData?.FinncPriod ?? "",
                      //     );
                      //     setValueIssue(
                      //       "PIndicator",
                      //       DocSeries?.Indicator ?? "",
                      //     );
                      //     setValueIssue(
                      //       "SeriesName",
                      //       seriesData?.SeriesName || "",
                      //     );
                      //     clearErrorsIssue("DocNum");
                      //   } else {
                      //     setValueIssue("DocNum", "");
                      //     setValueIssue("SeriesName", ""); // Clear SeriesName immediately
                      //     clearErrorsIssue("DocNum");
                      //     setValueIssue("FinncPriod", "0");
                      //     setValueIssue("PIndicator", "0");
                      //   }
                      // }}
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
                lg={3}
                mt={1}
                textAlign={"center"}
              >
                <Controller
                  name="DocNum"
                  control={controlIssue}
                  rules={{
                    validate: (value) => {
                      if (watchIssue("Series") === "0" && !value) {
                        return " Please Enter DocNum";
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="DOC NO"
                      {...field}
                      readOnly={true}
                      // disabled={!allFormData.DocEntry}
                      // readOnly={
                      //   !allFormData.DocEntry === false ||
                      //   watchIssue("Series") !== "0"
                      // }
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
                lg={3}
                mt={1}
                textAlign={"center"}
              >
                <Controller
                  name="DocDate"
                  control={controlIssue}
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
                        setValueIssue("DocDate", date);
                        // setValueIssue("DocDueDate", "");
                      }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid
              container
              item
              mt={1}
              sx={{
                ml: 2,
                overflow: "auto",
                width: isFullScreen
                  ? "100%"
                  : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
                height: isFullScreen ? "60vh" : "auto",
              }}
            >
              <Paper
                sx={{
                  width: isFullScreen
                    ? "100%"
                    : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
                  height: isFullScreen ? "60vh" : "50vh",
                }}
              >
                <DataGrid
                  apiRef={issueGridApiRef}
                  columnHeaderHeight={35}
                  rowHeight={45}
                  rows={getValuesIssue("oLines" || []).map((data, index) => ({
                    ...data,
                    id: index,
                  }))}
                  editMode="cell"
                  columns={ISsueColumn}
                  getRowId={(row) => row.id}
                  // onRowSelectionModelChange={onRowSelectionModelChange}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  sx={gridSx}
                  onProcessRowUpdateError={(err) => console.error(err)}
                  processRowUpdate={processRowUpdateIssue}
                  onCellKeyDown={handleCellKeyDownIssue}
                  disableColumnFilter
                  disableColumnSelector
                  disableDensitySelector
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                />
              </Paper>
            </Grid>
            <Grid
              xs={12}
              mt={1}
              // mx={3}
              sm={6}
              md={6}
              lg={6}
              textAlign={"center"}
            >
              <Controller
                name="Comments"
                control={controlIssue}
                render={({ field, fieldState: { error } }) => (
                  <InputLargeTextField
                    label="REMARK"
                    type="text"
                    {...field}
                    multiline={2}
                    error={!!error}
                    helperText={error ? error.message : null}
                    // onChange={(e) => {
                    //   field.onChange(e);
                    // }}
                  />
                )}
              />
            </Grid>
            <Grid
              xs={12}
              mt={1}
              // mx={3}
              sm={6}
              md={6}
              lg={6}
              textAlign={"center"}
            >
              <Controller
                name="DocTotal"
                control={controlIssue}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="Total"
                    type="text"
                    readOnly={true}
                    {...field}
                    multiline={2}
                    error={!!error}
                    helperText={error ? error.message : null}
                    // onChange={(e) => {
                    //   field.onChange(e);
                    // }}
                  />
                )}
              />
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
                size="small"
                type="submit"
                // onClick={handleSave}
              >
                Save
              </Button>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setopenIssueComp(false)}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <Modal
        open={openReciept}
        onClose={() => setReciept(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: isFullScreenReciept
              ? "95%"
              : { xs: "75%", sm: "75%", md: "75%", lg: "70%" },
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
          component={"form"}
          onSubmit={handleSubmitReciept(SubmitReciept)}
        >
          <IconButton
            onClick={toggleModalSizeReciept}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              // "&:hover": {
              //   bgcolor: "darkred",
              // },
            }}
          >
            {isFullScreenReciept ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          <Typography
            textAlign="center"
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            RECEIPT FROM PRODUCTION
          </Typography>
          <Divider />

          <Grid container>
            <Grid
              container
              item
              mt={2}
              sx={{
                overflow: "auto",
                width: "100%",
              }}
            >
              <Grid item xs={12} sm={6} md={4} lg={3} textAlign={"center"}>
                <Controller
                  name="Series"
                  rules={{ required: "please select Series" }}
                  control={controlReciept}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      label="SERIES"
                      data={[
                        ...(DocseriesReciept || []).map((item) => ({
                          key: item.SeriesId,
                          value: item.SeriesName,
                        })),
                      ]}
                      // disabled={!allFormData.DocEntry === false}
                      readOnly={true}
                      {...field}
                      // onChange={(e) => {
                      //   const selectedSeries = e.target.value;
                      //   field.onChange(selectedSeries);
                      //   setValueReciept("Series", selectedSeries);
                      //   if (selectedSeries !== "0") {
                      //     const seriesData = DocSeries.find(
                      //       (item) => item.SeriesId === selectedSeries,
                      //     );

                      //     setValueReciept("DocNum", seriesData.DocNum || "");
                      //     setValueReciept(
                      //       "FinncPriod",
                      //       seriesData?.FinncPriod ?? "",
                      //     );
                      //     setValueReciept(
                      //       "PIndicator",
                      //       seriesData?.Indicator ?? "",
                      //     );
                      //     setValueReciept(
                      //       "SeriesName",
                      //       seriesData?.SeriesName || "",
                      //     );
                      //     clearErrorsReciept("DocNum");
                      //   } else {
                      //     setValueReciept("DocNum", "");
                      //     setValueReciept("SeriesName", ""); // Clear SeriesName immediately
                      //     clearErrorsReciept("DocNum");
                      //     setValueReciept("FinncPriod", "0");
                      //     setValueReciept("PIndicator", "0");
                      //   }
                      // }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid
                item
                xs={12}
                mt={1}
                sm={6}
                md={4}
                lg={3}
                textAlign={"center"}
              >
                <Controller
                  name="DocNum"
                  control={controlReciept}
                  rules={{
                    validate: (value) => {
                      if (watchReciept("Series") === "0" && !value) {
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
                      readOnly={true}
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
                lg={3}
                mt={1}
                textAlign={"center"}
              >
                <Controller
                  name="DocDate"
                  control={controlReciept}
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
                        setValueReciept("DocDate", date);
                        // setValueIssue("DocDueDate", "");
                      }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid
              container
              item
              mt={1}
              sx={{
                ml: 2,
                overflow: "auto",
                width: isFullScreenReciept
                  ? "100%"
                  : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
                height: isFullScreenReciept ? "60vh" : "auto",
              }}
            >
              <Paper
                sx={{
                  width: isFullScreenReciept
                    ? "100%"
                    : { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
                  height: isFullScreenReciept ? "60vh" : "50vh",
                }}
              >
                <DataGrid
                  apiRef={RecieptGridApiRef}
                  columnHeaderHeight={35}
                  rowHeight={45}
                  editMode="cell"
                  rows={getValuesReciept("oLines" || []).map((data, index) => ({
                    ...data,
                    id: index,
                  }))}
                  columns={RecieptColumn}
                  getRowId={(row) => row.id}
                  processRowUpdate={processRowUpdateReciept}
                  onProcessRowUpdateError={(err) => console.error(err)}
                  onCellKeyDown={handleCellKeyDownReciept}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  disableColumnFilter
                  disableColumnSelector
                  disableDensitySelector
                  sx={gridSx}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                />
              </Paper>
            </Grid>
            <Grid
              xs={12}
              mt={1}
              // mx={3}
              sm={6}
              md={6}
              lg={6}
              textAlign={"center"}
            >
              <Controller
                name="Comments"
                control={controlReciept}
                render={({ field, fieldState: { error } }) => (
                  <InputLargeTextField
                    label="REMARK"
                    type="text"
                    {...field}
                    multiline={2}
                    error={!!error}
                    helperText={error ? error.message : null}
                    // onChange={(e) => {
                    //   field.onChange(e);
                    // }}
                  />
                )}
              />
            </Grid>
            <Grid
              xs={12}
              mt={1}
              // mx={3}
              sm={6}
              md={6}
              lg={6}
              textAlign={"center"}
            >
              <Controller
                name="DocTotal"
                control={controlReciept}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="Total"
                    type="text"
                    {...field}
                    readOnly={true}
                    error={!!error}
                    helperText={error ? error.message : null}
                    // onChange={(e) => {
                    //   field.onChange(e);
                    // }}
                  />
                )}
              />
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
                size="small"
                type="submit"
                // onClick={handleSave}
              >
                Save
              </Button>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setReciept(false)}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
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
          component="form"
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
              },
              position: "absolute",
              left: "10px",
              // display: { lg: "none", xs: "block" },
            }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            aria-expanded={rightClick ? "true" : undefined}
            onClick={(e) => setAnchorEl(e.currentTarget)} // 👈 anchor here
            sx={{
              display: {}, // Show only on smaller screens
              position: "absolute",
              right: "70px",
            }}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            id="menu"
            anchorEl={anchorEl}
            open={rightClick}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom", // 👈 icon bottom
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top", // 👈 menu starts from top
              horizontal: "right",
            }}
          >
            <MenuItem
              disabled={
                SaveUpdateName === "SAVE" ||
                ["0", "3"].includes(allFormData.Status) ||
                (Number(allFormData.CmpltQty) !== Number(allFormData.RjctQty) &&
                  LineLevelIssueQty <= 0)
              }
              onClick={() => {
                handleOnCancelDocument();
                setAnchorEl(null);
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
                // disabled={
                //   OpenQuantity === Quantity || SaveUpdateName === "SAVE"
                // }
                fontWeight="bold"
              >
                CANCEL
              </Typography>
            </MenuItem>
            <MenuItem
              disabled={SaveUpdateName === "SAVE" || allFormData.Status !== "5"}
              onClick={() => {
                handleOnCloseDocument();
                setAnchorEl(null);
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
              Production Order
            </Typography>
          </Grid>

          <Grid
            container
            item
            width={"100%"}
            height={"100%"}
            border={"1px silver solid"}
            //             sx={{
            //   textTransform: "none",
            //   "& .MuiTab-root": {
            //     textTransform: "none",
            //   },
            //   "& .MuiButton-root": {
            //     textTransform: "none",
            //   },
            // }}
            // textTransform={"uppercase"}
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
                <Grid container>
                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Type"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="TYPE"
                          onChange={(e) => {
                            field.onChange(e);
                            setValue("WHSCode", "");
                            setValue("UomCode", "");
                            setValue("ItemCode", "");
                            setValue("ProdName", "");
                            setValue("oLines", []);
                          }}
                          data={[
                            { key: "S", value: "STANDARD" },
                            { key: "P", value: "SPECIAL" },
                            { key: "D", value: "DISASSEMBLY" },
                          ]}
                        />
                      )}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Status"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          disabled={
                            SaveUpdateName === "SAVE" ||
                            ["0", "3"].includes(allFormData.Status) ||
                            (Number(allFormData.CmpltQty) !==
                              Number(allFormData.RjctQty) &&
                              LineLevelIssueQty <= 0)
                          }
                          label="STATUS"
                          data={[
                            { key: "4", value: "PLANNED" },
                            { key: "5", value: "RELEASED" },
                            ...(allFormData.Status === "0"
                              ? [{ key: "0", value: "CLOSED" }]
                              : []),
                            ...(allFormData.Status === "3"
                              ? [{ key: "3", value: "CANCELLED" }]
                              : []),
                          ]}
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
                          ]}
                          {...field}
                          disabled={SaveUpdateName !== "SAVE"}
                          onChange={(e) => {
                            const selectedSeries = e.target.value;
                            field.onChange(selectedSeries);
                            setValue("Series", selectedSeries);
                            if (selectedSeries !== "0") {
                              const seriesData = DocSeries.find(
                                (item) => item.SeriesId === selectedSeries,
                              );
                              setValue("DocNum", seriesData.DocNum || "");
                              setValue(
                                "SeriesName",
                                seriesData?.SeriesName || "",
                              );
                              clearErrors("DocNum");
                            } else {
                              setValue("DocNum", "");
                              setValue("SeriesName", ""); // Clear SeriesName immediately
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

                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          disabled={SaveUpdateName !== "SAVE"}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ItemCode" // Unique name per row
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                          // disabled={currentData.TreeType === "P" ? false : true}
                          label="PRODUCTION NO"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => {
                                    setOpenBom(true);
                                  }}
                                  size="small"
                                  color="primary"
                                  // disabled={
                                  //   currentData.TreeType === "P" ? false : true
                                  // }
                                  disabled={status === "5" && tab === "5"}
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
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ProdName"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Product Description"
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
                      name="PlannedQty"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Planned Quantity"
                          type="number"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          onChange={(e) => {
                            field.onChange(e); // update form state
                            HeaderCal(e.target.value); // call your function to update oLines
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="UomCode"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="UoM Name"
                          type="text"
                          readOnly
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="WHSCode" // Unique name per row
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                          // disabled={currentData.TreeType === "P" ? false : true}
                          label="WHSCode"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => {
                                    setWhscOpen(true);
                                  }}
                                  size="small"
                                  color="primary"
                                  // disabled={
                                  //   currentData.TreeType === "P" ? false : true
                                  // }
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
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CmpltQty"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="COMPLETED QUANTITY"
                          {...field}
                          error={!!error}
                          readOnly={true}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="RjctQty"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="REJECTED QUANTITY"
                          {...field}
                          readOnly={true}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  {/* 
                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="RouDatCalc"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="ROUTING DATE CALCULATION"
                          data={[
                            { key: "S", value: "On Start Date" },
                            { key: "D", value: "On End Date" },
                            { key: "F", value: "Start Date Forwards" },
                            { key: "B", value: "End Date Backwards" },
                          ]}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="PostDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="ORDER DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          maxDate={dayjs(undefined).format("YYYY-MM-DD")}
                          onChange={(date) => {
                            setValue("PostDate", date);
                          }}
                          disabled={SaveUpdateName !== "SAVE"}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="StartDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="START DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setValue("StartDate", date);
                            setValue("DueDate", date);
                            handleChangeStartDate(date);
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
                          minDate={getValues("DueDate")}
                          onChange={(newValue) => {
                            setValue("DueDate", newValue);
                            handleChangeDueDate(newValue);
                          }}
                          disabled={!getValues("StartDate")}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CardCode" // Unique name per row
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                          // disabled={currentData.TreeType === "P" ? false : true}
                          label="CUSTOMER"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => {
                                    setCustomerOpen(true);
                                  }}
                                  size="small"
                                  color="primary"
                                  // disabled={
                                  //   currentData.TreeType === "P" ? false : true
                                  // }
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

                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="LinkToObj"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="LINKED TO"
                          data={[
                            { key: "202", value: "Production Order" },
                            { key: "17", value: "Sales Order" },
                          ]}
                        />
                      )}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="OriginNum" // Unique name per row
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                          // disabled={currentData.TreeType === "P" ? false : true}
                          label="LINKED ORDER"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => {
                                    setOpenLinked(true);
                                  }}
                                  size="small"
                                  color="primary"
                                  // disabled={
                                  //   currentData.TreeType === "P" ? false : true
                                  // }
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
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    {/* <Controller
                      name="CmpltQty"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="COMPLETED QUANTITY"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    /> */}
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
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Button
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        onClick={() => setopenIssueComp(true)}
                        disabled={!(status === "5" && tab === "5")}
                      >
                        ISSUE COMPONENTS
                      </Button>
                    </Box>
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
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Button
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        // onClick={handleClick}
                        onClick={() => setReciept(true)}
                        disabled={!(status === "5" && tab === "5")}
                      >
                        REPORT COMPLETION
                      </Button>
                    </Box>
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
                            <Inventory2Icon sx={{ mr: 0.5 }} /> COMPONENTS
                          </Grid>
                        }
                      />
                      <Tab
                        value={1}
                        label={
                          <Grid
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <SummarizeIcon sx={{ mr: 0.5 }} />
                            SUMMARY
                          </Grid>
                        }
                      />
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
                      <>
                        <IconButton
                          size="small"
                          disabled={!allFormData.ItemCode}
                          sx={{
                            backgroundColor: "green",
                            borderRadius: "20%",
                            color: "white",
                            m: 1,
                          }}
                          onClick={addRow}
                        >
                          <AddOutlinedIcon />
                        </IconButton>
                        <Grid item xs={12}>
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
                            <DataGrid
                              className="datagrid-style"
                              columnHeaderHeight={35}
                              rowHeight={45}
                              apiRef={apiRef}
                              sx={{
                                ...gridSx,
                              }}
                              columns={ItemColumn}
                              rows={(getValues("oLines") || []).map(
                                (data, index) => ({
                                  ...data,
                                  id: index + 1,
                                }),
                              )}
                              editMode="cell"
                              isCellEditable={isCellEditableFn}
                              getCellClassName={(params) => {
                                const editableFields = [
                                  "rote",
                                  "StartDate",
                                  "EndDate",
                                  "Status",
                                  "BaseQty",
                                  "AdditQty",
                                  "PlannedQty",
                                  "IssuedQty",
                                  "OpenQuantity",
                                  "WHSCode",
                                  "UomCode",
                                  "IssueType",
                                  "WipActCode",
                                ];

                                if (
                                  !isCellEditableFn(params) &&
                                  editableFields.includes(params.field)
                                ) {
                                  return "disabled-cell";
                                }
                                return "";
                              }}
                              //                              isCellEditable={(params) => {
                              //   if (params.row.Type !== 296 && params.field === "rote") return false;
                              //   if (params.row.Type !== 296 && ["StartDate", "EndDate", "Status"].includes(params.field)) return false;
                              //   return true;
                              // }}
                              // getCellClassName={(params) =>
                              //   ["rote", "StartDate", "EndDate", "Status"].includes(params.field) &&
                              //   params.row.Type !== 296
                              //     ? "disabled-cell"
                              //     : ""
                              // }

                              // isCellEditable={(params) =>
                              //   !(
                              //     params.field === "rote" &&
                              //     params.row.Type !== 296
                              //   )
                              // }
                              // getCellClassName={(params) =>
                              //   params.field === "rote" &&
                              //  params.row.Type !== 296
                              //     ? "disabled-cell"
                              //     : ""
                              // }

                              getRowClassName={(params) =>
                                allFormData.Status === "0"
                                  ? "disabled-row"
                                  : "" || allFormData.Status === "3"
                                    ? "disabled-row"
                                    : ""
                              }
                              getRowId={(row) => row?.id ?? -1}
                              processRowUpdate={processRowUpdate}
                              onProcessRowUpdateError={(err) =>
                                console.error(err)
                              }
                              onCellKeyDown={handleCellKeyDown}
                              disableColumnFilter
                              disableColumnSelector
                              disableDensitySelector
                              slotProps={{
                                toolbar: {
                                  showQuickFilter: true,
                                  quickFilterProps: { debounceMs: 500 },
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}
                    {/* Tab 2 - Logistics */}
                    {tabvalue === 1 && (
                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={12}
                          md={12}
                          lg={4}
                          textAlign={"center"}
                          // borderBottom={1}
                        >
                          <h4>COSTS</h4>
                          <Controller
                            name="LinkedOrder"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Actual Item Component Cost"
                                // type="text"
                                // title="Actual Item Component Cost"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />

                          <Controller
                            name="LinkedOrder2"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Actual Additional Cost"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="LinkedOrder3"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Actual Product Cost"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="er"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Actual By-Product Cost"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="dsfg"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Total Variance"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="JrnlMemo"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Journal Remark"
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
                          md={12}
                          lg={4}
                          textAlign={"center"}
                          // borderBottom={1}
                        >
                          <h4>QUANTITIES</h4>
                          <Controller
                            name="PlannedQty"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Planned Quantity"
                                readOnly={true}
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="CmpltQty"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Completed Quantity"
                                {...field}
                                error={!!error}
                                readOnly={true}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="RjctQty"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Rejected Quantity"
                                {...field}
                                error={!!error}
                                readOnly={true}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <h4>DATES</h4>
                          {/* <InputDatePickerFields
                            label="Due Date"
                            name="Date"
                            //value={dayjs(undefined)}
                          />
                          <InputDatePickerFields
                            label="Actual Closing Date"
                            name="Date"
                            //value={dayjs(undefined)}
                          /> */}
                          <Controller
                            name="DueDate"
                            control={control}
                            rules={{ required: "Date is Required" }}
                            render={({ field, fieldState: { error } }) => (
                              <SelectedDatePickerField
                                label="DUE DATE"
                                name={field.name}
                                value={
                                  field.value ? dayjs(field.value) : undefined
                                }
                                onChange={(date) => {
                                  setValue("DueDate", date, {
                                    shouldDirty: true,
                                  });
                                }}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="CloseDate"
                            control={control}
                            rules={{ required: "Date is Required" }}
                            render={({ field, fieldState: { error } }) => (
                              <SelectedDatePickerField
                                label="ACTUAL CLOSED DATE"
                                name={field.name}
                                value={
                                  field.value ? dayjs(field.value) : undefined
                                }
                                onChange={(date) => {
                                  setValue("StartDate", date, {
                                    shouldDirty: true,
                                  });
                                  setValue("DueDate", date, {
                                    shouldDirty: true,
                                  });
                                }}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="LinksedOrder"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Overdue"
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
                          md={12}
                          lg={4}
                          textAlign={"center"}
                          // borderBottom={1}
                        >
                          <h4>PLANNED TIMES </h4>
                          <Controller
                            name="LinwkedOrder"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Total Production Time"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="LinfakedOrder"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Total Additional Time"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="LinkesdOrder"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Total Run Time"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <h4>Planned Days</h4>
                          <Controller
                            name="LinkefddOrder"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Total Required Days"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="LinkeghdOrder"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Total Waiting Days"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                          <Controller
                            name="LinkedOrder"
                            rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Total Days"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
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
                  <Grid container>
                    <Grid
                      xs={12}
                      mt={1}
                      // mx={3}
                      sm={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Comments"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputLargeTextField
                            label="REMARK"
                            type="text"
                            {...field}
                            multiline={2}
                            error={!!error}
                            helperText={error ? error.message : null}
                            // onChange={(e) => {
                            //   field.onChange(e);
                            // }}
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
                  name={SaveUpdateName}
                  type="submit"
                  sx={{ color: "white" }}
                  disabled={!perms.IsAdd || !perms.IsEdit}
                >
                  {SaveUpdateName}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="info"
                  // disabled={!perms.IsDelete}
                  disabled={true}
                >
                  PRINT
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
export default React.memo(ProductionOrder);
