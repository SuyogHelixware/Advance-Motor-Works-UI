import React, { useState } from "react";

import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import {
  InputDatePickerFields,
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import usePermissions from "../Components/usePermissions";

export default function HolidayMaster() {
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };

  const perms = usePermissions(44);

  const data1 = [{}];
  const { control, handleSubmit } = useForm({
    mode: "onChange",
  });

  const onsubmit = (data) => {
    console.log(data);
  };

  // const sidebarContent = (
  //   <>
  //     <Grid
  //       item
  //       width={"100%"}
  //       py={0.5}
  //       alignItems={"center"}
  //       border={"1px solid silver"}
  //       borderBottom={"none"}
  //       position={"relative"}
  //       sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
  //     >
  //       <Typography
  //         textAlign={"center"}
  //         alignContent={"center"}
  //         height={"100%"}
  //       >
  //         Freight List
  //       </Typography>
  //       <IconButton
  //         edge="end"
  //         color="inherit"
  //         aria-label="close"
  //         onClick={toggleSidebar}
  //         sx={{
  //           position: "absolute",
  //           right: "10px",
  //           top: "0px",
  //           display: { lg: "none", xs: "block" },
  //         }}
  //       >
  //         <CloseIcon />
  //       </IconButton>
  //     </Grid>

  //     <Grid
  //       container
  //       item
  //       width={"100%"}
  //       height={"100%"}
  //       border={"1px silver solid"}
  //       sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
  //     >
  //       <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
  //         <Box
  //           sx={{
  //             width: "100%",
  //             height: "100%",
  //             overflow: "scroll",
  //             overflowX: "hidden",
  //             typography: "body1",
  //             "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
  //               padding: 0,
  //             },

  //             "& .MuiTabs-flexContainer ": {
  //               justifyContent: "space-around",
  //             },
  //           }}
  //           id="ListScroll"
  //         >
  //           <Grid
  //             item
  //             padding={1}
  //             md={12}
  //             sm={12}
  //             width={"100%"}
  //             sx={{
  //               position: "sticky",
  //               top: "0",
  //               backgroundColor: "#F5F6FA",
  //             }}
  //           >
  //             <SearchInputField
  //             // onChange={onHandleSearch}
  //             // value={searchText}
  //             // onClickClear={triggeronClickClearSearchTwice}
  //             />
  //           </Grid>
  //           {/* <InfiniteScroll
  //             style={{ textAlign: "center" }}
  //             dataLength={searchText === "" ? card.length : filteredCard.length}
  //             next={fetchMoreData}
  //             hasMore={hasMoreOpen}
  //             loader={<BeatLoader />}
  //             scrollableTarget="ListScroll"
  //             endMessage={<Typography>No More Records</Typography>}
  //           >
  //             {(filteredCard.length === 0 ? card : filteredCard).map((item) => (
  //               <CardComponent
  //                 key={item.DocEntry}
  //                 title={item.VehicleMakeId}
  //                 subtitle={item.VehicleModeId}
  //                 description={item.VehicleMfgYear}
  //                 onClick={() => {
  //                   setVehicleListData(item.DocEntry);
  //                 }}
  //               />
  //              ))}
  //           </InfiniteScroll> */}
  //         </Box>
  //       </Grid>
  //     </Grid>
  //   </>
  // );
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

        {/* <Grid
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
      </Grid> */}

        {/* User Creation Form Grid */}

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          // component="form"
          position="relative"
        >
          {/* Hamburger Menu for smaller screens */}

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
              Holiday Master
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
                      lg={3}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Holidays"
                        rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="Holidays"
                            type="text"
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
                      lg={3}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Payment"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Week Numbering"
                            data={[
                              { key: "1", value: "first Week 1 Junaury" },
                              { key: "2", value: "first week 4 days" },
                              { key: "3", value: "first week Full Days" },
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
                      lg={3}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Weekend From"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Weekend From"
                            data={[
                              { key: "1", value: "sunday" },
                              { key: "2", value: "monday" },
                              { key: "3", value: "Thuesday" },
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
                      lg={3}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Weekend To"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Weekend To"
                            data={[
                              { key: "1", value: "sunday" },
                              { key: "2", value: "monday" },
                              { key: "3", value: "Thuesday" },
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
                      lg={3}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Valid for One year only"
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
                            label="Valid for One year only"
                            sx={{ textAlign: "center", width: 200 }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={3}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Set Weekends as work days"
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
                            label="Set Weekends as work days"
                            sx={{
                              textAlign: "center",
                              width: 200,
                              textWrap: "nowrap",
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      container
                      item
                      width={"100%"}
                      border={"1px solid grey"}
                      mt={2}
                      textAlign={"center"}
                    >
                      <Grid item xs={4} lg={4}>
                        <InputDatePickerFields label="Start Date" />
                        <InputDatePickerFields label="End Date" />

                        <InputTextField label="Remarks" />
                      </Grid>
                      <Grid item xs={8} lg={8} width={"100%"}>
                        <TableContainer
                          component={Paper}
                          sx={{ overflow: "auto" }}
                        >
                          <Table
                            stickyHeader
                            size="small"
                            className="table-style"
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Remark</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data1.map((data, index) => (
                                <TableRow key={index}>
                                  <TableCell component="th" scope="row">
                                    {data.acode}
                                  </TableCell>
                                  <TableCell>{data.acname}</TableCell>
                                  <TableCell>{data.cardname}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
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
                disabled={("Save" === "SAVE" && !perms.IsAdd) || !perms.IsEdit}
              >
                Save
              </Button>
              {/* <Button variant="contained" color="error" disabled>
                CANCEL APPIONTMENT
              </Button> */}
              <Button
                variant="contained"
                color="error"
                disabled={!perms.IsDelete}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
