import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  // Checkbox,
  // FormControlLabel,
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
import dayjs from "dayjs";
import CardComponent from "../Components/CardComponent";
import {
  // InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import useAuth from "../../Routing/AuthContext";
import { Loader } from "../Components/Loader";
import apiClient from "../../services/apiClient";

export default function SalesEmp() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const timeoutRef = useRef(null);
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const initial = {
    SlpCode: "",
    SlpName: "",
    SAPSync: "N",
    Status: "1",
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      ""
    );
  // ===============Main list handlesearch====================================

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
    setLoading(true);

    const url = searchTerm
      ? `/SalesEmp/Search/${searchTerm}/1/${pageNum}/20`
      : `/SalesEmp/Pages/${pageNum}`;

    const response = await apiClient.get(url);

    if (!response.data.success) {
      await Swal.fire({
        title: "Error!",
        text: response.data.message || "Failed to fetch data",
        icon: "warning",
        confirmButtonText: "Ok", // ❌ no timer
      });
      return;
    }

    const newData = response.data.values || [];
    setHasMoreOpen(newData.length === 20);

    setOpenListData((prev) =>
      pageNum === 0 ? newData : [...prev, ...newData]
    );
  } catch (error) {
    console.error("Error fetching data:", error);

    await Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        "Something went wrong while fetching data",
      icon: "error",
      confirmButtonText: "Ok", // ❌ no timer
    });
  } finally {
    setLoading(false);
  }
};

  const clearFormData = () => {
    reset(initial);
    setDocEntry("");
    setErrorMessage("");
    setSaveUpdateName("SAVE");
    setSelectedData([]);
  };

  // ===============Get initial list data====================================

  useEffect(() => {
    fetchOpenListData(0);
  }, []);

  // ===============API for Setting specific Cards data====================================
  const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
    setok("");
    try {
      // await setbusinessPartner(CardCode, CntctCode);
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
          setSelectedData(DocEntry);
          setSalesEmpDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setSalesEmpDataList(DocEntry);
        setSaveUpdateName("UPDATE");
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
const setSalesEmpDataList = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true);

    const response = await apiClient.get(`/SalesEmp/${DocEntry}`);

    if (!response.data.success) {
      await Swal.fire({
        title: "Error!",
        text: response.data.message || "Failed to fetch Sales Employee data",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    const [record] = response.data.values || [];

    if (!record) {
      await Swal.fire({
        title: "Warning!",
        text: "No Sales Employee record found.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    toggleDrawer();
    reset(record);
    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);
  } catch (error) {
    console.error("Error fetching Sales Employee data:", error);

    await Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        "An error occurred while fetching the Sales Employee data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};


  // ==============useForm====================================
  const { control, handleSubmit, reset } = useForm({
    mode: "onSubmit",
  });
  const { isDirty } = useFormState({ control });
  // ===============PUT and POST API ===================================
  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      SlpName: String(data.SlpName),
      SlpCode: String(data.SlpCode),
      SAPSync: "N",
      Status: "1",
    };

    const normalizeString = (str) => {
      return (str ?? "").toString().replace(/\s+/g, "").toLowerCase();
    };

    try {
      setLoading(true);

      if (SaveUpdateName === "SAVE") {
        // Check if SlpCode already exists
        const isExisting =
          Array.isArray(openListData) &&
          openListData.some(
            (item) =>
              normalizeString(item.SlpCode) === normalizeString(data.SlpCode)
          );

        if (isExisting) {
          Swal.fire({
            text: "Sales Employee Code Already Exists!",
            icon: "info",
            showConfirmButton: true,
          });
          return;
        }

        // POST request
        const response = await apiClient.post(`/SalesEmp`, obj);

        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Sales Employee is Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Sales Employee was not added.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        // Confirm update
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.SlpCode}"?`,
          icon: "question",
          showDenyButton: true,
          confirmButtonText: "Yes",
          denyButtonText: "No",
        });

        if (result.isConfirmed) {
          // PUT request
          const response = await apiClient.put(`/SalesEmp/${DocEntry}`, obj);

          if (response.data.success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "Sales Employee Updated",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.data.message || "Sales Employee was not updated.",
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        } else {
          Swal.fire({
            text: "Update Canceled",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  // ===============Delete API ===================================
const handleOnDelete = async () => {
  const result = await Swal.fire({
    text: "Do You Want to Delete ?",
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showDenyButton: true,
  });

  if (!result.isConfirmed) {
    await Swal.fire({
      text: "Sales Employee Not Deleted",
      icon: "info",
      confirmButtonText: "Ok",
    });
    return;
  }

  try {
    setLoading(true);

    const response = await apiClient.delete(`/SalesEmp/${DocEntry}`);
    const { success, message } = response.data;

    if (success) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Sales Employee Deleted",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000, // ✅ timer only for success
      });
    } else {
      await Swal.fire({
        title: "Error!",
        text: message || "Sales Employee not deleted",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error deleting Sales Employee:", error);

    await Swal.fire({
      title: "Error!",
      text:
        error.response?.data?.message ||
        "An error occurred while deleting the Sales Employee.",
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
          Sales Employee List
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
                  title={item.SlpCode}
                  subtitle={item.SlpName}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
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
      {loading && <Loader open={loading} />}
      {/* <Spinner open={loading} /> */}
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
            onClick={clearFormData}
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
              Sales Employee
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
                  <Grid item md={6} xs={12} lg={6} textAlign={"center"}>
                    <Controller
                      name="SlpCode"
                      control={control}
                      rules={{
                        required: "Code is required",
                        validate: (value) => {
                          const str = (value ?? "").toString().trim();
                          return str !== "" || "Code cannot be empty";
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <InputTextField
                            label="CODE"
                            type="text"
                            {...field}
                            sx={{ width: 300 }}
                            disabled={!!DocEntry}
                            inputProps={{ maxLength: 8 }}
                            error={!!error || !!errorMessage}
                            helperText={error ? error.message : null}
                            onKeyDown={(e) => {
                              const allowedKeys = [
                                "Backspace",
                                "ArrowLeft",
                                "ArrowRight",
                                "Tab",
                                "Delete",
                              ];
                              // Allow only digits or the allowed keys
                              if (
                                !/^\d$/.test(e.key) &&
                                !allowedKeys.includes(e.key)
                              ) {
                                e.preventDefault();
                                setErrorMessage("Only digits are allowed");
                              } else {
                                setErrorMessage(""); // Clear error when a valid digit is entered
                              }
                            }}
                          />

                          {/* Display error message below the field */}
                          {errorMessage && (
                            <div
                              style={{
                                color: "red",
                                fontSize: "12px",
                                marginTop: "5px",
                              }}
                            >
                              {errorMessage}
                            </div>
                          )}
                        </>
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="SlpName"
                      control={control}
                      rules={{
                        required: "Name is required",
                        validate: (value) => {
                          const str = (value ?? "").toString().trim();
                          return str !== "" || "Name cannot be empty";
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="NAME"
                          type="text"
                          sx={{ width: 300 }}
                          inputProps={{ maxLength: 100 }}
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
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                disabled={SaveUpdateName === "SAVE"}
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
