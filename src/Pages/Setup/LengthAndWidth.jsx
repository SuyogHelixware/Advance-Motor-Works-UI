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
import dayjs from "dayjs";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";

export default function LengthAndWidth() {
  const theme = useTheme();
  const perms = usePermissions(38);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  let [ok, setok] = useState("OK");
  const { user } = useAuth();

  const [selectedData, setSelectedData] = useState([]);

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOpenListData(0);
  }, []);

  const initial = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: "",
    ModifiedBy: "",
    ModifiedDate: "",
    Status: "1",
    UnitDisply: "",
    UnitName: "",
    VolDisply: "",
    SizeInMM: "",
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const clearFormData = () => {
    reset(initial);
    setSelectedData([]);
    setSaveUpdateName("SAVE");
    setDocEntry("");
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
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

  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear search input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };

  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/LengthandWidth/Search/${searchTerm}/1/${pageNum}/20`
        : `/LengthandWidth/Pages/1/${pageNum}/20`;

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
  // ===============API for Setting specific Cards data====================================

  const setLengthAndWidthDataList = async (DocEntry) => {
    if (!DocEntry) return;

    const needConfirm = isDirty || ok === "UPDATE";

    if (needConfirm) {
      const confirm = await Swal.fire({
        text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (!confirm.isConfirmed) {
        Swal.fire({
          text: "Not Select Record",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    }

    try {
      setIsLoading(true);
      setok("");

      const response = await apiClient.get(`/LengthandWidth/${DocEntry}`);

      const { success, message, values } = response?.data || {};

      if (success === false) {
        Swal.fire({
          title: "Warning!",
          text: message || "Failed to fetch Length & Width data.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      if (!values) return;

      toggleDrawer();
      reset(values);
      setSaveUpdateName("UPDATE");
      setSelectedData(DocEntry);
      setDocEntry(DocEntry);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==============useForm====================================

  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });

  const fixcodes = ["'", '"', "cm", "dm", "m", "m", "mm"];

  // ===============PUT and POST API ===================================

  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: data.DocEntry,
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Status: "1",
      UnitDisply: data.UnitDisply,
      UnitName: data.UnitName,
      VolDisply: data.VolDisply,
      SizeInMM: data.SizeInMM,
    };

    try {
      setIsLoading(true);
      const normalizeString = (str) => {
        return str.replace(/\s+/g, "").toLowerCase();
      };
      if (SaveUpdateName === "SAVE") {
        if (Array.isArray(openListData)) {
          const isExistingSAC = openListData.some(
            (item) =>
              normalizeString(item.UnitDisply) ===
              normalizeString(data.UnitDisply),
          );

          if (isExistingSAC) {
            Swal.fire({
              text: "Code Already Exist !",
              icon: "info",
              showConfirmButton: true,
            });
            return;
          }
        } else {
          return;
        }
        const response = await apiClient.post(`/LengthandWidth`, obj);

        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Length And Width is Added",
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
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.UnitName}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/LengthandWidth/${DocEntry}`,
            obj,
          );

          if (response.data.success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "Length And Width is Updated",
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
        } else {
          Swal.fire({
            text: "Length And Width is not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ===============Delete API ===================================
  const handleOnDelete = async () => {
    if (getValues().UnitDisply === "ft") {
      alert();
    }
    try {
      setIsLoading(true);
      const result = await Swal.fire({
        text: `Do You Want to Delete ?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        const resp = await apiClient.delete(`/LengthandWidth/${DocEntry}`);

        if (resp.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);

          Swal.fire({
            text: "Length And Width Deleted.",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: resp.data.success,
            text: resp.data.message,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          text: "Length And Width is Not Deleted.",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong during deletion",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
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
          Length And Width List
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
                  key={item.DocEntry}
                  title={item.UnitName}
                  subtitle={item.UnitDisply}
                  description={item.SizeInMM}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => setLengthAndWidthDataList(item.DocEntry)}
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
      {isLoading && <Loader open={isLoading} />}

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
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
              Length And Width
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
                      name="UnitDisply"
                      control={control}
                      rules={{
                        required: "Code is required",
                        validate: (value) =>
                          value.trim() !== "" || "Code cannot be empty",
                        maxLength: {
                          value: 2,
                          message: "Enter Only 2 Characters",
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          inputProps={{ maxLength: 2 }}
                          label="Code"
                          type="text"
                          {...field}
                          disabled={fixcodes.includes(getValues().UnitDisply)}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                          // disabled={ (SaveUpdateName === "UPDATE")}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      name="UnitName"
                      control={control}
                      rules={{
                        required: "Unit Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "Unit Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Unit Name"
                          type="text"
                          inputProps={{ maxLength: 30 }}
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
                      name="VolDisply"
                      control={control}
                      rules={{
                        required: "Volume Code is required",
                        validate: (value) =>
                          value.trim() !== "" || "Volume Code cannot be empty",
                        maxLength: {
                          value: 3,
                          message: "Enter Only 2 Characters",
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          inputProps={{ maxLength: 3 }}
                          label="Volume Code"
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
                      name="SizeInMM"
                      control={control}
                      // rules={{
                      //   required: "Length(mm) is required",
                      //   validate: (value) =>
                      //     value.trim() !== "" || "Length(mm) cannot be empty",
                      // }}

                      rules={{
                        // required: "Length(mm) is required",
                        validate: (value) => {
                          if (value === "" || value === null)
                            return "Length(mm) is required";
                          if (Number(value) <= 0)
                            return "Weight(mg) must be greater than 0";
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Length (mm)"
                          type="Number"
                          {...field}
                          inputProps={{
                            onInput: (e) => {
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
                              }
                            },
                          }}
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
