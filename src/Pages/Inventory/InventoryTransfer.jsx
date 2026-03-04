import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";

import {
  Autocomplete,
  Box,
  Button,
  Chip,
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
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
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import CardComponentNew from "../Components/CardComponentNew";
import DataGridModal from "../Components/DataGridModal";
import { fetchExchangeRateGeneric } from "../Components/fetchExchangeRateGeneric";
import { fetchPriceListData } from "../Components/fetchPriceListData";
import {
  InputDatePickerField,
  InputFields,
  InputSelectFields,
  InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
  InputTextSearchButtonTable,
  SelectedDatePickerField,
} from "../Components/formComponents";
import FromAllBin from "../Components/FromAllBin";
import { recalcHeaderTotals } from "../Components/recalcHeaderTotals";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import { TimeDelay } from "../Components/TimeDelay";
import ToBinLocation from "../Components/ToBinLocation";
import usePermissions from "../Components/usePermissions";
import { TwoFormatter, ValueFormatter } from "../Components/ValueFormatter";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import PrintMenu from "../Components/PrintMenu";
import SerialOuttake from "../Components/OpenSerialGetCase";
import BatchOuttake from "../Components/BatchOuttake";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { useGridApiRef } from "@mui/x-data-grid";
import CalCulation from "../Components/CalCulation";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchExchangeRateStore } from "../../slices/exchangeRateSlice";
import ExchangeLineRateCopyform from "../Components/ExchangeLineRateCopyform";
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
  exchaneRateLineCpyform: false,
  BinLocationOpen: false,
  AllBinLocationOpen: false,
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
export default function InventoryTransfer() {
  const { user, warehouseData, companyData } = useAuth();
  const perms = usePermissions(88);
  const [tabvalue, settabvalue] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [salesemp, setSalesEmp] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [PriceListData, setPriceListData] = useState([]);

  //=====================================From Warehouse====================================================================
  const [getListqueryFromWHS, setGetListQueryFromWHS] = useState("");
  const [getListSearchingFromWHS, setGetListSearchingFromWHS] = useState(false);
  const [getListDataWarehouse, setgetListDataFromWHS] = useState([]);
  const [getListPageFromWHS, setgetListPageFromWHS] = useState(0);
  const [hasMoreGetListWarehouse, sethasMoreGetListFromWHS] = useState(true);
  const [searchmodelOpenWarehouse, setsearchmodelOpenFromWHS] = useState(false);

  //=====================================Warehouse====================================================================
  //=====================================TO Warehouse====================================================================
  const [getListqueryTo, setGetListQueryTo] = useState("");
  const [getListSearchingTo, setGetListSearchingTo] = useState(false);
  const [getListDataTo, setgetListDataTo] = useState([]);
  const [getListPageTo, setgetListPageTo] = useState(0);
  const [hasMoreGetListTo, sethasMoreGetListTo] = useState(true);
  const [searchmodelOpenTo, setsearchmodelOpenTo] = useState(false);
  const [clearCache, setClearCache] = useState(false);

  //=====================================From Warehouse====================================================================
  const [getListqueryFromLine, setGetListQueryFromLine] = useState("");
  const [getListSearchingFromLine, setGetListSearchingFromLine] =
    useState(false);
  const [getListDataFromLine, setgetListDataFromLine] = useState([]);
  const [getListPageFromLine, setgetListPageFromLine] = useState(0);
  const [hasMoreGetListFromLine, sethasMoreGetListFromLine] = useState(true);
  const [searchmodelFromLine, setSearchmodelFromLine] = useState(false);
  //=====================================Warehouse====================================================================
  const [BinlocListData, setBinLocData] = useState([]);
  //=====================================From Warehouse====================================================================
  const [getListqueryToLine, setGetListQueryToLine] = useState("");
  const [getListSearchingToLine, setGetListSearchingToLine] = useState(false);
  const [getListDataToLine, setgetListDataToLine] = useState([]);
  const [getListPageToLine, setgetListPageToLine] = useState(0);
  const [hasMoreGetListToLine, sethasMoreGetListToLine] = useState(true);
  const [searchmodelToLine, setSearchmodelToLine] = useState(false);
  //=====================================get List State====================================================================
  const [openListData, setopenListData] = useState([]);
  const [openListPage, setopenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListQuery, setopenListQuery] = useState("");
  const [openListSearching, setopenListSearching] = useState(false);
  const timeoutRef = useRef(null);
  const [selectedData, setSelectedData] = useState([]);

  //=========================================get List State End================================================================
  const [httpRequestToken, setCancelToken] = useState();
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  // Pricelist
  const dispatchRedux = useDispatch();
  const { data, loading } = useSelector((state) => state.exchange);
  const navigate = useNavigate();
  const [AllDataCopyRateLine, setAllDataCopyRateLine] = useState([]);
  const [selectedRowId, setSelectedRowId] = React.useState(null);
  const [getListqueryBP, setGetListQueryBP] = useState("");
  const [getListSearchingBP, setGetListSearchingBP] = useState(false);
  const [getListDataBP, setGetListDataBP] = useState([]);
  const [getbp, setbp] = useState([]);
  let [ok, setok] = useState("OK");
  const [getListPageBP, setGetListPageBP] = useState(0);
  const [hasMoreGetListBP, setHasMoreGetListBP] = useState(true);
  const [searchmodelOpenPriceList1, setSearchmodelOpenBP] = useState(false);
  const [open, setOpen] = useState(false);
  const LIMIT = 20;
  const [rowCount, setRowCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [itemCache, setItemCache] = useState({});
  const [searchmodelOpen3, setSearchmodelOpen3] = useState(false);
  const [UomCodeList, SetUomCode] = useState([]);
  const selectedRowsRef = useRef([]);
  const [getListData3, setgetListData3] = useState([]);
  const [getListPage3, setgetListPage3] = useState(0);
  const [hasMoreGetList3, sethasMoreGetList3] = useState(true);
  const [getListquery3, setgetListquery3] = useState("");
  const [getListSearching3, setgetListSearching3] = useState(false);
  const [PrintData, setPrintData] = useState([]);
  let [openserial, setopenserial] = useState(false);
  let [openBatch, setopenBatch] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const handleCloseSerial = () => setopenserial(false);
  const handleCloseBatch = () => setopenBatch(false);
  const apiRef = useGridApiRef();

  const timeoutRef3 = useRef(null);
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
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD "),
    ModifiedBy: "",
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD "),
    Status: "",
    DocNum: "",
    DocDate: dayjs(undefined).format("YYYY-MM-DD "),
    CardCode: "",
    CardName: "",
    CntctCode: "",
    ShipToCode: "",
    TaxDate: dayjs(undefined).format("YYYY-MM-DD "),
    FromWHSCode: "",
    // ToWHSCode: "",
    ToBinCode: "",
    GroupNum: "1",
    AttcEntry: "0",
    SlpCode: "",
    Price: "",
    JrnlMemo: "Inventory Transfers",
    Comments: "",
    InvntSttus: "",
    DocDueDate: dayjs(undefined).format("YYYY-MM-DD "),
    DocCur: "",
    CurSource: "",
    DocTotalFC: "",
    UomCode2: "",
    unitMsr2: "",
    ObjType: "",
    Price1: "",
    UoMCode: "",
    UomCode: "",
    DocTotalSy: "",
    DocTotal: "",
    TransId: "",
    SysRate: "",
    DiscSumSy: "",
    UnitMsr: "",
    CtlAccount: "",
    NumPerMsr: "",
    InvQty: "",
    Series: "",
    OpenInvQty: "",
    FinncPriod: "",
    PIndicator: "",
    oLines: [],
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

  const allFormData = getValues();
  const GroupNum = watch("GroupNum");
  const SysRate = getValues("SysRate");
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
          const sysRateObj = values.find((x) => x.Currency === sysCurr);
          const sysRate =
            sysCurr === mainCurr ? 1 : parseFloat(sysRateObj?.Rate || 0);
          const DateWiseSysRate = sysRate; // FIX
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
          const UpdateDateRate = allFormData.oLines.map((item) => {
            const headerRateObj = values.find(
              (x) => x.Currency === item.Currency,
            );
            let headerRate =
              item.Currency === mainCurr
                ? 1
                : parseFloat(headerRateObj?.Rate || 0);
            if (headerRate <= 0) {
              missingRates.push({
                Type: "DocumentRate",
                Currency: item.Currency,
                Rate: headerRate,
                DocEntry: headerRateObj?.DocEntry ?? "0",
                RateDate: docDate,
              });
            }
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
              return;
            } else {
              dispatch({ type: "CLOSE", modal: "exchaneRateLineCpyform" });
            }
            const LineTotal = item.Quantity * item.PriceBefDi * headerRate;
            const TotalSumSy = ValueFormatter(LineTotal / DateWiseSysRate);
            return {
              ...item,
              Rate: headerRate,
              LineTotal,
              TotalSumSy,
            };
          });

          setValue("oLines", UpdateDateRate);
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

  //   useEffect(() => {
  //   dispatchRedux(fetchExchangeRateStore(docDate))
  //     .unwrap()
  //     .then((res) => {
  //       const values = res?.values || [];
  //       const sysCurr = companyData.SysCurrncy;
  //       const mainCurr = companyData.MainCurncy;

  //       // 🔴 If no exchange rates exist at all
  //       if (!values.length) {
  //         Swal.fire({
  //           title: "Exchange Rates Missing",
  //           text: "Please define exchange rates before continuing.",
  //           icon: "warning",
  //         }).then(() => {
  //           navigate("/dashboard/Finance/ExchangeRatesAndIndexes", {
  //             replace: true,
  //           });
  //         });
  //         return;
  //       }

  //       const missingMap = new Map();

  //       // 1️⃣ SYSTEM RATE
  //       const sysRateObj = values.find(x => x.Currency === sysCurr);
  //       const SysRate =
  //         sysCurr === mainCurr ? 1 : parseFloat(sysRateObj?.Rate || 0);

  //       setValue("SysRate", SysRate);

  //       if (SysRate <= 0) {
  //         missingMap.set(sysCurr, {
  //           Type: "SystemRate",
  //           Currency: sysCurr,
  //           Rate: SysRate,
  //           DocEntry: sysRateObj?.DocEntry ?? "0",
  //           RateDate: docDate,
  //         });
  //       }

  //       // 2️⃣ DOCUMENT / LINE RATES
  //       const updatedLines = (allFormData.oLines || []).map(item => {
  //         const rateObj = values.find(x => x.Currency === item.Currency);
  //         const headerRate =
  //           item.Currency === mainCurr ? 1 : parseFloat(rateObj?.Rate || 0);

  //         if (headerRate <= 0 && !missingMap.has(item.Currency)) {
  //           missingMap.set(item.Currency, {
  //             Type: "DocumentRate",
  //             Currency: item.Currency,
  //             Rate: headerRate,
  //             DocEntry: rateObj?.DocEntry ?? "0",
  //             RateDate: docDate,
  //           });
  //         }
  //         const LineTotal =
  //           (item.Quantity || 0) * (item.PriceBefDi || 0) * headerRate;
  //         const TotalSumSy = ValueFormatter(LineTotal / (SysRate || 1));
  //         return {
  //           ...item,
  //           Rate: headerRate,
  //           LineTotal,
  //           TotalSumSy,
  //         };
  //       });

  //       const missingRates = Array.from(missingMap.values());
  //       if (missingRates.length) {
  //         setAllDataCopyRateLine(missingRates);
  //         dispatch({ type: "OPEN", modal: "exchaneRateLineCpyform" });
  //         const hasSystemRateMissing = missingRates.some(
  //           r => r.Type === "SystemRate"
  //         );
  //         Swal.fire({
  //           title: "Missing Exchange Rates",
  //           text: hasSystemRateMissing
  //             ? `System currency (${sysCurr}) exchange rate is missing. Please add it.`
  //             : "Some document currency exchange rates are missing.",
  //           icon: "warning",
  //         }).then(() => {
  //           navigate("/dashboard/Finance/ExchangeRatesAndIndexes", {
  //             replace: true,
  //           });
  //         });
  //         return;
  //       }

  //       dispatch({ type: "CLOSE", modal: "exchaneRateLineCpyform" });
  //       setValue("oLines", updatedLines);
  //     })
  //     .catch(() => {
  //       Swal.fire({
  //         title: "Error",
  //      text: "Please define the exchange rates.",
  //         icon: "error",
  //       }).then(() => {
  //         navigate("/dashboard/Finance/ExchangeRatesAndIndexes", {
  //           replace: true,
  //         });
  //       });
  //     });
  // }, [docDate]);

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/67`,
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
  console.log(allFormData);
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  const { isDirty } = useFormState({ control });

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

  const { DocSeries } = useDocumentSeries(
    "67",
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
        setValue("Currency", response.values[0].PrimCurr);
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
  useEffect(() => {
    PriceListfetch();
    salesEmpdata();

    fetchGetListDataBP(0);
    fetchgetListDataFromWHS(0);
    fetchgetListDataToWHS1(0);
    // fetchgetListDataFromWHS2();
    // fetchgetListDataToWHS1(0);
    fetchOpenListData(0);

    fetchgetListDataFromLine(0);
  }, []);

  const handleOpenListClear = () => {
    setopenListQuery("");
    setopenListSearching(false);
    setopenListPage(0);
    setopenListData([]);
    fetchOpenListData(0);
    // getInventoryTransfer()
  };
  // Search Record Result
  const handleOpenListSearch = (res) => {
    setopenListQuery(res);
    setopenListSearching(true);
    setopenListPage(0);
    setopenListData([]);
    if (typeof httpRequestToken != typeof undefined) {
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res, httpRequestToken);
    }, TimeDelay);
  };
  //Featch more Data
  const fetchMoreOpenListData = () => {
    fetchOpenListData(
      openListPage + 1,
      openListSearching ? openListQuery : "",
      httpRequestToken,
    );
    setopenListPage((prev) => prev + 1);
  };
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      // Use Ternary Operator
      const url = searchTerm
        ? `/InventoryTransfer/Search/${searchTerm}/1/${pageNum}/20`
        : `/InventoryTransfer/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setopenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  // Datagrid column hide Show ++++++++++++++++++++++++++++++++++++++++++++++

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
  //       updatedData.PriceBefDi = Math.max(value, 0);
  //       updatedData.Currency = companyData.MainCurncy;
  //     }

  //     if (name === "Quantity") {
  //       updatedData.Quantity = Math.max(value, 0);
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
  //     updatedData.TotalSumSy = updatedData.LineTotal / SysRateApi;
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
    updatedData.Price = 0;
    const invQty = updatedData.NumPerMsr * updatedData.Quantity;
    updatedData.InvQty = invQty;
    updatedData.OpenInvQty = invQty;
    updatedData.LineTotal = ValueFormatter(CalcLines.LineTotal, 6);
    updatedData.TotalSumSy = ValueFormatter(updatedData.LineTotal / SysRate);
    updatedData.StockSum = ValueFormatter(CalcLines.LineTotal, 6);
    updatedData.StockSumSc = ValueFormatter(CalcLines.LineTotal / SysRate);
    const updatedLines = getValues("oLines").map((d, i) =>
      i === oldRow.id ? updatedData : d,
    );
    reset({ ...allFormData, oLines: updatedLines });

    return updatedData;
  };
  if (SaveUpdateName === "SAVE") {
    recalcHeaderTotals(getValues("oLines"), setValue);
  }

  //  DataGrid Row Delete Function
  const handleDeleteRow = (id) => {
    const updatedRows = allFormData.oLines.filter((_, index) => index !== id);

    const updatedData = {
      ...allFormData,
      oLines: updatedRows,
    };
    reset(updatedData);
  };
  // DataGrid Table Header Filds
  // const columns = [
  //   { field: "ItemCode", headerName: "ITEM NO", width: 100, hideable: true },
  //   {
  //     field: "ItemName",
  //     headerName: "ITEM DESC",
  //     width: 100,
  //     editable: true,
  //     sortable: false,
  //   },
  //   {
  //     field: "Quantity",
  //     headerName: "QTY",
  //     sortable: false,
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="Quantity"
  //         // value={params.value}
  //         sx={{ width: 130 }}
  //         defaultValue={params.value}
  //         onBlur={(e) => handleChange(e, params.row)}
  //       />
  //     ),
  //   },
  //   {
  //     field: "PriceBefDi",
  //     headerName: "Info Price",
  //     sortable: false,
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => (
  //       <InputTextField
  //         name="PriceBefDi"
  //         value={params.value}
  //         sx={{ width: 130 }}
  //         onChange={(e) => handleChange(e, params.row)}
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
  //     field: "FromWHSCode",
  //     headerName: "FROM WHSE",
  //     width: 200,
  //     editable: false,
  //     renderCell: (row) => (
  //       <Controller
  //         name="FromWHSCode"
  //         control={control}
  //         render={({ field }) => (
  //           <InputTextSearchButtonTable
  //             disabled={SaveUpdateName === "UPDATE"}
  //             onClick={() => {
  //               setSelectedRowId(row.id);
  //               setValue("selectedRowIndex", row.id);
  //               OpenDailogFromLine();
  //             }}
  //             {...field}
  //             value={row.value === "" ? watch("FromWHSCode") : row.value}
  //           />
  //         )}
  //       />
  //     ),
  //   },
  //   {
  //     field: "AllBin",
  //     headerName: " FROM BIN LOCATION",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     headerAlign: "center",
  //     align: "center",
  //     renderCell: (params) => {
  //       const BinQty =
  //         params.row.oDocBinLocationLines?.reduce(
  //           (sum, { BinActionType, Quantity }) =>
  //             sum + (BinActionType === "F" ? +Quantity || 0 : 0),
  //           0
  //         ) || 0;
  //       return (
  //         <Controller
  //           name="AllBin"
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               // {...field}
  //               name="AllBin"
  //               // readOnly={allFormData.DocEntry}
  //               value={BinQty}
  //               title={params.row.Bin}
  //               error={!!error}
  //               helperText={error?.message}
  //               InputProps={{
  //                 endAdornment: (
  //                   <InputAdornment position="end">
  //                     <IconButton
  //                       onClick={() => {
  //                         setValue("BinLocation", params.row);
  //                         dispatch({
  //                           type: "OPEN",
  //                           modal: "AllBinLocationOpen",
  //                         });
  //                       }}
  //                       disabled={
  //                         SaveUpdateName === "UPDATE"
  //                           ? (params.row.oDocBinLocationLines || []).length ===
  //                             0
  //                           : params.row.Status === "0" ||
  //                             Number(params.row.DftBinAbsTo) <= 0 ||
  //                             params.row.BinActivatTo !== "Y"
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
  //     field: "ToWHSCode",
  //     headerName: "TO WHSE",
  //     width: 200,
  //     editable: false,
  //     renderCell: (params) => (
  //       <Controller
  //         name="ToWHSCode"
  //         control={control}
  //         render={({ field }) => (
  //           <InputTextSearchButtonTable
  //             disabled={SaveUpdateName === "UPDATE"}
  //             onClick={() => {
  //               setSelectedRowId(params.row.id);
  //               OpenDailogToLine(); // open warehouse select
  //             }}
  //             {...field}
  //             value={params.value || ""}
  //           />
  //         )}
  //       />
  //     ),
  //   },
  //   {
  //     field: "Bin",
  //     headerName: "TO BIN LOCATION",
  //     width: 150,
  //     sortable: false,
  //     editable: false,
  //     headerAlign: "center",
  //     align: "center",
  //     renderCell: (params) => {
  //       const BinQty =
  //         params.row.oDocBinLocationLines?.reduce(
  //           (sum, { BinActionType, Quantity }) =>
  //             sum + (BinActionType === "T" ? +Quantity || 0 : 0),
  //           0
  //         ) || 0;
  //       return (
  //         <Controller
  //           name="Bin"
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextField
  //               name="Bin"
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
  //     field: "LineTotal",
  //     headerName: "Total",
  //     sortable: false,
  //     width: 150,
  //     editable: false,
  //     // renderCell: (params) => (
  //     //   <InputTextField
  //     //     readOnly
  //     //     name="LineTotal"
  //     //     value={params.value}
  //     //     sx={{ width: 130 }}
  //     //     onChange={(e) => handleChange(e, params.row)}
  //     //   />
  //     // ),
  //   },
  //   {
  //     field: "OnHandWHS",
  //     headerName: "QTY IN WHSE",
  //     width: 100,
  //     editable: true,
  //     sortable: false,
  //   },
  //   {
  //     field: "IsCommitedWHS",
  //     headerName: "COMMITTED QTY WHSE ",
  //     width: 120,
  //     editable: true,
  //     sortable: false,
  //   },
  //   {
  //     field: "OnOrderWHS",
  //     headerName: "ORDER QTY WHSE ",
  //     width: 100,
  //     editable: true,
  //     sortable: false,
  //   },
  //   {
  //     field: "OnHand",
  //     headerName: "IN STOCK",
  //     width: 100,
  //     editable: true,
  //     sortable: false,
  //   },
  //   {
  //     field: "IsCommited",
  //     headerName: "COMMITTED",
  //     width: 120,
  //     editable: true,
  //     sortable: false,
  //   },
  //   {
  //     field: "OnOrder",
  //     headerName: "ORDERD ",
  //     width: 100,
  //     editable: true,
  //     sortable: false,
  //   },

  //   {
  //     field: "UoMCode",
  //     headerName: "UOM Code",
  //     sortable: false,
  //     width: 150,
  //     editable: false,
  //     renderCell: (params) => {
  //       return (
  //         <Controller
  //           name={`UoMCode_${params.row.id}`}
  //           control={control}
  //           render={({ field, fieldState: { error } }) => (
  //             <InputTextSearchButtonTable
  //               disabled={params.row.UomEntry2 === "-1"}
  //               {...field}
  //               name={`UoMCode_${params.row.id}`}
  //               value={params.value}
  //               onChange={(e) => {
  //                 field.onChange(e);
  //                 handleChange(e, params.row);
  //               }}
  //               error={!!error}
  //               helperText={error?.message}
  //               onClick={() => {
  //                 setSelectedRowId(params.row.id);
  //                 OpenDailog3();
  //                 OumCodeListData(params.row.UomEntry2);
  //               }}
  //             />
  //           )}
  //         />
  //       );
  //     },
  //   },
  //   // {
  //   //   field: "UnitMsr",
  //   //   headerName: "UoM Name",
  //   //   width: 130,
  //   //   editable: true,
  //   //   sortable: false,
  //   // },
  //   {
  //     field: "NumPerMsr",
  //     headerName: "ITEMS PER UNIT",
  //     width: 90,
  //     editable: true,
  //     sortable: false,
  //   },
  //   {
  //     field: "InvQty",
  //     headerName: "QTY-Inventory UoM",
  //     width: 80,
  //     editable: false,
  //     sortable: false,
  //   },
  //   {
  //     field: "OpenInvQty",
  //     headerName: "OPEN-INV UoM QTY",
  //     width: 80,
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

  //         UoMCode,
  //         FromWHSCode,
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

  //       /* ---------- Click handler ---------- */
  //       const handleClick = () => {
  //         if (!UoMCode || !FromWHSCode) {
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
  //         onClick={() => handleDeleteRow(params.row.id)} // Ensure correct index
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
      field: "FromWHSCode",
      headerName: "FROM WHSE",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let openFromWHSCode = !!params.row.FromWHSCode;
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
                if (
                  !openFromWHSCode &&
                  params.row.readonlyRow !== "readonlyRow"
                ) {
                  setSelectedRowId(params.row.id);
                  setValue("selectedRowIndex", params.row.id);
                  OpenDailogFromLine();
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
                {params.row.FromWHSCode || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setSelectedRowId(params.row.id);
                  setValue("selectedRowIndex", params.row.id);
                  OpenDailogFromLine();
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
      field: "AllBin",
      headerName: " FROM BIN LOCATION",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const BinQty =
          params.row.oDocBinLocationLines?.reduce(
            (sum, { BinActionType, Quantity }) =>
              sum + (BinActionType === "F" ? +Quantity || 0 : 0),
            0,
          ) || 0;
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
                  dispatch({
                    type: "OPEN",
                    modal: "AllBinLocationOpen",
                  });
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
                  setValue("BinLocation", params.row);
                  dispatch({
                    type: "OPEN",
                    modal: "AllBinLocationOpen",
                  });
                }}
                disabled={
                  SaveUpdateName === "UPDATE"
                    ? (params.row.oDocBinLocationLines || []).length === 0
                    : params.row.Status === "0" ||
                      Number(params.row.DftBinAbsTo) <= 0 ||
                      params.row.BinActivatTo !== "Y"
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
      field: "ToWHSCode",
      headerName: "TO WHSE",
      width: 150,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        let ToWHSCode = !!params.row.ToWHSCode;
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
                if (!ToWHSCode && params.row.readonlyRow !== "readonlyRow") {
                  setSelectedRowId(params.row.id);
                  OpenDailogToLine();
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
                {params.row.ToWHSCode || ""}
              </Typography>
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => {
                  setSelectedRowId(params.row.id);
                  OpenDailogToLine();
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
      headerName: "TO BIN LOCATION",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const BinQty =
          params.row.oDocBinLocationLines?.reduce(
            (sum, { BinActionType, Quantity }) =>
              sum + (BinActionType === "T" ? +Quantity || 0 : 0),
            0,
          ) || 0;
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
                  setBinLocData(params.row);
                  dispatch({ type: "OPEN", modal: "BinLocationOpen" });
                }}
                disabled={
                  SaveUpdateName === "UPDATE"
                    ? (params.row.oDocBinLocationLines || []).length === 0
                    : params.row.Status === "0" ||
                      Number(params.row.DftBinAbs) <= 0 ||
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
      field: "OnHandWHS",
      headerName: "QTY IN WHSE",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "IsCommitedWHS",
      headerName: "COMMITTED QTY WHSE ",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "OnOrderWHS",
      headerName: "ORDER QTY WHSE ",
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
                  if (!isDisabled) OumCodeListData(params.row.UomEntry2);
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
                  OumCodeListData(params.row.UomEntry2);
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
          FromWHSCode,
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
          if (!UoMCode || !FromWHSCode) {
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
              color={color}
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
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // set Old Data

  const setbusinessPartner = async (CardCode, LineNum) => {
    try {
      const res = await apiClient.get(`/BPV2/V2/ByCardCode/${CardCode}`);
      const response = res.data;
      console.log("TEST", response);
      if (response.success === true) {
        // setContactc(response.values);
        setbp(response.values);
        console.log("===", response.values);
        setValue("CntctCode", LineNum || "");
      } else if (response.success === false) {
        setbp([]);
        // setContactc([]);
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

  const setInvntTransferData = async (DocEntry, CardCode, CntctCode) => {
    setok("");

    // Check for unsaved rows in the data grid
    const currentOLines = getValues("oLines") || [];
    const hasUnsavedRows =
      SaveUpdateName !== "UPDATE" && currentOLines.length > 0;

    try {
      // Set business partner data before proceeding
      await setbusinessPartner(CardCode, CntctCode);

      // If there are unsaved rows or the data is being updated, show a confirmation popup
      if (
        (isDirty && getValues("CardCode")) ||
        "UPDATE" === ok ||
        hasUnsavedRows
      ) {
        Swal.fire({
          text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        }).then((Data) => {
          if (Data.isConfirmed) {
            // If user confirms, proceed with fetching goods issue data and setting state
            setSelectedData(DocEntry);
            fetchAndSetGoodsIssue(DocEntry);
            setSaveUpdateName("UPDATE");
          } else {
            // If user cancels, show a notification
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
        // If no unsaved data, fetch goods issue data and set state directly
        fetchAndSetGoodsIssue(DocEntry);
        setSaveUpdateName("UPDATE");
        setSelectedData(DocEntry);
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

  const fetchAndSetGoodsIssue = async (DocEntry) => {
    console.log("Fetching Inventory Transfer for:", DocEntry);

    try {
      const response = await apiClient.get(`/InventoryTransfer/${DocEntry}`);
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
        CntctCode: data.CntctCode,
      };

      console.log("Setting form data from fetched record:", updatedData);

      reset(updatedData);
    } catch (error) {
      console.error("Error fetching Inventory Transfer:", error);
    }
  };

  const handleClickOpen = () => {
    // setSelectionModel([]); // ✅ clears checkboxes before modal shows
    // setSelectedRows([]);
    // selectedRowsRef.current = [];
    setOpen(true);
  };

  const closeModel = () => {
    setOpen(false);
    setSearchText("");
    setCurrentPage(0);
  };

  const clearFormData = () => {
    reset(initial);
    setSelectedRows([]);
    selectedRowsRef.current = [];
    setSelectedData([]);
    setSaveUpdateName("SAVE");
    if (openListQuery?.trim()) {
      handleOpenListClear();
    }
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
    setValue("Indicator", DocSeries[0]?.Indicator ?? "");
    setValue("FromWHSCode", getListDataWarehouse[0].WHSCode); // Set in form
    setValue("LocCode", getListDataWarehouse[0].LocationName);
    setValue("ToWHSCode", getListDataTo[0].WHSCode);
    setValue("Currency", PriceListData[0]?.PrimCurr ?? "");

    clearFiles();
  };

  useEffect(() => {}, [selectedRows]); // Logs the state after it's updated
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };

  const handleOnSubmit = async (data) => {
    if (
      data.oLines.length === 0 ||
      data.oLines.every((line) => !line.ItemCode)
    ) {
      Swal.fire({
        text: "Please Select The Item",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }
    if (SaveUpdateName === "SAVE") {
      const BinIssues = data.oLines.filter((line) => {
        const binLines = line.oDocBinLocationLines || [];
        if (line.BinActivat === "Y" && binLines.length === 0) return true;
        const totalBinQty = binLines.reduce(
          (sum, b) => sum + Number(b.Quantity || 0),
          0,
        );
        return line.BinActivat === "Y" && totalBinQty !== Number(line.Quantity);
      });

      if (BinIssues.length > 0) {
        // Create a formatted message l
        // isting Warehouse & Item Codes
        const issueList = BinIssues.map(
          (line, index) => ` ${line.ItemCode || "-"}`,
        ).join(", ");

        Swal.fire({
          title: "Bin Allocation Error!",
          text: `Cannot save — Quantity and Bin Location (From–To) Quantities do not match for item ${issueList}`,
          icon: "warning",
          confirmButtonText: "Ok",
        });

        return false;
      }
    }
    const invalidPrice = data.oLines.some(
      (line) => parseFloat(line.PriceBefDi) <= 0,
    );
    if (invalidPrice) {
      Swal.fire({
        text: "Info Price must be greater than 0 for all Items.",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
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
      DocEntry: data.DocEntry,
      CreatedDate: dayjs(data.CreatedDate).format("YYYY-MM-DD"),
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedDate: dayjs(data.CreatedDate).format("YYYY-MM-DD"),
      Status: data.Status || "1",
      DocNum: data.DocNum || "0",
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      CardCode: data.CardCode || "0",
      CardName: data.CardName || "0",
      CntctCode: String(data.CntctCode),
      ShipToCode: data.LineNum || "0",
      TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD"),
      FromWHSCode: data.FromWHSCode,
      ToWHSCode: data.ToWHSCode,
      ToBinCode: data.ToBinCode || "0",
      GroupNum: data.GroupNum,
      AttcEntry: attachmentDocEntry || data.AttcEntry || "0",
      SlpCode: String(data.SlpCode),
      JrnlMemo: data.JrnlMemo || "",
      Comments: data.Comments || "",
      InvntSttus: data.InvntSttus || "0",
      DocDueDate: data.DocDueDate || "0",
      DocCur: data.DocCur || "0",
      SysRate: String(SysRate || "0"),
      CurSource: data.CurSource || "L",
      DocTotalFC: data.DocTotalFC || "0",
      DocTotalSy: data.DocTotalSy || "0",
      TransId: data.TransId || "0",
      DiscSumSy: data.DiscSumSy || "0",
      CtlAccount: data.CtlAccount || "0",
      Series: String(data.Series),
      Rate: String(data.oLines[0].Rate),
      DocTotal: String(data.DocTotal) || "0",
      WeightUnit: data.WeightUnit || "0",
      DocRate: String(data.oLines[0].Rate),
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oLines: data.oLines.map((item) => {
        return {
          LineNum: item.LineNum || "0",
          DocEntry: item.DocEntry || "0",
          UserId: user.UserId,
          CreatedBy: user.UserName,
          CreatedDate: dayjs(data.CreatedDate).format("YYYY-MM-DD"),
          ModifiedDate: dayjs(data.CreatedDate).format("YYYY-MM-DD"),
          Status: item.Status || "1",
          ItemCode: item.ItemCode || "0",
          ItemName: item.ItemName || "0",
          FromWHSCode: item.FromWHSCode || "0",
          FromBinCode: item.FromBinCode || "0",
          ToWHSCode: item.ToWHSCode || "0",
          ToBinCode: item.ToBinCode || "0",
          FisrtBin: item.FisrtBin || "0",
          Quantity: String(item.Quantity),
          OnHand: item.OnHand,
          IsCommited: item.IsCommited,
          OnOrder: item.OnOrder,
          StockPrice: String(item.StockPrice || "0"),
          StockSum: String(item.StockSum || "0"),
          StockSumSc: String(item.StockSumSc || "0"),
          StockSumFc: "0",
          Price: String(item.PriceBefDi),
          DiscPrcnt: item.DiscPrcnt || "0",
          LineTotal: String(item.LineTotal),
          CodeBars: item.CodeBars || "0",
          NumPerMsr: String(item.NumPerMsr),
          BaseType: item.BaseType || "0",
          BaseEntry: item.BaseEntry || "0",
          BaseLine: item.BaseLine || "0",
          Currency: item.DocCur || "0",
          Rate: String(item.Rate),
          // Currency:data.DocCur ,
          WHSCode: "-",
          TotalFrgn: item.TotalFrgn || "0",
          OpenSum: item.OpenSum || "0",
          OpenSumFC: item.OpenSumFC || "0",
          PriceBefDi: String(item.PriceBefDi),
          OpenQuantity: item.OpenQuantity || "0",
          TotalSumSy: String(item.TotalSumSy || "0"),
          OpenSumSys: item.OpenSumSys || "0",
          InvntSttus: item.InvntSttus || "0",
          INMPrice: item.INMPrice || "0",
          StckSumApp: item.StckSumApp || "0",
          StckAppFc: item.StckAppFc || "0",
          StckAppSc: item.StckAppSc || "0",
          AllocBinC: item.AllocBinC || "0",
          UseBaseUn: item.UseBaseUn || "0",
          InvQty: String(item.InvQty) || "0",
          OpenInvQty: String(item.OpenInvQty || "0"),
          UomEntry: item.UomEntry || "0",
          UgpCode: item.UgpCode || "0",
          UnitMsr: item.unitMsr || "0",
          unitMsr2: item.unitMsr2 || "0",
          UomEntry2: item.UomEntry2 || "0",
          UoMCode: item.UoMCode || "0",
          UomCode2: item.UomCode2 || "0",
          ObjType: "67",
          LocCode: item.LocCode || "0",
          oDocBinLocationLines: item.oDocBinLocationLines || [],
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
            WhsCode: item.FromWHSCode || "",
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
            BaseType: "67",
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
          // =============================================================
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
            WhsCode: item.FromWHSCode || "",
            Notes: BatchItem.Notes || "",
            Quantity: String(BatchItem.BatchQty || "1"),
            BaseType: "67",
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
        };
      }),
    };
    console.log("====", PostObj);
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/InventoryTransfer`, PostObj)
        .then((res) => {
          if (res.data.success) {
            clearFormData();
            setopenListPage(0);
            setopenListData([]);
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
            if (PostObj.AttcEntry > 0) {
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
          if (PostObj.AttcEntry > 0) {
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
      const PutObj = {
        ModifiedBy: user.UserName,
        Comments: data.Comments,
        AttcEntry: data.AttcEntry,
        TaxDate: dayjs(data.TaxDate).format("YYYY-MM-DD "),
        JrnlMemo: data.JrnlMemo,
        oLines: [],
      };
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
            .put(`/InventoryTransfer/${data.DocEntry}`, PutObj)
            .then((response) => {
              if (response.data.success) {
                clearFormData();
                setopenListPage(0);
                setopenListData([]);
                fetchOpenListData(0); // clearFormData();
                setClearCache(true);
                Swal.fire({
                  title: "Success!",
                  text: "Goods Issue Updated",
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
            text: "Goods Issue Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const OpenDailog1 = () => {
    setSearchmodelOpenBP(true);
  };
  const SearchModelClose1 = () => {
    handleGetListClearBP();
    setSearchmodelOpenBP(false);
  };

  const onSelectRequestBP = async (DocEntry) => {
    const { data } = await apiClient.get(`/BPV2/V2/${DocEntry}`);
    const { values } = data;
    setbp(values);

    setValue("CardCode", values.CardCode || "", { shouldDirty: true });
    setValue("CardName", values.CardName || "", { shouldDirty: true });
    setValue("CntctCode", values.CntctPrsn || "", { shouldDirty: true });
    setValue("ShipToCode", values.oLines?.[0]?.Address || "-", {
      shouldDirty: true,
    });

    // ============================
    // SYSTEM RATE CHECK
    // ============================

    SearchModelClose1();
  };

  const handleGetListClearBP = () => {
    setGetListQueryBP("");
    setGetListSearchingBP(true);
    setGetListPageBP(0);
    setGetListDataBP([]); // Clear current data
    fetchGetListDataBP(0); // Fetch first page without search
  };
  const handleGetListSearchBP = (res) => {
    setGetListQueryBP(res);
    setGetListSearchingBP(true);
    setGetListPageBP(0);
    setGetListDataBP([]); // Clear current data
    // fetchGetListDataBP(0, res); // Fetch with search query
    // Cancel Token
    if (typeof httpRequestToken != typeof undefined) {
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchGetListDataBP(0, res, httpRequestToken);
    }, TimeDelay);
    // fetchOpenListData(0,res,httpRequestToken);
  };
  const fetchMoreGetListDataBP = () => {
    fetchGetListDataBP(
      getListPageBP + 1,
      getListSearchingBP ? getListqueryBP : "",
    );
  };
  const fetchGetListDataBP = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BPV2/V2/Search/${searchTerm}/1/${pageNum}/20`
        : `/BPV2/V2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      console.log("BP", response);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreGetListBP(newData.length === 20);
        setGetListDataBP((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      // Cancel Token
      console.log(error);
    }
  };

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
        setValue("Currency", Currency);
        return {
          ItemCode: data.ItemCode,
          ItemName: data.ItemName,
          Quantity: 1,
          PriceBefDi,
          Price: PriceBefDi,
          DiscPrcnt: data.DiscPrcnt || 0,
          Currency: Currency,
          LineTotal: PriceBefDi,
          Bin: 1,
          TotalSumSy: SysRate > 0 ? PriceBefDi / SysRate : 0,
          TotalFrgn: "0",
          CodeBars: data.CodeBars,
          OnHand: data.OnHand,
          IsCommited: data.IsCommited,
          OnOrder: data.OnOrder,
          MinLevel: data.MinLevel,
          AcctCode: data.DecreasAc,
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
          ManBtchNum: data.ManBtchNum,
          ManSerNum: data.ManSerNum,
          UomName: data.UomName,
          InvQty: "1",
          NumPerMsr: "1",
          INUoMEntry: data.INUoMEntry,
          oInvntLines:
            data.oInvntLines?.map((list) => ({
              WHSCode: list.WHSCode,
              OnHandWHS: list.OnHand,
              IsCommitedWHS: list.IsCommited,
              OnOrderWHS: list.OnOrder,
            })) || [],
        };
      });

    const locationWise = selectedRows.map((item) => {
      const matchingLoc = warehouseData.find(
        (row) => row.WHSCode === allFormData.ToWHSCode,
      );
      return {
        ...item,
        LocCode: matchingLoc?.Location ?? "",
        LocationName: matchingLoc?.LocationName ?? "",
        BinCode: matchingLoc?.BinCode ?? "",
        DftBinAbs: matchingLoc?.DftBinAbs,
        BinActivat: matchingLoc?.BinActivat,
        BinActivatTo: matchingLoc?.BinActivat,
        DftBinAbsTo: matchingLoc?.DftBinAbs,
        BinCodeTo: matchingLoc?.BinCode ?? "",
      };
    });

    setSelectedRows((prev) => {
      const existingItemCodes = new Set(prev.map((p) => p.ItemCode));
      const newUniqueRows = locationWise.filter(
        (row) => !existingItemCodes.has(row.ItemCode),
      );
      return [...prev, ...newUniqueRows];
    });
    console.log("dsfds", selectedRows);
  };
  const handleOnSerial = (rowData) => {
    console.log(rowData);
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      InvQty: rowData.InvQty,
      WhsCode: rowData.FromWHSCode,
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
    setopenserial(true);
  };

  const handleOnBatch = (rowData) => {
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      InvQty: rowData.InvQty,
      WhsCode: rowData.FromWHSCode,
      BaseType: rowData.BaseType,
      BaseEntry: rowData.BaseEntry,
      BaseNum: rowData.BaseNum,
      BaseLinNum: rowData.BaseLinNum,
      CardCode: rowData.CardCode,
      CardName: rowData.CardName,
      BinCode: rowData.BinCode,
      id: rowData.id,
    });
    setopenBatch(true);
  };
  const onSubmit = async () => {
    try {
      const calculatedLines = selectedRows.map((line) => {
        const warehouses = line?.oInvntLines?.find(
          (l) => l.WHSCode === allFormData.FromWHSCode,
        );
        return {
          ...line,
          ToWHSCode: allFormData.ToWHSCode,
          FromWHSCode: allFormData?.FromWHSCode || "",
          OnHandWHS: warehouses?.OnHandWHS || 0,
          IsCommitedWHS: warehouses?.IsCommitedWHS || 0,
          OnOrderWHS: warehouses?.OnOrderWHS || 0,
        };
      });
      const currentData = getValues();
      const updatedLines = [
        ...(currentData.oLines || []),
        ...(calculatedLines || []),
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
      const records = data[docDate] || [];
      const sysCurr = companyData.SysCurrncy;
      const mainCurr = companyData.MainCurncy;
      const headerCurr =
        Currency === companyData.MainCurncy ? companyData.MainCurncy : Currency;
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

      const UpdatedLines = updatedLines.map((item) => {
        const LineTotal = item.Quantity * item.PriceBefDi * headerRate;
        const TotalSumSy = ValueFormatter(LineTotal / SysRate);
        return {
          ...item,
          LineTotal,
          TotalSumSy,
          Rate: headerRate,
        };
      });

      setValue("oLines", UpdatedLines);
    } catch (error) {
      console.log(error);
    }
    setSelectedRows([]);
    closeModel();
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

  const createBinLocationLines = (rowsFromModal, binActionType) => {
    return rowsFromModal.map((binitem) => ({
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
      BinActionType: binActionType,
      Warehouse: binitem.Warehouse || "",
    }));
  };

  // 🟢 Normal Bin Location
  const handleBinlocationSubmit = (rowsFromModal) => {
    const selectedRow = BinlocListData;

    const updatedOLines = (getValues("oLines") || []).map((row, index) =>
      index === selectedRow.id
        ? {
            ...row,
            // Replace all 'T' type entries with new ones
            oDocBinLocationLines: [
              ...(row.oDocBinLocationLines || []).filter(
                (line) => line.BinActionType !== "T",
              ),
              ...createBinLocationLines(rowsFromModal, "T"),
            ],
          }
        : row,
    );

    console.log("Updated oLines ====", updatedOLines);
    setValue("oLines", updatedOLines);
    dispatch({ type: "CLOSE", modal: "BinLocationOpen" });
  };

  const handleAllBinlocationSubmit = (rowsFromModal) => {
    const selectedRow = getValues("BinLocation");
    const updatedOLines = (getValues("oLines") || []).map((row, index) =>
      index === selectedRow.id
        ? {
            ...row,
            oDocBinLocationLines: [
              ...(row.oDocBinLocationLines || []).filter(
                (line) => line.BinActionType !== "F",
              ),
              ...createBinLocationLines(rowsFromModal, "F"),
            ],
          }
        : row,
    );

    console.log("Updated oLines ====", updatedOLines);
    setValue("oLines", updatedOLines);
    dispatch({ type: "CLOSE", modal: "AllBinLocationOpen" });
  };

  const onSubmitLineCurrency = (data) => {
    const allFormData = getValues();
    // ==============================
    // 🔹 SYSTEM RATE
    // ===============================
    const SysRateObj = data.find(
      (ex) => ex.Currency === companyData.SysCurrncy,
    );
    const SystemRate =
      companyData.SysCurrncy === companyData.MainCurncy
        ? 1
        : parseFloat(SysRateObj?.Rate) || 0;
    const UpdatedLines = (allFormData.oLines || []).map((item) => {
      const Rate =
        data[0]?.Currency === companyData.MainCurncy
          ? 1
          : parseFloat(data[0]?.Rate) || 0;
      const LineTotal = (item.Quantity || 0) * item.Price * Rate;
      const TotalSumSy = ValueFormatter(LineTotal / SysRate);
      return {
        ...item,
        Currency: data[0]?.Currency,
        Rate,
        LineTotal,
        TotalSumSy,
        StockSum: LineTotal,
        StockSumSc: TotalSumSy,
      };
    });
    const mergedData = {
      ...allFormData,
      SysRate: SystemRate,
      oLines: UpdatedLines,
    };
    reset(mergedData);
  };

  const handleChangePrice = async (e) => {
    const PriceValue = e.target.value;
    const oLines = getValues("oLines") || [];
    if (!oLines.length) return;
    const itemCodes = oLines.map((item) => item.ItemCode);
    const priceData = await fetchPriceListData(
      apiClient,
      itemCodes,
      PriceValue,
    );
    const records = data[docDate] || [];
    const missingCurrencyMap = new Map();
    const updatedLines = oLines.map((item) => {
      let apiPrice = priceData.find((p) => p.ItemCode === item.ItemCode);
      let currency = apiPrice?.Currency ?? item.Currency;
      let newPrice = apiPrice?.Price ?? item.PriceBefDi;
      let rec = records.find((r) => r.Currency === currency);
      let rate =
        currency === companyData.MainCurncy ? 1 : parseFloat(rec?.Rate || 0);
      const LineTotal = (item.Quantity || 0) * newPrice * rate;
      const TotalSumSy = ValueFormatter(LineTotal / SysRate);
      if (rate === 0 && !missingCurrencyMap.has(currency)) {
        missingCurrencyMap.set(currency, {
          Type: "LineRate",
          Currency: currency,
          Rate: rate,
          DocEntry: rec?.DocEntry ?? "0",
          RateDate: docDate,
        });
      }
      if (missingCurrencyMap.length) {
        setAllDataCopyRateLine(missingCurrencyMap);
        dispatch({ type: "OPEN", modal: "exchaneRateLineCpyform" });
        const hasSystemRateMissing = missingCurrencyMap.some(
          (r) => r.Type === "SystemRate",
        );
        Swal.fire({
          title: "Missing Exchange Rates",
          text: hasSystemRateMissing
            ? `System currency (${companyData.SysCurrncy}) exchange rate is missing. Please add it.`
            : "Some document currency exchange rates are missing.",
          icon: "warning",
        }).then(() => {
          navigate("/dashboard/Finance/ExchangeRatesAndIndexes", {
            replace: true,
          });
        });
        return;
      }

      dispatch({ type: "CLOSE", modal: "exchaneRateLineCpyform" });
      return {
        ...item,
        PriceBefDi: newPrice,
        Currency: currency,
        Rate: rate,
        LineTotal,
        TotalSumSy,
        StockPrice: newPrice,
        StockSum: LineTotal,
        StockSumSc: TotalSumSy,
      };
    });

    // 5️⃣ Update form state
    setValue("oLines", updatedLines);
  };

  // +++++++++++++++++++++++++++++++++++From Warehouse+++++++++++++++++++++++++++++++++++
  const OpenDailogFromWHS = () => setsearchmodelOpenFromWHS(true);
  const SearchModelCloseFromWHS = () => setsearchmodelOpenFromWHS(false);
  const onSelectRequestFromWHS = async (WHSCode, LocationName) => {
    setValue("FromWHSCode", WHSCode);
    setValue("LocCode", LocationName);
    if (getValues("oLines").length > 0) {
      Swal.fire({
        text: `Do You Want To Continue Warehouse ${WHSCode} For Lines?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const updatedLines = getValues("oLines").map((data) => {
            const matched = data?.oInvntLines?.find(
              (l) => l.WHSCode === WHSCode,
            );
            return {
              ...data,
              FromWHSCode: matched?.WHSCode || "",

              OnHandWHS: matched?.OnHandWHS || 0,
              IsCommitedWHS: matched?.IsCommitedWHS || 0,
              OnOrderWHS: matched?.OnOrderWHS || 0,
            };
          });
          reset({
            ...getValues(),
            FromWHSCode: WHSCode, // If this is at the header level
            oLines: updatedLines,
          });
        } else {
          Swal.fire({
            text: "Not Continue Record",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
    SearchModelCloseFromWHS();
  };

  const handleGetListClearFromWHS = () => {
    setGetListQueryFromWHS("");
    setGetListSearchingFromWHS(false);
    setgetListPageFromWHS(0);
    setgetListDataFromWHS([]);
    fetchgetListDataFromWHS(0);
  };
  const handleGetListSearchFromWHS = (res) => {
    setGetListQueryFromWHS(res);
    setGetListSearchingFromWHS(true);
    setgetListPageFromWHS(0);
    setgetListDataFromWHS([]);
    // fetchgetListDataFromWHS(0, res);
    // Cancel Token
    if (typeof httpRequestToken != typeof undefined) {
      console.log("REQUEST CANCELLED", httpRequestToken);
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataFromWHS(0, res, httpRequestToken);
    }, TimeDelay);
  };

  const fetchMoregetListDataFromWHS = () => {
    fetchgetListDataFromWHS(
      getListPageFromWHS + 1,
      getListSearchingFromWHS ? getListqueryFromWHS : "",
    );
  };
  const fetchgetListDataFromWHS = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/WarehouseV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/WarehouseV2/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        if (pageNum === 0 && newData.length > 0) {
          const firstWarehouse = newData[0];
          setValue("FromWHSCode", firstWarehouse.WHSCode);
          setValue("LocCode", firstWarehouse.Location);
        }
        sethasMoreGetListFromWHS(newData.length === 20);
        setgetListDataFromWHS((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageFromWHS(pageNum);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const OpenDailogFromWHS1 = () => {
    setsearchmodelOpenTo(true);
  };
  const SearchModelCloseFromWHS1 = () => {
    setsearchmodelOpenTo(false);
  };

  const onSelectRequestFromWHS1 = async (
    WHSCode,
    LocCode,
    LocationName,
    BinCode,
    BinActivat,
    DftBinAbs,
  ) => {
    setValue("ToWHSCode", WHSCode);
    if (getValues("oLines").length > 0) {
      Swal.fire({
        text: `Do You Want To Continue Warehouse ${WHSCode} For Lines?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const updatedLines = getValues("oLines").map((data) => ({
            ...data,
            ToWHSCode: WHSCode,
            LocCode,
            LocationName,
            BinCode,
            BinActivat,
            DftBinAbs,
            //  UomCode2: OnHand,
            //  unitMsr2: IsCommited,
            //  ObjType: OnOrder,
          }));

          reset({
            ...getValues(),
            ToWHSCode: WHSCode,
            oLines: updatedLines,
          });
        } else {
          Swal.fire({
            text: "Not Continue Record",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
    SearchModelCloseFromWHS1();
  };

  const fetchMoregetListDataFromWHS1 = () => {
    fetchgetListDataToWHS1(
      getListPageTo + 1,
      getListSearchingTo ? getListqueryTo : "",
    );
  };
  const fetchgetListDataToWHS1 = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/WarehouseV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/WarehouseV2/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        const firstWarehouse = newData[0];
        setValue("ToWHSCode", firstWarehouse.WHSCode);
        sethasMoreGetListTo(newData.length === 20);
        setgetListDataTo((prev) =>
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
        text: error,
        icon: "question",
        confirmButtonText: "YES",
        showConfirmButton: true,
      });
    }
  };
  const handleGetListClearFromWHS1 = () => {
    setGetListQueryTo("");
    setGetListSearchingTo(false);
    setgetListPageTo(0);
    setgetListDataTo([]);
    fetchgetListDataToWHS1(0);
  };
  const handleGetListSearchFromWHS1 = (res) => {
    setGetListQueryTo(res);
    setGetListSearchingTo(true);
    setgetListPageTo(0);
    setgetListDataTo([]);
    // fetchgetListDataFromWHS(0, res);
    // Cancel Token
    if (typeof httpRequestToken != typeof undefined) {
      console.log("REQUEST CANCELLED", httpRequestToken);
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataToWHS1(0, res, httpRequestToken);
    }, TimeDelay);
  };
  const OpenDailogFromLine = () => {
    setSearchmodelFromLine(true);
  };
  const SearchModelCloseFromLine = () => {
    setSearchmodelFromLine(false);
  };

  const onSelectRequestFromLine = (
    WHSCode,
    // LocationName,
    BinCode,
    DftBinAbs,
    BinActivat,
  ) => {
    alert("");
    const currentRowIndex = getValues("selectedRowIndex");
    console.log(currentRowIndex);
    const updatedLines = getValues("oLines").map((data, index) => {
      if (currentRowIndex === index) {
        const matched = data?.oInvntLines?.find((l) => l.WHSCode === WHSCode);
        return {
          ...data,
          FromWHSCode: WHSCode,
          // LocCode: LocationName,
          OnHandWHS: matched?.OnHandWHS || 0,
          IsCommitedWHS: matched?.IsCommitedWHS || 0,
          OnOrderWHS: matched?.OnOrderWHS || 0,
          BinCodeTo: BinCode,
          DftBinAbsTo: DftBinAbs,
          BinActivatTo: BinActivat,
        };
      }
      return data; // Preserve all other rows
    });
    reset({ ...getValues(), oLines: updatedLines });
    SearchModelCloseFromLine(); // Close modal
  };

  const handleGetListClearFromLine = () => {
    setGetListQueryFromLine("");
    setGetListSearchingFromLine(false);
    setgetListPageFromLine(0);
    setgetListDataFromLine([]);
    fetchgetListDataFromLine(0);
  };
  const handleGetListSearchFromLine = (res) => {
    setGetListQueryFromLine(res);
    setGetListSearchingFromLine(true);
    setgetListPageFromLine(0);
    setgetListDataFromLine([]);

    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchgetListDataFromLine(0, res);
    }, TimeDelay);
  };

  const fetchMoregetListDataFromLine = () => {
    fetchgetListDataFromLine(
      getListPageFromLine + 1,
      getListSearchingFromLine ? getListqueryFromLine : "",
    );
  };
  const fetchgetListDataFromLine = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/WarehouseV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/WarehouseV2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        sethasMoreGetListFromLine(newData.length === 20);

        setgetListDataFromLine((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageFromLine(pageNum);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const OpenDailogToLine = () => {
    setSearchmodelToLine(true);
  };
  const SearchModelCloseToLine = () => {
    setSearchmodelToLine(false);
  };

  const onSelectRequestToLine = async (
    WHSCode,
    Location,
    LocationName,
    BinCode,
    DftBinAbs,
    BinActivat,
  ) => {
    const updatedLines = getValues("oLines").map((data, index) => {
      if (selectedRowId !== index) return data;
      return {
        ...data,
        ToWHSCode: WHSCode,
        LocCode: Location || "", // ✅ Set LocCode
        LocationName,
        BinCode,
        DftBinAbs,
        BinActivat,
      };
    });
    reset({ ...getValues(), oLines: updatedLines });
    SearchModelCloseToLine();
  };

  const handleGetListClearToLine = () => {
    setGetListQueryToLine("");
    setGetListSearchingToLine(false);
    setgetListPageToLine(0);
    setgetListDataToLine([]);
    fetchgetListDataToLine(0);
  };
  const handleGetListSearchToLine = (res) => {
    setGetListQueryToLine(res);
    setGetListSearchingToLine(true);
    setgetListPageToLine(0);
    setgetListDataToLine([]);
    // fetchgetListDataFromWHS(0, res);
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
      fetchgetListDataToLine(0, res, httpRequestToken);
    }, TimeDelay);
  };

  const fetchMoregetListDataToLine = () => {
    fetchgetListDataToLine(
      getListPageToLine + 1,
      getListSearchingToLine ? getListqueryToLine : "",
    );
  };
  const fetchgetListDataToLine = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/WarehouseV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/WarehouseV2/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        sethasMoreGetListToLine(newData.length === 20);
        setgetListDataToLine((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
        setgetListPageToLine(pageNum);
      }
    } catch (error) {
      console.log(error);
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
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const OpenDailog3 = () => {
    setSearchmodelOpen3(true);
  };
  const SearchModelClose3 = () => {
    setSearchmodelOpen3(false);
  };
  const handleGetListClear3 = () => {
    setgetListquery3("");
    setgetListSearching3(false);
    setgetListPage3(0);
    setgetListData3([]);
    fetchGetListData3(0); // fetch first page without search
  };
  const handleGetListSearch3 = (res) => {
    setgetListquery3(res);
    setgetListSearching3(true);
    setgetListPage3(0);
    setgetListData3([]);

    if (timeoutRef3.current) {
      clearTimeout(timeoutRef3.current);
    }

    timeoutRef3.current = setTimeout(() => {
      fetchGetListData3(0, res);
    }, TimeDelay); // assuming you already have TimeDelay constant
  };
  const fetchMoreGetListData3 = () => {
    fetchGetListData3(getListPage3 + 1, getListSearching3 ? getListquery3 : "");
  };
  const OumCodeListData = async (DocEntry) => {
    try {
      const res = await apiClient.get(`/UGP/${DocEntry}`);
      const updatedLines = getValues("oLines").map((item) => {
        return {
          ...item,
          unitMsr: res.UgpCode,
          UomCode2: res.UgpName, // Assign a valid value here
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
  const onSelectUom = async (UomCode, UomEntry, UomName, AltQty, BaseQty) => {
    const allFormData = getValues("oLines");
    const updatedLines = allFormData.map((line, index) => {
      if (index === selectedRowId) {
        const numPerMsr = BaseQty / AltQty;
        // Lock base price only once
        const basePrice =
          line.BasePrice !== undefined ? line.BasePrice : line.PriceBefDi;
        // New price for display (PriceBefDi is shown per UOM)
        const newPriceBefDi = numPerMsr * basePrice;
        return {
          ...line,
          AltQty,
          BaseQty,
          UomEntry: UomEntry,
          UoMCode: UomCode,
          UnitMsr: UomName,
          unitMsr2: UomName,
          NumPerMsr: numPerMsr,
          InvQty: numPerMsr * line.Quantity,
          OpenInvQty: numPerMsr * line.Quantity,
          PriceBefDi: newPriceBefDi,
          BasePrice: basePrice,
          LineTotal: (line.Quantity ?? 1) * newPriceBefDi, // ✅ Always Qty × BasePrice
        };
      }

      return line;
    });

    reset({
      ...getValues(),
      oLines: updatedLines,
    });

    SearchModelClose3();
  };

  const fetchGetListData3 = async (DocEntry) => {
    try {
      const res = await apiClient.get(`/UGP/${DocEntry}`);
      // console.log(res);
      const updatedLines = getValues("oLines").map((item) => {
        return {
          ...item,
          unitMsr: res.UgpCode,
          UomCode2: res.UgpName,
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
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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
          Inventory Transfer List
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
        //sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
                onChange={(e) => handleOpenListSearch(e.target.value)}
                value={openListQuery}
                onClickClear={handleOpenListClear}
              />
            </Grid>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={openListData.length}
              next={fetchMoreOpenListData}
              hasMore={hasMoreOpen}
              loader={<BeatLoader />}
              scrollableTarget="ListScroll"
              endMessage={<Typography>No More Records</Typography>}
            >
              {openListData.map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.CardCode}
                  subtitle={item.DocNum}
                  description={dayjs(item.TaxDate).format("DD-MM-YYYY ")}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListQuery}
                  onClick={() => {
                    setInvntTransferData(
                      item.DocEntry,
                      item.CardCode,
                      item.CntctCode,
                      item.SlpCode,
                    );
                  }}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Grid>
      </Grid>
    </>
  );
  return (
    <>
      <DataGridModal
        open={open}
        closeModel={closeModel}
        onSubmit={() => {
          onSubmit();
        }}
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

      <SerialOuttake
        // <SerialSalesOuttake
        Title="SERIAL NUMBER"
        openserialmodal={openserial}
        DialogClosePayto={handleCloseSerial}
        onSubmit={(serialData) => onsubmitSeriel(serialData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={selectedItem?.InvQty}
        WHSCode={selectedItem?.WhsCode}
        OpenQuantity={selectedItem?.OpenQuantity}
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
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      <SearchModel
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
              {UomCodeList.map((item, index) => (
                <CardComponentNew
                  key={index}
                  title={item.UomCode}
                  subtitle={item.WHSCode}
                  description={item.UomName}
                  searchResult={getListquery3}
                  onClick={() => {
                    onSelectUom(
                      item.UomCode,
                      item.UomEntry,
                      item.UomName,
                      item.AltQty,
                      item.BaseQty,
                    );
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />

      {/* +++++++++++++++++++++++++++++++++++++++++++Table Line Level++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      <SearchModel
        open={searchmodelFromLine}
        onClose={SearchModelCloseFromLine}
        onCancel={SearchModelCloseFromLine}
        title="FROM WAREHOUSE CODE"
        onChange={(e) => handleGetListSearchFromLine(e.target.value)}
        value={getListqueryFromLine}
        onClickClear={handleGetListClearFromLine}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataFromLine.length}
              next={fetchMoregetListDataFromLine}
              hasMore={hasMoreGetListFromLine}
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
              {getListDataFromLine.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.WHSCode}
                  subtitle={item.LocationName}
                  description={item.WHSName}
                  searchResult={getListqueryFromLine}
                  onClick={() => {
                    onSelectRequestFromLine(
                      item.WHSCode,
                      // item.LocationName,
                      item.BinCode,
                      item.DftBinAbs,
                      item.BinActivat,
                    );
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />

      <SearchModel
        open={searchmodelToLine}
        onClose={SearchModelCloseToLine}
        onCancel={SearchModelCloseToLine}
        title="To WAREHOUSE CODE"
        onChange={(e) => handleGetListSearchToLine(e.target.value)}
        value={getListqueryToLine}
        onClickClear={handleGetListClearToLine}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataToLine.length}
              next={fetchMoregetListDataToLine}
              hasMore={hasMoreGetListToLine}
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
              {getListDataFromLine.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.WHSCode}
                  subtitle={item.LocationName}
                  description={item.WHSName}
                  searchResult={getListqueryToLine}
                  onClick={() =>
                    onSelectRequestToLine(
                      item.WHSCode,
                      item.Location,
                      item.LocationName,
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

      <ToBinLocation
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
      <FromAllBin
        open={state.AllBinLocationOpen}
        closeModel={() =>
          dispatch({ type: "CLOSE", modal: "AllBinLocationOpen" })
        }
        onSubmit={handleAllBinlocationSubmit}
        isLoading={isLoading}
        title="Bin Location"
        data={getValues("BinLocation")}
        DocNum={getValues("DocNum")}
        getRowId={(row) => row.id}
        SaveUpdateName={SaveUpdateName}
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
      {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      <SearchModel
        open={searchmodelOpenPriceList1}
        onClose={SearchModelClose1}
        onCancel={SearchModelClose1}
        title="BP List"
        onChange={(e) => handleGetListSearchBP(e.target.value)}
        value={getListqueryBP}
        onClickClear={handleGetListClearBP}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataBP.length}
              next={fetchMoreGetListDataBP}
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
              {getListDataBP.map((item, index) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.CardCode}
                  subtitle={item.CardName}
                  description={item.CreatedBy}
                  searchResult={getListqueryBP}
                  onClick={() => {
                    onSelectRequestBP(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
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
            // onClick={clearFormData()}
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
              Inventory Transfer
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
                <Grid container>
                  <Grid
                    item
                    xs={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="CardCode"
                      control={control}
                      // rules={{ required: "BP Code IS requered" }}
                      // defaultValue=""
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          disabled={SaveUpdateName === "UPDATE"}
                          readOnly
                          label="BP Code"
                          onClick={() => {
                            OpenDailog1();
                          }}
                          type="text"
                          {...field}
                          data={getListDataBP}
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
                      name="CardName"
                      control={control}
                      // rules={{ required: "BP NAME is requered" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          label="BP NAME"
                          type="text"
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
                    xs={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    textTransform={"uppercase"}
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
                          data={(getbp.oCPLines || []).map((item) => ({
                            key: item.LineNum,
                            value: item.CntctCode,
                          }))}
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
                      name="ShipToCode"
                      control={control}
                      // rules={{ required: "SHIP TO IS requered" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          label="SHIP TO"
                          type="text"
                          readOnly
                          {...field}
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
                      name="GroupNum"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="PRICE LIST"
                          disabled={SaveUpdateName === "UPDATE"}
                          data={(PriceListData || []).map((item) => ({
                            key: item.DocEntry,
                            value: item.ListName,
                          }))}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChangePrice(e);
                          }}
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
                  <Grid
                    item
                    xs={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
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
                      name="TaxDate"
                      control={control}
                      // rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputDatePickerField
                          label="DOCUMENT DATE"
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
                  {/* ++++++++++++++++++++++++++++++++++++++From Warehouse+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                  <Grid
                    item
                    xs={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="FromWHSCode"
                      control={control}
                      rules={{ required: "FROM WAREHOUSE is requered" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButtonTable
                          disabled={SaveUpdateName === "UPDATE"}
                          readOnly
                          label="FROM WAREHOUSE"
                          onClick={() => {
                            OpenDailogFromWHS();
                          }}
                          {...field}
                          // data={getListDataPriceList}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <SearchModel
                    open={searchmodelOpenWarehouse}
                    onClose={SearchModelCloseFromWHS}
                    onCancel={SearchModelCloseFromWHS}
                    title="FROM WAREHOUSE CODE"
                    onChange={(e) => handleGetListSearchFromWHS(e.target.value)}
                    value={getListqueryFromWHS}
                    onClickClear={handleGetListClearFromWHS}
                    cardData={
                      <>
                        <InfiniteScroll
                          style={{ textAlign: "center" }}
                          dataLength={getListDataWarehouse.length}
                          next={fetchMoregetListDataFromWHS}
                          hasMore={hasMoreGetListWarehouse}
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
                          {getListDataWarehouse.map((item, index) => (
                            <CardComponent
                              key={index}
                              title={item.WHSCode}
                              subtitle={item.LocationName}
                              description={item.WHSName}
                              searchResult={getListqueryFromWHS}
                              onClick={() =>
                                onSelectRequestFromWHS(
                                  item.WHSCode,
                                  item.LocationName,
                                )
                              }
                            />
                          ))}
                        </InfiniteScroll>
                      </>
                    }
                  />
                  {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

                  <Grid
                    item
                    xs={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="ToWHSCode"
                      control={control}
                      rules={{ required: "TO WAREHOUSE is requered" }}
                      defaultValue=""
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButtonTable
                          disabled={SaveUpdateName === "UPDATE"}
                          readOnly
                          label="TO WAREHOUSE"
                          onClick={() => {
                            OpenDailogFromWHS1();
                          }}
                          {...field}
                          data={getListDataBP}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <SearchModel
                    open={searchmodelOpenTo}
                    onClose={SearchModelCloseFromWHS1}
                    onCancel={SearchModelCloseFromWHS1}
                    title="TO WAREHOUSE CODE"
                    onChange={(e) =>
                      handleGetListSearchFromWHS1(e.target.value)
                    }
                    value={getListqueryTo}
                    onClickClear={handleGetListClearFromWHS1}
                    cardData={
                      <>
                        <InfiniteScroll
                          style={{ textAlign: "center" }}
                          dataLength={getListDataWarehouse.length}
                          next={fetchMoregetListDataFromWHS1}
                          hasMore={hasMoreGetListTo}
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
                          {getListDataTo.map((item, index) => (
                            <CardComponentNew
                              key={index}
                              title={item.WHSCode}
                              subtitle={item.LocationName}
                              description={item.WHSName}
                              searchResult={getListqueryTo}
                              onClick={() =>
                                onSelectRequestFromWHS1(
                                  item.WHSCode,
                                  item.Location,
                                  item.LocationName,
                                  item.BinCode,
                                  item.BinActivat,
                                  item.DftBinAbs,
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
                              width: "100%",
                              height: "100%",
                              minHeight: "300px",
                              maxHeight: "500px",
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
                      xs={6}
                      md={4}
                      lg={4}
                      textAlign={"center"}
                      textTransform={"uppercase"}
                    >
                      <Controller
                        name="DocTotal"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            readOnly
                            {...field}
                            label="DocTotal"
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
                      xs={6}
                      md={4}
                      lg={4}
                      textAlign="center"
                      textTransform="uppercase"
                    >
                      <Controller
                        name="SlpCode"
                        // rules={{ required: "This Field is Required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Autocomplete
                            sx={{
                              width: "60%",
                              "& .MuiInputBase-root": { height: "52px" },
                            }}
                            options={[
                              ...salesemp.map((item) => ({
                                key: item.DocEntry,
                                value: item.SlpName,
                              })),
                            ]}
                            getOptionLabel={(option) => option?.value || ""}
                            onChange={(_, newValue) =>
                              field.onChange(newValue ? newValue.key : 0)
                            }
                            renderInput={(params) => (
                              <InputTextField
                                {...params}
                                label="SALES EMP"
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
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
                        name="JrnlMemo"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="JOURNAL REMARK"
                            type="text"
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            inputProps={{ maxLength: 50 }}
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
                        name="Comments"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label=" REMARK"
                            type="text"
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            inputProps={{ maxLength: 100 }}
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
