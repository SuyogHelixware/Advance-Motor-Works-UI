import PrintIcon from "@mui/icons-material/Print";
import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import { Box, Button, Grid, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useState } from "react";
import { InputDatePickerFields } from "../Components/formComponents";
import RefreshIcon from "@mui/icons-material/Refresh";
 


const columns = [
  { field: "OrderNo", headerName: "INWARD NO", width: 120 },
  {
    field: "TIME",
    headerName: "INVOICE",
    width: 100,
  },
  {
    field: "RCTNO",
    headerName: "CUSTOMER",
    width: 100,
  },
  { field: "DP", headerName: "DP", width: 100 },
  {
    field: "CardName",
    headerName: "PHONE",
    width: 120,
  },
  {
    field: "PhoneNumber1",
    headerName: "JOB DESCRIPTION",
    width: 100,
    flex: 1,
  },
  {
    field: "PAYMethod",
    headerName: "REGISTRATION",
    width: 120,
  },
  {
    field: "partsAmt",
    headerName: "PARTS AMT",
    width: 120,
  },
  {
    field: "partso",
    headerName: "SO NO",
    width: 120,
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
];

export default function DailyCollection() {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Grid
        container
        xs={12}
        md={12}
        sx={{ border: "1px silver solid" }}
        height="calc(100% - 30px)"
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

        <Grid item xs={12} md={12} height={`calc(100%-100px)`}>
          <Typography
            alignContent={"center"}
            borderBottom={"1px solid silver"}
            sx={{
              // bgcolor: "gainsboro",
              width: "100%",
              height: "40px",
              textAlign: "center",
              position: "static",
            }}
          >
            {/* <PageSubTitle title="Daily Inward Sheet" /> */}
            Daily Inward Collection
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
            justifyContent={"center"}
            alignContent={"center"}
            alignItems={"center"}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <InputDatePickerFields
                label="DATE"
                value={dayjs(undefined)}
              ></InputDatePickerFields>
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

          <Grid item xs={12} md={12} mt={3} height={`calc(100%-100px)`}>
            <Grid
              item
              lg={12}
              md={12}
              xs={12}
              spacing={2}
              justifyContent={"center"}
              width={"100%"}
              overflow={"scroll"}
              sx={{ overflow: "hidden" }}
            >
              <Grid
                item
                lg={12}
                md={12}
                xs={12}
                spacing={2}
                justifyContent={"center"}
                width={"100%"}
                height={"100%"}
                overflow={"scroll"}
                sx={{ overflow: "hidden" }}
              >
                <Button
                sx={{ fontSize: "13px" }}
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
            </Grid>
          </Grid>
          
          </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
