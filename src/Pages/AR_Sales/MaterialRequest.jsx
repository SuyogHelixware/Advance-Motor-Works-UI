import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import SearchInputField from "../Components/SearchInputField";

import MenuIcon from "@mui/icons-material/Menu";

import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerFields,
  InputFields,
  InputTextAreaFields,
  InputTextSearchButton,
} from "../Components/formComponents";
import { SearchBPModel } from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";

export default function MaterialRequest() {
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
  const [clearCache, setClearCache] = useState(false);

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

  const initial = {
    DocEntry: "",
    DocNum: "",
    RequestDate: dayjs(new Date()),
    IssueQuantity: "0",
    JobCardNo: "",
    RegistrationNo: "",
    InwardNo: "",
    OrderDocEntry: "",
    VehInwardDocEntry: "",
    RequestNo: "",
    OrderNo: "",
    JobWorkAt: "",
    JobRemarks: "",
    TotalItems: "",
    RequestedBy: "",
    oLines: [],
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
  const { isDirty } = useFormState({ control });

  const allFormData = getValues();

  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    // const fetchPrintData = async () => {
    //   try {
    //     const { data: dataPrint } = await apiClient.get(
    //       `/ReportLayout/GetByTransId/22`,
    //     );
    //     if (dataPrint.success) {
    //       const OlinesDataPrint = dataPrint.values.oLines;
    //       setPrintData(OlinesDataPrint);
    //     } else {
    //       Swal.fire({
    //         text: dataPrint.message,
    //         icon: "question",
    //         confirmButtonText: "YES",
    //       });
    //     }
    //   } catch (err) {
    //     console.log(err);
    //   }
    // };

    // fetchPrintData(); // runs once
  }, []);

  const oLines = useWatch({ control, name: "oLines" });

  const onSelectBusinessPartner = (DocEntry) => {
    const selectedBP = getListData.find((item) => item.DocEntry === DocEntry);
    if (!selectedBP) return;

    setValue("RequestDate", dayjs());
    setValue("VehInwardNo", selectedBP.DocNum || "");
    setValue("JobWorkAt", selectedBP.JobWorkAt || "");
    setValue("RegistrationNo", selectedBP.RegistrationNo || "");
    setValue("OrderNo", selectedBP.OrderNo || "");
    setValue("JobRemarks", selectedBP.JobWorkDetails || "");
    setValue("RequestNo", selectedBP.RequestNo || "");
    setValue("OrderDocEntry", selectedBP.OrderDocEntry || "");
    setValue("VehInwardDocEntry", selectedBP.DocEntry || "");
    setValue("TotalItems", selectedBP?.oLines?.length);

    setValue(
      "oLines",
      (selectedBP.oLines || []).map((item, index) => ({
        ItemCode: item.ItemCode,
        ItemName: item.ItemName,
        WHSCode: item.WHSCode,
        AvailQty: item.AvailQty,
        IssueQuantity: "0",
        AppointmentQty: item.Quantity,
        ReqQuantity: item.Quantity,
      })),
    );

    SearchModelClose();
  };

  const fetchAndSetData = async (DocEntry) => {
    try {
      const url = `${BASE_URL}/MatReq/${DocEntry}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.values && data.values.length > 0) {
        const item = data.values[0];

        const transformed = {
          JobCardNo: item.JobCardNo,
          RegistrationNo: item.RegistrationNo,
          VehInwardNo: item.VehInwardNo,
          VehInwardDocEntry: item.VehInwardDocEntry,
          RequestNo: item.DocNum,
          RequestDate: item.RequestDate ? dayjs(item.RequestDate) : dayjs(),
          OrderNo: item.OrderNo,
          OrderDocEntry: item.OrderDocEntry,
          JobWorkAt: item.JobWorkAt,
          // JobWorkDetails: item.ReqRemarks,
          TotalItems: item.oLines?.length || 0,
          RequestedBy: item.RequestBy,
          oLines: (item.oLines || []).map((line) => ({
            ItemCode: line.ItemCode,
            ItemName: line.ItemName,
            WHSCode: line.WHSCode,
            AvailQty: line.AvailQty,
            ReqQuantity: line.ReqQuantity,
            AppointmentQty: line.AppointmentQty,
            IssueQuantity: line.IssueQuantity,
          })),
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

  const columns = [
    {
      field: "ItemCode",
      headerName: "Item Code",
      width: 120,
      editable: true,
    },
    {
      field: "ItemName",
      headerName: "Item Description",
      width: 400,
      editable: true,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "WHSCode",
      headerName: "	WHS",
      width: 100,
      editable: true,
    },
    {
      field: "AvailQty",
      headerName: "Avail Qty",
      width: 100,
      editable: true,
    },
    {
      field: "IssueQuantity",
      headerName: "Iss Qty",
      width: 100,
      editable: true,
    },
    {
      field: "AppointmentQty",
      headerName: "Appoint Qty",
      width: 150,
      editable: true,
    },
    {
      field: "ReqQuantity",
      headerName: "Quantity",
      width: 100,
      editable: true,
    },
  ];

  const customRowSx = {
    "& .MuiDataGrid-row.row-complete": {
      backgroundColor: "#81E5B7 !important",
    },

    "& .MuiDataGrid-row.row-pending": {
      backgroundColor: "#ffff80 !important",
    },
  };

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `${BASE_URL}/MatReq/search/${searchTerm}/1/${pageNum}`
        : `${BASE_URL}/MatReq/pages/${pageNum}/1`;

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
        ? `${BASE_URL}/MatReq/search/${searchTerm}/0/${pageNum}`
        : `${BASE_URL}/MatReq/pages/${pageNum}/0`;

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
          Material Request Documents
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
                          title={item.CardName}
                          subtitle={item.DocNum}
                          description={item.PhoneNumber1}
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
        ? `${BASE_URL}/MatReq/GetListForCreate/Search/${searchTerm}/${pageNum}`
        : `${BASE_URL}/MatReq/GetListForCreate/${pageNum}`;

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
    reset();
    setSelectData([]);
    setok("");
    setValue("VehInwardNo", "");
    setValue("JobRemarks", "");
  };

  const handleSubmitForm = async (data) => {
    const UserId = localStorage.getItem("UserId");
    const CreatedBy = localStorage.getItem("UserName");

    const obj = {
      UserId,
      CreatedBy,
      JobCardNo: "",
      OrderNo: data.OrderNo,
      RequestDate: dayjs(data.RequestDate).format("YYYY-MM-DD"),
      RequestBy: CreatedBy,
      OrderDocEntry: data.OrderDocEntry,
      ReqRemarks: data.JobWorkDetails?.toUpperCase() || "",
      RegistrationNo: data.RegistrationNo,
      VehInwardNo: data.VehInwardNo,
      VehInwardDocEntry: data.VehInwardDocEntry || "",
      JobWorkAt: data.JobWorkAt,
      TotalReqQuantity: String(
        data.oLines.reduce(
          (old, current) => old + parseFloat(current.ReqQuantity || 0),
          0,
        ),
      ),
      TotalItems: String(data.oLines.length),
      oLines: data.oLines.map((line, index) => ({
        UserId,
        CreatedBy,
        RequestNo: data.RequestNo,
        RequestLineNo: index + 1,
        ItemCode: line.ItemCode,
        ReqQuantity: line.ReqQuantity,
        ItemName: line.ItemName,
        WHSCode: line.WHSCode,
        AppointmentQty: line.AppointmentQty,
        OpenQuantity: line.ReqQuantity,
        IssueQuantity: "0",
        ReqLineRemarks: "",
      })),
    };

    setapiloading(true);

    try {
      const response = await fetch(`${BASE_URL}/MatReq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      });

      const res = await response.json();

      if (res.success) {
        setOpenListData([]);
        fetchOpenListData(0);
        handleGetListClear();
        ClearForm();
        // setClearCache(true);

        Swal.fire({
          text: "Material Request Accepted",
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
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setapiloading(false); // ✅ always stop loader
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
              Material Request Details
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
                  <Grid container item>
                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="VehInwardNo"
                        rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextSearchButton
                            label="INWARD NO"
                            readOnly={true}
                            disabled={!!DocEntry}
                            onClick={() => {
                              OpenDailog();
                            }}
                            onChange={OpenDailog}
                            type="text"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                      <SearchBPModel
                        open={searchmodelOpen}
                        onClose={SearchModelClose}
                        onCancel={SearchModelClose}
                        title="Select Job Card"
                        onChange={(e) => handleGetListSearch(e.target.value)}
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
                                  title={item.CardCode}
                                  subtitle={item.CardName}
                                  description={item.Cellular}
                                  searchResult={getListquery}
                                  isSelected={
                                    allFormData.CardCode === item.CardCode
                                  }
                                  onClick={() => {
                                    onSelectBusinessPartner(item.DocEntry);
                                  }}
                                />
                              ))}
                            </InfiniteScroll>
                          </>
                        }
                      />
                    </Grid>
                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="RequestDate"
                        control={control}
                        render={({ field }) => (
                          <InputDatePickerFields
                            {...field}
                            label="REQUEST DATE"
                            value={field.value}
                            readOnly={true}
                            onChange={(date) => field.onChange(date)}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="JobWorkAt"
                        control={control}
                        render={({ field }) => (
                          <InputFields
                            readOnly={true}
                            {...field}
                            label="JOB WORK AT"
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                    >
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

                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="OrderNo"
                        control={control}
                        render={({ field }) => (
                          <InputFields
                            readOnly={true}
                            {...field}
                            label="SO NO"
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="JobRemarks"
                        control={control}
                        render={({ field }) => (
                          <InputTextAreaFields
                            readOnly={true}
                            {...field}
                            label="JOB WORK DETAILS"
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={4}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="RequestNo"
                        control={control}
                        render={({ field }) => (
                          <InputFields
                            readOnly={true}
                            {...field}
                            label="REQUEST NO"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    item
                    sx={{
                      // px: 2,
                      overflow: "auto",
                      width: "100%",
                    }}
                  >
                    <Typography
                      noWrap
                      textTransform={"uppercase"}
                      sx={{
                        color: "red",
                        textAlign: "left",
                        fontSize: "12px",
                        marginLeft: "10px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                        marginTop: "30px",
                      }}
                    >
                      NOTE: Please check Total request quantity and Issue
                      Quantity is same,
                    </Typography>

                    <Paper elevation={5} sx={{ width: "100%", padding: 1 }}>
                      <DataGrid
                        columnHeaderHeight={35}
                        getRowId={(row) => row.ItemCode}
                        rowHeight={45}
                        className="datagrid-style"
                        rows={oLines || []}
                        columns={columns}
                        hideFooter
                        editMode="cell"
                        disableRowSelectionOnClick
                        getRowClassName={(params) =>
                          Number(params.row.IssueQuantity) ===
                          Number(params.row.ReqQuantity)
                            ? "row-complete"
                            : "row-pending"
                        }
                        sx={{
                          ...gridSx,
                          ...customRowSx,
                        }}
                        autoHeight="false"
                        slotProps={{
                          toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                          },
                        }}
                        disableColumnFilter
                        disableColumnSelector
                        disableDensitySelector
                      />
                    </Paper>
                  </Grid>

                  <Grid container item mt={3}>
                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="TotalItems"
                        control={control}
                        render={({ field }) => (
                          <InputFields
                            readOnly={true}
                            {...field}
                            label="TOTAL ITEMS"
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="RequestedBy"
                        control={control}
                        render={({ field }) => (
                          <InputFields
                            readOnly={true}
                            {...field}
                            label="REQUESTED BY"
                          />
                        )}
                      />
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
                  SaveUpdateName === "UPDATE" ||
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit) ||
                  allFormData.Status === "Closed"
                }
                colo
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
