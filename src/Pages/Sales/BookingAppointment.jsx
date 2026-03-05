import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import { TabContext, TabPanel } from "@mui/lab";
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
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import {
  InputSelectFields,
  InputTextSearchButton,
} from "../Components/FormComponentMaster";
import {
  InputTextField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";

const SHOP_OPEN = 8; // 8 AM
const SHOP_CLOSE = 20; // 8 PM

export default function BookingAppointment() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [open, setOpen] = React.useState(false);

  // ===== Open List State =====
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== Closed List State =====
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);

  // ===== Search Model State =====
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const OpenDailog = () => {
    setSearchmodelOpen(true);
    setGetListQuery("");
  };
  const SearchModelClose = () => {
    setSearchmodelOpen(false);
    setGetListQuery("");
  };

  const timeoutRef = useRef(null);
  const perms = usePermissions(357);

  const initial = {
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
    AppointTimeFrom: null,
    AppointTimeTo: null,
    OrderType: "",
    OrderSubType: "",
    oLines: [],
  };

  const InitialFld = { CancelRemarks: "" };

  const { control, handleSubmit, reset, getValues, setValue, watch } = useForm({
    defaultValues: initial,
  });

  const { control: control1, handleSubmit: handleSubmit1 } = useForm({
    defaultValues: InitialFld,
  });

  const AllData = getValues();
  const oLines = useWatch({ control, name: "oLines" });

  const parseTime = (val) => {
    if (!val) return null;
    if (dayjs.isDayjs(val) && val.isValid()) return val;
    const full = dayjs(val);
    if (full.isValid()) return full;
    const hhmm = dayjs(val, "HH:mm");
    return hhmm.isValid() ? hhmm : null;
  };

  const formatTime = (val) => {
    if (!val) return "";
    if (dayjs.isDayjs(val)) return val.format("HH:mm");
    const parsed = dayjs(val, "HH:mm");
    return parsed.isValid() ? parsed.format("HH:mm") : "";
  };

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
      console.error("Error fetching open list:", error);
    }
  };

  const handleOpenListSearch = (res) => {
    setOpenListQuery(res);
    setOpenListSearching(true);
    setOpenListPage(0);
    setOpenListData([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchOpenListData(0, res), 600);
  };

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
      console.error("Error fetching closed list:", error);
    }
  };

  const handleClosedListSearch = (res) => {
    setClosedListQuery(res);
    setClosedListSearching(true);
    setClosedListPage(0);
    setClosedListData([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchClosedListData(0, res), 600);
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
      } else {
        setHasMoreGetList(false);
      }
    } catch (error) {
      setHasMoreGetList(false);
      console.error("Error fetching get list:", error);
    }
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);
    fetchGetListData(0);
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
    setHasMoreGetList(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchGetListData(0, res), 600);
  };

  useEffect(() => {
    if (searchmodelOpen) fetchGetListData(0);
  }, [searchmodelOpen]);

  const onSelectBusinessPartner = async (selectedItem) => {
    try {
      setLoading(true);
      const filledValues = {
        ...initial,
        ...selectedItem,
        OrderNo: selectedItem.OrderNo,
        CustomerName: selectedItem.CardName,
        ContactNo: selectedItem.PhoneNumber1,
        AppointmentNo: selectedItem.DocNum,
        OrderSubType: selectedItem.OrderType,
        AppointType: selectedItem.OrderSubType,
        OrderDocEntry: selectedItem.DocEntry,
        AppointDate: dayjs(),
        AppointTimeFrom: null,
        AppointTimeTo: null,
        oLines: selectedItem.oLines.map((line) => ({
          ItemName: line.ItemName,
          ItemCode: line.ItemCode,
          WHSCode: line.WHSCode,
          Quantity: Number(line.Quantity).toFixed(3),
          IssueQty: Number(line.Quantity).toFixed(3),
          AppointmentStatus: line.AppointmentStatus,
          OrderQuantity: Number(line.Quantity).toFixed(3),
          Status: line.Status,
          BookedQuantity: line.BookedQuantity,
          FTSQty: line.FTSQty,
          LineFittingTime: line.LineFittingTime,
          LineNum: line.LineNum,
        })),
      };

      reset(filledValues);
      SearchModelClose();
    } catch (error) {
      console.error("Error selecting business partner:", error);
    } finally {
      setLoading(false);
    }
  };

  const setOldDataOPen = async (DocEntry) => {
    setLoading(true);
    setSaveUpdateName("UPDATE");
    try {
      const { data } = await apiClient.get(`/Appointment/${DocEntry}`);
      if (data.success === true) {
        const values = data.values;
        reset({
          ...values,
          OrderNo: values.OrderNo,
          CustomerName: values.CardName,
          ContactNo: values.PhoneNumber1,
          AppointmentNo: values.DocNum,
          AppointTimeFrom: parseTime(values.AppointTimeFrom),
          AppointTimeTo: parseTime(values.AppointTimeTo),
          OrderSubType: values.AppointType,
          OrderType: values.OrderType,
          AppointType: values.AppointType,
          Vehicle: values.Vehicle,
          IsInward: values.IsInward,

          Status: values.Status === "1",
          NoAutoAllc: "Y",
          ReceiveBin: "Y",
          oLines: values.oLines.map((line) => ({
            ItemName: line.ItemName,
            ItemCode: line.ItemCode,
            WHSCode: line.WHSCode,
            Quantity: Number(line.Quantity).toFixed(3),
            IssueQty: Number(line.Quantity).toFixed(3),
            AppointmentStatus: line.AppointmentStatus,
            OrderQuantity: Number(line.Quantity).toFixed(3),
            Status: line.Status,
            BookedQuantity: line.BookedQuantity,
            FTSQty: line.FTSQty,
            LineFittingTime: line.LineFittingTime,
            LineNum: line.LineNum,
          })),
        });
        setSidebarOpen(true);
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error loading record:", error);
    } finally {
      setLoading(false);
    }
  };

  const ClearFormData = () => {
    setSaveUpdateName("SAVE");
    reset(initial);
  };

  const handleTabChangeRight = (e, newvalue1) => settab(newvalue1);
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const currentStatus = watch("Status");
  const isClosed =
    currentStatus === "0" || currentStatus === 0 || currentStatus === false;

  const isOpen =
    currentStatus === "1" || currentStatus === 1 || currentStatus === true;

  const columns = [
    { field: "ItemCode", headerName: "ITEM CODE", width: 150 },
    { field: "ItemName", headerName: "ITEM DESCRIPTION", width: 350 },
    {
      field: "WHSCode",
      headerName: "WHSCODE",
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "OrderQuantity",
      headerName: "ORDER QTY",
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "FTSQty",
      headerName: "FTS",
      width: 150,
      headerAlign: "center",
      align: "center",
      type: "number",
    },
    {
      field: "Quantity",
      headerName: "QTY",
      width: 130,
      type: "number",
      editable: true,
    },

    {
      field: "Status",
      headerName: "STATUS",
      width: 120,
      renderCell: (params) => (
        <span>{params.row.Status === "1" ? "NOT BOOKED" : "BOOKED"}</span>
      ),
    },
    {
      field: "BookedQuantity",
      headerName: "BOOKED QTY",
      width: 120,
      type: "number",
    },
    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const currentStatus = watch("Status");
        const isClosed =
          currentStatus === "0" ||
          currentStatus === 0 ||
          currentStatus === false ||
          SaveUpdateName === "UPDATE";

        return (
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
                (_, i) => i !== rowIndex,
              );
              setValue("oLines", updatedLines, { shouldDirty: true });
            }}
            disabled={isClosed}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        );
      },
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
      UserId,
      CreatedBy: CreatedBy || "",
      CancelBy: CreatedBy || "",
      CancelRemarks: data.CancelRemarks,
    };
    setLoading(true);
    try {
      const res = await apiClient.put(
        `/Appointment/Cancel/${getValues("DocEntry")}`,
        obj,
      );
      if (res.data.success) {
        setLoading(false);
        handleClose();
        Swal.fire({
          title: "Success!",
          text: "Appointment Cancelled successfully!",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        setLoading(false);
        Swal.fire({
          title: "Error!",
          text: res.data.message,
          icon: "error",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      }
    } catch (error) {
      setLoading(false);
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
      UserId,
      CreatedBy: UserName,
      ModifiedBy: UserName,
      DocDate: dayjs(),
      AppointDate: data.AppointDate,
      AppointTimeFrom: formatTime(data.AppointTimeFrom),
      AppointTimeTo: formatTime(data.AppointTimeTo),
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
      Year: data.Year || "1990",
      Make: data.Make || "TOYOTA",
      Model: data.Model || "LC100",
      Series: "-1",
      oLines: data.oLines.map((item) => ({
        UserId,
        CreatedBy: UserName,
        ModifiedBy: UserName,
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
        BookedQuantity: item.Quantity,
        FTSQty: item.FTSQty,
      })),
    };

    if (SaveUpdateName === "SAVE") {
      setLoading(true);
      apiClient
        .post(`/Appointment`, obj)
        .then((res) => {
          if (res.data.success) {
            setLoading(false);
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
            setLoading(false);
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        })
        .catch((error) => {
          setLoading(false);
          Swal.fire({
            title: "Error!",
            text: "Something went wrong: " + error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else {
      setLoading(true);
      Swal.fire({
        text: `Do You Want to Update this Appointment?`,
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
                setLoading(false);
                ClearFormData();
                setOpenListData([]);
                fetchOpenListData(0);
                fetchClosedListData(0);
                Swal.fire({
                  title: "Success!",
                  text: "Appointment Updated",
                  icon: "success",
                  confirmButtonText: "Ok",
                  timer: 1000,
                });
              } else {
                setLoading(false);
                Swal.fire({
                  title: "Error!",
                  text: response.data.message,
                  icon: "warning",
                  confirmButtonText: "Ok",
                });
              }
            })
            .catch(() => {
              setLoading(false);
              Swal.fire({
                title: "Error!",
                text: "Something went wrong",
                icon: "warning",
                confirmButtonText: "Ok",
              });
            });
        } else {
          setLoading(false);
          Swal.fire({
            text: "Appointment Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  // ===== Watched Date → Auto-set time (SAVE mode only) =====
  const watchedDate = watch("AppointDate");

  // isToday: true when the selected appointment date is today
  const isToday = watchedDate && dayjs(watchedDate).isSame(dayjs(), "day");

  useEffect(() => {
    // Do NOT overwrite time when editing an existing record
    if (SaveUpdateName === "UPDATE") return;
    if (!watchedDate) return;

    const now = dayjs();
    const isTodaySelected = dayjs(watchedDate).isSame(now, "day");
    let autoTime;

    if (isTodaySelected) {
      // Round up to the next :00 or :30 slot
      const remainder = now.minute() % 30;
      autoTime = (remainder === 0 ? now : now.add(30 - remainder, "minute"))
        .second(0)
        .millisecond(0);

      // Clamp to shop open
      if (autoTime.hour() < SHOP_OPEN) {
        autoTime = autoTime.hour(SHOP_OPEN).minute(0).second(0);
      }
      // No slots left today
      if (autoTime.hour() >= SHOP_CLOSE) {
        setValue("AppointTimeFrom", null, { shouldValidate: true });
        return;
      }
    } else {
      // Future date — default to 8:00 AM
      autoTime = dayjs().hour(SHOP_OPEN).minute(0).second(0);
    }

    setValue("AppointTimeFrom", autoTime, { shouldValidate: true });
  }, [watchedDate, setValue, SaveUpdateName]);

  // ===== Sidebar =====
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
        <Grid item md={12} sm={12} width={"100%"} height={`calc(100% - 50px)`}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              typography: "body1",
              "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
                padding: 0,
              },
              "& .MuiTabs-flexContainer": { justifyContent: "space-around" },
            }}
          >
            <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={handleTabChangeRight}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="1" label="OPEN" />
                <Tab value="0" label="CLOSED" />
              </Tabs>

              {/* OPEN Tab */}
              <TabPanel
                value={"1"}
                style={{
                  overflow: "auto",
                  maxHeight: "calc(100% - 15px)",
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
                  maxHeight: "calc(100% - 15px)",
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
                      searchResult={closedListquery}
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

  return (
    <>
      <Loader open={loading} />
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
            display: { lg: "block", xs: sidebarOpen ? "block" : "none" },
          }}
        >
          {sidebarContent}
        </Grid>

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
            onClick={() => setSidebarOpen((prev) => !prev)}
            sx={{ display: { lg: "none" }, position: "absolute", left: "10px" }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="new"
            onClick={ClearFormData}
            sx={{ position: "absolute", right: "10px" }}
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
                sx={{ "& .MuiTextField-root": { m: 1 } }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="OrderNo"
                      control={control}
                      render={({ field }) => (
                        <InputTextSearchButton
                          label="SO NO"
                          type="text"
                          onClick={() => {
                            OpenDailog();
                          }}
                          onChange={OpenDailog}
                          {...field}
                          readOnly={true}
                          disabled={isClosed || isOpen}
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
                              onClick={() => onSelectBusinessPartner(item)}
                            />
                          ))}
                        </InfiniteScroll>
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
                      render={({ field }) => (
                        <InputSelectFields
                          disabled
                          label="APPOINTMENT TYPE"
                          {...field}
                          data={[
                            { key: "WALK-IN", value: "WALK-IN" },
                            { key: "REGULAR", value: "REGULAR" },
                          ]}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="OrderSubType"
                      control={control}
                      rules={{ required: "Order Type is Required" }}
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
                        maxHeight: 400,
                        minHeight: 150,
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
                      render={({
                        field: { ref, ...fieldList },
                        fieldState: { error },
                      }) => (
                        <InputTextField
                          {...fieldList}
                          inputRef={ref}
                          label="SELECTED VEHICLE"
                          type="text"
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
                          readOnly={isClosed}
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
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => {
                          const now = dayjs();

                          const parsedValue = value
                            ? dayjs.isDayjs(value)
                              ? value
                              : dayjs(value, "HH:mm")
                            : null;

                          return (
                            <TimePicker
                              label="FROM"
                              ampm
                              timeSteps={{ minutes: 30 }}
                              value={parsedValue}
                              onChange={(newValue) => {
                                onChange(
                                  newValue && newValue.isValid()
                                    ? newValue
                                    : null,
                                );
                              }}
                              shouldDisableTime={(timeValue, view) => {
                                const hour = timeValue.hour();
                                const minute = timeValue.minute();

                                if (view === "hours") {
                                  // Always: block hours outside 8 AM – 8 PM
                                  if (hour < SHOP_OPEN || hour > SHOP_CLOSE)
                                    return true;
                                  // TODAY ONLY: block hours that have already passed
                                  if (isToday && hour < now.hour()) return true;
                                  return false;
                                }

                                if (view === "minutes") {
                                  // Always: only allow :00 and :30
                                  if (minute !== 0 && minute !== 30)
                                    return true;
                                  // Always: block 20:30 — shop closes at 20:00 sharp
                                  if (hour === SHOP_CLOSE && minute > 0)
                                    return true;
                                  // TODAY ONLY: disable any slot whose total minutes ≤ current time
                                  // e.g. now=10:45 → 10:00(600)≤645✗  10:30(630)≤645✗  11:00(660)>645✓
                                  if (isToday) {
                                    const slotMins = hour * 60 + minute;
                                    const nowMins =
                                      now.hour() * 60 + now.minute();
                                    if (slotMins <= nowMins) return true;
                                  }
                                  return false;
                                }

                                return false;
                              }}
                              readOnly={isClosed}
                              slotProps={{
                                textField: {
                                  size: "small",
                                  error: !!error,
                                  helperText: error?.message,
                                },
                              }}
                            />
                          );
                        }}
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
                <DialogTitle>
                  <Grid container justifyContent="center" alignItems="center">
                    <Typography fontWeight="bold">
                      Appointment Cancel
                    </Typography>
                    <IconButton
                      onClick={handleClose}
                      sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                </DialogTitle>

                <Divider />

                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} textAlign={"center"}>
                      <Controller
                        name="AppointmentNo"
                        control={control1}
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
                    <Grid item xs={12} textAlign={"center"}>
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
                    <Button type="submit" variant="contained" color="success">
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
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit) ||
                  isClosed ||
                  watch("IsInward")
                }
              >
                {SaveUpdateName}
              </Button>

              <Button
                variant="contained"
                sx={{ color: "white" }}
                color="error"
                type="button"
                onClick={handleOpen}
                disabled={
                  SaveUpdateName === "SAVE" ||
                  isClosed ||
                  watch("IsInward") ||
                  watch("AppointmentNo")
                }
              >
                CANCEL APPOINTMENT
              </Button>

              <Button
                variant="contained"
                color="primary"
                disabled={!perms.IsDelete}
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
