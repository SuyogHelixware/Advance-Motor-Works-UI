import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import CardComponent from "../Components/CardComponent";
import { InputTextField } from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import useAuth from "../../Routing/AuthContext";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";

export default function WeightSetup() {
  const theme = useTheme();
  const perms = usePermissions(39);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  let [ok, setok] = useState("OK");
  const { user } = useAuth();
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOpenListData(0);
  }, []);

  const initial = {
    Status: "",
    UnitDisply: "",
    UnitName: "",
    WightInMG: "",
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  // ===============Main list handlesearch====================================

  const clearFormData = () => {
    reset(initial);
    setSelectedData([]);
    setSaveUpdateName("SAVE");
    setDocEntry("");
  };

  // ===============Get initial list data====================================
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
  const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
    try {
      setLoading(true); // Show loading indicator

      const url = searchTerm
        ? `/Weight/Search/${searchTerm}/1/${pageNum}/20`
        : `/Weight/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values || [];
        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          title: "Warning!",
          text: response.data.message || "Failed to fetch weight data.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          "An error occurred while fetching weight data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // ===============API for Setting specific Cards data====================================

  const setWeightDataList = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);
      setok("");

      // Check for unsaved changes
      if (isDirty || ok === "UPDATE") {
        const result = await Swal.fire({
          text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (!result.isConfirmed) {
          Swal.fire({
            text: "Not Select Record",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
          return; // Exit if user cancels
        }
      }

      // Fetch data after confirmation or if no unsaved changes
      const response = await apiClient.get(`/Weight/${DocEntry}`);
      if (!response.data.success) {
        Swal.fire({
          title: "Warning!",
          text: response.data.message || "Failed to fetch Weight data.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      const data = response.data.values || [];
      toggleDrawer();
      reset(data);
      setSelectedData(DocEntry);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
    } catch (error) {
      console.error("Error fetching Weight data:", error);
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          "An error occurred while fetching Weight data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============useForm====================================

  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });

  const fixcodes = ["g", "kg", "lb", "mg", "oz", "G", "KG", "LB", "MG", "OZ"];
  // ===============PUT and POST API ===================================

  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      ModifiedBy: user.UserName || "",
      Status: "1",
      UnitDisply: String(data.UnitDisply || ""),
      UnitName: String(data.UnitName || ""),
      WightInMG: data.WightInMG,
    };

    try {
      setLoading(true);

      if (SaveUpdateName === "SAVE") {
        const response = await apiClient.post(`/Weight`, obj);

        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);

          Swal.fire({
            title: "Success!",
            text: "Weight is Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Failed to add Weight.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.UnitDisply}"?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (!result.isConfirmed) {
          Swal.fire({
            text: "Weight Setup is not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        const response = await apiClient.put(`/Weight/${DocEntry}`, obj);

        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);

          Swal.fire({
            title: "Success!",
            text: "Weight is Updated",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Failed to update Weight.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      }
    } catch (error) {
      console.error("Error in Weight submit:", error);
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          "Something went wrong while saving Weight.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============Delete API ===================================

  const handleOnDelete = async () => {
    try {
      const result = await Swal.fire({
        text: "Do You Want to Delete?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Weight Setup is Not Deleted.",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      setLoading(true);

      const resp = await apiClient.delete(`/Weight/${DocEntry}`);

      if (resp.data.success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          text: "Weight Setup Deleted.",
          icon: "success",
          toast: true,
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: resp.data.message || "Failed to delete Weight Setup.",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting Weight:", error);
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          "Something went wrong during deletion.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
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
          Weight Setup List
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
              dataLength={openListData.length}
              hasMore={hasMoreOpen}
              next={fetchMoreOpenListData}
              loader={
                openListPage > 0 && (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                      size={10}
                    />
                  </Box>
                )
              }
              scrollableTarget="ListScroll"
            >
              {openListData.map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.UnitName}
                  subtitle={item.UnitDisply}
                  description={item.WightInMG}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => setWeightDataList(item.DocEntry)}
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
      {loading && <Loader open={loading} />}

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
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
              },
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
            onClick={clearFormData}
            sx={{
              display: {},
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
              Weight Setup
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
                <Grid container textTransform={"uppercase"}>
                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      disabled={SaveUpdateName === "UPDATE"}
                      name="UnitDisply"
                      control={control}
                      rules={{
                        required: "Code is required",
                        validate: (value) =>
                          value.trim() !== "" || "Code cannot be empty",
                        maxLength: {
                          value: 2,
                          message: "Enter Only 2 Number/Characters",
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          inputProps={{ maxLength: 2 }}
                          label="Code"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      name="UnitName"
                      control={control}
                      // rules={{
                      //   required: "Unit Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Unit Name"
                          {...field}
                          type="text"
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 20 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      name="WightInMG"
                      control={control}
                      rules={{
                        required: "Weight(mg) is required",
                        validate: (value) => {
                          if (value === "" || value === null)
                            return "Weight(mg) is required";
                          if (Number(value) <= 0)
                            return "Weight(mg) must be greater than 0";
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Weight(mg)"
                          type="number"
                          inputProps={{
                            min: 1,
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
                              }
                            },
                          }}
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  {/* --------------------------------------------------------------------- */}
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
                type="submit"
                name={SaveUpdateName}
                color="success"
                sx={{ color: "white" }}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                // disabled={SaveUpdateName === "SAVE"}
                disabled={
                  fixcodes.includes(getValues().UnitDisply) ||
                  SaveUpdateName === "SAVE" ||
                  !perms.IsDelete
                }
                color="error"
                onClick={handleOnDelete}
              >
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
