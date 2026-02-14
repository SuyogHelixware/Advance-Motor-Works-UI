import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";
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
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import Spinner from "../../Loaders/Spinner";
import useAuth from "../../Routing/AuthContext";
// import { process.env.BASE_URL } from "../Api/Constant";
import CardComponent from "../Components/CardComponent";
import {
  InputSelectTextField,
  InputTextAreaFields,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import { BeatLoader } from "react-spinners";
import InfiniteScroll from "react-infinite-scroll-component";

export default function JackMaster1() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [page, setpages] = useState("");
  const [hasMoreOpen, setHasMore] = useState(false);
  const [search, setsearch] = useState("");
  console.log("searchfdgfd data", search);
  console.log(page);

  console.log(apiData);

  const { user } = useAuth();

  const { control, reset, handleSubmit } = useForm({
    defaultValues: {
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      JackName: "",
      JackType: "",
      Remark: "",
      Status: true ? "1" : "0",
    },
  });

  // =====================================
  // normal api with pagination
  const fetchMoreData = async (page) => {
    try {
      const response = await fetch(
        `${process.env.BASE_URL}/Jack/pages/${page}`,
      );
      const result = await response.json();
      console.log("getData", result.values);

      setApiData((prevData) => [...prevData, ...result.values]);

      if (result.values.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMore(false);
    }
  };
  // ==================================

  const SearchData = (event) => {
    const query = event.target.value;
    console.log("searching for data", query);
    setsearch(query);
    setApiData([]);
    setpages(0);
    setHasMore(true);
    fetchSearchData(0, query);
  };
  // ==================
  // Search the data then call API
  const fetchSearchData = async (page, query) => {
    try {
      const res = await fetch(
        `${process.env.BASE_URL}/Jack/search/${query}/${page}`,
      );
      const result = await res.json();
      console.log("Search data:", result.values);

      // Append search data to existing apiData
      setApiData((prevData) => [...prevData, ...result.values]);

      // Disable pagination if no data is found
      if (result.values.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      setHasMore(false); // Disable pagination on error
    }
  };
  // =====================

  // ===========================
  // clear the search data
  const triggeronClickClearSearchTwice = () => {
    setsearch(""); // Clear the search state
    setApiData([]); // Clear the displayed data
    setpages(0); // Reset pagination for the original data
    setHasMore(true); // Enable pagination
    fetchMoreData(0); // Fetch original data
  };
  // ======================================

  // =========================
  // Pagination time scroll then call this function
  const loadMoreData = () => {
    if (search.trim()) {
      fetchSearchData(page, search).then(() => {
        setpages((prevPage) => prevPage + 1);
      });
    } else {
      fetchMoreData(page).then(() => {
        setpages((prevPage) => prevPage + 1);
      });
    }
  };
  // ===============================

  useEffect(() => {
    loadMoreData();
    if (search.trim() === "") {
      // If there's no search query, load original data
      fetchMoreData(0); // Fetch data from the first page of the original data
    }
  }, [search]);

  // ==============
  // set Old Data
  const setOldData = (item) => {
    console.log("Setting old data:", item);
    reset({
      UserId: user.UserId,
      CreatedBy: user.UserName,
      ModifiedBy: user.UserName,
      JackName: item.JackName,
      JackType: item.JackType,
      Remark: item.Remark,
      Status: "1" ? true : false,
    });
  };
  // =====================
  // ============================
  // Api For Post the Data
  const onSubmit = (data) => {
    console.log("Post the data", data);

    axios
      .post(`${process.env.BASE_URL}/Jack`, data)
      .then((res) => {
        console.log(res);
        if (res.data.success) {
          Swal.fire({
            title: "Success!",
            text: "Material Issued Successfully",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res.data.message,
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
  };
  // ===========================
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
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
          Jack Master List
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
                onChange={SearchData}
                value={search}
                onClickClear={triggeronClickClearSearchTwice}
              />
            </Grid>

            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={apiData.length}
              next={loadMoreData}
              hasMore={hasMoreOpen}
              loader={<BeatLoader />}
              scrollableTarget="ListScroll"
              endMessage={<Typography>No More Records</Typography>}
            >
              {apiData.map((item, i) => (
                <CardComponent
                  key={i}
                  title={item.JackName}
                  subtitle={item.JackType}
                  description={item.Remark}
                  onClick={() => setOldData(item)}
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
      <Spinner />
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
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
            // onClick={clearFormData}
            sx={{
              display: {}, // Show only on smaller screens
              position: "absolute",
              // top: "10px",
              right: "10px",
            }}
          >
            <RefreshIcon />
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
              Jack Master
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
              xs={12}
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
                      name="DocEntry"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="JACK ID"
                          type="text"
                          {...field}
                          inputProps={{ readOnly: true }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="JackName"
                      control={control}
                      //   rules={{
                      //     required: "Jack Name Id is required", // Field is required
                      //   }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="JACK NAME"
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
                      name="JackType"
                      //   rules={{
                      //     required: "please select Jack Type", // Field is required
                      //   }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          label="SELECT DOOR"
                          data={[
                            { key: "SMALL", value: "SMALL" },
                            { key: "MEDIUM", value: "MEDIUM" },
                            { key: "LARGE", value: "LARGE" },
                          ]}
                          {...field}
                          error={!!error} // Pass error state to the FormComponent if needed
                          helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Remark"
                      control={control}
                      // rules={{
                      //   required: "Jack Name Id is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextAreaFields
                          label="REMARK"
                          type="text"
                          {...field}
                          // error={!!error} // Pass error state to the FormComponent if needed
                          // helperText={error ? error.message : null} // Show the validation message
                        />
                      )}
                    />
                  </Grid>

                  <Grid
                    item
                    md={6}
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Grid item minWidth={220}>
                      <Controller
                        name="Status" // The field name used in the form
                        control={control} // Control object from useForm
                        defaultValue={false} // Optional: Set default value
                        // rules={{
                        //   required: "please select Jack Type", // Field is required
                        // }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field} // Spread the field props to connect the input with the form
                                checked={field.value} // Bind the checked state to the form's value
                              />
                            }
                            label="Active"
                            sx={{ width: "100%" }}
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
                // name={SaveUpdateName}
                color="success"
                sx={{ color: "white" }}
              >
                Save
                {/* {SaveUpdateName} */}
              </Button>
              <Button
                variant="contained"
                // disabled={SaveUpdateName === "SAVE"}
                color="error"
                // onClick={handleOnDelete}
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
