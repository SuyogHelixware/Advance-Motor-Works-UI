import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import apiClient from "../../services/apiClient";
import { dataGridSx } from "../../Styles/dataGridStyles";
import CardComponent from "../Components/CardComponent";
import {
  InputDatePickerField,
  InputFields,
  InputSearchSelectTextField,
  InputTextArea,
  InputTextField,
  InputTextSearchButton,
  RadioButtonsField,
  SmallInputFields,
  SmallInputSearchSelectTextField,
  SmallInputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import PrintMenu from "../Components/PrintMenu";
import SearchInputField from "../Components/SearchInputField";
import SearchModel from "../Components/SearchModel";
import usePermissions from "../Components/usePermissions";

const initialFormData = {
  DocEntry: "",
  DocNum: "",
  DocDate: dayjs(new Date()),
  UserId: "",
  OrderNo: "",
  OrderDocEntry: "",
  ApprovalStatus: "",
  CardCode: "",
  CardName: "",
  CreatedDate: "",
  ModifiedBy: "",
  Status: "",
  JobRemarks: "",
  JobWorkAt: "",
  SparesAmount: "",
  DesiredDisc: 0,
  DesiredDiscAmt: 0,
  SpecialDisc: 0,
  SpecialDiscAmt: 0,
  TotalDocAmt: 0,
  PaidAmount: 0,
  DueAmount: 0,
  FittingTimeReq: "0",
  SpecialDiscBy: "",
  SpecialDiscDate: "",
  SpecialDiscRemarks: "",
  SparesNetAmt: 0,
  PhoneNumber1: "",
  RegistrationNo: "",
  VehInwardNo: "",
  VehInwardDate: dayjs(new Date()),
  VehInwardTime: dayjs(),
  Email: "",
  TotalPartsValue: 0,
  RoundingAmt: 0,
  ServiceAndInstallation: 0,
  Shipping: "0",
  ShippingAmt: 0,
  AdvanceAmount: 0,
  AdvancePayment: "",
  BalanceDueAmount: 0,
  TotalDueAmount: 0,
  SAPDocEntry: "",
  SAPDocNum: "",
  TaxCode: 0,
  TaxAmt: 0,
  CustomsDutyPer: 0,
  CustomsDutyAmt: 0,
  Currency: "KWD",
  CurrencyRate: "",
  CurrAmt: 0,
  CashPaid: 0,
  CashAccount: "1201011",
  TransferAccount: "1201022",
  TransferAccountName: "Bank NBK 2008134452",
  TransferReference: "",
  TransferSum: 0,
  OrderType: "",
  Job_SO_DocEntry: "",
  OrderSubType: "",
  InvoiceDate: dayjs(new Date()),
  CreditAcct: 0,
  TransferDate: dayjs(new Date()),
  ReceiptDate: dayjs(new Date()),
  oCCPay: [],
  oCashPay: [],
  oLines: [],
  BankPay: [],
  CreditCard: [],
};

export default function CashInvoice() {
  const [tabvalue, settabvalue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, settab] = useState("1");
  const theme = useTheme();
  const perms = usePermissions(359);

  const [searchmodelOpen, setSearchmodelOpen] = useState(false);
  const [hasMoreGetList, setHasMoreGetList] = useState(true);
  const [getListquery, setGetListQuery] = useState("");
  const [getListSearching, setGetListSearching] = useState(false);

  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);

  const [closedListData, setClosedListData] = useState([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [hasMoreClosed, setHasMoreClosed] = useState(true);
  const [closedListquery, setClosedListQuery] = useState("");
  const [closedListSearching, setClosedListSearching] = useState(false);

  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [getListData, setGetListData] = useState([]);
  const [getListPage, setGetListPage] = useState(0);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);
  const [DocEntry, setDocEntry] = useState("");
  const [bankData, setBankData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processinv, setprocessinv] = useState(false);

  const columns = [
    {
      field: "ItemCode",
      headerName: "Item Code",
      width: 180,
      editable: false,
    },
    {
      field: "ItemName",
      headerName: "Description",
      width: 450,
      editable: true,
      renderCell: (params) => (
        <Tooltip title={params.row.ItemName} arrow>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
              display: "block",
            }}
          >
            {params.value}
          </span>
        </Tooltip>
      ),
    },
    {
      field: "Quantity",
      headerName: "Qty",
      width: 140,
      headerAlign: "right",
      align: "right",
    },
    {
      field: "Price",
      headerName: "Price",
      width: 140,
      headerAlign: "right",
      align: "right",
    },
    {
      field: "DesiredDisc",
      headerName: "Disc(%)",
      width: 140,
      headerAlign: "right",
      align: "right",
    },
    {
      field: "Amount",
      headerName: "Amount",
      width: 140,
      headerAlign: "right",
      align: "right",
    },
    {
      field: "Fitting",
      headerName: "Fitting",
      width: 140,
      headerAlign: "right",
      align: "right",
    },
  ];

  const {
    control,
    handleSubmit,
    reset,
    // formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm({
    defaultValues: initialFormData,
  });

  const SetoldData = async (DocEntry) => {
    setLoading(true);

    try {
      const res = await apiClient.get(`/ARInvoice/${DocEntry}`);
      const data = res.data.values;

      if (!data) {
        Swal.fire({
          icon: "warning",
          text: "Record Not Found",
        });
        setLoading(false);
        return;
      }

      if (res.data.success) {
        const transformed = {
          ...data,
          BalanceDueAmount: data.DueAmount,
          TotalDueAmount: data.DueAmount,
          InvoiceDate: data.DocDate,
          SpecialDisc: parseFloat(data.SpecialDisc).toFixed(3),
          SpecialDiscAmt: parseFloat(data.SpecialDiscAmt).toFixed(3),
          DesiredDiscAmt: parseFloat(data.DesiredDiscAmt).toFixed(3),

          PaidAmount: parseFloat(0).toFixed(3),
          BankPay: [],
          oCCPay: [],
          oCashPay: [],
          oLines: data.oLines.map((invdata) => ({
            ItemCode: invdata.ItemCode,
            ItemName: invdata.ItemName,
            Quantity: invdata.Quantity,
            Price: invdata.Price,
            WHSCode: invdata.WHSCode,
            DesiredDisc: invdata.DesiredDisc,
            Amount: invdata.LineTotalAmount,
            Fitting: invdata.LineFittingCharge,
            TaxCode: invdata.TaxCode,
            TaxPer: invdata.TaxPer,
            TaxAmt: invdata.TaxAmt,
          })),
        };

        reset(transformed);
        setDocEntry(DocEntry);
        setValue("Job_SO_DocEntry", data.OrderNo);
        setValue("VehInwardDate", data.VehInwardDate);
        setValue(
          "VehInwardTime",
          data.VehInwardTime ? dayjs(data.VehInwardTime) : dayjs(),
        );
        setValue("SparesNetAmt", data.SparesNetAmt);
        setprocessinv(false);
      }
    } catch (error) {
      console.error("Error :", error);
    } finally {
      setLoading(false);
    }
  };

  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  const [PrintData, setPrintData] = useState([]);

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/13`,
        );
        // const { data: dataPrint } = await axios.get(
        //   `http://20.203.85.32:8071/api/ReportLayout/GetByTransId/13`,
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

  const onSelectRequest = async (selectedItem) => {
    try {
      setLoading(true);
      const filledValues = {
        ...selectedItem,
        PaidAmount: "0",
        TotalDueAmount: selectedItem.DueAmount,
        BalanceDueAmount: selectedItem.DueAmount,
        SparesNetAmt: selectedItem.NetPartsValue,
        FittingCharge: "0",
        CashPaid: 0,
        CreditSum: 0,
        TransferSum: 0,
        DesiredDiscAmt: parseFloat(selectedItem.DesiredDiscAmt).toFixed(3),
        SpecialDiscAmt: parseFloat(selectedItem.SpecialDiscAmt).toFixed(3),
        VehInwardTime: dayjs(selectedItem.VehInwardTime, "HH:mm"),
      };

      reset(filledValues);
      setprocessinv(true);
      SearchModelClose();
    } catch (error) {
      console.error("Error fetching ARInvoice:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  const ClearFormData = () => {
    reset(initialFormData);
    setBankData([]);
    setDocEntry("");
    lastValidValuesRef.current = { CashPaid: 0, TransferSum: 0, CreditSum: 0 };
  };

  const onSubmit = async (data) => {
    const UserId = localStorage.getItem("UserId");
    const CreatedBy = localStorage.getItem("UserName");

    const obj = {
      UserId: UserId,
      CreatedBy: CreatedBy,
      SOUserId: UserId,
      SOCreatedBy: CreatedBy,
      DocDate: dayjs(),
      OrderNo: data.Job_SO_DocEntry,
      OrderDocEntry: data.OrderDocEntry,
      ApprovalStatus: data.ApprovalStatus,
      DeliveryPartner: "",
      CardCode: data.CardCode,
      CardName: data.CardName,
      Status: "1",
      JobRemarks: data.JobRemarks,
      JobWorkAt: data.JobWorkAt,
      SparesAmount: data.TotalPartsValue,
      DesiredDisc: data.DesiredDisc,
      DesiredDiscAmt: data.DesiredDiscAmt,
      SpecialDisc: data.SpecialDisc,
      SpecialDiscAmt: data.SpecialDiscAmt,
      FittingCharge: String(data.FittingCharge),
      TotalDocAmt: data.TotalDocAmt,
      PaidAmount: data.PaidAmount,
      DueAmount: data.TotalDueAmount,
      SparesNetAmt: String(data.SparesNetAmt),
      PhoneNumber1: data.PhoneNumber1,
      RegistrationNo: data.RegistrationNo,
      VehInwardNo: data.VehInwardNo,
      VehInwardDate: data.VehInwardDate,
      VehInwardTime: data.VehInwardTime,
      Email: data.Email,
      TotalPartsValue: data.TotalPartsValue,
      RoundingAmt: data.RoundingAmt,
      ServiceAndInstallation: data.ServiceAndInstallation,
      Shipping: data.Shipping,
      ShippingAmt: data.ShippingAmt,
      OrderType: data.OrderType,
      OrderSubType: data.OrderSubType,
      AdvanceAmount: data.AdvanceAmount,
      SAPDocNum: "",
      SAPDocEntry: "",
      TaxAmt: String(data.TaxAmt),
      TaxCode: String(data.TaxCode),
      CustomsDutyPer: String(data.CustomsDutyPer),
      CustomsDutyAmt: String(data.CustomsDutyAmt),
      CurrAmt: String(data.CurrAmt),
      CurrencyRate: String(data.CurrencyRate),
      Currency: String(data.Currency),
      oLines: data.oLines.map((invData) => ({
        UserId: UserId,
        CreatedBy: CreatedBy,
        ItemCode: invData.ItemCode,
        Quantity: invData.Quantity,
        Price: invData.Price,
        DesiredDisc: invData.DesiredDisc,
        LineFittingCharge: invData.Fitting,
        LineTotalAmount: invData.Amount,
        ItemName: invData.ItemName,
        Currency: "KWD",
        TaxCode: "",
        TaxPer: "0",
        TaxAmt: "0",
      })),
      oCashPay:
        data.CashPaid > 0
          ? [
              {
                UserId: UserId,
                CreatedBy: CreatedBy,
                CashSum: String(data.CashPaid),
                CashAccount: "1201011",
                TaxDate: dayjs(new Date()).format("YYYY-MMM-DD"),
              },
            ]
          : [],
      oCCPay: (bankData || []).map((creditCard) => ({
        UserId: UserId,
        CreatedBy: CreatedBy,
        CreditCard: String(creditCard.CreditCard),
        CreditAcct: String(creditCard.CashAccount),
        CreditCardNumber: String(creditCard.CreditCardNumber),
        PaymentMethodCode: "",
        VoucherNum: String(creditCard.VoucherNum),
        CreditSum: String(creditCard.CreditSum),
      })),
      BankPay:
        data.TransferSum > 0
          ? [
              {
                UserId: UserId,
                CreatedBy: CreatedBy,
                ModifiedBy: CreatedBy,
                TransferAccount: "1201022",
                TransferAccountName: "Bank NBK 2008134452",
                TransferReference: String(data.TransferReference),
                TransferDate: dayjs(data.TransferDate).format("YYYY-MMM-DD"),
                TransferSum: String(data.TransferSum),
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

    const dueAmount = parseFloat(data.DueAmount);
    const paidAmount = parseFloat(data.PaidAmount);
    const approvalStatus = parseInt(data.ApprovalStatus);

    if (dueAmount > 0 && paidAmount === 0 && approvalStatus === 1) {
      const result = await Swal.fire({
        title: "Paid Amount is less than Due Amount!",
        text: "Do you want to proceed with a Credit Invoice?",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
        denyButtonText: "No",
      });

      if (result.isDenied) {
        await Swal.fire({
          text: "Invoice Details Are Not Saved...",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 1000,
        });
        return;
      }

      if (result.isDismissed) {
        return;
      }
    } else if (
      dueAmount >= 0 &&
      paidAmount !== dueAmount &&
      approvalStatus === 0
    ) {
      await Swal.fire({
        text: "Paid Amount is less than Due amount",
        icon: "warning",
        toast: true,
        showConfirmButton: false,
        timer: 1000,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.post(`/ARInvoice`, obj);

      if (res.data.success) {
        setLoading(false);
        Swal.fire({
          toast: true,
          position: "center",
          icon: "success",
          title: "Cash Invoice Added",
          showConfirmButton: false,
          timer: 1500,
        });
        ClearFormData();
        setOpenListData([]);
        fetchOpenListData(0);
        handleGetListClear();
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
        title: "Error!",
        text: error,
        icon: "warning",
        confirmButtonText: "Ok",
      });
    }
  };

  const OpenDailog = () => {
    setSearchmodelOpen(true);
    setGetListQuery("");
  };
  const SearchModelClose = () => {
    setSearchmodelOpen(false);
    setGetListQuery("");
  };

  const fetchOpenListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/ARInvoice?SearchText=${searchTerm}&Status=1&Page=${pageNum}`
        : `/ARInvoice?Status=1&Page=${pageNum}`;

      const { data } = await apiClient.get(url);

      if (data?.success) {
        const newData = data.values ?? [];

        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );

        const pageSize = 20;
        setHasMoreOpen(newData.length === pageSize);
        setOpenListPage(pageNum);
      } else {
        setHasMoreOpen(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreOpen(false);
    }
  };

  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  // Initial fetch
  useEffect(() => {
    fetchOpenListData(0);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchGetListData = async (pageNum = 0, searchTerm = "") => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const encodedSearch = encodeURIComponent(searchTerm.trim());

      const url = encodedSearch
        ? `/ARInvoice/CopyFrom?SearchText=${encodedSearch}&Page=${pageNum}`
        : `/ARInvoice/CopyFrom?Page=${pageNum}`;

      const { data } = await apiClient.get(url, {
        signal: controller.signal,
      });

      if (data?.success) {
        const newData = data?.values || [];
        setHasMoreGetList(newData.length === 20);
        setGetListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        setHasMoreGetList(false);
        setGetListData([]);
      }
    } catch (error) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        return;
      }

      setHasMoreGetList(false);
    }
  };

  const fetchMoreGetListData = () => {
    fetchGetListData(getListPage + 1, getListSearching ? getListquery : "");
    setGetListPage((prev) => prev + 1);
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

  // Clear search
  const handleOpenListClear = () => {
    setOpenListQuery(""); // Clear searFullAddressch input
    setOpenListSearching(false); // Reset search state
    setOpenListPage(0); // Reset page count
    setOpenListData([]); // Clear data
    fetchOpenListData(0); // Fetch first page without search
  };

  useEffect(() => {
    if (searchmodelOpen === true) {
      fetchGetListData(0);
    }
  }, [searchmodelOpen]);

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

  const handleGetListClear = () => {
    setGetListQuery("");
    setGetListSearching(true);
    setGetListPage(0);
    setGetListData([]);
    fetchGetListData(0);
  };

  const fetchClosedListData = async (pageNum, searchTerm = "") => {
    try {
      const url = searchTerm
        ? `/ARInvoice?SearchText=${searchTerm}&Status=0&Page=${pageNum}`
        : `/ARInvoice?Status=0&Page=${pageNum}`;

      const { data } = await apiClient.get(url);

      if (data?.success) {
        const newData = data.values ?? [];

        setHasMoreClosed(newData.length === 20);

        setClosedListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      } else {
        setHasMoreClosed(false);
        Swal.fire({
          text: data?.message || "Something went wrong",
          icon: "question",
          confirmButtonText: "YES",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMoreClosed(false);

      Swal.fire({
        text: error.message,
        icon: "question",
        confirmButtonText: "YES",
      });
    }
  };

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

  // Clear search
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

  // Initial fetch
  useEffect(() => {
    fetchClosedListData(0);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (event, newValue) => {
    settabvalue(newValue);
    setValue("CreditCardNumber", "");
    setValue("CreditSum", 0);
    setValue("VoucherNum", "");
    setValue("CreditCard", "");
    lastValidValuesRef.current = {
      ...lastValidValuesRef.current,
      CreditSum: 0,
    };
  };

  const handleTabChangeRight = (e, newvalue1) => {
    settab(newvalue1);
  };

  const lastValidValuesRef = useRef({
    CashPaid: 0,
    TransferSum: 0,
    CreditSum: 0,
  });

  const CreditCardList = [
    { Name: "KNET", AccountCode: "1201024" },
    { Name: "MASTER", AccountCode: "1201024" },
    { Name: "VISA", AccountCode: "1201024" },
    { Name: "MF", AccountCode: "1201029" },
    { Name: "TABBY", AccountCode: "1201036" },
    { Name: "TAMARA", AccountCode: "1201039" },
    { Name: "TALY", AccountCode: "1201041" },
  ];

  const oLines = useWatch({ control, name: "oLines" });

  const PaymentCalc = () => {
    const allFormData = getValues();
    const dueAmt = parseFloat(watch("DueAmount")) || 0;

    const oCCPayList = getValues("oCCPay") || [];
    const creditSumTotal = oCCPayList.reduce((sum, item) => {
      return sum + parseFloat(item.CreditSum || 0);
    }, 0);

    const cashPaid = parseFloat(allFormData.CashPaid) || 0;
    const transferSum = parseFloat(allFormData.TransferSum) || 0;

    const totalPaid = parseFloat(
      (cashPaid + transferSum + creditSumTotal).toFixed(3),
    );

    if (totalPaid > dueAmt) {
      Swal.fire({
        text: "Paid Value Should not be greater than Total Due Amount",
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

    // Update last valid values
    lastValidValuesRef.current = {
      CashPaid: cashPaid,
      TransferSum: transferSum,
      CreditSum: lastValidValuesRef.current.CreditSum,
    };

    setValue("TotalDueAmount", (dueAmt - totalPaid).toFixed(3));
    setValue("PaidAmount", totalPaid.toFixed(3));
  };

  const handleOnChangeCreditValue = (e) => {
    const { name, value } = e.target;
    const allFormData = getValues();
    const oCCPayList = getValues("oCCPay") || [];

    const creditSumTotal = oCCPayList.reduce((sum, item) => {
      return sum + parseFloat(item.CreditSum || 0);
    }, 0);

    const cashPaid = parseFloat(allFormData.CashPaid) || 0;
    const transferSum = parseFloat(allFormData.TransferSum) || 0;
    const balanceDue = parseFloat(allFormData.BalanceDueAmount || 0);
    const totalPaid = parseFloat(
      (cashPaid + transferSum + creditSumTotal).toFixed(3),
    );

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
      const newCredit = parseFloat(value || 0);
      const creditSum = parseFloat(value);

      if (totalPaid + newCredit > balanceDue) {
        Swal.fire({
          text: "Paid Value should not be greater than Total Due Amount",
          icon: "warning",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });

        // Slice the last character and revert to previous valid value
        const trimmedValue = value.slice(0, -1);
        setValue("CreditSum", trimmedValue); // keep input editable but controlled
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
  const [radioKey, setRadioKey] = useState(0);

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

    PaymentCalc();
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

  const handleRowDelete = (index) => {
    const currentList = [...bankData];
    currentList.splice(index, 1);
    setBankData(currentList);
    setValue("oCCPay", currentList);
    PaymentCalc();
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
          Closed Invoices
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
                          title={item.CardName}
                          subtitle={item.DocNum}
                          description={item.PhoneNumber1}
                          searchResult={query}
                          onClick={() => SetoldData(item.DocEntry)}
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

  return (
    <>
      <Loader open={loading} />
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
              Cash AR Invoice
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
                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign="center">
                        <Controller
                          name="Job_SO_DocEntry"
                          control={control}
                          render={({ field }) => (
                            <InputTextSearchButton
                              label="JOB CARD/SO NO"
                              onClick={() => {
                                OpenDailog();
                              }}
                              readOnly={true}
                              disabled={!!DocEntry}
                              onChange={OpenDailog}
                              {...field}
                            />
                          )}
                        />
                        <SearchModel
                          open={searchmodelOpen}
                          onClose={SearchModelClose}
                          onCancel={SearchModelClose}
                          title="Select Job Card / SO NO"
                          onChange={(e) => handleGetListSearch(e.target.value)}
                          value={getListquery}
                          onClickClear={handleGetListClear}
                          cardData={
                            <>
                              <InfiniteScroll
                                style={{ textAlign: "center" }}
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
                                    title={item.Job_SO_DocEntry}
                                    subtitle={item.CardName}
                                    description={item.PhoneNumber1}
                                    onClick={() => {
                                      onSelectRequest(item);
                                    }}
                                  />
                                ))}
                              </InfiniteScroll>
                            </>
                          }
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="VehInwardDate"
                          control={control}
                          render={({ field }) => (
                            <InputDatePickerField
                              label="INWARD DATE"
                              name={field.name}
                              value={
                                field.value ? dayjs(field.value) : undefined
                              }
                              onChange={(date) =>
                                field.onChange(
                                  date ? date.toISOString() : undefined,
                                )
                              }
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        {/* <Controller
                          name="VehInwardTime"
                          control={control}
                          render={({ field }) => (
                            <InputTimePicker
                              {...field}
                              label="INWARD TIME"
                              readOnly={true}
                            />
                          )}
                        /> */}

                        <Controller
                          name="VehInwardTime"
                          control={control}
                          render={({ field }) => (
                            <InputFields
                              {...field}
                              label="INWARD TIME"
                              value={
                                field.value
                                  ? dayjs(field.value).format("HH:mm")
                                  : ""
                              }
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="Email"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="CUSTOMER EMAIL"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="RegistrationNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="REGISTRATION NO"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="CardName"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="CUSTOMER NAME"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="PhoneNumber1"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="CUSTOMER NUMBER"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="DocNum"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="INV NO"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Grid container direction="column">
                      <Grid item textAlign={"center"}>
                        <Controller
                          name="VehInwardNo"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="INWARD NO"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="JobWorkAt"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="JOB WORK AT"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Tooltip
                          title={(watch("JobRemarks") || "").toUpperCase()}
                          arrow
                        >
                          <div style={{ width: "100%" }}>
                            <Controller
                              name="JobRemarks"
                              control={control}
                              render={({ field }) => (
                                <InputTextArea
                                  label="JOB WORK DETAILS"
                                  type="text"
                                  {...field}
                                  readOnly={processinv === false}
                                />
                              )}
                            />
                          </div>
                        </Tooltip>
                      </Grid>

                      <Grid item textAlign={"center"}>
                        <Controller
                          name="OrderType"
                          control={control}
                          render={({ field }) => (
                            <InputTextField
                              label="ORDER TYPE"
                              type="text"
                              {...field}
                              readOnly={true}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    item
                    sx={{
                      px: 2,
                      overflow: "auto",
                      width: "100%",
                      maxHeight: 400,
                      minHeight: 150,
                    }}
                  >
                    <DataGrid
                      className="datagrid-style"
                      rows={oLines}
                      columns={columns}
                      getRowId={(row) =>
                        row.ItemCode || row.LineNum || JSON.stringify(row)
                      }
                      columnHeaderHeight={35}
                      rowHeight={40}
                      hideFooter
                      sx={{
                        width: "100%",
                        ...gridSx,
                      }}
                      autoHeight="false"
                      editMode={false}
                    />
                  </Grid>

                  <Grid container item mt={1}>
                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="TotalPartsValue"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="PARTS VALUE"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="DesiredDisc"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="DISC(%)"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="DesiredDiscAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="DISC AMT"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="SpecialDisc"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="SPECIAL DISC(%)"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="SpecialDiscAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="SPECIAL DISC AMT"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>

                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="ShippingAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="SHIPPING"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="RoundingAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="ROUNDING OFF"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="ServiceAndInstallation"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="SERVICE & INSTALL"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>

                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="SparesNetAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="NET PARTS VALUE"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>

                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="TotalDocAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="TOTAL DOC VALUE"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="AdvanceAmount"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="ADVANCE PAID"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>

                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="TaxCode"
                        control={control}
                        defaultValue={""}
                        render={({ field }) => (
                          <SmallInputSearchSelectTextField
                            {...field}
                            label="VAT(%)"
                            data={[{ key: "", value: "" }]}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>

                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="TaxAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="VAT AMOUNT"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>

                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="CurrAmt"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="CURRAMT"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>

                    <Grid sm={4} md={4} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="BalanceDueAmount"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="DUE AMOUNT"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  {Number(getValues("DueAmount")) > 0 &&
                    getValues("Status") !== "0" &&
                    getValues("Status") !== "1" && (
                      <Grid container item>
                        <Grid item width="100%" mt={3} border="1px solid grey">
                          <Tabs
                            value={tabvalue}
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
                          {tabvalue === 0 && (
                            <>
                              <Grid container padding={2}>
                                <Grid item sm={5} md={6} lg={4} xs={12}>
                                  <SmallInputFields
                                    name="CashPaid"
                                    control={control}
                                    label="CASH PAID"
                                    width={140}
                                    onChange={PaymentCalc}
                                    type="Number"
                                    inputProps={{ min: 0 }}
                                  />
                                  {/* <Controller
                                    name="CashPaid"
                                    control={control}
                                    render={({ field }) => (
                                      <InputTextField
                                        label="CASH PAID"
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          PaymentCalc(e);
                                        }}
                                        type="Number"
                                      />
                                    )}
                                  /> */}
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
                          {tabvalue === 1 && (
                            <>
                              <Grid container padding={2}>
                                <Grid
                                  container
                                  item
                                  lg={6}
                                  xs={12}
                                  md={6}
                                  sm={6}
                                >
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
                                    {/* <Controller
                                      name="CreditSum"
                                      control={control}
                                      render={({ field }) => (
                                        <SmallInputTextField
                                          label="CREDIT SUM"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e);
                                            handleOnChangeCreditValue(e);
                                          }}
                                          type="Number"
                                        />
                                      )}
                                    /> */}
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
                                    sx={{ overflow: "auto", height: 200 }}
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
                                            <TableCell>
                                              {data.CashAccount}
                                            </TableCell>
                                            <TableCell>
                                              {data.CreditCard}
                                            </TableCell>
                                            <TableCell>
                                              {data.CreditCardNumber}
                                            </TableCell>
                                            <TableCell>
                                              {data.CreditSum}
                                            </TableCell>
                                            <TableCell>
                                              <IconButton
                                                onClick={() => {
                                                  handleRowDelete(index);
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
                          {tabvalue === 2 && (
                            <>
                              <Grid container padding={2}>
                                <Grid sm={12} md={6} lg={3} xs={12}>
                                  <SmallInputFields
                                    name="TransferSum"
                                    control={control}
                                    label="TRANSFER SUM"
                                    width={140}
                                    onChange={PaymentCalc}
                                    type="Number"
                                  />
                                  {/* <Controller
                                    name="TransferSum"
                                    control={control}
                                    render={({ field }) => (
                                      <InputTextField
                                        label="TRANSFER SUM"
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          PaymentCalc(e);
                                        }}
                                        type="Number"
                                      />
                                    )}
                                  /> */}
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
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleOnChangeCreditValue(e);
                                        }}
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

                  <Grid container item>
                    <Grid sm={6} md={6} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="TotalDueAmount"
                        control={control}
                        rules={{ required: "Paid Amount " }}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="TOTAL DUE AMOUNT"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid sm={6} md={6} lg={2.3} xs={6} textAlign={"center"}>
                      <Controller
                        name="PaidAmount"
                        control={control}
                        render={({ field }) => (
                          <SmallInputTextField
                            label="PAID DUE AMOUNT"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={3.5}
                      xs={12}
                      textAlign={"center"}
                    >
                      <Controller
                        name="SAPDocNum"
                        control={control}
                        render={({ field }) => (
                          <InputTextField
                            label="SAP INVOICE NO"
                            type="text"
                            {...field}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      sm={6}
                      md={6}
                      lg={3.5}
                      xs={12}
                      textAlign="center"
                    >
                      <Controller
                        name="InvoiceDate"
                        control={control}
                        render={({ field }) => (
                          <InputDatePickerField
                            label="INVOICE DATE"
                            name={field.name}
                            value={field.value ? dayjs(field.value) : undefined}
                            readOnly={true}
                          />
                        )}
                      />
                    </Grid>
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
                disabled={
                  (processinv && !perms.IsAdd) ||
                  processinv === false ||
                  watch("Job_SO_DocEntry") === ""
                }
              >
                PROCESS INVOICE
              </Button>

              <Grid item>
                <PrintMenu
                  disabled={!watch("DocEntry") || processinv === true}
                  type={"IN"}
                  DocEntry={watch("DocEntry")}
                  PrintData={PrintData}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
