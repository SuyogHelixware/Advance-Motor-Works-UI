import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
// import CardComponent from "../Components/CardComponent";
import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import {
  // InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";

export default function RoleMasterNew() {
  const theme = useTheme();
  const { user } = useAuth();
  const perms = usePermissions(11);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const timeoutRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const initial = {
    DocEntry: "",
    RoleName: "",
    Remarks: "",
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // ===============Main list handle search===================================

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");

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
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/Role/Search/${searchTerm}/1/${pageNum}/20`
        : `/Role/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);
      const { success, values = [], message } = response?.data || {};

      if (!success) {
        Swal.fire({
          text: message || "Failed to fetch records",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      setHasMoreOpen(values.length === 20);

      setOpenListData((prev) =>
        pageNum === 0 ? values : [...prev, ...values],
      );
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error fetching data";

      console.error("Error fetching data:", error);

      Swal.fire({
        text: errorMessage,
        icon: "error",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);
  // ===============API for Setting specific Cards data====================================

  const setDatalist = async (DocEntry) => {
    if (!DocEntry) return;

    setLoading(true);

    try {
      const response = await apiClient.get(`/Role/${DocEntry}`);
      const data = response?.data?.values;

      if (!data) {
        throw new Error("No data returned from server");
      }

      toggleDrawer();
      reset(data);
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);
      setSelectedData(DocEntry);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching data";

      console.error("Error fetching data:", error);

      // Optional: user feedback
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==============useForm====================================

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initial,
  });

  // ===============PUT and POST API ===================================

  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: "1",
      CreatedBy: user?.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user?.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      Status: "1",
      RoleName: String(data.RoleName || ""),
      Remarks: String(data.Remarks || ""),
    };

    try {
      setLoading(true);
      let response;

      if (SaveUpdateName === "SAVE") {
        response = await apiClient.post(`/Role`, obj);
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.RoleName}"`,
          icon: "question",
          showConfirmButton: true,
          showDenyButton: true,
          confirmButtonText: "YES",
          cancelButtonText: "No",
        });

        if (!result.isConfirmed) {
          Swal.fire({
            text: "Role is not Updated!",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        response = await apiClient.put(`/Role/${DocEntry}`, obj);
      }

      const { success, message } = response?.data || {};

      if (!success) {
        Swal.fire({
          title: "Error!",
          text: message || "Operation failed",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      // ✅ Common success handling
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        title: "Success!",
        text: SaveUpdateName === "SAVE" ? "Role Added" : "Role Updated",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1000,
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      console.error("Error:", error);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============Delete API ===================================

  const handleOnDelete = async () => {
    const result = await Swal.fire({
      text: "Do You Want to Delete?",
      icon: "question",
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) {
      Swal.fire({
        text: "Role is Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.delete(`/Role/${DocEntry}`);
      const { success, message } = response?.data || {};

      if (!success) {
        Swal.fire({
          text: message || "Delete failed",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      // ✅ Common success handling
      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Role Deleted",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while deleting the role";

      console.error("Error deleting role:", error);

      Swal.fire({
        text: errorMessage,
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
          Role Lists
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
                  title={item.RoleName}
                  // subtitle={item.Description}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => {
                    setDatalist(item.DocEntry);
                  }}
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
              Role
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
                  <Grid item md={12} xs={12} textAlign={"center"}>
                    <Controller
                      name="DocEntry"
                      control={control}
                      // rules={{
                      //   required: "Role Id is required",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ROLE ID"
                          type="text"
                          readOnly
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item md={12} xs={12} textAlign={"center"}>
                    <Controller
                      name="RoleName"
                      control={control}
                      rules={{
                        required: "Role Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "Role Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="ROLE NAME"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item md={12} xs={12} textAlign={"center"}>
                    <Controller
                      name="Remarks"
                      control={control}
                      // rules={{
                      //   required: "Remark is required",
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="REMARK"
                          type="text"
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
    </>
  );
}
