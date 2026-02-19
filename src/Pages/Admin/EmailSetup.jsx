import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  Paper,
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

export default function EmailSetup() {
  const theme = useTheme();
  const perms = usePermissions(15);
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
    Name: "",
    Email: "",
    SMTPServer: "",
    SMTPPort: "",
    UseSSL: true,
    Username: "",
    Password: "",
    IsDefault: true,
    IAMPServer: "",
    IMAPPort: "",
    IMAPUseSSL: false,
    IMAPUsername: "",
    IMAPPassword: "",
    EnableIncoming: true,
    EnableOutgoing: false,
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
        ? `/Email?SearchText=${searchTerm}&Status=1&Page=${pageNum}&Limit=20`
        : `/Email?Status=1&Page=${pageNum}&Limit=20`;

      const response = await apiClient.get(url);

      if (response?.data?.success) {
        const newData = response.data.values || [];

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: response?.data?.message || "No records found",
        });
      }
    } catch (error) {
      console.error("Error fetching open email list:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch email data. Please try again later.",
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
    clearFormData();
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
          setEmailData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setEmailData(DocEntry);
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
  const setEmailData = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);

      const response = await apiClient.get(`/Email?DocEntry=${DocEntry}`);

      if (response?.data?.success) {
        const data = response.data.values;

        toggleDrawer();
        reset(data);
        setSaveUpdateName("UPDATE");
        setDocEntry(DocEntry);
        setSelectedData(DocEntry);
      } else {
        Swal.fire({
          title: "Warning!",
          text: response?.data?.message || "Email data not found",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error fetching email data:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred while fetching the Email data.",
        icon: "error",
        confirmButtonText: "Ok",
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
    const obj = {
      DocEntry: data.DocEntry || "",
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Name: String(data.Name),
      Email: String(data.Email),
      SMTPServer: String(data.SMTPServer),
      SMTPPort: String(data.SMTPPort),
      UseSSL: Boolean(data.UseSSL),
      Username: String(data.Username),
      Password: String(data.Password),
      IsDefault: Boolean(data.IsDefault),
      IMAPServer: data.IMAPServer ? String(data.IMAPServer) : null,
      IMAPPort: data.IMAPPort ? String(data.IMAPPort) : null,
      IMAPUsername: data.IMAPUsername ? String(data.IMAPUsername) : null,
      IMAPPassword: data.IMAPPassword ? String(data.IMAPPassword) : null,
      IMAPUseSSL: Boolean(data.IMAPUseSSL),
      EnableIncoming: Boolean(data.EnableIncoming),
      EnableOutgoing: Boolean(data.EnableOutgoing),
      Status: "1",
    };

    try {
      setLoading(true);

      // ================= SAVE =================
      if (SaveUpdateName === "SAVE") {
        const resp = await apiClient.post(`/Email`, obj);

        if (resp?.data?.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);

          Swal.fire({
            title: "Success!",
            text: "Email Added Successfully",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: resp?.data?.message || "Email not added",
            icon: "warning",
          });
        }
        return;
      }

      // ================= UPDATE =================
      const result = await Swal.fire({
        text: `Do You Want to Update "${data.Name}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "YES",
        cancelButtonText: "NO",
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Email Not Updated",
          icon: "info",
          toast: true,
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      const response = await apiClient.put(`/Email/${DocEntry}`, obj);

      if (response?.data?.success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "Email Updated Successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response?.data?.message || "Email update failed",
          icon: "warning",
        });
      }
    } catch (error) {
      console.error("Error submitting email form:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============Delete API ===================================

  const handleOnDelete = async (data) => {
    const result = await Swal.fire({
      text: "Do You Want to Delete?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Email Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.delete(`/Email/${DocEntry}`);

      if (response?.data?.success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          text: "Email Deleted Successfully",
          icon: "success",
          toast: true,
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        Swal.fire({
          text: response?.data?.message || "Email not deleted",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting email:", error);

      Swal.fire({
        text:
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred while deleting the Email.",
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
          E-mail List
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
                  title={item.Name}
                  subtitle={item.Email}
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
              E-mail Setup
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
                <Grid container spacing={2}>
                  {/* -------------------- BASIC EMAIL SETTINGS -------------------- */}
                  <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="h6" mb={2}>
                        Basic Email Settings
                      </Typography>

                      <Grid container spacing={2} textTransform={"uppercase"}>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="Name"
                            control={control}
                            rules={{
                              required: "Name is required",
                              validate: (value) =>
                                value.trim() !== "" || "Name cannot be empty",
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="NAME"
                                type="text"
                                inputProps={{ maxLength: 100 }}
                                {...field}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="Email"
                            control={control}
                            rules={{
                              required: "Required",
                              pattern: {
                                value:
                                  /^[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/,
                                message: "Invalid email format",
                              },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="EMAIL"
                                type="email"
                                {...field}
                                inputProps={{ maxLength: 100 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          container
                          justifyContent="center"
                          alignItems="center"
                          textAlign="center"
                          mt={1}
                        >
                          <Controller
                            name="IsDefault"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...field}
                                    checked={field.value}
                                    sx={{ mr: 1 }}
                                  />
                                }
                                label="IS DEFAULT"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* -------------------- SMTP SETTINGS -------------------- */}
                  <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="h6" mb={2}>
                        SMTP Settings (Sending)
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="SMTPServer"
                            control={control}
                            rules={{
                              required: "SMTP Server is required",
                              validate: (value) =>
                                value.trim() !== "" ||
                                "SMTP Server cannot be empty",
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="SMTP SERVER"
                                type="text"
                                {...field}
                                inputProps={{ maxLength: 50 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="SMTPPort"
                            control={control}
                            rules={{
                              required: "SMTP Port  is required",
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="SMTP PORT"
                                type="number"
                                {...field}
                                inputProps={{ maxLength: 10 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          container
                          justifyContent="center"
                          alignItems="center"
                          textAlign="center"
                          mt={1}
                        >
                          <Controller
                            name="UseSSL"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...field}
                                    checked={field.value}
                                    sx={{ mr: 1 }}
                                  />
                                }
                                label="UseSSL"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="Username"
                            control={control}
                            rules={{
                              required: "Username is required",
                              validate: (value) =>
                                value.trim() !== "" ||
                                "Username cannot be empty",
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="USERNAME"
                                type="text"
                                {...field}
                                inputProps={{ maxLength: 100 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="Password"
                            control={control}
                            rules={{
                              required: "Password is required",
                              validate: (value) =>
                                value.trim() !== "" ||
                                "Password cannot be empty",
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="PASSWORD"
                                type="text"
                                {...field}
                                inputProps={{ maxLength: 100 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          container
                          justifyContent="center"
                          alignItems="center"
                          textAlign="center"
                          mt={1}
                        >
                          <Controller
                            name="EnableOutgoing"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...field}
                                    checked={field.value}
                                    sx={{ mr: 1 }}
                                  />
                                }
                                label="ENABLE OUTGOING"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* -------------------- IMAP SETTINGS -------------------- */}
                  <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="h6" mb={2}>
                        IMAP Settings (Receiving)
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="IAMPServer"
                            control={control}
                            // rules={{
                            //   required: "IAMP Server is required",
                            //   validate: (value) =>
                            //     value.trim() !== "" ||
                            //     "IAMP Server cannot be empty",
                            // }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="IAMP SERVER"
                                type="text"
                                {...field}
                                inputProps={{ maxLength: 100 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="IMAPPort"
                            control={control}
                            // rules={{
                            //   required: "IMAP Port is required",
                            //   validate: (value) =>
                            //     value.trim() !== "" ||
                            //     "IMAP Port cannot be empty",
                            // }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="IAMP PORT"
                                type="number"
                                {...field}
                                inputProps={{ maxLength: 100 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          container
                          justifyContent="center"
                          alignItems="center"
                          textAlign="center"
                          mt={1}
                        >
                          <Controller
                            name="IMAPUseSSL"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...field}
                                    checked={field.value}
                                    sx={{ mr: 1 }}
                                  />
                                }
                                label="IMAP UseSSL"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="IMAPUsername"
                            control={control}
                            // rules={{
                            //   required: "IMAP Username is required",
                            //   validate: (value) =>
                            //     value.trim() !== "" ||
                            //     "IMAP Username cannot be empty",
                            // }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="IAMP USERNAME"
                                type="text"
                                {...field}
                                inputProps={{ maxLength: 100 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} textAlign={"center"}>
                          <Controller
                            name="IMAPPassword"
                            control={control}
                            // rules={{
                            //   required: "IMAP Password is required",
                            //   validate: (value) =>
                            //     value.trim() !== "" ||
                            //     "IMAP Password cannot be empty",
                            // }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="IAMP PASSWORD"
                                type="text"
                                {...field}
                                inputProps={{ maxLength: 100 }}
                                error={!!error}
                                sx={{ maxWidth: 300, width: "100%" }}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          container
                          justifyContent="center"
                          alignItems="center"
                          textAlign="center"
                          mt={1}
                        >
                          <Controller
                            name="EnableIncoming"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    {...field}
                                    checked={field.value}
                                    sx={{ mr: 1 }}
                                  />
                                }
                                label="ENABLE INCOMING"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
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
