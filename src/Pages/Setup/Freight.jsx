import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import CardComponentTwo from "../Components/CardComponentTwo";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import { InputTextField } from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";

export default function Freight() {
  const { user } = useAuth();
  const perms = usePermissions(29);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [isSACDialogOpen, setIsSACDialogOpen] = useState(false);
  const [SACRows, setSACRows] = React.useState([]);
  // Revenue Account modal state
  const [isRevAcctDialogOpen, setIsRevAcctDialogOpen] = useState(false);
  const [RevRows, setRevRows] = useState([]);
  const [RevRowCount, setRevRowCount] = useState(0);
  const [currentRevPage, setCurrentRevPage] = useState(0);
  const [searchRevText, setSearchRevText] = useState("");

  // EXPENSE ACCOUNT STATES
  const [isExpnsAcctDialogOpen, setIsExpnsAcctDialogOpen] = useState(false);
  const [ExpRows, setExpRows] = useState([]);
  const [ExpRowCount, setExpRowCount] = useState(0);
  const [currentExpPage, setCurrentExpPage] = useState(0);
  const [searchExpText, setSearchExpText] = useState("");

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  let [ok, setok] = useState("OK");
  const LIMIT = 20;
  const [isLoading, setIsLoading] = useState(false);

  const [SACrowCount, setSACRowCount] = useState(0);
  const [currentSACPage, setCurrentSACPage] = useState(0);
  const [searchSACText, setSearchSACText] = useState("");
  const [valSACList, setValSACList] = useState([]);
  const [loading, setLoading] = useState(false);

  //=====================================closed List State====================================================================

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      ""
    );

  const theme = useTheme();
  const timeoutRef = useRef(null);
  const initialFormData = {
    UserId: user.UserId,
    DocEntry: "",
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName,
    ExpnsName: "",
    RevAcct: "",
    ExpnsAcct: "",
    RevFixSum: "",
    ExpFixSum: "",
    DistrbMthd: "",
    BaseMethod: "",
    WTLiable: "",
    TaxDisMthd: "",
    SacCode: "",
    Status: "",
    Project: "",
    AcctCode: "",
  };
  //======================================useForm==================================================
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    clearErrors,
  } = useForm({
    defaultValues: initialFormData,
  });
  const { isDirty } = useFormState({ control });

  const AllData = getValues();

  //========================================Active list data================================
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/Freight/Search/${searchTerm}/1/${pageNum}/20`
        : `/Freight/Pages/1/${pageNum}/20`;

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
  //=======================================Revenue Account modal====================================
  const acctFieldParams = {
    RevAcct: { locManTran: "N", finanse: "N", groupMask: "4" },
    ExpnsAcct: { locManTran: "N" },
  };
  //===============================================Revenue Account=====================================
  const FetchRevList = async ({ page = 0, search = "" }) => {
    
    try {
      setIsLoading(true);
      // REVENUE ACCOUNT FIELD PARAMS
      const fieldParams = acctFieldParams["RevAcct"] || {};
      const params = new URLSearchParams();

      params.append("Page", page);
      params.append("Limit", LIMIT);
      params.append("Status", 1);

      if (search) params.append("SearchText", search);
      if (fieldParams.locManTran)
        params.append("LocManTran", fieldParams.locManTran);
      if (fieldParams.groupMask)
        params.append("GroupMask", fieldParams.groupMask);
      if (fieldParams.postable) params.append("Postable", fieldParams.postable);
      if (fieldParams.finanse) params.append("Finanse", fieldParams.finanse);

      const url = `/ChartOfAccounts?${params.toString()}`;
      const res = await apiClient.get(url);

      if (res.data.success) {
        const accounts = res.data.values || [];

        setRevRows(accounts);

        if (accounts.length < LIMIT) {
          setRevRowCount(page * LIMIT + accounts.length);
        } else if (page === 0) {
          setRevRowCount(1000);
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRevCellClick = (params) => {
    const row = params.row;
    setValue("RevAcct", row.AcctCode);
    setIsRevAcctDialogOpen(false);
  };
  const handlePaginationModelChangeRev = useCallback(
    (model) => {
      if (model.page !== currentRevPage) {
        setCurrentRevPage(model.page);
      }
    },
    [currentRevPage]
  );
  const handleSearchChangeRev = useCallback((text) => {
    setSearchRevText(text);
    setCurrentRevPage(0);
  }, []);
  useEffect(() => {
    FetchRevList({ page: currentRevPage, search: searchRevText });
  }, [currentRevPage, searchRevText]);

  //=======================================Expense Account================================================
  const FetchExpList = async ({ page = 0, search = "" }) => {
    
    try {
      setIsLoading(true);
      // EXPENSE ACCOUNT FIELD PARAMS
      const fieldParams = acctFieldParams["ExpnsAcct"] || {};
      const params = new URLSearchParams();

      params.append("Page", page);
      params.append("Limit", LIMIT);
      params.append("Status", 1);

      if (search) params.append("SearchText", search);
      if (fieldParams.locManTran)
        params.append("LocManTran", fieldParams.locManTran);
      if (fieldParams.groupMask)
        params.append("GroupMask", fieldParams.groupMask);
      if (fieldParams.postable) params.append("Postable", fieldParams.postable);
      if (fieldParams.finanse) params.append("Finanse", fieldParams.finanse);

      const url = `/ChartOfAccounts?${params.toString()}`;
      const res = await apiClient.get(url);

      if (res.data.success) {
        const accounts = res.data.values || [];

        // ------- USE YOUR OLD STATES --------
        setExpRows(accounts);

        if (accounts.length < LIMIT) {
          setExpRowCount(page * LIMIT + accounts.length);
        } else if (page === 0) {
          setExpRowCount(1000);
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Something went wrong.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpCellClick = (params) => {
    const row = params.row;
    setValue("ExpnsAcct", row.AcctCode); // Update your form
    clearErrors("ExpnsAcct");
    setIsExpnsAcctDialogOpen(false);
  };
  const handlePaginationModelChangeExp = useCallback(
    (model) => {
      if (model.page !== currentExpPage) {
        setCurrentExpPage(model.page);
      }
    },
    [currentExpPage]
  );
  const handleSearchChangeExp = useCallback((text) => {
    setSearchExpText(text);
    setCurrentExpPage(0);
  }, []);
  useEffect(() => {
    FetchExpList({ page: currentExpPage, search: searchExpText });
  }, [currentExpPage, searchExpText]);

  //=========================================SAC modal api============================

  const FetchSACList = async ({ page = 0, search = "" }) => {
    
    try {
      setIsLoading(true);
      const url = search
        ? `/SACSetup/Search/${search}/1/${page}/20`
        : `/SACSetup/Pages/1/${page}/20`;

      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success === true) {
        const items = data?.values || [];
        console.log(items);

        setSACRows(items);

        if (items.length < 20) {
          setSACRowCount(page * 20 + items.length);
        } else if (page === 0) {
          setSACRowCount(1000);
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
  // const handleSACRowSelection = (selectedRow) => {
  //   const selectedSACRow = SAClist.find(
  //     (row) => row.DocEntry === selectedRow[0]
  //   );
  // };
  const handleSACCellClick = (params) => {
    const row = params.row;
    // const concatValue = `${row.ServCode || ""}`;
    setValue("SACEntry", row.ServCode); // react-hook-form field
    setValue("SacCode", row.ServCode);
    setValSACList(row.ServCode);
    setIsSACDialogOpen(false);
  };
  const handlePaginationModelChangeSAC = useCallback(
    (model) => {
      if (model.page !== currentSACPage) {
        setCurrentSACPage(model.page);
      }
    },
    [currentSACPage]
  );
  const handleSearchChangeSAC = useCallback((searchSACText) => {
    setSearchSACText(searchSACText);
    setCurrentSACPage(0); // Reset to first page when searching
  }, []);
  useEffect(() => {
    FetchSACList({ page: currentSACPage, search: searchSACText });
  }, [currentSACPage, searchSACText]);

  //=====================================================================
  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
    FetchExpList(0);
    FetchRevList(0);
  }, []);

  // ============================================Closed List Start ==================================================================

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
      width: 350,
      editable: true,
    },
    {
      field: "CurrTotal",
      headerName: "Account Balance",
      width: 150,
      editable: true,
    },
  ];
  const SAClist = [
    // {
    //   field: "check",
    //   headerName: "Select",
    //   width: 80,
    //   renderCell: (params) => (
    //     <Checkbox
    //       checked={selectedSACRowId === params.id}
    //       onChange={() => handleSACRowSelection(params.id, params)}
    //     />
    //   ),
    // },
    {
      field: "ServCode",
      headerName: "SAC Code",
      width: 150,
      editable: true,
    },
    {
      field: "ServName",
      headerName: "SAC Name",
      width: 150,
      editable: true,
    },
  ];

  //=============================================set data to fields========================================

  const setOldDataOPen = async (DocEntry, CardCode, CntctCode) => {
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
          setFreightData(DocEntry);
          setSaveUpdateName("UPDATE");
        });
      } else {
        setFreightData(DocEntry);
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
  const setFreightData = async (DocEntry) => {
    console.log(DocEntry);
    setSaveUpdateName("UPDATE");

    toggleSidebar();
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/Freight/${DocEntry}`);
      console.log(data);
      let { values } = data;
      console.log("old Data", values);
      reset({
        ...values,
        SacCode: values.SacCode,
      });
      setSelectedData(DocEntry);
    } catch (error) {
      console.error("error", error);
    } finally {
      setLoading(false);
    }
  };
  //===============================================clear form data=====================================
  const ClearFormData = () => {
    setSaveUpdateName("SAVE");
    setSelectedData([]);
    reset(initialFormData);
    setValSACList([]);
  };
  const WTLiable = watch("WTLiable");
  //============================================post and put api binding================================

 const handleSumbit = async (data) => {
  const obj = {
    ...data,
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName,
    ModifiedDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    SacCode: String(data.SacCode || ""),
    Status: "1",
    WTLiable: WTLiable === "1" ? "1" : "0",
    RevFixSum: String(data.RevFixSum || 0),
    ExpFixSum: String(data.ExpFixSum || 0),
  };

  const normalizeString = (str) =>
    str.replace(/\s+/g, "").toLowerCase();

  // ================= SAVE =================
  if (SaveUpdateName === "SAVE") {
    if (Array.isArray(openListData)) {
      const isExisting = openListData.some(
        (item) =>
          normalizeString(item.ExpnsName) ===
          normalizeString(data.ExpnsName)
      );

      if (isExisting) {
        Swal.fire({
          text: "Freight Name already Exist!",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
    } else {
      return;
    }

    try {
      setLoading(true);

      const res = await apiClient.post(`/Freight`, obj);

      if (res.data?.success) {
        ClearFormData();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        Swal.fire({
          title: "Success!",
          text: "Freight saved Successfully",
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
      console.error("Freight save error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving freight.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }

    return;
  }

  // ================= UPDATE =================
  const confirm = await Swal.fire({
    text: `Do You Want to Update "${obj.ExpnsName}"`,
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showCancelButton: true,
  });

  if (!confirm.isConfirmed) {
    Swal.fire({
      text: "Freight Not Updated",
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
      `/Freight/${data.DocEntry}`,
      obj
    );

    if (response.data?.success) {
      ClearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        title: "Success!",
        text: "Freight Updated",
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
    console.error("Freight update error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while updating freight.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};


  //===================================================delete api binding============================
const handleDelete = async () => {
  const result = await Swal.fire({
    text: `Do you want to delete "${AllData.ExpnsName}"`,
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showCancelButton: true,
  });

  if (!result.isConfirmed) {
    Swal.fire({
      text: "Freight Not Deleted",
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
      `/Freight/${AllData.DocEntry}`
    );

    if (response.data?.success) {
      ClearFormData();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Freight Deleted",
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
    console.error("Freight delete error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while deleting freight.",
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
          Freight List
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
                  title={item.ExpnsName}
                  subtitle={item.RevAcct}
                  isSelected={selectedData === item.DocEntry}
                  searchResult={openListquery}
                  onClick={() => setOldDataOPen(item.DocEntry)}
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

      <DataGridCellClickModel
        open={isSACDialogOpen}
        closeModel={() => setIsSACDialogOpen(false)}
        isLoading={isLoading}
        title="SAC Code List"
        getRowId={(row) => row.DocEntry}
        columns={SAClist}
        rows={SACRows}
        taxCurrentPage={currentSACPage}
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChangeSAC}
        // onRowSelectionModelChange={handleSACRowSelection}
        onCellClick={handleSACCellClick}
        searchText={searchSACText}
        onSearchChange={handleSearchChangeSAC}
        rowCount={SACrowCount}
        // selectedRowIndex={getValues("selectedSACRowId")}
        oLines={getValues("oLines") || []}
        // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
      />
      <DataGridCellClickModel
        open={isExpnsAcctDialogOpen}
        closeModel={() => setIsExpnsAcctDialogOpen(false)}
        isLoading={isLoading}
        title="Expense Account List"
        getRowId={(row) => row.DocEntry}
        columns={Acclist} // your Expense list columns
        rows={ExpRows}
        taxCurrentPage={currentExpPage}
        limit={20}
        onPaginationModelChange={handlePaginationModelChangeExp}
        onCellClick={handleExpCellClick}
        searchText={searchExpText}
        onSearchChange={handleSearchChangeExp}
        rowCount={ExpRowCount}
        oLines={getValues("oLines") || []}
      />
      <DataGridCellClickModel
        open={isRevAcctDialogOpen}
        closeModel={() => setIsRevAcctDialogOpen(false)}
        isLoading={isLoading}
        title="Revenue Account List"
        getRowId={(row) => row.DocEntry}
        columns={Acclist}
        rows={RevRows}
        taxCurrentPage={currentRevPage}
        limit={20}
        onPaginationModelChange={handlePaginationModelChangeRev}
        onCellClick={handleRevCellClick}
        searchText={searchRevText}
        onSearchChange={handleSearchChangeRev}
        rowCount={RevRowCount}
        oLines={getValues("oLines") || []}
      />

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
              Freight
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
                  <Grid container item>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ExpnsName"
                        rules={{
                          required: "Name is required",
                          validate: (value) =>
                            value.trim() !== "" || "Name cannot be empty",
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="NAME"
                            type="text"
                            inputProps={{ maxLength: 20 }}
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
                      xs={12}
                      md={6}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="RevAcct"
                        control={control}
                        rules={{ required: "Revenue Account is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            label="REVENUE ACCOUNT"
                            value={field.value}
                            error={!!error}
                            helperText={error ? error.message : null}
                            readOnly
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" || e.key === "Delete") {
                                e.preventDefault();
                                setValue("RevAcct", "");
                                clearErrors("RevAcct"); // <--- also clear here
                              }
                            }}
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
                                      setIsRevAcctDialogOpen(true);
                                      clearErrors("RevAcct"); // <--- clear error when picking value
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ExpnsAcct"
                        control={control}
                        rules={{ required: "Expense Account is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            label="EXPENSE ACCOUNT"
                            value={field.value}
                            error={!!error}
                            helperText={error ? error.message : null}
                            readOnly
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" || e.key === "Delete") {
                                e.preventDefault();
                                setValue("ExpnsAcct", "");
                              }
                            }}
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
                                      setIsExpnsAcctDialogOpen(true);
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="RevFixSum"
                        // rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            inputProps={{
                              maxLength: 15,
                              onInput: (e) => {
                                if (e.target.value.length > 15) {
                                  e.target.value = e.target.value.slice(0, 15);
                                }
                              },
                            }}
                            label="FIXED AMOUNT-REVENUES"
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
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ExpFixSum"
                        // rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="FIXED AMOUNT-EXPENSES"
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
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    {/* <Grid item md={6} xs={12} lg={4} sm={6} textAlign={"center"}>
                      <Controller
                        name="Input Tax Group"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Input Tax Group"
                            data={[
                              { key: "1", value: "General" },
                              { key: "2", value: "private" },
                            ]}
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />
                    </Grid>
                    <Grid item md={6} xs={12} lg={4} sm={6} textAlign={"center"}>
                      <Controller
                        name="Output Tax Group"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Output Tax Group"
                            data={[
                              { key: "1", value: "General" },
                              { key: "2", value: "private" },
                            ]}
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4} sm={6} textAlign={"center"}>
                      <Controller
                        name="Project"
                        rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="Project"
                            type="text"
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />
                    </Grid> */}
                    {/* <Grid
                      item
                      md={6}
                      xs={12}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="DistrbMthd"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Distribution Method"
                            data={[
                              { key: "N", value: "None" },
                              { key: "Q", value: "Quantity" },
                              { key: "V", value: "Volume" },
                              { key: "W", value: "Weight" },
                              { key: "E", value: "Equally" },
                              { key: "T", value: "Row Total" },
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
                      md={6}
                      xs={12}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="BaseMethod"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Drawing Method"
                            data={[
                              { key: "N", value: "None" },
                              { key: "Q", value: "Quantity" },
                              { key: "T", value: "Total" },
                              { key: "A", value: "All" },
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
                      md={6}
                      xs={12}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="TaxDisMthd"
                        rules={{
                          required: "please select Vehicle Type", // Field is required
                        }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="Tax Distribution Method"
                            data={[
                              { key: "N", value: "None" },
                              { key: "Q", value: "Quantity" },
                              { key: "V", value: "Volume" },
                              { key: "W", value: "Weight" },
                              { key: "E", value: "Equally" },
                              { key: "T", value: "Row Total" },
                            ]}
                            {...field}
                            error={!!error} // Pass error state to the FormComponent if needed
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />
                    </Grid> */}

                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                    >
                      <Controller
                        name="SacCode"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            {...field}
                            label="SAC CODE"
                            error={!!error}
                            helperText={error ? error.message : null}
                            readOnly
                            onKeyDown={(e) => {
                              if (e.key === "Backspace") {
                                e.preventDefault();
                                setValue("SacCode", "", {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              } else {
                                e.preventDefault();
                              }
                            }}
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
                                      setIsSACDialogOpen(true);
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                              // setSACValue(value);
                            }}
                            date
                            form
                            data
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      sm={6}
                      container
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Controller
                        name="WTLiable"
                        control={control}
                        defaultValue="1"
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                textAlign={"center"}
                                {...field}
                                checked={field.value === "1"}
                                onChange={(e) => {
                                  const newValueWTLiable = e.target.checked
                                    ? "1"
                                    : "0";
                                  field.onChange(newValueWTLiable);
                                  setValue("WTLiable", newValueWTLiable);
                                }}
                              />
                            }
                            label="WTax Liable"
                          />
                        )}
                      />
                    </Grid>
                    {/* <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      sm={6}
                      textAlign={"center"}
                      width={220}
                    >
                      <Controller
                        name="WTLiable"
                        control={control}
                        defaultValue={false}
                        // rules={{
                        //   required: "Please select Vehicle Type",
                        // }}
                        render={({ field, fieldState: { error } }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                sx={{
                                  textAlign: "center",
                                  width: 20,
                                  mr: 1,
                                }}
                                {...field}
                                checked={field.value}
                              />
                            }
                            label={
                              <Typography
                                variant="body2"
                                noWrap={true}
                                sx={{
                                  fontFamily: "'Open Sans', sans-serif", // Apply font family here
                                }}
                              >
                                WTax Liable
                              </Typography>
                            }
                            sx={{
                              textAlign: "center",
                              width: 200,
                              whiteSpace: "normal", // Allow the label to wrap
                              fontFamily: "'Open Sans', sans-serif", // Apply font family to FormControlLabel
                            }}
                          />
                        )}
                      />
                    </Grid> */}
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
                sx={{ color: "white" }}
                color="success"
                type="submit"
                // disabled={tab !== "1"}
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                }
              >
                {SaveUpdateName}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
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
