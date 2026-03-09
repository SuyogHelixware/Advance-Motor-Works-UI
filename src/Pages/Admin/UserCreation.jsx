import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import {
  InputFields,
  InputSearchableSelect,
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import PhoneNumberInput from "../Components/PhoneNumber1";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
const initial = {
  DocEntry: "",
  UserName: "",
  Password: "",
  FirstName: "",
  LastName: "",
  PhoneNumber: "",
  Email: "",
  RoleId: "",
  SalesEmployee: "",
  Status: "1",
  Department: "",
};

export default function UserCreation() {
  const { user } = useAuth();
  //       const getPermissionsByMenuId = (menuId) => {
  //       const matchedMenu = user?.SubMenus?.flatMap(sub =>
  //         sub.Menus.filter(menu => menu.MenuId === menuId)
  //       )[0];
  //       return matchedMenu || {
  //         IsRead: false,
  //         IsAdd: false,
  //         IsEdit: false,
  //         IsDelete: false,
  //       };
  //     };
  //     // getPermissionsByMenuId(MenuID)

  // const perms = useMemo(() => getPermissionsByMenuId(13), [user]);
  //  const [Disbled,setdisbled]=useState(perms.IsAdd)
  console.log(user);
  const perms = usePermissions(13);
  console.log(perms);
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  // States for the Role
  const [selectedRole, setSelectedRole] = useState("");
  const [RoleData, setRoleData] = useState([]);
  const [selectedSalesEmp, setSelectedSalesEmp] = useState("");
  const [SalesEmpData, setSalesEmpData] = useState([]);

  const [loading, setLoading] = useState(false);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //=====================================Close List State====================================================================
  const [CloseListData, setCloseListData] = useState([]);
  const [CloseListPage, setCloseListPage] = useState(0);
  const [hasMoreClose, setHasMoreClose] = useState(true);
  const [CloseListquery, setCloseListQuery] = useState("");
  const [CloseListSearching, setCloseListSearching] = useState(false);
  const [tab, settab] = useState("1");

  const [openDepartment, setopenDepartment] = useState(false);
  const [selectedDepartmentRowId, setSelectedDepartmentRowId] = useState(null);
  const [DepartmentList, setDepartmentList] = useState([]);
  const handleTabChange = (event, newValue) => {
    settab(newValue); // Ensure this updates the state controlling the active tab
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  //========================Active tab functions=================

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

  const PAGE_SIZE = 20;

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    setLoading(true);

    try {
      const url = searchTerm
        ? `/Users/Search/${searchTerm}/1/${pageNum}/${PAGE_SIZE}`
        : `/Users/Pages/1/${pageNum}/${PAGE_SIZE}`;

      const response = await apiClient.get(url);
      const { success, values = [], message } = response?.data || {};

      if (!success) {
        Swal.fire({
          text: message || "Failed to fetch users",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      setHasMoreOpen(values.length === PAGE_SIZE);

      setOpenListData((prev) =>
        pageNum === 0 ? values : [...prev, ...values],
      );
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error fetching users";

      console.error("Error fetching users:", error);

      Swal.fire({
        text: errorMessage,
        icon: "error",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  //=======================================Inactive list data==========================================
  const handleCloseListSearch = (res) => {
    setCloseListQuery(res);
    setCloseListSearching(true);
    setCloseListPage(0);
    setCloseListData([]); // Clear current data

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCloseListData(0, res);
    }, 600);
    // Fetch with search query
  };

  // Clear search
  const handleCloseListClear = () => {
    setCloseListQuery(""); // Clear search input
    setCloseListSearching(false); // Reset search state
    setCloseListPage(0); // Reset page count
    setCloseListData([]); // Clear data
    fetchCloseListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreCloseListData = () => {
    fetchCloseListData(
      CloseListPage + 1,
      CloseListSearching ? CloseListquery : "",
    );
    setCloseListPage((prev) => prev + 1);
  };

  const fetchCloseListData = async (pageNum, searchTerm = "") => {
    setLoading(true);

    try {
      const url = searchTerm
        ? `/Users/Search/${searchTerm}/0/${pageNum}/${PAGE_SIZE}`
        : `/Users/Pages/0/${pageNum}/${PAGE_SIZE}`;

      const response = await apiClient.get(url);
      const { success, values = [], message } = response?.data || {};

      if (!success) {
        Swal.fire({
          text: message || "Failed to fetch closed users",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      setHasMoreClose(values.length === PAGE_SIZE);

      setCloseListData((prev) =>
        pageNum === 0 ? values : [...prev, ...values],
      );
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error fetching closed users";

      console.error("Error fetching closed users:", error);

      Swal.fire({
        text: errorMessage,
        icon: "error",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  //========================== handle sales employee change=======================
  const handleSalesEmpChange = (e) => {
    setSelectedSalesEmp(e.target.value); // Set selected sales employee based on user input
  };

  const getSalesEmpList = async () => {
    setLoading(true);

    try {
      const response = await apiClient.get(`/SalesEmp/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { success, values = [], message } = response?.data || {};

      if (!success) {
        Swal.fire({
          title: "Error!",
          text: message || "Unable to fetch Sales Employee data.",
          icon: "error",
        });
        return;
      }

      const formattedData = values.map((item) => ({
        key: item.DocEntry,
        value: item.SlpName,
      }));

      setSalesEmpData(formattedData);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch the Sales Employee data. Please try again later.";

      console.error("Error fetching sales employee data:", error);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  //========================== Handle Role Change =======================
  const handleRoleDataChange = (e) => {
    setSelectedRole(e.target.value); // Set selected role based on user input
  };

  const getRoleDataList = async () => {
    setLoading(true);

    try {
      const response = await apiClient.get(`/RoleMapping/All`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { success, values = [], message } = response?.data || {};

      if (!success) {
        Swal.fire({
          title: "Error!",
          text: message || "Unable to fetch role data.",
          icon: "error",
        });
        return;
      }

      const formattedData = values.map((item) => ({
        key: item.RoleId,
        value: item.RoleName,
      }));

      setRoleData(formattedData);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch the Role data. Please try again later.";

      console.error("Error fetching role data:", error);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoleDataList();
    getSalesEmpList();
    fetchOpenListData(0);
    fetchCloseListData(0);
    fetchData();
  }, []);

  //========================set specific cards data ===============
  const setUserCreationDataList = async (DocEntry) => {
    if (!DocEntry) return;

    setLoading(true);

    try {
      const response = await apiClient.get(`/Users/${DocEntry}`);
      const { success, values: data, message } = response?.data || {};

      if (!success || !data) {
        Swal.fire({
          title: "Error!",
          text: message || "Unable to fetch user data.",
          icon: "error",
        });
        return;
      }

      toggleDrawer();
      reset(data);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to fetch user data. Please try again later.";

      console.error("Error fetching user data:", error);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    setSelectedData([]);
  };

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: initial,
  });

  //======================Delete API===================
  const handleOnDelete = async () => {
    const result = await Swal.fire({
      text: "Do You Want Delete?",
      icon: "question",
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "User Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true);

    try {
      const resp = await apiClient.delete(`/Users/${DocEntry}`);
      const { success, message } = resp?.data || {};

      if (!success) {
        Swal.fire({
          text: message || "User is not deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 3500,
        });
        return;
      }

      // ✅ Refresh lists
      clearFormData();
      setOpenListPage(0);
      setCloseListPage(0);
      setCloseListData([]);
      setOpenListData([]);
      fetchOpenListData(0);
      fetchCloseListData(0);

      Swal.fire({
        text: "User Deleted",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "User is not deleted";

      console.error("Error deleting user:", error);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  //==========================================Add, Update, Delete Department =======================
  const handleDepartmentDelete = async (data) => {
    if (!data?.DocEntry) return;

    const result = await Swal.fire({
      text: `Do You Want to Delete "${data.Name}" ?`,
      icon: "question",
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Department Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.delete(`/Department/${data.DocEntry}`);
      const { success, message } = response?.data || {};

      if (!success) {
        Swal.fire({
          title: "Error!",
          text: message || "Failed to delete department.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      fetchData();

      Swal.fire({
        title: "Success!",
        text: "Department Deleted",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1500,
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      console.error("Error deleting department:", error);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (row) => {
    if (!row?.DocEntry) return;

    setLoading(true);

    try {
      const res = await apiClient.get(`/Department/${row.DocEntry}`);
      const { success, values, message } = res?.data || {};

      if (!success || !values) {
        Swal.fire({
          title: "Error!",
          text: message || "Failed to fetch department details.",
          icon: "warning",
        });
        return;
      }

      const { DocEntry, Name } = values;

      // ✅ Set form field
      setValueIndic("Name", Name || "");

      // ✅ Store DocEntry for update
      setSelectedDepartmentRowId(DocEntry);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch department details.";

      console.error("Error fetching department:", error);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
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
    setLoading(true);

    try {
      const res = await apiClient.get(`/Department/All`);
      const { success, values = [], message } = res?.data || {};

      if (!success) {
        Swal.fire({
          title: "Error!",
          text: message || "Failed to fetch departments.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      setDepartmentList(values);
      // resetDepartment(values); // if needed
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch department data.";

      console.error("Error fetching departments:", error);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (data) => {
    setLoading(true);

    const isUpdate = Boolean(selectedDepartmentRowId);

    const payload = {
      DocEntry: data.DocEntry || "",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: isUpdate ? user.UserName : "",
      ModifiedDate: isUpdate ? dayjs().format("YYYY-MM-DD") : "",
      Status: "1",
      Code: data.Code || "0",
      Name: data.Name || "",
      Remarks: data.Remarks || "",
    };

    try {
      const response = isUpdate
        ? await apiClient.put(`/Department/${selectedDepartmentRowId}`, payload)
        : await apiClient.post("/Department", payload);

      const { success, message } = response?.data || {};

      if (!success) {
        Swal.fire("Error!", message || "Operation failed!", "error");
        return;
      }

      await fetchData();
      resetDepartment(initialDepartmentData);
      setSelectedDepartmentRowId(null);

      Swal.fire({
        title: "Success!",
        text: isUpdate
          ? "Department updated successfully!"
          : "Department added successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Department Save Error:", error);

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

  //======================PUT and POST API===================
  const StatusValue = watch("Status");

  const handleSubmitForm = async (data) => {
    const isUpdate = SaveUpdateName !== "SAVE";

    const payload = {
      DocEntry: String(data.DocEntry || ""),
      DocNum: null,
      DocDate: dayjs().format("YYYY-MM-DD"),
      UserId: sessionStorage.getItem("UserId") || "1",
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: isUpdate ? user.UserName : "",
      ModifiedDate: isUpdate ? dayjs().format("YYYY-MM-DD") : "",
      Status: StatusValue === "1" ? "1" : "0",

      UserName: String(data.UserName || ""),
      Password: String(data.Password || ""),
      RoleId: String(data.RoleId || ""),
      FirstName: String(data.FirstName || ""),
      LastName: String(data.LastName || ""),
      PhoneNumber: String(data.PhoneNumber || ""),
      Email: String(data.Email || ""),

      SlpCode: String(data.SlpCode || ""),
      Flag: "0",
      OtherUserFlag: "0",
      SuperUser: "N",
      MobileUser: "N",

      UserCode: data.UserCode || null,
      PortNum: data.PortNum || null,
      Branch: "1",
      Department: data.Department || "",
      GroupName: data.GroupName || null,
      PwdNeverEx: data.PwdNeverEx || null,
      OneLogPwd: data.OneLogPwd || null,
      Locked: data.Locked || "N",
    };

    try {
      // 🔔 Confirm before UPDATE
      if (isUpdate) {
        const confirm = await Swal.fire({
          text: "Do You Want to Update?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "YES",
          cancelButtonText: "NO",
        });

        if (!confirm.isConfirmed) {
          Swal.fire({
            text: "User is not updated",
            icon: "info",
            toast: true,
            timer: 1500,
            showConfirmButton: false,
          });
          return;
        }
      }

      setLoading(true);

      const response = isUpdate
        ? await apiClient.put(`/Users/${data.DocEntry}`, payload)
        : await apiClient.post(`/Users`, payload);

      const { success, message } = response.data || {};

      if (!success) {
        Swal.fire("Error!", message || "Operation failed", "warning");
        return;
      }

      // 🔄 Refresh Lists
      clearFormData();
      setOpenListPage(0);
      setCloseListPage(0);
      setOpenListData([]);
      setCloseListData([]);
      fetchOpenListData(0);
      fetchCloseListData(0);

      Swal.fire({
        title: "Success!",
        text: isUpdate ? "User Updated" : "User Added",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("User submit error:", error);

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
          User Creation List
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
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="1" label="Active" />
                <Tab value="0" label="Inactive" />
              </Tabs>

              {/* Active Tab */}
              <TabPanel
                value="1"
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ActiveListScroll"
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
                      title={item.UserName}
                      subtitle={item.FirstName}
                      isSelected={selectedData === item.DocEntry}
                      // description={item.PhoneNumber}
                      searchResult={openListquery}
                      onClick={() => setUserCreationDataList(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              {/* Inactive Tab */}
              <TabPanel
                value="0"
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="InactiveListScroll"
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
                    value={CloseListquery}
                    onClickClear={handleCloseListClear}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  dataLength={CloseListData.length}
                  hasMore={hasMoreClose}
                  next={fetchMoreCloseListData}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {CloseListData.map((item, i) => (
                    <CardComponent
                      key={item.DocEntry}
                      title={item.FirstName}
                      // subtitle={item.Email}
                      // description={item.PhoneNumber}
                      isSelected={selectedData === item.DocEntry}
                      searchResult={CloseListquery}
                      onClick={() => setUserCreationDataList(item.DocEntry)}
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

      <Dialog
        open={openDepartment}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "600px",
            height: "500px",
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
                  rules={{
                    required: "This required",
                    validate: (value) =>
                      value.trim() !== "" || "Department Name cannot be empty",
                  }}
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
              sx={{
                height: "310px",
                "& .MuiDataGrid-virtualScroller": {
                  overflowY: "auto !important", // only body scrolls
                },
                "& .MuiDataGrid-columnHeaders": {
                  position: "sticky",
                  top: 0,
                  backgroundColor: "white",
                  zIndex: 2, // ensure it stays above rows
                },
              }}
            />
          </Grid>
        </DialogContent>
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
              User Creation
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
                width={"100%"}
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="UserName"
                      control={control}
                      rules={{
                        required: "User Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "User Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="USERNAME"
                          disabled={!!DocEntry}
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Password"
                      control={control}
                      rules={{
                        required: !DocEntry ? "Password is required" : false,
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <InputTextField
                            label="PASSWORD"
                            type="password" // Use 'password' type for password fields for better security
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                          {/* Add a note below the password field */}
                          {DocEntry && (
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              style={{ color: "red" }}
                            >
                              Note:Leave blank to keep the current password.
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="FirstName"
                      control={control}
                      // rules={{
                      //   required: "First Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="FIRSTNAME"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="LastName"
                      control={control}
                      // rules={{
                      //   required: "Last Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="LASTNAME"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Email"
                      control={control}
                      // rules={{
                      //   required: "Email is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="EMAIL"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="RoleId"
                      control={control}
                      rules={{ required: "Role is required" }}
                      defaultValue=""
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          label="ROLE"
                          {...field}
                          // disabled={!!DocEntry}
                          data={RoleData}
                          onChange={(e) => {
                            field.onChange(e); // Update form state
                            handleRoleDataChange(e); // Update selectedTaxCategory state
                            setSelectedRole(e.target.value);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SlpCode"
                      control={control}
                      // rules={{ required: "Sales Employee is required" }}
                      defaultValue=""
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          label="SALES EMPLOYEE"
                          {...field}
                          // disabled={!!DocEntry}
                          data={SalesEmpData}
                          onChange={(e) => {
                            field.onChange(e); // Update form state
                            handleSalesEmpChange(e); // Update selectedTaxCategory state
                            setSelectedSalesEmp(e.target.value);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  {/* <Grid
                    item
                    md={6}
                    xs={12}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                  > */}
                  {/* <Controller
                      name="Department"
                      control={control}
                      // rules={{ required: "Department is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <InputSearchableSelect
                            {...field}
                            label="DEPARTMENT"
                            error={!!error}
                            helperText={error?.message}
                            data={DepartmentList.map((item) => ({
                              key: item.DocEntry,
                              value: item.Name,
                            }))}
                          />
                          {/* OUTSIDE ICON */}
                  {/* <IconButton
                            onClick={HandlePDepartmentOpen}
                            size="small"
                            sx={{
                              ml: 1,
                              mr: 1,
                              backgroundColor: "success.main",
                              color: "white",
                              borderRadius: "5px",
                              width: 40,
                              height: 40,
                            }}
                          >
                            <AddIcon />
                          </IconButton> */}
                  {/* </> */}

                  {/* />  */}
                  {/* </Grid> */}
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Controller
                        name="PhoneNumber"
                        control={control}
                        // rules={{
                        //   required: "Phone Number is required", // Field is required
                        // }}
                        render={({ field, fieldState: { error } }) => (
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

                  <Grid
                    item
                    md={6}
                    xs={12}
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
                              textAlign={"center"}
                              {...field}
                              checked={field.value === "1"}
                              onChange={(e) => {
                                const newValueStatus = e.target.checked
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
