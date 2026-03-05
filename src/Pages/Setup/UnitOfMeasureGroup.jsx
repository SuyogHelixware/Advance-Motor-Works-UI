import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DensityLargeIcon from "@mui/icons-material/DensityLarge";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import {
  InputTextField,
  ModelInputSelectTextField,
  ModelInputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
// import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponentTwo from "../Components/CardComponentTwo";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function UnitOfMeasureGroup() {
  const theme = useTheme();
  const perms = usePermissions(36);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [rows, setRows] = useState([]);
  const [uomlist, setUomList] = useState([]);
  const [oldOpenData, setSelectData] = useState(null);
  let [ok, setok] = useState("OK");

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //=====================================closed List State====================================================================

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const { user } = useAuth();
  const timeoutRef = useRef(null);
  const initial = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    ModifiedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    Status: "",
    UgpCode: "",
    UgpName: "",
    BaseUom: "",
  };
  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: initial,
  });
  const AllData = getValues();

  //==============================================Active list==============================================
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/UGP/Search/${searchTerm}/1/${pageNum}/20`
        : `/UGP/Pages/1/${pageNum}/20`;
      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle search input
  const handleOpenListSearch = (res) => {
    setOpenListQuery(res);
    setOpenListSearching(true);
    setOpenListPage(0);
    setOpenListData([]); // Clear current data

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res);
    }, 600);
    // Fetch with search query
  };

  // Clear search
  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear search input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  const { isDirty } = useFormState({ control });

  //=============================================set data to fields======================================
  const setOldOpenData = async (DocEntry) => {
    setok("");
    try {
      if (isDirty || "UPDATE" === ok) {
        Swal.fire({
          text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        }).then((Data) => {
          if (!Data.isConfirmed) {
            return;
          }
          setSelectData(DocEntry);
          fetchAndSetData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        fetchAndSetData(DocEntry);
        setSaveUpdateName("UPDATE");
        setSelectData(DocEntry);
      }
    } catch (error) {
      console.error("Error in setOldOpenData:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while setting business partner data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const fetchAndSetData = async (DocEntry) => {
    toggleSidebar();
    setSaveUpdateName("UPDATE");
    try {
      const { data } = await apiClient.get(`/UGP/${DocEntry}`);
      console.log(data);
      let { values } = data;
      console.log("=========", values);

      reset({
        ...values,
        BaseUom: data.BaseUom,
        Status: "1" ? "Y" : "N",
        oLines: values.oLines.map((item) => ({
          LineNum: "1",
          Status: item.Status ? "1" : "0",
          AltQty: String(item.AltQty),
          UomEntry: item.UomEntry,
          BaseQty: String(item.BaseQty),
          BaseUom: item.BaseUom,
        })),
      });
      setRows(
        values.oLines.map((item, index) => ({
          id: index + 1, // Ensure unique IDs
          ...item,
        })),
      );
    } catch (error) {
      console.error("Error", error);
    }
  };

  //===============================================clear form data=====================================
  const ClearFormData = () => {
    setSaveUpdateName("SAVE");
    setRows([]);
    reset(initial);
    setok("");
  };

  //=============================================post and put api==========================================
  const handleSumbit = (data) => {
    console.log("dfdsf", data);

    const allFill = rows.some(
      (item) =>
        !item.AltQty || !item.BaseQty || !item.BaseUom || !item.UomEntry,
    );
    console.log(allFill);
    if (allFill) {
      Swal.fire({
        title: "Empty Fields",
        text: "Please fill all required fields in the rows",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }
    if (rows.length === 0) {
      Swal.fire({
        title: "Select Group",
        text: "Please Select The Group  ",
        icon: "warning",
        confirmButtonText: "Ok",
        // timer: 3000,
      });
      return;
    }
    const obj = {
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName || "",
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      UgpCode: data.UgpCode,
      UgpName: data.UgpName,
      BaseUom: data.BaseUom || "0",
      Status: "1",
      oLines: rows.map((item) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
        ModifiedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
        ModifiedBy: user.UserName,
        // ...rows,
        LineNum: "",
        Status: item.Status ? "1" : "0",
        AltQty: String(item.AltQty),
        UomEntry: item.UomEntry,
        BaseQty: String(item.BaseQty),
        BaseUom: item.BaseUom,
      })),
    };

    console.log("werw", obj);
    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/UGP`, obj)
        .then((res) => {
          if (res.data.success) {
            ClearFormData();
            setOpenListData([]);
            fetchOpenListData(0);
            setOpenListPage(0);

            Swal.fire({
              title: "Success!",
              text: "Unit of Measure Groups Successfully Added",
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
    } else {
      Swal.fire({
        text: `Do You Want Update "${obj.UgpCode}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(`/UGP/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                ClearFormData();
                setOpenListData([]);
                fetchOpenListData(0);
                setOpenListPage(0);

                Swal.fire({
                  title: "Success!",
                  text: " Unit of Measure Groups Updated",
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
            text: "Unit of Measure Groups Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  //==============================================delete api================================================
  const handleDelete = () => {
    Swal.fire({
      text: `Do You Want Deleted" ${AllData.UgpCode}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/UGP/${AllData.DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              setOpenListData([]);
              fetchOpenListData(0);
              ClearFormData();
              Swal.fire({
                title: "Success!",
                text: "Unit of Measure Groups Deleted",
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
          text: "Unit of Measure Groups Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  //======================================================================================================
  const UomList = async () => {
    const { data } = await apiClient.get(`/UnitofMeasure/Pages/1`);
    const { values } = data;
    console.log("1111", values);
    setUomList(values);
  };
  useEffect(() => {
    UomList();
  }, []);
  const addRow = () => {
    setRows((prevRows) => {
      const lastRow = prevRows.length > 0 ? prevRows[prevRows.length - 1] : {};
      const newRow = {
        id: prevRows.length
          ? Math.max(...prevRows.map((row) => row.id)) + 1
          : 1,
        LineNum: "1",
        DocEntry: "",
        Status: "1",
        AltQty: prevRows.length === 0 ? "1" : "",
        UomCode: "",
        BaseQty: prevRows.length === 0 ? "1" : "",
        equal: "",
        BaseUom: lastRow.BaseUom || "", // Carry forward BaseUom
        UomEntry: "", // Default empty for new rows
      };
      return [...prevRows, newRow];
    });
  };
  const handleChange = (e, row) => {
    setok("UPDATE");

    const { name, value } = e.target;
    const numericValue = value;

    // Prevent empty input, zero, or negative values for AltQty & BaseQty
    if (
      (name === "AltQty" || name === "BaseQty") &&
      value !== "" &&
      numericValue <= 0
    ) {
      return;
    }
    if (row.id === 1 && name === "BaseUom") {
      // Update BaseUom and UomEntry for all rows dynamically
      setRows((prevRows) =>
        prevRows.map((r) => ({
          ...r,
          BaseUom: value, // Update BaseUom
          UomEntry: r.id === 1 ? value : r.UomEntry, // Reflect in UomEntry for the first row
        })),
      );
    } else {
      setRows((prevRows) =>
        prevRows.map((r) => (r.id === row.id ? { ...r, [name]: value } : r)),
      );
    }
  };
  const handleDeleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const column = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
      editable: false,
    },
    {
      field: "AltQty",
      headerName: "Alt Qty",
      width: 170,
      editable: false, // Disable default editable behavior
      renderCell: (params) => (
        <Controller
          name="AltQty"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ModelInputTextField
              name={`row-${params.row.id}-BaseQty`}
              {...field}
              readOnly={params.row.id === 1} // Make the first row read-only
              onChange={(e) => handleChange(e, params.row)} // Handle changes dynamically
              type="text" // Ensure numeric input
              inputProps={{ maxLength: 19 }}
              value={params.value}
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
        />
      ),
    },
    {
      field: "UomEntry",
      headerName: "Alt UoM",
      width: 220,
      sortable: false,
      editable: false, // Non-editable, dynamically updated
      renderCell: (params) => (
        <ModelInputSelectTextField
          name="UomEntry"
          value={params.value}
          readOnly={params.row.id === 1}
          onChange={(e) => handleChange(e, params.row)} // Handle changes dynamically
          // Make only the first row editable
          data={uomlist.map((item) => ({
            key: item.DocEntry,
            value: item.UomCode,
          }))}
        />
      ),
    },
    {
      field: "equal",
      headerName: "Equal", // Optional fallback if renderHeader isn't supported
      width: 50,
      sortable: false,
      renderHeader: () => (
        <DensityLargeIcon sx={{ fontSize: "small", textAlign: "center" }} />
      ),
      renderCell: (params) => (
        <DensityLargeIcon sx={{ fontSize: "small", textAlign: "center" }} />
      ),
    },
    {
      field: "BaseQty",
      headerName: "Base Qty",
      width: 170,
      editable: false, // Disable default editable behavior
      renderCell: (params) => (
        <Controller
          name="BaseQty"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ModelInputTextField
              {...field}
              readOnly={params.row.id === 1} // Make the first row read-only
              onChange={(e) => handleChange(e, params.row)} // Handle changes dynamically
              inputProps={{ maxLength: 19 }}
              value={params.value}
              error={!!error}
              // type="number"
              helperText={error ? error.message : null}
            />
          )}
        />
      ),
    },
    {
      field: "BaseUom",
      headerName: "Base UoM",
      width: 220,
      sortable: false,
      editable: false,
      renderCell: (params) => (
        <ModelInputSelectTextField
          name="BaseUom"
          value={params.value}
          readOnly={params.row.id !== 1} // Make only the first row editable
          onChange={(e) => handleChange(e, params.row)} // Handle change for dynamic updates
          data={uomlist.map((item) => ({
            key: item.DocEntry,
            value: item.UomCode,
          }))}
        />
      ),
    },

    {
      field: "Status",
      headerName: "Active",
      width: 100,
      editable: false,
      renderCell: (params) => (
        <FormControlLabel
          control={
            <Checkbox
              sx={{
                textAlign: "center",
                width: 100,
                // mr: 1,
              }}
              checked={params.value || false} // Ensure boolean value
              onChange={(e) =>
                handleChange(
                  { target: { name: "Status", value: e.target.checked } },
                  params.row,
                )
              }
            />
          }
        />
      ),
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
            onClick={() => handleDeleteRow(params.row.id)} // Call the delete handler
          >
            <DeleteIcon />
          </IconButton>
        );
      },
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
          Unit of Measure Groups List
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
                onChange={(e) => handleOpenListSearch(e.target.value)}
                value={openListquery}
                onClickClear={handleOpenListClear}
              />
            </Grid>
            <InfiniteScroll
              style={{ textAlign: "center", justifyContent: "center" }}
              dataLength={openListData.length}
              hasMore={hasMoreOpen}
              next={fetchMoreOpenListData}
              loader={
                <BeatLoader
                  color={theme.palette.mode === "light" ? "black" : "white"}
                />
              }
              scrollableTarget="ListScroll"
              endMessage={<Typography>No More Records</Typography>}
            >
              {openListData.map((item, i) => (
                <CardComponentTwo
                  key={i}
                  title={item.UgpCode}
                  subtitle={item.UgpName}
                  searchResult={openListquery}
                  isSelected={oldOpenData === item.DocEntry}
                  onClick={() => setOldOpenData(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
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
        onSubmit={handleSubmit(handleSumbit)}
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
              Unit of Measure Groups
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
              width={"100%"}
            >
              <Box
                // component="form"
                // sx={{
                //   "& .MuiTextField-root": { m: 1 },
                // }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="UgpCode"
                      control={control}
                      rules={{
                        required: "Group Name is required",
                        maxLength: {
                          value: 20,
                          message: "Maximum 20 characters allowed",
                        },
                        minLength: {
                          value: 1,
                          message: "Minimum 1 character required",
                        },
                        validate: (value) =>
                          value.trim() !== "" || "UgpCode cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="GROUP NAME"
                          type="text"
                          inputProps={{ maxLength: 20 }}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="UgpName"
                      control={control}
                      rules={{
                        required: "Description is required",
                        maxLength: {
                          value: 100,
                          message: "Description 100 characters allowed",
                        },

                        validate: (value) =>
                          value.trim() !== "" || "Description cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="DESCRIPTION"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Box
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "100%",
                        md: "100%",
                        lg: "100%",
                      },
                      pl: 3,
                      mt: 2,
                      // maxHeight: "100vh",
                      // overflowY: "auto",
                      // padding: 2,
                      // bgcolor: "background.paper",
                      // borderRadius: 2,
                      // boxShadow: 3,
                      border: "1px solid",
                      borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "white" : "black",
                    }}
                  >
                    <Grid
                      item
                      sx={{
                        overflow: "auto",
                        width: "100%",
                        //  height: 250,
                        mr: "5px",
                        py: "10px",
                      }}
                    >
                      <IconButton
                        size="small"
                        style={{
                          backgroundColor: "green",
                          borderRadius: "20%",
                          color: "white",
                        }}
                        onClick={addRow} // Call the addRow function on click
                      >
                        <AddOutlinedIcon />
                      </IconButton>

                      {/* <Paper sx={{ width: "100%" }}> */}

                      <Grid
                        container
                        item
                        sx={{
                          overflow: "auto",
                          width: "100%",
                          height: 500,
                          mt: "5px",
                          py: 3,
                        }}
                      >
                        <DataGrid
                          columnHeaderHeight={35}
                          rowHeight={45}
                          className="datagrid-style"
                          sx={{
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "#fff"
                                : "#373842",
                            "& .MuiDataGrid-cell": {
                              border: "none",
                            },
                            "& .MuiDataGrid-cell:focus": {
                              outline: "none",
                            },
                          }}
                          rows={rows} // Dynamically updated rows
                          columns={column}
                          getRowId={(row) => row.id || row.DocEntry}
                          initialState={{
                            pagination: {
                              paginationModel: {
                                pageSize: 8,
                              },
                            },
                          }}
                          // pageSizeOptions={[3]}
                        />
                      </Grid>
                      {/* </Paper> */}
                    </Grid>
                  </Box>
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
                sx={{ color: "white" }}
                color="success"
                type="submit"
                // disabled={tab !== "1"}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={!AllData.DocEntry || !perms.IsDelete}
                onClick={handleDelete}
              >
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
