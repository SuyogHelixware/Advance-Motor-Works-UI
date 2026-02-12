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
import CardComponent from "../Components/CardComponent";
import { InputTextField } from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";

export default function TaxCategory() {
  const theme = useTheme();
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
 const perms = usePermissions(26);
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const initial = {
    Name: "",
    Description: "",
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
     
    setDocEntry("");
    setSelectedData([]);
  };
  
  // ===============Get initial list data====================================
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
    setLoading(true); // Optional: show loader if needed

    const url = searchTerm
      ? `/TaxCategory/Search/${searchTerm}/1/${pageNum}/20`
      : `/TaxCategory/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);

    if (response.data.success) {
      const newData = response.data.values || [];

      setHasMoreOpen(newData.length === 20);

      if (pageNum === 0 && newData.length === 0) {
        Swal.fire({
          text: "No records found",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      }

      setOpenListData((prev) => (pageNum === 0 ? newData : [...prev, ...newData]));
    } else {
      Swal.fire({
        text: response.data.message || "Failed to fetch data",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || "Something went wrong while fetching data",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // hide loader
  }
};

 
  useEffect(() => {
    fetchOpenListData(0);
  }, []);
  // ===============API for Setting specific Cards data====================================
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
const setTaxDataList = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setLoading(true); // start loading

    const response = await apiClient.get(`/TaxCategory/${DocEntry}`);
    const { success, values, message } = response.data || {};

    if (!success) {
      Swal.fire({
        title: "Warning!",
        text: message || "Failed to fetch tax data.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    if (!values) {
      Swal.fire({
        title: "Info",
        text: "No tax data found for the selected entry.",
        icon: "info",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Reset form with fetched data
    toggleDrawer();
    reset(values);
    setSaveUpdateName("UPDATE");
    setDocEntry(DocEntry);
    setSelectedData(DocEntry);

  } catch (error) {
    console.error("Error fetching tax data:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred while fetching tax data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // stop loading
  }
};

  // ==============useForm====================================
  const { control, handleSubmit, reset } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });
  // ===============PUT and POST API ===================================
 const handleSubmitForm = async (data) => {
  const obj = {
    DocEntry: String(data.DocEntry || ""),
    UserId: user.UserId,
    CreatedBy: user.UserName || "",
    CreatedDate: dayjs().format("YYYY/MM/DD"),
    ModifiedBy: user.UserName || "",
    ModifiedDate: dayjs().format("YYYY/MM/DD"),
    Name: data.Name || "",
    Description: data.Description || "",
    Status: "1",
  };

  try {
    setLoading(true);

    if (SaveUpdateName === "SAVE") {
      const resp = await apiClient.post(`/TaxCategory`, obj);

      if (resp.data.success) {
        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "Tax Category Added successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: resp.data.message || "Failed to add Tax Category",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } else {
      // Confirm before update
      const result = await Swal.fire({
        text: `Do you want to update "${data.Name}"?`,
        icon: "question",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        const response = await apiClient.put(`/TaxCategory/${DocEntry}`, obj);

        if (response.data.success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);

          Swal.fire({
            title: "Success!",
            text: "Tax Category Updated successfully",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Failed to update Tax Category",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        Swal.fire({
          text: "Tax Category update cancelled",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  } catch (error) {
    console.error("Error in TaxCategory submit:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while saving Tax Category",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};

  // ===============Delete API ===================================
  const handleOnDelete = async () => {
  // Confirm deletion
  const result = await Swal.fire({
    text: "Do you want to delete this Tax Category?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });

  if (!result.isConfirmed) {
    // User cancelled deletion
    Swal.fire({
      text: "Tax Category not deleted",
      icon: "info",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  try {
    setLoading(true); // Show loader

    const resp = await apiClient.delete(`/TaxCategory/${DocEntry}`);

    if (resp.data.success) {
      // Reset and refresh list
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Tax Category deleted successfully",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      Swal.fire({
        text: resp.data.message || "Failed to delete Tax Category",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error deleting Tax Category:", error);

    Swal.fire({
      title: "Error!",
      text: error?.response?.data?.message || "Something went wrong while deleting",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false); // Always hide loader
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
          Tax Category List
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
                description={item.Description}
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
          md={9}
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
              Tax Category
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
                        required: "Tax Category is required",
                          validate: (value) =>
                      value.trim() !== "" || "Tax Category cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TAX CATEGORY"
                          type="text"
                          {...field}
                          disabled={!!DocEntry}
                          inputProps={{ maxLength: 20 }}
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
                          error={!!error}
                          inputProps={{ maxLength: 100 }}
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
