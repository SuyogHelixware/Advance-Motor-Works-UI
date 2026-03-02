import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import {
  InputFields,
  InputTextSearchButton,
} from "../Components/formComponents";
import SearchModel from "../Components/SearchModel";
import { Loader } from "../Components/Loader";
import dayjs from "dayjs";
import apiClient from "../../services/apiClient";

export default function CustomerSalesHistory() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const initial = {
    DocNum: "",
    CardCode: "",
    CardName: "",
    PhoneNumber1: "",
    SalesHistory: "",
  };

  const {
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: initial,
  });

  const allFormData = getValues();

  // const BASE_URL = "http://hwaceri5:8070/api";

  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const SalesHistoryColumns = [
    { field: "DocNum", headerName: "DOC NUM", width: 120 },
    {
      field: "DocDate",
      headerName: "DOC DATE",
      width: 150,
      renderCell: (params) => (
        <span>{dayjs(params.value).format("YYYY-MM-DD")}</span>
      ),
    },
    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 170,
    },
    {
      field: "ItemName",
      headerName: "ITEM DESCRIPTION",
      width: 350,
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
      field: "Quantity",
      headerName: "QUANTITY",
      sortable: false,
      width: 120,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "Price",
      headerName: "UNIT PRICE",
      width: 120,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "LineTotalAmount",
      headerName: "TOTAL PRICE",
      width: 120,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "DesiredDisc",
      headerName: "DIS (%)",
      type: "number",
      width: 120,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "DesiredDiscAmt",
      headerName: "DISC AMT",
      width: 120,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "Amount",
      headerName: "AFTER DISC",
      width: 120,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "ACTION",
      headerName: "ACTION",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton color="primary">
          <PrintIcon />
        </IconButton>
      ),
    },
  ];

  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };

  const SearchModelClose = () => {
    setSearchmodelOpen(false);
    setGetListQuery("");
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
        ? `/BPV2?Status=1&CardType=C&SearchText=${encodedSearch}&Page=${pageNum}`
        : `/BPV2?Status=1&CardType=C&Page=${pageNum}`;

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

  const ClearFormData = () => {
    reset(initial);
    setSalesData([]);
    setGetListQuery("");
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const onSelectBusinessPartner = async (selectedItem) => {
    if (!selectedItem) {
      setSalesData([]);
      reset({
        CardCode: "",
        CardName: "",
        PhoneNumber1: "",
        SalesHistory: "",
      });
      return;
    }

    setLoading(true);
    try {
      const { CardCode } = selectedItem;
      const res = await apiClient.get(`/BPSalesHistory/${CardCode}`);

      if (res.data.success && Array.isArray(res.data.values)) {
        const formattedData = res.data.values.map((item) => ({
          DocEntry: item.DocEntry || "",
          DocNum: item.DocNum || "",
          DocDate: item.DocDate || "",
          ItemCode: item.ItemCode || "",
          ItemName: item.ItemName || "",
          Quantity: item.Quantity || 0,
          Price: item.Price || 0,
          LineTotalAmount: item.LineTotalAmount || 0,
          DesiredDisc: item.DesiredDisc || 0,
          DesiredDiscAmt: item.DesiredDiscAmt || 0,
          Amount: item.Amount || 0,
        }));

        setSalesData(formattedData);
        SearchModelClose();
        setGetListQuery("");
      } else {
        setSalesData([]);
        Swal.fire({
          icon: "warning",
          text: "No sales history found for this customer.",
          timer: 2000,
          toast: true,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "Failed to load sales history.",
      });
    } finally {
      setLoading(false);
    }

    reset({
      CardCode: selectedItem.CardCode,
      CardName: selectedItem.CardName,
      PhoneNumber1: selectedItem.PhoneNumber1,
      SalesHistory: selectedItem.SalesHistory,
    });
  };

  return (
    <>
      <Loader open={loading} />

      <Grid container width={"100%"} padding={1} height="calc(100vh - 110px)">
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          component="form"
          position="relative"
        >
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
              Customer Sales History
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
                  <Grid item xs={12} md={6}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="PhoneNumber1"
                          control={control}
                          render={({ field }) => (
                            <InputTextSearchButton
                              label="CONTACT NO"
                              readOnly={true}
                              onClick={() => {
                                OpenDailog();
                              }}
                              onChange={OpenDailog}
                              {...field}
                            />
                          )}
                        />

                        <SearchModel
                          open={searchmodelOpen}
                          onClose={SearchModelClose}
                          onCancel={SearchModelClose}
                          title="Select Customer"
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
                                    title={item.CardCode}
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
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                          name="SalesHistory"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              readOnly={true}
                              {...field}
                              label="SALES HISTORY"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid container item mt={2}>
                    <Grid
                      item
                      style={{ width: "100%", paddingLeft: 3, paddingRight: 3 }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<SystemUpdateAltIcon />}
                        sx={{
                          textTransform: "uppercase",
                          fontSize: 14,
                          marginBottom: 3,
                        }}
                      >
                        Export
                      </Button>

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
                          rows={salesData}
                          columns={SalesHistoryColumns}
                          autoHeight="false"
                          hideFooter
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { lg: "none" }, // Show only on smaller screens
          "& .MuiDrawer-paper": {
            top: "70px", // Adjust this value as needed
            width: "80vw",
          },
        }}
      ></Drawer>
    </>
  );
}
