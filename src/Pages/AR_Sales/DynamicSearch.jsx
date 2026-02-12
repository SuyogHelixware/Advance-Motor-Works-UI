import DetailsIcon from "@mui/icons-material/Details";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import ImageIcon from "@mui/icons-material/Image";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Tab,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";

import RefreshIcon from "@mui/icons-material/Refresh";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { DataGrid } from "@mui/x-data-grid";
import { Controller, useForm } from "react-hook-form";
import {
  InputSelectTextField,
  InputTextField
} from "../Components/formComponents";
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
    field: "On_Hand",
    headerName: "On Hand",
    width: 100,
    editable: true,
  },
  {
    field: "Resrv",
    headerName: "Resrv",
    width: 100,
    editable: true,
  },
  {
    field: "fts",
    headerName: "FTS",
    width: 100,
    editable: true,
  },
  {
    field: "price",
    headerName: "Price",
    width: 100,
    editable: true,
  },
  {
    field: "fiting",
    headerName: "Fiting",
    width: 110,
    editable: true,
  },
  {
    field: "inTrans",
    headerName: "inTrans",
    width: 110,
    editable: true,
  },
  {
    field: "OrdrQty",
    headerName: "inTrans",
    width: 110,
    editable: true,
  },
];

const rows = [
  {
    id: 1,
    Item_Code: "TJMSEATCOVER",
    Item_Description: "TJM SEAT COVERS PR",
    On_Hand: "1",
    Resrv: "35.000",
    fts: "35.000",
    price: "0",
    fiting: "5% vat",
    inTrans: 1.75,
    OrdrQty: "12",
  },
];

export default function DynamicSearch() {
  const [tabValue, setTabValue] = React.useState("1");
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const theme = useTheme();
  const { control } = useForm({
    mode: "onChange",
  });

  // const carddata = [
  //   {
  //     id: 1,
  //     name: "fsd",
  //   },
  //   {
  //     id: 2,
  //     name: "fddsf",
  //   },
  // ];
  return (
    <>
      <Grid container width={"100%"} padding={1} height="calc(100vh - 110px)">
        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
          component="form"
          position="relative"
        >
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
              Search Products Details
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
              xs={12}
              height="calc(100% - 40px)"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
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
                <Grid container md={12} xs={12} sm={12}>
                  <Grid container item>
                    <Grid container item md={4}>
                      <Grid
                        item
                        md={12}
                        sm={6}
                        xs={12}
                        lg={12}
                        textAlign={"center"}
                      >
                        <Controller
                          name="SUPPLIER"
                          rules={{
                            required: "please select SUPPLIER", // Field is required
                          }}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSelectTextField
                              label="SUPPLIER"
                              data={[
                                { key: "1", value: "ALLIED WHEELS" },
                                { key: "2", value: "AMP RESEARCH" },
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
                        sm={6}
                        md={12}
                        lg={12}
                        textAlign={"center"}
                      >
                        <Controller
                          name="DESCRIPTION"
                          rules={{ required: "this field is requered" }}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputTextField
                              label="DESCRIPTION"
                              {...field}
                              error={!!error}
                              helperText={error ? error.message : null}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={12}
                        lg={12}
                        textAlign={"center"}
                      >
                        <Controller
                          name="Include Zero Stock"
                          control={control}
                          defaultValue={false}
                          rules={{
                            required: "Include Zero Stock",
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  sx={{ textAlign: "center", width: 20, mr: 1 }}
                                  {...field}
                                  checked={field.value}
                                />
                              }
                              label="Include Zero Stock"
                              sx={{ textAlign: "center", width: 200 }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={12}
                        lg={12}
                        textAlign={"center"}
                      >
                        <Controller
                          name="Include InActive Items"
                          control={control}
                          defaultValue={false}
                          rules={{
                            required: "Include InActive Items",
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  sx={{ textAlign: "center", width: 20, mr: 1 }}
                                  {...field}
                                  checked={field.value}
                                />
                              }
                              label="Include InActive Items"
                              sx={{ textAlign: "center", width: 200 }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid
                        item
                        display={"flex"}
                        gap={5}
                        xs={12}
                        sm={6}
                        md={12}
                        lg={12}
                        mt={2}
                        mb={4}
                        alignContent={"space-between"}
                        justifyContent={"center"}
                      >
                        <Button
                          variant="contained"
                          color="success"
                         
                          sx={{ color: "white" }}
                        >
                          Search
                        </Button>
                        <Button variant="contained" color="error" >
                          Clear
                        </Button>
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      item
                      md={8}
                      xs={12}
                      border="1px solid silver"
                      padding={1}
                      spacing={2}
                    >
                      <Grid item md={12} xs={12} border="1px solid silver">
                        <TabContext value={tabValue}>
                          <Box
                            sx={{
                              borderBottom: 1,
                              borderColor: "divider",
                              display: "flex",
                              flexDirection: "column",
                              height: "100%", // Ensure the Box takes full height of its parent
                            }}
                          >
                            <Paper>
                              <TabList
                                onChange={handleTabChange}
                                aria-label="lab API tabs example"
                                variant="scrollable" // Allows horizontal scrolling if needed
                                scrollButtons="auto" // Automatically show scroll buttons on overflow
                                sx={{
                                  bgcolor: "background.paper",
                                  borderBottom: 1,
                                  borderColor: "divider",
                                }}
                              >
                                <Tab
                                  icon={<ImageIcon />}
                                  label="Item Image"
                                  value="1"
                                />
                                <Tab
                                  icon={<FileCopyIcon />}
                                  label="ATP"
                                  value="2"
                                />
                                <Tab
                                  icon={<DetailsIcon />}
                                  label="GRN DETAILS"
                                  value="3"
                                />
                                <Tab
                                  icon={<RequestQuoteIcon />}
                                  label="A/R- Invoice"
                                  value="4"
                                />
                                <Tab
                                  icon={<TextSnippetIcon />}
                                  label="Open SO"
                                  value="5"
                                />
                              </TabList>
                            </Paper>
                          </Box>
                        </TabContext>
                      </Grid>
                    </Grid>
                    {/* <Grid item xs={12} md={12} m={1} >
                    <Paper elevation={3} style={{ width: "100%" }}>
                      <DataGrid
                        sx={{
                          fontSize: "11px",
                          mb: 1,
                          "& .MuiDataGrid-columnHeaderTitle": {
                            whiteSpace: "normal",
                            lineHeight: "normal",
                            fontSize: "11px",
                          },
                          "& .MuiDataGrid-columnHeader": {
                            height: "auto", // Adjust for better compatibility
                          },
                          "& .MuiDataGrid-columnHeaders": {
                            maxHeight: "168px", // Avoid '!important' if possible
                          },
                        }}
                        rowHeight={35}
                        rows={rows}
                        columns={columns}
                        disableColumnMenu
                        columnHeaderHeight={35}
                        onRowClick={(event) => {
                          console.log("Selected Row:", event.row);
                          // Handle row click if needed
                        }}
                        className="datagrid-style"
                        
                        getRowClassName={(params) =>
                          params.row.FTSQty <= 0 ? "datagridrowstyle" : ""
                        }
                      />
                    </Paper>
                  </Grid> */}
                  </Grid>

                  <Grid
                    container
                    item
                    mt={2}
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
              <Button variant="contained" color="error">
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
