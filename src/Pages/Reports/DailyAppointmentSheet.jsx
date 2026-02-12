import PrintIcon from "@mui/icons-material/Print";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { InputDatePickerFields } from "../Components/formComponents";
import RefreshIcon from "@mui/icons-material/Refresh";

const columns = [
  { field: "OrderNo", headerName: "SORDER", width: 120, sortable: false },
  {
    field: "InvoiceNo",
    headerName: "INVOICE",
    width: 100,
    sortable: false,
  },
  {
    field: "RCTNO",
    headerName: "RECEIPT",
    width: 100,
    sortable: false,
  },
  { field: "DP", headerName: "DP", width: 100, sortable: false },
  {
    field: "CardName",
    headerName: "CUSTOMER",
    width: 120,
    flex: 1,
    sortable: false,
  },
  {
    field: "PhoneNumber1",
    headerName: "PHONE",
    width: 100,
    sortable: false,
  },
  {
    field: "PAYMethod",
    headerName: "METHOD",
    width: 120,
    sortable: false,
  },
  {
    field: "partsAmt",
    headerName: "PARTS AMT",
    width: 120,
    sortable: false,
  },
];

const rows = [
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
];

// const columns1 = [
//   { field: "OrderNo", headerName: "SORDER", width: 120 },
//   {
//     field: "InvoiceNo",
//     headerName: "INVOICE",
//     width: 100,
//   },
//   {
//     field: "RCTNO",
//     headerName: "RECEIPT",
//     width: 100,
//   },
//   { field: "DP", headerName: "DP", width: 100 },
//   {
//     field: "CardName",
//     headerName: "CUSTOMER",
//     width: 120,
//   },
//   {
//     field: "PhoneNumber1",
//     headerName: "PHONE",
//     width: 120,
//   },
//   {
//     field: "PAYMethod",
//     headerName: "METHOD",
//     width: 100,
//   },
//   {
//     field: "serviceamt",
//     headerName: "SERVICE AMT",
//     width: 120,
//   },
// ];

// const rows1 = [
//   { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
//   { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
// ];

export default function DailyAppointmentSheet() {
  
  return (
    <>
      <Grid
        container
        xs={12}
        md={12}
        sx={{ border: "1px silver solid" }}
        height="calc(100vh - 90px)"
      >
        {/* <Grid item xs={12} md={12} height={"40px"}>
          

        </Grid> */}

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
          height={`calc(100vh-100px)`}
          position={"relative"}
        >
          <Typography
            alignContent={"center"}
            sx={{
              // bgcolor: "gainsboro",
              width: "100%",
              height: "40px",
              textAlign: "center",
              borderBottom: "1px solid silver",
            }}
          >
            {/* <PageSubTitle title="Daily Inward Sheet" /> */}
            Daily Appointment Sheet
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
            sx={{}}
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
                justifyContent={"space-evenly"}
                alignContent={"center"}
                alignItems={"center"}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <InputDatePickerFields
                    label="FROM DATE"
                    // defaultValue={dayjs(undefined).format('YYYY-DD-MM')}
                    value={dayjs(undefined)}
                  />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <InputDatePickerFields
                    label="TO DATE"
                    // defaultValue={dayjs(undefined).format('YYYY-DD-MM')}
                    value={dayjs(undefined)}
                  />
                </LocalizationProvider>

                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  sx={{
                    height: "40px",
                    alignItems: "center",
                    alignContent: "center",
                    alignSelf: "center",
                    ml: 3,
                  }}
                  startIcon={<SearchOutlinedIcon />}
                >
                  SEARCH
                </Button>

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

              <Grid
                container
                item
                width={"100%"}
                p={2}
                pt={0}
                my={2}
                minHeight={"300px"}
                maxHeight={"690px"}
                overflow={"scroll"}
                component={Paper}
                style={{
                  overflowX: "hidden",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <Box
                  sx={{
                    height: 600, // Adjust this height as needed
                    width: "100%",
                    "& .MuiDataGrid-root": {
                      border: "none",
                      overflowX: "scroll",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      position: "sticky",
                      top: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    },
                    "& .MuiDataGrid-virtualScroller": {
                      overflowY: "auto",
                    },
                    "& .MuiDataGrid-footer": {
                      display: "none",
                    },
                  }}
                >
                  <DataGrid
                    columns={columns}
                    rows={rows}
                    columnHeaderHeight={35}
                    rowHeight={45}
                    pagination={false}
                    hideFooter
                    disableColumnMenu
                  />
                </Box>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
