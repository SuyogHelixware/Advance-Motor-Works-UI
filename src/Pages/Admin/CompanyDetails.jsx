import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import ViewListIcon from "@mui/icons-material/ViewList";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

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
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import dayjs from "dayjs";
import { isEqual, values } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import {
  InputSearchSelectTextField,
  InputSelectTextField,
  InputTextAreaFields,
  InputTextField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
import PhoneNumberInput from "../Components/PhoneNumber1";
import usePermissions from "../Components/usePermissions";
import DataGridCellClickModel from "../Components/DataGridCellClickModel";
import PrintMenu from "../Components/PrintMenu";
export default function CompanyDetails() {
  const { user, fetchCompanyName } = useAuth();
  const perms = usePermissions(14);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tabvalue, settabvalue] = useState(0);
  const [addBank, setAddBank] = useState([]);
  const [openadd1, setAddOpen1] = useState(false);
  const [bankCode, setBankCode] = useState([]);
  const [glAccount, setGLAccount] = useState("");
  const [listofstate, setListofState] = useState([]);
  const [Outerlistofstate, setOuterListofState] = useState([]);
  const [listofcountry, setListofCountry] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null); // Track the selected row
  const [accountingValue, setAccountingValue] = useState(0); // State for inner "Accounting" tabs
  const theme = useTheme();
  const [currencydata, setCurrencydata] = useState([]);
  const [saveUpdateButtonAB, setSaveUpdateButtonAB] = useState("SAVE");
  const [buttonLabel, setButtonLabel] = useState("SAVE"); // Default to "SAVE"
  const [loading, setLoading] = useState(false);
  const currentStates = useRef([]);

  const [logo1, setLogo1] = useState(null);
  const [logo2, setLogo2] = useState(null);

  const [openGLModal, setOpenGLModal] = useState(false);
  const [activeGLField, setActiveGLField] = useState(""); // "GLAccount" OR "GLInterimAccount"

  const [currentGLPage, setCurrentGLPage] = useState(0);
  const [searchGLText, setSearchGLText] = useState("");
  const glCacheRef = useRef({});
  const [listGL, setListGL] = useState([]);
  const [rowGLCount, setRowGLCount] = useState(0);
  const [isGLLoading, setIsGLLoading] = useState(false);
  const [PrintData, setPrintData] = useState([]);
  const [type, setType] = useState("I");
  const handleGLPaginationModelChange = useCallback(
    (model) => {
      if (model.page !== currentGLPage) {
        setCurrentGLPage(model.page);
      }
    },
    [currentGLPage],
  );

  const handleGLSearchChange = useCallback((text) => {
    setSearchGLText(text);
    setCurrentGLPage(0);
    glCacheRef.current = {};
  }, []);
  const FetchGLList = async ({ page = 0, search = "" }) => {
    const cacheKey = `${search}-${page}`;

    if (glCacheRef.current[cacheKey]) {
      setListGL(glCacheRef.current[cacheKey]);
      return;
    }

    setIsGLLoading(true);
    try {
      const url = search
        ? `/ChartOfAccounts/Search/${search}/1/${page}/20`
        : `/ChartOfAccounts/Pages/1/${page}/20`;

      const res = await apiClient.get(url);
      const data = res.data;

      if (data.success) {
        const items = data?.values || [];
        setListGL(items);

        glCacheRef.current[cacheKey] = items;

        if (items.length < 20) {
          setRowGLCount(page * 20 + items.length);
        } else if (page === 0) {
          setRowGLCount(1000);
        }
      } else {
        Swal.fire("Error!", data.message, "warning");
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Failed to fetch GL list", "warning");
    } finally {
      setIsGLLoading(false);
    }
  };
  useEffect(() => {
    if (openGLModal) {
      FetchGLList({ page: currentGLPage, search: searchGLText });
    }
  }, [currentGLPage, searchGLText, openGLModal]);

  const handleGLCellClick = (params) => {
    const row = params.row;

    if (activeGLField === "GLAccount") {
      setValueAddBank("GLAccount", row.AcctCode);
    } else if (activeGLField === "GLIntriAct") {
      setValueAddBank("GLIntriAct", row.AcctCode);
    }

    setOpenGLModal(false);
  };

  const LogoUploadBox = ({ label, logo, setLogo }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Allowed types
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];

      if (!validTypes.includes(file.type)) {
        Swal.fire({
          title: "Invalid File!",
          text: "Only PNG, JPG, and JPEG formats are allowed.",
          icon: "error",
          confirmButtonText: "OK",
        });

        e.target.value = ""; // reset file input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    };

    return (
      <Box textAlign="center" sx={{ minHeight: 120 }}>
        {logo ? (
          /* LARGE PREVIEW AFTER SELECT */
          <Box
            onClick={() => window.open(logo, "_blank")}
            position="relative"
            width={{ xs: "100%", sm: 200, md: 180 }}
            height={{ xs: 120, sm: 100, md: 90 }}
            mx="auto"
            border="1px solid #ccc"
            borderRadius={2}
            overflow="hidden"
            sx={{ cursor: "pointer" }}
          >
            <img
              src={logo}
              alt="logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />

            <RemoveCircleOutlineIcon
              onClick={(e) => {
                e.stopPropagation();
                setLogo(null);
              }}
              sx={{
                position: "absolute",
                top: 5,
                right: 5,
                color: "red",
                cursor: "pointer",
                backgroundColor: "#fff",
                borderRadius: "50%",
                boxShadow: 1,
              }}
            />
          </Box>
        ) : (
          /* SMALL BUTTON BEFORE SELECT */
          <Box
            onClick={() => fileInputRef.current.click()}
            sx={{
              width: { xs: "100%", sm: "100%", md: "100%", lg: 150 },
              height: 40,
              border: "1px dashed #777",
              borderRadius: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              mx: "auto",
            }}
          >
            <Typography fontSize={14} fontWeight={600}>
              {label}
            </Typography>
          </Box>
        )}

        {/* Hidden input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </Box>
    );
  };

  // =====================================Sales Tax Account====================================

  const addBankCol = [
    {
      field: "checkbox",
      headerName: "Select",
      width: 100,
      renderCell: (params) => (
        <Checkbox
          type="checkbox"
          checked={selectedRow === params.row.Account} // Only check the box if it matches the selected row
          onChange={() => handleCheckboxChange(params.row.Account)} // Handle checkbox click
        />
      ),
    },
    {
      field: "BankCode",
      headerName: "Bank Code",
      width: 150,
    },
    {
      field: "BankName",
      headerName: "Bank Name",
      width: 150,
      editable: false,
    },
    {
      field: "Country",
      headerName: "COUNTRY",
      width: 150,
    },
    { field: "Branch", headerName: "BRANCH", width: 150 },

    {
      field: "Account",
      headerName: "A/C NO.",
      width: 150,
      editable: false,
    },
    {
      field: "AcctName",
      headerName: "BANK ACCOUNT NAME",
      width: 150,
      editable: false,
    },
    {
      field: "SwiftNum",
      headerName: "BIC/SWIFT CODE",
      width: 150,
    },
    {
      field: "ControlKey",
      headerName: "Control Key",
      width: 150,
      editable: false,
    },
    {
      field: "GLAccount",
      headerName: "G/L Account",
      width: 150,
    },
    {
      field: "GLIntriAct",
      headerName: "G/L Interim Account",
      width: 200,
    },
    {
      field: "IBAN",
      headerName: "IBAN",
      width: 150,
      editable: false,
    },
    {
      field: "State",
      headerName: "State",
      width: 150,
      editable: false,
    },
    {
      field: "Address",
      headerName: "Address",
      width: 150,
    },
    {
      field: "City",
      headerName: "CITY",
      width: 150,
    },
    {
      field: "ZipCode",
      headerName: "Zip Code",
      width: 150,
      editable: false,
    },

    {
      field: "PostOffice",
      headerName: "Post Office",
      width: 100,
      renderCell: (params) => (
        <Checkbox
          checked={params.value === "1"} // Check if value is "Post Office"
          disabled // Make it read-only (you can enable this if needed)
        />
      ),
    },
    {
      field: "EDIT",
      headerName: "EDIT",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <IconButton
            color="primary"
            onClick={() => handleEditAddBank(params.row)}
            onChange={(e) => handleCheckboxChange(e, params.Account)}
            disabled={
              selectedRow !== null && selectedRow !== params.row.Account
            }
          >
            <EditNoteIcon />
          </IconButton>
        );
      },
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
            onClick={() => {
              console.log("Delete Button Clicked, Row ID:", params.row.Account); // Debugging log
              handleDeleteRow(params.row.Account);
            }}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
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
  const initial = {
    Status: "1",
    CompnyName: "",
    Street: "",
    Block: "",
    City: "",
    State: "",
    ZipCode: "",
    Country: "",
    Phone1: "",
    Phone2: "",
    GlblLocNum: "",
    Email: "",
    CompType: "",
    MainCurncy: "",
    SysCurrncy: "",
    DfActCurr: "1",
    MultiLang: "",
    InvntSystm: "",
    RelStkNoPr: "",
    SnBDfltSB: "",
    NewAcctDe: "",
    DfltBankCode: "",
    DfltBankName: "",
    DfltAcct: "",
    DfltBranch: "",
    SwiftNum: "",
    DfltActKey: "",
    TaxIdNum: "",
    RevOffice: "",
    FreeZoneNo: "",
    DdctFileNo: "",
    DdctOffice: "",
    TaxIdNum2: "",
    TaxIdNum3: "",
    ServNature: "",
    AssType: "",
    CompnyType: "",
    NatureBiz: "",
    TaxIdNum4: "",
    TaxIdNum6: "",
    EccNo: "",
    CERegNo: "",
    CERange: "",
    CEDivision: "",
    CeComRate: "",
    MenuCode: "",
    Jurisd: "",
    TaxIdNum5: "",
    GSTRegnNo: "",
    GSTType: "",
    Address: "",
    CompnyAddr: "",
    oHBankLines: [],
  };
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm({
    defaultValues: initial,
  });
  const {
    control: controlAddBank,
    handleSubmit: handleSubmitFormAddBank,
    setValue: setValueAddBank,
    reset: resetAddBank,
    watch: watchaddBank,
    getValues: getValuesAddBank,
  } = useForm({
    defaultValues: {
      BankCode: "",
      BankName: "",
      Country: "",
      Branch: "",
      Account: "",
      ZipCode: "",
      ControlKey: "",
      AcctName: "",
      SwiftNum: "",
      IBAN: "",
      Address: "",
      City: "",
      PostOffice: "0", // Default unchecked
    },
  });
  const allFormData = getValues();

  const updateAddress = () => {
    const Block = getValues("Block") || "";
    const street = getValues("Street") || "";

    const City = getValues("City") || "";
    const ZipCode = getValues("ZipCode") || "";
    const Country = getValues("Country") || "";
    const State = getValues("State") || "";

    const concatenatedAddress = [Block, street, City, ZipCode, State, Country]
      .filter(Boolean) // Remove empty values
      .join(", "); // Join with commas

    setValue("CompnyAddr", concatenatedAddress, { shouldValidate: true });
  };

  const initialValues = useRef({});
  const initialValuesAddBank = useRef({});
  useEffect(() => {
    if (Object.keys(initialValues.current).length === 0) {
      setTimeout(() => {
        initialValues.current = getValues(); // Ensure we store the real initial values
        console.log("Initial Values Stored:", initialValues.current);
        // setButtonLabel("SAVE"); // Prevent false "UPDATE"
      }, 0);
    }
  }, []);
  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const { data: dataPrint } = await apiClient.get(
          `/ReportLayout/GetByTransId/39`,
        );
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

  useEffect(() => {
    if (
      !initialValues.current ||
      Object.keys(initialValues.current).length === 0
    )
      return;

    const currentValues = getValues();
    const bankValues = getValuesAddBank();

    const cleanedInitial = JSON.parse(
      JSON.stringify(initialValues.current, (_, value) =>
        typeof value === "string" ? value.trim() : value,
      ),
    );
    const cleanedCurrent = JSON.parse(
      JSON.stringify(currentValues, (_, value) =>
        typeof value === "string" ? value.trim() : value,
      ),
    );

    const cleanedInitialBank = JSON.parse(
      JSON.stringify(initialValuesAddBank.current, (_, value) =>
        typeof value === "string" ? value.trim() : value,
      ),
    );
    const cleanedCurrentBank = JSON.parse(
      JSON.stringify(bankValues, (_, value) =>
        typeof value === "string" ? value.trim() : value,
      ),
    );

    const isFormModified = !isEqual(cleanedInitial, cleanedCurrent);
    const isBankModified = !isEqual(cleanedInitialBank, cleanedCurrentBank);

    // If the form or bank data has changed, set "UPDATE"
    if (isFormModified || isBankModified) {
      // setButtonLabel("UPDATE");
    } else if (!selectedRow) {
      // If nothing is modified AND checkbox is not selected, reset to "SAVE"
      // setButtonLabel("SAVE");
    }
  }, [watch(), watchaddBank]); // Removed selectedRow to prevent forcing update on checkbox change

  useEffect(() => {
    if (selectedRow) {
      // setButtonLabel("UPDATE");
    }
  }, [selectedRow]);
  const handleApiError = (error, customMessage = "Something went wrong!") => {
    console.error("API Error:", error);

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

  const setOldDataOPen = async () => {
    toggleSidebar();

    try {
      setLoading(true);
      // ✅ Step 1: Call your Company Details API
      const res = await apiClient.get("/CompanyDetails/All"); // <-- Replace with your actual API route
      const companyList = res?.data?.value || res?.data?.values || [];

      if (companyList.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Company Records Found",
          text: "No company data available to load.",
          timer: 2000,
          showConfirmButton: false,
        });
        setButtonLabel("SAVE");
        reset({});
        resetAddBank({});
        setAddBank([]);
        setSelectedRow(null);
        return;
      }

      // ✅ Step 2: Use the first record
      const companyDetails = companyList[0];
      console.log("Fetched company details:", companyDetails);

      setButtonLabel("UPDATE");

      // ✅ Step 3: Normalize Bank Lines
      const bankLines = Array.isArray(companyDetails.oHBankLines)
        ? companyDetails.oHBankLines
        : [];

      const updatedCompanyData = {
        ...companyDetails,
        oHBankLines: bankLines,
      };

      console.log("Normalized company data:", updatedCompanyData);

      // ✅ Step 4: Set form values
      reset(updatedCompanyData);
      // Restore Logo 1
      if (companyDetails?.Logo1) {
        setLogo1(`data:image/jpeg;base64,${companyDetails.Logo1}`);
      } else {
        setLogo1(null);
      }

      // Restore Logo 2
      if (companyDetails?.Logo2) {
        setLogo2(`data:image/jpeg;base64,${companyDetails.Logo2}`);
      } else {
        setLogo2(null);
      }

      if (bankLines.length > 0) {
        resetAddBank(bankLines);
        setAddBank(bankLines);
      } else {
        resetAddBank({});
        setAddBank([]);
      }

      // ✅ Step 5: Select default bank row if available
      const defaultBank = bankLines.find(
        (bank) => bank.BankCode === companyDetails.DfltBankCode,
      );

      setSelectedRow(defaultBank ? defaultBank.Account : null);

      // ✅ Step 6: Store initial form values for comparison
      setTimeout(() => {
        const formVals = getValues();
        const bankVals = getValuesAddBank();
        console.log("Initial Main Form Values:", formVals);
        console.log("Initial Bank Form Values:", bankVals);

        initialValues.current = formVals;
        initialValuesAddBank.current = bankVals;
      }, 0);
    } catch (error) {
      console.error("Error fetching company details:", error);
      handleApiError(error, "Failed to fetch company details!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (data) => {
    console.log(data);
    const base64Logo1 = logo1
      ? logo1.replace(/^data:image\/\w+;base64,/, "")
      : "";
    const base64Logo2 = logo2
      ? logo2.replace(/^data:image\/\w+;base64,/, "")
      : "";

    // if (!selectedRow) {
    //   Swal.fire({
    //     title: "Error!",
    //     text: "Please select Bank First",
    //     icon: "error",
    //     confirmButtonText: "Ok",
    //   });
    //   return;
    // }

    const selectedData = addBank.find((item) => item.Account === selectedRow);
    console.log("selected data", selectedData);

    const obj = {
      UserId: user.UserId,
      CreatedBy: user.UserName || "",
      CreatedDate: dayjs().format("YYYY/MM/DD"),
      ModifiedBy: user.UserName || "",
      ModifiedDate: dayjs().format("YYYY/MM/DD"),
      DocEntry: String(data.DocEntry),
      Logo1: base64Logo1,
      Logo2: base64Logo2,

      CompnyName: String(data.CompnyName),
      Street: String(data.Street),
      Block: String(data.Block),
      City: String(data.City),
      State: String(data.State),
      ZipCode: String(data.ZipCode),
      Country: String(data.Country || ""),
      Phone1: String(data.Phone1),
      Phone2: String(data.Phone2),
      GlblLocNum: String(data.GlblLocNum),
      Email: String(data.Email),
      CompType: String(data.CompType || "Y"),
      MainCurncy: String(data.MainCurncy),
      SysCurrncy: String(data.SysCurrncy),
      DfActCurr: String(data.DfActCurr),
      MultiLang: String(data.MultiLang ? "1" : "0"),
      InvntSystm: String(data.InvntSystm || ""),
      RelStkNoPr: String(data.RelStkNoPr ? "1" : "0"),
      SnBDfltSB: String(data.SnBDfltSB ? "1" : "0"),
      NewAcctDe: String(data.NewAcctDe ? "1" : "0"),
      DfltAcct: selectedData?.Account || "",
      DfltActKey: selectedData?.GLAccount || "",
      DfltBranch: selectedData?.Branch || "",
      DfltBankCode: selectedData?.BankCode || "",
      DfltBankName: selectedData?.BankName || "",
      SwiftNum: selectedData?.SwiftNum || "",
      TaxIdNum: String(data.TaxIdNum || ""),
      RevOffice: String(data.RevOffice || ""),
      FreeZoneNo: String(data.FreeZoneNo || ""),
      DdctFileNo: String(data.DdctFileNo || ""),
      DdctOffice: String(data.DdctOffice || ""),
      TaxIdNum2: String(data.TaxIdNum2 || ""),
      TaxIdNum3: String(data.TaxIdNum3 || ""),
      ServNature: String(data.ServNature || ""),
      AssType: String(data.AssType || ""),
      CompnyType: String(data.CompnyType || ""),
      NatureBiz: String(data.NatureBiz || ""),
      TaxIdNum4: String(data.TaxIdNum4 || ""),
      TaxIdNum6: String(data.TaxIdNum6 || ""),
      EccNo: String(data.EccNo || ""),
      CERegNo: String(data.CERegNo || ""),
      CERange: String(data.CERange || ""),
      CEDivision: String(data.CEDivision || ""),
      CeComRate: String(data.CeComRate || ""),
      MenuCode: String(data.MenuCode || ""),
      Jurisd: String(data.Jurisd || ""),
      TaxIdNum5: String(data.TaxIdNum5 || ""),
      GSTRegnNo: String(data.GSTRegnNo || ""),
      GSTType: String(data.GSTType || ""),
      CompnyAddr: String(data.CompnyAddr || ""),
      oHBankLines: addBank.map((row) => ({
        UserId: user.UserId,
        CreatedBy: user.UserName,
        ModifiedBy: user.UserName,
        LineNum: String(row?.LineNum || ""),
        Status: String(row?.Status ? "1" : "0"),
        BankCode: String(row?.BankCode || ""),
        BankName: String(row?.BankName || ""),
        Country: String(row?.Country || ""),
        PostOffice: String(row?.PostOffice || ""),
        Branch: String(row?.Branch || ""),
        Account: String(row?.Account || ""),
        AcctName: String(row?.AcctName || ""),
        SwiftNum: String(row?.SwiftNum || ""),
        ControlKey: String(row?.ControlKey || ""),
        GLAccount: String(row?.GLAccount || ""),
        GLIntriAct: String(row?.GLIntriAct || ""),
        IBAN: String(row?.IBAN || ""),
        Address: String(row?.Address || ""),
        City: String(row?.City || ""),
        ZipCode: String(row?.ZipCode || ""),
        State: String(row?.State || ""),
      })),
    };

    // Ask for confirmation before updating
    if (buttonLabel === "UPDATE") {
      const result = await Swal.fire({
        title: "Do you want to update ?",
        // text: "Do you want to update this record?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (!result.isConfirmed) {
        return; // If user cancels, do nothing
      }
    }

    try {
      let response;
      if (buttonLabel === "UPDATE") {
        setLoading(true);
        response = await apiClient.put(`/CompanyDetails/${data.DocEntry}`, obj);
        setLoading(false);
      } else {
        setLoading(true);
        response = await apiClient.post(`/CompanyDetails`, obj);
        setLoading(false);
      }

      const { success, message } = response.data;

      if (success) {
        Swal.fire({
          title: "Success!",
          text:
            buttonLabel === "UPDATE"
              ? "Company Details Updated successfully"
              : "Company Details Added successfully",
          icon: "success",
          confirmButtonText: "Ok",
          timer: 1000,
        });
        reset(initial);
        setOldDataOPen();

        // setButtonLabel("SAVE"); // Reset button after successful update
      } else {
        Swal.fire({
          title: "Error!",
          text: message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error while saving:", error);
      Swal.fire({
        title: "Error!",
        text: "There was an issue with the request. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const ListofCountry = async () => {
    try {
      const { data } = await apiClient.get(`/Country/all`);
      const { values } = data;
      console.log("country", values);
      setListofCountry(values); // Set the list of countries
    } catch (error) {
      console.error("Error fetching countries:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch country list. Please try again.",
      });
    }
  };

  const getBankCodeDataList = async () => {
    try {
      const response = await apiClient.get(`/BankSetup/All`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { values } = response.data; // Assuming 'values' holds the list of banks
      setBankCode(values);
    } catch (error) {
      console.error("Error fetching bank data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch bank data. Please try again.",
      });
    }
  };

  const ListofState = async (CountryCode) => {
    try {
      const { data } = await apiClient.get(
        `/ListofStates/GetByCountryCode/${CountryCode}`,
      );
      const { values } = data;
      console.log("All States:", values);
      setListofState(values); // Update state dropdown options
      return values || []; // <- return array for immediate use
    } catch (error) {
      console.error("Error fetching states:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch state list. Please check the selected country.",
      });
      return []; // <- return empty array on error
    }
  };

  const OuterListofState = async (CountryCode) => {
    try {
      const { data } = await apiClient.get(
        `/ListofStates/GetByCountryCode/${CountryCode}`,
      );
      const { values } = data;
      console.log("All States:", values);
      setOuterListofState(values);
    } catch (error) {
      console.error("Error fetching states:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch state list for the outer list. Please check the selected country.",
      });
    }
  };

  const getGLAccountData = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(`/ChartOfAccounts/All`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        const { values = [] } = response.data;
        setGLAccount(values);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: response?.data?.message || "No data found",
        });
      }
    } catch (error) {
      console.error("Error fetching GL account data:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch GL account data. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrencyData = async () => {
    try {
      const res = await apiClient.get(`/Currency/all`);
      const respons = res.data.values;
      setCurrencydata(respons);

      // Find INR and set default if found
      // const inrCurrency = respons.find((item) => item.CurrCode === "INR");
      // if (inrCurrency) {
      //   setValue("MainCurncy", inrCurrency.CurrName);
      // }
    } catch (error) {
      console.error("Error fetching currency data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch currency data. Please try again later.",
      });
    }
  };

  const handleTabChange = (event, newtab) => {
    settabvalue(newtab);
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const habdleAddOpen1 = () => {
    // Reset the form to the default values
    resetAddBank({
      BankCode: "",
      BankName: "",
      Country: "",
      Branch: "",
      Account: "",
      ZipCode: "",
      ControlKey: "",
      AcctName: "",
      SwiftNum: "",
      IBAN: "",
      Address: "",
      City: "",
      PostOffice: "0", // Default unchecked
    });

    // Open the modal
    setAddOpen1(true);
  };
  const handleAddClose1 = () => {
    setAddOpen1(false);
    setSaveUpdateButtonAB("SAVE");
    // resetFormAddBank(initialFormDataAddBank);
    // setSaveUpdateButtonAB("SAVE");
  };
  const ClearFormData = () => {
    setAddBank([]); // Reset the rows to an empty array
    reset(initial);
  };

  const handleAccountingChange = (event, newValue) => {
    setAccountingValue(newValue);
  };

  const oHBankLines = watch("oHBankLines"); // Watch for updates in oHBankLines
  console.log("Watched oHBankLines:", oHBankLines);

  const handleEditAddBank = async (data) => {
    setSaveUpdateButtonAB("UPDATE");

    let states = [];
    if (data.Country) {
      states = await ListofState(data.Country); // returns array
    }

    const selectedBank = bankCode.find(
      (item) => item.BankCode === data.BankCode,
    );
    const selectedGLAccount = glAccount.find(
      (item) => item.AcctName === data.GLAccount,
    );
    const selectedGLIntriAct = glAccount.find(
      (item) => item.AcctName === data.GLIntriAct,
    );

    const selectedState = states.find((s) => s.Code === data.State);

    resetAddBank({
      BankCode: selectedBank?.DocEntry || data.BankCode || "",
      BankName: selectedBank?.BankName || data.BankName || "",
      Country: data.Country || "",
      Branch: data.Branch || "",
      Account: data.Account || "",
      ZipCode: data.ZipCode || "",
      ControlKey: data.ControlKey || "",
      AcctName: data.AcctName || "",
      SwiftNum: data.SwiftNum || "",
      IBAN: data.IBAN || "",
      Address: data.Address || "",
      City: data.City || "",
      PostOffice: data.PostOffice === "1" ? "1" : "0",
      State: selectedState?.Code || "",
      GLAccount: selectedGLAccount?.DocEntry || data.GLAccount || "",
      GLIntriAct: selectedGLIntriAct?.DocEntry || data.GLIntriAct || "",
    });

    // Store the fetched states in a ref for onSave
    currentStates.current = states;

    setAddOpen1(true);
  };

  const selectedCountryCode = watch("Country");
  useEffect(() => {
    setValueAddBank("BankCode", watch("BankCode"));
  }, [watch("BankCode")]);

  useEffect(() => {
    if (selectedCountryCode) {
      OuterListofState(selectedCountryCode);
    }
  }, [selectedCountryCode]);
  useEffect(
    () => {
      // ListofState(Country || "");

      fetchCompanyName();
      getBankCodeDataList();
      getGLAccountData();
      ListofCountry();
      CurrencyData();
      setOldDataOPen(); // Pass `obj` in the function call
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleCheckboxChange = (rowId) => {
    console.log("Selected Row ID:", rowId);
    setSelectedRow((prev) => (prev === rowId ? null : rowId));
    // setButtonLabel("UPDATE");
  };
  // Set default selected row if DfltBankCode matches any BankCode
  useEffect(() => {
    if (values?.values?.DfltBankCode && values?.values?.oHBankLines) {
      const defaultBank = values.values.oHBankLines.find(
        (bank) => bank.BankCode === values.values.DfltBankCode,
      );
      if (defaultBank) {
        setSelectedRow(defaultBank.BankCode);
      }
    }
  }, [values]);

  const handleDeleteRow = (Account) => {
    console.log("Deleting row with ID:", Account);
    setAddBank((prevRows) => prevRows.filter((row) => row.Account !== Account));
    // setButtonLabel("UPDATE")
  };

  const onSave = (data, event) => {
    event.preventDefault();
    event.stopPropagation();

    const formData = getValuesAddBank();

    // Map State code → Name using currentStates
    const selectedState = currentStates.current.find(
      (s) => s.Code === formData.State,
    ) || { Code: formData.State, Name: formData.State };

    const selectedBank = bankCode.find((b) => b.DocEntry === formData.BankCode);
    const selectedGLAccount = glAccount.find(
      (g) => g.DocEntry === formData.GLAccount,
    );
    const selectedGLIntriAct = glAccount.find(
      (g) => g.DocEntry === formData.GLIntriAct,
    );

    const updatedRow = {
      BankCode: selectedBank?.BankCode || formData.BankCode,
      BankName: selectedBank?.BankName || formData.BankName,
      Country: formData.Country,
      State: selectedState.Code,
      StateName: selectedState.Name,
      GLAccount: selectedGLAccount?.AcctName || formData.GLAccount,
      GLIntriAct: selectedGLIntriAct?.AcctName || formData.GLIntriAct,
      Branch: formData.Branch,
      Account: formData.Account,
      ZipCode: formData.ZipCode,
      ControlKey: formData.ControlKey,
      AcctName: formData.AcctName,
      SwiftNum: formData.SwiftNum,
      IBAN: formData.IBAN,
      Address: formData.Address,
      City: formData.City,
      PostOffice: formData.PostOffice === "1" ? "1" : "0",
    };

    if (saveUpdateButtonAB === "SAVE") {
      setAddBank((prev) => [...prev, updatedRow]);
      if (addBank.length === 0) setSelectedRow(updatedRow.Account);
    } else {
      // Update row in DataGrid
      setAddBank((prev) =>
        prev.map((row) =>
          row.Account === formData.Account ? { ...updatedRow } : row,
        ),
      );
    }
    resetAddBank();
    handleAddClose1();
  };

  return (
    <>
      <DataGridCellClickModel
        open={openGLModal}
        closeModel={() => setOpenGLModal(false)}
        isLoading={isGLLoading}
        title="Chart of Account List"
        getRowId={(row) => row.DocEntry}
        columns={Acclist}
        rows={listGL}
        taxCurrentPage={currentGLPage}
        limit={20}
        onPaginationModelChange={handleGLPaginationModelChange}
        searchText={searchGLText}
        onSearchChange={handleGLSearchChange}
        rowCount={rowGLCount}
        onCellClick={handleGLCellClick}
      />

      {loading && <Loader open={loading} />}
      <Grid
        container
        width="100%"
        height="calc(100vh - 110px)"
        position="relative"
      >
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
            {/* <MenuIcon /> */}
          </IconButton>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={ClearFormData}
            sx={{
              display: {}, // Show only on smaller screens

              position: "absolute",

              // top: "10px",

              right: "10px",
            }}
          >
            {/* <AddIcon /> */}
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
              Company Details
            </Typography>
          </Grid>

          <Grid
            container
            item
            width={"100%"}
            height={"100%"}
            border={"1px silver solid"}
            component={"form"}
            onSubmit={(e) => {
              e.preventDefault(); // Prevent default submission
              e.stopPropagation(); // Prevent propagation
              handleSubmit(handleSubmitForm)(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
            <Grid
              container
              item
              xs={12}
              width="100%"
              padding={1}
              height="calc(100% - 40px)"
              sx={{ overflowY: "auto", overflowX: "hidden" }}
              position="relative"
            >
              <Box sx={{ width: "100%" }}>
                <Grid item xs={12}>
                  <Tabs
                    value={tabvalue}
                    onChange={handleTabChange}
                    aria-label="disabled tabs example"
                    variant="scrollable" // Allows horizontal scrolling if needed
                    scrollButtons="auto"
                    sx={{
                      "& .MuiTab-root": {
                        textTransform: "none",
                        minWidth: 120,
                        margin: "0 5px",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                        fontWeight: "bold",
                        color: "#555",
                        display: "flex",
                        flexDirection: "row", // icon + label inline
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        minHeight: "46px",
                      },
                      "& .MuiTab-root svg": {
                        fontSize: "20px",
                        color: "#555",
                      },
                      "& .MuiTab-root.Mui-selected": {
                        backgroundColor: "#1976d2",
                        color: "white",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                      },
                      "& .MuiTab-root.Mui-selected svg": {
                        color: "white",
                      },
                      "& .MuiTabs-indicator": {
                        display: "none",
                      },
                    }}
                  >
                    <Tab
                      value={0}
                      sx={{ fontWeight: "bold" }}
                      label="General"
                    />
                    <Tab
                      value={1}
                      sx={{ fontWeight: "bold" }}
                      label="Basic Initialization"
                    />
                    <Tab
                      value={2}
                      sx={{ fontWeight: "bold" }}
                      label="Accounting"
                    />
                  </Tabs>
                  <Divider />
                  {tabvalue === 0 && (
                    <>
                      {/* OUTER WRAPPER — Removed extra space */}
                      <Box sx={{ mt: 2 }}>
                        {/* ======================================================
            ROW 1 : COMPANY LOGOS (4) + COMPANY INFO (8)
      ====================================================== */}
                        <Grid container spacing={2}>
                          {/* LEFT : LOGO AREA (4) */}
                          <Grid item xs={12} sm={12} md={4}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                              }}
                            >
                              <Typography variant="h6" fontWeight={600} mb={2}>
                                Company Logos
                              </Typography>
                              <Divider sx={{ mb: 2 }} />

                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={12} md={12} lg={6}>
                                  <LogoUploadBox
                                    label="Add SideMenu Logo"
                                    logo={logo1}
                                    setLogo={setLogo1}
                                  />
                                </Grid>

                                <Grid item xs={12} sm={12} md={12} lg={6}>
                                  <LogoUploadBox
                                    label="Add Login Logo"
                                    logo={logo2}
                                    setLogo={setLogo2}
                                  />
                                </Grid>
                              </Grid>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={2}
                                textAlign={"center"}
                                sx={{ fontStyle: "italic" }}
                              >
                                Note: Upload logos in 5:3 ratio (e.g., 150×90
                                px).
                              </Typography>
                            </Paper>
                          </Grid>

                          {/* RIGHT : COMPANY INFORMATION (8) */}
                          <Grid item xs={12} md={8}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                              }}
                            >
                              <Typography variant="h6" fontWeight={600} mb={2}>
                                Company Information
                              </Typography>
                              <Divider sx={{ mb: 2 }} />

                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Controller
                                    name="CompnyName"
                                    rules={{
                                      required: "This field is required",
                                    }}
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        label="Company Name"
                                        {...field}
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid item xs={12}>
                                  <Controller
                                    name="CompnyAddr"
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        label="Company Address"
                                        {...field}
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        InputProps={{ readOnly: true }}
                                      />
                                    )}
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>
                        </Grid>

                        {/* ======================================================
            ROW 2 : ADDRESS DETAILS
      ====================================================== */}
                        <Paper
                          elevation={1}
                          sx={{ p: 2, mt: 3, borderRadius: 2 }}
                        >
                          <Typography variant="h6" fontWeight={600} mb={2}>
                            Address Details
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          <Grid container spacing={2}>
                            {/* BLOCK */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="Block"
                                rules={{ required: "Required" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextAreaFields
                                    label="Block"
                                    {...field}
                                    rows={2}
                                    error={!!error}
                                    helperText={error?.message}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateAddress();
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* STREET */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="Street"
                                rules={{ required: "Required" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextAreaFields
                                    label="Street"
                                    {...field}
                                    rows={2}
                                    error={!!error}
                                    helperText={error?.message}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateAddress();
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* CITY */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="City"
                                rules={{ required: "Required" }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextAreaFields
                                    label="City"
                                    {...field}
                                    rows={2}
                                    error={!!error}
                                    helperText={error?.message}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateAddress();
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* ZIP */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="ZipCode"
                                rules={{
                                  pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: "Enter valid 6-digit ZIP",
                                  },
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Zip Code"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                    type="number"
                                    inputProps={{
                                      maxLength: 6,
                                      onInput: (e) => {
                                        if (e.target.value.length > 6) {
                                          e.target.value = e.target.value.slice(
                                            0,
                                            6,
                                          );
                                        }
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* STATE */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="State"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    label="State"
                                    {...field}
                                    data={Outerlistofstate.map((s) => ({
                                      key: s.Code,
                                      value: s.Name,
                                    }))}
                                    disabled={!getValues("Country")}
                                    error={!!error}
                                    helperText={error?.message}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateAddress();
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* COUNTRY */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="Country"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    label="Country"
                                    {...field}
                                    data={listofcountry.map((c) => ({
                                      key: c.CountryCode,
                                      value: c.CountryName,
                                    }))}
                                    error={!!error}
                                    helperText={error?.message}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateAddress();
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* ======================================================
            ROW 3 : CONTACT INFORMATION
      ====================================================== */}
                        <Paper
                          elevation={1}
                          sx={{ p: 2, mt: 3, borderRadius: 2 }}
                        >
                          <Typography variant="h6" fontWeight={600} mb={2}>
                            Contact Information
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          <Grid container spacing={2}>
                            {/* PHONE 1 */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="Phone1"
                                control={control}
                                render={({ field }) => (
                                  <PhoneNumberInput
                                    defaultCountry="in"
                                    value={field.value}
                                    onChange={(phone) => field.onChange(phone)}
                                  />
                                )}
                              />
                            </Grid>

                            {/* PHONE 2 */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="Phone2"
                                control={control}
                                render={({ field }) => (
                                  <PhoneNumberInput
                                    defaultCountry="in"
                                    value={field.value}
                                    label="Telephone 2"
                                    onChange={(phone) => field.onChange(phone)}
                                  />
                                )}
                              />
                            </Grid>

                            {/* EMAIL */}
                            <Grid item xs={12} sm={6} md={4}>
                              <Controller
                                name="Email"
                                rules={{
                                  required: "Required",
                                  pattern: {
                                    value:
                                      /^[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid email format",
                                  },
                                }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="Email"
                                    {...field}
                                    error={!!error}
                                    helperText={error?.message}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    </>
                  )}

                  {tabvalue === 1 && (
                    <>
                      <Grid
                        container
                        spacing={2}
                        justifyContent="center"
                        mt={1}
                        mb={2}
                      >
                        {/* Chart of Accounts Template */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          lg={4}
                          sm={6}
                          textAlign="center"
                        >
                          <Controller
                            name="CompType"
                            rules={{ required: "This field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="Chart of Accounts Template"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                inputProps={{ maxLength: 1 }}
                                rows={1}
                              />
                            )}
                          />
                        </Grid>

                        {/* Local Currency */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          sm={6}
                          lg={4}
                          textAlign="center"
                        >
                          <Controller
                            name="MainCurncy"
                            rules={{ required: "This field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputSearchSelectTextField
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                label="LOCAL CURRENCY"
                                data={currencydata.map((item) => ({
                                  key: item.CurrCode,
                                  value: item.CurrName,
                                }))}
                              />
                            )}
                          />
                        </Grid>

                        {/* System Currency */}
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={4}
                          textAlign="center"
                        >
                          <Controller
                            name="SysCurrncy"
                            rules={{ required: "This field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputSearchSelectTextField
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                label="SYSTEM CURRENCY"
                                data={currencydata.map((item) => ({
                                  key: item.CurrCode,
                                  value: item.CurrName,
                                }))}
                              />
                            )}
                          />
                        </Grid>

                        {/* Default Account Currency */}
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={4}
                          textAlign="center"
                        >
                          <Controller
                            name="DfActCurr"
                            rules={{
                              required:
                                "Please select Default Account Currency",
                            }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputSelectTextField
                                label="Default Account Currency"
                                data={[
                                  { key: "1", value: "All Currency" },
                                  { key: "2", value: "Local Currency" },
                                ]}
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>

                        {/* Item Groups Valuation Method */}
                        <Grid
                          item
                          xs={12}
                          md={6}
                          sm={6}
                          lg={4}
                          textAlign="center"
                        >
                          <Controller
                            name="InvntSystm"
                            rules={{
                              required:
                                "Please select Item Groups Valuation Method",
                            }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputSelectTextField
                                label="Item Groups Valuation Method"
                                data={[
                                  { key: "A", value: "Moving Average" },
                                  { key: "S", value: "Standard" },
                                  { key: "F", value: "FIFO" },
                                ]}
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={4}
                          textAlign="center"
                        ></Grid>
                      </Grid>
                    </>
                  )}

                  {tabvalue === 2 && (
                    <>
                      <Box>
                        <Tabs
                          value={accountingValue}
                          onChange={handleAccountingChange}
                          aria-label="Accounting Sub Tabs"
                        >
                          <Tab label="General" />
                          <Tab label="Excise" />
                        </Tabs>
                        <Divider />

                        {accountingValue === 0 && (
                          <Grid
                            container
                            spacing={2}
                            justifyContent="center"
                            mt={"6px"}
                          >
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="GSTRegnNo"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="GST REGISTRATION NO."
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 15 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="GSTType"
                                // rules={{
                                //   required:
                                //     "Please select Default Account Currency",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputSearchSelectTextField
                                    label="GST Type"
                                    data={[
                                      {
                                        key: "1",
                                        value: "Regular/TDS/ISD  ",
                                      },
                                      {
                                        key: "2",
                                        value: "Casual Taxable Person",
                                      },
                                      {
                                        key: "3",
                                        value: "Composition Levy",
                                      },
                                      {
                                        key: "4",
                                        value: "Government Department or PSU",
                                      },
                                      {
                                        key: "5",
                                        value: "Non Resident Taxable Person",
                                      },
                                      {
                                        key: "6",
                                        value: "UN Agency or Embassy",
                                      },
                                    ]}
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TaxIdNum"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="PAN NO."
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 10 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="RevOffice"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="PAN CIRCLE NO."
                                    {...field}
                                    inputProps={{ maxLength: 100 }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TaxIdNum2"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="PAN WARD NO."
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 32 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TaxIdNum3"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="PAN ACCESSING OFFICER "
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 32 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="FreeZoneNo"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="LST/VAT NO."
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 32 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TaxIdNum5"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="CST NO."
                                    {...field}
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
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="DdctFileNo"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="EXEMPTION NUMBER"
                                    {...field}
                                    inputProps={{ maxLength: 50 }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TaxIdNum4"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="TAN NO."
                                    {...field}
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
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="DdctOffice"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="SERVICE TAX NO"
                                    {...field}
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
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="ServNature"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="SERVICE NATURE"
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 1 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="AssType"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="ASSESSEE TYPE"
                                    {...field}
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
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="CompnyType"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="COMPANY TYPE"
                                    {...field}
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
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="NatureBiz"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="NATURE OF BUSINESS"
                                    {...field}
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
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TaxIdNum6"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="TIN NO."
                                    {...field}
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
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            ></Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            ></Grid>
                          </Grid>
                        )}
                        {accountingValue === 1 && (
                          <Grid
                            container
                            spacing={2}
                            justifyContent="center"
                            mt={"6px"}
                          >
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="EccNo"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="E.C.C. NO."
                                    {...field}
                                    inputProps={{ maxLength: 40 }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="CERegNo"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="C.E. REGISTRATION NO."
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 40 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="CERange"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="C.E. RANGE"
                                    {...field}
                                    inputProps={{ maxLength: 60 }}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="CEDivision"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="C.E. DIVISION"
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 60 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="CeComRate"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="C.E. COMMISSIONERATE"
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 60 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="MenuCode"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="MANUFACTURER CODE"
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 60 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Jurisd"
                                // rules={{
                                //   required: "This field is required",
                                // }}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <InputTextField
                                    label="JURISDICTION"
                                    {...field}
                                    error={!!error}
                                    inputProps={{ maxLength: 60 }}
                                    helperText={error ? error.message : null}
                                    rows={1}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            ></Grid>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={4}
                              sm={6}
                              textAlign={"center"}
                            ></Grid>
                          </Grid>
                        )}
                      </Box>
                      <Divider />

                      <Grid container mt={2}>
                        {/* ----------------------------------------------------------------------------------------------------------------------- */}
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
                            House Bank
                          </Typography>
                        </Grid>

                        {/* ----------------------------------------------------------------------------------------------------------------------- */}
                        <Button
                          color="success"
                          variant="contained"
                          onClick={habdleAddOpen1}
                          sx={{
                            ml: "15px",
                          }}
                        >
                          Add House Bank
                        </Button>

                        <Grid container>
                          <Dialog
                            style={{ margin: "auto" }}
                            open={openadd1}
                            onClose={handleAddClose1}
                            scroll="paper"
                            component={"form"}
                            onSubmit={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSubmitFormAddBank(onSave)(e);
                            }}
                          >
                            <DialogTitle>
                              <Grid
                                item
                                display={"flex"}
                                justifyContent={"center"}
                              >
                                <PersonAddAlt1OutlinedIcon />
                                <Typography
                                  textAlign={"center"}
                                  fontWeight={"bold"}
                                >
                                  &nbsp; &nbsp;ADD BANK ACCOUNT DETAILS
                                </Typography>
                              </Grid>
                            </DialogTitle>
                            <Divider />
                            <DialogContent>
                              <Grid
                                container
                                justifyContent={"space-between"}
                                spacing={2}
                              >
                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="BankCode"
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputSearchSelectTextField
                                        {...field}
                                        label="BANK CODE"
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        data={bankCode.map((item) => ({
                                          key: item.DocEntry,
                                          value: item.BankCode,
                                        }))}
                                        onChange={async (e) => {
                                          const selectedValue = e.target.value;

                                          const selectedBank = bankCode.find(
                                            (bank) =>
                                              bank.DocEntry === selectedValue,
                                          );
                                          field.onChange(e);
                                          if (selectedBank) {
                                            setValueAddBank(
                                              "BankName",
                                              selectedBank.BankName || "",
                                            );
                                            setValueAddBank(
                                              "Country",
                                              selectedBank.CountryCode || "",
                                            );
                                          }
                                          if (selectedBank.CountryCode) {
                                            await ListofState(
                                              selectedBank.CountryCode,
                                            );
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>

                                {/* Bank Name Field */}
                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="BankName"
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="BANK NAME"
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        rows={1}
                                        disabled
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="Country"
                                    rules={{
                                      required: "This field is required",
                                    }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="COUNTRY/REGION"
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        rows={1}
                                        disabled
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="Branch"
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="Branch"
                                        type="text"
                                        inputProps={{ maxLength: 50 }}
                                        {...field}
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
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="Account"
                                    rules={{
                                      required: "This field is required",
                                    }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="A/C NO."
                                        {...field}
                                        disabled={
                                          saveUpdateButtonAB === "UPDATE"
                                        }
                                        inputProps={{ maxLength: 15 }}
                                        error={!!error}
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
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="AcctName"
                                    rules={{
                                      required: "This field is required",
                                    }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="BANK A/C NAME"
                                        {...field}
                                        error={!!error}
                                        inputProps={{ maxLength: 250 }}
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
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="SwiftNum"
                                    // rules={{
                                    //   required: "This field is required",
                                    // }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="BIC/SWIFT/IFSC CODE"
                                        {...field}
                                        inputProps={{ maxLength: 50 }}
                                        error={!!error}
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
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ControlKey"
                                    // rules={{
                                    //   required: "This field is required",
                                    // }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="CONTROL KEY"
                                        {...field}
                                        error={!!error}
                                        inputProps={{ maxLength: 2 }}
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
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="GLAccount"
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        {...field}
                                        label="G/L ACCOUNT"
                                        value={field.value}
                                        error={!!error}
                                        inputProps={{ maxLength: 15 }}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        readOnly
                                        onKeyDown={(e) => {
                                          if (e.key === "Backspace") {
                                            e.preventDefault();

                                            setValueAddBank("GLAccount", "", {
                                              shouldDirty: true,
                                              shouldValidate: true,
                                            });
                                          } else {
                                            e.preventDefault(); // block all other keys
                                          }
                                        }}
                                        InputProps={{
                                          readOnly: true,
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
                                                  setActiveGLField("GLAccount");
                                                  setOpenGLModal(true);
                                                }}
                                              />
                                            </InputAdornment>
                                          ),
                                        }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          field.onChange(value);
                                          // setGLAccountValue(value);
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="GLIntriAct"
                                    control={controlAddBank} // Assuming `control` is from `useForm`
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        {...field}
                                        label="G/L INTERIM ACCOUNT"
                                        value={field.value}
                                        error={!!error}
                                        inputProps={{ maxLength: 15 }}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        readOnly
                                        onKeyDown={(e) => {
                                          if (e.key === "Backspace") {
                                            e.preventDefault();

                                            setValueAddBank("GLIntriAct", "", {
                                              shouldDirty: true,
                                              shouldValidate: true,
                                            });
                                          } else {
                                            e.preventDefault(); // block all other keys
                                          }
                                        }}
                                        InputProps={{
                                          readOnly: true,
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
                                                  setActiveGLField(
                                                    "GLIntriAct",
                                                  );
                                                  setOpenGLModal(true);
                                                }}
                                              />
                                            </InputAdornment>
                                          ),
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="IBAN"
                                    // rules={{
                                    //   required: "This field is required",
                                    // }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="IBAN"
                                        {...field}
                                        error={!!error}
                                        inputProps={{ maxLength: 50 }}
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
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="State"
                                    control={controlAddBank}
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
                                        inputProps={{ maxLength: 3 }}
                                        label="State"
                                        data={listofstate.map((item) => ({
                                          key: item.Code, // this should match the field value
                                          value: item.Name, // show human-readable name
                                        }))}
                                        onChange={(event) => {
                                          const selectedStateCode =
                                            event.target.value;
                                          field.onChange(selectedStateCode);
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="Address"
                                    // rules={{
                                    //   required: "Address is required",
                                    // }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="ADDRESS"
                                        inputProps={{ maxLength: 250 }}
                                        {...field}
                                        error={!!error}
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
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="City"
                                    rules={{ required: "City is required" }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        label="CITY"
                                        {...field}
                                        inputProps={{ maxLength: 100 }}
                                        error={!!error}
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
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ZipCode"
                                    rules={{
                                      pattern: {
                                        value: /^[0-9]{6}$/,
                                        message:
                                          "Enter a valid 6-digit ZIP Code",
                                      },
                                    }}
                                    control={controlAddBank}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <InputTextField
                                        type="number"
                                        label="ZIP CODE"
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                        rows={1}
                                        inputProps={{
                                          maxLength: 6, // Note: this will be ignored for number input
                                          onInput: (e) => {
                                            // Restrict input to 6 digits
                                            if (e.target.value.length > 6) {
                                              e.target.value =
                                                e.target.value.slice(0, 6);
                                            }
                                          },
                                        }}
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="PostOffice"
                                    control={controlAddBank}
                                    defaultValue="N"
                                    render={({ field }) => (
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            {...field}
                                            checked={field.value === "1"}
                                            onChange={(e) => {
                                              const newValue = e.target.checked
                                                ? "1"
                                                : "0";
                                              field.onChange(newValue);
                                              setValueAddBank(
                                                "PostOffice",
                                                newValue,
                                              );
                                            }}
                                          />
                                        }
                                        label="POST OFFICE"
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  md={4}
                                  sm={4}
                                  xs={12}
                                  textAlign={"center"}
                                ></Grid>
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
                                    // onClick={() => {
                                    //   onSave();
                                    // }}
                                  >
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
                        {/* ----------------------------------------------------------------------------------------------------------------------- */}

                        <Grid
                          container
                          item
                          mt={2}
                          sx={{
                            px: 2,
                            width: "100%",
                            height: "300px",
                            marginY: "25px",
                          }}
                        >
                          <Paper sx={{ width: "100%", height: "100%" }}>
                            <DataGrid
                              rows={addBank}
                              columns={addBankCol}
                              getRowId={(row) => row.Account}
                              className="datagrid-style"
                              disableSelectionOnClick
                              initialState={{
                                pagination: {
                                  paginationModel: { pageSize: 10 },
                                },
                              }}
                              pageSizeOptions={[3]}
                              hideFooter
                              sx={{
                                overflow: "auto", // Ensure scrollbar appears on DataGrid
                                maxHeight: "400px", // Set max height to control overflow behavior
                              }}
                            />
                          </Paper>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Grid>
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
                sx={{ color: "white" }}
                color="success"
                type="submit"
                // onClick={HandleOnSave}
                disabled={
                  (buttonLabel === "SAVE" && !perms.IsAdd) ||
                  (buttonLabel !== "SAVE" && !perms.IsEdit)
                }
              >
                {buttonLabel}{" "}
              </Button>
              {/* <Button variant="contained" color="error" disabled>
                CANCEL APPIONTMENT
              </Button> */}
              <PrintMenu
                disabled={buttonLabel === "SAVE"}
                type={type}
                DocEntry={allFormData.DocEntry}
                PrintData={PrintData}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
