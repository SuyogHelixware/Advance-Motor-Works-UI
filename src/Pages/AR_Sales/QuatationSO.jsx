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
  TextField,
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function QuatationSO() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, settab] = useState("1");
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [tabValue, setTabValue] = useState("1");
  const [openModal, setOpenModal] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bankData, setBankData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [images, setImages] = useState([]);
  const [oldOpenData, setSelectData] = useState(null);

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

  const [filteredList, setFilteredList] = useState("");
  const [ModalLoading, setModalLoading] = useState(false);
  const [Suppliers, setSuppliers] = useState([]);
  const [storedFittingCharges, setStoredFittingCharges] = useState([]);

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
  const [Discapprovreq, setDiscapprovReq] = useState("");
  const [DocEntry, setDocEntry] = useState("");
  const [top20ItemsList, settop20ItemsList] = useState([]);
  const [top20Loading, setTop20Loading] = useState(false);
  const top20CancelToken = useRef(null);
  const top20DebounceTimer = useRef(null);

  const theme = useTheme();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
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
    SpecialOrder: false,
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
    DirectInvoice: "0",
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
    // BaseRef: (LeadId ?? "LEAD") || null,
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
    customerEmail: "",
    PhoneNumber1: "",
    GroupCode: false,
    CardType: "C",
  };

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initial,
    shouldFocusError: false,
  });

  const {
    control: controlMdl,
    handleSubmit: handleSubmitMdl,
    reset: resetMdl,
    getValues: getValuesMdl,
    setValue: setValueMdl,
    watch: watchMdl,
    formState: { errors: errorsMdl },
  } = useForm({
    defaultValues: initialCustCreation,
    shouldFocusError: false,
  });

  const {
    control: controlMdl1,
    handleSubmit: handleSubmitMdl1,
    reset: resetMdl1,
    getValues: getValuesMdl1,
    setValue: setValueMdl1,
    watch: watchMdl1,
    formState: { errors: errorsMdl1 },
  } = useForm({
    defaultValues: initialItemSearch,
    shouldFocusError: false,
  });

  const allFormData = getValues();

  const getIssueStatus = (Qty, IssueQty) => {
    if (Qty > IssueQty && IssueQty > 0) return "P-ISSUED";
    else if (Qty === IssueQty) return "C-ISSUED";
    else return "NOT-ISSUED";
  };

  const gettop20Items = useCallback((searchText = "") => {
    setTop20Loading(true);

    if (top20DebounceTimer.current) {
      clearTimeout(top20DebounceTimer.current);
    }

    top20DebounceTimer.current = setTimeout(() => {
      if (top20CancelToken.current) {
        top20CancelToken.current.cancel("Cancelled previous Top 20 request");
      }

      top20CancelToken.current = axios.CancelToken.source();

      axios
        .get(`${BASE_URL}/TopProducts/all`, {
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
        })
        .finally(() => setTop20Loading(false));
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
  };

  const fetchGetListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `${BASE_URL}/BP?Status=1&CardType=C&SearchText/${searchTerm}/${pageNum}`
        : `${BASE_URL}/BP?Status=1&CardType=C&Page=${pageNum}`;

      const response = await axios.get(url);

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

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `${BASE_URL}/QuotationSO/search/${searchTerm}/1/${pageNum}`
        : `${BASE_URL}/QuotationSO/pages/${pageNum}/1`;

      const response = await axios.get(url);

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
    try {
      const res = await axios.get(`${BASE_URL}/QuotationSo/${DocEntry}`);

      const data = res.data?.values[0];

      const transformed = {
        ...data,
        CNC: data.JobWorkAt === "CNC",
        ServiceOrder: data.ServiceOrder !== "0",
        Shipping: data.Shipping !== "0",
        WalkIn: data.WalkIn !== "0",
        DeliveredLater: data.DeliveredLater === "1",
        SpecialOrder: data.SpecialOrder !== "0",
        Approver: data.Approver,
        InvoiceStatus: data.InvoiceStatus,
        OrderType: data.OrderType,
        oCCPay: [],
        BankPay: [],
        oCashPay: [],
        Status:
          data.Status === "1" && data.InvoiceStatus === "1"
            ? "OPEN | P-INVOICE"
            : data.Status === "0"
              ? "CLOSE"
              : "OPEN",

        DesiredDiscAmt: Number(data?.DesiredDiscAmt || 0).toFixed(3),
        SpecialDiscAmt: Number(data?.SpecialDiscAmt || 0).toFixed(3),

        CRApproved: data.ApprovalStatus === "0" ? false : true,
        Model: data.Model,
        CashPaid: "0",
        TransferDate: data.TransferDate ? dayjs(data.TransferDate) : dayjs(),
        ReceiptDate: data.ReceiptDate ? dayjs(data.ReceiptDate) : dayjs(),
        DocDate: data.DocDate ? dayjs(data.DocDate) : dayjs(),
        DiscApproStatus: Discapprovreq.oLines?.find(
          (line) => line.ApprovalStatus === "PENDING",
        )
          ? "PENDING"
          : data.DiscApproStatus,
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
      };

      reset(transformed);
      setDocEntry(DocEntry);
      // setSaveUpdateName("UPDATE");
    } catch (error) {
      console.error("Error fetching data:", error);

      Swal.fire({
        text: error?.response?.data?.message || "Failed to fetch data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
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
    setOpenListQuery(""); // Clear searFullAddressch input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
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

  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      let url = searchTerm
        ? `${BASE_URL}/QuotationSO/search/${searchTerm}/0/${pageNum}`
        : `${BASE_URL}/QuotationSO/pages/${pageNum}/0`;

      const response = await axios.get(url);

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

  // Initial fetch
  useEffect(() => {
    fetchClosedListData(0);
  }, []);

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
      setModalLoading(true);

      const res = await axios.get(
        `${BASE_URL}/BP?Status=1&CardType=S&Page=0&Limit=200`,
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
      setModalLoading(false);
    }
  };

  const getallformdata = useCallback(async () => {
    setModalLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/DynamicSearch/all`);

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
      setModalLoading(false);
    }
  }, []);

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

    setModalLoading(true);

    axios
      .request({
        method: "get",
        url: `${BASE_URL}/DynamicSearch/itemsdata/${ItemCode}`,
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
          setModalLoading(false);
        } else if (response.data.success === false) {
          setModalLoading(false);
          Swal.fire({
            title: "Error!",
            text: response.data.message,
            icon: "warning",
            confirmButtonText: "Ok",
          });
        }
      })
      .catch((error) => {
        setModalLoading(false);
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
      const response = await axios.get(`${BASE_URL}${url}`);

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
      const response = await axios.get(`${BASE_URL}${url}`);

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
      const response = await axios.get(`${BASE_URL}${url}`);

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
    getallformdata();
    setSelectedRow();
    setGrn([]);
    setARInvoice([]);
    setOpenSO([]);
    setImages([]);
    resetMdl(initialItemSearch);
  };

  const handleOnChange = (index, field, value) => {
    const val = value === "" ? 0 : parseFloat(parseFloat(value).toFixed(3));

    const qty =
      field === "Quantity"
        ? val
        : parseFloat(getValues(`oLines.${index}.Quantity`) || 0);

    const price =
      field === "Price"
        ? val
        : parseFloat(getValues(`oLines.${index}.Price`) || 0);

    let fittingCharge =
      field === "LineFittingCharge"
        ? qty > 0
          ? parseFloat((val / qty).toFixed(6))
          : 0
        : parseFloat(getValues(`oLines.${index}.FittingCharge`) || 0);

    const amount = parseFloat((qty * price).toFixed(3));
    const lineFittingCharge =
      field === "LineFittingCharge"
        ? val
        : parseFloat((Number(qty) * Number(fittingCharge)).toFixed(3));

    setValue(`oLines.${index}.Amount`, amount);

    setValue(`oLines.${index}.LineFittingCharge`, lineFittingCharge);

    const updatedOLines = [...getValues("oLines")];
    if (updatedOLines[index]) {
      updatedOLines[index][field] = val;
      updatedOLines[index].Amount = amount;
      updatedOLines[index].FittingCharge = fittingCharge;
      updatedOLines[index].LineFittingCharge = lineFittingCharge;
    }

    setValue("oLines", updatedOLines);
    setValue("rows", updatedOLines);
    calculateData();
  };

  const updateFilteredListDisabledRows = () => {
    const oLineItemCodes = getValues("oLines")?.map((item) => item.ItemCode);
    const updatedFiltered = filteredList.map((item) => {
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

    // const sDisc = parseFloat(allFormdata.SpecialDisc) || 0;

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
    // const total = netParts + totalFittingCharge + roundAmt + shipAmt;
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

    setValue("TotalDocAmt", allTotal.toFixed(3));
    setValue("DueAmount", allTotal.toFixed(3));
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
      const updatedOCCPayList = oCCPayList.map((item, i) => ({
        ...item,
        CreditSum:
          i === 0 ? lastValidValuesRef.current.CreditSum : item.CreditSum,
      }));
      setValue("oCCPay", updatedOCCPayList);

      return;
    }
    lastValidValuesRef.current = {
      CashPaid: cashPaid,
      TransferSum: transferSum,
      CreditSum: creditSumTotal,
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

  const handleSave = () => {
    try {
      const checkedRows = Array.isArray(checkedRowsRef?.current)
        ? checkedRowsRef.current.filter(Boolean)
        : [];

      const isCNCActive =
        watch("CNC") === true &&
        (watch("JobWorkAt") || "").toUpperCase() === "ORP WORKSHOP";

      checkedRows.forEach((r) => (r.disabled = true));

      setStoredFittingCharges((prev) => {
        const newData = checkedRows.map((row) => ({
          ItemCode: row.ItemCode,
          FittingCharge: row.OriginalFittingCharge ?? row.FittingCharge,
        }));
        const merged = [...prev];
        newData.forEach((n) => {
          const idx = merged.findIndex((m) => m.ItemCode === n.ItemCode);
          if (idx >= 0) merged[idx] = n;
          else merged.push(n);
        });
        return merged;
      });

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
      handleOnChange();

      checkedRowsRef.current = [];
    } catch (err) {
      console.error(" handleSave error:", err);
    }
  };

  const onSubmitDynamicSearch = async (data) => {
    setModalLoading(true);

    try {
      const obj = {
        Supplier: data.SAPDocNum,
        ItemName: data.ItemName,
        ItemCode: data.ItemCode,
        IsActive: data.IsActive === true ? 0 : 1,
        Stock: data.Stock === true ? 0 : 1,
        Make: data.Make,
        Model: data.Make === "" ? "" : data.Model,
        Year: data.Year,
        Category: data.Category,
        SubCategory: data.SubCategory,
        CNC: data.CNC === "1",
        CRApproved: data.ApprovalStatus === "1",
        SpecialOrder: data.SpecialOrder === "1",
        Shipping: data.Shipping !== "0",
      };

      const res = await axios.post(
        `${BASE_URL}/DynamicSearch/QuotSO/search`,
        obj,
      );

      if (res.data.values.length > 0) {
        setFilteredList(res.data.values);
      } else {
        Swal.fire({
          title: "Oops...",
          text: "No Record Found",
          icon: "warning",
          timer: 1500,
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || error.toString(),
      });
    } finally {
      setModalLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  function hadlesubmit(e) {
    e.preventDefault();
  }

  const removeTableRow1 = (index) => {
    const updatedData = bankData.filter((_, i) => i !== index);
    setBankData(updatedData);
  };

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const handleClickModel = () => {
    setOpenModal(true);
    getallformdata();
    getAllBPFormData();
  };

  const handleCloseModel = () => {
    setOpenModal(false);
    resetMdl(initialItemSearch);
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
    // if (!state.selected) {
    //   Swal.fire({
    //     text: "Please Select Customer",
    //     icon: "warning",
    //     toast: true,
    //     showConfirmButton: false,
    //     timer: 2000,
    //     timerProgressBar: true,
    //   });
    //   return;
    // }

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

    setStoredFittingCharges((prev) => {
      const merged = [...prev];
      const idx = merged.findIndex((m) => m.ItemCode === item.ItemCode);
      if (idx >= 0)
        merged[idx] = {
          ItemCode: item.ItemCode,
          FittingCharge: realFittingCharge,
        };
      else
        merged.push({
          ItemCode: item.ItemCode,
          FittingCharge: realFittingCharge,
        });
      return merged;
    });

    const updatedOLines = [...currentOLines, newLine];
    setValue("oLines", updatedOLines);

    // Now update rows
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

  const columns = [
    {
      field: "ItemCode",
      headerName: "ITEM CODE",
      width: 150,
      editable: true,
    },
    {
      field: "ItemName",
      headerName: "ITEM DESCRIPTION",
      width: 625,
      editable: true,
    },
    {
      field: "WHSCode",
      headerName: "WHS",
      width: 100,
      editable: true,
    },
    {
      field: "Quantity",
      headerName: "QTY",
      width: 100,
      editable: true,
    },
    {
      field: "Price",
      headerName: "PRICE",
      width: 100,
      editable: true,
    },
    {
      field: "DesiredDisc",
      headerName: "DISC%",
      width: 100,
      editable: true,
    },
    {
      field: "Amount",
      headerName: "TOTAL AMT",
      width: 100,
      editable: true,
    },
    {
      field: "LineFittingCharge",
      headerName: "FITTING",
      width: 110,
      editable: true,
    },
    {
      field: "FTSQty",
      headerName: "FTS",
      width: 110,
      editable: true,
    },
    {
      field: "IssueQuantity",
      headerName: "ISS QTY",
      width: 110,
      editable: true,
    },
    {
      field: "IssueStatus",
      headerName: "STATUS",
      width: 110,
      editable: true,
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
                          isSelected={oldOpenData === item.DocEntry}
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
    setDocEntry("");
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        // onSubmit={onSubmit}
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            width: "90vw",
            maxWidth: "370px",
            height: "60vh",
            maxHeight: "80vh",
            margin: "auto",
          },
        }}
      >
        <DialogTitle>
          <Grid item display={"flex"} justifyContent={"center"}>
            <PersonAddAlt1OutlinedIcon />
            <Typography textAlign={"center"} fontWeight={"bold"}>
              &nbsp; &nbsp;Customer Creation Form
            </Typography>
          </Grid>
        </DialogTitle>
        <Divider color="gray" />
        <DialogContent className="bg-light">
          <Grid container gap={2}>
            <Grid item xs={12} lg={12} textAlign={"center"}>
              <Controller
                name="CUSTOMER ID"
                disabled
                control={controlMdl1}
                render={({ field, fieldState: { errorsMdl1 } }) => (
                  <InputTextField label="CUSTOMER ID" {...field} rows={1} />
                )}
              />
            </Grid>

            <Grid item xs={12} lg={12} textAlign={"center"}>
              <Controller
                name="CardName"
                control={controlMdl1}
                render={({ field, fieldState: { errorsMdl1 } }) => (
                  <InputTextField
                    label="CUSTOMER NAME"
                    {...field}
                    error={!!errorsMdl1}
                    helperText={errorsMdl1 ? errorsMdl1.message : null}
                    rows={1}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} lg={12} textAlign={"center"}>
              <PhoneNumber
                defaultCountry="kw"
                label="CONTACT NUMBER"
                value={phone}
                onChange={(phone) => setPhone(phone)}
              />
            </Grid>
            <Grid item xs={12} lg={12} textAlign={"center"}>
              <Controller
                name="EMAIL"
                control={controlMdl1}
                render={({ field, fieldState: { errorsMdl1 } }) => (
                  <InputTextField
                    label="EMAIL"
                    {...field}
                    error={!!errorsMdl1}
                    helperText={errorsMdl1 ? errorsMdl1.message : null}
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
            name="Close"
            onClick={handleClose}
            size="small"
            sx={{ color: "white" }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="error"
            name="Close"
            onClick={handleClose}
            size="small"
          >
            close
          </Button>
        </DialogActions>
      </Dialog>
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
        component={"form"}
        onSubmit={hadlesubmit}
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
              Quatation So
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
                <Grid container spacing={2}>
                  <Grid item xs={12} lg={3} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
                        <Controller
                          name="CardCode"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              size="small"
                              label="CUSTOMER ID"
                              autoFocus
                              readOnly={true}
                              disabled={watch("DocEntry")}
                              placeholder="Search ..."
                              sx={{ m: 1, width: "100%", maxWidth: 220 }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      color="primary"
                                      onClick={() => {
                                        OpenDailog();
                                      }}
                                      onChange={OpenDailog}
                                      disabled={!!DocEntry}
                                    >
                                      <SearchIcon />
                                    </IconButton>
                                    <IconButton
                                      onClick={handleClickOpen}
                                      size="small"
                                      style={{
                                        backgroundColor: "green",
                                        borderRadius: "20%",
                                        color: "white",
                                        padding: 4,
                                      }}
                                    >
                                      <ContactMailOutlinedIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
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
                        >
                          Search Item
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} lg={6} md={4}>
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
                        <SmallInputFields
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
                        <SmallInputFields
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
                        <SmallInputFields
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
                        <SmallInputFields
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
                        <SmallInputFields
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
                        <InputTextField
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
                      name="Special Order"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              {...field}
                              checked={field.value}
                            />
                          }
                          label="Special Order"
                          sx={{ textAlign: "center", width: 140 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="CNC"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              {...field}
                              checked={field.value}
                            />
                          }
                          label="CNC"
                          sx={{ textAlign: "center", width: 80 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="Delivered Later"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              {...field}
                              checked={field.value}
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
                      name="Service Order"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              {...field}
                              checked={field.value}
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
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              {...field}
                              checked={field.value}
                            />
                          }
                          label="Shipping"
                          sx={{ textAlign: "center", width: 100 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} sm={4} lg={2} textAlign={"center"}>
                    <Controller
                      name="CR Approved"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="medium"
                              sx={{ textAlign: "center", width: 20, mr: 1 }}
                              {...field}
                              checked={field.value}
                            />
                          }
                          label="CR Approved"
                          sx={{ textAlign: "center", width: 130 }}
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
                        <Controller
                          name="ServiceAndInstallation"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="SERVICE & INSTALL"
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
                        <Controller
                          name="DesiredDisc"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="DISC (%)"
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
                          name="RoundingAmt"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="ROUNDING OFF"
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
                        <Controller
                          name="SpecialDisc"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="SPECIAL DISC(%)"
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
                          name="ShippingAmt"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="SHIPPING"
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
                        <Controller
                          name="SpecialDiscAmt"
                          control={control}
                          render={({ field }) => (
                            <SmallInputTextField
                              label="SPECIAL DISC AMT"
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
                        <Button variant="contained" color="primary">
                          CALC DISC
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

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
                            <Controller
                              name="CashPaid"
                              control={control}
                              render={({ field }) => (
                                <InputTextField
                                  label="CASH PAID"
                                  {...field}
                                  type="Number"
                                />
                              )}
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
                                  data={[{ key: "1201011", value: "Cash A/C" }]}
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
                              name="myRadioGroup"
                              data={[
                                { value: "KNET", label: "KNET" },
                                { value: "MASTER", label: "MASTER" },
                                { value: "VISA", label: "VISA" },
                                { value: "MF", label: "MF" },
                                { value: "TABBY", label: "TABBY" },
                                { value: "TAMARA", label: "TAMARA" },
                              ]}
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
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item sm={12} md={6} lg={6} xs={12}>
                              <Controller
                                name="CreditSum"
                                control={control}
                                render={({ field }) => (
                                  <SmallInputTextField
                                    label="CREDIT SUM"
                                    type="Number"
                                    {...field}
                                  />
                                )}
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
                                // onClick={handleOnCreditCardAdd}
                              >
                                ADD
                              </Button>
                            </Grid>
                          </Grid>
                          <Grid item lg={6} xs={12} md={6} sm={6}>
                            <TableContainer
                              // component={Paper}
                              sx={{ overflow: "auto" }}
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
                                    <TableCell></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {bankData.map((data, index) => (
                                    <TableRow key={index}>
                                      <TableCell component="th" scope="row">
                                        {data.AuthCode}
                                      </TableCell>
                                      <TableCell>{data.myRadioGroup}</TableCell>
                                      <TableCell>{data.Creditno}</TableCell>
                                      <TableCell>{data.Amount}</TableCell>
                                      <TableCell>
                                        <IconButton
                                          onClick={() => removeTableRow1(index)}
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
                            <Controller
                              name="TransferSum"
                              control={control}
                              render={({ field }) => (
                                <InputTextField
                                  label="TRANSFER SUM"
                                  {...field}
                                  // onChange={(e) => {
                                  //   field.onChange(e);
                                  //   PaymentCalc(e);
                                  // }}
                                  type="Number"
                                />
                              )}
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
                                  // onChange={(e) => {
                                  //   field.onChange(e);
                                  //   handleOnChangeCreditValue(e);
                                  // }}
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
                      name="SAPDocNum"
                      control={control}
                      render={({ field }) => (
                        <SmallInputTextField
                          label="SAP SO NO"
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
              >
                SAVE
              </Button>
              <Button variant="contained" color="error">
                DELETE
              </Button>
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
                handleSave();
                // setItemSearchOpen(false);
                setFilteredList([]);
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
                                  onChange={handleTabChange}
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
                          // onClick={exportExcel}
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
                          columns={columns}
                          pageSizeOptions={[25, 50, 100]}
                          initialState={{
                            pagination: {
                              paginationModel: { pageSize: 100 },
                            },
                          }}
                          checkboxSelection
                          editMode={false}
                          onRowClick={(params) => {
                            const itemCode = params.row.ItemCode;
                            setSelectedRow(params.row);
                            handleCheck(itemCode);
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
