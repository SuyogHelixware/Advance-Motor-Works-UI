import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

import RefreshIcon from "@mui/icons-material/Refresh";
import { TabPanel } from "@mui/lab";

import { TabContext } from "@mui/lab";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  InputDatePickerField,
  InputSelectTextField,
  InputTextField,
  InputTextSearchField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import axios from "axios";
// import { BASE_URL } from "../Api/Constant";
import CardComponent from "../Components/CardComponent";

export default function BookingAppointment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setsearch] = useState("");
  const [searchdata, setsearchdata] = useState([]);
  const [getListData, setgetListdata] = useState([]);
  const [hasmore, sethasmore] = useState(0);

  const handleChange = (e) => {
    setsearch(e.target.value);
  };

  const handleClear = () => {
    setsearch("");
    setsearchdata([]);
  };

  const getListForCreate = () => {
    axios
      .get(`${process.env.BASE_URL}/Appointment/GetListForCreate/0`)
      .then((res) => {
        console.log("Get Data for list", res.data.values);
        setgetListdata(res.data.values);
      });
  };

  useEffect(() => {
    getListForCreate();
  }, []);

  useEffect(() => {
    if (search !== "") {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${process.env.BASE_URL}/DownPayment/GetListForCreate/Search/${search}`,
          );
          console.log(response.data.values);
          setsearchdata(response.data.values);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      };

      const delayFetch = setTimeout(() => {
        fetchData();
      }, 1000);

      return () => clearTimeout(delayFetch);
    } else {
      setsearchdata([]);
    }
  }, [search]);

  const displayedData = search !== "" ? searchdata : getListData;

  const theme = useTheme();

  const { control, handleSubmit } = useForm({
    mode: "onChange",
  });

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  const columns = [
    {
      field: "Item_Code",
      headerName: "Item Code",
      width: 120,
      editable: true,
    },
    {
      field: "Item_Description",
      headerName: "Item Description",
      width: 150,
      editable: true,
    },
    {
      field: "Qty",
      headerName: "Qty",
      width: 100,
      editable: true,
    },
    {
      field: "Price",
      headerName: "Price",
      width: 100,
      editable: true,
    },
    {
      field: "Amount",
      headerName: "Amount",
      width: 100,
      editable: true,
    },
    {
      field: "Fitting",
      headerName: "Fitting",
      width: 100,
      editable: true,
    },
    {
      field: "Tax",
      headerName: "Tax",
      width: 110,
      editable: true,
    },
    {
      field: "Tax_Amt",
      headerName: "Tax Amt	",
      width: 110,
      editable: true,
    },
  ];

  const rows = [
    {
      id: 1,
      Item_Code: "TJMSEATCOVER",
      Item_Description: "TJM SEAT COVERS PR",
      Qty: "1",
      Price: "35.000",
      Amount: "35.000",
      Fitting: "0",
      Tax: "5% vat",
      Tax_Amt: 1.75,
    },
  ];

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
          Booked Appointment List
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
                  <SearchInputField />
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
                  <SearchInputField />
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
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
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
              display: {}, // Show only on smaller screens

              position: "absolute",

              // top: "10px",

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
              Booking Appointment
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
                // component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid container item>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="OrderNo"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextSearchField
                            label="Request NO"
                            type="text"
                            onClick={() => {
                              openDialog();
                              // ClearForm();
                            }}
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />

                      <SearchModel
                        open={isDialogOpen}
                        onClose={handleCloseDialog}
                        // onCancel={handleCloseDialog}
                        title="SELECT VENDOR"
                        onChange={handleChange}
                        value={search}
                        onClickClear={handleClear}
                        cardData={
                          <>
                            {displayedData.map((item, index) => (
                              <CardComponent
                                key={index}
                                title={item.CardName}
                              />
                            ))}
                          </>
                        }
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="customer name*"
                        rules={{ required: "this field is requered" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="customer name"
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
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="phone number"
                        rules={{ required: "this field is requered" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="phone number"
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
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="appoitment no"
                        rules={{ required: "this field is requered" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="appoitment no"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            rows={1}
                          />
                        )}
                      />
                    </Grid>
                    {/* <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <FormComponent
                        label="APPOINTMENT TYPE"
                        type="select"
                        data={[
                          {
                            key: 1,
                            value: "xyz",
                          },
                        ]}
                      />
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
                      />
                    </Paper>
                  </Grid>

                  <Grid container item mt={1}>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Account code"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="vahicle type"
                            data={[
                              { key: "1", value: "453454" },
                              { key: "2", value: "4543654" },
                            ]}
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={6}
                      sm={6}
                      lg={4}
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
                            value={field.value} // Value managed by react-hook-form
                            onChange={(date) => field.onChange(date)} // Handle the change event
                            error={!!error} // Pass error state
                            helperText={error ? error.message : null} // Show validation message
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="FROM"
                        rules={{ required: "this field is requered" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="FROM"
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
                sx={{ color: "white" }}
                color="success"
                type="submit"
              >
                Save
              </Button>
              {/* <Button variant="contained" color="error" disabled>
                CANCEL APPIONTMENT
              </Button> */}
              <Button variant="contained" color="primary">
                PRINT
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
