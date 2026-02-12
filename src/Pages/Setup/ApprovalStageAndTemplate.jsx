import AddIcon from "@mui/icons-material/Add";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import RuleIcon from "@mui/icons-material/Rule";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import Select from "react-select";

import { TabContext, TabPanel } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { DataGrid } from "@mui/x-data-grid";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import {
  InputSelectTextField,
  InputTextField,
} from "../Components/formComponents";

import dayjs from "dayjs";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import useAuth from "../../Routing/AuthContext";
import apiClient from "../../services/apiClient";
import CardComponent from "../Components/CardComponent";
import { Loader } from "../Components/Loader";
import SearchInputField from "../Components/SearchInputField";
import usePermissions from "../Components/usePermissions";
const moduleToGroup = {
  "Sales – A/R": "Document",
  "Purchasing – A/P": "Document",
  Inventory: "Inventory",
  Payment: "Payment",
  "Internal Requisition": "Internal Requisition",
  "Inventory Counting Transaction": "Inventory Counting Transaction",
};
const dummyDocumentTypes = [
  // Sales – A/R
  { id: 23, name: "Sales Quotation", module: "Sales – A/R" },
  { id: 17, name: "Sales Order", module: "Sales – A/R" },
  { id: 15, name: "Sales Delivery", module: "Sales – A/R" },
  { id: 16, name: "Sales Return", module: "Sales – A/R" },
  { id: 203, name: "A/R Down Payment", module: "Sales – A/R" },
  { id: 13, name: "A/R Invoice", module: "Sales – A/R" },
  { id: 14, name: "A/R Credit Memo", module: "Sales – A/R" },

  // Purchasing – A/P
  {
    id: 1470000113,
    name: "Purchase Request",
    module: "Internal Requisition", // ✅ moved here
  },
  { id: 540000006, name: "Purchase Quotation", module: "Purchasing – A/P" },
  { id: 22, name: "Purchase Order", module: "Purchasing – A/P" },
  { id: 20, name: "Goods Receipt PO", module: "Purchasing – A/P" },
  { id: 21, name: "Goods Returns", module: "Purchasing – A/P" },
  { id: 204, name: "A/P Down Payment", module: "Purchasing – A/P" },
  { id: 18, name: "A/P Invoice", module: "Purchasing – A/P" },
  { id: 19, name: "A/P Credit Memo", module: "Purchasing – A/P" },

  // Inventory
  { id: 59, name: "Goods Receipt", module: "Inventory" },
  { id: 60, name: "Goods Issue", module: "Inventory" },
  { id: 67, name: "Inventory Transfer", module: "Inventory" },
  { id: 310000001, name: "Inventory Opening Balance", module: "Inventory" },

  // Payment
  { id: 46, name: "Outgoing Payment", module: "Payment" },

  // Inventory Counting Transaction
  {
    id: 1470000065,
    name: "Inventory Counting",
    module: "Inventory Counting Transaction",
  },
  {
    id: 10000071,
    name: "Inventory Posting",
    module: "Inventory Counting Transaction",
  },
];

// const Terms = [
//   { key: 1, value: "Deviation from Credit Limit" },
//   { key: 2, value: "Deviation from Commitment" },
//   { key: 3, value: "Gross Profit %" },
//   { key: 4, value: "Discount %" },
//   { key: 5, value: "Deviation from Budget" },
//   { key: 6, value: "Total Document" },
// ];
const ALL_TERMS = {
  DOCUMENT: [
    { key: 1, value: "Deviation from Credit Limit" },
    { key: 2, value: "Deviation from Commitment" },
    { key: 3, value: "Gross Profit %" },
    { key: 4, value: "Discount %" },
    { key: 5, value: "Deviation from Budget" },
    { key: 6, value: "Total Document" },
  ],

  INVENTORY: [
    { key: 101, value: "Quality" },
    { key: 102, value: "Item Code" },
    { key: 103, value: "Total" },
    { key: 6, value: "Total Document" },
  ],

  PAYMENT: [{ key: 6, value: "Total Document" }],
  INTERNAL_REQUISITION: [
    { key: 101, value: "Quality" },
    { key: 102, value: "Item Code" },
    { key: 103, value: "Total" },
    { key: 6, value: "Total Document" },
  ],

  INVENTORY_COUNTING: [
    { key: 102, value: "Item Code" },
    { key: 103, value: "Total" },
    { key: 6, value: "Total Document" },
    { key: 104, value: "Counted Quantity" },
    { key: 105, value: "Variance" },
    { key: 106, value: "Variance %" },
  ],
};

const buildConditionRows = (terms) =>
  terms.map((term) => ({
    id: term.key,
    choose: false,
    CondId: term.value,
    opCode: "",
    opValue: "",
  }));

const Ratios = [
  { id: "gt", name: "Greater Than >" },
  { id: "gte", name: "Less Than <" },
  { id: "eq", name: "Equal To =" },
  { id: "gte", name: "Greater Than or Equal To >=" },
  { id: "lte", name: "Less Than or Equal To <=" },
  // { id: 6, name: "Not Equal To", code: "!=" },
];

const exclusiveGroups = [
  "Document",
  "Inventory",
  "Payment",
  "Internal Requisition",
  "Inventory Counting Transaction",
];

export default function ApprovalStageAndTemplate() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mainTabValue, setMainTabValue] = React.useState("0");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const [userList, setUserList] = useState([]);
  const [DeptList, setDeptList] = useState([]);
  const [selectedData, setSelectedData] = useState([]);

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [SaveUpdateName, setSaveUpdateName] = useState("SAVE");
  const [selectedRadioGroup, setSelectedRadioGroup] = useState("Inventory");

  const [openListData, setOpenListData] = useState([]);
  const [openListPage, setOpenListPage] = useState(0);
  const [openListquery, setOpenListQuery] = useState("");
  const [openListSearching, setOpenListSearching] = useState(false);
  const [hasMoreOpen, setHasMoreOpen] = useState(true);

  const timeoutRef = useRef(null);
  const { user } = useAuth();
  const perms = usePermissions(51);

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      Name: "",
      Remarks: "",
      NoOfStage: "",
      MaxReqr: "1",
      Status: 1,
      Originator: [],
      documentTypes: [],
      Conds: "always",
      conditionsGridData: [],
      QueriesRows: [],
      approvalStages: [],
    },
  });

  const QueriesRows = useMemo(() => watch("QueriesRows") || [], [watch]);
  const QueriesRowsRef = useRef(QueriesRows);
  // useEffect(() => {
  //   let termsToApply = [];

  //   switch (selectedRadioGroup) {
  //     case "Document":
  //       // 🔥 Keep existing terms exactly as they are
  //       return;

  //     case "Inventory":
  //     case "Internal Requisition": // Purchase Request
  //       termsToApply = ALL_TERMS.INVENTORY;
  //       break;

  //     case "Payment":
  //       termsToApply = ALL_TERMS.PAYMENT;
  //       break;

  //     case "Inventory Counting Transaction":
  //       termsToApply = ALL_TERMS.INVENTORY_COUNTING;
  //       break;

  //     default:
  //       termsToApply = ALL_TERMS.INVENTORY;
  //   }

  //   setValue("conditionsGridData", buildConditionRows(termsToApply));
  // }, [selectedRadioGroup, setValue]);

  useEffect(() => {
    QueriesRowsRef.current = QueriesRows;
  }, [QueriesRows]);

  useEffect(() => {
    getUsers();
    getDepts();
    fetchOpenListData(0);
  }, []);

  const approvalStages = watch("approvalStages");
  const approvalStagesRef = useRef(approvalStages);
  const templateTermsWatch = watch("Conds");
  const conditionsGridDataWatch = watch("conditionsGridData");
  const selectedTerms = (conditionsGridDataWatch || []).filter(
    (row) => row.choose,
  );
  useEffect(() => {
    approvalStagesRef.current = approvalStages;
    setValue("NoOfStage", approvalStages.length);
  }, [approvalStages, setValue]);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/Users/All`);
      const data = res.data.values || [];
      const filteredData = data.filter((user) => user.Status === "1");
      setUserList(filteredData);
    } catch (error) {
      console.error("Error fetching Users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch users. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getDepts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/Department/All`);
      const data = res.data.values || [];
      const filteredData = data.filter((dept) => dept.Status === "1");
      setDeptList(filteredData);
    } catch (error) {
      console.error("Error while fetching Department:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch Departments.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), []);
  const getIdsForGroup = useCallback(
    (groupName) =>
      dummyDocumentTypes
        .filter((doc) => {
          if (groupName === "Document") {
            // Special handling: "Document" includes Sales – A/R and Purchasing – A/P
            return (
              doc.module === "Sales – A/R" || doc.module === "Purchasing – A/P"
            );
          }
          // Default: Match exact module
          return doc.module === groupName;
        })
        .map((doc) => doc.id),
    [],
  );
  const resetFormForNewTemplate = useCallback(() => {
    reset({
      Name: "",
      Remarks: "",
      NoOfStage: "",
      MaxReqr: "1",
      Status: 1,
      Originator: [],
      documentTypes: [],
      Conds: "always",
      conditionsGridData: buildConditionRows(ALL_TERMS.INVENTORY),
      QueriesRows: [],
      approvalStages: [],
    });
    setSelectedData([]);
    setSelectedRadioGroup("Inventory");
    setSaveUpdateName("SAVE");
  }, [reset]);

  const handleMainTabChange = useCallback((event, newValue) => {
    setMainTabValue(newValue);
  }, []);

  // ============================================Approval Stage Functions====================================
  const handleDeleteStageRow = useCallback(
    (id) => {
      const updatedRows = approvalStagesRef.current.filter(
        (row) => row.id !== id,
      );
      setValue(
        "approvalStages",
        updatedRows.map((row, index) => ({
          ...row,
          id: index + 1,
        })),
      );
    },
    [setValue],
  );

  const addStageRow = useCallback(() => {
    const prevRows = approvalStagesRef.current;
    const newRow = {
      id: prevRows.length > 0 ? Math.max(...prevRows.map((r) => r.id)) + 1 : 1,
      AuthUSERID: "",
      Dept: "",
    };
    setValue("approvalStages", [...prevRows, newRow]);
  }, [setValue]);

  const handleStageFieldChange = useCallback(
    (id, field, value) => {
      const updatedStages = approvalStagesRef.current.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      );
      setValue("approvalStages", updatedStages);
    },
    [setValue],
  );

  const memoizedUserListOptions = useMemo(
    () =>
      userList.map((item) => ({
        key: item.DocEntry,
        // value: item.DocEntry,
        value: `${item.FirstName} ${item.LastName}`,
      })),
    [userList],
  );

  const memoizedDeptListOptions = useMemo(
    () =>
      DeptList.map((item) => ({
        key: item.DocEntry,
        // value: item.DocEntry, // Use DocEntry as value for consistency
        value: item.Name,
      })),
    [DeptList],
  );

  const stageColumns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      {
        field: "AuthUSERID",
        headerName: "Authorizer",
        width: 280,
        renderCell: (params) => {
          // Convert all used IDs to the same type as keys (string)
          const usedLevels = approvalStagesRef.current
            .filter((row) => row.id !== params.row.id) // exclude current row
            .map((row) => String(row.AuthUSERID)) // convert to string
            .filter(Boolean);

          return (
            <InputSelectTextField
              value={params.row.AuthUSERID || ""} // current value
              data={memoizedUserListOptions.map((u) => ({
                ...u,
                key: String(u.key), // ensure keys are strings
              }))}
              usedLevels={usedLevels} // pass as strings
              onChange={(event) =>
                handleStageFieldChange(
                  params.row.id,
                  "AuthUSERID",
                  Number(event.target.value), // store as number if needed
                )
              }
            />
          );
        },
      },

      {
        field: "Dept",
        headerName: "Department",
        width: 280,
        renderCell: (params) => (
          <InputSelectTextField
            value={params.row.Dept}
            data={memoizedDeptListOptions}
            onChange={(event) =>
              handleStageFieldChange(
                params.row.id,
                "Dept",
                Number(event.target.value), // Ensure value is number if DocEntry is number
              )
            }
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        sortable: false,
        renderCell: (params) => (
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteStageRow(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        ),
      },
    ],
    [
      handleDeleteStageRow,
      handleStageFieldChange,
      memoizedUserListOptions,
      memoizedDeptListOptions,
    ],
  );

  // ============================================Approval Template Functions====================================
  const handleSaveTemplate = async (data) => {
    if (
      data.Conds === "conditional" &&
      (!data.conditionsGridData ||
        data.conditionsGridData.filter((c) => c.choose).length === 0)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "At least one condition is required when 'When the following Applies' is selected.",
      });
      return;
    }

    if (!data.Originator || data.Originator.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "At least one originator is required.",
      });
      return;
    }
    if (!data.documentTypes || data.documentTypes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Select at least one Document.",
      });
      return;
    }
    if (!data.approvalStages || data.approvalStages.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "At least one authorizer is required.",
      });
      return;
    }

    // ✅ Validate that all approval stages have AuthUSERID
    const missingAuthUser = data.approvalStages.find(
      (stage) => !stage.AuthUSERID,
    );

    if (missingAuthUser) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Each stage must have an Authorizer.",
      });
      return; // stop execution
    }

    // Check termlines required fields (CondId, opCode, opValue)
    const invalidCondition = data.conditionsGridData
      .filter((c) => c.choose)
      .find(
        (c) => !c.id || !c.opCode || c.opValue === "" || c.opValue === null,
      );

    if (invalidCondition) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Each selected condition must have Term, Operator, and Value filled.",
      });
      return;
    }

    // 2️⃣ BUILD PAYLOAD ONLY IF VALIDATION PASSES
    const commonPayloadFields = {
      DocEntry: selectedTemplateId ? String(selectedTemplateId) : 0,
      UserId: user.UserId,
      CreatedBy: data.CreatedBy || user.UserName,
      CreatedDate:
        data.CreatedDate || dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      ModifiedBy: user.UserName,
      ModifiedDate: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      Status: data.Status,
    };

    const payload = {
      ...commonPayloadFields,
      Name: data.Name,
      Remarks: data.Remarks,
      Conds: data.Conds === "always" ? "N" : "Y",
      MaxReqr: parseInt(data.MaxReqr, 10),

      // ✅ User Lines
      oUsersLines: data.Originator.map((originator) => ({
        LineNum: originator.LineNum || 0,
        ...commonPayloadFields,
        OriginUSERID: originator.value,
        U_NAME: originator.label,
        Dept: "",
      })),

      // ✅ Stagesconst userObj = userList.find((u) => Number(u.DocEntry) === stage.AuthUSERID);

      oStagesLines: data.approvalStages.map((stage) => {
        // Find the user object from userList based on AuthUSERID
        const userObj = userList.find(
          (u) => Number(u.DocEntry) === Number(stage.AuthUSERID),
        );

        return {
          LineNum: stage.LineNum || 0,
          ...commonPayloadFields,
          AuthUSERID: stage.AuthUSERID,
          U_NAME: userObj
            ? `${userObj.FirstName || ""} ${userObj.LastName || ""}`
            : "",
          Dept: String(stage.Dept),
          // Include the full user object if needed
          userDetails: userObj || null,
        };
      }),

      // ✅ Documents
      oDocsLines: data.documentTypes
        .map((doc) => ({
          LineNum: doc.LineNum || 0,
          ...commonPayloadFields,
          TransType: String(doc.id),
        }))
        .filter(Boolean),

      // ✅ Term Lines
      oTermsLines:
        data.Conds === "conditional"
          ? data.conditionsGridData
              .filter((condition) => condition.choose)
              .map((condition) => ({
                LineNum: condition.LineNum || 0,
                ...commonPayloadFields,
                CondId: condition.id,
                opCode: condition.opCode,
                opValue: String(condition.opValue),
              }))
          : [],

      // ✅ Query Lines – Only include if Conds is conditional
      oQueriesLines:
        data.Conds === "conditional"
          ? data.QueriesRows.map((query) => ({
              LineNum: query.LineNum || 0,
              ...commonPayloadFields,
              QueryId: query.QueryId,
            }))
          : [],
    };

    // 3️⃣ PROCEED WITH API CALL
    try {
      setLoading(true);
      if (SaveUpdateName === "SAVE") {
        const response = await apiClient.post(`/ApprovalProcedure`, payload);
        const { success } = response.data;
        if (success) {
          resetFormForNewTemplate();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            title: "Success!",
            text: "Approval Template is added",
            icon: "success",
            timer: 1000,
          });
        }
      } else {
        const confirmResult = await Swal.fire({
          text: "Do you want to update ?",
          icon: "question",
          confirmButtonText: "YES",
          cancelButtonText: "No",
          showConfirmButton: true,
          showDenyButton: true,
        });

        if (confirmResult.isConfirmed) {
          const response = await apiClient.put(
            `/ApprovalProcedure/${selectedTemplateId}`,
            payload,
          );

          const { success } = response.data;
          if (success) {
            resetFormForNewTemplate();
            setOpenListPage(0);
            setOpenListData([]);
            fetchOpenListData(0);
            Swal.fire({
              title: "Success!",
              text: "Approval Template is Updated",
              icon: "success",
              timer: 1000,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error saving template:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to ${
          SaveUpdateName === "SAVE" ? "add" : "update"
        } Approval Template. ${error.response?.data?.message || ""}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) {
      Swal.fire({
        icon: "warning",
        title: "No Template Selected",
        text: "Please select an approval template to delete.",
      });
      return;
    }
    try {
      const result = await Swal.fire({
        text: "Do You Want to Delete ?",
        icon: "question",
        confirmButtonText: "YES",
        cancelButtonText: "No",
        showConfirmButton: true,
        showDenyButton: true,
      });

      if (result.isConfirmed) {
        setLoading(true);
        const response = await apiClient.delete(
          `/ApprovalProcedure/${selectedTemplateId}`,
        );
        const { success, message } = response.data;
        setLoading(false);
        if (success) {
          resetFormForNewTemplate();
          setOpenListPage(0);
          setOpenListData([]);
          fetchOpenListData(0);
          Swal.fire({
            text: " Approval Template Deleted",
            icon: "success",
            toast: true,
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            title: success,
            text: message,
            icon: "info",
            toast: true,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    } catch (error) {
      console.error("Error deleting Approval Template:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while deleting the Template",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conditionsGridDataWatch || conditionsGridDataWatch.length === 0) {
      setValue(
        "conditionsGridData",
        ALL_TERMS.INVENTORY.map((term) => ({
          // ✅ FIXED: Use the INVENTORY array
          id: term.key,
          choose: false,
          CondId: term.value,
          opCode: "",
          opValue: "",
        })),
      );
    }
  }, [conditionsGridDataWatch, setValue]);

  const handleUpdateCondition = useCallback(
    (id, field, value) => {
      const updatedConditions = conditionsGridDataWatch.map((condition) => {
        if (condition.id === id) {
          let newValue = value;

          // ✅ Only apply range validation for "opValue" field of specific terms
          if (field === "opValue") {
            if (
              condition.CondId === "Gross Profit %" ||
              condition.CondId === "Discount %"
            ) {
              // Convert to number safely
              const numericValue = Number(value);

              if (numericValue > 100) newValue = 100;
              if (numericValue < 0) newValue = 0;
            }
          }

          return { ...condition, [field]: newValue };
        }
        return condition;
      });

      setValue("conditionsGridData", updatedConditions);
    },
    [conditionsGridDataWatch, setValue],
  );

  const memoizedRatiosOptions = useMemo(
    () =>
      Ratios.map((item) => ({
        key: item.id,
        value: item.name, // Use code for ratio value
        // label: item.name,
      })),
    [],
  );

  const conditionsGridColumns = useMemo(
    () => [
      {
        field: "choose",
        headerName: "Choose",
        width: 100,
        renderCell: (params) => (
          <Checkbox
            checked={params.value === true}
            onChange={(e) =>
              handleUpdateCondition(params.row.id, "choose", e.target.checked)
            }
            size="small"
            color="primary"
          />
        ),
      },
      {
        field: "CondId",
        headerName: "Term",
        width: 220,
        renderCell: (params) => <span>{params.value}</span>,
      },
      {
        field: "opCode",
        headerName: "Ratio",
        width: 280,
        renderCell: (params) => (
          <InputSelectTextField
            value={params.row.opCode} // store CODE
            data={memoizedRatiosOptions}
            disabled={!params.row.choose}
            renderValue={(value) =>
              memoizedRatiosOptions.find((o) => o.value === value)?.label || ""
            }
            onChange={(e) =>
              handleUpdateCondition(params.row.id, "opCode", e.target.value)
            }
          />
        ),
      },
      {
        field: "opValue",
        headerName: "Value",
        width: 150,
        renderCell: (params) => (
          <TextField
            value={params.value}
            type="number"
            disabled={!params.row.choose} // ✅ Disabled until checkbox is checked
            onChange={(e) =>
              handleUpdateCondition(params.row.id, "opValue", e.target.value)
            }
            size="small"
            fullWidth
          />
        ),
      },
    ],
    [handleUpdateCondition, memoizedRatiosOptions],
  );

  const handleAddQueryRow = useCallback(() => {
    const newRow = {
      id:
        QueriesRowsRef.current.length > 0
          ? Math.max(...QueriesRowsRef.current.map((r) => r.id)) + 1
          : 1,
      QueryId: "",
    };
    setValue("QueriesRows", [...QueriesRowsRef.current, newRow]);
  }, [setValue]);

  const handleQueryFieldChange = useCallback(
    (id, value) => {
      const updatedRows = QueriesRowsRef.current.map((row) =>
        row.id === id ? { ...row, QueryId: value } : row,
      );
      setValue("QueriesRows", updatedRows, {
        shouldValidate: false,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const handleDeleteQueryRow = useCallback(
    (id) => {
      const newRows = QueriesRowsRef.current
        .filter((row) => row.id !== id)
        .map((row, index) => ({ ...row, id: index + 1 }));
      setValue("QueriesRows", newRows);
    },
    [setValue],
  );

  const QueriesColumns = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 70,
      },
      {
        field: "QueryId",
        headerName: "Queries",
        width: 300,
        renderCell: (params) => (
          <TextField
            value={params.value || ""}
            size="small"
            fullWidth
            onChange={(e) =>
              handleQueryFieldChange(params.row.id, e.target.value)
            }
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        sortable: false,
        renderCell: (params) => (
          <IconButton onClick={() => handleDeleteQueryRow(params.row.id)}>
            <DeleteIcon color="error" />
          </IconButton>
        ),
      },
    ],
    [handleQueryFieldChange, handleDeleteQueryRow],
  );

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

  const fetchMoreOpenListData = () => {
    fetchOpenListData(openListPage + 1, openListSearching ? openListquery : "");
    setOpenListPage((prev) => prev + 1);
  };

  const fetchOpenListData = async (pageNum = 0, searchTerm = "") => {
    try {
      const params = {
        Status: 1,
        Limit: 20,
        Offset: pageNum * 20,
      };
      if (searchTerm) {
        params.SearchText = searchTerm;
      }
      const response = await apiClient.get("/ApprovalProcedure", { params });
      if (response.data.success) {
        const newData = response.data.values;
        setHasMoreOpen(newData.length === params.Limit);
        setOpenListData((prev) =>
          pageNum === 0 ? newData : [...prev, ...newData],
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  //========================================set data===============================================
  const setApprovalData = async (DocEntry) => {
    if (!DocEntry) return;
    setValue("Originator", []);
    try {
      setLoading(true);
      const response = await apiClient.get(`/ApprovalProcedure/${DocEntry}`);
      const data = response.data.values;

      // Merge conditionsGridData

      // Determine selected radio group
      let currentSelectedRadioGroup = "";
      if (data.oDocsLines && data.oDocsLines.length > 0) {
        for (let docLine of data.oDocsLines) {
          const docModule = dummyDocumentTypes.find(
            (d) => String(d.id) === String(docLine.TransType),
          )?.module;
          if (docModule && moduleToGroup[docModule]) {
            currentSelectedRadioGroup = moduleToGroup[docModule];
            break; // Stop at the first match (assumes one group per template)
          }
        }
      }
      if (!currentSelectedRadioGroup) {
        currentSelectedRadioGroup = "Inventory"; // Default fallback
      }
      let termsArray = [];
      switch (currentSelectedRadioGroup) {
        case "Document":
          termsArray = ALL_TERMS.DOCUMENT;
          break;
        case "Inventory":
          termsArray = ALL_TERMS.INVENTORY;
          break;
        case "Internal Requisition": // Purchase Request
          termsArray = ALL_TERMS.INTERNAL_REQUISITION;
          break;
        case "Payment":
          termsArray = ALL_TERMS.PAYMENT;
          break;
        case "Inventory Counting Transaction":
          termsArray = ALL_TERMS.INVENTORY_COUNTING;
          break;
        default:
          termsArray = ALL_TERMS.INVENTORY; // Fallback
      }
      const initialConditions = termsArray.map((term) => ({
        id: term.key,
        choose: false,
        CondId: term.value,
        opCode: "",
        opValue: "",
        LineNum: 0,
      }));
      const mergedConditions = initialConditions.map((initialTerm) => {
        const apiTerm = data.oTermsLines?.find(
          (t) => t.CondId === initialTerm.id,
        );
        if (apiTerm) {
          return {
            ...initialTerm,
            choose: true,
            opCode: apiTerm.opCode,
            opValue: apiTerm.opValue,
            LineNum: apiTerm.LineNum,
          };
        }
        return initialTerm;
      });
      if (!currentSelectedRadioGroup) {
        currentSelectedRadioGroup = "Inventory";
      }

      // Reset form with fetched values
      reset({
        Name: data.Name,
        Remarks: data.Remarks,
        MaxReqr: data.MaxReqr?.toString() || "1",
        Status: data.Status,
        Conds: data.Conds === "N" ? "always" : "conditional",

        documentTypes:
          data.oDocsLines?.map((docLine) => ({
            id: Number(docLine.TransType),
            LineNum: docLine.LineNum || 0,
          })) || [],
        conditionsGridData: mergedConditions,
        QueriesRows:
          data.oQueriesLines?.map((query, index) => ({
            ...query,
            id: index + 1,
          })) || [],
        approvalStages:
          data.oStagesLines?.map((stage, index) => ({
            ...stage,
            id: index + 1,
          })) || [],
        CreatedDate:
          data.CreatedDate || dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        CreatedBy: data.CreatedBy,
      });
      setSelectedRadioGroup(currentSelectedRadioGroup);

      const originatorOptions =
        data.oUsersLines?.map((u) => ({
          value: u.OriginUSERID,
          label: u.U_NAME,
          LineNum: u.LineNum || 0,
        })) || [];

      setValue("Originator", originatorOptions);
      setSaveUpdateName("UPDATE");
      setSelectedTemplateId(DocEntry);
      setSelectedData(DocEntry);
      toggleDrawer();
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while fetching the approval template data.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  };

  const mainTabData = useMemo(
    () => [
      { label: "Documents", icon: <ArticleIcon /> },
      { label: "Authorization", icon: <VerifiedUserIcon /> },
      { label: "Terms", icon: <RuleIcon /> },
    ],
    [],
  );

  // Helper component for rendering document checkboxes
  const DocumentCheckboxGroup = ({
    title,
    documents,
    field,
    handleCheckboxChange,
  }) => (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        {title}
      </Typography>
      {/* Changed Grid container to Stack for vertical layout */}
      <Stack spacing={0.5}>
        {documents.map((doc) => (
          <FormControlLabel
            key={doc.id}
            control={
              <Checkbox
                checked={field.value.some((d) => d.id === doc.id)}
                onChange={() => handleCheckboxChange(doc.id)}
              />
            }
            label={doc.name}
          />
        ))}
      </Stack>
    </Paper>
  );

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
          Approval Templates List
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
          container
          item
          width={"100%"}
          height={"100%"}
          sx={{
            backgroundColor:
              theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
          }}
        >
          <Grid item md={12} sm={12} width={"100%"} height={`100%`}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                px: 1,
                overflow: "scroll",
                overflowX: "hidden",
                typography: "body1",
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
                  backgroundColor:
                    theme.palette.mode === "light" ? "#F5F6FA" : "#080D2B",
                  zIndex: 1,
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
                  <CardComponent
                    key={i}
                    title={item.Name}
                    subtitle={item.Remarks}
                    isSelected={selectedData === item.DocEntry}
                    searchResult={openListquery}
                    onClick={() => setApprovalData(item.DocEntry)}
                  />
                ))}
              </InfiniteScroll>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  return (
    <>
      {loading && <Loader open={loading} />}
      <Grid
        container
        width={"100%"}
        height="calc(100vh - 110px)"
        position={"relative"}
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
          position="relative"
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{
              display: { lg: "none" },
              position: "absolute",
              left: "10px",
              zIndex: 1,
            }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="add new template"
            onClick={resetFormForNewTemplate}
            sx={{
              position: "absolute",
              right: "10px",
              zIndex: 1,
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
              Approval Templates
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
                width={"100%"}
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                }}
                noValidate
                autoComplete="off"
              >
                <Grid container width={"100%"}>
                  <Box sx={{ width: "100%", p: 1 }}>
                    <AppBar
                      position="static"
                      sx={{ backgroundColor: "transparent", boxShadow: "none" }}
                    >
                      <Grid container>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={4}
                          textAlign={"center"}
                        >
                          <Controller
                            name="Name"
                            control={control}
                            rules={{
                              required: "Name is required",
                              validate: (value) => {
                                const str = (value ?? "").toString().trim();
                                return str !== "" || "Name cannot be empty";
                              },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="NAME"
                                type="text"
                                {...field}
                                disabled={SaveUpdateName === "UPDATE"}
                                error={!!error}
                                inputProps={{ maxLength: 20 }}
                                helperText={error ? error.message : null}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={4}
                          textAlign={"center"}
                        >
                          <Controller
                            name="Remarks"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="DESCRIPTION"
                                type="text"
                                {...field}
                                error={!!error}
                                inputProps={{ maxLength: 100 }}
                                helperText={error ? error.message : null}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={4}
                          textAlign={"center"}
                        >
                          <Controller
                            name="NoOfStage"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <InputTextField
                                label="NO OF STAGES"
                                type="text"
                                {...field}
                                disabled
                                error={!!error}
                                inputProps={{ maxLength: 100 }}
                                helperText={error ? error.message : null}
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={4}
                          textAlign={"center"}
                        >
                          <Controller
                            name="MaxReqr"
                            control={control}
                            defaultValue={1}
                            render={({ field }) => (
                              <InputTextField
                                label="NO OF APPROVER"
                                type="number"
                                {...field}
                                fullWidth
                                inputProps={{
                                  min: 1,
                                  max: userList.length,
                                }}
                                onChange={(e) => {
                                  let value = Number(e.target.value);
                                  if (value > userList.length)
                                    value = userList.length;
                                  if (value < 1) value = 1;
                                  field.onChange(value);
                                }}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={4}
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Controller
                            name="Originator"
                            control={control}
                            render={({ field, fieldState: { error } }) => {
                              const isLight = theme.palette.mode === "light";

                              const options = userList.map((user) => ({
                                value: Number(user.DocEntry),
                                label: `${user.FirstName} ${user.LastName}`,
                              }));

                              return (
                                <Box
                                  sx={{
                                    width: "100%",
                                    maxWidth: 220,
                                    textAlign: "left",
                                  }}
                                >
                                  {/* ✅ Label Added (same style as first select) */}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.85rem",
                                      color: isLight ? "#555" : "#ddd",
                                      mb: 0.5,
                                    }}
                                  >
                                    ORIGINATORS
                                  </Typography>

                                  <Select
                                    isMulti
                                    options={options}
                                    value={
                                      Array.isArray(field.value)
                                        ? field.value.map((val) =>
                                            typeof val === "object"
                                              ? val
                                              : options.find(
                                                  (o) => o.value === val,
                                                ) || {
                                                  value: val,
                                                  label: "",
                                                },
                                          )
                                        : []
                                    }
                                    onChange={(selected) => {
                                      const newValue = selected.map((s) => {
                                        const existing = Array.isArray(
                                          field.value,
                                        )
                                          ? field.value.find(
                                              (v) =>
                                                (typeof v === "object"
                                                  ? v.value
                                                  : v) === s.value,
                                            )
                                          : null;

                                        return {
                                          value: s.value,
                                          label: s.label,
                                          LineNum: existing?.LineNum || 0,
                                        };
                                      });

                                      field.onChange(newValue);
                                    }}
                                    placeholder="Select originators..."
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    components={{
                                      DropdownIndicator: () => null,
                                      IndicatorSeparator: () => null,
                                    }}
                                    styles={{
                                      container: (provided) => ({
                                        ...provided,
                                        width: "100%",
                                      }),
                                      control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: isLight
                                          ? "#F5F6FA"
                                          : "#060B27",
                                        boxShadow: state.isFocused
                                          ? "0 0 0 1px #2684FF"
                                          : "none",
                                        borderColor: state.isFocused
                                          ? "#2684FF"
                                          : provided.borderColor,
                                        "&:hover": {
                                          borderColor: "#2684FF",
                                        },
                                      }),
                                      option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isSelected
                                          ? "#f0f0f0"
                                          : state.isFocused
                                            ? "#e6f0ff"
                                            : "transparent",
                                        color: "black",
                                      }),
                                      menu: (provided) => ({
                                        ...provided,
                                        zIndex: 9999,
                                      }),
                                      menuList: (provided) => ({
                                        ...provided,
                                        maxHeight: 250,
                                        overflowY: "auto",
                                      }),
                                      valueContainer: (provided) => ({
                                        ...provided,
                                        maxHeight: "80px",
                                        overflowY: "auto",
                                        flexWrap: "wrap",
                                      }),
                                      multiValue: (provided) => ({
                                        ...provided,
                                        margin: "2px",
                                      }),
                                    }}
                                  />

                                  {/* Error Message */}
                                  {error && (
                                    <Typography
                                      sx={{
                                        color: "red",
                                        fontSize: "0.75rem",
                                        mt: 0.5,
                                      }}
                                    >
                                      {error.message}
                                    </Typography>
                                  )}
                                </Box>
                              );
                            }}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={4}
                          textAlign={"center"}
                          alignItems={"center"}
                          display="flex"
                          justifyContent="center"
                        >
                          <Controller
                            name="Status"
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                sx={{ color: "gray" }}
                                control={
                                  <Checkbox
                                    checked={field.value === 1}
                                    onChange={(e) =>
                                      field.onChange(e.target.checked ? 1 : 0)
                                    }
                                  />
                                }
                                label="Active"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />

                      <TabContext value={mainTabValue}>
                        <Tabs
                          value={mainTabValue}
                          onChange={handleMainTabChange}
                          variant="scrollable"
                          scrollButtons="auto"
                          allowScrollButtonsMobile
                          aria-label="main approval tabs"
                          sx={{
                            "& .MuiTab-root": {
                              textTransform: "none",
                              minWidth: 120,
                              margin: "0 5px",
                              borderRadius: "8px",
                              backgroundColor:
                                theme.palette.mode === "light"
                                  ? "#fff"
                                  : grey[800],
                              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                              fontWeight: "bold",
                              color:
                                theme.palette.mode === "light"
                                  ? "#555"
                                  : grey[300],
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              minHeight: "46px",
                            },
                            "& .MuiTab-root svg": {
                              fontSize: "20px",
                              color:
                                theme.palette.mode === "light"
                                  ? "#555"
                                  : grey[300],
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
                          {mainTabData.map((tab, index) => (
                            <Tab
                              key={tab.label}
                              value={String(index)}
                              label={tab.label}
                              icon={tab.icon}
                              iconPosition="start"
                            />
                          ))}
                        </Tabs>
                        <Box
                          sx={{
                            backgroundColor:
                              theme.palette.mode === "light"
                                ? "#fafafa"
                                : "#1a1a1a",
                            p: 3,
                            borderRadius: 3,
                            boxShadow: "0px 6px 16px rgba(0,0,0,0.1)",
                            mt: 2,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: "calc(100vh - 450px)",
                          }}
                        >
                          {/* Documents Tab Content */}
                          <TabPanel value="0" sx={{ p: 0, pt: 2 }}>
                            <Controller
                              name="documentTypes"
                              control={control}
                              render={({ field }) => {
                                const handleCheckboxChange = (docId) => {
                                  const isSelected = field.value.some(
                                    (d) => d.id === docId,
                                  );
                                  let newSelected;

                                  if (isSelected) {
                                    newSelected = field.value.filter(
                                      (d) => d.id !== docId,
                                    );
                                  } else {
                                    newSelected = [
                                      ...field.value,
                                      { id: docId, LineNum: 0 },
                                    ];
                                  }
                                  field.onChange(newSelected);
                                };

                                return (
                                  <Stack spacing={2}>
                                    <Grid container spacing={2}>
                                      {/* Exclusive Groups */}
                                      <Grid item xs={12} md={12} lg={12}>
                                        <Paper sx={{ p: 2, height: "100%" }}>
                                          <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            mb={1}
                                          >
                                            Select Document Group
                                          </Typography>
                                          <RadioGroup
                                            row
                                            value={selectedRadioGroup}
                                            onChange={(e) => {
                                              const newGroup = e.target.value;
                                              let cleanedSelection =
                                                field.value;
                                              if (selectedRadioGroup) {
                                                const prevGroupIds =
                                                  getIdsForGroup(
                                                    selectedRadioGroup,
                                                  );
                                                cleanedSelection =
                                                  cleanedSelection.filter(
                                                    (d) =>
                                                      !prevGroupIds.includes(
                                                        d.id,
                                                      ),
                                                  );
                                              }
                                              setSelectedRadioGroup(newGroup);
                                              field.onChange(cleanedSelection);

                                              // ✅ NEW: Manually reset conditionsGridData when user changes group
                                              let termsToApply = [];
                                              switch (newGroup) {
                                                case "Document":
                                                  termsToApply =
                                                    ALL_TERMS.DOCUMENT; // ✅ FIXED: Changed from DOCUMENTS to DOCUMENT
                                                  break;
                                                case "Inventory":
                                                case "Internal Requisition":
                                                  termsToApply =
                                                    ALL_TERMS.INVENTORY;
                                                  break;
                                                case "Payment":
                                                  termsToApply =
                                                    ALL_TERMS.PAYMENT;
                                                  break;
                                                case "Inventory Counting Transaction":
                                                  termsToApply =
                                                    ALL_TERMS.INVENTORY_COUNTING;
                                                  break;
                                                default:
                                                  termsToApply =
                                                    ALL_TERMS.INVENTORY;
                                              }
                                              setValue(
                                                "conditionsGridData",
                                                buildConditionRows(
                                                  termsToApply,
                                                ),
                                              );
                                            }}
                                          >
                                            {exclusiveGroups.map((group) => (
                                              <FormControlLabel
                                                key={group}
                                                value={group}
                                                control={<Radio />}
                                                label={group}
                                              />
                                            ))}
                                          </RadioGroup>
                                          <Divider sx={{ my: 2 }} />
                                          {selectedRadioGroup && (
                                            <Stack spacing={1}>
                                              {selectedRadioGroup ===
                                              "Document" ? (
                                                <Grid container spacing={2}>
                                                  {/* SALES COLUMN */}
                                                  <Grid item xs={12} md={6}>
                                                    <Typography
                                                      variant="body2"
                                                      fontWeight="bold"
                                                      mb={0.5}
                                                    >
                                                      Sales – A/R
                                                    </Typography>

                                                    <Stack spacing={0.5}>
                                                      {dummyDocumentTypes
                                                        .filter(
                                                          (doc) =>
                                                            doc.module ===
                                                            "Sales – A/R",
                                                        )
                                                        .map((doc) => (
                                                          <FormControlLabel
                                                            key={doc.id}
                                                            control={
                                                              <Checkbox
                                                                checked={field.value.some(
                                                                  (d) =>
                                                                    d.id ===
                                                                    doc.id,
                                                                )}
                                                                onChange={() =>
                                                                  handleCheckboxChange(
                                                                    doc.id,
                                                                  )
                                                                }
                                                              />
                                                            }
                                                            label={doc.name}
                                                          />
                                                        ))}
                                                    </Stack>
                                                  </Grid>

                                                  {/* PURCHASE COLUMN */}
                                                  <Grid item xs={12} md={6}>
                                                    <Typography
                                                      variant="body2"
                                                      fontWeight="bold"
                                                      mb={0.5}
                                                    >
                                                      Purchasing – A/P
                                                    </Typography>

                                                    <Stack spacing={0.5}>
                                                      {dummyDocumentTypes
                                                        .filter(
                                                          (doc) =>
                                                            doc.module ===
                                                            "Purchasing – A/P",
                                                        )
                                                        .map((doc) => (
                                                          <FormControlLabel
                                                            key={doc.id}
                                                            control={
                                                              <Checkbox
                                                                checked={field.value.some(
                                                                  (d) =>
                                                                    d.id ===
                                                                    doc.id,
                                                                )}
                                                                onChange={() =>
                                                                  handleCheckboxChange(
                                                                    doc.id,
                                                                  )
                                                                }
                                                              />
                                                            }
                                                            label={doc.name}
                                                          />
                                                        ))}
                                                    </Stack>
                                                  </Grid>
                                                </Grid>
                                              ) : (
                                                // OTHER RADIO GROUPS (Inventory, Payment, etc.)
                                                dummyDocumentTypes
                                                  .filter(
                                                    (doc) =>
                                                      doc.module ===
                                                      selectedRadioGroup,
                                                  )
                                                  .map((doc) => (
                                                    <FormControlLabel
                                                      key={doc.id}
                                                      control={
                                                        <Checkbox
                                                          checked={field.value.some(
                                                            (d) =>
                                                              d.id === doc.id,
                                                          )}
                                                          onChange={() =>
                                                            handleCheckboxChange(
                                                              doc.id,
                                                            )
                                                          }
                                                        />
                                                      }
                                                      label={doc.name}
                                                    />
                                                  ))
                                              )}
                                            </Stack>
                                          )}
                                        </Paper>
                                      </Grid>
                                    </Grid>
                                  </Stack>
                                );
                              }}
                            />
                          </TabPanel>

                          {/* Stages Tab Content */}
                          <TabPanel value="1" sx={{ p: 0, pt: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                              }}
                            >
                              <Box sx={{ pb: 1 }}>
                                <IconButton
                                  size="small"
                                  sx={{
                                    backgroundColor: "green",
                                    borderRadius: "20%",
                                    color: "white",
                                  }}
                                  onClick={addStageRow}
                                >
                                  <AddOutlinedIcon />
                                </IconButton>
                              </Box>
                              <Box sx={{ height: 400, overflow: "auto" }}>
                                <DataGrid
                                  rows={approvalStages}
                                  columns={stageColumns}
                                  pageSize={5}
                                  rowsPerPageOptions={[5]}
                                  disableSelectionOnClick
                                  hideFooter
                                  autoHeight={false}
                                  getRowId={(row) => row.id || row.LineNum}
                                  className="datagrid-style"
                                  sx={{
                                    minHeight: 200,
                                    "& .MuiDataGrid-columnHeaders": {
                                      backgroundColor:
                                        theme.palette.mode === "light"
                                          ? "#e0e0e0"
                                          : grey[700],
                                    },

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
                                />
                              </Box>
                            </Box>
                          </TabPanel>

                          {/* Terms Tab Content */}
                          <TabPanel value="2" sx={{ p: 0, pt: 2 }}>
                            <Box sx={{ mb: 3 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: "gray" }}
                              >
                                Launch Approval Procedure
                              </Typography>
                              <Controller
                                name="Conds"
                                control={control}
                                render={({ field }) => (
                                  <FormControl component="fieldset">
                                    <RadioGroup {...field} row>
                                      <FormControlLabel
                                        value="always"
                                        sx={{ color: "gray" }}
                                        control={<Radio />}
                                        label="Always"
                                      />
                                      <FormControlLabel
                                        value="conditional"
                                        sx={{ color: "gray" }}
                                        control={<Radio />}
                                        label="When the following Applies"
                                      />
                                    </RadioGroup>
                                  </FormControl>
                                )}
                              />
                            </Box>

                            {templateTermsWatch === "conditional" && (
                              <>
                                <Box sx={{ mt: 1 }}>
                                  <DataGrid
                                    rows={conditionsGridDataWatch || []}
                                    columns={conditionsGridColumns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    disableSelectionOnClick
                                    autoHeight
                                    hideFooter
                                    getRowId={(row) => row.id || row.LineNum}
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
                                  />

                                  <Box sx={{ mt: 3 }}>
                                    <Typography
                                      variant="h6"
                                      gutterBottom
                                      sx={{ color: "gray" }}
                                    >
                                      Term based on User Queries
                                    </Typography>
                                    <Box sx={{ pb: 1 }}>
                                      <IconButton
                                        size="small"
                                        onClick={handleAddQueryRow}
                                        sx={{
                                          backgroundColor: "green",
                                          borderRadius: "20%",
                                          color: "white",
                                        }}
                                      >
                                        <AddOutlinedIcon />
                                      </IconButton>
                                    </Box>

                                    <Box sx={{ height: 200, width: "100%" }}>
                                      <DataGrid
                                        rows={QueriesRows}
                                        columns={QueriesColumns}
                                        disableSelectionOnClick
                                        hideFooter
                                        getRowId={(row) =>
                                          row.id || row.LineNum
                                        }
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
                                      />
                                    </Box>
                                  </Box>

                                  {templateTermsWatch === "conditional" && (
                                    <Box sx={{ mt: 3 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{ color: "gray", mb: 1 }}
                                      >
                                        Total Selected Terms:{" "}
                                        {selectedTerms.length}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </>
                            )}
                          </TabPanel>
                        </Box>
                      </TabContext>
                    </AppBar>
                  </Box>
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
                paddingBottom: "10px",
                backgroundColor: theme.palette.background.paper,
                zIndex: 2,
              }}
            >
              <Button
                variant="contained"
                type="submit"
                name={SaveUpdateName}
                color="success"
                sx={{ color: "white" }}
                onClick={handleSubmit(handleSaveTemplate)}
              >
                {SaveUpdateName}
              </Button>

              <Button
                variant="contained"
                color="error"
                disabled={SaveUpdateName === "SAVE"}
                onClick={handleDeleteTemplate}
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
