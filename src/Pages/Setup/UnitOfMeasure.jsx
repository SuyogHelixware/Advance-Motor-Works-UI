import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";

import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import CardComponent from "../Components/CardComponent";
import apiClient from "../../services/apiClient";

export default function UnitOfMeasure() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const [selectedData, setSelectedData] = useState([]);

  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const timeoutRef = useRef(null);

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const theme = useTheme();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };
  const ClearFormData = () => {
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    reset(IntialObj);
  };

  // const onHandleSearch = () => {
  //   alert();
  // };

  const IntialObj = {
    DocEntry: "",
    UserId: "",
    CreatedBy: user.UserName,
    Status: "",
    UomCode: "",
    UomName: "",
    Volume: "",
    VolUnit: "",
    Length1: "",
    Width1: "",
    Height1: "",
    Weight1: "",
  };

  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: IntialObj,
  });
  const AllData = getValues();

  const onSubmit = (data) => {
    console.log(data);
    const obj = {
      ...data,
      Status: "1",
      WTLiable: true ? "Y" : "N",
    };
    console.log("save obj", obj);

    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/UnitofMeasure`, obj)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            ClearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "UoM saved Successfully",
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
        text: `Do You Want Update "${obj.UomCode}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(`/UnitofMeasure/${data.DocEntry}`, obj)
            .then((response) => {
              if (response.data.success) {
                ClearFormData();
                setOpenListPage(0);
                setOpenListData([]);
                fetchOpenListData(0);
                Swal.fire({
                  title: "Success!",
                  text: "UoM Updated",
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
            text: "UoM Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };
  const handleDelete = () => {
    Swal.fire({
      text: `Do You Want Delete "${AllData.UomCode}"`,

      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/UnitofMeasure/${AllData.DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              ClearFormData();
              setOpenListPage(0);
              setOpenListData([]);
              fetchOpenListData(0);
              Swal.fire({
                title: "Success!",
                text: "UOM Updated",
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
          text: "UoM Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

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
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/UnitofMeasure/Search/${searchTerm}/1/${pageNum}/20`
        : `/UnitofMeasure/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        // if (newData.length === 0) {
        //   Swal.fire({
        //     text: "Record Not Found",
        //     icon: "warning",
        //     toast: true,
        //     showConfirmButton: false,
        //     timer: 2000,
        //     timerProgressBar: true,
        //   });
        // }
        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const setOldDataOPen = async (DocEntry) => {
    console.log(DocEntry);

    // toggleSidebar();
    toggleDrawer();
    try {
      const { data } = await apiClient.get(`/UnitofMeasure/${DocEntry}`);
      console.log(data);
      let { values } = data;
      console.log("old Data", values);
      reset({
        ...values,
      });
      setSaveUpdateName("UPDATE");
      setSelectedData(DocEntry);
    } catch (error) {
      console.error("error", error);
    }
  };

  // Handle search input
  // const handleOpenListSearch = (res) => {
  //   setOpenListQuery(res);
  //   setOpenListSearching(true);
  //   setOpenListPage(0);
  //   setOpenListData([]); // Clear current data

  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }

  //   timeoutRef.current = setTimeout(() => {
  //     fetchOpenListData(0, res);
  //   }, 600);
  //   // Fetch with search query
  // };

  // Clear search
  // const handleOpenListClear = () => {
  //   setOpenListQuery(""); // Clear search input
  //   setOpenListSearching(false); // Reset search state
  //   setOpenListPage(0); // Reset page count
  //   setOpenListData([]); // Clear data
  //   fetchOpenListData(0); // Fetch first page without search
  // };

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0);
  }, []);

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
          Unit Of Measure List
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
                <CardComponent
                  key={i}
                  title={item.UomCode}
                  subtitle={item.UomName}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => setOldDataOPen(item.DocEntry)}
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
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
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
            onClick={ClearFormData}
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
              Unit Of Measure
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
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="UomCode"
                      rules={{ required: "this field is required " }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="UoM Code"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="UomName"
                      // rules={{ required: "this field is required " }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="UoM Name"
                          type="text"
                          {...field}
                          // error={!!error} // Pass error state to the FormComponent if needed
                          // helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="Length1"
                      // rules={{ required: "this field is required " }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Length "
                          type="text"
                          {...field}
                          // error={!!error} // Pass error state to the FormComponent if needed
                          // helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="Width1"
                      // rules={{ required: "this field is required " }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Width "
                          type="text"
                          {...field}
                          // error={!!error} // Pass error state to the FormComponent if needed
                          // helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="Height1"
                      // rules={{ required: "this field is required " }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Height "
                          type="text"
                          {...field}
                          // error={!!error}
                          // helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="Volume"
                      // rules={{ required: "this field is required " }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Volume"
                          type="text"
                          {...field}
                          // error={!!error}
                          // helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="VolUnit"
                      control={control}
                      rules={{ required: "this field is required " }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="Volume UoM"
                          data={[
                            {
                              key: "1",
                              value: "cc",
                            },
                            {
                              key: "2",
                              value: "cdm",
                            },
                            {
                              key: "3",
                              value: "cf",
                            },
                            {
                              key: "4",
                              value: "ci",
                            },
                            {
                              key: "5",
                              value: "cm",
                            },
                            {
                              key: "6",
                              value: "cmm",
                            },
                          ]}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="Weight1"
                      // rules={{ required: "this field is required " }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Weight "
                          type="text"
                          {...field}
                          // error={!!error}
                          // helperText={error ? error.message : null}
                        />
                      )}
                    />
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
                // disabled={tab !== "1"}
              >
                {SaveUpdateName}
              </Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                DELETE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
