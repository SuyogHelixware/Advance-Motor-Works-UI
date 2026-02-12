import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import { Controller, useForm } from "react-hook-form";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";

import { Tab, Tabs } from "@mui/material";

// import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { TabContext, TabPanel } from "@mui/lab";
import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponentTwo from "../Components/CardComponentTwo";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function BinLocationMaster() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [warehouse, setWareHouse] = useState([]);
  const [sublevel1, SetSublevel1] = useState([]);
  const [sublevel2, SetSublevel2] = useState([]);
  const [sublevel3, SetSublevel3] = useState([]);
  const [sublevel4, SetSublevel4] = useState([]);

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
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName,
    Status: "1",
    WHSCode: "",
    BinCode: "",
    SL1Code: "",
    SL2Code: "",
    SL3Code: "",
    SL4Code: "",
    ReceiveBin: "",
    NoAutoAllc: "",
    FldAbs: "",
    MinLevel: "",
    MaxLevel: "",
    MaxWeight1: "",
    SysBin: "",
    ItmRtrictT: "",
    UoMRtrict: "",
    RtrictType: "",
    BinSeptor: "",
  };
  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: initial,
  });
  const AllData = getValues();

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BinLocationV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/BinLocationV2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle search input
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

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  // ============================================Closed List Start ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BinLocationV2/Search/${searchTerm}/0/${pageNum}/20`
        : `/BinLocationV2/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreClosed(false);
        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
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

  // Initial fetchClearFormData
  useEffect(() => {
    fetchClosedListData(0); // Load first page on mount
  }, []);

  const setOldDataOPen = async (DocEntry) => {
    console.log(DocEntry);

    toggleSidebar();
    setSaveUpdateName("UPDATE");
    try {
      const { data } = await apiClient.get(`/BinLocationV2/${DocEntry}`);
      console.log(data);
      if (data.success === true) {
        let { values } = data;
        console.log(values);
        FetchWareHouse(AllData.WHSCode);
        reset({
          ...values,
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

  const FetchWareHouse = async () => {
    try {
      const { data } = await apiClient.get(`/WarehouseV2/all`);
      if (data.success === true) {
        let { values } = data;
        if (values.length > 0) {
          values = values.filter((data) => data.Status === "1");
        }
        setWareHouse(values);
      } else if (data.success === false) {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const BinLocationSublevel1 = async () => {
    try {
      const { data } = await apiClient.get(
        `/BinLocationSubLevel/ByBinAct/${1}`
      );
      if (data.success === true) {
        const { values } = data;
        SetSublevel1(values);
      } else if (data.success === false) {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  const BinLocationSublevel2 = async () => {
    try {
      const { data } = await apiClient.get(
        `/BinLocationSubLevel/ByBinAct/${2}`
      );
      if (data.success === true) {
        const { values } = data;
        SetSublevel2(values);
      } else if (data.success === false) {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const BinLocationSublevel3 = async () => {
    try {
      const { data } = await apiClient.get(
        `/BinLocationSubLevel/ByBinAct/${3}`
      );
      if (data.success === true) {
        const { values } = data;
        SetSublevel3(values);
      } else if (data.success === false) {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const BinLocationSublevel4 = async () => {
    try {
      const { data } = await apiClient.get(
        `/BinLocationSubLevel/ByBinAct/${4}`
      );
      if (data.success === true) {
        const { values } = data;
        SetSublevel4(values);
      } else if (data.success === false) {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  useEffect(() => {
    FetchWareHouse();
    BinLocationSublevel1();
    BinLocationSublevel2();
    BinLocationSublevel3();
    BinLocationSublevel4();
  }, []);

  const handleSumbit = (data) => {
    console.log("Data Saved", data);
    const Separator = warehouse.find((item) => item.WHSCode === data.WHSCode);
    const obj = {
      ...data,
      Status: data.Status ? "1" : "0",
      NoAutoAllc: data.NoAutoAllc ? "Y" : "N",
      ReceiveBin: data.ReceiveBin ? "Y" : "N",
      AltSortCod: data.AltSortCod || "",
      BarCode: String(data.BarCode || ""),
      SL1Code: String(data.SL1Code || ""),
      SL2Code: String(data.SL2Code || ""),
      SL3Code: String(data.SL3Code || ""),
      MinLevel: String(data.MinLevel || "0"),
      MaxLevel: String(data.MaxLevel || "0"),
      MaxWeight1: String(data.MaxWeight1 || "0"),
      SysBin: String(data.SysBin || ""),
      ItmRtrictT: String(data.ItmRtrictT || ""),
      UoMRtrict: String(data.UoMRtrict || ""),
      RtrictType: String(data.RtrictType || ""),
      SL4Code: String(data.SL4Code || ""),
      Descr: String(data.Descr || ""),
      SngBatch: String(data.SngBatch || ""),
      RtrictDate: String(data.RtrictDate || ""),
      RtrictResn: String(data.RtrictResn || ""),
      BinCode: String(
        data.WHSCode +
          Separator.BinSeptor +
          data.SL1Code +
          Separator.BinSeptor +
          data.SL2Code +
          Separator.BinSeptor +
          data.SL3Code +
          Separator.BinSeptor +
          data.SL4Code
      ),
    };

    console.log("object ", obj);
    if (SaveUpdateName === "SAVE") {
      let uniCodeExists = openListData.some(
        (uni) => uni.BinCode === obj.BinCode
      );
      if (uniCodeExists) {
        Swal.fire({
          title: "Already Selected",
          text: "This BinCode has already been selected.",
          icon: "warning",
          confirmButtonText: "Ok",
          // timer: 3000,
        });
        return;
      }
      apiClient
        .post(`/BinLocationV2`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearFormData();
            setOpenListData([]);
            fetchOpenListData(0);
            fetchClosedListData(0);
            Swal.fire({
              title: "Success!",
              text: "Bin Location saved Successfully",
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
            .put(`/BinLocationV2/${data.DocEntry}`, obj)
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

  const handleDelete = () => {
    Swal.fire({
      text: `Do You Want Deleted "${AllData.WHSCode}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/BinLocationV2/${AllData.DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              setOpenListData([]);
              fetchOpenListData(0);
              fetchClosedListData(0);
              ClearFormData();
              Swal.fire({
                title: "Success!",
                text: "Bin Location Deleted",
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
          text: "Bin Location Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
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
          BinLocation Master List
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
                    <CardComponentTwo
                      key={i}
                      title={item.BinCode}
                      // subtitle={item.BinCode}
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
                    <CardComponentTwo
                      key={i}
                      title={item.BinCode}
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
              Bin Location Master
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
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="WHSCode"
                      control={control}
                      rules={{
                        required: "WHSCode is required",
                        maxLength: {
                          value: 50,
                          message: "WHSCode 50 characters allowed",
                        },
                        minLength: {
                          value: 1,
                          message: "WHSCode 1 character required",
                        },
                        validate: (value) =>
                          value.trim() !== "" || "WHSCode cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="WHSCode"
                          label="WareHouse"
                          data={warehouse.map((item) => ({
                            key: item.WHSCode,
                            value: item.WHSCode,
                          }))}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SL1Code"
                      control={control}
                      rules={
                        sublevel1.length > 0
                          ? { required: "SL1Code Name is Required" }
                          : {}
                      }
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="SL1Code"
                          label="Sublevel-1"
                          data={sublevel1.map((item) => ({
                            key: item.SLCode,
                            value: item.SLCode,
                          }))}
                        />
                      )}
                    />
                  </Grid>

                  <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SL2Code"
                      control={control}
                      rules={
                        sublevel2.length > 0
                          ? { required: "SL2Code Name is Required" }
                          : {}
                      }
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="SL2Code"
                          label="Sublevel-2"
                          data={sublevel2.map((item) => ({
                            key: item.SLCode,
                            value: item.SLCode,
                          }))}
                        />
                      )}
                    />
                  </Grid>

                  <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SL3Code"
                      control={control}
                      rules={
                        sublevel3.length > 0
                          ? { required: "SL3Code Name is Required" }
                          : {}
                      }
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="SL3Code"
                          label="SubLevel-3"
                          data={sublevel3.map((item) => ({
                            key: item.SLCode,
                            value: item.SLCode,
                          }))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SL4Code"
                      control={control}
                      rules={
                        sublevel4.length > 0
                          ? { required: "SL4Code Name is Required" }
                          : {}
                      }
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="SL4Code"
                          label="SubLevel-4"
                          data={sublevel4.map((item) => ({
                            key: item.SLCode,
                            value: item.SLCode,
                          }))}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    lg={12}
                    md={12}
                    xs={12}
                    // px={1}
                    textAlign={"center"}
                    width={"100%"}
                  >
                    <Controller
                      name="BinCode"
                      control={control}
                      // rules={{ required: "Card Name is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          // name="BinCode"
                          disabled
                          label="Bin Location Code"
                          size="small"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          sx={{
                            minWidth: "95%",
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="MinLevel"
                      control={control}
                      // rules={{ required: "MinLevel Name is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Minimum Qty"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="MaxLevel"
                      control={control}
                      // rules={{ required: "MaxLevel Name is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Maximum Qty"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="MaxWeight1"
                      control={control}
                      // rules={{ required: "MaxWeight1 Name is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Maximum Weight"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="Status"
                      control={control}
                      defaultValue={false}
                      // rules={{
                      //   required: "Please select Vehicle Type",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                textAlign: "center",
                                width: 20,
                                mr: 1,
                              }}
                              {...field}
                              checked={field.value}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              noWrap={true}
                              sx={{
                                fontFamily: "'Open Sans', sans-serif", // Apply font family here
                              }}
                            >
                              Active
                            </Typography>
                          }
                          sx={{
                            textAlign: "center",
                            width: 200,
                            whiteSpace: "normal", // Allow the label to wrap
                            fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                          }}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="ReceiveBin"
                      control={control}
                      // defaultValue={false}
                      // rules={{
                      //   required: "Please select Vehicle Type",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                textAlign: "center",
                                width: 20,
                                mr: 1,
                              }}
                              {...field}
                              checked={field.value}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              noWrap={true}
                              sx={{
                                fontFamily: "'Open Sans', sans-serif", // Apply font family here
                              }}
                            >
                              Receiving Bin Location
                            </Typography>
                          }
                          sx={{
                            textAlign: "center",
                            width: 200,
                            whiteSpace: "normal", // Allow the label to wrap
                            fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="NoAutoAllc"
                      control={control}
                      // defaultValue={false}
                      // rules={{
                      //   required: "Please select Vehicle Type",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                textAlign: "center",
                                width: 20,
                                mr: 1,
                              }}
                              {...field}
                              checked={field.value}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              noWrap={true}
                              sx={{
                                fontFamily: "'Open Sans', sans-serif", // Apply font family here
                              }}
                            >
                              Exclude from Auto. Alloc. on Issue
                            </Typography>
                          }
                          sx={{
                            textAlign: "center",
                            width: 200,
                            whiteSpace: "normal", // Allow the label to wrap
                            fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                          }}
                        />
                      )}
                    />
                  </Grid> */}
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
                color="error"
                disabled={!perms.IsDelete}
                onClick={handleDelete}
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
