import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BeatLoader } from "react-spinners";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";

export default function DailyCollection() {
  const [loading, setLoading] = useState(false);
  const [partsTableData, setPartsTableData] = useState([]);
  const [serviceTableData, setServiceTableData] = useState([]);
  const [totalsTableData, setTotalsTableData] = useState([]);
  const [partsTableDataTotal, setPartsTableDataTotal] = useState("0.00"); 
  const [ServiceTableDataTotal, setServiceTableDataTotal] = useState("0.00"); 
  const { control, setValue } = useForm({
    defaultValues: {
      selectedDate: new Date(),
    },
  });

  const tablePartsales = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 60,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) =>
        params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    { field: "OrderNo", headerName: "SO NO", width: 120 },
    {
      field: "InvoiceNo",
      headerName: "INV NO",
      width: 120,
    },
    {
      field: "RCTNO",
      headerName: "RECEIPT NO",
      width: 120,
    },
    { field: "DP", headerName: "DP", width: 120 },
    {
      field: "CardName",
      headerName: "CUSTOMER NAME",
      width: 400,
      flex: 1,
    },
    {
      field: "PhoneNumber1",
      headerName: "CONTACT NO",
      width: 170,
    },
    {
      field: "PAYMethod",
      headerName: "PYMNT MODE",
      width: 150,
    },
    {
      field: "Amount",
      headerName: "PARTS AMT",
      width: 150,
      headerAlign: "right",
      align: "right",
      renderCell: (params) =>
        params.row.Amount === ""
          ? ""
          : Number.parseFloat(params.row.Amount).toFixed(2),
    },
  ];

  const tablePartservice = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 60,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) =>
        params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    { field: "OrderNo", headerName: "SO NO", width: 120 },
    {
      field: "InvoiceNo",
      headerName: "INV NO",
      width: 120,
    },
    {
      field: "RCTNO",
      headerName: "RECEIPT NO",
      width: 120,
    },
    { field: "DP", headerName: "DP", width: 120 },
    {
      field: "CardName",
      headerName: "CUSTOMER NAME",
      width: 400,
      flex: 1,
    },
    {
      field: "PhoneNumber1",
      headerName: "CONTACT NO",
      width: 170,
    },
    {
      field: "PAYMethod",
      headerName: "PYMNT MODE",
      width: 150,
    },
    {
      field: "Amount",
      headerName: "PARTS AMT",
      width: 150,
      headerAlign: "right",
      align: "right",
      renderCell: (params) =>
        params.row.Amount === ""
          ? ""
          : Number.parseFloat(params.row.Amount).toFixed(2),
    },
  ];

  const Totalcolumns = [
    {
      field: "label",
      headerName: "PAYMENT METHOD",
      width: 280,
      renderCell: (params) => (
        <span style={{ fontWeight: params.row.bold ? "bold" : "normal" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "Amount",
      headerName: "AMOUNT",
      width: 280,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <span style={{ fontWeight: params.row.bold ? "bold" : "normal" }}>
          {params.value}
        </span>
      ),
    },
  ];

  const transformTotalsData = (totals) => {
    return [
      { id: 1, label: "CASH", Amount: totals?.CashTotal || "0.00" },
      { id: 2, label: "KNET", Amount: totals?.KNetTotal || "0.00" },
      { id: 3, label: "BANK", Amount: totals?.BankTotal || "0.00" },
      { id: 4, label: "MY FATOORAH", Amount: totals?.MFTotal || "0.00" },
      { id: 5, label: "TABBY", Amount: totals?.TabbyTotal || "0.00" },
      { id: 6, label: "TAMARA", Amount: totals?.TamaraTotal || "0.00" },
      { id: 7, label: "TALY", Amount: totals?.TalyTotal || "0.00" },
      {
        id: 8,
        label: "TOTAL",
        Amount: totals?.ColletionTotal || "0.00",
        bold: true,
      },
    ];
  };

  const getAllCashCollectionList = useCallback(async (date) => {
    setLoading(true);
    try {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const res = await apiClient.get(
        `/Reports/DailyCollection/${formattedDate}`,
      );

      const values = res.data.values;

      // Extract parts collection
      const partsDataObj =
        values.find((v) => v.ColletionType === "PARTS") || {};
      const partsData = partsDataObj.ColletionValues || [];
      const partsTotal = partsDataObj.Total || "0.00";

      // Extract service collection
      const serviceDataObj =
        values.find((v) => v.ColletionType === "SERVICE") || {};
      const serviceData = serviceDataObj.ColletionValues || [];
      const serviceTotal = serviceDataObj.Total || "0.00";

      // Extract totals object for the totals DataTable
      const totalsRaw =
        values.find((v) => v.ColletionTotal !== undefined) || {};
      const totalsData = transformTotalsData(totalsRaw);

      setPartsTableData(partsData);
      setPartsTableDataTotal(partsTotal);
      setServiceTableData(serviceData);
      setServiceTableDataTotal(serviceTotal);
      setTotalsTableData(totalsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const today = new Date();
    getAllCashCollectionList(today);
  }, []);

  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const ClearForm = () => {
    const today = new Date();
    setValue("selectedDate", today);
    getAllCashCollectionList(today);
  };

  return (
    <>
      <Grid
        container
        xs={12}
        md={12}
        sx={{ border: "1px silver solid", position: "relative" }}
        height="calc(100% - 70px)"
        overflow={"scroll"}
        style={{ overflowY: "hidden" }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={ClearForm}
          sx={{
            display: {},
            position: "absolute",
            right: "10px",
            zIndex: 11,
          }}
        >
          <AddIcon />
        </IconButton>
        <Grid
          item
          xs={12}
          md={12}
          height={`calc(100%-100px)`}
          position={"sticky"}
        >
          <Typography
            alignContent={"center"}
            borderBottom={"1px solid silver"}
            sx={{
              width: "100%",
              height: "40px",
              textAlign: "center",
            }}
          >
            Daily Cash Collection
          </Typography>

          <Grid
            container
            item
            xs={12}
            md={12}
            justifyContent={"center"}
            py={2}
            columnGap={2}
            rowGap={2}
            sx={{
              width: "100%",
              position: "sticky",
              top: 0,
              zIndex: 10,
              borderBottom: "1px solid #ccc",
            }}
          >
            <Box
              width={"100%"}
              component="form"
              sx={{
                "& .MuiTextField-root": { m: 1 },
              }}
              noValidate
              autoComplete="off"
              position={"relative"}
            >
              <Grid
                item
                width={"100%"}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"flex-end"}
                alignContent={"center"}
                alignItems={"center"}
                paddingRight={3}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="selectedDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="DATE"
                        value={field.value ? dayjs(field.value) : null}
                        format="DD-MMM-YYYY"
                        onChange={(date) => {
                          field.onChange(date);
                          getAllCashCollectionList(date);
                        }}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                        sx={{ width: "100%", maxWidth: 220 }}
                      />
                    )}
                  />
                </LocalizationProvider>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    height: "40px",
                    alignItems: "center",
                    alignContent: "center",
                    alignSelf: "center",
                  }}
                  startIcon={<PrintIcon />}
                >
                  Print
                </Button>
              </Grid>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={12}
            p={2}
            flex={1}
            overflow="auto"
            sx={{ padding: 2, height: "calc(100vh - 230px)" }}
          >
            <Paper
              elevation={5}
              sx={{
                borderRadius: 2,
                marginBottom: 2,
                display: "flex",
                flexDirection: "column",
                height: 400,
              }}
            >
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid #ccc"
              >
                <Typography fontSize="15px" color="gray" p={3}>
                  <b>COLLECTION [PARTS SALES]</b>
                </Typography>

                <Button
                  sx={{ fontSize: "13px", marginRight: 3 }}
                  variant="outlined"
                  startIcon={<SaveAltOutlinedIcon />}
                  // onClick={exportData}
                >
                  EXPORT
                </Button>
              </Grid>

              <Box flex={1} overflow="auto" m={2}>
                {loading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <BeatLoader loading={loading} />
                  </Box>
                ) : (
                  <DataGrid
                    columns={tablePartsales}
                    rows={partsTableData}
                    loading={loading}
                    getRowId={(row) => row.RCTNO}
                    columnHeaderHeight={35}
                    hideFooter
                    rowHeight={45}
                    autoHeight={false}
                    sx={gridSx}
                  />
                )}
              </Box>

              <Box p={1} mr={1} textAlign="right">
                <Typography fontWeight="bold">
                  Total: {partsTableDataTotal}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={5}
              sx={{
                borderRadius: 2,
                marginBottom: 2,
                display: "flex",
                flexDirection: "column",
                height: 400,
              }}
            >
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid #ccc"
              >
                <Typography fontSize="15px" color="gray" p={3}>
                  <b>COLLECTION [SERVICE]</b>
                </Typography>
              </Grid>

              <Box flex={1} overflow="auto" m={2}>
                {loading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <BeatLoader loading={loading} />
                  </Box>
                ) : (
                  <DataGrid
                    columns={tablePartservice}
                    rows={serviceTableData}
                    loading={loading}
                    getRowId={(row) => row.RCTNO}
                    columnHeaderHeight={35}
                    hideFooter
                    rowHeight={45}
                    autoHeight={false}
                    sx={gridSx}
                  />
                )}
              </Box>

              <Box p={1} mr={1} textAlign="right">
                <Typography fontWeight="bold">
                  Total: {ServiceTableDataTotal}
                </Typography>
              </Box>
            </Paper>

            <Grid container item justifyContent="flex-end" my={3}>
              <Paper
                elevation={5}
                sx={{ borderRadius: 2, width: "100%", maxWidth: "600px" }}
              >
                <Grid
                  item
                  lg={12}
                  width={"100%"}
                  maxHeight={350}
                  minHeight={150}
                  overflow="auto"
                >
                  {loading ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="150px"
                    >
                      <BeatLoader loading={loading} />
                    </Box>
                  ) : (
                    <Box p={2}>
                      <DataGrid
                        columns={Totalcolumns}
                        rows={totalsTableData || []}
                        loading={loading}
                        getRowId={(row) => row.id}
                        columnHeaderHeight={35}
                        rowHeight={30}
                        hideFooter
                        disableColumnMenu
                        disableColumnSorting
                        autoHeight="false"
                        sx={gridSx}
                      />
                    </Box>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
