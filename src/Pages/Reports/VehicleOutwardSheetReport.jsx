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
  Tooltip,
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
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";

export default function VehicleOutwardSheetReport() {
  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const [loading, setLoading] = useState(false);
  const [VehicleTableData, setVehicleTableData] = useState([]);
  const { control, setValue, getValues } = useForm({
    defaultValues: {
      fromDate: new Date(),
      toDate: new Date(),
    },
  });

  const VehicleTableColumns = [
    {
      field: "OutDocDate",
      headerName: "OUTWARD",
      width: 240,
      renderCell: (params) => {
        if (params.row.isHeader) {
          return (
            <Box display="flex" flexDirection="column" lineHeight={1.3}>
              <span>{dayjs(params.row.DocDate).format("YYYY-MM-DD")}</span>
              <span>TOTAL APPOINTMENT: {params.row.Total}</span>
            </Box>
          );
        }
        return params.row.DocNum;
      },
    },
    {
      field: "DocDate",
      headerName: "TIME",
      width: 100,
      sortable: false,
      renderCell: (params) =>
        params.row.isHeader ? "" : dayjs(params.row.DocDate).format("HH:mm"),
    },
    {
      field: "CardName",
      headerName: "CUSTOMER",
      width: 100,
      flex: 1,
      renderCell: (params) =>
        params.row.isHeader ? null : (
          <Tooltip title={params.row.CardName || ""} arrow>
            <span>{params.row.CardName}</span>
          </Tooltip>
        ),
    },
    {
      field: "PhoneNumber1",
      headerName: "PHONE",
      width: 150,
      sortable: false,
      renderCell: (params) =>
        params.row.isHeader ? "" : params.row.PhoneNumber1,
    },
    {
      field: "JobWorkDetails",
      headerName: "JOB DESCRIPTION",
      width: 100,
      flex: 1,
      renderCell: (params) =>
        params.row.isHeader ? null : (
          <Tooltip title={params.row.JobWorkDetails || ""} arrow>
            <span
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                maxWidth: "380px",
                lineHeight: 1.5,
              }}
            >
              {params.row.JobWorkDetails}
            </span>
          </Tooltip>
        ),
    },
    {
      field: "RegistrationNo",
      headerName: "REGISTRATION NO",
      width: 180,
      sortable: false,
      renderCell: (params) =>
        params.row.isHeader ? "" : params.row.RegistrationNo,
    },
    {
      field: "JobCardNo",
      headerName: "JOBCARD NO",
      width: 150,
      sortable: false,
      renderCell: (params) => (params.row.isHeader ? "" : params.row.JobCardNo),
    },
    {
      field: "InvoiceNo",
      headerName: "INVOICE NO",
      width: 150,
      sortable: false,
      renderCell: (params) => (params.row.isHeader ? "" : params.row.InvoiceNo),
    },
  ];

  const getVehicleOutwardList = async () => {
    setLoading(true);
    try {
      const from = dayjs(getValues("fromDate")).format("YYYY-MM-DD");
      const to = dayjs(getValues("toDate")).format("YYYY-MM-DD");

      const res = await apiClient.get(
        `/Reports/OutwardSheet/${from}/${to}`,
      );

      const values = res.data.values || [];

      const tableData = values.flatMap((item) => {
        const headerRow = {
          isHeader: true,
          DocDate: item.DocDate,
          Total: item.Total,
        };

        const childRows = (item.oLines || []).map((line) => ({
          ...line,
          isHeader: false,
        }));

        return [headerRow, ...childRows];
      });

      setVehicleTableData(tableData);
    } catch (err) {
      console.error("Error fetching salesman sales report:", err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    getVehicleOutwardList();
  }, []);
  /* eslint-disable react-hooks/exhaustive-deps */

  const ClearForm = () => {
    const today = new Date();
    setValue("fromDate", today);
    setValue("toDate", today);
    getVehicleOutwardList();
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
          height={`calc(100vh-100px)`}
          position={"relative"}
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
            Vehicle Outward Sheet
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
                paddingRight={2}
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
                  onClick={getVehicleOutwardList}
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
                height: 650,
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
                    columns={VehicleTableColumns}
                    rows={VehicleTableData}
                    loading={loading}
                    getRowId={(row) =>
                      row.isHeader ? `header-${Math.random()}` : Math.random()
                    }
                    getRowClassName={(params) =>
                      params.row.isHeader ? "appointment-header-row" : ""
                    }
                    columnHeaderHeight={35}
                    rowHeight={48}
                    autoHeight={false}
                    sx={{
                      ...gridSx,
                      "& .appointment-header-row": {
                        backgroundColor: "#e0e0e0",
                        fontWeight: 600,
                        fontSize: 10,
                      },
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
