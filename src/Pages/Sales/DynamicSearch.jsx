import AddIcon from "@mui/icons-material/Add";
import DetailsIcon from "@mui/icons-material/Details";
import ImageIcon from "@mui/icons-material/Image";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { TabPanel } from "@mui/lab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InfiniteLoader } from "react-virtualized";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import {
  InputSearchSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";

export default function DynamicSearch() {
  const [tabValue, setTabValue] = useState("1");
  const [selectedRow, setSelectedRow] = useState(null);
  const [images, setImages] = useState([]);

  const [GRN, setGrn] = useState([]);
  const [GRNPage, setGRNPage] = useState(1);
  const [hasMoreGRN, setHasMoreGRN] = useState(true);
  const [loadingGRN, setLoadingGRN] = useState(false);

  const [ARInvoice, setARInvoice] = useState([]);
  const [ARInvoicePage, setARInvoicePage] = useState(1);
  const [hasMoreARInvoice, setHasMoreARInvoice] = useState(true);
  const [loadingARInvoice, setLoadingARInvoice] = useState(false);

  const [OpenSO, setOpenSO] = useState([]);
  const [OpenSOPage, setOpenSOPage] = useState(1);
  const [hasMoreOpenSO, setHasMoreOpenSO] = useState(true);
  const [loadingOpenSO, setLoadingOpenSO] = useState(false);

  const [filteredList, setFilteredList] = useState("");
  const [ModalLoading, setModalLoading] = useState(false);
  const [Suppliers, setSuppliers] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const theme = useTheme();

  const initial = {
    Supplier: "",
    CardName: "",
    ItemName: "",
    ItemCode: "",
    IsActive: false,
    Stock: true,
    SAPDocNum: "",
  };

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: initial,
  });

  const columns = [
    {
      field: "ItemCode",
      headerName: "Item Code",
      width: 250,
      editable: true,
    },
    {
      field: "ItemName",
      headerName: "Item Description",
      width: 700,
      editable: true,
    },
    {
      field: "D_FTS",
      headerName: "D-FTS",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    // {
    //   field: "UAE_TO_KWT",
    //   headerName: "INTRANS",
    //   width: 100,
    //   editable: true,
    // },
    {
      field: "OH_KWT",
      headerName: "OH-KWT",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "RSVD_KWT",
      headerName: "RSVD-KWT",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "FTS_KWT",
      headerName: "FTS-KWT",
      width: 100,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "Price",
      headerName: "PRICE",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "FittingCharge",
      headerName: "FITING",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    // {
    //   field: "InTransit",
    //   headerName: "GIT",
    //   width: 110,
    //   editable: true,
    // },
    {
      field: "OrderQty",
      headerName: "ORDRD",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
  ];

  const getAllBPFormData = async (page = 0, searchQuery = "") => {
    try {
      setModalLoading(true);

      const res = await apiClient.get(
        `/BPV2?CardType=S&GroupCode=0&Status=1&Page=0&Limit=200`,
      );

      const data = res?.data;

      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid Supplier response");
      }

      const supplierLists = data.values.filter(
        (item) => String(item?.Status) === "1",
      );

      setSuppliers(supplierLists);

      if (supplierLists.length > 0) {
        const defaultDocEntry = supplierLists[0].CardName;
        setValue("CardName", defaultDocEntry);
        setValue("SAPDocNum", supplierLists[0].SAPDocNum);
      }
    } catch (error) {
      console.error("Error fetching Supplier:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch Supplier data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const getItemDetails = (ItemCode) => {
    setARInvoicePage(1);
    setHasMoreARInvoice(true);

    setOpenSOPage(1);
    setHasMoreOpenSO(true);

    setGRNPage(1);
    setHasMoreGRN(true);

    const ARInvoice = document.getElementById("ARInvoiceScroll");
    if (ARInvoice) ARInvoice.scrollTo(0, 0);

    const OpenSO = document.getElementById("OpenSOScroll");
    if (OpenSO) OpenSO.scrollTo(0, 0);

    const GRN = document.getElementById("GRNScroll");
    if (GRN) GRN.scrollTo(0, 0);

    const ATP = document.getElementById("ATPScroll");
    if (ATP) ATP.scrollTo(0, 0);

    setModalLoading(true);

    apiClient
      .request({
        method: "get",
        url: `/DynamicSearch/itemsdata/${ItemCode}`,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.success === true) {
          const data = response.data.values[0];

          setImages(data?.Images || []);
          setGrn(data?.GRN || []);
          setARInvoice(data?.ARInvoice || []);
          setOpenSO(data?.OpenSO || []);
          setModalLoading(false);
        } else if (response.data.success === false) {
          setModalLoading(false);
          Swal.fire({
            title: "Error!",
            text: response.data.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      })
      .catch((error) => {
        setModalLoading(false);
        console.log(error);
      });
  };

  const handleCheck = (itemCode) => {
    getItemDetails(itemCode);
  };

  const loadMoreRowsGRN = async () => {
    if (!hasMoreGRN || loadingGRN) return;

    setLoadingGRN(true);

    const url = `/DynamicSearch/QuotSO/itemsdata/GRN/${selectedRow.ItemCode}/${GRNPage}`;

    try {
      const response = await apiClient.get(`${url}`);

      const newData = response.data.values || [];

      if (newData.length === 0) {
        setHasMoreGRN(false);
        return;
      }

      setGrn((prev) => [...prev, ...newData]);
      setGRNPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingGRN(false);
    }
  };

  const handleScrollGRN = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      loadMoreRowsGRN();
    }
  };

  const loadMoreRowsARInvoice = async () => {
    if (loadingARInvoice || !hasMoreARInvoice) return;

    setLoadingARInvoice(true);

    const url = `/DynamicSearch/QuotSO/itemsdata/ARInvoice/${selectedRow.ItemCode}/${ARInvoicePage}`;

    try {
      const response = await apiClient.get(`${url}`);

      const newData = response.data.values || [];

      if (newData.length === 0) {
        setHasMoreARInvoice(false);
        return;
      }

      setARInvoice((prev) => {
        const mergedData = [...prev, ...newData];

        const uniqueData = mergedData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.InvoiceNo === item.InvoiceNo),
        );

        return uniqueData;
      });

      setARInvoicePage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingARInvoice(false);
    }
  };

  const handleScrollARInvoice = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      loadMoreRowsARInvoice();
    }
  };

  const loadMoreRowsOpenSo = async () => {
    if (!hasMoreOpenSO || loadingOpenSO) return;

    setLoadingOpenSO(true);

    const url = `/DynamicSearch/QuotSO/itemsdata/OpenSo/${selectedRow.ItemCode}/${OpenSOPage}`;

    try {
      const response = await apiClient.get(`${url}`);

      const newData = response.data.values || [];

      if (newData.length === 0) {
        setHasMoreOpenSO(false);
        return;
      }

      setOpenSO((prev) => [...prev, ...newData]);
      setOpenSOPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOpenSO(false);
    }
  };

  const handleScrollOpenSo = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      loadMoreRowsOpenSo();
    }
  };

  const clearDynamicSearchList = () => {
    setSelectedRow();
    setGrn([]);
    setARInvoice([]);
    setOpenSO([]);
    setImages([]);
    reset(initial);
  };

  const fetchFormData = async (payload = {}) => {
    setModalLoading(true);

    try {
      const body = {
        Supplier: payload.SAPDocNum || "",
        ItemName: payload.ItemName || "",
        ItemCode: payload.ItemCode || "",
        IsActive: payload.IsActive === true ? 0 : 1,
        Stock: payload.Stock === true ? 0 : 1,
      };

      const res = await apiClient.post(`/DynamicSearch/search`, body);

      if (res.data.success) {
        setFilteredList(res.data.values);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.message || "Something went wrong",
      });
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    getAllBPFormData();
    fetchFormData(initial);
  }, []);

  const onSubmit = (data) => {
    fetchFormData(data);
  };

  // const onSubmit = async (data) => {
  //   setModalLoading(true);

  //   try {
  //     const obj = {
  //       Supplier: data.SAPDocNum || "",
  //       ItemName: data.ItemName || "",
  //       ItemCode: data.ItemCode || "",
  //       IsActive: data.IsActive === true ? 0 : 1,
  //       Stock: data.Stock === true ? 0 : 1,
  //       Make: data.Make || "",
  //       Model: data.Model || "",
  //       Year: data.Year || "",
  //       Category: data.Category || "",
  //       SubCategory: data.SubCategory || "",
  //     };

  //     const res = await apiClient.post(`/DynamicSearch/search`, obj);

  //     if (res.data.values.length > 0) {
  //       setModalLoading(false);
  //       setFilteredList(res.data.values);
  //     } else if (res.data.values.length === 0) {
  //       setModalLoading(false);
  //       Swal.fire({
  //         text: "No Record Found",
  //         icon: "warning",
  //         toast: true,
  //         timer: 1500,
  //         showConfirmButton: false,
  //       });
  //     }
  //   } catch (error) {
  //     setModalLoading(false);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Oops...",
  //       text: error.message || error.toString(),
  //     });
  //   }
  // };

  const exportExcel = async () => {
    if (!filteredList || filteredList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "There is no data to export!",
      });
      return;
    }

    // Define visible columns
    const tableColumns = [
      { header: "ITEM CODE", field: "ItemCode", width: 18, align: "left" },
      {
        header: "ITEM DESCRIPTION",
        field: "ItemName",
        width: 70,
        align: "left",
      },
      { header: "D-FTS", field: "D_FTS", width: 10, align: "right" },
      { header: "INTRANS", field: "UAE_TO_KWT", width: 10, align: "right" },
      { header: "OH-KWT", field: "OH_KWT", width: 10, align: "right" },
      { header: "RSVD-KWT", field: "RSVD_KWT", width: 10, align: "right" },
      { header: "FTS-KWT", field: "FTS_KWT", width: 10, align: "right" },
      { header: "PRICE", field: "Price", width: 10, align: "right" },
      { header: "FITING", field: "FittingCharge", width: 10, align: "right" },
      { header: "GIT", field: "InTransit", width: 10, align: "right" },
      { header: "ORDRD", field: "OrderQty", width: 10, align: "right" },
    ];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Item Search");

    sheet.columns = tableColumns.map((col) => ({
      header: col.header,
      key: col.field,
      width: col.width,
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: "000000" } };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" },
    };
    headerRow.height = 28;

    filteredList.forEach((item) => {
      const rowData = {};
      tableColumns.forEach((col) => {
        rowData[col.field] = item[col.field] ?? "";
      });
      sheet.addRow(rowData);
    });

    tableColumns.forEach((col, index) => {
      sheet.getColumn(index + 1).alignment = {
        horizontal: col.align,
        vertical: "middle",
      };
    });

    sheet.eachRow((row, rowNumber) => {
      row.font = { name: "Calibri", size: 11 };
      row.height = rowNumber === 1 ? 28 : 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "ItemSearch.xlsx");
  };

  return (
    <>
      {ModalLoading && <Loader open={ModalLoading} />}
      <Grid container width={"100%"} padding={1} height="calc(100vh - 110px)">
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          position="relative"
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={clearDynamicSearchList}
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
              ITEM SEARCH
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
              xs={12}
              height="100%"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
            >
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container md={12} xs={12} sm={12} p={2}>
                  <Grid container item md={12} spacing={2}>
                    <Grid container item md={3}>
                      <Card elevation={5} sx={{ width: "100%", p: 1 }}>
                        <Grid
                          item
                          md={12}
                          sm={12}
                          xs={12}
                          lg={12}
                          textAlign={"center"}
                        >
                          <Controller
                            name="CardName"
                            control={control}
                            render={({ field }) => (
                              <InputSearchSelectTextField
                                label="SUPPLIER"
                                {...field}
                                data={Suppliers.map((item) => ({
                                  key: item.DocEntry,
                                  value: item.CardName,
                                }))}
                                onChange={(e) => {
                                  field.onChange(e);

                                  const selectedSupplier = Suppliers.find(
                                    (item) =>
                                      String(item.DocEntry) ===
                                      String(e.target.value),
                                  );

                                  setValue(
                                    "SAPDocNum",
                                    selectedSupplier?.SAPDocNum || "",
                                  );
                                }}
                                sx={{
                                  maxWidth: 350,
                                  "& input": {
                                    textTransform: "uppercase",
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          lg={12}
                          textAlign={"center"}
                        >
                          <Controller
                            name="ItemName"
                            control={control}
                            render={({ field }) => (
                              <InputTextField
                                label="DESCRIPTION"
                                {...field}
                                rows={1}
                                sx={{
                                  maxWidth: 350,
                                  "& input": {
                                    textTransform: "uppercase",
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={12}
                          lg={12}
                          textAlign={"center"}
                        >
                          <Controller
                            name="ItemCode"
                            control={control}
                            render={({ field }) => (
                              <InputTextField
                                label="ITEM CODE"
                                {...field}
                                rows={1}
                                sx={{
                                  maxWidth: 350,
                                  "& input": {
                                    textTransform: "uppercase",
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="center">
                            <Box width={330}>
                              <Controller
                                name="Stock"
                                control={control}
                                defaultValue={true}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        size="medium"
                                        sx={{
                                          textAlign: "center",
                                          width: 20,
                                          mr: 1,
                                        }}
                                        {...field}
                                        checked={field.value}
                                      />
                                    }
                                    label="Include Zero Stock"
                                    sx={{ textAlign: "center", width: 200 }}
                                  />
                                )}
                              />
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="center">
                            <Box width={330}>
                              <Controller
                                name="IsActive"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        size="medium"
                                        sx={{
                                          textAlign: "center",
                                          width: 20,
                                          mr: 1,
                                        }}
                                        {...field}
                                        checked={field.value}
                                      />
                                    }
                                    label="Include InActive Items"
                                    sx={{ textAlign: "center", width: 200 }}
                                  />
                                )}
                              />
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} mt={2} mb={2}>
                          <Box display="flex" justifyContent="center">
                            <Box width={350} display="flex" gap={2}>
                              <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                type="submit"
                                sx={{ color: "white" }}
                              >
                                Search
                              </Button>

                              <Button
                                variant="contained"
                                color="error"
                                fullWidth
                                type="button"
                                onClick={() => {
                                  fetchFormData(initial);
                                  clearDynamicSearchList();
                                  reset(initial);
                                }}
                              >
                                Clear
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      </Card>
                    </Grid>

                    <Grid container item md={9}>
                      <Card elevation={5} sx={{ width: "100%", p: 2 }}>
                        <Grid item md={12} xs={12}>
                          <TabContext value={tabValue}>
                            <Box
                              sx={{
                                borderBottom: 1,
                                borderColor: "divider",
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                              }}
                            >
                              <Paper style={{ padding: 0 }}>
                                <TabList
                                  onChange={handleTabChange}
                                  aria-label="lab API tabs example"
                                  variant="scrollable"
                                  scrollButtons="auto"
                                  sx={{
                                    bgcolor: "background.paper",
                                    borderBottom: 1,
                                    borderColor: "divider",
                                    padding: 0,
                                  }}
                                >
                                  <Tab
                                    icon={<ImageIcon />}
                                    label="Item Image"
                                    value="1"
                                    sx={{ width: 200 }}
                                    iconPosition="start"
                                  />
                                  <Tab
                                    icon={<DetailsIcon />}
                                    label="GRN DETAILS"
                                    value="2"
                                    sx={{ width: 200 }}
                                    iconPosition="start"
                                  />
                                  <Tab
                                    icon={<RequestQuoteIcon />}
                                    label="A/R- Invoice"
                                    value="3"
                                    sx={{ width: 200 }}
                                    iconPosition="start"
                                  />
                                  <Tab
                                    icon={<TextSnippetIcon />}
                                    label="Open SO"
                                    value="4"
                                    sx={{ width: 200 }}
                                    iconPosition="start"
                                  />
                                </TabList>
                              </Paper>
                            </Box>

                            <TabPanel
                              value="1"
                              sx={{ padding: 0, paddingTop: 3 }}
                            >
                              <Paper
                                sx={{
                                  width: "100%",
                                  height: "200px",
                                  overflowY: "auto",
                                  overflowX: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    overflowX: "auto",
                                    overflowY: "hidden",
                                    gap: "12px",
                                    padding: "10px",
                                    whiteSpace: "nowrap",
                                    justifyContent: "space-evenly",
                                  }}
                                >
                                  {images.length > 0 ? (
                                    images.map((data, index) => (
                                      <div className="mb-1" key={index}>
                                        <Card
                                          style={{
                                            height: "150px",
                                            width: "150px",
                                            backgroundColor: "silver",
                                          }}
                                        >
                                          <img
                                            src={`data:image/png;base64,${data}`}
                                            alt="img1"
                                            height="100%"
                                            width="100%"
                                          />
                                        </Card>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-center w-100 mt-3">
                                      No images available
                                    </p>
                                  )}
                                </div>
                              </Paper>
                            </TabPanel>

                            <TabPanel
                              value="2"
                              sx={{ padding: 0, paddingTop: 3 }}
                            >
                              <Paper sx={{ width: "100%", height: "200px" }}>
                                <InfiniteLoader
                                  isItemLoaded={(index) => index < GRN.length}
                                  itemCount={
                                    hasMoreGRN ? GRN.length + 1 : GRN.length
                                  }
                                  loadMoreItems={loadMoreRowsGRN}
                                >
                                  {({ onItemsRendered, ref }) => (
                                    <TableContainer
                                      style={{
                                        maxHeight: "200px",
                                        maxWidth: "100%",
                                        overflowY: "auto",
                                      }}
                                      id="GRNScroll"
                                      onScroll={handleScrollGRN}
                                      ref={ref}
                                    >
                                      <Table
                                        stickyHeader
                                        className="infiniteScroll table-style-scroll"
                                      >
                                        <TableHead>
                                          <TableRow>
                                            <Tooltip title="GRN DATE">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{ width: "15%" }}
                                              >
                                                GRN DATE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="GRN NO">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{ width: "10%" }}
                                              >
                                                GRN NO
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="SUPPLIER NAME">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{ width: "20%" }}
                                              >
                                                SUPPLIER NAME
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="RECEIVED QTY">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  width: "4%",
                                                  textAlign: "start",
                                                }}
                                              >
                                                RECEIVED QTY
                                              </TableCell>
                                            </Tooltip>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {GRN.map((row, index) => (
                                            <TableRow
                                              key={index}
                                              style={{
                                                fontWeight: "unset",
                                              }}
                                            >
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  maxWidth: "20px",
                                                }}
                                              >
                                                {dayjs(row.DocDate).format(
                                                  "DD-MM-YYYY",
                                                )}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.DocNum}
                                              </TableCell>
                                              <Tooltip title={row.CardName}>
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {row.CardName}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                  paddingRight: 30,
                                                }}
                                              >
                                                {row.Quantity.toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  )}
                                </InfiniteLoader>
                              </Paper>
                            </TabPanel>

                            <TabPanel
                              value="3"
                              sx={{ padding: 0, paddingTop: 3 }}
                            >
                              <Paper sx={{ width: "100%", height: "200px" }}>
                                <InfiniteLoader
                                  isItemLoaded={(index) =>
                                    index < ARInvoice.length
                                  }
                                  itemCount={
                                    hasMoreARInvoice
                                      ? ARInvoice.length + 1
                                      : ARInvoice.length
                                  }
                                  loadMoreItems={loadMoreRowsARInvoice}
                                >
                                  {({ onItemsRendered, ref }) => (
                                    <TableContainer
                                      style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                      }}
                                      id="ARInvoiceScroll"
                                      onScroll={handleScrollARInvoice}
                                      ref={ref}
                                    >
                                      <Table
                                        stickyHeader
                                        className="infiniteScroll table-style-scroll"
                                      >
                                        <TableHead>
                                          <TableRow>
                                            <Tooltip title="INV DATE">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  width: "100px",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                INV DATE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="INV NO">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                              >
                                                INV NO
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="CUSTOMER NAME">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                              >
                                                CUST NAME
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="QTY">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                              >
                                                QTY
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="MOBILE">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                              >
                                                MOBILE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="BEFORE DISC">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                BEFORE DISC
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="DISC(%)">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                DISC(%)
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="AFTER DISC">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                AFTER DISC
                                              </TableCell>
                                            </Tooltip>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {ARInvoice.map((row, index) => (
                                            <TableRow
                                              key={index}
                                              style={{
                                                fontWeight: "unset",
                                              }}
                                            >
                                              <Tooltip
                                                title={dayjs(
                                                  row.InvoiceDate,
                                                ).format("DD-MM-YYYY")}
                                              >
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {dayjs(
                                                    row.InvoiceDate,
                                                  ).format("DD-MM-YYYY")}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.InvoiceNo}
                                              </TableCell>
                                              <Tooltip title={row.CardName}>
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {row.CardName}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "center",
                                                }}
                                              >
                                                {Number(row.Quantity).toFixed(
                                                  2,
                                                )}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.PhoneNumber1}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {Number(row.Amount).toFixed(2)}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {Number(row.Discount).toFixed(
                                                  2,
                                                )}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {Number(
                                                  row.AfDiscAmount,
                                                ).toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  )}
                                </InfiniteLoader>
                              </Paper>
                            </TabPanel>

                            <TabPanel
                              value="4"
                              sx={{ padding: 0, paddingTop: 3 }}
                            >
                              <Paper sx={{ width: "100%", height: "200px" }}>
                                <InfiniteLoader
                                  isItemLoaded={(index) =>
                                    index < OpenSO.length
                                  }
                                  itemCount={
                                    hasMoreOpenSO
                                      ? OpenSO.length + 1
                                      : OpenSO.length
                                  }
                                  loadMoreItems={loadMoreRowsOpenSo}
                                >
                                  {({ onItemsRendered, ref }) => (
                                    <TableContainer
                                      style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                      }}
                                      id="OpenSOScroll"
                                      onScroll={handleScrollOpenSo}
                                      ref={ref}
                                    >
                                      <Table
                                        stickyHeader
                                        className="infiniteScroll"
                                      >
                                        <TableHead>
                                          <TableRow>
                                            <Tooltip title="SO NO">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                SO NO
                                              </TableCell>
                                            </Tooltip>
                                            <Tooltip title="SO DATE">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                SO DATE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="CUSTOMER CODE">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                CUST CODE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="CUSTOMER NAME">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                CUST NAME
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="MOBILE">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                MOBILE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="ORDER QTY">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                ORDER QTY
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="VALUE">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                VALUE
                                              </TableCell>
                                            </Tooltip>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {OpenSO.map((row, index) => (
                                            <TableRow
                                              key={index}
                                              style={{
                                                fontWeight: "unset",
                                              }}
                                            >
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.OrderNo}
                                              </TableCell>
                                              <Tooltip
                                                title={dayjs(
                                                  row.DocDate,
                                                ).format("DD-MM-YYYY")}
                                              >
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {dayjs(row.DocDate).format(
                                                    "DD-MM-YYYY",
                                                  )}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.CardCode}
                                              </TableCell>
                                              <Tooltip title={row.CardName}>
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {row.CardName}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.PhoneNumber1}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {row.Quantity}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {Number(row.Amount).toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  )}
                                </InfiniteLoader>
                              </Paper>
                            </TabPanel>
                          </TabContext>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>

                  <Grid container item md={12} mt={2}>
                    <Card
                      elevation={5}
                      sx={{ width: "100%", p: 2, height: 600, pb: 5 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginBottom: 13,
                        }}
                      >
                        <Button
                          color="success"
                          style={{ fontSize: "14px", padding: "4px 10px" }}
                          variant="contained"
                          onClick={exportExcel}
                        >
                          <i className="fa fa-file-excel-o"></i> Export to Excel
                        </Button>
                      </div>

                      {selectedRow && (
                        <Grid container pb={2}>
                          <Grid
                            item
                            lg={2}
                            sm={4}
                            xs={12}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography>
                              Item Code : &nbsp;
                              <span style={{ color: "green", fontSize: 13 }}>
                                {selectedRow.ItemCode || ""}
                              </span>
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            lg={6}
                            sm={4}
                            xs={12}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography style={{ margin: 0 }}>
                              Description : &nbsp;
                              <Tooltip title={selectedRow.ItemName || ""}>
                                <span style={{ color: "green", fontSize: 13 }}>
                                  {selectedRow.ItemName || ""}
                                </span>
                              </Tooltip>
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            lg={4}
                            sm={4}
                            xs={12}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography>
                              Supplier : &nbsp;
                              <span style={{ color: "green", fontSize: 13 }}>
                                {selectedRow.CardName || ""}
                              </span>
                            </Typography>
                          </Grid>
                        </Grid>
                      )}

                      <Box sx={{ height: 500, width: "100%" }}>
                        <DataGrid
                          columnHeaderHeight={35}
                          rowHeight={45}
                          className="datagrid-style"
                          getRowId={(row) => row.ItemCode}
                          sx={{
                            ...gridSx,
                            cursor: "pointer",
                          }}
                          rows={filteredList}
                          columns={columns}
                          pageSizeOptions={[25, 50, 100]}
                          initialState={{
                            pagination: {
                              paginationModel: { pageSize: 100 },
                            },
                          }}
                          editMode={false}
                          onRowClick={(params) => {
                            const itemCode = params.row.ItemCode;
                            setSelectedRow(params.row);
                            handleCheck(itemCode);
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
