import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import { Box, Button, Grid, IconButton, Menu, MenuItem, Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useState } from "react";





const columns = [
  {
    field: "sono",
    headerName: "SR. NO",
    width: 120,
  },
  {
    field: "date",
    headerName: "ITEM CODE",
    width: 100,
  },
  {
    field: "type",
    headerName: "DESCRIPTION",
    width: 100,
    flex: 1,
  },
  {
    field: "qty",
    headerName: "PRIMARY LOCATION (FAST MOVING)",
    width: 180,
  },
  {
    field: "mrfrsawo",
    headerName: "STOCK IN PL QTY",
    width: 100,
  },
  {
    field: "timeCbyOT",
    headerName: "QTY",
    width: 100,
  },
  {
    field: "pickLPT",
    headerName: "DESCRIPTION",
    width: 100,
    flex: 1,
  },
  {
    field: "itemIinSbyU",
    headerName: "QUOTATION",
    width: 100,
  },
  {
    field: "itemIbyU",
    headerName: "SUGGESTED REPLANISH",
    width: 100,
  },
  {
    field: "itemPhyPicby",
    headerName: "BIN LOCATION & QTY",
    width: 100,
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

export default function ReplenishmentReport() {
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
            <b>Warehouse Stock Replanishment Report</b>
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
                container
                width={"100%"}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-evenly"}
                alignContent={"center"}
                alignItems={"center"}
              >
                                
              </Grid>

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

              <Grid
                container
                item
                width={"100%"}
                p={2}
                pt={0}
                my={2}
                minHeight={"300px"}
                maxHeight={"680px"}
                // overflow={"scroll"}
                component={Paper}
                style={{
                  // overflowX: "scroll",
                  fontWeight: "700",
                  fontSize: "12px",
                }}
              >
                <Box
                  sx={{
                    height: 690, // Adjust this height as needed
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
