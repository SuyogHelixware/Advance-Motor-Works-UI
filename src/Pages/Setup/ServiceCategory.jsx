import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import CardComponent from "../Components/CardComponent";
import { InputTextField } from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import Swal from "sweetalert2";
import { TabContext, TabPanel } from "@mui/lab";
import useAuth from "../../Routing/AuthContext";
import dayjs from "dayjs";
import { Loader } from "../Components/Loader";
import apiClient from "../../services/apiClient";

const initial = {
  DocEntry: "",
  ServiceCtg: "",
  Descrip: "",
  Status: "1",
};

export default function ServiceCategories() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  const [selectedData, setSelectedData] = useState([]);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [loading, setLoading] = useState(false);
  // States for the Inactive Tab
  const [tab, settab] = useState("1");
  const handleTabChange = (event, newValue) => {
    settab(newValue); // Ensure this updates the state controlling the active tab
  };
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //=====================================Close List State====================================================================
  const [CloseListData, setCloseListData] = useState([]);
  const [CloseListPage, setCloseListPage] = useState(0);
  const [hasMoreClose, setHasMoreClose] = useState(true);
  const [CloseListquery, setCloseListQuery] = useState("");
  const [CloseListSearching, setCloseListSearching] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  //=============================Inactive tab functions================

  useEffect(() => {
    fetchOpenListData(0);
    fetchCloseListData(0);
  }, []);

  //========================Active tab functions=================

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
        ? `/ServiceCategories/search/${searchTerm}/1/${pageNum}/20`
        : `/ServiceCategories/pages/1/${pageNum}/20`;

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
          text: response.data.message || "Failed to fetch Service Categories",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching Service Categories:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An error occurred while fetching Service Categories.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  //=======================================Inactive list data==========================================
  const handleCloseListSearch = (res) => {
    setCloseListQuery(res);
    setCloseListSearching(true);
    setCloseListPage(0);
    setCloseListData([]); // Clear current data

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCloseListData(0, res);
    }, 600);
    // Fetch with search query
  };

  // Clear search
  const handleCloseListClear = () => {
    setCloseListQuery(""); // Clear search input
    setCloseListSearching(false); // Reset search state
    setCloseListPage(0); // Reset page count
    setCloseListData([]); // Clear data
    fetchCloseListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreCloseListData = () => {
    fetchCloseListData(
      CloseListPage + 1,
      CloseListSearching ? CloseListquery : "",
    );
    setCloseListPage((prev) => prev + 1);
  };

  const fetchCloseListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/ServiceCategories/search/${searchTerm}/0/${pageNum}/20`
        : `/ServiceCategories/pages/0/${pageNum}/20`;

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
        setHasMoreClose(newData.length === 20);

        setCloseListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  //========================set specific cards data ===============
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
          setServiceCategoriesDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setServiceCategoriesDataList(DocEntry);
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
  const setServiceCategoriesDataList = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);

      const response = await apiClient.get(`/ServiceCategories/${DocEntry}`);

      if (response.data.success) {
        toggleDrawer();

        const data = response.data.values;
        reset(data);

        setSaveUpdateName("UPDATE");
        setDocEntry(DocEntry);
        setSelectedData(DocEntry);
      } else {
        await Swal.fire({
          title: "Error!",
          text:
            response.data.message || "Unable to fetch Service Category data.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching Service Category data:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An error occurred while fetching Service Category data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    setSelectedData([]);
  };
  //=================================useform====================================
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });

  //======================Delete API===================
  const handleOnDelete = async () => {
    const result = await Swal.fire({
      text: "Do You Want Delete ?",
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Service Category Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      setLoading(true);

      const resp = await apiClient.delete(`/ServiceCategories/${DocEntry}`);

      if (resp.data.success) {
        clearFormData();

        setOpenListPage(0);
        setCloseListPage(0);
        setOpenListData([]);
        setCloseListData([]);

        fetchOpenListData(0);
        fetchCloseListData(0);

        Swal.fire({
          text: "Service Category Deleted",
          icon: "success",
          toast: true,
          showConfirmButton: false,
          timer: 1000, // ✅ timer only for success
        });
      } else {
        await Swal.fire({
          title: "Error!",
          text: resp.data.message || "Service Category could not be deleted.",
          icon: "warning",
          confirmButtonText: "Ok", // ❌ no timer
        });
      }
    } catch (error) {
      console.error("Error deleting service category:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An error occurred while deleting Service Category.",
        icon: "error",
        confirmButtonText: "Ok", // ❌ no timer
      });
    } finally {
      setLoading(false);
    }
  };

  //======================PUT and POST API===================
  const StatusValue = watch("Status");

  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Status: StatusValue === "1" ? "1" : "0",
      ServiceCtg: String(data.ServiceCtg),
      Descrip: String(data.Descrip),
    };

    const normalizeString = (str) => str.replace(/\s+/g, "").toLowerCase();

    try {
      /* ================= SAVE ================= */
      if (SaveUpdateName === "SAVE") {
        // 🔍 Duplicate check before API
        if (Array.isArray(openListData)) {
          const isExisting = openListData.some(
            (item) =>
              normalizeString(item.ServiceCtg) ===
              normalizeString(data.ServiceCtg),
          );

          if (isExisting) {
            await Swal.fire({
              text: "Service Category Already Exists!",
              icon: "info",
              confirmButtonText: "Ok",
            });
            return;
          }
        }

        setLoading(true);
        const resp = await apiClient.post(`/ServiceCategories`, obj);

        if (resp.data.success) {
          clearFormData();

          setOpenListPage(0);
          setCloseListPage(0);
          setOpenListData([]);
          setCloseListData([]);

          fetchOpenListData(0);
          fetchCloseListData(0);
          reset();

          Swal.fire({
            title: "Success!",
            text: "Service Category Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000, // ✅ timer only for success
          });
        } else {
          await Swal.fire({
            title: "Error!",
            text: resp.data.message || "Service Category could not be added.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }

        /* ================= UPDATE ================= */
      } else {
        const result = await Swal.fire({
          text: "Do You Want to Update?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (!result.isConfirmed) {
          Swal.fire({
            text: "Service Category Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        setLoading(true);
        const response = await apiClient.put(
          `/ServiceCategories/${data.DocEntry}`,
          obj,
        );

        if (response.data.success) {
          clearFormData();

          setOpenListPage(0);
          setCloseListPage(0);
          setOpenListData([]);
          setCloseListData([]);

          fetchOpenListData(0);
          fetchCloseListData(0);
          reset();

          Swal.fire({
            title: "Success!",
            text: "Service Category Updated",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000, // ✅ timer only for success
          });
        } else {
          await Swal.fire({
            title: "Error!",
            text:
              response.data.message || "Service Category could not be updated.",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting Service Category:", error);

      await Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
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
        // sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
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
          Service Category List
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
        //sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
        }}
      >
        <Grid
          item
          md={12}
          sm={12}
          width={"100%"}
          height={`calc(100% - ${50}px)`}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              typography: "body1",
              "& .MuiTabPanel-root, .MuiButtonBase-root.MuiTab-root": {
                padding: 0,
              },

              "& .MuiTabs-flexContainer ": {
                justifyContent: "space-around",
              },
            }}
          >
            <TabContext value={tab}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="1" label="Active" />
                <Tab value="0" label="Inactive" />
              </Tabs>

              {/* Active Tab */}
              <TabPanel
                value="1"
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ActiveListScroll"
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
                      title={item.ServiceCtg}
                      subtitle={item.Descrip}
                      isSelected={selectedData === item.DocEntry}
                      searchResult={openListquery}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              {/* Inactive Tab */}
              <TabPanel
                value="0"
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="InactiveListScroll"
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
                    onChange={(e) => handleCloseListSearch(e.target.value)}
                    value={CloseListquery}
                    onClickClear={handleCloseListClear}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  dataLength={CloseListData.length}
                  hasMore={hasMoreClose}
                  next={fetchMoreCloseListData}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {CloseListData.map((item, i) => (
                    <CardComponent
                      key={item.DocEntry}
                      title={item.ServiceCtg}
                      subtitle={item.Descrip}
                      isSelected={selectedData === item.DocEntry}
                      searchResult={CloseListquery}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
            </TabContext>
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

        {/* Service Category Form Grid */}

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
              Service Category
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
                      name="ServiceCtg"
                      control={control}
                      rules={{
                        required: "Service Category is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Service Category cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="SERVICE CATEGORY"
                          disabled={!!DocEntry}
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 60 }}
                          sx={{ width: 300 }}
                          type="text"
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Descrip"
                      control={control}
                      // rules={{
                      //   required: "First Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="DESCRIPTION"
                          type="text"
                          {...field}
                          sx={{ width: 300 }}
                          inputProps={{ maxLength: 100 }}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    md={6}
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Controller
                      name="Status"
                      control={control}
                      defaultValue="1"
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              textAlign={"center"}
                              {...field}
                              checked={field.value === "1"}
                              onChange={(e) => {
                                const newValueStatus = e.target.checked
                                  ? "1"
                                  : "0";
                                field.onChange(newValueStatus);
                                setValue("Status", newValueStatus);
                              }}
                            />
                          }
                          label="Active"
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
