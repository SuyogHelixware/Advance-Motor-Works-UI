import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect, useMemo, useRef, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerField,
  InputFields,
  InputTextArea,
  InputTextSearchButton,
  SmallInputFields,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
export default function OrderCancellation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const [searchText, setSearchText] = useState("");

  const [card, setCard] = useState([]);
  const [filteredCard, setFilteredCard] = useState([]);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openPage, setOpenPage] = useState(0);
  const [processCancelSo, setprocessCancelSo] = useState(false);
  const [loading, setLoading] = useState(false);

  const initial = {
    OrderNo: "",
    QuotationNo: "",
    QuotationDate: dayjs(new Date()),
    CardCode: "",
    PhoneNumber1: "",
    CardName: "",
    JobWorkAt: "",
    JobRemarks: "",
    oLines: [],
    SalesHistory: 0,
    Items: "",
    TotalPartsValue: 0,
    DesiredDisc: 0,
    DesiredDiscAmt: 0,
    AdvanceAmount: 0,
    DueAmount: 0,
    PaidAmount: 0,
    SpecialDisc: 0,
    SpecialDiscAmt: 0,
    NetPartsValue: 0,
    ServiceAndInstallation: 0,
    TotalDocAmt: 0,
    DocEntry: "",
    Remark: "",
    CancelRemarks: "",
    Status: "CANCELLED",
    CancelBy: localStorage.getItem("UserName"),
    ModifiedDate: dayjs(new Date()),
    CustomerBalance: "",
  };

  const {
    control,
    reset,
    watch,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initial,
  });

  const allFormData = getValues();

  const oLines = useWatch({ control, name: "oLines" });

  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };

  const SearchModelClose = () => {
    setSearchmodelOpen(false);
    setGetListQuery("");
  };

  const getVehicalDataList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/CancelSO/pages/0`);
      const values = response?.data?.values || [];
      setCard(values);

      if (values.length < 20) {
        setHasMoreOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = () => {
    const page = openPage + 1;
    const url =
      searchText === ""
        ? `/CancelSO?page=${page}`
        : `/CancelSO?SearchText=${searchText}&page=${page}`;

    apiClient
      .get(url)
      .then((response) => {
        if (searchText === "") {
          setCard((prev) => [...prev, ...response.data.values]);
        } else {
          setFilteredCard((prev) => [...prev, ...response.data.values]);
        }
        setOpenPage(page);
        if (response.data.values.length === 0) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const onClickClearSearch = () => {
    setSearchText("");
    setFilteredCard([]);
    setOpenPage(0);
    setHasMoreOpen(true);
    getVehicalDataList();
  };

  const setTechnicialListData = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);

      const response = await apiClient.get(`/CancelSO/${DocEntry}`);
      toggleDrawer();

      const data = response.data.values[0];

      reset({
        ...data,
        OrderNo: data.OrderNo,
        QuotationNo: data.DocNum,
        QuotationDate: dayjs(data.CreatedDate),
        CardCode: data.CardCode,
        PhoneNumber1: data.PhoneNumber1,
        CardName: data.CardName,
        CustomerBalance: data.CustomerBalance,
        JobWorkAt: data.JobWorkAt,
        JobRemarks: data.JobRemarks?.toUpperCase(),
        oLines: data.oLines,
        SalesHistory: Number(data.SalesHistory || 0).toFixed(3),
        Items: data.oLines?.length || 0,
        TotalPartsValue: Number(data.TotalPartsValue || 0).toFixed(3),
        DesiredDisc: Number(data.DesiredDisc || 0).toFixed(3),
        DesiredDiscAmt: Number(data.DesiredDiscAmt || 0).toFixed(3),
        AdvanceAmount: Number(data.AdvanceAmount || 0).toFixed(3),
        DueAmount: Number(data.DueAmount || 0).toFixed(3),
        PaidAmount: Number(data.PaidAmount || 0).toFixed(3),
        SpecialDisc: Number(data.SpecialDisc || 0).toFixed(3),
        SpecialDiscAmt: Number(data.SpecialDiscAmt || 0).toFixed(3),
        NetPartsValue: Number(data.NetPartsValue || 0).toFixed(3),
        ServiceAndInstallation: Number(
          data.ServiceAndInstallation || 0,
        ).toFixed(3),
        TotalDocAmt: Number(data.TotalDocAmt || 0).toFixed(3),
        DocEntry: data.DocEntry,
        Remark: data.CancelRemarks,
        Status: data.Status === "1" ? "OPEN" : "CANCELLED",
        CancelBy: data.CancelBy,
        ModifiedDate: dayjs(data.ModifiedDate),
      });

      setprocessCancelSo(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onHandleSearch = async (event) => {
    const searchText = event.target.value;

    setFilteredCard([]);
    setSearchText(searchText);
    setOpenPage(0);
    setHasMoreOpen(true);

    if (searchText.trim() === "") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.get(
        `/CancelSO?SearchText=${encodeURIComponent(searchText)}&page=0`,
      );

      const values = response?.data?.values || [];

      setFilteredCard(values);

      if (values.length < 20) {
        setHasMoreOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const triggeronClickClearSearchTwice = () => {
    onClickClearSearch();
    setTimeout(() => {
      onClickClearSearch();
    }, 10);
  };

  const fetchGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const encodedSearch = encodeURIComponent(searchTerm.trim());

      const url = encodedSearch
        ? `/CancelSo/CopyFrom?SearchText=${encodedSearch}&Page=${pageNum}`
        : `/CancelSo/CopyFrom?Page=${pageNum}`;

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

  useEffect(() => {
    getVehicalDataList();
  }, []);

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

  const onSelectBusinessPartner = async (selectedItem) => {
    try {
      setLoading(true);
      setprocessCancelSo(true);
      const filledValues = {
        ...selectedItem,
        OrderNo: selectedItem.OrderNo,
        QuotationNo: selectedItem.DocNum,
        QuotationDate: dayjs(selectedItem.CreatedDate),
        CardCode: selectedItem.CardCode,
        PhoneNumber1: selectedItem.PhoneNumber1,
        CardName: selectedItem.CardName,
        CustomerBalance: selectedItem.CustomerBalance,
        JobWorkAt: selectedItem.JobWorkAt,
        JobRemarks: selectedItem.JobRemarks.toUpperCase(),
        oLines: selectedItem.oLines,
        SalesHistory: Number(selectedItem.SalesHistory || 0).toFixed(3),
        Items: selectedItem.oLines.length,
        TotalPartsValue: Number(selectedItem.TotalPartsValue || 0).toFixed(3),
        DesiredDisc: Number(selectedItem.DesiredDisc || 0).toFixed(3),
        DesiredDiscAmt: Number(selectedItem.DesiredDiscAmt || 0).toFixed(3),
        AdvanceAmount: Number(selectedItem.AdvanceAmount || 0).toFixed(3),
        DueAmount: Number(selectedItem.DueAmount || 0).toFixed(3),
        PaidAmount: Number(selectedItem.PaidAmount || 0).toFixed(3),
        SpecialDisc: Number(selectedItem.SpecialDisc || 0).toFixed(3),
        SpecialDiscAmt: Number(selectedItem.SpecialDiscAmt || 0).toFixed(3),
        NetPartsValue: Number(selectedItem.NetPartsValue || 0).toFixed(3),
        ServiceAndInstallation: Number(
          selectedItem.ServiceAndInstallation || 0,
        ).toFixed(3),
        TotalDocAmt: Number(selectedItem.TotalDocAmt || 0).toFixed(3),
        DocEntry: selectedItem.DocEntry,
        Remark: "",
        Status: selectedItem.Status === "1" ? "OPEN" : "CANCELLED",
        ModifiedDate: dayjs(new Date()),
        CancelBy: localStorage.getItem("UserName"),
      };

      reset(filledValues);
      SearchModelClose();
      setGetListQuery("");
    } catch (error) {
      console.error("Error fetching ARInvoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const itemsTable = [
    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 170,
    },
    {
      field: "ItemName",
      headerName: "ITEM DESCRIPTION",
      width: 430,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} arrow>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              display: "block",
            }}
          >
            {params.value}
          </span>
        </Tooltip>
      ),
    },
    {
      field: "WHSCode",
      headerName: "WHS",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "Quantity",
      headerName: "QTY",
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span>{Math.round(params.value ?? 0)}</span>,
    },
    {
      field: "Price",
      headerName: "PRICE",
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span>{params.value ?? 0}</span>,
    },
    {
      field: "Amount",
      headerName: "AMOUNT",
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span>{params.value ?? 0}</span>,
    },
    {
      field: "LineFittingCharge",
      headerName: "FITTING",
      width: 120,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span>{Math.round(params.value ?? 0)}</span>,
    },
    {
      field: "Status",
      headerName: "LINE STATUS",
      width: 120,
      renderCell: (params) => (
        <span>{params.value === "1" ? "OPEN" : "CLOSE"}</span>
      ),
      align: "center",
      headerAlign: "center",
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
          Cancelled Orders
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
              overflow: "scroll",
              paddingLeft: 0.5,
              paddingRight: 0.5,
              overflowX: "hidden",
              typography: "body1",
              "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
                padding: 0,
              },

              "& .MuiTabs-flexContainer ": {
                justifyContent: "space-around",
              },
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
                onChange={onHandleSearch}
                value={searchText}
                onClickClear={triggeronClickClearSearchTwice}
              />
            </Grid>
            <InfiniteScroll
              dataLength={searchText === "" ? card.length : filteredCard.length}
              next={fetchMoreData}
              hasMore={hasMoreOpen}
              loader={<BeatLoader size={8} />}
              scrollableTarget="ListScroll"
              endMessage={
                <Typography textAlign="center">No More Records</Typography>
              }
            >
              {(searchText === "" ? card : filteredCard).map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.OrderNo}
                  subtitle={item.CardName}
                  description={item.PhoneNumber1}
                  onClick={() => setTechnicialListData(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  const ClearFormData = () => {
    reset(initial);
  };

  const handleSubmitForm = async (data) => {
    const CreatedBy = localStorage.getItem("UserName");
    const CancelBy = watch("CancelBy");

    const obj = {
      DocEntry: data.DocEntry,
      CancelRemarks: data.CancelRemarks,
      CancelBy: data.DocEntry ? CancelBy : CreatedBy,
    };

    setLoading(true);

    try {
      const res = await apiClient.put(`/CancelSo/${data.DocEntry}`, obj);

      if (res.data?.success) {
        getVehicalDataList();
        fetchGetListData(0);
        handleGetListClear();
        ClearFormData();

        Swal.fire({
          text: "Order Cancel Successfully",
          icon: "success",
          title: "Success!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data?.message || "Something went wrong",
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
      setLoading(false);
    }
  };

  return (
    <>
      <Loader open={loading} />
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
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
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
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
            onClick={ClearFormData}
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
              Sales Order Details
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
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="OrderNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextSearchButton
                              label="SO NO"
                              readOnly={true}
                              onClick={() => {
                                OpenDailog();
                              }}
                              onChange={OpenDailog}
                              disabled={
                                processCancelSo === false && !!field.value
                              }
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

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="QuotationNo"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              readOnly={true}
                              {...field}
                              label="QUOTATION NO"
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="QuotationDate"
                          control={control}
                          render={({ field }) => (
                            <InputDatePickerField
                              {...field}
                              label="QUOT DATE"
                              value={field.value}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="CardCode"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              readOnly={true}
                              {...field}
                              label="CUSTOMER ID"
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
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

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="Status"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              readOnly={true}
                              {...field}
                              label="STATUS"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
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

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="CustomerBalance"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              readOnly={true}
                              {...field}
                              label="CUSTOMER BALANCE"
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="CancelBy"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              readOnly={true}
                              {...field}
                              label="CANCEL BY"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
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

                      <Grid item textAlign={"center"}>
                        <Tooltip
                          title={(watch("JobRemarks") || "").toUpperCase()}
                          arrow
                        >
                          <div style={{ width: "100%" }}>
                            <Controller
                              name="JobRemarks"
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

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="ModifiedDate"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              {...field}
                              label="DATE AND TIME"
                              value={dayjs(watch("ModifiedDate")).format(
                                "DD/MM/YYYY HH:mm",
                              )}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    item
                    sx={{
                      p: 2,
                      overflow: "auto",
                      width: "100%",
                    }}
                  >
                    <Paper
                      sx={{
                        width: "100%",
                        maxHeight: 400,
                        minHeight: 150,
                        overflow: "auto",
                      }}
                    >
                      <DataGrid
                        columnHeaderHeight={35}
                        rowHeight={45}
                        className="datagrid-style"
                        getRowId={(row) => row.ItemCode}
                        sx={{
                          ...gridSx,
                        }}
                        rows={oLines}
                        columns={itemsTable}
                        hideFooter
                        autoHeight="false"
                      />
                    </Paper>
                  </Grid>

                  <Grid container item mt={1} spacing={2}>
                    <Grid item xs={12} md={2.4}>
                      <Grid container direction="column">
                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="SALES HISTORY"
                            control={control}
                            name="SalesHistory"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="ITEMS"
                            control={control}
                            name="Items"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="GROSS ITEM AMT"
                            control={control}
                            name="TotalPartsValue"
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={2.4}>
                      <Grid container direction="column">
                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="DISC (%)"
                            control={control}
                            name="DesiredDisc"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="DESIRED DISC"
                            control={control}
                            name="DesiredDiscAmt"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="ADV AMT"
                            control={control}
                            name="AdvanceAmount"
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={2.4}>
                      <Grid container direction="column">
                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="DUE AMT"
                            control={control}
                            name="DueAmount"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="PAID AMT"
                            control={control}
                            name="PaidAmount"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="SPECIAL DISC (%)"
                            control={control}
                            name="SpecialDisc"
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={2.4}>
                      <Grid container direction="column">
                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="SPECIAL DISC AMT"
                            control={control}
                            name="SpecialDiscAmt"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="NET ITEM AMT"
                            control={control}
                            name="NetPartsValue"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="SERVICE AND INSTALLATION"
                            control={control}
                            name="ServiceAndInstallation"
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={2.4}>
                      <Grid container direction="column">
                        <Grid item textAlign={"center"}>
                          <SmallInputFields
                            readOnly={true}
                            label="DOCUMENT AMT"
                            control={control}
                            name="TotalDocAmt"
                          />
                        </Grid>

                        <Grid item textAlign={"center"}>
                          <Tooltip
                            title={(watch("CancelRemarks") || "").toUpperCase()}
                            arrow
                          >
                            <div style={{ width: "100%" }}>
                              <Controller
                                name="CancelRemarks"
                                control={control}
                                rules={{
                                  required: "Cancel Remarks is required",
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextArea
                                    readOnly={
                                      !processCancelSo ||
                                      watch("OrderNo") === ""
                                    }
                                    {...field}
                                    label="REMARK"
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </div>
                          </Tooltip>
                        </Grid>
                      </Grid>
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
                sx={{ color: "white" }}
                color="success"
                type="submit"
                disabled={!processCancelSo || watch("OrderNo") === ""}
              >
                CANCEL SALES ORDER
              </Button>

              <Button variant="contained" color="primary">
                PRINT
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
