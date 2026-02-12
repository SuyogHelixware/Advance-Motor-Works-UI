import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import TocIcon from "@mui/icons-material/Toc";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  alpha,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Stack,
  styled,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  InputSelectTextField,
  InputTextField,
  ModelInputSelectTextField,
  ModelSelectedDatePickerField,
  SelectedDatePickerField,
  SmallInputTextField,
} from "../Components/formComponents";
import usePaginatedItems from "../../Hooks/usePaginatedItems";
import AutoCreaeSerial from "../Components/AutoCreateSerial";
import DataGriCellModelClick from "../Components/DataGridCellModelClick";
import { green } from "@mui/material/colors";

// Styled Components for Enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: "none",
  "& .MuiDataGrid-root": {
    border: "none",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  "& .selected-row": {
    backgroundColor: theme.palette.mode === "dark" ? green[900] : green[200],
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? green[800] : green[300],
    },
    "& .MuiDataGrid-cell": {
      backgroundColor: theme.palette.mode === "dark" ? green[900] : green[200],
    },
  },
}));

const ResponsiveContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  boxShadow: theme.shadows[2],
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-1px)",
  },
}));
const modelColumns = [
  // {
  //   id: 1,
  //   field: "id",
  //   headerName: "Sr/No",
  //   width: 60,
  //   editable: true,
  // },
  {
    id: 1,
    field: "ItemCode",
    headerName: "Item Code",
    width: 150,
    editable: true,
  },
  {
    id: 2,
    field: "ItemName",
    headerName: "Item Description",
    width: 150,
    editable: true,
  },
  // {
  //   field: "QTY",
  //   headerName: "QUANTITY",
  //   width: 120,
  //   editable: true,
  // },
  // {
  //   field: "Price",
  //   headerName: "Price",
  //   width: 120,
  //   editable: true,
  // },
  {
    field: "DefaultWhs",
    headerName: "WHSCODE",
    width: 120,
    editable: true,
  },
  {
    field: "OnHand",
    headerName: "IN STOCK",
    width: 100,
    sortable: false,
  },
  {
    field: "IsCommited",
    headerName: "RESERVE",
    width: 100,
    sortable: false,
  },
  {
    field: "OnOrder",
    headerName: "ORDERED",
    width: 100,
    sortable: false,
  },
];
export default function Serial() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [Itemopen, setItemOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [checkTabRows, setcheckTabRows] = useState([]);
  const [MainTopRows, setMainTopRows] = useState([]);
  const [sendDataSerial, setSendDataSerial] = useState([]);
  const [FinalDataSeries,setFinalDataSeries]=useState([])
  const [tabvalue, settabvalue] = useState(0);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleOpenCreate = () => {
    setOpenCreate(true);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleCloseCrate = () => {
    setOpenCreate(false);
  };
  const initialFormData = {
    Status: "1",
  };
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    clearErrors,
    setError,
    formState: { errors }, // ✅ Correctly using `isDirty`
  } = useForm({
    defaultValues: initialFormData,
  });
  const LIMIT = 20;
  const topColumns = [
    { field: "DocNum", headerName: "Doc. No.", flex: 1 },
    { field: "ItemCode", headerName: "Item Number", flex: 1 },
    { field: "ItemName", headerName: "Item Description", flex: 1.5 },
    { field: "DefaultWhs", headerName: "Whse Code", flex: 1 },
    { field: "Quantity", headerName: "Quantity", flex: 1 },
    { field: "created", headerName: "Total Created", flex: 1 },
  ];

  // Sample data for bottom DataGrid (Created Serial Numbers)

  const bottomColumns = [
    { field: "lotNo", headerName: "Mfr Serial No.", flex: 1 },
    { field: "serialNo", headerName: "Serial Number", flex: 1 },
    { field: "binLocation", headerName: "Bin Location", flex: 1 },
    { field: "systemNo", headerName: "System No.", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];
  const bottomRows = [
    // {
    //   id: 30,
    //   serialNo: "AB30",
    //   lotNo: "AB",
    //   binLocation: "W01-BIN1",
    //   systemNo: 1150,
    //   status: "Available",
    // },
    // {
    //   id: 31,
    //   serialNo: "AB31",
    //   lotNo: "AB",
    //   binLocation: "W01-BIN1",
    //   systemNo: 1151,
    //   status: "Available",
    // },
    // {
    //   id: 32,
    //   serialNo: "AB32",
    //   lotNo: "AB",
    //   binLocation: "W01-BIN1",
    //   systemNo: 1152,
    //   status: "Available",
    // },
  ];
  const addRow = () => {
    setcheckTabRows((prev) =>
      reindexRows([
        ...prev,
        {
          id: Date.now(),
          VehicleName: "",
          FuelType: "",
          FuelQuantity: "",
          KMReading: "",
          Remark: "",
          Fuel: "",
          LineRemarks: "",
        },
      ])
    );
  };
  const reindexRows = (rows) =>
    rows.map((row, index) => ({
      ...row,
      SrNo: index + 1,
    }));

  const handleDeleteSeriel = (id) => {
    const updateSerial = checkTabRows.filter((data) => data.id !== id);
    setcheckTabRows(updateSerial);
  };
  const modalcolumnsTab0 = [
    {
      field: "SrNo",
      headerName: "Sr No.",
      width: 100,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "FuelQuantity",
      headerName: "String",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <SmallInputTextField
          name="FuelQuantity"
          value={params.row.FuelQuantity}
          // onChange={(e) =>
          //   handleCellChange(params.row.id, "FuelQuantity", e.target.value)
          // }
        />
      ),
    },
    {
      field: "KMReading",
      headerName: "Type",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputSelectTextField
          name="KMReading"
          value={params.row.KMReading}
          data={[
            {
              key: "string",
              value: "String",
            },
            {
              key: "number",
              value: "Number",
            },
          ]}
          // onChange={(e) =>
          //   handleCellChange(params.row.id, "KMReading", e.target.value)
          // }
        />
      ),
    },

    {
      field: "LineRemarks",
      headerName: "operation",
      width: 300,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <InputSelectTextField
          name="KMReading"
          value={params.row.KMReading}
          data={[
            {
              key: "noopr",
              value: "No Operation",
            },
            {
              key: "Increase",
              value: "Increase",
            },
            {
              key: "Decrease",
              value: "Decrease",
            },
          ]}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleDeleteSeriel(params.row.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];
  const {
    itemList,
    isLoading,
    rowCount,
    currentPage,
    searchText,
    handlePaginationModelChange,
    handleSearchChange,
  } = usePaginatedItems(`ItemsV2`, { key: "NumberVald", value: "S" });
  const onCellClick = (id) => {
    console.log(id);
    setMainTopRows(Array(id.row));
    setItemOpen(false);
  };

  const onCellClickItemForSeries = (id) => {
    console.log("fgfdgfdg", id);
    setSendDataSerial(Array(id.row));
  };
  console.log("sendDataSerial", sendDataSerial);

 const dataFinalSerial = (rows) => {
  setFinalDataSeries(prev => [...prev, ...rows]);
};
  const onSubmit = () => {};

  console.log("dfdsf", MainTopRows);

  return (
    <>
      {" "}
      <DataGriCellModelClick
        open={Itemopen}
        closeModel={() => setItemOpen(false)}
        onSubmit={onSubmit}
        isLoading={isLoading}
        title="Item List"
        getRowId={(row) => row.DocEntry}
        columns={modelColumns}
        rows={itemList}
        currentPage={currentPage}
        paginationMode="server"
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onCellClick={(id) => onCellClick(id)}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        oLines={MainTopRows}
      />
      <ResponsiveContainer maxWidth="xl" component="form">
        <Stack spacing={3}>
          {/* Header Section */}
          <StyledCard elevation={2}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AllInboxIcon color="primary" />
                  <Typography
                    color={theme.palette.primary.main}
                    variant="h5"
                    component="h1"
                    fontWeight="bold"
                  >
                    Serial Number Management
                  </Typography>
                </Stack>
              }
              action={
                <Stack direction="row" spacing={1}>
                  {/* <IconButton
                  color="primary"
                  onClick={handleOpen}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <AddIcon />
                </IconButton> */}
                  <IconButton
                    color="secondary"
                    sx={{
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.secondary.main,
                          0.2
                        ),
                      },
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              }
            />
          </StyledCard>

          {/* Form Section */}
          <StyledCard elevation={1}>
            <CardContent>
              <Typography
                variant="body1"
                gutterBottom
                color="primary"
                fontWeight="600"
              >
                {watch("Status") === "1"
                  ? "Create serial numbers for received Items"
                  : "Update existing serial numbers"}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Responsive Form Grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="Status"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <ModelInputSelectTextField
                        {...field}
                        error={!!error}
                        helperText={error ? error.message : null}
                        label="OPERATION"
                        data={[
                          { key: "1", value: "Completed" },
                          { key: "2", value: "Updated" },
                        ]}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="DocDate"
                    control={control}
                    rules={{ required: "Date is Required" }}
                    render={({ field, fieldState: { error } }) => (
                      <SelectedDatePickerField
                        label="FROM DATE"
                        name={field.name}
                        value={field.value ? dayjs(field.value) : undefined}
                        onChange={(date) => {
                          setValue("DocDate", date, { shouldDirty: true });
                          setValue("DocDueDate", "", { shouldDirty: true });
                        }}
                        error={!!error}
                        helperText={error ? error.message : null}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="DocDueDate"
                    control={control}
                    rules={{ required: "Date is Required" }}
                    render={({ field, fieldState: { error } }) => (
                      <SelectedDatePickerField
                        label="TO DATE"
                        name={field.name}
                        value={field.value ? dayjs(field.value) : undefined}
                        minDate={getValues("DocDate")}
                        onChange={(date) => {
                          setValue("DocDueDate", date, { shouldDirty: true });
                        }}
                        disabled={!getValues("DocDate")}
                        error={!!error}
                        helperText={error ? error.message : null}
                      />
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  display="flex"
                  alignItems="center"
                >
                  <ActionButton
                    variant="contained"
                    color="primary"
                    // startIcon={<SearchIcon />}
                    fullWidth={isMobile}
                    onClick={() => setItemOpen(true)}
                    sx={{ height: "56px" }}
                  >
                    SELECT ITEM
                  </ActionButton>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>

          {/* Tabs Section */}
          <StyledCard elevation={1}>
            <CardContent>
              <Typography
                variant="body1"
                gutterBottom
                color="primary"
                fontWeight="600"
              >
                Document Categories
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Tabs
                value={tabvalue}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    minHeight: 48,
                  },
                  "& .Mui-selected": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <Tab
                  icon={<TocIcon />}
                  iconPosition="start"
                  label="Purchasing A/P"
                  sx={{ minHeight: 48 }}
                />
                <Tab
                  icon={<ProductionQuantityLimitsIcon />}
                  iconPosition="start"
                  label="Sales A/R"
                  sx={{ minHeight: 48 }}
                />
                <Tab
                  icon={<InventoryIcon />}
                  iconPosition="start"
                  label="Inventory Posting"
                  sx={{ minHeight: 48 }}
                />
              </Tabs>

              <Divider sx={{ mt: 2 }} />

              {/* Tab Content */}
              <Box sx={{ mt: 3 }}>
                {tabvalue === 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="600"
                    >
                      Purchasing Operations
                    </Typography>
                    <FormGroup row sx={{ flexWrap: "wrap", gap: 2 }}>
                      <Controller
                        name="grpo"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="GRPO"
                          />
                        )}
                      />
                      <Controller
                        name="goodsReturn"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Goods Return"
                          />
                        )}
                      />
                      <Controller
                        name="invoice"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Invoice"
                          />
                        )}
                      />
                      <Controller
                        name="creditNote"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Credit Note"
                          />
                        )}
                      />
                    </FormGroup>
                  </Paper>
                )}
                {tabvalue === 1 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="600"
                    >
                      Sales Operations
                    </Typography>
                    <FormGroup row sx={{ flexWrap: "wrap", gap: 2 }}>
                      <Controller
                        name="grpo"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Deliveries"
                          />
                        )}
                      />
                      <Controller
                        name="goodsReturn"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Sales Return"
                          />
                        )}
                      />
                      <Controller
                        name="invoice"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="A/R Invoice"
                          />
                        )}
                      />
                      <Controller
                        name="creditNote"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="<A />
                          <R></R> Credit Notes"
                          />
                        )}
                      />
                    </FormGroup>
                  </Paper>
                )}
                {tabvalue === 2 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="600"
                    >
                      Inventory Operations
                    </Typography>
                    <FormGroup row sx={{ flexWrap: "wrap", gap: 2 }}>
                      <Controller
                        name="grpo"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Goods Issue"
                          />
                        )}
                      />
                      <Controller
                        name="goodsReturn"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Good Receipt"
                          />
                        )}
                      />
                      <Controller
                        name="invoice"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Inventory Transfers"
                          />
                        )}
                      />
                      <Controller
                        name="creditNote"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label="Stock Updates"
                          />
                        )}
                      />
                    </FormGroup>
                  </Paper>
                )}
              </Box>
            </CardContent>
          </StyledCard>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{
              position: "sticky",
              bottom: 16,
              zIndex: 1000,
              p: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: "blur(10px)",
              borderRadius: 2,
              boxShadow: theme.shadows[8],
            }}
          >
            <ActionButton
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              size="large"
            >
              Open Management
            </ActionButton>
            <ActionButton
              variant="outlined"
              color="primary"
              startIcon={<CancelIcon />}
              size="large"
            >
              Cancel
            </ActionButton>
          </Stack>

          {/* Enhanced Dialogs */}
          <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            sx={{
              "& .MuiDialog-paper": {
                backgroundColor: theme.palette.background.default,
              },
            }}
          >
            <AppBar
              sx={{
                position: "relative",
                backgroundColor: theme.palette.primary.main,
                boxShadow: theme.shadows[4],
              }}
            >
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleClose}
                  sx={{ mr: 2 }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography sx={{ flex: 1 }} variant="h6" component="div">
                  Serial Number Management -
                </Typography>
                <ActionButton
                  variant="outlined"
                  color="inherit"
                  onClick={handleClose}
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "white",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.5)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Close
                </ActionButton>
              </Toolbar>
            </AppBar>

            <DialogContent sx={{ p: 2 }}>
              <Container maxWidth="xl">
                <Stack spacing={3}>
                  {/* Top DataGrid Section */}
                  <StyledCard elevation={1}>
                    <CardHeader
                      title={
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="primary"
                        >
                          Document Rows
                        </Typography>
                      }
                      action={
                        <Chip
                          label={`${MainTopRows.length} items`}
                          color="primary"
                          variant="outlined"
                        />
                      }
                    />
                    <CardContent>
                      <Box sx={{ height: 250, width: "100%" }}>
                        <StyledDataGrid
                          className="datagrid-style"
                          rows={MainTopRows}
                          columns={topColumns}
                          getRowId={(row) => row.DocNum}
                          onCellClick={(id) => onCellClickItemForSeries(id)}
                          getRowClassName={(params) => {
                            const selectedDocNum = sendDataSerial[0]?.DocNum;
                            if (!selectedDocNum) return "";
                            return params.row.DocNum === selectedDocNum
                              ? "selected-row"
                              : "";
                          }}
                          pageSize={5}
                          disableRowSelectionOnClick
                          autoHeight={false}
                          sx={{
                            "& .MuiDataGrid-columnHeaders": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            },
                          }}
                        />
                      </Box>
                    </CardContent>
                  </StyledCard>

                  {/* Bottom DataGrid Section */}
                  <StyledCard elevation={1}>
                    <CardHeader
                      title={
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          color="primary"
                        >
                          Created Serial Numbers
                        </Typography>
                      }
                      action={
                        <Chip
                          label={`${bottomRows.length} serials`}
                          color="secondary"
                          variant="outlined"
                        />
                      }
                    />
                    <CardContent>
                      <Box sx={{ height: 300, width: "100%" }}>
                        <StyledDataGrid
                          className="datagrid-style"
                          rows={FinalDataSeries}
                          columns={bottomColumns}
                          pageSize={10}
                          disableRowSelectionOnClick
                          autoHeight={false}
                          sx={{
                            "& .MuiDataGrid-columnHeaders": {
                              backgroundColor: alpha(
                                theme.palette.secondary.main,
                                0.1
                              ),
                            },
                          }}
                        />
                      </Box>
                    </CardContent>
                  </StyledCard>

                  {/* Summary Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                      border: `1px solid ${alpha(
                        theme.palette.success.main,
                        0.2
                      )}`,
                      borderRadius: 2,
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Controller
                          name="TaxAmt"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="Total Created"
                              type="number"
                              {...field}
                              readOnly={true}
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={8}>
                        <Typography variant="body2" color="text.secondary">
                          Total number of serial numbers created from the
                          selected documents
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Stack>
              </Container>
            </DialogContent>

            <DialogActions
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                p: 3,
                backgroundColor: theme.palette.background.paper,
                gap: 2,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ flex: 1 }}
              >
                <ActionButton
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={() => alert("Saved!")}
                >
                  Save Changes
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  color="inherit"
                  startIcon={<CancelIcon />}
                  onClick={handleClose}
                >
                  Cancel
                </ActionButton>
              </Stack>
              <ActionButton
                variant="outlined"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
              >
                Automatic Creation
              </ActionButton>
            </DialogActions>
          </Dialog>

          {/* Second Dialog - Create Serial Numbers */}
          <AutoCreaeSerial
            openserialmodal={openCreate}
            DialogClosePayto={handleCloseCrate}
            Title="Serial Management - Create"
            DataSerial={sendDataSerial}
              onSubmit={(row)=>dataFinalSerial(row)}
          />
        </Stack>
      </ResponsiveContainer>
    </>
  );
}
