import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import {
  InputSelectTextField,
  InputSelectTextFieldLarge,
  InputTextField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import PhoneNumberInput from "../Components/PhoneNumber1";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";
import { useDocumentSeries } from "../Components/useSearchInfiniteScroll";

export default function DriverDetail() {
  const theme = useTheme();
  const perms = usePermissions(148);

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

  //=====================================Close List State====================================================================
  const [CloseListData, setCloseListData] = useState([]);
  const [CloseListPage, setCloseListPage] = useState(0);
  const [hasMoreClose, setHasMoreClose] = useState(true);
  const [CloseListquery, setCloseListQuery] = useState("");
  const [CloseListSearching, setCloseListSearching] = useState(false);

  const [driverPhoto, setDriverPhoto] = useState(""); // for API loaded image

  const [tab, settab] = useState("1");
  const handleTabChange = (event, newValue) => {
    settab(newValue); // Ensure this updates the state controlling the active tab
  };
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState([]);

  const [startDate, setStartDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD HH:mm:ss")
  );
  const [clearCache, setClearCache] = useState(false);

  const [dueDate, setDueDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD HH:mm:ss")
  );
  const [contractStartDate, setcontractStartDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD HH:mm:ss")
  );
  const [contractEndDate, setContractEndDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD HH:mm:ss")
  );
  const initial = {
    DocNum: "",
    FirstName: "",
    LastName: "",
    DateOfBirth: "",
    Gender: "",
    ContactNumber: "",
    Email: "",
    Address: "",
    EmergencyContactName: "",
    EmergencyContactNumber: "",
    LicenseNumber: "",
    LicenseType: "",
    LicenseIssueDate: "",
    LicenseExpiryDate: "",
    DriverCategory: "",
    DriverStatus: "",
    ContractStartDate: "",
    ContractEndDate: "",
    DriverPhotoPath: "",
    Reminder: "",
    Series: "",
    Remarks: "",
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      ""
    );
  const licenseTypeMap = {
    1: "LMV (Light Motor Vehicle)",
    2: "HMV (Heavy Motor Vehicle)",
    3: "Transport Vehicle",
    5: "Construction Machinery License",
    6: "Forklift License",
    7: "Tractor License",
  };

  // ===============Main list handle search====================================

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    setFileData([]);
    setDriverPhoto("");
    setValue("Series", DocSeries[0]?.SeriesId ?? "");
    setValue("DocNum", DocSeries[0]?.DocNum ?? "");
  };
  //===============================All other API=================================

  // ===============Get initial list data====================================

  useEffect(
    () => {
      fetchOpenListData(0);
      fetchCloseListData(0);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
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
          setDriverDetailDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setDriverDetailDataList(DocEntry);
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
 const setDriverDetailDataList = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true); // start loader

    const response = await apiClient.get(`/DriverMaster?DocEntry=${DocEntry}`);
    const { success, values } = response.data;

    if (success) {
      const data = values;

      toggleDrawer();
      reset(data);

      // Handle image file if exists
      if (data.Image) {
        const base64Data = `data:image/png;base64,${data.Image}`;
        setFileData([{ base64: base64Data, name: "Photo", type: "image/png" }]);
      } else {
        setFileData([]);
      }

      setDriverPhoto(data.Image || "");
      setStartDate(data.LicenseIssueDate);
      setDueDate(data.LicenseExpiryDate);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } else {
      Swal.fire({
        title: "Error!",
        text: response.data.message || "Failed to fetch driver details.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching driver details:", error);

    let errorMessage = "An error occurred while fetching the data.";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // stop loader
  }
};

  // =========================================active list data==================================
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
    setLoading(true); // start loader

    const url = searchTerm
      ? `/DriverMaster?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
      : `/DriverMaster?Status=1&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    const { success, values, message } = response.data;

    if (success) {
      const newData = values || [];

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch driver list.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching driver list:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong while fetching driver list.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // stop loader
  }
};


  //==================================Inactive list===================================================
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
      CloseListSearching ? CloseListquery : ""
    );
    setCloseListPage((prev) => prev + 1);
  };

const fetchCloseListData = async (pageNum, searchTerm = "") => {
  try {
    setLoading(true); // start loader

    const url = searchTerm
      ? `/DriverMaster?SearchText=${searchTerm}&Status=0&Page=${pageNum}&Limit=20`
      : `/DriverMaster?Status=0&Page=${pageNum}&Limit=20`;

    const response = await apiClient.get(url);

    const { success, values, message } = response.data;

    if (success) {
      const newData = values || [];

      setHasMoreClose(newData.length === 20);

      setCloseListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch closed driver list.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching closed driver list:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong while fetching closed driver list.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // stop loader
  }
};


  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  // ==============useForm====================================
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm({
    defaultValues: initial,
  });
  const StatusValue = watch("Status");
  const LicenseIssueDate = watch("LicenseIssueDate");
  const formattedDate = dayjs().format("YYYY-MM-DD");

  const { isDirty } = useFormState({ control });
  const { DocSeries } = useDocumentSeries(
    "293",
   formattedDate,
    setValue,
    clearCache,
    SaveUpdateName
  );

  // ===============PUT and POST API ===================================

  const handleSubmitForm = async (data) => {
    const base64Image =
      fileData.length > 0
        ? fileData[0].base64.replace(/^data:image\/\w+;base64,/, "")
        : "";

    // const filePath =
    //   fileData.length > 0
    //     ? `/uploads/${fileData[0].name}`
    //     : String(data.DriverPhotoPath || "");

    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().toISOString(),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().toISOString(),
      Status: StatusValue === "1" ? "1" : "0",
      DocNum: String(data.DocNum || ""),
      FirstName: String(data.FirstName || ""),
      LastName: String(data.LastName || ""),
      DateOfBirth: String(data.DateOfBirth || ""),
      Gender: String(data.Gender || ""),
      ContactNumber: String(data.ContactNumber || ""),
      Email: String(data.Email || ""),
      Address: String(data.Address || ""),
      EmergencyContactName: String(data.EmergencyContactName || ""),
      EmergencyContactNumber: String(data.EmergencyContactNumber || ""),
      LicenseNumber: String(data.LicenseNumber || ""),
      LicenseType: String(data.LicenseType || ""),
      LicenseIssueDate: String(data.LicenseIssueDate || ""),
      LicenseExpiryDate: String(data.LicenseExpiryDate || ""),
      DriverCategory: String(data.DriverCategory || ""),
      DriverStatus: String(data.DriverStatus || ""),
      ContractStartDate: String(data.ContractStartDate || ""),
      ContractEndDate: String(data.ContractEndDate || ""),
      DriverPhotoPath: "",
      Image: base64Image || "",
      Reminder: String(data.Reminder || ""),
      Series: String(data.Series || ""),
      Remarks: String(data.Remarks || ""),
    };

    try {
              setLoading(true);

      if (SaveUpdateName === "SAVE") {
        // if (Array.isArray(openListData)) {
        //   const isExistingVehicleModel = openListData.some(
        //     (item) =>
        //       normalizeString(item.LicenseNumber) ===
        //       normalizeString(data.LicenseNumber)
        //   );

        //   if (isExistingVehicleModel) {
        //     Swal.fire({
        //       text: "License Number already exist",
        //       icon: "warning",
        //       showConfirmButton: true,
        //       confirmButtonText: "OK",
        //     });
        //     return;
        //   }
        // } else {
        //   return;
        // }

        const response = await apiClient.post(`/DriverMaster`, obj);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          setCloseListPage(0);
          setCloseListData([]);
          fetchCloseListData(0);
          setClearCache(true);

          Swal.fire({
            title: "Success!",
            text: "Driver Details Added",
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
          text: `Do You Want to Update "${data.DocNum}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/DriverMaster/${data.DocEntry}`,
            obj
          );

          const { success, message } = response.data;
          if (success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            setCloseListPage(0);
            setCloseListData([]);
            setClearCache(true);
            fetchCloseListData(0);
            Swal.fire({
              title: "Success!",
              text: "Driver Details Updated",
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
            text: "Driver Details is not Updated!",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);

      let errorMessage = "Something went wrong. Please try again later.";

      if (error?.response?.data) {
        const apiError = error.response.data;

        if (apiError.errors) {
          // Extract all error messages and join them
          const validationMessages = Object.values(apiError.errors)
            .flat()
            .join("\n");
          errorMessage = validationMessages;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        // icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  // ===============Delete API ===================================
  const handleOnDelete = async (data) => {
  // if (!data.DocEntry) return;

  try {
    const result = await Swal.fire({
      text: "Do you want to delete this Driver?",
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Driver details were not deleted.",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true); // start loader

    const response = await apiClient.delete(`/DriverMaster/${selectedData}`);
    const { success, message } = response.data;

    if (success) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      setCloseListPage(0);
      setCloseListData([]);
      fetchCloseListData(0);

      Swal.fire({
        text: "Driver details deleted successfully.",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to delete driver details.",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error deleting driver:", error);
    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while deleting the driver.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // stop loader
  }
};


  //====================================handle file change=============================================
  const fileInputRef = useRef();

  const handleFileChange = (event) => {
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
      setFileData([
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

  const handleRemove = () => {
    setFileData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset input
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
          Driver Detail List
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
                      key={i}
                      title={`${item.FirstName} ${item.LastName}`}
                      subtitle={item.ContactNumber}
                      description={
                        licenseTypeMap[item.LicenseType] || item.LicenseType
                      }
                      isSelected={selectedData === item.DocEntry}
                      searchResult={openListquery}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
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
                      key={i}
                      title={`${item.FirstName} ${item.LastName}`}
                      subtitle={item.ContactNumber}
                      description={
                        licenseTypeMap[item.LicenseType] || item.LicenseType
                      }
                      isSelected={selectedData === item.DocEntry}
                      searchResult={openListquery}
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
              Driver Detail
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
                  <Grid item xs={12} textAlign={"center"}>
                    {fileData.length > 0 ? (
                      <Grid container spacing={2} justifyContent="center">
                        {fileData.map((data, index) => {
                          const fileType = data.type;
                          const imgURL = data.base64;

                          return (
                            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
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
                                    onClick={() => openFileinNewTab(data)}
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
                                    onClick={() => openFileinNewTab(data)}
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
                                    <Typography variant="body2" mt={1} noWrap>
                                      {data.name}
                                    </Typography>
                                  </Box>
                                )}
                                <RemoveCircleOutlineIcon
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
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
                    ) : driverPhoto ? (
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
                        onClick={() => window.open(driverPhoto, "_blank")}
                      >
                        <Box
                          component="img"
                          src={driverPhoto}
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
                          onChange={handleFileChange}
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
                  <Divider sx={{ width: "100%", mb: 3 }} />
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
                          disabled={!initial.DocEntry === false}
                          {...field}
                          onChange={(e) => {
                            const selectedSeries = e.target.value;
                            field.onChange(selectedSeries);
                            setValue("Series", selectedSeries);
                            if (selectedSeries !== "0") {
                              const seriesData = DocSeries.find(
                                (item) => item.SeriesId === selectedSeries
                              );
                              setValue("DocNum", seriesData?.DocNum || "");
                              clearErrors("DocNum");
                            } else {
                              setValue("DocNum", "");
                              clearErrors("DocNum");
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
                          readOnly={watch("Series") !== "0"}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="FirstName"
                      control={control}
                      rules={{
                        required: "First Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "First Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="FIRST NAME"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 25 }}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="LastName"
                      control={control}
                      rules={{
                        required: "Last Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "Lasst Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="LAST NAME"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 25 }}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DateOfBirth"
                      control={control}
                      // rules={{ required: "DOB is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="DOB"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            field.onChange(date ? date.toISOString : undefined);
                            setValue("DateOfBirth", date);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Gender"
                      control={control}
                      // rules={{ required: "Gender is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="GENDER"
                          data={[
                            { key: "1", value: "MALE" },
                            { key: "2", value: "FEMALE" },
                            // { key: "3", value: "OTHER" },
                          ]}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Controller
                        name="ContactNumber"
                        // rules={{ required: "Contact No is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <PhoneNumberInput
                            defaultCountry="in"
                            label="CONTACT NO."
                            name="ContactNumber"
                            inputProps={{ maxLength: 16 }}
                            value={field.value}
                            onChange={(phone) => field.onChange(phone)}
                            helperText={error ? error.message : null}
                            error={!!error}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Email"
                      // rules={{ required: "this field is requered" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="EMAIL"
                          type="email"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          inputProps={{ maxLength: 100 }}
                          helperText={error ? error.message : null}
                          rows={1}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Address"
                      control={control}
                      // rules={{
                      //   required: "Last Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ADDRESS"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Controller
                        name="EmergencyContactNumber"
                        control={control}
                        // rules={{
                        //   required: "Last Name is required", // Field is required
                        // }}
                        render={({ field, fieldState: { error } }) => (
                          <PhoneNumberInput
                            defaultCountry="in"
                            label="EMERGENCY CONTACT NO."
                            inputProps={{ maxLength: 16 }}
                            value={field.value}
                            onChange={(phone) => field.onChange(phone)}
                            helperText={error ? error.message : null}
                            error={!!error}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="LicenseType"
                      control={control}
                      // rules={{ required: "License Type is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextFieldLarge
                          label="LICENSE TYPE"
                          sx={{ width: 220 }}
                          data={[
                            { key: "1", value: "LMV (Light Motor Vehicle)" },
                            { key: "2", value: "HMV (Heavy Motor Vehicle)" },
                            { key: "3", value: "Transport Vehicle" },
                            {
                              key: "5",
                              value: "Construction Machinery License",
                            },
                            { key: "6", value: "Forklift License" },
                            {
                              key: "7",
                              value: "Tractor License",
                            },
                          ]}
                          {...field}
                          MenuProps={{
                            PaperProps: { sx: { width: 450 } },
                            MenuListProps: { sx: { maxHeight: 300 } },
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="LicenseNumber"
                      control={control}
                      // rules={{
                      //   required: "License Number is required",
                      //   validate: (value) =>
                      //     value.trim() !== "" ||
                      //     "License Number cannot be empty",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="LICENSE NO."
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="LicenseIssueDate"
                      control={control}
                      // rules={{ required: "License Issue Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="LICENSE ISSUE DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setStartDate(date);
                            setDueDate(null);
                            setValue("LicenseIssueDate", date);
                            setValue("LicenseExpiryDate", "");
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="LicenseExpiryDate"
                      control={control}
                      // rules={{ required: "License Expiry Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="LICENSE EXPIRY DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          minDate={startDate}
                          onChange={(date) => {
                            setDueDate(date);
                            setValue("LicenseExpiryDate", date);
                          }}
                          disabled={!LicenseIssueDate}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Reminder"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Tooltip title="Alert Before Days" arrow>
                          <InputTextField
                            label="ALERT BEFORE DAYS"
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            inputProps={{
                              maxLength: 10,
                              onInput: (e) => {
                                let value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                if (value.length > 2) value = value.slice(0, 2);
                                e.target.value = value;
                              },
                            }}
                            type="number"
                            error={!!error}
                            helperText={error ? error.message : null}
                            // sx={{ marginRight: 1, width: "80%" }}
                          />
                        </Tooltip>
                      )}
                    />
                    {/* <Controller
                        name="ReminderStatus"
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
                                  const newValueReminder = e.target.checked
                                    ? "1"
                                    : "0";
                                  field.onChange(newValueReminder);
                                  setValue("Reminder", newValueReminder);
                                }}
                              />
                            }
                            label="Reminder"
                          />
                        )}
                      /> */}
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ContractStartDate"
                      control={control}
                      // rules={{ required: "Posting Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="CONTRACT START DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(date) => {
                            setcontractStartDate(date);
                            setContractEndDate(null);
                            setValue("ContractStartDate", date);
                            setValue("ContractEndDate", "");
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ContractEndDate"
                      control={control}
                      // rules={{ required: "Due Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="CONTRACT END DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          minDate={contractStartDate}
                          onChange={(date) => {
                            setContractEndDate(date);
                            setValue("ContractEndDate", date);
                          }}
                          disabled={!startDate}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
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
                                setValue("Status", newValueStatus);
                              }}
                            />
                          }
                          label="Active"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Remarks"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <InputTextField
                          {...field}
                          size="small"
                          label="REMARK"
                          inputProps={{ maxLength: 254 }}
                          rows={2}
                          multiline
                          fullWidth
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
//base64 only one image
