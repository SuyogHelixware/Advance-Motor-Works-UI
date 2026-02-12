import MenuIcon from "@mui/icons-material/Menu";
import React, { useState } from "react";

import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import SearchInputField from "../Components/SearchInputField";

import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import {
  InputDatePickerFields,
  InputFields,
  InputNumberFields,
  InputTextAreaFields,
  InputTextSearchButton,
  SmallInputFields,
} from "../Components/formComponents";
export default function OrderCancellation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const theme = useTheme();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // const onHandleSearch = () => {
  //   alert();
  // };

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
      field: "Whs",
      headerName: "WHS",
      width: 100,
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
      width: 110,
      editable: true,
    },
    {
      field: "Line_Status",
      headerName: "Line Status",
      width: 110,
      editable: true,
    },
  ];

  const rows = [
    {
      id: 1,
      Item_Code: "CAM-210051",
      Item_Description: "2007-2018 GM 1500/2007-2020 TAHOE/YUK",
      Whs: "1000",
      Qty: "1",
      Price: "420.000",
      Amount: "35.000",
      Fitting: "0",
      Line_Status: "Closed",
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
          Cancelled Orders
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={toggleSidebar}
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
        item
        width={"100%"}
        height={"100%"}
        border={"1px silver solid"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "scroll",
              paddingLeft: 0.5,
              paddingRight: 0.5,
              overflowX: "hidden",
              typography: "body1",
              "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
                padding: 0,
              },

              "& .MuiTabs-flexContainer ": {
                justifyContent: "space-around",
              },
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
              <SearchInputField
              // onChange={onHandleSearch}
              // value={searchText}
              // onClickClear={triggeronClickClearSearchTwice}
              />
            </Grid>
            {/* <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={searchText === "" ? card.length : filteredCard.length}
              next={fetchMoreData}
              hasMore={hasMoreOpen}
              loader={<BeatLoader />}
              scrollableTarget="ListScroll"
              endMessage={<Typography>No More Records</Typography>}
            >
              {(filteredCard.length === 0 ? card : filteredCard).map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.VehicleMakeId}
                  subtitle={item.VehicleModeId}
                  description={item.VehicleMfgYear}
                  onClick={() => {
                    setVehicleListData(item.DocEntry);
                  }}
                />
               ))} 
            </InfiniteScroll> */}
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
        // onSubmit={hadlesubmit}
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
              Sales Order Details
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
                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputTextSearchButton
                        label="SR NO"
                        disabled={true}
                        // onClick={handleInputChange}
                        value={""}
                        // onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="CUSTOMER ID" />
                    </Grid>
                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="CUSTOMER NAME" />
                    </Grid>
                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="JOB WORK AT" />
                    </Grid>

                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="QUATATION NO" />
                    </Grid>
                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputNumberFields label="CONTACT NO" />
                    </Grid>
                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="CUSTOMER BALANCE" />
                    </Grid>

                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputDatePickerFields
                        label="QUAT DATE"
                        value={dayjs(undefined)}
                      />
                    </Grid>
                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="STATUS" value="CANCELLED" />
                    </Grid>
                    <Grid item md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputTextAreaFields label="JOB WORK DETAILS" />
                    </Grid>
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
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="SALES HISTORY" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="DISC(%)" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="DUE AMT" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="SPECIAL DISC(%)" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="DOCUMENT AMT" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="ITEM" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="DESIRED DISCOUNT" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="PAID AMT" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="NET ITEM AMT" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="GROSS ITEM AMT" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="ADV AMT" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="SPECIAL DISC(%)" />
                    </Grid>
                    <Grid item sm={3} md={4} lg={2} xs={6} textAlign={"center"}>
                      <SmallInputFields label="SERVICES & INSURNACE" />
                    </Grid>
                    <Grid
                      item
                      sm={3}
                      md={4}
                      lg={2}
                      xs={6}
                      textAlign={"center"}
                      alignSelf={"end"}
                    >
                      <InputTextAreaFields label="REMARK" />
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
              >
                SAVE
              </Button>

              <Button variant="contained" color="primary">
                PRINT
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
    </>
  );
}
