import CloseIcon from "@mui/icons-material/Close";
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
import React, { useEffect, useRef, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import { Controller, useForm, useFormState } from "react-hook-form";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import AddIcon from "@mui/icons-material/Add";

import { Tab, Tabs } from "@mui/material";

// import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { TabContext, TabPanel } from "@mui/lab";
import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponentTwo from "../Components/CardComponentTwo";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";

export default function BinLocationMaster() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [priceList, SetPriceList] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  let [ok, setok] = useState("OK");
  const [loading, setLoading] = useState(false);

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };
  const { user } = useAuth();
  const perms = usePermissions(23);
  const timeoutRef = useRef(null);
  const initial = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName,
    Status: true,
    GroupCode: "",
    PriceList: "",
    DiscRel: "L",
    EffecPrice: "D",
    GroupName: "",
    GroupType: "",
  };
  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });
  const AllData = getValues();

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BusinessPartnerGroup/Search/${searchTerm}/1/${pageNum}/20`
        : `/BusinessPartnerGroup/Pages/1/${pageNum}/20`;

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

  // Handle search input
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

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);

  // ============================================Closed List Start ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BusinessPartnerGroup/Search/${searchTerm}/0/${pageNum}/20`
        : `/BusinessPartnerGroup/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreClosed(newData.length === 20);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle search input
  const handleClosedListSearch = (res) => {
    setClosedListQuery(res);
    setClosedListSearching(true);
    setClosedListPage(0);
    setClosedListData([]); // Clear current data
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchClosedListData(0, res);
    }, 600);
  };

  // Clear search
  const handleClosedListClear = () => {
    setClosedListQuery(""); // Clear search input
    setClosedListSearching(false); // Reset search state
    setClosedListPage(0); // Reset page count
    setClosedListData([]); // Clear data
    fetchClosedListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreClosedListData = () => {
    fetchClosedListData(
      closedListPage + 1,
      closedListSearching ? closedListquery : "",
    );
    setClosedListPage((prev) => prev + 1);
  };
  useEffect(() => {
    fetchClosedListData(0); // Load first page on mount
  }, []);
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
          setOldDataOPen(DocEntry);
          setSelectedData(DocEntry);

          setSaveUpdateName("UPDATE");
        });
      } else {
        setOldDataOPen(DocEntry);
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
  const setOldDataOPen = async (DocEntry) => {
    toggleSidebar();
    setSaveUpdateName("UPDATE");
    PriceListData();
    setSelectedData(DocEntry);

    try {
      setLoading(true);
      const { data } = await apiClient.get(`/BusinessPartnerGroup/${DocEntry}`);
      console.log(data);
      let { values } = data;
      console.log("=========", values);
      reset({
        ...values,
        Status: values.Status === "1" ? true : false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to set Business Partner Group data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const ClearFormData = () => {
    // ("SAVE")
    // SaveUpdateName("SAVE")
    setSelectedData([]);
    setSaveUpdateName("SAVE");

    reset(initial);
  };

  const PriceListData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/PriceList/All`);

      if (res.data.success) {
        // Filter only records with Status === "1"
        const filteredResponse = res.data.values.filter(
          (item) => item.Status === "1",
        );

        SetPriceList(filteredResponse);
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch bank data.",
          icon: "error",
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
          "Failed to fetch Pricelist data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    PriceListData();
  }, []);

  const handleSumbit = async (data) => {
  const obj = {
    ...data,
    Status: data.Status ? "1" : "0",
    PriceList: String(data.PriceList),
  };

  const normalizeString = (str) =>
    str.replace(/\s+/g, "").toLowerCase();

  // ✅ SAVE MODE
  if (SaveUpdateName === "SAVE") {
    if (Array.isArray(openListData)) {
      const isExisting = openListData.some(
        (item) =>
          normalizeString(item.GroupName) ===
          normalizeString(data.GroupName)
      );

      if (isExisting) {
        Swal.fire({
          text: "Business Partner Group Name Already Exist!",
          icon: "info",
          confirmButtonText: "Ok",
        });
        return;
      }
    } else {
      return;
    }

    try {
      setLoading(true);

      const res = await apiClient.post(`/BusinessPartnerGroup`, obj);

      if (res.data?.success) {
        ClearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "Business Partner Group added Successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data?.message || "Save failed",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Save error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }

    return;
  }

  // ✅ UPDATE MODE
  const confirm = await Swal.fire({
    text: `Do You Want to Update "${obj.GroupName}"`,
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showCancelButton: true,
  });

  if (!confirm.isConfirmed) {
    Swal.fire({
      text: "Business Partner Group Not Updated",
      icon: "info",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  try {
    setLoading(true);

    const response = await apiClient.put(
      `/BusinessPartnerGroup/${data.DocEntry}`,
      obj
    );

    if (response.data?.success) {
      ClearFormData();

      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      setClosedListPage(0);
      setClosedListData([]);
      fetchClosedListData(0);

      Swal.fire({
        title: "Success!",
        text: "Business Partner Group Updated",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1000,
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: response.data?.message || "Update failed",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Update error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while updating.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

 const handleDelete = async () => {
  const result = await Swal.fire({
    text: `Do You Want to delete "${AllData.GroupName}"`,
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showCancelButton: true,
  });

  if (!result.isConfirmed) {
    Swal.fire({
      text: "Business Partner Group Not Deleted",
      icon: "info",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  try {
    setLoading(true);

    const response = await apiClient.delete(
      `/BusinessPartnerGroup/${AllData.DocEntry}`
    );

    if (response.data?.success) {
      ClearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Business Partner Group Deleted",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      // ✅ business error (200 but success=false)
      Swal.fire({
        title: "Error!",
        text: response.data?.message || "Delete failed",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong while deleting.",
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
          Business Partner Group List
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
                onChange={handleTabChangeRight}
                indicatorColor="primary"
                textColor="inherit"
              >
                <Tab value="1" label="Active" />
                <Tab value="0" label="Inactive" />
              </Tabs>
              <TabPanel
                value={"1"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
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
                    backgroundColor: "#F5F6FA",
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
                    <CardComponentTwo
                      key={i}
                      title={item.GroupName}
                      subtitle={item.GroupType === "C" ? "Customer" : "Vendor"}
                      searchResult={openListquery}
                      isSelected={selectedData === item.DocEntry}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>
              <TabPanel
                value={"0"}
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ListScrollClosed"
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
                    backgroundColor: "#F5F6FA",
                  }}
                >
                  <SearchInputField
                    onChange={(e) => handleClosedListSearch(e.target.value)}
                    value={closedListquery}
                    onClickClear={handleClosedListClear}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  dataLength={closedListData.length}
                  hasMore={hasMoreClosed}
                  next={fetchMoreClosedListData}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScrollClosed"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {closedListData.map((item, i) => (
                    <CardComponentTwo
                      key={i}
                      title={item.GroupName}
                      subtitle={item.GroupType === "C" ? "Customer" : "Vendor"}
                      searchResult={closedListquery}
                      isSelected={selectedData === item.DocEntry}
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
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(handleSumbit)}
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

        {/* User Creation Form Grid */}

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
          {/* Hamburger Menu for smaller screens */}

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
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
            onClick={ClearFormData}
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
              Business Partner Group
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
                // component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="GroupName"
                      control={control}
                      rules={{
                        required: "Group Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "Group Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => {
                        const removeEmojis = (str) =>
                          str.replace(
                            /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g,
                            "",
                          );

                        return (
                          <InputTextField
                            label="GROUP NAME"
                            inputProps={{ maxLength: 20 }}
                            type="text"
                            {...field}
                            onChange={(e) => {
                              const cleaned = removeEmojis(e.target.value);
                              field.onChange(cleaned);
                            }}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        );
                      }}
                    />
                  </Grid>
                  <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="GroupType"
                      control={control}
                      rules={{ required: "Group Type is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="DiscRel"
                          label="GROUP TYPE"
                          data={[
                            {
                              key: "C",
                              value: "Customer",
                            },
                            {
                              key: "V",
                              value: "Vendor",
                            },
                          ]}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="PriceList"
                      control={control}
                      rules={{ required: "Price List is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="PriceList"
                          label="PRICE LIST"
                          data={priceList.map((item) => ({
                            key: item.DocEntry,
                            value: item.ListName,
                          }))}
                        />
                      )}
                    />
                  </Grid>

                  <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="DiscRel"
                      control={control}
                      // rules={{ required: "Effective Discount Group is Required" }}
                      defaultValue="L"
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="DiscRel"
                          label="EFFECTIVE DISCOUNT GROUP"
                          data={[
                            {
                              key: "L",
                              value: "Lowest Discount",
                            },
                            {
                              key: "H",
                              value: "Highest Discount",
                            },
                            {
                              key: "A",
                              value: "Average",
                            },
                            {
                              key: "T",
                              value: "Total",
                            },
                            {
                              key: "M",
                              value: "Discount Multiples",
                            },
                          ]}
                        />
                      )}
                    />
                  </Grid>

                  <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="EffecPrice"
                      control={control}
                      defaultValue="D"
                      // rules={{ required: "Effective Price is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="EffecPrice"
                          label="EFFECTIVE PRICE"
                          data={[
                            {
                              key: "D",
                              value: "Default Priority",
                            },
                            {
                              key: "L",
                              value: "Lowest Price ",
                            },
                            {
                              key: "H",
                              value: "Highest Price",
                            },
                          ]}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    lg={4}
                    md={6}
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                    mt={1}
                  >
                    <Controller
                      name="Status"
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
                          label="ACTIVE"
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
                sx={{ color: "white" }}
                color="success"
                type="submit"
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                // disabled={tab !== "1"}
              >
                {SaveUpdateName}
              </Button>

              <Button
                variant="contained"
                color="error"
                disabled={!perms.IsDelete}
                onClick={handleDelete}
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
