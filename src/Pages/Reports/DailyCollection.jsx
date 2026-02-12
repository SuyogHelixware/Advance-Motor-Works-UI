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
import React, { useState } from "react";
import { InputDatePickerFields } from "../Components/formComponents";

const columns = [
  { field: "OrderNo", headerName: "SORDER", width: 120 },
  {
    field: "InvoiceNo",
    headerName: "INVOICE",
    width: 100,
  },
  {
    field: "RCTNO",
    headerName: "RECEIPT",
    width: 100,
  },
  { field: "DP", headerName: "DP", width: 100 },
  {
    field: "CardName",
    headerName: "CUSTOMER",
    width: 120,
    flex: 1,
  },
  {
    field: "PhoneNumber1",
    headerName: "PHONE",
    width: 100,
  },
  {
    field: "PAYMethod",
    headerName: "METHOD",
    width: 120,
  },
  {
    field: "partsAmt",
    headerName: "PARTS AMT",
    width: 120,
  },
];

const rows = [
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
];

const columns1 = [
  { field: "OrderNo", headerName: "SORDER", width: 120 },
  {
    field: "InvoiceNo",
    headerName: "INVOICE",
    width: 100,
  },
  {
    field: "RCTNO",
    headerName: "RECEIPT",
    width: 100,
  },
  { field: "DP", headerName: "DP", width: 100 },
  {
    field: "CardName",
    headerName: "CUSTOMER",
    width: 120,
    flex: 1,
  },
  {
    field: "PhoneNumber1",
    headerName: "PHONE",
    width: 120,
  },
  {
    field: "PAYMethod",
    headerName: "METHOD",
    width: 100,
  },
  {
    field: "serviceamt",
    headerName: "SERVICE AMT",
    width: 120,
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
              // bgcolor: "gainsboro",
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
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={12}
            mt={3}
            height={`calc(100%-100px)`}
            position={"sticky"}
          >
            <Typography
              textAlign={"center"}
              width={"100%"}
              fontSize={"15px"}
              color={"gray"}
            >
              <b>COLLECTION [PARTS SALES]</b>
            </Typography>

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
              <DataGrid
                columns={columns}
                rows={rows}
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
              />
            </Grid>

            <Typography
              textAlign={"center"}
              width={"100%"}
              fontSize={"15px"}
              color={"gray"}
              mt={5}
            >
              <b>COLLECTION [SERVICE]</b>
            </Typography>

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
              <DataGrid
                columns={columns1}
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
              />
            </Grid>

            <Grid container item width={"100%"} pt={5} my={3}>
              <Grid container item width={"70%"}></Grid>
              <Grid
                container
                item
                alignContent={"end"}
                alignItems={"end"}
                alignSelf={"end"}
                width={"30%"}
              >
                <TableContainer>
                  <Table
                    sx={{ minWidth: 200 }}
                    aria-label="simple table"
                    size="small"
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className="rowHeight"
                          sx={{ textAlign: "left", fontSize: "13px" }}
                        >
                          CASH
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "13px" }}
                          align="right"
                          className="rowHeight"
                        >
                          0.00
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="rowHeight"
                          sx={{ textAlign: "left", fontSize: "13px" }}
                        >
                          KNET
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "13px" }}
                          align="right"
                          className="rowHeight"
                        >
                          0.00
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="rowHeight"
                          sx={{ textAlign: "left", fontSize: "13px" }}
                        >
                          BANK
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "13px" }}
                          align="right"
                          className="rowHeight"
                        >
                          0.00{" "}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="rowHeight"
                          sx={{ textAlign: "left", fontSize: "13px" }}
                        >
                          MY FATOORAH
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "13px" }}
                          align="right"
                          className="rowHeight"
                        >
                          0.00{" "}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="rowHeight"
                          sx={{ textAlign: "left", fontSize: "13px" }}
                        >
                          TABBY
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "13px" }}
                          align="right"
                          className="rowHeight"
                        >
                          0.00{" "}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="rowHeight"
                          sx={{ textAlign: "left", fontSize: "13px" }}
                        >
                          TAMARA
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "13px" }}
                          align="right"
                          className="rowHeight"
                        >
                          0.00{" "}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          className="rowHeight"
                          sx={{
                            fontWeight: "bold",
                            textAlign: "left",
                            fontSize: "13px",
                          }}
                        >
                          TOTAL
                        </TableCell>
                        <TableCell
                          align="right"
                          className="rowHeight"
                          sx={{ fontWeight: "bold", fontSize: "13px" }}
                        >
                          0.00{" "}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* <Grid container width={"100%"} spacing={2} height="calc(100vh - 110px)">
        <Grid
          container
          item
          width="100%"
          height="100%"
          xs={12}
          md={12}
          lg={12}
          component="form"
          position="relative"
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
              Daily Collection
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
              height="calc(100% - 40px)"
              // overflow={"scroll"}
              sx={{ overflowX: "scroll" }}
              position={"relative"}
            >
              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
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
                  <Grid
                    item
                    xs={12}
                    md={12}
                    mt={3}
                    height={`calc(100%-100px)`}
                    position={"sticky"}
                  >
                    <Typography
                      textAlign={"center"}
                      width={"100%"}
                      fontSize={"15px"}
                      color={"gray"}
                    >
                      <b>COLLECTION [PARTS SALES]</b>
                    </Typography>

                    <Grid
                      item
                      lg={12}
                      md={12}
                      xs={12}
                      spacing={2}
                      justifyContent={"center"}
                      width={"100%"}
                      // overflow={"scroll"}
                      sx={{ overflowX: "scroll" }}
                    >
                      <Button
                        sx={{ fontSize: "13px" }}
                        variant="outlined"
                        startIcon={<SaveAltOutlinedIcon />}
                      >
                        EXPORT
                      </Button>
                      <DataGrid
                        columns={columns}
                        rows={rows}
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
                      />
                    </Grid>

                    <Typography
                      textAlign={"center"}
                      width={"100%"}
                      fontSize={"15px"}
                      color={"gray"}
                      mt={5}
                    >
                      <b>COLLECTION [SERVICE]</b>
                    </Typography>

                    <Grid
                      item
                      lg={12}
                      md={12}
                      xs={12}
                      spacing={2}
                      justifyContent={"center"}
                      width={"100%"}
                      // overflowx={"scroll"}
                      sx={{ overflowX: "scroll" }}
                    >
                      <Button
                        sx={{ fontSize: "13px" }}
                        variant="outlined"
                        startIcon={<SaveAltOutlinedIcon />}
                      >
                        EXPORT
                      </Button>
                      <DataGrid
                        columns={columns1}
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
                      />
                    </Grid>

                    <Grid container item width={"100%"} pt={5} my={3}>
                      <Grid container item width={"70%"}></Grid>
                      <Grid
                        container
                        item
                        alignContent={"end"}
                        alignItems={"end"}
                        alignSelf={"end"}
                        width={"30%"}
                      >
                        <TableContainer>
                          <Table
                            sx={{ minWidth: 200 }}
                            aria-label="simple table"
                            size="small"
                          >
                            <TableBody>
                              <TableRow>
                                <TableCell
                                  className="rowHeight"
                                  sx={{ textAlign: "left", fontSize: "13px" }}
                                >
                                  CASH
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: "13px" }}
                                  align="right"
                                  className="rowHeight"
                                >
                                  0.00
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  className="rowHeight"
                                  sx={{ textAlign: "left", fontSize: "13px" }}
                                >
                                  KNET
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: "13px" }}
                                  align="right"
                                  className="rowHeight"
                                >
                                  0.00
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  className="rowHeight"
                                  sx={{ textAlign: "left", fontSize: "13px" }}
                                >
                                  BANK
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: "13px" }}
                                  align="right"
                                  className="rowHeight"
                                >
                                  0.00{" "}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  className="rowHeight"
                                  sx={{ textAlign: "left", fontSize: "13px" }}
                                >
                                  MY FATOORAH
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: "13px" }}
                                  align="right"
                                  className="rowHeight"
                                >
                                  0.00{" "}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  className="rowHeight"
                                  sx={{ textAlign: "left", fontSize: "13px" }}
                                >
                                  TABBY
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: "13px" }}
                                  align="right"
                                  className="rowHeight"
                                >
                                  0.00{" "}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  className="rowHeight"
                                  sx={{ textAlign: "left", fontSize: "13px" }}
                                >
                                  TAMARA
                                </TableCell>
                                <TableCell
                                  sx={{ fontSize: "13px" }}
                                  align="right"
                                  className="rowHeight"
                                >
                                  0.00{" "}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell
                                  className="rowHeight"
                                  sx={{
                                    fontWeight: "bold",
                                    textAlign: "left",
                                    fontSize: "13px",
                                  }}
                                >
                                  TOTAL
                                </TableCell>
                                <TableCell
                                  align="right"
                                  className="rowHeight"
                                  sx={{ fontWeight: "bold", fontSize: "13px" }}
                                >
                                  0.00{" "}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
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
              <Button variant="contained" color="success">
                SAVE
              </Button>

              <Button variant="contained" disabled color="error">
                DELETE
              </Button>
            </Grid>


          </Grid>
        </Grid>
      </Grid> */}
    </>
  );
}
