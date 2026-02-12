import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { TabContext, TabPanel } from "@mui/lab";
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
import React, { useState } from "react";

import SearchInputField from "../Components/SearchInputField";

import MenuIcon from "@mui/icons-material/Menu";

import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import {
  InputDatePickerFields,
  InputFields,
  InputTextAreaFields,
  InputTextSearchButton,
} from "../Components/formComponents";

export default function MaterialRequest() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [OpenPage, setOpenPage] = useState(0);
  // const [ClosePage, setClosePage] = useState(0);
  // const [DownPayment, setDownPayment] = useState([]);
  // const [CloseDownPayment, setCloseDownPayment] = useState([]);
  // const [HasMoreOpen, setHasMoreOpen] = useState(true);
  // const [HasMoreClose, setHasMoreClose] = useState(true);
  // const [Olddata, SetOldData] = useState();
  // const [formData, setFormData] = useState(InitialObj);

  // Function to close the dialog

  const theme = useTheme();


  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const onHandleSearch = () => {
    alert("");
  };

  // const handleTabChange = (event, newValue) => {
  //   settabvalue(newValue);
  // };
  // const getAllOpenList = useCallback(async () => {
  //   try {
  //     const openResponse = await get(`/DownPayment/pages/${OpenPage}/1`);

  //     console.log("Open Page Response:", openResponse.values);

  //     if (openResponse.success) {
  //       const newOpenValues = openResponse.values || [];
  //       setDownPayment((prev) => [...prev, ...newOpenValues]);
  //       setHasMoreOpen(newOpenValues.length > 0);
  //     } else {
  //       alert("Error fetching open data.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setHasMoreOpen(false);
  //   }
  // }, [OpenPage]);

  // const getAllCloseList = useCallback(async () => {
  //   try {
  //     const closeResponse = await get(`/DownPayment/pages/${ClosePage}/0`);
  //     console.log("Close Page Response--------:", closeResponse.values.length);
  //     if (closeResponse.success) {
  //       const newCloseValues = closeResponse.values || [];
  //       setCloseDownPayment((prev) => [...prev, ...newCloseValues]);
  //       setHasMoreClose(newCloseValues.length > 0);
  //     } else {
  //       alert("Error fetching close data.");
  //     }
  //   } catch (error) {
  //     setHasMoreClose(false);
  //   }
  // }, [ClosePage]);

  // useEffect(() => {
  //   getAllOpenList();
  //   getAllCloseList();
  // }, [getAllOpenList, getAllCloseList]);

  // const fetchMoreOpenListData = useCallback(() => {
  //   if (HasMoreOpen) {
  //     setOpenPage((prevPage) => prevPage + 1);
  //   }
  // }, [HasMoreOpen]);

  // const fetchMoreCloseListData = useCallback(() => {
  //   if (HasMoreClose) {
  //     setClosePage((prevClose) => prevClose + 1);
  //   }
  // }, [HasMoreClose]);

  // const oldData = async (DocEntry) => {
  //   try {
  //     const res = await get(`/DownPayment/${DocEntry}`);
  //     console.log(res.values);
  //     setFormData(res.values[0]); // Update formData state
  //   } catch (error) {
  //     console.error("Failed to fetch data:", error);
  //   }
  // };

  // const ClearFormData = () => {
  //   setFormData(InitialObj);
  // };

  function hadlesubmit(e) {
    e.preventDefault();
    // console.log(formData);
  }

  // const handleChange = (event) => {
  //   const { name, value } = event.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
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
      field: "WHS",
      headerName: "	WHS",
      width: 100,
      editable: true,
    },
    {
      field: "Avail_Qty",
      headerName: "Avail Qty",
      width: 100,
      editable: true,
    },
    {
      field: "Iss_Qty",
      headerName: "Iss Qty",
      width: 100,
      editable: true,
    },
    {
      field: "Appoint_Qty	",
      headerName: "Appoint Qty	",
      width: 100,
      editable: true,
    },
    {
      field: "Quantity",
      headerName: "Quantity",
      width: 100,
      editable: true,
    },
  ];

  const rows = [
    {
      id: 1,
      Item_Code: "TJMSEATCOVER",
      Item_Description: "TJM SEAT COVERS PR",
      WHS: "100",
      Avail_Qty: "3",
      Iss_Qty: "3",
      Appoint_Qty: "0",
      Quantity: "5",
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
          Material Request Documents
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
                    backgroundColor: "#F5F6FA",}}
                >
                  <SearchInputField onChange={onHandleSearch} />
                </Grid>
                {/* <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={DownPayment}
                  next={fetchMoreOpenListData}
                  hasMore={HasMoreOpen}
                  loader={<BeatLoader />}
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
                   backgroundColor: "#F5F6FA",}}
                >
                  <SearchInputField onChange={onHandleSearch} />
                </Grid>
                {/* <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={CloseDownPayment.length}
                  next={fetchMoreCloseListData}
                  hasMore={HasMoreClose}
                  loader={<BeatLoader />}
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
              Material Request Details
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
                    <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputTextSearchButton
                        label="INWARD NO"
                        // onClick={handleInputChange}
                        value={""}
                        // onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputDatePickerFields
                        label="REQUEST DATE"
                        value={dayjs(undefined)}
                      />
                    </Grid>
                    <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="JOB WORK AT" />
                    </Grid>
                    <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="REGISTRATION NO" />
                    </Grid>
                    <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="SR NO" />
                    </Grid>
                    <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputTextAreaFields label="JOB WORK DETAILS" />
                    </Grid>
                    <Grid item sm={6} md={6} lg={4} xs={12} textAlign={"center"}>
                      <InputFields label="REQUEST NO" />
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
                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <InputFields label="TOTAL ITEMS" />
                    </Grid>

                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <InputFields label="REQUESTED BY" value="" />
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
              <Button variant="contained" sx={{color:'white'}} color="success">
                SAVE
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
