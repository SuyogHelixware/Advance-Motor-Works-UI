import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import SearchInputField from "../Components/SearchInputField";
import MenuIcon from "@mui/icons-material/Menu";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerFields,
  InputFields,
  InputTextAreaFields,
  InputTextSearchButton,
  InputTimePicker
} from "../Components/formComponents";
import { SearchBPModel } from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";

export default function InwardVehicle() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const timeoutRef = useRef(null);
  const [DocEntry, setDocEntry] = useState("");
  const [PrintData, setPrintData] = useState([]);

  const [oldOpenData, setSelectData] = useState(null);
  const [apiloading, setapiloading] = useState(false);
  let [ok, setok] = useState("OK");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const perms = usePermissions(133);

  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //=========================================open List State End================================================================
  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);

  const sigCanvas = useRef(null);
  const [isSigned, setIsSigned] = useState(false);
  const signatureEditable = SaveUpdateName === "SAVE";

  const handleEnd = () => {
    if (!sigCanvas.current.isEmpty()) {
      setIsSigned(true);
    }
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
    setIsSigned(false);
  };

  const initial = {
    OrderNo: "",
    CardName: "",
    PhoneNumber1: "",
    Mileage: "",
    ChassisNo: "",
    RegistrationNo: "",
    JobWorkAt: "",
    JobWorkDetails: "",
    InwardNo: "",
    VehInwardDate: dayjs(new Date()),
    VehInwardTime: dayjs(),
    JobCardNo: "",
    OutwardNo: "",
    OrderDocEntry: "",
    SignPath: "",
    Year: "",
    Make: "",
    Model: "",
    AppointmentNo: "",
    OrderType: "",
    VehInwardNo: "",
    InspectionRemarks: "",
    // Vehicle: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: initial,
  });

  useEffect(() => {
    const signPathByteArray = watch("SignPathByteArray");
    if (signPathByteArray && sigCanvas.current) {
      const timer = setTimeout(() => {
        sigCanvas.current.fromDataURL(
          `data:image/png;base64,${signPathByteArray}`,
        );
        setIsSigned(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [watch("SignPathByteArray")]);

  const allFormData = getValues();

  const theme = useTheme();

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const signPathByteArray = watch("SignPathByteArray");

    if (sigCanvas.current) {
      // Always clear the canvas first
      sigCanvas.current.clear();
      setIsSigned(false);

      // Then load new signature if exists
      if (signPathByteArray) {
        const timer = setTimeout(() => {
          sigCanvas.current.fromDataURL(
            `data:image/png;base64,${signPathByteArray}`,
          );
          setIsSigned(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [watch("SignPathByteArray")]);

  // Clear signature when switching to SAVE mode (new record)
  useEffect(() => {
    if (SaveUpdateName === "SAVE" && sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false);
    }
  }, [SaveUpdateName]);

  const onSelectBusinessPartner = (DocEntry) => {
    clearSignature();
    const selectedItem = getListData.find((item) => item.DocEntry === DocEntry);
    if (!selectedItem) return;

    // Set all relevant form fields
    const fieldsToSet = {
      OrderNo: selectedItem.OrderNo,
      CardName: selectedItem.CardName,
      CardCode: selectedItem.CardCode,
      InvoiceNo: selectedItem.InvoiceNo,
      AppointDate: selectedItem.AppointDate
        ? dayjs(selectedItem.AppointDate)
        : null,
      AppointmentNo: selectedItem.DocEntry,
      Vehicle:`${selectedItem.Year} - ${selectedItem.Make} - ${selectedItem.Model}`,
      PhoneNumber1: selectedItem.PhoneNumber1,
      OrderDocEntry: selectedItem.OrderDocEntry,
      //   VehMileage: selectedItem.Mileage,
      //   VehchassisNo: selectedItem.ChassisNo,
      //   RegistrationNo: selectedItem.RegistrationNo,
      //   InspectionRemarks: selectedItem.InspectionRemark,
      JobWorkAt: selectedItem.JobWorkAt,
      JobWorkDetails: selectedItem.JobRemarks,
      VehInwardNo: selectedItem.VehInwardNo,
      JobCardNo: selectedItem.JobCardNo,
      SignPath: selectedItem.SignPath,
      OrderType: selectedItem.OrderType,
      Year: selectedItem.Year,
      Make: selectedItem.Make,
      Model: selectedItem.Model,
    };

    Object.entries(fieldsToSet).forEach(([key, value]) => {
      setValue(key, value, { shouldValidate: true });
    });

    SearchModelClose();
  };

  const fetchAndSetData = async (DocEntry) => {
    try {
      const url = `${BASE_URL}/VehInward/${DocEntry}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.values && data.values.length > 0) {
        const item = data.values[0];

        const transformed = {
          ...item,
          OrderNo: item.OrderNo,
          CardName: item.CardName,
          PhoneNumber1: item.PhoneNumber1,
          JobWorkAt: item.JobWorkAt,
          JobWorkDetails: item.JobWorkDetails,
          VehInwardNo: item.DocNum,
          AppointmentNo: item.AppointmentNo,
          AppointDate: item.DocDate ? dayjs(item.DocDate) : null,
          VehInwardDate: item.DocDate ? dayjs(item.DocDate) : dayjs(),
          VehInwardTime: item.VehInwardTime,
          Mileage: item.Mileage,
          ChassisNo: item.ChassisNo,
          RegistrationNo: item.RegistrationNo,
          InspectionRemark: item.InspectionRemark,
          JobCardNo: item.JobCardNo,
          Vehicle: `${item.Year} - ${item.Make} - ${item.Model}`,
          SignPath: item.SignPath,
          SignPathByteArray: item.SignPathByteArray,
          OrderType: item.OrderType,
          Year: item.Year,
          Make: item.Make,
          Model: item.Model,
        };

        reset(transformed);
        setSelectData(DocEntry);
        setDocEntry(DocEntry);
        setSaveUpdateName("UPDATE");
      } else {
        console.warn("No values returned from API");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        text: "Failed to fetch data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const setOldOpenData = (DocEntry) => {
    fetchAndSetData(DocEntry);
  };

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `${BASE_URL}/VehInward/search/${searchTerm}/1/${pageNum}`
        : `${BASE_URL}/VehInward/pages/${pageNum}/1`;

      const response = await fetch(url);
      const data = await response.json(); // ✅ important

      if (data.success) {
        const newData = data.values || []; // fallback to empty array
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        // Stop loader if less than page size returned
        const pageSize = 20; // set your API page size here
        setHasMoreOpen(newData.length === pageSize);

        setOpenListPage(pageNum); // update current page
      } else {
        setHasMoreOpen(false); // stop loader if API fails
        Swal.fire({
          text: data.message,
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreOpen(false); // stop loader on error
      Swal.fire({
        text: error.message || error,
        icon: "question",
        confirmButtonText: "YES",
      });
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
    // Fetch with search query
  };

  // Clear search
  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear searFullAddressch input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };

  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0);
  }, []);

  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `${BASE_URL}/VehInward/search/${searchTerm}/0/${pageNum}`
        : `${BASE_URL}/VehInward/pages/${pageNum}/0`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const newData = data.values;
        setHasMoreClosed(newData.length === 20);
        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        setHasMoreClosed(false);
        Swal.fire({
          text: data.message,
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreClosed(false);
      Swal.fire({
        text: error.message || error,
        icon: "question",
        confirmButtonText: "YES",
      });
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

  // Clear search
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

  // Initial fetch
  useEffect(() => {
    fetchClosedListData(0);
  }, []);

  const tabData = [
    {
      value: "0",
      label: "Open",
      data: openListData,
      query: openListquery,
      hasMore: hasMoreOpen,
      fetchMore: fetchMoreOpenListData,
      handleSearch: handleOpenListSearch,
      handleClear: handleOpenListClear,
    },
    {
      value: "1",
      label: "Closed",
      data: closedListData,
      query: closedListquery,
      hasMore: hasMoreClosed,
      fetchMore: fetchMoreClosedListData,
      handleSearch: handleClosedListSearch,
      handleClear: handleClosedListClear,
    },
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
          Inward Vehicle No's
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
                {tabData.map(({ value, label }) => (
                  <Tab key={value} value={value} label={label} />
                ))}
              </Tabs>

              {tabData.map(
                ({
                  value,
                  data,
                  query,
                  hasMore,
                  fetchMore,
                  handleSearch,
                  handleClear,
                }) => (
                  <TabPanel
                    key={value}
                    value={value}
                    style={{
                      overflow: "auto",
                      maxHeight: `calc(100% - 15px)`,
                      paddingLeft: 5,
                      paddingRight: 5,
                    }}
                    id={`ListScroll${value}`}
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
                        onChange={(e) => handleSearch(e.target.value)}
                        value={query}
                        onClickClear={handleClear}
                      />
                    </Grid>
                    <InfiniteScroll
                      style={{ textAlign: "center", justifyContent: "center" }}
                      dataLength={data.length}
                      hasMore={hasMore}
                      next={fetchMore}
                      loader={
                        <BeatLoader
                          color={
                            theme.palette.mode === "light" ? "black" : "white"
                          }
                        />
                      }
                      scrollableTarget={`ListScroll${value}`}
                      endMessage={<Typography>No More Records</Typography>}
                    >
                      {data.map((item, i) => (
                        <CardComponent
                          key={i}
                          title={item.DocNum}
                          subtitle={item.PhoneNumber1}
                          description={item.CardName}
                          searchResult={query}
                          isSelected={oldOpenData === item.DocEntry}
                          onClick={() =>
                            setOldOpenData(
                              item.DocEntry,
                              item.CardCode,
                              item.OrderNo,
                            )
                          }
                        />
                      ))}
                    </InfiniteScroll>
                  </TabPanel>
                ),
              )}
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `${BASE_URL}/VehInward/GetListForCreate/Search/${searchTerm}/${pageNum}`
        : `${BASE_URL}/VehInward/GetListForCreate/${pageNum}`;

      const response = await fetch(url);
      const data = await response.json(); // <-- important

      if (data.success) {
        const newData = data.values;
        setHasMoreGetList(newData.length === 20); // update loader
        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          text: data.message,
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      Swal.fire({
        text: error.message || error,
        icon: "question",
        confirmButtonText: "YES",
      });
    }
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };
  useEffect(() => {
    if (searchmodelOpen === true) {
      fetchGetListData(0);
    }
  }, [searchmodelOpen]);

  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };
  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };

  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);

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

  const ClearForm = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    reset(initial);
    setSelectData([]);
    setok("");
  };

  const handleSubmitForm = async (data) => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      Swal.fire({
        text: "Please add Signature...",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    const UserId = localStorage.getItem("UserId");
    const CreatedBy = localStorage.getItem("UserName");
    const signatureDataURL = sigCanvas.current.toDataURL().split(",")[1];

    const obj = {
      UserId: data.DocEntry ? (data.UserId ?? UserId) : UserId,
      CreatedBy: data.DocEntry ? (data.CreatedBy ?? CreatedBy) : CreatedBy,
      AppointmentNo: data.AppointmentNo,
      VehInwardNo: data.VehInwardNo,
      OrderNo: data.OrderNo,
      VehInwardDate: dayjs(data.VehInwardDate).format("YYYY-MM-DD HH:mm:ss"),
      RegistrationNo: String(data.RegistrationNo),
      InspectionRemark: data.InspectionRemark,
      VehicleDocEntry: "0",
      Mileage: String(data.Mileage),
      ChassisNo: String(data.ChassisNo),
      VehInwardTime: dayjs(data.VehInwardTime).format("HH:mm"),
      PhoneNumber1: data.PhoneNumber1,
      CardName: data.CardName,
      CardCode: data.CardCode,
      JobWorkAt: data.JobWorkAt,
      Year: data.Year,
      Make: data.Make,
      Model: data.Model,
      JobWorkDetails: data.JobWorkDetails,
      OrderType: data.OrderType,
      OrderDocEntry: String(data.OrderDocEntry),
      JobCardNo: "",
      ScheduleDate: "",
      SignPath: data.SignPath,
      SignPathByteArray: signatureDataURL,
    };

    console.log(obj)
    return

    try {
      setapiloading(true);

      if (SaveUpdateName === "Submit") {
        const response = await fetch(`${BASE_URL}/VehInward`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obj),
        });

        const res = await response.json();

        if (res.success) {
          setOpenListData([]);
          fetchOpenListData(0);
          handleGetListClear();
          ClearForm();

          Swal.fire({
            text: "Inward Vehicle Added",
            icon: "success",
            title: "Success!",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else if (SaveUpdateName === "Update") {
        const result = await Swal.fire({
          text: `Do you want to Update ${data.VehInwardNo}?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showCancelButton: true,
        });

        if (!result.isConfirmed) {
          setapiloading(false);
          Swal.fire({
            title: "Info",
            text: "Inward Vehicle Not Updated",
            icon: "info",
            confirmButtonText: "Ok",
            timer: 1000,
          });
          return;
        }

        const response = await fetch(`${BASE_URL}/VehInward/${data.DocEntry}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obj),
        });

        const res = await response.json();

        if (res.success) {
          setOpenListPage(0);
          setapiloading(false);
          setOpenListData([]);
          fetchOpenListData(0);
          handleGetListClear();
          ClearForm();
          Swal.fire({
            title: "Success!",
            text: "Inward Vehicle Updated",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          setapiloading(false);
          Swal.fire({
            title: "Error!",
            text: res.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      }
    } catch (error) {
      setapiloading(false);
      Swal.fire({
        title: "Error!",
        text: error.message || "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  };

  return (
    <>
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
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
            onClick={toggleSidebar}
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
              Inward Vehicle Details
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
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid
                    container
                    item
                    style={{
                      height: "100%",
                      width: "100%",
                      overflowX: "hidden",
                      overflowY: "auto",
                      paddingBottom: 30,
                    }}
                  >
                    <Grid container spacing={2} mt={2} px={2}>
                      <Grid item xs={12} md={6} lg={4}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <div className=" mb-3">
                            <Controller
                              name="OrderNo"
                              control={control}
                              render={({ field }) => (
                                <InputTextSearchButton
                                  label="SO NO"
                                  readOnly={true}
                                  disabled={!!DocEntry}
                                  onClick={() => {
                                    OpenDailog();
                                  }}
                                  onChange={OpenDailog}
                                  type="text"
                                  {...field}
                                />
                              )}
                            />
                            <SearchBPModel
                              open={searchmodelOpen}
                              onClose={SearchModelClose}
                              onCancel={SearchModelClose}
                              title="Select Sales Order"
                              onChange={(e) =>
                                handleGetListSearch(e.target.value)
                              }
                              value={getListquery}
                              onClickClear={handleGetListClear}
                              cardData={
                                <>
                                  <InfiniteScroll
                                    dataLength={getListData.length}
                                    next={fetchMoreGetListData}
                                    hasMore={hasMoreGetList}
                                    loader={
                                      <BeatLoader
                                        color={theme.palette.primary.main}
                                      />
                                    }
                                    scrollableTarget="getListForCreateScroll"
                                    endMessage={
                                      <Typography>No More Records</Typography>
                                    }
                                  >
                                    {getListData.map((item, index) => (
                                      <CardComponent
                                        // key={index}
                                        key={item.DocEntry}
                                        title={item.OrderNo}
                                        subtitle={item.PhoneNumber1}
                                        description={item.CardName}
                                        searchResult={getListquery}
                                        isSelected={
                                          allFormData.CardCode === item.CardCode
                                        }
                                        onClick={() => {
                                          onSelectBusinessPartner(
                                            item.DocEntry,
                                          );
                                        }}
                                      />
                                    ))}
                                  </InfiniteScroll>
                                </>
                              }
                            />
                          </div>

                          <div className="mb-3">
                            <Controller
                              name="AppointDate"
                              control={control}
                              render={({ field }) => (
                                <InputDatePickerFields
                                  {...field}
                                  label="APPOINTMENT DATE"
                                  value={field.value}
                                  readOnly={true}
                                  onChange={(date) => field.onChange(date)}
                                />
                              )}
                            />
                          </div>
                          <div className=" mb-3">
                            <Controller
                              name="CardName"
                              control={control}
                              render={({ field }) => (
                                <InputFields
                                  readOnly={true}
                                  {...field}
                                  label="CUSTOMER NAME"
                                />
                              )}
                            />
                          </div>
                          <div className=" mb-3">
                            <Controller
                              name="PhoneNumber1"
                              control={control}
                              render={({ field }) => (
                                <InputFields
                                  readOnly={true}
                                  {...field}
                                  label="CONTACT NO"
                                />
                              )}
                            />
                          </div>
                          <div className=" mb-3">
                            <Controller
                              name="OrderType"
                              control={control}
                              render={({ field }) => (
                                <InputFields
                                  readOnly={true}
                                  {...field}
                                  label="ORDER TYPE"
                                />
                              )}
                            />
                          </div>
                        </div>
                      </Grid>
                      <Grid item xs={12} md={6} lg={4}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <div className=" mb-3">
                            <Controller
                              name="JobWorkAt"
                              control={control}
                              render={({ field }) => (
                                <InputFields
                                  readOnly={true}
                                  {...field}
                                  label="JB WORK AT"
                                />
                              )}
                            />
                          </div>
                          <div className="mb-3">
                            <Tooltip
                              title={(
                                watch("JobWorkDetails") || ""
                              ).toUpperCase()}
                              arrow
                            >
                              <div style={{ width: "100%" }}>
                                <Controller
                                  name="JobWorkDetails"
                                  control={control}
                                  render={({ field }) => (
                                    <InputTextAreaFields
                                      readOnly={true}
                                      {...field}
                                      label="JOB WORK DETAILS"
                                    />
                                  )}
                                />
                              </div>
                            </Tooltip>
                          </div>
                          <div className="mb-3">
                            <Tooltip
                              title={(watch("Vehicle") || "").toUpperCase()}
                              arrow
                            >
                              <div style={{ width: "100%" }}>
                                <Controller
                                  name="Vehicle"
                                  control={control}
                                  render={({ field }) => (
                                    <InputFields
                                      readOnly={true}
                                      {...field}
                                      label="SELECTED VEHICLE"
                                    />
                                  )}
                                />
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                      </Grid>
                      <Grid item xs={12} md={6} lg={4}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <div className=" mb-3">
                            <Controller
                              name="Mileage"
                              control={control}
                              rules={{ required: "Veh Mileage is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputFields
                                  readOnly={allFormData.Status === "0"}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="VEH MILEAGE"
                                />
                              )}
                            />
                          </div>
                          <div className=" mb-3">
                            <Controller
                              name="ChassisNo"
                              control={control}
                              rules={{ required: "Chassis No is required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputFields
                                  readOnly={allFormData.Status === "0"}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="CHASSIS NO"
                                />
                              )}
                            />
                          </div>
                          <div className=" mb-3">
                            <Controller
                              name="RegistrationNo"
                              control={control}
                              rules={{
                                required: "Registration No is required",
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <InputFields
                                  readOnly={allFormData.Status === "0"}
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="REGISTRATION NO"
                                />
                              )}
                            />
                          </div>
                          <div className="mb-3">
                            <Tooltip
                              title={(
                                watch("InspectionRemark") || ""
                              ).toUpperCase()}
                              arrow
                            >
                              <div style={{ width: "100%" }}>
                                <Controller
                                  name="InspectionRemark"
                                  control={control}
                                  rules={{
                                    required: "Inspection Remarks is required",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextAreaFields
                                      readOnly={allFormData.Status === "0"}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      label="INSPECTION REMARKS"
                                    />
                                  )}
                                />
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    item
                    style={{
                      height: "100%",
                      width: "100%",
                      overflowX: "hidden",
                      overflowY: "auto",
                      borderTop: "1px solid #ccc",
                    }}
                  >
                    <Grid
                      container
                      spacing={2}
                      mt={2}
                      px={2}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Grid item xs={12} md={6} lg={4}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <div className=" mb-3">
                            <Controller
                              name="VehInwardNo"
                              control={control}
                              render={({ field }) => (
                                <InputFields
                                  readOnly={true}
                                  {...field}
                                  label="INWARD NO"
                                />
                              )}
                            />
                          </div>

                          <div className=" mb-3">
                            <Controller
                              name="VehInwardTime"
                              control={control}
                              rules={{ required: "Time is Required" }}
                              render={({ field, fieldState: { error } }) => (
                                <InputTimePicker
                                  {...field}
                                  label="INWARD TIME"
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </Grid>

                      <Grid item xs={12} md={6} lg={4}>
                        <div className="mb-3">
                          <Controller
                            name="VehInwardDate"
                            control={control}
                            render={({ field }) => (
                              <InputDatePickerFields
                                {...field}
                                label="INWARD DATE"
                                value={field.value}
                                readOnly={true}
                                onChange={(date) => field.onChange(date)}
                              />
                            )}
                          />
                        </div>

                        <div className=" mb-3">
                          <Controller
                            name="JobCardNo"
                            control={control}
                            render={({ field }) => (
                              <InputFields
                                readOnly={true}
                                {...field}
                                label="JOB CARD NO"
                              />
                            )}
                          />
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    item
                    columnSpacing={2}
                    width="100%"
                    px={3}
                    style={{ paddingTop: 30 }}
                  >
                    <Grid item width="100%" style={{ paddingBottom: 15 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "16px",
                            marginBottom: 0,
                          }}
                        >
                          Signature
                        </Typography>

                        {isSigned && signatureEditable && (
                          <IconButton
                            onClick={clearSignature}
                            size="small"
                            sx={{
                              color: "red",
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>

                    <Grid item width="100%">
                      <div
                        className="Signaturefield"
                        style={{
                          margin: "0 auto",
                        }}
                      >
                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor="black"
                          canvasProps={{
                            className: "sigCanvas",
                            style: {
                              width: "100%",
                              height: "100%",
                              pointerEvents: signatureEditable
                                ? "auto"
                                : "none",
                            },
                          }}
                          onEnd={handleEnd}
                        />
                      </div>
                    </Grid>
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
                  (SaveUpdateName === "UPDATE" && !perms.IsEdit) ||
                  allFormData.Status === "0"
                }
              >
                {SaveUpdateName}
              </Button>

              <Button
                disabled={SaveUpdateName === "SAVE"}
                DocEntry={DocEntry}
                PrintData={PrintData}
                variant="contained"
                color="primary"
              >
                PRINT
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
