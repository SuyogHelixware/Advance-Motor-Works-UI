import AddIcon from "@mui/icons-material/Add";
import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Tooltip,
  Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";

export default function OpenSoBySalesman() {
  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const [salesEmpList, setSalesEmpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSoSalesmanList, setopenSoSalesmanList] = useState([]);
  const [personName, setPersonName] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);

  const empPageRef = useRef(0);
  const empHasMoreRef = useRef(true);
  const empLoadingRef = useRef(false);
  const empSearchRef = useRef("");

  const initial = {
    DocEntry: 0,
    SlpCode: { label: "ALL", value: "ALL" },
    UserId: "",
    CreatedBy: "",
    Status: true,
    toDate: new Date(),
    fromDate: new Date(),
  };

  const { control, setValue, getValues } = useForm({
    defaultValues: initial,
  });

  const navigate = useNavigate();

  const SOColumns = [
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
    {
      field: "OrderNo",
      headerName: "SO NO",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <span
          title={params.row.OrderNo}
          style={{
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => {
            navigate(
              `${process.env.PUBLIC_URL}/dashboard/Sales/quotation`,
              {
                replace: true,
              },
            );
          }}
        >
          {params.row.OrderNo.toUpperCase()}
        </span>
      ),
    },
    {
      field: "DocDate",
      headerName: "SO DATE",
      width: 100,
      renderCell: (params) => (
        <span>
          {params.row.DocDate
            ? dayjs(params.row.DocDate).format("YYYY-MM-DD")
            : ""}
        </span>
      ),
    },
    {
      field: "CardName",
      headerName: "CUSTOMER NAME",
      width: 150,
      renderCell: (params) => (
        <Tooltip title={params.row.CardName || ""}>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
            }}
          >
            {params.row.CardName}
          </span>
        </Tooltip>
      ),
    },
    {
      field: "PhoneNumber1",
      headerName: "CONTACT",
      width: 150,
    },
    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 100,
    },
    {
      field: "ItemName",
      headerName: "DESCRIPTION",
      width: 100,
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={params.row.ItemName || ""}>
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
            {params.row.ItemName}
          </span>
        </Tooltip>
      ),
    },
    {
      field: "Quantity",
      headerName: "QTY",
      width: 100,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "LineStatus",
      headerName: "LINE STATUS",
      width: 100,
    },
    {
      field: "OnHand",
      headerName: "ON HAND",
      width: 100,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "FTSQty",
      headerName: "FTS",
      width: 100,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "STKAval",
      headerName: "STK AVL",
      width: 100,
    },
    {
      field: "DPPaid",
      headerName: "DP PAID",
      width: 100,
    },
    {
      field: "HWReason",
      headerName: "SO OPEN REASON",
      width: 100,
    },
  ];

  const getAllSaleEmp = useCallback(async (append = false) => {
    if (empLoadingRef.current || (!empHasMoreRef.current && append)) return;

    if (!append) {
      empPageRef.current = 0;
      empHasMoreRef.current = true;
    }

    empLoadingRef.current = true;
    setEmpLoading(true);
    const nextPage = append ? empPageRef.current + 1 : 0;

    try {
      const params = { Status: 1, Page: nextPage };
      if (empSearchRef.current) params.SearchText = empSearchRef.current;

      const res = await apiClient.get(`/Users`, { params });

      if (res.data.success) {
        const newData = res.data.values || [];
        setSalesEmpList((prev) => {
          const updatedList = append ? [...prev, ...newData] : newData;

          setPersonName((prevSelected) => {
            if (prevSelected.includes("ALL")) {
              return ["ALL", ...updatedList.map((emp) => emp.DocEntry)];
            }
            return prevSelected;
          });

          return updatedList;
        });

        empHasMoreRef.current = newData.length === 20;
        empPageRef.current = nextPage;
      }
    } catch (err) {
      console.error(err);
    } finally {
      empLoadingRef.current = false;
      setEmpLoading(false);
    }
  }, []);

  const getOpenSOSalesman = async (userIds = personName) => {
    setLoading(true);
    try {
      const from = dayjs(getValues("fromDate")).format("YYYY-MM-DD");
      const to = dayjs(getValues("toDate")).format("YYYY-MM-DD");

      let userIdsParam = "";

      if (userIds.includes("ALL") || userIds.length === 0) {
        userIdsParam = "UserIds=ALL";
      } else {
        userIdsParam = userIds
          .filter((id) => id !== "ALL")
          .map((val) => `UserIds=${val}`)
          .join("&");
      }

      const res = await apiClient.get(
        `/Reports/OpenSOBySalesman/${from}/${to}?${userIdsParam}`,
      );
      const values = res.data?.values || [];
      setopenSoSalesmanList(values);
    } catch (err) {
      console.error("Error fetching salesman sales report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    let selectedValues = typeof value === "string" ? value.split(",") : value;

    const isCurrentlyAll = personName.includes("ALL");
    const clickedAll = selectedValues.includes("ALL");

    if (!isCurrentlyAll && clickedAll) {
      setPersonName(["ALL", ...salesEmpList.map((emp) => emp.DocEntry)]);
    } else if (isCurrentlyAll && !clickedAll) {
      setPersonName([]);
    } else if (
      isCurrentlyAll &&
      clickedAll &&
      selectedValues.length <= salesEmpList.length
    ) {
      setPersonName(selectedValues.filter((v) => v !== "ALL"));
    } else if (
      !isCurrentlyAll &&
      !clickedAll &&
      selectedValues.length === salesEmpList.length &&
      salesEmpList.length > 0
    ) {
      setPersonName(["ALL", ...selectedValues]);
    } else {
      setPersonName(selectedValues);
    }
  };

  const handleScroll = (event) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
      listboxNode.scrollHeight - 5
    ) {
      getAllSaleEmp(true);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    getAllSaleEmp();
    getOpenSOSalesman([]);
  }, []);
  /* eslint-disable react-hooks/exhaustive-deps */

  const ClearForm = () => {
    const today = new Date();
    setValue("fromDate", today);
    setValue("toDate", today);
    getOpenSOSalesman([]);
    setPersonName([]);
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
            Open SO By Salesman
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
                <FormControl sx={{ width: 200 }}>
                  <Select
                    className="emp-select"
                    labelId="SlpCode"
                    id="SlpCode"
                    placeholder="SELECT EMP"
                    multiple
                    displayEmpty
                    required
                    value={personName}
                    onChange={handleChange}
                    input={<OutlinedInput />}
                    renderValue={(selected) => {
                      if (!selected || selected.length === 0) {
                        return (
                          <span style={{ color: "#9aa0a6", fontSize: 14 }}>
                            ALL
                          </span>
                        );
                      }

                      if (selected.includes("ALL")) return "ALL";

                      return salesEmpList
                        .filter((emp) => selected.includes(emp.DocEntry))
                        .map((emp) => emp.UserName)
                        .join(", ");
                    }}
                    sx={{
                      height: 42,
                      borderRadius: "6px",
                    }}
                    MenuProps={{
                      PaperProps: {
                        onScroll: handleScroll,
                        sx: {
                          maxHeight: 48 * 4.5 + 8,
                          width: 200,
                        },
                      },
                      MenuListProps: {
                        sx: {
                          "& .MuiMenuItem-root": {
                            fontFamily: '"Montserrat", sans-serif !important',
                            fontSize: "14px !important",
                          },
                          "& .MuiTypography-root": {
                            fontFamily: '"Montserrat", sans-serif !important',
                            fontSize: "14px !important",
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="ALL">
                      <Checkbox checked={personName.includes("ALL")} />
                      <ListItemText primary="ALL" />
                    </MenuItem>
                    {salesEmpList.map((emp) => (
                      <MenuItem key={emp.DocEntry} value={emp.DocEntry}>
                        <Checkbox checked={personName.includes(emp.DocEntry)} />
                        <ListItemText primary={emp.UserName} />
                      </MenuItem>
                    ))}
                    {empLoading && (
                      <MenuItem disabled>
                        <BeatLoader size={10} loading={empLoading} />
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
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
                  onClick={() => getOpenSOSalesman(personName)}
                  startIcon={<SearchOutlinedIcon />}
                >
                  SEARCH
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
                    columns={SOColumns}
                    rows={openSoSalesmanList}
                    loading={loading}
                    getRowId={(row) => Math.random()}
                    columnHeaderHeight={35}
                    rowHeight={48}
                    autoHeight={false}
                    sx={{
                      ...gridSx,
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
