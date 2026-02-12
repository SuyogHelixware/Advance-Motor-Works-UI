import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { List } from "antd"; // Still using Ant Design List for now, consider replacing with MUI List if possible
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import FinanceIcon from "@mui/icons-material/AccountBalance";
import BusinessPartnerIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import BankingIcon from "@mui/icons-material/AccountBalanceWallet";
import SalesIcon from "@mui/icons-material/ShoppingCart";
import PurchaseIcon from "@mui/icons-material/LocalMall";
import ProductionIcon from "@mui/icons-material/Construction";
import DescriptionIcon from "@mui/icons-material/Description";
import "antd/dist/reset.css"; // Make sure styles are loaded
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";

import { TabContext, TabPanel } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
  // Import ThemeProvider if you're wrapping your app with it here
  // ThemeProvider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";

// Assuming you have a theme provider wrapping your app,
// or you can import and use it here if this is the root.
// import theme from './theme'; // Import your custom theme

export default function ReportAndLayout() {
  const perms = usePermissions(50); // Assuming 31 is the permission ID for this module
  const theme = useTheme(); // This hook gets the theme from the nearest ThemeProvider
  const { user } = useAuth();

  // --- State Management ---
  const [selectedRow, setSelectedRow] = useState(null); // For DataGrid row selection (Layout/Report)
  const [selectedData, setSelectedData] = useState(null); // For grouping list item selection (Grouping)
  const [drawerOpen, setDrawerOpen] = useState(false); // For mobile sidebar
  const [loading, setLoading] = useState(false); // Global loading indicator
  const [tabvalue, settabvalue] = useState("1"); // Current active main tab
  const [openKeys, setOpenKeys] = useState([]); // For sidebar menu collapse/expand
  const [menuData, setMenuData] = useState([]); // Raw menu data from API
  const [saveUpdateName, setSaveUpdateName] = useState("SAVE"); // Button text for save/update

  // Grouping specific states
  const [layoutOptionsMap, setLayoutOptionsMap] = useState({}); // Layout options for each grouping row (keyed by row.id)
  const [availableObjectIDs, setAvailableObjectIDs] = useState([]); // Object IDs for grouping dropdown
  const [objectLayoutsCache, setObjectLayoutsCache] = useState({}); // NEW: Cache for {ObjectID: [{key, value}, ...]}

  // Grouping list states
  const [groupQuery, setGroupQuery] = useState("");
  const [groupSearching, setGroupSearching] = useState(false);
  const [groupPage, setGroupPage] = useState(0);
  const [groups, setGroups] = useState([]); // Data for grouping sidebar list
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const timeoutRef = useRef(null); // For debouncing search input

  // Visibility of main tabs
  const [visibleTabs, setVisibleTabs] = useState({
    layout: false,
    grouping: false,
    reports: false,
  });

  const [selectedDepth2Key, setSelectedDepth2Key] = useState(null);

  // --- Constants & Mappings ---
  const tabMap = {
    layout: { value: "1", label: "Layout" },
    grouping: { value: "2", label: "Grouping" },
    reports: { value: "3", label: "Reports" },
  };

  // Initial values for the main form (Layout/Report)
  const initialLayoutReportFormValues = {
    Status: 1,
    Default: "N",
    DocName: "",
    DocCode: "",
    TypeCode: "",
    ReportTyp: "",
    Notes: "",
    Category: "",
    FileExt: "",
    FileName: "",
    FileBase64: "",
    Type: "",
    oLines: [], // Data for Layout/Report DataGrid
    selectedRow: null, // For Layout/Report DataGrid selected row object
    showReport: true, // Filter for sidebar
    showLayout: true, // Filter for sidebar
  };

  // Initial values for the grouping form
  const initialGroupingFormValues = {
    SeqName: "",
    GroupingStatus: 1, // Changed to number for consistency with API
    NoOfSteps: 0,
    FirstLayout: "",
    groupingOlines: [], // This will hold the rows for the Grouping DataTable
  };

  // --- React Hook Form Setup (Main Form for Layout/Report) ---
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
  } = useForm({
    mode: "onSubmit",
    defaultValues: initialLayoutReportFormValues,
  });

  const oLines = watch("oLines"); // Data for Layout/Report DataGrid
  const TypeCode = watch("TypeCode"); // Currently selected TypeCode from sidebar
  const showReport = watch("showReport"); // Filter for sidebar
  const showLayout = watch("showLayout"); // Filter for sidebar
  const isLayoutTabActive = visibleTabs.layout; // Helper for conditional rendering/logic

  // --- React Hook Form Setup (Grouping Form) ---
  const {
    control: groupingControl,
    // handleSubmit: handleGroupingSubmit,
    reset: resetGroupingForm,
    watch: watchGroupingForm,
    setValue: setGroupingValue,
    getValues: getGroupingValues,
    trigger: triggerGroupingForm,
    clearErrors: clearGroupingErrors,
  } = useForm({
    mode: "onSubmit",
    defaultValues: initialGroupingFormValues,
  });

  const groupingOlines = watchGroupingForm("groupingOlines"); // Data for Grouping DataTable

  // --- UI Handlers ---
  // const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const handleMainTab = (event, newValue) => settabvalue(newValue);
  // Helper function: recursively collect all descendant keys
  const getAllChildKeys = (node) => {
    if (!node.children || node.children.length === 0) return [];
    let keys = node.children.map((child) => child.key);
    node.children.forEach((child) => {
      keys = keys.concat(getAllChildKeys(child));
    });
    return keys;
  };

  // Updated handleToggle
  const handleToggle = (key, node) => {
    setOpenKeys((prevKeys) => {
      const isOpen = prevKeys.includes(key);

      if (isOpen) {
        // collapsing: remove this key and all its children
        const childKeys = getAllChildKeys(node);
        return prevKeys.filter((k) => k !== key && !childKeys.includes(k));
      } else {
        // opening: just add the key
        return [...prevKeys, key];
      }
    });
  };

  // --- Form & Data Management ---
  const getLastCode = () => {
    const currentRows = watch("oLines") || [];
    if (currentRows.length === 0) return "";
    const sorted = [...currentRows].sort((a, b) =>
      a.DocCode.localeCompare(b.DocCode)
    );
    return sorted[sorted.length - 1]?.DocCode || "";
  };

  const generateNextDocCode = (lastCode) => {
    if (!lastCode) return "";
    const match = lastCode.match(/^([A-Za-z]+[0-9]*)(\d+)$/);
    if (!match) return lastCode;
    const prefix = match[1];
    const num = match[2];
    const nextNum = String(parseInt(num, 10) + 1).padStart(num.length, "0");
    return prefix + nextNum;
  };

  // Function to clear Layout/Report form data
  const clearLayoutReportFormData = () => {
    const currentMainFormValues = getValues(); // Get current values from the main form

    reset({
      ...initialLayoutReportFormValues,
      oLines: currentMainFormValues.oLines || [], // KEEP existing oLines instead of clearing
      DocCode: generateNextDocCode(getLastCode()), // Generate new DocCode
      TypeCode: currentMainFormValues.TypeCode, // Preserve TypeCode
      ReportTyp: currentMainFormValues.ReportTyp, // Preserve ReportTyp
      showReport: currentMainFormValues.showReport,
      showLayout: currentMainFormValues.showLayout,
    });

    setSelectedRow(null); // Clear DataGrid selected row
    setSaveUpdateName("SAVE");
  };

  // Function to clear Grouping form data
  const clearGroupingFormData = () => {
    resetGroupingForm(initialGroupingFormValues);
    setSelectedData(null); // Clear selected grouping item
    setLayoutOptionsMap({}); // Clear layout options cache for grouping rows
    setSaveUpdateName("SAVE");
  };

  // Combined clear function for the Add button
  const handleClearAllForms = () => {
    // clearLayoutReportFormData(); // Decide if you want to clear this too on global add
    clearGroupingFormData();
  };

  // --- Layout/Report Tab Specifics ---
  const layoutReportFields = [
    { name: "DocCode", label: "ID", disabled: true }, // DocCode is generated, not user editable
    { name: "DocName", label: "NAME" },
    { name: "Notes", label: "DESCRIPTION" },
    { name: "FileExt", label: "Type", disabled: true }, // FileExt is derived from upload
  ];
  const requiredLayoutReportFields = ["DocName", "FileExt"]; // DocCode is disabled, so not directly required for user input

  const handleFileUpload = async (file) => {
    if (!file) return;

    const dotIndex = file.name.lastIndexOf(".");
    const name = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
    const extension = dotIndex !== -1 ? file.name.substring(dotIndex + 1) : "";

    setValue("FileName", name, { shouldValidate: true, shouldDirty: true });
    setValue("FileExt", extension, { shouldValidate: true, shouldDirty: true });
    setValue("DocName", name, { shouldValidate: true, shouldDirty: true });
    setValue("Type", extension); // Assuming 'Type' is also the extension

    clearErrors(["FileExt", "DocName"]); // Clear errors after setting values

    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("FileBase64", reader.result.split(",")[1], {
        shouldValidate: true,
        shouldDirty: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const onSubmitLayoutReport = async (data) => {
    try {
      setLoading(true);
      const isUpdate = !!data.selectedRow;

      const payload = {
        DocEntry: isUpdate ? data.selectedRow.DocEntry : 0,
        UserId: user.UserId,
        CreatedBy: isUpdate ? data.selectedRow.CreatedBy : user.UserName,
        CreatedDate: isUpdate
          ? data.selectedRow.CreatedDate
          : dayjs().toISOString(),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs().toISOString(),
        Status: data.Status ? "1" : "0",
        DocCode: data.DocCode,
        DocName: data.DocName,
        TypeCode: data.TypeCode,
        ReportTyp: data.ReportTyp,
        Notes: data.Notes,
        Category: data.Category,
        FileExt: data.FileExt,
        FileName: data.FileName,
        FileBase64: data.FileBase64,
        Default: "0",
      };

      const response = isUpdate
        ? await apiClient.put(`/ReportDoc/${payload.DocEntry}`, payload)
        : await apiClient.post("/ReportDoc", payload);

      // ✅ Check API's "success" flag
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: isUpdate
            ? `${isLayoutTabActive ? "Layout" : "Report"} updated successfully!`
            : `${isLayoutTabActive ? "Layout" : "Report"} added successfully!`,
          timer: 1500,
        });
        fetchLayoutData(TypeCode);
        clearLayoutReportFormData();
      } else {
        // ✅ Show backend error message if success = false
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.message || "Unknown error occurred!",
        });
      }
    } catch (error) {
      console.error("API Error:", error);

      let errorMessage = "Something went wrong!";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelectLayoutReport = (row) => {
    setValue("selectedRow", row);
    setSelectedRow(row.id || row.DocEntry);

    setValue("DocCode", row.DocCode);
    setValue("FileName", row.DocName);
    setValue("DocName", row.DocName);
    setValue("Notes", row.Notes);
    setValue("FileExt", row.FileExt);
    setValue("Type", row.Type);
    setValue("Status", row.Status); // Convert to boolean for Checkbox
    setValue("Default", row.Default === "Y" ? "Y" : "N"); // Set default checkbox
    setSaveUpdateName("UPDATE"); // Change button to UPDATE
  };

 const handleDeleteLayoutReport = async (row) => {
  const confirmation = await Swal.fire({
    text: `Do You Want to Delete "${row.DocName}"?`,
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showDenyButton: true,
  });

  if (!confirmation.isConfirmed) {
    await Swal.fire({
      text: `${isLayoutTabActive ? "Layout" : "Report"} Not Deleted`,
      icon: "info",
      confirmButtonText: "Ok", // ❌ NO TIMER
    });
    return;
  }

  try {
    setLoading(true);

    const response = await apiClient.delete(
      `/ReportDoc/${row.DocEntry}`
    );

    if (response.data.success) {
      fetchLayoutData(TypeCode);
      clearLayoutReportFormData();

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: `${isLayoutTabActive ? "Layout" : "Report"} Deleted`,
        confirmButtonText: "Ok",
        timer: 1500, // ✅ SUCCESS TIMER
      });
    } else {
      await Swal.fire({
        title: "Error!",
        text: response.data.message || "Deletion failed",
        icon: "warning",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
    }
  } catch (error) {
    console.error("Error deleting:", error);

    await Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        "An error occurred while deleting.",
      icon: "error",
      confirmButtonText: "Ok", // ❌ NO TIMER
    });
  } finally {
    setLoading(false);
  }
};


  const fileTypeMap = {
    txt: "TEXT File",
    pdf: "PDF Document",
    png: "PNG Image",
    jpg: "JPEG Image",
    jpeg: "JPEG Image",
    gif: "GIF Image",
    svg: "SVG Image",
    xls: "Excel Sheet",
    xlsx: "Excel Sheet",
    doc: "Word Document",
    docx: "Word Document",
    csv: "CSV File",
    json: "JSON File",
    xml: "XML File",
    rpt: "Crystal Report",
    pbix: "Power BI Report",
    pbit: "Power BI Template",
    ppt: "PowerPoint Presentation",
    pptx: "PowerPoint Presentation",
    sql: "SQL Script",
    html: "HTML File",
    js: "JavaScript File",
    ts: "TypeScript File",
    rdl: "Report Builder report file",
  };

  const layoutReportColumns = useMemo(
    () => [
      {
        field: "DocCode",
        headerName: isLayoutTabActive ? "Layout ID" : "Report ID",
        width: 200,
        headerAlign: "center",
        align: "center",
      },
      {
        field: "DocName",
        headerName: isLayoutTabActive ? "Layout Name" : "Report Name",
        width: 250,
        headerAlign: "center",
        align: "center",
      },
      {
        field: "FileExt",
        headerName: isLayoutTabActive ? "Layout Type" : "Report Type",
        width: 250,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => {
          const ext = params.value?.toLowerCase();
          return fileTypeMap[ext] || ext?.toUpperCase() || "Unknown";
        },
      },
      {
        field: "actions",
        headerName: "Action",
        width: 100,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLayoutReport(params.row);
            }}
          >
            <DeleteIcon />
          </IconButton>
        ),
      },
    ],
    [isLayoutTabActive, TypeCode]
  ); // Re-memoize if isLayoutTabActive or TypeCode changes

  const childObjectMapping = {
    OEI1: { code: "OEI1", objType: "" },

    // Purchase documents
    PCH1: { code: ["PCH1", "PDN1", "POR1", "PRQ1", "PQT1"], objType: "18" },
    PCH2: { code: ["PCH2", "PDN2", "POR2", "PRQ2", "PQT2"], objType: "18" },
    PCH3: { code: ["PCH3", "PDN3", "POR3", "PQT3"], objType: "18" },
    PCH5: { code: "PCH5", objType: "18" },

    PDN1: { code: ["PDN1", "RPD1", "POR1", "PRQ1", "PQT1"], objType: "20" },
    PDN2: { code: ["PDN2", "RPD2", "POR2", "PRQ2", "PQT2"], objType: "20" },
    PDN3: { code: ["PDN3", "RPD3", "POR3", "PQT3"], objType: "20" },

    POR1: { code: ["POR1", "PRQ1", "PQT1"], objType: "22" },
    POR2: { code: ["POR2", "PRQ2", "PQT2"], objType: "22" },
    POR3: { code: ["POR3", "PQT3"], objType: "22" },

    PQT1: { code: ["PQT1", "PRQ1"], objType: "540000006" },
    PQT2: { code: ["PQT2", "PRQ2"], objType: "540000006" },
    PQT3: { code: "PQT3", objType: "540000006" },

    PRQ1: { code: ["PRQ1", "PQT1"], objType: "1470000113" },
    PRQ2: { code: ["PRQ2", "PQT2"], objType: "1470000113" },

    // Sales documents
    QUT1: { code: "QUT1", objType: "23" },
    QUT2: { code: "QUT2", objType: "23" },
    QUT3: { code: "QUT3", objType: "23" },

    RDN1: { code: ["RDN1", "DLN1"], objType: "16" },
    RDN2: { code: ["RDN2", "DLN2"], objType: "16" },
    RDN3: { code: ["RDN3", "DLN3"], objType: "16" },

    RDR1: { code: ["RDR1", "QUT1"], objType: "17" },
    RDR2: { code: ["RDR2", "QUT2"], objType: "17" },
    RDR3: { code: ["RDR3", "QUT3"], objType: "17" },
    RDR4: { code: "RDR4", objType: "17" },

    RIN1: { code: ["RIN1", "DPI1", "INV1", "RDN1"], objType: "14" },
    RIN2: { code: ["RIN2", "DPI2", "INV2", "RDN2"], objType: "" },
    RIN3: { code: ["RIN3", "DPI3", "INV3", "RDN3"], objType: "" },

    RPC1: { code: ["RPC1", "DPO1", "PCH1", "RPD1"], objType: "19" },
    RPC2: { code: ["RPC2", "DPO2", "PCH2", "RPD2"], objType: "19" },
    RPC3: { code: ["RPC3", "DPO3", "PCH3", "RPD3"], objType: "19" },

    WOR1: { code: "WOR1", objType: "202" },
    WTR1: { code: "WTR1", objType: "67" },

    RPD1: { code: ["RPD1", "PDN1"], objType: "21" },
    RPD2: { code: ["RPD2", "PDN2"], objType: "21" },
    RPD3: { code: ["RPD3", "PDN3"], objType: "21" },

    // Newly added mappings
    DLN1: { code: ["DLN1", "RDN1", "RDR1", "QUT1"], objType: "15" },
    DLN2: { code: ["DLN2", "RDN2", "RDR2", "QUT2"], objType: "15" },
    DLN3: { code: ["DLN3", "RDN3", "RDR3", "QUT3"], objType: "15" },

    DPI1: { code: ["DPI1", "DLN1", "RDR1", "QUT1"], objType: "203" },
    DPI2: { code: ["DPI2", "DLN2", "RDR2", "QUT2"], objType: "203" },
    DPI3: { code: ["DPI3", "DLN3", "RDR3", "QUT3"], objType: "203" },

    DPO1: { code: ["DPO1", "PDN1", "POR1", "PRQ1", "PQT1"], objType: "204" },
    DPO2: { code: ["DPO2", "PDN2", "POR2", "PRQ2", "PQT2"], objType: "204" },
    DPO3: { code: ["DPO3", "PDN3", "POR3", "PQT3"], objType: "204" },

    IEI1: { code: ["IEI1", "RDN1", "PDN1"], objType: "" },
    IGE1: { code: "IGE1", objType: "60" },
    IGE2: { code: "IGE2", objType: "60" },
    IGN1: { code: "IGN1", objType: "59" },
    IGN2: { code: "IGN2", objType: "59" },

    INV1: { code: ["INV1", "DLN1", "RDR1", "QUT1"], objType: "13" },
    INV2: { code: ["INV2", "DLN2", "RDR2", "QUT2"], objType: "13" },
    INV3: { code: ["INV3", "DLN3", "RDR3", "QUT3"], objType: "13" },
  };

  // Memoized map for quick menu item title lookup
  const menuMap = useMemo(() => {
    const map = {};
    const traverse = (items) => {
      items.forEach((node) => {
        if (node.children) traverse(node.children);
        if (node.code) map[node.code.trim().toUpperCase()] = node.title;
      });
    };
    traverse(menuData);
    return map;
  }, [menuData]);

  // Memoized object ID options for the grouping dropdown
  const objectIDOptions = useMemo(() => {
    return availableObjectIDs.map((item) => {
      const code = item.code?.trim()?.toUpperCase();
      const name = menuMap[code];
      return { key: code, value: name || code };
    });
  }, [availableObjectIDs, menuMap]);

  // --- Grouping Tab Specific Functions ---

  const handleGroupingCellChange = (rowId, field, value) => {
    const prevRows = getGroupingValues("groupingOlines") || [];
    const updatedRows = prevRows.map((row) =>
      (row.id ?? row.LineNum) === rowId ? { ...row, [field]: value } : row
    );

    // Update FirstLayout if LaytCode of first row changed
    if (field === "LaytCode" && updatedRows.length > 0) {
      const firstRow = updatedRows[0];
      if ((firstRow.id ?? firstRow.LineNum) === rowId) {
        const selectedOption = layoutOptionsMap[rowId]?.find(
          (opt) => opt.key === value
        );
        setGroupingValue("FirstLayout", selectedOption?.value || "");
      }
    }

    setGroupingValue("groupingOlines", updatedRows);
  };

const handleGroupingObjectIDChange = async (rowId, objectCode) => {
  handleGroupingCellChange(rowId, "ObjectID", objectCode);

  // Clear layouts if no object selected
  if (!objectCode) {
    setLayoutOptionsMap((prev) => ({ ...prev, [rowId]: [] }));
    handleGroupingCellChange(rowId, "LaytCode", "");
    return;
  }

  let options = [];

  try {
    setLoading(true);

    // ✅ Use cache if available
    if (objectLayoutsCache[objectCode]) {
      options = objectLayoutsCache[objectCode];
    } else {
      const response = await apiClient.get(
        `/ReportDoc?TypeCode=${objectCode}`
      );

      const data = response.data?.values || [];

      options = data.map((item) => ({
        key: item.DocCode,
        value: item.DocName,
      }));

      setObjectLayoutsCache((prev) => ({
        ...prev,
        [objectCode]: options,
      }));
    }

    setLayoutOptionsMap((prev) => ({ ...prev, [rowId]: options }));

    // ---------------- UPDATE LaytCode ----------------
    if (options.length > 0) {
      const firstOption = options[0];
      handleGroupingCellChange(rowId, "LaytCode", firstOption.key);

      const prevRows = getGroupingValues("groupingOlines") || [];
      const updatedRows = prevRows.map((row) =>
        (row.id ?? row.LineNum) === rowId
          ? { ...row, LaytCode: firstOption.key }
          : row
      );

      setGroupingValue("groupingOlines", updatedRows);

      // If first row → update FirstLayout
      if (
        updatedRows.length > 0 &&
        (updatedRows[0].id ?? updatedRows[0].LineNum) === rowId
      ) {
        setGroupingValue("FirstLayout", firstOption.value);
      }
    } else {
      handleGroupingCellChange(rowId, "LaytCode", "");

      const prevRows = getGroupingValues("groupingOlines") || [];
      if (
        prevRows.length > 0 &&
        (prevRows[0].id ?? prevRows[0].LineNum) === rowId
      ) {
        setGroupingValue("FirstLayout", "");
      }
    }
  } catch (error) {
    console.error("Failed to fetch Layout options:", error);

    await Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        "Failed to fetch Layout options",
      icon: "error",
      confirmButtonText: "Ok", // ❌ NO TIMER
    });
  } finally {
    setLoading(false);
  }
};


  const handleDeleteGroupingRow = (rowId) => {
    const prevRows = getGroupingValues("groupingOlines") || [];
    const updatedRows = prevRows.filter(
      (row) => (row.id ?? row.LineNum) !== rowId
    );

    setGroupingValue("groupingOlines", updatedRows);
    setGroupingValue("NoOfSteps", updatedRows.length);
  };

  const addNewGroupRow = () => {
    const prevRows = getGroupingValues("groupingOlines") || [];
    const isFirstRow = prevRows.length === 0;

    // Determine default ObjectID for the first row
    const defaultObjectID = isFirstRow
      ? objectIDOptions.find(
          (opt) =>
            opt.key.toUpperCase() === (TypeCode || "").trim().toUpperCase()
        )?.key || ""
      : "";

    const newRow = {
      id: crypto.randomUUID(),
      ObjectID: defaultObjectID,
      LaytCode: "",
      NumCopy: 1,
      Printer: "Default",
      Prtr1st: "Default",
    };

    const updatedRows = [...prevRows, newRow];

    setGroupingValue("groupingOlines", updatedRows);
    setGroupingValue("NoOfSteps", updatedRows.length);

    // If first row, trigger layout fetch
    if (isFirstRow && defaultObjectID) {
      handleGroupingObjectIDChange(newRow.id, defaultObjectID);
    }
  };

  const groupingDataTableColumns = useMemo(
    () => [
      {
        field: "ObjectID",
        headerName: "OBJECT",
        width: 200,
        body: (rowData) => {
          const isFirstRow = groupingOlines[0]?.id === rowData.id; // Check if it's the first row
          return (
            <InputSelectTextField
              value={rowData.ObjectID}
              onChange={(e) =>
                handleGroupingObjectIDChange(rowData.id, e.target.value)
              }
              data={objectIDOptions}
              disabled={isFirstRow} // Disable for the first row
            />
          );
        },
      },
      {
        field: "LaytCode",
        headerName: "LAYOUT",
        width: 200,
        body: (rowData) => (
          <InputSelectTextField
            value={rowData.LaytCode}
            onChange={(e) =>
              handleGroupingCellChange(rowData.id, "LaytCode", e.target.value)
            }
            data={layoutOptionsMap[rowData.id] || []}
          />
        ),
      },
      {
        field: "NumCopy",
        headerName: "COPIES",
        width: 100,
        body: (rowData) => (
          <InputTextField
            type="number"
            value={rowData.NumCopy}
            onChange={(e) =>
              handleGroupingCellChange(rowData.id, "NumCopy", e.target.value)
            }
          />
        ),
      },
      {
        field: "Printer",
        headerName: "PRINTER",
        width: 220,
        body: (rowData) => (
          <InputTextField
            value={rowData.Printer}
            onChange={(e) =>
              handleGroupingCellChange(rowData.id, "Printer", e.target.value)
            }
          />
        ),
      },
      {
        field: "Prtr1st",
        headerName: "1ST PAGE PRINTER",
        width: 220,
        body: (rowData) => (
          <InputTextField
            value={rowData.Prtr1st}
            onChange={(e) =>
              handleGroupingCellChange(rowData.id, "Prtr1st", e.target.value)
            }
          />
        ),
      },
      {
        field: "actions",
        headerName: "ACTION",
        width: 100,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        body: (rowData) => (
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteGroupingRow(rowData.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        ),
      },
    ],
    [groupingOlines, objectIDOptions, layoutOptionsMap] // Dependencies for memoization
  );

const fetchGroupingDataList = async (pageNum = 0, searchTerm = "") => {
  try {
    setLoading(true);

    const url = `/ReportGrouping?TypeCode=${getValues("TypeCode")}&Status=1${
      searchTerm ? `&SearchText=${searchTerm}` : ""
    }&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    if (response.data.success) {
      const newData = response.data.values || [];

      setHasMoreGroups(newData.length === 20);
      setGroups((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      await Swal.fire({
        title: "Error!",
        text: response.data.message || "Failed to fetch grouping data",
        icon: "warning",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
    }
  } catch (error) {
    console.error("Error fetching grouping data:", error);

    await Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        "Something went wrong while fetching grouping data",
      icon: "error",
      confirmButtonText: "Ok", // ❌ NO TIMER
    });
  } finally {
    setLoading(false);
  }
};

  const handleGroupSearch = (value) => {
    setGroupQuery(value);
    setGroupSearching(true);
    setGroupPage(0);
    setGroups([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchGroupingDataList(0, value);
    }, 600);
  };

  const handleGroupClear = () => {
    setGroupQuery("");
    setGroupSearching(false);
    setGroupPage(0);
    setGroups([]);
    fetchGroupingDataList(0);
  };

  const fetchMoreGroups = () => {
    setGroupPage((prev) => prev + 1);
    fetchGroupingDataList(groupPage + 1, groupSearching ? groupQuery : "");
  };

 const setGroupingDataForEdit = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true);

    const response = await apiClient.get(
      `/ReportGrouping?DocEntry=${DocEntry}`
    );

    if (!response.data?.success) {
      await Swal.fire({
        title: "Error!",
        text: response.data?.message || "Failed to fetch grouping data",
        icon: "warning",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
      return;
    }

    const data = response.data.values || {};

    setGroupingValue("SeqName", data.SeqName || "");
    setGroupingValue("GroupingStatus", data.Status === 1 ? 1 : 0);

    // 1️⃣ Build rows
    const tempRows = (data.oLines || []).map((line) => ({
      ...line,
      id: line.LineNum ?? crypto.randomUUID(),
      ObjectID: line.ObjectID,
    }));

    // 2️⃣ Fetch layout options (with cache)
    const layoutDataMap = {};
    const newObjectLayoutsToCache = {};

    await Promise.all(
      tempRows.map(async (row) => {
        if (!row.ObjectID) {
          layoutDataMap[row.id] = [];
          return;
        }

        let options = [];

        if (objectLayoutsCache[row.ObjectID]) {
          options = objectLayoutsCache[row.ObjectID];
        } else {
          try {
            const resp = await apiClient.get(
              `/ReportDoc?TypeCode=${row.ObjectID}`
            );

            const fetchedData = resp.data?.values || [];
            options = fetchedData.map((item) => ({
              key: item.DocCode,
              value: item.DocName,
            }));

            newObjectLayoutsToCache[row.ObjectID] = options;
          } catch (err) {
            console.error(
              `Failed to fetch layout options for ObjectID ${row.ObjectID}:`,
              err
            );
            options = [];
          }
        }

        layoutDataMap[row.id] = options;
      })
    );

    // Update cache
    setObjectLayoutsCache((prev) => ({
      ...prev,
      ...newObjectLayoutsToCache,
    }));

    // 3️⃣ Sync LaytCode
    const updatedRows = tempRows.map((row) => {
      const options = layoutDataMap[row.id] || [];
      const selectedLayout =
        options.find((opt) => opt.key === row.LaytCode) || options[0];

      return {
        ...row,
        LaytCode: selectedLayout ? selectedLayout.key : "",
      };
    });

    // 4️⃣ Commit state
    setLayoutOptionsMap(layoutDataMap);
    setGroupingValue("groupingOlines", updatedRows);
    setGroupingValue("NoOfSteps", updatedRows.length);

    // 5️⃣ FirstLayout
    if (updatedRows.length > 0) {
      const firstRowOptions = layoutDataMap[updatedRows[0].id] || [];
      const selectedLayout = firstRowOptions.find(
        (opt) => opt.key === updatedRows[0].LaytCode
      );

      setGroupingValue(
        "FirstLayout",
        selectedLayout ? selectedLayout.value : ""
      );
    }

    setSaveUpdateName("UPDATE");
    setSelectedData(DocEntry);
  } catch (error) {
    console.error("Error fetching ReportGrouping data:", error);

    await Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        "An error occurred while fetching the ReportGrouping data.",
      icon: "error",
      confirmButtonText: "Ok", // ❌ NO TIMER
    });
  } finally {
    setLoading(false);
  }
};


  const handleSaveUpdateGrouping = async () => {
    const formData = getGroupingValues();
    const isValid = await triggerGroupingForm(["SeqName"]);

    if (!isValid) {
      console.log("Form validation failed for grouping");
      return;
    }

    if (!groupingOlines || groupingOlines.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Layouts Added",
        text: "You must add at least one layout before saving.",
      });
      return;
    }

    try {
      setLoading(true);
      const isUpdate = !!selectedData;
      const headerObjID =
        childObjectMapping[getValues("TypeCode")]?.objType ?? 1;

      const payload = {
        DocEntry: selectedData ?? 0,
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs().toISOString(),
        ModifiedBy: user.UserName,
        ModifiedDate: dayjs().toISOString(),
        Status: formData.GroupingStatus ? 1 : 0,
        SeqName: formData.SeqName,
        ObjectID: headerObjID,
        TypeCode: getValues("TypeCode"),
        oLines: groupingOlines.map((row, index) => ({
          DocEntry: row.DocEntry ?? 0,
          LineNum: row.LineNum ?? 0,
          SeqID: index + 1,
          UserId: row.UserId ?? user.UserId,
          CreatedBy: row.CreatedBy ?? user.UserName,
          CreatedDate: row.CreatedDate ?? dayjs().toISOString(),
          ModifiedBy: user.UserName,
          ModifiedDate: dayjs().toISOString(),
          Status: row.Status ?? 1,
          ObjectID: row.ObjectID,
          LaytCode: row.LaytCode ?? "",
          NumCopy: row.NumCopy ?? 1,
          Printer: row.Printer ?? "Default",
          Prtr1st: row.Prtr1st ?? "Default",
        })),
      };

      const response = isUpdate
        ? await apiClient.put(`/ReportGrouping/${payload.DocEntry}`, payload)
        : await apiClient.post("/ReportGrouping", payload);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: isUpdate
            ? "Report Group updated successfully!"
            : "Report Group added successfully!",
          timer: 1500,
        });
        clearGroupingFormData();
        fetchGroupingDataList(0);
      } else {
        // ✅ Show backend error message if API returned success=false
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.message || "Unknown error occurred!",
        });
      }
    } catch (error) {
      console.error("API Error:", error);

      let errorMessage = "Something went wrong!";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGrouping = async () => {
    const result = await Swal.fire({
      text: `Do You Want to Delete "${getGroupingValues("SeqName")}"?`, // Use grouping form's getValues
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await apiClient.delete(
          `/ReportGrouping/${selectedData}`
        );
        if (response.data.success) {
          Swal.fire({
            text: "Group Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
          clearGroupingFormData(); // Clear grouping form
          fetchGroupingDataList(0);
        } else {
          Swal.fire({
            text: "Group not Deleted",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        console.error("Error deleting Group:", error);
        Swal.fire({
          text: "An error occurred while deleting the Group.",
          icon: "error",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
        setLoading(false);
      }
    }
  };
  const getDepth0Icon = (nodeName) => {
    switch (nodeName?.toLowerCase()) {
      case "finance":
        return <BankingIcon />;
      case "business partner":
        return <BusinessPartnerIcon />;
      case "inventory":
        return <InventoryIcon />;
      case "banking":
        return <FinanceIcon />;
      case "sales":
        return <SalesIcon />;
      case "purchase":
        return <PurchaseIcon />;
      case "production":
        return <ProductionIcon />;
      default:
        return <DescriptionIcon />;
    }
  };
  // --- API Fetch Functions ---
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/ReportLeyoutV2?Status=1&Limit=1000`
      );
      if (response.data.success) {
        const formattedData = formatMenuData(response.data.values);
        setMenuData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error while fetching Menu!",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMenuData = (apiValues) => {
    const menuMap = {};
    apiValues.forEach((item) => {
      const { Menu, SubMenu, NAME, DocEntry, TYPE, CODE, PrntSq, DEFLT_REP } =
        item;
      if (!menuMap[Menu])
        menuMap[Menu] = { key: Menu, title: Menu, children: {} };
      if (!menuMap[Menu].children[SubMenu])
        menuMap[Menu].children[SubMenu] = {
          key: `${Menu}-${SubMenu}`,
          title: SubMenu,
          children: [],
        };
      menuMap[Menu].children[SubMenu].children.push({
        key: `child-${DocEntry}`,
        title: NAME,
        type: TYPE,
        code: CODE,
        PrntSq: PrntSq,
        DEFLT_REP: DEFLT_REP,
      });
    });
    return Object.values(menuMap).map((menu) => ({
      ...menu,
      children: Object.values(menu.children),
    }));
  };

  const fetchLayoutData = async (typeCode, defaultRep) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/ReportDoc?TypeCode=${typeCode}`);
      let values = response.data?.values || [];

      // ✅ Mark row as Default based on child.DEFLT_REP
      values = values.map((v) => ({
        ...v,
        Default: v.DocCode === defaultRep ? "Y" : v.Default || "N",
      }));

      setValue("oLines", values);
      const docCodes = values.map((v) => v.DocCode).filter(Boolean);
      setValue(
        "DocCode",
        docCodes.length > 0
          ? generateNextDocCode(docCodes.sort().at(-1))
          : `${typeCode}0001`
      );
    } catch (error) {
      console.error("Error fetching layout data:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch layout data",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong!",
        confirmButtonText: "OK",
      });
      setValue("oLines", []);
      setValue("DocCode", `${typeCode}0001`);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (typeCode, defaultRep) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/ReportDoc?TypeCode=${typeCode}`);
      let values = response.data?.values || [];

      // ✅ Mark row as Default based on child.DEFLT_REP
      values = values.map((v) => ({
        ...v,
        Default: v.DocCode === defaultRep ? "Y" : v.Default || "N",
      }));

      setValue("oLines", values);
      const docCodes = values.map((v) => v.DocCode).filter(Boolean);
      setValue(
        "DocCode",
        docCodes.length > 0
          ? generateNextDocCode(docCodes.sort().at(-1))
          : `${typeCode}0001`
      );
    } catch (error) {
      console.error("Error fetching report data:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch report data",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong!",
        confirmButtonText: "OK",
      });
      setValue("oLines", []);
      setValue("DocCode", `${typeCode}0001`);
    } finally {
      setLoading(false);
    }
  };

  const handleChildClick = async (child, depth) => {
    // Clear both forms when a new sidebar item is clicked
    clearLayoutReportFormData();
    clearGroupingFormData();

    if (depth === 2) {
      setSelectedDepth2Key(child.key); // mark the clicked depth 2 node
    }
    // The theme's MuiListItemButton styleOverrides will handle the class application
    // document.querySelectorAll(".selected-child").forEach((el) => el.classList.remove("selected-child"));
    // const el = document.querySelector(`[data-key="${child.key}"]`);
    // if (el) el.classList.add("selected-child");

    setLoading(true);
    try {
      setValue("TypeCode", child.code); // Set TypeCode in main form
      setValue("ReportTyp", child.type); // Set ReportTyp in main form

      let newVisibleTabs = { layout: false, grouping: false, reports: false };

      if (child.type === "L") {
        if (child.PrntSq === "Y") {
          const normalizedCode = child.code?.toString().trim().toUpperCase();
          const selectedObject = childObjectMapping[normalizedCode];

          if (selectedObject) {
            const objectCodes = Array.isArray(selectedObject.code)
              ? selectedObject.code
              : [selectedObject.code];

            const availableObjects = objectCodes.map((code) => ({
              code,
              objType: selectedObject.objType || "",
            }));

            setAvailableObjectIDs(availableObjects);
          } else {
            setAvailableObjectIDs([]);
          }

          newVisibleTabs = { layout: true, grouping: true, reports: false };

          await fetchLayoutData(child.code, child.DEFLT_REP);

          setGroupQuery("");
          setGroupPage(0);
          setGroups([]);
          await fetchGroupingDataList(0);
        } else {
          newVisibleTabs = { layout: true, grouping: false, reports: false };
          setAvailableObjectIDs([]);
          await fetchLayoutData(child.code, child.DEFLT_REP);
        }
      } else if (child.type === "R") {
        newVisibleTabs = { layout: false, grouping: false, reports: true };
        setAvailableObjectIDs([]);
        await fetchReportData(child.code, child.DEFLT_REP);
      }

      setVisibleTabs(newVisibleTabs);
      if (newVisibleTabs.layout) settabvalue(tabMap.layout.value);
      else if (newVisibleTabs.grouping) settabvalue(tabMap.grouping.value);
      else if (newVisibleTabs.reports) settabvalue(tabMap.reports.value);
    } catch (error) {
      console.error("Error handling child click:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to process",
        text: error.message || "Something went wrong!",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchMenu();
  }, []);

  // Filter menu data based on checkboxes
  const filteredMenuData = useMemo(() => {
    const filterNodes = (nodes) => {
      return nodes
        .map((node) => {
          if (node.children) {
            const filteredChildren = filterNodes(node.children);
            if (filteredChildren.length > 0) {
              return { ...node, children: filteredChildren };
            }
            return null;
          } else {
            const isCustomReport = node.title?.trim() === "Custom Report";
            if (isCustomReport && showReport) return node;
            if (!isCustomReport && showLayout) return node;
            return null;
          }
        })
        .filter(Boolean); // Remove nulls
    };
    return filterNodes(menuData);
  }, [menuData, showReport, showLayout]);

  // --- Render Functions ---
  const renderMenuTree = (nodes, depth = 0) => {
    return (
      <List disablePadding>
        {nodes.map((node) => {
          const isNodeOpen = openKeys.includes(node.key);
          const hasChildren = node.children && node.children.length > 0;

          return (
            <Box key={node.key}>
              <ListItemButton
                data-key={node.key}
                data-depth={depth}
                className={`${
                  depth === 0 && isNodeOpen ? "expanded-depth0" : ""
                } ${
                  depth === 2 && node.key === selectedDepth2Key
                    ? "selected-depth2"
                    : ""
                }`}
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  pl: depth * 2 + 1, // indent by depth
                  mb: depth === 1 ? 1 : 0,
                  ml: depth === 1 ? 4 : 0,
                  borderLeft: depth === 1 ? "4px solid #007bff" : "none",
                  borderRadius: depth === 1 ? "4px" : 0,
                  fontWeight: depth === 1 ? 500 : "normal",

                  backgroundColor:
                    depth === 1
                      ? theme.palette.mode === "light"
                        ? "#f1f3f5"
                        : "#343a40"
                      : "transparent",

                  color: theme.palette.mode === "light" ? "#343a40" : "#f1f3f5",

                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "light" ? "#e9ecef" : "#495057",
                    color:
                      theme.palette.mode === "light" ? "#343a40" : "#ffffff", // White text on hover in dark mode
                  },
                })}
                onClick={() => {
                  if (!hasChildren) {
                    handleChildClick(node, depth);
                  } else {
                    handleToggle(node.key, node);
                  }
                }}
              >
                {/* Depth 0 (Top level) gets an icon */}
                {depth === 0 && (
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: "inherit",
                      marginRight: "8px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {getDepth0Icon(node.title)}
                  </ListItemIcon>
                )}

                <ListItemText
                  primary={node.title}
                  sx={{ ml: 0, position: "relative", zIndex: 1 }}
                />

                {hasChildren &&
                  (isNodeOpen ? (
                    <ExpandLess
                      fontSize="small"
                      sx={{ position: "relative", zIndex: 1 }}
                    />
                  ) : (
                    <ChevronRightIcon
                      fontSize="small"
                      sx={{ position: "relative", zIndex: 1 }}
                    />
                  ))}
              </ListItemButton>

              {/* Render children recursively */}
              {hasChildren && (
                <Collapse in={isNodeOpen} timeout="auto" unmountOnExit>
                  {renderMenuTree(node.children, depth + 1)}
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
    );
  };

  const SidebarContent = (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: theme.palette.background.paper,
        // borderRadius: theme.shape.borderRadius, // Handled by MuiPaper styleOverrides
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          py: 0.9,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          position: "relative",
          justifyContent: "center",
          // bgcolor: "#D3D3D3",
          color: theme.palette.primary.contrastText,
          borderTopLeftRadius:
            theme.components?.MuiPaper?.styleOverrides?.root?.borderRadius ||
            12,
          borderTopRightRadius:
            theme.components?.MuiPaper?.styleOverrides?.root?.borderRadius ||
            12,
        }}
      >
        <Typography
          variant="60px"
          component="div"
          sx={{
            textAlign: "center",
            color: theme.palette.mode === "light" ? "black" : "#F5F6FA",
          }}
        >
          Report and Layout Manager
        </Typography>
        {/* <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setDrawerOpen(false)}
          sx={{
            display: { lg: "none", xs: "block" },
            position: "absolute",
            right: 8,
          }}
        >
          <CloseIcon />
        </IconButton> */}
      </Box>

      <Box
        sx={{
          p: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <Controller
          name="showReport"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox {...field} checked={field.value} size="small" />
              }
              label={<Typography variant="body2">Report</Typography>}
              sx={{ m: 0 }}
            />
          )}
        />
        <Controller
          name="showLayout"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox {...field} checked={field.value} size="small" />
              }
              label={<Typography variant="body2">Layout</Typography>}
              sx={{ m: 0 }}
            />
          )}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: 1,
          bgcolor: theme.palette.background.paper,
        }}
        id="ListScroll"
      >
        {filteredMenuData.length > 0 ? (
          renderMenuTree(filteredMenuData)
        ) : (
          <Typography textAlign="center" color="text.secondary" mt={4}>
            No data available
          </Typography>
        )}
      </Box>
    </Paper>
  );

  const ReportLayoutTabContent = ({ type, rows, columns }) => {
    const isLayout = type === "L";
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} textTransform="uppercase">
          <Grid item xs={12} sm={6} md={4} lg={4} textAlign="center">
            <Button
              variant="outlined"
              color="primary" // Changed to primary for consistency
              size="medium"
              startIcon={<CloudUploadIcon />}
              sx={{ px: 2, py: 1, fontWeight: 600, width: 220 }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.onchange = (e) => handleFileUpload(e.target.files[0]);
                input.click();
              }}
            >
              UPLOAD FILE
            </Button>
          </Grid>

          {layoutReportFields.map((field, index) => (
            <Grid
              key={index}
              item
              xs={12}
              sm={6}
              md={4}
              lg={4}
              textAlign="center"
            >
              <Controller
                name={field.name}
                control={control}
                rules={{
                  required: requiredLayoutReportFields.includes(field.name)
                    ? `${field.label} is required`
                    : false,
                }}
                render={({ field: controllerField, fieldState: { error } }) => (
                  <InputTextField
                    label={field.label}
                    type="text"
                    {...controllerField}
                    disabled={
                      field.disabled ||
                      requiredLayoutReportFields.includes(field.name)
                    }
                    error={!!error}
                    maxLength={100} // Increased maxLength for better usability
                    helperText={error ? error.message : null}
                    fullWidth
                  />
                )}
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={6} md={4} lg={4} textAlign="center">
            <Controller
              name="Status"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  sx={{ color: "text.primary" }}
                  control={
                    <Checkbox
                      checked={field.value === 1}
                      onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                    />
                  }
                  label="ACTIVE"
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider
          sx={{ my: 2, width: "100%", borderColor: theme.palette.divider }}
        />

        <Grid container justifyContent="center" spacing={2} mb={1}>
          {" "}
          {/* Adjusted alignment */}
          <Grid item>
            <Button
              variant="contained"
              color="success"
              sx={{ color: "white", minWidth: 180 }}
              onClick={handleSubmit(onSubmitLayoutReport)}
              disabled={
                (saveUpdateName === "SAVE" && !perms.IsAdd) ||
                (saveUpdateName !== "SAVE" && !perms.IsEdit)
              }
            >
              {watch("selectedRow")
                ? `UPDATE ${isLayout ? "LAYOUT" : "REPORT"}`
                : `ADD ${isLayout ? "LAYOUT" : "REPORT"}`}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              sx={{ minWidth: 140 }}
              onClick={clearLayoutReportFormData} // Use specific clear function
            >
              RESET
            </Button>
          </Grid>
        </Grid>

        <Grid item xs={12} sx={{ flexGrow: 1, overflowY: "auto" }}>
          <DataGrid
            className="datagrid-style"
            rows={rows}
            columns={columns}
            rowHeight={50}
            getRowId={(row) => row.id || row.DocEntry}
            pageSizeOptions={[5, 10, 20]}
            onRowClick={(params) => handleRowSelectLayoutReport(params.row)}
            getRowClassName={(params) =>
              params.id === selectedRow
                ? "selected-row"
                : params.row.Default === "Y"
                ? "default-row"
                : ""
            }
            hideFooter
            // sx={{
            //   height: "50vh",
            //   backgroundColor: theme.palette.background.paper,
            //   overflowY: "auto",
            //   // DataGrid styling moved to theme.js components.MuiDataGrid.styleOverrides.root
            // }}
            sx={{
              height: "50vh",
              // backgroundColor: "white",
              backgroundColor:
                theme.palette.mode === "light" ? "#f5f6fa" : "#505050",
              overflowY: "auto",
              "& .MuiDataGrid-columnHeaders": {
                position: "sticky",
                top: 0,
                backgroundColor: theme.palette.background.paper,
                zIndex: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              // backgroundColor: theme.palette.background.paper,
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
              "& .selected-row": {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "#e7eff8ff"
                    : theme.palette.action.selected,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.action.hover
                      : theme.palette.action.hover,
                },
              },
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              "& .MuiDataGrid-cell": { border: "none" },
              "& .MuiDataGrid-cell:focus": { outline: "none" },
              // "& .selected-row": {
              //   backgroundColor: theme.palette.action.selected,
              //   "&:hover": { backgroundColor: theme.palette.action.hover },
              // },
              "& .default-row": {
                bgcolor: theme.palette.mode === "light" ? "#e0e0e0" : "gray",
              },
            }}
          />
        </Grid>
      </Box>
    );
  };

  return (
    <>
      {loading && <Loader open={loading} />}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 80px)" // Full viewport height minus header/footer
        position={"relative"}
        component={"form"} // This form is for the main layout/report tab
        sx={{ p: 2, bgcolor: theme.palette.background.default }} // Apply default background to container
      >
        {/* Sidebar for larger screens */}
        <Grid
          item
          height="100%"
          lg={3}
          sm={12}
          pr={2}
          sx={
            {
              // display: { xs: "none", lg: "block" }, // Keep this if you want to hide on small screens
            }
          }
        >
          {SidebarContent}
        </Grid>

        {/* Drawer for smaller screens */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              bgcolor: theme.palette.background.paper,
              borderRadius:
                theme.components?.MuiPaper?.styleOverrides?.root
                  ?.borderRadius || 12,
            },
          }}
        >
          {SidebarContent}
        </Drawer>

        {/* Main Content Area */}
        <Grid
          container
          item
          xs={12}
          lg={9}
          height="100%"
          sx={{
            bgcolor: theme.palette.background.paper, // Use paper background for main content panel
            borderRadius:
              theme.components?.MuiPaper?.styleOverrides?.root?.borderRadius ||
              2,
            boxShadow:
              theme.components?.MuiPaper?.styleOverrides?.root?.boxShadow ||
              theme.shadows[3],
            overflow: "hidden",
          }}
        >
          {/* Header for Main Content */}
          <Box
            sx={{
              width: "100%",
              // py: 1.5,
              px: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              position: "relative",
              justifyContent: "center",
              // bgcolor: "#D3D3D3",
              color: "theme.palette.primary.contrastText",
              borderTopLeftRadius:
                theme.components?.MuiPaper?.styleOverrides?.root
                  ?.borderRadius || 4,
              borderTopRightRadius:
                theme.components?.MuiPaper?.styleOverrides?.root
                  ?.borderRadius || 4,
            }}
          >
            {/* <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{
                position: "absolute",
                left: 8,
                display: { lg: "none" },
              }}
            >
              <MenuIcon />
            </IconButton> */}

            <Typography
              variant="60px"
              component="div"
              sx={{
                textAlign: "center",
                color: theme.palette.mode === "light" ? "black" : "#F5F6FA",
              }}
            >
              Report and Layout Manager
            </Typography>

            <IconButton
              edge="end"
              color="primary" // Use primary color for the add icon
              aria-label="add"
              onClick={handleClearAllForms} // Use combined clear function
              sx={{ position: "absolute", right: 8 }}
            >
              <AddIcon />
            </IconButton>
          </Box>

          {/* Main Tab Content Area */}
          <Grid
            container
            item
            xs={12}
            height="calc(100% - 60px)" // Adjust height based on header (60px for header)
            sx={{ overflow: "auto" }}
          >
            <Box width={"100%"} noValidate autoComplete="off">
              <AppBar
                position="static"
                sx={{
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  mb: 2,
                }}
              >
                <TabContext value={tabvalue}>
                  <Tabs
                    value={tabvalue}
                    onChange={handleMainTab}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`, // Add a bottom border to tabs
                      // Tab styling moved to theme.js components.MuiTabs/MuiTab.styleOverrides.root
                    }}
                  >
                    {Object.entries(visibleTabs)
                      .filter(([, isVisible]) => isVisible)
                      .map(([key]) => (
                        <Tab
                          key={key}
                          value={tabMap[key].value}
                          label={tabMap[key].label}
                        />
                      ))}
                  </Tabs>

                  {(visibleTabs.layout || visibleTabs.reports) && (
                    <TabPanel
                      value={
                        tabMap[visibleTabs.layout ? "layout" : "reports"].value
                      }
                      sx={{ p: 0, pt: 2, height: "100%" }} // Ensure TabPanel takes full height
                    >
                      <ReportLayoutTabContent
                        type={visibleTabs.layout ? "L" : "R"}
                        rows={oLines}
                        columns={layoutReportColumns}
                      />
                    </TabPanel>
                  )}

                  {visibleTabs.grouping && (
                    <TabPanel
                      value={tabMap.grouping.value}
                      sx={{ p: 0, pt: 2, height: "100%" }} // Ensure TabPanel takes full height
                    >
                      {/* Grouping Tab Content - Now uses groupingControl */}
                      <Grid
                        container
                        spacing={2}
                        sx={{ height: "100%", display: "flex" }}
                      >
                        {/* Left Sidebar (Card List for Grouping) */}
                        <Grid
                          item
                          xs={12}
                          lg={3}
                          md={3}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "80vh",
                          }}
                        >
                          <Paper
                            elevation={2}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                              // borderRadius: theme.shape.borderRadius, // Handled by MuiPaper styleOverrides
                              overflow: "hidden",
                              bgcolor: theme.palette.background.paper,
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                bgcolor: theme.palette.background.default, // Use default background for search bar
                              }}
                            >
                              <SearchInputField
                                value={groupQuery}
                                onChange={(e) =>
                                  handleGroupSearch(e.target.value)
                                }
                                onClickClear={handleGroupClear}
                              />
                            </Box>

                            <Box
                              id="GroupingListScroll"
                              flex={1}
                              overflow="auto"
                              p={1}
                            >
                              <InfiniteScroll
                                style={{
                                  textAlign: "center",
                                  justifyContent: "center",
                                }}
                                dataLength={groups.length}
                                hasMore={hasMoreGroups}
                                next={fetchMoreGroups}
                                loader={
                                  <BeatLoader
                                    color={
                                      theme.palette.mode === "light"
                                        ? theme.palette.primary.main
                                        : theme.palette.primary.light
                                    }
                                  />
                                }
                                scrollableTarget="GroupingListScroll"
                                endMessage={
                                  <Typography
                                    sx={{
                                      color: theme.palette.text.secondary,
                                      py: 2,
                                    }}
                                  >
                                    No More Records
                                  </Typography>
                                }
                              >
                                {groups.map((item, i) => (
                                  <CardComponent
                                    key={i}
                                    title={item.SeqName}
                                    isSelected={selectedData === item.DocEntry}
                                    onClick={() =>
                                      setGroupingDataForEdit(item.DocEntry)
                                    }
                                    sx={{
                                      mb: 1,
                                      // borderRadius: theme.shape.borderRadius, // Handled by MuiPaper styleOverrides
                                      boxShadow: theme.shadows[1],
                                      "&:hover": {
                                        boxShadow: theme.shadows[3],
                                        transform: "translateY(-2px)",
                                        transition:
                                          "transform 0.2s ease-in-out",
                                      },
                                      bgcolor: theme.palette.background.default,
                                      color: theme.palette.text.primary,
                                      "&.selected": {
                                        bgcolor: theme.palette.primary.light,
                                        color:
                                          theme.palette.primary.contrastText,
                                        fontWeight: "bold",
                                        borderLeft: `4px solid ${theme.palette.primary.main}`, // Stronger selection indicator
                                        paddingLeft: 12,
                                      },
                                    }}
                                  />
                                ))}
                              </InfiniteScroll>
                            </Box>
                          </Paper>
                        </Grid>

                        {/* Right Section (Grouping Form + Table + Buttons) */}
                        <Grid
                          item
                          xs={12}
                          lg={9}
                          md={9}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            height: "80vh",
                          }}
                        >
                          <Paper
                            elevation={2}
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              // borderRadius: theme.shape.borderRadius, // Handled by MuiPaper styleOverrides
                              p: 2,
                              bgcolor: theme.palette.background.paper,
                            }}
                          >
                            <Grid container spacing={2} mb={2}>
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={4}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="SeqName"
                                  control={groupingControl} // Use groupingControl
                                  rules={{
                                    required: "Sequence Name is required",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="SEQUENCE NAME"
                                      type="text"
                                      {...field}
                                      error={!!error}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        if (error && e.target.value)
                                          clearGroupingErrors("SeqName"); // Use grouping form's clearErrors
                                      }}
                                      inputProps={{ maxLength: 100 }}
                                      helperText={error ? error.message : null}
                                      fullWidth
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
                                  name="FirstLayout"
                                  control={groupingControl} // Use groupingControl
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="1ST LAYOUT"
                                      type="text"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      fullWidth
                                      disabled // Assuming this field is display-only or derived
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
                                  name="NoOfSteps"
                                  control={groupingControl} // Use groupingControl
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="NO. OF STEPS"
                                      type="text"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      fullWidth
                                      disabled // Assuming this field is display-only or derived
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
                                  name="GroupingStatus"
                                  control={groupingControl} // Use groupingControl
                                  render={({ field }) => (
                                    <FormControlLabel
                                      sx={{ color: "text.primary" }}
                                      control={
                                        <Checkbox
                                          checked={field.value === 1}
                                          onChange={(e) =>
                                            field.onChange(
                                              e.target.checked ? 1 : 0
                                            )
                                          }
                                        />
                                      }
                                      label="ACTIVE"
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>
                            <Divider
                              sx={{
                                my: 2,
                                width: "100%",
                                borderColor: theme.palette.divider,
                              }}
                            />

                            <Box
                              display="flex"
                              flexDirection="column"
                              flexGrow={1}
                            >
                              <Box display="flex" alignItems="center" mb={1}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={addNewGroupRow}
                                  sx={{ minWidth: 150 }}
                                >
                                  <AddIcon sx={{ mr: 1 }} /> ADD ROW
                                </Button>
                              </Box>

                              <Box
                                flexGrow={1}
                                mb={2}
                                display="flex"
                                flexDirection="column"
                              >
                                <DataTable
                                  value={groupingOlines}
                                  reorderableRows
                                  onRowReorder={(e) => {
                                    const firstRow = groupingOlines[0];
                                    let newRows = e.value;
                                    if (
                                      firstRow &&
                                      newRows[0]?.id !== firstRow.id
                                    ) {
                                      newRows = newRows.filter(
                                        (r) => r.id !== firstRow.id
                                      );
                                      newRows = [firstRow, ...newRows];
                                    }
                                    setGroupingValue("groupingOlines", newRows);
                                  }}
                                  rowHover
                                  scrollable
                                  scrollHeight="40vh"
                                  style={{
                                    // backgroundColor:
                                    //   "theme.palette.background.paper",
                                    backgroundColor:
                                      theme.palette.mode === "light"
                                        ? "#f5f6fa"
                                        : "#515151",

                                    border: `1px solid ${theme.palette.divider}`,
                                    height: "100%",
                                    borderRadius:
                                      theme.components?.MuiPaper?.styleOverrides
                                        ?.root?.borderRadius || 12,
                                  }}
                                  emptyMessage={
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "100%",
                                        color: theme.palette.text.secondary,
                                        fontSize: "1rem",
                                        fontWeight: 500,
                                      }}
                                    >
                                      No Rows
                                    </div>
                                  }
                                  className="custom-datatable"
                                  rowClassName="custom-row"
                                >
                                  <Column
                                    rowReorder
                                    style={{ width: "3em" }}
                                    headerStyle={{
                                      position: "sticky",
                                      top: 0,
                                      backgroundColor:
                                        theme.palette.background.default, // Use default background for DataTable header
                                      zIndex: 1,
                                      fontWeight: 600,
                                      fontSize: "0.9rem",
                                      padding: "1rem 0.75rem", // ✅ Increased vertical padding
                                      minHeight: "60px", // ✅ Ensure taller header
                                      borderBottom: `2px solid ${theme.palette.divider}`,
                                    }}
                                  />
                                  {groupingDataTableColumns.map((col) => (
                                    <Column
                                      key={col.field}
                                      header={col.headerName}
                                      body={col.body}
                                      style={{
                                        width: col.width,
                                        border: "none",
                                      }}
                                      headerStyle={{
                                        position: "sticky",
                                        top: 0,
                                        backgroundColor:
                                          theme.palette.background.default, // Use default background for DataTable header
                                        zIndex: 1,
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                        padding: "1rem 0.75rem", // ✅ Increase vertical padding
                                        minHeight: "60px", // ✅ Minimum height for header
                                        borderBottom: `2px solid ${theme.palette.divider}`,
                                      }}
                                    />
                                  ))}
                                </DataTable>
                              </Box>

                              <Box
                                display="flex"
                                justifyContent="space-between" // Adjusted alignment
                                gap={2}
                                mt="auto"
                              >
                                <Button
                                  variant="contained"
                                  type="button"
                                  color="success"
                                  sx={{
                                    color: "white",
                                    minWidth: 120,
                                    px: 2,
                                    py: 1,
                                    fontWeight: "bold",
                                  }}
                                  disabled={
                                    (saveUpdateName === "SAVE" &&
                                      !perms.IsAdd) ||
                                    (saveUpdateName !== "SAVE" && !perms.IsEdit)
                                  }
                                  onClick={handleSaveUpdateGrouping} // Use grouping form's submit handler
                                >
                                  {saveUpdateName}
                                </Button>

                                <Button
                                  variant="contained"
                                  color="error"
                                  sx={{
                                    minWidth: 120,
                                    px: 2,
                                    py: 1.2,
                                    fontWeight: "bold",
                                  }}
                                  disabled={
                                    saveUpdateName === "SAVE" || !perms.IsDelete
                                  }
                                  onClick={handleDeleteGrouping}
                                >
                                  DELETE
                                </Button>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </TabPanel>
                  )}
                </TabContext>
              </AppBar>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
