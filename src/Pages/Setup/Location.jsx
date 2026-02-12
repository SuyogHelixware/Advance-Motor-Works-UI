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
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";

export default function Location() {
  const { user } = useAuth();
  const theme = useTheme();
  const perms = usePermissions(37);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const [listofcountry, setListofCountry] = useState([]);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [listofstate, setListofState] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const timeoutRef = useRef(null);
  let [ok, setok] = useState("OK");

  const initial = {
    DocEntry: "",
    UserId: "",
    CreatedBy: "",
    CreatedDate: "",
    ModifiedBy: "",
    ModifiedDate: "",
    Status: "1",
    Code: "",
    Location: "",
    PanNo: "",
    EccNo: "",
    Street: "",
    Block: "",
    ZipCode: "",
    City: "",
    County: "",
    Country: "IND",
    State: "",
    Building: "",
    GSTRegnNo: "",
    GSTType: "",
    GSTRelevt: "",
    RegType: "-1",
    ECC: "",
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
  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/WHSLocation/Search/${searchTerm}/1/${pageNum}/20`
        : `/WHSLocation/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      const { success, values, message } = response?.data || {};

      // ❌ API responded but success = false
      if (!success) {
        Swal.fire({
          icon: "error",
          text: message || "Failed to fetch location list",
        });
        return;
      }

      // ✅ Success case
      const newData = Array.isArray(values) ? values : [];

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData],
      );
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Unable to connect to server.";
      } else {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        text: errorMessage,
      });

      console.error("Error fetching WHS Location data:", error);
    }
  };

  //===================================clear form data=================================
  const clearFormData = () => {
    reset(initial);
    setSelectedData([]);
    setSaveUpdateName("SAVE");
    setDocEntry("");
  };
  const setLocationData = async (DocEntry, CardCode, CntctCode) => {
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
          setLocationDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setLocationDataList(DocEntry);
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
  const setLocationDataList = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setIsLoading(true);

      const response = await apiClient.get(`/WHSLocation/${DocEntry}`);

      const { success, values, message } = response?.data || {};

      // ❌ API responded but failed
      if (!success) {
        Swal.fire({
          icon: "error",
          text: message || "Failed to fetch location details",
        });
        return;
      }

      const data = values;

      // ❌ No data found
      if (!data) {
        Swal.fire({
          icon: "warning",
          text: "Location details not found.",
        });
        return;
      }

      // ✅ Success flow
      toggleDrawer();
      reset(data);

      const panNoTrim = (PanNo || "").trim();
      const eccNoTrim = (data.EccNo || "").trim();
      const lastThree = eccNoTrim.slice(-3);

      const eccValue =
        panNoTrim !== eccNoTrim && /^\d{3}$/.test(lastThree) ? lastThree : "";

      setValue("ECC", eccValue);

      if (data.GSTType === "0") {
        setValue("GSTType", "");
      }

      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } catch (error) {
      let errorMessage = "Something went wrong while fetching location data.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Unable to connect to server.";
      } else {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        text: errorMessage,
      });

      console.error("Error fetching location data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==============useForm====================================

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });
  const PanNo = watch("PanNo");
  const ECC = watch("ECC");

  const SSIExmpt = watch("SSIExmpt");
  const regType = useWatch({ control, name: "RegType" });

  useEffect(() => {
    const generatedECC = `${PanNo?.trim() || ""}${
      regType !== "-1" ? regType : ""
    }${ECC?.trim() || ""}`;
    setValue("EccNo", generatedECC);
  }, [PanNo, regType, ECC, setValue]);

  // useEffect(() => {
  //   if (!gstRegnNo?.trim()) {
  //     setValue("GSTType", "");
  //   }
  // }, [gstRegnNo, setValue]);

  // ===============PUT and POST API ===================================

  const handleSubmitForm = async (data) => {
    const eccValue = (data.ECC || "").trim();
    const regTypeValue = data.RegType;

    // ECC validation logic
    if (regTypeValue === "-1") {
      if (eccValue && !/^\d{3}$/.test(eccValue)) {
        Swal.fire({
          text: "Enter the correct ECC No.",
          icon: "warning",
          showConfirmButton: true,
        });
        return;
      }
    } else {
      // RegType is not -1, ECC is required and must be 3 digits
      if (!/^\d{3}$/.test(eccValue)) {
        Swal.fire({
          text: "Enter the correct ECC No.",
          icon: "warning",
          showConfirmButton: true,
        });
        return;
      }
    }

    const Postobj = {
      DocEntry: data.DocEntry || "",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      // CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
      // ModifiedBy: sessionStorage.getItem("ModifiedBy") || "ADMIN",
      ModifiedBy: user.UserName,
      Status: "1",
      Code: data.Code || "",
      Location: data.Location,
      PanNo: data.PanNo || "",
      Street: data.Street || "",
      Block: data.Block || "",
      ZipCode: data.ZipCode || "",
      City: data.City || "",
      County: data.County || "",
      Country: String(data.Country || ""),
      State: data.State || "",
      Building: data.Building || "",
      EccNo: data.EccNo || "",
      GSTType: data.GSTType || "",
      GSTRegnNo: data.GSTRegnNo || "",
      RegType: data.RegType || "",
      SSIExmpt: SSIExmpt === "1" ? "1" : "0",
      GSTRelevt: data.GSTRegnNo ? "Y" : "N",
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
              normalizeString(item.Location) === normalizeString(data.Location),
          );

          if (isExistingSAC) {
            Swal.fire({
              text: "Location Name Already Exist !",
              icon: "info",
              showConfirmButton: true,
            });
            return;
          }
        } else {
          return;
        }
        const response = await apiClient.post(`/WHSLocation`, Postobj);

        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Location is Added",
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
          text: `Modification in location may give incorrect report`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/WHSLocation/${DocEntry}`,
            Postobj,
          );

          if (response.data.success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "Location is Updated",
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
            text: "Location is not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      let errorMessage = "Something went wrong while fetching location data.";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Unable to connect to server.";
      } else {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Error!",

        icon: "error",
        text: errorMessage,
        confirmButtonText: "Ok",
      });
    }
    finally{
      setIsLoading(false);
    }
  };

  // ===============Delete API ===================================

  const handleOnDelete = async () => {
  if (!DocEntry) return;

  const confirmation = await Swal.fire({
    text: "Do you want to delete?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "YES",
    cancelButtonText: "NO",
  });

  if (!confirmation.isConfirmed) {
    Swal.fire({
      text: "Location not deleted",
      icon: "info",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    setIsLoading(true);
    const response = await apiClient.delete(`/WHSLocation/${DocEntry}`);

    const { success, message } = response?.data || {};

    // ❌ API responded but delete failed
    if (!success) {
      Swal.fire({
        icon: "error",
        text: message || "Failed to delete location",
        confirmButtonText: "OK",
      });
      return;
    }

    // ✅ Delete success
    clearFormData();
   setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);

    Swal.fire({
      icon: "success",
      text: "Location deleted successfully",
      confirmButtonText: "OK",
      timer:1500
    });

  } catch (error) {
    let errorMessage = "Something went wrong while deleting.";

    if (error.response) {
      errorMessage =
        error.response.data?.message ||
        `Server error (${error.response.status})`;
    } else if (error.request) {
      errorMessage = "Unable to connect to server.";
    } else {
      errorMessage = error.message;
    }

    Swal.fire({
      icon: "error",
      text: errorMessage,
      confirmButtonText: "OK",
    });

    console.error("Delete error:", error);
  }
  finally{
    setIsLoading(false);
  }
};


  // ===============API  for Country value ===================================
  const ListofCountry = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/Country/all`);
      const response = res.data;
      if (response.success === true) {
        setListofCountry(response.values);
      } else if (response.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
    finally{
      setIsLoading(false);
    }
  };
  const ListofState = async (CountryCode) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(
        `/ListofStates/GetByCountryCode/${CountryCode}`,
      );
      const response = res.data;
      if (response.success === true) {
        setListofState(response.values);
      } else if (response.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
    finally{
      setIsLoading(false);
    }
  };
  const Country = watch("Country");
  useEffect(() => {
    fetchOpenListData(0);
  }, []);
  useEffect(() => {
    // getCountry();
    // fetchOpenListData(0);
    ListofCountry();
    ListofState(Country || "IND");
  }, [Country]);
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
          Location List
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
                  title={item.Location}
                  subtitle={item.Country}
                  description={item.State}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => setLocationData(item.DocEntry)}
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
              Location
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
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    // textTransform={"uppercase"}
                  >
                    <Controller
                      name="Location"
                      control={control}
                      rules={{
                        required: "Location Name is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Location Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="LOCATION NAME"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          // value={field.value || ""}
                          // onChange={(e) => {}}
                          // disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="Street"
                      control={control}
                      // rules={{
                      //   required: "Tax Type Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="STREET/PO BOX"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 100 }}
                          // value={field.value || ""}
                          // onChange={(e) => {}}
                          // disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="Block"
                      control={control}
                      // rules={{
                      //   required: "Tax Type Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="BLOCK"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 100 }}
                          // value={field.value || ""}
                          // onChange={(e) => {}}
                          // disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="Building"
                      control={control}
                      // rules={{
                      //   required: "Tax Type Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="BUILDING/FLOOR/ROOM"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 60 }}
                          // value={field.value || ""}
                          // onChange={(e) => {}}
                          // disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="ZipCode"
                      control={control}
                      // rules={{
                      //   required: "Tax Type Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ZIP CODE"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 20 }}
                          // value={field.value || ""}
                          // onChange={(e) => {}}
                          // disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="City"
                      control={control}
                      // rules={{
                      //   required: "Tax Type Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CITY"
                          type="text"
                          {...field}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          inputProps={{ maxLength: 100 }}
                          // value={field.value || ""}
                          // onChange={(e) => {}}
                          // disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  {/* <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="County"
                      control={control}
                      // rules={{
                      //   required: "Tax Type Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="COUNTY"
                          type="text"
                          {...field}
                          // inputProps={{ maxLength: 40 }}
                          // value={field.value || ""}
                          // onChange={(e) => {}}
                          // disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Box
                      // display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Controller
                        name="Country"
                        control={control}
                        // rules={{ required: "this field is required " }}
                        // defaultValue={"IND"}
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
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Box
                      // display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Controller
                        name="State"
                        control={control}
                        // rules={{ required: "this field is required " }}
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="STATE"
                            data={listofstate.map((item) => ({
                              key: item.Code,
                              value: item.Name,
                            }))}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="PanNo"
                      control={control}
                      rules={{
                        required: "PAN No is required",
                        validate: (value) => {
                          const cleanedValue = value.trim();
                          if (cleanedValue === "")
                            return "PAN No cannot be empty";
                          if (!/^[A-Z0-9]{10}$/i.test(cleanedValue))
                            return "PAN No must be exactly 10 alphanumeric characters";
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="PAN NO."
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 10 }}
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
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  >
                    <Controller
                      name="EccNo"
                      control={control}
                      // rules={{
                      //   // required: "ECC No. is required",
                      //   validate: (value) =>
                      //     value.trim() !== "" || "ECC No. cannot be empty",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ECC No."
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 40 }}
                          onChange={(e) => {
                            const cleanedValue = removeEmojis(e.target.value);
                            field.onChange(cleanedValue);
                          }}
                          readOnly
                          // onChange={(e) => {}}
                          // disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    lg={4}
                    md={6}
                    sm={6}
                    xs={12}
                    textAlign={"center"}
                    justifyContent="center"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Grid
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="center"
                      width="100%"
                      ml={-1}
                      sx={{ width: 230 }}
                    >
                      {" "}
                      <Controller
                        name="RegType"
                        control={control}
                        defaultValue="-1"
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label=""
                            // placeholder={"select GST Type"}
                            data={[
                              // { key: "0", value: "Select Type" },
                              { key: "-1", value: "None" },
                              { key: "XM", value: "XM" },
                              { key: "XD", value: "XD" },
                              { key: "EM", value: "EM" },
                              { key: "ED", value: "ED" },
                              { key: "SD", value: "SD" },
                            ]}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />
                      <Controller
                        name="ECC"
                        control={control}
                        // rules={{
                        //   // required: "Post Code is required",
                        //   pattern: {
                        //     value: /^[0-9]{3}$/,
                        //     message: "Enter valid Three digits",
                        //   },
                        // }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label=""
                            type="number"
                            {...field}
                            inputProps={{
                              maxLength: 3,
                              onInput: (e) => {
                                if (e.target.value.length > 3) {
                                  e.target.value = e.target.value.slice(0, 3);
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
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    sm={6}
                    textAlign={"center"}
                    textTransform={"uppercase"}
                  ></Grid>

                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign="center">
                    <Controller
                      name="GSTRegnNo"
                      control={control}
                      rules={{
                        validate: (value, formValues) => {
                          const cleanedValue = value?.trim() ?? "";
                          const gstType = formValues.GSTType?.trim() ?? "";

                          if (
                            gstType !== "" &&
                            gstType !== "0" &&
                            cleanedValue === ""
                          ) {
                            return "GSTIN field is required";
                          }

                          if (
                            cleanedValue !== "" &&
                            !/^[A-Z0-9]{15}$/i.test(cleanedValue)
                          ) {
                            return "GSTIN must be exactly 15 alphanumeric characters";
                          }

                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="GSTIN"
                          type="text"
                          inputProps={{ maxLength: 15 }}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={4} sm={6} textAlign="center">
                    <Controller
                      name="GSTType"
                      control={control}
                      defaultValue=""
                      rules={{
                        validate: (value, formValues) => {
                          const gstValue = formValues.GSTRegnNo?.trim() ?? "";

                          if (
                            gstValue !== "" &&
                            (!value || value.trim() === "")
                          ) {
                            return "GST Type is required";
                          }
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="GST Type"
                          data={[
                            { key: "", value: "Select GST Type" },
                            { key: "1", value: "Regular/TDS/ISD" },
                            { key: "2", value: "Casual Taxable Person" },
                            { key: "3", value: "Composition Levy" },
                            { key: "4", value: "Government Department or PSU" },
                            { key: "5", value: "Government Department or PSU" },
                            { key: "6", value: "UN Agency or Embassy" },
                          ]}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </Grid>
                  {(regType === "XM" || regType === "EM") && (
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign="center"
                      justifyContent={"center"}
                      alignItems={"center"}
                      width={220}
                    >
                      <Controller
                        name="SSIExmpt"
                        control={control}
                        defaultValue="1"
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                textAlign={"center"}
                                {...field}
                                checked={field.value === "1"}
                                onChange={(e) => {
                                  const newValueSSIExmpt = e.target.checked
                                    ? "1"
                                    : "0";
                                  field.onChange(newValueSSIExmpt);
                                  setValue("SSIExmpt", newValueSSIExmpt);
                                }}
                              />
                            }
                            label="SSI exemption"
                          />
                        )}
                      />
                    </Grid>
                  )}
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
