import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import CardComponent from "../Components/CardComponent";

import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import CurrencySelector from "../Components/currencyCode";
import AddIcon from "@mui/icons-material/Add";
import useAuth from "../../Routing/AuthContext";
import dayjs from "dayjs";
import { Loader } from "../Components/Loader";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function Currencies() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  // const [drawerOpen, setDrawerOpen] = useState(false);

  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  const [isCurrencyDisabled, setIsCurrencyDisabled] = useState(false);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const { user } = useAuth();
  const perms = usePermissions(24);
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const initial = {
    CurrCode: "",
    CurrName: "",
    CountryCode: "",
    DocCurrCod: "",
    ChkName: "",
    Chk100Name: "",
    FrgnName: "",
    F100Name: "",
    ISOCurrCod: "",
    RoundSys: "0",
    Decimals: "-1",
    RoundPym: "",
  };

  const toggleDrawer = () => setSidebarOpen(!sidebarOpen);
  // ===============API for Searching open list data====================================

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    setIsCurrencyDisabled(false);
    setSelectedData([]);
  };

  // ===============Get initial open list data====================================
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
        ? `/CurrenciesV2/Search/${searchTerm}/1/${pageNum}/20`
        : `/CurrenciesV2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(
    () => {
      fetchOpenListData(0);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ===============API for Setting specific  Cards data====================================
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
          setCurrencyDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setCurrencyDataList(DocEntry);
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
  const setCurrencyDataList = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/CurrenciesV2/${DocEntry}`);
      const data = response.data.values;

      toggleDrawer();
      reset(data); // This sets all fields, including ISOCurrCod
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
      setSidebarOpen(false);
      const isoCurrencyCode = data?.ISOCurrCod || ""; // Adjust according to your response structure
      setIsCurrencyDisabled(!!isoCurrencyCode);
    } catch (error) {
      console.error("Error fetching data:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "An error occured while setting Currency Data",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============useForm====================================
  const { control, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      initial,
      RoundPym: "N",
    },
  });
  const RoundPym = watch("RoundPym");
  const { isDirty } = useFormState({ control });

  // ===============PUT and POST API ===================================
  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Status: "1",
      CurrCode: String(data.CurrCode || ""),
      CurrName: String(data.CurrName || ""),
      CountryCode: String(data.CountryCode || ""),
      DocCurrCod: String(data.DocCurrCod || ""),
      ChkName: String(data.ChkName || ""),
      Chk100Name: String(data.Chk100Name || ""),
      FrgnName: String(data.FrgnName || ""),
      F100Name: String(data.F100Name || ""),
      ISOCurrCod: String(data.ISOCurrCod || ""),
      RoundSys: String(data.RoundSys || ""),
      Decimals: String(data.Decimals || ""),
      RoundPym: RoundPym === "Y" ? "Y" : "N", // Assign "Y" if checked, else "N"
    };

    try {
      setLoading(true);
      if (SaveUpdateName === "SAVE") {
        const response = await apiClient.post(`/CurrenciesV2`, obj);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Currency is Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Currency is not Added",
            text: message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.CurrName}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/CurrenciesV2/${DocEntry}`,
            obj,
          );
          const { success, message } = response.data;
          if (success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "Currency Updated",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        } else {
          Swal.fire({
            text: "Currency is not Updated !",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);

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
      setLoading(false);
    }
  };
  // ===============Delete API ===================================
  const handleOnDelete = async (data) => {
    try {
      setLoading(true);
      const result = await Swal.fire({
        text: "Do You Want to Delete ?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        const response = await apiClient.delete(`/CurrenciesV2/${DocEntry}`);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: "Currency Deleted",
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
          text: "Currency is Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to delete Currency.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
          Currencies List
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={() => setSidebarOpen(false)}
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
                  title={item.CurrCode}
                  subtitle={item.CurrName}
                  description={item.Chk100Name}
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
            display: { lg: "block", xs: `${sidebarOpen ? "block" : "none"}` },
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
          in
        >
          {/* Hamburger Menu for smaller screens */}

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{
              position: "absolute",
              left: "10px",
              display: { lg: "none", xs: "block" },
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
              Currencies
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
              width={"100%"}
            >
              <Box
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container textTransform={"uppercase"}>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CurrCode"
                      control={control}
                      rules={{
                        required: "Currency Code is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Currency Code cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Code"
                          type="text"
                          disabled={!!DocEntry}
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                          inputProps={{ maxLength: 3 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="CurrName"
                      control={control}
                      rules={{
                        required: "Currency Name is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Currency Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Currency"
                          type="text"
                          inputProps={{ maxLength: 20 }}
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="DocCurrCod"
                      control={control}
                      rules={{
                        required: "International Code is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "International Code cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="INTERNATIONAL CODE"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 3 }}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ChkName"
                      control={control}
                      rules={{
                        required: "International Description is required",
                        validate: (value) =>
                          value.trim() !== "" || "Group Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="International Description"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Chk100Name"
                      control={control}
                      // rules={{
                      //   required: "Hundredth Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="Hundredth Name"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="FrgnName"
                      control={control}
                      // rules={{
                      //   required: "English is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="English"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="F100Name"
                      control={control}
                      // rules={{
                      //   required: "English Hundredth Name is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="English Hundredth Name"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 20 }}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="ISOCurrCod"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <CurrencySelector
                          label="ISO CURRENCY CODE"
                          disabled={isCurrencyDisabled}
                          readOnly
                          value={field.value}
                          onChange={(currency) => field.onChange(currency)}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="RoundSys"
                      control={control}
                      // rules={{
                      //   required: "Technician NAME is required", // Field is required
                      // }}
                      defaultValue="0"
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="Rounding"
                          {...field}
                          data={[
                            { key: "0", value: "No Rounding" },
                            { key: "1", value: "Round to One" },
                            { key: "2", value: "Round to Ten" },
                            { key: "3", value: "Round to Ten Hundredth" },
                            { key: "4", value: "Round to Five Hundredth" },
                          ]}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                    <Controller
                      name="Decimals"
                      control={control}
                      // rules={{
                      //   required: "Technician NAME is required", // Field is required
                      // }}
                      defaultValue="0" // Provide a default value here
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="Decimals"
                          {...field}
                          data={[
                            { key: "-1", value: "Default" },
                            { key: "0", value: "Without Decimals" },
                            { key: "1", value: "1 Digit" },
                            { key: "2", value: "2 Digit" },
                            { key: "3", value: "3 Digit" },
                            { key: "4", value: "4 Digit" },
                            { key: "5", value: "5 Digit" },
                          ]}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={4} xs={12} textAlign={"center"}>
                    <Controller
                      name="RoundPym"
                      control={control}
                      defaultValue="N"
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value === "Y"}
                              onChange={(e) => {
                                const RoundPymValue = e.target.checked
                                  ? "Y"
                                  : "N";
                                field.onChange(RoundPymValue);
                                setValue("Rounding in Pmnt", RoundPymValue);
                              }}
                            />
                          }
                          label="Rounding in Pmnt" // Set the label next to the checkbox
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
                type="submit"
                name={SaveUpdateName}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                color="success"
                sx={{ color: "white" }}
              >
                {SaveUpdateName}
              </Button>

              <Grid item>
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
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
