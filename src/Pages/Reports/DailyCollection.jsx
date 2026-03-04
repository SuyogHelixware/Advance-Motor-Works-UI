import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dataGridSx } from "../../Styles/dataGridStyles";
import { InputDatePickerFields } from "../Components/formComponents";
import { useTheme } from "@mui/material/styles";
import apiClient from "../../services/apiClient";

const tablePartsales = [
  {
    field: "srNo",
    headerName: "SR.NO",
    width: 60,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => params.api.getSortedRowIds().indexOf(params.id) + 1,
  },
  { field: "OrderNo", headerName: "SO NO", width: 120 },
  {
    field: "InvoiceNo",
    headerName: "INV NO",
    width: 110,
  },
  {
    field: "RCTNO",
    headerName: "RECEIPT NO",
    width: 120,
  },
  { field: "DP", headerName: "DP" },
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

const rows = [
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
];

const tablePartservice = [
  {
    field: "srNo",
    headerName: "SR.NO",
    width: 60,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params) => params.api.getSortedRowIds().indexOf(params.id) + 1,
  },
  { field: "OrderNo", headerName: "SO NO", width: 120 },
  {
    field: "InvoiceNo",
    headerName: "INV NO",
    width: 110,
  },
  {
    field: "RCTNO",
    headerName: "RECEIPT NO",
    width: 120,
  },
  { field: "DP", headerName: "DP" },
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

const rows1 = [
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
];

export default function DailyCollection() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const triggeredPages = useRef(new Set());
  const [partsTableData, setPartsTableData] = useState([]);
  const [serviceTableData, setServiceTableData] = useState([]);
  const [totalsTableData, setTotalsTableData] = useState([]);
  const [partsTableDataTotal, setPartsTableDataTotal] = useState("0.00"); // for footer
  const [ServiceTableDataTotal, setServiceTableDataTotal] = useState("0.00"); // for footer
  const [selectedDate, setSelectedDate] = useState(new Date());

  const Totalcolumns = [
    { field: "label", headerName: "PAYMENT METHOD", width: 280 },
    {
      field: "Amount",
      headerName: "AMOUNT",
      width: 280,
      headerAlign: "right",
      align: "right",
    },
  ];

  const transformTotalsData = (totals) => {
    return [
      { label: "CASH", value: totals.CashTotal },
      { label: "KNET", value: totals.KNetTotal },
      { label: "BANK", value: totals.BankTotal },
      { label: "MY FATOORAH", value: totals.MFTotal },
      { label: "TABBY", value: totals.TabbyTotal },
      { label: "TAMARA", value: totals.TamaraTotal },
      { label: "TALY", value: totals.TalyTotal },
      { label: "TOTAL", value: totals.ColletionTotal, bold: true },
    ];
  };

  const getAllCashCollectionList = useCallback(async (date) => {
    setLoading(true);
    try {
      const formattedDate = dayjs(date || new Date()).format("YYYY-MM-DD");
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  return (
    <>
      <Grid
        container
        xs={12}
        md={12}
        sx={{ border: "1px silver solid" }}
        height="calc(100% - 90px)"
        overflow={"scroll"}
        style={{ overflowY: "hidden" }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{
            display: {},
            position: "absolute",
            right: "10px",
          }}
        >
          <RefreshIcon />
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
            sx={{ borderBottom: "1px solid #ccc" }}
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
                paddingRight={5}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <InputDatePickerFields
                    label="DATE"
                    value={dayjs(undefined)}
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
            height={`calc(100%-100px)`}
            position={"sticky"}
          >
            <Paper elevation={5} sx={{ borderRadius: 2, marginBottom: 2 }}>
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
                  onClick={handleClick}
                >
                  EXPORT
                </Button>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleClose}>Download as CSV</MenuItem>
                  <MenuItem onClick={handleClose}>Print</MenuItem>
                </Menu>
              </Grid>

              <Grid
                item
                lg={12}
                p={2}
                width={"100%"}
                maxHeight={400}
                minHeight={150}
                overflow={"scroll"}
                sx={{ overflow: "hidden" }}
              >
                <DataGrid
                  columns={tablePartsales}
                  rows={partsTableData}
                  getRowId={(row) => row.RCTNO}
                  columnHeaderHeight={35}
                  hideFooter
                  rowHeight={45}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: rows.length,
                      },
                    },
                  }}
                  autoHeight="false"
                  sx={gridSx}
                />
              </Grid>
            </Paper>

            <Paper elevation={5} sx={{ borderRadius: 2, marginBottom: 2 }}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid #ccc"
              >
                <Typography fontSize="15px" color="gray" p={3}>
                  <b>COLLECTION [SERVICE]</b>
                </Typography>

                <Button
                  sx={{ fontSize: "13px", marginRight: 3 }}
                  variant="outlined"
                  startIcon={<SaveAltOutlinedIcon />}
                  onClick={handleClick}
                >
                  EXPORT
                </Button>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem onClick={handleClose}>Download as CSV</MenuItem>
                  <MenuItem onClick={handleClose}>Print</MenuItem>
                </Menu>
              </Grid>

              <Grid
                item
                lg={12}
                p={2}
                width={"100%"}
                maxHeight={400}
                minHeight={150}
                overflow={"scroll"}
                sx={{ overflow: "hidden" }}
              >
                <DataGrid
                  columns={tablePartservice}
                  rows={rows1}
                  columnHeaderHeight={35}
                  hideFooter
                  rowHeight={45}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: rows1.length,
                      },
                    },
                  }}
                  autoHeight="false"
                  sx={gridSx}
                />
              </Grid>
            </Paper>

            <Grid container item justifyContent="flex-end" my={3}>
              <Paper
                elevation={5}
                sx={{ borderRadius: 2, width: "100%", maxWidth: "600px" }}
              >
                <Grid
                  item
                  lg={12}
                  p={2}
                  width={"100%"}
                  maxHeight={400}
                  minHeight={150}
                  overflow={"scroll"}
                  sx={{ overflow: "hidden" }}
                >
                  <DataGrid
                    columns={Totalcolumns}
                    rows={rows1}
                    columnHeaderHeight={35}
                    hideFooter
                    rowHeight={45}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: rows1.length,
                        },
                      },
                    }}
                    autoHeight="false"
                    sx={gridSx}
                  />
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
