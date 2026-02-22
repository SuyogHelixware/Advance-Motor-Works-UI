import CloseIcon from "@mui/icons-material/Close";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import DetailsIcon from "@mui/icons-material/Details";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import ImageIcon from "@mui/icons-material/Image";
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import SearchIcon from "@mui/icons-material/Search";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import DeleteIcon from "@mui/icons-material/Delete";

import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Slide,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  InputDatePickerField,
  InputDatePickerFields,
  InputFields,
  InputSelectFields,
  InputTextArea,
  InputTextField,
  RadioButtonsField,
  SmallInputFields,
  SmallInputTextField,
  TableNumberInput,
} from "../Components/formComponents";
import { PhoneNumber } from "../Components/PhoneNumber";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import { Row } from "antd";
import { dataGridSx } from "../../Styles/dataGridStyles";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function QuatationSO() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [time, settime] = useState(new Date().toLocaleTimeString());
  const [tab, settab] = useState("1");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [tabvalue, settabvalue] = useState(0);
  const [openModal, setOpenModal] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [formData, setFormData] = useState(InitialObj);
  const [bankData, setBankData] = useState([]);

  const theme = useTheme();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  function hadlesubmit(e) {
    e.preventDefault();
  }

  const addRow = () => {
    const newData = {
      myRadioGroup: getValues("myRadioGroup"),
      AuthCode: getValues("AuthCode"),
      Creditno: getValues("Creditno"),
      Amount: getValues("Amount"),
    };

    setBankData((prevData) => [...prevData, newData]);
    reset();
  };

  const removeTableRow1 = (index) => {
    const updatedData = bankData.filter((_, i) => i !== index);
    setBankData(updatedData);
  };

  const { control, trigger, getValues, reset, setValue } = useForm({
    defaultValues: "",
  });

  const [ModeltabValue, setModelTabValue] = React.useState("1");
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const handleModelTabChange = (event, newValue) => {
    setModelTabValue(newValue);
  };
  const carddata = [
    {
      id: 1,
      name: "fsd",
    },
    {
      id: 2,
      name: "fddsf",
    },
  ];

  const handleClickModel = () => {
    setOpenModal(true);
  };

  const handleCloseModel = () => {
    setOpenModal(false);
  };
  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };

  const updatetime = () => {
    settime(new Date().toLocaleDateString());
  };

  useEffect(() => {
    const interid = setInterval(updatetime, 2000);
    return () => clearInterval(interid);
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleTabChangeRight = (e, newtab) => {
    settab(newtab);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const onHandleSearch = () => {
    alert();
  };

  const columns = [
    {
      field: "Item_Code",
      headerName: "Item Code",
      width: 120,
      editable: false,
    },
    {
      field: "Description",
      headerName: "Item Description",
      width: 150,
      editable: false,
    },
    {
      field: "WHS",
      headerName: "WHS",
      width: 100,
      editable: false,
    },
    // {
    //   field: "Qty",
    //   headerName: "Qty",
    //   width: 100,
    //   editable: true,
    // },
    {
      field: "Quantity",
      headerName: "QTY",
      width: 120,
      type: "number",
      editable: true,
      headerAlign: "center",
      align: "center",
      renderCell: ({ value }) => (value == null ? "" : value),
    },

    {
      field: "Price",
      headerName: "Price",
      width: 100,
      editable: false,
    },
    {
      field: "Amount",
      headerName: "Total Amt",
      width: 100,
      editable: false,
    },
    {
      field: "Fitting",
      headerName: "Fitting",
      width: 110,
      editable: true,
    },
    {
      field: "FTS",
      headerName: "FTS",
      width: 110,
      editable: false,
    },
    {
      field: "Tax",
      headerName: "Tax",
      width: 110,
      editable: false,
    },
    {
      field: "Tax_Amt",
      headerName: "	Tax Amt	",
      width: 110,
      editable: false,
    },
    {
      field: "Iss_QTY",
      headerName: "Iss QTY	",
      width: 110,
      editable: false,
    },
    {
      field: "Status",
      headerName: "Status",
      width: 110,
      editable: false,
    },
    {
      field: "Action",
      headerName: "Action",
      width: 110,
      editable: true,
    },
  ];
  const [rows, setRows] = useState([
    {
      id: "1",
      Item_Code: "RDK1355",
      Description: "ARB DRAWER KITCHEN 1355X500",
      WHS: "1000",
      Qty: "",
      Price: "35.000",
      Total_Amt: "0",
      Fitting: "",
      FTS: "1.75",
      Tax: "10",
      Tax_Amt: "20",
      Iss_QTY: "0",
      Status: "not-issued",
      Action: "",
    },
    {
      id: "2",
      Item_Code: "3455",
      Description: "1355X500",
      WHS: "1000",
      Qty: "",
      Price: "5",
      Total_Amt: "0",
      Fitting: "",
      FTS: "1.75",
      Tax: "10",
      Tax_Amt: "20",
      Iss_QTY: "0",
      Status: "not-issued",
      Action: "",
    },
  ]);

  // const HandleTableOnChange = (id, value) => {
  //   setRows((prev) => {
  //     const updatedRows = prev.map((row) =>
  //       row.id === id
  //         ? {
  //             ...row,
  //             Qty: value,
  //             Total_Amt: value * row.Price,
  //           }
  //         : row,
  //     );

  //     const totalPartsValue = updatedRows.reduce(
  //       (sum, row) => sum + Number(row.Total_Amt || 0),
  //       0,
  //     );

  //     setValue("TotalPartsValue", totalPartsValue);

  //     return updatedRows;
  //   });
  // };

  const HandleTableOnChange = (newRow, oldRow) => {
    const qty = Number(newRow.Quantity) || 0;
    const price = Number(newRow.Price) || 0;

    const totalAmt = qty * price;

    const updatedRow = { ...newRow, Amount: totalAmt };

    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === newRow.id ? updatedRow : row,
      );

      const totalPartsSum = updatedRows.reduce(
        (sum, row) => sum + (Number(row.Amount) || 0),
        0,
      );
      const Fittingcharge = updatedRows.reduce(
        (sum, row) => sum + (Number(row.Fitting) || 0),
        0,
      );

      setValue("TotalPartsValue", totalPartsSum.toFixed(3));
      setValue("ServiceAndInstallation", Fittingcharge.toFixed(3));
      setValue("NetPartsValue", totalPartsSum.toFixed(3));
      setValue("TotalDocAmt", totalPartsSum.toFixed(3));

      return updatedRows;
    });

    HandleOnFildChange();
    return updatedRow;
  };
  const round = (num, decimals = 2) =>
    Math.round((num + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;
  const HandleOnFildChange = () => {
    const allformdata = getValues();

    const specialDiscPercent = Number(getValues("SpecialDisc")) || 0;
    const DesiredDiscPercent = Number(getValues("DesiredDisc")) || 0;

    const sDiscAmt = round(
      (allformdata.TotalPartsValue * specialDiscPercent) / 100,
    );

    const fittingcharge = allformdata.ServiceAndInstallation;

    const dDiscAmt = round(
      (allformdata.TotalPartsValue * DesiredDiscPercent) / 100,
    );

    const netParts =
      Number(allformdata.TotalPartsValue) -
      Number(sDiscAmt) -
      Number(dDiscAmt) +
      Number(fittingcharge) +
      Number(allformdata.RoundingAmt);

    const TotTotalDocAmt = Number(netParts) + Number(allformdata.ShippingAmt);

    setValue("SpecialDiscAmt", sDiscAmt.toFixed(3));
    setValue("DesiredDiscAmt", dDiscAmt.toFixed(3));
    setValue("NetPartsValue", netParts.toFixed(3));
    setValue("NetPartsValue", netParts.toFixed(3));
    setValue("TotalDocAmt", TotTotalDocAmt.toFixed(3));
  };

  const sidebarContent = (
    <>
      <Grid
        item
        width={"100%"}
        py={0.5}
        alignItems={"center"}
        border={"1px solid silver"}
        borderBottom={"none"}
        position={"relative"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Typography
          textAlign={"center"}
          alignContent={"center"}
          height={"100%"}
        >
          Quatation List
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: "absolute",
            right: "10px",
            top: "0px",
            display: { lg: "none", xs: "block" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Grid>

      <Grid
        container
        // bgcolor={'red'}
        // mt={10}
        item
        width={"100%"}
        height={"100%"}
        border={"1px silver solid"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Grid
          item
          md={12}
          sm={12}
          width={"100%"}
          height={`calc(100% - ${50}px)`}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              typography: "body1",
              "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
                padding: 0,
              },

              "& .MuiTabs-flexContainer ": {
                justifyContent: "space-around",
              },
            }}
          >
            <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={handleTabChangeRight}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="1" label="Open" />
                <Tab value="0" label="Closed" />
              </Tabs>
              <TabPanel
                value={"1"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScroll"
              >
                <Grid
                  item
                  padding={1}
                  md={12}
                  sm={12}
                  width={"100%"}
                  sx={{
                    position: "sticky",
                    top: "0",
                    backgroundColor: "#F5F6FA",
                  }}
                >
                  <SearchInputField onChange={onHandleSearch} />
                </Grid>
                {/* <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={DownPayment}
                  next={fetchMoreOpenListData}
                  hasMore={HasMoreOpen}
                  loader={<BeatLoader 
                    color={theme.palette.mode === "light" ? "black" : "white"}
                    />}
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                   {DownPayment.map((item) => ( 
                    <CardComponent
                      // key={item.DocNum}
                      // title={item.OrderNo}
                      // subtitle={item.CardName}
                      // onClick={() => oldData(item.DocEntry)}
                    />
                   ))} 
                </InfiniteScroll> */}
              </TabPanel>
              <TabPanel
                value={"0"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScrollClosed"
              >
                <Grid
                  item
                  padding={1}
                  md={12}
                  sm={12}
                  width={"100%"}
                  sx={{
                    position: "sticky",
                    top: "0",
                    backgroundColor: "#F5F6FA",
                  }}
                >
                  <SearchInputField onChange={onHandleSearch} />
                </Grid>
                {/* <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={CloseDownPayment.length}
                  next={fetchMoreCloseListData}
                  hasMore={HasMoreClose}
                  loader={<BeatLoader 
                    color={theme.palette.mode === "light" ? "black" : "white"}
                  />}
                  scrollableTarget="ListScrollClosed"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {CloseDownPayment.map((itemclose) => (
                    <CardComponent
                      key={itemclose.DocNum}
                      title={itemclose.OrderNo}
                      subtitle={itemclose.CardName}
                    />
                  ))}
                </InfiniteScroll> */}
              </TabPanel>
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <>
      <SearchModel
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onCancel={handleCloseDialog}
        title="Select Customer"
      />
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        // onSubmit={onSubmit}
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            width: "90vw",
            maxWidth: "370px",
            height: "60vh",
            maxHeight: "80vh",
            margin: "auto",
          },
        }}
      >
        <DialogTitle>
          <Grid item display={"flex"} justifyContent={"center"}>
            <PersonAddAlt1OutlinedIcon />
            <Typography textAlign={"center"} fontWeight={"bold"}>
              &nbsp; &nbsp;Customer Creation Form
            </Typography>
          </Grid>
        </DialogTitle>
        <Divider color="gray" />
        <DialogContent className="bg-light">
          <Grid container gap={2}>
            <Grid item xs={12} lg={12} textAlign={"center"}>
              <Controller
                name="CUSTOMER ID"
                disabled
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="CUSTOMER ID"
                    {...field}
                    error={!!error}
                    helperText={error ? error.message : null}
                    rows={1}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} lg={12} textAlign={"center"}>
              <Controller
                name="Document No"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="CUSTOMER NAME"
                    {...field}
                    error={!!error}
                    helperText={error ? error.message : null}
                    rows={1}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} lg={12} textAlign={"center"}>
              <PhoneNumber
                defaultCountry="kw"
                label="CONTACT NUMBER"
                value={phone}
                onChange={(phone) => setPhone(phone)}
              />
            </Grid>
            <Grid item xs={12} lg={12} textAlign={"center"}>
              <Controller
                name="EMAIL"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <InputTextField
                    label="EMAIL"
                    {...field}
                    error={!!error}
                    helperText={error ? error.message : null}
                    rows={1}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="success"
            name="Close"
            onClick={handleClose}
            size="small"
            sx={{ color: "white" }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="error"
            name="Close"
            onClick={handleClose}
            size="small"
          >
            close
          </Button>
        </DialogActions>
      </Dialog>
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={hadlesubmit}
      >
        {/* Sidebar for larger screens */}

        <Grid
          container
          item
          height="100%"
          sm={12}
          md={6}
          lg={3}
          className="sidebar"
          sx={{
            position: { lg: "relative", xs: "absolute" },
            top: 0,
            left: 0,
            transition: "left 0.3s ease",
            zIndex: 1000,
            display: { lg: "block", xs: `${sidebarOpen ? "block" : "none"}` },
          }}
        >
          {sidebarContent}
        </Grid>

        {/* User Creation Form Grid */}

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={9}
          // component="form"
          position="relative"
        >
          {/* Hamburger Menu for smaller screens */}

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{
              display: {
                lg: "none",
              }, // Show only on smaller screens

              position: "absolute",

              // top: "10px",

              left: "10px",
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            // onClick={ClearFormData}
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
              Quatation So
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
              sm={12}
              height="calc(100% - 40px)"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
              position={"relative"}
            >
              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid container item>
                    <Grid container item md={8}>
                      <Grid container item md={12}>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <TextField
                            size="small"
                            label="CUSTOMER ID"
                            autoFocus
                            placeholder="Search ..."
                            sx={{ m: 1, width: "100%", maxWidth: 220 }}
                            InputProps={{
                              // readOnly: props.disabled,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    color="primary"
                                    onClick={handleInputChange}
                                    onChange={handleInputChange}
                                    // onClick={props.onClick}
                                    // disabled={props.disabled}
                                  >
                                    <SearchIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={handleClickOpen}
                                    size="small"
                                    style={{
                                      backgroundColor: "green",
                                      borderRadius: "20%",
                                      color: "white",
                                      padding: 4,
                                      // marginTop: "10px",
                                    }}
                                  >
                                    <ContactMailOutlinedIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="Document No"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="DOCUMENT NO"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="Customer Name"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="CUSTOMER NAME"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="SALES HISTORY"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="SALES HISTORY"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="CONTACT NUMBER"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="CONTACT NUMBER"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="CUSTOMERBALANCE"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="CUSTOMER BALANCE"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={6}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="TargetDate"
                            control={control}
                            rules={{
                              required: "Target Date is required",
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <InputDatePickerField
                                label="TARGET DATE"
                                name={field.name}
                                value={field.value}
                                onChange={(date) => field.onChange(date)}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="Remarks"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextArea
                                rows={2.5}
                                label="JOB WORK DETAILS"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>

                        {/* <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                          sx={{
                            mt: {
                              xs: -0,
                              sm: -0,
                              md: -4,
                            },
                          }}
                        >
                          <Controller
                            name="CR Approved By11"
                           
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="CR Approved By"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid> */}
                        {/* <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                          sx={{
                            mt: {
                              xs: -0,
                              sm: -0,
                              md: -0,
                            },
                          }}
                        >
                          <Controller
                            name="Created By"
                           
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Created By"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid> */}
                        {/* <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                          sx={{
                            mt: {
                              xs: -0,
                              sm: -0,
                              md: -4,
                            },
                          }}
                        >
                          <Controller
                            name="SO No"
                           
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="SO No"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid> */}
                        {/* <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                          sx={{
                            mt: {
                              xs: -0,
                              sm: -0,
                              md: -0,
                            },
                          }}
                        >
                          <Controller
                            name="SAP SO No"
                           
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="SAP SO No"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid> */}
                        {/* <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                          sx={{
                            mt: {
                              xs: -0,
                              sm: -0,
                              md: -4,
                            },
                          }}
                        >
                          <Controller
                            name="Status"
                           
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Status"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid> */}
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                          sx={{
                            mt: {
                              xs: -0,
                              sm: -0,
                              md: -4,
                            },
                          }}
                        >
                          <Controller
                            name="Vehicle"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="VEHICLE"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{
                              color: "white",
                              minWidth: 220,
                              mt: 1,
                              p: 1,
                              mb: 2,
                            }}
                            onClick={handleClickModel}
                          >
                            Search Item
                          </Button>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={4}
                          lg={6}
                          textAlign={"center"}
                          sx={{
                            mt: {
                              xs: -0,
                              sm: -0,
                              md: -4,
                            },
                          }}
                        >
                          <Controller
                            name="SalesOrder"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="SO NO"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                rows={1}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid container item md={4}>
                      <Grid
                        item
                        md={12}
                        lg={12}
                        xs={12}
                        textAlign={"center"}
                        mt={1}
                      >
                        <Typography
                          disabled
                          bgcolor={"silver"}
                          style={{ padding: 4 }}
                        >
                          Top 20 Product
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container item md={12} px={2}>
                    <Row>
                      <Grid
                        item
                        xs={12}
                        md={2.4}
                        sm={4}
                        lg={2.4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="OrderType"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <SmallInputFields
                              label="ORDER TYPE"
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={2.4}
                        sm={4}
                        lg={2.4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="Approver"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <SmallInputFields
                              label="CR APPROVED BY"
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={2.4}
                        sm={4}
                        lg={2.4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="CreatedBy"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <SmallInputFields
                              label="CREATED BY"
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={2.4}
                        sm={4}
                        lg={2.4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="SAPDocNum"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <SmallInputFields
                              label="SAP SO NO"
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={2.4}
                        sm={4}
                        lg={2.4}
                        textAlign={"center"}
                      >
                        <Controller
                          name="Status"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <SmallInputFields
                              label="STATUS"
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>
                    </Row>
                  </Grid>
                  <Grid container item md={12} px={2}>
                    <Grid
                      item
                      md={12}
                      justifyContent={"center"}
                      display={"inline"}
                      ml={1}
                    >
                      <Controller
                        name="Special Order"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "Please select Special Order",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                sx={{ textAlign: "center", width: 20, mr: 1 }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label="Special Order"
                            sx={{ textAlign: "center", width: 140 }}
                          />
                        )}
                      />

                      <Controller
                        name="CNC"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "Please select CNC",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                sx={{ textAlign: "center", width: 20, mr: 1 }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label="CNC"
                            sx={{ textAlign: "center", width: 80 }}
                          />
                        )}
                      />

                      <Controller
                        name="Delivered Later"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "Please select Delivered Later",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                sx={{ textAlign: "center", width: 20, mr: 1 }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label="Delivered Later"
                            sx={{ textAlign: "center", width: 140 }}
                          />
                        )}
                      />

                      <Controller
                        name="Service Order"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "Please select Service Order",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                sx={{ textAlign: "center", width: 20, mr: 1 }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label="Service Order"
                            sx={{ textAlign: "center", width: 130 }}
                          />
                        )}
                      />

                      <Controller
                        name="Shipping
"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "Please select Shipping",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                sx={{ textAlign: "center", width: 20, mr: 1 }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label="Shipping"
                            sx={{ textAlign: "center", width: 100 }}
                          />
                        )}
                      />

                      <Controller
                        name="CR Approved"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "Please select CR Approved",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                sx={{ textAlign: "center", width: 20, mr: 1 }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label="CR Approved"
                            sx={{ textAlign: "center", width: 130 }}
                          />
                        )}
                      />
                    </Grid>
                    {/* <Button
                          variant="contained"
                          color="success"
                          size="small"
                          sx={{ color: "white" }}
                          onClick={handleClickModel}
                        >
                          Search
                        </Button> */}
                  </Grid>

                  <Grid
                    container
                    item
                    mt={1}
                    sx={{
                      px: 2,
                      overflow: "auto",
                      width: "100%",
                      // backgroundColor: "#f2f2f2",
                      // height: "100%",
                    }}
                  >
                    <Paper sx={{ width: "100%" }}>
                      {/* <DataGrid
                        columnHeaderHeight={35}
                        rowHeight={45}
                        className="datagrid-style"
                        sx={{
                          backgroundColor:
                            theme.palette.mode === "light" ? "#fff" : "#373842",
                          "& .MuiDataGrid-cell": {
                            border: "none",
                          },
                          "& .MuiDataGrid-cell:focus": {
                            outline: "none",
                          },
                        }}
                        rows={rows}
                        columns={columns}
                        initialState={{
                          pagination: {
                            paginationModel: {
                              pageSize: 3,
                            },
                          },
                        }}
                        hideFooter
                        disableRowSelectionOnClick
                        pageSizeOptions={[3]}
                      /> */}
                      <DataGrid
                        className="datagrid-style"
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row.id}
                        columnHeaderHeight={35}
                        rowHeight={40}
                        hideFooter
                        processRowUpdate={HandleTableOnChange}
                        onProcessRowUpdateError={(error) => console.log(error)}
                        sx={gridSx}
                      />
                    </Paper>
                  </Grid>
                  <Grid container item mt={1}>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="TotalPartsValue"
                        control={control}
                        label="PARTS VALUE"
                        width={140}
                        readOnly
                      />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="DesiredDisc"
                        control={control}
                        label="DISC (%)"
                        width={140}
                        onChange={HandleOnFildChange}
                      />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="DesiredDiscAmt"
                        control={control}
                        label="DISC AMT"
                        width={140}
                        readOnly
                      />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="SpecialDisc"
                        control={control}
                        label="SPECIAL DISC (%)"
                        width={140}
                        onChange={HandleOnFildChange}
                      />{" "}
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="SpecialDiscAmt"
                        control={control}
                        label="SPECIAL DISC AMT"
                        width={140}
                        readOnly
                      />{" "}
                    </Grid>
                    <Grid
                      item
                      sm={3}
                      md={4}
                      lg={2}
                      xs={6}
                      textAlign={"center"}
                      p={1}
                    >
                      <Button variant="contained" color="primary">
                        CALC DISC
                      </Button>
                    </Grid>

                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="ServiceAndInstallation"
                        control={control}
                        label="SERVICE & INSTALL"
                        width={140}
                        readOnly
                      />{" "}
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="RoundingAmt"
                        control={control}
                        label="ROUNDING OFF"
                        width={140}
                        onChange={HandleOnFildChange}
                      />{" "}
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="NetPartsValue"
                        control={control}
                        label="NET PARTS VALUE"
                        width={140}
                        readOnly
                      />{" "}
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="ShippingAmt"
                        control={control}
                        label="SHIPPING"
                        width={140}
                        onChange={HandleOnFildChange}
                      />{" "}
                    </Grid>

                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields
                        name="TotalDocAmt"
                        control={control}
                        label="TOTAL DOC VALUE"
                        width={140}
                        readOnly
                      />{" "}
                    </Grid>
                  </Grid>

                  <Grid container item>
                    <Grid item width="100%" m={1} border="1px solid grey">
                      <Tabs
                        value={tabvalue}
                        onChange={handleTabChange}
                        aria-label="disabled tabs example"
                        variant="scrollable" // Allows horizontal scrolling if needed
                        scrollButtons="auto"
                      >
                        <Tab value={0} label="Cash" />
                        <Tab value={1} label="Credit card" />
                        <Tab value={2} label="Bank Transfer" />
                      </Tabs>
                      <Divider />
                      {tabvalue === 0 && (
                        <>
                          <InputFields label="CASH CODE" />
                          <InputSelectFields
                            label="CASH ACC CODE"
                            data={[
                              { key: "1", value: "453454" },
                              { key: "2", value: "4543654" },
                              { key: "3", value: "5656" },
                              { key: "4", value: "6765" },
                            ]}
                          />

                          <InputDatePickerFields
                            label="RECEIPT DATE"
                            value={dayjs(undefined)}
                            disabled={true}
                          />
                        </>
                      )}
                      {tabvalue === 1 && (
                        <>
                          <Grid container>
                            <Grid
                              container
                              item
                              lg={6}
                              xs={12}
                              md={6}
                              sm={6}
                              textAlign={"center"}
                            >
                              <RadioButtonsField
                                control={control}
                                name="myRadioGroup"
                                data={[
                                  { value: "KNET", label: "KNET" },
                                  { value: "MASTER", label: "MASTER" },
                                  { value: "VISA", label: "VISA" },
                                  { value: "MF", label: "MF" },
                                  { value: "TABBY", label: "TABBY" },
                                  { value: "TAMARA", label: "TAMARA" },
                                ]}
                              />

                              <Grid
                                item
                                sm={12}
                                md={6}
                                lg={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="Creditno"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="Credit Card No"
                                      type="text"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid
                                item
                                sm={12}
                                md={6}
                                lg={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="Amount"
                                  control={control}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <SmallInputTextField
                                      label="Amount"
                                      type="text"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid
                                item
                                sm={12}
                                md={6}
                                lg={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="AuthCode"
                                  control={control}
                                  rules={{
                                    required: "Authorization code is required",

                                    maxLength: {
                                      value: 10,
                                      message:
                                        "Authorization code must be exactly 10 digits",
                                    },
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="AUTHORIZATION CODE"
                                      type="text"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value); // Update the field value
                                        trigger("AuthCode"); // Trigger validation
                                      }}
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid
                                item
                                sm={12}
                                md={6}
                                lg={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Button
                                  variant="contained"
                                  color="success"
                                  sx={{ px: 5, mt: 1 }}
                                  onClick={addRow}
                                >
                                  ADD
                                </Button>
                              </Grid>
                            </Grid>
                            <Grid item lg={6} xs={12} md={6} sm={6}>
                              <TableContainer
                                // component={Paper}
                                sx={{ overflow: "auto" }}
                              >
                                <Table
                                  stickyHeader
                                  size="small"
                                  // className="table-style"
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>A/C CODE</TableCell>
                                      <TableCell>CARD NAME</TableCell>
                                      <TableCell>CARD NO</TableCell>
                                      <TableCell>AMOUNT</TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {bankData.map((data, index) => (
                                      <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                          {data.AuthCode}
                                        </TableCell>
                                        <TableCell>
                                          {data.myRadioGroup}
                                        </TableCell>
                                        <TableCell>{data.Creditno}</TableCell>
                                        <TableCell>{data.Amount}</TableCell>
                                        <TableCell>
                                          <IconButton
                                            onClick={() =>
                                              removeTableRow1(index)
                                            }
                                          >
                                            <RemoveCircleIcon
                                              sx={{ color: "red" }}
                                            />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {tabvalue === 2 && (
                        <>
                          <Grid container>
                            <Grid item xs={12}>
                              <InputFields label="TRANSFER SUM" />
                              <InputFields label="TRANSFER REF NO" />
                              <InputSelectFields
                                label="TRANSFER ACCOUNT"
                                data={[{ key: "1", value: "idfc" }]}
                              />
                              <InputDatePickerFields
                                label="TRANSFER DATE"
                                value={dayjs(undefined)}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>

                  <Grid container item>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <SmallInputFields label="ADVANCE(%)" />
                    </Grid>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <SmallInputFields label="ADVANCED AMT" />
                    </Grid>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <SmallInputFields label="PAID AMT(%)" />
                    </Grid>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <SmallInputFields label="PAID  AMT" />
                    </Grid>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <SmallInputFields label="DUE AMT" />
                    </Grid>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <SmallInputFields label="SR NO" />
                    </Grid>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <SmallInputFields label="RCT DATE" />
                    </Grid>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <SmallInputFields label="ADV RCT NO" />
                    </Grid>
                    <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                      <InputFields label="FROM" value={time} />
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid
              item
              px={1}
              // md={12}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
                bottom: "0px",
              }}
            >
              <Button
                variant="contained"
                color="success"
                sx={{ color: "white" }}
              >
                SAVE
              </Button>
              <Button variant="contained" color="error">
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { lg: "none" }, // Show only on smaller screens

          "& .MuiDrawer-paper": {
            top: "70px", // 60px from the top

            left: "75px",

            width: "80vw",
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* <Button variant="outlined" onClick={handleClickModel}>
        Open full-screen dialog
      </Button> */}
      <Dialog
        fullScreen
        open={openModal}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseModel}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography
              sx={{ ml: 2, flex: 1 }}
              variant="h6"
              component="div"
              textAlign={"center"}
              fontWeight={10}
            >
              Search Product Details
            </Typography>
            <Button
              autoFocus
              color="inherit"
              sx={{ color: "white" }}
              onClick={handleCloseModel}
            >
              save
            </Button>
          </Toolbar>
        </AppBar>
        <Grid
          container
          width={"100%"}
          height="calc(100vh - 110px)"
          overflow={"hidden"}
        >
          <Grid
            container
            item
            width="100%"
            height="100%"
            sm={12}
            md={12}
            lg={12}
            component="form"
            position="relative"
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              // onClick={toggleDrawer}

              sx={{
                display: {}, // Show only on smaller screens
                position: "absolute",
                // top: "10px",
                right: "10px",
              }}
            >
              {/* <RefreshIcon /> */}
            </IconButton>

            <Grid
              item
              width={"100%"}
              py={0.5}
              alignItems={"center"}
              border={"1px solid silver"}
              borderBottom={"none"}
            ></Grid>

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
                overflow={"scroll"}
                sx={{ overflowX: "hidden" }}
              >
                <Box
                  component="form"
                  sx={{
                    "& .MuiTextField-root": { m: 1 },
                    width: "100%",
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <Grid container md={12} xs={12} sm={12}>
                    <Grid container item>
                      <Grid container item md={3} xs={12} sm={12} px={5}>
                        <InputSelectFields
                          label="Supplier"
                          data={carddata.map((d) => ({
                            key: d.id,
                            value: d.name,
                          }))}
                        />

                        <TextField
                          fullWidth
                          size="small"
                          label="Description"
                          sx={{ maxWidth: "100%" }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Item Code"
                          sx={{ maxWidth: "100%" }}
                        />

                        <FormControlLabel
                          required
                          control={<Checkbox />}
                          label="Include Zero Stock"
                          sx={{ width: "100%", maxWidth: 220, p: 1 }}
                        />
                        <FormControlLabel
                          required
                          control={<Checkbox />}
                          label="Include InActive Items"
                          sx={{ width: "100%", maxWidth: 240, p: 1 }}
                        />
                        <Grid item display={"flex"} gap={"20px"} xs={12} mb={4}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                          >
                            Search
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                          >
                            Clear
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        item
                        md={9}
                        xs={12}
                        border="1px solid silver"
                        padding={1}
                        spacing={2}
                      >
                        <Grid item md={12} xs={12} border="1px solid silver">
                          <TabContext value={ModeltabValue}>
                            <Box
                              sx={{
                                borderBottom: 1,
                                borderColor: "divider",
                                display: "flex",
                                flexDirection: "column",
                                height: "100%", // Ensure the Box takes full height of its parent
                              }}
                            >
                              <Paper>
                                <TabList
                                  onChange={handleModelTabChange}
                                  aria-label="lab API tabs example"
                                  variant="scrollable" // Allows horizontal scrolling if needed
                                  scrollButtons="auto" // Automatically show scroll buttons on overflow
                                  sx={{
                                    bgcolor: "background.paper",
                                    borderBottom: 1,
                                    borderColor: "divider",
                                  }}
                                >
                                  <Tab
                                    icon={<ImageIcon />}
                                    label="Item Image"
                                    value="1"
                                  />
                                  <Tab
                                    icon={<FileCopyIcon />}
                                    label="ATP"
                                    value="2"
                                  />
                                  <Tab
                                    icon={<DetailsIcon />}
                                    label="GRN DETAILS"
                                    value="3"
                                  />
                                  <Tab
                                    icon={<RequestQuoteIcon />}
                                    label="A/R- Invoice"
                                    value="4"
                                  />
                                  <Tab
                                    icon={<TextSnippetIcon />}
                                    label="Open SO"
                                    value="5"
                                  />
                                </TabList>
                              </Paper>
                            </Box>
                          </TabContext>
                        </Grid>
                      </Grid>
                      {/* <Grid item xs={12} md={12} m={1} >
                    <Paper elevation={3} style={{ width: "100%" }}>
                      <DataGrid
                        sx={{
                          fontSize: "11px",
                          mb: 1,
                          "& .MuiDataGrid-columnHeaderTitle": {
                            whiteSpace: "normal",
                            lineHeight: "normal",
                            fontSize: "11px",
                          },
                          "& .MuiDataGrid-columnHeader": {
                            height: "auto", // Adjust for better compatibility
                          },
                          "& .MuiDataGrid-columnHeaders": {
                            maxHeight: "168px", // Avoid '!important' if possible
                          },
                        }}
                        rowHeight={35}
                        rows={rows}
                        columns={columns}
                        disableColumnMenu
                        columnHeaderHeight={35}
                        onRowClick={(event) => {
                          console.log("Selected Row:", event.row);
                          // Handle row click if needed
                        }}
                        className="datagrid-style"
                        
                        getRowClassName={(params) =>
                          params.row.FTSQty <= 0 ? "datagridrowstyle" : ""
                        }
                      />
                    </Paper>
                  </Grid> */}
                    </Grid>

                    <Grid
                      container
                      item
                      sx={{
                        px: 2,
                        overflow: "auto",
                        width: "100%",
                        // backgroundColor: "#f2f2f2",
                        // height: "100%",
                      }}
                    >
                      <Paper sx={{ width: "100%" }}>
                        <DataGrid
                          sx={{
                            width: "100%",
                            "& .MuiDataGrid-columnHeaders": {
                              backgroundColor: "red",
                              fontWeight: "bold",
                            },
                          }}
                          rows={rows}
                          columns={columns}
                          columnHeaderHeight={35}
                          rowHeight={45}
                          initialState={{
                            pagination: {
                              paginationModel: {
                                pageSize: 3,
                              },
                            },
                          }}
                          hideFooter
                          disableRowSelectionOnClick
                          pageSizeOptions={[3]}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid
                item
                px={1}
                // md={12}
                xs={12}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "end",
                  position: "sticky",
                  bottom: "0px",
                }}
              >
                {/* <Button variant="contained" color="success">
                SAVE
              </Button>
              <Button variant="contained" color="error">
                DELETE
              </Button> */}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
    </>
  );
}
