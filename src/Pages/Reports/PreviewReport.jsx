import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MenuIcon from "@mui/icons-material/Menu";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";

import { ExpandLess } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import LabelIcon from "@mui/icons-material/Label";
import PeopleIcon from "@mui/icons-material/People";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Collapse,
  Divider,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  gridFilteredSortedRowIdsSelector,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  gridVisibleColumnFieldsSelector,
  useGridApiRef,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { SelectedDatePickerField } from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import usePermissions from "../Components/usePermissions";
export default function PreviewReport() {
  const theme = useTheme();
  const perms = usePermissions(171);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [paramRows, setParamRows] = useState([]);
  const [resultRows, setResultRows] = useState([]);
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedDepth1Key, setSelectedDepth1Key] = useState(null); // Since no depth 2, using for depth 1
  const [filteredMenuData, setFilteredMenuData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [reportMap, setReportMap] = useState({});

  // const timeoutRef = useRef(null);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const initial = {
    Name: "",
    Description: "",
    Query: "",
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const CustomToolbar = ({ onExport, disableExport }) => {
    return (
      <GridToolbarContainer
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
        }}
      >
        {/* Left side: Search + Filters */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <GridToolbarQuickFilter />
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
        </Box>

        {/* Right side: Export button */}
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={onExport}
          // disabled={disableExport}
          sx={{ borderRadius: "8px", px: 3 }}
        >
          Export
        </Button>
      </GridToolbarContainer>
    );
  };

  // ===============Main list handlesearch====================================
  // const handleOpenListSearch = (res) => {
  //   setOpenListQuery(res);
  //   setOpenListSearching(true);
  //   setOpenListPage(0);
  //   setOpenListData([]); // Clear current data

  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }

  //   timeoutRef.current = setTimeout(() => {
  //     fetchOpenListData(0, res);
  //   }, 600);
  //   // Fetch with search query
  // };
  // // Clear search
  // const handleOpenListClear = () => {
  //   setOpenListQuery(""); // Clear search input
  //   setOpenListSearching(false); // Reset search state
  //   setOpenListPage(0); // Reset page count
  //   setOpenListData([]); // Clear data
  //   fetchOpenListData(0); // Fetch first page without search
  // };
  // // Infinite scroll fetch more data
  // const fetchMoreOpenListData = () => {
  //   fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
  //   setOpenListPage((prev) => prev + 1);
  // };
  // const fetchOpenListData = async (pageNum, searchTerm = "") => {
  //   try {
  //     const url = searchTerm
  //       ? `/DynamicReports?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
  //       : `/DynamicReports?Status=1&Page=${pageNum}&Limit=20`;

  //     const response = await apiClient.get(url);

  //     if (response.data.success) {
  //       const newData = response.data.values;
  //       setHasMoreOpen(newData.length === 20);

  //       setOpenListData((prev) =>
  //         pageNum === 0 ? newData : [...prev, ...newData]
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };
  useEffect(() => {
    console.log("paramRows", paramRows);
  }, [paramRows]);
  useEffect(() => {
    // fetchOpenListData(0); // Load first page on mount
    GetMenuList();
    getOpenListData();
  }, []);
  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData(null);
    setResultRows([]);
    setParamRows([]);
  };

  // ===============API for Setting specific Cards data====================================
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      // await setbusinessPartner(CardCode, CntctCode);
      if (isDirty || "UPDATE" === ok) {
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
          setQueryPreviewDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setQueryPreviewDataList(DocEntry);
        setSaveUpdateName("UPDATE");
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
  const setQueryPreviewDataList = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true); // Start loader

    const response = await apiClient.get(`/DynamicReports?DocEntry=${DocEntry}`);
    const data = response.data?.values;

    if (!data) {
      Swal.fire({
        title: "Warning!",
        text: "No data found for the selected query.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Open drawer and reset form
    toggleDrawer();
    reset(data);
    setResultRows([]);

    // Map oLines safely to paramRows
    const rows = (data.oLines || []).map((line) => ({
      ...line,
      id: line.Name, // required for DataGrid
      Value: line.Value ?? "",
      Description: line.Description ?? "",
      Type: line.Type
        ? TYPE_OPTIONS.find((t) => t.sql === line.Type)?.ui || "String"
        : "String",
      SqlType: line.Type || "nvarchar",
    }));

    setParamRows(rows);
    console.log("param rows:", rows);

    // Update state for editing
    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);
  } catch (error) {
    console.error("Error fetching Query Preview data:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching the Query data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};


  // ==============useForm====================================

  const {
    control,
    handleSubmit,
    reset,
    watch,
    // formState: { errors },
  } = useForm({
    mode: "onSubmit", // or "onSubmit"
  });
  const queryValue = watch("Query");

  const { isDirty } = useFormState({ control });
  const validateSelectQuery = (query = "") => {
    if (!query.trim()) {
      return { valid: false, message: "Query cannot be empty" };
    }

    const normalized = query.trim().toLowerCase();

    // Must start with SELECT
    if (!normalized.startsWith("select")) {
      return {
        valid: false,
        message: "Only SELECT queries are allowed",
      };
    }

    // Block dangerous keywords
    const blockedKeywords = [
      "insert ",
      "update ",
      "delete ",
      "drop ",
      "truncate ",
      "alter ",
      "create ",
      "merge ",
      "grant ",
      "revoke ",
      "exec ",
      "execute ",
      "call ",
      "xp_",
    ];

    for (const keyword of blockedKeywords) {
      if (normalized.includes(keyword)) {
        return {
          valid: false,
          message: `Forbidden keyword detected: ${keyword.toUpperCase()}`,
        };
      }
    }

    return { valid: true };
  };

  // ===============PUT and POST API ===================================
  const apiRef = useGridApiRef();

  const handleExportCSV = () => {
    if (!apiRef.current) return;

    // ✅ Get visible column fields
    const visibleFields = gridVisibleColumnFieldsSelector(apiRef);

    // ✅ Get filtered + sorted row ids
    const filteredRowIds = gridFilteredSortedRowIdsSelector(apiRef);

    if (filteredRowIds.length === 0) {
      Swal.fire("No Data", "No visible data to export", "warning");
      return;
    }

    // Headers from column definitions
    const headers = visibleFields.map((field) => {
      const col = apiRef.current.getColumn(field);
      return col?.headerName || field;
    });

    const csvRows = [
      headers.join(","),

      ...filteredRowIds.map((id) => {
        const row = apiRef.current.getRow(id);
        return visibleFields
          .map((field) => `"${row?.[field] ?? ""}"`)
          .join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Customized_Report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExecute = async () => {
  // 1️⃣ Query validation
  const queryValidation = validateSelectQuery(queryValue);
  if (!queryValidation.valid) {
    Swal.fire({
      title: "Invalid Query!",
      text: queryValidation.message,
      icon: "error",
    });
    return;
  }

  // 2️⃣ Parameter validation
  const paramError = validateAllParams(paramRows);
  if (paramError) {
    Swal.fire({
      title: "Validation Error!",
      text: paramError,
      icon: "warning",
    });
    return;
  }

  const payload = {
    DocEntry: selectedData,
    oParameters: paramRows.map((row) => ({
      Name: String(row.Name),
      Value: String(row.Value),
    })),
  };

  try {
    setLoading(true); // Start loader

    const resp = await apiClient.post("/DynamicReports/GetReportData", payload);
    const values = (resp?.data?.values || []).map((row) => ({
      ...row,
      _id: uuidv4(), // unique ID for rendering
    }));

    setResultRows(values);

    if (resp.data.success) {
      setAccordionOpen(false);

      Swal.fire({
        title: "Success!",
        text: "Query Executed Successfully",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: resp.data.message || "Execution failed",
        icon: "warning",
      });
    }
  } catch (error) {
    console.error("Error executing query:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while executing the query.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};

  const resultColumns = React.useMemo(() => {
    if (!resultRows.length) return [];

    const sampleRow = resultRows[0];

    return Object.keys(sampleRow)
      .filter((key) => key !== "_id" && !key.toLowerCase().endsWith("_id"))
      .map((key) => {
        const value = sampleRow[key];

        let columnType = "string";
        let width = 260; // default

        if (typeof value === "number") {
          columnType = "number";
          width = 120;
        }

        if (typeof value === "boolean") {
          columnType = "boolean";
          width = 100;
        }

        if (typeof value === "string" && value.length > 30) {
          width = 260;
        }

        return {
          field: key,
          headerName: key
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .toUpperCase(),
          width,
          minWidth: 200,
          type: columnType,

          // UX: text left, numbers center
          align: "left",
          headerAlign: "left",
        };
      });
  }, [resultRows]);

const validateAllParams = (rows) => {
  for (const row of rows) {
    const { Value, IsOptional, Name, Type } = row;

    const isEmpty =
      Value === "" || Value === null || Value === undefined;

    // ❌ Required field missing
    if (!IsOptional && isEmpty) {
      return `${Name}: Value is required`;
    }

    // ❌ Type validation only when value exists
    if (!isEmpty && !isValidByType(Value, Type)) {
      return `${Name}: Invalid ${Type} value`;
    }
  }

  return null; // ✅ all valid
};



 const handleSubmitForm = async (data) => {
  // Prepare payload
  const obj = {
    DocEntry: data.DocEntry || 0,
    UserId: user.UserId,
    CreatedBy: user.UserName || "",
    CreatedDate: dayjs().format("YYYY-MM-DD"),
    ModifiedBy: user.UserName || "",
    ModifiedDate: dayjs().format("YYYY-MM-DD"),
    Name: String(data.Name || ""),
    Description: String(data.Description || ""),
    Query: String(data.Query || ""),
    NoOfParam: String(data.NoOfParam || "0"),
    oLines: (paramRows || []).map((row) => ({
      LineNum: row.LineNum || 0,
      DocEntry: data.DocEntry || 0,
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: 1,
      Name: String(row.Name || ""),
      Type: String(row.SqlType || "nvarchar"),
      Value: String(row.Value || ""),
      Description: String(row.Description || ""),
    })),
  };

  try {
    setLoading(true); // Start loader

    // 1️⃣ Validate SQL query
    const validation = validateSelectQuery(data.Query);
    if (!validation.valid) {
      Swal.fire({
        title: "Invalid Query",
        text: validation.message,
        icon: "error",
      });
      return;
    }

    // 2️⃣ Validate parameters
    const paramError = validateAllParams(paramRows);
    if (paramError) {
      Swal.fire({
        title: "Validation Error",
        text: paramError,
        icon: "warning",
      });
      return;
    }

    // 3️⃣ Save or Update
    if (SaveUpdateName === "SAVE") {
      const resp = await apiClient.post("/DynamicReports", obj);
      if (resp.data.success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        Swal.fire({
          title: "Success!",
          text: "Query Added Successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: resp.data.message || "Query is not Added",
          icon: "warning",
        });
      }
    } else {
      const result = await Swal.fire({
        text: `Do You Want to Update "${data.ServCode}"?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        const response = await apiClient.put(`/DynamicReports/${data.DocEntry}`, obj);
        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          Swal.fire({
            title: "Success!",
            text: "Query Updated Successfully",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Update failed",
            icon: "warning",
          });
        }
      } else {
        Swal.fire({
          text: "Query is Not Updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while saving the query.",
      icon: "error",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};


  // ===============Delete API ===================================

  //   const handleOnDelete = async (data) => {
  //     const result = await Swal.fire({
  //       text: `Do You Want to Delete ?`,
  //       icon: "question",
  //       confirmButtonText: "YES",
  //       cancelButtonText: "No",
  //       showConfirmButton: true,
  //       showDenyButton: true,
  //     });

  //     if (result.isConfirmed) {
  //       setLoading(true);
  //       try {
  //         const response = await apiClient.delete(`/DynamicReports/${DocEntry}`);
  //         const { success, message } = response.data;
  //         setLoading(false);
  //         if (success) {
  //           clearFormData();
  //           setOpenListPage(0);
  //           setOpenListData([]);
  //           fetchOpenListData(0);
  //           Swal.fire({
  //             text: "Query Deleted Successfully",
  //             icon: "success",
  //             toast: true,
  //             showConfirmButton: false,
  //             timer: 1000,
  //           });
  //         } else {
  //           Swal.fire({
  //             text: "Query not Deleted",
  //             icon: "info",
  //             toast: true,
  //             showConfirmButton: false,
  //             timer: 1500,
  //           });
  //         }
  //       } catch (error) {
  //         Swal.fire({
  //           text: "An error occurred while deleting the Query.",
  //           icon: error,
  //           toast: true,
  //           showConfirmButton: false,
  //           timer: 1500,
  //         });
  //       } finally {
  //       }
  //     } else {
  //       Swal.fire({
  //         text: "Query Not Deleted",
  //         icon: "info",
  //         toast: true,
  //         showConfirmButton: false,
  //         timer: 1500,
  //       });
  //     }
  //   };
  useEffect(() => {
    if (!queryValue) {
      setParamRows([]);
      return;
    }
    const extractParams = (query = "") => {
      const matches = query.match(/@\w+/g) || [];
      return [...new Set(matches.map((p) => p.substring(1)))]; // remove @ + unique
    };

    const params = extractParams(queryValue);

    setParamRows((prev) => {
      const prevMap = new Map(prev.map((r) => [r.Name, r]));

      return params.map((p) => {
        const existing = prevMap.get(p);

        return {
          id: p,
          Name: p,
          Description: existing?.Description || "",
          Value: existing?.Value || "",
          Type: existing?.Type || "String",
          SqlType: existing?.SqlType || "nvarchar",
        };
      });
    });
  }, [queryValue]);
  const isValidByType = (value, type) => {
    if (value === "" || value === null || value === undefined) return true;

    const val = String(value).trim();
    const t = type?.toLowerCase();

    switch (t) {
      case "integer":
      case "int":
        return /^-?\d+$/.test(val);

      case "decimal":
      case "numeric":
        return /^-?\d+(\.\d+)?$/.test(val);

      case "bit":
        // SQL bit: only 0 or 1
        return val === "0" || val === "1";

      case "boolean":
        // JS-style boolean support (optional)
        return val === "true" || val === "false" || val === "1" || val === "0";

      case "datetime":
      case "date":
        return !isNaN(Date.parse(val));

      default: // string, nvarchar, varchar
        return true;
    }
  };

  const EditableCell = React.memo(function EditableCell({
    value,
    rowId,
    field,
    rowType,
    sqlType,
    setParamRows,
    disabled = false,
  }) {
    const type = rowType?.toLowerCase();
    const sql = sqlType?.toLowerCase();

    const updateValue = (val) => {
      setParamRows((prev) =>
        prev.map((row) => (row.id === rowId ? { ...row, [field]: val } : row)),
      );
    };

    /* =======================
     BIT (0 / 1)
  ======================== */
    if (sql === "bit") {
      return (
        <TextField
          select
          size="small"
          fullWidth
          disabled={disabled}
          value={value === 1 || value === "1" ? 1 : 0}
          onChange={(e) => updateValue(Number(e.target.value))}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <MenuItem value={1}>True</MenuItem>
          <MenuItem value={0}>False</MenuItem>
        </TextField>
      );
    }

    /* =======================
     DATETIME
  ======================== */
    if (type === "datetime") {
      return (
        <SelectedDatePickerField
          value={value}
          disabled={disabled}
          onChange={(isoValue) => {
            const formatted = isoValue
              ? dayjs(isoValue).format("YYYY-MM-DD")
              : "";
            updateValue(formatted);
          }}
        />
      );
    }

    /* =======================
     NUMBER (INT / DECIMAL)
  ======================== */
    if (sql === "int" || sql === "decimal") {
      return (
        <TextField
          size="small"
          type="number"
          value={value ?? ""}
          onChange={(e) => updateValue(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          disabled={disabled}
          fullWidth
          inputProps={{
            step: sql === "decimal" ? "any" : 1,
          }}
        />
      );
    }

    /* =======================
     STRING (NVARCHAR)
  ======================== */
    return (
      <TextField
        size="small"
        value={value ?? ""}
        onChange={(e) => updateValue(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        disabled={disabled}
        fullWidth
      />
    );
  });

  const TYPE_OPTIONS = [
    { ui: "String", sql: "nvarchar" },
    { ui: "Integer", sql: "int" },
    { ui: "Decimal", sql: "decimal" },
    { ui: "Boolean", sql: "bit" },
    { ui: "DateTime", sql: "datetime" },
  ];

  const columns = useMemo(
    () => [
      {
        field: "Description",
        headerName: "Description",
        width: 300,
        align: "center",
        headerAlign: "center",
      },
      //      {
      //     field: "Type",
      //     headerName: "Type",
      //     width: 150,
      //     align: "center",
      //     headerAlign: "center",
      //     renderCell: (params) => (
      //       <TypeDropdown
      //         value={params.value}
      //         disabled
      //         rowId={params.id}
      //         setParamRows={setParamRows}
      //       />
      //     ),
      //   },
      {
        field: "Name",
        headerName: "Parameter",
        width: 300,
        align: "center",
        headerAlign: "center",
      },

      {
        field: "Value",
        headerName: "Value",
        width: 250,
        renderCell: (params) => (
          <EditableCell
            value={params.value}
            rowId={params.id}
            field="Value"
            rowType={params.row.Type} // Datetime / Int / Decimal / String
            sqlType={params.row.SqlType} // nvarchar / int / decimal
            setParamRows={setParamRows}
          />
        ),
      },
    ],
    [setParamRows],
  );
  const handleToggle = (key, node) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };
  const handleSubMenuClick = (node) => {
    const [menuId] = node.key.split("-");

    const parentMenu = treeData.find(
      (m) => String(m.menuId) === String(menuId),
    );

    console.log("MenuId:", parentMenu?.menuId);
    console.log("MenuName:", parentMenu?.title);
    console.log("SubMenuId:", node.subMenuId);
    console.log("SubMenuName:", node.title);
  };
  // const handleReportClick = (node) => {
  //   console.log("Report DocEntry:", node.docEntry);
  //   console.log("Report Name:", node.title);
  //   console.log("Query:", node.query);
  //   console.log("Params:", node.oLines);

  //   // this is where you load the report UI
  // };

  // Handle click on leaf nodes (depth 1)
  const handleReportClick = (node, depth) => {
    // If this is a REPORT → open it
    if (node.docEntry) {
      console.log("Opening Report:", node.title, node.docEntry);
      setQueryPreviewDataList(node.docEntry); // 🔥 load query
      return;
    }

    // Otherwise it's a submenu click
    const [menuId] = node.key.split("-");

    const parentMenu = treeData.find(
      (m) => String(m.menuId) === String(menuId),
    );

    console.log("MenuId:", parentMenu?.menuId);
    console.log("MenuName:", parentMenu?.title);
    console.log("SubMenuId:", node.subMenuId);
    console.log("SubMenuName:", node.title);
  };

  // Function to get icon for depth 0 (grandparent)
  const getDepth0Icon = (title) => {
    // Customize based on title, e.g., if title includes certain words
    if (title.includes("2")) return <PeopleIcon />; // Example for DocEntry 2
    if (title.includes("3")) return <SettingsIcon />; // Example for DocEntry 3
    return <FolderIcon />; // Default
  };

const GetMenuList = async () => {
  try {
    setLoading(true); // Start loader

    const res = await apiClient.get(`/Menu/all`);

    // Check API success
    if (!res.data?.success) {
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch menus from the server.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Filter out unwanted menu (DocEntry = 1)
    const menus = (res.data.values || []).filter((m) => String(m.DocEntry) !== "1");

    // Build tree structure
    const tree = menus.map((menu) => ({
      key: String(menu.DocEntry),
      title: menu.Name,
      menuId: menu.DocEntry,
      children: (menu.oLines || []).map((line) => {
        const reportKey = `${menu.DocEntry}-${line.LineNum}`;
        return {
          key: reportKey,
          title: line.TileName,
          subMenuId: line.LineNum,
          children: reportMap?.[reportKey] || [], // Safely inject reports
        };
      }),
    }));

    setTreeData(tree);
    setFilteredMenuData(tree);
  } catch (error) {
    console.error("Menu load error:", error);
    Swal.fire({
      title: "Error!",
      text: "An error occurred while loading menus. Please try again.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};


  const buildReportMap = (reports) => {
    const map = {};

    reports.forEach((r) => {
      if (!r.MenuId || !r.SubMenuId) return;

      const key = `${r.MenuId}-${r.SubMenuId}`;

      if (!map[key]) map[key] = [];

      map[key].push({
        key: `R-${r.DocEntry}`,
        title: r.Name,
        docEntry: r.DocEntry,
        query: r.Query,
        oLines: r.oLines,
      });
    });

    return map;
  };
  useEffect(() => {
    if (reportMap) {
      GetMenuList();
    }
  }, [reportMap]);

 const getOpenListData = async () => {
  try {
    setLoading(true); // Start loader

    const res = await apiClient.get(`/DynamicReports?Status=1&Page=0&Limit=1500`);

    if (!res.data?.success) {
      Swal.fire({
        title: "Error!",
        text: res.data?.message || "Failed to fetch reports.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    const values = res.data.values || [];

    setOpenListData(values); // Set report list
    setReportMap(buildReportMap(values)); // Build report map for menus or children
  } catch (error) {
    console.error("Error fetching open list data:", error);

    Swal.fire({
      title: "Error!",
      text: error.response?.data?.message || error.message || "Failed to fetch data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};


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
                  depth === 1 && node.key === selectedDepth1Key
                    ? "selected-depth1"
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
                      theme.palette.mode === "light" ? "#343a40" : "#ffffff",
                  },
                })}
                onClick={() => {
                  if (depth === 2) {
                    // Report clicked
                    handleReportClick(node);
                  } else if (depth === 1) {
                    // SubMenu clicked → ALWAYS trigger selection
                    handleSubMenuClick(node);
                    handleToggle(node.key); // also expand reports
                  } else {
                    // Menu level
                    handleToggle(node.key);
                  }
                }}
              >
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
  const sidebarContent = (
    <Paper
      elevation={3}
      sx={{
        height: "105%",

        display: "flex",
        flexDirection: "column",
        bgcolor: theme.palette.background.paper,
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
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            color: theme.palette.mode === "light" ? "#333" : "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Reports List
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
      </Box>

      {/* <Box
        sx={{
          p: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SearchInputField
          onChange={(e) => handleOpenListSearch(e.target.value)}
          value={openListquery}
          onClickClear={handleOpenListClear}
        />
      </Box> */}

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
  // const sidebarContent = (
  //   <>
  //     {/* <Grid
  //       item
  //       width={"100%"}
  //       py={0.5}
  //       alignItems={"center"}
  //       border={"1px solid silver"}
  //       borderBottom={"none"}
  //       position={"relative"}
  //       sx={{
  //         backgroundColor:
  //           theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
  //       }}
  //     > */}
  //     <Grid
  //       item
  //       width={"100%"}
  //       py={1}
  //       alignItems={"center"}
  //       sx={{
  //         background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // Subtle gradient
  //         borderRadius: "8px 8px 0 0",
  //         boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  //       }}
  //     >
  //       <Typography
  //         variant="h6"
  //         textAlign={"center"}
  //         alignContent={"center"}
  //         height={"100%"}
  //         sx={{
  //           fontWeight: 600,
  //           color: "#333",
  //           textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  //         }}
  //       >
  //         Query List
  //       </Typography>

  //       <IconButton
  //         edge="end"
  //         color="inherit"
  //         aria-label="close"
  //         onClick={() => setDrawerOpen(false)}
  //         sx={{
  //           position: "absolute",
  //           right: "10px",
  //           top: "0px",
  //           display: { lg: "none", xs: "block" },
  //         }}
  //       >
  //         <CloseIcon />
  //       </IconButton>
  //     </Grid>

  //     <Grid
  //       container
  //       item
  //       width={"100%"}
  //       height={"100%"}
  //       border={"1px silver solid"}
  //       sx={{
  //         backgroundColor:
  //           theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
  //       }}
  //     >
  //       <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
  //         <Box
  //           sx={{
  //             width: "100%",
  //             height: "100%",
  //             px: 1,
  //             overflow: "scroll",
  //             overflowX: "hidden",
  //             typography: "body1",
  //           }}
  //           id="ListScroll"
  //         >
  //           <Grid
  //             item
  //             padding={1}
  //             md={12}
  //             sm={12}
  //             width={"100%"}
  //             sx={{
  //               position: "sticky",
  //               top: "0",
  //               backgroundColor:
  //                 theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
  //             }}
  //           >
  //             <SearchInputField
  //               onChange={(e) => handleOpenListSearch(e.target.value)}
  //               value={openListquery}
  //               onClickClear={handleOpenListClear}
  //             />
  //           </Grid>
  //           <InfiniteScroll
  //             style={{ textAlign: "center", justifyContent: "center" }}
  //             dataLength={openListData.length}
  //             hasMore={hasMoreOpen}
  //             next={fetchMoreOpenListData}
  //             loader={
  //               <BeatLoader
  //                 color={theme.palette.mode === "light" ? "black" : "white"}
  //               />
  //             }
  //             scrollableTarget="ListScroll"
  //             endMessage={<Typography>No More Records</Typography>}
  //           >
  //             {openListData.map((item, i) => (
  //               <CardComponent
  //                 key={i}
  //                 title={item.Name}
  //                 subtitle={item.Description}
  //                 isSelected={selectedData === item.DocEntry}
  //                 searchResult={openListquery}
  //                 onClick={() => setOldOpenData(item.DocEntry)}
  //               />
  //             ))}
  //           </InfiniteScroll>
  //         </Box>
  //       </Grid>
  //     </Grid>
  //   </>
  // );
  useEffect(() => {
    if (paramRows.length > 0) {
      setAccordionOpen(true);
    }
  }, [paramRows]);

  return (
    <>
      {loading && <Loader open={loading} />}
      {/* <Spinner open={loading} /> */}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
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
            display: { lg: "block", xs: `${drawerOpen ? "block" : "none"}` },
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
            onClick={toggleDrawer}
            sx={{
              display: {
                lg: "none",
              }, // Show only on smaller screens
              position: "absolute",
              left: "10px",
              top: "10px",
              color: "#555", // Subtle color
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="clear"
            onClick={clearFormData}
            sx={{
              position: "absolute",
              right: "10px",
              top: "10px",
              color: "#555", // Subtle color
            }}
          >
            <AddIcon />
          </IconButton>

          {/* Modern Header */}
          <Grid
            item
            width={"100%"}
            py={1}
            alignItems={"center"}
            sx={{
              // background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // Subtle gradient
              borderRadius: "8px 8px 0 0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h6"
              textAlign={"center"}
              alignContent={"center"}
              height={"100%"}
              sx={{
                fontWeight: 600,
                color: theme.palette.mode === "light" ? "#333" : "#fff",

                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Preview Report
            </Typography>
          </Grid>

          <Grid
            container
            item
            width={"100%"}
            height={"100%"}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "0 0 8px 8px",
              backgroundColor:
                theme.palette.mode === "light" ? "#fafafa" : "#080D2B",
            }}
          >
            <Grid
              container
              item
              padding={2}
              md={12}
              sm={12}
              height="100%"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
              position={"relative"}
            >
              <Box
                width={"100%"}
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              >
                {/* Report Details Section - Redesigned with Cards for Attractiveness */}
                <Paper
                  sx={{
                    width: "100%",
                    mb: 3,
                    p: 3,
                  }}
                >
                  <Paper
                    sx={{
                      px: 2,
                      py: 1,
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      backgroundColor:
                        theme.palette.mode === "light" ? "#f7f9fc" : "#080D2B",
                      border: "1px solid #e0e6ed",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <LabelIcon fontSize="small" color="primary" />
                      <Typography fontWeight={600}>
                        {control._formValues.Name || ""}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    <Box display="flex" alignItems="center" gap={1}>
                      <DescriptionIcon fontSize="small" color="primary" />
                      <Typography color="text.secondary">
                        {control._formValues.Description || ""}
                      </Typography>
                    </Box>
                  </Paper>

                  <Accordion
                    expanded={accordionOpen}
                    onChange={(_, isExpanded) => setAccordionOpen(isExpanded)}
                    sx={{
                      mb: 2,
                      border: "1px solid #e0e0e0",
                      boxShadow: "none",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={null} // Remove default expand icon
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 16px", // Add subtle padding for better spacing
                        // backgroundColor: "#f5f5f5", // Light background for attractiveness
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "#f5f5f5"
                            : "#080D2B",
                        borderRadius: "4px", // Slight rounding
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "light"
                              ? "#e8f4fd"
                              : "#080D2B",
                        },
                      }}
                    >
                      {/* Left: Expand Icon */}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccordionOpen((prev) => !prev);
                        }}
                        sx={{
                          marginRight: 1,
                          color: "#1976d2",
                          "&:hover": {
                            color: "#1565c0",
                          },
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>

                      {/* Right: Actions */}
                      <Box
                        sx={{ display: "flex", gap: 1 }}
                        onClick={(e) => e.stopPropagation()} // 🚫 prevent toggle
                      >
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon />} // Add icon for attractiveness
                          sx={{
                            backgroundColor: "#1976d2",
                            "&:hover": {
                              backgroundColor: "#1565c0",
                            },
                            borderRadius: "8px",
                            px: 3,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Subtle shadow
                          }}
                          disabled={selectedData === null}
                          onClick={() => {
                            handleExecute(); // ✅ execute query
                            // setAccordionOpen(false); // ✅ optional
                          }}
                        >
                          Execute
                        </Button>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 0 }}>
                      {/* ✅ EXISTING PARAMETER DATAGRID */}
                      <Paper sx={{ width: "100%", p: 2 }}>
                        <DataGrid
                          className="datagrid-style"
                          rows={paramRows || []}
                          columns={columns}
                          getRowId={(row) => row.id || row.LineNum}
                          disableRowSelectionOnClick
                          hideFooter
                          rowHeight={55}
                          headerHeight={56}
                          autoHeight={paramRows.length <= 5}
                          sx={{
                            height: paramRows.length > 5 ? "40vh" : "auto",
                            width: "100%",
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "#fff"
                                : "#515151",
                          }}
                        />
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                </Paper>

                {/* Results Section */}
                {/* {executed && ( */}
                <Paper
                  sx={{
                    width: "100%",
                    mt: 3,
                    p: 2,
                  }}
                >
                  <DataGrid
                    apiRef={apiRef}
                    rows={resultRows}
                    columns={resultColumns}
                    getRowId={(row) => row._id}
                    disableRowSelectionOnClick
                    rowHeight={45}
                    density="compact"
                    pageSizeOptions={[25, 50, 75, 100]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 100, page: 0 },
                      },
                    }}
                    slots={{
                      toolbar: CustomToolbar,
                    }}
                    slotProps={{
                      toolbar: {
                        onExport: handleExportCSV,
                        disableExport:
                          SaveUpdateName === "SAVE" ||
                          !perms.IsDelete ||
                          resultRows.length === 0,
                      },
                    }}
                    sx={{
                      height: "60vh",
                      // backgroundColor: "#fff",
                      backgroundColor:
                        theme.palette.mode === "light" ? "#fff" : "#515151",
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f5f5f5",
                        fontWeight: "bold",
                      },
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "#f0f0f0",
                        // color:
                        //   theme.palette.mode === "light"
                        //     ? "#f0f0f0"
                        //     : "#515151",
                      },
                    }}
                  />
                </Paper>
                {/* )} */}
              </Box>
            </Grid>

            {/* Footer with Buttons */}
            {/* <Grid
              item
              xs={12}
              px={2}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                bottom: 0,
                background: "#fff",
                py: 2,
                borderTop: "1px solid #e0e0e0",
                boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#1976d2",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                    borderRadius: "8px",
                    px: 3,
                  }}
                  disabled={selectedData === null}
                  onClick={handleExecute}
                >
                  Execute
                </Button>
              </Box>
            </Grid> */}
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}

//compressed UI (accordion)
