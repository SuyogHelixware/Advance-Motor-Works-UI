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
  ModelSelectedDatePickerField,
  SelectedDatePickerField,
  SmallInputTextField,
} from "../Components/formComponents";

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

export default function Batch() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [checkTabRows, setcheckTabRows] = useState([]);
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
  const initialFormData = {};
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
  const topRows = [
    {
      id: 1,
      docNo: "PU 89",
      itemNumber: "SerialItemOET",
      itemDesc: "Serial Item On Every Transaction",
      whse: "W01",
      qty: 60,
      created: 60,
    },
    {
      id: 2,
      docNo: "PD 302",
      itemNumber: "SerialItemOET",
      itemDesc: "Serial Item On Every Transaction",
      whse: "W01",
      qty: 1000,
      created: 1000,
    },
    {
      id: 3,
      docNo: "PD 303",
      itemNumber: "SerialItemOET",
      itemDesc: "Serial Item On Every Transaction",
      whse: "W01",
      qty: 120,
      created: 120,
    },
  ];

  const topColumns = [
    { field: "docNo", headerName: "Doc. No.", flex: 1 },
    { field: "itemNumber", headerName: "Item Number", flex: 1 },
    { field: "itemDesc", headerName: "Item Description", flex: 2 },
    { field: "whse", headerName: "Whse Code", flex: 1 },
    { field: "qty", headerName: "Quantity", flex: 1, type: "number" },
    { field: "created", headerName: "Total Created", flex: 1, type: "number" },
    { field: "bin", headerName: "Bin Location", flex: 1, type: "number" },
  ];

  // Sample data for bottom DataGrid (Created Serial Numbers)
  const bottomRows = [
    {
      id: 30,
      serialNo: "AB30",
      lotNo: "AB",
      binLocation: "W01-BIN1",
      systemNo: 1150,
      status: "Available",
    },
    {
      id: 31,
      serialNo: "AB31",
      lotNo: "AB",
      binLocation: "W01-BIN1",
      systemNo: 1151,
      status: "Available",
    },
    {
      id: 32,
      serialNo: "AB32",
      lotNo: "AB",
      binLocation: "W01-BIN1",
      systemNo: 1152,
      status: "Available",
    },
  ];

  const bottomColumns = [
    { field: "lotNo", headerName: "Batch", width: 100 },
    { field: "serialNo", headerName: "BATCH ATTRIBUTE1", width: 200 },
    { field: "binLocation", headerName: "BATCH ATTRIBUTE2", width: 200 },
    { field: "systemNo", headerName: "FIRST BIN LOCATION", width: 100 },
    { field: "status", headerName: "EXPIRY DATE", width: 100 },
    { field: "MFR", headerName: "MFR DATE", width: 100 },
    { field: "ADD", headerName: "ADMISSION DATE", width: 100 },
    { field: "LOCATION", headerName: "LOCATION", width: 100 },
    { field: "DETAILS", headerName: "DETAILS", width: 100 },
    { field: "SYSTEM NUMBER", headerName: "SYSTEM NUMBER", width: 100 },
    { field: "UNIT COST", headerName: "UNIT COST", width: 100 },
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
          // onClick={() => handleAccDeleteRow(params.row.id)}
          color="error"
        >
          {/* <DeleteIcon /> */}
        </IconButton>
      ),
    },
  ];
  return (
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
                  Batch Number Management
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
                      backgroundColor: alpha(theme.palette.secondary.main, 0.2),
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
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="600"
            >
              Filter & Search Options
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Responsive Form Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="Status"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
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
                  startIcon={<SearchIcon />}
                  fullWidth={isMobile}
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
              variant="h6"
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
                  <Typography variant="subtitle1" gutterBottom fontWeight="600">
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
                  <Typography variant="subtitle1" gutterBottom fontWeight="600">
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
                          label="GOOD ISSUE"
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
                          label="GOOD RECEIPT"
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
                          label="INVENTORY TRANSFER"
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
                          label="STOCK UPDATE"
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
                Batch Number Management -
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
                      <Typography variant="h6" fontWeight="600" color="primary">
                        Document Rows
                      </Typography>
                    }
                    action={
                      <Chip
                        label={`${topRows.length} items`}
                        color="primary"
                        variant="outlined"
                      />
                    }
                  />
                  <CardContent>
                    <Box sx={{ height: 250, width: "100%" }}>
                      <StyledDataGrid
                        className="datagrid-style"
                        rows={topRows}
                        columns={topColumns}
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
                      <Typography variant="h6" fontWeight="600" color="primary">
                        Created Batch Numbers
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
                        rows={bottomRows}
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
                        Total number of serial numbers created from the selected
                        documents
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
        <Dialog
          open={openCreate}
          maxWidth="lg"
          fullWidth
          onClose={handleCloseCrate}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 2,
              boxShadow: theme.shadows[12],
            },
          }}
        >
          <DialogTitle>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <InventoryIcon color="primary" />
                <Typography variant="h6" fontWeight="600">
                  Batch Management - Create
                </Typography>
              </Stack>
              <IconButton
                onClick={handleCloseCrate}
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Item Information Section */}
              <StyledCard elevation={1}>
                <CardHeader
                  title={
                    <Typography variant="h6" fontWeight="600" color="primary">
                      Item Information
                    </Typography>
                  }
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name="ItemCode"
                        rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="ITEM NUMBER"
                            type="text"
                            {...field}
                            readOnly={true}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name="ItemName"
                        rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="ITEM DESCRIPTION"
                            type="text"
                            {...field}
                            readOnly={true}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name="Quantity"
                        rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="QUANTITY"
                            type="text"
                            {...field}
                            readOnly={true}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name="Quantity"
                        rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="NUMBER OF BATCH"
                            type="text"
                            {...field}
                            readOnly={true}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>

              {/* Serial Configuration Section */}
              <StyledCard elevation={1}>
                <CardHeader
                  title={
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="h6" fontWeight="600" color="primary">
                        Batch Configuration
                      </Typography>
                      <IconButton
                        onClick={addRow}
                        sx={{
                          backgroundColor: theme.palette.success.main,
                          color: "white",
                          "&:hover": {
                            backgroundColor: theme.palette.success.dark,
                          },
                        }}
                      >
                        <AddOutlinedIcon />
                      </IconButton>
                    </Stack>
                  }
                />
                <CardContent>
                  <Box sx={{ height: 300, width: "100%" }}>
                    <StyledDataGrid
                      columns={modalcolumnsTab0}
                      rows={checkTabRows}
                      getRowId={(row) => row.id || row.LineNum}
                      autoHeight={false}
                      hideFooter
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 100 },
                        },
                      }}
                      pageSizeOptions={[10]}
                      sx={{
                        "& .MuiDataGrid-columnHeaders": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          fontWeight: "bold",
                        },
                        "& .MuiDataGrid-cell": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell:focus": {
                          outline: "none",
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </StyledCard>

              {/* Final String Display */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  color="info.main"
                  gutterBottom
                >
                  Final String Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review and confirm your serial number configuration before
                  saving.
                </Typography>
              </Paper>

              {/* Additional Form Fields */}
              <StyledCard elevation={1}>
                <CardHeader
                  title={
                    <Typography variant="h6" fontWeight="600" color="primary">
                      Batch Details
                    </Typography>
                  }
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Controller
                        name="MfrSerial"
                        rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="BATCH"
                            type="text"
                            {...field}
                            readOnly={true}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Controller
                        name="Serial"
                        rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="BATCH ATTRIBUTE1"
                            type="text"
                            {...field}
                            readOnly={true}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Controller
                        name="lot"
                        rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="BATCH ATTRIBUTE2"
                            type="text"
                            {...field}
                            readOnly={true}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Controller
                        name="systemNo"
                        rules={{ required: "This field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="SYSTEM NUMBER"
                            type="text"
                            {...field}
                            readOnly={true}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Controller
                        name="DocDate"
                        control={control}
                        rules={{ required: "Date is Required" }}
                        render={({ field, fieldState: { error } }) => (
                          <ModelSelectedDatePickerField
                            label="ADMISSION DATE"
                            name={field.name}
                            value={field.value ? dayjs(field.value) : undefined}
                            onChange={(date) => {
                              setValue("DocDate", date, { shouldDirty: true });
                            }}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Controller
                        name="DocDueDate"
                        control={control}
                        rules={{ required: "Date is Required" }}
                        render={({ field, fieldState: { error } }) => (
                          <ModelSelectedDatePickerField
                            label="MANUFACTURING DATE"
                            name={field.name}
                            value={field.value ? dayjs(field.value) : undefined}
                            minDate={getValues("DocDate")}
                            onChange={(date) => {
                              setValue("DocDueDate", date, {
                                shouldDirty: true,
                              });
                            }}
                            disabled={!getValues("DocDate")}
                            error={!!error}
                            helperText={error ? error.message : null}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              p: 3,
              backgroundColor: theme.palette.background.paper,
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
                Save Configuration
              </ActionButton>
              <ActionButton
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={handleCloseCrate}
              >
                Cancel
              </ActionButton>
            </Stack>
          </DialogActions>
        </Dialog>
      </Stack>
    </ResponsiveContainer>
  );
}
