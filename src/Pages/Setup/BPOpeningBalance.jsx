import React, { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { Controller, useForm } from "react-hook-form";
import SearchInputField from "../Components/SearchInputField";
import {
  InputDatePickerField,
  InputTextArea,
  InputTextField,
} from "../Components/formComponents";
import usePermissions from "../Components/usePermissions";

export default function BPOpeningBalance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const perms = usePermissions(45);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const theme = useTheme();

  const { control, handleSubmit } = useForm({
    mode: "onChange",
  });

  const onsubmit = (data) => {
    console.log(data);
  };

  const columns = [
    {
      field: "DueDate",
      headerName: "Due Date",
      width: 120,
      editable: true,
    },
    {
      field: "Code",
      headerName: "Code",
      width: 120,
      editable: true,
    },
    {
      field: "Name",
      headerName: "Name",
      width: 120,
      editable: true,
    },
    {
      field: "ControlAcct",
      headerName: "Control Acct",
      width: 120,
      editable: true,
    },
    {
      field: "Balance",
      headerName: "Balance",
      width: 120,
      editable: true,
    },
    {
      field: "OB",
      headerName: "OB (LC)",
      width: 120,
      editable: true,
    },
    {
      field: "BalanceFC",
      headerName: "Balance (FC)",
      width: 120,
      editable: true,
    },
    {
      field: "OBFC",
      headerName: "OB (FC)",
      width: 120,
      editable: true,
    },
    {
      field: "BalanceSC",
      headerName: "Balance (SC)",
      width: 120,
      editable: true,
    },
    {
      field: "OBSC",
      headerName: "OB (SC)",
      width: 120,
      editable: true,
    },
  ];

  const rows = [
    {
      id: 1,
      DueDate: "22-20-2024",
      Code: "5645",
      Name: "Vaibav",
      ControlAcct: "1",
      Balance: "420.000",
      OB: "35.000",
      BalanceFC: "0",
      OBFC: "Closed",
      BalanceSC: "fdf",
      OBSC: "fdfd",
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
          BP Opening Balance List
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
            <MenuOpenIcon />
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
              Business Partner Opening Balance
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
                  <Grid item xs={12} md={6} lg={6} textAlign={"center"}>
                    <Controller
                      name="OPening Balance"
                      rules={{ required: "this field is requered" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="OPening Balance"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          rows={1}
                        />
                      )}
                    />
                  </Grid>

                  <Grid xs={12} md={6} lg={6} textAlign={"center"}>
                    <Controller
                      name="date"
                      control={control}
                      rules={{ required: "this field is required" }}
                      defaultValue={null}
                      render={({
                        field: { onChange, onBlur, value, ref },
                        fieldState: { error },
                      }) => (
                        <InputDatePickerField
                          label="Date"
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          error={!!error}
                          helperText={error ? error.message : ""}
                          ref={ref}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={6} textAlign={"center"}>
                    <Controller
                      name="Ref 1"
                      rules={{ required: "this field is requered" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Ref 1 "
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          rows={1}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={6} textAlign={"center"}>
                    <Controller
                      name="Remark"
                      rules={{ required: "this field is requered" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextArea
                          label="Remark"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          rows={1}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    container
                    mt={2}
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
              <Button
                variant="contained"
                sx={{ color: "white" }}
                color="success"
                type="submit"
                disabled={!perms.IsAdd || !perms.IsEdit}
              >
                Save
              </Button>
              {/* <Button variant="contained" color="error" disabled>
                CANCEL APPIONTMENT
              </Button> */}
              <Button
                variant="contained"
                color="primary"
                disabled={!perms.IsDelete}
              >
                PRINT
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
