import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
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
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponent from "../Components/CardComponent";
import {
  InputSearchSelectTextField,
  InputSelectTextField1,
  InputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import VehicleMakeSelector from "../Components/VehicleMakeSelector";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function VehicleMake() {
  const theme = useTheme();
    const perms = usePermissions(146);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listofcountry, setListofCountry] = useState([]);

  const initial = {
    MakeName: "",
    MakeDescription: "",
    CountryOfOrigin: "",
    LogoPath: "",
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
  // ===============Main list handle search====================================

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
  };
  //===============================All other API=================================

const ListofCountry = async () => {
  try {
    setLoading(true); // ✅ start loader

    const response = await apiClient.get(`/Country/all`);

    if (response.data.success) {
      const values = response.data.values || [];
      console.log("CountryOfOrigin", values);

      setListofCountry(values);
    } else {
      // API returned success = false
      Swal.fire({
        title: "Warning",
        text: response.data.message || "Failed to fetch Country data.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error fetching countries:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || error.message || "Failed to fetch Country data!",
      icon: "error",
      confirmButtonText: "OK",
    });
  } finally {
    setLoading(false); // ✅ stop loader
  }
};


  // ===============Get initial list data====================================

  useEffect(
    () => {
      fetchOpenListData(0);
      ListofCountry();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
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
          setVehicleMakeDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setVehicleMakeDataList(DocEntry);
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
 const setVehicleMakeDataList = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true); // ✅ Start loader

    const response = await apiClient.get(`/VehicleMakeV2/${DocEntry}`);

    if (response.data.success) {
      const data = response.data.values || {};

      toggleDrawer();
      reset(data);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } else {
      // API returned success = false
      Swal.fire({
        title: "Warning!",
        text: response.data.message || "Failed to fetch Vehicle Make data.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching Vehicle Make data:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || error.message || "An error occurred while fetching Vehicle Make data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // ✅ Stop loader
  }
};

  // ===============API for Pagination ==================================
  const handleOpenListSearch = (res) => {
    setOpenListQuery(res);
    setOpenListSearching(true);
    setOpenListPage(0);
    setOpenListData([]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res);
    }, 600);
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
    setLoading(true); // ✅ start loader

    const url = searchTerm
      ? `/VehicleMakeV2/Search/${searchTerm}/1/${pageNum}/20`
      : `/VehicleMakeV2/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);

    if (response.data.success) {
      const newData = response.data.values || [];

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      // API returned success = false
      Swal.fire({
        title: "Warning!",
        text: response.data.message || "Failed to fetch Vehicle Make list.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching Vehicle Make data:", error);
    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while fetching Vehicle Make list.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // ✅ stop loader
  }
};

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  // ==============useForm====================================
  const { control, handleSubmit, reset } = useForm({
    defaultValues: initial,
  });

  const { isDirty } = useFormState({ control });
  // ===============PUT and POST API ===================================
  const handleSubmitForm = async (data) => {
  const obj = {
    DocEntry: String(data.DocEntry || ""),
    UserId: user.UserId,
    CreatedBy: user.UserName || "",
    CreatedDate: dayjs().toISOString(),
    ModifiedBy: user.UserName || "",
    ModifiedDate: dayjs().toISOString(),
    Status: "1",
    MakeName: String(data.MakeName || ""),
    MakeDescription: String(data.MakeDescription || ""),
    CountryOfOrigin: String(data.CountryOfOrigin || ""),
    LogoPath: String(data.LogoPath || ""),
  };

  const normalizeString = (str) => str.replace(/\s+/g, "").toLowerCase();

  try {
    setLoading(true); // ✅ start loader

    // Duplicate check for SAVE
    if (SaveUpdateName === "SAVE") {
      if (Array.isArray(openListData)) {
        const isExistingVehicleMake = openListData.some(
          (item) =>
            normalizeString(item.MakeName) === normalizeString(data.MakeName) &&
            normalizeString(item.MakeDescription) ===
              normalizeString(data.MakeDescription) &&
            normalizeString(item.SubMakeDescription || "") ===
              normalizeString(data.SubMakeDescription || "")
        );

        if (isExistingVehicleMake) {
          Swal.fire({
            text: "Vehicle Make already exists!",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }
      }
    }

    // API Call for SAVE
    if (SaveUpdateName === "SAVE") {
      const response = await apiClient.post(`/VehicleMakeV2`, obj);
      const { success, message } = response.data;

      if (success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        await fetchOpenListData(0); // refresh list

        Swal.fire({
          title: "Success!",
          text: "Vehicle Make added successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: message || "Failed to add Vehicle Make",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } 
    // API Call for UPDATE
    else {
      const result = await Swal.fire({
        text: `Do you want to update "${data.MakeName}"?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Vehicle Make is not updated!",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      const response = await apiClient.put(
        `/VehicleMakeV2/Update/${data.DocEntry}`,
        obj
      );

      const { success, message } = response.data;

      if (success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        await fetchOpenListData(0); // refresh list

        Swal.fire({
          title: "Success!",
          text: "Vehicle Make updated successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: message || "Failed to update Vehicle Make",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);

    let errorMessage = "Something went wrong. Please try again later.";

    // Extract validation or API error messages if available
    if (error?.response?.data) {
      const apiError = error.response.data;
      if (apiError.errors) {
        errorMessage = Object.values(apiError.errors).flat().join("\n");
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
    }

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // ✅ stop loader
  }
};


  // ===============Delete API ===================================
  const handleOnDelete = async (data) => {
  try {
    const result = await Swal.fire({
      text: "Do you want to delete?",
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Vehicle Make is not deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true);

    const response = await apiClient.delete(`/VehicleMakeV2/${DocEntry}`);
    const { success, message } = response.data;

    if (success) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      await fetchOpenListData(0); // refresh the list

      Swal.fire({
        text: "Vehicle Make deleted successfully",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      Swal.fire({
        title: "Error",
        text: message || "Failed to delete Vehicle Make",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error deleting Vehicle Make:", error);

    let errorMessage = "An error occurred while deleting the Vehicle Make.";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // ✅ always stop loader
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
          VEHICLE MAKE LIST
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
                    title={item.MakeName}
                    // subtitle={item.MakeName}
                    isSelected={selectedData === item.DocEntry}
                    searchResult={openListquery}
                    onClick={() => setOldOpenData(item.DocEntry)}
                  />
                ))}
              </InfiniteScroll>
            </Box>
          </Grid>
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
              VEHICLE MAKE
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
                  {/* <Grid item xs={12} textAlign={"center"}>
                    <input
                      type="file"
                      id="file-upload"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                    <label
                      htmlFor="file-upload"
                      style={{
                        marginLeft: 5,
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "5px 10px",
                        backgroundColor: "#2E7D32",
                        color: "#fff",
                        borderRadius: "5px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                      }}
                    >
                      <CloudUploadIcon
                        sx={{
                          fontSize: "20px",
                          marginRight: "5px",
                          // color: "#fff",
                        }}
                      />
                      Upload File
                    </label>

                    <TableContainer
                      sx={{
                        margin: "7px",
                        maxHeight: { xs: 150, sm: 200 },
                        width: { xs: "100%", sm: "80%" },
                        overflowY: "auto",
                        ml: "10%",
                      }}
                    >
                      {fileData.length > 0 && (
                        <Table
                          sx={{ minWidth: 500 }}
                          aria-label="file data table"
                          stickyHeader
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell>Selected File Name</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <Divider />
                          <TableBody>
                            {fileData.map((data, index) => (
                              <TableRow
                                key={index}
                                style={{ cursor: "pointer" }}
                              >
                                <TableCell
                                  component="th"
                                  scope="row"
                                  onClick={() => openFileinNewTab(data)}
                                >
                                  {data.file.name}
                                </TableCell>
                                <TableCell>
                                  <RemoveCircleOutlineIcon
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemove(index);
                                    }}
                                    style={{ cursor: "pointer" }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </TableContainer>
                  </Grid>
                  <Divider sx={{ width: "100%", mb: 3 }} /> */}

                  {/* <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Series"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="SERIES"
                          data={[
                            { key: "0", value: "MANUAL" },

                            ...(seriesdata || []).map((item) => ({
                              key: item.DocEntry,
                              value: item.SeriesName,
                            })),
                          ]}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DocNum"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="MAKE ID"
                          {...field}
                          disabled={SaveUpdateName==="UPDATE"}
                          readOnly={watchSeries !== "0"}
                          value={watchSeries === "0" ? field.value : ""}
                          inputProps={{ maxLength: 15 }}
                          rows={1}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid item sm={6} xs={12} md={6} lg={6} textAlign={"center"}>
                    <Controller
                      name="MakeName"
                      control={control}
                      rules={{
                        required: "Make Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "Make Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="MAKE NAME"
                          type="text"
                          disabled={SaveUpdateName === "UPDATE"}
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="MakeDescription"
                      control={control}
                      // rules={{
                      //   required: "MakeDescription is required",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="MAKE DESCRIPTION"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid> */}

                  <Grid item sm={6} xs={12} md={6} lg={6} textAlign={"center"}>
                    <Box
                      // display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Controller
                        name="CountryOfOrigin"
                        rules={{
                          required: "Country is required",
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            {...field}
                            error={!!error}
                            defaultValue="INDIA"
                            helperText={error ? error.message : null}
                            label="COUNTRY OF ORIGIN"
                            data={listofcountry.map((item) => ({
                              key: item.CountryCode,
                              value: item.CountryName,
                            }))}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid item sm={6} xs={12} md={6} lg={6} textAlign={"center"}>
                    <Controller
                      name="LogoPath"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <VehicleMakeSelector
                          label="LOGO"
                          value={field.value}
                          // disabled={SaveUpdateName==="UPDATE"}
                          onChange={(code) => field.onChange(code)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={6} lg={6} textAlign={"center"}>
                    <Controller
                      name="MakeDescription"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <InputTextField
                          {...field}
                          size="small"
                          label="REMARK"
                          inputProps={{ maxLength: 128 }}
                          placeholder="REMARK"
                          rows={2}
                          multiline
                          fullWidth
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
