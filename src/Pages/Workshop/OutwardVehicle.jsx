import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
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
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import SignatureCanvas from "react-signature-canvas";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerField,
  InputDatePickerFields,
  InputFields,
  InputTextArea,
  InputTextAreaFields,
  InputTextSearchButton,
  InputTimePicker,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import DynamicLoader from "../../Loaders/DynamicLoader";

export default function InwardVehicle() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const timeoutRef = useRef(null);
  const [DocEntry, setDocEntry] = useState("");
  // const [PrintData, setPrintData] = useState([]);

  // const [oldOpenData, setSelectData] = useState(null);
  const [apiloading, setapiloading] = useState(false);
  // let [ok, setok] = useState("OK");
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
    SoNo: "",
    CardName: "",
    PhoneNumber1: "",
    InvoiceNo: "",
    RegistrationNo: "",
    JobWorkAt: "",
    JobWorkDetails: "",
    InwardNo: "",
    VehInwardDate: dayjs(new Date()),
    VehInwardTime: dayjs(),
    JobCardNo: "",
    OutwardNo: "",
    VehOutwardDate: dayjs(new Date()),
    VehOutwardTime: dayjs(),
    OrderDocEntry: "",
    SignPath: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    // clearErrors,
    // setError,
    // formState: { errors },
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

  useEffect(() => {
    if (SaveUpdateName === "SAVE" && sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false);
    }
  }, [SaveUpdateName]);

  const onSelectBusinessPartner = async (selectedItem) => {
    clearSignature();

    try {
      const filledValues = {
        ...selectedItem,
        OrderNo: selectedItem.OrderNo,
        CardName: selectedItem.CardName,
        CardCode: selectedItem.CardCode,
        InvoiceNo: selectedItem.DocNum,
        PhoneNumber1: selectedItem.PhoneNumber1,
        RegistrationNo: selectedItem.RegistrationNo,
        JobWorkAt: selectedItem.JobWorkAt,
        JobWorkDetails: selectedItem.JobRemarks,
        VehInwardNo: selectedItem.VehInwardNo,
        VehInwardDate: selectedItem.VehInwardDate
          ? dayjs(selectedItem.VehInwardDate)
          : null,
        VehInwardTime: dayjs(selectedItem.VehInwardTime, "HH:mm"),
        JobCardNo: selectedItem.JobCardNo,
        VehOutwardDate: dayjs(new Date()),
        VehOutwardTime: dayjs(),
        SignPath: selectedItem.SignPath,
      };

      reset(filledValues);
      SearchModelClose();
    } catch (error) {
      console.error("Error fetching ARInvoice:", error);
    }
  };

  const fetchAndSetData = async (DocEntry) => {
    try {
      if (!DocEntry) return;

      const response = await apiClient.get(`/VehOutward?DocEntry=${DocEntry}`);
      const data = response?.data;

      // Fixed: The API returns 'values' as an object, not an array
      if (data && data.success && data.values) {
        const item = data.values;

        // Use reset to map the API object to the form controllers
        reset({
          ...item,
          // Ensure date is parsed correctly for the DatePicker
          VehInwardDate: item.VehInwardDate
            ? dayjs(item.VehInwardDate)
            : dayjs(),

          // Map the correct time field from the API to your form field
          // If the API provides VehOutwardTime, use it; otherwise fallback
          VehInwardTime: item.VehInwardTime
            ? dayjs(item.VehInwardTime)
            : dayjs(),

          // Ensure the combined display field 'Vehicle' is populated
          Vehicle:
            item.Vehicle ||
            `${item.Year || ""} - ${item.Make || ""} - ${item.Model || ""}`,
        });

        setDocEntry(DocEntry);
        setSaveUpdateName("Update");
      }
    } catch (error) {
      console.error("Fetch Error Detail:", error);
      Swal.fire({
        text: "Failed to fetch vehicle details.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/VehOutward?SearchText=${searchTerm}&Status=1&Page=${pageNum}`
        : `/VehOutward?Status=1&Page=${pageNum}`;

      const { data } = await apiClient.get(url);

      if (data?.success) {
        const newData = data.values ?? [];

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        const pageSize = 20;
        setHasMoreOpen(newData.length === pageSize);
        setOpenListPage(pageNum);
      } else {
        setHasMoreOpen(false);
        Swal.fire({
          text: data?.message || "Something went wrong",
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreOpen(false);

      Swal.fire({
        text: error?.response?.data?.message || error.message || "Server error",
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
      const url = searchTerm
        ? `/VehOutward?SearchText=${searchTerm}&Status=0&Page=${pageNum}`
        : `/VehOutward?Status=0&Page=${pageNum}`;

      const { data } = await apiClient.get(url);

      if (data?.success) {
        const newData = data.values ?? [];

        setHasMoreClosed(newData.length === 20);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        setHasMoreClosed(false);
        Swal.fire({
          text: data?.message || "Something went wrong",
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreClosed(false);

      Swal.fire({
        text: error?.response?.data?.message || error.message || "Server error",
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
          Outward List
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
                          onClick={() => fetchAndSetData(item.DocEntry)}
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
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  const abortControllerRef = useRef(null);

  const fetchGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const encodedSearch = encodeURIComponent(searchTerm.trim());

      const url = encodedSearch
        ? `/VehOutward/CopyFrom?SearchText=${encodedSearch}&Page=${pageNum}`
        : `/VehOutward/CopyFrom?Page=${pageNum}`;

      const { data } = await apiClient.get(url, {
        signal: controller.signal,
      });

      if (data?.success) {
        const newData = data?.values || [];

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          text: data?.message || "No data found",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        return;
      }

      console.error("API Error:", error);

      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "error",
        confirmButtonText: "OK",
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
    setGetListPage(0);
    setGetListData([]);
    fetchGetListData(0);
  };

  const ClearForm = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    clearSignature();
  };

  const handleSubmitForm = async (data) => {
    try {
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

      setapiloading(true);

      const UserId = localStorage.getItem("UserId");
      const CreatedBy = localStorage.getItem("UserName");
      const signatureDataURL = sigCanvas.current.toDataURL().split(",")[1];

      const obj = {
        DocEntry: DocEntry || "",
        UserId: UserId,
        CreatedBy: CreatedBy,
        AppointmentNo: data.AppointmentNo,
        VehInwardNo: data.VehInwardNo,
        OrderNo: data.OrderNo,
        VehInwardDate: dayjs(data.VehInwardDate).format("YYYY-MM-DD HH:mm:ss"),
        RegistrationNo: String(data.RegistrationNo || ""),
        InspectionRemark: data.InspectionRemark,
        VehicleDocEntry: "0",
        Mileage: String(data.Mileage || ""),
        ChassisNo: String(data.ChassisNo || ""),
        VehInwardTime: data.VehInwardTime
          ? dayjs(data.VehInwardTime).format("HH:mm")
          : "",
        PhoneNumber1: data.PhoneNumber1,
        CardName: data.CardName,
        CardCode: data.CardCode,
        JobWorkAt: data.JobWorkAt,
        Year: data.Year,
        Make: data.Make,
        Model: data.Model,
        JobWorkDetails: data.JobWorkDetails,
        OrderType: data.OrderType,
        OrderDocEntry: String(data.OrderDocEntry || ""),
        SignPathByteArray: signatureDataURL,
      };

      if (SaveUpdateName === "SAVE") {
        const { data: res } = await apiClient.post(`/VehOutward`, obj);

        if (res.success) {
          setOpenListData([]);
          fetchOpenListData(0);
          handleGetListClear();
          ClearForm();

          Swal.fire({
            title: "Success!",
            text: "Outward Vehicle Added Successfully",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          throw new Error(res.message || "Failed to add vehicle.");
        }
      } else if (SaveUpdateName === "Update") {
        // PUT for updates
        const confirm = await Swal.fire({
          text: `Do you want to Update ${data.DocNum || "this record"}?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "YES",
          cancelButtonText: "No",
        });

        if (!confirm.isConfirmed) {
          setapiloading(false);
          return;
        }

        const { data: res } = await apiClient.put(
          `/VehOutward/${DocEntry}`,
          obj,
        );

        if (res.success) {
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          ClearForm();

          Swal.fire({
            title: "Success!",
            text: "Outward Vehicle Updated",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
          });
        } else {
          throw new Error(res.message || "Failed to update vehicle.");
        }
      }
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setapiloading(false);
    }
  };

  return (
    <>
      <DynamicLoader open={apiloading} />
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
          position="relative"
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{
              display: {
                lg: "none",
              },
              position: "absolute",
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
              Outward Vehicle
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
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
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
                        <SearchModel
                          open={searchmodelOpen}
                          onClose={SearchModelClose}
                          onCancel={SearchModelClose}
                          title="Select Sales Order"
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
                                      onSelectBusinessPartner(item);
                                    }}
                                  />
                                ))}
                              </InfiniteScroll>
                            </>
                          }
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="RegistrationNo"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              readOnly={true}
                              {...field}
                              label="REGISTRATION NO"
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
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
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
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
                      </Grid>

                      <Grid item textAlign="center">
                        <Tooltip
                          title={(watch("Vehicle") || "").toUpperCase()}
                          arrow
                        >
                          <div style={{ width: "100%" }}>
                            <Controller
                              name="InvoiceNo"
                              control={control}
                              render={({ field }) => (
                                <InputFields
                                  readOnly={true}
                                  {...field}
                                  label="INVOICE NO"
                                />
                              )}
                            />
                          </div>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
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
                      </Grid>

                      <Grid item textAlign="center">
                        <Tooltip
                          title={(watch("JobWorkDetails") || "").toUpperCase()}
                          arrow
                        >
                          <div style={{ width: "100%" }}>
                            <Controller
                              name="JobWorkDetails"
                              control={control}
                              render={({ field }) => (
                                <InputTextArea
                                  readOnly={true}
                                  {...field}
                                  label="JOB WORK DETAILS"
                                />
                              )}
                            />
                          </div>
                        </Tooltip>
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
                      marginTop: 20,
                    }}
                  >
                    <Grid
                      container
                      spacing={2}
                      mt={1}
                      px={2}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Grid item xs={12} md={4}>
                        <Grid container direction="column">
                          <Grid item textAlign="center">
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
                          </Grid>

                          <Grid item textAlign="center">
                            <Controller
                              name="VehInwardTime"
                              control={control}
                              render={({ field }) => (
                                <InputTimePicker
                                  {...field}
                                  label="INWARD TIME"
                                  readOnly={true}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Grid container direction="column">
                          <Grid item textAlign="center">
                            <Controller
                              name="VehInwardDate"
                              control={control}
                              render={({ field }) => (
                                <InputDatePickerField
                                  {...field}
                                  label="INWARD DATE"
                                  value={field.value}
                                  readOnly={true}
                                />
                              )}
                            />
                          </Grid>

                          <Grid item textAlign="center">
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
                          </Grid>
                        </Grid>
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
                      marginTop: "30px",
                      borderTop: "1px solid #ccc",
                      paddingTop: 20,
                    }}
                  >
                    <Grid item xs={12} md={4}>
                      <Grid container direction="column">
                        <Grid item textAlign="center">
                          <Controller
                            name="DocNum"
                            control={control}
                            render={({ field }) => (
                              <InputFields
                                readOnly={true}
                                {...field}
                                label="OUTWARD NO"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Grid container direction="column">
                        <Grid item textAlign="center">
                          <Controller
                            name="VehInwardTime"
                            control={control}
                            render={({ field }) => (
                              <InputTimePicker
                                {...field}
                                label="OUTWARD TIME"
                                readOnly={true}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Grid container direction="column">
                        <Grid item textAlign="center">
                          <Controller
                            name="VehInwardDate"
                            control={control}
                            render={({ field }) => (
                              <InputDatePickerField
                                {...field}
                                label="OUTWARD DATE"
                                value={field.value}
                                readOnly={true}
                              />
                            )}
                          />
                        </Grid>
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
                color="success"
                type="submit"
                name={SaveUpdateName}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName === "UPDATE" && !perms.IsEdit) ||
                  allFormData.Status === "0"
                }
              >
                SAVE
              </Button>

              <Button variant="contained" type="button">
                SHEET
              </Button>

              <Button
                disabled={SaveUpdateName === "SAVE"}
                DocEntry={DocEntry}
                // PrintData={PrintData}
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
