import React, { useState } from "react";

import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CardComponent from "../Components/CardComponent";

import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchInputField from "../Components/SearchInputField";

import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { TabContext, TabPanel } from "@mui/lab";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import {
  InputDatePickerFields,
  InputFields,
  InputSelectFields,
  InputTextSearchButton,
  SmallInputFields,
} from "../Components/formComponents";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
const columns = [
  { field: "DOC_NUM", headerName: "Item No", width: 100 },
  { field: "DOC_DESC", headerName: "Item DESC", width: 100 },

  { field: "qty", headerName: "QTY", width: 100 },
  { field: "WEIGHT", headerName: "WEIGHT", width: 100 },
  { field: "VOLUME", headerName: "VOLUME", width: 100 },

  { field: "doc_price", headerName: "BESE DOC PRICE", width: 100 },

  { field: "doc_value", headerName: "BESE DOC VALUE", width: 100 },

  { field: "custom_custom", headerName: "PROJ.CUST.", width: 100 },
  { field: "DUTY_VAL", headerName: "DUTY VAL", width: 100 },

  { field: "custom_value", headerName: "CUSTOMS VALUE", width: 100 },

  { field: "expenditure", headerName: "Expenditure", width: 100 },
  {
    field: "alloc_cost",
    headerName: "ALLOC. COSTS VAL.",
    type: "number",
    width: 150,
  },
  { field: "whse_price", headerName: "WHSE PRICE", width: 100 },
  { field: "total", headerName: "Total", width: 100 },
  { field: "total_cost", headerName: "Total Cost", width: 100 },
  { field: "whse", headerName: "WHSE  ", width: 100 },

  { field: "fob", headerName: "FOB & Included Cost", width: 100 },
  { field: "uom_code", headerName: "UoM CODE", width: 100 },
];

const rows = [];

export default function LandedCost() {
  const [tabvalue, settabvalue] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileData, setFileData] = useState([]);
  const theme = useTheme();
  const [tab, settab] = useState("0");
  const perms = usePermissions(139);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTextOpen, setSearchTextOpen] = useState("");
  const [openPosts, setOpenPosts] = useState([]);
  const [openSearchPosts, setOpenSearchPosts] = useState([]); // State for Open posts
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [hasMoreClose, setHasMoreClose] = useState(true);
  const [searchTextClose, setSearchTextClose] = useState("");
  const [closedPosts, setClosedPosts] = useState([]);
  const [closeSearchPosts, setCloseSearchPosts] = useState([]); // State for Open posts
  const [openPage, setOpenPage] = useState(0); // Pagination for Open posts
  const [closePage, setClosePage] = useState(0);

  const { reset } = useForm({
    // defaultValues: initialFormData,
  });
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
  };
  const handleInputChange = () => {
    setIsDialogOpen(true); // Open the dialog when input changes
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    console.log(event.target.files.url);

    const validFileTypes = ["image/jpeg", "image/png", "application/pdf"];
    let invalidFiles = [];

    files.forEach((file) => {
      if (!validFileTypes.includes(file.type)) {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      // alert(`Invalid file types: ${invalidFiles.join(", ")}. Please upload JPG, PNG, or PDF files.`);
      Swal.fire({
        position: "center",
        icon: "warning",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        title: "Choose! Please upload JPG, PNG, or PDF files",
        customClass: {
          popup: "custom-swal-popup", // Add a custom class to style it
        },
        showClass: {
          popup: `animate__animated animate__fadeInDown animate__faster`,
        },
        hideClass: {
          popup: `animate__animated animate__fadeOutUp animate__faster`,
        },
      });

      return; // Prevent further action if invalid files found
    }

    const updatedFileData = files.map((file) => ({ file }));
    setFileData((prevFileData) => [...prevFileData, ...updatedFileData]);

    console.log("Files are valid:", files);
  };
  const openFileinNewTab = (data) => {
    console.log(data);
    const url = URL.createObjectURL(data.file);

    // Open the file in a new window/tab
    window.open(url, "_blank");
  };
  const handleRemove = (indexToRemove) => {
    const updatedFileData = fileData.filter(
      (_, index) => index !== indexToRemove,
    );
    setFileData(updatedFileData);
  };
  // -------------------------------------------------------------------
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  const onHandleSearchOpen = (event) => {
    const searchText = event.target.value;
    setOpenSearchPosts([]);
    setSearchTextOpen(searchText);
    setOpenPage(0);
    if (searchText !== "") {
      axios
        .request({
          // method: "get",
          // url: `${BASE_URL}`,
          // headers: {
          //   "Content-Type": "application/json",
          // },
        })
        .then((response) => {
          setOpenSearchPosts(response.data.values);

          if (response.data.values.length === 20) {
            setHasMoreOpen(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const getCloseSearchList = (event) => {
    const searchText = event.target.value;
    setCloseSearchPosts([]);
    setSearchTextClose(searchText);
    setClosePage(0);
    if (searchText !== "") {
      axios
        .request({
          // method: "get",
          // url: `${BASE_URL}`,
          // headers: {
          //   "Content-Type": "application/json",
          // },
        })
        .then((response) => {
          setCloseSearchPosts(response.data.values);

          if (response.data.values.length < 20) {
            setHasMoreClose(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const triggeronClickClearCloseSearchTwice = () => {
    onClickClearCloseSearch();
    setTimeout(() => {
      onClickClearCloseSearch();
    }, 10);
  };
  const onClickClearCloseSearch = () => {
    setSearchTextClose("");
    setCloseSearchPosts([]);
    setClosedPosts([]);
    setClosePage(0);
    setHasMoreClose(true);
    setTimeout(() => {
      getAllCloseList();
    }, 100);
  };

  const getAllCloseList = () => {
    axios
      .request({
        // method: "get",
        // url: `${BASE_URL}`,
        // headers: {
        //   "Content-Type": "application/json",
        // },
      })
      .then((response) => {
        setClosedPosts(response.data.values);
        if (response.data.values.length < 0) {
          setHasMoreClose(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const setOldOpenListData = (DocEntry) => {
    if (!DocEntry) {
      return;
    }
    axios
      // .get(`${BASE_URL}`)
      .then((response) => {
        const data = response.data.values[0];
        reset(data);
        // setSidebarOpen(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };
  const onClickClearOpenSearch = () => {
    setSearchTextOpen("");
    setOpenSearchPosts([]);
    setOpenPosts([]);
    setOpenPage(0);
    setHasMoreOpen(true);
    setTimeout(() => {
      getAllOpenList();
    }, 100);
  };
  const triggeronClickClearOpenSearchTwice = () => {
    onClickClearOpenSearch();
    setTimeout(() => {
      onClickClearOpenSearch();
    }, 10);
  };
  const getAllOpenList = () => {
    axios
      .request({
        // method: "get",
        // url: `${BASE_URL}`,
        // headers: {
        //   "Content-Type": "application/json",
        // },
      })
      .then((response) => {
        setOpenPosts(response.data.values);

        if (response.data.values.length < 20) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const fetchMoreOpenListData = () => {
    if (searchTextOpen === "") {
      const page = openPage + 1;
      axios
        .request({
          // method: "get",
          // url: `${BASE_URL}`,
          // headers: {
          //   "Content-Type": "application/json",
          // },
        })
        .then((response) => {
          setOpenPosts((prevPosts) => [...prevPosts, ...response.data.values]);
          setOpenPage(page);
          if (response.data.values.length === 0) {
            setHasMoreOpen(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      const page = openPage + 1;
      axios
        .request({
          // method: "get",
          // url: `${BASE_URL}`,
          // headers: {
          //   "Content-Type": "application/json",
          // },
        })
        .then((response) => {
          setOpenSearchPosts((prevPosts) => [
            ...prevPosts,
            ...response.data.values,
          ]);
          setOpenPage(page);
          if (response.data.values.length === 0) {
            setHasMoreOpen(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const fetchMoreCloseListData = () => {
    if (searchTextClose === "") {
      const page = closePage + 1;
      axios
        .request({
          // method: "get",
          // url: `${BASE_URL}`,
          // headers: {
          //   "Content-Type": "application/json",
          // },
        })
        .then((response) => {
          setClosedPosts((prevPosts) => [
            ...prevPosts,
            ...response.data.values,
          ]);
          setClosePage(page);
          if (response.data.values.length === 0) {
            setHasMoreClose(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      const page = closePage + 1;
      axios
        .request({
          // method: "get",
          // url: `${BASE_URL}`,
          // headers: {
          //   "Content-Type": "application/json",
          // },
        })
        .then((response) => {
          setCloseSearchPosts((prevPosts) => [
            ...prevPosts,
            ...response.data.values,
          ]);
          setClosePage(page);
          if (response.data.values.length === 0) {
            setHasMoreClose(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const { control } = useForm({});
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
          Landed Cost
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
                    onChange={onHandleSearchOpen}
                    value={searchTextOpen}
                    onClickClear={triggeronClickClearOpenSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={
                    searchTextOpen === ""
                      ? openPosts.length
                      : openSearchPosts.length
                  }
                  next={fetchMoreOpenListData}
                  hasMore={hasMoreOpen}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
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
                        setOldOpenListData(item.DocEntry);
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
                    onChange={getCloseSearchList}
                    value={searchTextClose}
                    onClickClear={triggeronClickClearCloseSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={
                    searchTextClose === ""
                      ? closedPosts.length
                      : closeSearchPosts.length
                  }
                  next={fetchMoreCloseListData}
                  hasMore={hasMoreClose}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
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

  return (
    <>
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
      >
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={6}
          lg={3}
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
          component="form"
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
            // onClick={toggleDrawer}

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
              Landed Cost
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
              width={"100%"}
            >
              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <InputTextSearchButton
                      label="VENDOR CODE"
                      onClick={handleInputChange}
                      value={""}
                      onChange={handleInputChange}
                    />

                    <SearchModel
                      open={isDialogOpen}
                      onClose={handleCloseDialog}
                      onCancel={handleCloseDialog}
                      title="SELECT VENDOR"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <InputFields label="VENDOR NAME" name="" id="" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <InputFields label="DOC NO." name="" id="" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <InputDatePickerFields label="POSTING DATE " />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <InputDatePickerFields label="DUE DATE " />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Currency"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectFields
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="CURRENCY"
                          data={[
                            { key: "1", value: "Local Currency " },
                            { key: "2", value: "System Currency" },
                            { key: "3", value: "BP Currency" },
                          ]}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                  ></Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    textAlign={"center"}
                  ></Grid>
                  <Grid item xs={12} sm={6} md={4} lg={4} textAlign={"center"}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="CLOSE DOCUMENT"
                      sx={{
                        paddingLeft: 1,
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container width={"100%"}>
                  <Grid
                    container
                    item
                    width="100%"
                    m={1}
                    border="1px solid grey"
                    flexDirection="column"
                  >
                    <Tabs
                      sx={{ width: "100%" }}
                      value={tabvalue}
                      onChange={handleTabChange}
                      aria-label="disabled tabs example"
                    >
                      <Tab value={0} label="ITEM" />
                      <Tab value={1} label="COST" />
                      <Tab value={2} label="Attachments" />
                    </Tabs>
                    <Divider />

                    {tabvalue === 0 && (
                      <Grid
                        container
                        item
                        style={{ width: "100%", overflow: "hidden" }}
                      >
                        <DataGrid
                          className="datagrid-style"
                          sx={{
                            "& .MuiDataGrid-columnHeaders": {
                              backgroundColor: "red",
                              fontWeight: "bold",
                            },
                          }}
                          rows={rows}
                          hideFooter
                          columns={columns}
                          initialState={{
                            pagination: {
                              paginationModel: {
                                pageSize: 1,
                              },
                            },
                          }}
                          pageSizeOptions={[3]}
                        />
                      </Grid>
                    )}

                    {tabvalue === 1 && (
                      <Grid container item spacing={1}>
                        {[
                          "LANDED COSTS",
                          "ALLOCATION BY",
                          "AMOUNT",
                          "FACTOR",
                        ].map((label, index) => (
                          <Grid item xs={12} sm={6} md={6} key={index}>
                            <InputFields label={label} />
                          </Grid>
                        ))}
                        <Grid item xs={12} sm={6} md={6}>
                          <FormControlLabel
                            control={<Checkbox defaultChecked />}
                            label="INCLUDE FOR CUSTOMS"
                            sx={{ paddingLeft: 1 }}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {tabvalue === 2 && (
                      <Grid container>
                        <Grid item xs={12}>
                          <input
                            type="file"
                            id="file-upload"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                          />
                          <label
                            htmlFor="file-upload"
                            style={{
                              marginLeft: 5,
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "5px 10px",
                              backgroundColor: "#2E7D32",
                              color: "#fff",
                              borderRadius: "5px",
                              cursor: "pointer",
                              transition: "background-color 0.3s",
                            }}
                          >
                            <CloudUploadIcon
                              sx={{
                                fontSize: "20px",
                                marginRight: "5px",
                                // color: "#fff",
                              }}
                            />
                            Upload File
                          </label>
                          <TableContainer
                            sx={{
                              margin: "7px",
                              maxHeight: { xs: 150, sm: 200 },
                              width: { xs: "100%", sm: "80%" },
                              overflowY: "auto",
                            }}
                          >
                            {fileData.length > 0 && (
                              <Table
                                sx={{ minWidth: 500 }}
                                aria-label="file data table"
                                stickyHeader
                              >
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Selected File Name</TableCell>
                                    <TableCell>Action</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {fileData.map((data, index) => (
                                    <TableRow
                                      key={index}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <TableCell
                                        component="th"
                                        scope="row"
                                        onClick={() => openFileinNewTab(data)}
                                      >
                                        {data.file.name}
                                      </TableCell>
                                      <TableCell>
                                        <RemoveCircleOutlineIcon
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(index);
                                          }}
                                          style={{ cursor: "pointer" }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TableContainer>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>

                  <Grid container>
                    <Grid item xs={6} md={3} lg={3} textAlign={"center"}>
                      <SmallInputFields label="PROJECT DUTY" name="" id="" />
                    </Grid>
                    <Grid item xs={6} md={3} lg={3} textAlign={"center"}>
                      <SmallInputFields label="ACTUAL DUTY" name="" id="" />
                    </Grid>
                    <Grid item xs={6} md={3} lg={3} textAlign={"center"}>
                      <SmallInputFields label="CUSTOMS DATE" name="" id="" />
                    </Grid>
                    <Grid item xs={6} md={3} lg={3} textAlign={"center"}>
                      <SmallInputFields
                        label="TOTAL FREIGHT CHARGE"
                        name=""
                        id=""
                      />
                    </Grid>
                    <Grid item xs={6} md={3} lg={3} textAlign={"center"}>
                      <SmallInputFields label="BEFORE TAX" name="" id="" />
                    </Grid>
                    <Grid item xs={6} md={3} lg={3} textAlign={"center"}>
                      <SmallInputFields label="TOTAL" name="" id="" />
                    </Grid>
                    <Grid item xs={6} md={3} lg={3} textAlign={"center"}>
                      <TextField
                        size="small"
                        label="REMARK"
                        placeholder="REMARK"
                        rows={2}
                        multiline
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={6}
                      textAlign={"center"}
                    >
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label="CUSTOMS AFFECTS INVENTORY"
                        sx={{}}
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
              <Grid item>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ color: "white" }}
                  disabled={!perms.IsAdd || !perms.IsEdit}
                >
                  SAVE
                </Button>
              </Grid>

              <Grid item>
                <Button variant="contained" color="error">
                  {/* <InputFields /> */}CANCEL
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
