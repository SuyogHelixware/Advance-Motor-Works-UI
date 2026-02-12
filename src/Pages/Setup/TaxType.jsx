import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
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

export default function TaxType() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const [taxCategories, setTaxCategories] = useState([]);

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const timeoutRef = useRef(null);
  const { user } = useAuth();
 const perms = usePermissions(27);
  let [ok, setok] = useState("OK");
  const [loading, setLoading] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const initial = {
    Name: "",
    Description: "",
    TaxCategory: "",
    TaxAmtKey: "",
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  //===================================clear form data=================================================
  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    
    setSelectedData([]);
  };

  // ===============API for Setting specific Cards data==============================================
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
          setTaxDataList(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setTaxDataList(DocEntry);
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

  //=============================================set data to fields====================================
 const setTaxDataList = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true); // Show loader

    const response = await apiClient.get(`/TaxType/${DocEntry}`);

    const data = response?.data?.values;

    if (!data) {
      Swal.fire({
        title: "Warning!",
        text: "No Tax Data found for the selected entry.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Open drawer and populate form
    toggleDrawer();
    reset(data);
    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);
  } catch (error) {
    console.error("Error fetching Tax Data:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || "An error occurred while fetching Tax Data",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Hide loader
  }
};


  //===============================================Active list=========================================
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
  const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
  try {
    setLoading(true); // Show loader

    const url = searchTerm
      ? `/TaxType/Search/${searchTerm}/1/${pageNum}/20`
      : `/TaxType/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);
    const data = response?.data;

    if (data?.success) {
      const newData = data.values || [];

      // Update hasMoreOpen flag for infinite scrolling
      setHasMoreOpen(newData.length === 20);

      // Append or replace data depending on pageNum
      setOpenListData((prev) =>
        pageNum === 0 ? newData : [...prev, ...newData]
      );

      // Optional: alert if no records found on first page
      if (pageNum === 0 && newData.length === 0) {
        Swal.fire({
          text: "No records found",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } else {
      Swal.fire({
        title: "Warning!",
        text: data?.message || "Failed to fetch data.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching Tax Type data:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || "Something went wrong while fetching data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Hide loader
  }
};


  // ==============useForm====================================

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });

  // ===============PUT and POST API =====================================================

  const handleSubmitForm = async (data) => {
  const obj = {
    DocEntry: String(data.DocEntry || ""),
    UserId: user.UserId,
    CreatedBy: user.UserName || "",
    CreatedDate: dayjs().format("YYYY/MM/DD"),
    ModifiedBy: user.UserName || "",
    ModifiedDate: dayjs().format("YYYY/MM/DD"),
    Name: String(data.Name || ""),
    Description: String(data.Description || ""),
    Status: "1",
    TaxCategory: String(data.TaxCategory || ""),
    TaxAmtKey: String(data.TaxAmtKey || ""),
  };

  try {
    setLoading(true);

    if (SaveUpdateName === "SAVE") {
      // CREATE
      const response = await apiClient.post(`/TaxType`, obj);

      if (response.data.success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "Tax Type is Added",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
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
      // UPDATE
      const result = await Swal.fire({
        text: `Do you want to update "${data.Name}"?`,
        icon: "question",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Tax Type is not Updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      const response = await apiClient.put(`/TaxType/${DocEntry}`, obj);

      if (response.data.success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "Tax Type is Updated",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    }
  } catch (error) {
    console.error("Error submitting Tax Type:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        "Something went wrong while saving the Tax Type.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};


  // ===============Delete API ==========================================================

 const handleOnDelete = async () => {
  try {
    const result = await Swal.fire({
      text: `Do you want to delete this Tax Type?`,
      icon: "question",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Tax Type is not deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true);

    const resp = await apiClient.delete(`/TaxType/${DocEntry}`);
    setLoading(false);

    if (resp.data.success) {
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Tax Type deleted successfully",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      Swal.fire({
        text: resp.data.message || "Failed to delete Tax Type",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error deleting Tax Type:", error);
    setLoading(false);

    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || "Something went wrong during deletion.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  }
};


  // ===============API  for Tax category dropdown value===================================

 const getTaxCategoryDataList = async () => {
  try {
    setLoading(true); // Optional: show loading while fetching

    const response = await apiClient.get(`/TaxCategory/All`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      const values = response.data.values || [];
      const formattedData = values.map((item) => ({
        key: item.DocEntry, // Unique identifier
        value: item.Name,    // Display value
      }));
      setTaxCategories(formattedData);
    } else {
      Swal.fire({
        title: "Warning!",
        text: response.data.message || "Failed to fetch Tax Categories.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  } catch (error) {
    console.error("Error fetching tax data:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || "An error occurred while fetching Tax Categories.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    getTaxCategoryDataList();
    fetchOpenListData(0);
  }, []);

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
          Tax Type List
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
                  title={item.Name}
                  // subtitle={item.TaxCategory}
                  description={item.TaxAmtKey}
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
              Tax Type
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
                      name="Name"
                      control={control}
                      rules={{
                        required: "Tax Type Name is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Tax Type Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TAX TYPE NAME"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 40 }}
                          value={field.value || ""}
                          disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Description"
                      control={control}
                      // rules={{
                      //   required: "Description is required",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="DESCRIPTION"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="TaxCategory"
                      control={control}
                      rules={{
                        required: "Tax Category is required",
                      }}
                      defaultValue=""
                      render={({ field, fieldState: { error } }) => (
                        <InputSearchSelectTextField
                          label="TAX CATEGORY"
                          {...field}
                          disabled={!!DocEntry}
                          data={taxCategories}
                          error={!!error}
                          inputProps={{ maxLength: 20 }}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="TaxAmtKey"
                      control={control}
                      // rules={{
                      //   required: "Tax amount key is required", // Field is required
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TAX AMOUNT KEY"
                          type="text"
                          {...field}
                          disabled
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

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
                disabled={!perms.IsDelete}

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
