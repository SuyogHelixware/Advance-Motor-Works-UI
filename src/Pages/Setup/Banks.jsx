import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  // Checkbox,
  // FormControlLabel,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
// import InfiniteScroll from "react-infinite-scroll-component";
import Swal from "sweetalert2";
// import CardComponent from "../Components/CardComponent";
import {
  // InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import InfiniteScroll from "react-infinite-scroll-component";
import CardComponent from "../Components/CardComponent";
import { BeatLoader } from "react-spinners";
import CountryCodeSelector from "../Components/CountryCode";
import useAuth from "../../Routing/AuthContext";
import dayjs from "dayjs";
import { Loader } from "../Components/Loader";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function Bank() {
  const theme = useTheme();
  const perms = usePermissions(35);

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

  const initial = {
    CountryCode: "IND",
    BankCode: "",
    BankName: "",
    Description: "",
    PostOffice: false,
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  //==========================================useForm===================================================
  const { control, handleSubmit, reset } = useForm({
    defaultValues: initial,
  });
  // const newValue = watch("PostOffice");
  const { isDirty } = useFormState({ control });
  //=======================================set data to fields========================================================
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
          setBankDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setBankDataList(DocEntry);
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
  const setBankDataList = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);

      const response = await apiClient.get(`/BankSetup/${DocEntry}`);

      if (response.data?.success === false) {
        // ✅ business error (200 but success=false)
        Swal.fire({
          title: "Warning!",
          text: response.data?.message || "Bank data not found.",
          icon: "warning",
          confirmButtonText: "Ok",
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
      console.error("Bank data fetch error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch bank data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFormData = () => {
    setDocEntry("");
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
  };

  //==============================================Active List===================================================
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
        ? `/BankSetup/Search/${searchTerm}/1/${pageNum}/20`
        : `/BankSetup/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch bank data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  //=========================================post and put api==========================

  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Status: "1",
      CountryCode: String(data.CountryCode),
      BankCode: String(data.BankCode),
      BankName: String(data.BankName),
      SwiftNum: "string",
      PostOffice: "Y", // Assign "Y" if checked, else "N"
      DfltAcct: "string",
      DfltBranch: "string",
      IFSCCode: "string",
      oLines: [],
    };

    try {
      setLoading(true);
      if (SaveUpdateName === "SAVE") {
        const normalizeString = (str) => {
          return str.replace(/\s+/g, "").toLowerCase();
        };
        if (Array.isArray(openListData)) {
          const isExistingSAC = openListData.some(
            (item) =>
              normalizeString(item.BankCode) ===
                normalizeString(data.BankCode) &&
              normalizeString(item.CountryCode) ===
                normalizeString(data.CountryCode),
          );

          if (isExistingSAC) {
            Swal.fire({
              text: "Bank Code Already Exist for selected Country Code !",
              icon: "info",
              showConfirmButton: true,
            });
            return;
          }
        } else {
          return;
        }
        const response = await apiClient.post(`/BankSetup`, obj);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: " Bank is Added",
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
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.BankName}" `,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          setLoading(true);
          const response = await apiClient.put(`/BankSetup/${DocEntry}`, obj);
          const { success, message } = response.data;
          setLoading(false);
          if (success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: " Bank Updated",
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
            text: " Record is not Updated !",
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
          "Failed to fetch bank data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  //==========================================delete api===========================
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
        const response = await apiClient.delete(`/BankSetup/${DocEntry}`);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: " Bank Deleted",
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
          text: " Bank is Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting Bank:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch bank data.",
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
          Bank List
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
                  title={item.BankCode}
                  subtitle={item.BankName}
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
              Bank
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
                  {/* <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="CountryCode"
                      control={control}
                      rules={{
                        required: "Country Code is required", // Field is required
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="COUNTRY CODE"
                          type="text"
                          disabled={!!DocEntry}
                          {...field}
                          inputProps={{ maxLength: 3 }}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="CountryCode"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <CountryCodeSelector
                          label="COUNTRY CODE"
                          value={field.value}
                          onChange={(code) => field.onChange(code)}
                          disabled={false}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="BankCode"
                      control={control}
                      rules={{
                        validate: (value) =>
                          value.trim() !== "" || "Bank Code cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="BANK CODE"
                          type="text"
                          disabled={!!DocEntry}
                          {...field}
                          inputProps={{ maxLength: 30 }}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="BankName"
                      control={control}
                      rules={{
                        required: "Bank Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "Bank Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="BANK NAME"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 250 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  {/* <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="PostOffice"
                      control={control}
                      defaultValue="N"
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value === "Y"}
                              onChange={(e) => {
                                const newValue = e.target.checked ? "Y" : "N";
                                field.onChange(newValue);
                                setValue("PostOffice", newValue);
                              }}
                            />
                          }
                          label="POST OFFICE" // Set the label next to the checkbox
                        />
                      )}
                    />
                  </Grid> */}
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
