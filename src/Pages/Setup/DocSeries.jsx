import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import CardComponent from "../Components/CardComponent";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import {
  InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
  SelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function DocSeries() {
  const theme = useTheme();
  const perms = usePermissions(43);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [IndicatorList, setIndicatorList] = useState([]);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [ValitedDate, setValitedDate] = useState(
    dayjs(undefined).format("YYYY-MM-DD ")
  );

  const [loading, setLoading] = useState(false);
  const initial = {
    DocEntry: "",
    TransId: "",
    TranName: "",
    TransactionName: "",
    SeriesName: "",
    PostPeriodDocEntry: "",
    Prefix: "",
    FirstNo: "",
    NextNo: "",
    LastNo: "",
    Indicator: "",
  };

  // ==============useForm====================================
  const { control, handleSubmit, setValue, reset } = useForm({
    defaultValues: initial,
  });

  const { isDirty } = useFormState({ control });

  const toggleDrawer = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchIndicateData = async () => {
    try {
      const res = await apiClient.get(`/PostingPeriod/All`);
      const response = res.data;

      if (response.success === true) {
        setIndicatorList(response.values);
        // reset(response.values);
      } else if (response.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    // { field: "TransactionName", headerName: "Transaction Name", width: 180 },

    { field: "SeriesName", headerName: "Series Name", width: 180 },
    { field: "FirstNo", headerName: "First No", width: 180 },
    { field: "NextNo", headerName: "Next No", width: 180 },
    { field: "LastNo", headerName: "Last No", width: 180 },
    { field: "Prefix", headerName: "Prefix", width: 180 },
    { field: "Suffix", headerName: "Suffix", width: 180 },
    { field: "Remark", headerName: "remark", width: 180 },

    { field: "Codes", headerName: "Period Indicator", width: 180 },
    { field: "Lock", headerName: "Lock (checkbox)", width: 180 },

    // {
    //   field: "edit",
    //   headerName: "Edit",
    //   width: 100,
    //   renderCell: (params) => (
    //     <IconButton color="primary" onClick={() => {handleEdit(params.row); }}>
    //     <EditIcon />
    //   </IconButton>

    //   ),
    // },
    // {
    //   field: "Action",
    //   headerName: "Action",
    //   width: 150,
    //   renderCell: (params) => (
    //     <IconButton
    //       color="error"
    //       onClick={() => handleIndicateDelete(params.row)}
    //     >
    //       <DeleteIcon />
    //     </IconButton>
    //   ),
    // },
  ];

  // ===============API for Searching open list data====================================
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
      const url = searchTerm
        ? `/DocSeries/Search/${searchTerm}/1/${pageNum}/20`
        : `/DocSeries/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        // if (newData.length === 0) {
        //   Swal.fire({
        //     text: "Record Not Found",
        //     icon: "warning",
        //     toast: true,
        //     showConfirmButton: false,
        //     timer: 2000,
        //     timerProgressBar: true,
        //   });
        // }
        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(
    () => {
      fetchOpenListData(0); // Load first page on mount
      fetchIndicateData();
      fetchGetListData(0); // Load first page on mount
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleInputChange = () => {
    setIsDialogOpen(true); // Open the dialog when input changes
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
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

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    setSelectedData([]);
  };

  // FOR SEARCH MODEL IN REQUERTER INPUTFIELD Users
  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/TransactionMaster/Search/${searchTerm}/1/${pageNum}/20`
        : `/TransactionMaster/Pages`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setValue("TransactionName", newData.TranName);
        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0); // Reset page to 0
    setGetListData([]); // Clear current data
    fetchGetListData(0); // Fetch first page without search
  };

  // const fetchMoreGetListData = () => {
  //   alert("")
  //   fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
  //   setGetListPage((prev) => prev + 1);
  // };s
  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage, getListSearching ? getListquery : "");
    // setGetListPage((prev) => prev );
  };

  const onSelectRequest = (DocEntry) => {
    apiClient
      .get(`/TransactionMaster/${DocEntry}`)
      .then((response) => {
        handleCloseDialog();

        console.log("Response Data:", response.data);

        const { values } = response.data;
        setValue("TransId", values[0].TransId);

        setValue("TransactionName", values[0].TranName);
      })
      .catch((error) => {
        console.error("Error fetching or processing data:", error);
      });
  };

  //   useEffect(() => {
  //     console.log("TransactionName:", watch("TransactionName"));
  //     console.log("TransId:", watch("TransId"));
  // }, [watch("TransactionName"), watch("TransId")]);

  // ===============API for Setting specific  Cards data====================================

  const setOldOpenData = async (DocEntry) => {
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
          setDocSeriesDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setDocSeriesDataList(DocEntry);
        setSaveUpdateName("UPDATE");
      }
    } catch (error) {
      console.error("Error in setOldOpenData:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while setting Doc Series data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const setDocSeriesDataList = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      const response = await apiClient.get(`/DocSeries/${DocEntry}`);
      const data = response.data.values;

      toggleDrawer();
      reset(data);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
      setSidebarOpen(false);

      setValue("PostPeriodDocEntry", data.PostPeriodDocEntry);

      const isoDocSeriesCode = data?.NextNo || "";
    } catch (error) {
      console.error("Error fetching data:", error);

      Swal.fire({
        title: "Error!",
        text: "An error occurred while fetching  Doc Series data.",
        icon: "error",
        toast: true,
        showConfirmButton: false,
        timer: 4500,
      });
    }
  };

  // ===============PUT and POST API ===================================

  const handleSubmitForm = async (data) => {
    console.log("ddddd", data);

    const obj = {
      DocEntry: data.DocEntry || "",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.ModifiedBy,
      CreatedDate: dayjs(data.CreatedDate).format("YYYY/MM/DD"),
      ModifiedDate: dayjs(data.ModifiedDate).format("YYYY/MM/DD"),
      Status: "1",
      DocDate: dayjs(data.DocDate).format("YYYY/MM/DD"),
      DocNum: data.DocNum || "",
      TransId: data.TransId || "0",
      TranName: data.TranName || "0",
      TransactionName: String(data.TransactionName),
      SeriesName: String(data.SeriesName),
      PostPeriodDocEntry: data.PostPeriodDocEntry,
      Prefix: String(data.Prefix),
      FirstNo: data.FirstNo,
      NextNo: data.NextNo,
      LastNo: data.LastNo,
      Decimals: data.Decimals,
      EndDate: dayjs(data.EndDate).format("YYYY/MM/DD"),
      StartDate: dayjs(data.StartDate).format("YYYY/MM/DD"),
      PIndicator: data.PIndicator || "0",
      Suffix: data.Suffix || "",
      // TransId: data.TransId,
    };
    console.log("DATAAAAA", obj);
    // returns
    try {
      if (SaveUpdateName === "SAVE") {
        setLoading(true);
        const response = await apiClient.post(`/DocSeries`, obj);
        const { success, message } = response.data;
        console.log("loggg", response);

        setLoading(false);
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Doc Series is Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Doc Series is not Added",
            text: message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.TransId}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          setLoading(true);
          const response = await apiClient.put(
            `/DocSeries/${DocEntry}`,
            obj
          );
          const { success, message } = response.data;
          setLoading(false);
          if (success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "DocSeries Updated",
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
            text: "DocSeries is not Updated !",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to call DocSeries Update API",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============Delete API ===================================

  const handleOnDelete = async (data) => {
    try {
      const result = await Swal.fire({
        text: "Do You Want to Delete ?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        setLoading(true);
        const response = await apiClient.delete(
          `/DocSeries/${DocEntry}`
        );
        const { success, message } = response.data;
        setLoading(false);
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: "DocSeries Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: success,
            text: message,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          text: "DocSeries is Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting tax:", error);

      Swal.fire({
        text: "An error occurred while deleting the DocSeries.",
        icon: "error",
        toast: true,
        showConfirmButton: false,
        timer: 4500,
      });
    }
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
          Doc Series List
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
                  title={item.TransactionName}
                  subtitle={item.SeriesName}
                  description={item.NextNo}
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
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
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
            onClick={toggleSidebar}
            sx={{
              position: "absolute",
              left: "10px",
              display: { lg: "none", xs: "block" },
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
              Document Series
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
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container textTransform={"uppercase"}>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="TransactionName"
                      rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchButton
                          label="Transaction Name"
                          type="text"
                          readOnly={true}
                          onClick={handleInputChange}
                          onChange={(e) => {
                            setValue("TransactionName", e.target.value);
                          }}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                    <SearchModel
                      open={isDialogOpen}
                      onClose={handleCloseDialog}
                      onCancel={handleCloseDialog}
                      title="Transation Master"
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
                            // loader={
                            //   <BeatLoader
                            //     color={
                            //       theme.palette.mode === "light"
                            //         ? "black"
                            //         : "white"
                            //     }
                            //   />
                            // }
                            scrollableTarget="getListForCreateScroll"
                            // endMessage={
                            //   <Typography textAlign={"center"}>
                            //     No More Records
                            //   </Typography>
                            // }
                          >
                            {getListData.map((item, index) => (
                              <CardComponent
                                key={index}
                                title={item.TranName}
                                subtitle={item.TransId}
                                // description={item.CurrTotal}
                                searchResult={getListquery}
                                onClick={() => {
                                  onSelectRequest(item.DocEntry);
                                }}
                              />
                            ))}
                          </InfiniteScroll>
                        </>
                      }
                    />
                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="SeriesName"
                      control={control}
                      // rules={{
                      //   required: "Name is required",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Series Name"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Prefix"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label=" Preffix"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Suffix"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label=" Suffix"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="PostPeriodDocEntry"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="Posting Period"
                          data={IndicatorList.map((item) => ({
                            key: item.DocEntry,
                            value: item.Name,
                          }))}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="FirstNo"
                      control={control}
                      // rules={{
                      //   required: "Hundredth Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="First No"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="NextNo"
                      control={control}
                      // rules={{
                      //   required: "English is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Next No"
                          type="text"
                          disabled
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="LastNo"
                      control={control}
                      // rules={{
                      //   required: "English Hundredth Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Last No"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign="center">
                    <Controller
                      name="StartDate"
                      control={control}
                      // rules={{ required: "From Date is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label="Start Date"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValitedDate(newValue);
                            setValue("StartDate", newValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign="center">
                    <Controller
                      name="EndDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <SelectedDatePickerField
                          label=" End Date"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          onChange={(newValue) => {
                            setValue("EndDate", newValue);

                            setValitedDate(newValue);
                          }}
                          minDate={ValitedDate}
                          disabled={!ValitedDate}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Grid
                item
                xs={12}
                sx={{ flexGrow: 1, overflowY: "auto", marginTop: "15px" }}
              >
                <DataGrid
                  className="datagrid-style"
                  rows={IndicatorList.map((data, index) => ({
                    ...data,
                    id: data.id || index + 1,
                  }))}
                  columns={columns}
                  pageSize={5}
                  hideFooter
                  sx={{
                    height: "310px",
                    overflowY: "auto",
                    "& .MuiDataGrid-columnHeaders": {
                      position: "sticky",
                      top: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    },
                  }}
                />
              </Grid>
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

              <Grid item>
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
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
