import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import { TabContext, TabPanel } from "@mui/lab";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponent from "../Components/CardComponent";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";

export default function PaymentTerm() {
  const theme = useTheme();
  const { user } = useAuth();
  const perms = usePermissions(25);
  const [tab, settab] = useState("1");
  const timeoutRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [price, setPrice] = useState([]);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [selectedData, setSelectedData] = useState([]);

  //=========================================open List State End================================================================

  //=====================================closed List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  let [ok, setok] = useState("OK");

  //=========================================closed List State End================================================================
  const [isLoading, setIsLoading] = useState(false);

  const initialFormData = {
    // DocEntry: "",
    PymntGroup: "",
    BslineDate: "T",
    PayDuMonth: "E",
    ExtraDays: "",
    ExtraMonth: "",
    TolDays: "",
    VolumDscnt: "",
    LatePyChrg: "",
    ListNum: price.length > 0 ? price[0].DocEntry : "",
    CredLimit: "",
    CommitLimit: "",
    Status: "1",
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const { control, handleSubmit, getValues, reset, setValue, watch } = useForm({
    defaultValues: initialFormData,
  });
  const { isDirty } = useFormState({ control });

  // const currentData = getValues();
  const allFormData = getValues();

  const ClearForm = () => {
    setSelectedData([]);
    reset(initialFormData);
    setSaveUpdateName("SAVE");
  };

  // ==============================================
  // Open Tab Api Binding PurchaseRequest
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/PaymentTerms/Search/${searchTerm}/1/${pageNum}/20`
        : `/PaymentTerms/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        console.log("Open Tab", newData);

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

  useEffect(() => {
    fetchOpenListData(0);
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
          setSelectedData(DocEntry);
          setOldData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setOldData(DocEntry);
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
  const setOldData = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setIsLoading(true);

      const response = await apiClient.get(`/PaymentTerms/${DocEntry}`);

      const { success, values, message } = response?.data || {};

      // ❌ API responded but failed
      if (!success) {
        Swal.fire({
          icon: "error",
          text: message || "Failed to fetch payment terms data",
          confirmButtonText: "OK",
        });
        return;
      }

      // ❌ No data returned
      if (!values) {
        Swal.fire({
          icon: "warning",
          text: "Payment terms data not found.",
          confirmButtonText: "OK",
        });
        return;
      }

      // ✅ Success flow
      toggleDrawer();
      setSaveUpdateName("UPDATE");

      reset({
        ...values,
      });

      setSelectedData(DocEntry);
    } catch (error) {
      let errorMessage = "Something went wrong while fetching data.";

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
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================================
  // Close Tab Api Binding
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/PaymentTerms/Search/${searchTerm}/0/${pageNum}/20`
        : `/PaymentTerms/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        console.log("Close Tab", newData);

        setHasMoreClosed(newData.length === 20);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClosedListSearch = (res) => {
    setClosedListQuery(res);
    setClosedListSearching(true);
    setClosedListPage(0);
    fetchClosedListData(0);
    setClosedListData([]); // Clear current data
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchClosedListData(0, res);
    }, 600);
  };

  const handleClosedListClear = () => {
    setClosedListQuery(""); // Clear search input
    setClosedListSearching(false); // Reset search state
    setClosedListPage(0); // Reset page count
    setClosedListData([]); // Clear data
    fetchClosedListData(0); // Fetch first page without search
  };

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

  //PRICE LIST Drop Down Select Field Logic
  const FetchPriceList = async () => {
    try {
      setIsLoading(true);

      const response = await apiClient.get("/PriceList/All");

      const { success, values, message } = response?.data || {};

      // ❌ API responded but failed
      if (!success) {
        Swal.fire({
          icon: "error",
          text: message || "Failed to fetch Price List data!",
          confirmButtonText: "OK",
        });
        return;
      }

      // ✅ Filter active price lists
      const filteredResponse = Array.isArray(values)
        ? values.filter((item) => item.Status === "1")
        : [];

      setPrice(filteredResponse);

      // ❌ No active price list found
      if (filteredResponse.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Price List Found!",
          text: "Please add a Price List first.",
          confirmButtonText: "OK",
        });

        setValue("ListNum", "");
        return;
      }

      // ✅ Set default first price list
      setValue("ListNum", filteredResponse[0].DocEntry);
    } catch (error) {
      let errorMessage = "Failed to fetch Price List data!";

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

      console.error("FetchPriceList error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FetchPriceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //=============================================================
  const StatusValue = watch("Status");

  const onsubmit = async (data) => {
    const paymentterms = {
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      Status: StatusValue === "1" ? "1" : "0",
      PymntGroup: data.PymntGroup,
      BslineDate: data.BslineDate,
      PayDuMonth: data.PayDuMonth,
      ExtraDays: String(data.ExtraDays || "0"),
      ExtraMonth: String(data.ExtraMonth || "0"),
      TolDays: String(data.TolDays || "0"),
      VolumDscnt: String(data.VolumDscnt || "0"),
      LatePyChrg: String(data.LatePyChrg || "0"),
      ListNum: String(data.ListNum || "0"),
      CredLimit: String(data.CredLimit || "0"),
      CommitLimit: String(data.CommitLimit || "0"),
    };

    try {
      setIsLoading(true);

      /* ================= SAVE ================= */
      if (SaveUpdateName === "SAVE") {
        if (!Array.isArray(openListData)) return;

        const normalizeString = (str) => str.replace(/\s+/g, "").toLowerCase();

        const isExistingName = openListData.some(
          (item) =>
            normalizeString(item.PymntGroup) ===
            normalizeString(data.PymntGroup),
        );

        if (isExistingName) {
          Swal.fire({
            icon: "info",
            text: "Payment Term Code already exists!",
            confirmButtonText: "OK",
          });
          return;
        }

        const response = await apiClient.post("/PaymentTerms", paymentterms);

        const { success, message } = response?.data || {};

        if (!success) {
          Swal.fire({
            icon: "error",
            text: message || "Failed to save Payment Term",
            confirmButtonText: "OK",
          });
          return;
        }

        // ✅ Save success
        ClearForm();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);
        setClosedListPage(0);
        setClosedListData([]);
        fetchClosedListData(0);

        Swal.fire({
          icon: "success",
          text: "Payment Term added successfully",
          confirmButtonText: "OK",
        });
      } else {

      /* ================= UPDATE ================= */
        const confirmation = await Swal.fire({
          text: `Do you want to update "${paymentterms.PymntGroup}"?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "YES",
          cancelButtonText: "NO",
        });

        if (!confirmation.isConfirmed) {
          Swal.fire({
            icon: "info",
            text: "Payment Term not updated",
            confirmButtonText: "OK",
          });
          return;
        }

        const response = await apiClient.put(
          `/PaymentTerms/${allFormData.DocEntry}`,
          paymentterms,
        );

        const { success, message } = response?.data || {};

        if (!success) {
          Swal.fire({
            icon: "error",
            text: message || "Failed to update Payment Term",
            confirmButtonText: "OK",
          });
          return;
        }

        // ✅ Update success
        ClearForm();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);
        setClosedListPage(0);
        setClosedListData([]);
        fetchClosedListData(0);

        Swal.fire({
          icon: "success",
          text: "Payment Term updated successfully",
          confirmButtonText: "OK",
          timer: 1500,
        });
      }
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
        confirmButtonText: "OK",
      });

      console.error("PaymentTerms submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnDelete = async () => {
    if (!allFormData?.DocEntry) return;

    const confirmation = await Swal.fire({
      text: "Do you want to delete?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
    });

    if (!confirmation.isConfirmed) {
      Swal.fire({
        icon: "info",
        text: "Payment Term is not deleted",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiClient.delete(
        `/PaymentTerms/${allFormData.DocEntry}`,
      );

      const { success, message } = response?.data || {};

      // ❌ API responded but delete failed
      if (!success) {
        Swal.fire({
          icon: "error",
          text: message || "Failed to delete Payment Term",
          confirmButtonText: "OK",
        });
        return;
      }

      // ✅ Delete success
      ClearForm();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);
      setClosedListPage(0);
      setClosedListData([]);
      fetchClosedListData(0);

      Swal.fire({
        icon: "success",
        text: "Payment Term deleted successfully",
        confirmButtonText: "OK",
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

      console.error("PaymentTerms delete error:", error);
    } finally {
      setIsLoading(false);
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
          Payment Terms List
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
                <Tab value="2" label="InActive" />
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
                  loader={<BeatLoader />}
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {openListData.map((item, i) => (
                    <CardComponent
                      key={i}
                      title={item.PymntGroup}
                      subtitle={`MONTHS-${item.ExtraMonth}`}
                      description={`DAYS-${item.ExtraDays}`}
                      searchResult={openListquery}
                      isSelected={selectedData === item.DocEntry}
                      onClick={() => setOldOpenData(item.DocEntry)}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              <TabPanel
                value={"2"}
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
                  loader={<BeatLoader />}
                  scrollableTarget="ListScrollClosed"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {closedListData.map((item, i) => (
                    <CardComponent
                      key={i}
                      title={item.PymntGroup}
                      subtitle={`MONTHS-${item.ExtraMonth}`}
                      description={`DAYS-${item.ExtraDays}`}
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
      {isLoading && <Loader open={isLoading} />}

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(onsubmit)}
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
            onClick={ClearForm}
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
              Payment Terms
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
                  <Grid item md={4} xs={12} textAlign={"center"}>
                    <Controller
                      name="PymntGroup"
                      rules={{
                        required: "Payment Term Code is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Payment Term Code cannot be empty",
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="PAYMENT TERM CODE"
                          type="text"
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
                  <Grid
                    item
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Controller
                      name="BslineDate"
                      rules={{ required: "This field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="DUE DATE BASED ON"
                          data={[
                            { key: "P", value: "Posting Date" },
                            { key: "S", value: "System Date" },
                            { key: "T", value: "Document Date" },
                          ]}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={4} xs={12} textAlign={"center"}>
                    {/* ----------------UI DISPLAY THE SPACE----------------------- */}
                  </Grid>

                  <Grid
                    item
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Controller
                      name="PayDuMonth"
                      rules={{ required: "This field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          type="text"
                          {...field}
                          // error={!!error}
                          // helperText={error ? error.message : null}
                          label="START FROM"
                          data={[
                            { key: "E", value: "Month End" },
                            { key: "H", value: "Half Month" },
                            { key: "Y", value: "Month Start" },
                            { key: "N", value: "As Per Document" },
                          ]}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Controller
                      name="ExtraMonth"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="MONTHS"
                          type="number"
                          inputProps={{
                            maxLength: 6, // Note: this will be ignored for number input
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 6) {
                                e.target.value = e.target.value.slice(0, 6);
                              }
                            },
                          }}
                          {...field}
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
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Controller
                      name="ExtraDays"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="DAYS"
                          type="number"
                          inputProps={{
                            maxLength: 6, // Note: this will be ignored for number input
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 6) {
                                e.target.value = e.target.value.slice(0, 6);
                              }
                            },
                          }}
                          {...field}
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

                  <Grid item md={4} xs={12} textAlign={"center"}>
                    <Controller
                      name="TolDays"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TOLERANCE DAYS"
                          type="number"
                          inputProps={{
                            maxLength: 6, // Note: this will be ignored for number input
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 6) {
                                e.target.value = e.target.value.slice(0, 6);
                              }
                            },
                          }}
                          {...field}
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
                  <Grid item md={4} xs={12} textAlign={"center"}>
                    <Controller
                      name="Status"
                      control={control}
                      defaultValue="0"
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
                                setValue("Active", newValueStatus);
                              }}
                            />
                          }
                          label="Active"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    {/* ----------------UI DISPLAY THE SPACE----------------------- */}
                  </Grid>

                  <Grid item md={12} xs={12} textAlign={"center"}>
                    <Divider />
                    <Typography
                      style={{
                        fontWeight: "bold",
                        textDecoration: "underline",
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      BP Fields
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Controller
                      name="VolumDscnt"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TOTAL DISCOUNT %"
                          type="number"
                          {...field}
                          inputProps={{
                            maxLength: 15, // Note: this will be ignored for number input
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
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

                  <Grid
                    item
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Controller
                      name="LatePyChrg"
                      rules={{
                        validate: (value) => {
                          if (Number(value) < 0) {
                            return "Must be greater than 0";
                          }
                        },
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="INTEREST % ON RECEIVABLES"
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
                  <Grid item md={4} xs={12} textAlign={"center"}>
                    {/* ----------------UI DISPLAY THE SPACE----------------------- */}
                  </Grid>
                  <Grid
                    item
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    // display={"flex"}
                    // justifyContent={"center"}
                    // alignItems={"center"}
                  >
                    <Controller
                      name="ListNum"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="PRICE LIST  "
                          data={price.map((item) => ({
                            key: item.DocEntry,
                            value: item.ListName,
                          }))}
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Controller
                      name="CredLimit"
                      rules={{
                        validate: (value) => {
                          if (Number(value) < 0) {
                            return "Must be greater than 0";
                          }
                        },
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="MAX. CREDIT"
                          type="number"
                          inputProps={{
                            maxLength: 15, // Note: this will be ignored for number input
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
                              }
                            },
                          }}
                          {...field}
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
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  ></Grid>
                  <Grid
                    item
                    md={4}
                    xs={12}
                    textAlign={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Controller
                      name="CommitLimit"
                      rules={{
                        validate: (value) => {
                          if (Number(value) < 0) {
                            return "Must be greater than 0";
                          }
                        },
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="COMMITMENT LIMIT"
                          type="number"
                          inputProps={{
                            maxLength: 15, // Note: this will be ignored for number input
                            onInput: (e) => {
                              // Restrict input to 6 digits
                              if (e.target.value.length > 15) {
                                e.target.value = e.target.value.slice(0, 15);
                              }
                            },
                          }}
                          {...field}
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
