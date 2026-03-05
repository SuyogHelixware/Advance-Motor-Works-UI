import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import ViewListIcon from "@mui/icons-material/ViewList";
import { TabContext, TabPanel } from "@mui/lab";
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
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponentTwo from "../Components/CardComponentTwo";
import DataGriCellModelClick from "../Components/DataGridCellModelClick";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";
const Acclist = [
  {
    id: 1,
    field: "AcctCode",
    headerName: "Account Number",
    width: 150,
    editable: true,
  },
  {
    id: 1,
    field: "AcctName",
    headerName: "Account Name",
    width: 150,
    editable: true,
  },
  {
    id: 1,
    field: "CurrTotal",
    headerName: "Account Balance",
    width: 150,
    editable: true,
  },
];

export default function TaxCode() {
  const [card, setCard] = useState([]);

  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [taxCategories, setTaxCategories] = useState([]);
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
  const [saveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const [taxAmt, setTaxAmtKey] = useState([]);
  const [taxType, SetTaxtType] = useState([]);
  const [rows, setRows] = useState([]);
  const [totalRate, setTotalRate] = useState("");
  // ======================Purchase modal states======================
  const LIMIT = 20;
  const [openAccountPurchase, setOpenAccountPurchase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [AccountCache, setAccountPurchaseCache] = useState({});
  const [AccountPurchaseList, setAccountPurchaseList] = useState([]);
  const [AccountcurrentPage, setAccountCurrentPage] = useState(0);
  const [AccountPursearchText, setAccountPurSearchText] = useState("");
  const [AccountPurrowCount, setAccountPurRowCount] = useState(0);
  const [activeTab, setActiveTab] = useState(1);
  const timeoutRef = useRef(null); // Use a ref to store the timeout ID
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const { user } = useAuth();
  const perms = usePermissions(28);
  const initial = {
    UserId: user.UserId ? "online" : "online",
    CreatedBy: user.UserName ? "online" : "online",
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
    ModifiedBy: user.UserName === "online" ? "online" : "online",
    Status: "1",
    TaxCode: "",
    Description: "",
    Freight: "",
    TaxCategory: "",
    Rate: "",
    oLines: [],
  };
  const { control, handleSubmit, setValue, reset, getValues } = useForm({
    defaultValues: initial,
  });
  const AllDataForm = getValues();
  const updateTotalRate = (rows) => {
    const total = rows.reduce((acc, row) => {
      return acc + (parseFloat(row.Rate) || 0);
    }, 0);
    setTotalRate(total);
  };

  // =======================Purchase Tax Account ==============================

  //#region  Route Stage Api Calling Searching And Pagination
  const AccountPurchasesFunc = useCallback(
    async (page = 0, search = "") => {
      const cacheKey = `${search}_${page}`;

      if (AccountCache[cacheKey]) {
        setAccountPurchaseList(AccountCache[cacheKey]);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("Page", page);
        params.append("Limit", 20);
        params.append("Status", 1);

        if (search) params.append("SearchText", search);

        params.append("LocManTran", "N");
        // params.append("GroupMask", "ALL");
        params.append("Postable", "Y");

        const url = `/ChartOfAccounts?${params.toString()}`;
        const response = await apiClient.get(url);

        if (response.data.success === true) {
          const services = response.data?.values || [];

          setAccountPurchaseCache((prev) => ({
            ...prev,
            [cacheKey]: services,
          }));

          setAccountPurchaseList(services);

          const estimatedCount =
            page === 0 ? 21 : page * 20 + services.length + 1;
          setAccountPurRowCount(estimatedCount);
        } else if (response.data.success === false) {
          Swal.fire({
            title: "Error!",
            text: response.data.message || "Something went wrong ffffff",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: error.message || "An error occurred",
          icon: "error",
          confirmButtonText: "Ok",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [AccountCache],
  );

  const handleAccountPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== AccountcurrentPage) {
        setAccountCurrentPage(model.page);
      }
    },
    [AccountcurrentPage],
  );

  const handleAccountPurSearchChange = useCallback((searchText) => {
    setAccountPurSearchText(searchText);
    setAccountCurrentPage(0);
    setAccountPurchaseCache({}); // Clear cache on new search
  }, []);
  useEffect(() => {
    AccountPurchasesFunc(AccountcurrentPage, AccountPursearchText);
  }, [AccountcurrentPage, AccountPursearchText, AccountPurchasesFunc]);

  const handlePurchasesClick = (id) => {
    console.log(id);

    const currentRowIndex = getValues("selectedRowIndex");
    const columnToUpdate = getValues("Sales"); // "SalesTax" OR "PurchTax"

    console.log("Selected Column:", columnToUpdate);

    const updatedLines = rows.map((line) => {
      if (line.id === currentRowIndex) {
        return {
          ...line,
          [columnToUpdate]: id.row.AcctCode, // dynamically updates correct column
        };
      }
      return line;
    });

    setRows(updatedLines);
    setOpenAccountPurchase(false);
  };
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/TaxCode/Search/${searchTerm}/1/${pageNum}/20`
        : `/TaxCode/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

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

  // ============================================Closed List Start ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/TaxCode/Search/${searchTerm}/0/${pageNum}/20`
        : `/TaxCode/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreClosed(false);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle search input
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

  // Clear search
  const handleClosedListClear = () => {
    setClosedListQuery(""); // Clear search input
    setClosedListSearching(false); // Reset search state
    setClosedListPage(0); // Reset page count
    setClosedListData([]); // Clear data
    fetchClosedListData(0); // Fetch first page without search
  };

  // Infinite scroll fetch more data
  const fetchMoreClosedListData = () => {
    fetchClosedListData(
      closedListPage + 1,
      closedListSearching ? closedListquery : "",
    );
    setClosedListPage((prev) => prev + 1);
  };
  useEffect(() => {
    fetchClosedListData(0); // Load first page on mount
  }, []);

  // ===============Sales TAx Account====================================

  // ==========================API for tax category dropdown value===============================

  const setTaxCodeDatalList = async () => {
    try {
      const response = await apiClient.get(`/TaxCategory/Pages/1/0/20`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { values } = response.data;
      const formattedData = values.map((item) => ({
        key: item.DocEntry,
        value: item.Name,
      }));
      setTaxCategories(formattedData);
    } catch (error) {
      console.error("Error fetching tax data:", error);
    }
  };
  useEffect(() => {
    setTaxCodeDatalList();
  }, []);

  // ==========================API for TAX Type dropdown===============================

  const taxAmtKey = async () => {
    try {
      const { data } = await apiClient.get(`/TaxType/all`);
      const { values } = data;
      console.log("===========", values);
      setTaxAmtKey(values);
    } catch (error) {
      console.error("Error", error);
    }
  };

  const TaxTypeAll = async () => {
    const { data } = await apiClient.get(`/TaxType/all`);
    console.log(data);
    var { values } = data;
    if (values.length > 0) {
      values = values.filter((data) => data.Status === "1");
    }
    SetTaxtType(values);
  };
  useEffect(() => {
    taxAmtKey();
    TaxTypeAll();
    // taxTypedata();
  }, []);

  // ==========================API for Getting Main Cards List===============================

  const getTaxCodeDataList = async () => {
    try {
      const response = await apiClient.get(`/TaxCode/Pages/1/0/20`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.data.values;
      setCard(data);

      if (data.length < 20) {
        setHasMoreOpen(false);
      }
    } catch (error) {
      console.error("Error fetching SAC data list:", error);
    }
  };

  useEffect(
    () => {
      getTaxCodeDataList();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ==========================API for storing the data of specific Card===============================

  // Assuming you have setTaxCategories and taxCategories state initialized somewhere
  const setOldDataOPen = async (DocEntry) => {
    // if (!DocEntry) return;
    try {
      const response = await apiClient.get(`/TaxCode/${DocEntry}`);
      const data = response.data.values;
      console.log(data);
      toggleDrawer();
      reset({
        ...data,
        Status: data.Status === "1" ? true : false,
        Freight: data.Freight === "1" ? true : false,
      });
      setSaveUpdateName("UPDATE");
      setDocEntry(DocEntry);

      // Map over the rows to assign serial numbers
      const mappedRows = (data.oLines || []).map((line, index) => ({
        id: `${line.DocEntry}_${index}`, // Create a unique ID for each row
        serialNo: index + 1, // Assign serial number (starts from 1)
        isApiAdded: true,
        ...line,
      }));
      // Set the rows with serial numbers
      setRows(mappedRows);
      // Recalculate the total rate
      const newTotalRate = mappedRows.reduce(
        (total, row) => total + parseFloat(row.Rate || 0),
        0,
      );
      setTotalRate(newTotalRate);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ==========================API for Main Cards list pagination===============================

  // ==========================API for Main inactuve Cards list pagination===============================

  // =========================UseForm==============================

  // const TaxAmtKey = watch("TaxAmtKey");
  const clearFormData = () => {
    setRows([]);
    setTotalRate("");
    reset(initial);
    setSaveUpdateName("SAVE");
  };
  // ==========================API for PUT and POST===============================

  const handleSubmitForm = async (data) => {
    console.log(data);
    const obj = {
      ...data,
      Status: data.Status ? "1" : "0",
      Freight: data.Freight ? "1" : "0",
      UserId: user.UserId ? "online" : "online",
      CreatedBy: user.UserName ? "online" : "online",
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      ModifiedBy: user.UserName ? "online" : "online",
      TaxCategory: String(data.TaxCategory),
      Rate: String(totalRate || data.Rate || 0),
      oLines: rows.map((row) => ({
        ...row,
        LineNum: row.LineNum || "",
        DocEntry: String(data.DocEntry || ""),
        UserId: sessionStorage.getItem("UserId") || "1",
        CreatedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
        CreatedDate: "",
        ModifiedBy: sessionStorage.getItem("CreatedBy") || "ADMIN",
        ModifiedDate: "",
        TaxType: String(row.TaxType || ""),
        Rate: String(row.Rate || "0"),
        BaseAmtFormuale: String(row.BaseAmtFormuale || ""),
        TaxAmtKey: String(row.TaxAmtKey || ""),
        PurchTax: String(row.PurchTax || ""),
        SalesTax: String(row.SalesTax || ""),
        NonDdctPrc: String(row.NonDdctPrc || "0"),
        NonDdctAct: String(row.NonDdctAct || "0"),
        RvsCrgPrc: String(row.RvsCrgPrc || "0"),
        Name: String(row.Name || "0"),
        CredBala: String(row.CredBala || "0"),
        CredFG: String(row.CredFG || "0"),
        TfcId: String(row.TfcId || "0"),
        Lock: String(row.Lock || "1"),
        PLABalance: String(row.PLABalance || "0"),
        SvcTaxCr: String(row.SvcTaxCr || "0"),
      })),
    };

    console.log("=========", obj);
    try {
      if (saveUpdateName === "SAVE") {
        const resp = await apiClient.post(`/TaxCode`, obj);
        if (resp.data.success) {
          await getTaxCodeDataList();

          clearFormData(); // This function clears form data
          setRows([]); // Clears the rows in DataGrid
          reset(); // Reset the form using react-hook-form
          fetchOpenListData(0);
          console.log("Payload to be sent:", obj);

          Swal.fire({
            title: "Success!",
            text: "Tax Code is Added",
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
          text: `Do You Want to Update?`,
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });
        if (result.isConfirmed) {
          const response = await apiClient.put(
            `/TaxCode/${data.DocEntry}`,
            obj,
          );

          if (response.data.success) {
            await getTaxCodeDataList();
            clearFormData(); // This function clears form data
            setRows([]); // Clears the rows in DataGrid
            reset(); // Reset the form using react-hook-form
            fetchOpenListData(0);

            console.log("Payload to be sent:", obj);

            Swal.fire({
              title: "Success!",
              text: `"Tax Code is Updated"`,
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
            text: "Tax Code is not updated",
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

      console.error("Error submitting form:", error);
    }
  };

  const handleOnDelete = async () => {
    const result = await Swal.fire({
      text: `Do You Want Delete "${DocEntry}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (result.isConfirmed) {
      try {
        const resp = await apiClient.delete(`/TaxCode/${DocEntry}`);

        if (resp.data.success) {
          clearFormData();
          getTaxCodeDataList();
          Swal.fire({
            text: "Service Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: resp.data.success,
            text: resp.data.message,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        Swal.fire({
          title: "Error!",
          text: "Something went wrong",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      } finally {
      }
    } else {
      Swal.fire({
        text: "Service Not Deleted",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const addRow = () => {
    setRows((prevRows) => {
      const newRow = {
        id: prevRows.length
          ? Math.max(...prevRows.map((row) => row.id)) + 1
          : 1,
        TaxType: "",
        BaseAmtFormuale: "",
        Rate: "",
        TaxAmtKey: "",
        PurchTax: "",
        SalesTax: "",
        NonDdctPrc: "",
        NonDdctAct: "",
        RvsCrgPrc: "",
        CredBala: "",
        CredFG: "",
        Lock: "N",
        PLABalance: "",
        SvcTaxCr: "",
      };
      return [...prevRows, newRow];
    });
  };

  const handleDeleteRow = (id) => {
    // Step 1: Filter out the row to be deleted
    const updatedRows = rows.filter((row) => row.serialNo !== id);

    // Step 2: Reassign serial numbers based on the remaining rows
    const updatedRowsWithSerialNo = updatedRows.map((row, index) => ({
      ...row,
      serialNo: index + 1, // Reassign serial number
    }));

    // Step 3: Update the rows with new serial numbers
    setRows(updatedRowsWithSerialNo);

    // Step 4: Recalculate the total rate
    const newTotalRate = updatedRowsWithSerialNo.reduce(
      (total, row) => total + parseFloat(row.Rate || 0),
      0,
    );
    setTotalRate(newTotalRate);
  };

  // useEffect(() => {
  //   console.log("Rows state updated:", rows);
  // }, [rows]);
  // ==========================handlechange==============================

  // const TaxAmtKey = watch("TaxType");
  // console.log(TaxAmtKey);

  const handleChange = (e, row) => {
    const { name, value, checked } = e.target;
    const newValue = name === "Lock" ? (checked ? "Y" : "N") : value;

    // General state update for form fields
    setValue(name, newValue);

    // Update logic for specific fields
    const updateCreateFormula = (rows) =>
      rows.map((r) => {
        if (r.id === row.id) {
          const updatedRow = { ...r, [name]: value };
          const currentBaseValues = r.BaseAmtFormuale || "";
          updatedRow.BaseAmtFormuale = currentBaseValues
            ? `${currentBaseValues}${value}`
            : value;
          return updatedRow;
        }
        return r;
      });

    const updateBaseAmtFormulae = (rows) =>
      rows.map((r) => {
        if (r.id === row.id) {
          return { ...r, [name]: value || "" };
        }
        return r;
      });

    // setValue(name, newValue);

    const updateTaxType = (rows) =>
      rows.map((r) => {
        if (r.id === row.id) {
          const updatedRow = { ...r, [name]: newValue };
          const selectedTaxType = taxAmt.find(
            (item) => item.DocEntry === newValue,
          );
          updatedRow.TaxAmtKey = selectedTaxType
            ? selectedTaxType.TaxAmtKey
            : "";
          setValue(`TaxAmtKey-${row.id}`, updatedRow.TaxAmtKey); // Sync with react-hook-form
          return updatedRow;
        }
        return r;
      });

    const updateTaxAmtKey = (rows) =>
      rows.map((r) => {
        if (r.id === row.id) {
          return { ...r, TaxAmtKey: newValue, [name]: newValue };
        }
        return r;
      });

    const updateRowGeneral = (rows) =>
      rows.map((r) => {
        if (r.id === row.id) {
          return { ...r, [name]: newValue };
        }
        return r;
      });

    // Apply appropriate updates based on field name
    setRows((prevRows) => {
      let updatedRows = prevRows;

      if (name === "createFormula") {
        updatedRows = updateCreateFormula(updatedRows);
      } else if (name === "BaseAmtFormuale") {
        updatedRows = updateBaseAmtFormulae(updatedRows);
      } else if (name === "TaxType") {
        updatedRows = updateTaxType(updatedRows);
      } else if (name === "TaxAmtKey") {
        updatedRows = updateTaxAmtKey(updatedRows);
      } else {
        updatedRows = updateRowGeneral(updatedRows);
      }

      if (name === "Rate") {
        updateTotalRate(updatedRows);
      }

      return updatedRows;
    });
  };

  const handleKeyDown = (e, row) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // Prevent the default backspace behavior
      setRows((prevRows) =>
        prevRows.map((r) => {
          if (r.id === row.id) {
            const currentValue = r.BaseAmtFormuale || "";
            const baseValuesArray = currentValue.split("+"); // Split by the separator
            if (baseValuesArray.length > 1) {
              // If there are multiple values, remove the last one
              const newBaseValues = baseValuesArray.slice(0, -1).join("+"); // Join the remaining values
              return { ...r, BaseAmtFormuale: newBaseValues }; // Update the BaseAmtFormuale
            } else {
              // If there's only one value, clear it
              return { ...r, BaseAmtFormuale: "" }; // Clear the BaseAmtFormuale value
            }
          }
          return r; // Return unchanged rows
        }),
      );
    }
  };

  console.log("====", rows);

  // ==========================Main Datagrid Column===============================
  const column = [
    {
      field: "TaxType",
      headerName: "TAX TYPE",
      width: 200,
      editable: false,
      renderCell: (params) => (
        <Controller
          name="TaxType" // Unique name for each row
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputSelectTextField
              {...field}
              error={!!error}
              helperText={error ? error.message : null}
              data={taxType.map((item) => ({
                key: item.DocEntry,
                value: item.Name,
              }))} // Populate dropdown with TaxType options
              value={params.row.TaxType || ""}
              onChange={(e) => handleChange(e, params.row)} // Update TaxType and TaxAmtKey
              fullWidth
            />
          )}
        />
      ),
    },

    {
      field: "Rate",
      headerName: "Rate",
      width: 120,
      editable: false,
      renderCell: (params) => (
        <InputTextField
          name="Rate"
          value={params.value}
          onChange={(e) => handleChange(e, params.row)}
        />
      ),
    },
    {
      field: "createFormula",
      headerName: "Create BaseAmtFormuale",
      width: 200,
      editable: false,
      renderCell: (params) => (
        <Controller
          name="createFormula" // Unique name for each row
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputSelectTextField
              {...field}
              error={!!error}
              helperText={error ? error.message : null}
              label="TAX AMOUNT KEY"
              data={taxAmt.map((item) => ({
                key: item.TaxAmtKey,
                value: item.TaxAmtKey,
              }))}
              onChange={(e) => handleChange(e, params.row)}
              value={params.row.createFormula || ""} // Bind to row-specific value
            />
          )}
        />
      ),
    },
    {
      field: "BaseAmtFormuale",
      headerName: "BASE AMOUNT FORMULAE",
      width: 300,
      editable: false,
      renderCell: (params) => (
        <Controller
          name="BaseAmtFormuale" // Unique name for each row
          control={control}
          render={({ field }) => (
            <TextField
              size="small"
              sx={{
                m: 1,
                width: "100%",
                maxWidth: 300,
              }}
              multiline
              // name="BaseAmtFormuale" // Unique name for each row
              {...field}
              rows={1}
              value={params.row.BaseAmtFormuale || ""} // Display selected values
              onChange={(e) => handleChange(e, params.row)} // Update form when user types
              onKeyDown={(e) => handleKeyDown(e, params.row)}
              fullWidth
            />
          )}
        />
      ),
    },
    {
      field: "TaxAmtKey",
      headerName: "TAX AMOUNT KEY",
      width: 150,
      editable: false, // Non-editable field
      renderCell: (params) => (
        <InputTextField
          value={params.row.TaxAmtKey || ""} // Reflect TaxAmtKey value
          readOnly={true} // Ensure the field is read-only
          fullWidth
        />
      ),
    },

    {
      field: "PurchTax",
      headerName: "Purchase Tax Account",
      width: 200,
      editable: false,
      renderCell: (params) => (
        <InputTextField
          name="PurchTax"
          value={params.value}
          disabled
          onChange={(e) => handleChange(e, params.row)}
          InputProps={{
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
                    setValue("selectedRowIndex", params.row.id);
                    setValue("Sales", "PurchTax"); // ✅ set PurchTax key
                    setOpenAccountPurchase(true);
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      ),
    },
    {
      field: "SalesTax",
      headerName: "Sales Tax Account",
      width: 200,
      editable: false,
      renderCell: (params) => (
        <InputTextField
          name="SalesTax"
          value={params.value}
          disabled
          onChange={(e) => handleChange(e, params.row)}
          InputProps={{
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
                    setValue("selectedRowIndex", params.row.id);
                    setValue("Sales", "SalesTax"); // ✅ set SalesTax key
                    setOpenAccountPurchase(true);
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      ),
    },

    {
      field: "ACTION",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={() => handleDeleteRow(params.row.serialNo)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

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
          Tax Code List
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
            <TabContext value={activeTab.toString()}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  backgroundColor:
                    theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                }}
                centered
              >
                <Tab label="Active" value={1} />
                <Tab label="Inactive" value={0} />
              </Tabs>

              {/* Tab Content Section */}
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
                    <CardComponentTwo
                      key={i}
                      title={item.TaxCode}
                      subtitle={item.Rate}
                      searchResult={openListquery}
                      onClick={() => setOldDataOPen(item.DocEntry)}
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
                    <CardComponentTwo
                      key={i}
                      title={item.TaxCode}
                      subtitle={item.Rate}
                      searchResult={closedListquery}
                      onClick={() => setOldDataOPen(item.DocEntry)}
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
      <DataGriCellModelClick
        open={openAccountPurchase}
        closeModel={() => setOpenAccountPurchase(false)}
        isLoading={isLoading}
        title="Purchases Account"
        getRowId={(row) => row.DocEntry}
        columns={Acclist}
        rows={AccountPurchaseList}
        currentPage={AccountcurrentPage}
        limit={LIMIT}
        onPaginationModelChange={handleAccountPaginationModelChange}
        onCellClick={handlePurchasesClick}
        onSearchChange={handleAccountPurSearchChange}
        selectedRowIndex={getValues("selectedRowIndex")}
        rowCount={AccountPurrowCount}
        oLines={getValues("oLines")}
      />

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmit(handleSubmitForm)}
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
          // onSubmit={handleSubmit(onSubmit)}
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
              Tax Code Setup
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
                }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="TaxCode"
                      control={control}
                      // rules={{
                      //   required: "Tax Code is required",
                      //   pattern: {
                      //     value: /^[A-Za-z0-9]+$/, // Regex for alphanumeric characters only
                      //     message: "Tax Code must be alphanumeric",
                      //   },
                      // }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TAX CODE"
                          {...field}
                          disabled={AllDataForm.DocEntry}
                          // readOnly={}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Description"
                      control={control}
                      rules={{
                        required: "Description is required",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="DESCRIPTION"
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                    <Controller
                      name="Rate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="TAX RATE"
                          {...field}
                          value={totalRate}
                          disabled={!!DocEntry}
                          error={!!error}
                          helperText={error ? error.message : null}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    lg={4}
                    md={6}
                    xs={12}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="Freight"
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
                              Freight
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
                  </Grid>
                  <Grid
                    item
                    lg={4}
                    md={6}
                    xs={12}
                    textAlign={"center"}
                    width={220}
                  >
                    <Controller
                      name="Status"
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
                              Active
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
                  </Grid>
                  <Box
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "100%",
                        md: "100%",
                        lg: "100%",
                      },
                      pl: 3,
                      mt: 2,
                      // maxHeight: "100vh",
                      // overflowY: "auto",
                      // padding: 2,
                      // bgcolor: "background.paper",
                      // borderRadius: 2,
                      // boxShadow: 3,
                      border: "1px solid",
                      borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "white" : "black",
                    }}
                  >
                    <Grid
                      item
                      sx={{
                        overflow: "auto",
                        width: "100%",
                        //  height: 250,
                        mr: "5px",
                        py: "10px",
                      }}
                    >
                      <IconButton
                        size="small"
                        style={{
                          backgroundColor: "green",
                          borderRadius: "20%",
                          color: "white",
                        }}
                        onClick={addRow} // Call the addRow function on click
                      >
                        <AddOutlinedIcon />
                      </IconButton>
                      <Grid
                        container
                        item
                        sx={{
                          overflow: "auto",
                          width: "100%",
                          height: 500,
                          mt: "5px",
                          py: 3,
                        }}
                      >
                        <DataGrid
                          className="datagrid-style"
                          getRowId={(row) => row.id}
                          rows={rows} // Dynamically updated rows
                          columns={column}
                          hideFooter
                          sx={{
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "#F5F6FA"
                                : "#080D2B",
                            "& .MuiDataGrid-cell": {
                              border: "none",
                            },
                            "& .MuiDataGrid-cell:focus": {
                              outline: "none",
                            },
                          }}
                          columnHeaderHeight={35}
                          disableColumnResize
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Box>
              {/* <Box
                sx={{
                  height: 300,
                  width: "100%",
                  mt: 10,
                  border: 1,
                  p: 2,
                  overflow: "hidden",
                }}
              >
               
              </Box> */}
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
                type="submit"
                name={saveUpdateName}
                disabled={
                  (saveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (saveUpdateName !== "SAVE" && !perms.IsEdit)
                }
                color="success"
                sx={{ color: "white" }}
              >
                {saveUpdateName}
              </Button>

              <Button
                variant="contained"
                color="error"
                disabled={saveUpdateName === "SAVE" || !perms.IsDelete}
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
