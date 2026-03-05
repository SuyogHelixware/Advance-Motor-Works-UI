import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import dayjs from "dayjs";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponentTwo from "../Components/CardComponentTwo";
import {
  InputSelectTextField,
  InputTextFieldLarge,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";

export default function UoMMaster() {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [isLCAcctDialogOpen, setIsLCAcctDialogOpen] = useState(false);
  let [ok, setok] = useState("OK");

  const LIMIT = 20;
  const [rowCount, setRowCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [LCAcctRows, setLCAcctRows] = React.useState([]);
  const [selectedData, setSelectedData] = useState([]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const { user } = useAuth();
  const perms = usePermissions(22);

  const initial = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName,
    Status: "",
    AlcCode: "",
    AlcName: "",
    OhType: "F",
    AcctCode: "",
  };
  const { handleSubmit, control, setValue, reset, getValues } = useForm({
    defaultValues: initial,
  });
  const { isDirty } = useFormState({ control });

  const AllData = getValues();

  const timeoutRef = useRef(null);

  const fetchInitialLCAccts = async ({ page = 0, limit = 20, search = "" }) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();

      params.append("Page", page);
      params.append("Limit", limit);
      params.append("Status", 1);

      if (search) params.append("SearchText", search);

      params.append("LocManTran", "N");
      params.append("GroupMask", "ALL");
      params.append("Postable", "Y");

      const url = `/ChartOfAccounts?${params.toString()}`;
      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success === true) {
        const Accounts = data?.values || [];
        setLCAcctRows(Accounts);

        if (Accounts.length < limit) {
          setRowCount(page * limit + Accounts.length);
        } else if (page === 0) {
          setRowCount(1000);
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaginationModelChange = useCallback(
    (model) => {
      if (model.page !== currentPage) {
        setCurrentPage(model.page);
      }
    },
    [currentPage],
  );
  const handleSearchChange = useCallback((searchText) => {
    setSearchText(searchText);
    setCurrentPage(0); // Reset to first page when searching
  }, []);

  useEffect(() => {
    fetchInitialLCAccts({ page: currentPage, search: searchText });
  }, [currentPage, searchText]);

  const Acclist = [
    // {
    //   field: "check",
    //   headerName: "Select",
    //   width: 80,
    //   renderCell: (params) => (
    //     <Checkbox
    //       checked={selectedRowId === params.id}
    //       onChange={() => handleRowSelection(params.id, params)}
    //     />
    //   ),
    // },
    {
      field: "AcctCode",
      headerName: "Account Number",
      width: 150,
      editable: true,
    },
    {
      field: "AcctName",
      headerName: "Account Name",
      width: 150,
      editable: true,
    },
    {
      field: "CurrTotal",
      headerName: "Account Balance",
      width: 150,
      editable: true,
    },
  ];

  const handleRowSelection = (params) => {
    // If you're using onCellClick, params will be GridCellParams
    // Extract the row or id from params
    const selectedAccount = params.row; // Directly the row object

    if (selectedAccount) {
      console.log("Selected Account:", selectedAccount);
      setValue("AcctCode", selectedAccount.AcctCode);
      setIsLCAcctDialogOpen(false);
    }
  };
  // const handleCell = (id, params) => {
  //   console.log("Selected Row Data:", params.row);
  //   setSelectedRow(id);
  //   SetAcoountListRev(params.row);
  // };

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/LandedCostSetup/Search/${searchTerm}/1/${pageNum}/20`
        : `/LandedCostSetup/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        // if (newData.length === 0) {
        //   Swal.fire({
        //     text: "Record Not Found",
        //     icon: "warning",
        //     toast: true,
        //     showConfirmButton: false,
        //     timer: 2000,
        //     timerProgressBar: true,
        //   });
        // }
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
  const allocationTypes = {
    F: "Cash Value Before Customs",
    C: "Cash Value After Customs",
    Q: "Quantity",
    W: "Weight",
    V: "Volume",
    A: "Equal",
  };

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
          setOldDataOPen(DocEntry);
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
    if (!DocEntry) return;

    try {
      setIsLoading(true);

      const response = await apiClient.get(`/LandedCostSetup/${DocEntry}`);

      const { success, message, values } = response?.data || {};

      if (success === false) {
        Swal.fire({
          title: "Warning!",
          text: message || "Failed to fetch Landed Cost data.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      if (!values) return;

      toggleDrawer();
      setSaveUpdateName("UPDATE");

      reset({
        ...values,
        Status: values?.Status === "1" ? "Y" : "N",
      });

      setSelectedData(DocEntry);
    } catch (error) {
      console.error("LandedCost fetch error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected error occurred while loading data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFormData = () => {
    setSaveUpdateName("SAVE");
    reset(initial);
    setSelectedData([]);
  };

  const handleSubmitForm = async (data) => {
    const obj = {
      ...data,
      Status: "1",
    };

    const normalizeString = (str = "") => str.replace(/\s+/g, "").toLowerCase();

    try {
      setIsLoading(true);

      /* ================= SAVE ================= */
      if (SaveUpdateName === "SAVE") {
        if (!Array.isArray(openListData)) return;

        const isExistingSAC = openListData.some(
          (item) =>
            normalizeString(item.AlcName) === normalizeString(data.AlcName),
        );

        if (isExistingSAC) {
          Swal.fire({
            text: "Landed Cost Name Already Exist !",
            icon: "info",
            confirmButtonText: "Ok",
          });
          return;
        }

        const response = await apiClient.post(`/LandedCostSetup`, obj);

        const { success, message } = response?.data || {};

        if (!success) {
          Swal.fire({
            title: "Error!",
            text: message || "Failed to save Landed Cost.",
            icon: "error",
            confirmButtonText: "Ok",
          });
          return;
        }

        clearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "Landed Cost Added Successfully",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });

        return;
      }

      /* ================= UPDATE ================= */
      const result = await Swal.fire({
        text: `Do You Want to Update "${obj.AlcName}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Landed Cost Setup Not Updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      const response = await apiClient.put(
        `/LandedCostSetup/${data.DocEntry}`,
        obj,
      );

      const { success, message } = response?.data || {};

      if (!success) {
        Swal.fire({
          title: "Error!",
          text: message || "Failed to update Landed Cost.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        title: "Success!",
        text: "Landed Cost Setup Updated",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Landed Cost submit error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnDelete = async () => {
    if (!AllData?.DocEntry) return;

    try {
      const result = await Swal.fire({
        text: `Do You Want to delete "${AllData.AlcName}"`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Landed Cost Setup Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      setIsLoading(true);

      const response = await apiClient.delete(
        `/LandedCostSetup/${AllData.DocEntry}`,
      );

      const { success, message } = response?.data || {};

      if (!success) {
        Swal.fire({
          title: "Error!",
          text: message || "Failed to delete Landed Cost.",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      clearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Landed Cost Deleted",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } catch (error) {
      console.error("Landed Cost delete error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while deleting Landed Cost.",
        icon: "error",
        confirmButtonText: "Ok",
      });
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
          Landed Cost List
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
                <CardComponentTwo
                  key={i}
                  title={item.AlcName}
                  subtitle={allocationTypes[item.OhType] || item.OhType}
                  description={item.AcctCode}
                  searchResult={openListquery}
                  isSelected={selectedData === item.DocEntry}
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
      {isLoading && <Loader open={isLoading} />}

      {/* ============== */}

      {/* <GLAccountDialog
        open={isLCAcctDialogOpen}
        onClose={() => setIsLCAcctDialogOpen(false)}
        rows={LCAcctRows}
        columns={Acclist}
        onRowSelection={handleRowSelection}
        title="Account List"
        height="50vh"
      /> */}
      <DataGridCellClickModel
        open={isLCAcctDialogOpen}
        closeModel={() => setIsLCAcctDialogOpen(false)}
        isLoading={isLoading}
        title="Account List"
        getRowId={(row) => row.DocEntry}
        columns={Acclist}
        rows={LCAcctRows}
        taxCurrentPage={currentPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onCellClick={handleRowSelection}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        // selectedRowIndex={getValues("selectedRowIndex")}
        oLines={getValues("oLines") || []}
        // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
      />
      {/* =================== */}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
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
              Landed Cost
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
                  {/* <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                    <Controller
                      name="DocEntry"
                      // rules={{ required: "this field is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CODE"
                          type="text"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          disabled={true}
                        />
                      )}
                    />
                  </Grid> */}
                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      name="AlcName"
                      rules={{
                        required: "Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "Name cannot be empty",
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextFieldLarge
                          label="NAME"
                          type="text"
                          {...field}
                          inputProps={{ maxLength: 30 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                          sx={{ maxWidth: 280, width: "100%" }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      name="AcctCode"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextFieldLarge
                          {...field}
                          label="LANDED COSTS ALLOC. ACCT"
                          value={field.value}
                          error={!!error}
                          helperText={error ? error.message : null}
                          disabled
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <ViewListIcon
                                  style={{
                                    cursor: "pointer",
                                    backgroundColor: "green",
                                    borderRadius: "10%",
                                    color: "white",
                                    padding: 2,
                                  }}
                                  onClick={() => {
                                    setIsLCAcctDialogOpen(true);
                                  }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            // setLCAcctValue(value);
                          }}
                          sx={{ maxWidth: 280, width: "100%" }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={6}
                    sm={6}
                    textAlign={"center"}
                    marginTop={2}
                  >
                    <Controller
                      name="OhType"
                      control={control}
                      rules={{ required: "Allocation by is Required" }}
                      render={({ field, fieldState: { error } }) => (
                        <InputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          name="OhType"
                          label="ALLOCATION BY"
                          data={[
                            {
                              key: "F",
                              value: "Cash Value Before Customs",
                            },
                            {
                              key: "C",
                              value: "Cash Value After Customs",
                            },
                            {
                              key: "Q",
                              value: "Quantity",
                            },
                            {
                              key: "W",
                              value: "Weight",
                            },
                            {
                              key: "V",
                              value: "Volume",
                            },
                            {
                              key: "A",
                              value: "Equal",
                            },
                          ]}
                          sx={{ maxWidth: 280, width: "100%" }}
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
                color="success"
                type="submit"
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
    </>
  );
}
