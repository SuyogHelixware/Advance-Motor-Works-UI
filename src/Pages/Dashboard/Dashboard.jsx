import AccountCircle from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LightModeIcon from "@mui/icons-material/LightMode";
import MailIcon from "@mui/icons-material/Mail";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ModeNightIcon from "@mui/icons-material/ModeNight";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
// import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloseIcon from "@mui/icons-material/Close";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import WarehouseIcon from "@mui/icons-material/Warehouse";

import {
  Email as EmailIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import MoreIcon from "@mui/icons-material/MoreVert";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import SearchIcon from "@mui/icons-material/Search";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import TocIcon from "@mui/icons-material/Toc";
import { Avatar, Button, Stack, Tab, Tabs, useMediaQuery } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { alpha, styled, useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import DarkLogo from "../../assets/DarkLogo.png";
import Logo from "../../assets/Logo.png";
import LoginPageLoader from "../../Loaders/LoginPageLoader";
import useAuth from "../../Routing/AuthContext";
import { useThemeMode } from "../../Theme/ThemeMode";
import NotificationDrawer from "../Components/Notification";
import "../Dashboard/Dashboard.css";
// import { useCounterPolling } from "../../Hooks/useCounterPolling";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchCounter } from "../../slices/CounterSlice";

const drawerWidth = 230;
const NotificationCard = ({ title, details, date }) => (
  <Box
    sx={{
      padding: 1.5,
      marginBottom: 1.5,
      borderRadius: 2,
      backgroundColor: "#f8f8f8",
      cursor: "pointer",
      boxShadow: 1,
    }}
  >
    <Typography variant="subtitle1" fontWeight={600}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {details}
    </Typography>
    <Typography variant="caption" color="gray">
      {date}
    </Typography>
  </Box>
);
const allRoutes = [
  // ---------------- Dashboard ----------------
  { label: "Home", path: "/dashboard/home" },

  // ---------------- Admin ----------------
  { label: "Admin", path: "/dashboard/admin" },
  { label: "Role Creation", path: "/dashboard/admin/role-masterNew" },
  { label: "Role Mapping", path: "/dashboard/admin/role-master" },
  { label: "User Creation", path: "/dashboard/admin/user-creation" },
  { label: "Company Details", path: "/dashboard/admin/company-details" },
  { label: "EMAIL SETUP", path: "/dashboard/Admin/Emailsetup" },

  // ---------------- Setup ----------------
  { label: "Setup", path: "/dashboard/setup" },
  { label: "Item Group", path: "/dashboard/setup/item-group" },
  {
    label: "BinLocation SubLevel",
    path: "/dashboard/setup/binlocation-sublevel",
  },
  { label: "Landed Cost", path: "/dashboard/setup/Landed-cost-Setup" },
  { label: "State", path: "/dashboard/setup/state" },
  { label: "Country", path: "/dashboard/setup/Country" },
  { label: "Location", path: "/dashboard/setup/Location" },
  { label: "Lenght & Width Setup", path: "/dashboard/setup/LengthAndWidth" },
  { label: "Weight Setup", path: "/dashboard/setup/WeightSetup" },
  { label: "Currencies", path: "/dashboard/setup/Currencies" },
  {
    label: "Business Partner Group",
    path: "/dashboard/setup/BusinessPartnerGroup",
  },
  { label: "Payment Term", path: "/dashboard/setup/payment-term" },
  {
    label: "Credit Card Payment",
    path: "/dashboard/setup/credit-card-payment",
  },
  { label: "Banks", path: "/dashboard/setup/banks" },
  { label: "House Banks", path: "/dashboard/setup/house-banks" },
  { label: "Tax Code", path: "/dashboard/setup/tax-Code" },
  { label: "Tax Category", path: "/dashboard/setup/tax-Category" },
  { label: "Tax Type", path: "/dashboard/setup/tax-Type" },
  { label: "Batch Mgt", path: "/dashboard/setup/batch" },
  { label: "Serial No Mgt", path: "/dashboard/setup/serial" },
  { label: "Freight", path: "/dashboard/setup/freight" },
  { label: "Credit Card", path: "/dashboard/setup/credit-card" },
  {
    label: "Credit Card Payment Method",
    path: "/dashboard/setup/credit-card-paymentmethod",
  },
  { label: "General Setting", path: "/dashboard/setup/general-setting" },
  { label: "User Setup", path: "/dashboard/setup/user-setup" },
  // { label: "Holiday Master", path: "/dashboard/setup/holiday-master" },
  {
    label: "Unit of Measure Group",
    path: "/dashboard/setup/unit-of-measure-group",
  },
  { label: "SAC", path: "/dashboard/setup/SAC" },
  { label: "HSN", path: "/dashboard/setup/HSN" },
  { label: "Shipping Type", path: "/dashboard/setup/ShipType" },
  // { label: "Doc Series", path: "/dashboard/setup/DocSeries" },
  { label: "Document Series", path: "/dashboard/setup/DocumentSeries" },
  { label: "Posting Period", path: "/dashboard/setup/PostingPeriod" },
  { label: "Barcodes", path: "/dashboard/setup/BarCode" },
  { label: "Service Category", path: "/dashboard/setup/ServiceCategory" },
  { label: "Sales Employee", path: "/dashboard/setup/SalesEmp" },
  {
    label: "Reports & Layout Manager",
    path: "/dashboard/setup/ReportAndLayout",
  },
  {
    label: "Approval Stages",
    path: "/dashboard/setup/ApprovalStageAndTemplate",
  },
  { label: "EMAIL TEMPLATE", path: "/dashboard/setup/EmailTemplate" },

  // ---------------- Master ----------------
  { label: "Master", path: "/dashboard/master" },
  { label: "Customer Master", path: "/dashboard/master/customer-master" },
  { label: "Technician Master", path: "/dashboard/master/technician-master" },
  { label: "Vehicle Master", path: "/dashboard/master/vehicle-master" },
  {
    label: "Fitting Charges & Time",
    path: "/dashboard/master/fitting-charges-time",
  },
  { label: "Sales Target", path: "/dashboard/master/salesTarget" },
  {
    label: "Supplier Sales Target",
    path: "/dashboard/master/supplier-sale-target",
  },
  {
    label: "Document Number",
    path: "/dashboard/master/generate-transaction-number",
  },
  { label: "Item Master", path: "/dashboard/master/item-master" },
  { label: "Jack Master", path: "/dashboard/master/jack-master" },
  { label: "Jack Master 1", path: "/dashboard/master/jack-master1" },
  { label: "QC Master", path: "/dashboard/master/qc-master" },
  { label: "Country Master", path: "/dashboard/master/country-master" },
  { label: "Tax Master", path: "/dashboard/master/tax-master" },
  { label: "Currency Master", path: "/dashboard/master/currency-master" },
  { label: "Currency Exchange", path: "/dashboard/master/currency-exchange" },
  { label: "UOM Master", path: "/dashboard/master/uom-master" },
  { label: "UOM Conversion", path: "/dashboard/master/uom-conversion" },
  { label: "Business Partner", path: "/dashboard/master/business-partner" },
  {
    label: "BinLocation Master",
    path: "/dashboard/master/bin-location-master",
  },
  { label: "Warehouse Master", path: "/dashboard/master/werehouse-master" },

  // ---------------- Banking ----------------
  { label: "Banking", path: "/dashboard/banking" },
  { label: "Incoming Payment", path: "/dashboard/banking/incoming-payment" },
  { label: "Outgoing Payment", path: "/dashboard/banking/outgoing-payment" },

  // ---------------- HR ----------------
  { label: "HR", path: "/dashboard/HR" },
  { label: "Employee Master", path: "/dashboard/HR/EmployeeMaster" },

  // ---------------- VMS ----------------
  { label: "VMS", path: "/dashboard/VMS" },
  { label: "Vehicle Model", path: "/dashboard/VMS/VehicleModel" },
  { label: "Vehicle Make", path: "/dashboard/VMS/VehicleMake" },
  { label: "Driver Details", path: "/dashboard/VMS/VehicleDriver" },
  { label: "Maintenance Check List", path: "/dashboard/VMS/MaintenanceCL" },
  { label: "Fuel Tracking", path: "/dashboard/VMS/FuelTracking" },
  { label: "Vehicle Master", path: "/dashboard/VMS/VehicleMaster" },
  { label: "Vehicle Maintenance", path: "/dashboard/VMS/VehicleMaintenance" },

  // ---------------- Inventory ----------------
  { label: "Inventory", path: "/dashboard/inventory" },
  { label: "Good Issue", path: "/dashboard/inventory/goods-issue" },
  { label: "Goods Receipt", path: "/dashboard/inventory/goods-receipt" },
  {
    label: "Inventory Transfer",
    path: "/dashboard/inventory/inventory-transfer",
  },
  {
    label: "Inventory Opening Balance",
    path: "/dashboard/inventory/inventory-opening-balance",
  },
  { label: "PriceList", path: "/dashboard/inventory/inventory-price-list" },
  {
    label: "Inventory Revaluation",
    path: "/dashboard/inventory/inventory-revaluation",
  },
  { label: "Stock Counting", path: "/dashboard/inventory/stock-counting" },
  { label: "Stock Posting", path: "/dashboard/inventory/stock-posting" },

  // ---------------- AP Purchase ----------------
  { label: "AP Purchase", path: "/dashboard/Purchase" },
  {
    label: "Purchase Quotation",
    path: "/dashboard/Purchase/purchase-quotation",
  },
  {
    label: "Purchase Quotation RFQ",
    path: "/dashboard/Purchase/purchase-quotation-rfq",
  },
  { label: "Purchase Order", path: "/dashboard/Purchase/purchase-order" },
  { label: "Purchase Request", path: "/dashboard/Purchase/purchase-request" },
  { label: "Goods Receipt PO", path: "/dashboard/Purchase/goods-receipt-note" },
  { label: "Purchase Landed Cost", path: "/dashboard/Purchase/landed-cost" },
  { label: "Procurement ETA", path: "/dashboard/Purchase/procurement-eta" },
  {
    label: "Purchase Credit Note",
    path: "/dashboard/Purchase/purchase-credit-note",
  },
  { label: "Purchase Invoice", path: "/dashboard/Purchase/purchase-invoice" },
  { label: "Goods Return", path: "/dashboard/Purchase/purchase-goodsReturn" },
  {
    label: "Purchase Invoice",
    path: "/dashboard/Purchase/APDown-Payment-Invoice",
  },
  {
    label: "Quotation Comparison",
    path: "/dashboard/Purchase/purchase-comparison",
  },

  // ---------------- Sales ----------------
  { label: "Sales", path: "/dashboard/Sales" },
  { label: "Sales Quotation", path: "/dashboard/Sales/sales-quotation" },
  {
    label: "Sales Quotation RFQ",
    path: "/dashboard/Sales/sales-quotation-rfq",
  },
  { label: "Sales Order", path: "/dashboard/Sales/sales-order" },
  { label: "Sales Delivery", path: "/dashboard/Sales/sales-delivery" },
  { label: "Sales Return", path: "/dashboard/Sales/sales-return" },
  { label: "Sales Down Payment", path: "/dashboard/Sales/sales-down-payment" },
  { label: "Sales Invoice", path: "/dashboard/Sales/sales-invoice" },
  { label: "Sales Credit Note", path: "/dashboard/Sales/sales-credit-note" },

  // ---------------- Finance ----------------
  { label: "Finance", path: "/dashboard/Finance" },
  { label: "Chart Of Accounts", path: "/dashboard/Finance/ChartOfAccount" },
  { label: "Journal Entry", path: "/dashboard/Finance/JournalEntry" },
  {
    label: "G/L Account Determination",
    path: "/dashboard/Finance/GLAcctDetermination",
  },
  {
    label: "Exchange Rates and Indexes",
    path: "/dashboard/Finance/ExchangeRatesAndIndexes",
  },
  {
    label: "G/L Account Opening Balance",
    path: "/dashboard/Finance/GLOpeningBalance",
  },
  { label: "BP Opening Balance", path: "/dashboard/Finance/BPOpeningBalance" },

  // ---------------- Production ----------------
  { label: "Production", path: "/dashboard/Production" },
  { label: "Bill Of Material", path: "/dashboard/Production/BillOfMaterial" },
  {
    label: "Issue for Production",
    path: "/dashboard/Production/IssueForProduction",
  },
  { label: "Production Order", path: "/dashboard/Production/ProductionOrder" },
  { label: "Custom Reports", path: "/dashboard/Reports/PreviewReport" },
  {
    label: "Custom Reports Generator",
    path: "/dashboard/Reports/QueryGenerator",
  },

  {
    label: "Receipt for Production",
    path: "/dashboard/Production/ReceiptForProduction",
  },
];

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  height: "100vh", // 👈 ADD THIS
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  height: "100vh", // 👈 ADD THIS
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function Dashboard({ logout }) {
  const handleLogout = () => {
    logout();
    setThemeStatus(true);
    LightMode();
  };
  const { LightMode, DarkMode } = useThemeMode();

  // const lastFetchedAt = useSelector(
  //   (state) => state.counter.lastFetchedAt
  // );

  // if (!lastFetchedAt || Date.now() - lastFetchedAt > 120000) {
  //   dispatch(fetchCounter());
  // }
  // const { themeMode, LightMode, DarkMode } = useThemeMode();
  // console.log(themeMode);
  // const [companyName, setCompanyName] = React.useState('');

  const theme = useTheme();
  const { user, companyData } = useAuth();
  const [open, setOpen] = React.useState(true);
  const [themestatus, setThemeStatus] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const allowedParentIds = user.ParentMenus;
  const [openNotifDrawer, setOpenNotifDrawer] = React.useState(false);
  const [tab, setTab] = React.useState(0);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [results, setResults] = React.useState([]);
  //  let dispatch=useDispatch()
  const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
  };

  const getAccessibleMenus = (user) => {
    if (!user?.SubMenus) return [];

    const allMenus = user.SubMenus.flatMap((sub) =>
      sub.Menus.filter((m) => m.IsRead).map((m) => ({
        MenuId: m.MenuId,
        MenuName: m.MenuName?.trim(),
      })),
    );

    // Deduplicate by MenuName
    return allMenus.filter(
      (menu, index, arr) =>
        arr.findIndex((m) => m.MenuName === menu.MenuName) === index,
    );
  };

  // const accessibleIds = React.useMemo(() => getAccessibleMenuIds(user), [user]);
  React.useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const accessibleMenus = getAccessibleMenus(user);

    // Filter menus by search term
    const filteredMenus = accessibleMenus.filter((menu) =>
      menu.MenuName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Match each menu with its route
    const menuWithRoutes = filteredMenus
      .map((menu) => {
        const foundRoute = allRoutes.find(
          (r) => r.label.toLowerCase() === menu.MenuName.toLowerCase(),
        );

        return foundRoute
          ? { label: menu.MenuName, path: foundRoute.path }
          : null;
      })
      .filter(Boolean); // remove nulls

    // NEW: Deduplicate by label (keeps the first occurrence of each unique label)
    const uniqueResults = menuWithRoutes.filter(
      (item, index, arr) =>
        arr.findIndex((i) => i.label === item.label) === index,
    );

    setResults(uniqueResults); // Use uniqueResults instead of menuWithRoutes
  }, [searchTerm, allRoutes]);

  const toggleNotifDrawer = (open) => () => {
    setOpenNotifDrawer(open);
  };
  const openDrawer = () => setOpenNotifDrawer(true);
  const closeDrawer = () => setOpenNotifDrawer(false);

  React.useEffect(() => {
    const CurrentTheme = localStorage.getItem("Theme");
    if (CurrentTheme === "dark") {
      setThemeStatus(false);
      DarkMode();
    } else {
      setThemeStatus(true);
      LightMode();
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [DarkMode, LightMode]);
  // React.useEffect(() => {
  //   if (!loading) {
  //     if (!companyData || !Array.isArray(companyData.values) || companyData.values.length === 0) {
  //       navigate("/dashboard/setup/company-details");
  //     }
  //   }
  // }, [companyData, loading, navigate]);

  // React.useEffect(() => {
  //   // Redirect to company details form if no company data is available
  //   if (!companyData || (Array.isArray(companyData) && companyData.length === 0)) {
  //     navigate("/dashboard/setup/company-details");
  //   }
  // }, [companyData, navigate]);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const themechange = () => {
    if (themestatus) {
      localStorage.setItem("Theme", "dark");
      DarkMode();
      setThemeStatus(false);
    } else {
      localStorage.setItem("Theme", "light");
      LightMode();
      setThemeStatus(true);
    }
  };
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = "primary-search-account-menu";
  const hasValue = (v) =>
    v !== null && v !== undefined && String(v).trim() !== "";

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <Box sx={{ width: 320, p: 3, textAlign: "center", mx: 1 }}>
        <Avatar
          alt="Avatar"
          sx={{
            width: 90,
            height: 90,
            margin: "auto",
            mb: 2,
            border: "3px solid",
            borderColor: "primary.main",
          }}
        />

        {/* Username */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          mb={1}
        >
          <PersonIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight="bold">
            {user.UserName}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Email — only show if exists */}
        {hasValue(user.Email) && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            mb={1}
          >
            <EmailIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {user.Email}
            </Typography>
          </Stack>
        )}

        {/* Phone — only show if exists */}
        {hasValue(user.PhoneNumber) && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            mb={2}
          >
            <PhoneIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {user.PhoneNumber}
            </Typography>
          </Stack>
        )}

        <Button
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          color="primary"
          variant="contained"
          sx={{ mt: 2, borderRadius: 2, px: 4 }}
        >
          Log Out
        </Button>
      </Box>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {/* Theme Toggle */}
      <MenuItem onClick={themechange}>
        <IconButton size="large" aria-label="toggle theme" color="inherit">
          {themestatus ? <LightModeIcon /> : <ModeNightIcon />}
        </IconButton>
        {!isMobile && <p>Theme</p>} {/* Hide text on mobile */}
      </MenuItem>

      {/* Messages */}
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        {!isMobile && <p>Messages</p>} {/* Hide text on mobile */}
      </MenuItem>

      {/* Notifications */}

      {/* Profile */}
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        {!isMobile && <p>Profile</p>} {/* Hide text on mobile */}
      </MenuItem>
    </Menu>
  );
  const companyName = companyData?.companyName || "No Company Name Available";

  return (
    <>
      <Drawer
        anchor="right"
        open={openNotifDrawer}
        onClose={toggleNotifDrawer(false)}
        PaperProps={{
          sx: {
            width: 380,
            padding: 2,
            backgroundColor: "#fff",
            zIndex: 9999, // 👈 FIX: make drawer appear above navbar + left drawer
            position: "fixed",
          },
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="Unread" />
            <Tab label="All" />
            <Tab label="Sent Messages" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {tab === 0 && (
          <Box sx={{ mt: 2 }}>
            {/* Unread Notifications */}
            <NotificationCard
              title="Approval Rejected"
              details="Discount approval rejected at Level 1"
              date="11/08/2025"
            />
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ mt: 2 }}>
            {/* All Notifications */}
            <NotificationCard
              title="Task Assigned"
              details="You have been assigned a new task."
              date="10/21/2025"
            />
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ mt: 2 }}>
            {/* Sent Messages */}
            <NotificationCard
              title="Message Sent"
              details="You sent a message to approval team."
              date="11/07/2025"
            />
          </Box>
        )}
      </Drawer>

      {loading ? (
        <LoginPageLoader />
      ) : (
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="fixed" open={open}>
            <Toolbar
              sx={{
                // width: "100vw",
                boxShadow: "0px 5px 7px rgba(0, 0, 0, 0.1)",
                elevation: 4,
                display: "flex",
                backgroundColor: (theme) =>
                  theme.palette.DrawerCustom.Drawercolor,
              }}
            >
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                sx={{ mr: 2, marginRight: 5, ...(open && { display: "none" }) }}
              >
                <MenuIcon />
              </IconButton>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>

                <div style={{ position: "relative", width: "100%" }}>
                  <StyledInputBase
                    value={searchTerm}
                    placeholder="Search…"
                    inputProps={{ "aria-label": "search" }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "100%", paddingRight: "30px" }} // space for close icon
                  />

                  {/* Close Icon inside StyledInputBase */}
                  {searchTerm.length > 0 && (
                    <CloseIcon
                      onClick={() => setSearchTerm("")}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "20px",
                        cursor: "pointer",
                        // color: "#555",
                      }}
                    />
                  )}
                </div>
              </Search>

              {searchTerm.length > 0 && (
                <ul
                  className="search-list"
                  style={{
                    position: "absolute",
                    top: "60px",
                    width: "300px",
                    background: "#F5F6FA",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    borderRadius: "8px",
                    padding: "10px",
                    zIndex: 1000,
                    listStyle: "none",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {/* If no results */}
                  {results.length === 0 ? (
                    <li
                      style={{
                        padding: "10px",
                        color: "gray",
                        textAlign: "center",
                      }}
                    >
                      No record found
                    </li>
                  ) : (
                    results.map((item) => (
                      <li
                        key={item.path}
                        onClick={() => {
                          handleNavigate(item.path);
                          setSearchTerm("");
                        }}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          color: "black",
                        }}
                      >
                        {item.label}
                      </li>
                    ))
                  )}
                </ul>
              )}

              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {companyName}
              </Typography>

              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                <IconButton
                  size="large"
                  aria-label="show 4 new mails"
                  color="inherit"
                  onClick={themechange}
                >
                  {themestatus ? <LightModeIcon /> : <ModeNightIcon />}
                </IconButton>
                <IconButton
                  size="large"
                  aria-label="show 17 new notifications"
                  color="inherit"
                  onClick={openDrawer}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Box>
              <Box sx={{ display: { xs: "flex", md: "none" } }}>
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                >
                  <MoreIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          {renderMobileMenu}
          {renderMenu}
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              "& .MuiDrawer-paper": {
                backgroundColor: (theme) =>
                  theme.palette.DrawerCustom.Drawercolor,
                padding: "16px",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
              },
            }}
            PaperProps={{ elevation: 3 }}
          >
            <DrawerHeader>
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                {companyData?.Logo1 && (
                  <img
                    src={`data:image/png;base64,${companyData.Logo1}`}
                    height={70}
                    width={150}
                    alt=""
                    style={{
                      objectFit: "contain",
                    }}
                  />
                )}
              </Box>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === "rtl" ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )}
              </IconButton>
            </DrawerHeader>
            <Divider />{" "}
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <List>
                <Link
                  to="home"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.primary,
                  }}
                >
                  <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      sx={{
                        height: 30,
                        justifyContent: open ? "initial" : "center",
                        px: 0.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        <DashboardIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={"DASHBOARD"}
                        sx={{ opacity: open ? 1 : 0, color: "black" }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              </List>

              {allowedParentIds.includes(13) ? (
                <>
                  <List>
                    <Link
                      to="HR"
                      style={{
                        textDecoration: "none",
                        color: theme.palette.text.primary,
                        display: allowedParentIds.includes(2) ? "" : "none",
                      }}
                    >
                      <ListItem disablePadding sx={{ display: "block" }}>
                        <ListItemButton
                          sx={{
                            height: 30,
                            justifyContent: open ? "initial" : "center",
                            px: 0.5,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 3 : "auto",
                              justifyContent: "center",
                            }}
                          >
                            <PeopleAltOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={"HR"}
                            sx={{ opacity: open ? 1 : 0, color: "black" }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </Link>
                  </List>
                </>
              ) : (
                ""
              )}
              {allowedParentIds.includes(2) ? (
                <>
                  <List>
                    <Link
                      to="admin"
                      style={{
                        textDecoration: "none",
                        color: theme.palette.text.primary,
                        display: allowedParentIds.includes(2) ? "" : "none",
                      }}
                    >
                      <ListItem disablePadding sx={{ display: "block" }}>
                        <ListItemButton
                          sx={{
                            height: 30,
                            justifyContent: open ? "initial" : "center",
                            px: 0.5,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 3 : "auto",
                              justifyContent: "center",
                            }}
                          >
                            <ManageAccountsOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={"ADMIN"}
                            sx={{ opacity: open ? 1 : 0, color: "black" }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </Link>
                  </List>
                </>
              ) : (
                ""
              )}
              {allowedParentIds.includes(3) ? (
                <>
                  {" "}
                  <List>
                    <Link
                      to="setup"
                      style={{
                        textDecoration: "none",
                        color: theme.palette.text.primary,
                        display: allowedParentIds.includes(3) ? "" : "none",
                      }}
                    >
                      <ListItem disablePadding sx={{ display: "block" }}>
                        <ListItemButton
                          sx={{
                            height: 30,
                            justifyContent: open ? "initial" : "center",
                            px: 0.5,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 3 : "auto",
                              justifyContent: "center",
                            }}
                          >
                            <SettingsSuggestIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={"SETUP"}
                            sx={{ opacity: open ? 1 : 0, color: "black" }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </Link>
                  </List>
                </>
              ) : (
                ""
              )}

              {allowedParentIds.includes(4) ? (
                <List>
                  <Link
                    to="Master"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                      display: allowedParentIds.includes(4) ? "" : "none",
                    }}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <StorageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"MASTER"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )}
              {allowedParentIds.includes(9) ? (
                <List>
                  <Link
                    to="Purchase"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                      display: allowedParentIds.includes(9) ? "" : "none",
                    }}
                    // onClick={()=>dispatch(fetchCounter())}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <TocIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"PURCHASE"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )}
              {allowedParentIds.includes(8) ? (
                <List>
                  <Link
                    to="Sales"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                    }}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <ProductionQuantityLimitsIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"SALES"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )}
              {/* {allowedParentIds.includes(5) ? (
                <List>
                  <Link
                    to="banking"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                      display: allowedParentIds.includes(5) ? "" : "none",
                    }}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <AssuredWorkloadIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"BANKING"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )} */}
              {allowedParentIds.includes(6) ? (
                <List>
                  <Link
                    to="inventory"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                      display: allowedParentIds.includes(6) ? "" : "none",
                    }}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <InventoryIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"INVENTORY"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )}

              {/* {allowedParentIds.includes(7) ? (
                <List>
                  <Link
                    to="Production"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                      display: allowedParentIds.includes(7) ? "" : "none",
                    }}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <PrecisionManufacturingIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"PRODUCTION"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )} */}

              {/* {allowedParentIds.includes(11) ? (
                <List>
                  <Link
                    to="Finance"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                    }}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <AccountBalanceWalletIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"FINANCE"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )} */}
              {/* ------------------------- */}

              <List>
                <Link
                  to="workshop"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.primary,
                  }}
                >
                  <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      sx={{
                        height: 30,
                        justifyContent: open ? "initial" : "center",
                        px: 0.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        <HandymanOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={"WORKSHOP"}
                        sx={{ opacity: open ? 1 : 0, color: "black" }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              </List>

              {/* {allowedParentIds.includes(10) ? (
                <List>
                  <Link
                    to="VMS"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                      display: allowedParentIds.includes(10) ? "" : "none",
                    }}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <RvHookupIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"VMS"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )} */}

              <List>
                <Link
                  to="warehouse"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.text.primary,
                    display: allowedParentIds.includes(13) ? "" : "none",
                  }}
                >
                  <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      sx={{
                        height: 30,
                        justifyContent: open ? "initial" : "center",
                        px: 0.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        <WarehouseIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={"WAREHOUSE"}
                        sx={{ opacity: open ? 1 : 0, color: "black" }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Link>
              </List>
              {allowedParentIds.includes(12) ? (
                <List>
                  <Link
                    to="Reports"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.primary,
                      display: allowedParentIds.includes(12) ? "" : "none",
                    }}
                  >
                    <ListItem disablePadding sx={{ display: "block" }}>
                      <ListItemButton
                        sx={{
                          height: 30,
                          justifyContent: open ? "initial" : "center",
                          px: 0.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : "auto",
                            justifyContent: "center",
                          }}
                        >
                          <PrintOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={"REPORTS"}
                          sx={{ opacity: open ? 1 : 0, color: "black" }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                </List>
              ) : (
                ""
              )}

              {/* <List>
              <Link
                to="SAPReports"
                style={{
                  textDecoration: "none",
                  color: theme.palette.text.primary,
                }}
              >
                <ListItem disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    sx={{
                      height: 30,
                      justifyContent: open ? "initial" : "center",
                      px: 0.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      <InboxIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={"SAP B1 REPORTS"}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            </List> */}
            </Box>
            {/* Fixed Footer */}
            <Box
              sx={{
                mt: "auto",
                pb: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                opacity: open ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#fff" : "black",
                  fontSize: "12px",
                }}
              >
                Powered by
              </Typography>
              <img
                src={theme.palette.mode === "dark" ? DarkLogo : Logo}
                alt="App Logo"
                height={30}
                style={{ objectFit: "contain" }}
              />
            </Box>
          </Drawer>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 1,
              ...(open && { width: `calc(100% - ${drawerWidth}px)` }),

              ...(!open && {
                width: theme.spacing(7),
                [theme.breakpoints.up("sm")]: {
                  width: theme.spacing(9),
                },
              }),
            }}
          >
            <DrawerHeader />
            <Outlet />
          </Box>
          <NotificationDrawer
            open={openNotifDrawer}
            onClose={closeDrawer}
            setUnreadCount={setUnreadCount}
          />
        </Box>
      )}
    </>
  );
}
