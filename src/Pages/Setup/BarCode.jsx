import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";

import {
  Box,
  Button,
  Card,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
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
  InputSelectTextField,
  // InputSelectTextField,
  InputTextField,
  InputTextSearchButton,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";

export default function Barcode() {
  const theme = useTheme();
  const perms = usePermissions(47);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  //=====================================get List State====================================================================
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const [uomGroup, setUomGroup] = useState([]);
  const [filteredUomOptions, setFilteredUomOptions] = useState([]);
  const [barcodeRows, setBarcodeRows] = useState([]);

  const timeoutRef = useRef(null);
  const { user } = useAuth();
  let [ok, setok] = useState("OK");
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const initial = {
    BcdEntry: "",
    BcdName: "",
    BcdCode: "",
    ItemCode: "",
    UomEntry: "",
    UgpEntry: "",
  };
  const columns = [
    { field: "ItemCode", headerName: "Item Code", width: 180 },

    {
      field: "BcdCode",
      headerName: "Barcode",
      width: 250,
      renderCell: (params) => {
        return (
          <InputTextField
            label=""
            type="text"
            value={params.row.BcdCode}
            onChange={(e) => {
              const newValue = e.target.value;

              const rows = [...barcodeRows];
              rows[params.row.id - 1].BcdCode = newValue;

              setBarcodeRows(rows);
            }}
          />
        );
      },
    },

    // ⭐ UOM Group dropdown
    {
      field: "UgpEntry",
      headerName: "UOM Group",
      width: 230,
      renderCell: (params) => {
        return (
          <InputSelectTextField
            label=""
            disabled
            data={[
              ...(uomGroup || []).map((item) => ({
                key: item.DocEntry,
                value: item.UgpCode,
              })),
            ]}
            value={params.row.UgpEntry}
            onChange={(e) => {
              const newValue = e.target.value;

              const rows = [...barcodeRows];
              rows[params.row.id - 1].UgpEntry = newValue;

              setBarcodeRows(rows);
            }}
          />
        );
      },
    },

    // ⭐ UOM Code dropdown
    {
      field: "UomEntry",
      headerName: "UOM Code",
      width: 230,
      renderCell: (params) => {
        return (
          <InputSelectTextField
            label=""
            data={filteredUomOptions} // array of { key, value }
            value={params.row.UomEntry}
            onChange={(e) => {
              const newValue = e.target.value;

              const rows = [...barcodeRows];

              // Update UOM Entry
              rows[params.row.id - 1].UomEntry = newValue;

              // ⭐ Find UOM label from filteredUomOptions
              const selectedLabel =
                filteredUomOptions.find((x) => x.key === newValue)?.value || "";

              // ⭐ Auto-generate new Barcode
              const newBarcode =
                `${params.row.ItemCode}${selectedLabel}`.trim();

              // Set updated barcode
              rows[params.row.id - 1].BcdCode = newBarcode;

              setBarcodeRows(rows);
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <>
          {/* EDIT BUTTON */}
          <IconButton
            color="primary"
            // disabled={!perms.IsUpdate}
            onClick={() => handleOnEdit(params.row)}
          >
            <EditIcon />
          </IconButton>

          {/* DELETE BUTTON */}
          <IconButton
            color="error"
            disabled={!perms.IsDelete}
            onClick={() => handleOnDelete(params.row.DocEntry)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  const handleOnEdit = async (row) => {
    const confirmed = await Swal.fire({
      text: `Do You Want to Update ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });
    if (!confirmed) return;

    try {
      setLoading(true);
      // Build the payload exactly required by backend
      const payload = {
        DocEntry: row.DocEntry || 0,
        UserId: user?.UserId || "",
        CreatedBy: row.CreatedBy || user?.UserName || "",
        CreatedDate: row.CreatedDate || new Date().toISOString(),

        ModifiedBy: user?.UserName || "",
        ModifiedDate: new Date().toISOString(),

        Status: row.Status ?? 1,

        BcdCode: row.BcdCode,
        BcdName: row.BcdName || row.BcdCode,
        ItemCode: row.ItemCode,

        UomEntry: row.UomEntry || 0,
        UgpEntry: row.UgpEntry || 0,
      };


      // API URL: /api/Barcode/{DocEntry}
      const url = `/Barcode/${row.DocEntry}`;

      const response = await apiClient.put(url, payload);

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Barcode is Updated",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
        // If you want to refresh the list:
        fetchBarcodesByItemCode(row.ItemCode);
      } else {
        Swal.fire({
          title: "Success!",
          text: "Barcode is not Updated",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      }
    } catch (error) {
      Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update bank data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };
  const SearchModelClose = () => {
    setSearchmodelOpen(false);
  };

  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `/ItemsV2?Status=1&Page=${pageNum}&Limit=20&SearchText=${searchTerm}`
        : `/ItemsV2?Status=1&Page=${pageNum}&Limit=20`;

      const response = await apiClient.get(url);
      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch items.";

      Swal.fire({
        title: "Error!",
        text: apiMessage,
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };
  const onSelectItemCode = (selected) => {
    setValue("ItemCode", selected.ItemCode); // display in input
    setValue("ItemCodeDocEntry", selected.DocEntry); // backend ID
    setValue("UgpEntry", selected.UgpEntry);
    handleUomGroupChange();
    SearchModelClose(); // close modal
  };

  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);

    // Clear the previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchGetListData(0, res);
    }, 600);
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0); // Reset page to 0
    setGetListData([]); // Clear current data
    fetchGetListData(0); // Fetch first page without search
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchGetListData(0); // Load first page on mount
    FetchUoMGroup();
  }, []);
  // ===============Main list handlesearch====================================
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
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `/Barcode?Status=1&Page=${pageNum}&SearchText=${searchTerm}&Limit=20`
        : `/Barcode?Status=1&Page=${pageNum}&Limit=20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        // Combine old + new data
        const combined =
          pageNum === 0 ? newData : [...openListData, ...newData];

        // ⭐ DISTINCT BY ItemCode — keep FIRST only
        const distinctData = combined.filter(
          (item, index, arr) =>
            index === arr.findIndex((x) => x.ItemCode === item.ItemCode),
        );

        setHasMoreOpen(newData.length === 20);
        setOpenListData(distinctData);
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch barcode list.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenListData(0); // Load first page on mount
  }, []);
  const clearFormData = () => {
    reset(initial);
    setSaveUpdateName("SAVE");
    setSelectedData([]);
  };

  // ===============API for Setting specific Cards data====================================
  // const setOldOpenData = async (DocEntry, CardCode, CntctCode) => {
  //   setok("");
  //   try {
  //     // await setbusinessPartner(CardCode, CntctCode);
  //     if (isDirty || "UPDATE" === ok) {
  //       Swal.fire({
  //         text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
  //         icon: "question",
  //         confirmButtonText: "YES",
  //         cancelButtonText: "No",
  //         showConfirmButton: true,
  //         showDenyButton: true,
  //       }).then((Data) => {
  //         if (!Data.isConfirmed) {
  //           return;
  //         }
  //         setSelectedData(DocEntry);
  //         setBarcodeDataList(DocEntry);
  //         setSaveUpdateName("UPDATE");
  //       });
  //     } else {
  //       setBarcodeDataList(DocEntry);
  //       setSaveUpdateName("UPDATE");
  //     }
  //   } catch (error) {
  //     console.error("Error in setOldOpenData:", error);
  //     Swal.fire({
  //       title: "Error!",
  //       text: "Something went wrong while setting business partner data.",
  //       icon: "error",
  //       confirmButtonText: "OK",
  //     });
  //   }
  // };
  // const setBarcodeDataList = async (DocEntry) => {
  //   if (!DocEntry) {
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const response = await apiClient.get(`/Barcode?DocEntry=${DocEntry}`);
  //     const data = response.data.values;
  //     toggleDrawer();
  //     reset(data);
  //     handleUomGroupChange();

  //     setSaveUpdateName("UPDATE");
  //     setDocEntry(DocEntry);
  //     setSelectedData(DocEntry);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);

  //     // SweetAlert for error in the catch block
  //     Swal.fire({
  //       title: "Error!",
  //       text: "An error occurred while fetching the Barcode data.",
  //       icon: "error",
  //       confirmButtonText: "Ok",
  //     });
  //   }
  //   finally{
  //     setLoading(false);
  //   }
  // };

  // ==============useForm====================================

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    // formState: { errors },
  } = useForm({
    mode: "onSubmit", // or "onSubmit"
  });
  const itemCodeValue = watch("ItemCode");

  const { isDirty } = useFormState({ control });
  const getUomLabel = (key) => {
    const found = filteredUomOptions.find((u) => u.key === key);
    return found ? found.value : "";
  };
  const fetchBarcodesByItemCode = async (itemCode) => {
    if (!itemCode) {
      setBarcodeRows([]);
      return;
    }
    try {
      setLoading(true);
      const url = `/Barcode?Status=1&Page=0&SearchText=${itemCode}&Limit=100`;
      const response = await apiClient.get(url);

      if (response.data.success) {
        const rows = (response.data.values || []).map((x, index) => ({
          id: index + 1, // DataGrid row ID
          DocEntry: x.DocEntry, // ALWAYS present
          ...x,
        }));

        setBarcodeRows(rows);
      }
    } catch (e) {
      console.error("Barcode fetch error:", e);

      Swal.fire({
        title: "Error!",
        text:
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to fetch barcodes.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const ItemCode = watch("ItemCode");

  useEffect(() => {
    fetchBarcodesByItemCode(ItemCode);
  }, [ItemCode]);

  useEffect(() => {
    const itemCode = getValues("ItemCode");
    const uomKey = getValues("UomEntry");

    const uomLabel = getUomLabel(uomKey); // convert key → label

    if (itemCode && uomLabel) {
      const barcodeValue = `${itemCode}${uomLabel}`;
      setValue("BcdCode", barcodeValue, { shouldDirty: true });
    }
  }, [watch("ItemCode"), watch("UomEntry")]);

  // ===============PUT and POST API ===================================
  const FetchUoMGroup = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/UGP/All`);

      if (res.data.success) {
        const response = res.data.values;
        setUomGroup(response);

        // Create a Map for quick lookup of UomEntry -> UomCode
        const uomMap = new Map();

        response.forEach((group) => {
          if (group.oLines && Array.isArray(group.oLines)) {
            group.oLines.forEach((line) => {
              uomMap.set(line.UomEntry, line.UomCode);
            });
          }
        });
      } else {
        // ✅ business error (success=false)
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: res.data?.message || "UGP list not available.",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("UGP fetch error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load UGP list.",
        confirmButtonText: "Ok",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUomGroupChange = () => {
    const selectedUgpEntry = watch("UgpEntry");
    const selectedGroup = uomGroup.find(
      (group) => String(group.DocEntry) === String(selectedUgpEntry),
    );

    if (selectedGroup && selectedGroup.oLines) {
      const options = selectedGroup.oLines.map((line) => ({
        key: line.UomEntry,
        value: line.UomCode,
      }));

      setFilteredUomOptions(options);
    } else {
      setFilteredUomOptions([]);
    }

    // Reset UoM Entry after selecting group
    setValue("UomEntry", "");
  };

  const handleSubmitForm = async (data) => {
    const obj = {
      DocEntry: data.DocEntry || 0,
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate:
        dayjs(data.CreatedDate).format("YYYY-MM-DD") ||
        dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      ItemCode: String(data.ItemCode),
      BcdCode: String(data.BcdCode),
      BcdName: String(data.BcdName),
      UgpEntry: data.UgpEntry,
      UomEntry: data.UomEntry || -1,
      Status: 1,
    };

    try {
      setLoading(true);
      if (SaveUpdateName === "SAVE") {
        const resp = await apiClient.post(`/Barcode`, obj);

        if (resp.data.success) {
          fetchBarcodesByItemCode(watch("ItemCode"));
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Barcode is Added",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: resp.data.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        const result = await Swal.fire({
          text: `Do You Want to Update "${data.BcdName}"`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (result.isConfirmed) {
          const response = await apiClient.put(`/Barcode/${DocEntry}`, obj);
          if (response.data.success) {
            clearFormData();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);

            Swal.fire({
              title: "Success!",
              text: "Barcode Updated",
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
        } else {
          Swal.fire({
            text: "Barcode is Not Updated",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong",
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============Delete API ===================================

  const handleOnDelete = async (data) => {
    const result = await Swal.fire({
      text: `Do You Want to Delete ?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await apiClient.delete(`/Barcode/${DocEntry}`);
        const { success, message } = response.data;
        if (success) {
          clearFormData();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: "Barcode Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            text: "Barcode not Deleted",
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Error Occured while deleting the Barcode",
          confirmButtonText: "Ok",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        text: "Barcode Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  // const sidebarContent = (
  //   <>
  //     <Grid
  //       item
  //       width={"100%"}
  //       py={0.5}
  //       alignItems={"center"}
  //       border={"1px solid silver"}
  //       borderBottom={"none"}
  //       position={"relative"}
  //       sx={{
  //         backgroundColor:
  //           theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
  //       }}
  //     >
  //       <Typography
  //         textAlign={"center"}
  //         alignContent={"center"}
  //         height={"100%"}
  //       >
  //         Barcode List
  //       </Typography>
  //       <IconButton
  //         edge="end"
  //         color="inherit"
  //         aria-label="close"
  //         onClick={() => setDrawerOpen(false)}
  //         sx={{
  //           position: "absolute",
  //           right: "10px",
  //           top: "0px",
  //           display: { lg: "none", xs: "block" },
  //         }}
  //       >
  //         <CloseIcon />
  //       </IconButton>
  //     </Grid>

  //     <Grid
  //       container
  //       item
  //       width={"100%"}
  //       height={"100%"}
  //       border={"1px silver solid"}
  //       sx={{
  //         backgroundColor:
  //           theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
  //       }}
  //     >
  //       <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
  //         <Box
  //           sx={{
  //             width: "100%",
  //             height: "100%",
  //             px: 1,
  //             overflow: "scroll",
  //             overflowX: "hidden",
  //             typography: "body1",
  //           }}
  //           id="ListScroll"
  //         >
  //           <Grid
  //             item
  //             padding={1}
  //             md={12}
  //             sm={12}
  //             width={"100%"}
  //             sx={{
  //               position: "sticky",
  //               top: "0",
  //               backgroundColor:
  //                 theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
  //             }}
  //           >
  //             <SearchInputField
  //               onChange={(e) => handleOpenListSearch(e.target.value)}
  //               value={openListquery}
  //               onClickClear={handleOpenListClear}
  //             />
  //           </Grid>
  //           <InfiniteScroll
  //             style={{ textAlign: "center", justifyContent: "center" }}
  //             dataLength={openListData.length}
  //             hasMore={hasMoreOpen}
  //             next={fetchMoreOpenListData}
  //             loader={
  //               <BeatLoader
  //                 color={theme.palette.mode === "light" ? "black" : "white"}
  //               />
  //             }
  //             scrollableTarget="ListScroll"
  //             endMessage={<Typography>No More Records</Typography>}
  //           >
  //             {openListData.map((item, i) => (
  //               <CardComponent
  //                 key={i}
  //                 title={item.ItemCode}
  //                 // subtitle={item.BcdCode}
  //                 isSelected={selectedData === item.DocEntry}
  //                 searchResult={openListquery}
  //                 // onClick={() => setOldOpenData(item.DocEntry)}
  //               />
  //             ))}
  //           </InfiniteScroll>
  //         </Box>
  //       </Grid>
  //     </Grid>
  //   </>
  // );
  return (
    <>
      {loading && <Loader open={loading} />}
      {/* <Spinner open={loading} /> */}
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
        {/* <Grid
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
        </Grid> */}
        {/* User Creation Form Grid */}

        <Grid
          container
          item
          width="100%"
          height="100%"
          sm={12}
          md={12}
          lg={12}
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
              Barcode
            </Typography>
          </Grid>

          <Grid
            container
            item
            width={"100%"}
            height={"100%"}
            border={"1px silver solid"}
            // sx={{ backgroundColor: '#f9f9f9',  }}
          >
            <Grid
              container
              item
              padding={2}
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
                {/* Form Fields in a Card for better grouping */}
                <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Item Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} textAlign={"center"}>
                      <Controller
                        name="BcdCode"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="BARCODE"
                            type="text"
                            inputProps={{ maxLength: 254 }}
                            {...field}
                            error={!!error}
                            sx={{ maxWidth: 300, width: "100%" }}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} textAlign={"center"}>
                      <Controller
                        name="ItemCode"
                        rules={{ required: "Item Code is required" }}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextSearchButton
                            label="ITEM CODE"
                            readOnly={true}
                            onClick={() => {
                              OpenDailog();
                            }}
                            onChange={OpenDailog}
                            type="text"
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                      <SearchModel
                        open={searchmodelOpen}
                        onClose={SearchModelClose}
                        onCancel={SearchModelClose}
                        title="Select Vendor/Supplier"
                        onChange={(e) => handleGetListSearch(e.target.value)}
                        value={getListquery}
                        onClickClear={handleGetListClear}
                        cardData={
                          <>
                            <InfiniteScroll
                              style={{
                                textAlign: "center",
                                justifyContent: "center",
                              }}
                              dataLength={getListData.length}
                              next={fetchMoreGetListData}
                              hasMore={hasMoreGetList}
                              loader={
                                <BeatLoader
                                  color={
                                    theme.palette.mode === "light"
                                      ? "black"
                                      : "white"
                                  }
                                />
                              }
                              scrollableTarget="getListForCreateScroll"
                              endMessage={
                                <Typography textAlign={"center"}>
                                  No More Records
                                </Typography>
                              }
                            >
                              {getListData.map((item, index) => (
                                <CardComponent
                                  key={index}
                                  title={item.ItemCode}
                                  subtitle={item.CardName}
                                  description={item.Cellular}
                                  searchResult={getListquery}
                                  onClick={() => {
                                    onSelectItemCode(item);
                                  }}
                                />
                              ))}
                            </InfiniteScroll>
                          </>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} textAlign={"center"}>
                      <Controller
                        name="UgpEntry"
                        control={control}
                        defaultValue="0"
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="UOM GROUP"
                            {...field}
                            error={!!error}
                            inputProps={{ maxLength: 50 }}
                            helperText={error ? error.message : null}
                            disabled
                            data={[
                              ...(uomGroup || []).map((item) => ({
                                key: item.DocEntry,
                                value: item.UgpCode,
                              })),
                            ]}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} textAlign={"center"}>
                      <Controller
                        name="UomEntry"
                        control={control}
                        // rules={{ required: "UOM Code is required" }}
                        defaultValue="0"
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            label="UOM CODE"
                            {...field}
                            error={!!error}
                            disabled={!itemCodeValue}
                            inputProps={{ maxLength: 50 }}
                            helperText={error ? error.message : null}
                            data={filteredUomOptions}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* DataGrid in its own Card */}
                <Card sx={{ p: 2, boxShadow: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Barcode List
                  </Typography>
                  <Grid
                    item
                    xs={12}
                    // border={"1px solid silver"}
                    sx={{
                      flexGrow: 1,
                      marginTop: "15px",
                    }}
                  >
                    <DataGrid
                      className="datagrid-style"
                      rows={barcodeRows}
                      columns={columns}
                      pageSize={5}
                      hideFooter
                      disableColumnMenu
                      disableColumnSelector
                      disableDensitySelector
                      getRowId={(row) => row.DocEntry}
                      sx={{
                        height: "40vh",
                        backgroundColor: "#f9f9f9",
                        "& .MuiDataGrid-virtualScroller": {
                          overflowY: "auto !important",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          position: "sticky",
                          top: 0,
                          backgroundColor: "white",
                          zIndex: 2,
                        },
                      }}
                    />
                  </Grid>
                </Card>
              </Box>
            </Grid>

            <Grid
              item
              px={2}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                position: "sticky",
                bottom: "0px",
                backgroundColor: "#f9f9f9",
                paddingBottom: 2,
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
              {/* Uncomment if needed */}
              {/* <Button
      variant="contained"
      disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
      color="error"
      onClick={handleOnDelete}
    >
      DELETE
    </Button> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Drawer for smaller screens */}
    </>
  );
}
