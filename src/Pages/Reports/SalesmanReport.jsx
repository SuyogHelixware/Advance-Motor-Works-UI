import { BarChart } from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React from "react";
import { Bar, CartesianGrid, LabelList, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { InputDatePickerFields } from "../Components/formComponents";
import RefreshIcon from "@mui/icons-material/Refresh";



// const columns = [
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
//     width: 100,
//   },
//   {
//     field: "PAYMethod",
//     headerName: "METHOD",
//     width: 120,
//   },
//   {
//     field: "partsAmt",
//     headerName: "PARTS AMT",
//     width: 120,
//   },
// ];

// const rows = [
//   { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
//   { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
//   { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
//   { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
//   { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
// ];

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

export default function SalesmanReport() {
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

        <Grid item xs={12} md={12} height={`calc(100vh-100px)`}>
        <Typography
            alignContent={"center"}
            sx={{
              // bgcolor: "gainsboro",
              width: "100%",
              height: "40px",
              textAlign: "center",
              borderBottom: '1px solid silver'
            }}
          >

            {/* <PageSubTitle title="Daily Inward Sheet" /> */}
            Salesman Sales Report
          </Typography>
          <Grid
            container
            item
            xs={12} md={12}
            justifyContent={"center"}
            py={2}
            columnGap={2}
            rowGap={2}
            sx={{}}
          > 
           {/* <Box
              width={'100%'}
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              > */}

            <Grid item  width={'100%'} display={'flex'} flexDirection={'row'} justifyContent={'space-evenly'} alignContent={'center'} alignItems={'center'}>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <InputDatePickerFields
                label="FROM DATE"
                // defaultValue={dayjs(undefined).format('YYYY-DD-MM')}
                value={dayjs(undefined)}              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <InputDatePickerFields
                label="TO DATE"
                // defaultValue={dayjs(undefined).format('YYYY-DD-MM')}
                value={dayjs(undefined)}              />
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
                ml: 3
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

            <Grid container item width="100%" p={2} pt={0} my={2}
              minHeight={"200px"}
              maxHeight={"300px"}
              overflow={"scroll"}
              style={{ overflowX: "hidden" }}
            >
              <TableContainer component={Paper}>
                <Table
                  className="table-row"
                  sx={{ minWidth: 200 }}
                  aria-label="simple table"
                  size="small"
                >
                  <TableHead>
                    <TableRow style={{ width: "100%" , background: 'silver' }}>
                      <TableCell
                        className="rowHeight"
                        style={{ width: "10%", textAlign: "center" }}
                      >
                        SN
                      </TableCell>
                      <TableCell className="rowHeight" style={{ width: "80%" }}>
                        SALESMAN
                      </TableCell>
                      <TableCell
                        className="rowHeight"
                        style={{ width: "10%", textAlign: "right" }}
                      >
                        ACTUAL SALES
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* {this.state.SalesmanSalesList[0].SalesmanSales.filter(
                      (Sales) => parseFloat(Sales.ActualSales) > 0
                    ).map((sales, index) => ( */}
                      <TableRow>
                        <TableCell
                          className="rowHeight"
                          sx={{ textAlign: "center" }}
                        >
                          {/* {index + 1} */}
                        </TableCell>
                        <TableCell className="rowHeight">
                          {/* {sales.Salesman} */}
                        </TableCell>
                        <TableCell
                          className="rowHeight"
                          sx={{ textAlign: "right" }}
                        >  
                          {/* {Number(sales.ActualSales).toFixed(2)} */}
                          {/* {parseFloat(sales.ActualSales)
                            .toFixed(3)
                            .replace(/\d(?=(\d{3})+\.)/g, "$&,")} */}
                        </TableCell>
                      </TableRow>
                    {/* ))} */}
                    <TableRow style={{ height: "40px" }}>
                      <TableCell></TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        <b>Total</b>
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", fontSize: 13 }}>
                        <b>
                          {/* {Number(
                            this.state.SalesmanSalesList[0].TotalSale
                          ).toFixed(2)} */}
                          {/* {parseFloat(this.state.SalesmanSalesList[0].TotalSale)
                            .toFixed(3)
                            .replace(/\d(?=(\d{3})+\.)/g, "$&,")} */}
                        0.000
                        </b>
                      </TableCell>
                    </TableRow>
                  </TableBody>

                </Table>
              </TableContainer>

            </Grid>

            <Grid container item width={"100%"}>
              <Grid item width={"65%"} p={2} height={300}>
                <Paper sx={{ height: "100%", width: "100%", pt: 2, pr: 2 }}>
                  <ResponsiveContainer>
                    <BarChart
                      width={500}
                      height={300}
                      // data={this.state.SalesmanSalesList[0].SalesmanSales.filter(
                      //   (Sales) => parseFloat(Sales.ActualSales) > 0
                      // )}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Salesman" fontSize={"10px"} />
                      <YAxis
                        fontSize={"10px"}
                        tickCount={10}
                        domain={[0, (dataMax) => Math.round(dataMax + 5000)]}
                      />
                      <Tooltip />
                      <Legend
                        // payload={salesmanNames.map((name, index) => ({
                        //   value: name,
                        //   type: "square",
                        //   id: name,
                        //   color:
                        //     this.predefinedColors[
                        //       index % this.predefinedColors.length
                        //     ],
                        // }))}
                        iconSize={9}
                        wrapperStyle={{ fontSize: 9 }}
                      />
                      <Bar
                        dataKey="ActualSales"
                        name="Salesman"
                        minPointSize={5}
                      >
                        <LabelList
                          dataKey="ActualSales"
                          fontSize={"10px"}
                          position="top"
                        />
                        {/* {this.predefinedColors.map((color, index) => (
                          <Cell key={index} fill={color} />
                        ))} */}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid container item width={"35%"} p={2} height={275}>
                <Typography width={"100%"} justifyContent={"center"}>
                  <b>Target VS Actual Sales</b>
                </Typography>
                <Paper sx={{ height: "100%", width: "100%", pt: 2, pr: 2 }}>
                  <ResponsiveContainer>
                    <BarChart
                      width={500}
                      height={300}
                      // data={this.state.SalesmanSalesList[1].TargetVsActual}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="TargetSale" fontSize={"10px"} />
                      <YAxis
                        fontSize={"10px"}
                        tickCount={10}
                        // domain={[0, (dataMax) => dataMax + 5000]}
                      />
                      <Tooltip />
                      <Legend iconSize={9} wrapperStyle={{ fontSize: 9 }} />
                      <Bar dataKey="ActualSale" fill="#8884d8" minPointSize={5}>
                        <LabelList
                          dataKey="ActualSale"
                          fontSize={"10px"}
                          position="top"
                        />
                      </Bar>
                      <Bar dataKey="TargetSale" fill="#82ca9d" minPointSize={5}>
                        <LabelList
                          dataKey="TargetSale"
                          fontSize={"10px"}
                          position="top"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* </Box> */}
          </Grid>

                     
        </Grid>
      </Grid>
    </>
  );
}
