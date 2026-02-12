import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
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
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import {
  InputSearchSelectTextField,
  InputTextField
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";

export default function State() {
  const theme = useTheme();
  const { user } = useAuth();
  const perms = usePermissions(41);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [listofcountry, setListofCountry] = useState([]);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [selectedData, setSelectedData] = useState([]);
  let [ok, setok] = useState("OK");
  const [loading, setLoading] = useState(false);

  const initial = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: "",
    Status: 1,
    Name: "",
    Code: "",
    CountryCode: "IND",
    eCode: "",
    GSTCode: "",
    GSTIsUT: "",
    GNRECode: "",
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  // ===============Main list handlesearch===================================

  const clearFormData = () => {
    setSelectedData([]);
    reset(initial);
    setSaveUpdateName("SAVE");
  };

  // ===============Get initial list data====================================
 const ListofCountry = async () => {
  setLoading(true); // Start loading
  try {
    const res = await apiClient.get(`/Country/all`);
    const response = res.data;

    if (response?.success) {
      // ✅ Success: set data
      setListofCountry(response.values || []);
    } else {
      // ⚠️ API returned success = false
      Swal.fire({
        title: "Warning!",
        text: response?.message || "Failed to fetch countries.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching countries:", error);

    // Extract message if available
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong while fetching countries.";

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loading
  }
};

  useEffect(
    () => {
      fetchOpenListData(0);
      ListofCountry();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
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
          HandleOldData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        HandleOldData(DocEntry);
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
 const HandleOldData = async (DocEntry) => {
  if (!DocEntry) return;

  setLoading(true); // Start loading
  try {
    const response = await apiClient.get(`/ListofStates/${DocEntry}`);
    const data = response?.data?.values || {}; // Safe fallback

    // ✅ Reset form with fetched data
    toggleDrawer();
    reset(data);
    setSelectedData(DocEntry);
    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
  } catch (error) {
    console.error("Error fetching state data:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "An error occurred while fetching the state data.";

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loading
  }
};

  // ===============API for Pagination ==================================
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
  setLoading(true); // Start loading
  try {
    const url = searchTerm
      ? `/ListofStates/Search/${searchTerm}/1/${pageNum}/20`
      : `/ListofStates/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);
    const data = response?.data;

    if (data?.success) {
      const newData = data.values || [];

      // Check if more data exists
      setHasMoreOpen(newData.length === 20);

      // Append or replace data depending on pageNum
      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      Swal.fire({
        title: "Warning!",
        text: data?.message || "Failed to fetch the list.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching open list data:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong while fetching data.";

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Stop loading
  }
};

  // ==============useForm====================================
  const { control, handleSubmit, reset, watch, setValue, clearErrors } =
    useForm({
      defaultValues: initial,
    });
  const ActiveValue = watch("Active");
  const Country = watch("CountryCode");
  const { isDirty } = useFormState({ control });

  const isIndia = Country?.toUpperCase() === "IND";
  useEffect(() => {
    if (Country && Country.toUpperCase() !== "IND") {
      clearErrors(["eCode", "GSTCode"]);
      setValue("eCode", "");
      setValue("GSTCode", "");
    }
  }, [Country, clearErrors, setValue]);
  // ===============PUT and POST API ===================================
 const handleSubmitForm = async (data) => {
  if (!data) return;

  const obj = {
    DocEntry: data.DocEntry || "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(data.CreatedDate).format("YYYY-MM-DD"),
    ModifiedBy: user.UserName,
    ModifiedDate: dayjs(data.ModifiedDate).format("YYYY-MM-DD"),
    Status: "1",
    Code: String(data.Code),
    Name: String(data.Name),
    eCode: data.eCode || "0",
    GSTCode: data.GSTCode || "",
    GSTIsUT: data.GSTIsUT === "Y" ? "Y" : "N",
    GNRECode: data.GNRECode || "--",
    CountryCode: String(data.CountryCode),
    Active: ActiveValue === "Y" ? "Y" : "N",
  };

  const normalizeString = (str) => str?.replace(/\s+/g, "").toLowerCase() || "";

  console.log("Submitting object:", obj);

  try {
    setLoading(true); // start loading

    // -----------------------
    // Check for duplicates on SAVE
    // -----------------------
    if (SaveUpdateName === "SAVE" && Array.isArray(openListData)) {
      const matchedFields = [];

      const isDuplicate = openListData.some((item) => {
        const matchCode = normalizeString(item.Code) === normalizeString(data.Code);
        const matchECode = normalizeString(item.eCode) === normalizeString(data.eCode);
        const matchGST = normalizeString(item.GSTCode) === normalizeString(data.GSTCode);

        if (matchCode) matchedFields.push("Code");
        if (matchECode) matchedFields.push("eCode");
        if (matchGST) matchedFields.push("GST State Code");

        return matchCode || matchECode || matchGST;
      });

      if (isDuplicate) {
        Swal.fire({
          text: `${matchedFields.join(", ")} already exist!`,
          icon: "info",
          showConfirmButton: true,
        });
        return;
      }
    }

    // -----------------------
    // SAVE or UPDATE API Call
    // -----------------------
    let response;
    if (SaveUpdateName === "SAVE") {
      response = await apiClient.post(`/ListofStates`, obj);
    } else {
      const result = await Swal.fire({
        text: `Do you want to update "${data.Code}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Record is not updated!",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      response = await apiClient.put(`/ListofStates/${data.DocEntry}`, obj);
    }

    const { success, message } = response.data;

    if (success) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      await fetchOpenListData(0);

      Swal.fire({
        title: "Success!",
        text:
          SaveUpdateName === "SAVE" ? "State is added" : "State is updated",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Warning!",
        text: message || "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error submitting form:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "An error occurred while submitting the form.";

    Swal.fire({
      title: "Error!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // stop loading
  }
};

  // ===============Delete API ===================================
  const handleOnDelete = async (data) => {
    try {
      const result = await Swal.fire({
        text: "Do You Want to Delete?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        const response = await apiClient.delete(`/ListofStates/${DocEntry}`);
        const { success, message } = response.data;

        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: "State  Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: success,
            text: message,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          text: "State  is Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting tax:", error);

      Swal.fire({
        text: "An error occurred while deleting the State .",
        icon: "error",
        showConfirmButton: false,
        timer: 4500,
      });
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
          State List
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
                  title={item.Code}
                  subtitle={item.Name}
                  description={item.CountryCode}
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
              State
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
                      name="Code"
                      control={control}
                      rules={{
                        required: "State Code is required",
                        validate: (value) =>
                          value.trim() !== "" || "State Code cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label=" STATE CODE"
                          type="text"
                          inputProps={{ maxLength: 3 }}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          disabled={SaveUpdateName === "UPDATE"}
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Name"
                      control={control}
                      rules={{
                        required: "State Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "State Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label=" STATE NAME"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="CountryCode"
                      control={control}
                      defaultValue={"IND"}
                      rules={{
                        required: "Country is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="COUNTRY"
                          data={listofcountry.map((item) => ({
                            key: item.CountryCode,
                            value: item.CountryName,
                          }))}
                          // onChange={(e) => {

                          //   handleChangeCountry(e.target.value)

                          // }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="eCode"
                      control={control}
                      rules={{
                        validate: (value) => {
                          if (isIndia && (!value || !value.trim())) {
                            return "eCode is required for India";
                          }
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="eCODE"
                          type="number"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                          disabled={!(Country === "IND" || Country === "IN")}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 2);
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="GSTCode"
                      control={control}
                      rules={{
                        validate: (value) => {
                          if (isIndia && (!value || !value.trim())) {
                            return "GST Code is required for India";
                          }
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="GST State Code"
                          type="text"
                          disabled={!(Country === "IND" || Country === "IN")}
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 2);
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="GSTIsUT"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Is Union Territory"
                          type="text"
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid
                    item
                    lg={6}
                    md={6}
                    sm={6}
                    xs={12}
                    textAlign="center"
                    justifyContent={"center"}
                    alignItems={"center"}
                    width={220}
                  >
                    <Controller
                      name="GSTIsUT"
                      control={control}
                      // defaultValue=""
                      render={({ field, fieldState: { error } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              textAlign={"center"}
                              {...field}
                              checked={field.value === "Y"}
                              onChange={(e) => {
                                const newValueGSTIsUT = e.target.checked
                                  ? "Y"
                                  : "N";
                                field.onChange(newValueGSTIsUT);
                                setValue("Active", newValueGSTIsUT);
                              }}
                            />
                          }
                          label="Is Union Territory"
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
                color="error"
                onClick={handleOnDelete}
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
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
