import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Grid,
  InputAdornment,
  Tooltip as MuiTooltip,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BeatLoader } from "react-spinners";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridSx } from "../../Styles/dataGridStyles";
import song from "../../assets/audio/catoon.wav";

export default function Home() {
  const theme = useTheme();
  const gridSx = useMemo(() => dataGridSx(theme), [theme]);

  // States for Sales Analysis List
  const [SalesAnalysisList, setSalesAnalysisList] = useState([]);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [loadingSalesAnalysis, setLoadingSalesAnalysis] = useState(false);

  // States for Sales Service List
  const [SalesServiceList, setSalesServiceList] = useState([]);
  const [totalSalesServiceAmount, setTotalSalesServiceAmount] = useState(0);
  const [loadingSalesService, setLoadingSalesService] = useState(false);

  // States for Target VS Actual List
  const [TargetVSActualList, setTargetVSActual] = useState([]);
  const [loadingTargetVSActual, setLoadingTargetVSActual] = useState(false);

  // States for Top Sales Person List
  const [TopSalesPersonList, setTopSalesPersonList] = useState([]);
  const [loadingTopSalesPerson, setLoadingTopSalesPerson] = useState(false);

  // States for Top Products List
  const [TopProductsList, setTopProductsList] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);

  // States for Top Customer List
  const [TopCustomerList, setTopCustomerList] = useState([]);
  const [loadingTopCustomer, setLoadingTopCustomer] = useState(false);

  // States for Sales Dashboard open SO List
  const [SalesDashOpenSOList, setSalesDashOpenSOList] = useState([]);
  const [loadingSalesDashOpenSO, setLoadingSalesDashOpenSO] = useState(false);
  const [searchSalesDashOpenSO, setSearchSalesDashOpenSO] = useState("");

  // States for Sales Dashboard Total Months Sale
  const [SalesDashTotalMonthsSale, setSalesDashTotalMonthsSale] =
    useState(15000);
  const [maxValueSalesDash, setMaxValueSalesDash] = useState(15000);
  const [listSalesDash, setListSalesDash] = useState([]);
  const [
    SalesDashloadingTotalMonthsSale,
    setMonthlySaleLoadingTotalMonthsSale,
  ] = useState(false);

  // States for Appointment List
  const [searchAppointment, setSearchAppointment] = useState("");
  const [AppointmentList, setAppointmentList] = useState([]);
  const [loadingAppointment, setLoadingAppointment] = useState(false);

  // States for Workshop Revenue Data
  const [workshopRevenueData, setworkshopRevenueData] = useState([]);
  const [workshopRevenueMax, setworkshopRevenue] = useState(0);

  // Material Request List States
  const [loadingMaterialRequest, setLoadingMaterialRequest] = useState(false);
  const [MaterialRequestList, setMaterialRequestList] = useState([]);
  const [searchMaterialRequest, setSearchMaterialRequest] = useState("");
  const knownMaterialRequestDocs = useRef(new Set());
  const initialLoadDone = useRef(false);

  const [openSOPage, setOpenSOPage] = useState(0);
  const [materialPage, setMaterialPage] = useState(0);
  const [appointmentPage, setAppointmentPage] = useState(0);
  const [hasMoreAppointments, setHasMoreAppointments] = useState(true);
  const [hasMoreOpenSO, setHasMoreOpenSO] = useState(true);
  const [hasMoreMaterial, setHasMoreMaterial] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      SelectedDate: new Date(), // or dayjs().toDate()
    },
  });
  const BASE_URL = "http://hwaceri5:8070/api";

  const test = localStorage.getItem("RoleDetails");
  const parsed = test ? JSON.parse(test) : [];
  const menuIds = parsed.map((item) => item.MenuId);

  const menuospIds = parsed.flatMap(
    (item) => item.oSpecialAccessLines?.map((sa) => sa.MenuId) || [],
  );

  // Sales Manager DashBoard
  const SALES_MANAGER = menuIds.includes(45); //ParentMenuId
  const SALES_ANALYSIS_PARTS_ONLY_MTD = menuospIds.includes(6);
  const WORKSHOP_REVENUE_MTD_IN_KWD = menuospIds.includes(7);
  const TARGET_VS_ACTUAL_PARTS_12MONTHS = menuospIds.includes(8);
  const SALESMAN_WISE_SALES_MTD = menuospIds.includes(9);
  const TOP_20_PRODUCT_MTD = menuospIds.includes(10);
  const TOP_20_CUSTOMER_MTD_RETAIL = menuospIds.includes(11);

  // Sales DashBoard
  const Sales_DashBoard = menuIds.includes(43); //ParentMenuId
  const Sales_OPEN_SALES_ORDERS = menuospIds.includes(1);
  const MONTHLY_SALE = menuospIds.includes(2);

  //Warehouse DashBoard
  const WAREHOUSE_DASHBOARD = menuIds.includes(40); //ParentMenuId
  const MATERIAL_REQUEST_LIST = menuospIds.includes(16);

  //WORKSHOP DashBoard
  const WORKSHOP_DASHBOARD = menuIds.includes(41); //ParentMenuId
  const TODAYS_SCHEDULED_APPOINTMENTS_FOR_INWARD = menuospIds.includes(12);
  const WORKSHOP_REVENUE_MTD_IN_KWD_WORKSHOP = menuospIds.includes(13);

  const colWidth =
    SalesAnalysisList.length < 10 && SalesServiceList.length < 10 ? 6 : 12;

  const selectedMonth = watch("SelectedDate");

  const formatSalesAmount = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    return parseFloat(value)
      .toFixed(3)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const getColorStyle = (row) => {
    return row.STKAval === "YES" ? "text-green" : "text-blacked";
  };

  const getAllSalesAnalysis = async (filterDate = null) => {
    setLoadingSalesAnalysis(true);
    try {
      const endpoint = `${BASE_URL}/DashBoard/SalesReports/SalesAnalysisMTD/${filterDate}`;
      const res = await axios.get(endpoint);
      const values = res.data.values || [];

      const chartData = values.map((item) => ({
        DocDate: dayjs(item.SaleDate).format("DD-MM-YYYY"),
        SaleAmount: item.SaleAmount,
      }));

      setSalesAnalysisList(chartData);

      const total = values.reduce((acc, item) => acc + item.SaleAmount, 0);
      setTotalSalesAmount(total);
    } catch (err) {
      console.error("Error fetching sales report:", err);
    } finally {
      setLoadingSalesAnalysis(false);
    }
  };

  const getAllSalesServiceList = async (filterDate = null) => {
    setLoadingSalesService(true);
    try {
      const endpoint = `${BASE_URL}/DashBoard/Workshop/SalesMTDService/${filterDate}`;
      const res = await axios.get(endpoint);
      const values = res.data.values || [];

      const chartData = values.map((item) => ({
        DocDate: dayjs(item.DocDate).format("DD-MM-YYYY"),
        SaleAmount: item.SaleAmount,
      }));

      setSalesServiceList(chartData);

      const total = values.reduce((acc, item) => acc + item.SaleAmount, 0);
      setTotalSalesServiceAmount(total);
    } catch (err) {
      console.error("Error fetching service sales report:", err);
    } finally {
      setLoadingSalesService(false);
    }
  };

  const TargetVSActualTableColumns = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) =>
        params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    {
      field: "MonthYear",
      headerName: "MONTH",
      flex: 1,
    },
    {
      field: "TargetSales",
      headerName: "TARGET SALES",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) =>
        value != null && value !== ""
          ? parseFloat(value)
              .toFixed(3)
              .replace(/\d(?=(\d{3})+\.)/g, "$&,")
          : "",
    },
    {
      field: "ActualSales",
      headerName: "ACTUAL SALES",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) =>
        value != null && value !== ""
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 3,
            })
          : "",
    },
    {
      field: "VarienceValue",
      headerName: "VARIANCE VALUE",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) =>
        value != null && value !== ""
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 3,
            })
          : "",
    },
    {
      field: "VariencePer",
      headerName: "VARIANCE (%)",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) =>
        value != null && value !== ""
          ? Number(value).toLocaleString("en-IN", {
              minimumFractionDigits: 3,
            })
          : "",
    },
  ];

  const getAllTargetVsActual = useCallback(async () => {
    if (!selectedMonth) return;

    try {
      setLoadingTargetVSActual(true);

      const endpoint = `${BASE_URL}/DashBoard/SalesReports/TargetVSActual/${dayjs(
        selectedMonth,
      ).format("YYYY-MM-DD")}`;
      const res = await axios.get(endpoint);
      const values = Array.isArray(res.data?.values) ? res.data.values : [];

      const sorted = values
        .map((item, index) => {
          const [month = 0, year = 0] =
            item?.MonthYear?.split("-").map(Number) || [];

          return {
            id: `${year}-${month}`,
            ...item,
            month,
            year,
          };
        })
        .sort((a, b) =>
          b.year !== a.year ? b.year - a.year : b.month - a.month,
        )
        .map(({ month, year, ...rest }) => rest);

      setTargetVSActual(sorted);
    } catch (err) {
      console.error("Error fetching Target vs Actual:", err);
    } finally {
      setLoadingTargetVSActual(false);
    }
  }, [selectedMonth]);

  const TopSalesPersonColumns = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) =>
        params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    {
      field: "SalesPerson",
      headerName: "SALES PERSON",
      flex: 1,
    },
    {
      field: "SalesAmount",
      headerName: "SALES AMOUNT",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => formatSalesAmount(value),
    },
  ];

  const getAllSalesPerson = useCallback(async () => {
    if (!selectedMonth) return;

    try {
      setLoadingTopSalesPerson(true);

      const endpoint = `${BASE_URL}/DashBoard/SalesReports/TopSalesPersonMTD/${dayjs(
        selectedMonth,
      ).format("YYYY-MM-DD")}`;

      const res = await axios.get(endpoint);

      const values = Array.isArray(res.data?.values) ? res.data.values : [];

      // Add unique id for DataGrid
      const rows = values.map((item, index) => ({
        id: item.SalesPerson || index + 1, // unique id
        SalesPerson: item.SalesPerson,
        SalesAmount: Number(item.SalesAmount) || 0,
      }));

      setTopSalesPersonList(rows);
    } catch (err) {
      console.error("Error fetching Top Sales Person:", err);
    } finally {
      setLoadingTopSalesPerson(false);
    }
  }, [selectedMonth]);

  const TopProductsColumns = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) =>
        params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    {
      field: "Supplier",
      headerName: "SUPPLIER",
      flex: 1,
    },
    {
      field: "ItemCode",
      headerName: "ITEMCODE",
      flex: 1,
    },
    {
      field: "SalesAmount",
      headerName: "SALES AMOUNT",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => formatSalesAmount(value),
    },
  ];

  const getAllTopProducts = useCallback(() => {
    setLoadingTopProducts(true);

    axios
      .get(
        `${BASE_URL}/DashBoard/SalesReports/Top20ProductsMTD/${dayjs(
          selectedMonth,
        ).format("YYYY-MM-DD")}`,
      )
      .then((res) => {
        const values = res.data.values || [];
        setTopProductsList(values);
      })
      .catch((err) => console.error("Error fetching Top Products:", err))
      .finally(() => setLoadingTopProducts(false));
  }, [selectedMonth]);

  const TopCustomerColumns = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) =>
        params.api.getSortedRowIds().indexOf(params.id) + 1,
    },
    {
      field: "CardName",
      headerName: "CUST NAME",
      flex: 1,
    },
    {
      field: "PhoneNumber1",
      headerName: "CONTACT NO",
      flex: 1,
    },
    {
      field: "SalesAmount",
      headerName: "SALES AMOUNT",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => formatSalesAmount(value),
    },
  ];

  const getAllTopCustomer = useCallback(() => {
    setLoadingTopCustomer(true);

    axios
      .get(
        `${BASE_URL}/DashBoard/SalesReports/Top20BPMTD/${dayjs(
          selectedMonth,
        ).format("YYYY-MM-DD")}`,
      )
      .then((res) => {
        const values = res.data.values || [];
        setTopCustomerList(values);
      })
      .catch((err) => console.error("Error fetching Top Customers:", err))
      .finally(() => setLoadingTopCustomer(false));
  }, [selectedMonth]);

  const SalesDashOpenSOColumns = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>
          {openSOPage * 20 +
            params.api.getSortedRowIds().indexOf(params.id) +
            1}
        </span>
      ),
    },
    {
      field: "OrderNo",
      headerName: "SO NO",
      flex: 1,
      renderCell: (params) => (
        <span
          title={params.row.OrderNo}
          style={{ cursor: "pointer", textDecoration: "underline" }}
          className={getColorStyle(params.row)}
        >
          {params.row.OrderNo.toUpperCase()}
        </span>
      ),
    },
    {
      field: "DocDate",
      headerName: "SO DATE",
      flex: 1,
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>
          {params.row?.DocDate
            ? dayjs(params.row.DocDate).format("DD-MMM-YYYY")
            : ""}
        </span>
      ),
    },
    {
      field: "Category",
      headerName: "CATEGORY",
      flex: 1,
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>
          {Number(params.row.Category) === 100
            ? "RETAIL"
            : Number(params.row.Category) === 102
              ? "WHOLESALE B2B"
              : Number(params.row.Category) === 103
                ? "EXPORT"
                : ""}
        </span>
      ),
    },
    {
      field: "CreatedBy",
      headerName: "SALES EMP",
      flex: 1,
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>
          {params.row.CreatedBy}
        </span>
      ),
    },
    {
      field: "CardName",
      headerName: "CUSTOMER NAME",
      flex: 1,
      renderCell: (params) => (
        <MuiTooltip title={params.row.CardName} arrow>
          <span className={getColorStyle(params.row)}>
            {params.row.CardName}
          </span>
        </MuiTooltip>
      ),
    },
    {
      field: "PhoneNumber1",
      headerName: "CONTACT NO",
      flex: 1,
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>
          {params.row.PhoneNumber1}
        </span>
      ),
    },
    {
      field: "TotalDocAmt",
      headerName: "TOTAL DOC AMT",
      flex: 1,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>
          {formatSalesAmount(params.row.TotalDocAmt)}
        </span>
      ),
    },
    {
      field: "DueAmount",
      headerName: "DUE AMT",
      flex: 1,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>
          {formatSalesAmount(params.row.DueAmount)}
        </span>
      ),
    },
    {
      field: "STKAval",
      headerName: "STK_AVL",
      flex: 1,
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>{params.row.STKAval}</span>
      ),
    },
    {
      field: "DPPaid",
      headerName: "DP_PAID",
      flex: 1,
      renderCell: (params) => (
        <span className={getColorStyle(params.row)}>{params.row.DPPaid}</span>
      ),
    },
    {
      field: "HWReason",
      headerName: "REASON",
      renderCell: (params) => (
        <MuiTooltip title={params.row.HWReason} arrow>
          <span
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              cursor: "pointer",
              lineHeight: "1.2",
            }}
            className={getColorStyle(params.row)}
          >
            {params.row.HWReason}
          </span>
        </MuiTooltip>
      ),
    },
  ];

  const getSalesDashOpenSOData = useCallback(async (search = "", page = 0) => {
    const UserId = localStorage.getItem("UserId");
    const userDetails = JSON.parse(localStorage.getItem("UserDetails"));
    const RoleName = userDetails?.Role;
    const user = RoleName === "SALES" ? UserId : "ADMIN";

    try {
      setLoadingSalesDashOpenSO(true);
      const endpoint = search
        ? `${BASE_URL}/DashBoard/Sales/OpenSO/${user}/${search}/${page}`
        : `${BASE_URL}/DashBoard/Sales/OpenSO/${user}/${page}`;

      const res = await axios.get(endpoint);
      if (res.data.success) {
        const values = res.data.values || [];
        setSalesDashOpenSOList(values);
        setHasMoreOpenSO(values.length === 20);
      } else {
        setSalesDashOpenSOList([]);
        setHasMoreOpenSO(false);
      }
    } catch (err) {
      console.error(err);
      setSalesDashOpenSOList([]);
      setHasMoreOpenSO(false);
    } finally {
      setLoadingSalesDashOpenSO(false);
    }
  }, []);

  const getSalesDashTotalMonthsSale = async (filterDate = null) => {
    const UserId = localStorage.getItem("UserId");
    setMonthlySaleLoadingTotalMonthsSale(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/DashBoard/Sales/MonthlySale/${UserId}/${filterDate}`,
      );

      const filteredList = res.data.values.filter(
        (s) => parseFloat(s.SaleAmount) > 0,
      );

      const newMaxValue =
        Math.max(...res.data.values.map((s) => parseFloat(s.SaleAmount))) + 200;

      const totalSale = res.data.values.reduce(
        (acc, curr) => acc + curr.SaleAmount,
        0,
      );

      setListSalesDash(filteredList);
      setMaxValueSalesDash(newMaxValue);
      setSalesDashTotalMonthsSale(totalSale);
    } catch (err) {
      console.error("Error fetching sales report:", err);
    } finally {
      setMonthlySaleLoadingTotalMonthsSale(false);
    }
  };

  const AppointmentTableColumns = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <span>
          {appointmentPage * 20 +
            params.api.getSortedRowIds().indexOf(params.id) +
            1}
        </span>
      ),
    },
    {
      field: "OrderNo",
      headerName: "SO NO",
      flex: 1,
      renderCell: (params) => (
        <span
          title={params.row.OrderNo}
          style={{ cursor: "pointer", textDecoration: "underline" }}
          // onClick={() => {
          //   navigate(
          //     `${process.env.PUBLIC_URL}/pages/Workshop/inward-vehicle?Mode=edit&DocEntry=${row.OrderDocEntry}`,
          //   );
          // }}
        >
          {params.row.OrderNo.toUpperCase()}
        </span>
      ),
    },
    {
      field: "AppointTimeFrom",
      headerName: "APPOINTMENT FROM",
      flex: 1,
      renderCell: (params) => dayjs(params.row.AppointTimeFrom).format("HH:mm"),
    },
    {
      field: "AppointTimeTo",
      headerName: "APPOINTMENT TO",
      flex: 1,
      renderCell: (params) => dayjs(params.row.AppointTimeTo).format("HH:mm"),
    },
    {
      field: "PhoneNumber1",
      headerName: "CONTACT NO",
      flex: 1,
    },
    {
      field: "CardName",
      headerName: "CUSTOMER NAME",
      flex: 1,
      renderCell: (params) => (
        <MuiTooltip title={params.row.CardName || ""} arrow>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {params.row.CardName}
          </span>
        </MuiTooltip>
      ),
    },
    {
      field: "Action",
      headerName: "ACTION",
      flex: 1,
      headerAlign: "center",
      alignItems: "center",
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <i
            className="icofont icofont-print text-primary"
            style={{ fontSize: "15px", cursor: "pointer" }}
            // onClick={() => {
            //   printReport(row.DocEntry);
            // }}
          ></i>
        </div>
      ),
    },
  ];

  const getAppointmentData = async (search = "", page = 0) => {
    setLoadingAppointment(true);

    try {
      const endpoint = `${BASE_URL}/DashBoard/Workshop/AptForInward/All`;

      const res = await axios.get(endpoint);

      if (res.data.success) {
        const values = res.data.values || [];
        setAppointmentList(values);
        setHasMoreAppointments(values.length === 20); // if less than 20, no more pages
      } else {
        setAppointmentList([]);
        setHasMoreAppointments(false);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointmentList([]);
      setHasMoreAppointments(false);
    } finally {
      setLoadingAppointment(false);
    }
  };

  const getworkshopRevenueReport = async (filterDate = null) => {
    setLoadingAppointment(true);
    try {
      const endpoint = `${BASE_URL}/DashBoard/Workshop/SalesMTDService/${filterDate}`;

      const res = await axios.get(endpoint);
      const values = res.data.values || [];

      const maxValue = Math.max(
        ...values.map((data) => parseFloat(data.SaleAmount || 0)),
        0,
      );

      const chartData = values.map((data) => ({
        DocDate: dayjs(data.DocDate).format("DD-MM-YYYY"),
        SaleAmount: parseFloat(data.SaleAmount || 0),
      }));

      setworkshopRevenueData(chartData);
      setworkshopRevenue(maxValue);
    } catch (err) {
      console.error("Error fetching workshop sales report:", err);
    } finally {
      setLoadingAppointment(false);
    }
  };

  const searchItemColumn = [
    {
      field: "srNo",
      headerName: "SR.NO",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <span>
          {materialPage * 20 +
            params.api.getSortedRowIds().indexOf(params.id) +
            1}
        </span>
      ),
    },
    {
      field: "DocNum",
      headerName: "MR NO",
      flex: 1,
      renderCell: (params) => (
        <span
          title={params.row.DocNum}
          style={{ cursor: "pointer", textDecoration: "underline" }}
          // onClick={() => {
          //   navigate(
          //     `${process.env.PUBLIC_URL}/pages/WareHouse/Issue-Material`,
          //   );
          // }}
        >
          {params.row.DocNum.toUpperCase()}
        </span>
      ),
    },
    {
      field: "OrderNo",
      headerName: "SO NO",
      flex: 1,
    },
    {
      field: "requestDateOnly",
      headerName: "MR DATE",
      flex: 1,
      renderCell: (params) =>
        dayjs(params.row.RequestDate).format("DD-MMM-YYYY"),
    },
    {
      field: "requestTimeOnly",
      headerName: "REQUEST TIME",
      flex: 1,
      renderCell: (params) => dayjs(params.row.RequestDate).format("HH:mm"),
    },
    {
      field: "CardName",
      headerName: "CUSTOMER NAME",
      flex: 1,
      renderCell: (params) => (
        <MuiTooltip title={params.row.CardName || ""} arrow>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {params.row.CardName}
          </span>
        </MuiTooltip>
      ),
    },
    {
      field: "JobWorkAt",
      headerName: "JOB WORK AT",
      flex: 1,
      renderCell: (params) => (
        <MuiTooltip title={params.row.JobWorkAt || ""} arrow>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {params.row.JobWorkAt}
          </span>
        </MuiTooltip>
      ),
    },
    {
      field: "ReqRemarks",
      headerName: "JOB DESCRIPTION",
      flex: 1,
      renderCell: (params) => (
        <MuiTooltip title={params.row.ReqRemarks || ""} arrow>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {params.row.ReqRemarks}
          </span>
        </MuiTooltip>
      ),
    },
    {
      field: "SOCreatedBy",
      headerName: "SO CREATED BY",
      flex: 1,
      renderCell: (params) => (
        <MuiTooltip title={params.row.SOCreatedBy || ""} arrow>
          <span>{params.row.SOCreatedBy}</span>
        </MuiTooltip>
      ),
    },
  ];

  const getMaterialRequestData = async (search = "", page = 0) => {
    setLoadingMaterialRequest(true);

    try {
      const cleanedSearch = String(search || "")
        .trim()
        .replace(/\+/g, "");

      const endpoint = cleanedSearch
        ? `${BASE_URL}/DashBoard/Warehouse/MatReqForIssue/search/${cleanedSearch}/${page}`
        : `${BASE_URL}/DashBoard/Warehouse/MatReqForIssue/${page}`;

      const res = await axios.get(endpoint);

      if (res.data.success) {
        const newData = res.data.values || [];

        const trulyNewRecords = newData.filter(
          (item) => !knownMaterialRequestDocs.current.has(item.DocNum),
        );

        newData.forEach((item) =>
          knownMaterialRequestDocs.current.add(item.DocNum),
        );

        if (initialLoadDone.current && trulyNewRecords.length > 0) {
          const ad = new Audio(song);
          ad.play().catch(() => {});
        }

        setMaterialRequestList(newData);
        setHasMoreMaterial(newData.length === 20); // ✅ added

        if (!initialLoadDone.current) {
          initialLoadDone.current = true;
        }
      } else {
        setMaterialRequestList([]);
        setHasMoreMaterial(false); // ✅ added
      }
    } catch (err) {
      console.error("Error fetching material request data:", err);
      setMaterialRequestList([]);
      setHasMoreMaterial(false); // ✅ added
    } finally {
      setLoadingMaterialRequest(false);
    }
  };

  const selectedMonthKey = selectedMonth
    ? dayjs(selectedMonth).format("YYYY-MM-DD")
    : null;

  useEffect(() => {
    if (!selectedMonthKey) return;

    getAllSalesAnalysis(selectedMonthKey);
    getAllSalesServiceList(selectedMonthKey);
    getSalesDashTotalMonthsSale(selectedMonthKey);
    getworkshopRevenueReport(selectedMonthKey);
    getAllTargetVsActual();
    getAllSalesPerson();
    getAllTopProducts();
    getAllTopCustomer();
    getSalesDashOpenSOData();
  }, [selectedMonthKey]);

  useEffect(() => {
    setOpenSOPage(0);
    getSalesDashOpenSOData(searchSalesDashOpenSO, 0);
  }, [searchSalesDashOpenSO]);

  useEffect(() => {
    setMaterialPage(0);
    getMaterialRequestData(searchMaterialRequest, 0);
  }, [searchMaterialRequest]);

  useEffect(() => {
    setAppointmentPage(0);
    getAppointmentData(searchAppointment, 0);
  }, [searchAppointment]);

  const convertToK = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    return (value / 1000).toFixed(2) + "k";
  };

  return (
    <Box style={{ maxHeight: "100%", padding: 15 }}>
      <div style={{ width: 300, marginBottom: 20, paddingTop: 10 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Controller
            name="SelectedDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="DATE"
                views={["year", "month"]}
                openTo="month"
                value={field.value ? dayjs(field.value) : null}
                onChange={(newValue) => {
                  if (!newValue) {
                    field.onChange(null);
                    return;
                  }

                  const today = dayjs();

                  const updatedDate = newValue.date(today.date());

                  field.onChange(updatedDate.toDate());
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>
      </div>

      {/* {SALES_MANAGER && ( */}
        <>
          <div>
            <Card
              elevation={5}
              style={{
                padding: "9px",
                justifyContent: "center",
                marginBottom: 35,
              }}
            >
              <Typography
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  margin: 3,
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Sales Manager DashBoard
              </Typography>
            </Card>
          </div>

          <Grid container style={{ paddingRight: 0 }} spacing={2}>
            {/* {SALES_MANAGER && SALES_ANALYSIS_PARTS_ONLY_MTD && ( */}
              <Grid item lg={colWidth}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        SALES ANALYSIS PARTS ONLY MTD IN KWD (
                        {Math.round(totalSalesAmount).toLocaleString("en-IN")})
                      </Typography>
                    }
                  />
                  <Divider />
                  <Box pt={2}>
                    <ResponsiveContainer width="100%" height={330}>
                      {loadingSalesAnalysis ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height="330px"
                        >
                          <BeatLoader loading={loadingSalesAnalysis} />
                        </Box>
                      ) : (
                        <BarChart
                          data={SalesAnalysisList}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="DocDate" fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip
                            formatter={(value) =>
                              parseFloat(value).toLocaleString("en-IN", {
                                minimumFractionDigits: 3,
                              })
                            }
                          />
                          <Legend />
                          {SalesAnalysisList?.length === 0 && (
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{ fill: "#666", fontSize: "16px" }}
                            >
                              No data to display
                            </text>
                          )}
                          <Bar dataKey="SaleAmount" fill="#8884D8">
                            <LabelList
                              dataKey="SaleAmount"
                              fontSize={10}
                              position="top"
                              formatter={(value) =>
                                (value / 1000).toFixed(2) + "k"
                              }
                            />
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>
            {/* )} */}

            {/* {SALES_MANAGER && WORKSHOP_REVENUE_MTD_IN_KWD && ( */}
              <Grid item lg={colWidth}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        WORKSHOP REVENUE MTD IN KWD (
                        {Math.round(totalSalesServiceAmount).toLocaleString(
                          "en-IN",
                        )}
                        )
                      </Typography>
                    }
                  />
                  <Divider />
                  <Box pt={2}>
                    <ResponsiveContainer width="100%" height={330}>
                      {loadingSalesService ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height="330px"
                        >
                          <BeatLoader loading={loadingSalesService} />
                        </Box>
                      ) : (
                        <BarChart
                          data={SalesServiceList}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="DocDate" fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip
                            formatter={(value) =>
                              parseFloat(value).toLocaleString("en-IN", {
                                minimumFractionDigits: 3,
                              })
                            }
                          />
                          <Legend />
                          {SalesServiceList?.length === 0 && (
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{ fill: "#666", fontSize: "16px" }}
                            >
                              No data to display
                            </text>
                          )}
                          <Bar dataKey="SaleAmount" fill="#8884D8">
                            <LabelList
                              dataKey="SaleAmount"
                              fontSize={10}
                              position="top"
                              formatter={(value) =>
                                (value / 1000).toFixed(2) + "k"
                              }
                            />
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>
            {/* )} */}

            {/* {SALES_MANAGER && TARGET_VS_ACTUAL_PARTS_12MONTHS && ( */}
              <Grid item lg={6}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        Target vs Actual - parts (12 months)
                      </Typography>
                    }
                  />
                  <Divider />
                  {loadingTargetVSActual ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="330px"
                    >
                      <BeatLoader loading={loadingTargetVSActual} />
                    </Box>
                  ) : (
                    <Box p={2}>
                      <DataGrid
                        rows={TargetVSActualList || []}
                        columns={TargetVSActualTableColumns}
                        getRowId={(row) => row.MonthYear}
                        loading={loadingTargetVSActual}
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                          },
                        }}
                        sx={{ height: 320, ...gridSx }}
                        disableRowSelectionOnClick
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            {/* )} */}

            {/* {SALES_MANAGER && TARGET_VS_ACTUAL_PARTS_12MONTHS && ( */}
              <Grid item lg={6}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        Target vs Actual - parts (12 months)
                      </Typography>
                    }
                  />
                  <Divider />
                  <Box pt={2}>
                    <ResponsiveContainer width="100%" height={330}>
                      {loadingTargetVSActual ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height="330px"
                        >
                          <BeatLoader loading={loadingTargetVSActual} />
                        </Box>
                      ) : (
                        <BarChart
                          data={TargetVSActualList}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="MonthYear" fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip
                            formatter={(value) =>
                              parseFloat(value).toLocaleString("en-IN", {
                                minimumFractionDigits: 3,
                              })
                            }
                          />
                          <Legend />
                          {TargetVSActualList?.length === 0 && (
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{ fill: "#666", fontSize: "16px" }}
                            >
                              No data to display
                            </text>
                          )}
                          <Bar dataKey="TargetSales" fill="#8884D8">
                            <LabelList
                              dataKey="TargetSales"
                              fontSize={10}
                              position="top"
                              formatter={convertToK}
                            />
                          </Bar>
                          <Bar dataKey="ActualSales" fill="#82ca9d">
                            <LabelList
                              dataKey="ActualSales"
                              fontSize={10}
                              position="top"
                              formatter={convertToK}
                            />
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>
            {/* )} */}

            {/* {SALES_MANAGER && SALESMAN_WISE_SALES_MTD && ( */}
              <Grid item lg={6}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        SALESMAN WISE SALES MTD
                      </Typography>
                    }
                  />
                  <Divider />
                  {loadingTopSalesPerson ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="330px"
                    >
                      <BeatLoader loading={loadingTopSalesPerson} />
                    </Box>
                  ) : (
                    <Box p={2}>
                      <DataGrid
                        rows={TopSalesPersonList || []}
                        columns={TopSalesPersonColumns}
                        getRowId={(row) => row.SalesPerson}
                        loading={loadingTopSalesPerson}
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                          },
                        }}
                        sx={{ height: 320, ...gridSx }}
                        disableRowSelectionOnClick
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            {/* )} */}

            {/* {SALES_MANAGER && TOP_20_PRODUCT_MTD && ( */}
              <Grid item lg={6}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        Top 20 product month to date
                      </Typography>
                    }
                  />
                  <Divider />

                  {loadingTopProducts ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="330px"
                    >
                      <BeatLoader loading={loadingTopProducts} />
                    </Box>
                  ) : (
                    <Box p={2}>
                      <DataGrid
                        rows={TopProductsList || []}
                        columns={TopProductsColumns}
                        getRowId={(row) => row.ItemCode}
                        loading={loadingTopProducts}
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                          },
                        }}
                        sx={{ height: 320, ...gridSx }}
                        disableRowSelectionOnClick
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            {/* )} */}

            {/* {SALES_MANAGER && TOP_20_CUSTOMER_MTD_RETAIL && ( */}
              <Grid item lg={6}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        Top 20 Customer month to date (Retail)
                      </Typography>
                    }
                  />
                  <Divider />
                  {loadingTopCustomer ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="330px"
                    >
                      <BeatLoader loading={loadingTopCustomer} />
                    </Box>
                  ) : (
                    <Box p={2}>
                      <DataGrid
                        rows={TopCustomerList || []}
                        columns={TopCustomerColumns}
                        getRowId={(row) => row.CardCode}
                        loading={loadingTopCustomer}
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                          },
                        }}
                        sx={{ height: 320, ...gridSx }}
                        disableRowSelectionOnClick
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            {/* )} */}
          </Grid>
        </>
      {/* )} */}

      {/* {Sales_DashBoard && ( */}
        <>
          <div>
            <Card
              elevation={5}
              style={{
                padding: "9px",
                justifyContent: "center",
                marginBottom: 35,
                marginTop: 20,
              }}
            >
              <Typography
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  margin: 3,
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Sales DashBoard
              </Typography>
            </Card>
          </div>

          <Grid container style={{ paddingRight: 0 }} spacing={2}>
            {/* {Sales_DashBoard && Sales_OPEN_SALES_ORDERS && ( */}
              <Grid item lg={12}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 2 }}
                    title={
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            fontSize: 17,
                            textTransform: "uppercase",
                            textAlign: "left",
                          }}
                        >
                          Open Sales Orders
                        </Typography>

                        <TextField
                          size="small"
                          placeholder="Enter Contact No..."
                          value={searchSalesDashOpenSO}
                          onChange={(e) =>
                            setSearchSalesDashOpenSO(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 250 }}
                        />
                      </Box>
                    }
                  />
                  <Divider />
                  <Box p={2}>
                    {loadingSalesDashOpenSO ? (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="330px"
                      >
                        <BeatLoader loading={loadingSalesDashOpenSO} />
                      </Box>
                    ) : (
                      <DataGrid
                        rows={SalesDashOpenSOList || []}
                        columns={SalesDashOpenSOColumns}
                        getRowId={(row) => row.OrderNo}
                        loading={loadingSalesDashOpenSO}
                        paginationMode="server"
                        rowCount={
                          hasMoreOpenSO
                            ? (openSOPage + 2) * 20
                            : openSOPage * 20 + SalesDashOpenSOList.length
                        }
                        paginationModel={{ page: openSOPage, pageSize: 20 }}
                        onPaginationModelChange={(model) => {
                          setOpenSOPage(model.page);
                          getSalesDashOpenSOData(
                            searchSalesDashOpenSO,
                            model.page,
                          );
                        }}
                        pageSizeOptions={[20]}
                        sx={{ height: 320, ...gridSx }}
                        disableRowSelectionOnClick
                      />
                    )}
                  </Box>
                </Card>
              </Grid>
            {/* )} */}

            {/* {Sales_DashBoard && MONTHLY_SALE && ( */}
              <Grid item lg={12}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        Monthly Sale (
                        {parseFloat(SalesDashTotalMonthsSale)
                          .toFixed(3)
                          .replace(/\d(?=(\d{3})+\.)/g, "$&,")}
                        )
                      </Typography>
                    }
                  />
                  <Divider />
                  <Box pt={2}>
                    <ResponsiveContainer width="100%" height={330}>
                      {SalesDashloadingTotalMonthsSale ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height="330px"
                        >
                          <BeatLoader
                            loading={SalesDashloadingTotalMonthsSale}
                          />
                        </Box>
                      ) : (
                        <BarChart
                          data={listSalesDash}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="SaleDate"
                            fontSize={10}
                            tickFormatter={(date) =>
                              dayjs(date).format("YYYY-MM-DD")
                            }
                          />
                          <YAxis
                            dataKey="SaleAmount"
                            fontSize={10}
                            domain={[0, maxValueSalesDash]}
                            tickCount={10}
                          />
                          <Tooltip
                            formatter={(value) => {
                              if (value === "") return "";
                              return parseFloat(value).toLocaleString("en-IN", {
                                minimumFractionDigits: 3,
                              });
                            }}
                          />
                          <Legend />
                          {listSalesDash?.length === 0 && (
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{ fill: "#666", fontSize: "16px" }}
                            >
                              No data to display
                            </text>
                          )}
                          <Bar
                            dataKey="SaleAmount"
                            fill="#8884D8"
                            minPointSize={5}
                          >
                            <LabelList
                              dataKey="SaleAmount"
                              fontSize={10}
                              position="top"
                              fill="#000"
                              formatter={(value) => {
                                if (value === "") return "";
                                return (value / 1000).toFixed(2) + "k";
                              }}
                            />
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>
            {/* )} */}
          </Grid>
        </>
      {/* )} */}

      {/* {WORKSHOP_DASHBOARD && ( */}
        <>
          <div>
            <Card
              elevation={5}
              style={{
                padding: "9px",
                justifyContent: "center",
                marginBottom: 35,
                marginTop: 20,
              }}
            >
              <Typography
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  margin: 3,
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Workshop DashBoard
              </Typography>
            </Card>
          </div>

          <Grid container style={{ paddingRight: 0 }} spacing={2}>
            {/* {WORKSHOP_DASHBOARD && TODAYS_SCHEDULED_APPOINTMENTS_FOR_INWARD && ( */}
              <Grid item lg={12}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 2 }}
                    title={
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            fontSize: 17,
                            textTransform: "uppercase",
                            textAlign: "left",
                          }}
                        >
                          Today's Scheduled Appointments for Inward
                        </Typography>

                        <TextField
                          size="small"
                          placeholder="Type to Search..."
                          value={searchAppointment}
                          onChange={(e) => setSearchAppointment(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 250 }}
                        />
                      </Box>
                    }
                  />
                  <Divider />
                  <Box p={2}>
                    {loadingAppointment ? (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="330px"
                      >
                        <BeatLoader loading={loadingAppointment} />
                      </Box>
                    ) : (
                      <DataGrid
                        rows={AppointmentList || []}
                        columns={AppointmentTableColumns}
                        getRowId={(row) => row.OrderNo}
                        loading={loadingAppointment}
                        paginationMode="server"
                        rowCount={
                          hasMoreAppointments
                            ? (appointmentPage + 2) * 20
                            : appointmentPage * 20 + AppointmentList.length
                        }
                        paginationModel={{
                          page: appointmentPage,
                          pageSize: 20,
                        }}
                        onPaginationModelChange={(model) => {
                          setAppointmentPage(model.page);
                          getAppointmentData(searchAppointment, model.page);
                        }}
                        pageSizeOptions={[20]}
                        sx={{ height: 320, ...gridSx }}
                        disableRowSelectionOnClick
                      />
                    )}
                  </Box>
                </Card>
              </Grid>
            {/* )} */}

            {/* {WORKSHOP_DASHBOARD && WORKSHOP_REVENUE_MTD_IN_KWD_WORKSHOP && ( */}
              <Grid item lg={12}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 3 }}
                    title={
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: 17,
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        WORKSHOP REVENUE MTD IN KWD (
                        {totalSalesServiceAmount.toLocaleString("en-IN")})
                      </Typography>
                    }
                  />
                  <Divider />
                  <Box pt={2}>
                    <ResponsiveContainer width="100%" height={330}>
                      {loadingAppointment ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height="330px"
                        >
                          <BeatLoader loading={loadingAppointment} />
                        </Box>
                      ) : (
                        <BarChart
                          data={workshopRevenueData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="DocDate" fontSize={10} />
                          <YAxis
                            fontSize={10}
                            domain={[0, workshopRevenueMax || "auto"]}
                          />
                          <Tooltip
                            formatter={(value) =>
                              parseFloat(value).toLocaleString("en-IN", {
                                minimumFractionDigits: 3,
                              })
                            }
                          />
                          <Legend />
                          {workshopRevenueData?.length === 0 && (
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{ fill: "#666", fontSize: "16px" }}
                            >
                              No data to display
                            </text>
                          )}
                          <Bar dataKey="SaleAmount" fill="#8884D8">
                            <LabelList
                              dataKey="SaleAmount"
                              fontSize={10}
                              position="top"
                              formatter={(value) =>
                                (value / 1000).toFixed(2) + "k"
                              }
                            />
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>
            {/* )} */}
          </Grid>
        </>
       {/* )} */}

      {/* {WAREHOUSE_DASHBOARD && ( */}
        <>
          <div>
            <Card
              elevation={5}
              style={{
                padding: "9px",
                justifyContent: "center",
                marginBottom: 35,
                marginTop: 20,
              }}
            >
              <Typography
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  margin: 3,
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                Warehouse DashBoard
              </Typography>
            </Card>
          </div>

          <Grid container style={{ paddingRight: 0 }} spacing={2}>
            {/* {WAREHOUSE_DASHBOARD && MATERIAL_REQUEST_LIST && ( */}
              <Grid item lg={12}>
                <Card elevation={5} style={{ marginBottom: 15, height: 425 }}>
                  <CardHeader
                    sx={{ py: 2 }}
                    title={
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            fontSize: 17,
                            textTransform: "uppercase",
                            textAlign: "left",
                          }}
                        >
                          Material Request List
                        </Typography>

                        <TextField
                          size="small"
                          placeholder="Type to Search..."
                          value={searchMaterialRequest}
                          onChange={(e) =>
                            setSearchMaterialRequest(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 250 }}
                        />
                      </Box>
                    }
                  />
                  <Divider />
                  <Box p={2}>
                    {loadingMaterialRequest ? (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="330px"
                      >
                        <BeatLoader loading={loadingMaterialRequest} />
                      </Box>
                    ) : (
                      <DataGrid
                        rows={MaterialRequestList || []}
                        columns={searchItemColumn}
                        getRowId={(row) => row.OrderNo}
                        loading={loadingMaterialRequest}
                        paginationMode="server"
                        rowCount={
                          hasMoreMaterial
                            ? (materialPage + 2) * 20
                            : materialPage * 20 + MaterialRequestList.length
                        }
                        paginationModel={{ page: materialPage, pageSize: 20 }}
                        onPaginationModelChange={(model) => {
                          setMaterialPage(model.page);
                          getMaterialRequestData(
                            searchMaterialRequest,
                            model.page,
                          );
                        }}
                        pageSizeOptions={[20]}
                        sx={{ height: 320, ...gridSx }}
                        disableRowSelectionOnClick
                      />
                    )}
                  </Box>
                </Card>
              </Grid>
            {/* )} */}
          </Grid>
        </>
      {/* )} */}
    </Box>
  );
}
