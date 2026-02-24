import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  InputTextField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tab, Tabs } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { DataGrid } from "@mui/x-data-grid";

import {
  InputSelectFields,
  InputTextSearchButton,
} from "../Components/FormComponentMaster";
import CardComponent from "../Components/CardComponent";
import usePermissions from "../Components/usePermissions";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SearchModel from "../Components/SearchModel";

export default function BinLocationMaster() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [open, setOpen] = React.useState(false);

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);

  //=====================================closed List State====================================================================

  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };

  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };
  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);
    fetchGetListData(0);
  };
  const fetchGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/Appointment/CopyFrom?SearchText=${searchTerm}&page=${pageNum}&limit=20`
        : `/Appointment/CopyFrom?page=${pageNum}&limit=20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else if (response.data.success === false) {
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "YES",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const onSelectBusinessPartner = async (OrderNo) => {
    const res = await apiClient.get(`/Appointment/CopyFrom?OrderNo=${OrderNo}`);
    const data = res.data.values[0];

    reset({
      ...data,
      OrderNo: data.OrderNo,
      CustomerName: data.CardName,
      ContactNo: data.PhoneNumber1,
      AppointmentNo: data.DocNum,
      OrderSubType: data.OrderType,
      AppointType: data.OrderSubType,
      OrderDocEntry: data.DocEntry,
      oLines: data.oLines.map((line) => ({
        ItemName: line.ItemName,
        ItemCode: line.ItemCode,
        WHSCode: line.WHSCode,
        Quantity: Number(line.Quantity).toFixed(3),
        IssueQty: Number(line.Quantity).toFixed(3),
        AppointmentStatus: line.AppointmentStatus,
        BookedQuantity: line.BookedQuantity,
        FTSQty: line.FTSQty,
        LineFittingTime: line.LineFittingTime,
        LineNum: line.LineNum,
      })),
    });
    SearchModelClose();
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
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
  useEffect(() => {
    if (searchmodelOpen === true) {
      fetchGetListData(0);
    }
  }, [searchmodelOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  const { user } = useAuth();
  const perms = usePermissions(64);

  const timeoutRef = useRef(null);
  const initial = {
    OrderNo: "",
    OrderNo: "",
    AppointmentNo: "",
    ContactNo: "",
    CustomerName: "",
    DocEntry: "",
    CardCode: "",
    CardName: "",
    PhoneNumber1: "",
    JobRemarks: "",
    WalkIn: "",
    AppointType: "",
    VehicleDocEntry: "",
    Year: "",
    Make: "",
    Model: "",
    Jack: "",
    AppointDate: dayjs(),
    AppointTimeTo: dayjs("HH:mm:A"),
    AppointTimeFrom: dayjs("HH:mm:A"),
    OrderType: "",
    OrderSubType: "",
    oLines: [],
  };
  const InitialFld = {
    CancelRemarks: "",
  };
  const { control, handleSubmit, reset, getValues, setValue, watch } = useForm({
    defaultValues: initial,
  });
  const {
    control: control1,
    handleSubmit: handleSubmit1,
    reset: reset1,
    getValues: getValues1,
    setValue: setValue1,
    watch: watch1,
  } = useForm({
    defaultValues: InitialFld,
  });
  const AllData = getValues();

  const oLines = useWatch({ control, name: "oLines" });

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/Appointment?Status=1&SearchText=${searchTerm}&Page=${pageNum}&Limit=20`
        : `/Appointment?Status=1&Page=${pageNum}&Limit=20`;

      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleOpenListSearch = (res) => {
    setOpenListQuery(res);
    setOpenListSearching(true);
    setOpenListPage(0);
    setOpenListData([]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res);
    }, 600);
  };

  // Clear search
  const handleOpenListClear = () => {
    setOpenListQuery("");
    setOpenListSearching(false);
    setOpenListPage(0);
    setOpenListData([]);
    fetchOpenListData(0);
  };

  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchOpenListData(0);
  }, []);

  // ============================================Closed List Start ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/Appointment?Status=0&SearchText=${searchTerm}&Page=${pageNum}&Limit=20`
        : `/Appointment?Status=0&Page=${pageNum}&Limit=20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreClosed(false);
        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const handleClosedListClear = () => {
    setClosedListQuery("");
    setClosedListSearching(false);
    setClosedListPage(0);
    setClosedListData([]);
    fetchClosedListData(0);
  };

  const fetchMoreClosedListData = () => {
    fetchClosedListData(
      closedListPage + 1,
      closedListSearching ? closedListquery : "",
    );
    setClosedListPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchClosedListData(0);
  }, []);

  const setOldDataOPen = async (DocEntry) => {
    console.log(DocEntry);

    toggleSidebar();
    setSaveUpdateName("UPDATE");
    try {
      const { data } = await apiClient.get(`/Appointment/${DocEntry}`);
      console.log(data);
      if (data.success === true) {
        let { values } = data;
        console.log(values);
        reset({
          ...values,
          OrderNo: values.OrderNo,
          CustomerName: values.CardName,
          ContactNo: values.PhoneNumber1,
          AppointmentNo: values.DocNum,
          OrderSubType: values.OrderType,
          AppointType: values.AppointType,
          Vehicle: values.Vehicle,
          IsInward: values.IsInward,
          oLines: values.oLines,
          Status: values.Status === "1" ? true : false,
          NoAutoAllc: true ? "Y" : "N",
          ReceiveBin: true ? "Y" : "N",
        });
      } else if (data.success === false) {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  const ClearFormData = () => {
    setSaveUpdateName("SAVE");
    reset(initial);
  };
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const columns = [
    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 150,
    },
    {
      field: "ItemName",
      headerName: "ITEM DESCRIPTION",
      width: 150,
    },
    {
      field: "OrderQuantity",
      headerName: "ORDER QTY",
      width: 150,
    },
    {
      field: "FTSQty",
      headerName: "FTS",
      width: 150,
    },
    {
      field: "Quantity",
      headerName: "QTY",
      width: 120,
      type: "number",
      editable: true,
    },
    {
      field: "Status",
      headerName: "STATUS",
      width: 120,
      type: "number",
      editable: true,
    },
    {
      field: "BookedQuantity",
      headerName: "BOOKED QTY",
      width: 120,
      type: "number",
      editable: true,
    },
    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          type="button"
          color="error"
          size="small"
          onClick={() => {
            const currentLines = getValues("oLines");

            const rowIndex = params.api.getRowIndexRelativeToVisibleRows(
              params.id,
            );

            const updatedLines = currentLines.filter(
              (_, index) => index !== rowIndex,
            );

            setValue("oLines", updatedLines, { shouldDirty: true });
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];
  const onSubmit1 = async (data) => {
    if (!data.CancelRemarks || data.CancelRemarks.trim() === "") {
      Swal.fire({
        icon: "warning",
        text: "You cannot cancel this appointment without remarks.",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }
    const UserId = localStorage.getItem("UserId");
    const CreatedBy = localStorage.getItem("UserName");

    const obj = {
      UserId: UserId,
      CreatedBy: CreatedBy || "",
      CancelBy: CreatedBy || "",
      CancelRemarks: data.CancelRemarks,
    };

    try {
      const res = await apiClient.put(
        `/Appointment/Cancel/${getValues("DocEntry")}`,
        obj,
      );

      if (res.data.success) {
        handleClose();
        Swal.fire({
          title: "Success!",
          text: "Appointment Cancel successfully!",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data.message,
          icon: "error",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleSumbit = (data) => {
    const UserId = localStorage.getItem("UserId");
    const UserName = localStorage.getItem("UserName");

    if (!data.OrderNo) {
      Swal.fire({
        text: "Please select order",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    if (dayjs(data.AppointDate).day() === 5) {
      Swal.fire({
        text: "You can not book appointment on friday",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    if (!data.AppointTimeFrom) {
      Swal.fire({
        text: "Please Select Working Appointment Time",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    const obj = {
      UserId: UserId,
      CreatedBy: UserName,
      ModifiedBy: UserName,
      DocDate: dayjs(),
      AppointDate: data.AppointDate,
      AppointTimeFrom: data.AppointTimeFrom,
      AppointTimeTo: dayjs(data.AppointTimeTo).format("HH:mm a"),
      OrderDocEntry: data.OrderDocEntry,
      JobRemarks: data.JobRemarks,
      Jack: data.Jack ?? "0",
      AppointType: data.AppointType,
      CardCode: data.CardCode,
      CardName: data.CardName,
      PhoneNumber1: data.PhoneNumber1,
      OrderNo: data.OrderNo,
      TotalReqTime: data.TotalReqTime,
      VehicleDocEntry: data.VehicleDocEntry,
      IsInward: data.IsInward,
      AppointStatus: data.AppointStatus,

      // 1990 - TOYOTA - LC100
      Year: data.Year || "1990",
      Make: data.Make || "TOYOTA",
      Model: data.Model || "LC100",
      Series: "-1",
      // AppointTimeTo: data.AppointTimeTo,
      oLines: data.oLines.map((item) => ({
        UserId: UserId,
        CreatedBy: UserName,
        ModifiedBy: UserName,
        // Status: String(item.Status),
        ItemCode: item.ItemCode,
        WHSCode: item.WHSCode,
        UnitOfMeasurement: item.UnitOfMeasurement,
        SOQuantity: item.SOQuantity,
        OpenQuantity: item.OpenQuantity,
        Quantity: item.Quantity,
        ParentItemCode: item.ParentItemCode,
        Jack: item.Jack,
        RequiredTime: item.RequiredTime,
        LineNum: item.LineNum,
        ItemName: item.ItemName,
        AppointmentStatus: item.FTSQty >= item.IssueQty ? "1" : "0",
        BookedQuantity: item.BookedQuantity,
        FTSQty: item.FTSQty,
      })),
    };

    console.log("object ", obj);
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/Appointment`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearFormData();
            setOpenListData([]);
            fetchOpenListData(0);
            fetchClosedListData(0);
            Swal.fire({
              title: "Success!",
              text: "Appointment saved Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "error",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          }
        })
        .catch((error) => {
          console.error("Error Post time", error);
          Swal.fire({
            title: "Error!",
            text: "something went wrong" + error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else {
      Swal.fire({
        text: `Do You Want Update "${obj.WHSCode}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(`/Appointment/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                ClearFormData();
                setOpenListData([]);
                fetchOpenListData(0);
                fetchClosedListData(0);

                Swal.fire({
                  title: "Success!",
                  text: "Bin Location Updated",
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
            text: "Bin Location Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
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
          Booked Appointment List
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
                      title={item.DocNum}
                      subtitle={item.CardName}
                      description={item.PhoneNumber1}
                      searchResult={openListquery}
                      onClick={() => setOldDataOPen(item.DocEntry)}
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
                      title={item.DocNum}
                      subtitle={item.CardName}
                      description={item.PhoneNumber1}
                      searchResult={openListquery}
                      onClick={() => setOldDataOPen(item.DocEntry)}
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
  const watchedDate = watch("AppointDate");

  const isToday = watchedDate && dayjs(watchedDate).isSame(dayjs(), "day");

  useEffect(() => {
    if (!watchedDate) return;

    const now = dayjs();
    const selectedDate = dayjs(watchedDate);
    const isToday = selectedDate.isSame(now, "day");

    let autoTime;

    if (isToday) {
      const remainder = now.minute() % 30;
      autoTime = remainder === 0 ? now : now.add(30 - remainder, "minute");

      if (autoTime.hour() < 8) {
        autoTime = autoTime.hour(8).minute(0);
      }

      if (autoTime.hour() >= 20) {
        setValue("AppointTimeFrom", "");
        return;
      }
    } else {
      autoTime = dayjs().hour(8).minute(0);
    }

    setValue("AppointTimeFrom", autoTime.format("HH:mm"), {
      shouldValidate: true,
    });
  }, [watchedDate, setValue]);

  return (
    <>
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(handleSumbit)}
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
            onClick={ClearFormData}
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
              Booking Appointment
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
              width={"100%"}
            >
              <Box
                // component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="OrderNo"
                      control={control}
                      rules={{ required: "Card Code is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="SO NO"
                          type="text"
                          readOnly={true}
                          onClick={() => {
                            OpenDailog();
                          }}
                          onChange={OpenDailog}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
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
                            style={{ textAlign: "center" }}
                            dataLength={getListData.length}
                            next={fetchMoreGetListData}
                            hasMore={hasMoreGetList}
                            loader={
                              <BeatLoader
                                color={
                                  theme.palette.mode === "light"
                                    ? "black"
                                    : "white"
                                }
                              />
                            }
                            scrollableTarget="getListForCreateScroll"
                            endMessage={
                              <Typography textAlign={"center"}>
                                No More Records
                              </Typography>
                            }
                          >
                            {getListData.map((item, index) => (
                              <CardComponent
                                key={index}
                                title={item.CardCode}
                                subtitle={item.CardName}
                                description={item.Cellular}
                                searchResult={getListquery}
                                isSelected={AllData.CardCode === item.CardCode}
                                onClick={() => {
                                  onSelectBusinessPartner(item.OrderNo);
                                }}
                              />
                            ))}
                          </InfiniteScroll>
                        </>
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CustomerName"
                      control={control}
                      rules={{ required: "Customer Name is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CUSTOMER NAME"
                          type="text"
                          readOnly={true}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ContactNo"
                      control={control}
                      rules={{ required: "Card Name is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CONTACT NO"
                          type="text"
                          readOnly={true}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="AppointmentNo"
                      control={control}
                      // rules={{ required: "Appointment No is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="APPOINTMENT NO"
                          type="text"
                          readOnly={true}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign="center">
                    <Controller
                      name="AppointType"
                      control={control}
                      rules={{ required: "Appointment Type is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectFields
                          disabled
                          label="APPOINTMENT TYPE"
                          {...field}
                          data={[
                            { key: "WALK-IN", value: "WALK-IN" },
                            { key: "REGULAR", value: "REGULAR" },
                          ]}
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="OrderSubType"
                      control={control}
                      rules={{ required: " Order Type is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ORDER TYPE"
                          type="text"
                          readOnly={true}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} p={5}>
                    <Grid
                      container
                      item
                      sx={{
                        overflow: "auto",
                        width: "100%",
                        height: "300px",
                        mt: "5px",
                      }}
                    >
                      <DataGrid
                        className="datagrid-style"
                        rows={oLines}
                        columns={columns}
                        getRowId={(row) => row.LineNum}
                        columnHeaderHeight={35}
                        rowHeight={40}
                        hideFooter
                        autoHeight="false"
                        sx={gridSx}
                      />
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Vehicle"
                      control={control}
                      // rules={{ required: "Selected Vehicle Is Required" }}
                      render={({
                        field: { ref, ...fieldList },
                        fieldState: { error },
                      }) => (
                        <InputTextField
                          {...fieldList}
                          inputRef={ref}
                          label="SELECTED VEHICLE"
                          type="text"
                          value={`${getValues("Year") || "1990"} - ${getValues("Make") || "TOYOTA"} - ${getValues("Model") || "LC100"}`}
                          readOnly={true}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="AppointDate"
                      control={control}
                      rules={{ required: "Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="APPOINTMENT DATE"
                          value={field.value ? dayjs(field.value) : null}
                          minDate={dayjs()}
                          onChange={(date) =>
                            setValue("AppointDate", date, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Controller
                        name="AppointTimeFrom"
                        control={control}
                        rules={{ required: "Time is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <TimePicker
                            label="FROM"
                            ampm
                            timeSteps={{ minutes: 30 }}
                            value={
                              field.value ? dayjs(field.value, "HH:mm") : null
                            }
                            onChange={(newValue) =>
                              field.onChange(
                                newValue ? newValue.format("HH:mm") : "",
                              )
                            }
                            shouldDisableTime={(value, view) => {
                              const now = dayjs();

                              const hour = value.hour();
                              const minute = value.minute();

                              if (view === "hours") {
                                if (hour < 8 || hour > 20) return true;

                                if (isToday && hour < now.hour()) return true;

                                return false;
                              }

                              if (view === "minutes") {
                                if (minute !== 0 && minute !== 30) return true;

                                if (hour === 20 && minute > 0) return true;

                                if (isToday) {
                                  if (hour < now.hour()) return true;

                                  if (
                                    hour === now.hour() &&
                                    minute <= now.minute()
                                  ) {
                                    return true;
                                  }
                                }

                                return false;
                              }

                              return false;
                            }}
                            slotProps={{
                              textField: {
                                size: "small",
                                error: !!error,
                                helperText: error?.message,
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Dialog
              open={open}
              onClose={handleClose}
              fullWidth
              maxWidth="xs"
              scroll="paper"
            >
              <form onSubmit={handleSubmit1(onSubmit1)}>
                {/* ===== Title ===== */}
                <DialogTitle>
                  <Grid container justifyContent="center" alignItems="center">
                    <Typography fontWeight="bold">
                      Appointment Cancel
                    </Typography>

                    <IconButton
                      onClick={handleClose}
                      sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </DialogTitle>

                <Divider />

                {/* ===== Content ===== */}
                <DialogContent>
                  <Grid container spacing={2}>
                    {/* Appointment Number */}
                    <Grid
                      item
                      xs={12}
                      md={12}
                      lg={12}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="AppointmentNo"
                        control={control1}
                        // rules={{ required: "Appointment No is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            label="APPOINTMENT NO"
                            type="text"
                            readOnly
                            value={getValues("AppointmentNo")}
                            inputProps={{ maxLength: 19 }}
                            error={!!error}
                            helperText={error?.message}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>

                    {/* Cancel Reason */}
                    <Grid
                      item
                      xs={12}
                      md={12}
                      lg={12}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="CancelRemarks"
                        control={control1}
                        rules={{ required: "Cancel reason is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            label="CANCELLATION REMARK"
                            multiline
                            rows={4}
                            error={!!error}
                            helperText={error?.message}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>

                <Divider />

                <DialogActions>
                  <Grid container px={2} py={1} justifyContent="space-between">
                    <Button
                      type={onSubmit1}
                      variant="contained"
                      color="success"
                    >
                      Save
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleClose}
                    >
                      Close
                    </Button>
                  </Grid>
                </DialogActions>
              </form>
            </Dialog>
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
                sx={{ color: "white" }}
                color="success"
                type="submit"
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                // disabled={tab !== "1"}
              >
                {SaveUpdateName}
              </Button>

              <Button
                variant="contained"
                sx={{ color: "white" }}
                color="error"
                type="button"
                disabled={SaveUpdateName === "SAVE" || watch("IsInward") !== ""}
                onClick={() => {
                  handleOpen();
                }}
              >
                CANCEL APPOINTMENT
              </Button>

              <Button
                variant="contained"
                color="primary"
                disabled={!perms.IsDelete}
                // onClick={handleDelete}
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
