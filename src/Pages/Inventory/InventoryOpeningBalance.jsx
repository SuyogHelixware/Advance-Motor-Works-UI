import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTheme } from "@emotion/react";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {
  Box,
  Button,
  Divider,
  Drawer,
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
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponent from "../Components/CardComponent";
import DataGridModal from "../Components/DataGridModal";
import {
  InputFields,
  InputSelectFields,
  InputSelectTextField,
  InputTextField,
  InputTextSearchButtonTable,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import { TimeDelay } from "../Components/TimeDelay";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { openFileinNewTab } from "../FileUpload/filePreview";
import BatchIntake from "../Components/Batch";
import SerialIntake from "../Components/SerialIntake";
import { TwoFormatter, ValueFormatter } from "../Components/ValueFormatter";
import SerialOuttake from "../Components/OpenSerialGetCase";
import BatchOuttake from "../Components/BatchOuttake";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { useGridApiRef } from "@mui/x-data-grid";

const ItemColumn = [
  // {
  //   id: 1,
  //   field: "id",
  //   headerName: "Sr/No",
  //   width: 60,
  //   editable: true,
  // },
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
  // {
  //   field: "QTY",
  //   headerName: "QUANTITY",
  //   width: 120,
  //   editable: true,
  // },
  {
    field: "Price",
    headerName: "Price",
    width: 120,
    editable: true,
  },
  {
    field: "DefaultWhs",
    headerName: "WHS CODE",
    width: 120,
    editable: true,
  },
  {
    field: "OnHand",
    headerName: "IN STOCK",
    width: 100,
    sortable: false,
  },
  {
    field: "IsCommited",
    headerName: "RESERVE",
    width: 100,
    sortable: false,
  },
  {
    field: "OnOrder",
    headerName: "ORDERED",
    width: 100,
    sortable: false,
  },
];

export default function InventoryQuantityance() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabvalue, settabvalue] = useState(0);

  const theme = useTheme();
  const perms = usePermissions(89);

  const timeoutRef = useRef(null);
  const [selectedData, setSelectedData] = useState([]);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  let [ok, setok] = useState("OK");
  const [loading, setLoading] = useState(false);
  const [selectedIDs, setSelectedIDs] = useState(new Set());
  const { user, warehouseData } = useAuth();
  const [clearCache, setClearCache] = useState(false);

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //===============================search button================================================================
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const LIMIT = 20;
  const [isLoading, setIsLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [rowCount, setRowCount] = useState(0);

  //========================================pricelist state================================================================
  const [getListqueryPriceList, setGetListQueryPriceList] = useState("");
  const [getListSearchingPriceList, setGetListSearchingPriceList] =
    useState(false);
  const [getListDataPriceList, setGetListDataPriceList] = useState([]);
  const [getListPagePriceList, setGetListPagePriceList] = useState(0);
  const [hasMoreGetListPriceList, setHasMoreGetListPriceList] = useState(true);
  const [searchmodelOpenPriceList, setSearchmodelOpen] = useState(false);
  const [httpRequestToken, setCancelToken] = useState();

  //  ===================================WareHouse State===================================================
  const [openWhsc, setWhscOpen] = useState(false);
  const [WhscgetListData, setWhscGetListData] = useState([]);
  const [WhsgetListPage, setWhsGetListPage] = useState(0);
  const [WhshasMoreGetList, setWhsHasMoreGetList] = useState(true);
  const [WhsrgetListquery, setWhsGetListQuery] = useState("");
  const [WhsgetListSearching, setWhsGetListSearching] = useState(false);

  //  ===================================Bin Location State===================================================
  const [openBinCode, setBinCodeOpen] = useState(false);
  const [BinCodegetListData, setBinCodeGetListData] = useState([]);
  const [BinCodegetListPage, setBinCodeGetListPage] = useState(0);
  const [BinCodehasMoreGetList, setBinCodeHasMoreGetList] = useState(true);
  const [BinCodegetListquery, setBinCodeGetListQuery] = useState("");
  const [BinCodegetListSearching, setBinCodeGetListSearching] = useState(false);

  //  ===================================WareHouse State===================================================
  const [openGLAcct, setGLAcctOpen] = useState(false);
  const [GLAcctcgetListData, setGLAcctGetListData] = useState([]);
  const [GLAcctgetListPage, setGLAcctGetListPage] = useState(0);
  const [GLAccthasMoreGetList, setGLAcctHasMoreGetList] = useState(true);
  const [GLAcctgetListquery, setGLAcctGetListQuery] = useState("");
  const [GLAcctgetListSearching, setGLAcctGetListSearching] = useState(false);
  let [openserial, setopenserial] = useState(false);
  let [openOutserial, setopenOutserial] = useState(false);

  let [openBatch, setopenBatch] = useState(false);
  let [openOutBatch, setopenOutBatch] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const apiRef = useGridApiRef();

  const handleCloseSerial = () => setopenserial(false);
  const handleCloseOutSerial = () => setopenOutserial(false);

  const handleCloseBatch = () => setopenBatch(false);
  const handleOutCloseBatch = () => setopenOutBatch(false);
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  //==========================================Price List field Functions(Modal, Pagination, Search)=============================
  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };
  const SearchModelClose = () => {
    handleGetListClearPriceList();
    setSearchmodelOpen(false);
  };
  const handleGetListClearPriceList = () => {
    setGetListQueryPriceList("");
    setGetListSearchingPriceList(true);
    setGetListPagePriceList(0);
    setGetListDataPriceList([]); // Clear current data
    fetchGetListDataPriceList(0); // Fetch first page without search
  };
  const handleGetListSearchPriceList = (res) => {
    setGetListQueryPriceList(res);
    setGetListSearchingPriceList(true);
    setGetListPagePriceList(0);
    setGetListDataPriceList([]); // Clear current data
    // fetchGetListDataPriceList(0, res); // Fetch with search query
    // Cancel Token
    if (typeof httpRequestToken != typeof undefined) {
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchGetListDataPriceList(0, res, httpRequestToken);
    }, TimeDelay);
    // fetchCloseListData(0,res,httpRequestToken);
  };
  const fetchMoreGetListDataPriceList = () => {
    fetchGetListDataPriceList(
      getListPagePriceList + 1,
      getListSearchingPriceList ? getListqueryPriceList : "",
    );
    setGetListPagePriceList((prev) => prev + 1);
  };
  const fetchGetListDataPriceList = async (pageNum = 0, searchTerm = "") => {
    try {
      setLoading(true); // 🔄 start loader (if available)

      const url = searchTerm?.trim()
        ? `/PriceList/Search/${searchTerm.trim()}/1/${pageNum}/20`
        : `/PriceList/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        setHasMoreGetListPriceList(newData.length === 20);

        setGetListDataPriceList((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        return newData; // ✅ return fetched data
      } else {
        Swal.fire({
          icon: "info",
          text: response?.data?.message || "Failed to load price list data.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching price list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch price list data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }

    return []; // fallback
  };

  const onSelectRequestPriceList = async (DocEntry) => {
    const selectedObj = getListDataPriceList.find(
      (item) => item.DocEntry === DocEntry,
    );
    if (!selectedObj) return;

    setValue("GroupNum", selectedObj.DocEntry, { shouldDirty: true });
    setValue("GroupNumName", selectedObj.ListName, { shouldDirty: true });

    const formOlines = getValues("oLines");

    const updatedLines = formOlines.map((line) => {
      // Find matching item from itemList using ItemCode
      const itemData = itemList.find((i) => i.ItemCode === line.ItemCode);
      if (!itemData) return line; // fallback if not found

      // Find price based on new GroupNum (DocEntry)
      const matchingPriceLine = itemData.oLines.find(
        (p) => String(p.PriceList) === String(DocEntry),
      );

      const price = matchingPriceLine?.Price ?? 0;
      const qty = line.Quantity ?? 0;
      const total = price * qty;

      return {
        ...line,
        Price: price,
        PriceBefDi: price,
        DocTotal: total.toFixed(2),
      };
    });

    setValue("oLines", updatedLines, { shouldDirty: true });

    SearchModelClose();
  };

  //==========================================search button modal function==================================
  const handleClickOpen = () => {
    setOpen(true);
  };
  const closeModel = () => {
    setOpen(false);
    setSearchText("");
    setCurrentPage(0);
    setSelectedRows([]);
  };
  const ItemList = async ({ page = 0, search = "" }) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(
        `/ItemsV2?InventoryItem=Y&Status=1&SearchText=${search}&Page=${page}&Limit=20`,
      );
      const data = res.data;
      if (data.success === true) {
        const items = data?.values || [];
        console.log(items);
        setItemList(items);
        if (page !== 0 && items.length < 21) {
          setRowCount(page * 20 + items.length + 1);
        } else if (page === 0) {
          setRowCount(21); // Estimate to show pagination
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
  const handlePaginationModelChange = useCallback(
    (model) => {
      if (model.page !== currentPage) {
        setCurrentPage(model.page);
      }
    },
    [currentPage],
  );
  const handleSearchChange = useCallback((searchText) => {
    setSearchText(searchText);
    setCurrentPage(0);
  }, []);

  const handleCellClick = async (newSelectedIDs) => {
    const groupNum = getValues("GroupNum");
    const newIDs = new Set(newSelectedIDs);
    const prevIDs = new Set(selectedIDs);
    const onlyNewIDs = [...newIDs].filter((id) => !prevIDs.has(id));
    if (onlyNewIDs.length === 0) return;
    const newSelectedRows = itemList
      .filter((row) => onlyNewIDs.includes(row.DocEntry))
      .map((data) => {
        const matchingPriceLine = data.oLines.find(
          (item) => String(item.PriceList) === String(groupNum),
        );
        const price = matchingPriceLine?.Price ?? 0;
        const matchingWhs = data.oInvntLines?.find(
          (line) => line.WHSCode === data.DefaultWhs,
        );
        const whsQty = matchingWhs?.OnHand ?? 0;
        const matchingLoc = warehouseData.find(
          (row) => row.WHSCode === data.DefaultWhs,
        );
        return {
          ItemCode: data.ItemCode,
          ItemName: data.ItemName,
          Quantity: 1,
          PriceBefDi: price,
          Price: price,
          DocTotal: (price * 1).toFixed(2),
          WHSCode: data.DefaultWhs,
          OnHandBef: whsQty,
          IsCommited: data.IsCommited,
          DftBinAbs: matchingLoc?.DftBinAbs,
          BinActivat: matchingLoc?.BinActivat,
          BinCode: matchingLoc?.BinLocation,
          UoMCode:
            data.UgpEntry === "-1"
              ? "Manual"
              : data.UOMCode === "0"
                ? ""
                : data.UOMCode,
          AcctCode: data.AcctCode,
          ManBtchNum: data.ManBtchNum,
          ManSerNum: data.ManSerNum,
          oLines: data.oLines.map((item) => ({
            Price: item.Price,
            PriceList: item.PriceList,
          })),
          DocEntry: data.DocEntry,
        };
      });

    setSelectedIDs((prev) => new Set([...prev, ...onlyNewIDs]));
    setSelectedRows((prevRows) => [...prevRows, ...newSelectedRows]);

    // for (const row of newSelectedRows) {
    //   setBinCodeGetListData([]);
    //   await fetchBinCodeGetListData(row.WHSCode, 0, "");
    // }
  };

  const onSubmit = () => {
    const allFormData = getValues();

    const updatedData = {
      ...allFormData,
      oLines: [...(allFormData.oLines || []), ...selectedRows],
    };

    reset(updatedData);
    setSelectedRows([]); // Reset for next modal use
    setSelectedIDs(new Set()); // Reset selection IDs
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
    console.log("ff", UpdatedoBatchLines);
    setValue("oLines", UpdatedoBatchLines);
  };

  const testt = async () => {
    const formValues = getValues();
    const allOlines = formValues.oLines || [];

    const newRowsCount = selectedRows.length;
    const existingRowsCount = allOlines.length - newRowsCount;

    const updatedLines = allOlines.map((data, index) => {
      if (index < existingRowsCount) {
        // Return existing rows unchanged
        return data;
      }

      const selectedItemIndex = index - existingRowsCount;
      const selectedRow = selectedRows[selectedItemIndex];

      const selectedLine = selectedRow?.oLines.find(
        (line) => line.PriceList === formValues.GroupNum,
      );

      // const matchedWarehouse = getListDataWarehouse.find(
      //   (wh) => wh.WHSCode === data.WHSCode
      // );

      return {
        ...data,
        DocTotal: selectedLine?.Price * data.Quantity || 0,
        PriceBefDi: selectedLine?.Price || 0,
        // LocCode: matchedWarehouse?.LocationName || "",
      };
    });

    reset({ ...formValues, oLines: updatedLines });
  };

  //=============================================warehouse field modal(datagrid field)=========================
  const fetchWhscGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setLoading(true); // 🔄 start loader (if you have one)

      const url = searchTerm?.trim()
        ? `/WarehouseV2/search/${searchTerm.trim()}/1/${pageNum}`
        : `/WarehouseV2/pages/1/${pageNum}`;

      const response = await apiClient.get(url);

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        setWhsHasMoreGetList(newData.length === 20);

        setWhscGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          icon: "info",
          text: response?.data?.message || "Failed to load warehouse data.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching warehouse data:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch warehouse data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false); // ✅ stop loader always
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
  const selectWhSCode = async (WHSCode, BinCode, DftBinAbs, BinActivat) => {
    const currentRowIndex = getValues("selectedRowIndex");
    const allLines = getValues("oLines");
    const currentLine = allLines[currentRowIndex];

    const matchedItem = itemList.find(
      (item) => item.ItemCode === currentLine.ItemCode,
    );

    const matchingInventory = matchedItem?.oInvntLines?.find(
      (inv) => inv.WHSCode === WHSCode,
    );
    const newOnHandBef = matchingInventory?.OnHand ?? 0;
    const updatedLines = allLines.map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          WHSCode: WHSCode,
          OnHandBef: newOnHandBef,
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

    await fetchBinCodeGetListData(WHSCode, 0, "");
    setWhscOpen(false);
  };

  const fetchBinCodeGetListData = async (
    WHSCode,
    pageNum = 0,
    searchTerm = "",
  ) => {
    try {
      setLoading(true); // 🔄 start loader (if you have one)

      if (!WHSCode) {
        setBinCodeGetListData([]);
        setBinCodeHasMoreGetList(false);
        return;
      }

      const { data } = await apiClient.get("/BinLocationV2/GetByWHSCode", {
        params: {
          WHSCode,
          Status: 1,
          Page: pageNum,
          Limit: 20,
          SearchText: searchTerm?.trim() || undefined,
        },
      });

      if (data?.success) {
        let newData = data.values ?? [];

        // Client-side filter (extra safety if API search is inconsistent)
        if (searchTerm?.trim()) {
          const lowerSearch = searchTerm.toLowerCase();
          newData = newData.filter(
            (item) =>
              item?.BinCode?.toLowerCase().includes(lowerSearch) ||
              item?.BinName?.toLowerCase().includes(lowerSearch),
          );
        }

        const pageSize = 20;
        const paginatedData = newData.slice(
          pageNum * pageSize,
          (pageNum + 1) * pageSize,
        );

        setBinCodeHasMoreGetList(paginatedData.length === pageSize);

        setBinCodeGetListData((prev) =>
          pageNum === 0 ? paginatedData : [...prev, ...paginatedData],
        );
      } else {
        Swal.fire({
          icon: "info",
          text:
            data?.message ||
            "No bin locations found for the selected warehouse.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching BinCode data:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Error fetching BinCode data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false); // ✅ stop loader always
    }
  };

  const handleBinCodeGetListSearch = (res) => {
    setBinCodeGetListQuery(res);
    setBinCodeGetListSearching(true);
    setBinCodeGetListPage(0);
    setBinCodeGetListData([]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // ✅ Fix: Use correct WHSCode
      const currentRowIndex = getValues("selectedRowIndex");
      const allLines = getValues("oLines");
      const currentWHSCode = allLines[currentRowIndex]?.WHSCode;

      if (currentWHSCode) {
        fetchBinCodeGetListData(currentWHSCode, 0, res);
      }
    }, 600);
  };

  const handleBinCodeGetListClear = () => {
    setBinCodeGetListQuery("");
    setBinCodeGetListSearching(false);
    setBinCodeGetListPage(0);
    setBinCodeGetListData([]);

    const currentRowIndex = getValues("selectedRowIndex");
    const allLines = getValues("oLines");
    const currentWHSCode = allLines[currentRowIndex]?.WHSCode;

    if (currentWHSCode) {
      fetchBinCodeGetListData(currentWHSCode, 0, "");
    }
  };
  const fetchBinCodeMoreGetListData = () => {
    fetchBinCodeGetListData(
      BinCodegetListPage + 1,
      BinCodegetListSearching ? BinCodegetListquery : "",
    );
    setBinCodeGetListPage((prev) => prev + 1);
  };
  const selectBinCode = async (BinCode, DftBinAbs) => {
    const currentRowIndex = getValues("selectedRowIndex");
    const allLines = getValues("oLines");

    // Update the line with WHSCode and OnHandBef
    const updatedLines = allLines.map((line, index) => {
      if (index === currentRowIndex) {
        return {
          ...line,
          BinCode: BinCode,
          DftBinAbs,
        };
      }
      return line;
    });

    reset({
      ...allFormData,
      oLines: updatedLines,
    });

    setBinCodeOpen(false);
  };
  //=============================================warehouse field modal(datagrid field)=========================
  const fetchGLAcctGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setLoading(true); // 🔄 start loader (if you have one)

      const url = searchTerm?.trim()
        ? `/ChartOfAccounts/Search/${searchTerm.trim()}/1/${pageNum}`
        : `/ChartOfAccounts/Pages/1/${pageNum}`;

      const response = await apiClient.get(url);

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        setGLAcctHasMoreGetList(newData.length === 20);

        setGLAcctGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          icon: "info",
          text: response?.data?.message || "Failed to load GL Account list.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching GL Account list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch GL Account data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false); // ✅ stop loader always
    }
  };

  const handleGLAcctGetListSearch = (res) => {
    setGLAcctGetListQuery(res);
    setGLAcctGetListSearching(true);
    setGLAcctGetListPage(0);
    setGLAcctGetListData([]);
    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchGLAcctGetListData(0, res);
    }, 600);
  };

  const handleGLAcctGetListClear = () => {
    setGLAcctGetListQuery("");
    setGLAcctGetListSearching(true);
    setGLAcctGetListPage(0); // Reset page to 0
    setGLAcctGetListData([]); // Clear current data
    fetchGLAcctGetListData(0); // Fetch first page without search
  };
  const fetchGLAcctMoreGetListData = () => {
    fetchGLAcctGetListData(
      GLAcctgetListPage + 1,
      GLAcctgetListSearching ? GLAcctgetListquery : "",
    );
    setGLAcctGetListPage((prev) => prev + 1);
  };
  const selectGLAcctCode = async (AcctCode, AcctName) => {
    // Get the currently selected row's index
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
    // Reset form with updated lines
    reset({
      ...allFormData,
      oLines: updatedLines,
    });
    setGLAcctOpen(false);
  };
  //=======================================Initial form Data======================================
  const initialFormData = {
    DocDate: dayjs(undefined).format("YYYY-MM-DD"),
    TaxDate: dayjs(undefined).format("YYYY-MM-DD"),
    PriceSrc: "1",
    DocNum: "",
    Reference: "",
    Series: "",
    Comments: "",
    JrnlMemo: "",
    TotalWhsStock: "",
    TotalOpenBal: "",
    DocTotal: "",
    FinncPriod: "",
    PIndicator: "",
    oLines: [],
  };

  //=============================================Useform=======================================
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
  const { isDirty } = useFormState({ control });
  const allFormData = getValues();
  const currentData = getValues();
  const ClearForm = () => {
    reset(initialFormData);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    setBinCodeGetListData([]);
    setDocEntry("");
    clearFiles();

    const defaultPriceList = getListDataPriceList?.[0];
    if (defaultPriceList) {
      setValue("GroupNum", defaultPriceList.DocEntry);
      setValue("GroupNumName", defaultPriceList.ListName);
      setValue("Series", DocSeries[0]?.SeriesId ?? "");
      setValue("FinncPriod", DocSeries[0]?.FinncPriod ?? "");
      setValue("PIndicator", DocSeries[0]?.Indicator ?? "");
      setValue("DocNum", DocSeries[0]?.DocNum ?? "");
    }
  };

  //===========================================Main datagrid column===============================
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
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
  const canOpenOnKey = (value, disabled) => {
    return !disabled && !value;
  };

  const Items = [
    {
      id: 1,
      field: "ItemCode",
      headerName: "ITEM NO",
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      id: 2,
      field: "ItemName",
      headerName: "ITEM DESC",
      width: 150,
      sortable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "WHSCode",
      headerName: "WHSCode",
      width: 180,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const disabled = params.row.Status === "0";

        const openModal = () => {
          if (disabled) return; // 👈 click always allowed if not disabled
          setValue("selectedRowIndex", params.row.id);
          setWhscOpen(true);
        };

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
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

                // ⌨️ keyboard ONLY if empty
                if (canOpenOnKey(params.row.WHSCode, disabled)) {
                  openModal();
                }
              }
            }}
            sx={{ width: "100%", height: "100%" }}
          >
            <Grid item xs>
              <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                {params.row.WHSCode || ""}
              </Typography>
            </Grid>

            <Grid item>
              <IconButton
                size="small"
                disabled={disabled} // ✅ NOT disabled when value exists
                onClick={openModal} // 🖱️ always opens
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
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
    },
    {
      field: "BinCode",
      headerName: "Bin Location",
      width: 300,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const disabled =
          SaveUpdateName === "UPDATE"
            ? (params.row.oDocBinLocationLines || []).length === 0
            : params.row.Status === "0" ||
              Number(params.row.DftBinAbs) < 0 ||
              params.row.BinActivat !== "Y";

        const openModal = () => {
          if (disabled) return;
          setValue("selectedRowIndex", params.row.id);
          setBinCodeOpen(true);
          fetchBinCodeGetListData(params.row.WHSCode, 0);
        };

        return (
          <Grid container alignItems="center" justifyContent="center" gap={0.5}>
            <Grid item xs>
              <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                {params.row.BinCode || ""}
              </Typography>
            </Grid>

            <Grid item>
              <IconButton
                size="small"
                disabled={disabled} // ✅ value does NOT disable
                onClick={openModal} // 🖱️ always opens
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
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
      field: "OnHandBef",
      headerName: "IN WAREHOUSE",
      width: 140,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "Quantity",
      headerName: "Opening Balance",
      width: 150,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "Price",
      headerName: "Unit Price",
      width: 150,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "DocTotal",
      headerName: "TOTAL",
      type: "number",
      width: 120,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : TwoFormatter(value, 2)),
    },
    {
      field: "AcctCode",
      headerName: "Account Code",
      width: 180,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const disabled = params.row.Status === "0";

        const openModal = () => {
          if (disabled) return;
          setValue("selectedRowIndex", params.row.id);
          setGLAcctOpen(true);
        };

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
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

                // ⌨️ only when empty
                if (canOpenOnKey(params.row.AcctCode, disabled)) {
                  openModal();
                }
              }
            }}
            sx={{ width: "100%", height: "100%" }}
          >
            <Grid item xs>
              <Typography noWrap textAlign="center" sx={{ fontSize: 13 }}>
                {params.row.AcctCode || ""}
              </Typography>
            </Grid>

            <Grid item>
              <IconButton
                size="small"
                disabled={disabled} // ✅ not disabled by value
                onClick={openModal} // 🖱️ always opens
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
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
    //   field: "AcctCode",
    //   headerName: "Account Code",
    //   width: 180,
    //   sortable: false,
    //   editable: false,
    //   headerAlign: "center",
    //   align: "center",
    //   renderCell: (params) => {
    //     return (
    //       <Controller
    //         name={`AcctCode_${params.row.id}`} // Unique name per row
    //         control={control}
    //         render={({ field, fieldState: { error } }) => (
    //           <InputTextField
    //             {...field}
    //             name={`AcctCode_${params.row.id}`}
    //             value={field.value || params.value || ""}
    //             onChange={(e) => {
    //               field.onChange(e); // Update form state
    //               // handleChange(e, params.row);
    //             }}
    //             sx={{ width: 160 }}
    //             readOnly
    //             error={!!error}
    //             helperText={error?.message}
    //             InputProps={{
    //               endAdornment: (
    //                 <InputAdornment position="end">
    //                   <IconButton
    //                     onClick={() => {
    //                       setValue("selectedRowIndex", params.row.id);
    //                       setGLAcctOpen(true);
    //                     }}
    //                     disabled={params.row.Status === "0"}
    //                     size="small"
    //                     color="primary"
    //                     style={{
    //                       backgroundColor: "green",
    //                       borderRadius: "10%",
    //                       color: "white",
    //                       padding: 2,
    //                     }}
    //                   >
    //                     <ViewListIcon />
    //                   </IconButton>
    //                 </InputAdornment>
    //               ),
    //             }}
    //           />
    //         )}
    //       />
    //     );
    //   },
    // },
    {
      field: "Sr.batch",
      headerName: "Sr & Batch",
      width: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const { ManBtchNum, ManSerNum, BaseType, UoMCode, WHSCode } =
          params.row;
        let iconColor = "default";
        let disabled = false;
        // Determine icon color based on batch/serial status
        if (ManBtchNum === "Y" && ManSerNum === "N") {
          iconColor = "primary";
        } else if (ManBtchNum === "N" && ManSerNum === "Y") {
          iconColor = "success";
        } else if (ManBtchNum === "N" && ManSerNum === "N") {
          iconColor = "default";
          disabled = true;
        }
        if (BaseType === 21) {
          disabled = true;
        }
        const handleClick = () => {
          if (!UoMCode || !WHSCode) {
            Swal.fire({
              toast: true,
              icon: "warning",
              title:
                "Please select UoM and Warehouse Code before Creating Serial and Batch.",
              position: "center",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });

            return;
          }

          if (ManBtchNum === "Y" && ManSerNum === "N") {
            handleOnBatch(params.row);
          } else if (ManBtchNum === "N" && ManSerNum === "Y") {
            handleOnSerial(params.row);
          }
        };

        return (
          <IconButton
            color={iconColor}
            onClick={handleClick}
            sx={{ borderRadius: "6px", padding: "4px" }}
            disabled={disabled}
          >
            <ViewListIcon />
          </IconButton>
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

  const handleOnSerial = (rowData) => {
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      Quantity: rowData.Quantity,
      WHSCode: rowData.WHSCode,
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
    if (rowData.Quantity > 0) {
      setopenserial(true);
    } else {
      setopenOutserial(true);
    }
  };

  const handleOnBatch = (rowData) => {
    setSelectedItem({
      ItemCode: rowData.ItemCode,
      ItemName: rowData.ItemName,
      Quantity: rowData.Quantity,
      WHSCode: rowData.WHSCode,
      BaseType: rowData.BaseType,
      BaseEntry: rowData.BaseEntry,
      BaseNum: rowData.BaseNum,
      BaseLinNum: rowData.BaseLinNum,
      CardCode: rowData.CardCode,
      CardName: rowData.CardName,
      BinCode: rowData.BinCode,
      id: rowData.id,
    });
    if (rowData.Quantity > 0) {
      setopenBatch(true);
    } else {
      setopenOutBatch(true);
    }
  };
  // const handleChange = (rowId, field, value) => {
  //   const updatedLines = getValues("oLines").map((line, index) => {
  //     if (index !== rowId) return line; // Only update the row where rowId matches

  //     const updatedLine = { ...line, [field]: value };
  //     if (field === "Quantity") {
  //       updatedLine.Quantity = value;

  //       // if (
  //       //   updatedLine.ManBtchNum === "Y" &&
  //       //   updatedLine.oBatchLines?.length > 0
  //       // ) {
  //       //   const totalBatchQty = updatedLine.oBatchLines.reduce(
  //       //     (sum, b) => sum + Number(b.BatchQty || 0),
  //       //     0
  //       //   );
  //       //   if (totalBatchQty !== updatedLine.Quantity) {
  //       //     Swal.fire({
  //       //       icon: "warning",
  //       //       title: "Batch quantity mismatch",
  //       //       text: `Batch total (${totalBatchQty}) must match Quantity (${TwoFormatter(
  //       //         updatedLine.Quantity
  //       //       )})`,
  //       //       confirmButtonText: "OK",
  //       //     });
  //       //   }
  //       // }
  //       // if (
  //       //   updatedLine.ManSerNum === "Y" &&
  //       //   updatedLine.oSerialLines?.length > 0
  //       // ) {
  //       //   if (updatedLine.oSerialLines.length !== updatedLine.Quantity) {
  //       //     Swal.fire({
  //       //       icon: "warning",
  //       //       title: "Serial quantity mismatch",
  //       //       text: `Serial count (${
  //       //         updatedLine.oSerialLines.length
  //       //       }) must match Quantity (${TwoFormatter(updatedLine.Quantity)})`,
  //       //       confirmButtonText: "OK",
  //       //     });
  //       //   }
  //       // }
  //     }

  //     const price =
  //       parseFloat(field === "Price" ? value : updatedLine.Price) || 0;
  //     updatedLine.DocTotal = (updatedLine.Quantity * price).toFixed(2); // Calculate DocTotal

  //     return updatedLine;
  //   });

  //   reset({
  //     ...getValues(),
  //     oLines: updatedLines,
  //   });
  // };
  const processRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...oldRow, ...newRow };

    const qty = Number(updatedRow.Quantity || 0);
    const price = Number(updatedRow.Price || 0);

    updatedRow.Quantity = qty;
    updatedRow.Price = price;
    updatedRow.DocTotal = ValueFormatter(qty * price);

    const updatedLines = getValues("oLines").map((line, i) =>
      i === oldRow.id ? updatedRow : line,
    );

    reset({
      ...getValues(),
      oLines: updatedLines,
    });

    return updatedRow;
  };

  const handleDeleteRow = (id) => {
    const updatedRows = currentData.oLines.filter((_, index) => index !== id);
    const updatedData = {
      ...currentData,
      oLines: updatedRows,
    };

    // Reset the form with the updated data
    reset(updatedData);
  };

  //===================================All other API for fields======================================

  const { DocSeries } = useDocumentSeries(
    "310000001",
    getValues("DocDate"),
    setValue,
    clearCache,
    SaveUpdateName,
  );

  //==============================Left Side Main List=================================================

  const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setLoading(true); // 🔄 start loader (if you have one)

      const url = searchTerm?.trim()
        ? `/InventoryOpeningBalance/Search/${searchTerm.trim()}/1/${pageNum}/20`
        : `/InventoryOpeningBalance/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response?.data?.success) {
        const newData = response.data.values ?? [];

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          icon: "info",
          text:
            response?.data?.message || "Failed to load opening balance list.",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching opening balance list:", error);

      Swal.fire({
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to fetch opening balance data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false); // ✅ stop loader always
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

  const validateAllLines = (lines) => {
    const errors = [];
    const errorIds = [];
    lines.forEach((line, index) => {
      const lineNo = index + 1;
      const rowId = line.id ?? index;

      // 🔴 Quantity
      // if (Number(line.Quantity) <= 0) {
      //   errors.push(
      //     `Line ${lineNo}: ${line.ItemCode} (Quantity must be greater than zero)`
      //   );
      //   errorIds.push(rowId);
      // }

      // // 🔴 Price
      // if (Number(line.Price) <= 0) {
      //   errors.push(
      //     `Line ${lineNo}: ${line.ItemCode} (Unit Price must be greater than zero)`
      //   );
      //   errorIds.push(rowId);
      // }

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
  //========================================POST and PUT API====================================
  const handleSubmitForm = async (data) => {
    if (getValues("oLines").length === 0) {
      Swal.fire({
        title: "Select Item",
        text: "Please Select The Item  ",
        icon: "warning",
        confirmButtonText: "Ok",
        // timer: 3000,
      });
      return;
    }
    const seen = new Set();
    let duplicateItemCode = null;

    const hasDuplicate = data.oLines.some((line) => {
      const key = `${line.ItemCode}-${line.WHSCode}`;
      if (seen.has(key)) {
        duplicateItemCode = line.ItemCode;
        return true;
      }
      seen.add(key);
      return false;
    });

    if (hasDuplicate) {
      Swal.fire({
        title: "Duplicate Entry",
        text: `Item "${duplicateItemCode}" is selected with the same Warehouse more than once. Please change the warehouse or item.`,
        icon: "warning",
        confirmButtonText: "Ok",
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
      DocEntry: data.DocEntry || "0",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: "1",
      DocDate: dayjs(data.DocDate || undefined).format("YYYY-MM-DD"),
      TaxDate: dayjs(data.TaxDate || undefined).format("YYYY-MM-DD"),
      PriceSrc: data.PriceSrc || "0",
      DocNum: String(data.DocNum || ""),
      Reference: data.Reference || "",
      IOffIncAcc: data.IOffIncAcc || "",
      AttcEntry: attachmentDocEntry,
      DOffDecAcc: data.DOffDecAcc || "",
      Comments: String(data.Comments || ""),
      DocDueDate: data.DocDueDate || dayjs().format("YYYY-MM-DD"),
      JdtNum: data.JdtNum || "0",
      Reference2: data.Ref2 || "",
      ObjType: data.ObjType || "0",
      Series: String(data.Series || ""),
      PriceList: String(data.GroupNum || "0"),
      JrnlMemo: String(data.JrnlMemo || ""),
      DocTotal: String(data.DocTotal || "0"),
      FinncPriod: String(data.FinncPriod || "0"),
      PIndicator: data.PIndicator || "0",
      oLines: (data.oLines || []).map((item, index) => {
        return {
          LineNum: String(index),
          DocEntry: data.DocEntry || "0",
          UserId: item.UserId || user.UserId,
          CreatedBy: item.CreatedBy || user.UserName,
          CreatedDate: dayjs().format("YYYY-MM-DD"),
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          Status: item.Status || "1",
          ItemCode: String(item.ItemCode),
          BinCode: String(item.BinCode),
          BinEntry: String(item.DftBinAbs || 0),
          ItemName: String(item.ItemName),
          WHSCode: String(item.WHSCode || "0"),
          OnHandBef: String(item.OnHandBef || "0"),
          Quantity: String(item.Quantity),
          Price: String(item.Price || "0"),
          DocTotal: String(item.DocTotal || "0"),
          AcctCode: String(item.AcctCode),
          Comments: item.Comments || "",
          JrnlMemo: item.JrnlMemo || "",
          InvntryUom: String(item.unitMsr || ""),
          Currency: data.DocCur || "",
          Rate: String(data.DocRate || "1"),
          IOffIncAcc: item.IOffIncAcc || "",
          DOffDecAcc: item.DOffDecAcc || "",
          DocTotalFC: item.DocTotalFC || "0",
          DocTotalSy: item.DocTotalSy || "0",
          ObjType: data.ObjType || "0",
          BarCode: item.CodeBars || "",
          InvUoM: item.UomCode2 || "",
          InvUoMQty: String(item.InvQty || "0"),
          SuppCatNum: item.SuppCatNum || "",
          CardCode: item.CardCode || "",
          Location: "0",
          ItmsGrpCod: item.ItmsGrpCod || "",
          ActPrice: String(item.StockPrice || "0"),
          PostValueL: item.PostValueL || "0",
          PostValueS: item.PostValueS || "0",
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
            BaseType: "20",
            BaseEntry: data.BaseEntry || "-1",
            BaseNum: data.DocNum || "-1",
            BaseLinNum: serialItem.BaseLinNum || "-1",
            CreateDate: dayjs(undefined).format("YYYY-MM-DD"),
            Direction: serialItem?.Direction ?? "1",
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
            Notes: BatchItem?.Notes ?? "",
            Quantity: String(BatchItem.BatchQty || "1"),
            BaseType: "20",
            BaseEntry: BatchItem.BaseEntry || "-1",
            BaseLinNum: BatchItem.BaseLinNum || "-1",
            CreateDate: dayjs(undefined).format("YYYY-MM-DD"),
            Direction: BatchItem?.Direction ?? "1",
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

      oBal2Lines: (data.oBal2Lines || []).map((bal, index) => ({
        LineNum: String(index),
        DocEntry: data.DocEntry || "0",
        UserId: bal.UserId || user.UserId,
        CreatedBy: bal.CreatedBy || user.UserName,
        CreatedDate: dayjs().format("YYYY-MM-DD"),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs().format("YYYY-MM-DD"),
        Status: bal.Status || "1",
        SnbIndex: bal.SnbIndex || "",
        ItemCode: String(bal.ItemCode),
        WHSCode: String(bal.WHSCode),
        ObjId: bal.ObjId || "",
        ObjAbs: bal.ObjAbs || "",
        DrfWObjAbs: bal.DrfWObjAbs || "",
        Quantity: String(bal.Quantity),
        SubLineNum: String(bal.SubLineNum || "0"),
        ObjType: data.ObjType || "0",
        TakerType: bal.TakerType || "",
      })),
    };

    if (SaveUpdateName === "SAVE") {
      setLoading(true);
      apiClient
        .post(`/InventoryOpeningBalance`, obj)
        .then((res) => {
          if (res.data.success) {
            setLoading(false);
            ClearForm();
            setOpenListData([]);
            fetchOpenListData(0);
            setClearCache(true);

            Swal.fire({
              title: "Success!",
              text: "Opening Balance saved Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            setLoading(false);
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
          console.error("Error Post time", error);
          if (attachmentDocEntry > 0) {
            apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          }
          setLoading(false);
          Swal.fire({
            title: "Error!",
            text: error || "something went wrong",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else {
      Swal.fire({
        text: `Do You want to Update ?`,
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
          setLoading(true);
          apiClient
            .put(`/InventoryOpeningBalance/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                setLoading(false);
                setOpenListData([]);
                setOpenListPage(0);
                fetchOpenListData(0);
                setClearCache(true);

                Swal.fire({
                  title: "Success!",
                  text: "Opening Balance Updated",
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
              setLoading(false);
              Swal.fire({
                title: "Error!",
                text: "something went wrong",
                icon: "warning",
                confirmButtonText: "Ok",
              });
            });
        } else {
          Swal.fire({
            text: " Opening Balance Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  //==========================================set Data to fields=======================================
  const setOldOpenData = async (DocEntry) => {
    setok("");
    try {
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
          if (!Data.isConfirmed) {
            return;
          }
          setSelectedData(DocEntry);
          fetchAndSetData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        fetchAndSetData(DocEntry);
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
  const fetchAndSetData = async (DocEntry) => {
    if (!DocEntry) {
      return;
    }

    try {
      const response = await apiClient.get(
        `/InventoryOpeningBalance/${DocEntry}`,
      );
      const data = response.data.values;

      toggleDrawer();
      reset(data);

      const selectedObj = getListDataPriceList.find(
        (item) => item.DocEntry === data.PriceList,
      );
      if (!selectedObj) return;

      setValue("GroupNum", selectedObj.DocEntry);
      setValue("GroupNumName", selectedObj.ListName);
      setFilesFromApi(data.AttcEntry);
      setDocEntry(data.DocEntry);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } catch (error) {
      console.error("Error fetching data:", error);

      // SweetAlert for error in the catch block
      Swal.fire({
        title: "Error!",
        text: "An error occurred while fetching the data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  //===============================================UseEffect====================================
  useEffect(() => {
    fetchOpenListData(0);
    fetchWhscGetListData(0);
    // fetchBinCodeGetListData(0);
    fetchGLAcctGetListData(0);
  }, []);

  useEffect(() => {
    const initPriceList = async () => {
      const result = await fetchGetListDataPriceList(0);
      if (result.length > 0) {
        const defaultPriceList = result[0];
        setValue("GroupNum", defaultPriceList.DocEntry, { shouldDirty: true });
        setValue("GroupNumName", defaultPriceList.ListName, {
          shouldDirty: true,
        });
      }
    };

    initPriceList();
  }, []);

  useEffect(() => {
    ItemList({ page: currentPage, search: searchText });
  }, [currentPage, searchText]);

  const oLines = watch("oLines");

  useEffect(() => {
    if (!oLines || !Array.isArray(oLines)) return;

    const totalWhsStock = oLines.reduce(
      (sum, row) => sum + Number(row.OnHandBef || 0),
      0,
    );
    const totalOpenBal = oLines.reduce(
      (sum, row) => sum + Number(row.Quantity || 0),
      0,
    );
    const DocTotal = oLines.reduce(
      (sum, row) => sum + Number(row.DocTotal || 0),
      0,
    );

    setValue("TotalWhsStock", totalWhsStock);
    setValue("TotalOpenBal", totalOpenBal);
    setValue("DocTotal", DocTotal);
  }, [oLines, setValue]);

  //====================================Sidebar Cotent==========================================
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
          Opening Balance List
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setDrawerOpen(false)}
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
        <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
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
                  title={item.DocNum}
                  subtitle={item.DocDate?.split(" ")[0]}
                  description={item.DocTotal}
                  searchResult={openListquery}
                  isSelected={selectedData === item.DocEntry}
                  onClick={() => setOldOpenData(item.DocEntry)}
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
      {loading && <Loader open={loading} />}

      <SerialIntake
        Title="SERIAL NUMBER"
        openserialmodal={openserial}
        DialogClosePayto={handleCloseSerial}
        onSubmit={(serialData) => onsubmitSeriel(serialData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={ValueFormatter(selectedItem?.Quantity, 0)}
        WhsCode={selectedItem?.WHSCode}
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
      <SerialOuttake
        Title="SERIAL NUMBER"
        openserialmodal={openOutserial}
        DialogClosePayto={handleCloseOutSerial}
        onSubmit={(serialData) => onsubmitSeriel(serialData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={ValueFormatter(selectedItem?.Quantity, 0)}
        WHSCode={selectedItem?.WHSCode}
        OpenQuantity={selectedItem?.OpenQuantity}
        BaseEntry={selectedItem?.BaseEntry}
        BaseType={selectedItem?.BaseType}
        Ids={selectedItem?.id}
      />
      <BatchOuttake
        Title="BATCH NUMBER"
        openBatchmodal={openOutBatch}
        DialogClosePayto={handleOutCloseBatch}
        onSubmit={(BatchData) => onsubmitBatch(BatchData)}
        ItemCode={selectedItem?.ItemCode}
        ItemName={selectedItem?.ItemName}
        Quantity={selectedItem?.Quantity}
        WHSCode={selectedItem?.WHSCode}
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
        WHSCode={selectedItem?.WHSCode}
        BinCode={selectedItem?.BinCode}
        oBatchLines={selectedItem?.oBatchLines ?? []}
        Ids={selectedItem?.id}
      />

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
                onClick={() => {
                  selectWhSCode(
                    item.WHSCode,
                    item.BinLocation,
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
        open={openBinCode}
        onClose={() => setBinCodeOpen(false)}
        onCancel={() => setBinCodeOpen(false)}
        title="Bin Location"
        onChange={(e) => handleBinCodeGetListSearch(e.target.value)}
        value={BinCodegetListquery}
        onClickClear={handleBinCodeGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={BinCodegetListData.length}
            next={fetchBinCodeMoreGetListData}
            hasMore={BinCodehasMoreGetList}
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
            {BinCodegetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.BinCode}
                // subtitle={item.WHSName}
                searchResult={BinCodegetListquery}
                onClick={() => {
                  selectBinCode(item.BinCode, item.DocEntry);
                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <SearchModel
        open={openGLAcct}
        onClose={() => setGLAcctOpen(false)}
        onCancel={() => setGLAcctOpen(false)}
        title="Accounts"
        onChange={(e) => handleGLAcctGetListSearch(e.target.value)}
        value={GLAcctgetListquery}
        onClickClear={handleGLAcctGetListClear}
        cardData={
          <InfiniteScroll
            style={{ textAlign: "center", justifyContent: "center" }}
            dataLength={GLAcctcgetListData.length}
            next={fetchGLAcctMoreGetListData}
            hasMore={GLAccthasMoreGetList}
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
            {GLAcctcgetListData.map((item) => (
              <CardComponent
                key={item.DocEntry}
                title={item.AcctCode}
                subtitle={item.AcctName}
                searchResult={GLAcctgetListquery}
                onClick={() => {
                  selectGLAcctCode(item.AcctCode, item.AcctName);
                  //  CloseVendorModel(); // Close after selection if needed
                }}
              />
            ))}
          </InfiniteScroll>
        }
      />
      <DataGridModal
        open={open}
        closeModel={closeModel}
        onSubmit={() => {
          onSubmit();
          testt();
        }}
        isLoading={isLoading}
        title="Item List"
        getRowId={(row) => row.DocEntry}
        columns={ItemColumn}
        rows={itemList}
        currentPage={currentPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onRowSelectionModelChange={handleCellClick}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        oLines={getValues("oLines")}
      />
      <SearchModel
        open={searchmodelOpenPriceList}
        onClose={SearchModelClose}
        onCancel={SearchModelClose}
        title="Price List"
        onChange={(e) => handleGetListSearchPriceList(e.target.value)}
        value={getListqueryPriceList}
        onClickClear={handleGetListClearPriceList}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataPriceList.length}
              next={fetchMoreGetListDataPriceList}
              hasMore={hasMoreGetListPriceList}
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
              {getListDataPriceList.map((item, index) => (
                <CardComponent
                  key={index}
                  title={item.ListName}
                  subtitle={item.DocEntry}
                  description={item.CreatedBy}
                  searchResult={getListqueryPriceList}
                  onClick={() => {
                    onSelectRequestPriceList(item.DocEntry);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={3}
          md={3}
          display={{ xs: "none", lg: "flex" }}
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
          // component="form"
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

              // top: "10px",

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
              Inventory Opening Balance
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
                // component="form"
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
                          disabled={SaveUpdateName === "UPDATE"}
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
                      name="TaxDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="DOCUMENT DATE"
                          name={field.name}
                          disabled={SaveUpdateName === "UPDATE"}
                          value={field.value ? dayjs(field.value) : undefined}
                          minDate={getValues("DocDate")}
                          onChange={(date) =>
                            setValue("DocDueDate", date, { shouldDirty: true })
                          }
                          //  disabled={
                          //    !getValues("DocDate") ||
                          //    allFormData.Status === "Closed" ||
                          //    allFormData.Status === "Cancelled"
                          //  }
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="PriceSrc"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="PRICE SOURCE"
                          data={[{ key: "1", value: "BY PRICE LIST" }]}
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
                      name="GroupNumName"
                      control={control}
                      defaultValue="" // Static default value
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButtonTable
                          disabled={SaveUpdateName === "UPDATE"}
                          readOnly
                          label="PRICE LIST"
                          onClick={() => {
                            OpenDailog();
                            handleGetListClearPriceList();
                          }}
                          {...field}
                          data={getListDataPriceList}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Reference"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          inputProps={{ maxLength: 11 }}
                          label="REF NO."
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />{" "}
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
                      disabled={SaveUpdateName === "UPDATE"}
                    >
                      Search Item
                    </Button>
                  </Grid>
                </Grid>

                <Grid container width={"100%"}>
                  <Grid
                    container
                    item
                    width="100%"
                    m={1}
                    // border="1px solid grey"
                  >
                    {/* <Tabs
                      sx={{ width: "100%" }}
                      value={tabvalue}
                      onChange={handleTabChange}
                      aria-label="tabs example"
                    > */}
                    {/* <Tab value={0} label="Contents" /> */}
                    {/* <Tab value={1} label="Logistics" /> */}
                    {/* <Tab value={2} label="Attachments" /> */}
                    {/* </Tabs> */}
                    <Divider />

                    <Grid item xs={12}>
                      {/* {tabvalue === 0 && ( */}
                      <Grid
                        container
                        item
                        sx={{
                          overflow: "auto",
                          width: "100%",
                          height: "50vh",
                          // minHeight: "300px",
                          // maxHeight: "500px",
                          mt: "5px",
                        }}
                      >
                        <DataGrid
                          className="datagrid-style"
                          apiRef={apiRef}
                          rows={getValues("oLines").map((data, index) => ({
                            ...data,
                            id: index,
                          }))}
                          // rows={allFormData.oLines.map(())}
                          getRowId={(row) => row.id}
                          experimentalFeatures={{ newEditingApi: true }}
                          columns={Items}
                          columnHeaderHeight={35}
                          // rowHeight={45}
                          isRowSelectable={(params) =>
                            params.row.Status !== "0"
                          }
                          getRowClassName={(params) =>
                            SaveUpdateName === "UPDATE" ? "disabled-row" : ""
                          }
                          processRowUpdate={processRowUpdate}
                          onProcessRowUpdateError={(err) => console.error(err)}
                          editMode="cell"
                          onCellKeyDown={handleCellKeyDown}
                          // getRowClassName={(params) =>
                          //   params.row.Status === "0"
                          //     ? "disabled-row"
                          //     : "" || params.row.Status === "3"
                          //     ? "disabled-row"
                          //     : ""
                          // }

                          disableRowSelectionOnClick
                          sx={gridSx}
                        />
                      </Grid>
                      {/* )} */}
                    </Grid>

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
                    <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
                      <Controller
                        name="TotalWhsStock"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            label="TOTAL STOCK"
                            error={!!error}
                            readOnly
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
                      <Controller
                        name="TotalOpenBal"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            label="TOTAL OPENING BALANCE"
                            error={!!error}
                            readOnly
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} md={4} lg={4} textAlign={"center"}>
                      <Controller
                        name="DocTotal"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            label="TOTAL"
                            error={!!error}
                            readOnly
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
                          <InputTextField
                            {...field}
                            size="small"
                            label="REMARK"
                            placeholder="REMARK"
                            rows={2}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            multiline
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
                        name="JrnlMemo"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            size="small"
                            label="JOURNAL REMARK"
                            placeholder="JOURNAL REMARK"
                            rows={2}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
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
                    SaveUpdateName === "UPDATE"
                  }
                  color="success"
                  sx={{ color: "white" }}
                >
                  {SaveUpdateName}
                </Button>
              </Grid>
              <Grid item>
                {/* <Button variant="contained" color="error">
                  CANCEL
                </Button> */}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { lg: "none" }, // Show only on smaller screens

          "& .MuiDrawer-paper": {
            top: "70px",

            left: "75px",

            width: "80vw",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
