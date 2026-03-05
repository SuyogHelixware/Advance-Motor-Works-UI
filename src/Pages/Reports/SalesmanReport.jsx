import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
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
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BeatLoader } from "react-spinners";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";

export default function SalesmanReport() {
  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const [loading, setLoading] = useState(false);
  const [salesmanTableData, setSalesmanTableData] = useState([]);
  const [partsTableDataTotal, setPartsTableDataTotal] = useState("0.00");

  const [salesmanChartData, setSalesmanChartData] = useState([]);
  const [targetChartData, setTargetChartData] = useState([]);
  const [targetChartMax, setTargetChartMax] = useState(0);
  const primary = "#8884D8";
  const secondary = "#82CA9D";

  const { control, setValue, getValues } = useForm({
    defaultValues: {
      fromDate: new Date(),
      toDate: new Date(),
    },
  });

  const predefinedColors = [
    "#217991",
    "#a86932",
    "#06470a",
    "#8a0f17",
    "#66095b",
    "#d9c01e",
    "#199e97",
    "#b0cc64",
  ];

  const salesmanColumns = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) =>
        params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    {
      field: "Salesman",
      headerName: "SALES MAN",
      flex: 1,
    },
    {
      field: "ActualSales",
      headerName: "ACTUAL SALES",
      width: 200,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <span style={{ display: "block", textAlign: "right", width: "100%" }}>
          {params.row.ActualSales}
        </span>
      ),
      cellClassName: "actual-sales-cell",
    },
  ];

  const getSalesmanSalesReport = async () => {
    setLoading(true);
    try {
      const from = dayjs(getValues("fromDate")).format("YYYY-MM-DD");
      const to = dayjs(getValues("toDate")).format("YYYY-MM-DD");

      const res = await apiClient.get(`/Reports/SalesmanSales/${from}/${to}`);
      const values = res.data.values || [];

      // Extract SalesmanSales array safely
      const salesmanData = values[0]?.SalesmanSales || [];
      const targetData = values[1]?.TargetVsActual?.[0] || {};

      // Map table data
      const mappedData = salesmanData.map((item) => ({
        Salesman: item.Salesman || "",
        ActualSales: parseFloat(item.ActualSales || 0).toFixed(3),
      }));

      // Total sales
      const total =
        parseFloat(values[0]?.TotalSale) ||
        mappedData.reduce((acc, item) => acc + item.ActualSales, 0);

      const data = mappedData.filter((item) => Number(item.ActualSales) !== 0);
      setSalesmanTableData(data);
      setPartsTableDataTotal(total);

      // Prepare charts
      setSalesmanChartData([
        ["Salesman", "Actual Sales", { role: "style" }],
        ...mappedData.map((item, index) => [
          item.Salesman,
          item.ActualSales,
          index % 2 === 0 ? primary : secondary,
        ]),
      ]);

      const actualSale = parseFloat(targetData?.ActualSale || 0);
      const targetSale = parseFloat(targetData?.TargetSale || 0);

      const maxValue = Math.max(actualSale, targetSale);
      const step = Math.ceil(maxValue / 4 / 100000) * 100000;
      const viewMax = step * 4;

      setTargetChartData([
        {
          name: "Sales Comparison",
          ActualSale: parseFloat(targetData?.ActualSale || 0),
          TargetSale: parseFloat(targetData?.TargetSale || 0),
        },
      ]);

      setTargetChartMax(viewMax);
    } catch (err) {
      console.error("Error fetching salesman sales report:", err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    getSalesmanSalesReport();
  }, []);
  /* eslint-disable react-hooks/exhaustive-deps */

  const ClearForm = () => {
    const today = new Date();
    setValue("fromDate", today);
    setValue("toDate", today);
    getSalesmanSalesReport();
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
            Salesman Sales Report
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
                    name="fromDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="FROM DATE"
                        value={field.value ? dayjs(field.value) : null}
                        format="DD-MMM-YYYY"
                        onChange={(date) => {
                          field.onChange(date);
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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="toDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="TO DATE"
                        value={field.value ? dayjs(field.value) : null}
                        format="DD-MMM-YYYY"
                        onChange={(date) => {
                          field.onChange(date);
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
                  color="success"
                  sx={{
                    height: "40px",
                    alignItems: "center",
                    alignContent: "center",
                    alignSelf: "center",
                    ml: 1,
                    width: 100,
                  }}
                  onClick={getSalesmanSalesReport}
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
                    marginLeft: 2,
                    width: 100,
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
            flex={1}
            overflow="auto"
            sx={{ height: "calc(100vh - 230px)" }}
          >
            <Paper
              elevation={5}
              sx={{
                borderRadius: 2,
                marginBottom: 2,
                m: 2,
                display: "flex",
                flexDirection: "column",
                height: 400,
              }}
            >
              <Button
                sx={{
                  fontSize: "13px",
                  margin: 2,
                  marginBottom: 1,
                  width: 120,
                }}
                variant="outlined"
                startIcon={<SaveAltOutlinedIcon />}
                // onClick={exportData}
              >
                EXPORT
              </Button>

              <Box flex={1} overflow="auto" px={2} py={1}>
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
                    columns={salesmanColumns}
                    rows={salesmanTableData}
                    loading={loading}
                    getRowId={(row) => row.ActualSales}
                    columnHeaderHeight={35}
                    hideFooter
                    rowHeight={45}
                    autoHeight={false}
                    sx={gridSx}
                  />
                )}
              </Box>

              <Box p={1} mr={1} textAlign="right">
                <Typography fontWeight="bold" fontSize={15}>
                  Total : &nbsp;
                  {Number(partsTableDataTotal || 0).toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Paper>

            <Grid container width={"100%"} spacing={2} pl={2}>
              <Grid container item lg={8} height={405}>
                <Paper
                  elevation={5}
                  sx={{
                    height: "100%",
                    width: "100%",
                    borderRadius: 2,
                    marginBottom: 2,
                  }}
                >
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottom="1px solid #ccc"
                  >
                    <Typography fontSize="15px" color="gray" p={2}>
                      <b>SALESMAN SALES</b>
                    </Typography>
                  </Grid>

                  {salesmanChartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={330}>
                      <BarChart
                        data={salesmanChartData
                          .slice(1)
                          .filter((row) => parseFloat(row[1]) > 0)
                          .map((row) => ({
                            Salesman: row[0],
                            ActualSales: parseFloat(row[1]),
                          }))}
                        margin={{ top: 20, right: 30, left: 0, bottom: 55 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="Salesman"
                          fontSize={10}
                          className="x-axis-custom"
                        />
                        <YAxis
                          fontSize={10}
                          tickCount={10}
                          domain={[0, (dataMax) => Math.round(dataMax + 5000)]}
                          className="y-axis-custom"
                        />
                        <Tooltip />

                        <Legend content={() => null} />

                        <g transform="translate(0,220)">
                          <foreignObject x="0" y="0" width="100%" height="100">
                            <div
                              xmlns="http://www.w3.org/1999/xhtml"
                              className="custom-legend"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "8px",
                                fontSize: "11px",
                                marginTop: "60px",
                                paddingBottom: "8px",
                              }}
                            >
                              {salesmanChartData.slice(1).map((row, index) => {
                                const color =
                                  predefinedColors[
                                    index % predefinedColors.length
                                  ];
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 10,
                                        height: 10,
                                        backgroundColor: color,
                                        borderRadius: 2,
                                      }}
                                    ></div>
                                    <span className="legend-text">
                                      {row[0]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </foreignObject>
                        </g>

                        <Bar dataKey="ActualSales" minPointSize={5}>
                          <LabelList
                            dataKey="ActualSales"
                            fontSize={10}
                            position="top"
                          />
                          {salesmanChartData.slice(1).map((_, index) => (
                            <Cell
                              key={index}
                              fill={
                                predefinedColors[
                                  index % predefinedColors.length
                                ]
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                      }}
                    >
                      <Typography>No data available</Typography>
                    </div>
                  )}
                </Paper>
              </Grid>
              <Grid container item lg={4} height={405}>
                <Paper
                  elevation={5}
                  sx={{
                    height: "100%",
                    width: "100%",
                    borderRadius: 2,
                    marginBottom: 2,
                  }}
                >
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottom="1px solid #ccc"
                  >
                    <Typography fontSize="15px" color="gray" p={2}>
                      <b>TARGET VS ACTUAL SALES</b>
                    </Typography>
                  </Grid>

                  {targetChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={330}>
                      <BarChart
                        data={targetChartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          fontSize={10}
                          className="x-axis-custom"
                        />
                        <YAxis
                          fontSize={10}
                          tickCount={10}
                          domain={[0, targetChartMax || "auto"]}
                          className="y-axis-custom"
                        />
                        <Tooltip />
                        <Legend
                          iconSize={10}
                          wrapperStyle={{ fontSize: 12, bottom: 0 }}
                        />
                        <Bar dataKey="ActualSale" fill="#8884D8">
                          <LabelList
                            dataKey="ActualSale"
                            fontSize={10}
                            position="top"
                          />
                        </Bar>
                        <Bar dataKey="TargetSale" fill="#82CA9D">
                          <LabelList
                            dataKey="TargetSale"
                            fontSize={10}
                            position="top"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                      }}
                    >
                      <Typography>No data available</Typography>
                    </div>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
