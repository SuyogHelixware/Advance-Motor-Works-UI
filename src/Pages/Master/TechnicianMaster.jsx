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
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import CardComponent from "../Components/CardComponent";
import { InputTextField } from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import apiClient from "../../services/apiClient";

const initial = {
  DocEntry: "",
  TechnicianName: "",
  Status: true,
  HW_WMSStaff: false,
};

export default function TechnicianMaster() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [card, setCard] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredCard, setFilteredCard] = useState([]);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openPage, setOpenPage] = useState(0);
  const [DocEntry, setDocEntry] = useState("");
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initial,
  });

  const toggleDrawer = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const onHandleSearch = (event) => {
    const searchText = event.target.value;
    setFilteredCard([]);
    setSearchText(searchText);
    setOpenPage(0);
    setHasMoreOpen(true);
    if (searchText !== "") {
      apiClient
        .get(`/Technician?SearchText=${searchText}&page=0`)
        .then((response) => {
          setFilteredCard(response.data.values);
          if (response.data.values.length < 20) {
            setHasMoreOpen(false);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const getVehicalDataList = () => {
    apiClient
      .get(`/Technician?page`)
      .then((response) => {
        setCard(response.data.values);
        if (response.data.values.length < 20) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getVehicalDataList();
  }, []);

  const setTechnicialListData = (DocEntry) => {
    if (!DocEntry) return;
    apiClient
      .get(`/Technician?DocEntry=${DocEntry}`)
      .then((response) => {
        toggleDrawer();
        const data = response.data.values;
        console.log("object", data);
        reset({
          ...data,
          Status: data.Status === "1" ? true : false,
          HW_WMSStaff: data.HW_WMSStaff === "Y",
        });
        setSaveUpdateName("UPDATE");
        setDocEntry(DocEntry);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setDocEntry("");
  };

  const fetchMoreData = () => {
    const page = openPage + 1;
    const url =
      searchText === ""
        ? `/Technician?page=${page}`
        : `/Technician?SearchText=${searchText}&page=${page}`;

    apiClient
      .get(url)
      .then((response) => {
        if (searchText === "") {
          setCard((prev) => [...prev, ...response.data.values]);
        } else {
          setFilteredCard((prev) => [...prev, ...response.data.values]);
        }
        setOpenPage(page);
        if (response.data.values.length === 0) {
          setHasMoreOpen(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const onClickClearSearch = () => {
    setSearchText("");
    setFilteredCard([]);
    setOpenPage(0);
    setHasMoreOpen(true);
    getVehicalDataList();
  };

  const triggeronClickClearSearchTwice = () => {
    onClickClearSearch();
    setTimeout(() => {
      onClickClearSearch();
    }, 10);
  };

  const handleSubmitForm = (data) => {
    const technician = {
      UserId: localStorage.getItem("UserId"),
      CreatedBy: localStorage.getItem("UserName"),
      TechnicianName: data.TechnicianName,
      DocEntry: String(data.DocEntry),
      Status: data.Status ? "1" : "0",
      HW_WMSStaff: data.HW_WMSStaff ? "Y" : "N",
    };

    if (SaveUpdateName === "SAVE") {
      apiClient
        .post(`/Technician`, technician)
        .then((resp) => {
          if (resp.data.success) {
            getVehicalDataList();
            clearFormData();
            Swal.fire({
              title: "Success!",
              text: "Technician Added",
              icon: "success",
              timer: 1000,
            });
          } else {
            Swal.fire("Error!", resp.data.message, "warning");
          }
        })
        .catch(() => {
          Swal.fire("Error!", "something went wrong", "warning");
        });
    } else {
      Swal.fire({
        text: `Do You Want Update "${technician.TechnicianName}"`,
        icon: "question",
        confirmButtonText: "YES",
        showDenyButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          apiClient
            .put(`/Technician/${DocEntry}`, technician)
            .then((response) => {
              if (response.data.success) {
                getVehicalDataList();
                clearFormData();
                Swal.fire("Success!", "Technician Updated", "success");
              } else {
                Swal.fire("Error!", response.data.message, "warning");
              }
            })
            .catch(() => {
              Swal.fire("Error!", "something went wrong", "warning");
            });
        }
      });
    }
  };

  const handleOnDelete = () => {
    Swal.fire({
      text: `Do You Want Delete "${DocEntry}"`,
      icon: "question",
      confirmButtonText: "YES",
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient.delete(`/Technician/${DocEntry}`).then((resp) => {
          if (resp.data.success) {
            clearFormData();
            getVehicalDataList();
            // Swal.fire({
            //   text: "Technician Deleted",
            //   icon: "success",
            //   toast: true,
            //   timer: 1000,
            // });
            Swal.fire({
              title: "Success!",
              text: "Technician Deleted Successfully",
              icon: "success",
              timer: 1000,
            });
          } else {
            Swal.fire("Error", resp.data.message, "info");
          }
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
        sx={{
          backgroundColor:
            theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
          border: "1px solid silver",
          borderBottom: "none",
        }}
      >
        <Typography textAlign={"center"}>Technician List</Typography>
        <IconButton
          edge="end"
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
        <Grid item width={"100%"} height={`100%`}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              px: 1,
              overflowY: "scroll",
              overflowX: "hidden",
            }}
            id="ListScroll"
          >
            <Grid
              item
              padding={1}
              width={"100%"}
              sx={{
                position: "sticky",
                top: "0",
                zIndex: 1,
                backgroundColor: "inherit",
              }}
            >
              <SearchInputField
                onChange={onHandleSearch}
                value={searchText}
                onClickClear={triggeronClickClearSearchTwice}
              />
            </Grid>
            <InfiniteScroll
              dataLength={searchText === "" ? card.length : filteredCard.length}
              next={fetchMoreData}
              hasMore={hasMoreOpen}
              loader={<BeatLoader size={8} />}
              scrollableTarget="ListScroll"
              endMessage={
                <Typography textAlign="center">No More Records</Typography>
              }
            >
              {(searchText === "" ? card : filteredCard).map((item) => (
                <CardComponent
                  key={item.DocEntry}
                  title={item.TechnicianName}
                  subtitle={item.DocEntry}
                  description={`${item.Status === "0" || item.Status === 0 ? "Inactive" : "Active"}`}
                  onClick={() => setTechnicialListData(item.DocEntry)}
                />
              ))}
            </InfiniteScroll>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Grid
      container
      width={"100%"}
      height="calc(100vh - 110px)"
      component={"form"}
      onSubmit={handleSubmit(handleSubmitForm)}
    >
      <Grid
        container
        item
        height="100%"
        lg={3}
        sx={{
          position: { lg: "relative", xs: "absolute" },
          zIndex: 1000,
          display: { lg: "block", xs: sidebarOpen ? "block" : "none" },
        }}
      >
        {sidebarContent}
      </Grid>

      <Grid
        container
        item
        width="100%"
        height="100%"
        lg={9}
        position="relative"
      >
        <IconButton
          onClick={toggleDrawer}
          sx={{ display: { lg: "none" }, position: "absolute", left: "10px" }}
        >
          <MenuIcon />
        </IconButton>
        <IconButton
          onClick={clearFormData}
          sx={{ position: "absolute", right: "10px" }}
        >
          <RefreshIcon />
        </IconButton>

        <Grid
          item
          width={"100%"}
          py={0.5}
          border={"1px solid silver"}
          borderBottom={"none"}
        >
          <Typography textAlign={"center"}>Technician Creation</Typography>
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
            height="calc(100% - 60px)"
            overflowY={"scroll"}
            sx={{ overflowX: "hidden" }}
          >
            <Grid container sx={{ "& .MuiTextField-root": { m: 1 } }}>
              <Grid item md={4} xs={0}></Grid>
              <Grid item md={4} xs={12} textAlign={"center"}>
                <Controller
                  name="DocEntry"
                  control={control}
                  render={({ field }) => (
                    <InputTextField
                      readOnly
                      label="TECHNICIAN ID"
                      {...field}
                      inputProps={{ readOnly: true }}
                    />
                  )}
                />
                <Controller
                  name="TechnicianName"
                  control={control}
                  rules={{ required: "Technician Name is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="TECHNICIAN NAME"
                      {...field}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <Controller
                    name="Status"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Active"
                      />
                    )}
                  />
                  <Controller
                    name="HW_WMSStaff"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={Boolean(field.value)}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="WMS staff"
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid silver",
            }}
          >
            <Button
              variant="contained"
              type="submit"
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
  );
}
