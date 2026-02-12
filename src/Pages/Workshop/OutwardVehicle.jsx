import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerFields,
  InputTextAreaFields,
  InputTextField,
  InputTextSearchField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import { BeatLoader } from "react-spinners";

import SearchModel from "../Components/SearchModel";
import { useTheme } from "@mui/material/styles";
import { TabContext, TabPanel } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import InfiniteScroll from "react-infinite-scroll-component";
import MenuIcon from "@mui/icons-material/Menu";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";

export default function IssueMaterial() {
  // modal
  const theme = useTheme();
  const [openPosts] = useState([]); // State for Open posts
  const [openSearchPosts] = useState([]); // State for Open posts
  const [closeSearchPosts] = useState([]); // State for Open posts
  const [closedPosts] = useState([]);
  //const [openPage, setOpenPage] = useState(0); // Pagination for Open posts
  // const [closePage, setClosePage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [hasMoreOpen, setHasMoreOpen] = useState(true);
  // const [hasMoreClose, setHasMoreClose] = useState(true);
  const [searchTextOpen] = useState("");
  const [searchTextClose] = useState("");
  const [searchTextGetListForCreate] = useState("");
  const [getListData] = useState([]);
  const [getListSearchData] = useState([]); // State for Open posts
  const [hasMoreGetListForCreate] = useState(true);
  //const [getListPage, setGetListPage] = useState(0);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const { control } = useForm({
    //defaultValues: initialFormData,
  });

  const [tab, settab] = useState("0");

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  // const [drawerOpen, setDrawerOpen] = useState(false);
  const signatureRef = useRef(null);

  // const toggleDrawer = () => {
  //   //setDrawerOpen(!drawerOpen);
  // };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  // const onHandleSearch = () => {
  //   alert();
  // };

  const clearSignature = () => {
    signatureRef.current.clear();
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
          Outward Vehicle List
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
                    // onChange={onHandleSearchOpen}
                    value={searchTextOpen}
                    //onClickClear={triggeronClickClearOpenSearchTwice}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center" }}
                  dataLength={
                    searchTextOpen === ""
                      ? openPosts.length
                      : openSearchPosts.length
                  }
                  // next={fetchMoreOpenListData}
                  //  hasMore={hasMoreOpen}
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
                        //setOldOpenListData(item.DocEntry);
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
                    // onChange={getCloseSearchList}
                    value={searchTextClose}
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
                  //  next={fetchMoreCloseListData}
                  // hasMore={hasMoreClose}
                  loader={
                    <BeatLoader
                      sx={{
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "#F5F6FA"
                            : "#080D2B",
                      }}
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
                  color={theme.palette.mode === "light" ? "black" : "white"}
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
          component="form"
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
            width="100%"
            py={0.5}
            alignItems="center"
            border="1px solid silver"
            borderBottom="none"
          >
            <Typography
              textAlign={"center"}
              alignContent={"center"}
              height={"100%"}
            >
              Outward Vehicle
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
              textTransform={"uppercase"}
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
                <Grid container >
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={0}
                  >
                    <Controller
                      name="So No"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextSearchField
                          label="So No"
                          type="text"
                          onClick={openDialog}
                          {...field}
                          error={!!error} 
                          helperText={error ? error.message : null} 
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={0}
                  >
                    <InputTextField
                      label="CONTACT NO"
                      name="CONTACT NO"
                      value=""
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={0}
                  >
                    <InputTextField
                      label="Job Work At"
                      name="Job Work At "
                      value=""
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={0}
                  >
                    <InputTextField
                      label="REGISTRATION NO"
                      name="REGISTRATION NO "
                      value=""
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={0}
                  >
                    <InputTextField
                      label="INVOICE No"
                      name="INVOICE No"
                      value=""
                    />
                  </Grid>

                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={0}
                  >
                    <InputTextField
                      label="CUSTOMER NAME"
                      name="CUSTOMER NAME"
                      value=""
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={0}
                  >
                    <InputTextAreaFields
                      label="JOB WORK DETAILS"
                      name="JOB WORK DETAILS"
                      value=""
                    />
                  </Grid>
                </Grid>
                <hr />
                <Grid container>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={6}
                    xs={12}
                    textAlign={"center"}
                    mt={1}
                  >
                    <InputTextField
                      label="INWARD NO"
                      name="INWARD NO"
                      value=""
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={6}
                    xs={12}
                    textAlign={"center"}
                    mt={1}
                  >
                    <InputDatePickerFields
                      label="INWARD Date"
                      name="Date"
                      value={dayjs(undefined)}
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={6}
                    xs={12}
                    textAlign={"center"}
                    mt={1}
                  >
                    <InputTextField
                      label="INWARD TIME"
                      name="INWARD TIME"
                      value=""
                    />
                  </Grid>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={6}
                    xs={12}
                    textAlign={"center"}
                    mt={1}
                  >
                    <InputTextField
                      label="JOB CARD NO"
                      name="JOB CARD NO"
                      value=""
                    />
                  </Grid>
                </Grid>
                <hr />
                <Grid container>
                  <Grid
                    item
                    sm={6}
                    md={6}
                    lg={4}
                    xs={12}
                    textAlign={"center"}
                    mt={1}
                  >
                    <InputTextField
                      label="outward NO"
                      name="outward NO"
                      value=""
                    />
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
                    <InputDatePickerFields
                      label="outward Date"
                      name="Date"
                      value={dayjs(undefined)}
                    />
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
                    <InputTextField
                      label="outward TIME"
                      name="outward TIME"
                      value=""
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  columnSpacing={2}
                  width="100%"
                  px={3}
                  pt={3}
                >
                  <Grid item width="100%" textAlign="center">
                    <label>Signature</label>&nbsp;
                    <IconButton size="small" onClick={clearSignature}>
                      X
                    </IconButton>
                    <FormControl fullWidth style={{ marginBottom: 3 }}>
                      <SignatureCanvas
                        ref={signatureRef}
                        penColor="black"
                        canvasProps={{
                          style: {
                            background: "white",
                            height: 100,
                          },
                        }}
                      />
                    </FormControl>
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
              >
                Save
              </Button>
              <Button
                sx={{ justifyItem: "left" }}
                variant="contained"
                color="primary"
              >
                SHEET
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
