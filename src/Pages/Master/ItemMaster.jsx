import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
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
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField,
  InputTextSearchField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import { SearchModel2 } from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { useGridApiRef } from "@mui/x-data-grid";
import { GridToolbarExport } from "@mui/x-data-grid";
dayjs.extend(utc);
dayjs.extend(timezone);

const usePriceMap = () => {
  const [priceMap, setPriceMap] = useState({});

  const updatePriceMap = useCallback((newMap) => {
    setPriceMap(newMap);
  }, []);

  const setPriceForList = useCallback((listName, price, rows = []) => {
    setPriceMap((prev) => ({
      ...prev,
      [listName]: {
        price: price || "",
        rows: rows || [],
      },
    }));
  }, []);

  const getPriceMapForList = useCallback(
    (listName) => {
      return priceMap[listName] || { price: "", rows: [] };
    },
    [priceMap],
  );

  const clearPriceMap = useCallback(() => {
    setPriceMap({});
  }, []);

  const logStoredPriceLists = useCallback(() => {
    console.log("📦 All Stored Price Lists (from hook state):");
    Object.entries(priceMap).forEach(([listName, data]) => {
      if (!listName) return; // Skip empty key
      console.log(`\n📝 Price List: ${listName}`);
      console.log(`🔢 Price: ${data.price}`);
      console.log("📋 Rows:");
      console.table(data.rows);
    });
  }, [priceMap]);

  return {
    priceMap,
    updatePriceMap,
    setPriceForList,
    getPriceMapForList,
    clearPriceMap,
    logStoredPriceLists,
  };
};

export default function ItemMaster() {
  const theme = useTheme();
  const timeoutRef = useRef(null);
  const { user, companyData } = useAuth();
  const perms = usePermissions(61);
  const [tab, settab] = useState("1");
  const [tabvalue, setTabValue] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [InvntDialogOpen, setIsInvntDialogOpen] = useState(false);
  const [InvntUOMDialogOpen, setIsInvntUOMDialogOpen] = useState(false);
  const [itemGroup, setItemGroup] = useState([]);
  const [uomGroup, setUomGroup] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchSACText, setSearchSACText] = useState("");
  const [openacc, setopenacc] = useState(false);
  const [openSAC, setSACOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(
    rows.length > 0 ? rows[0] : null,
  );
  const [openacc1, setopenacc1] = useState(false);
  const [saveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [oItemVendorLines, setOItemVendorLines] = useState([]);
  const [selectedHsnRow, setSelectedHsnRow] = useState(null);
  const [selectedSACRow, setSelectedSACRow] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shippType, setShippType] = useState([]);
  const [preVend, setPreVend] = useState(false);
  const [preferedVendor, setpreferedVendor] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [seriesdata, setSeriesdata] = useState(false);
  const [ugpData, setUgpAllData] = useState([]);

  const [hsnOpen, setHsnOpen] = useState(false);
  const [listHsn, setListHsn] = useState([]); // Original HSN List
  const [valHsnList, setValHsnList] = useState([]);

  const [listSAC, setListSAC] = useState([]); // Original HSN List
  const [valSACList, setValSACList] = useState([]);
  const [priceListModel, setPriceListModel] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [ServiceCategories, setServiceCategories] = useState([]);

  const LIMIT = 20;
  const [rowCount, setRowCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [rowSACCount, setRowSACCount] = useState(0);
  const [currentSACPage, setCurrentSACPage] = useState(0);
  //=====================================Active List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //=====================================InActive List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);

  //=====================================Preferred Vendor Model List State====================================================================

  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [getListSearching, setGetListSearching] = useState(false);
  const [getListquery, setGetListQuery] = useState("");
  const [selectedUomEntry, setSelectedUomEntry] = useState(null); // State for selected UomEntry
  const [selectedIUomEntry, setSelectedIUomEntry] = useState(null);
  const [selectedINUomEntry, setSelectedINUomEntry] = useState(null);
  const [SelectedPrchseUomEntry, setSelectedPrchseUomEntry] = useState(null);
  const [FromDate, setFromDate] = useState(null);
  const [ToDate, setToDate] = useState(null);
  const [selectedData, setSelectedData] = useState([]);
  const [filteredPriceList, setFilteredPriceList] = useState([]);
  const [isUOMModalOpen, setIsUOMModalOpen] = useState(false); // Control UOM selection modal
  const [remainingUoMs, setRemainingUoMs] = useState([]);
  const [selectedUoMs, setSelectedUoMs] = useState([]);
  const [calculatedValue, setCalculatedValue] = useState(null);
  const [preventOverwrite, setPreventOverwrite] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState("");
  const [volumeUnits, setVolumeUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [itemImages, setItemImages] = useState([]);
  // each item: { id, name, base64, preview }
  const CustomToolbarWithExport = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarExport
          csvOptions={{
            fileName: "Inventory_Data",
            utf8WithBom: true,
          }}
          printOptions={{
            disableToolbarButton: true, // optional
          }}
        />
      </GridToolbarContainer>
    );
  };
  const handleImagePick = (e) => {
    try {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      if (itemImages.length >= 5) {
        Swal.fire({
          icon: "warning",
          title: "Limit Reached",
          text: "You can upload maximum 5 images.",
          confirmButtonColor: "#1976d2",
        });
        e.target.value = "";
        return;
      }

      const remainingSlots = 5 - itemImages.length;
      const selectedFiles = files.slice(0, remainingSlots);

      if (files.length > remainingSlots) {
        Swal.fire({
          icon: "info",
          title: "Only " + remainingSlots + " allowed",
          text: `You can upload only ${remainingSlots} more image(s).`,
          confirmButtonColor: "#1976d2",
        });
      }

      selectedFiles.forEach((file) => {
        // Basic validation
        if (!file.type.startsWith("image/")) {
          console.warn(`Skipping non-image file: ${file.name}`);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          try {
            const base64 = reader.result.split(",")[1]; // Assumes data:image/... format
            setItemImages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID
                  ? crypto.randomUUID()
                  : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                preview: URL.createObjectURL(file),
                base64,
              },
            ]);
          } catch (error) {
            console.error("Error processing image:", error);
            Swal.fire({
              icon: "error",
              title: "Upload Error",
              text: "Failed to process the selected image.",
            });
          }
        };
        reader.onerror = () => {
          console.error("FileReader failed for file:", file.name);
          Swal.fire({
            icon: "error",
            title: "File Read Error",
            text: `Could not read ${file.name}. Please try again.`,
          });
        };
        reader.readAsDataURL(file);
      });

      e.target.value = "";
    } catch (error) {
      console.error("Unexpected error in handleImagePick:", error);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "Something went wrong while selecting images.",
      });
    }
  };

  // FILTERED LIST
  const filteredData = priceListModel.filter(
    (x) =>
      x.UomCode?.toLowerCase().includes(search.toLowerCase()) ||
      x.UomName?.toLowerCase().includes(search.toLowerCase()),
  );
  const clearSearch = () => setSearch("");
  const [barcodeData, setBarcodeData] = useState([]);
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const apiRef = useGridApiRef();

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
  const EvalSystem = companyData?.InvntSystm;
  const initial = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    ModifiedBy: "",
    Status: "1",
    ItemCode: "",
    ItemName: "",
    PrcrmntMtd: "B",
    ItemGroupCode: itemGroup.length > 0 ? itemGroup[0].DocEntry : "",
    PlaningSys: "N",
    FrgnName: "",
    ItemClass: "Material",

    // ItmsGrpCod: "",
    // ItemGroupCode: "",
    AttcEntry: "0",
    ItemType: "I",
    UgpEntry: "0",
    CodeBars: "",
    PrchseItem: "Y",
    SellItem: "Y",
    ListName: "",
    // UgpCode: "",

    SUoMEntry: "",
    Price: "",
    FirmCode: "",
    ShipType: "",
    ValidFor: true,
    InventoryItem: "Y",
    ServiceCtg: "",
    ValidFrom: dayjs(undefined).format("YYYY-MM-DD") || null,
    ValidTo: dayjs(undefined).format("YYYY-MM-DD") || null,
    FrozenFor: false,
    FrozenFrom: "",
    FrozenTo: "",
    IWeight1: "",
    ValidComm: "",
    InvntoryUOM: "",
    Weight: "0",
    EvalSystem: EvalSystem,
    CntUnitMsr: "",
    ByWh: "N",
    ReorderQty: "",
    MinLevel: "",
    MaxLevel: "",
    OnHand: "0",
    IsCommited: "0",
    OnOrder: "0",
    CardCode: "",
    DefaultWhs: "",
    PUoMEntry: "",
    IsActive: true,
    CardName: "",
    FittingCharge: "0",
    IUoMEntry: "",
    DocDate: dayjs(undefined),
    DocNum: "",
    SAPSync: "N",
    FirmName: "",
    ManBtchNum: "N",

    ManOutOnly: "",
    LeadTime: "",
    ToleranDay: "",
    Phantom: false,
    IssueMthd: "1",
    TreeType: "",
    PrdStdCst: "",
    InCostRoll: "",
    SuppCatNum: "",
    BuyUnitMsr: "",
    NumInBuy: "",
    PurPackMsr: "",
    PurPackUn: "1",
    CstGrpCode: "",
    VatGroupPu: "",
    VatGourpSa: "",
    SalUnitMsr: "",
    MinOrdrQty: "",
    NumInSale: "",
    SalPackMsr: "",
    SalPackUn: "",
    GLMethod: "W",
    Excisable: false,
    GSTRelevnt: false,
    MatType: "MAT",
    ChapterID: "",
    NotifyASN: "",
    ProAssNum: "",
    GstTaxCtg: "R",
    // GST: false,
    Chapter: "",
    Heading: "",
    SubHeading: "",
    AssblValue: "",
    oLines: [],
    oUOMLines: [],
    oItemVendorLines: [],
    oPSUOMLines: [],
    oInvntLinesL: [],
    BWeight1: "",
    BWidth1: "",
    BHeight1: "",
    SWeight1: "",
    SWidth1: "",
    SHeight1: "",
    SLength1: "",
    Series: "",
    BVolUnit: "",
    BLen1Unit: "",
    BWdth1Unit: "",
    BHght1Unit: "",
    SLen1Unit: "",
    SWdth1Unit: "",
    SHght1Unit: "",
    SVolUnit: "",
    BVolume: "",
    SVolume: "",
    BLength1: "",
    INUoMEntry: "",
    NoOfComponent: "",
    NoOfResComponent: "",
    NoOfRouteStages: "",
    ManageItem: "None",
    MngMethod: "A",
  };
  let [ok, setok] = useState("OK");
  const [formValues, setFormValues] = useState({
    ...initial,
  });
  const [uploadImage, setUploadImage] = useState({
    img1: "",
    img2: "",
    img3: "",
  });
  const [oLine, setOLine] = useState([]);
  // const [fromApi, setFromApi] = useState(false);
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();

  const toggleSelection = (item) => {
    setSelectedItems((prevSelectedItems) => {
      const isItemSelected = prevSelectedItems.some(
        (selected) => selected.CardCode === item.CardCode,
      );

      if (isItemSelected) {
        return prevSelectedItems.filter(
          (selected) => selected.CardCode !== item.CardCode,
        );
      } else {
        return [...prevSelectedItems, item];
      }
    });

    setOItemVendorLines((prev) => {
      const isItemInVendorList = prev.some(
        (vendor) => vendor.VendorCode === item.CardCode,
      );

      if (isItemInVendorList) {
        return prev.filter((vendor) => vendor.VendorCode !== item.CardCode);
      } else {
        return [...prev, { VendorCode: item.CardCode }];
      }
    });
  };
  //=================================================useForm==========================================================
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    watch,
    getValues,
    clearErrors,
  } = useForm({
    initial,
  });
  const isDisabled = watch("UgpEntry") === "0";
  const Disable = watch("UgpEntry") !== "0";
  setValue("CardCode", selectedVendor);
  setValue("ChapterID", valHsnList);
  setValue("SACEntry", valSACList);
  const StatusValue = watch("Status");
  const itemType = watch("ItemType");
  // const selectUomGroup = watch("UgpEntry");
  const prevUoMCode = useRef(null);
  const inventoryItemValue = watch("InventoryItem", "Y");
  const selectedUoMCode = useWatch({ control, name: "IUoMEntry" });
  const selectedINUoMEntry = useWatch({ control, name: "INUoMEntry" });
  const selectedSUomEntry = useWatch({ control, name: "SUoMEntry" });
  const selectedPUomEntry = useWatch({ control, name: "PUoMEntry" });
  const itemCode = useWatch({ control, name: "ItemCode" });
  const IUoMEntry = watch("IUoMEntry");
  const priceValue = parseFloat(watch("Price")) || 0;
  const { isDirty } = useFormState({ control });
  const excisableValue = watch("Excisable");
  const gstRelevntValue = watch("GSTRelevnt");
  const isByWhChecked = watch("ByWh");
  const UgpEntry = useWatch({ control, name: "UgpEntry" });

  useEffect(() => {
    if (!itemCode) return;

    const fetchBarcodes = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get(
          `/Barcode?Status=1&Page=0&SearchText=${itemCode}&Limit=20`,
        );

        if (response?.data?.success) {
          setBarcodeData(response.data.values || []);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Warning",
            text: response?.data?.message || "Failed to fetch barcodes.",
          });
          setBarcodeData([]);
        }
      } catch (error) {
        console.error("Barcode fetch failed:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            error.message ||
            "Something went wrong while fetching barcodes.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBarcodes();
  }, [itemCode]);
  const getUomFromUGP = () => {
    if (!UgpEntry || !IUoMEntry || !ugpData?.length) return null;

    const ugp = ugpData.find((g) => String(g.DocEntry) === String(UgpEntry));

    if (!ugp) return null;

    const uom = ugp.oLines?.find(
      (u) => String(u.UomCode) === String(IUoMEntry),
    );

    return uom || null;
  };

  useEffect(() => {
    if (!barcodeData?.length) {
      setValue("CodeBars", "", { shouldDirty: false });
      return;
    }

    let matchedBarcode = null;

    // 🔴 Case: No UGP → use UomEntry = -1 barcode
    if (String(UgpEntry) === "0") {
      matchedBarcode = barcodeData.find((b) => Number(b.UomEntry) === -1);
    }
    // 🟢 Case: Normal UGP → match by real UOM
    else {
      const uom = getUomFromUGP();
      if (uom) {
        matchedBarcode = barcodeData.find(
          (b) => Number(b.UomEntry) === Number(uom.UomEntry),
        );
      }
    }
    // ✅ Always overwrite CodeBars
    setValue("CodeBars", matchedBarcode?.BcdCode || "", {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [UgpEntry, IUoMEntry, barcodeData, ugpData, itemCode]);

  useEffect(() => {
    if (isByWhChecked) {
      const totalMinStock = rows.reduce(
        (sum, row) => sum + (Number(row.MinStock) || 0),
        0,
      );
      const totalMaxStock = rows.reduce(
        (sum, row) => sum + (Number(row.MaxStock) || 0),
        0,
      );
      const totalMinOrder = rows.reduce(
        (sum, row) => sum + (Number(row.MinOrder) || 0),
        0,
      );

      setFormValues((prevValues) => ({
        ...prevValues,
        MinLevel: totalMinStock,
        MaxLevel: totalMaxStock,
        ReorderQty: totalMinOrder,
      }));
    }
  }, [rows, isByWhChecked]);
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );

  const CustomSearchExportToolbar = () => {
    return (
      <GridToolbarContainer
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* 🔍 Search */}
        <GridToolbarQuickFilter
          placeholder="Search warehouse…"
          debounceMs={300}
          sx={{
            width: "50%",
            "& .MuiInputBase-root": {
              width: "100%",
            },
          }}
        />

        {/* ⬇️ Export */}
        <GridToolbarExport
          csvOptions={{
            fileName: "Inventory_Data",
            utf8WithBom: true,
          }}
          printOptions={{
            disableToolbarButton: true,
          }}
        />
      </GridToolbarContainer>
    );
  };

  //==================================================set data back to field===================================
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      if (isDirty || ok === "UPDATE") {
        Swal.fire({
          text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        }).then((result) => {
          if (!result.isConfirmed) return;

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
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while trying to fetch item data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const normalizeImageUrl = (url) => {
    if (!url) return "";
    return url.replace(/\\/g, "/");
  };

  const fetchAndSetData = async (DocEntry) => {
    setSaveUpdateName("UPDATE");
    toggleDrawer(sidebarOpen);
    setFilteredPriceList([]);
    setRemainingUoMs([]);
    setOItemVendorLines([]);
    setSelectedItems([]);
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/ItemsV2/${DocEntry}`);

      if (!data.success || !data.values) {
        reset(initial);
        return;
      }

      const values = data.values;
      setFilesFromApi(values.AttcEntry);
      values.InventoryItem = values.InventoryItem === "Y" ? "Y" : "N";
      values.SellItem = values.SellItem === "Y" ? "Y" : "N";
      values.PrchseItem = values.PrchseItem === "Y" ? "Y" : "N";
      values.Excisable = values.Excisable === "Y";
      values.GSTRelevnt = values.GSTRelevnt === "Y";
      values.ByWh = values.ByWh === "Y";
      values.IsActive = values.IsActive ? "Y" : "N";
      values.Phantom = values.Phantom === "Y";
      values.InCostRoll = values.InCostRoll === "Y";
      values.ManageItem =
        values.ManBtchNum === "Y"
          ? "Batch"
          : values.ManSerNum === "Y"
            ? "Serial"
            : "None";

      // Set the value in the form
      // Convert "Y"/"N" to boolean
      setValue("Phantom", values.Phantom === "Y", { shouldDirty: false });
      // Convert "Y"/"N" to boolean
      setValue("InCostRoll", values.InCostRoll === "Y", { shouldDirty: false });
      values.ValidFor = values.ValidFor ? "Y" : "N";

      const ugpEntryValue =
        values.UgpEntry === -1 || values.UgpEntry === "-1"
          ? "0"
          : String(values.UgpEntry ?? "");

      reset(values, {
        keepDirty: false, // Do not mark the form as dirty
        keepTouched: false,
        keepValues: false,
      });
      Object.entries(values).forEach(([key, val]) => {
        setValue(key, val, { shouldDirty: false });
      });
      setFormValues(values);
      setValSACList(values.SACEntry);
      values.CardCode =
        values.CardCode === "null" || values.CardCode === null
          ? null
          : values.CardCode;

      setSelectedVendor(values.CardCode);
      setValue("ItemClass", values.ItemClass === "S" ? "Service" : "Material", {
        shouldDirty: false,
      });

      // Set UOM Entry
      setValue("UgpEntry", ugpEntryValue, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: false,
      });

      // Set basic values (ensure all values are set)
      setSelectedUomEntry(values.SUoMEntry);
      setSelectedIUomEntry(values.IUoMEntry);
      setSelectedINUomEntry(values.INUoMEntry);
      setSelectedPrchseUomEntry(values.PUoMEntry);
      setValue("PUoMEntry", values.PUoMEntry, { shouldDirty: false });
      setValue("SUoMEntry", values.SUoMEntry, { shouldDirty: false });
      setValue("INUoMEntry", values.INUoMEntry, { shouldDirty: false });
      setValue("IUoMEntry", values.IUoMEntry, { shouldDirty: false });
      setValue("ChapterID", values.ChapterID, { shouldDirty: false });
      setValue("BuyUnitMsr", values.BuyUnitMsr, { shouldDirty: false });
      setValue("SalUnitMsr", values.SalUnitMsr, { shouldDirty: false });
      setValue("CntUnitMsr", values.CntUnitMsr, { shouldDirty: false });
      setValue("InvntoryUOM", values.InvntoryUOM, { shouldDirty: false });
      handleUomGroupChange(ugpEntryValue);

      // Set vendor lines if available
      if (values.oItemVendorLines?.length > 0) {
        setOItemVendorLines(values.oItemVendorLines);
        setSelectedItems(
          values.oItemVendorLines.map((item) => {
            const matchedVendor = getListData.find(
              (v) => v.CardCode === item.VendorCode,
            );
            return {
              CardCode: item.VendorCode,
              CardName: matchedVendor ? matchedVendor.CardName : "Unknown",
            };
          }),
        );
      }

      // Build priceMap from oLines if available
      const updatedOLines = priceList.map((pl) => {
        const match = values.oLines?.find((l) => l.PriceList === pl.DocEntry);

        return match
          ? { ...match } // use the oLine from API as-is
          : {
              LineNum: "",
              DocEntry: values.DocEntry,
              UserId: user.UserId,
              CreatedBy: user.UserName,
              ModifiedBy: user.UserName,
              ModifiedDate: dayjs().format("YYYY/MM/DD"),
              Status: "1",
              ItemCode: values.ItemCode,
              PriceList: pl.DocEntry,
              UomEntry: "",
              Factor: pl.Factor || "0.000",
              Price: "",
              Currency: "", // no currency because no match
              AddPrice: "0.000",
              Currency1: "0",
              BasePLNum: pl.BaseNum || "0",
              Ovrwritten: "0",
              oUOMLines: [],
            };
      });

      setOLine(updatedOLines);
      console.log("updated oline", updatedOLines);

      setOLine(updatedOLines);
      console.log("updated oline", updatedOLines);
      // Handle UOM mapping
      if (values.oLines?.length > 0 && ugpData.length > 0) {
        const allUomLines = values.oLines.flatMap((l) => l.oUOMLines || []);
        const matchedUGP = ugpData.find(
          (u) => String(u.DocEntry) === ugpEntryValue,
        );

        const enrichedUomLines = allUomLines.map((line) => {
          const uomMatch = matchedUGP?.oLines?.find(
            (u) => String(u.UomEntry) === String(line.UomEntry),
          );
          const basePrice =
            parseFloat(line.Factor) > 0
              ? (
                  parseFloat(line.Price) /
                  (1 - parseFloat(line.Factor) / 100)
                ).toFixed(2)
              : parseFloat(line.Price).toFixed(2);

          return {
            ...line,
            UomCode: uomMatch?.UomCode || "",
            UomName: uomMatch?.UomName || "",
            baspr: basePrice,
          };
        });

        const combinedPriceMap = values.oLines.reduce((acc, line) => {
          const related = enrichedUomLines.filter(
            (u) => u.RelateEntry === line.LineNum,
          );
          acc[line.PriceList] = {
            price: line.Price || "",
            rows: related.length
              ? related
              : [
                  {
                    UomEntry: matchedUGP?.BaseUom || "",
                    UomCode:
                      matchedUGP?.oLines?.find(
                        (u) => u.BaseUom === matchedUGP.BaseUom,
                      )?.UomCode || "",
                    UomName:
                      matchedUGP?.oLines?.find(
                        (u) => u.BaseUom === matchedUGP.BaseUom,
                      )?.UomName || "",
                    Factor: "0.00",
                    Price: "0.00",
                    baspr: "0.00",
                    Currency: line.Currency,
                    RelateEntry: line.LineNum,
                  },
                ],
          };
          return acc;
        }, {});

        updatePriceMap(combinedPriceMap);

        const selectedListName = getValues("ListName");
        if (selectedListName) handlePriceListChange(selectedListName);
      }
      // 🔥 Load Item Images from API
      if (values.oItemImages?.length > 0) {
        const apiImages = values.oItemImages.map((img) => ({
          id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          LineNum: img.LineNum, // 👈 comes from API
          DocEntry: img.DocEntry,
          Name: img.Name,
          ItemCode: img.ItemCode,

          ImagePath: img.ImagePath,
          ImageUrl: img.ImageUrl,

          preview: normalizeImageUrl(img.ImageUrl), // 👈 for UI
        }));

        setItemImages(apiImages);
      } else {
        setItemImages([]);
      }

      // Load inventory lines if available
      if (values.oInvntLines) {
        const updated = values.oInvntLines.map((row, idx) => ({
          id: idx,
          ...row,
          checked: row.WhsCode === values.DefaultWhs, // ✅ THIS IS MISSING
        }));

        await loadWarehouseLines(updated, values.DefaultWhs, "UPDATE");
      } else {
        await loadWarehouseLines([], values.DefaultWhs, "UPDATE");
      }

      // Handle UOM Group changes
      if (
        values.PUoMEntry ||
        values.SUoMEntry ||
        values.IUoMEntry ||
        values.INUoMEntry
      ) {
        FetchUoMGroup(
          values.PUoMEntry,
          values.SUoMEntry,
          values.IUoMEntry,
          values.INUoMEntry,
        );
      }

      // Set valid date range values
      if (values.Status === "0") {
        setFromDate(
          values.FrozenFrom !== "01/01/1900 00:00:00"
            ? values.FrozenFrom
            : null,
        );
        setToDate(
          values.FrozenTo !== "01/01/2099 00:00:00" ? values.FrozenTo : null,
        );
      } else if (values.Status === "1") {
        setFromDate(
          values.ValidFrom !== "01/01/1900 00:00:00" ? values.ValidFrom : null,
        );
        setToDate(
          values.ValidTo !== "01/01/2099 00:00:00" ? values.ValidTo : null,
        );
      } else {
        setFromDate(null);
        setToDate(null);
      }

      setSelectedPriceList(values.ListName);
      setValHsnList(values.ChapterID);
      setLoading(false);
      setValue("Price", values.Price, { shouldDirty: false });
    } catch (error) {
      reset(initial);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  //=============================================POST AND PUT API=====================================================

  const handleSubmitForm = async (data) => {
    if (data.InventoryItem === "N" && data.IssueMthd === "2") {
      Swal.fire({
        title: "Production Data",
        text: "The issue method for non-inventory items has to be Backflush.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }
    const mergedVendorLines = selectedItems.map((item) => {
      const existingLine = data.oItemVendorLines?.find(
        (line) => line.VendorCode === item.CardCode,
      );

      return {
        LineNum: existingLine ? existingLine.LineNum : "",
        UserId: user.UserId,
        CreatedBy: existingLine ? existingLine.CreatedBy : user.UserName,
        CreatedDate: existingLine
          ? dayjs(existingLine.CreatedDate).format("YYYY/MM/DD")
          : dayjs().format("YYYY/MM/DD"),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs(data.ModifiedDate).format("YYYY/MM/DD"),
        Status: "1",
        ItemCode: data.ItemCode || "",
        VendorCode: String(item.CardCode || ""),
      };
    });
    const isManual = data.UgpEntry === "0";

    const formData = new FormData();
    formData.append("DocEntry", getValues().AttcEntry || "");
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
      }
    });
    let attachmentDocEntry = null;
    if (fileData?.length > 0) {
      if (saveUpdateName === "SAVE") {
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
    }

    const obj = {
      // ...data,
      UserId: user.UserId,
      CreatedBy: user.UserName,
      DocEntry: data.DocEntry || "",
      CreatedDate: dayjs(data.CreatedDate).format("YYYY/MM/DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs(data.ModifiedDate).format("YYYY/MM/DD"),
      Status: StatusValue === "1" ? "1" : "0",
      ItemName: String(data.ItemName || ""),
      ItemCode: String(data.ItemCode || ""),
      FrgnName: String(data.FrgnName || ""),
      ItemGroupCode: data.ItemGroupCode || "",
      ItemType: data.ItemType,
      AttcEntry: attachmentDocEntry || data.AttcEntry || "",
      UgpEntry: isManual ? "-1" : String(data.UgpEntry || ""),
      CodeBars: String(data.CodeBars || ""),
      InventoryItem: data.InventoryItem === "Y" ? "Y" : "N",
      SellItem: data.SellItem === "Y" ? "Y" : "N",
      PrchseItem: data.PrchseItem === "Y" ? "Y" : "N",
      ListName: String(data.ListName || ""),
      Price: String(data.Price || "0"),
      FirmCode: String(data.FirmCode ? data.FirmCode : "FC00"),
      ShipType: String(data.ShipType || ""),
      ValidFor: StatusValue === "1" ? "Y" : "N",
      ValidFrom:
        StatusValue === "1" && FromDate && ToDate
          ? dayjs(FromDate).format("YYYY-MM-DD HH:mm:ss")
          : StatusValue === "1" && !FromDate && !ToDate
            ? "01/01/1900 00:00:00"
            : StatusValue === "1" && FromDate && !ToDate
              ? dayjs(FromDate).format("YYYY-MM-DD HH:mm:ss")
              : "01/01/1900 00:00:00",

      ValidTo:
        StatusValue === "1" && ToDate
          ? dayjs(ToDate).format("YYYY-MM-DD HH:mm:ss")
          : StatusValue === "1" && !FromDate && !ToDate
            ? "01/01/2099 00:00:00"
            : StatusValue === "1" && FromDate && !ToDate
              ? "01/01/2099 00:00:00"
              : "01/01/1900 00:00:00",

      FrozenFrom:
        StatusValue === "0" && FromDate && ToDate
          ? dayjs(FromDate).format("YYYY-MM-DD HH:mm:ss")
          : StatusValue === "0" && !FromDate && !ToDate
            ? "01/01/1900 00:00:00"
            : StatusValue === "0" && FromDate && !ToDate
              ? dayjs(FromDate).format("YYYY-MM-DD HH:mm:ss")
              : "01/01/1900 00:00:00",

      FrozenTo:
        StatusValue === "0" && ToDate
          ? dayjs(ToDate).format("YYYY-MM-DD HH:mm:ss")
          : StatusValue === "0" && !FromDate && !ToDate
            ? "01/01/2099 00:00:00"
            : StatusValue === "0" && FromDate && !ToDate
              ? "01/01/2099 00:00:00"
              : "01/01/1900 00:00:00",

      FrozenFor: StatusValue === "0" ? "Y" : "N",
      ValidComm: String(data.ValidComm || ""),
      // InvntoryUOM: isManual ? "Manual" : String(data.InvntoryUOM || ""),
      InvntoryUOM: String(data.InvntoryUOM || ""),
      Weight: data.Weight || "0",
      EvalSystem: data.EvalSystem || "S",
      ByWh: data.ByWh ? "Y" : "N",
      ReorderQty: data.ReorderQty || "0",
      MinLevel: data.MinLevel || "0",
      MaxLevel: data.MaxLevel || "0",
      OnHand: data.OnHand || "0",
      IsCommited: data.IsCommited || "0",
      OnOrder: data.OnOrder || "0",
      CardCode: String(data.CardCode) || "",
      DefaultWhs: rows.find((r) => r.checked)?.WHSCode || "",
      IsActive: data.ValidFor ? "Y" : "N",
      CardName: String(data.CardName || ""),
      FittingCharge: data.FittingCharge || "0",
      AvgPrice: String(data.AvgPrice || "0"),
      DocDate: dayjs(data.DocDate).format("YYYY/MM/DD"),
      DocNum: data.ItemCode || "",
      SAPSync: data.SAPSync || "N",
      FirmName: String(data.FirmName || "Firm One"),
      ManBtchNum: data.ManageItem === "Batch" ? "Y" : "N",
      ManSerNum: data.ManageItem === "Serial" ? "Y" : "N",
      MngMethod: data.MngMethod || "A",
      ManOutOnly: data.ManOutOnly || "0",
      LeadTime: data.LeadTime || "0",
      ToleranDay: data.ToleranDay || "0",
      Phantom: data.Phantom ? "Y" : "N",
      InCostRoll: data.InCostRoll ? "Y" : "N",
      IssueMthd: data.IssueMthd || "0",
      TreeType: data.TreeType || "0",
      PrdStdCst: data.PrdStdCst || "0",
      SuppCatNum: data.SuppCatNum || "",
      // BuyUnitMsr: isManual ? "Manual" : data.BuyUnitMsr ,
      // NumInBuy: isManual ? "1" : String(data.NumInBuy || "0"),
      BuyUnitMsr: data.BuyUnitMsr || "",
      NumInBuy: String(data.NumInBuy || "0"),
      PurPackMsr: data.PurPackMsr || "0",
      PurPackUn: data.PurPackUn || "0",
      CstGrpCode: data.CstGrpCode || "0",
      VatGroupPu: data.VatGroupPu || "V001",
      VatGourpSa: data.VatGourpSa || "V001",
      // SalUnitMsr: isManual ? "Manual" : data.SalUnitMsr,
      // NumInSale: isManual ? "1" : String(data.NumInSale || "0"),
      SalUnitMsr: data.SalUnitMsr || "",
      NumInSale: String(data.NumInSale || "0"),
      SalPackMsr: data.SalPackMsr || "",
      SalPackUn: data.SalPackUn || "0",
      GLMethod: data.GLMethod || "W",
      Excisable: excisableValue ? "Y" : "N",
      GSTRelevnt: gstRelevntValue ? "Y" : "N",
      MatType: String(data.MatType || ""),
      ChapterID: String(data.ChapterID || ""),
      NotifyASN: String(gstRelevntValue ? "" : data.NotifyASN || "0"),
      ProAssNum: String(gstRelevntValue ? "" : data.ProAssNum || "0"),
      GstTaxCtg: String(excisableValue ? "" : data.GstTaxCtg || "0"),
      IssuePriBy: data.IssuePriBy || "0",
      // CntUnitMsr: isManual ? "Manual" : String(data.SalUnitMsr),
      // NumInCnt: isManual ? "1" : String(data.NumInCnt || "0"),
      CntUnitMsr: String(data.CntUnitMsr || "0"),
      NumInCnt: String(data.NumInCnt || "0"),
      PrcrmntMtd: data.PrcrmntMtd || "0",
      PlaningSys: data.PlaningSys || "0",
      MinOrdrQty: data.MinOrdrQty || "0",
      BHeight1: data.BHeight1 || "0",
      BWidth1: data.BWidth1 || "0",
      BLength1: data.BLength1 || "0",
      BVolume: String(data.BVolume || "0"),
      BWeight1: String(data.BWeight1 || "0"),
      BVolUnit: data.BVolUnit || "0",
      SLength1: data.SLength1 || "0",
      SWidth1: data.SWidth1 || "0",
      SHeight1: data.SHeight1 || "0",
      SVolume: String(data.SVolume || "0"),
      SWeight1: String(data.SWeight1 || "0"),
      SVolUnit: data.SVolUnit || "0",
      DfltWH: data.DfltWH || "WHS1",
      LstEvlPric: data.LstEvlPric || "0",
      LstEvlDate: dayjs(data.LstEvlDate).format("YYYY/MM/DD"),
      LastPurCur: data.LastPurCur || "KWD",
      LastPurPrc: data.LastPurPrc || "0",

      SHght1Unit: data.SHght1Unit || "",
      SWdth1Unit: data.SWdth1Unit || "",
      SLen1Unit: data.SLen1Unit || "",
      BHght1Unit: data.BHght1Unit || "",
      BWdth1Unit: data.BWdth1Unit || "",
      BWght1Unit: data.BWght1Unit || "",
      BLen1Unit: data.BLen1Unit || "",
      ExpensAcct: data.ExpensAcct || "0",
      FrgnExpAcc: data.FrgnExpAcc || "0",
      TaxType: data.TaxType || "Y",
      WTLiable: data.WTLiable || "1",
      TaxCodeAP: data.TaxCodeAP || "TAX01",
      TaxCodeAR: data.TaxCodeAR || "TAX01",
      AssblValue: data.AssblValue || "0",
      Series: String(data.Series || ""),
      INUoMEntry: isManual ? "-1" : String(selectedINUomEntry || ""),
      IWeight1: data.IWeight1 || "0",
      IWght1Unit: data.IWght1Unit || "11",
      CompoWH: data.CompoWH || "Y",
      SUoMEntry: isManual ? "-1" : String(selectedUomEntry || ""),
      IUoMEntry: isManual ? "-1" : String(selectedIUomEntry || ""),
      PUoMEntry: isManual ? "-1" : String(SelectedPrchseUomEntry || ""),
      onHldLimt: String(data.onHldLimt || "0"),
      OnHldPert: String(data.OnHldPert || "0"),
      FrozenComm: String(data.FrozenComm || "0"),
      SACEntry: String(data.SACEntry || "0"),
      ItemClass:
        data.ItemClass === "Service"
          ? "S"
          : data.ItemClass === "Material"
            ? "M"
            : "0",
      ServiceCtg: String(data.ServiceCtg || ""),
      //  oInvntLines : data.oInvntLines
      //   ? data.oInvntLines.map((item) => ({
      oInvntLines: rows.map((item, index) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(data.CreatedDate).format("YYYY/MM/DD"), // Use data.CreatedDate from main object
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs(data.ModifiedDate).format("YYYY/MM/DD"),
        Status: String(item.Status || "1"),
        DocEntry: String(""),
        ItemCode: String(data.ItemCode || ""),
        WHSCode: String(item.WHSCode || "0"),
        WhsName: String(item.WhsName || "0"),
        Locked: item.Locked === "1" ? "1" : "0",
        FirstBinLoc: String(item.FirstBinLoc || "0"),
        DftBinEnfd: String(item.DftBinEnfd || "0"),
        OnHand: String(item.OnHand || "0"),
        IsCommited: String(item.IsCommited || "0"),
        OnOrder: String(item.OnOrder || "0"),
        Available: String(item.Available || "0"),
        AvgPrice: String(item.AvgPrice || "0"),
        Alert: String(item.Alert || "0"),
        Consig: String(item.Consig || "0"),
        Counted: String(item.Counted || "0"),
        WasCounted: String(item.WasCounted || "0"),
        MinOrder: String(item.MinOrder || "0"),
        BalInvntAc: String(item.BalInvntAc || "0"),
        SaleCostAc: String(item.SaleCostAc || "0"),
        TransferAc: String(item.TransferAc || "0"),
        RevenuesAc: String(item.RevenuesAc || "0"),
        VarianceAc: String(item.VarianceAc || "0"),
        DecreasAc: String(item.DecreasAc || "0"),
        IncreasAc: String(item.IncreasAc || "0"),
        ReturnAc: String(item.ReturnAc || "0"),
        ExpensesAc: String(item.ExpensesAc || "0"),
        FrRevenuAc: String(item.FrRevenuAc || "0"),
        FrExpensAc: String(item.FrExpensAc || "0"),
        ExmptIncom: String(item.ExmptIncom || "0"),
        PriceDifAc: String(item.PriceDifAc || "0"),
        ExchangeAc: String(item.ExchangeAc || "0"),
        BalanceAcc: String(item.BalanceAcc || "0"),
        PurchaseAc: String(item.PurchaseAc || "0"),
        PAReturnAc: String(item.PAReturnAc || "0"),
        PurchOfsAc: String(item.PurchOfsAc || "0"),
        ShpdGdsAct: String(item.ShpdGdsAct || "0"),
        VatRevAct: String(item.VatRevAct || "0"),
        StockValue: String(item.StockValue || "0"),
        DecresGlAc: String(item.DecresGlAc || "0"),
        IncresGlAc: String(item.IncresGlAc || "0"),
        StokRvlAct: String(item.StokRvlAct || "0"),
        StkOffsAct: String(item.StkOffsAct || "0"),
        WipAcct: String(item.WipAcct || "0"),
        WipVarAcct: String(item.WipVarAcct || "0"),
        CostRvlAct: String(item.CostRvlAct || "0"),
        CstOffsAct: String(item.CstOffsAct || "0"),
        ExpClrAct: String(item.ExpClrAct || "0"),
        ExpOfstAct: String(item.ExpOfstAct || "0"),
        ARCMAct: String(item.ARCMAct || "0"),
        ARCMFrnAct: String(item.ARCMFrnAct || "0"),
        ARCMEUAct: String(item.ARCMEUAct || "0"),
        ARCMExpAct: String(item.ARCMExpAct || "0"),
        APCMAct: String(item.APCMAct || "0"),
        APCMFrnAct: String(item.APCMFrnAct || "0"),
        APCMEUAct: String(item.APCMEUAct || "0"),
        RevRetAct: String(item.RevRetAct || "0"),
        NegStckAct: String(item.NegStckAct || "0"),
        StkInTnAct: String(item.StkInTnAct || "0"),
        PurBalAct: String(item.PurBalAct || "0"),
        WhICenAct: String(item.WhICenAct || "0"),
        WhOCenAct: String(item.WhOCenAct || "0"),
        WipOffset: String(item.WipOffset || "0"),
        StockOffst: String(item.StockOffst || "0"),
        DftBinAbs: "0",
        Freezed: String(item.Freezed || "0"),
        FreezeDoc: String(item.FreezeDoc || "0"),
        FreeChrgSA: String(item.FreeChrgSA || "0"),
        FreeChrgPU: String(item.FreeChrgPU || "0"),
        MinStock: String(item.MinStock || "0"),
        MaxStock: String(item.MaxStock || "0"),
      })),

      oLines: oLine.map((pl) => {
        const storedPL = priceMap[pl.PriceList] || {};
        const storedRows = storedPL.rows || [];
        const storedPrice = storedPL.price || "0";

        return {
          LineNum: saveUpdateName === "SAVE" ? "" : pl.LineNum || "",
          UserId: user.UserId,
          DocEntry: String(data.DocEntry || ""),
          CreatedBy: user.UserName,
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs(data.ModifiedDate).format("YYYY/MM/DD"),
          Status: pl.Status,
          ItemCode: String(data.ItemCode || "0"),
          PriceList: pl.PriceList,
          Price: storedPrice, // ✅ pull from priceMap
          Currency: String(pl.Currency || ""),
          AddPrice: pl.AddPrice || "0",
          Currency1: pl.Currency1 || "0",
          BasePLNum: pl.BasePLNum || "0",
          UomEntry: pl.UomEntry || "0",
          Ovrwritten: pl.Ovrwritten || "0",
          Factor: String(pl.Factor || "0"),

          oUOMLines: storedRows.map((item1) => {
            return {
              LineNum: item1.LineNum || "",
              DocEntry: String(data.DocEntry || ""),
              UserId: item1.UserId || "0",
              CreatedBy: item1.CreatedBy || "0",
              ModifiedBy: item1.ModifiedBy || "0",
              ModifiedDate: dayjs(data.ModifiedDate).format("YYYY/MM/DD"),
              Status: item1.Status,
              ItemCode: String(data.ItemCode),
              PriceList: String(pl.PriceList),
              UomEntry: String(item1.UomEntry),
              Factor: String(item1.Factor),
              Price: String(item1.Price),
              Currency: String(pl.Currency || ""),
            };
          }),
        };
      }),
      oItemVendorLines: mergedVendorLines,
      oPSUOMLines: data.oPSUOMLines
        ? data.oPSUOMLines.map((item) => ({
            LineNum: item.LineNum || "",
            DocEntry: item.DocEntry || "",
            UserId: item.UserId || "0",
            CreatedBy: item.CreatedBy,
            ModifiedBy: item.ModifiedBy,
            ModifiedDate: dayjs(data.ModifiedDate).format("YYYY/MM/DD"),
            Status: item.Status,
            ItemCode: String(item.ItemCode || "0"),
            UomType: item.UomType || "0",
            UomEntry: item.UomEntry || "0",
            PkgCodeDft: item.PkgCodeDft || "0",
            Height1: item.Height1 || "0",
            Hght1Unit: item.Hght1Unit || "0",
            Width1: item.Width1 || "0",
            Wdth1Unit: item.Wdth1Unit || "0",
            Length1: item.Length1 || "0",
            Len1Unit: item.Len1Unit || "0",
            Volume: item.Volume || "0",
            VolUnit: item.VolUnit || "0",
            Weight1: item.Weight1 || "0",
            Wght1Unit: item.Wght1Unit || "0",
          }))
        : [],
      oItemImages:
        itemImages.map((img) => {
          const isFromApi = img.LineNum && img.LineNum !== "0";

          if (isFromApi) {
            // Existing image: send path/reference only
            return {
              LineNum: img.LineNum,
              DocEntry: data.DocEntry,
              UserId: user.UserId,
              CreatedBy: img.CreatedBy || user.UserName,
              CreatedDate: img.CreatedDate || dayjs().format("YYYY/MM/DD"),
              ModifiedBy: user.UserName,
              ModifiedDate: dayjs().format("YYYY/MM/DD"),
              Status: "1",
              Name: img.Name,
              ItemCode: img.ItemCode || data.ItemCode,
              ImagePath: "", // ✅ keep original path, do NOT send as Base64
              ImageUrl: img.ImageUrl,
            };
          }

          // New image: send Base64
          return {
            LineNum: "",
            DocEntry: data.DocEntry || "",
            UserId: user.UserId,
            CreatedBy: user.UserName,
            ModifiedBy: user.UserName,
            ModifiedDate: dayjs().format("YYYY/MM/DD"),
            Status: "1",
            Name: img.file.name,
            ItemCode: data.ItemCode || "",
            ImagePath: img.base64, // 🔥 Base64 ONLY for new images
            ImageUrl: "",
          };
        }) || [],
    };

    try {
      setLoading(true);
      if (saveUpdateName === "SAVE") {
        const response = await apiClient.post(`/ItemsV2`, obj);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          // FetchItemGroup();
          // FetchUoMGroup();
          // FetchPriceList();
          // FetchShippingType();
          setOpenListData([]);
          setOpenListPage(0);
          fetchOpenListData(0);
          setClosedListData([]);
          setClosedListPage(0);
          fetchClosedListData(0);
          SeriesData();
          Swal.fire({
            title: "Success!",
            text: "Item Master is Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          // rollback attachment if created
          if (attachmentDocEntry) {
            await apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          }

          Swal.fire({
            title: "Error!",
            text: message || "Failed to save item",
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to update "${AllData.ItemCode}" ?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          let attachmentDocEntry = data.AttcEntry || null;

          // If there are files and no existing attachment, POST first
          if (fileData?.length > 0 && data.AttcEntry === "0") {
            const attachmentRes = await apiClient.post(
              "/Attachment",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              },
            );

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
          // If files exist and attachment already exists, PUT to update
          else if (fileData?.length > 0 && data.AttcEntry) {
            await apiClient.put(`/Attachment/${data.AttcEntry}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }

          // Update your obj.AttcEntry with new or existing attachment ID
          obj.AttcEntry = attachmentDocEntry || "";

          const response = await apiClient.put(
            `/ItemsV2/${data.DocEntry}`,
            obj,
          );
          const { success, message } = response.data;
          if (success) {
            setOpenListData([]);
            setOpenListPage(0);
            fetchOpenListData(0);
            setClosedListData([]);
            setClosedListPage(0);
            fetchClosedListData(0);
            clearFormData();
            // FetchItemGroup();
            // FetchUoMGroup();
            // FetchPriceList();
            SeriesData();
            // FetchShippingType();
            Swal.fire({
              title: "Success!",
              text: "Item Master Updated",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        } else {
          Swal.fire({
            text: "Item Master is not Updated !",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }

    // Here you can proceed to send the obj to your API
  };
  //===================================================UOM modal=====================================================
  const handleSave = () => {
    const filteredData = filteredPriceList.map(({ LineNum, ...rest }) => rest);

    if (!watch("ListName")) {
      return;
    }

    updatePriceMap({
      ...priceMap,
      [selectedPriceList]: {
        price: watch("Price"),
        rows: filteredData,
      },
    });

    logStoredPriceLists(); // 🔥 Console logging everything

    handleClose();
  };

  const handleSelectUoM = (row) => {
    setSelectedUoMs((prev) =>
      prev.some((item) => item.UomCode === row.UomCode)
        ? prev.filter((item) => item.UomCode !== row.UomCode)
        : [...prev, row],
    );
  };
  const handleSaveSelectedUoMs = () => {
    setFilteredPriceList((prev) => {
      const formPrice = parseFloat(watch("Price")) || 0;

      const defaultRowIndex = prev.findIndex(
        (item) => item.UomCode === getValues("IUoMEntry"),
      );

      // Update default row if found
      const updatedPrev = [...prev];
      if (defaultRowIndex !== -1) {
        updatedPrev[defaultRowIndex] = {
          ...updatedPrev[defaultRowIndex],
          baspr: formPrice.toFixed(2),
          Price: formPrice.toFixed(2),
          Factor: "0.00",
        };
      }

      // Calculate prices only for newly selected UoMs
      const recalculatedSelected = selectedUoMs.map((row) => {
        const matchedUoM = priceListModel.find(
          (uom) => uom.UomCode === row.UomCode,
        );

        const baseQty = matchedUoM ? parseFloat(matchedUoM.BaseQty) : 1;
        const altQty = matchedUoM ? parseFloat(matchedUoM.AltQty) : 1;
        const rowCalcValue = altQty / baseQty;
        const newBasePrice = rowCalcValue !== 0 ? formPrice / rowCalcValue : 0;

        return {
          ...row,
          baspr: newBasePrice.toFixed(2),
          Price: newBasePrice.toFixed(2),
          Factor: "0.00",
        };
      });

      // Merge old list (with updated default row) and newly calculated selected rows
      return [...updatedPrev, ...recalculatedSelected];
    });

    setRemainingUoMs((prev) =>
      prev.filter(
        (item) =>
          !selectedUoMs.some((selected) => selected.UomCode === item.UomCode),
      ),
    );

    setSelectedUoMs([]);
    setIsUOMModalOpen(false);
  };
  //=========================Store pricelist price=======================
  const {
    priceMap,
    updatePriceMap,
    setPriceForList,
    getPriceMapForList,
    clearPriceMap,
    logStoredPriceLists,
  } = usePriceMap();

  const handlePriceChange = (value) => {
    updatePriceMap({
      ...priceMap,
      [selectedPriceList]: {
        price: value,
        rows: filteredPriceList, // Store current rows
      },
    });
    // Update filteredPriceList based on new price
    setFilteredPriceList((prev) =>
      prev.map((row) => ({ ...row, baspr: value })),
    );
  };

  const handlePriceListChange = (selectedValue) => {
    setSelectedPriceList(selectedValue);

    // Load the saved rows and price from session storage for the selected price list
    const storedData = getPriceMapForList(selectedValue);

    const price = storedData?.price || ""; // Get the price for the selected price list
    const savedRows = storedData?.rows || []; // Get the saved rows for the selected price list

    // Update the form price with the selected price
    setValue("Price", price);

    if (savedRows.length > 0) {
      // If there are saved rows, prevent overwriting the rows (set a flag)
      setPreventOverwrite(true);

      setTimeout(() => {
        // When saving, ensure we're updating the filteredPriceList with the saved rows
        setFilteredPriceList((prev) => {
          // Only update the rows if they are different, otherwise keep the existing rows
          return savedRows.length > 0 ? savedRows : prev;
        });

        // Update remaining UoMs based on saved rows (if any)
        const usedUomCodes = savedRows.map((row) => row.UomCode);
        const remaining = priceListModel.filter(
          (item) => !usedUomCodes.includes(item.UomCode),
        );
        setRemainingUoMs(remaining);
      }, 50); // Slight delay to let preventOverwrite take effect
    } else {
      // ✅ FIX: Always set the default row if no saved rows exist (uncommented and fixed to include price)
      const currentPrice = parseFloat(watch("Price")) || 0;
      const defaultRow = priceListModel.find(
        (item) => item.UomCode === getValues("IUoMEntry"),
      );

      if (defaultRow) {
        const updatedDefaultRow = {
          ...defaultRow,
          Factor: "0.00",
          baspr: currentPrice.toFixed(2),
          Price: currentPrice.toFixed(2),
        };
        setFilteredPriceList([updatedDefaultRow]);
      } else {
        setFilteredPriceList([]); // Clear if no default row found
      }

      const remainingData = priceListModel.filter(
        (item) => item.UomCode !== getValues("IUoMEntry"),
      );
      setRemainingUoMs(remainingData);
    }
  };

  //==============================Calculation of uom modal====================
  const handleReduceByChange = (e, row) => {
    const newFactor = e.target.value.trim();
    const reduceByPercent = newFactor ? parseFloat(newFactor) : 0;
    const basePrice = parseFloat(row.baspr) || 0;

    const calculatedUnitPrice =
      reduceByPercent !== 0
        ? basePrice - (basePrice * reduceByPercent) / 100
        : basePrice;

    setFilteredPriceList((prev) =>
      prev.map((r) =>
        r.UomCode === row.UomCode
          ? { ...r, Factor: newFactor, Price: calculatedUnitPrice.toFixed(2) }
          : r,
      ),
    );
  };
  const getCalculatedValue = (uomCode) => {
    const matchedUoM = priceListModel.find((uom) => uom.UomCode === uomCode);
    if (!matchedUoM) return null;

    return parseFloat(matchedUoM.AltQty) / parseFloat(matchedUoM.BaseQty);
  };

  useEffect(() => {
    if (priceList.length > 0 && saveUpdateName === "SAVE") {
      const currentValues = getValues();

      const newOLines = priceList.map((pl) => ({
        LineNum: "",
        DocEntry: "",
        UserId: user.UserId || "0",
        CreatedBy: user.UserName || "",
        ModifiedBy: user.UserName || "",
        ModifiedDate: dayjs().format("YYYY/MM/DD"),
        Status: "1",
        ItemCode: currentValues.ItemCode || "",
        PriceList: pl.DocEntry,
        UomEntry: "",
        Factor: pl.Factor || "0.000",
        Price: "",
        Currency: pl.PrimCurr,
        AddPrice: "0.000",
        Currency1: "0",
        BasePLNum: pl.BaseNum || "0",
        Ovrwritten: "0",
        oUOMLines: [],
      }));

      setOLine(newOLines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceList, saveUpdateName]);

  // Handle: IUoMEntry or selectedUoMCode changes
  useEffect(() => {
    const uomCode = selectedUoMCode || getValues("IUoMEntry");
    if (!uomCode || prevUoMCode.current === uomCode) return;

    prevUoMCode.current = uomCode;

    setRemainingUoMs(priceListModel.filter((item) => item.UomCode !== uomCode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUoMCode, priceListModel]);
  const watchedPriceList = watch("ListName");

  useEffect(() => {
    if (!watchedPriceList || priceListModel.length === 0) return;

    handlePriceListChange(watchedPriceList);
  }, [priceListModel, watchedPriceList]);

  // Handle: selectedUoMCode → recalculate conversion factor
  useEffect(() => {
    if (selectedUoMCode) {
      const newValue = getCalculatedValue(selectedUoMCode);
      if (newValue !== null) {
        setCalculatedValue(newValue);
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUoMCode]);

  useEffect(() => {
    if (preventOverwrite) {
      const timeout = setTimeout(() => setPreventOverwrite(false), 100); // small delay
      return () => clearTimeout(timeout);
    }
  }, [preventOverwrite]);

  // Handle: priceListModel + IUoMEntry + priceValue → update default row
  useEffect(() => {
    if (priceListModel.length && IUoMEntry) {
      const defaultRow = priceListModel.find(
        (row) => row.UomCode === IUoMEntry,
      );

      if (defaultRow) {
        const updatedRow = {
          ...defaultRow,
          Factor: "0.00",
          baspr: priceValue.toFixed(2),
          Price: priceValue.toFixed(2),
        };

        setFilteredPriceList([updatedRow]);
      }
    }
  }, [priceListModel, IUoMEntry, priceValue]);

  // Generic function to update values based on `calculatedValue`
  const updateNumValue = (entry, field) => {
    if (entry) {
      const matchedUoM = priceListModel.find((uom) => uom.UomCode === entry);
      if (matchedUoM) {
        const baseQty = parseFloat(matchedUoM.BaseQty);
        const altQty = parseFloat(matchedUoM.AltQty);
        setValue(field, calculatedValue / (altQty / baseQty));
      }
    }
  };

  // Utility function to get UoM Name from Code
  const getUomNameFromCode = (code) => {
    const match = priceListModel.find((item) => item.UomCode === code);
    return match ? match.UomName : "";
  };

  // Generic hook to handle UoM name update
  const useAutoUpdateUomName = (entryKey, targetField) => {
    useEffect(
      () => {
        const entryValue = getValues(entryKey);
        if (entryValue) {
          const name = getUomNameFromCode(entryValue);
          setValue(targetField, name);
        }
      }, // eslint-disable-next-line react-hooks/exhaustive-deps
      [getValues(entryKey), priceListModel],
    );
  };
  useAutoUpdateUomName("INUoMEntry", "CntUnitMsr");
  useAutoUpdateUomName("SUoMEntry", "SalUnitMsr");
  useAutoUpdateUomName("PUoMEntry", "BuyUnitMsr");
  useAutoUpdateUomName("IUoMEntry", "InvntoryUOM");
  const useAutoUpdateNumValue = (entry, field) => {
    useEffect(() => {
      updateNumValue(entry, field);
    }, [calculatedValue, entry, priceListModel]);
  };

  // Using the generic hooks:
  useAutoUpdateNumValue(selectedINUoMEntry, "NumInCnt");
  useAutoUpdateNumValue(selectedSUomEntry, "NumInSale");
  useAutoUpdateNumValue(selectedPUomEntry, "NumInBuy");

  // ==========================Handle UoM Selection==================
  const handleUOMSelect = (
    entryField,
    nameField,
    setEntry,
    line,
    closeDialog,
  ) => {
    setValue(entryField, line.UomCode);
    setValue(nameField, line.UomName);
    setEntry(line.UomEntry);
    closeDialog(false);
  };

  // =======================Handlers for UoM selections===================
  const handlePurchaseUOMSelect = (line) =>
    handleUOMSelect(
      "PUoMEntry",
      "BuyUnitMsr",
      setSelectedPrchseUomEntry,
      line,
      setIsDialogOpen,
    );
  const handleSalesUOMSelect = (line) =>
    handleUOMSelect(
      "SUoMEntry",
      "SalUnitMsr",
      setSelectedUomEntry,
      line,
      setIsDialogOpen,
    );
  const handleInvntSelect = (line) =>
    handleUOMSelect(
      "INUoMEntry",
      "CntUnitMsr",
      setSelectedINUomEntry,
      line,
      setIsInvntDialogOpen,
    );
  const handleIUoMSelect = (line) => {
    handleUOMSelect(
      "IUoMEntry",
      "InvntoryUOM",
      setSelectedIUomEntry,
      line,
      setIsInvntUOMDialogOpen,
    );

    // Clear all price map values when IUoMEntry changes (in update scenario)
    clearPriceMap();
    setFilteredPriceList([]); // Also clear filtered rows
    setValue("Price", "");
    setFilteredPriceList((prev) =>
      prev.map((row) => ({
        ...row,
        baspr: "",
        Price: "",
      })),
    );
    setValue("Price", "");
  };

  const handleUnitPriceChange = (e, row) => {
    const newUnitPrice = parseFloat(e.target.value) || 0;
    const basePrice = parseFloat(row.baspr) || 0;

    // Calculate Factor only if basePrice is not zero
    const newFactor =
      basePrice !== 0
        ? (((basePrice - newUnitPrice) / basePrice) * 100).toFixed(2)
        : "0.00";

    setFilteredPriceList((prev) =>
      prev.map((r) =>
        r.UomCode === row.UomCode
          ? { ...r, Price: newUnitPrice.toFixed(2), Factor: newFactor }
          : r,
      ),
    );
  };
  const colpricelist = [
    {
      field: "UomCode",
      headerName: "UoM Code",
      width: 150,
      editable: false,
    },
    {
      field: "UomName",
      headerName: "UoM Name",
      width: 150,
      editable: false,
    },
    {
      field: "baspr",
      headerName: "Base Price",
      width: 150,
      editable: false,
      renderCell: (params) => (
        <InputTextField
          name="baspr"
          value={parseFloat(params.row.baspr || 0).toFixed(2)}
          fullWidth
          sx={{ width: 120 }}
          variant="outlined"
          size="small"
          readOnly
        />
      ),
    },
    {
      field: "Factor",
      headerName: "Reduced by %",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const isBaseRow = params.row.UomCode === IUoMEntry;
        return (
          <InputTextField
            name="Factor"
            type="number"
            sx={{ width: 120 }}
            value={params.row.Factor || ""}
            onChange={(e) => handleReduceByChange(e, params.row)}
            fullWidth
            variant="outlined"
            size="small"
            readOnly={isBaseRow}
          />
        );
      },
    },
    {
      field: "Price",
      headerName: "Unit Price",
      width: 150,
      editable: false,
      renderCell: (params) => {
        const isBaseRow = params.row.UomCode === IUoMEntry;
        return (
          <InputTextField
            value={parseFloat(params.row.Price || 0)}
            name="Price"
            onChange={(e) => handleUnitPriceChange(e, params.row)}
            fullWidth
            variant="outlined"
            sx={{ width: 120 }}
            size="small"
            readOnly={isBaseRow}
            inputProps={{
              inputMode: "decimal",
              pattern: "-?\\d{0,15}(\\.\\d{0,3})?",
              onInput: (e) => {
                const value = e.target.value;
                const regex = /^-?\d{0,15}(\.\d{0,3})?$/;

                if (!regex.test(value)) {
                  e.target.value = value.slice(0, -1);
                }
              },
            }}
          />
        );
      },
    },
  ];

  //============================================================= All other API=============================

  const SeriesData = async () => {
    try {
      setLoading(true);

      const docDate = dayjs().format("YYYY-MM-DD"); // avoid dayjs(undefined)

      const res = await apiClient.get(
        `/DocSeriesV2/ForTrans?ObjType=4&DocDate=${docDate}`,
      );

      const response = res.data;

      if (response?.success && Array.isArray(response.values)) {
        const values = response.values;

        setSeriesdata(values);

        // Set default series only in SAVE mode or when needed
        if (saveUpdateName === "SAVE" && values.length > 0) {
          setValue("Series", values[0]?.SeriesId || "");
          setValue("ItemCode", values[0]?.DocNum || "");
        }
      } else {
        Swal.fire({
          title: "Warning!",
          text: response?.message || "No series data found.",
          icon: "warning",
        });
      }
    } catch (error) {
      console.error("Error fetching series data:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch series data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const docDate = dayjs().format("YYYY-MM-DD");

  // const { DocSeries } = useDocumentSeries(
  //   "4",
  //   docDate,
  //   setValue,
  //   clearCache,
  //   saveUpdateName
  // );
  const GetLengthWidth = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/LengthandWidth/Pages/1/0`);
      const data = res?.data;

      if (!data?.values || !Array.isArray(data.values)) {
        throw new Error("Invalid Length and Width response");
      }

      const units = data.values;
      setVolumeUnits(units);

      // 🔹 Find millimeter unit safely
      const millimeterUnit = units.find(
        (unit) =>
          typeof unit?.UnitName === "string" &&
          unit.UnitName.toLowerCase() === "millimeter",
      );

      // 🔹 Set defaults only if found
      if (millimeterUnit?.DocEntry) {
        const unitId = millimeterUnit.DocEntry.toString();

        const unitFields = [
          "BVolUnit",
          "SVolUnit",
          "BLen1Unit",
          "BWdth1Unit",
          "BHght1Unit",
          "SLen1Unit",
          "SWdth1Unit",
          "SHght1Unit",
        ];

        unitFields.forEach((field) => setValue(field, unitId));
      }
    } catch (error) {
      console.error("Error fetching Length & Width:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch Length and Width data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const FetchServiceCategory = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/ServiceCategories/All`);
      const data = res?.data;

      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid Service Category response");
      }

      // 🔹 Filter active categories safely
      const activeCategories = data.values.filter(
        (item) => String(item?.Status) === "1",
      );

      setServiceCategories(activeCategories);

      // 🔹 Optional: set default value on SAVE
      // if (saveUpdateName === "SAVE" && activeCategories.length > 0) {
      //   setValue("ItemGroupCode", activeCategories[0].DocEntry);
      // }
    } catch (error) {
      console.error("Error fetching Service Categories:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch Service Category data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const FetchPriceList = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/PriceList/All`);
      const data = res?.data;

      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid PriceList response");
      }

      // 🔹 Filter active price lists safely
      const activePriceLists = data.values.filter(
        (item) => String(item?.Status) === "1",
      );

      setPriceList(activePriceLists);

      // 🔹 Set default Price List
      if (activePriceLists.length > 0) {
        const defaultDocEntry = activePriceLists[0].DocEntry;
        setValue("ListName", defaultDocEntry);

        // Optional: trigger dependent logic
        // handlePriceListChange(defaultDocEntry);
      }
    } catch (error) {
      console.error("Error fetching PriceList:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch PriceList data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const FetchShippingType = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/ShippingType/all`);
      const data = res?.data;

      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid ShippingType response");
      }

      setShippType(data.values);

      // 🔹 Set default Shipping Type
      if (data.values.length > 0) {
        setValue("ShipType", data.values[0].DocEntry);
      }
    } catch (error) {
      console.error("Error fetching ShippingType:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch Shipping Type data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  //==================================================Functions for opening and closing modals=========================

  const handleClickOpen = () => setopenacc(true);
  const handleClickHsnBtn = () => setHsnOpen(true);
  const handleClickSACBtn = () => setSACOpen(true);
  const handleClickOpen1 = () => setopenacc1(true);
  const handleClose = () => setopenacc(false);
  const handlehsnClose = () => setHsnOpen(false);
  const handleSACClose = () => setSACOpen(false);
  const handleClose1 = () => setopenacc1(false);
  const handleTabChangeRight = (e, newvalue1) => settab(newvalue1);
  const handleChange = (event, newValue) => setTabValue(newValue);
  const openInvntDialog = () => setIsInvntDialogOpen(true);
  const closeInvntDialog = () => {
    setIsInvntDialogOpen(false);
    clearSearch();
  };
  const openInvntUoMDialog = () => setIsInvntUOMDialogOpen(true);
  const closeInvntUoMDialog = () => {
    setIsInvntUOMDialogOpen(false);
    clearSearch();
  };
  const openPreVen = () => setPreVend(true);
  const handleCloseDialog = () => {
    clearSearch();
    setIsDialogOpen(false); // close dialog
  };
  const handleClosePreVen = () => setPreVend(false);
  const toggleDrawer = () => setSidebarOpen(!sidebarOpen);

  //==================================================Warehouse Datagrid Data in Inventory Tab==================================
  // const handleInputChange = useCallback((rowId, field, value) => {
  //   setRows((prevRows) =>
  //     prevRows.map((row) =>
  //       row.id === rowId ? { ...row, [field]: value } : row
  //     )
  //   );
  // }, []);

  const handleCheckboxChange = useCallback((id, checked) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        checked: row.id === id ? checked : false, // ✅ uncheck others
      })),
    );
  }, []);

  const handleLockedChange = useCallback((id, checked) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, Locked: checked ? "1" : "0" } : row,
      ),
    );
  }, []);

  const baseColumns = useMemo(
    () => [
      {
        field: "check",
        headerName: "Default WHSE",
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Checkbox
            checked={!!params.row.checked}
            onClick={(e) => e.stopPropagation()} // ✅ REQUIRED
            onChange={(e) =>
              handleCheckboxChange(params.row.id, e.target.checked)
            }
          />
        ),
      },

      {
        field: "WHSCode",
        headerName: "Whse Code",
        width: 200,
        editable: false,
        sortable: false,
      },
      {
        field: "WhsName",
        headerName: "Whse Name",
        width: 200,
        editable: false,
        sortable: false,
      },
      {
        field: "Locked",
        headerName: "Locked",
        width: 80,
        sortable: false,
        renderCell: (params) => (
          <Checkbox
            checked={params.row.Locked === "1"}
            onChange={(e) =>
              handleLockedChange(params.row.id, e.target.checked)
            }
          />
        ),
      },

      {
        field: "OnHand",
        headerName: "In Stock",
        width: 200,
        editable: false,
        sortable: false,
      },
      {
        field: "IsCommited",
        headerName: "Committed",
        width: 200,
        editable: false,
        sortable: false,
      },

      {
        field: "OnOrder",
        headerName: "Ordered",
        width: 200,
        editable: false,
        sortable: false,
      },

      {
        field: "Available",
        headerName: "Available",
        width: 200,
        editable: false,
        sortable: false,
      },

      {
        field: "AvgPrice",
        headerName: "Item Cost",
        width: 200,
        editable: false,
        sortable: false,
      },

      // {
      //   field: "AvgPrice",
      //   headerName: "Item Cost",
      //   width: 150,
      //   editable: false,
      //   sortable: false,
      //   flex: 1,
      //   renderCell: (params) => (
      //     <InputTextField
      //       type="number"
      //       name="AvgPrice"
      //       readOnly
      //       value={params.value}
      //       onChange={(e) => handleInputChange(e, params.row.id, "AvgPrice")}
      //     />
      //   ),
      // },
      // {
      //   field: "",
      //   headerName: "Inventory Acct",
      //   width: 200,
      //   editable: false,
      //   sortable: false,
      //   flex: 1,
      //   renderCell: (params) => (
      //     <InputTextField
      //       type="number"
      //       name=""
      //       readOnly
      //       value={params.value}
      //       onChange={(e) => handleInputChange(e, params.row.id, "")}
      //     />
      //   ),
      // },
      // {
      //   field: "SaleCostAc",
      //   headerName: "Cost of Goods Sold Acct",
      //   width: 200,
      //   editable: false,
      //   sortable: false,
      //   flex: 1,
      //   renderCell: (params) => (
      //     <InputTextField
      //       type="number"
      //       name="SaleCostAc"
      //       readOnly
      //       value={params.value}
      //       onChange={(e) => handleInputChange(e, params.row.id, "SaleCostAc")}
      //     />
      //   ),
      // },
      // {
      //   field: "Alert",
      //   headerName: "Alert",
      //   width: 150,
      //   editable: false,
      //   sortable: false,
      //   flex: 1,
      //   renderCell: (params) => <Checkbox checked={params.row.Alert} />,
      // },
    ],
    [selectedRow, handleCheckboxChange, handleLockedChange],
  );
  const additionalColumns = useMemo(
    () => [
      {
        field: "MinStock",
        headerName: "Minimum Inventory Level",
        width: 150,
        sortable: false,
        type: "number",
        editable: true,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Typography textAlign="center">
            {params.value != null ? params.value : ""}
          </Typography>
        ),
      },
      {
        field: "MaxStock",
        headerName: "Maximum Inventory Level",
        width: 150,
        sortable: false,
        type: "number",
        editable: true,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Typography textAlign="center">
            {params.value != null ? params.value : ""}
          </Typography>
        ),
      },
      {
        field: "MinOrder",
        headerName: "Required (Purchasing UOM)",
        width: 150,
        sortable: false,
        type: "number",
        editable: true,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <Typography textAlign="center">
            {params.value != null ? params.value : ""}
          </Typography>
        ),
      },
    ],
    [],
  );

  const loadWarehouseLines = async (
    oInvntLines = [],
    defaultWhs = "",
    mode = "UPDATE",
  ) => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/Warehouse/all`);
      const data = res?.data;

      // 🔐 Validate backend response
      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid Warehouse response");
      }

      // 🔹 Only active warehouses
      const activeWarehouses = data.values.filter(
        (warehouse) => Number(warehouse.Status) === 1,
      );

      // 🔹 Existing warehouse codes
      const existingWhsCodes = new Set(oInvntLines.map((line) => line.WHSCode));

      // 🔹 Create missing warehouse rows
      const additionalLines = activeWarehouses
        .filter((warehouse) => !existingWhsCodes.has(warehouse.WHSCode))
        .map((warehouse, index) => ({
          id: oInvntLines.length + index,
          WHSCode: warehouse.WHSCode,
          WhsName: warehouse.WHSName,
          Locked: warehouse.Locked === "1" ? "1" : "0",
          OnHand: "",
          IsCommited: "",
          OnOrder: "",
          Available: "",
          AvgPrice: "",
          SaleCostAc: "",
          Alert: false,
          MinStock: "",
          MaxStock: "",
          MinOrder: "",
        }));

      // 🔹 Merge existing + new
      const mergedRows = [...oInvntLines, ...additionalLines].map(
        (row, index) => ({
          ...row,
          checked: mode === "SAVE" ? index === 0 : row.WHSCode === defaultWhs,
        }),
      );

      setRows(mergedRows);
      setSelectedRow(mergedRows.find((r) => r.checked) || null);
    } catch (error) {
      console.error("Error loading warehouse lines:", error);

      setRows([]);
      setSelectedRow(null);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to load warehouse data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const colInvnData = useMemo(() => {
    return isByWhChecked ? [...baseColumns, ...additionalColumns] : baseColumns;
  }, [isByWhChecked]);

  //================================================================================================================
  const AllData = getValues();

  const isPhantomChecked = watch("Phantom", false);
  useEffect(() => {
    if (isPhantomChecked) {
      setValue("InCostRoll", false);
    }
  }, [isPhantomChecked, setValue]);
  const valuationMethod = watch("EvalSystem");
  useEffect(() => {
    if (isByWhChecked === true) {
      setValue("ReorderQty", "");
      setValue("MinLevel", "");
      setValue("MaxLevel", "");
    }
  }, [isByWhChecked, setValue, saveUpdateName]);

  //============================================================= volume Calculation=============================
  const length = watch("BLength1");
  const width = watch("BWidth1");
  const height = watch("BHeight1");
  const BLen1Unit = watch("BLen1Unit");
  const BWdth1Unit = watch("BWdth1Unit");
  const BHght1Unit = watch("BHght1Unit");

  const Slength = watch("SLength1");
  const Swidth = watch("SWidth1");
  const Sheight = watch("SHeight1");
  const SLen1Unit = watch("SLen1Unit");
  const SWdth1Unit = watch("SWdth1Unit");
  const SHght1Unit = watch("SHght1Unit");

  const selectedUnit = watch("BVolUnit");
  const selectedvolUnit = watch("SVolUnit");

  const getSizeInMM = (docEntry) => {
    return (
      volumeUnits.find(
        (unit) => unit.DocEntry?.toString() === docEntry?.toString(),
      )?.SizeInMM || 1
    );
  };
  const calculateVolume = (
    length,
    width,
    height,
    lengthUnit,
    widthUnit,
    heightUnit,
    selectedDocEntry,
    volumeKey,
    volumeUnits,
  ) => {
    if (!length || !width || !height) {
      setValue(volumeKey, "");
      return;
    }

    const lengthMM = length * getSizeInMM(lengthUnit);
    const widthMM = width * getSizeInMM(widthUnit);
    const heightMM = height * getSizeInMM(heightUnit);
    const volumeInMM3 = lengthMM * widthMM * heightMM;

    const selectedUnit = volumeUnits.find(
      (unit) => unit.DocEntry?.toString() === selectedDocEntry?.toString(),
    );

    if (!selectedUnit) {
      setValue(volumeKey, volumeInMM3.toFixed(2));
      return;
    }

    const sizeInMM = Number(selectedUnit.SizeInMM);
    const convertedVolume = volumeInMM3 / Math.pow(sizeInMM, 3);
    setValue(volumeKey, parseFloat(convertedVolume.toFixed(3)));
  };

  useEffect(() => {
    if (!volumeUnits.length) return;

    calculateVolume(
      length,
      width,
      height,
      BLen1Unit,
      BWdth1Unit,
      BHght1Unit,
      selectedUnit,
      "BVolume",
      volumeUnits,
    );
    calculateVolume(
      Slength,
      Swidth,
      Sheight,
      SLen1Unit,
      SWdth1Unit,
      SHght1Unit,
      selectedvolUnit,
      "SVolume",
      volumeUnits,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    length,
    width,
    height,
    BWdth1Unit,
    BLen1Unit,
    BHght1Unit,
    SHght1Unit,
    SWdth1Unit,
    SHght1Unit,
    Slength,
    Swidth,
    Sheight,
    selectedUnit,
    selectedvolUnit,
    volumeUnits,
    setValue,
  ]);

  //=======================================Attachment tab=========================================
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => {};

      setUploadImage((prevState) => ({
        ...prevState,
        [event.target.id]: URL.createObjectURL(event.target.files[0]),
      }));
    }
  };

  const clearFormData = () => {
    clearPriceMap();

    reset(initial);
    setSelectedVendor("");
    setSaveUpdateName("SAVE");
    FetchItemGroup();
    FetchPriceList();
    FetchShippingType();
    GetLengthWidth();
    loadWarehouseLines([], "", "SAVE");
    setValHsnList("");
    setValue("Price", "");
    setValue("Series", seriesdata[0]?.SeriesId ?? "");
    setValue("ItemCode", seriesdata[0]?.DocNum ?? "");
    // setPriceMap({});
    setFromDate(null);
    setToDate(null);
    setRows([]);
    setSelectedData([]);
    setSelectedItems([]);
    setOItemVendorLines([]);
    setSelectedINUomEntry(null);
    setSelectedIUomEntry(null);
    setSelectedUomEntry(null);
    setSelectedPrchseUomEntry(null);
    clearFiles();
    setItemImages([]);
  };

  //====================================Active Tab API Binding for BP====================================================================
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true);

      const url = searchTerm
        ? `/ItemsV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/ItemsV2/Pages/1/${pageNum}/20`;

      const res = await apiClient.get(url);
      const data = res?.data;

      // 🔐 Validate response
      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid Items response");
      }

      const newData = data.values;

      // 🔹 Check pagination
      setHasMoreOpen(newData.length === 20);

      // 🔹 Append or reset list
      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData],
      );
    } catch (error) {
      console.error("Error fetching Items list:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to load Items list.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
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
  };

  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear search input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };

  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  // ============================================InActive List Start ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true);

      const url = searchTerm
        ? `/ItemsV2/Search/${searchTerm}/0/${pageNum}/20`
        : `/ItemsV2/Pages/0/${pageNum}/20`;

      const res = await apiClient.get(url);
      const data = res?.data;

      // 🔐 Validate backend response
      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid inactive items response");
      }

      const newData = data.values;

      // 🔹 Pagination check
      setHasMoreClosed(newData.length === 20);

      // 🔹 Append or reset list
      setClosedListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData],
      );
    } catch (error) {
      console.error("Error fetching inactive items:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to load inactive item list.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleClosedListClear = () => {
    setClosedListQuery(""); // Clear search input
    setClosedListSearching(false); // Reset search state
    setClosedListPage(0); // Reset page count
    setClosedListData([]); // Clear data
    fetchClosedListData(0); // Fetch first page without search
  };

  const fetchMoreClosedListData = () => {
    fetchClosedListData(
      closedListPage + 1,
      closedListSearching ? closedListquery : "",
    );
    setClosedListPage((prev) => prev + 1);
  };
  useEffect(() => {
    setValue("EvalSystem", EvalSystem);
    fetchClosedListData(0);
    FetchItemGroup();
    FetchUoMGroup();
    FetchPriceList();
    FetchShippingType();
    loadWarehouseLines([], "", "SAVE");
    fetchVendorListData(0);
    fetchOpenListData(0);
    SeriesData();
    // UGPAll();
    GetLengthWidth();
    FetchServiceCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================================================================================

  //Item Group, UoM Group, Price List API Get Method Drop Down Field.....
  const FetchItemGroup = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/ItemGroupV2/all`);
      const data = res?.data;

      // 🔐 Validate API response
      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid Item Group response");
      }

      // 🔹 Filter active item groups
      const activeGroups = data.values.filter((item) => item.Status === "1");

      setItemGroup(activeGroups);

      // 🔹 Set default only in SAVE mode
      if (saveUpdateName === "SAVE" && activeGroups.length > 0) {
        setValue("ItemGroupCode", activeGroups[0].DocEntry);
      }
    } catch (error) {
      console.error("Error fetching Item Group:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch Item Group list.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUomGroupChange = (docEntry) => {
    // If UOM Group is "Manual" (UgpEntry = "0"), clear the UOM fields
    // if(saveUpdateName==="SAVE")
    // {
    setFilteredPriceList([]);
    setRemainingUoMs([]);
    setSelectedUoMs([]);
    setSelectedPriceList("");
    setPreventOverwrite(false);
    clearPriceMap(); // }
    setValue("Price", "");
    if (docEntry === "0") {
      setValue("IUoMEntry", "");
      setValue("InvntoryUOM", "");
      setValue("PUoMEntry", "");
      setValue("BuyUnitMsr", "");
      setValue("NumInBuy", "");
      setValue("SUoMEntry", "");
      setValue("SalUnitMsr", "");
      setValue("NumInSale", "");
      setValue("INUoMEntry", "");
      setValue("CntUnitMsr", "");
      setValue("NumInCnt", "");
      setPriceListModel([]);
      setIsLoading(false);
      setHasMore(false);
    } else {
      // Proceed with the existing logic if UOM Group is not "Manual"
      const selectedGroup = uomGroup.find(
        (group) => group.DocEntry === docEntry,
      );

      if (selectedGroup) {
        const defaultUoM = selectedGroup.oLines.find(
          (line) => line.UomEntry === line.BaseUom,
        );

        const iuomEntryForApi = defaultUoM ? defaultUoM.UomEntry : "";

        setValue("IUoMEntry", defaultUoM ? defaultUoM.UomCode : "");
        setValue("InvntoryUOM", defaultUoM ? defaultUoM.UomName : "");
        setSelectedIUomEntry(iuomEntryForApi);

        // 🔹 clear other UOM fields
        setValue("PUoMEntry", "");
        setValue("BuyUnitMsr", "");
        setValue("NumInBuy", "");
        setValue("SUoMEntry", "");
        setValue("SalUnitMsr", "");
        setValue("NumInSale", "");
        setValue("INUoMEntry", "");
        setValue("CntUnitMsr", "");
        setValue("NumInCnt", "");

        // 🔹 build priceListModel
        const formattedLines = selectedGroup.oLines.map((line, index) => ({
          id: index,
          LineNum: line.LineNum,
          UomEntry: line.UomEntry,
          UomCode: line.UomCode,
          UomName: line.UomName,
          BaseQty: line.BaseQty,
          BaseUom: line.BaseUom,
          PriceList: "",
          AltQty: line.AltQty,
          Factor: "",
          Price: "",
          check: false,
        }));

        setPriceListModel(formattedLines);

        // ✅ PUT YOUR CODE HERE ⬇️⬇️⬇️
        const baseUomCode = defaultUoM?.UomCode;

        if (baseUomCode) {
          const baseRow = formattedLines.find((l) => l.UomCode === baseUomCode);

          if (baseRow) {
            setFilteredPriceList([
              {
                ...baseRow,
                Factor: "0.00",
                baspr: "0.00",
                Price: "0.00",
              },
            ]);

            setRemainingUoMs(
              formattedLines.filter((l) => l.UomCode !== baseUomCode),
            );
          }
        }

        setIsLoading(false);
        setHasMore(formattedLines.length > 0);
      } else {
        setPriceListModel([]);
        setIsLoading(false);
        setHasMore(false);
      }
    }
  };

  const FetchUoMGroup = async (
    PUoMEntryValue,
    SUoMEntryValue,
    IUoMEntryValue,
    INUoMEntryValue,
  ) => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/UGP/All`);
      const data = res?.data;

      // 🔐 Validate response
      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid UoM Group response");
      }

      const response = data.values;

      setUomGroup(response);
      setUgpAllData(response);

      // 🔹 Create map for fast lookup (UomEntry → UomCode)
      const uomMap = new Map();

      response.forEach((group) => {
        group?.oLines?.forEach((line) => {
          if (line?.UomEntry && line?.UomCode) {
            uomMap.set(line.UomEntry, line.UomCode);
          }
        });
      });

      // 🔹 Safely set form values if entry exists
      if (PUoMEntryValue && uomMap.has(PUoMEntryValue)) {
        setValue("PUoMEntry", uomMap.get(PUoMEntryValue));
      }

      if (SUoMEntryValue && uomMap.has(SUoMEntryValue)) {
        setValue("SUoMEntry", uomMap.get(SUoMEntryValue));
      }

      if (IUoMEntryValue && uomMap.has(IUoMEntryValue)) {
        setValue("IUoMEntry", uomMap.get(IUoMEntryValue));
      }

      if (INUoMEntryValue && uomMap.has(INUoMEntryValue)) {
        setValue("INUoMEntry", uomMap.get(INUoMEntryValue));
      }
    } catch (error) {
      console.error("Error fetching UoM Group:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to load UoM Group list.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemGroupChange = (ItemGroupCode) => {
    const selectedItem = itemGroup.find(
      (item) => item.DocEntry === ItemGroupCode,
    );

    if (!selectedItem) {
      setValue("UgpEntry", "0");
      setPriceListModel([]);
      setHasMore(false);
      return;
    }
    setValue("EvalSystem", selectedItem.InvntSys || companyData?.InvntSystm);

    // If Item Group has no UOM Group → Manual
    if (!selectedItem.UgpCode || selectedItem.UgpCode === "0") {
      setValue("UgpEntry", "0");
      handleUomGroupChange("0");
      return;
    }

    // 🔑 Match UgpCode with uomGroup and get its DocEntry
    const matchedUomGroup = uomGroup.find(
      (uom) => uom.UgpCode === selectedItem.UgpCode,
    );

    if (matchedUomGroup) {
      setValue("UgpEntry", matchedUomGroup.DocEntry);
      handleUomGroupChange(matchedUomGroup.DocEntry);
    } else {
      // fallback if not found
      setValue("UgpEntry", "0");
      handleUomGroupChange("0");
    }
  };

  //=============================================HSN Modal====================================================
  const colHSNList = [
    // {
    //   field: "check",
    //   headerName: "Default",
    //   width: 70,
    //   renderCell: (params) => (
    //     <Checkbox
    //       name="check"
    //       checked={
    //         valHsnList ===
    //         `${params.row.Chapter}.${params.row.Heading}.${params.row.SubHeading}`
    //       }
    //       onChange={() => handlecheckboxListHsn(params.row)}
    //     />
    //   ),
    // },
    {
      field: "ChapterId",
      headerName: "Chapter ID",
      width: 150,
      editable: true,
    },
    // {
    //   field: "Heading",
    //   headerName: "Heading",
    //   width: 150,
    //   editable: true,
    // },
    // {
    //   field: "SubHeading",
    //   headerName: "Subheading",
    //   width: 150,
    //   editable: true,
    // },
    {
      field: "Description",
      headerName: "Description",
      width: 350,
      editable: true,
    },
    // {
    //   field: "itempri",
    //   headerName: "Item Price",
    //   width: 150,
    //   editable: true,
    // },
    // {
    //   field: "lastpric",
    //   headerName: "Last Price",
    //   width: 150,
    //   editable: true,
    // },
  ];

  const hsnCacheRef = useRef({});
  const FetchHsnList = async ({ page = 0, search = "" }) => {
    setIsLoading(true);
    const cacheKey = `${search}-${page}`;

    try {
      const url = search
        ? `/HSN/Search/${search}/1/${page}/20`
        : `/HSN/Pages/1/${page}/20`;

      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success === true) {
        const items = data?.values || [];

        setListHsn(items);
        hsnCacheRef.current[cacheKey] = items;
        if (items.length < 20) {
          setRowCount(page * 20 + items.length);
        } else if (page === 0) {
          setRowCount(1000);
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to Fetch HSN List",
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
    setCurrentPage(0); // Reset to first page when searching
    hsnCacheRef.current = {};
  }, []);

  const handleHsnRowSelection = (selectionModel) => {
    const selectedRow = listHsn.find(
      (row) => row.DocEntry === selectionModel[0],
    );
    setSelectedHsnRow(selectedRow || null); // Ensure only one is selected
  };

  const handleHsnCellClick = (params) => {
    const row = params.row;
    const concatValue = `${row.Chapter || ""}.${row.Heading || ""}.${
      row.SubHeading || ""
    }`;
    setValue("ChapterID", row.ChapterId); // react-hook-form field
    setValHsnList(row.ChapterId); // local display state (if needed)
    handlehsnClose(); // close the modal immediately on click
  };

  useEffect(() => {
    FetchHsnList({ page: currentPage, search: searchText });
  }, [currentPage, searchText]);

  //=============================================SAC Modal====================================================
  const colSACList = [
    // {
    //   field: "check",
    //   headerName: "Default",
    //   width: 70,
    //   renderCell: (params) => (
    //     <Checkbox
    //       name="check"
    //       checked={valSACList === `${params.row.ServCode}`}
    //       onChange={() => handlecheckboxListSAC(params.row)}
    //     />
    //   ),
    // },
    {
      field: "ServCode",
      headerName: "Service Code",
      width: 150,
      editable: true,
    },
    {
      field: "ServName",
      headerName: "Service Name",
      width: 150,
      editable: true,
    },
  ];

  const handleSACPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== currentSACPage) {
        setCurrentSACPage(model.page);
      }
    },
    [currentSACPage],
  );
  const handleSACSearchChange = useCallback((searchSACText) => {
    setSearchSACText(searchSACText);
    setCurrentSACPage(0); // Reset to first page when searching
    sacCacheRef.current = {};
  }, []);

  const handleSACRowSelection = (selectionModel) => {
    const selectedSACRow = listSAC.find(
      (row) => row.DocEntry === selectionModel[0],
    );
    setSelectedSACRow(selectedSACRow || null);
  };

  const handleSACCellClick = (params) => {
    const row = params.row;
    // const concatValue = `${row.ServCode || ""}`;
    setValue("SACEntry", row.ServCode); // react-hook-form field
    setValSACList(row.ServCode);
    setSACOpen(false);
  };

  useEffect(() => {
    FetchSACList({ page: currentSACPage, search: searchSACText });
  }, [currentSACPage, searchSACText]);

  const sacCacheRef = useRef({}); // { "search-page": items[] }

  const FetchSACList = async ({ page = 0, search = "" }) => {
    const cacheKey = `${search}-${page}`;

    // ✅ Check if cache already has data for this page
    if (sacCacheRef.current[cacheKey]) {
      setListSAC(sacCacheRef.current[cacheKey]);
      return;
    }

    setIsLoading(true);
    try {
      const url = search
        ? `/SACSetup/Search/${search}/1/${page}/20`
        : `/SACSetup/Pages/1/${page}/20`;

      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success === true) {
        const items = data?.values || [];
        setListSAC(items);

        // ✅ Save result in cache
        sacCacheRef.current[cacheKey] = items;

        if (items.length < 20) {
          setRowSACCount(page * 20 + items.length);
        } else if (page === 0) {
          setRowSACCount(1000);
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to fetch SAC List",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };
  //====================================Prefered Vendor Search Model API Binding for BP====================================================================
  const fetchVendorListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true);

      const url = searchTerm
        ? `/BPV2/V2/ByCardType/Search/${searchTerm}/V/1/${pageNum}/20`
        : `/BPV2/V2/ByCardType/Pages/V/1/${pageNum}/20`;

      const response = await apiClient.get(url);
      const data = response?.data;

      // 🔐 Validate API response
      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid Vendor list response");
      }

      const newData = data.values;

      setHasMoreGetList(newData.length === 20);

      setGetListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData],
      );
    } catch (error) {
      console.error("Error fetching vendor list:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch Vendors List",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenListSearch1 = (res) => {
    setGetListData([]);
    setGetListSearching(true);
    setGetListQuery(res);
    setGetListPage(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchVendorListData(0, res);
    }, 600);
  };
  const handleOpenListClear1 = () => {
    fetchVendorListData(0); // Fetch first page without search
    setGetListData([]);
    setGetListSearching(true);
    setGetListQuery("");
    setGetListPage(0);
  };
  const fetchMoreVendorListData = () => {
    fetchVendorListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };
  const saveData = () => {
    if (selectedItems.length > 0) {
      const newItems = selectedItems.filter((item) => {
        return !preferedVendor.some(
          (existingItem) => existingItem.CardCode === item.CardCode,
        );
      });

      if (newItems.length > 0) {
        setpreferedVendor((prev) => [...prev, ...newItems]);
      } else {
      }

      setPreVend(false);
      // setSelectedItems([]);
    } else {
    }
  };
  const handleCheckboxVendorChange = (row) => {
    setSelectedVendor(row.CardCode);
    handleClose1();
  };
  const colVedorList = [
    {
      field: "check",
      headerName: "Default",
      width: 100,
      renderCell: (params) => {
        const isChecked = params.row.CardCode === selectedVendor; // Check if this row is selected
        return (
          <Checkbox
            checked={isChecked}
            onChange={() => handleCheckboxVendorChange(params.row)}
          />
        );
      },
    },
    {
      field: "CardCode",
      headerName: "BP Code",
      width: 150,
      editable: true,
    },
    {
      field: "CardName",
      headerName: "BP Name",
      width: 200,
      editable: true,
    },
    // {
    //   field: "ACTION",
    //   headerName: "ACTION",
    //   width: 100,
    //   sortable: false,
    //   renderCell: (params) => {
    //     return (
    //       <IconButton
    //         color="error"
    //         onClick={() => handleDeleteRow(params.row.DocEntry)}
    //       >
    //         <DeleteIcon />
    //       </IconButton>
    //     );
    //   },
    // },
  ];
  //=============================================Delete API====================================================

  const handleOnDelete = async () => {
    const result = await Swal.fire({
      text: `Do You Want to delete "${AllData?.ItemCode}" ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Item Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.delete(`/ItemsV2/${AllData.DocEntry}`);

      const data = response?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Delete failed");
      }

      // ✅ Clear form & reload lists
      clearFormData();

      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      setClosedListPage(0);
      setClosedListData([]);
      fetchClosedListData(0);

      Swal.fire({
        title: "Success!",
        text: "Item Deleted",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1000,
      });
    } catch (error) {
      console.error("Delete Item Error:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message || error.message || "Item Not Deleted",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
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
          Item Master List
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
                <Tab value="1" label="Active" />
                <Tab value="0" label="Inactive" />
              </Tabs>

              <TabPanel
                value={"1"}
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
                  loader={<BeatLoader />}
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {openListData.map((item, i) => (
                    <CardComponent
                      key={i}
                      title={item.ItemCode}
                      subtitle={item.ItemName}
                      description={item.Price}
                      isSelected={selectedData === item.DocEntry}
                      searchResult={openListquery}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              <TabPanel
                value={"0"}
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
                      title={item.ItemCode}
                      subtitle={item.ItemName}
                      description={item.Price}
                      searchResult={closedListquery}
                      isSelected={selectedData === item.DocEntry}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <>
      {loading && <Loader open={loading} />}

      {/* ============== */}
      {/* Price Button Model */}
      <Dialog
        open={openacc}
        // onClose={handleClose}
        scroll="paper"
        fullWidth
        maxWidth="md" // Keeps the modal width responsive
      >
        <DialogTitle>
          <Grid container justifyContent="center">
            <Typography textAlign="center" fontWeight="bold">
              UOM List
            </Typography>
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ overflow: "hidden", width: "100%" }}>
          <Grid container item sx={{ px: 1, width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsUOMModalOpen(true)}
            >
              Select UoMs
            </Button>

            <Paper sx={{ width: "100%", overflow: "hidden", marginTop: "4px" }}>
              <Box sx={{ height: "60vh", width: "100%" }}>
                <DataGrid
                  key={`${getValues("UgpEntry")}-${filteredPriceList.length}`}
                  rows={filteredPriceList.length > 0 ? filteredPriceList : []}
                  columns={colpricelist}
                  getRowId={(row) => row.id || row.UomEntry}
                  getRowClassName={(params) =>
                    params.row.UomCode === getValues("IUoMEntry")
                      ? "base-uom-row"
                      : ""
                  }
                  columnHeaderHeight={35}
                  rowHeight={55}
                  className="datagrid-style"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                    "& .MuiDataGrid-cell": { border: "none" },
                    "& .MuiDataGrid-cell:focus": { outline: "none" },
                  }}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 50 } },
                    filter: {
                      filterModel: { items: [], quickFilterValues: [] },
                    },
                  }}
                  disableColumnFilter
                  disableColumnSelector
                  disableDensitySelector
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                      quickFilterProps: { debounceMs: 500 },
                    },
                  }}
                  pageSizeOptions={[3]}
                  isCellEditable={(params) =>
                    params.field === "Factor" &&
                    params.row.UomCode !== IUoMEntry
                  }
                  isRowSelectable={(params) =>
                    params.id !== filteredPriceList[0]?.id
                  }
                />
              </Box>
            </Paper>
          </Grid>
          <Grid
            item
            px={2}
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              position: "sticky",
              bottom: "0px",
            }}
          >
            <Grid mt={2}>
              <Button variant="contained" color="success" onClick={handleSave}>
                Save
              </Button>
            </Grid>
            <Grid>
              <Button variant="contained" color="error" onClick={handleClose}>
                Close
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isUOMModalOpen}
        onClose={() => setIsUOMModalOpen(false)}
        fullWidth
      >
        <DialogTitle textAlign="center" fontWeight="bold">
          Select More UoMs
        </DialogTitle>
        <DialogContent>
          <DataGrid
            rows={remainingUoMs}
            getRowId={(row) => row.id || row.UomEntry || row.UomCode}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            columns={[
              {
                field: "check",
                headerName: "Select",
                width: 100,
                renderCell: (params) => (
                  <Checkbox
                    checked={selectedUoMs.some(
                      (row) => row.UomEntry === params.row.UomEntry,
                    )}
                    onChange={() => handleSelectUoM(params.row)}
                    disabled={params.row.UomCode === getValues("IUoMEntry")} // disable for base row
                  />
                ),
              },
              { field: "UomCode", headerName: "UoM Code", width: 150 },
              { field: "UomName", headerName: "UoM Name", width: 150 },
            ]}
            pageSizeOptions={[49]}
          />
          <Grid
            item
            px={2}
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              position: "sticky",
              bottom: "0px",
            }}
          >
            <Grid mt={2}>
              <Button
                variant="contained"
                color="success"
                onClick={handleSaveSelectedUoMs}
              >
                Save
              </Button>
            </Grid>
            <Grid>
              <Button
                variant="contained"
                color="error"
                onClick={() => setIsUOMModalOpen(false)}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        {/* <DialogActions>
          
          <Button onClick={handleSaveSelectedUoMs} color="primary">
            Save
          </Button>
          <Button onClick={() => setIsUOMModalOpen(false)} color="error">
            Close
          </Button>
        </DialogActions> */}
      </Dialog>

      {/* HSN Button Model */}

      <DataGridCellClickModel
        open={hsnOpen}
        closeModel={handlehsnClose}
        // onSubmit={handleHsnSave}
        isLoading={isLoading}
        title="HSN List"
        getRowId={(row) => row.DocEntry}
        columns={colHSNList}
        rows={listHsn}
        taxCurrentPage={currentPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        oLines={getValues("oLines") || []}
        onRowSelectionModelChange={handleHsnRowSelection}
        onCellClick={handleHsnCellClick}
      />
      <DataGridCellClickModel
        open={openSAC}
        closeModel={handleSACClose}
        // onSubmit={handleHsnSave}
        isLoading={isLoading}
        title="SAC List"
        getRowId={(row) => row.DocEntry}
        columns={colSACList}
        rows={listSAC}
        taxCurrentPage={currentSACPage}
        limit={LIMIT}
        onPaginationModelChange={handleSACPaginationModelChange}
        searchText={searchSACText}
        onSearchChange={handleSACSearchChange}
        rowCount={rowSACCount}
        oLines={getValues("oLines") || []}
        onRowSelectionModelChange={handleSACRowSelection}
        onCellClick={handleSACCellClick}
      />
      {/* SAC Button Model */}

      <Dialog
        style={{ margin: "auto" }}
        open={openacc1}
        onClose={handleClose1}
        scroll="paper"
        component={"form"}
      >
        <DialogTitle>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={1}></Grid> {/* Empty left space */}
            <Grid item xs={10} display="flex" justifyContent="center">
              <Typography fontWeight={"bold"}>Vendor List</Typography>
            </Grid>
            <Grid item xs={1} display="flex" justifyContent="flex-end">
              <IconButton onClick={handleClose1}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid
            container
            item
            sx={{ px: 2, overflow: "auto", width: "100%", height: "70vh" }}
          >
            <Paper sx={{ width: "100%" }}>
              <DataGrid
                columnHeaderHeight={35}
                rowHeight={45}
                className="datagrid-style"
                rows={selectedItems.map((item, i) => ({
                  id: i, // Ensure a unique ID
                  CardCode: item.CardCode,
                  CardName: item.CardName,
                }))}
                columns={colVedorList}
                getRowId={(row) => row.CardCode || row.Line} // Ensure unique ID
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
                slots={{ toolbar: GridToolbarQuickFilter }} // Changed to only show quick filter (removes export)
                slotProps={{
                  toolbar: {
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                pageSizeOptions={[3]}
                sx={{
                  height: "100%",
                  backgroundColor:
                    theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                  "& .MuiDataGrid-cell": { border: "none" },
                  "& .MuiDataGrid-cell:focus": { outline: "none" },
                }}
              />
            </Paper>
          </Grid>

          <Grid
            item
            px={2}
            xs={12}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              position: "sticky",
              bottom: "0px",
            }}
          ></Grid>
        </DialogContent>
      </Dialog>

      {/* =================== */}
      {/* <Spinner open={loading} /> */}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
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
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={clearFormData}
            sx={{
              display: {}, // Show only on smaller screens
              position: "absolute",
              // top: "10px",
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
              Item Master
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
            >
              <Box
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                {" "}
                <Paper
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                    borderRadius: "12px",
                  }}
                >
                  <Grid container>
                    <Grid xs={12} sm={6} md={6} lg={4} textAlign={"center"}>
                      <Controller
                        name="Series"
                        control={control}
                        defaultValue={"0"}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            type="text"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="SERIES"
                            data={[
                              { key: "0", value: "MANUAL" },
                              ...(seriesdata || []).map((item) => ({
                                key: item.SeriesId,
                                value: item.SeriesName,
                              })),
                            ]}
                            disabled={saveUpdateName === "UPDATE"}
                            onChange={(e) => {
                              const selectedSeries = e.target.value;
                              field.onChange(selectedSeries);
                              setValue("Series", selectedSeries);

                              if (selectedSeries !== "0") {
                                const seriesData = seriesdata.find(
                                  (item) => item.SeriesId === selectedSeries,
                                );
                                setValue(
                                  "ItemCode",
                                  seriesdata[0]?.DocNum || "",
                                );
                                setValue(
                                  "SeriesName",
                                  seriesData?.SeriesName || "",
                                );
                                clearErrors("ItemCode");
                              } else {
                                setValue("ItemCode", "");
                                setValue("SeriesName", ""); // Clear SeriesName immediately
                                clearErrors("ItemCode");
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ItemCode"
                        control={control}
                        rules={{
                          required:
                            watch("Series") === "0"
                              ? "Item No is required"
                              : false,
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="ITEM NO."
                            type="text"
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            inputProps={{ maxLength: 50 }}
                            readOnly={
                              watch("Series") !== "0" ||
                              saveUpdateName === "UPDATE"
                            }
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ItemName"
                        control={control}
                        // rules={{
                        //   required: "Item Description is required", // Field is required
                        // }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="ITEM DESCRIPTION"
                            type="text"
                            inputProps={{ maxLength: 100 }}
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            // error={!!error} // Pass error state to the FormComponent if needed
                            // helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />{" "}
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="FrgnName"
                        control={control}
                        // rules={{
                        //   required: "Customer Id is required", // Field is required
                        // }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="FOREIGN NAME"
                            inputProps={{ maxLength: 100 }}
                            type="text"
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />{" "}
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ItemType"
                        rules={{ required: "this field is required " }}
                        control={control}
                        defaultValue="I"
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="ITEM TYPE"
                            {...field}
                            inputProps={{ maxLength: 50 }}
                            data={[
                              { key: "I", value: "Item" },
                              { key: "L", value: "Labor" },
                              { key: "T", value: "Travel" },
                            ]}
                            error={!!error}
                            helperText={error ? error.message : null}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);

                              if (value === "L" || value === "T") {
                                setValue("SellItem", "Y");
                                setValue("InventoryItem", "N");
                                setValue("PrchseItem", "N");
                              } else {
                                setValue("SellItem", "Y");
                                setValue("InventoryItem", "Y");
                                setValue("PrchseItem", "Y");
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ItemGroupCode"
                        rules={{ required: "Item Group is required " }}
                        control={control}
                        defaultValue=""
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            label="ITEM GROUP"
                            type="text"
                            {...field}
                            error={!!error}
                            inputProps={{ maxLength: 254 }}
                            helperText={error ? error.message : null}
                            data={itemGroup.map((item) => ({
                              key: item.DocEntry,
                              value: item.ItmsGrpNam,
                            }))}
                            onChange={(e) => {
                              field.onChange(e); // Call field's onChange
                              handleItemGroupChange(e.target.value); // Handle Item Group change and set UoM Group
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="UgpEntry"
                        control={control}
                        rules={{ required: "UOM Group is required " }}
                        defaultValue="0"
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            label="UOM GROUP"
                            {...field}
                            error={!!error}
                            inputProps={{ maxLength: 50 }}
                            helperText={error ? error.message : null}
                            data={[
                              { key: "0", value: "Manual" },

                              ...(uomGroup || []).map((item) => ({
                                key: item.DocEntry,
                                value: item.UgpCode,
                              })),
                            ]}
                            onChange={(e) => {
                              field.onChange(e);
                              handleUomGroupChange(e.target.value);
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ListName"
                        control={control}
                        rules={{ required: "Price List is required" }}
                        defaultValue=""
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            label="PRICE LIST"
                            {...field}
                            error={!!error}
                            inputProps={{ maxLength: 50 }}
                            helperText={error ? error.message : null}
                            data={priceList.map((item) => ({
                              key: item.DocEntry,
                              value: item.ListName,
                            }))}
                            // disabled={!selectUomGroup}
                            onChange={(e) => {
                              field.onChange(e);
                              handlePriceListChange(e.target.value);
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign="center"
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
                          name="Price"
                          control={control}
                          render={({ field, fieldState: { error } }) => {
                            // Get the selected price list's currency
                            const selectedPriceList = priceList.find(
                              (item) => item.DocEntry === watch("ListName"),
                            );
                            let currency = "";
                            if (saveUpdateName === "SAVE") {
                              currency = selectedPriceList?.PrimCurr;
                            } else if (
                              saveUpdateName === "UPDATE" &&
                              oLine?.length > 0
                            ) {
                              // Find the matching oLine for the selected price list
                              const matchingLine = oLine.find(
                                (line) => line.PriceList === watch("ListName"),
                              );
                              currency = matchingLine?.Currency;
                            }
                            return (
                              <InputTextField
                                label="PRICE"
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  let value = e.target.value;

                                  // ✅ Allow only digits + optional decimal (up to 3 places)
                                  const regex = /^\d{0,15}(\.\d{0,3})?$/;
                                  if (value === "" || regex.test(value)) {
                                    field.onChange(value);
                                    handlePriceChange(value);
                                  }
                                }}
                                InputLabelProps={{
                                  shrink: true, // forces label to stay at top
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      {currency}
                                    </InputAdornment>
                                  ),

                                  inputMode: "decimal",
                                  pattern: "-?\\d{0,15}(\\.\\d{0,3})?",
                                  onInput: (e) => {
                                    const value = e.target.value;
                                    const regex = /^-?\d{0,15}(\.\d{0,3})?$/;
                                    if (!regex.test(value))
                                      e.target.value = value.slice(0, -1);
                                  },
                                }}
                                error={!!error}
                                helperText={error ? error.message : null}
                                fullWidth
                                sx={{ marginRight: 1 }}
                              />
                            );
                          }}
                        />

                        <IconButton
                          onClick={handleClickOpen}
                          size="small"
                          style={{
                            backgroundColor:
                              watch("UgpEntry") === "0" ||
                              !watch("Price") ||
                              Number(watch("Price")) === 0
                                ? "gray"
                                : "green",
                            borderRadius: "10%",
                            color: "white",
                            height: 40,
                            padding: 10,
                          }}
                          disabled={
                            watch("UgpEntry") === "0" ||
                            !watch("Price") ||
                            Number(watch("Price")) === 0
                          }
                        >
                          <ViewListIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="CodeBars"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="BAR CODE"
                            type="text"
                            {...field}
                            inputProps={{ maxLength: 112 }}
                            disabled
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    ></Grid>
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    ></Grid>
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="InventoryItem"
                        control={control}
                        defaultValue={"Y"}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value === "Y"}
                                disabled={itemType === "L" || itemType === "T"}
                                onChange={(e) =>
                                  field.onChange(e.target.checked ? "Y" : "N")
                                }
                              />
                            }
                            label="INVENTORY ITEM"
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="SellItem"
                        control={control}
                        defaultValue={"Y"}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value === "Y"}
                                onChange={(e) =>
                                  field.onChange(e.target.checked ? "Y" : "N")
                                }
                              />
                            }
                            label="SALES ITEM"
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="PrchseItem"
                        control={control}
                        defaultValue={"Y"}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value === "Y"}
                                disabled={itemType === "L" || itemType === "T"}
                                onChange={(e) =>
                                  field.onChange(e.target.checked ? "Y" : "N")
                                }
                              />
                            }
                            label="PURCHASE ITEM"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                <Grid container>
                  <Grid container item>
                    <Paper
                      sx={{
                        width: "100%",
                        mb: 2,
                        p: 2,
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                        borderRadius: "12px",
                      }}
                    >
                      <Tabs
                        value={tabvalue}
                        onChange={handleChange}
                        // aria-label="disabled tabs example"
                        variant="scrollable" // Allows horizontal scrolling if needed
                        scrollButtons="auto"
                      >
                        <Tab value={0} label="General" />
                        <Tab value={1} label="Purchasing Data" />
                        <Tab value={2} label="Sales Data" />
                        <Tab value={3} label="Inventory Data" />
                        <Tab value={4} label="Planning Data" />
                        <Tab value={5} label="Production Data" />
                        <Tab value={6} label="Remarks" />
                        <Tab value={7} label="Attachment" />
                        <Tab value={8} label="Item Image" />

                        {/* <Tab value={2} label="Display" /> */}
                      </Tabs>

                      <Divider />

                      {tabvalue === 0 && (
                        <Box
                          // component="form"
                          sx={{
                            "& .MuiTextField-root": { m: 1 },
                          }}
                          noValidate
                          autoComplete="off"
                        >
                          <Grid container mt={1}>
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign="center"
                            >
                              <Controller
                                name="ItemClass"
                                control={control}
                                defaultValue="Material"
                                render={({ field }) => (
                                  <FormControl component="fieldset">
                                    <FormLabel component="legend">
                                      Item Category
                                    </FormLabel>
                                    <RadioGroup
                                      row
                                      value={field.value ?? "Material"} // fallback if undefined
                                      onChange={(e) => {
                                        const selectedValue = e.target.value;
                                        field.onChange(selectedValue);

                                        if (selectedValue === "Material") {
                                          setValue("ServiceCtg", "");
                                          setValSACList("");
                                        } else if (
                                          selectedValue === "Service"
                                        ) {
                                          setValue("MatType", "");
                                          setValHsnList("");
                                          setValue("AssblValue", "");
                                          setValue("NotifyASN", "");
                                          setValue("ProAssNum", "");
                                          setValue("onHldLimt", "");
                                          setValue("OnHldPert", "");
                                          setValue("ShipType", "");
                                        }
                                      }}
                                    >
                                      <FormControlLabel
                                        value="Service"
                                        control={
                                          <Radio
                                            disabled={
                                              inventoryItemValue === "Y"
                                            }
                                          />
                                        }
                                        label="Service"
                                      />
                                      <FormControlLabel
                                        value="Material"
                                        control={
                                          <Radio
                                            disabled={
                                              inventoryItemValue === "Y"
                                            }
                                          />
                                        }
                                        label="Material"
                                      />
                                    </RadioGroup>
                                  </FormControl>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              sx={{
                                textAlign: "center",
                              }}
                            >
                              {/* <Typography
    variant="subtitle1"
    sx={{ mb: 2, color:"gray",  fontWeight: 600 }}
  >
    Serial and Batch Numbers
  </Typography> */}

                              <FormLabel component="legend">
                                Serial and Batch Numbers
                              </FormLabel>

                              {itemType === "I" && (
                                <Grid
                                  container
                                  spacing={2}
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  {/* Manage By Item */}
                                  <Grid item lg={6} md={6} sm={6} xs={12}>
                                    <Controller
                                      name="ManageItem"
                                      control={control}
                                      defaultValue="None"
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputSelectTextField
                                          label="MANAGE BY ITEM"
                                          {...field}
                                          data={[
                                            { key: "None", value: "None" },
                                            { key: "Serial", value: "Serial" },
                                            { key: "Batch", value: "Batch" },
                                          ]}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                        />
                                      )}
                                    />
                                  </Grid>

                                  {watch("ManageItem") !== "None" && (
                                    <Grid item lg={6} md={6} sm={6} xs={12}>
                                      <Controller
                                        name="MngMethod"
                                        control={control}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputSelectTextField
                                            label="MANAGE METHOD"
                                            {...field}
                                            data={[
                                              {
                                                key: "A",
                                                value: "ON Every Transaction",
                                              },
                                              {
                                                key: "R",
                                                value: "On Release Only",
                                              },
                                            ]}
                                            error={!!error}
                                            helperText={
                                              error ? error.message : null
                                            }
                                          />
                                        )}
                                      />
                                    </Grid>
                                  )}
                                </Grid>
                              )}
                            </Grid>

                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign="center"
                            ></Grid>
                            {/* Shipping Type */}

                            {(inventoryItemValue === "Y" ||
                              (inventoryItemValue === "N" &&
                                watch("ItemClass") === "Material")) && (
                              <Grid
                                item
                                lg={4}
                                md={6}
                                sm={6}
                                xs={12}
                                textAlign="center"
                              >
                                <Controller
                                  name="ShipType"
                                  // rules={{
                                  //   required: "Shipping Type is required",
                                  // }}
                                  control={control}
                                  defaultValue="" // Provide a default value here
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSearchSelectTextField
                                      label="SHIPPING TYPE"
                                      {...field}
                                      data={shippType.map((item) => ({
                                        key: item.DocEntry,
                                        value: item.TrnspName,
                                      }))}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>
                            )}

                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign="center"
                              mt={1}
                              width={220}
                            >
                              <Controller
                                name="GSTRelevnt"
                                control={control}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        {...field}
                                        checked={field.value || false}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          field.onChange(checked);
                                          // Uncheck excisable if GST is checked
                                          setValue(
                                            "Excisable",
                                            checked
                                              ? false
                                              : watch("Excisable"),
                                          );
                                        }}
                                        sx={{
                                          textAlign: "center",
                                          width: 20,
                                          mr: 1,
                                        }}
                                      />
                                    }
                                    label="GST"
                                  />
                                )}
                              />
                            </Grid>
                            {(inventoryItemValue === "Y" ||
                              (inventoryItemValue === "N" &&
                                watch("ItemClass") === "Material")) && (
                              <Grid
                                item
                                lg={4}
                                md={6}
                                sm={6}
                                xs={12}
                                textAlign="center"
                                mt={1}
                                width={220}
                                // alignContent={"center"}
                              >
                                <Controller
                                  name="Excisable"
                                  control={control}
                                  render={({ field }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          {...field}
                                          checked={field.value || false}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            field.onChange(checked);
                                            // Automatically toggle the opposite field
                                            setValue(
                                              "GSTRelevnt",
                                              checked
                                                ? false
                                                : watch("GSTRelevnt"),
                                            );
                                          }}
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                            mr: 1,
                                          }}
                                        />
                                      }
                                      label="EXCISABLE"
                                    />
                                  )}
                                />
                              </Grid>
                            )}
                            {inventoryItemValue === "N" &&
                              watch("ItemClass") === "Service" && (
                                <>
                                  <Grid
                                    item
                                    lg={4}
                                    md={6}
                                    sm={6}
                                    xs={12}
                                    textAlign="center"
                                    mt={1}
                                    width={220}
                                    // alignContent={"center"}
                                  >
                                    <Controller
                                      name="ServiceCtg"
                                      // rules={{ required: "this field is required " }}
                                      control={control}
                                      defaultValue=""
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputSearchSelectTextField
                                          label="Service Category"
                                          // type="text"
                                          {...field}
                                          inputProps={{ maxLength: 50 }}
                                          data={ServiceCategories.map(
                                            (item) => ({
                                              key: item.DocEntry,
                                              value: item.ServiceCtg,
                                            }),
                                          )}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                        />
                                      )}
                                    />
                                  </Grid>
                                  {/* {!watch("GSTRelevnt") && (
                                    <Grid
                                      item
                                      lg={4}
                                      md={6}
                                      sm={6}
                                      xs={12}
                                      textAlign="center"
                                      mt={1}
                                      width={220}
                                    />
                                  )} */}
                                </>
                              )}
                            {inventoryItemValue === "N" &&
                              watch("ItemClass") === "Service" &&
                              watch("GSTRelevnt") && (
                                <Grid
                                  item
                                  lg={4}
                                  md={6}
                                  sm={6}
                                  xs={12}
                                  textAlign="center"
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
                                      name="SACEntry"
                                      control={control}
                                      rules={{
                                        required: "SAC Code is required",
                                      }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          // label="HSN"
                                          label="SAC"
                                          type="text"
                                          inputProps={{
                                            maxLength: 11,
                                            readOnly: !!valSACList,
                                            onInput: (e) => {
                                              if (e.target.value.length > 11) {
                                                e.target.value =
                                                  e.target.value.slice(0, 11);
                                              }
                                            },
                                          }}
                                          {...field}
                                          value={valSACList || field.value}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                        />
                                      )}
                                    />
                                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                                    <IconButton
                                      onClick={handleClickSACBtn}
                                      size="small"
                                      style={{
                                        backgroundColor: "green",
                                        borderRadius: "10%",
                                        color: "white",
                                        height: 40,
                                        padding: 10,
                                      }}
                                    >
                                      <ViewListIcon />
                                    </IconButton>
                                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                                  </Grid>
                                </Grid>
                              )}

                            {/* Conditional Rendering */}

                            {((watch("GSTRelevnt") &&
                              inventoryItemValue === "Y") ||
                              (watch("Excisable") &&
                                inventoryItemValue === "Y") ||
                              (inventoryItemValue === "N" &&
                                watch("ItemClass") === "Material")) && (
                              <>
                                <Grid
                                  item
                                  lg={4}
                                  md={6}
                                  sm={6}
                                  xs={12}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="MatType"
                                    control={control}
                                    defaultValue="MAT" // Adjust based on default case
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputSelectTextField
                                        label="MATERIAL TYPE"
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        data={[
                                          { key: "MAT", value: "Raw Material" },
                                          {
                                            key: "CAP",
                                            value: "Capital Goods",
                                          },
                                          {
                                            key: "FIN",
                                            value: "Finished Goods",
                                          },
                                        ]}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          setValue("MatType", e.target.value); // Ensure state updates properly
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  lg={4}
                                  md={6}
                                  sm={6}
                                  xs={12}
                                  textAlign="center"
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
                                      name="ChapterID"
                                      control={control}
                                      rules={{
                                        required: "This field is required",
                                      }}
                                      render={({
                                        field,
                                        fieldState: { error },
                                      }) => (
                                        <InputTextField
                                          // label="HSN"
                                          label={
                                            formValues.Excisable
                                              ? "Chapter ID"
                                              : formValues.GSTRelevnt
                                                ? "HSN"
                                                : "HSN"
                                          }
                                          type="text"
                                          inputProps={{
                                            maxLength: 11,
                                            readOnly: !!valHsnList,
                                            onInput: (e) => {
                                              if (e.target.value.length > 11) {
                                                e.target.value =
                                                  e.target.value.slice(0, 11);
                                              }
                                            },
                                          }}
                                          {...field}
                                          disabled
                                          value={valHsnList || field.value}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                        />
                                      )}
                                    />
                                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                                    <IconButton
                                      onClick={handleClickHsnBtn}
                                      size="small"
                                      style={{
                                        backgroundColor: "green",
                                        borderRadius: "10%",
                                        color: "white",
                                        height: 40,
                                        padding: 10,
                                      }}
                                    >
                                      <ViewListIcon />
                                    </IconButton>
                                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                                  </Grid>
                                </Grid>
                                <Grid
                                  item
                                  lg={4}
                                  md={6}
                                  sm={6}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="AssblValue"
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="ASSESSABLE VALUE"
                                        type="number"
                                        {...field}
                                        inputProps={{
                                          onInput: (e) => {
                                            if (e.target.value.length > 15) {
                                              e.target.value =
                                                e.target.value.slice(0, 15);
                                            }
                                          },
                                        }}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                      />
                                    )}
                                  />
                                </Grid>{" "}
                              </>
                            )}
                            {/* Excisable Details */}
                            {((watch("Excisable") &&
                              inventoryItemValue === "Y") ||
                              (inventoryItemValue === "N" &&
                                watch("Excisable") &&
                                watch("ItemClass") === "Material")) && (
                              <>
                                <Grid
                                  item
                                  lg={4}
                                  md={6}
                                  sm={6}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="NotifyASN"
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <Tooltip
                                        title="NOTIFICATION AVAIL SERIAL NUMBER"
                                        arrow
                                      >
                                        <InputTextField
                                          label="NOTIFICATION AVAIL SERIAL NUMBER"
                                          type="text"
                                          inputProps={{ maxLength: 40 }}
                                          {...field}
                                          onChange={(e) => {
                                            const cleanedValue = removeEmojis(
                                              e.target.value,
                                            );
                                            field.onChange(cleanedValue);
                                          }}
                                          error={!!error} // Pass error state to the FormComponent if needed
                                          helperText={
                                            error ? error.message : null
                                          } // Show the validation message
                                        />
                                      </Tooltip>
                                    )}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  lg={4}
                                  md={6}
                                  sm={6}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ProAssNum"
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <Tooltip
                                        title="PROVISIONAL ASSESSMENT NO"
                                        arrow
                                      >
                                        <InputTextField
                                          label="PROVISIONAL ASSESSMENT NO"
                                          type="text"
                                          {...field}
                                          inputProps={{ maxLength: 20 }}
                                          onChange={(e) => {
                                            const cleanedValue = removeEmojis(
                                              e.target.value,
                                            );
                                            field.onChange(cleanedValue);
                                          }}
                                          error={!!error} // Pass error state to the FormComponent if needed
                                          helperText={
                                            error ? error.message : null
                                          } // Show the validation message
                                        />
                                      </Tooltip>
                                    )}
                                  />
                                </Grid>
                                <>
                                  {(watch("MatType") === "CAP" &&
                                    inventoryItemValue === "Y") ||
                                  (inventoryItemValue === "N" &&
                                    watch("ItemClass") === "Material" &&
                                    watch("MatType") === "CAP") ? (
                                    <>
                                      {/* Capital Goods On Hold Percentage */}
                                      <Grid
                                        item
                                        lg={4}
                                        md={6}
                                        sm={6}
                                        xs={12}
                                        textAlign="center"
                                      >
                                        <Controller
                                          name="OnHldPert"
                                          control={control}
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <Tooltip
                                              title="Capital Goods On Hold Percentage"
                                              arrow
                                            >
                                              <InputTextField
                                                label="CAPITAL GOODS ON HOLD PERCENTAGE"
                                                type="number"
                                                {...field}
                                                error={!!error}
                                                helperText={
                                                  error ? error.message : null
                                                }
                                              />
                                            </Tooltip>
                                          )}
                                        />
                                      </Grid>

                                      {/* Capital Goods On Hold Amount Limit */}
                                      <Grid
                                        item
                                        lg={4}
                                        md={6}
                                        sm={6}
                                        xs={12}
                                        textAlign="center"
                                      >
                                        <Controller
                                          name="onHldLimt"
                                          control={control}
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <Tooltip
                                              title="Capital Goods On Hold Amount Limit"
                                              arrow
                                            >
                                              <InputTextField
                                                label="CAPITAL GOODS ON HOLD AMOUNT LIMIT"
                                                type="number"
                                                {...field}
                                                error={!!error}
                                                helperText={
                                                  error ? error.message : null
                                                }
                                              />
                                            </Tooltip>
                                          )}
                                        />
                                      </Grid>

                                      {/* Empty Grid Items for spacing */}
                                      <Grid
                                        item
                                        lg={4}
                                        md={6}
                                        sm={6}
                                        xs={12}
                                        textAlign="center"
                                      ></Grid>
                                      <Grid
                                        item
                                        lg={4}
                                        md={6}
                                        sm={6}
                                        xs={12}
                                        textAlign="center"
                                      ></Grid>
                                    </>
                                  ) : (
                                    <>
                                      {/* Empty Grid Item if condition is false */}
                                      <Grid
                                        item
                                        lg={4}
                                        md={6}
                                        sm={6}
                                        xs={12}
                                      ></Grid>
                                    </>
                                  )}
                                </>

                                {/* <Grid item lg={4} md={6} sm={6} sx={12}></Grid> */}
                              </>
                            )}
                            {watch("GSTRelevnt") && (
                              <>
                                <Grid
                                  item
                                  lg={4}
                                  md={6}
                                  sm={6}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="GstTaxCtg"
                                    control={control}
                                    defaultValue={"R"}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputSelectTextField
                                        label="TAX CATEGORY"
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        data={[
                                          { key: "R", value: "Regular" },
                                          { key: "N", value: "Nil Rated" },
                                          { key: "E", value: "Exempt" },
                                        ]}
                                      />
                                    )}
                                  />
                                </Grid>

                                {watch("MatType") === "CAP" ? (
                                  <>
                                    <Grid
                                      item
                                      lg={4}
                                      md={6}
                                      sm={6}
                                      xs={12}
                                      textAlign="center"
                                    >
                                      <Controller
                                        name="OnHldPert"
                                        control={control}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputTextField
                                            label="Capital Goods On Hold Percentage"
                                            type="number"
                                            {...field}
                                            error={!!error}
                                            helperText={
                                              error ? error.message : null
                                            }
                                          />
                                        )}
                                      />
                                    </Grid>

                                    <Grid
                                      item
                                      lg={4}
                                      md={6}
                                      sm={6}
                                      xs={12}
                                      textAlign="center"
                                    >
                                      <Controller
                                        name="onHldLimt"
                                        control={control}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputTextField
                                            label="Capital Goods On Hold Amount Limit"
                                            type="number"
                                            {...field}
                                            error={!!error}
                                            helperText={
                                              error ? error.message : null
                                            }
                                          />
                                        )}
                                      />
                                    </Grid>
                                  </>
                                ) : watch("ItemClass") === "Material" ? (
                                  <>
                                    <Grid
                                      item
                                      lg={4}
                                      md={6}
                                      sm={6}
                                      xs={12}
                                    ></Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={6}
                                      sm={6}
                                      xs={12}
                                    ></Grid>
                                  </>
                                ) : (
                                  <Grid
                                    item
                                    lg={4}
                                    md={6}
                                    sm={6}
                                    xs={12}
                                  ></Grid>
                                )}
                              </>
                            )}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign="center"
                              justifyContent={"center"}
                              alignItems={"center"}
                              width={220}
                            >
                              <Controller
                                name="Status"
                                control={control}
                                defaultValue="1"
                                render={({ field, fieldState: { error } }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        textAlign={"center"}
                                        {...field}
                                        checked={field.value === "1"}
                                        onChange={(e) => {
                                          const newValueStatus = e.target
                                            .checked
                                            ? "1"
                                            : "0";
                                          field.onChange(newValueStatus);
                                          setValue("Active", newValueStatus);
                                        }}
                                      />
                                    }
                                    label="Active"
                                  />
                                )}
                              />
                            </Grid>

                            {/* Date Pickers */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="ValidFrom"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <SelectedDatePickerField
                                    label="FROM DATE"
                                    name={field.name}
                                    value={FromDate || null} // Pass null if FromDate is not set
                                    onChange={(date) => {
                                      setFromDate(date);
                                      setToDate(null); // Reset due date when start date changes
                                    }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="ValidTo"
                                control={control}
                                // rules={{
                                //   required: "To date is required",
                                // }}
                                render={({ field }) => (
                                  <SelectedDatePickerField
                                    label="TO DATE"
                                    name={field.name}
                                    value={ToDate || null} // Pass null if ToDate is not set
                                    minDate={FromDate} // Ensure the "To Date" is not earlier than "From Date"
                                    onChange={(date) => setToDate(date)}
                                    disabled={!FromDate} // Disable the "To Date" field if "From Date" is not selected
                                  />
                                )}
                              />
                            </Grid>

                            {/* Active and Inactive Checkboxes */}

                            {/* Remarks */}
                            <Grid
                              item
                              lg={4}
                              md={12}
                              sm={6}
                              xs={12}
                              textAlign="center"
                              width={220}
                            >
                              <Controller
                                name="ValidComm"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="REMARKS"
                                    multiline
                                    rows={3}
                                    value={field.value || ""} // ✅ REQUIRED
                                    onChange={field.onChange} // ✅ REQUIRED
                                    onBlur={field.onBlur}
                                    inputRef={field.ref}
                                    inputProps={{ maxLength: 30 }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {tabvalue === 1 && (
                        <>
                          <Grid container width={"100%"} mt={1} mb={1}>
                            {/* Preferred Vendor */}
                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="CardCode"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextSearchField
                                      {...field}
                                      label="PREFERRED VENDOR"
                                      value={field.value || ""}
                                      readOnly
                                      onClick={openPreVen}
                                      onKeyDown={(e) => {
                                        if (e.key === "Backspace") {
                                          e.preventDefault();

                                          setValue("CardCode", "", {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          });
                                        } else {
                                          e.preventDefault(); // block all other keys
                                        }
                                      }}
                                      inputProps={{
                                        maxLength: 15,
                                      }}
                                      error={!!error}
                                      sx={{ marginRight: 1 }}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  )}
                                />

                                <Dialog
                                  open={preVend}
                                  onClose={handleClosePreVen}
                                  scroll="paper"
                                  maxWidth="sm"
                                  sx={{
                                    "& .MuiDialog-paper": {
                                      width: "30vw",
                                      maxWidth: "400px",
                                      height: "90vh",
                                      maxHeight: "90vh",
                                    },
                                  }}
                                >
                                  <DialogTitle
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      position: "relative",
                                    }}
                                  >
                                    <Typography fontWeight="bold">
                                      Select Preferred Vendor
                                    </Typography>

                                    <IconButton
                                      onClick={handleClosePreVen}
                                      sx={{
                                        position: "absolute",
                                        right: 8,
                                        top: 8,
                                      }}
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  </DialogTitle>

                                  <Divider />
                                  <DialogContent>
                                    <SearchInputField
                                      value={getListquery}
                                      onChange={(e) =>
                                        handleOpenListSearch1(e.target.value)
                                      }
                                      onClickClear={handleOpenListClear1}
                                    />

                                    <Box
                                      id="getListForCreateScroll"
                                      sx={{
                                        height: "70vh",
                                        overflow: "auto",
                                        mt: 1,
                                      }}
                                    >
                                      <InfiniteScroll
                                        dataLength={getListData.length}
                                        hasMore={hasMoreGetList}
                                        next={fetchMoreVendorListData}
                                        scrollableTarget="getListForCreateScroll"
                                        loader={
                                          <Box
                                            display="flex"
                                            justifyContent="center"
                                            py={2}
                                          >
                                            <BeatLoader
                                              color={
                                                theme.palette.mode === "light"
                                                  ? "black"
                                                  : "white"
                                              }
                                            />
                                          </Box>
                                        }
                                        endMessage={
                                          <Typography align="center">
                                            No More Records
                                          </Typography>
                                        }
                                      >
                                        {getListData.map((item, i) => {
                                          const isSelected = selectedItems.some(
                                            (selected) =>
                                              selected.CardCode ===
                                              item.CardCode,
                                          );

                                          const isAlreadyAdded =
                                            oItemVendorLines.some(
                                              (vendor) =>
                                                vendor.VendorCode ===
                                                item.CardCode,
                                            );

                                          return (
                                            <Box
                                              key={i}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 1,
                                                width: "100%",
                                              }}
                                            >
                                              <Checkbox
                                                checked={
                                                  isSelected || isAlreadyAdded
                                                }
                                                onChange={() =>
                                                  toggleSelection(item)
                                                }
                                                sx={{ mr: 1 }}
                                              />

                                              {/* 🔒 SAME WIDTH CARD */}
                                              <Box sx={{ flex: 1, mr: 1.5 }}>
                                                <CardComponent
                                                  title={item.CardName}
                                                  subtitle={item.CardCode}
                                                  description={item.Cellular}
                                                  searchResult={getListquery}
                                                  isSelected={isSelected}
                                                  onClick={() =>
                                                    toggleSelection(item)
                                                  }
                                                />
                                              </Box>
                                            </Box>
                                          );
                                        })}
                                      </InfiniteScroll>
                                    </Box>
                                  </DialogContent>
                                  <DialogActions
                                    sx={{ justifyContent: "space-between" }}
                                  >
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={saveData}
                                    >
                                      Save
                                    </Button>

                                    {/* <Button
    variant="contained"
    color="error"
    size="small"
    onClick={handleClosePreVen}
  >
    Close
  </Button> */}
                                  </DialogActions>
                                </Dialog>
                                <IconButton
                                  onClick={handleClickOpen1}
                                  size="small"
                                  style={{
                                    backgroundColor: "green",
                                    borderRadius: "10%",
                                    color: "white",
                                    height: 40,
                                    padding: 10,
                                  }}
                                >
                                  <ViewListIcon />
                                </IconButton>
                              </Grid>
                            </Grid>

                            {/* Mfr Catalog No. */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SuppCatNum"
                                control={control}
                                // rules={{
                                //   required: "Mfr Catalog No. is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="MFR CATALOG NO."
                                    {...field}
                                    inputProps={{ maxLength: 50 }}
                                    error={!!error}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Purchasing UoM Name */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PUoMEntry"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextSearchField
                                    label="PURCHASING UOM CODE"
                                    type="text"
                                    value={field.value || ""}
                                    onClick={() => setIsDialogOpen(true)} // Open the modal
                                    {...field}
                                    InputLabelProps={{
                                      shrink: true, // Prevent label from overlapping
                                    }}
                                    error={!!error}
                                    readonly={true}
                                    disabled={isDisabled}
                                    onKeyDown={(e) => e.preventDefault()}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Dialog
                              open={isDialogOpen}
                              onClose={handleCloseDialog}
                              maxWidth="xs"
                              fullWidth
                              PaperProps={{
                                style: {
                                  borderRadius: 12,
                                  padding: "8px",
                                  height: "75vh",
                                  display: "flex",
                                  flexDirection: "column",
                                },
                              }}
                            >
                              {/* HEADER */}
                              <Box
                                sx={{
                                  position: "relative",
                                  textAlign: "center",
                                  padding: "6px 40px",
                                }}
                              >
                                <Typography variant="h6">
                                  Select UOM Lines
                                </Typography>

                                {/* TOP RIGHT CLOSE */}
                                <IconButton
                                  aria-label="close"
                                  onClick={handleCloseDialog}
                                  sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 6,
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Box>

                              {/* SEARCH BAR (using your component) */}
                              <Box sx={{ px: 2, pb: 1 }}>
                                <SearchInputField
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  onClickClear={clearSearch}
                                />
                              </Box>

                              {/* CONTENT AREA */}
                              <DialogContent
                                dividers
                                sx={{
                                  flexGrow: 1,
                                  overflowY: "auto",
                                }}
                              >
                                {filteredData.length === 0 ? (
                                  <Box
                                    sx={{
                                      textAlign: "center",
                                      padding: "20px",
                                    }}
                                  >
                                    <Typography>No Records Found</Typography>
                                  </Box>
                                ) : (
                                  filteredData.map((line, i) => (
                                    <CardComponent
                                      key={i}
                                      title={line.UomCode}
                                      subtitle={line.UomName}
                                      onClick={() =>
                                        handlePurchaseUOMSelect(line)
                                      }
                                    />
                                  ))
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Packaging UoM Name */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="BuyUnitMsr"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip title="PURCHASING UOM NAME" arrow>
                                    <InputTextField
                                      label="PURCHASING UOM NAME"
                                      value={field.value || ""}
                                      {...field}
                                      onChange={(e) => {
                                        const cleanedValue = removeEmojis(
                                          e.target.value,
                                        );
                                        field.onChange(cleanedValue);
                                      }}
                                      disabled={Disable}
                                      inputProps={{
                                        maxLength: 100,
                                        // readonly: "true",
                                      }}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="NumInBuy"
                                control={control}
                                // rules={{
                                //   required: "Packaging UoM Name is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="ITEMS PER PURCHASING UNIT"
                                    arrow
                                  >
                                    <InputTextField
                                      label="ITEMS PER PURCHASING UNIT"
                                      {...field}
                                      inputProps={{
                                        maxLength: 19,
                                      }}
                                      onChange={(e) => {
                                        const cleanedValue = removeEmojis(
                                          e.target.value,
                                        );
                                        field.onChange(cleanedValue);
                                      }}
                                      disabled={Disable}
                                      InputLabelProps={{
                                        shrink:
                                          field.value !== "" &&
                                          field.value !== null,
                                      }}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="BLength1"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="LENGTH"
                                      type="number"
                                      {...field}
                                      inputProps={{
                                        maxLength: 15,
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                                <Controller
                                  name="BLen1Unit"
                                  control={control}
                                  defaultValue={"1"} // use default DocEntry or leave it blank
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => {
                                    return (
                                      <Tooltip
                                        title={
                                          volumeUnits.find(
                                            (v) => v.DocEntry === field.value,
                                          )?.UnitName || "Select a unit"
                                        }
                                        arrow
                                      >
                                        <InputSelectTextField
                                          label="UNIT"
                                          {...field}
                                          data={volumeUnits.map((unit) => ({
                                            key: unit.DocEntry,
                                            value: unit.UnitName,
                                          }))}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          sx={{ width: "100%" }}
                                        />
                                      </Tooltip>
                                    );
                                  }}
                                />
                              </Grid>
                            </Grid>
                            {/* WIDTH Field */}
                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="BWidth1"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="WIDTH"
                                      {...field}
                                      type="number"
                                      inputProps={{
                                        maxLength: 15,
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                                <Controller
                                  name="BWdth1Unit"
                                  control={control}
                                  defaultValue={"1"} // use default DocEntry or leave it blank
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => {
                                    return (
                                      <Tooltip
                                        title={
                                          volumeUnits.find(
                                            (v) => v.DocEntry === field.value,
                                          )?.UnitName || "Select a unit"
                                        }
                                        arrow
                                      >
                                        <InputSelectTextField
                                          label="UNIT"
                                          {...field}
                                          data={volumeUnits.map((unit) => ({
                                            key: unit.DocEntry,
                                            value: unit.UnitName,
                                          }))}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          sx={{ width: "100%" }}
                                        />
                                      </Tooltip>
                                    );
                                  }}
                                />
                              </Grid>
                            </Grid>

                            {/* HEIGHT Field */}
                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="BHeight1"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="HEIGHT"
                                      type="number"
                                      inputProps={{
                                        maxLength: 15,
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                                <Controller
                                  name="BHght1Unit"
                                  control={control}
                                  defaultValue={"1"} // use default DocEntry or leave it blank
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => {
                                    return (
                                      <Tooltip
                                        title={
                                          volumeUnits.find(
                                            (v) => v.DocEntry === field.value,
                                          )?.UnitName || "Select a unit"
                                        }
                                        arrow
                                      >
                                        <InputSelectTextField
                                          label="UNIT"
                                          {...field}
                                          data={volumeUnits.map((unit) => ({
                                            key: unit.DocEntry,
                                            value: unit.UnitName,
                                          }))}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          sx={{ width: "100%" }}
                                        />
                                      </Tooltip>
                                    );
                                  }}
                                />
                              </Grid>
                            </Grid>

                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="BVolume"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="VOLUME"
                                      {...field}
                                      inputProps={{
                                        maxLength: 19,
                                        readonly: "true",
                                      }}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      sx={{ marginRight: 1, width: "50%" }} // Set to 50% width
                                    />
                                  )}
                                />
                                <Controller
                                  name="BVolUnit"
                                  control={control}
                                  defaultValue={"1"} // use default DocEntry or leave it blank
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => {
                                    return (
                                      <Tooltip
                                        title={
                                          volumeUnits.find(
                                            (v) => v.DocEntry === field.value,
                                          )?.UnitName || "Select a unit"
                                        }
                                        arrow
                                      >
                                        <InputSelectTextField
                                          label="UNIT"
                                          {...field}
                                          data={volumeUnits.map((unit) => ({
                                            key: unit.DocEntry,
                                            value: unit.UnitName,
                                          }))}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          sx={{ width: "100%" }}
                                        />
                                      </Tooltip>
                                    );
                                  }}
                                />
                              </Grid>
                            </Grid>

                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="BWeight1"
                                control={control}
                                // rules={{
                                //   required: "Purchasing UoM Name is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="WEIGHT"
                                    type="number"
                                    inputProps={{
                                      maxLength: 19,
                                      onInput: (e) => {
                                        if (e.target.value.length > 19) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            19,
                                          );
                                        }
                                      },
                                    }}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/*Package Type*/}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PurPackMsr"
                                control={control}
                                // rules={{
                                //   required: "Quantity per Package is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="PACKAGE TYPE"
                                    {...field}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Quantity per Package */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PurPackUn"
                                control={control}
                                defaultValue={"1"}
                                // rules={{
                                //   required: "Quantity per Package is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="QUANTITY PER PACKAGE"
                                    type="number"
                                    inputProps={{
                                      maxLength: 19,
                                      onInput: (e) => {
                                        if (e.target.value.length > 19) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            19,
                                          );
                                        }
                                      },
                                    }}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {tabvalue === 2 && (
                        <>
                          <Grid container width={"100%"} mt={1} mb={1}>
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SUoMEntry"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextSearchField
                                    label="SALES UOM CODE"
                                    type="num"
                                    value={field.value || ""}
                                    onClick={() => setIsDialogOpen(true)}
                                    {...field}
                                    error={!!error}
                                    disabled={isDisabled}
                                    inputProps={{
                                      maxLength: 11,
                                      readOnly: "true",
                                      onInput: (e) => {
                                        if (e.target.value.length > 11) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            11,
                                          );
                                        }
                                      },
                                    }}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Dialog
                              open={isDialogOpen}
                              onClose={handleCloseDialog}
                              maxWidth="xs"
                              fullWidth
                              PaperProps={{
                                style: {
                                  borderRadius: 12,
                                  padding: "8px",
                                  height: "75vh",
                                  display: "flex",
                                  flexDirection: "column",
                                },
                              }}
                            >
                              {/* HEADER */}
                              <Box
                                sx={{
                                  position: "relative",
                                  textAlign: "center",
                                  padding: "6px 40px",
                                }}
                              >
                                <Typography variant="h6">
                                  Select UOM Lines
                                </Typography>

                                {/* TOP RIGHT CLOSE */}
                                <IconButton
                                  aria-label="close"
                                  onClick={handleCloseDialog}
                                  sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 6,
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Box>

                              {/* SEARCH BAR */}
                              <Box sx={{ px: 2, pb: 1 }}>
                                <SearchInputField
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  onClickClear={clearSearch}
                                />
                              </Box>

                              {/* SCROLL CONTENT */}
                              <DialogContent
                                dividers
                                sx={{
                                  flexGrow: 1,
                                  overflowY: "auto",
                                  padding: "8px",
                                }}
                                id="uom-scroll"
                              >
                                {filteredData.length === 0 ? (
                                  <Box
                                    sx={{
                                      textAlign: "center",
                                      padding: "20px",
                                    }}
                                  >
                                    <Typography>No Records Found</Typography>
                                  </Box>
                                ) : (
                                  filteredData.map((line, i) => (
                                    <CardComponent
                                      key={i}
                                      title={line.UomCode}
                                      subtitle={line.UomName}
                                      onClick={() => handleSalesUOMSelect(line)}
                                    />
                                  ))
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Sales UoM Name */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SalUnitMsr"
                                control={control}
                                // rules={{
                                //   required: "Sales UoM Name is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="SALES UOM NAME"
                                    disabled={Disable}
                                    value={field.value || ""}
                                    inputProps={{
                                      maxLength: 100,
                                    }}
                                    {...field}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Items per Sales Unit */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="NumInSale"
                                control={control}
                                // rules={{
                                //   required: "Items per Sales Unit is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="ITEMS PER SALES UNIT"
                                    inputProps={{
                                      maxLength: 15,
                                      onInput: (e) => {
                                        if (e.target.value.length > 15) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            15,
                                          );
                                        }
                                      },
                                    }}
                                    type="number"
                                    {...field}
                                    disabled={Disable}
                                    error={!!error}
                                    value={field.value || ""}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="SLength1"
                                  control={control}
                                  // rules={{
                                  //   required: "Purchasing UoM Name is required",
                                  // }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="LENGTH"
                                      inputProps={{
                                        maxLength: 15,
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      type="number"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                                <Controller
                                  name="SLen1Unit"
                                  control={control}
                                  defaultValue={"1"} // use default DocEntry or leave it blank
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => {
                                    return (
                                      <Tooltip
                                        title={
                                          volumeUnits.find(
                                            (v) => v.DocEntry === field.value,
                                          )?.UnitName || "Select a unit"
                                        }
                                        arrow
                                      >
                                        <InputSelectTextField
                                          label="UNIT"
                                          {...field}
                                          data={volumeUnits.map((unit) => ({
                                            key: unit.DocEntry,
                                            value: unit.UnitName,
                                          }))}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          sx={{ width: "100%" }}
                                        />
                                      </Tooltip>
                                    );
                                  }}
                                />
                              </Grid>
                            </Grid>
                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="SWidth1"
                                  control={control}
                                  // rules={{
                                  //   required: "Purchasing UoM Name is required",
                                  // }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="WIDTH"
                                      inputProps={{
                                        maxLength: 15,
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      type="number"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                                <Controller
                                  name="SWdth1Unit"
                                  control={control}
                                  defaultValue={"1"} // use default DocEntry or leave it blank
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => {
                                    return (
                                      <Tooltip
                                        title={
                                          volumeUnits.find(
                                            (v) => v.DocEntry === field.value,
                                          )?.UnitName || "Select a unit"
                                        }
                                        arrow
                                      >
                                        <InputSelectTextField
                                          label="UNIT"
                                          {...field}
                                          data={volumeUnits.map((unit) => ({
                                            key: unit.DocEntry,
                                            value: unit.UnitName,
                                          }))}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          sx={{ width: "100%" }}
                                        />
                                      </Tooltip>
                                    );
                                  }}
                                />
                              </Grid>
                            </Grid>
                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="SHeight1"
                                  control={control}
                                  // rules={{
                                  //   required: "Purchasing UoM Name is required",
                                  // }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="HEIGHT"
                                      inputProps={{
                                        maxLength: 15,
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      type="number"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                                <Controller
                                  name="SHght1Unit"
                                  control={control}
                                  defaultValue={"1"} // use default DocEntry or leave it blank
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => {
                                    return (
                                      <Tooltip
                                        title={
                                          volumeUnits.find(
                                            (v) => v.DocEntry === field.value,
                                          )?.UnitName || "Select a unit"
                                        }
                                        arrow
                                      >
                                        <InputSelectTextField
                                          label="UNIT"
                                          {...field}
                                          data={volumeUnits.map((unit) => ({
                                            key: unit.DocEntry,
                                            value: unit.UnitName,
                                          }))}
                                          error={!!error}
                                          helperText={
                                            error ? error.message : null
                                          }
                                          sx={{ width: "100%" }}
                                        />
                                      </Tooltip>
                                    );
                                  }}
                                />
                              </Grid>
                            </Grid>
                            <Grid
                              item
                              lg={4}
                              md={6}
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
                                  name="SVolume"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="VOLUME"
                                      {...field}
                                      error={!!error}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                      helperText={error ? error.message : null}
                                      sx={{ marginRight: 1, width: "70%" }}
                                    />
                                  )}
                                />
                                <Controller
                                  name="SVolUnit"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <Tooltip
                                      title={
                                        volumeUnits.find(
                                          (v) =>
                                            v.DocEntry.toString() ===
                                            field.value,
                                        )?.UnitName || "Select a unit"
                                      }
                                      arrow
                                    >
                                      <InputSelectTextField
                                        label="UNIT"
                                        {...field}
                                        data={volumeUnits.map((unit) => ({
                                          key: unit.DocEntry.toString(),
                                          value: unit.UnitName,
                                        }))}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        sx={{ width: "100%" }}
                                      />
                                    </Tooltip>
                                  )}
                                />
                              </Grid>
                            </Grid>
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SWeight1"
                                control={control}
                                // rules={{
                                //   required: "Purchasing UoM Name is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="WEIGHT"
                                    {...field}
                                    inputProps={{
                                      maxLength: 15,
                                      onInput: (e) => {
                                        if (e.target.value.length > 15) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            15,
                                          );
                                        }
                                      },
                                    }}
                                    type="number"
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Package Type */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SalPackMsr"
                                control={control}
                                // rules={{
                                //   required: "Quantity per Package is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="PACKAGE TYPE"
                                    {...field}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                    inputProps={{ maxLength: 30 }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            {/* Quantity per Package */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SalPackUn"
                                control={control}
                                // rules={{
                                //   required: "Quantity per Package is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="QUANTITY PER PACKAGE"
                                    inputProps={{
                                      maxLength: 15,
                                      onInput: (e) => {
                                        if (e.target.value.length > 15) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            15,
                                          );
                                        }
                                      },
                                    }}
                                    type="number"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {tabvalue === 3 && (
                        <>
                          <Grid container width={"100%"} mt={1} mb={1}>
                            {/* Set G/L Account By */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="GLMethod"
                                defaultValue={"W"}
                                control={control}
                                rules={{
                                  required: "Set G/L Account By is required",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="SET G/L ACCOUNT BY"
                                    {...field}
                                    data={[
                                      { key: "W", value: "Warehouse" },
                                      { key: "C", value: "Item Group" },
                                      { key: "L", value: "Item Level" },
                                    ]}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            {/* Valuation Method */}

                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="EvalSystem"
                                control={control}
                                defaultValue={"1"}
                                // rules={{
                                //   required: "Valuation Method is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="VALUATION METHOD"
                                    {...field}
                                    data={[
                                      { key: "A", value: "Moving Average" },
                                      { key: "S", value: "Standard" },
                                      { key: "F", value: "FIFO" },
                                    ]}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            {valuationMethod === "2" && (
                              <Grid
                                item
                                lg={4}
                                md={6}
                                sm={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="AvgPrice"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="ITEM COST"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      // helperText={
                                      //   saveUpdateName === "SAVE"
                                      //     ? error?.message || ""
                                      //     : valuationMethod === "2"
                                      //     ? "To update cost, use an Inventory Revaluation document."
                                      //     : error?.message || ""
                                      // }
                                      // InputProps={{
                                      //   readOnly: valuationMethod === "2",
                                      // }}
                                    />
                                  )}
                                />
                              </Grid>
                            )}

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                              mt={1}
                            >
                              <Controller
                                name="ByWh"
                                control={control}
                                render={({ field }) => (
                                  <Tooltip
                                    title="MANAGE INVENTORY BY WAREHOUSE"
                                    arrow
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          sx={{
                                            textAlign: "center",
                                            width: 20,
                                          }}
                                          {...field}
                                          checked={Boolean(field.value)} // Ensure boolean value
                                          onChange={(e) =>
                                            field.onChange(e.target.checked)
                                          } // Update as boolean
                                        />
                                      }
                                      label={
                                        <Typography
                                          variant="body2"
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif",
                                          }}
                                        >
                                          Manage Inventory by Warehouse
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal",
                                        fontFamily: "'Open Sans', sans-serif",
                                        textDecoration: "bold",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>

                            {/* UoM Code */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="IUoMEntry"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextSearchField
                                    label="UoM Code"
                                    disabled={isDisabled}
                                    inputProps={{
                                      maxLength: 11,
                                      readOnly: "true",
                                      onInput: (e) => {
                                        if (e.target.value.length > 11) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            11,
                                          );
                                        }
                                      },
                                    }}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    type="text"
                                    onClick={() => {
                                      openInvntUoMDialog();
                                      // ClearForm();
                                    }}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                            <Dialog
                              open={InvntUOMDialogOpen}
                              onClose={closeInvntUoMDialog}
                              maxWidth="xs"
                              fullWidth
                              PaperProps={{
                                style: {
                                  borderRadius: 12,
                                  padding: "8px",
                                  height: "75vh",
                                  display: "flex",
                                  flexDirection: "column",
                                },
                              }}
                            >
                              {/* Header */}
                              <Box
                                sx={{
                                  position: "relative",
                                  textAlign: "center",
                                  padding: "6px 40px",
                                }}
                              >
                                <Typography variant="h6">
                                  Select UOM Lines
                                </Typography>

                                <IconButton
                                  aria-label="close"
                                  onClick={closeInvntUoMDialog}
                                  sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 6,
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Box>

                              {/* Search */}
                              <Box sx={{ px: 2, pb: 1 }}>
                                <SearchInputField
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  onClickClear={clearSearch}
                                />
                              </Box>

                              {/* List */}
                              <DialogContent
                                dividers
                                sx={{
                                  flexGrow: 1,
                                  overflowY: "auto",
                                  padding: "8px",
                                }}
                              >
                                {filteredData.length === 0 ? (
                                  <Box
                                    sx={{
                                      textAlign: "center",
                                      padding: "20px",
                                    }}
                                  >
                                    <Typography>No Records Found</Typography>
                                  </Box>
                                ) : (
                                  filteredData.map((line, i) => (
                                    <CardComponent
                                      key={i}
                                      title={line.UomCode}
                                      subtitle={line.UomName}
                                      onClick={() => handleIUoMSelect(line)}
                                    />
                                  ))
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* UoM Name */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="InvntoryUOM"
                                control={control}
                                // rules={{ required: "UoM Name is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="UOM NAME"
                                    {...field}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                    disabled={Disable}
                                    inputProps={{
                                      maxLength: 100,
                                      // readOnly: "true",
                                    }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Weight */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="IWeight1"
                                control={control}
                                // rules={{ required: "Weight is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="WEIGHT"
                                    {...field}
                                    inputProps={{
                                      maxLength: 15,
                                      onInput: (e) => {
                                        if (e.target.value.length > 15) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            15,
                                          );
                                        }
                                      },
                                    }}
                                    type="number"
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="INUoMEntry"
                                control={control}
                                // rules={{ required: "UoM Name is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="INVENTORY COUNTING UOM CODE"
                                    arrow
                                  >
                                    <InputTextSearchField
                                      label="INVENTORY COUNTING UOM CODE"
                                      onClick={() => {
                                        openInvntDialog();
                                        // ClearForm();
                                      }}
                                      inputProps={{
                                        maxLength: 11,
                                        readOnly: "true",
                                        onInput: (e) => {
                                          if (e.target.value.length > 11) {
                                            e.target.value =
                                              e.target.value.slice(0, 11);
                                          }
                                        },
                                      }}
                                      disabled={isDisabled}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Dialog
                              open={InvntDialogOpen}
                              onClose={closeInvntDialog}
                              maxWidth="xs"
                              fullWidth
                              PaperProps={{
                                style: {
                                  borderRadius: 12,
                                  padding: "8px",
                                  height: "75vh",
                                  display: "flex",
                                  flexDirection: "column",
                                },
                              }}
                            >
                              {/* Header */}
                              <Box
                                sx={{
                                  position: "relative",
                                  textAlign: "center",
                                  padding: "6px 40px",
                                }}
                              >
                                <Typography variant="h6">
                                  Select UOM Lines
                                </Typography>

                                <IconButton
                                  aria-label="close"
                                  onClick={closeInvntDialog}
                                  sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 6,
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Box>

                              {/* Search */}
                              <Box sx={{ px: 2, pb: 1 }}>
                                <SearchInputField
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  onClickClear={clearSearch}
                                />
                              </Box>

                              {/* List */}
                              <DialogContent
                                dividers
                                sx={{
                                  flexGrow: 1,
                                  overflowY: "auto",
                                  padding: "8px",
                                }}
                              >
                                {filteredData.length === 0 ? (
                                  <Box
                                    sx={{
                                      textAlign: "center",
                                      padding: "20px",
                                    }}
                                  >
                                    <Typography>No Records Found</Typography>
                                  </Box>
                                ) : (
                                  filteredData.map((line, i) => (
                                    <CardComponent
                                      key={i}
                                      title={line.UomCode}
                                      subtitle={line.UomName}
                                      onClick={() => handleInvntSelect(line)}
                                    />
                                  ))
                                )}
                              </DialogContent>
                            </Dialog>

                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="CntUnitMsr"
                                control={control}
                                // rules={{ required: "UoM Name is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="INVENTORY COUNTING UOM NAME"
                                    arrow
                                  >
                                    <InputTextField
                                      label="INVENTORY COUNTING UOM NAME"
                                      {...field}
                                      inputProps={{
                                        maxLength: 100,
                                      }}
                                      onChange={(e) => {
                                        const cleanedValue = removeEmojis(
                                          e.target.value,
                                        );
                                        field.onChange(cleanedValue);
                                      }}
                                      disabled={Disable}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="NumInCnt"
                                control={control}
                                // rules={{ required: "UoM Name is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="ITEMS PER COUNTING UNIT"
                                    arrow
                                  >
                                    <InputTextField
                                      label="ITEMS PER COUNTING UNIT"
                                      {...field}
                                      type="number"
                                      inputProps={{
                                        maxLength: 19,
                                        onInput: (e) => {
                                          if (e.target.value.length > 19) {
                                            e.target.value =
                                              e.target.value.slice(0, 19);
                                          }
                                        },
                                      }}
                                      disabled={Disable}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>

                            {/* Minimum Inventory Level */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="MinLevel"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="MINIMUM INVENTORY LEVEL"
                                    arrow
                                  >
                                    <InputTextField
                                      label="MINIMUM INVENTORY LEVEL"
                                      {...field}
                                      type="number"
                                      value={
                                        isByWhChecked
                                          ? formValues.MinLevel
                                          : field.value
                                      }
                                      onChange={(e) => {
                                        if (!isByWhChecked) {
                                          field.onChange(e.target.value);
                                          setFormValues((prev) => ({
                                            ...prev,
                                            MinLevel: e.target.value,
                                          }));
                                        }
                                      }}
                                      inputProps={{
                                        maxLength: 15,
                                        // readOnly:"true",
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      error={!!error}
                                      disabled={isByWhChecked}
                                      helperText={error ? error.message : null}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>

                            {/* Maximum Inventory Level */}
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="MaxLevel"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="MAXIMUM INVENTORY LEVEL"
                                    arrow
                                  >
                                    <InputTextField
                                      label="MAXIMUM INVENTORY LEVEL"
                                      {...field}
                                      value={
                                        isByWhChecked
                                          ? formValues.MaxLevel
                                          : field.value
                                      }
                                      onChange={(e) => {
                                        if (!isByWhChecked) {
                                          field.onChange(e.target.value);
                                          setFormValues((prev) => ({
                                            ...prev,
                                            MaxLevel: e.target.value,
                                          }));
                                        }
                                      }}
                                      type="number"
                                      inputProps={{
                                        maxLength: 15,
                                        // readOnly:"true",
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      error={!!error}
                                      disabled={isByWhChecked}
                                      helperText={error ? error.message : null}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              lg={4}
                              md={6}
                              sm={6}
                              xs={12}
                              textAlign={"center"}
                            >
                              <Controller
                                name="ReorderQty"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <Tooltip
                                    title="REQUIRED (PURCHASING UOM)"
                                    arrow
                                  >
                                    <InputTextField
                                      label="REQUIRED (PURCHASING UOM)"
                                      {...field}
                                      type="number"
                                      value={
                                        isByWhChecked
                                          ? formValues.ReorderQty
                                          : field.value
                                      }
                                      onChange={(e) => {
                                        if (!isByWhChecked) {
                                          field.onChange(e.target.value);
                                          setFormValues((prev) => ({
                                            ...prev,
                                            ReorderQty: e.target.value,
                                          }));
                                        }
                                      }}
                                      inputProps={{
                                        maxLength: 15,
                                        // readOnly:"true",
                                        onInput: (e) => {
                                          if (e.target.value.length > 15) {
                                            e.target.value =
                                              e.target.value.slice(0, 15);
                                          }
                                        },
                                      }}
                                      disabled={isByWhChecked}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  </Tooltip>
                                )}
                              />
                            </Grid>
                            {/* DataGrid */}
                            <Grid
                              container
                              item
                              sx={{
                                overflow: "auto",
                                width: "100%",
                                // height: "100%",
                                height: "50vh", // half screen height
                                // minHeight: "250px",
                                // maxHeight: "500px",
                                mt: "5px",
                              }}
                            >
                              <DataGrid
                                className="datagrid-style"
                                apiRef={apiRef}
                                rows={rows}
                                getRowId={(row) => row.id}
                                columns={colInvnData}
                                columnHeaderHeight={35}
                                slots={{ toolbar: CustomSearchExportToolbar }}
                                slotProps={{
                                  toolbar: {
                                    showQuickFilter: false, // 👈 show search bar
                                    quickFilterProps: { debounceMs: 300 },
                                  },
                                }}
                                processRowUpdate={(newRow, oldRow) => {
                                  setRows((prevRows) =>
                                    prevRows.map((row) =>
                                      row.id === newRow.id ? newRow : row,
                                    ),
                                  );
                                  return newRow;
                                }}
                                editMode="cell"
                                experimentalFeatures={{ newEditingApi: true }}
                                onCellKeyDown={handleCellKeyDown}
                                onProcessRowUpdateError={(err) =>
                                  console.error(err)
                                } // rowHeight={50}
                                // initialState={{
                                //   pagination: {
                                //     paginationModel: {
                                //       pageSize: rows.length,
                                //     },
                                //   },
                                // }}
                                // checkboxSelection
                                // hideFooter
                                disableRowSelectionOnClick
                                sx={gridSx}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {tabvalue === 4 && (
                        <>
                          <Grid container width={"100%"} mt={1} mb={1}>
                            {/* Planning Method */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PlaningSys"
                                control={control}
                                defaultValue={"N"}
                                // rules={{
                                //   required: "Planning Method is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="PLANNING METHOD"
                                    {...field}
                                    data={[
                                      { key: "N", value: "None" },
                                      { key: "M", value: "MRP" },
                                    ]}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Procurement Method */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PrcrmntMtd"
                                control={control}
                                defaultValue={"B"}
                                // rules={{
                                //   required: "Procurement Method is required",
                                // }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="PROCUREMENT METHOD"
                                    {...field}
                                    data={[
                                      { key: "B", value: "Buy" },
                                      { key: "M", value: "Make" },
                                    ]}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Minimum Order Qty */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="MinOrdrQty"
                                control={control}
                                rules={{
                                  validate: (value) => {
                                    if (Number(value) < 0) {
                                      return "Minimum order qty must be greater than 0";
                                    }
                                  },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="MINIMUM ORDER QTY"
                                    // defaultValue="0.00"
                                    {...field}
                                    inputProps={{
                                      maxLength: 15,
                                      // readOnly:"true",
                                      onInput: (e) => {
                                        if (e.target.value.length > 15) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            15,
                                          );
                                        }
                                      },
                                    }}
                                    type="number"
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Lead Time */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="LeadTime"
                                control={control}
                                rules={{
                                  validate: (value) => {
                                    if (Number(value) < 0) {
                                      return "Lead Time must be greater than 0";
                                    }
                                  },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="LEAD TIME"
                                    inputProps={{
                                      maxLength: 10,
                                      // readOnly:"true",
                                      onInput: (e) => {
                                        if (e.target.value.length > 10) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            10,
                                          );
                                        }
                                      },
                                    }}
                                    type="number"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Tolerance Days */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="ToleranDay"
                                control={control}
                                rules={{
                                  validate: (value) => {
                                    if (Number(value) < 0) {
                                      return "Tolerance Day must be greater than 0";
                                    }
                                  },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="TOLERANCE DAYS"
                                    {...field}
                                    inputProps={{
                                      maxLength: 10,
                                      // readOnly:"true",
                                      onInput: (e) => {
                                        if (e.target.value.length > 10) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            10,
                                          );
                                        }
                                      },
                                    }}
                                    type="number"
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {tabvalue === 5 && (
                        <>
                          <Grid container width={"100%"} mt={1} mb={1}>
                            {/* Issue Method Dropdown */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="IssueMthd"
                                control={control}
                                defaultValue={"1"}
                                // rules={{ required: "Issue Method is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="ISSUE METHODD"
                                    {...field}
                                    data={[
                                      { key: "1", value: "Backflush" },
                                      { key: "2", value: "Manual" },
                                    ]}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* BOM Type */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TreeType"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    label="BOM TYPE"
                                    {...field}
                                    inputProps={{ maxLength: 1 }}
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* No. of Item Components */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="NoOfComponent"
                                control={control}
                                // disabled={true}
                                render={({ field }) => (
                                  <InputTextField
                                    label="NO. OF ITEM COMPONENTS"
                                    {...field}
                                    disabled
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                    // disabled={true}
                                  />
                                )}
                              />
                            </Grid>

                            {/* No. of Resources Components */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="NoOfResComponent"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    label="NO. OF RESOURCES COMPONENT"
                                    // disabled={true}
                                    {...field}
                                    disabled
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* No. of Route States */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="NoOfRouteStages"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    label="NO. OF ROUTE STAGES"
                                    // disabled={true}
                                    {...field}
                                    disabled
                                    onChange={(e) => {
                                      const cleanedValue = removeEmojis(
                                        e.target.value,
                                      );
                                      field.onChange(cleanedValue);
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Production Std Cost */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PrdStdCst"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    label="PRODUCTION STD COST"
                                    inputProps={{
                                      maxLength: 15,
                                      // readOnly:"true",
                                      onInput: (e) => {
                                        if (e.target.value.length > 15) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            15,
                                          );
                                        }
                                      },
                                    }}
                                    type="number"
                                    {...field}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid container spacing={2}>
                              {/* Phantom Item Checkbox */}
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={6}
                                lg={4}
                                textAlign="center"
                              >
                                <Controller
                                  name="Phantom"
                                  control={control}
                                  render={({ field }) => (
                                    <Tooltip title="Phantom Item" arrow>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            sx={{
                                              textAlign: "center",
                                              width: 20,
                                            }}
                                            checked={field.value === true} // ensure boolean
                                            onChange={(e) =>
                                              field.onChange(e.target.checked)
                                            } // update RHF value
                                          />
                                        }
                                        label={
                                          <Typography
                                            variant="body2"
                                            noWrap
                                            sx={{
                                              fontFamily:
                                                "'Open Sans', sans-serif",
                                            }}
                                          >
                                            PHANTOM ITEM
                                          </Typography>
                                        }
                                        sx={{
                                          textAlign: "center",
                                          width: 200,
                                          whiteSpace: "normal",
                                          fontFamily: "'Open Sans', sans-serif",
                                          textDecoration: "bold",
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                />
                              </Grid>

                              {/* Include in Production Std Cost Rollup Checkbox */}
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={6}
                                lg={4}
                                textAlign="center"
                              >
                                <Controller
                                  name="InCostRoll"
                                  control={control}
                                  render={({ field }) => (
                                    <Tooltip
                                      title="Include in Production Std Cost Rollup"
                                      arrow
                                    >
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            sx={{
                                              textAlign: "center",
                                              width: 20,
                                            }}
                                            checked={field.value === true} // Ensure boolean
                                            onChange={(e) =>
                                              field.onChange(e.target.checked)
                                            } // Update RHF value
                                            disabled={isPhantomChecked} // Disable if Phantom is checked
                                          />
                                        }
                                        label={
                                          <Typography
                                            variant="body2"
                                            noWrap
                                            sx={{
                                              fontFamily:
                                                "'Open Sans', sans-serif",
                                            }}
                                          >
                                            Include in Production Std Cost
                                            Rollup
                                          </Typography>
                                        }
                                        sx={{
                                          textAlign: "center",
                                          width: 200,
                                          whiteSpace: "normal",
                                          fontFamily: "'Open Sans', sans-serif",
                                          textDecoration: "bold",
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {tabvalue === 6 && (
                        <>
                          <Grid container width={"100%"}>
                            <Controller
                              name="remarks"
                              control={control}
                              defaultValue=""
                              render={({ field, fieldState: { error } }) => (
                                <TextField
                                  {...field}
                                  label="REMARKS"
                                  multiline
                                  rows={6}
                                  sx={{
                                    ml: "100px",
                                    minWidth: "99%",
                                    minHeight: "200px",
                                  }}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                />
                              )}
                              rules={{
                                maxLength: {
                                  value: 500,
                                  message:
                                    "Remarks cannot exceed 500 characters",
                                },
                              }}
                            />
                          </Grid>
                        </>
                      )}

                      {tabvalue === 7 && (
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
                              sx={{
                                margin: "7px",
                                maxHeight: 200,
                                width: "80%",
                              }}
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
                                              handleRemove(index);
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

                      {tabvalue === 8 && (
                        <>
                          <Box
                            // component="form"
                            sx={{
                              "& .MuiTextField-root": { m: 1 },
                            }}
                            noValidate
                            autoComplete="off"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              multiple
                              id="imageInput"
                              onChange={handleImagePick}
                            />

                            {/* Add Image Button */}
                            <Button
                              variant="contained"
                              onClick={() =>
                                document.getElementById("imageInput").click()
                              }
                              startIcon={<CloudUploadIcon />}
                              sx={{ mb: 2, mt: 2 }}
                            >
                              Upload Image
                            </Button>

                            <Grid container spacing={2} mt={2}>
                              {itemImages.map((img) => (
                                <Grid
                                  item
                                  key={img.id}
                                  xs={6}
                                  sm={4}
                                  md={3}
                                  lg={2}
                                >
                                  <Box
                                    width="100%"
                                    sx={{
                                      aspectRatio: "2 / 2", // maintain square
                                      border: "1px solid #ccc",
                                      position: "relative",
                                    }}
                                  >
                                    <img
                                      src={img.preview}
                                      alt=""
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />

                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        bgcolor: "rgba(255,255,255,0.8)",
                                      }}
                                      onClick={() =>
                                        setItemImages((prev) =>
                                          prev.filter((i) => i.id !== img.id),
                                        )
                                      }
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid
              item
              px={1}
              // md={12}
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
                type="submit"
                name={saveUpdateName}
                disabled={
                  (saveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (saveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                color="success"
                sx={{ color: "white" }}
              >
                {saveUpdateName}
              </Button>
              <Button
                variant="contained"
                disabled={saveUpdateName === "SAVE" || !perms.IsDelete}
                color="error"
                onClick={handleOnDelete}
              >
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
