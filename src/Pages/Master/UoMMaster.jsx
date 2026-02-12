import CloseIcon from "@mui/icons-material/Close";
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

import MenuIcon from "@mui/icons-material/Menu";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import CardComponent from "../Components/CardComponent";
import { Controller, useForm, useFormState } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import dayjs from "dayjs";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";

export default function UoMMaster() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const timeoutRef = useRef(null);
  const [selectedData, setSelectedData] = useState([]);
  const [volumeUnits, setVolumeUnits] = useState([]);
  const { user } = useAuth();
  const perms = usePermissions(62);

  let [ok, setok] = useState("OK");

  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  // const [ setLoading] = useState(false);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [loading, setLoading] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      ""
    );
  useEffect(() => {
    fetchOpenListData(0);
    GetLengthWidth();
    // getAllCloseList();
    // getListForCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
const GetLengthWidth = async () => {
  try {
    setLoading(true);

    const res = await apiClient.get(`/LengthandWidth/Pages/1/0`);
    const values = res?.data?.values || [];

    setVolumeUnits(values);

    // 🔍 Find meter unit
    const meterUnit = values.find(
      (unit) => unit?.UnitName?.toLowerCase() === "meter"
    );

    // ✅ Set default form value if found
    if (meterUnit?.DocEntry) {
      setValue("VolUnit", meterUnit.DocEntry.toString());
    }
  } catch (error) {
    console.error("Failed to fetch Length & Width data:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error.response?.data?.message ||
        "Failed to load Length & Width units.",
      confirmButtonColor: "#d33",
    });
  } finally {
    setLoading(false);
  }
};

  // =======================Get all cards List ===========================

  console.log(openListData);

  const initial = {
    UomCode: "",
    UomName: "",
    Length1: "",
    Width1: "",
    Height1: "",
    Volume: "",
    VolUnit: "",
    Weight1: "",
  };

  const { reset, handleSubmit, control, setValue } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });

  // ===================== set the data of selected card=====================
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
          setUomListData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setUomListData(DocEntry);
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
const setUomListData = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true);

    const res = await apiClient.get(`/UnitofMeasure/${DocEntry}`);
    const data = res?.data?.values;

    if (!data) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Unit of Measure data not found.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    toggleDrawer();
    reset(data);

    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);
  } catch (error) {
    console.error("Error fetching UOM data:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error.response?.data?.message ||
        "Failed to fetch Unit of Measure data.",
      confirmButtonColor: "#d33",
    });
  } finally {
    setLoading(false);
  }
};


  // ===================== Pagination =====================
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
      ? `/UnitofMeasure/Search/${searchTerm}/1/${pageNum}/20`
      : `/UnitofMeasure/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);
    const data = response?.data;

    if (data?.success) {
      const newData = data.values || [];

      setHasMoreOpen(newData.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: data?.message || "Failed to load Unit of Measure list.",
        confirmButtonColor: "#d33",
      });
    }
  } catch (error) {
    console.error("Error fetching UOM list:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error.response?.data?.message ||
        "Something went wrong while fetching Unit of Measure list.",
      confirmButtonColor: "#d33",
    });
  } finally {
    setLoading(false);
  }
};



  const [formData, setFormData] = useState({
    UomCode: "",
    UomName: "",
    Length1: "",
    Width1: "",
    Height1: "",
    Volume: "",
    VolUnit: "",
    Weight1: "",
  });

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setFormData(formData);

    setSelectedData([]);
    GetLengthWidth();
  };

  // ===================== Post and Update =====================

const handleSubmitForm = async (data) => {
  const obj = {
    DocEntry: data.DocEntry || "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs().format("YYYY/MM/DD"),
    ModifiedBy: user.UserName,
    ModifiedDate: dayjs().format("YYYY/MM/DD"),
    Status: "1",
    UomCode: data.UomCode || "",
    UomName: data.UomName || "",
    Length1: String(data.Length1 || "0"),
    Volume: String(data.Volume || "0"),
    VolUnit: String(data.VolUnit),
    Width1: String(data.Width1 || "0"),
    Height1: String(data.Height1 || "0"),
    Weight1: String(data.Weight1 || "0"),
  };

  try {
    setLoading(true);

    /* ================= SAVE ================= */
    if (SaveUpdateName === "SAVE") {
      if (!Array.isArray(openListData)) return;

      const normalize = (str) => str.replace(/\s+/g, "").toLowerCase();

      const isExisting = openListData.some(
        (item) => normalize(item.UomCode) === normalize(data.UomCode)
      );

      if (isExisting) {
        Swal.fire({
          text: "UOM Code already Exist!",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      const response = await apiClient.post(`/UnitofMeasure`, obj);

      if (response.data?.success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "UoM Added",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data?.message || "Failed to add UoM",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
      return;
    }

    /* ================= UPDATE ================= */
    const confirmation = await Swal.fire({
      text: `Do You Want to Update ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!confirmation.isConfirmed) {
      Swal.fire({
        text: "UoM Not Updated",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    const response = await apiClient.put(
      `/UnitofMeasure/${obj.DocEntry}`,
      obj
    );

    if (response.data?.success) {
      clearFormData();
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
        text: response.data?.message || "Failed to update UoM",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
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


  // ===================== Delete =====================

const handleOnDelete = async () => {
  const confirmation = await Swal.fire({
    text: "Do You Want to Delete ?",
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showDenyButton: true,
  });

  if (!confirmation.isConfirmed) {
    Swal.fire({
      text: "UoM Not Deleted",
      icon: "info",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  try {
    setLoading(true);

    const response = await apiClient.delete(`/UnitofMeasure/${DocEntry}`);

    if (response.data?.success === true) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "UoM Deleted",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      Swal.fire({
        text: response.data?.message || "Delete failed",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    Swal.fire({
      text:
        error.response?.data?.message ||
        "Something went wrong while deleting",
      icon: "error",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
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
          UoM Master List
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
              UoM Master
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
                // component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="UomCode"
                      control={control}
                      rules={{
                        required: "UOM Code is required",
                        validate: (value) =>
                          value.trim() !== "" || "UOM Code cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="UOM CODE"
                          {...field}
                          readOnly={SaveUpdateName === "UPDATE"}
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

                  {/* UoM Name */}
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      rules={{
                        required: "UOM Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "UOM Name cannot be empty",
                      }}
                      name="UomName"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="UOM NAME"
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

                  {/* Length */}
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Length1"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="LENGTH"
                          type="number"
                          {...field}
                          inputProps={{
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
                              }
                            },
                          }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  {/* Width */}
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Width1"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="WIDTH"
                          type="number"
                          inputProps={{
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
                              }
                            },
                          }}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  {/* Height */}
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Height1"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="HEIGHT"
                          type="number"
                          inputProps={{
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
                              }
                            },
                          }}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  {/* Volume */}
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Volume"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="VOLUME"
                          type="number"
                          inputProps={{
                            maxLength: 19, // Note: this will be ignored for number input
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 19) {
                                e.target.value = e.target.value.slice(0, 19);
                              }
                            },
                          }}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  {/* Volume UoM */}
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="VolUnit"
                      control={control}
                      // rules={{ required: "this field is required " }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          {...field}
                          error={!!error}
                          inputProps={{ maxLength: 6 }}
                          helperText={error ? error.message : null}
                          label="VOLUME UNIT"
                          data={volumeUnits.map((unit) => ({
                            key: unit.DocEntry,
                            value: unit.UnitName,
                          }))}
                        />
                      )}
                    />
                  </Grid>

                  {/* Weight */}
                  <Grid item lg={6} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Weight1"
                      control={control}
                      // rules={{ required: "Weight is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="WEIGHT"
                          type="number"
                          inputProps={{
                            maxLength: 15,
                            onInput: (e) => {
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
                              }
                            },
                          }}
                          {...field}
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
                color="success"
                name={SaveUpdateName}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                type="submit"
                sx={{ color: "white" }}
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
    </>
  );
}
