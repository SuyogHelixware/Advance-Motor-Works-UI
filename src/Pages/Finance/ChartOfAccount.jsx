import {
  AccountTree as AccountTreeIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ClearIcon from '@mui/icons-material/Clear';

import SearchIcon from '@mui/icons-material/Search';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import {
  InputTextField,
  ModelInputSelectTextField,
  ModelSelectedDatePickerField,
} from "../Components/formComponents";
import { Loader } from "../Components/Loader";
const StyledListItem = styled(ListItem)(
  ({ theme, selected, Levels, disabled }) => {
    const isLight = theme.palette.mode === "light";
    return {
      paddingLeft: theme.spacing(2 + (Levels - 1) * 3),
      backgroundColor: selected
        ? isLight
          ? theme.palette.primary.light
          : theme.palette.primary.dark
        : "transparent",
      borderLeft: selected ? `4px solid ${theme.palette.primary.main}` : "none",
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      "&:hover": {
        backgroundColor: disabled
          ? "transparent"
          : selected
          ? isLight
            ? theme.palette.primary.light
            : theme.palette.primary.dark
          : isLight
          ? theme.palette.grey[300]
          : theme.palette.grey[800],
      },
      marginBottom: theme.spacing(0.5),
      borderRadius: theme.spacing(1),
    };
  }
);

export default function ChartOfAccount() {
  // Initialize 5 drawers
  const { user ,companyData} = useAuth();
  const theme = useTheme();

  const [currencydata, setCurrencydata] = useState([]);
  const [AccountCategoryData, setAccountCategory] = useState([]);
  const [openacc, setopenAccount] = useState(false);
  const [taxcode, setTaxCode] = useState([]);
  const [AccountDetails, setAccountDetail] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
const [accountSearch, setAccountSearch] = useState("");
  const toggleModalSize = () => {
    setIsFullScreen((prev) => !prev);
  };
  const [drawers] = useState([
    { id: "1", AcctName: "Asset" },
    { id: "2", AcctName: "Liability" },
    { id: "3", AcctName: "Equity" },
    { id: "4", AcctName: "Revenue" },
    { id: "5", AcctName: "Expenditure" },
  ]);

  const [selectedDrawer, setSelectedDrawer] = useState(drawers[0]?.id || null);


  const [selectedAccount, setSelectedAccount] = useState();

  // console.log("account.Postable",selectedAccount.Postable)
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());
  const [newAccount, setNewAccount] = useState({
    AcctCode: "",
    AcctName: "",
    Postable: "",
    ActType: "",
    LocManTran: "",
    Finanse: "",
    RevalMatch: "",
    CfwRlvnt: "",
    Levels: 2,
    drawerId: 1,
    ActCurr: "INR",
    FatherNum: null,
    locationOption: "last",
  });
  const [accounts, setAccounts] = useState([]);
  const AccountInitial = {
    CheckBtn: "ValidFor",
    ActId: "",
    ExportCode: "",
    FrgnName: "",
    TaxPostAcc: "",
    DfltTax: "",
    Source: "",
    Category: "",
    Details: "",
    VatChange: "",
    Budget: "",
    ExchRate: "",
    RateTrans: "",
    AccntntCod: "",
    glaccount: "",
  };
  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: AccountInitial, // default selected value
  });
  const {
    control: control1,
    handleSubmit: handleSubmit1,
    watch: watch1,
    setValue: setValue1,
    getValues: getValue1,
    reset: reset1,
  } = useForm({
    defaultValues: {
      Postable: "title",
      ActCurr: "",
      AcctCode: "",
      AcctName: "",
      CheckBtn: "ValidFor",
      ActType: "",
      Levels: "",
      drawerId: "",
      GroupMask: "",
      FatherNum: "",
      locationOption: "first",
      AccntntCod: "",
      FrgnName: "",
      ExportCode: "",
      ActId: "",
      TaxPostAcc: "",
      DfltTax: "",
      Source: "",
      Category: "",
      Details: "",
      VatChange: "",
      Budget: "",
      ExchRate: "",
      RateTrans: "",
      LocManTran: false,
      Finanse: false,
      RevalMatch: false,
      CfwRlvnt: false,
    },
  });
  const alldata = getValue1();
  console.log("getValue1", alldata);

  const ChartOfAccountApi = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/ChartOfAccounts/All`);
      const response = res.data;
      if (response.success === true) {
        setAccounts(response.values);
        setLoading(false);
      } else if (response.success === false) {
        setLoading(false);

        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const CurrencyData = async () => {
    try {
      const res = await apiClient.get(`/Currency/all`);
      const response = res.data;

      if (response.success === true) {
        setCurrencydata(response.values);
      } else if (response.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const AccountCategoryApi = async () => {
    try {
      const res = await apiClient.get(`/AccountCategory/All`);
      const response = res.data;
      if (response.success === true) {
        setAccountCategory(response.values);
      } else if (response.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const taxCodedata = async () => {
    try {
      const res = await apiClient.get(`/TaxCode/all`);
      const response = res.data;
      if (response.success === true) {
        setTaxCode(response.values);
      } else if (response.success === false) {
        Swal.fire({
          title: "Error!",
          text: response.message,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  const AccountType = [
    { key: "I", value: "SALES" },
    { key: "E", value: "EXPENDITURE" },
    { key: "N", value: "OTHER" },
  ];
  useEffect(() => {
    ChartOfAccountApi();
    AccountCategoryApi();
    CurrencyData();
    taxCodedata();
  }, []);
  const handleDrawerClick = (drawerId) => {
    setSelectedDrawer(drawerId);
    const drawerRootAccount = accounts.filter(
      (acc) => acc.GroupMask === drawerId
    );
    console.log("drawer account", drawerRootAccount);
    if (drawerRootAccount.length) {
      setSelectedAccount(drawerRootAccount);
    } else {
      setSelectedAccount(null);
    }
  };
  useEffect(() => {
    if (drawers.length > 0) {
      handleDrawerClick(drawers[0].id); // Auto-select the first drawer
    }
  }, []);

  // Get accounts for a specific drawer (hierarchical structure)
  const getDrawerAccounts = (drawerId) => {

    return accounts
      .filter((acc) => acc.GroupMask === drawerId)
      .sort((a, b) => {
        if (a.Levels !== b.Levels) return a.Levels + b.Levels;
        if (a.FatherNum !== b.FatherNum)
          return (a.FatherNum || 0) - (b.FatherNum || 0);
        return a.position - b.position;
      });
  };

  // Get parent accounts for a given Levels and drawer
  const getParentAccounts = (drawerId, Levels) => {
    if (Levels <= 1) return [];
    return accounts.filter(
      (acc) =>
        acc.GroupMask === String(drawerId) && acc.Levels === String(Levels - 1)
    );
  };

  // Get same Levels accounts for positioning (based on selected parent)
  const getSameLevelsAccounts = (drawerId, Levels, FatherNum = null) => {
    return accounts.filter(
      (acc) =>
        acc.GroupMask === String(drawerId) &&
        acc.Levels === String(Levels) &&
        acc.FatherNum === String(FatherNum) &&
        !acc.isDrawerRoot
    );
  };

  // Get all accounts at a specific Levels in a drawer (for Loc. in Drawer dropdown)
  const getAllAccountsAtLevels = (drawerId, Levels) => {
    return accounts.filter(
      (acc) =>
        acc.GroupMask === drawerId && acc.Levels === Levels && !acc.isDrawerRoot
    );
  };
  // Handle account selection
  const handleAccountSelect = (account) => {
   
    if (account.Levels === "1") return;
    setSelectedAccount(account);
    reset1({
      ...account,
      CheckBtn:
        account.ValidFor === "Y"
          ? "ValidFor"
          : account.FrozenFor === "Y"
          ? "FrozenFor"
          : account.Advance === "Y"
          ? "Advance"
          : "",
          LocManTran:account.LocManTran === "Y" ? true:false,
          Finanse:account.Finanse === "Y" ? true:false,
           RevalMatch:account.RevalMatch === "Y" ? true:false,
          CfwRlvnt:account.CfwRlvnt === "Y" ? true:false
    });
    setShowCreateDialog(false);
  };
  // Handle create account dialog
  const handleCreateAccount = (isSubLevels = true) => {
    if (!selectedAccount) return;
    const newLevels = isSubLevels
      ? parseFloat(selectedAccount.Levels) + parseFloat("1")
      : parseFloat(selectedAccount.Levels);
    const newFatherNum = isSubLevels
      ? selectedAccount.AcctCode
      : selectedAccount.FatherNum;
    setNewAccount({
      AcctCode: "",
      AcctName: "",
      ActCurr: "INR",
      ActType: "N",
      LocManTran:"",
      Finanse: "",
      RevalMatch: "",
      CfwRlvnt: "",
      Postable: "title",
      Levels: Math.min(newLevels, 10), // Max Levels is 5
      drawerId: selectedAccount.GroupMask,
      FatherNum: newFatherNum,
      locationOption: "last",
    });
    setShowCreateDialog(true);
  };

  // Update parent dropdown when Levels or drawer changes
  useEffect(() => {
    if (newAccount.Levels > 1) {
      const parentAccounts = getParentAccounts(
        newAccount.drawerId,
        newAccount.Levels
      );
      if (
        parentAccounts.length > 0 &&
        !parentAccounts.find((p) => p.AcctCode === newAccount.FatherNum)
      ) {
        setNewAccount((prev) => ({
          ...prev,
          FatherNum: parentAccounts[0]?.AcctCode || null,
        }));
      }
    }
  }, [newAccount.Levels, newAccount.drawerId, accounts,newAccount.FatherNum,getParentAccounts]);
  // Submit new account
  const submitNewAccount = () => {
    if (!newAccount.AcctCode.trim()) return;
    const sameLevelsAccounts = getSameLevelsAccounts(
      newAccount.drawerId,
      newAccount.Levels,
      newAccount.FatherNum
    );
    let position = 0;
    if (newAccount.locationOption === "first") {
      position = 0;
      setAccounts((prev) =>
        prev.map((acc) => {
          if (
            acc.drawerId === newAccount.drawerId &&
            acc.Levels === newAccount.Levels &&
            acc.FatherNum === newAccount.FatherNum &&
            !acc.isDrawerRoot
          ) {
            return { ...acc, position: acc.position + 1 };
          }
          return acc;
        })
      );
    } else if (newAccount.locationOption === "last") {
      position = sameLevelsAccounts.length;
    } else if (
      newAccount.locationOption.startsWith("after-") ||
      newAccount.locationOption.startsWith("before-")
    ) {
      const [direction, targetId] = newAccount.locationOption.split("-");
      const targetAccount = sameLevelsAccounts.find(
        (acc) => acc.id === parseInt(targetId)
      );
      if (targetAccount) {
        position =
          direction === "after"
            ? targetAccount.position + 1
            : targetAccount.position;
        // Update positions of affected accounts
        setAccounts((prev) =>
          prev.map((acc) => {
            if (
              acc.drawerId === newAccount.drawerId &&
              acc.Levels === newAccount.Levels &&
              acc.FatherNum === newAccount.FatherNum &&
              acc.position >= position &&
              !acc.isDrawerRoot
            ) {
              return { ...acc, position: acc.position + 1 };
            }
            return acc;
          })
        );
      }
    }
    const newAccountData = {
      DocEntry: "",
      UserId: user.UserId,
      CreatedBy: user.UserName,
      CreatedDate: dayjs(undefined).format("YYYY-MM-DD"),
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DD"),
      ModifiedBy: user.UserName,
      AcctCode: newAccount.AcctCode,
      AcctName: newAccount.AcctName,
      Postable: newAccount.Postable === "active" ? "Y" : "N",
      Levels: String(newAccount.Levels),
      GroupMask: String(newAccount.drawerId),
      FatherNum: newAccount.FatherNum,
      position: position,
      isDrawerRoot: false,
      Status: "1",
      ActCurr: newAccount.ActCurr || "",
      CurrTotal: "0",
      Protected: "N",
      ActType: newAccount.ActType || "N",
      LocManTran: newAccount.LocManTran === true ? "Y" : "N",
      Finanse: newAccount.Finanse === true ? "Y" : "N",
      RealAcct: newAccount.RealAcct || "N",
      RevalMatch: newAccount.RevalMatch === true ? "Y" : "N",
      BlocManPos: newAccount.BlocManPos || "N",
      CfwRlvnt: newAccount.CfwRlvnt === true ? "Y" : "N",
      PrjRelvnt: newAccount.PrjRelvnt || "N",
      CemRelvnt: newAccount.CemRelvnt || "N",
      Dim1Relvnt: newAccount.Dim1Relvnt || "N",
      Budget: newAccount.Budget === true ? "Y" : "N",
      ExportCode: newAccount.ExportCode || "0",
      AccntntCod: newAccount.AccntntCod || "0",
      RateTrans: newAccount.RateTrans === true ? "Y" : "N",
      FrgnName: newAccount.FrgnName || "0",
      Details: newAccount.Details || "",
      ValidFrom:
        dayjs(newAccount.ValidFrom).format("YYYY-MM-DD") ||
        dayjs(undefined).format("YYYY-MM-DD"),
      ValidTo:
        dayjs(newAccount.ValidFrom).format("YYYY-MM-DD") ||
        dayjs(undefined).format("YYYY-MM-DD"),
      ValidComm: newAccount.ValidComm || "",
      FrozenFrom:
        dayjs(newAccount.FrozenFrom).format("YYYY-MM-DD") ||
        dayjs(undefined).format("YYYY-MM-DD"),
      FrozenTo:
        dayjs(newAccount.FrozenTo).format("YYYY-MM-DD") ||
        dayjs(undefined).format("YYYY-MM-DD"),
      FrozenComm: newAccount.FrozenComm || "",
      ExchRate: newAccount.ExchRate === true ? "Y" : "N",
      RevalAcct: newAccount.RevalAcct || "0",
      VatChange: newAccount.VatChange === true ? "Y" : "n",
      Category: newAccount.Category || "0",
      DfltTax: newAccount.DfltTax || "0",
      TaxPostAcc: newAccount.TaxPostAcc || "0",
      CstAccOnly: newAccount.CstAccOnly || "0",
      AlloweFrom: newAccount.AlloweFrom || "0",
      AllowedTo: newAccount.AllowedTo || "0",
      BalanceA: newAccount.BalanceA || "0",
      RmrkTmpt: newAccount.RmrkTmpt || "0",
      Fixed: newAccount.LocManTran === true ? "Y" : "N",
      GrpLine: newAccount.GrpLine || "0",
      ValidFor: newAccount.CheckBtn === "ValidFor" ? "Y" : "N",
      FrozenFor: newAccount.CheckBtn === "FrozenFor" ? "Y" : "N",
      MultiLink: newAccount.MultiLink || "0",
      SysTotal: newAccount.SysTotal || "0",
      FormatCode: newAccount.FormatCode || "0",
      FcTotal: newAccount.FcTotal || "0",
      ActId: newAccount.ActId || "0",
      Advance: newAccount.CheckBtn === "Advance" ? "Y" : "N",
      Counter: newAccount.Counter || "0",
      AccrualTyp: newAccount.AccrualTyp || "0",
      TaxIncome: newAccount.TaxIncome || "0",
      ExmIncome: newAccount.ExmIncome || "0",
      LastRevBal: newAccount.LastRevBal || "0",
      LastRevDat:
        dayjs(newAccount.LastRevDat).format("YYYY-MM-DD") ||
        dayjs(undefined).format("YYYY-MM-DD"),
      MTHCounter: newAccount.MTHCounter || "0",
      PrevYear: newAccount.PrevYear || "0",
      RateDifAct: newAccount.RateDifAct || "0",
      SCAdjust: newAccount.SCAdjust || "0",
      TaxonCode: newAccount.TaxonCode || "0",
      Source: newAccount.Source || "",
    };
    console.log("newAccountData", newAccountData);
    apiClient
      .post(`/ChartOfAccounts`, newAccountData)
      .then((res) => {
        if (res.data.success) {
          ChartOfAccountApi();
          ClearFormData();
          Swal.fire({
            title: "Success!",
            text: "Chart Of Account Successfully",
            icon: "success",
            confirmButtonText: "Ok",
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res.data.message,
            icon: "error",
            confirmButtonText: "Ok",
            // timer: 1000,
          });
        }
      })
      .catch((error) => {
        console.error("Error Post time", error);
        Swal.fire({
          title: "Error!",
          text: "something went wrong" + error,
          icon: "warning",
          confirmButtonText: "Ok",
        });
      });
    // setAccounts((prev) => [...prev, newAccountData]);
    setShowCreateDialog(false);
    setNewAccount({
      AcctCode: "",
      AcctName: "",
      ActCurr: "INR",
      LocManTran: "",
      ActType: "",
      Finanse: "",
      RevalMatch: "",
      CfwRlvnt: "",
      Postable: "N",
      Levels: 2,
      drawerId: 1,
      FatherNum: null,
      locationOption: "last",
    });
  };

  const OnSubmitAccount = (data) => {
    CloseAcoountDetails();
    console.log("===", data);
    setNewAccount((prev) => ({
      ...prev, // keeps previous fields
      ...data, // overwrites with new data fields
    }));
  };
  const CheckBtn=watch1("CheckBtn")
  const OnSubmitUpdate = (data) => {
    console.log("updated Data", data);
    const objUpdate = {
      ...data,
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs(undefined).format("YYYY-MM-DDTHH:MM:SS"),
      VatChange: data.VatChange === true ? "Y" : "N",
      RateTrans: data.RateTrans === true ? "Y" : "N",
      ExchRate: data.ExchRate === true ? "Y" : "N",
       LocManTran: data.LocManTran === true ? "Y" : "N",
       Finanse: data.Finanse === true ? "Y" : "N",
       CfwRlvnt: data.CfwRlvnt === true ? "Y" : "N",
       RevalMatch: data.RevalMatch === true ? "Y" : "N",
      Budget: data.Budget === true ? "Y" : "N",
      ValidFor: CheckBtn === "ValidFor" ? "Y" : "N",
      FrozenFor: CheckBtn === "FrozenFor" ? "Y" : "N",
      Advance: CheckBtn === "Advance" ? "Y" : "N",
    };
    console.log("dfsfs",objUpdate);
    Swal.fire({
      text: `Do You Want Update "${objUpdate.AcctCode}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .put(`/ChartOfAccounts/${data.DocEntry}`, objUpdate)
          .then((response) => {
            if (response.data.success) {
              ChartOfAccountApi();
              ClearFormData();
              // handleAccountSelect(accounts)
                  setSelectedAccount(accounts);
              setAccountDetail(false);
              Swal.fire({
                title: "Success!",
                text: "Chart Of Account  Updated",
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
          .catch(() => {
            Swal.fire({
              title: "Error!",
              text: "something went wrong",
              icon: "warning",
              confirmButtonText: "Ok",
            });
          });
      } else {
        Swal.fire({
          text: "Chart Of Account Not Updated",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
    setAccountDetail(false);
  };
  const CloseAcoountDetails = () => {
    setopenAccount(false);
  };

  const handleDelete = () => {
    Swal.fire({
      text: `Do You Want Deleted" ${alldata.AcctCode}"`,
      icon: "question",
      confirmButtonText: "YES",
      cancelButtonText: "No",
      showConfirmButton: true,
      showDenyButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        apiClient
          .delete(`/ChartOfAccounts/${alldata.DocEntry}`)
          .then((response) => {
            if (response.data.success) {
              ChartOfAccountApi();
              ClearFormData();
              setSelectedAccount();
              setAccountDetail(false);
              reset1();
              Swal.fire({
                title: "Success!",
                text: "Chart Of Accounts Deleted",
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
          .catch(() => {
            Swal.fire({
              title: "Error!",
              text: "something went wrong",
              icon: "warning",
              confirmButtonText: "Ok",
            });
          });
      } else {
        Swal.fire({
          text: "Chart Of Accounts Not Deleted",
          icon: "info",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };
  console.log("fgfgfd", newAccount);
  const ClearFormData = () => {
    reset({
      ActId: "",
      ExportCode: "",
      FrgnName: "",
      TaxPostAcc: "",
      DfltTax: "",
      Source: "",
      Category: "",
      Details: "",
      VatChange: "",
      Budget: "",
      ExchRate: "",
      RateTrans: "",
      AccntntCod: "",
      CheckBtn: "ValidFor",
    });
  };
  const toggleAccountExpansion = (accountCode) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountCode)) {
      newExpanded.delete(accountCode);
    } else {
      newExpanded.add(accountCode);
    }
    setExpandedAccounts(newExpanded);
  };
  // Check if an account has children
  const hasChildren = (accounts, currentLevel, accountCode) => {
    const nextLevel = (parseInt(currentLevel) + 1).toString();
    return accounts.some(
      (acc) => acc.Levels === nextLevel && acc.FatherNum === accountCode
    );
  };
  const hasChildrenMatching = (accounts, fatherCode, search) => {
  const children = accounts.filter(acc => acc.FatherNum === fatherCode);
  return children.some(
    c =>
      c.AcctCode.toLowerCase().includes(search) ||
      c.AcctName.toLowerCase().includes(search) ||
      hasChildrenMatching(accounts, c.AcctCode, search)
  );
};

const filterAccountsBySearch = (accounts, searchQuery) => {
  if (!searchQuery.trim()) {
    return accounts;
  }
  
  const query = searchQuery.toLowerCase();
  return accounts.filter((acc) => {
    return (
      acc.AcctCode?.toLowerCase().includes(query) ||
      acc.AcctName?.toLowerCase().includes(query) ||
      acc.Levels?.toString().includes(query)
    );
  });
};


  // Render account tree
const renderAccountTree = (
  drawerId,
  accounts,
  Levels = "1",
  FatherNum = null
) => {
  const currentLevel = String(Levels);

  const LevelsAccounts = accounts
    .filter(acc => acc.Levels === currentLevel && acc.FatherNum === (FatherNum ?? null))
    .sort((a, b) => a.position - b.position);

  return LevelsAccounts
    .filter(acc => {
      if (!accountSearch) return true; // Show all when no search

      const search = accountSearch.toLowerCase();
      const matches =
        acc.AcctCode.toLowerCase().includes(search) ||
        acc.AcctName.toLowerCase().includes(search)
      // Also include parent if any child matches
      const childMatches = hasChildrenMatching(accounts, acc.AcctCode, search);
      return matches || childMatches;
    })
    .map((account) => {
      const isTitle = account.Postable === "N";
      const hasChildAccounts = hasChildren(accounts, currentLevel, account.AcctCode);
      const isExpanded = expandedAccounts.has(account.AcctCode);
      const showExpandButton = isTitle && hasChildAccounts;

      const highlightText = (text) => {
        if (!accountSearch) return text;
        const regex = new RegExp(`(${accountSearch})`, "gi");
        return text.split(regex).map((part, idx) =>
          regex.test(part) ? (
            <span key={idx} style={{ backgroundColor: "yellow" }}>{part}</span>
          ) : (
            part
          )
        );
      };

      return (
        <Box key={account.AcctCode}>
          <StyledListItem
            selected={selectedAccount?.DocEntry === account.DocEntry}
            Levels={account.Levels}
            readOnly={account.isDrawerRoot}
            disabled={account.Levels === "1"}
            onClick={() => handleAccountSelect(account)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {showExpandButton ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAccountExpansion(account.AcctCode);
                  }}
                  sx={{ padding: 0.5, marginRight: 0.5 }}
                >
                  {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </IconButton>
              ) : (
                <Box sx={{ width: 24, height: 24 }} />
              )}
            </ListItemIcon>

            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={account.isDrawerRoot ? "bold" : "medium"}
                    color={theme.palette.mode === "light" ? "black" : "white"}
                  >
                    Levels {account.Levels}: {highlightText(account.AcctCode)} - {highlightText(account.AcctName)}
                  </Typography>
                  <Chip
                    label={isTitle ? "Title" : "Account"}
                    size="small"
                    color={isTitle ? "warning" : "success"}
                    variant="outlined"
                  />
                  {account.isDrawerRoot && (
                    <Chip
                      label="Drawer Root"
                      size="small"
                      color="default"
                      variant="filled"
                    />
                  )}
                </Box>
              }
            />
          </StyledListItem>

          <Collapse in={!isTitle || !isExpanded} timeout="auto" unmountOnExit>
            {renderAccountTree(
              drawerId,
              accounts,
              (parseInt(currentLevel) + 1).toString(),
              account.AcctCode
            )}
          </Collapse>
        </Box>
      );
    });
};

  return (
    <>
      {loading && <Loader open={loading} />}

      <Grid
        container
        width={"100%"}
        height="calc(100vh - 120px)"
        position={"relative"}
        // component={"form"}
        // onSubmit={handleSubmit(onSubmit)}
      >
        <Grid
          container
          item
          width="100%"
          height="100%"
          // component="form"
          position="relative"
        >
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
              color="primary.main"
              variant="h6"
              // component="h1"
              // gutterBottom
              fontWeight="bold"
            >
              {" "}
              Chart Of Accounts
            </Typography>
          </Grid>
          {/* <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            // onClick={ClearFormData}
            sx={{
              display: {}, // Show only on smaller screens

              position: "absolute",

              // top: "10px",

              right: "10px",
            }}
          >
            <AddIcon />
          </IconButton> */}
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
              // padding={1}
              px={1}
              md={12}
              sm={12}
              height="calc(100% - 40px)"
              overflow={"scroll"}
              sx={{ overflowX: "hidden" }}
              position={"relative"}
              width={"100%"}
              mt={1}
            >
              <Box
                // sx={{
                //   "& .MuiTextField-root": { m: 1 },
                // }}
                noValidate
                autoComplete="off"
                width={"100%"}
              >
                <Grid container>
                  <Grid container spacing={1}>
                    {/* Control Panel */}
                    <Grid item xs={12} lg={5}>
                      {/* <Paper elevation={2} sx={{ p: 2, mb: 2 }}> */}
                      {/* <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}
      >
        <AccountTreeIcon />
        Account({drawers.length})
      </Typography> */}

                      <Box
                        sx={{
                          mb: 1,
                          p: 1,
                          bgcolor: "background.paper",

                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          boxShadow: 2,
                          transition: "box-shadow 0.3s ease-in-out",
                          "&:hover": { boxShadow: 4 },
                        }}
                      >
                        {/* <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
          Select a Drawer
        </Typography>
        <Divider sx={{ mb: 2 }} /> */}
                        <Typography
                          variant="h6"
                          component="h2"
                          gutterBottom
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "primary.main",
                          }}
                        >
                          <AccountTreeIcon />
                          Account({drawers.length})
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {drawers.map((drawer) => (
                            <Chip
                              key={drawer.id}
                              label={drawer.AcctName}
                              variant={
                                selectedDrawer === drawer.id
                                  ? "filled"
                                  : "outlined"
                              }
                              color={
                                selectedDrawer === drawer.id
                                  ? "primary"
                                  : "default"
                              }
                              onClick={() => handleDrawerClick(drawer.id)}
                              sx={{
                                mb: 1,
                                fontWeight: "bold",
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                fontSize: "0.9rem",
                                transition: "all 0.2s",
                                "&:hover": {
                                  cursor: "pointer",
                                  bgcolor:
                                    selectedDrawer === drawer.id
                                      ? "primary.dark"
                                      : "action.hover",
                                },
                              }}
                              clickable
                            />
                          ))}
                        </Stack>
                      </Box>

                      {/* </Paper> */}

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {/* Selected Account Info */}
                        <Card elevation={2}>
                          <CardContent>
                            {/* <Typography
                              variant="h6"
                              gutterBottom
                              color="primary.main"
                            >
                              Selected Account
                            </Typography> */}

                            {selectedAccount ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 0.5,
                                }}
                              >
                                <Alert
                                  severity={
                                    selectedAccount.Postable
                                      ? "success"
                                      : "warning"
                                  }
                                >
                                  {selectedAccount.Postable
                                    ? " Account Selected"
                                    : "Account Not Selected"}
                                </Alert>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    <strong>Account:</strong>{" "}
                                    {selectedAccount.AcctCode}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Name:</strong>{" "}
                                    {selectedAccount.AcctName}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Type:</strong>{" "}
                                    {selectedAccount.Postable === "N"
                                      ? "Title"
                                      : "Account"}{" "}
                                    &nbsp;|&nbsp; <strong>Levels:</strong>{" "}
                                    {selectedAccount.Levels} &nbsp;|&nbsp;{" "}
                                    <strong>Drawer:</strong>{" "}
                                    {
                                      drawers.find(
                                        (d) =>
                                          d.id ===
                                          String(selectedAccount.GroupMask)
                                      )?.AcctName
                                    }
                                  </Typography>
                                  {/* <Typography variant="body2">
                                    <strong>Levels:</strong>{" "}
                                    {selectedAccount.Levels}
                                  </Typography> */}
                                  {/* <Typography variant="body2">
                                    <strong>Drawer:</strong>{" "}
                                    {
                                      drawers.find(
                                        (d) => d.id === selectedAccount.drawerId
                                      )?.AcctName
                                    }
                                  </Typography> */}
                                  {selectedAccount.FatherNum && (
                                    <Typography variant="body2">
                                      <strong>Parent:</strong>{" "}
                                      {
                                        accounts.find(
                                          (a) =>
                                            a.FatherNum ===
                                            selectedAccount.FatherNum
                                        )?.AcctCode
                                      }
                                    </Typography>
                                  )}
                                 {selectedAccount.Postable === "Y" && (
  <Typography variant="body2">
    <strong>Balance:</strong>{" "}
    {(() => {
      const { MainCurncy, SysCurrncy } = companyData;
      const { ActCurr, CurrTotal, FcTotal, SysTotal } = selectedAccount;
      if (MainCurncy === ActCurr) {
        return (
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              display: "inline",
            }}
          >
            {CurrTotal} {ActCurr}
          </Typography>
        );
      }

      // ✅ CASE 2: Account currency matches System Currency
      if (SysCurrncy === ActCurr) {
        return (
          <Stack
            direction="row"
            spacing={1}
            display="inline-flex"
            alignItems="center"
          >
            <Typography variant="body2">
              {CurrTotal} {MainCurncy}
            </Typography>
            <Typography variant="body2">
              | {FcTotal} {ActCurr}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              | {SysTotal} {SysCurrncy}
            </Typography>
          </Stack>
        );
      }

      // ✅ CASE 3: Different currency
      return (
        <Stack
          direction="row"
          spacing={1}
          display="inline-flex"
          alignItems="center"
        >
          <Typography variant="body2">
            {CurrTotal} {MainCurncy}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            | {FcTotal} {ActCurr}
          </Typography>
          <Typography variant="body2">
            | {SysTotal} {SysCurrncy}
          </Typography>
        </Stack>
      );
    })()}
  </Typography>
)}

                                  
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setAccountDetail(true)}
                                    startIcon={<AccountBalanceIcon />}
                                    disabled={!selectedAccount.DocEntry} // Disabled for drawer root
                                    // onClick={() => handleCreateAccount(false)}
                                    color="info"
                                  >
                                    ACCOUNT DETAILS
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <Alert severity="info">
                                Please select an account to perform actions
                              </Alert>
                            )}
                          </CardContent>
                        </Card>

                        {selectedAccount && (
                          <Card elevation={1}>
                            {/* <CardContent> */}
                            <Typography
                              variant="h6"
                              px={1}
                              // gutterBottom
                              color="primary.main"
                            >
                              Account Actions
                            </Typography>
                            {/* </CardContent> */}
                            <CardActions
                              sx={{ flexDirection: "column", gap: 1, p: 1 }}
                            >
                              <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                disabled={selectedAccount.Levels === "1"} // Disabled for drawer root
                                onClick={() => handleCreateAccount(false)}
                                color="primary"
                                // sx={{ py: 1.5 }}
                              >
                                Add Account at Same Levels
                                {/* {selectedAccount.Levels === "1" &&
                                  " (Disabled - Levels 1)"} */}
                              </Button>
                              <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => handleCreateAccount(true)}
                                color="success"
                                disabled={
                                  selectedAccount.Levels >= 10 ||
                                  selectedAccount.Postable === "Y"
                                } // Max Levels is 5
                                // sx={{ py: 1.5 }}
                              >
                                Add Account at SubLevels
                                {
                                  selectedAccount.Levels >= 10
                                  // &&
                                  //   " (Max Levels Reached)"
                                }
                              </Button>
                            </CardActions>
                          </Card>
                        )}
                      </Box>
                    </Grid>
                    {/* Drawers Section */}
                 <Grid item xs={12} lg={7}>
  <Box
    sx={{
      maxHeight: "calc(100vh - 120px)",
      overflowY: "auto",
      pr: 1,
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#c1c1c1",
        borderRadius: "4px",
        "&:hover": {
          background: "#a8a8a8",
        },
      },
    }}
  >
    {(selectedDrawer === null
      ? drawers
      : drawers.filter((d) => d.id === selectedDrawer)
    ).map((drawer) => {
      const drawerAccounts = getDrawerAccounts(drawer.id);
      const filteredCount = accountSearch.trim() 
        ? filterAccountsBySearch(drawerAccounts, accountSearch).length
        : drawerAccounts.length;

      return (
        <Accordion key={drawer.id} sx={{ mb: 2 }} defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: "primary.main", 
              color: "white",
              flexDirection: "column",
              alignItems: "stretch",
              "& .MuiAccordionSummary-content": {
                flexDirection: "column",
                gap: 1,
              }
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AccountTreeIcon />
              <Typography variant="h6">
                {drawer.AcctName}
              </Typography>
              <Chip
                label={`${filteredCount} ${accountSearch.trim() ? "matched" : "accounts"}`}
                size="small"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                }}
              />
            </Box>
            
            {/* Search Field with better styling */}
            <TextField
              size="small"
              placeholder="Search by code, name ..."
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
              onFocus={(e) => e.stopPropagation()}
              sx={{
                mt: 1,
                bgcolor: "rgba(255, 255, 255, 0.95)",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
                endAdornment: accountSearch && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountSearch("");
                      }}
                      edge="end"
                      sx={{ color: "primary.main" }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </AccordionSummary>
          
          <AccordionDetails
            sx={{
              backgroundColor:
                theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
              p: 1,
            }}
          >
            <List
              sx={{
                maxHeight: "calc(100vh - 250px)",
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1c1c1",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "#a8a8a8",
                  },
                },
              }}
              dense
            >
              {filteredCount > 0 ? (
                renderAccountTree(drawer.id, drawerAccounts, "1", null, accountSearch)
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No accounts found matching "{accountSearch}"
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Try searching by account code, name, or level
                  </Typography>
                </Box>
              )}
            </List>
          </AccordionDetails>
        </Accordion>
      );
    })}
  </Box>
</Grid>

                  </Grid>

                  {/* Create Account Dialog */}
                  <Dialog
                    open={showCreateDialog}
                    onClose={() => setShowCreateDialog(false)}
                    maxWidth="md"
                    fullWidth
                  >
                    <DialogTitle>
                      <Typography variant="h5" color="primary.main">
                        Create New Account
                      </Typography>
                      {/* <Typography variant="body2" color="text.secondary">
                        Configure your new account settings
                      </Typography> */}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {/* Account AcctName */}
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <FormControl component="fieldset">
                              <FormLabel
                                component="legend"
                                sx={{
                                  color: "primary.main",
                                  fontWeight: "bold",
                                }}
                              >
                                Account Type
                              </FormLabel>
                              <RadioGroup
                                row
                                value={newAccount.Postable}
                                onChange={(e) =>
                                  setNewAccount((prev) => ({
                                    ...prev,
                                    Postable: e.target.value,
                                  }))
                                }
                              >
                                <FormControlLabel
                                  value="title"
                                  control={<Radio />}
                                  label="Title"
                                />
                                <FormControlLabel
                                  value="active"
                                  control={<Radio />}
                                  label="Account"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Grid>

                          <Grid
                            item
                            lg={6}
                            sm={6}
                            xs={12}
                            mt={3}
                            // textAlign={"center"}
                            // width={220}
                          >
                            <Button
                              color="info"
                              variant="contained"
                              startIcon={<AccountCircleIcon />}
                              onClick={() => setopenAccount(true)}
                              sx={{
                                ml: 2,
                              }}
                            >
                              ACCOUNT DETAILS
                            </Button>
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <TextField
                              label="G/L ACCOUNT"
                              fullWidth
                              size="small"
                              inputProps={{
                                maxLength: 15,
                              }}
                              value={newAccount.AcctCode}
                              onChange={(e) =>
                                setNewAccount((prev) => ({
                                  ...prev,
                                  AcctCode: e.target.value,
                                }))
                              }
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <TextField
                              label="ACCOUNT NAME"
                              size="small"
                              fullWidth
                              value={newAccount.AcctName}
                              inputProps={{
                                maxLength: 100,
                              }}
                              onChange={(e) =>
                                setNewAccount((prev) => ({
                                  ...prev,
                                  AcctName: e.target.value,
                                }))
                              }
                              required
                            />
                          </Grid>
                          {newAccount.Postable === "active" && (
                            <>
                              <Grid item xs={12} sm={6} md={6} lg={6}>
                                <FormControl fullWidth>
                                  <InputLabel>ACCOUNT TYPE</InputLabel>
                                  <Select
                                    value={newAccount.ActType}
                                    label="ACCOUNT TYPE"
                                    size="small"
                                    onChange={(e) =>
                                      setNewAccount((prev) => ({
                                        ...prev,
                                        ActType: e.target.value,
                                      }))
                                    }
                                  >
                                    {AccountType.map((acc) => (
                                      <MenuItem key={acc.key} value={acc.key}>
                                        {acc.value}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6} md={6} lg={6}>
                                <FormControl fullWidth>
                                  <InputLabel>CURRENCY</InputLabel>
                                  <Select
                                    value={newAccount.ActCurr}
                                    label="CURRENCY"
                                    size="small"
                                    onChange={(e) =>
                                      setNewAccount((prev) => ({
                                        ...prev,
                                        ActCurr: e.target.value,
                                      }))
                                    }
                                  >
                                    <MenuItem value="AC">
                                      All Currencies
                                    </MenuItem>
                                    {currencydata.map((cur) => (
                                      <MenuItem
                                        key={cur.CurrCode}
                                        value={cur.CurrCode}
                                      >
                                        {cur.CurrName}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                            </>
                          )}
                        </Grid>

                        <Grid container spacing={2}>
                          {/* Levels Selection */}
                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <FormControl fullWidth>
                              <InputLabel>LEVELS</InputLabel>
                              <Select
                                value={newAccount.Levels}
                                label="LEVELS"
                                size="small"
                                onChange={(e) =>
                                  setNewAccount((prev) => ({
                                    ...prev,
                                    Levels: parseInt(e.target.value),
                                    FatherNum: null,
                                  }))
                                }
                              >
                                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((Levels) => (
                                  <MenuItem key={Levels} value={Levels}>
                                    Levels {Levels}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <FormControl fullWidth>
                              <InputLabel>DRAWER</InputLabel>
                              <Select
                                value={newAccount.drawerId}
                                label="DRAWER"
                                defaultValue={selectedDrawer}
                                size="small"
                                onChange={(e) =>
                                  setNewAccount((prev) => ({
                                    ...prev,
                                    drawerId: parseInt(e.target.value),
                                    FatherNum: null,
                                  }))
                                }
                              >
                                {drawers.map((drawer) => (
                                  <MenuItem key={drawer.id} value={drawer.id}>
                                    {drawer.AcctName}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          {newAccount.Postable === "active" && (
                            <>
                              {["5", "4", "3"].includes(selectedDrawer) ? (
                                <>
                                  {" "}
                                  {selectedDrawer === "2"
                                    ? null
                                    : // <Grid item xs={12} sm={6} md={6} lg={6}>
                                      //   <FormControlLabel
                                      //     control={
                                      //       <Checkbox
                                      //         checked={newAccount.CfwRlvnt}
                                      //         onChange={(e) =>
                                      //           setNewAccount((prev) => ({
                                      //             ...prev,
                                      //             CfwRlvnt: e.target.checked,
                                      //           }))
                                      //         }
                                      //       />
                                      //     }
                                      //     label="CASH FLOW RELEVANT"
                                      //   />
                                      // </Grid>
                                      null}
                                </>
                              ) : (
                                <>
                                  <Grid item xs={12} sm={6} md={6} lg={6}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={newAccount.LocManTran}
                                          onChange={(e) =>
                                            setNewAccount((prev) => ({
                                              ...prev,
                                              LocManTran: e.target.checked,
                                            }))
                                          }
                                        />
                                      }
                                      label="CONTROL ACCOUNT"
                                    />
                                  </Grid>

                                  <Grid item xs={12} sm={6} md={6} lg={6}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={newAccount.Finanse}
                                          onChange={(e) =>
                                            setNewAccount((prev) => ({
                                              ...prev,
                                              Finanse: e.target.checked,
                                            }))
                                          }
                                        />
                                      }
                                      label="CASH A/C"
                                    />
                                  </Grid>
                                  {selectedDrawer === "2" ? null : (
                                    <Grid item xs={12} sm={6} md={6} lg={6}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={newAccount.CfwRlvnt}
                                            onChange={(e) =>
                                              setNewAccount((prev) => ({
                                                ...prev,
                                                CfwRlvnt: e.target.checked,
                                              }))
                                            }
                                          />
                                        }
                                        label="CASH FLOW RELEVANT"
                                      />
                                    </Grid>
                                  )}
                                </>
                              )}

                              <Grid item xs={12} sm={6} md={6} lg={6}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={newAccount.RevalMatch}
                                      onChange={(e) =>
                                        setNewAccount((prev) => ({
                                          ...prev,
                                          RevalMatch: e.target.checked,
                                        }))
                                      }
                                    />
                                  }
                                  label="REVAL(CURRENCY)"
                                />
                              </Grid>
                            </>
                          )}

                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <FormControl fullWidth>
                              <InputLabel>Loc. in Drawer</InputLabel>
                              <Select
                                value={newAccount.locationOption}
                                label="Loc. in Drawer"
                                size="small"
                                onChange={(e) =>
                                  setNewAccount((prev) => ({
                                    ...prev,
                                    locationOption: e.target.value,
                                  }))
                                }
                              >
                                <MenuItem value="first">
                                  First Position
                                </MenuItem>
                                <MenuItem value="last">Last Position</MenuItem>
                                {getSameLevelsAccounts(
                                  newAccount.drawerId,
                                  newAccount.Levels,
                                  newAccount.FatherNum
                                ).flatMap((account) => [
                                  <MenuItem
                                    key={`before-${account.AcctCode}`}
                                    value={`before-${account.AcctCode}`}
                                  >
                                    Before: {account.AcctName}
                                  </MenuItem>,
                                  <MenuItem
                                    key={`after-${account.AcctCode}`}
                                    value={`after-${account.AcctCode}`}
                                  >
                                    After: {account.AcctName}
                                  </MenuItem>,
                                ])}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>

                        <Grid item xs={12} sm={6} md={6} lg={6}>
                          {newAccount.Levels > 1 && (
                            <FormControl fullWidth>
                              <InputLabel>Parent Account</InputLabel>
                              <Select
                                value={newAccount.FatherNum || ""}
                                label="Parent Account"
                                size="small"
                                onChange={(e) =>
                                  setNewAccount((prev) => ({
                                    ...prev,
                                    FatherNum: e.target.value
                                      ? parseInt(e.target.value)
                                      : null,
                                  }))
                                }
                              >
                                {getParentAccounts(
                                  newAccount.drawerId,
                                  newAccount.Levels
                                ).map((account) => (
                                  <MenuItem
                                    key={account.AcctCode}
                                    value={account.AcctCode}
                                  >
                                    {account.AcctName} (Levels
                                    {account.Levels})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Grid>
                        {/* Summary */}
                        <Alert severity="info">
                          <Typography variant="body2">
                            <strong>Summary:</strong> Creating{" "}
                            {newAccount.Postable} account "{newAccount.AcctCode}
                            " at Levels {newAccount.Levels} in{" "}
                            {
                              drawers.find((d) => d.id === newAccount.drawerId)
                                ?.AcctCode
                            }
                            {newAccount.FatherNum && (
                              <>
                                {" "}
                                under parent "
                                {
                                  accounts.find(
                                    (a) => a.id === newAccount.FatherNum
                                  )?.AcctCode
                                }
                                "
                              </>
                            )}
                          </Typography>
                        </Alert>
                      </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowCreateDialog(false)}
                        size="large"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={submitNewAccount}
                        startIcon={<AddIcon />}
                        disabled={!newAccount.AcctCode.trim()}
                        size="large"
                      >
                        Create Account
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <Dialog
                    style={{ margin: "auto" }}
                    open={openacc}
                    onClose={() => setopenAccount(false)}
                    scroll="paper"
                    component={"form"}
                    onSubmit={handleSubmit(OnSubmitAccount)}
                  >
                    <DialogTitle>
                      <Grid item display={"flex"} justifyContent={"center"}>
                        {/* <PersonAddAlt1OutlinedIcon />===== */}
                        <Typography
                          textAlign={"center"}
                          fontWeight={"bold"}
                          variant="h6"
                          color="primary.main"
                        >
                          &nbsp; &nbsp;GL ACCOUNT DETAILS
                        </Typography>
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
                          <AddIcon />
                        </IconButton>
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
                          xs={12}
                          sm={6}
                          md={6}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="adaco"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="G/L ACCOUNT"
                                {...field} // this manages value & onChange
                                readOnly={true}
                                error={!!error}
                                helperText={error ? error.message : null}
                                value={newAccount.AcctCode}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="acName"
                            // rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="ACCOUNT NAME"
                                readOnly={true}
                                //                           {...field}
                                //                           error={!!error}
                                helperText={error ? error.message : null}
                                value={newAccount.AcctName}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="ExportCode"
                            // rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="CODE FOR EXPORTING"
                                inputProps={{
                                  maxLength: 10, // Replace with your desired max length
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
                          xs={12}
                          sm={6}
                          md={6}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="FrgnName"
                            // rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="FOREIGN NAME"
                                type="text"
                                inputProps={{
                                  maxLength: 100, // Replace with your desired max length
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
                          xs={12}
                          sm={6}
                          md={6}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="AccntntCod"
                            // rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="EXTERNAL CODE"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        {newAccount.Postable === "active" && (
                          <>
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="TaxPostAcc"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    label="DEFAULT TAX POSTING ACCOUNT"
                                    data={[
                                      { key: "R", value: "Sales Tax Account" },
                                      {
                                        key: "P",
                                        value: "Purchasing Tax Account",
                                      },
                                    ]}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="DfltTax"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    disabled={watch("TaxPostAcc") === ""}
                                    helperText={error ? error.message : null}
                                    label="DEFAULT TAX CODE"
                                    data={(taxcode || []).map((item) => ({
                                      key: item.DocEntry,
                                      value: item.TaxCode,
                                    }))}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Source"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    label="SOURCE OF CATEGORY"
                                    data={[
                                      { key: "0", value: "" },
                                      { key: "B", value: "BALANCE SHEET" },
                                      { key: "P", value: "PROFIT AND LOSS" },
                                      { key: "O", value: "OTHER" },
                                    ]}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={6}
                              lg={6}
                              textAlign={"center"}
                            >
                              <Controller
                                name="Category"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    label="CATEGORY"
                                    data={AccountCategoryData.filter(
                                      (ctgry) => ctgry.Source === alldata.Source
                                    ).map((catagory) => ({
                                      key: catagory.Source,
                                      value: catagory.Name,
                                    }))}
                                  />
                                )}
                              />
                            </Grid>
                          </>
                        )}

                        {/* <Grid
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          lg={6}
                          textAlign={"center"}
                        >
                          <Controller
                            name="glaccount"
                            // rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="PLANNING LEVEL"
                                type="text"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid> */}
                        <Grid
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          lg={12}
                          textAlign={"center"}
                        >
                          <Controller
                            name="Details"
                            // rules={{ required: "this field is required" }}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                // rows={2}
                                // multiline
                                size="small"
                                sx={{ width: "100%", maxWidth: 500 }}
                                fullWidth
                                label="REMARK"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>

                        {newAccount.Postable === "active" && (
                          <>
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              textAlign="center"
                            >
                              <Controller
                                name="CheckBtn"
                                control={control}
                                render={({ field }) => (
                                  <RadioGroup
                                    {...field}
                                    row
                                    sx={{
                                      justifyContent: "space-around",
                                      gap: 1,
                                    }}
                                  >
                                    <FormControlLabel
                                      value="ValidFor"
                                      control={<Radio  />}
                                      label="ACTIVE"
                                    />
                                    <FormControlLabel
                                      value="FrozenFor"
                                      control={<Radio  />}
                                      label="INACTIVE"
                                    />
                                    <FormControlLabel
                                      value="Advance"
                                      control={<Radio  />}
                                      label="ADVANCED"
                                    />
                                  </RadioGroup>
                                )}
                              />
                            </Grid>
                            {watch("CheckBtn") === "ValidFor" && (
                              <>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ValidFrom"
                                    control={control}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="FROM DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue("ValidFrom", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ValidTo"
                                    control={control}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="TO DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue("ValidTo", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ValidComm"
                                    // rules={{ required: "this field is required" }}
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        size="small"
                                        sx={{ width: "100%", maxWidth: 500 }}
                                        fullWidth
                                        label="REMARK"
                                        inputProps={{
                                          maxLength: 30, // Replace with your desired max length
                                        }}
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                      />
                                    )}
                                  />
                                </Grid>
                              </>
                            )}

                            {watch("CheckBtn") === "FrozenFor" && (
                              <>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="FrozenFrom"
                                    control={control}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="FROM DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue("FrozenFrom", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="FrozenTo"
                                    control={control}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="TO DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue("FrozenTo", newValue, {
                                            shouldDirty: true,
                                          });
                                        }}
                                        // disabled={
                                        //   allFormData.Status === "Closed" ||
                                        //   allFormData.Status === "Cancelled"
                                        // }
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
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="FrozenComm"
                                    // rules={{ required: "this field is required" }}
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        // rows={2}
                                        // multiline
                                        size="small"
                                        inputProps={{
                                          maxLength: 30, // Replace with your desired max length
                                        }}
                                        sx={{ width: "100%", maxWidth: 500 }}
                                        fullWidth
                                        label="REMARK"
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                      />
                                    )}
                                  />
                                </Grid>
                              </>
                            )}
                            {watch("CheckBtn") === "Advance" && (
                              <>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ValidFrom"
                                    control={control}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="FROM DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue("ValidFrom", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ValidTo"
                                    control={control}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="TO DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue("ValidTo", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="ValidComm"
                                    // rules={{ required: "this field is required" }}
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        size="small"
                                        sx={{ width: "100%", maxWidth: 500 }}
                                        fullWidth
                                        label="REMARK"
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
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="FrozenFrom"
                                    control={control}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="FROM DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue("FrozenFrom", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="FrozenTo"
                                    control={control}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="TO DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue("FrozenTo", newValue, {
                                            shouldDirty: true,
                                          });
                                        }}
                                        // disabled={
                                        //   allFormData.Status === "Closed" ||
                                        //   allFormData.Status === "Cancelled"
                                        // }
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
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  textAlign={"center"}
                                >
                                  <Controller
                                    name="FrozenComm"
                                    // rules={{ required: "this field is required" }}
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        // rows={2}
                                        // multiline
                                        size="small"
                                        sx={{ width: "100%", maxWidth: 500 }}
                                        fullWidth
                                        label="REMARK"
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                      />
                                    )}
                                  />
                                </Grid>
                              </>
                            )}

                            {["5", "4"].includes(selectedDrawer) ? null : (
                              <>
                                {" "}
                                <Grid
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                  width={220}
                                >
                                  <Controller
                                    name="RateTrans"
                                    control={control}
                                    defaultValue={false}
                                    // rules={{
                                    //   required: "Please select Vehicle Type",
                                    // }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
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
                                              fontFamily:
                                                "'Open Sans', sans-serif", // Apply font family here
                                            }}
                                          >
                                            RATE CONVERSION
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
                                </Grid>{" "}
                                <Grid
                                  xs={12}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  textAlign={"center"}
                                  width={220}
                                >
                                  <Controller
                                    name="ExchRate"
                                    control={control}
                                    defaultValue={false}
                                    // rules={{
                                    //   required: "Please select Vehicle Type",
                                    // }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
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
                                              fontFamily:
                                                "'Open Sans', sans-serif", // Apply font family here
                                            }}
                                          >
                                            EXCHANGE RATE DIFFERENCE
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
                              </>
                            )}
                            <Grid
                              xs={12}
                              sm={6}
                              md={6}
                              lg={6}
                              textAlign={"center"}
                              width={220}
                            >
                              <Controller
                                name="VatChange"
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
                                        PREMIT OTHER TAX CODE
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
                              xs={12}
                              sm={6}
                              md={6}
                              lg={6}
                              textAlign={"center"}
                              width={220}
                            >
                              <Controller
                                name="Budget"
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
                                        RELEVANT TO BUDGET
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
                          </>
                        )}
                      </Grid>
                    </DialogContent>
                    <Grid
                      container
                      px={2}
                      xs={12}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "end",
                        position: "sticky",
                        bottom: "5px",
                      }}
                    >
                      <Button variant="contained" color="success" type="submit">
                        {/* {saveUpdateButtonAddressType} */}Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={CloseAcoountDetails}
                      >
                        Close
                      </Button>
                    </Grid>
                  </Dialog>
                  <Dialog
                    open={AccountDetails}
                    onClose={() => setAccountDetail(false)}
                    fullWidth
                    fullScreen={isFullScreen}
                    PaperProps={{
                      sx: {
                        width: isFullScreen
                          ? "90%"
                          : {
                              xs: "95%",
                              sm: "90%",
                              md: "85%",
                              lg: "80%",
                              xl: "75%",
                            },
                        maxWidth: isFullScreen ? "none" : "1000px",
                        maxHeight: "95vh",
                        margin: "auto",
                        backgroundColor: "background.paper",
                        borderRadius: isFullScreen ? 0 : 3,
                        boxShadow: isFullScreen
                          ? "none"
                          : "0 8px 32px rgba(0,0,0,0.12)",
                        overflow: "hidden",
                      },
                    }}
                    component={"form"}
                    onSubmit={handleSubmit1(OnSubmitUpdate)}
                  >
                    <DialogTitle
                      sx={{
                        position: "relative",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        py: 3,
                        px: 4,
                        textAlign: "center",
                      }}
                    >
                      {/* Title */}
                      <Typography
                        variant="h5"
                        fontWeight="700"
                        sx={{
                          letterSpacing: "0.5px",
                          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      >
                        Account Details
                      </Typography>

                      {/* Fullscreen IconButton - Left Side */}
                      <IconButton
                        onClick={toggleModalSize}
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 16, // ⬅️ LEFT POSITIONED
                          color: "white",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.2)",
                            transform: "scale(1.05)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        {isFullScreen ? (
                          <FullscreenExitIcon />
                        ) : (
                          <FullscreenIcon />
                        )}
                      </IconButton>

                      {/* Close IconButton - Right Side */}
                      <IconButton
                        onClick={() => setAccountDetail(false)}
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16, // ➡️ RIGHT POSITIONED
                          color: "white",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.2)",
                            transform: "scale(1.05)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>

                    <DialogContent
                      dividers
                      sx={{ px: { xs: 2, sm: 3 }, py: 2 }}
                    >
                      <Grid container spacing={{ xs: 2, sm: 3 }}>
                        {/* Account Type Radio Group */}
                        <Grid item xs={12} md={12} lg={isFullScreen ? 12 : 12}>
                          <FormControl component="fieldset" fullWidth>
                            <FormLabel
                              component="legend"
                              sx={{
                                color: "primary.main",
                                fontWeight: "bold",
                                mb: 1,
                              }}
                            >
                              Account Type
                            </FormLabel>
                            <Controller
                              name="Postable"
                              control={control1}
                              render={({ field }) => (
                                <RadioGroup row {...field}>
                                  <FormControlLabel
                                    value="N"
                                    control={<Radio />}
                                    label="Title"
                                  />
                                  <FormControlLabel
                                    value="Y"
                                    control={<Radio />}
                                    label="Account"
                                  />
                                </RadioGroup>
                              )}
                            />
                          </FormControl>
                        </Grid>

                        {/* G/L Account */}
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={6}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          <Controller
                            name="AcctCode"
                            control={control1}
                            render={({ field }) => (
                              <InputTextField
                                label="G/L ACCOUNT"
                                fullWidth
                                size="small"
                                inputProps={{
                                  maxLength: 15, // Replace with your desired max length
                                }}
                                readOnly={true}
                                required
                                {...field}
                              />
                            )}
                          />
                        </Grid>
                        {/* Account Name */}
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={6}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          <Controller
                            name="AcctName"
                            control={control1}
                            render={({ field }) => (
                              <InputTextField
                                label="ACCOUNT NAME"
                                fullWidth
                                size="small"
                                inputProps={{
                                  maxLength: 100, // Replace with your desired max length
                                }}
                                required
                                {...field}
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          <Controller
                            name="FrgnName"
                            // rules={{ required: "this field is required" }}
                            control={control1}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="FOREIGN NAME"
                                type="text"
                                inputProps={{
                                  maxLength: 100, // Replace with your desired max length
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
                          xs={12}
                          sm={6}
                          md={4}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          <Controller
                            name="AccntntCod"
                            // rules={{ required: "this field is required" }}
                            control={control1}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="EXTERNAL CODE"
                                type="text"
                                inputProps={{
                                  maxLength: 15, // Replace with your desired max length
                                }}
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>
                        {/* Account Type Select */}

                        {/* Drawer */}
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={6}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          <Controller
                            name="GroupMask"
                            control={control1}
                            render={({ field, fieldState: { error } }) => (
                              <ModelInputSelectTextField
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                label="DRAWER"
                                data={drawers.map((item) => ({
                                  key: item.id,
                                  value: item.AcctName,
                                }))}
                              />
                            )}
                          />
                        </Grid>
                        {/* Levels */}
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sm={6}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          <Controller
                            name="Levels"
                            control={control1}
                            render={({ field, fieldState: { error } }) => (
                              <ModelInputSelectTextField
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                                label="LEVELS"
                                data={[2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                  (item) => ({
                                    key: item,
                                    value: item,
                                  })
                                )}
                              />
                            )}
                          />
                        </Grid>
                        {/* Parent Account */}
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          {watch1("Levels") > 1 && (
                            // <FormControl fullWidth>
                            //   <InputLabel>Parent Account</InputLabel>
                            //   <Select
                            //     value={newAccount.FatherNum || ""}
                            //     label="Parent Account"
                            //     size="small"
                            //     onChange={(e) =>
                            //       setNewAccount((prev) => ({
                            //         ...prev,
                            //         FatherNum: e.target.value
                            //           ? parseInt(e.target.value)
                            //           : null,
                            //       }))
                            //     }
                            //   >
                            //     {getParentAccounts(
                            //       newAccount.drawerId,
                            //      watch1("Levels")
                            //     )?.map((account) => (
                            //       <MenuItem
                            //         key={account.AcctCode}
                            //         value={account.AcctCode}
                            //       >
                            //         {account.AcctName} (Levels {account.Levels})
                            //       </MenuItem>
                            //     ))}
                            //   </Select>
                            // </FormControl>

                            <Controller
                              name="FatherNum"
                              control={control1}
                              render={({ field, fieldState: { error } }) => (
                                <ModelInputSelectTextField
                                  {...field}
                                  error={!!error}
                                  helperText={error ? error.message : null}
                                  label="Parent Account"
                                  data={getParentAccounts(
                                    newAccount.drawerId,
                                    watch1("Levels")
                                  )?.map((item) => ({
                                    key: item.AcctCode,
                                    value: item.AcctCode,
                                  }))}
                                />
                              )}
                            />
                          )}
                        </Grid>

                        {/* Location in Drawer */}
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          <FormControl sx={{ width: "100%", maxWidth: 220 }}>
                            <InputLabel>Loc. in Drawer</InputLabel>
                            <Select
                              value={newAccount.locationOption}
                              label="Loc. in Drawer"
                              size="small"
                              onChange={(e) =>
                                setNewAccount((prev) => ({
                                  ...prev,
                                  locationOption: e.target.value,
                                }))
                              }
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 300, // control dropdown height
                                    overflowY: "auto",
                                  },
                                },
                              }}
                            >
                              <MenuItem value="first">First Position</MenuItem>
                              <MenuItem value="last">Last Position</MenuItem>
                              {getSameLevelsAccounts(
                                newAccount.drawerId,
                                newAccount.Levels,
                                newAccount.FatherNum
                              )?.flatMap((account) => [
                                <MenuItem
                                  key={`before-${account.AcctCode}`}
                                  value={`before-${account.AcctCode}`}
                                >
                                  Before: {account.AcctName}
                                </MenuItem>,
                                <MenuItem
                                  key={`after-${account.AcctCode}`}
                                  value={`after-${account.AcctCode}`}
                                >
                                  After: {account.AcctName}
                                </MenuItem>,
                              ])}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Conditional Active Account Fields */}
                        {watch1("Postable") === "Y" && (
                          <>
                            {/* Currency Select */}
                            <Grid
                              item
                              xs={12}
                              md={4}
                              sm={6}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="ActCurr"
                                control={control1}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    label="CURRENCY"
                                    data={[
                                      { key: "AC", value: "All Currencies" },
                                      ...currencydata.map((item) => ({
                                        key: item.CurrCode,
                                        value: item.CurrName,
                                      })),
                                    ]}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={4}
                              sm={6}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="ActType"
                                control={control1}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    label="ACCOUNT TYPE"
                                    data={AccountType.map((item) => ({
                                      key: item.key,
                                      value: item.value,
                                    }))}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={4}
                              sm={6}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="TaxPostAcc"
                                control={control1}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    label="DEFAULT TAX POSTING ACCOUNT"
                                    data={[
                                      { key: "E", value: "" },

                                      { key: "R", value: "Sales Tax Account" },
                                      {
                                        key: "P",
                                        value: "Purchasing Tax Account",
                                      },
                                    ]}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={4}
                              sm={6}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="DfltTax"
                                control={control1}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    disabled={watch1("TaxPostAcc") === ""}
                                    helperText={error ? error.message : null}
                                    label="DEFAULT TAX CODE"
                                    data={(taxcode || []).map((item) => ({
                                      key: item.DocEntry,
                                      value: item.TaxCode,
                                    }))}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={4}
                              sm={6}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="Source"
                                control={control1}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    label="SOURCE OF CATEGORY"
                                    data={[
                                      { key: "0", value: "" },
                                      { key: "B", value: "BALANCE SHEET" },
                                      { key: "P", value: "PROFIT AND LOSS" },
                                      { key: "O", value: "OTHER" },
                                    ]}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={4}
                              sm={6}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="Category"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <ModelInputSelectTextField
                                    {...field}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    label="CATEGORY"
                                    data={AccountCategoryData.filter(
                                      (ctgry) =>
                                        ctgry.Source === watch("Source")
                                    ).map((catagory) => ({
                                      key: catagory.Source,
                                      value: catagory.Name,
                                    }))}
                                  />
                                )}
                              />
                            </Grid>
                          </>
                        )}
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={isFullScreen ? 2 : 3}
                          textAlign="center"
                        >
                          <Controller
                            name="ExportCode"
                            // rules={{ required: "this field is required" }}
                            control={control1}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="CODE FOR EXPORTING"
                                {...field}
                                inputProps={{
                                  maxLength: 10, // Replace with your desired max length
                                }}
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
                          md={4}
                          lg={isFullScreen ? 4 : 6}
                          textAlign="center"
                        >
                          <Controller
                            name="Details"
                            // rules={{ required: "this field is required" }}
                            control={control1}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                // rows={2}
                                // multiline
                                inputProps={{
                                  maxLength: 100, // Replace with your desired max length
                                }}
                                size="small"
                                sx={{ width: "100%", maxWidth: 500 }}
                                fullWidth
                                label="REMARK"
                                {...field}
                                error={!!error}
                                helperText={error ? error.message : null}
                              />
                            )}
                          />
                        </Grid>

                        {watch1("Postable") === "Y" && (
                          <>
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="LocManTran"
                                control={control1}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        {...field}
                                        checked={field.value}
                                      />
                                    }
                                    label="CONTROL ACCOUNT"
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="Finanse"
                                control={control1}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        {...field}
                                        checked={field.value}
                                      />
                                    }
                                    label="CASH A/C"
                                  />
                                )}
                              />
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              lg={isFullScreen ? 2 : 3}
                              textAlign="center"
                            >
                              <Controller
                                name="RevalMatch"
                                control={control1}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        {...field}
                                        checked={field.value}
                                      />
                                    }
                                    label="REVAL(CURRENCY)"
                                  />
                                )}
                              />
                            </Grid>
                            {selectedDrawer === "2" ? (
                              ""
                            ) : (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={isFullScreen ? 2 : 3}
                                textAlign="center"
                              >
                                <Controller
                                  name="CfwRlvnt"
                                  control={control1}
                                  render={({ field }) => (
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label="CASH FLOW RELEVANT"
                                    />
                                  )}
                                />
                              </Grid>
                            )}

                            <Grid
                              item
                              xs={12}
                              md={12}
                              sm={6}
                              lg={isFullScreen ? 6 : 6}
                              textAlign="center"
                            >
                              <Controller
                                name="CheckBtn"
                                control={control1}
                                render={({ field }) => (
                                  <RadioGroup
                                    {...field}
                                    row
                                    sx={{
                                      justifyContent: "space-around",
                                      gap: 1,
                                    }}
                                  >
                                    <FormControlLabel
                                      value="ValidFor"
                                      // value={alldata.ValidFor}
                                      control={<Radio />}
                                      label="ACTIVE"
                                    />
                                    <FormControlLabel
                                      value="FrozenFor"
                                      control={<Radio />}
                                      label="INACTIVE"
                                    />
                                    <FormControlLabel
                                      value="Advance"
                                      control={<Radio />}
                                      label="ADVANCED"
                                    />
                                  </RadioGroup>
                                )}
                              />
                            </Grid>

                            {watch1("CheckBtn") === "ValidFor" && (
                              <>
                                <Grid
                                  item
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 2 : 3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="ValidFrom"
                                    control={control1}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="FROM DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue1("ValidFrom", newValue, {
                                            shouldDirty: true,
                                          });
                                        }}
                                        error={!!error}
                                        helperText={error?.message ?? null}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 2 : 3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="ValidTo"
                                    control={control1}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="TO DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue1("ValidTo", newValue, {
                                            shouldDirty: true,
                                          });
                                        }}
                                        error={!!error}
                                        helperText={error?.message ?? null}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  md={12}
                                  sm={6}
                                  lg={isFullScreen ? 4 : 6}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="ValidComm"
                                    control={control1}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        // rows={2}
                                        // multiline
                                        size="small"
                                        sx={{ width: "100%", maxWidth: 500 }}
                                        inputProps={{
                                          maxLength: 30, // Replace with your desired max length
                                        }}
                                        fullWidth
                                        label="REMARK"
                                        {...field}
                                        error={!!error}
                                        helperText={error?.message ?? null}
                                      />
                                    )}
                                  />
                                </Grid>
                              </>
                            )}

                            {watch1("CheckBtn") === "FrozenFor" && (
                              <>
                                <Grid
                                  item
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 2 : 3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="FrozenFrom"
                                    control={control1}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="FROM DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue1("FrozenFrom", newValue, {
                                            shouldDirty: true,
                                          });
                                        }}
                                        error={!!error}
                                        helperText={error?.message ?? null}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 2 : 3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="FrozenTo"
                                    control={control1}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="TO DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue1("FrozenTo", newValue, {
                                            shouldDirty: true,
                                          });
                                        }}
                                        error={!!error}
                                        helperText={error?.message ?? null}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={isFullScreen ? 4 : 6}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="FrozenComm"
                                    control={control1}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        // rows={2}
                                        // multiline
                                        size="small"
                                        sx={{ width: "100%", maxWidth: 500 }}
                                        inputProps={{
                                          maxLength: 30, // Replace with your desired max length
                                        }}
                                        fullWidth
                                        label="REMARK"
                                        {...field}
                                        error={!!error}
                                        helperText={error?.message ?? null}
                                      />
                                    )}
                                  />
                                </Grid>
                              </>
                            )}
                            {watch1("CheckBtn") === "Advance" && (
                              <>
                                <Grid
                                  item
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 2 : 3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="ValidFrom"
                                    control={control1}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="FROM DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue1("ValidFrom", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 2 : 3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="ValidTo"
                                    control={control1}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="TO DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue1("ValidTo", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 4 : 6}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="ValidComm"
                                    // rules={{ required: "this field is required" }}
                                    control={control1}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        size="small"
                                        sx={{ width: "100%", maxWidth: 500 }}
                                        inputProps={{
                                          maxLength: 30, // Replace with your desired max length
                                        }}
                                        fullWidth
                                        label="REMARK"
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
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 2 : 3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="FrozenFrom"
                                    control={control1}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="FROM DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue1("FrozenFrom", newValue, {
                                            shouldDirty: true,
                                          });
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
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 2 : 3}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="FrozenTo"
                                    control={control1}
                                    // rules={{ required: "Date is Required" }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <ModelSelectedDatePickerField
                                        label="TO DATE"
                                        name={field.name}
                                        value={
                                          field.value
                                            ? dayjs(field.value)
                                            : undefined
                                        }
                                        onChange={(newValue) => {
                                          setValue1("FrozenTo", newValue, {
                                            shouldDirty: true,
                                          });
                                        }}
                                        // disabled={
                                        //   allFormData.Status === "Closed" ||
                                        //   allFormData.Status === "Cancelled"
                                        // }
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
                                  xs={12}
                                  md={4}
                                  sm={6}
                                  lg={isFullScreen ? 4 : 6}
                                  textAlign="center"
                                >
                                  <Controller
                                    name="FrozenComm"
                                    // rules={{ required: "this field is required" }}
                                    control={control1}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        // rows={2}
                                        // multiline
                                        inputProps={{
                                          maxLength: 30, // Replace with your desired max length
                                        }}
                                        size="small"
                                        sx={{ width: "100%", maxWidth: 500 }}
                                        fullWidth
                                        label="REMARK"
                                        {...field}
                                        error={!!error}
                                        helperText={
                                          error ? error.message : null
                                        }
                                      />
                                    )}
                                  />
                                </Grid>
                              </>
                            )}
                            {/* Checkbox Fields */}
                            {[
                              {
                                name: "VatChange",
                                label: "PREMIT OTHER TAX CODE",
                              },
                              { name: "RateTrans", label: "RATE CONVERSION" },
                              {
                                name: "ExchRate",
                                label: "EXCHANGE RATE DIFFERENCE",
                              },
                              { name: "Budget", label: "RELEVANT TO BUDGET" },
                            ].map(({ name, label }) => (
                              <Grid
                                key={name}
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={isFullScreen ? 3 : 3}
                                width={220}
                                textAlign="center"
                              >
                                <Controller
                                  name={name}
                                  control={control1}
                                  defaultValue={false}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
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
                                          noWrap
                                          sx={{
                                            fontFamily:
                                              "'Open Sans', sans-serif",
                                          }}
                                        >
                                          {label}
                                        </Typography>
                                      }
                                      sx={{
                                        textAlign: "center",
                                        width: 200,
                                        whiteSpace: "normal",
                                        fontFamily: "'Open Sans', sans-serif",
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                            ))}
                          </>
                        )}
                      </Grid>
                    </DialogContent>

                    {/* Action Buttons */}
                    <DialogActions
                      sx={{
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        size="medium"
                        variant="contained"
                        color="success"
                        type="submit"
                        fullWidth={isFullScreen}
                        sx={{
                          minWidth: { xs: "100%", sm: "120px" },
                          order: { xs: 2, sm: 1 },
                        }}
                      >
                        UPDATE
                      </Button>
                      <Button
                        size="medium"
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        fullWidth={isFullScreen}
                        sx={{
                          minWidth: { xs: "100%", sm: "120px" },
                          order: { xs: 1, sm: 2 },
                        }}
                      >
                        DELETE
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
