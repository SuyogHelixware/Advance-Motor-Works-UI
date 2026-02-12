import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Paper,
  TextField,
  Typography,
  useTheme,
  Select,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  GridToolbar,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponent from "../Components/CardComponent";
import {
  InputFields,
  InputSearchableSelect,
  InputSelectTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
// import DeleteIcon from "@mui/icons-material/Delete";
// import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
// import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const initial = {
  RoleId: "",
  RoleName: "",
  DocEntry: "",
  RoleNameList: [],
  oLines: [],
  SaveUpdateName: "SAVE",
};

export default function RoleMaster() {
  const theme = useTheme();
  const { user } = useAuth();
  // getPermissionsByMenuId(MenuID)
  const perms = usePermissions(12);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [CardNameValue, setCardNameValue] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const [selectedRole, setSelectedRole] = useState(""); // State to track selected role
  const [MenuList, setMenuList] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState(new Set()); // Tracks selected rows by unique ID
  const [selectedRows, setSelectedRows] = useState([]); // Stores selected row data
  const timeoutRef = useRef(null);

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //====================States for Permission checkbox================================
  const [selectedAddIds, setSelectedAddIds] = useState(new Set());
  const [selectedEditIds, setSelectedEditIds] = useState(new Set());
  const [selectedReadIds, setSelectedReadIds] = useState(new Set());
  const [selectedDeleteIds, setSelectedDeleteIds] = useState(new Set());

  //=====================================role Creation sTate===========================
  const [openRoleCreation, setopenRoleCreation] = useState(false);
  const [selectedRoleCreationRowId, setSelectedRoleCreationRowId] =
    useState(null);

  const [selectedData, setSelectedData] = useState([]);
  // const [loading, setLoading] = useState(false);

  // ----------------- STATE -----------------
  const LIMIT = 20;

  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(LIMIT);
  const [rowCount, setRowCount] = useState(0);
  const [searchRoleText, setRoleSearchText] = useState("");
  const [roleCache, setRoleCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [RoleCreationList, setRoleCreationList] = useState([]);

  // ----------------- FETCH ROLE LIST -----------------
 const fetchRoleList = useCallback(
  async (pageNum = 0, searchTerm = "") => {
    const cacheKey = `${searchTerm}_${pageNum}`;

    // ✅ Check cache first
    if (roleCache[cacheKey]) {
      setRoleCreationList(roleCache[cacheKey]);
      return;
    }

    try {
      setIsLoading(true); // 🔹 Start loader

      // 🔹 Build URL dynamically
      const url = searchTerm
        ? `/Role/Search/${encodeURIComponent(searchTerm)}/1/${pageNum}`
        : `/Role/Pages/1/${pageNum}`;

      const response = await apiClient.get(url);

      if (response.data?.success) {
        const newData = response.data.values || [];

        // 🔹 Save to cache
        setRoleCache((prev) => ({
          ...prev,
          [cacheKey]: newData,
        }));

        // 🔹 Update state
        setRoleCreationList(newData);

        // 🔹 Estimate row count
        const estimatedRowCount =
          pageNum === 0 ? LIMIT + 1 : pageNum * LIMIT + newData.length + 1;
        setRowCount(estimatedRowCount);
      } else {
        const message =
          response.data?.message || "Failed to fetch Role data";
        Swal.fire("Error!", message, "warning");
        console.error("API error:", response.data);
      }
    } catch (error) {
      let errorMessage = "Something went wrong while fetching Role list.";

      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors) {
          errorMessage = Object.values(data.errors).flat().join("\n");
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.title) {
          errorMessage = data.title;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire("Error!", errorMessage, "error");
      console.error("Fetch Role list error:", error);
    } finally {
      setIsLoading(false); // 🔹 Stop loader
    }
  },
  [roleCache]
);


  // ----------------- LOAD WHEN PAGE OR SEARCH CHANGES -----------------
  useEffect(() => {
    fetchRoleList(currentPage, searchRoleText);
  }, [currentPage, searchRoleText, fetchRoleList]);

  // ----------------- PAGINATION HANDLER -----------------
  function CustomQuickSearchToolbar() {
    return (
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <GridToolbarQuickFilter debounceMs={500} />
      </Box>
    );
  }

  const handlePaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage]
  );

  // ----------------- SEARCH HANDLER -----------------
  const handleSearchChange = useCallback((search) => {
    setRoleSearchText(search);
    setCurrentPage(0);
    setRoleCache({});
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 🔍 Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return MenuList;
    return MenuList.filter((row) =>
      Object.values(row)
        .join(" ") // combine all fields
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [searchText, MenuList]);
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
 const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
  try {
    setIsLoading(true); // 🔹 Start loader

    // Build URL dynamically
    const url = searchTerm
      ? `/RoleMapping/Search/${encodeURIComponent(searchTerm)}/1/${pageNum}`
      : `/RoleMapping/Pages/1/${pageNum}`;

    const response = await apiClient.get(url);

    // ✅ API response success
    if (response.data?.success) {
      const newData = response.data.values || [];

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      // 🔹 Handle API success=false
      const message =
        response.data?.message || "Failed to fetch Role Mapping data";
      Swal.fire("Error!", message, "warning");
      console.error("API returned success=false:", response.data);
    }
  } catch (error) {
    // 🔹 Catch network or unexpected errors
    let errorMessage = "Something went wrong while fetching data.";

    if (error.response?.data) {
      const data = error.response.data;
      if (data.errors) {
        errorMessage = Object.values(data.errors).flat().join("\n");
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.title) {
        errorMessage = data.title;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    Swal.fire("Error!", errorMessage, "error");
    console.error("FetchOpenListData error:", error);
  } finally {
    setIsLoading(false); // 🔹 Stop loader
  }
};


  const getRoleName = async () => {
  setIsLoading(true);

  try {
    const response = await apiClient.get(`/Role/All`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { success, values = [], message } = response?.data || {};

    if (!success) {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch role names.",
        icon: "error",
      });
      return;
    }

    setCardNameValue(values);
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch data.";

    console.error("Error fetching role names:", error);

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
    });
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    getRoleName();
    GetMenuList();
    fetchRoleList(0);
    fetchOpenListData(0);
  }, []);

 const handleOnDelete = async () => {
  const result = await Swal.fire({
    text: "Do You Want to Delete?",
    icon: "question",
    showConfirmButton: true,
    showDenyButton: true,
    confirmButtonText: "YES",
    cancelButtonText: "No",
  });

  if (!result.isConfirmed) {
    Swal.fire({
      text: "Role Mapping Not Deleted",
      icon: "info",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  setIsLoading(true);

  try {
    const resp = await apiClient.delete(`/RoleMapping/${DocEntry}`);
    const { success, message } = resp?.data || {};

    if (!success) {
      Swal.fire({
        text: message || "Delete failed",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    // ✅ Common success handling
    clearFormData();
    setOpenListPage(0);
    setOpenListData([]);
    fetchOpenListData(0);

    Swal.fire({
      text: "Role Mapping Deleted",
      icon: "success",
      toast: true,
      showConfirmButton: false,
      timer: 1000,
    });
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete role mapping.";

    console.error("Error deleting role mapping:", error);

    Swal.fire({
      text: errorMessage,
      icon: "error",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
  } finally {
    setIsLoading(false);
  }
};

  const clearFormData = () => {
    reset(initial);
    setDocEntry("");
    setSaveUpdateName("SAVE");
    setSelectedRowIds(new Set());
    setSelectedData([]);
    setSelectedRows([]);

    setMenuList(
      MenuList.map((item) => ({
        ...item,
        isDisabled: false,
      }))
    );
  };
  const ItemColumn = [
    {
      field: "select",
      headerName: "",
      width: 100,
      renderHeader: () => (
        <Checkbox
          checked={
            filteredRows.length > 0 &&
            filteredRows.every((row) => selectedRowIds.has(row.LineNum))
          }
          indeterminate={
            filteredRows.some((row) => selectedRowIds.has(row.LineNum)) &&
            !filteredRows.every((row) => selectedRowIds.has(row.LineNum))
          }
          onChange={(e) => {
            if (e.target.checked) {
              // ✔ Select only searched rows
              const filteredIds = filteredRows.map((row) => row.LineNum);
              setSelectedRowIds((prev) => new Set([...prev, ...filteredIds]));
              setSelectedRows((prev) => [
                ...prev,
                ...filteredRows.filter(
                  (row) => !prev.some((p) => p.LineNum === row.LineNum)
                ),
              ]);
            } else {
              // ❌ Unselect only searched rows
              const filteredIds = filteredRows.map((row) => row.LineNum);
              setSelectedRowIds(
                (prev) =>
                  new Set([...prev].filter((id) => !filteredIds.includes(id)))
              );
              setSelectedRows((prev) =>
                prev.filter((row) => !filteredIds.includes(row.LineNum))
              );
            }
          }}
        />
      ),
      renderCell: (params) => {
        return (
          <Checkbox
            checked={selectedRowIds.has(params.row.LineNum)}
            onChange={() => handleRowSelectionChange(params.row.LineNum)}
          />
        );
      },
    },
    { field: "LineNum", headerName: "Activity Id", width: 100 },
    { field: "TileName", headerName: "Activity Name", width: 200 },
  ];

  const handleClickOpen = () => {
    setOpen(true);

    const existing = getValues("oLines") || [];

    const alreadySelectedIds = new Set(existing.map((row) => row.MenuId));

    setSelectedRowIds(alreadySelectedIds);

    const matchedRows = MenuList.filter((item) =>
      alreadySelectedIds.has(item.LineNum)
    );
    setSelectedRows(matchedRows);
  
  };

  const closeModel = () => {
    setOpen(false);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value); // Set selected tax category based on user input
  };
  const { getValues, setValue, reset, handleSubmit, control, watch } = useForm({
    defaultValues: initial,
  });
  const roleId = watch("RoleId");
  const handleSubmitForm = async (data) => {
    // Get the current form data
    const formRows = getValues("oLines") || [];
 

    if (formRows.length === 0) {
      Swal.fire({
        text: "Please Select Activity !",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    // Process rows: retain existing `LineNum` or assign empty for new rows
    const oLines = formRows.map((row) => ({
      LineNum: String(row.LineNum || ""),
      DocEntry: String(data.DocEntry || ""),
      UserId: sessionStorage.getItem("UserId") || "1",
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Status: "1",
      MenuId: Number(row.MenuId || 0),
      MenuName: String(row.MenuName || row.TileName),
      ParentMenuId: Number(row.ParentMenuId || 0),
      IsAdd: selectedAddIds.has(row.tempKey) ? "True" : "False",
      IsEdit: selectedEditIds.has(row.tempKey) ? "True" : "False",
      IsRead: selectedReadIds.has(row.tempKey) ? "True" : "False",
      IsDelete: selectedDeleteIds.has(row.tempKey) ? "True" : "False",
    }));

    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: sessionStorage.getItem("UserId") || "1",
      CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
      CreatedDate: "",
      ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
      ModifiedDate: "",
      Status: "1",
      RoleId: String(data.RoleId || selectedRole),
      RoleName: String(data.RoleId || ""),
      oLines,
    };

    try {
      setIsLoading(true);
      if (SaveUpdateName === "SAVE") {
        const response = await apiClient.post(`/RoleMapping`, obj);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Role Mapping Added",
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
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.RoleName}"?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/RoleMapping/${data.DocEntry}`,
            obj
          );
          const { success, message } = response.data;
          if (success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: `"${data.RoleName}" Updated`,
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
            text: `"${data.RoleName}"not Updated !`,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      Swal.fire("Error!", error.message || "Failed to fetch data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const setRoleListData = async (DocEntry) => {
  if (!DocEntry) return;


  try {
      setIsLoading(true);

    const response = await apiClient.get(`/RoleMapping/${DocEntry}`);
    const { success, values: data, message } = response?.data || {};

    if (!success || !data) {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch role mapping data.",
        icon: "error",
      });
      return;
    }

    toggleDrawer();

    const lines = data?.oLines || [];

    // ✅ Transform rows safely
    const transformedRows = lines.map((row, index) => ({
      ...row,
      tempKey: row.tempKey || row.LineNum || row.MenuId || `row_${index}`,
      serialNumber: index + 1,
    }));

    // ✅ Permission Sets
    setSelectedAddIds(
      new Set(
        transformedRows
          .filter((r) => r.IsAdd === "True")
          .map((r) => r.tempKey)
      )
    );

    setSelectedEditIds(
      new Set(
        transformedRows
          .filter((r) => r.IsEdit === "True")
          .map((r) => r.tempKey)
      )
    );

    setSelectedReadIds(
      new Set(
        transformedRows
          .filter((r) => r.IsRead === "True")
          .map((r) => r.tempKey)
      )
    );

    setSelectedDeleteIds(
      new Set(
        transformedRows
          .filter((r) => r.IsDelete === "True")
          .map((r) => r.tempKey)
      )
    );

    // ✅ Reset form
    reset({
      ...data,
      RoleId: String(data.RoleId || ""),
      oLines: transformedRows,
    });

    // ✅ Ensure RoleId is set after options render
    setTimeout(() => {
      setValue("RoleId", String(data.RoleId || ""));
    }, 0);

    // ✅ State updates
    setSelectedRole(data.RoleName || "");
    setSelectedRows(transformedRows);
    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);

    // ✅ Disable menus already mapped
    const menuIds = lines.map((line) => line.MenuId);

    setMenuList((prev) =>
      prev.map((item) => ({
        ...item,
        isDisabled: menuIds.includes(item.LineNum),
      }))
    );
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch role mapping data.";

    console.error("Error fetching role mapping:", error);

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
    });
  } finally {
    setIsLoading(false);
  }
};


  const handleCheckboxChange = (rowId, field, checked) => {
    let setter;
    let stateSet;

    switch (field) {
      case "IsAdd":
        setter = setSelectedAddIds;
        stateSet = selectedAddIds;
        break;
      case "IsEdit":
        setter = setSelectedEditIds;
        stateSet = selectedEditIds;
        break;
      case "IsRead":
        setter = setSelectedReadIds;
        stateSet = selectedReadIds;
        break;
      case "IsDelete":
        setter = setSelectedDeleteIds;
        stateSet = selectedDeleteIds;
        break;
      default:
        return;
    }

    const newSet = new Set(stateSet);
    if (checked) {
      newSet.add(rowId);
    } else {
      newSet.delete(rowId);
    }
    setter(newSet);
  };

  const handleHeaderCheckboxChange = (field, checked) => {
    let setter;
    switch (field) {
      case "IsAdd":
        setter = setSelectedAddIds;
        break;
      case "IsEdit":
        setter = setSelectedEditIds;
        break;
      case "IsRead":
        setter = setSelectedReadIds;
        break;
      case "IsDelete":
        setter = setSelectedDeleteIds;
        break;
      default:
        return;
    }

    if (checked) {
      setter(new Set(getValues("oLines").map((row) => row.tempKey)));
    } else {
      setter(new Set());
    }
  };

  const isAllChecked = (field) => {
    const rows = getValues("oLines");
    let selected;
    switch (field) {
      case "IsAdd":
        selected = selectedAddIds;
        break;
      case "IsEdit":
        selected = selectedEditIds;
        break;
      case "IsRead":
        selected = selectedReadIds;
        break;
      case "IsDelete":
        selected = selectedDeleteIds;
        break;
      default:
        return false;
    }
    return rows.length > 0 && rows.every((row) => selected.has(row.tempKey));
  };

  const isIndeterminate = (field) => {
    const rows = getValues("oLines");
    let selected;
    switch (field) {
      case "IsAdd":
        selected = selectedAddIds;
        break;
      case "IsEdit":
        selected = selectedEditIds;
        break;
      case "IsRead":
        selected = selectedReadIds;
        break;
      case "IsDelete":
        selected = selectedDeleteIds;
        break;
      default:
        return false;
    }
    return (
      rows.some((row) => selected.has(row.tempKey)) &&
      !rows.every((row) => selected.has(row.tempKey))
    );
  };

  const columns = [
    {
      field: "serialNumber",
      headerName: "Sr.No",
      width: 80,
      renderCell: (params) => params.row.serialNumber,
    },
    {
      field: "MenuName",
      headerName: "Activity Name",
      width: 200,
    },
    // Add column
    {
      field: "IsAdd",
      headerName: "Add",
      width: 100,
      sortable: false,
      renderHeader: () => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Add</span>
          <Checkbox
            color="success"
            checked={isAllChecked("IsAdd")}
            indeterminate={isIndeterminate("IsAdd")}
            onChange={(e) =>
              handleHeaderCheckboxChange("IsAdd", e.target.checked)
            }
          />
        </div>
      ),
      renderCell: (params) => (
        <Checkbox
          color="success"
          checked={selectedAddIds.has(params.row.tempKey)}
          onChange={(e) =>
            handleCheckboxChange(params.row.tempKey, "IsAdd", e.target.checked)
          }
        />
      ),
    },
    // Edit column
    {
      field: "IsEdit",
      headerName: "Edit",
      width: 100,
      sortable: false,
      renderHeader: () => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Edit</span>
          <Checkbox
            color="info"
            checked={isAllChecked("IsEdit")}
            indeterminate={isIndeterminate("IsEdit")}
            onChange={(e) =>
              handleHeaderCheckboxChange("IsEdit", e.target.checked)
            }
          />
        </div>
      ),
      renderCell: (params) => (
        <Checkbox
          color="info"
          checked={selectedEditIds.has(params.row.tempKey)}
          onChange={(e) =>
            handleCheckboxChange(params.row.tempKey, "IsEdit", e.target.checked)
          }
        />
      ),
    },
    // Read column
    {
      field: "IsRead",
      headerName: "Read",
      width: 100,
      sortable: false,
      renderHeader: () => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Read</span>
          <Checkbox
            color="primary"
            checked={isAllChecked("IsRead")}
            indeterminate={isIndeterminate("IsRead")}
            onChange={(e) =>
              handleHeaderCheckboxChange("IsRead", e.target.checked)
            }
          />
        </div>
      ),
      renderCell: (params) => (
        <Checkbox
          color="primary"
          checked={selectedReadIds.has(params.row.tempKey)}
          onChange={(e) =>
            handleCheckboxChange(params.row.tempKey, "IsRead", e.target.checked)
          }
        />
      ),
    },
    // Delete column
    {
      field: "IsDelete",
      headerName: "Delete",
      width: 100,
      sortable: false,
      renderHeader: () => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Delete</span>
          <Checkbox
            color="error"
            checked={isAllChecked("IsDelete")}
            indeterminate={isIndeterminate("IsDelete")}
            onChange={(e) =>
              handleHeaderCheckboxChange("IsDelete", e.target.checked)
            }
          />
        </div>
      ),
      renderCell: (params) => (
        <Checkbox
          color="error"
          checked={selectedDeleteIds.has(params.row.tempKey)}
          onChange={(e) =>
            handleCheckboxChange(
              params.row.tempKey,
              "IsDelete",
              e.target.checked
            )
          }
        />
      ),
    },
  ];

  const getDisabledRows = () => {
    const oLines = getValues("oLines");
    const disabledLineNums = oLines.map((row) => row.TileName || row.MenuName);
    return disabledLineNums;
  };

  const handleRowSelectionChange = (id) => {
    setSelectedRowIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }

      const updatedRows = MenuList.filter((row) => updated.has(row.LineNum));
      setSelectedRows(updatedRows);

      return updated;
    });
  };

  useEffect(() => {
    const updatedSelectedRows = MenuList.filter((row) =>
      selectedRowIds.has(row.LineNum)
    );
    setSelectedRows(updatedSelectedRows);
  }, [selectedRowIds, MenuList]);

  useEffect(() => {
    const rows = getValues("oLines") || [];

    if (rows.length > 0) {
      // Preselect Add + Read for all rows
      setSelectedAddIds(new Set(rows.map((r) => r.tempKey)));
      setSelectedReadIds(new Set(rows.map((r) => r.tempKey)));
    }
  }, [watch("oLines")]);

  const onSubmit = () => {
    const form = getValues();
    const existingLines = form.oLines || [];

    // NEW selected menuIds
    const selectedIds = new Set(selectedRowIds);

    // Remove unselected rows
    const keptRows = existingLines.filter((line) =>
      selectedIds.has(line.MenuId)
    );

    // Add new rows (not existing)
    const newRows = selectedRows
      .filter(
        (row) => !existingLines.some((line) => line.MenuId === row.LineNum)
      )
      .map((row, idx) => ({
        ...row,
        MenuId: row.LineNum,
        ParentMenuId:row.DocEntry,
        serialNumber: keptRows.length + idx + 1,
        tempKey: `${Date.now()}_${Math.random()}`,
      }));

    const finalRows = [...keptRows, ...newRows];

    setValue("oLines", finalRows);
    reset({ ...form, oLines: finalRows });

    closeModel();
  };


const GetMenuList = async () => {
  setIsLoading(true);

  try {
    const res = await apiClient.get(`/Menu/SubMenu/all`);
    const { success, values = [], message } = res?.data || {};

    if (!success) {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch menu list.",
        icon: "error",
      });
      return;
    }

    setMenuList(values);
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch menu list.";

    console.error("Error fetching menu list:", error);

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
    });
  } finally {
    setIsLoading(false);
  }
};

  const initialRoleCreationData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    RoleName: "",
    Remarks: "",
  };

  const {
    handleSubmit: HandleRoleCreationForm,
    control: ControlRoleCreation,
    reset: resetRoleCreation,
    // getValues: getValues1,
    setValue: setValueRoleCreation,
  } = useForm({
    defaultValues: initialRoleCreationData,
  });
  const HandlePRoleCreationOpen = () => setopenRoleCreation(true);
  const handleClose = () => setopenRoleCreation(false);

  const handleAddOrUpdate = async (data) => {

    const obj = {
      DocEntry: data.DocEntry || "",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: selectedRoleCreationRowId
        ? dayjs().format("YYYY-MM-DD")
        : "",
      Status: "1",
      RoleName: data.RoleName || "",

      Remarks: data.Remarks || "",
    };

    try {
      // --------
      // ---------------------
      setIsLoading(true);

      // ADD MODE
      // -----------------------------
      if (!selectedRoleCreationRowId) {
        const response = await apiClient.post("/Role", obj);

        if (response.data?.success) {
          await fetchRoleList(0);
          getRoleName();
          resetRoleCreation(initialRoleCreationData);
          Swal.fire({
            title: "Success!",
            text: "Role added successfully!",
            icon: "success",
            timer: 1500,
          });
        } else {
          Swal.fire("Error!", response.data?.message || "Failed!", "error");
        }

        return; // stop here
      }

      // -----------------------------
      // UPDATE MODE
      // -----------------------------
      const response = await apiClient.put(
        `/Role/${selectedRoleCreationRowId}`,
        obj
      );

      if (response.data?.success) {
        await fetchRoleList(0);
        getRoleName();
        resetRoleCreation(initialRoleCreationData);
        setSelectedRoleCreationRowId(null);

        Swal.fire({
          title: "Success!",
          text: "Role updated successfully!",
          icon: "success",
          timer: 1500,
        });
      } else {
        Swal.fire(
          "Error!",
          response.data?.message || "Update failed!",
          "error"
        );
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
const handleRoleCreationDelete = async (data) => {
  const result = await Swal.fire({
    text: `Do You Want to Delete "${data.RoleName}" ?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "YES",
    cancelButtonText: "NO",
  });

  if (!result.isConfirmed) {
    Swal.fire({
      text: "Role Not Deleted",
      icon: "info",
      toast: true,
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  setIsLoading(true);

  try {
    const response = await apiClient.delete(`/Role/${data.DocEntry}`);
    const { success, message } = response?.data || {};

    if (!success) {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to delete role.",
        icon: "warning",
      });
      return;
    }

    // ✅ Refresh dependent data
    fetchRoleList(0);
    getRoleName();

    Swal.fire({
      title: "Success!",
      text: "Role Deleted",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete role.";

    console.error("Error deleting role:", error);

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
    });
  } finally {
    setIsLoading(false);
  }
};


const handleEdit = async (row) => {
  if (!row?.DocEntry) return;

  setIsLoading(true);

  try {
    const res = await apiClient.get(`/Role/${row.DocEntry}`);
    const { success, values, message } = res?.data || {};

    if (!success || !values) {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch role details.",
        icon: "warning",
      });
      return;
    }

    const { DocEntry, RoleName, Remarks } = values;

    // ✅ Set form fields
    setValueRoleCreation("RoleName", RoleName || "");
    setValueRoleCreation("DocEntry", DocEntry || "");
    setValueRoleCreation("Remarks", Remarks || "");

    // ✅ Store DocEntry for update
    setSelectedRoleCreationRowId(DocEntry);
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch role details.";

    console.error("Error fetching role:", error);

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
    });
  } finally {
    setIsLoading(false);
  }
};

  const RoleCreationcolumns = [
    {
      field: "DocEntry",
      headerName: "ROLE ID",
      width: 80,
    },
    {
      field: "RoleName",
      headerName: "ROLE NAME",
      width: 200,
    },
    {
      field: "Remarks",
      headerName: "REMARKS",
      width: 200,
    },
    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            handleEdit(params.row);
          }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: "actions",
      headerName: "DELETE",
      width: 100,
      renderCell: (params) => (
        <>
          {/* <IconButton
                color="primary"
                onClick={() => handleEdit(params.row)}
              >
                <EditIcon />
              </IconButton> */}
          <IconButton
            color="error"
            onClick={() => handleRoleCreationDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
    // Add column
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
          Role Mapping List
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
                  key={item.DocEntry}
                  title={item.RoleName}
                  searchResult={searchText}
                  // subtitle={item.RoleName}
                  isSelected={selectedData === item.DocEntry}
                  description={item.RoleName}
                  onClick={() => {
                    setRoleListData(item.DocEntry);
                    // handleCheckboxChange(item.DocEntry);
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
          {isLoading && <Loader open={isLoading} />}
    
      <Dialog
        open={openRoleCreation}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "60vw",
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        {/* ------------------ HEADER ------------------ */}
        <DialogTitle
          sx={{
            textAlign: "center",
            position: "relative",
            fontWeight: "bold",
            py: 2,
            borderRadius: "12px 12px 0 0",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.25)",
          }}
        >
          <Tooltip title="Reset Form">
            <IconButton
              onClick={() => {
                setSelectedRoleCreationRowId(null);
                resetRoleCreation(initialRoleCreationData);
              }}
              sx={{
                position: "absolute",
                left: 16,
                top: 16,
                color: "inherit",
                "&:hover": { backgroundColor: theme.palette.action.hover },
              }}
              size="small"
              aria-label="Reset form"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="h6" component="div">
            Role Creation
          </Typography>

          <Tooltip title="Close Dialog">
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                color: "inherit",
                "&:hover": { backgroundColor: theme.palette.action.hover },
              }}
              aria-label="Close dialog"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        {/* ------------------ CONTENT ------------------ */}
        <DialogContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            paddingTop: 1,
          }}
        >
          {/* ------- FORM ------- */}
          <Box
            component="form"
            onSubmit={HandleRoleCreationForm(handleAddOrUpdate)}
          >
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="RoleName"
                    control={ControlRoleCreation}
                    rules={{
                      required: "Role Name is required",
                      validate: (v) =>
                        v.trim() !== "" || "Role Name cannot be empty",
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputFields
                        {...field}
                        label="ROLE NAME"
                        placeholder="Enter role name"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                        autoFocus
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Controller
                    name="Remarks"
                    control={ControlRoleCreation}
                    render={({ field, fieldState: { error } }) => (
                      <InputFields
                        {...field}
                        label="REMARK"
                        placeholder="Optional remarks"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      minWidth: 120,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {selectedRoleCreationRowId ? "UPDATE" : "ADD"}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Divider after the three fields */}
            <Divider sx={{ mt: 3, mb: 2 }} />
          </Box>

          {/* -------- DATAGRID AREA WITH PAGINATION -------- */}
          <Box
            sx={{
              flexGrow: 1,
              mt: 2,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <DataGrid
              className="datagrid-style"
              rows={RoleCreationList}
              columns={RoleCreationcolumns}
              getRowId={(row) => row.DocEntry}
              pagination
              paginationMode="server"
              paginationModel={{ page: currentPage, pageSize: limit }}
              onPaginationModelChange={handlePaginationModelChange}
              rowCount={rowCount}
              loading={isLoading}
              disableColumnFilter
              disableColumnSelector
              disableDensitySelector
              slots={{ toolbar: CustomQuickSearchToolbar }}
              onFilterModelChange={(model) => {
                const quick = model.quickFilterValues?.[0] || "";
                handleSearchChange(quick); // your search works here
              }}
              sx={{
                height: "100%",
                "& .MuiDataGrid-columnHeaders": {
                  position: "sticky",
                  top: 0,
                  background: "#fff",
                  zIndex: 2,
                },
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* {loading && <Loader open={loading} />} */}
      <Modal
        open={open}
        onClose={closeModel}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "55%",
            height: "70%",
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 🔍 Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ mb: 1 }}
          />

          {/* ✅ Scroll only DataGrid area */}
          <Box
            sx={{
              flex: 1, // take remaining height
              overflowY: "auto",
            }}
          >
            <DataGrid
              columnHeaderHeight={35}
              rowHeight={45}
              rows={filteredRows}
              columns={ItemColumn}
              getRowId={(row) => row.LineNum}
              pageSizeOptions={[8]}
              sx={{
                height: "100%",
                backgroundColor: "#fff",
                "& .MuiDataGrid-cell": { border: "none" },
                "& .MuiDataGrid-cell:focus": { outline: "none" },
              }}
            />
          </Box>

          {/* ✅ Fixed footer (not scrolling) */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" color="success" onClick={onSubmit}>
              Save
            </Button>
            <Button variant="contained" color="error" onClick={closeModel}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
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
            // overflow: 'hid den',
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
              Role Mapping
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
              xs={12}
              height="calc(100% - 40px)"
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
                <Grid container>
                  {/* <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="RoleId"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Role Name is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="ROLE NAME"
                          {...field}
                          data={CardNameValue.map((item) => ({
                            key: item.DocEntry,
                            value: item.RoleName,
                          }))}
                          onChange={(e) => {
                            field.onChange(e);
                            handleRoleChange(e);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                  >
                    <Controller
                      name="RoleId"
                      control={control}
                      // rules={{ required: "RoleCreation is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <InputSearchableSelect
                            {...field}
                            label="ROLE NAME"
                            error={!!error}
                            helperText={error?.message}
                            data={CardNameValue.map((item) => ({
                              key: item.DocEntry,
                              value: item.RoleName,
                            }))}
                            /* 🔔 PRESERVE onOpen LOGIC */
                            onOpen={(e) => {
                              if (CardNameValue.length === 0) {
                                e.stopPropagation();

                                Swal.fire({
                                  title: "No Roles Found!",
                                  text: "Please add a role using the (+) icon.",
                                  icon: "warning",
                                  confirmButtonText: "OK",
                                });
                              }
                            }}
                          />

                          {/* OUTSIDE ICON */}
                          <IconButton
                            onClick={HandlePRoleCreationOpen}
                            size="small"
                            sx={{
                              ml: 1,
                              backgroundColor: "success.main",
                              color: "white",
                              borderRadius: "5px",
                              width: 40,
                              height: 40,
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </>
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
                      // disabled={type === ""}
                      disabled={!roleId}
                      // disabled={!!DocEntry}
                    >
                      Search Activity
                      {/* Search Item */}
                    </Button>
                  </Grid>

                  {/* -------------------------------------------------------------------------------- */}
                  <Divider
                    sx={{ mt: 1, width: "100%", color: "gray", mb: 1 }}
                  />
                  <Grid
                    container
                    item
                    width={"100%"}
                    p={2}
                    pt={0}
                    my={2}
                    minHeight={"300px"}
                    maxHeight={"630px"}
                    overflow={"hidden"}
                    component={Paper}
                    style={{
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                  >
                    {/* <Grid
                      item
                      md={4}
                      xs={4}
                      border={"1px solid grey"}
                      borderRadius={"5px"}
                      mb={"5px"}
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1, // Ensure it stays above the DataGrid
                        backgroundColor: "white", // Match your desired background color
                      }}
                    >
                      <SearchInputField />
                    </Grid> */}
                    <Box
                      sx={{
                        height: 600,
                        width: "100%",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <DataGrid
                        rowHeight={55}
                        columnHeaderHeight={80}
                        className="datagrid-style"
                        getRowId={(row) => row.tempKey}
                        rows={getValues("oLines").map((data, index) => ({
                          ...data,
                          //  tempKey: data.tempKey || data.LineNum || data.MenuId,
                          // serialNumber: index + 1,
                          MenuName: data.TileName || data.MenuName,
                        }))}
                        columns={columns}
                        // hideFooter
                        sx={{
                          backgroundColor:
                            theme.palette.mode === "light"
                              ? "#F5F6FA"
                              : "#080D2B",
                          "& .MuiDataGrid-cell": { border: "none" },
                          "& .MuiDataGrid-cell:focus": { outline: "none" },
                          "& .MuiDataGrid-columnHeaders": {
                            borderBottom: `2px solid ${theme.palette.divider}`, // full header bottom border
                          },
                        }}
                        onSelectionModelChange={(newSelection) =>
                          setSelectedRowIds(new Set(newSelection))
                        }
                      />
                    </Box>
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
                // bottom: "6px",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                name={SaveUpdateName}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                color="success"
                sx={{ color: "white" }}
              >
                {SaveUpdateName}
              </Button>
              <Typography pl={1} sx={{ color: "red", textAlign: "center" }}>
                Note*: After update activity list user need to Log in again to
                see changes...
              </Typography>
              <Button
                variant="contained"
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                color="error"
                onClick={handleOnDelete}
              >
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
