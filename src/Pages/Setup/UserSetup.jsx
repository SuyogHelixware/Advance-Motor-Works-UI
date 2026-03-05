import React, { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
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
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import SearchInputField from "../Components/SearchInputField";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import { DataGrid } from "@mui/x-data-grid";

export default function UserSetup() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tabvalue, settabvalue] = useState(0);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const theme = useTheme();

  const handleTabChange = (event, newtab) => {
    settabvalue(newtab);
  };
  const { control, handleSubmit } = useForm({
    mode: "onChange",
  });

  const onsubmit = (data) => {
    console.log(data);
  };

  const modalcolumnsTab3 = [
    { field: "id", headerName: "ID", width: 240 },
    { field: "GLACCOUNT", headerName: "Not Mentioned in UI", width: 250 },
    { field: "TOTAL", headerName: "Branches  Name", width: 250 },
    { field: "Desc", headerName: "Description", width: 250 },
  ];
  const modalcolumnsTab4 = [
    { field: "id", headerName: "ID", width: 240 },
    { field: "GLACCOUNT", headerName: "Not Mentioned in UI", width: 250 },
    { field: "TOTAL", headerName: "Departments Name", width: 250 },
    { field: "Desc", headerName: "Description", width: 250 },
  ];

  const rows3 = [
    { id: 1, GLACCOUNT: "101", SELECTED: "ABC", TOTAL: "100", Desc: "ABC" },
    { id: 2, GLACCOUNT: "102", SELECTED: "PQR", TOTAL: "1000", Desc: "ABC" },
    { id: 3, GLACCOUNT: "103", SELECTED: "XYZ", TOTAL: "50", Desc: "ABC" },
    { id: 4, GLACCOUNT: "104", SELECTED: "ABC", TOTAL: "100", Desc: "ABC" },
    { id: 5, GLACCOUNT: "105", SELECTED: "PQR", TOTAL: "1000", Desc: "ABC" },
    { id: 6, GLACCOUNT: "106", SELECTED: "XYZ", TOTAL: "50", Desc: "ABC" },
  ];
  const rows4 = [
    { id: 1, GLACCOUNT: "101", SELECTED: "ABC", TOTAL: "100", Desc: "ABC" },
    { id: 2, GLACCOUNT: "102", SELECTED: "PQR", TOTAL: "1000", Desc: "ABC" },
    { id: 3, GLACCOUNT: "103", SELECTED: "XYZ", TOTAL: "50", Desc: "ABC" },
    { id: 4, GLACCOUNT: "104", SELECTED: "ABC", TOTAL: "100", Desc: "ABC" },
    { id: 5, GLACCOUNT: "105", SELECTED: "PQR", TOTAL: "1000", Desc: "ABC" },
    { id: 6, GLACCOUNT: "106", SELECTED: "XYZ", TOTAL: "50", Desc: "ABC" },
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
          UserSetup List
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
        onSubmit={handleSubmit(onsubmit)}
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
              UserSetup
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
                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={6}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="User Code"
                        rules={{ required: "this field is requered" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="User Code"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sm={6}
                      lg={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="User Name"
                        rules={{ required: "this field is requered" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="User Name"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={6}
                      sm={6}
                      justifyContent={"center"}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Super user"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "Please select Vehicle Type",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                sx={{ textAlign: "center", width: 20, mr: 1 }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label="Super User"
                            sx={{ textAlign: "center", width: 200 }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={6}
                      sm={6}
                      justifyContent={"center"}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Mobile User"
                        control={control}
                        defaultValue={false}
                        rules={{
                          required: "Please select Vehicle Type",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                sx={{ textAlign: "center", width: 20, mr: 1 }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label="Mobile User"
                            sx={{ textAlign: "center", width: 200 }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item width="100%" m={1} border="1px solid grey">
                      <Tabs
                        value={tabvalue}
                        onChange={handleTabChange}
                        aria-label="disabled tabs example"
                        variant="scrollable" // Allows horizontal scrolling if needed
                        scrollButtons="auto"
                        sx={{ gap: "20px" }}
                      >
                        <Tab value={0} label="Genaral" />
                        <Tab value={1} label="Branch" />
                        <Tab value={2} label="Department" />
                      </Tabs>
                      <Divider />
                      {tabvalue === 0 && (
                        <>
                          <Grid container>
                            <Grid
                              item
                              md={6}
                              xs={12}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Employee"
                                rules={{
                                  required: "please select Vehicle Type", // Field is required
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="Employee"
                                    data={[
                                      { key: "1", value: "vaibhav" },
                                      { key: "2", value: "vj" },
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
                                name="Email "
                                rules={{ required: "this field is requered" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Email"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Mobile Number"
                                rules={{ required: "this field is requered" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Mobile Number"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              md={6}
                              xs={12}
                              sm={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Branch"
                                rules={{
                                  required: "please select Vehicle Type", // Field is required
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="Branch"
                                    data={[
                                      { key: "1", value: "main" },
                                      { key: "2", value: "not main" },
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
                              md={6}
                              xs={12}
                              sm={6}
                              lg={4}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Department"
                                rules={{
                                  required: "please select Vehicle Type", // Field is required
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSelectTextField
                                    label="Department"
                                    data={[
                                      { key: "1", value: "General" },
                                      { key: "2", value: "private" },
                                    ]}
                                    {...field}
                                    error={!!error} // Pass error state to the FormComponent if needed
                                    helperText={error ? error.message : null} // Show the validation message
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {tabvalue === 1 && (
                        <>
                          <Grid container>
                            <Grid
                              item
                              md={6}
                              xs={12}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Email "
                                rules={{ required: "this field is requered" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Not Mentioned in UI"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
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
                                name="Name "
                                rules={{ required: "this field is requered" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Branches Name"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
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
                                name="Desc "
                                rules={{ required: "this field is requered" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Description"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              sm={6}
                              lg={6}
                              textAlign={"center"}
                              mt={5}
                            >
                              <Button variant="contained" color="success">
                                Save
                              </Button>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              sm={6}
                              lg={6}
                              textAlign={"center"}
                              mt={5}
                            >
                              <Button variant="contained" color="error">
                                Clare
                              </Button>
                            </Grid>
                            <Grid container item lg={12} p={1} align={"center"}>
                              <Box
                                sx={{
                                  height: 325,
                                  overflow: "auto",
                                  border: 1,
                                  p: 1,
                                }}
                              >
                                <DataGrid
                                  rows={rows3}
                                  hideFooter
                                  columns={modalcolumnsTab3}
                                  initialState={{
                                    pagination: {
                                      paginationModel: { pageSize: 30 },
                                    },
                                  }}
                                  pageSizeOptions={[30]}
                                  sx={{
                                    "& .MuiDataGrid-columnHeaders": {
                                      backgroundColor: "red",
                                      fontWeight: "bold",
                                    },
                                  }}
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </>
                      )}

                      {tabvalue === 2 && (
                        <>
                          <Grid container>
                            <Grid
                              item
                              md={6}
                              xs={12}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Not "
                                rules={{ required: "this field is requered" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Not Mentioned in UI"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
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
                                name="EDepartmentsmail "
                                rules={{ required: "this field is requered" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Departments Name"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
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
                                name="Description "
                                rules={{ required: "this field is requered" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Description"
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              sm={6}
                              lg={6}
                              textAlign={"center"}
                              mt={5}
                            >
                              <Button variant="contained" color="success">
                                Save
                              </Button>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              sm={6}
                              lg={6}
                              textAlign={"center"}
                              mt={5}
                            >
                              <Button variant="contained" color="error">
                                Clare
                              </Button>
                            </Grid>
                            <Grid container item lg={12} p={1} align={"center"}>
                              <Box
                                sx={{
                                  height: 325,
                                  overflow: "auto",
                                  border: 1,
                                  p: 1,
                                }}
                              >
                                <DataGrid
                                  rows={rows4}
                                  hideFooter
                                  columns={modalcolumnsTab4}
                                  initialState={{
                                    pagination: {
                                      paginationModel: { pageSize: 30 },
                                    },
                                  }}
                                  pageSizeOptions={[30]}
                                  sx={{
                                    "& .MuiDataGrid-columnHeaders": {
                                      backgroundColor: "red",
                                      fontWeight: "bold",
                                    },
                                  }}
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </>
                      )}
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
    </>
  );
}
