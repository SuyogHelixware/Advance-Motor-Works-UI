import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
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
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import {
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
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import CardCopyFrom from "../Components/CardCopyFrom";
import DataGriCellModelClick from "../Components/DataGridCellModelClick";
import {
  InputLargeTextField,
  InputSelectTextField,
  InputTextField,
  SelectedDatePickerField,
  SmallInputTextField,
} from "../Components/formComponents";
import PrintMenu from "../Components/PrintMenu";
import SearchInputField from "../Components/SearchInputField";
import SearchModel, { CopyFromSearchModel } from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import {
  useDocumentSeries,
  useSearchInfiniteScroll,
} from "../Components/useSearchInfiniteScroll";
import { TwoFormatter } from "../Components/ValueFormatter";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import BinLocation from "../Components/BinLocation";

const TranColumn = [
  // {
  //   id: 1,
  //   field: "id",
  //   headerName: "LINE NO",
  //   width: 80,
  //   renderCell: (params) => <span>{params.id + 1}</span>,
  // },
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
    width: 150,
    sortable: false,
    editable: false,
    headerAlign: "center",
    align: "center",
  },

  {
    field: "ItemCode",
    headerName: "ITEM CODE",
    width: 150,
    sortable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "ItemName",
    headerName: "ITEM NAME",
    width: 150,
    sortable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "Quantity",
    headerName: "Quantity",
    width: 130,
    sortable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "WhsCode",
    headerName: "WHSCODE",
    width: 130,
    sortable: false,
    headerAlign: "center",
    align: "center",
  },
];

const DisassemblyColumn = [
  // {
  //   id: 1,
  //   field: "id",
  //   headerName: "LINE NO",
  //   width: 80,
  //   renderCell: (params) => <span>{params.id + 1}</span>,
  // },
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
            : params.row.Type === "D"
              ? "DISASSEMBLY"
              : ""}
      </span>
    ),
  },
  {
    field: "BaseRef",
    headerName: "ORDER NO",
    width: 150,
    sortable: false,
    editable: false,
    headerAlign: "center",
    align: "center",
  },

  {
    field: "ItemCode",
    headerName: "PRODUCT NO",
    width: 150,
    sortable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "ItemName",
    headerName: "PRODUCT DESCRIPTION",
    width: 200,
    sortable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "Quantity",
    headerName: "Quantity",
    width: 150,
    sortable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "WHSCode",
    headerName: "WHSCODE",
    width: 150,
    sortable: false,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "Comments",
    headerName: "REMARK",
    width: 150,
    sortable: false,
    headerAlign: "center",
    align: "center",
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
export default function RecieptForProduction() {
  const theme = useTheme();
  const timeoutRef = useRef(null);
  const apiRef = useGridApiRef();
  const perms = usePermissions(104);
  const { user, warehouseData } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tabvalue, settabvalue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [IssueAccountOpen, setIssueChartOpen] = useState(false);
  const [whscopenIssue, setwhscOpenIssue] = useState(false);
  const [openListData, setOpenListData] = useState([]);
  let [ok, setok] = useState("OK");
  const [oldOpenData, setSelectData] = useState(null);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [openDisassembly, setOpenDisassembly] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // Control modal visibility
  const [getListIssueTransData, setGetListIssueTransData] = useState([]);
  const [hasMoreIssueTransList, setHasMoreIssueTranList] = useState(true);
  const [getListPageIssueTrans, setPageIssueTran] = useState(0);
  const [getListqueryIssueTrans, setQueryIssueTran] = useState("");
  const [getListSearchingIssue, setSearchIssueTran] = useState(false);
  const [openPurchase, setOpenPurchase] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [formData, setAllDAta] = useState([]);
  const [OlinesData, setOlines] = useState([]);
  const [issueData, setIssueData] = useState([]);
  const LIMIT = 20;
  const [isLoading, setIsLoading] = useState(false);
  const [disassCache, setDisassCache] = useState({});
  const [disassList, setDisassList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [clearCache, setClearCache] = useState(false);
  const [PrintData, setPrintData] = useState([]);
  const [BinlocListData, setBinLocData] = useState([]);
  const toggleDrawer = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();

  const InitialForm = {
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
    AttcEntry: "0",
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
    control,
    setValue,
    watch,
    clearErrors,
    getValues,
    reset,
    handleSubmit,
  } = useForm({
    defaultValues: InitialForm,
  });

  const allFormData = getValues();
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
  // -------------------------------------------------------------------\
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      let response = await apiClient.get(`/GoodsReceipt/`, {
        params: {
          BaseType: "202",
          Status: "1",
          Page: pageNum,
          Limit: "20",
          ...(searchTerm && { SearchText: searchTerm }),
        },
      });

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Infinite scroll fetch more data
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };
  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear searFullAddressch input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };
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

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);
  const Column = [
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
              : params.row.Type === "D"
                ? "DISASSEMBLY"
                : ""}
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

      // renderCell: (params) => (
      //   <ModelInputSelectTextField
      //     name="TranType"
      //     value={params.value}
      //     disabled={params.row.BaseLine > 0}
      //     onChange={(e) => handleChange(e, params.row)}
      //     data={[
      //       { key: "C", value: "COMPLETE" },
      //       { key: "R", value: "REJECT" },
      //     ]}
      //   />
      // ),
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
                  setValue("selectedRowIndex", params.row.id);
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
                  setValue("selectedRowIndex", params.row.id);
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
    },
    {
      field: "RjctQty",
      headerName: "REJECT",
      width: 120,
      editable: false,
    },
    {
      field: "OnHand",
      headerName: "IN STOCK",
      width: 120,
      editable: false,
    },
    {
      field: "OnOrder",
      headerName: "ORDERED",
      width: 120,
      editable: false,
    },
    {
      field: "IsCommited",
      headerName: "RESERVE",
      width: 120,
      editable: false,
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
                  setValue("selectedRowIndex", params.row.id);
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
                  setValue("selectedRowIndex", params.row.id);
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
    },
    {
      field: "IssuedQty",
      headerName: "ISSUED",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "UomCode",
      headerName: "UOM CODE",
      width: 130,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "NumPerMsr",
      headerName: "ITEMS PER UNIT",
      sortable: false,
      width: 150,
      editable: false,
      headerAlign: "center",
      align: "center",
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
            onClick={() => handleDeleteRow(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const handleDeleteRow = (id) => {
    const updatedRows = getValues("oLines").filter((_, index) => index !== id);
    const updatedData = {
      ...getValues(),
      oLines: updatedRows,
    };
    reset(updatedData);
  };

  // const handleChange = (e, row) => {
  //   const { name, value } = e.target;
  //   const updatedLines = getValues("oLines").map((data, index) => {
  //     if (row.id !== index) return data;

  //     const updatedData = {
  //       ...data,
  //       [name]: value,
  //       LineTotal: String(
  //         (name === "Quantity" ? Number(value) : Number(data.Quantity)) * 150
  //       ),
  //     };
  //     return updatedData;
  //   });
  //   // setValueIssue("oLines",updatedLines)
  //   reset({
  //     ...getValues(),
  //     oLines: updatedLines,
  //   });
  // };

  const handleCellKeyDown = (params, event) => {
    Swal.close(); // close any popup

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

        // Auto-open singleSelect dropdown
        const nextColumnType = api.getColumn(nextField).type;
        if (nextColumnType === "singleSelect") {
          const cell = api.getCellElement(nextId, nextField);
          const selectButton = cell?.querySelector("button"); // MUI singleSelect button
          if (selectButton) selectButton.click();
        }
      }, 50);
    }
  };

  const processRowUpdate = (newRow, oldRow) => {
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
    const updatedLines = getValues("oLines").map((d, i) =>
      i === oldRow.id ? updatedData : d,
    );
    reset({ ...allFormData, oLines: updatedLines });

    return updatedData;
  };
  const DocTotalIssue = getValues("oLines").reduce(
    (acc, cur) => acc + parseFloat(cur.LineTotal),
    0,
  );
  setValue("DocTotal", DocTotalIssue);

  const { DocSeries } = useDocumentSeries(
    "59",
    getValues("DocDate"),
    setValue,
    clearCache,
    SaveUpdateName,
  );

  const selectIssueOfAccount = (AcctCode) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValues("oLines").map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          AcctCode: AcctCode,
        };
      }
      return line;
    });
    reset({
      ...getValues(),
      oLines: updatedLines,
    });
    setIssueChartOpen(false);
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
  const selectedIssueWhsc = async (
    WHSCode,
    LocationName,
    LocCode,
    BinCode,
    DftBinAbs,
    BinActivat,
  ) => {
    const currentRowIndex = getValues("selectedRowIndex"); // You'll need to track this
    const updatedLines = getValues("oLines").map((line, index) => {
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
    reset({
      ...getValues(),
      oLines: updatedLines,
    });
    setwhscOpenIssue(false);
  };

  const fetchIssueTransaction = async (pageNum = 0, searchTerm = "") => {
    try {
      const response = await apiClient.get(
        `/GoodsReceipt/GetProductionOrderForRecpt`,
        {
          params: {
            Type: "RT",
            Status: "5",
            page: pageNum,
            SearchText: searchTerm,
          },
        },
      );

      if (response.data?.success) {
        const newData = response.data.values || [];
        setHasMoreIssueTranList(newData.length === 20);
        setGetListIssueTransData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data?.message || "Unknown error occurred",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        text: error.message || "Something went wrong",
        icon: "question",
        confirmButtonText: "YES",
      });
    }
  };

  const handleSearchIssueTran = (resp) => {
    setQueryIssueTran(resp);
    setSearchIssueTran(true);
    setPageIssueTran(0);
    setGetListIssueTransData([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchIssueTransaction(0, resp);
    }, 600);
  };

  const handleClearIssueTran = () => {
    setQueryIssueTran("");
    setSearchIssueTran(true);
    setPageIssueTran(0);
    setGetListIssueTransData([]);
    fetchIssueTransaction(0, "");
  };
  const fetchMoreGetListCopyFrom = () => {
    fetchIssueTransaction(
      getListPageIssueTrans + 1,
      getListSearchingIssue ? getListqueryIssueTrans : "",
    );
    setPageIssueTran((prev) => prev + 1);
  };

  useEffect(() => {
    fetchIssueTransaction(0, " ");
  }, []);
  const handleOpenPurchase = () => {
    setOpenPurchase(true);

    // reset("oLines")
  };

  const handleClosePurchase = useCallback((e) => {
    setOpenPurchase(false);
  }, []);

  //! Copy Form Logic
  const getProduction = useCallback((e, item, index) => {
    const checked = e.target.checked;
    console.log("======", item);
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = {
        ...prevCheckedItems,
        [index]: checked, // Update specific checkbox state
      };
      return newCheckedItems;
    });
    if (checked) {
      setAllDAta(item);
      setOlines((prevOlines) => {
        const newOlines = [
          ...prevOlines,
          ...(item.oPOLines || []).map((obj) => ({
            ...obj,
            Status: "1",
            BaseRef: item.DocNum,
            BaseType: "202",
            BaseEntry: obj.DocEntry,
            OnHand: item.OnHand || "0",
            OnOrder: item.OnOrder || "0",
            IsCommited: item.IsCommited || "0",
            BaseLine: obj.LineNum,
            unitMsr: obj.InvntoryUOM,
            UomEntry2: obj.UgpEntry,
            NumPerMsr: "1",
            ObjType: "202",

            Quantity:
              item.Type === "D"
                ? obj.PlannedQty - obj.IssuedQty
                : parseFloat(obj.IssuedQty ?? 0),
            WhsCode: obj.WHSCode,
            Type: item.Type,
          })),
        ];
        return Array.from(
          new Map(newOlines.map((obj) => [JSON.stringify(obj), obj])).values(),
        );
      });
    } else {
      setOlines((prevOlines) =>
        prevOlines.filter(
          (line) => !item.oPOLines.some((ol) => ol.LineNum === line.LineNum),
        ),
      );
    }
  }, []);
  const handleIssueClick = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleSubmitPro = () => {
    const UpdatedLine = issueData.map((item) => {
      const match = warehouseData.find((loc) => loc.WHSCode === item.WHSCode);
      const Price = 150;
      const LineTotal = Price * item.Quantity;
      return {
        ...item,
        LocCode: match ? match.Location : null,
        LocationName: match ? match.LocationName : null,
        BinCode: match?.BinCode ?? "",
        DftBinAbs: match?.DftBinAbs,
        BinActivat: match?.BinActivat,
        Price: Price,
        LineTotal: LineTotal,
        CpyIssueQty: item.Quantity,
      };
    });
    let updatedData = {
      ...allFormData,
      BaseRef: formData.DocNum,
      LocCode: formData.LocCode || "0",
      oLines: [...allFormData.oLines, ...UpdatedLine],
    };
    reset(updatedData);
    handleCloseDialog();
    handleClosePurchase();
  };
  const handleSelectionChange = (selectedIDs) => {
    const selectedRows = OlinesData.filter((row) =>
      selectedIDs.includes(row.LineNum),
    );
    setIssueData(selectedRows);
  };
  const isRowSelectable = (params) => {
    const olines = getValues("oLines");
    return !olines.some((obj) => obj.LineNum === params.row.LineNum);
  };

  const fetchDisass = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;
      // Use cache if exists
      if (disassCache[cacheKey]) {
        setDisassList(disassCache[cacheKey]);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await apiClient.get(
          `/GoodsReceipt/GetProductionOrderForRecpt`,
          {
            params: {
              Type: "PR",
              Status: 5,
              SearchText: search,
              Page: page,
              Limit: LIMIT,
            },
          },
        );
        if (data.success) {
          const items = data.values || [];
          setDisassCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));
          setDisassList(items);
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
    [disassCache],
  );
  useEffect(() => {
    fetchDisass(currentPage, searchText);
  }, [currentPage, searchText, fetchDisass]);
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
      setCurrentPage(0);
      setDisassCache({});
    },
    [searchText],
  );

  const handleCellClick = async (ids) => {
    const childItemCode = (allFormData.oLines || []).some(
      (item) => item.BaseEntry === ids.id,
    );

    if (childItemCode) {
      Swal.fire({
        text: "Item already Exists",
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return;
    }
    const RowsDis = ids.row;
    const whsdata = warehouseData.find(
      (WhsCode) => WhsCode.WHSCode === RowsDis.WHSCode,
    );
    const UpdatedLine = [
      {
        Type: RowsDis.Type,
        BaseRef: RowsDis.DocNum,
        ItemCode: RowsDis.ItemCode,
        ItemName: RowsDis.ProdName,
        TranType: "C",
        Quantity:
          parseFloat(RowsDis.PlannedQty) -
          (parseFloat(RowsDis.CmpltQty) + parseFloat(RowsDis.RjctQty)),
        CpyIssueQty:
          parseFloat(RowsDis.PlannedQty) -
          (parseFloat(RowsDis.CmpltQty) + parseFloat(RowsDis.RjctQty)),
        Price: 150,
        ObjType: "202",
        LineTotal:
          (parseFloat(RowsDis.PlannedQty) -
            (parseFloat(RowsDis.CmpltQty) + parseFloat(RowsDis.RjctQty))) *
          150,
        WHSCode: RowsDis.WHSCode,
        LocationName: whsdata?.LocationName ?? "",
        BinCode: whsdata?.BinCode ?? "",
        DftBinAbs: whsdata?.DftBinAbs,
        BinActivat: whsdata?.BinActivat,
        LocCode: whsdata?.Location ?? "",
        AcctCode: RowsDis.WipActCode,
        PlannedQty: RowsDis.PlannedQty,
        IssuedQty: RowsDis.CmpltQty,
        RjctQty: RowsDis.RjctQty,
        CmpltQty: RowsDis.CmpltQty,
        UomCode: RowsDis.UomCode,
        BaseType: "202",
        NumPerMsr: RowsDis.NumPerMsr || "0",
        BaseEntry: RowsDis.DocEntry,
        OnHand: RowsDis.OnHand || "0",
        IsCommited: RowsDis.IsCommited || "0",
        OnOrder: RowsDis.OnOrder || "0",
      },
    ];
    let updatedData = {
      ...allFormData,
      BaseRef: RowsDis.DocNum,
      LocCode: whsdata?.Location ?? "0",
      oLines: [...allFormData.oLines, ...UpdatedLine],
    };
    reset(updatedData);
    setSearchText("");
    closeDisassembly();
  };

  const closeDisassembly = () => {
    setOpenDisassembly(false);
    setSearchText("");
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
  const handleSubmitForm = async (data) => {
    console.log("data submit", data);
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
    // const missingWhs = (data.oLines || []).some((line) => !line.TranType);
    // if (missingWhs) {
    //   Swal.fire({
    //     title: `Missing Required Fields`,
    //     text: `Please select the Transaction Type for all lines.`,
    //     icon: "warning",
    //     confirmButtonText: "Ok",
    //   });
    //   return false;
    // }

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
      ...data,
      Series: String(data.Series),
      DocTotal: String(data.DocTotal),
      ObjType: "59",
      BaseType: "202",
      WeightUnit: "0",
      AttcEntry: attachmentDocEntry,
      BaseRef: String(data.BaseRef),
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oLines: (data.oLines || []).map((item) => ({
        ...item,
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
        ModifiedBy: user.UserName,
        BaseEntry: item.BaseEntry || "0",
        BaseLine: item.BaseLine || "0",
        Status: "1",
        AcctCode: item.WipActCode || "0",
        Quantity: String(item.Quantity),
        InvQty: String(item.Quantity),
        IssuedQty: String(
          parseFloat(item.Quantity) + parseFloat(item.IssuedQty),
        ),
        Price: String(item.Price),
        LineTotal: String(item.LineTotal),
        UomEntry: item.UomEntry || "0",
        UoMCode: item.UoMCode || "0",
        WeightUnit: item.WeightUnit || "0",
        TranType: item?.TranType ?? null,
        UgpCode: "0",
        CodeBars: "0",
        MinLevel: "0",
        unitMsr2: "0",
        UomCode2: "0",
        DiscPrcnt: "0",
        PriceBefDi: String(item.Price),
        Rate: "0",
        Currency: "0",
        StockSum: "0",
        TotalSum: "0",
        StockSumFc: "0",
        StockSumSc: "0",
        TotalSumSy: "0",
        oDocBinLocationLines: item.oDocBinLocationLines || [],
        StockPrice: "0",
        unitMsr: item.unitMsr || "0",
        NumPerMsr: "1",
        UomEntry2: item.UomEntry2 || "0",
        OpenQuantity: String(item.Quantity),
      })),
    };
    console.log("obj", obj);
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/GoodsReceipt`, obj)
        .then((res) => {
          if (res.data.success) {
            fetchOpenListData(0);
            setOpenListData([]);
            fetchIssueTransaction(0);
            setGetListIssueTransData([]);
            ClearForm();
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
            .put(`/GoodsReceipt/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                fetchOpenListData(0);
                setOpenListData([]);
                fetchIssueTransaction(0);
                setGetListIssueTransData([]);
                ClearForm();
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
  const ClearForm = () => {
    reset(InitialForm);
    setSaveUpdateName("SAVE");
    clearFiles();
    setCheckedItems({});
    setOlines([]);
    setAllDAta([]);
    if (openListquery?.trim()) {
      handleOpenListClear();
    }
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
    setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
  };
  const {
    data: IssueAccountData,
    hasMore: IssueAccountHasMore,
    query: IssueAccountQuery,
    onSearch: IssueAccountSearch,
    onClear: IssueAccountClear,
    fetchMore: fetchMoreIssueAccount,
  } = useSearchInfiniteScroll(`ChartOfAccounts`);
  const {
    data: whsIssueData,
    hasMore: whsIssueHasMore,
    query: whsIssueeQuery,
    onSearch: onWhsIssueSearch,
    onClear: onWhsIssueClear,
    fetchMore: fetchIssueMoreWhs,
  } = useSearchInfiniteScroll(`WarehouseV2`);
  const { isDirty } = useFormState({ control });

  const setOldOpenData = async (DocEntry) => {
    setok("");
    if (isDirty || ok === "UPDATE") {
      Swal.fire({
        text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((Data) => {
        if (Data.isConfirmed) {
          fetchOpenData(DocEntry); // Extract the common logic
          setSelectData(DocEntry);
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
      fetchOpenData(DocEntry); // Safe to proceed directly
      setSelectData(DocEntry);
    }
  };
  const fetchOpenData = async (DocEntry) => {
    const response = await apiClient.get(`/GoodsReceipt/${DocEntry}`);
    if (!response.data || !response.data.values) {
      return;
    }
    const item = response.data.values;
    if (item.AttcEntry > 0) {
      setFilesFromApi(item.AttcEntry);
    }

    const updatedOLines = (item.oLines || []).map((line) => {
      const match = warehouseData.find((loc) => loc.Location === line.LocCode);
      return {
        ...line,
        LocationName: match?.LocationName || "",
        LocCode: match?.Location || "",
        BinCode: match?.BinCode ?? "",
        DftBinAbs: match?.DftBinAbs,
        BinActivat: match?.BinActivat,
        UserId: user.UserId,
        BaseRef: item.BaseRef || "-1",
        Quantity: item.Quantity || "0",
        readonlyRow: "readonlyRow",
      };
    });
    const updatedData = {
      ...item,
      oLines: updatedOLines,
    };

    reset(updatedData);
    // reset({
    //   ...item,
    //   oLines: (item.oLines || []).map((element) => ({
    //     ...element,
    //     UserId: user.UserId,
    //     BaseRef: item.BaseRef || "-1",
    //     Quantity: element.Quantity || "0",
    //   })),
    // });
    toggleDrawer();
    setSaveUpdateName("UPDATE");
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
          Reciept Production List
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
                onChange={(e) => handleOpenListSearch(e.target.value)}
                value={openListquery}
                onClickClear={handleOpenListClear}
              />
            </Grid>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={openListData.length}
              next={fetchMoreOpenListData}
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
                  subtitle={dayjs(item.DocDate).format("DD/MM/YYYY")}
                  searchResult={openListquery}
                  isSelected={oldOpenData === item.DocEntry}
                  onClick={() => {
                    setOldOpenData(item.DocEntry);
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
            dataLength={IssueAccountData.length}
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
            {IssueAccountData.filter(
              (Postable) => Postable.Postable === "Y",
            ).map((item) => (
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
            dataLength={whsIssueData.length}
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
            {whsIssueData.map((item) => (
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

      <CopyFromSearchModel
        open={openDialog}
        onClose={handleCloseDialog}
        onCancel={handleCloseDialog}
        onChange={(e) => handleSearchIssueTran(e.target.value)}
        value={getListqueryIssueTrans}
        onClickClear={handleClearIssueTran}
        Input={
          <>
            <Grid item xs={12} sm={12} md={12} lg={12} textAlign={"center"}>
              <Typography variant="subtitle1" fontWeight="bold">
                PRODUCTION ORDER
              </Typography>
            </Grid>
          </>
        }
        onSave={handleOpenPurchase}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListIssueTransData.length}
              next={fetchMoreGetListCopyFrom}
              hasMore={hasMoreIssueTransList}
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
              {getListIssueTransData.map((item, i) => (
                <CardCopyFrom
                  key={i}
                  id={i}
                  title={item.DocNum}
                  subtitle={dayjs(item.DocDate).format("DD/MM/YYYY")}
                  description={dayjs(item.DocDueDate).format("DD/MM/YYYY")}
                  searchResult={getListqueryIssueTrans}
                  checked={checkedItems[i] || false}
                  onClick={(e) => {
                    getProduction(e, item, i);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
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
              sm: "80%",
              md: "65%",
              lg: "65%",
            },
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Box>
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
                  rows={OlinesData.map((item, index) => ({
                    ...item,
                    id: index + 1, // If `id` exists, use it; otherwise, use the index
                  }))}
                  columns={TranColumn}
                  getRowId={(row) => row.LineNum}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 8,
                      },
                    },
                  }}
                  checkboxSelection
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
                onClick={handleSubmitPro}
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
      <DataGriCellModelClick
        open={openDisassembly}
        closeModel={closeDisassembly}
        isLoading={isLoading}
        // title="DISASSEMBLY"
        getRowId={(row) => row.DocEntry}
        columns={DisassemblyColumn}
        rows={disassList.map((item) => ({
          ...item,
          BaseRef: item.DocNum,
          ItemName: item.ProdName,
          Quantity:
            parseFloat(item.PlannedQty) -
            (parseFloat(item.CmpltQty) + parseFloat(item.RjctQty)),
        }))}
        currentPage={currentPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onCellClick={handleCellClick}
        onSearchChange={handleSearchChange}
        selectedRowIndex={getValues("selectedRowIndex")}
        rowCount={rowCount}
        oLines={getValues("oLines")}
      />

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        {/* Sidebar for larger screens */}

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

        {/* User Creation Form Grid */}

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
            onClick={toggleDrawer}
            sx={{
              display: {
                lg: "none",
              }, // Show only on smaller screens
              position: "absolute",
              left: "10px",
            }}
          >
            <MenuOpenIcon />
          </IconButton>

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
              Reciept Production
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
                // sx={{
                //   "& .MuiTextField-root": { m: 1 },
                // }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
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

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                    mt={1}
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
                    mt={1}
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
                            setValue("DocDate", date);
                            // setValue("DocDueDate", "");
                          }}
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
                    mt={1}
                  >
                    <Box
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Button
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        // onClick={handleClick}
                        disabled={SaveUpdateName === "UPDATE"}
                        onClick={() => setOpenDisassembly(true)}
                      >
                        PRODUCTION ORDER
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
                        onClick={() => handleIssueClick()}
                        disabled={SaveUpdateName === "UPDATE"}
                      >
                        RETURN COMPONENT
                      </Button>
                    </Box>
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
                      <Tab value={1} label="Attachments" />
                    </Tabs>
                    <Divider />

                    <Grid item xs={12}>
                      {tabvalue === 0 && (
                        <>
                          <Grid
                            container
                            item
                            sx={{
                              width: "100%",
                              overflow: "auto",
                              height: "100%",
                              minHeight: "300px",
                              maxHeight: "500px",
                            }}
                          >
                            <DataGrid
                              columnHeaderHeight={35}
                              rowHeight={45}
                              apiRef={apiRef}
                              rows={getValues("oLines" || []).map(
                                (data, index) => ({
                                  ...data,
                                  id: index,
                                }),
                              )}
                              editMode="cell"
                              columns={Column}
                              getRowId={(row) => row.id}
                              getRowClassName={() =>
                                SaveUpdateName === "UPDATE"
                                  ? "disabled-row"
                                  : ""
                              }
                              isCellEditable={(params) =>
                                !(
                                  params.field === "TranType" &&
                                  params.row.BaseLine > 0
                                )
                              }
                              getCellClassName={(params) =>
                                params.field === "TranType" &&
                                params.row.BaseLine > 0
                                  ? "disabled-cell"
                                  : ""
                              }
                              processRowUpdate={processRowUpdate}
                              onProcessRowUpdateError={(err) =>
                                console.error(err)
                              }
                              onCellKeyDown={handleCellKeyDown}
                              disableColumnFilter
                              disableColumnSelector
                              sx={gridSx}
                              disableDensitySelector
                              slotProps={{
                                toolbar: {
                                  showQuickFilter: true,
                                  quickFilterProps: { debounceMs: 500 },
                                },
                              }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>

                    {tabvalue === 1 && (
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
                      md={6}
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
                    <Grid
                      xs={12}
                      mt={1}
                      // mx={3}
                      sm={6}
                      md={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="JrnlMemo"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputLargeTextField
                            label="JOURNAL REMARK"
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
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="DocTotal"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <SmallInputTextField
                            label="Total"
                            type="text"
                            {...field}
                            multiline={2}
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
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
