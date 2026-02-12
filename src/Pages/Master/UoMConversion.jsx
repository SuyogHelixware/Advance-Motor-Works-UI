import CloseIcon from "@mui/icons-material/Close";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";
import { InputFields } from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";

const columns = [
  {
    field: "altqty",
    headerName: "Alt. Qty",
    width: 120,
    sortable: false,
    flex: 1,
  },
  {
    field: "altuom",
    headerName: "Alt. UoM",
    width: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: "baseqty",
    headerName: "Base Qty",
    width: 100,
    sortable: false,
    flex: 1,
  },
];

const rows = [
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 1, SN: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
];

export default function UoMConversion() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // const [card, setCard] = useState([]);
  // const [filteredCard, setFilteredCard] = useState([]);
  // const [searchText, setSearchText] = useState("");
  // const [hasMoreOpen, setHasMoreOpen] = useState(true);

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
        sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
      >
        <Typography
          textAlign={"center"}
          alignContent={"center"}
          height={"100%"}
        >
          UoM Conversion Measure List
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
        sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
      >
        <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "scroll",
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
                onChange={onHandleSearch}
                // value={searchText}
                // onClickClear={triggeronClickClearSearchTwice}
              />
            </Grid>
            {/* <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={searchText === "" ? card.length : filteredCard.length}
              // next={fetchMoreData}
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
            <MenuOpenIcon />
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
              UoM Conversion Measure
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
                width={"100%"}
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <InputFields label="Group" name="grp" value="" />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <InputFields
                      label="Group Description"
                      name="grpdescp"
                      value=""
                    />
                  </Grid>

                  <Divider
                    sx={{ mt: 1, width: "100%", color: "gray", mb: 2 }}
                  />

                  <Grid
                    container
                    item
                    width={"100%"}
                    p={2}
                    pt={0}
                    my={2}
                    minHeight={"300px"}
                    maxHeight={"690px"}
                    overflow={"scroll"}
                    component={Paper}
                    style={{
                      overflowX: "hidden",
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                  >
                    <Box
                      sx={{
                        height: 600, // Adjust this height as needed
                        width: "100%",
                        "& .MuiDataGrid-root": {
                          border: "none",
                          overflowX: "scroll",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          position: "sticky",
                          top: 0,
                          backgroundColor: "white",
                          zIndex: 1,
                          textAlign: "center",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                          overflowY: "auto",
                        },
                        "& .MuiDataGrid-footer": {
                          display: "none",
                        },
                      }}
                    >
                      <DataGrid
                        columns={columns}
                        rows={rows}
                        columnHeaderHeight={35}
                        rowHeight={45}
                        pagination={false}
                        hideFooter
                        disableColumnMenu
                      />
                    </Box>
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
                bottom: "0px",
              }}
            >
              <Button variant="contained" color="success">
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
