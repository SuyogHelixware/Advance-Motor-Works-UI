import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { Controller, useForm } from "react-hook-form";

const columns = [
  {
    field: "questions",
    headerName: "QUESTIONS",
    width: 500,
    Style: { colors: "red" },
  },
  {
    field: "status",
    headerName: "STATUS",
    width: 150,
    editable: true,
  },
  {
    field: "edit",
    headerName: "EDIT",
    width: 90,
    editable: true,
  },
  {
    field: "delete",
    headerName: "DELETE",
    type: "number",
    width: 90,
    editable: true,
  },
];

const rows = [
  {
    id: 1,
    questions: "QUESTION 1",
    status: "Active",
    edit: <EditNoteOutlinedIcon />,
    delete: 14,
  },
  { id: 2, questions: "SHOKS & SUSPENSION FIXING", status: "Active", age: 31 },
  { id: 3, questions: "ELECTRICAL JOB", status: "Active", age: 31 },
  { id: 4, questions: "SHOCKS REBUILD", status: "Active", age: 11 },
  { id: 5, questions: "STAGE 1 CHECKUP", status: "Active", age: null },
  { id: 6, questions: "STAGE 2 CHECKUP", status: "Active", age: 150 },
  { id: 7, questions: "STAGE 3 CHECKUP", status: "Active", age: 44 },
  { id: 8, questions: "ROOF RACK ACCESSORIES", status: "Active", age: 36 },
  { id: 9, questions: "LEAF SPRING", status: "Active", age: 65 },
];

const initial = {};

const QcMaster = () => {
  const theme = useTheme();

  const { control, handleSubmit } = useForm({
    defaultValues: initial,
  });

  const handleSubmitForm = (data) => {};

  return (
    <>
      <Grid
        container
        width="100%"
        height="100%"
        border={"1px silver solid"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Grid container item width="100%" height="100%" xs={12} sm={12} md={12}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
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
            // borderBottom={"none"}
          >
            <Typography
              textAlign={" center "}
              alignContent={"center"}
              height={"100%"}
            >
              QC MASTER
            </Typography>
          </Grid>

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
                <Grid
                  item
                  md={9}
                  xs={12}
                  alignContent={"center"}
                  textAlign={"center"}
                >
                  <FormControl sx={{ px: 2 }} fullWidth>
                    <Controller
                      name="Question"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          id="Question"
                          label="Question"
                          placeholder="Write Question here..."
                          autoFocus
                          size="small"
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid
                  item
                  md={1.5}
                  xs={6}
                  container
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid item>
                     <Controller
                        name="Status" // The field name used in the form
                        control={control} // Control object from useForm
                        defaultValue={false} // Optional: Set default value
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field} // Spread the field props to connect the input with the form
                                checked={field.value} // Bind the checked state to the form's value
                              />
                            }
                            label="Active"
                            sx={{ width: "100%" }}
                          />
                        )}
                      />
                  </Grid>
                </Grid>

                <Grid
                  item
                  md={1.5}
                  xs={6}
                  alignContent={"center"}
                  textAlign={"center"}
                >
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ color: "white" }}
                  >
                      SAVE
                  </Button>
                </Grid>

                <Grid
                  container
                  sx={{
                    overflow: "auto",
                    width: "100%",
                    backgroundColor: "#f2f2f2",
                    height: "30%",
                  }}
                >
                  <DataGrid
                    className="datagrid-style"
                    rows={rows}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 5,
                        },
                      },
                    }}
                    pageSizeOptions={[5]}
                    // pagination={false}
                    // hideFooter
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                      "& .MuiDataGrid-cell": {
                        border: "none",
                      },
                      "& .MuiDataGrid-cell:focus": {
                        outline: "none",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default QcMaster;
