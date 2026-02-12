import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import APPurchese from "../Pages/APPurchese/APPurchese.jsx";
import GoodsReceiptNote from "../Pages/APPurchese/GoodsReceiptNote.jsx";
import LandedCost from "../Pages/APPurchese/LandedCost.jsx";
import ProcurementETA from "../Pages/APPurchese/ProcurementETA.jsx";
import PurchaseCreditNote from "../Pages/APPurchese/PurchaseCreditNote.jsx";
import PurchaseInvoice from "../Pages/APPurchese/PurchaseInvoice.jsx";
import PurchaseOrder from "../Pages/APPurchese/PurchaseOrder .jsx";
import PurchaseQuotation from "../Pages/APPurchese/PurchaseQuotation.jsx";
import PurchaseQuotationRFQ from "../Pages/APPurchese/PurchaseQuotationRFQ.jsx";

import ARSales from "../Pages/AR_Sales/ARSales.jsx";
import AdditionalPayment from "../Pages/AR_Sales/AdditionalPayment.jsx";
import BookingAppointment from "../Pages/AR_Sales/BookingAppointment.jsx";
import CashInvoice from "../Pages/AR_Sales/CashInvoice.jsx";
import CustomerSalesHistory from "../Pages/AR_Sales/CustomerSalesHistory.jsx";
import DynamicSearch from "../Pages/AR_Sales/DynamicSearch";
import MaterialRequest from "../Pages/AR_Sales/MaterialRequest.jsx";
import OrderCancellation from "../Pages/AR_Sales/OrderCancellation.jsx";
import QuatationSO from "../Pages/AR_Sales/QuatationSO";
import Admin from "../Pages/Admin/Admin";
import IntegrationDetails from "../Pages/Admin/IntegrationDetails";
import IntergrationErrorLog from "../Pages/Admin/IntergrationErrorLog";
import RoleCreation from "../Pages/Admin/RoleMasterNew.jsx";
import RoleMaster from "../Pages/Admin/RoleMaster";
import UserCreation from "../Pages/Admin/UserCreation";
import Dashboard from "../Pages/Dashboard/Dashboard";
import Home from "../Pages/Dashboard/Home";
// import BinLocationSetup from "../Pages/Master/BinLocationSetup.jsx";
import Login from "../Login/Login.jsx";
import APDownPaymentInvoice from "../Pages/APPurchese/APDownPaymentInvoice.jsx";
import PurchaseComparison from "../Pages/APPurchese/PurchaseComparison.jsx";
import PurchaseGoodReturn from "../Pages/APPurchese/PurchaseGoodReturn.jsx";
import PurchaseRequest from "../Pages/APPurchese/PurchaseRequest.jsx";
import Banking from "../Pages/Banking/Banking.jsx";
import IncomingPayment from "../Pages/Banking/IncomingPayment.jsx";
import OutgoingPayments from "../Pages/Banking/OutgoingPayments.jsx";
import GoodsIssue from "../Pages/Inventory/GoodsIssue.jsx";
import GoodsReceipt from "../Pages/Inventory/GoodsReceipt.jsx";
import Inventory from "../Pages/Inventory/Inventory.jsx";
import InventoryOpeningBalance from "../Pages/Inventory/InventoryOpeningBalance.jsx";
import InventoryPriceList from "../Pages/Inventory/InventoryPriceList.jsx";
import InventoryRevaluation from "../Pages/Inventory/InventoryRevaluation.jsx";
import InventoryTransfer from "../Pages/Inventory/InventoryTransfer.jsx";
import StockCounting from "../Pages/Inventory/StockCounting.jsx";
import StockPosting from "../Pages/Inventory/StockPosting.jsx";
import BinLocationMaster from "../Pages/Master/BinLocationMaster.jsx";
import BusinessPartner from "../Pages/Master/BusinessPartner.jsx";
import CountryMaster from "../Pages/Master/CountryMaster";
import CurrencyExchange from "../Pages/Master/CurrencyExchange.jsx";
import CurrencyMaster from "../Pages/Master/CurrencyMaster.jsx";
import CustomerMaster from "../Pages/Master/CustomerMaster";
import DocumentNumber from "../Pages/Master/DocumentNumber";
// import VehicleMaster from "../Pages/Master/JackMaster";
import VehicleMaster from "../Pages/VMS/VehicleMaster.jsx";
import FittingChargeAndTime from "../Pages/Master/FittingChargeAndTime";
import ItemImageMapping from "../Pages/Master/ItemMaster.jsx";
import JackMaster from "../Pages/Master/JackMaster";
import JackMaster1 from "../Pages/Master/JackMaster1.jsx";
import Master from "../Pages/Master/Master";
import QcMaster from "../Pages/Master/QcMaster";
import SalesTarget from "../Pages/Master/SalesTarget";
import SupplierSalesTarget from "../Pages/Master/SupplierSalesTarget";
import TaxMaster from "../Pages/Master/TaxMaster";
import TechnicianMaster from "../Pages/Master/TechnicianMaster";
import UoMConversion from "../Pages/Master/UoMConversion.jsx";
import UoMMaster from "../Pages/Master/UoMMaster.jsx";
import VMS from "../Pages/VMS/VMS.jsx";
import VehicleModel from "../Pages/VMS/VehicleModel.jsx";
import VehicleMake from "../Pages/VMS/VehicleMake.jsx";
import VehicleDriver from "../Pages/VMS/VehicleDriver.jsx";
import FuelTracking from "../Pages/VMS/FuelTracking.jsx";
import MaintenanceCL from "../Pages/VMS/MaintenanceCL.jsx";
import WerehouseMaster from "../Pages/Master/WerehouseMaster.jsx";
import BillOfMaterial from "../Pages/Production/BillOfMaterial.jsx";
import IssueForProduction from "../Pages/Production/IssueForProduction.jsx";
import Production from "../Pages/Production/Production.jsx";
import ProductionOrder from "../Pages/Production/ProductionOrder.jsx";
import ReceiptForProduction from "../Pages/Production/ReceiptForProduction.jsx";
import BDMSalesReport from "../Pages/Reports/BDMSalesReport";
import CustomerFeedbackReport from "../Pages/Reports/CustomerFeedbackReport.jsx";
import DailyAppointmentSheet from "../Pages/Reports/DailyAppointmentSheet.jsx";
import DailyCollection from "../Pages/Reports/DailyCollection";
import DailyInwardSheet from "../Pages/Reports/DailyInwardSheet.jsx";
import OpenQuotationSheet from "../Pages/Reports/OpenQuotationSheet.jsx";
import OpenQuotationSummary from "../Pages/Reports/OpenQuotationSummary.jsx";
import OpenSoBySalesman from "../Pages/Reports/OpenSoBySalesman.jsx";
import OpenSoDpSummary from "../Pages/Reports/OpenSoDpSummary.jsx";
import OpenSoUpdateReport from "../Pages/Reports/OpenSoUpdateReport.jsx";
import ReplenishmentReport from "../Pages/Reports/ReplenishmentReport.jsx";
import Reports from "../Pages/Reports/Reports";
import SalesAnalysisByItemReport from "../Pages/Reports/SalesAnalysisByItemReport.jsx";
import SalesmanReport from "../Pages/Reports/SalesmanReport.jsx";
import VehicleOutwardSheetReport from "../Pages/Reports/VehicleOutwardSheetReport.jsx";
import WMSDeliveryReport from "../Pages/Reports/WMSDeliveryReport.jsx";
import SAPBDMSalesReport from "../Pages/SAPReports/SAPBDMSalesReport.jsx";
import SAPCustomerSalesHistory from "../Pages/SAPReports/SAPCustomerSalesHistory.jsx";
import SAPB1Reports from "../Pages/SAPReports/SAPReports.jsx";
import SalesAnalysisByItem from "../Pages/SAPReports/SalesAnalysisByItem.jsx";
import Sales from "../Pages/Sales/Sales.jsx";
import SalesCreditNote from "../Pages/Sales/SalesCreditNote.jsx";
import SalesDelivery from "../Pages/Sales/SalesDelivery.jsx";
import SalesDownPayment from "../Pages/Sales/SalesDownPayment.jsx";
import SalesInvoice from "../Pages/Sales/SalesInvoice.jsx";
import SalesOrder from "../Pages/Sales/SalesOrder.jsx";
import SalesQuotation from "../Pages/Sales/SalesQuotation.jsx";
import SalesReturn from "../Pages/Sales/SalesReturn.jsx";
import BPOpeningBalance from "../Pages/Finance/BPOpeningBalance.jsx";
import Banks from "../Pages/Setup/Banks.jsx";
import Batch from "../Pages/Setup/Batch.jsx";
import BinLocationSubLevel from "../Pages/Setup/BinLocationSubLevel.jsx";
import CompanyDetails from "../Pages/Admin/CompanyDetails.jsx";
import CreditCard from "../Pages/Setup/CreditCard.jsx";
import CreditCardPayment from "../Pages/Setup/CreditCardPayment.jsx";
import CreditCardPaymentMethod from "../Pages/Setup/CreditCardPaymentMethod.jsx";
import Currencies from "../Pages/Setup/Currencies.jsx";
import BusinessPartnerGroup from "../Pages/Setup/BusinessPartnerGroup.jsx";
import Freight from "../Pages/Setup/Freight.jsx";
import GeneralSetting from "../Pages/Setup/GeneralSetting.jsx";
import HSN from "../Pages/Setup/HSN.jsx";
import HolidayMaster from "../Pages/Setup/HolidayMaster.jsx";
import HouseBanks from "../Pages/Setup/HouseBanks.jsx";
import ItemGroup from "../Pages/Setup/ItemGroup.jsx";
import LandedCostSetup from "../Pages/Setup/LandedCostSetup.jsx";
import PaymentTerm from "../Pages/Setup/PaymentTerm.jsx";
import SAC from "../Pages/Setup/SAC.jsx";
import Serial from "../Pages/Setup/Serial.jsx";
import Setup from "../Pages/Setup/Setup.jsx";
import ShipType from "../Pages/Setup/ShipType.jsx";
import TaxCategory from "../Pages/Setup/TaxCategory.jsx";
import TaxCode from "../Pages/Setup/TaxCode.jsx";
import TaxType from "../Pages/Setup/TaxType.jsx";
import UnitOfMeasureGroup from "../Pages/Setup/UnitOfMeasureGroup.jsx";
import UserSetup from "../Pages/Setup/UserSetup.jsx";
import BarCode from "../Pages/Setup/BarCode.jsx";
import IssueMaterial from "../Pages/Warehouse/IssueMaterial.jsx";
import MaterialReturn from "../Pages/Warehouse/MaterialReturn.jsx";
import WareHouse from "../Pages/Warehouse/WareHouse.jsx";
import AppointmentScreen from "../Pages/Workshop/AppointmentScreen.jsx";
import InwardVehicle from "../Pages/Workshop/InwardVehicle.jsx";
import JobCardEntry from "../Pages/Workshop/JobCardEntry.jsx";
import OutwardVehicle from "../Pages/Workshop/OutwardVehicle.jsx";
import WorkShop from "../Pages/Workshop/WorkShop.jsx";
import useAuth from "./AuthContext.jsx";
import RoleMasterNew from "../Pages/Admin/RoleMasterNew.jsx";
import State from "../Pages/Setup/State.jsx";
import DocSeries from "../Pages/Setup/DocSeries.jsx";
import ServiceCategory from "../Pages/Setup/ServiceCategory.jsx";
import Country from "../Pages/Setup/Country.jsx";
import Location from "../Pages/Setup/Location.jsx";
import LengthWidth from "../Pages/Setup/LengthAndWidth.jsx";
import WeightSetup from "../Pages/Setup/WeightSetup.jsx";
import SalesEmp from "../Pages/Setup/SalesEmp.jsx";
import PostingPeroid from "../Pages/Setup/PostingPeroid.jsx";
import DocumentSeries from "../Pages/Setup/DocumentSeries.jsx";
import Swal from "sweetalert2";

import { Box, Typography } from "@mui/material";
import { BeatLoader } from "react-spinners";
import VehicleMaintenance from "../Pages/VMS/VehicleMaintenance.jsx";
import JournalEntry from "../Pages/Finance/JournalEntry.jsx";
import Finance from "../Pages/Finance/Finance.jsx";
import ChartOfAccount from "../Pages/Finance/ChartOfAccount.jsx";
import GLAcctDetermination from "../Pages/Finance/GLAcctDetermination.jsx";
import ExchangeRatesAndIndexes from "../Pages/Finance/ExchangeRate.jsx";
import ApprovalStageAndTemplate from "../Pages/Setup/ApprovalStageAndTemplate.jsx";
import ReportAndLayout from "../Pages/Setup/ReportAndLayout.jsx";
import GLOpeningBalance from "../Pages/Finance/GLOpeningBalance.jsx";
import EmployeeMaster from "../Pages/HR/EmployeeMaster.jsx";
import HR from "../Pages/HR/HR.jsx";
import SalesQuotationRFQ from "../Pages/Sales/SalesQuotationRFQ.jsx";
import QueryGenerator from "../Pages/Reports/QueryGenerator.jsx";
import PreviewReport from "../Pages/Reports/PreviewReport.jsx";
import EmailSetup from "../Pages/Admin/EmailSetup.jsx";
import EmailTemplate from "../Pages/Setup/EmailTemplate.jsx";
const ProtectedRoute = ({ element }) => {
  const { user, companyData, companyLoading, companyNeedsSetup, companyError } =
    useAuth();
  const location = useLocation();
  const [showRedirectAlert, setShowRedirectAlert] = useState(false);

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];
    document.title = lastSegment || "CELERIQ";
  }, [location]);

  const isOnCompanyDetails =
    location.pathname === "/dashboard/Admin/company-details";
  const isOnDashboardBase =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  if (!user) return <Navigate to="/" />;

  if (companyLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <BeatLoader />
      </Box>
    );
  }

  const hasValidCompany = companyData && companyData?.CompnyName;
  // ❌ Don't show error if data is present
  if (!companyLoading && companyError && !hasValidCompany) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6" color="error">
          Failed to load company data. Please check your connection or try again
          later.
        </Typography>
      </Box>
    );
  }

  // 👇 Alert if company setup is required but user tries to navigate elsewhere
  if ((companyNeedsSetup || !hasValidCompany) && !isOnCompanyDetails) {
    if (!showRedirectAlert) {
      setShowRedirectAlert(true);
      Swal.fire({
        icon: "warning",
        title: "Company Setup Required",
        text: "Please complete company setup before accessing other modules.",
        confirmButtonText: "Go to Company Setup",
      }).then(() => {
        window.location.href = "/dashboard/Admin/company-details"; // redirect after alert
      });
    }
    return null; // block rendering/redirect temporarily
  }

  if (hasValidCompany && isOnDashboardBase) {
    return <Navigate to="/dashboard/home" replace />;
  }

  return element;
};

function Routing() {
  const { logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/PurchaseQuotationRFQ"
          element={<PurchaseQuotationRFQ />}
        />

        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard logout={logout} />} />}
        >
          <Route path="home" element={<Home />} />
          <Route
            path="admin"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<Admin />} />
            <Route path="role-masterNew" element={<RoleMasterNew />} />

            <Route path="role-master" element={<RoleMaster />} />
            <Route path="role-creation" element={<RoleCreation />} />
            <Route path="user-creation" element={<UserCreation />} />
            <Route path="company-details" element={<CompanyDetails />} />
                        <Route path="EmailSetup" element={<EmailSetup />} />

            <Route path="inte-info-log" element={<IntegrationDetails />} />
            <Route path="inte-error-log" element={<IntergrationErrorLog />} />
          </Route>
          <Route
            path="setup"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<Setup />} />
            <Route path="item-group" element={<ItemGroup />} />
            <Route
              path="binlocation-sublevel"
              element={<BinLocationSubLevel />}
            />
            <Route path="Landed-cost-Setup" element={<LandedCostSetup />} />
            <Route path="state" element={<State />} />

            <Route path="Country" element={<Country />} />
            <Route path="Location" element={<Location />} />
            <Route path="LengthAndWidth" element={<LengthWidth />} />
            <Route path="WeightSetup" element={<WeightSetup />} />
            <Route path="EmailTemplate" element={<EmailTemplate />} />

            <Route path="Currencies" element={<Currencies />} />
            <Route
              path="BusinessPartnerGroup"
              element={<BusinessPartnerGroup />}
            />
            <Route path="payment-term" element={<PaymentTerm />} />
            <Route path="credit-card-payment" element={<CreditCardPayment />} />
            <Route path="banks" element={<Banks />} />
            <Route path="house-banks" element={<HouseBanks />} />
            <Route path="tax-Code" element={<TaxCode />} />
            <Route path="tax-Category" element={<TaxCategory />} />
            <Route path="tax-Type" element={<TaxType />} />
            <Route path="batch" element={<Batch />} />
            <Route path="serial" element={<Serial />} />
            <Route path="freight" element={<Freight />} />
            <Route path="credit-card" element={<CreditCard />} />
            <Route
              path="credit-card-paymentmethod"
              element={<CreditCardPaymentMethod />}
            />
            <Route path="general-setting" element={<GeneralSetting />} />
            <Route path="user-setup" element={<UserSetup />} />
            <Route path="holiday-master" element={<HolidayMaster />} />

            <Route
              path="unit-of-measure-group"
              element={<UnitOfMeasureGroup />}
            />
            <Route path="SAC" element={<SAC />} />
            <Route path="HSN" element={<HSN />} />
            <Route path="ShipType" element={<ShipType />} />
            <Route path="DocSeries" element={<DocSeries />} />
            <Route path="DocumentSeries" element={<DocumentSeries />} />
            <Route path="PostingPeriod" element={<PostingPeroid />} />
            <Route path="BarCode" element={<BarCode />} />

            <Route path="ServiceCategory" element={<ServiceCategory />} />
            <Route path="SalesEmp" element={<SalesEmp />} />
            <Route path="ReportAndLayout" element={<ReportAndLayout />} />
            <Route
              path="ApprovalStageAndTemplate"
              element={<ApprovalStageAndTemplate />}
            />
          </Route>

          <Route
            path="master"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<Master />} />
            <Route path="customer-master" element={<CustomerMaster />} />
            <Route path="technician-master" element={<TechnicianMaster />} />
            <Route path="vehicle-master" element={<VehicleMaster />} />
            <Route
              path="fitting-charges-time"
              element={<FittingChargeAndTime />}
            />
            <Route path="salesTarget" element={<SalesTarget />} />
            <Route
              path="supplier-sale-target"
              element={<SupplierSalesTarget />}
            />
            <Route
              path="generate-transaction-number"
              element={<DocumentNumber />}
            />
            <Route path="item-master" element={<ItemImageMapping />} />
            <Route path="jack-master" element={<JackMaster />} />
            <Route path="jack-master1" element={<JackMaster1 />} />
            <Route path="qc-master" element={<QcMaster />} />
            <Route path="country-master" element={<CountryMaster />} />
            <Route path="tax-master" element={<TaxMaster />} />
            <Route path="currency-master" element={<CurrencyMaster />} />
            <Route path="currency-exchange" element={<CurrencyExchange />} />
            <Route path="uom-master" element={<UoMMaster />} />
            <Route path="uom-conversion" element={<UoMConversion />} />
            {/* <Route path="bin-location-setup" element={<BinLocationSetup />} /> */}
            {/* <Route path="bin-location-setup" element={<BinLocationSetup />} /> */}
            {/* <Route path="werehouse-setup" element={<WerehouseMaster />} /> */}
            {/* <Route path="uom-master" element={<UoMMaster />} /> */}
            <Route path="business-partner" element={<BusinessPartner />} />
            <Route path="uom-conversion" element={<UoMConversion />} />
            <Route path="bin-location-master" element={<BinLocationMaster />} />
            <Route path="werehouse-master" element={<WerehouseMaster />} />
            <Route path="qc-master" element={<QcMaster />} />
          </Route>

          <Route
            path="banking"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<Banking />} />
            <Route path="incoming-payment" element={<IncomingPayment />} />
            <Route path="outgoing-payment" element={<OutgoingPayments />} />
          </Route>
          <Route
            path="HR"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<HR />} />
            <Route path="EmployeeMaster" element={<EmployeeMaster />} />
          </Route>
          <Route
            path="VMS"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<VMS />} />
            <Route path="VehicleModel" element={<VehicleModel />} />
            <Route path="VehicleMake" element={<VehicleMake />} />
            <Route path="VehicleDriver" element={<VehicleDriver />} />
            <Route path="MaintenanceCL" element={<MaintenanceCL />} />
            <Route path="FuelTracking" element={<FuelTracking />} />
            <Route path="VehicleMaster" element={<VehicleMaster />} />
            <Route path="VehicleMaintenance" element={<VehicleMaintenance />} />
          </Route>
          <Route
            path="inventory"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<Inventory />} />
            <Route path="goods-issue" element={<GoodsIssue />} />
            <Route path="goods-receipt" element={<GoodsReceipt />} />
            <Route path="inventory-transfer" element={<InventoryTransfer />} />
            <Route
              path="inventory-opening-balance"
              element={<InventoryOpeningBalance />}
            />
            <Route path="stock-counting" element={<StockCounting />} />
            <Route path="stock-posting" element={<StockPosting />} />
            <Route
              path="inventory-revaluation"
              element={<InventoryRevaluation />}
            />
            <Route
              path="inventory-price-list"
              element={<InventoryPriceList />}
            />
          </Route>

          <Route
            path="Production"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<Production />} />
            <Route path="BillOfMaterial" element={<BillOfMaterial />} />
            <Route path="ProductionOrder" element={<ProductionOrder />} />
            <Route
              path="ReceiptProduction"
              element={<ReceiptForProduction />}
            />
            <Route path="IssueProduction" element={<IssueForProduction />} />
          </Route>
          <Route
            path="Finance"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<Finance />} />
            <Route path="JournalEntry" element={<JournalEntry />} />
            <Route path="ChartOfAccount" element={<ChartOfAccount />} />
            <Route
              path="GLAcctDetermination"
              element={<GLAcctDetermination />}
            />
            <Route
              path="ExchangeRatesAndIndexes"
              element={<ExchangeRatesAndIndexes />}
            />
            <Route path="BPOpeningBalance" element={<BPOpeningBalance />} />
            <Route path="GLOpeningBalance" element={<GLOpeningBalance />} />
          </Route>
          {/* ---------------------- */}
          <Route
            path="ARsales"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<ARSales />} />
            <Route path="dynamic-search" element={<DynamicSearch />} />
            <Route path="quotation" element={<QuatationSO />} />
            <Route path="Additional-Payment" element={<AdditionalPayment />} />
            <Route
              path="booking-appointment"
              element={<BookingAppointment />}
            />
            <Route path="material-request" element={<MaterialRequest />} />
            <Route path="cash-invoice" element={<CashInvoice />} />
            <Route path="order-cancellation" element={<OrderCancellation />} />
            <Route
              path="customer-sales-history"
              element={<CustomerSalesHistory />}
            />
          </Route>

          <Route
            path="Sales"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<Sales />} />
            <Route path="Sales-quotation" element={<SalesQuotation />} />
            <Route path="Sales-order" element={<SalesOrder />} />
            <Route path="Sales-delivery" element={<SalesDelivery />} />
            <Route path="Sales-invoice" element={<SalesInvoice />} />
            <Route path="Sales-credit-note" element={<SalesCreditNote />} />
            <Route path="Sales-Down-Payment" element={<SalesDownPayment />} />
            <Route path="Sales-Return" element={<SalesReturn />} />
          </Route>

          <Route
            path="Purchase"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<APPurchese />} />
            <Route
              path="purchase-credit-note"
              element={<PurchaseCreditNote />}
            />
            <Route path="purchase-invoice" element={<PurchaseInvoice />} />
            <Route path="goods-receipt-note" element={<GoodsReceiptNote />} />
            <Route path="landed-cost" element={<LandedCost />} />
            <Route path="procurement-eta" element={<ProcurementETA />} />
            <Route path="purchase-order" element={<PurchaseOrder />} />
            <Route path="purchase-quotation" element={<PurchaseQuotation />} />
            <Route path="purchase-request" element={<PurchaseRequest />} />

            <Route
              path="purchase-goodsReturn"
              element={<PurchaseGoodReturn />}
            />

            <Route
              path="APDown-Payment-Invoice"
              element={<APDownPaymentInvoice />}
            />
            <Route
              path="purchase-comparison"
              element={<PurchaseComparison />}
            />
          </Route>
          <Route
            path="workshop"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<WorkShop />} />
            <Route path="inward-vehicle" element={<InwardVehicle />} />
            <Route path="job-card" element={<JobCardEntry />} />
            <Route path="outward-vehicle" element={<OutwardVehicle />} />
            <Route path="appointment-screen" element={<AppointmentScreen />} />
          </Route>
          <Route
            path="warehouse"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<WareHouse />} />
            <Route path="issue-material" element={<IssueMaterial />} />
            <Route path="material-return" element={<MaterialReturn />} />
            {/* <Route path="barcode" element={<Barcode />} /> */}
          </Route>

          <Route
            path="reports"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="QueryGenerator" element={<QueryGenerator />} />
            <Route path="PreviewReport" element={<PreviewReport />} />
            <Route path="" element={<Reports />} />
            <Route path="daily-collection" element={<DailyCollection />} />
            <Route path="bdm-sales-report" element={<BDMSalesReport />} />
            <Route
              path="sales-analysis-report"
              element={<SalesAnalysisByItemReport />}
            />
            <Route path="salesman-sales-report" element={<SalesmanReport />} />

            <Route
              path="daily-appointment-sheet"
              element={<DailyAppointmentSheet />}
            />
            <Route path="daily-inward-sheet" element={<DailyInwardSheet />} />
            <Route
              path="open-quotation-sheet"
              element={<OpenQuotationSheet />}
            />
            <Route
              path="open-quotation-summary"
              element={<OpenQuotationSummary />}
            />
            <Route path="wms-delivery-report" element={<WMSDeliveryReport />} />
            <Route
              path="customer-feedback-report"
              element={<CustomerFeedbackReport />}
            />
            <Route
              path="open-so-update-report"
              element={<OpenSoUpdateReport />}
            />
            <Route path="open-so-salesman" element={<OpenSoBySalesman />} />
            <Route path="open-so-with-dp" element={<OpenSoDpSummary />} />
            <Route
              path="replenishment-report"
              element={<ReplenishmentReport />}
            />
            <Route
              path="vehicle-outward-sheet"
              element={<VehicleOutwardSheetReport />}
            />
          </Route>
          <Route
            path="SAPReports"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route path="" element={<SAPB1Reports />} />
            <Route
              path="customer-sales-history"
              element={<SAPCustomerSalesHistory />}
            />
            <Route path="bdm-sales-report" element={<SAPBDMSalesReport />} />
            <Route
              path="sales-analysis-by-item"
              element={<SalesAnalysisByItem />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;
