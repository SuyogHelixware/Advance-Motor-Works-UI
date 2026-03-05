import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ViewListIcon from "@mui/icons-material/ViewList";

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import { Loader } from "../Components/Loader";
// import { useForm } from "react-hook-form";
import { TabContext, TabPanel } from "@mui/lab";
import { Tab, Tabs } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { Controller, useForm, useFormState, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import CurrencySelector from "../Components/currencyCode";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import {
  InputDatePickerField,
  InputSearchableSelect,
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextAreaFields,
  InputTextField,
  InputTextSearchButton,
  ModelInputSelectTextField,
  SelectedDatePickerField,
} from "../Components/formComponents";
import PhoneNumberInput from "../Components/PhoneNumber1";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import { Base64FileinNewTab } from "../FileUpload/EditFilePreview";
import { openFileinNewTab } from "../FileUpload/filePreview";
import { useFileUpload } from "../FileUpload/useFileUpload";

export default function BusinessPartner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const { user, companyData } = useAuth();
  const perms = usePermissions(63);
  const [tab, settab] = useState("1");
  const [value, setValue] = React.useState("0");
  const [accountingTab, setAccountingTab] = useState("a1");

  const [open, setOpen] = useState(false);
  const [openadd, setAddOpen] = useState(false);
  const [openadd1, setAddOpen1] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [bankCode, setBankCode] = useState([]);
  const [listofstate, setListofState] = useState([]);
  const [listofcountry, setListofCountry] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  //=====================================Active List State====================================================================
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  //=====================================InActive List State====================================================================
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  //* Data Binding
  const [customergroup, setCustomerGroup] = useState([]);
  const [currencydata, setCurrencydata] = useState([]);
  const [shippindata, setShippingData] = useState([]);
  const [seriesdata, setSeriesdata] = useState([]);
  // const [ salesemp, setSalesEmp] = useState([]);
  const [contactper, setContactper] = useState([]);
  const [addressType, setAddressType] = useState([]);

  const [addBank, setAddBank] = useState([]);
  const [saveUpdateButtonCP, setSaveUpdateButtonCP] = useState("SAVE");
  const [saveUpdateButtonAddressType, setSaveUpdateButtonAddressType] =
    useState("SAVE");
  const [saveUpdateButtonAB, setSaveUpdateButtonAB] = useState("SAVE");
  const [saveUpdateNameBP, setSaveUpdateNameBP] = useState("SAVE");
  const [DocEntry, setDocEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedContact, setSelectedContact] = useState(0);
  const [DfltBilled, setDfltBilled] = useState("0");
  const [DfltShiped, setDfltShiped] = useState("0");
  const [defaultRowId, setDefaultRowId] = useState(null);
  const [FromDate, setFromDate] = useState(null);
  const [ToDate, setToDate] = useState(null);
  let [ok, setok] = useState("OK");
  const [chartOfAccounts, setChartOfAccounts] = useState([]);

  const [openDatagridAcctCode, setDatagridAcctCodeOpen] = useState(false);
  const [DatagridAcctCodeRows, setDatagridAcctCodeRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  //=============================Acct General Tab States===================================
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const [getListData, setGetListData] = useState([]);
  const [GLAcctDeterminationData, setGLAcctDeterminationData] = useState([]);
  const [accountsCache, setAccountsCache] = useState({}); // { fieldName: [accounts...] }
  const [openCreateGroupDialog, setopenCreateGroupDialog] = useState(false);
  const handleGroupClose = () => setopenCreateGroupDialog(false);
  const [openCreateCurrencyDialog, setopenCreateCurrencyDialog] =
    useState(false);
  const handleCurrencyClose = () => setopenCreateCurrencyDialog(false);
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
      setLoading(true);

      const response = await apiClient.post(`/CurrenciesV2`, obj);
      const { success, message } = response.data || {};

      if (success) {
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
      } else {
        Swal.fire({
          title: "Failed",
          text: message || "Currency not added",
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error saving currency:", error);

      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to save Currency data. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const initialGroupData = {
    DocEntry: "",
    UserId: user.UserId,
    CreatedBy: user.UserName,
    CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
    ModifiedBy: user.UserName,
    Status: true,
    GroupCode: "",
    PriceList: "",
    DiscRel: "L",
    EffecPrice: "D",
    GroupName: "",
    GroupType: "",
  };
  const {
    handleSubmit: HandleGroupForm,
    control: ControlGroup,
    reset: resetGroup,
    // watch: watchGroup,
    // getValues: getValues1,
    // setValue: setValueCurrency,
  } = useForm({
    defaultValues: initialGroupData,
  });
  const ClearGroupForm = () => {
    resetGroup(initialGroupData);
  };
  const handleAddGroup = async (data) => {
    console.log(data);

    const obj = {
      ...data,
      Status: "1",
      PriceList: String(data.PriceList),
    };

    try {
      setLoading(true);

      const res = await apiClient.post(`/BusinessPartnerGroup`, obj);
      const { success, message } = res.data || {};

      if (success) {
        ClearGroupForm();
        setOpenListPage(0);
        setOpenListData([]);
        fetchOpenListData(0);
        customerGroup(cardType);
        handleGroupClose();

        Swal.fire({
          title: "Success!",
          text: "Business Partner Group added successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: message || "Failed to add Business Partner Group",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error while adding BP Group:", error);

      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while saving Business Partner Group.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const initialFormDataBP = {
    Status: "1",
    CardCode: "",
    CardName: "",
    CardType: "V",
    CardFName: "",
    Currency:
      currencydata.length > 0
        ? currencydata.find((c) => c.CurrCode === companyData.MainCurncy)
            ?.CurrCode || ""
        : "",
    GroupCode: "",
    LicTradNum: "",
    OwnerCode: "",
    PhoneNumber1: "",
    PhoneNumber2: "",
    Cellular: "",
    Fax: "",
    Email: "",
    // E_Mail: "",
    Series: "",
    SlpCode: "",
    ShipType: "",
    ValidFrom: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss") || null,
    ValidTo: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss") || null,
    ValidComm: "",
    frozenFor: false,
    validFor: true,
    GroupNum: paymentTerms.length > 0 ? paymentTerms[0].DocEntry : "",
    IntrstRate: "",
    ListNum: "",
    Discount: "",
    CreditLine: "",
    DebtLine: "",
    DunTerm: "",
    AutoPost: "1",
    Remarks: "",
    FreeTexts: "",
    oLines: [],
    oCPLines: [],
    oBPBankAccLines: [],
  };
  const {
    control: controlFormBP,
    handleSubmit: handleSubmitBP,
    reset: resetFormBP,
    watch,
    getValues,
    clearErrors: clearFormBPError,
    // setError: setBankError,
    setValue: setFormBPValue,
    trigger: triggerBP,
  } = useForm({
    defaultValues: initialFormDataBP,
  });
  const cardType = watch("CardType");

  //=====================================Accounting General Tab================================
  const initialFormDataAccountGeneral = {
    FatherCard: "",
    FatherType: "",
    DebPayAcct: "",
    DebPayAcctName: "",
    DpmClear: "",
    DpmClearName: "",
    DpmIntAct: "",
    DpmIntActName: "",
    DpmDppAct: "",
    DpmDppActName: "",
    DpmOpnDebAct: "",
    DpmOpnDebActName: "",
    selectedField: "",
    DebPayAcctCurr: "", // New: Currency for DebPayAcct
    DpmIntActCurr: "", // New: Currency for DpmIntAct
    DpmDppActCurr: "",
    TaxId0: "",
    TaxId4: "",
    TaxId5: "",
    TaxId7: "",
    TaxId13: "",
    TaxId2: "",
    TaxId1: "",
    TaxId6: "",
    TaxId3: "",
    TaxId8: "",
    TaxId9: "",
    TaxId10: "",
    TaxId11: "",
    WTLiable: "",
    CrtfcateNO: "",
    ExpireDate: "",
    NINum: "",
    TypWTReprt: "",
    WTTaxCat: "",
    SurOver: "",
    Remark1: "",
    ConCerti: "",
    ThreshOver: "",
    VendTID: "",
    WTaxCodesAllowed: "",
    UseShpdGd: "",
    AccCritria: "",
  };

  const {
    control: controlFormAccountGeneral,
    reset: resetFormAccountGeneral,
    watch: watchAccountGeneral,
    setValue: setValueAcctGeneral,
    getValues: getValuesAcctGeneral,
  } = useForm({
    defaultValues: initialFormDataAccountGeneral,
  });
  const WTLiable = watchAccountGeneral("WTLiable");

  const OpenConsolidatingBP = () => {
    setIsDialogOpen(true); // Open the dialog when input changes
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const handleGetListSearch = (res) => {
    setGetListQuery(res);
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchGetListData(0, res, cardType); // ✅ Fix here
    }, 600);
  };
  const fetchGetListData = async (
    pageNum,
    searchTerm = "",
    cardType,
    selectedCurrency,
  ) => {
    try {
      setLoading(true);

      const url = searchTerm
        ? `/BPV2/V2/ByCardType/Search/${searchTerm}/${cardType}/1/${pageNum}/20`
        : `/BPV2/V2/ByCardType/Pages/${cardType}/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data?.success) {
        const newData = response.data.values || [];

        const filteredData = selectedCurrency
          ? newData.filter((item) => item.Currency === selectedCurrency)
          : newData;

        setHasMoreGetList(filteredData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? filteredData : [...prev, ...filteredData],
        );
      } else {
        Swal.fire({
          icon: "warning",
          text: response.data?.message || "No data found",
        });
      }
    } catch (error) {
      console.error("Error fetching Business Partner list:", error);

      Swal.fire({
        icon: "error",
        text:
          error.response?.data?.message ||
          "Failed to fetch Business Partner data!",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(
      getListPage + 1,
      getListSearching ? getListquery : "",
      cardType,
    );
    setGetListPage((prev) => prev + 1);
  };
  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0); // Reset page to 0
    setGetListData([]); // Clear current data
    fetchGetListData(0, "", cardType); // optional: reset to default
  };
  const onSelectBusinessPartner = async (DocEntry) => {
    if (!DocEntry) return;

    try {
      setLoading(true);

      const response = await apiClient.get(`/BPV2/V2/${DocEntry}`);
      const values = response?.data?.values;

      if (!values) {
        Swal.fire({
          icon: "warning",
          text: "Business Partner data not found",
        });
        return;
      }

      setValueAcctGeneral("FatherCard", values.CardCode);
      handleCloseDialog();
    } catch (error) {
      console.error("Error fetching Business Partner:", error);

      Swal.fire({
        icon: "error",
        text:
          error.response?.data?.message ||
          "Failed to fetch Business Partner details",
      });
    } finally {
      setLoading(false);
    }
  };

  const DatagridAcctCodeList = [
    // {
    //   field: "select",
    //   headerName: "",
    //   width: 50,
    //   sortable: false,
    //   renderCell: (params) => (
    //     <Checkbox
    //       checked={selectedAcctRowId === params.row.DocEntry} // only one row selected
    //       onChange={(e) => handleCheckboxToggle(params.row, e.target.checked)}
    //     />
    //   ),
    // },
    {
      field: "AcctCode",
      headerName: "Account Code",
      width: 180,
      sortable: false,
      editable: false,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "AcctName",
      headerName: "Account Name",
      width: 250,
      editable: true,
    },
    {
      field: "CurrTotal",
      headerName: "Balance",
      width: 250,
      editable: true,
    },
    {
      field: "ActCurr",
      headerName: "Currency",
      width: 250,
      editable: true,
      renderCell: (params) => {
        const value =
          params.row.ActCurr === "AC" ? "All Currency" : params.row.ActCurr;
        return <span style={{ fontWeight: "600" }}>{value}</span>;
      },
    },
  ];
  const handleSearchChange = useCallback((searchText) => {
    setSearchText(searchText);
    setCurrentPage(0); // Reset to first page when searching
  }, []);
  const handlePaginationModelChange = useCallback(
    (model) => {
      if (model.page !== currentPage) {
        setCurrentPage(model.page);
      }
    },
    [currentPage],
  );

  const fieldParams = (cardType) => ({
    DpmDppAct:
      cardType === "C"
        ? { locManTran: "Y", groupMask: [1, 2], postable: "Y" }
        : { locManTran: "Y", groupMask: [1, 2], postable: "Y" },
    DpmOpnDebAct:
      cardType === "C"
        ? { locManTran: "Y", groupMask: [1, 2], postable: "Y" }
        : { locManTran: "Y", groupMask: "2", postable: "Y", finanse: "N" },
    DpmClear:
      cardType === "C"
        ? { locManTran: "Y", groupMask: [1, 2], postable: "Y" }
        : { locManTran: "N", postable: "Y" },
    DpmIntAct:
      cardType === "C"
        ? { locManTran: "Y", groupMask: [1, 2], postable: "Y" }
        : { locManTran: "N", postable: "Y" },
    DebPayAcct:
      cardType === "C"
        ? { locManTran: "Y", groupMask: [1, 2], postable: "Y" }
        : { locManTran: "Y", groupMask: [1, 2], postable: "Y" },
  });

  const getChartOfAccounts = async () => {
    try {
      setLoading(true); // start loader

      const res = await apiClient.get(`/ChartOfAccounts/All`);
      const data = res?.data?.values || [];

      setChartOfAccounts(data);
    } catch (error) {
      console.error("Error fetching Chart of Accounts:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Failed to fetch Chart of Accounts.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // stop loader
    }
  };

  const GLAcctData = async () => {
    try {
      setLoading(true); // Start loader

      const res = await apiClient.get(`/GLAccDetermination/All`);
      const data = res?.data?.values || [];
      const success = res?.data?.success;

      if (success) {
        setGLAcctDeterminationData(data);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text:
            res?.data?.message || "Failed to fetch GL Account Determination.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error fetching GL Account Determination:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred while fetching GL Account Determination.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const fetchAccountsAndSetDefaults = async (useCacheOnly = false) => {
    if (!cardType) return;

    try {
      setLoading(true);

      // Use cached accounts if available
      const cache = useCacheOnly ? accountsCache : {};

      if (!useCacheOnly) {
        const paramsMap = fieldParams(cardType);

        await Promise.all(
          Object.keys(paramsMap).map(async (field) => {
            const params = paramsMap[field];
            const query = new URLSearchParams({
              Page: 0,
              Limit: 1000,
              Status: 1,
              ...(params.locManTran && { LocManTran: params.locManTran }),
              ...(params.groupMask && {
                GroupMask: Array.isArray(params.groupMask)
                  ? params.groupMask.join(",")
                  : params.groupMask,
              }),
              ...(params.postable && { Postable: params.postable }),
              ...(params.finanse && { Finanse: params.finanse }),
            });

            const url = `/ChartOfAccounts?${query}`;
            const res = await apiClient.get(url);
            cache[field] = res.data.values || [];
          }),
        );

        setAccountsCache(cache);
      }

      // Set defaults
      if (GLAcctDeterminationData.length && chartOfAccounts.length) {
        const defaultMap =
          cardType === "C"
            ? {
                DpmDppAct: "CDownPymnt",
                DpmOpnDebAct: "COpenDebts",
                DebPayAcct: "LinkAct_1",
                DpmClear: "DpmSalAct",
                DpmIntAct: "SalDpmInt",
              }
            : {
                DpmDppAct: "VDownPymnt",
                DpmOpnDebAct: "VOpenDebts",
                DebPayAcct: "LinkAct_10",
                DpmClear: "DpmPurAct",
                DpmIntAct: "PurDpmInt",
              };

        Object.entries(defaultMap).forEach(([field, glColumn]) => {
          const acctCode = GLAcctDeterminationData[0]?.[glColumn];
          if (!acctCode || !Array.isArray(cache[field])) return;

          const inField = cache[field].find(
            (acct) => acct.AcctCode === acctCode,
          );
          const chartAcct = chartOfAccounts.find(
            (acct) => acct.AcctCode === acctCode,
          );

          if (inField || chartAcct) {
            setValueAcctGeneral(field, acctCode);
            setValueAcctGeneral(
              `${field}Name`,
              inField?.AcctName || chartAcct?.AcctName || "",
            );
          }
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error!",
        text: "Failed to fetch chart of accounts",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (GLAcctDeterminationData.length > 0 && chartOfAccounts.length > 0) {
      fetchAccountsAndSetDefaults();
    }
  }, [cardType, GLAcctDeterminationData.length, chartOfAccounts.length]);

  const AccountField = ({
    name,
    label,
    title,
    watchName,
    control,
    setValueAcctGeneral,
    setDatagridAcctCodeOpen,
    watchAccountGeneral,
    accountsCache,
    setDatagridAcctCodeRows,
  }) => (
    <Grid item lg={6} md={6} xs={12}>
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        width="100%"
      >
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Tooltip title={label} arrow>
              <InputTextField
                sx={{ width: { xs: "100%", sm: 300 } }}
                label={label}
                title={title}
                {...field}
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setValueAcctGeneral("selectedField", name);
                          setDatagridAcctCodeOpen(true);
                          setDatagridAcctCodeRows(accountsCache?.[name] || []);
                        }}
                        size="small"
                        sx={{
                          backgroundColor: "green",
                          borderRadius: "10%",
                          color: "white",
                          p: "2px",
                        }}
                      >
                        <ViewListIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!error}
                helperText={error ? error.message : null}
              />
            </Tooltip>
          )}
        />

        {/* Account Name */}
        <Typography
          variant="body1"
          sx={{
            color: "gray",
            fontWeight: 500,
            whiteSpace: "normal",
            wordBreak: "break-word",
            flex: 1,
            minWidth: 0,
            ml: { xs: 0, sm: 1 },
            mt: { xs: 0.5, sm: 0 },
            width: "100%",
          }}
        >
          {watchAccountGeneral(watchName) || ""}
        </Typography>
      </Box>
    </Grid>
  );

  //===========================================Accounting Tax Tab================================
  const [openTaxModal, setOpenTaxModal] = useState(false);
  const modalFields = [
    { name: "TaxId0", label: "PAN NO" },
    { name: "TaxId4", label: "PAN CIRCLE NO" },
    { name: "TaxId5", label: "PAN WARD NO" },
    { name: "TaxId7", label: "PAN ASSESSING OFFICER" },
    { name: "TaxId13", label: "DEDUCTEE REF NO" },
    { name: "TaxId2", label: "LST/VAT NO" },
    { name: "TaxId1", label: "CST NO" },
    { name: "TaxId6", label: "TAN NO" },
    { name: "TaxId3", label: "SERVICE TAX NO" },
    { name: "TaxId8", label: "COMPANY TYPE" },
    { name: "TaxId9", label: "NATURE OF BUSINESS" },
    { name: "TaxId10", label: "ASSESSEE TYPE" },
    { name: "TaxId11", label: "TIN NO" },
  ];

  const handleOpenModal = () => setOpenTaxModal(true);
  const handleCloseModal = () => setOpenTaxModal(false);
  const handleSave = () => {
    const modalData = {
      TaxId0: getValuesAcctGeneral("TaxId0"),
      TaxId4: getValuesAcctGeneral("TaxId4"),
      TaxId5: getValuesAcctGeneral("TaxId5"),
      TaxId7: getValuesAcctGeneral("TaxId7"),
      TaxId13: getValuesAcctGeneral("TaxId13"),
      TaxId2: getValuesAcctGeneral("TaxId2"),
      TaxId1: getValuesAcctGeneral("TaxId1"),
      TaxId6: getValuesAcctGeneral("TaxId6"),
      TaxId3: getValuesAcctGeneral("TaxId3"),
      TaxId8: getValuesAcctGeneral("TaxId8"),
      TaxId9: getValuesAcctGeneral("TaxId9"),
      TaxId10: getValuesAcctGeneral("TaxId10"),
      TaxId11: getValuesAcctGeneral("TaxId11"),
    };
    handleCloseModal();
  };
  //============================================================================================
  const removeEmojis = (str) =>
    str.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2011-\u26FF]|[\uFE00-\uFE0F])/g,
      "",
    );
  const handleApiError = (error, customMessage = "Something went wrong!") => {
    let errorMessage = customMessage;

    if (error.response) {
      errorMessage = error.response.data?.message || customMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    Swal.fire({
      icon: "error",
      title: "API Error",
      text: errorMessage,
      confirmButtonText: "OK",
    });
  };
  //===========================Add Contact====================
  const columns = [
    {
      field: "checkbox",
      headerName: "Select",
      width: 100,
      renderCell: (params) => {
        const isSelected =
          selectedContact && selectedContact.CntctCode === params.row.CntctCode;

        return (
          <Checkbox
            checked={isSelected}
            onChange={(event) => {
              handleCheckboxChangeContactPerson(params.row);
              // setSelectedRows((prevSelection) => [
              //   ...prevSelection.slice(-1),
              //   params.row,
              // ]);
            }}
          />
        );
      },
    },

    { field: "CntctCode", headerName: "Contact ID", width: 150 },
    { field: "FirstName", headerName: "First Name", width: 150 },
    { field: "MiddleName", headerName: "Middle Name", width: 150 },
    { field: "LastName", headerName: "Last Name", width: 150 },
    { field: "Title", headerName: "Title", width: 150 },
    { field: "Position", headerName: "Position", width: 150 },
    { field: "Address", headerName: "Address", width: 150 },
    { field: "Tel1", headerName: "Telephone1", width: 150 },
    { field: "Tel2", headerName: "Telephone2", width: 150 },
    { field: "Mobile", headerName: "Mobile Phone", width: 150 },
    { field: "Fax", headerName: "Fax", width: 150 },
    { field: "Email", headerName: "E-mail", width: 150 },
    { field: "Notes1", headerName: "Remark", width: 150 },
    {
      field: "EDIT",
      headerName: "EDIT",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="primary"
            onClick={() => handleEditContactPerson(params.row)}
          >
            <EditNoteIcon />
          </IconButton>
        );
      },
    },
    {
      field: "DELETE",
      headerName: "DELETE",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={() => handleDeleteRow(params.row.CntctCode)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
  const handleEditContactPerson = (data) => {
    setSaveUpdateButtonCP("UPDATE");
    resetFormContactPerson(data);
    handleOpen();
  };
  const handleCheckboxChangeContactPerson = (row) => {
    if (selectedContact && selectedContact.CntctCode === row.CntctCode) {
      setSelectedContact(null);
    } else {
      setSelectedContact(row); // Select only the clicked row
    }
  };
  useEffect(() => {
    if (contactper.length > 0 && !selectedContact) {
      // If contactper has data and no selectedContact is set, select the first row
      setSelectedContact(contactper[0]);
    }
  }, [contactper, selectedContact, setSelectedContact]); // Add setSelectedContact to dependency array
  const handleCheckboxChange = (event, row) => {
    // If the clicked row is already selected, do nothing (keep it selected)
    if (selectedRow && selectedRow.id === row.id) {
      return;
    } else {
      setSelectedRow(row);
    }
  };
  useEffect(() => {
    if (addBank && addBank.length > 0 && !selectedRow) {
      setSelectedRow(addBank[addBank.length - 1]); // Select the last added row by default
      // setselectedPaymentTerm(addBank[addBank.length - 1].id);
    }
  }, [addBank, selectedRow]);
  const handleDeleteRow = (CntctCode) => {
    const updatedContactper = contactper.filter(
      (row) => row.CntctCode !== CntctCode,
    );
    setContactper(updatedContactper);
    resetFormContactPerson(initialFormDataContactPerson);
  };
  const onSubmitContactPerson = (data) => {
    const contactExists = contactper.some(
      (item) => item.CntctCode === data.CntctCode,
    );

    if (saveUpdateButtonCP === "SAVE") {
      if (contactExists) {
        setContactPersonError("CntctCode", {
          type: "manual",
          message: "Contact ID already exists",
        });
        return;
      }
      // Update contactper and, if it was empty, select the new contact by default.
      setContactper((prevData) => {
        const newData = [...prevData, data];
        if (prevData.length === 0) {
          setSelectedContact(data);
        }
        return newData;
      });
      resetFormContactPerson(initialFormDataAddBank);
    } else {
      // Update logic for existing rows
      const updatedArray = contactper.map((item) => {
        if (item.CntctCode === data.CntctCode) {
          return { ...item, ...data };
        }
        return item;
      });
      setContactper(updatedArray);
      resetFormContactPerson(initialFormDataContactPerson);
    }

    handleClose();
  };
  const initialFormDataContactPerson = {
    Name: "",
    CntctCode: "",
    FirstName: "",
    MiddleName: "",
    LastName: "",
    Title: "",
    Position: "",
    Address: "",
    Tel1: "",
    Tel2: "",
    Mobile: "",
    Fax: "",
    Email: "",
    Notes1: "",
  };
  const {
    control: controlFormContactPerson,
    handleSubmit: handleSubmitFormContactPerson,
    reset: resetFormContactPerson,
    setError: setContactPersonError,
    trigger: triggerContactPerson,
  } = useForm({
    defaultValues: initialFormDataContactPerson,
  });
  const handleClose = () => {
    setOpen(false);
    resetFormContactPerson(initialFormDataContactPerson);
    setSaveUpdateButtonCP("SAVE");
  };
  const handleOpen = () => {
    setOpen(true);
  };
  //===========================Address Type====================
  const {
    fileData,
    setFilesFromApi,
    handleFileChange,
    handleRemove,
    clearFiles,
  } = useFileUpload();
  const addresscol = [
    {
      field: "checkbox",
      headerName: "Select",
      type: "check",
      width: 100,
      editable: false,
      renderCell: (params) => {
        return (
          <Checkbox
            name="check"
            checked={Boolean(params.row.check)} // Ensure boolean value
            onChange={() => setDefaultAddress(params.row, params.row.id)}
          />
        );
      },
    },
    {
      field: "AddressType",
      headerName: "ADDRESS TYPE",
      width: 150,
      renderCell: (params) => {
        const addressType = params.value; // Use `params.value` instead of `params.row.AddressType`
        if (addressType === "P") return cardType === "C" ? "BILL TO" : "PAY TO";
        if (addressType === "S")
          return cardType === "V" ? "SHIP FROM" : "SHIP TO";
        return addressType;
      },
    },
    { field: "Address", headerName: "ADDRESS ID", width: 150 },
    { field: "Address1", headerName: "ADDRESS NAME1", width: 150 },
    { field: "Address2", headerName: "ADDRESS NAME2", width: 150 },
    { field: "City", headerName: "CITY", width: 150 },
    { field: "Zipcode", headerName: "ZIP CODE", width: 150 },
    { field: "GSTRegnNo", headerName: "GSTIN", width: 150 },
    {
      field: "GSTType",
      headerName: "GST Type",
      width: 150,
      renderCell: (params) => {
        const gstTypeValue =
          gstTypeMapping[params.row.GSTType] || params.row.GSTType; // Mapping key to value
        return gstTypeValue; // Display the human-readable value
      },
    },

    { field: "State", headerName: "STATE", width: 150 },
    { field: "Country", headerName: "COUNTRY", width: 150 },
    {
      field: "EDIT",
      headerName: "EDIT",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="primary"
            onClick={() => handleEditAddressType(params.row)}
          >
            <EditNoteIcon />
          </IconButton>
        );
      },
    },
    {
      field: "DELETE",
      headerName: "DELETE",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={() => handleDeleteRow1(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
  const setDefaultAddress = (data, id) => {
    setAddressType((prevAddresses) => {
      const isFirstOfType = !prevAddresses.some(
        (item) => item.AddressType === data.AddressType,
      );

      const updatedAddresses = prevAddresses.map((item, index) => {
        if (index === id) {
          const othersChecked = prevAddresses.some(
            (other, idx) =>
              other.AddressType === data.AddressType &&
              idx !== id &&
              other.check,
          );

          if (item.check && !othersChecked) {
            return item; // Prevent unchecking the only checked row
          }

          return { ...item, check: isFirstOfType ? true : !item.check };
        } else if (item.AddressType === data.AddressType) {
          return { ...item, check: false }; // Uncheck other rows of the same type
        }
        return item;
      });

      setTimeout(() => updateDefaultSelections([...updatedAddresses]), 0);

      return updatedAddresses;
    });
  };
  useEffect(() => {
    if (addressType && addressType.length > 0 && defaultRowId === null) {
      const defaultRow = addressType.find((row) => row.check);
      if (defaultRow) {
        setDefaultRowId(defaultRow.id);
        // const D
      }
    }
  }, [addressType, defaultRowId]);

  const handleEditAddressType = (data) => {
    setSaveUpdateButtonAddressType("UPDATE");

    resetFormAddressType(data);

    handleAddOpen();
  };
  const handleDeleteRow1 = (data) => {
    const updatedRow1 = [...addressType];
    updatedRow1.splice(data, 1);

    setAddressType(updatedRow1);
  };
  const onsubmitAddressType = (data) => {
    const addressExists = addressType.some(
      (item) => item.Address === data.Address,
    );
    const gstinFilled = data.GSTRegnNo && data.GSTRegnNo.trim() !== "";
    const gstTypeSelected = data.GSTType && data.GSTType !== "0";
    if (gstinFilled && !gstTypeSelected) {
      Swal.fire({
        // icon: "warning",
        // title: "GST Type Required",
        text: "Please select a valid GST Type",
      });
      return;
    }
    if (saveUpdateButtonAddressType === "SAVE") {
      if (addressExists) {
        setError("Address", {
          type: "manual",
          message: "Address ID already exists",
        });
        return;
      }

      // Check if "Pay To" or "Ship To" already exist
      const hasPayTo = addressType.some((item) => item.AddressType === "P");
      const hasShipTo = addressType.some((item) => item.AddressType === "S");

      if (data.createDuplicate) {
        const newAddressData = [
          { ...data, AddressType: "P", check: !hasPayTo },
          { ...data, AddressType: "S", check: !hasShipTo },
        ];

        setAddressType((prevData) => {
          const updatedData = [...prevData, ...newAddressData];
          setTimeout(() => updateDefaultSelections(updatedData), 0);
          return updatedData;
        });
      } else {
        const isFirstOfType = !addressType.some(
          (item) => item.AddressType === data.AddressType,
        );

        setAddressType((prevData) => {
          const updatedData = [...prevData, { ...data, check: isFirstOfType }];

          setTimeout(() => updateDefaultSelections([...updatedData]), 0);

          return updatedData;
        });
      }

      resetFormAddressType(initialFormDataAddressType);
    } else {
      // Update logic for existing rows
      let updatedArray = addressType.map((item, i) => {
        if (data.id === i) {
          return { ...data };
        }
        return item;
      });

      setAddressType(updatedArray);
      resetFormAddressType(initialFormDataAddressType);
    }

    handleAddClose();
  };
  const updateDefaultSelections = (addresses = []) => {
    if (!Array.isArray(addresses)) {
      return;
    }

    let newDfltBilled = null;
    let newDfltShiped = null;

    addresses.forEach((item) => {
      if (item.check && item.AddressType === "P") {
        newDfltBilled = item.Address;
      }
      if (item.check && item.AddressType === "S") {
        newDfltShiped = item.Address;
      }
    });

    setDfltBilled(newDfltBilled);
    setDfltShiped(newDfltShiped);
  };
  const initialFormDataAddressType = {
    // AddressType:"p",
    Address: "",
    Address1: "",
    Address2: "",
    City: "",
    Zipcode: "",
    State: "",
    Country: companyData.Country || "",
    AddressType: "P",
    GSTRegnNo: "",
    GSTType: "0",
    createDuplicate: false,
    check: false,
  };
  const {
    control: controlFormAddressType,
    handleSubmit: handleSubmitFormAddressType,
    reset: resetFormAddressType,
    setError,
    getValues: AddressTypegetValues,
    watch: watch4,
    trigger: triggerAddressType,
  } = useForm({
    defaultValues: initialFormDataAddressType,
  });
  const handleAddOpen = () => {
    setAddOpen(true);
  };
  const handleAddClose = () => {
    setAddOpen(false);

    resetFormAddressType(initialFormDataAddressType);
    setSaveUpdateButtonAddressType("SAVE");
  };

  //===========================Add Bank====================
  const addBankCol = [
    {
      field: "selectedCheckbox",
      headerName: "Select",
      width: 100,
      renderCell: (params) => {
        // Check if the current row is selected
        const isSelected =
          selectedRow && selectedRow.Account === params.row.Account;
        return (
          <Checkbox
            checked={isSelected}
            onChange={(e) => handleCheckboxChange(e, params.row)}
          />
        );
      },
    },

    { field: "BankCode", headerName: "BANK CODE", width: 150 },
    { field: "Country", headerName: "Bank Country/Region", width: 150 },
    { field: "BankName", headerName: "BANK NAME", width: 150 },
    { field: "Account", headerName: "ACCOUNT", width: 150 },
    { field: "AcctName", headerName: "BANK ACCOUNT NAME", width: 150 },
    { field: "Branch", headerName: "BRANCH", width: 150 },
    { field: "SwiftNum", headerName: "BIC/SWIFT Code", width: 150 },
    { field: "IBAN", headerName: "IBAN", width: 150 },
    { field: "ControlKey", headerName: "CTR/INT ID", width: 150 },
    { field: "MandateID", headerName: "MANDATE ID", width: 150 },
    {
      field: "SignDate",
      headerName: "DATE OF SIGNATURE",
      type: "number",
      width: 150,
      renderCell: (params) => {
        const dateValue = params.value ? dayjs(params.value) : dayjs();
        return (
          <InputDatePickerField
            name="SignDate"
            value={dateValue.isValid() ? dateValue : null}
          />
        );
      },
    },
    {
      field: "EDIT",
      headerName: "EDIT",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        // const isSelected = selectedRow?.id === params.row.id; // Check if this row is the selected one
        return (
          <IconButton
            color="primary"
            onClick={() => handleEditAddBank(params.row)}
            onChange={(e) => handleCheckboxChange(e, params.id)}
            // disabled={selectedRow !== null && selectedRow !== params.id}
            // disabled={!isSelected}
          >
            <EditNoteIcon />
          </IconButton>
        );
      },
    },
    {
      field: "DELETE",
      headerName: "DELETE",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="error"
            onClick={() => handleDeleteBankRow(params.row.Account)}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
  const handleDeleteBankRow = (Account) => {
    const updatedRows = addBank.filter((row) => row.Account !== Account);

    setAddBank(updatedRows);
  };
  const handleEditAddBank = (data) => {
    setSaveUpdateButtonAB("UPDATE");

    setFormAddBankValue("BankCode", data.BankCode);

    const selectedBank = bankCode.find(
      (item) => item.BankCode === data.BankCode,
    );

    resetFormAddBank({
      ...data,
      BankCode: selectedBank?.DocEntry || data.BankCode,
    });

    handleAddOpen1();
  };
  const onsubmitAddBank = (data) => {
    const selectedBankCode = bankCode.find(
      (bank) => bank.DocEntry === data.BankCode,
    )?.BankCode;

    const newData = {
      ...data,
      BankCode: selectedBankCode, // Ensure BankCode is updated correctly
      id: data.id || data.DocEntry,
    };

    if (saveUpdateButtonAB === "SAVE") {
      // Check if the Account already exists in the addBank array
      const accountExists = addBank.some(
        (item) => item.Account === newData.Account,
      );

      if (accountExists) {
        // If Account exists, show error and prevent adding
        setAddBankError("Account", {
          type: "manual",
          message: "Account already exists",
        });
        return;
      }

      // Otherwise, add the new bank entry and check if it's the first record.
      setAddBank((prevData) => {
        const newArray = [...prevData, newData];
        if (prevData.length === 0) {
          // If there are no existing rows, set the new record as selected by default.
          setSelectedRow(newData);
        }
        return newArray;
      });

      // Reset the form
      resetFormAddBank(initialFormDataAddBank);
    } else if (saveUpdateButtonAB === "UPDATE") {
      // If updating an existing row, map through and update it
      const updatedArray = addBank.map((item) => {
        if (item.Account === newData.Account) {
          return { ...newData }; // Update the matching row
        }
        return item;
      });

      setAddBank(updatedArray);

      // Reset form
      resetFormAddBank(initialFormDataAddBank);
    }

    handleAddClose1(); // Close the modal after saving or updating
  };
  const initialFormDataAddBank = {
    BankCtlKey: "",
    BankCode1: "",
    BankCode: "",
    // Country: "",
    DflSwift: "",
    AcctName: "",
    SignDate: "",
    MandateID: "",
    SwiftNum: "",
    Account: "",
    BankName: "",
    BankAccCode: "",
    Branch: "",
    IBAN: "",
    Country: "",
    ControlKey: "",
  };
  const {
    control: controlFormAddBank,
    handleSubmit: handleSubmitFormAddBank,
    reset: resetFormAddBank,
    getValues: getAddBankValue,
    setValue: setFormAddBankValue,
    setError: setAddBankError,
    trigger: triggerAddBank,
  } = useForm({
    defaultValues: initialFormDataAddBank,
  });
  const FetchBankCode = async () => {
    try {
      setLoading(true); // Start loader

      const res = await apiClient.get(`/BankSetup/All`);
      const success = res?.data?.success;
      const values = res?.data?.values || [];

      if (success) {
        setBankCode(values);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: res?.data?.message || "Failed to fetch bank data.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error fetching bank data:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred while fetching bank data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const ClearForm = async () => {
    resetFormBP(initialFormDataBP);
    // 👇 Grab current defaults before reset
    const defaults = getValuesAcctGeneral([
      "DpmOpnDebAct",
      "DpmOpnDebActName",
      "DpmDppAct",
      "DpmDppActName",
      "DebPayAcct",
      "DebPayAcctName",
      "DpmClear",
      "DpmClearName",
      "DpmIntAct",
      "DpmIntActName",
    ]);

    resetFormAccountGeneral(initialFormDataAccountGeneral);

    // 👇 Immediately reapply defaults
    Object.entries(defaults).forEach(([k, v]) => {
      if (v) setValueAcctGeneral(k, v);
    });

    setSaveUpdateNameBP("SAVE");
    setContactper([]);
    setAddressType([]);
    setAddBank([]);
    setDocEntry("");
    setFromDate(null);
    setToDate(null);

    setSelectedData([]);
    setFormBPValue("Series", seriesdata[0]?.SeriesId ?? "");
    setFormBPValue("CardCode", seriesdata[0]?.DocNum ?? "");
    // setFormBPValue(
    //   "GroupCode",
    //   customergroup.length > 0 ? customergroup[0].DocEntry : ""

    // );
    await FetchPaymentTerms();
    // Optional: refresh accounts, but defaults are already restored above
    await fetchAccountsAndSetDefaults(true);
    setFormBPValue("CardName", "");
  };

  const handleAddOpen1 = () => {
    setAddOpen1(true);
  };
  const handleAddClose1 = () => {
    setAddOpen1(false);
    resetFormAddBank(initialFormDataAddBank);
    setSaveUpdateButtonAB("SAVE");
  };
  //===========================Payment Terms====================

  const FetchPaymentTerms = async () => {
    try {
      setLoading(true); // Start loader

      const res = await apiClient.get(`/PaymentTerms/All`);
      const success = res?.data?.success;
      const resp = res?.data?.values || [];

      if (!success) {
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: res?.data?.message || "Failed to fetch Payment Terms.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      setPaymentTerms(resp);

      // ---------------------------
      // IF NO PAYMENT TERMS RECORDS
      // ---------------------------
      if (resp.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Payment Terms Found",
          text: "Please add a Payment Term first!",
          confirmButtonColor: "#d33",
        });
        return; // ⛔ stop further execution
      }

      // ---------------------------
      // IF SAVE MODE → SET DEFAULT
      // ---------------------------
      if (saveUpdateNameBP === "SAVE") {
        const defaultTerm = resp[0];
        setFormBPValue("GroupNum", defaultTerm.DocEntry, {
          shouldValidate: true,
        });

        updatePriceList(defaultTerm.DocEntry);
      }
    } catch (error) {
      console.error("Error fetching Payment Terms:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred while fetching Payment Terms.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const FetchPriceList = async () => {
    try {
      setLoading(true); // Start loader

      const res = await apiClient.get(`/PriceList/All`);
      const success = res?.data?.success;
      const values = res?.data?.values || [];

      if (!success) {
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: res?.data?.message || "Failed to fetch Price List data.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // Filter active price lists
      const filteredResponse = values.filter((item) => item.Status === "1");
      setPriceList(filteredResponse);
    } catch (error) {
      console.error("Error fetching Price List:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred while fetching Price List.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const toggleDrawer = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const timeoutRef = useRef(null);

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const { isDirty: isContactPersonDirty } = useFormState({
    control: controlFormContactPerson,
  });
  const { isDirty: isAddressTypeDirty } = useFormState({
    control: controlFormAddressType,
  });
  const { isDirty: isAddBankDirty } = useFormState({
    control: controlFormAddBank,
  });
  const { isDirty: isBPDirty } = useFormState({ control: controlFormBP });

  const allFormData = getValues();
  const watchSeries = watch("Series");
  const selectedCurrency = watch("Currency"); // get selected currency

  const gstTypeMapping = {
    1: "Regular/TDS/ISD",
    2: "Casual Taxable Person",
    3: "Composition Levy",
    4: "Government Department or PSU",
    5: "UN Agency or Embassy",
  };

  // ===========================================================================================
  const selectedGSTType = useWatch({
    control: controlFormAddressType,
    name: "GSTType",
  });

  const payterm = watch("GroupNum");
  const bankaddcode = watch("BankCode");
  const addressTypeValue = watch4("AddressType");
  const Ship =
    addressTypeValue === "S"
      ? "SAME FOR PAY TO ADDRESS"
      : "SAME FOR SHIP TO ADDRESS";

  useEffect(() => {
    if (saveUpdateNameBP === "SAVE") {
      if (payterm) {
        updatePriceList(payterm);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payterm, paymentTerms]);
  const updatePriceList = (groupNum) => {
    const data = paymentTerms.find((item) => item.DocEntry === groupNum);

    if (!data) return;

    const updatedData = {
      ...allFormData,
      GroupNum: Number(groupNum),
      ListNum: data.ListNum ? Number(data.ListNum) : "",
      Discount: data.VolumDscnt ? Number(data.VolumDscnt) : "",
      DebtLine: data.CommitLimit ? Number(data.CommitLimit) : "",
    };

    // Reset the form with updated dependent values
    resetFormBP(updatedData);
  };

  useEffect(() => {
    const data = bankCode.find((item) => item.DocEntry === bankaddcode);
    const updatedData = {
      ...allFormData,
      BankCode1: data ? String(data.BankCode) : "",
      BankName: data ? String(data.BankName) : "",
      CountryCode: data ? String(data.Country) : "",
    };
    resetFormBP(updatedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //====================================Active Tab API Binding for BP====================================================================
  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true); // Start loader

      const url = searchTerm
        ? `/BPV2/V2/Search/${searchTerm}/1/${pageNum}/20`
        : `/BPV2/V2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values || [];

        setHasMoreOpen(newData.length === 20);

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        // Backend returned success: false
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: response.data.message || "Failed to fetch Active List data!",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error fetching Active List:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred while fetching Active List data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // Stop loader
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

  //===========================================set data to fields===================================
  const setOldDataOPen = async (DocEntry, CardCode, CntctCode) => {
    setok("");

    try {
      // await setbusinessPartner(CardCode, CntctCode);
      if (
        isBPDirty ||
        isContactPersonDirty ||
        isAddressTypeDirty ||
        isAddBankDirty ||
        "UPDATE" === ok
      ) {
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
          fetchAndSetData(DocEntry);
          setSaveUpdateNameBP("UPDATE");
        });
      } else {
        fetchAndSetData(DocEntry);
        setSaveUpdateNameBP("UPDATE");
      }
    } catch (error) {}
  };
  const fetchAndSetData = async (DocEntry) => {
    setSaveUpdateNameBP("UPDATE");
    toggleDrawer(sidebarOpen);
    try {
      // setDfltBilled(null);
      // setDfltShiped(null);
      setLoading(true);
      const { data } = await apiClient.get(`/BPV2/V2/${DocEntry}`);
      const { values } = data;
      setFilesFromApi(values.AttcEntry);

      // resetFormBP(values); // Resets the form state
      await new Promise((resolve) => setTimeout(resolve, 50));
      setAddressType(values.oLines);
      setContactper(values.oCPLines);
      setDocEntry(DocEntry);
      setFormBPValue("CardCode", values.CardCode);
      setFormBPValue("Currency", companyData.Currency);

      setAddBank(values.oBPBankAccLines);
      resetFormBP({
        ...values,
        PhoneNumber1: values.PhoneNumber1 || "",
        PhoneNumber2: values.PhoneNumber2 || "",
        Cellular: values.Cellular || "",
      });
      resetFormContactPerson({ oCPLines: values.oCPLines });
      setAddressType(values.oLines);
      resetFormAddBank({ oBPBankAccLines: values.oBPBankAccLines });
      resetFormAccountGeneral({
        FatherCard: values.FatherCard || "",
        FatherType: values.FatherType || "",
        DebPayAcct: values.DebPayAcct || "",
        DpmClear: values.DpmClear || "",
        DpmIntAct: values.DpmIntAct || "",
        DpmDppAct: values.DpmDppAct || "",
        DpmOpnDebAct: values.DpmOpnDebAct || "",
        TaxId0: values.TaxId0 || "",
        TaxId1: values.TaxId1 || "",
        TaxId2: values.TaxId2 || "",
        TaxId3: values.TaxId3 || "",
        TaxId4: values.TaxId4 || "",
        TaxId5: values.TaxId5 || "",
        TaxId6: values.TaxId6 || "",
        TaxId7: values.TaxId7 || "",
        TaxId8: values.TaxId8 || "",
        TaxId9: values.TaxId9 || "",
        TaxId10: values.TaxId10 || "",
        TaxId11: values.TaxId11 || "",
        TaxId13: values.TaxId13 || "",
        WTLiable: values.WTLiable === "1" ? 1 : 0,
        CrtfcateNO: values.CrtfcateNO || "",
        ExpireDate: values.ExpireDate || "",
        NINum: values.NINum || "",
        TypWTReprt: values.TypWTReprt || "",
        WTTaxCat: values.WTTaxCat || "",
        SurOver: values.SurOver === "1" ? 1 : 0,
        Remark1: values.Remark1 || "",
        ConCerti: values.ConCerti || "",
        ThreshOver: values.ThreshOver === "1" ? 1 : 0,
        VendTID: values.VendTID || "",
        WTaxCodesAllowed: values.WTaxCodesAllowed || "",
        UseShpdGd: values.UseShpdGd === "1" ? 1 : 0,
        AccCritria:
          values.AccCritria === "Y"
            ? "Accrual"
            : values.AccCritria === "N"
              ? "Cash"
              : "",
      });
      const acctFields = [
        "DebPayAcct",
        "DpmClear",
        "DpmIntAct",
        "DpmDppAct",
        "DpmOpnDebAct",
      ];

      acctFields.forEach((field) => {
        const acctCode = values[field];
        if (acctCode) {
          const match = chartOfAccounts.find(
            (acc) => acc.AcctCode === acctCode,
          );
          if (match) {
            setValueAcctGeneral(`${field}Name`, match.AcctName);
          }
        }
      });
      await triggerBP();
      await triggerContactPerson();
      await triggerAddressType();
      await triggerAddBank();

      toggleDrawer(sidebarOpen);

      if (values.Status === "0") {
        setFromDate(
          values.FrozenFrom !== "01/01/1900 00:00:00"
            ? values.FrozenFrom
            : null,
        );
        setToDate(
          values.FrozenTo !== "01/01/1900 00:00:00" &&
            values.FrozenTo !== "01/01/2099 00:00:00"
            ? values.FrozenTo
            : null,
        );
      } else if (values.Status === "1") {
        setFromDate(
          values.ValidFrom !== "01/01/1900 00:00:00" ? values.ValidFrom : null,
        );
        setToDate(
          values.ValidTo !== "01/01/1900 00:00:00" &&
            values.ValidTo !== "01/01/2099 00:00:00"
            ? values.ValidTo
            : null,
        );
      } else {
        setFromDate(null);
        setToDate(null);
      }

      // Set default account selection
      const defaultAccount = values.DflAccount;
      const selectedRow = values.oBPBankAccLines.find(
        (row) => row.Account === defaultAccount,
      );
      if (selectedRow) {
        setSelectedRow(selectedRow);
      }

      // Set default contact person selection
      const defaultContactPerson = values.CntctPrsn;
      const selectedContactPersonRow = values.oCPLines.find(
        (row) => row.LineNum === defaultContactPerson,
      );
      if (selectedContactPersonRow) {
        setSelectedContact(selectedContactPersonRow);
      }

      const defaultShipped = values.DfltShiped;
      const defaultBilled = values.DfltBilled;

      setDfltShiped(defaultShipped);
      setDfltBilled(defaultBilled);

      const updatedAddresses = values.oLines.map((line) => {
        let isChecked = false;
        if (line.LineNum === defaultShipped && line.AddressType === "S") {
          isChecked = true;
          setDfltShiped(line);
        }
        if (line.LineNum === defaultBilled && line.AddressType === "P") {
          isChecked = true;
          setDfltBilled(line);
        }
        return {
          ...line,
          check: isChecked,
        };
      });
      updateDefaultSelections(updatedAddresses);
      setAddressType(updatedAddresses);
      // setAddressType(updatedAddresses);
      setSelectedData(DocEntry);
    } catch (error) {
      handleApiError(error, "Failed to set values to fields !");
    } finally {
      setLoading(false);
    }
  };

  // ============================================InActive List Start ==================================================================
  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      setLoading(true); // start loader

      const url = searchTerm
        ? `/BPV2/V2/Search/${searchTerm}/0/${pageNum}/20`
        : `/BPV2/V2/Pages/0/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values || [];

        setHasMoreClosed(newData.length === 20);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        // Backend returned success: false
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: response.data.message || "Failed to fetch Inactive List data!",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error fetching Inactive List:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "An unexpected error occurred while fetching Inactive List data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // stop loader
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
      closedListSearching ? closedListquery : "",
    );
    setClosedListPage((prev) => prev + 1);
  };

  // ==========================================================================================================================
  const customerGroup = async (groupType) => {
    try {
      setLoading(true); // start loader

      const res = await apiClient.get(
        `/BusinessPartnerGroup/ByGroupType/${groupType}`,
      );

      // Filter active groups
      const response = (res.data.values || []).filter(
        (item) => item.Status === "1",
      );

      if (response.length === 0) {
        setCustomerGroup([]);
        setFormBPValue("GroupCode", ""); // clear the field
        return;
      }

      setCustomerGroup(response);

      // Set default value if in SAVE mode
      if (saveUpdateNameBP === "SAVE") {
        setFormBPValue("GroupCode", response[0].DocEntry);
      }
    } catch (error) {
      console.error("Error fetching Customer Group:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to fetch Customer Group data!",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // stop loader
    }
  };

  const CurrencyData = async () => {
    try {
      setLoading(true); // start loader

      // Fetch all currencies
      const currencyRes = await apiClient.get(`/Currency/all`);
      const currencyList = currencyRes.data.values || [];
      setCurrencydata(currencyList);

      // If in SAVE mode, set default currency
      if (saveUpdateNameBP === "SAVE") {
        const mainCurrency = companyData?.MainCurncy;
        const matchedCurrency = currencyList.find(
          (item) => item.CurrCode === mainCurrency,
        );

        if (matchedCurrency) {
          setFormBPValue("Currency", matchedCurrency.CurrCode, {
            shouldValidate: true,
          });
        } else if (mainCurrency) {
          // fallback if not found in list
          setFormBPValue("Currency", mainCurrency, {
            shouldValidate: true,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching Currency data:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch Currency list!",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // stop loader
    }
  };

  const shippingData = async () => {
    try {
      setLoading(true); // start loader

      const res = await apiClient.get(`/ShippingType/all`);
      const response = res.data.values || [];
      setShippingData(response);

      // Optionally set default in SAVE mode
      if (saveUpdateNameBP === "SAVE" && response.length > 0) {
        setFormBPValue("ShipType", response[0].DocEntry, {
          shouldValidate: true,
        });
      }
    } catch (error) {
      console.error("Error fetching Shipping Type:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch Shipping Type!",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // stop loader
    }
  };

  const SeriesData = async () => {
    try {
      setLoading(true); // start loader

      const res = await apiClient.get(
        `/DocSeriesV2/ForTrans?ObjType=2&DocDate=${dayjs().format("YYYY-MM-DD")}`,
      );
      const response = res.data;

      if (response.success === true || saveUpdateNameBP === "SAVE") {
        const values = response.values || [];
        setSeriesdata(values);

        // Set default form values if available
        if (values.length > 0) {
          setFormBPValue("Series", values[0]?.SeriesId ?? "", {
            shouldValidate: true,
          });
          setFormBPValue("CardCode", values[0]?.DocNum ?? "", {
            shouldValidate: true,
          });
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: response.message || "Unable to fetch document series",
          icon: "warning",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error fetching Document Series:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to fetch Document Series Data!",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // stop loader
    }
  };

  const ListofCountry = async () => {
    try {
      setLoading(true); // Start loader

      const res = await apiClient.get(`/Country/all`);
      let values = res.data.values || [];

      // Optional filtering logic
      // values = values.filter((item) => item.Code === item.Code);

      setListofCountry(values);
    } catch (error) {
      console.error("Error fetching country list:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch country list!",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const ListofState = async (CountryCode) => {
    if (!CountryCode) return; // early exit if no country code

    try {
      setLoading(true); // start loader

      const res = await apiClient.get(
        `/ListofStates/GetByCountryCode/${CountryCode}`,
      );

      if (res.data.success) {
        const values = res.data.values || [];
        setListofState(values);
      } else {
        // show error if success is false
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: res.data.message || "Failed to fetch List of States!",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error fetching List of States:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message || "Failed to fetch List of States!",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // stop loader
    }
  };

  const Country = watch4("Country");

  useEffect(() => {
    ListofState(Country || "IND");
    // if (addBank && addBank.length > 0) {
    //   setSelectedRow(addBank[0]);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Country, addBank]);
  useEffect(() => {
    fetchGetListData(0, "", cardType);
    fetchClosedListData(0);
    fetchOpenListData(0);
    FetchPaymentTerms();
    FetchPriceList();
    FetchBankCode();
    getChartOfAccounts();
    CurrencyData();
    shippingData();
    SeriesData();
    ListofCountry();
    GLAcctData();
  }, []);

  useEffect(() => {
    if (cardType) {
      customerGroup(cardType); // Fetch customer group when cardType is set
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardType]);
  useEffect(() => {
    if (watch("CardType") === "C" && customergroup.length > 0) {
      setFormBPValue("GroupCode", customergroup[0].DocEntry);
    }
  }, [watch("CardType"), customergroup, setFormBPValue]);

  const handleChange = (event, newValue) => {
    // alert("")
    setValue(newValue);
  };
  // =========================================post and put api ===================================================

  const handleSubmitFormBP = async (data) => {
    const StatusValue = watch("Status");

    if (addressType.length > 0) {
      const hasPayTo = addressType.some(
        (item) => item.AddressType.trim() === "P" && item.check,
      );
      const hasShipTo = addressType.some(
        (item) => item.AddressType.trim() === "S" && item.check,
      );
      const hasShipFrom = addressType.some(
        (item) => item.AddressType.trim() === "S" && item.check,
      );

      if (!hasPayTo && !hasShipTo && !hasShipFrom) {
        Swal.fire({
          title: "Warning!",
          text: "You must select at least one address.",
          confirmButtonText: "Ok",
        });
        return;
      }
    }
    const accounting = getValuesAcctGeneral();
    // Currency validation for key accounts
    // Currency validation for key accounts
    const bpCurrency = data.Currency; // Business Partner Currency from form data

    // Skip all validation if BP Currency is 'AC' (All Currencies)
    if (bpCurrency !== "AC") {
      // Skip if BP currency is 'All Currency'
      const accountsToCheck = [
        {
          code: accounting.DebPayAcct,
          label: "Accounts Receivable/Payable (DebPayAcct)",
        },
        {
          code: accounting.DpmIntAct,
          label: "Down Payment Interim Account (DpmIntAct)",
        },
        {
          code: accounting.DpmDppAct,
          label: "Down Payment Receivable/Payable (DpmDppAct)",
        },
      ];

      for (const acc of accountsToCheck) {
        if (acc.code && acc.code !== "" && acc.code !== "0") {
          const coaMatch = chartOfAccounts.find((a) => a.AcctCode === acc.code);

          if (!coaMatch) {
            Swal.fire({
              title: "Account Not Found",
              text: `${acc.label} (${acc.code}) does not exist in Chart of Accounts.`,
              icon: "error",
            });
            return;
          }

          const acctCurr = coaMatch.ActCurr;
          if (acctCurr !== bpCurrency && acctCurr !== "AC") {
            Swal.fire({
              title: "Currency Mismatch!",
              text: `${acc.label} (${acc.code}) currency is '${acctCurr}', but Business Partner currency is '${bpCurrency}'. Must match or be 'AC'.`,
              icon: "error",
              confirmButtonText: "OK",
            });
            return;
          }
        }
      }
    }

    // ----- 3. Required Accounts Check -----
    const requiredFields = [
      { key: "DebPayAcct", label: "Account Receivable/Payable" },
      // { key: "DpmIntAct", label: "Down Payment Interim Account" },
      { key: "DpmDppAct", label: "Down Payment Receivable/Payable" },
    ];
    for (const field of requiredFields) {
      const value = accounting[field.key];
      if (!value || value === "" || value === "0") {
        Swal.fire({
          title: "Validation Error!",
          text: `${field.label} must have a valid Account.`,
          icon: "error",
          confirmButtonText: "Ok",
        });
        return;
      }
    }

    const formData = new FormData();
    formData.append("DocEntry", allFormData.AttcEntry || "");
    formData.append("UserId", user.UserId);
    formData.append("CreatedBy", user.UserName);
    formData.append("ModifiedBy", user.UserName);
    formData.append("CreatedDate", dayjs().format("YYYY-MM-DD"));
    formData.append("ModifiedDate", dayjs().format("YYYY-MM-DD"));
    formData.append("Status", "1");
    fileData.forEach((fileRow, index) => {
      formData.append(
        `AttachmentLines[${index}].LineNum`,
        fileRow.LineNum === "0" ? "" : fileRow.LineNum,
      );
      formData.append(
        `AttachmentLines[${index}].DocEntry`,
        fileRow.DocEntry || "",
      );
      formData.append(`AttachmentLines[${index}].UserId`, user.UserId);
      formData.append(`AttachmentLines[${index}].CreatedBy`, user.UserName);
      formData.append(`AttachmentLines[${index}].ModifiedBy`, user.UserName);
      formData.append(
        `AttachmentLines[${index}].CreatedDate`,
        dayjs().format("YYYY-MM-DD"),
      );
      formData.append(
        `AttachmentLines[${index}].ModifiedDate`,
        dayjs().format("YYYY-MM-DD"),
      );
      formData.append(`AttachmentLines[${index}].Status`, "1");
      formData.append(
        `AttachmentLines[${index}].FileName`,
        fileRow.FileName.substring(0, fileRow.FileName.lastIndexOf(".")) ||
          fileRow.FileName,
      );
      formData.append(`AttachmentLines[${index}].FileExt`, fileRow.FileExt);
      formData.append(
        `AttachmentLines[${index}].Description`,
        fileRow.FileName,
      );
      formData.append(`AttachmentLines[${index}].SrcPath`, "");
      if (fileRow.File) {
        formData.append(`AttachmentLines[${index}].File`, fileRow.File);
      }
    });
    let attachmentDocEntry = null;
    if (fileData?.length > 0) {
      if (saveUpdateNameBP === "SAVE") {
        const attachmentRes = await apiClient.post("/Attachment", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (!attachmentRes.data.success) {
          return Swal.fire({
            title: "Error!",
            text: attachmentRes.data.message,
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
        attachmentDocEntry = attachmentRes.data.ID;
      }
    }

    const BussPatner = {
      ModifiedBy: user.UserName,
      DocEntry: String(data.DocEntry || ""),
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      UserId: user.UserId,
      DocDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      // CreatedBy: user.UserName || "Helix",
      // ModifiedBy: user.UserName || "Helix",
      DocNum: String(data.CardCode || ""),
      CreatedBy: user.UserName,
      Status: StatusValue === "1" ? "1" : "0",
      CardCode: String(data.CardCode || ""),
      CardName: String(data.CardName || ""),
      CardType: String(data.CardType || ""),
      CardFName: String(data.CardFName || ""),
      Currency: String(data.Currency || ""),
      LicTradNum: String(data.LicTradNum || ""),
      GroupCode: String(data.GroupCode || ""),
      PhoneNumber1: String(data.PhoneNumber1 || ""),
      PhoneNumber2: String(data.PhoneNumber2 || ""),
      Cellular: String(data.Cellular || ""),
      Fax: String(data.Fax || ""),
      // E_Mail: String(data.E_Mail,
      Email: String(data.Email || ""),
      validFor: String(data.validFor ? "1" : "0"),
      frozenFor: String(data.frozenFor ? "1" : "0"),
      ValidComm: String(data.ValidComm || ""),
      Remarks: String(data.Remarks || ""),
      FreeTexts: String(data.FreeTexts || ""),
      BankCountr: String(data.BankCountr || ""),
      ShipType: String(data.ShipType || ""),
      Balance: data.Balance || "0",
      ChecksBal: data.ChecksBal || "0",
      DNotesBal: data.DNotesBal || "0",
      OrdersBal: data.OrdersBal || "0",
      DNoteBalFC: data.DNoteBalFC || "0",
      OrderBalFC: data.OrderBalFC || "0",
      DNoteBalSy: data.DNoteBalSy || "0",
      OrderBalSy: data.OrderBalSy || "0",
      BalanceSys: data.BalanceSys || "0",
      BalanceFC: data.BalanceFC || "0",
      ValidFrom:
        StatusValue === "1" && FromDate && ToDate
          ? dayjs(FromDate).format("YYYY-MM-DD HH:mm:ss")
          : StatusValue === "1" && !FromDate && !ToDate
            ? "01/01/1900 00:00:00"
            : StatusValue === "1" && FromDate && !ToDate
              ? dayjs(FromDate).format("YYYY-MM-DD HH:mm:ss")
              : "01/01/1900 00:00:00",

      ValidTo:
        StatusValue === "1" && ToDate
          ? dayjs(ToDate).format("YYYY-MM-DD HH:mm:ss")
          : StatusValue === "1" && !FromDate && !ToDate
            ? "01/01/2099 00:00:00"
            : StatusValue === "1" && FromDate && !ToDate
              ? "01/01/2099 00:00:00"
              : "01/01/1900 00:00:00",

      FrozenFrom:
        StatusValue === "0" && FromDate && ToDate
          ? dayjs(FromDate).format("YYYY-MM-DD HH:mm:ss")
          : StatusValue === "0" && !FromDate && !ToDate
            ? "01/01/1900 00:00:00"
            : StatusValue === "0" && FromDate && !ToDate
              ? dayjs(FromDate).format("YYYY-MM-DD HH:mm:ss")
              : "01/01/1900 00:00:00",

      FrozenTo:
        StatusValue === "0" && ToDate
          ? dayjs(ToDate).format("YYYY-MM-DD HH:mm:ss")
          : StatusValue === "0" && !FromDate && !ToDate
            ? "01/01/2099 00:00:00"
            : StatusValue === "0" && FromDate && !ToDate
              ? "01/01/2099 00:00:00"
              : "01/01/1900 00:00:00",
      GroupNum: String(data.GroupNum || ""),
      IntrstRate: String(data.IntrstRate || "0"),
      ListNum: String(data.ListNum || ""),
      Discount: String(data.Discount || "0"),
      CreditLine: String(data.CreditLine || "0"),
      DebtLine: String(data.DebtLine || "0"),
      DunTerm: String(data.DunTerm || "0"),
      AutoPost: String(data.AutoPost || "0"),
      DflIBAN: String(selectedRow.IBAN || ""),
      HldCode: String(data.HldCode || "0"),
      SlpCode: String(data.SlpCode || ""),
      BankCode: String(selectedRow.BankCode || ""),
      BankName: String(selectedRow.BankName || ""),
      DflSwift: String(selectedRow.SwiftNum || ""),
      AttcEntry: attachmentDocEntry || data.AttcEntry || "",
      CardValid: String(data.CardValid || ""), // Always pass empty
      CrCardNum: String(data.CrCardNum || "0"),
      DflBranch: String(selectedRow.Branch || ""),
      HouseBank: String(data.HouseBank || "0"),
      HsBnkIBAN: String(data.HsBnkIBAN || ""),
      OwnerCode: String(data.OwnerCode || ""),
      AvrageLate: String(data.AvrageLate || ""),
      Country: String(data.Country || ""),
      CreditCard: String(data.CreditCard || ""),
      DflAccount: String(selectedRow.Account || ""),
      Series: String(data.Series || ""),
      HousBnkAct: String(data.HousBnkAct || ""),
      HousBnkBrn: String(data.HousBnkBrn || ""),
      HousBnkCry: String(data.HousBnkCry || ""),
      HsBnkSwift: String(data.HsBnkSwift || ""),
      OwnerIdNum: String(data.OwnerIdNum || ""),
      BankCtlKey: String(data.BankCtlKey || ""),
      ContactPerson: String(data.ContactPerson || ""),
      MandateID: String(data.MandateID || ""),
      DiscRel: String(data.DiscRel || ""),
      // FrozenFrom: dayjs(data.FrozenFrom).format("YYYY-MMM-DD"),
      // FrozenTo: dayjs(data.FrozenTo).format("YYYY-MMM-DD"),
      SignDate: dayjs(data.SignDate).format("YYYY-MM-DD"),
      CntctPrsn: String(selectedContact.CntctCode || ""),
      DfltBilled: String(DfltBilled),
      DfltShiped: String(DfltShiped),
      FatherCard: accounting.FatherCard || "",
      FatherType: accounting.FatherType || "",
      DebPayAcct: accounting.DebPayAcct || "",
      DpmClear: accounting.DpmClear || "",
      DpmIntAct: accounting.DpmIntAct || "",
      DpmDppAct: accounting.DpmDppAct || "",
      DpmOpnDebAct: accounting.DpmOpnDebAct || "",
      TaxId0: accounting.TaxId0 || "",
      TaxId1: accounting.TaxId1 || "",
      TaxId2: accounting.TaxId2 || "",
      TaxId3: accounting.TaxId3 || "",
      TaxId4: accounting.TaxId4 || "",
      TaxId5: accounting.TaxId5 || "",
      TaxId6: accounting.TaxId6 || "",
      TaxId7: accounting.TaxId7 || "",
      TaxId8: accounting.TaxId8 || "",
      TaxId9: accounting.TaxId9 || "",
      TaxId10: accounting.TaxId10 || "",
      TaxId11: accounting.TaxId11 || "",
      TaxId13: accounting.TaxId13 || "",
      WTLiable: accounting.WTLiable ? "1" : "0",
      CrtfcateNO: accounting.CrtfcateNO || "",
      ExpireDate: accounting.ExpireDate || "",
      NINum: accounting.NINum || "",
      TypWTReprt: accounting.TypWTReprt || "",
      WTTaxCat: accounting.WTTaxCat || "",
      SurOver: accounting.SurOver ? "1" : "0",
      Remark1: accounting.Remark1 || "",
      ConCerti: accounting.ConCerti || "",
      ThreshOver: accounting.ThreshOver ? "1" : "0",
      VendTID: accounting.VendTID || "",
      WTaxCodesAllowed: accounting.WTaxCodesAllowed || "",
      UseShpdGd: accounting.UseShpdGd ? "1" : "0",
      AccCritria:
        accounting.AccCritria === "Accrual"
          ? "Y"
          : accounting.AccCritria === "Cash"
            ? "N"
            : "",
      oLines: addressType.map((element) => ({
        LineNum: String(element.LineNum || ""),
        UserId: user.UserId ? "Online" : "Helix",
        CreatedBy: user.UserName ? "Online" : "Helix",
        ModifiedBy: user.UserName,
        ItemCode: String(element.ItemCode || ""),
        ItemName: String(element.ItemName || ""),
        AddressType: element.AddressType,
        Address: element.Address,
        Status: "1",
        Address1: element.Address1,
        Address2: element.Address2,
        Block: String(element.Address1 || ""),
        Street: String(element.Address2 || ""),
        Building: String(element.Building || ""),
        StreetNo: String(element.StreetNo || ""),
        AdresType: String(element.AdresType || ""),
        GlblLocNum: String(element.GlblLocNum || ""),
        City: element.City || "",
        State: String(element.State || ""),
        Country: String(element.Country || ""),
        Zipcode: String(element.Zipcode || ""),
        RequestNo: String(element.RequestNo || ""),
        GSTType: String(element.GSTType || ""),
        GSTRegnNo: String(element.GSTRegnNo || ""),
      })),

      oCPLines: contactper.map((item) => ({
        LineNum: String(item.LineNum || ""),
        UserId: user.UserId ? "Online" : "Helix",
        CreatedBy: user.UserName ? "Online" : "Helix",
        ModifiedBy: user.UserName,
        Status: String(item.Status || "1"),
        CntctCode: String(item.CntctCode || ""),
        FirstName: String(item.FirstName || ""),
        MiddleName: String(item.MiddleName || ""),
        LastName: String(item.LastName || ""),
        Title: String(item.Title || ""),
        Position: String(item.Position || ""),
        Address: String(item.Address || ""),
        Tel1: String(item.Tel1 || ""),
        Tel2: String(item.Tel2 || ""),
        Mobile: String(item.Mobile || ""),
        Fax: String(item.Fax || ""),
        Email: String(item.Email || ""),
        Notes1: String(item.Notes1 || ""),
        CardCode: String(item.CardCode || ""),
      })),

      oBPBankAccLines: addBank.map((items) => {
        const transformedItem = {
          LineNum: String(items.LineNum || ""),
          UserId: user.UserId ? "Online" : "Helix",
          CreatedBy: user.UserName ? "Online" : "Helix",
          ModifiedBy: user.UserName,
          Status: String(items.Status || "1"),
          BankCode: String(items.BankCode || ""),
          BankName: String(items.BankName || ""),
          Country: String(items.Country || ""),
          BankKey: String(items.BankKey || ""),
          Account: String(items.Account || ""),
          AcctName: String(items.AcctName || ""),
          Branch: String(items.Branch || ""),
          SwiftNum: String(items.SwiftNum || ""),
          IBAN: String(items.IBAN || ""),
          ZipCode: String(items.ZipCode || ""),
          Block: String(items.Block || ""),
          City: String(items.City || ""),
          State: String(items.State || ""),
          ControlKey: String(items.ControlKey || ""),
          MandateID: String(items.MandateID || ""),
          SignDate: dayjs(data.SignDate).format("YYYY-MM-DD"),
          CardCode: String(items.CardCode || ""),
        };

        return transformedItem;
      }),
    };

    for (const field of requiredFields) {
      const value = BussPatner[field.key];
      if (!value || value === "" || value === "0") {
        Swal.fire({
          title: "Validation Error!",
          text: `${field.label} must have a valid Account.`,
          icon: "error",
          confirmButtonText: "Ok",
        });
        return; // Abort submission
      }
    }

    if (saveUpdateNameBP === "SAVE") {
      // setLoading(true);

      apiClient

        .post(`/BPV2/V2`, BussPatner)

        .then((response) => {
          setLoading(false);

          if (response.data.success) {
            // UpdateContactPerson(response.data.values.CardCode);

            fetchOpenListData(0);
            fetchClosedListData(0);
            setAddBank();
            setContactper();
            setAddressType();
            ClearForm();
            SeriesData();
            Swal.fire({
              title: "Success!",
              text: "Business Partner added Successfully",
              icon: "success",
              confirmButtonText: "Ok",
              timer: 1000,
            });
          } else {
            apiClient.delete(`/Attachment/${attachmentDocEntry}`);
            Swal.fire({
              title: "Error!",
              text: response.data.message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        })

        .catch((error) => {
          apiClient.delete(`/Attachment/${attachmentDocEntry}`);
          Swal.fire({
            title: "Error!",
            text: error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        });
    } else {
      const result = await Swal.fire({
        text: `Do You Want to Update "${BussPatner.CardCode}"`,
        icon: "question",
        showConfirmButton: true,
        showDenyButton: true,
        confirmButtonText: "YES",
        cancelButtonText: "No",
      });
      if (result.isConfirmed) {
        let attachmentDocEntry = data.AttcEntry || null;

        // If there are files and no existing attachment, POST first
        if (fileData?.length > 0 && data.AttcEntry === "0") {
          const attachmentRes = await apiClient.post("/Attachment", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (!attachmentRes.data.success) {
            setLoading(false);
            return Swal.fire({
              title: "Error!",
              text: attachmentRes.data.message,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }

          attachmentDocEntry = attachmentRes.data.ID;
        }
        // If files exist and attachment already exists, PUT to update
        else if (fileData?.length > 0 && data.AttcEntry) {
          await apiClient.put(`/Attachment/${data.AttcEntry}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        // Update your obj.AttcEntry with new or existing attachment ID
        BussPatner.AttcEntry = attachmentDocEntry || "";
        apiClient
          .put(`/BPV2/V2/${data.DocEntry}`, BussPatner)
          .then((response) => {
            setLoading(false);

            if (response.data.success) {
              fetchOpenListData(0);
              setOpenListPage(0);
              setClosedListPage(0);
              fetchClosedListData(0);
              setAddBank();
              setContactper();
              setAddressType();
              SeriesData();

              ClearForm();
              Swal.fire({
                title: "Success!",
                text: "Business Partner Updated",
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
          })

          .catch((err) => {
            Swal.fire({
              title: "Error!",
              text: err,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          });
      } else {
        Swal.fire({
          text: "Business Partner Not Updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  };
  //=================================================delete api========================================
  const handleOnDelete = async () => {
    const confirmation = await Swal.fire({
      text: `Do You Want to Delete "${allFormData?.CardName || ""}"?`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    });

    if (!confirmation.isConfirmed) {
      Swal.fire({
        text: "Business Partner Not Deleted",
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
        `/BPV2/V2/${allFormData.DocEntry}`,
      );
      const { success, message } = response.data;

      if (success) {
        ClearForm();
        fetchOpenListData(0);
        fetchClosedListData(0);

        Swal.fire({
          title: "Success!",
          text: "Business Partner Deleted",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
      } else {
        Swal.fire({
          text: message || "Failed to delete Business Partner!",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting Business Partner:", error);
      Swal.fire({
        icon: "error",
        text:
          error.response?.data?.message || "Failed to delete Business Partner!",
        confirmButtonColor: "#d33",
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
          Business Partner List
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
                  loader={<BeatLoader />}
                  scrollableTarget="ListScroll"
                  endMessage={<Typography>No More Records</Typography>}
                >
                  {openListData.map((item, i) => (
                    <CardComponent
                      key={i}
                      title={item.CardCode}
                      subtitle={item.CardName}
                      description={
                        item.CardType === "C"
                          ? "Customer"
                          : item.CardType === "V"
                            ? "Vendor"
                            : ""
                      }
                      searchResult={openListquery}
                      isSelected={selectedData === item.DocEntry}
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
                    <CardComponent
                      key={i}
                      title={item.CardCode}
                      subtitle={item.CardName}
                      description={
                        item.CardType === "C"
                          ? "Customer"
                          : item.CardType === "V"
                            ? "Vendor"
                            : ""
                      }
                      searchResult={closedListquery}
                      isSelected={selectedData === item.DocEntry}
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
      {loading && <Loader open={loading} />}
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
      <Dialog
        open={openCreateGroupDialog}
        onClose={handleGroupClose}
        maxWidth={false}
        sx={{
          "& .MuiDialog-paper": {
            width: "50vw", // dialog width
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
          BUSINESS PARTNER GROUP
          {/* 🔹 Close Icon at Top-Right */}
          <IconButton
            onClick={() => {
              resetGroup(initialGroupData);
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
            onSubmit={HandleGroupForm(handleAddGroup)}
            autoComplete="off"
          >
            <Grid
              container
              spacing={2} // 👈 adds space between fields
              textTransform="uppercase"
              sx={{ alignItems: "center" }}
            >
              <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                <Controller
                  name="GroupName"
                  control={ControlGroup}
                  rules={{
                    required: "Group Name is required",
                    validate: (value) =>
                      value.trim() !== "" || "Group Name cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <InputTextField
                        label="GROUP NAME"
                        inputProps={{ maxLength: 20 }}
                        type="text"
                        {...field}
                        onChange={(e) => {
                          const cleaned = removeEmojis(e.target.value);
                          field.onChange(cleaned);
                        }}
                        error={!!error}
                        helperText={error ? error.message : null}
                      />
                    );
                  }}
                />
              </Grid>
              <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                <Controller
                  name="GroupType"
                  control={ControlGroup}
                  rules={{ required: "Group Type is Required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      name="DiscRel"
                      label="GROUP TYPE"
                      data={[
                        {
                          key: "C",
                          value: "Customer",
                        },
                        {
                          key: "V",
                          value: "Vendor",
                        },
                      ]}
                    />
                  )}
                />
              </Grid>

              <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                <Controller
                  name="PriceList"
                  control={ControlGroup}
                  rules={{ required: "Price List is Required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSearchSelectTextField
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      name="PriceList"
                      label="PRICE LIST"
                      data={priceList.map((item) => ({
                        key: item.DocEntry,
                        value: item.ListName,
                      }))}
                    />
                  )}
                />
              </Grid>

              <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                <Controller
                  name="DiscRel"
                  control={ControlGroup}
                  // rules={{ required: "Effective Discount Group is Required" }}
                  defaultValue="L"
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      name="DiscRel"
                      label="EFFECTIVE DISCOUNT GROUP"
                      data={[
                        {
                          key: "L",
                          value: "Lowest Discount",
                        },
                        {
                          key: "H",
                          value: "Highest Discount",
                        },
                        {
                          key: "A",
                          value: "Average",
                        },
                        {
                          key: "T",
                          value: "Total",
                        },
                        {
                          key: "M",
                          value: "Discount Multiples",
                        },
                      ]}
                    />
                  )}
                />
              </Grid>

              <Grid lg={4} item md={6} xs={12} textAlign={"center"}>
                <Controller
                  name="EffecPrice"
                  control={ControlGroup}
                  defaultValue="D"
                  // rules={{ required: "Effective Price is Required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      name="EffecPrice"
                      label="EFFECTIVE PRICE"
                      data={[
                        {
                          key: "D",
                          value: "Default Priority",
                        },
                        {
                          key: "L",
                          value: "Lowest Price ",
                        },
                        {
                          key: "H",
                          value: "Highest Price",
                        },
                      ]}
                    />
                  )}
                />
              </Grid>
            </Grid>
            {/* <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item md={6} xs={12} textAlign="center">
                    <Controller
                      name="UserName"
                      control={ControlGroup}
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
            onClick={() => setopenCreateGroupDialog(false)}
          >
            CANCEL
          </Button>
        </DialogActions>
      </Dialog>
      <DataGridCellClickModel
        open={openDatagridAcctCode}
        closeModel={() => setDatagridAcctCodeOpen(false)}
        isLoading={loading}
        title="Account List"
        getRowId={(row) => row.DocEntry}
        columns={DatagridAcctCodeList}
        rows={DatagridAcctCodeRows}
        taxCurrentPage={currentPage}
        limit={20}
        onPaginationModelChange={handlePaginationModelChange}
        onCellClick={(params) => {
          const targetField = getValuesAcctGeneral("selectedField");
          if (targetField) {
            setValueAcctGeneral(targetField, params.row.AcctCode); // Existing: Set code
            setValueAcctGeneral(`${targetField}Name`, params.row.AcctName); // Existing: Set name
            setValueAcctGeneral(`${targetField}Curr`, params.row.ActCurr); // NEW: Set currency (ActCurr from row)
          }
          setDatagridAcctCodeOpen(false);
        }}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        rowCount={rowCount}
        selectedRowIndex={getValuesAcctGeneral("selectedRowIndex")}
        oLines={[]}
      />

      {/*  ========================================================================================================================== */}
      <Grid container>
        <Dialog
          style={{ margin: "auto" }}
          open={openadd}
          onClose={handleAddClose}
          scroll="paper"
          component={"form"}
          onSubmit={handleSubmitFormAddressType(onsubmitAddressType)}
        >
          <DialogTitle>
            <Grid item display={"flex"} justifyContent={"center"}>
              <PersonAddAlt1OutlinedIcon />
              <Typography textAlign={"center"} fontWeight={"bold"}>
                &nbsp; &nbsp;ADDRESS
              </Typography>
            </Grid>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container justifyContent={"space-between"} spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="AddressType"
                  control={controlFormAddressType}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelectTextField
                      label="ADDRESS TYPE"
                      defaultValue="P"
                      data={
                        cardType === "V"
                          ? [
                              { key: "P", value: "PAY TO" },
                              { key: "S", value: "SHIP FROM" },
                            ]
                          : [
                              { key: "P", value: "BILL TO" },
                              { key: "S", value: "SHIP TO" },
                            ]
                      }
                      {...field}
                      error={!!error} // Pass error state to the FormComponent if needed
                      helperText={error ? error.message : null} // Show the validation message
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Address"
                  control={controlFormAddressType}
                  rules={{
                    required: "Address ID is required",
                    validate: (value) =>
                      value.trim() !== "" || "Address ID cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="ADDRESS ID"
                      type="text"
                      inputProps={{ maxLength: 50 }}
                      {...field}
                      disabled={saveUpdateButtonAddressType !== "SAVE"}
                      error={!!error}
                      helperText={error ? error.message : null}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Address1"
                  // rules={{
                  //   required: "Block is required",
                  // }}
                  control={controlFormAddressType}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="BLOCK"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Address2"
                  // rules={{
                  //   required: "Street is required",
                  // }}
                  control={controlFormAddressType}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="STREET"
                      type="text"
                      inputProps={{ maxLength: 50 }}
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
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="City"
                  // rules={{
                  //   required: "City is required",
                  // }}
                  control={controlFormAddressType}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="CITY"
                      type="text"
                      inputProps={{ maxLength: 100 }}
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
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Zipcode"
                  rules={{
                    // required: "Post Code is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Enter a valid 6-digit ZIP Code",
                    },
                  }}
                  control={controlFormAddressType}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      type="number"
                      name="Zipcode"
                      label="ZIP CODE"
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      rows={1}
                      inputProps={{
                        maxLength: 6,
                        onInput: (e) => {
                          if (e.target.value.length > 6) {
                            e.target.value = e.target.value.slice(0, 6);
                          }
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Country"
                  rules={{
                    required: "Country is required",
                  }}
                  control={controlFormAddressType}
                  render={({ field, fieldState: { error } }) => (
                    <InputSearchSelectTextField
                      {...field}
                      error={!!error}
                      // defaultValue="INDIA"
                      helperText={error ? error.message : null}
                      label="COUNTRY"
                      data={listofcountry.map((item) => ({
                        key: item.CountryCode,
                        value: item.CountryName,
                      }))}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="State"
                  // rules={{
                  //   required: "State is required",
                  // }}
                  control={controlFormAddressType}
                  render={({ field, fieldState: { error } }) => (
                    <InputSearchSelectTextField
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      label="STATE"
                      disabled={!AddressTypegetValues("Country")}
                      data={listofstate.map((item) => ({
                        key: item.Code,
                        value: item.Name,
                      }))}
                    />
                  )}
                />
              </Grid>

              {watch4("AddressType") === "S" && (
                <>
                  <Grid item xs={12} sm={6} md={6} lg={6} textAlign="center">
                    <Controller
                      name="GSTRegnNo"
                      control={controlFormAddressType}
                      rules={{
                        validate: (value) => {
                          if (
                            selectedGSTType !== "0" && // If selected type is not "Select Type"
                            (!value || value.trim() === "")
                          ) {
                            return "GSTIN field is required";
                          }
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputTextField
                          label="GSTIN"
                          type="text"
                          inputProps={{ maxLength: 15 }}
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

                  <Grid item xs={12} sm={6} md={6} lg={6} textAlign="center">
                    <Controller
                      name="GSTType"
                      control={controlFormAddressType}
                      defaultValue=""
                      render={({ field, fieldState: { error } }) => (
                        <ModelInputSelectTextField
                          {...field}
                          error={!!error}
                          helperText={error ? error.message : null}
                          label="GST Type"
                          // placeholder={"select GST Type"}
                          data={[
                            // { key: "0", value: "Select Type" },
                            { key: "1", value: "Regular/TDS/ISD" },
                            { key: "2", value: "Casual Taxable Person" },
                            { key: "3", value: "Composition Levy" },
                            { key: "4", value: "Government Department or PSU" },
                            { key: "5", value: "UN Agency or Embassy" },
                          ]}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="createDuplicate"
                  control={controlFormAddressType}
                  defaultValue={false}
                  // rules={{
                  //   required: "Please select Address Type",
                  // }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{
                            textAlign: "end",
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
                          // noWrap={true}
                          sx={{
                            fontFamily: "'Open Sans', sans-serif", // Apply font family here
                          }}
                        >
                          {Ship}
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Grid
              item
              px={2}
              xs={12}
              style={{
                display: "flex",
                justifyContent: "space-between",
                // alignItems: "end",
                position: "sticky",
                bottom: "0px",
              }}
            >
              <Grid>
                <Button variant="contained" color="success" type="submit">
                  {saveUpdateButtonAddressType}
                </Button>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleAddClose}
                >
                  Close
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      </Grid>

      <Grid container>
        <Dialog
          style={{ margin: "auto" }}
          open={open}
          onClose={handleClose}
          scroll="paper"
          component={"form"}
          onSubmit={handleSubmitFormContactPerson(onSubmitContactPerson)}
        >
          <DialogTitle>
            <Grid item display={"flex"} justifyContent={"center"}>
              <PersonAddAlt1OutlinedIcon />
              <Typography textAlign={"center"} fontWeight={"bold"}>
                &nbsp; &nbsp;CONTACT PERSON
              </Typography>
            </Grid>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container justifyContent={"space-between"} spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="CntctCode"
                  control={controlFormContactPerson}
                  rules={{
                    required: "Contact Id is required",
                    validate: (value) =>
                      value.trim() !== "" || "Contact Id cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="CONTACT ID"
                      type="text"
                      {...field}
                      inputProps={{ maxLength: 20 }}
                      error={!!error}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      disabled={saveUpdateButtonCP !== "SAVE"} // Disable field if it's not in "SAVE" mode
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="FirstName"
                  control={controlFormContactPerson}
                  // rules={{ required: "First Name is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="FIRST NAME"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="MiddleName"
                  control={controlFormContactPerson}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="MIDDLE NAME"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 50 }}
                      // error={!!error}
                      // helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="LastName"
                  control={controlFormContactPerson}
                  // rules={{ required: "Last Name is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="LAST NAME"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Title"
                  control={controlFormContactPerson}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="TITLE"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 10 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Position"
                  control={controlFormContactPerson}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="POSITION"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 90 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Address"
                  control={controlFormContactPerson}
                  // rules={{ required: "Address is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="ADDRESS"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Controller
                    name="Tel1"
                    control={controlFormContactPerson}
                    rules={{
                      required: "Telephone is required",
                      validate: (value) =>
                        value.trim() !== "" || "Telephone cannot be empty",
                    }}
                    defaultValue=""
                    render={({ field, fieldState: { error } }) => (
                      <PhoneNumberInput
                        defaultCountry="in"
                        label="TELEPHONE 1"
                        value={field.value}
                        onBlur={field.onBlur}
                        error={error}
                        inputProps={{ maxLength: 16 }}
                        onChange={(phone) => field.onChange(phone)}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Controller
                    name="Tel2"
                    control={controlFormContactPerson}
                    defaultValue=""
                    render={({ field }) => (
                      <PhoneNumberInput
                        defaultCountry="in"
                        label="TELEPHONE 2"
                        value={field.value}
                        inputProps={{ maxLength: 16 }}
                        onChange={(phone) => field.onChange(phone)}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Controller
                    name="Mobile"
                    control={controlFormContactPerson}
                    // rules={{ required: "Mobile Phone is required" }}
                    render={({ field, fieldState: { error } }) => (
                      <PhoneNumberInput
                        defaultCountry="in"
                        label="MOBILE PHONE"
                        value={field.value || ""}
                        onChange={(phone) => field.onChange(phone)}
                        onBlur={field.onBlur} // important
                        error={!!error}
                        helperText={error ? error.message : null}
                        required={false}
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Fax"
                  control={controlFormContactPerson}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="FAX"
                      type="text"
                      inputProps={{ maxLength: 20 }}
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Email"
                  control={controlFormContactPerson}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="E-MAIL"
                      type="email"
                      inputProps={{ maxLength: 100 }}
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
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Notes1"
                  control={controlFormContactPerson}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="REMARK"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 100 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
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
              }}
            >
              <Grid>
                <Button
                  variant="contained"
                  color="success"
                  type="submit"
                  // onClick={onSubmit}
                >
                  {saveUpdateButtonCP}
                </Button>
              </Grid>
              <Grid>
                <Button variant="contained" color="error" onClick={handleClose}>
                  Close
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      </Grid>

      <Grid container>
        <Dialog
          style={{ margin: "auto" }}
          open={openadd1}
          onClose={handleAddClose1}
          scroll="paper"
          component={"form"}
          onSubmit={handleSubmitFormAddBank(onsubmitAddBank)}
        >
          <DialogTitle>
            <Grid item display={"flex"} justifyContent={"center"}>
              <PersonAddAlt1OutlinedIcon />
              <Typography textAlign={"center"} fontWeight={"bold"}>
                &nbsp; &nbsp;ADD BANK ACCOUNT DETAILS
              </Typography>
            </Grid>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container justifyContent={"space-between"} spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="BankCode"
                  rules={{ required: "Bank Code is required" }}
                  control={controlFormAddBank}
                  render={({ field, fieldState: { error } }) => (
                    <InputSearchSelectTextField
                      {...field}
                      label="BANK CODE"
                      error={!!error}
                      helperText={error ? error.message : null}
                      data={bankCode.map((item) => ({
                        key: item.DocEntry,
                        value: item.BankCode,
                      }))}
                      onChange={async (e) => {
                        const selectedValue = e.target.value;

                        const selectedBank = bankCode.find(
                          (bank) => bank.DocEntry === selectedValue,
                        );
                        field.onChange(e);
                        if (selectedBank) {
                          setFormAddBankValue(
                            "BankName",
                            selectedBank.BankName || "",
                          );
                          setFormAddBankValue(
                            "Country",
                            selectedBank.CountryCode || "",
                          );
                        }
                        if (selectedBank.CountryCode) {
                          await ListofState(selectedBank.CountryCode);
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Bank Name Field */}
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="BankName"
                  // rules={{ required: "Bank Name is required" }}
                  control={controlFormAddBank}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="BANK NAME"
                      inputProps={{ maxLength: 250 }}
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : null}
                      rows={1}
                      disabled
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Country"
                  // rules={{
                  //   required: "Country is required",
                  // }}
                  control={controlFormAddBank}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="COUNTRY/REGION"
                      {...field}
                      error={!!error}
                      inputProps={{ maxLength: 3 }}
                      helperText={error ? error.message : null}
                      rows={1}
                      disabled
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Account"
                  rules={{
                    required: "Account no is required",
                    validate: (value) =>
                      value.trim() !== "" || "Account no cannot be empty",
                  }}
                  control={controlFormAddBank}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="ACCOUNT NO."
                      type="text"
                      inputProps={{ maxLength: 15 }}
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      disabled={saveUpdateButtonAB === "UPDATE"}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="AcctName"
                  // rules={{
                  //   required: "Account Name is required",
                  // }}
                  control={controlFormAddBank}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="BANK ACCOUNT NAME"
                      inputProps={{ maxLength: 250 }}
                      type="text"
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
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="Branch"
                  control={controlFormAddBank}
                  rules={{
                    required: "Branch is required",
                    validate: (value) =>
                      value.trim() !== "" || "Branch cannot be empty",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="BRANCH"
                      type="text"
                      inputProps={{ maxLength: 50 }}
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
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="SwiftNum"
                  control={controlFormAddBank}
                  rules={{ required: "required BIC/SWIFT CODE" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="BIC/SWIFT CODE"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      inputProps={{ maxLength: 50 }}
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="IBAN"
                  control={controlFormAddBank}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="IBAN"
                      type="text"
                      inputProps={{ maxLength: 50 }}
                      {...field}
                      onChange={(e) => {
                        const cleanedValue = removeEmojis(e.target.value);
                        field.onChange(cleanedValue);
                      }}
                      // error={!!error}
                      // helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="ControlKey"
                  control={controlFormAddBank}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="CTR/INT ID"
                      type="text"
                      inputProps={{ maxLength: 2 }}
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
              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="MandateID"
                  control={controlFormAddBank}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="MANDATE ID"
                      inputProps={{ maxLength: 35 }}
                      type="text"
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

              <Grid item xs={12} sm={6} md={6} lg={6} textAlign={"center"}>
                <Controller
                  name="SignDate"
                  control={controlFormAddBank}
                  defaultValue={dayjs().toISOString()} // Set today's date as default value
                  render={({ field, fieldState: { error } }) => (
                    <InputDatePickerField
                      label="DATE OF SIGNATURE"
                      name={field.name}
                      value={field.value ? dayjs(field.value) : dayjs()} // Show today's date if no value
                      onChange={(date) =>
                        field.onChange(date ? date.toISOString() : undefined)
                      } // Update the value on change
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
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
              }}
            >
              <Grid>
                <Button variant="contained" color="success" type="submit">
                  {saveUpdateButtonAB}
                </Button>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleAddClose1}
                >
                  Close
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      </Grid>

      {/*  ========================================================================================================================== */}

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
        component={"form"}
        onSubmit={handleSubmitBP(handleSubmitFormBP)}
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
          width="100%"
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
              Business Partner
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
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
              >
                {" "}
                <Paper
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                    borderRadius: "12px",
                  }}
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
                        name="Series"
                        control={controlFormBP}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            label="SERIES"
                            data={[
                              { key: "0", value: "MANUAL" },

                              ...(seriesdata || []).map((item) => ({
                                key: item.SeriesId,
                                value: item.SeriesName,
                              })),
                            ]}
                            disabled={saveUpdateNameBP === "UPDATE"}
                            {...field}
                            onChange={(e) => {
                              const selectedSeries = e.target.value;
                              field.onChange(selectedSeries);
                              setFormBPValue("Series", selectedSeries);

                              if (selectedSeries !== "0") {
                                const seriesData = seriesdata.find(
                                  (item) => item.SeriesId === selectedSeries,
                                );
                                setFormBPValue(
                                  "CardCode",
                                  seriesdata[0]?.DocNum || "",
                                );
                                setFormBPValue(
                                  "SeriesName",
                                  seriesData?.SeriesName || "",
                                );
                                clearFormBPError("CardCode");
                              } else {
                                setFormBPValue("DocNum", "");
                                setFormBPValue("CardCode", ""); // Clear SeriesName immediately
                                setFormBPValue("SeriesName", "");
                                clearFormBPError("CardCode");
                              }
                            }}
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
                      <Controller
                        name="CardCode"
                        control={controlFormBP}
                        rules={{
                          validate: (value) => {
                            if (watch("Series") === "0") {
                              if (value.trim() === "") {
                                return "Code cannot be empty";
                              }
                            }
                            return true;
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="CODE"
                            {...field}
                            disabled={!!DocEntry}
                            readOnly={watchSeries !== "0"}
                            // value={watchSeries === "0" ? field.value : ""}
                            inputProps={{ maxLength: 15 }}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            rows={1}
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
                      <Controller
                        name="CardName"
                        rules={{
                          required: "Name is required",
                          validate: (value) =>
                            value.trim() !== "" || "Name cannot be empty",
                        }}
                        control={controlFormBP}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="NAME"
                            {...field}
                            error={!!error}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            inputProps={{ maxLength: 100 }}
                            helperText={error ? error.message : null}
                            rows={1}
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
                        name="CardFName"
                        // rules={{ required: "this field is requered" }}
                        control={controlFormBP}
                        render={({ field, fieldState: { error } }) => (
                          <InputTextField
                            label="FOREIGN NAME"
                            {...field}
                            onChange={(e) => {
                              const cleanedValue = removeEmojis(e.target.value);
                              field.onChange(cleanedValue);
                            }}
                            error={!!error}
                            inputProps={{ maxLength: 100 }}
                            helperText={error ? error.message : null}
                            rows={1}
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
                        name="CardType"
                        control={controlFormBP}
                        rules={{ required: "Card Type is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <InputSelectTextField
                            {...field}
                            readOnly={!!DocEntry}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="CARD TYPE"
                            onChange={(e) => {
                              const newValue = e.target.value;
                              field.onChange(e);
                              const fieldsToClear = [
                                "DebPayAcct",
                                "DebPayAcctName",
                                "DpmClear",
                                "DpmClearName",
                                "DpmIntAct",
                                "DpmIntActName",
                                "DpmDppAct",
                                "DpmDppActName",
                                "DpmOpnDebAct",
                                "DpmOpnDebActName",
                              ];

                              fieldsToClear.forEach((f) =>
                                setValueAcctGeneral(f, ""),
                              );
                              fetchGetListData(
                                0,
                                "",
                                newValue,
                                selectedCurrency,
                              );
                            }}
                            data={[
                              { key: "V", value: "VENDOR" },
                              { key: "C", value: "CUSTOMER" },
                              { key: "L", value: "LEAD" },
                            ]}
                          />
                        )}
                      />
                    </Grid>

                    {/* <Grid item lg={4} md={6} xs={12} textAlign={"center"}>
                      <Controller
                        name="GroupCode"
                        control={controlFormBP}
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            {...field}
                            error={!!error}
                            defaultValue={
                              customergroup.length > 0
                                ? customergroup[0].DocEntry
                                : ""
                            }
                            helperText={error ? error.message : null}
                            label=" GROUP"
                            data={customergroup.map((item) => ({
                              key: item.DocEntry,
                              value: item.GroupName,
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
                          name="GroupCode"
                          control={controlFormBP}
                          render={({ field, fieldState: { error } }) => (
                            <InputSearchableSelect
                              {...field}
                              label="GROUP"
                              error={!!error}
                              defaultValue={
                                customergroup.length > 0
                                  ? customergroup[0].DocEntry
                                  : ""
                              }
                              helperText={error?.message}
                              data={customergroup.map((item) => ({
                                key: item.DocEntry,
                                value: item.GroupName,
                              }))}
                            />
                          )}
                        />

                        {/* OUTSIDE ICON */}
                        <IconButton
                          onClick={() => setopenCreateGroupDialog(true)}
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
                    {/* <Grid
                      item
                      lg={4}
                      md={6}
                      sm={6}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="Currency"
                        control={controlFormBP}
                        rules={{ required: "Currency is requered" }}
                        // defaultValue={companyData.MainCurncy}
                        render={({ field, fieldState: { error } }) => (
                          <InputSearchSelectTextField
                            {...field}
                            error={!!error}
                            helperText={error ? error.message : null}
                            label="CURRENCY"
                            inputProps={{ maxLength: 3 }}
                            data={[
                              {
                                key: "AC",
                                value: "All Currency",
                              },
                              ...currencydata.map((item) => ({
                                key: item.CurrCode,
                                value: item.CurrName,
                              })),
                            ]}
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
                          name="Currency"
                          control={controlFormBP}
                          render={({ field, fieldState: { error } }) => (
                            <InputSearchableSelect
                              {...field}
                              label="CURRENCY"
                              error={!!error}
                              helperText={error?.message}
                              data={[
                                {
                                  key: "AC",
                                  value: "All Currency",
                                },
                                ...currencydata.map((item) => ({
                                  key: item.CurrCode,
                                  value: item.CurrName,
                                })),
                              ]}
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
                      xs={12}
                      textAlign={"center"}
                    ></Grid>
                  </Grid>
                </Paper>
                <Paper
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)", // dark shadow all sides
                    borderRadius: "12px",
                  }}
                >
                  <Box sx={{ bgcolor: "background.paper", width: "100%" }}>
                    <AppBar
                      position="static"
                      sx={{ backgroundColor: "transparent", boxShadow: "none" }}
                    >
                      <TabContext value={value}>
                        <Tabs
                          value={value}
                          onChange={handleChange}
                          // indicatorColor="black"
                          // textColor="grey"
                          variant="scrollable"
                          scrollButtons="auto"
                          allowScrollButtonsMobile
                          aria-label="scrollable auto tabs example"
                        >
                          <Tab
                            value="0"
                            label="General "
                            sx={{ flex: 0.5, fontWeight: "bold" }}
                          />
                          <Tab
                            value="1"
                            label="Contact Person"
                            sx={{ flex: 1, fontWeight: "bold" }}
                          />
                          <Tab
                            value="2"
                            label="Address"
                            sx={{ flex: 0.5, fontWeight: "bold" }}
                          />
                          <Tab
                            value="3"
                            label="Payment Terms"
                            sx={{ flex: 1, fontWeight: "bold" }}
                          />
                          <Tab
                            value="4"
                            label="Accounting"
                            sx={{ flex: 1, fontWeight: "bold" }}
                          />
                          <Tab
                            value="5"
                            label="Attachment"
                            sx={{ flex: 0.5, fontWeight: "bold" }}
                          />
                          <Tab
                            value="6"
                            label="Remarks"
                            sx={{ flex: 0.5, fontWeight: "bold" }}
                          />
                        </Tabs>
                        {/* <Tabs
  value={value}
  onChange={handleChange}
  variant="scrollable"
  scrollButtons="auto"
  allowScrollButtonsMobile
>
  <Tab
    value="0"
    label="General"
    icon={<InfoIcon />}
    iconPosition="start"
    sx={{ fontWeight: "bold" }}
  />

  <Tab
    value="1"
    label="Contact Person"
    icon={<PersonIcon />}
    iconPosition="start"
    sx={{ fontWeight: "bold" }}
  />

  <Tab
    value="2"
    label="Address"
    icon={<LocationOnIcon />}
    iconPosition="start"
    sx={{ fontWeight: "bold" }}
  />

  <Tab
    value="3"
    label="Payment Terms"
    icon={<PaymentsIcon />}
    iconPosition="start"
    sx={{ fontWeight: "bold" }}
  />

  <Tab
    value="4"
    label="Accounting"
    icon={<AccountBalanceIcon />}
    iconPosition="start"
    sx={{ fontWeight: "bold" }}
  />

  <Tab
    value="5"
    label="Attachment"
    icon={<AttachFileIcon />}
    iconPosition="start"
    sx={{ fontWeight: "bold" }}
  />

  <Tab
    value="6"
    label="Remarks"
    icon={<CommentIcon />}
    iconPosition="start"
    sx={{ fontWeight: "bold" }}
  />
</Tabs> */}
                        <TabPanel value={"0"}>
                          <Box
                            // component="form"
                            sx={{
                              "& .MuiTextField-root": { m: 1 },
                            }}
                            noValidate
                            autoComplete="off"
                          >
                            <Grid container>
                              <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Box
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <Controller
                                    name="PhoneNumber1"
                                    control={controlFormBP}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <PhoneNumberInput
                                        resetFlag={DocEntry} // This now drives the key
                                        label="TEL 1"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        error={!!error}
                                        helperText={error?.message}
                                        defaultCountry="in"
                                      />
                                    )}
                                  />
                                </Box>
                              </Grid>

                              <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                {" "}
                                <Box
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <Controller
                                    name="PhoneNumber2"
                                    // rules={{ required: "this field is required" }} // Uncomment if needed
                                    control={controlFormBP}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <PhoneNumberInput
                                        resetFlag={DocEntry} // ⚡ Add this for remount on data load
                                        defaultCountry="in"
                                        label="TEL 2"
                                        value={field.value || ""} // Explicitly pass with fallback
                                        onChange={field.onChange} // Use field's onChange directly (no wrapper needed)
                                        inputProps={{
                                          maxLength: 16, // Keep if desired, but library handles length
                                        }}
                                        error={!!error}
                                        helperText={error?.message} // Use optional chaining for safety
                                      />
                                    )}
                                  />
                                </Box>
                              </Grid>

                              <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                {" "}
                                <Box
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <Controller
                                    name="Cellular"
                                    // rules={{ required: "Phone No is required" }} // Uncomment if needed
                                    control={controlFormBP}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <PhoneNumberInput
                                        resetFlag={DocEntry} // ⚡ Add this for remount on data load
                                        defaultCountry="in"
                                        label="MOBILE PHONE"
                                        value={field.value || ""} // Explicitly pass with fallback (was already close)
                                        onChange={field.onChange} // Use field's onChange directly
                                        inputProps={{
                                          maxLength: 16, // Keep if desired
                                        }}
                                        error={!!error}
                                        helperText={error?.message} // Use optional chaining
                                      />
                                    )}
                                  />
                                </Box>
                              </Grid>

                              <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="Fax"
                                  // rules={{ required: "this field is requered" }}
                                  control={controlFormBP}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="FAX"
                                      {...field}
                                      onChange={(e) => {
                                        const cleanedValue = removeEmojis(
                                          e.target.value,
                                        );
                                        field.onChange(cleanedValue);
                                      }}
                                      error={!!error}
                                      inputProps={{ maxLength: 20 }}
                                      helperText={error ? error.message : null}
                                      rows={1}
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
                              >
                                <Controller
                                  name="Email"
                                  // rules={{ required: "this field is requered" }}
                                  control={controlFormBP}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="EMAIL"
                                      type="email"
                                      {...field}
                                      onChange={(e) => {
                                        const cleanedValue = removeEmojis(
                                          e.target.value,
                                        );
                                        field.onChange(cleanedValue);
                                      }}
                                      error={!!error}
                                      inputProps={{ maxLength: 50 }}
                                      helperText={error ? error.message : null}
                                      rows={1}
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
                              >
                                <Controller
                                  name="ShipType"
                                  control={controlFormBP}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSearchSelectTextField
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      label="SHIPPING TYPE"
                                      data={shippindata.map((item) => ({
                                        key: item.DocEntry,
                                        value: item.TrnspName,
                                      }))}
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
                              >
                                <Controller
                                  name="ValidFrom"
                                  control={controlFormBP}
                                  render={({ field }) => (
                                    <SelectedDatePickerField
                                      label="FROM DATE"
                                      name={field.name}
                                      value={FromDate || null} // Pass null if FromDate is not set
                                      onChange={(date) => {
                                        setFromDate(date);
                                        setToDate(null); // Reset due date when start date changes
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
                              >
                                <Controller
                                  name="ValidTo"
                                  control={controlFormBP}
                                  // rules={{
                                  //   required: "To date is required",
                                  // }}
                                  render={({ field }) => (
                                    <SelectedDatePickerField
                                      label="TO DATE"
                                      name={field.name}
                                      value={ToDate || null} // Pass null if ToDate is not set
                                      minDate={FromDate} // Ensure the "To Date" is not earlier than "From Date"
                                      onChange={(date) => setToDate(date)}
                                      disabled={!FromDate} // Disable the "To Date" field if "From Date" is not selected
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
                              >
                                <Controller
                                  name="Status"
                                  control={controlFormBP}
                                  defaultValue="0"
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          textAlign={"center"}
                                          {...field}
                                          checked={field.value === "1"}
                                          onChange={(e) => {
                                            const newValueStatus = e.target
                                              .checked
                                              ? "1"
                                              : "0";
                                            field.onChange(newValueStatus);
                                            setFormBPValue(
                                              "Active",
                                              newValueStatus,
                                            );
                                          }}
                                        />
                                      }
                                      label="Active"
                                      sx={{ color: "black" }}
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
                              >
                                <Controller
                                  name="ValidComm"
                                  // rules={{ required: "this field is required" }}
                                  control={controlFormBP}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputTextAreaFields
                                      label="REMARKS"
                                      type="text"
                                      {...field}
                                      onChange={(e) => {
                                        const cleanedValue = removeEmojis(
                                          e.target.value,
                                        );
                                        field.onChange(cleanedValue);
                                      }}
                                      inputProps={{ maxLength: 30 }}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>

                              {/* --------------------------------------------------------------------- */}
                            </Grid>
                          </Box>
                        </TabPanel>

                        <TabPanel value={"1"}>
                          <Button
                            color="success"
                            variant="contained"
                            onClick={handleOpen}
                            // disabled={allFormData.CardCode === ""}
                            sx={{
                              ml: 2,
                            }}
                          >
                            ADD CONTACT
                          </Button>

                          <Grid
                            container
                            item
                            mt={2}
                            sx={{
                              px: 2,
                              overflow: "auto",
                              width: "100%",
                              // backgroundColor: "#f2f2f2",
                              // height: "100%",
                            }}
                          >
                            <Paper sx={{ width: "100%", height: "40vh" }}>
                              <DataGrid
                                columnHeaderHeight={35}
                                rowHeight={45}
                                className="datagrid-style"
                                sx={{
                                  backgroundColor:
                                    theme.palette.mode === "light"
                                      ? "#fff"
                                      : "#373842",
                                  "& .MuiDataGrid-cell": {
                                    border: "none",
                                  },
                                  "& .MuiDataGrid-cell:focus": {
                                    outline: "none",
                                  },
                                }}
                                rows={contactper.map((data, i) => ({
                                  ...data,
                                  id: data.CntctCode,
                                }))}
                                columns={columns}
                                hideFooter
                                initialState={{
                                  pagination: {
                                    paginationModel: {
                                      pageSize: 10,
                                    },
                                  },
                                }}
                                pageSizeOptions={[3]}
                              />
                            </Paper>
                          </Grid>
                        </TabPanel>

                        <TabPanel value={"2"}>
                          <Button
                            color="success"
                            variant="contained"
                            onClick={handleAddOpen}
                            sx={{
                              ml: 2,
                            }}
                          >
                            Address Type
                          </Button>

                          <Grid
                            container
                            item
                            mt={2}
                            sx={{
                              px: 2,
                              overflow: "auto",
                              width: "100%",
                              // backgroundColor: "#f2f2f2",
                              // height: "100%",
                            }}
                          >
                            <Paper sx={{ width: "100%", height: "40vh" }}>
                              <DataGrid
                                columnHeaderHeight={35}
                                rowHeight={45}
                                className="datagrid-style"
                                sx={{
                                  backgroundColor:
                                    theme.palette.mode === "light"
                                      ? "#fff"
                                      : "#373842",
                                  "& .MuiDataGrid-cell": {
                                    border: "none",
                                  },
                                  "& .MuiDataGrid-cell:focus": {
                                    outline: "none",
                                  },
                                }}
                                hideFooter
                                rows={addressType.map((data, i) => ({
                                  ...data,
                                  id: i,
                                }))}
                                columns={addresscol}
                                initialState={{
                                  pagination: {
                                    paginationModel: {
                                      pageSize: 10,
                                    },
                                  },
                                }}
                                pageSizeOptions={[3]}
                              />
                            </Paper>
                          </Grid>
                        </TabPanel>

                        <TabPanel value={"3"}>
                          <Box
                            // component="form"
                            sx={{
                              "& .MuiTextField-root": { m: 1 },
                            }}
                            noValidate
                            autoComplete="off"
                          >
                            {/* --------------Payment Terms------------------------- */}
                            <Grid container mb={2}>
                              <Grid
                                item
                                lg={12}
                                md={12}
                                xs={12}
                                textAlign={"center"}
                                style={{
                                  color:
                                    theme.palette.mode === "light"
                                      ? "#080D2B"
                                      : "#F5F6FA",
                                }}
                                mb={1}
                              >
                                <Typography sx={{ fontWeight: "bold" }}>
                                  Payment Terms
                                </Typography>
                              </Grid>
                              <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="GroupNum"
                                  // rules={{ required: "this field is required" }}
                                  control={controlFormBP}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSearchSelectTextField
                                      label="PAYMENT TERMS"
                                      type="text"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      data={paymentTerms.map((item) => ({
                                        key: item.DocEntry,
                                        value: item.PymntGroup,
                                      }))}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        updatePriceList(e.target.value); // ✅ correct
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
                              >
                                <Controller
                                  name="IntrstRate"
                                  control={controlFormBP}
                                  render={({
                                    field: { onChange, value, ...field },
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="INTEREST ON ARREARS %"
                                      type="text"
                                      inputProps={{
                                        maxLength: 6, // enough for "100.00"
                                      }}
                                      value={value}
                                      onChange={(e) => {
                                        let inputValue = e.target.value;

                                        // Allow only numbers and a single dot
                                        if (!/^\d*\.?\d*$/.test(inputValue))
                                          return;

                                        // Convert to number and restrict between 0 and 100
                                        const numericValue =
                                          parseFloat(inputValue);
                                        if (numericValue > 100) return;
                                        if (numericValue < 0) return;

                                        onChange(inputValue);
                                      }}
                                      {...field}
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
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="ListNum"
                                  // rules={{ required: "this field is required" }}
                                  control={controlFormBP}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSearchSelectTextField
                                      label="PRICE LIST"
                                      type="number"
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                      data={priceList.map((item) => ({
                                        key: item.DocEntry,
                                        value: item.ListName,
                                      }))}
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
                              >
                                <Controller
                                  name="Discount"
                                  control={controlFormBP}
                                  render={({
                                    field: { onChange, value, ...field },
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="TOTAL DISCOUNT %"
                                      type="text"
                                      inputProps={{
                                        maxLength: 6, // enough for "100.00"
                                      }}
                                      value={value}
                                      onChange={(e) => {
                                        let inputValue = e.target.value;

                                        // Allow only numbers and a single dot
                                        if (!/^\d*\.?\d*$/.test(inputValue))
                                          return;

                                        // Convert to number and restrict between 0 and 100
                                        const numericValue =
                                          parseFloat(inputValue);
                                        if (numericValue > 100) return;
                                        if (numericValue < 0) return;

                                        onChange(inputValue);
                                      }}
                                      {...field}
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
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="CreditLine"
                                  // rules={{ required: "this field is required" }}
                                  control={controlFormBP}
                                  render={({
                                    field: { onChange, value, ...field },
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="CREDIT LIMIT"
                                      type="text"
                                      inputProps={{
                                        maxLength: 15,
                                      }}
                                      value={value}
                                      onChange={(e) => {
                                        let inputValue = e.target.value;
                                        if (!/^\d*\.?\d*$/.test(inputValue)) {
                                          return;
                                        }

                                        onChange(inputValue);
                                      }}
                                      {...field}
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
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="DebtLine"
                                  // rules={{ required: "this field is required" }}
                                  control={controlFormBP}
                                  render={({
                                    field: { onChange, value, ...field },
                                    fieldState: { error },
                                  }) => (
                                    <InputTextField
                                      label="COMMITMENT LIMIT"
                                      type="text"
                                      inputProps={{
                                        maxLength: 15,
                                      }}
                                      value={value}
                                      onChange={(e) => {
                                        let inputValue = e.target.value;
                                        if (!/^\d*\.?\d*$/.test(inputValue)) {
                                          return;
                                        }

                                        onChange(inputValue);
                                      }}
                                      {...field}
                                      error={!!error}
                                      helperText={error ? error.message : null}
                                    />
                                  )}
                                />
                              </Grid>

                              {/* <Grid
                                item
                                lg={4}
                                md={6}
                                xs={12}
                                textAlign={"center"}
                              >
                                <Controller
                                  name="AutoPost"
                                  // rules={{ required: "this field is required" }}
                                  control={controlFormBP}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <InputSelectTextField
                                      label="AUTOMATIC POSTING"
                                      type="text"
                                      name="AutoPost"
                                      {...field}
                                      error={!!error}
                                      defaultValue="1"
                                      helperText={error ? error.message : null}
                                      data={[
                                        { key: "1", value: "NO" },
                                        { key: "2", value: "INTEREST AND FEE" },
                                        { key: "3", value: "INTEREST ONLY" },
                                        { key: "4", value: "FEE ONLY" },
                                      ]}
                                    />
                                  )}
                                />
                              </Grid> */}
                            </Grid>

                            <Divider sx={{ border: "1px solid grey" }} />

                            {/* --------------Business Partner Bank------------------------- */}
                            <Grid container mt={2}>
                              <Grid
                                item
                                lg={12}
                                md={12}
                                xs={12}
                                textAlign={"center"}
                                style={{
                                  color:
                                    theme.palette.mode === "light"
                                      ? "#080D2B"
                                      : "#F5F6FA",
                                }}
                                mb={1}
                              >
                                <Typography sx={{ fontWeight: "bold" }}>
                                  Business Partner Bank
                                </Typography>
                              </Grid>

                              {/* ----------------------------------------------------------------------------------------------------------------------- */}
                              <Button
                                color="success"
                                variant="contained"
                                onClick={handleAddOpen1}
                                sx={{
                                  ml: "15px",
                                }}
                              >
                                Add Bank
                              </Button>
                              {/* ----------------------------------------------------------------------------------------------------------------------- */}

                              <Grid
                                container
                                item
                                mt={2}
                                sx={{
                                  px: 2,
                                  overflow: "auto",
                                  width: "100%",
                                  // height: "200px",
                                  marginY: "25px",
                                }}
                              >
                                <Paper sx={{ width: "100%", height: "40vh" }}>
                                  <DataGrid
                                    columnHeaderHeight={35}
                                    className="datagrid-style"
                                    sx={{
                                      backgroundColor:
                                        theme.palette.mode === "light"
                                          ? "#fff"
                                          : "#373842",
                                      "& .MuiDataGrid-cell": {
                                        border: "none",
                                      },
                                      "& .MuiDataGrid-cell:focus": {
                                        outline: "none",
                                      },
                                    }}
                                    hideFooter
                                    rows={addBank.map((data, i) => ({
                                      ...data,
                                      id: data.id || `${data.BankCode}-${i}`, // Ensure that the id is unique
                                    }))}
                                    columns={addBankCol}
                                    getRowId={(row) => row.id} // Ensure that getRowId refers to the unique 'id'
                                    initialState={{
                                      pagination: {
                                        paginationModel: {
                                          pageSize: 10,
                                        },
                                      },
                                    }}
                                    pageSizeOptions={[3]}
                                  />
                                </Paper>
                              </Grid>
                            </Grid>
                          </Box>
                        </TabPanel>
                        <TabPanel value={"4"}>
                          {/* Nested TabContext for Accounting */}
                          <TabContext value={accountingTab}>
                            {/* Sub Tabs */}
                            <Tabs
                              value={accountingTab}
                              onChange={(e, newValue) =>
                                setAccountingTab(newValue)
                              }
                              variant="scrollable"
                              scrollButtons="auto"
                              allowScrollButtonsMobile
                            >
                              <Tab
                                value="a1"
                                label="General"
                                sx={{ fontWeight: "bold" }}
                              />
                              <Tab
                                value="a2"
                                label="Tax"
                                sx={{ fontWeight: "bold" }}
                              />
                            </Tabs>

                            <TabPanel value="a1">
                              <Grid container>
                                <Grid
                                  item
                                  lg={6}
                                  md={6}
                                  xs={12}
                                  textAlign={"left"}
                                >
                                  <Controller
                                    name="FatherCard"
                                    // rules={{ required: "Customer Code is required" }}
                                    control={controlFormAccountGeneral}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextSearchButton
                                        label="CONSOLIDATING BP"
                                        readOnly={true}
                                        disabled={!!DocEntry}
                                        onClick={(e) => {
                                          OpenConsolidatingBP();
                                        }}
                                        type="text"
                                        {...field}
                                        inputProps={{ maxLength: 15 }}
                                        error={!!error} // Pass error state to the FormComponent if needed
                                        helperText={
                                          error ? error.message : null
                                        } // Show the validation message
                                      />
                                    )}
                                  />
                                  <SearchModel
                                    open={isDialogOpen}
                                    onClose={handleCloseDialog}
                                    onCancel={handleCloseDialog}
                                    title="Select CUSTOMER/Supplier"
                                    onChange={(e) =>
                                      handleGetListSearch(e.target.value)
                                    }
                                    value={getListquery}
                                    // readOnly={true}
                                    // disabled={!!DocEntry}
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
                                              // key={index}
                                              key={item.DocEntry}
                                              title={item.CardCode}
                                              subtitle={item.CardName}
                                              description={item.Cellular}
                                              searchResult={getListquery}
                                              onClick={() => {
                                                onSelectBusinessPartner(
                                                  item.DocEntry,
                                                );
                                              }}
                                            />
                                          ))}
                                        </InfiniteScroll>
                                      </>
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  lg={6}
                                  md={6}
                                  xs={12}
                                  textAlign="left"
                                >
                                  <Controller
                                    name="FatherType"
                                    control={controlFormAccountGeneral}
                                    render={({ field }) => (
                                      <FormControl
                                        component="fieldset"
                                        sx={{ width: "100%" }}
                                      >
                                        <RadioGroup
                                          row
                                          {...field}
                                          value={field.value || ""} // ensure controlled
                                          onChange={(e) =>
                                            field.onChange(e.target.value)
                                          }
                                        >
                                          <FormControlLabel
                                            value="P"
                                            control={<Radio />}
                                            label="Payment Consolidation"
                                            sx={{ color: "gray" }}
                                          />
                                          <FormControlLabel
                                            value="D"
                                            control={<Radio />}
                                            label="Delivery Consolidation"
                                            sx={{ color: "gray" }}
                                          />
                                        </RadioGroup>
                                      </FormControl>
                                    )}
                                  />
                                </Grid>
                                {/* HEADER after radio buttons */}
                                <Grid item xs={12}>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mb={1} // margin bottom
                                    mt={2} // margin top
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 700,
                                        color: "gray",
                                        mr: 2, // spacing between text and divider
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Control Accounts
                                    </Typography>
                                    <Box
                                      flex={1}
                                      height="1px"
                                      bgcolor="grey.400"
                                    />
                                  </Box>
                                </Grid>

                                {cardType === "V" && (
                                  <AccountField
                                    name="DpmDppAct"
                                    label="DOWN PAYMENT PAYABLE"
                                    watchName="DpmDppActName"
                                    control={controlFormAccountGeneral}
                                    setValueAcctGeneral={setValueAcctGeneral}
                                    setDatagridAcctCodeOpen={
                                      setDatagridAcctCodeOpen
                                    }
                                    watchAccountGeneral={watchAccountGeneral}
                                    accountsCache={accountsCache} // ✅ pass cache
                                    setDatagridAcctCodeRows={
                                      setDatagridAcctCodeRows
                                    }
                                  />
                                )}

                                {cardType === "C" && (
                                  <AccountField
                                    name="DpmDppAct"
                                    watchName="DpmDppActName"
                                    label="DOWN PAYMENT RECEIVABLE"
                                    title="DOWN PAYMENT RECEIVABLE"
                                    control={controlFormAccountGeneral}
                                    setValueAcctGeneral={setValueAcctGeneral}
                                    setDatagridAcctCodeOpen={
                                      setDatagridAcctCodeOpen
                                    }
                                    watchAccountGeneral={watchAccountGeneral}
                                    accountsCache={accountsCache} // ✅ pass cache
                                    setDatagridAcctCodeRows={
                                      setDatagridAcctCodeRows
                                    }
                                  />
                                )}

                                <AccountField
                                  name="DpmOpnDebAct"
                                  label="OPEN DEBTS"
                                  watchName="DpmOpnDebActName"
                                  control={controlFormAccountGeneral}
                                  setValueAcctGeneral={setValueAcctGeneral}
                                  setDatagridAcctCodeOpen={
                                    setDatagridAcctCodeOpen
                                  }
                                  watchAccountGeneral={watchAccountGeneral}
                                  accountsCache={accountsCache} // ✅ pass cache
                                  setDatagridAcctCodeRows={
                                    setDatagridAcctCodeRows
                                  }
                                />

                                {cardType === "C" && (
                                  <AccountField
                                    name="DebPayAcct"
                                    label="ACCOUNTS RECEIVABLE"
                                    title="ACCOUNTS RECEIVABLE"
                                    watchName="DebPayAcctName"
                                    control={controlFormAccountGeneral}
                                    setValueAcctGeneral={setValueAcctGeneral}
                                    setDatagridAcctCodeOpen={
                                      setDatagridAcctCodeOpen
                                    }
                                    watchAccountGeneral={watchAccountGeneral}
                                    accountsCache={accountsCache} // ✅ pass cache
                                    setDatagridAcctCodeRows={
                                      setDatagridAcctCodeRows
                                    }
                                  />
                                )}

                                {cardType === "V" && (
                                  <AccountField
                                    name="DebPayAcct"
                                    label="ACCOUNTS PAYABLE"
                                    watchName="DebPayAcctName"
                                    control={controlFormAccountGeneral}
                                    setValueAcctGeneral={setValueAcctGeneral}
                                    setDatagridAcctCodeOpen={
                                      setDatagridAcctCodeOpen
                                    }
                                    watchAccountGeneral={watchAccountGeneral}
                                    accountsCache={accountsCache} // ✅ pass cache
                                    setDatagridAcctCodeRows={
                                      setDatagridAcctCodeRows
                                    }
                                  />
                                )}

                                <AccountField
                                  name="DpmClear"
                                  label="DOWN PAYMENT CLEARING ACCOUNT"
                                  title="DOWN PAYMENT CLEARING ACCOUNT"
                                  watchName="DpmClearName"
                                  control={controlFormAccountGeneral}
                                  setValueAcctGeneral={setValueAcctGeneral}
                                  setDatagridAcctCodeOpen={
                                    setDatagridAcctCodeOpen
                                  }
                                  watchAccountGeneral={watchAccountGeneral}
                                  accountsCache={accountsCache} // ✅ pass cache
                                  setDatagridAcctCodeRows={
                                    setDatagridAcctCodeRows
                                  }
                                />

                                <AccountField
                                  name="DpmIntAct"
                                  label="DOWN PAYMENT INTERIM ACCOUNT"
                                  title="DOWN PAYMENT INTERIM ACCOUNT"
                                  watchName="DpmIntActName"
                                  control={controlFormAccountGeneral}
                                  setValueAcctGeneral={setValueAcctGeneral}
                                  setDatagridAcctCodeOpen={
                                    setDatagridAcctCodeOpen
                                  }
                                  watchAccountGeneral={watchAccountGeneral}
                                  accountsCache={accountsCache} // ✅ pass cache
                                  setDatagridAcctCodeRows={
                                    setDatagridAcctCodeRows
                                  }
                                />
                                {cardType === "C" && (
                                  <Grid
                                    item
                                    lg={4}
                                    md={6}
                                    xs={12}
                                    textAlign={"left"}
                                  >
                                    <Controller
                                      name="UseShpdGd"
                                      control={controlFormAccountGeneral}
                                      render={({ field }) => (
                                        <FormControlLabel
                                          sx={{ color: "gray" }}
                                          control={
                                            <Checkbox
                                              {...field}
                                              checked={field.value || false}
                                              onChange={(e) => {
                                                field.onChange(
                                                  e.target.checked,
                                                );
                                              }}
                                            />
                                          }
                                          label="Use Shipped Goods A/C"
                                        />
                                      )}
                                    />
                                  </Grid>
                                )}
                              </Grid>
                            </TabPanel>
                            <TabPanel value="a2">
                              <Grid container>
                                <Grid
                                  item
                                  lg={12}
                                  md={12}
                                  xs={12}
                                  textAlign={"left"}
                                >
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ ml: 1, width: 220 }}
                                    onClick={handleOpenModal}
                                  >
                                    Tax Information
                                  </Button>
                                </Grid>
                                <Modal
                                  open={openTaxModal}
                                  onClose={handleCloseModal}
                                >
                                  <Box
                                    component="div"
                                    sx={{
                                      position: "absolute",
                                      top: "50%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      width: "60vw",
                                      bgcolor: "background.paper",
                                      borderRadius: 2,
                                      boxShadow: 24,
                                      p: 2,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                    }}
                                  >
                                    {/* Modal Title */}
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      Tax Information
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                      {modalFields.map((field) => (
                                        <Grid
                                          key={field.name}
                                          item
                                          lg={4}
                                          md={6}
                                          xs={12}
                                          textAlign="center"
                                        >
                                          <Controller
                                            name={field.name}
                                            control={controlFormAccountGeneral}
                                            render={({
                                              field: controllerField,
                                              fieldState: { error },
                                            }) => (
                                              <InputTextField
                                                label={field.label}
                                                {...controllerField}
                                                onChange={(e) => {
                                                  const cleanedValue =
                                                    removeEmojis(
                                                      e.target.value,
                                                    );
                                                  controllerField.onChange(
                                                    cleanedValue,
                                                  );
                                                }}
                                                error={!!error}
                                                helperText={
                                                  error ? error.message : null
                                                }
                                                inputProps={{ maxLength: 100 }}
                                                rows={1}
                                              />
                                            )}
                                          />
                                        </Grid>
                                      ))}
                                    </Grid>

                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 1,
                                        mt: 2,
                                      }}
                                    >
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
                                        }}
                                      >
                                        <Grid>
                                          <Button
                                            variant="contained"
                                            color="success"
                                            type="submit"
                                            onClick={() => {
                                              handleSave();
                                            }}
                                          >
                                            SAVE
                                          </Button>
                                        </Grid>
                                        <Grid>
                                          <Button
                                            variant="contained"
                                            color="error"
                                            onClick={handleCloseModal}
                                          >
                                            Close
                                          </Button>
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  </Box>
                                </Modal>
                                <Grid item lg={4} md={6} xs={12}>
                                  <Controller
                                    name="WTLiable"
                                    control={controlFormAccountGeneral}
                                    render={({ field }) => (
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        height="100%"
                                      >
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              {...field}
                                              checked={field.value || false}
                                              onChange={(e) =>
                                                field.onChange(e.target.checked)
                                              }
                                            />
                                          }
                                          label="Subject to Withholding Tax"
                                          sx={{ color: "gray", m: 0 }} // remove default margin
                                        />
                                      </Box>
                                    )}
                                  />
                                </Grid>

                                {WTLiable && (
                                  <>
                                    {cardType === "C" && (
                                      <Grid
                                        item
                                        lg={6}
                                        md={6}
                                        xs={12}
                                        textAlign="left"
                                      ></Grid>
                                    )}
                                    {cardType === "V" && (
                                      <Grid
                                        item
                                        lg={6}
                                        md={6}
                                        xs={12}
                                        textAlign="left"
                                      >
                                        <Controller
                                          name="VendTID"
                                          control={controlFormAccountGeneral}
                                          defaultValue=""
                                          render={({
                                            field,
                                            fieldState: { error },
                                          }) => (
                                            <InputSearchSelectTextField
                                              {...field}
                                              label="VENDOR TYPE"
                                              error={!!error}
                                              helperText={
                                                error ? error.message : null
                                              }
                                              data={[
                                                {
                                                  key: "1",
                                                  value: "Manufacturer",
                                                },
                                                { key: "2", value: "Importer" },
                                                {
                                                  key: "3",
                                                  value: "Manufacturer's depot",
                                                },
                                                {
                                                  key: "4",
                                                  value: "Consignment agent",
                                                },
                                                {
                                                  key: "5",
                                                  value: "First stage dealer",
                                                },
                                                {
                                                  key: "6",
                                                  value: "Second stage dealer",
                                                },
                                              ]}
                                              onChange={(e) =>
                                                field.onChange(e.target.value)
                                              }
                                            />
                                          )}
                                        />
                                      </Grid>
                                    )}
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ ml: 1, width: 220 }}
                                        // onClick={handleOpenModal}
                                      >
                                        WTax Codes Allowed
                                      </Button>
                                    </Grid>
                                    <Grid item lg={4} md={4} xs={12}>
                                      <Controller
                                        name="AccCritria"
                                        control={controlFormAccountGeneral}
                                        render={({ field }) => (
                                          <FormControlLabel
                                            control={
                                              <Radio
                                                {...field}
                                                checked={
                                                  field.value === "Accrual"
                                                }
                                                onChange={() =>
                                                  field.onChange("Accrual")
                                                }
                                              />
                                            }
                                            label="Accrual"
                                            sx={{ color: "gray" }}
                                          />
                                        )}
                                      />
                                    </Grid>

                                    {/* Cash */}
                                    <Grid item lg={4} md={4} xs={12}>
                                      <Controller
                                        name="AccCritria"
                                        control={controlFormAccountGeneral}
                                        render={({ field }) => (
                                          <FormControlLabel
                                            control={
                                              <Radio
                                                {...field}
                                                checked={field.value === "Cash"}
                                                onChange={() =>
                                                  field.onChange("Cash")
                                                }
                                              />
                                            }
                                            label="Cash"
                                            sx={{ color: "gray" }}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="CrtfcateNO"
                                        // rules={{ required: "this field is requered" }}
                                        control={controlFormAccountGeneral}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputTextField
                                            label="CERTIFICATE NO."
                                            {...field}
                                            error={!!error}
                                            inputProps={{ maxLength: 20 }}
                                            helperText={
                                              error ? error.message : null
                                            }
                                            rows={1}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="ExpireDate"
                                        control={controlFormAccountGeneral}
                                        // rules={{ required: "Expiration Date is Required" }}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <SelectedDatePickerField
                                            label="EXPIRATION DATE"
                                            name={field.name}
                                            value={
                                              field.value
                                                ? dayjs(field.value)
                                                : undefined
                                            }
                                            onChange={(date) => {
                                              field.onChange(
                                                date
                                                  ? date.toISOString
                                                  : undefined,
                                              );
                                              setValueAcctGeneral(
                                                "ExpireDate",
                                                date,
                                              );
                                            }}
                                            error={!!error}
                                            helperText={
                                              error ? error.message : null
                                            }
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="NINum"
                                        // rules={{ required: "this field is requered" }}
                                        control={controlFormAccountGeneral}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputTextField
                                            label="NI NUMBER"
                                            {...field}
                                            error={!!error}
                                            inputProps={{ maxLength: 20 }}
                                            helperText={
                                              error ? error.message : null
                                            }
                                            rows={1}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="TypWTReprt"
                                        control={controlFormAccountGeneral}
                                        defaultValue=""
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputSelectTextField
                                            {...field}
                                            error={!!error}
                                            helperText={
                                              error ? error.message : null
                                            }
                                            label="ASSESSEE TYPE"
                                            // placeholder={"select GST Type"}
                                            data={[
                                              // { key: "0", value: "Select Type" },
                                              { key: "C", value: "COMPANY" },
                                              { key: "P", value: "OTHER" },
                                            ]}
                                            onChange={(e) =>
                                              field.onChange(e.target.value)
                                            }
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="WTTaxCat"
                                        // rules={{ required: "this field is requered" }}
                                        control={controlFormAccountGeneral}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputTextField
                                            label="WT TAX CATEGORY"
                                            {...field}
                                            error={!!error}
                                            inputProps={{ maxLength: 254 }}
                                            helperText={
                                              error ? error.message : null
                                            }
                                            rows={1}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="SurOver"
                                        control={controlFormAccountGeneral}
                                        render={({ field }) => (
                                          <FormControlLabel
                                            sx={{ color: "gray" }}
                                            control={
                                              <Checkbox
                                                {...field}
                                                checked={field.value || false}
                                                onChange={(e) => {
                                                  field.onChange(
                                                    e.target.checked,
                                                  );
                                                }}
                                              />
                                            }
                                            label="Surcharge Overlook"
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="Remark1"
                                        // rules={{ required: "this field is requered" }}
                                        control={controlFormAccountGeneral}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <InputTextField
                                            label="REMARKS 1"
                                            {...field}
                                            error={!!error}
                                            inputProps={{ maxLength: 100 }}
                                            helperText={
                                              error ? error.message : null
                                            }
                                            rows={1}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="ConCerti"
                                        // rules={{ required: "this field is requered" }}
                                        control={controlFormAccountGeneral}
                                        render={({
                                          field,
                                          fieldState: { error },
                                        }) => (
                                          <Tooltip
                                            title="CERTIFICATE NO. FOR 26 Q"
                                            arrow
                                          >
                                            <InputTextField
                                              label="CERTIFICATE NO. FOR 26 Q"
                                              {...field}
                                              error={!!error}
                                              inputProps={{ maxLength: 20 }}
                                              helperText={
                                                error ? error.message : null
                                              }
                                              rows={1}
                                            />
                                          </Tooltip>
                                        )}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      lg={4}
                                      md={4}
                                      xs={12}
                                      textAlign={"left"}
                                    >
                                      <Controller
                                        name="ThreshOver"
                                        control={controlFormAccountGeneral}
                                        render={({ field }) => (
                                          <FormControlLabel
                                            sx={{ color: "gray" }}
                                            control={
                                              <Checkbox
                                                {...field}
                                                checked={!!field.value} // ensure boolean
                                                onChange={(e) =>
                                                  field.onChange(
                                                    e.target.checked,
                                                  )
                                                }
                                              />
                                            }
                                            label="Threshold Overlook"
                                          />
                                        )}
                                      />
                                    </Grid>
                                  </>
                                )}
                              </Grid>
                            </TabPanel>
                          </TabContext>
                        </TabPanel>

                        <TabPanel value={"5"}>
                          <Grid container width={"100%"}>
                            <Grid item xs={12}>
                              <input
                                type="file"
                                id="file-upload"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                                multiple
                                accept="
                         .pdf,.xls,.xlsx,.csv,.doc,.docx,.txt,
                         .tiff,.tif,.jpg,.jpeg,.png,
                         .zip,.rar,
                         .json,.xml,
                         .dwg,.dxf,
                         .heic,.webp,.bmp,.gif,.svg
                       "
                              />
                              <label
                                htmlFor="file-upload"
                                style={{
                                  marginLeft: 5,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "5px 10px",
                                  backgroundColor: "#2E7D32",
                                  color: "#fff",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                  transition: "background-color 0.3s",
                                }}
                              >
                                <CloudUploadIcon
                                  sx={{ fontSize: 20, marginRight: "5px" }}
                                />
                                Upload File
                              </label>

                              <TableContainer
                                sx={{
                                  margin: "7px",
                                  maxHeight: 200,
                                  width: "80%",
                                }}
                              >
                                {fileData.length > 0 && (
                                  <Table sx={{ minWidth: 500 }} stickyHeader>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>
                                          Selected File Name
                                        </TableCell>
                                        <TableCell>Action</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <Divider />
                                    <TableBody>
                                      {fileData.map((data, index) => (
                                        <TableRow
                                          key={index}
                                          style={{ cursor: "pointer" }}
                                        >
                                          <TableCell
                                            onClick={
                                              () =>
                                                data.LineNum === "0"
                                                  ? openFileinNewTab(data) // API case
                                                  : Base64FileinNewTab(
                                                      data.DocEntry,
                                                      data.LineNum,
                                                      data.FileExt,
                                                      data.Description,
                                                    ) // Base64 case
                                            }
                                          >
                                            {data.FileName}
                                          </TableCell>
                                          <TableCell>
                                            <RemoveCircleOutlineIcon
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(index);
                                              }}
                                              style={{ cursor: "pointer" }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </TableContainer>
                            </Grid>
                          </Grid>
                        </TabPanel>

                        <TabPanel value={"6"}>
                          <Grid container width={"100%"}>
                            <Controller
                              name="FreeTexts"
                              // rules={{ required: "this field is required" }}
                              control={controlFormBP}
                              render={({ field, fieldState: { error } }) => (
                                <TextField
                                  label="REMARKS"
                                  type="text"
                                  rows={2}
                                  multiline
                                  {...field}
                                  onChange={(e) => {
                                    const cleanedValue = removeEmojis(
                                      e.target.value,
                                    );
                                    field.onChange(cleanedValue);
                                  }}
                                  error={!!error}
                                  inputProps={{ maxLength: 16 }}
                                  helperText={error ? error.message : null}
                                  sx={{
                                    ml: "100px",
                                    minWidth: "99%",
                                    minHeight: "200px",
                                  }}
                                />
                              )}
                            />
                          </Grid>
                        </TabPanel>
                      </TabContext>
                    </AppBar>

                    {/* <Divider /> */}
                  </Box>
                </Paper>
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
                name={saveUpdateNameBP}
                disabled={
                  (saveUpdateNameBP === "SAVE" && !perms.IsAdd) ||
                  (saveUpdateNameBP !== "SAVE" && !perms.IsEdit)
                }
                color="success"
                sx={{ color: "white" }}
              >
                {saveUpdateNameBP}
              </Button>
              <Button
                variant="contained"
                disabled={saveUpdateNameBP === "SAVE" || !perms.IsDelete}
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
