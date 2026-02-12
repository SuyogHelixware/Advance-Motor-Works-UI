import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { TabContext, TabPanel } from "@mui/lab";
import ViewListIcon from "@mui/icons-material/ViewList";

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
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
import CardComponent from "../Components/CardComponent";
import {
  InputTextField,
  InputTextSearchButton,
} from "../Components/formComponents";
import PhoneNumberInput from "../Components/PhoneNumber1";
import SearchInputField from "../Components/SearchInputField";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";
// import { DevTool } from "@hookform/devtools";
export default function CreditCard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const { user } = useAuth();
  const perms = usePermissions(30);
  const theme = useTheme();
  const timeoutRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  let [ok, setok] = useState("OK");

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

  //=====================================Search Model State====================================================================
  const [LCAcctRows, setLCAcctRows] = React.useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const LIMIT = 20;
  const [rowCount, setRowCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const initialFormData = {
    DocEntry: "",
    CreditCard: "",
    CardName: "",
    AcctCode: "",
    Phone: "",
    status: "1",
  };
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      ""
    );
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleTabChangeRight = (e, newvalue1) => settab(newvalue1);
  const OpenAcctModal = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);
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
  useEffect(() => {
    fetchInitialLCAccts({ page: currentPage, search: searchText });
  }, [currentPage, searchText]);

  //   const handleCellClick = (id) => {
  //   const selectedIDs = new Set(id);
  //   const selectedRows = Acclist
  //     .filter((row) => selectedIDs.has(row.DocEntry))
  //     .map((data) => ({
  //       ItemCode: data.ItemCode,
  //       ItemName: data.ItemName,
  //       Quantity: 1,
  //       PriceBefDi: data.PriceBefDi,
  //       Price: data.Price,
  //       DiscPrcnt: data.DiscPrcnt,
  //       LineTotal: data.LineTotal,
  //       CodeBars: data.CodeBars,
  //       WHSCode: data.DefaultWhs,
  //       OnHand: data.OnHand,
  //       IsCommited: data.IsCommited,
  //       OnOrder: data.OnOrder,
  //       MinLevel: data.MinLevel,
  //       AcctCode: data.AcctCode,
  //       StockPrice: data.StockPrice || "0",
  //       UoMCode: data.InvntoryUOM,
  //       unitMsr: data.SalUnitMsr,
  //       IUoMEntry: data.IUoMEntry,
  //       UomEntry2: data.UgpEntry,
  //       UomName: data.UomName,
  //       UomEntry: data.UomEntry,
  //       InvQty: "1",
  //       NumPerMsr: "1",
  //       INUoMEntry: data.INUoMEntry,
  //       oLines: data.oLines.map((item) => ({
  //         Price: item.Price,
  //         PriceList: item.PriceList,
  //       })),
  //     }));
  //   setSelectedRows(selectedRows);

  //   // console.log("Selected_Rows", selectedRows);
  // };
  const handleRowSelection = (params) => {
    const selectedAccount = LCAcctRows.find(
      (row) => row.DocEntry === params.id
    );

    if (selectedAccount) {
      console.log("Selected Account:", selectedAccount);
      setValue("AcctCode", selectedAccount.AcctCode);
      clearErrors("AcctCode");
      handleCloseDialog();
    }
  };

  const fetchInitialLCAccts = async ({ page = 0, limit = 20, search = "" }) => {
    
    try {
      setLoading(true);
      const params = new URLSearchParams();

      params.append("Page", page);
      params.append("Limit", limit);
      params.append("Status", 1);

      if (search) params.append("SearchText", search);

      params.append("LocManTran", "N");
      // params.append("GroupMask", "ALL");
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
    } catch (error) {
       Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch G/L Account data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationModelChange = useCallback(
    (model) => {
      if (model.page !== currentPage) {
        setCurrentPage(model.page);
      }
    },
    [currentPage]
  );
  const handleSearchChange = useCallback((searchText) => {
    setSearchText(searchText);
    setCurrentPage(0); // Reset to first page when searching
  }, []);
  //=======================================useform=============================================
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

  const allformdata = getValues();
  const { isDirty } = useFormState({ control });
  //=====================clear form=============================================
  const ClearForm = () => {
    reset(initialFormData);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
  };

  // ============================================ACTIVE TAB LOGIC CODE ==================================================================
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/CreditCardSetup/Search/${searchTerm}/1/${pageNum}/20`
        : `/CreditCardSetup/Pages/1/${pageNum}/20`;

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
  }, []);
  //===================================set data to fields==================================================
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
    console.log(DocEntry);
    toggleSidebar();
    setSaveUpdateName("UPDATE");

    try {
      setLoading(true);
      const { data } = await apiClient.get(`/CreditCardSetup/${DocEntry}`);
      const { values } = data;
      console.log(data);
      reset(values);
      setSelectedData(DocEntry);
      // reset({
      //     DocEntry: values.DocEntry,
      //     CreditCard: values.CreditCard,
      //     CardName: values.CardName,
      //     AcctCode: values.AcctCode,
      //     Phone: values.Phone,
      //     // Email: item.Email,
      // });
    } catch (error) {
        Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to set Credit Card data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
    }
    finally{
      setLoading(false);
    }
  };

  // ============================================INACTIVE TAB LOGIC CODE ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/CreditCardSetup/Search/${searchTerm}/0/${pageNum}/20`
        : `/CreditCardSetup/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreClosed(newData.length === 20);

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
  useEffect(() => {
    fetchClosedListData(0);
  }, []);

  // FOR SEARCH MODEL IN REQUERTER INPUTFIELD Users
  // const fetchInitialLCAccts = async () => {
  //   try {
  //     const response = await apiClient.get(
  //       `/ChartOfAccounts/Pages/1/0/20`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     const rows = response.data.values.map((item, index) => ({
  //       id: index,
  //       AcctCode: item.AcctCode,
  //       AcctName: item.AcctName,
  //       CurrTotal: item.CurrTotal,
  //     }));

  //     setLCAcctRows(rows);
  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error",
  //       text: "Failed to fetch initial GL accounts. Please try again later.",
  //     });
  //   }
  // };

  //====================================post and put api binding=========================
 const onsubmit = async (data) => {
  const StatusValue = watch("Status");

  const crecard = {
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs().format("YYYY/MM/DD"),
    ModifiedBy: user.UserName,
    ModifiedDate: dayjs().format("YYYY/MM/DD"),
    DocEntry: data.DocEntry || "",
    CreditCard: data.CreditCard,
    CardName: data.CardName,
    AcctCode: data.AcctCode,
    Phone: data.Phone,
    Status: StatusValue === "1" ? "1" : "0",
  };

  const normalizeString = (str) =>
    str.replace(/\s+/g, "").toLowerCase();

  // ================= SAVE =================
  if (SaveUpdateName === "SAVE") {
    if (Array.isArray(openListData)) {
      const isExisting = openListData.some(
        (item) =>
          normalizeString(item.CardName) ===
          normalizeString(data.CardName)
      );

      if (isExisting) {
        Swal.fire({
          text: "Credit Card Name Already Exist!",
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

      const response = await apiClient.post(
        `/CreditCardSetup`,
        crecard
      );

      if (response.data?.success) {
        ClearForm();

        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);

        setClosedListPage(0);
        setClosedListData([]);
        fetchClosedListData(0);

        Swal.fire({
          title: "Success!",
          text: "Credit Card Successfully Added",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data?.message || "Save failed",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Credit card save error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving credit card.",
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
    text: `Do You Want to Update "${crecard.CardName}"`,
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showCancelButton: true,
  });

  if (!confirm.isConfirmed) {
    Swal.fire({
      text: "Credit Card Not Updated",
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
      `/CreditCardSetup/${data.DocEntry}`,
      crecard
    );

    if (response.data?.success) {
      ClearForm();

      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      setClosedListPage(0);
      setClosedListData([]);
      fetchClosedListData(0);

      Swal.fire({
        title: "Success!",
        text: "Credit Card is Updated",
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
    console.error("Credit card update error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while updating credit card.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setLoading(false);
  }
};


  //==========================================delete api===============================
const handleOnDelete = async () => {
  const result = await Swal.fire({
    text: `Do you want to delete "${allformdata.CardName}"`,
    icon: "question",
    confirmButtonText: "YES",
    cancelButtonText: "No",
    showConfirmButton: true,
    showCancelButton: true,
  });

  if (!result.isConfirmed) {
    Swal.fire({
      text: "Credit Card not Deleted",
      icon: "info",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  try {
    setLoading(true);

    const resp = await apiClient.delete(
      `/CreditCardSetup/${allformdata.DocEntry}`
    );

    if (resp.data?.success) {
      ClearForm();
      setOpenListPage(0);
      setOpenListData([]);
      fetchOpenListData(0);

      Swal.fire({
        text: "Credit Card Deleted",
        icon: "success",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
    } else {
      // ✅ business error (200 but success=false)
      Swal.fire({
        title: "Info",
        text: resp.data?.message || "Delete failed",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Credit card delete error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while deleting credit card.",
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
          Credit card List
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
                      title={item.CardName}
                      subtitle={item.BinCode}
                      description={item.AcctCode}
                      isSelected={selectedData === item.DocEntry}
                      searchResult={openListquery}
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
                    <CardComponent
                      key={i}
                      title={item.CardName}
                      subtitle={item.BinCode}
                      // searchResult={item.AcctCode}
                      isSelected={selectedData === item.DocEntry}
                      searchResult={closedListquery}
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
              Credit card setup
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
                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      name="CreditCard"
                      rules={{
                        required: "This field is required",
                        validate: (value) =>
                          value.trim() !== "" || "Code cannot be empty",
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CREDIT CARD CODE"
                          type="number"
                          readOnly={SaveUpdateName === "UPDATE"}
                          inputProps={{
                            maxLength: 6,
                            onInput: (e) => {
                              if (e.target.value.length > 6) {
                                e.target.value = e.target.value.slice(0, 6);
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

                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      name="CardName"
                      rules={{
                        required: "Credit Card Name is required",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Credit Card Name cannot be empty",
                      }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="CREDIT CARD NAME"
                          readOnly={SaveUpdateName === "UPDATE"}
                          type="text"
                          inputProps={{ maxLength: 30 }}
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

                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    <Controller
                      name="AcctCode"
                      rules={{ required: "G/L Account is required" }}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          {...field}
                          label="G/L ACCOUNT"
                          type="number"
                          readOnly
                          value={field.value}
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={OpenAcctModal}
                                  edge="end"
                                  sx={{
                                    mr: 0.2,
                                    backgroundColor: "green",
                                    borderRadius: "10%",
                                    color: "white",
                                    padding: 0.5,
                                  }}
                                >
                                  <ViewListIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />

                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                    <DataGridCellClickModel
                      open={isDialogOpen}
                      closeModel={handleCloseDialog}
                      isLoading={loading}
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
                      selectedRowIndex={getValues("selectedRowIndex")}
                      oLines={getValues("oLines") || []}
                      // getRowClassName={(params) => params.id === selectedTax ? 'selected-row' : ''}
                    />

                    {/* ------------------------------------------------------------------------------------------------------------------------------------------- */}
                  </Grid>

                  <Grid item xs={12} md={6} lg={6} sm={6} textAlign={"center"}>
                    {/* <Controller
                        name="Phone"
                        rules={{ required: "this field is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="Telephone"
                            type="number"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      /> */}
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Controller
                        name="Phone"
                        control={control}
                        defaultValue=""
                        render={({ field, fieldState: { error } }) => (
                          <PhoneNumberInput
                            // defaultCountry="kw"
                            defaultCountry="in"
                            label="TELEPHONE"
                            value={field.value}
                            readOnly={allformdata.Phone === true}
                            onChange={(phone) => field.onChange(phone)}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid
                    item
                    md={6}
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Controller
                      name="Status"
                      control={control}
                      defaultValue="1"
                      render={({ field, fieldState: { error } }) => (
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
