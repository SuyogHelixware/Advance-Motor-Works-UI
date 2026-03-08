import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import DetailsIcon from "@mui/icons-material/Details";
import ImageIcon from "@mui/icons-material/Image";
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import SearchIcon from "@mui/icons-material/Search";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Slide,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import { InfiniteLoader } from "react-virtualized";
import Swal from "sweetalert2";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerField,
  InputSearchSelectTextField,
  InputsmallFilds,
  InputTextArea,
  InputTextField,
  InputTimePicker,
  RadioButtonsField,
  SmallInputFields,
  SmallInputTextField,
} from "../Components/formComponents";
import { PhoneNumber } from "../Components/PhoneNumber";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";
import apiClient from "../../services/apiClient";
import { Loader } from "../Components/Loader";
import PrintMenu from "../Components/PrintMenu";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function QuatationSO() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, settab] = useState("0");
  const [open, setOpen] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const [openModal, setOpenModal] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bankData, setBankData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [images, setImages] = useState([]);
  const [radioKey, setRadioKey] = useState(0);

  const [GRN, setGrn] = useState([]);
  const [GRNPage, setGRNPage] = useState(1);
  const [hasMoreGRN, setHasMoreGRN] = useState(true);
  const [loadingGRN, setLoadingGRN] = useState(false);

  const [ARInvoice, setARInvoice] = useState([]);
  const [ARInvoicePage, setARInvoicePage] = useState(1);
  const [hasMoreARInvoice, setHasMoreARInvoice] = useState(true);
  const [loadingARInvoice, setLoadingARInvoice] = useState(false);

  const [OpenSO, setOpenSO] = useState([]);
  const [OpenSOPage, setOpenSOPage] = useState(1);
  const [hasMoreOpenSO, setHasMoreOpenSO] = useState(true);
  const [loadingOpenSO, setLoadingOpenSO] = useState(false);

  const [filteredList, setFilteredList] = useState([]);

  const [Suppliers, setSuppliers] = useState([]);

  const [getListData, setGetListData] = useState([]);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);
  const timeoutRef = useRef(null);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);
  const [top20ItemsList, settop20ItemsList] = useState([]);
  const top20CancelToken = useRef(null);
  const top20DebounceTimer = useRef(null);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const checkedRowsRef = useRef([]);

  const initial = {
    DocNum: null,
    CreatedBy: localStorage.getItem("UserName"),
    UserId: localStorage.getItem("UserId"),
    DocDate: dayjs(undefined),
    Status: "OPEN",
    JobRemarks: "",
    JobWorkAt: "ORP WORKSHOP",
    SparesAmount: 0,
    DesiredDisc: 0,
    DesiredDiscAmt: 0,
    SpecialDiscAmt: 0,
    SparesNetAmt: 0,
    FittingCharge: 0,
    TotalDocAmt: 0,
    FittingTimeReq: 0,
    SpecialDiscBy: "0",
    SpecialDiscDate: dayjs(undefined),
    SpecialDiscRemarks: "",
    AdvancePayment: 0,
    AdvanceAmount: 0,
    DueAmount: 0,
    PaidAmount: 0,
    PaidAmountPer: 0,
    SpecialDisc: 0,
    AdvanceReceiptNo: "",
    ReceiptDate: dayjs(new Date()),
    time: dayjs(new Date()),
    ReferenceNo: "",
    Type: "ITEM",
    Shipping: false,
    CRApproved: false,
    ShippingAmt: 0,
    Approver: "",
    ApprovalStatus: false,
    RoundingAmt: 0,
    CardName: "",
    PhoneNumber1: "",
    CardCode: "",
    GroupCode: "100",
    SalesHistory: 0,
    CustomerBalance: 0,
    DirectInvoice: true,
    CNC: false,
    DeliveredLater: false,
    ServiceOrder: false,
    CRApprovedID: false,
    TotalPartsValue: 0,
    NetPartsValue: 0,
    ServiceAndInstallation: 0,
    OrderNo: "",
    OrderType: "POS",
    OrderSubType: "REGULAR",
    WalkIn: false,
    InvoiceStatus: "4",
    CountryCode: "KWD",
    TaxCode: "",
    TaxAmt: "0",
    CustomsDutyPer: "0",
    CustomsDutyAmt: "0",
    Currency: "KWD",
    CurrencyRate: "0",
    CurrAmt: "0",
    CashAccount: "1201011",
    TransferAccount: "1201022",
    TransferAccountName: "Bank NBK 2008134452",
    TransferDate: dayjs(new Date()),
    VehicleDocEntry: "0",
    Year: "",
    Make: "",
    Model: "",
    CashPaid: 0,
    BaseRefId: "",
    CreditSum: 0,
    TransferSum: 0,
    oLines: [],
    oCashPay: [],
    oCCPay: [],
    BankPay: [],
    SendWPAttach: "0",
    SAPSyncSO: "N",
    SAPSyncDP: "N",
    SAPSyncPAY: "N",
    SAPSyncCancel: "N",
    SAPDocEntry: "0",
    SAPDocNum: "",
    DiscApproStatus: "",
    IsDupliQuot: false,
    VoucherNum: "",
    CreditCardNumber: "",
  };

  const initialItemSearch = {
    Supplier: "",
    ItemName: "",
    CardName: "",
    CardCode: "",
    ItemCode: "",
    IsActive: false,
    Stock: true,
    Make: "",
    Model: "",
    Year: "",
    Category: "",
    SubCategory: "",
  };

  const initialCustCreation = {
    CustomerName: "",
    CardName: "",
    Email: "",
    PhoneNumber1: "",
    GroupCode: false,
    CardType: "C",
    Status: "1",
  };

  const { control, handleSubmit, reset, getValues, setValue, watch } = useForm({
    defaultValues: initial,
    shouldFocusError: false,
  });

  const {
    control: controlMdl,
    handleSubmit: handleSubmitMdl,
    reset: resetMdl,

    setValue: setValueMdl,
  } = useForm({
    defaultValues: initialCustCreation,
    shouldFocusError: false,
  });

  const {
    control: controlMdl1,
    handleSubmit: handleSubmitMdl1,
    reset: resetMdl1,
  } = useForm({
    defaultValues: initialItemSearch,
    shouldFocusError: false,
  });

  const perms = usePermissions(356);

  const CreditCardList = [
    { Name: "KNET", AccountCode: "1201024" },
    { Name: "MASTER", AccountCode: "1201024" },
    { Name: "VISA", AccountCode: "1201024" },
    { Name: "MF", AccountCode: "1201029" },
    { Name: "TABBY", AccountCode: "1201036" },
    { Name: "TAMARA", AccountCode: "1201039" },
    { Name: "TALY", AccountCode: "1201041" },
  ];

  // const selectedCard = useWatch({ control, name: "CreditCard" });

  const getIssueStatus = (Qty, IssueQty) => {
    if (Qty > IssueQty && IssueQty > 0) return "P-ISSUED";
    else if (Qty === IssueQty) return "C-ISSUED";
    else return "NOT-ISSUED";
  };

  const handleDeleteCreditAmt = (index) => {
    const currentList = [...bankData];
    currentList.splice(index, 1);
    setBankData(currentList);
    setValue("oCCPay", currentList);
    PaymentsCalculations();
  };

  const gettop20Items = useCallback((searchText = "") => {
    if (top20DebounceTimer.current) {
      clearTimeout(top20DebounceTimer.current);
    }

    top20DebounceTimer.current = setTimeout(() => {
      if (top20CancelToken.current) {
        top20CancelToken.current.cancel("Cancelled previous Top 20 request");
      }

      top20CancelToken.current = axios.CancelToken.source();

      apiClient
        .get(`/TopProducts/all`, {
          cancelToken: top20CancelToken.current.token,
        })
        .then((res) => {
          const allItems =
            res.data.success && Array.isArray(res.data.values)
              ? res.data.values
              : [];

          const filteredItems = allItems.filter((item) => {
            const searchLower = searchText.trim().toLowerCase();
            return (
              item.ItemName?.toLowerCase().includes(searchLower) ||
              item.ItemCode?.toLowerCase().includes(searchLower)
            );
          });

          settop20ItemsList(filteredItems);
        })

        .catch((error) => {
          if (!axios.isCancel(error)) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: error.message || "Error fetching top 20 items",
            });
          }
        });
    }, 500);
  }, []);

  const onSelectBusinessPartner = async (selectedItem) => {
    try {
      const currentValues = getValues();

      const filledValues = {
        ...initial,
        ...currentValues,
        CardCode: selectedItem.CardCode,
        CardName: (selectedItem.CardName ?? selectedItem.Name)?.toUpperCase(),
        PhoneNumber1: selectedItem.PhoneNumber1 ?? selectedItem.ContactPhone,
        SalesHistory: selectedItem.SalesHistory ?? "0",
        CustomerBalance: selectedItem.CustomerBalance ?? "0",
        GroupCode: selectedItem.GroupCode ?? "100",
        TransferDate: selectedItem.TransferDate
          ? dayjs(selectedItem.TransferDate)
          : dayjs(),
        ReceiptDate: selectedItem.ReceiptDate
          ? dayjs(selectedItem.ReceiptDate)
          : dayjs(),
        DocDate: selectedItem.DocDate ? dayjs(selectedItem.DocDate) : dayjs(),
      };

      reset(filledValues);
      SearchModelClose();
    } catch (error) {
      console.error("Error fetching ARInvoice:", error);
    }
    handleClose();
  };

  const [PrintData, setPrintData] = useState([]);

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/23`,
        );
        // const { data: dataPrint } = await axios.get(
        //   `http://20.203.85.32:8071/api/ReportLayout/GetByTransId/23`,
        // );
        if (dataPrint.success) {
          const OlinesDataPrint = dataPrint.values.oLines;
          setPrintData(OlinesDataPrint);
        } else {
          Swal.fire({
            text: dataPrint.message,
            icon: "question",
            confirmButtonText: "YES",
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchPrintData(); // runs once
  }, []);

  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/BPV2?Status=1&CardType=C&Limit=${pageNum}&SearchText=${searchTerm}`
        : `/BPV2/V2/Pages/1/${pageNum}/20`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setHasMoreGetList(newData.length === 20);

        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else if (response.data.success === false) {
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "YES",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `/QuotationSO?Status=1&Page=${pageNum}&SearchText=${searchTerm}`
        : `/QuotationSO?Status=1&Page=${pageNum}`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        const pageSize = 20;
        setHasMoreOpen(newData.length === pageSize);
        setOpenListPage(pageNum);
      } else {
        setHasMoreOpen(false);
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreOpen(false);
      Swal.fire({
        text: error.message || error,
        icon: "question",
        confirmButtonText: "YES",
      });
    }
  };

  const fetchAndSetData = async (DocEntry) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/QuotationSo/${DocEntry}`);

      const data = res.data?.values;

      reset(data);

      reset({
        ...data,
        CNC: data.JobWorkAt === "CNC",
        ServiceOrder: data.ServiceOrder !== "0",
        Shipping: data.Shipping !== "0",
        WalkIn: data.WalkIn !== "0",
        DeliveredLater: data.DeliveredLater === "1",
        DirectInvoice: data.DirectInvoice !== "0",
        Approver: data.Approver,
        InvoiceStatus: data.InvoiceStatus,
        Status: data.Status,
        OrderType: data.OrderType,
        oCCPay: [],
        BankPay: [],
        oCashPay: [],

        DesiredDiscAmt: Number(data?.DesiredDiscAmt || 0).toFixed(3),
        SpecialDiscAmt: Number(data?.SpecialDiscAmt || 0).toFixed(3),

        CRApproved: data.ApprovalStatus === "0" ? false : true,
        Model: data.Model,
        CashPaid: "0",
        TransferDate: data.TransferDate ? dayjs(data.TransferDate) : dayjs(),
        ReceiptDate: data.ReceiptDate ? dayjs(data.ReceiptDate) : dayjs(),
        DocDate: data.DocDate ? dayjs(data.DocDate) : dayjs(),

        oLines: data.oLines.map((line) => ({
          ...line,
          Quantity: parseFloat(line.Quantity),
          Amount: parseFloat(line.Amount),
          Price: parseFloat(line.Price),
          LineFittingCharge: line.LineFittingCharge || 0,
          FittingCharge:
            parseFloat(line.LineFittingCharge) / parseFloat(line.Quantity),
          IssueStatus: getIssueStatus(
            Number(line.Quantity),
            Number(line.IssueQuantity),
          ),
          OldQuantity: Number(line.Quantity),
        })),
        rows: data.oLines.map((line) => ({
          ...line,
          Quantity: parseFloat(line.Quantity),
          Amount: parseFloat(line.Amount),
          Price: parseFloat(line.Price),
          LineFittingCharge: line.LineFittingCharge,
          FittingCharge:
            parseFloat(line.LineFittingCharge) / parseFloat(line.Quantity),
          IssueStatus: getIssueStatus(
            Number(line.Quantity),
            Number(line.IssueQuantity),
          ),
        })),
      });

      setSaveUpdateName("UPDATE");
    } catch (error) {
      console.error("Error fetching data:", error);

      Swal.fire({
        text: error?.response?.data?.message || "Failed to fetch data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
    setLoading(false);
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (searchmodelOpen === true) {
      fetchGetListData(0);
    }
  }, [searchmodelOpen]);

  const OpenDailog = () => {
    setSearchmodelOpen(true);
  };

  const SearchModelClose = () => {
    setSearchmodelOpen(false);
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
      fetchGetListData(0, res);
    }, 600);
  };

  const handleOpenListSearch = (res) => {
    setOpenListQuery(res);
    setOpenListSearching(true);
    setOpenListPage(0);
    setOpenListData([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchOpenListData(0, res);
    }, 600);
  };

  const handleOpenListClear = () => {
    setOpenListQuery("");
    setOpenListSearching(false);
    setOpenListPage(0);
    setOpenListData([]);
    fetchOpenListData(0);
  };

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);
    fetchGetListData(0);
  };

  useEffect(() => {
    fetchOpenListData(0);
    gettop20Items();
  }, []);

  const fetchClosedListData = async (pageNum = 0, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `/QuotationSO?Status=0&Page=${pageNum}&SearchText=${searchTerm}`
        : `/QuotationSO?Status=0&Page=${pageNum}`;

      const response = await apiClient.get(url);

      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreClosed(newData.length === 20);
        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        setHasMoreClosed(false);
        Swal.fire({
          text: response.data.message,
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreClosed(false);
      Swal.fire({
        text: error.message || error,
        icon: "question",
        confirmButtonText: "YES",
      });
    }
  };

  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  const fetchMoreClosedListData = () => {
    fetchClosedListData(
      closedListPage + 1,
      closedListSearching ? closedListquery : "",
    );
    setClosedListPage((prev) => prev + 1);
  };

  useEffect(() => {
    fetchClosedListData(0);
  }, []);

  const handleClosedListSearch = (res) => {
    setClosedListQuery(res);
    setClosedListSearching(true);
    setClosedListPage(0);
    setClosedListData([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchClosedListData(0, res);
    }, 600);
  };

  const handleClosedListClear = () => {
    setClosedListQuery("");
    setClosedListSearching(false);
    setClosedListPage(0);
    setClosedListData([]);
    fetchClosedListData(0);
  };

  const tabData = [
    {
      value: "0",
      label: "Open",
      data: openListData,
      query: openListquery,
      hasMore: hasMoreOpen,
      fetchMore: fetchMoreOpenListData,
      handleSearch: handleOpenListSearch,
      handleClear: handleOpenListClear,
    },
    {
      value: "1",
      label: "Closed",
      data: closedListData,
      query: closedListquery,
      hasMore: hasMoreClosed,
      fetchMore: fetchMoreClosedListData,
      handleSearch: handleClosedListSearch,
      handleClear: handleClosedListClear,
    },
  ];

  const getAllBPFormData = async (page = 0, searchQuery = "") => {
    try {
      setLoading(true);

      const res = await apiClient.get(
        `/BPV2?Status=1&CardType=S&Page=0&Limit=200`,
      );

      const data = res?.data;

      if (!data?.success || !Array.isArray(data.values)) {
        throw new Error(data?.message || "Invalid Supplier response");
      }

      const supplierLists = data.values.filter(
        (item) => String(item?.Status) === "1",
      );

      setSuppliers(supplierLists);

      if (supplierLists.length > 0) {
        const defaultDocEntry = supplierLists[0].CardName;
        setValueMdl("CardName", defaultDocEntry);
        setValueMdl("SAPDocNum", supplierLists[0].SAPDocNum);
      }
    } catch (error) {
      console.error("Error fetching Supplier:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch Supplier data.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const getItemDetails = (ItemCode) => {
    setARInvoicePage(1);
    setHasMoreARInvoice(true);

    setOpenSOPage(1);
    setHasMoreOpenSO(true);

    setGRNPage(1);
    setHasMoreGRN(true);

    const ARInvoice = document.getElementById("ARInvoiceScroll");
    if (ARInvoice) ARInvoice.scrollTo(0, 0);

    const OpenSO = document.getElementById("OpenSOScroll");
    if (OpenSO) OpenSO.scrollTo(0, 0);

    const GRN = document.getElementById("GRNScroll");
    if (GRN) GRN.scrollTo(0, 0);

    const ATP = document.getElementById("ATPScroll");
    if (ATP) ATP.scrollTo(0, 0);

    setLoading(true);

    apiClient
      .request({
        method: "get",
        url: `/DynamicSearch/itemsdata/${ItemCode}`,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.success === true) {
          const data = response.data.values[0];

          setImages(data?.Images || []);
          setGrn(data?.GRN || []);
          setARInvoice(data?.ARInvoice || []);
          setOpenSO(data?.OpenSO || []);
          setLoading(false);
        } else if (response.data.success === false) {
          setLoading(false);
          Swal.fire({
            title: "Error!",
            text: response.data.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const handleCheck = (itemCode) => {
    getItemDetails(itemCode);
  };

  const loadMoreRowsGRN = async () => {
    if (!hasMoreGRN || loadingGRN) return;

    setLoadingGRN(true);

    const url = `/DynamicSearch/QuotSO/itemsdata/GRN/${selectedRow.ItemCode}/${GRNPage}`;

    try {
      const response = await apiClient.get(`${url}`);

      const newData = response.data.values || [];

      if (newData.length === 0) {
        setHasMoreGRN(false);
        return;
      }

      setGrn((prev) => [...prev, ...newData]);
      setGRNPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingGRN(false);
    }
  };

  const handleScrollGRN = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      loadMoreRowsGRN();
    }
  };

  const loadMoreRowsARInvoice = async () => {
    if (loadingARInvoice || !hasMoreARInvoice) return;

    setLoadingARInvoice(true);

    const url = `/DynamicSearch/QuotSO/itemsdata/ARInvoice/${selectedRow.ItemCode}/${ARInvoicePage}`;

    try {
      const response = await apiClient.get(`${url}`);

      const newData = response.data.values || [];

      if (newData.length === 0) {
        setHasMoreARInvoice(false);
        return;
      }

      setARInvoice((prev) => {
        const mergedData = [...prev, ...newData];

        const uniqueData = mergedData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.InvoiceNo === item.InvoiceNo),
        );

        return uniqueData;
      });

      setARInvoicePage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingARInvoice(false);
    }
  };

  const handleScrollARInvoice = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      loadMoreRowsARInvoice();
    }
  };

  const loadMoreRowsOpenSo = async () => {
    if (!hasMoreOpenSO || loadingOpenSO) return;

    setLoadingOpenSO(true);

    const url = `/DynamicSearch/QuotSO/itemsdata/OpenSo/${selectedRow.ItemCode}/${OpenSOPage}`;

    try {
      const response = await apiClient.get(`${url}`);

      const newData = response.data.values || [];

      if (newData.length === 0) {
        setHasMoreOpenSO(false);
        return;
      }

      setOpenSO((prev) => [...prev, ...newData]);
      setOpenSOPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOpenSO(false);
    }
  };

  const handleScrollOpenSo = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      loadMoreRowsOpenSo();
    }
  };

  const clearDynamicSearchList = () => {
    fetchFormData(initialItemSearch);
    setSelectedRow(null);
    setGrn([]);
    setARInvoice([]);
    setOpenSO([]);
    setImages([]);
    resetMdl(initialItemSearch);
  };

  const updateFilteredListDisabledRows = () => {
    const oLineItemCodes = getValues("oLines")?.map((item) => item.ItemCode);
    const currentList = Array.isArray(filteredList) ? filteredList : [];
    const updatedFiltered = currentList.map((item) => {
      const stillInForm = oLineItemCodes.includes(item.ItemCode);
      return {
        ...item,
        disabled: stillInForm,
      };
    });
    setFilteredList(updatedFiltered);
  };

  const calculateData = () => {
    const allFormdata = getValues();
    const rows = getValues("rows") || [];

    const totalPartsValue = rows.reduce((sum, row) => {
      return sum + Number(row.Quantity || 0) * Number(row.Price || 0);
    }, 0);

    const totalFittingCharge = rows.reduce((sum, row) => {
      return sum + Number(row.LineFittingCharge || 0);
    }, 0);

    const sDisc = (() => {
      const desireddis = Number(allFormdata.DesiredDisc) || 0;
      const specialdisc = Number(allFormdata.SpecialDisc) || 0;
      return desireddis + specialdisc > 100 ? 0 : specialdisc;
    })();

    const roundAmt = parseFloat(allFormdata.RoundingAmt) || 0;
    const shipAmt = parseFloat(allFormdata.ShippingAmt) || 0;
    const desiredDiscAmt = parseFloat(allFormdata.DesiredDiscAmt) || 0;

    const sDiscAmt = (totalPartsValue * sDisc) / 100;
    const netParts =
      totalPartsValue - Number(desiredDiscAmt) - Number(sDiscAmt);

    const total = Math.max(
      0,
      Number(netParts || 0) +
        Number(totalFittingCharge || 0) +
        Number(roundAmt || 0) +
        Number(shipAmt || 0),
    );
    setValue("TotalDocAmt", Number(total.toFixed(3)));
    setValue(
      "DueAmount",
      Number(total.toFixed(3)) - Number(netParts.toFixed(3)),
    );
    setValue("ServiceAndInstallation", Number(totalFittingCharge.toFixed(3)));
    setValue("NetPartsValue", Number(netParts.toFixed(3)));
    setValue("TotalPartsValue", Number(totalPartsValue.toFixed(3)));
    setValue("SpecialDiscAmt", Number(sDiscAmt.toFixed(3)));

    if (watch("OrderNo") === "") {
      PaymentsCalculations();
    } else {
      PaymentCalcUpdateTimePaymentPer();
    }

    if (parseFloat(allFormdata.DesiredDisc) > 0) {
      CalDesiredDiscountBtn();
    }
    DisValidate();
  };

  const updateSummaryFields = () => {
    const allLines = getValues("oLines") || [];

    const grandTotal = allLines.reduce(
      (sum, row) => sum + Number(row.Amount || 0),
      0,
    );

    const fittingTotal = allLines.reduce(
      (sum, row) => sum + Number(row.LineFittingCharge),
      0,
    );

    const allTotal = grandTotal + fittingTotal;

    const PAmt = getValues("PaidAmount");
    const PaidAmt = allTotal - PAmt;

    setValue("TotalDocAmt", allTotal.toFixed(3));
    setValue("DueAmount", PaidAmt.toFixed(3));
    setValue("NetPartsValue", grandTotal.toFixed(3));
    setValue("TotalPartsValue", grandTotal.toFixed(3));
    setValue("ServiceAndInstallation", fittingTotal);
  };

  const PaymentsCalculations = () => {
    const totalDocAmt = parseFloat(watch("TotalDocAmt")) || 0;

    const oCCPayList = getValues("oCCPay") || [];
    const creditSumTotal = oCCPayList.reduce((sum, item) => {
      return sum + parseFloat(item.CreditSum || 0);
    }, 0);

    const cashPaid = parseFloat(watch("CashPaid")) || 0;
    const transferSum = parseFloat(watch("TransferSum")) || 0;

    const totalPaid = parseFloat(
      (cashPaid + transferSum + creditSumTotal).toFixed(3),
    );

    const finalDuw = totalDocAmt - totalPaid;
    if (finalDuw < 0) {
      Swal.fire({
        text: "Paid Value Should not be greater than dueAmt Due Amount",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      setValue("CashPaid", lastValidValuesRef.current.CashPaid);
      setValue("TransferSum", lastValidValuesRef.current.TransferSum);
      // const updatedOCCPayList = oCCPayList.map((item, i) => ({
      //   ...item,
      //   CreditSum:
      //     i === 0 ? lastValidValuesRef.current.CreditSum : item.CreditSum,
      // }));
      // setBankData(updatedOCCPayList);

      return;
    }
    lastValidValuesRef.current = {
      CashPaid: cashPaid,
      TransferSum: transferSum,
      CreditSum: lastValidValuesRef.current.CreditSum,
    };
    const totalDocumentValue = Number(watch("TotalDocAmt")) || 0;
    const advanceAmt = Number(totalPaid) || 0;

    const advancePercentage = totalDocumentValue
      ? (advanceAmt / totalDocumentValue) * 100
      : 0;
    const paidAmount = advanceAmt.toFixed(3);

    setValue("AdvancePayment", advancePercentage.toFixed(3));
    setValue("AdvanceAmount", paidAmount);
    setValue("PaidAmountPer", advancePercentage.toFixed(3));

    setValue("DueAmount", (totalDocAmt - totalPaid).toFixed(3));
    setValue("PaidAmount", totalPaid.toFixed(3));
  };

  const PaymentCalcUpdateTimePaymentPer = () => {
    const Paidamt = parseFloat(getValues("PaidAmount")) || 0;
    const totalDocAmt = parseFloat(getValues("TotalDocAmt")) || 0;

    const dueAmount = parseFloat(totalDocAmt) - parseFloat(Paidamt);

    let percentage = 0;
    if (totalDocAmt > 0) {
      percentage = (Paidamt / totalDocAmt) * 100;
    }

    setValue("AdvancePayment", parseFloat(percentage).toFixed(3));
    setValue("PaidAmountPer", parseFloat(percentage).toFixed(3));
    setValue("DueAmount", parseFloat(dueAmount).toFixed(3));
  };

  const CalDesiredDiscountBtn = () => {
    AdditionalDownPay();
    const allFormData = getValues();

    const totalPartsValue = parseFloat(allFormData.TotalPartsValue) || 0;
    const salesHistory = parseFloat(allFormData.SalesHistory) || 0;
    const discAmount = totalPartsValue + salesHistory;

    let DesiredDiscount = 0;

    if (!allFormData.ServiceOrder) {
      if (discAmount <= 299) {
        DesiredDiscount = 0;
      } else if (discAmount <= 999) {
        DesiredDiscount = 5.0;
      } else if (discAmount <= 1999) {
        DesiredDiscount = 7.5;
      } else if (discAmount <= 3999) {
        DesiredDiscount = 10.0;
      } else {
        DesiredDiscount = 12.5;
      }
    }

    const DesiredDiscountAmt =
      (totalPartsValue * DesiredDiscount.toFixed(3)) / 100;

    const specialDiscAmt = parseFloat(watch("SpecialDiscAmt")) || 0;

    const NetPartsValue =
      totalPartsValue - DesiredDiscountAmt - specialDiscAmt.toFixed(3);

    setValue("DesiredDisc", DesiredDiscount.toFixed(3));
    setValue("DesiredDiscAmt", DesiredDiscountAmt.toFixed(3));
    setValue("NetPartsValue", NetPartsValue.toFixed(3));

    const serviceAndInstallation =
      parseFloat(allFormData.ServiceAndInstallation) || 0;
    const shippingAmt = parseFloat(allFormData.ShippingAmt) || 0;
    const roundingAmt = parseFloat(allFormData.RoundingAmt) || 0;

    const totalDocAmt =
      serviceAndInstallation + shippingAmt + roundingAmt + NetPartsValue;

    setValue("TotalDocAmt", totalDocAmt.toFixed(3));

    PaymentCalcUpdateTimePaymentPer();
    DisValidate();
  };

  const lastValidValuesRef = useRef({
    CashPaid: 0,
    TransferSum: 0,
    CreditSum: 0,
  });

  const DisValidate = () => {
    const allFormdata = getValues();
    const dDisc = parseFloat(allFormdata.DesiredDisc) || 0;
    const sDisc = parseFloat(allFormdata.SpecialDisc) || 0;
    const disvalidation = sDisc + dDisc;
    if (Number(disvalidation) > 100) {
      Swal.fire({
        text: "Discount cannot be more than 100%.",
        icon: "info",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      setValue("SpecialDisc", "0");
      setValue("SpecialDiscAmt", "0");
      return;
    }
  };

  const AdditionalDownPay = () => {
    const Paidamt = parseFloat(getValues("PaidAmount")) || 0;
    const dueamt = parseFloat(getValues("DueAmount")) || 0;

    const finaldueamt = Paidamt - dueamt;

    setValue("DueAmount", parseFloat(finaldueamt).toFixed(3));
  };

  const handleOnCheckBoxChange = (checked) => {
    const isServiceOrder = watch("ServiceOrder") === true;

    if (checked && isServiceOrder) {
      setValue("SpecialDiscountPer", 0);
      setValue("SpecialDiscountAmt", 0);
      setValue("Price", "");

      const serviceLines = [
        {
          ItemCode: "S001",
          ItemName: "SERVICE & INSTALLATION",
          WHSCode: "01",
          Quantity: 1,
          Price: 0.0,
          DesiredDisc: "0.00",
          Amount: "0.00",
          FTSQty: "0.000",
          LineFittingCharge: "0",
        },
      ];

      setValue("oLines", serviceLines);
    } else if (!checked && !isServiceOrder) {
      setValue("oLines", []);
      HandleTableOnChange();
    }
  };

  const handleOnCreditCardAdd = () => {
    const values = getValues();

    const cardValue = String(values.CreditCard).trim();
    const cardNumber = String(values.CreditCardNumber).trim();
    const voucherNum = (values.VoucherNum?.toString() || "").trim();
    const creditSum = parseFloat(values.CreditSum);

    if (!cardValue || cardValue === "undefined" || cardValue === "null") {
      Swal.fire({
        text: "Please Select Credit Card",
        icon: "warning",
        iconColor: "red",
        toast: true,
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    } else if (!cardNumber || cardNumber.length !== 4) {
      Swal.fire({
        text: "Please add valid Credit Card No",
        icon: "warning",
        iconColor: "red",
        toast: true,
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    } else if (!voucherNum || voucherNum.length === 0) {
      Swal.fire({
        text: "Please add Authorization code",
        icon: "warning",
        iconColor: "red",
        toast: true,
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    } else if (!creditSum || creditSum === 0) {
      Swal.fire({
        text: "Please add Valid Amount",
        icon: "warning",
        iconColor: "red",
        toast: true,
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    const selectedCard = CreditCardList.find(
      (card) => card.Name === values.CreditCard,
    );

    const newEntry = {
      CashAccount: selectedCard?.AccountCode || 1201011,
      CreditCard: values.CreditCard,
      CreditCardNumber: values.CreditCardNumber,
      CreditSum: values.CreditSum,
      VoucherNum: values.VoucherNum,
    };

    const updatedList = [...bankData, newEntry];
    setBankData(updatedList);
    setValue("oCCPay", updatedList);

    PaymentsCalculations();
    setRadioKey((k) => k + 1);
    setValue("CreditCard", "");
    lastValidValuesRef.current = {
      ...lastValidValuesRef.current,
      CreditSum: 0,
    };
    setValue("CreditCardNumber", "");
    setValue("VoucherNum", "");
    setValue("CreditSum", "");
  };

  const handleOnChangeCreditValue = (e) => {
    const { name, value } = e.target;

    if (name === "VoucherNum") {
      if (value.length > 10) {
        Swal.fire({
          text: "Authorization Code must be in 10 digits",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        setValue("VoucherNum", value.slice(0, 10));
        return;
      }
    }

    if (name === "CreditSum") {
      const creditSum = parseFloat(value);
      const dueAmount = parseFloat(watch("DueAmount"));

      if (creditSum > dueAmount) {
        Swal.fire({
          text: "Paid Value should not be greater than Total Due Amount",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        setValue("CreditSum", lastValidValuesRef.current.CreditSum);
        return;
      }
      lastValidValuesRef.current = {
        ...lastValidValuesRef.current,
        CreditSum: creditSum,
      };
    }

    // if (name === "CreditCardNumber" && value.length === 4) {
    //   const nextInput = document.querySelector('input[name="CreditSum"]');
    //   nextInput?.focus();
    // }
  };

  const handleSave = () => {
    try {
      const checkedRows = Array.isArray(checkedRowsRef?.current)
        ? checkedRowsRef.current.filter(Boolean)
        : [];

      const isCNCActive =
        watch("CNC") === true &&
        (watch("JobWorkAt") || "").toUpperCase() === "ORP WORKSHOP";

      checkedRows.forEach((r) => (r.disabled = true));

      const processedItems = checkedRows.flatMap((row) => {
        const hasChildren = Array.isArray(row.oLines) && row.oLines.length > 0;

        if (!hasChildren) {
          return {
            ItemCode: row.ItemCode || "",
            ItemName: row.ItemName || "",
            Quantity: "1",
            LineFittingTime: isCNCActive ? 0 : Number(row.FittingTime) || 0,
            LineFittingCharge: isCNCActive ? 0 : Number(row.FittingCharge) || 0,
            FittingCharge: isCNCActive ? 0 : Number(row.FittingCharge) || 0,
            Price: Number(row.Price) || 0,
            DesiredDisc: row.DesiredDisc || "0",
            DocEntry: row.DocEntry || "",
            FTSQty: row.FTS_KWT || 0,
            WHSCode: row.DefaultWhs || "1000",
            Amount: Number(row.Price) || 0,
          };
        }
        return row.oLines.map((child) => ({
          ItemCode: child.ItemCode || child.Code || "",
          ItemName: child.ItemName || "",
          Quantity: String(child.Quantity || 1),
          LineFittingTime: isCNCActive
            ? 0
            : Number(child.Quantity || 1) * Number(child.FittingTime || 0),
          LineFittingCharge: isCNCActive ? 0 : Number(child.FittingCharge) || 0,
          FittingCharge: isCNCActive ? 0 : Number(child.FittingCharge) || 0,
          Price: Number(child.Price) || 0,
          DesiredDisc: child.DesiredDisc || "0",
          DocEntry: child.DocEntry || row.DocEntry || "",
          FTSQty: child.FTS_KWT || 0,
          WHSCode: child.Warehouse || row.DefaultWhs || "1000",
          Amount: Number(child.Quantity || 1) * Number(child.Price || 0),
        }));
      });
      const previousOLines = getValues("oLines") || [];
      const combined = [...previousOLines, ...processedItems];

      const seen = new Set();
      const unique = combined.filter((item) => {
        if (seen.has(item.ItemCode)) return false;
        seen.add(item.ItemCode);
        return true;
      });

      setValue("oLines", unique);
      setValue("rows", unique);
      calculateData();
      updateSummaryFields();
      updateFilteredListDisabledRows();

      checkedRowsRef.current = [];
    } catch (err) {
      console.error(" handleSave error:", err);
    }
  };
  const getbyidBPV2 = async (DocEntry) => {
    try {
      const res = await apiClient.get(`/BPV2?DocEntry=${DocEntry}`);

      if (res?.data?.success) {
        const data = res.data.values[0];
        onSelectBusinessPartner(data);
      }
    } catch (error) {
      console.error("Failed to fetch BPV2:", error);
    }
  };

  const onSubmitCustmoreModal = async (data) => {
    const UserId = localStorage.getItem("UserId");
    const CreatedBy = localStorage.getItem("UserName");
    const obj = {
      UserId: UserId,
      CreatedBy: CreatedBy,
      CardCode: data.CardCode,
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD HH:mm:ss"),
      CardName: (data?.CardName ?? "").toString().toUpperCase(),
      PhoneNumber1: data.PhoneNumber1,
      DocDate: dayjs(),
      PhoneNumber2: "",
      Email: data.Email,
      CardType: "C",
      GroupCode: data.GroupCode === true ? "102" : "100",
      Status: "1",
      Series: "-1",
      Currency: "INR",
      LicTradNum: "",
      Cellular: "",
      Fax: "",
      validFor: "1",
      frozenFor: "0",
      ValidComm: "",
      Remarks: "",
      FreeTexts: "",
      BankCountr: "",
      ShipType: "35",
      Balance: "0",
      ChecksBal: "0",
      DNotesBal: "0",
      OrdersBal: "0",
      DNoteBalFC: "0",
      OrderBalFC: "0",
      DNoteBalSy: "0",
      OrderBalSy: "0",
      BalanceSys: "0",
      BalanceFC: "0",
      ValidFrom: "01/01/1900 00:00:00",
      ValidTo: "01/01/2099 00:00:00",
      FrozenFrom: "01/01/1900 00:00:00",
      FrozenTo: "01/01/1900 00:00:00",
      GroupNum: "1050",
      IntrstRate: "0",
      ListNum: "1291",
      Discount: "0",
      CreditLine: "0",
      DebtLine: "0",
      CardFName: "",
      DunTerm: "0",
      AutoPost: "1",
      DflIBAN: "",
      HldCode: "0",
      SlpCode: "",
      BankCode: "",
      BankName: "",
      DflSwift: "",
      AttcEntry: "",
      CardValid: "",
      CrCardNum: "0",
      DflBranch: "",
      HouseBank: "0",
      HsBnkIBAN: "",
      OwnerCode: "",
      AvrageLate: "",
      Country: "",
      CreditCard: "",
      DflAccount: "",
      HousBnkAct: "",
      HousBnkBrn: "",
      HousBnkCry: "",
      HsBnkSwift: "",
      OwnerIdNum: "",
      BankCtlKey: "",
      ContactPerson: "",
      MandateID: "",
      DiscRel: "",
      SignDate: "2026-02-28",
      CntctPrsn: "",
      DfltBilled: "0",
      DfltShiped: "0",
      FatherCard: "",
      FatherType: "",
      DebPayAcct: "203000",
      DpmClear: "",
      DpmIntAct: "",
      DpmDppAct: "203000",
      DpmOpnDebAct: "140060",
      TaxId0: "",
      TaxId1: "",
      TaxId2: "",
      TaxId3: "",
      TaxId4: "",
      TaxId5: "",
      TaxId6: "",
      TaxId7: "",
      TaxId8: "",
      TaxId9: "",
      TaxId10: "",
      TaxId11: "",
      TaxId13: "",
      WTLiable: "0",
      CrtfcateNO: "",
      ExpireDate: "",
      NINum: "",
      TypWTReprt: "",
      WTTaxCat: "",
      SurOver: "0",
      Remark1: "",
      ConCerti: "",
      ThreshOver: "0",
      VendTID: "",
      WTaxCodesAllowed: "",
      UseShpdGd: "0",
      AccCritria: "",
      oLines: [],
      oCPLines: [],
      oBPBankAccLines: [],
    };

    try {
      const response = await apiClient.post(`/BPV2/V2`, obj);
      if (response.data && response.data.success) {
        const data = response.data.ID;
        getbyidBPV2(data);

        Swal.fire({
          text: "Customer Created Successfully",
          icon: "success",
          showConfirmButton: false,
          toast: true,
          timer: 1500,
        });
      } else {
        const errorMessage =
          response.data?.message || "Failed to create customer";
        Swal.fire({
          text: errorMessage,
          icon: "error",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      Swal.fire({
        text: error?.message || "Failed to create customer",
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const onSubmit = async (data) => {
    const allFormData = getValues();

    const qtyLess = oLines.filter(
      (line) =>
        (line.IssueStatus === "P-ISSUED" || line.IssueStatus === "C-ISSUED") &&
        line.Quantity < line.OldQuantity,
    ).length;
    const Qty = oLines.filter(
      (line) => line.Quantity === "" || line.Quantity === undefined,
    ).length;
    if (allFormData.CardName === "") {
      Swal.fire({
        text: "Please Select Customer",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    } else if (oLines.length === 0) {
      Swal.fire({
        text: "Please Select Product",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    } else if (
      allFormData.Shipping === true &&
      Number(allFormData.ShippingAmt) <= 0
    ) {
      Swal.fire({
        text: "Shipping charges should not be zero !",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    } else if (Qty > 0) {
      Swal.fire({
        text: "Item Quantity should not be zero !",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    } else if (qtyLess > 0) {
      Swal.fire({
        text: "Item Quantity Cannot be less than issue quantity !",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    // else if (
    //   watch("DirectInvoice") === true &&
    //   allFormData.AdvancePayment > 0 &&
    //   allFormData.AdvancePayment < 100
    // ) {
    //   Swal.fire({
    //     text: "100% Payment Compulsory for this customer",
    //     icon: "warning",
    //     toast: true,
    //     showConfirmButton: false,
    //     timer: 2000,
    //     timerProgressBar: true,
    //   });
    //   return;
    // }
    else if (Number(allFormData.TotalDocAmt || 0) === 0) {
      Swal.fire({
        text: "Total Document value should not be zero !",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    } else if (
      allFormData.AdvancePayment > 0 &&
      allFormData.AdvancePayment < 50 &&
      allFormData.OrderNo === ""
    ) {
      Swal.fire({
        text: "50% Payment Compulsory for this Order",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    } else if (allFormData.QuotStatus === "0" || allFormData.QuotStatus === 0) {
      Swal.fire({
        text: "Please Update Order To Add More Items",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    const UserId = localStorage.getItem("UserId");
    const CreatedBy = localStorage.getItem("UserName");
    const obj = {
      DocNum: data?.DocNum || null,
      UserId: SaveUpdateName === "Update" ? data.UserId : String(UserId),
      CreatedBy: SaveUpdateName === "Update" ? data.CreatedBy : CreatedBy,
      DocDate: dayjs(data.DocDate).format("YYYY-MM-DD"),
      Status: data.Status === `OPEN` ? "1" : data.Status,
      JobRemarks: (data.JobRemarks ?? "").toUpperCase(),
      JobWorkAt: allFormData.CNC === true ? "CNC" : "ORP Workshop",
      SparesAmount: String(data.SparesAmount),
      DesiredDisc: String(data.DesiredDisc),
      ModifiedBy: data.DocEntry ? CreatedBy : "",
      DesiredDiscAmt: String(data.DesiredDiscAmt),
      SpecialDisc: String(data.SpecialDisc || "0"),
      SpecialDiscAmt: String(data.SpecialDiscAmt),
      SparesNetAmt: String(data.SparesNetAmt),
      FittingCharge: String(data.FittingCharge),
      TotalDocAmt: String(data.TotalDocAmt),
      FittingTimeReq: String(data.FittingTimeReq),
      SpecialDiscBy: String(watch("SpecialDisc") > 0 ? CreatedBy : ""),
      SpecialDiscDate: String(dayjs(data.SpecialDiscDate).format("YYYY-MM-DD")),
      SpecialDiscRemarks: data.SpecialDiscRemarks,
      AdvancePayment: String(data.AdvancePayment),
      AdvanceAmount: String(data.AdvanceAmount),
      DueAmount: String(data.DueAmount),
      PaidAmount: String(data.PaidAmount),
      PaidAmountPer: String(data.PaidAmountPer),
      AdvanceReceiptNo: String(data.AdvanceReceiptNo),
      ReceiptDate: String(dayjs(data.ReceiptDate).format("YYYY-MM-DD")),
      ModelModifiedBy: CreatedBy,
      Type: String(data.ServiceOrder === true ? "Service" : "Item"),
      RoundingAmt: String(data.RoundingAmt || "0"),
      CardName: data.CardName,
      PhoneNumber1: String(data.PhoneNumber1),
      IsDupliQuot: data.IsDupliQuot,
      CardCode: String(data.CardCode),
      GroupCode: String(data.GroupCode),
      SalesHistory: String(data.SalesHistory),
      CustomerBalance: String(data.CustomerBalance),
      DirectInvoice: data.DirectInvoice === true ? "1" : "0",
      SpecialOrder: data.SpecialOrder === true ? "1" : "0",
      DeliveredLater: data.DeliveredLater === true ? "1" : "0",
      CNC: data.CNC === true ? "1" : "0",
      ServiceOrder: data.ServiceOrder === true ? "1" : "0",
      Shipping: data.Shipping === true ? "1" : "0",
      ShippingAmt: String(data.ShippingAmt),
      Approver: data.CRApproved === true ? CreatedBy : "",
      ApprovalStatus: data.CRApproved === true ? "1" : "0",
      TotalPartsValue: String(data.TotalPartsValue),
      NetPartsValue: String(data.NetPartsValue),
      ServiceAndInstallation: String(data.ServiceAndInstallation),
      OrderNo: String(data.OrderNo),
      OrderType: String(data.OrderType),
      OrderSubType: String(data.OrderSubType),
      SAPSyncSO: String(data.SAPSyncSO),
      SAPSyncDP: String(data.SAPSyncDP),
      SAPSyncPAY: String(data.SAPSyncPAY),
      SAPSyncCancel: String(data.SAPSyncCancel),
      WalkIn: data.WalkIn === true ? "1" : "0",
      InvoiceStatus: String(data.InvoiceStatus),
      SAPDocEntry: String(data.SAPDocEntry),
      SAPDocNum: String(data.SAPDocNum),
      CancelRemarks: data.CancelRemarks,

      VehicleDocEntry: String(data.VehicleDocEntry),
      CountryCode: "KW",
      // DirectInvoice: String("0"),
      TaxAmt: "0",
      TaxCode: "",
      CustomsDutyPer: "0",
      CustomsDutyAmt: "0",
      Currency: "KWD",
      CurrencyRate: "0",
      CurrAmt: "0",
      SendWPAttach: "",
      CurrApproLevel: "",
      DiscApproRemarks: "",

      Year: String(data.Year),
      Make: String(data.Make),
      Model: String(data.Model),
      oLines: oLines.map((line) => ({
        CreatedBy: CreatedBy,
        UserId: String(UserId),
        Status: "1",
        Currency: "KWD",
        ItemCode: String(line.ItemCode),
        Quantity: String(line.Quantity),
        Price: String(line.Price),
        WHSCode: String(line.WHSCode),
        LineNetAmount: "0",
        Amount: String(line.Amount),
        DesiredDisc: String(line.DesiredDisc),
        LineFittingTime: String(line.LineFittingTime || "0"),
        LineFittingCharge: String(line.LineFittingCharge),
        LineTotalAmount: String(0),
        QuotStatus: line.QuotStatus === undefined ? "1" : line.QuotStatus,
        ItemName: line.ItemName,
        IssueQuantity: String(line.IssueQuantity || "0"),
        TaxCode: "0",
        TaxPer: String(0),
        TaxAmt: String(0),
      })),
      oCashPay:
        data.CashPaid > 0
          ? [
              {
                UserId: String(UserId),
                CreatedBy: CreatedBy,
                CashSum: String(data.CashPaid),
                CashAccount: "1201011",
                TaxDate: String(dayjs(data.TaxDate).format("YYYY-MM-DD")),
              },
            ]
          : [],
      oCCPay: (bankData || []).map((creditCard) => ({
        UserId: String(UserId),
        CreatedBy: CreatedBy,
        CreditCard: String(creditCard.CreditCard),
        CreditAcct: String(creditCard.CashAccount),
        CreditCardNumber: String(creditCard.CreditCardNumber),
        PaymentMethodCode: "0",
        VoucherNum: String(creditCard.VoucherNum),
        CreditSum: String(creditCard.CreditSum),
      })),
      BankPay:
        data.TransferSum > 0
          ? [
              {
                UserId: String(UserId),
                CreatedBy: CreatedBy,
                ModifiedBy: CreatedBy,
                TransferAccount: "1201022",
                TransferAccountName: "Bank NBK 2008134452",
                TransferReference: String(data.TransferReference),
                TransferDate: dayjs(data.TransferDate).format("YYYY-MMM-DD"),
                TransferSum: String(data.TransferSum || "0"),
              },
            ]
          : [],
    };

    if (data.TransferSum > 0 && !data.TransferReference) {
      Swal.fire({
        text: "Transfer Reference No is required",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    Swal.fire({
      text: `Do You Want Save`,
      icon: "question",
      input: "checkbox",
      inputValue: 0,
      inputPlaceholder: `Send Attachment Copy On Whatsapp`,
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then(async (results) => {
      if (results.isConfirmed) {
        obj.SendWPAttach = results.value === 1 ? true : false;

        setLoading(true);

        try {
          let res;

          if (SaveUpdateName === "SAVE") {
            res = await apiClient.post(`/quotationSo`, obj);
          } else if (SaveUpdateName === "UPDATE") {
            res = await apiClient.put(`/quotationSo/${data.DocEntry}`, obj);
          } else {
            setLoading(false);
            return Swal.fire({
              text: "Document Not Saved",
              icon: "info",
              toast: true,
              showConfirmButton: false,
              timer: 1500,
            });
          }

          if (res.data.success) {
            fetchOpenListData();
            fetchClosedListData();
            reset(initial);
            setLoading(false);
            Swal.fire({
              title: "Success!",
              icon: "success",
              text:
                allFormData.AdvancePayment < 50
                  ? `Quotation Save Successfully`
                  : `Order Update Successfully`,
              confirmButtonText: "Ok",
              timer: 1500,
            });
          } else {
            setLoading(false);
            Swal.fire({
              title: "Error!",
              text: res.data.message,
              icon: "warning",
              confirmButtonText: "Ok",
            });
          }
        } catch (error) {
          setLoading(false);
          Swal.fire({
            title: "Error!123",
            text: error,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      } else {
        Swal.fire({
          title: "Info!",
          text: "Document Not Saved",
          icon: "info",
          // toast: true,
          confirmButtonText: "Ok",
          timer: 1500,
        });
      }
    });
    // }
  };

  const fetchFormData = async (payload = {}) => {
    setLoading(true);

    try {
      const body = {
        // Supplier: payload.SAPDocNum || "",
        ItemName: payload.ItemName || "",
        ItemCode: payload.ItemCode || "",
        IsActive: payload.IsActive === true ? 0 : 1,
        Stock: payload.Stock === true ? 0 : 1,
      };

      const res = await apiClient.post(`/DynamicSearch/search`, body);

      if (res.data.success) {
        setFilteredList(res.data.values);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitDynamicSearch = (data) => {
    fetchFormData(data);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const handleClickModel = () => {
    setOpenModal(true);
    setSelectedRow(null);
    fetchFormData(initialItemSearch);
    getAllBPFormData();
  };

  const handleCloseModel = () => {
    setOpenModal(false);
    setSelectedRow(null);
    resetMdl(initialItemSearch);
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setValue("CreditCardNumber", "");
    setValue("CreditSum", 0);
    setValue("VoucherNum", "");
    setValue("CreditCard", "");
    lastValidValuesRef.current = {
      ...lastValidValuesRef.current,
      CreditSum: 0,
    };
  };

  const handleItemSearchTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetMdl1(initialCustCreation);
  };

  const handleTabChangeRight = (e, newtab) => {
    settab(newtab);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const round = (num, decimals = 2) =>
    Math.round((num + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;

  const onTop20Click = (item, Category) => {
    const cardCode = getValues("CardCode");
    if (!cardCode?.trim()) {
      Swal.fire({
        text: "Please Select Customer",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    if (watch("ServiceOrder")) {
      Swal.fire({
        text: "You Cannot select Items for Service Order",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    const currentOLines = getValues("oLines") || [];

    // Prevent duplicate
    if (currentOLines.some((p) => p.ItemCode === item.ItemCode)) {
      Swal.fire({
        toast: true,
        position: "center",
        icon: "warning",
        title: "Item Already Selected",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    const isCNCActive =
      watch("CNC") === true &&
      watch("JobWorkAt")?.toUpperCase() === "ORP WORKSHOP";

    const realFittingCharge = item.FittingCharge;

    const newLine = {
      ItemCode: item.ItemCode,
      ItemName: item.ItemName,
      WHSCode: item.WHSCode ?? "1000",
      Quantity: 1,
      Price: round(item.Price, 3),
      DesiredDisc: "0",
      Amount: item.Price,
      FTSQty: item.FTSQty,
      LineFittingTime: isCNCActive ? 0 : item.FittingTime,
      LineFittingCharge: isCNCActive ? 0 : realFittingCharge,
      FittingCharge: isCNCActive ? 0 : realFittingCharge,
      LineJobRemarks: item.LineJobRemarks,
      IssueQuantity: item.IssueQuantity,
    };

    const updatedOLines = [...currentOLines, newLine];
    setValue("oLines", updatedOLines);

    const price = Number(item.Price || 0);
    const quantity = 1;
    const total = price * quantity;

    const rows = getValues("rows") || [];

    const newRow = {
      ItemCode: item.ItemCode,
      DesiredDisc: item.DesiredDisc || "0",
      ItemName: item.ItemName,
      Price: price,
      Quantity: quantity,
      TotalAmt: total,
      LineFittingCharge: isCNCActive ? 0 : realFittingCharge,
      FittingCharge: isCNCActive ? 0 : realFittingCharge,
      IssueQuantity: item.IssueQuantity || "0",
      WHSCode: item.WHSCode ?? "1000",
    };

    const updatedRows = [...rows, newRow];
    setValue("rows", updatedRows);

    updateSummaryFields();
    calculateData();
  };

  const oLines = useWatch({ control, name: "oLines" });
  const [selectionModel, setSelectionModel] = useState([]);

  const handleRowDelete = (itemCode) => {
    const currentRows = structuredClone(getValues("oLines") || []);
    const updatedRows = currentRows.filter(
      (item) => item.ItemCode !== itemCode,
    );
    setValue("oLines", updatedRows, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("rows", updatedRows, { shouldValidate: true, shouldDirty: true });
    setSelectionModel((prev) => prev.filter((id) => id !== itemCode));

    checkedRowsRef.current = checkedRowsRef.current.filter(
      (row) => row.ItemCode !== itemCode,
    );
    updateFilteredListDisabledRows();
    calculateData();
  };

  const columns = [
    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 150,
    },
    {
      field: "ItemName",
      headerName: "ITEM DESCRIPTION",
      width: 425,
    },
    {
      field: "WHSCode",
      headerName: "WHS",
      width: 100,
    },
    {
      field: "Quantity",
      headerName: "QTY",
      width: 100,
      align: "right",
      headerAlign: "center",
      renderCell: (params) => {
        const index = (getValues("oLines") || []).findIndex(
          (r) => r.ItemCode === params.row.ItemCode,
        );
        return (
          <SmallInputFields
            name={`oLines.${index}.Quantity`}
            control={control}
            inputProps={{ style: { textAlign: "right" } }}
            readOnly={watch("ServiceOrder")}
            sx={{
              m: 0,
              p: 0,
              "& .MuiInputBase-root": { margin: 0, textAlign: "right" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { border: "none" },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "none" },
              },
            }}
            onChange={() => {
              const currentLines = getValues("oLines") || [];
              const row = currentLines[index];
              if (row) HandleTableOnChange(row, params.row);
            }}
          />
        );
      },
    },
    {
      field: "Price",
      headerName: "PRICE",
      width: 100,
      align: "right",
      // editable: true,
      headerAlign: "right",
    },
    {
      field: "DesiredDisc",
      headerName: "DISC%",
      width: 100,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "Amount",
      headerName: "TOTAL AMT",
      width: 100,
      align: "right",
      headerAlign: "right",
    },

    {
      field: "LineFittingCharge",
      headerName: "FITTING",
      width: 110,

      align: "right",
      headerAlign: "center",
      renderCell: (params) => {
        const index = (getValues("oLines") || []).findIndex(
          (r) => r.ItemCode === params.row.ItemCode,
        );
        return (
          <SmallInputFields
            name={`oLines.${index}.LineFittingCharge`}
            control={control}
            inputProps={{ style: { textAlign: "right" } }}
            sx={{
              m: 0,
              p: 0,
              "& .MuiInputBase-root": { margin: 0, textAlign: "right" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { border: "none" },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "none" },
              },
            }}
            onChange={() => {
              const currentLines = getValues("oLines") || [];
              const row = currentLines[index];
              if (row) HandleTableOnChange(row, params.row);
            }}
          />
        );
      },
    },
    {
      field: "FTSQty",
      headerName: "FTS",
      width: 110,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "IssueQuantity",
      headerName: "ISS QTY",
      width: 110,
      renderCell: (params) => params.value || "0",
      align: "right",
      headerAlign: "right",
    },
    {
      field: "IssueStatus",
      headerName: "STATUS",
      width: 110,
    },
    {
      field: "actions",
      headerName: "ACTION",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          color="error"
          onClick={() => handleRowDelete(params.row.ItemCode)}
        >
          <RemoveCircleIcon />
        </IconButton>
      ),
    },
  ];

  const ItemSearchcolumns = [
    {
      field: "ItemCode",
      headerName: "Item Code",
      width: 250,
      editable: true,
    },
    {
      field: "ItemName",
      headerName: "Item Description",
      width: 700,
      editable: true,
    },
    // {
    //   field: "D_FTS",
    //   headerName: "D-FTS",
    //   width: 120,
    //   editable: true,
    //   align: "right",
    //   headerAlign: "right",
    // },

    {
      field: "OH_KWT",
      headerName: "ON HAND",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "RSVD_KWT",
      // reserved
      headerName: "RESERVED",
      width: 120,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "FTS_KWT",
      headerName: "FREE TO SALE",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "Price",
      headerName: "PRICE",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
    // {
    //   field: "FittingCharge",
    //   headerName: "FITING",
    //   width: 120,
    //   editable: true,
    //   align: "right",
    //   headerAlign: "right",
    // },

    {
      field: "OrderQty",
      headerName: "ORDERED",
      width: 110,
      editable: true,
      align: "right",
      headerAlign: "right",
    },
  ];

  const HandleTableOnChange = (newRow) => {
    if (!newRow) return;
    const qty = Number(newRow.Quantity || 0);
    const price = Number(newRow.Price || 0);
    const fitting = Number(newRow.LineFittingCharge || 0);

    const amount = qty * price;

    const currentLines = getValues("oLines") || [];

    const updatedRows = currentLines.map((row) =>
      row.ItemCode === newRow.ItemCode
        ? {
            ...row,
            Quantity: qty,
            Price: price,
            LineFittingCharge: fitting,
            Amount: amount.toFixed(3),
          }
        : row,
    );

    const totalParts = updatedRows.reduce(
      (sum, row) => sum + Number(row.Amount || 0),
      0,
    );

    const totalFitting = updatedRows.reduce(
      (sum, row) => sum + Number(row.LineFittingCharge || 0),
      0,
    );

    const shipping = Number(getValues("ShippingAmt") || 0);
    const finalTotal = totalParts + totalFitting + shipping;

    const allFormData = getValues();
    const finNetPartsValue =
      finalTotal -
      Number(allFormData.DesiredDiscAmt) -
      Number(allFormData.SpecialDiscAmt);

    setValue("oLines", updatedRows);
    setValue("TotalPartsValue", totalParts.toFixed(3));
    setValue("NetPartsValue", finNetPartsValue.toFixed(3));
    setValue("ServiceAndInstallation", totalFitting.toFixed(3));
    setValue("TotalDocAmt", finalTotal.toFixed(3));
    setValue("DueAmount", finalTotal.toFixed(3));
    setValue("BalanceDueAmount", finalTotal.toFixed(3));

    if (watch("OrderNo") === "") {
      PaymentsCalculations();
    } else {
      PaymentCalcUpdateTimePaymentPer();
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
          Quotation List
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
                {tabData.map(({ value, label }) => (
                  <Tab key={value} value={value} label={label} />
                ))}
              </Tabs>

              {tabData.map(
                ({
                  value,
                  data,
                  query,
                  hasMore,
                  fetchMore,
                  handleSearch,
                  handleClear,
                }) => (
                  <TabPanel
                    key={value}
                    value={value}
                    style={{
                      overflow: "auto",
                      maxHeight: `calc(100% - 15px)`,
                      paddingLeft: 5,
                      paddingRight: 5,
                    }}
                    id={`ListScroll${value}`}
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
                        onChange={(e) => handleSearch(e.target.value)}
                        value={query}
                        onClickClear={handleClear}
                      />
                    </Grid>
                    <InfiniteScroll
                      style={{ textAlign: "center", justifyContent: "center" }}
                      dataLength={data.length}
                      hasMore={hasMore}
                      next={fetchMore}
                      loader={
                        <BeatLoader
                          color={
                            theme.palette.mode === "light" ? "black" : "white"
                          }
                        />
                      }
                      scrollableTarget={`ListScroll${value}`}
                      endMessage={<Typography>No More Records</Typography>}
                    >
                      {data.map((item, i) => (
                        <CardComponent
                          key={i}
                          title={
                            item.DocNum +
                            " " +
                            (item.OrderNo ? "| " + item.OrderNo : "")
                          }
                          subtitle={item.PhoneNumber1}
                          description={item.CardName}
                          searchResult={query}
                          // isSelected={oldOpenData === item.DocEntry}
                          onClick={() =>
                            fetchAndSetData(
                              item.DocEntry,
                              item.CardCode,
                              item.OrderNo,
                            )
                          }
                        />
                      ))}
                    </InfiniteScroll>
                  </TabPanel>
                ),
              )}
            </TabContext>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  const ClearFormData = () => {
    reset(initial);
    setBankData([]);
    setSaveUpdateName("SAVE");
    setSelectionModel([]);
    checkedRowsRef.current = [];
  };

  return (
    <>
      <Loader open={loading} />
      <Dialog
        open={open}
        // onClose={handleClose}
        scroll="paper"
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            width: "90vw",
            maxWidth: "370px",
            height: "50",
            maxHeight: "90",
            margin: "auto",
          },
        }}
      >
        <form onSubmit={handleSubmitMdl1(onSubmitCustmoreModal)}>
          <DialogTitle>
            <Grid item display={"flex"} justifyContent={"center"}>
              <PersonAddAlt1OutlinedIcon />
              <Typography textAlign={"center"} fontWeight={"bold"}>
                &nbsp;&nbsp;Customer Creation Form
              </Typography>
            </Grid>
          </DialogTitle>

          <Divider color="gray" />

          <DialogContent className="bg-light">
            <Grid container gap={2}>
              <Grid item xs={12} lg={12} textAlign={"center"}>
                <Controller
                  name="CardName"
                  control={controlMdl1}
                  rules={{ required: "Customer Name is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="CUSTOMER NAME"
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : ""}
                      rows={1}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} lg={12} textAlign={"center"}>
                <Controller
                  name="PhoneNumber1"
                  control={controlMdl1}
                  // rules={{
                  //   required: "Contact No is required",
                  //   validate: (value) =>
                  //     value && value.trim() !== ""
                  //       ? true
                  //       : "Contact No is required",
                  // }}
                  rules={{
                    validate: (value) =>
                      value.replace(/\D/g, "").length > 3 ||
                      "Contact No is required",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <PhoneNumber
                      defaultCountry="kw"
                      label="CONTACT NUMBER"
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || "")}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} lg={12} textAlign={"center"}>
                <Controller
                  name="Email"
                  control={controlMdl1}
                  rules={{
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputTextField
                      label="EMAIL"
                      {...field}
                      error={!!error}
                      helperText={error ? error.message : ""}
                      rows={1}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "space-between" }}>
            <Button
              variant="contained"
              color="success"
              type="submit"
              size="small"
              sx={{ color: "white" }}
            >
              Save
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleClose}
              size="small"
            >
              Close
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
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
            onClick={ClearFormData}
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
              Quotation So
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
                <Grid container spacing={2} justifyContent="space-between">
                  <Grid item xs={12} lg={3} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
                        <Grid
                          container
                          alignItems="center"
                          justifyContent={"center"}
                          paddingLeft={3.5}
                        >
                          <Grid item lg="9" md="9" sm="10" xs="10">
                            <Controller
                              name="CardCode"
                              control={control}
                              render={({ field }) => (
                                <InputTextField
                                  {...field}
                                  size="small"
                                  label="CUSTOMER ID"
                                  autoFocus
                                  readOnly
                                  disabled={!!watch("DocEntry")}
                                  placeholder="Search ..."
                                  sx={{ width: "100%" }}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          color="primary"
                                          onClick={OpenDailog}
                                          disabled={!!watch("DocEntry")}
                                        >
                                          <SearchIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              )}
                            />
                          </Grid>

                          <Grid
                            item
                            lg="auto"
                            md="auto"
                            sm="auto"
                            xs="auto"
                            className="d-flex align-items-end ps-0"
                            style={{
                              marginLeft: 5,
                            }}
                          >
                            <IconButton
                              onClick={handleClickOpen}
                              size="small"
                              sx={{
                                backgroundColor: "green",
                                borderRadius: "20%",
                                color: "white",
                                p: 0.8,
                                "&:hover": {
                                  backgroundColor: "darkgreen",
                                },
                              }}
                              disabled={SaveUpdateName === "UPDATE"}
                            >
                              <ContactMailOutlinedIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                        <SearchModel
                          open={searchmodelOpen}
                          onClose={SearchModelClose}
                          onCancel={SearchModelClose}
                          title="Select Customer"
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
                                    color={theme.palette.primary.main}
                                  />
                                }
                                scrollableTarget="getListForCreateScroll"
                                endMessage={
                                  <Typography>No More Records</Typography>
                                }
                              >
                                {getListData.map((item, index) => (
                                  <CardComponent
                                    key={item.DocEntry}
                                    title={item.CardCode}
                                    subtitle={item.PhoneNumber1}
                                    description={item.CardName}
                                    searchResult={getListquery}
                                    onClick={() => {
                                      onSelectBusinessPartner(item);
                                    }}
                                  />
                                ))}
                              </InfiniteScroll>
                            </>
                          }
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="CardName"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="CUSTOMER NAME"
                              readOnly={true}
                              {...field}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="PhoneNumber1"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="CONTACT NUMBER"
                              {...field}
                              readOnly={true}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="DocDate"
                          control={control}
                          render={({ field }) => (
                            <InputDatePickerField
                              label="DOCUMENT DATE"
                              name={field.name}
                              readOnly={true}
                              value={field.value}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="Vehicle"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="VEHICLE"
                              readOnly={true}
                              {...field}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item textAlign="center">
                        <Controller
                          name="OrderNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="SO NO"
                              readOnly={true}
                              {...field}
                              rows={1}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} lg={3} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
                        <Controller
                          name="DocNum"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="DOCUMENT NO"
                              {...field}
                              rows={1}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="SalesHistory"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="SALES HISTORY"
                              {...field}
                              rows={1}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="CustomerBalance"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="CUSTOMER BALANCE"
                              {...field}
                              rows={1}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Controller
                          name="JobRemarks"
                          control={control}
                          render={({ field }) => (
                            <InputTextArea
                              rows={2.5}
                              label="JOB WORK DETAILS"
                              {...field}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign="center">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          sx={{
                            color: "white",
                            minWidth: 220,
                            mt: 1,
                            p: 1,
                            mb: 2,
                          }}
                          onClick={handleClickModel}
                          disabled={
                            !watch("CardCode") ||
                            watch("ServiceOrder") ||
                            watch("Status") === "0"
                          }
                        >
                          Search Item
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} lg={5.5} md={4}>
                    <Grid
                      item
                      md={12}
                      lg={12}
                      xs={12}
                      textAlign={"center"}
                      mt={1}
                    >
                      <Typography
                        disabled
                        bgcolor={"silver"}
                        style={{ padding: 4 }}
                      >
                        Top 20 Product
                      </Typography>
                    </Grid>
                    <div style={{ height: 300, overflowY: "auto", padding: 5 }}>
                      {top20ItemsList?.map((item, index) => (
                        <Card
                          elevation={5}
                          key={index}
                          onClick={() => {
                            onTop20Click(item, item.SUBCATEGORY);
                          }}
                          sx={{
                            height: "80px",
                            width: "100%",
                            mb: 1,
                            cursor: "pointer",
                          }}
                        >
                          <CardContent
                            sx={{
                              p: "0.5rem",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              "&:last-child": { pb: "0.5rem" },
                            }}
                            className="quotationCard"
                          >
                            <Box sx={{ display: "flex" }}>
                              <Box sx={{ width: "40%" }}>
                                <Box
                                  sx={{
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "70%",
                                  }}
                                  title={item.ItemCode}
                                >
                                  <Typography variant="body2">
                                    {item.ItemCode}
                                  </Typography>
                                </Box>

                                <Typography variant="body2">
                                  {item.FTSQty}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "60%",
                                  textAlign: "left",
                                  fontSize: 13,
                                }}
                                title={item.ItemName}
                              >
                                <Typography variant="body2">
                                  {item.ItemName}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </Grid>
                </Grid>

                <Grid container lg={11} md={12} mt={2}>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="OrderType"
                      control={control}
                      render={({ field }) => (
                        <InputsmallFilds
                          label="ORDER TYPE"
                          {...field}
                          rows={1}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="Approver"
                      control={control}
                      render={({ field }) => (
                        <InputsmallFilds
                          label="CR APPROVED BY"
                          {...field}
                          rows={1}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="CreatedBy"
                      control={control}
                      render={({ field }) => (
                        <InputsmallFilds
                          label="CREATED BY"
                          {...field}
                          rows={1}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="Status"
                      control={control}
                      render={({ field }) => (
                        <InputsmallFilds
                          label="STATUS"
                          {...field}
                          rows={1}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="SAPDocNum"
                      control={control}
                      render={({ field }) => (
                        <InputsmallFilds
                          label="SAP SO NO"
                          {...field}
                          rows={1}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="OrderNo"
                      control={control}
                      render={({ field }) => (
                        <SmallInputFields
                          label="SO NO"
                          {...field}
                          rows={1}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container lg={11} md={12} px={2} py={2}>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="DirectInvoice"
                      control={control}
                      defaultValue={false}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              checked={value}
                              onChange={(e) => {
                                const checkedValue = e.target.checked;
                                onChange(checkedValue);
                              }}
                            />
                          }
                          label="Direct Invoice"
                          sx={{ textAlign: "center", width: 140 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={2}
                    sm={4}
                    lg={1.5}
                    textAlign={"center"}
                  >
                    <Controller
                      name="CNC"
                      control={control}
                      defaultValue={false}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              checked={value}
                              disabled={
                                watch("ServiceOrder") ||
                                oLines.filter(
                                  (item) =>
                                    item.QuotStatus === "0" ||
                                    Number(item.IssueQuantity) > 0,
                                ).length !== 0
                              }
                              onChange={(e) => {
                                const checkedValue = e.target.checked;
                                onChange(checkedValue);
                              }}
                            />
                          }
                          label="CNC"
                          sx={{ textAlign: "center", width: 80 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={2}
                    sm={4}
                    lg={2.5}
                    textAlign={"center"}
                  >
                    <Controller
                      name="DeliveredLater"
                      control={control}
                      defaultValue={false}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              disabled={watch("CNC") === false}
                              checked={value}
                              onChange={(e) => {
                                const checkedValue = e.target.checked;
                                onChange(checkedValue);
                              }}
                            />
                          }
                          label="Delivered Later"
                          sx={{ textAlign: "center", width: 140 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="ServiceOrder"
                      control={control}
                      defaultValue={false}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              disabled={watch("CNC") === true}
                              checked={value}
                              onChange={(e) => {
                                const checkedValue = e.target.checked;
                                onChange(checkedValue);
                                handleOnCheckBoxChange(checkedValue);
                              }}
                            />
                          }
                          label="Service Order"
                          sx={{ textAlign: "center", width: 130 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="Shipping"
                      control={control}
                      defaultValue={false}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          label="Shipping"
                          control={
                            <Checkbox
                              checked={value}
                              onChange={(e) => {
                                const checkedValue = e.target.checked;
                                onChange(checkedValue);
                                if (checkedValue === false) {
                                  setValue("ShippingAmt", 0);
                                  calculateData();
                                }
                              }}
                            />
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="CRApproved"
                      control={control}
                      defaultValue={false}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              checked={value}
                            />
                          }
                          label="CR Approved"
                          sx={{ textAlign: "center", width: 130 }}
                          disabled={
                            watch("OrderNo") ||
                            (!watch("DocEntry") && watch("SpecialDisc") > 0)
                          }
                          checked={value}
                          onChange={(e) => {
                            const checkedValue = e.target.checked;
                            onChange(checkedValue);
                            if (checkedValue && watch("Approver") === "") {
                              setValue(
                                "Approver",
                                localStorage.getItem("UserName"),
                              );
                            } else {
                              setValue("Approver", "");
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container md={12} px={2} py={1}>
                  <Paper sx={{ width: "100%" }}>
                    <DataGrid
                      className="datagrid-style"
                      rows={oLines}
                      columns={columns}
                      getRowId={(row) => row.ItemCode}
                      columnHeaderHeight={35}
                      rowHeight={40}
                      hideFooter
                      // processRowUpdate={HandleTableOnChange}
                      onProcessRowUpdateError={(error) => console.log(error)}
                      autoHeight="false"
                      sx={gridSx}
                    />
                  </Paper>
                </Grid>

                <Grid container lg={12} md={12} spacing={2} py={1}>
                  <Grid item xs={12} md={2}>
                    <Grid container direction="column">
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <Controller
                          name="TotalPartsValue"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="PARTS VALUE"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <SmallInputFields
                          name="ServiceAndInstallation"
                          control={control}
                          label="SERVICE & INSTALL"
                          width={140}
                          readOnly
                        />{" "}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Grid container direction="column">
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <SmallInputFields
                          name="DesiredDisc"
                          control={control}
                          label="DISC (%)"
                          width={140}
                          onChange={calculateData}
                        />
                      </Grid>
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <SmallInputFields
                          name="RoundingAmt"
                          control={control}
                          label="ROUNDING OFF"
                          width={140}
                          onChange={calculateData}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Grid container direction="column">
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <Controller
                          name="DesiredDiscAmt"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="DISC AMT"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <Controller
                          name="NetPartsValue"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="NET PARTS VALUE"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Grid container direction="column">
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <SmallInputFields
                          name="SpecialDisc"
                          control={control}
                          label="SPECIAL DISC (%)"
                          width={140}
                          onChange={calculateData}
                        />
                      </Grid>
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <SmallInputFields
                          name="ShippingAmt"
                          control={control}
                          label="SHIPPING"
                          width={140}
                          onChange={calculateData}
                          readOnly={watch("Shipping") === false}
                        />{" "}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Grid container direction="column">
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <Controller
                          name="SpecialDiscAmt"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="SPECIAL DISC AMT"
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                      >
                        <Controller
                          name="TotalDocAmt"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="TOTAL DOC VALUE"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Grid container direction="column">
                      <Grid
                        item
                        sm={3}
                        md={4}
                        lg={2}
                        xs={6}
                        textAlign={"center"}
                        p={1}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={CalDesiredDiscountBtn}
                          disabled={
                            watch("CardCode") === "" || watch("Status") === "0"
                          }
                        >
                          CALC DISC
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                {getValues("OrderNo") === "" && (
                  <Grid container lg={12} md={12} px={1}>
                    <Grid item width="100%" m={1} border="1px solid grey">
                      <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="disabled tabs example"
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        <Tab value={0} label="Cash" />
                        <Tab value={1} label="Credit card" />
                        <Tab value={2} label="Bank Transfer" />
                      </Tabs>
                      <Divider />
                      {tabValue === 0 && (
                        <>
                          <Grid container lg={9} md={12} padding={2}>
                            <Grid item sm={5} md={6} lg={4} xs={12}>
                              <SmallInputFields
                                name="CashPaid"
                                control={control}
                                label="CASH PAID"
                                width={140}
                                onChange={PaymentsCalculations}
                                type="Number"
                                inputProps={{ min: 0 }}
                              />
                            </Grid>
                            <Grid item sm={5} md={6} lg={4} xs={12}>
                              <Controller
                                name="CashAccount"
                                control={control}
                                defaultValue={"1201011"}
                                render={({ field }) => (
                                  <InputSearchSelectTextField
                                    {...field}
                                    label="ACCOUNT CODE"
                                    data={[
                                      { key: "1201011", value: "Cash A/C" },
                                    ]}
                                    readOnly={true}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item sm={5} md={6} lg={4} xs={12}>
                              <Controller
                                name="ReceiptDate"
                                control={control}
                                render={({ field }) => (
                                  <InputDatePickerField
                                    label="RECEIPT DATE"
                                    name={field.name}
                                    value={dayjs(undefined)}
                                    readOnly={true}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {tabValue === 1 && (
                        <>
                          <Grid container padding={2}>
                            <Grid container item lg={6} xs={12} md={6} sm={6}>
                              <RadioButtonsField
                                control={control}
                                key={radioKey}
                                name="CreditCard"
                                data={CreditCardList.map((card) => ({
                                  value: card.Name,
                                  label: card.Name,
                                }))}
                                // value={selectedCard}
                              />

                              <Grid item sm={12} md={6} lg={6} xs={12}>
                                <Controller
                                  name="CreditCardNumber"
                                  control={control}
                                  render={({ field }) => (
                                    <InputTextField
                                      label="CREDIT CARD NO"
                                      type="Number"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        handleOnChangeCreditValue(e);
                                        if (e.target.value.length === 4) {
                                          document
                                            .querySelector(
                                              'input[name="CreditSum"]',
                                            )
                                            ?.focus();
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid item sm={12} md={6} lg={6} xs={12}>
                                <SmallInputFields
                                  name="CreditSum"
                                  control={control}
                                  label="CREDIT SUM"
                                  onChange={handleOnChangeCreditValue}
                                  type="Number"
                                />
                              </Grid>

                              <Grid item sm={12} md={6} lg={6} xs={12}>
                                <Controller
                                  name="VoucherNum"
                                  control={control}
                                  render={({ field }) => (
                                    <InputTextField
                                      label="AUTHORIZATION CODE"
                                      type="text"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        handleOnChangeCreditValue(e);
                                      }}
                                    />
                                  )}
                                />
                              </Grid>

                              <Grid item sm={12} md={6} lg={6} xs={12}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  style={{
                                    padding: 5,
                                    marginLeft: 8,
                                    marginTop: 5,
                                    paddingLeft: 30,
                                    paddingRight: 30,
                                  }}
                                  onClick={handleOnCreditCardAdd}
                                >
                                  ADD
                                </Button>
                              </Grid>
                            </Grid>
                            <Grid item lg={6} xs={12} md={6} sm={6}>
                              <TableContainer
                                component={Paper}
                                sx={{ overflow: "auto", maxHeight: 200 }}
                              >
                                <Table
                                  stickyHeader
                                  size="small"
                                  className="infiniteScroll table-style-scroll"
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>A/C CODE</TableCell>
                                      <TableCell>CARD NAME</TableCell>
                                      <TableCell>CARD NO</TableCell>
                                      <TableCell>AMOUNT</TableCell>
                                      <TableCell>ACTION</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {bankData.map((data, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {data.CashAccount}
                                        </TableCell>
                                        <TableCell>{data.CreditCard}</TableCell>
                                        <TableCell>
                                          {data.CreditCardNumber}
                                        </TableCell>
                                        <TableCell>{data.CreditSum}</TableCell>
                                        <TableCell>
                                          <IconButton
                                            onClick={() => {
                                              handleDeleteCreditAmt(index);
                                            }}
                                          >
                                            <RemoveCircleIcon
                                              sx={{ color: "red" }}
                                            />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                          </Grid>
                        </>
                      )}
                      {tabValue === 2 && (
                        <>
                          <Grid container padding={2}>
                            <Grid sm={12} md={6} lg={3} xs={12}>
                              <SmallInputFields
                                name="TransferSum"
                                control={control}
                                label="TRANSFER SUM"
                                width={140}
                                onChange={PaymentsCalculations}
                                type="Number"
                              />
                            </Grid>
                            <Grid sm={12} md={6} lg={3} xs={12}>
                              <Controller
                                name="TransferReference"
                                control={control}
                                render={({ field }) => (
                                  <InputTextField
                                    label="TRANSFER REF NO"
                                    type="text"
                                    {...field}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} sm={6} lg={3}>
                              <Controller
                                name="TransferAccount"
                                control={control}
                                defaultValue={"1201022"}
                                render={({ field }) => (
                                  <InputSearchSelectTextField
                                    {...field}
                                    label="TRANSFER ACCOUNT"
                                    data={[
                                      {
                                        key: "1201022",
                                        value: "Bank NBK 2008134452",
                                      },
                                    ]}
                                    readOnly={true}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item sm={5} md={6} lg={3} xs={12}>
                              <Controller
                                name="TransferDate"
                                control={control}
                                render={({ field }) => (
                                  <InputDatePickerField
                                    label="TRANSFER DATE"
                                    name={field.name}
                                    value={dayjs(undefined)}
                                    readOnly={true}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>
                )}

                <Grid container lg={12} md={12} spacing={2} py={1}>
                  <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                    <Controller
                      name="AdvancePayment"
                      control={control}
                      render={({ field }) => (
                        <SmallInputTextField
                          label="ADVANCE(%)"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                    <Controller
                      name="AdvanceAmount"
                      control={control}
                      render={({ field }) => (
                        <SmallInputTextField
                          label="ADVANCED AMT"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                    <Controller
                      name="PaidAmountPer"
                      control={control}
                      render={({ field }) => (
                        <SmallInputTextField
                          label="PAID AMT(%)"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                    <Controller
                      name="PaidAmount"
                      control={control}
                      render={({ field }) => (
                        <SmallInputTextField
                          label="PAID AMT"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                    <Controller
                      name="DueAmount"
                      control={control}
                      render={({ field }) => (
                        <SmallInputTextField
                          label="DUE AMT"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                    <Controller
                      name="AdvanceReceiptNo"
                      control={control}
                      render={({ field }) => (
                        <SmallInputTextField
                          label="ADV RCT NO"
                          {...field}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                    <Controller
                      name="ReceiptDate"
                      control={control}
                      render={({ field }) => (
                        <InputDatePickerField
                          label="RCT DATE"
                          name={field.name}
                          value={field.value ? dayjs(field.value) : undefined}
                          readOnly={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item lg={2} md={3} xs={6} textAlign={"center"}>
                    <Controller
                      name="time"
                      control={control}
                      render={({ field }) => (
                        <InputTimePicker
                          {...field}
                          label="FROM"
                          readOnly={true}
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
                sx={{ color: "white" }}
                name={SaveUpdateName}
                type="submit"
                disabled={
                  (SaveUpdateName === "SAVE" && !perms.IsAdd) ||
                  (SaveUpdateName === "UPDATE" && !perms.IsEdit) ||
                  watch("CardCode") === "" ||
                  watch("Status") === "0"
                }
              >
                {SaveUpdateName}
              </Button>
              <Grid item>
                <PrintMenu
                  disabled={SaveUpdateName === "SAVE"}
                  type={watch("OrderNo") ? "SO" : "SQ"}
                  DocEntry={watch("DocEntry")}
                  PrintData={PrintData}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { lg: "none" },
          "& .MuiDrawer-paper": {
            top: "70px",
            left: "75px",
            width: "80vw",
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Dialog
        fullScreen
        open={openModal}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseModel}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography
              sx={{ ml: 2, flex: 1 }}
              variant="h6"
              component="div"
              textAlign={"center"}
              fontWeight={10}
            >
              ITEM SEARCH
            </Typography>
            <Button
              autoFocus
              color="inherit"
              sx={{ color: "white" }}
              onClick={() => {
                handleSubmitMdl(onSubmitDynamicSearch)();
                handleSave();
                // setItemSearchOpen(false);
                // setFilteredList([]);
                handleCloseModel();
              }}
            >
              save
            </Button>
          </Toolbar>
        </AppBar>
        <Grid
          container
          width={"100%"}
          height="calc(100vh - 10px)"
          overflow={"hidden"}
        >
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
              xs={12}
              height="100%"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
            >
              <Box
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  width: "100%",
                }}
                noValidate
                autoComplete="off"
                component="form"
                onSubmit={handleSubmitMdl(onSubmitDynamicSearch)}
              >
                <Grid container md={12} xs={12} sm={12} p={2}>
                  <Grid container item md={12} spacing={2}>
                    <Grid container item md={3}>
                      <Card elevation={5} sx={{ width: "100%", p: 1 }}>
                        <Grid
                          item
                          md={12}
                          sm={12}
                          xs={12}
                          lg={12}
                          textAlign={"center"}
                        >
                          <Controller
                            name="CardName"
                            control={controlMdl}
                            render={({ field }) => (
                              <InputSearchSelectTextField
                                label="SUPPLIER"
                                {...field}
                                data={Suppliers.map((item) => ({
                                  key: item.DocEntry,
                                  value: item.CardName,
                                }))}
                                onChange={(e) => {
                                  field.onChange(e);

                                  const selectedSupplier = Suppliers.find(
                                    (item) =>
                                      String(item.DocEntry) ===
                                      String(e.target.value),
                                  );

                                  setValueMdl(
                                    "SAPDocNum",
                                    selectedSupplier?.SAPDocNum || "",
                                  );
                                }}
                                sx={{
                                  maxWidth: 350,
                                  "& input": {
                                    textTransform: "uppercase",
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          lg={12}
                          textAlign={"center"}
                        >
                          <Controller
                            name="ItemName"
                            control={controlMdl}
                            render={({ field }) => (
                              <InputTextField
                                label="DESCRIPTION"
                                {...field}
                                rows={1}
                                sx={{
                                  maxWidth: 350,
                                  "& input": {
                                    textTransform: "uppercase",
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={12}
                          lg={12}
                          textAlign={"center"}
                        >
                          <Controller
                            name="ItemCode"
                            control={controlMdl}
                            render={({ field }) => (
                              <InputTextField
                                label="ITEM CODE"
                                {...field}
                                rows={1}
                                sx={{
                                  maxWidth: 350,
                                  "& input": {
                                    textTransform: "uppercase",
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="center">
                            <Box width={330}>
                              <Controller
                                name="Stock"
                                control={controlMdl}
                                defaultValue={true}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        size="medium"
                                        sx={{
                                          textAlign: "center",
                                          width: 20,
                                          mr: 1,
                                        }}
                                        {...field}
                                        checked={field.value}
                                      />
                                    }
                                    label="Include Zero Stock"
                                    sx={{ textAlign: "center", width: 200 }}
                                  />
                                )}
                              />
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="center">
                            <Box width={330}>
                              <Controller
                                name="IsActive"
                                control={controlMdl}
                                defaultValue={false}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        size="medium"
                                        sx={{
                                          textAlign: "center",
                                          width: 20,
                                          mr: 1,
                                        }}
                                        {...field}
                                        checked={field.value}
                                      />
                                    }
                                    label="Include InActive Items"
                                    sx={{ textAlign: "center", width: 200 }}
                                  />
                                )}
                              />
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} mt={2} mb={2}>
                          <Box display="flex" justifyContent="center">
                            <Box width={350} display="flex" gap={2}>
                              <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                type="submit"
                                sx={{ color: "white" }}
                                onClick={handleSave}
                              >
                                Search
                              </Button>

                              <Button
                                variant="contained"
                                color="error"
                                fullWidth
                                type="button"
                                onClick={() => {
                                  clearDynamicSearchList();
                                }}
                              >
                                Clear
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      </Card>
                    </Grid>

                    <Grid container item md={9}>
                      <Card elevation={5} sx={{ width: "100%", p: 2 }}>
                        <Grid item md={12} xs={12}>
                          <TabContext value={tabValue}>
                            <Box
                              sx={{
                                borderBottom: 1,
                                borderColor: "divider",
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                              }}
                            >
                              <Paper style={{ padding: 0 }}>
                                <TabList
                                  onChange={handleItemSearchTabChange}
                                  aria-label="lab API tabs example"
                                  variant="scrollable"
                                  scrollButtons="auto"
                                  sx={{
                                    bgcolor: "background.paper",
                                    borderBottom: 1,
                                    borderColor: "divider",
                                    padding: 0,
                                  }}
                                >
                                  <Tab
                                    icon={<ImageIcon />}
                                    label="Item Image"
                                    value="1"
                                    sx={{ width: 200 }}
                                    iconPosition="start"
                                  />
                                  <Tab
                                    icon={<DetailsIcon />}
                                    label="GRN DETAILS"
                                    value="2"
                                    sx={{ width: 200 }}
                                    iconPosition="start"
                                  />
                                  <Tab
                                    icon={<RequestQuoteIcon />}
                                    label="A/R- Invoice"
                                    value="3"
                                    sx={{ width: 200 }}
                                    iconPosition="start"
                                  />
                                  <Tab
                                    icon={<TextSnippetIcon />}
                                    label="Open SO"
                                    value="4"
                                    sx={{ width: 200 }}
                                    iconPosition="start"
                                  />
                                </TabList>
                              </Paper>
                            </Box>

                            <TabPanel
                              value="1"
                              sx={{ padding: 0, paddingTop: 3 }}
                            >
                              <Paper
                                sx={{
                                  width: "100%",
                                  height: "200px",
                                  overflowY: "auto",
                                  overflowX: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    overflowX: "auto",
                                    overflowY: "hidden",
                                    gap: "12px",
                                    padding: "10px",
                                    whiteSpace: "nowrap",
                                    justifyContent: "space-evenly",
                                  }}
                                >
                                  {images.length > 0 ? (
                                    images.map((data, index) => (
                                      <div className="mb-1" key={index}>
                                        <Card
                                          style={{
                                            height: "150px",
                                            width: "150px",
                                            backgroundColor: "silver",
                                          }}
                                        >
                                          <img
                                            src={`data:image/png;base64,${data}`}
                                            alt="img1"
                                            height="100%"
                                            width="100%"
                                          />
                                        </Card>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-center w-100 mt-3">
                                      No images available
                                    </p>
                                  )}
                                </div>
                              </Paper>
                            </TabPanel>

                            <TabPanel
                              value="2"
                              sx={{ padding: 0, paddingTop: 3 }}
                            >
                              <Paper sx={{ width: "100%", height: "200px" }}>
                                <InfiniteLoader
                                  isItemLoaded={(index) => index < GRN.length}
                                  itemCount={
                                    hasMoreGRN ? GRN.length + 1 : GRN.length
                                  }
                                  loadMoreItems={loadMoreRowsGRN}
                                >
                                  {({ onItemsRendered, ref }) => (
                                    <TableContainer
                                      style={{
                                        maxHeight: "200px",
                                        maxWidth: "100%",
                                        overflowY: "auto",
                                      }}
                                      id="GRNScroll"
                                      onScroll={handleScrollGRN}
                                      ref={ref}
                                    >
                                      <Table
                                        stickyHeader
                                        className="infiniteScroll table-style-scroll"
                                      >
                                        <TableHead>
                                          <TableRow>
                                            <Tooltip title="GRN DATE">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{ width: "15%" }}
                                              >
                                                GRN DATE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="GRN NO">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{ width: "10%" }}
                                              >
                                                GRN NO
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="SUPPLIER NAME">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{ width: "20%" }}
                                              >
                                                SUPPLIER NAME
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="RECEIVED QTY">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  width: "4%",
                                                  textAlign: "start",
                                                }}
                                              >
                                                RECEIVED QTY
                                              </TableCell>
                                            </Tooltip>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {GRN.map((row, index) => (
                                            <TableRow
                                              key={index}
                                              style={{
                                                fontWeight: "unset",
                                              }}
                                            >
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  maxWidth: "20px",
                                                }}
                                              >
                                                {dayjs(row.DocDate).format(
                                                  "DD-MM-YYYY",
                                                )}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.DocNum}
                                              </TableCell>
                                              <Tooltip title={row.CardName}>
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {row.CardName}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                  paddingRight: 30,
                                                }}
                                              >
                                                {row.Quantity.toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  )}
                                </InfiniteLoader>
                              </Paper>
                            </TabPanel>

                            <TabPanel
                              value="3"
                              sx={{ padding: 0, paddingTop: 3 }}
                            >
                              <Paper sx={{ width: "100%", height: "200px" }}>
                                <InfiniteLoader
                                  isItemLoaded={(index) =>
                                    index < ARInvoice.length
                                  }
                                  itemCount={
                                    hasMoreARInvoice
                                      ? ARInvoice.length + 1
                                      : ARInvoice.length
                                  }
                                  loadMoreItems={loadMoreRowsARInvoice}
                                >
                                  {({ onItemsRendered, ref }) => (
                                    <TableContainer
                                      style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                      }}
                                      id="ARInvoiceScroll"
                                      onScroll={handleScrollARInvoice}
                                      ref={ref}
                                    >
                                      <Table
                                        stickyHeader
                                        className="infiniteScroll table-style-scroll"
                                      >
                                        <TableHead>
                                          <TableRow>
                                            <Tooltip title="INV DATE">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  width: "100px",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                INV DATE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="INV NO">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                              >
                                                INV NO
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="CUSTOMER NAME">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                              >
                                                CUST NAME
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="QTY">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                              >
                                                QTY
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="MOBILE">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                              >
                                                MOBILE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="BEFORE DISC">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                BEFORE DISC
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="DISC(%)">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                DISC(%)
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="AFTER DISC">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                AFTER DISC
                                              </TableCell>
                                            </Tooltip>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {ARInvoice.map((row, index) => (
                                            <TableRow
                                              key={index}
                                              style={{
                                                fontWeight: "unset",
                                              }}
                                            >
                                              <Tooltip
                                                title={dayjs(
                                                  row.InvoiceDate,
                                                ).format("DD-MM-YYYY")}
                                              >
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {dayjs(
                                                    row.InvoiceDate,
                                                  ).format("DD-MM-YYYY")}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.InvoiceNo}
                                              </TableCell>
                                              <Tooltip title={row.CardName}>
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {row.CardName}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "center",
                                                }}
                                              >
                                                {Number(row.Quantity).toFixed(
                                                  2,
                                                )}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.PhoneNumber1}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {Number(row.Amount).toFixed(2)}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {Number(row.Discount).toFixed(
                                                  2,
                                                )}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {Number(
                                                  row.AfDiscAmount,
                                                ).toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  )}
                                </InfiniteLoader>
                              </Paper>
                            </TabPanel>

                            <TabPanel
                              value="4"
                              sx={{ padding: 0, paddingTop: 3 }}
                            >
                              <Paper sx={{ width: "100%", height: "200px" }}>
                                <InfiniteLoader
                                  isItemLoaded={(index) =>
                                    index < OpenSO.length
                                  }
                                  itemCount={
                                    hasMoreOpenSO
                                      ? OpenSO.length + 1
                                      : OpenSO.length
                                  }
                                  loadMoreItems={loadMoreRowsOpenSo}
                                >
                                  {({ onItemsRendered, ref }) => (
                                    <TableContainer
                                      style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                      }}
                                      id="OpenSOScroll"
                                      onScroll={handleScrollOpenSo}
                                      ref={ref}
                                    >
                                      <Table
                                        stickyHeader
                                        className="infiniteScroll"
                                      >
                                        <TableHead>
                                          <TableRow>
                                            <Tooltip title="SO NO">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                SO NO
                                              </TableCell>
                                            </Tooltip>
                                            <Tooltip title="SO DATE">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                SO DATE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="CUSTOMER CODE">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                CUST CODE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="CUSTOMER NAME">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                CUST NAME
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="MOBILE">
                                              <TableCell
                                                style={{
                                                  fontSize: "11px",
                                                }}
                                                className="wrapTableCell"
                                              >
                                                MOBILE
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="ORDER QTY">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                ORDER QTY
                                              </TableCell>
                                            </Tooltip>

                                            <Tooltip title="VALUE">
                                              <TableCell
                                                className="wrapTableCell"
                                                style={{
                                                  textAlign: "right",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                VALUE
                                              </TableCell>
                                            </Tooltip>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {OpenSO.map((row, index) => (
                                            <TableRow
                                              key={index}
                                              style={{
                                                fontWeight: "unset",
                                              }}
                                            >
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.OrderNo}
                                              </TableCell>
                                              <Tooltip
                                                title={dayjs(
                                                  row.DocDate,
                                                ).format("DD-MM-YYYY")}
                                              >
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {dayjs(row.DocDate).format(
                                                    "DD-MM-YYYY",
                                                  )}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.CardCode}
                                              </TableCell>
                                              <Tooltip title={row.CardName}>
                                                <TableCell
                                                  className="wrapTableCell"
                                                  style={{
                                                    fontWeight: "unset",
                                                    fontFamily:
                                                      "Roboto,Helvetica,Arial,sans-serif",
                                                    color: "black",
                                                    fontSize: "11px",
                                                  }}
                                                >
                                                  {row.CardName}
                                                </TableCell>
                                              </Tooltip>

                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {row.PhoneNumber1}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {row.Quantity}
                                              </TableCell>
                                              <TableCell
                                                style={{
                                                  fontWeight: "unset",
                                                  fontFamily:
                                                    "Roboto,Helvetica,Arial,sans-serif",
                                                  color: "black",
                                                  fontSize: "11px",
                                                  textAlign: "right",
                                                }}
                                              >
                                                {Number(row.Amount).toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  )}
                                </InfiniteLoader>
                              </Paper>
                            </TabPanel>
                          </TabContext>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>

                  <Grid container item md={12} mt={2}>
                    <Card
                      elevation={5}
                      sx={{ width: "100%", p: 2, height: 600, pb: 5 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginBottom: 13,
                        }}
                      >
                        <Button
                          color="success"
                          style={{ fontSize: "14px", padding: "4px 10px" }}
                          variant="contained"
                        >
                          <i className="fa fa-file-excel-o"></i> Export to Excel
                        </Button>
                      </div>
                      {selectedRow && (
                        <Grid container pb={2}>
                          <Grid
                            item
                            lg={2}
                            sm={4}
                            xs={12}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography>
                              Item Code : &nbsp;
                              <span style={{ color: "green", fontSize: 13 }}>
                                {selectedRow.ItemCode || ""}
                              </span>
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            lg={6}
                            sm={4}
                            xs={12}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography style={{ margin: 0 }}>
                              Description : &nbsp;
                              <Tooltip title={selectedRow.ItemName || ""}>
                                <span style={{ color: "green", fontSize: 13 }}>
                                  {selectedRow.ItemName || ""}
                                </span>
                              </Tooltip>
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            lg={4}
                            sm={4}
                            xs={12}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography>
                              Supplier : &nbsp;
                              <span style={{ color: "green", fontSize: 13 }}>
                                {selectedRow.CardName || ""}
                              </span>
                            </Typography>
                          </Grid>
                        </Grid>
                      )}

                      <Box sx={{ height: 500, width: "100%" }}>
                        <DataGrid
                          columnHeaderHeight={35}
                          rowHeight={45}
                          className="datagrid-style"
                          getRowId={(row) => row.ItemCode}
                          sx={{
                            ...gridSx,
                            cursor: "pointer",
                          }}
                          rows={filteredList}
                          columns={ItemSearchcolumns}
                          pageSizeOptions={[25, 50, 100]}
                          initialState={{
                            pagination: {
                              paginationModel: { pageSize: 100 },
                            },
                          }}
                          checkboxSelection
                          editMode={false}
                          rowSelectionModel={[
                            ...(oLines || []).map((line) => line.ItemCode),
                            ...selectionModel,
                          ]}
                          isRowSelectable={(params) =>
                            !(oLines || []).some(
                              (line) => line.ItemCode === params.row.ItemCode,
                            )
                          }
                          onRowSelectionModelChange={(selectedIds) => {
                            const alreadyInOLines = (oLines || []).map(
                              (l) => l.ItemCode,
                            );
                            const newlySelected = selectedIds.filter(
                              (id) => !alreadyInOLines.includes(id),
                            );
                            setSelectionModel(newlySelected);
                            checkedRowsRef.current = (
                              Array.isArray(filteredList) ? filteredList : []
                            ).filter((row) =>
                              newlySelected.includes(row.ItemCode),
                            );
                          }}
                          onRowClick={(params) => {
                            const itemCode = params.row.ItemCode;
                            setSelectedRow(params.row);
                            handleCheck(itemCode);

                            const alreadyInOLines = (oLines || []).some(
                              (line) => line.ItemCode === itemCode,
                            );
                            if (!alreadyInOLines) {
                              const newSelection = selectionModel.includes(
                                itemCode,
                              )
                                ? selectionModel.filter((id) => id !== itemCode)
                                : [...selectionModel, itemCode];
                              setSelectionModel(newSelection);
                              checkedRowsRef.current = (
                                Array.isArray(filteredList) ? filteredList : []
                              ).filter((row) =>
                                newSelection.includes(row.ItemCode),
                              );
                            }
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
    </>
  );
}
