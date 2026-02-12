import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ViewListIcon from "@mui/icons-material/ViewList";

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Controller, get, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function BinLocationSubLevel() {
  const [subleveldata, setdatasublevel] = useState([]);
  const [sublevel, setSublevel] = useState([]);
  const [filterSublevel, setFilterSublevel] = useState([]);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [savefliedactive, setFliedActive] = useState("Save");
  const [open, setOpen] = React.useState(false);
  const [binlocationActive, setBinLocatinActive] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const theme = useTheme();
  const { user } = useAuth();
 const perms = usePermissions(121);
  const InitialFld = {
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName,
    Status: "1",
    Name: "",
    // level: "",
    FldType: "",
    FldNum: "",
    UserSign: "",
    level: "",
  };
  const InitialSublevel = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName,
    Status: "",
    FldAbs: "",
    SLCode: "",
    Descr: "",
    Type: "",
  };

  const {
    control: control1,
    handleSubmit: handleSubmit1,
    reset: reset1,
    getValues: getValues1,
    setValue: setValue1,
    watch: watch1,
  } = useForm({
    defaultValues: InitialFld,
  });
  const {
    control: control,
    handleSubmit: handleSubmit,
    watch,
    reset: reset2,
    setValue: setValue2,
    getValues: getValues2,
  } = useForm({
    defaultValues: InitialSublevel,
  });

  const ModelData = getValues1();
  const FldAbs = watch("FldAbs");

  const handleOpen = () => {
    setOpen(true);
    if (FldAbs) {
      const updateNewData = sublevel.find((item) => item.level === FldAbs);
      if (updateNewData) {
        reset1({
          ...updateNewData,
          Status: updateNewData.Status === "1",
        });
        setFliedActive("Update");
      } else {
        // If not found, treat as new entry
        setFliedActive("Save");
        reset1(InitialFld);
      }
    } else {
      setFliedActive("Save");
      reset1(InitialFld);
    }
  };

  const SublevelActive = async () => {
    const { data } = await apiClient.get(
      `/BinLocationFieldActivation/All`
    );
    var { values } = data;
    const sorting = values.sort((a, b) => a.level - b.level);
    console.log("sprting", sorting);
    setSublevel(sorting);
    reset2({
      ...InitialSublevel,
      Status: ModelData.Status,
      FldAbs: String(values.DocEntry),
    });
  };

  const ClearFormData = () => {
    setSaveUpdateName("SAVE");
    let updated =
      sublevel.find((flds) => flds.Name === "SUBLEVEL - 1")?.DocEntry ?? null;
    setValue2("FldAbs", updated);
    setValue2("SLCode", "");
    setValue2("Descr", "");
       
  };

  // useEffect(() => {
  const BinLocationActivation = async () => {
    try {
      const { data } = await apiClient.get(
        `/BinLocationFieldActivation/Pages/1`
      );
      const values = data?.values || [];
      console.log(values);
      setBinLocatinActive(values);
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };
  // }, []);
  useEffect(() => {
    BinLocationActivation();
  }, [getValues1("level")]);

  const Sublevel = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get(`/BinLocationSubLevel/All`);
      var { values } = data;
      if (data.success === true) {
        if (values.length > 0) {
          values = values.filter((data) => data.Status === "1" || "0");
        }
        const updatesublevel = values.filter((item) => item.FldAbs === FldAbs);
        setFilterSublevel(updatesublevel);
        setdatasublevel(values);
      } else if (data.success === false) {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      Swal.fire({
        title: "Error!",
        text: err,
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    SublevelActive();
  }, []);

  useEffect(() => {
    Sublevel();
  }, [FldAbs]);

  const ClearFliedData = () => {
    reset1(InitialFld);
    setFliedActive("Save");
  };

  const handleUpdateRow = async (DocEntry) => {
    setSaveUpdateName("UPDATE");


    const { data } = await apiClient.get(
      `/BinLocationSubLevel/${DocEntry}`
    );
    const { values } = data;
    console.log(values);
    reset2(values);
  };

  const handleDeleteRow = async (DocEntry) => {

    const { data } = await apiClient.get(
      `/BinLocationSubLevel/${DocEntry}`
    );
    const { values } = data;
    Swal.fire({
      text: `Do You Want Delete"${values.SLCode} "`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/BinLocationSubLevel/${DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              setFilterSublevel([]);
              Sublevel();
              // ClearFormData();
              Swal.fire({
                title: "Success!",
                text: "BinLocationSubLevel Deleted",
                icon: "success",
                confirmButtonText: "Ok",
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: "Error!",
                text: response.data.message,
                icon: "warning",
                confirmButtonText: "Ok",
              });
            }
          })
          .catch(() => {
            Swal.fire({
              title: "Error!",
              text: "something went wrong",
              icon: "warning",
              confirmButtonText: "Ok",
            });
          });
      } else {
        Swal.fire({
          text: "BinLocationSubLevel Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });

    //   let updated =
    //   values.find((flds) => flds.Name === flds.Name)?.DocEntry ?? null;
    // setValue2("FldAbs", updated);
    // }
  };

  const onSubmit1 = (data) => {
    console.log("active", data);
    if (getValues1("level") === "") {
      Swal.fire({
        // title: "Doctotal Not Negative",
        text: "SubLevel Select",
        icon: "warning",
        confirmButtonText: "Ok",
        // timer: 3000,
      });
      return;
    }
    const obj = {
      ...data,
      // level:data.level,
      ModifiedByDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      ModifiedBy: user.UserName,
      Status: data.Status ? "1" : "0",
    };

    if (savefliedactive === "Save") {
      if (sublevel.length >= 4) {
        Swal.fire({
          title: "Warnings !",
          text: "You can not add more than four sublevels",
          icon: "warning",
          confirmButtonText: "Ok",
          // timer: 1000,
        });
        return;
      }
      apiClient
        .post(`/BinLocationFieldActivation`, obj)
        .then((res) => {
          if (res.data.success) {
            setSublevel([]);
            SublevelActive();
            handleClose();

            Swal.fire({
              title: "Success!",
              text: "BinLocationFieldActivation saved Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "error",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          }
        })
        .catch((error) => {
          console.error("Error Post time", error);
          Swal.fire({
            title: "Error!",
            text: "something went wrong" + error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else if (savefliedactive === "Update") {
      Swal.fire({
        text: `Do You Want Update "${obj.Name}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(`/BinLocationFieldActivation/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                // ClearFliedData();
                SublevelActive();
                handleClose();

                Swal.fire({
                  title: "Success!",
                  text: "BinLocationFieldActivation Updated",
                  icon: "success",
                  confirmButtonText: "Ok",
                  timer: 1000,
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: response.data.message,
                  icon: "warning",
                  confirmButtonText: "Ok",
                });
              }
            })
            .catch(() => {
              Swal.fire({
                title: "Error!",
                text: "something went wrong",
                icon: "warning",
                confirmButtonText: "Ok",
              });
            });
        } else {
          Swal.fire({
            text: "BinLocationFieldActivation Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const onSubmit = (data) => {
    let Status = sublevel.find((flds) => flds.level === data.FldAbs)?.Status;
    console.log(Status);
    if (Status === "0") {
      Swal.fire({
        title: "Bin Location Field Deactivation",
        text: "Please activate it.",
        icon: "warning",
        confirmButtonText: "Ok",
        timer: 3000,
      });
      return;
    }
    const obj = {
      ...data,
      ModifiedByDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      ModifiedBy: user.UserName,
      Status: "1",
    };
    console.log(obj);
    if (SaveUpdateName === "SAVE") {
      let uniCodeExists = filterSublevel.some(
        (uni) => uni.SLCode === data.SLCode
      );
      if (uniCodeExists) {
        Swal.fire({
          title: "SLCode Already Exists",
          text: "Please enter a unique SLCode.",
          icon: "warning",
          confirmButtonText: "Ok",
          timer: 3000,
        });
        return;
      }

      apiClient
        .post(`/BinLocationSubLevel`, obj)
        .then((res) => {
          if (res.data.success) {
            Sublevel();
            setFilterSublevel([]);

            // ClearFormData(InitialSublevel)
            Swal.fire({
              title: "Success!",
              text: "BinLocationSubLevel saved Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "error",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          }
        })
        .catch((error) => {
          console.error("Error Post time", error);
          Swal.fire({
            title: "Error!",
            text: "something went wrong" + error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else if (SaveUpdateName === "UPDATE") {
      Swal.fire({
        text: `Do You Want Update "${obj.SLCode}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(`/BinLocationSubLevel/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                // ClearFormData();
                Sublevel();
                setFilterSublevel([]);
                Swal.fire({
                  title: "Success!",
                  text: "BinLocationSubLevel Updated",
                  icon: "success",
                  confirmButtonText: "Ok",
                  timer: 1000,
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: response.data.message,
                  icon: "warning",
                  confirmButtonText: "Ok",
                });
              }
            })
            .catch(() => {
              Swal.fire({
                title: "Error!",
                text: "something went wrong",
                icon: "warning",
                confirmButtonText: "Ok",
              });
            });
        } else {
          Swal.fire({
            text: "BinLocationSubLevel Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }

    // else if (SaveUpdateName === "DELETE") {
    //   Swal.fire({
    //     text: `Do You Want Delete"${AllData.SLCode}"`,
    //     icon: "question",
    //     confirmButtonText: "YES",
    //     cancelButtonText: "No",
    //     showConfirmButton: true,
    //     showDenyButton: true,
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       apiClient
    //         .delete(`/BinLocationSubLevel/${AllData.DocEntry}`)
    //         .then((response) => {
    //           if (response.data.success) {
    //             setFilterSublevel([]);
    //             Sublevel();
    //             // ClearFormData();
    //             Swal.fire({
    //               title: "Success!",
    //               text: "BinLocationSubLevel Deleted",
    //               icon: "success",
    //               confirmButtonText: "Ok",
    //               timer: 1000,
    //             });
    //           } else {
    //             Swal.fire({
    //               title: "Error!",
    //               text: response.data.message,
    //               icon: "warning",
    //               confirmButtonText: "Ok",
    //             });
    //           }
    //         })
    //         .catch(() => {
    //           Swal.fire({
    //             title: "Error!",
    //             text: "something went wrong",
    //             icon: "warning",
    //             confirmButtonText: "Ok",
    //           });
    //         });
    //     } else {
    //       Swal.fire({
    //         text: "BinLocationSubLevel Deleted",
    //         icon: "info",
    //         toast: true,
    //         showConfirmButton: false,
    //         timer: 1500,
    //       });
    //     }
    //   });
    // }
  };

  const colmsublevel = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "FldAbs",
      headerName: "Warehouse Sublevel",
      width: 200,
      editable: false,
      valueFormatter: (params) => {
        return sublevel.find((data) => data.level === params)?.Name ?? "";
      },
    },

    { field: "SLCode", headerName: "CODE", width: 120, editable: false },
    {
      field: "Descr",
      headerName: "DESCRIPTION",
      width: 150,
      sortable: false,
      editable: false,
    },
    {
      field: "update",
      headerName: "Update",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={() => handleUpdateRow(params.row.DocEntry)}
          >
            <EditNoteIcon />
          </IconButton>
        );
      },
    },
    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            disabled={!perms.IsDelete}
            onClick={() => handleDeleteRow(params.row.DocEntry)}
          >
            <DeleteIcon  disabled={!perms.IsDelete} />
          </IconButton>
        );
      },
    },
  ];
  return (
    <>
      <Dialog open={open} onClose={handleClose} scroll="paper">
        <form onSubmit={handleSubmit1(onSubmit1)}>
          <DialogTitle>
            <Grid item display="flex" justifyContent="center">
              <Typography textAlign="center" fontWeight="bold">
                BinLocationFieldActivation
              </Typography>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={ClearFliedData}
                sx={{
                  display: {}, // Show only on smaller screens
                  position: "absolute",
                  right: "10px",
                  marginBottom: "50px",
                }}
              >
                <AddIcon />
              </IconButton>
            </Grid>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container>
              <Grid item xs={12} md={12} lg={12} sm={6} textAlign={"center"}>
                <Controller
                  name="Name"
                  rules={{
                    required: "Name is required",
                    maxLength: {
                      value: 100,
                      message: "Name 100 characters allowed",
                    },
                    minLength: {
                      value: 1,
                      message: "Name 1 character required",
                    },
                    validate: (value) =>
                      value.trim() !== "" || "UgpName cannot be empty",
                  }}
                  control={control1}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="NAME"
                      type="text"
                      {...field}
                      // disabled={savefliedactive==="Update"}
                      inputProps={{ maxLength: 19 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={12} lg={12} sm={6} textAlign={"center"}>
                <Controller
                  name="level"
                  control={control1}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      data={[
                        {
                          key: "1",
                          value: "SUBLEVEL - 1",
                        },
                        {
                          key: "2",
                          value: "SUBLEVEL - 2",
                        },
                        {
                          key: "3",
                          value: "SUBLEVEL - 3",
                        },
                        {
                          key: "4",
                          value: "SUBLEVEL - 4",
                        },
                      ]}
                      disabled={savefliedactive === "Update"}
                      usedLevels={binlocationActive.map((item) => item.level)}
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      label="Bin Sublevel"
                    />
                  )}
                />
              </Grid>
              <Grid
                item
                lg={12}
                md={12}
                xs={12}
                textAlign={"center"}
                width={220}
                mt={2}
              >
                <Controller
                  name="Status"
                  control={control1}
                  defaultValue={false}
                  // rules={{
                  //   required: "Please select Vehicle Type",
                  // }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{
                            textAlign: "center",
                            width: 20,
                            mr: 1,
                          }}
                          {...field}
                          checked={field.value}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          noWrap={true}
                          sx={{
                            fontFamily: "'Open Sans', sans-serif", // Apply font family here
                          }}
                        >
                          Active
                        </Typography>
                      }
                      sx={{
                        textAlign: "center",
                        width: 200,
                        whiteSpace: "normal", // Allow the label to wrap
                        fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Grid
              container
              px={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Button variant="contained" color="success" type="submit">
                {savefliedactive}
              </Button>
              <Button variant="contained" color="error" onClick={handleClose}>
                Close
              </Button>
            </Grid>
          </DialogActions>
        </form>
      </Dialog>

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Grid
          container
          item
          width="100%"
          height="100%"
          // component="form"
          position="relative"
        >
          <Grid
            item
            width={"100%"}
            py={0.5}
            alignItems={"center"}
            border={"1px solid silver"}
            borderBottom={"none"}
          >
            <Typography textAlign={"center"}>BinLocation SubLevel</Typography>
          </Grid>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={ClearFormData}
            sx={{
              display: {}, // Show only on smaller screens

              position: "absolute",

              // top: "10px",

              right: "10px",
            }}
          >
            <AddIcon />
          </IconButton>
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
              mt={3}
            >
              <Box
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid
                    container
                    item
                    lg={3}
                    md={6}
                    xs={12}
                    textAlign={"center"}
                    justifyContent={"center"}
                  >
                    <Grid
                      display={"flex"}
                      flexDirection={"row"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      width={240}
                    >
                      <Controller
                        name="FldAbs"
                        control={control}
                        rules={{ required: "FldAbs Name is Required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            name="FldAbs"
                            label="Warehouse Sublevel"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e); // Update the form state
                              setValue2("SLCode", "");
                              setValue2("Descr", "");
                              setSaveUpdateName("SAVE");
                            }}
                            data={sublevel.map((item) => ({
                              key: item.level,
                              value: item.Name.toUpperCase()
                            }))}
                          />
                        )}
                      />
                      <IconButton
                        onClick={handleOpen}
                        size="small"
                        style={{
                          backgroundColor: "green",
                          borderRadius: "10%",
                          color: "white",
                          height: 40,
                          padding: 10,
                          // marginTop: "10px",
                        }}
                      >
                        <ViewListIcon />
                      </IconButton>
                    </Grid>
                  </Grid>

                  <Grid item lg={3} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SLCode"
                      control={control}
                      rules={{
                        required: "SLCode is required",
                        maxLength: {
                          value: 100,
                          message: "SLCode 50 characters allowed",
                        },
                        minLength: {
                          value: 1,
                          message: "SLCode 1 character required",
                        },
                        validate: (value) =>
                          value.trim() !== "" || "SLCode cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Code"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 50 }} // Pass maxLength here
                          readOnly={SaveUpdateName === "UPDATE"}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item lg={3} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Descr"
                      control={control}
                      rules={{
                        required: "Descr is required",
                        maxLength: {
                          value: 100,
                          message: "Descr 50 characters allowed",
                        },
                        minLength: {
                          value: 1,
                          message: "Descr 1 character required",
                        },
                        validate: (value) =>
                          value.trim() !== "" || "Descr cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="DESCRIPTION"
                          type="text"
                          {...field}
                          // disabled={ModelData.Status!==false}
                          inputProps={{ maxLength: 50 }}
                          // disabled={ModelData.Status !== false ? false : true}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    lg={3}
                    md={6}
                    xs={12}
                    textAlign={"center"}
                    alignSelf={"center"}
                  >
                    <Button
                      variant="contained"
                       disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                      style={{
                        backgroundColor:
                          SaveUpdateName === "DELETE" ? "red" : "green",
                        color: "white",
                      }}
                      type="submit"
                    >
                      {SaveUpdateName}
                    </Button>
                  </Grid>
                  <Grid
                    container
                    item
                    mt={2}
                    sx={{
                      overflow: "auto",
                      width: "85%",
                      height: 250,
                      mt: "15px",
                      border: 2,
                      ml: 3,
                    }}
                  >
                    {/* <Paper sx={{ width: "100%" , border:2, mx:2}}> */}
                    <DataGrid
                      className="datagrid-style"
                      // getRowId={(row) => row.id}
                      rows={filterSublevel.map((data, index) => ({
                        id: index + 1,
                        ...data,
                      }))}
                      // rows={subleveldata}
                      columns={colmsublevel}
                      // hideFooter
                      sx={{
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? "#F5F6FA"
                            : "#080D2B",
                        "& .MuiDataGrid-cell": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell:focus": {
                          outline: "none",
                        },
                      }}
                      columnHeaderHeight={35}
                      hideFooter
                      loading={isLoading}

                      // onCellClick={calculateTotalSum}
                    />
                    {/* </Paper> */}
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
