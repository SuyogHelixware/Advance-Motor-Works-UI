import React, { useState } from "react";

import {
  Box,
  Button,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
// import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerFields,
  InputTextAreaFields,
  InputTextField,
  InputTextSearchField,
} from "../Components/formComponents";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

import SearchInputField from "../Components/SearchInputField";

// import MenuOpenIcon from "@mui/icons-material/MenuOpen";

import { DataGrid } from "@mui/x-data-grid";
import SearchModel from "../Components/SearchModel";
import { useTheme } from "@mui/material/styles";
import { TabContext, TabPanel } from "@mui/lab";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";

export default function IssueMaterial() {
  const theme = useTheme();
  const [openPosts, ] = useState([]); // State for Open posts
  const [openSearchPosts, ] = useState([]); // State for Open posts
  const [closeSearchPosts, ] = useState([]); // State for Open posts
  const [closedPosts, ] = useState([]);
  const [searchTextClose,]=useState([])
  // const [openPage, setOpenPage] = useState(0); // Pagination for Open posts
  // const [closePage, setClosePage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [hasMoreOpen, ] = useState(true);
  // const [hasMoreClose, setHasMoreClose] = useState(true);
  const [searchTextOpen, ] = useState("");
  const [searchTextGetListForCreate, ] =
    useState("");
  const [getListData, ] = useState([]);
  const [getListSearchData, ] = useState([]); // State for Open posts
  const [hasMoreGetListForCreate, ] = useState(true);
  // const [getListPage, setGetListPage] = useState(0);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  // data grid Table

  const columns = [
    {
      field: "Item Code",
      headerName: "Item Code",
      width: 140,
      editable: true,
      sortable: false,
    },
    {
      field: "Description",
      headerName: "Description",
      width: 140,
      editable: true,
      sortable: false,
    },
    {
      field: "From WHS",
      headerName: "From WHS",
      width: 140,
      editable: true,
      sortable: false,
    },

    {
      field: "Qty	",
      headerName: "Qty",
      width: 140,
      editable: true,
      sortable: false,
    },
    {
      field: "status",
      headerName: "status	",
      width: 140,
      editable: true,
      sortable: false,
    },
    {
      field: "Work Station",
      headerName: "Work Station	",
      width: 140,
      editable: true,
      sortable: false,
    },
    {
      field: "Technician",
      headerName: "Technician",
      width: 140,
      editable: true,
      sortable: false,
    },
    {
      field: "Action",
      headerName: "Action	",
      width: 110,
      editable: true,
      sortable: false,
      renderCell: (row) => (
        <IconButton>
          <RemoveCircleIcon sx={{ color: "red" }} />
        </IconButton>
      ),
    },
  ];

  const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
    { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
    { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  ];

  // const [drawerOpen, setDrawerOpen] = useState(false);

  // const toggleDrawer = () => {
  //   setDrawerOpen(!drawerOpen);
  // };

  // const onHandleSearch = () => {
  //   alert();
  // };
  const openDialog = () => {
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const { control, } = useForm({
    //defaultValues: initialFormData,
  });
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
        // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
          Job Card List
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
        item
        width={"100%"}
        height={"100%"}
        border={"1px silver solid"}
       // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
                <Tab value="0" label="Open" />
                <Tab value="1" label="Closed" />
              </Tabs>
              <TabPanel
                value={"0"}
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
                  <SearchInputField
                    //  onChange={onHandleSearchOpen}
                    value={searchTextOpen}
                    //   onClickClear={triggeronClickClearOpenSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={
                    searchTextOpen === ""
                      ? openPosts.length
                      : openSearchPosts.length
                  }
                  //  next={fetchMoreOpenListData}
                  hasMore={hasMoreOpen}
                  loader={<BeatLoader 
                    color={theme.palette.mode === "light" ? "black" : "white"}
                  />}
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {(openSearchPosts.length === 0
                    ? openPosts
                    : openSearchPosts
                  ).map((item) => (
                    <CardComponent
                      key={item.DocNum}
                      title={item.CardName}
                      subtitle={item.RequestNo}
                      description={item.PhoneNumber1}
                      onClick={() => {
                        //  setOldOpenListData(item.DocEntry);
                      }}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
              <TabPanel
                value={"1"}
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
                  <SearchInputField
                    //  onChange={getCloseSearchList}
                    // value={searchTextClose}
                    // onClickClear={triggeronClickClearCloseSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={
                    searchTextClose === ""
                      ? closedPosts.length
                      : closeSearchPosts.length
                  }
                  //next={fetchMoreCloseListData}
                  //hasMore={hasMoreClose}
                  loader={<BeatLoader 
                    color={theme.palette.mode === "light" ? "black" : "white"}
                  />}
                  scrollableTarget="ListScrollClosed"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {(closeSearchPosts.length === 0
                    ? closedPosts
                    : closeSearchPosts
                  ).map((item) => (
                    <CardComponent
                      key={item.DocNum}
                      title={item.CardName}
                      subtitle={item.RequestNo}
                      description={item.PhoneNumber1}
                      onClick={() => {}}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );
  //const [age, setAge] = React.useState("");

  // const handleChange = (event) => {
  //   setAge(event.target.value);
  // };

  return (
    <>
      <SearchModel
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onCancel={handleCloseDialog}
        title="Select Request"
        // onChange={onHandleSearchGetListForCreate}
        value={searchTextGetListForCreate}
        //   onClickClear={triggerClearSearchTwice}
        cardData={
          <>
            <InfiniteScroll
              dataLength={
                getListData.length === 0
                  ? getListSearchData.length
                  : getListData.length
              }
              // next={fetchMoreGetListForCreate}
              hasMore={hasMoreGetListForCreate}
              loader={
                <BeatLoader
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                />
              }
              scrollableTarget="getListForCreateScroll"
              endMessage={
                <Typography textAlign={"center"}>No More Records</Typography>
              }
            >
              {(getListSearchData.length === 0
                ? getListData
                : getListSearchData
              ).map((item) => (
                <CardComponent
                  key={item.DocNum}
                  title={item.DocNum}
                  subtitle={item.CardName}
                  description={item.PhoneNumber1}
                  onClick={() => {}}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        // onSubmit={handleSubmit(handleSubmitForm)}
      >
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

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={9}
          position="relative"
          // onClick={handleOnSubmit}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{
              position: "absolute",
              left: "10px",
              display: { lg: "none", xs: "block" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            // onClick={ClearForm}
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
              Job Card Entry Details
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
              textTransform={'uppercase'}
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
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign="center">
                    <Controller
                      name="So No"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchField
                          label="So No"
                          type="text"
                          onClick={openDialog}
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputDatePickerFields label="REQ Date" name="Date" value={dayjs(undefined)} />
                  </Grid>
                  

                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField
                      label="Job Card No"
                      name="Job Card No "
                      value=""
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField
                      label="Job Work At"
                      name="Job Work At "
                      value=""
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField label="Inward No" name="Inward No" value="" />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField
                      label="Rgistration No"
                      name="Rgistration No"
                      value=""
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField label="REQ No" name="REQ No" value="" />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField
                      label="Total Height"
                      name="Total Height"
                      value=""
                    />
                  </Grid>

                  {/* <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"} >
                   <InputDatePickerFields label="Appointment Date" name="Date" />
                 </Grid> */}

                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField label="Before LH" name="Before LH" value="" />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField label="After LH" name="After LH" value="" />
                  </Grid>

                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField label="Before RH" name="Before RH" value="" />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextField label="After RH" name="After RH" value="" />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={1}
                  >
                    <Button variant="contained" sx={{ maxWidth: 220 }}>
                      QC
                    </Button>
                  </Grid>

                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextAreaFields
                      label="Job Work Details"
                      name="Job Work Details"
                      value=""
                    />
                  </Grid>
                  <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                    <InputTextAreaFields
                      label="Remarks"
                      name="Remarks"
                      value=""
                    />
                  </Grid>
                </Grid>

                <Grid
                  container
                  mt={1}
                  sx={{
                    overflow: "auto",
                    width: "100%",
                    height: "20%",
                  }}
                >
                  {/* Data grid table start */}
                  {/* Data grid table start */}
                  <DataGrid
                    className="datagrid-style"
                    rows={rows}
                    columns={columns}
                    columnHeaderHeight={35}
                    rowHeight={45}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: rows.length,
                        },
                      },
                    }}
                    hideFooter
                    disableRowSelectionOnClick
                    sx={{
                      backgroundColor:
                      theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                      "& .MuiDataGrid-cell": {
                        border: "none",
                        borderBlock: "none",
                      },
                      "& .MuiDataGrid-cell:focus": {
                        outline: "none",
                      },
                      "& .MuiDataGrid-cell.Mui-selected": {},
                    }}
                  />
                </Grid>
                <Grid container>
                  <Grid item sm={6} md={6} lg={6} xs={12} textAlign={"center"}>
                    <InputTextField
                      label="Job Work BY"
                      name="Job Work BY"
                      value=""
                    />
                  </Grid>

                  <Grid item sm={6} md={6} lg={6} xs={12} textAlign={"center"}>
                    <InputDatePickerFields label=" Date" name="Date" value={dayjs(undefined)} />
                  </Grid>
                  <Grid item sm={6} md={6} lg={6} xs={12} textAlign={"center"} >
                    <InputDatePickerFields
                      label="JOB-WORK DONE ON"
                      name="Date"
                      value={dayjs(undefined)}
                    />
                  </Grid>

                  <Grid item sm={6} md={6} lg={6} xs={12} textAlign={"center"}>
                    <InputTextField
                      label=" Time "
                      name=" Time "
                      value=""
                    />
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
              }}
            >
              <Button
                variant="contained"
                sx={{ color: "white" }}
                color="success"
                // type="submit"
              >
                Save
              </Button>
              <Button variant="contained" color="primary" disabled>
                CLOSE JOB CARD
              </Button>
              <Button variant="contained" color="primary">
                PRINT
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
