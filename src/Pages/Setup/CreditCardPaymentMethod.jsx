import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import { TabContext, TabPanel } from "@mui/lab";
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
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponent from "../Components/CardComponent";
import SearchInputField from "../Components/SearchInputField";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import dayjs from "dayjs";
import apiClient from "../../services/apiClient";
// import { DevTool } from "@hookform/devtools";
export default function CreditCardPayment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const { user } = useAuth();
  const theme = useTheme();
  const timeoutRef = useRef(null);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [PaymentCodeData, setPaymentCodeData] = useState([]);
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

  const initialFormData = {
    DocEntry: "",
    CrTypeName: "",
    CrTypeCode: "",
    DueTerms: "",
    MinCredit: "",
    MinToPay: "",
    MaxValid: "",
    InstalMent: "",
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: initialFormData,
  });

  const allformdata = getValues();

  const ClearForm = () => {
    reset(initialFormData);
    setSaveUpdateName("SAVE");
  };
  const PaymentCode = async (page) => {
    try {
      const res = await apiClient.get(`/CreditCardPaymentS/All`);
      const respons = res.data.values;
      setPaymentCodeData(respons);
    } catch (error) {
      console.error("Error fetching currency data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to Payment Code data. Please try again later.",
      });
    }
  };
  // ============================================ACTIVE TAB LOGIC CODE ==================================================================
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/CreditCardPayMeth/Search/${searchTerm}/1/${pageNum}/20`
        : `/CreditCardPayMeth/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
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
    fetchOpenListData(0); // Load first page on mount
    PaymentCode();
    fetchClosedListData(0); // Load first page on mount
  }, []);

  const setOldDataOPen = async (DocEntry) => {
    console.log(DocEntry);
    toggleSidebar();
    setSaveUpdateName("UPDATE");

    try {
      const { data } = await apiClient.get(
        `/CreditCardPayMeth/${DocEntry}`
      );
      const { values } = data;
      console.log(data);

      reset({
        ...values,
        TermType: values.TermType === "1", // Checkbox checked if TermType is "1"
        Status: values.Status === "1", // Checkbox checked if Status is "1", unchecked if "0"
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch credit card payment method details.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  // ============================================INACTIVE TAB LOGIC CODE ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/CreditCardPayMeth/Search/${searchTerm}/0/${pageNum}/20`
        : `/CreditCardPayMeth/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreClosed(false);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData]
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
      closedListSearching ? closedListquery : ""
    );
    setClosedListPage((prev) => prev + 1);
  };

  // ====================================================================================================================================

  const onsubmit = (data) => {
    console.log(data);

    const crcdpaymethod = {
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      DocEntry: data.DocEntry || "",
      CrTypeName: data.CrTypeName,
      CrTypeCode: data.CrTypeCode,
      DueTerms: data.DueTerms,
      MinCredit: data.MinCredit,
      MinToPay: data.MinToPay,
      MaxValid: data.MaxValid,
      InstalMent: data.InstalMent,
      Status: data.Status ? "1" : "0",
    };
    console.log("=========", crcdpaymethod);

    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/CreditCardPayMeth`, crcdpaymethod)
        .then((response) => {
          if (response.data.success) {
            fetchOpenListData(0);
            fetchClosedListData();
            ClearForm();
            Swal.fire({
              title: "Success!",
              text: "Credit Card Payment Method Successfully Add",
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
        })
        .catch((error) => {
          Swal.fire({
            title: "Error!",
            text: error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else {
      Swal.fire({
        text: `Do You Want Update "${crcdpaymethod.CrTypeName}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(
              `/CreditCardPayMeth/${data.DocEntry}`,
              crcdpaymethod
            )
            .then((response) => {
              if (response.data.success) {
                fetchOpenListData(0);
                fetchClosedListData(0);
                setClosedListPage(0);
                ClearForm();
                console.log(response);
                Swal.fire({
                  title: "Success!",
                  text: "Credit Card Payment Method is Updated",
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
            })
            .catch((err) => {
              Swal.fire({
                title: "Error!",
                text: err,
                icon: "warning",
                confirmButtonText: "Ok",
              });
            });
        } else {
          Swal.fire({
            text: "Credit Card Payment Method Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });
    }
  };

  const handleOnDelete = () => {
    Swal.fire({
      text: `Do You Want Delete "${allformdata.DocEntry}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/CreditCardPayMeth/${allformdata.DocEntry}`)
          .then((resp) => {
            if (resp.data.success) {
              ClearForm();
              fetchOpenListData(0);
              fetchOpenListData(0);
              fetchMoreClosedListData(0);
              Swal.fire({
                text: "Credit Card Payment Method Deleted",
                icon: "success",
                toast: true,
                showConfirmButton: false,
                timer: 1000,
              });
            } else {
              Swal.fire({
                title: resp.data.success,
                text: resp.data.message,
                icon: "info",
                toast: true,
                showConfirmButton: false,
                timer: 1500,
              });
            }
          });
      } else {
        Swal.fire({
          text: "Credit Card Payment Method Not Delete",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
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
          Credit card Payment Methods List
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="close"
          onClick={toggleSidebar}
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
                    <CardComponent
                      key={i}
                      title={item.CrTypeName}
                      subtitle={item.CrTypeCode}
                      description={item.InstalMent}
                      searchResult={openListquery}
                      onClick={() => setOldDataOPen(item.DocEntry)}
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
                  dataLength={closedListData.length} // Length of the current list
                  hasMore={hasMoreClosed && closedListData.length > 0} // Ensure hasMore is false when there's no data
                  next={fetchMoreClosedListData} // Function to fetch more data
                  loader={
                    hasMoreClosed ? (
                      <BeatLoader
                        color={
                          theme.palette.mode === "light" ? "black" : "white"
                        }
                      />
                    ) : null
                  } // Show loader only if hasMoreClosed is true
                  scrollableTarget="ListScrollClosed"
                  endMessage={
                    closedListData.length === 0 ? (
                      <Typography>No Records Found</Typography> // Message when no records are found
                    ) : (
                      <Typography>No More Records</Typography> // Message when all records are loaded
                    )
                  }
                >
                  {closedListData.map((item, i) => (
                    <CardComponent
                      key={i}
                      title={item.CrTypeName}
                      subtitle={item.CrTypeCode}
                      description={item.InstalMent}
                      searchResult={closedListquery}
                      onClick={() => setOldDataOPen(item.DocEntry)}
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
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(onsubmit)}
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
            onClick={ClearForm}
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
              Credit Card Payment Methods
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
                component="form"
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container>
                  <Grid container item>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="CrTypeName"
                        control={control}
                        rules={{ required: "this field is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="Name"
                            type="text"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="CrTypeCode"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Card"
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                            // data={card.map((item) => ({
                            //       key: item.DocEntry,
                            //       value:item.CardName,
                            // }))}
                            data={[
                              { key: "BY AIR", value: "BY AIR" },
                              {
                                key: "NEW DEFINE",
                                value: "NEW DEFINE",
                              },
                            ]}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="DueTerms"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Payment Code"
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                            // data={paymendCode.map((item) => ({
                            //   key: item.DocEntry,
                            //   value: item.Code,
                            // }))}
                            data={PaymentCodeData.map((item) => ({
                              key: item.DocEntry,
                              value: item.Code,
                            }))}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="MinCredit"
                        control={control}
                        // rules={{ required: "this field is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="Min. Credit Voucher"
                            type="number"
                            {...field}
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
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="MinToPay"
                        control={control}
                        // rules={{ required: "this field is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="Min. Payment"
                            type="number"
                            {...field}
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
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="MaxValid"
                        control={control}
                        // rules={{ required: "this field is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="Without Approval"
                            type="number"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      md={6}
                      sm={6}
                      xs={12}
                      lg={4}
                      textAlign={"center"}
                    >
                      <Controller
                        name="InstalMent"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Payment"
                            data={[
                              { key: "Y", value: "yes" },
                              { key: "N", value: "no" },
                              { key: "C", value: "Cr" },
                              { key: "L", value: "Rd" },
                            ]}
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      sm={6}
                      lg={4}
                      textAlign={"center"}
                      justifyContent={"center"}
                    >
                      <Controller
                        name="Status"
                        control={control}
                        defaultValue={false} // Default is unchecked
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                              />
                            }
                            label="Active"
                            sx={{ width: "100%", justifyContent: "center" }}
                          />
                        )}
                      />
                    </Grid>
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
    </>
  );
}
