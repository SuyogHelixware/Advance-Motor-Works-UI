import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState, useEffect, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";

const QcMaster = () => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      Question: "",
      Status: true,
    },
  });

  const getAllQc = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/QCM`);
      if (response.data && response.data.values) {
        setRows(response.data.values);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllQc();
  }, [getAllQc]);

  const handleSubmitForm = async (data) => {
    const payload = {
      UserId: localStorage.getItem("UserId"),
      CreatedBy: localStorage.getItem("UserName"),
      Question: data.Question,
      Status: data.Status ? "1" : "0",
    };

    if (!editId) {
      setLoading(true);
      try {
        const response = await apiClient.post(`/QCM`, payload);
        if (response.data.success) {
          getAllQc();
          reset({ Question: "", Status: true });
          Swal.fire({
            title: "Success!",
            text: "Question Added",
            icon: "success",
            timer: 1000,
            showConfirmButton: true,
          });
        } else {
          Swal.fire(
            "Error!",
            response.data.message || "Failed to save",
            "warning",
          );
        }
      } catch (error) {
        Swal.fire("Error!", "Something went wrong", "error");
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        text: `Do You Want Update`,
        icon: "question",
        confirmButtonText: "YES",
        showCancelButton: true,
        cancelButtonText: "No",
      }).then(async (results) => {
        if (results.isConfirmed) {
          setLoading(true);
          try {
            const response = await apiClient.put(`/QCM/${editId}`, payload);
            if (response.data.success) {
              getAllQc();
              setEditId(null);
              reset({ Question: "", Status: true });
              Swal.fire({
                title: "Success!",
                text: "Question Updated",
                icon: "success",
                timer: 1000,
                showConfirmButton: true,
              });
            }
          } catch (error) {
            Swal.fire("Error!", "Something went wrong", "error");
          } finally {
            setLoading(false);
          }
        }
      });
    }
  };

  const handleDeleteClick = (id, Question) => {
    Swal.fire({
      // title: "Are you sure?",
      text: `Do You Want Delete "${Question}"`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await apiClient.delete(`/QCM/${id}`);
          getAllQc();
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: true,
          });
        } catch (error) {
          Swal.fire("Error", "Could not delete record", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEdit = (row) => {
    setEditId(row.DocEntry);
    setValue("Question", row.Question);
    setValue("Status", row.Status === "1" || row.Status === "Y");
  };

  const columns = [
    { field: "Question", headerName: "QUESTIONS", flex: 1 },
    {
      field: "Status",
      headerName: "STATUS",
      width: 150,
      renderCell: (params) =>
        params.value === "1" || params.value === "Y" ? "Active" : "Inactive",
    },
    {
      field: "edit",
      headerName: "EDIT",
      width: 90,
      renderCell: (params) => (
        <IconButton onClick={() => handleEdit(params.row)}>
          <EditNoteOutlinedIcon color="primary" />
        </IconButton>
      ),
    },
    {
      field: "delete",
      headerName: "DELETE",
      width: 90,
      renderCell: (params) => (
        <IconButton
          onClick={() =>
            handleDeleteClick(params.row.DocEntry, params.row.Question)
          }
        >
          <DeleteOutlineIcon color="error" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

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
            sx={{ display: { lg: "none" }, position: "absolute", left: "10px" }}
          >
            <MenuOpenIcon />
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            onClick={() => {
              setEditId(null);
              reset({ Question: "", Status: true });
            }}
            sx={{ position: "absolute", right: "10px" }}
          >
            <RefreshIcon />
          </IconButton>

          <Grid item width={"100%"} py={0.5} border={"1px solid silver"}>
            <Typography textAlign={"center"}>QC MASTER</Typography>
          </Grid>

          <Grid
            container
            item
            padding={1}
            md={12}
            height="calc(100% - 40px)"
            sx={{ overflowX: "hidden" }}
          >
            <Box
              width={"100%"}
              sx={{
                "& .MuiTextField-root": { m: 1 },
              }}
            >
              <Grid container>
                <Grid item md={9} xs={12}>
                  <FormControl sx={{ px: 2 }} fullWidth>
                    <Controller
                      name="Question"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          sx={{ textTransform: "uppercase" }}
                          {...field}
                          label="Question"
                          placeholder="Write Question here..."
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
                  <Controller
                    name="Status"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Active"
                      />
                    )}
                  />
                </Grid>

                <Grid
                  item
                  md={1.5}
                  xs={6}
                  alignContent={"center"}
                  textAlign={"center"}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color={"success"}
                    sx={{ color: "white" }}
                  >
                    {editId ? "UPDATE" : "SAVE"}
                  </Button>
                </Grid>

                <Grid container sx={{ mt: 2, width: "100%", height: "400px" }}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.DocEntry}
                    pageSizeOptions={[20]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 50, page: 0 },
                      },
                    }}
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
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
