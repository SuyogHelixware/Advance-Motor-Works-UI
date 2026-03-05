import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  Modal,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import { DataGrid } from "@mui/x-data-grid";
import SearchInputField from "../Components/SearchInputField";
import {
  InputFields,
  InputSelectTextField,
} from "../Components/formComponents";

export default function HouseBanks() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // const [card, setCard] = useState([]);
  // const [filteredCard, setFilteredCard] = useState([]);
  // const [searchText, setSearchText] = useState("");
  // const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const handleCheckboxChange = (id) => {
    // If the same row is checked, uncheck it, otherwise set the selected row id
    setSelectedRowId((prev) => (prev === id ? null : id));
  };

  const columns = [
    {
      field: "select",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.id === selectedRowId}
          onChange={() => handleCheckboxChange(params.row.id)}
        />
      ),
    },
    { field: "OrderNo", headerName: "BANK CODE", width: 120 },
    { field: "TIME", headerName: "COUNTRY/REGION", width: 100 },
    { field: "RCTNO", headerName: "BRANCH", width: 100 },
    { field: "PhoneNumber1", headerName: "BANK ACCOUNT", width: 100, flex: 1 },
    { field: "PAYMethod", headerName: "IBAN", width: 120 },
    { field: "partsAmt", headerName: "BIC/SWIFT", width: 120 },
  ];

  const rows = [
    {
      id: 1,
      OrderNo: "001",
      TIME: "USA",
      RCTNO: "Branch 1",
      PhoneNumber1: "123456",
      PAYMethod: "IBAN1",
      partsAmt: "BIC1",
    },
    {
      id: 2,
      OrderNo: "002",
      TIME: "Canada",
      RCTNO: "Branch 2",
      PhoneNumber1: "234567",
      PAYMethod: "IBAN2",
      partsAmt: "BIC2",
    },
    {
      id: 3,
      OrderNo: "003",
      TIME: "UK",
      RCTNO: "Branch 3",
      PhoneNumber1: "345678",
      PAYMethod: "IBAN3",
      partsAmt: "BIC3",
    },
    // Add more rows as necessary
  ];

  //   const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const onHandleSearch = () => {
    alert();
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
          House Bank Setup List
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setDrawerOpen(false)}
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
              px: 1,
              overflow: "scroll",
              overflowX: "hidden",
              typography: "body1",
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
                backgroundColor:
                  theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
              }}
            >
              <SearchInputField
                onChange={onHandleSearch}
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
                  title={item.TechnicianName}
                  subtitle={item.DocEntry}
                  // description={item.VehicleMfgYear}
                  onClick={() => {
                    // setDocNumberListData(item.DocEntry);
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
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        // onSubmit={handleSubmit(handleSubmitForm)}
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
            display: { lg: "block", xs: `${drawerOpen ? "block" : "none"}` },
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
            onClick={toggleDrawer}
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
              House Bank Setup
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
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputSelectTextField
                      label="BANK CODE"
                      name="bankcode"
                      value=""
                      data={[
                        { key: "1", value: "1" },
                        { key: "2", value: "2" },
                        { key: "3", value: "3" },
                        { key: "4", value: "4" },
                      ]}
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields
                      label="COUNTRY/REGION"
                      name="country"
                      value=""
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields label="BRANCH" name="branch" value="" />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields label="A/C NO." name="a/c" value="" />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields
                      label="BANK ACCOUNT NAME"
                      name="banka/cname"
                      value=""
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields
                      label="BIC/SWIFT CODE"
                      name="bic/swiftcode"
                      value=""
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields
                      label="CONTROL KEY"
                      name="control-key"
                      value=""
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields
                      label="NEXT CHECK NO."
                      name="nextcheckno"
                      value=""
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputSelectTextField
                      label="G/L ACCOUNT"
                      name="glacc"
                      value=""
                      data={[
                        { key: "1", value: "1" },
                        { key: "2", value: "2" },
                        { key: "3", value: "3" },
                        { key: "4", value: "4" },
                      ]}
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputSelectTextField
                      label="G/L INTERIM ACCOUNT"
                      name="glintacc"
                      value=""
                      data={[
                        { key: "1", value: "1" },
                        { key: "2", value: "2" },
                        { key: "3", value: "3" },
                        { key: "4", value: "4" },
                      ]}
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields label="IBAN" name="iban" value="" />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputSelectTextField
                      label="STREET"
                      name="street"
                      value=""
                      data={[
                        { key: "1", value: "1" },
                        { key: "2", value: "2" },
                        { key: "3", value: "3" },
                        { key: "4", value: "4" },
                      ]}
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields label="STREET NO." name="streetno" value="" />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields label="BLOCK" name="block" value="" />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields label="CITY" name="city" value="" />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputSelectTextField
                      label="COUNTRY"
                      name="cont"
                      value=""
                      data={[
                        { key: "1", value: "1" },
                        { key: "2", value: "2" },
                        { key: "3", value: "3" },
                        { key: "4", value: "4" },
                      ]}
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputSelectTextField
                      label="STATE"
                      name="state"
                      value=""
                      data={[
                        { key: "1", value: "1" },
                        { key: "2", value: "2" },
                        { key: "3", value: "3" },
                        { key: "4", value: "4" },
                      ]}
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields label="ZIP CODE" name="zip-code" value="" />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputSelectTextField
                      label="PAPER TYPE"
                      name="paper-type"
                      value=""
                      data={[
                        { key: "1", value: "1" },
                        { key: "2", value: "2" },
                        { key: "3", value: "3" },
                        { key: "4", value: "4" },
                      ]}
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputSelectTextField
                      label="TEMPLATE NAME"
                      name="temp-name"
                      value=""
                      data={[
                        { key: "1", value: "1" },
                        { key: "2", value: "2" },
                        { key: "3", value: "3" },
                        { key: "4", value: "4" },
                      ]}
                    />
                  </Grid>

                  <Grid item md={4} sm={4} xs={12} textAlign={"center"}>
                    <InputFields label="IFSC CODE" name="zip-code" value="" />
                  </Grid>

                  {/* --------------------------------------------------------------------------------------------- */}
                  {/* <Grid
                    item
                    md={6}
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Grid item>
                      <FormControlLabel
                        control={<Checkbox />}
                        label="LOCK CHECKS PRINTING"
                        sx={{ width: "100%" }}
                      />
                    </Grid>
                  </Grid> */}
                  {/* --------------------------------------------------------------------------------------------- */}

                  {/* <Grid item md={6} xs={12} textAlign="center">
                    <InputTextSearchField
                      label="ACCOUNT NO"
                      type="text"
                      onClick={handleOpen}
                    />
                  </Grid> */}

                  {/* ---------------------------------Modal------------------------------------------------------------ */}
                  <Modal open={open} onClose={handleClose}>
                    <Paper
                      style={{
                        padding: "20px",
                        maxWidth: "600px",
                        margin: "auto",
                        marginTop: "200px",
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <InputFields
                            label="FIND"
                            name="voluom"
                            value=""
                            fullWidth
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} style={{ marginTop: "20px" }}>
                        <Grid item xs={12}>
                          {/* Replace with your actual table component */}
                          <Paper
                            style={{
                              padding: "10px",
                              height: "200px",
                              overflow: "auto",
                            }}
                          >
                            {/* Example table content */}
                            <DataGrid
                              columns={columns}
                              rows={rows}
                              columnHeaderHeight={35}
                              rowHeight={45}
                              pagination={false}
                              hideFooter
                              disableColumnMenu
                            />
                          </Paper>
                        </Grid>
                      </Grid>

                      <Grid container spacing={2} style={{ marginTop: "20px" }}>
                        <Grid item xs={6} textAlign="left">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleClose}
                          >
                            CHOOSE
                          </Button>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Button
                            variant="contained"
                            color="error"
                            onClick={handleClose}
                          >
                            CANCEL
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Modal>
                  {/* ---------------------------------Modal------------------------------------------------------------ */}
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

              <Button variant="contained" disabled color="error">
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
