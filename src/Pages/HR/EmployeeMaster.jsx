import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";

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
  FormHelperText,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
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
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
import Swal from "sweetalert2";
// import CardComponent from "../Components/CardComponent";
import { X } from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import {
  InputFields,
  InputSearchableSelect,
  InputSearchSelectTextField,
  InputSelectTextField,
  // InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
  SelectedDatePickerField,
  SelectedYearPickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import PhoneNumberInput from "../Components/PhoneNumber1";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";

export default function EmployeeMaster() {
  const theme = useTheme();
  const perms = usePermissions(251);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [listofcountry, setListofCountry] = useState([]);
  const [Outerlistofstate, setOuterListofState] = useState([]);
  const [currencydata, setCurrencydata] = useState([]);
  const [BankCode, setBankCode] = useState([]);

  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  const [tab, settab] = useState("1");

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  /* -------------------------------------------------------
    STATE FOR ALL THREE COLLECTIONS
  ------------------------------------------------------- */
  //   const [reviewRows, setReviewRows] = useState([]);

  const [openAbsenceModal, setOpenAbsenceModal] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [openLeaveModal, setOpenLeaveModal] = useState(false);

  const [editingReviewIndex, setEditingReviewIndex] = useState(null);
  const [editingLeaveIndex, setEditingLeaveIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [openDepartment, setopenDepartment] = useState(false);
  const [selectedDepartmentRowId, setSelectedDepartmentRowId] = useState(null);
  const [DepartmentList, setDepartmentList] = useState([]);

  const [openBranch, setopenBranch] = useState(false);
  const [selectedBranchRowId, setSelectedBranchRowId] = useState(null);
  const [BranchList, setBranchList] = useState([]);

  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [RoleData, setRoleData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState("");
  const [UserPhoto, setUserPhoto] = useState(""); // for API loaded image
  const [PhotoData, setPhotoData] = useState([]);

  //=====================================get List State====================================================================
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const initial = {
    LastName: "",
    FirstName: "",
    MiddleName: "",
    Sex: "",
    JobTitle: "",
    Dept: "",
    Branch: "",
    Street: "",
    Block: "",
    Zip: "",
    City: "",
    Country: "",
    State: "",
    Manager: "",
    ReviewManager: "",
    ReviewManagerDocEntry: "",
    OfficeTel: "",
    mobile: "",
    Email: "",
    StartDate: "",
    Salary: "",
    SalaryUnit: "",
    TermDate: "",
    TermReason: "",
    BankCode: "",
    BankBranch: "",
    BankAcount: "",
    BirthDate: "",
    PassportNo: "",
    Remark: "",
    SalaryCurr: "",
    AtcEntry: "",
    EmpID: "",
    FromDate: "",
    ToDate: "",
    Reason: "",
    ApprovedBy: "",
    CnfrmrNum: "",
    Type: "",
    Date: "",
    ReviewDesc: "",
    Grade: "",
    Remarks: "",
    LeaveYear: "",
    AbsenceType: "",
    TotalLeave: "",
    LeaveTaken: "",
    LeaveRemaining: "",
    LastUpdated: "",
    createdBy: "",
    Status: "1",
    Duration: "",
    ManagerDocEntry: "",
    oEmpAbsInfoLines: [],
    oEmpReviewInfoLines: [],
    oEmpLeaveInfoLines: [],
    oEmpLeaveApprovalInfoLines: [],
  };
  function CustomToolbar() {
    return (
      <div style={{ padding: "4px 8px" }}>
        <GridToolbarQuickFilter />
      </div>
    );
  }

  // ==============useForm====================================
  const { control, handleSubmit, reset, watch, getValues, setValue, remove } =
    useForm({
      defaultValues: initial,
    });
  const { isDirty } = useFormState({ control });
  const absenceRows = watch("oEmpAbsInfoLines") || [];
  // const reviewRows = watch("oEmpReviewInfoLines") || [];
  // const LeaveApprovalRows = watch("oEmpLeaveApprovalInfoLines") || [];
  const LeaveRows = watch("oEmpLeaveInfoLines") || [];
  const LeaveYear = watch("LeaveYear");
  const TotalLeave = watch("TotalLeave");
  const LeaveTaken = watch("LeaveTaken");

  useEffect(() => {
    const total = Number(TotalLeave) || 0;
    const taken = Number(LeaveTaken) || 0;

    // calculate remaining leave
    const remaining = total - taken;

    setValue("LeaveRemaining", remaining >= 0 ? remaining : 0);
  }, [TotalLeave, LeaveTaken]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  //====================================handle file change=============================================
  const fileInputRef = useRef();

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]; // single file
    const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!file) return;

    if (!validFileTypes.includes(file.type)) {
      Swal.fire({
        position: "center",
        icon: "warning",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        title: "Choose! Please upload JPG, PNG, or PDF files",
        customClass: { popup: "custom-swal-popup" },
        showClass: {
          popup: `animate__animated animate__fadeInDown animate__faster`,
        },
        hideClass: {
          popup: `animate__animated animate__fadeOutUp animate__faster`,
        },
      });
      return;
    }

    const reader = new FileReader();
    console.log("FileReader data", reader);
    reader.onload = () => {
      setPhotoData([
        {
          base64: reader.result,
          name: file.name,
          type: file.type,
          file: file,
        },
      ]);
    };
    reader.readAsDataURL(file);

    // Optionally reset input (for allowing re-upload of the same file)
    event.target.value = "";
  };

  const openFileinNewTab = (data) => {
    console.log(data);
    const url = URL.createObjectURL(data.file);
    window.open(url, "_blank");
  };

  const handlePhotoRemove = () => {
    setPhotoData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset input
    }
  };
  const OpenDailog = (fieldName) => {
    setActiveSearchField(fieldName); // Track which field opened modal
    setSearchmodelOpen(true);
  };

  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };
 const fetchGetListData = async (pageNum, searchTerm = "") => {
  try {
    setLoading(true);

    const url = searchTerm
      ? `/Employee?Status=1&Page=${pageNum}&Limit=20&SearchText=${searchTerm}`
      : `/Employee?Status=1&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    if (response?.data?.success) {
      const newData = response.data.values || [];

      setHasMoreGetList(newData.length === 20);

      setGetListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: response?.data?.message || "No records found",
      });
    }
  } catch (error) {
    console.error("Error fetching employee list:", error);

    Swal.fire({
      icon: "error",
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch employee data. Please try again later.",
    });
  } finally {
    setLoading(false);
  }
};


  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);

    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchGetListData(0, res);
    }, 600);
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0); // Reset page to 0
    setGetListData([]); // Clear current data
    fetchGetListData(0); // Fetch first page without search
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };
  const onSelectManager = (selected) => {
    if (!activeSearchField) return;
    setValue(activeSearchField, `${selected.FirstName} ${selected.LastName}`);
    setValue(`${activeSearchField}DocEntry`, selected.DocEntry);
    if (activeSearchField === "ApprovedBy") {
      setValue("CnfrmrNum", selected.DocEntry);
    } else if (activeSearchField === "Manager") {
      setValue("Manager", `${selected.FirstName} ${selected.LastName}`); // For display
      setValue("ManagerDocEntry", selected.DocEntry); // For backend
    }
    SearchModelClose(); // ⬅ ONLY this
  };

  useEffect(() => {
    fetchGetListData(0); // Load first page on mount
  }, []);

const getRoleDataList = async () => {
  try {
    setLoading(true);

    const response = await apiClient.get(`/RoleMapping/All`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response?.data?.success) {
      const { values = [] } = response.data;

      const formattedData = values.map((item) => ({
        key: item.RoleId,
        value: item.RoleName,
      }));

      setRoleData(formattedData);
    } else {
      Swal.fire({
        title: "Warning!",
        text: response?.data?.message || "No role data found",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error fetching role data:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch the Role data. Please try again later.",
      icon: "error",
      confirmButtonText: "OK",
    });
  } finally {
    setLoading(false);
  }
};


 const getBankCodeDataList = async () => {
  try {
    setLoading(true);

    const response = await apiClient.get(`/BankSetup/All`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response?.data?.success) {
      const { values = [] } = response.data;
      setBankCode(values);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: response?.data?.message || "No bank data found",
      });
    }
  } catch (error) {
    console.error("Error fetching bank data:", error);

    Swal.fire({
      icon: "error",
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch bank data. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};


  //==========================================Add, Update, Delete Department =======================
  const handleDepartmentDelete = async (data) => {
    console.log("DATADELETED", data.DocEntry);

    Swal.fire({
      text: `Do You Want to Delete "${data.Name}" ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/Department/${data.DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              fetchData();

              Swal.fire({
                title: "Success!",
                text: "Department Deleted",
                icon: "success",
                confirmButtonText: "Ok",
                timer: 1500,
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
          text: "Department Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };
 const handleEdit = async (row) => {
  if (!row?.DocEntry) return;

  try {
    setLoading(true);

    const res = await apiClient.get(`/Department/${row.DocEntry}`);
    const response = res?.data;

    if (response?.success) {
      const { DocEntry, Name } = response.values || {};

      // Set value into the form field
      setValueIndic("Name", Name || "");

      // Store DocEntry for later update
      setSelectedDepartmentRowId(DocEntry);
    } else {
      Swal.fire({
        title: "Warning!",
        text: response?.message || "Department data not found",
        icon: "warning",
      });
    }
  } catch (error) {
    console.error("Error fetching department data:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch department data.",
      icon: "error",
    });
  } finally {
    setLoading(false);
  }
};

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "Name", headerName: "Department", width: 250 },
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
      headerName: "Actions",
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
            onClick={() => handleDepartmentDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  const initialDepartmentData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    Code: "",
    Name: "",
    Remarks: "",
  };

  const {
    handleSubmit: HandleDepartmentForm,
    control: ControlDepartment,
    reset: resetDepartment,
    // getValues: getValues1,
    setValue: setValueIndic,
  } = useForm({
    defaultValues: initialDepartmentData,
  });
  const HandlePDepartmentOpen = () => setopenDepartment(true);
  const handleClose = () => setopenDepartment(false);
  const fetchData = async () => {
  try {
    setLoading(true);

    const res = await apiClient.get(`/Department/All`);
    const response = res?.data;

    if (response?.success) {
      setDepartmentList(response.values || []);
    } else {
      Swal.fire({
        title: "Warning!",
        text: response?.message || "No department data found",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching department data:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch department data. Please try again.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

  const handleAddOrUpdate = async (data) => {
  const obj = {
    DocEntry: data.DocEntry || "",
    UserId: user?.UserId,
    CreatedBy: user?.UserName,
    CreatedDate: dayjs().format("YYYY-MM-DD"),
    ModifiedBy: user?.UserName,
    ModifiedDate: selectedDepartmentRowId
      ? dayjs().format("YYYY-MM-DD")
      : "",
    Status: "1",
    Code: data.Code || "0",
    Name: data.Name || "",
    Remarks: data.Remarks || "",
  };

  try {
    setLoading(true);

    // -----------------------------
    // ADD MODE
    // -----------------------------
    if (!selectedDepartmentRowId) {
      const response = await apiClient.post("/Department", obj);

      if (response?.data?.success) {
        await fetchData();
        resetDepartment(initialDepartmentData);

        Swal.fire({
          title: "Success!",
          text: "Department added successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response?.data?.message || "Failed to add department",
          icon: "warning",
        });
      }

      return;
    }

    // -----------------------------
    // UPDATE MODE
    // -----------------------------
    const response = await apiClient.put(
      `/Department/${selectedDepartmentRowId}`,
      obj
    );

    if (response?.data?.success) {
      await fetchData();
      resetDepartment(initialDepartmentData);
      setSelectedDepartmentRowId(null);

      Swal.fire({
        title: "Success!",
        text: "Department updated successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: response?.data?.message || "Update failed",
        icon: "warning",
      });
    }
  } catch (error) {
    console.error("Department save/update error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.",
      icon: "error",
    });
  } finally {
    setLoading(false);
  }
};


  //================================Add, Update, Delete Branch ========================================
 const handleBranchDelete = async (data) => {
  const result = await Swal.fire({
    text: `Do You Want to Delete "${data.Name}" ?`,
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showDenyButton: true,
  });

  if (!result.isConfirmed) {
    Swal.fire({
      text: "Branch Not Deleted",
      icon: "info",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  try {
    setLoading(true);

    const response = await apiClient.delete(`/Branch/${data.DocEntry}`);

    if (response?.data?.success) {
      resetBranch(initialBranchData);
      await fetchBranchData();

      Swal.fire({
        title: "Success!",
        text: "Branch Deleted",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: response?.data?.message || "Branch not deleted",
        icon: "warning",
      });
    }
  } catch (error) {
    console.error("Branch delete error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
      icon: "error",
    });
  } finally {
    setLoading(false);
  }
};

const handleEditBranch = async (row) => {
  if (!row?.DocEntry) return;

  try {
    setLoading(true);

    const response = await apiClient.get(`/Branch/${row.DocEntry}`);

    if (response?.data?.success) {
      const { DocEntry, Name } = response.data.values;

      // Populate form fields
      setValueBranch("Name", Name);

      // Store DocEntry for update mode
      setSelectedBranchRowId(DocEntry);
    } else {
      Swal.fire({
        title: "Error!",
        text: response?.data?.message || "Failed to fetch branch details",
        icon: "warning",
      });
    }
  } catch (error) {
    console.error("Error fetching branch:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
      icon: "error",
    });
  } finally {
    setLoading(false);
  }
};

  const Branchcolumns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "Name", headerName: "Branch", width: 250 },

    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleEditBranch(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleBranchDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  const initialBranchData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    Code: "",
    Name: "",
    Remarks: "",
  };
  const initialUserData = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    UserName: "",
    Email: "",
    Password: "",
    RoleId: "",
    FirstName: "",
    LastName: "",
    PhoneNumber: "",
  };
  const {
    handleSubmit: HandleUserForm,
    control: ControlUser,
    reset: resetUser,
    // getValues: getValues1,
    setValue: setValueUser,
  } = useForm({
    defaultValues: initialUserData,
  });
  const {
    handleSubmit: HandleBranchForm,
    control: ControlBranch,
    reset: resetBranch,
    // getValues: getValues1,
    setValue: setValueBranch,
  } = useForm({
    defaultValues: initialBranchData,
  });
  const HandleBranchOpen = () => setopenBranch(true);
  const handleBranchClose = () => setopenBranch(false);
  const handleUserClose = () => setOpenCreateUserDialog(false);
const fetchBranchData = async () => {
  try {
    setLoading(true);

    const response = await apiClient.get(`/Branch/All`);

    if (response?.data?.success) {
      setBranchList(response.data.values || []);
    } else {
      Swal.fire({
        title: "Error!",
        text: response?.data?.message || "Failed to fetch branch data",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching branch data:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching branch data",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

 const handleAddOrUpdateBranch = async (data) => {
  const obj = {
    DocEntry: data.DocEntry || "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs().format("YYYY-MM-DD"),
    ModifiedBy: user.UserName,
    ModifiedDate: selectedBranchRowId ? dayjs().format("YYYY-MM-DD") : "",
    Status: "1",
    Code: data.Code || "0",
    Name: data.Name || "",
    Remarks: data.Remarks || "",
  };

  const isUpdate = Boolean(selectedBranchRowId);
  const apiUrl = isUpdate ? `/Branch/${selectedBranchRowId}` : `/Branch`;
  const method = isUpdate ? "put" : "post";

  try {
    // 🔹 Confirm only for UPDATE
    if (isUpdate) {
      const result = await Swal.fire({
        text: `Do you want to update "${data.Name}"?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Branch not updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    }

    setLoading(true);

    const response = await apiClient[method](apiUrl, obj);

    if (response?.data?.success) {
      await fetchBranchData();
      resetBranch(initialBranchData);
      setSelectedBranchRowId(null);

      Swal.fire({
        title: "Success!",
        text: `Branch ${isUpdate ? "updated" : "added"} successfully!`,
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    } else {
      Swal.fire(
        "Error!",
        response?.data?.message || "Operation failed",
        "error"
      );
    }
  } catch (error) {
    console.error("Error submitting branch:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

 const handleAddUser = async (data) => {
  const obj = {
    DocEntry: "",
    DocNum: null,
    DocDate: dayjs().format("YYYY-MM-DD"),
    UserId: sessionStorage.getItem("UserId") || "1",
    CreatedBy: user.UserName || "",
    CreatedDate: dayjs().format("YYYY/MM/DD"),
    ModifiedBy: user.UserName || "",
    ModifiedDate: dayjs().format("YYYY/MM/DD"),
    Status: "1",
    UserName: String(data.UserName),
    Password: String(data.Password),
    RoleId: String(data.RoleId),
    FirstName: String(data.FirstName),
    LastName: String(data.LastName),
    PhoneNumber: String(data.PhoneNumber),
    Email: String(data.Email),
    SlpCode: String(data.SlpCode || "0"),
    Flag: "0",
    OtherUserFlag: "0",
    SuperUser: "N",
    MobileUser: "N",
    UserCode: data.UserCode || null,
    PortNum: data.PortNum || null,
    Branch: "1",
    Department: "1",
    GroupName: data.GroupName || null,
    PwdNeverEx: data.PwdNeverEx || null,
    OneLogPwd: data.OneLogPwd || null,
    Locked: data.Locked || "N",
  };

  try {
    setLoading(true);

    const response = await apiClient.post("/Users", obj);

    if (response?.data?.success) {
      resetUser(initialUserData);
      setOpenCreateUserDialog(false);

      Swal.fire({
        title: "Success!",
        text: "User added successfully!",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    } else {
      Swal.fire(
        "Error!",
        response?.data?.message || "Failed to add user",
        "error"
      );
    }
  } catch (error) {
    console.error("Error adding user:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

  const absenceColumns = [
    { field: "Duration", headerName: "Duration", flex: 1 },
    { field: "FromDate", headerName: "From Date", flex: 1 },
    { field: "ToDate", headerName: "To Date", flex: 1 },
    { field: "Reason", headerName: "Reason", flex: 1 },
    { field: "RowStatus", headerName: "Status", flex: 1 },
    { field: "ApprovedBy", headerName: "Approved By", flex: 1 },
    // { field: "CnfrmrNum", headerName: "Confirmer No.", flex: 1 },
    { field: "Type", headerName: "Leave Type", flex: 1 },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const index = params.rowIndex;
        const row = params.row;
        const isPending =
          row.RowStatus === "Pending" ||
          row.RowStatus === 1 ||
          row.RowStatus === "1";
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* EDIT ICON */}
            <IconButton
              color="primary"
              disabled={!isPending}
              onClick={() => {
                const list = getValues("oEmpAbsInfoLines") || [];
                const row = list[params.id - 1]; // sync with DataGrid id
                if (!row) return;

                Object.keys(row).forEach((key) => {
                  if (key === "Type") {
                    // Convert type value back to key
                    const typeObj = AbsenceTypes.find(
                      (t) => t.value === row.Type
                    );
                    setValue("Type", typeObj?.key || null);
                  } else if (key === "Duration") {
                    // Convert type value back to key
                    const typeObj = Duration.find(
                      (t) => t.value === row.Duration
                    );
                    setValue("Duration", typeObj?.key || null);
                  } else if (
                    (key === "FromDate" || key === "ToDate") &&
                    row[key]
                  ) {
                    // Convert "DD/MM/YYYY" string back to dayjs
                    const [day, month, year] = row[key].split("/");
                    setValue(key, dayjs(`${year}-${month}-${day}`));
                  } else {
                    setValue(key, row[key]);
                  }
                });

                setEditingIndex(params.id - 1);
                setOpenAbsenceModal(true);
              }}
            >
              <EditIcon />
            </IconButton>

            {/* DELETE ICON */}
            <IconButton
              color="error"
              disabled={!isPending}
              onClick={() => {
                const list = getValues("oEmpAbsInfoLines") || [];
                const index = params.id - 1; // FIXED

                const updatedList = list.filter((_, i) => i !== index);

                setValue("oEmpAbsInfoLines", updatedList, {
                  shouldDirty: true,
                });
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];
  const AbsenceTypes = [
    { key: 1, value: "Paid Leave" },
    { key: 2, value: "Unpaid Leave" },
    { key: 3, value: "Compensatory Off" },
    { key: 4, value: "Other Absences" },
  ];
  const formattedAbsenceTypes = AbsenceTypes.map((type) => {
    const match = LeaveRows?.find((x) => x.AbsenceType === type.value);

    return {
      key: type.key,
      value: match
        ? `${type.value} (${match.LeaveRemaining})`
        : `${type.value} (0)`, // default if not found
    };
  });
  const getRemainingLeaves = (selectedType) => {
    const typeObj = formattedAbsenceTypes.find((t) => t.key === selectedType);

    if (!typeObj) return 0;

    const match = typeObj.value.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  };
  const calculateDays = (from, to) => {
    if (!from || !to) return 0;

    const start = dayjs(from);
    const end = dayjs(to);

    return end.diff(start, "day") + 1; // +1 because both days included
  };

  const Duration = [
    { key: 1, value: "Full Day" },
    { key: 2, value: "Half Day" },
    { key: 3, value: "Multiple Day" },
  ];
  const resetAbsenceModalFields = () => {
    setValue("FromDate", null);
    setValue("ToDate", null);
    setValue("Reason", "");
    setValue("ApprovedBy", "");
    setValue("CnfrmrNum", "");
    setValue("Type", "");
  };
  // const onSubmitAbsence = () => {
  //   const fv = getValues();
  //   const typeLabel =
  //     AbsenceTypes.find((t) => t.key === fv.Type)?.value || fv.Type;
  //   const DurationLabel =
  //     Duration.find((t) => t.key === fv.Duration)?.value || fv.Duration;
  //   // REQUIRED FIELDS CHECK
  //   if (
  //     !fv.Duration ||
  //     !fv.FromDate ||
  //     !fv.Reason ||
  //     !fv.ApprovedBy ||
  //     !fv.Type
  //   ) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Missing Required Fields",
  //       text: "Please fill From Date, Reason, Approved By, and Type.",
  //     });
  //     return; // STOP EXECUTION
  //   }
  //   // -----------------------------
  //   // ⭐ LEAVE REMAINING VALIDATION
  //   // -----------------------------
  //   const remainingLeaves = getRemainingLeaves(fv.Type);
  //   const appliedDays = calculateDays(fv.FromDate, fv.ToDate);

  //   console.log("Remaining:", remainingLeaves);
  //   console.log("Applied:", appliedDays);

  //   if (appliedDays > remainingLeaves) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Insufficient Leave Balance",
  //       text: `Only ${remainingLeaves} leave(s) remaining, but you selected ${appliedDays} day(s).`,
  //     });
  //     return; // STOP SAVING
  //   }
  //   const row = {
  //     EmpID: getValues("EmpID"),
  //     Duration: DurationLabel,
  //     FromDate: fv.FromDate ? dayjs(fv.FromDate).format("DD/MM/YYYY") : "",
  //     ToDate: fv.ToDate ? dayjs(fv.ToDate).format("DD/MM/YYYY") : "",
  //     Reason: fv.Reason || "", // Ensure defaults to empty string if undefined
  //     ApprovedBy: fv.ApprovedBy || "",
  //     CnfrmrNum: fv.CnfrmrNum || "",
  //     Type: typeLabel || "",
  //   };

  //   const list = getValues("oEmpAbsInfoLines") || [];
  //   let updatedList = [...list];

  //   if (editingIndex !== null) {
  //     updatedList[editingIndex] = row;
  //   } else {
  //     updatedList.push(row);
  //   }

  //   setValue("oEmpAbsInfoLines", updatedList, {
  //     shouldDirty: true,
  //     shouldValidate: true,
  //   });

  //   // RESET ONLY MODAL FIELDS
  //   resetAbsenceModalFields();

  //   setEditingIndex(null);
  //   setOpenAbsenceModal(false);
  // };
  const onSubmitAbsence = () => {
    const fv = getValues();

    const typeLabel =
      AbsenceTypes.find((t) => t.key === fv.Type)?.value || fv.Type;

    const durationLabel =
      Duration.find((t) => t.key === fv.Duration)?.value || fv.Duration;

    // ⭐ REQUIRED VALIDATION
    if (!fv.Duration || !fv.FromDate || !fv.Reason || !fv.Type) {
      Swal.fire({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Please fill Duration, From Date, Reason, Type.",
      });
      return;
    }

    const fromDate = dayjs(fv.FromDate);
    const toDate = fv.ToDate ? dayjs(fv.ToDate) : dayjs(fv.FromDate);

    // ⭐ OVERLAP VALIDATION
    const existingRows = getValues("oEmpAbsInfoLines") || [];

    const isOverlap = existingRows.some((row, index) => {
      if (editingIndex !== null && editingIndex === index) return false;

      const exFrom = dayjs(row.FromDate, "DD/MM/YYYY");
      const exTo = row.ToDate ? dayjs(row.ToDate, "DD/MM/YYYY") : exFrom;

      const isSameDate =
        fromDate.format("YYYY-MM-DD") === exFrom.format("YYYY-MM-DD");

      const existingDurationKey =
        row.Duration === "Full Day" ? 1 : row.Duration === "Half Day" ? 2 : 3;

      const currentDurationKey = fv.Duration;

      if (isSameDate && existingDurationKey === 2 && currentDurationKey === 2) {
        return false;
      }

      return (
        fromDate.valueOf() <= exTo.valueOf() &&
        toDate.valueOf() >= exFrom.valueOf()
      );
    });

    if (isOverlap) {
      Swal.fire({
        icon: "error",
        title: "Overlapping Absence",
        text: "You already have an absence entry for this date range.",
      });
      return;
    }

    // ⭐ NEW VALUES (fields from UI)
    const newValues = {
      EmpID: getValues("EmpID"),
      Duration: durationLabel,
      FromDate: fromDate.format("DD/MM/YYYY"),
      ToDate: fv.ToDate ? toDate.format("DD/MM/YYYY") : "",
      Reason: fv.Reason || "",
      ApprovedBy: fv.ApprovedBy || "",
      CnfrmrNum: fv.CnfrmrNum || "",
      Type: typeLabel,
    };

    const list = getValues("oEmpAbsInfoLines") || [];
    let updatedList = [...list];

    if (editingIndex !== null) {
      // ⭐ MERGE OLD ROW + NEW VALUES
      updatedList[editingIndex] = {
        ...updatedList[editingIndex], // <-- keep LineNum, Status, DocEntry
        ...newValues, // <-- override updated fields
      };
    } else {
      // ⭐ ADD NEW ROW — Assign Status = Pending
      updatedList.push({
        ...newValues,
        RowStatus: "Pending",
      });
    }

    setValue("oEmpAbsInfoLines", updatedList, {
      shouldDirty: true,
      shouldValidate: true,
    });

    resetAbsenceModalFields();
    setEditingIndex(null);
    setOpenAbsenceModal(false);
  };

  const resetReviewModalFields = () => {
    setValue("date", null);
    setValue("ReviewManager", "");
    setValue("ReviewDesc", "");
    setValue("Grade", "");
    setValue("Remarks", "");
  };
  const onSubmitReview = () => {
    const fv = getValues();
    if (!fv.Date || !fv.ReviewManager || !fv.Grade) {
      Swal.fire({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Please fill Date, Manager, and Grade.",
      });
      return;
    }

    const list = getValues("oEmpReviewInfoLines") || [];
    let updatedList = [...list];

    // NEW row data (only updated fields)
    const newValues = {
      EmpID: fv.EmpID,
      Date: fv.Date ? dayjs(fv.Date).format("DD/MM/YYYY") : "",
      Manager: fv.ReviewManager,
      ReviewManagerDocEntry: getValues("ReviewManagerDocEntry"),
      ReviewDesc: fv.ReviewDesc,
      Grade: fv.Grade,
      Remarks: fv.Remarks,
    };

    // If EDIT → merge old row + new data
    if (editingReviewIndex !== null) {
      updatedList[editingReviewIndex] = {
        ...updatedList[editingReviewIndex], // ← KEEP ALL OLD KEYS
        ...newValues, // ← UPDATE ONLY EDITED KEYS
      };
    } else {
      // ADD new row normally
      updatedList.push(newValues);
    }

    setValue("oEmpReviewInfoLines", updatedList, {
      shouldDirty: true,
      shouldValidate: true,
    });

    resetReviewModalFields();
    setEditingReviewIndex(null);
    setOpenReviewModal(false);
  };

  const reviewColumns = [
    { field: "Date", headerName: "Date", width: 120 },
    { field: "ReviewDesc", headerName: "Description", width: 220 },
    { field: "Manager", headerName: "Manager", width: 180 },
    { field: "Grade", headerName: "Grade", width: 120 },
    { field: "Remarks", headerName: "Remarks", width: 220 },

    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      renderCell: (params) => {
        const index = params.row.id - 1; // Correct index
        const row = params.row;

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* EDIT */}
            <IconButton
              color="primary"
              onClick={() => {
                setEditingReviewIndex(index);

                // Load row values
                Object.keys(row).forEach((key) => {
                  if (key !== "id") {
                    if (key === "Date" && row.Date) {
                      const [day, month, year] = row.Date.split("/");
                      setValue("Date", dayjs(`${year}-${month}-${day}`));
                    }

                    // Map Manager → ReviewManager
                    else if (key === "Manager") {
                      setValue("ReviewManager", row.Manager);
                    } else {
                      setValue(key, row[key]);
                    }
                  }
                });

                setOpenReviewModal(true);
              }}
            >
              <EditIcon />
            </IconButton>

            {/* DELETE */}
            <IconButton
              color="error"
              onClick={() => {
                const list = getValues("oEmpReviewInfoLines") || [];
                const updatedList = list.filter((_, i) => i !== index);
                setValue("oEmpReviewInfoLines", updatedList, {
                  shouldDirty: true,
                });
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];
  const LeaveApprovalColumn = [
    { field: "FirstName", headerName: "First Name", width: 150 },
    { field: "LastName", headerName: "Last Name", width: 150 },
    { field: "FromDate", headerName: "From Date", width: 150 },
    { field: "ToDate", headerName: "To Date", width: 150 },
    { field: "Reason", headerName: "Reason", width: 150 },

    { field: "Days", headerName: "Days", width: 150 },
    { field: "Type", headerName: "Type", width: 150 },
    { field: "Duration", headerName: "Duration", width: 150 },
    // { field: "Manager", headerName: "Manager", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const row = params.row;

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => handleApproveLeave(row)}
            >
              Accept
            </Button>

            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleRejectLeave(row)}
            >
              Reject
            </Button>
          </Box>
        );
      },
    },
  ];
  const getAbsenceKeyFromLabel = (label) => {
    return AbsenceTypes.find((x) => x.value === label)?.key || 0;
  };

  const getDurationKeyFromLabel = (label) => {
    return Duration.find((x) => x.value === label)?.key || 0;
  };

const handleApproveLeave = async (row) => {
  try {
    setLoading(true);

    const url = `/Employee/${row.DocEntry}/AbsInfo/${row.LineNum}`;

    const payload = {
      LineNum: row.LineNum,
      DocEntry: row.DocEntry,
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: row.CreatedDate
        ? dayjs(row.CreatedDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: 0, // Approved
      FromDate: dayjs(row.FromDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      ToDate: row.ToDate
        ? dayjs(row.ToDate, "DD/MM/YYYY").format("YYYY-MM-DD")
        : dayjs(row.FromDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      Reason: row.Reason || "",
      ApprovedBy: `${watch("FirstName")} ${watch("LastName")}`,
      CnfrmrNum: Number(selectedData || 0),
      Type: getAbsenceKeyFromLabel(row.Type),
      Duration: getDurationKeyFromLabel(row.Duration),
    };

    const response = await apiClient.put(url, payload);
    const { success, message } = response.data || {};

    if (success) {
      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Leave approved successfully.",
        timer: 1000,
        showConfirmButton: false,
      });

      // Refresh list
      setEmployeeMasterDataList(selectedData);
    } else {
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: message || "Something went wrong.",
      });
    }
  } catch (error) {
    console.error("Approve Leave Error:", error);

    Swal.fire({
      icon: "error",
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to approve leave.",
    });
  } finally {
    setLoading(false);
  }
};


 const handleRejectLeave = async (row) => {
  try {
    setLoading(true);

    const url = `/Employee/${row.DocEntry}/AbsInfo/${row.LineNum}`;

    const payload = {
      LineNum: row.LineNum,
      DocEntry: row.DocEntry,
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: row.CreatedDate
        ? dayjs(row.CreatedDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      Status: 3, // Rejected
      FromDate: dayjs(row.FromDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      ToDate: row.ToDate
        ? dayjs(row.ToDate, "DD/MM/YYYY").format("YYYY-MM-DD")
        : dayjs(row.FromDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      Reason: row.Reason || "",
      ApprovedBy: `${watch("FirstName")} ${watch("LastName")}`,
      CnfrmrNum: Number(selectedData || 0),
      Type: getAbsenceKeyFromLabel(row.Type),
      Duration: getDurationKeyFromLabel(row.Duration),
    };

    const response = await apiClient.put(url, payload);
    const { success, message } = response.data || {};

    if (success) {
      Swal.fire({
        icon: "success",
        title: "Rejected!",
        text: "Leave rejected successfully.",
        timer: 1000,
        showConfirmButton: false,
      });

      // Refresh leave list
      setEmployeeMasterDataList(selectedData);
    } else {
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text: message || "Something went wrong.",
      });
    }
  } catch (error) {
    console.error("Reject Leave Error:", error);

    Swal.fire({
      icon: "error",
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject leave.",
    });
  } finally {
    setLoading(false);
  }
};


  const leaveColumns = [
    { field: "LeaveYear", headerName: "Year", width: 150 },
    { field: "AbsenceType", headerName: "Absence Type", width: 150 },
    { field: "TotalLeave", headerName: "Total Leave", width: 150 },
    { field: "LeaveTaken", headerName: "Leave Taken", width: 150 },
    { field: "LeaveRemaining", headerName: "Leave Remaining", width: 150 },
    { field: "LastUpdated", headerName: "Last Updated", width: 150 },
    // { field: "createdBy", headerName: "Created By", width: 150 },
    { field: "Remarks", headerName: "Remarks", width: 150 },

    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      renderCell: (params) => {
        const index = params.row.id - 1;

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              color="primary"
              onClick={() => {
                setEditingLeaveIndex(index); // CORRECT INDEX

                Object.keys(params.row).forEach((key) => {
                  if (key === "AbsenceType") {
                    const typeObj = AbsenceTypes.find(
                      (t) => t.value === params.row.AbsenceType
                    );
                    setValue("AbsenceType", typeObj?.key || null);
                  } else if (key === "LastUpdated" && params.row[key]) {
                    const [d, m, y] = params.row[key].split("/");
                    setValue("LastUpdated", dayjs(`${y}-${m}-${d}`));
                  } else {
                    setValue(key, params.row[key]);
                  }
                });

                setOpenLeaveModal(true);
              }}
            >
              <EditIcon />
            </IconButton>

            <IconButton
              color="error"
              onClick={() => {
                const list = getValues("oEmpLeaveInfoLines") || [];
                const updatedList = list.filter((_, i) => i !== index);

                setValue("oEmpLeaveInfoLines", updatedList, {
                  shouldDirty: true,
                });
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];
  const resetLeaveModalFields = () => {
    setValue("LeaveYear", "");
    setValue("AbsenceType", "");
    setValue("TotalLeave", "");
    setValue("LeaveTaken", "");
    setValue("LeaveRemaining", "");
    setValue("LastUpdated", "");
    setValue("createdBy", "");
    setValue("Remarks", "");
  };

  const onSubmitLeave = () => {
    const fv = getValues();

    // Required field validation
    if (!fv.LeaveYear || !fv.AbsenceType || !fv.TotalLeave) {
      Swal.fire({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Please provide Year, Absence Type, and Total Leave.",
      });
      return;
    }

    const list = getValues("oEmpLeaveInfoLines") || [];
    const typeLabel =
      AbsenceTypes.find((t) => t.key === fv.AbsenceType)?.value ||
      fv.AbsenceType;

    // New entered fields ONLY
    const newValues = {
      EmpID: fv.EmpID,
      LeaveYear: fv.LeaveYear,
      AbsenceType: typeLabel,
      TotalLeave: fv.TotalLeave,
      LeaveTaken: fv.LeaveTaken,
      LeaveRemaining: fv.LeaveRemaining,
      LastUpdated: fv.LastUpdated
        ? dayjs(fv.LastUpdated).format("DD/MM/YYYY")
        : "",
      createdBy: fv.createdBy,
      Remarks: fv.Remarks,
    };

    let updatedList = [...list];

    // If editing → MERGE old row + new values
    if (editingLeaveIndex !== null) {
      updatedList[editingLeaveIndex] = {
        ...updatedList[editingLeaveIndex], // ⬅ keep LineNum, DocEntry, CreatedBy etc.
        ...newValues, // ⬅ override updated fields
      };
    } else {
      // adding a new line
      updatedList.push(newValues);
    }

    setValue("oEmpLeaveInfoLines", updatedList, {
      shouldDirty: true,
      shouldValidate: true,
    });

    resetLeaveModalFields();
    setEditingLeaveIndex(null);
    setOpenLeaveModal(false);
  };

  // 3️⃣ Disable options in AbsenceType dropdown dynamically
  // const filteredAbsenceTypes = (fv) => {
  //   const list = getValues("oEmpLeaveInfoLines") || [];
  //   return AbsenceTypes.filter((t) => {
  //     // filter out types already used in the same year
  //     return !list.some(
  //       (r) =>
  //         r.LeaveYear === fv.LeaveYear &&
  //         r.AbsenceType === t.value &&
  //         editingLeaveIndex !== list.indexOf(r)
  //     );
  //   });
  // };

  const ListofCountry = async () => {
  try {
    setLoading(true);

    const response = await apiClient.get(`/Country/all`);
    const { success, values, message } = response.data || {};

    if (success) {
      setListofCountry(values || []);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: message || "Unable to fetch country list.",
      });
    }
  } catch (error) {
    console.error("Error fetching countries:", error);

    Swal.fire({
      icon: "error",
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch country list. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

 const CurrencyData = async () => {
  try {
    setLoading(true);

    const response = await apiClient.get(`/Currency/all`);
    const { success, values, message } = response.data || {};

    if (success) {
      setCurrencydata(values || []);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: message || "Unable to fetch currency data.",
      });
    }
  } catch (error) {
    console.error("Error fetching currency data:", error);

    Swal.fire({
      icon: "error",
      title: "Failed to fetch Currency Data!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong.",
      confirmButtonColor: "#3085d6",
    });
  } finally {
    setLoading(false);
  }
};

  // ===============Main list handle search====================================
  const allValues = watch(); // watch everything

  useEffect(() => {
    console.log("FORM UPDATED:", allValues);
  }, [allValues]);

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData(null);
    clearFiles();
    setActiveTab(0);
    setPhotoData([]);
    setUserPhoto(null);
  };
  const selectedCountryCode = watch("Country");
  useEffect(() => {
    if (selectedCountryCode) {
      OuterListofState(selectedCountryCode);
    }
  }, [selectedCountryCode]);
 const OuterListofState = async (CountryCode) => {
  if (!CountryCode) return;

  try {
    setLoading(true);

    const response = await apiClient.get(
      `/ListofStates/GetByCountryCode/${CountryCode}`
    );

    const { success, values, message } = response.data || {};

    if (success) {
      setOuterListofState(values || []);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: message || "No states found for the selected country.",
      });
      setOuterListofState([]);
    }
  } catch (error) {
    console.error("Error fetching states:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch state list. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

  // ===============Get initial list data====================================

  useEffect(
    () => {
      ListofCountry();
      fetchOpenListData(0); // Load first page on mount
      CurrencyData();
      fetchData();
      fetchBranchData();
      getBankCodeDataList();
      getRoleDataList();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(
    () => {
      console.log("absence rows", absenceRows);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [absenceRows]
  );
  // ===============API for Setting specific Cards data====================================
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      // await setManager(CardCode, CntctCode);
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
          setEmployeeMasterDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setEmployeeMasterDataList(DocEntry);
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
const setEmployeeMasterDataList = async (DocEntry) => {
  if (!DocEntry) return;

  const formatDate = (date) =>
    date ? dayjs(date).format("DD/MM/YYYY") : "";

  const getAbsenceLabel = (key) =>
    AbsenceTypes.find((x) => x.key === Number(key))?.value || key;

  const getDurationLabel = (key) =>
    Duration.find((d) => d.key === Number(key))?.value || key;

  try {
    setLoading(true);

    const response = await apiClient.get(`/Employee?DocEntry=${DocEntry}`);
    const { success, values, message } = response.data || {};

    if (!success || !values) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: message || "Employee data not found.",
      });
      return;
    }

    const d = values;

    // ==========================
    // 🔥 MAIN DATA MAPPING
    // ==========================
    const mapped = {
      ...d,

      FirstName: d.FirstName || "",
      LastName: d.LastName || "",
      MiddleName: d.MiddleName || "",
      Sex: d.Sex || "",
      JobTitle: d.JobTitle || "",
      Department: d.Department || "",
      Branch: d.Branch || "",
      Street: d.Street || "",
      Block: d.Block || "",
      Zip: d.Zip || "",
      City: d.City || "",
      Country: d.Country || "",
      State: d.State || "",
      Manager: d.Manager || "",
      OfficeTel: d.OfficeTel || "",
      Mobile: d.Mobile || "",
      Email: d.Email || "",

      StartDate: dayjs(d.StartDate).isValid()
        ? dayjs(d.StartDate).format("YYYY-MM-DD")
        : null,

      TermDate: dayjs(d.TermDate).isValid()
        ? dayjs(d.TermDate).format("YYYY-MM-DD")
        : null,

      Salary: d.Salary || "",
      SalaryUnit: d.SalaryUnit || "",
      TermReason: d.TermReason || "",
      BankCode: d.BankCode || "",
      BankBranch: d.BankBranch || "",
      BankAcount: d.BankAcount || "",
      BirthDate: d.BirthDate ? dayjs(d.BirthDate) : null,
      PassportNo: d.PassportNo || "",
      Remark: d.Remark || "",
      SalaryCurr: d.SalaryCurr || "",
      AtcEntry: d.AtcEntry || "",
      EmpID: d.EmpID || "",
      Status: d.Status === 1 ? "1" : "0",

      // ==========================
      // 🔹 ABSENCE LINES
      // ==========================
      oEmpAbsInfoLines:
        d.oEmpAbsInfoLines?.map((x) => ({
          ...x,
          FromDate: formatDate(x.FromDate),
          ToDate: formatDate(x.ToDate),
          Type: getAbsenceLabel(x.Type),
          Duration: getDurationLabel(x.Duration),
          RowStatus:
            Number(x.Status) === 1
              ? "Pending"
              : Number(x.Status) === 0
              ? "Approved"
              : Number(x.Status) === 3
              ? "Rejected"
              : x.Status,
        })) || [],

      // ==========================
      // 🔹 REVIEW LINES
      // ==========================
      oEmpReviewInfoLines:
        d.oEmpReviewInfoLines?.map((x) => ({
          ...x,
          Date: formatDate(x.Date),
          ReviewManagerDocEntry: x.Manager,
          Manager: x.ManagerName,
        })) || [],

      // ==========================
      // 🔹 LEAVE BALANCE
      // ==========================
      oEmpLeaveInfoLines:
        d.oEmpLeaveInfoLines?.map((x) => ({
          ...x,
          AbsenceType: getAbsenceLabel(x.AbsenceType),
          LastUpdated: formatDate(x.LastUpdated),
        })) || [],

      // ==========================
      // 🔹 LEAVE APPROVAL
      // ==========================
      oEmpLeaveApprovalInfoLines:
        d.oEmpLeaveApprovalInfoLines?.map((x) => ({
          ...x,
          FromDate: formatDate(x.FromDate),
          ToDate: formatDate(x.ToDate),
          Duration: getDurationLabel(x.Duration),
          Type: getAbsenceLabel(x.Type),
          Status:
            Number(x.Status) === 1
              ? "Pending"
              : Number(x.Status) === 0
              ? "Approved"
              : Number(x.Status) === 3
              ? "Rejected"
              : x.Status,
        })) || [],
    };

    // ==========================
    // 🔹 PHOTO HANDLING
    // ==========================
    if (d.Picture) {
      setPhotoData([
        {
          base64: `data:image/png;base64,${d.Picture}`,
          name: "Photo",
          type: "image/png",
        },
      ]);
    } else {
      setPhotoData([]);
    }

    setUserPhoto(d.Picture || "");

    // ==========================
    // 🔹 MANAGER NAME FETCH
    // ==========================
    if (d.Manager) {
      try {
        const mgrRes = await apiClient.get(
          `/Employee?DocEntry=${d.Manager}`
        );
        const mgr = mgrRes.data?.values;

        mapped.Manager = `${mgr?.FirstName || ""} ${
          mgr?.LastName || ""
        }`.trim();
      } catch (err) {
        console.error("Manager fetch failed:", err);
        mapped.Manager = "";
      }
    }

    // ==========================
    // 🔹 FINAL SETUP
    // ==========================
    toggleDrawer();
    reset(mapped);
    setValue("ManagerDocEntry", d.Manager);
    setFilesFromApi(d.AtcEntry);

    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);
  } catch (error) {
    console.error("Error fetching employee data:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch employee data.",
    });
  } finally {
    setLoading(false);
  }
};


  // ===============API for Pagination ==================================
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
    setLoading(true); // 🔥 START LOADER

    const url = searchTerm
      ? `/Employee?Status=1&Page=${pageNum}&SearchText=${searchTerm}&Limit=20`
      : `/Employee?Status=1&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    if (response.data?.success) {
      const newData = response.data.values || [];

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch employee list.",
    });
  } finally {
    setLoading(false); // 🔥 STOP LOADER (always)
  }
};

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  // ===============PUT and POST API ===================================

  const handleSubmitForm = async (data) => {
    try {
      setLoading(true);
      // ========================================
      // 1️⃣ Prepare Attachment FormData
      // ========================================
      const formData = new FormData();
      formData.append("DocEntry", data.AtcEntry || ""); // old or blank
      formData.append("UserId", user.UserId);
      formData.append("CreatedBy", user.UserName);
      formData.append("ModifiedBy", user.UserName);
      formData.append("CreatedDate", dayjs().format("YYYY-MM-DD"));
      formData.append("ModifiedDate", dayjs().format("YYYY-MM-DD"));
      formData.append("Status", "1");

      fileData.forEach((row, index) => {
        formData.append(
          `AttachmentLines[${index}].LineNum`,
          row.LineNum === "0" ? "" : row.LineNum
        );
        formData.append(
          `AttachmentLines[${index}].DocEntry`,
          row.DocEntry || ""
        );
        formData.append(`AttachmentLines[${index}].UserId`, user.UserId);
        formData.append(`AttachmentLines[${index}].CreatedBy`, user.UserName);
        formData.append(`AttachmentLines[${index}].ModifiedBy`, user.UserName);
        formData.append(
          `AttachmentLines[${index}].CreatedDate`,
          dayjs().format("YYYY-MM-DD")
        );
        formData.append(
          `AttachmentLines[${index}].ModifiedDate`,
          dayjs().format("YYYY-MM-DD")
        );
        formData.append(`AttachmentLines[${index}].Status`, "1");

        formData.append(
          `AttachmentLines[${index}].FileName`,
          row.FileName.substring(0, row.FileName.lastIndexOf(".")) ||
            row.FileName
        );

        formData.append(`AttachmentLines[${index}].FileExt`, row.FileExt);
        formData.append(`AttachmentLines[${index}].Description`, row.FileName);
        formData.append(`AttachmentLines[${index}].SrcPath`, "");

        if (row.File) {
          formData.append(`AttachmentLines[${index}].File`, row.File);
        }
      });

      let attachmentDocEntry = null;
      if (SaveUpdateName === "SAVE") {
        if (fileData.length > 0) {
          const attRes = await apiClient.post("/Attachment", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (!attRes.data.success) {
            Swal.fire({
              title: "Error!",
              text: attRes.data.message,
              icon: "error",
            });
            return;
          }

          attachmentDocEntry = attRes.data.ID;
        }
      }
      const getStatusNumber = (label) => {
        if (label === "Pending") return 1;
        if (label === "Approved") return 0;
        if (label === "Rejected") return 2;
        return 1; // default
      };
      const base64Image =
        PhotoData.length > 0
          ? PhotoData[0].base64.replace(/^data:image\/\w+;base64,/, "")
          : "";
      const obj = {
        DocEntry: data.DocEntry || 0,
        UserId: user.UserId || "",
        CreatedBy: user.UserName || "",
        CreatedDate: dayjs().format("YYYY-MM-DD"),
        ModifiedBy: user.UserName || "",
        ModifiedDate: dayjs().format("YYYY-MM-DD"),
        Status: Number(data.Status),
        EmpID: String(data.EmpID),

        // --- Employee Master Fields ---
        FirstName: data.FirstName || "",
        MiddleName: data.MiddleName,
        LastName: data.LastName || "",
        City: data.City || "",
        Country: data.Country || "",
        State: data.State || "",
        Manager: data.ManagerDocEntry || "0",
        OfficeTel: data.OfficeTel || "",
        Mobile: data.Mobile || "",
        Email: data.Email || "",
        StartDate: data.StartDate || null,
        Salary: Number(data.Salary) || 0,
        SalaryUnit: data.SalaryUnit || "",
        TermDate: data.TermDate || null,
        TermReason: data.TermReason || "",
        BankCode: data.BankCode || "",
        BankBranch: data.BankBranch || "",
        BankAcount: data.BankAcount || "",
        BirthDate: data.BirthDate || null,
        PassportNo: data.PassportNo || "",
        Remark: data.Remark || "",
        SalaryCurr: data.SalaryCurr || "",
        AtcEntry: attachmentDocEntry || data.AtcEntry || "0",
        Dept: String(data.Dept || "0"),
        Branch: String(data.Branch || "0"),
        Sex: data.Sex,
        JobTitle: data.JobTitle,
        Street: data.Street,
        Block: data.Block,
        Zip: data.Zip,
        Picture: base64Image || "",
        // --- Absence Collection ---
        oEmpAbsInfoLines: (data.oEmpAbsInfoLines || []).map((x, i) => ({
          LineNum: x.LineNum || 0,
          DocEntry: data.DocEntry || 0,
          UserId: user.UserId || "",
          CreatedBy: user.UserName || "",
          CreatedDate:
            dayjs(data.CreatedDate).format("YYYY-MM-DD") ||
            dayjs().format("YYYY-MM-DD"),
          ModifiedBy: user.UserName || "",
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          // Status: Number(x.Status) || 1,
          Status: getStatusNumber(x.RowStatus),
          FromDate:
            dayjs(x.FromDate, "DD/MM/YYYY").format("YYYY-MM-DD") || null,
          ToDate: x.ToDate
            ? dayjs(x.ToDate, "DD/MM/YYYY").format("YYYY-MM-DD")
            : dayjs(x.FromDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
          Reason: x.Reason || "",
          ApprovedBy: x.ApprovedBy || "",
          CnfrmrNum: Number(x.CnfrmrNum) || 0,
          Type: AbsenceTypes.find((t) => t.value === x.Type)?.key || 0,
          Duration: Duration.find((d) => d.value === x.Duration)?.key || "",
        })),

        // --- Review Collection ---
        oEmpReviewInfoLines: (data.oEmpReviewInfoLines || []).map((x, i) => ({
          LineNum: x.LineNum || 0,
          DocEntry: data.DocEntry || 0,
          UserId: user.UserId || "",
          CreatedBy: user.UserName || "",
          CreatedDate:
            dayjs(data.CreatedDate).format("YYYY-MM-DD") ||
            dayjs().format("YYYY-MM-DD"),
          ModifiedBy: user.UserName || "",
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          Status: 1,

          Date: dayjs(x.Date, "DD/MM/YYYY").format("YYYY-MM-DD") || null,
          ReviewDesc: x.ReviewDesc || "",
          Manager: Number(x.ReviewManagerDocEntry) || "0",
          ManagerName: x.Manager,
          Grade: x.Grade || "",
          Remarks: x.remarks || "",
        })),

        // --- Leave Collection ---
        oEmpLeaveInfoLines: (data.oEmpLeaveInfoLines || []).map((x, i) => ({
          LineNum: x.LineNum || 0,
          DocEntry: data.DocEntry || 0,
          UserId: user.UserId || "",
          CreatedBy: user.UserName || "",
          CreatedDate:
            dayjs(data.CreatedDate).format("YYYY-MM-DD") ||
            dayjs().format("YYYY-MM-DD"),
          ModifiedBy: user.UserName || "",
          ModifiedDate: dayjs().format("YYYY-MM-DD"),
          Status: 1,

          LeaveYear: Number(x.LeaveYear) || 0,
          AbsenceType:
            AbsenceTypes.find((t) => t.value === x.AbsenceType)?.key || 0,
          TotalLeave: Number(x.TotalLeave) || 0,
          LeaveTaken: Number(x.LeaveTaken) || 0,
          LeaveRemaining: Number(x.LeaveRemaining) || 0,
          // LastUpdated: x.LastUpdated || null,
          //         LastUpdated: x.LastUpdated
          // ? dayjs(x.LastUpdated, "DD/MM/YYYY").toISOString()
          // : null,
          LastUpdated: x.LastUpdated
            ? dayjs(x.LastUpdated, "DD/MM/YYYY").format("YYYY-MM-DD")
            : null,
          Remarks: x.remarks || "",
        })),
        oEmpLeaveApprovalInfoLines: (data.oEmpLeaveApprovalInfoLines || []).map(
          (x, i) => ({
            LineNum: x.LineNum || 0,
            DocEntry: data.DocEntry || 0,
            FirstName: data.FirstName || "",
            LastName: data.LastName || "",
            FromDate:
              dayjs(x.FromDate, "DD/MM/YYYY").format("YYYY-MM-DD") || null,
            ToDate: x.ToDate
              ? dayjs(x.ToDate, "DD/MM/YYYY").format("YYYY-MM-DD")
              : dayjs(x.FromDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
            Type:
              String(AbsenceTypes.find((t) => t.value === x.Type)?.key) || "0",
            Duration: Duration.find((d) => d.value === x.Duration)?.key || "",
            Days: X.Days || 0,
            Status: getStatusNumber(x.Status),
            Manager: x.Manager,
          })
        ),
      };

      if (SaveUpdateName === "SAVE") {
        const res = await apiClient.post(`/Employee`, obj);
        if (res.data.success) {
          clearFormData();
          fetchOpenListData(0);
          setOpenListPage(0);
          setOpenListData([]);
          fetchClosedListData(0);
          setClosedListPage(0);
          setClosedListData([]);
          getRoleDataList();

          Swal.fire({
            title: "Success!",
            text: "Employee Master Saved Successfully",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
          const userChoice = await Swal.fire({
            title: "Create User?",
            text: "Do you want to create a login user for this employee?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
          });

          // Step 2: If YES → open user creation dialog
          if (userChoice.isConfirmed) {
            setValueUser("FirstName", obj.FirstName || "");
            setValueUser("LastName", obj.LastName || "");
            setValueUser("Email", obj.Email || "");
            setOpenCreateUserDialog(true);
            return;
          }
        } else {
          if (attachmentDocEntry) {
            await apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          }
          Swal.fire({
            title: "Error!",
            text: res.data.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        // ✅ UPDATE flow
        const result = await Swal.fire({
          text: `Do You Want to Update "${obj.FirstName}"?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          if (SaveUpdateName === "UPDATE") {
            // Case A: Employee already has an attachment
            if (data.AtcEntry > 0) {
              await apiClient.put(`/Attachment/${data.AtcEntry}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });

              attachmentDocEntry = data.AtcEntry;
            }

            // Case B: Employee had no attachment earlier but now new files added
            else if (fileData.length > 0) {
              const attRes = await apiClient.post("/Attachment", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });

              if (!attRes.data.success) {
                Swal.fire({
                  title: "Error!",
                  text: attRes.data.message,
                  icon: "error",
                });
                return;
              }

              attachmentDocEntry = attRes.data.ID;
            }

            obj.AtcEntry = attachmentDocEntry || data.AtcEntry || "0";
          }

          const response = await apiClient.put(
            `/Employee/${data.DocEntry}`,
            obj
          );
          if (response.data.success) {
            clearFormData();
            fetchOpenListData(0);
            setOpenListPage(0);
            setOpenListData([]);
            fetchClosedListData(0);
            setClosedListPage(0);
            setClosedListData([]);
            Swal.fire({
              title: "Success!",
              text: "Employee Master Updated Successfully",
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
        } else {
          Swal.fire({
            text: "Employee Master Not Updated",
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
        text: "Something went wrong: " + (error.message || error),
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  // ===============Delete API ===================================
const handleOnDelete = async (row) => {
  try {
    const result = await Swal.fire({
      text: "Do you want to delete?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        title: "Cancelled",
        text: "Employee Master is not deleted",
        icon: "warning",
        timer: 1000,
      });
      return;
    }

    setLoading(true);

    const docEntry = row?.DocEntry || DocEntry;

    const response = await apiClient.delete(`/Employee/${docEntry}`);
    const { success, message } = response.data;

    if (success) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);

      await fetchOpenListData(0); // ⬅ wait

      Swal.fire({
        title: "Success!",
        text: "Employee Master Deleted",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Error",
        text: message || "Delete failed",
        icon: "info",
      });
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    Swal.fire({
      title: "Error!",
      text: "An error occurred while deleting the Employee Master.",
      icon: "error",
    });
  } finally {
    setLoading(false);
  }
};

  // ============================================Closed List Start ==================================================================
 const fetchClosedListData = async (pageNum, searchTerm = "") => {
  try {
    setLoading(true);

    const url = searchTerm
      ? `/Employee?Status=0&Page=${pageNum}&SearchText=${searchTerm}&Limit=20`
      : `/Employee?Status=0&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    if (response?.data?.success) {
      const newData = response.data.values || [];

      setHasMoreClosed(newData.length === 20);

      setClosedListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      // Backend returned success = false
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: response?.data?.message || "Failed to fetch closed employees.",
      });
    }
  } catch (error) {
    console.error("Error fetching closed employees:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while fetching closed employees.",
    });
  } finally {
    setLoading(false);
  }
};


  // Handle search input
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

  // Clear search
  const handleClosedListClear = () => {
    setClosedListQuery(""); // Clear search input
    setClosedListSearching(false); // Reset search state
    setClosedListPage(0); // Reset page count
    setClosedListData([]); // Clear data
    fetchClosedListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreClosedListData = () => {
    fetchClosedListData(
      closedListPage + 1,
      closedListSearching ? closedListquery : ""
    );
    setClosedListPage((prev) => prev + 1);
  };
  useEffect(() => {
    fetchClosedListData(0); // Load first page on mount
  }, []);
  const absenceInfoDisabled =
    (getValues("oEmpLeaveInfoLines") || []).length === 0;
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
          Employee List
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
                      title={`${item.FirstName} ${item.LastName}`}
                      // subtitle={item.LastName}
                      searchResult={openListquery}
                      isSelected={selectedData === item.DocEntry}
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
                      title={`${item.FirstName} ${item.LastName}`}
                      // subtitle={item.GroupType === "C" ? "Customer" : "Vendor"}
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

      <SearchModel
        open={searchmodelOpen}
        onClose={SearchModelClose}
        onCancel={SearchModelClose}
        title="Select Manager"
        onChange={(e) => handleGetListSearch(e.target.value)}
        value={getListquery}
        onClickClear={handleGetListClear}
        cardData={
          <>
            <InfiniteScroll
              style={{
                textAlign: "center",
                justifyContent: "center",
              }}
              dataLength={getListData.length}
              next={fetchMoreGetListData}
              hasMore={hasMoreGetList}
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
              {getListData.map((item, index) => {
                const isSelf = item.DocEntry === selectedData;

                return (
                  <CardComponent
                    key={index}
                    title={`${item.FirstName} ${item.LastName}`}
                    searchResult={getListquery}
                    sx={{
                      opacity: isSelf ? 0.5 : 1, // Visual fade
                      cursor: isSelf ? "not-allowed" : "pointer",
                    }}
                    onClick={() => {
                      if (isSelf) {
                        Swal.fire({
                          icon: "warning",
                          title: "Not Allowed",
                          text: "You cannot select yourself as Manager.",
                        });
                        return;
                      }

                      onSelectManager({
                        DocEntry: item.DocEntry,
                        FirstName: item.FirstName,
                        LastName: item.LastName,
                      });
                    }}
                  />
                );
              })}
            </InfiniteScroll>
          </>
        }
      />
      <Dialog
        open={openDepartment}
        onClose={handleClose}
        maxWidth={false} // disable default limit
        fullWidth={false} // we will control width manually
        sx={{
          "& .MuiDialog-paper": {
            width: "800px", // ⬅️ increase width here
            maxWidth: "800px",
            height: "650px", // ⬅️ increase height here
            maxHeight: "650px",
            borderRadius: "12px",
          },
        }}
      >
        {/* 🔹 Dialog Title with Close Icon */}
        <DialogTitle
          sx={{
            textAlign: "center",
            position: "relative",
            fontWeight: "bold",
          }}
        >
          <IconButton
            onClick={() => {
              setSelectedDepartmentRowId(null);
              resetDepartment(initialDepartmentData);
            }}
            sx={{
              position: "absolute",
              left: 8,
              top: 8,
            }}
            size="small"
          >
            <AddIcon />
          </IconButton>
          Department
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <form onSubmit={HandleDepartmentForm(handleAddOrUpdate)}>
            <Grid container spacing={2} alignItems="center" mt={2}>
              <Grid item xs={8}>
                <Controller
                  name="Name"
                  control={ControlDepartment}
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <InputFields
                        {...field}
                        label="DEPARTMENT"
                        variant="outlined"
                        fullWidth
                        error={!!error}
                        helperText={error ? error.message : ""}
                      />
                    );
                  }}
                />
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary">
                  {selectedDepartmentRowId ? "UPDATE" : "ADD"}
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* 🔹 DataGrid with scrollable rows only */}
          <Grid
            item
            xs={12}
            sx={{
              flexGrow: 1,
              marginTop: "15px",
            }}
          >
            <DataGrid
              className="datagrid-style"
              rows={DepartmentList.map((data, index) => ({
                ...data,
                id: data.id || index + 1,
              }))}
              columns={columns}
              pageSize={5}
              hideFooter
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              slots={{
                toolbar: CustomToolbar,
              }}
              sx={{
                height: "350px",
                "& .MuiDataGrid-virtualScroller": {
                  overflowY: "auto !important",
                },
                "& .MuiDataGrid-columnHeaders": {
                  position: "sticky",
                  top: 0,
                  backgroundColor: "white",
                  zIndex: 2,
                },
              }}
            />
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openBranch}
        onClose={handleBranchClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "800px", // ⬅️ increase width here
            maxWidth: "800px",
            height: "650px", // ⬅️ increase height here
            maxHeight: "650px",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            position: "relative",
            fontWeight: "bold",
          }}
        >
          {/* 🔹 Add Icon at Top-Left */}
          <IconButton
            onClick={() => {
              setSelectedBranchRowId(null);
              resetBranch(initialBranchData);
            }}
            sx={{
              position: "absolute",
              left: 8,
              top: 8,
            }}
            size="small"
          >
            <AddIcon />
          </IconButton>
          Branch
          {/* 🔹 Close Icon at Top-Right */}
          <IconButton
            onClick={handleBranchClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <form onSubmit={HandleBranchForm(handleAddOrUpdateBranch)}>
            <Grid container spacing={2} alignItems="center" mt={2}>
              <Grid item xs={8}>
                <Controller
                  name="Name"
                  control={ControlBranch}
                  rules={{ required: "This field is required" }}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <InputFields
                        {...field}
                        label="BRANCH"
                        variant="outlined"
                        fullWidth
                        error={!!error}
                        helperText={error ? error.message : ""}
                      />
                    );
                  }}
                />
              </Grid>

              <Grid item>
                <Button type="submit" variant="contained" color="primary">
                  {selectedBranchRowId ? "UPDATE" : "ADD"}
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* 🔹 DataGrid */}
          <Grid
            item
            xs={12}
            sx={{
              flexGrow: 1,
              marginTop: "15px",
            }}
          >
            <DataGrid
              className="datagrid-style"
              rows={BranchList.map((data, index) => ({
                ...data,
                id: data.id || index + 1,
              }))}
              columns={Branchcolumns}
              pageSize={5}
              hideFooter
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              slots={{
                toolbar: CustomToolbar, // 🔍 Searchbar added
              }}
              sx={{
                height: "310px",
                "& .MuiDataGrid-virtualScroller": {
                  overflowY: "auto !important",
                },
                "& .MuiDataGrid-columnHeaders": {
                  position: "sticky",
                  top: 0,
                  backgroundColor: "white",
                  zIndex: 2,
                },
              }}
            />
          </Grid>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openCreateUserDialog}
        onClose={handleUserClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "600px",
            height: "500px",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            position: "relative",
            fontWeight: "bold",
          }}
        >
          {/* 🔹 Add Icon at Top-Left */}
          User
          {/* 🔹 Close Icon at Top-Right */}
          <IconButton
            onClick={() => {
              resetUser(initialUserData);
            }}
            sx={{
              position: "absolute",
              left: 8,
              top: 8,
            }}
            size="small"
          >
            <AddIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <form
            id="user-form-id"
            onSubmit={HandleUserForm(handleAddUser)}
            autoComplete="off"
          >
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item md={6} xs={12} textAlign="center">
                <Controller
                  name="UserName"
                  control={ControlUser}
                  rules={{
                    required: "User Name is required",
                    validate: (value) =>
                      value.trim() !== "" || "User Name cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="USERNAME"
                      // disabled={!!DocEntry}
                      type="text"
                      autoComplete="off"
                      {...field}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item md={6} xs={12} textAlign="center">
                <Controller
                  name="Password"
                  control={ControlUser}
                  rules={{
                    required: "Password is required",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <InputTextField
                        label="PASSWORD"
                        type="password"
                        autoComplete="new-password"
                        {...field}
                        error={!!error}
                        helperText={error ? error.message : null}
                      />
                    </>
                  )}
                />
              </Grid>

              <Grid item md={6} xs={12} textAlign="center">
                <Controller
                  name="Email"
                  control={ControlUser}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="EMAIL"
                      type="text"
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item md={6} xs={12} textAlign="center">
                <Controller
                  name="RoleId"
                  control={ControlUser}
                  rules={{ required: "Role is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      label="ROLE"
                      {...field}
                      data={RoleData}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedRole(e.target.value);
                      }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item md={6} xs={12} textAlign="center">
                <Controller
                  name="FirstName"
                  control={ControlUser}
                  rules={{ required: "First Name is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="FIRSTNAME"
                      type="text"
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item md={6} xs={12} textAlign="center">
                <Controller
                  name="LastName"
                  control={ControlUser}
                  rules={{ required: "Last Name is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="LASTNAME"
                      type="text"
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item md={6} xs={12} textAlign="center">
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Controller
                    name="PhoneNumber"
                    control={ControlUser}
                    render={({ field }) => (
                      <PhoneNumberInput
                        name="PhoneNumber"
                        defaultCountry="in"
                        label="PHONE NUMBER"
                        value={field.value}
                        onChange={(phone) => field.onChange(phone)}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        {/* LEFT ALIGNED SAVE BUTTON */}
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* LEFT SIDE - SAVE BUTTON */}
          <Button
            variant="contained"
            type="submit"
            form="user-form-id"
            color="success"
            sx={{
              width: "170px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            SAVE
          </Button>

          {/* RIGHT SIDE - CANCEL BUTTON */}
          <Button
            variant="contained"
            color="error"
            sx={{
              width: "170px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
            onClick={() => setOpenCreateUserDialog(false)}
          >
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
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
              Employee Master
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
              <Grid item xs={12}>
                {/* <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}> */}
                {/* ------------------ TABS ------------------ */}
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  sx={{ mb: 2 }}
                  variant="scrollable"
                >
                  <Tab label="General" />
                  <Tab
                    label="Absence Info"
                    disabled={SaveUpdateName === "SAVE" || absenceInfoDisabled}
                  />
                  <Tab label="Reviews" disabled={SaveUpdateName === "SAVE"} />
                  <Tab label="Leave Info" />
                  <Tab label="Leave Approval" />
                  <Tab label="Attachments" />
                </Tabs>

                {/* ------------------ TAB PANELS ------------------ */}
                {activeTab === 0 && (
                  <Box width={"100%"} autoComplete="off">
                    <Grid container spacing={2}>
                      {/* -------------------- PERSONAL INFORMATION -------------------- */}
                      <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="h6" mb={2}>
                            Personal Information
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            <Grid item xs={12} textAlign={"center"}>
                              {PhotoData.length > 0 ? (
                                <Grid
                                  container
                                  spacing={2}
                                  justifyContent="center"
                                >
                                  {PhotoData.map((data, index) => {
                                    const fileType = data.type;
                                    const imgURL = data.base64;

                                    return (
                                      <Grid
                                        item
                                        key={index}
                                        xs={12}
                                        sm={6}
                                        md={4}
                                        lg={3}
                                      >
                                        <Box
                                          position="relative"
                                          border="1px solid #ddd"
                                          borderRadius={2}
                                          overflow="hidden"
                                          boxShadow={1}
                                          sx={{
                                            backgroundColor: "#fff",
                                            padding: 1,
                                            width: 180, // small width
                                            height: 200, // small height
                                            aspectRatio: "3 / 4",
                                            objectFit: "cover", // ensures image fits properly
                                            borderRadius: "4px",
                                            mx: "auto",
                                          }}
                                        >
                                          {fileType.startsWith("image/") ? (
                                            <Box
                                              sx={{
                                                width: "100%",
                                                aspectRatio: "auto",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                overflow: "hidden",
                                                cursor: "pointer",
                                              }}
                                              onClick={() =>
                                                openFileinNewTab(data)
                                              }
                                            >
                                              <Box
                                                component="img"
                                                src={imgURL}
                                                alt={`preview-${index}`}
                                                sx={{
                                                  width: "100%",
                                                  height: "100%",
                                                  objectFit: "cover",
                                                }}
                                              />
                                            </Box>
                                          ) : (
                                            <Box
                                              onClick={() =>
                                                openFileinNewTab(data)
                                              }
                                              sx={{
                                                padding: 2,
                                                textAlign: "center",
                                                cursor: "pointer",
                                              }}
                                            >
                                              <DescriptionIcon
                                                sx={{
                                                  fontSize: 40,
                                                  color: "#666",
                                                }}
                                              />
                                              <Typography
                                                variant="body2"
                                                mt={1}
                                                noWrap
                                              >
                                                {data.name}
                                              </Typography>
                                            </Box>
                                          )}
                                          <RemoveCircleOutlineIcon
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePhotoRemove();
                                            }}
                                            sx={{
                                              position: "absolute",
                                              top: 8,
                                              right: 8,
                                              color: "red",
                                              cursor: "pointer",
                                              backgroundColor: "#fff",
                                              borderRadius: "50%",
                                              boxShadow: 1,
                                            }}
                                          />
                                        </Box>
                                      </Grid>
                                    );
                                  })}
                                </Grid>
                              ) : UserPhoto ? (
                                <Box
                                  position="relative"
                                  border="1px solid #ddd"
                                  borderRadius={2}
                                  overflow="hidden"
                                  boxShadow={1}
                                  sx={{
                                    width: 150,
                                    height: 150,

                                    margin: "0 auto",
                                    backgroundColor: "#fff",
                                    padding: 1,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    window.open(UserPhoto, "_blank")
                                  }
                                >
                                  <Box
                                    component="img"
                                    src={UserPhoto}
                                    alt="User Photo"
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: 2,
                                    }}
                                  />
                                </Box>
                              ) : (
                                <div></div>
                              )}

                              <Box
                                mt={2}
                                mb={2}
                                display="inline-block"
                                border="1px dashed #aaa"
                                borderRadius={2}
                                padding={0.2}
                                // sx={{ backgroundColor: "#f9f9f9" }}
                              >
                                <label htmlFor="photo-upload">
                                  <input
                                    id="photo-upload"
                                    type="file"
                                    style={{ display: "none" }}
                                    onChange={handlePhotoChange}
                                  />
                                  <Box
                                    component="span"
                                    sx={{
                                      padding: "6px 12px",
                                      border: "1px solid #ccc",
                                      borderRadius: "4px",
                                      // backgroundColor: "#fff",
                                      cursor: "pointer",
                                      display: "inline-block",
                                      fontSize: "14px",
                                    }}
                                  >
                                    Add Photo
                                  </Box>
                                </label>
                              </Box>
                            </Grid>
                            {/* <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="EmpID"
                                control={control}
                                rules={{
                                  required: "Employee Code is required",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Employee Code"
                                    type="text"
                                    {...field}
                                    inputProps={{ maxLength: 20 }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid> */}

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="FirstName"
                                control={control}
                                rules={{
                                  required: "First Name is required",
                                  validate: (value) =>
                                    value.trim() !== "" ||
                                    "First Name cannot be empty",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="First Name"
                                    type="text"
                                    {...field}
                                    inputProps={{ maxLength: 50 }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="MiddleName"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Middle Name"
                                    type="text"
                                    {...field}
                                    inputProps={{ maxLength: 50 }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="LastName"
                                control={control}
                                rules={{
                                  required: "Last Name is required",
                                  validate: (value) =>
                                    value.trim() !== "" ||
                                    "Last Name cannot be empty",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Last Name"
                                    type="text"
                                    {...field}
                                    inputProps={{ maxLength: 50 }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Sex"
                                control={control}
                                defaultValue="1"
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    {...field}
                                    label="Gender"
                                    data={[
                                      { key: "M", value: "MALE" },
                                      { key: "F", value: "FEMALE" },
                                    ]}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="BirthDate"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <SelectedDatePickerField
                                    label="Date of Birth"
                                    name={field.name}
                                    value={
                                      field.value
                                        ? dayjs(field.value)
                                        : undefined
                                    }
                                    onChange={(date) => {
                                      field.onChange(
                                        date ? date.toISOString : undefined
                                      );
                                      setValue("BirthDate", date);
                                    }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              container
                              justifyContent="center"
                              alignItems="center"
                            >
                              <Controller
                                name="Status"
                                control={control}
                                defaultValue="1"
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        {...field}
                                        checked={field.value === "1"} // checkbox state
                                        onChange={(e) => {
                                          const value = e.target.checked
                                            ? "1"
                                            : "0";
                                          field.onChange(value); // update RHF field
                                        }}
                                      />
                                    }
                                    label="Active"
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* -------------------- CONTACT INFORMATION -------------------- */}
                      <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="h6" mb={2}>
                            Contact Information
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            <Grid item xs={12} sm={6} md={4}>
                              <Box display="flex" justifyContent="center">
                                <Controller
                                  name="OfficeTel"
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <PhoneNumberInput
                                      defaultCountry="in"
                                      label="Office Phone"
                                      value={field.value}
                                      onChange={(phone) =>
                                        field.onChange(phone)
                                      }
                                    />
                                  )}
                                />
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                              <Box display="flex" justifyContent="center">
                                <Controller
                                  name="Mobile"
                                  control={control}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <PhoneNumberInput
                                      defaultCountry="in"
                                      label="Mobile Phone"
                                      value={field.value}
                                      onChange={(phone) =>
                                        field.onChange(phone)
                                      }
                                    />
                                  )}
                                />
                              </Box>
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Email"
                                rules={{
                                  // required: "This field is required",
                                  pattern: {
                                    value:
                                      /^[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/,
                                    message:
                                      "Please enter a valid Email address with only letters, numbers, @, and .",
                                  },
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="E-MAIL"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* -------------------- JOB DETAILS -------------------- */}
                      <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="h6" mb={2}>
                            Job Details
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="JobTitle"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Job Title"
                                    type="text"
                                    {...field}
                                    inputProps={{ maxLength: 50 }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

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
                                name="Dept"
                                control={control}
                                // rules={{ required: "Department is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <>
                                    <InputSearchableSelect
                                      {...field}
                                      label="Department"
                                      error={!!error}
                                      helperText={error?.message}
                                      data={DepartmentList.map((item) => ({
                                        key: item.DocEntry,
                                        value: item.Name,
                                      }))}
                                    />

                                    {/* OUTSIDE ICON */}
                                    <IconButton
                                      onClick={HandlePDepartmentOpen}
                                      size="small"
                                      sx={{
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
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              gap={1}
                            >
                              <Controller
                                name="Branch"
                                control={control}
                                // rules={{ required: "Branch is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <>
                                    <InputSearchableSelect
                                      {...field}
                                      label="Branch"
                                      error={!!error}
                                      helperText={error?.message}
                                      data={BranchList.map((item) => ({
                                        key: item.DocEntry,
                                        value: item.Name,
                                      }))}
                                    />
                                    {/* OUTSIDE ICON */}
                                    <IconButton
                                      onClick={HandleBranchOpen}
                                      size="small"
                                      sx={{
                                        // backgroundColor: "#00AEEF",
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
                            {/* <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Branch"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Branch"
                                    type="text"
                                    {...field}
                                    inputProps={{ maxLength: 50 }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid> */}

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Manager"
                                control={control}
                                // rules={{ required: "Manager is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    {...field}
                                    label="Manager"
                                    readOnly={true}
                                    type="text"
                                    onKeyDown={(e) => {
                                      if (e.key === "Backspace") {
                                        e.preventDefault();

                                        setValue("Manager", "", {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                        });
                                      } else {
                                        e.preventDefault();
                                      }
                                    }}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <IconButton
                                            onClick={() =>
                                              OpenDailog("Manager")
                                            }
                                            size="small"
                                            color="primary"
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
                                    error={!!error} // Pass error state to the FormComponent if needed
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Salary"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Salary"
                                    type="number"
                                    {...field}
                                    inputProps={{ maxLength: 50 }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="SalaryCurr"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    label="Salary Currency"
                                    {...field}
                                    data={currencydata.map((item) => ({
                                      key: item.CurrCode,
                                      value: item.CurrName,
                                    }))}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* -------------------- ADDRESS DETAILS -------------------- */}
                      <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="h6" mb={2}>
                            Address Details
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Street"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Street"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Block"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Block"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Zip"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Zip Code"
                                    {...field}
                                    type="number"
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="City"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="City"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Country"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    {...field}
                                    label="Country"
                                    data={listofcountry.map((item) => ({
                                      key: item.CountryCode,
                                      value: item.CountryName,
                                    }))}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="State"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    {...field}
                                    label="State"
                                    data={Outerlistofstate.map((item) => ({
                                      key: item.Code,
                                      value: item.Name,
                                    }))}
                                    disabled={!getValues("Country")}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* -------------------- BANK DETAILS -------------------- */}
                      <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="h6" mb={2}>
                            Bank Details
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="BankCode"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    label="Bank"
                                    {...field}
                                    data={BankCode.map((item) => ({
                                      key: item.DocEntry,
                                      value: item.BankName,
                                    }))}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="BankBranch"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Branch"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="BankAcount"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Account No."
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* -------------------- EMPLOYMENT DATES -------------------- */}
                      <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="h6" mb={2}>
                            Employment Dates
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="StartDate"
                                control={control}
                                // rules={{ required: "Start Date is Required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <SelectedDatePickerField
                                    label="Start Date"
                                    name={field.name}
                                    value={
                                      field.value
                                        ? dayjs(field.value)
                                        : undefined
                                    }
                                    onChange={(date) => {
                                      const localISO = date
                                        ? dayjs(date).format(
                                            "YYYY-MM-DDT00:00:00"
                                          )
                                        : undefined;
                                      field.onChange(localISO);
                                      setValue("StartDate", localISO);
                                    }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TermDate"
                                control={control}
                                render={({ field, fieldState: { error } }) => {
                                  const startDateValue = getValues("StartDate"); // Get current StartDate
                                  const minDate = startDateValue
                                    ? dayjs(startDateValue)
                                    : null;

                                  return (
                                    <SelectedDatePickerField
                                      label="Termination Date"
                                      name={field.name}
                                      value={
                                        field.value
                                          ? dayjs(field.value)
                                          : undefined
                                      }
                                      onChange={(date) => {
                                        const localISO = date
                                          ? dayjs(date).format(
                                              "YYYY-MM-DDT00:00:00"
                                            )
                                          : undefined;
                                        field.onChange(localISO);
                                        setValue("TermDate", localISO);
                                      }}
                                      error={!!error}
                                      helperText={error?.message}
                                      disabled={!startDateValue} // disable if StartDate not selected
                                      minDate={minDate} // prevent selecting date before StartDate
                                    />
                                  );
                                }}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TermReason"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Termination Reason"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* -------------------- OTHER DETAILS -------------------- */}
                      <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                          <Typography variant="h6" mb={2}>
                            Additional Information
                          </Typography>

                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="PassportNo"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Passport No."
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Remark"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Remarks"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {/* --- ABSENCE INFO --- */}
                {activeTab === 1 && (
                  <Box>
                    <Button
                      variant="contained"
                      sx={{ mb: 2 }}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingIndex(null);
                        setOpenAbsenceModal(true);
                      }}
                    >
                      Add Absence
                    </Button>

                    <DataGrid
                      className="datagrid-style"
                      rows={(getValues("oEmpAbsInfoLines") || []).map(
                        (row, index) => ({
                          ...row,
                          id: index + 1,
                        })
                      )}
                      columns={absenceColumns}
                      sx={{
                        height: "60vh",

                        minWidth: 600, // triggers horizontal scroll if columns are wide
                        backgroundColor:
                          theme.palette.mode === "light" ? "#fff" : "#373842",
                        "& .MuiDataGrid-cell": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell:focus": {
                          outline: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          backgroundColor: "red",
                          fontWeight: "bold",
                        },
                      }}
                    />

                    <Dialog
                      open={openAbsenceModal}
                      onClose={() => {
                        setOpenAbsenceModal(false);
                        resetAbsenceModalFields();
                      }}
                      maxWidth="md"
                      fullWidth
                    >
                      {/* Title Centered */}
                      <DialogTitle
                        sx={{ textAlign: "center", fontWeight: "bold" }}
                      >
                        {editingIndex !== null ? "Edit Absence" : "Add Absence"}
                      </DialogTitle>

                      <DialogContent>
                        <Box mt={1}>
                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="Duration"
                                control={control}
                                render={({ field }) => (
                                  <InputSelectTextField
                                    {...field}
                                    label="Duration Type"
                                    data={Duration}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      field.onChange(newValue);

                                      // CLEAR ToDate when Duration = 1 or 2
                                      if (newValue === 1 || newValue === 2) {
                                        setValue("ToDate", null);
                                      }
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="FromDate"
                                control={control}
                                rules={{ required: "From Date is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <SelectedDatePickerField
                                    label="From Date"
                                    value={
                                      field.value
                                        ? dayjs(field.value)
                                        : undefined
                                    }
                                    onChange={(date) => {
                                      field.onChange(
                                        date ? date.toISOString : undefined
                                      );
                                      setValue("FromDate", date);
                                    }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="ToDate"
                                control={control}
                                rules={{ required: "To Date is required" }}
                                render={({ field, fieldState: { error } }) => {
                                  const durationValue = watch("Duration"); // get current Duration value
                                  const isEnabled = durationValue === 3; // enable only if Duration is "3"
                                  const FromDateValue = watch("FromDate"); // Get current StartDate
                                  const minDate = FromDateValue
                                    ? dayjs(FromDateValue)
                                    : null;
                                  return (
                                    <SelectedDatePickerField
                                      label="To Date"
                                      value={
                                        field.value
                                          ? dayjs(field.value)
                                          : undefined
                                      }
                                      onChange={(date) => {
                                        field.onChange(
                                          date ? date.toISOString : undefined
                                        );
                                        setValue("ToDate", date);
                                      }}
                                      minDate={minDate}
                                      error={!!error}
                                      helperText={error?.message}
                                      disabled={!isEnabled} // disable if Duration !== "3"
                                    />
                                  );
                                }}
                              />
                            </Grid>

                            {/* Row 2 */}
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="Reason"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField {...field} label="Reason" />
                                )}
                              />
                            </Grid>

                            {/* <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="ApprovedBy"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Approved By"
                                    readOnly
                                    disabled
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid> */}

                            {/* <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="CnfrmrNum"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    {...field}
                                    type="number"
                                    label="Confirmer Number"
                                  />
                                )}
                              />
                            </Grid> */}

                            {/* Row 3 */}
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="Type"
                                control={control}
                                render={({ field }) => (
                                  <InputSelectTextField
                                    {...field}
                                    label="Absence Type"
                                    data={AbsenceTypes}
                                  />
                                )}
                              />
                            </Grid>

                            {/* BUTTONS ROW */}
                            {/* BUTTONS ROW */}
                            <Grid
                              item
                              xs={12}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 2,
                              }}
                            >
                              {/* Save - Success */}

                              <Button
                                variant="contained"
                                color="success"
                                sx={{ width: "150px" }}
                                onClick={onSubmitAbsence}
                              >
                                Save
                              </Button>

                              {/* Close - Error */}
                              <Button
                                variant="contained"
                                color="error"
                                sx={{ width: "150px" }}
                                onClick={() => setOpenAbsenceModal(false)}
                              >
                                Close
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </DialogContent>
                    </Dialog>
                  </Box>
                )}

                {/* --- REVIEWS --- */}
                {activeTab === 2 && (
                  <Box>
                    <Button
                      variant="contained"
                      sx={{ mb: 2 }}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingReviewIndex(null);
                        resetReviewModalFields();
                        setOpenReviewModal(true);
                      }}
                    >
                      Add Review
                    </Button>

                    <DataGrid
                      className="datagrid-style"
                      rows={(getValues("oEmpReviewInfoLines") || []).map(
                        (row, index) => ({
                          ...row,
                          id: index + 1,
                        })
                      )}
                      columns={reviewColumns}
                      sx={{
                        height: "60vh",

                        minWidth: 600, // triggers horizontal scroll if columns are wide
                        backgroundColor:
                          theme.palette.mode === "light" ? "#fff" : "#373842",
                        "& .MuiDataGrid-cell": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell:focus": {
                          outline: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          backgroundColor: "red",
                          fontWeight: "bold",
                        },
                      }}
                    />

                    <Dialog
                      open={openReviewModal}
                      onClose={() => setOpenReviewModal(false)}
                      maxWidth="md"
                      fullWidth
                    >
                      {/* Title Centered */}
                      <DialogTitle
                        sx={{ textAlign: "center", fontWeight: "bold" }}
                      >
                        {editingReviewIndex !== null
                          ? "Edit Review"
                          : "Add Review"}
                      </DialogTitle>

                      <DialogContent>
                        <Box mt={1}>
                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            {/* Row 1 - 3 fields */}
                            {/* <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="EmpID"
                                control={control}
                                rules={{
                                  required: "Employee Code is required",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    {...field}
                                    label="Employee Code"
                                    type="text"
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid> */}

                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="Date"
                                control={control}
                                rules={{ required: "Date is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <SelectedDatePickerField
                                    label="Date"
                                    value={
                                      field.value
                                        ? dayjs(field.value)
                                        : undefined
                                    }
                                    onChange={(date) => {
                                      field.onChange(
                                        date ? date.toISOString : undefined
                                      );
                                      setValue("Date", date);
                                    }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="ReviewManager"
                                rules={{ required: "This field is required" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextSearchButton
                                    label="Manager"
                                    readOnly
                                    onClick={() => OpenDailog("ReviewManager")}
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="ReviewDesc"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    {...field}
                                    label="Description"
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="Grade"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField {...field} label="Grade" />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="Remarks"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField {...field} label="Remarks" />
                                )}
                              />
                            </Grid>

                            {/* BUTTONS ROW */}
                            {/* BUTTONS ROW */}
                            <Grid
                              item
                              xs={12}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 2,
                              }}
                            >
                              {/* Save - Success */}

                              <Button
                                variant="contained"
                                color="success"
                                sx={{ width: "150px" }}
                                onClick={onSubmitReview}
                              >
                                Save
                              </Button>

                              {/* Close - Error */}
                              <Button
                                variant="contained"
                                color="error"
                                sx={{ width: "150px" }}
                                onClick={() => setOpenReviewModal(false)}
                              >
                                Close
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </DialogContent>
                    </Dialog>
                  </Box>
                )}

                {/* --- LEAVE INFO --- */}
                {activeTab === 3 && (
                  <Box>
                    <Button
                      variant="contained"
                      sx={{ mb: 2 }}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingLeaveIndex(null);
                        setOpenLeaveModal(true);
                        resetLeaveModalFields();
                      }}
                    >
                      Add Leave Entry
                    </Button>

                    <DataGrid
                      className="datagrid-style"
                      rows={(getValues("oEmpLeaveInfoLines") || []).map(
                        (row, index) => ({
                          ...row,
                          id: index + 1,
                        })
                      )}
                      columns={leaveColumns}
                      sx={{
                        height: "60vh",
                        minWidth: 600, // triggers horizontal scroll if columns are wide
                        backgroundColor:
                          theme.palette.mode === "light" ? "#fff" : "#373842",
                        "& .MuiDataGrid-cell": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell:focus": {
                          outline: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          backgroundColor: "red",
                          fontWeight: "bold",
                        },
                      }}
                    />

                    <Dialog
                      open={openLeaveModal}
                      onClose={() => setOpenLeaveModal(false)}
                      maxWidth="md"
                      fullWidth
                    >
                      {/* Title Centered */}
                      <DialogTitle
                        sx={{ textAlign: "center", fontWeight: "bold" }}
                      >
                        {editingLeaveIndex !== null
                          ? "Edit Leave"
                          : "Add Leaves"}
                      </DialogTitle>

                      <DialogContent>
                        <Box mt={1}>
                          <Grid
                            container
                            spacing={2}
                            textTransform={"uppercase"}
                          >
                            {/* Row 1 - 3 fields */}
                            {/* <Grid
                              item
                              sm={6}
                              xs={12}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              {" "}
                              <Controller
                                name="EmpID"
                                control={control}
                                rules={{
                                  required: "Employee Code is required",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    {...field}
                                    label="Employee Code"
                                    type="text"
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid> */}
                            <Grid
                              item
                              sm={6}
                              xs={12}
                              md={4}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="LeaveYear"
                                control={control}
                                // rules={{ required: "Model Year is Required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <SelectedYearPickerField
                                    label="YEAR"
                                    name={field.name}
                                    value={field.value} // `field.value` will be a string like "2009"
                                    onChange={(date) => {
                                      // Ensure the selected year is correctly passed back as ISO string
                                      field.onChange(
                                        date
                                          ? dayjs(date).toISOString()
                                          : undefined
                                      );
                                      setValue(
                                        "LeaveYear",
                                        date
                                          ? dayjs(date).year().toString()
                                          : "" // Save only the year as a string
                                      );
                                    }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Row 3 */}
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="AbsenceType"
                                control={control}
                                render={({ field }) => {
                                  // get currently selected year from form

                                  // compute used options based on that year and existing rows
                                  const usedLeaveTypes = (
                                    watch("oEmpLeaveInfoLines") || []
                                  )
                                    .filter(
                                      (r, i) =>
                                        r.LeaveYear === LeaveYear &&
                                        i !== editingLeaveIndex
                                    )
                                    .map(
                                      (r) =>
                                        AbsenceTypes.find(
                                          (t) => t.value === r.AbsenceType
                                        )?.key
                                    )
                                    .filter(Boolean);

                                  return (
                                    <InputSelectTextField
                                      {...field}
                                      label="Absence Type"
                                      data={AbsenceTypes}
                                      usedLevels={usedLeaveTypes} // now disables correctly from start
                                      disabled={!LeaveYear}
                                    />
                                  );
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="TotalLeave"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    {...field}
                                    label="Total Leave"
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="LeaveTaken"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    {...field}
                                    disabled
                                    label="Leave Taken"
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="LeaveRemaining"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    {...field}
                                    label="Leave Remaining"
                                    disabled
                                  />
                                )}
                              />
                            </Grid>

                            {/* BUTTONS ROW */}
                            {/* BUTTONS ROW */}

                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="LastUpdated"
                                control={control}
                                rules={{ required: "Date is required" }}
                                render={({ field, fieldState: { error } }) => (
                                  <SelectedDatePickerField
                                    label="Last Updated"
                                    value={
                                      field.value
                                        ? dayjs(field.value)
                                        : undefined
                                    }
                                    onChange={(date) => {
                                      field.onChange(
                                        date ? date.toISOString : undefined
                                      );
                                      setValue("LastUpdated", date);
                                    }}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                            {/* <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="createdBy"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    {...field}
                                    label="Created By"
                                  />
                                )}
                              />
                            </Grid> */}
                            <Grid item xs={12} sm={4} textAlign={"center"}>
                              <Controller
                                name="Remarks"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField {...field} label="Remarks" />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 2,
                              }}
                            >
                              {/* Save - Success */}

                              <Button
                                variant="contained"
                                color="success"
                                sx={{ width: "150px" }}
                                onClick={onSubmitLeave}
                              >
                                Save
                              </Button>

                              {/* Close - Error */}
                              <Button
                                variant="contained"
                                color="error"
                                sx={{ width: "150px" }}
                                onClick={() => setOpenLeaveModal(false)}
                              >
                                Close
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </DialogContent>
                    </Dialog>
                  </Box>
                )}
                {activeTab === 4 && (
                  <Grid container mt={1}>
                    <DataGrid
                      className="datagrid-style"
                      rows={(getValues("oEmpLeaveApprovalInfoLines") || []).map(
                        (row, index) => ({
                          ...row,
                          id: index + 1,
                        })
                      )}
                      columns={LeaveApprovalColumn}
                      sx={{
                        height: "60vh",
                        minWidth: 600, // triggers horizontal scroll if columns are wide
                        backgroundColor:
                          theme.palette.mode === "light" ? "#fff" : "#373842",
                        "& .MuiDataGrid-cell": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell:focus": {
                          outline: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          backgroundColor: "red",
                          fontWeight: "bold",
                        },
                      }}
                    />
                  </Grid>
                )}
                {activeTab === 5 && (
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
                                              data.Description
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

                {/* </Paper> */}
              </Grid>
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
