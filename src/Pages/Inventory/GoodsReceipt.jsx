// import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";

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
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import "../../App.css";
import SearchInputField from "../Components/SearchInputField";

import DeleteIcon from "@mui/icons-material/Delete";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { DataGrid } from "@mui/x-data-grid";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext.jsx";
import apiClient from "../../services/apiClient.js";
import CardComponent from "../Components/CardComponent.jsx";
import DataGridModal from "../Components/DataGridModal.jsx";

import BinLocation from "../Components/BinLocation.jsx";
import ExchangeRate from "../Components/ExchangeRate.jsx";
import { fetchExchangeRateGeneric } from "../Components/fetchExchangeRateGeneric.js";
import { fetchPriceListData } from "../Components/fetchPriceListData.js";
import {
  InputDatePickerField,
  InputFields,
  InputSelectFields,
  InputSelectTextField,
  InputTextField,
  InputTextSearchButtonTable,
  SelectedDatePickerField,
  SmallInputTextField,
} from "../Components/formComponents";
import { recalcHeaderTotals } from "../Components/recalcHeaderTotals.js";
import { recalculateLines } from "../Components/recalculateLines.js";
import SearchModel from "../Components/SearchModel.jsx";
import { useSysRateCurrency } from "../Components/SyRateCurrency.jsx";
import { TimeDelay } from "../Components/TimeDelay";
import usePermissions from "../Components/usePermissions.jsx";
import { useRecalculateLinesOnChange } from "../Components/useRecalculateLinesOnChange.js";
import { TwoFormatter, ValueFormatter } from "../Components/ValueFormatter.jsx";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll.jsx";
import PrintMenu from "../Components/PrintMenu.jsx";
import SerialIntake from "../Components/SerialIntake.jsx";
import BatchIntake from "../Components/Batch.jsx";
import { dataGridSx } from "../../Styles/dataGridStyles.js";
import { useGridApiRef } from "@mui/x-data-grid";
import CalCulation from "../Components/CalCulation.jsx";
const modelColumns = [
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
  exchaneRateOpen: false,
  DocRateOpen: false,
  BinLocationOpen: false,
  modal2: false,
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
export default function GoodsReceipt() {
  const { user, warehouseData, companyData } = useAuth();
  const perms = usePermissions(87);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [getListqueryWarehouse, setGetListQueryWarehouse] = useState("");
  const [PriceListData, setPriceListData] = useState([]);
  const [getListSearchingWarehouse, setGetListSearching1] = useState(false);
  const [getListDataWarehouse, setgetListDataWarehouse] = useState([]);
  const [getListPageWarehouse, setgetListPageWarehouse] = useState(0);
  const [hasMoreGetListWarehouse, sethasMoreGetListWarehouse] = useState(true);
  const [searchmodelOpenWarehouse, setsearchmodelOpenWarehouse] =
    useState(false);
  const [getListqueryAccount, setgetListqueryAccount] = useState("");
  const [getListSearchingAccount, setgetListSearchingAccount] = useState(false);
  const [getListDataAccount, setgetListDataAccount] = useState([]);
  const [getListPageAccount, setgetListPageAccount] = useState(0);
  const [hasMoreGetListAccount, sethasMoreGetListAccount] = useState(true);
  const [searchmodelOpenAccount, setsearchmodelOpenAccount] = useState(false);
  const [searchmodelOpen3, setSearchmodelOpen3] = useState(false);
  const [UoMCodeList, SetUoMCode] = useState([]);
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabvalue, settabvalue] = useState(0);

  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [open, setOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowId, setSelectedRowId] = React.useState(null);
  const [BinlocListData, setBinLocData] = useState([]);
  const [httpRequestToken, setCancelToken] = useState();
  const [clearCache, setClearCache] = useState(false);

  let [ok, setok] = useState("OK");
  const [itemList, setItemList] = useState([]);
  const [itemCache, setItemCache] = useState({});
  const LIMIT = 20;
  const [rowCount, setRowCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //=====================================get List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setopenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setopenListquery] = useState("");
  const [OpenListSearching, setOpenListSearching] = useState(false);
  const timeoutRef = useRef(null);
  const [selectedData, setSelectedData] = useState([]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleTabChange = (event, newValue) => settabvalue(newValue);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [PrintData, setPrintData] = useState([]);
  let [openserial, setopenserial] = useState(false);
  let [openBatch, setopenBatch] = useState(false);
  const handleCloseSerial = () => setopenserial(false);
  const handleCloseBatch = () => setopenBatch(false);
  const apiRef = useGridApiRef();

  const [selectedItem, setSelectedItem] = useState(null);
  //=========================================get List State End================================================================
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const initial = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: "",
    ModifiedBy: "",
    Status: "",
    DocNum: "",
    DocDate: dayjs(undefined),
    GroupNum: "1",
    FinncPriod: "",
    PIndicator: "",
    TaxDate: dayjs(undefined),
    Ref2: "",
    Comments: "",
    JrnlMemo: "Goods Receipt",
    AttcEntry: "0",
    Series: "0",
    oLines: [],
    ItemCode: "",
    ItemName: "",
    Quantity: "",
    WHSCode: "",
    LineTotal: "",
    Grpno: "",
    AcctCode: "",
    Price: "1",
    PriceBefDi: "0",
    UoMCode: "",
    UomName: "",
    UgpEntry: "",
    UomEntry2: "",
    OnHand: "",
    IsCommited: "",
    OnOrder: "",
    CodeBars: "",
    DiscPrcnt: "",
    MinLevel: "",
    OpenQuantity: "",
    StockPrice: "",
    NumPerMsr: "",
    UgpCode: "",
    BaseType: "",
    BaseEntry: "",
    BaseLine: "",
    DocTotal: "",
    InvntSttus: "",
    DocCur: "",
    DocRate: "",
    DocTotalFC: "",
    SysRate: "",
    CurSource: "",
    DocTotalSy: "",
    Volume: "",
    VolUnit: "",
    Weight: "",
    unitMsr: "",
    unitMsr2: "",
    UoMCode2: "",
    WeightUnit: "",
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
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });
  const allFormData = getValues();
  const GroupNum = watch("GroupNum");
  const docDate = watch("DocDate");
  const DocRateLine = watch("DocRateLine");

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/59`,
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
  const { DocSeries } = useDocumentSeries(
    "59",
    docDate,
    setValue,
    clearCache,
    SaveUpdateName,
  );

  const PriceListfetch = async () => {
    try {
      const res = await apiClient.get(`/PriceList/Pages/1/0/500`);
      const response = res.data;
      if (response.success === true) {
        setValue("GroupNum", response.values[0].DocEntry);
        setValue("CurrencyLine", response.values[0].PrimCurr);
        await fetchExchangeRateGeneric({
          apiClient,
          Currency: response.values[0]?.Currency ?? "INR",
          DocDate: dayjs(undefined).format("YYYY-MM-DD"),
          companyData: companyData,
          setValue,
          dispatch,
        });
        setPriceListData(response.values);
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
  //Call Page Open Time
  useEffect(() => {
    PriceListfetch();
    fetchgetListDataWarehouse(0);
    fetchgetListDataAccount(0);
    fetchOpenListData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  //===============================================Active list data==========================================
  // Close Search Fild Clare
  const handleCloseListClear = () => {
    setopenListquery("");
    setOpenListSearching(false);
    setopenListPage(0);
    setOpenListData([]);
    fetchOpenListData(0);
  };
  // Search Record Result
  const handleCloseListSearch = (res) => {
    setopenListquery(res);
    setOpenListSearching(true);
    setopenListPage(0);
    setOpenListData([]);

    // Cancel Token
    if (typeof httpRequestToken != typeof undefined) {
      // console.log("REQUEST CANCELLED", httpRequestToken);
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res, httpRequestToken);
    }, TimeDelay);
    // fetchOpenListData(0,res,httpRequestToken);
  };
  //Featch more Data
  const fetchMoreCloseListData = () => {
    fetchOpenListData(
      openListPage + 1,
      OpenListSearching ? openListquery : "",
      httpRequestToken,
    );
    setopenListPage((prev) => prev + 1);
  };
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/GoodsReceipt/Search/${searchTerm}/1/${pageNum}/20`
        : `/GoodsReceipt/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleFetchRate = async () => {
    await fetchExchangeRateGeneric({
      apiClient,
      Currency: getValues("CurrencyLine"),
      DocDate: getValues("DocDate"),
      companyData: companyData,
      setValue,
      dispatch,
    });
  };
  useRecalculateLinesOnChange({
    getValues,
    setValue,
    dependencies: [getValues("DocDate"), getValues("DocRateLine")],
  });
  const onSubmitCurrency = (data) => {
    setValue("DocRateLine", data ?? 0);
    setValue("DocEntryCur", data?.DocEntryCur ?? 0);
    const updateedOline = recalculateLines({
      oLines: getValues("oLines"),
      DocRateLine: data ?? 0,
      SysRate: SysRateApi || 1,
      setValue,
    });
    console.log("updateedOline", updateedOline);
    dispatch({ type: "CLOSE", modal: "DocRateOpen" });
  };
  //==================================================================================================
  // const handleChange = (e, row) => {
  //   setok("UPDATE");
  //   const { name, value } = e.target;
  //   const updatedLines = getValues("oLines").map((data, index) => {
  //     if (row.id !== index) return data;
  //     const updatedData = {
  //       ...data,
  //       [name]: value,
  //     };
  //     if (name === "PriceBefDi") {
  //       updatedData.PriceBefDi = Math.min(Math.max(value, 0));
  //       updatedData.Currency = companyData.MainCurncy;
  //     }
  //     if (name === "Quantity") {
  //       updatedData.Quantity = Math.min(Math.max(value, 0));
  //     }
  //     if (
  //       updatedData.ManBtchNum === "Y" &&
  //       updatedData.oBatchLines?.length > 0
  //     ) {
  //       const totalBatchQty = updatedData.oBatchLines.reduce(
  //         (sum, b) => sum + Number(b.BatchQty || 0),
  //         0
  //       );

  //       if (totalBatchQty !== updatedData.Quantity) {
  //         Swal.fire({
  //           icon: "warning",
  //           title: "Batch quantity mismatch",
  //           text: `Batch total (${totalBatchQty}) must match Quantity (${updatedData.Quantity})`,
  //           confirmButtonText: "OK",
  //         });
  //         return data; // ⛔ rollback
  //       }
  //     }

  //     if (
  //       updatedData.ManSerNum === "Y" &&
  //       updatedData.oSerialLines?.length > 0
  //     ) {
  //       if (updatedData.oSerialLines.length !== updatedData.Quantity) {
  //         Swal.fire({
  //           icon: "warning",
  //           title: "Serial quantity mismatch",
  //           text: `Serial count (${updatedData.oSerialLines.length}) must match Quantity (${updatedData.Quantity})`,
  //           confirmButtonText: "OK",
  //         });
  //         return data; // ⛔ rollback
  //       }
  //     }
  //     const invQty = updatedData.NumPerMsr * updatedData.Quantity;
  //     updatedData.InvQty = invQty;
  //     updatedData.OpenInvQty = invQty;
  //     const Rate =
  //       companyData.MainCurncy === updatedData.Currency
  //         ? "1"
  //         : updatedData.Rate;
  //     updatedData.LineTotal =
  //       updatedData.Quantity * updatedData.PriceBefDi * Rate;
  //     updatedData.TotalSumSy = ValueFormatter(
  //       updatedData.LineTotal / SysRateApi
  //     );
  //     updatedData.StockSum =
  //       updatedData.Quantity * updatedData.PriceBefDi * Rate;
  //     updatedData.StockSumSc =
  //       (updatedData.Quantity * updatedData.PriceBefDi * Rate) / SysRateApi;

  //     return updatedData;
  //   });
  //   reset({ ...getValues(), oLines: updatedLines });
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
        TwoFormatter(updatedData.oSerialLines.length) !== updatedData.InvQty
      ) {
        Swal.fire({
          icon: "warning",
          title: "Serial quantity mismatch",
          text: `Serial count (${TwoFormatter(
            updatedData.oSerialLines.length,
          )}) must match Quantity (${TwoFormatter(updatedData.InvQty)})`,
          confirmButtonText: "OK",
        });
      }
    }
    if (newRow.PriceBefDi !== undefined && newRow._priceEdited) {
      updatedData.PriceBefDi = Math.max(newRow.PriceBefDi, 0);
      // Clean up the flag
      delete updatedData._priceEdited;
    }
    updatedData.Rate =
      companyData.MainCurncy === updatedData.Currency ? "1" : updatedData.Rate;
    const CalcLines = CalCulation(
      updatedData.Quantity,
      updatedData.PriceBefDi,
      0,
      updatedData.Rate,
    );
    updatedData.Price = CalcLines.discountedPrice;
    const invQty = updatedData.NumPerMsr * updatedData.Quantity;
    updatedData.InvQty = invQty;
    updatedData.OpenInvQty = invQty;
    updatedData.LineTotal = CalcLines.LineTotal;
    updatedData.TotalSumSy = updatedData.LineTotal / SysRateApi;
    updatedData.StockSum = CalcLines.LineTotal;
    updatedData.StockSumSc = CalcLines.LineTotal / SysRateApi;
    const updatedLines = getValues("oLines").map((d, i) =>
      i === oldRow.id ? updatedData : d,
    );
    reset({ ...allFormData, oLines: updatedLines });

    return updatedData;
  };
  if (SaveUpdateName === "SAVE") {
    recalcHeaderTotals(getValues("oLines"), setValue);
  }

  const handleDeleteRow = (id) => {
    const updatedRows = allFormData.oLines.filter((_, index) => index !== id);
    const updatedData = {
      ...allFormData,
      oLines: updatedRows,
    };
    reset(updatedData);
  };

  console.log("dfdsall data", allFormData.oLines);
  // const columns = [
  //   { field: "ItemCode", headerName: "ITEM NO", width: 150 },
  //   {
  //     field: "ItemName",
  //     headerName: "ITEM DESC",
  //     width: 150,
  //   },

  //   {
  //     field: "Quantity",
  //     headerName: "QTY",
  //     sortable: false,
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         type="number"
  //         name="Quantity"
  //         defaultValue={params.value}
  //         sx={{ width: 130 }}
  //         onBlur={(e) => handleChange(e, params.row)}
  //         disabled={params.row.Status === "0"}
  //       />
  //     ),
  //   },
  //   {
  //     field: "PriceBefDi",
  //     headerName: "Info Price",
  //     sortable: false,
  //     width: 200,
  //     editable: false,
  //     align: "center", // centers cell text
  //     headerAlign: "center",
  //     renderCell: (params) => (
  //       <InputTextField
  //         placeholder="0"
  //         name="PriceBefDi"
  //         type="number"
  //         defaultValue={params.value}
  //         sx={{ width: 130 }}
  //         // value={watch("PriceBefDi")||params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
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
  //     field: "LineTotal",
  //     headerName: "Total",
  //     sortable: false,
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         placeholder="0"
  //         name="LineTotal"
  //         type="number"
  //         value={params.value}
  //         sx={{ width: 130 }}
  //         onChange={(e) => handleChange(e, params.row)}
  //       />
  //     ),
  //   },
  //   {
  //     field: "WHSCode",
  //     headerName: "WHS CODE",
  //     width: 200,
  //     editable: false,
  //     renderCell: (row) => (
  //       <Controller
  //         name="WHSCode"
  //         control={control}
  //         render={({ field }) => (
  //           <InputTextSearchButtonTable
  //             disabled={SaveUpdateName === "UPDATE"}
  //             onClick={() => {
  //               setSelectedRowId(row.id);
  //               OpenDailog1();
  //             }}
  //             {...field}
  //             value={row.value}
  //           />
  //         )}
  //       />
  //     ),
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
  //         (cur, val) => cur + Number(val.Quantity || 0),
  //         0
  //       );
  //       return (
  //         <Controller
  //           name="Bin"
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               // {...field}
  //               name="Bin"
  //               // readOnly={allFormData.DocEntry}
  //               value={BinQty}
  //               title={BinQty}
  //               error={!!error}
  //               helperText={error?.message}
  //               InputProps={{
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         // setValue("BinLocation", params.row); // store clicked row
  //                         setBinLocData(params.row);
  //                         dispatch({ type: "OPEN", modal: "BinLocationOpen" });
  //                       }}
  //                       disabled={
  //                         SaveUpdateName === "UPDATE"
  //                           ? (params.row.oDocBinLocationLines || []).length ===
  //                             0
  //                           : params.row.Status === "0" ||
  //                             Number(params.row.DftBinAbs) <= 0 ||
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
  //     field: "LocationName",
  //     headerName: "Location",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     align: "center", // centers cell text
  //     headerAlign: "center",
  //   },
  //   {
  //     field: "OnHand",
  //     headerName: "IN STOCK QTY",
  //     width: 100,
  //     sortable: false,
  //     editable: false,
  //   },
  //   {
  //     field: "IsCommited",
  //     headerName: "Committed",
  //     width: 100,
  //     sortable: false,
  //     editable: false,
  //   },
  //   {
  //     field: "OnOrder",
  //     headerName: "Ordered",
  //     width: 100,
  //     sortable: false,
  //     editable: false,
  //   },
  //   {
  //     field: "MinLevel",
  //     headerName: "Minimum Inventory Level",
  //     width: 100,
  //     sortable: false,
  //     editable: false,
  //   },
  //   // {
  //   //   field: "AcctCode",
  //   //   headerName: "ACCOUNT CODE",
  //   //   width: 200,
  //   //   editable: false,
  //   //   renderCell: (row) => (
  //   //     <Controller
  //   //       name={"AcctCode"}
  //   //       control={control}
  //   //       render={({ field }) => (
  //   //         <InputTextSearchButtonTable
  //   //           readOnly
  //   //           onClick={() => {
  //   //             setSelectedRowId(row.id);
  //   //             OpenDailog2();
  //   //           }}
  //   //           {...field}
  //   //           value={row.value}
  //   //         />
  //   //       )}
  //   //     />
  //   //   ),
  //   // },
  //   {
  //     field: "AcctCode",
  //     headerName: "ACCOUNT CODE",
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => {

  //       return (
  //         <Controller
  //           name="AcctCode"
  //           control={control}
  //           render={({ field }) => (
  //             <InputTextSearchButtonTable
  //               readOnly
  //               onClick={() => {
  //                 setSelectedRowId(params.id);
  //                 OpenDailog2();
  //               }}
  //               {...field}
  //               value={params.row.AcctCode} // Set default if empty
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },

  //   {
  //     field: "UoMCode",
  //     headerName: "UOM Code",
  //     sortable: false,
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => {
  //       const isManual = params.row.UoMCode === "Manual";
  //       return (
  //         <Controller
  //           name={`UoMCode_${params.row.id}`}
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextSearchButtonTable
  //               // disabled={SaveUpdateName === "UPDATE"}
  //               {...field}
  //               name={`UoMCode_${params.row.id}`}
  //               value={params.value}
  //               disabled={isManual}
  //               onChange={(e) => {
  //                 field.onChange(e);
  //                 handleChange(e, params.row);
  //               }}
  //               error={!!error}
  //               helperText={error?.message}
  //               onClick={() => {
  //                 setSelectedRowId(params.row.id);
  //                 OpenDailog3();
  //                 fetchGetUOMListData3(params.row.UomEntry2);
  //               }}
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },

  //   {
  //     field: "NumPerMsr",
  //     headerName: "Items per Unit",
  //     width: 100,
  //     sortable: false,
  //     editable: false,
  //   },
  //   {
  //     field: "InvQty",
  //     headerName: "QTY-Inventory UoM",
  //     width: 120,
  //     editable: false,
  //     sortable: false,
  //   },
  //   {
  //     field: "Sr.batch",
  //     headerName: "Sr & Batch",
  //     width: 100,
  //     sortable: false,
  //     headerAlign: "center",
  //     align: "center",
  //     renderCell: (params) => {
  //       const {
  //         ManBtchNum,
  //         ManSerNum,
  //         BaseType,
  //         UoMCode,
  //         WHSCode,
  //         InvQty,
  //         oBatchLines = [],
  //         oSerialLines = [],
  //       } = params.row;

  //       let label = "";
  //       let color = "default";
  //       let disabled = false;
  //       let savedQty = 0;

  //       if (ManBtchNum === "Y" && ManSerNum === "N") {
  //         label = "Batch";
  //         color = "primary";
  //         savedQty = oBatchLines.reduce(
  //           (sum, b) => sum + Number(b.BatchQty || 0),
  //           0
  //         );
  //       } else if (ManBtchNum === "N" && ManSerNum === "Y") {
  //         label = "Serial";
  //         color = "success";
  //         savedQty = oSerialLines.length;
  //       } else {
  //         disabled = true;
  //       }

  //       if (BaseType === 21) {
  //         disabled = true;
  //       }

  //       /* ---------- Click handler ---------- */
  //       const handleClick = () => {
  //         if (!UoMCode || !WHSCode) {
  //           Swal.fire({
  //             toast: true,
  //             icon: "warning",
  //             title:
  //               "Please select UoM and Warehouse Code before Creating Batch / Serial.",
  //             position: "center",
  //             showConfirmButton: false,
  //             timer: 3000,
  //             timerProgressBar: true,
  //           });
  //           return;
  //         }

  //         if (label === "Batch") {
  //           handleOnBatch(params.row);
  //         } else if (label === "Serial") {
  //           handleOnSerial(params.row);
  //         }
  //       };

  //       /* ---------- Display text ---------- */
  //       const displayLabel =
  //         InvQty > 0
  //           ? `${label} (${TwoFormatter(savedQty)}/${TwoFormatter(InvQty)})`
  //           : label;

  //       return (
  //         <Tooltip title={`${displayLabel}`} arrow>
  //           <Chip
  //             label={displayLabel}
  //             color={color}
  //             size="small"
  //             clickable={!disabled}
  //             onClick={handleClick}
  //             disabled={disabled}
  //             sx={{
  //               minWidth: 90,
  //               fontWeight: 600,
  //               borderRadius: "6px",
  //             }}
  //           />
  //         </Tooltip>
  //       );
  //     },
  //   },
  //   {
  //     field: "ACTION",
  //     headerName: "ACTION",
  //     width: 100,
  //     sortable: false,
  //     renderCell: (params) => (
  //       <IconButton
  //         color="error"
  //         onClick={() => handleDeleteRow(params.row.id)}
  //       >
  //         <DeleteIcon />
  //       </IconButton>
  //     ),
  //   },
  // ];
  const columns = [
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
      field: "LineTotal",
      headerName: "Total",
      sortable: false,
      width: 150,
      editable: false,
      align: "center",
      headerAlign: "center",
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
                if (!openWHSCode && params.row.readonlyRow !== "readonlyRow") {
                  setValue("selectedRowIndex", params.row.id);
                  setSelectedRowId(params.row.id);
                  OpenDailog1();
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
                  setSelectedRowId(params.row.id);
                  OpenDailog1();
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
                disabled={
                  SaveUpdateName === "UPDATE"
                    ? (params.row.oDocBinLocationLines || []).length === 0
                    : params.row.Status === "0" ||
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
      headerName: "Location",
      width: 150,
      sortable: false,
      editable: false,
      align: "center", // centers cell text
      headerAlign: "center",
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
      field: "MinLevel",
      headerName: "Minimum Inventory Level",
      width: 100,
      sortable: false,
      editable: false,
      align: "center",
      headerAlign: "center",
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
                  setSelectedRowId(params.id);
                  OpenDailog2();
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
                  setSelectedRowId(params.id);
                  OpenDailog2();
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
      field: "UoMCode",
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
        let openUomCode = !!params.row.UoMCode;
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
                if (!openUomCode && params.row.readonlyRow !== "readonlyRow") {
                  setSelectedRowId(params.row.id);
                  OpenDailog3();
                  if (!isDisabled) fetchGetUOMListData3(params.row.UomEntry2);
                }
              }
            }}
          >
            {/* ---- UOM Text ---- */}
            <Grid item xs zeroMinWidth>
              <Tooltip title={params.row.UoMCode || ""}>
                <Typography
                  noWrap
                  textAlign="center"
                  sx={{ fontSize: 13, cursor: "default" }}
                >
                  {params.row.UoMCode || ""}
                </Typography>
              </Tooltip>
            </Grid>

            {/* ---- Icon ---- */}
            <Grid item>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedRowId(params.row.id);
                  OpenDailog3();
                  fetchGetUOMListData3(params.row.UomEntry2);
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
      field: "NumPerMsr",
      headerName: "Items per Unit",
      width: 100,
      sortable: false,
      editable: false,
      align: "center", // centers cell text
      headerAlign: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },

    {
      field: "InvQty",
      headerName: "QTY-Inventory UoM",
      width: 120,
      editable: false,
      sortable: false,
      align: "center", // centers cell text
      headerAlign: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
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
          UoMCode,
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
          if (!UoMCode || !WHSCode) {
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
                  if (
                    InvQty !== savedQty &&
                    params.row.readonlyRow !== "readonlyRow"
                  ) {
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
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const clearFormData = () => {
    reset(initial);
    setSelectedData([]);
    setSaveUpdateName("SAVE");
    clearFiles();
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
    setValue("GroupNum", PriceListData[0]?.DocEntry ?? "");
    setValue("CurrencyLine", PriceListData[0]?.PrimCurr ?? "");
  };

  const setGoodsReceiptData = async (DocEntry) => {
    setok("");
    const currentOLines = getValues("oLines") || [];
    const hasUnsavedRows =
      SaveUpdateName !== "UPDATE" && currentOLines.length > 0;
    if (isDirty || ok === "UPDATE" || hasUnsavedRows) {
      Swal.fire({
        text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((Data) => {
        if (Data.isConfirmed) {
          fetchGoodsReceiptAndSetState(DocEntry);
        } else {
          Swal.fire({
            text: "Not Select Record",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    } else {
      fetchGoodsReceiptAndSetState(DocEntry);
    }
  };
  const fetchGoodsReceiptAndSetState = (DocEntry) => {
    apiClient.get(`/GoodsReceipt/${DocEntry}`).then((response) => {
      const data = response.data.values;
      setFilesFromApi(data.AttcEntry);
      const updatedOLines = (data.oLines || []).map((line) => {
        const match = warehouseData.find(
          (loc) => loc.Location === line.LocCode,
        );
        return {
          ...line,
          LocationName: match?.LocationName || "", // <- Get from matched object safely
          LocCode: match?.Location || "",
          readonlyRow: "readonlyRow",
        };
      });
      const updatedData = {
        ...data,
        oLines: updatedOLines,
      };
      reset(updatedData);
      toggleDrawer();
      setSaveUpdateName("UPDATE");
      setSelectedData(DocEntry);
      setSidebarOpen(false);
    });
  };
  const validateAllLines = (lines) => {
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

      if (!line.UoMCode) {
        errors.push(`Line ${lineNo}: ${line.ItemCode} (UOM not selected)`);
        errorIds.push(rowId);
      }

      if (Number(line.Quantity) <= 0) {
        errors.push(
          `Line ${lineNo}: ${line.ItemCode} (Quantity must be greater than zero)`,
        );
        errorIds.push(rowId);
      }

      // 🔴 Price
      if (Number(line.PriceBefDi) <= 0) {
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
      // 🔴 BATCH
      if (line.ManBtchNum === "Y" && line.ManSerNum === "N") {
        const batchLines = line.oBatchLines || [];
        const totalBatchQty = batchLines.reduce(
          (sum, b) => sum + Number(b.BatchQty || 0),
          0,
        );

        if (totalBatchQty !== Number(line.InvQty || 0)) {
          errors.push(`Line ${lineNo}: ${line.ItemCode} (Batch Qty mismatch)`);
          errorIds.push(rowId);
        }
      }

      // 🔴 SERIAL
      if (line.ManBtchNum === "N" && line.ManSerNum === "Y") {
        const serialLines = line.oSerialLines || [];
        if (serialLines.length !== Number(line.InvQty || 0)) {
          errors.push(`Line ${lineNo}: ${line.ItemCode} (Serial Qty mismatch)`);
          errorIds.push(rowId);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      errorIds: [...new Set(errorIds)],
    };
  };

  //==========================================post and put api============================================
  //Submit Function With Validations
  const handleOnSubmit = async (data) => {
    if (data.oLines.length === 0) {
      Swal.fire({
        text: "Please Select The Item",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    if (SaveUpdateName === "SAVE") {
      const { isValid, errors, errorIds } = validateAllLines(data.oLines);

      if (!isValid) {
        Swal.fire({
          icon: "warning",
          title: "Document Validation Error",
          html: errors.join("<br/>"),
          confirmButtonText: "OK",
        });
        return false;
      }
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
    const PostObj = {
      UserId: user.UserId,
      CreatedBy: user.UserName,
      Status: "1",
      DocNum: data.DocNum || "0",
      DocEntry: String(data.DocEntry || ""),
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      GroupNum: data.GroupNum,
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
      Ref2: String(data.Ref2 || ""),
      ModifiedBy: user.UserName,
      Comments: data.Comments,
      JrnlMemo: data.JrnlMemo,
      AttcEntry: attachmentDocEntry,
      WeightUnit: data.WeightUnit || "0",
      InvntSttus: data.InvntSttus || "0",
      DocCur: data.DocCur || "0",
      DocRate: data.DocRate || "0",
      DocTotal: String(data.DocTotal || ""),
      DocTotalFC: data.DocTotalFC || "0",
      SysRate: String(SysRateApi || "0"),
      CurSource: data.CurSource || "L",
      DocTotalSy: String(data.DocTotal / SysRateApi || "0"),
      Volume: data.Volume || "0",
      VolUnit: data.VolUnit || "0",
      Weight: data.Weight || "0",
      Series: String(data.Series || "0"),
      BaseRef: data.BaseRef || "-1",
      ObjType: data.ObjType || "-1",
      LocCode: data.LocCode || "-1",
      BaseType: data.BaseType || "-1",
      goodsisModel: data.goodsisModel || "0",
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oLines: data.oLines.map((item) => {
        return {
          UserId: item.UserId || "0",
          CreatedBy: item.CreatedBy || "0",
          Status: item.Status,
          ItemCode: String(item.ItemCode),
          ItemName: String(item.ItemName),
          Quantity: String(item.Quantity),
          WHSCode: String(item.WHSCode),
          LineTotal: String(item.LineTotal),
          TotalSumSy: String(item.TotalSumSy),
          AcctCode: String(item.AcctCode),
          Price: String(item.PriceBefDi),
          Rate: String(DocRateLine) || "1",
          Currency: data.DocCur,
          StockSum: String(item.StockSum || "0"),
          StockSumSc: String(item.StockSumSc || "0"),
          StockSumFc: "0",
          TranType: String(item.TranType || "0"),
          Type: String(item.Type || "0"),
          PriceBefDi: String(item.PriceBefDi),
          UoMCode: item.UoMCode,
          unitMsr: String(item.unitMsr || item.UoMCode),
          OnHand: String(item.OnHand),
          IsCommited: String(item.IsCommited),
          OnOrder: String(item.OnOrder),
          CodeBars: item.CodeBars || "0",
          DiscPrcnt: item.DiscPrcnt || "0",
          UomEntry2: item.UomEntry2,
          UomEntry: item.UomEntry || "0",
          MinLevel: String(item.MinLevel),
          TotalSum: "0",
          OpenQuantity: item.OpenQuantity || "0",
          StockPrice: String(item.StockPrice || "0"),
          NumPerMsr: String(item.NumPerMsr),
          UgpCode: item.UomEntry2 || "0",
          BaseType: item.BaseType || "-1",
          BaseEntry: item.BaseEntry || "-1",
          UoMCode2: item.UoMCode2 || "",
          InvQty: String(item.InvQty) || "0",
          BaseRef: item.BaseRef || "0",
          BaseLine: item.BaseLine || "-1",
          WeightUnit: "0",
          unitMsr2: "1",
          LocCode: item.LocCode,
          oDocBinLocationLines: item.oDocBinLocationLines || [],
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
            BaseType: "59",
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
            BaseType: "59",
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
        };
      }),
    };

    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/GoodsReceipt`, PostObj)
        .then((res) => {
          if (res.data.success) {
            clearFormData();
            setopenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            setClearCache(true);
            Swal.fire({
              title: "Success!",
              text: "Saved Successfully",
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
              // icon: "error",
              confirmButtonText: "Ok",
              // timer: 1000,
            });
          }
        })
        .catch((error) => {
          if (attachmentDocEntry > 0) {
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
        text: `Do You Want Update "${data.DocNum}"`,
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
            .put(`/GoodsReceipt/${data.DocEntry}`, PostObj)
            .then((response) => {
              if (response.data.success) {
                clearFormData();
                setopenListPage(0);
                setOpenListData([]);
                fetchOpenListData(0);
                setClearCache(true);
                Swal.fire({
                  title: "Success!",
                  text: "Goods Receipt Updated",
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
            text: "Goods Receipt Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const handleClickOpen = () => setOpen(true);
  const closeModel = () => {
    setOpen(false);
    setSearchText("");
    setCurrentPage(0);
    setSelectedRows([]);
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
            InventoryItem: "Y",
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
  useEffect(() => {
    fetchItems(currentPage, searchText);
  }, [currentPage, searchText, fetchItems]);
  // const testt = async () => {
  //   const formValues = getValues();
  //   const allOlines = formValues.oLines || [];
  //   const newRowsCount = selectedRows.length;
  //   const existingRowsCount = allOlines.length - newRowsCount;
  //   const updatedLines = allOlines.map((data, index) => {
  //     if (index < existingRowsCount) {
  //       // Return existing rows unchanged
  //       return data;
  //     }
  //     const selectedItemIndex = index - existingRowsCount;
  //     const selectedRow = selectedRows[selectedItemIndex];
  //     const selectedLine = selectedRow?.oLines.find(
  //       (line) => line.PriceList === formValues.GroupNum
  //     );
  //     const matchedWarehouse = warehouseData.find(
  //       (wh) => wh.WHSCode === data.WHSCode
  //     );
  //     return {
  //       ...data,
  //       LineTotal: selectedLine?.Price * data.Quantity || 0,
  //       PriceBefDi: selectedLine?.Price || 0,
  //       LocCode: matchedWarehouse?.LocationName || "", // ✅ set LocationName
  //     };
  //   });
  //   reset({ ...formValues, oLines: updatedLines });
  // };

  const { SysRateApi, ExchangeRateModal } = useSysRateCurrency(docDate);
  // const refreshSysRate = useCallback(() => {
  //   if (SysRateApi > 0 && SysRateApi !== undefined && SysRateApi !== null) {
  //     setValue("SysRate", SysRateApi);
  //   }
  // }, [SysRateApi]);

  // // Run whenever dependencies change
  // useEffect(() => {
  //   refreshSysRate();
  // }, []);

  const handleCellClick = async (ids) => {
    const selectedIDs = new Set(ids);
    const selectedRows = itemList
      .filter((row) => selectedIDs.has(row.DocEntry))
      .map((data) => {
        const PriceTerm = data.oLines?.find(
          (itempprice) => itempprice.PriceList === GroupNum,
        );
        const PriceBefDi = parseFloat(PriceTerm?.Price ?? "0");
        const Currency = PriceTerm?.Currency ?? "0";
        setValue("CurrencyLine", Currency);
        // const sysRate = parseFloat(SysRate) || 0;
        return {
          ItemCode: data.ItemCode,
          ItemName: data.ItemName,
          Quantity: 1,
          PriceBefDi,
          Price: PriceBefDi,
          DiscPrcnt: data.DiscPrcnt || 0,
          Currency,
          Bin: 1,
          LineTotal: PriceBefDi,
          TotalSumSy: SysRateApi > 0 ? PriceBefDi / SysRateApi : 0,
          TotalFrgn: "0",
          CodeBars: data.CodeBars,
          WHSCode: data.DefaultWhs,
          OnHand: data.OnHand,
          IsCommited: data.IsCommited,
          OnOrder: data.OnOrder,
          MinLevel: data.MinLevel,
          AcctCode: data.IncreasAc,
          StockPrice: parseFloat(data.StockPrice ?? "0"),
          UoMCode:
            data.UgpEntry === "-1"
              ? "Manual"
              : data.UOMCode === "0"
                ? ""
                : data.UOMCode,
          UoMCode2: data.UOMCode,
          UnitMsr: data.UOMCode,
          UomEntry2: data.UgpEntry,
          IUoMEntry: data.IUoMEntry,
          UomEntry: data.IUoMEntry,
          UomName: data.UomName,
          ManBtchNum: data.ManBtchNum,
          ManSerNum: data.ManSerNum,
          InvQty: "1",
          NumPerMsr: "1",
          INUoMEntry: data.INUoMEntry,
        };
      });

    // Step 2: Enrich with location-wise data
    const locationWise = selectedRows.map((item) => {
      const matchingLoc = warehouseData.find(
        (row) => row.WHSCode === item.WHSCode,
      );
      return {
        ...item,
        LocCode: matchingLoc?.Location ?? "",
        LocationName: matchingLoc?.LocationName ?? "",
        BinCode: matchingLoc?.BinCode ?? "",
        DftBinAbs: matchingLoc?.DftBinAbs,
        BinActivat: matchingLoc?.BinActivat,
      };
    });

    // Step 3: Prevent duplicates when merging
    setSelectedRows((prev) => {
      const existingItemCodes = new Set(prev.map((p) => p.ItemCode));
      const newUniqueRows = locationWise.filter(
        (row) => !existingItemCodes.has(row.ItemCode),
      );
      return [...prev, ...newUniqueRows];
    });
  };
  // const onSubmit = async () => {
  //   try {
  //     const currentData = getValues();
  //     const updatedLines = [
  //       ...(currentData.oLines || []),
  //       ...(selectedRows || []),
  //     ];
  //     const Currency = updatedLines?.[0]?.Currency;
  //     if (!Currency) {
  //       console.warn("No Currency found in line items.");
  //       return;
  //     }
  //     handleFetchRate();
  //     console.log(DocRateLine);
  //     if (!DocRateLine) {
  //       console.warn("Invalid DocRateLine or DocRate.");
  //       return;
  //     }
  //     const updateedOline = recalculateLines({
  //       oLines: updatedLines,
  //       DocRateLine: DocRateLine ?? 0,
  //       SysRate: SysRateApi,
  //       setValue,
  //     });
  //     console.log("updateedOline", updateedOline);
  //     console.log("oLines", updateedOline);
  //     dispatch({ type: "CLOSE", modal: "DocRateOpen" });
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   closeModel();
  // };
  const onSubmit = async () => {
    // refreshSysRate();
    try {
      const currentData = getValues();
      const updatedLines = [
        ...(currentData.oLines || []),
        ...(selectedRows || []),
      ];
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

      console.log(DocRateLine);
      // if (!DocRateLine) {
      //   console.warn("Invalid DocRateLine or DocRate.");
      //   return;
      // }
      const updateedOline = recalculateLines({
        oLines: updatedLines,
        // DocRateLine: DocRateLine ?? 0,
        DocRateLine:
          Currency === companyData.MainCurncy ? "1" : (DocRateLine ?? 0),

        SysRate: getValues("SysRate") || 1,
        setValue,
      });
      console.log("updateedOline", updateedOline);
      console.log("oLines", updateedOline);
      dispatch({ type: "CLOSE", modal: "DocRateOpen" });
    } catch (error) {
      console.log(error);
    }
    setSelectedRows([]);

    closeModel();
  };

  const handleOnSerial = (rowData) => {
    console.log(rowData);
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
      oSerialLines: rowData.oSerialLines,
      id: rowData.id,
    });
    setopenserial(true);
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
      oBatchLines: rowData.oBatchLines,
    });
    setopenBatch(true);
  };

  const onsubmitSeriel = (data) => {
    const UpdatedoSerialLines = getValues("oLines").map((item, index) => {
      if (data.Ids === index) {
        return {
          ...item,
          oSerialLines: data?.serials ?? [],
        };
      }
      return item;
    });
    setValue("oLines", UpdatedoSerialLines);
    console.log("UpdatedoSerialLines", UpdatedoSerialLines);
  };

  const onsubmitBatch = (data) => {
    const UpdatedoBatchLines = getValues("oLines").map((item, index) => {
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
  const handleBinlocationSubmit = (rowsFromModal) => {
    const selectedRow = BinlocListData;
    const updatedOLines = (getValues("oLines") || []).map((row, index) =>
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
  const handleChangePrice = async (e) => {
    const PriceValue = e.target.value;
    const oLines = getValues("oLines") || [];
    if (oLines.length === 0) return;
    const itemCodes = oLines.map((item) => item.ItemCode);
    let priceData = [];
    priceData = await fetchPriceListData(apiClient, itemCodes, PriceValue);
    const companyData = getValues("companyData") || {};
    setValue("CurrencyLine", priceData.Currency ?? companyData.MainCurncy);
    const updatedLines = await Promise.all(
      oLines.map(async (item) => {
        const apiPrice = priceData.find((p) => p.ItemCode === item.ItemCode);
        const newPrice = apiPrice?.Price ?? item.PriceBefDi;
        const currency = apiPrice?.Currency ?? item.Currency;
        const Rate = await fetchExchangeRateGeneric({
          apiClient,
          Currency: currency,
          DocDate: getValues("DocDate"),
          companyData: companyData,
          setValue,
          dispatch,
        });
        const LineTotal = (item.Quantity || 0) * newPrice * Rate;
        const TotalSumSy = ValueFormatter(LineTotal / SysRateApi);
        return {
          ...item,
          PriceBefDi: newPrice,
          Currency: currency,
          LineTotal,
          TotalSumSy,
          StockPrice: item.PriceBefDi,
          Rate: Rate,
          StockSum: LineTotal,
          StockSumSc: TotalSumSy,
        };
      }),
    );
    setValue("oLines", updatedLines);
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
          Goods Receipt List
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
                onChange={(e) => handleCloseListSearch(e.target.value)}
                value={openListquery}
                onClickClear={handleCloseListClear}
              />
            </Grid>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={openListData.length}
              next={fetchMoreCloseListData}
              hasMore={hasMoreOpen}
              loader={
                <BeatLoader
                  color={theme.palette.mode === "light" ? "black" : "white"}
                />
              }
              scrollableTarget="ListScroll"
              endMessage={<Typography>No More Records</Typography>}
            >
              {openListData.map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.DocNum}
                  subtitle={dayjs(item.DocDate).format("DD-MM-YYYY")}
                  isSelected={selectedData === item.DocEntry}
                  // description={item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => {
                    setGoodsReceiptData(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Grid>
      </Grid>
    </>
  );
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const OpenDailog3 = () => setSearchmodelOpen3(true);
  const SearchModelClose3 = () => setSearchmodelOpen3(false);
  const onSelectRequest3 = async (
    UoMCode,
    UomEntry,
    UomName,
    AltQty,
    BaseQty,
  ) => {
    const updatedLines = allFormData.oLines.map((line, index) => {
      if (index === selectedRowId) {
        const numPerMsr = BaseQty / AltQty; // Calculate NumPerMsr
        const basePrice =
          line.BasePrice !== undefined ? line.BasePrice : line.PriceBefDi;
        const newPriceBefDi = numPerMsr * basePrice;
        const lineTotal = (line.Quantity ?? 1) * newPriceBefDi;
        return {
          ...line,
          UomEntry,
          UoMCode: UoMCode,
          UnitMsr: UomName,
          AltQty,
          BaseQty,
          NumPerMsr: numPerMsr,
          InvQty: numPerMsr * line.Quantity, // Update Inventory Quantity
          OpenInvQty: numPerMsr * line.Quantity, // Update Open Inventory Quantity
          PriceBefDi: newPriceBefDi, // Update PriceBefDi
          BasePrice: basePrice, // Lock the base price
          LineTotal: lineTotal, // Update LineTotal based on Quantity and PriceBefDi
        };
      }

      return line;
    });
    // Reset the form with the updated lines and data
    reset({
      ...allFormData,
      oLines: updatedLines,
    });

    SearchModelClose3();
  };
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const OpenDailog1 = () => setsearchmodelOpenWarehouse(true);
  const SearchModelCloseWarehouse = () => setsearchmodelOpenWarehouse(false);
  const SelectWarehouse = async (
    WHSCode,
    LocCode,
    LocationName,
    IncreasAc,
    BinCode,
    DftBinAbs,
    BinActivat,
  ) => {
    const updatedLines = getValues("oLines").map((data, index) => {
      if (selectedRowId !== index) return data;
      return {
        ...data,
        WHSCode: WHSCode,
        LocCode: LocCode, // ✅ Add this line
        LocationName,
        AcctCode: IncreasAc,
        BinCode: BinCode,
        DftBinAbs: DftBinAbs,
        BinActivat,
      };
    });
    reset({ ...getValues(), oLines: updatedLines });
    SearchModelCloseWarehouse();
  };
  const handleGetListClearWarehouse = () => {
    setGetListQueryWarehouse("");
    setGetListSearching1(false);
    setgetListPageWarehouse(0);
    setgetListDataWarehouse([]);
    fetchgetListDataWarehouse(0);
  };
  const handleGetListSearch1 = (res) => {
    setGetListQueryWarehouse(res);
    setGetListSearching1(true);
    setgetListPageWarehouse(0);
    setgetListDataWarehouse([]);
    // fetchgetListDataWarehouse(0, res);

    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataWarehouse(0, res, httpRequestToken);
    }, TimeDelay);
  };

  const fetchMoregetListDataWarehouse = () => {
    fetchgetListDataWarehouse(
      getListPageWarehouse + 1,
      getListSearchingWarehouse ? getListqueryWarehouse : "",
    );
  };
  const fetchgetListDataWarehouse = async (pageNum, searchTerm = "") => {
    // Cancel Token

    try {
      const url = searchTerm
        ? `/WarehouseV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/WarehouseV2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        sethasMoreGetListWarehouse(newData.length === 20);
        setgetListDataWarehouse((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageWarehouse(pageNum);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const OpenDailog2 = () => setsearchmodelOpenAccount(true);
  const SearchModelCloseAccount = () => setsearchmodelOpenAccount(false);

  const onSelectRequestAccount = async (DocEntry) => {
    var selectobj = getListDataAccount.find(
      (item) => DocEntry === item.DocEntry,
    );
    var updatedLines = getValues("oLines").map((data, index) => {
      if (selectedRowId !== index) return data;
      return { ...data, AcctCode: selectobj.AcctCode };
    });
    reset({ ...getValues(), oLines: updatedLines });
    SearchModelCloseAccount();
  };
  const handleGetListClearAccount = () => {
    setgetListqueryAccount("");
    setgetListSearchingAccount(false);
    setgetListPageAccount(0);
    setgetListDataAccount([]);
    fetchgetListDataAccount(0);
  };
  // const handleGetListClear3 = () => {
  //   setgetListquery3("");
  //   setgetListSearching3(false);
  //   setgetListPage3(0);
  //   setgetListData3([]);
  //   fetchGetListData3(0); // fetch first page without search
  // };
  // const handleGetListSearch3 = (res) => {
  //   setgetListquery3(res);
  //   setgetListSearching3(true);
  //   setgetListPage3(0);
  //   setgetListData3([]);

  //   if (timeoutRef3.current) {
  //     clearTimeout(timeoutRef3.current);
  //   }

  //   timeoutRef3.current = setTimeout(() => {
  //     fetchGetListData3(0, res);
  //   }, TimeDelay); // assuming you already have TimeDelay constant
  // };
  // const fetchMoreGetListData3 = () => {
  //   fetchGetListData3(getListPage3 + 1, getListSearching3 ? getListquery3 : "");
  // };
  // const fetchGetListData3 = async (pageNum, searchTerm = "") => {
  //   try {
  //     const url = searchTerm
  //       ? `/UGP/Search/${searchTerm}/1/${pageNum}/20`
  //       : `/UGP/Pages/1/${pageNum}/20`;
  //     const response = await apiClient.get(url);
  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       sethasMoreGetList3(newData.length === 20);
  //       setgetListData3((prev) =>
  //         pageNum === 0 ? newData : [...prev, ...newData]
  //       );
  //       setgetListPage3(pageNum);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
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
  const fetchgetListDataAccount = async (pageNum, searchTerm = "") => {
    try {
      let response = await apiClient.get(
        `ChartOfAccounts?Status=1&Page=${pageNum}&Limit=20&SearchText=${searchTerm}&LocManTran=N&Postable=Y`,
      );
      if (response.data.success) {
        const newData = response.data.values;
        if (newData.length > 0) {
          setValue("AcctCode", newData[0]?.AcctCode || "");
        }
        sethasMoreGetListAccount(newData.length === 20);
        setgetListDataAccount((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageAccount(pageNum);
      }
    } catch (error) {
      // Cancel Token
      console.log(error);
    }
  };
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const fetchGetUOMListData3 = async (DocEntry) => {
    try {
      const res = await apiClient.get(`/UGP/${DocEntry}`);
      if (res.data.success) {
        SetUoMCode(res.data.values.oLines);
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

  return (
    <>
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      {/* <SearchModel
        open={searchmodelOpen3}
        onClose={SearchModelClose3}
        onCancel={SearchModelClose3}
        title="UOM CODE"
        onClickClear={handleGetListClear3}
        onChange={(e) => handleGetListSearch3(e.target.value)}
        value={getListquery3}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListData3.length}
              next={fetchMoreGetListData3}
              hasMore={hasMoreGetList3}
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
              {UoMCodeList.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.UoMCode}
                  subtitle={item.WHSCode}
                  description={item.UomName}
                  searchResult={getListquery3}
                  onClick={() => {
                    onSelectRequest3(
                      item.UoMCode,
                      item.UomEntry,
                      item.UomName,
                      item.AltQty,
                      item.BaseQty
                    );
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      /> */}

      <ExchangeRate
        open={state.DocRateOpen}
        closeModel={() => dispatch({ type: "CLOSE", modal: "DocRateOpen" })}
        onSubmit={onSubmitCurrency}
        data={{
          DocEntryCur: getValues("DocEntryCur"),
          DocDate: getValues("DocDate"),
          Currency: getValues("CurrencyLine"),
          DocRate: getValues("DocRateLine"),
        }}
        isLoading={isLoading}
        title="Exchange Rate"
      />
      {ExchangeRateModal}

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
      <SerialIntake
        Title="SERIAL NUMBER"
        openserialmodal={openserial}
        DialogClosePayto={handleCloseSerial}
        onSubmit={(serialData) => onsubmitSeriel(serialData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={ValueFormatter(selectedItem?.InvQty, 0)}
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
        oSerialLines={selectedItem?.oSerialLines ?? []}
      />
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
        oBatchLines={selectedItem?.oBatchLines ?? []}
        Ids={selectedItem?.id}
      />
      <Dialog
        open={searchmodelOpen3}
        onClose={() => SearchModelClose3(false)}
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
            <IconButton onClick={() => OpenDailog3(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {UoMCodeList.map((item, i) => (
            <CardComponent
              key={i}
              title={item.UomCode}
              subtitle={item.UomName}
              // searchResult={closedListquery}
              isSelected={
                getValues(`oLines.${getValues("selectedRowIndex")}.UomCode`) ===
                item.UomCode
              }
              onClick={() => {
                onSelectRequest3(
                  item.UomCode,
                  item.UomEntry,
                  item.UomName,
                  item.AltQty,
                  item.BaseQty,
                );
              }}
            />
          ))}
        </DialogContent>
      </Dialog>
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      <SearchModel
        open={searchmodelOpenAccount}
        onClose={SearchModelCloseAccount}
        onCancel={SearchModelCloseAccount}
        title="ACCOUNT CODE"
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
                  title={item.AcctCode}
                  subtitle={item.AcctName}
                  // description={item.AcctName}
                  searchResult={getListqueryAccount}
                  onClick={() => onSelectRequestAccount(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      <SearchModel
        open={searchmodelOpenWarehouse}
        onClose={SearchModelCloseWarehouse}
        onCancel={SearchModelCloseWarehouse}
        title="WHS CODE"
        onChange={(e) => handleGetListSearch1(e.target.value)}
        value={getListqueryWarehouse}
        onClickClear={handleGetListClearWarehouse}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataWarehouse.length}
              next={fetchMoregetListDataWarehouse}
              hasMore={hasMoreGetListWarehouse}
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
              {getListDataWarehouse.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.ListName}
                  subtitle={item.WHSCode}
                  description={item.WHSName}
                  searchResult={getListqueryWarehouse}
                  onClick={() =>
                    SelectWarehouse(
                      item.WHSCode,
                      item.Location,
                      item.LocationName,
                      item.IncreasAc,
                      item.BinCode,
                      item.DftBinAbs,
                      item.BinActivat,
                    )
                  }
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      <DataGridModal
        open={open}
        closeModel={closeModel}
        onSubmit={onSubmit}
        isLoading={itemList.length === 0 ? true : isLoading}
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
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(handleOnSubmit)}
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
          position="relative"
        >
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
            width="100%"
            py={0.5}
            alignItems="center"
            border="1px solid silver"
            borderBottom="none"
          >
            <Typography textAlign="center" alignContent="center" height="100%">
              Goods Receipt
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
              overflow="scroll"
              sx={{ overflowX: "hidden" }}
              position="relative"
              textTransform={"uppercase"}
            >
              <Box
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container textTransform={"uppercase"}>
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
                              clearErrors("DocNum");
                              setValue(
                                "FinncPriod",
                                seriesData?.FinncPriod ?? "",
                              );
                              setValue(
                                "PIndicator",
                                seriesData?.Indicator ?? "",
                              );
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
                      name="GroupNum"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          disabled={SaveUpdateName === "UPDATE"}
                          label="PRICE LIST"
                          data={(PriceListData || []).map((item) => ({
                            key: item.DocEntry,
                            value: item.ListName,
                          }))}
                          onChange={(e) => {
                            field.onChange(e); // Update the form field value
                            handleChangePrice(e); // Call your custom handler
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
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
                            setValue("DocDate", date, { shouldDirty: true });
                            handleFetchRate();
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="TaxDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputDatePickerField
                          label="DOCUMENT DATE "
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValue("TaxDate", newValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="Ref2"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          label="REF NO"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
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
                    mt={1}
                  >
                    <Button
                      disabled={SaveUpdateName === "UPDATE"}
                      variant="contained"
                      color="info"
                      sx={{ color: "white" }}
                      onClick={() => {
                        handleClickOpen();
                      }}
                    >
                      Search Item
                      {/* Search Item */}
                    </Button>
                  </Grid>
                </Grid>
                <Grid container width={"100%"}>
                  <Grid
                    container
                    item
                    width="100%"
                    m={1}
                    border="1px solid grey"
                  >
                    <Tabs
                      sx={{ width: "100%" }}
                      value={tabvalue}
                      onChange={handleTabChange}
                      aria-label="tabs example"
                    >
                      <Tab value={0} label="Contents" />
                      <Tab value={2} label="Attachments" />
                    </Tabs>
                    <Divider />
                    {tabvalue === 0 && (
                      <>
                        <Grid item xs={12}>
                          <Grid
                            container
                            item
                            sx={{
                              height: "100%",
                              minHeight: "300px",
                              maxHeight: "500px",
                              width: "100%",
                              overflow: "auto",
                            }}
                          >
                            <DataGrid
                              apiRef={apiRef}
                              className="datagrid-style"
                              rows={getValues("oLines").map((data, index) => ({
                                ...data,
                                id: index,
                              }))}
                              getRowId={(row) => row.id}
                              columns={columns}
                              editMode="cell"
                              experimentalFeatures={{ newEditingApi: true }}
                              isRowSelectable={(params) =>
                                params.row.Status !== "0"
                              }
                              columnHeaderHeight={35}
                              rowHeight={40}
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
                              processRowUpdate={processRowUpdate}
                              onProcessRowUpdateError={(err) =>
                                console.error(err)
                              }
                              onCellKeyDown={handleCellKeyDown}
                              sx={gridSx}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}
                    {tabvalue === 1 && (
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
                      item
                      md={6}
                      lg={3}
                      xs={12}
                      textAlign={"center"}
                      textTransform={"uppercase"}
                    >
                      <Controller
                        name="DocTotal"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            {...field}
                            size="small"
                            label="total"
                            placeholder="TOTAL"
                            // value={totline}
                            readOnly
                            rows={2}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                      textTransform={"uppercase"}
                    >
                      <Controller
                        name="Comments"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            size="small"
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            label="REMARK"
                            placeholder="REMARK"
                            rows={2}
                            multiline
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                      textTransform={"uppercase"}
                    >
                      <Controller
                        name="JrnlMemo"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            size="small"
                            label="JOURNAL REMARK"
                            placeholder="JOURNAL REMARK"
                            rows={2}
                            multiline
                            error={!!error}
                            helperText={error ? error.message : null}
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
              }}
            >
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
              <PrintMenu
                disabled={SaveUpdateName === "SAVE"}
                type={"I"}
                DocEntry={allFormData.DocEntry}
                PrintData={PrintData}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
