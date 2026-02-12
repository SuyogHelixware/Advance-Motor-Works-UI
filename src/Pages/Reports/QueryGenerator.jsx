import { BuildCircleOutlined } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import TableChartIcon from "@mui/icons-material/TableChart";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  List,
  ListItem,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
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
import {
  InputSearchSelectTextField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";

export default function QueryGenerator() {
  const theme = useTheme();
  const perms = usePermissions(172);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const [MenuData, setMenuData] = useState([]);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [paramRows, setParamRows] = useState([]);

  const timeoutRef = useRef(null);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [buildQueryModalOpen, setBuildQueryModalOpen] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]); // Array of { name, alias }
  const [tableColumns, setTableColumns] = useState([]); // Columns with table and alias
  const [subMenuData, setSubMenuData] = useState([]);

  const [selectedParameters, setSelectedParameters] = useState({
    select: [],
    where: [],
    groupBy: [],
    orderBy: [],
  });

  const [queryClauses, setQueryClauses] = useState({
    select: "",
    from: "",
    where: "",
    orderBy: "",
    groupBy: "",
  });
  const [activeField, setActiveField] = useState("select"); // Active clause for parameter selection
  const [tableSearch, setTableSearch] = useState("");
  const [paramSearch, setParamSearch] = useState("");

  // Add useMemo for filtered lists
  const filteredTables = useMemo(() => {
    if (!tableSearch) return availableTables;
    return availableTables.filter(
      (table) =>
        table.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        table.description.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [availableTables, tableSearch]);

  const filteredParams = useMemo(() => {
    if (!paramSearch) return tableColumns;
    return tableColumns.filter(
      (column) =>
        column.name.toLowerCase().includes(paramSearch.toLowerCase()) ||
        column.description.toLowerCase().includes(paramSearch.toLowerCase()) ||
        column.alias.toLowerCase().includes(paramSearch.toLowerCase()) || // Added: Search by alias
        column.table.toLowerCase().includes(paramSearch.toLowerCase()) // Added: Search by table name
    );
  }, [tableColumns, paramSearch]);
  // Performant function to clear query-related states when no tables are selected
  const clearQueryStates = useCallback(() => {
    setQueryClauses({
      select: "",
      from: "",
      where: "",
      orderBy: "",
      groupBy: "",
    });
    setSelectedParameters({
      select: [],
      where: [],
      groupBy: [],
      orderBy: [],
    });
  }, []); // Empty dependency array since it only sets states
  const handleSelectAllTables = useCallback(
    (checked) => {
      if (checked) {
        const newSelected = filteredTables.map((table, index) => ({
          name: table.name,
          alias: `T${index + 1}`,
        }));
        setSelectedTables(newSelected);
        setQueryClauses((prev) => ({
          ...prev,
          from: newSelected.map((t) => `${t.name} ${t.alias}`).join(", "),
        }));
      } else {
        setSelectedTables([]);
        setQueryClauses((prev) => ({ ...prev, from: "" }));
      }
    },
    [filteredTables]
  ); // Depends on filteredTables

  const handleSelectAllParams = useCallback(
    (checked) => {
      setSelectedParameters((prev) => {
        const currentSelected = Array.isArray(prev[activeField])
          ? prev[activeField]
          : []; // Ensure it's an array
        if (checked) {
          // Add only filteredParams that aren't already selected
          const toAdd = filteredParams.filter(
            (param) =>
              !currentSelected.some(
                (p) => p.alias === param.alias && p.name === param.name
              )
          );
          return {
            ...prev,
            [activeField]: [...currentSelected, ...toAdd],
          };
        } else {
          // Remove only the filteredParams from currentSelected
          const remaining = currentSelected.filter(
            (selected) =>
              !filteredParams.some(
                (param) =>
                  param.alias === selected.alias && param.name === selected.name
              )
          );
          return {
            ...prev,
            [activeField]: remaining,
          };
        }
      });

      // Update queryClauses accordingly
      setQueryClauses((prev) => {
        const current = prev[activeField] || "";
        const currentSelected = Array.isArray(prev[activeField])
          ? prev[activeField]
          : []; // Ensure it's an array
        if (checked) {
          const toAdd = filteredParams.filter(
            (param) =>
              !currentSelected.some(
                (p) => p.alias === param.alias && p.name === param.name
              )
          );
          const newParams = [...currentSelected, ...toAdd].map(
            (p) => `${p.alias}.${p.name}`
          );
          return {
            ...prev,
            [activeField]: newParams.join(", "),
          };
        } else {
          const remaining = currentSelected.filter(
            (selected) =>
              !filteredParams.some(
                (param) =>
                  param.alias === selected.alias && param.name === selected.name
              )
          );
          return {
            ...prev,
            [activeField]: remaining
              .map((p) => `${p.alias}.${p.name}`)
              .join(", "),
          };
        }
      });
    },
    [activeField, filteredParams, selectedParameters]
  );

  useEffect(() => {
    if (!selectedTables.length) {
      setTableColumns([]);
      return;
    }

    const fetchAll = async () => {
      const results = await Promise.all(
        selectedTables.map((t) =>
          fetchTableColumns(t.name).then((cols) =>
            cols.map((c) => ({
              ...c,
              table: t.name,
              alias: t.alias,
            }))
          )
        )
      );
      setTableColumns(results.flat());
    };

    fetchAll();
  }, [selectedTables]);

  // Add these functions
  const handleParameterSelection = useCallback(
    (column) => {
      const param = `${column.alias}.${column.name}`;
      const paramRegex = new RegExp(`,?\\s*${param}\\s*,?`);

      setSelectedParameters((prev) => {
        const currentSelected = Array.isArray(prev[activeField])
          ? prev[activeField]
          : []; // Ensure it's an array
        const isSelected = currentSelected.some(
          (p) => p.alias === column.alias && p.name === column.name
        );

        if (isSelected) {
          return {
            ...prev,
            [activeField]: currentSelected.filter(
              (p) => !(p.alias === column.alias && p.name === column.name)
            ),
          };
        } else {
          return {
            ...prev,
            [activeField]: [...currentSelected, column],
          };
        }
      });

      setQueryClauses((prev) => {
        const current = prev[activeField] || "";
        const currentSelected = Array.isArray(prev[activeField])
          ? prev[activeField]
          : []; // Ensure it's an array
        const isSelected = currentSelected.some(
          // Use prev to avoid stale closure
          (p) => p.alias === column.alias && p.name === column.name
        );
        if (isSelected) {
          return {
            ...prev,
            [activeField]: prev[activeField].replace(paramRegex, "").trim(),
          };
        } else {
          const updated = current ? `${current}, ${param}` : param;
          return { ...prev, [activeField]: updated };
        }
      });
    },
    [activeField]
  ); // Remove selectedParameters dep to prevent re-creation; use prev in setter
  const initial = {
    Name: "",
    Description: "",
    MenuId: "",
    SubMenuId: "",
    Query: "",
  };
const fetchAvailableTables = async () => {
  try {
    setLoading(true); // Start loader

    const payload = {
      DocEntry: 30,
      oParameters: [],
    };

    const response = await apiClient.post("/DynamicReports/GetReportData", payload);

    if (response.data?.success) {
      const tables = (response.data.values || []).map((item) => ({
        name: item.Name,
        description: item.Description || "",
      }));
      setAvailableTables(tables);
    } else {
      console.error("API response not successful:", response.data?.message);
      Swal.fire({
        title: "Warning!",
        text: response.data?.message || "Failed to fetch available tables.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      setAvailableTables([]); // Optional: clear previous data
    }
  } catch (error) {
    console.error("Error fetching tables:", error);
    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while fetching available tables.",
      icon: "error",
      confirmButtonText: "OK",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};

  // Fix the syntax error in validateAllParams
  const validateAllParams = (rows) => {
    for (const row of rows) {
      const value = typeof row.Value === "object" ? row.Value?.name : row.Value;

      if (!value) {
        return `${row.Name}: Value is required`;
      }

      if (!isValidByType(value, row.Type)) {
        return `${row.Name}: Invalid ${row.Type} value`;
      }
    }
    return null;
  };


  // Ensure fetchTableColumns passes only the tableName string as Value
const fetchTableColumns = async (tableName) => {
  try {
    setLoading(true); // Start loader

    const payload = {
      DocEntry: 33,
      oParameters: [
        {
          Name: "TableName",
          Value: String(tableName), // ensure it's always a string
        },
      ],
    };

    const response = await apiClient.post("/DynamicReports/GetReportData", payload);

    if (response.data?.success) {
      return (response.data.values || []).map((item) => ({
        name: item.Name,
        description: item.Description || "",
      }));
    } else {
      console.warn("API returned success: false", response.data?.message);
      Swal.fire({
        title: "Warning!",
        text: response.data?.message || `Failed to fetch columns for ${tableName}`,
        icon: "warning",
        confirmButtonText: "OK",
      });
      return [];
    }
  } catch (error) {
    console.error("Error fetching columns:", error);
    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        `Something went wrong while fetching columns for ${tableName}`,
      icon: "error",
      confirmButtonText: "OK",
    });
    return [];
  } finally {
    setLoading(false); // Stop loader
  }
};


  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Function to handle table selection
  const handleTableSelection = useCallback((tableName) => {
    setSelectedTables((prev) => {
      const isSelected = prev.some((t) => t.name === tableName);
      if (isSelected) {
        const newSelected = prev.filter((t) => t.name !== tableName);
        setQueryClauses((prevClauses) => ({
          ...prevClauses,
          from: newSelected.map((t) => `${t.name} ${t.alias}`).join(", "),
        }));
        return newSelected;
      } else {
        const alias = `T${prev.length + 1}`;
        const newSelected = [...prev, { name: tableName, alias }];
        setQueryClauses((prevClauses) => ({
          ...prevClauses,
          from: newSelected.map((t) => `${t.name} ${t.alias}`).join(", "),
        }));
        return newSelected;
      }
    });
  }, []);

  // const generateQuery = () => {
  //   const {
  //     select,
  //     from,
  //     where: originalWhere,
  //     orderBy,
  //     groupBy,
  //   } = queryClauses;
  //   let where = originalWhere;
  //   // For WHERE, replace selected column names with column=@param
  //   selectedParameters.where.forEach((p) => {
  //     const col = `${p.alias}.${p.name}`;
  //     const param = `${col}=@${p.name}`;
  //     // Use word boundary to avoid partial matches
  //     where = where.replace(new RegExp(`\\b${col}\\b`, "g"), param);
  //   });
  //   let query = `SELECT ${select || "*"} FROM ${
  //     from || selectedTables.join(", ")
  //   }`;
  //   if (where) query += ` WHERE ${where}`;
  //   if (groupBy) query += ` GROUP BY ${groupBy}`;
  //   if (orderBy) query += ` ORDER BY ${orderBy}`;
  //   return query;
  // };

  // Function to apply generated query to the form
  const generatedQuery = useCallback(() => {
    const select =
      selectedParameters.select.map((p) => `${p.alias}.${p.name}`).join(", ") ||
      "*";

    const from = selectedTables.map((t) => `${t.name} ${t.alias}`).join(", ");

    const where = selectedParameters.where
      .map((p) => `${p.alias}.${p.name} = @${p.name}`)
      .join(" AND ");

    const groupBy = selectedParameters.groupBy
      .map((p) => `${p.alias}.${p.name}`)
      .join(", ");

    const orderBy = selectedParameters.orderBy
      .map((p) => `${p.alias}.${p.name}`)
      .join(", ");

    let q = `SELECT ${select} FROM ${from}`;
    if (where) q += ` WHERE ${where}`;
    if (groupBy) q += ` GROUP BY ${groupBy}`;
    if (orderBy) q += ` ORDER BY ${orderBy}`;

    return q;
  }, [selectedParameters, selectedTables]);

  const applyGeneratedQuery = () => {
    const query = generatedQuery();
    // Assuming you have access to setValue from react-hook-form
    setValue("Query", query);
    setBuildQueryModalOpen(false);
    Swal.fire({
      title: "Query Applied!",
      text: "The generated query has been set in the Query field.",
      icon: "success",
      timer: 1500,
    });
  };
  // New function to clear only modal/query builder data
  const clearModalData = useCallback(() => {
    setSelectedTables([]);
    setTableColumns([]);
    setSelectedParameters({
      select: [],
      where: [],
      groupBy: [],
      orderBy: [],
    });
    setQueryClauses({
      select: "",
      from: "",
      where: "",
      orderBy: "",
      groupBy: "",
    });
    setTableSearch("");
    setParamSearch("");
    setActiveField("select");
  }, []);
  // ===============Main list handlesearch====================================
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
 const fetchOpenListData = async (pageNum, searchTerm = "") => {
  try {
    setLoading(true); // Start loader

    const url = searchTerm
      ? `/DynamicReports?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
      : `/DynamicReports?Status=1&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    if (response.data?.success) {
      const newData = response.data.values || [];
      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      console.warn("API returned success: false", response.data?.message);
      Swal.fire({
        title: "Warning!",
        text: response.data?.message || "Failed to fetch Dynamic Reports.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      setOpenListData([]); // optional: clear previous data
    }
  } catch (error) {
    console.error("Error fetching Dynamic Reports:", error);
    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while fetching Dynamic Reports.",
      icon: "error",
      confirmButtonText: "OK",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
    fetchAvailableTables();
    GetMenuData();
  }, []);
  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData(null);
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
const GetMenuData = async () => {
  try {
    setLoading(true); // Start loader

    const res = await apiClient.get(`/Menu/all`);
    const data = res.data?.values || [];

    const filteredData = data.filter((item) => item.DocEntry !== "1");

    setMenuData(filteredData);
  } catch (error) {
    console.error("Error fetching Menu:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch Menu. Please try again later.",
      icon: "error",
      confirmButtonText: "OK",
    });
    setMenuData([]); // Optional: clear previous data
  } finally {
    setLoading(false); // Stop loader
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

    // Open drawer and reset form with fetched data
    toggleDrawer();
    reset(data);

    // Map oLines to paramRows with proper formatting
    const rows = (data.oLines || []).map((line) => ({
      ...line,
      LineNum: line.LineNum,
      id: line.Name,
      IsOptional: Boolean(line.IsOptional),
      Value: line.Value ? line.Value.replace(/\r?\n/g, " ") : "",
      Description: line.Description ? line.Description.replace(/\r?\n/g, " ") : "",
      Type: line.Type
        ? TYPE_OPTIONS.find((t) => t.sql === line.Type)?.ui || "String"
        : "String",
      SqlType: line.Type || "nvarchar",
    }));

    setParamRows(rows);
    console.log("param row", rows);

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
    getValues,
    setValue,
    // formState: { errors },
  } = useForm({
    mode: "onSubmit", // or "onSubmit"
  });
  const queryValue = watch("Query");
  const selectedMenuId = useWatch({
    control,
    name: "MenuId",
  });
  useEffect(() => {
    if (!selectedMenuId || !MenuData.length) {
      setSubMenuData([]);
      return;
    }

    const selectedMenu = MenuData.find(
      (m) => String(m.DocEntry) === String(selectedMenuId)
    );

    // Set MenuName automatically (even for edit / setValue)
    setValue("MenuName", selectedMenu?.Name || "");

    const subMenuOptions =
      selectedMenu?.oLines?.map((line) => ({
        key: line.LineNum,
        value: line.TileName,
      })) || [];

    setSubMenuData(subMenuOptions);
  }, [selectedMenuId, MenuData]);
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
// ... (rest of your imports and component code)

const onExecuteClick = () => {
  handleSubmit((data) => {
    // If form is valid, proceed with execution (test mode)
    handleSubmitForm(data, true);
  })();
};

// ... (rest of your component code)

 const handleSubmitForm = async (data, isTestMode = false) => {
  const obj = {
    DocEntry: data.DocEntry || 0,
    UserId: user.UserId,
    CreatedBy: user.UserName || "",
    CreatedDate: dayjs().format("YYYY-MM-DD"),
    ModifiedBy: user.UserName || "",
    ModifiedDate: dayjs().format("YYYY-MM-DD"),
    Name: String(data.Name || ""),
    Description: String(data.Description || ""),
    Query: String(data.Query || "")
      .replace(/\r?\n|\r/g, " ") // remove new lines
      .replace(/\s+/g, " ") // clean extra spaces
      .trim(),
    NoOfParam: String(paramRows?.length ?? 0),
    IsTestMode: isTestMode,
    MenuId: data.MenuId,
    SubMenuId: data.SubMenuId,
    MenuName: data.MenuName,
    SubMenuName: data.SubMenuName,
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
      Value: String(row.Value || null),
      Description: String(row.Description || ""),
      IsOptional: Boolean(row.IsOptional),
    })),
  };

  try {
    // Validate Query Syntax
    const validation = validateSelectQuery(data.Query);
    if (!validation.valid) {
      Swal.fire({
        title: "Invalid Query",
        text: validation.message,
        icon: "error",
      });
      return;
    }

    // Validate Parameters
    const paramError = validateAllParams(paramRows);
    if (paramError) {
      Swal.fire({
        title: "Validation Error!",
        text: paramError,
        icon: "warning",
      });
      return;
    }

    setLoading(true); // Start loader

    // 🔹 SAVE
    if (SaveUpdateName === "SAVE") {
      const resp = await apiClient.post(`/DynamicReports`, obj);
      if (resp.data.success) {
        setOpenListPage(0);
        setOpenListData([]);
        await fetchOpenListData(0);
        Swal.fire({
          title: "Success!",
          text: isTestMode ? "Query Executed Successfully" : "Query Saved Successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: resp?.data?.message || "Query is not Added",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
      return; // stop after SAVE
    }

    // 🔹 TEST MODE EXECUTION (always call API)
    if (isTestMode) {
      const resp = await apiClient.post("/DynamicReports", obj);
      if (resp.data.success) {
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
      return; // stop here
    }

    // 🔹 UPDATE
    const result = await Swal.fire({
      text: `Do You Want to Update "${data.Name}"?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (result.isConfirmed) {
      const response = await apiClient.put(`/DynamicReports/${data.DocEntry}`, obj);
      if (response.data.success) {
        setOpenListPage(0);
        setOpenListData([]);
        await fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "Query Updated Successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message || "Update failed",
          icon: "warning",
          confirmButtonText: "Ok",
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
  } catch (error) {
    console.error("Error submitting form:", error);

    let errorMessage = "Something went wrong";

    if (error.response?.data) {
      const data = error.response.data;
      if (data.errors) {
        errorMessage = Object.values(data.errors).flat().join("\n");
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.title) {
        errorMessage = data.title;
      }
    }

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};


  // ===============Delete API ===================================

const handleOnDelete = async (data) => {
  try {
    const result = await Swal.fire({
      text: "Do You Want to Delete?",
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Query Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true); // Start loader

    const response = await apiClient.delete(`/DynamicReports/${data.DocEntry}`);
    const { success, message } = response.data;

    if (success) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      await fetchOpenListData(0);

      Swal.fire({
        text: "Query Deleted Successfully",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      Swal.fire({
        text: message || "Query not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error deleting Query:", error);

    Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        error.message ||
        "An error occurred while deleting the Query.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loader
  }
};
 
  // useEffect(() => {
  //   if (!queryValue) {
  //     setParamRows([]);
  //     return;
  //   }
  //   const extractParams = (query = "") => {
  //     const matches = query.match(/@\w+_\w+/g) || []; // Updated: Match @alias_name format
  //     return [...new Set(matches.map((p) => p.substring(1)))]; // Remove @, keep alias_name
  //   };

  //   const params = extractParams(queryValue);

  //   setParamRows((prev) => {
  //     const prevMap = new Map(prev.map((r) => [r.Name, r]));

  //     return params.map((param) => {
  //       // Split param into alias and name (e.g., "T1_Name" -> alias: "T1", name: "Name")
  //       const [alias, name] = param.split("_");
  //       const existing = prevMap.get(param);

  //       return {
  //         id: param,
  //         Name: param, // Full param name (e.g., "T1_Name")
  //         Description:
  //           existing?.Description ||
  //           `${alias}.${name} from ${
  //             tableColumns.find((c) => c.alias === alias && c.name === name)
  //               ?.table || "Unknown"
  //           }`,
  //         Value: existing?.Value || "",
  //         Type: existing?.Type || "String",
  //         SqlType: existing?.SqlType || "nvarchar",
  //       };
  //     });
  //   });
  // }, [queryValue, tableColumns]); // Added tableColumns as dependency
  useEffect(() => {
    if (!queryValue) {
      setParamRows([]);
      return;
    }
    const extractParams = (query = "") => {
      const matches = query.match(/@\w+/g) || []; // Match @ followed by word characters (handles both @Name and @alias_Name)
      return [...new Set(matches.map((p) => p.substring(1)))]; // Remove @, keep the param name
    };

    const params = extractParams(queryValue);

    setParamRows((prev) => {
      const prevMap = new Map(prev.map((r) => [r.Name, r]));

      return params.map((param) => {
        // Split param into alias and name (e.g., "T1_Name" -> alias: "T1", name: "Name"; "Name" -> alias: "", name: "Name")
        const parts = param.split("_");
        const alias = parts.length > 1 ? parts[0] : "";
        const name = parts.length > 1 ? parts.slice(1).join("_") : parts[0];
        const existing = prevMap.get(param);

        return {
          id: param,
          Name: param, // Full param name (e.g., "T1_Name" or "Name")
          Description:
            existing?.Description || (alias ? `${alias}.${name} ` : `${name} `), // Handle cases without alias
          Value: existing?.Value || "",
          Type: existing?.Type || "String",
          SqlType: existing?.SqlType || "nvarchar",
        };
      });
    });
  }, [queryValue, tableColumns]);
  const isValidByType = (value, type) => {
    if (value === "") return true;

    switch (type) {
      case "Integer":
        return /^-?\d+$/.test(value);

      case "Decimal":
        return /^-?\d+(\.\d+)?$/.test(value);
      case "Boolean":
        return value === "0" || value === "1";

      case "Date":
        return !isNaN(Date.parse(value));

      default: // String
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
    // Local state for smooth typing/selection
    const [localValue, setLocalValue] = React.useState(value ?? "");

    // Sync when row changes externally
    React.useEffect(() => {
      setLocalValue(value ?? "");
    }, [value]);

    // Commit value only when user finishes editing (onBlur for most, onChange for date)
    const commitChange = React.useCallback(() => {
      setParamRows((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [field]: localValue } : row
        )
      );
    }, [localValue, rowId, field, setParamRows]);

    /* =======================
     DATETIME (Updated to use TextField with type="date")
  ======================= */
    if (rowType === "Date") {
      return (
        <SelectedDatePickerField
          value={localValue ? dayjs(localValue) : null} // Ensure it's a dayjs object
          disabled={disabled}
          onChange={(date) => {
            const val = date ? dayjs(date).format("YYYY-MM-DD") : "";
            setLocalValue(val);
            commitChange(); // Commit immediately on change
            // Optional: Uncomment for debugging
            // console.log("Date selected:", val);
          }}
          onBlur={commitChange} // Fallback: Commit on blur if onChange misses
        />
      );
    }

    /* =======================
     BOOLEAN
  ======================= */
    if (rowType === "Boolean") {
      return (
        <TextField
          select
          size="small"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={commitChange}
          onKeyDown={(e) => e.stopPropagation()}
          disabled={disabled}
          fullWidth
          SelectProps={{ native: true }}
        >
          <option value=""></option>
          <option value="1">True</option>
          <option value="0">False</option>
        </TextField>
      );
    }

    /* =======================
     NUMBER
  ======================= */
    if (sqlType === "int" || sqlType === "decimal") {
      return (
        <TextField
          size="small"
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={commitChange}
          onKeyDown={(e) => e.stopPropagation()}
          disabled={disabled}
          fullWidth
          inputProps={{ step: sqlType === "decimal" ? "any" : 1 }}
        />
      );
    }

    /* =======================
     STRING (Description)
  ======================= */
    const showTooltip = field === "Description" && localValue;

    return (
      <Tooltip
        title={showTooltip ? localValue : ""}
        arrow
        placement="top"
        disableHoverListener={!showTooltip}
      >
        <TextField
          size="small"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={commitChange} // Commit only once
          onKeyDown={(e) => e.stopPropagation()}
          disabled={disabled}
          fullWidth
        />
      </Tooltip>
    );
  });

  const TYPE_OPTIONS = [
    { ui: "String", sql: "nvarchar" },
    { ui: "Integer", sql: "int" },
    { ui: "Decimal", sql: "decimal" },
    { ui: "Boolean", sql: "bit" },
    { ui: "Date", sql: "datetime" },
  ];
  const getSqlTypeFromUI = (uiType) =>
    TYPE_OPTIONS.find((t) => t.ui === uiType)?.sql || "nvarchar";

  const TypeDropdown = React.memo(function TypeDropdown({
    value,
    rowId,
    setParamRows,
  }) {
    return (
      <TextField
        select
        size="small"
        fullWidth
        value={value || "String"}
        onChange={(e) => {
          const uiType = e.target.value;
          const sqlType = getSqlTypeFromUI(uiType);

          setParamRows((prev) =>
            prev.map((row) =>
              row.id === rowId
                ? {
                    ...row,
                    Type: uiType,
                    SqlType: sqlType,
                    Value: "", // reset value when type changes
                  }
                : row
            )
          );
        }}
      >
        {TYPE_OPTIONS.map((opt) => (
          <MenuItem key={opt.ui} value={opt.ui}>
            {opt.ui}
          </MenuItem>
        ))}
      </TextField>
    );
  });

  const columns = useMemo(
    () => [
      {
        field: "Description",
        headerName: "Description",
        width: 300,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <EditableCell
            value={params.value}
            rowId={params.id}
            field="Description"
            setParamRows={setParamRows}
          />
        ),
      },
      {
        field: "Type",
        headerName: "Type",
        width: 150,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <TypeDropdown
            value={params.value}
            rowId={params.id}
            setParamRows={setParamRows}
          />
        ),
      },
      {
        field: "Name",
        headerName: "Parameter",
        width: 300,
        align: "center",
        headerAlign: "center",
      },
{
      field: "IsOptional",
      headerName: "Is Optional",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Checkbox
          checked={Boolean(params.row.IsOptional)}
          onChange={(e) => {
            const checked = e.target.checked;

            setParamRows((prev) =>
              prev.map((row) =>
                row.id === params.id
                  ? { ...row, IsOptional: checked }
                  : row
              )
            );
          }}
        />
      ),
    },

      {
        field: "Value",
        headerName: "Sample Value",
        width: 250,
        renderCell: (params) => (
          <EditableCell
            value={params.value}
            rowId={params.id}
            field="Value"
            rowType={params.row.Type} // String | Integer | Decimal | Boolean | DateTime
            sqlType={params.row.SqlType} // nvarchar | int | decimal | bit | datetime
            setParamRows={setParamRows}
          />
        ),
      },
    ],
    [setParamRows]
  );

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
          Query Generator
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
                  title={item.Name}
                  subtitle={item.Description}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
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

      <Dialog
        open={buildQueryModalOpen}
        onClose={() => setBuildQueryModalOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            background:
              theme.palette.mode === "light"
                ? "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)"
                : "linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background:
              theme.palette.mode === "light"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "linear-gradient(135deg, #333 0%, #555 100%)",
            color: "white",
            textAlign: "center",
            py: 2,
            position: "relative",
          }}
        >
          <IconButton
            onClick={() => setBuildQueryModalOpen(false)}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.2)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <BuildCircleOutlined sx={{ mr: 2, fontSize: "2rem" }} />
            <Typography variant="h4" fontWeight="bold">
              Query Builder
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, maxHeight: "80vh", overflow: "auto" }}>
          <Grid container sx={{ minHeight: "60vh" }}>
            {/* Section 1: Table Selection */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                p: 0,
                backgroundColor:
                  theme.palette.mode === "light" ? "#f8f9fa" : "#121212",
              }}
            >
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  background:
                    theme.palette.mode === "light"
                      ? "linear-gradient(145deg, #ffffff 0%, #e9ecef 100%)"
                      : "linear-gradient(145deg, #333 0%, #555 100%)",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                      <TableChartIcon />
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={theme.palette.primary.main}
                    >
                      Select Tables
                    </Typography>
                  </Box>
                  <TextField
                    label="Search Tables"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: tableSearch ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setTableSearch("")}
                            edge="end"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                  <Divider sx={{ mb: 2 }} />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          filteredTables.length > 0 &&
                          filteredTables.every((param) =>
                            (selectedTables[activeField] || []).some(
                              (p) =>
                                p.alias === param.alias && p.name === param.name
                            )
                          )
                        }
                        indeterminate={
                          filteredTables.length > 0 &&
                          filteredTables.some((param) =>
                            (selectedTables[activeField] || []).some(
                              (p) =>
                                p.alias === param.alias && p.name === param.name
                            )
                          ) &&
                          !filteredTables.every((param) =>
                            (selectedTables[activeField] || []).some(
                              (p) =>
                                p.alias === param.alias && p.name === param.name
                            )
                          )
                        }
                        onChange={(e) =>
                          handleSelectAllTables(e.target.checked)
                        }
                        sx={{
                          color: theme.palette.secondary.main,
                          "&.Mui-checked": {
                            color: theme.palette.secondary.main,
                          },
                        }}
                      />
                    }
                    label="Select All"
                    sx={{ mb: 1 }}
                  />
                  <List sx={{ maxHeight: "400px", overflow: "auto" }}>
                    {filteredTables.map((table, index) => (
                      <ListItem key={table.name} sx={{ px: 0, py: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedTables.some(
                                (t) => t.name === table.name
                              )}
                              onChange={() => handleTableSelection(table.name)}
                              sx={{
                                color: theme.palette.primary.main,
                                "&.Mui-checked": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {table.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {table.description}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Section 2: Parameters List */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                p: 0,
                backgroundColor:
                  theme.palette.mode === "light" ? "#ffffff" : "#1e1e1e",
              }}
            >
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  background:
                    theme.palette.mode === "light"
                      ? "linear-gradient(145deg, #ffffff 0%, #f1f3f4 100%)"
                      : "linear-gradient(145deg, #424242 0%, #616161 100%)",
                  transition: "transform 0.2s",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar
                      sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}
                    >
                      <ListAltIcon />
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={theme.palette.secondary.main}
                    >
                      Parameters
                    </Typography>
                  </Box>
                  <TextField
                    label="Search Parameters"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={paramSearch}
                    onChange={(e) => setParamSearch(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: paramSearch ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setParamSearch("")}
                            edge="end"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                  <Divider sx={{ mb: 2 }} />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          (selectedParameters[activeField] || []).length ===
                            filteredParams.length && filteredParams.length > 0
                        }
                        indeterminate={
                          (selectedParameters[activeField] || []).length > 0 &&
                          (selectedParameters[activeField] || []).length <
                            filteredParams.length
                        }
                        onChange={(e) =>
                          handleSelectAllParams(e.target.checked)
                        }
                        sx={{
                          color: theme.palette.secondary.main,
                          "&.Mui-checked": {
                            color: theme.palette.secondary.main,
                          },
                        }}
                      />
                    }
                    label="Select All"
                    sx={{ mb: 1 }}
                  />
                  <List sx={{ maxHeight: "400px", overflow: "auto" }}>
                    {filteredParams.length > 0 ? (
                      filteredParams.map((column, index) => (
                        <ListItem
                          key={`${column.alias}-${column.name}`}
                          sx={{ px: 0, py: 1.5 }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={(
                                  selectedParameters[activeField] || []
                                ).some(
                                  (p) =>
                                    p.alias === column.alias &&
                                    p.name === column.name
                                )}
                                onChange={() =>
                                  handleParameterSelection(column)
                                }
                                sx={{
                                  color: theme.palette.secondary.main,
                                  "&.Mui-checked": {
                                    color: theme.palette.secondary.main,
                                  },
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {`${column.alias}.${column.name}`}{" "}
                                  {/* Updated: Shows alias.name */}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {column.description} (from {column.table}){" "}
                                  {/* Updated: Adds table name for clarity */}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          mt: 4,
                          backgroundColor: theme.palette.background.paper,
                        }}
                      >
                        <TableChartIcon
                          sx={{
                            fontSize: "3rem",
                            color: theme.palette.text.disabled,
                            mb: 2,
                          }}
                        />
                        <Typography variant="body1" color="text.secondary">
                          No parameters available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Select tables to view their parameters
                        </Typography>
                      </Box>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Section 3: Query Clauses */}
            <Grid item xs={12} md={6} sx={{ p: 0 }}>
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  background:
                    theme.palette.mode === "light"
                      ? "linear-gradient(145deg, #ffffff 0%, #e3f2fd 100%)"
                      : "linear-gradient(145deg, #263238 0%, #37474f 100%)",
                  transition: "transform 0.2s",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                      <EditIcon />
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={theme.palette.warning.main}
                    >
                      Query Clauses
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {[
                      {
                        label: "SELECT",
                        placeholder: "e.g., u.UserID, u.UserName",
                        key: "select",
                        multiline: true,
                        rows: 2,
                      },
                      {
                        label: "FROM",
                        placeholder: "e.g., Users AS u",
                        key: "from",
                        disabled: false,
                      },
                      {
                        label: "WHERE",
                        placeholder: "e.g., u.UserID > 100",
                        key: "where",
                        multiline: true,
                        rows: 2,
                      },
                      {
                        label: "GROUP BY",
                        placeholder: "e.g., u.UserID",
                        key: "groupBy",
                        multiline: true,
                        rows: 2,
                      },
                      {
                        label: "ORDER BY",
                        placeholder: "e.g., u.UserName ASC",
                        key: "orderBy",
                        multiline: true,
                        rows: 2,
                      },
                    ].map((field) => (
                      <TextField
                        key={field.key}
                        label={field.label}
                        placeholder={field.placeholder}
                        value={queryClauses[field.key]}
                        onChange={(e) =>
                          setQueryClauses({
                            ...queryClauses,
                            [field.key]: e.target.value,
                          })
                        }
                        onFocus={() => {
                          setActiveField(field.key);
                          // Parse the current clause to update selectedParameters
                          const clause = queryClauses[field.key] || "";
                          let selected = [];
                          if (field.key === "where") {
                            // For where, look for alias.name patterns
                            const parts = clause
                              .split(",")
                              .map((s) => s.trim());
                            selected = parts
                              .map((part) => {
                                const [alias, name] = part.split(".");
                                return tableColumns.find(
                                  (c) => c.alias === alias && c.name === name
                                );
                              })
                              .filter(Boolean);
                          } else {
                            // For select, groupBy, orderBy
                            const parts = clause
                              .split(",")
                              .map((s) => s.trim());
                            selected = parts
                              .map((part) => {
                                const [alias, name] = part.split(".");
                                return tableColumns.find(
                                  (c) => c.alias === alias && c.name === name
                                );
                              })
                              .filter(Boolean);
                          }
                          setSelectedParameters((prev) => ({
                            ...prev,
                            [field.key]: selected,
                          }));
                        }}
                        fullWidth
                        size="small"
                        variant="outlined"
                        multiline={field.multiline}
                        rows={field.rows}
                        disabled={field.disabled}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "&:hover fieldset": {
                              borderColor: theme.palette.warning.main,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: theme.palette.warning.main,
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            justifyContent: "space-between",
            backgroundColor: theme.palette.background.default,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            onClick={clearModalData}
            variant="outlined"
            color="secondary"
            sx={{
              borderRadius: "8px",
              px: 3,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Clear
          </Button>
          <Button
            onClick={applyGeneratedQuery}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "8px",
              px: 3,
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "linear-gradient(135deg, #333 0%, #555 100%)",
              "&:hover": {
                background:
                  theme.palette.mode === "light"
                    ? "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)"
                    : "linear-gradient(135deg, #424242 0%, #666 100%)",
              },
            }}
          >
            Apply Query
          </Button>
        </DialogActions>
      </Dialog>

      {/* <Spinner open={loading} /> */}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit((data) => handleSubmitForm(data, false))}
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
          {/* Hamburger Menu */}
          <Grid
            item
            width="100%"
            py={0.5}
            border="1px solid silver"
            borderBottom="none"
            position="relative"
            sx={{
              backgroundColor:
                theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
            }}
          >
            {/* Hamburger */}
            <IconButton
              onClick={toggleDrawer}
              sx={{
                display: { lg: "none" },
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Add */}
            <IconButton
              onClick={clearFormData}
              sx={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <AddIcon />
            </IconButton>

            <Typography textAlign="center">Query Generator</Typography>
          </Grid>

          <Grid
            container
            item
            width="100%"
            height="100%"
            sx={(theme) => ({
              borderRadius: "0 0 8px 8px",

              border:
                theme.palette.mode === "light"
                  ? "1px solid #e0e0e0"
                  : "1px solid rgba(255,255,255,0.12)",

              backgroundColor:
                theme.palette.mode === "light" ? "#fafafa" : "#080D2B",
            })}
          >
            <Grid
              container
              item
              padding={2}
              height="calc(100% - 40px)"
              overflow="auto"
            >
              <Box width="100%">
                {/* Query Details */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  {/* <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 500, textAlign: "center" }}
                  >
                    Query Details
                  </Typography> */}

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Controller
                        name="Name"
                        control={control}
                        rules={{ required: "Query Name is required" }}
                        render={({ field, fieldState }) => (
                          <Tooltip
                            title={field.value || "Enter Query Name"}
                            arrow
                            placement="top"
                          >
                            <TextField
                              {...field}
                              label="QUERY NAME"
                              fullWidth
                              size="small"
                              InputLabelProps={{ shrink: true }}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                            />
                          </Tooltip>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Controller
                        name="Description"
                        control={control}
                        render={({ field }) => (
                          <Tooltip
                            title={field.value || "Enter Description"}
                            arrow
                            placement="top"
                          >
                            <TextField
                              {...field}
                              label="DESCRIPTION"
                              fullWidth
                              size="small"
                              InputLabelProps={{ shrink: true }}
                            />
                          </Tooltip>
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={3}
                      lg={3}
                      textAlign="center"
                      mt={-1}
                    >
                      <Controller
                        name="MenuId"
                        control={control}
                        rules={{ required: "Menu is required" }}
                        defaultValue=""
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            label="MENU"
                            {...field}
                            error={!!error}
                            inputProps={{ maxLength: 50 }}
                            // disabled={SaveUpdateName === "UPDATE"}
                            helperText={error ? error.message : null}
                            data={MenuData.map((item) => ({
                              key: item.DocEntry,
                              value: item.Name,
                            }))}
                            // onChange={(event) => {
                            //   const selectedValue = event.target.value; // get the actual value
                            //   field.onChange(selectedValue); // update RHF state
                            //   const selectedMenu = MenuData.find(
                            //     (m) =>
                            //       String(m.DocEntry) === String(selectedValue)
                            //   );

                            //   setValue("MenuName", selectedMenu?.Name || "");

                            //   const subMenuOptions =
                            //     selectedMenu?.oLines?.map((line) => ({
                            //       key: line.LineNum,
                            //       value: line.TileName,
                            //     })) || [];

                            //   setSubMenuData(subMenuOptions);

                            //   // Reset SubMenu field
                            //   setValue("SubMenuId", "", {
                            //     shouldValidate: true,
                            //   });
                            // }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={3}
                      lg={3}
                      textAlign="center"
                      mt={-1}
                    >
                      <Controller
                        name="SubMenuId"
                        control={control}
                        rules={{ required: "Sub Menu is required" }}
                        defaultValue=""
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            label="SUB MENU"
                            {...field}
                            error={!!error}
                            inputProps={{ maxLength: 50 }}
                            // disabled={SaveUpdateName === "UPDATE"}
                            helperText={error ? error.message : null}
                            data={subMenuData} // ✅ dynamic based on selected Menu
                            onChange={(event) => {
                              const selectedValue = event.target.value; // LineNum
                              field.onChange(selectedValue);

                              const selectedSubMenu = subMenuData.find(
                                (s) => String(s.key) === String(selectedValue)
                              );

                              // 🔥 Set SubMenuName in form
                              setValue(
                                "SubMenuName",
                                selectedSubMenu?.value || ""
                              );
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        variant="contained"
                        // startIcon={<BuildIcon />}
                        onClick={() => setBuildQueryModalOpen(true)}
                      >
                        Build Query
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="Query"
                        control={control}
                        rules={{ required: "Query cannot be empty" }}
                        render={({ field, fieldState }) => (
                          <Card
                            sx={(theme) => ({
                              p: 2,
                              boxShadow:
                                theme.palette.mode === "light"
                                  ? "0 2px 8px rgba(0,0,0,0.1)"
                                  : "0 2px 8px rgba(0,0,0,0.6)",
                              borderRadius: "12px",

                              backgroundColor:
                                theme.palette.mode === "light"
                                  ? "#f8f9fa"
                                  : "#080D2B",

                              border: fieldState.error
                                ? "1px solid #d32f2f"
                                : theme.palette.mode === "light"
                                ? "1px solid #e9ecef"
                                : "1px solid rgba(255,255,255,0.12)",
                            })}
                          >
                            {/* Header */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Box sx={{ mr: 2, color: "#1976d2" }}>
                                <CodeIcon />
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontWeight: 500 }}
                              >
                                Query
                              </Typography>
                            </Box>

                            {/* Editable Query Area */}
                            <InputBase
                              {...field}
                              multiline
                              minRows={6}
                              maxRows={8}
                              placeholder="Enter your SQL query here..."
                              sx={{
                                width: "100%",
                                fontFamily: "monospace",
                                fontSize: "0.875rem",
                                color:
                                  theme.palette.mode === "light"
                                    ? "#333"
                                    : "#f5f6fa",
                                whiteSpace: "pre-wrap",
                                backgroundColor:
                                  theme.palette.mode === "light"
                                    ? "#f5f6fa"
                                    : "#080D2B",

                                p: 1,
                                borderRadius: "4px",
                                border: "1px solid #ddd",

                                "&:focus-within": {
                                  borderColor: "#1976d2",
                                },
                              }}
                            />

                            {/* Error Message */}
                            {fieldState.error && (
                              <Typography
                                variant="caption"
                                color="error"
                                sx={{ mt: 0.5, display: "block" }}
                              >
                                {fieldState.error.message}
                              </Typography>
                            )}
                          </Card>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Parameters */}
                <Paper sx={{ p: 3 }}>
                  {/* <Typography variant="h6" sx={{ mb: 2 }}>
                    Parameters
                  </Typography> */}

                  <DataGrid
                    className="datagrid-style"
                      key={paramRows.length}

                    rows={paramRows}
                    columns={columns}
                    getRowId={(row) => row.id || row.LineNum}
                    hideFooter
                    autoHeight={paramRows.length <= 5}
                    rowHeight={60}
                    sx={{
                      height: paramRows.length > 5 ? "40vh" : "auto",
                      backgroundColor:
                        theme.palette.mode === "light" ? "#fff" : "#515151",

                      "& .MuiDataGrid-virtualScroller": {
                        overflowY: "auto",
                      },

                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f5f5f5",
                        fontWeight: "bold",
                      },
                      "& .MuiDataGrid-row": {
                        alignItems: "center",
                      },

                      "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  />
                </Paper>
              </Box>
            </Grid>

            {/* Footer */}
            <Grid
              item
              xs={12}
              px={2}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                bottom: 0,
                background: theme.palette.mode === "light" ? "#fff" : "#080D2B",

                // py: 2,
                borderTop: "1px solid #e0e0e0",
                boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={
                    (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                    (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                  }
                  type="submit"
                >
                  {SaveUpdateName}
                </Button>

                <Button
                  variant="contained"
                  // startIcon={<PlayArrowIcon />}
                  onClick={onExecuteClick}
                  // disabled={}
                >
                  Execute
                </Button>
              </Box>

              <Button
                variant="contained"
                color="error"
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                onClick={handleOnDelete}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
