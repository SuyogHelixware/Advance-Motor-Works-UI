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
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function SAC() {
  const theme = useTheme();
  const perms = usePermissions(31);
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
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const initial = {
    ServCode: "",
    ServName: "",
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

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
        ? `/SACSetup/Search/${searchTerm}/1/${pageNum}/20`
        : `/SACSetup/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values || [];

        setHasMoreOpen(newData.length === 20);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to fetch SAC data",
          icon: "warning",
          confirmButtonText: "Ok", // ❌ NO TIMER
        });
      }
    } catch (error) {
      console.error("Error fetching SAC data:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while fetching SAC data",
        icon: "error",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);
  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
  };

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
          setSACDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setSACDataList(DocEntry);
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
  const setSACDataList = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);

      const response = await apiClient.get(`/SACSetup/${DocEntry}`);

      if (!response.data?.success) {
        await Swal.fire({
          title: "Error!",
          text: response.data?.message || "Failed to fetch SAC data",
          icon: "warning",
          confirmButtonText: "Ok", // ❌ NO TIMER
        });
        return;
      }

      const data = response.data.values;

      toggleDrawer();
      reset(data);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } catch (error) {
      console.error("Error fetching SAC data:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An error occurred while fetching the SAC data.",
        icon: "error",
        confirmButtonText: "Ok", // ❌ NO TIMER
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============useForm====================================

  const {
    control,
    handleSubmit,
    reset,
    // formState: { errors },
  } = useForm({
    mode: "onSubmit", // or "onSubmit"
  });
  const { isDirty } = useFormState({ control });
  // ===============PUT and POST API ===================================

  const handleSubmitForm = async (data) => {
    const normalizeString = (str = "") => str.replace(/\s+/g, "").toLowerCase();

    const obj = {
      DocEntry: data.DocEntry || "",
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      ServName: String(data.ServName),
      ServCode: String(data.ServCode),
      Status: "1",
    };

    try {
      // ================= SAVE =================
      if (SaveUpdateName === "SAVE") {
        if (!Array.isArray(openListData)) return;

        const isExistingSAC = openListData.some(
          (item) =>
            normalizeString(item.ServCode) === normalizeString(data.ServCode),
        );

        if (isExistingSAC) {
          await Swal.fire({
            text: "SAC Code Already Exist!",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        setLoading(true);
        const resp = await apiClient.post(`/SACSetup`, obj);

        if (!resp.data?.success) {
          await Swal.fire({
            title: "Error!",
            text: resp.data?.message || "SAC is not added",
            icon: "warning",
            confirmButtonText: "Ok", // ❌ no timer
          });
          return;
        }

        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        await Swal.fire({
          title: "Success!",
          text: "SAC is Added",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      }

      // ================= UPDATE =================
      else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.ServCode}"?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (!result.isConfirmed) {
          await Swal.fire({
            text: "SAC is Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        setLoading(true);
        const response = await apiClient.put(`/SACSetup/${DocEntry}`, obj);

        if (!response.data?.success) {
          await Swal.fire({
            title: "Error!",
            text: response.data?.message || "SAC update failed",
            icon: "warning",
            confirmButtonText: "Ok", // ❌ no timer
          });
          return;
        }

        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        await Swal.fire({
          title: "Success!",
          text: "SAC Updated",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while saving SAC",
        icon: "error",
        confirmButtonText: "Ok", // ❌ no timer
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
        text: "SAC Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.delete(`/SACSetup/${DocEntry}`);
      const { success, message } = response.data;

      if (!success) {
        await Swal.fire({
          title: "Error!",
          text: message || "SAC not deleted",
          icon: "warning",
          confirmButtonText: "Ok", // ❌ no timer
        });
        return;
      }

      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      await Swal.fire({
        text: "SAC Deleted",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } catch (error) {
      console.error("Error deleting SAC:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An error occurred while deleting the SAC",
        icon: "error",
        confirmButtonText: "Ok", // ❌ no timer
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
          SAC List
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
                  title={item.ServCode}
                  subtitle={item.ServName}
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
              SAC
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
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="ServName"
                      control={control}
                      rules={{
                        required: "SAC Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "SAC Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="SERVICE NAME"
                          type="text"
                          inputProps={{ maxLength: 254 }}
                          {...field}
                          error={!!error}
                          sx={{ maxWidth: 300, width: "100%" }}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="ServCode"
                      control={control}
                      rules={{
                        required: "Service Code is required",
                        validate: (value) =>
                          value.trim() !== "" || "Service Code cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="SERVICE CODE"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 8 }}
                          error={!!error}
                          sx={{ maxWidth: 300, width: "100%" }}
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
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
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
