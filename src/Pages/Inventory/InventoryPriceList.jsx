import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import CardComponentNew from "../Components/CardComponentNew";
import CurrencySelector from "../Components/currencyCode";
import DataGridModal from "../Components/DataGridModal";
import {
  InputSearchableSelect,
  InputSelectTextField,
  InputTextField
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import { TimeDelay } from "../Components/TimeDelay";
import usePermissions from "../Components/usePermissions";

export default function InventoryPriceList() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const perms = usePermissions(93);

  const [open, setOpen] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const [currencydata, setCurrencydata] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("36");
  // const timeoutRef = useRef(null);
  const DocEntryRef = useRef("");

  const [tab, settab] = useState("1");
  const [selectedRowId, setSelectedRowId] = React.useState(null);
  const [httpRequestToken, setCancelToken] = useState();
  const timeoutRef = useRef(null);

  //=====================================PriceList Modal List===================================================================
  const [getListqueryPriceList, setGetListQueryPriceList] = useState("");
  const [getListSearchingPriceList, setGetListSearchingPriceList] =
    useState(false);
  const [getListDataPriceList, setGetListDataPriceList] = useState([]);
  const [getListPagePriceList, setGetListPagePriceList] = useState(0);
  const [hasMoreGetListPriceList, setHasMoreGetListPriceList] = useState(true);
  const [searchmodelOpenPriceList, setSearchmodelOpen] = useState(false);

  //=====================================PriceList Modal List===================================================================
  const [getListqueryPriceList1, setGetListQueryPriceList1] = useState("");
  const [getListSearchingPriceList1, setGetListSearchingPriceList1] =
    useState(false);
  const [getListPagePriceList1, setGetListPagePriceList1] = useState(0);
  const [searchmodelOpenPriceList1, setSearchmodelOpen1] = useState(false);
  const [currentPriceListDocEntry, setCurrentPriceListDocEntry] =
    useState(null);
  const [priceListAll, setPriceListAll] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [uomData, setUomData] = useState([]);
  const { user, companyData } = useAuth();
  const [selectedData, setSelectedData] = useState([]);
  let [ok, setok] = useState("OK");

  //=====================================open List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  //=====================================Close List State====================================================================
  const [CloseListData, setCloseListData] = useState([]);
  const [CloseListPage, setCloseListPage] = useState(0);
  const [hasMoreClose, setHasMoreClose] = useState(true);
  const [CloseListquery, setCloseListQuery] = useState("");
  const [CloseListSearching, setCloseListSearching] = useState(false);

  //=====================================InActive List State====================================================================
  const LIMIT = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [itemCache, setItemCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const [openCreateCurrencyDialog, setopenCreateCurrencyDialog] =
    useState(false);
    const handleCurrencyClose = () => setopenCreateCurrencyDialog(false);
  const apiRef = useGridApiRef();

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  useEffect(() => {
    fetchItems();
    CurrencyData();
    FetchUomData();
    // BasePriceListData();
    FetchPriceListAll();
    fetchGetListDataPriceList(0);
    // getUserCreationInactiveDataList();
  }, []);

  useEffect(() => {
    fetchOpenListData(0);
    fetchCloseListData(0);
  }, []);

  //=============================Active tab functions===============================================================

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

 const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
  try {
    setIsLoading(true); // 🔄 start loader

    const url = searchTerm.trim()
      ? `/PriceList/search/${searchTerm}/1/${pageNum}/20`
      : `/PriceList/pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);

    if (!response.data?.success) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text: response.data?.message || "Failed to fetch price list",
      });
      return;
    }

    const newData = response.data.values || [];

    // 📭 Record not found (only on first page)
    if (pageNum === 0 && newData.length === 0) {
      Swal.fire({
        text: "Record Not Found",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }

    setHasMoreOpen(newData.length === 20);

    setOpenListData((prev) =>
      pageNum === 0 ? newData : [...prev, ...newData],
    );
  } catch (error) {
    console.error("❌ Error fetching price list:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching data",
    });
  } finally {
    setIsLoading(false); // ✅ stop loader always
  }
};

  //=============================Inactive tab functions===============================================================

  const handleCloseListSearch = (res) => {
    setCloseListQuery(res);
    setCloseListSearching(true);
    setCloseListPage(0);
    setCloseListData([]); // Clear current data

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCloseListData(0, res);
    }, 600);
    // Fetch with search query
  };

  const handleCloseListClear = () => {
    setCloseListQuery(""); // Clear search input
    setCloseListSearching(false); // Reset search state
    setCloseListPage(0); // Reset page count
    setCloseListData([]); // Clear data
    fetchCloseListData(0); // Fetch first page without search
  };

  const fetchMoreCloseListData = () => {
    fetchCloseListData(
      CloseListPage + 1,
      CloseListSearching ? CloseListquery : "",
    );
    setCloseListPage((prev) => prev + 1);
  };

const fetchCloseListData = async (pageNum = 0, searchTerm = "") => {
  try {
    setIsLoading(true); // 🔄 start loader

    const url = searchTerm.trim()
      ? `/PriceList/search/${searchTerm}/0/${pageNum}/20`
      : `/PriceList/pages/0/${pageNum}/20`;

    const response = await apiClient.get(url);

    if (!response.data?.success) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text: response.data?.message || "Failed to fetch closed price list",
      });
      return;
    }

    const newData = response.data.values || [];

    // 📭 Record not found (only on first page)
    if (pageNum === 0 && newData.length === 0) {
      Swal.fire({
        text: "Record Not Found",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }

    setHasMoreClose(newData.length === 20);

    setCloseListData((prev) =>
      pageNum === 0 ? newData : [...prev, ...newData],
    );
  } catch (error) {
    console.error("❌ Error fetching closed price list:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching data",
    });
  } finally {
    setIsLoading(false); // ✅ stop loader
  }
};


const FetchUomData = async () => {
  try {
    setIsLoading(true); // 🔄 start loader

    const res = await apiClient.get(`/UnitofMeasure/All`);

    if (!res.data?.success) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text: res.data?.message || "Failed to fetch Unit of Measure data",
      });
      return;
    }

    setUomData(res.data.values || []);
  } catch (error) {
    console.error("❌ Error fetching UOM data:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching Unit of Measure data",
    });
  } finally {
    setIsLoading(false); // ✅ stop loader
  }
};

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };
  const SearchModelClose = () => {
    handleGetListClearPriceList();
    setSearchmodelOpen(false);
  };
  const onSelectRequestPriceList = async (DocEntry) => {
    try {
      const selectedPriceList = getListDataPriceList.find(
        (item) => item.DocEntry === DocEntry,
      );

      if (!selectedPriceList) {
        console.error("Selected price list not found.");
        return;
      }

      setValue("BaseNum", selectedPriceList, { shouldDirty: true });

      const updatedLines = (getValues("oLines") || []).map((line) => {
        const matchedPriceItem = selectedPriceList.Items?.find(
          (item) => item.ItemCode === line.ItemCode,
        );

        return {
          ...line,
          BasePLNum: matchedPriceItem?.Price ?? 0,
        };
      });

      setValue("oLines", updatedLines, { shouldDirty: true });

      SearchModelClose();
    } catch (error) {
      console.error("Error in onSelectRequestPriceList:", error);
    }
  };
  const handleGetListClearPriceList = () => {
    setGetListQueryPriceList("");
    setGetListSearchingPriceList(true);
    setGetListPagePriceList(0);
    setGetListDataPriceList([]);
    fetchGetListDataPriceList(0);
  };
  const handleGetListSearchPriceList = (res) => {
    setGetListQueryPriceList(res);
    setGetListSearchingPriceList(true);
    setGetListPagePriceList(0);
    setGetListDataPriceList([]);

    //Searching time out
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchGetListDataPriceList(0, res);
    }, TimeDelay);
    // fetchCloseListData(0,res,httpRequestToken);
  };
  const fetchMoreGetListDataPriceList = () => {
    fetchGetListDataPriceList(
      getListPagePriceList + 1,
      getListSearchingPriceList ? getListqueryPriceList : "",
    );
    setGetListPagePriceList((prev) => prev + 1);
  };
 const fetchGetListDataPriceList = async (pageNum = 0, searchTerm = "") => {
  try {
    setIsLoading(true); // 🔄 start loader

    const url = searchTerm
      ? `/PriceList/Search/${searchTerm}/1/${pageNum}/20`
      : `/PriceList/Pages/1/${pageNum}/20`;

    const response = await apiClient.get(url);

    if (!response.data?.success) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text:
          response.data?.message ||
          "Failed to fetch Price List data",
      });
      return;
    }

    const newData = response.data.values || [];

    setHasMoreGetListPriceList(newData.length === 20);

    setGetListDataPriceList((prev) =>
      pageNum === 0 ? newData : [...prev, ...newData],
    );
  } catch (error) {
    console.error("❌ PriceList fetch error:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching Price List data",
    });
  } finally {
    setIsLoading(false); // ✅ stop loader
  }
};

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const OpenDailog1 = () => {
    setSearchmodelOpen1(true);
  };
  const SearchModelClose1 = () => {
    handleGetListClearPriceList1();
    setSearchmodelOpen1(false);
  };
 const onSelectRequestPriceList1 = async (docEntry, ListName) => {
  if (!selectedRowData) return;

  const itemCode = selectedRowData.ItemCode;
  const status = 1;
  const page = 0;
  const limit = 20;

  const url = `/PriceList/ItemsPrices/Search/${docEntry}/${itemCode}/${status}/${page}/${limit}`;

  try {
    setIsLoading(true); // 🔄 start loader

    const response = await apiClient.get(url);

    if (!response.data?.success) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text:
          response.data?.message ||
          "Failed to fetch item price from Price List",
      });
      return;
    }

    const data = response.data?.values?.[0]; // first item

    if (!data) {
      Swal.fire({
        icon: "info",
        text: "No price found for the selected item in this Price List",
      });
      return;
    }

    const currentLines = getValues("oLines") || [];

    const updatedLines = currentLines.map((row, index) => {
      if (index !== selectedRowData.id) return row;

      return {
        ...row,
        Factor: "", // clear factor
        BasePLNum: ListName, // selected Price List name
        BasePrice: Number(data.Price || 0).toFixed(2), // base price
        Price: "", // reset price
        _wasEdited: true,
        manual: false,
      };
    });

    reset({
      ...allFormData,
      oLines: updatedLines,
    });
  } catch (error) {
    console.error("❌ Error fetching item prices:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching item price",
    });
  } finally {
    setIsLoading(false); // ✅ stop loader
  }

  SearchModelClose1();
};

  const handleGetListClearPriceList1 = () => {
    setGetListQueryPriceList1("");
    setGetListSearchingPriceList1(true);
    setGetListPagePriceList1(0);
    setGetListDataPriceList([]);
    fetchGetListDataPriceList(0);
  };
  const handleGetListSearchPriceList1 = (res) => {
    setGetListQueryPriceList1(res);
    setGetListSearchingPriceList1(true);
    setGetListPagePriceList1(0);
    setGetListDataPriceList([]);
    if (typeof httpRequestToken != typeof undefined) {
      console.log("REQUEST CANCELLED", httpRequestToken);
      httpRequestToken.cancel("Operation canceled due to new request.");
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchGetListDataPriceList(0, res, httpRequestToken);
    }, TimeDelay);
  };
  const fetchMoreGetListDataPriceList1 = () => {
    fetchGetListDataPriceList(
      getListPagePriceList1 + 1,
      getListSearchingPriceList1 ? getListqueryPriceList1 : "",
    );
    setGetListPagePriceList1((prev) => prev + 1);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

 const CurrencyData = async () => {
  try {
    setIsLoading(true); // 🔄 start loader

    const res = await apiClient.get(`/Currency/all`);

    // ✅ handle API-level failure
    if (!res.data?.success) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text: res.data?.message || "Failed to fetch currency data",
      });
      return;
    }

    const response = res.data.values || [];
    setCurrencydata(response); // set list

    // ✔ match company currency immediately
    if (companyData?.MainCurncy && response.length > 0) {
      const matched = response.find(
        (x) => x.CurrCode === companyData.MainCurncy,
      );

      if (matched) {
        setValue("PrimCurr", matched.DocCurrCod); // RHF default
        setSelectedCurrency(matched.DocCurrCod); // local state
      }
    }
  } catch (error) {
    console.error("❌ Currency fetch error:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching currency data",
    });
  } finally {
    setIsLoading(false); // ✅ stop loader always
  }
};


  const FetchPriceListAll = async () => {
  try {
    setIsLoading(true); // 🔄 start loader

    const res = await apiClient.get(`/PriceList/All`);

    // ✅ API-level failure handling
    if (!res.data?.success) {
      Swal.fire({
        icon: "warning",
        title: "Error",
        text: res.data?.message || "Failed to fetch Price List data",
      });
      return;
    }

    const response = res.data.values || [];
    setPriceListAll(response);
    console.log("pricelistall", response);
  } catch (error) {
    console.error("❌ PriceList fetch error:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching Price List data",
    });
  } finally {
    setIsLoading(false); // ✅ stop loader always
  }
};

  const initialCurrencyData = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: user.UserName,
    Status: 1,
    CurrCode: "",
    CurrName: "",
    CountryCode: "",
    DocCurrCod: "",
    ChkName: "",
    Chk100Name: "",
    FrgnName: "",
    F100Name: "",
    ISOCurrCod: "",
    RoundSys: "0",
    Decimals: "-1",
    RoundPym: "",
  };
  const {
    handleSubmit: HandleCurrencyForm,
    control: ControlCurrency,
    reset: resetCurrency,
    watch: watchCurrency,
    // getValues: getValues1,
    setValue: setValueCurrency,
  } = useForm({
    defaultValues: initialCurrencyData,
  });
  const RoundPym = watchCurrency("RoundPym");
  const ClearCurrencyForm = () => {
    resetCurrency(initialCurrencyData);
  };
 const handleAddCurrency = async (data) => {
  const obj = {
    DocEntry: String(data.DocEntry || ""),
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs().format("YYYY/MM/DD"),
    ModifiedBy: user.UserName,
    ModifiedDate: dayjs().format("YYYY/MM/DD"),
    Status: "1",
    CurrCode: String(data.CurrCode || ""),
    CurrName: String(data.CurrName || ""),
    CountryCode: String(data.CountryCode || ""),
    DocCurrCod: String(data.DocCurrCod || ""),
    ChkName: String(data.ChkName || ""),
    Chk100Name: String(data.Chk100Name || ""),
    FrgnName: String(data.FrgnName || ""),
    F100Name: String(data.F100Name || ""),
    ISOCurrCod: String(data.ISOCurrCod || ""),
    RoundSys: String(data.RoundSys || ""),
    Decimals: String(data.Decimals || ""),
    RoundPym: RoundPym === "Y" ? "Y" : "N",
  };

  try {
    if (SaveUpdateName !== "SAVE") return;

    setIsLoading(true); // 🔄 start loader

    const response = await apiClient.post(`/CurrenciesV2`, obj);
    const { success, message } = response.data || {};

    // ❌ API returned failure
    if (!success) {
      Swal.fire({
        title: "Currency Not Added",
        text: message || "Failed to add currency",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    // ✅ SUCCESS
    ClearCurrencyForm();
    setOpenListPage(0);
    setOpenListData([]);
    fetchOpenListData(0);
    CurrencyData();
    handleCurrencyClose();

    Swal.fire({
      title: "Success!",
      text: "Currency added successfully",
      icon: "success",
      confirmButtonText: "Ok",
      timer: 1000,
    });
  } catch (error) {
    console.error("❌ Currency save error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save Currency data",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setIsLoading(false); // ✅ always stop loader
  }
};

  const initialFormData = {
    ListName: "",
    ListNum: "",
    BaseNum: "",
    PrimCurr: companyData.MainCurncy,
    Factor: "1",
    RoundSys: "1",
    Status: "1",
  };
  const { control, handleSubmit, reset, setValue, getValues, watch } = useForm({
    defaultValues: initialFormData,
  });
  const { isDirty } = useFormState({ control });

  const baseNum = useWatch({ control, name: "BaseNum" });

  const handleDeleteRow = (id) => {
    const updatedRows = allFormData.oLines.filter((_, index) => index !== id);

    const updatedData = {
      ...allFormData,
      oLines: updatedRows,
    };

    // Reset the form with the updated data
    reset(updatedData);
  };
  const handleClickOpen = () => {
    setOpen(true);
    fetchItems(0, "");
  };
  const closeModel = () => {
    setOpen(false);
  };
  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;
      // Use cache if exists
      if (itemCache[cacheKey]) {
        setItemList(itemCache[cacheKey]);
        return;
      }
      try {
        setIsLoading(true);
        const { data } = await apiClient.get(`/ItemsV2`, {
          params: {
            InventoryItem: "Y",
            Status: 1,
            SearchText: search,
            Page: page,
            Limit: LIMIT,
          },
        });

        if (data.success) {
          const items = data.values || [];
          setItemCache((prev) => ({
            ...prev,
            [cacheKey]: items,
          }));
          setItemList(items);
          const estimatedRowCount =
            page === 0 ? LIMIT + 1 : page * LIMIT + items.length + 1;
          setRowCount(estimatedRowCount);
        } else {
          Swal.fire("Error!", data.message, "warning");
        }
      } catch (err) {
        Swal.fire("Error!", err.message || "Failed to fetch items.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [itemCache],
  );
  useEffect(() => {
    fetchItems(currentPage, searchText);
  }, [currentPage, searchText]);
  const handlePaginationModelChange = useCallback(
    ({ page }) => {
      if (page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [currentPage],
  );

  const handleSearchChange = useCallback((search) => {
    setSearchText(search);
    setCurrentPage(0); // Reset to page 0 on search
    setItemCache({}); // Clear cache on new search
  }, []);

 const handleOnDelete = async () => {
  const result = await Swal.fire({
    text: "Do you want to delete?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "YES",
    cancelButtonText: "No",
  });

  if (!result.isConfirmed) {
    Swal.fire({
      text: "Price List not deleted",
      icon: "info",
      toast: true,
      showConfirmButton: false,
      timer: 1500,
    });
    return;
  }

  try {
    setIsLoading(true); // 🔄 start loader

    const resp = await apiClient.delete(`/PriceList/${DocEntry}`);
    const { success, message } = resp.data || {};

    // ❌ API-level failure
    if (!success) {
      Swal.fire({
        title: "Delete Failed",
        text: message || "Unable to delete Price List",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    // ✅ SUCCESS
    ClearFormData();

    setOpenListPage(0);
    setCloseListPage(0);
    setOpenListData([]);
    setCloseListData([]);

    fetchOpenListData(0);
    fetchCloseListData(0);

    Swal.fire({
      text: "Price List deleted successfully",
      icon: "success",
      toast: true,
      showConfirmButton: false,
      timer: 1000,
    });
  } catch (error) {
    console.error("❌ Error deleting Price List:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while deleting",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setIsLoading(false); // ✅ always stop loader
  }
};

  const ClearFormData = () => {
    reset(initialFormData);
    setSaveUpdateName("SAVE");
    setDocEntry("");
    setSelectedData([]);
    // reset();
    // setoLines([]);
    // setDocType(DocType);
    // handleClick();
  };

  const ItemColumn = [
    {
      field: "ItemCode",
      headerName: "Item Code",
      width: 150,
      editable: true,
    },
    {
      field: "ItemName",
      headerName: "Item Description",
      width: 150,
      editable: true,
    },
    // {
    //   field: "QTY",
    //   headerName: "QUANTITY",
    //   width: 120,
    //   editable: true,
    // },
    {
      field: "Price",
      headerName: "Price",
      width: 120,
      editable: true,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      editable: true,
      renderCell: (params) => (params.value ? "Inactive" : "Active"),
    },
  ];
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);
  const handleCellKeyDown = (params, event) => {
    const api = apiRef.current;
    if (!api) return;
    const visibleColumns = api.getVisibleColumns();
    const rowIds = api.getSortedRowIds();

    const colIndex = visibleColumns.findIndex((c) => c.field === params.field);

    //   const rowIndex = getValues("oLines").findIndex(
    //   (r) => r.id === params.id
    // )
    const rowIndex = rowIds.indexOf(params.id);
    let nextRow = rowIndex;
    let nextCol = colIndex;

    const NAV_KEYS = [
      "Tab",
      "Enter",
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
    ];
    if (!NAV_KEYS.includes(event.key)) return;

    event.preventDefault();

    if (api.getCellMode(params.id, params.field) === "edit") {
      api.stopCellEditMode({ id: params.id, field: params.field });
    }

    switch (event.key) {
      case "Tab":
        nextCol = event.shiftKey ? nextCol - 1 : nextCol + 1;
        if (nextCol < 0) {
          nextCol = visibleColumns.length - 1;
          nextRow--;
        }
        if (nextCol >= visibleColumns.length) {
          nextCol = 0;
          nextRow++;
        }
        break;
      case "Enter":
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      default:
    }

    if (
      nextRow < 0 ||
      nextRow >= rowIds.length ||
      nextCol < 0 ||
      nextCol >= visibleColumns.length
    )
      return;

    const nextId = rowIds[nextRow];
    const nextField = visibleColumns[nextCol].field;

    // ✅ Scroll cell into view
    api.scrollToIndexes({ rowIndex: nextRow, colIndex: nextCol });

    api.setCellFocus(nextId, nextField);

    // // Start edit mode if editable
    // const nextCellParams = api.getCellParams(nextId, nextField);
    // if (nextCellParams.isEditable) {
    //   setTimeout(() => api.startCellEditMode({ id: nextId, field: nextField }));
    // }
  };
  const columns = [
    {
      field: "rowSelect",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => (
        <Checkbox checked={params.row._wasEdited === true} disabled />
      ),
    },
    {
      field: "ItemCode",
      headerName: "Item Code",
      width: 150,
      align: "center",
    },
    {
      field: "ItemName",
      headerName: "Item Description",
      width: 150,
      align: "center",
    },
    {
      field: "BasePLNum",
      headerName: "Base Price List No.",
      width: 250,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",

      renderCell: (params) => {
        const rowIndex = params.row.id;
        const hasBasePL = !!params.row.BasePLNum;

        return (
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "F2" ||
                e.key === " " ||
                (e.key === "Tab" && !e.shiftKey)
              ) {
                e.preventDefault();

                // 🔥 KEYBOARD RULE: if value exists → DO NOT open
                if (hasBasePL) return;

                setSelectedRowData(params.row);
                OpenDailog1();
              }
            }}
            sx={{
              width: "100%",
              height: "100%",
              outline: "none",
            }}
          >
            {/* VALUE */}
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                noWrap
                textAlign="center"
                sx={{ fontSize: 13 }}
                title={params.row.BasePLNum || ""}
              >
                {params.row.BasePLNum || watch("BasePLNum") || ""}
              </Typography>
            </Grid>

            {/* ICON */}
            <Grid item sx={{ width: 28, textAlign: "center" }}>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedRowData(params.row);
                  OpenDailog1();
                }}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "6px",
                  padding: "4px",
                  "&:hover": { backgroundColor: "darkgreen" },
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    {
      field: "Factor",
      headerName: "Factor",
      width: 150,
      editable: true, // ✅ important
      align: "center",
    },

    {
      field: "BasePrice",
      headerName: "Base Price",
      width: 100,
      align: "center",
    },

    {
      field: "Price",
      headerName: "Unit Price",
      width: 150,
      editable: true, // ✅ important
      align: "center",
    },

    {
      field: "manual",
      headerName: "Manual",
      width: 100,
      align: "center",
      renderCell: (params) => <Checkbox checked={params.value} disabled />,
    },

    {
      field: "IUoMEntry",
      headerName: "Inventory UoM",
      width: 130,
      align: "center",
      renderCell: (params) => <span>{params.row.UomName}</span>,
    },

    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      align: "center",
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDeleteRow(params.id)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];
  const processRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...newRow };

    const base = parseFloat(updatedRow.BasePrice);
    const factor = parseFloat(updatedRow.Factor);

    // 🔹 Recalculate Unit Price
    if (
      newRow.Factor !== oldRow.Factor ||
      newRow.BasePrice !== oldRow.BasePrice
    ) {
      if (!Number.isNaN(base) && !Number.isNaN(factor)) {
        updatedRow.Price = (factor * base).toFixed(2);
      } else {
        updatedRow.Price = "";
      }
    }

    // 🔹 Manual checkbox logic
    const parsedBase = parseFloat(updatedRow.BasePrice);
    const parsedPrice = parseFloat(updatedRow.Price);

    updatedRow.manual =
      !Number.isNaN(parsedBase) &&
      !Number.isNaN(parsedPrice) &&
      parsedBase.toFixed(2) !== parsedPrice.toFixed(2);

    // 🔹 Edited flag logic (same as before)
    updatedRow._wasEdited = Object.keys(updatedRow).some(
      (key) => updatedRow[key] !== oldRow[key],
    );

    // 🔹 Update RHF oLines (single row update)
    const oLines = [...getValues("oLines")];
    oLines[newRow.id] = updatedRow;

    setValue("oLines", oLines, {
      shouldDirty: true,
      shouldTouch: true,
    });

    return updatedRow;
  };

  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  const onSubmit = () => {
    const existingLines = allFormData.oLines || [];

    // Filter out duplicates based on ItemCode
    const uniqueNewRows = selectedRows
      .filter(
        (newRow) =>
          !existingLines.some(
            (existingRow) => existingRow.ItemCode === newRow.ItemCode,
          ),
      )
      .map((row) => ({
        ...row,
        manual: false, // 🔥 force manual to false
        _wasEdited: false, // optional: if you want checkbox also off
      }));

    const updatedData = {
      ...allFormData,
      oLines: [...existingLines, ...uniqueNewRows],
    };

    reset(updatedData);
    closeModel();
  };

  // const handleChange = (e, row) => {
  //   const { name, value } = e.target;

  //   const updatedLines = getValues("oLines").map((data, index) => {
  //     if (index !== row.id) return data; // Skip updating if it's not the current row

  //     const updatedData = { ...data, [name]: value };

  //     // Recalculate Unit Price if Factor or BasePrice changed
  //     const base = parseFloat(updatedData.BasePrice);
  //     const factor = parseFloat(updatedData.Factor);

  //     if (name === "Factor" || name === "BasePrice") {
  //       if (!Number.isNaN(base) && !Number.isNaN(factor)) {
  //         updatedData.Price = (factor * base).toFixed(2); // Update Price based on Factor * BasePrice
  //       } else {
  //         updatedData.Price = ""; // If invalid values, clear the price
  //       }
  //     }

  //     // Manual checkbox logic: If BasePrice and Price don't match
  //     const parsedBase = parseFloat(updatedData.BasePrice);
  //     const parsedPrice = parseFloat(updatedData.Price);
  //     updatedData.manual =
  //       !Number.isNaN(parsedBase) &&
  //       !Number.isNaN(parsedPrice) &&
  //       parsedBase.toFixed(2) !== parsedPrice.toFixed(2);

  //     // Compare updated data to the original row data for changes
  //     const original = row.original || {}; // Attach original state for comparison

  //     const isEdited = Object.keys(updatedData).some((key) => {
  //       return updatedData[key] !== original[key]; // Check if any value has changed
  //     });

  //     updatedData._wasEdited = isEdited; // Mark the row as edited if there's any change

  //     return updatedData;
  //   });

  //   // Reset form state with updated lines
  //   reset({ ...allFormData, oLines: updatedLines });
  // };
  const handleCellClick = (ids) => {
    const selectedIDs = new Set(ids);

    const selectedRows = itemList
      .filter((row) => selectedIDs.has(row.DocEntry))
      .map((data) => {
        const matchedOLine = data.oLines?.find(
          (ol) => ol.PriceList === currentPriceListDocEntry,
        );

        const matchedBasePriceList = priceListAll.find(
          (pl) => pl.DocEntry === matchedOLine?.BasePLNum,
        );

        let basePrice = "";
        if (
          matchedOLine?.BasePLNum &&
          matchedOLine.BasePLNum === matchedOLine.PriceList
        ) {
          basePrice = matchedOLine.Price ?? "";
        } else {
          const basePriceLine = data.oLines?.find(
            (ol) =>
              ol.PriceList === matchedOLine?.BasePLNum &&
              data.ItemCode === data.ItemCode,
          );
          basePrice = basePriceLine?.Price ?? "";
        }

        const matchedUom = uomData.find(
          (uom) => uom.DocEntry === data.IUoMEntry,
        );
        const uomName = matchedUom ? matchedUom.UomName : "";

        const row = {
          ItemCode: data.ItemCode,
          ItemName: data.ItemName,
          IUoMEntry: data.IUoMEntry,
          BasePLNum: matchedBasePriceList?.ListName ?? "",
          DocEntry: data.DocEntry,
          Price: matchedOLine?.Price ?? data.Price,
          Quantity: 1,
          AssblValue: 0,
          LineTotal: matchedOLine?.Price ?? data.Price,
          PriceBefDi: data.UnitPrice,
          UomCode: data.UOMCode,
          IsCommited: data.IsCommited,
          OnOrder: data.OnOrder,
          WhsCode: data.WhsCode,
          Factor: matchedOLine?.Factor ?? "",
          BasePrice: basePrice,
          manual: basePrice !== (matchedOLine?.Price ?? data.Price),
          oLines: data.oLines.map((item) => ({
            Price: item.Price,
            PriceList: item.PriceList,
            Factor: item.Factor,
            BasePLNum: item.BasePLNum,
          })),
          UomName: uomName,
        };

        // Save the original state for comparison later
        return {
          ...row,
          original: { ...row },
          _wasEdited: false, // Mark as not edited initially
        };
      });

    setSelectedRows(selectedRows);
  };
  const allFormData = getValues();
  const OldPriceListData = async (DocEntry, CardCode, CntctCode) => {
    setok("");

    // Check for unsaved rows in the data grid
    const currentOLines = getValues("oLines") || [];
    const hasUnsavedRows =
      SaveUpdateName !== "UPDATE" && currentOLines.length > 0;

    try {
      // Set business partner data before proceeding
      // await setbusinessPartner(CardCode, CntctCode);

      // If there are unsaved rows or the data is being updated, show a confirmation popup
      if (isDirty || "UPDATE" === ok || hasUnsavedRows) {
        Swal.fire({
          text: "Unsaved data will be lost. Are you sure you want to proceed without saving?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        }).then((Data) => {
          if (Data.isConfirmed) {
            // If user confirms, proceed with fetching goods issue data and setting state
            setSelectedData(DocEntry);
            setPriceListData(DocEntry);
            setSaveUpdateName("UPDATE");
          } else {
            // If user cancels, show a notification
            Swal.fire({
              text: "Not Select Record",
              icon: "info",
              toast: true,
              showConfirmButton: false,
              timer: 1500,
            });
          }
        });
      } else {
        // If no unsaved data, fetch goods issue data and set state directly
        setPriceListData(DocEntry);
        setSaveUpdateName("UPDATE");
        setSelectedData(DocEntry);
      }
    } catch (error) {
      console.error("Error in setOldOpenData:", error);
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
const setPriceListData = async (DocEntry) => {
  if (!DocEntry) return;

  try {
    setIsLoading(true); // 🔄 start loader

    const response = await apiClient.get(`/PriceList/${DocEntry}`);
    const { success, values, message } = response.data || {};

    // ❌ API-level failure
    if (!success || !values) {
      Swal.fire({
        title: "Error!",
        text: message || "Failed to fetch Price List data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
      return;
    }

    const data = values;

    // 🔎 Resolve Base Price List object
    const fullBasePriceList =
      getListDataPriceList?.find(
        (p) => String(p.DocEntry) === String(data.BaseNum),
      ) || null;

    // ✅ Persist for item price logic
    setCurrentPriceListDocEntry(data.DocEntry);

    // ✅ Reset form with fetched data
    reset({
      ...data,
      BaseNum: fullBasePriceList,
      PrimCurr: data.PrimCurr || "INR",
    });

    // ✅ Update UI states
    setSelectedCurrency(data.PrimCurr || "INR");
    setSaveUpdateName("UPDATE");
    setDocEntry(data.DocEntry);
    setSelectedData(data.DocEntry);
    DocEntryRef.current = data.DocEntry;

    toggleDrawer();
  } catch (error) {
    console.error("❌ Error fetching Price List:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while fetching Price List data.",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setIsLoading(false); // ✅ stop loader
  }
};


  const StatusValue = watch("Status");

 const handleSubmitForm = async (data) => {
  setIsLoading(true);

  try {
    const Postobj = {
      DocEntry: String(data.DocEntry || ""),
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs().format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY-MM-DD"),
      ListNum: String(data.ListNum || "0"),
      Status: StatusValue === "1" ? "1" : "0",
      ListName: String(data.ListName || "0"),
      BaseNum: String(getValues("BaseNum")?.DocEntry || "0"),
      Factor: String(data.Factor || "0"),
      ValidFor: data.ValidFor || "1",
      PrimCurr: String(data.PrimCurr || "0"),
      RoundSys: String(data.RoundSys || "0"),
    };

    /* =====================================================
       ======================= SAVE ========================
       ===================================================== */
    if (SaveUpdateName === "SAVE") {
      let headerResponse;

      try {
        headerResponse = await apiClient.post(`/PriceList`, Postobj);
      } catch (err) {
        throw err;
      }

      if (!headerResponse?.data?.success) {
        Swal.fire({
          title: "Error!",
          text: headerResponse?.data?.message || "Failed to save Price List",
          icon: "error",
          confirmButtonText: "Ok",
        });
        return;
      }

      const generatedDocEntry = headerResponse.data.values?.DocEntry;
      const oLines = getValues("oLines");

      /* ---------- Save Lines ---------- */
      if (oLines && oLines.length > 0) {
        const lineData = oLines.map((line) => ({
          LineNum: String(line.LineNum || "0"),
          UserId: user.UserId,
          CreatedBy: user.UserName,
          CreatedDate: line.CreatedDate || dayjs().toISOString(),
          ModifiedBy: user.UserName,
          ModifiedDate: line.ModifiedDate || dayjs().toISOString(),
          Status: "1",
          DocEntry: line.PriceList || "0",
          ItemCode: line.ItemCode || "0",
          PriceList: String(generatedDocEntry || "0"),
          Price: String(line.Price || "0"),
          Currency: line.Currency || "0",
          AddPrice: line.AddPrice || "0",
          Currency1: line.Currency1 || "0",
          BasePLNum: line.BasePLNum || "0",
          UomEntry: "0",
          Ovrwritten: line.Ovrwritten || "0",
          Factor: line.Factor || "0",
          oUOMLines: [],
        }));

        let lineResponse;

        try {
          lineResponse = await apiClient.post(
            `/PriceList/ItemsPrices/Bulk`,
            lineData,
          );
        } catch (err) {
          throw err;
        }

        if (!lineResponse?.data?.success) {
          Swal.fire({
            title: "Error!",
            text:
              lineResponse?.data?.message ||
              "Failed to save Price List Lines",
            icon: "warning",
            confirmButtonText: "Ok",
          });
          return;
        }

        Swal.fire({
          title: "Success!",
          text: "Price list lines saved successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      }

      /* ---------- Final Success ---------- */
      ClearFormData();
      fetchOpenListData(0);
      fetchCloseListData(0);
      setOpenListPage(0);
      setCloseListPage(0);
      setOpenListData([]);
      setCloseListData([]);

      Swal.fire({
        title: "Success!",
        text: "Price List saved Successfully",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1000,
      });
    }

    /* =====================================================
       ====================== UPDATE =======================
       ===================================================== */
    else {
      const PutObj = {
        DocEntry: String(data.DocEntry),
        UserId: user.UserId,
        CreatedBy: user.UserName,
        CreatedDate: data.CreatedDate || dayjs().toISOString(),
        ModifiedBy: user.UserName,
        ModifiedDate: data.ModifiedDate || dayjs().toISOString(),
        ListNum: String(data.ListNum || "0"),
        Status: StatusValue === "1" ? "1" : "0",
        ListName: String(data.ListName || "0"),
        BaseNum: String(data.BaseNum?.DocEntry || "0"),
        Factor: String(data.Factor || "0"),
        ValidFor: data.ValidFor || "1",
        PrimCurr: String(data.PrimCurr || "0"),
        RoundSys: String(data.RoundSys || "0"),
      };

      const result = await Swal.fire({
        text: `Do You Want to Update "${data.ListName}" ?`,
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showCancelButton: true,
      });

      if (!result.isConfirmed) {
        Swal.fire({
          text: "Price List Not Updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      let updateResponse;

      try {
        updateResponse = await apiClient.put(
          `/PriceList/${data.DocEntry}`,
          PutObj,
        );
      } catch (err) {
        throw err;
      }

      if (!updateResponse?.data?.success) {
        Swal.fire({
          title: "Error!",
          text: updateResponse?.data?.message || "Update failed",
          icon: "warning",
          confirmButtonText: "Ok",
        });
        return;
      }

      ClearFormData();
      fetchOpenListData(0);
      fetchCloseListData(0);
      setOpenListPage(0);
      setCloseListPage(0);
      setOpenListData([]);
      setCloseListData([]);

      Swal.fire({
        title: "Success!",
        text: "Price List Updated",
        icon: "success",
        confirmButtonText: "Ok",
        timer: 1000,
      });
    }
  } catch (error) {
    console.error("❌ Error submitting the form:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
      icon: "error",
      confirmButtonText: "Ok",
    });
  } finally {
    setIsLoading(false);
  }
};


const handleBulkSave = async () => {
  setIsLoading(true);

  try {
    const rows = getValues("oLines") || [];

    // Filter edited rows only
    const selectedRows = rows.filter((row) => row?._wasEdited === true);

    if (selectedRows.length === 0) {
      Swal.fire({
        title: "Error!",
        text: "No rows selected for saving",
        icon: "error",
        confirmButtonText: "Ok",
      });
      return;
    }

    /* ---------- Transform rows ---------- */
    const formattedRows = selectedRows.map((row) => {
      const matchedBasePriceList = priceListAll?.find(
        (pl) => pl.ListName === row.BasePLNum,
      );

      const basePLDocEntry = matchedBasePriceList?.DocEntry ?? "";

      return {
        LineNum: "",
        UserId: user?.UserId || "0",
        CreatedBy: user?.UserName || "",
        CreatedDate: dayjs().format("YYYY/MM/DD"),
        ModifiedBy: user?.UserName || "",
        ModifiedDate: dayjs().format("YYYY/MM/DD"),
        Status: "1",
        DocEntry: "",
        ItemCode: row?.ItemCode || "",
        PriceList: String(DocEntryRef?.current || ""),
        Price: row?.Price || "0",
        Currency: row?.Currency || "INR",
        AddPrice: "0",
        Currency1: "",
        BasePLNum: String(basePLDocEntry),
        UomEntry: row?.IUoMEntry || "",
        Ovrwritten: row?.manual ? "Y" : "N",
        Factor: row?.Factor || "1",
        oUOMLines: [],
      };
    });

    /* ---------- Chunk helper ---------- */
    const chunkArray = (array, chunkSize) =>
      Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, i) =>
        array.slice(i * chunkSize, i * chunkSize + chunkSize),
      );

    const chunks = chunkArray(formattedRows, 50);

    /* ---------- API Calls ---------- */
    for (let i = 0; i < chunks.length; i++) {
      let response;

      try {
        response = await apiClient.post(
          `/PriceList/ItemsPrices/Bulk`,
          chunks[i],
        );
      } catch (err) {
        throw err;
      }

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            `Failed to save chunk ${i + 1} of ${chunks.length}`,
        );
      }
    }

    /* ---------- Success ---------- */
    Swal.fire({
      title: "Success!",
      text: "Price List saved Successfully",
      icon: "success",
      confirmButtonText: "Ok",
      timer: 1000,
    });

    ClearFormData();
  } catch (error) {
    console.error("❌ Bulk save error:", error);

    Swal.fire({
      title: "Error!",
      text:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save Price List",
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
        sx={{ backgroundColor: { lg: "initial", xs: "#F5F6FA" } }}
      >
        <Typography
          textAlign={"center"}
          alignContent={"center"}
          height={"100%"}
        >
          PRICE LIST
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
                value="1"
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="ActiveListScroll"
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
                      title={item.ListName}
                      subtitle={item.PrimCurr}
                      // description={dayjs(item.TaxDate).format("DD-MM-YYYY ")}
                      searchResult={openListquery}
                      isSelected={selectedData === item.DocEntry}
                      // isSelected={oldOpenData === item.DocEntry}
                      onClick={() => {
                        OldPriceListData(item.DocEntry, item.ListName);
                      }}
                    />
                  ))}
                </InfiniteScroll>
              </TabPanel>

              {/* Inactive Tab */}
              <TabPanel
                value="0"
                style={{
                  overflow: "auto",
                  maxHeight: `calc(100% - ${15}px)`,
                  paddingLeft: 5,
                  paddingRight: 5,
                }}
                id="InactiveListScroll"
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
                    onChange={(e) => handleCloseListSearch(e.target.value)}
                    value={CloseListquery}
                    onClickClear={handleCloseListClear}
                  />
                </Grid>
                <InfiniteScroll
                  style={{ textAlign: "center", justifyContent: "center" }}
                  dataLength={CloseListData.length}
                  hasMore={hasMoreClose}
                  next={fetchMoreCloseListData}
                  loader={
                    <BeatLoader
                      color={theme.palette.mode === "light" ? "black" : "white"}
                    />
                  }
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {CloseListData.map((item, i) => (
                    <CardComponent
                      key={item.DocEntry}
                      title={item.ListName}
                      subtitle={item.PrimCurr}
                      // description={dayjs(item.TaxDate).format("DD-MM-YYYY ")}
                      searchResult={CloseListquery}
                      isSelected={selectedData === item.DocEntry}
                      // isSelected={oldOpenData === item.DocEntry}
                      onClick={() => {
                        console.log("Calling with DocEntry:", item.DocEntry);
                        OldPriceListData(item.DocEntry);
                      }}
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
      {isLoading && <Loader open={isLoading} />}
      <Dialog
        open={openCreateCurrencyDialog}
        onClose={handleCurrencyClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-paper": {
            width: "70vw", // dialog width
            maxWidth: "1200px", // optional limit
            height: "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            position: "relative",
            fontWeight: "bold",
          }}
        >
          {/* 🔹 Add Icon at Top-Left */}
          Currency
          {/* 🔹 Close Icon at Top-Right */}
          <IconButton
            onClick={() => {
              resetCurrency(initialCurrencyData);
            }}
            sx={{
              position: "absolute",
              left: 8,
              top: 8,
            }}
            size="small"
          >
            <AddIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <form
            id="user-form-id"
            onSubmit={HandleCurrencyForm(handleAddCurrency)}
            autoComplete="off"
          >
            <Grid
              container
              spacing={2} // 👈 adds space between fields
              textTransform="uppercase"
              sx={{ mt: 2 }}
            >
              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="CurrCode"
                  control={ControlCurrency}
                  rules={{
                    required: "Currency Code is required",
                    validate: (value) =>
                      value.trim() !== "" || "Currency Code cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Code"
                      type="text"
                      disabled={!!DocEntry}
                      {...field}
                      error={!!error} // Pass error state to the FormComponent if needed
                      helperText={error ? error.message : null} // Show the validation message
                      inputProps={{ maxLength: 3 }}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="CurrName"
                  control={ControlCurrency}
                  rules={{
                    required: "Currency Name is required",
                    validate: (value) =>
                      value.trim() !== "" || "Currency Name cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Currency"
                      type="text"
                      inputProps={{ maxLength: 20 }}
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="DocCurrCod"
                  control={ControlCurrency}
                  rules={{
                    required: "International Code is required",
                    validate: (value) =>
                      value.trim() !== "" ||
                      "International Code cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="INTERNATIONAL CODE"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 3 }}
                      error={!!error} // Pass error state to the FormComponent if needed
                      helperText={error ? error.message : null} // Show the validation message
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="ChkName"
                  control={ControlCurrency}
                  rules={{
                    required: "International Description is required",
                    validate: (value) =>
                      value.trim() !== "" || "Group Name cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="International Description"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 20 }}
                      error={!!error} // Pass error state to the FormComponent if needed
                      helperText={error ? error.message : null} // Show the validation message
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="Chk100Name"
                  control={ControlCurrency}
                  // rules={{
                  //   required: "Hundredth Name is required", // Field is required
                  // }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="Hundredth Name"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 20 }}
                      error={!!error} // Pass error state to the FormComponent if needed
                      helperText={error ? error.message : null} // Show the validation message
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="FrgnName"
                  control={ControlCurrency}
                  // rules={{
                  //   required: "English is required", // Field is required
                  // }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="English"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 20 }}
                      error={!!error} // Pass error state to the FormComponent if needed
                      helperText={error ? error.message : null} // Show the validation message
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="F100Name"
                  control={ControlCurrency}
                  // rules={{
                  //   required: "English Hundredth Name is required", // Field is required
                  // }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="English Hundredth Name"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 20 }}
                      error={!!error} // Pass error state to the FormComponent if needed
                      helperText={error ? error.message : null} // Show the validation message
                    />
                  )}
                />
              </Grid>

              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="ISOCurrCod"
                  control={ControlCurrency}
                  defaultValue=""
                  render={({ field }) => (
                    <CurrencySelector
                      label="ISO CURRENCY CODE"
                      // disabled={isCurrencyDisabled}
                      readOnly
                      value={field.value}
                      onChange={(currency) => field.onChange(currency)}
                    />
                  )}
                />
              </Grid>

              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="RoundSys"
                  control={ControlCurrency}
                  // rules={{
                  //   required: "Technician NAME is required", // Field is required
                  // }}
                  defaultValue="0"
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      label="Rounding"
                      {...field}
                      data={[
                        { key: "0", value: "No Rounding" },
                        { key: "1", value: "Round to One" },
                        { key: "2", value: "Round to Ten" },
                        { key: "3", value: "Round to Ten Hundredth" },
                        { key: "4", value: "Round to Five Hundredth" },
                      ]}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6} xs={12} md={4} lg={4} textAlign={"center"}>
                <Controller
                  name="Decimals"
                  control={ControlCurrency}
                  // rules={{
                  //   required: "Technician NAME is required", // Field is required
                  // }}
                  defaultValue="0" // Provide a default value here
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      label="Decimals"
                      {...field}
                      data={[
                        { key: "-1", value: "Default" },
                        { key: "0", value: "Without Decimals" },
                        { key: "1", value: "1 Digit" },
                        { key: "2", value: "2 Digit" },
                        { key: "3", value: "3 Digit" },
                        { key: "4", value: "4 Digit" },
                        { key: "5", value: "5 Digit" },
                      ]}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item md={4} xs={12} textAlign={"center"}>
                <Controller
                  name="RoundPym"
                  control={ControlCurrency}
                  defaultValue="N"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value === "Y"}
                          onChange={(e) => {
                            const RoundPymValue = e.target.checked ? "Y" : "N";
                            field.onChange(RoundPymValue);
                            setValue("Rounding in Pmnt", RoundPymValue);
                          }}
                        />
                      }
                      label="Rounding in Pmnt" // Set the label next to the checkbox
                    />
                  )}
                />
              </Grid>
            </Grid>
            {/* <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item md={6} xs={12} textAlign="center">
                    <Controller
                      name="UserName"
                      control={ControlCurrency}
                      rules={{
                        required: "User Name is required",
                        validate: (value) =>
                          value.trim() !== "" || "User Name cannot be empty",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="USERNAME"
                          // disabled={!!DocEntry}
                          type="text"
                          autoComplete="off"
                          {...field}
                          inputProps={{ maxLength: 100 }}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
    
                 
                </Grid> */}
          </form>
        </DialogContent>

        {/* LEFT ALIGNED SAVE BUTTON */}
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* LEFT SIDE - SAVE BUTTON */}
          <Button
            variant="contained"
            type="submit"
            form="user-form-id"
            color="success"
            sx={{
              width: "170px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            SAVE
          </Button>

          {/* RIGHT SIDE - CANCEL BUTTON */}
          <Button
            variant="contained"
            color="error"
            sx={{
              width: "170px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
            onClick={() => setopenCreateCurrencyDialog(false)}
          >
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
      <DataGridModal
        open={open}
        closeModel={closeModel}
        onSubmit={onSubmit}
        isLoading={itemList.length === 0 ? true : isLoading}
        title="Item List"
        getRowId={(row) => row.DocEntry}
        columns={ItemColumn}
        rows={itemList}
        currentPage={currentPage}
        paginationMode="server"
        limit={LIMIT}
        onPaginationModelChange={handlePaginationModelChange}
        onRowSelectionModelChange={handleCellClick}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        oLines={getValues("oLines")}
      />
      <SearchModel
        open={searchmodelOpenPriceList1}
        onClose={SearchModelClose1}
        onCancel={SearchModelClose1}
        title="Price List New"
        onChange={(e) => handleGetListSearchPriceList1(e.target.value)}
        value={getListqueryPriceList1}
        onClickClear={handleGetListClearPriceList1}
        cardData={
          <>
            <InfiniteScroll
              style={{ textAlign: "center" }}
              dataLength={getListDataPriceList.length}
              next={fetchMoreGetListDataPriceList1}
              hasMore={hasMoreGetListPriceList}
              loader={
                <BeatLoader
                  color={theme.palette.mode === "light" ? "black" : "white"}
                />
              }
              scrollableTarget="getListForCreateScroll"
              endMessage={
                <Typography textAlign={"center"}>No More Records</Typography>
              }
            >
              {getListDataPriceList.map((item, index) => (
                <CardComponentNew
                  key={index}
                  title={item.ListName}
                  subtitle={item.DocEntry}
                  description={item.CreatedBy}
                  searchResult={getListqueryPriceList1}
                  onClick={() => {
                    onSelectRequestPriceList1(item.DocEntry, item.ListName);
                  }}
                />
              ))}
            </InfiniteScroll>
          </>
        }
      />

      {/* =================================================== */}

      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
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
          // component="form"
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
              PRICE LIST
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
              padding={2}
              md={12}
              sm={12}
              height="100%"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
              position={"relative"}
              width={"100%"}
            >
              {/* First Section: All Fields + SAVE/UPDATE and DELETE Buttons */}
              <Paper
                sx={{
                  width: "100%",
                  mb: 2,
                  p: 2,
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                  borderRadius: "12px",
                }}
              >
                <Box
                  sx={{
                    "& .MuiTextField-root": { m: 1 },
                  }}
                  noValidate
                  autoComplete="off"
                  width={"100%"}
                >
                  <Grid container>
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="ListName"
                        control={control}
                        rules={{
                          required: "Price list name is required",
                          validate: (value) =>
                            value.trim() !== "" ||
                            "Price list name cannot be empty",
                        }}
                        // disabled={!!DocEntry}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="PRICE LIST NAME"
                            type="text"
                            // readOnly={SaveUpdateName === "UPDATE"}
                            inputProps={{ maxLength: 32 }}
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            readOnly={SaveUpdateName === "UPDATE"}
                            error={!!error}
                            helperText={error ? error.message : null}
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <SearchModel
                        open={searchmodelOpenPriceList}
                        onClose={SearchModelClose}
                        onCancel={SearchModelClose}
                        title="Price List"
                        onChange={(e) =>
                          handleGetListSearchPriceList(e.target.value)
                        }
                        value={getListqueryPriceList}
                        onClickClear={handleGetListClearPriceList}
                        cardData={
                          <>
                            <InfiniteScroll
                              style={{ textAlign: "center" }}
                              dataLength={getListDataPriceList.length}
                              next={fetchMoreGetListDataPriceList}
                              hasMore={hasMoreGetListPriceList}
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
                              {getListDataPriceList.map((item, index) => (
                                <CardComponentNew
                                  key={index}
                                  title={item.ListName}
                                  subtitle={item.PrimCurr}
                                  description={item.Factor}
                                  searchResult={getListqueryPriceList}
                                  onClick={() => {
                                    onSelectRequestPriceList(item.DocEntry);
                                  }}
                                />
                              ))}
                            </InfiniteScroll>
                          </>
                        }
                      />
                      <Controller
                        name="BaseNum"
                        control={control}
                        defaultValue={null}
                        render={({ field, fieldState: { error } }) => (
                          <Tooltip
                            title="DEFAULT BASE PRICE LIST"
                            placement="top"
                            arrow
                          >
                            <div>
                              <InputTextField
                                label="DEFAULT BASE PRICE LIST"
                                readOnly
                                {...field}
                                value={field.value?.ListName || ""}
                                error={!!error}
                                helperText={error ? error.message : null}
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace") {
                                    e.preventDefault();

                                    setValue("BaseNum", "", {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                  } else {
                                    e.preventDefault(); // block all other keys
                                  }
                                }}
                                InputLabelProps={{
                                  sx: {
                                    maxWidth: "calc(100% - 45px)",
                                    "&.MuiInputLabel-root:not(.MuiInputLabel-shrink)":
                                      {
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      },
                                    "&.MuiInputLabel-shrink": {
                                      whiteSpace: "nowrap",
                                      overflow: "visible",
                                      textOverflow: "clip",
                                    },
                                  },
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={OpenDailog}
                                        style={{
                                          backgroundColor: "green",
                                          borderRadius: "10%",
                                          color: "white",
                                          height: 30,
                                          padding: 4,
                                        }}
                                      >
                                        <ViewListIcon />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </div>
                          </Tooltip>
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Factor"
                        control={control}
                        defaultValue={1} // Default value for Factor
                        render={({ field, fieldState: { error } }) => {
                          // Use watch to track changes to the BaseNum (Default Base Price List)
                          // Check if BaseNum is selected (not empty)
                          const isBaseNumSelected = Boolean(baseNum?.ListName);

                          return (
                            <InputTextField
                              label="DEFAULT FACTOR"
                              type="number"
                              inputProps={{ maxLength: 19 }}
                              {...field}
                              value={field.value || 1} // Ensure Factor starts at 1 if no value is selected
                              error={!!error} // Pass error state to the FormComponent if needed
                              helperText={error ? error.message : null} // Show validation message
                              disabled={!isBaseNumSelected} // Disable Factor if no BaseNum is selected
                            />
                          );
                        }}
                      />
                    </Grid>
                    {/* <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="PrimCurr"
                        control={control}
                        rules={{
                          required: "Primary Currency is required",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            {...field}
                            value={field.value || ""} // ✔ React Hook Form controls the value
                            onChange={(e) => {
                              field.onChange(e.target.value); // ✔ update RHF
                              setSelectedCurrency(e.target.value); // ✔ update your state
                            }}
                            error={!!error}
                            helperText={error ? error.message : null}
                            inputProps={{ maxLength: 3 }}
                            label="PRIMARY CURRENCY"
                            data={currencydata.map((item) => ({
                              key: item.CurrCode,
                              value: item.DocCurrCod,
                            }))}
                          />
                        )}
                      />
                    </Grid> */}
                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box display="flex" alignItems="center" gap={3}>
                        <Controller
                          name="PrimCurr"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <InputSearchableSelect
                              {...field}
                              label="PRIMARY CURRENCY"
                              error={!!error}
                              helperText={error?.message}
                              data={currencydata.map((item) => ({
                                key: item.CurrCode,
                                value: item.CurrCode,
                              }))}
                            />
                          )}
                        />

                        {/* OUTSIDE ICON */}
                        <IconButton
                          onClick={() => setopenCreateCurrencyDialog(true)}
                          size="small"
                          sx={{
                            backgroundColor: "success.main",
                            color: "white",
                            borderRadius: "5px",
                            width: 40,
                            height: 40,
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="RoundSys"
                        defaultValue="1" // Set default value to "1" for "NO ROUNDING"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="ROUNDING METHOD"
                            data={[
                              { key: "1", value: "NO ROUNDING" },
                              {
                                key: "2",
                                value: "Round to Full Decimal Amount",
                              },
                              { key: "3", value: "Round to Full Amount" },
                              { key: "4", value: "Round to Full Tens Amount" },
                              { key: "5", value: "Fixed Ending" },
                              { key: "6", value: "Fixed Interval" },
                            ]}
                            {...field}
                            error={!!error}
                            inputProps={{ maxLength: 6 }}
                            helperText={error ? error.message : null} // Show the validation message
                          />
                        )}
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Status"
                        control={control}
                        defaultValue="0"
                        render={({ field }) => (
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
                  <Divider sx={{ width: "100%", mb: 2, mt: 2 }} />

                  {/* SAVE/UPDATE and DELETE Buttons in First Section */}
                  <Grid
                    container
                    spacing={2}
                    // style={{
                    //   display: "flex",
                    //   justifyContent: "center", // ⬅️ Center both buttons
                    //   alignItems: "end",
                    //   position: "sticky",
                    //   bottom: "0px",
                    //   gap: "16px", // ⬅️ Space between buttons
                    // }}
                  >
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ width: "170px" }}
                        name={SaveUpdateName}
                        type="submit"
                        disabled={
                          (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                          (SaveUpdateName !== "SAVE" && !perms.IsEdit)
                        }
                      >
                        {SaveUpdateName}
                      </Button>
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={6}
                      xs={12}
                      textAlign="center"
                      sx={{
                        display: {
                          xs: "none",
                          sm: "none",
                          md: "block",
                          lg: "block",
                        },
                      }}
                    ></Grid>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Button
                        variant="outlined"
                        disabled={SaveUpdateName === "SAVE" || !perms.IsDelete}
                        color="error"
                        sx={{ width: "170px" }}
                        onClick={handleOnDelete}
                      >
                        DELETE
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

              {/* Second Section: Search Item Button, DataGrid, and SAVE Button */}
              {SaveUpdateName === "UPDATE" && (
                <Paper
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                    borderRadius: "12px",
                  }}
                >
                  {" "}
                  <Grid container width={"100%"}>
                    {/* Search Item Button */}
                    <Grid item xs={12} textAlign={"left"} mb={2}>
                      <Button
                        variant="contained"
                        color="info"
                        onClick={handleClickOpen}
                        disabled={SaveUpdateName === "SAVE"}
                      >
                        Search Item
                      </Button>
                    </Grid>

                    {/* DataGrid Row */}
                    <Grid
                      container
                      item
                      sx={{
                        overflow: "auto",
                        width: "100%",
                        height: "100%",
                        minHeight: "300px",
                        maxHeight: "500px",
                        mt: "5px",
                      }}
                    >
                      <DataGrid
                        rowHeight={55}
                        className="datagrid-style"
                        rows={(getValues("oLines") || []).map(
                          (data, index) => ({
                            ...data,
                            id: index,
                          }),
                        )}
                        getRowId={(row) => row.id}
                        columns={columns}
                        // hideFooter
                        sx={{
                          ...gridSx,
                          height: "400px", // Fixed height to prevent continuous increase
                        }}
                        apiRef={apiRef}
                        editMode="cell"
                        experimentalFeatures={{ newEditingApi: true }}
                        processRowUpdate={processRowUpdate}
                        onCellKeyDown={handleCellKeyDown}
                        onProcessRowUpdateError={(err) => console.error(err)}
                        columnHeaderHeight={35}
                      />
                    </Grid>

                    {/* SAVE Button Row */}
                    <Grid item xs={12} mt={2} mb={2}>
                      <Button
                        variant="contained"
                        disabled={SaveUpdateName === "SAVE"}
                        color="success"
                        sx={{ m: 0.5 }}
                        onClick={handleBulkSave}
                      >
                        SAVE
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
